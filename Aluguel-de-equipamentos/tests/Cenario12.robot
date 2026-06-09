*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Reserva_Steps.robot
Library         Browser
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Geracao De Contrato
    Acessar Pagina    reservas
    Filtrar Reservas Pendentes
    Gerar Contrato Da Reserva    res-002
    Validar Contrato Gerado
