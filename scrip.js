// ============================================================
// ✅ WCAG 4.1.2 — Gestión correcta de roles y estados ARIA
// ✅ WCAG 2.1.1 — Toda la funcionalidad accesible por teclado
// ✅ WCAG 4.1.3 — Mensajes de estado anunciados a lector de pantalla
// ============================================================

// --- Elementos del DOM ---
const carritoPanel   = document.getElementById('carrito');
const listaProductos = document.getElementById('lista-1');
const tbody          = document.getElementById('carrito-tbody');
const vaciarBtn      = document.getElementById('vaciar-carrito');
const carritoToggle  = document.getElementById('carrito-toggle');
const carritoAnuncio = document.getElementById('carrito-anuncio');
const carritoContador = document.getElementById('carrito-contador');
const menuBtn        = document.getElementById('menu-btn');
const navbar         = document.getElementById('navbar');

// --- Estado ---
let cantidadCarrito = 0;

// --- Inicializar eventos ---
cargarEventListeners();

function cargarEventListeners() {

    // ✅ WCAG 2.1.1: Usar <button> para "Agregar al carrito" → ya responde a Enter y Space de forma nativa
    listaProductos.addEventListener('click', comprarElemento);

    // ✅ WCAG 2.1.1: Eliminar por clic o teclado (los <a> responden a Enter nativamente)
    tbody.addEventListener('click', eliminarElemento);

    // Vaciar carrito
    vaciarBtn.addEventListener('click', vaciarCarrito);

    // ============================================================
    // ✅ WCAG 4.1.2: Toggle del carrito con aria-expanded
    // ============================================================
    carritoToggle.addEventListener('click', toggleCarrito);

    // ✅ WCAG 2.1.1: Cerrar carrito con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (!carritoPanel.hidden) cerrarCarrito();
            if (!navbar.hidden) cerrarMenu();
        }
    });

    // ============================================================
    // ✅ WCAG 4.1.2: Toggle del menú hamburguesa con aria-expanded
    // ============================================================
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMenu);
    }

    // Cerrar carrito si se hace clic fuera
    document.addEventListener('click', function(e) {
        if (!carritoPanel.hidden &&
            !carritoPanel.contains(e.target) &&
            !carritoToggle.contains(e.target)) {
            cerrarCarrito();
        }
    });
}

// ============================================================
// TOGGLE CARRITO
// ============================================================
function toggleCarrito() {
    if (carritoPanel.hidden) {
        abrirCarrito();
    } else {
        cerrarCarrito();
    }
}

function abrirCarrito() {
    carritoPanel.hidden = false;
    carritoToggle.setAttribute('aria-expanded', 'true');
    // ✅ Mover foco al panel del carrito para usuarios de teclado
    carritoPanel.setAttribute('tabindex', '-1');
    carritoPanel.focus();
}

function cerrarCarrito() {
    carritoPanel.hidden = true;
    carritoToggle.setAttribute('aria-expanded', 'false');
    carritoToggle.focus(); // Devolver foco al botón que lo abrió
}

// ============================================================
// TOGGLE MENÚ HAMBURGUESA
// ============================================================
function toggleMenu() {
    if (navbar.hidden) {
        abrirMenu();
    } else {
        cerrarMenu();
    }
}

function abrirMenu() {
    navbar.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Cerrar menú de navegación');
}

function cerrarMenu() {
    navbar.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú de navegación');
}

// ============================================================
// AGREGAR PRODUCTO AL CARRITO
// ============================================================
function comprarElemento(e) {
    e.preventDefault();
    // ✅ Ahora es <button> → funciona con clic y con teclado (Enter/Space)
    if (e.target.classList.contains('agregar-carrito')) {
        const btn = e.target;
        leerDatosElemento(btn);
    }
}

