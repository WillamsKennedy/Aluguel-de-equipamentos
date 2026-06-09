*** Settings ***
Resource        Keywords/Common_Steps.robot
Library         Browser
Test Setup      Abrir O Sistema Com Dados Limpos
Test Teardown   Close Browser

*** Test Cases ***
Teste De Autenticacao
    Preencher Credenciais De Acesso   ' '    ' '
    Submeter Formulario De Login
    Wait For Elements State     id=page-title    visible    timeout=10s
    Get Text    id=page-title    contains    Dashboard
