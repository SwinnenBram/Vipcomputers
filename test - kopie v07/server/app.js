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
        ORDER BY products.category_id, products.name;
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Fout bij ophalen van producten:', err); // Log de fout naar de console
            return res.status(500).json({ error: 'Fout bij ophalen van producten' });
        }

        // Groeperen van de producten op basis van categorie
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
    const query = 'SELECT * FROM categories ORDER BY category_id';  // Sorteer op category_id om volgorde in DB te respecteren
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Fout bij ophalen van categorieën:', err);
            return res.status(500).json({ error: 'Fout bij ophalen van categorieën' });
        }

        console.log('📦 Gevonden categorieën:', results);
        res.json(results);  // Geef de categorieën terug zoals ze zijn opgehaald
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

// ✅ Kortingscode toepassen
app.post('/apply-discount', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Kortingscode moet opgegeven worden' });
    }

    const query = 'SELECT * FROM discounts WHERE LOWER(code) = LOWER(?) AND is_active = 1 AND expiration_date >= CURDATE()';

    db.query(query, [code], (err, results) => {
        if (err) {
            console.error('❌ Fout bij controleren kortingscode:', err);
            return res.status(500).json({ error: 'Fout bij controleren kortingscode' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Ongeldige of verlopen kortingscode' });
        }

        // Haal de kortingscode informatie op
        const discount = results[0];

        // Als de korting percentage is, bereken het op basis van het totaalbedrag
        if (discount.discount_type === 'percentage') {
            const discount_value = discount.discount_value; // Percentage korting
            res.json({ discount_value: discount_value, type: 'percentage' });
        } else {
            // Vaste korting
            const discount_value = discount.discount_value;
            res.json({ discount_value: discount_value, type: 'fixed' });
        }
    });
});

// ✅ Ophalen van kortingscodes
app.get('/get-discounts', (req, res) => {
    const query = 'SELECT * FROM discounts WHERE is_active = 1 AND expiration_date >= CURDATE()'; // Alleen actieve en niet-verlopen kortingscodes ophalen
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Fout bij ophalen van kortingscodes:', err);
            return res.status(500).json({ error: 'Fout bij ophalen kortingscodes' });
        }

        console.log('📦 Gevonden kortingscodes:', results);
        res.json(results);  // Geef de kortingscodes terug als JSON
    });
});

// ✅ Toevoegen van een nieuwe kortingscode
app.post('/add-discount', (req, res) => {
    const { code, discount_value, discount_type, expiration_date } = req.body;

    // Valideer de input
    if (!code || !discount_value || !discount_type || !expiration_date) {
        return res.status(400).json({ success: false, error: 'Alle velden zijn verplicht!' });
    }

    // Zorg ervoor dat discount_value een getal is
    const value = parseFloat(discount_value);
    if (isNaN(value) || value <= 0) {
        return res.status(400).json({ success: false, error: 'De kortingswaarde is ongeldig!' });
    }

    // Maak het nieuwe kortingscode-object
    const newDiscount = {
        code,
        discount_value: value,  // Zorg ervoor dat discount_value een getal is
        discount_type,          // Sla het type op (percentage of vast)
        expiration_date
    };

    // Voeg de kortingscode toe aan de MySQL database
    const query = `
        INSERT INTO discounts (code, discount_value, discount_type, expiration_date)
        VALUES (?, ?, ?, ?)
    `;
    
    db.query(query, [newDiscount.code, newDiscount.discount_value, newDiscount.discount_type, newDiscount.expiration_date], (err, result) => {
        if (err) {
            console.error('❌ Fout bij het opslaan van kortingscode:', err);
            return res.status(500).json({ success: false, error: 'Er is een fout opgetreden bij het toevoegen van de kortingscode.' });
        }

        console.log('✅ Kortingscode succesvol toegevoegd:', result.insertId);
        res.status(200).json({ success: true });
    });
});

// ✅ Verwijderen van een kortingscode
app.delete('/delete-discount/:id', (req, res) => {
    const discountId = req.params.id;

    // Verwijder de kortingscode uit de database, gebruik de juiste kolomnaam 'id'
    const query = 'DELETE FROM discounts WHERE id = ?';

    db.query(query, [discountId], (err, result) => {
        if (err) {
            console.error('❌ Fout bij het verwijderen van de kortingscode:', err);
            return res.status(500).json({ error: 'Fout bij het verwijderen van de kortingscode' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Kortingscode niet gevonden' });
        }

        console.log('✅ Kortingscode succesvol verwijderd:', discountId);
        res.status(200).json({ success: true });
    });
});

// ✅ Bijwerken van de status van een kortingscode (actief of inactief)
app.put('/update-discount-status/:id', (req, res) => {
    const discountId = req.params.id;   // Haal de kortingscode-id uit de URL
    const { isActive } = req.body;      // Haal de nieuwe status uit de request body

    // Controleer of de status geldig is (kan 1 of 0 zijn)
    if (isActive !== 0 && isActive !== 1) {
        return res.status(400).json({ error: 'Ongeldige waarde voor is_active. Gebruik 1 voor actief of 0 voor inactief.' });
    }

    // Update de is_active kolom in de database
    const query = 'UPDATE discounts SET is_active = ? WHERE id = ?';

    db.query(query, [isActive, discountId], (err, result) => {
        if (err) {
            console.error('❌ Fout bij het bijwerken van de kortingscode status:', err);
            return res.status(500).json({ error: 'Fout bij het bijwerken van de kortingscode status' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Kortingscode niet gevonden' });
        }

        console.log('✅ Kortingscode status succesvol bijgewerkt:', discountId);
        res.status(200).json({ success: true });
    });
});

// Start server
app.listen(3000, () => {
    console.log('🚀 Server draait op http://localhost:3000');
});
