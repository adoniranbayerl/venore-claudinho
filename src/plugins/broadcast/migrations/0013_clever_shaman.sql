CREATE TABLE "broadcast"."playlist_editors" (
	"playlist_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "playlist_editors_playlist_id_user_id_pk" PRIMARY KEY("playlist_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "broadcast"."playlist_editors" ADD CONSTRAINT "playlist_editors_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "broadcast"."playlists"("id") ON DELETE cascade ON UPDATE no action;