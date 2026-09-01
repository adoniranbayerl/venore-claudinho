CREATE TABLE "helpdesk"."kiosks" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"label" text NOT NULL,
	"queue_id" text,
	"default_location" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD COLUMN "requester_name" text;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD COLUMN "requester_contact" text;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD COLUMN "origin_kiosk_id" text;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD COLUMN "tracking_token" text;--> statement-breakpoint
ALTER TABLE "helpdesk"."kiosks" ADD CONSTRAINT "kiosks_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "helpdesk"."queues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "helpdesk_kiosks_token_idx" ON "helpdesk"."kiosks" USING btree ("token");--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD CONSTRAINT "tickets_origin_kiosk_id_kiosks_id_fk" FOREIGN KEY ("origin_kiosk_id") REFERENCES "helpdesk"."kiosks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "helpdesk_tickets_tracking_token_idx" ON "helpdesk"."tickets" USING btree ("tracking_token");