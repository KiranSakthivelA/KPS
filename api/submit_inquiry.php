<?php
// api/submit_inquiry.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (
    !empty($data->name) &&
    !empty($data->phone) &&
    !empty($data->pickup) &&
    !empty($data->drop) &&
    !empty($data->car)
) {
    // Sanitize input to prevent SQL injection
    $name = htmlspecialchars(strip_tags($conn->real_escape_string($data->name)));
    $phone = htmlspecialchars(strip_tags($conn->real_escape_string($data->phone)));
    $pickup = htmlspecialchars(strip_tags($conn->real_escape_string($data->pickup)));
    $drop_city = htmlspecialchars(strip_tags($conn->real_escape_string($data->drop)));
    $car_type = htmlspecialchars(strip_tags($conn->real_escape_string($data->car)));
    
    // Optional fields
    $travel_date = isset($data->date) && !empty($data->date) ? $conn->real_escape_string($data->date) : null;
    $message = isset($data->message) && !empty($data->message) ? htmlspecialchars(strip_tags($conn->real_escape_string($data->message))) : null;

    // Prepare SQL query
    if ($travel_date !== null && $message !== null) {
        $sql = "INSERT INTO inquiries (name, phone, pickup, drop_city, car_type, travel_date, message) VALUES ('$name', '$phone', '$pickup', '$drop_city', '$car_type', '$travel_date', '$message')";
    } else if ($travel_date !== null) {
        $sql = "INSERT INTO inquiries (name, phone, pickup, drop_city, car_type, travel_date) VALUES ('$name', '$phone', '$pickup', '$drop_city', '$car_type', '$travel_date')";
    } else {
        $sql = "INSERT INTO inquiries (name, phone, pickup, drop_city, car_type) VALUES ('$name', '$phone', '$pickup', '$drop_city', '$car_type')";
    }

    if ($conn->query($sql) === TRUE) {
        // --- GOOGLE SHEETS INTEGRATION ---
        // Replace this URL with your actual Google Apps Script Web App URL
        $google_script_url = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL";
        
        if ($google_script_url !== "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") {
            $sheet_data = json_encode([
                "name" => $name,
                "phone" => $phone,
                "pickup" => $pickup,
                "drop" => $drop_city,
                "car" => $car_type,
                "date" => $travel_date ? $travel_date : "",
                "message" => $message ? $message : ""
            ]);
            
            $ch = curl_init($google_script_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $sheet_data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
            curl_exec($ch); // Send data to Google Sheets in background
            curl_close($ch);
        }

        // Set response code - 201 created
        http_response_code(201);
        echo json_encode(array("message" => "Inquiry was created.", "id" => $conn->insert_id));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create inquiry. Error: " . $conn->error));
    }
} else {
    // Tell the user data is incomplete
    // Set response code - 400 bad request
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create inquiry. Data is incomplete."));
}

$conn->close();
?>
