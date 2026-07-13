CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`question_id` text NOT NULL,
	`option_id` text NOT NULL,
	`is_correct` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`option_id`) REFERENCES `options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_session_id` text NOT NULL,
	`nickname` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`quiz_session_id`) REFERENCES `quiz_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
