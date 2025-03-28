// simpleAlerts.js
(function() {
    // Función para mostrar un tooltip
    function showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'simple-tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight}px`;

        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 2000);
    }

    // Función para mostrar un alert personalizado
    function showAlert(title, message) {
        const alertBox = document.createElement('div');
        alertBox.className = 'simple-alert';
        alertBox.innerHTML = `<strong>${title}</strong><p>${message}</p>`;

        document.body.appendChild(alertBox);

        setTimeout(() => {
            document.body.removeChild(alertBox);
        }, 3000);
    }

    // Exponer las funciones globalmente
    window.simpleAlerts = {
        showTooltip,
        showAlert
    };
})();
