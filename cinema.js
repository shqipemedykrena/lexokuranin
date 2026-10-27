/* Ikre cinema player: one film block per explanation.
   A block is <div class="cn" data-cn="{json}">. Two kinds:
   - "video": a Blender film plays in a loop behind timed captions and notes
   - "scene": a live 3D scene (three.js + Blender models) moves through the chapters
   Each chapter is [title, text, seconds]. Captions are the page's own (sourced) text.
   Controls: previous, play/pause, next, chapter marks. It plays when it comes into view and
   pauses out of view. With reduced motion nothing plays by itself; the visitor steps through. */
(function () {
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = (function () { var s = document.querySelector('script[src*="cinema.js"]'); return s ? s.getAttribute('src').replace('cinema.js', '') : ''; })();
  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var loaded = {};
  function load(src) {
    if (!loaded[src]) loaded[src] = new Promise(function (ok, bad) {
      var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s);
    });
    return loaded[src];
  }
  function lib() {
    return (window.THREE ? Promise.resolve() : load(THREE_URL))
      .then(function () { return window.THREE.GLTFLoader ? 0 : load(BASE + 'vendor/GLTFLoader.js'); })
      .then(function () { return window.IkreCine ? 0 : load(BASE + 'cine.js'); });
  }
  function el(t, c, txt, p) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; if (p) p.appendChild(e); return e; }
  var GRAIN = null;
  function grain() {
    if (GRAIN) return GRAIN;
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'), d = x.createImageData(128, 128);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); return (GRAIN = 'url(' + c.toDataURL() + ')');
  }

  function mount(box) {
    var C = JSON.parse(box.getAttribute('data-cn')), U = C.ui, ch = C.ch, n = ch.length;
    box.classList.add('cn-on');
    var frame = el('div', 'cn-frame', null, box);
    var stage = el('div', 'cn-stage', null, frame);
    el('div', 'cn-vig', null, frame);
    var gr = el('div', 'cn-grain', null, frame); gr.style.backgroundImage = grain();
    var notes = el('div', 'cn-notes', null, frame); notes.setAttribute('aria-hidden', 'true');
    el('div', 'cn-bar cn-bar-t', null, frame);
    var slate = el('div', 'cn-slate', C.title || '', frame);
    el('div', 'cn-bar cn-bar-b', null, frame);
    var cap = el('div', 'cn-cap', null, box); cap.setAttribute('aria-live', 'polite');
    var capT = el('p', 'cn-cap-t', null, cap), capX = el('p', 'cn-cap-x', null, cap), capA = el('p', 'cn-cap-a', null, cap), capR = el('p', 'cn-cap-r', null, cap);
    capA.lang = 'ar'; capA.dir = 'rtl';
    var bar = el('div', 'cn-ctl', null, box);
    var bPrev = el('button', 'cn-btn cn-prev', null, bar), bPlay = el('button', 'cn-btn cn-play', null, bar), bNext = el('button', 'cn-btn cn-next', null, bar);
    bPrev.type = bPlay.type = bNext.type = 'button'; bPrev.setAttribute('aria-label', U.prev); bNext.setAttribute('aria-label', U.next);
    bPrev.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>';
    bNext.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>';
    var segs = el('div', 'cn-segs', null, bar), seg = [];
    for (var i = 0; i < n; i++) (function (k) {
      var s = el('button', 'cn-seg', null, segs); s.type = 'button'; s.setAttribute('aria-label', (k + 1) + ' / ' + n + ': ' + ch[k][0]);
      el('i', null, null, s); s.addEventListener('click', function () { go(k, true); }); seg.push(s);
    })(i);
    var count = el('span', 'cn-count', null, bar);

    var cur = -1, t = 0, playing = false, ended = false, inView = false, engine = null, last = 0, raf = 0, noteEls = [];
    function setPlay(p) {
      playing = p; bPlay.setAttribute('aria-label', p ? U.pause : (ended ? U.replay : U.play));
      bPlay.innerHTML = p ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>'
        : ended ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
      box.classList.toggle('cn-playing', p);
      if (engine && engine.video) { if (p && inView) { var q = engine.video.play(); if (q && q.catch) q.catch(function () {}); } else engine.video.pause(); }
      tick();
    }
    function go(k, user) {
      k = Math.max(0, Math.min(n - 1, k)); var changed = k !== cur; cur = k; t = 0; ended = false;
      capT.textContent = ch[k][0]; capX.textContent = ch[k][1]; var ex = ch[k][3] || {}; capA.textContent = ex.ar || ''; capR.textContent = ex.tr || ''; capA.hidden = !ex.ar; capR.hidden = !ex.tr;
      cap.classList.remove('cn-in'); void cap.offsetWidth; cap.classList.add('cn-in');
      seg.forEach(function (s, j) { s.classList.toggle('cn-done', j < k); s.classList.toggle('cn-cur', j === k); s.firstChild.style.setProperty('--p', j < k ? 1 : 0); });
      count.textContent = (k + 1) + ' / ' + n;
      bPrev.disabled = k === 0; bNext.disabled = k === n - 1;
      if (engine && engine.chapter && changed) engine.chapter(k, !!user && RM);
      notesFor(k);
      if (user && !RM && !playing) setPlay(true); else setPlay(playing);
    }
    /* screen notes for video films: [chapter, x, y, text] in frame fractions */
    function notesFor(k) {
      noteEls.forEach(function (e) { e.classList.remove('cn-show'); });
      (C.marks || []).forEach(function (m, j) {
        if (!noteEls[j]) { var e = el('div', 'cn-note', null, notes); el('span', 'cn-dot', null, e); el('span', 'cn-note-t', m[3], e); noteEls[j] = e; }
        var e2 = noteEls[j]; e2.style.left = (m[1] * 100) + '%'; e2.style.top = (m[2] * 100) + '%'; e2.classList.toggle('cn-left', m[1] > 0.6);
        if (m[0] === -1 || m[0] === k || (Array.isArray(m[0]) && m[0].indexOf(k) > -1)) e2.classList.add('cn-show');
      });
    }
    bPrev.addEventListener('click', function () { go(cur - 1, true); });
    bNext.addEventListener('click', function () { go(cur + 1, true); });
    bPlay.addEventListener('click', function () {
      if (ended) { go(0, true); setPlay(true); return; }
      setPlay(!playing);
    });
    function frameLoop(now) {
      raf = 0; var dt = Math.min(0.25, (now - (last || now)) / 1000) * (window.__dtScale || 1); last = now; if (window.__dbg) window.__frames = (window.__frames || 0) + 1;
      if (playing && inView) {
        t += dt; var d = ch[cur][2] || 6, p = Math.min(1, t / d);
        seg[cur].firstChild.style.setProperty('--p', p);
        if (t >= d) { if (cur < n - 1) go(cur + 1); else { ended = true; setPlay(false); } }
      }
      if (engine && engine.render && inView) engine.render(dt, now, cur, Math.min(1, t / (ch[cur][2] || 6)), playing);
      if (inView && (playing || (engine && engine.always))) raf = requestAnimationFrame(frameLoop); else last = 0;
    }
    function tick() { if (!raf) raf = requestAnimationFrame(frameLoop); }

    function video() {
      var v = el('video', 'cn-video', null, stage); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'none';
      v.poster = C.src + '.jpg'; v.setAttribute('aria-hidden', 'true');
      ['webm', 'mp4'].forEach(function (x) { var s = document.createElement('source'); s.src = C.src + '.' + x; s.type = 'video/' + x; v.appendChild(s); });
      return { video: v };
    }
    function scene() {
      var poster = el('div', 'cn-poster', null, stage); if (C.poster) poster.style.backgroundImage = 'url(' + C.poster + ')';
      var wait = el('div', 'cn-wait', null, stage);
      var eng = { always: true };
      lib().then(function () { return load(BASE + 'scenes/kit.js'); }).then(function () { return load(BASE + 'scenes/' + C.scene + '.js'); }).then(function () {
        var T = window.THREE, K = window.IkreCine, make = (window.IkreScenes || {})[C.scene]; if (!make) throw new Error('scene ' + C.scene);
        var r = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        K.grade(r, C.exposure || 1.1, true); r.outputEncoding = T.sRGBEncoding;
        r.domElement.className = 'cn-gl'; stage.appendChild(r.domElement);
        var sc = new T.Scene(), cam = new T.PerspectiveCamera(40, 16 / 9, 0.05, 4000), rig = K.rig(cam, { lift: 0.4, dur: 3.2 });
        var labels = [];
        function label(text) {
          var e = el('div', 'cn-note cn-3d', null, notes); el('span', 'cn-dot', null, e); var tt = el('span', 'cn-note-t', text, e);
          var h = { p: new T.Vector3(), on: false, e: e,
            at: function (x, y, z) { h.p.set(x, y, z); return h; }, show: function (o) { h.on = !!o; return h; }, text: function (s) { tt.textContent = s; return h; } };
          labels.push(h); return h;
        }
        function model(url, ok, bad) {
          K.model(url, function (g) {
            g.scene.traverse(function (o) { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { var an = r.capabilities.getMaxAnisotropy ? r.capabilities.getMaxAnisotropy() : 4; [m.map, m.normalMap, m.roughnessMap].forEach(function (t) { if (t) { t.anisotropy = an; t.needsUpdate = true; } }); if (m.map) m.map.encoding = T.sRGBEncoding; if (m.emissiveMap) m.emissiveMap.encoding = T.sRGBEncoding; m.needsUpdate = true; }); });
            ok(g);
          }, bad);
        }
        var ctx = { model: model, T: T, K: K, scene: sc, camera: cam, renderer: r, rig: rig, base: BASE, label: label, L: C.L || {}, ch: ch, reduce: RM };
        var S = make(ctx);
        function size() {
          var w = stage.clientWidth || 640, hh = stage.clientHeight || 360;
          r.setSize(w, hh, false); cam.aspect = w / hh; cam.updateProjectionMatrix(); rig.lens(cam.aspect);
        }
        if ('ResizeObserver' in window) new ResizeObserver(size).observe(stage); size();
        var v3 = new T.Vector3();
        eng.chapter = function (k, instant) { if (S.chapter) S.chapter(k, instant); };
        eng.render = function (dt, now, k, p, pl) {
          if (S.update) S.update(dt, now, k, p, pl); rig.update(dt, now); if (window.__dbg) window.__cam = [cam.position.toArray().map(function (x) { return +x.toFixed(2); }), k];
          r.render(sc, cam);
          var w = stage.clientWidth, hh = stage.clientHeight;
          labels.forEach(function (h) {
            v3.copy(h.p).project(cam); var vis = h.on && v3.z < 1 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1.05;
            h.e.classList.toggle('cn-show', vis);
            if (vis) { var x = (v3.x * 0.5 + 0.5), y = (-v3.y * 0.5 + 0.5); h.e.style.left = (x * 100) + '%'; h.e.style.top = (y * 100) + '%'; h.e.classList.toggle('cn-left', x > 0.6); }
          });
        };
        if (S.ready && S.ready.then) S.ready.then(done, done); else done();
        function done() { poster.classList.add('cn-gone'); wait.classList.add('cn-gone'); if (cur > -1 && S.chapter) S.chapter(cur, true); tick(); }
      }).catch(function (e) { wait.classList.add('cn-gone'); if (window.console) console.error(e); });
      return eng;
    }
    /* rendered stills (Blender Cycles), one per chapter. Each still holds or moves gently (a slow push or pull
       toward a point), and changes with a soft cross-fade. Optional light on top: "flicker" (a lamp) or "dust"
       (motes in a sunbeam). C.st = [{f:[x,y] focus, m:[s0,s1] scale from/to, fx:'flicker'|'dust', at:[x,y]}] */
    function stills() {
      box.classList.add('cn-stills');
      var S = C.st || [], base = C.stbase || '', layers = [], fxs = [], nts = [];
      S.forEach(function (s, i) {
        var d = el('div', 'cn-st', null, stage), im = el('img', null, null, d);
        im.alt = ''; im.decoding = 'async'; im.setAttribute('aria-hidden', 'true');
        var pl = s.p != null ? s.p : i;
        im.srcset = base + pl + '-1280.webp 1280w, ' + base + pl + '-1920.webp 1920w';
        im.sizes = '(max-width: 700px) 100vw, 1100px'; im.src = base + pl + '-1280.webp';
        var f = s.f || [0.5, 0.5]; d.style.transformOrigin = (f[0] * 100) + '% ' + (f[1] * 100) + '%';
        var fx = null;
        if (s.fx === 'flicker') { fx = el('div', 'cn-fx-flicker', null, d); var a = s.at || f; fx.style.left = (a[0] * 100) + '%'; fx.style.top = (a[1] * 100) + '%'; }
        if (s.fx === 'rings' || s.fx === 'glow') { fx = el('div', 'cn-fx-' + s.fx, null, d); var a2 = s.at || f; fx.style.left = (a2[0] * 100) + '%'; fx.style.top = (a2[1] * 100) + '%'; if (s.fx === 'rings') for (var q2 = 0; q2 < 3; q2++) el('i', null, null, fx).style.animationDelay = (q2 * 0.9) + 's'; }
        if (s.fx === 'dust') { fx = el('canvas', 'cn-fx-dust', null, d); fx.width = 480; fx.height = 270; fx.motes = []; for (var q = 0; q < 70; q++) fx.motes.push([Math.random(), Math.random(), 0.4 + Math.random() * 1.4, Math.random() * 6.3]); }
        layers.push(d); fxs.push(fx);
        /* notes pinned on the picture: [x, y, text] in frame fractions */
        nts.push((s.n || []).map(function (m) {
          var e = el('div', 'cn-note', null, notes); el('span', 'cn-dot', null, e); el('span', 'cn-note-t', m[2], e);
          e.style.left = (m[0] * 100) + '%'; e.style.top = (m[1] * 100) + '%'; e.classList.toggle('cn-left', m[0] > 0.6); return e;
        }));
      });
      var on = -1, ph = 0;
      function pose(k, p) {
        var s = S[k] || {}, m = s.m || [1, 1.05], e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        if (RM) e = 0.5;
        layers[k].style.transform = 'scale(' + (m[0] + (m[1] - m[0]) * e).toFixed(4) + ')';
      }
      return {
        chapter: function (k, instant) {
          if (!layers[k]) return;
          layers.forEach(function (d, j) { d.classList.toggle('cn-st-on', j === k); d.classList.toggle('cn-st-cut', !!instant || RM); });
          nts.forEach(function (L, j) { L.forEach(function (e) { e.classList.toggle('cn-show', j === k); }); });
          on = k; pose(k, 0);
        },
        render: function (dt, now, k, p) {
          if (k !== on || !layers[k]) return; pose(k, p); ph += dt;
          var fx = fxs[k]; if (!fx || RM) return;
          if (fx.motes) {
            var x = fx.getContext('2d'), W = fx.width, H = fx.height; x.clearRect(0, 0, W, H);
            fx.motes.forEach(function (o) {
              o[0] += dt * 0.004 * o[2]; o[1] += Math.sin(ph * 0.6 + o[3]) * dt * 0.003; if (o[0] > 1) o[0] -= 1;
              var a = 0.25 + 0.35 * Math.sin(ph * 0.9 + o[3]) * Math.sin(ph * 0.9 + o[3]);
              x.fillStyle = 'rgba(255,236,200,' + a.toFixed(3) + ')'; x.beginPath(); x.arc(o[0] * W, o[1] * H, o[2] * 0.7, 0, 6.3); x.fill();
            });
          } else if (fx.className === 'cn-fx-rings') { return; }
          else if (fx.className === 'cn-fx-glow') fx.style.opacity = (0.65 + 0.35 * Math.sin(ph * 1.4)).toFixed(3);
          else fx.style.opacity = (0.55 + 0.25 * Math.sin(ph * 7.1) * Math.sin(ph * 3.3) + 0.1 * Math.sin(ph * 17)).toFixed(3);
        }
      };
    }
    function start() {
      if (engine) return;
      engine = C.kind === 'scene' ? scene() : C.kind === 'stills' ? stills() : video();
      if (cur > -1 && engine.chapter) engine.chapter(cur, true);
    }
    box.cnGo = function (k) { go(k, true); };
    box.cnSeek = function (k, f) { if (k !== cur) go(k, true); t = f * (ch[k][2] || 6); setPlay(false); };
    go(0); setPlay(false);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var was = inView; inView = e.isIntersecting && e.intersectionRatio > 0.3;
        if (inView) { start(); frame.classList.add('cn-open'); if (!was && !RM && !ended && !box.dataset.paused) setPlay(true); else tick(); }
        else { if (playing) setPlay(false); if (engine && engine.video) engine.video.pause(); }
      });
    }, { threshold: [0, 0.3, 0.6] });
    io.observe(box);
    bPlay.addEventListener('click', function () { if (!playing) box.dataset.paused = '1'; else delete box.dataset.paused; });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cn-go]'); if (!a) return;
    var box = document.getElementById(a.getAttribute('data-cn-for')); if (!box || !box.cnGo) return;
    e.preventDefault(); box.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); box.cnGo(+a.getAttribute('data-cn-go'));
  });
  function init() { [].forEach.call(document.querySelectorAll('.cn[data-cn]'), function (b) { try { mount(b); } catch (e) { if (window.console) console.error(e); } }); }
  if (!('IntersectionObserver' in window)) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
