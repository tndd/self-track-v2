# Self-Track v2

Self-Track v2 is a mobile-first, glassmorphic habit and physical condition tracking application. It allows users to record daily logs (conditions, custom actions, symptoms) and dynamically analyzes direct and delayed correlation patterns using statistical metrics.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16+ (App Router), React 19, TypeScript
- **Database ORM**: Drizzle ORM + PostgreSQL (`postgres` client)
- **Styling**: Tailwind CSS (Glassmorphism & Mobile-first design system)
- **Math Engine**: `simple-statistics` for Pearson correlation calculations
- **Testing**: Vitest for unit & integration test suites

---

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Environment Setup
Configure your database URL by copying `.env.example` to `.env.local` and setting your postgres connection string:
```bash
cp .env.example .env.local
```
Inside `.env.local`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/self_track_v2
```

### 3. Running the Project
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it.

### 4. Running Tests
Run the Vitest test suites (pure unit tests for analysis & API routes with database mocking):
```bash
npx vitest run
```

### 5. Seeding Realistic Dummy Data
To populate the database with a high-density, JST-aligned 30-day realistic dataset (perfect for testing graphs and analytical correlations):
```bash
npm run db:seed
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/                # RESTful API Endpoints (CRUD & Analysis)
│   │   ├── entries/        # GET (cursor-paginated) & POST entries
│   │   ├── entries/[id]/   # GET / PUT / DELETE single entry
│   │   ├── actions/        # GET & POST actions
│   │   ├── actions/[id]/   # PUT & DELETE action
│   │   ├── action-groups/  # GET & POST action groups
│   │   ├── symptoms/       # GET & POST symptoms
│   │   └── analysis/       # Analytical endpoints (ranking, combinations, timelag, daily-scores)
│   ├── calendar/           # Monthly grid view page
│   ├── analysis/           # Statistical charts & rankings page
│   ├── manage/             # Data management dashboard (CRUD interface)
│   ├── layout.tsx          # Global layout containing the Bottom Navigation
│   └── page.tsx            # Home page containing today's trend and timeline
├── components/             # Reusable UI components (ConditionCurve, Timeline, etc.)
├── db/                     # Drizzle schema, DB client, and seed script
└── lib/
    └── analysis/           # Core mathematical analysis engines & loader
```

---

## 📄 Detailed Specifications & Documentation

For detailed specs, deep-dives into database structure, or mathematical details, refer to the files in `docs/`:

*   **Database Specifications**: Detailed schema fields, entity relationships, constraints, and cascade delete settings:
    ➔ [docs/database_schema.md](file:///Users/tau/repo/dev/self-track-v2/docs/database_schema.md)
*   **Analytical & Statistical Algorithms**: Mathematical equations (Pearson correlation), time-decay scoring, padding constraints, and next-day lag shifting calculations:
    ➔ [docs/analysis_algorithms.md](file:///Users/tau/repo/dev/self-track-v2/docs/analysis_algorithms.md)
