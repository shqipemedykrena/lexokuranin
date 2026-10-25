/* Live scene: "The news about the Romans". Models from Blender (models/mk-romaket.json): a desert plateau,
   ten standing stones (one per year after the Romans' defeat) and an hourglass at year 0.
   A light walks from stone to stone while days and nights pass. The window of bid' (3 to 9 years) glows on the
   ground, Abu Bakr's seven years are marked, two more are added, and the news comes before year 9 ends.
   Map chapters (models/mk-empires.json, a relief map of the Near East built in Blender): 1 Makkah mocks the
   Muslims; 2 who was stronger: the lands of the Persians glow and their lights move to "the nearest land", the
   Roman lands are dim; 8 the year of Hudaybiyyah: the Roman lands light up, the Persian lights pull back, and a
   light walks from Homs to Iliya (Jerusalem); 9 wide: the proof. Plateau chapters: 0 and 3-7. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).romaket = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, ch = ctx.ch || [], L = ctx.L || {};
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    function Y(year) { return -4 * year; }          // three.js z of a year's stone
    var dusk = new T.Color(0x3a2a36), day = new T.Color(0xc9a882), night = new T.Color(0x0b1020);
    sc.background = dusk.clone(); sc.fog = new T.Fog(dusk.getHex(), 18, 90);
    var hemi = new T.HemisphereLight(0x9fb4d8, 0x4a3020, 0.5); sc.add(hemi);
    var sun = new T.DirectionalLight(0xffc890, 1.4); sun.position.set(-30, 18, -10); sun.target.position.set(0, 0, -20);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); var s = sun.shadow.camera; s.left = -12; s.right = 12; s.top = 30; s.bottom = -30; s.near = 1; s.far = 120; sun.shadow.bias = -0.0005;
    sc.add(sun, sun.target);
    // stars for the nights
    var sp = []; for (var i = 0; i < 900; i++) { var th = Math.random() * Math.PI * 2, ph = Math.random() * 0.45 * Math.PI; sp.push(Math.cos(th) * Math.cos(ph) * 300, Math.sin(ph) * 300 + 10, Math.sin(th) * Math.cos(ph) * 300 - 20); }
    var stars = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(sp, 3)), new T.PointsMaterial({ size: 1.4, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    sc.add(stars);
    // the walking light (time), the glowing band (3 to 9 years), the bet marker (7), the news burst
    var walker = new T.PointLight(0xffd9a0, 0, 10, 2); sc.add(walker);
    var wGlow = K.glow(1.4, 'rgba(255,235,200,1)', 'rgba(255,190,120,.3)'); sc.add(wGlow);
    function strip(color) { var m = new T.Mesh(new T.PlaneGeometry(1.4, 1), new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(1.2, 0.03, 0); sc.add(m); return m; }
    var band = strip(0x4fd18a), extra = strip(0xffc860);
    var betGlow = K.glow(2.2, 'rgba(255,215,120,1)', 'rgba(255,170,60,.25)'); sc.add(betGlow); betGlow.position.set(1.2, 1.6, Y(7));
    var news = K.glow(9, 'rgba(255,255,240,1)', 'rgba(255,210,140,.25)'); sc.add(news); news.position.set(1.2, 1.4, Y(8.6));
    var nBand = ctx.label(L.band || ''), nBet = ctx.label(L.bet || ''), nAdd = ctx.label(L.add || ''), nNews = ctx.label(L.news || ''), nYear = ctx.label('');
    var N = {}, ready = new Promise(function (ok) {
      ctx.model('models/mk-romaket.json', function (g) { sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; if (o.isMesh && /Year/.test(o.name)) { o.material = o.material.clone(); } }); ok(); }, ok);
    });
    // ---- the map of the two empires, placed away from the plateau ----
    var X = window.IkreKit, MX = 400, mapStars = X.stars(sc, 1600, 900), mapG = new T.Group(); mapG.position.set(MX, 0, 0); mapG.scale.set(0.12, 0.45, 0.12); sc.add(mapG);
    var M = {}, R = {}, over = {}, tl = new T.TextureLoader();
    function mask(name, color, add) {
      var t = tl.load(ctx.base + 'models/tex/' + name + '.jpg'); t.flipY = false;
      return new T.MeshBasicMaterial({ color: color, alphaMap: t, transparent: true, opacity: 0, depthWrite: false, blending: add ? T.AdditiveBlending : T.NormalBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, fog: false, toneMapped: false });
    }
    var armies = [], ARMY = 90, army = new T.Group(); sc.add(army);
    for (var ai = 0; ai < ARMY; ai++) { var a = K.glow(0.5, 'rgba(255,200,120,1)', 'rgba(255,90,30,.35)'); a.material.opacity = 0; army.add(a); armies.push([a, Math.random(), (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9]); }
    var walkerM = K.glow(1.1, 'rgba(255,245,215,1)', 'rgba(255,205,120,.35)'); walkerM.material.opacity = 0; sc.add(walkerM);
    var trail = null, trailN = 0, mkGlow = K.glow(1.6, 'rgba(255,240,200,1)', 'rgba(255,200,120,.3)'); mkGlow.material.opacity = 0; sc.add(mkGlow);
    var nearGlow = K.glow(3.2, 'rgba(255,160,90,1)', 'rgba(255,90,40,.25)'); nearGlow.material.opacity = 0; sc.add(nearGlow);
    var mLab = { persia: ctx.label(L.persia || ''), rome: ctx.label(L.rome || ''), near: ctx.label(L.near || ''), makkah: ctx.label(L.makkah || ''), hims: ctx.label(L.hims || ''), iliya: ctx.label(L.iliya || '') };
    var mapReady = new Promise(function (ok) {
      ctx.model('models/mk-empires.json', function (g) {
        mapG.add(g.scene); mapG.updateMatrixWorld(true);
        g.scene.traverse(function (o) {
          if (/^P_/.test(o.name)) M[o.name.slice(2)] = o.getWorldPosition(new T.Vector3());
          if (/^R_/.test(o.name) && o.userData.pts) { try { R[o.name.slice(2)] = JSON.parse(o.userData.pts).map(function (q) { return mapG.localToWorld(new T.Vector3(q[0], q[2], -q[1])); }); } catch (e) {} }
          if (o.isMesh && o.name === 'Land') {
            over.rome = new T.Mesh(o.geometry, mask('emp_rome', 0x4a3fc4)); over.persia = new T.Mesh(o.geometry, mask('emp_persia', 0xff5a1a, true));
            [over.rome, over.persia].forEach(function (m) { m.position.copy(o.position); m.quaternion.copy(o.quaternion); m.scale.copy(o.scale); o.parent.add(m); m.renderOrder = 2; });
          }
        });
        if (R.heraclius) { var pts = R.heraclius, cv = new T.CatmullRomCurve3(pts), pp = cv.getPoints(120); trailN = pp.length;
          trail = new T.Group(); trailN = 48; for (var ti = 0; ti < trailN; ti++) { var d = K.glow(0.45, 'rgba(255,240,200,1)', 'rgba(255,200,110,.3)'); d.position.copy(cv.getPointAt(ti / (trailN - 1))); d.position.y += 0.12; d.material.opacity = 0.9; trail.add(d); } trail.visible = false; sc.add(trail); R.herCurve = cv; }
        if (R.armies) R.armyCurve = new T.CatmullRomCurve3(R.armies);
        ok();
      }, ok);
    });
    ready = Promise.all([ready, mapReady]);
    function mp(name, dx, dy, dz) { var v = M[name] ? M[name].clone() : new T.Vector3(MX, 0, 0); return [v.x + (dx || 0), v.y + (dy || 0), v.z + (dz || 0)]; }
    function isMap(i) { return i === 1 || i === 2 || i === 8 || i === 9; }
    function mapShot(i) {
      var mk = mp('Makkah'), nr = mp('Near'), hm = mp('Hims'), il = mp('Iliya');
      if (i === 1) return [[mk[0] - 3, mk[1] + 11, mk[2] + 10], [(mk[0] + nr[0]) / 2, 0, (mk[2] + nr[2]) / 2 - 1], 44, [0, -0.8, -1.2]];
      if (i === 2) return [[MX + 2, 26, 24], [MX + 2, 0, -2], 46, [0, -1.5, -1.5]];
      if (i === 8) return [[hm[0] - 4, 13, (hm[2] + il[2]) / 2 + 12], [(hm[0] + il[0]) / 2 + 1, 0, (hm[2] + il[2]) / 2 - 1], 40, [0.4, -0.6, -0.8]];
      return [[MX - 2, 30, 30], [MX, 0, 0], 48, [0, -2, -2]];
    }
    var shots = [
      [[-6, 4.5, 9], [1.2, 0.8, -16], 42, [0.6, 0, -0.6]],
      [[0.2, 1.1, 1.6], [1.2, 0.7, 0], 34, [0.15, 0, -0.1]],
      [[-3.2, 2.0, -2], [1.2, 0.9, -8], 44, [0, 0, -2]],
      [[-5.5, 4.0, -8], [1.2, 0.4, -22], 48, [0, 0, -2.5]],
      [[-3.5, 2.4, -22], [1.2, 1.0, -30], 42, [0, 0, -1.5]],
      [[-4.2, 2.2, -27], [1.2, 1.4, -34.4], 40, [0.4, 0, 0.2]]
    ];
    var k = 0, p = 0, playing = false, lastK = -1, ko = 0;
    function chapter(i, instant) {
      var cut = instant || lastK < 0 || isMap(i) !== isMap(lastK); lastK = i; k = i;
      var q = isMap(i) ? mapShot(i) : (shots[i === 0 ? 0 : i - 2] || shots[0]); rig.go(q[0], q[1], q[2], q[3], cut);
    }
    // the year the light has reached, per chapter
    function yearAt() {
      var k = ko;
      if (k <= 1) return 0;
      if (k === 2) return 2.2 * seg(p, 0.05, 0.9);
      if (k === 3) return 2.2 + (6.4 - 2.2) * seg(p, 0.05, 0.9);
      if (k === 4) return 6.4 + 0.6 * seg(p, 0.05, 0.5);
      return 7 + 1.6 * seg(p, 0.05, 0.6);
    }
    var col = new T.Color();
    function state(now) {
      var k = ko, y = yearAt(), frac = y - Math.floor(y), moving = (k >= 2 && p < 0.92 && k !== 4) || (k === 4 && p < 0.5);
      // day and night as the years pass: each year one dip into night while the light moves
      var dark = moving ? Math.pow(Math.sin(frac * Math.PI), 6) * 0.85 : 0;
      col.copy(dusk).lerp(night, dark); sc.background.copy(col); sc.fog.color.copy(col);
      sun.intensity = 1.4 * (1 - dark); hemi.intensity = 0.5 * (1 - dark * 0.7); stars.material.opacity = Math.min(1, dark * 1.3 + (k === 0 ? 0.15 : 0));
      walker.intensity = k >= 1 ? 2.2 : 0; walker.position.set(1.2, 1.2, Y(y) + 1.2); wGlow.position.set(1.2, 1.0, Y(y) + 1.2); wGlow.material.opacity = k >= 1 ? 0.85 : 0;
      for (var j = 1; j <= 10; j++) { var o = N['Year' + j]; if (o && o.material) { var lit = y >= j - 0.05; o.material.emissive = o.material.emissive || new T.Color(); o.material.emissive.setHex(lit ? (j >= 3 && j <= 9 && k >= 3 ? 0x1d5a38 : 0x3a2a14) : 0x000000); } }
      // band 3..9 from chapter 4; the extra two years (7..9) gold from chapter 5
      var bo = k >= 3 ? (k === 3 ? seg(p, 0.0, 0.25) : 1) : 0;
      band.material.opacity = 0.16 * bo; band.scale.y = 24 * Math.max(0.01, bo); band.position.z = (Y(3) + Y(3) - 24 * bo) / 2 + 0;
      var eo = k >= 4 ? (k === 4 ? seg(p, 0.55, 0.85) : 1) : 0;
      extra.material.opacity = 0.22 * eo; extra.scale.y = 8 * Math.max(0.01, eo); extra.position.z = Y(7) - 4 * eo; extra.position.y = 0.04;
      betGlow.material.opacity = k >= 4 ? (k === 4 ? seg(p, 0.35, 0.55) : 0.6) * (0.85 + 0.15 * Math.sin(now * 0.004)) : 0;
      var nb = k === 5 ? seg(p, 0.55, 0.7) * (1 - 0.6 * seg(p, 0.75, 1)) : 0; news.material.opacity = nb; news.scale.setScalar(4 + 10 * nb);
      // sand runs down through the whole story
      var run = k === 0 ? 0 : Math.min(1, (k - 1 + p) / 5);
      if (N.SandTop) N.SandTop.scale.set(1 - 0.6 * run, 1 - 0.7 * run, 1 - 0.6 * run);
      if (N.SandBottom) N.SandBottom.scale.set(0.45 + 0.6 * run, 0.35 + 1.0 * run, 0.45 + 0.6 * run);
      var show = p > 0.1 || !playing;
      nYear.text((L.year || '') + ' ' + Math.floor(y + 0.0001)).at(1.2, 2.2, Y(Math.floor(y + 0.0001))).show(k >= 1 && k <= 3 && show);
      nBand.at(1.2, 0.2, Y(5.5)).show(k === 3 && p > 0.25);
      nBet.at(1.2, 1.9, Y(7)).show(k === 4 && p > 0.3 && p < 0.7);
      nAdd.at(1.2, 1.9, Y(8.4)).show(k === 4 && p >= 0.62);
      nNews.at(1.2, 2.4, Y(8.6)).show(k === 5 && p > 0.62);
    }
    var night = new T.Color(0x0a1322), t0 = 0;
    function mapState(dt, now) {
      var i = k; t0 += dt;
      sc.background.copy(night); sc.fog.color.copy(night); sc.fog.near = 60; sc.fog.far = 260; stars.material.opacity = 0; mapStars.material.opacity = 0.75;
      sun.intensity = 0.5; hemi.intensity = 0.32; walker.intensity = 0; wGlow.material.opacity = 0;
      var pulse = 0.85 + 0.15 * Math.sin(now * 0.003);
      var pers = i === 1 ? 0.25 + 0.2 * seg(p, 0.2, 0.7) : i === 2 ? (0.3 + 0.35 * seg(p, 0.05, 0.4)) * pulse : i === 8 ? 0.5 * (1 - seg(p, 0.1, 0.6)) + 0.1 : 0.2;
      var rom = i === 1 ? 0.1 : i === 2 ? 0.1 : i === 8 ? 0.1 + 0.45 * seg(p, 0.1, 0.5) : 0.2;
      if (over.persia) { over.persia.material.opacity = pers; over.rome.material.opacity = rom; }
      // the Persian lights: they move west to the nearest land (chapter 2) and back east (chapter 8)
      var ac = R.armyCurve, flow = i === 2 ? seg(p, 0.1, 0.9) : i === 8 ? 1 - seg(p, 0.05, 0.6) : i === 1 ? 1 : 0;
      armies.forEach(function (a, j) {
        var on = ac && (i === 1 || i === 2 || i === 8); a[0].visible = !!on; if (!on) return;
        var u = Math.min(0.999, Math.max(0, flow * (0.55 + 0.45 * a[1]) - 0.02 * Math.sin(t0 * 0.7 + j))), q = ac.getPointAt(u);
        a[0].position.set(q.x + a[2] * 3, q.y + 0.25, q.z + a[3] * 3); a[0].material.opacity = (i === 8 ? 0.4 + 0.5 * (1 - seg(p, 0.4, 0.9)) : 0.85) * (0.7 + 0.3 * Math.sin(now * 0.006 + j));
        a[0].scale.setScalar(i === 1 ? 0.9 : 1.3);
      });
      var nr = M.Near; if (nr) { nearGlow.position.set(nr.x, nr.y + 0.3, nr.z); nearGlow.material.opacity = i === 2 ? 0.7 * seg(p, 0.55, 0.85) * pulse : i === 1 ? 0.5 * pulse : 0; }
      var mk = M.Makkah; if (mk) { mkGlow.position.set(mk.x, mk.y + 0.25, mk.z); mkGlow.material.opacity = i === 1 ? 0.9 : i === 9 ? 0.6 + 0.3 * seg(p, 0.2, 0.8) : 0.35; }
      // Heraclius walks from Homs to Iliya
      if (trail) { var w = i === 8 ? seg(p, 0.45, 0.92) : i === 9 ? 1 : 0; trail.children.forEach(function (d, j) { d.visible = j / (trailN - 1) <= w; }); trail.visible = w > 0;
        walkerM.material.opacity = i === 8 && p > 0.43 ? 0.95 : 0; if (R.herCurve) { var q = R.herCurve.getPointAt(Math.max(0.001, Math.min(0.999, w))); walkerM.position.set(q.x, q.y + 0.2, q.z); } }
      var show = p > 0.08 || !playing;
      if (M.Persia) mLab.persia.at(M.Persia.x, M.Persia.y + 1.2, M.Persia.z).show((i === 2 || i === 8 || i === 9) && show);
      if (M.Rome) mLab.rome.at(M.Rome.x, M.Rome.y + 1.2, M.Rome.z).show((i === 2 || i === 8 || i === 9) && show);
      if (nr) mLab.near.at(nr.x, nr.y + 0.9, nr.z).show((i === 1 || (i === 2 && p > 0.5)) && show);
      if (mk) mLab.makkah.at(mk.x, mk.y + 0.8, mk.z).show((i === 1 || i === 9) && show);
      if (M.Hims) mLab.hims.at(M.Hims.x, M.Hims.y + 0.8, M.Hims.z).show(i === 8 && p > 0.3);
      if (M.Iliya) mLab.iliya.at(M.Iliya.x, M.Iliya.y + 0.8, M.Iliya.z).show(i === 8 && p > 0.8);
    }
    function hideMap() {
      armies.forEach(function (a) { a[0].visible = false; }); nearGlow.material.opacity = mkGlow.material.opacity = walkerM.material.opacity = 0; if (trail) trail.visible = false;
      for (var n in mLab) mLab[n].show(false);
      sc.fog.near = 18; sc.fog.far = 90; mapStars.material.opacity = 0;
    }
    function hidePlateau() { nYear.show(false); nBand.show(false); nBet.show(false); nAdd.show(false); nNews.show(false); news.material.opacity = 0; betGlow.material.opacity = 0; }
    return { ready: ready, chapter: chapter, update: function (dt, now, i, pp, pl) {
      if (i !== lastK) chapter(i, false);
      k = i; p = pp; playing = pl;
      if (isMap(i)) { hidePlateau(); mapState(dt, now); } else { hideMap(); ko = i === 0 ? 0 : i - 2; state(now); }
    } };
  };
})();
