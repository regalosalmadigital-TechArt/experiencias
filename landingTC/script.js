// Esperar a que todo el contenido del DOM se cargue
document.addEventListener('DOMContentLoaded', () => {

    // 1. Efecto de Navbar al hacer Scroll
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            // Un negro un poco más oscuro pero que sigue siendo transparente
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; 
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
        } else {
            // Vuelve a ser más transparente cuando estás hasta arriba
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // 2. Funcionalidad del Menú Móvil (Botón Hamburguesa)
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        // Alterna la clase 'active' que definimos en el CSS para mostrar/ocultar el menú
        navLinks.classList.toggle('active');
    });

    // Ocultar el menú móvil cuando se hace clic en un enlace
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 3. Lógica del Formulario de Captación (Landing Page)
    const form = document.getElementById('lead-form'); 
    
    // Verificamos que el formulario exista en la página para evitar errores
    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', (e) => {
            // Previene que la página se recargue al enviar el formulario
            e.preventDefault();
            
            // Cambiar el estado del botón a "Enviando..."
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
            submitBtn.style.opacity = '0.7';

            // ==========================================
            // INTEGRACIÓN CON WEBHOOK (Ej. n8n)
            // Aquí puedes enviar los datos directamente a tu flujo de automatización
            // ==========================================
            /*
            fetch('TU_URL_DE_WEBHOOK_AQUI', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: document.getElementById('nombre').value,
                    empresa: document.getElementById('empresa').value,
                    correo: document.getElementById('correo').value,
                    telefono: document.getElementById('telefono').value
                })
            })
            .then(response => {
                // Lógica si el webhook responde correctamente
            })
            .catch(error => {
                console.error('Error:', error);
            });
            */

            // Simulación de envío exitoso (Puedes borrar este bloque setTimeout cuando actives el fetch de arriba)
            setTimeout(() => {
                alert('¡Gracias! Hemos recibido tus datos. Un consultor estratégico se comunicará contigo hoy mismo.');
                form.reset(); // Limpia los campos del formulario
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText; // Regresa el botón a su texto original
                submitBtn.style.opacity = '1';
            }, 2000);
        });
    }
});
