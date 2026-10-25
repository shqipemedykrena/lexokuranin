/* Live scene: "The challenge" (Quran 17:88, 11:13, 2:23). Models from Blender: models/namaz.json (a man in
   Albanian dress: white shirt, xhamadan, red sash, tirq, plis; in a small mosque room) and models/mk-sfida2.json
   (a wooden rahle and a Quran on hinges, a blank sheet and a reed pen).
   0 he kneels before the closed Quran; 1 the whole Quran (the closed book glows); 2 ten surahs (he opens it, ten
   leaves turn); 3 one surah (one leaf turns, one page glows); 4 the shortest surah, al-Kawthar: its three verses
   rise in gold above the book; 5 the challenge still stands: he looks up and opens his hand to you, the blank
   sheet and the pen beside him stay empty; 6 wide: the Quran remains. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).sfida = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    var ease = X.ease, seg = X.seg;
    sc.background = new T.Color(0x140e0a); sc.fog = new T.FogExp2(0x140e0a, 0.07);
    var hemi = new T.HemisphereLight(0xffeedd, 0x2e1c12, 0.42); sc.add(hemi);
    var win = new T.DirectionalLight(0xffe2b8, 1.3); win.position.set(3.5, 5.5, 2.5); win.target.position.set(0, 0.4, 0.5); win.castShadow = true;
    win.shadow.mapSize.set(1024, 1024); var s = win.shadow.camera; s.left = -2; s.right = 2; s.top = 2; s.bottom = -2; s.near = 1; s.far = 14; win.shadow.bias = -0.0006; win.shadow.normalBias = 0.02;
    sc.add(win, win.target);
    var lamp = new T.PointLight(0xffb070, 1.1, 7, 2); lamp.position.set(0, 2.6, 3); sc.add(lamp);
    var fill = new T.PointLight(0xffd9b0, 0.55, 6, 2); fill.position.set(-1.6, 1.4, 1.6); sc.add(fill);
    var bookLight = new T.PointLight(0xffd690, 0, 2.2, 2); bookLight.position.set(0, 0.6, 0.25); sc.add(bookLight);
    var aura = K.glow(0.9, 'rgba(255,230,170,1)', 'rgba(255,190,90,.25)'); aura.material.opacity = 0; sc.add(aura);
    var J = {}, rest = {}, B = {}, leaves = [], NL = 10;
    var ready = Promise.all([
      new Promise(function (ok) { ctx.model('models/namaz.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) { J[o.name] = o; rest[o.name] = o.position.clone(); } if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); ok(); }, ok); }),
      new Promise(function (ok) { ctx.model('models/mk-sfida2.json', function (g) {
        g.scene.position.z = -0.2; sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) B[o.name] = o; if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
        var lh = B.LeafHinge; if (lh) { lh.visible = false; for (var i = 0; i < NL; i++) { var c = lh.clone(true); c.visible = false; lh.parent.add(c); leaves.push(c); }
          var one = lh.clone(true); one.visible = false; lh.parent.add(one); B.One = one;
          one.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); o.material.emissive = new T.Color(0xffc870); o.material.emissiveIntensity = 0; } }); }
        if (B.HingeR) B.hR0 = B.HingeR.position.clone();
        if (B.Book) B.book0 = B.Book.position.clone();
        ok(); }, ok); })
    ]);
    // ---------- the three verses of al-Kawthar as gold text planes (drawn on canvas) ----------
    var arFont = (function () { var e = document.querySelector('.ar,[lang="ar"]'); var f = e ? getComputedStyle(e).fontFamily : ''; return f || '"Amiri Quran", "Amiri", "Scheherazade New", serif'; })();
    function textPlane(str, w) {
      var c = document.createElement('canvas'); c.width = 1024; c.height = 192; var x = c.getContext('2d');
      x.clearRect(0, 0, 1024, 192); x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'middle';
      var size = 96; x.font = size + 'px ' + arFont; while (x.measureText(str).width > 980 && size > 40) { size -= 4; x.font = size + 'px ' + arFont; }
      x.shadowColor = 'rgba(255,190,80,.9)'; x.shadowBlur = 26; x.fillStyle = '#ffe3a0'; x.fillText(str, 512, 100);
      x.shadowBlur = 0; var g = x.createLinearGradient(0, 40, 0, 160); g.addColorStop(0, '#fff6d6'); g.addColorStop(1, '#f0c25a'); x.fillStyle = g; x.fillText(str, 512, 100);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
      var m = new T.Mesh(new T.PlaneGeometry(w, w * 192 / 1024), new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false }));
      m.rotation.y = Math.PI; sc.add(m); return m;   // faces the reader's side (-Z) where the camera is in chapter 4
    }
    var AR = (L.ar || []).map(function (a) { return textPlane(a, 0.9); });
    var nCount = ctx.label('');
    // ---------- poses (same joint set as the "How to pray" scene) ----------
    var Z0 = { y: 0.98, z: 0, x: 0, spine: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0],
      shL: [0, 0, 0.07], elL: [-0.1, 0, 0], wrL: [0, 0, 0], shR: [0, 0, -0.07], elR: [-0.1, 0, 0], wrR: [0, 0, 0],
      hpL: [0, 0, 0.02], knL: [0, 0, 0], anL: [0, 0, 0], hpR: [0, 0, -0.02], knR: [0, 0, 0], anR: [0, 0, 0] };
    function P(o) { var r = JSON.parse(JSON.stringify(Z0)); for (var k in o) r[k] = o[k]; return r; }
    var KNEEL = { y: 0.22, z: -0.32, hpL: [-1.52, 0, 0.12], knL: [2.95, 0, 0], anL: [0.6, 0, 0], hpR: [-1.52, 0, -0.12], knR: [2.95, 0, 0], anR: [-0.3, 0, 0] };
    function KP(o) { var r = P(KNEEL); for (var k in o) r[k] = o[k]; return r; }
    var POSE = {
      rest: KP({ spine: [0.1, 0, 0], neck: [0.25, 0, 0], shL: [-0.5, 0, 0.1], elL: [-0.9, 0, 0], wrL: [0.3, 0, 0], shR: [-0.5, 0, -0.1], elR: [-0.9, 0, 0], wrR: [0.3, 0, 0] }),
      hold: KP({ spine: [0.42, 0, 0], neck: [0.3, 0, 0], head: [0.1, 0, 0], shL: [-0.55, 0, 0.2], elL: [-0.35, 0, 0], wrL: [0.4, 0, 0], shR: [-0.55, 0, -0.2], elR: [-0.35, 0, 0], wrR: [0.4, 0, 0] }),
      read: KP({ spine: [0.36, 0, 0], neck: [0.34, 0, 0], head: [0.14, 0, 0], shL: [-0.5, 0, 0.26], elL: [-0.4, 0, 0], wrL: [0.4, 0, 0], shR: [-0.5, 0, -0.26], elR: [-0.4, 0, 0], wrR: [0.4, 0, 0] }),
      look: KP({ spine: [0.05, 0, 0], neck: [-0.05, 0, 0], head: [-0.05, 0, 0], shL: [-0.5, 0, 0.1], elL: [-0.9, 0, 0], wrL: [0.3, 0, 0], shR: [-1.15, 0.35, -0.35], elR: [-0.75, 0, 0], wrR: [-0.5, 0, 0] })
    };
    var SEQ = [[[0, 'rest']], [[0, 'rest'], [0.35, 'hold']], [[0, 'hold'], [0.25, 'read']], [[0, 'read']], [[0, 'read']], [[0, 'read'], [0.25, 'look']], [[0, 'look'], [0.5, 'rest']]];
    var MAP = { spine: 'Spine', neck: 'Neck', head: 'Head', shL: 'ShoulderL', elL: 'ElbowL', wrL: 'WristL', shR: 'ShoulderR', elR: 'ElbowR', wrR: 'WristR',
      hpL: 'HipL', knL: 'KneeL', anL: 'AnkleL', hpR: 'HipR', knR: 'KneeR', anR: 'AnkleR' };
    function at(seq, t) { var a = seq[0], b = seq[0]; for (var i = 0; i < seq.length; i++) if (seq[i][0] <= t) { a = seq[i]; b = seq[i + 1] || seq[i]; }
      var span = (b[0] - a[0]) || 1, f = b === a ? 1 : ease(Math.min(1, (t - a[0]) / Math.min(span, 0.2))); return [POSE[a[1]], POSE[b[1]], b === a ? 0 : f]; }
    function mix(A, Bp, f, out) { ['y', 'z', 'x'].forEach(function (q) { out[q] = A[q] + (Bp[q] - A[q]) * f; });
      for (var key in MAP) { var a = A[key], b = Bp[key]; out[key] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; } return out; }
    var cur = P(KNEEL), tgt = P(KNEEL);
    // ---------- camera: [pos, look, fov, drift]; the man kneels at the origin facing +Z, the book is at z 0.62 ----------
    var SH = [
      [[-1.9, 1.15, 2.2], [0.05, 0.45, 0.35], 36, [0.25, 0, -0.2]],
      [[1.05, 0.85, 1.55], [0, 0.35, 0.3], 32, [-0.12, 0, -0.1]],
      [[-0.5, 1.0, -0.05], [0, 0.26, 0.44], 36, [0.08, 0.02, 0.05]],
      [[0.42, 0.85, 0.02], [0, 0.27, 0.44], 32, [-0.05, 0, 0.03]],
      [[0.38, 1.3, -0.42], [0, 0.82, 0.55], 44, [0.04, 0.03, 0.06]],
      [[1.0, 1.05, 2.5], [0.05, 0.5, 0.2], 36, [-0.15, 0, -0.2]],
      [[1.9, 1.7, 3.0], [0, 0.45, 0.3], 40, [-0.3, 0.2, 0.4]]
    ];
    var k = 0, p = 0, playing = false, lastK = -1;
    function chapter(i, instant) { lastK = i; k = i; var q = SH[i] || SH[0]; rig.go(q[0], q[1], q[2], q[3], instant);
      if (instant) { var r = at(SEQ[i] || SEQ[0], 1); mix(r[0], r[1], r[2] || 1, cur); } }
    var wp = new T.Vector3();
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        if (i !== lastK) chapter(i, false);
        k = i; p = pr; playing = pl;
        var r = at(SEQ[k] || SEQ[0], p); mix(r[0], r[1], r[2], tgt);
        mix(cur, tgt, Math.min(1, dt * 6), cur);
        var H = J.Hips; if (H) { H.position.set(rest.Hips.x, cur.y, cur.z); H.rotation.set(cur.x, 0, 0); }
        for (var key in MAP) { var o = J[MAP[key]]; if (o) o.rotation.set(cur[key][0], cur[key][1], cur[key][2]); }
        lamp.intensity = 1.1 * (1 + Math.sin(now * 0.011) * 0.04);
        // the book: closed in chapters 0-1, opens at the start of chapter 2, stays open after
        var closed = k <= 1 ? 1 : k === 2 ? 1 - seg(p, 0.06, 0.3) : 0;
        if (B.HingeR) { B.HingeR.rotation.z = Math.PI * closed; B.HingeR.position.y = B.hR0.y + 0.037 * closed; }
        if (B.Book) B.Book.position.x = B.book0.x + 0.075 * closed;
        // ten leaves turn in chapter 2, one leaf in chapter 3
        var n10 = 0;
        leaves.forEach(function (lf, j) {
          var a = k === 2 ? seg(p, 0.34 + j * 0.055, 0.34 + j * 0.055 + 0.09) : 0;
          lf.visible = k === 2 && p > 0.3; lf.rotation.z = Math.PI * a * 0.985; lf.position.y = 0.0188 + 0.0012 * j * (a > 0.5 ? 1 : 0);
          if (a > 0.5) n10++;
        });
        if (B.One) { var o1 = k === 3 ? seg(p, 0.15, 0.55) : 0; B.One.visible = k === 3; B.One.rotation.z = Math.PI * o1 * 0.985;
          B.One.traverse(function (o) { if (o.isMesh) o.material.emissiveIntensity = k === 3 ? 0.55 * seg(p, 0.5, 0.75) : 0; }); }
        // light on the book
        var glow = k === 1 ? seg(p, 0.15, 0.5) : k === 3 ? 0.6 * seg(p, 0.5, 0.75) : k === 4 ? 0.9 : k === 6 ? 0.5 : 0.15;
        bookLight.intensity = 1.6 * glow; if (B.Book) { B.Book.getWorldPosition(wp); aura.position.set(wp.x, wp.y + 0.05, wp.z - 0.02); }
        aura.material.opacity = 0.75 * glow * (0.9 + 0.1 * Math.sin(now * 0.004)); aura.scale.setScalar(0.7 + 0.5 * glow);
        // al-Kawthar: three lines rise one by one above the book (chapter 4), stay faint in chapter 5
        AR.forEach(function (m, j) {
          var f = k === 4 ? seg(p, 0.08 + j * 0.22, 0.25 + j * 0.22) : k === 5 ? 0.35 * (1 - seg(p, 0.2, 0.6)) : 0;
          m.material.opacity = f; m.visible = f > 0.01; m.position.set(0, 0.62 + 0.24 * (2 - j) * 0.5 + 0.05 * f + 0.1, 0.55);
        });
        var show = p > 0.08 || !pl;
        if (k === 2) nCount.text(String(n10)).at(0.12, 0.5, 0.44).show(show && n10 > 0);
        else if (k === 3) nCount.text(L.n1 || '1').at(0.12, 0.5, 0.44).show(show && p > 0.5);
        else if (k === 4) nCount.text(L.n3 || '3').at(0.42, 0.95, 0.55).show(show && p > 0.7);
        else nCount.show(false);
      }
    };
  };
})();
