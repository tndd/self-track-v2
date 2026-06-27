import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================
// Action Groups — organizational grouping for actions
// ============================================================
export const actionGroups = pgTable("action_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const actionGroupsRelations = relations(actionGroups, ({ many }) => ({
  actions: many(actions),
}));

// ============================================================
// Actions — things the user does (medication, supplements, exercise, etc.)
// ============================================================
export const actions = pgTable("actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => actionGroups.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  defaultIntensity: integer("default_intensity").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const actionsRelations = relations(actions, ({ one, many }) => ({
  group: one(actionGroups, {
    fields: [actions.groupId],
    references: [actionGroups.id],
  }),
  entryActions: many(entryActions),
}));

// ============================================================
// Symptoms — observed states / annotations to condition
// ============================================================
export const symptoms = pgTable("symptoms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const symptomsRelations = relations(symptoms, ({ many }) => ({
  entrySymptoms: many(entrySymptoms),
}));

// ============================================================
// Entries — unified record ("tweet"), the core recording unit
// ============================================================
export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
    condition: integer("condition"),
    memo: text("memo"),
  },
  (table) => [
    check(
      "condition_range",
      sql`${table.condition} IS NULL OR (${table.condition} >= 1 AND ${table.condition} <= 5)`
    ),
  ]
);

export const entriesRelations = relations(entries, ({ many }) => ({
  entryActions: many(entryActions),
  entrySymptoms: many(entrySymptoms),
}));

// ============================================================
// Entry Actions — junction table: Entry ↔ Action with intensity
// ============================================================
export const entryActions = pgTable(
  "entry_actions",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    actionId: uuid("action_id")
      .notNull()
      .references(() => actions.id, { onDelete: "cascade" }),
    intensity: integer("intensity").notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.actionId] })]
);

export const entryActionsRelations = relations(entryActions, ({ one }) => ({
  entry: one(entries, {
    fields: [entryActions.entryId],
    references: [entries.id],
  }),
  action: one(actions, {
    fields: [entryActions.actionId],
    references: [actions.id],
  }),
}));

// ============================================================
// Entry Symptoms — junction table: Entry ↔ Symptom
// ============================================================
export const entrySymptoms = pgTable(
  "entry_symptoms",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    symptomId: uuid("symptom_id")
      .notNull()
      .references(() => symptoms.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.symptomId] })]
);

export const entrySymptomsRelations = relations(entrySymptoms, ({ one }) => ({
  entry: one(entries, {
    fields: [entrySymptoms.entryId],
    references: [entries.id],
  }),
  symptom: one(symptoms, {
    fields: [entrySymptoms.symptomId],
    references: [symptoms.id],
  }),
}));
