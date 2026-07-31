CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE TABLE "observability"."observability_events" (
	"id" text PRIMARY KEY NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"level" text NOT NULL,
	"origin" text NOT NULL,
	"action" text NOT NULL,
	"actor_id" text,
	"actor_type" text,
	"outcome" text NOT NULL,
	"summary" text NOT NULL,
	"detail" jsonb,
	"error_code" text,
	"error_message" text,
	"duration_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit"."security_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"action" text NOT NULL,
	"actor_id" text,
	"actor_type" text,
	"outcome" text NOT NULL,
	"summary" text NOT NULL,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "observability_events_occurred_at_idx" ON "observability"."observability_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "observability_events_level_idx" ON "observability"."observability_events" USING btree ("level");--> statement-breakpoint
CREATE INDEX "observability_events_origin_idx" ON "observability"."observability_events" USING btree ("origin");--> statement-breakpoint
CREATE INDEX "observability_events_actor_id_idx" ON "observability"."observability_events" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "security_audit_events_occurred_at_idx" ON "audit"."security_audit_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "security_audit_events_actor_id_idx" ON "audit"."security_audit_events" USING btree ("actor_id");