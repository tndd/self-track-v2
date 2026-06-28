import { NextResponse } from "next/server";
import { loadAnalysisData } from "@/lib/analysis/dataLoader";
import { calculateTimeLagCorrelations } from "@/lib/analysis/timeLag";

export async function GET() {
  try {
    const { dailyScores, actionLogs, actionMap } = await loadAnalysisData();
    // 1 day lag
    const rankings = calculateTimeLagCorrelations(dailyScores, actionLogs, 1);

    const enrichedRankings = rankings.map((r) => ({
      ...r,
      actionName: actionMap.get(r.actionId) || "Unknown",
    }));

    return NextResponse.json({ rankings: enrichedRankings });
  } catch (error) {
    console.error("Analysis TimeLag Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate timelag correlations" },
      { status: 500 }
    );
  }
}
