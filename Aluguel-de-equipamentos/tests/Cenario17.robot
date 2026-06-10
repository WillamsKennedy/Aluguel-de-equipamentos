*** Settings ***
Resource        Keywords/Common_Steps.robot
Resource        Keywords/Reserva_Steps.robot
Library         Browser
Test Setup      Abrir Sistema Limpo E Logar
Test Teardown   Close Browser

*** Test Cases ***
Teste De Processamento De Pagamento
    Acessar Pagina    pagamentos
    Validar Existe Pagamentos
    Validar Detalhes Do Pagamento    PAY-001    res-001    PIX    R$ 400,00    Pago
