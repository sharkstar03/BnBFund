// depositos.js

async function initializeDepositos() {
    await window.initializeWeb3();
    const web3Instance = window.web3Instance;

    try {
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length === 0) {
            alert('Por favor, conecta tu wallet.');
            return;
        }
        const userAddress = accounts[0];

        const abi = await window.loadABI();
        if (!abi) {
            throw new Error('No se pudo cargar el ABI del contrato.');
        }

        const contract = new web3Instance.eth.Contract(abi, window.contractAddress);

        const isRegistered = await contract.methods.estaRegistrado(userAddress).call();
        if (!isRegistered) {
            alert('El usuario no está registrado. Por favor, regístrate primero.');
            window.location.href = 'register.html';
            return;
        }

        displayDepositosFromEvents(contract, userAddress, web3Instance);

        updatePOLPrice();

    } catch (error) {
        console.error('Error al cargar los depósitos:', error);
        alert('Hubo un error al cargar tus depósitos. Por favor, intenta de nuevo.');
        window.location.href = 'index.html';
    }
}

async function displayDepositosFromEvents(contract, userAddress, web3Instance) {
    const depositosContainer = document.getElementById('depositosContainer');
    depositosContainer.innerHTML = ''; // Limpiar el contenedor

    contract.getPastEvents(
        'Deposito',
        {
            filter: { participante: userAddress }, // Filtra por la dirección del participante
            fromBlock: 0, // Obtiene eventos desde el bloque 0
            toBlock: 'latest', // Obtiene eventos hasta el bloque más reciente
        },
        function (error, events) {
            if (error) {
                console.error('Error al obtener los eventos:', error);
                depositosContainer.innerHTML = '<p class="text-center p-4">Error al cargar los depósitos.</p>';
            } else {
                if (events.length === 0) {
                    depositosContainer.innerHTML = '<p class="text-center p-4">No se encontraron depósitos.</p>';
                    return;
                }

                // Crear contenedor gris para la tabla
                const tableContainer = document.createElement('div');
                tableContainer.className = 'bg-gray-800 rounded-lg p-4';
                depositosContainer.appendChild(tableContainer);

                // Crear tabla para mostrar depósitos
                const depositosTable = document.createElement('table');
                depositosTable.className = 'w-full text-left table-auto';
                tableContainer.appendChild(depositosTable);

                // Crear encabezado de la tabla
                const header = depositosTable.createTHead();
                const headerRow = header.insertRow();
                const headers = ['Fecha', 'Monto (POL)', 'Referidor ID'];
                headers.forEach(text => {
                    const th = document.createElement('th');
                    th.innerHTML = `<span class="text-white rounded px-2">${text}</span>`;
                    th.className = 'px-4 py-2 text-white';
                    headerRow.appendChild(th);
                });

                const tbody = depositosTable.createTBody();

                events.forEach((event) => {
                    const montoWei = event.returnValues.monto;
                    const montoPol = web3Instance.utils.fromWei(montoWei.toString(), 'ether');
                    const timestamp = event.returnValues.timestamp;
                    const referidorID = event.returnValues.referidorID;

                    const date = new Date(timestamp * 1000);
                    const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                    const row = tbody.insertRow();
                    row.className = 'border-b border-gray-700';

                    const cells = [formattedDate, `<span class="bg-green-600 text-white text-xs px-2 py-1 rounded">+ ${montoPol} POL</span>`, `<span class="bg-gray-600 text-white text-xs px-2 py-1 rounded">${referidorID}</span>`];
                    cells.forEach((text, index) => {
                        const cell = row.insertCell();
                        cell.innerHTML = text;
                        cell.className = 'px-5 py-2 border-b border-gray-700';
                    });
                });
            }
        }
    );
}

// Función para actualizar el precio de POL
function updatePOLPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon&vs_currencies=usd')
        .then(response => response.json())
        .then(data => {
            if (data.polygon && data.polygon.usd) {
                const polPrice = data.polygon.usd;
                const priceElements = document.querySelectorAll('.bnb-price');
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
window.addEventListener('load', initializeDepositos);