CREATE DATABASE pc_builder;

drop database pc_builder;

drop table cpu_koeling;


-- Categorieën tabel
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    required BOOLEAN NOT NULL
);

-- Behuizingen
CREATE TABLE Behuizingen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    form_factor VARCHAR(50),  -- ATX, Micro-ATX, Mini-ITX, etc.
    max_gpu_length INT,       -- In mm
    max_cooler_height INT     -- In mm
);

-- Voedingen
CREATE TABLE Voedingen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    wattage INT NOT NULL,     -- Vermogen in Watt
    efficiency_rating VARCHAR(20), -- 80+ Bronze, Silver, Gold, Platinum
    modular BOOLEAN NOT NULL  -- Ja/Nee
);

-- Moederborden
CREATE TABLE Moederborden (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    socket VARCHAR(50),  -- AM4, LGA 1700, etc.
    chipset VARCHAR(50), -- B550, X570, Z690, etc.
    form_factor VARCHAR(50), -- ATX, Micro-ATX, Mini-ITX
    max_ram INT,  -- Max geheugen in GB
    ram_slots INT -- Aantal RAM-slots
);

-- CPU's
CREATE TABLE CPU (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    socket VARCHAR(50),  -- AM4, LGA 1700, etc.
    generation VARCHAR(50), -- 10th Gen, 11th Gen, Ryzen 5000, etc.
    cores INT NOT NULL,
    threads INT NOT NULL,
    base_clock DECIMAL(4,2), -- GHz
    boost_clock DECIMAL(4,2), -- GHz
    tdp INT NOT NULL -- Wattage
);

-- RAM
CREATE TABLE RAM (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    capacity INT NOT NULL, -- In GB
    speed INT NOT NULL, -- In MHz
    type VARCHAR(20) NOT NULL -- DDR4, DDR5, etc.
);

-- SSD's
CREATE TABLE SSD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    capacity INT NOT NULL, -- In GB
    interface VARCHAR(50) -- SATA, NVMe, PCIe Gen 4, etc.
);

-- Tweede SSD (optioneel)
CREATE TABLE Tweede_SSD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    capacity INT NOT NULL, -- In GB
    interface VARCHAR(50)
);

-- Video Kaarten
CREATE TABLE Video_Kaart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    chipset VARCHAR(50), -- NVIDIA, AMD
    vram INT NOT NULL, -- In GB
    core_clock DECIMAL(4,2), -- GHz
    boost_clock DECIMAL(4,2) -- GHz
);

-- Software
CREATE TABLE Software (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    license_type VARCHAR(50), -- OEM, Retail, Subscription
    platform VARCHAR(50) -- Windows, Mac, Linux
);

-- Antivirus
CREATE TABLE Antivirus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    duration INT NOT NULL -- In maanden
);

-- Beeldschermen
CREATE TABLE Beeldscherm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    size DECIMAL(4,1) NOT NULL, -- In inch
    resolution VARCHAR(20), -- 1920x1080, 2560x1440, etc.
    refresh_rate INT NOT NULL -- In Hz
);

-- Toetsenbord en muis
CREATE TABLE Toetsenbord_En_Muis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    type VARCHAR(50) -- Mechanisch, membraan, draadloos, etc.
);

-- Printers
CREATE TABLE Printers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    type VARCHAR(50), -- Inkjet, Laser, etc.
    color BOOLEAN NOT NULL -- Ja/Nee
);

-- Optionele Extra's
CREATE TABLE Optionele_Extra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE Koeling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    cooling_type VARCHAR(50),  -- Type koeling, bijvoorbeeld Luchtkoeling, Waterkoeling
    fan_count INT NOT NULL,  -- Aantal ventilatoren
    fan_size DECIMAL(4,1),  -- Maat van de ventilatoren in inch
    max_cpu_height INT,  -- Max hoogte van CPU-koeler in mm
    supported_sockets TEXT,  -- Ondersteunde sockets, bijvoorbeeld AM4, LGA 1200
    tdp_support DECIMAL(5,2),  -- Ondersteund TDP in Watt (Thermal Design Power)
    dimensions VARCHAR(50),  -- Afmetingen in mm (Lengte x Breedte x Hoogte)
    noise_level DECIMAL(5,2)  -- Geluidsniveau in dB
);

