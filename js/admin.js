/**
 * ADRASTIA - ADMIN PANEL JS (FIXED)
 * No Chart.js to prevent lag. Includes functional form processing.
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Admin Tab Navigation ---
    const navTabs = document.querySelectorAll('.nav-tab[data-target]');
    const sections = document.querySelectorAll('.admin-section');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-target')).classList.add('active');
        });
    });

    // --- 2. Toggle "Initialize New Drop" Form ---
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

    // --- 3. Form Submission (Add New Product) ---
    const hardwareForm = document.getElementById('newHardwareForm');
    const inventoryTableBody = document.querySelector('#inventoryTable tbody');

    if (hardwareForm) {
        hardwareForm.addEventListener('submit', (e) => {
            // PREVENT DEFAULT PAGE RELOAD
            e.preventDefault();

            // Get values from inputs
            const name = document.getElementById('prodName').value;
            const qty = document.getElementById('prodQty').value;
            const price = document.getElementById('prodPrice').value;
            const img = document.getElementById('prodImg').value;

            // Create new table row template
            const newRow = `
                <tr>
                    <td><img src="${img}" class="table-img"></td>
                    <td>${name}</td>
                    <td>$${price}</td>
                    <td>${qty} / ${qty}</td>
                    <td class="status-instock">IN_STOCK</td>
                    <td><button class="btn-kill">KILL_DROP</button></td>
                </tr>
            `;

            // Inject the new row at the top of the table body
            inventoryTableBody.insertAdjacentHTML('afterbegin', newRow);

            // Clear the form
            hardwareForm.reset();

            // Hide the form automatically
            addDropForm.classList.add('hidden');
            openAddModalBtn.innerText = "+ INITIALIZE NEW DROP";

            // Re-attach the KILL_DROP event listener to the NEW button
            attachKillEvents();
            
            // Visual alert
            alert(`SYSTEM: ${name} deployed successfully.`);
        });
    }

    // --- 4. Emergency Action: KILL_DROP Simulation ---
    function attachKillEvents() {
        // Find all buttons that haven't been disabled yet
        const killBtns = document.querySelectorAll('.btn-kill:not(.disabled)');
        
        // Remove old event listeners by cloning and replacing (prevents double firing)
        killBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const statusCell = row.querySelector('td:nth-child(5)');
                const stockCell = row.querySelector('td:nth-child(4)');

                if (confirm("WARNING: ARE YOU SURE YOU WANT TO KILL THIS DROP? THIS CANNOT BE UNDONE.")) {
                    row.classList.add('row-dead');
                    stockCell.innerText = "0 / X";
                    stockCell.className = ""; 
                    statusCell.innerText = "SOLD_OUT";
                    statusCell.className = "status-soldout";
                    e.target.innerText = "DEAD";
                    e.target.classList.add('disabled');
                    e.target.setAttribute('disabled', 'true');
                }
            });
        });
    }
    
    // Run it on initial load
    attachKillEvents();

    // --- 5. Export CSV Simulation ---
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            exportCsvBtn.innerText = "GENERATING_CSV...";
            exportCsvBtn.style.backgroundColor = "var(--accent-green)";
            exportCsvBtn.style.color = "black";
            setTimeout(() => {
                alert("SYSTEM MESSAGE: dispatch_log_04.csv has been downloaded.");
                exportCsvBtn.innerText = "EXPORT DATA [CSV]";
                exportCsvBtn.style.backgroundColor = "";
                exportCsvBtn.style.color = "";
            }, 1500);
        });
    }
});
