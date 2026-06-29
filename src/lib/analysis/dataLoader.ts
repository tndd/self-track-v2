import { db } from "@/db";
import { entries, actions } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import { ConditionLog, calculateDailyScores } from "./dailyScore";
import { ActionLog } from "./correlation";

/**
 * Converts a UTC timestamp to a JST date string (YYYY-MM-DD).
 */
function toJSTDateString(timestamp: Date): string {
  return new Date(timestamp.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

/**
 * Common analysis data bundle used by all analysis endpoints.
 */
export interface AnalysisData {
  conditionLogs: ConditionLog[];
  actionLogs: ActionLog[];
  dailyScores: Record<string, number>;
  actionMap: Map<string, string>;
}

/**
 * Loads all data needed for analysis calculations.
 * Extracted from individual API routes to avoid code duplication.
 */
export async function loadAnalysisData(): Promise<AnalysisData> {
  // 1. Fetch condition logs
  const allEntries = await db
    .select()
    .from(entries)
    .where(isNotNull(entries.condition));

  const conditionLogs: ConditionLog[] = allEntries.map((e) => ({
    timestamp: e.timestamp,
    condition: e.condition!,
  }));

  // 2. Fetch action logs with related entry timestamps
  const allEntryActions = await db.query.entryActions.findMany({
    with: {
      entry: true,
    },
  });

  const actionLogs: ActionLog[] = allEntryActions.map((ea) => ({
    date: toJSTDateString(ea.entry.timestamp),
    actionId: ea.actionId,
    intensity: ea.intensity,
  }));

  // 3. Determine all unique dates
  const uniqueDates = new Set<string>();

  for (const log of conditionLogs) {
    uniqueDates.add(toJSTDateString(log.timestamp));
  }

  for (const log of actionLogs) {
    uniqueDates.add(log.date);
  }

  const datesArray = Array.from(uniqueDates).sort();

  // 4. Calculate daily scores
  const dailyScores = calculateDailyScores(datesArray, conditionLogs);

  // 5. Build action name map
  const allActions = await db.select().from(actions);
  const actionMap = new Map(allActions.map((a) => [a.id, a.name]));

  return { conditionLogs, actionLogs, dailyScores, actionMap };
}
