CREATE TABLE "broadcast"."output_agendas" (
	"output_id" text NOT NULL,
	"agenda_id" text NOT NULL,
	CONSTRAINT "output_agendas_output_id_agenda_id_pk" PRIMARY KEY("output_id","agenda_id")
);
--> statement-breakpoint
ALTER TABLE "broadcast"."outputs" ADD COLUMN "footer_open" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcast"."output_agendas" ADD CONSTRAINT "output_agendas_output_id_outputs_id_fk" FOREIGN KEY ("output_id") REFERENCES "broadcast"."outputs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast"."output_agendas" ADD CONSTRAINT "output_agendas_agenda_id_agendas_id_fk" FOREIGN KEY ("agenda_id") REFERENCES "broadcast"."agendas"("id") ON DELETE cascade ON UPDATE no action;