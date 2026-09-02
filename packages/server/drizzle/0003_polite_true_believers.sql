ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_uuid_unique";--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "is_drawn_on_map" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "is_drawn_on_map" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "is_drawing_on_map" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "is_drawing_on_map" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_entries" DROP COLUMN "uuid";