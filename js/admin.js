/**
 * ADRASTIA - ADMIN PANEL JS
 * Handles Tab navigation, Chart.js, and interactive table mockups.
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Admin Tab Navigation ---
    const navTabs = document.querySelectorAll('.nav-tab[data-target]');
    const sections = document.querySelectorAll('.admin-section');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            navTabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab and corresponding section
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // --- 2. Chart.js Setup (Terminal Style) ---
    const ctx = document.getElementById('salesChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
                datasets: [{
                    label: 'TRAFFIC_VOLUME',
                    data: [12, 19, 3, 5, 2, 30, 45],
                    borderColor: '#ccff00', // Acid Green
                    backgroundColor: 'rgba(204, 255, 0, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff00ff', // Hot Pink
                    pointBorderColor: '#000',
                    pointRadius: 4,
                    fill: true,
                    tension: 0 /* 0 makes it sharp, jagged lines - very brutalist */
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#222' },
                        ticks: { color: '#888', font: { family: 'Space Mono' } }
                    },
                    x: {
                        grid: { color: '#222' },
                        ticks: { color: '#888', font: { family: 'Space Mono' } }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { family: 'Space Mono' } }
                    }
                }
            }
        });
    }

    // --- 3. Toggle "Initialize New Drop" Form ---
    const openAddModalBtn = document.getElementById('open-add-modal');
    const addDropForm = document.getElementById('addDropForm');

    if (openAddModalBtn && addDropForm) {
        openAddModalBtn.addEventListener('click', () => {
            addDropForm.classList.toggle('hidden');
            if(addDropForm.classList.contains('hidden')){
                openAddModalBtn.innerText = "+ INITIALIZE NEW DROP";
            } else {
                openAddModalBtn.innerText = "- CANCEL DEPLOYMENT";
            }
        });
    }

    // --- 4. Emergency Action: KILL_DROP Simulation ---
    const killBtns = document.querySelectorAll('.btn-kill:not(.disabled)');
    
    killBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const statusCell = row.querySelector('td:nth-child(5)');
            const stockCell = row.querySelector('td:nth-child(4)');

            // Prompt for security confirmation (aesthetic touch)
            if (confirm("WARNING: ARE YOU SURE YOU WANT TO KILL THIS DROP? THIS CANNOT BE UNDONE.")) {
                // Update Row UI to "Dead"
                row.classList.add('row-dead');
                
                // Update Stock Text
                stockCell.innerText = "0 / 50";
                stockCell.className = ""; // Remove neon-pink if present
                
                // Update Status Text
                statusCell.innerText = "SOLD_OUT";
                statusCell.className = "status-soldout";
                
                // Disable Button
                e.target.innerText = "DEAD";
                e.target.classList.add('disabled');
                e.target.setAttribute('disabled', 'true');
            }
        });
    });

    // --- 5. Dynamic Status Tracker Styling ---
    const statusSelects = document.querySelectorAll('.status-select');
    
    statusSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            // Remove old color classes
            e.target.classList.remove('processing', 'packaged', 'dispatched');
            // Add new color class based on selection
            e.target.classList.add(e.target.value);
        });
    });

    // --- 6. Export CSV Simulation ---
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            // Simulate downloading a file
            exportCsvBtn.innerText = "GENERATING_CSV...";
            exportCsvBtn.style.backgroundColor = "var(--accent-green)";
            exportCsvBtn.style.color = "black";
            
            setTimeout(() => {
                alert("SYSTEM MESSAGE: dispatch_log_04.csv has been downloaded to your local drive.");
                // Reset Button
                exportCsvBtn.innerText = "EXPORT DATA [CSV]";
                exportCsvBtn.style.backgroundColor = "";
                exportCsvBtn.style.color = "";
            }, 1500);
        });
    }
});
