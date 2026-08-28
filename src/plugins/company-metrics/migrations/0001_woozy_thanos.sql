CREATE TABLE "company_metrics"."metric_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"sector_id" text NOT NULL,
	"group_id" text,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"unit" text NOT NULL,
	"aggregation" text NOT NULL,
	"granularity" text NOT NULL,
	"direction" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_metrics_metric_definitions_unit_check" CHECK ("company_metrics"."metric_definitions"."unit" in ('count','currency_brl','percent','days')),
	CONSTRAINT "company_metrics_metric_definitions_aggregation_check" CHECK ("company_metrics"."metric_definitions"."aggregation" in ('sum','last','average')),
	CONSTRAINT "company_metrics_metric_definitions_granularity_check" CHECK ("company_metrics"."metric_definitions"."granularity" in ('daily','weekly','monthly')),
	CONSTRAINT "company_metrics_metric_definitions_direction_check" CHECK ("company_metrics"."metric_definitions"."direction" in ('up_good','down_good'))
);
--> statement-breakpoint
CREATE TABLE "company_metrics"."metric_values" (
	"id" text PRIMARY KEY NOT NULL,
	"definition_id" text NOT NULL,
	"period_start" date NOT NULL,
	"value" double precision NOT NULL,
	"note" text,
	"entered_by_user_id" text,
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_metrics"."metric_definitions" ADD CONSTRAINT "metric_definitions_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "company_metrics"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."metric_definitions" ADD CONSTRAINT "metric_definitions_group_id_sector_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "company_metrics"."sector_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."metric_values" ADD CONSTRAINT "metric_values_definition_id_metric_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "company_metrics"."metric_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "company_metrics_metric_definitions_key_idx" ON "company_metrics"."metric_definitions" USING btree ("sector_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "company_metrics_metric_values_period_idx" ON "company_metrics"."metric_values" USING btree ("definition_id","period_start");