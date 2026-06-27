import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries, actions } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import { calculateDailyScores } from "@/lib/analysis/dailyScore";
import { calculateBestCombinations } from "@/lib/analysis/combination";

export async function GET() {
  try {
    const allEntries = await db
      .select()
      .from(entries)
      .where(isNotNull(entries.condition));

    const conditionLogs = allEntries.map((e) => ({
      timestamp: e.timestamp,
      condition: e.condition!,
    }));

    const allEntryActions = await db.query.entryActions.findMany({
      with: {
        entry: true,
      },
    });

    const actionLogs = allEntryActions.map((ea) => {
      const dateStr = new Date(ea.entry.timestamp.getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      return {
        date: dateStr,
        actionId: ea.actionId,
        intensity: ea.intensity,
      };
    });

    const uniqueDates = new Set<string>();
    
    for (const log of conditionLogs) {
      const dateStr = new Date(log.timestamp.getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      uniqueDates.add(dateStr);
    }
    
    for (const log of actionLogs) {
      uniqueDates.add(log.date);
    }

    const datesArray = Array.from(uniqueDates).sort();
    const dailyScores = calculateDailyScores(datesArray, conditionLogs);
    const combinations = calculateBestCombinations(dailyScores, actionLogs);

    const allActions = await db.select().from(actions);
    const actionMap = new Map(allActions.map((a) => [a.id, a.name]));

    const enrichedCombinations = combinations.map((c) => ({
      ...c,
      actionNames: c.actionIds.map(id => actionMap.get(id) || "Unknown"),
    }));

    return NextResponse.json({ combinations: enrichedCombinations });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate combinations" },
      { status: 500 }
    );
  }
}
