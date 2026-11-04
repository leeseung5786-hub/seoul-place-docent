CREATE TABLE `archive_passage_corrections` (
	`id` text PRIMARY KEY NOT NULL,
	`passage_id` text NOT NULL,
	`version_id` text NOT NULL,
	`source_version` integer NOT NULL,
	`revision` integer NOT NULL,
	`prior_review_id` text NOT NULL,
	`request_hash` text NOT NULL,
	`before_hash` text NOT NULL,
	`after_hash` text NOT NULL,
	`before_snapshot` text NOT NULL,
	`after_snapshot` text NOT NULL,
	`reason` text NOT NULL,
	`evidence` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`passage_id`) REFERENCES `archive_passages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`version_id`) REFERENCES `archive_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prior_review_id`) REFERENCES `archive_passage_reviews`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_passage_correction_revision` ON `archive_passage_corrections` (`passage_id`,`revision`);