CREATE TABLE Netwerkkaart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    network_type VARCHAR(50),  -- Type netwerk, bijvoorbeeld Wi-Fi, Ethernet
    max_speed DECIMAL,  -- Maximale snelheid in Mbps (bijvoorbeeld 1000Mbps voor gigabit)
    interface_type VARCHAR(50),  -- Interface, bijvoorbeeld PCIe, USB
    supported_protocols TEXT,  -- Ondersteunde protocollen zoals IPv4, IPv6
    ports INT NOT NULL,  -- Aantal poorten (voor ethernetkaarten)
    wifi_standard VARCHAR(50)  -- Wi-Fi standaard zoals Wi-Fi 5, Wi-Fi 6
);

CREATE TABLE Geluidkaart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    channels INT NOT NULL,  -- Aantal kanalen (bijvoorbeeld 2.1, 5.1, 7.1)
    sample_rate DECIMAL(5,2),  -- Sample rate in kHz (bijvoorbeeld 192 kHz)
    bit_depth INT,  -- Bitdiepte (bijvoorbeeld 16-bit, 24-bit)
    interface VARCHAR(50),  -- Interface zoals PCI, USB, PCIe
    compatibility TEXT,  -- Compatibiliteit met besturingssystemen (bijvoorbeeld Windows, macOS)
    noise_ratio DECIMAL(5,2),  -- Signaal-ruisverhouding in dB
    power_supply VARCHAR(50)  -- Voedingsbron zoals USB-gevoed of externe voeding
);

CREATE TABLE CPU_KOELING (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(512) NOT NULL,  -- Verhoog lengte voor langere namen
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(512),  -- Verhoog lengte voor langere URL's
    cooling_type VARCHAR(255),
    max_tdp DECIMAL(10,2) NOT NULL,
    fan_count INT NOT NULL,
    fan_size DECIMAL(5,2) NOT NULL,
    supported_sockets TEXT,  -- Laat de lengte van TEXT onbeperkt
    dimensions VARCHAR(255),
    noise_level DECIMAL(5,2) NOT NULL,
    radiator_size DECIMAL(10,2) NOT NULL,
    pump_speed DECIMAL(10,2) NOT NULL
);



CREATE TABLE Optische_Drive (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    type VARCHAR(50), -- Bijv. DVD, Blu-ray
    speed INT NOT NULL -- Snelheid in rpm (bijv. 7200rpm)
);

CREATE TABLE Extra_Opslag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    capacity INT NOT NULL, -- Capaciteit in GB
    type VARCHAR(50) -- Bijv. Externe HDD, Externe SSD
);


-- Voeg categorieën toe als dat nog niet is gebeurd
INSERT INTO categories (name, required) VALUES
('Behuizingen', TRUE),
('Voeding', TRUE),
('Moederborden', TRUE),
('CPU', TRUE),
('CPU_Koeling', TRUE),
('RAM', TRUE),
('SSD', TRUE),
('Tweede_SSD', FALSE),
('Video_Kaart', TRUE),
('Koeling', TRUE),
('Optische_Drive', FALSE),
('Netwerkkaart', FALSE),
('Geluidkaart', FALSE),
('Software', FALSE),
('Antivirus', FALSE),
('Beeldscherm', FALSE),
('Toetsenbord_En_Muis', FALSE),
('Printer', FALSE),
('Optionele_Extra', FALSE),
('Extra_Opslag', FALSE)
;

-- Behuizingen
INSERT INTO Behuizingen (name, description, price, image_url, form_factor, max_gpu_length, max_cooler_height)
VALUES 
('Corsair 4000D', 'Een ruime behuizing met uitstekende luchtstroom en eenvoudig kabelbeheer.', 75.99, 'https://example.com/corsair4000d.jpg', 'ATX', 370, 160);

