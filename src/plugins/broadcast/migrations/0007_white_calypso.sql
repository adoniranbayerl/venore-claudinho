CREATE TABLE "broadcast"."agenda_editors" (
	"agenda_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "agenda_editors_agenda_id_user_id_pk" PRIMARY KEY("agenda_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "broadcast"."output_editors" (
	"output_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "output_editors_output_id_user_id_pk" PRIMARY KEY("output_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "broadcast"."agenda_editors" ADD CONSTRAINT "agenda_editors_agenda_id_agendas_id_fk" FOREIGN KEY ("agenda_id") REFERENCES "broadcast"."agendas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast"."output_editors" ADD CONSTRAINT "output_editors_output_id_outputs_id_fk" FOREIGN KEY ("output_id") REFERENCES "broadcast"."outputs"("id") ON DELETE cascade ON UPDATE no action;