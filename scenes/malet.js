/* Live scene: "Mountains as pegs". Models from Blender (models/mk-malet.json): land cut open at the front,
   a mountain, its root under the surface, the hot deep layer, and a tent peg for the comparison.
   Chapters: the verse; the mountain stands firm; the peg (longer below than above) and the root, several times deeper;
   mountains move a little but stay stable. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).malet = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    sc.background = new T.Color(0x2b2230); sc.fog = new T.Fog(0x2b2230, 60, 180);
    sc.add(new T.HemisphereLight(0xb8c4e0, 0x3a2418, 0.55));
    var sun = new T.DirectionalLight(0xffd2a0, 1.8); sun.position.set(-30, 40, 20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    var s = sun.shadow.camera; s.left = -35; s.right = 35; s.top = 35; s.bottom = -35; s.far = 150; sc.add(sun);
    var heat = new T.PointLight(0xff6a20, 0, 40, 2); heat.position.set(0, -20, 6); sc.add(heat);
    var sky = K.glow(140, 'rgba(255,190,140,.45)', 'rgba(255,140,90,.08)'); sky.position.set(0, 10, -60); sc.add(sky);
    var nMount = ctx.label(L.mount || ''), nGround = ctx.label(L.ground || ''), nRoot = ctx.label(L.root || ''), nPeg = ctx.label(L.peg || '');
    // a dashed line showing the surface level across the cut
    var lg = new T.BufferGeometry().setFromPoints([new T.Vector3(-30, 1.2, 0.12), new T.Vector3(30, 1.2, 0.12)]);
    var line = new T.Line(lg, new T.LineDashedMaterial({ color: 0xffffff, dashSize: 0.8, gapSize: 0.5, transparent: true, opacity: 0 })); line.computeLineDistances(); sc.add(line);
    var N = {}, ready = new Promise(function (ok) {
      ctx.model('models/mk-malet.json', function (g) { sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; } }); ok(); }, ok);
    });
    var shots = [
      [[-14, 16, 46], [0, 6, 0], 42, [2, 0, -3]],
      [[10, 8, 34], [0, 7, 0], 38, [-2, 0, -2]],
      [[-14, 1.0, 9], [-17.5, 0.6, 0], 34, [0.3, 0, -0.6]],
      [[0, -2, 52], [0, -10, 0], 44, [0, -2, -4]],
      [[18, 10, 40], [0, -2, -2], 44, [-3, 0, 0]]
    ];
    var k = 0, p = 0, playing = false;
    function chapter(i, instant) { k = i; var q = shots[i] || shots[0]; rig.go(q[0], q[1], q[2], q[3], instant); }
    function op(name, v) { var o = N[name]; if (!o) return; o.traverse(function (m) { if (m.isMesh) { m.material.opacity = v; m.visible = v > 0.01; m.material.depthWrite = v > 0.95; } }); }
    function state(now) {
      var reveal = k < 3 ? 0 : k === 3 ? seg(p, 0.1, 0.5) : 1;
      op('CrustBelow', 1 - reveal); op('RootFace', reveal); op('Root3D', reveal * 0.9);
      if (N.Mantle) N.Mantle.traverse(function (m) { if (m.isMesh && m.material.emissive) m.material.emissiveIntensity = 0.8 + 0.3 * Math.sin(now * 0.0015); });
      heat.intensity = 2.5 * reveal;
      line.material.opacity = k >= 1 ? 0.8 : 0;
      // the tent and peg only matter in chapter 3; the peg's lower half shows through the ground there
      
      // chapter 5: the whole block drifts a few "millimetres" (a tiny slow slide) but the mountain holds
      var g = N.Land && N.Land.parent; var drift = k === 4 ? Math.sin(now * 0.0008) * 0.15 : 0;
      ['Land', 'Crust', 'RootFace', 'CrustBelow', 'Mantle', 'Root3D'].forEach(function (n) { if (N[n]) N[n].position.x = drift; });
      var show = p > 0.12 || !playing;
      nMount.at(0, 17, 6).show((k === 1 || k === 4) && show);
      nGround.at(-16, 1.6, 0.3).show(k === 1 && show);
      nPeg.at(-17.5, -0.4, 0.2).show(k === 2 && show);
      nRoot.at(0, -24, 0.3).show(k === 3 && p > 0.45);
    }
    return { ready: ready, chapter: chapter, update: function (dt, now, i, pp, pl) { k = i; p = pp; playing = pl; state(now); } };
  };
})();
