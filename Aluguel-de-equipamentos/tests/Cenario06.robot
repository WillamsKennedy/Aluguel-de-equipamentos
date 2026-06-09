*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Equipamento_Steps.robot
Library         Browser
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Gerenciamento De Status
    Acessar Pagina    equipamentos
    Alterar Status Do Equipamento    eq-001    manutencao
    Validar Status Alterado
