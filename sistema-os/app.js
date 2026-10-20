/* Telas do Sistema de Orçamentos e OS (demonstração). Regras em sistema.js. */
(function () {
  'use strict';
  var S = window.SistemaOS;
  var estado = S.carregar() || S.criarDemo('oficina');
  var semArmazenamento = !S.salvar(estado);
  var raiz = document.getElementById('app');
  var filtroStatus = '';
  var termoBusca = '';
  var rascunho = null;

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cfg() { return S.NICHOS_OS[estado.nicho]; }
  function empresa() { return S.empresaDo(estado); }
  /* Avisa quando o aparelho deixa de salvar (memória cheia ou bloqueada); os dados continuam na tela aberta. */
  function gravar() {
    var ok = S.salvar(estado);
    if (!ok && !semArmazenamento) aviso('Não consegui salvar neste aparelho (memória cheia ou bloqueada). O que você fez vale só enquanto esta tela estiver aberta.', 'erro');
    semArmazenamento = !ok;
    return ok;
  }
  function ordemPorId(id) { return estado.ordens.filter(function (o) { return o.id === id; })[0]; }
  function selo(st) { return '<span class="selo selo-' + esc(st) + '">' + esc(S.rotuloStatus(st)) + '</span>'; }
  function aviso(msg, tipo) {
    var el = document.getElementById('aviso');
    el.textContent = msg; el.className = 'aviso mostrar ' + (tipo || '');
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { el.className = 'aviso'; }, 3200);
  }

  /* ---------------- cabeçalho ---------------- */
  function pintarCabecalho() {
    document.documentElement.style.setProperty('--marca', cfg().cor);
    document.getElementById('nomeEmpresa').textContent = empresa().nome;
    document.getElementById('nichoEmpresa').textContent = cfg().rotulo;
    var sel = document.getElementById('nicho');
    sel.value = estado.nicho;
    document.title = 'Orçamentos e OS — ' + empresa().nome;
    var aba = (location.hash.split('/')[0] || '#painel');
    [].forEach.call(document.querySelectorAll('.abas a'), function (a) {
      var ativa = a.getAttribute('href') === aba || (aba === '#os' && a.getAttribute('href') === '#ordens');
      a.classList.toggle('ativa', ativa);
      if (ativa) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------------- painel ---------------- */
  function telaPainel() {
    var r = S.resumo(estado.ordens);
    var prontas = estado.ordens.filter(function (o) { return o.status === 'pronto'; });
    var aguardando = estado.ordens.filter(function (o) { return o.status === 'orcamento'; });
    return '<h1 class="titulo">Painel</h1>' +
      '<div class="cartoes">' +
        cartao(r.aguardando, 'Orçamentos aguardando resposta', '#ordens/orcamento') +
        cartao(r.abertas, 'Serviços em andamento', '#ordens/andamento') +
        cartao(r.prontas, 'Prontos para entregar', '#ordens/pronto') +
        cartao(S.formatarMoeda(r.faturamentoMes), 'Faturado no mês (' + r.entreguesMes + (r.entreguesMes === 1 ? ' entregue)' : ' entregues)'), '#ordens/entregue') +
      '</div>' +
      '<p class="taxa">Taxa de aprovação dos orçamentos: <strong>' + r.taxaAprovacao + '%</strong> <span class="fraco">(' + r.aprovadas + ' de ' + r.decididas + ' respondidos)</span></p>' +
      bloco('Prontos: avise o cliente', prontas, 'Nenhum serviço pronto agora.') +
      bloco('Orçamentos aguardando resposta', aguardando, 'Nenhum orçamento pendente.') +
      '<a class="botao principal largo" href="#nova">+ Novo orçamento</a>';
  }
  function cartao(valor, rotulo, link) {
    return '<a class="cartao" href="' + link + '"><strong>' + esc(valor) + '</strong><span>' + esc(rotulo) + '</span></a>';
  }
  function bloco(titulo, lista, vazio) {
    return '<section class="bloco"><h2>' + esc(titulo) + '</h2>' +
      (lista.length ? '<ul class="lista">' + lista.map(itemLista).join('') + '</ul>' : '<p class="fraco">' + esc(vazio) + '</p>') +
      '</section>';
  }
  function itemLista(o) {
    var c = S.calcular(o);
    return '<li><a class="linha" href="#os/' + esc(o.id) + '">' +
      '<span class="num">nº ' + esc(o.numero) + '</span>' +
      '<span class="quem"><strong>' + esc(o.cliente.nome) + '</strong><small>' + esc(o.equipamento || '—') + '</small></span>' +
      '<span class="fim">' + selo(o.status) + '<small>' + esc(S.formatarMoeda(c.total)) + '</small></span></a></li>';
  }

  /* ---------------- lista de ordens ---------------- */
  var FILTROS = [['', 'Todas'], ['orcamento', 'Orçamento'], ['andamento', 'Em andamento'], ['pronto', 'Prontos'], ['entregue', 'Entregues'], ['recusado', 'Recusados']];
  function telaOrdens() {
    var lista = S.buscar(estado.ordens, termoBusca).filter(function (o) {
      if (!filtroStatus) return true;
      if (filtroStatus === 'andamento') return o.status === 'aprovado' || o.status === 'execucao';
      return o.status === filtroStatus;
    });
    return '<h1 class="titulo">Ordens de serviço</h1>' +
      '<label class="busca"><span class="vis-oculto">Buscar</span><input id="busca" type="search" placeholder="Buscar por cliente, telefone, ' +
        esc(cfg().equipamento.split(' (')[0].toLowerCase()) + ' ou nº" value="' + esc(termoBusca) + '"></label>' +
      '<div class="filtros" role="group" aria-label="Filtrar por etapa">' + FILTROS.map(function (f) {
        return '<button type="button" class="filtro' + (filtroStatus === f[0] ? ' ativo' : '') + '" data-filtro="' + f[0] + '" aria-pressed="' + (filtroStatus === f[0]) + '">' + f[1] + '</button>';
      }).join('') + '</div>' +
      (lista.length ? '<ul class="lista">' + lista.map(itemLista).join('') + '</ul>' : '<p class="fraco vazio">Nenhuma ordem encontrada.</p>');
  }

  /* ---------------- novo orçamento ---------------- */
  function rascunhoVazio() {
    return { cliente: { nome: '', whatsapp: '' }, equipamento: '', problema: '', itens: [{ descricao: '', qtd: 1, valor: '' }], desconto: '', validadeDias: 7, observacoes: '' };
  }
  function telaNova() {
    if (!rascunho) rascunho = rascunhoVazio();
    var d = rascunho, c = cfg();
    return '<h1 class="titulo">Novo orçamento</h1>' +
      '<form id="formNova" novalidate>' +
      '<fieldset><legend>Cliente</legend>' +
        campo('cliNome', 'Nome', d.cliente.nome, 'text', 'Ex.: Maria da Silva', 'autocomplete="off" required') +
        campo('cliWhats', 'WhatsApp', d.cliente.whatsapp, 'tel', '(31) 99999-9999', 'inputmode="tel"') +
      '</fieldset>' +
      '<fieldset><legend>Serviço</legend>' +
        campo('equip', c.equipamento, d.equipamento, 'text', c.exemploEquipamento, '') +
        '<label class="campo"><span>Problema relatado</span><textarea id="problema" rows="2" placeholder="' + esc(c.problema) + '">' + esc(d.problema) + '</textarea></label>' +
      '</fieldset>' +
      '<fieldset><legend>Itens</legend>' +
        '<div class="sugestoes"><span class="fraco">Toque para adicionar:</span> ' + c.itens.map(function (it, i) {
          return '<button type="button" class="chip" data-sugestao="' + i + '">' + esc(it[0]) + ' · ' + esc(S.formatarMoeda(it[1])) + '</button>';
        }).join('') + '</div>' +
        '<div id="itens">' + d.itens.map(linhaItem).join('') + '</div>' +
        '<button type="button" class="botao" id="addItem">+ Item em branco</button>' +
      '</fieldset>' +
      '<fieldset><legend>Condições</legend><div class="dupla">' +
        campo('desconto', 'Desconto (R$)', d.desconto, 'text', '0,00', 'inputmode="decimal"') +
        campo('validade', 'Validade (dias)', d.validadeDias, 'number', '7', 'min="1" max="90"') +
        '</div><label class="campo"><span>Observações para o cliente</span><textarea id="obs" rows="2" placeholder="Ex.: peças com garantia do fabricante, prazo de 2 dias úteis…">' + esc(d.observacoes) + '</textarea></label>' +
      '</fieldset>' +
      '<div class="totais" id="totais" aria-live="polite"></div>' +
      '<div id="erros" class="erros" role="alert"></div>' +
      '<div class="acoes"><button type="submit" class="botao principal">Salvar orçamento</button>' +
      '<button type="button" class="botao" id="limpar">Limpar</button></div>' +
      '</form>';
  }
  function campo(id, rotulo, valor, tipo, ph, extra) {
    return '<label class="campo"><span>' + esc(rotulo) + '</span><input id="' + id + '" type="' + tipo + '" value="' + esc(valor) + '" placeholder="' + esc(ph) + '" ' + extra + '></label>';
  }
  function linhaItem(it, i) {
    return '<div class="item" data-i="' + i + '">' +
      '<label class="campo desc"><span>Descrição</span><input data-campo="descricao" value="' + esc(it.descricao) + '" placeholder="Serviço ou peça"></label>' +
      '<label class="campo qtd"><span>Qtd.</span><input data-campo="qtd" type="number" min="1" step="1" value="' + esc(it.qtd) + '"></label>' +
      '<label class="campo valor"><span>Valor (R$)</span><input data-campo="valor" inputmode="decimal" value="' + esc(it.valor === '' ? '' : String(it.valor).replace('.', ',')) + '" placeholder="0,00"></label>' +
      '<button type="button" class="remover" data-remover="' + i + '" aria-label="Remover item ' + (i + 1) + '">×</button></div>';
  }
  function lerFormulario() {
    var f = document.getElementById('formNova');
    if (!f) return;
    rascunho.cliente.nome = f.querySelector('#cliNome').value;
    rascunho.cliente.whatsapp = f.querySelector('#cliWhats').value;
    rascunho.equipamento = f.querySelector('#equip').value;
    rascunho.problema = f.querySelector('#problema').value;
    rascunho.desconto = f.querySelector('#desconto').value;
    rascunho.validadeDias = f.querySelector('#validade').value;
    rascunho.observacoes = f.querySelector('#obs').value;
    rascunho.itens = [].map.call(f.querySelectorAll('.item'), function (el) {
      return { descricao: el.querySelector('[data-campo=descricao]').value, qtd: el.querySelector('[data-campo=qtd]').value, valor: el.querySelector('[data-campo=valor]').value };
    });
  }
  function atualizarTotais() {
    var el = document.getElementById('totais');
    if (!el) return;
    var c = S.calcular(rascunho);
    el.innerHTML = '<span>Subtotal <b>' + S.formatarMoeda(c.subtotal) + '</b></span>' +
      (c.desconto ? '<span>Desconto <b>-' + S.formatarMoeda(c.desconto) + '</b></span>' : '') +
      '<span class="total">Total <b>' + S.formatarMoeda(c.total) + '</b></span>';
  }

  /* ---------------- detalhe / documento ---------------- */
  function telaOrdem(id) {
    var o = ordemPorId(id);
    if (!o) return '<p class="fraco">Ordem não encontrada.</p><a class="botao" href="#ordens">Voltar</a>';
    var c = S.calcular(o), emp = empresa();
    var proximas = S.TRANSICOES[o.status] || [];
    var rotAcao = { aprovado: 'Cliente aprovou', recusado: 'Cliente recusou', execucao: 'Iniciar serviço', pronto: 'Marcar como pronto', entregue: 'Marcar como entregue', orcamento: 'Reabrir orçamento' };
    var temWhats = !!S.normalizarWhats(o.cliente.whatsapp);
    var acoes = '';
    if (o.status === 'orcamento' && temWhats) acoes += '<a class="botao whats" target="_blank" rel="noopener" href="' + esc(S.linkWhats(o.cliente.whatsapp, S.mensagemOrcamento(o, emp))) + '">Enviar orçamento pelo WhatsApp</a>';
    if (o.status === 'pronto' && temWhats) acoes += '<a class="botao whats" target="_blank" rel="noopener" href="' + esc(S.linkWhats(o.cliente.whatsapp, S.mensagemPronto(o, emp))) + '">Avisar cliente que está pronto</a>';
    proximas.forEach(function (st) {
      acoes += '<button type="button" class="botao' + (st === 'recusado' ? ' perigo' : ' principal') + '" data-status="' + st + '">' + esc(rotAcao[st]) + '</button>';
    });
    acoes += '<button type="button" class="botao" id="imprimir">Imprimir / salvar PDF</button>';
    return '<a class="voltar" href="#ordens">‹ Ordens</a>' +
      '<div class="cabecalho-os"><h1 class="titulo">Ordem nº ' + esc(o.numero) + '</h1>' + selo(o.status) + '</div>' +
      (temWhats ? '' : '<p class="fraco">Sem WhatsApp do cliente: os botões de envio não aparecem.</p>') +
      '<div class="acoes acoes-os">' + acoes + '</div>' +
      '<article class="documento" aria-label="Orçamento nº ' + esc(o.numero) + '">' +
        '<header class="doc-topo"><div><strong class="doc-empresa">' + esc(emp.nome) + '</strong><small>' + esc(cfg().rotulo) + ' · WhatsApp <span class="nw">' + esc(S.formatarTelefone(emp.whatsapp)) + '</span></small></div>' +
        '<div class="doc-num"><span>' + (o.status === 'orcamento' || o.status === 'recusado' ? 'Orçamento' : 'Ordem de serviço') + '</span><strong>nº ' + esc(o.numero) + '</strong><small>' + esc(S.dataCurta(o.criadaEm)) + '</small></div></header>' +
        '<dl class="doc-dados"><div><dt>Cliente</dt><dd>' + esc(o.cliente.nome) + (temWhats ? ' · <span class="nw">' + esc(S.formatarTelefone(o.cliente.whatsapp)) + '</span>' : '') + '</dd></div>' +
        (o.equipamento ? '<div><dt>' + esc(cfg().equipamento) + '</dt><dd>' + esc(o.equipamento) + '</dd></div>' : '') +
        (o.problema ? '<div><dt>Problema relatado</dt><dd>' + esc(o.problema) + '</dd></div>' : '') + '</dl>' +
        '<table class="doc-itens"><thead><tr><th>Item</th><th class="n">Qtd.</th><th class="n">Valor</th><th class="n">Subtotal</th></tr></thead><tbody>' +
        o.itens.map(function (it) {
          return '<tr><td>' + esc(it.descricao) + '</td><td class="n">' + esc(it.qtd) + '</td><td class="n">' + esc(S.formatarMoeda(it.valor)) + '</td><td class="n">' + esc(S.formatarMoeda(it.qtd * it.valor)) + '</td></tr>';
        }).join('') + '</tbody><tfoot>' +
        (c.desconto ? '<tr><td colspan="3">Subtotal</td><td class="n">' + S.formatarMoeda(c.subtotal) + '</td></tr><tr><td colspan="3">Desconto</td><td class="n">-' + S.formatarMoeda(c.desconto) + '</td></tr>' : '') +
        '<tr class="doc-total"><td colspan="3">Total</td><td class="n">' + S.formatarMoeda(c.total) + '</td></tr></tfoot></table>' +
        (o.status === 'orcamento' ? '<p class="doc-validade">Orçamento válido até ' + esc(S.dataCurta(S.validadeAte(o))) + '.</p>' : '') +
        (o.observacoes ? '<p class="doc-obs">' + esc(o.observacoes) + '</p>' : '') +
        '<footer class="doc-rodape">Documento de demonstração · empresa fictícia · gerado pelo sistema LeonTech</footer>' +
      '</article>' +
      '<section class="bloco historico"><h2>Histórico</h2><ol>' + o.historico.slice().reverse().map(function (h) {
        var d = new Date(h.em);
        return '<li>' + selo(h.status) + ' <span class="fraco">' + esc(S.dataCurta(h.em)) + ' ' + esc(('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)) + '</span></li>';
      }).join('') + '</ol></section>';
  }

  /* ---------------- roteador ---------------- */
  function render() {
    var partes = (location.hash || '#painel').slice(1).split('/');
    var html;
    if (partes[0] === 'ordens') {
      if (partes[1] !== undefined) { filtroStatus = partes[1] || ''; }
      html = telaOrdens();
    } else if (partes[0] === 'nova') html = telaNova();
    else if (partes[0] === 'os') html = telaOrdem(partes[1]);
    else html = telaPainel();
    raiz.innerHTML = html;
    pintarCabecalho();
    if (partes[0] === 'nova') atualizarTotais();
    var foco = raiz.querySelector('h1');
    if (foco && render.navegou) { foco.setAttribute('tabindex', '-1'); foco.focus({ preventScroll: true }); }
    render.navegou = true;
    window.scrollTo(0, 0);
  }

  /* ---------------- eventos ---------------- */
  raiz.addEventListener('input', function (ev) {
    if (ev.target.id === 'busca') {
      termoBusca = ev.target.value;
      var pos = ev.target.selectionStart;
      raiz.innerHTML = telaOrdens();
      var b = document.getElementById('busca'); b.focus(); try { b.setSelectionRange(pos, pos); } catch (e) {}
      return;
    }
    if (rascunho && document.getElementById('formNova')) { lerFormulario(); atualizarTotais(); }
  });

  raiz.addEventListener('click', function (ev) {
    var alvo = ev.target.closest('button');
    if (!alvo) return;
    if (alvo.dataset.filtro !== undefined) {
      filtroStatus = alvo.dataset.filtro;
      history.replaceState(null, '', '#ordens/' + filtroStatus);
      raiz.innerHTML = telaOrdens();
      return;
    }
    if (alvo.dataset.sugestao !== undefined) {
      lerFormulario();
      var s = cfg().itens[Number(alvo.dataset.sugestao)];
      var vazio = rascunho.itens.filter(function (it) { return !String(it.descricao).trim(); })[0];
      if (vazio) { vazio.descricao = s[0]; vazio.qtd = 1; vazio.valor = s[1]; }
      else rascunho.itens.push({ descricao: s[0], qtd: 1, valor: s[1] });
      document.getElementById('itens').innerHTML = rascunho.itens.map(linhaItem).join('');
      atualizarTotais();
      return;
    }
    if (alvo.id === 'addItem') {
      lerFormulario(); rascunho.itens.push({ descricao: '', qtd: 1, valor: '' });
      document.getElementById('itens').innerHTML = rascunho.itens.map(linhaItem).join('');
      var ult = raiz.querySelectorAll('.item [data-campo=descricao]'); ult[ult.length - 1].focus();
      return;
    }
    if (alvo.dataset.remover !== undefined) {
      lerFormulario(); rascunho.itens.splice(Number(alvo.dataset.remover), 1);
      if (!rascunho.itens.length) rascunho.itens.push({ descricao: '', qtd: 1, valor: '' });
      document.getElementById('itens').innerHTML = rascunho.itens.map(linhaItem).join('');
      atualizarTotais();
      return;
    }
    if (alvo.id === 'limpar') { rascunho = rascunhoVazio(); render(); return; }
    if (alvo.id === 'imprimir') { window.print(); return; }
    if (alvo.dataset.status) {
      var o = ordemPorId(location.hash.split('/')[1]);
      try {
        S.mudarStatus(o, alvo.dataset.status);
        gravar(); render();
        aviso('Ordem nº ' + o.numero + ': ' + S.rotuloStatus(o.status) + '.', 'ok');
      } catch (e) { aviso(e.message, 'erro'); }
    }
  });

  raiz.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'formNova') return;
    ev.preventDefault();
    lerFormulario();
    var erros = S.validarOrdem(rascunho);
    var caixa = document.getElementById('erros');
    if (erros.length) {
      caixa.innerHTML = '<ul>' + erros.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
      caixa.focus && caixa.setAttribute('tabindex', '-1'); caixa.focus();
      return;
    }
    var o = S.novaOrdem(estado, rascunho);
    rascunho = null;
    gravar();
    location.hash = '#os/' + o.id;
    aviso('Orçamento nº ' + o.numero + ' salvo.', 'ok');
  });

  document.getElementById('nicho').addEventListener('change', function (ev) {
    if (estado.ordens.length && !confirmarTroca()) { ev.target.value = estado.nicho; return; }
    estado = S.criarDemo(ev.target.value); rascunho = null; gravar();
    location.hash = '#painel'; render();
    aviso('Demonstração trocada para ' + cfg().rotulo + '.', 'ok');
  });
  function confirmarTroca() { return window.confirm('Trocar o tipo de negócio recria os dados de exemplo. Continuar?'); }

  document.getElementById('zerar').addEventListener('click', function () {
    if (!window.confirm('Apagar as alterações e voltar aos dados de exemplo?')) return;
    estado = S.criarDemo(estado.nicho); rascunho = null; gravar();
    location.hash = '#painel'; render();
    aviso('Dados de exemplo restaurados.', 'ok');
  });

  window.addEventListener('hashchange', render);
  render();
  if (semArmazenamento) aviso('Este navegador não permite salvar: as alterações somem ao fechar a página.', 'erro');

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
