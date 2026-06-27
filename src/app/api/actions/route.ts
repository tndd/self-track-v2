import { NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  groupId: z.string().uuid().optional().nullable(),
  defaultIntensity: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const allActions = await db.query.actions.findMany({
      with: {
        group: true,
      },
      orderBy: (actions, { asc }) => [asc(actions.sortOrder), asc(actions.createdAt)],
    });
    return NextResponse.json(allActions);
  } catch (error) {
    console.error("GET /api/actions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const newAction = await db.insert(actions).values({
      name: parsed.data.name,
      groupId: parsed.data.groupId,
      defaultIntensity: parsed.data.defaultIntensity,
      sortOrder: parsed.data.sortOrder,
    }).returning();

    return NextResponse.json(newAction[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/actions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
