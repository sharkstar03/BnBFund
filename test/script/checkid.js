      
        let previewButton = document.getElementById('previewButton');
        let userInput = document.getElementById('userInput');

        if (previewButton && userInput) {
            previewButton.addEventListener('click', () => {
                const userInputValue = userInput.value.trim();
                if (userInputValue) {
                    let url = `profileview.html?id=${userInputValue}`;
                    window.location.href = url; // Cargar en la misma ventana
                    console.log(`URL abierta: ${url}`); // Para verificar que la URL es correcta
                } else {
                    alert('Por favor, ingresa un ID o dirección de wallet.');
                }
            });
        } else {
            console.log('Elementos no encontrados en el DOM');
        }

        document.getElementById('checkDemoButton').addEventListener('click', async function () {
            try {
                // Inicializar Web3 si no está inicializado
                    if (typeof window.web3Instance === 'undefined') {
                    await window.initializeWeb3();
                }

                // Inicializar el contrato si no está inicializado
                if (typeof window.contract === 'undefined') {
                    const abi = await window.loadABI();
                    if (!abi) {
                        alert('No se pudo cargar el ABI del contrato.');
                        return;
                    }
                    window.contract = new window.web3Instance.eth.Contract(abi, window.contractAddress);
                    console.log('Contrato inicializado:', window.contract);
                }

                // Verificar nuevamente si el contrato está inicializado
                if (typeof window.contract === 'undefined') {
                    alert('El contrato no está inicializado.');
                    return;
                }

                // Obtener el siguiente ID de participante (esto nos da el total de participantes registrados)
                const nextParticipantId = await window.contract.methods.nextParticipantId().call();

                if (nextParticipantId <= 1) {
                    alert('No hay participantes registrados.');
                    return;
                }

                // Generar un índice aleatorio dentro del rango de IDs de participantes registrados
                const randomIndex = Math.floor(Math.random() * (nextParticipantId - 1)) + 1;

                // Obtener la dirección del participante correspondiente al índice aleatorio
                const randomAddress = await window.contract.methods.participantesPorId(randomIndex).call();
                
                // Obtener el ID del participante por la dirección
                const participant = await window.contract.methods.obtenerParticipantePorDireccion(randomAddress).call();
                const participantId = participant.id;

                // Redirigir a la página profileview.html con el ID aleatorio
                window.location.href = `profileview.html?id=${participantId}`;
            } catch (error) {
                console.error('Error al obtener un ID de participante aleatorio:', error);
                alert('Hubo un error al obtener un ID de participante. Por favor, intenta de nuevo.');
            }
        });
   