const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer'); // Import multer
const path = require('path'); // Om bestandsnamen te verwerken
const app = express();

// Configureer multer opslag
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Bestanden opslaan in de uploads map
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Bestandsnaam aanpassen om conflicten te voorkomen
    }
});
const upload = multer({ storage: storage }); // Multer upload middleware

app.use(cors());
app.use(express.json()); // Nodig om JSON body correct te verwerken
app.use('/uploads', express.static('uploads')); // Maak de uploads map publiekelijk toegankelijk

// Databaseverbinding
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pc_builder'
});

db.connect(err => {
    if (err) {
        console.error('Fout bij de databaseverbinding:', err);
        return;
    }
    console.log('✅ Verbinding met de database is succesvol!');
});

// ✅ Ophalen van producten
app.get('/products', (req, res) => {
    const query = `
        SELECT products.product_id, products.name, products.description, products.price, products.image_url, categories.name AS category
        FROM products
        JOIN categories ON products.category_id = categories.category_id
        ORDER BY categories.name, products.name;
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Fout bij ophalen van producten:', err);
            return res.status(500).json({ error: 'Fout bij ophalen van producten' });
        }

        console.log('📦 Gevonden producten:', results);

        const groupedProducts = results.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = [];
            }
            acc[product.category].push(product);
            return acc;
        }, {});

        res.json(groupedProducts);
    });
});

// ✅ Ophalen van de huidige servicekosten
app.get('/service-fee', (req, res) => {
    const query = 'SELECT value FROM settings WHERE name = "service_fee" LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Fout bij ophalen van servicekosten:', err);
            return res.status(500).json({ error: 'Fout bij ophalen servicekosten' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Servicekosten niet gevonden' });
        }

        res.json({ serviceFee: parseFloat(results[0].value) });
    });
});

// ✅ Bijwerken van de servicekosten
app.post('/update-service-fee', (req, res) => {
    const { serviceFee } = req.body;

    if (isNaN(serviceFee) || serviceFee <= 0) {
        return res.status(400).json({ error: 'Ongeldige waarde voor servicekosten' });
    }

    const query = 'UPDATE settings SET value = ? WHERE name = "service_fee"';
    db.query(query, [serviceFee], (err, results) => {
        if (err) {
            console.error('❌ Fout bij bijwerken servicekosten:', err);
            return res.status(500).json({ error: 'Fout bij bijwerken servicekosten' });
        }

        if (results.affectedRows === 0) {
            return res.status(400).json({ error: 'Servicekosten konden niet worden bijgewerkt' });
        }

        res.json({ success: true });
    });
});


// ✅ Ophalen van categorieën
app.get('/categories', (req, res) => {
    const query = 'SELECT * FROM categories';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Fout bij ophalen van categorieën:', err);
            return res.status(500).json({ error: 'Fout bij ophalen van categorieën' });
        }

        console.log('📦 Gevonden categorieën:', results);
        res.json(results);
    });
});

// ✅ Toevoegen van een nieuw product
app.post('/products', upload.single('image'), (req, res) => {  // 'image' is de naam van de form field
    const { name, description, price, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !description || !price || !image_url || !category) {
        return res.status(400).json({ error: 'Vul alle velden in' });
    }

    // Haal de category_id op uit de database
    const categoryQuery = 'SELECT category_id FROM categories WHERE name = ? LIMIT 1';
    db.query(categoryQuery, [category], (err, results) => {
        if (err) {
            console.error('❌ Fout bij ophalen categorie:', err);
            return res.status(500).json({ error: 'Databasefout bij ophalen categorie' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Categorie bestaat niet' });
        }

        const category_id = results[0].category_id;

        // Voeg het product toe aan de database
        const insertQuery = `
            INSERT INTO products (name, description, price, image_url, category_id) 
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertQuery, [name, description, price, image_url, category_id], (err, result) => {
            if (err) {
                console.error('❌ Fout bij toevoegen van product:', err);
                return res.status(500).json({ error: 'Fout bij toevoegen van product' });
            }

            console.log('✅ Product succesvol toegevoegd:', result.insertId);
            res.status(201).json({ message: 'Product toegevoegd', product_id: result.insertId });
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log('🚀 Server draait op http://localhost:3000');
});
