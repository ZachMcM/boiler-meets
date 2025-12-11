CREATE TABLE "recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"recommender_id" text NOT NULL,
	"recommended_user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "font" text DEFAULT 'sans' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reaction" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_edited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "edited_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "original_content" text;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommender_id_user_id_fk" FOREIGN KEY ("recommender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommended_user_id_user_id_fk" FOREIGN KEY ("recommended_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;