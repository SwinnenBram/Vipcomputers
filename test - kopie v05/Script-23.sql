CREATE DATABASE pc_builder;

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

INSERT INTO categories (name) VALUES
('Behuizingen'),
('Voeding'),
('Moederborden'),
('CPU'),
('RAM'),
('SSD'),
('Tweede SSD'),
('Video Kaart'),
('Beeldscherm'),
('Toetsenbord en muis'),
('Printer'),
('Optionele Extra\'s');


INSERT INTO products (name, description, price, image_url, category_id) VALUES
('NZXT H510', 'Een mooie mid-tower behuizing met goede luchtstroom.', 70.00, 'https://example.com/nzxt-h510.jpg', 1),
('Corsair iCUE 4000X', 'Behuizing met RGB en uitstekende airflow.', 100.00, 'https://example.com/corsair-4000x.jpg', 1),
('Intel Core i7 12700K', 'Krachtige 12-core CPU voor gaming en multitasking.', 350.00, 'https://example.com/i7-12700k.jpg', 3),
('Corsair Vengeance LPX 16GB', '16GB RAM voor high-performance gaming.', 75.00, 'https://example.com/ram-16gb.jpg', 4),
('Samsung 970 EVO Plus 1TB', 'Snelle SSD voor opslag van je games en programma\'s.', 120.00, 'https://example.com/samsung-ssd.jpg', 5),
('NVIDIA RTX 3080', 'Krachtige grafische kaart voor de nieuwste games in 4K.', 700.00, 'https://example.com/rtx3080.jpg', 7);

SELECT products.product_id, products.name, products.description, products.price, products.image_url, categories.name AS category
FROM products
JOIN categories ON products.category_id = categories.category_id;

CREATE TABLE settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(10, 2) NOT NULL
);

INSERT INTO settings (name, value) VALUES ('service_fee', 100.00);

