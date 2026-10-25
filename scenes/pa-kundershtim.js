/* Live scene: "A Book without contradictions". Models from Blender (models/mk-pa-kundershtim.json):
   four bowls on a stone slab: water, dust, clay, sounding (dry, cracked) clay. A light moves from one to the next;
   at the end a line joins them as stages of one process, not contradictions. */
(function () {
  (window.IkreScenes = window.IkreScenes || {})['pa-kundershtim'] = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, ch = ctx.ch || [];
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    sc.background = new T.Color(0x1a120d); sc.fog = new T.FogExp2(0x1a120d, 0.12);
    sc.add(new T.HemisphereLight(0xc8b8a8, 0x2a1c12, 0.35));
    var key = new T.SpotLight(0xffdcb0, 0, 9, 0.38, 0.55, 1.5); key.position.set(-1.17, 3, 1.4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); sc.add(key, key.target);
    var soft = new T.DirectionalLight(0xffe8d0, 0.5); soft.position.set(1, 4, 3); sc.add(soft);
    var X = [-1.17, -0.39, 0.39, 1.17];
    var notes = X.map(function (x, i) { return ctx.label(ch[i] ? ch[i][0] : '').at(x, 0.42, 0); });
    // the joining line for the last chapter
    var pts = X.map(function (x) { return new T.Vector3(x, 0.3, 0); });
    var curve = new T.CatmullRomCurve3(pts), tube = new T.Mesh(new T.TubeGeometry(curve, 80, 0.012, 8), new T.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0 }));
    sc.add(tube); var arrows = [];
    for (var i = 0; i < 3; i++) { var a = K.glow(0.12, 'rgba(255,240,200,1)', 'rgba(255,190,100,.4)'); a.position.set((X[i] + X[i + 1]) / 2, 0.3, 0); sc.add(a); arrows.push(a); }
    var N = {}, ripple = 0, ready = new Promise(function (ok) {
      ctx.model('models/mk-pa-kundershtim.json', function (g) { sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; }); ok(); }, ok);
    });
    var shots = [[[-1.0, 0.75, 1.2], [-1.17, 0.05, 0], 36, [0.05, 0, -0.1]], [[-0.3, 0.75, 1.2], [-0.39, 0.05, 0], 36, [0.05, 0, -0.1]],
      [[0.45, 0.75, 1.2], [0.39, 0.05, 0], 36, [0.05, 0, -0.1]], [[1.25, 0.75, 1.2], [1.17, 0.05, 0], 36, [0.05, 0, -0.1]], [[0, 1.6, 3.2], [0, 0.1, 0], 42, [0, 0.1, 0.2]]];
    var k = 0, p = 0, playing = false;
    function chapter(i, instant) { k = i; var q = shots[i] || shots[4]; rig.go(q[0], q[1], q[2], q[3], instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; playing = pl;
        var x = k < 4 ? X[k] : 0; key.position.x += (x - key.position.x) * Math.min(1, dt * 3); key.target.position.set(key.position.x, 0, 0);
        key.intensity = k < 4 ? 3.2 : 1.2; key.angle = k < 4 ? 0.38 : 1.0;
        if (N.Water) N.Water.position.y = 0.08 + Math.sin(now * 0.004) * 0.002;
        if (N.Dust) N.Dust.rotation.y += dt * 0.05;
        var j = k === 4 ? seg(p, 0.1, 0.6) : 0; tube.material.opacity = 0.9 * j; arrows.forEach(function (a, n) { a.material.opacity = j * (0.6 + 0.4 * Math.sin(now * 0.004 - n)); });
        notes.forEach(function (n, m) { n.at(X[m], k === 4 ? (m % 2 ? 0.5 : 0.36) : 0.42, 0); n.show((m === k && (p > 0.1 || !pl)) || k === 4); });
      }
    };
  };
})();
