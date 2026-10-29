/* Ikre: Names of Allah grid (zoti-yt.html), written by build/zoti.py.
   Data in window.ZNAMES = [{n, a (Arabic), m, x, ev:[["20:82","20:82"]], ch, pg, k (other spelling for search)}].
   Source of the names and explanations (owner, 29 Oct): the book by Dr. 'Abdur-Razzaaq al-Badr. */
(function(){
  var D = window.ZNAMES, grid = document.getElementById("znGrid"), q = document.getElementById("znFind"), cnt = document.getElementById("znCount");
  if(!D || !grid) return;
  var L = JSON.parse(grid.dataset.l);
  function norm(s){ return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'‘`\-\s]/g, ""); }
  function el(t, c, x){ var e = document.createElement(t); if(c) e.className = c; if(x != null) e.textContent = x; return e; }
  /* the book is a numbered source at the bottom of the page */
  var book = null; document.querySelectorAll(".fn-list li").forEach(function(x){ if(!book && /al-Badr/.test(x.textContent)) book = x; });
  D.forEach(function(d, i){
    var b = el("button", "zn-card"); b.type = "button"; b.setAttribute("aria-expanded", "false"); b.id = "zn-" + i;
    b.appendChild(el("span", "zn-n", i + 1));
    var nm = el("span", "zn-name", d.n);
    if(d.a){ var ar = el("span", "zn-ar", d.a); ar.lang = "ar"; ar.dir = "rtl"; nm.appendChild(ar); }
    b.appendChild(nm); b.appendChild(el("span", "zn-m", d.m));
    var det = el("div", "zn-det"); det.hidden = true;
    det.appendChild(el("p", null, d.x));
    if(d.ev && d.ev.length){
      var p = el("p", "zn-ev"); p.appendChild(el("span", null, L.ev + " "));
      d.ev.forEach(function(e, k){ if(k) p.appendChild(document.createTextNode(", ")); var a = el("a", null, e[1]); a.href = "kurani.html#" + e[0]; p.appendChild(a); });
      det.appendChild(p);
    }
    var pg = el("p", "zn-src", L.where.replace("{c}", d.ch).replace("{p}", d.pg));
    if(book){ var sp = el("sup", "fn"); var a2 = el("a", null, book.id.replace("fn-", "")); a2.href = "#" + book.id; a2.setAttribute("aria-label", L.src.replace(":", "") + " " + a2.textContent); sp.appendChild(a2); pg.appendChild(sp); }
    det.appendChild(pg);
    var w = el("div", "zn-item"); w.appendChild(b); w.appendChild(det); w.dataset.k = norm(d.n + " " + (d.k || "") + " " + d.m);
    b.addEventListener("click", function(){ var o = det.hidden; det.hidden = !o; b.setAttribute("aria-expanded", String(o)); w.classList.toggle("open", o); });
    grid.appendChild(w);
  });
  function filter(){
    var k = norm(q.value || ""), n = 0;
    grid.querySelectorAll(".zn-item").forEach(function(w){ var on = !k || w.dataset.k.indexOf(k) > -1; w.hidden = !on; if(on) n++; });
    if(cnt) cnt.textContent = L.count.replace("{n}", n);
  }
  if(q) q.addEventListener("input", filter);
  filter();
})();
