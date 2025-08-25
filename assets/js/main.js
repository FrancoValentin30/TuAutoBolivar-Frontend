// ===================================================================
// --- CONFIGURACIÓN Y CONEXIÓN CON EL BACKEND ---
// ===================================================================

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const BACKEND_URL = 'http://127.0.0.1:8000';

// Simple state management for demonstration
let currentUser = null; // null for logged out, { id: 'u1', name: '...', email: '...', role: 'user', isActive: true }
let currentActiveNav = null; // To keep track of the active navigation link
let publicationImageFiles = []; // Guardará los archivos de imagen que el usuario vaya añadiendo.

// In-memory data store for users (simulated)
let users = [
    // Added lastModifiedByAdmin and lastLoginTime for demo purposes
    // Added adminModifiedFields to store which fields were changed by admin
    { id: 'u1', name: 'Franco Valentin', email: 'superadmin@autoexpress.com', phone: '+54 9 2314 111-222', password: 'password123', role: 'superadmin', isActive: true, lastModifiedByAdmin: 0, lastLoginTime: 0, adminModifiedFields: [] },
    { id: 'u2', name: 'Admin Ejemplo', email: 'admin@autoexpress.com', phone: '+54 9 2314 333-444', password: 'password123', role: 'admin', isActive: true, lastModifiedByAdmin: 0, lastLoginTime: 0, adminModifiedFields: [] },
    { id: 'u3', name: 'Usuario Regular', email: 'user@example.com', phone: '+54 9 2314 555-666', password: 'password123', role: 'user', isActive: true, lastModifiedByAdmin: 0, lastLoginTime: 0, adminModifiedFields: [] },
    { id: 'u4', name: 'Maria Lopez', email: 'maria@example.com', phone: '+54 9 2314 777-888', password: 'password123', role: 'user', isActive: false, lastModifiedByAdmin: 0, lastLoginTime: 0, adminModifiedFields: [] }
];

// In-memory data store for vehicles (simulated)
//let vehicles = [
//   { id: 'v1', brand: 'Volkswagen', model: 'Amarok', year: 2021, price: 35000, description: 'Pickup robusta con excelente rendimiento, ideal para trabajo y aventura. Equipada con tracción 4x4 y asientos de cuero.', imageUrls: ['https://www.topgear.com/sites/default/files/2022/07/Large-41982-VolkswagenAmarok.jpg', 'https://cdn.motor1.com/images/mgl/zE3oR/s3/toyota-corolla-se-2019.jpg', 'https://autoblog.com.ar/wp-content/uploads/2022/07/FIAT-CRONOS-2023-1.jpg'], ownerId: 'u3', status: 'active', isFeatured: true, condition: 'Usado', fuelType: 'Diésel', mileage: 75000, carType: 'Pickup', transmission: 'Automática', contactPhone: '+54 9 2314 555-123' },
//   { id: 'v2', brand: 'Fiat', model: 'Cronos', year: 2022, price: 18000, description: 'Sedán compacto y eficiente, perfecto para la ciudad. Bajo consumo de combustible y amplio espacio interior.', imageUrls: ['https://autoblog.com.ar/wp-content/uploads/2022/07/FIAT-CRONOS-2023-1.jpg', 'https://www.topgear.com/sites/default/files/2022/07/Large-41982-VolkswagenAmarok.jpg'], ownerId: 'u3', status: 'active', isFeatured: false, condition: 'Nuevo', fuelType: 'Nafta', mileage: 1000, carType: 'Sedán', transmission: 'Manual', contactPhone: '+54 9 2314 666-456' },
//   { id: 'v3', brand: 'Toyota', model: 'Corolla', year: 2019, price: 21000, description: 'Clásico sedán confiable y cómodo, con historial de servicio completo y muy bien cuidado. Ideal para el uso diario.', imageUrls: ['https://www.toyota.com/img/vehicles/2019/corolla/gallery/exterior/2019_Corolla_SE_01_ext_D_8686.jpg'], ownerId: 'u2', status: 'active', isFeatured: false, condition: 'Usado', fuelType: 'Nafta', mileage: 45000, carType: 'Sedán', transmission: 'Automática', contactPhone: '+54 9 2314 777-789' },
//  { id: 'v4', brand: 'Volkswagen', model: 'Golf', year: 2021, price: 22000, description: 'Hatchback deportivo y elegante, con excelente rendimiento y tecnología avanzada. ¡Una verdadera joya! Perfecto para quienes buscan combinar estilo y eficiencia.', imageUrls: ['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/2020_Volkswagen_Golf_1.5_TSI_Life_%28Mk8%29_front.jpg/1200px-2020_Volkswagen_Golf_1.5_TSI_Life_%28Mk8%29_front.jpg'], ownerId: 'u1', status: 'active', isFeatured: true, condition: 'Usado', fuelType: 'Nafta', mileage: 28000, carType: 'Hatchback', transmission: 'Manual', contactPhone: '+54 9 2314 888-012' }
//];

let publicationsData = [];
// Vehicles array global (antes estaba comentado). Se llenará desde la API.
let vehicles = [];

// In-memory data store for testimonials (simulated)
let testimonials = [
    { id: 't1', userId: 'u3', authorName: 'Marcos R.', content: 'Encontré mi camioneta perfecta en TuAutoBolivar en tiempo récord. El proceso fue simple y seguro. ¡Altamente recomendado!', dateSubmitted: new Date('2025-07-20T10:00:00'), approved: true, approvedBy: 'u1', approvedDate: new Date('2025-07-20T11:00:00') },
    { id: 't2', userId: null, authorName: 'Laura P.', content: 'Vender mi auto nunca fue tan fácil. La plataforma es muy intuitiva y recibí varias ofertas serias en pocos días.', dateSubmitted: new Date('2025-07-21T14:30:00'), approved: true, approvedBy: 'u1', approvedDate: new Date('2025-07-21T15:00:00') },
    { id: 't3', userId: 'u2', authorName: 'Fernando G.', content: 'La atención al cliente de TuAutoBolivar es excepcional. Me ayudaron en cada paso y resolvieron todas mis dudas.', dateSubmitted: new Date('2025-07-22T09:15:00'), approved: true, approvedBy: 'u1', approvedDate: new Date('2025-07-22T10:00:00') },
    { id: 't4', userId: 'u3', authorName: 'Carlos M.', content: 'Quiero agradecer a TuAutoBolivar por la excelente experiencia. ¡Mi auto se vendió en menos de una semana!', dateSubmitted: new Date('2025-07-23T11:00:00'), approved: false, approvedBy: null, approvedDate: null },
    { id: 't5', userId: null, authorName: 'Ana S.', content: 'Plataforma muy útil, encontré el vehículo que buscaba a un buen precio. ¡Gracias!', dateSubmitted: new Date('2025-07-24T16:00:00'), approved: false, approvedBy: null, approvedDate: null }
];


let itemToDelete = { type: null, id: null }; // Store type ('user' or 'vehicle' or 'testimonial') and ID for confirmation modal

let currentVehicleImages = []; // Stores images for the current detailed vehicle
let currentImageIndex = 0; // Current index of the displayed image in the carousel


/**
 * Shows a specific page and hides all others.
 * Updates navigation visibility based on user role and highlights active link.
 * @param {string} pageId The ID of the page to show.
 * @param {HTMLElement} navElement The navigation link element that was clicked.
 */
