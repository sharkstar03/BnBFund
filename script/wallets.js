// wallets.js

// Asegurar que las funciones están disponibles en window
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;

// Función para conectar a diferentes wallets
function connectWallet(walletType) {
    closeModal(); // Asumiendo que closeModal() está definida en otro script
    switch (walletType) {
        case 'metamask':
            connectToWallet('MetaMask');
            break;
        case 'trust':
            connectToWallet('Trust Wallet');
            break;
        case 'tokenpocket':
            connectToWallet('TokenPocket');
            break;
        case 'walletconnect':
            connectToWalletConnect(); // WalletConnect requiere un manejo especial
            break;
        default:
            alert('Selección de wallet inválida');
    }
}

// Función genérica para conectar y validar (excepto WalletConnect)
async function connectToWallet(walletName) {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Solicitar cuentas al proveedor
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await window.web3Instance.eth.getAccounts();
            const account = accounts[0];

            alert(`${walletName} conectada`);
            // Actualizar la interfaz con la cuenta conectada
            updateAccountDisplay(account);

            // Guardar el estado de conexión y la dirección de la wallet en localStorage
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('connectedAccount', account);

            // Validar participación
            await validateUser(account);

        } catch (error) {
            alert(`Conexión con ${walletName} falló: ${error.message}`);
        }
    } else {
        alert(`${walletName} no detectada`);
    }
}

async function connectToWalletConnect() {
    try {
        // Asegúrate de que WalletConnectProvider está disponible
        if (typeof WalletConnectProvider === 'undefined') {
            alert('WalletConnect no está disponible. Por favor, inténtalo de nuevo más tarde.');
            return;
        }

        const walletConnectProvider = new WalletConnectProvider.default({
            infuraId: 'b4f8c981cc97450d8f9e600330fbfc0f' // Reemplaza con tu Infura ID real
        });

        // Eventos de WalletConnect
        walletConnectProvider.on('accountsChanged', (accounts) => {
            console.log('WalletConnect accounts changed:', accounts);
            updateAccountDisplay(accounts[0]);
            localStorage.setItem('connectedAccount', accounts[0]);
            localStorage.setItem('walletConnected', 'true');
            validateUser(accounts[0]);
        });

        walletConnectProvider.on('disconnect', (code, reason) => {
            console.log('WalletConnect disconnected', code, reason);
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('connectedAccount');
            updateAccountDisplay(null);
        });

        await walletConnectProvider.enable();
        const web3WalletConnect = new Web3(walletConnectProvider);
        const accounts = await web3WalletConnect.eth.getAccounts();
        const account = accounts[0];

        alert('WalletConnect conectado');
        updateAccountDisplay(account);

        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('connectedAccount', account);

        await validateUser(account, web3WalletConnect);

    } catch (error) {
        console.error('WalletConnect connection error:', error);
        alert(`Conexión con WalletConnect falló: ${error.message}`);
    }
}

// Función para actualizar la visualización de la cuenta conectada
function updateAccountDisplay(account) {
    const accountDisplay = document.getElementById('accountDisplay');
    const accountDisplayProfile = document.getElementById('accountDisplayProfile');

    if (accountDisplay) {
        accountDisplay.innerText = account ? `Conectado: ${account}` : 'No hay wallet conectada';
    }
    if (accountDisplayProfile) {
        accountDisplayProfile.innerText = account ? `Conectado: ${account}` : 'No hay wallet conectada';
    }

    // Actualizar el estado del botón de conexión en web3-utils.js
    if (typeof updateConnectButtonState === 'function') {
        updateConnectButtonState(account);
    }
}

// Función para validar si el usuario participa en el contrato inteligente
async function validateUser(account, web3Instance = window.web3Instance) {
    try {
        console.log('Validando usuario:', account);

        if (typeof window.loadABI !== 'function' || !window.contractAddress) {
            console.error('loadABI o contractAddress no están disponibles');
            alert('El contrato no está disponible en este momento. Por favor, inténtalo de nuevo más tarde.');
            return;
        }

        console.log('Cargando ABI...');
        const abi = await window.loadABI();
        if (!abi) {
            alert('No se pudo cargar el ABI del contrato.');
            return;
        }

        console.log('Instanciando contrato...');
        const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

        console.log('Obteniendo dirección del propietario...');
        const ownerAddress = await contract.methods.propietario().call();
        console.log('Dirección del propietario:', ownerAddress);

        console.log('Comparando propietario con cuenta actual...');
        if (ownerAddress.toLowerCase() === account.toLowerCase()) {
            console.log('El usuario es el propietario. Redirigiendo a admin.html');
            window.location.href = 'admin.html';
            return;
        }

        console.log('Verificando si el usuario está registrado...');
        const isParticipant = await contract.methods.estaRegistrado(account).call();
        console.log('¿Es participante?', isParticipant);

        if (isParticipant) {
            console.log('Usuario registrado. Redirigiendo a profile.html');
            window.location.href = 'profile.html';
        } else {
            alert('No estás registrado como participante.');
            console.log('Usuario no registrado. Redirigiendo a register.html');
            window.location.href = 'register.html';
        }
    } catch (error) {
        console.error('Error al validar el usuario:', error);
        alert('Error al validar el usuario. Por favor, intenta de nuevo.');
        window.location.href = 'index.html';
    }
}

// Listener para cambios en las cuentas
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        const newAccount = accounts[0];
        console.log('Cuenta cambiada a:', newAccount);

        // Actualizar la visualización de la cuenta
        updateAccountDisplay(newAccount);

        // Guardar la nueva cuenta en localStorage
        localStorage.setItem('connectedAccount', newAccount);
        localStorage.setItem('walletConnected', 'true');

        // Revalidar al usuario con la nueva cuenta
        await validateUser(newAccount);
    });
}

