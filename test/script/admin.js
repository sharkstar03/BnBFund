document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si MetaMask está disponible
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask no detectado. Por favor, instala MetaMask y recarga la página.');
        return;
    }

    try {
        // Inicializar web3Instance
        window.web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();

        // Cargar el ABI del contrato
        const abi = await window.loadABI();
        if (!abi) {
            throw new Error('No se pudo cargar el ABI del contrato.');
        }

        // Crear instancia del contrato
        window.contract = new window.web3Instance.eth.Contract(abi, window.contractAddress);

        // Variables globales
        let currentAccount;
        let participantsData = [];

        // Conectar MetaMask
        const connectButton = document.getElementById('connectButtonAdmin');
        connectButton.addEventListener('click', async () => {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await window.web3Instance.eth.getAccounts();
                currentAccount = accounts[0];
                connectButton.innerText = 'Conectado';
                // Obtener información del propietario del contrato
                await checkOwner();
            } catch (error) {
                console.error('Error al conectar con MetaMask:', error);
                alert('Error al conectar con MetaMask.');
            }
        });

        // Verificar si la cuenta conectada es el propietario del contrato
        async function checkOwner() {
            try {
                const ownerAddress = await window.contract.methods.propietario().call();
                document.getElementById('ownerAddress').innerText = `Owner: ${ownerAddress}`;

                if (currentAccount.toLowerCase() !== ownerAddress.toLowerCase()) {
                    alert('Acceso denegado. Esta página es sólo para el propietario del contrato.');
                    window.location.href = 'index.html';
                    return;
                }

                // Cargar información del contrato y participantes
                await loadContractInfo();
                await loadParticipants();

            } catch (error) {
                console.error('Error al verificar el propietario del contrato:', error);
                alert('Error al verificar el propietario del contrato.');
            }
        }

        // Cargar información del contrato
        async function loadContractInfo() {
            try {
                // Mostrar dirección del contrato
                document.getElementById('contractAddressDisplay').innerText = window.contractAddress;

                // Obtener balance del contrato
                const balanceWei = await window.web3Instance.eth.getBalance(window.contractAddress);
                const balanceEth = window.web3Instance.utils.fromWei(balanceWei, 'ether');
                document.getElementById('contractBalance').innerText = balanceEth;

                // Obtener total de distribuciones
                const totalDistributions = await window.contract.methods.totalDistribuciones().call();
                document.getElementById('totalDistributions').innerText = totalDistributions;

                // Obtener última distribución
                const lastDistribution = await window.contract.methods.obtenerUltimaDistribucion().call();
                const lastDistributionTime = BigInt(lastDistribution[0]);
                const lastDistributionAmount = BigInt(lastDistribution[1]);
                const lastDistributionDate = new Date(Number(lastDistributionTime) * 1000);
                document.getElementById('lastDistribution').innerText = lastDistributionDate.toLocaleString();

            } catch (error) {
                console.error('Error al cargar información del contrato:', error);
                alert('Error al cargar información del contrato.');
            }
        }

        async function loadParticipants() {
            try {
                participantsData = await window.contract.methods.obtenerInfoCompletaParticipantes().call();
                document.getElementById('totalParticipants').innerText = participantsData.length;

                // Calcular total de receteos
                let totalResets = 0;
                participantsData.forEach(participant => {
                    totalResets += parseInt(participant.receteos);
                });
                document.getElementById('totalResets').innerText = totalResets;

                // Asegurarse de convertir BigInt antes de usarlo
                participantsData = participantsData.map(participant => {
                    return {
                        ...participant,
                        tiempoUltimoDeposito: Number(participant.tiempoUltimoDeposito),
                        montoDepositado: window.web3Instance.utils.fromWei(participant.montoDepositado, 'ether')
                    };
                });

                // Mostrar participantes
                displayParticipants('all');

            } catch (error) {
                console.error('Error al cargar participantes:', error);
                alert('Error al cargar participantes.');
            }
        }

        function displayParticipants(filter) {
            const tbody = document.getElementById('participantsTableBody');
            tbody.innerHTML = '';

            participantsData.forEach(participant => {
                const isActive = participant.estaActivo;

                if (filter === 'enabled' && !isActive) return;
                if (filter === 'disabled' && isActive) return;

                const row = document.createElement('tr');

                // Formatear fecha
                const lastDepositDate = new Date(participant.tiempoUltimoDeposito * 1000).toLocaleString();

                row.innerHTML = `
                    <td class="px-4 py-2">${participant.id}</td>
                    <td class="px-4 py-2">${participant.direccion}</td>
                    <td class="px-4 py-2">${isActive ? 'Habilitado' : 'Deshabilitado'}</td>
                    <td class="px-4 py-2">${lastDepositDate}</td>
                    <td class="px-4 py-2">${participant.distribucionesRecibidas}</td>
                    <td class="px-4 py-2">${participant.receteos}</td>
                    <td class="px-4 py-2">${participant.montoDepositado} POL</td>
                `;

                tbody.appendChild(row);
            });
        }

        // Escuchar botones de filtro
        document.getElementById('showAllBtn').addEventListener('click', () => displayParticipants('all'));
        document.getElementById('showEnabledBtn').addEventListener('click', () => displayParticipants('enabled'));
        document.getElementById('showDisabledBtn').addEventListener('click', () => displayParticipants('disabled'));

        // Botón para distribuir recompensas
        // Botón para distribuir recompensas
        document.getElementById('distributeRewardsBtn').addEventListener('click', async () => {
            try {
                // Llamar a la función distribuirRecompensas del contrato
                await window.contract.methods.distribuirRecompensas().send({ from: currentAccount });
                alert('Recompensas distribuidas exitosamente.');
                // Actualizar información del contrato y participantes
                await loadContractInfo();
                await loadParticipants();
            } catch (error) {
                console.error('Error al distribuir recompensas:', error);
                alert('Error al distribuir recompensas.');
            }
        });

        // Conectar automáticamente si la wallet ya está conectada
        if (localStorage.getItem('walletConnected') === 'true') {
            connectButton.click();
        }
    } catch (error) {
        console.error('Error en admin.js:', error);
        alert('Error en admin.js: ' + error.message);
    }
});