function showPage(pageId, navElement) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('fade-in');
    });

    const currentPage = document.getElementById(pageId);
    if (currentPage) {
        currentPage.classList.remove('hidden');
        currentPage.classList.add('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
    }

    // Remove 'active' class from previous active nav link
    if (currentActiveNav) {
        currentActiveNav.classList.remove('active');
    }
    // Add 'active' class to the current nav link
    if (navElement) {
        navElement.classList.add('active');
        currentActiveNav = navElement;
    }

    // Specific logic for userProfile page to pre-fill data
    if (pageId === 'userProfile' && currentUser) {
        document.getElementById('profileName').value = currentUser.name;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profilePhone').value = currentUser.phone || '';
        document.getElementById('profilePassword').value = ''; // Clear password fields for security
        document.getElementById('profileConfirmPassword').value = '';
    }

    // Specific logic for adminPanel to render tables
    if (pageId === 'adminPanel' && currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
        renderUsersTable();
        renderAdminVehicleTable();
        renderSiteStatistics();
        renderAdminTestimonialsTable(); // Render testimonials table in admin panel
    }

    // Update navigation links based on login status and role
    updateNav();
}

/**
 * Populates and shows the vehicle detail page.
 * @param {object} vehicle The vehicle object to display.
 */
function showVehicleDetail(pub) {
    if (!pub || !pub.vehiculo) {
        console.error("Error: Se intentó mostrar detalles de una publicación inválida:", pub);
        return;
    }

    const vehicle = pub.vehiculo;

    document.getElementById('detailVehicleName').textContent = vehicle.marca + ' ' + vehicle.modelo;
    document.getElementById('detailVehicleYear').textContent = vehicle.año;
    document.getElementById('detailVehiclePrice').textContent = `$${pub.precio.toLocaleString('es-AR')} USD`;
    document.getElementById('detailVehicleDescription').textContent = vehicle.descripcion;

    currentVehicleImages = pub.imagenes.map(img => `${BACKEND_URL}${img.url_imagen}`);
    currentImageIndex = 0;
    displayImage(currentImageIndex);

    const thumbnailReel = document.getElementById('thumbnailReel');
    thumbnailReel.innerHTML = '';
    currentVehicleImages.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Thumbnail ${index + 1}`;
        img.classList.add('thumbnail-item');
        if (index === currentImageIndex) img.classList.add('active');
        img.onclick = () => selectThumbnail(index);
        img.onerror = function () {
            this.onerror = null;
            this.src = 'https://placehold.co/80x60/cccccc/ffffff?text=No+Img';
        };
        thumbnailReel.appendChild(img);
    });

    document.getElementById('detailVehicleCondition').textContent = vehicle.condicion;
    document.getElementById('detailVehicleFuelType').textContent = vehicle.combustible;
    document.getElementById('detailVehicleMileage').textContent = `${vehicle.kilometraje.toLocaleString('es-AR')} km`;
    document.getElementById('detailVehicleCarType').textContent = vehicle.tipo;
    document.getElementById('detailVehicleTransmission').textContent = vehicle.transmision;
    document.getElementById('detailVehicleContactPhone').textContent = pub.telefono_contacto;

    const seller = users.find(u => u.id === pub.id_usuario);
    currentSeller = {
        name: seller ? seller.name : 'Vendedor',
        email: seller ? seller.email : 'No disponible',
        phone: pub.telefono_contacto
    };

    showPage('vehicleDetail');
}

/**
 * Displays the image at the given index in the carousel.
 * @param {number} index The index of the image to display.
 */
function displayImage(index) {
    const mainImage = document.getElementById('detailVehicleImage');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    const expandBtn = document.getElementById('expandImageBtn'); // Obtenemos el nuevo botón

    if (currentVehicleImages.length > 0 && index >= 0 && index < currentVehicleImages.length) {
        const imageUrl = currentVehicleImages[index];
        mainImage.src = imageUrl;
        
        // Actualizamos el 'onclick' del botón de ampliar con la URL de la imagen actual
        if (expandBtn) {
            expandBtn.onclick = () => openImageModal(imageUrl);
        }
        
        thumbnails.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
        currentImageIndex = index;
    } else {
        mainImage.src = 'https://placehold.co/600x400/cccccc/ffffff?text=Imagen+no+disponible';
        if (expandBtn) {
            expandBtn.style.display = 'none'; // Ocultamos el botón si no hay imagen
        }
    }
}

/**
 * Abre el modal y muestra la imagen en pantalla completa.
 * @param {string} imageUrl La URL de la imagen a mostrar.
 */
function openImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('fullScreenImage');
    if (modal && img) {
        img.src = imageUrl;
        modal.classList.add('show');
    }
}

/**
 * Cierra el modal de la imagen ampliada.
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Navigates to the next image in the carousel.
 */
function nextImage() {
    if (currentVehicleImages.length > 1) {
        currentImageIndex = (currentImageIndex + 1) % currentVehicleImages.length;
        displayImage(currentImageIndex);
    }
}

/**
 * Navigates to the previous image in the carousel.
 */
function prevImage() {
    if (currentVehicleImages.length > 1) {
        currentImageIndex = (currentImageIndex - 1 + currentVehicleImages.length) % currentVehicleImages.length;
        displayImage(currentImageIndex);
    }
}

/**
 * Selects and displays an image from the thumbnail reel.
 * @param {number} index The index of the thumbnail clicked.
 */
function selectThumbnail(index) {
    displayImage(index);
}

/**
 * Shows the contact information panel.
 */
let currentSeller = null; // Variable to hold current seller info

// ===================================================================
// --- NUEVAS FUNCIONES CONECTADAS A LA API ---
// ===================================================================

async function testBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/test`);
        if (!response.ok) throw new Error(`El servidor respondió con un error: ${response.status}`);
        const data = await response.json();
        console.log('✅ Conexión con Backend exitosa:', data.message);
    } catch (error) {
        console.error('❌ Error al conectar con el Backend:', error);
    }
}

function renderPublicationCards(publications) {
    const catalogGrid = document.getElementById('vehicle-catalog-grid');
    if (!catalogGrid) return;

    catalogGrid.innerHTML = ''; // Limpiamos el catálogo

    if (!publications || publications.length === 0) {
        catalogGrid.innerHTML = '<p class="text-center col-span-full text-gray-500">No se encontraron vehículos que coincidan con tu búsqueda.</p>';
        return;
    }

    // Guardamos los datos recibidos para que otras funciones puedan usarlos
    publicationsData = publications;

    publications.forEach(pub => {
        const mainImage = pub.imagenes.find(img => img.es_principal);
        const imageUrl = mainImage ? `${BACKEND_URL}${mainImage.url_imagen}` : 'https://placehold.co/600x400/cccccc/ffffff?text=Sin+Imagen';
        const publicationCardHTML = `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden vehicle-card" onclick="handleVehicleClick(${pub.id_publicacion})">
                <img src="${imageUrl}" alt="${pub.vehiculo.marca} ${pub.vehiculo.modelo}" class="w-full h-56 object-cover object-center" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagen+no+disponible';">
                <div class="p-6">
                    <h3 class="font-extrabold text-2xl text-gray-800 mb-2">${pub.vehiculo.marca} ${pub.vehiculo.modelo} <span class="text-gray-500 font-semibold">${pub.vehiculo.año}</span></h3>
                    <p class="text-green-600 text-xl font-bold mb-4">$${pub.precio.toLocaleString('es-AR')} USD</p>
                    <p class="text-gray-600 text-base leading-relaxed line-clamp-3">${pub.vehiculo.descripcion}</p>
                    <button class="mt-6 w-full text-white font-semibold py-3 px-4 rounded-xl btn-accent">Ver Detalles</button>
                </div>
            </div>`;
        catalogGrid.insertAdjacentHTML('beforeend', publicationCardHTML);
    });
}

/**
 * Función reutilizable que toma una lista de publicaciones y las dibuja en el catálogo.
 * @param {Array} publications - La lista de publicaciones a mostrar.
 */
