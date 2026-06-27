import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries, actions } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import { calculateDailyScores } from "@/lib/analysis/dailyScore";
import { calculateCorrelations } from "@/lib/analysis/correlation";

export async function GET() {
  try {
    // 1. Fetch condition logs
    const allEntries = await db
      .select()
      .from(entries)
      .where(isNotNull(entries.condition));

    const conditionLogs = allEntries.map((e) => ({
      timestamp: e.timestamp,
      condition: e.condition!,
    }));

    // 2. Fetch action logs with related entry timestamps
    const allEntryActions = await db.query.entryActions.findMany({
      with: {
        entry: true,
      },
    });

    const actionLogs = allEntryActions.map((ea) => {
      // Calculate local date string in JST timezone
      const dateStr = new Date(ea.entry.timestamp.getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      return {
        date: dateStr,
        actionId: ea.actionId,
        intensity: ea.intensity,
      };
    });

    // 3. Determine all unique dates
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

    // 4. Calculate daily scores
    const dailyScores = calculateDailyScores(datesArray, conditionLogs);

    // 5. Calculate correlations
    const rankings = calculateCorrelations(dailyScores, actionLogs);

    // 6. Enrich with action names
    const allActions = await db.select().from(actions);
    const actionMap = new Map(allActions.map((a) => [a.id, a.name]));

    const enrichedRankings = rankings.map((r) => ({
      ...r,
      actionName: actionMap.get(r.actionId) || "Unknown",
    }));

    return NextResponse.json({ rankings: enrichedRankings });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate ranking" },
      { status: 500 }
    );
  }
}
