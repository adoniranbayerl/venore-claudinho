CREATE SCHEMA "extensions";
--> statement-breakpoint
CREATE TABLE "extensions"."extension_state" (
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_user_id" text,
	CONSTRAINT "extension_state_kind_key_pk" PRIMARY KEY("kind","key")
);
--> statement-breakpoint
ALTER TABLE "extensions"."extension_state" ADD CONSTRAINT "extension_state_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;