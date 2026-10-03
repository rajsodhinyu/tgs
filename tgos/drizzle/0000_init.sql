CREATE SCHEMA IF NOT EXISTS "tgos";
--> statement-breakpoint
CREATE TYPE "tgos"."request_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TABLE "tgos"."access_requests" (
	"phone" text PRIMARY KEY NOT NULL,
	"name" text,
	"status" "tgos"."request_status" DEFAULT 'pending' NOT NULL,
	"first_verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verify_count" integer DEFAULT 1 NOT NULL,
	"decided_at" timestamp with time zone,
	"decided_by" text
);
--> statement-breakpoint
CREATE TABLE "tgos"."code_sends" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"ip" text NOT NULL,
	"member" boolean NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tgos"."login_failures" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"failed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tgos"."members" (
	"phone" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by" text
);
--> statement-breakpoint
CREATE INDEX "code_sends_sent_at_idx" ON "tgos"."code_sends" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "login_failures_phone_idx" ON "tgos"."login_failures" USING btree ("phone","failed_at");