CREATE TABLE "helpdesk"."ticket_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"event_id" text,
	"media_id" text NOT NULL,
	"uploaded_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helpdesk"."ticket_counters" (
	"queue_id" text PRIMARY KEY NOT NULL,
	"next_seq" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "helpdesk"."ticket_events" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"kind" text NOT NULL,
	"author_user_id" text,
	"author_label" text,
	"visibility" text DEFAULT 'public' NOT NULL,
	"body" text,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "helpdesk_ticket_events_kind_check" CHECK ("helpdesk"."ticket_events"."kind" in ('created','comment','status_change','assignment','priority_change','queue_transfer','category_change','reopened','rating')),
	CONSTRAINT "helpdesk_ticket_events_visibility_check" CHECK ("helpdesk"."ticket_events"."visibility" in ('public','internal'))
);
--> statement-breakpoint
CREATE TABLE "helpdesk"."tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"queue_id" text NOT NULL,
	"category_id" text,
	"seq" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"assignee_user_id" text,
	"requester_user_id" text,
	"location" text,
	"first_response_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "helpdesk_tickets_status_check" CHECK ("helpdesk"."tickets"."status" in ('open','in_progress','waiting','resolved','closed','cancelled')),
	CONSTRAINT "helpdesk_tickets_priority_check" CHECK ("helpdesk"."tickets"."priority" in ('low','normal','high','urgent'))
);
--> statement-breakpoint
ALTER TABLE "helpdesk"."ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "helpdesk"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk"."ticket_attachments" ADD CONSTRAINT "ticket_attachments_event_id_ticket_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "helpdesk"."ticket_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk"."ticket_counters" ADD CONSTRAINT "ticket_counters_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "helpdesk"."queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk"."ticket_events" ADD CONSTRAINT "ticket_events_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "helpdesk"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD CONSTRAINT "tickets_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "helpdesk"."queues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD CONSTRAINT "tickets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "helpdesk"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "helpdesk_ticket_attachments_ticket_idx" ON "helpdesk"."ticket_attachments" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "helpdesk_ticket_events_ticket_idx" ON "helpdesk"."ticket_events" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "helpdesk_tickets_queue_seq_idx" ON "helpdesk"."tickets" USING btree ("queue_id","seq");--> statement-breakpoint
CREATE INDEX "helpdesk_tickets_queue_status_idx" ON "helpdesk"."tickets" USING btree ("queue_id","status");--> statement-breakpoint
CREATE INDEX "helpdesk_tickets_requester_idx" ON "helpdesk"."tickets" USING btree ("requester_user_id");--> statement-breakpoint
CREATE INDEX "helpdesk_tickets_assignee_idx" ON "helpdesk"."tickets" USING btree ("assignee_user_id");