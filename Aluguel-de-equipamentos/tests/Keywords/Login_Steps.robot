*** Settings ***
Resource    ../Pages/Login_Page.robot
Library     Browser

*** Keywords ***
Preencher Credenciais De Acesso
    [Arguments]    ${email}    ${senha}
    Fill Text      ${INPUT_EMAIL}    ${email}
    Fill Text      ${INPUT_SENHA}    ${senha}

Submeter Formulario De Login
    Click          ${BOTAO_ENTRAR}