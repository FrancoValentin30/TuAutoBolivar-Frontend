// ===================================================================
// --- CONFIGURACIÓN Y CONEXIÓN CON EL BACKEND ---
// ===================================================================

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const BACKEND_URL = 'http://127.0.0.1:8000';

// Simple state management for demonstration
let currentUser = null; // null for logged out, { id: 'u1', name: '...', email: '...', role: 'user', isActive: true }
let currentActiveNav = null; // To keep track of the active navigation link
let publicationImageFiles = []; // Guardará los archivos de imagen que el usuario vaya añadiendo.
let users = [];


let publicationsData = [];
// Vehicles array global (antes estaba comentado). Se llenará desde la API.
let vehicles = [];
let itemToDelete = { type: null, id: null }; // Store type ('user' or 'vehicle' or 'testimonial') and ID for confirmation modal
let currentVehicleImages = []; // Stores images for the current detailed vehicle
let currentImageIndex = 0; // Current index of the displayed image in the carousel
let testimonials = [];

/**
 * Shows a specific page and hides all others.
 * Updates navigation visibility based on user role and highlights active link.
 * @param {string} pageId The ID of the page to show.
 * @param {HTMLElement} navElement The navigation link element that was clicked.
/**
 * Muestra una página específica y maneja la carga de datos para el panel de admin.
 */
