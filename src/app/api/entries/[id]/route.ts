import { NextResponse } from "next/server";
import { db } from "@/db";
import { entries, entryActions, entrySymptoms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const actionItemSchema = z.object({
  id: z.string().uuid().optional(),
  actionId: z.string().uuid().optional(),
  intensity: z.number().int().min(1).optional().default(1),
}).refine(
  (data) => data.id || data.actionId,
  { message: "Either 'id' or 'actionId' must be provided" }
);

const symptomItemSchema = z.union([
  z.string().uuid(),
  z.object({ symptomId: z.string().uuid() }),
]);

const updateEntrySchema = z.object({
  timestamp: z.string().datetime().optional().nullable(),
  condition: z.number().int().min(1).max(5).optional().nullable(),
  memo: z.string().optional().nullable(),
  actions: z.array(actionItemSchema).optional(),
  symptoms: z.array(symptomItemSchema).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await db.query.entries.findFirst({
      where: (entries, { eq }) => eq(entries.id, id),
      with: {
        entryActions: {
          with: { action: true },
        },
        entrySymptoms: {
          with: { symptom: true },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("GET /api/entries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      // Check existence
      const existing = await tx.query.entries.findFirst({
        where: (entries, { eq }) => eq(entries.id, id),
      });
      if (!existing) return null;

      // Update entry fields
      const updateData: Record<string, unknown> = {};
      if (parsed.data.timestamp !== undefined) {
        updateData.timestamp = parsed.data.timestamp
          ? new Date(parsed.data.timestamp)
          : existing.timestamp;
      }
      if (parsed.data.condition !== undefined) {
        updateData.condition = parsed.data.condition;
      }
      if (parsed.data.memo !== undefined) {
        updateData.memo = parsed.data.memo;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.update(entries).set(updateData).where(eq(entries.id, id));
      }

      // Replace actions if provided
      if (parsed.data.actions !== undefined) {
        await tx.delete(entryActions).where(eq(entryActions.entryId, id));
        if (parsed.data.actions.length > 0) {
          await tx.insert(entryActions).values(
            parsed.data.actions.map((a) => ({
              entryId: id,
              actionId: (a.actionId || a.id)!,
              intensity: a.intensity,
            }))
          );
        }
      }

      // Replace symptoms if provided
      if (parsed.data.symptoms !== undefined) {
        await tx.delete(entrySymptoms).where(eq(entrySymptoms.entryId, id));
        if (parsed.data.symptoms.length > 0) {
          await tx.insert(entrySymptoms).values(
            parsed.data.symptoms.map((s) => ({
              entryId: id,
              symptomId: typeof s === "string" ? s : s.symptomId,
            }))
          );
        }
      }

      // Return updated entry
      return await tx.query.entries.findFirst({
        where: (entries, { eq }) => eq(entries.id, id),
        with: {
          entryActions: { with: { action: true } },
          entrySymptoms: { with: { symptom: true } },
        },
      });
    });

    if (!result) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/entries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db
      .delete(entries)
      .where(eq(entries.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/entries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
