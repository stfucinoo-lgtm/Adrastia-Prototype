/**
 * ==========================================================================
 * ADRASTIA // NODE.JS & EXPRESS BACKEND SERVER (server.js)
 * Architecture: REST API Data Engine & Static File Server for Render.com
 * Version: 3.0.0
 * ==========================================================================
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'adrastia_db.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve all frontend static files (HTML, CSS, JS, Images, Audio)
app.use(express.static(path.join(__dirname)));

// Initial Default Database Schema
const DEFAULT_DATABASE = {
    products: [
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
    ],
    drops: [
        { id: 'drop-01', name: 'DIGITAL_DECAY', code: 'VOL.3', status: 'LIVE', launchDate: '2024-11-01' },
        { id: 'drop-02', name: 'VOID_CORE', code: 'VOL.4', status: 'LIVE', launchDate: '2024-11-08' }
    ],
    orders: [],
    settings: {
        currency: 'DA',
        promoCodes: { 'GLITCH20': 20, 'VOID10': 10, 'OVERRIDE': 50 },
        shippingFee: 800,
        freeShippingThreshold: 15000
    },
    meta: {
        collection: {
            title: "VOID_CORE",
            status: "// STATUS: LIVE // INVENTORY: CRITICAL",
            description: "A brutalist exploration of the empty spaces between the digital and physical worlds. Limited to 50 pieces per garment. No restocks.",
            image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=1200&auto=format&fit=crop"
        },
        homeManifesto: {
            title: "WE ARE <br><span class=\"neon-pink\">THE GLITCH</span> <br>IN THE SYSTEM.",
            desc: "Born from digital static and concrete. Adrastia isn't just clothing; it's a rejection of polished, algorithmic fashion. Wear the chaos.",
            image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2000&auto=format&fit=crop"
        },
        lookbook: {
            title: "// VOL.2: DIGITAL_DECAY",
            subtitle: "A VISUAL EXPLORATION OF URBAN CORRUPTION AND Y2K NOSTALGIA.",
            narrativeTitle: "REJECT THE <br><span class=\"neon-green\">ALGORITHM.</span>",
            p1: "Volume 2 was born from the static of broken CRT monitors and the concrete of underground rave venues.",
            p2: "Every piece in DIGITAL_DECAY is distressed, acid-washed, or misprinted by design."
        },
        manifesto: {
            heroTitle: "SYSTEM_FAILURE",
            heroSubtext: "[ WE ARE NOT A FASHION BRAND. WE ARE A GLITCH. ]",
            headerBg: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?q=80&w=2564&auto=format&fit=crop",
            originTitle: "BORN IN <br><span class=\"neon-pink\">STATIC.</span>",
            originP1: "Adrastia started in a damp basement in 2024, born out of pure exhaustion with algorithm-dictated trends.",
            originP2: "We don't design for the masses. We design for the digital ghosts.",
            originImage: "https://images.unsplash.com/photo-1606240212005-cb6757b320d7?q=80&w=1000&auto=format&fit=crop",
            processHeading: "THE_PROCESS // ALGORITHM BYPASS",
            process: [
                { num: "01.", title: "CORRUPTION", desc: "We source heavy blanks and immediately begin destroying them." },
                { num: "02.", title: "SCREEN_PRINTING", desc: "Corrupted graphics hand-screened using neon inks." },
                { num: "03.", title: "THE_DROP", desc: "Strictly limited runs. Speed is survival." }
            ],
            teamHeading: "THE_CREW // ARCHITECTS OF DECAY",
            team: [
                { name: "XEN // FOUNDER", role: "CREATIVE_DIRECTOR", bio: "Strictly deals in vectors and chaos.", track: "Crystal Castles - Crimewave", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" },
                { name: "K4L // PRINTER", role: "LEAD_MANUFACTURING", bio: "Hates perfectly registered prints.", track: "Death Grips - Guillotine", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=800&auto=format&fit=crop" },
                { name: "ZERO // WEB", role: "DIGITAL_ARCHITECT", bio: "Lives in the terminal.", track: "Aphex Twin - Vordhosbn", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop" }
            ]
        },
        soundtrack: {
            url: "https://assets.mixkit.co/music/preview/mixkit-cyber-city-dark-synthwave-1188.mp3"
        }
    }
};

// Database Helpers
function readDatabase() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATABASE, null, 2), 'utf8');
            return DEFAULT_DATABASE;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('[DATABASE READ ERROR]', err);
        return DEFAULT_DATABASE;
    }
}

function writeDatabase(db) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('[DATABASE WRITE ERROR]', err);
        return false;
    }
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Full State Sync
app.get('/api/sync', (req, res) => {
    const db = readDatabase();
    res.json({ success: true, data: db });
});

// 2. Products API
app.get('/api/products', (req, res) => {
    const db = readDatabase();
    res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
    const db = readDatabase();
    const newProduct = req.body;
    db.products = db.products || [];
    db.products.unshift(newProduct);
    writeDatabase(db);
    res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
    const db = readDatabase();
    const { id } = req.params;
    const updatedFields = req.body;
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    db.products[index] = { ...db.products[index], ...updatedFields };
    writeDatabase(db);
    res.json({ success: true, product: db.products[index] });
});

app.delete('/api/products/:id', (req, res) => {
    const db = readDatabase();
    const { id } = req.params;
    db.products = db.products.filter(p => p.id !== id);
    writeDatabase(db);
    res.json({ success: true });
});

// 3. Metadata Endpoints (Collection, Lookbook, Manifesto, Homepage, Audio)
app.get('/api/meta/:section', (req, res) => {
    const db = readDatabase();
    const { section } = req.params;
    res.json(db.meta[section] || {});
});

app.post('/api/meta/:section', (req, res) => {
    const db = readDatabase();
    const { section } = req.params;
    db.meta = db.meta || {};
    db.meta[section] = req.body;
    writeDatabase(db);
    res.json({ success: true, data: db.meta[section] });
});

// 4. Orders API
app.get('/api/orders', (req, res) => {
    const db = readDatabase();
    res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
    const db = readDatabase();
    const newOrder = req.body;
    db.orders = db.orders || [];
    db.orders.unshift(newOrder);

    // Deduct Stock on Server
    if (newOrder.items && Array.isArray(newOrder.items)) {
        newOrder.items.forEach(item => {
            const prod = db.products.find(p => p.id === item.id);
            if (prod) {
                prod.totalStock = Math.max(0, prod.totalStock - item.qty);
                if (prod.totalStock <= 0) prod.isSoldOut = true;
                if (prod.totalStock > 0 && prod.totalStock <= 5) prod.isCritical = true;
            }
        });
    }

    writeDatabase(db);
    res.json({ success: true, order: newOrder });
});

// Fallback Route for SPA navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`[ADRASTIA // SERVER ACTIVE] Running on port: ${PORT}`);
});
