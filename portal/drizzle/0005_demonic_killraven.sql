CREATE TABLE `ai_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`expires_at` integer NOT NULL,
	`lease_until` integer NOT NULL,
	`lease_token` text NOT NULL,
	`requests` integer NOT NULL
);
