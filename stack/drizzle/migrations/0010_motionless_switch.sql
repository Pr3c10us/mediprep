ALTER TABLE "exam" RENAME COLUMN "average_mock_score" TO "total_mock_score";--> statement-breakpoint
ALTER TABLE "exam" RENAME COLUMN "mock_tes_time" TO "mock_test_time";--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-24 03:50:46.494';--> statement-breakpoint
ALTER TABLE "exam" ADD COLUMN "mock_taken" integer DEFAULT 0 NOT NULL;