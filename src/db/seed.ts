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

  // Clear existing data in reverse order of dependencies
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
  const seededActions = await db.insert(schema.actions).values([
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
  ]).returning();

  const loxonin = seededActions.find(a => a.name === "ロキソニン")!;
  const running = seededActions.find(a => a.name === "ランニング")!;
  const workout = seededActions.find(a => a.name === "筋トレ")!;
  const coffee = seededActions.find(a => a.name === "コーヒー")!;
  const alcohol = seededActions.find(a => a.name === "アルコール")!;
  const vitaminD = seededActions.find(a => a.name === "ビタミンD")!;

  // 3. Seed Symptoms
  const seededSymptoms = await db.insert(schema.symptoms).values([
    { name: "頭痛", color: "#ef4444", sortOrder: 1 },
    { name: "肩こり", color: "#f59e0b", sortOrder: 2 },
    { name: "目の疲れ", color: "#fbbf24", sortOrder: 3 },
    { name: "倦怠感", color: "#b91c1c", sortOrder: 4 },
    { name: "集中力◎", color: "#10b981", sortOrder: 5 },
    { name: "眠気", color: "#6b7280", sortOrder: 6 },
    { name: "快眠", color: "#10b981", sortOrder: 7 },
  ]).returning();

  const headache = seededSymptoms.find(s => s.name === "頭痛")!;
  const fatigue = seededSymptoms.find(s => s.name === "倦怠感")!;
  const goodSleep = seededSymptoms.find(s => s.name === "快眠")!;
  const highFocus = seededSymptoms.find(s => s.name === "集中力◎")!;

  // 4. Generate 30 days of entries
  console.log("Generating 30 days of realistic dummy entries...");
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const currentDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Set fixed time of day for reproducibility
    currentDate.setUTCHours(9, 0, 0, 0);

    // Baseline condition is 3
    let condition = 3;
    let memo = "平穏な一日。";
    const dayActions: { actionId: string; intensity: number }[] = [];
    const daySymptoms: string[] = [];

    // Rule 1: Always take Vitamin D
    dayActions.push({ actionId: vitaminD.id, intensity: 1 });

    // Rule 2: Workout/Running on day % 3 === 0 (High condition)
    if (i % 3 === 0) {
      condition = 5;
      dayActions.push({ actionId: running.id, intensity: 2 });
      dayActions.push({ actionId: workout.id, intensity: 1 });
      daySymptoms.push(goodSleep.id);
      daySymptoms.push(highFocus.id);
      memo = "朝ランニングして筋トレした！体調が非常に良い。";
    } 
    // Rule 3: Alcohol on day % 4 === 0 (Low condition next day / same day)
    else if (i % 4 === 0) {
      condition = 2;
      dayActions.push({ actionId: alcohol.id, intensity: 3 });
      daySymptoms.push(fatigue.id);
      memo = "夜にお酒を飲みすぎた。体が重い。";
    }
    // Rule 4: Headache on day % 5 === 0 and taking Loxonin
    else if (i % 5 === 0) {
      condition = 1;
      dayActions.push({ actionId: loxonin.id, intensity: 1 });
      daySymptoms.push(headache.id);
      memo = "頭痛がひどいのでロキソニンを飲んだ。";
    }
    // Rule 5: Coffee on other days
    else if (i % 2 === 0) {
      dayActions.push({ actionId: coffee.id, intensity: 2 });
      memo = "コーヒーを飲んで仕事に集中。";
    }

    // Insert Entry
    const [entry] = await db.insert(schema.entries).values({
      timestamp: currentDate,
      condition,
      memo,
    }).returning();

    // Insert Entry Actions
    if (dayActions.length > 0) {
      await db.insert(schema.entryActions).values(
        dayActions.map(da => ({
          entryId: entry.id,
          actionId: da.actionId,
          intensity: da.intensity,
        }))
      );
    }

    // Insert Entry Symptoms
    if (daySymptoms.length > 0) {
      await db.insert(schema.entrySymptoms).values(
        daySymptoms.map(symptomId => ({
          entryId: entry.id,
          symptomId,
        }))
      );
    }
  }

  console.log("Seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
