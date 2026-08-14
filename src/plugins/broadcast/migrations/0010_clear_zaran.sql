ALTER TABLE "broadcast"."agenda_events" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "broadcast"."outputs" ADD COLUMN "ticker_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcast"."outputs" ADD COLUMN "pin" text;