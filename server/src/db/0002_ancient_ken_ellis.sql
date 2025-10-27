CREATE TYPE "public"."report_investigation_severity" AS ENUM('none', 'low', 'medium', 'high', 'ban');--> statement-breakpoint
CREATE TABLE "report_investigations" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"bot_comments" text NOT NULL,
	"severity" "report_investigation_severity" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report" ALTER COLUMN "incoming_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "report" ALTER COLUMN "outgoing_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "report_investigations" ADD CONSTRAINT "report_investigations_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;