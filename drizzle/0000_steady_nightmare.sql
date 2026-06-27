CREATE TABLE "action_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid,
	"name" text NOT NULL,
	"default_intensity" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"condition" integer,
	"memo" text,
	CONSTRAINT "condition_range" CHECK ("entries"."condition" IS NULL OR ("entries"."condition" >= 1 AND "entries"."condition" <= 5))
);
--> statement-breakpoint
CREATE TABLE "entry_actions" (
	"entry_id" uuid NOT NULL,
	"action_id" uuid NOT NULL,
	"intensity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "entry_actions_entry_id_action_id_pk" PRIMARY KEY("entry_id","action_id")
);
--> statement-breakpoint
CREATE TABLE "entry_symptoms" (
	"entry_id" uuid NOT NULL,
	"symptom_id" uuid NOT NULL,
	CONSTRAINT "entry_symptoms_entry_id_symptom_id_pk" PRIMARY KEY("entry_id","symptom_id")
);
--> statement-breakpoint
CREATE TABLE "symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_group_id_action_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."action_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_actions" ADD CONSTRAINT "entry_actions_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_actions" ADD CONSTRAINT "entry_actions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_symptoms" ADD CONSTRAINT "entry_symptoms_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_symptoms" ADD CONSTRAINT "entry_symptoms_symptom_id_symptoms_id_fk" FOREIGN KEY ("symptom_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;