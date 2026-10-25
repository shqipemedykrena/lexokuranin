/* Live scene: news of the unseen (Quran 11:49, 3:44, 28:44-45). Models from Blender (models/mk-gajbi.json, mk-valley.json).
   0 verse: the ark in a storm at night; 1 the storm eases; 2 calm sea at dawn, the ark labelled;
   3 three shots: reed pens laid out for the lots (Maryam), the mountain, the well of Madyan (Musa);
   4 the Makkah valley at night. No people. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).gajbi = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    var stormC = new T.Color(0x10151c), dawnC = new T.Color(0x9a8a88), dayC = new T.Color(0xb9c4cc), nightC = new T.Color(0x070b18), col = new T.Color();
    sc.background = stormC.clone(); sc.fog = new T.Fog(stormC.getHex(), 40, 260);
    var hemi = new T.HemisphereLight(0x9aa8c0, 0x20262c, 0.5); sc.add(hemi);
    var sun = new T.DirectionalLight(0xffe2c0, 0.2); sun.position.set(80, 60, 60); sc.add(sun);
    var flash = new T.DirectionalLight(0xdfe8ff, 0); flash.position.set(-40, 120, -100); sc.add(flash);
    var sea = X.water(320, 120, 0x1b3440, { amp: 1.6, len: 7 }); sc.add(sea);
    var rainP = []; for (var i = 0; i < 2500; i++) rainP.push((Math.random() - 0.5) * 120, Math.random() * 60, (Math.random() - 0.5) * 120);
    var rain = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(rainP, 3)), new T.PointsMaterial({ size: 0.12, color: 0xaebccc, transparent: true, opacity: 0.6, depthWrite: false }));
    sc.add(rain);
    var stars = X.stars(sc, 1400, 1500);
    var nNoah = ctx.label(L.noah || ''), nLots = ctx.label(L.maryam || ''), nTur = ctx.label(L.mount || ''), nMad = ctx.label(L.madyan || ''), nMak = ctx.label(L.makkah || '');
    var N = {}, valley = null, ready = new Promise(function (ok) {
      ctx.model('models/mk-gajbi.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; if (o.isMesh) o.castShadow = o.receiveShadow = true; });
        var ark = new T.Group(); sc.add(ark); ['Hull', 'ArkTop'].forEach(function (n) { if (N[n]) ark.attach(N[n]); }); N.ark = ark;
        ctx.model('models/mk-valley.json', function (v) { valley = v.scene; valley.position.set(1200, 0, 0); valley.visible = false; sc.add(valley); ok(); }, ok);
      }, ok);
    });
    var SH = [
      [[-28, 6, 26], [0, 3, 0], 44, [2, 0, -2]],
      [[-34, 9, 18], [0, 3, 0], 44, [2, 0, -2]],
      [[30, 8, 30], [0, 4, 0], 40, [-2, 0, -2]],
      [[[201.4, 1.2, 1.6], [200, 0.3, 0], 34, [0.1, 0, -0.1]], [[400, 25, 140], [400, 40, -30], 44, [0, 0, -4]], [[604, 2.6, 5.5], [600, 1.0, 0], 38, [0.2, 0, -0.2]]],
      [[1110, 30, 80], [1200, 8, -10], 46, [4, 0, -4]]
    ];
    var shot = X.shots(rig, SH), k = 0, p = 0, t = 0, calm = 0, light = 0;
    function chapter(i, instant) { k = i; shot(i, 0, instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; t += dt; shot(k, p);
        var targetCalm = k === 0 ? 0 : k === 1 ? X.seg(p, 0.1, 0.9) : 1; calm += (targetCalm - calm) * Math.min(1, dt * 2);
        sea.amp = 1.6 - 1.4 * calm; sea.wave(t); sea.visible = k < 3;
        rain.visible = calm < 0.95 && k < 3; rain.material.opacity = 0.6 * (1 - calm);
        var A = rain.geometry.attributes.position; for (var j = 0; j < A.count; j++) { var y = A.getY(j) - dt * 40; if (y < 0) y += 60; A.setY(j, y); } A.needsUpdate = true;
        // the ark rides the waves
        var bob = Math.sin(t * 0.8) * (1.2 - calm), roll = Math.sin(t * 0.6) * 0.08 * (1 - calm * 0.8);
        if (N.ark) { N.ark.position.y = bob * 0.8 + 0.6; N.ark.rotation.z = roll; N.ark.rotation.x = Math.sin(t * 0.5) * 0.04 * (1 - calm); }
        // light: storm, then dawn, then day for the far places, night in Makkah
        var target = k <= 1 ? stormC.clone().lerp(dawnC, calm * 0.6) : k === 2 ? dawnC : k === 3 ? dayC : nightC;
        col.copy(sc.background).lerp(target, Math.min(1, dt * 2)); sc.background.copy(col); sc.fog.color.copy(col);
        sc.fog.far = k === 3 ? 600 : k === 4 ? 900 : 260;
        hemi.intensity = k === 3 ? 0.9 : k === 4 ? 0.35 : 0.5 + 0.3 * calm; sun.intensity = k === 3 ? 1.6 : k === 2 ? 1.0 : 0.2;
        var fl = (k === 0 && (Math.sin(now * 0.0013) > 0.985 || Math.sin(now * 0.0021 + 1) > 0.992)) ? 2.5 : 0; flash.intensity += (fl - flash.intensity) * 0.5;
        stars.material.opacity = k === 4 ? 0.9 : 0; if (valley) valley.visible = k === 4;
        var show = p > 0.08 || !pl, j3 = Math.min(2, Math.floor(p * 3));
        nNoah.at(0, 9, 0).show(k === 2 && show);
        nLots.at(200.6, 0.45, 0.7).show(k === 3 && j3 === 0 && show); nTur.at(400, 66, -30).show(k === 3 && j3 === 1); nMad.at(600, 3.2, 0).show(k === 3 && j3 === 2);
        nMak.at(1200, 10, 10).show(k === 4 && show);
      }
    };
  };
})();
