// funcion para consultar las direcciones habilitadas y desabilitadas
async function obtenerListasDeDirecciones(contrato) {
    const direcciones = await contrato.direccionesParticipantes();
    const habilitadas = [];
    const deshabilitadas = [];

    for (const direccion of direcciones) {
        const estado = await contrato.obtenerEstadoParticipante(direccion);
        if (estado.estaActivo) {
            habilitadas.push(direccion);
        } else {
            deshabilitadas.push(direccion);
        }
    }

    return { habilitadas, deshabilitadas };
}