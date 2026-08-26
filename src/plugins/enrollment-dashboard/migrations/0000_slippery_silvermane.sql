CREATE SCHEMA "enrollment_dashboard";
--> statement-breakpoint
CREATE TABLE "enrollment_dashboard"."institutions" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"logo_media_id" text,
	"program_label" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollment_dashboard"."programs" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"group_label" text,
	"goal" integer DEFAULT 0 NOT NULL,
	"renewed" integer DEFAULT 0 NOT NULL,
	"new_enrollments" integer DEFAULT 0 NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enrollment_dashboard"."programs" ADD CONSTRAINT "programs_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "enrollment_dashboard"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "institutions_key_idx" ON "enrollment_dashboard"."institutions" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "programs_institution_key_idx" ON "enrollment_dashboard"."programs" USING btree ("institution_id","key");