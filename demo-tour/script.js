/**
 * VARIABLES GLOBALES
 */
let adultos = 1;
let ninos = 0;
let fp = null; // Instancia del calendario
let fechaSeleccionada = "";

// URL de la API de SheetDB (Conectado a tu Google Sheets)
const API_URL = 'https://sheetdb.io/api/v1/2s1p744rscfly?sheet=bloqueos';

/**
 * INICIALIZACIÓN: Se ejecuta al cargar la página
 */
async function inicializarSistema() {
    // Espera a que la librería de calendario cargue
    while (typeof flatpickr === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
        const campoFecha = document.getElementById('fecha-reserva');
        if (!campoFecha) throw new Error("No se encontró el elemento #fecha-reserva");

        // Configuración del Calendario
        fp = flatpickr(campoFecha, {
            locale: "es",
            minDate: "today", // No permite fechas pasadas
            dateFormat: "Y-m-d",
            altInput: true, // Muestra un formato más legible al usuario
            altFormat: "d/m/Y",

            // CLAVE PARA PC: Obliga a heredar los estilos del input original
            altInputClass: "flatpickr-input",

            // Evita que el celular use su calendario nativo feo
            disableMobile: true,
            
            disable: [], // Aquí se cargarán las fechas de Google Sheets
            onChange: function(selectedDates, dateStr) {
                fechaSeleccionada = dateStr;
            }
        });
        
        // Ejecuta el cálculo inicial y busca bloqueos en la nube
        calcular();
        cargarBloqueos();

    } catch (error) {
        console.error("❌ Error en inicialización:", error.message);
    }
}

/**
 * CARGAR BLOQUEOS: Trae las fechas deshabilitadas desde Google Sheets
 */
function cargarBloqueos() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            // Filtra los datos para obtener solo las fechas válidas
            const fechas = data
                .filter(row => row.fecha && row.fecha.trim().length > 5)
                .map(row => row.fecha.trim());

            // Si hay fechas, las bloquea en el calendario
            if (fp && typeof fp.set === 'function') {
                fp.set("disable", fechas);
            }
        })
        .catch(err => console.error("❌ Error conectando con SheetDB:", err));
}

/**
 * CAMBIAR CANTIDAD: Controla los botones + y - de adultos/niños
 */
function cambiarCant(tipo, cambio) {
    if (tipo === 'adultos') {
        if (adultos + cambio >= 1) adultos += cambio; // Mínimo 1 adulto
        document.getElementById('qty-adultos').innerText = adultos;
    } else {
        if (ninos + cambio >= 0) ninos += cambio; // Mínimo 0 niños
        document.getElementById('qty-ninos').innerText = ninos;
    }
    calcular(); // Recalcula el precio tras el cambio
}

/**
 * ACTUALIZAR INTERFAZ: Muestra la info del tour seleccionado
 */
function actualizarInterfaz() {
    const selectedTour = document.getElementById('tour-select').value;
    
    // Oculta todas las tarjetas y muestra solo la seleccionada
    document.querySelectorAll('.tour-info-card').forEach(card => card.classList.remove('active'));
    document.getElementById('info-' + selectedTour).classList.add('active');
    
    calcular();
}

/**
 * CALCULAR: Realiza la suma de precios
 */
function calcular() {
    const select = document.getElementById('tour-select');
    if(!select) return;

    const option = select.options[select.selectedIndex];
    
    // Obtiene los precios desde los atributos 'data-' del HTML
    const precioAdulto = parseInt(option.getAttribute('data-adulto'));
    const precioNino = parseInt(option.getAttribute('data-nino'));

    const total = (adultos * precioAdulto) + (ninos * precioNino);
    
    // Formatea el número con comas y lo muestra
    document.getElementById('total-display').innerText = `$${total.toLocaleString()} MXN`;
}

/**
 * ENVIAR WHATSAPP: Construye el mensaje y abre el enlace
 */
function enviarWhatsApp() {
    // Validación de fecha
    if (!fechaSeleccionada) {
        alert("Por favor, selecciona una fecha disponible.");
        return;
    }

    const select = document.getElementById('tour-select');
    const tourName = select.options[select.selectedIndex].text;
    const total = document.getElementById('total-display').innerText;
    
    // Estructura del mensaje (Usa negritas de WhatsApp con asteriscos)
    let mensaje = `¡Hola! Me interesa reservar un tour con *Un Amigo en Mérida*:\n\n`;
    mensaje += `🌴 *Tour:* ${tourName}\n`;
    mensaje += `📅 *Fecha:* ${fechaSeleccionada}\n`;
    mensaje += `👥 *Adultos:* ${adultos}\n`;
    mensaje += `👶 *Niños:* ${ninos}\n`;
    mensaje += `💰 *Total estimado:* ${total}\n\n`;
    mensaje += `¿Tienen disponibilidad?`;

    // Codifica el mensaje para URL y abre WhatsApp
    window.open(`https://wa.me/525560040025?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// Inicia todo el proceso cuando el contenido está listo
document.addEventListener("DOMContentLoaded", inicializarSistema);
