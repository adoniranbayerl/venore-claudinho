ALTER TABLE "cms"."entries" DROP CONSTRAINT "entries_content_type_id_content_types_id_fk";
--> statement-breakpoint
ALTER TABLE "cms"."entries" DROP COLUMN "content_type_id";