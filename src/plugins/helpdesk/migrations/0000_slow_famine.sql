CREATE SCHEMA "helpdesk";
--> statement-breakpoint
CREATE TABLE "helpdesk"."categories" (
	"id" text PRIMARY KEY NOT NULL,
	"queue_id" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helpdesk"."queue_members" (
	"queue_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "queue_members_queue_id_user_id_pk" PRIMARY KEY("queue_id","user_id"),
	CONSTRAINT "helpdesk_queue_members_role_check" CHECK ("helpdesk"."queue_members"."role" in ('manager','agent'))
);
--> statement-breakpoint
CREATE TABLE "helpdesk"."queues" (
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
ALTER TABLE "helpdesk"."categories" ADD CONSTRAINT "categories_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "helpdesk"."queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk"."queue_members" ADD CONSTRAINT "queue_members_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "helpdesk"."queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "helpdesk_categories_key_idx" ON "helpdesk"."categories" USING btree ("queue_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "helpdesk_queues_key_idx" ON "helpdesk"."queues" USING btree ("key");