CREATE TABLE "company_metrics"."target_inputs" (
	"target_id" text NOT NULL,
	"definition_id" text NOT NULL,
	"weight" double precision DEFAULT 1 NOT NULL,
	"classification" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "target_inputs_target_id_definition_id_pk" PRIMARY KEY("target_id","definition_id"),
	CONSTRAINT "company_metrics_target_inputs_classification_check" CHECK ("company_metrics"."target_inputs"."classification" in ('realized','at_risk','projected','subtract'))
);
--> statement-breakpoint
CREATE TABLE "company_metrics"."targets" (
	"id" text PRIMARY KEY NOT NULL,
	"sector_id" text NOT NULL,
	"group_id" text,
	"label" text NOT NULL,
	"description" text,
	"target_value" double precision NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"on_track_threshold" double precision DEFAULT 0.85 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_metrics"."target_inputs" ADD CONSTRAINT "target_inputs_target_id_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "company_metrics"."targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."target_inputs" ADD CONSTRAINT "target_inputs_definition_id_metric_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "company_metrics"."metric_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."targets" ADD CONSTRAINT "targets_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "company_metrics"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_metrics"."targets" ADD CONSTRAINT "targets_group_id_sector_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "company_metrics"."sector_groups"("id") ON DELETE set null ON UPDATE no action;