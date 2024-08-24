ALTER TABLE "tests" DROP CONSTRAINT "tests_subject_id_subject_id_fk";
--> statement-breakpoint
ALTER TABLE "tests" DROP CONSTRAINT "tests_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-24 03:25:57.513';--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "subject_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "course_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" DROP COLUMN IF EXISTS "subject_id";--> statement-breakpoint
ALTER TABLE "tests" DROP COLUMN IF EXISTS "course_id";