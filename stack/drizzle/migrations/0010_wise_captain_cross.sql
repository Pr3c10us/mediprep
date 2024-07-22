ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-07-22 14:37:26.082';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "profession" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "country" DROP NOT NULL;