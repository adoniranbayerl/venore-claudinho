CREATE TABLE "broadcast"."agenda_events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "broadcast"."layers" DROP CONSTRAINT "broadcast_layers_type_check";--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_items" DROP CONSTRAINT "broadcast_playlist_items_source_type_check";--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_items" DROP CONSTRAINT "broadcast_playlist_items_source_shape_check";--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_items" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_items" ADD COLUMN "hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "broadcast"."layers" SET "type" = 'info' WHERE "type" = 'clock';--> statement-breakpoint
UPDATE "broadcast"."layers" SET "type" = 'text' WHERE "type" IN ('lower-third', 'custom-html');--> statement-breakpoint
ALTER TABLE "broadcast"."layers" ADD CONSTRAINT "broadcast_layers_type_check" CHECK ("broadcast"."layers"."type" in ('video','text','image','info','news','agenda'));--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_items" ADD CONSTRAINT "broadcast_playlist_items_source_type_check" CHECK ("broadcast"."playlist_items"."source_type" in ('local','media-asset','webpage'));--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_items" ADD CONSTRAINT "broadcast_playlist_items_source_shape_check" CHECK (("broadcast"."playlist_items"."source_type" = 'local' AND "broadcast"."playlist_items"."relative_path" IS NOT NULL AND "broadcast"."playlist_items"."media_asset_id" IS NULL AND "broadcast"."playlist_items"."url" IS NULL)
        OR ("broadcast"."playlist_items"."source_type" = 'media-asset' AND "broadcast"."playlist_items"."media_asset_id" IS NOT NULL AND "broadcast"."playlist_items"."relative_path" IS NULL AND "broadcast"."playlist_items"."url" IS NULL)
        OR ("broadcast"."playlist_items"."source_type" = 'webpage' AND "broadcast"."playlist_items"."url" IS NOT NULL AND "broadcast"."playlist_items"."relative_path" IS NULL AND "broadcast"."playlist_items"."media_asset_id" IS NULL));