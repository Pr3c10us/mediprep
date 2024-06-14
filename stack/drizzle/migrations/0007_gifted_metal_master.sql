ALTER TABLE "question" RENAME COLUMN "image_url" TO "question_image_url";--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "explanation_image_url" varchar(128);