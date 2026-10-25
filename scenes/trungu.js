/* Live scene: the palm trunk that cried. Mosque model from Blender (models/mk-trungu.json): palm-trunk pillars,
   a roof of fronds, the qiblah wall, the minbar and the lone trunk. No people.
   0 the trunk by the qiblah wall where the sermon was given; 1 the minbar slides into place, the trunk shakes and cries (rings);
   2 deeper, stronger rings (like a bull), note ad-Darimi 41; 3 the rings fade, warm light wraps the trunk, still;
   4 a slow push on the quiet trunk; 5 small quick rings (like a small child), note Bukhari; 6 wide, light through the roof. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).trungu = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    sc.background = new T.Color(0xd9c7a6); sc.fog = new T.FogExp2(0xbca88a, 0.035);
    var hemi = new T.HemisphereLight(0xfff2dc, 0x6a5036, 0.55); sc.add(hemi);
    var sun = new T.DirectionalLight(0xffe4b8, 2.4); sun.position.set(6, 14, -9); sun.target.position.set(0, 0, -5); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); var s = sun.shadow.camera; s.left = -10; s.right = 10; s.top = 10; s.bottom = -10; s.near = 1; s.far = 40; sun.shadow.bias = -0.0005; sc.add(sun, sun.target);
    var warm = new T.PointLight(0xffc880, 0, 4, 2); warm.position.set(-0.4, 1.4, -1.1); sc.add(warm);
    var wrap = K.glow(2.6, 'rgba(255,225,170,.8)', 'rgba(255,190,110,.15)'); wrap.position.set(-0.6, 1.0, -0.6); wrap.material.opacity = 0; sc.add(wrap);
    var rings = X.rings(sc, { size: 1.6, life: 1.8, color: 0xffeccc });
    var dust = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(Array.from({ length: 1200 }, function (_, j) { return j % 3 === 1 ? Math.random() * 3.2 : (Math.random() - 0.5) * 10 - (j % 3 === 2 ? 4 : 0); }), 3)),
      new T.PointsMaterial({ size: 0.02, color: 0xfff2d8, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending, map: K.glowTex('rgba(255,255,255,1)', 'rgba(255,255,255,.2)') }));
    sc.add(dust);
    var nTrunk = ctx.label(L.trunk || ''), nMin = ctx.label(L.minbar || ''), nRef = ctx.label(L.ref || ''), nRef2 = ctx.label(L.ref2 || '');
    var N = {}, minHome = new T.Vector3(1.2, 0, -0.9), trunk = null, tHome = new T.Vector3();
    var ready = new Promise(function (ok) {
      ctx.model('models/mk-trungu.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
        if (N.Minbar) minHome.copy(N.Minbar.position); trunk = N.LoneTrunk; if (trunk) tHome.copy(trunk.position); ok();
      }, ok);
    });
    var SH = [
      [[2.4, 1.6, -3.6], [-0.6, 1.1, -0.6], 40, [0.1, 0, 0.1]],
      [[3.0, 1.4, -3.2], [0.2, 0.9, -0.7], 42, [0.05, 0, 0.1]],
      [[1.3, 1.2, -2.4], [-0.6, 1.1, -0.6], 34, [0.05, 0, 0.05]],
      [[0.9, 1.3, -2.1], [-0.6, 1.1, -0.6], 32, [0.03, 0, 0.03]],
      [[0.4, 1.2, -1.8], [-0.6, 1.1, -0.6], 26, [0, 0, 0.12]],
      [[1.4, 1.0, -2.4], [-0.6, 1.2, -0.6], 34, [0.05, 0, 0.05]],
      [[3.4, 2.2, -9.5], [-0.5, 1.2, -1.0], 40, [0, 0.1, 0.8]]
    ];
    var k = 0, p = 0, t = 0, cry = 0;
    function chapter(i, instant) { k = i; var q = SH[i] || SH[0]; rig.go(q[0], q[1], q[2], q[3], instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; t += dt;
        // the minbar: not there in chapter 1, slides in during chapter 2
        if (N.Minbar) { var m = k === 0 ? 0 : k === 1 ? X.seg(p, 0.05, 0.4) : 1; N.Minbar.position.set(minHome.x + 3.5 * (1 - m), minHome.y, minHome.z - 2 * (1 - m)); N.Minbar.visible = m > 0.01; }
        // crying: strength and kind per chapter
        var target = k === 1 ? X.seg(p, 0.4, 0.6) * 0.7 : k === 2 ? 1 : k === 3 ? 1 - X.seg(p, 0.1, 0.6) : k === 5 ? 0.6 : 0;
        cry += (target - cry) * Math.min(1, dt * 3);
        rings.pos.set(-0.6, 1.3, -0.6); rings.strength = cry; rings.rate = cry > 0.05 ? (k === 5 ? 3.2 : k === 2 ? 0.9 : 1.4) : 0;
        rings.size = k === 2 ? 2.4 : k === 5 ? 1.0 : 1.6; rings.life = k === 2 ? 2.4 : k === 5 ? 1.0 : 1.8; rings.color = k === 2 ? 0xffd9a8 : 0xffeccc; rings.update(dt);
        if (trunk) { var sh = cry * (k === 5 ? 0.006 : 0.012); trunk.rotation.set(Math.sin(t * 31) * sh, 0, Math.sin(t * 27 + 1) * sh); }
        var hug = k === 3 ? X.seg(p, 0.1, 0.5) : k === 4 ? 1 - 0.4 * X.seg(p, 0, 1) : 0;
        wrap.material.opacity = 0.7 * hug; warm.intensity = 1.6 * hug;
        dust.rotation.y += dt * 0.01;
        var show = p > 0.08 || !pl;
        nTrunk.at(-0.6, 2.25, -0.6).show((k === 0 || k === 4) && show); nMin.at(minHome.x, 1.2, minHome.z).show(k === 1 && p > 0.45);
        nRef.at(-0.3, 1.75, -0.6).show(k === 2 && show); nRef2.at(-0.3, 1.75, -0.6).show(k === 5 && show);
      }
    };
  };
})();
