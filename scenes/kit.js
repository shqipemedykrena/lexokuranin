/* Shared helpers for the Ikre live scenes (loaded by cinema.js before a scene). */
(function () {
  var T = window.THREE, K = window.IkreCine;
  function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function seg(p, a, b) { return ease((p - a) / (b - a)); }
  function V(x, y, z) { return [x, z, -y]; }                // Blender (z up) to three.js (y up)
  function stars(sc, n, r) {
    var sp = []; r = r || 900;
    for (var i = 0; i < (n || 1400); i++) { var th = Math.random() * Math.PI * 2, ph = 0.04 + Math.random() * 0.48 * Math.PI; sp.push(Math.cos(th) * Math.cos(ph) * r, Math.sin(ph) * r, Math.sin(th) * Math.cos(ph) * r); }
    var m = new T.PointsMaterial({ size: 1.4, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false });
    var s = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(sp, 3)), m); sc.add(s); return s;
  }
  /* rings of sound: thin glowing rings that grow and fade around a point (a stone greeting, a trunk crying) */
  var ringTex = null;
  function rTex() {
    if (ringTex) return ringTex; var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    var g = x.createRadialGradient(128, 128, 96, 128, 128, 126); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256); return (ringTex = new T.CanvasTexture(c));
  }
  function rings(sc, opts) {
    opts = opts || {}; var list = [], t = 0, R = {
      pos: new T.Vector3(), rate: 0, size: opts.size || 1, life: opts.life || 1.6, color: opts.color || 0xfff0d0, strength: 1,
      update: function (dt) {
        t += dt; if (R.rate > 0 && t > 1 / R.rate) { t = 0; var s = list.find(function (q) { return !q.alive; });
          if (!s) { s = { sp: new T.Sprite(new T.SpriteMaterial({ map: rTex(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: R.color, fog: false })) }; sc.add(s.sp); list.push(s); }
          s.alive = true; s.age = 0; s.sp.position.copy(R.pos); s.sp.material.color.setHex(R.color); }
        list.forEach(function (q) { if (!q.alive) { q.sp.visible = false; return; } q.age += dt; var k = q.age / R.life; if (k >= 1) { q.alive = false; q.sp.visible = false; return; }
          q.sp.visible = true; var s = R.size * (0.15 + k * 1.6); q.sp.scale.set(s, s, 1); q.sp.material.opacity = (1 - k) * 0.85 * R.strength; });
      }
    }; return R;
  }
  /* a water surface that moves: a plane whose vertices follow two travelling waves */
  function water(size, seg, color, opts) {
    opts = opts || {}; var g = new T.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
    var m = new T.MeshStandardMaterial({ color: color, roughness: opts.rough == null ? 0.18 : opts.rough, metalness: 0.15, transparent: !!opts.alpha, opacity: opts.alpha || 1 });
    var w = new T.Mesh(g, m), base = g.attributes.position.array.slice();
    w.amp = opts.amp || 0.4; w.len = opts.len || 6;
    w.wave = function (t) { var A = g.attributes.position; for (var i = 0; i < A.count; i++) { var x = base[i * 3], z = base[i * 3 + 2];
      A.setY(i, (Math.sin(x / w.len + t * 0.9) * 0.6 + Math.sin((x * 0.6 + z) / (w.len * 0.7) + t * 1.3) * 0.4 + Math.sin(z / (w.len * 1.7) - t * 0.7) * 0.3) * w.amp); }
      A.needsUpdate = true; g.computeVertexNormals(); };
    return w;
  }
  function find(root, name) { var o = null; root.traverse(function (q) { if (!o && q.name === name) o = q; }); return o; }
  function wpos(root, name) { var o = find(root, name); return o ? o.getWorldPosition(new T.Vector3()) : new T.Vector3(); }
  /* hold a list of shots per chapter: [[pos], [look], fov, [drift]]; sub-shots inside a chapter by progress */
  function shots(rig, list) {
    var last = '';
    return function (k, p, instant) {
      var c = list[k] || list[0], s = c; if (Array.isArray(c[0][0])) { var n = c.length, j = Math.min(n - 1, Math.floor(p * n)); s = c[j]; }
      var key = k + ':' + s[0].join(','); if (key !== last) { last = key; rig.go(s[0], s[1], s[2] || 40, s[3] || [0, 0, 0], instant); }
    };
  }
  window.IkreKit = { ease: ease, seg: seg, V: V, stars: stars, rings: rings, water: water, find: find, wpos: wpos, shots: shots };
})();
