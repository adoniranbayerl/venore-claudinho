ALTER TABLE "media"."assets" ADD COLUMN "visibility" text DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "media"."files" ADD COLUMN "visibility" text DEFAULT 'private' NOT NULL;