function renderPublicationCards(publications) {
    const catalogGrid = document.getElementById('vehicle-catalog-grid');
    if (!catalogGrid) return;

    catalogGrid.innerHTML = ''; // Limpiamos el catálogo

    if (!publications || publications.length === 0) {
        catalogGrid.innerHTML = '<p class="text-center col-span-full text-gray-500">No se encontraron vehículos que coincidan con tu búsqueda.</p>';
        return;
    }

    // Guardamos los datos recibidos para que otras funciones puedan usarlos
    publicationsData = publications;

    publications.forEach(pub => {
        const mainImage = pub.imagenes.find(img => img.es_principal);
        const imageUrl = mainImage ? `${BACKEND_URL}${mainImage.url_imagen}` : 'https://placehold.co/600x400/cccccc/ffffff?text=Sin+Imagen';
        const publicationCardHTML = `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden vehicle-card" onclick="handleVehicleClick(${pub.id_publicacion})">
                <img src="${imageUrl}" alt="${pub.vehiculo.marca} ${pub.vehiculo.modelo}" class="w-full h-56 object-cover object-center" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagen+no+disponible';">
                <div class="p-6">
                    <h3 class="font-extrabold text-2xl text-gray-800 mb-2">${pub.vehiculo.marca} ${pub.vehiculo.modelo} <span class="text-gray-500 font-semibold">${pub.vehiculo.año}</span></h3>
                    <p class="text-green-600 text-xl font-bold mb-4">$${pub.precio.toLocaleString('es-AR')} USD</p>
                    <p class="text-gray-600 text-base leading-relaxed line-clamp-3">${pub.vehiculo.descripcion}</p>
                    <button class="mt-6 w-full text-white font-semibold py-3 px-4 rounded-xl btn-accent">Ver Detalles</button>
                </div>
            </div>`;
        catalogGrid.insertAdjacentHTML('beforeend', publicationCardHTML);
    });
}

/**
 * Obtiene todas las publicaciones de la API y las muestra.
 */
async function fetchAndRenderPublications() {
    const catalogGrid = document.getElementById('vehicle-catalog-grid');
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '<p class="text-center col-span-full text-gray-500">Cargando publicaciones...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/publications`);
        if (!response.ok) throw new Error('No se pudieron cargar las publicaciones');
        const publications = await response.json();
        renderPublicationCards(publications); // Usamos la nueva función para dibujar
    } catch (error) {
        console.error("Error al cargar las publicaciones:", error);
        catalogGrid.innerHTML = '<p class="text-center col-span-full text-red-500">Hubo un error al cargar las publicaciones.</p>';
    }
}


/**
 * NUEVA FUNCIÓN MANEJADORA: Busca la publicación por ID y llama a showVehicleDetail.
 * Esto evita el error de pasar objetos complejos en el HTML.
 */
function handleVehicleClick(publicationId) {
    const publication = publicationsData.find(p => p.id_publicacion === publicationId);
    if (publication) {
        showVehicleDetail(publication);
    } else {
        console.error('No se encontró la publicación con el ID:', publicationId);
        alert('Hubo un error al mostrar los detalles del vehículo.');
    }
}

/**
 * Realiza una búsqueda de vehículos y actualiza el catálogo con los resultados.
 */
