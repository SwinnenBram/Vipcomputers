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

    const addProductBtn = document.getElementById('add-product-btn');
const categoryPopup = document.getElementById('category-popup');
const popupOverlay = document.getElementById('popup-overlay');
const productForm = document.getElementById('product-form');
const extraFieldsContainer = document.getElementById('extra-fields');
const categorySelect = document.getElementById('category-select');

addProductBtn.addEventListener('click', () => {
    console.log("Knop 'Product toevoegen' is geklikt.");
    categoryPopup.style.display = 'block';
    popupOverlay.style.display = 'block';
});

function closePopup() {
    console.log("Popup wordt gesloten.");
    categoryPopup.style.display = 'none';
    popupOverlay.style.display = 'none';
}

function openForm() {
    const category = categorySelect.value;
    console.log(`Gekozen categorie: ${category}`);
    categoryPopup.style.display = 'none';
    popupOverlay.style.display = 'none';
    productForm.style.display = 'block';
    loadCategoryFields(category);
}

function loadCategoryFields(category) {
    console.log(`Laden van extra velden voor categorie: ${category}`);
    extraFieldsContainer.innerHTML = ''; // Leeg het formulier

    const categoryFields = {
        'Behuizingen': ['Formaat', 'Maximale GPU Lengte', 'Maximale Koeler Hoogte'],
        'Voeding': ['Wattage', 'Efficiëntie', 'Modulair'],
        'Moederborden': ['Socket', 'Chipset', 'Formaat', 'Max RAM', 'Aantal RAM slots'],
        'CPU': ['Socket', 'Generatie', 'Kernen', 'Threads', 'Basis Klok', 'Boost Klok', 'TDP']
    };

    const fields = categoryFields[category] || [];
    console.log(`Gevonden velden voor categorie:`, fields);

    fields.forEach(field => {
        const input = document.createElement('input');
        input.placeholder = field;
        input.id = `field-${field}`;
        extraFieldsContainer.appendChild(input);
        console.log(`Inputveld toegevoegd: ${field}`);
    });
}

function addProduct() {
    console.log("Start toevoegen van product...");
    const name = document.getElementById('add-name').value;
    const description = document.getElementById('add-description').value;
    const price = document.getElementById('add-price').value;
    const image = document.getElementById('add-image').files[0];
    const category = categorySelect.value;

    console.log(`Productgegevens: 
        Naam: ${name}, 
        Beschrijving: ${description}, 
        Prijs: ${price}, 
        Categorie: ${category}, 
        Afbeelding: ${image ? image.name : 'Geen afbeelding gekozen'}`);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    if (image) {
        formData.append('image', image);
    }

    fetch('http://localhost:3000/products', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log("Respons ontvangen van server:", response);
        return response.json();
    })
    .then(data => {
        console.log("Product succesvol toegevoegd! Server antwoord:", data);
        alert('Product succesvol toegevoegd!');
        productForm.reset();
        productForm.style.display = 'none';
    })
    .catch(err => {
        console.error('Fout bij toevoegen:', err);
        alert('Er is iets misgegaan.');
    });
}


