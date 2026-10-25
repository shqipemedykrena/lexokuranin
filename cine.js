/* Ikre film kit: the shared "cinematic" layer for every 3D scene on the site.
   - film(stage, steps): letterbox bars, chapter card (from each step's <h2>), time code, vignette, film grain
   - grade(renderer): film tone mapping and soft shadows
   - rig(camera): crane moves between shots, a slow push inside each shot, and a breath of handheld
   - glow(), streak(): soft light sprites and an anamorphic lens streak
   - model(url, onLoad): loads a Blender model (glTF JSON) and prepares its materials for the scene
   Uses window.THREE (r128). Respects prefers-reduced-motion. */
(function () {
  var T = window.THREE; if (!T) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var base = (function () { var s = document.querySelector('script[src*="cine.js"]'); return s ? s.getAttribute('src').replace('cine.js', '') : ''; })();

  function film(stage, steps, opts) {
    opts = opts || {};
    function div(c, p) { var d = document.createElement('div'); d.className = c; (p || stage).appendChild(d); return d; }
    stage.classList.add('gj-cine');
    div('gj-vig'); var grain = div('gj-grain');
    var barT = div('gj-bar gj-bar-t'), barB = div('gj-bar gj-bar-b');
    var chap = div('gj-chap', barT), tc = div('gj-tc', barB);
    if (opts.noRec) tc.classList.add('gj-norec');
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'), d = x.createImageData(128, 128);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); grain.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    requestAnimationFrame(function () { stage.classList.add('gj-in'); });
    var t0 = performance.now(), lastChap = -1;
    return {
      chapter: function (i) {
        if (i === lastChap) return; lastChap = i;
        var h = steps[i] && steps[i].querySelector('h2'); if (!h) return;
        chap.classList.remove('on'); void chap.offsetWidth; chap.textContent = (i + 1) + '  ·  ' + h.textContent; chap.classList.add('on');
      },
      code: function (text) { tc.textContent = text; },
      /* a film time code 00:00:00:00 that runs while the scene plays */
      run: function () { var s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24), p = function (n) { return (n < 10 ? '0' : '') + n; };
        tc.textContent = p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(Math.floor(s) % 60) + ':' + p(f); }
    };
  }

  function grade(renderer, exposure, small) {
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = exposure || 1.2;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  }

  function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function rig(camera, opts) {
    opts = opts || {};
    var base = new T.Vector3(), from = new T.Vector3(), to = new T.Vector3(), at = new T.Vector3(), atFrom = new T.Vector3(), atTo = new T.Vector3();
    var fov = camera.fov, fovFrom = fov, fovTo = fov, k = 1, shot0 = 0, move = [0, 0, 0], lift = opts.lift == null ? 2.2 : opts.lift, dur = opts.dur || 2.6, lens = 1, drift = new T.Vector3();
    var R = {
      cut: function (pos, look, f) { base.fromArray(pos); at.fromArray(look); fov = fovTo = f || fov; k = 1; shot0 = performance.now(); },
      go: function (pos, look, f, mv, instant) {
        from.copy(base); atFrom.copy(at); fovFrom = fov; to.fromArray(pos); atTo.fromArray(look); fovTo = f || fovTo; move = mv || [0, 0, 0];
        k = instant || reduce ? 1 : 0; shot0 = performance.now();
        if (k === 1) { base.copy(to); at.copy(atTo); fov = fovTo; }
      },
      lens: function (aspect) { lens = aspect < 1 ? 1.3 : aspect < 1.4 ? 1.12 : 1; },
      moving: function () { return k < 1; },
      update: function (dt, now) {
        if (k < 1) { k = Math.min(1, k + dt / dur); var e = ease(k); base.lerpVectors(from, to, e); base.y += Math.sin(Math.PI * e) * lift; at.lerpVectors(atFrom, atTo, e); fov = fovFrom + (fovTo - fovFrom) * e; }
        camera.position.copy(base);
        if (!reduce) {
          var st = (now - shot0) / 1000, q = Math.sin(Math.min(1, st / 26) * Math.PI / 2) * (k < 1 ? k : 1), osc = Math.sin(st * 0.05) * 0.5 + 0.5, t = now / 1000;
          drift.set(move[0], move[1], move[2]).multiplyScalar(q * (0.6 + 0.4 * osc)); camera.position.add(drift);
          camera.position.x += Math.sin(t * 0.7) * 0.018 + Math.sin(t * 1.3) * 0.01; camera.position.y += Math.sin(t * 0.9 + 1) * 0.014;
        }
        var f = fov * lens; if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }
        camera.lookAt(at);
      },
      at: at, base: base
    };
    return R;
  }

  function glowTex(inner, outer) {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner); g.addColorStop(0.3, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c);
  }
  function glow(size, inner, outer, add) {
    var s = new T.Sprite(new T.SpriteMaterial({ map: glowTex(inner, outer), transparent: true, depthWrite: false, fog: false, blending: add === false ? T.NormalBlending : T.AdditiveBlending }));
    s.scale.set(size, size, 1); return s;
  }
  function streak(w, h, opacity) {
    var s = new T.Sprite(new T.SpriteMaterial({ map: glowTex('rgba(255,255,255,.9)', 'rgba(160,190,255,.25)'), transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, opacity: opacity == null ? 0.4 : opacity }));
    s.scale.set(w, h, 1); return s;
  }

  function model(url, onLoad, onError) {
    if (!T.GLTFLoader) { if (onError) onError(); return; }
    new T.GLTFLoader().load(base + url, function (g) {
      g.scene.traverse(function (o) {
        if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) { m.map.encoding = T.LinearEncoding; m.map.anisotropy = 4; m.needsUpdate = true; } });
      });
      onLoad(g);
    }, undefined, function () { if (onError) onError(); });
  }
  /* trees stored by Blender as extras on the "TreeData" node: [[type, x, y, z, scale, rotY], ...] -> instanced meshes */
  function trees(world, scene, names) {
    var protos = {}, data = '[]', out = [];
    world.traverse(function (o) { if (names.indexOf(o.name) > -1) protos[o.name] = o; if (o.name === 'TreeData') data = o.userData.trees || '[]'; });
    var list = []; try { list = JSON.parse(data); } catch (e) {}
    var d = new T.Object3D();
    names.forEach(function (nm, type) {
      var p = protos[nm]; if (!p) return; if (p.parent) p.parent.remove(p);
      var mine = list.filter(function (t) { return t[0] === type; }), parts = [];
      p.traverse(function (o) { if (o.isMesh) parts.push(o); });
      parts.forEach(function (part) {
        var im = new T.InstancedMesh(part.geometry, part.material, mine.length); im.castShadow = true; im.receiveShadow = true;
        mine.forEach(function (t, k) { d.position.set(t[1], t[2], t[3]); d.rotation.set(0, t[5], 0); d.scale.setScalar(t[4]); d.updateMatrix(); im.setMatrixAt(k, d.matrix); });
        scene.add(im); out.push(im);
      });
    });
    return out;
  }
  /* ground height from the "HeightData" node (a small grid the Blender script stores), so things can stand on the terrain */
  function heights(world) {
    var node = null; world.traverse(function (o) { if (o.name === 'HeightData') node = o; }); if (!node) return null;
    var u = node.userData, n = u.n, size = u.size, cz = u.cz || 0, lo = u.min, hi = u.max, raw = atob(u.data), H = new Float32Array(n * n);
    for (var i = 0; i < n * n; i++) H[i] = lo + (raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8)) / 65535 * (hi - lo);
    return function (x, z) {
      var fx = (x + size / 2) / size * (n - 1), fz = (z - cz + size / 2) / size * (n - 1);
      fx = Math.max(0, Math.min(n - 1.001, fx)); fz = Math.max(0, Math.min(n - 1.001, fz));
      var ix = Math.floor(fx), iz = Math.floor(fz), ax = fx - ix, az = fz - iz, a = H[iz * n + ix], b = H[iz * n + ix + 1], c = H[(iz + 1) * n + ix], dd = H[(iz + 1) * n + ix + 1];
      return (a * (1 - ax) + b * ax) * (1 - az) + (c * (1 - ax) + dd * ax) * az;
    };
  }
  window.IkreCine = { film: film, grade: grade, rig: rig, glow: glow, glowTex: glowTex, streak: streak, model: model, trees: trees, heights: heights, reduce: reduce };
})();
