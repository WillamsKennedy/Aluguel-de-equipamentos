*** Settings ***
Resource    Login_Steps.robot
Library     Browser

*** Keywords ***
Abrir O Sistema Com Dados Limpos
    New Browser     browser=chromium    headless=False
    New Page        url=http://localhost/Aluguel-de-equipamentos/public/index.html
    Evaluate JavaScript     ${None}    () => window.localStorage.clear()
    Reload
    Wait For Elements State     id=login-card    visible    timeout=10s

Efetuar Login Como Admin
    Preencher Credenciais De Acesso    admin    admin123
    Submeter Formulario De Login
    Wait For Elements State     id=page-title    visible    timeout=10s

Abrir Sistema Limpo E Logar
    Abrir O Sistema Com Dados Limpos
    Efetuar Login Como Admin

Acessar Pagina
    [Arguments]    ${page}
    Click                       css=.nk-menu-item[data-page="${page}"] .nk-menu-link
    Wait For Elements State     id=page-${page}    visible    timeout=10s
