/* Telas da Agenda com confirmação (demonstração). Regras em agenda.js. */
(function () {
  'use strict';
  var A = window.Agenda;
  var estado = A.carregar() || A.criarDemo('barbearia');
  var semArmazenamento = !A.salvar(estado);
  var raiz = document.getElementById('app');
  var pedido = novoPedido();
  var diaAgenda = diaInicial();
  var termoBusca = '';
  var ultimo = null; // último agendamento feito pela tela do cliente

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function cfg() { return A.cfgDe(estado); }
  function gravar() { A.salvar(estado); }
  /* Hoje, se estiver aberto; senão, o próximo dia com expediente (a demo tem horários nele). */
  function diaInicial() { return A.proximosDias(estado, new Date(), 1)[0] || A.dataISO(new Date()); }
  function novoPedido() { return { servicoId: '', profissional: '', data: '', hora: '', cliente: { nome: '', whatsapp: '' }, observacoes: '' }; }
  function selo(st) { return '<span class="selo selo-' + esc(st) + '">' + esc(A.rotuloStatus(st)) + '</span>'; }
  function aviso(msg, tipo) {
    var el = document.getElementById('aviso');
    el.textContent = msg; el.className = 'aviso mostrar ' + (tipo || '');
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { el.className = 'aviso'; }, 3200);
  }

  function pintarCabecalho() {
    document.documentElement.style.setProperty('--marca', cfg().cor);
    document.getElementById('nomeEmpresa').textContent = cfg().empresa;
    document.getElementById('nichoEmpresa').textContent = cfg().rotulo + ' · ' + cfg().endereco;
    document.getElementById('nicho').value = estado.nicho;
    document.title = 'Agenda — ' + cfg().empresa;
    var aba = (location.hash || '#agendar').split('/')[0];
    [].forEach.call(document.querySelectorAll('.abas a'), function (a) {
      var ativa = a.getAttribute('href') === aba;
      a.classList.toggle('ativa', ativa);
      if (ativa) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------------- visão do cliente ---------------- */
  function telaAgendar() {
    var c = cfg(), p = pedido;
    if (c.profissionais.length === 1) p.profissional = c.profissionais[0];
    var sv = A.servicoPorId(c, p.servicoId);
    var html = '<p class="visao">Visão do <strong>cliente</strong>: é o que ele vê ao tocar em "Agendar" no seu site, no Instagram ou no Google.</p>' +
      '<h1 class="titulo">Agende seu horário</h1>' +
      '<section class="passo"><h2><span class="n">1</span>Serviço</h2><div class="opcoes servicos-grade">' +
      c.servicos.map(function (s) {
        return '<button type="button" class="opcao' + (p.servicoId === s[0] ? ' escolhida' : '') + '" data-servico="' + esc(s[0]) + '" aria-pressed="' + (p.servicoId === s[0]) + '">' +
          '<strong>' + esc(s[1]) + '</strong><small>' + s[2] + ' min · ' + esc(A.formatarMoeda(s[3])) + '</small></button>';
      }).join('') + '</div></section>';
    if (c.profissionais.length > 1) {
      html += '<section class="passo"><h2><span class="n">2</span>Profissional</h2><div class="opcoes">' +
        c.profissionais.map(function (pr) {
          return '<button type="button" class="opcao chip' + (p.profissional === pr ? ' escolhida' : '') + '" data-profissional="' + esc(pr) + '" aria-pressed="' + (p.profissional === pr) + '">' + esc(pr) + '</button>';
        }).join('') + '</div></section>';
    }
    var n = c.profissionais.length > 1 ? 3 : 2;
    if (sv && p.profissional) {
      var dias = A.proximosDias(estado, new Date(), 7);
      if (!p.data || dias.indexOf(p.data) < 0) p.data = dias[0];
      html += '<section class="passo"><h2><span class="n">' + n + '</span>Dia</h2><div class="opcoes dias">' +
        dias.map(function (d) {
          var partes = A.dataExtensa(d).split(', ');
          return '<button type="button" class="opcao dia' + (p.data === d ? ' escolhida' : '') + '" data-dia="' + d + '" aria-pressed="' + (p.data === d) + '"><small>' + esc(partes[0]) + '</small><strong>' + esc(partes[1]) + '</strong></button>';
        }).join('') + '</div></section>';
      var livres = A.horariosLivres(estado, p.data, p.servicoId, p.profissional, new Date());
      if (livres.indexOf(p.hora) < 0) p.hora = '';
      html += '<section class="passo"><h2><span class="n">' + (n + 1) + '</span>Horário</h2>' +
        (livres.length ? '<div class="opcoes horas">' + livres.map(function (h) {
          return '<button type="button" class="opcao chip' + (p.hora === h ? ' escolhida' : '') + '" data-hora="' + h + '" aria-pressed="' + (p.hora === h) + '">' + h + '</button>';
        }).join('') + '</div>' : '<p class="fraco">Sem horários livres neste dia. Escolha outro dia.</p>') + '</section>';
      if (p.hora) {
        html += '<form id="formAgendar" class="passo" novalidate><h2><span class="n">' + (n + 2) + '</span>Seus dados</h2>' +
          '<label class="campo"><span>Nome</span><input id="nome" autocomplete="name" value="' + esc(p.cliente.nome) + '" placeholder="Seu nome"></label>' +
          '<label class="campo"><span>WhatsApp</span><input id="whats" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(p.cliente.whatsapp) + '" placeholder="(31) 99999-9999"></label>' +
          '<label class="campo"><span>Observação (opcional)</span><input id="obs" maxlength="300" value="' + esc(p.observacoes) + '" placeholder="' + (estado.nicho === 'petshop' ? 'Ex.: nome, raça e porte do pet' : 'Ex.: preferência, alergia…') + '"></label>' +
          '<div class="resumo-pedido"><strong>' + esc(sv.nome) + '</strong> · ' + esc(A.dataExtensa(p.data)) + ' às ' + p.hora +
          (c.profissionais.length > 1 ? ' · com ' + esc(p.profissional) : '') + ' · ' + esc(A.formatarMoeda(sv.preco)) + '</div>' +
          '<div id="erros" class="erros" role="alert"></div>' +
          '<button type="submit" class="botao principal largo">Pedir este horário</button>' +
          '<p class="fraco pequeno">Seus dados são usados só para confirmar o horário (LGPD). Na demonstração, ficam apenas neste aparelho.</p></form>';
      }
    }
    return html;
  }

  function telaPedidoFeito() {
    var a = ultimo;
    return '<div class="sucesso"><div class="icone-ok" aria-hidden="true">✓</div><h1 class="titulo">Pedido enviado!</h1>' +
      '<p><strong>' + esc(a.servico) + '</strong> · ' + esc(A.dataExtensa(a.data)) + ' às ' + esc(a.hora) + '</p>' +
      '<p class="fraco">O horário fica reservado e a ' + esc(cfg().empresa) + ' confirma pelo WhatsApp.</p>' +
      '<a class="botao whats largo" target="_blank" rel="noopener" href="' + esc(A.linkWhats(cfg().whatsapp, A.mensagemPedido(a, estado))) + '">Avisar pelo WhatsApp</a>' +
      '<div class="acoes"><button type="button" class="botao" id="outroHorario">Agendar outro horário</button>' +
      '<a class="botao" href="#agenda">Ver na agenda do dono</a></div></div>';
  }

  /* ---------------- visão do dono ---------------- */
  function telaAgenda() {
    var r = A.resumo(estado, diaAgenda);
    var lista = termoBusca ? A.buscar(estado, termoBusca) : A.doDia(estado, diaAgenda);
    var hoje = A.dataISO(new Date());
    var aberto = A.expedienteDo(cfg(), diaAgenda);
    return '<p class="visao">Visão do <strong>dono</strong>: a agenda do dia, com confirmação e lembrete pelo WhatsApp.</p>' +
      '<div class="navega-dia"><button type="button" class="botao" data-dia-rel="-1" aria-label="Dia anterior">‹</button>' +
      '<div class="dia-atual"><h1 class="titulo">' + esc(A.dataExtensa(diaAgenda)) + '</h1>' +
      '<small>' + (diaAgenda === hoje ? 'hoje · ' : '') + (aberto ? 'aberto das ' + aberto[0] + ' às ' + aberto[1] : 'fechado') + '</small></div>' +
      '<button type="button" class="botao" data-dia-rel="1" aria-label="Próximo dia">›</button>' +
      (diaAgenda !== hoje ? '<button type="button" class="botao" id="irHoje">Hoje</button>' : '') + '</div>' +
      '<div class="cartoes">' +
        cartao(r.total, 'agendados') + cartao(r.pendentes, 'a confirmar') +
        cartao(A.formatarMoeda(r.previsto), 'previsto no dia') + cartao(r.taxaFaltas + '%', 'de faltas (geral)') +
      '</div>' +
      '<label class="busca"><span class="vis-oculto">Buscar cliente</span><input id="busca" type="search" placeholder="Buscar cliente (nome ou telefone)" value="' + esc(termoBusca) + '"></label>' +
      (termoBusca ? '<p class="fraco">Resultado da busca em todos os dias.</p>' : '') +
      (lista.length ? '<ul class="lista">' + lista.map(itemAgenda).join('') + '</ul>' : '<p class="fraco vazio">' + (termoBusca ? 'Nenhum cliente encontrado.' : 'Nenhum horário marcado neste dia.') + '</p>');
  }
  function cartao(v, rot) { return '<div class="cartao"><strong>' + esc(v) + '</strong><span>' + esc(rot) + '</span></div>'; }
  function itemAgenda(a) {
    var acoes = '';
    var temWhats = !!A.normalizarWhats(a.cliente.whatsapp);
    if (a.status === 'pendente') acoes += '<button type="button" class="botao principal" data-acao="confirmado" data-id="' + esc(a.id) + '">Confirmar</button>';
    if (a.status === 'confirmado' && temWhats) {
      acoes += '<a class="botao whats" target="_blank" rel="noopener" href="' + esc(A.linkWhats(a.cliente.whatsapp, A.mensagemConfirmacao(a, estado))) + '">Enviar confirmação</a>' +
        '<a class="botao" target="_blank" rel="noopener" href="' + esc(A.linkWhats(a.cliente.whatsapp, A.mensagemLembrete(a, estado))) + '">Lembrete</a>' +
        '<button type="button" class="botao" data-acao="concluido" data-id="' + esc(a.id) + '">Atendido</button>' +
        '<button type="button" class="botao" data-acao="faltou" data-id="' + esc(a.id) + '">Faltou</button>';
    }
    if (a.status === 'pendente' || a.status === 'confirmado') acoes += '<button type="button" class="botao perigo" data-acao="cancelado" data-id="' + esc(a.id) + '">Cancelar</button>';
    return '<li class="horario' + (a.status === 'cancelado' ? ' cancelado' : '') + '"><div class="hora"><strong>' + esc(a.hora) + '</strong><small>' + a.duracao + ' min</small></div>' +
      '<div class="info"><div class="linha1"><strong>' + esc(a.cliente.nome) + '</strong>' + selo(a.status) + '</div>' +
      '<div class="fraco">' + esc(a.servico) + (cfg().profissionais.length > 1 ? ' · ' + esc(a.profissional) : '') + ' · ' + esc(A.formatarMoeda(a.preco)) +
      (termoBusca ? ' · ' + esc(A.dataExtensa(a.data)) : '') + (temWhats ? ' · <span class="nw">' + esc(A.formatarTelefone(a.cliente.whatsapp)) + '</span>' : '') + '</div>' +
      (a.observacoes ? '<div class="obs">' + esc(a.observacoes) + '</div>' : '') +
      (acoes ? '<div class="acoes">' + acoes + '</div>' : '') + '</div></li>';
  }

  /* ---------------- roteador e eventos ---------------- */
  function render() {
    var rota = (location.hash || '#agendar').slice(1);
    raiz.innerHTML = rota === 'agenda' ? telaAgenda() : (rota === 'feito' && ultimo ? telaPedidoFeito() : telaAgendar());
    pintarCabecalho();
  }
  function rerender(manterFoco) {
    var id = manterFoco && document.activeElement && document.activeElement.id;
    var pos = id && document.activeElement.selectionStart;
    render();
    if (id) { var el = document.getElementById(id); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) {} } }
  }

  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    var d = b.dataset;
    if (d.servico) { pedido.servicoId = d.servico; pedido.hora = ''; render(); return; }
    if (d.profissional) { pedido.profissional = d.profissional; pedido.hora = ''; render(); return; }
    if (d.dia) { pedido.data = d.dia; pedido.hora = ''; render(); return; }
    if (d.hora) { pedido.hora = d.hora; render(); var f = document.getElementById('nome'); if (f) f.focus(); return; }
    if (d.diaRel) { diaAgenda = A.somarDias(diaAgenda, Number(d.diaRel)); termoBusca = ''; render(); return; }
    if (b.id === 'irHoje') { diaAgenda = A.dataISO(new Date()); render(); return; }
    if (b.id === 'outroHorario') { pedido = novoPedido(); location.hash = '#agendar'; return; }
    if (d.acao) {
      var ag = estado.agendamentos.filter(function (x) { return x.id === d.id; })[0];
      if (d.acao === 'cancelado' && !window.confirm('Cancelar o horário de ' + ag.cliente.nome + '?')) return;
      try { A.mudarStatus(ag, d.acao); gravar(); render(); aviso(ag.cliente.nome + ': ' + A.rotuloStatus(ag.status) + '.', 'ok'); }
      catch (e) { aviso(e.message, 'erro'); }
    }
  });

  raiz.addEventListener('input', function (ev) {
    if (ev.target.id === 'busca') { termoBusca = ev.target.value; rerender(true); return; }
    if (ev.target.id === 'nome') pedido.cliente.nome = ev.target.value;
    if (ev.target.id === 'whats') pedido.cliente.whatsapp = ev.target.value;
    if (ev.target.id === 'obs') pedido.observacoes = ev.target.value;
  });

  raiz.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'formAgendar') return;
    ev.preventDefault();
    var erros = A.validarPedido(estado, pedido, new Date());
    if (erros.length) {
      var caixa = document.getElementById('erros');
      caixa.innerHTML = '<ul>' + erros.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
      caixa.setAttribute('tabindex', '-1'); caixa.focus();
      if (/não está mais disponível/.test(erros.join())) { pedido.hora = ''; setTimeout(render, 1500); }
      return;
    }
    ultimo = A.criarAgendamento(estado, pedido, new Date());
    gravar();
    pedido = novoPedido();
    location.hash = '#feito';
  });

  document.getElementById('nicho').addEventListener('change', function (ev) {
    if (!window.confirm('Trocar o tipo de negócio recria os dados de exemplo. Continuar?')) { ev.target.value = estado.nicho; return; }
    estado = A.criarDemo(ev.target.value); pedido = novoPedido(); ultimo = null; diaAgenda = diaInicial(); gravar(); render();
    aviso('Demonstração trocada para ' + cfg().rotulo + '.', 'ok');
  });
  document.getElementById('zerar').addEventListener('click', function () {
    if (!window.confirm('Apagar as alterações e voltar aos dados de exemplo?')) return;
    estado = A.criarDemo(estado.nicho); pedido = novoPedido(); ultimo = null; diaAgenda = diaInicial(); gravar(); render();
    aviso('Dados de exemplo restaurados.', 'ok');
  });

  window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
  render();
  if (semArmazenamento) aviso('Este navegador não permite salvar: as alterações somem ao fechar a página.', 'erro');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
