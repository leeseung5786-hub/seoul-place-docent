CREATE TABLE `archive_region_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`region_id` text NOT NULL,
	`revision` integer NOT NULL,
	`status` text NOT NULL,
	`method` text NOT NULL,
	`official_code` text,
	`official_name` text,
	`evidence` text NOT NULL,
	`before_state` text NOT NULL,
	`after_state` text NOT NULL,
	`actor` text NOT NULL,
	`checked_at` text NOT NULL,
	FOREIGN KEY (`region_id`) REFERENCES `archive_regions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_region_review_revision` ON `archive_region_reviews` (`region_id`,`revision`);--> statement-breakpoint
CREATE INDEX `archive_region_review_status` ON `archive_region_reviews` (`status`);