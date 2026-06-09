*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Reserva_Steps.robot
Library         Browser
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Cancelamento De Reserva
    Acessar Pagina    reservas
    Cancelar Reserva    res-001
    Validar Reserva Cancelada
