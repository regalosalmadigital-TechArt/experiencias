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
});
