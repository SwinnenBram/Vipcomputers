require('dotenv').config();  // Zorgt ervoor dat de variabelen in .env worden ingelezen
const nodemailer = require('nodemailer');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer'); // Import multer
const path = require('path'); // Om bestandsnamen te verwerken
const app = express();
const port = 3001;
const fetch = require('node-fetch');
const postmark = require('postmark'); // Importeer de Postmark client



// Maak verbinding met de Gmail SMTP-server
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Gebruik Gmail's SMTP-service
    auth: {
        user: process.env.EMAIL_USER,  // Haal je e-mail uit het .env bestand
        pass: process.env.EMAIL_PASS   // Haal je app-specifieke wachtwoord uit het .env bestand
    }
});

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





app.use(express.json());
app.use(express.json());

// mails versturen
app.post('/send-offer', async (req, res) => {
    const offer = req.body;

    console.log('Ontvangen offerte:', offer);

    // Controleer of alle benodigde gegevens beschikbaar zijn
    if (!offer || !offer.email || !offer.name || !offer.products || offer.products.length === 0) {
        console.error('Fout: Ontbrekende gegevens in de offerte');
        return res.status(400).json({ success: false, message: 'Ontbrekende gegevens in de offerte' });
    }

    // **Stap 1: Stuur de offerte naar Formspree** (optioneel)
    const formData = new URLSearchParams();
    formData.append('name', offer.name);
    formData.append('email', offer.email);
    formData.append('phone', offer.phone || 'Niet opgegeven');
    formData.append('address', offer.address || 'Niet opgegeven');
    formData.append('products', offer.products.map(item => `${item.name} - €${item.price}`).join(', '));
    formData.append('total', `€${offer.total}`);

    try {
        const response = await fetch('https://formspree.io/f/xanqpbeb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Fout bij Formspree');
        }

        console.log('E-mail succesvol verzonden via Formspree');

        // **Stap 2: Gebruik Nodemailer om de offerte naar de klant te sturen via Gmail**
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Gmail SMTP
            auth: {
                user: 'bramswinnen1@gmail.com',  // Vervang door je Gmail-adres
                pass: 'mgoxlowhwjpudbdl'  // Dit is je app-specifieke wachtwoord (zie vorige uitleg)
            }
        });

        const mailOptions = {
            from: 'bramswinnen1@gmail.com',  // Je Gmail-adres
            to: offer.email, // E-mail van de klant
            subject: 'Jouw samengestelde offerte',
            text: `Offerte voor jouw samengestelde PC:
            
Naam ${offer.name}
Email: ${offer.email}
Telefoon: ${offer.phone || 'Niet opgegeven'}
Adres: ${offer.address || 'Niet opgegeven'}

Indien deze gegevens niet kloppen gelieven een mail te sturen naar ${offer.from}.

Samengestelde producten:
${offer.products.map(item => `${item.name} - €${item.price}`).join('\n')}

Totaalprijs: €${offer.total}`,
            html: `
                <h2>Offerte voor jouw samengestelde PC</h2>
                <p>Beste ${offer.name} , bij deze u offerte van u samengestelde PC.</p>
                <p>U Email: ${offer.email}</p>
                <p>U Telefoon: ${offer.phone || 'Niet opgegeven'}</p>
                <p>U Adres: ${offer.address || 'Niet opgegeven'}</p>
                <p>Indien deze gegevens niet kloppen gelieven contact op te nemen met ons<p>
                
                <h3>Samengestelde producten:</h3>
                <table border="1" cellpadding="5">
                    <thead>
                        <tr>
                            <th>Categorie</th>
                            <th>Product</th>
                            <th>Prijs</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${offer.products.map(item => `
                            <tr>
                                <td>${item.category}</td>
                                <td>${item.name}</td>
                                <td>€${item.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p><strong>Totaalprijs(inclusief service fee): €${offer.total}</strong></p>

            `
        };

        // Verstuur de e-mail via Gmail SMTP
        await transporter.sendMail(mailOptions);
        console.log('Offerte succesvol verzonden naar klant via Gmail!');

        res.status(200).json({ success: true, message: 'Offerte is verstuurd naar klant en Formspree' });

    } catch (error) {
        console.error('Fout bij het verzenden van de e-mail:', error);
        res.status(500).json({ success: false, message: 'Fout bij het versturen van de offerte' });
    }
});

// ✅ Ophalen van producten
app.get('/products', async (req, res) => {
    try {
        const tables = [
            'Behuizingen', 'Voedingen', 'Moederborden', 'CPU', 'RAM', 'SSD', 'Tweede_SSD', 
            'Video_Kaart', 'Software', 'Antivirus', 'Toetsenbord_En_Muis', 'Printers', 'Optionele_Extra', 'Koeling',
            'Netwerkkaart', 'Geluidkaart', 'CPU_KOELING', 'Optische_Drive', 'Extra_Opslag'
        ];

        let products = {};

        for (const table of tables) {
            const query = `SELECT id, name, description, price, image_url FROM ${table}`;
            const [rows] = await db.promise().query(query);

            if (rows.length > 0) {
                products[table] = rows;
            }
        }

        res.json(products);
    } catch (error) {
        console.error('❌ Fout bij ophalen van producten:', error);
        res.status(500).json({ error: 'Fout bij ophalen van producten' });
    }
});

// Pas de server-aanroep aan om dynamisch de juiste tabel te kiezen
app.get('/products/id', async (req, res) => {
    try {
        const { name, category } = req.query;

        // Log de binnenkomende parameters voor debugging
        console.log('🔍 Ontvangen product naam:', name);
        console.log('🔍 Ontvangen categorie:', category);

        if (!name || !category) {
            return res.status(400).json({ error: 'Productnaam en categorie zijn vereist' });
        }

        // Controleer of de category daadwerkelijk een geldige tabelnaam is
        const validCategories = [
            'Behuizingen', 'Voedingen', 'Moederborden', 'CPU', 'CPU_KOELING', 
            'RAM', 'SSD', 'Tweede_SSD', 'Video_Kaart', 'Koeling', 'Optische_Drive', 
            'Netwerkkaart', 'Geluidkaart', 'Software', 'Antivirus', 'Beeldscherm', 
            'Toetsenbord_En_Muis', 'Printers', 'Optionele_Extra', 'Extra_Opslag'
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Ongeldige categorie' });
        }

        // Dynamisch de juiste tabel selecteren op basis van de categorie
        const tableName = category; // De categorie is nu de tabelnaam
        
        // Controleer of de naam veilig is om te gebruiken in de query (sanitizing input)
        const query = `SELECT id FROM ${tableName} WHERE name = ?`;
        const [rows] = await db.promise().query(query, [name]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product niet gevonden' });
        }

        // Stuur de gevonden product_id terug
        res.json({ product_id: rows[0].id });
    } catch (error) {
        console.error('❌ Fout bij ophalen product ID:', error);
        res.status(500).json({ error: 'Fout bij ophalen product ID' });
    }
});


app.get('/compatible_components', async (req, res) => {
    try {
        const { selected_component, component_id } = req.query;
        let compatibleComponents = {};
        let incompatibleComponents = {};

        // Algemene foutmeldingen per component
        const addIncompatible = (componentType, message) => {
            if (!incompatibleComponents[componentType]) {
                incompatibleComponents[componentType] = [];
            }
            incompatibleComponents[componentType].push(message);
        };

        // Controleer compatibiliteit op basis van de geselecteerde component
        if (selected_component === 'behuizingen') {
            const query = `
                SELECT * FROM moederborden 
                WHERE form_factor IN (SELECT form_factor FROM behuizingen WHERE id = ?)
            `;
            const [rows] = await db.promise().query(query, [component_id]);
            if (rows.length === 0) {
                addIncompatible('moederborden', 'Geen moederborden compatibel met deze behuizing');
            } else {
                compatibleComponents['moederborden'] = rows;
            }
        } else if (selected_component === 'moederborden') {
            // CPU Compatibiliteit
            const queryCPU = `
                SELECT * FROM cpu 
                WHERE socket = (SELECT socket FROM moederborden WHERE id = ?)
            `;
            const [cpuRows] = await db.promise().query(queryCPU, [component_id]);
            if (cpuRows.length === 0) {
                addIncompatible('cpu', 'Geen CPU compatibel met dit moederbord');
            } else {
                compatibleComponents['cpu'] = cpuRows;
            }

            // RAM Compatibiliteit
            const queryRAM = `
                SELECT * FROM ram 
                WHERE type IN (SELECT ram_type FROM moederborden WHERE id = ?)
            `;
            const [ramRows] = await db.promise().query(queryRAM, [component_id]);
            if (ramRows.length === 0) {
                addIncompatible('ram', 'Geen RAM compatibel met dit moederbord');
            } else {
                compatibleComponents['ram'] = ramRows;
            }

            // SSD Compatibiliteit
            const querySSD = `
                SELECT * FROM ssd 
                WHERE interface IN (SELECT ssd_interface FROM moederborden WHERE id = ?)
            `;
            const [ssdRows] = await db.promise().query(querySSD, [component_id]);
            if (ssdRows.length === 0) {
                addIncompatible('ssd', 'Geen SSD compatibel met dit moederbord');
            } else {
                compatibleComponents['ssd'] = ssdRows;
            }
        } else if (selected_component === 'cpu') {
            const query = `
                SELECT * FROM moederborden 
                WHERE socket = (SELECT socket FROM cpu WHERE id = ?)
            `;
            const [rows] = await db.promise().query(query, [component_id]);
            if (rows.length === 0) {
                addIncompatible('moederborden', 'Geen moederborden compatibel met deze CPU');
            } else {
                compatibleComponents['moederborden'] = rows;
            }
        } else if (selected_component === 'voedingen') {
            // Video Kaart Compatibiliteit
            const query = `
                SELECT * FROM video_kaart 
                WHERE vram <= (SELECT wattage FROM voedingen WHERE id = ?)
            `;
            const [rows] = await db.promise().query(query, [component_id]);
            if (rows.length === 0) {
                addIncompatible('video_kaart', 'Geen video kaart compatibel met deze voeding');
            } else {
                compatibleComponents['video_kaart'] = rows;
            }
        } else if (selected_component === 'ram') {
            // Moederbord Compatibiliteit
            const query = `
                SELECT * FROM moederborden
                WHERE ram_type = (SELECT ram_type FROM ram WHERE id = ?)
            `;
            const [rows] = await db.promise().query(query, [component_id]);
            if (rows.length === 0) {
                addIncompatible('moederborden', 'Geen moederborden compatibel met dit RAM');
            } else {
                compatibleComponents['moederborden'] = rows;
            }
        } else if (selected_component === 'ssd') {
            // Moederbord Compatibiliteit
            const query = `
                SELECT * FROM moederborden
                WHERE ssd_interface = (SELECT ssd_interface FROM ssd WHERE id = ?)
            `;
            const [rows] = await db.promise().query(query, [component_id]);
            if (rows.length === 0) {
                addIncompatible('moederborden', 'Geen moederborden compatibel met deze SSD');
            } else {
                compatibleComponents['moederborden'] = rows;
            }
        } else if (selected_component === 'video_kaart') {
            // Voeding Compatibiliteit
            const query = `
                SELECT * FROM voedingen
                WHERE wattage >= (SELECT vram FROM video_kaart WHERE id = ?)
            `;
            const [rows] = await db.promise().query(query, [component_id]);
            if (rows.length === 0) {
                addIncompatible('voedingen', 'Geen voedingen compatibel met deze video kaart');
            } else {
                compatibleComponents['voedingen'] = rows;
            }
        }

        // Controleer alle componenten en geef compatibiliteit en incompatibiliteit terug
        if (Object.keys(incompatibleComponents).length === 0) {
            res.json({
                message: 'Alle componenten zijn compatibel.',
                compatibleComponents,
                incompatibleComponents: null
            });
        } else {
            res.json({
                message: 'Er zijn incompatibele componenten.',
                compatibleComponents,
                incompatibleComponents
            });
        }
        
    } catch (error) {
        console.error('❌ Fout bij ophalen van compatibele componenten:', error);
        res.status(500).json({ error: 'Fout bij ophalen van compatibele componenten' });
    }
});






function fetchCompatibleComponents(selectedCategory, selectedId) {
    console.log(`🔍 Debug: fetchCompatibleComponents aangeroepen met:`, { selectedCategory, selectedId });

    // Zorg ervoor dat selectedId geldig is
    if (!selectedId) {
        console.error("❌ component_id ontbreekt of is ongeldig:", selectedId);

        // Extra debug: Probeer de ID opnieuw op te halen uit de HTML
        const selectedElement = document.querySelector(".jouw-klas-of-id"); 
        if (selectedElement) {
            console.log("📌 Gevonden element:", selectedElement);
            console.log("📌 Mogelijke ID:", selectedElement.dataset.id);
        } else {
            console.warn("⚠️ Geen element gevonden, controleer de HTML-structuur.");
        }

        return; // Stop hier als de ID ongeldig is
    }

    // Zorg ervoor dat de categorie goed wordt opgemaakt (hoofdletters behouden, tenzij nodig)
    const formattedCategory = selectedCategory.trim(); // Verwijder eventueel onnodige spaties

    console.log(`📡 Ophalen compatibele componenten voor: ${formattedCategory}, ID: ${selectedId}`);

    // Zorg ervoor dat de URL correct is geencodeerd
    const url = `http://localhost:3000/compatible_components?selected_component=${encodeURIComponent(formattedCategory)}&component_id=${encodeURIComponent(selectedId)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Debugging foutmelding bij een niet-succesvolle HTTP-status
                throw new Error(`HTTP fout! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Compatibele componenten ontvangen:', data);
            // Zorg ervoor dat de productlijst goed wordt geüpdatet
            updateProductList(data);
        })
        .catch(err => {
            // Bied meer gedetailleerde foutinformatie bij een fetch-fout
            console.error('❌ Fout bij ophalen compatibele componenten:', err);
        });
}





// Route voor het afrekenen
app.post('/checkout', (req, res) => {
    const { cartItems } = req.body;  // De winkelwagenitems die de gebruiker heeft geselecteerd

    // Haal de verplichte categorieën op uit de database
    db.query('SELECT name FROM categories WHERE required = TRUE', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Fout bij het ophalen van verplichte categorieën' });
        }

        // Zet de resultaten om naar een lijst van verplichte categorieën
        const requiredCategories = results.map(row => row.name);

        // Haal de categorieën van de producten in de winkelwagen op
        const cartCategories = cartItems.map(item => item.category);

        // Controleer of alle verplichte categorieën in de winkelwagen zitten
        const missingCategories = requiredCategories.filter(cat => !cartCategories.includes(cat));

        // Als er verplichte categorieën ontbreken, stuur een foutmelding
        if (missingCategories.length > 0) {
            return res.status(400).json({
                error: `De volgende verplichte categorieën ontbreken in je winkelwagen: ${missingCategories.join(', ')}`
            });
        }

        // Als alles ok is, ga door met het afrekenproces
        res.status(200).json({ message: 'Winkelwagen is klaar voor afrekenen!' });
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


// Endpoint om producten toe te voegen
app.post('/products', upload.single('image'), (req, res) => {
    console.log("📥 Nieuw product toevoegen ontvangen!");
    console.log("📝 Ontvangen form data:", req.body);
    console.log("📷 Ontvangen afbeelding:", req.file ? req.file.filename : "Geen afbeelding geüpload");

    const { name, description, price, category, ...extraFields } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Validatie van inputvelden
    if (!name || !description || !price || !category) {
        console.error("❌ Validatiefout: Een of meer velden ontbreken!");
        return res.status(400).json({ error: 'Vul alle velden in' });
    }

    console.log("✅ Alle verplichte velden aanwezig.");

    // Mapping van categorieën naar hun respectievelijke tabellen
    const tableMap = {
        'Behuizingen': 'Behuizingen',
        'Voedingen': 'Voedingen',
        'Moederborden': 'Moederborden',
        'CPU': 'CPU',
        'CPU_Koeling': 'CPU_KOELING',
        'RAM': 'RAM',
        'SSD': 'SSD',
        'Tweede_SSD': 'Tweede_SSD',
        'Video_Kaart': 'Video_Kaart',
        'Koeling': 'Koeling',
        'Optische_Drive': 'Optische_Drive',
        'Netwerkkaart': 'Netwerkkaart',
        'Geluidkaart': 'Geluidkaart',
        'Software': 'Software',
        'Antivirus': 'Antivirus',
        'Beeldscherm': 'Beeldscherm',
        'Toetsenbord_En_Muis': 'Toetsenbord_En_Muis',
        'Printer': 'Printers',
        'Optionele_Extra': 'Optionele_Extra',
        'Extra_Opslag': 'Extra_Opslag'
    };

    const tableName = tableMap[category];
    if (!tableName) {
        console.error("❌ Ongeldige categorie:", category);
        return res.status(400).json({ error: 'Ongeldige categorie' });
    }

    console.log(`🔍 Product wordt toegevoegd aan tabel: ${tableName}`);

    // Extra velden per categorie
    const categoryFields = {
        'Behuizingen': ['form_factor', 'max_gpu_length', 'max_cooler_height'],
        'Voedingen': ['wattage', 'efficiency_rating', 'modular'],
        'Moederborden': ['socket', 'chipset', 'form_factor', 'max_ram', 'ram_slots'],
        'CPU': ['socket', 'generation', 'cores', 'threads', 'base_clock', 'boost_clock', 'tdp'],
        'RAM': ['capacity', 'speed', 'type'],
        'SSD': ['capacity', 'interface'],
        'Tweede_SSD': ['capacity', 'interface'],
        'Video_Kaart': ['chipset', 'vram', 'core_clock', 'boost_clock'],
        'Software': ['license_type', 'platform'],
        'Antivirus': ['duration'],
        'Beeldscherm': ['size', 'resolution', 'refresh_rate'],
        'Toetsenbord_En_Muis': ['type'],
        'Printers': ['type', 'color'],
        'Koeling': ['cooling_type', 'fan_count', 'fan_size', 'max_cpu_height', 'supported_sockets', 'tdp_support', 'dimensions', 'noise_level'],
        'Netwerkkaart': ['network_type', 'max_speed', 'interface_type', 'supported_protocols', 'ports', 'wifi_standard'],
        'Geluidkaart': ['channels', 'sample_rate', 'bit_depth', 'interface', 'compatibility', 'noise_ratio', 'power_supply'],
        'CPU_KOELING': ['cooling_type', 'max_tdp', 'fan_count', 'fan_size', 'supported_sockets', 'dimensions', 'noise_level', 'radiator_size', 'pump_speed'],
        'Optische_Drive': ['type', 'speed'],
        'Extra_Opslag': ['capacity', 'type']
    };

    let columns = ['name', 'description', 'price', 'image_url'];
    let values = [name, description, price, image_url];

    // Extra velden toevoegen als ze aanwezig zijn
    if (categoryFields[category]) {
        console.log(`📌 Extra velden voor categorie ${category}:`, categoryFields[category]);
        categoryFields[category].forEach(field => {
            if (extraFields[field] !== undefined) {
                console.log(`➕ Toegevoegd extra veld: ${field} = ${extraFields[field]}`);
                columns.push(field);
                values.push(extraFields[field]);
            }
        });
    }

    // SQL-query voorbereiden en uitvoeren
    const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
    console.log("🛠️ Uitvoeren SQL-query:", insertQuery);
    console.log("📊 Met waarden:", values);

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error("❌ Fout bij invoegen van product:", err);
            return res.status(500).json({ error: 'Fout bij toevoegen van product' });
        }
        console.log(`✅ Product succesvol toegevoegd met ID: ${result.insertId}`);
        res.status(201).json({ message: 'Product toegevoegd', product_id: result.insertId });
    });
});


  
  // Start server
  app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
  });


// ✅ Verwijderen van een product
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;

    // Verwijder het product uit de database
    const query = 'DELETE FROM products WHERE product_id = ?';

    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('❌ Fout bij het verwijderen van het product:', err);
            return res.status(500).json({ error: 'Fout bij het verwijderen van het product' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product niet gevonden' });
        }

        console.log('✅ Product succesvol verwijderd:', productId);
        res.status(200).json({ success: true });
    });
});

app.put('/products/:id', upload.single('image'), (req, res) => {
    const productId = req.params.id;
    const { name, description, price, category } = req.body;

    // Als er een nieuwe afbeelding is geüpload, gebruik deze
    let image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Als er geen nieuwe afbeelding is geüpload, haal de oude afbeelding op uit de database
    if (!image_url) {
        const query = 'SELECT image_url FROM products WHERE product_id = ? LIMIT 1';
        db.query(query, [productId], (err, results) => {
            if (err) {
                console.error('❌ Fout bij het ophalen van de afbeelding:', err);
                return res.status(500).json({ error: 'Fout bij ophalen afbeelding' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Product niet gevonden' });
            }

            // Bewaar de oude image_url als er geen nieuwe is geüpload
            image_url = results[0].image_url;

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

                // Werk het product bij in de database
                const updateQuery = `
                    UPDATE products
                    SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?
                    WHERE product_id = ?
                `;
                db.query(updateQuery, [name, description, price, category_id, image_url, productId], (err, result) => {
                    if (err) {
                        console.error('❌ Fout bij het bewerken van het product:', err);
                        return res.status(500).json({ error: 'Fout bij het bewerken van het product' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Product niet gevonden' });
                    }

                    console.log('✅ Product succesvol bewerkt:', productId);
                    res.status(200).json({ success: true, image_url: image_url });  // Voeg image_url toe aan de response
                });
            });
        });
    } else {
        // Als er een afbeelding is geüpload, update de afbeelding in de database
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

            const updateQuery = `
                UPDATE products
                SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?
                WHERE product_id = ?
            `;
            db.query(updateQuery, [name, description, price, category_id, image_url, productId], (err, result) => {
                if (err) {
                    console.error('❌ Fout bij het bewerken van het product:', err);
                    return res.status(500).json({ error: 'Fout bij het bewerken van het product' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Product niet gevonden' });
                }

                console.log('✅ Product succesvol bewerkt:', productId);
                res.status(200).json({ success: true, image_url: image_url });  // Voeg image_url toe aan de response
            });
        });
    }
});




// kortings codes 
app.post('/apply-discount', (req, res) => {
    const { code, total_amount } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Kortingscode moet opgegeven worden' });
    }

    if (!total_amount || total_amount <= 0) {
        return res.status(400).json({ error: 'Ongeldig totaalbedrag' });
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

        const discount = results[0];
        let new_total = total_amount;

        if (discount.discount_type === 'percentage') {
            const discountAmount = (total_amount * discount.discount_value) / 100;
            new_total -= discountAmount;
        } else {
            new_total -= discount.discount_value;
        }

        if (new_total < 0) new_total = 0; // Zorgt ervoor dat het totaal niet negatief wordt

        res.json({ 
            discount_value: discount.discount_value, 
            type: discount.discount_type, 
            new_total: new_total.toFixed(2) 
        });
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

app.patch('/categories/:id/update', (req, res) => {
    const categoryId = req.params.id;
    const { required } = req.body;

    // Update de verplichte status in de database
    const query = 'UPDATE categories SET required = ? WHERE category_id = ?';
    db.query(query, [required, categoryId], (err, result) => {
        if (err) {
            console.error('Fout bij het bijwerken van de categorie:', err);
            return res.status(500).json({ success: false, error: 'Fout bij het bijwerken van de categorie.' });
        }

        return res.json({ success: true });
    });
});


// gemaakt door Bram Swinnen tijdens zijn stage van 8/02/2025-21/02/2025