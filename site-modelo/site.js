/* Modelo de site institucional: menu do celular, página ativa e formulário de contato que vira mensagem de WhatsApp. */
(function (global) {
  'use strict';
  var EMPRESA = { nome: 'Reforma Fácil Exemplo', whatsapp: '5531992868113' };

  /* Monta a mensagem do formulário (exposta para os testes). Retorna { erros, texto }. */
  function montarMensagem(d) {
    var erros = [];
    var nome = String(d.nome || '').trim(), tel = String(d.telefone || '').replace(/\D/g, '');
    if (nome.length < 2) erros.push('Informe o seu nome.');
    if (tel.length < 10 || tel.length > 13) erros.push('Informe um telefone com DDD.');
    if (!d.servico) erros.push('Escolha o tipo de serviço.');
    if (String(d.mensagem || '').trim().length < 5) erros.push('Conte em poucas palavras o que você precisa.');
    if (!d.consentimento) erros.push('Marque a autorização de contato.');
    var texto = 'Olá, ' + EMPRESA.nome + '! Vim pelo site.\n' +
      'Nome: ' + nome + '\nTelefone: ' + String(d.telefone || '').trim() + '\nServiço: ' + (d.servico || '') +
      (d.bairro ? '\nBairro: ' + String(d.bairro).trim() : '') + '\n\n' + String(d.mensagem || '').trim();
    return { erros: erros, texto: texto, link: 'https://wa.me/' + EMPRESA.whatsapp + '?text=' + encodeURIComponent(texto) };
  }
  global.SiteModelo = { EMPRESA: EMPRESA, montarMensagem: montarMensagem };

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    // Página ativa no menu.
    var pagina = location.pathname.split('/').pop() || 'index.html';
    [].forEach.call(document.querySelectorAll('nav.menu a'), function (a) {
      if (a.getAttribute('href') === pagina) a.setAttribute('aria-current', 'page');
    });
    // Menu do celular.
    var botao = document.querySelector('.botao-menu'), menu = document.querySelector('nav.menu');
    if (botao && menu) {
      botao.addEventListener('click', function () {
        var aberto = menu.classList.toggle('aberto');
        botao.setAttribute('aria-expanded', String(aberto));
        botao.textContent = aberto ? 'Fechar' : 'Menu';
      });
    }
    // Formulário de contato → WhatsApp (sem servidor: nada é gravado).
    var form = document.getElementById('formContato');
    if (form) {
      // Vindo de "Pedir orçamento" em Serviços: já escolhe o serviço.
      var pedido = new URLSearchParams(location.search).get('servico');
      if (pedido) [].forEach.call(form.elements.servico.options, function (o) { if (o.value === pedido) form.elements.servico.value = pedido; });
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var v = function (n) { return form.elements[n].value; };
        var r = montarMensagem({ nome: v('nome'), telefone: v('telefone'), servico: v('servico'), bairro: v('bairro'), mensagem: v('mensagem'), consentimento: form.elements.consentimento.checked });
        var caixa = document.getElementById('errosContato');
        if (r.erros.length) {
          caixa.textContent = r.erros.join(' ');
          caixa.setAttribute('tabindex', '-1'); caixa.focus();
          return;
        }
        caixa.textContent = '';
        window.open(r.link, '_blank', 'noopener');
      });
    }
  });
})(typeof window !== 'undefined' ? window : this);
