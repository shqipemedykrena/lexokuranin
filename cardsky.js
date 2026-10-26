/* Night sky in the dark cards (home "Ku do të shkosh?", deshmi) and in the start block (owner, 26 Oct: "sometimes I
   want to see a sudden spike of stars shining, for all the bars as well"). Each card gets its own small sky: stars that
   twinkle softly, a faint galaxy glow that drifts very slowly, and now and then a star that flares up with rays and
   fades. One animation loop for all, only for skies that are on screen; still picture when "reduce motion" is on. */
(function(){
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var skies = [];
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function Sky(el, opts){
    var c = document.createElement("canvas"); c.className = "card-sky"; c.setAttribute("aria-hidden", "true");
    el.insertBefore(c, el.firstChild); el.classList.add("has-sky");
    this.el = el; this.c = c; this.x = c.getContext("2d"); this.o = opts || {}; this.on = false; this.flares = [];
    this.next = performance.now() + rnd(600, 5000); this.seed = Math.random() * 1000;
    this.resize();
  }
  Sky.prototype.resize = function(){
    var r = this.el.getBoundingClientRect(); this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.c.width = Math.round(this.w * DPR); this.c.height = Math.round(this.h * DPR);
    var n = Math.round(this.w * this.h / (this.o.density || 1400));
    this.stars = [];
    for(var i = 0; i < n; i++){
      var b = Math.pow(Math.random(), 3);
      this.stars.push({ x: Math.random() * this.w, y: Math.random() * this.h, r: 0.35 + b * 1.25, a: 0.25 + b * 0.75,
        tw: rnd(0.4, 1.6), ph: Math.random() * 6.28, col: Math.random() < 0.15 ? "255,170,180" : (Math.random() < 0.3 ? "190,210,255" : "255,255,255") });
    }
    this.blobs = [];
    if(!this.o.noGlow) for(var k = 0; k < 2; k++) this.blobs.push({ x: Math.random(), y: Math.random(), r: rnd(0.35, 0.7), hue: k ? "90,120,255" : "255,70,95", sp: rnd(0.004, 0.01), ph: Math.random() * 6.28 });
  };
  Sky.prototype.flare = function(now){
    var s = this.stars[Math.floor(Math.random() * this.stars.length)] || { x: this.w / 2, y: this.h / 2 };
    this.flares.push({ x: s.x, y: s.y, t0: now, dur: rnd(900, 1700), size: rnd(10, 22) * (this.o.flareScale || 1), col: Math.random() < 0.3 ? "255,120,140" : "255,250,240" });
  };
  Sky.prototype.draw = function(now){
    var x = this.x, w = this.w, h = this.h, t = now / 1000;
    x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, w, h);
    // the faint galaxy glow, drifting very slowly
    for(var k = 0; k < this.blobs.length; k++){
      var b = this.blobs[k], bx = (b.x + Math.sin(t * b.sp * 6.28 + b.ph) * 0.12) * w, by = (b.y + Math.cos(t * b.sp * 5 + b.ph) * 0.15) * h, R = b.r * Math.max(w, h);
      var g = x.createRadialGradient(bx, by, 0, bx, by, R); g.addColorStop(0, "rgba(" + b.hue + ",0.13)"); g.addColorStop(1, "rgba(" + b.hue + ",0)");
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    }
    // stars, twinkling softly
    for(var i = 0; i < this.stars.length; i++){
      var s = this.stars[i], a = reduce ? s.a : s.a * (0.65 + 0.35 * Math.sin(t * s.tw + s.ph));
      x.fillStyle = "rgba(" + s.col + "," + a.toFixed(3) + ")"; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
    }
    // now and then: a star flares up with rays and fades away
    if(!reduce && now > this.next){ this.flare(now); if(Math.random() < 0.35) this.flare(now + 120); this.next = now + rnd(2200, 7000) / (this.o.flareRate || 1); }
    for(var f = this.flares.length - 1; f >= 0; f--){
      var F = this.flares[f], p = (now - F.t0) / F.dur;
      if(p < 0) continue; if(p > 1){ this.flares.splice(f, 1); continue; }
      var e = p < 0.18 ? p / 0.18 : Math.pow(1 - (p - 0.18) / 0.82, 1.6), L = F.size * (0.6 + 0.4 * e);
      var g2 = x.createRadialGradient(F.x, F.y, 0, F.x, F.y, L * 0.9); g2.addColorStop(0, "rgba(" + F.col + "," + (0.9 * e) + ")"); g2.addColorStop(1, "rgba(" + F.col + ",0)");
      x.fillStyle = g2; x.beginPath(); x.arc(F.x, F.y, L * 0.9, 0, 6.283); x.fill();
      x.save(); x.translate(F.x, F.y); x.rotate(0.35); x.globalCompositeOperation = "lighter";
      for(var r = 0; r < 6; r++){                                   // six fine rays of different length (a sparkle, not a cross)
        var len = L * (r % 2 ? 1.0 : 1.7), wd = r % 2 ? 0.7 : 1.1;
        var lg = x.createLinearGradient(0, 0, len, 0); lg.addColorStop(0, "rgba(" + F.col + "," + (0.95 * e) + ")"); lg.addColorStop(1, "rgba(" + F.col + ",0)");
        x.fillStyle = lg; x.beginPath(); x.moveTo(0, -wd); x.lineTo(len, 0); x.lineTo(0, wd); x.closePath(); x.fill(); x.rotate(Math.PI / 3);
      }
      x.restore();
      x.fillStyle = "rgba(255,255,255," + e + ")"; x.beginPath(); x.arc(F.x, F.y, 1.2 + 1.2 * e, 0, 6.283); x.fill();
    }
  };
  function init(){
    document.querySelectorAll(".journey-card").forEach(function(el){ skies.push(new Sky(el)); });
    var intake = document.querySelector(".intake");
    if(intake) skies.push(new Sky(intake, { density: 2600, noGlow: true, flareScale: 1.5, flareRate: 2.2 }));   // the start block already has its own galaxy: only extra stars and flares
    if(!skies.length) return;
    window.__skies = skies;
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function(es){ es.forEach(function(e){ e.target._sky.on = e.isIntersecting; }); }, { rootMargin: "80px" }) : null;
    skies.forEach(function(s){ s.el._sky = s; if(io) io.observe(s.el); else s.on = true; });
    var rt; window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ skies.forEach(function(s){ s.resize(); if(reduce) s.draw(performance.now()); }); }, 150); });
    if(reduce){ skies.forEach(function(s){ s.draw(performance.now()); }); return; }
    function loop(now){ if(!document.hidden) for(var i = 0; i < skies.length; i++) if(skies[i].on) skies[i].draw(now); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
