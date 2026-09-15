CREATE TABLE `character_development` (
	`character_id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
