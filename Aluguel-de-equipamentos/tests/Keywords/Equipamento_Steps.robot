*** Settings ***
Resource    ../Pages/Equipamento_Page.robot
Library     Browser

*** Keywords ***
Cadastrar Equipamento
    [Arguments]    ${nome}    ${categoria}    ${serial}    ${valor_diario}    ${observacoes}=
    Click                       ${BTN_NOVO_EQUIPAMENTO}
    Wait For Elements State     ${MODAL_NOVO_EQUIPAMENTO}    visible    timeout=10s
    Fill Text           ${EQ_INPUT_NOME}            ${nome}
    Select Options By   ${EQ_SELECT_CATEGORIA}     label    ${categoria}
    Fill Text           ${EQ_INPUT_SERIAL}          ${serial}
    Fill Text           ${EQ_INPUT_VALOR_DIARIO}    ${valor_diario}
    Fill Text           ${EQ_INPUT_OBSERVACOES}     ${observacoes}
    Click               ${BTN_CADASTRAR_EQUIPAMENTO}

Validar Equipamento Cadastrado
    [Arguments]    ${nome}
    Wait For Elements State     css=.toast-item.toast-success:has-text("cadastrado!")    visible    timeout=10s
    Get Text                    css=.toast-item.toast-success:has-text("cadastrado!")    contains    Equipamento "${nome}" cadastrado!

Alterar Status Do Equipamento
    [Arguments]    ${equip_id}    ${novo_status}
    Click                       css=button[onclick="abrirModalStatus('${equip_id}')"]
    Wait For Elements State     ${MODAL_STATUS}    visible    timeout=10s
    Select Options By           ${STATUS_SELECT_NOVO}    value    ${novo_status}
    Click                       ${BTN_CONFIRMAR_STATUS}

Validar Status Alterado
    Wait For Elements State     css=.toast-item.toast-success:has-text("Status alterado")    visible    timeout=10s

Buscar Equipamento
    [Arguments]    ${termo}
    Fill Text    ${EQ_SEARCH}    ${termo}

Validar Quantidade De Equipamentos
    [Arguments]    ${quantidade}
    Get Text    ${EQ_COUNT}    ==    ${quantidade}
