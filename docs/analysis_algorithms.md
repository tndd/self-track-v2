# Statistical & Analytical Algorithms Specification

This document details the mathematical and algorithmic processes used in the Self-Track v2 analysis engine. The code resides in [src/lib/analysis/](file:///Users/tau/repo/dev/self-track-v2/src/lib/analysis/).

---

## 1. Daily Condition Score Calculation (`dailyScore.ts`)

When a user logs their physical condition multiple times a day, we need a single representative daily score. Rather than a simple average, we use a **time-decay spline model** that mimics natural human memory and feeling decay:

### Algorithmic Steps:
1. **JST (UTC+9) Date Mapping**: Timestamps are grouped by JST date string (`YYYY-MM-DD`).
2. **Spline Interpolation & Weighting**:
   - If there is only 1 entry for the day, that score is the daily score.
   - If there are multiple entries, we weigh them dynamically. Logs entered closer to the evening carry slightly more weight as they summarize the day's feeling, but the mathematical spline decay function smooths the transition between morning, afternoon, and evening scores.
3. **Decay Factor**: Calculates weights using $W = e^{-\lambda \cdot \Delta t}$, where $\Delta t$ is the hour difference, ensuring that sequential logs are smoothly interpolated.

---

## 2. Same-Day Correlation Engine (`correlation.ts`)

Measures the statistical relationship between the intensity of a logged action and the daily condition score on the same calendar day.

### Pearson Correlation Formula:
For a specific action $X$ and daily condition scores $Y$ over a period:
$$r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$$

### ⚠️ Padding Constraint (Variance Rule):
- **Why it matters**: If we only calculate correlation on days when the action *actually occurred*, the intensity array $X$ might be a constant (e.g. `[1, 1, 1]`). Mathematically, a constant has zero variance ($\sigma^2 = 0$). This causes division-by-zero in the Pearson formula, resulting in `NaN` (or `0`).
- **Implementation**: The algorithm loops through **every date** in the evaluated range. If the action was not logged on a date, it pads $X$ with `0` intensity. This generates the necessary variance (comparing days *with* the action vs days *without* it), allowing Pearson's $r$ to resolve correctly.

---

## 3. Next-Day Lag Correlation Engine (`timeLag.ts`)

Identifies delayed effects (e.g. drinking alcohol on Friday causing a headache/hangover on Saturday).

### Time-Lag Alignment:
Matches the action intensity on day $T - \text{lagDays}$ with the daily score on day $T$.

```
[Day T-1 (Action)]  ───(Shift by +LagDays)───>  [Day T (Condition Score)]
   Alcohol (Int: 3)                               Score: 2 (Hangover)
```

### ⚠️ Padding Constraint (Variance Rule):
- **Implementation**: Exactly like same-day correlation, the algorithm iterates over **all dates** in the score dataset. For each date $T$, it looks up the action intensity on date $T - \text{lagDays}$. If the action was not taken on the lagged date, it pads the intensity with `0`.
- **Outcome**: This preserves statistical variance in the lagged dataset, preventing division by zero and allowing correct detection of next-day hangovers or workout recovery improvements.

---

## 4. Combination Action Analysis (`combination.ts`)

Finds the synergistic effects of taking multiple actions together (e.g. "Running + Protein" yielding a better score than either alone).

### Evaluation Steps:
1. **Grouping**: Action logs are grouped by date to find which actions occurred on the same day.
2. **Frequency Filtering**: Combinations that have occurred less than the `minFrequency` (default: `2` times) are filtered out to avoid statistical noise.
3. **Score Averaging**: Computes the average daily score of dates when the specific combination of actions was active.
4. **Ranking**: Results are sorted descending by the average daily score, identifying the user's most effective habit combinations.
