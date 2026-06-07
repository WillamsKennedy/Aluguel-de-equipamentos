/* ============================================================
   Sistema de Aluguel de Equipamentos — app.js
   Navegação, tabelas, modais, gráficos, dados mock
   ============================================================ */

'use strict';

// ── Autenticação (mock — admin / admin123) ──────────────────
const AUTH = {
  // Em produção, esta verificação seria feita no backend via AuthService.php
  // com password_verify() contra um hash bcrypt armazenado no banco.
  usuarios: [
    { usuario: 'admin', senha: 'admin123', nome: 'Admin Geral', papel: 'Administrador', iniciais: 'AD' },
  ],
  storageKey: 'alugafacil:sessao',
  maxTentativas: 5,
  tentativas: 0,
};

// ── Persistência de usuários (localStorage) ─────────────────
const USERS_KEY = 'alugafacil:usuarios';

function carregarUsuarios() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return;
    const lista = JSON.parse(raw);
    if (Array.isArray(lista) && lista.length) {
      // Garante que o admin padrão sempre exista
      const temAdmin = lista.some(u => u.usuario === 'admin');
      AUTH.usuarios = temAdmin ? lista : [AUTH.usuarios[0], ...lista];
    }
  } catch (_) {}
}

function salvarUsuarios() {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(AUTH.usuarios)); } catch (_) {}
}

