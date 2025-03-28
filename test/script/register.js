// registro.js - Parte 1

// Inicializar Web3
window.initializeWeb3();
const web3Instance = window.web3Instance;

// Función para obtener parámetros de la URL
function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// Obtener el ID del referidor de la URL
const referrerId = getURLParameter('ref');

// Variable global para almacenar el ID del referidor
let referrerIdToSave = null;

// Actualizar el campo de entrada `searchInput` con el ID del referidor de la URL
window.addEventListener('load', function() {
    if (referrerId) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = referrerId;
        } else {
            console.error('No se encontró el elemento #searchInput');
        }
    }
});

// Función para inicializar el ID del referidor
async function initializeReferrer() {
    const abi = await window.loadABI();
    const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

    if (referrerId) {
        try {
            // Obtener la información del referidor utilizando obtenerParticipantePorId(referrerId)
            const referrerInfo = await contract.methods.obtenerParticipantePorId(referrerId).call();
            console.log(referrerInfo)
            // Verificar que el ID es válido
            if (referrerInfo.id === '0') {
                console.warn('ID de referidor inválido. Usando ID del propietario como referidor.');
                const ownerAddress = await contract.methods.propietario().call();
                const ownerInfo = await contract.methods.participantes(ownerAddress).call();
                referrerIdToSave = ownerInfo.id;
            } else {
                referrerIdToSave = referrerInfo.id;
            }
        } catch (error) {
            console.error('Error al obtener el ID del referidor:', error);
            // Si hay un error, asignar el propietario como referidor
            const ownerAddress = await contract.methods.propietario().call();
            const ownerInfo = await contract.methods.participantes(ownerAddress).call();
            referrerIdToSave = ownerInfo.id;
        }
    } else {
        // Si no hay referrerId, asignar el propietario como referidor
        const ownerAddress = await contract.methods.propietario().call();
        const ownerInfo = await contract.methods.participantes(ownerAddress).call();
        referrerIdToSave = ownerInfo.id;
    }
}

// Llama a la función para inicializar el referidor
initializeReferrer();

// Función para comprobar el balance de la wallet conectada
async function checkWalletBalance() {
    if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
        try {
            const accounts = await web3Instance.eth.getAccounts();
            if (accounts.length > 0) {
                // Cambiar el estado de item1 a verde
                document.querySelector('#item1').classList.remove('text-red-500');
                document.querySelector('#item1').classList.add('text-green-500');

                const balance = await web3Instance.eth.getBalance(accounts[0]);
                const balanceInEth = web3Instance.utils.fromWei(balance, 'ether');

                if (parseFloat(balanceInEth) >= 0.000075) {
                    // Cambiar ícono de "Item 2" a verde
                    document.querySelector('#item2').classList.remove('text-red-500');
                    document.querySelector('#item2').classList.add('text-green-500');
                    enableJoinButtonAndInput();
                } else {
                    console.warn('El balance es inferior al mínimo requerido.');
                    disableJoinButtonAndInput();
                }
            } else {
                console.error('No hay cuentas conectadas.');
            }
        } catch (error) {
            console.error('No se pudo obtener el balance de la wallet:', error);
        }
    } else {
        console.error('No se detectó ningún proveedor de Web3.');
    }
}

// Función para verificar si la cantidad ingresada es válida en tiempo real
function validateAmount() {
    const amountInput = document.querySelector('#amountInput');
    const minAmountMessage = document.querySelector('#minAmountMessage');
    const joinButton = document.querySelector('#joinButton');
    const amountValue = parseFloat(amountInput.value);

    if (isNaN(amountValue) || amountValue < 0.000075) {
        minAmountMessage.classList.remove('hidden');
        amountInput.classList.add('border-red-500');
        amountInput.classList.remove('border-green-500');
        // Deshabilitar el botón si el monto es inválido
        joinButton.setAttribute('disabled', 'disabled');
    } else {
        minAmountMessage.classList.add('hidden');
        amountInput.classList.remove('border-red-500');
        amountInput.classList.add('border-green-500');
        // Habilitar el botón si el monto es válido
        joinButton.removeAttribute('disabled');
    }
}

// Función para habilitar la caja de texto y el botón de Join BNBFund
function enableJoinButtonAndInput() {
    const joinButton = document.querySelector('#joinButton');
    const amountInput = document.querySelector('#amountInput');
    //joinButton.setAttribute('disabled', 'disabled'); // Inicialmente deshabilitado hasta que el monto sea válido
    amountInput.removeAttribute('disabled');
}

// Función para deshabilitar la caja de texto y el botón de Join BNBFund
function disableJoinButtonAndInput() {
    const joinButton = document.querySelector('#joinButton');
    const amountInput = document.querySelector('#amountInput');
    joinButton.setAttribute('disabled', 'disabled');
    amountInput.setAttribute('disabled', 'disabled');
}

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

// registro.js - Parte 2

