import { describe, it, expect } from "vitest";
import {
  calculateDailyScore,
  calculateDailyScores,
  ConditionLog,
} from "../dailyScore";

/**
 * Helper: creates a ConditionLog with a JST datetime string.
 * The dailyScore module expects Date objects, and uses JST boundaries.
 */
function log(jstDateTime: string, condition: number): ConditionLog {
  // Input format: "YYYY-MM-DD HH:mm" in JST
  const isoString = `${jstDateTime.replace(" ", "T")}:00+09:00`;
  return { timestamp: new Date(isoString), condition };
}

describe("calculateDailyScore", () => {
  it("returns 3 (neutral) when there are no logs", () => {
    const score = calculateDailyScore("2024-01-15", []);
    expect(score).toBeCloseTo(3.0, 2);
  });

  it("returns the condition value when a single log covers the entire day", () => {
    // Log at start of day — fills the whole day
    const logs = [log("2024-01-15 00:00", 5)];
    const score = calculateDailyScore("2024-01-15", logs);
    expect(score).toBeCloseTo(5.0, 2);
  });

  it("handles a log from the previous day that carries into the target day", () => {
    // Log at 23:00 on Jan 14 → carries over into Jan 15 until 23:00 (24h rule)
    const logs = [log("2024-01-14 23:00", 4)];
    const score = calculateDailyScore("2024-01-15", logs);
    // The log covers 00:00 to 23:00 (= 23 hours at 4), then 23:00 to 23:59:59 (= ~1 hour at 3 due to 24h reset)
    const expected = (4 * 23 + 3 * 1) / 24;
    expect(score).toBeCloseTo(expected, 1);
  });

  it("calculates weighted average for multiple logs in a day", () => {
    // Log at 06:00 condition=2, log at 18:00 condition=4
    const logs = [
      log("2024-01-15 06:00", 2),
      log("2024-01-15 18:00", 4),
    ];
    const score = calculateDailyScore("2024-01-15", logs);
    // 00:00-06:00 = 6h at 3 (neutral, no prior log)
    // 06:00-18:00 = 12h at 2
    // 18:00-24:00 = 6h at 4
    const expected = (3 * 6 + 2 * 12 + 4 * 6) / 24;
    expect(score).toBeCloseTo(expected, 1);
  });

  it("applies 24h auto-reset rule", () => {
    // Log at 08:00 on Jan 14 condition=5
    // By Jan 15 08:00 (24h later), resets to 3
    const logs = [log("2024-01-14 08:00", 5)];
    const score = calculateDailyScore("2024-01-15", logs);
    // 00:00-08:00 = 8h at 5 (still within 24h of Jan 14 08:00)
    // 08:00-24:00 = 16h at 3 (reset)
    const expected = (5 * 8 + 3 * 16) / 24;
    expect(score).toBeCloseTo(expected, 1);
  });

  it("handles edge case: log at exact midnight", () => {
    const logs = [log("2024-01-15 00:00", 1)];
    const score = calculateDailyScore("2024-01-15", logs);
    expect(score).toBeCloseTo(1.0, 2);
  });

  it("handles condition of 3 (neutral) correctly", () => {
    const logs = [log("2024-01-15 12:00", 3)];
    const score = calculateDailyScore("2024-01-15", logs);
    // All day is 3 (neutral from no log, then 3 from log) = 3
    expect(score).toBeCloseTo(3.0, 2);
  });
});

describe("calculateDailyScores", () => {
  it("calculates scores for multiple dates", () => {
    const logs = [
      log("2024-01-15 08:00", 5),
      log("2024-01-16 08:00", 1),
    ];
    const scores = calculateDailyScores(["2024-01-15", "2024-01-16"], logs);

    expect(Object.keys(scores)).toHaveLength(2);
    expect(scores["2024-01-15"]).toBeDefined();
    expect(scores["2024-01-16"]).toBeDefined();
    // Jan 15 should be higher than Jan 16
    expect(scores["2024-01-15"]).toBeGreaterThan(scores["2024-01-16"]);
  });

  it("returns empty object for empty date list", () => {
    const logs = [log("2024-01-15 08:00", 5)];
    const scores = calculateDailyScores([], logs);
    expect(Object.keys(scores)).toHaveLength(0);
  });

  it("returns neutral scores for dates with no logs", () => {
    const scores = calculateDailyScores(["2024-01-15"], []);
    expect(scores["2024-01-15"]).toBeCloseTo(3.0, 2);
  });
});
