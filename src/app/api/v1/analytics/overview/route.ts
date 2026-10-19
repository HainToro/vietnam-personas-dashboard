import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { AnalyticsOverviewPayload } from "@/types/analytics";

export const dynamic = "force-dynamic";

// In-Memory cache storage
let memoryCache: AnalyticsOverviewPayload | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

async function getAnalyticsData(): Promise<{ data: AnalyticsOverviewPayload; isHit: boolean }> {
  const now = Date.now();
  if (memoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return { data: memoryCache, isHit: true };
  }

  const filePath = path.join(process.cwd(), "public", "data", "analytics_overview.json");
  const rawContent = await fs.readFile(filePath, "utf-8");
  const parsedData = JSON.parse(rawContent) as AnalyticsOverviewPayload;

  memoryCache = parsedData;
  lastCacheTime = now;

  return { data: parsedData, isHit: false };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const segmentParam = (
      searchParams.get("segment") ||
      searchParams.get("zone") ||
      searchParams.get("sex") ||
      ""
    ).toLowerCase();

    const { data, isHit } = await getAnalyticsData();

    // Nếu người dùng yêu cầu 1 phân đoạn cụ thể (urban, rural, male, female)
    if (segmentParam && data.segments) {
      const validSegments = ["urban", "rural", "male", "female"] as const;
      const matchedKey = validSegments.find((k) => k === segmentParam);

      if (matchedKey && data.segments[matchedKey]) {
        const segData = data.segments[matchedKey]!;
        const duration = Date.now() - startTime;

        return NextResponse.json(
          {
            dataset_name: data.dataset_name,
            segment: matchedKey,
            total_personas: segData.total_personas,
            metrics: segData.metrics,
            charts: segData.charts,
          },
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
              "X-Cache-Status": isHit ? "HIT" : "MISS",
              "X-Response-Time-Ms": duration.toString(),
            },
          }
        );
      }
    }

    // Mặc định trả về toàn bộ dataset cùng các segments
    const duration = Date.now() - startTime;

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        "X-Cache-Status": isHit ? "HIT" : "MISS",
        "X-Response-Time-Ms": duration.toString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[API Error] /api/v1/analytics/overview:", error);

    return NextResponse.json(
      {
        error: "Không thể tải dữ liệu thống kê tổng quan.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "X-Response-Time-Ms": duration.toString(),
        },
      }
    );
  }
}
