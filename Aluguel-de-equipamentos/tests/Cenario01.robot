*** Settings ***
Resource        Keywords/Login_Steps.robot
Library         Browser
Test Setup      Abrir O Sistema Aluga Facil
Test Teardown   Close Browser

*** Keywords ***
Abrir O Sistema Aluga Facil
    New Browser    browser=chromium    headless=False
    New Page       url=http://localhost/Aluguel-de-equipamentos/public/index.html
*** Test Cases ***
Caso de Teste 01: Login
    [Documentation]  
    Preencher Credenciais De Acesso    admin    admin123
    Submeter Formulario De Login

    Wait For Elements State   id=page-title  visible    timeout=10s