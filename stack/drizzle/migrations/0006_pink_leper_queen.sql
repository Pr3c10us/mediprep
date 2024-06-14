CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(128) NOT NULL,
	"exam_id" uuid,
	CONSTRAINT "courses_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "courses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "image_url" varchar(128);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
