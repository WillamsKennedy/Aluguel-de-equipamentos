*** Variables ***
# ── Navegação / abertura do modal ──────────────────────────────
${MENU_CLIENTES}            css=.nk-menu-item[data-page="clientes"] .nk-menu-link
${BTN_NOVO_CLIENTE}         css=button[onclick="openModal('modal-novo-cliente')"]
${MODAL_NOVO_CLIENTE}       id=modal-novo-cliente

# ── Campos do formulário ───────────────────────────────────────
${CLI_INPUT_NOME}           css=#form-novo-cliente input[name="nome"]
${CLI_INPUT_EMAIL}          css=#form-novo-cliente input[name="email"]
${CLI_SELECT_TIPO_DOC}      id=tipo-doc
${CLI_INPUT_DOCUMENTO}      id=input-documento
${CLI_INPUT_TELEFONE}       css=#form-novo-cliente input[name="telefone"]
${CLI_INPUT_CEP}            css=#form-novo-cliente input[name="cep"]
${CLI_INPUT_ENDERECO}       css=#form-novo-cliente input[name="endereco"]

# ── Ação / confirmação ─────────────────────────────────────────
${BTN_CADASTRAR_CLIENTE}    css=#modal-novo-cliente .modal-footer .btn-primary
${TOAST_SUCESSO}            css=.toast-item.toast-success
