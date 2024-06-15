ALTER TABLE "subject" RENAME COLUMN "exam_id" TO "course_id";--> statement-breakpoint
ALTER TABLE "subject" DROP CONSTRAINT "subject_exam_id_exam_id_fk";
--> statement-breakpoint
ALTER TABLE "exam" ALTER COLUMN "image_url" SET DATA TYPE varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subject" ADD CONSTRAINT "subject_course_id_exam_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
