CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"first" uuid NOT NULL,
	"second" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "matches" ALTER COLUMN "first" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "second" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_first_user_id_fk" FOREIGN KEY ("first") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_second_user_id_fk" FOREIGN KEY ("second") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;