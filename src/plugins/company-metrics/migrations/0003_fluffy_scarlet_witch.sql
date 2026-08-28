CREATE TABLE "company_metrics"."tv_boards" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_metrics"."tv_screens" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"kind" text NOT NULL,
	"sector_id" text,
	"target_id" text,
	"dwell_seconds" integer DEFAULT 20 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "company_metrics_tv_screens_kind_check" CHECK ("company_metrics"."tv_screens"."kind" in ('overview','sector_kpis','target_board'))
);
--> statement-breakpoint
ALTER TABLE "company_metrics"."tv_screens" ADD CONSTRAINT "tv_screens_board_id_tv_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "company_metrics"."tv_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."tv_screens" ADD CONSTRAINT "tv_screens_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "company_metrics"."sectors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."tv_screens" ADD CONSTRAINT "tv_screens_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "company_metrics"."targets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "company_metrics_tv_boards_token_idx" ON "company_metrics"."tv_boards" USING btree ("token");