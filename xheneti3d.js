/* Ikre: "Xheneti". Filmed like a movie (cine.js); the gate is a Blender model (models/xheneti-gate.json). An abstract scene: one hundred rings of light for the hundred degrees, four streams from the top, a gate, and the sun and full moon. Nothing here pictures Paradise itself. */
(function () {
  var root = document.getElementById('pse'), stage = document.getElementById('pseStage'), canvas = document.getElementById('pseCanvas');
  if (!root || !stage || !canvas) return;
  var steps = Array.prototype.slice.call(root.querySelectorAll('.pse-step'));
  function noGL() { document.documentElement.classList.add('pse-no3d'); }
  if (!window.THREE) { noGL(); return; }
  var K = window.IkreCine;
  var T = window.THREE, reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (e) { noGL(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (K) { K.grade(renderer, 1.1); renderer.shadowMap.enabled = false; }
  var scene = new T.Scene(), camera = new T.PerspectiveCamera(45, 1, 0.1, 2000);
  var film = K ? K.film(stage, steps) : null, cam = K ? K.rig(camera, { lift: 6, dur: 3.2 }) : null;
  var skyU = { top: { value: new T.Color(0x05070f) }, bot: { value: new T.Color(0x16224a) } };
  scene.add(new T.Mesh(new T.SphereGeometry(900, 32, 16), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying float h; void main(){ gl_FragColor = vec4(mix(bot, top, smoothstep(-0.3, 0.7, h)), 1.0); }' })));
  var sg = new T.BufferGeometry(), N = 2200, sp = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) { var u = Math.random() * 2 - 1, th = Math.random() * 6.283, r = 850, s = Math.sqrt(1 - u * u); sp[i*3] = r*s*Math.cos(th); sp[i*3+1] = r*u; sp[i*3+2] = r*s*Math.sin(th); }
  sg.setAttribute('position', new T.BufferAttribute(sp, 3));
  var starMat = new T.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.8 });
  scene.add(new T.Points(sg, starMat));
  // 100 rings
  var GAP = 1.6, TOP = 99 * GAP, rings = new T.Group(); scene.add(rings);
  for (i = 0; i < 100; i++) {
    var top = i === 99, rad = 9 - i * 0.045;
    var m = new T.MeshBasicMaterial({ color: top ? 0xfff2c4 : 0xd9b45a, transparent: true, opacity: top ? 0.95 : 0.25 + 0.5 * (i / 99), side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
    var ring = new T.Mesh(new T.RingGeometry(rad - (top ? 0.25 : 0.08), rad, 96), m); ring.rotation.x = -Math.PI / 2; ring.position.y = i * GAP; rings.add(ring);
  }
  function glowTex(inner, outer) { var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner); g.addColorStop(0.3, outer); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); }
  var topGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex('rgba(255,248,220,.95)', 'rgba(255,214,140,.35)'), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
  topGlow.scale.set(40, 40, 1); topGlow.position.y = TOP + 2; scene.add(topGlow);
  // soft shafts of light falling from the top
  var shafts = new T.Group(); scene.add(shafts);
  for (var sh = 0; sh < 10; sh++) {
    var cone = new T.Mesh(new T.ConeGeometry(2 + Math.random() * 3, TOP + 10, 24, 1, true), new T.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0.006 + Math.random() * 0.008, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }));
    cone.position.set((Math.random() - 0.5) * 6, TOP / 2, (Math.random() - 0.5) * 6); cone.rotation.z = (Math.random() - 0.5) * 0.12; shafts.add(cone);
  }
  var flowTex = (function () { var c = document.createElement('canvas'); c.width = 256; c.height = 16; var x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 256, 0);
    for (var q = 0; q <= 8; q++) g.addColorStop(q / 8, q % 2 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,.25)'); x.fillStyle = g; x.fillRect(0, 0, 256, 16);
    var t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; t.repeat.set(6, 1); return t; })();
  // four streams from the top
  var streams = [];
  for (var k = 0; k < 4; k++) {
    var pts = []; for (var j = 0; j <= 40; j++) { var t = j / 40, a = k * Math.PI / 2 + t * 5, rr = 2 + t * 6.5; pts.push(new T.Vector3(Math.cos(a) * rr, TOP - t * TOP * 0.98, Math.sin(a) * rr)); }
    var tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 200, 0.16, 8, false), new T.MeshBasicMaterial({ map: flowTex, color: [0xbfe8ff, 0xffffff, 0xffd98a, 0xe8d6ff][k], transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    scene.add(tube); streams.push(tube);
  }
  // floating light
  var pg = new T.BufferGeometry(), PN = 700, pp = new Float32Array(PN * 3);
  for (i = 0; i < PN; i++) { pp[i*3] = (Math.random() - .5) * 40; pp[i*3+1] = Math.random() * (TOP + 20); pp[i*3+2] = (Math.random() - .5) * 40; }
  pg.setAttribute('position', new T.BufferAttribute(pp, 3));
  var motes = new T.Points(pg, new T.PointsMaterial({ color: 0xffe7b0, size: 0.18, transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending })); scene.add(motes);
  // a gate (ar-Rayyan) at the foot
  var gate = new T.Group(); scene.add(gate);
  var gm = new T.MeshBasicMaterial({ color: 0xf3dfa2, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending });
  var archPts = []; for (j = 0; j <= 40; j++) { var q = j / 40 * Math.PI; archPts.push(new T.Vector3(Math.cos(q) * 2.2, 3 + Math.sin(q) * 2.2, 0)); }
  gate.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(archPts), 80, 0.08, 6, false), gm));
  [-2.2, 2.2].forEach(function (x) { var p = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 3, 8), gm); p.position.set(x, 1.5, 0); gate.add(p); });
  gate.position.set(0, 0, 12); gate.visible = false;
  var gateLight = K ? K.glow(14, 'rgba(255,236,190,.9)', 'rgba(255,200,120,.25)') : null; if (gateLight) { gateLight.position.set(0, 3.2, 11.3); gate.add(gateLight); gateLight.position.set(0, 3.2, -0.7); }
  var floorGlow = K ? K.glow(26, 'rgba(255,220,160,.35)', 'rgba(255,190,120,.08)') : null;
  if (floorGlow) { floorGlow.material.rotation = 0; floorGlow.position.set(0, 0.05, 1.5); floorGlow.scale.set(26, 8, 1); gate.add(floorGlow); }
  var lamp = new T.PointLight(0xffd9a0, 0, 30, 1.6); lamp.position.set(0, 3, 1.5); gate.add(lamp);
  scene.add(new T.HemisphereLight(0xb8c4ff, 0x302418, 0.55));
  var key = new T.DirectionalLight(0xffe7c4, 0.9); key.position.set(-6, 10, 14); scene.add(key);
  if (K) K.model('models/xheneti-gate.json', function (g) {
    gate.children.slice().forEach(function (c) { if (c !== gateLight && c !== floorGlow && c !== lamp) gate.remove(c); });
    g.scene.traverse(function (o) { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.name === 'Gold') { m.emissive = new T.Color(0x6b4a12); m.emissiveIntensity = 0.6; } }); });
    gate.add(g.scene); g.scene.scale.setScalar(0.62); lamp.intensity = 1.3; requestRender();
  });
  // sun and full moon on a clear sky
  var sun = new T.Sprite(new T.SpriteMaterial({ map: glowTex('rgba(255,252,235,1)', 'rgba(255,205,120,.6)'), transparent: true, depthWrite: false }));
  sun.scale.set(60, 60, 1); sun.position.set(-75, 95, -300); scene.add(sun);
  var sunStreak = K ? K.streak(300, 5, 0.5) : null; if (sunStreak) { sunStreak.position.copy(sun.position); scene.add(sunStreak); }
  var moonC = document.createElement('canvas'); moonC.width = moonC.height = 128; var mx = moonC.getContext('2d');
  var mg = mx.createRadialGradient(54, 54, 6, 64, 64, 60); mg.addColorStop(0, '#fffdf2'); mg.addColorStop(1, '#d8d2bd'); mx.fillStyle = mg; mx.beginPath(); mx.arc(64, 64, 58, 0, 7); mx.fill();
  var moon = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(moonC), transparent: true, depthWrite: false })); moon.scale.set(30, 30, 1); moon.position.set(75, 88, -300); scene.add(moon);
  sun.visible = moon.visible = false; if (sunStreak) sunStreak.visible = false;

  var tagLvl = stage.querySelector('[data-tag="level"]'), tagTop = stage.querySelector('[data-tag="firdaws"]'), tagGate = stage.querySelector('[data-tag="gate"]');
  var lvlIn = document.getElementById('xhLevel'), lvlOut = document.getElementById('xhLevelOut');
  var VIEWS = [
    { pos: [0, 6, 34], at: [0, 8, 0] },
    { pos: [70, TOP * 0.55, 120], at: [0, TOP * 0.45, 0] },
    { pos: [24, 20, 30], at: [0, 16, 0] },
    { pos: null, at: null },
    { pos: [0, 3.4, 27], at: [0, 3.2, 12] },
    { pos: [0, 10, 40], at: [0, 70, -300] }
  ];
  var camFrom = new T.Vector3(), camTo = new T.Vector3(), atFrom = new T.Vector3(), atTo = new T.Vector3(), atNow = new T.Vector3(), moveT = 1, current = -1;
  function levelView(n) { var y = (n - 1) * GAP; camTo.set(18, y + 6, 18); atTo.set(0, y + 1, 0); if (lvlOut) lvlOut.textContent = lvlOut.dataset.fmt.replace('{n}', n); }
  function go(i) {
    if (i === current) return;
    var first = current < 0; current = i;
    camFrom.copy(camera.position); atFrom.copy(atNow);
    if (i === 3) levelView(lvlIn ? +lvlIn.value : 1); else { camTo.fromArray(VIEWS[i].pos); atTo.fromArray(VIEWS[i].at); }
    streams.forEach(function (s) { s.material.opacity = i === 1 ? 0.7 : 0.12; s.visible = i !== 5; });
    gate.visible = i === 4; sun.visible = moon.visible = i === 5; if (sunStreak) sunStreak.visible = i === 5; shafts.visible = i !== 5; if (film) film.chapter(i);
    skyU.top.value.set(i === 5 ? 0x3f7fd0 : 0x05070f); skyU.bot.value.set(i === 5 ? 0xcfe6f7 : 0x16224a); starMat.opacity = i === 5 ? 0 : 0.8;
    motes.visible = i !== 5; rings.visible = i !== 5; topGlow.visible = i !== 5;
    if (tagGate) tagGate.hidden = i !== 4;
    moveT = first || reduce ? 1 : 0;
    if (moveT === 1) { camera.position.copy(camTo); atNow.copy(atTo); }
    if (cam) { var MV = [[0, 1, -6], [-12, 8, -14], [-3, 3, -4], [-2, 1, -2], [0, 0.4, -3], [0, 1, -4]][i]; if (first) cam.cut(camTo.toArray(), atTo.toArray(), 45); cam.go(camTo.toArray(), atTo.toArray(), [42, 50, 40, 42, 40, 44][i], MV, first); }
    requestRender();
  }
  if (lvlIn) lvlIn.addEventListener('input', function () { if (current !== 3) return; camFrom.copy(camera.position); atFrom.copy(atNow); levelView(+lvlIn.value); moveT = reduce ? 1 : 0.4; if (cam) cam.go(camTo.toArray(), atTo.toArray(), 42, [-2, 1, -2]); requestRender(); });
  if (lvlOut && lvlIn) lvlOut.textContent = lvlOut.dataset.fmt.replace('{n}', lvlIn.value);
  function pick() {
    var mid = window.innerHeight * (window.innerWidth >= 860 ? 0.5 : 0.72), best = 0, bestD = Infinity;
    steps.forEach(function (s, k) { var r = s.getBoundingClientRect(); var d = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0; if (d < bestD) { bestD = d; best = k; } });
    go(+steps[best].getAttribute('data-scene'));
  }
  window.addEventListener('scroll', pick, { passive: true });
  function resize() { var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; if (cam) cam.lens(w / h); else camera.fov = w / h < 1 ? 60 : 45; camera.updateProjectionMatrix(); requestRender(); }
  window.addEventListener('resize', resize);
  var visible = true, pending = false, last = performance.now(), t0 = last;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) requestRender(); }).observe(stage);
  function requestRender() { if (!pending) { pending = true; requestAnimationFrame(frame); } }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  var proj = new T.Vector3();
  function place(tag, v) { if (!tag) return; proj.copy(v).project(camera); var on = proj.z < 1 && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05; tag.hidden = !on; if (on) { tag.style.left = ((proj.x + 1) / 2 * 100) + '%'; tag.style.top = ((1 - proj.y) / 2 * 100) + '%'; } }
  function frame(now) {
    pending = false; var dt = Math.min(0.05, (now - last) / 1000); last = now; var t = (now - t0) / 1000;
    if (cam) { cam.update(dt, now); moveT = cam.moving() ? 0.5 : 1; if (film) film.run(); }
    else if (moveT < 1) { moveT = Math.min(1, moveT + dt / 1.4); var e = ease(moveT); camera.position.lerpVectors(camFrom, camTo, e); atNow.lerpVectors(atFrom, atTo, e); }
    if (!reduce) { rings.rotation.y = t * 0.03; motes.rotation.y = -t * 0.02; shafts.rotation.y = t * 0.01; flowTex.offset.x = -t * 0.25; if (current === 1) streams.forEach(function (s, k) { s.material.opacity = 0.45 + 0.3 * Math.sin(t * 1.5 + k); }); }
    if (!cam) camera.lookAt(atNow); renderer.render(scene, camera);
    if (current !== 5) { place(tagTop, new T.Vector3(0, TOP + 1.5, 0)); } else if (tagTop) tagTop.hidden = true;
    if (current === 3 && tagLvl && lvlIn) { place(tagLvl, new T.Vector3(9 - (+lvlIn.value - 1) * 0.045, (+lvlIn.value - 1) * GAP, 0)); } else if (tagLvl) tagLvl.hidden = true;
    if (current === 4) place(tagGate, new T.Vector3(0, 5.6, 12));
    if (visible && !document.hidden && (moveT < 1 || !reduce)) requestRender();
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) requestRender(); });
  camera.position.set(0, 6, 34); atNow.set(0, 8, 0);
  resize(); pick(); if (current < 0) go(0);
})();
