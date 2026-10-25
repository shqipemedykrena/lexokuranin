/* registers the offline cache (only on the real site; previews block it) */
(function(){
  if(!("serviceWorker" in navigator) || (location.protocol !== "https:" && location.hostname !== "localhost")) return;
  var s = document.currentScript, base = s ? s.getAttribute("src").replace("offline.js", "") : "";
  try{ navigator.serviceWorker.register(base + "sw.js", {scope: base || "./"}).catch(function(){}); }catch(e){}
})();
