ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-15 00:14:27.300';--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "time_left" integer DEFAULT 0 NOT NULL;