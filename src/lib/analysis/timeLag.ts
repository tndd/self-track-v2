import { sampleCorrelation } from 'simple-statistics';
import { ActionLog, CorrelationResult } from './correlation';

// Add N days to date string
function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

export function calculateTimeLagCorrelations(
  dailyScores: Record<string, number>,
  actionLogs: ActionLog[],
  lagDays: number = 1
): CorrelationResult[] {
  const datesWithScores = new Set(Object.keys(dailyScores));
  if (datesWithScores.size === 0) return [];

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

    // For time lag, x is action on day T, y is score on day T + lagDays
    for (const [actionDate, intensity] of Object.entries(actionIntensities[actionId])) {
      const targetDate = addDays(actionDate, lagDays);
      if (datesWithScores.has(targetDate)) {
        x.push(intensity);
        y.push(dailyScores[targetDate]);
      }
    }

    const xVariance = new Set(x).size > 1;
    const yVariance = new Set(y).size > 1;

    let corr = 0;
    if (xVariance && yVariance) {
      corr = sampleCorrelation(x, y);
    }

    results.push({
      actionId,
      correlation: isNaN(corr) ? 0 : corr,
      sampleSize: x.length,
    });
  }

  return results.sort((a, b) => b.correlation - a.correlation);
}
