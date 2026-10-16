/*
 * Service worker do gerador (PWA). Registrado só pelo gerador.html, com escopo "gerador.html":
 * não controla a demo (index.html) nem as prévias (?p=).
 *
 * Guarda apenas os arquivos da própria ferramenta (rede primeiro; o cache só entra sem internet).
 * Nunca guarda as chamadas ao Apps Script (script.google.com) nem outros dados: tudo que não é
 * GET do próprio site, na lista abaixo, passa direto para a rede, sem o service worker tocar.
 *
 * Para desligar no futuro: troque este arquivo por um que só faça
 *   self.addEventListener('install', () => self.skipWaiting());
 *   self.addEventListener('activate', () => self.registration.unregister());
 */
const VERSAO = 'gerador-v1';
const SHELL = ['gerador.html', 'nichos.js', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'apple-touch-icon.png'];
const URLS_SHELL = new Set(SHELL.map(a => new URL(a, self.registration.scope).pathname));

self.addEventListener('install', ev => {
  // Nem um arquivo que falhe nem o cache indisponível (ex.: aba anônima) impedem a instalação.
  ev.waitUntil(caches.open(VERSAO)
    .then(c => Promise.all(SHELL.map(a => c.add(new Request(a, { cache: 'no-cache' })).catch(() => {}))))
    .catch(() => {})
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n.startsWith('gerador-') && n !== VERSAO).map(n => caches.delete(n))))
    .catch(() => {})
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !URLS_SHELL.has(url.pathname)) return;
  ev.respondWith((async () => {
    try {
      // Pede de novo pela URL (sem herdar o modo de navegação) e revalida o cache HTTP: atualização chega na hora.
      const resp = await fetch(url.href, { cache: 'no-cache', credentials: 'same-origin' });
      if (resp.ok && resp.type === 'basic') {
        const copia = resp.clone();
        ev.waitUntil(caches.open(VERSAO).then(c => c.put(url.pathname, copia)).catch(() => {}));
      }
      return resp;
    } catch (e) {
      const salvo = await caches.match(url.pathname, { cacheName: VERSAO }).catch(() => null);
      if (salvo) return salvo;
      throw e;
    }
  })());
});