async function performSearch() {
    const searchInput = document.getElementById('mainSearchInput');
    const searchTerm = searchInput.value.trim();

    // Llevamos al usuario a la sección del catálogo para que vea los resultados
    showPage('catalog'); 

    const catalogGrid = document.getElementById('vehicle-catalog-grid');
    if (!catalogGrid) return;
    catalogGrid.innerHTML = `<p class="text-center col-span-full text-gray-500">Buscando "${searchTerm}"...</p>`;

    try {
        // Usamos encodeURIComponent para asegurar que caracteres especiales se envíen correctamente
        const response = await fetch(`${API_BASE_URL}/publications/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('La búsqueda falló.');
        }
        const results = await response.json();
        renderPublicationCards(results); // Usamos la misma función para dibujar los resultados
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        catalogGrid.innerHTML = '<p class="text-center col-span-full text-red-500">Hubo un error al realizar la búsqueda.</p>';
    }
}

function showContactPanel() {
    const contactOverlay = document.getElementById('contactPanelOverlay');
    if (currentSeller) {
        document.getElementById('sellerName').textContent = currentSeller.name;
        document.getElementById('sellerEmail').href = `mailto:${currentSeller.email}`;
        document.getElementById('sellerEmail').textContent = currentSeller.email;
        document.getElementById('sellerPhone').href = `tel:${currentSeller.phone.replace(/\s/g, '')}`; // Remove spaces for tel: link
        document.getElementById('sellerPhone').textContent = currentSeller.phone;
    } else {
        // Fallback for when currentSeller is not set (shouldn't happen with proper flow)
        document.getElementById('sellerName').textContent = "Vendedor Desconocido";
        document.getElementById('sellerEmail').href = "#";
        document.getElementById('sellerEmail').textContent = "N/A";
        document.getElementById('sellerPhone').href = "#";
        document.getElementById('sellerPhone').textContent = "N/A";
    }
    contactOverlay.classList.add('show');
}

/**
 * Hides the contact information panel.
 */
function hideContactPanel() {
    const contactOverlay = document.getElementById('contactPanelOverlay');
    contactOverlay.classList.remove('show');
}

/**
 * Simulates user login.
 */
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // 1. Hacemos una petición POST a nuestro nuevo endpoint de login
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // 2. Enviamos el email y la contraseña en el cuerpo de la petición
            body: JSON.stringify({
                email: email,
                password: password
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Mostramos el mensaje de error que nos envía el backend
            throw new Error(data.detail || 'Ocurrió un error desconocido');
        }

        // 5. Si el login es exitoso, guardamos los datos del usuario en currentUser
        currentUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role
        };

        // --- LÓGICA FUSIONADA ---
        // Asumimos que el backend devuelve estos campos. 
        // Si no lo hace, estas variables serán 'undefined' y la condición no se cumplirá.
        const lastModifiedByAdmin = data.lastModifiedByAdmin;
        const lastLoginTime = data.lastLoginTime;
        const adminModifiedFields = data.adminModifiedFields;

        // 6. Verificamos si el admin modificó el perfil del usuario
        if (lastModifiedByAdmin > lastLoginTime) {
            // Si es así, mostramos la alerta de actualización obligatoria
            showMandatoryProfileUpdateAlert(adminModifiedFields);
        } else {
            // Si no, procedemos con el login normal
            // En una app real, el backend actualizaría 'lastLoginTime' en la DB.
            alert(`¡Bienvenido, ${currentUser.name}!`);
            showPage('catalog', document.querySelector('.nav-btn[onclick*="catalog"]'));
        }

    } catch (error) {
        // Si algo falla, mostramos el error al usuario
        console.error('Error en el login:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Simulates user registration.
 */
async function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 1. Validación en el frontend (siempre es buena idea)
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    try {
        // 2. Hacemos la petición POST a nuestro nuevo endpoint de registro
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                password: password
            }),
        });

        const data = await response.json();

        // 3. Si la respuesta no es exitosa (ej: 409 Conflict), mostramos el error
        if (!response.ok) {
            throw new Error(data.detail || 'Ocurrió un error durante el registro');
        }

        // 4. ¡Registro exitoso!
        alert(data.message + "\nAhora puedes iniciar sesión.");
        showPage('login', document.getElementById('loginNav')); // Redirigimos al login

    } catch (error) {
        console.error('Error en el registro:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Simulates user logout.
 */
function logout() {
    currentUser = null;
    alert('Has cerrado sesión.');
    showPage('login', document.getElementById('loginNav')); // Redirect to login after logout
}

async function updateUserProfile() {
    if (!currentUser) {
        alert("Debes estar logueado para actualizar tu perfil.");
        return;
    }

    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const password = document.getElementById('profilePassword').value;
    const confirmPassword = document.getElementById('profileConfirmPassword').value;

    // Validación de la contraseña
    if (password && password !== confirmPassword) {
        alert("Las nuevas contraseñas no coinciden.");
        return;
    }

    // Creamos el objeto con los datos a enviar
    const updateData = {
        name: name,
        email: email,
        phone: phone,
    };

    // Solo incluimos la contraseña en la petición si el usuario escribió una nueva
    if (password) {
        updateData.password = password;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo actualizar el perfil.');
        }

        const updatedUser = await response.json();

        // Actualizamos la variable global currentUser con los nuevos datos
        currentUser = updatedUser;

        alert('¡Perfil actualizado con éxito!');
        // Opcional: Redirigir a otra página o simplemente quedarse en el perfil
        showPage('catalog', document.querySelector('.nav-btn[onclick*="catalog"]'));

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert(`Error: ${error.message}`);
    }
}


/**
 * Updates the visibility of navigation links based on the current user's role.
 */
function updateNav() {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const logoutNav = document.getElementById('logoutNav');
    const myVehiclesNav = document.getElementById('myVehiclesNav');
    const publishVehicleNav = document.getElementById('publishVehicleNav');
    const myProfileNav = document.getElementById('myProfileNav');
    const adminPanelNav = document.getElementById('adminPanelNav');

    // Reset all nav buttons to default style first
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active', 'nav-btn-highlight'));
    // Reapply login/register highlighting if not logged in
    if (!currentUser) {
        document.getElementById('loginNav').classList.add('nav-btn-highlight');
    }

    if (currentUser) {
        // Logged in
        loginNav.classList.add('hidden');
        registerNav.classList.add('hidden');
        logoutNav.classList.remove('hidden');
        myVehiclesNav.classList.remove('hidden');
        publishVehicleNav.classList.remove('hidden');
        myProfileNav.classList.remove('hidden');

        if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
            adminPanelNav.classList.remove('hidden');
        } else {
            adminPanelNav.classList.add('hidden');
        }
    } else {
        // Logged out
        loginNav.classList.remove('hidden');
        registerNav.classList.remove('hidden');
        logoutNav.classList.add('hidden');
        myVehiclesNav.classList.add('hidden');
        publishVehicleNav.classList.add('hidden');
        myProfileNav.classList.add('hidden');
        adminPanelNav.classList.add('hidden');
    }
}

// --- Functions for Publish/Edit Vehicle Panel ---

/**
 * Shows the "Publish/Edit Vehicle" page, setting it up for publishing a new vehicle.
 */
function showPublishVehiclePage() {
    document.getElementById('publishEditTitle').textContent = 'Publicar Nuevo Vehículo';
    document.getElementById('saveVehicleButton').textContent = 'Publicar Vehículo';
    document.getElementById('vehicleId').value = ''; // Clear ID for new vehicle
    // Clear form fields
    document.getElementById('vehicleBrand').value = '';
    document.getElementById('vehicleModel').value = '';
    document.getElementById('vehicleYear').value = '';
    document.getElementById('vehiclePrice').value = '';
    document.getElementById('vehicleCondition').value = '';
    document.getElementById('vehicleFuelType').value = '';
    document.getElementById('vehicleMileage').value = '';
    document.getElementById('vehicleCarType').value = '';
    document.getElementById('vehicleTransmission').value = '';
    document.getElementById('vehicleContactPhone').value = ''; // Clear new phone field
    document.getElementById('vehicleDescription').value = '';
    // Note: File input value cannot be programmatically cleared for security reasons.
    // A common workaround is to reset the form or replace the input.

    showPage('publishVehicle', document.getElementById('publishVehicleNav'));
}

/**
 * Populates the "Publish/Edit Vehicle" form for editing an existing vehicle.
 * @param {string} id The ID of the vehicle to edit.
 */
async function saveVehicle() {
    if (!currentUser) {
        alert('Debes iniciar sesión para realizar esta acción.');
        return;
    }

    const publicationId = document.getElementById('vehicleId').value;
    const isEditing = !!publicationId;

    const formData = new FormData();
    formData.append('marca', document.getElementById('vehicleBrand').value);
    formData.append('modelo', document.getElementById('vehicleModel').value);
    formData.append('año', document.getElementById('vehicleYear').value);
    formData.append('condicion', document.getElementById('vehicleCondition').value);
    formData.append('combustible', document.getElementById('vehicleFuelType').value);
    formData.append('kilometraje', document.getElementById('vehicleMileage').value);
    formData.append('tipo', document.getElementById('vehicleCarType').value);
    formData.append('transmision', document.getElementById('vehicleTransmission').value);
    formData.append('descripcion', document.getElementById('vehicleDescription').value);
    formData.append('precio', document.getElementById('vehiclePrice').value);
    formData.append('telefono_contacto', document.getElementById('vehicleContactPhone').value);

    if (!isEditing) {
        formData.append('id_usuario', currentUser.id);
    }

    // --- INICIO DE LA CORRECCIÓN ---
    // En lugar de leer del input, usamos nuestro array global 'publicationImageFiles'.
    if (!isEditing && publicationImageFiles.length === 0) {
        alert('Por favor, añade al menos una imagen para el vehículo.');
        return;
    }

    if (publicationImageFiles.length > 0) {
        publicationImageFiles.forEach(file => {
            formData.append('images', file);
        });
    }
    // --- FIN DE LA CORRECCIÓN ---

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
        ? `${API_BASE_URL}/publications/${publicationId}`
        : `${API_BASE_URL}/publications/upload`;

    try {
        const response = await fetch(url, {
            method: method,
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.detail || 'Ocurrió un error al guardar la publicación.');
        }

        alert(isEditing ? '¡Publicación actualizada con éxito!' : result.message);

        document.getElementById('publishVehicleForm').reset();
        publicationImageFiles = [];
        renderImagePreview();

        fetchAndRenderPublications();

        if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
            showPage('adminPanel');
        } else {
            showPage('myVehicles', document.getElementById('myVehiclesNav'));
        }

    } catch (error) {
        console.error('Error al guardar la publicación:', error);
        alert(`Error: ${error.message}`);
    }
}

// --- Functions for My Vehicles Panel ---

/**
 * Renders the list of vehicles in the "My Vehicles" panel for the current user.
 */
async function renderMyVehicles() {
    const container = document.getElementById('myVehiclesList');
    if (!container) return;

    // 1. Verificamos que haya un usuario logueado
    if (!currentUser) {
        container.innerHTML = '<p class="text-center text-gray-600">Debes iniciar sesión para ver tus vehículos publicados.</p>';
        return;
    }

    container.innerHTML = '<p class="text-center text-gray-600">Cargando tus vehículos...</p>';

    try {
        // 2. Hacemos la petición al nuevo endpoint usando el ID del usuario actual
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/publications`);
        if (!response.ok) {
            throw new Error('No se pudieron cargar tus publicaciones.');
        }
        const userPublications = await response.json();

        if (userPublications.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-600">No tienes vehículos publicados aún.</p>';
            return;
        }

        // 3. Construimos la tabla (similar a la del panel de admin)
        let tableHtml = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca y Modelo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;

        userPublications.forEach(pub => {
            tableHtml += `
                <tr id="my-pub-row-${pub.id_publicacion}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${pub.vehiculo.marca} ${pub.vehiculo.modelo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.año}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pub.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${pub.estado}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 mr-4" onclick="editPublication(${pub.id_publicacion})">Editar</button>
                        <button class="text-red-600 hover:text-red-900" onclick="deletePublication(${pub.id_publicacion})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table></div>`;
        container.innerHTML = tableHtml;

    } catch (error) {
        console.error("Error al cargar 'Mis Vehículos':", error);
        container.innerHTML = '<p class="text-center text-red-500">Hubo un error al cargar tus vehículos.</p>';
    }
}

// --- Admin Panel Functions ---

/**
 * Renders the user management table in the admin panel.
 * @param {string} searchQuery Optional search query to filter users.
 */

/**
 * Carga la lista de todos los usuarios desde la API y la muestra en la tabla de admin.
 */
async function renderUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-500">Cargando usuarios...</td></tr>';
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error('No se pudo cargar la lista de usuarios.');
        const usersList = await response.json();
        
        // ¡CORRECCIÓN CLAVE! Guardamos la lista de usuarios en la variable global
        // para que otras funciones como 'openEditUserModal' puedan usarla.
        users = usersList; 

        if (usersList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-500">No hay usuarios registrados.</td></tr>';
            return;
        }
        let tableHtml = '';
        usersList.forEach(user => {
            const isSelf = currentUser && currentUser.id === user.id_usuario;
            const userRole = user.roles.length > 0 ? user.roles[0].nombre : 'N/A';
            const isSuperAdmin = userRole === 'superadmin';
            tableHtml += `
                <tr id="user-row-${user.id_usuario}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.nombre}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.telefono || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold ${isSuperAdmin ? 'text-red-600' : 'text-gray-500'}">${userRole}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${user.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <!-- BOTÓN DE EDITAR AÑADIDO -->
                        <button class="text-blue-600 hover:text-blue-900 mr-4" onclick="openEditUserModal(${user.id_usuario})">Editar</button>
                        <button class="${isSuperAdmin || isSelf ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900'} mr-4" ${isSuperAdmin || isSelf ? 'disabled' : ''} onclick="changeUserRole(${user.id_usuario}, '${user.nombre}')">Rol</button>
                        <button class="${isSuperAdmin || isSelf ? 'text-gray-400 cursor-not-allowed' : 'text-orange-600 hover:text-orange-900'}" ${isSuperAdmin || isSelf ? 'disabled' : ''} onclick="toggleUserStatus(${user.id_usuario})">${user.activo ? 'Desactivar' : 'Activar'}</button>
                    </td>
                </tr>`;
        });
        tableBody.innerHTML = tableHtml;
    } catch (error) {
        console.error("Error al renderizar la tabla de usuarios:", error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-red-500">No se pudo cargar la lista.</td></tr>';
    }
}

/**
 * NUEVA FUNCIÓN: Abre el modal de edición y lo rellena con los datos del usuario.
 */
function openEditUserModal(userId) {
    const user = users.find(u => u.id_usuario === userId);
    if (!user) {
        alert('Error: No se encontraron los datos del usuario.');
        return;
    }
    document.getElementById('editUserId').value = user.id_usuario;
    document.getElementById('editUserName').value = user.nombre;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserPhone').value = user.telefono || '';
    document.getElementById('editUserModal').classList.add('show');
}

/**
 * NUEVA FUNCIÓN: Guarda los cambios del usuario editado.
 */
async function saveEditedUser() {
    const userId = document.getElementById('editUserId').value;
    const updateData = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        phone: document.getElementById('editUserPhone').value,
    };

    // Leer contraseña (opcional) y validarla
    const password = document.getElementById('editUserPassword')?.value || '';
    const confirm = document.getElementById('editUserConfirmPassword')?.value || '';
    if (password) {
        if (password !== confirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        updateData.password = password; // se enviará al backend y será hasheada allí
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' 
                // Si tu backend requiere autenticación agrega Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateData),
        });

        // Intentamos leer JSON si viene; si no, leemos texto plano
        let resBody;
        try { resBody = await response.json(); } catch (e) { resBody = await response.text().catch(()=>null); }

        if (!response.ok) {
            const msg = resBody?.detail || resBody || `Error ${response.status}`;
            throw new Error(msg);
        }

        alert('Usuario actualizado con éxito.');

        // Limpiar campos sensibles del modal
        if (document.getElementById('editUserPassword')) document.getElementById('editUserPassword').value = '';
        if (document.getElementById('editUserConfirmPassword')) document.getElementById('editUserConfirmPassword').value = '';

        hideEditUserModal();
        renderUsersTable(); // Recargar la tabla para ver cambios

    } catch (error) {
        console.error('Error al guardar el usuario:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * NUEVA FUNCIÓN: Oculta el modal de edición.
 */
function hideEditUserModal() {
    document.getElementById('editUserModal').classList.remove('show');
}


/**
 * Se conecta al backend para activar o desactivar un usuario.
 */
async function toggleUserStatus(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, {
            method: 'PATCH',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo cambiar el estado del usuario.');
        }
        alert('Estado del usuario actualizado con éxito.');
        renderUsersTable();
    } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Pide un nuevo rol y se conecta al backend para cambiarlo.
 */
async function changeUserRole(userId, userName) {
    const newRole = prompt(`Introduce el nuevo rol para "${userName}" (puedes escribir 'admin' o 'user'):`);
    if (!newRole || (newRole.toLowerCase() !== 'admin' && newRole.toLowerCase() !== 'user')) {
        alert("Operación cancelada o rol inválido. Por favor, introduce 'admin' o 'user'.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_role: newRole.toLowerCase() }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo cambiar el rol del usuario.');
        }
        alert('Rol del usuario actualizado con éxito.');
        renderUsersTable();
    } catch (error) {
        console.error('Error al cambiar el rol del usuario:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Se conecta al backend para eliminar un usuario.
 */
async function deleteUser(userId, userName) {
    const confirmation = confirm(`¿Estás seguro de que quieres eliminar permanentemente al usuario "${userName}"? Todas sus publicaciones también serán eliminadas.`);
    if (!confirmation) return;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo eliminar al usuario.');
        }
        const result = await response.json();
        alert(result.message);
        renderUsersTable();
    } catch (error) {
        console.error('Error al eliminar al usuario:', error);
        alert(`Error: ${error.message}`);
    }
}




/**
 * Renders the vehicle management table in the admin panel.
 * @param {string} searchQuery Optional search query to filter vehicles.
 */
/**
 * CORREGIDA: Carga todas las publicaciones y las muestra en una tabla para el admin.
 */
/**
 * CORREGIDA: Carga todas las publicaciones y las muestra en una tabla para el admin.
 * Ahora espera si los datos no están listos.
 */
/**
 * CORRECCIÓN FINAL: Dibuja las filas en la tabla existente del panel de admin.
 */
function renderAdminVehicleTable() {
    // 1. Buscamos el CUERPO de la tabla, no el contenedor.
    const tableBody = document.getElementById('adminVehiclesTableBody');
    if (!tableBody) {
        // Si el usuario no está en la página de admin, esta función no hace nada.
        return;
    }

    // 2. Verificamos si los datos de la API ya se cargaron.
    if (publicationsData.length === 0) {
        // Si no, mostramos un mensaje de carga y reintentamos en un momento.
        tableBody.innerHTML = '<tr><td colspan="13" class="text-center p-4 text-gray-500">Cargando publicaciones...</td></tr>';
        setTimeout(renderAdminVehicleTable, 200); // Reintentamos en 0.2 segundos
        return;
    }

    // 3. Si no hay publicaciones, mostramos un mensaje.
    if (publicationsData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="13" class="text-center p-4 text-gray-500">No hay vehículos publicados.</td></tr>';
        return;
    }

    let tableRowsHtml = '';

    // 4. Construimos solo las FILAS de la tabla
    publicationsData.forEach(pub => {
        const owner = users.find(u => u.id === pub.id_usuario);
        tableRowsHtml += `
            <tr id="pub-row-${pub.id_publicacion}" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${pub.vehiculo.marca}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.modelo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.año}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.condicion}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.combustible}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.kilometraje.toLocaleString('es-AR')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.tipo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.vehiculo.transmision}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.telefono_contacto}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${owner ? owner.name : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.estado}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pub.destacado ? 'Sí' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-4" onclick="editPublication(${pub.id_publicacion})">Editar</button>
                    <button class="text-red-600 hover:text-red-900" onclick="deletePublication(${pub.id_publicacion})">Eliminar</button>
                </td>
            </tr>
        `;
    });

    // 5. Insertamos las filas en el cuerpo de la tabla.
    tableBody.innerHTML = tableRowsHtml;
}

/**
 * Se conecta al backend para eliminar una publicación.
 * @param {number} publicationId El ID de la publicación a eliminar.
 */
async function deletePublication(publicationId) {
    // Pedimos confirmación para evitar borrados accidentales
    const confirmation = confirm(`¿Estás seguro de que quieres eliminar la publicación con ID ${publicationId}? Esta acción no se puede deshacer.`);

    if (!confirmation) {
        return; // Si el admin cancela, no hacemos nada
    }

    try {
        // Hacemos la petición DELETE al backend
        const response = await fetch(`${API_BASE_URL}/publications/${publicationId}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'No se pudo eliminar la publicación.');
        }

        // ¡Éxito! Mostramos el mensaje y actualizamos la vista
        alert(result.message);

        // Eliminamos la fila de la tabla sin recargar todo
        const rowToRemove = document.getElementById(`pub-row-${publicationId}`);
        if (rowToRemove) {
            rowToRemove.remove();
        }

        // Volvemos a cargar los datos del catálogo para mantener todo sincronizado
        fetchAndRenderPublications();

    } catch (error) {
        console.error('Error al eliminar la publicación:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Prepara el formulario para editar una publicación existente.
 * @param {number} publicationId El ID de la publicación a editar.
 */
function editPublication(publicationId) {
    // 1. Buscamos la publicación completa en nuestros datos locales.
    const pub = publicationsData.find(p => p.id_publicacion === publicationId);
    if (!pub) {
        alert('Error: No se encontró la publicación para editar.');
        return;
    }

    // 2. Rellenamos todos los campos del formulario con los datos de la publicación.
    document.getElementById('publishEditTitle').textContent = 'Editar Vehículo';
    document.getElementById('saveVehicleButton').textContent = 'Actualizar Vehículo';

    // Usamos el ID de la publicación para saber que estamos en "modo edición"
    document.getElementById('vehicleId').value = pub.id_publicacion;

    const vehicle = pub.vehiculo;
    document.getElementById('vehicleBrand').value = vehicle.marca;
    document.getElementById('vehicleModel').value = vehicle.modelo;
    document.getElementById('vehicleYear').value = vehicle.año;
    document.getElementById('vehiclePrice').value = pub.precio;
    document.getElementById('vehicleCondition').value = vehicle.condicion;
    document.getElementById('vehicleFuelType').value = vehicle.combustible;
    document.getElementById('vehicleMileage').value = vehicle.kilometraje;
    document.getElementById('vehicleCarType').value = vehicle.tipo;
    document.getElementById('vehicleTransmission').value = vehicle.transmision;
    document.getElementById('vehicleContactPhone').value = pub.telefono_contacto;
    document.getElementById('vehicleDescription').value = vehicle.descripcion;

    // Opcional: Limpiamos la vista previa de imágenes, ya que no podemos pre-rellenar el input de archivos.
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) {
        previewContainer.innerHTML = '<p class="text-sm text-gray-500 col-span-full">Las imágenes actuales se mantendrán si no seleccionas nuevas.</p>';
    }

    // 3. Mostramos la página del formulario.
    showPage('publishVehicle', document.getElementById('publishVehicleNav'));
}


/**
 * Toggles the status of a vehicle between 'active' and 'inactive'.
 * @param {string} vehicleId The ID of the vehicle whose status to toggle.
 */
function toggleVehicleStatus(vehicleId) {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            vehicle.status = vehicle.status === 'active' ? 'inactive' : 'active';
            alert(`Estado del vehículo ${vehicle.brand} ${vehicle.model} cambiado a ${vehicle.status}.`);
            renderAdminVehicleTable(document.getElementById('vehicleSearchInput').value); // Re-render with current search query
            renderSiteStatistics(); // Update statistics
        }
    } else {
        alert('No tienes permiso para realizar esta acción.');
    }
}

/**
 * Toggles the featured status of a vehicle.
 * @param {string} vehicleId The ID of the vehicle whose featured status to toggle.
 */
function toggleVehicleFeatured(vehicleId) {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            vehicle.isFeatured = !vehicle.isFeatured;
            alert(`El vehículo ${vehicle.brand} ${vehicle.model} ${vehicle.isFeatured ? 'ha sido marcado como destacado.' : 'ya no es destacado.'}`);
            renderAdminVehicleTable(document.getElementById('vehicleSearchInput').value); // Re-render with current search query
            renderSiteStatistics(); // Update statistics
        }
    } else {
        alert('No tienes permiso para realizar esta acción.');
    }
}

/**
 * Renders the site statistics in the admin panel.
 */
function renderSiteStatistics() {
    if (currentUser && currentUser.role === 'superadmin') {
        const totalUsers = users.length;
        const totalVehicles = vehicles.length;
        const activeVehicles = vehicles.filter(v => v.status === 'active').length;
        const featuredVehicles = vehicles.filter(v => v.isFeatured).length;

        document.getElementById('statTotalUsers').textContent = totalUsers;
        document.getElementById('statTotalVehicles').textContent = totalVehicles;
        document.getElementById('statActiveVehicles').textContent = activeVehicles;
        document.getElementById('statFeaturedVehicles').textContent = featuredVehicles;
    }
}


// --- Confirmation Modal Functions ---
/**
 * Shows the confirmation modal for deleting an item (user or vehicle).
 * @param {string} type The type of item ('user' or 'vehicle' or 'testimonial').
 * @param {string} id The ID of the item to be deleted.
 */
function showConfirmationModal(type, id) {
    itemToDelete = { type: type, id: id };
    document.getElementById('confirmationModal').classList.add('show');
}

/**
 * Hides the confirmation modal.
 */
function hideConfirmationModal() {
    document.getElementById('confirmationModal').classList.remove('show');
    itemToDelete = { type: null, id: null };
}

/**
 * Confirms and performs the deletion of an item based on its type.
 */
function confirmDelete() {
    if (itemToDelete.type === 'user') {
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
            if (currentUser.id === itemToDelete.id) {
                alert('No puedes eliminar tu propia cuenta desde el panel de administración.');
                hideConfirmationModal();
                return;
            }
            users = users.filter(u => u.id !== itemToDelete.id);
            // Also remove vehicles owned by the deleted user
            vehicles = vehicles.filter(v => v.ownerId !== itemToDelete.id);
            // Also remove testimonials by the deleted user
            testimonials = testimonials.filter(t => t.userId !== itemToDelete.id);
            alert('Usuario y sus publicaciones/testimonios eliminados con éxito.');
            renderUsersTable(document.getElementById('userSearchInput').value); // Re-render with current search query
            renderAdminVehicleTable(document.getElementById('vehicleSearchInput').value); // Re-render vehicle table too
            renderSiteStatistics(); // Update statistics
            renderAdminTestimonialsTable(); // Re-render testimonials table
            renderApprovedTestimonials(); // Update public testimonials
        } else {
            alert('No tienes permiso para eliminar usuarios.');
        }
    } else if (itemToDelete.type === 'vehicle') {
        // Anyone with admin/superadmin role can delete any vehicle.
        // Regular users can only delete their own vehicles from "My Vehicles" panel.
        const vehicleIndex = vehicles.findIndex(v => v.id === itemToDelete.id);
        if (vehicleIndex === -1) {
            alert('Vehículo no encontrado.');
            hideConfirmationModal();
            return;
        }

        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin' || vehicles[vehicleIndex].ownerId === currentUser.id)) {
            vehicles = vehicles.filter(v => v.id !== itemToDelete.id);
            alert('Publicación de vehículo eliminada con éxito.');
            renderMyVehicles(); // Update user's own list
            renderAdminVehicleTable(document.getElementById('vehicleSearchInput').value); // Re-render admin's list with current search query
            renderSiteStatistics(); // Update statistics
        } else {
            alert('No tienes permiso para eliminar esta publicación.');
        }
    } else if (itemToDelete.type === 'testimonial') {
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
            testimonials = testimonials.filter(t => t.id !== itemToDelete.id);
            alert('Testimonio eliminado con éxito.');
            renderAdminTestimonialsTable(); // Re-render admin testimonials table
            renderApprovedTestimonials(); // Update public testimonials
        } else {
            alert('No tienes permiso para eliminar testimonios.');
        }
    }
    hideConfirmationModal();
}

// --- Mandatory Profile Update Modal Functions ---
/**
 * Shows the mandatory profile update modal.
 * @param {Array<string>} modifiedFields An array of strings indicating which fields were modified (e.g., ['email', 'password']).
 */
function showMandatoryProfileUpdateAlert(modifiedFields) {
    const messageElement = document.getElementById('mandatoryUpdateMessage');
    let message = "Un administrador ha modificado tu información de perfil. Debes actualizar tu perfil para continuar usando la cuenta.";

    if (modifiedFields && modifiedFields.length > 0) {
        const fieldNames = modifiedFields.map(field => {
            switch (field) {
                case 'email': return 'email';
                case 'password': return 'contraseña';
                case 'phone': return 'teléfono';
                default: return field;
            }
        });
        const formattedFields = fieldNames.join(', ');
        message = `Un administrador ha modificado tu información de perfil (específicamente tu ${formattedFields}). Debes actualizar tu perfil para continuar usando la cuenta.`;
    }

    messageElement.textContent = message;
    document.getElementById('mandatoryProfileUpdateModal').classList.add('show');
}

/**
 * Hides the mandatory profile update modal and redirects to the profile page.
 * Also updates lastLoginTime to acknowledge the warning and clears adminModifiedFields.
 */
function goToProfileAndAcknowledge() {
    const user = users.find(u => u.id === currentUser.id);
    if (user) {
        user.lastLoginTime = Date.now(); // Update last login time to acknowledge the warning
        user.adminModifiedFields = []; // Clear the modified fields after acknowledgement
    }
    hideMandatoryProfileUpdateAlert();
    showPage('userProfile', document.getElementById('myProfileNav'));
}

/**
 * Hides the mandatory profile update modal.
 */
function hideMandatoryProfileUpdateAlert() {
    document.getElementById('mandatoryProfileUpdateModal').classList.remove('show');
}

/**
 * Handles updating the current user's profile from the 'Mi Perfil' page.
 */
async function updateUserProfile() {
    if (!currentUser) {
        alert("Debes estar logueado para actualizar tu perfil.");
        return;
    }

    const newName = document.getElementById('profileName').value;
    const newEmail = document.getElementById('profileEmail').value;
    const newPhone = document.getElementById('profilePhone').value;
    const newPassword = document.getElementById('profilePassword').value;
    const newConfirmPassword = document.getElementById('profileConfirmPassword').value;

    if (newPassword && newPassword !== newConfirmPassword) {
        alert("Las nuevas contraseñas no coinciden.");
        return;
    }

    // Creamos el objeto con los datos a enviar
    const updateData = {
        name: newName,
        email: newEmail,
        phone: newPhone,
    };

    // Solo incluimos la contraseña en la petición si el usuario escribió una nueva
    if (newPassword) {
        updateData.password = newPassword;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo actualizar el perfil.');
        }

        const updatedUser = await response.json();

        // Actualizamos la variable global currentUser con los nuevos datos
        currentUser = updatedUser;

        alert('¡Perfil actualizado con éxito!');
        
        // Limpiamos los campos de contraseña por seguridad
        document.getElementById('profilePassword').value = '';
        document.getElementById('profileConfirmPassword').value = '';

        // Redirigimos al catálogo
        showPage('catalog', document.querySelector('.nav-btn[onclick*="catalog"]'));

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert(`Error: ${error.message}`);
    }
}


// --- Testimonial Specific Functions ---

/**
 * Shows the testimonial submission modal.
 */
function showTestimonialModal() {
    // Pre-fill testimonial author if user is logged in
    if (currentUser) {
        document.getElementById('testimonialAuthor').value = currentUser.name;
    } else {
        document.getElementById('testimonialAuthor').value = ''; // Clear if not logged in
    }
    document.getElementById('testimonialContent').value = ''; // Clear content
    document.getElementById('testimonialModal').classList.add('show');
}

/**
 * Hides the testimonial submission modal.
 */
function hideTestimonialModal() {
    document.getElementById('testimonialModal').classList.remove('show');
}

/**
 * Submits a new testimonial.
 */
function submitTestimonial() {
    const authorName = document.getElementById('testimonialAuthor').value;
    const content = document.getElementById('testimonialContent').value;

    if (!authorName || !content) {
        alert('Por favor, completa todos los campos del testimonio.');
        return;
    }

    const newId = 't' + (testimonials.length > 0 ? Math.max(...testimonials.map(t => parseInt(t.id.substring(1)))) + 1 : 1);
    const newTestimonial = {
        id: newId,
        userId: currentUser ? currentUser.id : null, // Link to user if logged in
        authorName: authorName,
        content: content,
        dateSubmitted: new Date(),
        approved: false, // Must be approved by admin
        approvedBy: null,
        approvedDate: null
    };

    testimonials.push(newTestimonial);
    alert('¡Testimonio enviado con éxito! Será visible una vez que sea aprobado por un administrador.');
    hideTestimonialModal(); // Hide the modal after submission
    renderAdminTestimonialsTable(); // Update admin view immediately
}

/**
 * Renders the list of approved testimonials on the public section.
 */
function renderApprovedTestimonials() {
    const approvedTestimonialsList = document.getElementById('approvedTestimonialsList');
    const approved = testimonials.filter(t => t.approved);

    if (approved.length === 0) {
        approvedTestimonialsList.innerHTML = '<p class="text-center text-gray-600 col-span-full" id="noTestimonialsMessage">No hay testimonios aprobados aún.</p>';
        return;
    }

    let html = '';
    approved.forEach(t => {
        html += `
            <div class="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100">
                <p class="text-gray-700 text-lg italic mb-4">"${t.content}"</p>
                <p class="font-bold text-gray-900">- ${t.authorName}</p>
                <p class="text-gray-500 text-sm mt-1">${t.dateSubmitted.toLocaleDateString()}</p>
            </div>
        `;
    });
    approvedTestimonialsList.innerHTML = html;
}

/**
 * Renders the testimonials table in the admin panel.
 */
function renderAdminTestimonialsTable() {
    const adminTestimonialsTableBody = document.getElementById('adminTestimonialsTableBody');
    let tableHtml = '';

    if (testimonials.length === 0) {
        adminTestimonialsTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-600">No hay testimonios para gestionar.</td></tr>';
        return;
    }

    testimonials.forEach(t => {
        const isApproved = t.approved;
        const statusClass = isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const statusText = isApproved ? 'Aprobado' : 'Pendiente';
        const buttonHtml = isApproved ?
            `<button class="inline-flex items-center text-red-600 hover:text-red-800 transform hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-md px-2 py-1" onclick="showConfirmationModal('testimonial', '${t.id}')">
                <i class="fas fa-trash-alt mr-1"></i> Eliminar
            </button>` :
            `<button class="inline-flex items-center text-green-600 hover:text-green-800 mr-4 transform hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-md px-2 py-1" onclick="approveTestimonial('${t.id}')">
                <i class="fas fa-check-circle mr-1"></i> Aprobar
            </button>
            <button class="inline-flex items-center text-red-600 hover:text-red-800 transform hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-md px-2 py-1" onclick="showConfirmationModal('testimonial', '${t.id}')">
                <i class="fas fa-trash-alt mr-1"></i> Eliminar
            </button>`;

        tableHtml += `
            <tr class="hover:bg-gray-50 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                    ${t.authorName}
                </td>
                <td class="px-6 py-4 text-base text-gray-700 max-w-xs truncate">
                    ${t.content}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                    ${t.dateSubmitted.toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                    ${buttonHtml}
                </td>
            </tr>
        `;
    });
    adminTestimonialsTableBody.innerHTML = tableHtml;
}

/**
 * Approves a testimonial.
 * @param {string} testimonialId The ID of the testimonial to approve.
 */
function approveTestimonial(testimonialId) {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
        const testimonial = testimonials.find(t => t.id === testimonialId);
        if (testimonial) {
            testimonial.approved = true;
            testimonial.approvedBy = currentUser.id;
            testimonial.approvedDate = new Date();
            alert('Testimonio aprobado con éxito.');
            renderAdminTestimonialsTable(); // Re-render admin table
            renderApprovedTestimonials(); // Update public display
        }
    } else {
        alert('No tienes permiso para aprobar testimonios.');
    }
}

/**
 * Initial setup on page load.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN DEL SCROLL DEL HEADER (Tu código original) ---
    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) {


        const scrollThreshold = 100;
        function handleScroll() {
            if (window.scrollY > scrollThreshold) {
                mainHeader.classList.add('header-transparent');
            } else {
                mainHeader.classList.remove('header-transparent');
            }
        }
        window.addEventListener('scroll', handleScroll);
    }

    // --- LLAMADAS INICIALES AL CARGAR LA PÁGINA ---

    // 1. Probamos la conexión con el backend (muestra un mensaje en la consola F12).
    testBackendConnection();

    // 2. Cargamos las publicaciones del catálogo desde la API y las mostramos.
    fetchAndRenderPublications();

    // 3. Renderizamos los testimonios (usando tu función original).
    renderApprovedTestimonials();

    // 4. Mostramos la página de catálogo por defecto.
    showPage('catalog', document.querySelector('.nav-btn[onclick*="catalog"]'));

    // El resto de tu lógica original para renderizar paneles si es necesario.
    if (document.getElementById('myVehicles')?.classList.contains('active')) {
        renderMyVehicles();
    }
    if (document.getElementById('adminPanel')?.classList.contains('active')) {
        renderUsersTable();
        renderAdminVehicleTable();
        renderSiteStatistics();
        renderAdminTestimonialsTable();
    }

    /**
 * Muestra una vista previa de las imágenes seleccionadas por el usuario en el formulario.
 */
    function previewImages(event) {
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (!previewContainer) return;

        previewContainer.innerHTML = ''; // Limpiamos las vistas previas anteriores
        const files = event.target.files;

        if (files) {
            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/')) { return; }
                const reader = new FileReader();
                reader.onload = function (e) {
                    const previewWrapper = document.createElement('div');
                    previewWrapper.classList.add('relative', 'p-2', 'bg-gray-100', 'rounded-lg');
                    previewWrapper.innerHTML = `<img src="${e.target.result}" alt="${file.name}" class="w-full h-24 object-cover rounded-md">`;
                    previewContainer.appendChild(previewWrapper);
                }
                reader.readAsDataURL(file);
            });
        }
    }


    /**
     * Dibuja el carrusel de previsualización basado en la lista 'publicationImageFiles'.
     */
    /**
     * CORREGIDA: Dibuja el carrusel de previsualización y maneja correctamente el estado vacío.
     */
    function renderImagePreview() {
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (!previewContainer) return;

        // Limpiamos el contenido anterior.
        previewContainer.innerHTML = '';

        // Si no quedan imágenes en la lista...
        if (publicationImageFiles.length === 0) {
            // ...volvemos a crear el mensaje de "no hay imágenes" directamente.
            previewContainer.innerHTML = '<p id="noImagesText" class="text-gray-500">Aún no has añadido ninguna imagen.</p>';
            return;
        }

        // Si hay imágenes, las dibujamos una por una.
        publicationImageFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const isPrimary = index === 0;
                const wrapper = document.createElement('div');
                wrapper.className = `preview-image-wrapper w-32 h-24 rounded-lg ${isPrimary ? 'is-primary' : ''}`;
                wrapper.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" class="w-full h-full object-cover rounded-md">
                <div class="preview-image-actions">
                    <button title="Eliminar imagen" class="preview-action-btn" onclick="removeImage(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    ${!isPrimary ? `
                    <button title="Hacer principal" class="preview-action-btn" onclick="setPrimaryImage(${index})">
                        <i class="fas fa-star"></i>
                    </button>
                    ` : ''}
                </div>
            `;
                previewContainer.appendChild(wrapper);
            }
            reader.readAsDataURL(file);
        });
    }

    /**
     * Elimina una imagen de la lista por su índice.
     */
    function removeImage(index) {
        publicationImageFiles.splice(index, 1);
        renderImagePreview();
    }

    /**
     * Establece una imagen como principal moviéndola al inicio de la lista.
     */
    function setPrimaryImage(index) {
        if (index > 0) {
            const [item] = publicationImageFiles.splice(index, 1);
            publicationImageFiles.unshift(item);
            renderImagePreview();
        }
    }

    function addImageToList() {
        const input = document.getElementById('singleImageInput');
        if (input.files.length > 0) {
            const file = input.files[0];
            if (!file.type.startsWith('image/')) {
                alert("Por favor, selecciona un archivo de imagen válido.");
                return;
            }
            publicationImageFiles.push(file);
            renderImagePreview();
            input.value = ''; // Reseteamos el input
        } else {
            alert("Primero selecciona una foto para añadir.");
        }
    }

    /**
     * Inicia el proceso para que un usuario desactive su propia cuenta (soft delete).
     */
    async function deactivateOwnAccount() {
        if (!currentUser) {
            alert("Debes estar logueado para realizar esta acción.");
            return;
        }

        const confirmation = confirm(
            "¿Estás seguro de que quieres desactivar tu cuenta?\n\n" +
            "Tus publicaciones se ocultarán y no podrás iniciar sesión. " +
            "Un administrador podrá reactivar tu cuenta en el futuro si lo solicitas."
        );

        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/deactivate`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'No se pudo desactivar la cuenta.');
            }

            const result = await response.json();
            alert(result.message);

            // Después de desactivar la cuenta, cerramos la sesión.
            logout();

        } catch (error) {
            console.error('Error al desactivar la cuenta:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // Aseguramos que la función sea accesible desde atributos inline (onchange) si todavía los usas.
    window.previewImages = previewImages;
    // Exponer funciones usadas por atributos inline (onclick) y llamadas externas
    window.addImageToList = addImageToList;
       window.removeImage = removeImage;
    window.setPrimaryImage = setPrimaryImage;
    window.renderImagePreview = renderImagePreview;
    // Hacer accesible la función de desactivar cuenta desde HTML onclick
    window.deactivateOwnAccount = deactivateOwnAccount;
});