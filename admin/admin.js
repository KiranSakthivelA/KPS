// admin/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    
    const tableBody = document.getElementById('inquiries-body');
    const refreshBtn = document.getElementById('refresh-btn');
    const modal = document.getElementById('details-modal');
    const closeBtn = document.querySelector('.close-modal');
    let currentTab = 'inquiries';
    let recordsData = [];

    // Helper: Format Dates
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    // Helper: Badge Classes
    const getStatusBadgeClass = (status) => {
        const s = status.toLowerCase();
        if (s === 'new') return 'status-new';
        if (s === 'contacted') return 'status-contacted';
        if (s === 'booked') return 'status-booked';
        if (s === 'completed') return 'status-booked'; // Green for completed too
        if (s === 'cancelled') return 'status-cancelled';
        return 'status-new';
    };

    // Tab Switching
    window.switchTab = (tab) => {
        currentTab = tab;
        document.getElementById('nav-inquiries').classList.toggle('active', tab === 'inquiries');
        document.getElementById('nav-history').classList.toggle('active', tab === 'history');
        document.getElementById('stats-section').style.display = tab === 'history' ? 'grid' : 'none';
        document.getElementById('page-title').textContent = tab === 'inquiries' ? 'Booking Inquiries' : 'Booking History';
        document.getElementById('card-title').textContent = tab === 'inquiries' ? 'Recent Requests' : 'Journey Logs';
        
        fetchData();
        if (tab === 'history') loadStats();
    };

    // Fetch Data (Inquiries or History)
    const fetchData = async () => {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';
        const api = currentTab === 'inquiries' ? '../api/get_inquiries.php' : '../api/get_history.php';
        
        try {
            const response = await fetch(api);
            if (!response.ok) {
                tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No records found.</td></tr>`;
                return;
            }
            const data = await response.json();
            recordsData = data.records;
            renderTable(recordsData);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: red;">Failed to load data.</td></tr>`;
        }
    };

    // Load Sales Stats
    const loadStats = async () => {
        try {
            const response = await fetch('../api/get_stats.php');
            const data = await response.json();
            document.getElementById('monthly-sales').textContent = `₹${parseFloat(data.total_sales).toLocaleString('en-IN')}`;
            document.getElementById('monthly-trips').textContent = data.total_trips;
            document.getElementById('current-month').textContent = data.month_name;
        } catch (error) {
            console.error('Stats error:', error);
        }
    };

    // Render Table
    const renderTable = (records) => {
        tableBody.innerHTML = '';
        records.forEach(req => {
            const tr = document.createElement('tr');
            const cleanPhone = req.phone.replace(/\D/g, '');
            const waLink = `https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(req.name)}...`;

            let actions = '';
            if (currentTab === 'inquiries') {
                actions = `
                    <button class="action-btn btn-view" title="View Details" onclick="viewDetails(${req.id})"><i class="fa-solid fa-eye"></i></button>
                    <a href="tel:${req.phone}" class="action-btn btn-call" title="Call Customer"><i class="fa-solid fa-phone"></i></a>
                    <a href="${waLink}" target="_blank" class="action-btn btn-whatsapp" title="WhatsApp" onclick="updateStatus(${req.id}, 'Contacted')"><i class="fa-brands fa-whatsapp"></i></a>
                    <button class="action-btn btn-status-update" title="Mark as Completed" onclick="completeBooking(${req.id})"><i class="fa-solid fa-check-circle"></i></button>
                    <button class="action-btn btn-status-update" style="color:#e63946" title="Cancel" onclick="updateStatus(${req.id}, 'Cancelled')"><i class="fa-solid fa-times-circle"></i></button>
                `;
            } else {
                actions = `<span style="font-weight:600; color:#2ecc71">${req.price ? '₹'+req.price : '-'}</span>`;
            }

            tr.innerHTML = `
                <td>${formatDate(req.created_at)}</td>
                <td><strong>${req.name}</strong></td>
                <td>${req.phone}</td>
                <td>${req.pickup} → ${req.drop_city}</td>
                <td>${req.car_type}</td>
                <td>${req.travel_date || '-'}</td>
                <td><span class="status-badge ${getStatusBadgeClass(req.status)}">${req.status}</span></td>
                <td>${actions}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    window.completeBooking = (id) => {
        const price = prompt("Enter final trip amount (₹):");
        if (price !== null && !isNaN(price)) {
            updateStatus(id, 'Completed', price);
        }
    };

    window.updateStatus = async (id, newStatus, price = null) => {
        try {
            const response = await fetch('../api/update_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, status: newStatus, price: price })
            });
            if (response.ok) fetchData();
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    // Modal Close
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

    // Refresh
    if (refreshBtn) refreshBtn.onclick = () => fetchData();

    // Initial Load
    fetchData();
});

