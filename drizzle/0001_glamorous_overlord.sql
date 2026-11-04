CREATE TABLE `archive_captures` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`version_id` text NOT NULL,
	`batch_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`raw_metadata` text NOT NULL,
	`source_locator` text NOT NULL,
	`attribution` text NOT NULL,
	`rights_evidence` text NOT NULL,
	`period_label` text NOT NULL,
	`start_year` integer,
	`end_year` integer,
	`date_precision` text NOT NULL,
	`captured_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `archive_sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`version_id`) REFERENCES `archive_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_capture_fingerprint` ON `archive_captures` (`source_id`,`fingerprint`);--> statement-breakpoint
CREATE INDEX `archive_capture_period` ON `archive_captures` (`start_year`,`end_year`);