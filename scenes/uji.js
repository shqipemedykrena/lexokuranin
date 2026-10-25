/* Live scene: water springing up (Bukhari 3579). Models from Blender (models/mk-uji.json): a bowl, jars and water skins
   in a camp, a plate of bread and dates. No hands and no people: the scene shows the water and what it did.
   0 water springs up in the bowl and runs over; 1 it flows to the jars and skins of the whole army and fills them;
   2 close on the bowl with the reference; 3 the plate of food with soft rings of sound; 4 the camp at dawn, jars full. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).uji = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    var dayC = new T.Color(0xc8b69a), dawnC = new T.Color(0xd8a27e), col = new T.Color();
    sc.background = dayC.clone(); sc.fog = new T.Fog(dayC.getHex(), 18, 70);
    var hemi = new T.HemisphereLight(0xe8ecff, 0x7a5a3a, 0.7); sc.add(hemi);
    var sun = new T.DirectionalLight(0xfff0d8, 1.6); sun.position.set(8, 14, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    var s = sun.shadow.camera; s.left = -8; s.right = 8; s.top = 8; s.bottom = -8; sc.add(sun);
    var wmat = new T.MeshStandardMaterial({ color: 0x1c5a6c, roughness: 0.12, metalness: 0.0, transparent: true, opacity: 0.9, emissive: 0x062028 });
    // the water in the bowl: a surface that rises, with a dome where it springs up
    var bw = new T.Mesh(new T.CircleGeometry(1, 48, 0, Math.PI * 2), wmat); bw.rotation.x = -Math.PI / 2; sc.add(bw);
    var dome = new T.Mesh(new T.SphereGeometry(0.06, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), wmat); sc.add(dome);
    var drops = []; for (var i = 0; i < 14; i++) { var d = new T.Mesh(new T.SphereGeometry(0.006, 8, 6), wmat); d.u = Math.random(); d.a = Math.random() * 6.28; sc.add(d); drops.push(d); }
    // a puddle that spreads and streams toward the jars
    var pud = new T.Mesh(new T.CircleGeometry(1, 48), new T.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.6, transparent: true, opacity: 0.5 })); pud.rotation.x = -Math.PI / 2; pud.position.y = 0.006; sc.add(pud);
    var nBowl = ctx.label(L.bowl || ''), nRef = ctx.label(L.ref || ''), nFood = ctx.label(L.food || ''), nCamp = ctx.label(L.camp || '');
    var fills = [], streams = [], plate = new T.Vector3(6, 0.1, 0), rings = X.rings(sc, { size: 0.5, life: 1.8, color: 0xfff2d0 });
    var ready = new Promise(function (ok) {
      ctx.model('models/mk-uji.json', function (g) {
        sc.add(g.scene); g.scene.updateMatrixWorld(true);
        g.scene.traverse(function (o) { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
        g.scene.traverse(function (o) {
          if (/^Fill\d\d/.test(o.name)) {
            var p = o.getWorldPosition(new T.Vector3()), isSkin = !!X.find(g.scene, 'Skin' + o.name.slice(4));
            var w = new T.Mesh(new T.CircleGeometry(isSkin ? 0.01 : 0.075, 24), wmat); w.rotation.x = -Math.PI / 2; w.position.set(p.x, isSkin ? 0.3 : 0.46, p.z); w.visible = !isSkin; sc.add(w);
            var skin = X.find(g.scene, 'Skin' + o.name.slice(4));
            var curve = new T.QuadraticBezierCurve3(new T.Vector3(0, 0.02, 0), new T.Vector3(p.x * 0.5, 0.03, p.z * 0.5), new T.Vector3(p.x * 0.92, 0.03, p.z * 0.92));
            var st = new T.Mesh(new T.TubeGeometry(curve, 24, 0.04, 8), new T.MeshStandardMaterial({ color: 0x3f8496, roughness: 0.05, transparent: true, opacity: 0.85, emissive: 0x0c3440 }));
            sc.add(st); fills.push({ w: w, skin: skin, d: p.length(), base: skin ? skin.scale.clone() : null }); streams.push(st);
          }
        });
        g.scene.traverse(function (o) { if (/^Plate/.test(o.name) && !o.isMesh && !o.children.length) plate = o.getWorldPosition(new T.Vector3()); });
        ok();
      }, ok);
    });
    var SH = [
      [[0.55, 0.5, 0.7], [0, 0.08, 0], 34, [0.03, 0, -0.03]],
      [[3.2, 3.6, 6.4], [0, 0.2, 0], 44, [-0.2, 0.1, 0.2]],
      [[0.32, 0.32, 0.42], [0, 0.1, 0], 30, [0.02, 0, -0.02]],
      [[6.5, 0.55, 0.75], [6, 0.08, 0], 34, [0.03, 0, -0.03]],
      [[-9, 6, 16], [0, 0.5, 0], 46, [0.4, 0, -0.4]]
    ];
    var k = 0, p = 0, t = 0;
    function chapter(i, instant) { k = i; var q = SH[i] || SH[0]; rig.go(q[0], q[1], q[2], q[3], instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; t += dt;
        // water level in the bowl: rises in chapter 1, brimming after
        var lvl = k === 0 ? X.seg(p, 0.05, 0.7) : 1, r = 0.12 + 0.105 * lvl;
        bw.position.y = 0.035 + 0.095 * lvl; bw.scale.set(r, r, 1);
        var spring = (k <= 2) ? 1 : 0.4; dome.position.set(0, bw.position.y, 0); dome.scale.set(1, (0.6 + 0.4 * Math.sin(t * 6)) * spring, 1);
        drops.forEach(function (d) { d.u = (d.u + dt * 1.3) % 1; var h = Math.sin(d.u * Math.PI) * 0.09 * spring; d.position.set(Math.cos(d.a) * d.u * 0.1, bw.position.y + h, Math.sin(d.a) * d.u * 0.1); d.visible = lvl > 0.1; });
        // overflow, streams and filling: chapter 2 (and full afterwards)
        var flow = k === 0 ? Math.max(0, X.seg(p, 0.7, 1)) * 0.1 : k === 1 ? X.seg(p, 0.0, 0.85) : 1;
        var pr0 = Math.max(0.001, 0.26 + flow * 4.2); pud.scale.set(pr0, pr0, 1); pud.material.opacity = 0.25 + 0.3 * Math.min(1, flow * 3);
        streams.forEach(function (st, j) { var f = fills[j], reach = Math.max(0, Math.min(1, (flow * 4.6 - f.d * 0.9))); st.visible = reach > 0.02 && (k === 1 || k === 4); st.scale.setScalar(1); st.geometry.setDrawRange(0, Math.floor(st.geometry.index.count * reach / 3) * 3);
          var full = Math.max(0, Math.min(1, (flow * 4.6 - f.d * 0.9 - 0.6) * 1.5)); if (f.skin) { f.skin.scale.set(f.base.x * (0.75 + 0.3 * full), f.base.y * (0.75 + 0.3 * full), f.base.z * (0.6 + 0.5 * full)); } else { f.w.scale.setScalar(0.3 + 0.7 * full); f.w.position.y = 0.3 + 0.16 * full; f.w.visible = full > 0.02; } });
        // the food: soft rings of sound rising from the plate
        rings.pos.set(plate.x, plate.y + 0.12 + (t * 0.3) % 0.15, plate.z); rings.rate = k === 3 ? 1.1 : 0; rings.update(dt);
        var dawn = k === 4 ? X.seg(p, 0, 0.6) : 0; col.copy(dayC).lerp(dawnC, dawn); sc.background.copy(col); sc.fog.color.copy(col); sc.fog.far = k === 4 ? 90 : 70;
        sun.position.set(8 - 20 * dawn, 14 - 10 * dawn, 6); sun.color.setHex(dawn > 0.4 ? 0xffc890 : 0xfff0d8);
        var show = p > 0.08 || !pl;
        nBowl.at(0, 0.32, 0).show(k === 0 && p > 0.3); nRef.at(0, 0.28, 0).show(k === 2 && show);
        nFood.at(plate.x, plate.y + 0.3, plate.z).show(k === 3 && show); nCamp.at(0, 2.2, -4).show((k === 1 && p > 0.6) || (k === 4 && show));
      }
    };
  };
})();
