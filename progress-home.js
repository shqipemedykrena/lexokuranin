/* Ikre: "Your progress" summary on the home page. Reads only this browser's localStorage. */
(function(){
  var box = document.getElementById("myProgress"); if(!box) return;
  var L = JSON.parse(box.dataset.l);
  function load(k, d){ try{ var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }catch(e){ return d; } }
  var m = load("ikreMastery", {}), verses = 0;
  Object.keys(m).forEach(function(s){ Object.keys(m[s] || {}).forEach(function(a){ if(m[s][a] === "yes") verses++; }); });
  var read = Object.keys(load("ikreQuranRead", {})).length, khatm = load("ikreQuranKhatm", 0), last = load("ikreQuranLast", null);
  var known = load("ikreLetterKnown", {}), letters = Object.keys(known).filter(function(k){ return known[k]; }).length;
  var bm = load("ikreQuranBm", []).length;
  var gj = load("ikreGjumi", null), today = new Date().toISOString().slice(0, 10), night = 0;
  if(gj && gj.d === today) Object.keys(gj.v || {}).forEach(function(k){ if(gj.v[k]) night++; });
  if(!verses && !read && !khatm && !last && !letters && !bm && !night) return;
  var grid = box.querySelector(".mp-grid");
  function tile(href, big, small){ var a = document.createElement("a"); a.className = "mp-tile"; a.href = href;
    var b = document.createElement("b"); b.textContent = big; var s = document.createElement("span"); s.textContent = small; a.appendChild(b); a.appendChild(s); grid.appendChild(a); }
  if(last) tile("kurani.html#" + last.s + ":" + last.v, last.s + ":" + last.v, L.cont);
  if(verses) tile("kurani.html", verses + " / 6236", L.verses);
  if(read || khatm) tile("kurani.html", read + " / 114", L.read + (khatm ? " · " + L.khatm.replace("{n}", khatm) : ""));
  if(letters) tile("meso.html#alfabeti", letters + " / 28", L.letters);
  if(bm) tile("kurani.html", String(bm), L.bm);
  if(night) tile("gjumi.html", night + " / 5", L.night);
  box.hidden = false;
})();
