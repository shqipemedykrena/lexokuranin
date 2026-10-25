/* Ikre: "Gjumi, një shenjë e Allahut". One three.js scene of an Albanian village; each step is a film shot:
   it sets the time of day, the camera, the lens and a slow camera move. Cinematic layer: tone mapping, soft
   shadows from sun and moon, valley mist, chimney smoke, window glow, lens streaks, letterbox, grain, vignette.
   Previous version: build/backup/gjumi3d.v90.js */
(function () {
  var root = document.getElementById('pse');
  var stage = document.getElementById('pseStage');
  var canvas = document.getElementById('pseCanvas');
  if (!root || !stage || !canvas) return;
  var steps = Array.prototype.slice.call(root.querySelectorAll('.pse-step'));
  function noGL() { document.documentElement.classList.add('pse-no3d'); }
  if (!window.THREE) { noGL(); return; }
  var T = window.THREE;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = Math.min(window.innerWidth, window.innerHeight) < 700;
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (e) { noGL(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(45, 1, 0.1, 900);
  scene.fog = new T.FogExp2(0x0a1024, 0.011);

  // ---------- film overlay: letterbox, chapter card, time code, vignette, grain ----------
  function div(c, p) { var d = document.createElement('div'); d.className = c; (p || stage).appendChild(d); return d; }
  stage.classList.add('gj-cine');
  div('gj-vig'); var grain = div('gj-grain');
  var barT = div('gj-bar gj-bar-t'), barB = div('gj-bar gj-bar-b');
  var chap = div('gj-chap', barT), tc = div('gj-tc', barB);
  (function () { // grain texture, made once
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'), d = x.createImageData(128, 128);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); grain.style.backgroundImage = 'url(' + c.toDataURL() + ')';
  })();
  requestAnimationFrame(function () { stage.classList.add('gj-in'); });

  // ---------- sky dome ----------
  var skyU = { top: { value: new T.Color(0x05070f) }, bot: { value: new T.Color(0x1d2a4a) }, glow: { value: new T.Color(0x000000) }, sunDir: { value: new T.Vector3(0, -1, 0) } };
  var sky = new T.Mesh(new T.SphereGeometry(400, 32, 16), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, uniforms: skyU, fog: false,
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; uniform vec3 glow; uniform vec3 sunDir; varying vec3 vp;' +
      'void main(){ float k = smoothstep(-0.05, 0.55, vp.y); vec3 c = mix(bot, top, k);' +
      ' float s = max(dot(vp, normalize(sunDir)), 0.0); c += glow * (pow(s, 6.0) * 0.9 + pow(s, 64.0) * 0.6) * (1.0 - k * 0.6);' +
      ' gl_FragColor = vec4(c, 1.0); }'
  }));
  scene.add(sky);
  function starLayer(n, size) {
    var g = new T.BufferGeometry(), p = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var u = Math.random() * 0.95 + 0.05, th = Math.random() * Math.PI * 2, r = 380, s = Math.sqrt(1 - u * u);
      p[i * 3] = r * s * Math.cos(th); p[i * 3 + 1] = r * u; p[i * 3 + 2] = r * s * Math.sin(th);
    }
    g.setAttribute('position', new T.BufferAttribute(p, 3));
    var m = new T.PointsMaterial({ color: 0xffffff, size: size, sizeAttenuation: false, transparent: true, opacity: 0.9, fog: false, depthWrite: false });
    var pts = new T.Points(g, m); scene.add(pts); return pts;
  }
  var stars = starLayer(1500, 1.4), stars2 = starLayer(260, 2.4);

  function glowTex(inner, outer, w, h) {
    var c = document.createElement('canvas'); c.width = w || 128; c.height = h || 128;
    var x = c.getContext('2d'), g = x.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
    g.addColorStop(0, inner); g.addColorStop(0.3, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); return new T.CanvasTexture(c);
  }
  function spr(tex, sx, sy, add) {
    var s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, blending: add ? T.AdditiveBlending : T.NormalBlending }));
    s.scale.set(sx, sy, 1); scene.add(s); return s;
  }
  var sunSpr = spr(glowTex('rgba(255,250,230,1)', 'rgba(255,200,120,.55)'), 60, 60);
  var moonSpr = spr(glowTex('rgba(255,253,240,1)', 'rgba(220,225,255,.35)'), 26, 26);
  var moonHalo = spr(glowTex('rgba(170,190,255,.35)', 'rgba(120,140,220,.12)'), 120, 120, true);
  var streakTex = glowTex('rgba(255,255,255,.9)', 'rgba(160,190,255,.25)');
  var sunStreak = spr(streakTex, 260, 5, true), moonStreak = spr(streakTex, 150, 3, true);

  // ---------- lights ----------
  var hemi = new T.HemisphereLight(0x9fb7ff, 0x2b2118, 0.4); scene.add(hemi);
  function dirLight(col, map) {
    var l = new T.DirectionalLight(col, 1); l.castShadow = true;
    l.shadow.mapSize.set(map, map); var sc = l.shadow.camera; sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 260;
    l.shadow.bias = -0.0008; l.shadow.radius = 3; l.target.position.set(0, 0, -6); scene.add(l); scene.add(l.target); return l;
  }
  var sunL = dirLight(0xfff1dc, small ? 1024 : 2048);
  var moonL = dirLight(0x8aa0ff, 1024);
  var lamp = new T.PointLight(0xffb45c, 0, 14, 2); lamp.position.set(0, 2.2, 2.2); scene.add(lamp);

  // ---------- simple world (shown until the Blender model has loaded, and kept if it cannot load) ----------
  var simple = new T.Group(); scene.add(simple);
  // ---------- ground: hills and mountains ----------
  function hill(x, z) { return Math.sin(x * 0.08) * 1.4 + Math.cos(z * 0.06) * 1.1 + Math.sin((x + z) * 0.15) * 0.4; }
  var gGeo = new T.PlaneGeometry(260, 260, 120, 120); gGeo.rotateX(-Math.PI / 2);
  var gp = gGeo.attributes.position, i;
  for (i = 0; i < gp.count; i++) { var gx = gp.getX(i), gz = gp.getZ(i); var y = hill(gx, gz); if (gz < -50) y += (-gz - 50) * 0.35 * (0.6 + 0.4 * Math.sin(gx * 0.05)); gp.setY(i, y); }
  gGeo.computeVertexNormals();
  var ground = new T.Mesh(gGeo, new T.MeshStandardMaterial({ color: 0x5f7a45, roughness: 1 })); ground.receiveShadow = true; simple.add(ground);
  var mt = new T.MeshStandardMaterial({ color: 0x55606e, roughness: 1, flatShading: true });
  var snow = new T.MeshStandardMaterial({ color: 0xeef2f6, roughness: 1, flatShading: true });
  [[-70, -120, 38], [-20, -140, 52], [35, -125, 44], [85, -110, 36], [130, -135, 48], [-120, -115, 34]].forEach(function (m) {
    var c = new T.Mesh(new T.ConeGeometry(m[2] * 0.9, m[2], 6), mt); c.position.set(m[0], m[2] / 2 - 2, m[1]); simple.add(c);
    var cap = new T.Mesh(new T.ConeGeometry(m[2] * 0.25, m[2] * 0.28, 6), snow); cap.position.set(m[0], m[2] - 2 - m[2] * 0.14 + 0.2, m[1]); simple.add(cap);
  });
  function shade(o) { o.traverse(function (n) { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } }); }

  // ---------- village: stone kulla houses, a mosque, trees ----------
  var stone = new T.MeshStandardMaterial({ color: 0xcdbfa8, roughness: 0.95 });
  var roofM = new T.MeshStandardMaterial({ color: 0x8a4b32, roughness: 0.9 });
  var winMats = [], chimneys = [], glowTexW = glowTex('rgba(255,200,120,.9)', 'rgba(255,170,80,.25)');
  function house(x, z, rot, s, chim) {
    var g = new T.Group(); g.position.set(x, hill(x, z), z); g.rotation.y = rot; g.scale.setScalar(s);
    var b = new T.Mesh(new T.BoxGeometry(2.4, 3, 2.4), stone); b.position.y = 1.5; g.add(b);
    var rf = new T.Mesh(new T.ConeGeometry(2.1, 1.1, 4), roofM); rf.position.y = 3.55; rf.rotation.y = Math.PI / 4; g.add(rf);
    if (chim) { var ch = new T.Mesh(new T.BoxGeometry(0.35, 1, 0.35), stone); ch.position.set(0.6, 3.9, -0.4); g.add(ch); }
    for (var k = 0; k < 2; k++) {
      var wm = new T.MeshStandardMaterial({ color: 0x2a2018, emissive: 0xffc46b, emissiveIntensity: 0 });
      var w = new T.Mesh(new T.PlaneGeometry(0.42, 0.55), wm); w.position.set(-0.55 + k * 1.1, 2.1, 1.21); g.add(w);
      var halo = new T.Sprite(new T.SpriteMaterial({ map: glowTexW, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 }));
      halo.scale.set(1.6, 1.6, 1); halo.position.set(-0.55 + k * 1.1, 2.1, 1.35); g.add(halo);
      winMats.push({ m: wm, hs: [halo], off: Math.random() });
    }
    shade(g); simple.add(g);
    if (chim) { g.updateMatrixWorld(true); var wp = new T.Vector3(0.6, 4.45, -0.4).applyMatrix4(g.matrixWorld); chimneys.push(wp); }
    return g;
  }
  house(0, 0, 0.15, 1, true);
  house(-7, -5, 0.6, 0.9, true); house(6, -8, -0.4, 1.05, false); house(-13, 3, 0.2, 0.85, false); house(11, 2, -0.7, 0.9, true); house(-3, -14, 0.1, 0.95, false); house(15, -16, 0.3, 0.8, false);
  (function mosque() {
    var x = 4, z = -20, g = new T.Group(); g.position.set(x, hill(x, z), z);
    var body = new T.Mesh(new T.BoxGeometry(5, 3, 5), stone); body.position.y = 1.5; g.add(body);
    var dome = new T.Mesh(new T.SphereGeometry(2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0x8f9aa6, roughness: 0.6 })); dome.position.y = 3; g.add(dome);
    var min = new T.Mesh(new T.CylinderGeometry(0.35, 0.4, 9, 12), stone); min.position.set(3.2, 4.5, 1.2); g.add(min);
    var cap = new T.Mesh(new T.ConeGeometry(0.45, 1.6, 12), new T.MeshStandardMaterial({ color: 0x8f9aa6 })); cap.position.set(3.2, 9.8, 1.2); g.add(cap);
    var bal = new T.Sprite(new T.SpriteMaterial({ map: glowTexW, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 }));
    bal.scale.set(2.2, 2.2, 1); bal.position.set(3.2, 8.2, 1.2); g.add(bal); winMats.push({ m: null, hs: [bal], off: 0, mosque: true });
    shade(g); simple.add(g);
  })();
  var treeM = new T.MeshStandardMaterial({ color: 0x2f5a35, roughness: 1, flatShading: true });
  var trunkM = new T.MeshStandardMaterial({ color: 0x5a3e2b });
  for (i = 0; i < 70; i++) {
    var tx = (Math.random() - 0.5) * 120, tz = -Math.random() * 60 + 20;
    if (Math.abs(tx) < 18 && tz > -22 && tz < 6) continue;
    var tg = new T.Group(); tg.position.set(tx, hill(tx, tz), tz);
    var tr = new T.Mesh(new T.CylinderGeometry(0.12, 0.16, 0.8, 6), trunkM); tr.position.y = 0.4; tg.add(tr);
    var cn = new T.Mesh(new T.ConeGeometry(0.9 + Math.random() * 0.5, 2.6 + Math.random(), 7), treeM); cn.position.y = 2; tg.add(cn);
    tg.rotation.y = Math.random() * 6; shade(tg); simple.add(tg);
  }

  // ---------- atmosphere: valley mist, chimney smoke, floating dust ----------
  function cloudTex(n, r) {
    var c = document.createElement('canvas'); c.width = 512; c.height = 256; var x = c.getContext('2d');
    for (var k = 0; k < n; k++) {
      var px = Math.random() * 512, py = 60 + Math.random() * 136, rr = r * (0.5 + Math.random());
      var g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
    }
    var t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; return t;
  }
  var mist = [], mistTex = cloudTex(70, 70);
  [[2.4, -6, 140], [3.6, -24, 160], [5.2, -42, 190], [1.6, 10, 120]].forEach(function (m, k) {
    var mat = new T.MeshBasicMaterial({ map: mistTex.clone(), transparent: true, depthWrite: false, opacity: 0.3, color: 0xc8d2e8 });
    mat.map.needsUpdate = true; mat.map.repeat.set(1.5, 1);
    var pl = new T.Mesh(new T.PlaneGeometry(m[2], 26), mat); pl.position.set(0, m[0], m[1]); pl.rotation.x = -0.12; scene.add(pl);
    mist.push({ mesh: pl, speed: 0.004 + k * 0.002 });
  });
  var smokeTex = glowTex('rgba(235,235,240,.55)', 'rgba(220,220,230,.22)'), smoke = [];
  function makeSmoke(list, per) {
    smoke.forEach(function (p) { scene.remove(p.s); }); smoke = [];
    list.forEach(function (c) {
      for (var k = 0; k < per; k++) {
        var s = new T.Sprite(new T.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0, color: 0xb9bcc6 }));
        scene.add(s); smoke.push({ s: s, o: c, t: k / per + Math.random() * 0.02 });
      }
    });
  }
  makeSmoke(chimneys, 14);
  var dustN = small ? 120 : 220, dustG = new T.BufferGeometry(), dp = new Float32Array(dustN * 3), dseed = [];
  for (i = 0; i < dustN; i++) { dp[i * 3] = (Math.random() - 0.5) * 30; dp[i * 3 + 1] = Math.random() * 8; dp[i * 3 + 2] = (Math.random() - 0.5) * 30; dseed.push(Math.random() * 6.28); }
  dustG.setAttribute('position', new T.BufferAttribute(dp, 3));
  var dustM = new T.PointsMaterial({ color: 0xffe2b0, size: 0.09, map: glowTex('rgba(255,255,255,1)', 'rgba(255,255,255,.35)'), transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending });
  var dust = new T.Points(dustG, dustM); scene.add(dust);

  // ---------- the realistic village made in Blender (models/gjumi-village.json) ----------
  function detail(m) { // fine grass and rock grain on top of the terrain photo-texture, so the ground stays sharp close up
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d'), d = x.createImageData(256, 256);
    for (var i = 0; i < d.data.length; i += 4) { var v = 118 + Math.random() * 20; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); x.globalAlpha = 0.35;
    for (i = 0; i < 1400; i++) { var px = Math.random() * 256, py = Math.random() * 256, l = 3 + Math.random() * 6; x.strokeStyle = Math.random() < 0.5 ? '#9a9a9a' : '#6a6a6a'; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() - 0.5) * 3, py - l); x.stroke(); }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
    m.onBeforeCompile = function (sh) {
      sh.uniforms.detailMap = { value: t };
      sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= texture2D(detailMap, vUv * 110.0).rgb * 1.9;');
    };
    m.needsUpdate = true;
  }
  (function loadVillage() {
    if (!T.GLTFLoader) return;
    var sc = document.querySelector('script[src*="gjumi3d.js"]'), base = sc ? sc.getAttribute('src').replace('gjumi3d.js', '') : '';
    new T.GLTFLoader().load(base + 'models/gjumi-village.json', function (g) {
      var world = g.scene, byHouse = {}, newWin = [], newChim = [], protos = {}, treeData = null, balcony = null;
      world.traverse(function (o) {
        if (o.isMesh) {
          o.castShadow = true; o.receiveShadow = true;
          var ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach(function (m) {
            if (m.map) { m.map.encoding = T.LinearEncoding; m.map.anisotropy = 4; m.needsUpdate = true; }
            if (/^Window/.test(m.name)) {
              var id = m.name === 'WindowM' ? 'M' : m.name.split('.')[1];
              if (!byHouse[id]) { byHouse[id] = { m: m, hs: [], off: Math.random(), mosque: id === 'M' }; newWin.push(byHouse[id]); }
              m.emissive = new T.Color(0xffa648); m.emissiveIntensity = 0;
            }
          });
        }
        if (o.isMesh && o.name === 'Terrain') detail(o.material);
        if (/^TreePine1$|^TreePine2$|^TreeOak$/.test(o.name)) protos[o.name] = o;
        if (o.name === 'TreeData') treeData = o.userData && o.userData.trees;
        if (/^Chimney\./.test(o.name)) newChim.push(o);
        if (o.name === 'MinaretBalcony') balcony = o;
      });
      world.updateMatrixWorld(true);
      world.traverse(function (o) {
        var m = /^Glow(M)?\.?([A-Z0-9]*)\./.exec(o.name); if (!m) return;
        var id = m[1] ? 'M' : m[2], e = byHouse[id]; if (!e) return;
        var h = new T.Sprite(new T.SpriteMaterial({ map: glowTexW, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 }));
        h.scale.set(1.5, 1.5, 1); o.getWorldPosition(h.position); scene.add(h); e.hs.push(h);
      });
      if (balcony && byHouse.M) { var bh = new T.Sprite(new T.SpriteMaterial({ map: glowTexW, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0 })); bh.scale.set(3, 3, 1); balcony.getWorldPosition(bh.position); scene.add(bh); byHouse.M.hs.push(bh); }
      // trees as instanced meshes
      var trees = []; try { trees = JSON.parse(treeData || '[]'); } catch (e) {}
      var names = ['TreePine1', 'TreePine2', 'TreeOak'], dummy = new T.Object3D();
      names.forEach(function (nm, type) {
        var p = protos[nm]; if (!p) return; var list = trees.filter(function (t) { return t[0] === type; }); p.parent.remove(p);
        var parts = []; p.traverse(function (o) { if (o.isMesh) parts.push(o); });
        parts.forEach(function (part) {
          var im = new T.InstancedMesh(part.geometry, part.material, list.length); im.castShadow = true; im.receiveShadow = true;
          list.forEach(function (t, k) { dummy.position.set(t[1], t[2], t[3]); dummy.rotation.set(0, t[5], 0); dummy.scale.setScalar(t[4]); dummy.updateMatrix(); im.setMatrixAt(k, dummy.matrix); });
          scene.add(im);
        });
      });
      scene.remove(simple); scene.add(world);
      winMats.forEach(function (w) { w.hs.forEach(function (h) { if (h.parent) h.parent.remove(h); }); });
      winMats = newWin; chimneys = newChim.map(function (o) { var v = new T.Vector3(); o.getWorldPosition(v); return v; });
      makeSmoke(chimneys, 12);
      stage.classList.add('gj-real');
      setHour(hour);
    }, undefined, function () { /* keep the simple world */ });
  })();

  // ---------- time of day ----------
  var C = {
    nightTop: new T.Color(0x04060d), nightBot: new T.Color(0x16223f),
    dawnTop: new T.Color(0x34507e), dawnBot: new T.Color(0xf7a35c),
    dayTop: new T.Color(0x3f7fd0), dayBot: new T.Color(0xcfe6f7),
    glowDawn: new T.Color(0xff9a4a), glowDay: new T.Color(0xfff2d0),
    mistNight: new T.Color(0x7d8bb0), mistDawn: new T.Color(0xf3c9a0), mistDay: new T.Color(0xe8eef6)
  };
  var hour = 22, lightsFor = null, dayK = 0, dawnK = 0;
  function aim(l, p, d) { var v = p.clone().normalize().multiplyScalar(d); l.position.set(v.x, Math.max(v.y, 6), v.z - 6); }
  function setHour(h) {
    hour = h;
    var a = Math.sin((h - 6) / 12 * Math.PI); // sun altitude -1..1
    var az = (h - 12) / 12 * Math.PI;
    var sx = Math.sin(az) * 300, sy = a * 220, sz = -Math.cos(az) * 120 - 140;
    sunSpr.position.set(sx, sy, sz); sunStreak.position.copy(sunSpr.position);
    moonSpr.position.set(-sx * 0.8, Math.max(-a * 200, -60), -sz * 0.3 - 200); moonHalo.position.copy(moonSpr.position); moonStreak.position.copy(moonSpr.position);
    aim(sunL, sunSpr.position, 120); aim(moonL, moonSpr.position, 120);
    var day = Math.max(0, Math.min(1, a * 2.2 + 0.25)), dawn = Math.max(0, 1 - Math.abs(a) * 5);
    dayK = day; dawnK = dawn;
    var top = C.nightTop.clone().lerp(C.dayTop, day).lerp(C.dawnTop, dawn * 0.6);
    var bot = C.nightBot.clone().lerp(C.dayBot, day).lerp(C.dawnBot, dawn * 0.85);
    skyU.top.value.copy(top); skyU.bot.value.copy(bot); scene.fog.color.copy(bot);
    skyU.sunDir.value.copy(sunSpr.position); skyU.glow.value.copy(C.glowDawn).lerp(C.glowDay, day).multiplyScalar(sy > -30 ? Math.min(1, (sy + 30) / 60) : 0);
    scene.fog.density = 0.010 - day * 0.004 + dawn * 0.001;
    sunL.intensity = Math.max(0, a) * 1.6 + dawn * 0.35; sunL.color.setHex(0xfff1dc).lerp(new T.Color(0xffa860), dawn * 0.8);
    hemi.intensity = 0.16 + day * 0.55;
    moonL.intensity = (1 - day) * 0.42; moonL.castShadow = day < 0.3; sunL.castShadow = a > -0.05;
    stars.material.opacity = Math.max(0, 1 - day * 2.5); stars2.material.opacity = stars.material.opacity;
    sunSpr.visible = sunStreak.visible = sy > -30; moonSpr.visible = moonHalo.visible = moonStreak.visible = a < 0.15;
    sunStreak.material.opacity = 0.35 + dawn * 0.5; moonStreak.material.opacity = 0.35;
    var mc = C.mistNight.clone().lerp(C.mistDay, day).lerp(C.mistDawn, dawn * 0.9);
    mist.forEach(function (m) { m.mesh.material.color.copy(mc); m.mesh.material.opacity = 0.12 + (1 - day) * 0.14 + dawn * 0.12; });
    dustM.color.setHex(day > 0.4 ? 0xfff0d0 : 0xaebcff); dustM.opacity = 0.25 + dawn * 0.4 + (1 - day) * 0.15;
    // window lights: on in the evening, off late at night and in the day
    var lit = 0;
    winMats.forEach(function (w) {
      var on;
      if (lightsFor === 'off') on = w.mosque && h >= 4 && h < 6.5 ? 1 : 0;
      else if (lightsFor === 'on') on = 1;
      else if (w.mosque) on = (h >= 4 && h < 6.5) || (h >= 18 && h < 21) ? 1 : 0;
      else on = (h >= 18.5 + w.off * 1.5 && h < 22.5 + w.off * 1.2) || (h >= 5 && h < 5.6 + w.off * 0.8) ? 1 : 0;
      if (w.m) w.m.emissiveIntensity = on * (w.m.map ? 1.6 : 0.9);
      for (var q = 0; q < w.hs.length; q++) w.hs[q].material.opacity = on * (1 - day) * 0.9;
      lit += on;
    });
    lamp.intensity = lightsFor === 'on' ? 1.4 * (1 - day) : 0;
    tc.textContent = pad(h);
    requestRender();
  }

  // ---------- shots: camera, lens and a slow move for each step ----------
  var VIEWS = [
    { pos: [-14, 6, 22], at: [0, 4, -20], hour: 22.3, fov: 42, move: [3, 0.6, -2] },        // establishing shot, slow crane
    { pos: [10, 5, 18], at: [0, 2, -6], hour: null, fov: 46, move: [-2.5, 0.3, -1.5] },      // night and day: slider
    { pos: [0, 9, 26], at: [0, 6, -30], hour: 1.5, lights: 'off', fov: 50, move: [0, 1.5, -4] }, // the village asleep, stars
    { pos: [1.8, 2.8, 8.4], at: [0, 2, 0], hour: 22.6, lights: 'on', fov: 36, move: [0.3, 0, -0.7] }, // close: the house
    { pos: [-3.2, 3.2, 8.6], at: [0, 2.2, 0], hour: 23.2, lights: 'on', fov: 34, move: [0.6, 0.2, -0.5] },
    { pos: [-12, 5, 20], at: [8, 3, -40], hour: null, fov: 40, move: [2, 0.6, -1.5] }          // waking: dawn
  ];
  var camFrom = new T.Vector3(), camTo = new T.Vector3(), atFrom = new T.Vector3(), atTo = new T.Vector3(), atNow = new T.Vector3(), base = new T.Vector3();
  var fovFrom = 45, fovTo = 45, fovNow = 45, moveT = 1, shotT0 = 0, lensK = 1;
  var hourIn = document.getElementById('gjHour'), hourOut = document.getElementById('gjHourOut');
  var wakeIn = document.getElementById('gjWake'), wakeOut = document.getElementById('gjWakeOut');
  var current = -1;
  function pad(h) { var H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H++; M = 0; } return (H % 24 < 10 ? '0' : '') + (H % 24) + ':' + (M < 10 ? '0' : '') + M; }
  function chapter(i) {
    var h = steps[i] && steps[i].querySelector('h2'); if (!h) return;
    chap.classList.remove('on'); void chap.offsetWidth;
    chap.textContent = (i + 1) + '  ·  ' + h.textContent; chap.classList.add('on');
  }
  function go(i) {
    if (i === current) return;
    var first = current < 0; current = i;
    var v = VIEWS[i];
    camFrom.copy(base.lengthSq() ? base : camera.position); atFrom.copy(atNow); fovFrom = fovNow;
    camTo.set(v.pos[0], v.pos[1], v.pos[2]); atTo.set(v.at[0], v.at[1], v.at[2]); fovTo = v.fov;
    lightsFor = v.lights || null;
    if (v.hour != null) setHour(v.hour);
    else if (i === 1 && hourIn) setHour(+hourIn.value);
    else if (i === 5 && wakeIn) setHour(+wakeIn.value);
    moveT = first || reduce ? 1 : 0; shotT0 = performance.now();
    if (moveT === 1) { base.copy(camTo); atNow.copy(atTo); fovNow = fovTo; }
    chapter(i);
    requestRender();
  }
  if (hourIn) hourIn.addEventListener('input', function () { if (hourOut) hourOut.textContent = pad(+hourIn.value); if (current === 1) setHour(+hourIn.value); });
  if (wakeIn) wakeIn.addEventListener('input', function () { if (wakeOut) wakeOut.textContent = pad(+wakeIn.value); if (current === 5) setHour(+wakeIn.value); });
  if (hourOut && hourIn) hourOut.textContent = pad(+hourIn.value);
  if (wakeOut && wakeIn) wakeOut.textContent = pad(+wakeIn.value);

  function pick() {
    var mid = window.innerHeight * (window.innerWidth >= 860 ? 0.5 : 0.72), best = 0, bestD = Infinity;
    steps.forEach(function (s, k) {
      var r = s.getBoundingClientRect();
      var d = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0;
      if (d < bestD) { bestD = d; best = k; }
    });
    go(+steps[best].getAttribute('data-scene'));
  }
  window.addEventListener('scroll', pick, { passive: true });

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; var asp = w / h; lensK = asp < 1 ? 1.3 : asp < 1.4 ? 1.12 : 1; requestRender();
  }
  window.addEventListener('resize', resize);
  var visible = true, pending = false, t0 = performance.now(), last = t0;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) requestRender(); }).observe(stage);
  function requestRender() { if (!pending) { pending = true; requestAnimationFrame(frame); } }
  function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  var drift = new T.Vector3();
  function frame(now) {
    pending = false;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var t = (now - t0) / 1000;
    if (moveT < 1) { // crane between shots: eased, with a lift in the middle
      moveT = Math.min(1, moveT + dt / 2.6); var e = ease(moveT);
      base.lerpVectors(camFrom, camTo, e); base.y += Math.sin(Math.PI * e) * 2.2; atNow.lerpVectors(atFrom, atTo, e);
      fovNow = fovFrom + (fovTo - fovFrom) * e;
    }
    camera.position.copy(base);
    if (!reduce && current >= 0) { // slow push within the shot, plus a breath of handheld
      var v = VIEWS[current], st = Math.max(0, (now - shotT0) / 1000 - (moveT < 1 ? 0 : 0));
      var k = Math.sin(Math.min(1, st / 26) * Math.PI / 2) * (moveT < 1 ? moveT : 1);
      var osc = Math.sin(st * 0.05) * 0.5 + 0.5;
      drift.set(v.move[0], v.move[1], v.move[2]).multiplyScalar(k * (0.6 + 0.4 * osc));
      camera.position.add(drift);
      camera.position.x += Math.sin(t * 0.7) * 0.018 + Math.sin(t * 1.3) * 0.01;
      camera.position.y += Math.sin(t * 0.9 + 1) * 0.014;
      // living scene
      stars.rotation.y = t * (current === 2 ? 0.012 : 0.003); stars2.rotation.y = stars.rotation.y;
      stars2.material.opacity = stars.material.opacity * (0.75 + 0.25 * Math.sin(t * 2.1));
      mist.forEach(function (m) { m.mesh.material.map.offset.x = (t * m.speed) % 1; });
      smoke.forEach(function (p) {
        var q = (t * 0.06 + p.t) % 1;
        p.s.position.set(p.o.x + q * 2.2 + Math.sin(q * 6 + p.t * 9) * 0.25, p.o.y + q * 6, p.o.z - q * 0.6);
        var sc = 0.5 + q * 2.6; p.s.scale.set(sc, sc, 1);
        p.s.material.opacity = Math.sin(q * Math.PI) * (0.28 + 0.12 * (1 - dayK));
      });
      var pa = dust.geometry.attributes.position;
      for (var j = 0; j < dustN; j++) { pa.array[j * 3 + 1] += Math.sin(t * 0.4 + dseed[j]) * 0.002; pa.array[j * 3] += Math.cos(t * 0.3 + dseed[j]) * 0.002; }
      pa.needsUpdate = true;
    }
    dust.position.set(camera.position.x * 0.6, 0, camera.position.z * 0.6 - 8);
    if (Math.abs(camera.fov - fovNow * lensK) > 0.01) { camera.fov = fovNow * lensK; camera.updateProjectionMatrix(); }
    camera.lookAt(atNow);
    renderer.render(scene, camera);
    if (visible && !document.hidden && (moveT < 1 || !reduce)) requestRender();
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) requestRender(); });
  base.set(-14, 6, 22); camera.position.copy(base); atNow.set(0, 4, -20);
  setHour(22.3); resize(); pick(); if (current < 0) go(0);

  // ---------- tonight's checklist (stored per day in this browser) ----------
  var list = document.getElementById('gjList');
  if (list) {
    var key = 'ikreGjumi', today = new Date().toISOString().slice(0, 10), st = {};
    try { st = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) {}
    if (st.d !== today) st = { d: today, v: {} };
    list.querySelectorAll('input[type=checkbox]').forEach(function (c) {
      c.checked = !!st.v[c.id];
      c.addEventListener('change', function () { st.v[c.id] = c.checked; try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {} });
    });
  }
})();
