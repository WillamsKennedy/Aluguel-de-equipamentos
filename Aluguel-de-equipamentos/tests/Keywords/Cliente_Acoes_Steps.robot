*** Settings ***
Resource    ../Pages/Cliente_Page.robot
Library     Browser

*** Keywords ***
Abrir Modal Novo Cliente
    Click                       ${BTN_NOVO_CLIENTE}
    Wait For Elements State     ${MODAL_NOVO_CLIENTE}    visible    timeout=10s

Validar Erro De Email Duplicado
    Wait For Elements State     css=.toast-item.toast-error    visible    timeout=10s
    Get Text                    css=.toast-item.toast-error    contains    já está cadastrado

Bloquear Cliente
    [Arguments]    ${cliente_id}
    Click       css=button[onclick="toggleClienteAtivo('${cliente_id}')"]

Validar Cliente Bloqueado
    Wait For Elements State     css=.toast-item.toast-warning:has-text("bloqueado")    visible    timeout=10s