function updateProductsDisplay() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';

    // Itereer door de categorieën
    for (const category in productsData) {
        const categorySection = document.createElement('div');
        categorySection.classList.add('category');
        categorySection.innerHTML = `<h2>${category}</h2>`;

        const productsContainerForCategory = document.createElement('div');
        productsContainerForCategory.classList.add('products-container');

        // Itereer door de producten in deze categorie
        productsData[category].forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="http://localhost:3000${product.image_url}" alt="${product.name}" />
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p>Prijs: €${product.price}</p>
                <button onclick="editProduct(${product.product_id})">Bewerken</button>
                <button onclick="deleteProduct(${product.product_id})">🗑 Verwijderen</button>
            `;
            productsContainerForCategory.appendChild(productCard);
        });

        categorySection.appendChild(productsContainerForCategory);
        productsContainer.appendChild(categorySection);
    }
}




function editProduct(productId) {
    let product = null;

    console.log('⛔ productId:', productId);  // Log het productId

    // Doorloop de producten in alle categorieën
    for (const category in productsData) {
        console.log('⛔ category:', category);  // Log de categorie
        const categoryProducts = productsData[category];
        console.log('⛔ categoryProducts:', categoryProducts);  // Log de producten van de categorie

        // Zoek het product in de lijst van producten van deze categorie
        product = categoryProducts.find(p => p.product_id === productId);
        if (product) break;  // Stop zoeken zodra het product is gevonden
    }

    if (!product) {
        alert('❌ Product niet gevonden');
        return;
    }

    console.log('✅ Gevonden product:', product);  // Log het gevonden product

    // Roep de openEditPopup functie aan om de bewerk-popup te openen
    openEditPopup(product);
}

// Functie om de bewerk-popup te openen
function openEditPopup(product) {
    console.log('📦 Gevonden product:', product);

    // Vul de velden in met de productinformatie
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-price').value = product.price;

    // Log de beschikbare categorieën en de geselecteerde categorie
    const categoryDropdown = document.getElementById('edit-category');
    console.log('Beschikbare opties in de dropdown:');
    Array.from(categoryDropdown.options).forEach(option => console.log(option.value));

    console.log('Geselecteerde categorie voor bewerking:', product.category_name);

    // Zoek naar de juiste categorie en stel deze in
    for (let i = 0; i < categoryDropdown.options.length; i++) {
        const option = categoryDropdown.options[i];
        if (option.value === product.category_name) {
            categoryDropdown.selectedIndex = i;
            break;
        }
    }

    // Zorg ervoor dat de afbeelding wordt weergegeven in de preview
    const imagePreview = document.getElementById('edit-image-preview');
    if (imagePreview && product.image_url) {
        imagePreview.src = `http://localhost:3000${product.image_url}`; // Zorg ervoor dat het pad klopt
    }

    // Sla het productId op in een verborgen veld
    document.getElementById('edit-product-id').value = product.product_id;

    // Open de bewerk-popup
    document.getElementById('edit-popup').style.display = 'block';
    document.getElementById('edit-popup-overlay').style.display = 'block';
}

function saveProductChanges(event) {
    event.preventDefault();

    const productId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-name').value;
    const description = document.getElementById('edit-description').value;
    const price = document.getElementById('edit-price').value;
    const category = document.getElementById('edit-category').value;
    
    // Check of er een nieuwe afbeelding is geüpload
    const fileInput = document.getElementById('edit-image-input');
    let formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);

    // Als er een nieuwe afbeelding is geüpload, voeg deze dan toe
    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    } else {
        // Als er geen nieuwe afbeelding is, stuur dan de oude afbeelding mee (via image_url)
        formData.append('image_url', document.getElementById('edit-image-preview').src); // Stuur het bestaande afbeeldingspad
    }

    // Voeg de product_id toe aan de formData
    formData.append('product_id', productId);

    // Verstuur de formData naar de server (bijvoorbeeld via fetch)
    fetch(`http://localhost:3000/products/${productId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Product bijgewerkt:', data);
        // Sluit de popup na succesvol opslaan
        closeEditPopup();
        // Herlaad de producten om de wijziging te zien
        loadProducts();
    })
    .catch(err => {
        console.error('❌ Fout bij het opslaan van het product:', err);
    });
}

// Functie om de popup en overlay te sluiten
function closeEditPopup() {
    document.getElementById('edit-popup').style.display = 'none';
    document.getElementById('edit-popup-overlay').style.display = 'none';
}

// Event listener voor het sluiten van de popup door op de overlay te klikken
document.querySelector('.popup-overlay').addEventListener('click', closeEditPopup);



// ✅ Functie om categorieën in de dropdown te plaatsen
function populateCategoriesDropdown(categories) {
    const categoryDropdown = document.getElementById('add-category');
    const editCategoryDropdown = document.getElementById('edit-category');

    // Clear eerst de dropdowns om herhalingen te voorkomen
    categoryDropdown.innerHTML = '';
    editCategoryDropdown.innerHTML = '';

    // Voeg de categorieën toe aan de "new product" dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name; // Zorg ervoor dat de value overeenkomt met de productcategorie
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
    });

    // Voeg de categorieën toe aan de "edit product" dropdown (voor bewerken)
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name; // Zorg ervoor dat de value overeenkomt met de productcategorie
        option.textContent = category.name;
        editCategoryDropdown.appendChild(option);
    });
}





// ✅ Functie om het bewerkte product op te slaan
function saveEditedProduct() {
    const productId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-name').value;
    const description = document.getElementById('edit-description').value;
    const price = parseFloat(document.getElementById('edit-price').value).toFixed(2);
    const category = document.getElementById('edit-category').value;
    const image = document.getElementById('edit-image').files[0];  // Halen we het bestand op

    if (!name || !description || isNaN(price) || !category) {
        alert('❌ Vul alle velden correct in!');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    if (image) formData.append('image', image);

    // Stuur de PUT-aanvraag naar de server om het product bij te werken
    fetch(`http://localhost:3000/products/${productId}`, {
        method: 'PUT',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Product succesvol bijgewerkt!');
            location.reload();  // Herlaad de pagina om de producten opnieuw op te halen
        } else {
            alert('❌ Fout bij het bijwerken van het product');
        }
    })
    .catch(err => console.error('❌ Fout bij bewerken product:', err));
}

