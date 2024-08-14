ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-13 21:57:56.867';--> statement-breakpoint
ALTER TABLE "discounts" ADD COLUMN "month" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "discounts" DROP COLUMN IF EXISTS "min_month";--> statement-breakpoint
ALTER TABLE "discounts" DROP COLUMN IF EXISTS "max_month";