/**
 * ==========================================================================
 * ADRASTIA // GLOBAL INTERACTIONS & CART DRAWER CONTROLLER (js/global.js)
 * Features: Custom Cursor, Auto-Injected Cart Drawer, DA Currency Sync
 * Version: 2.1.0
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    'use strict';

    // --- 1. Custom Cursor Logic ---
    const cursor = document.querySelector(".custom-cursor");

    if (cursor) {
        document.addEventListener("mousemove", (e) => {
            cursor.style.top = e.clientY + "px";
            cursor.style.left = e.clientX + "px";
        });

        const attachCursorHoverListeners = () => {
            const interactives = document.querySelectorAll(
                "a, button, input, select, textarea, .product-card, .cart-item, .chaotic-card, .drop-product, .grid-product-card"
            );

            interactives.forEach((el) => {
                el.removeEventListener("mouseenter", handleCursorEnter);
                el.removeEventListener("mouseleave", handleCursorLeave);
                el.addEventListener("mouseenter", handleCursorEnter);
                el.addEventListener("mouseleave", handleCursorLeave);
            });
        };

        const handleCursorEnter = () => cursor.classList.add("hovered");
        const handleCursorLeave = () => cursor.classList.remove("hovered");

        attachCursorHoverListeners();

        document.addEventListener("mouseleave", () => { cursor.style.display = "none"; });
        document.addEventListener("mouseenter", () => { cursor.style.display = "block"; });

        window.attachCursorHoverListeners = attachCursorHoverListeners;
    }

    // --- 2. Dynamic Cart Drawer Injection ---
    const injectCartDrawerMarkup = () => {
        if (document.getElementById("adrCartDrawer")) return;

        const cartMarkup = `
            <div class="cart-backdrop" id="adrCartBackdrop"></div>
            <aside class="cart-drawer" id="adrCartDrawer" aria-label="Shopping Cart">
                <div class="cart-drawer-header">
                    <h3>// REPOSITORY_CART [<span id="drawerTotalCount">0</span>]</h3>
                    <button class="cart-close-btn" id="adrCartCloseBtn" title="Close Cart">[ ESC / X ]</button>
                </div>
                
                <div class="cart-drawer-body" id="adrCartBody">
                    <!-- Dynamic Cart Items Injected Here -->
                </div>
                
                <div class="cart-drawer-footer" id="adrCartFooter">
                    <div class="cart-subtotal-row">
                        <span>ESTIMATED_TOTAL:</span>
                        <span class="cart-subtotal-val" id="adrCartSubtotal">0 DA</span>
                    </div>
                    <div class="cart-shipping-notice" id="adrShippingNotice">
                        // DISPATCH: CALCULATED AT TERMINAL CHECKOUT (800 DA / FREE OVER 15,000 DA).
                    </div>
                    <a href="checkout.html" class="cart-checkout-btn" id="adrCheckoutBtn">
                        INITIATE CHECKOUT &gt;
                    </a>
                </div>
            </aside>
        `;

        document.body.insertAdjacentHTML("beforeend", cartMarkup);
    };

    injectCartDrawerMarkup();

    // --- 3. Cart Drawer UI Controller ---
    const cartDrawer = document.getElementById("adrCartDrawer");
    const cartBackdrop = document.getElementById("adrCartBackdrop");
    const cartCloseBtn = document.getElementById("adrCartCloseBtn");
    const cartBody = document.getElementById("adrCartBody");
    const cartSubtotal = document.getElementById("adrCartSubtotal");
    const drawerTotalCount = document.getElementById("drawerTotalCount");
    const navCartCounts = document.querySelectorAll(".cart-count");
    const cartToggles = document.querySelectorAll(".cart-toggle");

    const openCartDrawer = () => {
        if (!cartDrawer || !cartBackdrop) return;
        renderCartItems();
        cartDrawer.classList.add("open");
        cartBackdrop.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    const closeCartDrawer = () => {
        if (!cartDrawer || !cartBackdrop) return;
        cartDrawer.classList.remove("open");
        cartBackdrop.classList.remove("open");
        document.body.style.overflow = "";
    };

    cartToggles.forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    });

    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartDrawer);
    if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cartDrawer && cartDrawer.classList.contains("open")) {
            closeCartDrawer();
        }
    });

    // --- 4. Render Cart Items (In DA) ---
    const renderCartItems = () => {
        if (!window.AdrastiaStore || !cartBody) return;

        const cart = window.AdrastiaStore.getCart();
        const count = window.AdrastiaStore.getCartCount();
        const total = window.AdrastiaStore.getCartTotal();

        navCartCounts.forEach(el => el.innerText = count);
        if (drawerTotalCount) drawerTotalCount.innerText = count;
        if (cartSubtotal) cartSubtotal.innerText = window.AdrastiaStore.formatMoney(total);

        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty-state">
                    <p class="neon-pink">[ REPOSITORY_EMPTY ]</p>
                    <p>NO HARDWARE DETECTED IN STORAGE BUFFER.<br>INITIALIZE ACQUISITION FROM CATALOG.</p>
                    <a href="products.html" class="btn-primary" style="font-size:0.9rem; padding:0.8rem 1.5rem;" onclick="document.getElementById('adrCartCloseBtn').click();">
                        BROWSE CATALOG &gt;
                    </a>
                </div>
            `;
            const checkoutBtn = document.getElementById("adrCheckoutBtn");
            if (checkoutBtn) {
                checkoutBtn.style.pointerEvents = "none";
                checkoutBtn.style.opacity = "0.4";
            }
            return;
        }

        const checkoutBtn = document.getElementById("adrCheckoutBtn");
        if (checkoutBtn) {
            checkoutBtn.style.pointerEvents = "auto";
            checkoutBtn.style.opacity = "1";
        }

        cartBody.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-meta">
                        <span>SIZE:</span>
                        <span class="cart-size-pill">${item.size}</span>
                        <span style="color:#666;">// SKU: ${item.sku || 'N/A'}</span>
                    </div>
                    <div class="cart-qty-ctrl">
                        <button class="cart-qty-btn btn-qty-minus" data-id="${item.id}" data-size="${item.size}">-</button>
                        <span class="cart-qty-num">${item.qty}</span>
                        <button class="cart-qty-btn btn-qty-plus" data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end;">
                    <button class="cart-item-remove btn-item-remove" data-id="${item.id}" data-size="${item.size}" title="Remove Item">&times;</button>
                    <div class="cart-item-price">${window.AdrastiaStore.formatMoney(item.price * item.qty)}</div>
                </div>
            </div>
        `).join("");

        cartBody.querySelectorAll(".btn-qty-minus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const size = btn.getAttribute("data-size");
                const item = cart.find(i => i.id === id && i.size === size);
                if (item) window.AdrastiaStore.updateCartQty(id, size, item.qty - 1);
            });
        });

        cartBody.querySelectorAll(".btn-qty-plus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const size = btn.getAttribute("data-size");
                const item = cart.find(i => i.id === id && i.size === size);
                if (item) window.AdrastiaStore.updateCartQty(id, size, item.qty + 1);
            });
        });

        cartBody.querySelectorAll(".btn-item-remove").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const size = btn.getAttribute("data-size");
                window.AdrastiaStore.removeFromCart(id, size);
            });
        });

        if (window.attachCursorHoverListeners) window.attachCursorHoverListeners();
    };

    window.addEventListener("adr:cart-updated", () => {
        renderCartItems();
    });

    if (window.AdrastiaStore) {
        const count = window.AdrastiaStore.getCartCount();
        navCartCounts.forEach(el => el.innerText = count);
    }

    // --- 5. Quick Add-to-Cart Listener ---
    const handleQuickAddClick = (e) => {
        const btn = e.target.closest(".quick-add-btn, .massive-add-btn");
        if (!btn || !window.AdrastiaStore) return;

        e.preventDefault();

        let selectedSize = "M";
        const sizeInput = document.querySelector('input[name="size"]:checked');
        if (sizeInput) selectedSize = sizeInput.value.toUpperCase();

        let targetProduct = null;
        const productIdAttr = btn.getAttribute("data-product-id");

        if (productIdAttr) {
            targetProduct = window.AdrastiaStore.getProductById(productIdAttr);
        } else {
            const container = btn.closest(".product-card, .drop-product, .grid-product-card, .stl-card, .single-product-section");
            if (container) {
                const titleEl = container.querySelector(".product-name, h3, h4, .product-title");
                if (titleEl) {
                    const cleanName = titleEl.innerText.trim().toUpperCase();
                    const activeProducts = window.AdrastiaStore.getActiveProducts();
                    targetProduct = activeProducts.find(p => p.name === cleanName || cleanName.includes(p.name));
                }
            }
        }

        if (!targetProduct) {
            const activeList = window.AdrastiaStore.getActiveProducts();
            if (activeList.length > 0) targetProduct = activeList[0];
        }

        if (!targetProduct || targetProduct.isKilled) return;

        const success = window.AdrastiaStore.addToCart(targetProduct.id, selectedSize, 1);

        if (success) {
            const originalText = btn.innerText;
            btn.innerText = "ADDED_ [✓]";
            btn.style.backgroundColor = "var(--accent-green)";
            btn.style.color = "#000";

            cartToggles.forEach(t => t.classList.add("cart-shake"));

            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
                btn.style.color = "";
                cartToggles.forEach(t => t.classList.remove("cart-shake"));
            }, 1200);

            setTimeout(() => {
                openCartDrawer();
            }, 400);
        }
    };

    document.addEventListener("click", handleQuickAddClick);
});
