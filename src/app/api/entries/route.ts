import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries, entryActions, entrySymptoms } from "@/db/schema";
import { z } from "zod";

const createEntrySchema = z.object({
  timestamp: z.string().datetime().optional().nullable(),
  condition: z.number().int().min(1).max(5).optional().nullable(),
  memo: z.string().optional().nullable(),
  actions: z.array(z.object({
    actionId: z.string().uuid(),
    intensity: z.number().int().optional(),
  })).optional(),
  symptoms: z.array(z.object({
    symptomId: z.string().uuid(),
  })).optional(),
});

export async function GET() {
  try {
    const allEntries = await db.query.entries.findMany({
      with: {
        entryActions: {
          with: { action: true },
        },
        entrySymptoms: {
          with: { symptom: true },
        },
      },
      orderBy: (entries, { desc }) => [desc(entries.timestamp)],
    });
    return NextResponse.json(allEntries);
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
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const { timestamp, condition, memo, actions, symptoms } = parsed.data;

    const result = await db.transaction(async (tx) => {
      // 1. Insert entry
      const newEntry = await tx.insert(entries).values({
        timestamp: timestamp ? new Date(timestamp) : undefined,
        condition,
        memo,
      }).returning();

      const entryId = newEntry[0].id;

      // 2. Insert actions if any
      if (actions && actions.length > 0) {
        await tx.insert(entryActions).values(
          actions.map(a => ({
            entryId,
            actionId: a.actionId,
            intensity: a.intensity,
          }))
        );
      }

      // 3. Insert symptoms if any
      if (symptoms && symptoms.length > 0) {
        await tx.insert(entrySymptoms).values(
          symptoms.map(s => ({
            entryId,
            symptomId: s.symptomId,
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
