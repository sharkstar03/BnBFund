// profileview.js

// Verificar que Web3.js y web3 estén disponibles
if (typeof web3 === 'undefined') {
    console.error('web3 no está definido. Asegúrate de que Web3.js se haya cargado correctamente.');
} else {
    web3Instance = new Web3(web3.currentProvider); // Usa el proveedor actual de web3
}

// Inicializar el contrato
async function initializeContract() {
    try {
        const abi = await window.loadABI();
        if (!abi) {
            throw new Error('No se pudo cargar el ABI del contrato.');
        }
        window.contract = new web3Instance.eth.Contract(abi, window.contractAddress);
        console.log('Contrato inicializado correctamente.');
    } catch (error) {
        console.error('Error al inicializar el contrato:', error);
    }
}

// Obtener parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const userInput = urlParams.get('id'); // Puede ser un ID o una dirección de wallet

async function loadUserData() {
    try {
        // Verificar que 'window.contract' esté disponible
        if (typeof window.contract === 'undefined') {
            console.error('El contrato no está inicializado.');
            return;
        }

        let userAddress;
        let isViewingOtherProfile = false;

        // Determinar si estamos viendo otro perfil o el propio
        if (userInput) {
            isViewingOtherProfile = true;

            // Determinar si es una dirección o un ID
            if (web3Instance.utils.isAddress(userInput)) {
                userAddress = userInput;
            } else {
                const participante = await window.contract.methods.obtenerParticipantePorId(userInput).call();
                userAddress = participante.direccion;

                if (userAddress === '0x0000000000000000000000000000000000000000') {
                    alert('El ID proporcionado no es válido.');
                    window.location.href = 'index.html';
                    return;
                }
            }

            document.getElementById('connectButtonProfile').textContent = 'Visualizando Perfil';
        } else {
            const accounts = await web3Instance.eth.getAccounts();
            if (accounts.length === 0) {
                alert('Por favor, conecta tu wallet.');
                return;
            }
            userAddress = accounts[0];
            document.getElementById('walletAddress').textContent = userAddress;
            document.getElementById('connectButtonProfile').textContent = 'Conectado';
        }

        console.log(`Dirección del usuario: ${userAddress}`);

        const isRegistered = await window.contract.methods.estaRegistrado(userAddress).call();
        console.log(`¿Está registrado el usuario? ${isRegistered}`);

        if (!isRegistered) {
            if (isViewingOtherProfile) {
                alert('El usuario no está registrado.');
                window.location.href = 'index.html';
                return;
            } else {
                alert('El usuario no está registrado. Por favor, regístrate primero.');
                window.location.href = 'register.html';
                return;
            }
        }

        const userInfo = await window.contract.methods.participantes(userAddress).call();
        console.log(`Información del usuario:`, userInfo);

        updateElementTextContent('userId', `ID: ${userInfo.id}`);
        updateElementTextContent('registrationDate', `Registrado el ${formatDate(userInfo.tiempoUltimoDeposito)}`);
        updateElementTextContent('walletAddress', `${userAddress}`);
        updateElementTextContent('distributionStatus', `${userInfo.distribucionesRecibidas}/${userInfo.receteos} Activado`);
        updateElementTextContent('benefits', `${web3Instance.utils.fromWei(userInfo.montoTotalRecibido.toString(), 'ether')} POL`);

        const userId = userInfo.id;
        const referralLink = `bnbfund.io/register.html?ref=${userId}`;
        const referralLinkElem = document.getElementById('referralLink');
        if (referralLinkElem) {
            referralLinkElem.value = referralLink;
        } else {
            console.error('Elemento referralLink no encontrado en el DOM.');
        }

        const copyButtonElem = document.getElementById('copyButton');
        if (copyButtonElem) {
            if (!isViewingOtherProfile) {
                copyButtonElem.addEventListener('click', function () {
                    const referralLinkInput = document.getElementById('referralLink');
                    if (referralLinkInput) {
                        referralLinkInput.select();
                        referralLinkInput.setSelectionRange(0, 99999);
                        document.execCommand('copy');
                        alert('Enlace copiado al portapapeles');
                    } else {
                        console.error('Elemento referralLink no encontrado en el DOM.');
                    }
                });
            } else {
                copyButtonElem.disabled = true;
                copyButtonElem.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            console.error('Elemento copyButton no encontrado en el DOM.');
        }

        updateElementTextContent('sponsorId', `${userInfo.referidorID}`);
        const participantState = await window.contract.methods.obtenerEstadoParticipante(userAddress).call();
        const referrals = participantState.referidos;
        updateElementTextContent('referralsCount', referrals.length);

        const distribucionesRecibidas = participantState.distribucionesRecibidas;
        const receteos = participantState.receteos;
        const ratio = receteos > 0 ? (distribucionesRecibidas / receteos) * 100 : 0;
        updateElementTextContent('ratio', `${ratio.toFixed(2)}%`);

    } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        alert('Hubo un error al cargar los datos del usuario. Por favor, intenta de nuevo.');
    }
}

function updateElementTextContent(elementId, textContent) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = textContent;
    } else {
        console.error(`Elemento ${elementId} no encontrado en el DOM.`);
    }
}

function formatDate(timestamp) {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
}

window.addEventListener('load', async function () {
    await initializeContract();
    await loadUserData();
});
