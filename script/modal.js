// modal.js
function showTransactionModal() {
    const transactionModal = document.getElementById('transactionModal');
    if (transactionModal) {
        transactionModal.classList.remove('hidden');
    } else {
        console.error('No se encontr&oacute; el elemento transactionModal');
    }
}

function updateTransactionModal(message, showLoadingIcon, showTestnetLink = false, txHash = '') {
    const transactionMessage = document.getElementById('transactionMessage');
    const loadingIcon = document.getElementById('loadingIcon');
    const testnetLink = document.getElementById('testnetLink');

    if (transactionMessage) {
        transactionMessage.textContent = message;
    }

    if (loadingIcon) {
        if (showLoadingIcon) {
            loadingIcon.innerHTML = '<i class="fas fa-spinner fa-spin text-4xl"></i>';
        } else {
            loadingIcon.innerHTML = '';
        }
    }

    if (testnetLink) {
        if (showTestnetLink && txHash) {
            testnetLink.href = `https://bscscan.com/tx/${txHash}`; // Ajusta el enlace seg&uacute;n tu red
            testnetLink.classList.remove('hidden');
        } else {
            testnetLink.classList.add('hidden');
        }
    }
}

function hideTransactionModal() {
    const transactionModal = document.getElementById('transactionModal');
    if (transactionModal) {
        transactionModal.classList.add('hidden');
    } else {
        console.error('No se encontr&oacute; el elemento transactionModal');
    }
}

function closeModal() {
    const participationModal = document.getElementById('participationModal');
    if (participationModal) {
        participationModal.classList.add('hidden');
    }
}

window.showTransactionModal = showTransactionModal;
window.updateTransactionModal = updateTransactionModal;
window.hideTransactionModal = hideTransactionModal;
