// 1. Variables de estado global
let adultos = 1;
let ninos = 0;
let fp = null; 
let fechaSeleccionada = "";
const API_URL = 'https://sheetdb.io/api/v1/2s1p744rscfly?sheet=bloqueos';

// 2. Función maestra de inicialización
async function inicializarSistema() {
    while (typeof flatpickr === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
        const campoFecha = document.getElementById('fecha-reserva');
        if (!campoFecha) throw new Error("No se encontró el elemento #fecha-reserva");

        fp = flatpickr(campoFecha, {
            locale: "es",
            minDate: "today",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y",
            disableMobile: "true", // Fuerza el uso del calendario de la librería en PC para mantener estilos
            disable: [], 
            onChange: function(selectedDates, dateStr) {
                fechaSeleccionada = dateStr;
            }
        });
        
        calcular();
        cargarBloqueos();

    } catch (error) {
        console.error("❌ Error en inicialización:", error.message);
    }
}

// 3. Carga de bloqueos dinámicos desde Google Sheets
function cargarBloqueos() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const fechas = data
                .filter(row => row.fecha && row.fecha.trim().length > 5)
                .map(row => row.fecha.trim());

            if (fp && typeof fp.set === 'function') {
                fp.set("disable", fechas);
            }
        })
        .catch(err => console.error("❌ Error API:", err));
}

// 4. Funciones de Interfaz (Cantidades y Cálculo)
function cambiarCant(tipo, cambio) {
    if (tipo === 'adultos') {
        if (adultos + cambio >= 1) adultos += cambio;
        document.getElementById('qty-adultos').innerText = adultos;
    } else {
        if (ninos + cambio >= 0) ninos += cambio;
        document.getElementById('qty-ninos').innerText = ninos;
    }
    calcular();
}

function actualizarInterfaz() {
    const selectedTour = document.getElementById('tour-select').value;
    document.querySelectorAll('.tour-info-card').forEach(card => card.classList.remove('active'));
    document.getElementById('info-' + selectedTour).classList.add('active');
    calcular();
}

function calcular() {
    const select = document.getElementById('tour-select');
    if(!select) return;
    const option = select.options[select.selectedIndex];
    const total = (adultos * parseInt(option.getAttribute('data-adulto'))) + (ninos * parseInt(option.getAttribute('data-nino')));
    document.getElementById('total-display').innerText = `$${total.toLocaleString()} MXN`;
}

function enviarWhatsApp() {
    if (!fechaSeleccionada) {
        alert("Por favor, selecciona una fecha disponible.");
        return;
    }
    const select = document.getElementById('tour-select');
    const tourName = select.options[select.selectedIndex].text;
    const total = document.getElementById('total-display').innerText;
    
    let mensaje = `¡Hola! Me interesa reservar un tour con *Un Amigo en Mérida*:\n\n`;
    mensaje += `🌴 *Tour:* ${tourName}\n`;
    mensaje += `📅 *Fecha:* ${fechaSeleccionada}\n`;
    mensaje += `👥 *Adultos:* ${adultos}\n`;
    mensaje += `👶 *Niños:* ${ninos}\n`;
    mensaje += `💰 *Total estimado:* ${total}\n\n`;
    mensaje += `¿Tienen disponibilidad?`;

    window.open(`https://wa.me/525560040025?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// Iniciar sistema al cargar el DOM
document.addEventListener("DOMContentLoaded", inicializarSistema);
