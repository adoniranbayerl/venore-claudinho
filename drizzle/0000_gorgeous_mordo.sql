CREATE TABLE "observability_log_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"use_case" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"kind" text NOT NULL,
	"success" boolean NOT NULL,
	"error_code" text,
	"error_message" text,
	"duration_ms" integer NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observability_trace_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"use_case" text NOT NULL,
	"actor_id" text NOT NULL,
	"success" boolean NOT NULL,
	"duration_ms" integer NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
