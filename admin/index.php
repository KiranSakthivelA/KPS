<?php
// admin/index.php
session_start();

// Users Array
$users = [
    'admin' => [
        'password' => 'Password!123',
        'role' => 'admin',
        'display_name' => 'Administrator'
    ],
    'manager' => [
        'password' => 'Manager123',
        'role' => 'manager',
        'display_name' => 'Booking Manager'
    ]
];

// Handle login
if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = strtolower(trim($_POST['username']));
    $password = $_POST['password'];
    
    if (array_key_exists($username, $users) && $users[$username]['password'] === $password) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['role'] = $users[$username]['role'];
        $_SESSION['display_name'] = $users[$username]['display_name'];
    } else {
        $error = "Invalid username or password.";
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: index.php");
    exit();
}

// Check if logged in
$logged_in = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
$role = isset($_SESSION['role']) ? $_SESSION['role'] : '';
$display_name = isset($_SESSION['display_name']) ? $_SESSION['display_name'] : ucfirst($role);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KPS Travels - Admin Dashboard</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Admin CSS -->
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<?php if (!$logged_in): ?>
    <!-- Login Screen -->
    <div class="login-container">
        <div class="login-card">
            <div class="logo">
                <i class="fa-solid fa-car-side"></i> KPS Travels
            </div>
            <h2>Admin Login</h2>
            <?php if (isset($error)): ?>
                <div class="error-msg"><?php echo $error; ?></div>
            <?php endif; ?>
            <form method="POST" action="index.php">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" placeholder="e.g. admin or manager" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter password" required>
                </div>
                <button type="submit" class="btn-primary">Login <i class="fa-solid fa-arrow-right"></i></button>
            </form>
        </div>
    </div>
<?php else: ?>
    <!-- Dashboard Screen -->
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2><i class="fa-solid fa-car-side"></i> KPS <?php echo ucfirst($role); ?></h2>
            </div>
            <ul class="nav-menu">
                <li class="active" id="nav-inquiries"><a href="#" onclick="switchTab('inquiries')"><i class="fa-solid fa-inbox"></i> Inquiries</a></li>
                <?php if ($role !== 'manager'): ?>
                <li id="nav-history"><a href="#" onclick="switchTab('history')"><i class="fa-solid fa-clock-rotate-left"></i> Booking History</a></li>
                <?php endif; ?>
                <li><a href="?logout=true" class="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a></li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="topbar">
                <h1 id="page-title">Booking Inquiries</h1>
                <div class="admin-profile">
                    <i class="fa-solid fa-user-shield"></i> <?php echo htmlspecialchars($display_name); ?>
                </div>
            </div>

            <div class="content-area">
                <!-- Sales Stats Section (Hidden by default) -->
                <div id="stats-section" class="stats-grid" style="display: none;">
                    <div class="stat-card">
                        <div class="stat-icon sales"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                        <div class="stat-details">
                            <h3 id="monthly-sales">₹0</h3>
                            <p>Monthly Sales (<span id="current-month">-</span>)</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon trips"><i class="fa-solid fa-car"></i></div>
                        <div class="stat-details">
                            <h3 id="monthly-trips">0</h3>
                            <p>Completed Trips</p>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 id="card-title">Recent Requests</h3>
                        <button class="btn-secondary" id="refresh-btn"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
                    </div>
                    <div class="table-responsive">
                        <table id="inquiries-table">
                            <thead id="table-head">
                                <tr>
                                    <th>Date Received</th>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Journey</th>
                                    <th>Car Type</th>
                                    <th>Travel Date</th>
                                    <th>Status</th>
                                    <th class="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inquiries-body">
                                <tr>
                                    <td colspan="8" class="text-center">Loading inquiries...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <!-- View Details Modal -->
    <div id="details-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Inquiry Details</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body" id="modal-body-content">
                <!-- Content injected via JS -->
            </div>
        </div>
    </div>

    <script>
        const ADMIN_ROLE = "<?php echo $role; ?>";
    </script>
    <script src="js/admin.js"></script>
<?php endif; ?>

</body>
</html>
