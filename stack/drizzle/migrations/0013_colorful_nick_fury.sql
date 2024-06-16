CREATE TABLE IF NOT EXISTS "option" (
	"id" uuid DEFAULT gen_random_uuid(),
	"index" integer NOT NULL,
	"value" text NOT NULL,
	"selected" integer DEFAULT 0,
	"answer" boolean DEFAULT false,
	"explanation" text,
	"question_id" uuid,
	CONSTRAINT "option_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "option_value_unique" UNIQUE("value")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "option" ADD CONSTRAINT "option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
