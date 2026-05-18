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
            altInputClass: "flatpickr-input",
            disableMobile: true,
            disable: [], 
            onChange: function(selectedDates, dateStr) {
                fechaSeleccionada = dateStr;

                // [ANALÍTICA] Evento: Selección de fecha en el cotizador
                gtag('event', 'interaccion_cotizador', {
                    'tipo_accion': 'seleccion_fecha',
                    'fecha_viaje': dateStr
                });
            }
        });
        
        calcular();
        cargarBloqueos();
        
        const btnReviews = document.getElementById('btn-reviews');
        if (btnReviews) {
            btnReviews.addEventListener('click', function() {
                gtag('event', 'clic_testimonios', {
                    'destino_red': 'Instagram_Reviews'
                });
            });
        }

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
            const fechas = data
                .filter(row => row.fecha && row.fecha.trim().length > 5)
                .map(row => row.fecha.trim());

            if (fp && typeof fp.set === 'function') {
                fp.set("disable", fechas);
            }
        })
        .catch(err => console.error("❌ Error conectando con SheetDB:", err));
}

/**
 * CAMBIAR NACIONALIDAD: Modificación condicional para Extranjeros vs Mexicanos
 */
function cambiarNacionalidad() {
    const nacionalidad = document.getElementById('nacionalidad-select').value;
    const wrapperEntradas = document.getElementById('wrapper-entradas');
    const entradasSelect = document.getElementById('entradas-select');

    // Regla de Negocio: Si es extranjero, solo aplica sin entradas y se oculta el selector
    if (nacionalidad === 'extranjero') {
        entradasSelect.value = 'sin';
        wrapperEntradas.style.display = 'none';
    } else {
        // Si vuelve a cambiar a mexicano, se muestra la opción de elegir entradas
        wrapperEntradas.style.display = 'block';
    }

    // [ANALÍTICA] Evento: Rastreo de cambios de procedencia del usuario
    gtag('event', 'interaccion_cotizador', {
        'tipo_accion': 'cambio_nacionalidad',
        'perfil_usuario': nacionalidad
    });

    calcular();
}

/**
 * CAMBIAR ENTRADAS: Rastrea las interacciones de selección de entradas
 */
function cambiarEntradas() {
    const modalidadEntradas = document.getElementById('entradas-select').value;

    // [ANALÍTICA] Evento: Elección de paquete con o sin accesos
    gtag('event', 'interaccion_cotizador', {
        'tipo_accion': 'seleccion_entradas',
        'modalidad': modalidadEntradas
    });

    calcular();
}

/**
 * CAMBIAR CANTIDAD: Controla los botones + y - de adultos/niños
 */
function cambiarCant(tipo, cambio) {
    if (tipo === 'adultos') {
        if (adultos + cambio >= 1) adultos += cambio; 
        document.getElementById('qty-adultos').innerText = adultos;
    } else {
        if (ninos + cambio >= 0) ninos += cambio; 
        document.getElementById('qty-ninos').innerText = ninos;
    }
    
    gtag('event', 'interaccion_cotizador', {
        'tipo_accion': 'modificar_pasajeros',
        'categoria': tipo,
        'valor_actual': tipo === 'adultos' ? adultos : ninos
    });

    calcular(); 
}

/**
 * ACTUALIZAR INTERFAZ: Muestra la info del tour seleccionado
 */
function actualizarInterfaz() {
    const select = document.getElementById('tour-select');
    const selectedTour = select.value;
    const tourText = select.options[select.selectedIndex].text;
    
    document.querySelectorAll('.tour-info-card').forEach(card => card.classList.remove('active'));
    document.getElementById('info-' + selectedTour).classList.add('active');
    
    gtag('event', 'ver_tour', {
        'id_tour': selectedTour,
        'nombre_tour': tourText
    });

    calcular();
}

/**
 * CALCULAR: Modificado para aplicar condicionales de nacionalidad y accesos
 */
function calcular() {
    const select = document.getElementById('tour-select');
    if(!select) return;

    const option = select.options[select.selectedIndex];
    const nacionalidad = document.getElementById('nacionalidad-select').value;
    const modalidadEntradas = document.getElementById('entradas-select').value;

    // Obtención de precios base (Sin entradas)
    let precioAdulto = parseInt(option.getAttribute('data-adulto'));
    let precioNino = parseInt(option.getAttribute('data-nino'));

    // Suma de adicionales si es Mexicano y elige la opción "Con entradas"
    if (nacionalidad === 'mexicano' && modalidadEntradas === 'con') {
        precioAdulto += parseInt(option.getAttribute('data-entrada-adulto')) || 0;
        precioNino += parseInt(option.getAttribute('data-entrada-nino')) || 0;
    }

    const total = (adultos * precioAdulto) + (ninos * precioNino);
    document.getElementById('total-display').innerText = `$${total.toLocaleString()} MXN`;
}

/**
 * ENVIAR WHATSAPP: Modificado para recopilar el nombre, perfil y enviar la estructura de reserva limpia
 */
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cliente').value.trim();
    
    // Validación obligatoria de Nombre antes de abrir flujo
    if (!nombre) {
        alert("Por favor, ingresa tu nombre completo para personalizar tu cotización.");
        document.getElementById('nombre-cliente').focus();
        return;
    }

    if (!fechaSeleccionada) {
        alert("Por favor, selecciona una fecha disponible.");
        return;
    }

    const select = document.getElementById('tour-select');
    const tourName = select.options[select.selectedIndex].text;
    const idTour = select.value;
    const total = document.getElementById('total-display').innerText;
    const nacionalidad = document.getElementById('nacionalidad-select').value;
    const modalidadEntradas = document.getElementById('entradas-select').value;

    // Formatear texto estético para el envío del mensaje de WhatsApp
    let perfilTexto = nacionalidad === 'mexicano' ? '🇲🇽 Mexicano / Nacional' : '✈️ Extranjero / International';
    let entradasTexto = nacionalidad === 'extranjero' ? 'Sin entradas (Tarifa Extranjero)' : (modalidadEntradas === 'con' ? 'Con entradas incluidas' : 'Sin entradas');
    
    let mensaje = `¡Hola! Me interesa reservar un tour *PRIVADO* con *Un Amigo en Mérida*:\n\n`;
    mensaje += `👤 *Nombre:* ${nombre}\n`;
    mensaje += `🌍 *Perfil:* ${perfilTexto}\n`;
    mensaje += `🎟️ *Accesos:* ${entradasTexto}\n`;
    mensaje += `🌴 *Tour:* ${tourName}\n`;
    mensaje += `📅 *Fecha:* ${fechaSeleccionada}\n`;
    mensaje += `👥 *Adultos:* ${adultos}\n`;
    mensaje += `👶 *Niños:* ${ninos}\n`;
    mensaje += `💰 *Total estimado:* ${total}\n\n`;
    mensaje += `¿Tienen disponibilidad para estas condiciones?`;

    // [ANALÍTICA MÁSTER]: Envío enriquecido con variables cualitativas de conversión
    gtag('event', 'click_whatsapp', {
        'nombre_viajero': nombre,
        'nombre_tour': tourName,
        'id_tour': idTour,
        'fecha_reserva': fechaSeleccionada,
        'total_cotizado': total,
        'cantidad_adultos': adultos,
        'cantidad_ninos': ninos,
        'perfil_nacionalidad': nacionalidad,
        'modalidad_entradas': modalidadEntradas
    });

    window.open(`https://wa.me/525560040025?text=${encodeURIComponent(mensaje)}`, '_blank');
}

document.addEventListener("DOMContentLoaded", inicializarSistema);