function getSessao() {
  try {
    const raw = sessionStorage.getItem(AUTH.storageKey) || localStorage.getItem(AUTH.storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function setSessao(usuario, lembrar) {
  const dados = {
    usuario: usuario.usuario,
    nome: usuario.nome,
    papel: usuario.papel,
    iniciais: usuario.iniciais,
    logadoEm: new Date().toISOString(),
  };
  const json = JSON.stringify(dados);
  // sessionStorage sempre; localStorage só se "lembrar-me" marcado
  sessionStorage.setItem(AUTH.storageKey, json);
  if (lembrar) localStorage.setItem(AUTH.storageKey, json);
  else localStorage.removeItem(AUTH.storageKey);
}

function limparSessao() {
  sessionStorage.removeItem(AUTH.storageKey);
  localStorage.removeItem(AUTH.storageKey);
}

function mostrarLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app-root').classList.add('is-hidden');
  // Garante que o card de login esteja visível e o de cadastro oculto
  const lc = document.getElementById('login-card');
  const cc = document.getElementById('cadastro-card');
  if (lc) lc.style.display = 'block';
  if (cc) cc.style.display = 'none';
  // Foco automático no campo de usuário
  setTimeout(() => document.getElementById('login-usuario')?.focus(), 50);
}

function mostrarApp(sessao) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-root').classList.remove('is-hidden');
  // Atualiza dados do usuário na sidebar e topbar
  const el = (id) => document.getElementById(id);
  if (el('header-user-avatar')) el('header-user-avatar').textContent = sessao.iniciais;
  if (el('header-user-name'))   el('header-user-name').textContent   = sessao.nome.split(' ')[0];
  if (el('dropdown-user-name')) el('dropdown-user-name').textContent = sessao.nome;
  if (el('dropdown-user-role')) el('dropdown-user-role').textContent = sessao.papel;
  // Sidebar footer
  document.querySelectorAll('.nk-sidebar-avatar').forEach(a => a.textContent = sessao.iniciais);
  document.querySelectorAll('.nk-sidebar-user-name').forEach(a => a.textContent = sessao.nome);
  document.querySelectorAll('.nk-sidebar-user-role').forEach(a => a.textContent = sessao.papel);
}

function mostrarAlertaLogin(msg) {
  const al = document.getElementById('login-alert');
  document.getElementById('login-alert-msg').textContent = msg;
  al.classList.add('show');
}

function ocultarAlertaLogin() {
  document.getElementById('login-alert')?.classList.remove('show');
}

function fazerLogin(e) {
  e.preventDefault();
  ocultarAlertaLogin();

  const usuario = document.getElementById('login-usuario').value.trim();
  const senha   = document.getElementById('login-senha').value;
  const lembrar = document.getElementById('login-lembrar').checked;
  const btn     = document.getElementById('btn-login-submit');

  if (AUTH.tentativas >= AUTH.maxTentativas) {
    mostrarAlertaLogin('Muitas tentativas falhas. Recarregue a página para tentar novamente.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Entrando...';

  // Simula latência (como faria uma chamada HTTP)
  setTimeout(() => {
    const u = AUTH.usuarios.find(x => x.usuario === usuario && x.senha === senha);
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Entrar';

    if (!u) {
      AUTH.tentativas++;
      const restantes = AUTH.maxTentativas - AUTH.tentativas;
      mostrarAlertaLogin(
        restantes > 0
          ? `Usuário ou senha inválidos. Tentativas restantes: ${restantes}.`
          : 'Conta bloqueada após 5 tentativas falhas. Recarregue a página.'
      );
      document.getElementById('login-senha').value = '';
      document.getElementById('login-senha').focus();
      return;
    }

    AUTH.tentativas = 0;
    setSessao(u, lembrar);
    mostrarApp(getSessao());
    document.getElementById('form-login').reset();
    init();
    NioApp.Toast(`Bem-vindo(a), ${u.nome}!`, 'success');
  }, 600);
}

function fazerLogout() {
  if (!confirm('Deseja realmente sair do sistema?')) return;
  limparSessao();
  document.getElementById('user-dropdown')?.classList.remove('show');
  mostrarLogin();
  NioApp.Toast('Sessão encerrada com sucesso.', 'info');
}

function togglePasswordLogin() {
  const inp  = document.getElementById('login-senha');
  const icon = document.getElementById('icon-eye');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.classList.replace('bi-eye', 'bi-eye-slash');
  } else {
    inp.type = 'password';
    icon.classList.replace('bi-eye-slash', 'bi-eye');
  }
}

function toggleUserDropdown(e) {
  e?.stopPropagation();
  document.getElementById('user-dropdown')?.classList.toggle('show');
}

// ── Cadastro de novo usuário ─────────────────────────────────
function mostrarCadastro() {
  ocultarAlertaLogin();
  ocultarAlertaCadastro();
  document.getElementById('login-card').style.display = 'none';
  document.getElementById('cadastro-card').style.display = 'block';
  setTimeout(() => document.getElementById('cad-nome')?.focus(), 50);
}

function mostrarFormLogin() {
  ocultarAlertaCadastro();
  document.getElementById('cadastro-card').style.display = 'none';
  document.getElementById('login-card').style.display = 'block';
  setTimeout(() => document.getElementById('login-usuario')?.focus(), 50);
}

function ocultarAlertaCadastro() {
  document.getElementById('cadastro-alert')?.classList.remove('show');
}

function mostrarAlertaCadastro(msg) {
  const al = document.getElementById('cadastro-alert');
  document.getElementById('cadastro-alert-msg').textContent = msg;
  al.classList.add('show');
}

function togglePasswordCadastro(campoId, iconId) {
  const inp = document.getElementById(campoId);
  const ic  = document.getElementById(iconId);
  if (inp.type === 'password') { inp.type = 'text';  ic.classList.replace('bi-eye', 'bi-eye-slash'); }
  else                          { inp.type = 'password'; ic.classList.replace('bi-eye-slash', 'bi-eye'); }
}

function fazerCadastro(e) {
  e.preventDefault();
  ocultarAlertaCadastro();

  const nome  = document.getElementById('cad-nome').value.trim();
  const user  = document.getElementById('cad-usuario').value.trim();
  const senha = document.getElementById('cad-senha').value;
  const conf  = document.getElementById('cad-senha2').value;

  if (nome.length < 3) { mostrarAlertaCadastro('Informe seu nome completo (mín. 3 caracteres).'); return; }
  if (!/^[A-Za-z0-9._-]{3,}$/.test(user)) {
    mostrarAlertaCadastro('Usuário deve ter ≥ 3 caracteres: letras, números, ponto, hífen ou _.'); return;
  }
  if (AUTH.usuarios.some(u => u.usuario.toLowerCase() === user.toLowerCase())) {
    mostrarAlertaCadastro('Este nome de usuário já está em uso.'); return;
  }
  if (senha.length < 6) { mostrarAlertaCadastro('A senha deve ter no mínimo 6 caracteres.'); return; }
  if (senha !== conf)   { mostrarAlertaCadastro('As senhas não conferem.'); return; }

  const btn = document.getElementById('btn-cadastro-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Cadastrando...';

  setTimeout(() => {
    AUTH.usuarios.push({
      usuario: user, senha, nome, papel: 'Operador', iniciais: initials(nome),
    });
    salvarUsuarios();
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-person-plus"></i> Criar conta';
    document.getElementById('form-cadastro').reset();
    mostrarFormLogin();
    document.getElementById('login-usuario').value = user;
    document.getElementById('login-senha').focus();
    NioApp.Toast(`Conta "${user}" criada com sucesso! Faça login.`, 'success');
  }, 600);
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  const dd = document.getElementById('user-dropdown');
  const hu = document.getElementById('header-user');
  if (dd && hu && !hu.contains(e.target)) dd.classList.remove('show');
});

// ── Dados mock (simulam respostas da API PHP) ───────────────

const DB = {
  equipamentos: [
    { id:'eq-001', nome:'Betoneira 400L',       serial:'SN-2024-001', categoria:'Construção',   diaria:150.00, status:'disponivel'  },
    { id:'eq-002', nome:'Andaime Tubular 6m',   serial:'SN-2024-002', categoria:'Construção',   diaria: 80.00, status:'reservado'   },
    { id:'eq-003', nome:'Retroescavadeira',      serial:'SN-2024-003', categoria:'Terraplanagem',diaria:900.00, status:'disponivel'  },
    { id:'eq-004', nome:'Compactador de Solo',   serial:'SN-2024-004', categoria:'Terraplanagem',diaria:200.00, status:'manutencao'  },
    { id:'eq-005', nome:'Gerador 15kVA',         serial:'SN-2024-005', categoria:'Elétrica',    diaria:350.00, status:'disponivel'  },
    { id:'eq-006', nome:'Serra Circular 10"',    serial:'SN-2024-006', categoria:'Madeireira',  diaria: 90.00, status:'disponivel'  },
    { id:'eq-007', nome:'Martelete SDS Max',     serial:'SN-2024-007', categoria:'Construção',  diaria: 75.00, status:'reservado'   },
    { id:'eq-008', nome:'Rompedor Hidráulico',   serial:'SN-2024-008', categoria:'Hidráulica',  diaria:450.00, status:'disponivel'  },
    { id:'eq-009', nome:'Placa Vibratória',      serial:'SN-2024-009', categoria:'Terraplanagem',diaria:120.00, status:'disponivel'  },
    { id:'eq-010', nome:'Bomba d\'Água 3"',      serial:'SN-2024-010', categoria:'Hidráulica',  diaria: 95.00, status:'disponivel'  },
    { id:'eq-011', nome:'Corte e Dobra Ferro',   serial:'SN-2024-011', categoria:'Construção',  diaria:180.00, status:'disponivel'  },
    { id:'eq-012', nome:'Andaime Fachadeiro',    serial:'SN-2024-012', categoria:'Construção',  diaria: 60.00, status:'reservado'   },
  ],
  clientes: [
    { id:'c-001', nome:'Carlos Pereira',       email:'carlos@construtora.com', doc:'529.982.247-25', tipo:'cpf',  tel:'(11) 91234-5678', reservas:5, ativo:true  },
    { id:'c-002', nome:'Ana Lima',             email:'ana.lima@gmail.com',     doc:'111.444.777-35', tipo:'cpf',  tel:'(11) 90000-1234', reservas:2, ativo:true  },
    { id:'c-003', nome:'Construtora Alfa Ltda',email:'contato@alfa.com',       doc:'11.222.333/0001-81',tipo:'cnpj',tel:'(11) 3000-5555', reservas:8, ativo:true  },
    { id:'c-004', nome:'João Souza',           email:'jsouza@hotmail.com',     doc:'222.333.444-54', tipo:'cpf',  tel:'(11) 98765-0001', reservas:1, ativo:false },
    { id:'c-005', nome:'Aterros & Cia',        email:'aterros@empresa.com',    doc:'34.428.651/0001-06',tipo:'cnpj',tel:'(21) 2200-0001', reservas:3, ativo:true  },
    { id:'c-006', nome:'Fernanda Costa',       email:'fercosta@email.com',     doc:'333.444.555-60', tipo:'cpf',  tel:'(11) 97000-2222', reservas:0, ativo:true  },
    { id:'c-007', nome:'Marcos Oliveira',      email:'marcos.eng@gmail.com',   doc:'444.555.666-34', tipo:'cpf',  tel:'(11) 96000-3333', reservas:4, ativo:true  },
  ],
  reservas: [
    { id:'res-001', cliente_id:'c-001', equip_id:'eq-002', inicio:'2024-02-01', fim:'2024-02-06', total:400.00,  caucao:80.00,  assinado:true,  status:'ativa'     },
    { id:'res-002', cliente_id:'c-003', equip_id:'eq-007', inicio:'2024-02-03', fim:'2024-02-10', total:525.00,  caucao:105.00, assinado:false, status:'pendente'  },
    { id:'res-003', cliente_id:'c-002', equip_id:'eq-012', inicio:'2024-02-05', fim:'2024-02-08', total:180.00,  caucao:36.00,  assinado:true,  status:'ativa'     },
    { id:'res-004', cliente_id:'c-005', equip_id:'eq-003', inicio:'2024-01-10', fim:'2024-01-15', total:4500.00, caucao:900.00, assinado:true,  status:'concluida' },
    { id:'res-005', cliente_id:'c-007', equip_id:'eq-001', inicio:'2024-01-20', fim:'2024-01-23', total:450.00,  caucao:90.00,  assinado:true,  status:'concluida' },
    { id:'res-006', cliente_id:'c-004', equip_id:'eq-005', inicio:'2024-01-15', fim:'2024-01-17', total:700.00,  caucao:140.00, assinado:false, status:'cancelada' },
  ],
  pagamentos: [
    { ref:'PAY-001', reserva:'res-001', metodo:'PIX',    valor:400.00,  status:'pago',     data:'01/02/2024' },
    { ref:'PAY-002', reserva:'res-001', metodo:'PIX',    valor: 80.00,  status:'pago',     data:'01/02/2024' },
    { ref:'PAY-003', reserva:'res-003', metodo:'Cartão', valor:180.00,  status:'pago',     data:'05/02/2024' },
    { ref:'PAY-004', reserva:'res-002', metodo:'Boleto', valor:525.00,  status:'pendente', data:'03/02/2024' },
    { ref:'PAY-005', reserva:'res-004', metodo:'PIX',    valor:4500.00, status:'pago',     data:'10/01/2024' },
    { ref:'PAY-006', reserva:'res-006', metodo:'Cartão', valor:700.00,  status:'cancelado',data:'15/01/2024' },
  ],
  contratos: [
    { id:'CTR-001', reserva:'res-001', cliente:'Carlos Pereira',      gerado:'01/02/2024', assinado:true  },
    { id:'CTR-002', reserva:'res-003', cliente:'Ana Lima',            gerado:'05/02/2024', assinado:true  },
    { id:'CTR-003', reserva:'res-004', cliente:'Aterros & Cia',       gerado:'10/01/2024', assinado:true  },
    { id:'CTR-004', reserva:'res-005', cliente:'Marcos Oliveira',     gerado:'20/01/2024', assinado:true  },
  ],
};

// ── Persistência dos dados (localStorage) ───────────────────
// Garante que toda alteração (cadastro, edição, status, exclusão,
// devolução, etc.) seja real e sobreviva ao recarregar a página.
const DB_KEY = 'alugafacil:db';

function salvarDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify({
      equipamentos: DB.equipamentos,
      clientes:     DB.clientes,
      reservas:     DB.reservas,
      pagamentos:   DB.pagamentos,
      contratos:    DB.contratos,
      atividades:   activities,
    }));
  } catch (_) {}
}

function carregarDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    ['equipamentos', 'clientes', 'reservas', 'pagamentos', 'contratos'].forEach(k => {
      if (Array.isArray(d[k])) DB[k] = d[k];
    });
    if (Array.isArray(d.atividades)) {
      activities.length = 0;
      activities.push(...d.atividades);
    }
  } catch (_) {}
}

// ── Estado atual dos filtros ────────────────────────────────
let state = {
  eqFilter: 'todos',
  cliFilter: 'ativos',
  resFilter: 'ativa',
};

