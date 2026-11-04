CREATE TABLE `archive_passage_regions` (
	`id` text PRIMARY KEY NOT NULL,
	`passage_id` text NOT NULL,
	`region_id` text NOT NULL,
	`label` text NOT NULL,
	`relation` text NOT NULL,
	`basis` text NOT NULL,
	FOREIGN KEY (`passage_id`) REFERENCES `archive_passages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_id`) REFERENCES `archive_regions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_passage_region_pair` ON `archive_passage_regions` (`passage_id`,`region_id`);--> statement-breakpoint
CREATE INDEX `archive_passage_region_lookup` ON `archive_passage_regions` (`region_id`);