-- Voedingen
INSERT INTO Voedingen (name, description, price, image_url, wattage, efficiency_rating, modular)
VALUES 
('EVGA SuperNOVA 750 G5', '750W voeding met 80+ Gold certificering, volledig modulaire kabels.', 129.99, 'https://example.com/evga750g5.jpg', 750, 'Gold', TRUE);

-- Moederborden
INSERT INTO Moederborden (name, description, price, image_url, socket, chipset, form_factor, max_ram, ram_slots)
VALUES 
('ASUS ROG Strix B550-F', 'Moederbord met B550 chipset, ideaal voor gaming en contentcreatie.', 149.99, 'https://example.com/rogstrixb550f.jpg', 'AM4', 'B550', 'ATX', 64, 4);

-- CPU's
INSERT INTO CPU (name, description, price, image_url, socket, generation, cores, threads, base_clock, boost_clock, tdp)
VALUES 
('Intel Core i7-12700K', '12-core processor voor zware workloads en gaming.', 359.99, 'https://example.com/i712700k.jpg', 'LGA 1700', '12th Gen', 12, 20, 3.6, 5.0, 125);

-- RAM
INSERT INTO RAM (name, description, price, image_url, capacity, speed, type)
VALUES 
('Corsair Vengeance LPX 16GB', '16GB DDR4 RAM, ideaal voor gaming en multitasking.', 79.99, 'https://example.com/corsair16gb.jpg', 16, 3200, 'DDR4');

-- SSD's
INSERT INTO SSD (name, description, price, image_url, capacity, interface)
VALUES 
('Samsung 970 EVO 1TB', 'NVMe SSD met uitstekende lees- en schrijfsnelheden.', 149.99, 'https://example.com/samsung970evo.jpg', 1000, 'NVMe');

-- Tweede SSD
INSERT INTO Tweede_SSD (name, description, price, image_url, capacity, interface)
VALUES 
('Crucial P3 500GB', 'Betaalbare SSD voor extra opslagcapaciteit.', 59.99, 'https://example.com/crucialp3.jpg', 500, 'NVMe');

-- Video Kaarten
INSERT INTO Video_Kaart (name, description, price, image_url, chipset, vram, core_clock, boost_clock)
VALUES 
('NVIDIA GeForce RTX 3080', 'Een krachtige grafische kaart voor 4K gaming en contentcreatie.', 699.99, 'https://example.com/rtx3080.jpg', 'NVIDIA', 10, 1.44, 1.71);

-- Software
INSERT INTO Software (name, description, price, image_url, license_type, platform)
VALUES 
('Windows 11 Pro', 'De nieuwste versie van Windows met veel verbeteringen voor professionals.', 139.99, 'https://example.com/windows11pro.jpg', 'Retail', 'Windows');

-- Antivirus
INSERT INTO Antivirus (name, description, price, image_url, duration)
VALUES 
('Norton 360 Deluxe', 'Antivirus en bescherming tegen online bedreigingen voor 5 apparaten.', 49.99, 'https://example.com/norton360deluxe.jpg', 12);

-- Beeldschermen
INSERT INTO Beeldscherm (name, description, price, image_url, size, resolution, refresh_rate)
VALUES 
('LG 27GN950-B', '27-inch 4K IPS-monitor met 144Hz verversingssnelheid, ideaal voor gaming.', 799.99, 'https://example.com/lg27gn950.jpg', 27, '3840x2160', 144);

-- Toetsenbord en muis
INSERT INTO Toetsenbord_En_Muis (name, description, price, image_url, type)
VALUES 
('Razer BlackWidow V3', 'Mechanisch gaming toetsenbord met groene switches voor snelle reacties.', 129.99, 'https://example.com/razerblackwidowv3.jpg', 'Mechanisch');

-- Printers
INSERT INTO Printers (name, description, price, image_url, type, color)
VALUES 
('HP OfficeJet Pro 9015', 'All-in-one printer voor thuis- en kantoorgebruik, biedt kleurafdrukken.', 169.99, 'https://example.com/hpofficejet9015.jpg', 'Inkjet', TRUE);