async function showPage(pageId, navElement) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    const currentPage = document.getElementById(pageId);
    if (currentPage) {
        currentPage.classList.remove('hidden');
        currentPage.classList.add('fade-in');
    }
    if (currentActiveNav) currentActiveNav.classList.remove('active');
    if (navElement) {
        navElement.classList.add('active');
        currentActiveNav = navElement;
    }

    // --- INICIO DE LA CORRECCIÓN ---
    if (pageId === 'adminPanel' && currentUser) {
        // 1. Esperamos a que la lista de usuarios se cargue y se guarde en la variable global.
        await renderUsersTable();
        // 2. Ahora que 'users' tiene datos, podemos renderizar las demás tablas sin errores.
        renderAdminVehicleTable();
        renderSiteStatistics();
         renderAdminTestimonialsTable(); // Comentado hasta que se implemente
    }
    // --- FIN DE LA CORRECCIÓN ---

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
        catalogGrid.innerHTML = '<p class="text-center col-span-full text-gray-500">No se encontraron vehículos.</p>';
        return;
    }

    publicationsData = publications; // Guardamos los datos para que otras funciones los usen

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

    // 1. Preparamos los datos en el formato que espera el backend (form-data)
    const formData = new URLSearchParams();
    formData.append('username', email); // El backend espera 'username'
    formData.append('password', password);

    try {
        // 2. Hacemos la primera petición para obtener el token de acceso
        const tokenResponse = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            throw new Error(tokenData.detail || 'Ocurrió un error desconocido');
        }

        // 3. Guardamos el token que recibimos
        const token = tokenData.access_token;

        // 4. Usamos el token para hacer una segunda petición y obtener los datos del usuario
        const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                // Enviamos el token en la cabecera de autorización
                'Authorization': `Bearer ${token}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error('No se pudo obtener el perfil del usuario después del login.');
        }

        const userData = await profileResponse.json();

        // 5. Ahora sí, guardamos los datos reales del usuario en nuestra variable global
        currentUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            token: token // Guardamos el token para futuras peticiones
        };

        alert(`¡Bienvenido, ${currentUser.name}!`);
        showPage('catalog', document.querySelector('.nav-btn[onclick*="catalog"]'));

    } catch (error) {
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

    const newName = document.getElementById('profileName').value;
    const newEmail = document.getElementById('profileEmail').value;
    const newPhone = document.getElementById('profilePhone').value;
    const newPassword = document.getElementById('profilePassword').value;
    const newConfirmPassword = document.getElementById('profileConfirmPassword').value;

    if (newPassword && newPassword !== newConfirmPassword) {
        alert("Las nuevas contraseñas no coinciden.");
        return;
    }

    const updateData = {
        name: newName,
        email: newEmail,
        phone: newPhone,
    };

    if (newPassword) {
        updateData.password = newPassword;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}` // <-- Enviamos el token
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo actualizar el perfil.');
        }

        const updatedUser = await response.json();
        // Actualizamos la variable global, pero manteniendo el token
        currentUser = { ...updatedUser, token: currentUser.token }; 

        alert('¡Perfil actualizado con éxito!');
        document.getElementById('profilePassword').value = '';
        document.getElementById('profileConfirmPassword').value = '';
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
    const form = document.getElementById('publishVehicleForm');
    if (form) form.reset();
    publicationImageFiles = [];
    renderImagePreview();
    const title = document.getElementById('publishEditTitle');
    if (title) title.textContent = 'Publicar Nuevo Vehículo';
    const button = document.getElementById('saveVehicleButton');
    if (button) button.textContent = 'Publicar Vehículo';
    const idInput = document.getElementById('vehicleId');
    if (idInput) idInput.value = '';
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

    // Usamos el nuevo array de imágenes
    if (publicationImageFiles.length === 0) {
        alert('Por favor, añade al menos una imagen para el vehículo.');
        return;
    }
    publicationImageFiles.forEach(file => {
        formData.append('images', file);
    });

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_BASE_URL}/publications/${publicationId}` : `${API_BASE_URL}/publications/upload`;
    try {
        const response = await fetch(url, { method: method, body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Ocurrió un error');
        alert(isEditing ? '¡Publicación actualizada!' : result.message);
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
/**
 * Carga la lista de todos los usuarios desde la API, la guarda globalmente,
 * y la muestra en la tabla de admin.
 */
/**
 * Carga la lista de usuarios desde la API, la guarda globalmente,
 * y la muestra en la tabla de admin.
 */
async function renderUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody || !currentUser?.token) return;

    tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-500">Cargando usuarios...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la lista de usuarios.');
        
        const usersList = await response.json();
        users = usersList; // Actualizamos la caché local de usuarios

        if (usersList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-500">No hay usuarios registrados.</td></tr>';
            return;
        }

        let tableHtml = '';
        usersList.forEach(user => {
            const isSelf = currentUser.id === user.id_usuario;
            const userRole = user.roles.length > 0 ? user.roles[0].nombre : 'N/A';
            const isTargetSuperAdmin = userRole === 'superadmin';
            const isTargetAdmin = userRole === 'admin';

            // --- Lógica de Permisos para los Botones ---
            const canEdit = (currentUser.role === 'superadmin' && !isTargetSuperAdmin && !isSelf) || (currentUser.role === 'admin' && userRole === 'user');
            const canChangeRole = currentUser.role === 'superadmin' && !isTargetSuperAdmin && !isSelf;
            const canToggleStatus = (currentUser.role === 'superadmin' && !isTargetSuperAdmin && !isSelf) || (currentUser.role === 'admin' && userRole === 'user');
            const canDelete = (currentUser.role === 'superadmin' && !isTargetSuperAdmin && !isSelf) || (currentUser.role === 'admin' && userRole === 'user');
            // --- Fin de la Lógica de Permisos ---

            tableHtml += `
                <tr id="user-row-${user.id_usuario}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.nombre}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.telefono || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold ${isTargetSuperAdmin ? 'text-red-600' : ''}">${userRole}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${canEdit ? `<button class="text-blue-600 hover:text-blue-900 mr-4" onclick="openEditUserModal(${user.id_usuario})">Editar</button>` : ''}
                        ${canChangeRole ? `<button class="text-indigo-600 hover:text-indigo-900 mr-4" onclick="changeUserRole(${user.id_usuario}, '${user.nombre}')">Rol</button>` : ''}
                        ${canToggleStatus ? `<button class="text-orange-600 hover:text-orange-900 mr-4" onclick="toggleUserStatus(${user.id_usuario})">${user.activo ? 'Desactivar' : 'Activar'}</button>` : ''}
                        ${canDelete ? `<button class="text-red-600 hover:text-red-900" onclick="deleteUser(${user.id_usuario}, '${user.nombre}')">Eliminar</button>` : ''}
                    </td>
                </tr>`;
        });
        tableBody.innerHTML = tableHtml;
    } catch (error) {
        console.error("Error al renderizar la tabla de usuarios:", error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-red-500">No tienes permiso para ver esta sección.</td></tr>';
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

    // --- INICIO DE LA CORRECCIÓN ---
    // Leemos los campos de contraseña del modal
    const password = document.getElementById('editUserPassword')?.value || '';
    const confirm = document.getElementById('editUserConfirmPassword')?.value || '';

    // Si se escribió algo en los campos de contraseña, validamos y añadimos
    if (password) {
        if (password !== confirm) {
            alert('Las contraseñas no coinciden.');
            return; // Detenemos la ejecución si no coinciden
        }
        updateData.password = password; // Añadimos la nueva contraseña a los datos a enviar
    }
    // --- FIN DE LA CORRECCIÓN ---

    if (!currentUser?.token) {
        alert("Error de autenticación. Por favor, inicia sesión de nuevo.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status}`);
        }

        alert('Usuario actualizado con éxito.');
        hideEditUserModal();
        renderUsersTable(); // Recargamos la tabla para ver los cambios

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
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo cambiar el estado.');
        }
        alert('Estado del usuario actualizado.');
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
    const newRole = prompt(`Introduce el nuevo rol para "${userName}" ('admin' o 'user'):`);
    if (!newRole || (newRole.toLowerCase() !== 'admin' && newRole.toLowerCase() !== 'user')) {
        alert("Operación cancelada o rol inválido.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ new_role: newRole.toLowerCase() }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo cambiar el rol.');
        }
        alert('Rol del usuario actualizado.');
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
    const confirmation = confirm(`¿Seguro que quieres eliminar a "${userName}"?`);
    if (!confirmation) return;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
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
    if (!currentUser) {
        alert("Debes iniciar sesión para dejar un testimonio.");
        showPage('login'); // Llevamos al usuario a iniciar sesión
        return;
    }
    
    const modal = document.getElementById('testimonialModal');
    const authorInput = document.getElementById('testimonialAuthor');
    
    // Rellenamos automáticamente el nombre del usuario logueado
    if (authorInput) {
        authorInput.value = currentUser.name;
    }
    
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Hides the testimonial submission modal.
 */
function hideTestimonialModal() {
    const modal = document.getElementById('testimonialModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Submits a new testimonial.
 */
async function submitTestimonial() {
    if (!currentUser) {
        alert("Debes iniciar sesión para enviar un testimonio.");
        return;
    }

    const contentElement = document.getElementById('testimonialContent');
    const content = contentElement.value.trim();

    if (!content) {
        alert("Por favor, escribe tu testimonio antes de enviarlo.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/testimonials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ contenido: content }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'No se pudo enviar el testimonio.');
        }

        alert('¡Gracias por tu testimonio! Será revisado por un administrador antes de ser publicado.');
        contentElement.value = ''; // Limpiamos el campo de texto

    } catch (error) {
        console.error('Error al enviar el testimonio:', error);
        alert(`Error: ${error.message}`);
    }
}

async function fetchAndRenderApprovedTestimonials() {
    const container = document.getElementById('approvedTestimonialsList');
    const noMessage = document.getElementById('noTestimonialsMessage');
    if (!container) return;

    // Mostrar mensaje de carga
    container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Cargando testimonios...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/testimonials/approved`);
        if (!response.ok) throw new Error("No se pudieron cargar los testimonios");
        const testimonials = await response.json();

        if (testimonials.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-600 col-span-full">No hay testimonios aprobados aún.</p>';
            return;
        }

        container.innerHTML = ''; // Limpiar
        testimonials.forEach(t => {
            const card = `
                <div class="bg-gray-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition">
                    <p class="text-gray-700 italic mb-4">"${t.contenido}"</p>
                    <p class="text-gray-900 font-bold text-right">- ${t.autor_nombre}</p>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });
    } catch (error) {
        console.error("Error al cargar testimonios:", error);
        container.innerHTML = '<p class="text-center text-red-500 col-span-full">Error al cargar testimonios.</p>';
    }
}


