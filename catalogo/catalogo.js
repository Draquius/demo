/*
 * Catálogo com pedido pelo WhatsApp — lógica (sem telas), usada por index.html e pelos testes.
 * Demonstração: dados só no navegador (localStorage), com loja fictícia. Sem pagamento online:
 * o pedido vai pronto para o WhatsApp da loja, que combina o pagamento (Pix, dinheiro ou cartão na entrega).
 */
(function (global) {
  'use strict';

  var CHAVE_DADOS = 'leontech_catalogo_demo_v1';
  var VERSAO_DADOS = 1;

  var STATUS = [
    { id: 'novo', rotulo: 'Novo' }, { id: 'preparo', rotulo: 'Em preparo' }, { id: 'pronto', rotulo: 'Pronto / saiu' },
    { id: 'entregue', rotulo: 'Entregue' }, { id: 'cancelado', rotulo: 'Cancelado' }
  ];
  var TRANSICOES = { novo: ['preparo', 'cancelado'], preparo: ['pronto', 'cancelado'], pronto: ['entregue'], entregue: [], cancelado: [] };
  var PAGAMENTOS = { pix: 'Pix', dinheiro: 'Dinheiro', cartao: 'Cartão na entrega/retirada' };

  /* Produto: [id, nome, descrição, preço]. */
  var NICHOS_CATALOGO = {
    lanchonete: {
      rotulo: 'Lanchonete', empresa: 'Lanche Bom Exemplo', whatsapp: '5531992868113', cor: '#b91c1c',
      endereco: 'Rua Exemplo, 300 · Centro', horario: 'Ter. a dom., 18h às 23h', taxaEntrega: 6, pedidoMinimo: 25,
      categorias: [
        { nome: 'Hambúrgueres', produtos: [['x-burguer', 'X-Burguer', 'Pão, carne 150 g, queijo e molho da casa', 24], ['x-bacon', 'X-Bacon', 'Pão, carne 150 g, queijo, bacon e cebola', 29], ['x-salada', 'X-Salada', 'Pão, carne 150 g, queijo, alface e tomate', 26]] },
        { nome: 'Porções', produtos: [['batata', 'Batata frita', 'Porção de 400 g', 22], ['onion', 'Anéis de cebola', 'Porção de 300 g', 24]] },
        { nome: 'Bebidas', produtos: [['refri-lata', 'Refrigerante lata', '350 ml', 6], ['suco', 'Suco natural', '500 ml', 9]] }
      ]
    },
    confeitaria: {
      rotulo: 'Confeitaria', empresa: 'Doce Encanto Exemplo', whatsapp: '5531992868113', cor: '#c2410c',
      endereco: 'Rua Exemplo, 12 · Bairro Exemplo', horario: 'Seg. a sáb., 9h às 19h', taxaEntrega: 8, pedidoMinimo: 40,
      categorias: [
        { nome: 'Bolos', produtos: [['bolo-cenoura', 'Bolo de cenoura com chocolate', 'Inteiro, cerca de 1 kg', 45], ['bolo-fuba', 'Bolo de fubá', 'Inteiro, cerca de 900 g', 35], ['bolo-red', 'Red velvet', 'Inteiro, cerca de 1,2 kg', 75]] },
        { nome: 'Doces', produtos: [['brigadeiro', 'Brigadeiro gourmet', 'Caixa com 12', 30], ['brownie', 'Brownie', 'Unidade', 9]] },
        { nome: 'Salgados', produtos: [['coxinha', 'Coxinha', 'Cento (para festas)', 90], ['empada', 'Empada de frango', 'Unidade', 7]] }
      ]
    },
    acai: {
      rotulo: 'Açaí', empresa: 'Açaí da Praça Exemplo', whatsapp: '5531992868113', cor: '#6d28d9',
      endereco: 'Praça Exemplo, 5', horario: 'Todos os dias, 13h às 22h', taxaEntrega: 5, pedidoMinimo: 20,
      categorias: [
        { nome: 'Açaí', produtos: [['acai-300', 'Açaí 300 ml', 'Com 2 acompanhamentos', 16], ['acai-500', 'Açaí 500 ml', 'Com 3 acompanhamentos', 22], ['acai-700', 'Açaí 700 ml', 'Com 4 acompanhamentos', 28]] },
        { nome: 'Extras', produtos: [['leite-ninho', 'Leite em pó', 'Porção extra', 3], ['nutella', 'Creme de avelã', 'Porção extra', 5]] },
        { nome: 'Bebidas', produtos: [['agua', 'Água mineral', '500 ml', 4]] }
      ]
    },
    hortifruti: {
      rotulo: 'Hortifrúti', empresa: 'Hortifrúti Verde Exemplo', whatsapp: '5531992868113', cor: '#15803d',
      endereco: 'Avenida Exemplo, 900', horario: 'Seg. a sáb., 7h às 20h', taxaEntrega: 7, pedidoMinimo: 50,
      categorias: [
        { nome: 'Frutas', produtos: [['banana', 'Banana prata', 'Dúzia', 9], ['maca', 'Maçã', '1 kg', 11], ['mamao', 'Mamão formosa', 'Unidade', 8]] },
        { nome: 'Verduras e legumes', produtos: [['alface', 'Alface crespa', 'Unidade', 4], ['tomate', 'Tomate', '1 kg', 8], ['batata-inglesa', 'Batata', '1 kg', 6]] },
        { nome: 'Cestas', produtos: [['cesta-semana', 'Cesta da semana', 'Frutas e verduras da estação, cerca de 6 kg', 65]] }
      ]
    }
  };

  /* ---------------- utilidades ---------------- */
  function arred(n) { return Math.round((Number(n) || 0) * 100) / 100; }
  function formatarMoeda(n) { var p = arred(n).toFixed(2).split('.'); return 'R$ ' + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + p[1]; }
  function lerValor(t) {
    if (typeof t === 'number') return isFinite(t) ? arred(t) : 0;
    var s = String(t || '').replace(/[^\d,.]/g, ''); if (!s) return 0;
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s); return isFinite(n) ? arred(n) : 0;
  }
  function soDigitos(t) { return String(t || '').replace(/\D/g, ''); }
  function normalizarWhats(tel) {
    var d = soDigitos(tel);
    if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length !== 10 && d.length !== 11) return '';
    if (d.length === 11 && d.charAt(2) !== '9') return '';
    return '55' + d;
  }
  function formatarTelefone(tel) {
    var d = normalizarWhats(tel).slice(2); if (!d) return String(tel || '');
    return d.length === 11 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7) : '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  }
  function rotuloStatus(id) { for (var i = 0; i < STATUS.length; i++) if (STATUS[i].id === id) return STATUS[i].rotulo; return id; }
  function cfgDe(estado) { return NICHOS_CATALOGO[estado.nicho] || NICHOS_CATALOGO.lanchonete; }
  function produto(estado, id) {
    var cats = cfgDe(estado).categorias;
    for (var i = 0; i < cats.length; i++) for (var j = 0; j < cats[i].produtos.length; j++) {
      var p = cats[i].produtos[j];
      if (p[0] === id) return { id: p[0], nome: p[1], descricao: p[2], preco: p[3], categoria: cats[i].nome, esgotado: !!(estado.esgotados && estado.esgotados[id]) };
    }
    return null;
  }

  /* ---------------- carrinho ---------------- */
  function adicionar(estado, carrinho, id, qtd) {
    var p = produto(estado, id);
    if (!p) throw new Error('Produto inexistente.');
    if (p.esgotado) throw new Error(p.nome + ' está esgotado.');
    var q = Math.max(1, Math.floor(Number(qtd) || 1));
    var it = carrinho.filter(function (x) { return x.id === id; })[0];
    if (it) it.qtd = Math.min(99, it.qtd + q); else carrinho.push({ id: id, qtd: Math.min(99, q) });
    return carrinho;
  }
  function alterarQtd(carrinho, id, qtd) {
    var q = Math.floor(Number(qtd) || 0);
    for (var i = carrinho.length - 1; i >= 0; i--) if (carrinho[i].id === id) {
      if (q <= 0) carrinho.splice(i, 1); else carrinho[i].qtd = Math.min(99, q);
    }
    return carrinho;
  }
  function itensDetalhados(estado, carrinho) {
    return carrinho.map(function (it) { var p = produto(estado, it.id); return p ? { id: p.id, nome: p.nome, qtd: it.qtd, preco: p.preco, subtotal: arred(p.preco * it.qtd), esgotado: p.esgotado } : null; })
      .filter(Boolean);
  }
  function calcular(estado, carrinho, modo) {
    var itens = itensDetalhados(estado, carrinho);
    var subtotal = arred(itens.reduce(function (s, i) { return s + i.subtotal; }, 0));
    var taxa = modo === 'entrega' && itens.length ? cfgDe(estado).taxaEntrega : 0;
    return { itens: itens, quantidade: itens.reduce(function (s, i) { return s + i.qtd; }, 0), subtotal: subtotal, taxa: taxa, total: arred(subtotal + taxa) };
  }

  /* ---------------- pedido ---------------- */
  function validarPedido(estado, dados) {
    var erros = [], cfg = cfgDe(estado), c = calcular(estado, dados.carrinho || [], dados.modo);
    if (!c.itens.length) erros.push('Escolha pelo menos um produto.');
    c.itens.filter(function (i) { return i.esgotado; }).forEach(function (i) { erros.push(i.nome + ' acabou de esgotar: tire do pedido.'); });
    if (String(dados.cliente && dados.cliente.nome || '').trim().length < 2) erros.push('Informe o seu nome.');
    if (!normalizarWhats(dados.cliente && dados.cliente.whatsapp)) erros.push('Informe um WhatsApp válido, com DDD.');
    if (dados.modo !== 'entrega' && dados.modo !== 'retirada') erros.push('Escolha entrega ou retirada.');
    if (dados.modo === 'entrega') {
      if (String(dados.endereco || '').trim().length < 8) erros.push('Informe o endereço completo para entrega.');
      if (c.subtotal > 0 && c.subtotal < cfg.pedidoMinimo) erros.push('O pedido mínimo para entrega é ' + formatarMoeda(cfg.pedidoMinimo) + '.');
    }
    if (!PAGAMENTOS[dados.pagamento]) erros.push('Escolha a forma de pagamento.');
    if (dados.pagamento === 'dinheiro' && dados.troco && lerValor(dados.troco) < c.total) erros.push('O troco precisa ser para um valor maior que o total.');
    return erros;
  }

  function criarPedido(estado, dados, agora) {
    var erros = validarPedido(estado, dados);
    if (erros.length) throw new Error(erros.join(' '));
    var c = calcular(estado, dados.carrinho, dados.modo), quando = (agora || new Date()).toISOString();
    var p = {
      id: 'pd' + estado.seq + '-' + Math.random().toString(36).slice(2, 7), numero: estado.seq, criadoEm: quando,
      cliente: { nome: String(dados.cliente.nome).trim(), whatsapp: normalizarWhats(dados.cliente.whatsapp) },
      itens: c.itens.map(function (i) { return { id: i.id, nome: i.nome, qtd: i.qtd, preco: i.preco }; }),
      modo: dados.modo, endereco: dados.modo === 'entrega' ? String(dados.endereco).trim() : '',
      pagamento: dados.pagamento, troco: dados.pagamento === 'dinheiro' && dados.troco ? lerValor(dados.troco) : 0,
      observacoes: String(dados.observacoes || '').trim().slice(0, 300),
      subtotal: c.subtotal, taxa: c.taxa, total: c.total,
      status: 'novo', historico: [{ status: 'novo', em: quando }]
    };
    estado.seq++;
    estado.pedidos.unshift(p);
    return p;
  }

  function podeMudar(de, para) { return (TRANSICOES[de] || []).indexOf(para) > -1; }
  function mudarStatus(p, para, agora) {
    if (!podeMudar(p.status, para)) throw new Error('Não é possível passar de "' + rotuloStatus(p.status) + '" para "' + rotuloStatus(para) + '".');
    var quando = (agora || new Date()).toISOString();
    p.status = para; p.historico = (p.historico || []).concat([{ status: para, em: quando }]);
    return p;
  }

  function alternarEsgotado(estado, id) {
    if (!produto(estado, id)) throw new Error('Produto inexistente.');
    estado.esgotados = estado.esgotados || {};
    if (estado.esgotados[id]) delete estado.esgotados[id]; else estado.esgotados[id] = true;
    return !!estado.esgotados[id];
  }

  function resumo(estado, hoje) {
    var dia = (hoje || new Date()).toDateString();
    var doDia = estado.pedidos.filter(function (p) { return new Date(p.criadoEm).toDateString() === dia && p.status !== 'cancelado'; });
    var vendidos = {};
    doDia.forEach(function (p) { p.itens.forEach(function (i) { vendidos[i.nome] = (vendidos[i.nome] || 0) + i.qtd; }); });
    var total = arred(doDia.reduce(function (s, p) { return s + p.total; }, 0));
    return {
      pedidos: doDia.length, faturamento: total, ticketMedio: doDia.length ? arred(total / doDia.length) : 0,
      abertos: estado.pedidos.filter(function (p) { return p.status === 'novo' || p.status === 'preparo' || p.status === 'pronto'; }).length,
      maisVendidos: Object.keys(vendidos).sort(function (a, b) { return vendidos[b] - vendidos[a] || (a < b ? -1 : 1); }).slice(0, 3).map(function (n) { return [n, vendidos[n]]; })
    };
  }

  /* ---------------- mensagem ---------------- */
  function mensagemPedido(p, estado) {
    var cfg = cfgDe(estado);
    var l = ['Olá, ' + cfg.empresa + '! Quero fazer um pedido (nº ' + p.numero + '):', ''];
    p.itens.forEach(function (i) { l.push('• ' + i.qtd + 'x ' + i.nome + ' — ' + formatarMoeda(i.qtd * i.preco)); });
    l.push('');
    if (p.taxa) l.push('Subtotal: ' + formatarMoeda(p.subtotal), 'Entrega: ' + formatarMoeda(p.taxa));
    l.push('*Total: ' + formatarMoeda(p.total) + '*', '');
    l.push(p.modo === 'entrega' ? 'Entregar em: ' + p.endereco : 'Vou retirar no local.');
    l.push('Pagamento: ' + PAGAMENTOS[p.pagamento] + (p.troco ? ' (troco para ' + formatarMoeda(p.troco) + ')' : ''));
    if (p.observacoes) l.push('Obs.: ' + p.observacoes);
    l.push('', 'Nome: ' + p.cliente.nome);
    return l.join('\n');
  }
  function linkWhats(tel, texto) { var n = normalizarWhats(tel); return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(texto) : ''; }

  /* ---------------- demonstração e armazenamento ---------------- */
  function criarDemo(nicho, agora) {
    var base = agora || new Date();
    var estado = { versao: VERSAO_DADOS, nicho: NICHOS_CATALOGO[nicho] ? nicho : 'lanchonete', seq: 501, esgotados: {}, pedidos: [] };
    var cfg = cfgDe(estado), todos = [];
    cfg.categorias.forEach(function (c) { c.produtos.forEach(function (p) { todos.push(p[0]); }); });
    var nomes = ['Paula Andrade', 'Rodrigo Lima', 'Camila Souza', 'Felipe Rocha', 'Sandra Nunes'];
    var roteiro = [['entregue', 'entrega', 'pix'], ['entregue', 'retirada', 'cartao'], ['pronto', 'entrega', 'dinheiro'], ['preparo', 'retirada', 'pix'], ['novo', 'entrega', 'pix']];
    roteiro.forEach(function (r, i) {
      var carrinho = [];
      adicionar(estado, carrinho, todos[i % todos.length], 2);
      adicionar(estado, carrinho, todos[(i + 3) % todos.length], 1);
      var c = calcular(estado, carrinho, r[1]);
      if (r[1] === 'entrega' && c.subtotal < cfg.pedidoMinimo) adicionar(estado, carrinho, todos[(i + 3) % todos.length], Math.ceil((cfg.pedidoMinimo - c.subtotal) / produto(estado, todos[(i + 3) % todos.length]).preco));
      var total = calcular(estado, carrinho, r[1]).total;
      var p = criarPedido(estado, {
        carrinho: carrinho, modo: r[1], endereco: 'Rua Fictícia, ' + (100 + i * 10) + ' · apto ' + (i + 1), pagamento: r[2],
        troco: r[2] === 'dinheiro' ? String(Math.ceil(total / 50) * 50 + 50) : '',
        cliente: { nome: nomes[i], whatsapp: '319000000' + (30 + i) } // (31) 90000-00XX: fictício
      }, new Date(base.getTime() - (5 - i) * 25 * 60000));
      var caminho = { novo: [], preparo: ['preparo'], pronto: ['preparo', 'pronto'], entregue: ['preparo', 'pronto', 'entregue'] }[r[0]];
      caminho.forEach(function (st) { mudarStatus(p, st, base); });
    });
    estado.esgotados[todos[todos.length - 1]] = true; // um produto esgotado, para mostrar o recurso
    return estado;
  }
  function carregar(armazem) {
    try {
      var e = JSON.parse((armazem || global.localStorage).getItem(CHAVE_DADOS) || 'null');
      if (e && e.versao === VERSAO_DADOS && Array.isArray(e.pedidos) && NICHOS_CATALOGO[e.nicho]) return e;
    } catch (err) { /* sem armazenamento */ }
    return null;
  }
  function salvar(estado, armazem) { try { (armazem || global.localStorage).setItem(CHAVE_DADOS, JSON.stringify(estado)); return true; } catch (err) { return false; } }

  global.Catalogo = {
    CHAVE_DADOS: CHAVE_DADOS, STATUS: STATUS, TRANSICOES: TRANSICOES, PAGAMENTOS: PAGAMENTOS, NICHOS_CATALOGO: NICHOS_CATALOGO,
    formatarMoeda: formatarMoeda, lerValor: lerValor, normalizarWhats: normalizarWhats, formatarTelefone: formatarTelefone, rotuloStatus: rotuloStatus,
    cfgDe: cfgDe, produto: produto, adicionar: adicionar, alterarQtd: alterarQtd, calcular: calcular,
    validarPedido: validarPedido, criarPedido: criarPedido, podeMudar: podeMudar, mudarStatus: mudarStatus,
    alternarEsgotado: alternarEsgotado, resumo: resumo, mensagemPedido: mensagemPedido, linkWhats: linkWhats,
    criarDemo: criarDemo, carregar: carregar, salvar: salvar
  };
})(typeof window !== 'undefined' ? window : this);
