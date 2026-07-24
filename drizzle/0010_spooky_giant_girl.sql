DROP INDEX "cms"."entries_content_type_slug_idx";--> statement-breakpoint
ALTER TABLE "cms"."categories" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "cms"."categories" SET "slug" = "key" WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "cms"."categories" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "entries_category_slug_idx" ON "cms"."entries" USING btree ("category_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "entries_null_category_slug_idx" ON "cms"."entries" USING btree ("slug") WHERE "cms"."entries"."category_id" is null;--> statement-breakpoint
ALTER TABLE "cms"."categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug");
