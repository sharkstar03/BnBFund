// contract.js

// Esperar a que el DOM y los scripts estén completamente cargados
document.addEventListener('DOMContentLoaded', async function() {

    // Asegurarte de que initializeWeb3 se haya ejecutado
    await window.initializeWeb3();

    // Obtener la instancia global de web3
    const web3Instance = window.web3Instance;

    // Verificar si web3Instance está disponible
    if (!web3Instance) {
        console.error('web3Instance no está disponible. Asegúrate de que initializeWeb3 se haya ejecutado correctamente.');
        return;
    }

    // Verificar si contractAddress está disponible
    if (!window.contractAddress) {
        console.error('contractAddress no está definido en window.');
        return;
    }

    // Función para acortar las direcciones
    function shortenAddress(address) {
        if (!address) {
            console.error('Dirección no definida:', address);
            return 'undefined';
        }
        return `${address.slice(0, 5)}...${address.slice(-5)}`;
    }

    // Función para obtener toda la información de los participantes
    async function getCompleteParticipants(contract) {
        try {
            const participants = await contract.methods.obtenerInfoCompletaParticipantes().call();
            return participants;
        } catch (error) {
            console.error('Error al obtener la información completa de los participantes:', error);
            return [];
        }
    }

    // Función para obtener la fecha y el monto de la última distribución
    async function getLastDistribution(contract) {
        try {
            const lastDistribution = await contract.methods.obtenerUltimaDistribucion().call();
            return lastDistribution;
        } catch (error) {
            console.error('Error al obtener la última distribución:', error);
            return null;
        }
    }

    
  // Función para obtener información del Smart Contract
  async function getContractInfo() {
    try {
      // Cargar el ABI del contrato desde window.loadABI
      const abi = await window.loadABI();
      if (!abi) {
        console.error('No se pudo cargar el ABI del contrato');
        return null;
      }
      // Crear la instancia del contrato
      const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

      const [totalFunds, bnbFunds, totalDistributions, lastDistribution, countdistri, totalParticipantes] = await Promise.all([
        contract.methods.obtenerBalanceContrato().call(),
        contract.methods.PORCENTAJE_DISTRIBUCION().call(),
        contract.methods.obtenerMontoTotalDistribuido().call(),
        contract.methods.obtenerUltimaDistribucion().call(),
        contract.methods.totalDistribuciones().call(),
        contract.methods.totalParticipantes().call(),
      ]);

      // Obtener eventos NuevoParticipante
      // const eventosParticipante = await contract.getPastEvents('NuevoParticipante', {
      //   fromBlock: 0,
      //   toBlock: 'latest',
      // });
      // // Calcular miembros recientes
      // const miembrosRecientes = eventosParticipante.filter(evento => {
      //   const tiempoEvento = evento.returnValues.timestamp * 1000;
      //   const tiempoActual = Date.now();
      //   const tiempoLimite = tiempoActual - 24 * 60 * 60 * 1000;
      //   return tiempoEvento >= tiempoLimite;
      // }).length;
      const miembrosRecientes = 0; // No calculamos, asignamos un valor predeterminado

      // Obtener eventos Deposito
      // const eventosDeposito = await contract.getPastEvents('Deposito', {
      //   fromBlock: 0,
      //   toBlock: 'latest',
      // });
      // // Calcular balance total reciente
      // const balanceRecienteWei = eventosDeposito.filter(evento => {
      //   const tiempoEvento = evento.returnValues.timestamp * 1000;
      //   const tiempoActual = Date.now();
      //   const tiempoLimite = tiempoActual - 24 * 60 * 60 * 1000;
      //   return tiempoEvento >= tiempoLimite;
      // }).reduce((total, evento) => total + Number(evento.returnValues.monto), 0); // Convertir a Number
      // const balanceRecienteEther = web3Instance.utils.fromWei(balanceRecienteWei.toString(), 'ether');
      const balanceRecienteEther = '0'; // No calculamos, asignamos un valor predeterminado

      // Obtener los eventos de depósito
      const events = await contract.getPastEvents('Deposito', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      // Retornar la información del contrato en un objeto
      const contractInfo = {
        contract, // Añadimos la instancia del contrato
        participants: await getCompleteParticipants(contract), // Llamada a la función original
        totalFunds: web3Instance.utils.fromWei(totalFunds, 'ether'),
        bnbFunds,
        totalDistributions,
        lastDistribution,
        events, // Agregar los eventos de depósito
        miembrosRecientes, // Asignamos un valor predeterminado
        balanceRecienteEther, // Asignamos un valor predeterminado
        countdistri,
        totalDeposited: web3Instance.utils.fromWei(await contract.methods.obtenerMontoTotalDistribuido().call(), 'ether'), // Nuevo campo
        totalParticipantes: totalParticipantes, // Nuevo campo
      };
      console.log('Información del contrato antes de retornar (sin cálculos recientes):', contractInfo);
      return contractInfo;
    } catch (error) {
      console.error('Error al obtener información del contrato:', error);
      return null;
    }
  }

  async function updateDOM() {
    console.log('Entrando en la funcion updateDOM')
    try {
      const abi = await window.loadABI();
      if (!abi) {
        console.error('No se pudo cargar el ABI del contrato');
        return;
      }
      const contractInfo = await getContractInfo();
      if (!contractInfo) {
        console.error('No se pudo obtener la información del contrato.');
        return;
      }

      const { contract, totalParticipantes, miembrosRecientes, totalFunds, balanceRecienteEther, totalDeposited, totalDistributions } = contractInfo;

      // Obtener el número total de miembros
      const totalMembers = totalParticipantes;

      console.log(totalMembers);
      console.log("eventos", contractInfo.events);

      const miembrosRecientesText = ` ${miembrosRecientes} `;
      console.log("miembrosreText", miembrosRecientesText);

      // Actualizar el div totalMembers
      if (document.getElementById('totalMembers')) {
        document.getElementById('totalMembers').innerHTML = `${totalMembers}&nbsp;&nbsp; <span class="text-xl" style="color: green;font-weight: bold;"><i class="fas fa-arrow-up" style="color: green;"></i>${miembrosRecientesText}</span>`;
      } else {
        console.error('El elemento con ID "totalMembers" no se encontró en el DOM.');
      }

      // Actualizar totalContractFunds
      if (document.getElementById('totalContractFunds')) {
        document.getElementById('totalContractFunds').innerHTML = `${parseFloat(totalFunds).toFixed(4)} POL &nbsp;&nbsp;<span class="text-lg" style="color: green;font-weight: bold;"> <i class="fas fa-arrow-up" style="color: green;"> </i>${parseFloat(balanceRecienteEther).toFixed(4)}</span>`;
      } else {
        console.error('El elemento con ID "totalContractFunds" no se encontró en el DOM.');
      }

      // Actualizar totalDistributed
      if (document.getElementById('totalDistributed')) {
        document.getElementById('totalDistributed').innerHTML = `${totalDistributions}`;
      } else {
        console.error('El elemento con ID "totalDistributed" no se encontró en el DOM.');
      }

      // Actualizar totalDeposited
      if (document.getElementById('bnbFundtotalDepositedsValue')) {
        document.getElementById('bnbFundtotalDepositedsValue').textContent = `${parseFloat(totalDeposited).toFixed(6)} POL`;
      } else {
        console.error('El elemento con ID "bnbFundtotalDepositedsValue" no se encontró en el DOM.');
      }

      // --- Lógica original para recentActivity y additionalDeposits ---

      // Actualizar Recent Activity
      const recentActivityElement = document.getElementById('recentActivity');
      if (recentActivityElement) {
        recentActivityElement.innerHTML = await generateRecentActivityList(contract, contractInfo.participants, web3Instance);
      }

      // Actualizar Additional Deposits
      const additionalDepositsList = await generateAdditionalDepositsList(
        contract,
        contractInfo.events,
        contractInfo.participants,
        web3Instance
      );
      document.getElementById('additionalDeposits').innerHTML = additionalDepositsList;

    } catch (error) {
      console.error('Error al cargar los datos del contrato:', error);
    }
  }

    // Función para generar la lista de actividades recientes
    async function generateRecentActivityList(contract, recentActivity, web3Instance) {
        if (!recentActivity || recentActivity.length === 0) {
            return '<p>No hay actividad reciente disponible.</p>';
        }

        const recentParticipants = recentActivity.slice(-10).reverse();
        let activityList = '<ul>';

        for (const activity of recentParticipants) {
            try {
                const events = await contract.getPastEvents('Deposito', {
                    filter: { participante: activity.direccion },
                    fromBlock: 0,
                    toBlock: 'latest'
                });

                if (events.length > 0) {
                    const lastEvent = events[events.length - 1];
                    const montoDepositado = web3Instance.utils.fromWei(lastEvent.returnValues.monto, 'ether');
                    const timestamp = lastEvent.returnValues.timestamp;

                    activityList += `
                        <li class="mb-2 flex justify-between items-center">
                            <div class="flex items-center">
                                <i class="fas fa-user text-red-500 mr-2"></i>
                                <span class="text-white rounded px-2">ID</span>
                                <span class="bg-purple-500 text-white rounded px-2">${activity.id}</span>
                                <span class="text-white rounded px-2">+</span>
                                <span class="bg-green-500 text-white rounded px-2">${montoDepositado} POL</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-clock text-red-500 mr-2"></i>
                                <span class="bg-yellow-500 text-black rounded px-2">${new Date(timestamp * 1000).toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                        </li>
                        <li class="border-t border-white my-2"></li>
                    `;
                }
            } catch (error) {
                console.error('Error al obtener eventos de depósito:', error);
            }
        }

        activityList += '</ul>';
        return activityList;
    }

    async function generateAdditionalDepositsList(contract, events, participants, web3Instance) {
        if (!events || events.length === 0) {
            return '<p>No hay depósitos adicionales disponibles.</p>';
        }
    
        // Filtrar los eventos de depósitos adicionales (participantes existentes)
        const additionalDepositsEvents = events.filter(event => {
            const participantAddress = event.returnValues.participante;
            return participants.some(p => p.direccion === participantAddress);
        });
    
        // Limitar a los últimos 10 depósitos adicionales y revertir el orden
        const limitedDeposits = additionalDepositsEvents.slice(-10).reverse();
    
        let additionalDepositsList = '<ul>';
    
        for (const event of limitedDeposits) {
            const participantAddress = event.returnValues.participante;
            const montoDepositado = web3Instance.utils.fromWei(event.returnValues.monto, 'ether');
            const timestamp = event.returnValues.timestamp;
    
            // Encontrar el ID del participante
            const participant = participants.find(p => p.direccion === participantAddress);
            if (participant) {
                additionalDepositsList += `
                    <li class="mb-2 flex justify-between items-center">
                        <div class="flex items-center">
                            <i class="fas fa-user text-red-500 mr-2"></i>
                            <span class="text-white rounded px-2">ID</span>
                            <span class="bg-purple-500 text-white rounded px-2">${participant.id}</span>
                            <span class="text-white rounded px-2">+</span>
                            <span class="bg-green-500 text-white rounded px-2">${montoDepositado} POL</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-clock text-red-500 mr-2"></i>
                            <span class="bg-yellow-500 text-black rounded px-2">${new Date(timestamp * 1000).toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </li>
                    <li class="border-t border-white my-2"></li>
                `;
            }
        }
    
        additionalDepositsList += '</ul>';
        return additionalDepositsList;
    }

    // Llamar a updateDOM para actualizar la información en la página
    updateDOM();

});