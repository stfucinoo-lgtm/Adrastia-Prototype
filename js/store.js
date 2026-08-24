/**
 * ==========================================================================
 * ADRASTIA // CENTRAL DATA STORE & STATE ENGINE (js/store.js)
 * Currency: Algerian Dinar (DA)
 * Version: 2.1.0 (Kill Drop Isolation & Currency Localization)
 * ==========================================================================
 */

(function (window) {
    'use strict';

    // LocalStorage Keys
    const KEYS = {
        PRODUCTS: 'ADRASTIA_PRODUCTS_V3',
        DROPS: 'ADRASTIA_DROPS_V3',
        ORDERS: 'ADRASTIA_ORDERS_V3',
        CART: 'ADRASTIA_CART_V3',
        SETTINGS: 'ADRASTIA_SETTINGS_V3'
    };

    // Default Seed Data (In Algerian Dinars - DA)
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
            description: 'Oversized fit. Hand-distressed edges. Each piece is uniquely corroded. 100% heavyweight acid-treated cotton.',
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
            description: 'Ultra-heavy fleece, cybernetic screen print on back and sleeves. Corrupted aesthetic with raw hem finish.',
            isSoldOut: false,
            isCritical: true,
            isKilled: false,
            dateAdded: '2024-11-02'
        },
        {
            id: 'prod-003',
            sku: 'ADR-003',
            name: 'STATIC LONGSLEEVE',
            collection: 'DIGITAL_DECAY',
            price: 5500,
            stock: { S: 0, M: 0, L: 0, XL: 0 },
            totalStock: 0,
            maxStock: 50,
            image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1000&auto=format&fit=crop',
            description: 'Exhausted artifact. Distorted analog noise pattern printed on black waffle-knit cotton.',
            isSoldOut: true,
            isCritical: false,
            isKilled: false,
            dateAdded: '2024-10-28'
        },
        {
            id: 'prod-004',
            sku: 'ADR-004',
            name: 'VOID_CARGO PANTS',
            collection: 'VOID_CORE',
            price: 11000,
            stock: { S: 4, M: 6, L: 5, XL: 3 },
            totalStock: 18,
            maxStock: 50,
            image: 'https://images.unsplash.com/photo-1601115867451-24874b7117fa?q=80&w=1000&auto=format&fit=crop',
            description: 'Multi-pocket tactical trousers with waterproof tech zippers and industrial webbing straps.',
            isSoldOut: false,
            isCritical: false,
            isKilled: false,
            dateAdded: '2024-11-05'
        },
        {
            id: 'prod-005',
            sku: 'ADR-005',
            name: 'DECAY_DENIM JACKET',
            collection: 'VOID_CORE',
            price: 13000,
            stock: { S: 2, M: 5, L: 4, XL: 4 },
            totalStock: 15,
            maxStock: 50,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
            description: 'Custom stonewashed rigid denim with raw shredded seams and matte black metal hardware.',
            isSoldOut: false,
            isCritical: false,
            isKilled: false,
            dateAdded: '2024-11-06'
        },
        {
            id: 'prod-006',
            sku: 'ADR-006',
            name: 'METALLURGY TEE',
            collection: 'DIGITAL_DECAY',
            price: 4000,
            stock: { S: 8, M: 10, L: 8, XL: 4 },
            totalStock: 30,
            maxStock: 50,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
            description: 'Heavy metal typography inspired by industrial brutalism. Vintage black wash treatment.',
            isSoldOut: false,
            isCritical: false,
            isKilled: false,
            dateAdded: '2024-11-07'
        }
    ];

    const DEFAULT_DROPS = [
        {
            id: 'drop-01',
            name: 'DIGITAL_DECAY',
            code: 'VOL.3',
            status: 'LIVE',
            passcode: '',
            launchDate: '2024-11-01'
        },
        {
            id: 'drop-02',
            name: 'VOID_CORE',
            code: 'VOL.4',
            status: 'LIVE',
            passcode: '',
            launchDate: '2024-11-08'
        }
    ];

    const DEFAULT_ORDERS = [
        {
            orderId: 'ADR-98442',
            customer: {
                name: 'K. Valkyrie',
                email: 'k.valkyrie@mesh.io',
                phone: '+213 555-0199',
                address: 'Hydra, Algiers Sector 4'
            },
            items: [
                { id: 'prod-002', name: 'CYBER_SKULL HOODIE', size: 'L', qty: 1, price: 8500 }
            ],
            totalAmount: 8500,
            paymentMethod: 'COD',
            status: 'DISPATCHED',
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
            orderId: 'ADR-98441',
            customer: {
                name: 'Ghost Runner',
                email: 'ghost_runner@algiers.net',
                phone: '+213 555-0142',
                address: 'Oran Unit B-12'
            },
            items: [
                { id: 'prod-001', name: 'ACID_WASH TEE', size: 'XL', qty: 2, price: 4500 },
                { id: 'prod-004', name: 'VOID_CARGO PANTS', size: 'M', qty: 1, price: 11000 }
            ],
            totalAmount: 20000,
            paymentMethod: 'CARD',
            status: 'PROCESSING',
            timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
        }
    ];

    const DEFAULT_SETTINGS = {
        killSwitch: false,
        currency: 'DA',
        promoCodes: {
            'GLITCH20': 20, // 20% off
            'VOID10': 10,   // 10% off
            'OVERRIDE': 50  // 50% VIP
        },
        shippingFee: 800, // 800 DA Standard Dispatch
        freeShippingThreshold: 15000 // Free dispatch for orders >= 15000 DA
    };

    // Internal Helper: LocalStorage Safe JSON
    function getStored(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (err) {
            console.error(`[AdrastiaStore] Error reading key: ${key}`, err);
            return fallback;
        }
    }

    function setStored(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error(`[AdrastiaStore] Error saving key: ${key}`, err);
        }
    }

    // Initialize Store on Load
    function initStore() {
        if (!localStorage.getItem(KEYS.PRODUCTS)) {
            setStored(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
        }
        if (!localStorage.getItem(KEYS.DROPS)) {
            setStored(KEYS.DROPS, DEFAULT_DROPS);
        }
        if (!localStorage.getItem(KEYS.ORDERS)) {
            setStored(KEYS.ORDERS, DEFAULT_ORDERS);
        }
        if (!localStorage.getItem(KEYS.CART)) {
            setStored(KEYS.CART, []);
        }
        if (!localStorage.getItem(KEYS.SETTINGS)) {
            setStored(KEYS.SETTINGS, DEFAULT_SETTINGS);
        }
    }

    initStore();

    function emitEvent(eventName, detail = {}) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    /**
     * ==========================================================================
     * PUBLIC STORE API
     * ==========================================================================
     */
    const AdrastiaStore = {
        currency: 'DA',

        // Currency Formatter Helper
        formatMoney(amount) {
            const num = parseFloat(amount) || 0;
            return `${num.toLocaleString('en-US')} DA`;
        },

        // --- 1. PRODUCTS API ---
        // Returns all products (for Admin Panel)
        getProducts() {
            return getStored(KEYS.PRODUCTS, []);
        },

        // Returns ONLY active, non-killed products (for Storefront, Catalog, Home, etc.)
        getActiveProducts() {
            return this.getProducts().filter(p => !p.isKilled);
        },

        getProductById(id) {
            const products = this.getProducts();
            return products.find(p => p.id === id || p.sku === id) || null;
        },

        addProduct(productData) {
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
                isKilled: false, // Active by default
                dateAdded: new Date().toISOString().split('T')[0]
            };

            if (newProduct.totalStock <= 0) {
                newProduct.isSoldOut = true;
            } else if (newProduct.totalStock <= 5) {
                newProduct.isCritical = true;
            }

            products.unshift(newProduct);
            setStored(KEYS.PRODUCTS, products);
            emitEvent('adr:products-updated', { products });
            return newProduct;
        },

        updateProduct(id, updatedFields) {
            const products = this.getProducts();
            const index = products.findIndex(p => p.id === id || p.sku === id);
            if (index === -1) return null;

            products[index] = { ...products[index], ...updatedFields };

            const totalStock = products[index].totalStock;
            products[index].isSoldOut = totalStock <= 0;
            products[index].isCritical = totalStock > 0 && totalStock <= 5;

            setStored(KEYS.PRODUCTS, products);
            emitEvent('adr:products-updated', { products });
            return products[index];
        },

        deleteProduct(id) {
            let products = this.getProducts();
            products = products.filter(p => p.id !== id && p.sku !== id);
            setStored(KEYS.PRODUCTS, products);
            emitEvent('adr:products-updated', { products });
        },

        // KILL DROP: Completely deactivates product from storefront
        killProduct(id) {
            return this.updateProduct(id, {
                isKilled: true
            });
        },

        // RESTORE DROP: Reactivates product back to storefront
        restoreProduct(id) {
            return this.updateProduct(id, {
                isKilled: false
            });
        },

        // --- 2. DROPS API ---
        getDrops() {
            return getStored(KEYS.DROPS, []);
        },

        addDrop(dropData) {
            const drops = this.getDrops();
            const newDrop = {
                id: 'drop-' + Date.now(),
                name: (dropData.name || 'NEW_DROP').toUpperCase(),
                code: dropData.code || 'VOL.' + (drops.length + 1),
                status: dropData.status || 'LIVE',
                passcode: dropData.passcode || '',
                launchDate: dropData.launchDate || new Date().toISOString().split('T')[0]
            };
            drops.push(newDrop);
            setStored(KEYS.DROPS, drops);
            emitEvent('adr:drops-updated', { drops });
            return newDrop;
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
                if (newQty <= 0) {
                    cart.splice(index, 1);
                } else {
                    cart[index].qty = newQty;
                }
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

        // --- 4. ORDERS API ---
        getOrders() {
            return getStored(KEYS.ORDERS, []);
        },

        createOrder(orderPayload) {
            const cart = this.getCart();
            if (cart.length === 0 && (!orderPayload.items || orderPayload.items.length === 0)) {
                throw new Error('CART_EMPTY: Cannot create empty dispatch order.');
            }

            const orders = this.getOrders();
            const itemsToOrder = orderPayload.items || cart;
            const subtotal = itemsToOrder.reduce((acc, it) => acc + (it.price * it.qty), 0);

            // Apply Discount if exists
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
            return newOrder;
        },

        updateOrderStatus(orderId, newStatus) {
            const orders = this.getOrders();
            const order = orders.find(o => o.orderId === orderId);
            if (order) {
                order.status = newStatus;
                setStored(KEYS.ORDERS, orders);
                emitEvent('adr:orders-updated', { orders });
                return order;
            }
            return null;
        },

        // --- 5. SETTINGS & PROMO CODES ---
        getSettings() {
            return getStored(KEYS.SETTINGS, DEFAULT_SETTINGS);
        },

        validatePromoCode(code) {
            if (!code) return { valid: false, discount: 0 };
            const settings = this.getSettings();
            const cleanCode = code.trim().toUpperCase();
            if (settings.promoCodes && settings.promoCodes[cleanCode]) {
                return {
                    valid: true,
                    code: cleanCode,
                    discount: settings.promoCodes[cleanCode]
                };
            }
            return { valid: false, discount: 0 };
        },

        fileToBase64(file) {
            return new Promise((resolve, reject) => {
                if (!file) {
                    reject('No file provided');
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        },

        factoryReset() {
            localStorage.removeItem(KEYS.PRODUCTS);
            localStorage.removeItem(KEYS.DROPS);
            localStorage.removeItem(KEYS.ORDERS);
            localStorage.removeItem(KEYS.CART);
            localStorage.removeItem(KEYS.SETTINGS);
            initStore();
            emitEvent('adr:cart-updated', { cart: [], count: 0 });
            emitEvent('adr:products-updated', { products: DEFAULT_PRODUCTS });
        }
    };

    window.AdrastiaStore = AdrastiaStore;

})(window);
