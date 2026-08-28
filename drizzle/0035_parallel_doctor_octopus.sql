CREATE TABLE "rbac"."role_assignment_scopes" (
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"scope_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_assignment_scopes_user_id_role_id_scope_type_resource_id_pk" PRIMARY KEY("user_id","role_id","scope_type","resource_id")
);
--> statement-breakpoint
ALTER TABLE "rbac"."role_assignment_scopes" ADD CONSTRAINT "role_assignment_scopes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac"."role_assignment_scopes" ADD CONSTRAINT "role_assignment_scopes_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "rbac"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac"."role_assignment_scopes" ADD CONSTRAINT "role_assignment_scopes_user_id_role_id_user_roles_user_id_role_id_fk" FOREIGN KEY ("user_id","role_id") REFERENCES "rbac"."user_roles"("user_id","role_id") ON DELETE cascade ON UPDATE no action;