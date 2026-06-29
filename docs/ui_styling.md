# UI & UX Styling Guidelines

This document details the design system, specific component implementations, and CSS utilities used in Self-Track v2.

---

## 💎 Glassmorphic Theme

Do not use solid gray or standard dark-mode backgrounds. Utilize `.glass-panel` and `.glass-nav` classes configured in `src/app/globals.css` to achieve a modern, semi-transparent, premium aesthetic.

## 📊 Trend Graph (`ConditionCurve`)

The `ConditionCurve` component (built using Recharts `AreaChart`) displays the daily condition score trends. It must adhere to the following implementation details:
- **Gradient Mapping**: Map the condition score colors using a 5-stop top-to-bottom linear gradient using the exact hex colors defined in the global design tokens (Scores 1–5).
- **1-Point Dataset Handling**: Handle 1-point datasets gracefully by creating a flat spread or dummy padding so the graph does not crash or look empty.
