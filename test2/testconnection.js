document.addEventListener('DOMContentLoaded', () => {
    const connectMetaMaskButton = document.getElementById('connectMetaMask');
    const connectTrustWalletButton = document.getElementById('connectTrustWallet');
    const connectWalletConnectButton = document.getElementById('connectWalletConnect');
    const accountDisplay = document.getElementById('accountDisplay');

    connectMetaMaskButton.addEventListener('click', () => connectWallet('metamask'));
    connectTrustWalletButton.addEventListener('click', () => connectWallet('trust'));
    connectWalletConnectButton.addEventListener('click', connectToWalletConnect);

    async function connectWallet(walletType) {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await new Web3(window.ethereum).eth.getAccounts();
                accountDisplay.innerText = `Cuenta Conectada: ${accounts[0]}`;
            } catch (error) {
                console.error(`Error al conectar ${walletType}:`, error);
                alert(`Error al conectar ${walletType}: ${error.message}`);
            }
        } else {
            alert(`${walletType} no detectada`);
        }
    }

    async function connectToWalletConnect() {
        try {
            const provider = new WalletConnectProvider.default({
                infuraId: 'b4f8c981cc97450d8f9e600330fbfc0f' // Reemplaza con tu Infura ID real
            });

            await provider.enable();
            const web3 = new Web3(provider);
            const accounts = await web3.eth.getAccounts();
            accountDisplay.innerText = `Cuenta Conectada: ${accounts[0]}`;
        } catch (error) {
            console.error('Error al conectar WalletConnect:', error);
            alert(`Error al conectar WalletConnect: ${error.message}`);
        }
    }
});