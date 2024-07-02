ALTER TABLE "subject" ADD COLUMN "exam_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subject" ADD CONSTRAINT "subject_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
