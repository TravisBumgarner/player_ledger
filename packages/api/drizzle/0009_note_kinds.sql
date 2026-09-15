ALTER TABLE `session_notes` ADD `kind` text DEFAULT 'session' NOT NULL;--> statement-breakpoint
CREATE INDEX `session_notes_kind_idx` ON `session_notes` (`character_id`,`kind`,`created_at`);