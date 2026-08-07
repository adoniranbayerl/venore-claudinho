CREATE SCHEMA "broadcast";
--> statement-breakpoint
CREATE TABLE "broadcast"."layers" (
	"id" text PRIMARY KEY NOT NULL,
	"scene_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"x" real DEFAULT 0 NOT NULL,
	"y" real DEFAULT 0 NOT NULL,
	"width" real DEFAULT 100 NOT NULL,
	"height" real DEFAULT 100 NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "broadcast_layers_type_check" CHECK ("broadcast"."layers"."type" in ('video','text','clock','lower-third','image','custom-html'))
);
--> statement-breakpoint
CREATE TABLE "broadcast"."outputs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text NOT NULL,
	"current_scene_id" text,
	"current_playlist_item_id" text,
	"drawer_open" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broadcast"."playlist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"playlist_id" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"title" text,
	"source_type" text NOT NULL,
	"relative_path" text,
	"media_asset_id" text,
	"duration_seconds" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "broadcast_playlist_items_source_type_check" CHECK ("broadcast"."playlist_items"."source_type" in ('local','media-asset')),
	CONSTRAINT "broadcast_playlist_items_source_shape_check" CHECK (("broadcast"."playlist_items"."source_type" = 'local' AND "broadcast"."playlist_items"."relative_path" IS NOT NULL AND "broadcast"."playlist_items"."media_asset_id" IS NULL)
        OR ("broadcast"."playlist_items"."source_type" = 'media-asset' AND "broadcast"."playlist_items"."media_asset_id" IS NOT NULL AND "broadcast"."playlist_items"."relative_path" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "broadcast"."playlists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"folder_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broadcast"."scenes" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "broadcast"."layers" ADD CONSTRAINT "layers_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "broadcast"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast"."outputs" ADD CONSTRAINT "outputs_current_scene_id_scenes_id_fk" FOREIGN KEY ("current_scene_id") REFERENCES "broadcast"."scenes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast"."outputs" ADD CONSTRAINT "outputs_current_playlist_item_id_playlist_items_id_fk" FOREIGN KEY ("current_playlist_item_id") REFERENCES "broadcast"."playlist_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "broadcast"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "broadcast_outputs_token_idx" ON "broadcast"."outputs" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "broadcast_scenes_key_idx" ON "broadcast"."scenes" USING btree ("key");