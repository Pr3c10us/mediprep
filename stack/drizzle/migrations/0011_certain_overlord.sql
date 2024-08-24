ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-24 04:11:17.388';--> statement-breakpoint
ALTER TABLE "user_report_question_records" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_tag_question_records" ADD COLUMN "created_at" timestamp DEFAULT now();