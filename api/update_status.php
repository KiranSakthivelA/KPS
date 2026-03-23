<?php
// api/update_status.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Ensure data is not empty
if (!empty($data->id) && !empty($data->status)) {
    // Sanitize input
    $id = htmlspecialchars(strip_tags($conn->real_escape_string($data->id)));
    $status = htmlspecialchars(strip_tags($conn->real_escape_string($data->status)));
    $price = null;

    // Check if status is 'Completed' and price is provided
    if ($status === 'Completed' && isset($data->price)) {
        $price = htmlspecialchars(strip_tags($conn->real_escape_string($data->price)));
    }

    // Prepare SQL query
    $sql = "UPDATE inquiries SET status = '$status'";
    if ($price !== null) {
        $sql .= ", price = '$price'";
    }
    $sql .= " WHERE id = '$id'";

    if ($conn->query($sql) === TRUE) {
        // Set response code - 200 ok
        http_response_code(200);
        echo json_encode(array("message" => "Status was updated."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update status. Error: " . $conn->error));
    }
} else {
    // Tell the user data is incomplete
    // Set response code - 400 bad request
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update status. Data is incomplete."));
}

$conn->close();
?>
