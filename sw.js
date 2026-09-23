/* sw.js — network-first: selalu coba versi terbaru, cache cuma cadangan offline */
const CACHE = 'aura-fit-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/variables.css',
  './css/background.css',
  './css/loader.css',
  './css/layout.css',
  './css/nav.css',
  './css/header.css',
  './css/workout.css',
  './css/sidebar.css',
  './css/components.css',
  './css/responsive.css',
  './js/config.js',
  './js/storage.js',
  './js/realtime.js',
  './js/workout.js',
  './js/pages.js',
  './js/main.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // network-first: ambil yang terbaru dari server, jatuh ke cache kalau offline
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && res.status === 200 && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
