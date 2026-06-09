*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Reserva_Steps.robot
Library         Browser
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Registro De Devolucao
    Abrir Painel De Devolucoes
    Registrar Devolucao    res-001
    Validar Devolucao Registrada
