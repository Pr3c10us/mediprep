CREATE TABLE IF NOT EXISTS "question_batch" (
	"id" uuid DEFAULT gen_random_uuid(),
	"status" varchar(128) DEFAULT 'processing',
	"exam_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "question_batch_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "question_batch_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_batch" ADD CONSTRAINT "question_batch_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question" ADD CONSTRAINT "question_question_batch_id_question_batch_id_fk" FOREIGN KEY ("question_batch_id") REFERENCES "public"."question_batch"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
