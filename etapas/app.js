/* Telas do sistema de etapas (demonstração). Regras em etapas.js, QR code em qr.js. */
(function () {
  'use strict';
  var E = window.Etapas;
  var estado = E.carregar() || E.criarDemo('martelinho');
  var semArmazenamento = !E.salvar(estado);
  var raiz = document.getElementById('app');
  var BASE = location.origin + location.pathname;
  var termoBusca = '';
  var rascunho = null;
  var ultimoConcluido = null; // { id, etapa } para mostrar "Avisar cliente" depois de concluir

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cfg() { return E.cfgDe(estado); }
  /* Avisa quando o aparelho deixa de salvar (memória cheia ou bloqueada); os dados continuam na tela aberta. */
  function gravar() {
    var ok = E.salvar(estado);
    if (!ok && !semArmazenamento) aviso('Não consegui salvar neste aparelho (memória cheia ou bloqueada). O que você fez vale só enquanto esta tela estiver aberta.', 'erro');
    semArmazenamento = !ok;
    return ok;
  }
  function lerPref(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function salvarPref(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function aviso(msg, tipo) {
    var el = document.getElementById('aviso');
    el.textContent = msg; el.className = 'aviso mostrar ' + (tipo || '');
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { el.className = 'aviso'; }, 3200);
  }
  function placaHtml(it) { return it.placa ? '<span class="placa">' + esc(E.formatarPlaca(it.placa)) + '</span> ' : ''; }

  /* ---------------- cabeçalho ---------------- */
  function pintarCabecalho(rota) {
    document.documentElement.style.setProperty('--marca', cfg().cor);
    document.getElementById('nomeEmpresa').textContent = cfg().empresa;
    document.getElementById('nichoEmpresa').textContent = rota === 'acompanhar' ? 'Acompanhamento do serviço' : cfg().rotulo;
    document.getElementById('nicho').value = estado.nicho;
    document.body.classList.toggle('modo-cliente', rota === 'acompanhar');
    document.title = (rota === 'acompanhar' ? 'Acompanhe seu serviço' : 'Sistema de etapas') + ' — ' + cfg().empresa;
    var aba = { quadro: '#quadro', ler: '#ler', novo: '#novo', item: '#quadro', etiqueta: '#quadro' }[rota] || '';
    [].forEach.call(document.querySelectorAll('.abas a'), function (a) {
      var ativa = a.getAttribute('href') === aba;
      a.classList.toggle('ativa', ativa);
      if (ativa) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------------- quadro ---------------- */
  function telaQuadro() {
    var agora = new Date(), r = E.resumo(estado, agora);
    var lista = E.buscar(estado, termoBusca).filter(function (it) { return !it.cancelado; });
    var colunas = E.etapasDe(estado).map(function (et) {
      var doEtapa = lista.filter(function (it) { return it.etapa === et.id; });
      if (et.id === 'entregue') doEtapa = doEtapa.slice(0, 5);
      return '<section class="coluna" aria-label="' + esc(et.rotulo) + '"><h2>' + esc(et.rotulo) + ' <span>' + doEtapa.length + '</span></h2>' +
        (doEtapa.length ? '<ul>' + doEtapa.map(function (it) { return '<li>' + ficha(it, agora) + '</li>'; }).join('') + '</ul>' : '<p class="fraco dica-rolar">Vazio</p>') +
        '</section>';
    }).join('');
    return '<h1 class="titulo" tabindex="-1">Quadro da ' + esc(cfg().item === 'Veículo' ? 'oficina' : 'assistência') + '</h1>' +
      '<div class="cartoes">' +
        cartao(r.emAndamento, 'Em andamento') + cartao(r.prontos, 'Prontos para retirar') +
        cartao(r.atrasados, 'Atrasados (passaram da previsão)', r.atrasados > 0) + cartao(r.entreguesMes, 'Entregues no mês') +
      '</div>' +
      '<label class="busca"><span class="vis-oculto">Buscar</span><input id="busca" type="search" placeholder="Buscar por ' +
        (cfg().tipoItem === 'veiculo' ? 'placa, modelo' : 'modelo') + ', cliente ou nº" value="' + esc(termoBusca) + '"></label>' +
      '<div class="quadro" id="quadroColunas">' + colunas + '</div>' +
      '<p class="fraco dica-rolar">Arraste para o lado para ver todas as etapas. Toque num ' + esc(cfg().item.toLowerCase()) + ' para abrir a ficha (é o que o colaborador vê ao ler o QR).</p>';
  }
  function cartao(v, rotulo, alerta) { return '<div class="cartao' + (alerta ? ' alerta' : '') + '"><strong>' + esc(v) + '</strong><span>' + esc(rotulo) + '</span></div>'; }
  function ficha(it, agora) {
    var atras = E.atrasado(estado, it, agora);
    return '<a class="ficha' + (atras ? ' atrasada' : '') + '" href="#item/' + esc(it.id) + '">' +
      '<strong>' + placaHtml(it) + esc(it.modelo) + '</strong>' +
      '<small>nº ' + esc(it.numero) + ' · ' + esc(it.cliente.nome) + '</small>' +
      '<small>' + (it.etapa === 'entregue' ? 'entregue' : 'nesta etapa há ' + esc(E.tempoTexto(E.minutosNaEtapa(it, agora)))) +
      (atras ? ' <span class="selo selo-atraso">atrasado</span>' : '') + '</small></a>';
  }

  /* ---------------- nova entrada ---------------- */
  function rascunhoVazio() { return { nome: '', whatsapp: '', modelo: '', cor: '', placa: '', avarias: '', previsao: E.dataISO(new Date(Date.now() + 3 * 86400000)), obs: '' }; }
  function telaNovo(erros) {
    if (!rascunho) rascunho = rascunhoVazio();
    var d = rascunho, c = cfg(), veic = c.tipoItem === 'veiculo';
    erros = erros || {};
    return '<div class="estreito"><h1 class="titulo" tabindex="-1">Entrada de ' + esc(c.item.toLowerCase()) + '</h1>' +
      '<form id="formNovo" novalidate>' +
      '<fieldset><legend>Cliente</legend>' +
        campo('nome', 'Nome', d.nome, 'text', 'Ex.: Maria da Silva', 'autocomplete="off"', erros) +
        campo('whatsapp', 'WhatsApp (para os avisos)', d.whatsapp, 'tel', '(31) 99999-9999', 'inputmode="tel"', erros) +
      '</fieldset>' +
      '<fieldset><legend>' + esc(c.item) + '</legend>' +
        (veic ? '<div class="dupla">' + campo('placa', 'Placa', d.placa, 'text', 'ABC1D23', 'autocapitalize="characters" maxlength="8"', erros) +
          campo('modelo', 'Modelo', d.modelo, 'text', 'Ex.: Onix', '', erros) + '</div>' +
          campo('cor', 'Cor', d.cor, 'text', 'Ex.: prata', '', erros)
          : campo('modelo', 'Marca e modelo', d.modelo, 'text', 'Ex.: Galaxy A54', '', erros)) +
      '</fieldset>' +
      '<fieldset><legend>' + esc(c.rotuloAvarias || 'Avarias') + '</legend>' +
        '<div class="sugestoes"><span class="fraco">Toque para adicionar:</span> ' + c.sugestoesAvaria.map(function (s, i) {
          return '<button type="button" class="chip" data-sugestao="' + i + '">' + esc(s) + '</button>';
        }).join('') + '</div>' +
        '<label class="campo"><span>Um por linha (vira o checklist da etapa de ' + esc(etapaAvarias().rotulo.toLowerCase()) + ')</span>' +
        '<textarea id="avarias" rows="4"' + (erros.avarias ? ' aria-invalid="true"' : '') + '>' + esc(d.avarias) + '</textarea>' +
        '<span class="msg">' + esc(erros.avarias || '') + '</span></label>' +
      '</fieldset>' +
      '<fieldset><legend>Prazo</legend>' + campo('previsao', 'Previsão de entrega', d.previsao, 'date', '', '', erros) +
        '<label class="campo"><span>Observações internas</span><textarea id="obs" rows="2" placeholder="Ex.: cliente pediu para guardar o veículo coberto">' + esc(d.obs) + '</textarea></label>' +
      '</fieldset>' +
      (Object.keys(erros).length ? '<div class="erro-caixa" role="alert">Confira os campos marcados.</div>' : '') +
      '<button type="submit" class="botao principal largo">Registrar entrada e gerar etiqueta</button>' +
      '</form></div>';
  }
  function etapaAvarias() { return E.etapasDe(estado).filter(function (e) { return e.avarias; })[0]; }
  function campo(id, rotulo, valor, tipo, ph, extra, erros) {
    return '<label class="campo"><span>' + esc(rotulo) + '</span><input id="' + id + '" type="' + tipo + '" value="' + esc(valor) + '" placeholder="' + esc(ph) + '" ' + extra +
      (erros[id] ? ' aria-invalid="true"' : '') + '><span class="msg">' + esc(erros[id] || '') + '</span></label>';
  }
  function lerFormulario() {
    ['nome', 'whatsapp', 'placa', 'modelo', 'cor', 'avarias', 'previsao', 'obs'].forEach(function (k) {
      var el = document.getElementById(k); if (el) rascunho[k] = el.value;
    });
  }

  /* ---------------- etiqueta com QR ---------------- */
  function telaEtiqueta(it) {
    var linkColab = E.linkColaborador(BASE, it), linkCli = E.linkCliente(BASE, it);
    var msg = E.mensagemCliente(estado, it, linkCli);
    return '<div class="estreito"><a class="voltar" href="#quadro">← Quadro</a>' +
      '<h1 class="titulo" tabindex="-1">Etiqueta do ' + esc(cfg().item.toLowerCase()) + ' nº ' + esc(it.numero) + '</h1>' +
      '<p class="fraco">Imprima e cole no painel, na chave ou no ' + esc(cfg().tipoItem === 'veiculo' ? 'para-brisa' : 'saquinho do aparelho') +
        '. O colaborador aponta a câmera do celular para o QR e abre a ficha com a etapa e o checklist.</p>' +
      '<div class="etiqueta">' + QR.svg(linkColab, { rotulo: 'QR code da ficha nº ' + it.numero }) +
        '<div><small>' + esc(cfg().empresa) + '</small>' +
        (it.placa ? '<div class="placa-grande">' + esc(E.formatarPlaca(it.placa)) + '</div>' : '') +
        '<strong>' + esc(it.modelo) + (it.cor ? ' ' + esc(it.cor) : '') + '</strong>' +
        '<small>nº ' + esc(it.numero) + ' · ' + esc(it.cliente.nome) + '</small>' +
        (it.previsao ? '<small>Previsão: ' + esc(E.dataBR(it.previsao)) + '</small>' : '') + '</div></div>' +
      '<div class="acoes"><button type="button" class="botao" id="imprimir">Imprimir etiqueta</button>' +
        '<a class="botao principal" href="#item/' + esc(it.id) + '">Simular leitura do QR</a></div>' +
      '<h2 style="font-size:16px;margin:18px 0 6px">Para o cliente acompanhar</h2>' +
      '<p class="fraco" style="margin:0">Mande o link pelo WhatsApp ou mostre este QR na hora da entrega do ' + esc(cfg().item.toLowerCase()) + '. O cliente vê só as etapas do serviço dele.</p>' +
      '<div class="qr-cliente">' + QR.svg(linkCli, { rotulo: 'QR code de acompanhamento do cliente' }) +
        '<div><a href="#acompanhar/' + esc(it.token) + '">Ver como o cliente vê</a><p class="link-copia">' + esc(linkCli) + '</p></div></div>' +
      (it.cliente.whatsapp ? '<a class="botao whats largo" style="margin-top:10px" target="_blank" rel="noopener" href="' + esc(E.linkWhats(it.cliente.whatsapp, msg)) + '">Enviar link de acompanhamento pelo WhatsApp</a>' : '') +
      '</div>';
  }

  /* ---------------- ficha do colaborador ---------------- */
  function telaItem(it) {
    var c = cfg(), et = E.etapaAtual(estado, it), prox = E.proximaEtapa(estado, it), agora = new Date();
    var quem = lerPref('etapas_quem');
    if (c.equipe.indexOf(quem) < 0) quem = '';
    var html = '<div class="estreito"><a class="voltar" href="#quadro">← Quadro</a>' +
      '<div class="cab-item">' + placaHtml(it) + '<span class="fraco">nº ' + esc(it.numero) + '</span>' +
        '<h1 tabindex="-1" class="titulo" style="margin:6px 0 2px">' + esc(it.modelo) + (it.cor ? ' ' + esc(it.cor) : '') + '</h1>' +
        '<div class="fraco">' + esc(it.cliente.nome) + (it.previsao ? ' · previsão ' + esc(E.dataBR(it.previsao)) : '') +
        (E.atrasado(estado, it, agora) ? ' <span class="selo selo-atraso">atrasado</span>' : '') + '</div>' +
        (it.obs ? '<p class="fraco" style="margin:6px 0 0">Obs.: ' + esc(it.obs) + '</p>' : '') + '</div>';

    if (ultimoConcluido && ultimoConcluido.id === it.id) {
      var linkCli = E.linkCliente(BASE, it), msg = E.mensagemCliente(estado, it, linkCli);
      html += '<div class="concluido" role="status"><strong>✔ Etapa ' + esc(ultimoConcluido.etapa) + ' concluída</strong>' +
        'Agora está em <b>' + esc(et.rotulo) + '</b>. Avise o cliente com 1 toque:' +
        '<div class="acoes">' + (it.cliente.whatsapp
          ? '<a class="botao whats" target="_blank" rel="noopener" href="' + esc(E.linkWhats(it.cliente.whatsapp, msg)) + '" id="avisarCliente">Avisar cliente no WhatsApp</a>'
          : '<span class="fraco">Cliente sem WhatsApp cadastrado.</span>') +
        '<a class="botao" href="#quadro">Voltar ao quadro</a></div></div>';
    }

    if (it.cancelado) {
      html += '<div class="erro-caixa">Serviço cancelado' + (ultimoMotivo(it) ? ': ' + esc(ultimoMotivo(it)) : '') + '.</div>';
    } else if (!prox) {
      html += '<div class="etapa-atual"><small>Situação</small><strong>' + esc(et.rotulo) + '</strong></div>' +
        '<p class="fraco">Serviço encerrado. Este ' + esc(c.item.toLowerCase()) + ' já foi entregue ao cliente.</p>';
    } else {
      var lista = E.checklistDe(estado, it), m = E.marcados(it, it.etapa);
      html += '<div class="etapa-atual"><small>Etapa atual · há ' + esc(E.tempoTexto(E.minutosNaEtapa(it, agora))) + '</small><strong>' + esc(et.rotulo) + '</strong></div>' +
        '<h2 style="font-size:16px;margin:0 0 8px">O que fazer nesta etapa</h2>' +
        '<ul class="checklist">' + lista.map(function (t, i) {
          return '<li><label><input type="checkbox" data-check="' + i + '"' + (m[i] ? ' checked' : '') + '><span>' + esc(t) + '</span></label></li>';
        }).join('') + '</ul>' +
        '<label class="campo"><span>Quem está fazendo</span><select id="quem"><option value="">Escolha…</option>' +
          c.equipe.map(function (p) { return '<option' + (p === quem ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('') + '</select></label>' +
        '<div id="erroConcluir"></div>' +
        '<button type="button" class="botao principal largo" id="concluir">Concluir ' + esc(et.rotulo.toLowerCase()) + ' e passar para ' + esc(prox.rotulo.toLowerCase()) + '</button>';
    }

    html += '<h2 style="font-size:16px;margin:20px 0 6px">Histórico</h2><ol class="historico">' +
      it.historico.slice().reverse().map(function (h) {
        var r = (E.etapasDe(estado)[E.indiceEtapa(estado, h.etapa)] || {}).rotulo || h.etapa;
        var acao = { entrada: 'entrou em ' + r, concluiu: 'concluiu ' + r, voltou: 'voltou para ' + r, cancelou: 'cancelou o serviço' }[h.acao] || h.acao;
        return '<li>' + esc(E.horaBR(h.quando)) + ' · <b>' + esc(h.quem) + '</b> ' + esc(acao) + '</li>';
      }).join('') + '</ol>' +
      '<div class="acoes"><a class="botao" href="#etiqueta/' + esc(it.id) + '">Etiqueta e link do cliente</a>' +
      '<a class="botao" href="#acompanhar/' + esc(it.token) + '">Ver como o cliente vê</a>' +
      (!E.finalizado(estado, it) && E.indiceEtapa(estado, it.etapa) > 0 ? '<button type="button" class="botao" id="voltarEtapa">Voltar uma etapa</button>' : '') +
      (!E.finalizado(estado, it) ? '<button type="button" class="botao perigo" id="cancelar">Cancelar serviço</button>' : '') + '</div></div>';
    return html;
  }
  function ultimoMotivo(it) { var h = it.historico.filter(function (x) { return x.acao === 'cancelou'; }).pop(); return h ? h.motivo : ''; }

  /* ---------------- página do cliente ---------------- */
  function telaCliente(it) {
    var c = cfg();
    if (!it) return '<div class="estreito"><h1 class="titulo" tabindex="-1">Link não encontrado</h1><p>Confira o link com a ' + esc(c.empresa) + '.</p>' +
      '<p class="fraco">Nesta demonstração, os dados ficam só no aparelho em que foram criados.</p></div>';
    var tempo = E.linhaDoTempo(estado, it), et = E.etapaAtual(estado, it);
    var falar = E.linkWhats(E.WHATS_LEONTECH, 'Olá! Sou ' + E.primeiroNome(it.cliente.nome) + ', do ' + c.item.toLowerCase() + ' nº ' + it.numero + '. Queria uma informação.');
    return '<div class="estreito">' +
      '<h1 class="titulo" tabindex="-1">Olá, ' + esc(E.primeiroNome(it.cliente.nome)) + '!</h1>' +
      '<div class="cab-item">' + placaHtml(it) + '<strong>' + esc(it.modelo) + (it.cor ? ' ' + esc(it.cor) : '') + '</strong>' +
        '<div class="fraco">Serviço nº ' + esc(it.numero) + (it.previsao && !it.cancelado ? ' · previsão de entrega: ' + esc(E.dataBR(it.previsao)) : '') + '</div></div>' +
      (it.cancelado ? '<div class="erro-caixa">Este serviço foi encerrado. Fale com a ' + esc(c.empresa) + ' se tiver dúvidas.</div>' :
        '<div class="etapa-atual"><small>Agora</small><strong>' + esc(et.rotulo) + '</strong><span>' + esc(capitalizar(et.aviso)) + '.</span></div>') +
      '<ol class="linha-tempo">' + tempo.map(function (t, i) {
        return '<li class="' + t.situacao + '"><span class="marca" aria-hidden="true">' + (t.situacao === 'feita' ? '✓' : '') + '</span>' +
          '<strong>' + esc(t.rotulo) + '</strong><small>' + (t.situacao === 'feita' ? 'feita' + (t.quando ? ' em ' + esc(E.horaBR(t.quando)) : '') : t.situacao === 'atual' ? 'em andamento' : 'próxima') + '</small>' +
          '<span class="vis-oculto">' + (i + 1) + ' de ' + tempo.length + '</span></li>';
      }).join('') + '</ol>' +
      '<a class="botao whats largo" target="_blank" rel="noopener" href="' + esc(falar) + '">Falar com a ' + esc(c.empresa) + '</a>' +
      '<p class="fraco" style="font-size:12.5px;margin-top:10px">Atualizado em ' + esc(E.horaBR(new Date().toISOString())) + '. Esta página mostra só o andamento do seu serviço.</p></div>';
  }
  function capitalizar(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

  /* ---------------- ler QR (na demonstração: simulação) ---------------- */
  function telaLer() {
    var lista = estado.itens.filter(function (it) { return !E.finalizado(estado, it); });
    return '<div class="estreito"><h1 class="titulo" tabindex="-1">Ler QR</h1>' +
      '<p>Na oficina, o colaborador usa a <b>câmera do próprio celular</b>: aponta para a etiqueta e a ficha abre aqui, já na etapa certa.</p>' +
      '<p class="fraco">Na demonstração, os dados ficam neste aparelho, então simule a leitura escolhendo um ' + esc(cfg().item.toLowerCase()) + ':</p>' +
      '<ul class="checklist">' + lista.map(function (it) {
        return '<li><a class="ficha" href="#item/' + esc(it.id) + '"><strong>' + placaHtml(it) + esc(it.modelo) + '</strong><small>nº ' + esc(it.numero) + ' · ' +
          esc(E.etapaAtual(estado, it).rotulo) + '</small></a></li>';
      }).join('') + '</ul></div>';
  }

  /* ---------------- roteador ---------------- */
  function render() {
    var partes = (location.hash || '#quadro').slice(1).split('/'), rota = partes[0] || 'quadro', html, it;
    if (rota === 'novo') html = telaNovo();
    else if (rota === 'ler') html = telaLer();
    else if (rota === 'item' || rota === 'etiqueta') {
      it = E.porId(estado, partes[1]);
      html = it ? (rota === 'item' ? telaItem(it) : telaEtiqueta(it)) : '<h1 class="titulo" tabindex="-1">Ficha não encontrada</h1><p><a href="#quadro">Voltar ao quadro</a></p>';
    } else if (rota === 'acompanhar') html = telaCliente(E.porToken(estado, partes[1]));
    else { rota = 'quadro'; html = telaQuadro(); }
    if (rota !== 'item') ultimoConcluido = null;
    pintarCabecalho(rota);
    raiz.innerHTML = (estado.avisoCarga ? '<p class="erro-caixa" role="alert">' + esc(estado.avisoCarga) + '</p>' : '') + html +
      (semArmazenamento ? '<p class="erro-caixa" role="alert">Este aparelho não está salvando os dados (memória cheia, bloqueio ou aba anônima). A demonstração funciona, mas o que você fizer é apagado ao fechar.</p>' : '');
    var h1 = raiz.querySelector('h1'); if (h1 && render.focar) h1.focus();
    render.focar = true;
  }

  /* ---------------- eventos ---------------- */
  raiz.addEventListener('input', function (ev) {
    if (ev.target.id === 'busca') {
      termoBusca = ev.target.value;
      var pos = ev.target.selectionStart; render.focar = false; render();
      var b = document.getElementById('busca'); b.focus(); try { b.setSelectionRange(pos, pos); } catch (e) {}
    }
  });
  raiz.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.dataset && t.dataset.check !== undefined) {
      var it = E.porId(estado, location.hash.split('/')[1]);
      try { E.marcar(estado, it, Number(t.dataset.check), t.checked); gravar(); } catch (e) { aviso(e.message, 'erro'); }
    } else if (t.id === 'quem') salvarPref('etapas_quem', t.value);
  });
  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    var it = E.porId(estado, location.hash.split('/')[1]);
    if (b.dataset.sugestao !== undefined) {
      lerFormulario();
      var s = cfg().sugestoesAvaria[Number(b.dataset.sugestao)], linhas = rascunho.avarias.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (linhas.indexOf(s) < 0) linhas.push(s);
      rascunho.avarias = linhas.join('\n'); render.focar = false; render();
    } else if (b.id === 'imprimir') window.print();
    else if (b.id === 'concluir' && it) {
      var quem = document.getElementById('quem').value, etAntes = E.etapaAtual(estado, it).rotulo;
      try {
        E.concluirEtapa(estado, it, quem, new Date()); gravar();
        ultimoConcluido = { id: it.id, etapa: etAntes };
        render.focar = false; render(); window.scrollTo(0, 0);
        aviso('Etapa ' + etAntes + ' concluída.');
      } catch (e) {
        document.getElementById('erroConcluir').innerHTML = '<div class="erro-caixa" role="alert">' + esc(e.message) + '</div>';
      }
    } else if (b.id === 'voltarEtapa' && it) {
      if (!confirm('Voltar este ' + cfg().item.toLowerCase() + ' para a etapa anterior?')) return;
      E.voltarEtapa(estado, it, lerPref('etapas_quem') || 'Gestor', new Date()); gravar(); render(); aviso('Voltou uma etapa.');
    } else if (b.id === 'cancelar' && it) {
      var motivo = prompt('Motivo do cancelamento (ex.: cliente desistiu):', '');
      if (motivo === null) return;
      E.cancelar(estado, it, lerPref('etapas_quem') || 'Gestor', new Date(), motivo); gravar(); render(); aviso('Serviço cancelado.');
    }
  });
  raiz.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'formNovo') return;
    ev.preventDefault(); lerFormulario();
    var v = E.validarNovo(estado, rascunho);
    if (!v.ok) { raiz.innerHTML = telaNovo(v.erros); var p = raiz.querySelector('[aria-invalid="true"]'); if (p) p.focus(); return; }
    var it = E.novoItem(estado, rascunho, new Date(), 'Recepção'); gravar();
    rascunho = null; location.hash = '#etiqueta/' + it.id;
    aviso('Entrada registrada. Imprima a etiqueta.');
  });
  document.getElementById('nicho').addEventListener('change', function (ev) {
    estado = E.criarDemo(ev.target.value); gravar(); rascunho = null; termoBusca = '';
    location.hash = '#quadro'; render(); aviso('Demonstração trocada para ' + cfg().rotulo + '.');
  });
  document.getElementById('zerar').addEventListener('click', function () {
    if (!confirm('Apagar os dados desta demonstração e voltar aos exemplos?')) return;
    estado = E.criarDemo(estado.nicho); gravar(); rascunho = null; termoBusca = ''; location.hash = '#quadro'; render(); aviso('Demonstração zerada.');
  });
  addEventListener('hashchange', render);
  render.focar = false; render();

  // App instalável: o service worker controla só a pasta etapas/.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  window.APP_ETAPAS = { get estado() { return estado; }, render: render };
})();
