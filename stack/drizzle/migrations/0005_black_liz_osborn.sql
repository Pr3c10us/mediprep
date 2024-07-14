ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-14 01:44:59.471';--> statement-breakpoint
ALTER TABLE "test_question_records" ADD COLUMN "options" text[] DEFAULT '{}'::text[];