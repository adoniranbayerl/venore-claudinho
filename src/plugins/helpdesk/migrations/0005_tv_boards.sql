CREATE TABLE "helpdesk"."boards" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"label" text NOT NULL,
	"queue_id" text,
	"layout" text DEFAULT 'kanban' NOT NULL,
	"show_assignee" boolean DEFAULT true NOT NULL,
	"refresh_seconds" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "helpdesk_boards_layout_check" CHECK ("helpdesk"."boards"."layout" in ('kanban','open_list'))
);
--> statement-breakpoint
ALTER TABLE "helpdesk"."boards" ADD CONSTRAINT "boards_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "helpdesk"."queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "helpdesk_boards_token_idx" ON "helpdesk"."boards" USING btree ("token");