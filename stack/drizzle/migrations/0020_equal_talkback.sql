ALTER TABLE "question" ALTER COLUMN "free" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "exam" ADD COLUMN "subscription_amount" integer DEFAULT 0;