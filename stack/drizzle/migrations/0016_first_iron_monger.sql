ALTER TABLE "question" DROP CONSTRAINT "question_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "question" DROP CONSTRAINT "question_exam_id_exam_id_fk";
--> statement-breakpoint
ALTER TABLE "question" DROP COLUMN IF EXISTS "course_id";--> statement-breakpoint
ALTER TABLE "question" DROP COLUMN IF EXISTS "exam_id";