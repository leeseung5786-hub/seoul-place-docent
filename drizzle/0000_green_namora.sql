CREATE TABLE `archive_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`version_id` text NOT NULL,
	`storage_key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`sha256` text NOT NULL,
	`created_at` text NOT NULL,
	`actor` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `archive_sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`version_id`) REFERENCES `archive_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `archive_asset_source` ON `archive_assets` (`source_id`);--> statement-breakpoint
CREATE TABLE `archive_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `archive_facts` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`passage_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`time_label` text NOT NULL,
	`start_year` integer,
	`end_year` integer,
	`scope` text DEFAULT 'neighborhood' NOT NULL,
	`review_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `archive_sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`passage_id`) REFERENCES `archive_passages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `archive_fact_source` ON `archive_facts` (`source_id`);--> statement-breakpoint
CREATE TABLE `archive_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`source_url` text NOT NULL,
	`status` text NOT NULL,
	`record_count` integer NOT NULL,
	`note` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `archive_passages` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`version_id` text NOT NULL,
	`locator` text NOT NULL,
	`text` text NOT NULL,
	`text_kind` text NOT NULL,
	`review_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `archive_sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`version_id`) REFERENCES `archive_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `archive_passage_source` ON `archive_passages` (`source_id`);--> statement-breakpoint
CREATE TABLE `archive_regions` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`name` text NOT NULL,
	`level` text NOT NULL,
	`official_code` text,
	`aliases` text DEFAULT '[]' NOT NULL,
	`source_url` text NOT NULL,
	`source_note` text DEFAULT '' NOT NULL,
	`as_of` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `archive_region_parent` ON `archive_regions` (`parent_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `archive_region_identity` ON `archive_regions` (`parent_id`,`name`,`level`);--> statement-breakpoint
CREATE TABLE `archive_source_regions` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`region_id` text NOT NULL,
	`relation` text DEFAULT 'catalog_tag' NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `archive_sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_id`) REFERENCES `archive_regions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_source_region_pair` ON `archive_source_regions` (`source_id`,`region_id`);--> statement-breakpoint
CREATE INDEX `archive_source_region_lookup` ON `archive_source_regions` (`region_id`);--> statement-breakpoint
CREATE TABLE `archive_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text,
	`institution` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`kind` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`publication_date` text,
	`subject_period` text DEFAULT '' NOT NULL,
	`rights` text DEFAULT 'unknown' NOT NULL,
	`rights_url` text DEFAULT '' NOT NULL,
	`rights_note` text DEFAULT '' NOT NULL,
	`storage_allowed` integer DEFAULT false NOT NULL,
	`reuse_allowed` integer DEFAULT false NOT NULL,
	`review_status` text DEFAULT 'pending' NOT NULL,
	`search_text` text NOT NULL,
	`current_version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_source_url` ON `archive_sources` (`url`);--> statement-breakpoint
CREATE INDEX `archive_source_review` ON `archive_sources` (`review_status`);--> statement-breakpoint
CREATE INDEX `archive_source_kind` ON `archive_sources` (`kind`);--> statement-breakpoint
CREATE TABLE `archive_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`version` integer NOT NULL,
	`representation` text NOT NULL,
	`content_hash` text NOT NULL,
	`payload` text NOT NULL,
	`retrieved_at` text NOT NULL,
	`created_at` text NOT NULL,
	`actor` text NOT NULL,
	`change_note` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `archive_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_version_identity` ON `archive_versions` (`source_id`,`version`);