async function renderAdminTestimonialsTable() {
    const tableBody = document.getElementById('adminTestimonialsTableBody');
    if (!tableBody || !currentUser?.token) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">Cargando testimonios...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/testimonials`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la lista de testimonios.');
        const allTestimonials = await response.json();

        if (allTestimonials.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">No hay testimonios para moderar.</td></tr>';
            return;
        }

        let tableHtml = '';
        allTestimonials.forEach(t => {
            tableHtml += `
                <tr id="testimonial-row-${t.id_testimonio}">
                    <td class="px-6 py-4">${t.autor_nombre}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${t.contenido}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${new Date(t.fecha).toLocaleDateString()}</td>
                    <td class="px-6 py-4"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.aprobado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${t.aprobado ? 'Aprobado' : 'Pendiente'}</span></td>
                    <td class="px-6 py-4 text-right">
                        ${!t.aprobado ? `<button class="text-green-600 hover:text-green-900 mr-4" onclick="approveTestimonial(${t.id_testimonio})">Aprobar</button>` : ''}
                        <button class="text-red-600 hover:text-red-900" onclick="deleteTestimonial(${t.id_testimonio})">Eliminar</button>
                    </td>
                </tr>`;
        });
        tableBody.innerHTML = tableHtml;
    } catch (error) {
        console.error("Error al renderizar la tabla de testimonios:", error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-500">No se pudo cargar la lista.</td></tr>';
    }
}