function deleteProduct(productId) {
    const confirmation = confirm('Weet je zeker dat je dit product wilt verwijderen?');
    if (!confirmation) return;

    fetch(`http://localhost:3000/products/${productId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Product succesvol verwijderd!');
            location.reload();  // Herlaad de pagina om de producten opnieuw op te halen
        } else {
            alert('❌ Er is een fout opgetreden bij het verwijderen van het product.');
        }
    })
    .catch(err => console.error('❌ Fout bij verwijderen product:', err));
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

// ✅ Ophalen van de huidige servicekosten
fetch('http://localhost:3000/service-fee')
    .then(response => response.json())
    .then(data => {
        console.log('📦 Gegevens van servicekosten:', data);
        document.getElementById('current-fee').textContent = `€${data.serviceFee}`;
    })
    .catch(err => console.error('❌ Fout bij ophalen servicekosten:', err));

// ✅ Functie om servicekosten bij te werken
function updateServiceFee() {
    const newServiceFee = parseFloat(document.getElementById('new-service-fee').value);

    if (isNaN(newServiceFee) || newServiceFee <= 0) {
        alert('❌ Vul een geldige waarde voor de servicekosten in!');
        return;
    }

    fetch('http://localhost:3000/update-service-fee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serviceFee: newServiceFee })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Servicekosten succesvol bijgewerkt!');
            document.getElementById('current-fee').textContent = `€${newServiceFee}`;
        } else {
            alert('❌ Er is een fout opgetreden bij het bijwerken van de servicekosten.');
        }
    })
    .catch(err => console.error('❌ Fout bij het bijwerken van servicekosten:', err));
}

// ✅ Ophalen van kortingscodes
function fetchDiscounts() {
    fetch('http://localhost:3000/get-discounts')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('discount-list');
            list.innerHTML = ''; // Reset lijst

            data.forEach(discount => {
                const item = document.createElement('li');
                item.innerHTML = `
                    ${discount.code} - ${discount.discount_value}${discount.discount_type === 'percentage' ? '%' : '€'} 
                    - Vervalt op ${discount.expiration_date} 
                    <input type="checkbox" id="status-${discount.id}" ${discount.is_active ? 'checked' : ''} onclick="toggleDiscountStatus(${discount.id}, this)">
                    <button onclick="deleteDiscount(${discount.id})">🗑 Verwijderen</button>
                `;
                list.appendChild(item);
            });
        })
        .catch(err => console.error('❌ Fout bij ophalen kortingscodes:', err));
}


// Kortingscode toevoegen
document.getElementById('discount-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const code = document.getElementById('code').value.trim();
    const discount_value = document.getElementById('discount_value').value;
    const discount_type = document.getElementById('discount_type').value; 
    const expiration_date = document.getElementById('expiration_date').value;

    // Zorg ervoor dat de invoer correct is
    if (!code || !discount_value || !discount_type || !expiration_date) {
        showPopup('❌ Vul alle velden in voor de kortingscode!', 'red');
        return;
    }

    // Zorg ervoor dat discount_value een getal is, zodat je geen ongeldige waardes verstuurt
    if (isNaN(discount_value) || parseFloat(discount_value) <= 0) {
        showPopup('❌ Vul een geldige kortingswaarde in!', 'red');
        return;
    }

    fetch('http://localhost:3000/add-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            discount_value,
            discount_type, 
            expiration_date
        })
    })
    .then(response => {
        // Controleer of de server een succesvolle status teruggeeft
        if (!response.ok) {
            return response.json().then(data => {
                // Als er een fout is, gooi een foutmelding
                throw new Error(data.error || 'Er is een onbekende fout opgetreden');
            });
        }
        return response.json(); // Als alles goed is, return de JSON data
    })
    .then(data => {
        if (data.success) {
            // Succesmelding
            showPopup('✅ Kortingscode succesvol toegevoegd!', 'green');
            fetchDiscounts(); // Update de lijst na toevoegen
        } else {
            // Foutmelding
            showPopup(`❌ Fout: ${data.error || 'Er is een onbekende fout opgetreden'}`, 'red');
        }
    })
    .catch(err => {
        // Als er een fout optreedt, wordt deze hier opgevangen en weergegeven
        showPopup(`❌ Fout: ${err.message}`, 'red');
    });
});

// Functie om de popup te tonen
function showPopup(message, color) {
    const popupText = document.getElementById('popup-text');
    const popupMessage = document.getElementById('popup-message');
    popupText.textContent = message;
    popupText.style.color = color; // Stel de kleur in op basis van succes of fout
    popupMessage.style.display = 'flex'; // Maak de popup zichtbaar
}

// Sluit de popup wanneer de gebruiker op de "×" klikt
document.getElementById('popup-close').addEventListener('click', function() {
    document.getElementById('popup-message').style.display = 'none';
});

// ✅ Kortingscode verwijderen
function deleteDiscount(id) {
    fetch(`http://localhost:3000/delete-discount/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchDiscounts(); // Update de lijst na verwijderen
            } else {
                console.error('❌ Fout bij verwijderen kortingscode:', data.error);
            }
        })
        .catch(err => console.error('❌ Fout bij verwijderen kortingscode:', err));
}

