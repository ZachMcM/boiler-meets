CREATE TABLE "profile_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile_owner_id" text NOT NULL,
	"target_id" text NOT NULL,
	"target_type" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_reactions" ADD CONSTRAINT "profile_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_reactions" ADD CONSTRAINT "profile_reactions_profile_owner_id_user_id_fk" FOREIGN KEY ("profile_owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;