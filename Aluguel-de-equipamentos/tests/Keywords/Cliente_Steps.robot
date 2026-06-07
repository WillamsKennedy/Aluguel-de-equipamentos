*** Settings ***
Resource    ../Pages/Cliente_Page.robot
Library     Browser

*** Keywords ***
Acessar A Tela De Clientes
    Click                       ${MENU_CLIENTES}
    Click                       ${BTN_NOVO_CLIENTE}
    Wait For Elements State     ${MODAL_NOVO_CLIENTE}    visible    timeout=10s

Preencher Dados Do Cliente
    [Arguments]    ${nome}    ${email}    ${tipo_doc}    ${documento}    ${telefone}    ${endereco}    ${cep}=
    Select Options By   ${CLI_SELECT_TIPO_DOC}    value    ${tipo_doc}
    Fill Text           ${CLI_INPUT_NOME}         ${nome}
    Fill Text           ${CLI_INPUT_EMAIL}        ${email}
    Fill Text           ${CLI_INPUT_DOCUMENTO}    ${documento}
    Fill Text           ${CLI_INPUT_TELEFONE}     ${telefone}
    Fill Text           ${CLI_INPUT_CEP}          ${cep}
    Fill Text           ${CLI_INPUT_ENDERECO}     ${endereco}

Submeter Cadastro De Cliente
    Click       ${BTN_CADASTRAR_CLIENTE}

Validar Cliente Cadastrado Com Sucesso
    [Arguments]    ${nome}

    ${toast_cliente}=           Set Variable    css=.toast-item.toast-success:has-text("cadastrado!")
    Wait For Elements State     ${toast_cliente}    visible    timeout=10s
    Get Text                    ${toast_cliente}    contains    Cliente "${nome}" cadastrado!

Validar Que O Cadastro Foi Recusado Por CPF Invalido

    Wait For Elements State     css=.toast-item.toast-error    visible    timeout=8s
    Get Text                    css=.toast-item.toast-error    contains    CPF inválido
    Get Element States          css=.toast-item.toast-success:has-text("cadastrado!")    contains    hidden
