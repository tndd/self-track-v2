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

## 🎨 Global UI & UX Constraints
- **Layout Constraints**: The layout is mobile-first. The major views (`/`, `/calendar`, `/analysis`, `/manage`) must use `max-w-md mx-auto px-4` containers to fit seamlessly within the bottom navigation.
- **Color Mappings**: You MUST use the exact color tokens mapped to condition scores 1–5:
  - **5 (Great)**: Cyan/Blue (`#06b6d4`)
  - **4 (Good)**: Green (`#10b981`)
  - **3 (Neutral)**: Slate/Gray (`#64748b`)
  - **2 (Bad)**: Orange (`#f97316`)
  - **1 (Terrible)**: Red (`#dc2626`)

---

### Detailed Implementation Guidelines

For details on local coding rules, algorithms, component styling, and testing setups, refer to:
- 📊 **Analytical Logic Details**: See [docs/analysis_algorithms.md](file:///Users/tau/repo/dev/self-track-v2/docs/analysis_algorithms.md)
- 🎨 **Component & Styling Details**: See [docs/ui_styling.md](file:///Users/tau/repo/dev/self-track-v2/docs/ui_styling.md)
- 🧪 **Testing Policies**: See [docs/testing.md](file:///Users/tau/repo/dev/self-track-v2/docs/testing.md)
