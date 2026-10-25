/* Live scene: "Writing by hand helps your memory" (meso.html, Mjetet). Models from Blender: models/albanian.json
   (the man in Albanian dress, poses "write" and "write2"), models/mk-shkrimi.json (low desk, open notebook, ink,
   reed pen, brain) and the mosque room from models/namaz.json. He writes; beside him his brain floats, with a
   network of neurons inside that fires more and more while he writes. Light flows from his hand to the brain. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).shkrimi = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    var seg = X.seg;
    sc.background = new T.Color(0x120d0a); sc.fog = new T.FogExp2(0x120d0a, 0.06);
    sc.add(new T.HemisphereLight(0xffeedd, 0x2e1c12, 0.45));
    var win = new T.DirectionalLight(0xffe2b8, 1.25); win.position.set(3, 5.5, 3); win.target.position.set(0, 0.4, 0.6); win.castShadow = true;
    win.shadow.mapSize.set(1024, 1024); var s = win.shadow.camera; s.left = -2; s.right = 2; s.top = 2; s.bottom = -2; s.near = 1; s.far = 14; win.shadow.bias = -0.0006; win.shadow.normalBias = 0.02;
    sc.add(win, win.target);
    var lamp = new T.PointLight(0xffb070, 1.0, 7, 2); lamp.position.set(0.3, 2.3, 1.8); sc.add(lamp);
    var deskLamp = new T.PointLight(0xffd8a0, 0.9, 2.2, 2); deskLamp.position.set(0.35, 0.75, 0.75); sc.add(deskLamp);
    var M = {}, B = {}, mixer = null, ACT = {}, brain = new T.Group(), pen = null, hand = null;
    var BRAIN_POS = new T.Vector3(0.8, 1.22, 0.6), BS = 4.6;
    brain.position.copy(BRAIN_POS); brain.scale.setScalar(BS); sc.add(brain);
    var ready = Promise.all([
      new Promise(function (ok) { ctx.model('models/namaz.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        var h = X.find(g.scene, 'Hips'); if (h) h.visible = false; ok(); }, ok); }),
      new Promise(function (ok) { ctx.model('models/albanian.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false;
          if (o.material && o.material.map && /Brows|Beard|Hair/.test(o.name)) { o.material.transparent = true; o.material.alphaTest = 0.35; } }
          if (o.isBone && o.name === 'WristR') hand = o; });
        mixer = new T.AnimationMixer(g.scene);
        (g.animations || []).forEach(function (c) { var a = mixer.clipAction(c); a.play(); a.paused = true; a.time = 0; a.setEffectiveWeight(c.name === 'write' ? 1 : 0); ACT[c.name] = a; });
        mixer.update(0); ok(); }, ok); }),
      new Promise(function (ok) { ctx.model('models/mk-shkrimi.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) B[o.name] = o; if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        ['HemiL', 'HemiR', 'Cerebellum', 'Stem'].forEach(function (n) { var o = B[n]; if (!o) return; sc.remove(o); o.parent && o.parent.remove(o); brain.add(o);
          o.material = new T.MeshStandardMaterial({ color: 0xe9a3a8, roughness: 0.5, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false, side: T.FrontSide, emissive: new T.Color(0x2a0810), emissiveIntensity: 0.3 }); o.castShadow = false; });
        pen = B.Pen || null; ok(); }, ok); })
    ]);
    // ---------- neurons inside the brain (brain-local units: the brain is ~0.13 x 0.17 x 0.12 before scaling) ----------
    var NN = 240, nodes = [], i, j;
    function inside() { for (;;) { var p = new T.Vector3((Math.random() - 0.5) * 0.24, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2);
      var side = p.x > 0 ? 0.036 : -0.036, q = new T.Vector3((p.x - side) / 0.062, p.y / 0.08, p.z / 0.058); if (q.length() < 0.92) return p; } }
    for (i = 0; i < NN; i++) nodes.push(inside());
    var edges = [], adj = nodes.map(function () { return []; });
    for (i = 0; i < NN; i++) {
      var d = nodes.map(function (q, k) { return [q.distanceTo(nodes[i]), k]; }).sort(function (a, b) { return a[0] - b[0]; });
      for (j = 1; j <= 3; j++) { var k2 = d[j][1]; if (i < k2) { edges.push([i, k2]); adj[i].push(k2); adj[k2].push(i); } }
    }
    var lp = []; edges.forEach(function (e) { lp.push(nodes[e[0]].x, nodes[e[0]].y, nodes[e[0]].z, nodes[e[1]].x, nodes[e[1]].y, nodes[e[1]].z); });
    var net = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(lp, 3)),
      new T.LineBasicMaterial({ color: 0x4fc3ff, transparent: true, opacity: 0.25, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
    brain.add(net);
    var dots = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute([].concat.apply([], nodes.map(function (q) { return [q.x, q.y, q.z]; })), 3)),
      new T.PointsMaterial({ size: 0.004, color: 0x9fe4ff, transparent: true, opacity: 0.6, blending: T.AdditiveBlending, depthWrite: false, fog: false, map: K.glowTex('rgba(255,255,255,1)', 'rgba(140,220,255,.2)') }));
    brain.add(dots);
    // pulses travel along the connections; when one arrives, the neuron flashes
    var NP = 90, pulses = [], flashes = [];
    for (i = 0; i < NP; i++) { var sp = K.glow(0.012, 'rgba(210,245,255,1)', 'rgba(40,170,255,.35)'); sp.material.fog = false; brain.add(sp);
      var a0 = Math.floor(Math.random() * NN); pulses.push({ sp: sp, a: a0, b: adj[a0][0] || 0, t: Math.random(), v: 1.2 + Math.random() * 1.6, on: false }); }
    for (i = 0; i < 40; i++) { var fl = K.glow(0.03, 'rgba(220,248,255,1)', 'rgba(60,180,255,.3)'); fl.material.fog = false; fl.material.opacity = 0; brain.add(fl); flashes.push({ sp: fl, life: 0 }); }
    var fi = 0;
    function flash(p) { var f = flashes[fi++ % flashes.length]; f.sp.position.copy(p); f.life = 1; }
    // light flowing from the hand to the brain
    var flow = []; for (i = 0; i < 26; i++) { var fsp = K.glow(0.05, 'rgba(255,240,200,1)', 'rgba(255,200,110,.3)'); fsp.material.opacity = 0; sc.add(fsp); flow.push({ sp: fsp, t: i / 26 }); }
    var nBrain = ctx.label(L.brain || ''), nHand = ctx.label(L.hand || '');
    var SH = [[[-2.15, 1.35, 2.25], [0.35, 0.85, 0.55], 38, [0.25, 0.05, -0.15]]];
    var k = 0, p = 0, t = 0, wp = new T.Vector3(), hp = new T.Vector3();
    function chapter(i2, instant) { k = i2; var q = SH[i2] || SH[0]; rig.go(q[0], q[1], q[2], q[3], instant); }
    function bez(a, b, u, out) { var m = a.clone().lerp(b, 0.5); m.y += 0.35; return out.copy(a).lerp(m, u).lerp(m.clone().lerp(b, u), u); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i2, pr, pl) {
        k = i2; p = pr; t += dt;
        // writing: the hand moves between the two writing poses, quick and a little uneven
        var w2 = 0.5 + 0.5 * Math.sin(t * 5.2) * (0.7 + 0.3 * Math.sin(t * 1.7));
        if (ACT.write) { ACT.write.setEffectiveWeight(1 - w2); ACT.write2.setEffectiveWeight(w2); mixer.update(0); }
        if (pen && hand) { hand.getWorldPosition(hp); pen.position.set(hp.x - 0.01, hp.y + 0.06, hp.z + 0.08); pen.rotation.set(-0.5, 0, 0.35); }
        // activity rises while he writes
        var A = 0.25 + 0.75 * seg(p, 0.05, 0.7);
        pulses.forEach(function (q, n) {
          var active = n < NP * A; q.sp.visible = active; if (!active) return;
          q.t += dt * q.v;
          if (q.t >= 1) { q.t = 0; flash(nodes[q.b]); var nb = adj[q.b]; q.a = q.b; q.b = nb[Math.floor(Math.random() * nb.length)] || 0; }
          q.sp.position.copy(nodes[q.a]).lerp(nodes[q.b], q.t); q.sp.material.opacity = 0.75;
        });
        flashes.forEach(function (f) { f.life = Math.max(0, f.life - dt * 2.2); f.sp.material.opacity = f.life * 0.6; f.sp.scale.setScalar(0.02 + 0.03 * (1 - f.life)); });
        net.material.opacity = 0.2 + 0.35 * A; dots.material.opacity = 0.5 + 0.4 * A;
        brain.rotation.y = 0.5 + Math.sin(t * 0.25) * 0.35; brain.position.y = BRAIN_POS.y + Math.sin(t * 0.8) * 0.02;
        // the flow of light from the hand to the brain
        if (hand) { hand.getWorldPosition(hp); flow.forEach(function (f) { f.t = (f.t + dt * 0.35) % 1; bez(hp, brain.position, f.t, f.sp.position); f.sp.material.opacity = 0.65 * A * Math.sin(f.t * Math.PI); f.sp.scale.setScalar(0.03 + 0.02 * Math.sin(f.t * Math.PI)); }); }
        deskLamp.intensity = 0.9 * (1 + Math.sin(now * 0.011) * 0.04);
        var show = p > 0.06 || !pl;
        nBrain.at(BRAIN_POS.x, BRAIN_POS.y + 0.36, BRAIN_POS.z).show(show);
        if (hand) nHand.at(hp.x - 0.05, hp.y + 0.2, hp.z + 0.05).show(show && p < 0.55);
      }
    };
  };
})();
