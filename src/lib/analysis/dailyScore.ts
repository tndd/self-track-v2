export interface ConditionLog {
  timestamp: Date;
  condition: number;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function evaluateConditionAt(t: number, logs: ConditionLog[]): number {
  let latestLog: ConditionLog | null = null;
  // Logs are assumed to be sorted ascending
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].timestamp.getTime() <= t) {
      latestLog = logs[i];
      break;
    }
  }

  if (!latestLog) {
    return 3; // default neutral condition
  }

  const timeSinceLog = t - latestLog.timestamp.getTime();
  if (timeSinceLog >= TWENTY_FOUR_HOURS_MS) {
    return 3; // 24h auto-reset to 3
  }

  return latestLog.condition;
}

export function calculateDailyScore(dateString: string, allLogs: ConditionLog[]): number {
  // Use JST for boundary calculation to align with requirement
  const startOfDay = new Date(`${dateString}T00:00:00+09:00`);
  const endOfDay = new Date(`${dateString}T23:59:59.999+09:00`);

  const tStart = startOfDay.getTime();
  const tEnd = endOfDay.getTime();

  const criticalPoints = new Set<number>();
  criticalPoints.add(tStart);
  criticalPoints.add(tEnd);

  for (const log of allLogs) {
    const tLog = log.timestamp.getTime();
    if (tLog >= tStart && tLog <= tEnd) {
      criticalPoints.add(tLog);
    }
    const tReset = tLog + TWENTY_FOUR_HOURS_MS;
    if (tReset >= tStart && tReset <= tEnd) {
      criticalPoints.add(tReset);
    }
  }

  const sortedPoints = Array.from(criticalPoints).sort((a, b) => a - b);

  let integral = 0;
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const t0 = sortedPoints[i];
    const t1 = sortedPoints[i + 1];
    if (t1 === t0) continue;

    const condition = evaluateConditionAt(t0, allLogs);
    integral += condition * (t1 - t0);
  }

  return integral / (tEnd - tStart);
}

export function calculateDailyScores(dateStrings: string[], allLogs: ConditionLog[]): Record<string, number> {
  const sortedLogs = [...allLogs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const scores: Record<string, number> = {};
  for (const dateStr of dateStrings) {
    scores[dateStr] = calculateDailyScore(dateStr, sortedLogs);
  }
  return scores;
}
