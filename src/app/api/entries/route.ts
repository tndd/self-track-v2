import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { db } from "@/db";
import { entries, entryActions, entrySymptoms } from "@/db/schema";
import { desc, lt } from "drizzle-orm";
import { z } from "zod";

// Accept both { id, intensity } (frontend format) and { actionId, intensity } (canonical)
const actionItemSchema = z.object({
  id: z.string().uuid().optional(),
  actionId: z.string().uuid().optional(),
  intensity: z.number().int().min(1).optional().default(1),
}).refine(
  (data) => data.id || data.actionId,
  { message: "Either 'id' or 'actionId' must be provided" }
);

// Accept both string[] (frontend format) and { symptomId }[] (canonical)
const symptomItemSchema = z.union([
  z.string().uuid(),
  z.object({ symptomId: z.string().uuid() }),
]);

const createEntrySchema = z.object({
  timestamp: z.string().datetime().optional().nullable(),
  condition: z.number().int().min(1).max(5).optional().nullable(),
  memo: z.string().optional().nullable(),
  actions: z.array(actionItemSchema).optional(),
  symptoms: z.array(symptomItemSchema).optional(),
}).refine(
  (data) => {
    const hasCondition = data.condition !== null && data.condition !== undefined;
    const hasMemo = !!data.memo;
    const hasActions = data.actions && data.actions.length > 0;
    const hasSymptoms = data.symptoms && data.symptoms.length > 0;
    return hasCondition || hasMemo || hasActions || hasSymptoms;
  },
  { message: "At least one of condition, memo, actions, or symptoms is required" }
);

const DEFAULT_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const limit = Math.min(
      Math.max(parseInt(limitParam || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      100
    );

    const whereClause = cursor
      ? lt(entries.timestamp, new Date(cursor))
      : undefined;

    const allEntries = await db.query.entries.findMany({
      where: whereClause,
      with: {
        entryActions: {
          with: { action: true },
        },
        entrySymptoms: {
          with: { symptom: true },
        },
      },
      orderBy: [desc(entries.timestamp)],
      limit: limit + 1, // Fetch one extra to determine hasMore
    });

    const hasMore = allEntries.length > limit;
    const results = hasMore ? allEntries.slice(0, limit) : allEntries;
    const nextCursor = hasMore
      ? results[results.length - 1].timestamp.toISOString()
      : null;

    return NextResponse.json({
      entries: results,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("GET /api/entries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { timestamp, condition, memo, actions, symptoms } = parsed.data;

    const result = await db.transaction(async (tx) => {
      // 1. Insert entry
      const newEntry = await tx
        .insert(entries)
        .values({
          timestamp: timestamp ? new Date(timestamp) : undefined,
          condition,
          memo,
        })
        .returning();

      const entryId = newEntry[0].id;

      // 2. Insert actions if any
      if (actions && actions.length > 0) {
        await tx.insert(entryActions).values(
          actions.map((a) => ({
            entryId,
            actionId: (a.actionId || a.id)!,
            intensity: a.intensity,
          }))
        );
      }

      // 3. Insert symptoms if any
      if (symptoms && symptoms.length > 0) {
        await tx.insert(entrySymptoms).values(
          symptoms.map((s) => ({
            entryId,
            symptomId: typeof s === "string" ? s : s.symptomId,
          }))
        );
      }

      // Fetch the fully populated entry to return
      const populatedEntry = await tx.query.entries.findFirst({
        where: (entries, { eq }) => eq(entries.id, entryId),
        with: {
          entryActions: {
            with: { action: true },
          },
          entrySymptoms: {
            with: { symptom: true },
          },
        },
      });

      return populatedEntry;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/entries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
