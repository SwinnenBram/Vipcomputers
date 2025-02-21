let productsData = [];

// ✅ Ophalen van producten
fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
        console.log('📦 Gegevens van producten:', data);
        productsData = data;
        updateProductsDisplay();
    })
    .catch(err => console.error('❌ Fout bij ophalen van producten:', err));

// ✅ Ophalen van categorieën
fetch('http://localhost:3000/categories')
    .then(response => response.json())
    .then(data => {
        console.log('📦 Gegevens van categorieën:', data);
        populateCategoriesDropdown(data); // Vul de dropdown met categorieën
    })
    .catch(err => console.error('❌ Fout bij ophalen van categorieën:', err));

// ✅ Functie om een nieuw product toe te voegen
function addProduct() {
    const name = document.getElementById('add-name').value;
    const description = document.getElementById('add-description').value;
    const price = parseFloat(document.getElementById('add-price').value).toFixed(2);
    const image_url = document.getElementById('add-image').value;
    const category = document.getElementById('add-category').value; // Haal de geselecteerde categorie op

    // Controleer of alle velden zijn ingevuld
    if (!name || !description || isNaN(price) || !image_url || !category) {
        alert('❌ Vul alle velden correct in!');
        return;
    }

    const newProduct = { name, description, price, image_url, category }; // Stuur de categorie naam door, niet de category_id
    console.log('➕ Nieuw product toevoegen:', newProduct);

    fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Product toegevoegd:', data);
        alert('Product succesvol toegevoegd!');
        closePopup(); // Sluit de popup na toevoegen
        location.reload(); // Herlaad de pagina om de productlijst bij te werken
    })
    .catch(err => console.error('❌ Fout bij toevoegen van product:', err));
}

// ✅ Functie om producten op de pagina te tonen
function updateProductsDisplay() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';

    for (const category in productsData) {
        const categorySection = document.createElement('div');
        categorySection.classList.add('category');
        categorySection.innerHTML = `<h2>${category}</h2>`;

        const productsContainerForCategory = document.createElement('div');
        productsContainerForCategory.classList.add('products-container');

        productsData[category].forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p>Prijs: €${product.price}</p>
            `;
            productsContainerForCategory.appendChild(productCard);
        });

        categorySection.appendChild(productsContainerForCategory);
        productsContainer.appendChild(categorySection);
    }
}

// ✅ Functie om categorieën in de dropdown te plaatsen
function populateCategoriesDropdown(categories) {
    const categoryDropdown = document.getElementById('add-category');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
    });
}

// ✅ Functie om de popup te openen
function openPopup() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup-overlay').style.display = 'block';
}

// ✅ Functie om de popup te sluiten
function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('popup-overlay').style.display = 'none';
}
