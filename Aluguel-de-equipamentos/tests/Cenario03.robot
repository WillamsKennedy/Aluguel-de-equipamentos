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
Caso de Teste 03: Tipo CNPJ Nao Deve Aceitar Valor De CPF
    Acessar A Tela De Clientes
    Preencher Dados Do Cliente
    ...    nome=Cliente CPF
    ...    email=cnpj.com@exemplo.com
    ...    tipo_doc=cnpj
    ...    documento=529.982.247-25
    ...    telefone=(11) 98888-7777
    ...    endereco=Av Dois Rios, 1072, COHAB, Pernambuco
    ...    cep=01001-000
    Submeter Cadastro De Cliente
    Validar Que O Documento Incompativel Com O Tipo Deve Ser Recusado
