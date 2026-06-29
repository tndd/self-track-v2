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
  const dates = Object.keys(dailyScores).sort();
  if (dates.length === 0) return [];

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
      // Find the score on this date (day T)
      const score = dailyScores[date];
      
      // Find the action intensity on the previous day (day T - lagDays)
      const prevDate = addDays(date, -lagDays);
      const intensity = actionIntensities[actionId][prevDate] || 0;
      
      x.push(intensity);
      y.push(score);
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
      sampleSize: dates.length,
    });
  }

  return results.sort((a, b) => b.correlation - a.correlation);
}
