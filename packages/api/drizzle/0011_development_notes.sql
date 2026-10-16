-- Character development becomes a note kind. The old single document carries over as its first note;
-- character_development is left in place so nothing is lost if this needs revisiting.
INSERT INTO `session_notes` (`id`, `character_id`, `kind`, `date`, `body`, `created_at`)
SELECT
	lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6))),
	`character_id`,
	'development',
	date(`updated_at` / 1000, 'unixepoch'),
	`body`,
	`updated_at`
FROM `character_development`
WHERE json_array_length(`body`, '$.content') > 0;
