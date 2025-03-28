// referidos.js

async function initializeReferidos() {
  await window.initializeWeb3();
  const web3Instance = window.web3Instance;

  try {
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length === 0) {
          alert('Por favor, conecta tu wallet.');
          return;
      }
      const userAddress = accounts[0];

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

      // Obtener el estado del participante
      const participantState = await contract.methods.obtenerEstadoParticipante(userAddress).call();
      const referrals = participantState.referidos;

      // Mostrar los referidos en la página
      displayReferrals(referrals, web3Instance, contract, userAddress);

      // Actualizar el precio de POL
      updatePOLPrice();


  } catch (error) {
      console.error('Error al cargar los referidos:', error);
      alert('Hubo un error al cargar tus referidos. Por favor, intenta de nuevo.');
      window.location.href = 'index.html';
  }
}

async function displayReferrals(referrals, web3Instance, contract, userAddress) {
  const referralsContainer = document.getElementById('referralsContainer');
  referralsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos elementos

  if (referrals.length === 0) {
      // Obtener el ID del usuario
      const userInfo = await contract.methods.participantes(userAddress).call();
      const userId = userInfo.id;

      // Generar el enlace personal con el ID
      const referralLink = `bnbfund.io/register.html?ref=${userId}`;

      // Mostrar el enlace de referido
      referralsContainer.innerHTML = `      
          <div class="bg-gray-900 p-6 rounded-3xl mb-6 md:mb-0 md:ml-6 w-full">
                    <p class="text-2xl font-bold mb-4">Aun no tienes referidos. Comparte tu enlace de referido:</p>
                <div class="flex flex-col md:flex-row md:items-center">
                    <input type="text" id="referralLink" readonly class="bg-transparent text-yellow-400 px-4 py-3 flex-grow rounded-xl mb-4 md:mb-0 md:mr-4 focus:outline-none " value="${referralLink}">
                    <button id="copyButton" class="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-400 transition duration-300">Copiar</button>
                </div>
          </div>
      `;

      // Agregar funcionalidad al botón "Copiar"
      document.getElementById('copyButton').addEventListener('click', function () {
          const referralLinkInput = document.getElementById('referralLink');
          referralLinkInput.select();
          referralLinkInput.setSelectionRange(0, 99999); // Para móviles
          document.execCommand('copy');
          alert('Enlace copiado al portapapeles');
      });
    } else {
      // Crear contenedor gris para la tabla
      const tableContainer = document.createElement('div');
      tableContainer.className = 'bg-gray-800 rounded-lg p-4'; // Agregar clases de Tailwind CSS
      referralsContainer.appendChild(tableContainer);

      // Crear tabla para mostrar referidos
      const referralsTable = document.createElement('table');
      referralsTable.className = 'w-full text-left table-auto'; // Agregar clases de Tailwind CSS
      tableContainer.appendChild(referralsTable);

      // Crear encabezado de la tabla
      const header = referralsTable.createTHead();
      const headerRow = header.insertRow();
      const headers = ['Date', 'Address', 'ID', 'Estado', 'Ganancias', 'Renovaciones'];
      headers.forEach(text => {
          const th = document.createElement('th');
          th.innerHTML = `<span class="text-white rounded px-2">${text}</span>`; // Aplicar estilo al encabezado
          th.className = 'px-4 py-2 text-white'; // Agregar clases de Tailwind CSS
          headerRow.appendChild(th);
      });

      const tbody = referralsTable.createTBody();

      for (const referralAddress of referrals) {
          contract.methods.participantes(referralAddress).call().then(userInfo => {
              contract.methods.obtenerEstadoParticipante(referralAddress).call().then(participantState => {
                  const registrationTimestamp = Number(userInfo.tiempoUltimoDeposito);
                  const registrationDate = new Date(registrationTimestamp * 1000);
                  const formattedDate = registrationDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                  const shortAddress = `<span class="text-white text-xs px-2 py-1">${referralAddress.slice(0, 6)}...${referralAddress.slice(-4)}</span>`;
                  const id = userInfo.id;
                  const estado = userInfo.estaActivo; // Obtener el valor booleano
                  const estadoTexto = estado ? 'Activo' : 'Desactivo'; // Convertir a texto
                  const ganancias = web3Instance.utils.fromWei(userInfo.montoTotalRecibido.toString(), 'ether');
                  const renovaciones = participantState.receteos;

                  const row = tbody.insertRow();
                  row.className = 'border-b border-gray-700'; // Añadir línea divisoria

                  const cells = [formattedDate, shortAddress, `<span class="bg-gray-600 text-white text-xs px-2 py-1 rounded">${id}</span>`, `<span class="${estado ? 'bg-green-600' : 'bg-red-600'} text-white text-xs  px-2 py-1 rounded">${estadoTexto}</span>`, `<span class="bg-green-600 text-white text-xs px-2 py-1 rounded">+ ${ganancias} POL</span>`, `<span class="bg-orange-600 text-white text-xs px-2 py-1 rounded">${renovaciones}</span>`];
                  cells.forEach((text, index) => {
                      const cell = row.insertCell();
                      cell.innerHTML = text; // Usar innerHTML para aplicar el estilo
                      cell.className = 'px-5 py-2 border-b border-gray-700'; // Agregar clases de Tailwind CSS
                  });
              });
          });
      }
  }
}



// Función para actualizar el precio de POL (desde profile.js)
function updatePOLPrice() {
  fetch('https://api.polygon.io/v2/aggs/ticker/ETHUSD/range/1/day/2023-01-01/2023-01-01?apiKey=YOUR_API_KEY')
      .then(response => response.json())
      .then(data => {
          const polPrice = data.results[0].open;
          const priceElements = document.querySelectorAll('.bnb-price');
          priceElements.forEach(element => {
              element.textContent = `1 POL = $${polPrice}`;
          });
      })
      .catch(error => {
          console.error('Error al obtener el precio de POL:', error);
      });
}

// Al cargar la página
window.addEventListener('load', initializeReferidos);