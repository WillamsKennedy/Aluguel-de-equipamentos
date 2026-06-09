*** Variables ***
${BTN_NOVO_EQUIPAMENTO}         css=button[onclick="openModal('modal-novo-equipamento')"]
${MODAL_NOVO_EQUIPAMENTO}       id=modal-novo-equipamento
${EQ_INPUT_NOME}                css=#form-novo-equipamento input[name="nome"]
${EQ_SELECT_CATEGORIA}          css=#form-novo-equipamento select[name="categoria"]
${EQ_INPUT_SERIAL}              css=#form-novo-equipamento input[name="serial"]
${EQ_INPUT_VALOR_DIARIO}        css=#form-novo-equipamento input[name="valor_diario"]
${EQ_INPUT_OBSERVACOES}         css=#form-novo-equipamento textarea[name="obs"]
${BTN_CADASTRAR_EQUIPAMENTO}    css=#modal-novo-equipamento .modal-footer .btn-primary
${EQ_SEARCH}                    id=eq-search
${EQ_COUNT}                     id=eq-count
${EQ_TBODY}                     id=tbody-equipamentos
${MODAL_STATUS}                 id=modal-status-equipamento
${STATUS_SELECT_NOVO}           id=status-eq-novo
${BTN_CONFIRMAR_STATUS}         css=#modal-status-equipamento .modal-footer .btn-primary
