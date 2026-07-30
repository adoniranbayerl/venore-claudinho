CREATE TABLE "media"."categories" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "media"."files" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "media"."files" ADD CONSTRAINT "files_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "media"."categories"("id") ON DELETE restrict ON UPDATE no action;