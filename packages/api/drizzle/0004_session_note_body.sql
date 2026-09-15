ALTER TABLE `session_notes` ADD `body` text DEFAULT '{"type":"doc"}' NOT NULL;--> statement-breakpoint
-- Backfill: each line of the old plain text becomes a paragraph, so existing notes keep their line breaks.
UPDATE `session_notes` SET `body` = (
	WITH RECURSIVE split(n, line, rest) AS (
		SELECT 0, '', `session_notes`.`text` || char(10)
		UNION ALL
		SELECT n + 1, substr(rest, 1, instr(rest, char(10)) - 1), substr(rest, instr(rest, char(10)) + 1)
		FROM split WHERE rest <> ''
	)
	SELECT json_object('type', 'doc', 'content', json_group_array(json(
		CASE WHEN line = '' THEN json_object('type', 'paragraph')
		ELSE json_object('type', 'paragraph', 'content', json_array(json_object('type', 'text', 'text', line)))
		END
	)))
	FROM (SELECT line FROM split WHERE n > 0 ORDER BY n)
);
