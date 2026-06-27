import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
  console.log("Seeding started...");

  // Clear existing data
  await db.delete(schema.entryActions);
  await db.delete(schema.entrySymptoms);
  await db.delete(schema.entries);
  await db.delete(schema.actions);
  await db.delete(schema.actionGroups);
  await db.delete(schema.symptoms);

  // 1. Seed Action Groups
  const groups = await db.insert(schema.actionGroups).values([
    { name: "💊 薬", color: "#ef4444", sortOrder: 1 },
    { name: "💎 サプリ", color: "#3b82f6", sortOrder: 2 },
    { name: "🏃 運動", color: "#10b981", sortOrder: 3 },
    { name: "☕ 嗜好品・生活", color: "#f59e0b", sortOrder: 4 },
  ]).returning();

  const medGroup = groups.find(g => g.name.includes("薬"))!;
  const suppGroup = groups.find(g => g.name.includes("サプリ"))!;
  const execGroup = groups.find(g => g.name.includes("運動"))!;
  const lifeGroup = groups.find(g => g.name.includes("生活"))!;

  // 2. Seed Actions
  await db.insert(schema.actions).values([
    // Meds
    { groupId: medGroup.id, name: "ロキソニン", defaultIntensity: 1, sortOrder: 1 },
    { groupId: medGroup.id, name: "アレグラ", defaultIntensity: 1, sortOrder: 2 },
    
    // Supps
    { groupId: suppGroup.id, name: "ビタミンD", defaultIntensity: 1, sortOrder: 1 },
    { groupId: suppGroup.id, name: "マグネシウム", defaultIntensity: 1, sortOrder: 2 },
    { groupId: suppGroup.id, name: "亜鉛", defaultIntensity: 1, sortOrder: 3 },
    { groupId: suppGroup.id, name: "プロテイン", defaultIntensity: 1, sortOrder: 4 },

    // Exercise
    { groupId: execGroup.id, name: "ランニング", defaultIntensity: 1, sortOrder: 1 },
    { groupId: execGroup.id, name: "筋トレ", defaultIntensity: 1, sortOrder: 2 },
    { groupId: execGroup.id, name: "ストレッチ", defaultIntensity: 1, sortOrder: 3 },

    // Life
    { groupId: lifeGroup.id, name: "コーヒー", defaultIntensity: 1, sortOrder: 1 },
    { groupId: lifeGroup.id, name: "アルコール", defaultIntensity: 1, sortOrder: 2 },
    { groupId: lifeGroup.id, name: "サウナ", defaultIntensity: 1, sortOrder: 3 },
  ]);

  // 3. Seed Symptoms
  await db.insert(schema.symptoms).values([
    { name: "頭痛", color: "#ef4444", sortOrder: 1 },
    { name: "肩こり", color: "#f59e0b", sortOrder: 2 },
    { name: "目の疲れ", color: "#fbbf24", sortOrder: 3 },
    { name: "倦怠感", color: "#b91c1c", sortOrder: 4 },
    { name: "集中力◎", color: "#10b981", sortOrder: 5 },
    { name: "眠気", color: "#6b7280", sortOrder: 6 },
    { name: "快眠", color: "#10b981", sortOrder: 7 },
  ]);

  console.log("Seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
