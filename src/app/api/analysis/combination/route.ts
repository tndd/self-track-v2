import { NextResponse } from "next/server";
import { loadAnalysisData } from "@/lib/analysis/dataLoader";
import { calculateBestCombinations } from "@/lib/analysis/combination";

export async function GET() {
  try {
    const { dailyScores, actionLogs, actionMap } = await loadAnalysisData();
    const combinations = calculateBestCombinations(dailyScores, actionLogs);

    const enrichedCombinations = combinations.map((c) => ({
      ...c,
      actionNames: c.actionIds.map((id) => actionMap.get(id) || "Unknown"),
    }));

    return NextResponse.json({ combinations: enrichedCombinations });
  } catch (error) {
    console.error("Analysis Combination Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate combinations" },
      { status: 500 }
    );
  }
}
