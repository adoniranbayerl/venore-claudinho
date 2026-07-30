CREATE TABLE "cms"."menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_id" text NOT NULL,
	"parent_id" text,
	"label" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"target_type" text NOT NULL,
	"content_id" text,
	"route_path" text,
	"required_permission_key" text,
	"external_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_target_matches_type" CHECK (("cms"."menu_items"."target_type" = 'content' AND "cms"."menu_items"."content_id" IS NOT NULL AND "cms"."menu_items"."route_path" IS NULL AND "cms"."menu_items"."external_url" IS NULL)
        OR ("cms"."menu_items"."target_type" = 'route' AND "cms"."menu_items"."route_path" IS NOT NULL AND "cms"."menu_items"."content_id" IS NULL AND "cms"."menu_items"."external_url" IS NULL)
        OR ("cms"."menu_items"."target_type" = 'external' AND "cms"."menu_items"."external_url" IS NOT NULL AND "cms"."menu_items"."content_id" IS NULL AND "cms"."menu_items"."route_path" IS NULL)
        OR ("cms"."menu_items"."target_type" = 'label' AND "cms"."menu_items"."content_id" IS NULL AND "cms"."menu_items"."route_path" IS NULL AND "cms"."menu_items"."external_url" IS NULL)),
	CONSTRAINT "menu_items_required_permission_only_on_route" CHECK ("cms"."menu_items"."required_permission_key" IS NULL OR "cms"."menu_items"."target_type" = 'route'),
	CONSTRAINT "menu_items_target_type_valid" CHECK ("cms"."menu_items"."target_type" IN ('content', 'route', 'external', 'label'))
);
--> statement-breakpoint
CREATE TABLE "cms"."menus" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"scope_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menus_key_unique" UNIQUE("key"),
	CONSTRAINT "menus_scope_path_matches_location" CHECK (("cms"."menus"."location" = 'contextual' AND "cms"."menus"."scope_path" IS NOT NULL AND length(trim("cms"."menus"."scope_path")) > 0)
        OR ("cms"."menus"."location" <> 'contextual' AND "cms"."menus"."scope_path" IS NULL)),
	CONSTRAINT "menus_location_valid" CHECK ("cms"."menus"."location" IN ('main', 'header', 'contextual', 'sitemap'))
);
--> statement-breakpoint
ALTER TABLE "cms"."menu_items" ADD CONSTRAINT "menu_items_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "cms"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms"."menu_items" ADD CONSTRAINT "menu_items_parent_id_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "menus_singleton_location_idx" ON "cms"."menus" USING btree ("location") WHERE "cms"."menus"."location" <> 'contextual';--> statement-breakpoint
CREATE UNIQUE INDEX "menus_contextual_scope_idx" ON "cms"."menus" USING btree ("scope_path") WHERE "cms"."menus"."location" = 'contextual';