CREATE TABLE IF NOT EXISTS "option" (
	"index" integer NOT NULL,
	"value" text NOT NULL,
	"selected" integer NOT NULL,
	"answer" boolean DEFAULT false,
	CONSTRAINT "option_index_pk" PRIMARY KEY("index"),
	CONSTRAINT "option_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question" (
	"id" uuid DEFAULT gen_random_uuid(),
	"description" text NOT NULL,
	"question" text NOT NULL,
	"explanation" text NOT NULL,
	"subject_id" uuid,
	CONSTRAINT "question_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subject" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(128) NOT NULL,
	"exam_id" uuid,
	CONSTRAINT "subject_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "subject_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "admin" DROP COLUMN IF EXISTS "exam_access";