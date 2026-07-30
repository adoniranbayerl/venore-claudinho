CREATE TABLE "media"."assets" (
	"id" text PRIMARY KEY NOT NULL,
	"pathname" text NOT NULL,
	"url" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text,
	"checksum" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media"."assets" ADD CONSTRAINT "assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_pathname_idx" ON "media"."assets" USING btree ("pathname");--> statement-breakpoint
CREATE INDEX "media_assets_checksum_idx" ON "media"."assets" USING btree ("checksum");--> statement-breakpoint
CREATE INDEX "media_assets_uploaded_by_idx" ON "media"."assets" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "media_assets_deleted_at_idx" ON "media"."assets" USING btree ("deleted_at");