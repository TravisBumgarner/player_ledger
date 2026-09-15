CREATE TABLE `character_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`kind` text NOT NULL,
	`subject_character_id` text,
	`name` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '{"type":"doc"}' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `character_profiles_character_idx` ON `character_profiles` (`character_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_profiles_subject_idx` ON `character_profiles` (`character_id`,`subject_character_id`);