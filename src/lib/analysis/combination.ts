export interface ActionLog {
  date: string;
  actionId: string;
}

export interface CombinationResult {
  actionIds: string[];
  averageScore: number;
  frequency: number;
}

export function calculateBestCombinations(
  dailyScores: Record<string, number>,
  actionLogs: ActionLog[],
  minFrequency: number = 2
): CombinationResult[] {
  const actionsByDate: Record<string, Set<string>> = {};

  for (const log of actionLogs) {
    if (!actionsByDate[log.date]) {
      actionsByDate[log.date] = new Set<string>();
    }
    actionsByDate[log.date].add(log.actionId);
  }

  // Find pairs
  const pairStats: Record<string, { sumScore: number; count: number }> = {};

  for (const [date, actionSet] of Object.entries(actionsByDate)) {
    const score = dailyScores[date];
    if (score === undefined) continue;

    const actions = Array.from(actionSet).sort();
    
    for (let i = 0; i < actions.length; i++) {
      for (let j = i + 1; j < actions.length; j++) {
        const pairKey = `${actions[i]}|${actions[j]}`;
        if (!pairStats[pairKey]) {
          pairStats[pairKey] = { sumScore: 0, count: 0 };
        }
        pairStats[pairKey].sumScore += score;
        pairStats[pairKey].count += 1;
      }
    }
  }

  const results: CombinationResult[] = [];
  for (const [pairKey, stats] of Object.entries(pairStats)) {
    if (stats.count >= minFrequency) {
      results.push({
        actionIds: pairKey.split('|'),
        averageScore: stats.sumScore / stats.count,
        frequency: stats.count,
      });
    }
  }

  // Sort by average score descending
  return results.sort((a, b) => b.averageScore - a.averageScore);
}
