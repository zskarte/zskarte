CREATE TYPE "public"."access_type" AS ENUM('read', 'write', 'all');--> statement-breakpoint
CREATE TYPE "public"."journal_entry_department" AS ENUM('politische-behoerde', 'chef-fuehrungsorgan', 'stabschef', 'fb-lage', 'fb-information', 'fb-oeffentliche-sicherheit', 'fb-schutz-rettung', 'fb-gesundheit', 'fb-logistik', 'fb-infrastrukturen');--> statement-breakpoint
CREATE TYPE "public"."journal_entry_status" AS ENUM('awaiting_message', 'awaiting_triage', 'awaiting_decision', 'awaiting_completion', 'completed');--> statement-breakpoint
CREATE TYPE "public"."map_layer_type" AS ENUM('wms', 'wms_custom', 'wmts', 'aggregate', 'geojson', 'shape', 'csv');--> statement-breakpoint
CREATE TYPE "public"."operation_phase" AS ENUM('active', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."organization_default_locale" AS ENUM('de-CH', 'fr-CH', 'it-CH', 'en-US');--> statement-breakpoint
CREATE TYPE "public"."signing_key_type" AS ENUM('rsa', 'ed25519');--> statement-breakpoint
CREATE TYPE "public"."wms_source_type" AS ENUM('wms', 'wmts');--> statement-breakpoint
CREATE TABLE "accesses" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_token" text NOT NULL,
	"type" "access_type" DEFAULT 'read' NOT NULL,
	"name" text,
	"active" boolean DEFAULT true NOT NULL,
	"expires_on" timestamp with time zone,
	"operation_id" uuid,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accesses_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"alternative_text" text,
	"caption" text,
	"width" integer,
	"height" integer,
	"formats" jsonb,
	"hash" text NOT NULL,
	"ext" text,
	"mime" text NOT NULL,
	"size" double precision,
	"url" text NOT NULL,
	"preview_url" text,
	"provider" text NOT NULL,
	"provider_metadata" jsonb,
	"folder_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation_id" uuid,
	"organization_id" uuid,
	"message_number" integer NOT NULL,
	"sender" text,
	"creator" text,
	"communication_type" text,
	"communication_details" text,
	"message_subject" text,
	"message_content" text,
	"visum_message" text,
	"is_key_message" boolean,
	"date_message" timestamp with time zone,
	"visum_triage" text,
	"date_triage" timestamp with time zone,
	"decision" text,
	"date_decision" timestamp with time zone,
	"date_decision_delivered" timestamp with time zone,
	"visum_decider" text,
	"decision_receiver" text,
	"decision_sender" text,
	"entry_status" "journal_entry_status",
	"department" "journal_entry_department",
	"is_drawn_on_map" boolean DEFAULT false NOT NULL,
	"is_drawing_on_map" boolean DEFAULT false NOT NULL,
	"wrong_content_info" text,
	"wrong_triage_info" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entries_number_unique" UNIQUE("operation_id","organization_id","message_number")
);
--> statement-breakpoint
CREATE TABLE "map_layer_generation_config" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"allways_create_district" boolean DEFAULT false NOT NULL,
	"cantons" text DEFAULT 'AG,AI,AR,BE,BL,BS,FR,GE,GL,GR,JU,LU,NE,NW,OW,SG,SH,SO,SZ,TG,TI,UR,VD,VS,ZG,ZH' NOT NULL,
	"url_madd" text DEFAULT 'https://public.madd.bfs.admin.ch/${canton}.zip' NOT NULL,
	"style_entrances_id" uuid,
	"url_swiss_boundaries_3d" text DEFAULT 'https://data.geo.admin.ch/ch.swisstopo.swissboundaries3d/swissboundaries3d_${year}-${month}/swissboundaries3d_${year}-${month}_2056_5728.shp.zip' NOT NULL,
	"style_swiss_boundaries_3d_id" uuid,
	"url_swiss_names_3d" text DEFAULT 'https://data.geo.admin.ch/ch.swisstopo.swissnames3d/swissnames3d_${year}/swissnames3d_${year}_2056.csv.zip' NOT NULL,
	"style_swiss_names_3d_id" uuid,
	"fields_swiss_names_3d" text DEFAULT 'OBJEKTART,OBJEKTKLASSE_TLM,EINWOHNERKATEGORIE,NAME,E,N' NOT NULL,
	"file_swiss_names_3d" text DEFAULT 'swissNAMES3D_PLY' NOT NULL,
	"last_start_date" timestamp with time zone,
	"last_end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_layers" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text,
	"server_layer_name" text,
	"type" "map_layer_type",
	"wms_source_id" uuid,
	"custom_source" text,
	"media_source_id" uuid,
	"options" jsonb,
	"public" boolean,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_map_layer_favorites" (
	"organization_id" uuid NOT NULL,
	"map_layer_id" uuid NOT NULL,
	CONSTRAINT "organization_map_layer_favorites_organization_id_map_layer_id_pk" PRIMARY KEY("organization_id","map_layer_id")
);
--> statement-breakpoint
CREATE TABLE "map_snapshots" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation_id" uuid,
	"map_state" jsonb,
	"changeset_ids" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"organization_id" uuid,
	"map_state" jsonb,
	"changesets" jsonb,
	"changeset_signs" jsonb,
	"signing_key_ids" jsonb,
	"event_states" jsonb,
	"map_layers" jsonb,
	"phase" "operation_phase" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"map_longitude" double precision DEFAULT 7.44297 NOT NULL,
	"map_latitude" double precision DEFAULT 46.94635 NOT NULL,
	"map_zoom_level" double precision DEFAULT 16 NOT NULL,
	"default_locale" "organization_default_locale" DEFAULT 'de-CH' NOT NULL,
	"url" text,
	"logo_id" uuid,
	"journal_entry_template" jsonb,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signing_keys" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_id" text NOT NULL,
	"server_id" text NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone,
	"key_type" "signing_key_type" DEFAULT 'ed25519' NOT NULL,
	"private_key_encrypted" text,
	"public_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signing_keys_key_id_unique" UNIQUE("key_id")
);
--> statement-breakpoint
CREATE TABLE "organization_wms_sources" (
	"organization_id" uuid NOT NULL,
	"wms_source_id" uuid NOT NULL,
	CONSTRAINT "organization_wms_sources_organization_id_wms_source_id_pk" PRIMARY KEY("organization_id","wms_source_id")
);
--> statement-breakpoint
CREATE TABLE "wms_sources" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text,
	"type" "wms_source_type",
	"url" text,
	"attribution" jsonb,
	"public" boolean,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"issuer" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role" text NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_permission_pk" PRIMARY KEY("role","permission")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"operation_id" uuid,
	"organization_id" uuid,
	"permission" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"zs_role" text DEFAULT 'public' NOT NULL,
	"username" text
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accesses" ADD CONSTRAINT "accesses_operation_id_operations_document_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accesses" ADD CONSTRAINT "accesses_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_operation_id_operations_document_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_layer_generation_config" ADD CONSTRAINT "map_layer_generation_config_style_entrances_id_files_document_id_fk" FOREIGN KEY ("style_entrances_id") REFERENCES "public"."files"("document_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_layer_generation_config" ADD CONSTRAINT "map_layer_generation_config_style_swiss_boundaries_3d_id_files_document_id_fk" FOREIGN KEY ("style_swiss_boundaries_3d_id") REFERENCES "public"."files"("document_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_layer_generation_config" ADD CONSTRAINT "map_layer_generation_config_style_swiss_names_3d_id_files_document_id_fk" FOREIGN KEY ("style_swiss_names_3d_id") REFERENCES "public"."files"("document_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_layers" ADD CONSTRAINT "map_layers_wms_source_id_wms_sources_document_id_fk" FOREIGN KEY ("wms_source_id") REFERENCES "public"."wms_sources"("document_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_layers" ADD CONSTRAINT "map_layers_media_source_id_files_document_id_fk" FOREIGN KEY ("media_source_id") REFERENCES "public"."files"("document_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_layers" ADD CONSTRAINT "map_layers_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_map_layer_favorites" ADD CONSTRAINT "organization_map_layer_favorites_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_map_layer_favorites" ADD CONSTRAINT "organization_map_layer_favorites_map_layer_id_map_layers_document_id_fk" FOREIGN KEY ("map_layer_id") REFERENCES "public"."map_layers"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_snapshots" ADD CONSTRAINT "map_snapshots_operation_id_operations_document_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations" ADD CONSTRAINT "operations_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_id_files_document_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."files"("document_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_wms_sources" ADD CONSTRAINT "organization_wms_sources_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_wms_sources" ADD CONSTRAINT "organization_wms_sources_wms_source_id_wms_sources_document_id_fk" FOREIGN KEY ("wms_source_id") REFERENCES "public"."wms_sources"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wms_sources" ADD CONSTRAINT "wms_sources_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_organization_id_organizations_document_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("document_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accesses_operation_id_idx" ON "accesses" USING btree ("operation_id");--> statement-breakpoint
CREATE INDEX "journal_entries_operation_id_idx" ON "journal_entries" USING btree ("operation_id");--> statement-breakpoint
CREATE INDEX "map_snapshots_operation_id_idx" ON "map_snapshots" USING btree ("operation_id","created_at");--> statement-breakpoint
CREATE INDEX "operations_organization_id_idx" ON "operations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "operations_phase_idx" ON "operations" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "signing_keys_server_id_idx" ON "signing_keys" USING btree ("server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_account_id_unique" ON "account" USING btree ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_unique" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_unique" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");