/* Telas do Catálogo com pedido pelo WhatsApp (demonstração). Regras em catalogo.js. */
(function () {
  'use strict';
  var C = window.Catalogo;
  var estado = C.carregar() || C.criarDemo('lanchonete');
  var semArmazenamento = !C.salvar(estado);
  var raiz = document.getElementById('app');
  var carrinho = [];
  var form = formVazio();
  var ultimo = null;

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cfg() { return C.cfgDe(estado); }
  function gravar() { C.salvar(estado); }
  function formVazio() { return { modo: 'entrega', endereco: '', pagamento: 'pix', troco: '', observacoes: '', cliente: { nome: '', whatsapp: '' } }; }
  function selo(st) { return '<span class="selo selo-' + esc(st) + '">' + esc(C.rotuloStatus(st)) + '</span>'; }
  function aviso(msg, tipo) {
    var el = document.getElementById('aviso'); el.textContent = msg; el.className = 'aviso mostrar ' + (tipo || '');
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { el.className = 'aviso'; }, 3000);
  }
  function qtdNoCarrinho(id) { var it = carrinho.filter(function (x) { return x.id === id; })[0]; return it ? it.qtd : 0; }

  function pintarCabecalho() {
    document.documentElement.style.setProperty('--marca', cfg().cor);
    document.getElementById('nomeEmpresa').textContent = cfg().empresa;
    document.getElementById('nichoEmpresa').textContent = cfg().horario + ' · ' + cfg().endereco;
    document.getElementById('nicho').value = estado.nicho;
    document.title = 'Catálogo — ' + cfg().empresa;
    var aba = (location.hash || '#loja').split('/')[0];
    if (aba === '#pedir' || aba === '#feito') aba = '#loja';
    [].forEach.call(document.querySelectorAll('.abas a'), function (a) {
      var ativa = a.getAttribute('href') === aba; a.classList.toggle('ativa', ativa);
      if (ativa) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var c = C.calcular(estado, carrinho, form.modo);
    var barra = document.getElementById('barraCarrinho');
    var naLoja = (location.hash || '#loja') === '#loja';
    barra.hidden = !(naLoja && c.quantidade > 0);
    barra.innerHTML = '<span><strong>' + c.quantidade + (c.quantidade === 1 ? ' item' : ' itens') + '</strong> · ' + esc(C.formatarMoeda(c.subtotal)) + '</span><a class="botao claro" href="#pedir">Ver pedido</a>';
  }

  /* ---------------- loja (cliente) ---------------- */
  function telaLoja() {
    var c = cfg();
    return '<p class="visao">Visão do <strong>cliente</strong>: o catálogo que vai no Instagram, no Google e no status do WhatsApp.</p>' +
      '<div class="info-loja"><span>Entrega ' + esc(C.formatarMoeda(c.taxaEntrega)) + '</span><span>Pedido mínimo para entrega ' + esc(C.formatarMoeda(c.pedidoMinimo)) + '</span><span>Retirada sem taxa</span></div>' +
      '<nav class="categorias" aria-label="Categorias">' + c.categorias.map(function (cat, i) { return '<a href="#loja" data-cat="' + i + '">' + esc(cat.nome) + '</a>'; }).join('') + '</nav>' +
      c.categorias.map(function (cat, i) {
        return '<section class="categoria" id="cat-' + i + '"><h2>' + esc(cat.nome) + '</h2><ul class="produtos">' + cat.produtos.map(function (pp) {
          var p = C.produto(estado, pp[0]), q = qtdNoCarrinho(p.id);
          return '<li class="produto' + (p.esgotado ? ' esgotado' : '') + '"><div class="foto" aria-hidden="true">' + esc(p.nome.charAt(0)) + '</div>' +
            '<div class="dados"><strong>' + esc(p.nome) + '</strong><small>' + esc(p.descricao) + '</small><span class="preco">' + esc(C.formatarMoeda(p.preco)) + '</span></div>' +
            '<div class="qtd">' + (p.esgotado ? '<span class="selo selo-cancelado">Esgotado</span>' :
              (q ? '<button type="button" class="mais-menos" data-menos="' + esc(p.id) + '" aria-label="Tirar um ' + esc(p.nome) + '">−</button><span aria-live="polite">' + q + '</span>' : '') +
              '<button type="button" class="mais-menos mais" data-mais="' + esc(p.id) + '" aria-label="Adicionar ' + esc(p.nome) + '">+</button>') + '</div></li>';
        }).join('') + '</ul></section>';
      }).join('');
  }

  function telaPedir() {
    var c = C.calcular(estado, carrinho, form.modo), f = form;
    if (!c.itens.length) return '<p class="fraco vazio">Seu pedido está vazio.</p><a class="botao principal" href="#loja">Ver produtos</a>';
    return '<a class="voltar" href="#loja">‹ Continuar escolhendo</a><h1 class="titulo">Seu pedido</h1>' +
      '<ul class="itens-pedido">' + c.itens.map(function (i) {
        return '<li><span class="q"><button type="button" class="mais-menos" data-menos="' + esc(i.id) + '" aria-label="Tirar um ' + esc(i.nome) + '">−</button>' + i.qtd +
          '<button type="button" class="mais-menos" data-mais="' + esc(i.id) + '" aria-label="Adicionar ' + esc(i.nome) + '">+</button></span><span class="nome">' + esc(i.nome) + (i.esgotado ? ' <span class="selo selo-cancelado">esgotou</span>' : '') +
          '</span><span class="v">' + esc(C.formatarMoeda(i.subtotal)) + '</span></li>';
      }).join('') + '</ul>' +
      '<form id="formPedido" novalidate>' +
      '<fieldset><legend>Como quer receber?</legend><div class="opcoes">' +
        radio('modo', 'entrega', 'Entrega (' + C.formatarMoeda(cfg().taxaEntrega) + ')', f.modo) + radio('modo', 'retirada', 'Retirar no local', f.modo) + '</div>' +
        (f.modo === 'entrega' ? '<label class="campo"><span>Endereço completo</span><input id="endereco" autocomplete="street-address" value="' + esc(f.endereco) + '" placeholder="Rua, número, complemento e bairro"></label>' :
          '<p class="fraco">Retirada em: ' + esc(cfg().endereco) + '</p>') + '</fieldset>' +
      '<fieldset><legend>Pagamento</legend><div class="opcoes">' + Object.keys(C.PAGAMENTOS).map(function (k) { return radio('pagamento', k, C.PAGAMENTOS[k], f.pagamento); }).join('') + '</div>' +
        (f.pagamento === 'dinheiro' ? '<label class="campo"><span>Troco para (opcional)</span><input id="troco" inputmode="decimal" value="' + esc(f.troco) + '" placeholder="Ex.: 100"></label>' : '') + '</fieldset>' +
      '<fieldset><legend>Seus dados</legend>' +
        '<label class="campo"><span>Nome</span><input id="nome" autocomplete="name" value="' + esc(f.cliente.nome) + '" placeholder="Seu nome"></label>' +
        '<label class="campo"><span>WhatsApp</span><input id="whats" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(f.cliente.whatsapp) + '" placeholder="(31) 99999-9999"></label>' +
        '<label class="campo"><span>Observação (opcional)</span><input id="obs" maxlength="300" value="' + esc(f.observacoes) + '" placeholder="Ex.: sem cebola, campainha não funciona…"></label></fieldset>' +
      '<div class="totais" aria-live="polite">' + (c.taxa ? '<span>Subtotal <b>' + C.formatarMoeda(c.subtotal) + '</b></span><span>Entrega <b>' + C.formatarMoeda(c.taxa) + '</b></span>' : '') +
        '<span class="total">Total <b>' + C.formatarMoeda(c.total) + '</b></span></div>' +
      '<div id="erros" class="erros" role="alert"></div>' +
      '<button type="submit" class="botao whats largo">Enviar pedido pelo WhatsApp</button>' +
      '<p class="fraco pequeno">O pedido vai pronto para o WhatsApp da loja, que confirma e combina o pagamento. Seus dados são usados só para este pedido (LGPD).</p></form>';
  }
  function radio(nome, valor, rotulo, atual) {
    return '<label class="opcao' + (atual === valor ? ' escolhida' : '') + '"><input type="radio" name="' + nome + '" value="' + valor + '"' + (atual === valor ? ' checked' : '') + '>' + esc(rotulo) + '</label>';
  }

  function telaFeito() {
    var p = ultimo;
    return '<div class="sucesso"><div class="icone-ok" aria-hidden="true">✓</div><h1 class="titulo">Pedido nº ' + esc(p.numero) + ' pronto!</h1>' +
      '<p>Total ' + esc(C.formatarMoeda(p.total)) + ' · ' + (p.modo === 'entrega' ? 'entrega' : 'retirada') + '</p>' +
      '<p class="fraco">Toque abaixo para enviar ao WhatsApp da ' + esc(cfg().empresa) + '. A loja confirma o pedido por lá.</p>' +
      '<a class="botao whats largo" target="_blank" rel="noopener" href="' + esc(C.linkWhats(cfg().whatsapp, C.mensagemPedido(p, estado))) + '">Abrir o WhatsApp com o pedido</a>' +
      '<div class="acoes"><a class="botao" href="#loja">Fazer outro pedido</a><a class="botao" href="#pedidos">Ver como a loja recebe</a></div></div>';
  }

  /* ---------------- pedidos (dono) ---------------- */
  function telaPedidos() {
    var r = C.resumo(estado);
    return '<p class="visao">Visão do <strong>dono</strong>: pedidos do dia, andamento e produtos esgotados.</p>' +
      '<div class="cartoes">' + cartao(r.pedidos, 'pedidos hoje') + cartao(C.formatarMoeda(r.faturamento), 'vendido hoje') +
        cartao(C.formatarMoeda(r.ticketMedio), 'ticket médio') + cartao(r.abertos, 'em andamento') + '</div>' +
      (r.maisVendidos.length ? '<p class="fraco">Mais vendidos hoje: ' + r.maisVendidos.map(function (m) { return esc(m[0]) + ' (' + m[1] + ')'; }).join(', ') + '</p>' : '') +
      '<h2 class="sub">Pedidos</h2><ul class="lista">' + estado.pedidos.map(itemPedido).join('') + '</ul>' +
      '<h2 class="sub">Produtos esgotados</h2><p class="fraco">Marque o que acabou: some o botão de adicionar no catálogo.</p><ul class="esgotados">' +
      cfg().categorias.map(function (cat) {
        return cat.produtos.map(function (pp) {
          var p = C.produto(estado, pp[0]);
          return '<li><label><input type="checkbox" data-esgotar="' + esc(p.id) + '"' + (p.esgotado ? ' checked' : '') + '> ' + esc(p.nome) + '</label></li>';
        }).join('');
      }).join('') + '</ul>';
  }
  function cartao(v, rot) { return '<div class="cartao"><strong>' + esc(v) + '</strong><span>' + esc(rot) + '</span></div>'; }
  function itemPedido(p) {
    var prox = C.TRANSICOES[p.status] || [];
    var rot = { preparo: 'Iniciar preparo', pronto: p.modo === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirar', entregue: 'Entregue', cancelado: 'Cancelar' };
    var d = new Date(p.criadoEm);
    return '<li class="pedido' + (p.status === 'cancelado' ? ' cancelado' : '') + '"><div class="linha1"><strong>nº ' + esc(p.numero) + ' · ' + esc(p.cliente.nome) + '</strong>' + selo(p.status) + '</div>' +
      '<div class="fraco">' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' · ' + (p.modo === 'entrega' ? 'Entrega: ' + esc(p.endereco) : 'Retirada') +
      ' · ' + esc(C.PAGAMENTOS[p.pagamento]) + (p.troco ? ' (troco para ' + esc(C.formatarMoeda(p.troco)) + ')' : '') + '</div>' +
      '<div class="itens">' + p.itens.map(function (i) { return esc(i.qtd + 'x ' + i.nome); }).join(' · ') + ' · <strong>' + esc(C.formatarMoeda(p.total)) + '</strong></div>' +
      (p.observacoes ? '<div class="obs">Obs.: ' + esc(p.observacoes) + '</div>' : '') +
      (prox.length || C.normalizarWhats(p.cliente.whatsapp) ? '<div class="acoes">' +
        prox.map(function (st) { return '<button type="button" class="botao' + (st === 'cancelado' ? ' perigo' : ' principal') + '" data-status="' + st + '" data-id="' + esc(p.id) + '">' + esc(rot[st]) + '</button>'; }).join('') +
        '<a class="botao" target="_blank" rel="noopener" href="' + esc(C.linkWhats(p.cliente.whatsapp, 'Olá, ' + p.cliente.nome.split(' ')[0] + '! Aqui é da ' + cfg().empresa + ', sobre o seu pedido nº ' + p.numero + '.')) + '">WhatsApp do cliente</a></div>' : '') + '</li>';
  }

  /* ---------------- roteador e eventos ---------------- */
  function render() {
    var rota = (location.hash || '#loja').slice(1);
    raiz.innerHTML = rota === 'pedir' ? telaPedir() : rota === 'pedidos' ? telaPedidos() : (rota === 'feito' && ultimo ? telaFeito() : telaLoja());
    pintarCabecalho();
  }

  raiz.addEventListener('click', function (ev) {
    var cat = ev.target.closest('[data-cat]');
    if (cat) { ev.preventDefault(); var s = document.getElementById('cat-' + cat.dataset.cat); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.mais) {
      try { C.adicionar(estado, carrinho, b.dataset.mais, 1); } catch (e) { aviso(e.message, 'erro'); }
      var y = window.scrollY; render(); window.scrollTo(0, y); return;
    }
    if (b.dataset.menos) { C.alterarQtd(carrinho, b.dataset.menos, qtdNoCarrinho(b.dataset.menos) - 1); var y2 = window.scrollY; render(); window.scrollTo(0, y2); return; }
    if (b.dataset.status) {
      var p = estado.pedidos.filter(function (x) { return x.id === b.dataset.id; })[0];
      if (b.dataset.status === 'cancelado' && !window.confirm('Cancelar o pedido nº ' + p.numero + '?')) return;
      try { C.mudarStatus(p, b.dataset.status); gravar(); render(); aviso('Pedido nº ' + p.numero + ': ' + C.rotuloStatus(p.status) + '.', 'ok'); } catch (e) { aviso(e.message, 'erro'); }
    }
  });

  raiz.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.dataset.esgotar) { var es = C.alternarEsgotado(estado, t.dataset.esgotar); gravar(); aviso(C.produto(estado, t.dataset.esgotar).nome + (es ? ' marcado como esgotado.' : ' disponível de novo.'), 'ok'); return; }
    if (t.name === 'modo' || t.name === 'pagamento') { lerForm(); form[t.name] = t.value; render(); }
  });
  raiz.addEventListener('input', function () { if (document.getElementById('formPedido')) lerForm(); });
  function lerForm() {
    var g = function (id) { var e = document.getElementById(id); return e ? e.value : null; };
    if (g('endereco') !== null) form.endereco = g('endereco');
    if (g('troco') !== null) form.troco = g('troco');
    form.observacoes = g('obs') || ''; form.cliente.nome = g('nome') || ''; form.cliente.whatsapp = g('whats') || '';
  }

  raiz.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'formPedido') return;
    ev.preventDefault(); lerForm();
    var dados = { carrinho: carrinho, modo: form.modo, endereco: form.endereco, pagamento: form.pagamento, troco: form.troco, observacoes: form.observacoes, cliente: form.cliente };
    var erros = C.validarPedido(estado, dados);
    if (erros.length) {
      var caixa = document.getElementById('erros');
      caixa.innerHTML = '<ul>' + erros.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
      caixa.setAttribute('tabindex', '-1'); caixa.focus(); return;
    }
    ultimo = C.criarPedido(estado, dados); gravar();
    carrinho = []; var manter = form.cliente; form = formVazio(); form.cliente = { nome: manter.nome, whatsapp: manter.whatsapp };
    location.hash = '#feito';
  });

  document.getElementById('nicho').addEventListener('change', function (ev) {
    if (!window.confirm('Trocar o tipo de negócio recria os dados de exemplo. Continuar?')) { ev.target.value = estado.nicho; return; }
    estado = C.criarDemo(ev.target.value); carrinho = []; form = formVazio(); ultimo = null; gravar(); location.hash = '#loja'; render();
    aviso('Demonstração trocada para ' + cfg().rotulo + '.', 'ok');
  });
  document.getElementById('zerar').addEventListener('click', function () {
    if (!window.confirm('Apagar as alterações e voltar aos dados de exemplo?')) return;
    estado = C.criarDemo(estado.nicho); carrinho = []; form = formVazio(); ultimo = null; gravar(); render();
    aviso('Dados de exemplo restaurados.', 'ok');
  });

  window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
  render();
  if (semArmazenamento) aviso('Este navegador não permite salvar: as alterações somem ao fechar a página.', 'erro');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
