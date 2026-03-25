CREATE TABLE "embeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hook_id" uuid NOT NULL,
	"format" jsonb,
	"data" jsonb
);
--> statement-breakpoint
ALTER TABLE "hooks" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "embeds" ADD CONSTRAINT "embeds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeds" ADD CONSTRAINT "embeds_hook_id_hooks_id_fk" FOREIGN KEY ("hook_id") REFERENCES "public"."hooks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hooks" DROP COLUMN "event";--> statement-breakpoint
ALTER TABLE "hooks" DROP COLUMN "data";