/* Live scene: "His news that came true". Models from Blender (models/mk-parashikimet.json):
   a desert road with a stone for every century of the Hijrah, and a black lava ridge far ahead.
   Chapters: the statement; he tells of these events (night, year 0); 110 AH the last Companion dies;
   654 AH the fire in the Hijaz lights the sky. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).parashikimet = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    function Z(year) { return -year / 10; }        // 10 m per century -> three z
    var night = new T.Color(0x070a16), glowSky = new T.Color(0x4a1608);
    sc.background = night.clone(); sc.fog = new T.Fog(night.getHex(), 20, 160);
    var hemi = new T.HemisphereLight(0x5d6f9c, 0x1a120a, 0.16); sc.add(hemi);
    var moon = new T.DirectionalLight(0xaab8e0, 0.3); moon.position.set(30, 40, 20); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024);
    var s = moon.shadow.camera; s.left = -20; s.right = 20; s.top = 60; s.bottom = -60; s.far = 200; sc.add(moon);
    var sp = []; for (var i = 0; i < 1200; i++) { var th = Math.random() * Math.PI * 2, ph = Math.random() * 0.5 * Math.PI; sp.push(Math.cos(th) * Math.cos(ph) * 400, Math.sin(ph) * 400 + 5, Math.sin(th) * Math.cos(ph) * 400 - 60); }
    var stars = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(sp, 3)), new T.PointsMaterial({ size: 1.3, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0.9, fog: false, depthWrite: false }));
    sc.add(stars);
    // year 0: a night camp with a small fire and a circle of sitting stones (where he told his Companions; no people)
    var camp = new T.Group(); camp.position.set(-2.2, 0, 4);
    var stoneM = new T.MeshStandardMaterial({ color: 0x8a7a66, roughness: 0.95 });
    for (var si = 0; si < 9; si++) { var a = si / 9 * Math.PI * 2, st = new T.Mesh(new T.IcosahedronGeometry(0.28, 1), stoneM); st.scale.set(1.2, 0.6, 1); st.position.set(Math.cos(a) * 1.6, 0.1, Math.sin(a) * 1.6); st.castShadow = true; camp.add(st); }
    var campL = new T.PointLight(0xff9040, 0, 9, 2); campL.position.set(0, 0.5, 0); camp.add(campL);
    var fireG = K.glow(1.3, 'rgba(255,230,170,1)', 'rgba(255,120,40,.5)'); fireG.position.set(0, 0.35, 0); camp.add(fireG); sc.add(camp);
    var walker = new T.PointLight(0xffe2b0, 1.8, 14, 2); sc.add(walker); var wg = K.glow(1.6, 'rgba(255,240,210,1)', 'rgba(255,200,130,.3)'); sc.add(wg);
    // the fire: a wide glow and moving flames along the ridge
    var fireL = new T.PointLight(0xff5a14, 0, 260, 1.0); fireL.position.set(0, 18, -96); sc.add(fireL);
    var fireGlow = K.glow(120, 'rgba(255,140,50,.9)', 'rgba(255,70,20,.2)'); fireGlow.position.set(0, 10, -112); sc.add(fireGlow);
    var tongues = []; for (i = 0; i < 40; i++) { var f = K.glow(6, 'rgba(255,230,160,1)', 'rgba(255,90,20,.5)'); f.position.set((Math.random() - 0.5) * 90, 9 + Math.random() * 6, -112 - Math.random() * 8); sc.add(f); tongues.push(f); }
    var n110 = ctx.label(L.e1 || ''), n654 = ctx.label(L.e2 || ''), nYear = ctx.label('');
    var N = {}, ready = new Promise(function (ok) { ctx.model('models/mk-parashikimet.json', function (g) { sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; }); ok(); }, ok); });
    var k = 0, p = 0, playing = false, year = 0, lastK = -1;
    function chapter(i) { k = i; }
    var col = new T.Color();
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; playing = pl;
        var target = k <= 1 ? 0 : k === 2 ? 110 * seg(p, 0.05, 0.8) : 110 + 544 * seg(p, 0.05, 0.75);
        year += (target - year) * Math.min(1, dt * 3);
        var z = Z(year), camZ = z + 9;
        if (k <= 1) { if (lastK !== k) { lastK = k; if (k === 0) rig.go([-7, 3.2, 12], [2, 1, -10], 44, [0.5, 0, -0.6]); else rig.go([2.5, 2.4, 11], [-2.2, 0.3, 4], 40, [0.2, 0, -0.2]); } }
        else { lastK = k; rig.go([-3.2, 2.2 + (k === 3 ? 2.5 * seg(p, 0.6, 1) : 0), camZ], [2, 1.2 + (k === 3 ? 4 * seg(p, 0.6, 1) : 0), z - 14], 46, [0, 0, 0], true); }
        var fon = k <= 1 ? 1 : 0; campL.intensity = 2.2 * fon * (1 + Math.sin(now * 0.02) * 0.1 + Math.sin(now * 0.047) * 0.08); fireG.material.opacity = fon; camp.visible = k <= 2;
        walker.position.set(2, 1.6, z + 0.6); wg.position.copy(walker.position);
        var burn = k === 3 ? seg(p, 0.55, 0.85) : 0;
        fireL.intensity = 5 * burn; hemi.intensity = 0.16 + 0.25 * burn; fireGlow.material.opacity = 0.8 * burn; tongues.forEach(function (t, j) { t.material.opacity = burn * (0.6 + 0.4 * Math.sin(now * 0.006 + j)); t.scale.set(5 + 2 * Math.sin(now * 0.004 + j), 8 + 4 * Math.sin(now * 0.005 + j * 2), 1); });
        col.copy(night).lerp(glowSky, burn * 0.8); sc.background.copy(col); sc.fog.color.copy(col); stars.material.opacity = 0.9 * (1 - burn * 0.6);
        var show = p > 0.08 || !pl;
        nYear.text((L.year || '') + ' ' + Math.round(year) + ' ' + (L.unit || '')).at(2, 2.8, z).show(k >= 1 && show);
        n110.at(2, 2.2, Z(110)).show(k === 2 && p > 0.7 || (k === 3 && p < 0.15));
        n654.at(0, 9, -106).show(k === 3 && p > 0.8);
      }
    };
  };
})();
