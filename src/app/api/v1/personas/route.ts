import { NextRequest, NextResponse } from "next/server";
import { withPersonaConnection } from "@/lib/persona-data";
import { getCachedQuery, setCachedQuery } from "@/lib/query-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildFilters(searchParams: URLSearchParams) {
  const conditions = ["1 = 1"];
  const values: (string | number)[] = [];
  const segment = searchParams.get("segment");
  const zone = searchParams.get("zone");
  const sex = searchParams.get("sex");
  const region = searchParams.get("region");
  const age = searchParams.get("age");
  const query = searchParams.get("q")?.trim().slice(0, 120);

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

  if (query) {
    conditions.push(`(
      contains(lower(coalesce(persona, '')), lower(?))
      OR contains(lower(coalesce(occupation, '')), lower(?))
      OR contains(lower(coalesce(cultural_background, '')), lower(?))
      OR contains(lower(coalesce(skills_and_expertise, '')), lower(?))
      OR contains(lower(coalesce(hobbies_and_interests, '')), lower(?))
    )`);
    values.push(query, query, query, query, query);
  }

  return { where: conditions.join(" AND "), values };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const page = Math.max(1, Math.min(100_000, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
    const pageSize = Math.min(48, Math.max(1, Number.parseInt(searchParams.get("pageSize") || "12", 10) || 12));
    const segment = searchParams.get("segment");
    const zone = searchParams.get("zone");
    const sex = searchParams.get("sex");
    const age = searchParams.get("age");
    const validSegments = ["all", "urban", "rural", "male", "female"];
    const validAgeGroups = ["<18", "18-24", "25-34", "35-49", "50+"];

    if (segment && !validSegments.includes(segment)) {
      return NextResponse.json({ error: "Giá trị segment không hợp lệ." }, { status: 400 });
    }
    if (zone && zone !== "urban" && zone !== "rural") {
      return NextResponse.json({ error: "Giá trị zone không hợp lệ." }, { status: 400 });
    }
    if (sex && sex !== "male" && sex !== "female") {
      return NextResponse.json({ error: "Giá trị sex không hợp lệ." }, { status: 400 });
    }
    if (age && !validAgeGroups.includes(age)) {
      return NextResponse.json({ error: "Nhóm tuổi không hợp lệ." }, { status: 400 });
    }

    const { where, values } = buildFilters(searchParams);
    const cacheKey = `personas:${JSON.stringify({
      where,
      values,
      page,
      pageSize,
    })}`;
    const cachedResult = getCachedQuery<{
      personas: Record<string, unknown>[];
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    }>(cacheKey);

    if (cachedResult) {
      return NextResponse.json(cachedResult, {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Query-Cache": "HIT",
        },
      });
    }

    const result = await withPersonaConnection(async (connection, parquetSource) => {
      const countReader = await connection.runAndReadAll(
        `SELECT count(*) AS total FROM ${parquetSource} WHERE ${where}`,
        values
      );
      const countRows = await countReader.getRowObjectsJS();
      const total = Number(countRows[0]?.total ?? 0);

      const recordsReader = await connection.runAndReadAll(
        `SELECT
          uuid AS id,
          persona AS summary,
          professional_persona,
          sports_persona,
          arts_persona,
          travel_persona,
          culinary_persona,
          sex,
          age,
          marital_status,
          education_level,
          occupation,
          zone,
          region,
          cultural_background,
          skills_and_expertise,
          skills_and_expertise_list,
          hobbies_and_interests,
          hobbies_and_interests_list,
          country,
          career_goals_and_ambitions
        FROM ${parquetSource}
        WHERE ${where}
        LIMIT ? OFFSET ?`,
        [...values, pageSize, (page - 1) * pageSize]
      );

      const records = await recordsReader.getRowObjectsJS();
      return {
        personas: records.map((record) => ({
          ...record,
          id: String(record.id ?? ""),
          age: Number(record.age ?? 0),
        })),
        total,
      };
    });

    const responsePayload = {
      personas: result.personas,
      total: result.total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(result.total / pageSize),
    };
    setCachedQuery(cacheKey, responsePayload);

    return NextResponse.json(responsePayload, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Query-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("[API Error] /api/v1/personas:", error);
    return NextResponse.json(
      {
        error: "Không thể truy vấn dữ liệu persona.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
