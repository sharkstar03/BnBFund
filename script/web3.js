// web3.js

if (typeof web3 === 'undefined') {
    console.error('web3 no está definido. Asegúrate de que Web3.js se haya cargado correctamente.');
} else {
    // Definir la función initializeWeb3 en window
    window.initializeWeb3 = async function() {
        // Verificar si MetaMask está disponible
        if (typeof window.ethereum !== 'undefined') {
            window.web3Instance = new Web3(window.ethereum);
            console.log('Existe una wallet conectada');

            try {
                // Solicitar acceso a la cuenta de usuario
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await window.web3Instance.eth.getAccounts();
                window.account = accounts[0];
                localStorage.setItem('walletConnected', 'true');
                localStorage.setItem('connectedAccount', window.account);
                console.log('Cuenta conectada:', window.account);

            } catch (error) {
                console.error('Error al conectar MetaMask:', error);
            }
        } else {
            console.log('MetaMask no detectado, usando proveedor HTTP.');
            window.web3Instance = new Web3('https://rpc-amoy.polygon.technology/');
            console.log('web3Instance inicializado con proveedor HTTP.');
        }

        window.checkMetaMask = function() {
            if (typeof window.ethereum === 'undefined') {
                alert('MetaMask no detectado');
            }
        };

        window.checkWalletConnection = async function() {
            const walletConnected = localStorage.getItem('walletConnected');
            if (walletConnected === 'true') {
                if (typeof updateButtonState === 'function') {
                    updateButtonState();
                }
                const accounts = await window.web3Instance.eth.getAccounts();
                if (typeof updateConnectButtonState === 'function') {
                    updateConnectButtonState(accounts[0]);
                }
                if (typeof validateUser === 'function') {
                    await validateUser(accounts[0]);
                }
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            window.checkMetaMask();
            if (typeof updateBNBPrice === 'function') {
                updateBNBPrice();
            }
            if (window.ethereum) {
                window.ethereum.on('disconnect', () => {
                    alert('MetaMask desconectado');
                    localStorage.removeItem('walletConnected');
                    if (typeof updateButtonState === 'function') {
                        updateButtonState();
                    }
                    // Limpiar las variables globales al desconectar
                    window.account = null;
                    window.web3Instance = null;
                });
            }

            window.checkWalletConnection();
        });
    };

    console.log('initializeWeb3 se ha inicializado correctamente en window.');
}

// Variables globales
window.contractAddress = '0xB42ea9EFb6769E91b2C2e9F571bb6692f6C4131e';
window.referidor = '1';

// Cargar el ABI desde abi.json
window.loadABI = async function() {
    try {
        const response = await fetch('script/abi.json');
        if (!response.ok) {
            throw new Error(`Error al cargar ABI: ${response.statusText}`);
        }
        const abi = await response.json();
        const methodNames = [
            'obtenerBalanceContrato',
            'PORCENTAJE_DISTRIBUCION',
            'obtenerInfoCompletaParticipantes',
            'LIMITE_DISTRIBUCIONES',
            'obtenerUltimaDistribucion',
            'depositarConReferido'
        ];
        methodNames.forEach(method => {
            const methodExists = abi.some(item => item.name === method);
        });
        return abi;
    } catch (error) {
        console.error('Error al cargar el ABI:', error);
        return null;
    }
};

console.log('loadABI ha sido asignada al objeto window.');

// Inicializar Web3
//window.initializeWeb3();

// Función para desconectar la wallet (integrada)
async function disconnectWallet() {
    try {
        localStorage.removeItem('walletAddress');
        sessionStorage.removeItem('walletAddress');
        window.account = null;
        window.web3Instance = null;

        console.log('Wallet disconnected from application');

        window.location.href = 'index.html';
        console.log('Redirecting to index.html');

    } catch (error) {
        console.error('Error disconnecting wallet:', error);
    }
}

// Asignar el listener al botón de desconexión
document.addEventListener('DOMContentLoaded', () => {
    const disconnectBtn = document.getElementById('disconnectButton');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectWallet);
    }

    // Detectar desconexión de MetaMask usando el evento 'disconnect'
    if (window.ethereum) {
        window.ethereum.on('disconnect', (error) => {
            if (error) {
                console.error('MetaMask disconnect error:', error);
            }
            console.log('MetaMask disconnected');
            disconnectWallet();
        });
    }
});