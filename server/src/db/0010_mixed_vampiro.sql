ALTER TABLE "user" ADD COLUMN "nicknames" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "blockedUsers" json DEFAULT '[]'::json;