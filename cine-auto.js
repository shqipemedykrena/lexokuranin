/* Ikre film layer for 3D pages whose scene code stays as it is (pse-jemi-ketu, kujt-lutesh).
   Adds: film tone mapping, a soft handheld breath on the camera, letterbox, vignette, grain, chapter cards and a running time code.
   Options on the script tag: data-stage (CSS selector, or "fixed" for a full-screen page), data-steps, data-exposure, data-breath, data-chapter (selector of a label to follow). */
(function () {
  var me = document.currentScript, D = (me && me.dataset) || {};
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var exp = +D.exposure || 1.15, breath = D.breath == null ? 0.004 : +D.breath;
  var css = '.gj-cine .gj-bar{position:absolute;left:0;right:0;height:9%;min-height:1.6rem;background:#000;z-index:3;pointer-events:none;transition:transform 1.4s cubic-bezier(.2,.7,.2,1);display:flex;align-items:center;padding:0 1rem}' +
    '.gj-cine .gj-bar-t{top:0;transform:translateY(-100%)}.gj-cine .gj-bar-b{bottom:0;transform:translateY(100%);justify-content:flex-end}.gj-cine.gj-in .gj-bar{transform:none}' +
    '.gj-chap{font-family:"Source Sans 3",system-ui,sans-serif;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(241,231,226,.78);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0}' +
    '.gj-chap.on{animation:gjChap 4.5s ease forwards}@keyframes gjChap{0%{opacity:0;letter-spacing:.3em}20%{opacity:1;letter-spacing:.18em}75%{opacity:1}100%{opacity:.45}}' +
    '.gj-tc{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.74rem;letter-spacing:.12em;color:rgba(255,196,107,.85)}.gj-tc::before{content:"\\25CF";color:#e0283f;margin-right:.5em;font-size:.6rem;vertical-align:.1em;animation:gjRec 2s steps(2) infinite}@keyframes gjRec{50%{opacity:.25}}' +
    '.gj-vig{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}' +
    '.gj-grain{position:absolute;inset:-50%;z-index:2;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-size:128px 128px;animation:gjGrain .6s steps(6) infinite}' +
    '@keyframes gjGrain{0%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}40%{transform:translate(3%,-2%)}60%{transform:translate(-2%,-4%)}80%{transform:translate(4%,2%)}100%{transform:translate(0,0)}}' +
    '.gj-fixed{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}.gj-fixed .gj-bar{height:4%}' +
    '@media (prefers-reduced-motion:reduce){.gj-grain,.gj-tc::before{animation:none}.gj-chap.on{animation:none;opacity:1}.gj-cine .gj-bar{transition:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- renderer: tone mapping and handheld breath ----------
  function wrap(T) {
    if (!T || !T.WebGLRenderer || T.__ikreFilm) return; T.__ikreFilm = 1;
    var R = T.WebGLRenderer, off = new T.Vector3();
    var W = function (o) {
      var r = new R(o); r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = exp;
      var render = r.render.bind(r);
      r.render = function (s, c) {
        if (c && c.isPerspectiveCamera && !reduce && breath > 0) {
          var t = performance.now() / 1000, d = c.position.length() || 1;
          off.set(Math.sin(t * 0.7) + Math.sin(t * 1.3) * 0.5, Math.sin(t * 0.9 + 1) * 0.8, 0).multiplyScalar(breath * Math.min(d, 10)).applyQuaternion(c.quaternion);
          c.position.add(off); render(s, c); c.position.sub(off);
        } else render(s, c);
      };
      return r;
    };
    W.prototype = R.prototype; T.WebGLRenderer = W;
  }
  if (window.THREE) wrap(window.THREE);
  else {   // three.js loaded later (kujt-lutesh picks a copy at run time): catch it as soon as it is set
    var held;
    try {
      Object.defineProperty(window, 'THREE', { configurable: true, get: function () { return held; }, set: function (v) { held = v; Promise.resolve().then(function () { wrap(held); }); } });
    } catch (e) {}
  }

  // ---------- film overlay ----------
  function start() {
    var stage = D.stage === 'fixed' ? null : document.querySelector(D.stage || '#pseStage');
    if (D.stage === 'fixed') { stage = document.createElement('div'); stage.className = 'gj-fixed'; document.body.appendChild(stage); }
    if (!stage) return;
    function div(c, p) { var d = document.createElement('div'); d.className = c; (p || stage).appendChild(d); return d; }
    stage.classList.add('gj-cine'); div('gj-vig'); var grain = div('gj-grain');
    var bt = div('gj-bar gj-bar-t'), bb = div('gj-bar gj-bar-b'), chap = div('gj-chap', bt), tc = div('gj-tc', bb);
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'), d = x.createImageData(128, 128);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); grain.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    requestAnimationFrame(function () { stage.classList.add('gj-in'); });
    var last = '';
    function show(text) { if (!text || text === last) return; last = text; chap.classList.remove('on'); void chap.offsetWidth; chap.textContent = text; chap.classList.add('on'); }
    var steps = Array.prototype.slice.call(document.querySelectorAll(D.steps || '.pse-step'));
    if (D.chapter) {
      var lab = document.querySelector(D.chapter);
      if (lab && 'MutationObserver' in window) { new MutationObserver(function () { show(lab.textContent.trim()); }).observe(lab, { childList: true, characterData: true, subtree: true }); show(lab.textContent.trim()); }
    } else if (steps.length) {
      var pick = function () {
        var mid = window.innerHeight * (window.innerWidth >= 860 ? 0.5 : 0.72), best = 0, bestD = Infinity;
        steps.forEach(function (s, k) { var r = s.getBoundingClientRect(), dd = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0; if (dd < bestD) { bestD = dd; best = k; } });
        var h = steps[best].querySelector('h2'); if (h) show((best + 1) + '  ·  ' + h.textContent);
      };
      window.addEventListener('scroll', pick, { passive: true }); pick();
    }
    if (D.tc === '0') { tc.style.display = 'none'; return; }
    var t0 = performance.now();
    (function tick() {
      var s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24), p = function (n) { return (n < 10 ? '0' : '') + n; };
      tc.textContent = p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(Math.floor(s) % 60) + ':' + p(f);
      setTimeout(tick, 1000 / 12);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
