import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { loadAnalysisData } from "@/lib/analysis/dataLoader";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get("year") || "", 10);
    const month = parseInt(searchParams.get("month") || "", 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Valid 'year' and 'month' (1-12) query parameters are required" },
        { status: 400 }
      );
    }

    const { dailyScores } = await loadAnalysisData();

    // Filter scores to only include the requested month
    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
    const filteredScores: Record<string, number> = {};

    for (const [date, score] of Object.entries(dailyScores)) {
      if (date.startsWith(monthPrefix)) {
        filteredScores[date] = score;
      }
    }

    return NextResponse.json({ scores: filteredScores });
  } catch (error) {
    console.error("Analysis Daily Scores Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate daily scores" },
      { status: 500 }
    );
  }
}
