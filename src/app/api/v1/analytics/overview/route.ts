import { NextRequest, NextResponse } from "next/server";
import { AnalyticsOverviewPayload, ChartCollection } from "@/types/analytics";
import { withPersonaConnection } from "@/lib/persona-data";
import { getCachedQuery, setCachedQuery } from "@/lib/query-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGE_GROUPS = ["<18", "18-24", "25-34", "35-49", "50+"] as const;
const SEGMENTS = ["all", "urban", "rural", "male", "female"] as const;

function buildFilters(searchParams: URLSearchParams) {
  const conditions = ["1 = 1"];
  const values: string[] = [];
  const segment = (searchParams.get("segment") || "").toLowerCase();
  const zone = (searchParams.get("zone") || "").toLowerCase();
  const sex = (searchParams.get("sex") || "").toLowerCase();
  const region = searchParams.get("region");
  const age = searchParams.get("age");

  if (zone === "urban" || zone === "rural") {
    conditions.push("lower(trim(zone)) = ?");
    values.push(zone === "urban" ? "đô thị" : "nông thôn");
  } else if (segment === "urban" || segment === "rural") {
    conditions.push("lower(trim(zone)) = ?");
    values.push(segment === "urban" ? "đô thị" : "nông thôn");
  }

  if (sex === "male" || sex === "female") {
    conditions.push("lower(trim(sex)) = ?");
    values.push(sex === "male" ? "nam" : "nữ");
  } else if (segment === "male" || segment === "female") {
    conditions.push("lower(trim(sex)) = ?");
    values.push(segment === "male" ? "nam" : "nữ");
  }

  if (region) {
    conditions.push("region = ?");
    values.push(region);
  }

  if (age) {
    conditions.push(`CASE
      WHEN age IS NULL THEN 'Không xác định'
      WHEN age < 18 THEN '<18'
      WHEN age BETWEEN 18 AND 24 THEN '18-24'
      WHEN age BETWEEN 25 AND 34 THEN '25-34'
      WHEN age BETWEEN 35 AND 49 THEN '35-49'
      ELSE '50+'
    END = ?`);
    values.push(age);
  }

  return { where: conditions.join(" AND "), values };
}

