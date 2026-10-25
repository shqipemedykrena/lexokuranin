/* Live scene: "A Book that has not changed". Models from Blender (models/mk-ruajtja.json).
   Six chapters: the lamp at night; palm stalks and stones in morning light; the sheets collected one by one;
   kept in a chest; copies made and sent out; a shelf of books today. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).ruajtja = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, ch = ctx.ch || [];
    function V(x, y, z) { return [x, z, -y]; }            // Blender (z up) -> three (y up)
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    sc.background = new T.Color(0x0a0807); sc.fog = new T.FogExp2(0x120d0a, 0.09);
    var hemi = new T.HemisphereLight(0x8fa3c8, 0x2a1c12, 0.12); sc.add(hemi);
    var sun = new T.DirectionalLight(0xffd8a8, 0); sun.position.set(-6.5, 4.2, -0.8); sun.target.position.set(0.2, 0.45, -0.5);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    var s = sun.shadow.camera; s.left = -3; s.right = 3; s.top = 3; s.bottom = -3; s.near = 1; s.far = 14; sc.add(sun, sun.target);
    var lamp = new T.PointLight(0xffa458, 1.6, 6, 2); lamp.position.set.apply(lamp.position, V(-1.2, 1.4, 0.16)); lamp.castShadow = true; lamp.shadow.mapSize.set(512, 512); sc.add(lamp);
    var lampGlow = K.glow(0.5, 'rgba(255,210,150,1)', 'rgba(255,140,60,.35)'); lampGlow.position.set.apply(lampGlow.position, V(-1.2, 1.4, 0.13)); sc.add(lampGlow);
    var flame = K.glow(0.09, 'rgba(255,250,220,1)', 'rgba(255,170,60,.8)'); flame.position.copy(lampGlow.position); sc.add(flame);
    var above = new T.SpotLight(0xfff0d8, 0, 6, 0.42, 0.8, 1.2); above.position.set.apply(above.position, V(-1.2, 1.4, 3.6)); above.target.position.set.apply(above.target.position, V(-1.2, 1.4, 0)); sc.add(above, above.target);
    var aboveG = K.glow(2.2, 'rgba(255,245,220,.5)', 'rgba(255,230,180,.08)'); aboveG.position.set.apply(aboveG.position, V(-1.2, 1.4, 1.4)); sc.add(aboveG);
    var fill = new T.PointLight(0xffc08a, 0, 7, 2); fill.position.set.apply(fill.position, V(1.5, -1.2, 1.6)); sc.add(fill);
    var shelfLight = new T.SpotLight(0xffd6a0, 0, 7, 0.7, 0.6, 1.5); shelfLight.position.set.apply(shelfLight.position, V(1.2, -0.6, 2.6)); shelfLight.target.position.set.apply(shelfLight.target.position, V(3.2, 1.0, 1.35)); sc.add(shelfLight, shelfLight.target);
    // the beam through the window: a soft cone of light with dust in it
    var grad = document.createElement('canvas'); grad.width = 4; grad.height = 128; var gx = grad.getContext('2d'), gg = gx.createLinearGradient(0, 0, 0, 128);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.25, 'rgba(255,255,255,.9)'); gg.addColorStop(1, 'rgba(255,255,255,0.05)'); gx.fillStyle = gg; gx.fillRect(0, 0, 4, 128);
    var beamM = new T.MeshBasicMaterial({ color: 0xffd9a3, alphaMap: new T.CanvasTexture(grad), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false });
    var beam = new T.Mesh(new T.CylinderGeometry(0.34, 0.75, 4.2, 24, 1, true), beamM);
    var from = new T.Vector3().fromArray(V(-3.2, 0.6, 2.4)), to = new T.Vector3().fromArray(V(-0.2, 0.4, 0.45));
    beam.position.copy(from).add(to).multiplyScalar(0.5); beam.lookAt(to); beam.rotateX(Math.PI / 2); sc.add(beam);
    var dustG = new T.BufferGeometry(), dp = [], dir = to.clone().sub(from);
    for (var i = 0; i < 260; i++) { var q = Math.random(), r = 0.1 + q * 0.5; var pt = from.clone().addScaledVector(dir, q); dp.push(pt.x + (Math.random() - .5) * r, pt.y + (Math.random() - .5) * r, pt.z + (Math.random() - .5) * r); }
    dustG.setAttribute('position', new T.Float32BufferAttribute(dp, 3));
    var dustM = new T.PointsMaterial({ size: 0.012, color: 0xfff0d0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, map: K.glowTex('rgba(255,255,255,1)', 'rgba(255,255,255,.2)') });
    var dust = new T.Points(dustG, dustM); sc.add(dust);
    // notes
    var notes = ch.map(function (c) { return ctx.label(c[0]); });
    var N = {}, home = {}, ready;
    ready = new Promise(function (ok) {
      ctx.model('models/mk-ruajtja.json', function (g) {
        sc.add(g.scene);
        g.scene.traverse(function (o) { if (o.name) { N[o.name] = o; home[o.name] = o.position.clone(); }
          if (o.isMesh && o.material && /Parchment|WhiteStone/.test(o.material.name)) o.material.roughness = 0.85; });
        ok();
      }, ok);
    });
    var k = 0, p = 0, playing = false;
    var shots = [
      [V(-0.2, -0.4, 1.1), V(-1.2, 1.4, 0.1), 42, [0.05, 0, -0.06]],
      [V(0.1, -0.75, 0.95), V(-0.35, 0.32, 0.46), 34, [0.08, -0.02, 0]],
      [V(0.85, -0.45, 0.95), V(0.3, 0.55, 0.5), 32, [-0.05, -0.03, 0]],
      [V(1.25, -0.25, 0.9), V(0.55, 0.55, 0.55), 34, [-0.06, 0, 0]],
      [V(0.3, -1.9, 1.6), V(0.2, 0.4, 0.5), 46, [0, -0.05, 0.08]],
      [V(0.6, -1.3, 1.5), V(3.1, 1.0, 1.35), 46, [0.1, 0, 0]]
    ];
    function chapter(i, instant) { k = i; var sh = shots[i] || shots[0]; rig.go(sh[0], sh[1], sh[2], sh[3], instant); notes.forEach(function (n, j) { n.show(false); }); }
    var targets = [V(-0.6, 0.08, 0.485), V(-0.25, 0.04, 0.485), V(0.1, 0.03, 0.485), V(0.45, 0.06, 0.485), V(0.8, 0.12, 0.485)];
    var tmp = new T.Vector3(), lerpV = function (o, a, b, t) { o.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); };
    function state(now) {
      var day = k === 0 ? 0 : k === 1 ? seg(p, 0, 0.5) : 1;
      sun.intensity = 2.6 * day; beamM.opacity = 0.13 * day; dustM.opacity = 0.75 * day; hemi.intensity = 0.1 + 0.25 * day; fill.intensity = 0.5 * day;
      var fl = 1 + Math.sin(now * 0.013) * 0.05 + Math.sin(now * 0.031) * 0.04; lamp.intensity = (k === 0 ? 2.0 : 0.6) * fl; flame.scale.set(0.09 * fl, 0.12 * fl, 1);
      above.intensity = k === 0 ? 3 * seg(p, 0.05, 0.4) : 0; aboveG.material.opacity = k === 0 ? 0.6 * seg(p, 0.05, 0.4) : 0;
      shelfLight.intensity = k === 5 ? 2.2 * seg(p, 0, 0.4) : 0;
      // sheets: collected one by one (ch 3), moved into the chest (ch 4), stay inside after
      for (var j = 0; j < 12; j++) {
        var o = N['Sheet' + (j < 10 ? '0' : '') + j]; if (!o) continue; var h = home[o.name];
        var vis = k > 2 || (k === 2 && p > j / 13), drop = k === 2 ? Math.max(0, 1 - (p - j / 13) * 8) : 0;
        o.visible = vis && !(k > 3);
        var into = k === 3 ? seg(p, 0.1, 0.55) : 0;
        o.position.set(h.x + (0.32 * into), h.y + drop * 0.12 + into * 0.03, h.z + (0.03 * into));
      }
      var lid = N.ChestPivot; if (lid) { var a = k < 3 ? 1 : k === 3 ? 1 - seg(p, 0.6, 0.9) : k === 4 ? seg(p, 0, 0.2) : 1; lid.rotation.x = -1.75 * a; }
      var bk = N.Book, rh = N.Rehal; if (bk) bk.visible = k >= 4; if (rh) rh.visible = k >= 4;
      for (var c = 0; c < 5; c++) {
        var cp = N['Copy' + c]; if (!cp) continue; var h2 = home['Copy' + c];
        if (k > 4) { cp.visible = false; continue; }
        if (k < 4) { cp.visible = false; continue; } cp.visible = true;
        var t1 = k === 4 ? seg(p, 0.15 + c * 0.1, 0.45 + c * 0.1) : 1;
        lerpV(cp, [h2.x, h2.y, h2.z], targets[c], t1);
        // then each copy leaves the table in its own direction (one to each province) and fades
        var go = k === 4 ? seg(p, 0.62 + c * 0.05, 0.95) : 1; if (k === 4 && go > 0) { var an = -2.4 + c * 1.2; cp.position.x += Math.cos(an) * 2.2 * go; cp.position.z += Math.sin(an) * 2.2 * go; cp.position.y += Math.sin(go * Math.PI) * 0.25; }
        cp.visible = !(k === 4 && go > 0.97) && !(k > 4);
        cp.position.y += Math.sin(t1 * Math.PI) * 0.08; cp.rotation.y = (c - 2) * 0.35 * t1;
      }
      // notes follow the thing each chapter is about
      var at = [V(-1.2, 1.4, 0.3), V(-0.5, 0.35, 0.5), V(0.3, 0.55, 0.62), V(0.62, 0.58, 0.8), V(0.3, -0.2, 0.6), V(3.15, 0.6, 1.95)][k];
      if (notes[k]) notes[k].at(at[0], at[1], at[2]).show(p > 0.1 || !playing);
    }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pp, pl) { k = i; p = pp; playing = pl; state(now); dust.rotation.y += dt * 0.004; }
    };
  };
})();
