<?php
// api/get_history.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once 'config.php';

$query = "SELECT * FROM inquiries WHERE status IN ('Completed', 'Cancelled') ORDER BY updated_at DESC";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $history = array();
    while($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    echo json_encode(array("records" => $history));
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No history found."));
}
?>
