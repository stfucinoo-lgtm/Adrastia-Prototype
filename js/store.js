/**
 * ==========================================================================
 * ADRASTIA // HYBRID CLOUD & LOCAL DATA ENGINE (js/store.js)
 * Backend: Node.js / Express Server API Sync
 * Currency: Algerian Dinar (DA)
 * Version: 3.5.0
 * ==========================================================================
 */

(function (window) {
    'use strict';

    // Local Storage Keys Cache
    const KEYS = {
        PRODUCTS: 'ADRASTIA_PRODUCTS_V3',
        DROPS: 'ADRASTIA_DROPS_V3',
        ORDERS: 'ADRASTIA_ORDERS_V3',
        CART: 'ADRASTIA_CART_V3',
        SETTINGS: 'ADRASTIA_SETTINGS_V3',
        COLLECTION_META: 'adrastia_collection_meta',
        LOOKBOOK_META: 'adrastia_lookbook_meta',
        MANIFESTO_META: 'adrastia_manifesto_meta',
        HOME_MANIFESTO_META: 'adrastia_home_manifesto_meta',
        AUDIO_TRACK: 'adrastia_audio_track'
    };

    // Default Fallback Seed
    const DEFAULT_PRODUCTS = [
        {
            id: 'prod-001',
            sku: 'ADR-001',
            name: 'ACID_WASH TEE',
            collection: 'DIGITAL_DECAY',
            price: 4500,
            stock: { S: 5, M: 8, L: 6, XL: 5 },
            totalStock: 24,
            maxStock: 50,
            image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
            description: 'Oversized fit. Hand-distressed edges. 100% heavyweight acid-treated cotton.',
            isSoldOut: false,
            isCritical: false,
            isKilled: false,
            dateAdded: '2024-11-01'
        },
        {
            id: 'prod-002',
            sku: 'ADR-002',
            name: 'CYBER_SKULL HOODIE',
            collection: 'DIGITAL_DECAY',
            price: 8500,
            stock: { S: 1, M: 1, L: 1, XL: 0 },
            totalStock: 3,
            maxStock: 50,
            image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
            description: 'Ultra-heavy fleece, cybernetic screen print. Raw hem finish.',
            isSoldOut: false,
            isCritical: true,
            isKilled: false,
            dateAdded: '2024-11-02'
        }
    ];

    const DEFAULT_SETTINGS = {
        currency: 'DA',
        promoCodes: { 'GLITCH20': 20, 'VOID10': 10, 'OVERRIDE': 50 },
        shippingFee: 800,
        freeShippingThreshold: 15000
    };

    // Helper: Local Storage I/O
    function getStored(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (err) {
            return fallback;
        }
    }

    function setStored(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn('[AdrastiaStore Cache Error]', err);
        }
    }

    function emitEvent(eventName, detail = {}) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    // --- Server Cloud Sync Engine ---
    async function syncWithServer() {
        try {
            const res = await fetch('/api/sync');
            if (res.ok) {
                const payload = await res.json();
                if (payload.success && payload.data) {
                    const { products, orders, drops, settings, meta } = payload.data;
                    
                    if (products) setStored(KEYS.PRODUCTS, products);
                    if (orders) setStored(KEYS.ORDERS, orders);
                    if (drops) setStored(KEYS.DROPS, drops);
                    if (settings) setStored(KEYS.SETTINGS, settings);

                    if (meta) {
                        if (meta.collection) setStored(KEYS.COLLECTION_META, meta.collection);
                        if (meta.homeManifesto) setStored(KEYS.HOME_MANIFESTO_META, meta.homeManifesto);
                        if (meta.lookbook) setStored(KEYS.LOOKBOOK_META, meta.lookbook);
                        if (meta.manifesto) setStored(KEYS.MANIFESTO_META, meta.manifesto);
                        if (meta.soundtrack && meta.soundtrack.url) setStored(KEYS.AUDIO_TRACK, meta.soundtrack.url);
                    }

                    // Dispatch Global Refresh Events
                    emitEvent('adr:products-updated', { products });
                    emitEvent('adr:orders-updated', { orders });
                    emitEvent('adr:collection-updated', meta ? meta.collection : {});
                    emitEvent('adr:home-manifesto-updated', meta ? meta.homeManifesto : {});
                    emitEvent('adr:lookbook-updated', meta ? meta.lookbook : {});
                    emitEvent('adr:manifesto-updated', meta ? meta.manifesto : {});
                    emitEvent('adr:audio-track-updated');
                }
            }
        } catch (err) {
            console.log('[Adrastia Cloud Sync] Running in offline/cache mode');
        }
    }

    // Initial Load & Sync
    if (!localStorage.getItem(KEYS.PRODUCTS)) setStored(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    if (!localStorage.getItem(KEYS.SETTINGS)) setStored(KEYS.SETTINGS, DEFAULT_SETTINGS);
    if (!localStorage.getItem(KEYS.CART)) setStored(KEYS.CART, []);
    syncWithServer();

    /**
     * ==========================================================================
     * PUBLIC STORE API
     * ==========================================================================
     */
    const AdrastiaStore = {
        currency: 'DA',

        formatMoney(amount) {
            const num = parseFloat(amount) || 0;
            return `${num.toLocaleString('en-US')} DA`;
        },

        // --- 1. PRODUCTS API (SERVER SYNCED) ---
        getProducts() {
            return getStored(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
        },

        getActiveProducts() {
            return this.getProducts().filter(p => !p.isKilled);
        },

        getProductById(id) {
            const products = this.getProducts();
            return products.find(p => p.id === id || p.sku === id) || null;
        },

        async addProduct(productData) {
            const products = this.getProducts();
            const newProduct = {
                id: 'prod-' + Date.now(),
                sku: productData.sku || 'ADR-' + Math.floor(100 + Math.random() * 900),
                name: (productData.name || 'UNTITLED_SPECIMEN').toUpperCase(),
                collection: productData.collection || 'DIGITAL_DECAY',
                price: parseFloat(productData.price) || 0,
                stock: productData.stock || { S: 10, M: 10, L: 10, XL: 10 },
                totalStock: parseInt(productData.totalStock, 10) || 40,
                maxStock: parseInt(productData.maxStock, 10) || 50,
                image: productData.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
                description: productData.description || 'Raw underground garment. Handle with chaos.',
                isSoldOut: false,
                isCritical: false,
                isKilled: false,
                dateAdded: new Date().toISOString().split('T')[0]
            };

            if (newProduct.totalStock <= 0) newProduct.isSoldOut = true;
            else if (newProduct.totalStock <= 5) newProduct.isCritical = true;

            products.unshift(newProduct);
            setStored(KEYS.PRODUCTS, products);
            emitEvent('adr:products-updated', { products });

            // Post to Server
            try {
                await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                });
            } catch (e) {
                console.warn('[SERVER SYNC POST FAILED]', e);
            }

            return newProduct;
        },

        async updateProduct(id, updatedFields) {
            const products = this.getProducts();
            const index = products.findIndex(p => p.id === id || p.sku === id);
            if (index === -1) return null;

            products[index] = { ...products[index], ...updatedFields };
            const totalStock = products[index].totalStock;
            products[index].isSoldOut = totalStock <= 0;
            products[index].isCritical = totalStock > 0 && totalStock <= 5;

            setStored(KEYS.PRODUCTS, products);
            emitEvent('adr:products-updated', { products });

            // Put to Server
            try {
                await fetch(`/api/products/${encodeURIComponent(products[index].id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(products[index])
                });
            } catch (e) {
                console.warn('[SERVER SYNC PUT FAILED]', e);
            }

            return products[index];
        },

        async deleteProduct(id) {
            let products = this.getProducts();
            const targetProd = products.find(p => p.id === id || p.sku === id);
            const targetId = targetProd ? targetProd.id : id;

            products = products.filter(p => p.id !== id && p.sku !== id);
            setStored(KEYS.PRODUCTS, products);
            emitEvent('adr:products-updated', { products });

            // Delete from Server
            try {
                await fetch(`/api/products/${encodeURIComponent(targetId)}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.warn('[SERVER SYNC DELETE FAILED]', e);
            }
        },

        killProduct(id) {
            return this.updateProduct(id, { isKilled: true });
        },

        restoreProduct(id) {
            return this.updateProduct(id, { isKilled: false });
        },

        // --- 2. METADATA CLOUD SYNC API ---
        async saveMetaSection(sectionKey, data) {
            try {
                await fetch(`/api/meta/${encodeURIComponent(sectionKey)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.warn('[META SYNC FAILED]', e);
            }
        },

        // --- 3. CART API ---
        getCart() {
            return getStored(KEYS.CART, []);
        },

        addToCart(productId, size = 'M', qty = 1) {
            const product = this.getProductById(productId);
            if (!product || product.isSoldOut || product.isKilled) {
                alert('HARDWARE_EXHAUSTED: Item is currently unavailable.');
                return false;
            }

            const cart = this.getCart();
            const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

            if (existingIndex > -1) {
                cart[existingIndex].qty += qty;
            } else {
                cart.push({
                    id: product.id,
                    sku: product.sku,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    size: size,
                    qty: qty
                });
            }

            setStored(KEYS.CART, cart);
            emitEvent('adr:cart-updated', { cart, count: this.getCartCount() });
            return true;
        },

        updateCartQty(productId, size, newQty) {
            let cart = this.getCart();
            const index = cart.findIndex(item => item.id === productId && item.size === size);

            if (index > -1) {
                if (newQty <= 0) cart.splice(index, 1);
                else cart[index].qty = newQty;
                setStored(KEYS.CART, cart);
                emitEvent('adr:cart-updated', { cart, count: this.getCartCount() });
            }
        },

        removeFromCart(productId, size) {
            this.updateCartQty(productId, size, 0);
        },

        clearCart() {
            setStored(KEYS.CART, []);
            emitEvent('adr:cart-updated', { cart: [], count: 0 });
        },

        getCartCount() {
            const cart = this.getCart();
            return cart.reduce((total, item) => total + item.qty, 0);
        },

        getCartTotal() {
            const cart = this.getCart();
            return cart.reduce((total, item) => total + (item.price * item.qty), 0);
        },

        // --- 4. ORDERS API (SERVER SYNCED) ---
        getOrders() {
            return getStored(KEYS.ORDERS, []);
        },

        async createOrder(orderPayload) {
            const cart = this.getCart();
            if (cart.length === 0 && (!orderPayload.items || orderPayload.items.length === 0)) {
                throw new Error('CART_EMPTY: Cannot create empty dispatch order.');
            }

            const orders = this.getOrders();
            const itemsToOrder = orderPayload.items || cart;
            const subtotal = itemsToOrder.reduce((acc, it) => acc + (it.price * it.qty), 0);

            let discountAmount = 0;
            if (orderPayload.discountPercent) {
                discountAmount = (subtotal * orderPayload.discountPercent) / 100;
            }

            const settings = this.getSettings();
            const baseShipping = settings.shippingFee || 800;
            const freeThreshold = settings.freeShippingThreshold || 15000;
            const shippingFee = (subtotal >= freeThreshold) ? 0 : baseShipping;
            const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

            const newOrder = {
                orderId: 'ADR-' + Math.floor(10000 + Math.random() * 90000),
                customer: {
                    name: orderPayload.customer.name || 'ANONYMOUS_RUNNER',
                    email: orderPayload.customer.email || 'void@adrastia.dz',
                    phone: orderPayload.customer.phone || 'N/A',
                    address: orderPayload.customer.address || 'ALGIERS_SECTOR'
                },
                items: itemsToOrder,
                subtotal: subtotal,
                discount: discountAmount,
                shippingFee: shippingFee,
                totalAmount: totalAmount,
                currency: 'DA',
                paymentMethod: orderPayload.paymentMethod || 'COD',
                status: 'PROCESSING',
                timestamp: new Date().toISOString()
            };

            // Deduct Stock
            itemsToOrder.forEach(item => {
                const prod = this.getProductById(item.id);
                if (prod) {
                    const newTotalStock = Math.max(0, prod.totalStock - item.qty);
                    this.updateProduct(prod.id, { totalStock: newTotalStock });
                }
            });

            orders.unshift(newOrder);
            setStored(KEYS.ORDERS, orders);
            this.clearCart();
            emitEvent('adr:orders-updated', { orders });

            // Post Order to Server
            try {
                await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newOrder)
                });
            } catch (e) {
                console.warn('[SERVER ORDER POST FAILED]', e);
            }

            return newOrder;
        },

        getSettings() {
            return getStored(KEYS.SETTINGS, DEFAULT_SETTINGS);
        },

        sync: syncWithServer
    };

    window.AdrastiaStore = AdrastiaStore;

})(window);
