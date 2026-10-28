/* Service worker: deja la app usable en el gym sin señal.
   Sube CACHE_VERSION cuando cambies el HTML/CSS/JS para invalidar la caché vieja. */
var CACHE_VERSION = "tarofits-v32";
var APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/auth.js",
  "./js/exercises.js",
  "./js/firebase-config.js",
  "./js/wizard.js",
  "./manifest.json",
  "./img/icons/icon-180.png",
  "./img/icons/icon-192.png",
  "./img/icons/icon-512.png"
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

// avisa de que terminó el descanso aunque la app esté en segundo plano
// (ver scheduleRestNotification en js/app.js); tocar el aviso enfoca la app
self.addEventListener("notificationclick", function(ev){
  ev.notification.close();
  ev.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(list){
      for(var i=0;i<list.length;i++){
        if("focus" in list[i])return list[i].focus();
      }
      if(self.clients.openWindow)return self.clients.openWindow("./");
    })
  );
});
