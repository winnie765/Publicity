CREATE TABLE `facebook_followers` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_date` integer NOT NULL,
	`follower_count` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `facebook_followers_snapshot_date_unique` ON `facebook_followers` (`snapshot_date`);