// Script para manejar la apertura y cierre del modal

function openModal() {
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Asignar funciones de apertura del modal a los botones correspondientes
document.addEventListener('DOMContentLoaded', () => {
    const connectButtonContainer = document.getElementById('connectButtonContainer');
    const connectNowButton = document.getElementById('connectNowButton');
    const connectButtonActivity = document.getElementById('connectButtonActivity');
    const connectButtonProfile = document.getElementById('connectButtonProfile');
    const joinProfileButton = document.getElementById('joinProfileButton');

    if (connectButtonContainer) {
        connectButtonContainer.onclick = openModal;
    }
    if (connectNowButton) {
        connectNowButton.onclick = openModal;
    }
    if (connectButtonActivity) {
        connectButtonActivity.onclick = openModal;
    }
    if (connectButtonProfile) {
        connectButtonProfile.onclick = openModal;
    }
    if (joinProfileButton) {
        joinProfileButton.onclick = openModal;
    }
});

