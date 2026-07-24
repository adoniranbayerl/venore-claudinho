CREATE SCHEMA "themes";
--> statement-breakpoint
CREATE TABLE "themes"."active_theme" (
	"id" text PRIMARY KEY NOT NULL,
	"theme_key" text NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL
);
