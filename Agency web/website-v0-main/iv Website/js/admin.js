document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION ---
    const loginScreen = document.getElementById('loginScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    const loginForm = document.getElementById('loginForm');
    const pinInput = document.getElementById('pinInput');
    const loginError = document.getElementById('loginError');

    // Check if already logged in (Simple session check)
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = pinInput.value;
        // MOCK PIN: '1234'
        if (pin === '1907') {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            alert("Incorrect PIN!");
            pinInput.value = '';
        }
    });

    // --- DASHBOARD FUNCTIONS ---
    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        loadLeads();
    }

    window.logout = function () { // Expose to window for onclick
        localStorage.removeItem('adminLoggedIn');
        window.location.reload();
    }

    // --- DATA HANDLING ---
    function loadLeads() {
        // Get messages from localStorage
        const leads = JSON.parse(localStorage.getItem('impactVisualsLeads')) || [];

        const tableBody = document.getElementById('leadsTableBody');
        const noDataMsg = document.getElementById('noDataMsg');
        const totalLeadsDisplay = document.getElementById('totalLeads');
        const todayLeadsDisplay = document.getElementById('todayLeads');

        // Update Stats
        totalLeadsDisplay.textContent = leads.length;

        // Count today's leads
        const todayStr = new Date().toLocaleDateString();
        const todayCount = leads.filter(l => new Date(l.date).toLocaleDateString() === todayStr).length;
        todayLeadsDisplay.textContent = todayCount;

        // Render Table
        tableBody.innerHTML = '';
        if (leads.length === 0) {
            noDataMsg.style.display = 'block';
        } else {
            noDataMsg.style.display = 'none';
            // Sort by newest first
            leads.sort((a, b) => new Date(b.date) - new Date(a.date));

            leads.forEach((lead, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="color: var(--text-secondary); font-size: 0.9rem;">${new Date(lead.date).toLocaleString()}</td>
                    <td style="font-weight: 600;">${lead.name}</td>
                    <td><a href="mailto:${lead.email}" style="color: var(--accent-primary);">${lead.email}</a></td>
                    <td>${lead.phone}</td>
                    <td style="max-width: 300px; opacity: 0.8;">${lead.message}</td>
                    <td><button class="btn-action" onclick="deleteLead(${index})"><i class="fas fa-trash"></i></button></td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    // Expose delete function
    window.deleteLead = function (index) {
        if (confirm('Delete this inquiry?')) {
            let leads = JSON.parse(localStorage.getItem('impactVisualsLeads')) || [];
            // We need to match the correct one since we sorted them in display
            // But to simplify, let's just reverse index matching since we sort newest first
            // A better way is to give IDs, but for this demo:
            leads.sort((a, b) => new Date(b.date) - new Date(a.date));
            leads.splice(index, 1);

            localStorage.setItem('impactVisualsLeads', JSON.stringify(leads));
            loadLeads(); // Refresh UI
        }
    }
});
