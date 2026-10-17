/*
 * Sistema de Orçamentos e Ordens de Serviço — lógica (sem telas), usada por index.html e pelos testes.
 * Demonstração: os dados ficam só no navegador (localStorage), com empresa fictícia.
 * Na versão real (Fase 2), as mesmas regras gravam na planilha do cliente pelo Apps Script.
 */
(function (global) {
  'use strict';

  var CHAVE_DADOS = 'leontech_sistema_os_demo_v1';
  var VERSAO_DADOS = 1;

  /* Etapas da ordem de serviço, na ordem do fluxo. */
  var STATUS = [
    { id: 'orcamento', rotulo: 'Orçamento', cor: 'azul' },
    { id: 'aprovado', rotulo: 'Aprovado', cor: 'roxo' },
    { id: 'execucao', rotulo: 'Em execução', cor: 'amarelo' },
    { id: 'pronto', rotulo: 'Pronto', cor: 'verde' },
    { id: 'entregue', rotulo: 'Entregue', cor: 'cinza' },
    { id: 'recusado', rotulo: 'Recusado', cor: 'vermelho' }
  ];

  /* Para onde cada etapa pode ir. "Recusado" pode ser reaberto como orçamento. */
  var TRANSICOES = {
    orcamento: ['aprovado', 'recusado'],
    aprovado: ['execucao', 'recusado'],
    execucao: ['pronto'],
    pronto: ['entregue'],
    entregue: [],
    recusado: ['orcamento']
  };

  /* Configuração por nicho: empresa fictícia, nome do campo "equipamento" e itens de exemplo. */
  var NICHOS_OS = {
    oficina: {
      rotulo: 'Oficina mecânica', empresa: 'Auto Center Exemplo', whatsapp: '5531999990001', cor: '#c2410c',
      equipamento: 'Veículo (modelo e placa)', exemploEquipamento: 'Ex.: Gol 2015 · ABC1D23',
      problema: 'Ex.: barulho ao frear, revisão dos 60 mil km…',
      itens: [['Revisão completa (mão de obra)', 280], ['Troca de óleo e filtro', 190], ['Pastilhas de freio (par)', 160],
        ['Alinhamento e balanceamento', 120], ['Diagnóstico com scanner', 90], ['Troca de bateria', 450]]
    },
    celular: {
      rotulo: 'Assistência de celular', empresa: 'Cell Fix Exemplo', whatsapp: '5531999990002', cor: '#4338ca',
      equipamento: 'Aparelho (marca e modelo)', exemploEquipamento: 'Ex.: Galaxy A54 · tela trincada',
      problema: 'Ex.: tela trincada, não carrega, molhou…',
      itens: [['Troca de tela', 450], ['Troca de bateria', 220], ['Troca de conector de carga', 160],
        ['Limpeza após contato com líquido', 150], ['Película de vidro', 40], ['Diagnóstico', 50]]
    },
    arcondicionado: {
      rotulo: 'Ar-condicionado', empresa: 'Clima Bom Exemplo', whatsapp: '5531999990003', cor: '#0e7490',
      equipamento: 'Equipamento (tipo e BTUs)', exemploEquipamento: 'Ex.: Split 12.000 BTUs · 3º andar',
      problema: 'Ex.: instalação nova, não gela, pingando…',
      itens: [['Instalação de split até 12.000 BTUs', 550], ['Limpeza completa (higienização)', 220], ['Carga de gás', 300],
        ['Suporte de condensadora', 120], ['Tubulação extra (metro)', 60], ['Visita técnica e diagnóstico', 90]]
    },
    chaveiro: {
      rotulo: 'Chaveiro', empresa: 'Chaveiro Exemplo', whatsapp: '5531999990004', cor: '#a16207',
      equipamento: 'Local e fechadura', exemploEquipamento: 'Ex.: porta de apartamento · fechadura tetra',
      problema: 'Ex.: porta trancada, trocar segredo, cópia de chave…',
      itens: [['Abertura de porta', 150], ['Troca de segredo do cilindro', 90], ['Instalação de fechadura', 120],
        ['Cópia de chave tetra', 35], ['Cópia de chave simples', 12], ['Visita (deslocamento)', 40]]
    }
  };

  /* ---------------- utilidades ---------------- */

  function arredondar(n) { return Math.round((Number(n) || 0) * 100) / 100; }

  function formatarMoeda(n) {
    var v = arredondar(n);
    var neg = v < 0; v = Math.abs(v);
    var partes = v.toFixed(2).split('.');
    var inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + 'R$ ' + inteiro + ',' + partes[1];
  }

  /* Aceita "1.234,56", "1234,56", "1234.56" ou número. Vazio ou inválido = 0. */
  function lerValor(texto) {
    if (typeof texto === 'number') return isFinite(texto) ? arredondar(texto) : 0;
    var t = String(texto || '').replace(/[^\d,.\-]/g, '');
    if (!t) return 0;
    if (t.indexOf(',') > -1) t = t.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(t);
    return isFinite(n) ? arredondar(n) : 0;
  }

  function soDigitos(t) { return String(t || '').replace(/\D/g, ''); }

  /* Telefone brasileiro com DDD (10 ou 11 dígitos) → "55" + número. Inválido → "". */
  function normalizarWhats(tel) {
    var d = soDigitos(tel);
    if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length !== 10 && d.length !== 11) return '';
    if (d.length === 11 && d.charAt(2) !== '9') return '';
    return '55' + d;
  }

  function formatarTelefone(tel) {
    var d = normalizarWhats(tel).slice(2);
    if (!d) return String(tel || '');
    return d.length === 11 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7)
      : '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  }

  function semAcento(t) {
    return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function rotuloStatus(id) {
    for (var i = 0; i < STATUS.length; i++) if (STATUS[i].id === id) return STATUS[i].rotulo;
    return id;
  }

  function dataCurta(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  /* ---------------- regras da ordem ---------------- */

  function calcular(ordem) {
    var subtotal = 0;
    (ordem.itens || []).forEach(function (it) {
      var q = Math.max(0, Number(it.qtd) || 0);
      var v = Math.max(0, lerValor(it.valor));
      subtotal += arredondar(q * v);
    });
    subtotal = arredondar(subtotal);
    var desconto = Math.min(Math.max(0, lerValor(ordem.desconto)), subtotal);
    return { subtotal: subtotal, desconto: desconto, total: arredondar(subtotal - desconto) };
  }

  function validarOrdem(o) {
    var erros = [];
    if (!o || !o.cliente || String(o.cliente.nome || '').trim().length < 2) erros.push('Informe o nome do cliente.');
    if (o && o.cliente && o.cliente.whatsapp && !normalizarWhats(o.cliente.whatsapp)) erros.push('WhatsApp do cliente inválido (use DDD + número).');
    var itens = (o && o.itens || []).filter(function (it) { return String(it.descricao || '').trim(); });
    if (!itens.length) erros.push('Adicione pelo menos um item ao orçamento.');
    itens.forEach(function (it, i) {
      if (!(Number(it.qtd) > 0)) erros.push('Item ' + (i + 1) + ': quantidade precisa ser maior que zero.');
      if (lerValor(it.valor) < 0) erros.push('Item ' + (i + 1) + ': valor não pode ser negativo.');
    });
    if (o && lerValor(o.desconto) < 0) erros.push('O desconto não pode ser negativo.');
    if (o && o.validadeDias != null && !(Number(o.validadeDias) >= 1 && Number(o.validadeDias) <= 90)) erros.push('Validade entre 1 e 90 dias.');
    return erros;
  }

  function podeMudar(de, para) { return (TRANSICOES[de] || []).indexOf(para) > -1; }

  function mudarStatus(ordem, para, agora) {
    if (!podeMudar(ordem.status, para)) {
      throw new Error('Não é possível passar de "' + rotuloStatus(ordem.status) + '" para "' + rotuloStatus(para) + '".');
    }
    var quando = (agora || new Date()).toISOString();
    ordem.status = para;
    ordem.atualizadaEm = quando;
    ordem.historico = (ordem.historico || []).concat([{ status: para, em: quando }]);
    if (para === 'entregue') ordem.entregueEm = quando;
    return ordem;
  }

  function validadeAte(ordem) {
    var d = new Date(ordem.criadaEm);
    d.setDate(d.getDate() + (Number(ordem.validadeDias) || 7));
    return d.toISOString();
  }

  /* ---------------- mensagens de WhatsApp ---------------- */

  function mensagemOrcamento(ordem, empresa) {
    var c = calcular(ordem);
    var linhas = ['Olá, ' + primeiroNome(ordem.cliente.nome) + '! Aqui é da ' + empresa.nome + '.',
      'Segue o orçamento nº ' + ordem.numero + (ordem.equipamento ? ' (' + ordem.equipamento + ')' : '') + ':', ''];
    (ordem.itens || []).filter(function (it) { return String(it.descricao || '').trim(); }).forEach(function (it) {
      var q = Number(it.qtd) || 0;
      linhas.push('• ' + (q !== 1 ? q + 'x ' : '') + it.descricao.trim() + ': ' + formatarMoeda(q * lerValor(it.valor)));
    });
    if (c.desconto > 0) linhas.push('Desconto: -' + formatarMoeda(c.desconto));
    linhas.push('', '*Total: ' + formatarMoeda(c.total) + '*');
    linhas.push('Válido até ' + dataCurta(validadeAte(ordem)) + '.');
    if (ordem.observacoes) linhas.push('', String(ordem.observacoes).trim());
    linhas.push('', 'Posso confirmar o serviço?');
    return linhas.join('\n');
  }

  function mensagemPronto(ordem, empresa) {
    return 'Olá, ' + primeiroNome(ordem.cliente.nome) + '! Aqui é da ' + empresa.nome + '. ' +
      'O serviço da ordem nº ' + ordem.numero + (ordem.equipamento ? ' (' + ordem.equipamento + ')' : '') +
      ' está pronto. Valor: ' + formatarMoeda(calcular(ordem).total) + '. Quando fica bom para você retirar?';
  }

  function primeiroNome(nome) { return String(nome || '').trim().split(/\s+/)[0] || 'tudo bem'; }

  function linkWhats(tel, texto) {
    var n = normalizarWhats(tel);
    if (!n) return '';
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(texto);
  }

  /* ---------------- busca e resumo ---------------- */

  function buscar(ordens, termo) {
    var t = semAcento(termo).trim();
    if (!t) return ordens.slice();
    var dig = soDigitos(termo);
    return ordens.filter(function (o) {
      var texto = semAcento([o.cliente && o.cliente.nome, o.equipamento, o.problema, o.numero].join(' '));
      if (texto.indexOf(t) > -1) return true;
      return dig.length >= 4 && soDigitos(o.cliente && o.cliente.whatsapp).indexOf(dig) > -1;
    });
  }

  function resumo(ordens, hoje) {
    var agora = hoje || new Date();
    var r = { aguardando: 0, abertas: 0, prontas: 0, entreguesMes: 0, faturamentoMes: 0, aprovadas: 0, decididas: 0, taxaAprovacao: 0 };
    ordens.forEach(function (o) {
      if (o.status === 'orcamento') r.aguardando++;
      if (o.status === 'aprovado' || o.status === 'execucao') r.abertas++;
      if (o.status === 'pronto') r.prontas++;
      if (o.status !== 'orcamento') {
        r.decididas++;
        if (o.status !== 'recusado') r.aprovadas++;
      }
      if (o.status === 'entregue' && o.entregueEm) {
        var d = new Date(o.entregueEm);
        if (d.getFullYear() === agora.getFullYear() && d.getMonth() === agora.getMonth()) {
          r.entreguesMes++;
          r.faturamentoMes = arredondar(r.faturamentoMes + calcular(o).total);
        }
      }
    });
    r.taxaAprovacao = r.decididas ? Math.round(r.aprovadas / r.decididas * 100) : 0;
    return r;
  }

  /* ---------------- dados da demonstração ---------------- */

  function novaOrdem(estado, dados, agora) {
    var quando = (agora || new Date()).toISOString();
    var ordem = {
      id: 'os' + estado.seq + '-' + Math.random().toString(36).slice(2, 7),
      numero: estado.seq,
      criadaEm: quando, atualizadaEm: quando,
      cliente: { nome: String(dados.cliente.nome || '').trim(), whatsapp: normalizarWhats(dados.cliente.whatsapp) },
      equipamento: String(dados.equipamento || '').trim(),
      problema: String(dados.problema || '').trim(),
      itens: (dados.itens || []).filter(function (it) { return String(it.descricao || '').trim(); }).map(function (it) {
        return { descricao: String(it.descricao).trim(), qtd: Number(it.qtd) || 1, valor: lerValor(it.valor) };
      }),
      desconto: lerValor(dados.desconto),
      validadeDias: Number(dados.validadeDias) || 7,
      observacoes: String(dados.observacoes || '').trim(),
      status: 'orcamento',
      historico: [{ status: 'orcamento', em: quando }]
    };
    var erros = validarOrdem(ordem);
    if (erros.length) throw new Error(erros.join(' '));
    estado.seq++;
    estado.ordens.unshift(ordem);
    return ordem;
  }

  function criarDemo(nicho, agora) {
    var cfg = NICHOS_OS[nicho] || NICHOS_OS.oficina;
    var base = agora || new Date();
    var estado = { versao: VERSAO_DADOS, nicho: NICHOS_OS[nicho] ? nicho : 'oficina', seq: 1001, ordens: [] };
    var nomes = ['Mariana Souza', 'Carlos Pereira', 'Ana Lima', 'João Santos', 'Fernanda Rocha', 'Ricardo Alves'];
    var equip = {
      oficina: ['Onix 2019 · QWE2R34', 'HB20 2017 · RTY5U67', 'Gol 2015 · ABC1D23', 'Corolla 2020 · JKL8M90', 'Strada 2021 · ZXC3V45', 'Fiesta 2014 · BNM6K78'],
      celular: ['iPhone 11 · tela', 'Galaxy A54 · bateria', 'Moto G84 · conector', 'Redmi Note 12 · tela', 'iPhone 13 · molhou', 'Galaxy S21 · tela'],
      arcondicionado: ['Split 9.000 BTUs · quarto', 'Split 12.000 BTUs · sala', 'Split 18.000 BTUs · loja', 'Split 12.000 BTUs · escritório', 'Janela 7.500 BTUs', 'Split 24.000 BTUs · salão'],
      chaveiro: ['Porta de apartamento', 'Portão da garagem', 'Porta da loja', 'Porta de casa · tetra', 'Armário do escritório', 'Porta dos fundos']
    }[estado.nicho];
    // [dias atrás, status final, índices dos itens, desconto]
    var roteiro = [[0, 'orcamento', [0, 2], 0], [1, 'orcamento', [1], 0], [2, 'execucao', [0, 3], 20],
      [4, 'pronto', [2, 4], 0], [9, 'entregue', [0, 1], 0], [12, 'recusado', [5], 0]];
    roteiro.forEach(function (r, i) {
      var dia = new Date(base.getTime() - r[0] * 86400000 - (6 - i) * 3600000);
      var ordem = novaOrdem(estado, {
        cliente: { nome: nomes[i], whatsapp: '319000000' + (10 + i) }, // (31) 90000-00XX: fictício
        equipamento: equip[i],
        itens: r[2].map(function (k) { return { descricao: cfg.itens[k][0], qtd: 1, valor: cfg.itens[k][1] }; }),
        desconto: r[3], validadeDias: 7
      }, dia);
      var caminho = { orcamento: [], execucao: ['aprovado', 'execucao'], pronto: ['aprovado', 'execucao', 'pronto'],
        entregue: ['aprovado', 'execucao', 'pronto', 'entregue'], recusado: ['recusado'] }[r[1]];
      caminho.forEach(function (st, k) { mudarStatus(ordem, st, new Date(dia.getTime() + (k + 1) * 3600000)); });
    });
    return estado;
  }

  function empresaDo(estado) {
    var cfg = NICHOS_OS[estado.nicho] || NICHOS_OS.oficina;
    return { nome: cfg.empresa, whatsapp: cfg.whatsapp, cor: cfg.cor };
  }

  /* ---------------- armazenamento (só neste navegador) ---------------- */

  function carregar(armazem) {
    try {
      var bruto = (armazem || global.localStorage).getItem(CHAVE_DADOS);
      var e = bruto ? JSON.parse(bruto) : null;
      if (e && e.versao === VERSAO_DADOS && Array.isArray(e.ordens) && NICHOS_OS[e.nicho]) return e;
    } catch (err) { /* sem armazenamento (aba anônima, bloqueado): usa dados novos */ }
    return null;
  }

  function salvar(estado, armazem) {
    try { (armazem || global.localStorage).setItem(CHAVE_DADOS, JSON.stringify(estado)); return true; }
    catch (err) { return false; }
  }

  global.SistemaOS = {
    CHAVE_DADOS: CHAVE_DADOS, STATUS: STATUS, TRANSICOES: TRANSICOES, NICHOS_OS: NICHOS_OS,
    arredondar: arredondar, formatarMoeda: formatarMoeda, lerValor: lerValor, normalizarWhats: normalizarWhats,
    formatarTelefone: formatarTelefone, rotuloStatus: rotuloStatus, dataCurta: dataCurta, semAcento: semAcento,
    calcular: calcular, validarOrdem: validarOrdem, podeMudar: podeMudar, mudarStatus: mudarStatus, validadeAte: validadeAte,
    mensagemOrcamento: mensagemOrcamento, mensagemPronto: mensagemPronto, linkWhats: linkWhats,
    buscar: buscar, resumo: resumo, novaOrdem: novaOrdem, criarDemo: criarDemo, empresaDo: empresaDo,
    carregar: carregar, salvar: salvar
  };
})(typeof window !== 'undefined' ? window : this);
