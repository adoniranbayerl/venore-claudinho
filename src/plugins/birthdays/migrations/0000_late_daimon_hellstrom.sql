CREATE SCHEMA "birthdays";
--> statement-breakpoint
CREATE TABLE "birthdays"."birthdays" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"role" text,
	"locality" text DEFAULT 'Matriz' NOT NULL,
	"month" integer NOT NULL,
	"day" integer NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "birthdays_month_check" CHECK ("birthdays"."birthdays"."month" between 1 and 12),
	CONSTRAINT "birthdays_day_check" CHECK ("birthdays"."birthdays"."day" between 1 and 31)
);
