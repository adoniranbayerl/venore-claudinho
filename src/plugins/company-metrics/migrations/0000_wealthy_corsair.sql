CREATE SCHEMA "company_metrics";
--> statement-breakpoint
CREATE TABLE "company_metrics"."sector_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"sector_id" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"logo_media_id" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_metrics"."sector_members" (
	"sector_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sector_members_sector_id_user_id_pk" PRIMARY KEY("sector_id","user_id"),
	CONSTRAINT "company_metrics_sector_members_role_check" CHECK ("company_metrics"."sector_members"."role" in ('admin','editor','viewer'))
);
--> statement-breakpoint
CREATE TABLE "company_metrics"."sectors" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"position" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_metrics"."sector_groups" ADD CONSTRAINT "sector_groups_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "company_metrics"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."sector_members" ADD CONSTRAINT "sector_members_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "company_metrics"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "company_metrics_sector_groups_key_idx" ON "company_metrics"."sector_groups" USING btree ("sector_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "company_metrics_sectors_key_idx" ON "company_metrics"."sectors" USING btree ("key");