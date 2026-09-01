CREATE TABLE "helpdesk"."sla_policies" (
	"queue_id" text NOT NULL,
	"priority" text NOT NULL,
	"first_response_minutes" integer NOT NULL,
	"resolution_minutes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sla_policies_queue_id_priority_pk" PRIMARY KEY("queue_id","priority"),
	CONSTRAINT "helpdesk_sla_policies_priority_check" CHECK ("helpdesk"."sla_policies"."priority" in ('low','normal','high','urgent'))
);
--> statement-breakpoint
ALTER TABLE "helpdesk"."categories" ADD COLUMN "default_priority" text;--> statement-breakpoint
ALTER TABLE "helpdesk"."queues" ADD COLUMN "default_priority" text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD COLUMN "sla_due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "helpdesk"."sla_policies" ADD CONSTRAINT "sla_policies_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "helpdesk"."queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk"."categories" ADD CONSTRAINT "helpdesk_categories_default_priority_check" CHECK ("helpdesk"."categories"."default_priority" is null or "helpdesk"."categories"."default_priority" in ('low','normal','high','urgent'));--> statement-breakpoint
ALTER TABLE "helpdesk"."queues" ADD CONSTRAINT "helpdesk_queues_default_priority_check" CHECK ("helpdesk"."queues"."default_priority" in ('low','normal','high','urgent'));