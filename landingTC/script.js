// Esperar a que todo el contenido del DOM se cargue
document.addEventListener('DOMContentLoaded', () => {

    // 1. Efecto de Navbar al hacer Scroll
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        // Si bajamos más de 50px, le damos fondo completamente sólido al navbar
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = '#111111';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
        } else {
            // Si estamos hasta arriba, lo hacemos un poco transparente
            navbar.style.backgroundColor = 'rgba(17, 17, 17, 0.95)';
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
});
