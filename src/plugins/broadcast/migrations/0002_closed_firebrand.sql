CREATE TABLE "broadcast"."agendas" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_seconds" integer DEFAULT 20 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broadcast"."alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "broadcast"."layers" DROP CONSTRAINT "broadcast_layers_type_check";--> statement-breakpoint
ALTER TABLE "broadcast"."agenda_events" ADD COLUMN "agenda_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcast"."agenda_events" ADD CONSTRAINT "agenda_events_agenda_id_agendas_id_fk" FOREIGN KEY ("agenda_id") REFERENCES "broadcast"."agendas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast"."layers" ADD CONSTRAINT "broadcast_layers_type_check" CHECK ("broadcast"."layers"."type" in ('video','text','image','info','news','agenda','alert'));