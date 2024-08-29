ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-29 02:20:38.405';--> statement-breakpoint
ALTER TABLE "test_question_records" ADD COLUMN "created_at" timestamp DEFAULT now();