async function deleteTestimonial(testimonialId) {
    if (!confirm("¿Seguro que quieres eliminar este testimonio permanentemente?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/admin/testimonials/${testimonialId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!response.ok) throw new Error('No se pudo eliminar el testimonio.');
        alert('Testimonio eliminado con éxito.');
        renderAdminTestimonialsTable(); 
        renderApprovedTestimonials(); 
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Renders the list of approved testimonials on the public section.
 */
async function renderApprovedTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    if (!container) return;

    container.innerHTML = '<p class="text-center text-gray-600 col-span-full">Cargando testimonios...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/testimonials/approved`);
        if (!response.ok) throw new Error('No se pudieron cargar los testimonios.');
        
        const approvedTestimonials = await response.json();
        container.innerHTML = '';

        if (approvedTestimonials.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-600 col-span-full">No hay testimonios disponibles en este momento.</p>';
            return;
        }

        approvedTestimonials.forEach(testimonial => {
            const card = `
                <div class="bg-white p-8 rounded-2xl shadow-lg">
                    <p class="text-gray-600 text-lg mb-6">"${testimonial.contenido}"</p>
                    <p class="text-gray-900 font-bold text-xl">${testimonial.autor_nombre}</p>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });
    } catch (error) {
        console.error("Error al cargar testimonios:", error);
        container.innerHTML = '<p class="text-center text-red-500 col-span-full">No se pudieron cargar los testimonios.</p>';
    }
}

/**
 * Renders the testimonials table in the admin panel.
 */


/**
 * Approves a testimonial.
 * @param {string} testimonialId The ID of the testimonial to approve.
 */
async function approveTestimonial(testimonialId) {
    if (!confirm("¿Seguro que quieres aprobar este testimonio?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/admin/testimonials/${testimonialId}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!response.ok) throw new Error('No se pudo aprobar el testimonio.');
        alert('Testimonio aprobado con éxito.');
        renderAdminTestimonialsTable(); 
        renderApprovedTestimonials(); 
    } catch (error) {
        alert(`Error: ${error.message}`);
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
    fetchAndRenderApprovedTestimonials();

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
        previewContainer.innerHTML = '';
        if (publicationImageFiles.length === 0) {
            previewContainer.innerHTML = '<p id="noImagesText" class="text-gray-500">Aún no has añadido ninguna imagen.</p>';
            return;
        }
        publicationImageFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const isPrimary = index === 0;
                const wrapper = document.createElement('div');
                wrapper.className = `preview-image-wrapper w-32 h-24 rounded-lg ${isPrimary ? 'is-primary' : ''}`;
                wrapper.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" class="w-full h-full object-cover rounded-md">
                <div class="preview-image-actions">
                    <button title="Eliminar imagen" class="preview-action-btn" onclick="removeImage(${index})"><i class="fas fa-trash-alt"></i></button>
                    ${!isPrimary ? `<button title="Hacer principal" class="preview-action-btn" onclick="setPrimaryImage(${index})"><i class="fas fa-star"></i></button>` : ''}
                </div>`;
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
            input.value = '';
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