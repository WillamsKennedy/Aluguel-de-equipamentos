*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Equipamento_Steps.robot
Library         Browser
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Busca E Filtro
    Acessar Pagina    equipamentos
    Buscar Equipamento    Betoneira
    Validar Quantidade De Equipamentos    1
