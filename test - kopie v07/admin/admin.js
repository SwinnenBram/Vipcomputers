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
    const image = document.getElementById('add-image').files[0]; // Halen we het bestand op
    const category = document.getElementById('add-category').value;

    if (!name || !description || isNaN(price) || !image || !category) {
        alert('❌ Vul alle velden correct in!');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('image', image);  // De afbeelding toevoegen
    formData.append('category', category);

    console.log('➕ Nieuw product toevoegen:', formData);

    fetch('http://localhost:3000/products', {
        method: 'POST',
        body: formData, // Verzend het formulier als FormData
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Product toegevoegd:', data);
        alert('Product succesvol toegevoegd!');
        location.reload();
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
                <img src="http://localhost:3000${product.image_url}" alt="${product.name}" />
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



// Initialiseer het ophalen van de kortingscodes
fetchDiscounts();
