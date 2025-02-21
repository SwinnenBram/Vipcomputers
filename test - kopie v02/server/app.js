const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // Nodig om JSON body correct te verwerken

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
    res.setHeader('Cache-Control', 'no-store');

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
app.post('/products', (req, res) => {
    const { name, description, price, image_url, category } = req.body;

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
