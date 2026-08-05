CREATE TABLE "cms"."entry_content_types" (
	"entry_id" text NOT NULL,
	"content_type_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entry_content_types_entry_id_content_type_id_pk" PRIMARY KEY("entry_id","content_type_id")
);
--> statement-breakpoint
ALTER TABLE "cms"."entries" ADD COLUMN "scheduled_publish_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cms"."entries" ADD COLUMN "scheduled_archive_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cms"."entries" ADD COLUMN "visibility" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "cms"."entry_content_types" ADD CONSTRAINT "entry_content_types_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "cms"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms"."entry_content_types" ADD CONSTRAINT "entry_content_types_content_type_id_content_types_id_fk" FOREIGN KEY ("content_type_id") REFERENCES "cms"."content_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms"."entries" ADD CONSTRAINT "entries_status_valid" CHECK ("cms"."entries"."status" IN ('draft', 'scheduled', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "cms"."entries" ADD CONSTRAINT "entries_visibility_valid" CHECK ("cms"."entries"."visibility" IN ('public', 'authenticated'));--> statement-breakpoint
-- Backfill manual (não gerado pelo drizzle-kit): preserva a associação 1:1 antiga como a primeira
-- linha do junction N:N antes da próxima migration derrubar cms.entries.content_type_id. Migrar
-- content_type_id -> tag (docs/implementation-roadmap.md, Fase 2/#2).
INSERT INTO "cms"."entry_content_types" ("entry_id", "content_type_id")
SELECT "id", "content_type_id" FROM "cms"."entries" WHERE "content_type_id" IS NOT NULL;