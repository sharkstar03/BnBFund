async function calculateNextDistribution() {
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    loadingDiv.classList.remove('hidden');
    resultDiv.innerHTML = '';

    try {
        await window.initializeWeb3();
        const web3Instance = window.web3Instance;
        if (!web3Instance) {
            console.error('web3Instance no está disponible.');
            return;
        }
        if (!window.contractAddress) {
            console.error('contractAddress no está definido.');
            return;
        }
        const abi = await window.loadABI();
        if (!abi) {
            console.error('No se pudo cargar el ABI del contrato');
            return null;
        }
        const contract = new web3Instance.eth.Contract(abi, window.contractAddress);
        const totalFundsWei = await contract.methods.obtenerBalanceContrato().call();
        const distributionPercentage = parseInt(await contract.methods.PORCENTAJE_DISTRIBUCION().call());
        const participants = await contract.methods.obtenerInfoCompletaParticipantes().call();
        const totalFundsEther = web3Instance.utils.fromWei(totalFundsWei, 'ether');
        const contractBalance = parseFloat(totalFundsEther);
        const distributionAmount = (contractBalance * distributionPercentage) / 100;
        const activeParticipants = participants.filter(participant => participant.estaActivo);
        const amountPerParticipant = activeParticipants.length > 0 ? distributionAmount / activeParticipants.length : 0;
        let decimalsToShow = 4;
        if (amountPerParticipant > 0 && amountPerParticipant < 0.0001) {
            decimalsToShow = 8;
        }

        let resultHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-gray-900 p-6 rounded-3xl text-center">
                    <p class="text-sm font-bold mb-2">Balance actual</p>
                    <p class="text-md text-green-500">${contractBalance.toFixed(4)} POL</p>
                </div>
                <div class="bg-gray-900 p-6 rounded-3xl text-center">
                    <p class="text-sm font-bold mb-2">Monto de distribución (20%)</p>
                    <p class="text-md text-blue-500">${distributionAmount.toFixed(4)} POL</p>
                </div>
                <div class="bg-gray-900 p-6 rounded-3xl text-center">
                    <p class="text-sm font-bold mb-2">Monto por participante</p>
                    <p class="text-md text-purple-500">${amountPerParticipant.toFixed(decimalsToShow)} POL</p>
                </div>
                <div class="bg-gray-900 p-6 rounded-3xl text-center">
                    <p class="text-sm font-bold mb-2">Participantes activos</p>
                    <p class="text-md text-yellow-500">${activeParticipants.length}</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                    <div class="md:col-span-5">
                        <div class="bg-gray-900 p-6 rounded-3xl shadow-lg">
                            <h2 class="text-xl text-center font-bold mb-4">El calculo de esta distribucion puede variar. Varia segun los nuevos participantes que ingresen posterior de realizar este calculo</h2>
                        </div>
                    </div>
                    </div>
                </div>
        `;

        resultDiv.innerHTML = resultHTML;
        await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
        console.error('Error al calcular la distribución:', error);
        resultDiv.innerHTML = `<p>Error al calcular la distribución: ${error.message}</p>`;
    } finally {
        loadingDiv.classList.add('hidden');
    }
}