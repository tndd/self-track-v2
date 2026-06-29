import { describe, it, expect } from "vitest";
import { calculateCorrelations, CorrelationResult } from "../correlation";

describe("calculateCorrelations", () => {
  it("returns empty array when no daily scores", () => {
    const result = calculateCorrelations({}, []);
    expect(result).toEqual([]);
  });

  it("returns empty array when no action logs", () => {
    const scores = { "2024-01-15": 3.5, "2024-01-16": 4.0 };
    const result = calculateCorrelations(scores, []);
    expect(result).toEqual([]);
  });

  it("calculates positive correlation for action associated with high scores", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5,
      "2024-01-02": 1,
      "2024-01-03": 5,
      "2024-01-04": 1,
      "2024-01-05": 5,
      "2024-01-06": 1,
    };

    // Action "a1" occurs on high-score days
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
      { date: "2024-01-03", actionId: "a1", intensity: 1 },
      { date: "2024-01-05", actionId: "a1", intensity: 1 },
    ];

    const results = calculateCorrelations(scores, actionLogs);
    expect(results).toHaveLength(1);
    expect(results[0].correlation).toBeGreaterThan(0);
    expect(results[0].actionId).toBe("a1");
    expect(results[0].sampleSize).toBe(6);
  });

  it("calculates negative correlation for action associated with low scores", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 1,
      "2024-01-02": 5,
      "2024-01-03": 1,
      "2024-01-04": 5,
    };

    // Action "a1" occurs on low-score days
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
      { date: "2024-01-03", actionId: "a1", intensity: 1 },
    ];

    const results = calculateCorrelations(scores, actionLogs);
    expect(results).toHaveLength(1);
    expect(results[0].correlation).toBeLessThan(0);
  });

  it("handles zero variance gracefully (all same scores)", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 3,
      "2024-01-02": 3,
      "2024-01-03": 3,
    };

    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
    ];

    const results = calculateCorrelations(scores, actionLogs);
    expect(results).toHaveLength(1);
    // Should be 0 due to zero variance in y
    expect(results[0].correlation).toBe(0);
  });

  it("handles action with zero variance (appears every day)", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5,
      "2024-01-02": 1,
      "2024-01-03": 3,
    };

    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 1 },
      { date: "2024-01-02", actionId: "a1", intensity: 1 },
      { date: "2024-01-03", actionId: "a1", intensity: 1 },
    ];

    const results = calculateCorrelations(scores, actionLogs);
    expect(results).toHaveLength(1);
    // Zero variance in x → correlation should be 0
    expect(results[0].correlation).toBe(0);
  });

  it("sorts results by correlation descending", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5,
      "2024-01-02": 1,
      "2024-01-03": 5,
      "2024-01-04": 1,
    };

    const actionLogs = [
      // "good" correlates with high scores
      { date: "2024-01-01", actionId: "good", intensity: 1 },
      { date: "2024-01-03", actionId: "good", intensity: 1 },
      // "bad" correlates with low scores
      { date: "2024-01-02", actionId: "bad", intensity: 1 },
      { date: "2024-01-04", actionId: "bad", intensity: 1 },
    ];

    const results = calculateCorrelations(scores, actionLogs);
    expect(results).toHaveLength(2);
    expect(results[0].actionId).toBe("good");
    expect(results[1].actionId).toBe("bad");
    expect(results[0].correlation).toBeGreaterThan(results[1].correlation);
  });

  it("accumulates intensity for same action on same day", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5,
      "2024-01-02": 1,
    };

    // Two logs for same action on same day
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1", intensity: 2 },
      { date: "2024-01-01", actionId: "a1", intensity: 3 },
    ];

    const results = calculateCorrelations(scores, actionLogs);
    expect(results).toHaveLength(1);
    // On 2024-01-01, total intensity = 5; on 2024-01-02, intensity = 0
    // Both arrays have variance, so correlation should be positive
    expect(results[0].correlation).toBeGreaterThan(0);
  });
});
