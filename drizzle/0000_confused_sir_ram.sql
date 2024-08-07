CREATE TABLE IF NOT EXISTS "fmgr_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "fmgr_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fmgr_file" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone,
	"name" varchar(256),
	"url" varchar(256),
	"file_type" varchar(256),
	"created_by" varchar(255),
	"folder_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fmgr_folder" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"modification" jsonb[],
	"created_by" varchar(255),
	"parent_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fmgr_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fmgr_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fmgr_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "fmgr_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmgr_account" ADD CONSTRAINT "fmgr_account_user_id_fmgr_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."fmgr_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmgr_file" ADD CONSTRAINT "fmgr_file_created_by_fmgr_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."fmgr_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmgr_file" ADD CONSTRAINT "fmgr_file_folder_id_fmgr_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."fmgr_folder"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmgr_folder" ADD CONSTRAINT "fmgr_folder_created_by_fmgr_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."fmgr_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fmgr_session" ADD CONSTRAINT "fmgr_session_user_id_fmgr_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."fmgr_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "fmgr_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parent_id_idx" ON "fmgr_folder" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "fmgr_session" USING btree ("user_id");