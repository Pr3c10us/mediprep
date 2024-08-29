ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-29 00:49:27.829';--> statement-breakpoint
ALTER TABLE "user_report_question_records" ADD COLUMN "exam_id" uuid;--> statement-breakpoint
ALTER TABLE "user_tag_question_records" ADD COLUMN "exam_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_report_question_records" ADD CONSTRAINT "user_report_question_records_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tag_question_records" ADD CONSTRAINT "user_tag_question_records_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "option" DROP COLUMN IF EXISTS "explanation";--> statement-breakpoint
ALTER TABLE "question" DROP COLUMN IF EXISTS "question_image_url";--> statement-breakpoint
ALTER TABLE "question" DROP COLUMN IF EXISTS "explanation_image_url";