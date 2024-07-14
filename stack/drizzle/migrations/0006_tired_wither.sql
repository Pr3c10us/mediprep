ALTER TABLE "test_question_records" ALTER COLUMN "options" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "test_question_records" ALTER COLUMN "options" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-14 02:07:30.892';