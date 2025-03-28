// profile.js

// Función asíncrona para inicializar Web3 y cargar datos del usuario
async function initializeAndLoadUser() {
    await window.initializeWeb3();
    const web3Instance = window.web3Instance;

    // Tu lógica con web3Instance
    await loadUserData();
    updatePOLPrice();
    await loadContractData(web3Instance);
}

// Función para cargar datos del usuario
async function loadUserData() {
    try {
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length === 0) {
            alert('Por favor, conecta tu wallet.');
            return;
        }
        const userAddress = accounts[0];

        function shortenAddress(userAddress) {
            if (!userAddress) {
                console.error('Dirección no definida:', userAddress);
                return 'undefined';
            }
            return `${userAddress.slice(0, 3)}...${userAddress.slice(-6)}`;
        }
        const userAddresshort = shortenAddress(accounts[0]);

        document.getElementById('walletAddress').textContent = userAddresshort;
        document.getElementById('walletAddressAll').value = userAddress;

        // Cargar el ABI del contrato
        const abi = await window.loadABI();
        if (!abi) {
            throw new Error('No se pudo cargar el ABI del contrato.');
        }

        const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

        // Verificar si el usuario está registrado
        const isRegistered = await contract.methods.estaRegistrado(userAddress).call();
        if (!isRegistered) {
            alert('El usuario no está registrado. Por favor, regístrate primero.');
            window.location.href = 'register.html';
            return;
        }

        // Obtener la información del usuario
        const userInfo = await contract.methods.participantes(userAddress).call();
        //console.log(userInfo);

        // Actualizar el DOM con la información del usuario
        document.getElementById('userId').textContent = `ID ${userInfo.id}`;

        // Convertir el timestamp a número para evitar errores de BigInt
        const registrationTimestamp = Number(userInfo.tiempoUltimoDeposito);
        const registrationDate = new Date(registrationTimestamp * 1000);
        const formattedDate = registrationDate.toLocaleDateString();

        // Asignar las propiedades a variables
        const receteos = userInfo.receteos;
        const nuevoDeposito = userInfo.nuevoDeposito;
        const estaActivo = userInfo.estaActivo;
        //console.log('esta activo:',estaActivo)


        if (receteos > 0 && !nuevoDeposito) {
            // Mostrar el botón "Reactivarme"
            document.querySelector('.reactivate-button').style.display = 'inline-block';
        }
        // Obtener el Sponsor ID desde la información del participante
        const sponsorId = userInfo.referidorID;
        document.getElementById('sponsorId').textContent = `${sponsorId}`;

        document.getElementById('registrationDate').textContent = `Invitado ${formattedDate} por ID ${sponsorId}`;

        // Estado de distribución
        if(estaActivo == false){
            document.getElementById('distributionStatus').textContent = `${userInfo.distribucionesRecibidas}/5 Desactivado`;
        }else{
            document.getElementById('distributionStatus').textContent = `${userInfo.distribucionesRecibidas}/5 Activado`;
        }
        

        // Beneficios
        const benefitsInBNB = web3Instance.utils.fromWei(userInfo.montoTotalRecibido.toString(), 'ether');
        document.getElementById('benefits').textContent = `${benefitsInBNB} POL`;

        // Obtener el ID del usuario
        const userId = userInfo.id;

        // Generar el enlace personal con el ID
        const referralLink = `bnbfund.io/register.html?ref=${userId}`;
        document.getElementById('referralLink').value = referralLink;
        document.getElementById('myId').value = userId;

        // Agregar funcionalidad al botón "Copiar"
        document.getElementById('copyButton').addEventListener('click', function () {
            const referralLinkInput = document.getElementById('referralLink');
            referralLinkInput.select();
            referralLinkInput.setSelectionRange(0, 99999); // Para móviles
            document.execCommand('copy');
            alert('Enlace copiado al portapapeles');
        });

        // Obtener el número de referidos
        const participantState = await contract.methods.obtenerEstadoParticipante(userAddress).call();
        const referrals = participantState.referidos;

        document.getElementById('referralsCount').textContent = referrals.length;

        // Calcular y mostrar el ratio
        const distribucionesRecibidas = participantState.distribucionesRecibidas;
        //const receteos = participantState.receteos;
        //const ratio = receteos > 0 ? (distribucionesRecibidas / receteos) * 100 : 0;
        //document.getElementById('ratio').textContent = `${ratio.toFixed(2)}%`;

        // Calcular y mostrar la segunda distribución
        let dist2Text = `${distribucionesRecibidas}/2`; // Mostrar directamente la cantidad de distribuciones recibidas

        if (distribucionesRecibidas >= 2 && !estaActivo) {
            dist2Text = "2/2 Desactivado";
        }

        document.getElementById('dist_2').textContent = dist2Text;

    } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        alert('Parece que no estas conectado, Hubo un error al cargar tus datos. Por favor, intenta de nuevo.');
        window.location.href = 'index.html';
    }
}

