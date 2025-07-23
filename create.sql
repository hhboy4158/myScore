-- Adminer 5.3.0 MySQL 8.3.0 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

SET NAMES utf8mb4;

CREATE DATABASE `myscore` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `myscore`;

CREATE TABLE `Scores` (
  `score_id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `evaluated_user_id` int NOT NULL,
  `criterion_id` int NOT NULL,
  `score` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`score_id`),
  UNIQUE KEY `unique_score_entry` (`assignment_id`,`reviewer_id`,`evaluated_user_id`,`criterion_id`),
  UNIQUE KEY `unique_review_criterion` (`assignment_id`,`reviewer_id`,`evaluated_user_id`,`criterion_id`),
  KEY `scores_assignment_id_foreign` (`assignment_id`),
  KEY `scores_reviewer_id_foreign` (`reviewer_id`),
  KEY `scores_evaluated_user_id_foreign` (`evaluated_user_id`),
  KEY `scores_criterion_id_foreign` (`criterion_id`),
  CONSTRAINT `scores_assignment_id_foreign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `scores_criterion_id_foreign` FOREIGN KEY (`criterion_id`) REFERENCES `assignment_criteria` (`criterion_id`) ON DELETE CASCADE,
  CONSTRAINT `scores_evaluated_user_id_foreign` FOREIGN KEY (`evaluated_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `scores_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `assignment_criteria` (
  `criterion_id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `max_score` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`criterion_id`),
  KEY `assignment_criteria_assignment_id_foreign` (`assignment_id`),
  CONSTRAINT `assignment_criteria_assignment_id_foreign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `classroom_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `type` enum('presentation','homework') COLLATE utf8mb4_general_ci NOT NULL,
  `due_date` datetime NOT NULL,
  `anonymity_type` enum('none','single_blind','double_blind') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'none',
  `allow_self_assessment` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  KEY `assignments_classroom_id_foreign` (`classroom_id`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`classroom_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `classrooms` (
  `classroom_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `creator_user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`classroom_id`),
  UNIQUE KEY `code` (`code`),
  KEY `creator_id` (`creator_user_id`),
  CONSTRAINT `classrooms_ibfk_1` FOREIGN KEY (`creator_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `memberships` (
  `membership_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `classroom_id` int NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `role` enum('teacher','student') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'teacher',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`membership_id`),
  UNIQUE KEY `unique_membership` (`user_id`,`classroom_id`),
  KEY `classroom_id` (`classroom_id`),
  CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `memberships_ibfk_2` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`classroom_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `peer_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `comment` text COLLATE utf8mb4_general_ci,
  `reviewed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_review` (`submission_id`,`reviewer_id`),
  KEY `reviewer_id` (`reviewer_id`),
  CONSTRAINT `peer_reviews_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`) ON DELETE CASCADE,
  CONSTRAINT `peer_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `peer_reviews_chk_1` CHECK (((`score` >= 0) and (`score` <= 100)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `student_id` int NOT NULL,
  `content` text COLLATE utf8mb4_general_ci,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`submission_id`),
  UNIQUE KEY `unique_submission` (`assignment_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provider` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `provider_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2025-07-23 09:33:04 UTC