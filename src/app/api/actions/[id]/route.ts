import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  groupId: z.string().uuid().optional().nullable(),
  defaultIntensity: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await db
      .update(actions)
      .set(parsed.data)
      .where(eq(actions.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PUT /api/actions/[id] error:", error);
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
      .delete(actions)
      .where(eq(actions.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/actions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