-- Optionele Extra's
INSERT INTO Optionele_Extra (name, description, price, image_url)
VALUES 
('Logitech G Pro X Headset', 'Hoogwaardige gamingheadset met blauwe VoicePro microfoon.', 129.99, 'https://example.com/logitechgprox.jpg');

-- Koeling
INSERT INTO Koeling (name, description, price, image_url, cooling_type, fan_count, fan_size, max_cpu_height, supported_sockets, tdp_support, dimensions, noise_level)
VALUES 
('Noctua NH-D15', 'Luchtkoeling met dubbele ventilatoren voor maximale koeling.', 89.99, 'https://example.com/noctuanhd15.jpg', 'Luchtkoeling', 2, 140, 165, 'AM4, LGA 1151', 250, '160x150x165mm', 19.2);

-- Netwerkkaart
INSERT INTO Netwerkkaart (name, description, price, image_url, network_type, max_speed, interface_type, supported_protocols, ports, wifi_standard)
VALUES 
('TP-Link Archer TX3000E', 'Wi-Fi 6 netwerkkaart voor super snel internet met 2.4Gbps snelheid.', 99.99, 'https://example.com/tplinkarchertx3000e.jpg', 'Wi-Fi', 2400, 'PCIe', 'IPv4, IPv6', 1, 'Wi-Fi 6');

-- Geluidkaart
INSERT INTO Geluidkaart (name, description, price, image_url, channels, sample_rate, bit_depth, interface, compatibility, noise_ratio, power_supply)
VALUES 
('Creative Sound Blaster Z', 'Geluidkaart voor kristalhelder geluid met 5.1 surround sound.', 89.99, 'https://example.com/soundblasterz.jpg', 5, 192, 24, 'PCIe', 'Windows, macOS', 110, 'PCIe');

-- CPUSKOELING
INSERT INTO CPU_KOELING (name, description, price, image_url, cooling_type, max_tdp, fan_count, fan_size, supported_sockets, dimensions, noise_level, radiator_size, pump_speed)
VALUES 
('Corsair iCUE H100i Elite Capellix', 'Waterkoeling met 240mm radiator voor uitstekende koelprestaties.', 159.99, 'https://example.com/h100i.jpg', 'Waterkoeling', 250, 2, 120, 'AM4, LGA 1200', '275x120x27mm', 35.0, 2500, 2500);

-- Optische Drive
INSERT INTO Optische_Drive (name, description, price, image_url, type, speed)
VALUES 
('LG WH16NS40', 'Blu-ray brander met 16x schrijfsnelheid voor Blu-ray en DVD.', 79.99, 'https://example.com/lgwh16ns40.jpg', 'Blu-ray', 16000);

-- Extra Opslag
INSERT INTO Extra_Opslag (name, description, price, image_url, capacity, type)
VALUES 
('Seagate Backup Plus 2TB', 'Externe harde schijf met 2TB opslagcapaciteit voor back-ups.', 59.99, 'https://example.com/seagatebackupplus.jpg', 2000, 'Externe HDD');



