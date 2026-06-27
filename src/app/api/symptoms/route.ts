import { NextResponse } from "next/server";
import { db } from "@/db";
import { symptoms } from "@/db/schema";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const allSymptoms = await db.query.symptoms.findMany({
      orderBy: (symptoms, { asc }) => [asc(symptoms.sortOrder), asc(symptoms.createdAt)],
    });
    return NextResponse.json(allSymptoms);
  } catch (error) {
    console.error("GET /api/symptoms error:", error);
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

    const newSymptom = await db.insert(symptoms).values({
      name: parsed.data.name,
      color: parsed.data.color,
      sortOrder: parsed.data.sortOrder,
    }).returning();

    return NextResponse.json(newSymptom[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/symptoms error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
