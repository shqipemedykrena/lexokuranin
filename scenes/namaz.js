/* Live scene: "How to pray", 24 steps. Model from Blender (models/namaz.json): a man in Albanian dress
   (white shirt, xhamadan, red sash, tirq, plis) on a prayer rug, facing the mihrab. He is posed by rotating his
   joints; each chapter has a short sequence of poses. Joint angles in radians, three.js axes (he faces +Z). */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).namaz = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig;
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    sc.background = new T.Color(0x1c140f); sc.fog = new T.FogExp2(0x1c140f, 0.06);
    sc.add(new T.HemisphereLight(0xfff2e0, 0x3a2416, 0.55));
    var win = new T.DirectionalLight(0xffe6c0, 1.6); win.position.set(4, 6, -1.5); win.target.position.set(0, 0.6, 0.6); win.castShadow = true;
    win.shadow.mapSize.set(1024, 1024); var s = win.shadow.camera; s.left = -2.5; s.right = 2.5; s.top = 2.5; s.bottom = -2.5; s.near = 1; s.far = 15; win.shadow.bias = -0.0006; win.shadow.normalBias = 0.02;
    sc.add(win, win.target);
    var lamp = new T.PointLight(0xffb070, 1.2, 7, 2); lamp.position.set(0, 2.6, 3); sc.add(lamp);
    var lampG = K.glow(0.5, 'rgba(255,225,170,1)', 'rgba(255,160,70,.3)'); lampG.position.copy(lamp.position); sc.add(lampG);
    var fill = new T.PointLight(0xffd9b0, 0.5, 8, 2); fill.position.set(-2, 1.8, -2.5); sc.add(fill);
    var fill2 = new T.PointLight(0xffe0c0, 0.7, 9, 2); fill2.position.set(2.5, 2.2, 1.0); sc.add(fill2);
    var qibla = ctx.label((ctx.L && ctx.L.qibla) || ''), note = ctx.label('');
    // ---------- poses ----------
    var Z0 = { y: 0.98, z: 0, x: 0, spine: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0],
      shL: [0, 0, 0.07], elL: [-0.1, 0, 0], wrL: [0, 0, 0], shR: [0, 0, -0.07], elR: [-0.1, 0, 0], wrR: [0, 0, 0],
      hpL: [0, 0, 0.02], knL: [0, 0, 0], anL: [0, 0, 0], hpR: [0, 0, -0.02], knR: [0, 0, 0], anR: [0, 0, 0] };
    function P(o) { var r = JSON.parse(JSON.stringify(Z0)); for (var k in o) r[k] = o[k]; return r; }
    var POSE = {
      stand: P({}),
      intend: P({ neck: [0.18, 0, 0] }),
      takbir: P({ shL: [-0.35, 0, 0.3], elL: [-2.35, 0, 0], wrL: [0.2, 0, 0], shR: [-0.35, 0, -0.3], elR: [-2.35, 0, 0], wrR: [0.2, 0, 0], neck: [0.08, 0, 0] }),
      qabd: P({ shR: [-0.32, 1.05, -0.05], elR: [-1.95, 0, 0], shL: [-0.24, -1.0, 0.06], elL: [-1.8, 0, 0], neck: [0.14, 0, 0] }),
      ruku: P({ spine: [1.45, 0, 0], neck: [0.05, 0, 0], shL: [-1.12, 0, 0.12], shR: [-1.12, 0, -0.12], elL: [0, 0, 0], elR: [0, 0, 0], z: -0.06 }),
      sujud: P({ y: 0.47, z: -0.05, x: 1.2, spine: [1.0, 0, 0], neck: [0.32, 0, 0],
        shL: [-2.55, 0, 0.45], elL: [-0.75, 0, 0], wrL: [0.75, 0, 0], shR: [-2.55, 0, -0.45], elR: [-0.75, 0, 0], wrR: [0.75, 0, 0],
        hpL: [-1.5, 0, 0.1], knL: [1.87, 0, 0], anL: [0.0, 0, 0], hpR: [-1.5, 0, -0.1], knR: [1.87, 0, 0], anR: [0.0, 0, 0] }),
      jalsa: P({ y: 0.22, z: -0.32, spine: [0.06, 0, 0], neck: [0.15, 0, 0],
        shL: [-0.55, 0, 0.08], elL: [-0.8, 0, 0], wrL: [0.4, 0, 0], shR: [-0.55, 0, -0.08], elR: [-0.8, 0, 0], wrR: [0.4, 0, 0],
        hpL: [-1.52, 0, 0.12], knL: [2.95, 0, 0], anL: [0.6, 0, 0], hpR: [-1.52, 0, -0.12], knR: [2.95, 0, 0], anR: [-0.3, 0, 0] })
    };
    POSE.tashahhud = P(JSON.parse(JSON.stringify(POSE.jalsa))); POSE.tashahhud.elR = [-1.05, 0, 0]; POSE.tashahhud.wrR = [0.1, 0, 0];
    POSE.tawarruk = P(JSON.parse(JSON.stringify(POSE.tashahhud))); POSE.tawarruk.y = 0.16; POSE.tawarruk.hpL = [-1.4, 0.55, 0.5]; POSE.tawarruk.knL = [2.8, 0, 0]; POSE.tawarruk.spine = [0.06, 0, -0.04];
    POSE.salamR = P(JSON.parse(JSON.stringify(POSE.tawarruk))); POSE.salamR.head = [0, -0.95, 0];
    POSE.salamL = P(JSON.parse(JSON.stringify(POSE.tawarruk))); POSE.salamL.head = [0, 0.95, 0];
    POSE.qunut = P({ shL: [-0.85, 0, 0.18], elL: [-1.0, 0, 0], wrL: [-0.3, 0, 0], shR: [-0.85, 0, -0.18], elR: [-1.0, 0, 0], wrR: [-0.3, 0, 0], neck: [0.12, 0, 0] });
    POSE.rise = P({ y: 0.6, z: -0.1, x: 0.5, spine: [0.6, 0, 0], hpL: [-1.6, 0, 0.1], knL: [1.9, 0, 0], hpR: [-0.4, 0, -0.1], knR: [1.5, 0, 0], shL: [-1.0, 0, 0.1], shR: [-1.0, 0, -0.1] });
    // per chapter: [ [fraction, pose], ... ]
    var SEQ = [
      [[0, 'stand']], [[0, 'stand']], [[0, 'intend']],
      [[0, 'stand'], [0.25, 'takbir']], [[0, 'takbir'], [0.3, 'qabd']], [[0, 'qabd']], [[0, 'qabd']], [[0, 'qabd']], [[0, 'qabd']], [[0, 'qabd']],
      [[0, 'qabd'], [0.12, 'takbir'], [0.3, 'ruku']],
      [[0, 'ruku'], [0.25, 'takbir'], [0.55, 'stand']],
      [[0, 'stand'], [0.12, 'takbir'], [0.25, 'stand'], [0.4, 'sujud']],
      [[0, 'sujud'], [0.25, 'jalsa']],
      [[0, 'jalsa'], [0.3, 'sujud']],
      [[0, 'sujud'], [0.25, 'jalsa'], [0.55, 'rise'], [0.78, 'qabd']],
      [[0, 'qabd'], [0.18, 'ruku'], [0.36, 'stand'], [0.52, 'sujud'], [0.68, 'jalsa'], [0.84, 'sujud']],
      [[0, 'sujud'], [0.2, 'tashahhud']], [[0, 'tashahhud']],
      [[0, 'tashahhud'], [0.3, 'rise'], [0.6, 'qabd']],
      [[0, 'qabd'], [0.25, 'qunut']],
      [[0, 'qunut'], [0.15, 'sujud'], [0.4, 'tawarruk']], [[0, 'tawarruk']],
      [[0, 'tawarruk'], [0.2, 'salamR'], [0.55, 'tawarruk'], [0.68, 'salamL']]
    ];
    var SIDE = [[3.6, 1.25, 0.25], [0, 0.85, 0.25]], SUJ = [[3.0, 0.95, 0.4], [0, 0.4, 0.3]], BACK = [[-1.8, 1.8, -3.2], [0, 0.9, 1.2]], FRONT = [[1.6, 1.4, 3.0], [0, 0.9, 0]], LOW = [[2.4, 0.9, 1.9], [0, 0.5, 0.1]];
    var SHOT = [BACK, SIDE, FRONT, FRONT, FRONT, SIDE, FRONT, SIDE, FRONT, SIDE, SIDE, SIDE, SUJ, LOW, SUJ, SIDE, SIDE, LOW, FRONT, SIDE, FRONT, LOW, FRONT, FRONT];
    var J = {}, rest = {}, ready = new Promise(function (ok) {
      ctx.model('models/namaz.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) { J[o.name] = o; rest[o.name] = o.position.clone(); } if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        ok();
      }, ok);
    });
    var MAP = { spine: 'Spine', neck: 'Neck', head: 'Head', shL: 'ShoulderL', elL: 'ElbowL', wrL: 'WristL', shR: 'ShoulderR', elR: 'ElbowR', wrR: 'WristR',
      hpL: 'HipL', knL: 'KneeL', anL: 'AnkleL', hpR: 'HipR', knR: 'KneeR', anR: 'AnkleR' };
    var cur = P({}), k = 0, p = 0, playing = false;
    function at(seq, t) {
      var a = seq[0], b = seq[0];
      for (var i = 0; i < seq.length; i++) { if (seq[i][0] <= t) { a = seq[i]; b = seq[i + 1] || seq[i]; } }
      var span = (b[0] - a[0]) || 1, f = b === a ? 1 : ease(Math.min(1, (t - a[0]) / Math.min(span, 0.16)));
      return [POSE[a[1]], POSE[b[1]], b === a ? 0 : f];
    }
    function mix(A, B, f, out) {
      ['y', 'z', 'x'].forEach(function (q) { out[q] = A[q] + (B[q] - A[q]) * f; });
      for (var key in MAP) { var a = A[key], b = B[key]; out[key] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
      return out;
    }
    var tgt = P({});
    function chapter(i, instant) {
      k = i; var sh = SHOT[i] || SIDE; rig.go(sh[0], sh[1], 40, [0.06, 0, -0.06], instant);
      if (instant) { var r = at(SEQ[i] || SEQ[0], 1); mix(r[0], r[1], r[2] || 1, cur); }
    }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; playing = pl;
        var r = at(SEQ[k] || SEQ[0], p); mix(r[0], r[1], r[2], tgt);
        if (window.__pose && POSE[window.__pose]) { mix(POSE[window.__pose], POSE[window.__pose], 0, tgt); if (window.__cam) rig.go(window.__cam[0], window.__cam[1], window.__cam[2] || 40, [0, 0, 0], true); }
        var a = Math.min(1, dt * 9); mix(cur, tgt, a, cur);    // smooth follow, so chapter jumps also move
        var H = J.Hips; if (H) { H.position.set(rest.Hips.x, cur.y, cur.z); H.rotation.set(cur.x, 0, 0); }
        for (var key in MAP) { var o = J[MAP[key]]; if (o) o.rotation.set(cur[key][0], cur[key][1], cur[key][2]); }
        var fl = 1 + Math.sin(now * 0.011) * 0.04; lamp.intensity = 1.2 * fl;
        qibla.at(0, 2.2, 3.2).show(k === 0 && (p > 0.15 || !pl));
      }
    };
  };
})();
