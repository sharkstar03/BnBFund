// web3.js

import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Variables globales
window.contractAddress = '0xB42ea9EFb6769E91b2C2e9F571bb6692f6C4131e'; // Reemplaza con la dirección de tu contrato
window.referidor = 1; // Reemplaza con la dirección del referidor

// Inicialización de Web3
window.initializeWeb3 = async function() {
    try {
        // Detección de dispositivos móviles
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
            // Inicialización de WalletConnect v2
            const provider = await EthereumProvider.init({
                projectId: 'b4f8c981cc97450d8f9e600330fbfc0f', // Reemplaza con tu Project ID de WalletConnect
                chains: [80001], // ID de la cadena Amoy de Polygon
                showQrModal: true,
                qrModalOptions: {
                    themeMode: 'light',
                },
            });

            await provider.enable();
            window.web3Instance = new Web3(provider);

            // Manejo de eventos de WalletConnect v2
            provider.on('accountsChanged', (accounts) => {
                console.log('WalletConnect accounts changed:', accounts);
                // Actualizar la interfaz de usuario y el estado de la conexión
                window.updateAccountDisplay(accounts[0]);
                localStorage.setItem('connectedAccount', accounts[0]);
                localStorage.setItem('walletConnected', 'true');
                window.validateUser(accounts[0]);
            });

            provider.on('disconnect', (code, reason) => {
                console.log('WalletConnect disconnected', code, reason);
                // Actualizar la interfaz de usuario y el estado de la conexión
                localStorage.removeItem('walletConnected');
                localStorage.removeItem('connectedAccount');
                window.updateAccountDisplay(null);
            });
        } else {
            // Inicialización de MetaMask (escritorio)
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                window.web3Instance = new Web3(window.ethereum);
            } else {
                console.error('MetaMask no detectado. Usando proveedor HTTP.');
                window.web3Instance = new Web3('https://rpc-amoy.polygon.technology/');
            }
        }
    } catch (error) {
        console.error('Error al inicializar Web3:', error);
        alert('Error al conectar con la billetera. Por favor, inténtalo de nuevo.');
    }
};

// Funciones de verificación
window.checkMetaMask = function() {
    if (!window.ethereum) {
        alert('MetaMask no detectado. Por favor, instala MetaMask.');
    }
};

window.checkWalletConnection = function() {
    const walletConnected = localStorage.getItem('walletConnected');
    const connectedAccount = localStorage.getItem('connectedAccount');
    if (walletConnected && connectedAccount) {
        window.updateAccountDisplay(connectedAccount);
        window.validateUser(connectedAccount);
    }
};

// Eventos del DOM
document.addEventListener('DOMContentLoaded', async function() {
    window.checkMetaMask();
    await window.initializeWeb3();
    window.checkWalletConnection();
});

if (window.ethereum) {
    window.ethereum.on('disconnect', (error) => {
        console.log('MetaMask disconnected:', error);
        window.disconnectWallet();
    });
}

// Función para cargar el ABI del contrato
window.loadABI = async function() {
    try {
        const response = await fetch('contractABI.json'); // Reemplaza con la ruta a tu ABI
        const abi = await response.json();
        return abi;
    } catch (error) {
        console.error('Error al cargar el ABI:', error);
        return null;
    }
};

// Función para desconectar la billetera
window.disconnectWallet = function() {
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('connectedAccount');
    window.location.href = 'index.html';
};

// Listener del botón de desconexión
const disconnectButton = document.getElementById('disconnectButton');
if (disconnectButton) {
    disconnectButton.addEventListener('click', window.disconnectWallet);
}