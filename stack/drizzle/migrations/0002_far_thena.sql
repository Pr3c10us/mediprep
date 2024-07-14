ALTER TABLE "user_question_records" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_question_records" ALTER COLUMN "question_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "test_question_records" ALTER COLUMN "question_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "test_question_records" ALTER COLUMN "exam_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "type" SET DEFAULT 'mock';--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "question_mode" SET DEFAULT 'unused';--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-13 16:57:53.556';