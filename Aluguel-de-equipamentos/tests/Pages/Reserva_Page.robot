*** Variables ***
${BTN_NOVA_RESERVA}             css=#page-reservas button[onclick="abrirModalNovaReserva()"]
${MODAL_NOVA_RESERVA}           id=modal-nova-reserva
${SEL_CLIENTE_RESERVA}          id=sel-cliente-reserva
${SEL_EQUIP_RESERVA}            id=sel-equip-reserva
${RES_DATA_INICIO}              id=res-inicio
${RES_DATA_FIM}                 id=res-fim
${BTN_CONFIRMAR_RESERVA}        css=#modal-nova-reserva .modal-footer .btn-primary
${RES_CALCULO}                  id=res-calculo
${CALC_DIAS}                    id=calc-dias
${CALC_TOTAL}                   id=calc-total
${CALC_CAUCAO}                  id=calc-caucao
${TAB_PENDENTES}                css=button[onclick="filtrarReservas('pendentes', this)"]
${ROW_PAGAMENTOS}               css=#tbody-pagamentos tr
${KPI_DEVOLUCOES}               css=.kpi-card[onclick="abrirPainelDevolucoes()"]
${MODAL_PAINEL_ADMIN}           id=modal-painel-admin
