CREATE TYPE "public"."gender_types" AS ENUM('male', 'female');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" "gender_types" DEFAULT 'male' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferrence" "gender_types" DEFAULT 'female' NOT NULL;