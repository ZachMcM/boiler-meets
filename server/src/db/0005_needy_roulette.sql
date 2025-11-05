ALTER TABLE "user" ADD COLUMN "notifications" json DEFAULT '{"list":[]}'::json;
ALTER TABLE "user" ALTER COLUMN "notifications" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "notifications" SET DEFAULT '[]';