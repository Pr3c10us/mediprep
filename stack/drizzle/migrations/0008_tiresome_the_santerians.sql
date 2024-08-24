ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-24 02:51:32.965';--> statement-breakpoint
ALTER TABLE "exam" ADD COLUMN "average_mock_score" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam" ADD COLUMN "mock_tes_time" integer DEFAULT 60 NOT NULL;