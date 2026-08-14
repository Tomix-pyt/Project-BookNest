const CACHE_NAME = 'booknest-v1';
const SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(SHELL_ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});


self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url = new URL(req.url);

  if (url.origin !== self.location.origin) return; // let cross-origin (API/covers) pass through

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () {
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
