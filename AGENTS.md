<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Self-Track v2 Developer Guidelines & Constraints

This file serves as the core constitution and behavioral guidelines for developers and AI agents working on the Self-Track v2 codebase. Any changes or feature implementations MUST strictly adhere to these rules.

---

## 📅 Timezone Consistency Rule
- **Standard Timezone**: All daily calendar mappings, log group calculations, and daily scores MUST be computed using **JST (Japan Standard Time, UTC+9)**.
- **Implementation**: Convert database UTC timestamps using the correct `+09:00` offset before grouping by date or displaying on the calendar. Failure to do so will cause morning or evening entries to drift across calendar days.

## 📊 Analytical Implementation Constraints

### 1. Same-Day Correlation (`correlation.ts`)
- **Padding Requirement**: You MUST evaluate all dates in the range. If an action was not performed on a date, pad it with `0` intensity. This is mathematically required to maintain variance. Do not skip dates where the action was absent.

### 2. Next-Day Lag Correlation (`timeLag.ts`)
- **Time Shift Alignment**: You MUST align the action on day `T - lagDays` with the score on day `T`.
- **Padding Requirement**: Just like same-day correlation, you MUST evaluate all dates, inserting `0` intensity for days when the action was not taken. Failure to evaluate all dates creates zero variance in the action dataset, resulting in the correlation coefficient resolving to `0` (or NaN due to division by zero).

## 🎨 UI & UX Styling Guidelines

- **Container Constraints**: The layout is mobile-first. The major views (`/`, `/calendar`, `/analysis`, `/manage`) must use `max-w-md mx-auto px-4` containers to fit seamlessly within the bottom navigation.
- **Glassmorphic Theme**: Do not use solid gray or standard dark-mode backgrounds. Utilize `.glass-panel` and `.glass-nav` classes configured in `src/app/globals.css`.
- **Color Mappings**: You MUST use the exact color tokens mapped to condition scores 1–5:
  - **5 (Great)**: Cyan/Blue (`#06b6d4`)
  - **4 (Good)**: Green (`#10b981`)
  - **3 (Neutral)**: Slate/Gray (`#64748b`)
  - **2 (Bad)**: Orange (`#f97316`)
  - **1 (Terrible)**: Red (`#dc2626`)
- **Trend Graph**: `ConditionCurve` (Recharts AreaChart) must map the score colors using a 5-stop top-to-bottom linear gradient using these exact hex colors. It must handle 1-point datasets gracefully by creating a flat spread.

## 🧪 Testing Policy

- **No Mocking of Mathematical Logic**: All analytical functions in `src/lib/analysis/` must remain pure functions. Test them directly in unit tests (`__tests__/`) using plain JS objects without database mocking or wrapping.
- **API Route Testing**: API route tests under `src/app/api/__tests__/` must use the mocked database client (`vi.mock("@/db")`) to isolate API-level validation from real database runs. Do not spin up real databases in regular API integration tests.
