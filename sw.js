const CACHE = 'hw-checker-v4'; // build.js가 배포마다 타임스탬프로 교체

const STATIC_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/firebase-config.js',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_FILES)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      const oldKeys = keys.filter(k => k !== CACHE);
      return Promise.all(oldKeys.map(k => caches.delete(k)))
        .then(() => self.clients.claim())
        .then(() => {
          // 구버전 캐시가 있었다면 업데이트 → 열린 탭에 새로고침 요청
          if (oldKeys.length > 0) {
            return self.clients.matchAll({ type: 'window' })
              .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' })));
          }
        });
    })
  );
});

self.addEventListener('fetch', e => {
  const { hostname } = new URL(e.request.url);
  if (hostname.includes('firebase') || hostname.includes('google') || hostname.includes('gstatic')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
