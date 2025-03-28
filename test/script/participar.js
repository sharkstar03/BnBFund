window.initializeWeb3();
const web3Instance = window.web3Instance;

async function participateInSmartContract() {
    if (!web3Instance || !web3Instance.utils) {
        showErrorModal('web3Instance no está disponible. Por favor, asegúrate de que esté correctamente configurado.');
        return;
    }

    const amountInput = document.querySelector('#amountInput');
    const amountValue = parseFloat(amountInput.value);

    const myId = document.querySelector('#myId');
    const referrerIdInt = parseFloat(myId.value);

    const minAmountInEther = '0.000075';
    const minAmountInWei = web3Instance.utils.toWei(minAmountInEther, 'ether');

    const amountValueInEther = amountValue.toString();
    const amountValueInWei = web3Instance.utils.toWei(amountValueInEther, 'ether');

    const BigNumber = web3Instance.utils.BN;
    const amountValueInWeiBN = new BigNumber(amountValueInWei);
    const minAmountInWeiBN = new BigNumber(minAmountInWei);

    if (isNaN(amountValue) || amountValueInWeiBN.lt(minAmountInWeiBN)) {
        showErrorModal('El monto ingresado es inválido. Por favor, ingresa un monto mayor o igual a 0.000075.');
        return;
    }

    if (typeof window.ethereum !== 'undefined') {
        try {
            closeModal(); // Cerrar el modal de "Agregar Fondos"
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

            const gasLimit = web3Instance.utils.toHex('500000');
            const gasPrice = web3Instance.utils.toHex(web3Instance.utils.toWei('30', 'gwei'));

            const transactionParameters = {
                from: account,
                to: window.contractAddress,
                data: contract.methods.depositarConReferido(referrerIdInt).encodeABI(),
                value: web3Instance.utils.toHex(amountValueInWei),
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
                    window.location.reload(); // Recargar la página para actualizar los datos
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