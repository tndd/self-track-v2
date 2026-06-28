import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

// Helper to create a Date object aligned to JST timezone calendar days,
// correctly handling timezone shifts and boundary overflows (e.g. past midnight in JST).
function createJstDate(baseDate: Date, jstHour: number, jstMinute: number): Date {
  const jstTime = new Date(baseDate.getTime() + 9 * 60 * 60 * 1000);
  const jstYear = jstTime.getUTCFullYear();
  const jstMonth = jstTime.getUTCMonth();
  const jstDate = jstTime.getUTCDate();
  
  // Reconstruct JST timestamp using UTC constructor offset by 9 hours
  const utcHours = jstHour - 9;
  const utcTime = Date.UTC(jstYear, jstMonth, jstDate, utcHours, jstMinute, 0, 0);
  return new Date(utcTime);
}

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
    { groupId: execGroup.id, name: "筋トレ", defaultIntensity: 2, sortOrder: 2 },
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

  // 4. Generate 30 days of entries (High density, 7 JST entries per day)
  console.log("Generating 30 days of JST-aligned dummy entries...");
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const baseDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    const times = [
      { jstHour: 7, jstMinute: 30, label: "wakeup" },
      { jstHour: 10, jstMinute: 0, label: "morning" },
      { jstHour: 12, jstMinute: 30, label: "lunch" },
      { jstHour: 15, jstMinute: 0, label: "afternoon" },
      { jstHour: 18, jstMinute: 0, label: "evening" },
      { jstHour: 20, jstMinute: 30, label: "night" },
      { jstHour: 23, jstMinute: 0, label: "bedtime" }
    ];

    const isWorkoutDay = (i % 3 === 0);
    const isAlcoholDay = (i % 4 === 0);
    const isHangoverDay = ((i + 1) % 4 === 0); // Day after alcohol day
    const isHeadacheDay = (i % 5 === 0);

    for (const time of times) {
      const currentDate = createJstDate(baseDate, time.jstHour, time.jstMinute);

      let condition = 3;
      let memo = "";
      const dayActions: { actionId: string; intensity: number }[] = [];
      const daySymptoms: string[] = [];

      // Vitamin D is taken every morning
      if (time.label === "morning") {
        dayActions.push({ actionId: vitaminD.id, intensity: 1 });
      }

      // Special case: Today (i === 0) spans full 1 to 5 spectrum with dynamic fluctuations
      if (i === 0) {
        switch(time.label) {
          case "wakeup": 
            condition = 1; 
            daySymptoms.push(headache.id);
            memo = "朝起きた瞬間から最悪の頭痛。ロキソニンを飲む。"; 
            dayActions.push({ actionId: loxonin.id, intensity: 1 });
            break;
          case "morning": 
            condition = 4; 
            memo = "薬が劇的に効いて一気に調子が良くなる。"; 
            break;
          case "lunch": 
            condition = 2; 
            daySymptoms.push(fatigue.id);
            memo = "お昼すぎ、急激に強い倦怠感に襲われる。"; 
            break;
          case "afternoon": 
            condition = 5; 
            dayActions.push({ actionId: coffee.id, intensity: 1 });
            daySymptoms.push(highFocus.id);
            memo = "コーヒーを飲んで奇跡的な集中力を発揮。絶好調。"; 
            break;
          case "evening": 
            condition = 3; 
            memo = "仕事が終わり、一時的にニュートラルに戻る。"; 
            break;
          case "night": 
            condition = 5; 
            dayActions.push({ actionId: running.id, intensity: 2 }, { actionId: workout.id, intensity: 1 });
            memo = "ジムで汗を流してランニング。非常に充実感がある。"; 
            break;
          case "bedtime": 
            condition = 1; 
            daySymptoms.push(fatigue.id);
            memo = "ベッドに入る頃には電池が切れたように疲れ果てる。"; 
            break;
        }
      }
      else if (isWorkoutDay) {
        // High condition day: Average ~4.7 -> rounds to 5 (Blue)
        switch(time.label) {
          case "wakeup": condition = 4; memo = "すっきりと目覚めた。"; break;
          case "morning": condition = 5; daySymptoms.push(highFocus.id); break;
          case "lunch": condition = 5; break;
          case "afternoon": condition = 4; break;
          case "evening": condition = 5; dayActions.push({ actionId: running.id, intensity: 2 }, { actionId: workout.id, intensity: 1 }); memo = "ランニングと筋トレ。爽快。"; break;
          case "night": condition = 5; break;
          case "bedtime": condition = 5; daySymptoms.push(goodSleep.id); break;
        }
      } 
      else if (isAlcoholDay) {
        // Evening drinking day: Average ~3.3 -> rounds to 3 (Slate)
        switch(time.label) {
          case "wakeup": condition = 3; break;
          case "morning": condition = 3; break;
          case "lunch": condition = 3; break;
          case "afternoon": condition = 4; break;
          case "evening": condition = 5; dayActions.push({ actionId: alcohol.id, intensity: 3 }); memo = "夜は飲み会。楽しくお酒を飲む。"; break;
          case "night": condition = 3; break;
          case "bedtime": condition = 2; break;
        }
      }
      else if (isHangoverDay) {
        // Hangover day (Day after alcohol): Average ~2.1 -> rounds to 2 (Orange)
        switch(time.label) {
          case "wakeup": condition = 2; daySymptoms.push(fatigue.id); memo = "昨日のお酒が残っていて頭が重い。"; break;
          case "morning": condition = 2; break;
          case "lunch": condition = 2; break;
          case "afternoon": condition = 2; break;
          case "evening": condition = 3; break;
          case "night": condition = 3; break;
          case "bedtime": condition = 2; break;
        }
      }
      else if (isHeadacheDay) {
        // Headache day: Average ~1.4 -> rounds to 1 (Red)
        switch(time.label) {
          case "wakeup": condition = 1; daySymptoms.push(headache.id); memo = "頭痛で目が覚める。動けない。"; break;
          case "morning": condition = 1; dayActions.push({ actionId: loxonin.id, intensity: 1 }); daySymptoms.push(headache.id); break;
          case "lunch": condition = 1; break;
          case "afternoon": condition = 2; daySymptoms.push(fatigue.id); break;
          case "evening": condition = 2; break;
          case "night": condition = 2; break;
          case "bedtime": condition = 1; break;
        }
      }
      else {
        // Standard normal day (Some slightly better, some neutral)
        const isBetterDay = (i % 2 === 0);
        if (isBetterDay) {
          // Average ~3.6 -> rounds to 4 (Green)
          switch(time.label) {
            case "wakeup": condition = 3; break;
            case "morning": condition = 4; dayActions.push({ actionId: coffee.id, intensity: 1 }); break;
            case "lunch": condition = 3; break;
            case "afternoon": condition = 3; break;
            case "evening": condition = 4; break;
            case "night": condition = 4; break;
            case "bedtime": condition = 4; break;
          }
        } else {
          // Average ~3.0 -> rounds to 3 (Slate)
          switch(time.label) {
            case "wakeup": condition = 3; break;
            case "morning": condition = 3; break;
            case "lunch": condition = 3; break;
            case "afternoon": condition = 3; break;
            case "evening": condition = 3; break;
            case "night": condition = 3; break;
            case "bedtime": condition = 3; break;
          }
        }
      }

      // Insert Entry
      const [entry] = await db.insert(schema.entries).values({
        timestamp: currentDate,
        condition,
        memo: memo || undefined,
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
  }

  console.log("Seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
