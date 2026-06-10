*** Settings ***
Resource    ../Pages/Reserva_Page.robot
Library     Browser

*** Keywords ***
Abrir Formulario De Nova Reserva
    Click                       ${BTN_NOVA_RESERVA}
    Wait For Elements State     ${MODAL_NOVA_RESERVA}    visible    timeout=10s

Preencher Reserva
    [Arguments]    ${cliente_id}    ${equip_id}    ${data_inicio}    ${data_fim}
    Select Options By   ${SEL_CLIENTE_RESERVA}    value    ${cliente_id}
    Select Options By   ${SEL_EQUIP_RESERVA}      value    ${equip_id}
    Fill Text           ${RES_DATA_INICIO}        ${data_inicio}
    Fill Text           ${RES_DATA_FIM}           ${data_fim}

Submeter Reserva
    Click       ${BTN_CONFIRMAR_RESERVA}

Validar Reserva Criada
    Wait For Elements State     css=.toast-item.toast-success:has-text("Reserva criada")    visible    timeout=10s

Validar Calculo Da Reserva
    [Arguments]    ${total_esperado}
    Wait For Elements State     ${RES_CALCULO}    visible    timeout=10s
    Get Text                    ${CALC_TOTAL}    contains    ${total_esperado}

Validar Periodo Recusado
    Wait For Elements State     css=.toast-item.toast-error:has-text("Período máximo")    visible    timeout=10s

Filtrar Reservas Pendentes
    Click       ${TAB_PENDENTES}

Cancelar Reserva
    [Arguments]    ${reserva_id}
    Handle Future Dialogs       action=accept
    Click                       css=button[onclick="cancelarReserva('${reserva_id}')"]

Validar Reserva Cancelada
    Wait For Elements State     css=.toast-item.toast-warning:has-text("cancelada")    visible    timeout=10s

Gerar Contrato Da Reserva
    [Arguments]    ${reserva_id}
    Click       css=button[onclick="gerarContratoReserva('${reserva_id}')"]

Validar Contrato Gerado
    Wait For Elements State     css=.toast-item.toast-success:has-text("Contrato gerado")    visible    timeout=10s

Abrir Painel De Devolucoes
    Click                       ${KPI_DEVOLUCOES}
    Wait For Elements State     ${MODAL_PAINEL_ADMIN}    visible    timeout=10s

Registrar Devolucao
    [Arguments]    ${reserva_id}
    Handle Future Dialogs       action=accept
    Click                       css=button[onclick="registrarDevolucao('${reserva_id}')"]

Validar Devolucao Registrada
    Wait For Elements State     css=.toast-item.toast-success:has-text("Devolução registrada")    visible    timeout=10s

Validar Existe Pagamentos
    Get Element Count    ${ROW_PAGAMENTOS}    >    ${0}

Validar Detalhes Do Pagamento
    [Arguments]    ${ref}    ${reserva}    ${metodo}    ${valor}    ${status}
    ${linha}=    Set Variable    css=#tbody-pagamentos tr:has-text("${ref}")
    Wait For Elements State    ${linha}    visible    timeout=10s
    Get Text    ${linha}    contains    ${reserva}
    Get Text    ${linha}    contains    ${metodo}
    Get Text    ${linha}    contains    ${valor}
    Get Text    ${linha}    contains    ${status}
