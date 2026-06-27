import { sampleCorrelation } from 'simple-statistics';

export interface ActionLog {
  date: string; // 'YYYY-MM-DD'
  actionId: string;
  intensity: number;
}

export interface CorrelationResult {
  actionId: string;
  correlation: number;
  sampleSize: number;
}

export function calculateCorrelations(
  dailyScores: Record<string, number>,
  actionLogs: ActionLog[]
): CorrelationResult[] {
  const dates = Object.keys(dailyScores);
  if (dates.length === 0) return [];

  // Group actions by actionId and date
  const actionIntensities: Record<string, Record<string, number>> = {};
  
  for (const log of actionLogs) {
    if (!actionIntensities[log.actionId]) {
      actionIntensities[log.actionId] = {};
    }
    actionIntensities[log.actionId][log.date] = 
      (actionIntensities[log.actionId][log.date] || 0) + log.intensity;
  }

  const results: CorrelationResult[] = [];

  for (const actionId of Object.keys(actionIntensities)) {
    const x: number[] = [];
    const y: number[] = [];

    for (const date of dates) {
      const score = dailyScores[date];
      const intensity = actionIntensities[actionId][date] || 0;
      x.push(intensity);
      y.push(score);
    }

    // sampleCorrelation requires variance in both arrays to avoid division by zero (NaN).
    const xVariance = new Set(x).size > 1;
    const yVariance = new Set(y).size > 1;

    let corr = 0;
    if (xVariance && yVariance) {
      corr = sampleCorrelation(x, y);
    }

    results.push({
      actionId,
      correlation: isNaN(corr) ? 0 : corr,
      sampleSize: dates.length,
    });
  }

  // Sort by correlation descending
  return results.sort((a, b) => b.correlation - a.correlation);
}
