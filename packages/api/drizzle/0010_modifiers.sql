CREATE TABLE `modifiers` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `modifiers_character_idx` ON `modifiers` (`character_id`,`created_at`);