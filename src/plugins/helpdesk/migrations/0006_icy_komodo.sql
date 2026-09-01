ALTER TABLE "helpdesk"."tickets" ADD COLUMN "reopened_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD COLUMN "rating_score" integer;--> statement-breakpoint
ALTER TABLE "helpdesk"."tickets" ADD CONSTRAINT "helpdesk_tickets_rating_score_check" CHECK ("helpdesk"."tickets"."rating_score" is null or "helpdesk"."tickets"."rating_score" between 1 and 5);