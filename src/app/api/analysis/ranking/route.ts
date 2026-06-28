import { NextResponse } from "next/server";
import { loadAnalysisData } from "@/lib/analysis/dataLoader";
import { calculateCorrelations } from "@/lib/analysis/correlation";

export async function GET() {
  try {
    const { dailyScores, actionLogs, actionMap } = await loadAnalysisData();
    const rankings = calculateCorrelations(dailyScores, actionLogs);

    const enrichedRankings = rankings.map((r) => ({
      ...r,
      actionName: actionMap.get(r.actionId) || "Unknown",
    }));

    return NextResponse.json({ rankings: enrichedRankings });
  } catch (error) {
    console.error("Analysis Ranking Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate ranking" },
      { status: 500 }
    );
  }
}
