import { describe, it, expect } from "vitest";
import { calculateCorrelations } from "../correlation";
import { calculateBestCombinations } from "../combination";
import { calculateTimeLagCorrelations } from "../timeLag";

// Generate 30 days of realistic dummy data matching the seed pattern
function generateDummyData() {
  const dailyScores: Record<string, number> = {};
  const actionLogs: { date: string; actionId: string; intensity: number }[] = [];

  const now = new Date("2024-03-01T00:00:00Z");

  for (let i = 30; i >= 0; i--) {
    const currentDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Convert to simple date string
    const dateStr = currentDate.toISOString().split("T")[0];

    // Baseline condition
    let condition = 3;

    // Rule 1: Vitamin D everyday
    actionLogs.push({ date: dateStr, actionId: "vitamin-d", intensity: 1 });

    // Rule 2: Running & Workout on day i % 3 === 0 (High condition)
    if (i % 3 === 0) {
      condition = 5;
      actionLogs.push({ date: dateStr, actionId: "running", intensity: 2 });
      actionLogs.push({ date: dateStr, actionId: "workout", intensity: 1 });
    }
    // Rule 3: Alcohol on day i % 4 === 0 (Low condition same day/next day)
    else if (i % 4 === 0) {
      condition = 2;
      actionLogs.push({ date: dateStr, actionId: "alcohol", intensity: 3 });
    }
    // Rule 4: Loxonin on day i % 5 === 0 (Very low condition)
    else if (i % 5 === 0) {
      condition = 1;
      actionLogs.push({ date: dateStr, actionId: "loxonin", intensity: 1 });
    }

    dailyScores[dateStr] = condition;
  }

  return { dailyScores, actionLogs };
}

describe("Analysis Integration Test - Practical Dummy Data Scenario", () => {
  const { dailyScores, actionLogs } = generateDummyData();

  it("identifies Running and Workout as highly positively correlated with good condition", () => {
    const correlations = calculateCorrelations(dailyScores, actionLogs);

    const running = correlations.find((c) => c.actionId === "running");
    const workout = correlations.find((c) => c.actionId === "workout");

    expect(running).toBeDefined();
    expect(workout).toBeDefined();

    // Running and Workout are only performed on condition 5 days, so correlation should be strong positive
    expect(running!.correlation).toBeGreaterThan(0.5);
    expect(workout!.correlation).toBeGreaterThan(0.5);
  });

  it("identifies Alcohol and Loxonin as negatively correlated with good condition", () => {
    const correlations = calculateCorrelations(dailyScores, actionLogs);

    const alcohol = correlations.find((c) => c.actionId === "alcohol");
    const loxonin = correlations.find((c) => c.actionId === "loxonin");

    expect(alcohol).toBeDefined();
    expect(loxonin).toBeDefined();

    // Alcohol and Loxonin are only associated with condition 2 and 1 days, so correlation should be negative
    expect(alcohol!.correlation).toBeLessThan(-0.3);
    expect(loxonin!.correlation).toBeLessThan(-0.3);
  });

  it("shows Vitamin D has zero or neutral correlation because it is taken everyday", () => {
    const correlations = calculateCorrelations(dailyScores, actionLogs);
    const vitaminD = correlations.find((c) => c.actionId === "vitamin-d");

    expect(vitaminD).toBeDefined();
    // Vitamin D is a constant (intensity=1 every day), so correlation should be 0 (no variance in x)
    expect(vitaminD!.correlation).toBe(0);
  });

  it("determines the combination of Running + Workout yields the highest average score", () => {
    const combinations = calculateBestCombinations(dailyScores, actionLogs, 2);

    expect(combinations.length).toBeGreaterThan(0);
    
    // Find the combination containing running and workout
    const runningWorkoutCombo = combinations.find(
      (c) => c.actionIds.includes("running") && c.actionIds.includes("workout")
    );

    expect(runningWorkoutCombo).toBeDefined();
    // Running and Workout are only done together when condition is 5
    expect(runningWorkoutCombo!.averageScore).toBe(5.0);
  });

  it("calculates correct time-lag (next-day) effects for Alcohol", () => {
    // Check lag of 1 day
    const timeLags = calculateTimeLagCorrelations(dailyScores, actionLogs, 1);
    const alcoholLag = timeLags.find((c) => c.actionId === "alcohol");

    expect(alcoholLag).toBeDefined();
    // Verify sample size reflects days shifted by 1 day
    expect(alcoholLag!.sampleSize).toBeGreaterThan(0);
  });
});
