// profileSponsor.js

// Asegurarnos de que Web3.js y web3 est&eacute;n disponibles
if (typeof web3 === 'undefined') {
    console.error('web3 no est&aacute; definido. Aseg&uacute;rate de que Web3.js se haya cargado correctamente.');
}

const web3Instance = web3;

async function loadUserData() {
    try {
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length === 0) {
            alert('Por favor, conecta tu wallet.');
            return;
        }
        const userAddress = accounts[0];
        document.getElementById('walletAddress').textContent = userAddress;

        // Cargar el ABI del contrato
        const abi = await window.loadABI();
        if (!abi) {
            throw new Error('No se pudo cargar el ABI del contrato.');
        }

        const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

        // Verificar si el usuario est&aacute; registrado
        const isRegistered = await contract.methods.estaRegistrado(userAddress).call();
        if (!isRegistered) {
            alert('El usuario no est&aacute; registrado. Por favor, reg&iacute;strate primero.');
            window.location.href = 'register.html';
            return;
        }

        // Obtener la informaci&oacute;n del usuario
        const userInfo = await contract.methods.participantes(userAddress).call();

        // Actualizar el DOM con la informaci&oacute;n del usuario
        document.getElementById('userId').textContent = `ID ${userInfo.id}`;
        const registrationTimestamp = userInfo.tiempoUltimoDeposito;
        const registrationDate = new Date(registrationTimestamp * 1000);
        const formattedDate = registrationDate.toLocaleDateString();
        document.getElementById('registrationDate').textContent = `Registrado el ${formattedDate}`;

        // Estado de distribuci&oacute;n
        document.getElementById('distributionStatus').textContent = `${userInfo.distribucionesRecibidas}/${userInfo.receteos} Activado`;

        // Beneficios
        const benefitsInBNB = web3Instance.utils.fromWei(userInfo.montoDepositado, 'ether');
        document.getElementById('benefits').textContent = `${benefitsInBNB} BNB`;

        // Obtener el ID del usuario
        const userId = userInfo.id;

        // Generar el enlace personal con el ID
        const referralLink = `bnbfund.io/register.html?ref=${userId}`;
        document.getElementById('referralLink').value = referralLink;

        // Agregar funcionalidad al bot&oacute;n "Copiar"
        document.getElementById('copyButton').addEventListener('click', function () {
            const referralLinkInput = document.getElementById('referralLink');
            referralLinkInput.select();
            referralLinkInput.setSelectionRange(0, 99999); // Para m&oacute;viles
            document.execCommand('copy');
            alert('Enlace copiado al portapapeles');
        });

        // Obtener el Sponsor ID
        // Asumiendo que el contrato almacena la direcci&oacute;n del referidor en participantes[userAddress].referidor
        const referrerAddress = userInfo.referidor;
        let sponsorId = 'N/A';

        if (referrerId) {
            // Obtener la informaci&oacute;n del referidor por su ID
            const referrerInfo = await contract.methods.obtenerParticipantePorId(referrerId).call();
            sponsorId = referrerInfo.id;
        }

        document.getElementById('sponsorId').textContent = `ID ${sponsorId}`;

        // Obtener el n&uacute;mero de referidos
        const participantState = await contract.methods.obtenerEstadoParticipante(userAddress).call();
        const referrals = participantState.referidos;

        document.getElementById('referralsCount').textContent = referrals.length;

        // Calcular y mostrar el ratio
        const distribucionesRecibidas = participantState.distribucionesRecibidas;
        const receteos = participantState.receteos;
        const ratio = receteos > 0 ? (distribucionesRecibidas / receteos) * 100 : 0;
        document.getElementById('ratio').textContent = `${ratio.toFixed(2)}%`;

    } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        alert('Hubo un error al cargar tus datos. Por favor, intenta de nuevo m&aacute;s tarde.');
    }
}

// Actualizar el precio de BNB
function updatePOLPrice() {
    fetch('https://api.polygon.io/v2/aggs/ticker/ETHUSD/range/1/day/2023-01-01/2023-01-01?apiKey=YOUR_API_KEY')
        .then(response => response.json())
        .then(data => {
            const polPrice = data.results[0].open;
            // Actualizar el DOM con el precio de POL
            const priceElements = document.querySelectorAll('.pol-price');
            priceElements.forEach(element => {
                element.textContent = `1 POL = $${polPrice}`;
            });
        })
        .catch(error => {
            console.error('Error al obtener el precio de POL:', error);
        });
}

// Al cargar la p&aacute;gina
window.addEventListener('load', async function () {
    await loadUserData();
    updateBNBPrice();
});
