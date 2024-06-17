ALTER TABLE "admin" ALTER COLUMN "roles" SET DEFAULT ARRAY
        ['viewer']::varchar(32)[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp DEFAULT now();