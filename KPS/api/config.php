<?php
// api/config.php

// Database configuration
// IMPORTANT: Update these values with the actual Database credentials provided by HostingRaja
$db_host = 'localhost';
$db_user = 'root'; // Update this 
$db_pass = '';     // Update this
$db_name = 'kps_travels_db'; // Update this

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4 for proper character encoding (handles emojis, special chars)
$conn->set_charset("utf8mb4");
?>
