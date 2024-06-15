ALTER TABLE "subject" DROP CONSTRAINT "subject_course_id_exam_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subject" ADD CONSTRAINT "subject_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