// Función para cargar datos del contrato
async function loadContractData(web3Instance) {
    try {
        const abi = await window.loadABI();
        if (!abi) {
            throw new Error('No se pudo cargar el ABI del contrato.');
        }

        const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

        // Obtener el número total de miembros usando totalParticipantes
        const totalMembers = await contract.methods.totalParticipantes().call();

        // Obtener los eventos NuevoParticipante
        const eventosParticipante = await contract.getPastEvents('NuevoParticipante', {
            fromBlock: 0,
            toBlock: 'latest',
        });

        // Calcular los miembros recientes
        const miembrosRecientes = eventosParticipante.filter(evento => {
            const tiempoEvento = evento.returnValues.timestamp * 1000; // Convertir a milisegundos
            const tiempoActual = Date.now();
            const tiempoLimite = tiempoActual - 24 * 60 * 60 * 1000; // 24 horas

            return tiempoEvento >= tiempoLimite;
        }).length;

        const miembrosRecientesText = ` ${miembrosRecientes} `;

        // Actualizar el div totalMembers
        document.getElementById('totalMembers').innerHTML = `${totalMembers}&nbsp;&nbsp; <span class="text-xl" style=\"color: green;font-weight: bold;\"><i class="fas fa-arrow-up" style=\"color: green;\"></i>${miembrosRecientesText}</span>`;
        //document.getElementById('totalMembers').innerHTML = '100 <i class="fas fa-check" style="color: green;"></i>';
        // Obtener los eventos Deposito
        const eventosDeposito = await contract.getPastEvents('Deposito', {
            fromBlock: 0,
            toBlock: 'latest',
        });

        // Calcular el balance total reciente
        const balanceRecienteWei = eventosDeposito.filter(evento => {
            const tiempoEvento = evento.returnValues.timestamp * 1000; // Convertir a milisegundos
            const tiempoActual = Date.now();
            const tiempoLimite = tiempoActual - 24 * 60 * 60 * 1000; // 24 horas

            return tiempoEvento >= tiempoLimite;
        }).reduce((total, evento) => total + parseInt(evento.returnValues.monto), 0);
        const balanceRecienteEther = web3Instance.utils.fromWei(balanceRecienteWei.toString(), 'ether');
        document.getElementById('totalContractFunds').innerHTML = `${parseFloat(balanceRecienteEther).toFixed(4)} POL &nbsp;&nbsp;<span class="text-lg" style=\"color: green;font-weight: bold;\"> <i class="fas fa-arrow-up" style=\"color: green;\"> </i>${parseFloat(balanceRecienteEther).toFixed(4)}</span>`;

        // Obtener los eventos Distribucion
        const eventosDistribucion = await contract.getPastEvents('Distribucion', {
            fromBlock: 0,
            toBlock: 'latest',
        });

        // Calcular el total de distribuciones recientes totalDistribuciones
        const totalDistribucionesRecientes = await contract.methods.totalDistribuciones().call();

        document.getElementById('totalDistributed').innerHTML = `${totalDistribucionesRecientes}`;

        // Calcular el total de POL distribuidos recientemente
        const totalPOLDistribuidosRecientesWei = eventosDistribucion.filter(evento => {
            const tiempoEvento = evento.returnValues.timestamp * 1000; // Convertir a milisegundos
            const tiempoActual = Date.now();
            const tiempoLimite = tiempoActual - 24 * 60 * 60 * 1000; // 24 horas

            return tiempoEvento >= tiempoLimite;
        }).reduce((total, evento) => total + parseInt(evento.returnValues.monto), 0);

    
        // Obtener y mostrar el monto total depositado
        try {
            const montoTotalDepositadoWei = await contract.methods.obtenerMontoTotalDistribuido().call();
            //console.log("Tipo de montoTotalDepositadoWei:", typeof montoTotalDepositadoWei);
            //console.log("Valor de montoTotalDepositadoWei:", montoTotalDepositadoWei);
        
            //Convierte montoTotalDepositadoWei a BigNumber
            const montoTotalDepositadoBN = web3Instance.utils.toBN(montoTotalDepositadoWei);
        
            // Utiliza el BigNumber en fromWei
            const montoTotalDepositadoEther = web3Instance.utils.fromWei(montoTotalDepositadoBN, 'ether');
        
            document.getElementById('totalDeposited').textContent = `${parseFloat(montoTotalDepositadoEther).toFixed(6)} POL`;
        } catch (error) {
            console.error("Error al obtener montoTotalDepositado:", error);
            document.getElementById('totalDeposited').textContent = "Error al cargar";
        }

    } catch (error) {
        console.error('Error al cargar los datos del contrato:', error);
    }
}


function updatePOLPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon&vs_currencies=usd')
        .then(response => {
            //console.log('Respuesta de la API:', response);
            return response.json();
        })
        .then(data => {
            //console.log('Datos de la API:', data);
            if (data.polygon && data.polygon.usd) {
                const polPrice = data.polygon.usd;
                const priceElements = document.querySelectorAll('.pol-price');
                priceElements.forEach(element => {
                    element.textContent = `1 POL = $${polPrice}`;
                });
            } else {
                console.error('No se pudo obtener el precio de POL desde CoinGecko.');
            }
        })
        .catch(error => {
            console.error('Error al obtener el precio de POL:', error);
        });
}

// Al cargar la página
window.addEventListener('load', initializeAndLoadUser);

// Script to open and close the modal 
function openModal() {
    document.getElementById('participationModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('participationModal').classList.add('hidden');
}