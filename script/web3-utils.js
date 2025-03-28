// web3-updateLinkState.js

// Función para cambiar el estado del contenedor del botón de conexión
async function updateConnectButtonState(walletAddress) {
    const connectButtonContainer = document.getElementById('connectButtonContainer');
    if (!connectButtonContainer) return;

    if (!walletAddress) {
        connectButtonContainer.innerHTML = 'Connect now';
        connectButtonContainer.onclick = openModal;
        localStorage.removeItem('walletAddress');
        return;
    }

    try {
        const isParticipant = await checkUserParticipation(walletAddress);

        if (isParticipant) {
            connectButtonContainer.innerHTML = 'Ver mi perfil';
            connectButtonContainer.onclick = function() {
                window.location.href = 'profile.html';
            };
            updateLinkState(true);
        } else {
            connectButtonContainer.innerHTML = 'Join now';
            connectButtonContainer.onclick = function() {
                window.location.href = 'register.html';
            };
            updateLinkState(false);
        }

        localStorage.setItem('walletAddress', walletAddress);
        updateDivContent(walletAddress);

    } catch (error) {
        console.error('Error al verificar la participación del usuario:', error);
        connectButtonContainer.innerHTML = 'Connect now';
        connectButtonContainer.onclick = openModal;
        window.location.href = 'index.html';
    }
}

// Función para verificar si el usuario está registrado en el contrato
async function checkUserParticipation(account) {
    try {
        if (typeof window.loadABI !== 'function' || !window.contractAddress) {
            console.error('loadABI o contractAddress no están disponibles');
            return false;
        }

        const abi = await window.loadABI();
        if (!abi) {
            console.error('No se pudo cargar el ABI del contrato.');
            return false;
        }
        const contract = new window.web3Instance.eth.Contract(abi, window.contractAddress);

        const isParticipant = await contract.methods.estaRegistrado(account).call();
        return isParticipant;
    } catch (error) {
        console.error('Error al verificar la participación del usuario:', error);
        window.location.href = 'index.html';
        return false;
    }
}

// Función para actualizar el estado del enlace
function updateLinkState(isParticipant) {
    const linkElement = document.getElementById('joinProfileButton');
    if (linkElement) {
        if (isParticipant) {
            linkElement.href = 'profile.html';
            linkElement.innerText = 'Ver mi perfil';
        } else {
            linkElement.href = 'register.html';
            linkElement.innerText = 'Join now';
        }
    } else {
        console.error('No se encontró el elemento enlace para actualizar.');
    }
}

// Función para actualizar el contenido de un DIV completo
function updateDivContent(walletAddress) {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        if (!walletAddress) {
            // Mostrar mensaje si no hay wallet conectada
            mainContent.innerHTML = '<p>Conecta tu wallet para ver el contenido.</p>';
        } else {
            checkUserParticipation(walletAddress).then(isParticipant => {
                const joinButton = document.getElementById('joinProfileButton'); // Obtener el elemento por ID

                if (joinButton) {
                    if (isParticipant) {
                        // Usuario registrado: Cambiar el texto, el href y el onclick del botón
                        joinButton.innerText = 'Ver mi perfil';
                        joinButton.href = 'profile.html';
                        joinButton.onclick = function() {
                            window.location.href = 'profile.html';
                        };
                    } else {
                        // Usuario no registrado: Restaurar el texto, el href y el onclick del botón
                        joinButton.innerText = 'Join now';
                        joinButton.href = 'register.html';
                        joinButton.onclick = function() {
                            window.location.href = 'register.html';
                        };
                    }
                } else {
                    console.error('No se encontró el elemento con ID "joinProfileButton".');
                }
            }).catch(error => {
                console.error('Error al actualizar el contenido del div:', error);
                mainContent.innerHTML = '<p>Error al cargar el contenido.</p>';
            });
        }
    } else {
        console.error('No se encontró el elemento mainContent para actualizar.');
    }
}

// Función para cambiar el estado de todos los demás botones
function updateButtonState() {
    const buttons = [
        document.getElementById('connectNowButton'),
        document.getElementById('connectButtonActivity'),
        document.getElementById('connectButtonProfile'),
        document.getElementById('joinProfileButton')
    ];
    buttons.forEach(button => {
        if (button) {
            button.innerText = 'Participar en el Smart Contract';
            if (typeof participateInSmartContract === 'function') {
                button.onclick = participateInSmartContract;
            } else {
                console.warn('participateInSmartContract no está definida. Se asignará una función temporal.');
                button.onclick = function() {
                    alert('Función participateInSmartContract no está disponible en este momento.');
                };
            }
        }
    });
}

// Verificar si hay una wallet conectada almacenada en el almacenamiento local
document.addEventListener('DOMContentLoaded', () => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
        updateConnectButtonState(storedWalletAddress);
    }
});
//         console.log("wallet conectada????")
//     }else{
//         console.log("wallet error????")
//     }
// });