/*
 * Gerador de QR code (ISO/IEC 18004) feito para a LeonTech, sem bibliotecas de terceiros.
 * Modo byte (UTF-8), correção de erro nível M, versões 1 a 10 (até 213 bytes).
 * Nada sai do aparelho: o QR é desenhado aqui mesmo, em SVG.
 *
 *   QR.gerar(texto)      → { versao, tamanho, modulos: [[true/false…]…] }
 *   QR.svg(texto, opcoes) → string <svg>…</svg>
 */
(function (global) {
  'use strict';

  /* Blocos por versão no nível M: [códigos de correção por bloco, [tamanho dos dados de cada bloco…]] */
  var BLOCOS_M = [null,
    [10, [16]], [16, [28]], [26, [44]], [18, [32, 32]], [24, [43, 43]],
    [16, [27, 27, 27, 27]], [18, [31, 31, 31, 31]], [22, [38, 38, 39, 39]],
    [22, [36, 36, 36, 37, 37]], [26, [43, 43, 43, 43, 44]]];
  var ALINHAMENTO = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  var RESTO_BITS = [null, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0];
  var VERSAO_MAX = 10;

  /* ---------- aritmética no corpo finito GF(256), polinômio 0x11D ---------- */
  function mult(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z & 0xFF;
  }
  function divisorRS(grau) {
    var r = []; for (var i = 0; i < grau; i++) r.push(0);
    r[grau - 1] = 1;
    var raiz = 1;
    for (i = 0; i < grau; i++) {
      for (var j = 0; j < r.length; j++) { r[j] = mult(r[j], raiz); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      raiz = mult(raiz, 0x02);
    }
    return r;
  }
  function restoRS(dados, divisor) {
    var r = divisor.map(function () { return 0; });
    dados.forEach(function (b) {
      var fator = b ^ r.shift(); r.push(0);
      divisor.forEach(function (c, i) { r[i] ^= mult(c, fator); });
    });
    return r;
  }

  /* ---------- texto → bytes UTF-8 ---------- */
  function utf8(texto) {
    var s = unescape(encodeURIComponent(String(texto))), b = [];
    for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i));
    return b;
  }
  function capacidade(v) { return BLOCOS_M[v][1].reduce(function (a, b) { return a + b; }, 0); }
  function escolherVersao(nBytes) {
    for (var v = 1; v <= VERSAO_MAX; v++) {
      var bits = 4 + (v < 10 ? 8 : 16) + nBytes * 8;
      if (bits <= capacidade(v) * 8) return v;
    }
    return 0;
  }

  /* ---------- dados + correção, intercalados ---------- */
  function codigos(bytes, v) {
    var bits = [];
    function por(valor, n) { for (var i = n - 1; i >= 0; i--) bits.push((valor >>> i) & 1); }
    por(4, 4); por(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach(function (b) { por(b, 8); });
    var total = capacidade(v) * 8;
    por(0, Math.min(4, total - bits.length));
    while (bits.length % 8) bits.push(0);
    var dados = [];
    for (var i = 0; i < bits.length; i += 8) { var x = 0; for (var j = 0; j < 8; j++) x = (x << 1) | bits[i + j]; dados.push(x); }
    for (var p = 0; dados.length < capacidade(v); p++) dados.push(p % 2 ? 0x11 : 0xEC);

    var ec = BLOCOS_M[v][0], tamanhos = BLOCOS_M[v][1], div = divisorRS(ec), blocos = [], inicio = 0;
    tamanhos.forEach(function (t) { var d = dados.slice(inicio, inicio + t); inicio += t; blocos.push({ d: d, e: restoRS(d, div) }); });
    var saida = [], maior = Math.max.apply(null, tamanhos);
    for (i = 0; i < maior; i++) blocos.forEach(function (b) { if (i < b.d.length) saida.push(b.d[i]); });
    for (i = 0; i < ec; i++) blocos.forEach(function (b) { saida.push(b.e[i]); });
    return saida;
  }

  /* ---------- desenho da matriz (x = coluna, y = linha) ---------- */
  function Matriz(v) {
    this.v = v; this.n = v * 4 + 17;
    this.m = []; this.f = [];
    for (var y = 0; y < this.n; y++) { this.m.push([]); this.f.push([]); for (var x = 0; x < this.n; x++) { this.m[y].push(false); this.f[y].push(false); } }
  }
  Matriz.prototype.fixo = function (x, y, escuro) { this.m[y][x] = !!escuro; this.f[y][x] = true; };
  Matriz.prototype.localizador = function (cx, cy) {
    for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
      var x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= this.n || y >= this.n) continue;
      var d = Math.max(Math.abs(dx), Math.abs(dy));
      this.fixo(x, y, d !== 2 && d !== 4);
    }
  };
  Matriz.prototype.alinhamento = function (cx, cy) {
    for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) this.fixo(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  };
  Matriz.prototype.formato = function (mascara) {
    var dado = (0 << 3) | mascara; // nível M = 00
    var r = dado;
    for (var i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    var bits = ((dado << 10) | r) ^ 0x5412, n = this.n, self = this;
    function b(i) { return ((bits >>> i) & 1) !== 0; }
    for (i = 0; i <= 5; i++) self.fixo(8, i, b(i));
    self.fixo(8, 7, b(6)); self.fixo(8, 8, b(7)); self.fixo(7, 8, b(8));
    for (i = 9; i < 15; i++) self.fixo(14 - i, 8, b(i));
    for (i = 0; i < 8; i++) self.fixo(n - 1 - i, 8, b(i));
    for (i = 8; i < 15; i++) self.fixo(8, n - 15 + i, b(i));
    self.fixo(8, n - 8, true); // módulo escuro fixo
    return bits;
  };
  Matriz.prototype.versaoInfo = function () {
    if (this.v < 7) return 0;
    var r = this.v;
    for (var i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
    var bits = (this.v << 12) | r;
    for (i = 0; i < 18; i++) {
      var escuro = ((bits >>> i) & 1) !== 0, a = this.n - 11 + (i % 3), b = Math.floor(i / 3);
      this.fixo(a, b, escuro); this.fixo(b, a, escuro);
    }
    return bits;
  };
  Matriz.prototype.padroes = function () {
    var n = this.n, i;
    for (i = 0; i < n; i++) { this.fixo(6, i, i % 2 === 0); this.fixo(i, 6, i % 2 === 0); }
    this.localizador(3, 3); this.localizador(n - 4, 3); this.localizador(3, n - 4);
    var pos = ALINHAMENTO[this.v], k = pos.length;
    for (i = 0; i < k; i++) for (var j = 0; j < k; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === k - 1) || (i === k - 1 && j === 0)) continue;
      this.alinhamento(pos[i], pos[j]);
    }
    this.formato(0); // reserva a área (os bits certos entram depois de escolher a máscara)
    this.versaoInfo();
  };
  Matriz.prototype.colocar = function (cods) {
    var n = this.n, i = 0, total = cods.length * 8;
    for (var dir = n - 1; dir >= 1; dir -= 2) {
      if (dir === 6) dir = 5;
      for (var vert = 0; vert < n; vert++) for (var j = 0; j < 2; j++) {
        var x = dir - j, subindo = ((dir + 1) & 2) === 0, y = subindo ? n - 1 - vert : vert;
        if (!this.f[y][x] && i < total) { this.m[y][x] = ((cods[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0; i++; }
      }
    }
  };
  function aplicaMascara(k, x, y) {
    switch (k) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
      case 5: return (x * y) % 2 + (x * y) % 3 === 0;
      case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
      default: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
    }
  }
  Matriz.prototype.mascarar = function (k) {
    for (var y = 0; y < this.n; y++) for (var x = 0; x < this.n; x++) if (!this.f[y][x] && aplicaMascara(k, x, y)) this.m[y][x] = !this.m[y][x];
  };
  /* Penalidade (regras 1 a 4 da norma) para escolher a máscara mais legível. */
  Matriz.prototype.penalidade = function () {
    var n = this.n, m = this.m, p = 0, x, y;
    function linha(get) {
      var pts = 0, seq = [];
      for (var i = 0; i < n; i++) seq.push(get(i));
      for (var a = 0; a < n;) { var b = a; while (b < n && seq[b] === seq[a]) b++; if (b - a >= 5) pts += 3 + (b - a - 5); a = b; }
      var s = seq.map(function (v) { return v ? '1' : '0'; }).join('');
      var re = /(?=(10111010000|00001011101))/g; while (re.exec(s)) { pts += 40; re.lastIndex++; }
      return pts;
    }
    for (y = 0; y < n; y++) p += linha(function (i) { return m[y][i]; });
    for (x = 0; x < n; x++) p += linha(function (i) { return m[i][x]; });
    for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++) { var c = m[y][x]; if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; }
    var escuros = 0; for (y = 0; y < n; y++) for (x = 0; x < n; x++) if (m[y][x]) escuros++;
    p += Math.floor(Math.abs(escuros * 100 / (n * n) - 50) / 5) * 10;
    return p;
  };

  function gerar(texto) {
    var bytes = utf8(texto), v = escolherVersao(bytes.length);
    if (!v) throw new Error('Texto longo demais para o QR (máx. 213 bytes).');
    var cods = codigos(bytes, v), melhor = null, melhorP = Infinity, melhorK = 0;
    for (var k = 0; k < 8; k++) {
      var q = new Matriz(v); q.padroes(); q.colocar(cods); q.mascarar(k); q.formato(k);
      var p = q.penalidade();
      if (p < melhorP) { melhor = q; melhorP = p; melhorK = k; }
    }
    return { versao: v, tamanho: melhor.n, mascara: melhorK, modulos: melhor.m };
  }

  function svg(texto, opcoes) {
    opcoes = opcoes || {};
    var q = gerar(texto), borda = 4, total = q.tamanho + borda * 2, d = '';
    for (var y = 0; y < q.tamanho; y++) for (var x = 0; x < q.tamanho; x++) if (q.modulos[y][x]) d += 'M' + (x + borda) + ',' + (y + borda) + 'h1v1h-1z';
    var rotulo = String(opcoes.rotulo || 'QR code').replace(/[&<>"]/g, '');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" shape-rendering="crispEdges" role="img" aria-label="' + rotulo + '"' +
      (opcoes.tamanho ? ' width="' + opcoes.tamanho + '" height="' + opcoes.tamanho + '"' : '') + '>' +
      '<rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>';
  }

  global.QR = { gerar: gerar, svg: svg, _interno: { mult: mult, divisorRS: divisorRS, restoRS: restoRS, codigos: codigos, escolherVersao: escolherVersao, utf8: utf8, Matriz: Matriz } };
})(typeof window !== 'undefined' ? window : this);