// Función para participar en el Smart Contract
async function participateInSmartContract() {
    // Verificar que web3Instance esté inicializado correctamente
    if (!web3Instance || !web3Instance.utils) {
        showErrorModal('web3Instance no está disponible. Por favor, asegúrate de que esté correctamente configurado.');
        return;
    }

    const amountInput = document.querySelector('#amountInput');
    const amountValue = parseFloat(amountInput.value);

    const minAmountInEther = '0.000075';
    const minAmountInWei = web3Instance.utils.toWei(minAmountInEther, 'ether');
    console.log('Monto mínimo en Wei:', minAmountInWei);
    console.log('Monto ingresado (ETH):', amountValue);

    const amountValueInEther = amountValue.toString();
    const amountValueInWei = web3Instance.utils.toWei(amountValueInEther, 'ether');
    console.log('Monto ingresado (Wei):', amountValueInWei);

    const BigNumber = web3Instance.utils.BN;
    const amountValueInWeiBN = new BigNumber(amountValueInWei);
    const minAmountInWeiBN = new BigNumber(minAmountInWei);

    if (isNaN(amountValue) || amountValueInWeiBN.lt(minAmountInWeiBN)) {
        showErrorModal('El monto ingresado es inválido. Por favor, ingresa un monto mayor o igual a 0.000075.');
        return;
    }

    if (typeof window.ethereum !== 'undefined') {
        try {
            showTransactionModal();
            updateTransactionModal('Transacción en progreso...', true);

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3Instance.eth.getAccounts();
            const account = accounts[0];
            const abi = await loadABI();
            if (!abi) {
                throw new Error('No se pudo cargar el ABI del contrato.');
            }
            const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

            if (!contract.methods.depositarConReferido) {
                throw new Error('El método depositarConReferido no existe en el ABI del contrato.');
            }

            if (typeof referrerIdToSave === 'undefined') {
                await initializeReferrer();
            }

            const referrerIdInt = parseInt(referrerIdToSave, 10); // Asegurarse de que es un número
            if (isNaN(referrerIdInt)) {
                throw new Error('referrerIdToSave no es un número');
            }

            console.log('Referrer ID:', referrerIdInt);
            console.log('Monto ingresado en Wei:', amountValueInWei);

            const gasLimit = web3Instance.utils.toHex('500000'); // Gas Limit
            const gasPrice = web3Instance.utils.toHex(web3Instance.utils.toWei('30', 'gwei')); // Gas Price

            const transactionParameters = {
                from: account,
                to: window.contractAddress,
                data: contract.methods.depositarConReferido(referrerIdInt).encodeABI(),
                value: web3Instance.utils.toHex(amountValueInWei), // Valor convertido a Wei
                gas: gasLimit,
                gasPrice: gasPrice
            };

            console.log('Parámetros de la transacción:', transactionParameters);

            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });

            updateTransactionModal('Confirmando transacción...', true);

            let receipt = null;
            while (receipt === null) {
                receipt = await web3Instance.eth.getTransactionReceipt(txHash);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (receipt.status) {
                updateTransactionModal('¡Transacción exitosa!', false);
                setTimeout(() => {
                    hideTransactionModal();
                    window.location.href = 'profile.html';
                }, 2000);
            } else {
                updateTransactionModal('La transacción falló. Puedes ver más detalles a continuación.', false, true, txHash);
            }
        } catch (error) {
            console.error('Error al participar en el smart contract:', error);
            updateTransactionModal(`Error: ${error.message}`, false);

            if (error.code === 4001) {
                updateTransactionModal('Transacción rechazada por el usuario.', false);
                setTimeout(hideTransactionModal, 2000); // Ocultar el modal después de 2 segundos
            }
        }
    } else {
        alert('MetaMask no detectado');
    }
}

// Ejecutar las comprobaciones al cargar la página
window.addEventListener('load', async function () {
    // Asegurarse de que la wallet esté conectada
    const accounts = await web3Instance.eth.getAccounts();
    if (accounts.length > 0) {
        console.log('Wallet conectada:', accounts[0]);
        checkWalletBalance();
        // Actualizar el estado de conexión si es necesario
    } else {
        console.warn('No hay cuentas conectadas.');
        // Puedes redirigir al usuario o mostrar un mensaje solicitando conexión
    }

    // Inicializar el referidor
    await initializeReferrer();

    // Añadir event listener al input de cantidad
    const amountInput = document.querySelector('#amountInput');
    if (amountInput) {
        amountInput.addEventListener('input', validateAmount);
    } else {
        console.error('No se encontró el elemento #amountInput');
    }

    // Asegurarse de que el botón Join BNBFund llama a participateInSmartContract
    const joinButton = document.querySelector('#joinButton');
    if (joinButton) {
        joinButton.onclick = participateInSmartContract;
    } else {
        console.error('No se encontró el elemento #joinButton');
    }

    // Añadir event listener para cerrar el modal de error al hacer clic fuera de él
    const transactionModal = document.getElementById('transactionModal');
    if (transactionModal) {
        transactionModal.addEventListener('click', function (event) {
            if (event.target === transactionModal) {
                hideTransactionModal();
            }
        });
    }
});

// Asegurar que las funciones estén disponibles globalmente si es necesario
window.participateInSmartContract = participateInSmartContract;
window.validateAmount = validateAmount;