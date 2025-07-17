CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`last_logged_in` text DEFAULT 'CURRENT_TIMESTAMP'
);
