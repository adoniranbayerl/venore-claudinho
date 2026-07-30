CREATE TABLE "birthdays"."birthday_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"imported_by_user_id" text,
	"total_rows" integer NOT NULL,
	"inserted_rows" integer NOT NULL,
	"skipped_error_rows" integer NOT NULL,
	"skipped_duplicate_rows" integer NOT NULL,
	"included_duplicates" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
