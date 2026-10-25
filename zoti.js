/* Ikre: Names of Allah grid (zoti-yt.html). Data in window.ZNAMES = [{n, m, x, ev:[["20:82","Ta-Ha 20:82"]], src}] */
(function(){
  var D = window.ZNAMES, grid = document.getElementById("znGrid"), q = document.getElementById("znFind"), cnt = document.getElementById("znCount");
  if(!D || !grid) return;
  var L = JSON.parse(grid.dataset.l);
  function norm(s){ return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'‘`\-\s]/g, ""); }
  function el(t, c, x){ var e = document.createElement(t); if(c) e.className = c; if(x != null) e.textContent = x; return e; }
  D.forEach(function(d, i){
    var b = el("button", "zn-card"); b.type = "button"; b.setAttribute("aria-expanded", "false"); b.id = "zn-" + i;
    b.appendChild(el("span", "zn-n", i + 1)); b.appendChild(el("span", "zn-name", d.n)); b.appendChild(el("span", "zn-m", d.m));
    var det = el("div", "zn-det"); det.hidden = true;
    det.appendChild(el("p", null, d.x));
    if(d.ev && d.ev.length){
      var p = el("p", "zn-ev"); p.appendChild(el("span", null, L.ev + " "));
      d.ev.forEach(function(e, k){ if(k) p.appendChild(document.createTextNode(", ")); var a = el("a", null, e[1]); a.href = "kurani.html#" + e[0]; p.appendChild(a); });
      det.appendChild(p);
    }
    var s = el("p", "zn-src"); var a2 = el("a", null, "IslamQA " + d.src); a2.href = "https://islamqa.info/en/answers/" + d.src; a2.target = "_blank"; a2.rel = "noopener";
    s.appendChild(el("span", null, L.src + " ")); s.appendChild(a2); det.appendChild(s);
    var w = el("div", "zn-item"); w.appendChild(b); w.appendChild(det); w.dataset.k = norm(d.n + " " + d.m);
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
