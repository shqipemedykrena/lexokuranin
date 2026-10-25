/* Ikre: "Shiu dhe uji, shenja të Allahut". The Albanian village (made in Blender) under rain clouds, filmed like a movie.
   Sliders control the rain and the growth after it. Film layer: cine.js. Previous version: build/backup/shiu3d.v93.js */
(function () {
  var root = document.getElementById('pse'), stage = document.getElementById('pseStage'), canvas = document.getElementById('pseCanvas');
  if (!root || !stage || !canvas) return;
  var steps = Array.prototype.slice.call(root.querySelectorAll('.pse-step'));
  function noGL() { document.documentElement.classList.add('pse-no3d'); }
  if (!window.THREE || !window.IkreCine) { noGL(); return; }
  var T = window.THREE, K = window.IkreCine, reduce = K.reduce;
  var small = Math.min(window.innerWidth, window.innerHeight) < 700;
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (e) { noGL(); return; }
  K.grade(renderer, 1.25, small);
  var scene = new T.Scene(), camera = new T.PerspectiveCamera(45, 1, 0.1, 900);
  scene.fog = new T.FogExp2(0x8a96a6, 0.012);
  var film = K.film(stage, steps), cam = K.rig(camera);

  // ---------- sky dome with a sun glow ----------
  var skyU = { top: { value: new T.Color(0x56708f) }, bot: { value: new T.Color(0xa9b6c4) }, glow: { value: new T.Color(0) }, sunDir: { value: new T.Vector3(-0.4, 0.5, -1) } };
  scene.add(new T.Mesh(new T.SphereGeometry(400, 32, 16), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, uniforms: skyU, fog: false,
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; uniform vec3 glow; uniform vec3 sunDir; varying vec3 vp; void main(){ float k = smoothstep(-0.05, 0.55, vp.y); vec3 c = mix(bot, top, k); float s = max(dot(vp, normalize(sunDir)), 0.0); c += glow * (pow(s, 5.0) * 0.8 + pow(s, 60.0) * 0.7); gl_FragColor = vec4(c, 1.0); }'
  })));
  var SUNP = new T.Vector3(-120, 160, -260);
  var sunSpr = K.glow(70, 'rgba(255,250,230,1)', 'rgba(255,210,140,.5)', false); sunSpr.position.copy(SUNP); scene.add(sunSpr);
  var sunStreak = K.streak(280, 5, 0.45); sunStreak.position.copy(SUNP); scene.add(sunStreak);

  // ---------- light ----------
  var hemi = new T.HemisphereLight(0xc9d6e8, 0x3a3326, 0.6); scene.add(hemi);
  var sunL = new T.DirectionalLight(0xfff1dc, 1); sunL.castShadow = true; sunL.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  var sc = sunL.shadow.camera; sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 260; sunL.shadow.bias = -0.0008;
  sunL.position.copy(SUNP).normalize().multiplyScalar(120); sunL.target.position.set(0, 0, -6); scene.add(sunL); scene.add(sunL.target);

  // ---------- simple world (until the Blender village has loaded) ----------
  var simple = new T.Group(); scene.add(simple);
  function hillOld(x, z) { return Math.sin(x * 0.08) * 1.4 + Math.cos(z * 0.06) * 1.1 + Math.sin((x + z) * 0.15) * 0.4; }
  var hill = hillOld;
  var gGeo = new T.PlaneGeometry(260, 260, 100, 100); gGeo.rotateX(-Math.PI / 2);
  var gp = gGeo.attributes.position, i;
  for (i = 0; i < gp.count; i++) { var gx = gp.getX(i), gz = gp.getZ(i), y = hillOld(gx, gz); if (gz < -50) y += (-gz - 50) * 0.35 * (0.6 + 0.4 * Math.sin(gx * 0.05)); gp.setY(i, y); }
  gGeo.computeVertexNormals();
  var groundMat = new T.MeshStandardMaterial({ color: 0x5f7a45, roughness: 1 }), ground = new T.Mesh(gGeo, groundMat); ground.receiveShadow = true; simple.add(ground);
  var stoneS = new T.MeshStandardMaterial({ color: 0xcdbfa8, roughness: 0.95 }), roofS = new T.MeshStandardMaterial({ color: 0x8a4b32, roughness: 0.9 });
  [[0, 0, 0.15, 1], [-7, -5, 0.6, 0.9], [6, -8, -0.4, 1.05], [-13, 3, 0.2, 0.85], [11, 2, -0.7, 0.9], [-3, -14, 0.1, 0.95], [15, -16, 0.3, 0.8]].forEach(function (h) {
    var g = new T.Group(); g.position.set(h[0], hillOld(h[0], h[1]), h[1]); g.rotation.y = h[2]; g.scale.setScalar(h[3]);
    var b = new T.Mesh(new T.BoxGeometry(2.4, 3, 2.4), stoneS); b.position.y = 1.5; g.add(b);
    var r = new T.Mesh(new T.ConeGeometry(2.1, 1.1, 4), roofS); r.position.y = 3.55; r.rotation.y = Math.PI / 4; g.add(r); simple.add(g);
  });

  // ---------- clouds: two layers, dark undersides ----------
  function cloudTex() {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    for (var k = 0; k < 26; k++) { var px = 40 + Math.random() * 176, py = 80 + Math.random() * 96, r = 30 + Math.random() * 50;
      var g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
    return new T.CanvasTexture(c);
  }
  var cTex = cloudTex(), clouds = [];
  for (i = 0; i < (small ? 26 : 40); i++) {
    var low = i % 3 === 0;
    var cl = new T.Sprite(new T.SpriteMaterial({ map: cTex, color: 0x8d96a3, transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
    cl.position.set((Math.random() - 0.5) * 260, low ? 24 + Math.random() * 8 : 36 + Math.random() * 20, -Math.random() * 150 + 10);
    var s = (low ? 30 : 45) + Math.random() * 40; cl.scale.set(s, s * 0.5, 1); cl.userData.low = low; cl.userData.v = 0.8 + Math.random() * 0.8; scene.add(cl); clouds.push(cl);
  }

  // ---------- rain: a wide field and a close layer that moves with the camera ----------
  function drop(F, k, top) {
    var b = F.box, x = F.c.x + (Math.random() - 0.5) * b[0], z = F.c.z + (Math.random() - 0.5) * b[2], y = top ? F.c.y + b[1] * 0.5 + Math.random() * 4 : F.c.y + (Math.random() - 0.5) * b[1];
    F.p[k * 6] = x; F.p[k * 6 + 1] = y; F.p[k * 6 + 2] = z; F.p[k * 6 + 3] = x + 0.18 * F.len; F.p[k * 6 + 4] = y - F.len; F.p[k * 6 + 5] = z; F.v[k] = 24 + Math.random() * 10;
  }
  function makeField(n, box, len, col, op) { var F = { p: new Float32Array(n * 6), v: new Float32Array(n), n: n, box: box, len: len, c: new T.Vector3(0, box[1] / 2, -15) };
    F.g = new T.BufferGeometry(); F.g.setAttribute('position', new T.BufferAttribute(F.p, 3));
    F.m = new T.LineBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false }); F.l = new T.LineSegments(F.g, F.m); F.l.frustumCulled = false; scene.add(F.l);
    for (var k = 0; k < n; k++) drop(F, k, false); return F; }
  var farRain = makeField(small ? 4000 : 7000, [100, 44, 80], 1.0, 0xc9d6e6, 0.45), nearRain = makeField(small ? 700 : 1200, [16, 12, 16], 0.7, 0xe8f0fa, 0.6);
  // splashes: small rings on the ground near the camera
  var ringTex = (function () { var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d'); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 3; x.beginPath(); x.arc(32, 32, 24, 0, Math.PI * 2); x.stroke(); return new T.CanvasTexture(c); })();
  var splashes = [];
  for (i = 0; i < (small ? 40 : 80); i++) {
    var sp = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0, depthWrite: false, color: 0xdfe8f2 }));
    sp.rotation.x = -Math.PI / 2; sp.userData.t = Math.random(); scene.add(sp); splashes.push(sp);
  }
  // low mist in the valley while it rains
  var mist = [];
  (function () {
    var c = document.createElement('canvas'); c.width = 512; c.height = 256; var x = c.getContext('2d');
    for (var k = 0; k < 60; k++) { var px = Math.random() * 512, py = 60 + Math.random() * 136, r = 40 + Math.random() * 60, g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2); }
    var tx = new T.CanvasTexture(c); tx.wrapS = T.RepeatWrapping;
    [[2.2, -6, 150], [3.4, -26, 170], [5, -46, 200]].forEach(function (m, k) {
      var mat = new T.MeshBasicMaterial({ map: tx.clone(), transparent: true, depthWrite: false, opacity: 0.2, color: 0xd4dbe4 }); mat.map.needsUpdate = true;
      var pl = new T.Mesh(new T.PlaneGeometry(m[2], 24), mat); pl.position.set(0, m[0], m[1]); pl.rotation.x = -0.12; scene.add(pl); mist.push({ m: pl, s: 0.004 + k * 0.002 });
    });
  })();

  // ---------- grass and flowers that grow ----------
  var GN = small ? 1800 : 2600, grassGeo = new T.ConeGeometry(0.05, 0.6, 3); grassGeo.translate(0, 0.3, 0);
  var grass = new T.InstancedMesh(grassGeo, new T.MeshStandardMaterial({ color: 0x4f9a3e, roughness: 1 }), GN);
  var FN = 180, flowers = new T.InstancedMesh(new T.SphereGeometry(0.06, 6, 4), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), FN);
  var gPos = [], fPos = [], dummy = new T.Object3D(), fcol = [0xe8c547, 0xffffff, 0xd9534f, 0xb57edc];
  function scatter() {
    gPos = []; fPos = [];
    var spots = [[0, 0, 4.5], [-7, -5, 3.5], [6, -8, 4.5], [-13, 3, 3.5], [11, 2, 3.5], [-3, -14, 4.5], [15, -16, 3.5], [4, -20, 8]];
    function blocked(x, z) { for (var q = 0; q < spots.length; q++) if (Math.abs(x - spots[q][0]) < spots[q][2] && Math.abs(z - spots[q][1]) < spots[q][2]) return true; return false; }
    var r = 1; function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    while (gPos.length < GN) { var ax = (rnd() - 0.5) * 60, az = rnd() * 30 - 16; if (blocked(ax, az)) continue; gPos.push([ax, hill(ax, az), az, rnd() * Math.PI, 0.6 + rnd() * 0.8]); }
    while (fPos.length < FN) { var fx = (rnd() - 0.5) * 50, fz = rnd() * 26 - 14; if (blocked(fx, fz)) continue; fPos.push([fx, hill(fx, fz), fz]); }
    for (var k = 0; k < FN; k++) flowers.setColorAt(k, new T.Color(fcol[k % 4]));
  }
  scatter(); grass.receiveShadow = true; scene.add(grass); scene.add(flowers);
  var DRY = new T.Color(0x9a8255), GREEN = new T.Color(0x5f8a45), rainAmt = 0.7, grow = 1, wetMats = [], terrainMat = null;
  function setGrow(g) {
    grow = g; groundMat.color.copy(DRY).lerp(GREEN, g);
    if (terrainMat) terrainMat.color.setRGB(1, 1, 1).lerp(new T.Color(0xc9b27a), 1 - g);
    for (var k = 0; k < GN; k++) { var p = gPos[k], s = Math.max(0.001, g * p[4]); dummy.position.set(p[0], p[1], p[2]); dummy.rotation.set(0, p[3], 0); dummy.scale.set(1, s, 1); dummy.updateMatrix(); grass.setMatrixAt(k, dummy.matrix); }
    var fg = Math.max(0, (g - 0.6) / 0.4);
    for (k = 0; k < FN; k++) { var q = fPos[k]; dummy.position.set(q[0], q[1] + 0.45 * fg, q[2]); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(Math.max(0.001, fg)); dummy.updateMatrix(); flowers.setMatrixAt(k, dummy.matrix); }
    grass.instanceMatrix.needsUpdate = true; flowers.instanceMatrix.needsUpdate = true; requestRender();
  }
  function setRain(a) {
    rainAmt = a;
    farRain.l.visible = nearRain.l.visible = a > 0.02; farRain.m.opacity = 0.12 + a * 0.45; nearRain.m.opacity = 0.15 + a * 0.5;
    farRain.g.setDrawRange(0, Math.floor(farRain.n * a) * 2); nearRain.g.setDrawRange(0, Math.floor(nearRain.n * a) * 2);
    var clear = 1 - a, grey = 0.22 + clear * 0.78;
    skyU.top.value.setRGB(0.22 * grey + 0.12, 0.36 * grey + 0.14, 0.56 * grey + 0.2); skyU.bot.value.setRGB(0.55 * grey + 0.3, 0.62 * grey + 0.3, 0.68 * grey + 0.3);
    skyU.glow.value.setRGB(1, 0.86, 0.62).multiplyScalar(Math.max(0, clear - 0.6) * 2.2);
    scene.fog.color.copy(skyU.bot.value); scene.fog.density = 0.006 + a * 0.012;
    clouds.forEach(function (c) { c.material.opacity = 0.2 + a * 0.75; c.material.color.setScalar(c.userData.low ? 0.4 + clear * 0.5 : 0.5 + clear * 0.45); });
    sunL.intensity = 0.25 + clear * 1.35; hemi.intensity = 0.45 + clear * 0.35; sunL.castShadow = clear > 0.35;
    sunSpr.visible = sunStreak.visible = a < 0.3; sunSpr.material.opacity = sunStreak.material.opacity = Math.max(0, 0.3 - a) / 0.3;
    mist.forEach(function (m) { m.m.material.opacity = 0.05 + a * 0.3; });
    var wet = Math.min(1, a * 1.6);
    wetMats.forEach(function (w) { w.m.color.copy(w.c).multiplyScalar(1 - wet * 0.28); w.m.roughness = w.r * (1 - wet * 0.45); });
    renderer.toneMappingExposure = 1.05 + clear * 0.3;
    requestRender();
  }

  // ---------- the realistic village (models/gjumi-village.json, made in Blender) ----------
  K.model('models/gjumi-village.json', function (g) {
    var world = g.scene; K.trees(world, scene, ['TreePine1', 'TreePine2', 'TreeOak']);
    world.traverse(function (o) {
      if (!o.isMesh) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
        if (wetMats.some(function (w) { return w.m === m; })) return;
        wetMats.push({ m: m, c: m.color.clone(), r: m.roughness });
        if (o.name === 'Terrain') terrainMat = m;
      });
    });
    var hfn = K.heights(world); if (hfn) { hill = hfn; scatter(); }
    scene.remove(simple); scene.add(world);
    setGrow(grow); setRain(rainAmt);
  });

  // ---------- shots ----------
  var VIEWS = [
    { pos: [-14, 7, 24], at: [0, 6, -20], rain: null, grow: 1, fov: 44, move: [3, 0.6, -2] },
    { pos: [6, 3.2, 12], at: [0, 1, -2], rain: 0.35, grow: 1, fov: 40, move: [-1, 0.2, -1.2] },
    { pos: [-6, 4, 14], at: [2, 0.5, -4], rain: 0.2, grow: null, fov: 42, move: [1.2, 0.2, -1] },
    { pos: [12, 7, 22], at: [0, 4, -16], rain: 0.6, grow: 1, fov: 46, move: [-2.5, 0.4, -1.5] },
    { pos: [2.4, 2.6, 9.5], at: [0, 2.2, 0], rain: 0.4, grow: 1, fov: 36, move: [0.4, 0, -0.6] },
    { pos: [-12, 5, 20], at: [6, 5, -40], rain: 0, grow: 1, fov: 42, move: [2, 0.6, -1.5] }
  ];
  var rainIn = document.getElementById('shRain'), growIn = document.getElementById('shGrow'), current = -1;
  function go(i) {
    if (i === current) return;
    var first = current < 0; current = i; var v = VIEWS[i];
    if (first) cam.cut(v.pos, v.at, v.fov); else cam.go(v.pos, v.at, v.fov, v.move);
    if (first) cam.go(v.pos, v.at, v.fov, v.move, true);
    setRain(v.rain == null ? (rainIn ? +rainIn.value : 0.7) : v.rain);
    setGrow(v.grow == null ? (growIn ? +growIn.value : 0) : v.grow);
    film.chapter(i); requestRender();
  }
  if (rainIn) rainIn.addEventListener('input', function () { if (current === 0) setRain(+rainIn.value); });
  if (growIn) growIn.addEventListener('input', function () { if (current === 2) setGrow(+growIn.value); });
  function pick() {
    var mid = window.innerHeight * (window.innerWidth >= 860 ? 0.5 : 0.72), best = 0, bestD = Infinity;
    steps.forEach(function (s, k) { var r = s.getBoundingClientRect(); var d = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0; if (d < bestD) { bestD = d; best = k; } });
    go(+steps[best].getAttribute('data-scene'));
  }
  window.addEventListener('scroll', pick, { passive: true });
  function resize() { var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; cam.lens(w / h); requestRender(); }
  window.addEventListener('resize', resize);
  var visible = true, pending = false, last = performance.now();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) requestRender(); }).observe(stage);
  function requestRender() { if (!pending) { pending = true; requestAnimationFrame(frame); } }
  function fall(F, dt, follow) {
    if (follow) F.c.set(camera.position.x, camera.position.y, camera.position.z - 4);
    var n = Math.floor(F.n * rainAmt), p = F.p, b = F.box;
    for (var k = 0; k < n; k++) {
      var dy = F.v[k] * dt; p[k * 6 + 1] -= dy; p[k * 6 + 4] -= dy; p[k * 6] += dy * 0.18; p[k * 6 + 3] += dy * 0.18;
      if (p[k * 6 + 4] < F.c.y - b[1] * 0.5 || p[k * 6 + 4] < -2) drop(F, k, true);
    }
    F.g.attributes.position.needsUpdate = true;
  }
  function frame(now) {
    pending = false; var dt = Math.min(0.05, (now - last) / 1000); last = now; var t = now / 1000;
    cam.update(dt, now); film.run();
    if (!reduce) {
      if (farRain.l.visible) { fall(farRain, dt, false); fall(nearRain, dt, true); }
      clouds.forEach(function (c) { c.position.x += dt * c.userData.v * (c.userData.low ? 1.8 : 1.1); if (c.position.x > 130) c.position.x = -130; });
      mist.forEach(function (m) { m.m.material.map.offset.x = (t * m.s) % 1; });
      splashes.forEach(function (s) {
        s.userData.t += dt * 2.2;
        if (s.userData.t > 1) { s.userData.t = 0; var x = camera.position.x + (Math.random() - 0.5) * 18, z = camera.position.z - 2 - Math.random() * 14; s.position.set(x, hill(x, z) + 0.05, z); }
        var q = s.userData.t, sc = 0.1 + q * 0.6; s.scale.set(sc, sc, 1); s.material.opacity = (1 - q) * 0.6 * Math.min(1, rainAmt * 2);
      });
    }
    renderer.render(scene, camera);
    if (visible && !document.hidden && (cam.moving() || !reduce)) requestRender();
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) requestRender(); });
  resize(); pick(); if (current < 0) go(0);
})();
