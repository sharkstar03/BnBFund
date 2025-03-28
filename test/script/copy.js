// Función para copiar el enlace personal
document.getElementById('copyButton').addEventListener('click', function () {
    var referralLink = document.getElementById('referralLink');
    referralLink.select();
    document.execCommand('copy');
    simpleAlerts.showTooltip(this, 'Copiado');
});

// Función para copiar la dirección de la wallet
function copyWalletAddress() {
    var walletAddress = document.getElementById('walletAddressAll');
    walletAddress.select();
    if (document.execCommand('copy')) {
        simpleAlerts.showTooltip(document.querySelector('.fa-copy'), 'Copiado');
    } else {
        simpleAlerts.showAlert('Error', 'No se pudo copiar la dirección de la wallet.');
    }
}

