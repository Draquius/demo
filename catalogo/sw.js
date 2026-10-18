/*
 * Service worker da demonstração do catálogo. Escopo: só a pasta catalogo/.
 * Rede primeiro; o cache só entra sem internet. Guarda apenas os arquivos da lista abaixo
 * (os dados da demo ficam no localStorage do navegador, não aqui).
 */
const VERSAO = 'catalogo-v1';
const SHELL = ['./', 'index.html', 'catalogo.js', 'app.js', 'estilo.css', 'manifest.webmanifest',
  'icone-192.png', 'icone-512.png', 'apple-touch-icon.png'];
const URLS_SHELL = new Set(SHELL.map(a => new URL(a, self.registration.scope).pathname));

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSAO)
    .then(c => Promise.all(SHELL.map(a => c.add(new Request(a, { cache: 'no-cache' })).catch(() => {}))))
    .catch(() => {})
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n.startsWith('catalogo-') && n !== VERSAO).map(n => caches.delete(n))))
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
