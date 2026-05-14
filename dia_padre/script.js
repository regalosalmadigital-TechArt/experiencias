// Función para enviar al cliente directamente a tu flujo de ventas
function irAWhatsapp(producto) {
    const telefono = "tu_numero_aqui"; // Configura tu número de Querétaro
    const mensaje = `Hola Luis, vi la Landing de Lanzamiento y me urge la caja "${producto}" para mi papá. ¿Me das detalles?`;
    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
    
    // Tracking para tu Analytics
    console.log(`Interés en: ${producto}`);
    
    window.open(url, '_blank');
}
