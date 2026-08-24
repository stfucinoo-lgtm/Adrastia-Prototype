/**
 * ==========================================================================
 * ADRASTIA // CHECKOUT & DISPATCH AUTHORIZATION ENGINE (js/checkout.js)
 * Currency: Algerian Dinar (DA) Localization
 * Version: 2.1.0
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    'use strict';

    if (!window.AdrastiaStore) {
        console.error("FATAL: AdrastiaStore is missing.");
        return;
    }

    let appliedDiscountPercent = 0;
    let appliedPromoCode = "";

    const checkoutSection = document.getElementById("checkoutSection");
    const orderSuccessSection = document.getElementById("orderSuccessSection");
    const itemsListContainer = document.getElementById("checkoutItemsList");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const discountRow = document.getElementById("checkoutDiscountRow");
    const discountValEl = document.getElementById("checkoutDiscountVal");
    const shippingEl = document.getElementById("checkoutShipping");
    const grandTotalEl = document.getElementById("checkoutGrandTotal");

    const promoForm = document.getElementById("promoForm");
    const promoInput = document.getElementById("promoInput");
    const promoMessage = document.getElementById("promoMessage");
    const checkoutForm = document.getElementById("checkoutForm");

    const successOrderRef = document.getElementById("successOrderRef");
    const asciiReceiptContainer = document.getElementById("asciiReceiptContainer");
    const btnPrintReceipt = document.getElementById("btnPrintReceipt");

    // --- 1. Ingest Cart and Render Items in DA ---
    const renderCheckoutItems = () => {
        const cart = window.AdrastiaStore.getCart();

        if (!itemsListContainer) return;

        if (cart.length === 0) {
            itemsListContainer.innerHTML = `
                <div style="text-align:center; padding:3rem 1rem; color:#888;">
                    <p class="neon-pink" style="font-weight:bold; margin-bottom:1rem;">[ BUFFER_EMPTY: NO HARDWARE SELECTED ]</p>
                    <p style="font-size:0.85rem; margin-bottom:1.5rem;">You must select artifacts before requesting dispatch.</p>
                    <a href="products.html" class="btn-primary" style="font-size:0.85rem;">BROWSE REPOSITORY &gt;</a>
                </div>
            `;
            const submitBtn = document.getElementById("btnSubmitOrder");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.3";
                submitBtn.style.cursor = "not-allowed";
            }
            updateTotals(0);
            return;
        }

        itemsListContainer.innerHTML = cart.map(item => `
            <div class="chk-item-card">
                <img src="${item.image}" alt="${item.name}" class="chk-item-img">
                <div class="chk-item-info">
                    <div class="chk-item-title">${item.name}</div>
                    <div class="chk-item-meta">
                        <span>SIZE: <strong style="color:#fff;">${item.size}</strong></span>
                        <span>// QTY: <strong style="color:#fff;">${item.qty}</strong></span>
                    </div>
                </div>
                <div class="chk-item-price">${window.AdrastiaStore.formatMoney(item.price * item.qty)}</div>
            </div>
        `).join("");

        const subtotal = window.AdrastiaStore.getCartTotal();
        updateTotals(subtotal);
    };

    // --- 2. Calculate and Update Prices in DA ---
    const updateTotals = (subtotal) => {
        const settings = window.AdrastiaStore.getSettings();
        const baseShipping = settings.shippingFee || 800;
        const freeThreshold = settings.freeShippingThreshold || 15000;

        let shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : baseShipping;
        let discountAmount = 0;

        if (appliedDiscountPercent > 0) {
            discountAmount = (subtotal * appliedDiscountPercent) / 100;
            if (discountRow) discountRow.style.display = "flex";
            if (discountValEl) discountValEl.innerText = `-${window.AdrastiaStore.formatMoney(discountAmount)} (${appliedDiscountPercent}%)`;
        } else {
            if (discountRow) discountRow.style.display = "none";
        }

        const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

        if (subtotalEl) subtotalEl.innerText = window.AdrastiaStore.formatMoney(subtotal);
        if (shippingEl) shippingEl.innerText = shippingFee === 0 ? "FREE [WAIVED]" : window.AdrastiaStore.formatMoney(shippingFee);
        if (grandTotalEl) grandTotalEl.innerText = window.AdrastiaStore.formatMoney(grandTotal);
    };

    // --- 3. Promo / Bypass Code Handler ---
    if (promoForm) {
        promoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const code = promoInput.value.trim();

            if (!code) return;

            const result = window.AdrastiaStore.validatePromoCode(code);

            if (result.valid) {
                appliedDiscountPercent = result.discount;
                appliedPromoCode = result.code;
                promoMessage.className = "promo-msg success";
                promoMessage.innerText = `// OVERRIDE GRANTED: ${result.code} applied (${result.discount}% OFF)`;
                
                const subtotal = window.AdrastiaStore.getCartTotal();
                updateTotals(subtotal);
            } else {
                appliedDiscountPercent = 0;
                appliedPromoCode = "";
                promoMessage.className = "promo-msg error";
                promoMessage.innerText = `// ACCESS_DENIED: Invalid or expired bypass key.`;
                
                const subtotal = window.AdrastiaStore.getCartTotal();
                updateTotals(subtotal);
            }
        });
    }

    // --- 4. Submit Order and Dispatch Authorization ---
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const cart = window.AdrastiaStore.getCart();
            if (cart.length === 0) {
                alert("BUFFER_EMPTY: Cannot dispatch an empty payload.");
                return;
            }

            const name = document.getElementById("custName").value.trim();
            const email = document.getElementById("custEmail").value.trim();
            const phone = document.getElementById("custPhone").value.trim();
            const city = document.getElementById("custCity").value.trim();
            const address = document.getElementById("custAddress").value.trim();
            const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
            const paymentMethod = paymentMethodInput ? paymentMethodInput.value : "COD";

            const fullDestination = `${address}, Sector: ${city} (Algeria)`;

            try {
                const newOrder = window.AdrastiaStore.createOrder({
                    customer: {
                        name: name,
                        email: email,
                        phone: phone,
                        address: fullDestination
                    },
                    items: cart,
                    discountPercent: appliedDiscountPercent,
                    paymentMethod: paymentMethod
                });

                showSuccessScreen(newOrder);

            } catch (err) {
                console.error("Order Creation Failed", err);
                alert(`TRANSACTION_FAILED: ${err.message}`);
            }
        });
    }

    // --- 5. Generate ASCII Terminal Receipt in DA ---
    const generateAsciiReceipt = (order) => {
        const timestamp = new Date(order.timestamp).toUTCString();
        const divider = "================================================================";
        const subDivider = "----------------------------------------------------------------";

        const itemsRows = order.items.map(item => {
            const itemPriceStr = `${(item.price * item.qty).toLocaleString()} DA`;
            const line = `${item.qty}x ${item.name} (${item.size})`.padEnd(46, ' ') + itemPriceStr.padStart(12, ' ');
            return line;
        }).join("\n");

        return `
${divider}
                    ADRASTIA // OFFICIAL DISPATCH
                EST. 2024 // SYSTEM OVERRIDE PROTOCOL
${divider}
DISPATCH_REF : ${order.orderId}
TIMESTAMP    : ${timestamp}
PAYMENT_TYPE : ${order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD)' : 'ENCRYPTED TOKEN (SIMULATED)'}
STATUS       : AUTHORIZED // QUEUED FOR DISPATCH
${subDivider}
RECIPIENT COORDINATES:
NAME         : ${order.customer.name.toUpperCase()}
COMMS        : ${order.customer.email}
PHONE        : ${order.customer.phone}
DESTINATION  : ${order.customer.address}
${subDivider}
PAYLOAD SPECIFICATIONS:
${itemsRows}
${subDivider}
SUBTOTAL     : ${(order.subtotal.toLocaleString() + ' DA').padStart(14, ' ')}
DISCOUNT     : -${(order.discount.toLocaleString() + ' DA').padStart(13, ' ')} ${appliedPromoCode ? `(${appliedPromoCode})` : ''}
DISPATCH FEE : ${order.shippingFee === 0 ? 'FREE / WAIVED' : (order.shippingFee.toLocaleString() + ' DA').padStart(14, ' ')}
${divider}
TOTAL CHARGED: ${(order.totalAmount.toLocaleString() + ' DA').padStart(14, ' ')}
${divider}
SECURITY HASH: SHA256-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2).toUpperCase()}
BARCODE      : ||| ||||| |||| || |||||| |||| ||| ||||| || |||||||

[ NOTICE: ALL HARDWARE IS LIMITED EDITION. NO RESTOCKS. WEAR UNTIL DESTROYED. ]
${divider}
`.trim();
    };

    const showSuccessScreen = (order) => {
        if (checkoutSection) checkoutSection.style.display = "none";
        if (orderSuccessSection) orderSuccessSection.style.display = "block";

        if (successOrderRef) {
            successOrderRef.innerText = order.orderId;
            successOrderRef.setAttribute("data-text", order.orderId);
        }

        if (asciiReceiptContainer) {
            asciiReceiptContainer.innerText = generateAsciiReceipt(order);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (btnPrintReceipt) {
        btnPrintReceipt.addEventListener("click", () => {
            window.print();
        });
    }

    renderCheckoutItems();
});
