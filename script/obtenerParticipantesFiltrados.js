async function obtenerParticipantesFiltrados(contrato, estado, minReferidos) {
    const direcciones = await contrato.direccionesParticipantes();
    const participantesFiltrados = [];

    for (const direccion of direcciones) {
        const estadoParticipante = await contrato.obtenerEstadoParticipante(direccion);
        const numeroReferidos = await contrato.obtenerNumeroDeReferidos(direccion);

        if (estadoParticipante.estaActivo === estado && numeroReferidos >= minReferidos) {
            participantesFiltrados.push(direccion);
        }
    }

    return participantesFiltrados;
}