  function showItemTitle(itemTitle) {
        const titleElement = document.getElementById('item-info-title');
        titleElement.innerText = itemTitle;

        let itemInfoContent = '';
        let imgContent = '';

        switch(itemTitle) {
            case 'Autonomia':
                itemInfoContent = '<p>El ecosistema de BNBFund se basa en la tecnolog&iacute;a de contratos inteligentes y blockchain, que son completamente aut&oacute;nomos y excluyen la influencia del factor humano.</p>';
                imgContent = '<img src="img/autonomia.png" alt="Imagen Centrala" class="w-30 h-32">';
                break;
            case 'Condiciones inmutables':
                itemInfoContent = '<p>El algoritmo se almacena en la cadena de bloques, por lo que nadie, ni siquiera los autores de la idea, pueden intervenir, cancelar o cambiar sus transacciones.</p>';
                imgContent = '<img src="img/inmutable.png" alt="Imagen Centrala" class="w-32 h-32">';
                break;
            case 'Transparencia':
                itemInfoContent = '<p class="text-sm">El c&oacute;digo del contrato inteligente se almacena en el dominio p&uacute;blico y cualquiera puede ver el historial completo de transacciones en cualquier momento. Esto garantiza condiciones justas y estad&iacute;sticas confiables en las que puede confiar.</p>';
                imgContent = '<img src="img/transparencia.png" alt="Imagen Centrala" class="w-32 h-32">';
                break;
            case 'Automatizacion completa':
                itemInfoContent = '<p class="text-sm">Todas las transacciones entre los miembros de la comunidad se realizan directamente de una billetera personal a otra. Los participantes no tienen cuentas dentro del sistema de donde retirar fondos, ya que BNBFund no almacena sus activos recibidos.</p>';
                imgContent = '<img src="img/automatizacion.png" alt="Imagen Centrala" class="w-32 h-32">';
                break;
            case 'Descentralizacion':
                itemInfoContent = '<p>Nadie, ni siquiera los creadores del c&oacute;digo, puede realizar cambios en el trabajo de los contratos inteligentes de BNBFund.</p>';
                imgContent = '<img src="img/descentralizacion.png" alt="Imagen Centrala" class="w-32 h-32">';
                break;
            case '100% en linea':
                itemInfoContent = '<p>No hay costos ocultos ni tarifas de servicio. El saldo del contrato inteligente siempre sera el que sale reflejado.</p>';
                imgContent = '<img src="img/enlinea.png" alt="Imagen Centrala" class="w-32 h-32">';
                break;
            default:
                itemInfoContent = '<p>Selecciona un &iacute;tem para ver la informaci&oacute;n.</p>';
        }
        document.getElementById('item-info-content').innerHTML = itemInfoContent;
        document.getElementById('img-content').innerHTML = imgContent;

    }

    function toggleAnswer(faqId) {
        const answerElement = document.getElementById(faqId + '-answer');
        const iconElement = document.getElementById(faqId + '-icon');
        if (answerElement.classList.contains('hidden')) {
            answerElement.classList.remove('hidden');
            iconElement.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            answerElement.classList.add('hidden');
            iconElement.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    }
