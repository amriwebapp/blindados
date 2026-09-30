// Service worker de Blindados: la app se abre al instante y funciona sin conexión
// (el modo online necesita red, claro). Sube VERSION cuando cambien los archivos base.
const VERSION = 'blindados-v1';
const CORE = ['/', '/index.html', '/config.js', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/icons/apple-touch-icon.png', '/icons/favicon-32.png'];
const CDN = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  // Páginas: primero la red (para recibir actualizaciones) y, sin conexión, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put('/index.html', c)); return r; })
      .catch(() => caches.match('/index.html')));
    return;
  }
  const same = u.origin === location.origin, cdn = CDN.some(o => req.url.startsWith(o));
  if (!same && !cdn) return; // Supabase y demás: directo a la red
  // Resto: respuesta guardada al momento y se actualiza en segundo plano.
  e.respondWith(caches.open(VERSION).then(async ca => {
    const hit = await ca.match(req);
    const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') ca.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
