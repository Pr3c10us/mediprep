ALTER TABLE "question" ALTER COLUMN "type" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-13 18:45:41.040';--> statement-breakpoint
ALTER TABLE "test_question_records" ADD COLUMN "type" varchar(32) NOT NULL;