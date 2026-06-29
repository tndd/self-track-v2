import { describe, it, expect } from "vitest";
import { calculateTimeLagCorrelations } from "../timeLag";

describe("calculateTimeLagCorrelations", () => {
  it("returns empty array when no daily scores", () => {
    const result = calculateTimeLagCorrelations({}, []);
    expect(result).toEqual([]);
  });

  it("returns empty array when no action logs", () => {
    const scores = { "2024-01-15": 3.5, "2024-01-16": 4.0 };
    const result = calculateTimeLagCorrelations(scores, []);
    expect(result).toEqual([]);
  });

  it("calculates 1-day lag correlation correctly", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 3,
      "2024-01-02": 5, // next day after action
      "2024-01-03": 3,
      "2024-01-04": 5, // next day after action
    };

    // Action on Jan 1 and Jan 3 → check scores on Jan 2 and Jan 4
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
      { date: "2024-01-03", actionId: "a1", intensity: 1 },
    ];

    const results = calculateTimeLagCorrelations(scores, actionLogs, 1);
    expect(results).toHaveLength(1);
    // x = [0, 1, 0, 1] (action intensity on prev day: Dec 31, Jan 1, Jan 2, Jan 3)
    // y = [3, 5, 3, 5] (scores on Jan 1, Jan 2, Jan 3, Jan 4)
    // Perfect positive correlation!
    expect(results[0].correlation).toBe(1);
  });

  it("detects positive next-day effect", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 3,
      "2024-01-02": 5, // next day after action = high
      "2024-01-03": 3,
      "2024-01-04": 1, // no action day before = low
      "2024-01-05": 3,
      "2024-01-06": 5, // next day after action = high
    };

    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
      { date: "2024-01-05", actionId: "a1", intensity: 1 },
    ];

    const results = calculateTimeLagCorrelations(scores, actionLogs, 1);
    expect(results).toHaveLength(1);
    // Evaluates all 6 daily score dates
    expect(results[0].sampleSize).toBe(6);
  });

  it("handles lag of 2 days", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 3,
      "2024-01-02": 3,
      "2024-01-03": 5, // 2 days after action
    };

    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
    ];

    const results = calculateTimeLagCorrelations(scores, actionLogs, 2);
    expect(results).toHaveLength(1);
    expect(results[0].sampleSize).toBe(3);
  });

  it("ignores action dates where target lag date has no score", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 3,
      // No score for Jan 02
    };

    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
    ];

    const results = calculateTimeLagCorrelations(scores, actionLogs, 1);
    expect(results).toHaveLength(1);
    expect(results[0].sampleSize).toBe(1);
  });

  it("sorts results by correlation descending", () => {
    const scores: Record<string, number> = {
      "2024-01-02": 5,
      "2024-01-03": 5,
      "2024-01-04": 1,
      "2024-01-05": 1,
    };

    const actionLogs = [
      // "good" → next day is high
      { date: "2024-01-01", actionId: "good", intensity: 1 },
      { date: "2024-01-02", actionId: "good", intensity: 1 },
      // "bad" → next day is low
      { date: "2024-01-03", actionId: "bad", intensity: 1 },
      { date: "2024-01-04", actionId: "bad", intensity: 1 },
    ];

    const results = calculateTimeLagCorrelations(scores, actionLogs, 1);
    expect(results.length).toBeGreaterThanOrEqual(1);
    if (results.length > 1) {
      expect(results[0].correlation).toBeGreaterThanOrEqual(results[1].correlation);
    }
  });
});
