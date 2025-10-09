ALTER TABLE "user" ALTER COLUMN "profile" SET DATA TYPE json USING profile::json;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "profile" SET DEFAULT '{}'::json;