CREATE TABLE IF NOT EXISTS "user_report_question_records" (
	"id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"reason" text NOT NULL,
	CONSTRAINT "user_report_question_records_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_tag_question_records" (
	"id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	CONSTRAINT "user_tag_question_records_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-20 12:34:56.652';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_report_question_records" ADD CONSTRAINT "user_report_question_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_report_question_records" ADD CONSTRAINT "user_report_question_records_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tag_question_records" ADD CONSTRAINT "user_tag_question_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tag_question_records" ADD CONSTRAINT "user_tag_question_records_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
