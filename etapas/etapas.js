/*
 * Sistema de etapas (produção) — regras, sem telas. Usado por app.js e pelos testes.
 * Cada veículo/aparelho passa por etapas configuradas por tipo de negócio; cada etapa tem um checklist.
 * Demonstração: dados só no navegador (localStorage), empresa fictícia.
 * Na versão real (Fase 2), as mesmas regras gravam na planilha do cliente pelo Apps Script.
 */
(function (global) {
  'use strict';

  var CHAVE_DADOS = 'leontech_etapas_demo_v1';
  var VERSAO_DADOS = 1;
  var WHATS_LEONTECH = '5531992868113'; // empresas fictícias usam o WhatsApp da LeonTech, nunca o de terceiros
  var MAX = { nome: 60, modelo: 40, cor: 20, avaria: 60, avarias: 8, obs: 300 };

  /* ---------- tipos de negócio ---------- */
  /* Cada etapa: id, rotulo, checklist (o que precisa estar feito para concluir) e aviso (o que o cliente lê). */
  var NICHOS = {
    martelinho: {
      rotulo: 'Martelinho de ouro', empresa: 'Martelinho de Ouro Exemplo', cor: '#b45309', item: 'Veículo', tipoItem: 'veiculo',
      equipe: ['Carlos', 'Bruno', 'Diego'],
      sugestoesAvaria: ['Porta dianteira esquerda', 'Porta dianteira direita', 'Capô', 'Teto (granizo)', 'Para-lama traseiro', 'Tampa do porta-malas'],
      etapas: [
        { id: 'recepcao', rotulo: 'Recepção', checklist: ['Fotos das avarias tiradas', 'Pertences conferidos com o cliente', 'Quilometragem anotada'], aviso: 'recebemos o seu veículo e registramos as avarias com fotos' },
        { id: 'orcamento', rotulo: 'Orçamento', checklist: ['Amassados avaliados', 'Orçamento enviado ao cliente'], aviso: 'estamos avaliando os amassados para montar o seu orçamento' },
        { id: 'aprovado', rotulo: 'Aprovado', checklist: ['Aprovação do cliente registrada', 'Prazo combinado'], aviso: 'orçamento aprovado, obrigado! Seu veículo entrou na fila de serviço' },
        { id: 'desmontagem', rotulo: 'Desmontagem', checklist: ['Forros e peças retirados', 'Peças guardadas e identificadas'], aviso: 'começamos a desmontagem das peças necessárias' },
        { id: 'reparo', rotulo: 'Reparo', checklist: [], avarias: true, aviso: 'estamos fazendo o reparo dos amassados' },
        { id: 'polimento', rotulo: 'Polimento', checklist: ['Polimento das áreas reparadas', 'Conferência na luz'], aviso: 'o reparo terminou e o veículo está no polimento' },
        { id: 'montagem', rotulo: 'Montagem', checklist: ['Peças e forros recolocados', 'Vidros e travas testados'], aviso: 'estamos remontando as peças' },
        { id: 'lavagem', rotulo: 'Lavagem', checklist: ['Lavagem externa', 'Aspiração interna'], aviso: 'o seu veículo está na lavagem final' },
        { id: 'pronto', rotulo: 'Pronto', checklist: ['Conferência final com fotos do depois'], aviso: 'o seu veículo está pronto para retirada' },
        { id: 'entregue', rotulo: 'Entregue', checklist: [], aviso: 'veículo entregue. Obrigado pela confiança' }
      ]
    },
    funilaria: {
      rotulo: 'Funilaria e pintura', empresa: 'Funilaria e Pintura Exemplo', cor: '#b91c1c', item: 'Veículo', tipoItem: 'veiculo',
      equipe: ['Marcos', 'Paulo', 'Renan'],
      sugestoesAvaria: ['Para-choque dianteiro', 'Para-choque traseiro', 'Porta traseira direita', 'Para-lama dianteiro', 'Retrovisor', 'Riscos na lateral'],
      etapas: [
        { id: 'recepcao', rotulo: 'Recepção', checklist: ['Fotos das avarias tiradas', 'Pertences conferidos com o cliente'], aviso: 'recebemos o seu veículo e registramos as avarias com fotos' },
        { id: 'orcamento', rotulo: 'Orçamento', checklist: ['Peças e mão de obra levantadas', 'Orçamento enviado ao cliente'], aviso: 'estamos montando o seu orçamento' },
        { id: 'aprovado', rotulo: 'Aprovado', checklist: ['Aprovação do cliente registrada', 'Peças encomendadas, se preciso'], aviso: 'orçamento aprovado, obrigado! Seu veículo entrou na fila de serviço' },
        { id: 'funilaria', rotulo: 'Funilaria', checklist: [], avarias: true, aviso: 'estamos na funilaria, recuperando as peças' },
        { id: 'preparacao', rotulo: 'Preparação', checklist: ['Massa e lixamento', 'Fundo aplicado', 'Áreas protegidas'], aviso: 'as peças estão sendo preparadas para a pintura' },
        { id: 'pintura', rotulo: 'Pintura', checklist: ['Cor conferida', 'Pintura e verniz aplicados'], aviso: 'o seu veículo está na cabine de pintura' },
        { id: 'polimento', rotulo: 'Polimento', checklist: ['Polimento', 'Conferência da cor na luz'], aviso: 'a pintura terminou e o veículo está no polimento' },
        { id: 'montagem', rotulo: 'Montagem', checklist: ['Peças recolocadas', 'Luzes e sensores testados'], aviso: 'estamos remontando as peças' },
        { id: 'lavagem', rotulo: 'Lavagem', checklist: ['Lavagem externa', 'Aspiração interna'], aviso: 'o seu veículo está na lavagem final' },
        { id: 'pronto', rotulo: 'Pronto', checklist: ['Conferência final com fotos do depois'], aviso: 'o seu veículo está pronto para retirada' },
        { id: 'entregue', rotulo: 'Entregue', checklist: [], aviso: 'veículo entregue. Obrigado pela confiança' }
      ]
    },
    estetica: {
      rotulo: 'Estética automotiva', empresa: 'Estética Automotiva Exemplo', cor: '#0f766e', item: 'Veículo', tipoItem: 'veiculo',
      equipe: ['Lucas', 'Thiago'],
      sugestoesAvaria: ['Polimento técnico', 'Vitrificação de pintura', 'Higienização interna', 'Limpeza de bancos de couro', 'Revitalização de faróis', 'Lavagem do motor'],
      rotuloAvarias: 'Serviços contratados',
      etapas: [
        { id: 'recepcao', rotulo: 'Recepção', checklist: ['Fotos do estado do veículo', 'Pertences conferidos com o cliente'], aviso: 'recebemos o seu veículo e registramos o estado dele com fotos' },
        { id: 'lavagem', rotulo: 'Lavagem detalhada', checklist: ['Pré-lavagem', 'Lavagem técnica', 'Secagem'], aviso: 'o seu veículo está na lavagem detalhada' },
        { id: 'descontaminacao', rotulo: 'Descontaminação', checklist: ['Descontaminação da pintura', 'Limpeza de rodas e caixas'], aviso: 'estamos fazendo a descontaminação da pintura' },
        { id: 'servicos', rotulo: 'Serviços', checklist: [], avarias: true, aviso: 'estamos fazendo os serviços contratados' },
        { id: 'conferencia', rotulo: 'Conferência', checklist: ['Conferência na luz', 'Fotos do depois'], aviso: 'estamos fazendo a conferência final' },
        { id: 'pronto', rotulo: 'Pronto', checklist: ['Veículo posicionado para retirada'], aviso: 'o seu veículo está pronto para retirada' },
        { id: 'entregue', rotulo: 'Entregue', checklist: [], aviso: 'veículo entregue. Obrigado pela confiança' }
      ]
    },
    assistencia: {
      rotulo: 'Assistência técnica', empresa: 'Assistência Técnica Exemplo', cor: '#4338ca', item: 'Aparelho', tipoItem: 'aparelho',
      equipe: ['Ana', 'Rafael'],
      sugestoesAvaria: ['Tela trincada', 'Não carrega', 'Bateria fraca', 'Molhou', 'Câmera embaçada', 'Botão travado'],
      rotuloAvarias: 'Defeitos relatados',
      etapas: [
        { id: 'recepcao', rotulo: 'Recepção', checklist: ['Fotos do aparelho', 'Senha ou padrão anotado com autorização', 'Acessórios conferidos'], aviso: 'recebemos o seu aparelho' },
        { id: 'diagnostico', rotulo: 'Diagnóstico', checklist: ['Testes de funcionamento', 'Defeito confirmado'], aviso: 'estamos fazendo o diagnóstico do seu aparelho' },
        { id: 'orcamento', rotulo: 'Orçamento', checklist: ['Orçamento enviado ao cliente'], aviso: 'o orçamento do seu aparelho foi enviado' },
        { id: 'aprovado', rotulo: 'Aprovado', checklist: ['Aprovação do cliente registrada', 'Peça separada ou encomendada'], aviso: 'orçamento aprovado, obrigado! O seu aparelho entrou na fila de reparo' },
        { id: 'reparo', rotulo: 'Reparo', checklist: [], avarias: true, aviso: 'estamos fazendo o reparo do seu aparelho' },
        { id: 'testes', rotulo: 'Testes', checklist: ['Teste completo de funções', 'Limpeza do aparelho'], aviso: 'o reparo terminou e o aparelho está em testes' },
        { id: 'pronto', rotulo: 'Pronto', checklist: ['Aparelho embalado com a OS'], aviso: 'o seu aparelho está pronto para retirada' },
        { id: 'entregue', rotulo: 'Entregue', checklist: [], aviso: 'aparelho entregue. Obrigado pela confiança' }
      ]
    }
  };

  /* ---------- utilidades ---------- */
  function soDigitos(t) { return String(t || '').replace(/\D/g, ''); }
  function normalizarWhats(tel) {
    var d = soDigitos(tel);
    if (d.length >= 12 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length !== 11 || d.charAt(2) !== '9') return '';
    return '55' + d;
  }
  /* Placa antiga (ABC-1234) ou Mercosul (ABC1D23). Devolve "ABC1D23"/"ABC1234" ou "" se inválida. */
  function normalizarPlaca(p) {
    var t = String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(t) ? t : '';
  }
  function formatarPlaca(p) { var t = normalizarPlaca(p); return t && /^[A-Z]{3}\d{4}$/.test(t) ? t.slice(0, 3) + '-' + t.slice(3) : t; }
  function semAcento(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function limpar(t, max) { return String(t == null ? '' : t).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
  function primeiroNome(nome) { return limpar(nome, MAX.nome).split(' ')[0] || ''; }
  /* Identificador aleatório difícil de adivinhar (usado nos links). */
  function idAleatorio(n) {
    var abc = 'abcdefghijkmnpqrstuvwxyz23456789', s = '', bytes = [];
    if (global.crypto && global.crypto.getRandomValues) bytes = Array.prototype.slice.call(global.crypto.getRandomValues(new Uint8Array(n)));
    else for (var i = 0; i < n; i++) bytes.push(Math.floor(Math.random() * 256));
    bytes.forEach(function (b) { s += abc.charAt(b % abc.length); });
    return s;
  }

  function cfgDe(estado) { return NICHOS[estado.nicho] || NICHOS.martelinho; }
  function etapasDe(estado) { return cfgDe(estado).etapas; }
  function indiceEtapa(estado, id) { var e = etapasDe(estado); for (var i = 0; i < e.length; i++) if (e[i].id === id) return i; return -1; }
  function etapaAtual(estado, item) { return etapasDe(estado)[indiceEtapa(estado, item.etapa)] || null; }
  function proximaEtapa(estado, item) { var i = indiceEtapa(estado, item.etapa); return etapasDe(estado)[i + 1] || null; }
  function finalizado(estado, item) { return item.cancelado || indiceEtapa(estado, item.etapa) === etapasDe(estado).length - 1; }

  /* Checklist da etapa atual (as etapas de reparo usam a lista de avarias/serviços do item). */
  function checklistDe(estado, item, etapa) {
    etapa = etapa || etapaAtual(estado, item);
    if (!etapa) return [];
    return etapa.avarias ? item.avarias.slice() : etapa.checklist.slice();
  }
  function marcados(item, etapaId) { return (item.checks && item.checks[etapaId]) || []; }
  function pendentes(estado, item) {
    var lista = checklistDe(estado, item), m = marcados(item, item.etapa);
    return lista.filter(function (_, i) { return !m[i]; });
  }

  /* ---------- criação ---------- */
  function validarNovo(estado, dados) {
    var cfg = cfgDe(estado), erros = {};
    var nome = limpar(dados.nome, MAX.nome);
    if (nome.length < 2) erros.nome = 'Informe o nome do cliente.';
    var whats = limpar(dados.whatsapp, 20);
    if (whats && !normalizarWhats(whats)) erros.whatsapp = 'WhatsApp com DDD (11 dígitos), ex.: (31) 99999-9999.';
    var modelo = limpar(dados.modelo, MAX.modelo);
    if (modelo.length < 2) erros.modelo = cfg.tipoItem === 'veiculo' ? 'Informe o modelo do veículo.' : 'Informe a marca e o modelo do aparelho.';
    var placa = '';
    if (cfg.tipoItem === 'veiculo') { placa = normalizarPlaca(dados.placa); if (!placa) erros.placa = 'Placa inválida (ex.: ABC1D23 ou ABC-1234).'; }
    var avarias = (Array.isArray(dados.avarias) ? dados.avarias : String(dados.avarias || '').split('\n'))
      .map(function (a) { return limpar(a, MAX.avaria); }).filter(Boolean);
    avarias = avarias.filter(function (a, i) { return avarias.indexOf(a) === i; }).slice(0, MAX.avarias);
    if (!avarias.length) erros.avarias = 'Liste pelo menos um item (' + (cfg.rotuloAvarias || 'avarias').toLowerCase() + ').';
    var previsao = String(dados.previsao || '');
    if (previsao && !dataValida(previsao)) erros.previsao = 'Data inválida.';
    return {
      erros: erros, ok: !Object.keys(erros).length,
      dados: { nome: nome, whatsapp: normalizarWhats(whats), modelo: modelo, cor: limpar(dados.cor, MAX.cor), placa: placa, avarias: avarias, previsao: previsao, obs: limpar(dados.obs, MAX.obs) }
    };
  }

  function novoItem(estado, dados, agora, quem) {
    var v = validarNovo(estado, dados);
    if (!v.ok) { var e = new Error('Dados inválidos'); e.erros = v.erros; throw e; }
    var quando = (agora || new Date()).toISOString();
    var item = {
      id: idAleatorio(10), token: idAleatorio(14), numero: estado.seq++,
      cliente: { nome: v.dados.nome, whatsapp: v.dados.whatsapp },
      modelo: v.dados.modelo, cor: v.dados.cor, placa: v.dados.placa, avarias: v.dados.avarias,
      previsao: v.dados.previsao, obs: v.dados.obs,
      etapa: etapasDe(estado)[0].id, checks: {}, cancelado: false,
      historico: [{ etapa: etapasDe(estado)[0].id, quem: limpar(quem, 30) || 'Recepção', quando: quando, acao: 'entrada' }],
      criadoEm: quando
    };
    estado.itens.unshift(item);
    return item;
  }

  /* ---------- andamento ---------- */
  function marcar(estado, item, indice, valor) {
    if (finalizado(estado, item)) throw new Error('Este item já foi encerrado.');
    var lista = checklistDe(estado, item);
    if (indice < 0 || indice >= lista.length) throw new Error('Item do checklist inexistente.');
    if (!item.checks[item.etapa]) item.checks[item.etapa] = [];
    item.checks[item.etapa][indice] = !!valor;
  }

  /* Conclui a etapa atual (exige o checklist completo) e passa para a próxima. Devolve a nova etapa. */
  function concluirEtapa(estado, item, quem, agora) {
    if (finalizado(estado, item)) throw new Error('Este item já foi encerrado.');
    var falta = pendentes(estado, item);
    if (falta.length) { var e = new Error('Falta concluir: ' + falta.join(', ') + '.'); e.pendentes = falta; throw e; }
    var nome = limpar(quem, 30);
    if (!nome) throw new Error('Informe quem concluiu a etapa.');
    var prox = proximaEtapa(estado, item), quando = (agora || new Date()).toISOString();
    item.historico.push({ etapa: item.etapa, quem: nome, quando: quando, acao: 'concluiu' });
    item.etapa = prox.id;
    item.historico.push({ etapa: prox.id, quem: nome, quando: quando, acao: 'entrada' });
    return prox;
  }

  /* Volta uma etapa (correção de engano). Mantém o histórico. */
  function voltarEtapa(estado, item, quem, agora) {
    if (item.cancelado) throw new Error('Este item foi cancelado.');
    var i = indiceEtapa(estado, item.etapa);
    if (i <= 0) throw new Error('Já está na primeira etapa.');
    var nome = limpar(quem, 30) || 'Gestor', ant = etapasDe(estado)[i - 1];
    item.historico.push({ etapa: ant.id, quem: nome, quando: (agora || new Date()).toISOString(), acao: 'voltou' });
    item.etapa = ant.id;
    return ant;
  }

  function cancelar(estado, item, quem, agora, motivo) {
    if (finalizado(estado, item)) throw new Error('Este item já foi encerrado.');
    item.cancelado = true;
    item.historico.push({ etapa: item.etapa, quem: limpar(quem, 30) || 'Gestor', quando: (agora || new Date()).toISOString(), acao: 'cancelou', motivo: limpar(motivo, 80) });
  }

  /* ---------- tempo e prazos ---------- */
  function entradaNaEtapa(item) {
    for (var i = item.historico.length - 1; i >= 0; i--) {
      var h = item.historico[i];
      if (h.etapa === item.etapa && (h.acao === 'entrada' || h.acao === 'voltou')) return new Date(h.quando);
    }
    return new Date(item.criadoEm);
  }
  function minutosNaEtapa(item, agora) { return Math.max(0, Math.floor(((agora || new Date()) - entradaNaEtapa(item)) / 60000)); }
  function tempoTexto(min) {
    if (min < 1) return 'agora';
    if (min < 60) return min + ' min';
    var h = Math.floor(min / 60);
    if (h < 24) return h + ' h';
    var d = Math.floor(h / 24);
    return d + (d === 1 ? ' dia' : ' dias');
  }
  /* "AAAA-MM-DD" de um dia que existe (recusa 31/02 e 29/02 fora de ano bissexto). */
  function dataValida(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return false;
    var a = +m[1], me = +m[2], d = +m[3], dt = new Date(a, me - 1, d);
    return a >= 2000 && a <= 2100 && dt.getFullYear() === a && dt.getMonth() === me - 1 && dt.getDate() === d;
  }
  function dataISO(d) { function p(n) { return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function dataBR(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? m[3] + '/' + m[2] : ''; }
  function horaBR(iso) { var d = new Date(iso); if (isNaN(d)) return ''; function p(n) { return (n < 10 ? '0' : '') + n; } return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + 'h' + p(d.getMinutes()); }
  /* Atrasado: passou do dia da previsão e ainda não chegou em "Pronto". */
  function atrasado(estado, item, agora) {
    if (!item.previsao || item.cancelado) return false;
    var iPronto = indiceEtapa(estado, 'pronto');
    if (indiceEtapa(estado, item.etapa) >= iPronto) return false;
    return dataISO(agora || new Date()) > item.previsao;
  }

  /* ---------- painel ---------- */
  function resumo(estado, agora) {
    var r = { porEtapa: {}, emAndamento: 0, prontos: 0, atrasados: 0, entreguesMes: 0, cancelados: 0 };
    var hoje = agora || new Date(), mes = dataISO(hoje).slice(0, 7);
    etapasDe(estado).forEach(function (e) { r.porEtapa[e.id] = 0; });
    estado.itens.forEach(function (it) {
      if (it.cancelado) { r.cancelados++; return; }
      if (it.etapa === 'entregue') {
        var ent = it.historico.filter(function (h) { return h.etapa === 'entregue' && h.acao === 'entrada'; }).pop();
        if (ent && ent.quando.slice(0, 7) === mes) r.entreguesMes++;
        return;
      }
      r.porEtapa[it.etapa] = (r.porEtapa[it.etapa] || 0) + 1;
      if (it.etapa === 'pronto') r.prontos++; else r.emAndamento++;
      if (atrasado(estado, it, hoje)) r.atrasados++;
    });
    return r;
  }

  function buscar(estado, termo) {
    var t = semAcento(termo).replace(/[^a-z0-9 ]/g, '').trim(), tp = t.replace(/ /g, '');
    if (!t) return estado.itens.slice();
    // Telefone só quando o texto é só números (senão os números da placa achariam telefones).
    var tel = /^[\d ]+$/.test(t) && tp.length >= 4 ? tp : '';
    return estado.itens.filter(function (it) {
      var cli = it.cliente || {};
      return semAcento(cli.nome).indexOf(t) > -1 || semAcento(it.modelo).indexOf(t) > -1 ||
        (tp && String(it.placa || '').toLowerCase().indexOf(tp) > -1) || String(it.numero) === t || (tel && soDigitos(cli.whatsapp).indexOf(tel) > -1);
    });
  }

  /* ---------- links e mensagens ---------- */
  function linkColaborador(base, item) { return base + '#item/' + item.id; }
  function linkCliente(base, item) { return base + '#acompanhar/' + item.token; }
  function porToken(estado, token) { return estado.itens.filter(function (it) { return it.token === token; })[0] || null; }
  function porId(estado, id) { return estado.itens.filter(function (it) { return it.id === id; })[0] || null; }
  function descricaoItem(estado, item) {
    return item.modelo + (item.cor ? ' ' + item.cor : '') + (item.placa ? ' (' + formatarPlaca(item.placa) + ')' : '');
  }
  /* Mensagem para o cliente sobre a etapa atual (vai pronta para o WhatsApp da empresa, com 1 toque). */
  function mensagemCliente(estado, item, link) {
    var cfg = cfgDe(estado), e = etapaAtual(estado, item), nome = primeiroNome(item.cliente.nome);
    var texto = 'Olá' + (nome ? ', ' + nome : '') + '! Aqui é da ' + cfg.empresa + '. Atualização do seu ' + descricaoItem(estado, item) + ': ' +
      (item.cancelado ? 'o serviço foi encerrado' : e.aviso) + '.';
    if (!item.cancelado && item.etapa !== 'entregue') texto += '\n\nAcompanhe as etapas em tempo real: ' + link;
    if (item.etapa === 'pronto') texto += '\n\nÉ só nos avisar o melhor horário para a retirada.';
    return texto;
  }
  function linkWhats(numero, texto) { return 'https://wa.me/' + (numero || '') + '?text=' + encodeURIComponent(texto); }
  /* Linha do tempo para o cliente: cada etapa com situação "feita", "atual" ou "proxima". */
  function linhaDoTempo(estado, item) {
    var atual = indiceEtapa(estado, item.etapa), fim = etapasDe(estado).length - 1;
    return etapasDe(estado).map(function (e, i) {
      var conc = item.historico.filter(function (h) { return h.etapa === e.id && h.acao === 'concluiu'; }).pop();
      var situacao = i < atual ? 'feita' : (i === atual ? (i === fim ? 'feita' : 'atual') : 'proxima');
      return { id: e.id, rotulo: e.rotulo, situacao: situacao, quando: conc ? conc.quando : (i === atual && i === fim ? entradaNaEtapa(item).toISOString() : '') };
    });
  }

  /* ---------- dados de demonstração ---------- */
  function criarDemo(nicho, agora) {
    agora = agora || new Date();
    var estado = { versao: VERSAO_DADOS, nicho: NICHOS[nicho] ? nicho : 'martelinho', seq: 101, itens: [] };
    var cfg = cfgDe(estado), et = cfg.etapas, eq = cfg.equipe;
    function horasAtras(h) { return new Date(agora.getTime() - h * 3600000); }
    function dias(n) { var d = new Date(agora); d.setDate(d.getDate() + n); return dataISO(d); }
    var veic = cfg.tipoItem === 'veiculo';
    var exemplos = [
      { nome: 'Maria Souza', whatsapp: '31900000001', modelo: veic ? 'Onix' : 'Galaxy A54', cor: veic ? 'prata' : '', placa: 'QWE1R23', idx: 1, horas: 3, prev: 3 },
      { nome: 'João Pereira', whatsapp: '31900000002', modelo: veic ? 'HB20' : 'iPhone 12', cor: veic ? 'branco' : '', placa: 'RTY2U34', idx: Math.min(4, et.length - 3), horas: 5, prev: 1 },
      { nome: 'Ana Costa', whatsapp: '31900000003', modelo: veic ? 'Compass' : 'Moto G84', cor: veic ? 'preto' : '', placa: 'UIO3P45', idx: Math.min(5, et.length - 3), horas: 26, prev: -1 },
      { nome: 'Pedro Lima', whatsapp: '31900000004', modelo: veic ? 'Corolla' : 'Redmi Note 13', cor: veic ? 'cinza' : '', placa: 'ASD4F56', idx: et.length - 2, horas: 2, prev: 0 },
      { nome: 'Carla Mendes', whatsapp: '31900000005', modelo: veic ? 'Kwid' : 'iPhone 11', cor: veic ? 'vermelho' : '', placa: 'GHJ5K67', idx: 0, horas: 0.5, prev: 4 },
      { nome: 'Rafael Dias', whatsapp: '31900000006', modelo: veic ? 'Strada' : 'Galaxy S21', cor: veic ? 'branca' : '', placa: 'LZX6C78', idx: et.length - 1, horas: 30, prev: -2 }
    ];
    exemplos.reverse().forEach(function (ex, n) {
      var inicio = horasAtras(ex.horas + 8 * ex.idx); // cada etapa anterior levou algumas horas
      var it = novoItem(estado, { nome: ex.nome, whatsapp: ex.whatsapp, modelo: ex.modelo, cor: ex.cor, placa: ex.placa,
        avarias: cfg.sugestoesAvaria.slice(n % 3, n % 3 + 2), previsao: dias(ex.prev) }, inicio, 'Recepção'); // telefones fictícios (31) 90000-000X
      for (var i = 0; i < ex.idx; i++) {
        checklistDe(estado, it).forEach(function (_, k) { marcar(estado, it, k, true); });
        var quando = i === ex.idx - 1 ? horasAtras(ex.horas) : new Date(inicio.getTime() + (i + 1) * 3600000 * 7);
        concluirEtapa(estado, it, eq[i % eq.length], quando);
      }
    });
    return estado;
  }

  /* ---------- armazenamento ---------- */
  function texto(v, max) { return typeof v === 'string' ? v.slice(0, max) : (typeof v === 'number' ? String(v) : ''); }
  /* Completa campos opcionais que faltam. Devolve null se faltar o essencial (id, token, etapa conhecida). */
  function normalizarItem(e, it) {
    if (!it || typeof it !== 'object' || typeof it.id !== 'string' || !it.id || typeof it.token !== 'string' || !it.token || indiceEtapa(e, it.etapa) < 0) return null;
    var cli = it.cliente && typeof it.cliente === 'object' ? it.cliente : {};
    var hist = Array.isArray(it.historico) ? it.historico.filter(function (h) { return h && typeof h.etapa === 'string' && typeof h.quando === 'string'; }) : [];
    var criado = typeof it.criadoEm === 'string' && !isNaN(new Date(it.criadoEm)) ? it.criadoEm : (hist[0] ? hist[0].quando : new Date().toISOString());
    return {
      id: it.id, token: it.token, numero: typeof it.numero === 'number' ? it.numero : 0,
      cliente: { nome: texto(cli.nome, MAX.nome) || 'Cliente', whatsapp: normalizarWhats(cli.whatsapp) },
      modelo: texto(it.modelo, MAX.modelo) || '—', cor: texto(it.cor, MAX.cor), placa: normalizarPlaca(it.placa),
      avarias: Array.isArray(it.avarias) ? it.avarias.filter(function (a) { return typeof a === 'string' && a; }).slice(0, MAX.avarias) : [],
      previsao: dataValida(it.previsao) ? it.previsao : '', obs: texto(it.obs, MAX.obs),
      etapa: it.etapa, checks: it.checks && typeof it.checks === 'object' ? it.checks : {}, cancelado: it.cancelado === true,
      historico: hist.length ? hist : [{ etapa: it.etapa, quem: 'Sistema', quando: criado, acao: 'entrada' }],
      criadoEm: criado
    };
  }
  function valido(e) {
    return !!(e && e.versao === VERSAO_DADOS && NICHOS[e.nicho] && Array.isArray(e.itens) && typeof e.seq === 'number' &&
      e.itens.every(function (it) { return !!normalizarItem(e, it); }));
  }
  /* Carrega os dados do aparelho. Registros com problema são consertados quando dá; os que não dá ficam de fora,
   * mas o original é guardado numa cópia de segurança (não some em silêncio). Devolve null se não houver dados utilizáveis. */
  function carregar(armazem) {
    var a = armazem || global.localStorage, bruto;
    try { bruto = a.getItem(CHAVE_DADOS); } catch (x) { return null; }
    if (!bruto) return null;
    var e;
    try { e = JSON.parse(bruto); } catch (x) { guardarCopia(a, bruto); return null; }
    if (!e || e.versao !== VERSAO_DADOS || !NICHOS[e.nicho] || !Array.isArray(e.itens)) { guardarCopia(a, bruto); return null; }
    var itens = [], descartados = 0;
    e.itens.forEach(function (it) { var n = normalizarItem(e, it); if (n) itens.push(n); else descartados++; });
    var maior = itens.reduce(function (m, it) { return Math.max(m, it.numero); }, 0);
    var estado = { versao: VERSAO_DADOS, nicho: e.nicho, seq: Math.max(typeof e.seq === 'number' ? e.seq : 0, maior + 1), itens: itens };
    if (descartados) { guardarCopia(a, bruto); estado.avisoCarga = descartados + (descartados === 1 ? ' registro com problema ficou de fora' : ' registros com problema ficaram de fora') + ' (uma cópia foi guardada).'; }
    return estado;
  }
  function guardarCopia(a, bruto) { try { a.setItem(CHAVE_DADOS + '_copia', bruto); } catch (x) {} }
  function salvar(estado, armazem) {
    try {
      var copia = {}; for (var k in estado) if (k !== 'avisoCarga') copia[k] = estado[k];
      (armazem || global.localStorage).setItem(CHAVE_DADOS, JSON.stringify(copia)); return true;
    } catch (x) { return false; }
  }

  global.Etapas = {
    NICHOS: NICHOS, MAX: MAX, CHAVE_DADOS: CHAVE_DADOS, WHATS_LEONTECH: WHATS_LEONTECH,
    normalizarWhats: normalizarWhats, normalizarPlaca: normalizarPlaca, formatarPlaca: formatarPlaca, primeiroNome: primeiroNome, idAleatorio: idAleatorio,
    cfgDe: cfgDe, etapasDe: etapasDe, indiceEtapa: indiceEtapa, etapaAtual: etapaAtual, proximaEtapa: proximaEtapa, finalizado: finalizado,
    checklistDe: checklistDe, marcados: marcados, pendentes: pendentes,
    validarNovo: validarNovo, novoItem: novoItem, marcar: marcar, concluirEtapa: concluirEtapa, voltarEtapa: voltarEtapa, cancelar: cancelar,
    minutosNaEtapa: minutosNaEtapa, tempoTexto: tempoTexto, atrasado: atrasado, dataISO: dataISO, dataValida: dataValida, normalizarItem: normalizarItem, dataBR: dataBR, horaBR: horaBR,
    resumo: resumo, buscar: buscar, linkColaborador: linkColaborador, linkCliente: linkCliente, porToken: porToken, porId: porId,
    descricaoItem: descricaoItem, mensagemCliente: mensagemCliente, linkWhats: linkWhats, linhaDoTempo: linhaDoTempo,
    criarDemo: criarDemo, carregar: carregar, salvar: salvar, valido: valido
  };
})(typeof window !== 'undefined' ? window : this);
