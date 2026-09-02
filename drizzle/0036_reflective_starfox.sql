CREATE SCHEMA "web_push";
--> statement-breakpoint
CREATE TABLE "web_push"."push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "web_push"."push_subscriptions" USING btree ("endpoint");