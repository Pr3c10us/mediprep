ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-18 01:08:43.448';--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "status" varchar(32) DEFAULT 'inProgress' NOT NULL;