-- Select query to get all products along with their category
SELECT id AS product_id, name, description, price, image_url, 'Behuizingen' AS category
FROM Behuizingen
UNION ALL
SELECT id, name, description, price, image_url, 'Voeding'
FROM Voedingen
UNION ALL
SELECT id, name, description, price, image_url, 'Moederborden'
FROM Moederborden
UNION ALL
SELECT id, name, description, price, image_url, 'CPU'
FROM CPU
UNION ALL
SELECT id, name, description, price, image_url, 'RAM'
FROM RAM
UNION ALL
SELECT id, name, description, price, image_url, 'SSD'
FROM SSD
UNION ALL
SELECT id, name, description, price, image_url, 'Tweede SSD'
FROM Tweede_SSD
UNION ALL
SELECT id, name, description, price, image_url, 'Video Kaart'
FROM Video_Kaart
UNION ALL
SELECT id, name, description, price, image_url, 'Software'
FROM Software
UNION ALL
SELECT id, name, description, price, image_url, 'Antivirus'
FROM Antivirus
UNION ALL
SELECT id, name, description, price, image_url, 'Beeldscherm'
FROM Beeldscherm
UNION ALL
SELECT id, name, description, price, image_url, 'Toetsenbord en muis'
FROM Toetsenbord_En_Muis
UNION ALL
SELECT id, name, description, price, image_url, 'Printer'
FROM Printers
UNION ALL
SELECT id, name, description, price, image_url, 'Optionele Extra'
FROM Optionele_Extra
UNION ALL
SELECT id, name, description, price, image_url, 'Koeling'
FROM Koeling
UNION ALL
SELECT id, name, description, price, image_url, 'Netwerkkaart'
FROM Netwerkkaart
UNION ALL
SELECT id, name, description, price, image_url, 'Geluidkaart'
FROM Geluidkaart
UNION ALL
SELECT id, name, description, price, image_url, 'CPU_KOELING'
FROM CPU_KOELING
UNION ALL
SELECT id, name, description, price, image_url, 'Optische Drive'
FROM Optische_Drive
UNION ALL
SELECT id, name, description, price, image_url, 'Extra Opslag'
FROM Extra_Opslag;



CREATE TABLE settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(10, 2) NOT NULL
);

INSERT INTO settings (name, value) VALUES ('service_fee', 100.00);

CREATE TABLE discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    discount_type ENUM('fixed', 'percentage') NOT NULL DEFAULT 'fixed',
    expiration_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO discounts (code, discount_value, discount_type, expiration_date, is_active)
VALUES
    ('WINTER10', 10.00, 'percentage', '2025-12-31', 1),
    ('SUMMER50', 50.00, 'fixed', '2025-09-30', 1),
    ('BLACKFRIDAY30', 30.00, 'percentage', '2025-11-30', 1),
    ('NEWYEAR100', 100.00, 'fixed', '2025-01-31', 1),
    ('SPRING20', 20.00, 'percentage', '2025-06-30', 1);


INSERT INTO Behuizingen (name, description, price, form_factor, max_gpu_length, max_cooler_height)
VALUES ('ATX Gaming Case', 'Een grote ATX behuizing voor high-end gaming systemen', 120.00, 'ATX', 350, 160);

INSERT INTO Moederborden (name, description, price, socket, chipset, form_factor, max_ram, ram_slots)
VALUES ('Micro-ATX Moederbord', 'Een moederbord van het Micro-ATX formaat', 80.00, 'AM4', 'B550', 'Micro-ATX', 64, 4);

-- Voeg Moederbord toe met AM4 socket
INSERT INTO Moederborden (name, description, price, image_url, socket, chipset, form_factor, max_ram, ram_slots)
VALUES ('Moederbord B', 'Moederbord met AM4 socket', 100.00, 'url_beeld_b', 'AM4', 'B450', 'ATX', 64, 4);

-- Voeg CPU toe met LGA 1200 socket
INSERT INTO CPU (name, description, price, image_url, socket, generation, cores, threads, base_clock, boost_clock, tdp)
VALUES ('CPU Y', 'CPU met LGA 1200 socket', 250.00, 'url_beeld_y', 'LGA 1200', '10th Gen', 6, 12, 3.5, 4.5, 125);

-- Voeg Voeding toe met 500W
INSERT INTO Voedingen (name, description, price, image_url, wattage, efficiency_rating, modular)
VALUES ('Voeding A', 'Voeding van 500W', 70.00, 'url_beeld_a', 500, '80+ Bronze', TRUE);

-- Voeg Video Kaart toe met 750W vereiste
INSERT INTO Video_Kaart (name, description, price, image_url, chipset, vram, core_clock, boost_clock)
VALUES ('Video Kaart Z', 'Video Kaart met 8GB VRAM, vereist 750W', 500.00, 'url_beeld_z', 'NVIDIA', 8, 1.5, 2.0);

