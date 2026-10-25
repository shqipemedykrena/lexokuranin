/* Ikre: interactive visuals for mrekullite.html. Labels come from data-l (JSON) on each .mk-viz, per language. */
(function(){
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, GRAIN = null;
  function el(t, c, x){ var e = document.createElement(t); if(c) e.className = c; if(x != null) e.textContent = x; return e; }
  function canvas(box, ratio, minH){
    var wrap = el("div", "mk-cv mk-film"); var c = el("canvas"); wrap.appendChild(c); box.appendChild(wrap);
    c.setAttribute("aria-hidden", "true");
    /* film look: letterbox with the miracle's title, vignette, grain; it opens like a shot when it scrolls into view */
    ["mk-vig", "mk-grain"].forEach(function(k){ wrap.appendChild(el("div", k)); });
    var bt = el("div", "mk-bar mk-bar-t"), bb = el("div", "mk-bar mk-bar-b"); wrap.appendChild(bt); wrap.appendChild(bb);
    var art = box.closest ? box.closest("article") : null, tt = art && art.querySelector(".mk-title");
    if(tt) bt.appendChild(el("span", "mk-slate", tt.textContent));
    if(!GRAIN){ var gc = document.createElement("canvas"); gc.width = gc.height = 96; var gx = gc.getContext("2d"), gd = gx.createImageData(96, 96);
      for(var gi = 0; gi < gd.data.length; gi += 4){ var gv = Math.random() * 255 | 0; gd.data[gi] = gd.data[gi + 1] = gd.data[gi + 2] = gv; gd.data[gi + 3] = 255; }
      gx.putImageData(gd, 0, 0); GRAIN = "url(" + gc.toDataURL() + ")"; }
    wrap.querySelector(".mk-grain").style.backgroundImage = GRAIN;
    visible(wrap, function(on){ if(on) wrap.classList.add("mk-in"); });
    var st = {c: c, ctx: c.getContext("2d"), w: 0, h: 0, draw: null};
    function size(){
      var w = wrap.clientWidth || 600, h = Math.round(w * ratio);
      if(h > 460) h = 460; if(h < (minH || 220)) h = minH || 220;
      var d = Math.min(window.devicePixelRatio || 1, 2);
      c.width = w * d; c.height = h * d; c.style.height = h + "px";
      st.ctx.setTransform(d, 0, 0, d, 0, 0); st.w = w; st.h = h;
      if(st.draw) st.draw();
    }
    st.size = size;
    if("ResizeObserver" in window) new ResizeObserver(size).observe(wrap); else window.addEventListener("resize", size);
    setTimeout(size, 0);
    return st;
  }
  function slider(box, label, min, max, step, val, id){
    var w = el("div", "mk-slider");
    var lab = el("label", null, label); lab.htmlFor = id;
    var r = el("input"); r.type = "range"; r.min = min; r.max = max; r.step = step; r.value = val; r.id = id;
    w.appendChild(lab); w.appendChild(r); box.appendChild(w);
    return r;
  }
  function visible(node, cb){
    if(!("IntersectionObserver" in window)){ cb(true); return; }
    new IntersectionObserver(function(es){ es.forEach(function(e){ cb(e.isIntersecting); }); }).observe(node);
  }
  function rr(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  var INK = "#241A1A", SOFT = "#6A5757", RED = "#C8102E", PAPER = "#FBF2F0";

  /* ---------- 1. chain of preservation ---------- */
  function chain(box, L){
    var steps = L.steps, i = 0, timer = null;
    var ol = el("ol", "mk-chain");
    steps.forEach(function(s, k){
      var li = el("li"); var b = el("button", "mk-node"); b.type = "button";
      b.appendChild(el("span", "mk-node-n", k + 1)); b.appendChild(el("span", "mk-node-t", s[0]));
      b.addEventListener("click", function(){ stop(); set(k); });
      li.appendChild(b); ol.appendChild(li);
    });
    box.appendChild(ol);
    var out = el("p", "mk-out"); out.setAttribute("aria-live", "polite"); box.appendChild(out);
    var ctr = el("div", "mk-ctrl"); var play = el("button", "mk-btn", "▶ " + L.play); play.type = "button"; ctr.appendChild(play); box.appendChild(ctr);
    function set(k){
      i = k;
      ol.querySelectorAll(".mk-node").forEach(function(b, j){ b.classList.toggle("on", j <= k); b.setAttribute("aria-pressed", j === k); });
      ol.style.setProperty("--mk-f", k / (steps.length - 1));
      out.innerHTML = ""; out.appendChild(el("b", null, steps[k][0] + ": ")); out.appendChild(document.createTextNode(steps[k][1]));
    }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    play.addEventListener("click", function(){
      stop(); set(0); if(RM) { set(steps.length - 1); return; }
      timer = setInterval(function(){ if(i >= steps.length - 1){ stop(); return; } set(i + 1); }, 1800);
    });
    set(0);
  }

  /* ---------- 2. the challenge ---------- */
  function challenge(box, L, base){
    var g = el("div", "mk-tiles"); g.setAttribute("aria-hidden", "true");
    for(var k = 1; k <= 114; k++){ var t = el("i"); t.dataset.n = k; g.appendChild(t); }
    var btns = el("div", "mk-stages");
    var out = el("p", "mk-out"); out.setAttribute("aria-live", "polite");
    L.stages.forEach(function(s, k){
      var b = el("button", "mk-btn"); b.type = "button";
      b.appendChild(el("b", null, s[1])); b.appendChild(el("span", null, " · " + s[0]));
      b.addEventListener("click", function(){ set(k); });
      btns.appendChild(b);
    });
    box.appendChild(btns); box.appendChild(g); box.appendChild(out);
    var TEN = [99,100,101,102,103,104,105,106,107,108];
    function set(k){
      btns.querySelectorAll(".mk-btn").forEach(function(b, j){ b.setAttribute("aria-pressed", j === k); });
      g.querySelectorAll("i").forEach(function(t){
        var n = +t.dataset.n;
        t.className = (k === 0 || (k === 1 && TEN.indexOf(n) > -1) || (k === 2 && n === 108)) ? "on" : "";
      });
      out.innerHTML = "";
      var s = L.stages[k], a = el("a", null, s[0]); a.href = base + "kurani.html#" + s[0];
      out.appendChild(el("b", null, s[1] + " ")); out.appendChild(a);
      if(k === 2){ out.appendChild(document.createTextNode(". " + L.shortest)); }
    }
    set(0);
  }

  /* ---------- 4. Romans timeline ---------- */
  function romans(box, L){
    var st = canvas(box, .3, 160), v = L.v;
    var r = slider(box, v.slider, 0, 9, .1, 0, "mkRomYear");
    var out = el("p", "mk-out"); out.setAttribute("aria-live", "polite"); box.appendChild(out);
    function txt(y){ return y < 1 ? v.s0 : y < 3 ? v.s1 : y < 7 ? v.s2 : y < 8.6 ? v.s3 : v.s4; }
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, y = +r.value, pad = 28, x0 = pad, x1 = W - pad, ax = H * .56;
      function X(t){ return x0 + (x1 - x0) * t / 9; }
      c.clearRect(0, 0, W, H);
      c.fillStyle = "#FFF9F8"; c.fillRect(0, 0, W, H);
      // bid' band
      c.fillStyle = "rgba(200,16,46,.10)"; c.fillRect(X(3), ax - 46, X(9) - X(3), 70);
      c.fillStyle = RED; c.font = "600 12px Lora, Georgia, serif"; c.textAlign = "center";
      c.fillText(v.band, (X(3) + X(9)) / 2, ax - 52);
      // axis
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, ax); c.lineTo(x1, ax); c.stroke();
      c.font = "12px Lora, Georgia, serif"; c.fillStyle = SOFT;
      for(var t = 0; t <= 9; t++){ c.beginPath(); c.moveTo(X(t), ax - 5); c.lineTo(X(t), ax + 5); c.stroke(); c.fillText(t, X(t), ax + 20); }
      c.fillText(v.year, x0 + 6, ax + 38);
      // progress
      c.strokeStyle = RED; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, ax); c.lineTo(X(y), ax); c.stroke();
      // bet marker (7) and extension (+2)
      if(y >= 7){
        c.fillStyle = "#7a4f00"; c.beginPath(); c.arc(X(7), ax - 18, 6, 0, 7); c.fill();
        c.textAlign = "center"; c.font = "600 11px Lora, Georgia, serif"; c.fillText(v.bet, Math.min(X(7), W - 90), ax - 30);
        c.setLineDash([5, 4]); c.strokeStyle = "#7a4f00"; c.lineWidth = 2; c.beginPath(); c.moveTo(X(7), ax - 18); c.lineTo(X(Math.min(9, Math.max(7, y))), ax - 18); c.stroke(); c.setLineDash([]);
        if(y >= 7.5){ c.fillStyle = "#7a4f00"; c.textAlign = "right"; c.font = "11px Lora, Georgia, serif"; c.fillText(v.add, W - 8, ax + 40); }
      }
      if(y >= 8.6){
        var nx = X(8.6);
        c.fillStyle = "#2f9e5c"; star(c, nx, ax - 18, 9);
        c.font = "600 12px Lora, Georgia, serif"; c.textAlign = "right"; c.fillText(v.news, W - 8, ax + 56);
      }
      // marker
      c.fillStyle = RED; c.beginPath(); c.arc(X(y), ax, 8, 0, 7); c.fill();
      out.textContent = txt(y);
    };
    function star(c, x, y, rad){ c.beginPath(); for(var k = 0; k < 10; k++){ var a = k * Math.PI / 5 - Math.PI / 2, q = k % 2 ? rad * .45 : rad; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fill(); }
    r.addEventListener("input", st.draw);
  }

  /* ---------- 5. splitting of the moon ---------- */
  function moon(box, L){
    var st = canvas(box, .55), v = L.v, stars = [];
    for(var k = 0; k < 140; k++) stars.push([Math.random(), Math.random() * .75, Math.random() * 1.3 + .2]);
    var r = slider(box, v.slider, 0, 1, .01, 0, "mkMoon");
    box.appendChild(el("p", "mk-note", v.note));
    function half(c, x, y, R, side){
      c.save(); c.beginPath();
      if(side < 0) c.arc(x, y, R, Math.PI / 2, Math.PI * 1.5); else c.arc(x, y, R, -Math.PI / 2, Math.PI / 2);
      c.closePath(); c.clip();
      var g = c.createRadialGradient(x - R * .3, y - R * .3, R * .1, x, y, R);
      g.addColorStop(0, "#fffdf2"); g.addColorStop(1, "#d8d2bd"); c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 2 * R);
      c.fillStyle = "rgba(150,140,120,.35)";
      [[-.35,-.2,.18],[.25,.1,.22],[-.1,.38,.12],[.4,-.35,.1],[-.45,.25,.09],[.05,-.45,.08]].forEach(function(m){ c.beginPath(); c.arc(x + m[0] * R, y + m[1] * R, m[2] * R, 0, 7); c.fill(); });
      c.restore();
    }
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, s = +r.value;
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#05070f"); g.addColorStop(1, "#1d2a4a");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff"; stars.forEach(function(p){ c.globalAlpha = .5 + p[2] / 3; c.fillRect(p[0] * W, p[1] * H, p[2], p[2]); }); c.globalAlpha = 1;
      var R = Math.min(W, H) * .17, cx = W / 2, cy = H * .36, d = s * Math.min(W * .26, R * 2.6);
      // glow
      var gl = c.createRadialGradient(cx, cy, R * .8, cx, cy, R * 2.4); gl.addColorStop(0, "rgba(255,250,220,.22)"); gl.addColorStop(1, "rgba(255,250,220,0)");
      c.fillStyle = gl; c.fillRect(0, 0, W, H);
      // left half goes behind the mountain (drawn first)
      half(c, cx - d, cy + s * H * .22, R, -1);
      // mountain Hira
      var base = H * .92;
      c.fillStyle = "#120d0c"; c.beginPath(); c.moveTo(0, H); c.lineTo(0, base);
      c.lineTo(W * .2, H * .8); c.lineTo(W * .38, H * .62); c.lineTo(W * .47, H * .5); c.lineTo(W * .53, H * .53); c.lineTo(W * .62, H * .66); c.lineTo(W * .8, H * .78); c.lineTo(W, H * .86); c.lineTo(W, H); c.closePath(); c.fill();
      // right half in front
      half(c, cx + d, cy, R, 1);
      c.fillStyle = "rgba(251,242,240,.85)"; c.font = "600 13px Lora, Georgia, serif"; c.textAlign = "center";
      c.fillText(v.hira, W * .5, H * .7);
    };
    r.addEventListener("input", st.draw);
  }

  /* ---------- 6. embryo stages ---------- */
  function embryo(box, L){
    var S = L.stages, i = 0;
    var row = el("div", "mk-stages mk-stages-6");
    S.forEach(function(s, k){ var b = el("button", "mk-btn"); b.type = "button"; b.appendChild(el("span", "mk-node-n", k + 1)); b.appendChild(document.createTextNode(" " + s[0])); b.addEventListener("click", function(){ set(k); }); row.appendChild(b); });
    box.appendChild(row);
    var st = canvas(box, .42);
    var out = el("p", "mk-out"); out.setAttribute("aria-live", "polite"); box.appendChild(out);
    var nav = el("div", "mk-ctrl"); var pb = el("button", "mk-btn", "← " + L.prev), nb = el("button", "mk-btn", L.next + " →");
    pb.type = nb.type = "button"; nav.appendChild(pb); nav.appendChild(nb); box.appendChild(nav);
    pb.addEventListener("click", function(){ set(Math.max(0, i - 1)); }); nb.addEventListener("click", function(){ set(Math.min(S.length - 1, i + 1)); });
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, cx = W / 2, cy = H / 2, u = Math.min(W, H) / 10;
      c.fillStyle = "#FFF9F8"; c.fillRect(0, 0, W, H);
      // womb: a soft safe lodging
      c.fillStyle = "rgba(200,16,46,.07)"; c.beginPath(); c.ellipse(cx, cy, u * 4.4, u * 3.6, 0, 0, 7); c.fill();
      c.strokeStyle = "rgba(200,16,46,.25)"; c.lineWidth = 2; c.stroke();
      c.lineCap = "round"; c.lineJoin = "round";
      if(i === 0){ // drops
        c.fillStyle = "#e9c46a"; [[0,0,.55],[-.9,.4,.35],[.8,-.5,.3],[.6,.7,.25]].forEach(function(p){ c.beginPath(); c.arc(cx + p[0] * u, cy + p[1] * u, p[2] * u, 0, 7); c.fill(); });
      } else if(i === 1){ // clot
        c.fillStyle = "#9b1b30"; c.beginPath(); c.moveTo(cx - u * 1.2, cy - u * .3);
        c.bezierCurveTo(cx - u * .6, cy - u * 1.4, cx + u * 1.4, cy - u * 1, cx + u * 1.3, cy + u * .2);
        c.bezierCurveTo(cx + u * 1.2, cy + u * 1.1, cx - u * .4, cy + u * 1.2, cx - u * 1.2, cy - u * .3); c.fill();
      } else if(i === 2){ // lump of flesh
        c.fillStyle = "#c97b6b"; c.beginPath(); c.ellipse(cx, cy, u * 1.7, u * 1.25, .2, 0, 7); c.fill();
        c.strokeStyle = "rgba(90,30,20,.45)"; c.lineWidth = 2; for(var k = -2; k <= 2; k++){ c.beginPath(); c.arc(cx + k * u * .55, cy - u * .2, u * .35, .3, 2.6); c.stroke(); }
      } else { // bones, flesh, another creation: a simple curled figure
        var t = i;
        if(t >= 4){ c.fillStyle = t === 5 ? "#e7a98f" : "#d99a86"; c.beginPath(); c.ellipse(cx - u * .2, cy + u * .25, u * 2.2, u * 1.6, -.25, 0, 7); c.fill(); c.beginPath(); c.arc(cx + u * 1.4, cy - u * 1.1, u * 1.05, 0, 7); c.fill(); }
        c.strokeStyle = t >= 4 ? "rgba(255,255,255,.75)" : "#8a7b70"; c.lineWidth = Math.max(2, u * .22);
        c.beginPath(); c.arc(cx, cy + u * .1, u * 1.6, -1.1, 2.4); c.stroke(); // spine
        c.beginPath(); c.arc(cx + u * 1.4, cy - u * 1.1, u * .8, 0, 7); c.stroke(); // skull
        c.beginPath(); c.moveTo(cx - u * .4, cy + u * 1.4); c.lineTo(cx + u * .9, cy + u * 1.1); c.stroke();
        c.beginPath(); c.moveTo(cx + u * .4, cy - u * .2); c.lineTo(cx + u * 1.2, cy + u * .4); c.stroke();
        if(t === 5){ c.fillStyle = "rgba(255,214,102,.5)"; c.beginPath(); c.arc(cx + u * 1.4, cy - u * 1.1, u * .25, 0, 7); c.fill(); }
      }
    };
    function set(k){
      i = k; row.querySelectorAll(".mk-btn").forEach(function(b, j){ b.setAttribute("aria-pressed", j === k); });
      out.innerHTML = ""; out.appendChild(el("b", null, S[k][0] + ": ")); out.appendChild(document.createTextNode(S[k][1]));
      pb.disabled = k === 0; nb.disabled = k === S.length - 1; st.draw && st.draw();
    }
    set(0);
  }

  /* ---------- 7. two waters ---------- */
  function seas(box, L){
    var v = L.v, mode = 1, run = false, raf = 0;
    var row = el("div", "mk-stages");
    [v.a, v.b].forEach(function(t, k){ var b = el("button", "mk-btn", t); b.type = "button"; b.addEventListener("click", function(){ mode = k; set(); }); row.appendChild(b); });
    box.appendChild(row);
    var st = canvas(box, .45), P = [];
    for(var k = 0; k < 160; k++) P.push({x: Math.random(), y: Math.random(), s: k % 2, vx: 0, vy: 0});
    function set(){ row.querySelectorAll(".mk-btn").forEach(function(b, j){ b.setAttribute("aria-pressed", j === mode); }); st.draw && st.draw(); }
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, bx = W * .5;
      c.fillStyle = "#7fc4e8"; c.fillRect(0, 0, bx, H);   // sweet
      c.fillStyle = "#1f5f8b"; c.fillRect(bx, 0, W - bx, H); // salty
      if(mode === 0){
        c.fillStyle = "#c9a96e"; c.fillRect(bx - W * .09, 0, W * .18, H);
        c.fillStyle = "#6b5a3a"; c.font = "600 13px Lora, Georgia, serif"; c.textAlign = "center"; c.fillText(v.land, bx, H / 2);
      } else {
        var g = c.createLinearGradient(bx - 30, 0, bx + 30, 0); g.addColorStop(0, "rgba(127,196,232,0)"); g.addColorStop(.5, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(31,95,139,0)");
        c.fillStyle = g; c.fillRect(bx - 30, 0, 60, H);
        c.setLineDash([6, 6]); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, 0); c.lineTo(bx, H); c.stroke(); c.setLineDash([]);
        c.fillStyle = "#fff"; c.font = "600 12px Lora, Georgia, serif"; c.textAlign = "center"; c.fillText(v.barrier, bx, 18);
      }
      // particles
      P.forEach(function(p){
        var lo = p.s ? .5 : 0, hi = p.s ? 1 : .5;
        if(mode === 0){ lo = p.s ? .59 : 0; hi = p.s ? 1 : .41; }
        p.x = Math.min(hi - .01, Math.max(lo + .01, p.x));
        c.fillStyle = p.s ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.85)";
        c.beginPath(); c.arc(p.x * W, p.y * H, p.s ? 1.6 : 2.2, 0, 7); c.fill();
      });
      c.fillStyle = "#0c2d45"; c.font = "600 14px Lora, Georgia, serif"; c.textAlign = "left"; c.fillText(v.sweet, 12, H - 14);
      c.fillStyle = "#fff"; c.textAlign = "right"; c.fillText(v.salt, W - 12, H - 14);
    };
    function step(){
      P.forEach(function(p){
        p.vx += (Math.random() - .5) * .0006; p.vy += (Math.random() - .5) * .0006; p.vx *= .96; p.vy *= .96;
        p.x += p.vx; p.y += p.vy; if(p.y < 0) p.y += 1; if(p.y > 1) p.y -= 1;
        var lo = p.s ? (mode ? .5 : .59) : 0, hi = p.s ? 1 : (mode ? .5 : .41);
        if(p.x < lo + .01){ p.x = lo + .01; p.vx = Math.abs(p.vx); } if(p.x > hi - .01){ p.x = hi - .01; p.vx = -Math.abs(p.vx); }
      });
      st.draw(); if(run) raf = requestAnimationFrame(step);
    }
    if(!RM) visible(st.c, function(on){ if(on && !run){ run = true; step(); } else if(!on){ run = false; cancelAnimationFrame(raf); } });
    set();
  }

  /* ---------- 8. deep sea ---------- */
  function deepsea(box, L){
    var v = L.v, st = canvas(box, .62, 340);
    var r = slider(box, v.slider, 0, 400, 5, 0, "mkDepth");
    var out = el("p", "mk-out"); out.setAttribute("aria-live", "polite"); box.appendChild(out);
    box.appendChild(el("p", "mk-note", v.order));
    var COL = ["#e63946", "#f4a261", "#f6d743", "#2a9d8f", "#3a6fd8"], GONE = [25, 60, 100, 150, 200]; // simplified order only
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, d = +r.value;
      var MAXD = 400; function Y(m){ return 30 + (H - 40) * (m / MAXD); }
      // water column with darkening
      for(var y = 30; y < H; y += 2){
        var m = MAXD * (y - 30) / (H - 40), k = Math.min(1, m / 200);
        var l = Math.round(70 * (1 - k) + 2);
        c.fillStyle = "hsl(205, 70%, " + l + "%)"; c.fillRect(0, y, W, 2);
      }
      // sky and surface waves
      c.fillStyle = "#cfe8f7"; c.fillRect(0, 0, W, 30);
      c.strokeStyle = "#ffffff"; c.lineWidth = 2; c.beginPath();
      for(var x = 0; x <= W; x += 6) c.lineTo(x, 30 + Math.sin(x / 18) * 3); c.stroke();
      // internal waves (waves inside the sea)
      var iy = Y(120);
      c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 2; c.beginPath();
      for(x = 0; x <= W; x += 6) c.lineTo(x, iy + Math.sin(x / 40) * 8); c.stroke();
      c.fillStyle = "rgba(255,255,255,.75)"; c.font = "12px Lora, Georgia, serif"; c.textAlign = "right"; c.fillText(v.inner, W - 10, iy + 24);
      // light rays: colours fade in order
      var left = W * .08, bw = W * .05;
      COL.forEach(function(col, k){
        var gy = Y(GONE[k]), g = c.createLinearGradient(0, 30, 0, gy);
        g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g; c.fillRect(left + k * (bw + 4), 30, bw, gy - 30);
      });
      // markers
      function mark(m, txt){ var yy = Y(m); c.setLineDash([4, 4]); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); c.setLineDash([]);
        c.fillStyle = "#fff"; c.font = "600 12px Lora, Georgia, serif"; c.textAlign = "right"; c.fillText(txt, W - 10, yy + 15); }
      mark(20, v.diver); mark(200, v.dark);
      // the viewer
      var yy = Y(d);
      c.fillStyle = "#ffd166"; c.beginPath(); c.arc(W * .55, yy, 7, 0, 7); c.fill();
      c.strokeStyle = "#ffd166"; c.lineWidth = 2; c.beginPath(); c.moveTo(W * .55, 30); c.lineTo(W * .55, yy - 7); c.stroke();
      c.fillStyle = "#fff"; c.textAlign = "left"; c.font = "600 13px Lora, Georgia, serif"; c.fillText(d + " m", W * .55 + 12, yy + 4);
      var left2 = []; COL.forEach(function(_, k){ if(d < GONE[k]) left2.push(v.names[k]); });
      out.textContent = v.depth + ": " + d + " m · " + v.colors + " " + (left2.length ? left2.join(", ") : v.none);
    };
    r.addEventListener("input", st.draw);
  }

  /* ---------- 9. mountains as pegs ---------- */
  function mountain(box, L){
    var v = L.v, st = canvas(box, .62);
    var r = slider(box, v.slider, 0, 1, .01, 0, "mkRoot");
    box.appendChild(el("p", "mk-note", v.note));
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, s = +r.value, gy = H * .34;
      c.fillStyle = "#e8f1f8"; c.fillRect(0, 0, W, gy);
      // ground (soil gets see-through with the slider)
      c.fillStyle = "#7a5c3e"; c.fillRect(0, gy, W, H - gy);
      // mountain above
      var mx = W * .6, mw = W * .26;
      c.fillStyle = "#5b6b5b"; c.beginPath(); c.moveTo(mx - mw, gy); c.lineTo(mx - mw * .25, gy - H * .26); c.lineTo(mx, gy - H * .3); c.lineTo(mx + mw * .3, gy - H * .22); c.lineTo(mx + mw, gy); c.closePath(); c.fill();
      c.fillStyle = "#f4f6f8"; c.beginPath(); c.moveTo(mx - mw * .12, gy - H * .28); c.lineTo(mx, gy - H * .3); c.lineTo(mx + mw * .12, gy - H * .27); c.lineTo(mx, gy - H * .25); c.closePath(); c.fill();
      // root below, revealed by slider
      c.save(); c.globalAlpha = s;
      c.fillStyle = "#4a5a4a"; c.beginPath(); c.moveTo(mx - mw, gy); c.quadraticCurveTo(mx - mw * .5, gy + H * .3, mx, H - 10); c.quadraticCurveTo(mx + mw * .5, gy + H * .3, mx + mw, gy); c.closePath(); c.fill();
      c.fillStyle = "#fff"; c.font = "600 13px Lora, Georgia, serif"; c.textAlign = "center"; c.fillText(v.root, mx, gy + (H - gy) * .55);
      c.restore();
      // soil overlay
      c.fillStyle = "rgba(122,92,62," + (0.92 - s * .92) + ")"; c.fillRect(0, gy + 1, W, H - gy);
      // surface line
      c.strokeStyle = "#3d2b1a"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, gy); c.lineTo(W, gy); c.stroke();
      c.fillStyle = INK; c.font = "12px Lora, Georgia, serif"; c.textAlign = "left"; c.fillText(v.ground, 10, gy - 6);
      // tent peg comparison
      var px = W * .24, top = gy - H * .07, bot = gy + H * .2;
      c.strokeStyle = "#cfcfcf"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(px, top); c.lineTo(px, gy); c.stroke();
      c.save(); c.globalAlpha = .25 + s * .75; c.beginPath(); c.moveTo(px, gy); c.lineTo(px, bot); c.stroke(); c.restore();
      c.fillStyle = INK; c.textAlign = "center"; c.font = "600 12px Lora, Georgia, serif"; c.fillText(v.peg, px, top - 10);
      c.fillText(v.mount, mx, gy - H * .3 - 10);
    };
    r.addEventListener("input", st.draw);
  }


  /* ---------- prophecies on a Hijri timeline ---------- */
  function hijri(box, L){
    var st = canvas(box, .28, 150), v = L.v;
    var r = slider(box, v.slider, 0, 700, 1, 0, "mkHijri");
    var out = el("p", "mk-out"); out.setAttribute("aria-live", "polite"); box.appendChild(out);
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, y = +r.value, x0 = 24, x1 = W - 24, ax = H * .55;
      function X(t){ return x0 + (x1 - x0) * t / 700; }
      c.fillStyle = "#FFF9F8"; c.fillRect(0, 0, W, H);
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, ax); c.lineTo(x1, ax); c.stroke();
      c.font = "11px Lora, Georgia, serif"; c.fillStyle = SOFT; c.textAlign = "center";
      for(var t = 0; t <= 700; t += 100){ c.beginPath(); c.moveTo(X(t), ax - 4); c.lineTo(X(t), ax + 4); c.stroke(); c.fillText(t, X(t), ax + 18); }
      c.textAlign = "left"; c.fillText(v.year + " (" + v.unit + ")", x0, ax + 34);
      c.strokeStyle = RED; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, ax); c.lineTo(X(y), ax); c.stroke();
      function ev(t, txt, up){ var on = y >= t; c.fillStyle = on ? "#2f9e5c" : "rgba(36,26,26,.25)"; c.beginPath(); c.arc(X(t), ax, 7, 0, 7); c.fill();
        c.font = "600 11px Lora, Georgia, serif"; c.textAlign = t > 500 ? "right" : "left"; c.fillStyle = on ? "#1f6b3a" : SOFT; c.fillText(txt, X(t) + (t > 500 ? 8 : -8), up ? ax - 16 : ax - 36); }
      ev(110, v.e1, false); ev(654, v.e2, true);
      c.fillStyle = RED; c.beginPath(); c.arc(X(y), ax, 6, 0, 7); c.fill();
      out.textContent = y < 110 ? v.s0 : y < 654 ? v.s1 : v.s2;
    };
    r.addEventListener("input", st.draw);
  }

  /* ---------- food that increased ---------- */
  function food(box, L){
    var st = canvas(box, .42, 250), v = L.v;
    var r = slider(box, v.slider, 0, 1000, 10, 0, "mkFood");
    var out = el("p", "mk-out"); out.setAttribute("aria-live", "polite"); box.appendChild(out);
    box.appendChild(el("p", "mk-note", v.note));
    st.draw = function(){
      var c = st.ctx, W = st.w, H = st.h, n = +r.value;
      c.fillStyle = "#FFF9F8"; c.fillRect(0, 0, W, H);
      // pot (always full)
      var px = W * .16, py = H * .62, pr = Math.min(W * .12, H * .3);
      c.fillStyle = "#3b2f2a"; c.beginPath(); c.ellipse(px, py, pr, pr * .75, 0, 0, Math.PI); c.fill();
      c.fillRect(px - pr, py - pr * .25, pr * 2, pr * .25);
      c.fillStyle = "#c98b4a"; c.beginPath(); c.ellipse(px, py - pr * .25, pr * .95, pr * .22, 0, 0, 7); c.fill();
      c.strokeStyle = "rgba(106,87,87,.5)"; c.lineWidth = 2;
      for(var k = -1; k <= 1; k++){ c.beginPath(); c.moveTo(px + k * pr * .4, py - pr * .5); c.bezierCurveTo(px + k * pr * .4 - 8, py - pr * .8, px + k * pr * .4 + 8, py - pr, px + k * pr * .4, py - pr * 1.3); c.stroke(); }
      c.fillStyle = INK; c.font = (W < 500 ? "600 10px" : "600 12px") + " Lora, Georgia, serif"; c.textAlign = "center"; c.fillText(v.pot, px, py + pr * .95 + 6);
      // 1000 men as dots
      var gx = W * .34, gw = W - gx - 14, cols = 50, rows = 20, cw = gw / cols, ch = (H - 28) / rows;
      for(var i = 0; i < 1000; i++){
        var cx = gx + (i % cols) * cw + cw / 2, cy = 14 + Math.floor(i / cols) * ch + ch / 2;
        c.fillStyle = i < n ? "#2f9e5c" : "rgba(36,26,26,.12)";
        c.beginPath(); c.arc(cx, cy, Math.max(1.2, Math.min(cw, ch) * .32), 0, 7); c.fill();
      }
      out.textContent = n + " " + v.men + " · " + v.pot;
    };
    r.addEventListener("input", st.draw);
  }

  /* ---------- numbers in the Quran: honest counts ---------- */
  function numbers(box, L){
    var grid = el("div", "nm-grid"), det = el("div", "nm-det"); det.hidden = true; det.setAttribute("aria-live", "polite");
    var VC = {ok: "nm-ok", method: "nm-meth", no: "nm-no"};
    function total(side){ return side ? side.reduce(function(n, s){ return n + s.refs.length; }, 0) : 0; }
    function uniq(refs){ var c = {}, o = []; refs.forEach(function(r){ if(!c[r]){ c[r] = 0; o.push(r); } c[r]++; }); return o.map(function(r){ return [r, c[r]]; }); }
    function bar(label, n, max, cls){
      var w = el("div", "nm-bar " + (cls || "")); var lab = el("span", "nm-bl", label); var tr = el("span", "nm-bt"); var f = el("i"); f.style.width = (max ? n / max * 100 : 0) + "%"; tr.appendChild(f);
      var v = el("b", null, n + " " + L.times); w.appendChild(lab); w.appendChild(tr); w.appendChild(v); return w;
    }
    function chips(side){
      var wrap = el("div", "nm-vs");
      side.forEach(function(sd){
        var h = el("p", "nm-vh", sd.label + " · " + sd.refs.length + " " + L.times); wrap.appendChild(h);
        var ul = el("div", "nm-chips");
        uniq(sd.refs).forEach(function(x){ var a = el("a", null, x[0] + (x[1] > 1 ? " ×" + x[1] : "")); a.href = "kurani.html#" + x[0]; ul.appendChild(a); });
        wrap.appendChild(ul);
      });
      return wrap;
    }
    function show(c, btn){
      grid.querySelectorAll(".nm-card").forEach(function(b){ b.setAttribute("aria-expanded", String(b === btn)); });
      det.innerHTML = ""; det.hidden = false;
      var head = el("div", "nm-dh"); head.appendChild(el("h4", null, c.t)); var badge = el("span", "nm-badge " + VC[c.v], L[c.v]); head.appendChild(badge);
      var x = el("button", "mk-btn", L.close); x.type = "button"; x.addEventListener("click", function(){ det.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.focus(); }); head.appendChild(x);
      det.appendChild(head);
      var p1 = el("p", "nm-claim"); p1.appendChild(el("b", null, L.claim + " ")); p1.appendChild(document.createTextNode(c.claim)); det.appendChild(p1);
      if(c.fixed){
        var bs = el("div", "nm-bism"); bs.setAttribute("lang", "ar"); bs.dir = "rtl";
        "بسم الله الرحمن الرحيم".replace(/ /g, "").split("").forEach(function(ch, i){ var s = el("span", null, ch); s.title = String(i + 1); bs.appendChild(s); });
        det.appendChild(bs);
      } else {
        det.appendChild(el("p", "nm-lab", L.counted));
        var ta = total(c.a), tb = total(c.b), mx = Math.max(ta, tb, 1);
        if(c.alt) c.alt.forEach(function(s){ mx = Math.max(mx, s.refs.length); });
        if(c.a) det.appendChild(bar(c.a[0].label, ta, mx, "nm-a"));
        if(c.b) det.appendChild(bar(c.b[0].label, tb, mx, "nm-b"));
        if(c.alt) c.alt.forEach(function(s){ det.appendChild(bar(s.label + " (" + L.all + ")", s.refs.length, mx, "nm-alt")); });
      }
      det.appendChild(el("p", "nm-note", c.note));
      if(c.ref){ var r = el("p", "nm-ref"); var a = el("a", null, c.ref + " →"); a.href = "kurani.html#" + c.ref; r.appendChild(a); det.appendChild(r); }
      var sides = (c.a || []).concat(c.b || []);
      if(sides.length){
        var d = el("details", "nm-more"); d.appendChild(el("summary", null, L.open)); d.appendChild(chips(sides)); det.appendChild(d);
      }
      det.scrollIntoView({block: "nearest"});
    }
    L.claims.forEach(function(c){
      var b = el("button", "nm-card"); b.type = "button"; b.setAttribute("aria-expanded", "false");
      b.appendChild(el("span", "nm-badge " + VC[c.v], L[c.v]));
      b.appendChild(el("span", "nm-t", c.t));
      var big = c.fixed ? String(c.fixed) : (c.b ? total(c.a) + " · " + total(c.b) : String(total(c.a)));
      b.appendChild(el("span", "nm-n", big));
      b.addEventListener("click", function(){ show(c, b); });
      grid.appendChild(b);
    });
    box.appendChild(grid); box.appendChild(det);
  }

  /* ---------- word counter (data: mk-words.js from the Quranic Arabic Corpus) ---------- */
  function wordcount(box, L){
    var BASE = (function(){ var sc = document.querySelector('script[src*="mk.js"]'); return sc ? sc.getAttribute("src").replace("mk.js", "") : ""; })();
    var MK = /[ً-ٰٟۖ-ۭـ]/g;
    function norm(t){ return t.replace(MK, "").replace(/[ٱآأإ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\s+/g, ""); }
    var PRE = ["", "و", "ف", "ب", "ل", "ك", "ال", "وال", "فال", "بال", "كال", "لل", "ولل", "فلل", "وب", "فب", "ول", "فل", "وك", "س", "وس", "فس", "ا"];
    var D = null, LN = null, FI = null, ROOTS = null, start = [];
    var form = el("form", "wc-form"); form.setAttribute("role", "search");
    var inp = el("input", "wc-in"); inp.type = "search"; inp.id = "wcIn"; inp.lang = "ar"; inp.dir = "rtl"; inp.placeholder = L.ph; inp.setAttribute("aria-label", L.ph); inp.autocomplete = "off";
    var kbB = el("button", "mk-btn wc-kbb", "⌨ " + L.kb); kbB.type = "button"; kbB.setAttribute("aria-expanded", "false");
    form.appendChild(inp); form.appendChild(kbB);
    var kb = el("div", "wc-kb"); kb.hidden = true; kb.dir = "rtl"; kb.lang = "ar";
    "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ة ى ء".split(" ").forEach(function(ch){ var b = el("button", "wc-key", ch); b.type = "button"; b.dataset.k = ch; kb.appendChild(b); });
    var bs = el("button", "wc-key wc-del", "⌫"); bs.type = "button"; bs.dataset.k = "del"; bs.setAttribute("aria-label", L.dl); kb.appendChild(bs);
    /* the word dashboard: big tiles grouped by theme, with a pictogram where one is allowed (never for Allah,
       prophets, angels or the unseen), the meaning, and the number of times it appears. Allah is a gold tile. */
    var ICON = {
      sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
      moon: '<path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.6A7 7 0 0 1 15.5 3.5z"/>',
      star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
      sky: '<path d="M6.5 17.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3A4.5 4.5 0 0 1 17.5 17.5z"/>',
      earth: '<circle cx="12" cy="12" r="8.5"/><path d="M4 10c3 1 4-1 6 0s1 4 3 4 2 3 1 5M14 4c-1 2 1 3 3 3s2 2 3.3 2"/>',
      sea: '<path d="M2.5 9c2.5-2 4.5 2 7 0s4.5 2 7 0 3 1 5 0M2.5 14c2.5-2 4.5 2 7 0s4.5 2 7 0 3 1 5 0M2.5 19c2.5-2 4.5 2 7 0s4.5 2 7 0 3 1 5 0"/>',
      mountain: '<path d="M2.5 19.5l6-10 3.5 5.5 2.5-3.5 7 8z"/><path d="M7.2 11.6l1.3 1 1.4-1"/>',
      water: '<path d="M12 3.5c3.5 4.5 6 7.6 6 10.6a6 6 0 0 1-12 0c0-3 2.5-6.1 6-10.6z"/>',
      rain: '<path d="M6.5 13.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6-1.3 4.5 4.5 0 0 1 .8 9.3z"/><path d="M8 16.5l-1 3M12 16.5l-1 3M16 16.5l-1 3"/>',
      wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 11.5h7"/>',
      light: '<path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2M19 12h2M17 7l1.4-1.4"/><path d="M8.5 15a4.5 4.5 0 1 1 7 0c-.8.8-1.5 1.8-1.5 3h-4c0-1.2-.7-2.2-1.5-3zM10 20.5h4"/>',
      iron: '<path d="M4 15l6-6 3 3-6 6zM12.5 7.5l2-2 4 4-2 2M15 13l5 5"/>',
      gold: '<path d="M3 18h7l1-4H4zM13 18h7l-1-4h-7zM8 13h7l-1-4H9z"/>',
      pearl: '<circle cx="12" cy="13" r="4"/><path d="M3.5 13c0-4 3.5-8 8.5-8s8.5 4 8.5 8c0 2-1 3.5-3 4.5M10.5 11.5a1.5 1.5 0 0 1 1.5-1"/>',
      tree: '<path d="M12 21v-6M12 15c-4 0-7-2-7-5.5S8 4 12 3c4 1 7 3 7 6.5S16 15 12 15z"/>',
      palm: '<path d="M12 21c0-4 .5-8 0-12M12 9c-2-3-6-3.5-8-2 3 0 5 1 8 2zM12 9c2-3 6-3.5 8-2-3 0-5 1-8 2zM12 9c-1-3-.5-5.5 1-6.5M12 9c-3-1-6 1-7 4M12 9c3-1 6 1 7 4"/>',
      fig: '<path d="M12 5c4 0 6 4 6 8a6 6 0 0 1-12 0c0-4 2-8 6-8zM12 5V3M12 3c1.5 0 2.5-.5 3-1.5"/>',
      fruit: '<circle cx="9" cy="14" r="4"/><circle cx="15.5" cy="13.5" r="4"/><path d="M12 7c0-2 1-3.5 3-4"/>',
      bee: '<ellipse cx="12" cy="14" rx="4" ry="5.5"/><path d="M8.3 12.5h7.4M8.3 15.5h7.4M12 8.5V7M9 7.5C6 4 3 5 4 8s4 2 5 1M15 7.5c3-3.5 6-2.5 5 .5s-4 2-5 1"/>',
      honey: '<path d="M7 9h10v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3zM6 9h12M9 5h6l1 4H8z"/>',
      ant: '<circle cx="12" cy="6" r="2"/><circle cx="12" cy="11" r="2"/><ellipse cx="12" cy="17" rx="2.5" ry="3.2"/><path d="M10 10L6 8M14 10l4-2M10 12l-4 2M14 12l4 2M10 15l-4 3M14 15l4 3M11 4.5L9.5 2.5M13 4.5l1.5-2"/>',
      spider: '<circle cx="12" cy="13" r="3.5"/><circle cx="12" cy="8.3" r="1.8"/><path d="M8.7 11.5L4 8 3 4M15.3 11.5L20 8l1-4M8.6 13.5H3M15.4 13.5H21M9 15.5l-4 4.5M15 15.5l4 4.5"/>',
      cow: '<path d="M6 8c-2 0-3.5-1-3.5-2.5M18 8c2 0 3.5-1 3.5-2.5M6 8h12v6a6 6 0 0 1-12 0z"/><ellipse cx="12" cy="16.5" rx="3.5" ry="2.3"/><circle cx="9" cy="11" r=".6"/><circle cx="15" cy="11" r=".6"/>',
      elephant: '<path d="M5 17v-5a6 6 0 0 1 12 0v1.5c0 2 1 3 2.5 3.5M9 17v-3M13 17v-3M17 13.5c2 0 3-1.5 3-3.5"/><circle cx="14" cy="10" r=".6"/>',
      milk: '<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z"/><path d="M7 12h10"/>',
      heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
      eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
      hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v7M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7c-3 0-4.5-2-6-5l-1.5-3a1.5 1.5 0 0 1 2.6-1.4L8 14"/>',
      house: '<path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
      sunrise: '<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 4v4M5 8.5l2 2M19 8.5l-2 2"/>',
      night: '<path d="M14.5 4.5a7.5 7.5 0 1 0 5 12 6 6 0 0 1-5-12z"/><path d="M18 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L16 5.5l1.4-.6zM20.5 10l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4z"/>',
      day: '<circle cx="12" cy="12" r="5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/>',
      month: '<path d="M15 3.5a8.5 8.5 0 1 0 0 17 9 9 0 0 1 0-17z"/>',
      year: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2"/>',
      scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
      book: '<path d="M12 6c-2.5-1.8-5.5-2-8.5-1.5v13c3-.5 6-.3 8.5 1.5 2.5-1.8 5.5-2 8.5-1.5v-13C17.5 4 14.5 4.2 12 6zM12 6v13"/>',
      pen: '<path d="M16.5 3.5l4 4L9 19H5v-4zM14 6l4 4"/>',
      quran: '<path d="M12 7c-2.5-1.8-5.5-2-8.5-1.5v13c3-.5 6-.3 8.5 1.5 2.5-1.8 5.5-2 8.5-1.5v-13C17.5 5 14.5 5.2 12 7zM12 7v13"/><path d="M5 21.5l7-3 7 3"/>',
      path: '<path d="M9 21l2-18M15 21l-2-18M11.6 8h.8M11.3 13h1.4M10.9 18h2.2"/>',
      kaaba: '<path d="M5 8l7-3 7 3v10l-7 3-7-3z"/><path d="M5 8l7 3 7-3M12 11v10M5 11.5l7 3 7-3"/>',
      mosque: '<path d="M4 20V12a8 4 0 0 1 16 0v8zM8 9.2a4 4 0 0 1 8 0M12 3v3M3 20h18M10 20v-4a2 2 0 0 1 4 0v4"/>'
    };
    var dash = el("div", "wc-dash"), tiles = [];
    function tile(x, big){
      var b = el("button", "wc-chip wc-tile" + (big ? " wc-allah" : "") + (x[2] ? "" : " wc-noicon")); b.type = "button"; b.dataset.lem = x[0];
      if(x[2]){ var ic = document.createElementNS("http://www.w3.org/2000/svg", "svg"); ic.setAttribute("viewBox", "0 0 24 24"); ic.setAttribute("aria-hidden", "true"); ic.setAttribute("class", "wc-ic"); ic.innerHTML = ICON[x[2]] || ""; b.appendChild(ic); }
      var ar = el("span", "wc-ar", x[0]); ar.lang = "ar"; ar.dir = "rtl"; b.appendChild(ar);
      b.appendChild(el("span", "wc-mean", x[3]));
      var n = el("span", "wc-n", "·"); b.appendChild(n);
      if(big && L.allahNote) b.appendChild(el("span", "wc-note", L.allahNote));
      tiles.push([x[0], n]); return b;
    }
    var pw = el("div", "wc-pop");
    (L.dash || []).filter(function(x){ return x[1] === "allah"; }).forEach(function(x){ pw.appendChild(tile(x, true)); });
    var gorder = []; (L.dash || []).forEach(function(x){ if(x[1] !== "allah" && gorder.indexOf(x[1]) < 0) gorder.push(x[1]); });
    gorder.forEach(function(g){
      var sec = el("section", "wc-grp"); sec.appendChild(el("h4", "wc-grpt", (L.groups || {})[g] || g));
      var grid = el("div", "wc-grid"); (L.dash || []).filter(function(x){ return x[1] === g; }).forEach(function(x){ grid.appendChild(tile(x)); });
      sec.appendChild(grid); pw.appendChild(sec);
    });
    var pop = pw;
    // typing is optional: the search field opens only when asked for
    var sBtn = el("button", "mk-btn wc-sbtn", L.search || "…"); sBtn.type = "button"; sBtn.setAttribute("aria-expanded", "false");
    var sBox = el("div", "wc-sbox"); sBox.hidden = true; sBox.appendChild(form); sBox.appendChild(kb);
    sBtn.addEventListener("click", function(){ sBox.hidden = !sBox.hidden; sBtn.setAttribute("aria-expanded", String(!sBox.hidden)); sBtn.textContent = sBox.hidden ? L.search : L.searchHide; if(!sBox.hidden) inp.focus(); });
    var out = el("div", "wc-out"); out.setAttribute("aria-live", "polite");
    box.appendChild(el("p", "wc-tap", L.tap || "")); box.appendChild(pop); box.appendChild(out); box.appendChild(sBtn); box.appendChild(sBox); box.appendChild(el("p", "mk-note", L.note));
    // fill in the counts once the word list is loaded (when the dashboard comes into view)
    function counts(){
      tiles.forEach(function(t){
        var i = -1; D.L.forEach(function(x, j){ if(i < 0 && x[0] === t[0]) i = j; });
        if(i < 0){ var nm = norm(t[0]), best = -1, bn = -1; (LN[nm] || []).forEach(function(j){ var c = cnt(D.L[j][2]); if(c > bn){ bn = c; best = j; } }); i = best; }
        t[1].textContent = i < 0 ? "" : cnt(D.L[i][2]) + "×";
      });
    }
    if("IntersectionObserver" in window){ var seen = false; new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && !seen){ seen = true; load().then(counts); } }); }, { rootMargin: "200px" }).observe(pop); }
    else load().then(counts);
    function load(){
      if(D) return Promise.resolve();
      if(window.QWORDS){ prep(); return Promise.resolve(); }
      out.textContent = L.loading;
      return new Promise(function(res, rej){ var sc = document.createElement("script"); sc.src = BASE + "mk-words.js"; sc.onload = function(){ prep(); res(); }; sc.onerror = rej; document.head.appendChild(sc); });
    }
    function prep(){
      D = window.QWORDS; LN = {}; FI = {}; ROOTS = {}; start = [0];
      D.C.forEach(function(c){ start.push(start[start.length - 1] + c); });
      D.L.forEach(function(x, i){ var n = norm(x[0]); (LN[n] = LN[n] || []).push(i); if(x[1]) (ROOTS[x[1]] = ROOTS[x[1]] || []).push(i); });
      D.F.forEach(function(x, i){ FI[x[0]] = i; });
    }
    function occ(str){ var p = 0; return str.split(".").map(function(t){ p += parseInt(t, 36); return p; }); }
    function ref(g){ var s = 1; while(start[s] < g) s++; return s + ":" + (g - start[s - 1]); }
    function cnt(str){ return str ? str.split(".").length : 0; }
    function formsOf(n){ var o = []; PRE.forEach(function(p){ var i = FI[p + n]; if(i != null && o.indexOf(i) < 0) o.push(i); }); return o; }
    var state = null;
    function search(raw, lemIdx){
      load().then(function(){
        var n = norm(raw); out.innerHTML = "";
        if(!n){ return; }
        var cands = [];
        (LN[n] || []).forEach(function(i){ if(cands.indexOf(i) < 0) cands.push(i); });
        var fs = formsOf(n);
        fs.forEach(function(i){ var l = D.F[i][1]; if(cands.indexOf(l) < 0) cands.push(l); });
        if(!cands.length){ out.appendChild(el("p", "wc-none", L.none)); return; }
        cands.sort(function(a, b){ return a - b; });
        var lem = lemIdx != null && cands.indexOf(lemIdx) > -1 ? lemIdx : cands[0];
        state = {n: n, fs: fs, lem: lem, cands: cands, rule: lemIdx != null ? "lemma" : (fs.length ? "form" : "lemma")};
        render();
      });
    }
    function verseList(gs){
      var c = {}, order = []; gs.forEach(function(g){ if(!c[g]){ c[g] = 0; order.push(g); } c[g]++; });
      order.sort(function(a, b){ return a - b; });
      var wrap = el("div", "nm-chips wc-vs"), lim = 240;
      function fill(all){
        wrap.innerHTML = "";
        (all ? order : order.slice(0, lim)).forEach(function(g){ var r = ref(g); var a = el("a", null, r + (c[g] > 1 ? " ×" + c[g] : "")); a.href = "kurani.html#" + r; wrap.appendChild(a); });
        if(!all && order.length > lim){ var m = el("button", "mk-btn", L.more + " (" + order.length + ")"); m.type = "button"; m.addEventListener("click", function(){ fill(true); }); wrap.appendChild(m); }
      }
      fill(false); return {el: wrap, n: order.length};
    }
    function render(){
      var st = state; out.innerHTML = "";
      if(st.cands.length > 1){
        var pk = el("div", "wc-pick"); pk.appendChild(el("p", "wc-popt", L.pick));
        st.cands.slice(0, 8).forEach(function(i){ var x = D.L[i]; var b = el("button", "wc-chip" + (i === st.lem ? " on" : "")); b.type = "button"; b.setAttribute("aria-pressed", String(i === st.lem));
          var ar = el("span", "wc-ar", x[0]); ar.lang = "ar"; b.appendChild(ar); b.appendChild(el("span", null, cnt(x[2]) + " " + L.times));
          b.addEventListener("click", function(){ st.lem = i; st.rule = "lemma"; render(); }); pk.appendChild(b); });
        out.appendChild(pk);
      }
      var lx = D.L[st.lem], root = lx[1];
      var fOcc = []; st.fs.forEach(function(i){ fOcc = fOcc.concat(occ(D.F[i][2])); });
      var lOcc = occ(lx[2]);
      var rOcc = []; if(root) (ROOTS[root] || []).forEach(function(i){ rOcc = rOcc.concat(occ(D.L[i][2])); });
      var head = el("div", "wc-head");
      var big = el("p", "wc-word", lx[0]); big.lang = "ar"; big.dir = "rtl"; head.appendChild(big);
      if(root){ var rp = el("p", "wc-root"); rp.appendChild(document.createTextNode(L.rootL + ": ")); var rs = el("span", null, root.split("").join(" ")); rs.lang = "ar"; rp.appendChild(rs); head.appendChild(rp); }
      out.appendChild(head);
      var tabs = el("div", "wc-tabs"); tabs.setAttribute("role", "group");
      [["form", L.form, fOcc], ["lemma", L.lemma, lOcc], ["root", L.root, rOcc]].forEach(function(t){
        if(t[0] === "form" && !st.fs.length) return; if(t[0] === "root" && !root) return;
        var b = el("button", "wc-tab" + (st.rule === t[0] ? " on" : "")); b.type = "button"; b.setAttribute("aria-pressed", String(st.rule === t[0]));
        b.appendChild(el("b", null, String(t[2].length))); b.appendChild(el("span", null, t[1]));
        b.addEventListener("click", function(){ st.rule = t[0]; render(); }); tabs.appendChild(b);
      });
      out.appendChild(tabs);
      var use = st.rule === "form" ? fOcc : st.rule === "root" ? rOcc : lOcc;
      var vl = verseList(use);
      out.appendChild(el("p", "nm-vh", use.length + " " + L.times + " · " + vl.n + " " + L.verses));
      out.appendChild(vl.el);
      if(st.rule !== "form"){
        var fl = D.F.map(function(x, i){ return [x, i]; }).filter(function(p){ return st.rule === "lemma" ? p[0][1] === st.lem : D.L[p[0][1]][1] === root; }).slice(0, 24);
        if(fl.length > 1){
          var fw = el("div", "wc-forms"); fw.appendChild(el("p", "wc-popt", L.forms));
          var cw = el("div", "wc-chips");
          fl.forEach(function(p){ var b = el("button", "wc-chip"); b.type = "button"; var ar = el("span", "wc-ar", p[0][0]); ar.lang = "ar"; b.appendChild(ar); b.appendChild(el("span", null, cnt(p[0][2]) + " " + L.times));
            b.addEventListener("click", function(){ inp.value = p[0][0]; search(p[0][0]); }); cw.appendChild(b); });
          fw.appendChild(cw); out.appendChild(fw);
        }
      }
    }
    var t;
    inp.addEventListener("input", function(){ clearTimeout(t); t = setTimeout(function(){ search(inp.value); }, 250); });
    form.addEventListener("submit", function(e){ e.preventDefault(); search(inp.value); });
    kbB.addEventListener("click", function(){ kb.hidden = !kb.hidden; kbB.setAttribute("aria-expanded", String(!kb.hidden)); load(); });
    kb.addEventListener("click", function(e){ var b = e.target.closest(".wc-key"); if(!b) return; inp.value = b.dataset.k === "del" ? inp.value.slice(0, -1) : inp.value + b.dataset.k; search(inp.value); });
    try{ var hq = localStorage.getItem("ikreWcQuery"); if(hq){ localStorage.removeItem("ikreWcQuery"); hq = JSON.parse(hq); inp.value = hq;
      load().then(function(){ var i = -1; D.L.forEach(function(x, j){ if(i < 0 && x[0] === hq) i = j; }); search(hq, i > -1 ? i : null); setTimeout(function(){ box.scrollIntoView({block: "start"}); }, 50); }); } }catch(e){}
    pw.addEventListener("click", function(e){
      var b = e.target.closest(".wc-chip"); if(!b) return;
      inp.value = b.dataset.lem;
      [].forEach.call(pw.querySelectorAll(".wc-tile.on"), function(x){ x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); }); b.classList.add("on"); b.setAttribute("aria-pressed", "true");
      load().then(function(){ var i = -1; D.L.forEach(function(x, j){ if(i < 0 && x[0] === b.dataset.lem) i = j; }); search(b.dataset.lem, i > -1 ? i : null);
        setTimeout(function(){ out.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "nearest" }); }, 30); });
    });
  }

  var FN = {wordcount: wordcount, numbers: numbers, hijri: hijri, food: food, chain: chain, challenge: challenge, romans: romans, moon: moon, embryo: embryo, seas: seas, deepsea: deepsea, mountain: mountain};
  function init(){
    var base = document.body.dataset.base || "";
    document.querySelectorAll(".mk-viz").forEach(function(box){
      var f = FN[box.dataset.viz]; if(!f) return;
      try{ f(box, JSON.parse(box.dataset.l), base); }catch(e){ if(window.console) console.error(e); }
    });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