// Functie om de status van een kortingscode bij te werken
async function toggleDiscountStatus(discountId, checkbox) {
    const isActive = checkbox.checked ? 1 : 0;  // 1 voor actief, 0 voor inactief

    try {
        const response = await fetch(`http://localhost:3000/update-discount-status/${discountId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isActive: isActive }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Kortingscode status succesvol bijgewerkt');
        } else {
            console.error('❌ Fout bij het bijwerken van de kortingscode status:', data.error);
        }
    } catch (error) {
        console.error('❌ Fout bij de request:', error);
    }
}

function updateCategoryRequirement(categoryId, isRequired) {
    fetch(`http://localhost:3000/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_required: isRequired })
    })
    .then(response => response.json())
    .then(data => console.log('Categorie bijgewerkt:', data))
    .catch(error => console.error('Fout bij het bijwerken van de categorie:', error));
}

// Initialiseer het ophalen van de kortingscodes
fetchDiscounts();

// Haal de categorieën op en toon ze in de tabel
function loadCategories() {
    fetch('http://localhost:3000/categories')
        .then(response => response.json())
        .then(categories => {
            const categoryTableBody = document.querySelector('#category-table tbody');
            categoryTableBody.innerHTML = ''; // Maak de tabel leeg voordat we nieuwe data laden

            categories.forEach(category => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${category.name}</td>
                    <td>
                        <input type="checkbox" class="category-required" data-id="${category.category_id}" ${category.required ? 'checked' : ''}>
                    </td>
                    <td>
                        <button class="update-category-btn" data-id="${category.category_id}">Bijwerken</button>
                    </td>
                `;
                categoryTableBody.appendChild(row);
            });

            // Voeg event listeners toe voor de knoppen en checkboxes
            document.querySelectorAll('.update-category-btn').forEach(button => {
                button.addEventListener('click', updateCategoryStatus);
            });

            document.querySelectorAll('.category-required').forEach(checkbox => {
                checkbox.addEventListener('change', toggleCategoryRequired);
            });
        })
        .catch(err => console.error('Fout bij het ophalen van categorieën:', err));
}

// Toggle de verplicht status van de categorie
function toggleCategoryRequired(event) {
    const categoryId = event.target.dataset.id;
    const isRequired = event.target.checked;

    // Verstuur de wijziging naar de server
    fetch(`http://localhost:3000/categories/${categoryId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ required: isRequired })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Categorie bijgewerkt!');
        } else {
            alert('Er is een fout opgetreden bij het bijwerken van de categorie.');
        }
    })
    .catch(err => console.error('Fout bij het bijwerken van de categorie:', err));
}

// Functie om categorie status bij te werken (voor de "Bijwerken" knop)
function updateCategoryStatus(event) {
    const categoryId = event.target.dataset.id;
    const checkbox = document.querySelector(`input[data-id="${categoryId}"]`);
    const isRequired = checkbox.checked;

    // Verstuur de wijziging naar de server
    fetch(`http://localhost:3000/categories/${categoryId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ required: isRequired })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Categorie status bijgewerkt!');
        } else {
            alert('Er is een fout opgetreden bij het bijwerken van de categorie status.');
        }
    })
    .catch(err => console.error('Fout bij het bijwerken van de categorie status:', err));
}

// Laad de categorieën bij het laden van de pagina
document.addEventListener('DOMContentLoaded', loadCategories);