function percentage(count: number, total: number): number {
  return total ? Math.round((count / total) * 10000) / 100 : 0;
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const segment = (searchParams.get("segment") || "").toLowerCase();
  const zone = (searchParams.get("zone") || "").toLowerCase();
  const sex = (searchParams.get("sex") || "").toLowerCase();
  const age = searchParams.get("age");

  if (segment && !SEGMENTS.includes(segment as (typeof SEGMENTS)[number])) {
    return NextResponse.json({ error: "Giá trị segment không hợp lệ." }, { status: 400 });
  }
  if (zone && zone !== "urban" && zone !== "rural") {
    return NextResponse.json({ error: "Giá trị zone không hợp lệ." }, { status: 400 });
  }
  if (sex && sex !== "male" && sex !== "female") {
    return NextResponse.json({ error: "Giá trị sex không hợp lệ." }, { status: 400 });
  }
  if (age && !(AGE_GROUPS as readonly string[]).includes(age)) {
    return NextResponse.json({ error: "Nhóm tuổi không hợp lệ." }, { status: 400 });
  }

  try {
    const cacheKey = `overview:${JSON.stringify({
      sex: sex || (segment === "male" || segment === "female" ? segment : ""),
      zone: zone || (segment === "urban" || segment === "rural" ? segment : ""),
      region: searchParams.get("region") || "",
      age: age || "",
    })}`;
    const cachedPayload = getCachedQuery<AnalyticsOverviewPayload>(cacheKey);
    if (cachedPayload) {
      return NextResponse.json(cachedPayload, {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Query-Cache": "HIT",
          "X-Response-Time-Ms": String(Date.now() - startedAt),
        },
      });
    }

    const { where, values } = buildFilters(searchParams);
    const payload = await withPersonaConnection(async (connection, parquetSource) => {
      const metricsReader = await connection.runAndReadAll(
        `SELECT
          count(*) AS total_personas,
          coalesce(round(avg(age), 1), 0) AS avg_age,
          coalesce(round(median(age), 1), 0) AS median_age,
          count(*) FILTER (WHERE lower(trim(sex)) = 'nam') AS male_count,
          count(*) FILTER (WHERE lower(trim(sex)) = 'nữ') AS female_count,
          count(*) FILTER (WHERE lower(trim(zone)) = 'đô thị') AS urban_count,
          count(*) FILTER (WHERE lower(trim(zone)) = 'nông thôn') AS rural_count
        FROM ${parquetSource}
        WHERE ${where}`,
        values
      );
      const metricsRows = await metricsReader.getRowObjectsJS();
      const metricsRow = metricsRows[0];
      const total = Number(metricsRow?.total_personas ?? 0);
      const maleCount = Number(metricsRow?.male_count ?? 0);
      const femaleCount = Number(metricsRow?.female_count ?? 0);
      const urbanCount = Number(metricsRow?.urban_count ?? 0);
      const ruralCount = Number(metricsRow?.rural_count ?? 0);

      const chartsReader = await connection.runAndReadAll(
        `WITH filtered AS MATERIALIZED (
          SELECT age, marital_status, education_level, zone, region, occupation
          FROM ${parquetSource}
          WHERE ${where}
        ),
        distributions AS (
          SELECT 'age_distribution' AS category,
            CASE
              WHEN age IS NULL THEN 'Không xác định'
              WHEN age < 18 THEN '<18'
              WHEN age BETWEEN 18 AND 24 THEN '18-24'
              WHEN age BETWEEN 25 AND 34 THEN '25-34'
              WHEN age BETWEEN 35 AND 49 THEN '35-49'
              ELSE '50+'
            END AS name,
            count(*) AS count
          FROM filtered WHERE age IS NOT NULL GROUP BY 1, 2
          UNION ALL
          SELECT 'marital_status', coalesce(nullif(trim(marital_status), ''), 'Không xác định'), count(*)
          FROM filtered GROUP BY 1, 2
          UNION ALL
          SELECT 'education_level', coalesce(nullif(trim(education_level), ''), 'Không xác định'), count(*)
          FROM filtered GROUP BY 1, 2
          UNION ALL
          SELECT 'zone', coalesce(nullif(trim(zone), ''), 'Không xác định'), count(*)
          FROM filtered GROUP BY 1, 2
          UNION ALL
          SELECT 'region', coalesce(nullif(trim(region), ''), 'Không xác định'), count(*)
          FROM filtered GROUP BY 1, 2
          UNION ALL
          SELECT 'top_occupations', coalesce(nullif(trim(occupation), ''), 'Không xác định'), count(*)
          FROM filtered GROUP BY 1, 2
        )
        SELECT category, name, count
        FROM (
          SELECT category, name, count,
            row_number() OVER (PARTITION BY category ORDER BY count DESC, name) AS rank
          FROM distributions
        )
        WHERE category != 'top_occupations' OR rank <= 15
        ORDER BY category, rank`,
        values
      );

      const chartRows = await chartsReader.getRowObjectsJS();
      const chartCounts = new Map<string, { name: string; count: number }[]>();
      for (const row of chartRows) {
        const category = String(row.category);
        const rows = chartCounts.get(category) ?? [];
        rows.push({ name: String(row.name), count: Number(row.count) });
        chartCounts.set(category, rows);
      }

      const ageDistribution = AGE_GROUPS.map((range) => {
        const count = chartCounts.get("age_distribution")?.find((item) => item.name === range)?.count ?? 0;
        return { range, count, percentage: percentage(count, total) };
      });
      const toDistribution = (category: string) =>
        (chartCounts.get(category) ?? []).map(({ name, count }) => ({
          name,
          count,
          percentage: percentage(count, total),
        }));

      const result: AnalyticsOverviewPayload = {
        dataset_name: "nvidia/Nemotron-Personas-Vietnam",
        total_personas: total,
        metrics: {
          avg_age: Number(metricsRow?.avg_age ?? 0),
          median_age: Number(metricsRow?.median_age ?? 0),
          male_count: maleCount,
          female_count: femaleCount,
          male_percentage: percentage(maleCount, total),
          female_percentage: percentage(femaleCount, total),
          urban_count: urbanCount,
          rural_count: ruralCount,
          urban_percentage: percentage(urbanCount, total),
          rural_percentage: percentage(ruralCount, total),
        },
        charts: {
          age_distribution: ageDistribution,
          marital_status: toDistribution("marital_status"),
          education_level: toDistribution("education_level"),
          zone: toDistribution("zone"),
          region: toDistribution("region"),
          top_occupations: toDistribution("top_occupations"),
        } satisfies ChartCollection,
      };

      return result;
    });
    setCachedQuery(cacheKey, payload);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Query-Cache": "MISS",
        "X-Response-Time-Ms": String(Date.now() - startedAt),
      },
    });
  } catch (error) {
    console.error("[API Error] /api/v1/analytics/overview:", error);
    return NextResponse.json(
      {
        error: "Không thể tải dữ liệu thống kê tổng quan.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "X-Response-Time-Ms": String(Date.now() - startedAt),
        },
      }
    );
  }
}
