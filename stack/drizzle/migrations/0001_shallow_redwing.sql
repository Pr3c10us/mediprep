ALTER TABLE "test_question_records" ALTER COLUMN "test_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "test_question_records" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-13 15:55:04.408';