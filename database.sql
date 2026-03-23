-- Run this script in your HostingRaja phpMyAdmin or database console
-- to create the necessary table for the booking inquiries.

CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `pickup` varchar(150) NOT NULL,
  `drop_city` varchar(150) NOT NULL,
  `car_type` varchar(50) NOT NULL,
  `travel_date` date DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'New',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
