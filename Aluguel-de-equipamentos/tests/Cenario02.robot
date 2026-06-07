*** Settings ***
Resource        Keywords/Login_Steps.robot
Resource        Keywords/Cliente_Steps.robot
Library         Browser
Library         String
Test Setup      Abrir O Sistema E Efetuar Login
Test Teardown   Close Browser

*** Keywords ***
Abrir O Sistema E Efetuar Login
    New Browser     browser=chromium    headless=False
    New Page        url=http://localhost/Aluguel-de-equipamentos/public/index.html
    Preencher Credenciais De Acesso    admin    admin123
    Submeter Formulario De Login
    Wait For Elements State     id=page-title    visible    timeout=10s

*** Test Cases ***
Caso de Teste 02: Cadastrar Cliente
    ${sufixo}=    Generate Random String    6    [NUMBERS]
    Acessar A Tela De Clientes
    Preencher Dados Do Cliente
    ...    nome=Cliente De Teste
    ...    email=cliente@exemplo.com
    ...    tipo_doc=cpf
    ...    documento=111.444.777-35
    ...    telefone=(11) 98888-7777
    ...    endereco=Av Agamenom Magalhães, 1052, Recife, Pernambuco
    ...    cep=01001-000
    Submeter Cadastro De Cliente
    Validar Cliente Cadastrado Com Sucesso    Cliente De Teste
