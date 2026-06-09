*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Reserva_Steps.robot
Library         Browser
Library         DateTime
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Calculo De Valor
    ${inicio}=    Get Current Date    increment=1 day    result_format=%Y-%m-%d
    ${fim}=       Add Time To Date    ${inicio}    5 days    result_format=%Y-%m-%d
    Acessar Pagina    reservas
    Abrir Formulario De Nova Reserva
    Preencher Reserva    c-001    eq-001    ${inicio}    ${fim}
    Validar Calculo Da Reserva    750,00
