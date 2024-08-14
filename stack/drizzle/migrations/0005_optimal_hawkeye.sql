CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" uuid DEFAULT gen_random_uuid(),
	"months" integer DEFAULT 0,
	"price" numeric DEFAULT '0.0',
	"exam_id" uuid NOT NULL,
	"cart_id" uuid,
	CONSTRAINT "cart_items_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" uuid DEFAULT gen_random_uuid(),
	"total_price" numeric DEFAULT '0.0',
	"user_id" uuid,
	CONSTRAINT "carts_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2024-08-14 11:24:59.413';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
