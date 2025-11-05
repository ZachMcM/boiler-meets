CREATE TABLE "call_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"caller_user_id" text NOT NULL,
	"called_user_id" text NOT NULL,
	"call_type" text NOT NULL,
	"call_timestamp" timestamp DEFAULT now() NOT NULL,
	"call_duration" integer NOT NULL,
	"was_matched" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "notifications" SET DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_caller_user_id_user_id_fk" FOREIGN KEY ("caller_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_called_user_id_user_id_fk" FOREIGN KEY ("called_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;