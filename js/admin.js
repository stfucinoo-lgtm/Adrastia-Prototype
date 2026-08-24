/**
 * ==========================================================================
 * ADRASTIA // ADMIN COMMAND TERMINAL CONTROLLER (js/admin.js)
 * Features: DA Currency Localization, Kill Drop Deactivation & Restore Engine
 * Version: 2.1.0
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    'use strict';

    // Verify Store Availability
    if (!window.AdrastiaStore) {
        console.error("FATAL: AdrastiaStore module not loaded.");
        return;
    }

    let currentUploadedImageBase64 = "";

    // --- 1. Tab Switching Controller ---
    const navButtons = document.querySelectorAll(".nav-btn[data-target]");
    const viewSections = document.querySelectorAll(".view-section");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = "view-" + btn.getAttribute("data-target");

            navButtons.forEach(b => b.classList.remove("active"));
            viewSections.forEach(s => s.classList.remove("active-view"));

            btn.classList.add("active");
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active-view");
            }
        });
    });

    // --- 2. Add Hardware Drawer Toggle ---
    const btnToggleAddForm = document.getElementById("btnToggleAddForm");
    const btnCloseAddForm = document.getElementById("btnCloseAddForm");
    const addProductDrawer = document.getElementById("addProductDrawer");

    const toggleAddDrawer = (show) => {
        if (!addProductDrawer) return;
        if (show) {
            addProductDrawer.classList.add("active-form");
            btnToggleAddForm.innerText = "- CANCEL DEPLOYMENT";
            document.getElementById("prodName").focus();
        } else {
            addProductDrawer.classList.remove("active-form");
            btnToggleAddForm.innerText = "+ DEPLOY NEW HARDWARE";
            resetHardwareForm();
        }
    };

    if (btnToggleAddForm) {
        btnToggleAddForm.addEventListener("click", () => {
            const isOpen = addProductDrawer.classList.contains("active-form");
            toggleAddDrawer(!isOpen);
        });
    }

    if (btnCloseAddForm) {
        btnCloseAddForm.addEventListener("click", () => toggleAddDrawer(false));
    }

    // --- 3. Image Upload & Drag & Drop Processor ---
    const dropzone = document.getElementById("uploadDropzone");
    const fileInput = document.getElementById("prodImgFile");
    const imgPreview = document.getElementById("imgPreview");
    const urlInput = document.getElementById("prodImgUrl");

    if (dropzone && fileInput) {
        dropzone.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (file) await processImageFile(file);
        });

        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });

        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("dragover");
        });

        dropzone.addEventListener("drop", async (e) => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith("image/")) {
                await processImageFile(file);
            }
        });
    }

    const processImageFile = async (file) => {
        try {
            const base64 = await window.AdrastiaStore.fileToBase64(file);
            currentUploadedImageBase64 = base64;
            if (imgPreview) {
                imgPreview.src = base64;
                imgPreview.style.display = "inline-block";
            }
            if (urlInput) urlInput.value = "";
        } catch (err) {
            alert("IMAGE_ENCODE_ERROR: Could not process image file.");
        }
    };

    if (urlInput) {
        urlInput.addEventListener("input", (e) => {
            const url = e.target.value.trim();
            if (url && imgPreview) {
                imgPreview.src = url;
                imgPreview.style.display = "inline-block";
                currentUploadedImageBase64 = "";
            } else if (!currentUploadedImageBase64 && imgPreview) {
                imgPreview.style.display = "none";
            }
        });
    }

    const resetHardwareForm = () => {
        const form = document.getElementById("newHardwareForm");
        if (form) form.reset();
        currentUploadedImageBase64 = "";
        if (imgPreview) {
            imgPreview.src = "";
            imgPreview.style.display = "none";
        }
    };

    // --- 4. Submit New Hardware Form ---
    const hardwareForm = document.getElementById("newHardwareForm");
    if (hardwareForm) {
        hardwareForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("prodName").value.trim();
            const collection = document.getElementById("prodCollection").value;
            const price = parseFloat(document.getElementById("prodPrice").value);
            const totalStock = parseInt(document.getElementById("prodTotalStock").value, 10);
            const desc = document.getElementById("prodDesc").value.trim();
            const manualUrl = urlInput ? urlInput.value.trim() : "";

            const finalImage = currentUploadedImageBase64 || manualUrl || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000";

            if (!name || isNaN(price) || isNaN(totalStock)) {
                alert("VALIDATION_ERROR: Missing essential specimen metrics.");
                return;
            }

            const sRatio = Math.floor(totalStock * 0.2);
            const mRatio = Math.floor(totalStock * 0.3);
            const lRatio = Math.floor(totalStock * 0.3);
            const xlRatio = totalStock - (sRatio + mRatio + lRatio);

            const newProduct = window.AdrastiaStore.addProduct({
                name,
                collection,
                price,
                totalStock,
                maxStock: totalStock,
                image: finalImage,
                description: desc,
                stock: { S: sRatio, M: mRatio, L: lRatio, XL: xlRatio }
            });

            alert(`SYSTEM_DEPLOY: [${newProduct.name}] deployed successfully (${window.AdrastiaStore.formatMoney(price)}).`);
            toggleAddDrawer(false);
            renderAll();
        });
    }

    // --- 5. Render Inventory Table (With Kill / Restore & DA) ---
    const renderInventory = () => {
        const tbody = document.getElementById("inventoryTableBody");
        if (!tbody) return;

        const products = window.AdrastiaStore.getProducts();

        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#666; padding:30px;">NO HARDWARE ARTIFACTS IN REPOSITORY.</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(prod => {
            let badgeHtml = '<span class="badge badge-green">IN STOCK</span>';
            let actionBtn = `<button class="btn-kill btn-action-kill" data-id="${prod.id}">KILL_DROP</button>`;

            if (prod.isKilled) {
                badgeHtml = '<span class="badge badge-pink" style="background:rgba(255,0,85,0.15);">KILLED [HIDDEN]</span>';
                actionBtn = `<button class="btn-ghost btn-action-restore" data-id="${prod.id}" style="border-color:var(--neon-green); color:var(--neon-green); font-size:0.7rem; padding:6px 10px;">RESTORE</button>`;
            } else if (prod.isSoldOut || prod.totalStock <= 0) {
                badgeHtml = '<span class="badge badge-gray">SOLD OUT [VISIBLE]</span>';
            } else if (prod.isCritical || prod.totalStock <= 5) {
                badgeHtml = '<span class="badge badge-pink">CRITICAL</span>';
            }

            return `
                <tr data-id="${prod.id}" style="${prod.isKilled ? 'opacity:0.6; background:rgba(255,0,85,0.02);' : ''}">
                    <td><img src="${prod.image}" class="prod-thumb" alt="Product"></td>
                    <td>
                        <strong>${prod.name}</strong><br>
                        <span style="color:#666; font-size:0.7rem;">SKU: ${prod.sku}</span>
                    </td>
                    <td><span class="badge badge-cyan">${prod.collection || 'DIGITAL_DECAY'}</span></td>
                    <td><strong>${window.AdrastiaStore.formatMoney(prod.price)}</strong></td>
                    <td>
                        <span style="${prod.totalStock <= 5 && !prod.isKilled ? 'color:var(--neon-pink); font-weight:bold;' : ''}">
                            ${prod.totalStock} / ${prod.maxStock || 50} REMAINING
                        </span>
                    </td>
                    <td>${badgeHtml}</td>
                    <td>
                        ${actionBtn}
                        <button class="btn-del btn-action-del" data-id="${prod.id}" title="Delete Artifact Permanently">&times;</button>
                    </td>
                </tr>
            `;
        }).join("");

        // Kill Drop Listeners (Deactivates from Storefront)
        tbody.querySelectorAll(".btn-action-kill").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                if (confirm("KILL DROP WARNING: This will immediately HIDE this product from the storefront catalog and homepage. Proceed?")) {
                    window.AdrastiaStore.killProduct(id);
                    renderAll();
                }
            });
        });

        // Restore Drop Listeners (Re-activates back to Storefront)
        tbody.querySelectorAll(".btn-action-restore").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                window.AdrastiaStore.restoreProduct(id);
                renderAll();
            });
        });

        // Permanent Delete Listeners
        tbody.querySelectorAll(".btn-action-del").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                if (confirm("PURGE WARNING: Permanently delete this specimen from repository?")) {
                    window.AdrastiaStore.deleteProduct(id);
                    renderAll();
                }
            });
        });
    };

    // --- 6. Render Dispatch Log (Orders) in DA ---
    const renderOrders = () => {
        const tbody = document.getElementById("ordersTableBody");
        if (!tbody) return;

        const orders = window.AdrastiaStore.getOrders();

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#666; padding:30px;">NO DISPATCH ORDERS LOGGED YET.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(ord => {
            let statusBadge = "badge-cyan";
            if (ord.status === "DISPATCHED" || ord.status === "DELIVERED") statusBadge = "badge-green";
            if (ord.status === "PROCESSING") statusBadge = "badge-pink";
            if (ord.status === "CANCELLED") statusBadge = "badge-gray";

            const itemsSummary = ord.items.map(i => `${i.qty}x ${i.name} (${i.size})`).join("<br>");
            const dateStr = new Date(ord.timestamp).toLocaleString("en-GB", {
                dateStyle: "short",
                timeStyle: "short"
            });

            return `
                <tr>
                    <td style="font-weight:700; color:var(--neon-cyan);">${ord.orderId}</td>
                    <td>
                        <strong>${ord.customer.name}</strong><br>
                        <span style="color:#888; font-size:0.7rem;">${ord.customer.email}</span><br>
                        <span style="color:#666; font-size:0.7rem;">${ord.customer.address}</span>
                    </td>
                    <td style="font-size:0.75rem; line-height:1.4;">${itemsSummary}</td>
                    <td style="font-weight:bold; color:var(--neon-green);">${window.AdrastiaStore.formatMoney(ord.totalAmount)}</td>
                    <td style="color:#888; font-size:0.7rem;">${dateStr}</td>
                    <td><span class="badge ${statusBadge}">${ord.status}</span></td>
                    <td>
                        <select class="form-select order-status-select" data-id="${ord.orderId}" style="padding:4px 8px; font-size:0.7rem; background:#111;">
                            <option value="PROCESSING" ${ord.status === 'PROCESSING' ? 'selected' : ''}>PROCESSING</option>
                            <option value="DISPATCHED" ${ord.status === 'DISPATCHED' ? 'selected' : ''}>DISPATCHED</option>
                            <option value="DELIVERED" ${ord.status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
                            <option value="CANCELLED" ${ord.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join("");

        tbody.querySelectorAll(".order-status-select").forEach(select => {
            select.addEventListener("change", (e) => {
                const orderId = e.target.getAttribute("data-id");
                const newStatus = e.target.value;
                window.AdrastiaStore.updateOrderStatus(orderId, newStatus);
                renderAll();
            });
        });
    };

    // --- 7. Live Telemetry & Metrics in DA ---
    const renderKPIs = () => {
        const orders = window.AdrastiaStore.getOrders();
        const products = window.AdrastiaStore.getProducts();

        const grossRevenue = orders
            .filter(o => o.status !== "CANCELLED")
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const pendingOrders = orders.filter(o => o.status === "PROCESSING").length;
        const criticalProducts = products.filter(p => p.totalStock <= 5 && !p.isSoldOut && !p.isKilled).length;

        const revEl = document.getElementById("kpiGrossRevenue");
        const ordersEl = document.getElementById("kpiTotalOrders");
        const pendingEl = document.getElementById("kpiPendingOrders");
        const prodCountEl = document.getElementById("kpiTotalProducts");
        const critEl = document.getElementById("kpiCriticalStock");

        if (revEl) revEl.innerText = window.AdrastiaStore.formatMoney(grossRevenue);
        if (ordersEl) ordersEl.innerText = orders.length;
        if (pendingEl) pendingEl.innerText = `${pendingOrders} PENDING DISPATCH`;
        if (prodCountEl) prodCountEl.innerText = products.filter(p => !p.isKilled).length;
        if (critEl) critEl.innerText = String(criticalProducts).padStart(2, '0');
    };

    // --- 8. Live Alerts Feed ---
    const renderTerminalAlerts = () => {
        const feedContainer = document.getElementById("terminalAlertsFeed");
        if (!feedContainer) return;

        const products = window.AdrastiaStore.getProducts();
        const orders = window.AdrastiaStore.getOrders();

        let alerts = [];

        products.forEach(p => {
            if (p.isKilled) {
                alerts.push(`<div style="background:rgba(255,0,85,0.08); border-left:3px solid var(--neon-pink); padding:8px 12px;"><strong class="text-pink">KILLED_DROP:</strong> [${p.name}] hidden from store.</div>`);
            } else if (p.isSoldOut || p.totalStock === 0) {
                alerts.push(`<div style="background:rgba(100,100,100,0.1); border-left:3px solid #666; padding:8px 12px;"><strong style="color:#aaa;">SOLD_OUT:</strong> [${p.name}] natural stock exhausted.</div>`);
            } else if (p.totalStock <= 5) {
                alerts.push(`<div style="background:rgba(255,170,0,0.08); border-left:3px solid #ffaa00; padding:8px 12px;"><strong style="color:#ffaa00;">CRITICAL_STOCK:</strong> [${p.name}] at ${p.totalStock} units.</div>`);
            }
        });

        if (orders.length > 0) {
            const latest = orders[0];
            alerts.push(`<div style="background:rgba(0,255,102,0.08); border-left:3px solid var(--neon-green); padding:8px 12px;"><strong class="text-green">NEW_DISPATCH:</strong> ${latest.orderId} received for ${window.AdrastiaStore.formatMoney(latest.totalAmount)}.</div>`);
        }

        alerts.push(`<div style="background:rgba(0,240,255,0.05); border-left:3px solid var(--neon-cyan); padding:8px 12px;"><strong class="text-cyan">CURRENCY_GATEWAY:</strong> Algerian Dinar (DA) engine active.</div>`);

        feedContainer.innerHTML = alerts.slice(0, 4).join("");
    };

    // --- 9. Promo Codes & Factory Purge ---
    const renderSettings = () => {
        const promoList = document.getElementById("promoCodesList");
        if (!promoList) return;

        const settings = window.AdrastiaStore.getSettings();
        const codes = settings.promoCodes || {};

        promoList.innerHTML = Object.entries(codes).map(([code, discount]) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#0e0e14; padding:10px 14px; border:1px solid #222;">
                <span style="font-family:var(--font-head); color:#fff; letter-spacing:1px;">${code}</span>
                <span class="badge badge-green">${discount}% OFF</span>
            </div>
        `).join("");
    };

    const btnFactoryReset = document.getElementById("btnFactoryReset");
    if (btnFactoryReset) {
        btnFactoryReset.addEventListener("click", () => {
            if (confirm("EMERGENCY OVERRIDE: Purge all products/orders and reload DA factory defaults?")) {
                window.AdrastiaStore.factoryReset();
                alert("SYSTEM: Repository purged and restored to DA factory defaults.");
                location.reload();
            }
        });
    }

    // --- 10. CSV Export Engine ---
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            const orders = window.AdrastiaStore.getOrders();
            if (orders.length === 0) {
                alert("EXPORT_ERROR: No dispatch logs found to export.");
                return;
            }

            let csvContent = "Order ID,Recipient Name,Email,Address,Items,Total (DA),Payment Method,Status,Timestamp\n";

            orders.forEach(o => {
                const itemsClean = o.items.map(i => `${i.qty}x ${i.name} (${i.size})`).join(" | ");
                const row = [
                    `"${o.orderId}"`,
                    `"${o.customer.name}"`,
                    `"${o.customer.email}"`,
                    `"${o.customer.address}"`,
                    `"${itemsClean}"`,
                    `"${o.totalAmount} DA"`,
                    `"${o.paymentMethod}"`,
                    `"${o.status}"`,
                    `"${o.timestamp}"`
                ];
                csvContent += row.join(",") + "\n";
            });

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `ADRASTIA_DISPATCH_MANIFEST_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    const renderAll = () => {
        renderKPIs();
        renderInventory();
        renderOrders();
        renderTerminalAlerts();
        renderSettings();
    };

    renderAll();

    window.addEventListener("adr:products-updated", renderAll);
    window.addEventListener("adr:orders-updated", renderAll);
});
