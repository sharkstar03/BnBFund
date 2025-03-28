window.addEventListener('scroll', function() {
    var banner = document.getElementById('banner');
    var mainContainer = document.getElementById('main-container');
    
    if (window.innerWidth >= 768) { // Pantallas medianas y m&aacute;s grandes
        if (window.scrollY > 100) {
            banner.classList.add('fixed', 'top-0', 'left-0', 'z-50', 'transform-none', 'bg-black');
            banner.classList.remove('relative', '-translate-y-full');
            mainContainer.style.paddingTop = banner.offsetHeight + 'px'; // Agregar espacio superior al contenido principal
        } else {
            banner.classList.remove('fixed', 'top-0', 'left-0', 'z-50', 'transform-none', 'bg-black');
            banner.classList.add('relative');
            mainContainer.style.paddingTop = '0'; // Remover el espacio superior
        }
    } else { // Para dispositivos m&oacute;viles, el banner siempre est&aacute; fijo
        banner.classList.add('fixed', 'top-0', 'left-0', 'z-50', 'transform-none', 'bg-black');
        banner.classList.remove('relative');
        mainContainer.style.paddingTop = banner.offsetHeight + 'px'; // Agregar espacio superior al contenido principal
    }
});