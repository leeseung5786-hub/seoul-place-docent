CREATE TABLE `archive_passage_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`passage_id` text NOT NULL,
	`version_id` text NOT NULL,
	`source_version` integer NOT NULL,
	`revision` integer NOT NULL,
	`status` text NOT NULL,
	`content_hash` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`evidence` text NOT NULL,
	`actor` text NOT NULL,
	`checked_at` text NOT NULL,
	FOREIGN KEY (`passage_id`) REFERENCES `archive_passages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`version_id`) REFERENCES `archive_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_passage_review_revision` ON `archive_passage_reviews` (`passage_id`,`revision`);--> statement-breakpoint
CREATE INDEX `archive_passage_review_status` ON `archive_passage_reviews` (`status`);