// ── Geração de IDs sem colisão (baseada no maior nº existente) ─
function nextId(prefix, arr, width = 3) {
  let max = 0;
  arr.forEach(o => {
    const n = parseInt(String(o.id).replace(/\D/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return prefix + String(max + 1).padStart(width, '0');
}

// ── Helpers ─────────────────────────────────────────────────
function fmtMoeda(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function fmtData(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function avatarColor(nome) {
  const cols = ['avatar-a','avatar-b','avatar-c','avatar-d','avatar-e','avatar-f','avatar-g','avatar-h'];
  return cols[(nome.charCodeAt(0) + (nome.charCodeAt(1)||0)) % cols.length];
}
function initials(nome) {
  return nome.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('').toUpperCase();
}
function badgeStatus(s) {
  const map = {
    disponivel: ['badge-disponivel','Disponível'],
    reservado:  ['badge-reservado', 'Reservado'],
    manutencao: ['badge-manutencao','Em Manutenção'],
    avariado:   ['badge-avariado',  'Avariado'],
    ativa:      ['badge-disponivel','Ativa'],
    pendente:   ['badge-pendente',  'Aguard. Contrato'],
    concluida:  ['badge-inativo',   'Concluída'],
    cancelada:  ['badge-cancelado', 'Cancelada'],
    pago:       ['badge-pago',      'Pago'],
    cancelado:  ['badge-cancelado', 'Cancelado'],
    ativo:      ['badge-ativo',     'Ativo'],
    inativo:    ['badge-inativo',   'Inadimplente'],
  };
  const [cls, label] = map[s] || ['badge-inativo', s];
  return `<span class="badge-status ${cls}">${label}</span>`;
}
function clienteById(id) { return DB.clientes.find(c=>c.id===id); }
function equipById(id)   { return DB.equipamentos.find(e=>e.id===id); }

// ── NioApp Toast ─────────────────────────────────────────────
window.NioApp = {
  Toast(msg, tipo='success') {
    const icons = { success:'bi-check-circle-fill', error:'bi-x-circle-fill', info:'bi-info-circle-fill', warning:'bi-exclamation-triangle-fill' };
    const t = document.createElement('div');
    t.className = `toast-item toast-${tipo==='error'?'error':tipo}`;
    t.innerHTML = `
      <i class="bi ${icons[tipo]||icons.info} toast-icon"></i>
      <span class="toast-msg">${msg}</span>
      <button class="toast-close" onclick="this.closest('.toast-item').remove()"><i class="bi bi-x"></i></button>`;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(30px)'; t.style.transition='all .4s'; setTimeout(()=>t.remove(),400); }, 4000);
  }
};

// ── Loading ──────────────────────────────────────────────────
function showLoading(show=true) {
  document.getElementById('ub-loading').style.display = show ? 'flex' : 'none';
}

// ── Navegação ────────────────────────────────────────────────
function navigateTo(page) {
  // Esconde todas as páginas
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  // Ativa a página
  const el = document.getElementById('page-'+page);
  if (el) el.classList.add('active');

  // Sidebar active
  document.querySelectorAll('.nk-menu-item').forEach(i=>i.classList.remove('active'));
  const li = document.querySelector(`.nk-menu-item[data-page="${page}"]`);
  if (li) li.classList.add('active');

  // Título topbar
  const titles = {
    dashboard:'Dashboard', equipamentos:'Equipamentos', clientes:'Clientes',
    reservas:'Reservas', pagamentos:'Pagamentos', contratos:'Contratos',
    relatorios:'Relatórios', configuracoes:'Configurações'
  };
  document.getElementById('page-title').textContent = titles[page] || page;

  // Inicializar conteúdo da página se necessário
  if (page==='dashboard')    { atualizarPainelAdmin(); renderDashboardReservas(); }
  if (page==='equipamentos') renderEquipamentos();
  if (page==='clientes')     renderClientes();
  if (page==='reservas')     renderReservas();
  if (page==='pagamentos')   renderPagamentos();
  if (page==='contratos')    renderContratos();
  if (page==='relatorios')   initRelatoriosCharts();

  // Fechar sidebar no mobile
  if (window.innerWidth < 993) closeSidebar();
}

// ── Sidebar mobile ───────────────────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('nk-sidebar');
  const ov = document.getElementById('sidebar-overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('nk-sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}
document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

// ── Modais ───────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

function abrirModalNovaReserva() {
  popularSelectsReserva();
  openModal('modal-nova-reserva');
}
// Fechar ao clicar fora
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
    document.body.style.overflow = '';
  }
});

// ── TABELA: Equipamentos ─────────────────────────────────────
function renderEquipamentos(filter=state.eqFilter, search='') {
  const tbody = document.getElementById('tbody-equipamentos');
  const q = search.toLowerCase();
  const cat = document.getElementById('eq-cat-filter')?.value || '';

  let dados = DB.equipamentos.filter(e => {
    if (filter!=='todos' && e.status!==filter) return false;
    if (cat && e.categoria!==cat) return false;
    if (q && !e.nome.toLowerCase().includes(q) && !e.serial.toLowerCase().includes(q)) return false;
    return true;
  });

  tbody.innerHTML = dados.map(e => `
    <tr class="nk-tb-item" id="row-eq-${e.id}">
      <td class="nk-tb-col"><input type="checkbox" class="eq-check" value="${e.id}"></td>
      <td class="nk-tb-col">
        <div class="nk-user-info">
          <div class="nk-user-avatar ${avatarColor(e.nome)}" style="border-radius:var(--radius)">
            <i class="bi bi-tools" style="font-size:14px"></i>
          </div>
          <div>
            <div class="nk-user-name">${e.nome}</div>
            <div class="nk-user-sub">${e.categoria}</div>
          </div>
        </div>
      </td>
      <td class="nk-tb-col"><code style="font-size:12px;background:var(--body-bg);padding:2px 8px;border-radius:4px">${e.serial}</code></td>
      <td class="nk-tb-col">${e.categoria}</td>
      <td class="nk-tb-col"><strong>${fmtMoeda(e.diaria)}</strong><span class="text-soft fs-xs">/dia</span></td>
      <td class="nk-tb-col">${badgeStatus(e.status)}</td>
      <td class="nk-tb-col text-end">
        <div class="nk-tb-actions">
          <button class="btn btn-light btn-sm btn-icon" title="Alterar Status" onclick="abrirModalStatus('${e.id}')">
            <i class="bi bi-arrow-repeat"></i>
          </button>
          <button class="btn btn-outline-primary btn-sm btn-icon" title="Editar" onclick="abrirEditEquip('${e.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-light btn-sm btn-icon" title="Excluir" onclick="confirmarExclusao('${e.id}','equip')">
            <i class="bi bi-trash3" style="color:var(--cor-perigo)"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');

  document.getElementById('eq-count').textContent = dados.length;
}

function filtrarEquipamentos(filter, btn) {
  state.eqFilter = filter;
  document.querySelectorAll('#eq-filter-bar .filter-chip').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderEquipamentos(filter, document.getElementById('eq-search').value);
}
function searchEquipamentos(q) {
  renderEquipamentos(state.eqFilter, q);
}

// ── TABELA: Clientes ─────────────────────────────────────────
function renderClientes(filter=state.cliFilter, search='') {
  const tbody = document.getElementById('tbody-clientes');
  const q = search.toLowerCase();

  let dados = DB.clientes.filter(c => {
    if (filter==='ativos'   && !c.ativo)  return false;
    if (filter==='inativos' && c.ativo)   return false;
    if (q && !c.nome.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.doc.includes(q)) return false;
    return true;
  });

  tbody.innerHTML = dados.map(c => `
    <tr class="nk-tb-item" id="row-cli-${c.id}">
      <td class="nk-tb-col">
        <div class="nk-user-info">
          <div class="nk-user-avatar ${avatarColor(c.nome)}">${initials(c.nome)}</div>
          <div>
            <div class="nk-user-name">${c.nome}</div>
            <div class="nk-user-sub">${c.email}</div>
          </div>
        </div>
      </td>
      <td class="nk-tb-col">
        <div style="font-size:13px">${c.doc}</div>
        <div class="text-soft fs-xs">${c.tipo.toUpperCase()}</div>
      </td>
      <td class="nk-tb-col">${c.tel}</td>
      <td class="nk-tb-col">
        <div class="fw-semibold">${c.reservas}</div>
        <div class="text-soft fs-xs">reservas</div>
      </td>
      <td class="nk-tb-col">${badgeStatus(c.ativo?'ativo':'inativo')}</td>
      <td class="nk-tb-col text-end">
        <div class="nk-tb-actions">
          <button class="btn btn-light btn-sm btn-icon" title="Ver reservas" onclick="verReservasCliente('${c.id}')">
            <i class="bi bi-calendar2-week"></i>
          </button>
          <button class="btn btn-outline-primary btn-sm btn-icon" title="Editar" onclick="abrirEditCliente('${c.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-light btn-sm btn-icon" title="${c.ativo?'Bloquear':'Ativar'}" onclick="toggleClienteAtivo('${c.id}')">
            <i class="bi bi-${c.ativo?'slash-circle':'check-circle'}" style="color:${c.ativo?'var(--cor-aviso)':'var(--cor-sucesso)'}"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');

  document.getElementById('cli-count').textContent = dados.length;
}

function filtrarClientes(filter, btn) {
  state.cliFilter = filter;
  document.querySelectorAll('#page-clientes .filter-chip').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderClientes(filter, document.getElementById('cli-search').value);
}
function searchClientes(q) { renderClientes(state.cliFilter, q); }
function toggleClienteAtivo(id) {
  const c = DB.clientes.find(x=>x.id===id);
  if (!c) return;
  c.ativo = !c.ativo;
  salvarDB();
  renderClientes(state.cliFilter, document.getElementById('cli-search')?.value || '');
  NioApp.Toast(`Cliente ${c.ativo?'ativado':'bloqueado'} com sucesso!`, c.ativo?'success':'warning');
}
function verReservasCliente(clienteId) {
  navigateTo('reservas');
  // Ativa a aba "Todas" e filtra pelas reservas deste cliente
  const tabs = document.querySelectorAll('.nk-tabs .nk-tab-btn');
  tabs.forEach(b => b.classList.remove('active'));
  if (tabs.length) tabs[tabs.length - 1].classList.add('active');
  state.resFilter = 'todas';
  renderReservas('todas', clienteId);
  const cli = clienteById(clienteId);
  if (cli) NioApp.Toast(`Exibindo reservas de ${cli.nome}.`, 'info');
}

// Atualiza os contadores das abas de Reservas
function atualizarContadoresReservas() {
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('tab-count-ativas',    DB.reservas.filter(r => r.status === 'ativa').length);
  set('tab-count-pendentes', DB.reservas.filter(r => r.status === 'pendente').length);
}

// ── TABELA: Reservas ─────────────────────────────────────────
function renderReservas(filter=state.resFilter, clienteId=null) {
  state.resFilter = filter;
  const tbody = document.getElementById('tbody-reservas');
  atualizarContadoresReservas();

  let dados = DB.reservas.filter(r => {
    if (clienteId && r.cliente_id !== clienteId) return false;
    if (filter==='todas') return true;
    return r.status === filter;
  });

  tbody.innerHTML = dados.map(r => {
    const cli = clienteById(r.cliente_id);
    const eq  = equipById(r.equip_id);
    return `
    <tr class="nk-tb-item" id="row-res-${r.id}">
      <td class="nk-tb-col">
        <div class="fw-semibold" style="font-size:13px">${r.id}</div>
        <div class="text-soft fs-xs">Criada em ${fmtData(r.inicio)}</div>
      </td>
      <td class="nk-tb-col">
        <div class="nk-user-info">
          <div class="nk-user-avatar ${avatarColor(cli?.nome||'X')}" style="width:30px;height:30px;font-size:11px">${initials(cli?.nome||'?')}</div>
          <span style="font-size:13px">${cli?.nome||'—'}</span>
        </div>
      </td>
      <td class="nk-tb-col">
        <div style="font-size:13px">${eq?.nome||'—'}</div>
        <div class="text-soft fs-xs">${eq?.categoria||''}</div>
      </td>
      <td class="nk-tb-col">
        <div style="font-size:13px">${fmtData(r.inicio)} → ${fmtData(r.fim)}</div>
        <div class="text-soft fs-xs">${calcDias(r.inicio,r.fim)} dias</div>
      </td>
      <td class="nk-tb-col"><strong>${fmtMoeda(r.total)}</strong></td>
      <td class="nk-tb-col"><span style="font-size:13px">${fmtMoeda(r.caucao)}</span></td>
      <td class="nk-tb-col">
        ${r.assinado
          ? '<span class="badge-status badge-ativo"><i class="bi bi-check2-circle"></i> Assinado</span>'
          : '<span class="badge-status badge-pendente"><i class="bi bi-clock"></i> Pendente</span>'}
      </td>
      <td class="nk-tb-col text-end">
        <div class="nk-tb-actions">
          <button class="btn btn-light btn-sm" onclick="verDetalheReserva('${r.id}')">
            <i class="bi bi-eye"></i> Ver
          </button>
          ${r.status==='ativa'?`
          <button class="btn btn-light btn-sm btn-icon" title="Cancelar" onclick="cancelarReserva('${r.id}')">
            <i class="bi bi-x-circle" style="color:var(--cor-perigo)"></i>
          </button>`:
          r.status==='pendente'?`
          <button class="btn btn-primary btn-sm" onclick="gerarContratoReserva('${r.id}')">
            <i class="bi bi-file-pdf"></i> Contrato
          </button>`:''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filtrarReservas(filter, btn) {
  const map = { ativas:'ativa', pendentes:'pendente', concluidas:'concluida', canceladas:'cancelada', todas:'todas' };
  const f = map[filter] || 'todas';
  state.resFilter = f;
  document.querySelectorAll('.nk-tabs .nk-tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderReservas(f);
}

function calcDias(inicio, fim) {
  const d1 = new Date(inicio), d2 = new Date(fim);
  return Math.round((d2-d1)/(1000*60*60*24));
}

function verDetalheReserva(id) {
  const r = DB.reservas.find(x=>x.id===id);
  if (!r) return;
  const cli = clienteById(r.cliente_id);
  const eq  = equipById(r.equip_id);

  document.getElementById('modal-detalhe-reserva-body').innerHTML = `
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div>
        <div class="text-soft fs-xs mb-1">CLIENTE</div>
        <div class="fw-bold">${cli?.nome||'—'}</div>
        <div class="text-soft fs-sm">${cli?.email||''}</div>
        <div class="text-soft fs-sm">${cli?.tel||''}</div>
      </div>
      <div>
        <div class="text-soft fs-xs mb-1">EQUIPAMENTO</div>
        <div class="fw-bold">${eq?.nome||'—'}</div>
        <div class="text-soft fs-sm">${eq?.serial||''} · ${eq?.categoria||''}</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
      <div><div class="text-soft fs-xs">Início</div><div class="fw-semibold">${fmtData(r.inicio)}</div></div>
      <div><div class="text-soft fs-xs">Fim</div><div class="fw-semibold">${fmtData(r.fim)}</div></div>
      <div><div class="text-soft fs-xs">Dias</div><div class="fw-semibold">${calcDias(r.inicio,r.fim)}</div></div>
      <div><div class="text-soft fs-xs">Status</div>${badgeStatus(r.status)}</div>
    </div>
    <div class="divider"></div>
    <div class="grid" style="grid-template-columns:1fr 1fr 1fr;gap:12px">
      <div style="background:var(--cor-primaria-light);padding:14px;border-radius:var(--radius);text-align:center">
        <div class="text-soft fs-xs">Valor Total</div>
        <div class="fw-bold" style="font-size:18px;color:var(--cor-primaria)">${fmtMoeda(r.total)}</div>
      </div>
      <div style="background:var(--cor-aviso-light);padding:14px;border-radius:var(--radius);text-align:center">
        <div class="text-soft fs-xs">Caução (20%)</div>
        <div class="fw-bold" style="font-size:18px;color:#d49a09">${fmtMoeda(r.caucao)}</div>
      </div>
      <div style="background:${r.assinado?'var(--cor-sucesso-light)':'var(--cor-aviso-light)'};padding:14px;border-radius:var(--radius);text-align:center">
        <div class="text-soft fs-xs">Contrato</div>
        <div class="fw-bold" style="font-size:15px;color:${r.assinado?'#0cb88a':'#d49a09'}">${r.assinado?'✔ Assinado':'⏳ Pendente'}</div>
      </div>
    </div>`;

  document.getElementById('btn-gerar-contrato').style.display = r.assinado ? 'none' : 'inline-flex';
  document.getElementById('btn-gerar-contrato').dataset.reservaId = id;
  openModal('modal-detalhe-reserva');
}

function gerarContrato() {
  const id = document.getElementById('btn-gerar-contrato').dataset.reservaId;
  const r  = DB.reservas.find(x=>x.id===id);
  if (!r) return;
  showLoading(true);
  setTimeout(()=>{
    r.assinado = true;
    if (r.status === 'pendente') r.status = 'ativa';
    if (!DB.contratos.some(c => c.reserva === r.id)) {
      DB.contratos.push({
        id: nextId('CTR-', DB.contratos),
        reserva: r.id,
        cliente: clienteById(r.cliente_id)?.nome || '—',
        gerado: new Date().toLocaleDateString('pt-BR'),
        assinado: true,
      });
    }
    salvarDB();
    showLoading(false);
    closeModal('modal-detalhe-reserva');
    renderReservas();
    atualizarPainelAdmin();
    NioApp.Toast('Contrato gerado e assinado com sucesso!', 'success');
  }, 1400);
}
function gerarContratoReserva(id) {
  const r = DB.reservas.find(x=>x.id===id);
  if (!r) return;
  showLoading(true);
  setTimeout(()=>{
    r.assinado = true;
    if (r.status === 'pendente') r.status = 'ativa';
    if (!DB.contratos.some(c => c.reserva === r.id)) {
      DB.contratos.push({
        id: nextId('CTR-', DB.contratos),
        reserva: r.id,
        cliente: clienteById(r.cliente_id)?.nome || '—',
        gerado: new Date().toLocaleDateString('pt-BR'),
        assinado: true,
      });
    }
    salvarDB();
    showLoading(false);
    renderReservas();
    atualizarPainelAdmin();
    NioApp.Toast('Contrato gerado!', 'success');
  }, 1200);
}

function cancelarReserva(id) {
  if (!confirm('Cancelar esta reserva? Caso seja menos de 48h antes do início, a caução será retida.')) return;
  const r = DB.reservas.find(x=>x.id===id);
  if (r) {
    r.status = 'cancelada';
    // Libera o equipamento se estava reservado para esta reserva
    const eq = equipById(r.equip_id);
    if (eq && eq.status === 'reservado') eq.status = 'disponivel';
    salvarDB();
    renderReservas();
    renderEquipamentos();
    atualizarPainelAdmin();
    NioApp.Toast('Reserva cancelada.', 'warning');
  }
}

// ── TABELA: Pagamentos ────────────────────────────────────────
function renderPagamentos() {
  const icons = { PIX:'bi-qr-code-scan', Cartão:'bi-credit-card', Boleto:'bi-receipt' };
  document.getElementById('tbody-pagamentos').innerHTML = DB.pagamentos.map(p => `
    <tr class="nk-tb-item">
      <td class="nk-tb-col"><code style="font-size:12px;background:var(--body-bg);padding:2px 8px;border-radius:4px">${p.ref}</code></td>
      <td class="nk-tb-col">${p.reserva}</td>
      <td class="nk-tb-col">
        <div class="d-flex align-center gap-2">
          <i class="bi ${icons[p.metodo]||'bi-cash'}" style="font-size:16px;color:var(--cor-primaria)"></i>
          ${p.metodo}
        </div>
      </td>
      <td class="nk-tb-col"><strong>${fmtMoeda(p.valor)}</strong></td>
      <td class="nk-tb-col">${badgeStatus(p.status)}</td>
      <td class="nk-tb-col text-soft">${p.data}</td>
    </tr>`).join('');
}

// ── TABELA: Contratos ─────────────────────────────────────────
function renderContratos() {
  document.getElementById('tbody-contratos').innerHTML = DB.contratos.map(c => `
    <tr class="nk-tb-item">
      <td class="nk-tb-col"><code style="font-size:12px;background:var(--body-bg);padding:2px 8px;border-radius:4px">${c.id}</code></td>
      <td class="nk-tb-col">${c.reserva}</td>
      <td class="nk-tb-col">${c.cliente}</td>
      <td class="nk-tb-col text-soft">${c.gerado}</td>
      <td class="nk-tb-col">${c.assinado?badgeStatus('ativo'):badgeStatus('pendente')}</td>
      <td class="nk-tb-col text-end">
        <div class="nk-tb-actions">
          <button class="btn btn-light btn-sm"><i class="bi bi-download"></i> PDF</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── Modal: Alterar Status Equipamento ────────────────────────
const TRANSITIONS = {
  disponivel:  ['reservado','manutencao','avariado'],
  reservado:   ['disponivel','avariado'],
  manutencao:  ['disponivel','avariado'],
  avariado:    ['manutencao'],
};
const STATUS_LABELS = { disponivel:'Disponível', reservado:'Reservado', manutencao:'Em Manutenção', avariado:'Avariado' };

function abrirModalStatus(id) {
  const eq = DB.equipamentos.find(e=>e.id===id);
  if (!eq) return;
  document.getElementById('status-eq-id').value   = id;
  document.getElementById('status-eq-nome').textContent = eq.nome;
  document.getElementById('status-eq-atual').innerHTML  = badgeStatus(eq.status);

  const sel = document.getElementById('status-eq-novo');
  sel.innerHTML = '<option value="">Selecione...</option>' +
    (TRANSITIONS[eq.status]||[]).map(s=>`<option value="${s}">${STATUS_LABELS[s]}</option>`).join('');

  document.getElementById('status-eq-obs').value = '';
  openModal('modal-status-equipamento');
}

function confirmarAlteracaoStatus() {
  const id     = document.getElementById('status-eq-id').value;
  const novoSt = document.getElementById('status-eq-novo').value;
  if (!novoSt) { NioApp.Toast('Selecione o novo status.','error'); return; }

  const eq = DB.equipamentos.find(e=>e.id===id);
  if (!eq) return;

  showLoading(true);
  setTimeout(()=>{
    eq.status = novoSt;
    salvarDB();
    closeModal('modal-status-equipamento');
    renderEquipamentos();
    atualizarPainelAdmin();
    showLoading(false);
    NioApp.Toast(`Status alterado para "${STATUS_LABELS[novoSt]}" com sucesso!`, 'success');

    // Registra atividade
    adicionarAtividade(`<strong>${eq.nome}</strong> teve status alterado para <strong>${STATUS_LABELS[novoSt]}</strong>`,'bi-arrow-repeat','kpi-icon-primary');
  }, 900);
}

// ── Modal: Nova Reserva — cálculo automático ─────────────────
function popularSelectsReserva() {
  const selCli  = document.getElementById('sel-cliente-reserva');
  const selEquip = document.getElementById('sel-equip-reserva');

  selCli.innerHTML  = '<option value="">Selecione o cliente...</option>' +
    DB.clientes.filter(c=>c.ativo).map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');

  selEquip.innerHTML = '<option value="">Selecione o equipamento...</option>' +
    DB.equipamentos.filter(e=>e.status==='disponivel').map(e=>`<option value="${e.id}" data-diaria="${e.diaria}">${e.nome} — ${fmtMoeda(e.diaria)}/dia</option>`).join('');

  // Setar data mínima como hoje
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('res-inicio').min = hoje;
  document.getElementById('res-fim').min    = hoje;
}

function calcularReserva() {
  const selEq  = document.getElementById('sel-equip-reserva');
  const inicio = document.getElementById('res-inicio').value;
  const fim    = document.getElementById('res-fim').value;
  const box    = document.getElementById('res-calculo');

  if (!selEq.value || !inicio || !fim) { box.style.display='none'; return; }

  const dias = calcDias(inicio, fim);
  if (dias < 1 || dias > 30) { box.style.display='none'; return; }

  const opt    = selEq.selectedOptions[0];
  const diaria = parseFloat(opt?.dataset.diaria || 0);
  const total  = diaria * dias;
  const caucao = total * 0.20;

  document.getElementById('calc-dias').textContent  = `${dias} dia${dias>1?'s':''}`;
  document.getElementById('calc-total').textContent  = fmtMoeda(total);
  document.getElementById('calc-caucao').textContent = fmtMoeda(caucao);
  box.style.display = 'block';
}

// ── Formulários ──────────────────────────────────────────────
function salvarEquipamento(e) {
  e.preventDefault();
  const fd  = new FormData(e.target);
  const serial = fd.get('serial');
  if (DB.equipamentos.some(x => x.serial === serial)) {
    NioApp.Toast('Número de série já cadastrado em outro equipamento.', 'error');
    return;
  }
  showLoading(true);
  setTimeout(()=>{
    const novo = {
      id:       nextId('eq-', DB.equipamentos),
      nome:     fd.get('nome'),
      serial:   fd.get('serial'),
      categoria:fd.get('categoria'),
      diaria:   parseFloat(fd.get('valor_diario')),
      obs:      fd.get('obs') || '',
      status:   'disponivel',
    };
    DB.equipamentos.push(novo);
    salvarDB();
    e.target.reset();
    closeModal('modal-novo-equipamento');
    renderEquipamentos();
    atualizarPainelAdmin();
    showLoading(false);
    NioApp.Toast(`Equipamento "${novo.nome}" cadastrado!`, 'success');
    adicionarAtividade(`<strong>${novo.nome}</strong> foi adicionado ao catálogo`,'bi-plus-circle','kpi-icon-success');
  }, 1000);
}

function salvarCliente(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email');
  if (DB.clientes.some(x => x.email.toLowerCase() === email.toLowerCase())) {
    NioApp.Toast('Este e-mail já está cadastrado em outro cliente.', 'error');
    return;
  }
  showLoading(true);
  setTimeout(()=>{
    const novo = {
      id:      nextId('c-', DB.clientes),
      nome:    fd.get('nome'),
      email:   email,
      doc:     fd.get('documento'),
      tipo:    document.getElementById('tipo-doc').value,
      tel:     fd.get('telefone'),
      cep:     fd.get('cep') || '',
      endereco:fd.get('endereco') || '',
      reservas:0,
      ativo:   true,
    };
    DB.clientes.push(novo);
    salvarDB();
    e.target.reset();
    closeModal('modal-novo-cliente');
    renderClientes();
    showLoading(false);
    NioApp.Toast(`Cliente "${novo.nome}" cadastrado!`, 'success');
    adicionarAtividade(`<strong>${novo.nome}</strong> foi cadastrado como cliente`,'bi-person-plus','kpi-icon-warning');
  }, 1000);
}

function salvarReserva(e) {
  e.preventDefault();
  const fd     = new FormData(e.target);
  const inicio = fd.get('data_inicio');
  const fim    = fd.get('data_fim');
  const dias   = calcDias(inicio, fim);

  if (dias < 1)  { NioApp.Toast('Data de término deve ser posterior ao início.', 'error'); return; }
  if (dias > 30) { NioApp.Toast('Período máximo permitido: 30 dias (RN006).', 'error'); return; }

  const eq     = DB.equipamentos.find(x=>x.id===fd.get('equipment_id'));
  const total  = (eq?.diaria||0) * dias;
  const caucao = total * 0.20;

  showLoading(true);
  setTimeout(()=>{
    const nova = {
      id:         nextId('res-', DB.reservas),
      cliente_id: fd.get('cliente_id'),
      equip_id:   fd.get('equipment_id'),
      inicio, fim,
      total, caucao,
      assinado: false,
      status: 'pendente',
    };
    DB.reservas.push(nova);
    if (eq) eq.status = 'reservado';
    salvarDB();
    e.target.reset();
    document.getElementById('res-calculo').style.display='none';
    closeModal('modal-nova-reserva');
    renderReservas();
    renderEquipamentos();
    atualizarPainelAdmin();
    showLoading(false);
    NioApp.Toast('Reserva criada! Gere o contrato para confirmar.', 'success');
    adicionarAtividade(`Nova reserva criada para <strong>${clienteById(nova.cliente_id)?.nome||'?'}</strong>`,'bi-calendar-check','kpi-icon-success');
  }, 1100);
}

// ── Confirmar exclusão ────────────────────────────────────────
function confirmarExclusao(id, tipo) {
  if (!confirm('Tem certeza que deseja excluir? Esta ação não pode ser desfeita.')) return;
  if (tipo==='equip') {
    const idx = DB.equipamentos.findIndex(e=>e.id===id);
    if (idx>=0) DB.equipamentos.splice(idx,1);
    salvarDB();
    renderEquipamentos();
    atualizarPainelAdmin();
    NioApp.Toast('Equipamento excluído.', 'warning');
  }
}

// ── Editar Equipamento ────────────────────────────────────────
function abrirEditEquip(id) {
  const eq = DB.equipamentos.find(e=>e.id===id);
  if (!eq) return;
  const f = document.getElementById('form-editar-equipamento');
  f.querySelector('[name="id"]').value          = id;
  f.querySelector('[name="nome"]').value         = eq.nome;
  f.querySelector('[name="serial"]').value       = eq.serial;
  f.querySelector('[name="valor_diario"]').value = eq.diaria;
  f.querySelector('[name="obs"]').value          = eq.obs || '';
  const sel = f.querySelector('[name="categoria"]');
  sel.value = eq.categoria;
  openModal('modal-editar-equipamento');
}

function salvarEditEquip(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = fd.get('id');
  const eq = DB.equipamentos.find(x=>x.id===id);
  if (!eq) return;
  const serial = fd.get('serial');
  const serialDup = DB.equipamentos.some(x=>x.id!==id && x.serial===serial);
  if (serialDup) { NioApp.Toast('Número de série já cadastrado em outro equipamento.','error'); return; }
  showLoading(true);
  setTimeout(()=>{
    eq.nome     = fd.get('nome');
    eq.categoria= fd.get('categoria');
    eq.serial   = serial;
    eq.diaria   = parseFloat(fd.get('valor_diario'));
    eq.obs      = fd.get('obs');
    salvarDB();
    closeModal('modal-editar-equipamento');
    renderEquipamentos();
    atualizarPainelAdmin();
    showLoading(false);
    NioApp.Toast(`Equipamento "${eq.nome}" atualizado com sucesso!`, 'success');
    adicionarAtividade(`<strong>${eq.nome}</strong> foi atualizado`,'bi-pencil-square','kpi-icon-primary');
  }, 800);
}

// ── Editar Cliente ────────────────────────────────────────────
function abrirEditCliente(id) {
  const c = DB.clientes.find(x=>x.id===id);
  if (!c) return;
  const f = document.getElementById('form-editar-cliente');
  f.querySelector('[name="id"]').value        = id;
  f.querySelector('[name="nome"]').value      = c.nome;
  f.querySelector('[name="email"]').value     = c.email;
  f.querySelector('[name="documento"]').value = c.doc;
  f.querySelector('[name="telefone"]').value  = c.tel;
  f.querySelector('[name="cep"]').value       = c.cep || '';
  f.querySelector('[name="endereco"]').value  = c.endereco || '';
  document.getElementById('edit-tipo-doc').value = c.tipo || 'cpf';
  document.getElementById('edit-input-documento').placeholder =
    (c.tipo==='cnpj') ? '00.000.000/0000-00' : '000.000.000-00';
  openModal('modal-editar-cliente');
}

function salvarEditCliente(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const id = fd.get('id');
  const c = DB.clientes.find(x=>x.id===id);
  if (!c) return;
  const email = fd.get('email');
  if (DB.clientes.some(x=>x.id!==id && x.email===email)) {
    NioApp.Toast('Este e-mail já está cadastrado em outro cliente.','error'); return;
  }
  showLoading(true);
  setTimeout(()=>{
    c.nome    = fd.get('nome');
    c.email   = email;
    c.doc     = fd.get('documento');
    c.tipo    = document.getElementById('edit-tipo-doc').value;
    c.tel     = fd.get('telefone');
    c.cep     = fd.get('cep');
    c.endereco= fd.get('endereco');
    salvarDB();
    closeModal('modal-editar-cliente');
    renderClientes();
    showLoading(false);
    NioApp.Toast(`Cliente "${c.nome}" atualizado com sucesso!`, 'success');
    adicionarAtividade(`<strong>${c.nome}</strong> teve o cadastro atualizado`,'bi-person-gear','kpi-icon-warning');
  }, 800);
}

// ── Toggle checkbox all ───────────────────────────────────────
function toggleAllChecks(cls, master) {
  document.querySelectorAll('.'+cls).forEach(cb=>cb.checked=master.checked);
}

// ── Atividade recente ─────────────────────────────────────────
const activities = [
  { text:'Reserva <strong>res-003</strong> criada por Ana Lima', icon:'bi-calendar-plus', cls:'kpi-icon-success', time:'há 5 min' },
  { text:'Contrato <strong>CTR-002</strong> assinado', icon:'bi-file-earmark-check', cls:'kpi-icon-primary', time:'há 20 min' },
  { text:'Equipamento <strong>Compactador</strong> em manutenção', icon:'bi-wrench-adjustable', cls:'kpi-icon-warning', time:'há 1h' },
  { text:'Pagamento <strong>R$ 4.500</strong> confirmado', icon:'bi-cash-coin', cls:'kpi-icon-success', time:'há 2h' },
  { text:'Devolução registrada para <strong>Retroescavadeira</strong>', icon:'bi-arrow-return-left', cls:'kpi-icon-info', time:'há 3h' },
];

function adicionarAtividade(texto, icone, cls) {
  activities.unshift({ text:texto, icon:icone, cls, time:'agora' });
  if (activities.length > 30) activities.length = 30;
  renderActivity();
  salvarDB();
}

function renderActivity() {
  document.getElementById('activity-list').innerHTML = activities.slice(0,6).map(a=>`
    <li class="activity-item">
      <div class="activity-icon ${a.cls}"><i class="bi ${a.icon}"></i></div>
      <div class="activity-body">
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </li>`).join('');
}

// ── RF011: Painel Administrativo ─────────────────────────────
// Calcula os indicadores do dashboard administrativo:
//   • Em uso         → equipamentos com status 'reservado'
//   • Disponíveis    → equipamentos com status 'disponivel'
//   • Em manutenção  → equipamentos com status 'manutencao'
//   • Devoluções pendentes → reservas ativas cuja data fim já passou
function calcularPainelAdmin() {
  const hojeStr = new Date().toISOString().split('T')[0];

  const emUso       = DB.equipamentos.filter(e => e.status === 'reservado');
  const disponiveis = DB.equipamentos.filter(e => e.status === 'disponivel');
  const manutencao  = DB.equipamentos.filter(e => e.status === 'manutencao');

  // Devolução pendente = reserva ATIVA (equipamento já entregue) cuja data fim <= hoje
  // (status 'pendente' = aguardando contrato, equipamento ainda não saiu)
  const devolucoesPendentes = DB.reservas.filter(r =>
    r.status === 'ativa' && r.fim <= hojeStr
  );
  const emAtraso = devolucoesPendentes.filter(r => r.fim < hojeStr);

  return { emUso, disponiveis, manutencao, devolucoesPendentes, emAtraso };
}

function atualizarPainelAdmin() {
  const m = calcularPainelAdmin();
  const total = DB.equipamentos.length || 1;
  const pctDisp = Math.round((m.disponiveis.length / total) * 100);

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  // Cards do dashboard
  set('kpi-em-uso',          m.emUso.length);
  set('kpi-em-uso-sub',      `${m.emUso.length} equipamento(s) reservado(s)`);
  set('kpi-disponiveis',     m.disponiveis.length);
  set('kpi-disponiveis-sub', `${pctDisp}% do total (${total})`);
  set('kpi-manutencao',      m.manutencao.length);
  set('kpi-manutencao-sub',  `${m.manutencao.length} indisponíveis`);
  set('kpi-devolucoes',      m.devolucoesPendentes.length);
  set('kpi-devolucoes-sub',  `${m.emAtraso.length} em atraso`);

  // Resumo dentro do modal
  set('painel-resumo-uso',  m.emUso.length);
  set('painel-resumo-disp', m.disponiveis.length);
  set('painel-resumo-manu', m.manutencao.length);
  set('painel-resumo-dev',  m.devolucoesPendentes.length);

  // Badges da sidebar
  set('badge-eq',  DB.equipamentos.length);
  set('badge-res', DB.reservas.filter(r => r.status === 'ativa' || r.status === 'pendente').length);
}

// Lista equipamentos por status dentro do modal
function abrirPainelStatus(status) {
  const titulos = {
    disponivel: ['Equipamentos Disponíveis',  'bi-check-circle-fill'],
    reservado:  ['Equipamentos em Uso',       'bi-truck'],
    manutencao: ['Equipamentos em Manutenção','bi-wrench-adjustable'],
  };
  const [titulo, icone] = titulos[status] || ['Painel', 'bi-grid-1x2-fill'];
  document.getElementById('painel-admin-titulo').innerHTML = `<i class="bi ${icone} me-2"></i> ${titulo}`;

  atualizarPainelAdmin();

  const lista = DB.equipamentos.filter(e => e.status === status);
  const conteudo = document.getElementById('painel-admin-conteudo');

  if (lista.length === 0) {
    conteudo.innerHTML = `
      <div class="painel-empty">
        <i class="bi bi-inbox"></i>
        Nenhum equipamento ${status === 'disponivel' ? 'disponível' : status === 'reservado' ? 'em uso' : 'em manutenção'} no momento.
      </div>`;
  } else {
    conteudo.innerHTML = `
      <table class="painel-lista">
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Nº Série</th>
            <th>Categoria</th>
            <th>Diária</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(e => `
            <tr>
              <td><strong>${e.nome}</strong></td>
              <td><code style="font-size:12px;background:var(--body-bg);padding:2px 8px;border-radius:4px">${e.serial}</code></td>
              <td>${e.categoria}</td>
              <td><strong>${fmtMoeda(e.diaria)}</strong></td>
              <td>${badgeStatus(e.status)}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  openModal('modal-painel-admin');
}

// Lista reservas com devolução pendente
function abrirPainelDevolucoes() {
  document.getElementById('painel-admin-titulo').innerHTML =
    '<i class="bi bi-arrow-return-left me-2"></i> Devoluções Pendentes';

  atualizarPainelAdmin();

  const { devolucoesPendentes } = calcularPainelAdmin();
  const hojeStr = new Date().toISOString().split('T')[0];
  const conteudo = document.getElementById('painel-admin-conteudo');

  if (devolucoesPendentes.length === 0) {
    conteudo.innerHTML = `
      <div class="painel-empty">
        <i class="bi bi-emoji-smile"></i>
        Nenhuma devolução pendente. Todos os equipamentos estão em dia!
      </div>`;
    openModal('modal-painel-admin');
    return;
  }

  conteudo.innerHTML = `
    <table class="painel-lista">
      <thead>
        <tr>
          <th>Reserva</th>
          <th>Cliente</th>
          <th>Equipamento</th>
          <th>Devolução Prev.</th>
          <th>Situação</th>
          <th class="text-end">Ações</th>
        </tr>
      </thead>
      <tbody>
        ${devolucoesPendentes.map(r => {
          const cli = clienteById(r.cliente_id);
          const eq  = equipById(r.equip_id);
          const diasAtraso = calcDias(r.fim, hojeStr);
          const atrasada = r.fim < hojeStr;
          return `
            <tr>
              <td><strong>${r.id}</strong></td>
              <td>${cli?.nome || '—'}</td>
              <td>
                <div>${eq?.nome || '—'}</div>
                <div class="text-soft fs-xs">${eq?.serial || ''}</div>
              </td>
              <td>${fmtData(r.fim)}</td>
              <td>
                ${atrasada
                  ? `<span class="atraso-pill"><i class="bi bi-exclamation-triangle-fill"></i> ${diasAtraso} dia(s) em atraso</span>`
                  : `<span class="atraso-pill ok"><i class="bi bi-clock-fill"></i> Vence hoje</span>`
                }
              </td>
              <td class="text-end">
                <button class="btn btn-primary btn-sm" onclick="registrarDevolucao('${r.id}')">
                  <i class="bi bi-check2-circle"></i> Registrar Devolução
                </button>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;

  openModal('modal-painel-admin');
}

// Marca uma reserva como devolvida (concluída) e libera o equipamento
function registrarDevolucao(reservaId) {
  if (!confirm('Confirmar devolução desta reserva? O equipamento voltará a ficar disponível.')) return;
  const r = DB.reservas.find(x => x.id === reservaId);
  if (!r) return;

  showLoading(true);
  setTimeout(() => {
    r.status = 'concluida';
    const eq = equipById(r.equip_id);
    if (eq && eq.status === 'reservado') eq.status = 'disponivel';
    salvarDB();

    atualizarPainelAdmin();
    renderEquipamentos();
    if (document.getElementById('page-reservas')?.classList.contains('active')) renderReservas();
    if (typeof renderDashboardReservas === 'function') renderDashboardReservas();
    showLoading(false);

    // Reabre o modal atualizado, se ainda visível
    if (document.getElementById('modal-painel-admin').classList.contains('show')) {
      abrirPainelDevolucoes();
    }

    NioApp.Toast(`Devolução registrada para ${r.id}!`, 'success');
    adicionarAtividade(
      `Devolução registrada para <strong>${eq?.nome || r.equip_id}</strong>`,
      'bi-arrow-return-left',
      'kpi-icon-info'
    );
  }, 800);
}

// ── Dashboard: tabela de reservas recentes ───────────────────
function renderDashboardReservas() {
  const tbody = document.getElementById('tbody-dashboard-reservas');
  const recentes = DB.reservas.filter(r=>r.status!=='cancelada').slice(0,5);
  tbody.innerHTML = recentes.map(r=>{
    const cli = clienteById(r.cliente_id);
    const eq  = equipById(r.equip_id);
    return `
      <tr class="nk-tb-item">
        <td class="nk-tb-col">
          <div class="nk-user-info">
            <div class="nk-user-avatar ${avatarColor(cli?.nome||'X')}" style="width:30px;height:30px;font-size:11px">${initials(cli?.nome||'?')}</div>
            <span style="font-size:13px">${cli?.nome||'—'}</span>
          </div>
        </td>
        <td class="nk-tb-col" style="font-size:13px">${eq?.nome||'—'}</td>
        <td class="nk-tb-col" style="font-size:12px">${fmtData(r.inicio)} → ${fmtData(r.fim)}</td>
        <td class="nk-tb-col"><strong>${fmtMoeda(r.total)}</strong></td>
        <td class="nk-tb-col">${badgeStatus(r.status)}</td>
      </tr>`;
  }).join('');
}

// ── Gráficos: Dashboard ───────────────────────────────────────
let chartReceita, chartStatus, chartRelMensal, chartRelTop;

function initDashboardCharts() {
  // Evita "Canvas is already in use" ao reinicializar (ex.: logout → login)
  if (chartReceita) { chartReceita.destroy(); chartReceita = null; }
  if (chartStatus)  { chartStatus.destroy();  chartStatus  = null; }

  // Receita mensal
  const ctxR = document.getElementById('chart-receita')?.getContext('2d');
  if (ctxR) {
    chartReceita = new Chart(ctxR, {
      type: 'line',
      data: {
        labels: ['Set','Out','Nov','Dez','Jan','Fev'],
        datasets: [{
          label: 'Receita (R$)',
          data: [4200, 5800, 4900, 7200, 6100, 8400],
          fill: true,
          backgroundColor: 'rgba(101,118,255,0.08)',
          borderColor: '#6576FF',
          borderWidth: 2.5,
          tension: 0.4,
          pointBackgroundColor: '#6576FF',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend:{ display:false } },
        scales: {
          x: { grid:{ display:false }, ticks:{ font:{ size:11 }, color:'#8094ae' } },
          y: { grid:{ color:'rgba(230,233,242,.6)' }, ticks:{ font:{ size:11 }, color:'#8094ae', callback: v=>'R$'+v.toLocaleString('pt-BR') } }
        }
      }
    });
  }

  // Status donut
  const ctxS = document.getElementById('chart-status')?.getContext('2d');
  if (ctxS) {
    chartStatus = new Chart(ctxS, {
      type: 'doughnut',
      data: {
        labels: ['Disponível','Reservado','Manutenção','Avariado'],
        datasets: [{
          data: [
            DB.equipamentos.filter(e=>e.status==='disponivel').length,
            DB.equipamentos.filter(e=>e.status==='reservado').length,
            DB.equipamentos.filter(e=>e.status==='manutencao').length,
            DB.equipamentos.filter(e=>e.status==='avariado').length,
          ],
          backgroundColor: ['#1ee0ac','#6576FF','#f4bd0e','#e85347'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend:{ display:false } }
      }
    });
  }
}

function initRelatoriosCharts() {
  const ctxM = document.getElementById('chart-rel-mensal')?.getContext('2d');
  if (ctxM && !chartRelMensal) {
    chartRelMensal = new Chart(ctxM, {
      type:'bar',
      data:{
        labels:['Set','Out','Nov','Dez','Jan','Fev'],
        datasets:[{
          label:'Receita',
          data:[4200,5800,4900,7200,6100,8400],
          backgroundColor:'rgba(101,118,255,0.85)',
          borderRadius:5,
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ x:{ grid:{display:false} }, y:{ grid:{color:'rgba(230,233,242,.6)'} } }
      }
    });
  }

  const ctxT = document.getElementById('chart-rel-top')?.getContext('2d');
  if (ctxT && !chartRelTop) {
    chartRelTop = new Chart(ctxT, {
      type:'bar',
      indexAxis:'y',
      data:{
        labels:['Retroescavadeira','Betoneira 400L','Gerador 15kVA','Andaime Tubular','Rompedor Hid.'],
        datasets:[{
          label:'Aluguéis',
          data:[8,6,5,4,3],
          backgroundColor:['#6576FF','#09c2de','#1ee0ac','#f4bd0e','#e85347'],
          borderRadius:4,
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ x:{ grid:{color:'rgba(230,233,242,.6)'} }, y:{ grid:{display:false} } }
      }
    });
  }
}

// ── Máscaras de input ─────────────────────────────────────────
function maskCPF(v) {
  return v.replace(/\D/g,'')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2')
    .slice(0,14);
}
function maskCNPJ(v) {
  return v.replace(/\D/g,'')
    .replace(/(\d{2})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1/$2')
    .replace(/(\d{4})(\d{1,2})$/,'$1-$2')
    .slice(0,18);
}
function maskPhone(v) {
  v = v.replace(/\D/g,'').slice(0,11);
  if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
  return v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
}
function maskCEP(v) {
  return v.replace(/\D/g,'').replace(/(\d{5})(\d{1,3})/,'$1-$2').slice(0,9);
}
function applyMask(el, fn) {
  const pos = el.selectionStart;
  const old = el.value;
  el.value = fn(el.value);
  if (el.value.length < old.length) el.setSelectionRange(pos, pos);
}
function applyDocMask(el, tipoSelectId) {
  const tipo = document.getElementById(tipoSelectId).value;
  applyMask(el, tipo === 'cnpj' ? maskCNPJ : maskCPF);
}

// ── Toggle máscara documento ──────────────────────────────────
function toggleDocMask() {
  const tipo = document.getElementById('tipo-doc').value;
  const inp  = document.getElementById('input-documento');
  inp.placeholder = tipo==='cnpj' ? '00.000.000/0000-00' : '000.000.000-00';
  inp.value = '';
}
function toggleEditDocMask() {
  const tipo = document.getElementById('edit-tipo-doc').value;
  const inp  = document.getElementById('edit-input-documento');
  inp.placeholder = tipo==='cnpj' ? '00.000.000/0000-00' : '000.000.000-00';
  inp.value = '';
}

// ── Busca de CEP ──────────────────────────────────────────────
async function buscarCEP(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const cepField = form.querySelector('[name="cep"]');
  const endField = form.querySelector('[name="endereco"]');
  if (!cepField || !endField) return;
  const cep = cepField.value.replace(/\D/g,'');
  if (cep.length !== 8) { NioApp.Toast('CEP deve ter 8 dígitos.','error'); return; }
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) { NioApp.Toast('CEP não encontrado.','error'); return; }
    endField.value = [data.logradouro, data.bairro, data.localidade + ' - ' + data.uf].filter(Boolean).join(', ');
    NioApp.Toast('Endereço preenchido com sucesso!','success');
  } catch { NioApp.Toast('Erro ao consultar CEP. Verifique sua conexão.','error'); }
}

// ── Configurações ─────────────────────────────────────────────
const CONFIG_KEY = 'alugafacil:config';

function carregarConfiguracoes() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (!saved) return;
    const cfg = JSON.parse(saved);
    const get = name => document.querySelector(`#page-configuracoes [name="${name}"]`);
    if (cfg.empresa      && get('empresa'))         get('empresa').value         = cfg.empresa;
    if (cfg.cnpj         && get('cnpj'))            get('cnpj').value            = cfg.cnpj;
    if (cfg.tel_empresa  && get('tel_empresa'))     get('tel_empresa').value     = cfg.tel_empresa;
    if (cfg.bcrypt_cost  && get('bcrypt_cost'))     get('bcrypt_cost').value     = cfg.bcrypt_cost;
    if (cfg.max_dias     && get('max_dias'))        get('max_dias').value        = cfg.max_dias;
    if (cfg.taxa_caucao  && get('taxa_caucao'))     get('taxa_caucao').value     = cfg.taxa_caucao;
  } catch (_) {}
}

function salvarConfiguracoes() {
  const get = name => document.querySelector(`#page-configuracoes [name="${name}"]`)?.value;
  const cfg = {
    empresa:     get('empresa'),
    cnpj:        get('cnpj'),
    tel_empresa: get('tel_empresa'),
    bcrypt_cost: get('bcrypt_cost'),
    max_dias:    get('max_dias'),
    taxa_caucao: get('taxa_caucao'),
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  NioApp.Toast('Configurações salvas com sucesso!', 'success');
}

// ── Init geral ────────────────────────────────────────────────
function init() {
  // Data de hoje no header do dashboard
  const hoje = new Date();
  document.getElementById('data-hoje').textContent = hoje.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // Renderizações iniciais
  atualizarPainelAdmin();
  atualizarContadoresReservas();
  renderDashboardReservas();
  renderActivity();
  initDashboardCharts();

  // Pré-popular selects dos modais de reserva
  popularSelectsReserva();

  // Carregar configurações salvas
  carregarConfiguracoes();
}

// ── Boot: verifica sessão antes de iniciar o app ───────────
function boot() {
  // Carrega usuários cadastrados e dados persistidos
  carregarUsuarios();
  carregarDB();

  // Preenche ano do rodapé do login
  const ano = document.getElementById('login-year');
  if (ano) ano.textContent = new Date().getFullYear();

  const sessao = getSessao();
  if (sessao) {
    mostrarApp(sessao);
    init();
  } else {
    mostrarLogin();
  }
}

document.addEventListener('DOMContentLoaded', boot);
