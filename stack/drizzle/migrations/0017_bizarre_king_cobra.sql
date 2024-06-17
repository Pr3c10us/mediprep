CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid DEFAULT gen_random_uuid(),
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"email" varchar(64) NOT NULL,
	"password" varchar(256) NOT NULL,
	"profession" varchar(64) NOT NULL,
	"country" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
