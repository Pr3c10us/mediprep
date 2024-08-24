CREATE TABLE IF NOT EXISTS "sale_items" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"months" integer DEFAULT 0 NOT NULL,
	"price" double precision DEFAULT 0,
	"exam_id" uuid NOT NULL,
	"sale_id" uuid NOT NULL,
	CONSTRAINT "sale_items_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "sale" DROP CONSTRAINT "sale_exam_id_exam_id_fk";
--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "amount" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-24 00:18:22.455';--> statement-breakpoint
ALTER TABLE "sale" ADD COLUMN "access_code" varchar(128);--> statement-breakpoint
ALTER TABLE "sale" ADD COLUMN "payment_gateway" varchar(128) DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sale"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "sale" DROP COLUMN IF EXISTS "expiry_date";--> statement-breakpoint
ALTER TABLE "sale" DROP COLUMN IF EXISTS "exam_id";