// ✅ Lee los datos desde data-attributes del botón directamente
function leerDatosElemento(btn) {
    const infoElemento = {
        imagen:  btn.getAttribute('data-imagen'),
        titulo:  btn.getAttribute('data-nombre'),
        precio:  btn.getAttribute('data-precio'),
        id:      btn.getAttribute('data-id')
    };
    insertarCarrito(infoElemento);
}

function insertarCarrito(elemento) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', elemento.id);

    row.innerHTML = `
        <td>
            <img src="${elemento.imagen}" width="80" alt="${elemento.titulo}">
        </td>
        <td>${elemento.titulo}</td>
        <td>${elemento.precio}</td>
        <td>
            <!-- ✅ WCAG 4.1.2: <button> en lugar de <a> para acciones -->
            <button
                class="borrar btn-2"
                data-id="${elemento.id}"
                aria-label="Eliminar ${elemento.titulo} del carrito"
            >
                ✕
            </button>
        </td>
    `;

    tbody.appendChild(row);

    // Actualizar contador
    cantidadCarrito++;
    actualizarContador();

    // ✅ WCAG 4.1.3: Anunciar al lector de pantalla que se agregó el producto
    anunciar(`${elemento.titulo} agregado al carrito. Total: ${cantidadCarrito} artículo${cantidadCarrito !== 1 ? 's' : ''}.`);

    // Mostrar/ocultar mensaje de carrito vacío
    actualizarMensajeVacio();
}

// ============================================================
// ELIMINAR ELEMENTO DEL CARRITO
// ============================================================
function eliminarElemento(e) {
    e.preventDefault();

    if (e.target.classList.contains('borrar')) {
        const btn = e.target;
        // ✅ Corregido: getAttribute (antes era getAtribute — typo que rompía la función)
        const id = btn.getAttribute('data-id');
        const nombreProducto = btn.getAttribute('aria-label').replace('Eliminar ', '').replace(' del carrito', '');

        const fila = btn.closest('tr');
        if (fila) {
            fila.remove();
            cantidadCarrito = Math.max(0, cantidadCarrito - 1);
            actualizarContador();

            // ✅ WCAG 4.1.3: Anunciar eliminación
            anunciar(`${nombreProducto} eliminado del carrito. Total: ${cantidadCarrito} artículo${cantidadCarrito !== 1 ? 's' : ''}.`);
        }

        actualizarMensajeVacio();
    }
}

// ============================================================
// VACIAR CARRITO
// ============================================================
function vaciarCarrito() {
    // ✅ Confirmación antes de acción destructiva irreversible
    if (cantidadCarrito === 0) return;

    const confirmar = confirm('¿Estás seguro de que quieres vaciar el carrito?');
    if (!confirmar) return;

    tbody.innerHTML = '';
    cantidadCarrito = 0;
    actualizarContador();

    // ✅ WCAG 4.1.3: Anunciar que el carrito fue vaciado
    anunciar('El carrito ha sido vaciado.');
    actualizarMensajeVacio();
}

// ============================================================
// UTILIDADES
// ============================================================

// ✅ WCAG 4.1.3: Función para anunciar mensajes a lectores de pantalla
function anunciar(mensaje) {
    carritoAnuncio.textContent = '';
    // Pequeño delay para que el cambio sea detectado por el lector
    setTimeout(() => {
        carritoAnuncio.textContent = mensaje;
    }, 100);
}

// Actualiza el contador visual y el aria-label del botón carrito
function actualizarContador() {
    carritoContador.textContent = cantidadCarrito;
    carritoToggle.setAttribute(
        'aria-label',
        `Ver carrito de compras, ${cantidadCarrito} artículo${cantidadCarrito !== 1 ? 's' : ''}`
    );
}

// Muestra u oculta el mensaje de "carrito vacío"
function actualizarMensajeVacio() {
    const msgVacio = document.getElementById('carrito-vacio');
    if (msgVacio) {
        msgVacio.style.display = cantidadCarrito === 0 ? 'block' : 'none';
    }
}
