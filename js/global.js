/**
 * ==========================================================================
 * ADRASTIA // GLOBAL INTERACTIONS & CART DRAWER CONTROLLER (js/global.js)
 * Features: Custom Cursor, Auto-Injected Cart Drawer, Dynamic Cart State Sync
 * Version: 2.0.0
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    'use strict';

    // --- 1. Custom Cursor Logic ---
    const cursor = document.querySelector(".custom-cursor");

    if (cursor) {
        // Track mouse coordinates
        document.addEventListener("mousemove", (e) => {
            cursor.style.top = e.clientY + "px";
            cursor.style.left = e.clientX + "px";
        });

        // Elements that trigger cursor morphing
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

        // Hide/Show cursor at window boundaries
        document.addEventListener("mouseleave", () => { cursor.style.display = "none"; });
        document.addEventListener("mouseenter", () => { cursor.style.display = "block"; });

        // Expose helper to reattach on dynamic DOM changes
        window.attachCursorHoverListeners = attachCursorHoverListeners;
    }

    // --- 2. Dynamic Cart Drawer Injection ---
    const injectCartDrawerMarkup = () => {
        if (document.getElementById("adrCartDrawer")) return; // Prevent double injection

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
                        <span class="cart-subtotal-val" id="adrCartSubtotal">$0.00</span>
                    </div>
                    <div class="cart-shipping-notice" id="adrShippingNotice">
                        // DISPATCH: CALCULATED AT TERMINAL CHECKOUT.
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

    // Open Cart Drawer
    const openCartDrawer = () => {
        if (!cartDrawer || !cartBackdrop) return;
        renderCartItems();
        cartDrawer.classList.add("open");
        cartBackdrop.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    };

    // Close Cart Drawer
    const closeCartDrawer = () => {
        if (!cartDrawer || !cartBackdrop) return;
        cartDrawer.classList.remove("open");
        cartBackdrop.classList.remove("open");
        document.body.style.overflow = "";
    };

    // Attach Toggle Listeners
    cartToggles.forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    });

    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartDrawer);
    if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

    // Close on Escape key press
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cartDrawer && cartDrawer.classList.contains("open")) {
            closeCartDrawer();
        }
    });

    // --- 4. Render Cart Items from AdrastiaStore ---
    const renderCartItems = () => {
        if (!window.AdrastiaStore || !cartBody) return;

        const cart = window.AdrastiaStore.getCart();
        const count = window.AdrastiaStore.getCartCount();
        const total = window.AdrastiaStore.getCartTotal();

        // Update counts across Navbar and Drawer Header
        navCartCounts.forEach(el => el.innerText = count);
        if (drawerTotalCount) drawerTotalCount.innerText = count;
        if (cartSubtotal) cartSubtotal.innerText = `$${total.toFixed(2)}`;

        // Render Empty State if no items
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

        // Enable Checkout Button
        const checkoutBtn = document.getElementById("adrCheckoutBtn");
        if (checkoutBtn) {
            checkoutBtn.style.pointerEvents = "auto";
            checkoutBtn.style.opacity = "1";
        }

        // Render Items List
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
                    <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
                </div>
            </div>
        `).join("");

        // Attach Quantity and Delete Actions
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

        // Re-attach custom cursor hover listeners to newly generated elements
        if (window.attachCursorHoverListeners) window.attachCursorHoverListeners();
    };

    // Listen for Store Cart Updates globally
    window.addEventListener("adr:cart-updated", () => {
        renderCartItems();
    });

    // Initial Render of Cart Counter
    if (window.AdrastiaStore) {
        const count = window.AdrastiaStore.getCartCount();
        navCartCounts.forEach(el => el.innerText = count);
    }

    // --- 5. Universal Quick Add-to-Cart Listener ---
    const handleQuickAddClick = (e) => {
        const btn = e.target.closest(".quick-add-btn, .massive-add-btn");
        if (!btn || !window.AdrastiaStore) return;

        e.preventDefault();

        // 1. Try to find Selected Size (e.g., from product.html form)
        let selectedSize = "M";
        const sizeInput = document.querySelector('input[name="size"]:checked');
        if (sizeInput) selectedSize = sizeInput.value.toUpperCase();

        // 2. Resolve Product by data attribute OR text context
        let targetProduct = null;
        const productIdAttr = btn.getAttribute("data-product-id");

        if (productIdAttr) {
            targetProduct = window.AdrastiaStore.getProductById(productIdAttr);
        } else {
            // Fallback: match by product title inside the parent card or header
            const container = btn.closest(".product-card, .drop-product, .grid-product-card, .stl-card, .single-product-section");
            if (container) {
                const titleEl = container.querySelector(".product-name, h3, h4, .product-title");
                if (titleEl) {
                    const cleanName = titleEl.innerText.trim().toUpperCase();
                    const allProducts = window.AdrastiaStore.getProducts();
                    targetProduct = allProducts.find(p => p.name === cleanName || cleanName.includes(p.name));
                }
            }
        }

        // Default to first product if not found
        if (!targetProduct) {
            targetProduct = window.AdrastiaStore.getProducts()[0];
        }

        if (!targetProduct) return;

        // Add to Central Store
        const success = window.AdrastiaStore.addToCart(targetProduct.id, selectedSize, 1);

        if (success) {
            // Button Feedback Animation
            const originalText = btn.innerText;
            btn.innerText = "ADDED_ [✓]";
            btn.style.backgroundColor = "var(--accent-green)";
            btn.style.color = "#000";

            // Trigger Shake on Cart Toggle buttons
            cartToggles.forEach(t => t.classList.add("cart-shake"));

            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
                btn.style.color = "";
                cartToggles.forEach(t => t.classList.remove("cart-shake"));
            }, 1200);

            // Automatically open cart drawer after short delay
            setTimeout(() => {
                openCartDrawer();
            }, 400);
        }
    };

    document.addEventListener("click", handleQuickAddClick);
});
