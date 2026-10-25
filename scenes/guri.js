/* Live scene: the stone that greeted him (Muslim 2277). Street model from Blender (models/mk-guri.json).
   0 an old Makkah street at dawn; one stone in the wall glows, with a ring of sound (greeting), note with the reference;
   1 small pebbles on a flat stone, each with a soft ring (glorifying Allah). No people. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).guri = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    sc.background = new T.Color(0xc99a7a); sc.fog = new T.Fog(0xc99a7a, 8, 46);
    var hemi = new T.HemisphereLight(0xa8b8e0, 0x6a4a34, 0.6); sc.add(hemi);
    var sun = new T.DirectionalLight(0xffc28a, 2.0); sun.position.set(-3, 8, -30); sun.target.position.set(0, 0, -8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    var s = sun.shadow.camera; s.left = -6; s.right = 6; s.top = 20; s.bottom = -20; s.far = 60; sc.add(sun, sun.target);
    var gp = new T.Vector3(-1.4, 1.55, -6), pp = new T.Vector3(0.4, 0.6, -18);
    var glow = K.glow(1.2, 'rgba(255,235,190,.95)', 'rgba(255,190,110,.25)'); glow.material.opacity = 0; sc.add(glow);
    var ring = X.rings(sc, { size: 1.0, life: 2.0, color: 0xfff0cc }), pRings = [];
    var nStone = ctx.label(L.stone || ''), nRef = ctx.label(L.ref || ''), nPeb = ctx.label(L.pebbles || '');
    var peb = [], ready = new Promise(function (ok) {
      ctx.model('models/mk-guri.json', function (g) {
        sc.add(g.scene); g.scene.updateMatrixWorld(true); gp = X.wpos(g.scene, 'GreeterPt'); pp = X.wpos(g.scene, 'Pebbles');
        g.scene.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; if (/^Pebble\d$/.test(o.name)) peb.push(o.getWorldPosition(new T.Vector3())); });
        peb.forEach(function (q) { var r = X.rings(sc, { size: 0.18, life: 1.4, color: 0xfff2d6 }); r.pos.copy(q).add(new T.Vector3(0, 0.04, 0)); pRings.push(r); });
        glow.position.copy(gp); ok();
      }, ok);
    });
    var SH = [
      [[[0.5, 1.6, 2.5], [-0.6, 1.8, -10], 40, [0, 0, -0.6]], [[0.4, 1.6, -3.4], [-1.5, 1.55, -6], 34, [0.03, 0, -0.03]]],
      [[1.1, 1.05, -16.9], [0.4, 0.55, -18], 32, [0.03, 0, -0.03]]
    ];
    var shot = X.shots(rig, SH), k = 0, p = 0, t = 0;
    function chapter(i, instant) { k = i; shot(i, 0, instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; t += dt; shot(k, p);
        var g0 = k === 0 ? X.seg(p, 0.45, 0.7) : 0.2; glow.material.opacity = 0.9 * g0 * (0.85 + 0.15 * Math.sin(now * 0.004));
        ring.pos.copy(gp); ring.rate = k === 0 && p > 0.55 ? 0.8 : 0; ring.update(dt);
        pRings.forEach(function (r, j) { r.rate = k === 1 && p > 0.1 + j * 0.06 ? 0.7 : 0; r.update(dt); });
        var show = p > 0.08 || !pl;
        nStone.at(gp.x, gp.y + 0.45, gp.z).show(k === 0 && p > 0.55); nRef.at(gp.x + 0.3, gp.y - 0.4, gp.z).show(k === 0 && p > 0.65);
        nPeb.at(pp.x, pp.y + 0.25, pp.z).show(k === 1 && show);
      }
    };
  };
})();
