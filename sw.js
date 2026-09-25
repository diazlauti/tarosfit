/* Service worker: deja la app usable en el gym sin señal.
   Sube CACHE_VERSION cuando cambies el HTML/CSS/JS para invalidar la caché vieja. */
var CACHE_VERSION = "mirutina-v2";
var APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/auth.js",
  "./js/exercises.js",
  "./js/firebase-config.js",
  "./js/wizard.js",
  "./manifest.json"
];

self.addEventListener("install", function(ev){
  ev.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){ return cache.addAll(APP_SHELL); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_VERSION; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(ev){
  var url = new URL(ev.request.url);
  // no tocar Firebase / Google APIs ni nada que no sea GET: eso siempre va directo a la red
  if(ev.request.method !== "GET" || url.origin !== self.location.origin) return;

  ev.respondWith(
    caches.match(ev.request).then(function(cached){
      var network = fetch(ev.request).then(function(res){
        if(res && res.ok){
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function(cache){ cache.put(ev.request, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
