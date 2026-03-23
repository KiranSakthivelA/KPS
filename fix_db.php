<?php
// fix_db.php
require_once 'api/config.php';

echo "<h2>Database Schema Fix</h2>";

$sql = "ALTER TABLE inquiries 
        ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT NULL, 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;";

if ($conn->query($sql)) {
    echo "<p style='color: green;'>Success: inquiries table updated (added price and updated_at columns).</p>";
} else {
    echo "<p style='color: red;'>Error updating table: " . $conn->error . "</p>";
}

// Verify columns
$res = $conn->query("DESCRIBE inquiries");
echo "<h3>Current Table Structure:</h3><pre>";
while($row = $res->fetch_assoc()) {
    print_r($row);
}
echo "</pre>";

$conn->close();
?>
