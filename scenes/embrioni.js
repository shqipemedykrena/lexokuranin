/* Live scene: "Creation in stages", kept abstract. Models from Blender (models/mk-embrioni.json):
   a soft form with morph targets (cling, lump, thin, full), a warm curved wall, a pale thread.
   Chapters follow Quran 23:12-14: nutfah in a safe lodging, 'alaqah, mudghah, bones, flesh, another creation. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).embrioni = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, ch = ctx.ch || [];
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    sc.background = new T.Color(0x140303); sc.fog = new T.FogExp2(0x2a0806, 0.12);
    sc.add(new T.HemisphereLight(0xff9a80, 0x200404, 0.35));
    var back = new T.PointLight(0xff6a48, 2.4, 9, 2); back.position.set(0, 1.4, -3); sc.add(back);
    var key = new T.PointLight(0xffd8c8, 1.6, 8, 2); key.position.set(-2.4, 2.4, 3.5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); sc.add(key);
    var glow = K.glow(3.2, 'rgba(255,220,190,.7)', 'rgba(255,120,80,.15)'); glow.position.set(0, -0.55, 0); sc.add(glow);
    // the drop, before it lands: a small bright sphere
    var drop = new T.Mesh(new T.SphereGeometry(0.16, 32, 20), new T.MeshStandardMaterial({ color: 0xffe2d0, emissive: 0xff9a70, emissiveIntensity: 0.6, roughness: 0.25 }));
    sc.add(drop);
    var motes = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(Array.from({ length: 600 }, function () { return (Math.random() - 0.5) * 8; }), 3)),
      new T.PointsMaterial({ size: 0.02, color: 0xffc0a8, transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending, map: K.glowTex('rgba(255,255,255,1)', 'rgba(255,255,255,.1)') }));
    sc.add(motes);
    var note = ctx.label('');
    var N = {}, form = null, ready = new Promise(function (ok) {
      ctx.model('models/mk-embrioni.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; if (o.isMesh && o.morphTargetInfluences) form = o; });
        if (N.Frame) { N.Frame.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; } }); }
        if (form) { form.material = form.material.clone(); form.material.transparent = true; form.castShadow = true; }
        ok();
      }, ok);
    });
    var shots = [
      [[0.6, 0.6, 4.2], [0, -0.2, 0], 38, [0, -0.1, -0.3]],
      [[0.5, 0.2, 3.4], [0, -0.6, 0], 34, [-0.1, 0, -0.2]],
      [[-0.4, 0.15, 3.1], [0, -0.6, 0], 32, [0.1, 0, -0.2]],
      [[0.2, 0.1, 2.6], [0, -0.62, 0], 30, [0, -0.02, -0.15]],
      [[0.7, 0.35, 3.2], [0, -0.6, 0], 34, [-0.1, 0, -0.2]],
      [[0, 0.7, 4.6], [0, -0.45, 0], 40, [0, 0.1, 0.3]]
    ];
    var k = 0, p = 0, playing = false;
    function chapter(i, instant) { k = i; var s = shots[i] || shots[0]; rig.go(s[0], s[1], s[2], s[3], instant); note.text(ch[i] ? ch[i][0] : ''); }
    // morph weights per chapter: [cling, lump, thin, full], blended in over the chapter
    var W = [[0, 0, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [0, 0, 0, 1]];
    function state(now) {
      var prev = W[Math.max(0, k - 1)], cur = W[k], t = k === 0 ? 1 : seg(p, 0.05, 0.6);
      if (form) for (var j = 0; j < 4; j++) form.morphTargetInfluences[j] = prev[j] + (cur[j] - prev[j]) * t;
      // chapter 1: the drop falls and settles; the form is hidden until it lands
      var fall = k === 0 ? seg(p, 0.05, 0.55) : 1;
      drop.position.set(0.3 * (1 - fall), -0.68 + 2.6 * (1 - fall), -0.2 * (1 - fall));
      drop.visible = k === 0 && fall < 0.98; drop.scale.setScalar(1 + 0.25 * Math.sin(fall * Math.PI));
      if (form) { form.visible = !(k === 0 && fall < 0.98); form.scale.setScalar(k === 0 ? 0.32 : k === 1 ? 0.32 + 0.68 * seg(p, 0, 0.5) : 1); }
      // bones: the form turns see-through and the thread glows; flesh: covered again
      var see = k === 3 ? seg(p, 0.1, 0.45) : k === 4 ? 1 - seg(p, 0.2, 0.6) : 0;
      if (form) { form.material.opacity = 1 - 0.65 * see; form.material.depthWrite = see < 0.2; form.material.emissiveIntensity = (k === 5 ? 0.25 + 1.2 * seg(p, 0.1, 0.7) : 0.25) * (1 + Math.sin(now * 0.002) * 0.05); }
      if (N.Frame) N.Frame.traverse(function (o) { if (o.isMesh) { o.material.opacity = see; o.visible = see > 0.02; } });
      glow.material.opacity = k === 5 ? 0.35 + 0.5 * seg(p, 0.1, 0.7) : 0.25;
      key.intensity = 1.6 + (k === 5 ? 1.4 * seg(p, 0.1, 0.7) : 0);
      motes.rotation.y = now * 0.00002; motes.position.y = Math.sin(now * 0.0003) * 0.05;
      note.at(0, k === 0 && fall < 1 ? drop.position.y + 0.3 : -0.1, 0).show(p > 0.1 || !playing);
    }
    return { ready: ready, chapter: chapter, update: function (dt, now, i, pp, pl) { k = i; p = pp; playing = pl; state(now); } };
  };
})();
