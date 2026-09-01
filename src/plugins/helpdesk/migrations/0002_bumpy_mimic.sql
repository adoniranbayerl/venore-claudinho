CREATE TABLE "helpdesk"."helpdesk_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_user_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"kind" text NOT NULL,
	"summary" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "helpdesk_notifications_kind_check" CHECK ("helpdesk"."helpdesk_notifications"."kind" in ('new_ticket','assigned_to_you','comment_added','needs_info','status_changed','resolved','reopened','sla_at_risk','rating_received'))
);
--> statement-breakpoint
ALTER TABLE "helpdesk"."helpdesk_notifications" ADD CONSTRAINT "helpdesk_notifications_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "helpdesk"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "helpdesk_notifications_recipient_idx" ON "helpdesk"."helpdesk_notifications" USING btree ("recipient_user_id","read_at","created_at" DESC NULLS LAST);