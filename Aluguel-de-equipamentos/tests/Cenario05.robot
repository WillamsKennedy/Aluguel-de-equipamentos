*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Equipamento_Steps.robot
Library         Browser
Library         String
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Cadastro De Equipamento
    ${serial}=    Generate Random String    8    [NUMBERS]
    Acessar Pagina    equipamentos
    Cadastrar Equipamento    Furadeira de Impacto    Construção    SN-${serial}    99.90    Equipamento novo
    Validar Equipamento Cadastrado    Furadeira de Impacto
