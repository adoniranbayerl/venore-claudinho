CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "rbac";
--> statement-breakpoint
CREATE SCHEMA "observability";
--> statement-breakpoint
ALTER TABLE "public"."users" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."accounts" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."sessions" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."verification_tokens" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."roles" SET SCHEMA "rbac";
--> statement-breakpoint
ALTER TABLE "public"."role_permissions" SET SCHEMA "rbac";
--> statement-breakpoint
ALTER TABLE "public"."user_roles" SET SCHEMA "rbac";
--> statement-breakpoint
ALTER TABLE "public"."observability_log_entries" SET SCHEMA "observability";
--> statement-breakpoint
ALTER TABLE "public"."observability_trace_entries" SET SCHEMA "observability";
