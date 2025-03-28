// transactionModal.js

// Funciones para mostrar y ocultar el modal de transacción
function showTransactionModal() {
    const transactionModal = document.getElementById('transactionModal');
    if (transactionModal) {
        transactionModal.classList.remove('hidden');
    }
}

function hideTransactionModal() {
    const transactionModal = document.getElementById('transactionModal');
    if (transactionModal) {
        transactionModal.classList.add('hidden');
    }
}

// Función para actualizar el contenido del modal de transacción
function updateTransactionModal(message, isLoading, showLink = false, txHash = '') {
    const transactionMessage = document.getElementById('transactionMessage');
    const loadingIcon = document.getElementById('loadingIcon');
    const testnetLink = document.getElementById('testnetLink');

    if (transactionMessage && loadingIcon) {
        transactionMessage.textContent = message;

        if (isLoading) {
            loadingIcon.innerHTML = '<i class="fas fa-spinner fa-spin text-4xl"></i>';
        } else {
            loadingIcon.innerHTML = '<i class="fas fa-check-circle text-green-500 text-4xl"></i>';
        }

        if (showLink && txHash) {
            testnetLink.href = `https://testnet.bscscan.com/tx/${txHash}`;
            testnetLink.classList.remove('hidden');
        } else {
            testnetLink.classList.add('hidden');
        }
    }
}

// Función para mostrar un modal de error
function showErrorModal(message) {
    const transactionModal = document.getElementById('transactionModal');
    const transactionMessage = document.getElementById('transactionMessage');
    const loadingIcon = document.getElementById('loadingIcon');
    const testnetLink = document.getElementById('testnetLink');

    if (transactionModal && transactionMessage && loadingIcon) {
        transactionMessage.textContent = message;
        loadingIcon.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-4xl"></i>';
        testnetLink.classList.add('hidden'); // Ocultar el enlace si no es necesario
        transactionModal.classList.remove('hidden');
    }
}

// Asegurar que las funciones estén disponibles globalmente si es necesario
window.showTransactionModal = showTransactionModal;
window.hideTransactionModal = hideTransactionModal;
window.updateTransactionModal = updateTransactionModal;
window.showErrorModal = showErrorModal;