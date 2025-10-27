CREATE TABLE "report" (
	"id" serial PRIMARY KEY NOT NULL,
	"incoming_user_id" text,
	"outgoing_user_id" text,
	"submission_details" text NOT NULL,
	"audio_file_url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_incoming_user_id_user_id_fk" FOREIGN KEY ("incoming_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_outgoing_user_id_user_id_fk" FOREIGN KEY ("outgoing_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;