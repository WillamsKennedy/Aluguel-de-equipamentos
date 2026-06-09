*** Settings ***
Resource        Keywords/Common_Steps.robot
Library         Browser
Test Setup      Abrir O Sistema Com Dados Limpos
Test Teardown   Close Browser

*** Test Cases ***
Teste De Desempenho Do Sistema
    ${inicio}=    Get Time    epoch
    Preencher Credenciais De Acesso    admin    admin123
    Submeter Formulario De Login
    Wait For Elements State     id=page-title    visible    timeout=15s
    ${fim}=       Get Time    epoch
    ${duracao}=   Evaluate    ${fim} - ${inicio}
    Should Be True    ${duracao} < 15
