<?php
// api/get_stats.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once 'config.php';

// Get current month and year
$month = date('m');
$year = date('Y');

// Total sales this month
$salesQuery = "SELECT SUM(price) as total_sales FROM inquiries WHERE status = 'Completed' AND MONTH(updated_at) = $month AND YEAR(updated_at) = $year";
$salesResult = $conn->query($salesQuery);
$salesData = $salesResult->fetch_assoc();

// Total completed trips this month
$tripsQuery = "SELECT COUNT(*) as total_trips FROM inquiries WHERE status = 'Completed' AND MONTH(updated_at) = $month AND YEAR(updated_at) = $year";
$tripsResult = $conn->query($tripsQuery);
$tripsData = $tripsResult->fetch_assoc();

echo json_encode(array(
    "total_sales" => $salesData['total_sales'] ?? 0,
    "total_trips" => $tripsData['total_trips'] ?? 0,
    "month_name" => date('F')
));
?>
