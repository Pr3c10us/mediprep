CREATE TABLE IF NOT EXISTS "admin" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(32),
	"email" varchar(256),
	"password" varchar(256),
	"roles" varchar(32)[] DEFAULT ARRAY['viewer']::varchar(32)[] NOT NULL,
	"exam_access" varchar(32)[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exam" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(32),
	"description" text NOT NULL,
	"image_url" varchar(128),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "exam_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exam_access" (
	"admin_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	CONSTRAINT "exam_access_admin_id_exam_id_pk" PRIMARY KEY("admin_id","exam_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exam_access" ADD CONSTRAINT "exam_access_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exam_access" ADD CONSTRAINT "exam_access_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
