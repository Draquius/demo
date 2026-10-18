/*
 * Agenda com confirmação — lógica (sem telas), usada por index.html e pelos testes.
 * Demonstração: dados só no navegador (localStorage), com empresa fictícia.
 * Datas no formato "AAAA-MM-DD" e horas "HH:MM", sempre no horário local do aparelho.
 */
(function (global) {
  'use strict';

  var CHAVE_DADOS = 'leontech_agenda_demo_v1';
  var VERSAO_DADOS = 1;
  var INTERVALO = 30; // minutos entre horários oferecidos

  var STATUS = [
    { id: 'pendente', rotulo: 'Aguardando confirmação' },
    { id: 'confirmado', rotulo: 'Confirmado' },
    { id: 'concluido', rotulo: 'Atendido' },
    { id: 'faltou', rotulo: 'Faltou' },
    { id: 'cancelado', rotulo: 'Cancelado' }
  ];
  var TRANSICOES = {
    pendente: ['confirmado', 'cancelado'],
    confirmado: ['concluido', 'faltou', 'cancelado'],
    concluido: [], faltou: [], cancelado: []
  };
  /* Status que ocupam o horário na agenda. */
  var OCUPA = { pendente: true, confirmado: true, concluido: true, faltou: true };

  /* Expediente: índice do dia da semana (0 = domingo) → [abre, fecha] ou null (fechado). */
  var NICHOS_AGENDA = {
    barbearia: {
      rotulo: 'Barbearia', empresa: 'Barbearia Exemplo', whatsapp: '5531992868113', cor: '#1f2937',
      endereco: 'Rua Exemplo, 100 · Centro',
      profissionais: ['Rafael', 'Diego'],
      expediente: [null, ['09:00', '19:00'], ['09:00', '19:00'], ['09:00', '19:00'], ['09:00', '20:00'], ['09:00', '20:00'], ['08:00', '14:00']],
      servicos: [['corte', 'Corte', 30, 45], ['barba', 'Barba', 30, 35], ['corte-barba', 'Corte + barba', 60, 70], ['sobrancelha', 'Sobrancelha', 30, 20], ['pigmentacao', 'Pigmentação', 60, 60]]
    },
    salao: {
      rotulo: 'Salão de beleza', empresa: 'Studio Beleza Exemplo', whatsapp: '5531992868113', cor: '#be185d',
      endereco: 'Avenida Exemplo, 250 · sala 3',
      profissionais: ['Juliana', 'Camila'],
      expediente: [null, null, ['09:00', '19:00'], ['09:00', '19:00'], ['09:00', '19:00'], ['09:00', '19:00'], ['08:00', '17:00']],
      servicos: [['escova', 'Escova', 60, 60], ['corte-fem', 'Corte feminino', 60, 90], ['manicure', 'Manicure', 60, 40], ['pedicure', 'Pedicure', 60, 45], ['coloracao', 'Coloração', 120, 180]]
    },
    estetica: {
      rotulo: 'Estética', empresa: 'Espaço Estética Exemplo', whatsapp: '5531992868113', cor: '#7c3aed',
      endereco: 'Rua Exemplo, 45 · 2º andar',
      profissionais: ['Patrícia'],
      expediente: [null, ['09:00', '18:00'], ['09:00', '18:00'], ['09:00', '18:00'], ['09:00', '18:00'], ['09:00', '18:00'], ['09:00', '13:00']],
      servicos: [['limpeza-pele', 'Limpeza de pele', 90, 150], ['design-sobrancelha', 'Design de sobrancelha', 30, 50], ['massagem', 'Massagem relaxante', 60, 120], ['drenagem', 'Drenagem linfática', 60, 130]]
    },
    petshop: {
      rotulo: 'Banho e tosa', empresa: 'Pet Feliz Exemplo', whatsapp: '5531992868113', cor: '#0f766e',
      endereco: 'Rua Exemplo, 77 · Bairro Exemplo',
      profissionais: ['Equipe'],
      expediente: [null, ['08:00', '18:00'], ['08:00', '18:00'], ['08:00', '18:00'], ['08:00', '18:00'], ['08:00', '18:00'], ['08:00', '14:00']],
      servicos: [['banho-p', 'Banho · porte pequeno', 60, 50], ['banho-m', 'Banho · porte médio', 60, 65], ['banho-tosa', 'Banho e tosa', 120, 110], ['tosa-higienica', 'Tosa higiênica', 30, 35], ['hidratacao', 'Hidratação', 30, 40]]
    }
  };

  /* ---------------- utilidades ---------------- */
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function dataISO(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function lerData(iso) { var a = String(iso).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function somarDias(iso, n) { var d = lerData(iso); d.setDate(d.getDate() + n); return dataISO(d); }
  function minutos(hhmm) { var a = String(hhmm).split(':').map(Number); return a[0] * 60 + a[1]; }
  function hora(min) { return p2(Math.floor(min / 60)) + ':' + p2(min % 60); }
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function dataExtensa(iso) { var d = lerData(iso); return DIAS[d.getDay()] + ', ' + p2(d.getDate()) + '/' + p2(d.getMonth() + 1); }
  function formatarMoeda(n) {
    var v = Math.round((Number(n) || 0) * 100) / 100;
    var partes = v.toFixed(2).split('.');
    return 'R$ ' + partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + partes[1];
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
    var d = normalizarWhats(tel).slice(2);
    if (!d) return String(tel || '');
    return d.length === 11 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7) : '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  }
  function semAcento(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function rotuloStatus(id) { for (var i = 0; i < STATUS.length; i++) if (STATUS[i].id === id) return STATUS[i].rotulo; return id; }
  function primeiroNome(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }

  function cfgDe(estado) { return NICHOS_AGENDA[estado.nicho] || NICHOS_AGENDA.barbearia; }
  function servicoPorId(cfg, id) {
    for (var i = 0; i < cfg.servicos.length; i++) if (cfg.servicos[i][0] === id) {
      var s = cfg.servicos[i]; return { id: s[0], nome: s[1], duracao: s[2], preco: s[3] };
    }
    return null;
  }

  /* ---------------- horários ---------------- */
  function expedienteDo(cfg, iso) { return cfg.expediente[lerData(iso).getDay()] || null; }

  function sobrepoe(ini1, dur1, ini2, dur2) { return ini1 < ini2 + dur2 && ini2 < ini1 + dur1; }

  /* Horários livres para um serviço, num dia, com um profissional. "agora" impede horários que já passaram. */
  function horariosLivres(estado, iso, servicoId, profissional, agora) {
    var cfg = cfgDe(estado), exp = expedienteDo(cfg, iso), sv = servicoPorId(cfg, servicoId);
    if (!exp || !sv || cfg.profissionais.indexOf(profissional) < 0) return [];
    var abre = minutos(exp[0]), fecha = minutos(exp[1]);
    var limite = -1;
    if (agora) {
      var hoje = dataISO(agora);
      if (iso < hoje) return [];
      if (iso === hoje) limite = agora.getHours() * 60 + agora.getMinutes();
    }
    var ocupados = estado.agendamentos.filter(function (a) { return a.data === iso && a.profissional === profissional && OCUPA[a.status]; });
    var livres = [];
    for (var m = abre; m + sv.duracao <= fecha; m += INTERVALO) {
      if (m <= limite) continue;
      var conflito = ocupados.some(function (a) { return sobrepoe(m, sv.duracao, minutos(a.hora), a.duracao); });
      if (!conflito) livres.push(hora(m));
    }
    return livres;
  }

  /* Próximos dias (a partir de hoje) com expediente. */
  function proximosDias(estado, agora, quantos) {
    var cfg = cfgDe(estado), dias = [], iso = dataISO(agora || new Date());
    for (var i = 0; dias.length < (quantos || 7) && i < 30; i++) {
      var d = somarDias(iso, i);
      if (expedienteDo(cfg, d)) dias.push(d);
    }
    return dias;
  }

  /* ---------------- agendamentos ---------------- */
  function validarPedido(estado, pedido, agora) {
    var erros = [], cfg = cfgDe(estado);
    var sv = servicoPorId(cfg, pedido.servicoId);
    if (!sv) erros.push('Escolha um serviço.');
    if (cfg.profissionais.indexOf(pedido.profissional) < 0) erros.push('Escolha um profissional.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pedido.data || '')) erros.push('Escolha um dia.');
    if (!/^\d{2}:\d{2}$/.test(pedido.hora || '')) erros.push('Escolha um horário.');
    if (String(pedido.cliente && pedido.cliente.nome || '').trim().length < 2) erros.push('Informe o seu nome.');
    if (!normalizarWhats(pedido.cliente && pedido.cliente.whatsapp)) erros.push('Informe um WhatsApp válido, com DDD.');
    if (!erros.length && horariosLivres(estado, pedido.data, pedido.servicoId, pedido.profissional, agora).indexOf(pedido.hora) < 0) {
      erros.push('Este horário não está mais disponível. Escolha outro.');
    }
    return erros;
  }

  function criarAgendamento(estado, pedido, agora) {
    var erros = validarPedido(estado, pedido, agora);
    if (erros.length) throw new Error(erros.join(' '));
    var cfg = cfgDe(estado), sv = servicoPorId(cfg, pedido.servicoId);
    var quando = (agora || new Date()).toISOString();
    var a = {
      id: 'ag' + estado.seq + '-' + Math.random().toString(36).slice(2, 7),
      numero: estado.seq,
      data: pedido.data, hora: pedido.hora, duracao: sv.duracao,
      servicoId: sv.id, servico: sv.nome, preco: sv.preco, profissional: pedido.profissional,
      cliente: { nome: String(pedido.cliente.nome).trim(), whatsapp: normalizarWhats(pedido.cliente.whatsapp) },
      observacoes: String(pedido.observacoes || '').trim().slice(0, 300),
      status: 'pendente', criadoEm: quando, historico: [{ status: 'pendente', em: quando }]
    };
    estado.seq++;
    estado.agendamentos.push(a);
    return a;
  }

  function podeMudar(de, para) { return (TRANSICOES[de] || []).indexOf(para) > -1; }
  function mudarStatus(ag, para, agora) {
    if (!podeMudar(ag.status, para)) throw new Error('Não é possível passar de "' + rotuloStatus(ag.status) + '" para "' + rotuloStatus(para) + '".');
    var quando = (agora || new Date()).toISOString();
    ag.status = para;
    ag.historico = (ag.historico || []).concat([{ status: para, em: quando }]);
    return ag;
  }

  function doDia(estado, iso) {
    return estado.agendamentos.filter(function (a) { return a.data === iso; })
      .sort(function (x, y) { return x.hora < y.hora ? -1 : x.hora > y.hora ? 1 : x.profissional < y.profissional ? -1 : 1; });
  }

  function buscar(estado, termo) {
    var t = semAcento(termo).trim(), dig = soDigitos(termo);
    if (!t) return [];
    return estado.agendamentos.filter(function (a) {
      if (semAcento(a.cliente.nome + ' ' + a.servico).indexOf(t) > -1) return true;
      return dig.length >= 4 && a.cliente.whatsapp.indexOf(dig) > -1;
    }).sort(function (x, y) { return (x.data + x.hora) < (y.data + y.hora) ? 1 : -1; });
  }

  function resumo(estado, iso) {
    var dia = doDia(estado, iso);
    var r = { total: 0, pendentes: 0, confirmados: 0, atendidos: 0, faltas: 0, previsto: 0, recebido: 0 };
    dia.forEach(function (a) {
      if (a.status === 'cancelado') return;
      r.total++;
      if (a.status === 'pendente') r.pendentes++;
      if (a.status === 'confirmado') r.confirmados++;
      if (a.status === 'concluido') { r.atendidos++; r.recebido += a.preco; }
      if (a.status === 'faltou') r.faltas++;
      if (a.status !== 'faltou') r.previsto += a.preco;
    });
    var decididos = estado.agendamentos.filter(function (a) { return a.status === 'concluido' || a.status === 'faltou'; });
    r.taxaFaltas = decididos.length ? Math.round(decididos.filter(function (a) { return a.status === 'faltou'; }).length / decididos.length * 100) : 0;
    return r;
  }

  /* ---------------- mensagens ---------------- */
  function mensagemPedido(ag, estado) {
    var cfg = cfgDe(estado);
    return 'Olá! Sou ' + ag.cliente.nome + ' e pedi um horário pelo site da ' + cfg.empresa + ':\n' +
      '• ' + ag.servico + (cfg.profissionais.length > 1 ? ' com ' + ag.profissional : '') + '\n' +
      '• ' + dataExtensa(ag.data) + ' às ' + ag.hora + '\n' +
      (ag.observacoes ? '• Obs.: ' + ag.observacoes + '\n' : '') + 'Pode confirmar?';
  }
  function mensagemConfirmacao(ag, estado) {
    var cfg = cfgDe(estado);
    return 'Olá, ' + primeiroNome(ag.cliente.nome) + '! Aqui é da ' + cfg.empresa + '. Seu horário está confirmado:\n' +
      '• ' + ag.servico + (cfg.profissionais.length > 1 ? ' com ' + ag.profissional : '') + '\n' +
      '• ' + dataExtensa(ag.data) + ' às ' + ag.hora + '\n' +
      '• ' + cfg.endereco + '\n' +
      'Se precisar remarcar, é só responder esta mensagem. Até lá!';
  }
  function mensagemLembrete(ag, estado) {
    var cfg = cfgDe(estado);
    return 'Olá, ' + primeiroNome(ag.cliente.nome) + '! Passando para lembrar do seu horário na ' + cfg.empresa + ' ' +
      dataExtensa(ag.data) + ' às ' + ag.hora + ' (' + ag.servico + '). Podemos confirmar?';
  }
  function linkWhats(tel, texto) { var n = normalizarWhats(tel); return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(texto) : ''; }

  /* ---------------- demonstração e armazenamento ---------------- */
  function criarDemo(nicho, agora) {
    var base = agora || new Date();
    var estado = { versao: VERSAO_DADOS, nicho: NICHOS_AGENDA[nicho] ? nicho : 'barbearia', seq: 101, agendamentos: [] };
    var cfg = cfgDe(estado);
    var nomes = ['Lucas Martins', 'Bruna Costa', 'Pedro Oliveira', 'Larissa Gomes', 'Thiago Ribeiro', 'Aline Ferreira', 'Gustavo Dias', 'Renata Melo'];
    var dias = proximosDias(estado, base, 3);
    var ontem = (function () { for (var i = 1; i < 8; i++) { var d = somarDias(dataISO(base), -i); if (expedienteDo(cfg, d)) return d; } return null; })();
    // dias[0] = hoje (ou o próximo dia aberto): é a agenda que o dono vê primeiro.
    var plano = [[dias[0], 0, 'concluido'], [dias[0], 2, 'confirmado'], [dias[0], 3, 'pendente'], [dias[0], 1, 'confirmado'],
      [dias[1] || dias[0], 4, 'pendente'], [dias[1] || dias[0], 0, 'cancelado']];
    if (ontem) plano.push([ontem, 0, 'concluido'], [ontem, 1, 'faltou']);
    plano.forEach(function (p, i) {
      var sv = cfg.servicos[p[1] % cfg.servicos.length];
      var prof = cfg.profissionais[i % cfg.profissionais.length];
      var livres = horariosLivres(estado, p[0], sv[0], prof, null);
      if (!livres.length) return;
      var h = livres[Math.min(livres.length - 1, 2 + i * 2)];
      var a = criarAgendamento(estado, {
        servicoId: sv[0], profissional: prof, data: p[0], hora: h,
        cliente: { nome: nomes[i], whatsapp: '319000000' + (20 + i) } // (31) 90000-00XX: fictício
      }, null);
      var caminho = { pendente: [], confirmado: ['confirmado'], concluido: ['confirmado', 'concluido'], faltou: ['confirmado', 'faltou'], cancelado: ['cancelado'] }[p[2]];
      caminho.forEach(function (st) { mudarStatus(a, st, base); });
    });
    return estado;
  }

  function carregar(armazem) {
    try {
      var e = JSON.parse((armazem || global.localStorage).getItem(CHAVE_DADOS) || 'null');
      if (e && e.versao === VERSAO_DADOS && Array.isArray(e.agendamentos) && NICHOS_AGENDA[e.nicho]) return e;
    } catch (err) { /* sem armazenamento: usa dados novos */ }
    return null;
  }
  function salvar(estado, armazem) {
    try { (armazem || global.localStorage).setItem(CHAVE_DADOS, JSON.stringify(estado)); return true; } catch (err) { return false; }
  }

  global.Agenda = {
    CHAVE_DADOS: CHAVE_DADOS, INTERVALO: INTERVALO, STATUS: STATUS, TRANSICOES: TRANSICOES, NICHOS_AGENDA: NICHOS_AGENDA,
    dataISO: dataISO, somarDias: somarDias, dataExtensa: dataExtensa, minutos: minutos, hora: hora,
    formatarMoeda: formatarMoeda, normalizarWhats: normalizarWhats, formatarTelefone: formatarTelefone, rotuloStatus: rotuloStatus,
    cfgDe: cfgDe, servicoPorId: servicoPorId, expedienteDo: expedienteDo, horariosLivres: horariosLivres, proximosDias: proximosDias,
    validarPedido: validarPedido, criarAgendamento: criarAgendamento, podeMudar: podeMudar, mudarStatus: mudarStatus,
    doDia: doDia, buscar: buscar, resumo: resumo,
    mensagemPedido: mensagemPedido, mensagemConfirmacao: mensagemConfirmacao, mensagemLembrete: mensagemLembrete, linkWhats: linkWhats,
    criarDemo: criarDemo, carregar: carregar, salvar: salvar
  };
})(typeof window !== 'undefined' ? window : this);
