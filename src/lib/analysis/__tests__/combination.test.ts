import { describe, it, expect } from "vitest";
import { calculateBestCombinations } from "../combination";

describe("calculateBestCombinations", () => {
  it("returns empty array when no action logs", () => {
    const scores = { "2024-01-01": 4.0, "2024-01-02": 3.0 };
    const result = calculateBestCombinations(scores, []);
    expect(result).toEqual([]);
  });

  it("returns empty array when only single actions per day (no pairs)", () => {
    const scores = { "2024-01-01": 4.0, "2024-01-02": 3.0 };
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1" },
      { date: "2024-01-02", actionId: "a2" },
    ];
    const result = calculateBestCombinations(scores, actionLogs);
    expect(result).toEqual([]);
  });

  it("finds a pair when two actions co-occur on multiple days", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5.0,
      "2024-01-02": 4.0,
      "2024-01-03": 3.0,
    };
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1" },
      { date: "2024-01-01", actionId: "a2" },
      { date: "2024-01-02", actionId: "a1" },
      { date: "2024-01-02", actionId: "a2" },
      { date: "2024-01-03", actionId: "a1" },
    ];
    const result = calculateBestCombinations(scores, actionLogs);
    expect(result).toHaveLength(1);
    expect(result[0].actionIds).toContain("a1");
    expect(result[0].actionIds).toContain("a2");
    expect(result[0].frequency).toBe(2);
    expect(result[0].averageScore).toBeCloseTo(4.5, 2); // (5+4)/2
  });

  it("respects minFrequency filter", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5.0,
      "2024-01-02": 4.0,
    };
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1" },
      { date: "2024-01-01", actionId: "a2" },
      // Only 1 co-occurrence
    ];
    // Default minFrequency is 2
    const result = calculateBestCombinations(scores, actionLogs);
    expect(result).toHaveLength(0);

    // With minFrequency = 1
    const resultMin1 = calculateBestCombinations(scores, actionLogs, 1);
    expect(resultMin1).toHaveLength(1);
  });

  it("sorts results by average score descending", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5.0,
      "2024-01-02": 5.0,
      "2024-01-03": 1.0,
      "2024-01-04": 1.0,
    };
    const actionLogs = [
      // Good pair: a1 + a2 on high-score days
      { date: "2024-01-01", actionId: "a1" },
      { date: "2024-01-01", actionId: "a2" },
      { date: "2024-01-02", actionId: "a1" },
      { date: "2024-01-02", actionId: "a2" },
      // Bad pair: a3 + a4 on low-score days
      { date: "2024-01-03", actionId: "a3" },
      { date: "2024-01-03", actionId: "a4" },
      { date: "2024-01-04", actionId: "a3" },
      { date: "2024-01-04", actionId: "a4" },
    ];
    const result = calculateBestCombinations(scores, actionLogs);
    expect(result).toHaveLength(2);
    expect(result[0].averageScore).toBeGreaterThan(result[1].averageScore);
  });

  it("handles triple co-occurrence (generates all pairs)", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 4.0,
      "2024-01-02": 4.0,
    };
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1" },
      { date: "2024-01-01", actionId: "a2" },
      { date: "2024-01-01", actionId: "a3" },
      { date: "2024-01-02", actionId: "a1" },
      { date: "2024-01-02", actionId: "a2" },
      { date: "2024-01-02", actionId: "a3" },
    ];
    const result = calculateBestCombinations(scores, actionLogs);
    // 3 choose 2 = 3 pairs
    expect(result).toHaveLength(3);
  });

  it("ignores days without scores", () => {
    const scores: Record<string, number> = {
      "2024-01-01": 5.0,
      // Jan 02 has no score
    };
    const actionLogs = [
      { date: "2024-01-01", actionId: "a1" },
      { date: "2024-01-01", actionId: "a2" },
      { date: "2024-01-02", actionId: "a1" },
      { date: "2024-01-02", actionId: "a2" },
    ];
    // Only 1 co-occurrence with a score (minFrequency = 1 to test)
    const result = calculateBestCombinations(scores, actionLogs, 1);
    expect(result).toHaveLength(1);
    expect(result[0].frequency).toBe(1);
    expect(result[0].averageScore).toBeCloseTo(5.0, 2);
  });
});
