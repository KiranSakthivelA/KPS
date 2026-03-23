<?php
// api/get_inquiries.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';

// Check if a specific ID was requested
$id = isset($_GET['id']) ? $_GET['id'] : null;

$sql = "SELECT i.*, (SELECT COUNT(*) FROM inquiries i2 WHERE i2.phone = i.phone) as booking_count FROM inquiries i ORDER BY i.created_at DESC";

if ($id) {
    $sql = "SELECT i.*, (SELECT COUNT(*) FROM inquiries i2 WHERE i2.phone = i.phone) as booking_count FROM inquiries i WHERE i.id = " . $conn->real_escape_string($id);
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Inquiries array
    $inquiries_arr = array();
    $inquiries_arr["records"] = array();

    while ($row = $result->fetch_assoc()) {
        array_push($inquiries_arr["records"], $row);
    }

    // Set response code - 200 OK
    http_response_code(200);
    echo json_encode($inquiries_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);
    echo json_encode(array("message" => "No inquiries found.", "records" => array()));
}

$conn->close();
?>
