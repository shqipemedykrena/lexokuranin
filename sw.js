/* Ikre offline cache (owner, 28 Oct: a new block did not show after a push). Pages: always asked fresh from the
   server when online (cache only offline). Files: shown from the cache and updated in the background, and the
   cache name V changes whenever the site's CSS or scripts change (build/swver.py), so old copies are dropped. */
var V = "ikre-aabf3b70cb";
var PRE = ["index.html", "kurani.html", "meso.html", "mrekullite.html", "hifz.html", "namazi.html", "zoti-yt.html", "site.css", "site.js", "quran-reader.js", "mk.js", "progress.js", "offline.js", "en/index.html", "en/kurani.html", "en/meso.html", "en/mrekullite.html", "en/hifz.html", "en/namazi.html", "en/zoti-yt.html", "en/progress.js", "nl/index.html", "nl/kurani.html", "nl/meso.html", "nl/mrekullite.html", "nl/hifz.html", "nl/namazi.html", "nl/zoti-yt.html", "nl/progress.js", "de/index.html", "de/kurani.html", "de/meso.html", "de/mrekullite.html", "de/hifz.html", "de/namazi.html", "de/zoti-yt.html", "de/progress.js"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(V).then(function(c){ return Promise.all(PRE.map(function(u){ return c.add(u).catch(function(){}); })); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== V; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var r = e.request; if(r.method !== "GET") return;
  var u = new URL(r.url); if(u.origin !== location.origin) return;
  var page = r.mode === "navigate" || /\.html?$/.test(u.pathname) || u.pathname.slice(-1) === "/";
  if(page){
    e.respondWith(fetch(r.url, {cache: "no-cache", credentials: "same-origin"}).then(function(res){ if(res.ok){ var cp = res.clone(); caches.open(V).then(function(c){ c.put(r, cp); }); } return res; })
      .catch(function(){ return caches.match(r, {ignoreSearch: true}).then(function(m){ return m || caches.match("index.html"); }); }));
  } else {
    e.respondWith(caches.match(r).then(function(m){
      var net = fetch(r).then(function(res){ if(res.ok){ var cp = res.clone(); caches.open(V).then(function(c){ c.put(r, cp); }); } return res; });
      if(m){ e.waitUntil(net.catch(function(){})); return m; }
      return net;
    }));
  }
});
