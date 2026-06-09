*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Cliente_Steps.robot
Resource        Keywords/Cliente_Acoes_Steps.robot
Library         Browser
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Email Unico
    Acessar Pagina    clientes
    Abrir Modal Novo Cliente
    Preencher Dados Do Cliente
    ...    nome=Cliente Original
    ...    email=repetido@exemplo.com
    ...    tipo_doc=cpf
    ...    documento=529.982.247-25
    ...    telefone=(11) 98888-7777
    ...    endereco=Rua A, 10, Centro
    ...    cep=01001-000
    Submeter Cadastro De Cliente
    Validar Cliente Cadastrado Com Sucesso    Cliente Original
    Abrir Modal Novo Cliente
    Preencher Dados Do Cliente
    ...    nome=Cliente Duplicado
    ...    email=repetido@exemplo.com
    ...    tipo_doc=cpf
    ...    documento=111.444.777-35
    ...    telefone=(11) 97777-6666
    ...    endereco=Rua B, 20, Centro
    ...    cep=01002-000
    Submeter Cadastro De Cliente
    Validar Erro De Email Duplicado
