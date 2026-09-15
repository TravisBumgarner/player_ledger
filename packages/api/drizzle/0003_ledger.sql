CREATE TABLE `brewing_states` (
	`character_id` text PRIMARY KEY NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`exp` integer DEFAULT 0 NOT NULL,
	`exp_at_level` integer DEFAULT 0 NOT NULL,
	`exp_to_next` integer DEFAULT 100 NOT NULL,
	`brew_name` text,
	`brew_rarity` text,
	`brew_hours_logged` integer DEFAULT 0 NOT NULL,
	`brew_hours_total` integer DEFAULT 0 NOT NULL,
	`brew_gold` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`text` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `goals_character_idx` ON `goals` (`character_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`name` text NOT NULL,
	`rarity` text NOT NULL,
	`qty` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ingredients_character_idx` ON `ingredients` (`character_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`qty_tag` text DEFAULT '' NOT NULL,
	`tracked_dnd_beyond` integer DEFAULT false NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`remaining` integer DEFAULT 0 NOT NULL,
	`reset_on` text DEFAULT 'none' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inventory_items_character_idx` ON `inventory_items` (`character_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `inventory_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inventory_notes_item_idx` ON `inventory_notes` (`item_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`name` text NOT NULL,
	`rarity` text NOT NULL,
	`known` integer DEFAULT false NOT NULL,
	`ingredients` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `recipes_character_idx` ON `recipes` (`character_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `rest_states` (
	`character_id` text PRIMARY KEY NOT NULL,
	`short_rests` integer DEFAULT 0 NOT NULL,
	`long_rests` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`date` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `session_notes_character_idx` ON `session_notes` (`character_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `spells` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`name` text NOT NULL,
	`level` integer DEFAULT 0 NOT NULL,
	`school` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`prepared` integer DEFAULT false NOT NULL,
	`slots_total` integer DEFAULT 0 NOT NULL,
	`slots_used` integer DEFAULT 0 NOT NULL,
	`reset_on` text DEFAULT 'long' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `spells_character_idx` ON `spells` (`character_id`,`created_at`);