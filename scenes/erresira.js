/* Live scene: "Darkness in the deep sea" (Quran 24:40). Built in three.js with Blender textures:
   the camera sinks from the surface; a depth gauge on the left; light fades in layers (red first, blue last);
   divers' limit at about 20 m; intense darkness at about 200 m; an inner wave between upper and lower layers.
   Depths of the colours are simplified, as on the page. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).erresira = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    var S = 0.1;   // 1 unit = 10 m
    sc.background = new T.Color(0x2a7fa0); sc.fog = new T.FogExp2(0x2a7fa0, 0.08);
    var hemi = new T.HemisphereLight(0xbfefff, 0x062030, 1.1); sc.add(hemi);
    var lamp = new T.PointLight(0x9fd8ff, 0, 14, 2); sc.add(lamp);   // a faint lamp at the camera so the inner wave can be seen
    var sun = new T.DirectionalLight(0xffffff, 1.2); sun.position.set(3, 30, 4); sc.add(sun);
    // the surface seen from below: a moving sheet of light
    var cw = 256, cvs = document.createElement('canvas'); cvs.width = cvs.height = cw; var cx = cvs.getContext('2d');
    var surfTex = new T.CanvasTexture(cvs); surfTex.wrapS = surfTex.wrapT = T.RepeatWrapping; surfTex.repeat.set(8, 8);
    function caustic(t) {
      cx.fillStyle = '#2a8fb0'; cx.fillRect(0, 0, cw, cw);
      for (var i = 0; i < 60; i++) { var x = (Math.sin(i * 12.9 + t * 0.4) * 0.5 + 0.5) * cw, y = (Math.cos(i * 7.3 + t * 0.3) * 0.5 + 0.5) * cw, r = 18 + 14 * Math.sin(i + t);
        var g = cx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(230,255,255,.55)'); g.addColorStop(1, 'rgba(230,255,255,0)'); cx.fillStyle = g; cx.fillRect(x - r, y - r, r * 2, r * 2); }
      surfTex.needsUpdate = true;
    }
    var surf = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshBasicMaterial({ map: surfTex, side: T.DoubleSide, fog: false, transparent: true, opacity: 1 }));
    surf.rotation.x = Math.PI / 2; surf.position.y = 0; sc.add(surf);
    // above the surface for the verse: a storm sea with waves upon waves and heavy clouds
    var X = window.IkreKit, topSea = X.water(300, 140, 0x0e2634, { amp: 0.9, len: 2.2 }); topSea.position.y = 0.02; sc.add(topSea);
    var topSea2 = X.water(300, 70, 0x16323f, { amp: 0.5, len: 7, alpha: 0.6 }); topSea2.position.y = 0.3; sc.add(topSea2);
    var clouds = new T.Group(); for (var ci = 0; ci < 40; ci++) { var cl = K.glow(18 + Math.random() * 20, 'rgba(70,78,92,.95)', 'rgba(50,56,68,.5)', false); cl.position.set((Math.random() - 0.5) * 160, 10 + Math.random() * 8, -10 - Math.random() * 120); clouds.add(cl); } sc.add(clouds);
    var stormC = new T.Color(0x2a323c);
    // light shafts from above
    var shafts = new T.Group(); sc.add(shafts);
    var grad = document.createElement('canvas'); grad.width = 4; grad.height = 128; var gx = grad.getContext('2d'), gg = gx.createLinearGradient(0, 0, 0, 128);
    gg.addColorStop(0, 'rgba(255,255,255,.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 4, 128);
    var am = new T.CanvasTexture(grad);
    for (var i = 0; i < 14; i++) {
      var m = new T.Mesh(new T.PlaneGeometry(0.4 + Math.random() * 0.9, 24), new T.MeshBasicMaterial({ color: 0xdfffff, alphaMap: am, transparent: true, opacity: 0.12, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false }));
      m.position.set((Math.random() - 0.5) * 20, -12, -4 - Math.random() * 14); m.rotation.set(0, Math.random() * Math.PI, 0.15); shafts.add(m);
    }
    // floating particles all the way down
    var pp = []; for (i = 0; i < 2500; i++) pp.push((Math.random() - 0.5) * 16, -Math.random() * 230 * S * 10 / 10 * 1.0, -2 - Math.random() * 14);
    var parts = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(pp, 3)), new T.PointsMaterial({ size: 0.05, color: 0xe8ffff, transparent: true, opacity: 0.6, depthWrite: false, map: K.glowTex('rgba(255,255,255,1)', 'rgba(255,255,255,.2)') }));
    sc.add(parts);
    // the inner wave: a moving sheet between the upper and lower layers (at about 100 m here)
    var iwG = new T.PlaneGeometry(60, 40, 80, 50); iwG.rotateX(-Math.PI / 2);
    var iw = new T.Mesh(iwG, new T.MeshStandardMaterial({ color: 0x1d5f80, transparent: true, opacity: 0.0, roughness: 0.25, metalness: 0.1, side: T.DoubleSide, depthWrite: false }));
    iw.position.set(0, -100 * S, -10); sc.add(iw);
    var base = iwG.attributes.position.array.slice();
    // rocks of the slope on one side (Blender rock texture)
    var tl = new T.TextureLoader(), rockMap = tl.load(ctx.base + 'models/tex/rock.jpg'), rockN = tl.load(ctx.base + 'models/tex/rock_n.jpg');
    rockMap.encoding = T.sRGBEncoding; [rockMap, rockN].forEach(function (t) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 3); });
    var rockM = new T.MeshStandardMaterial({ map: rockMap, normalMap: rockN, roughness: 0.95, color: 0x9aa6a8 });
    for (i = 0; i < 26; i++) { var g = new T.IcosahedronGeometry(1 + Math.random() * 2.5, 2), a = g.attributes.position;
      for (var j = 0; j < a.count; j++) { var v = new T.Vector3().fromBufferAttribute(a, j), n = 1 + 0.25 * Math.sin(v.x * 2.1 + i) * Math.cos(v.y * 1.7 + v.z); a.setXYZ(j, v.x * n, v.y * n, v.z * n); }
      g.computeVertexNormals(); var r = new T.Mesh(g, rockM); r.position.set(-9 - Math.random() * 4, -i * 0.9 - Math.random(), -6 - Math.random() * 10); sc.add(r); }
    // depth gauge (HTML labels pinned at depths along a line)
    var gauge = [[20, L.diver || '20 m'], [200, L.dark || '200 m']].map(function (d) { return [d[0], ctx.label(d[1])]; });
    var nInner = ctx.label(L.inner || ''), nCol = ctx.label('');
    var colorsLeft = [['red', 0xff3b30, 12], ['orange', 0xff9500, 30], ['yellow', 0xffd60a, 60], ['green', 0x34c759, 110], ['blue', 0x0a84ff, 200]];
    var names = L.names || ['red', 'orange', 'yellow', 'green', 'blue'];
    var shots = [[[0, -0.6, 4], [0, 0.2, -10], 55, [0, 0, 0]], [[0, -2.5, 4], [0, -3.5, -10], 52, [0, 0, 0]], [[0, -10, 4], [0, -10.4, -10], 50, [0, 0, 0]]];
    var k = 0, p = 0, playing = false, depth = 0, t0 = 0;
    function chapter(i, instant) { k = i; }
    var bg = new T.Color(), top = new T.Color(0x2a7fa0), mid = new T.Color(0x07324a), deep = new T.Color(0x000306);
    return {
      chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; playing = pl; t0 += dt;
        // depth in metres per chapter: verse 0-5 m; divers to 20 then down to 200; inner waves 200 -> 230
        var target = k === 0 ? -12 + 22 * seg(p, 0.5, 0.95) : k === 1 ? 10 + 190 * seg(p, 0.05, 0.95) : 200 - 100 * seg(p, 0, 0.35) + 0;
        if (k === 2 && p > 0.6) target = 100 + 130 * seg(p, 0.6, 1);
        depth += (target - depth) * Math.min(1, dt * 2.2);
        var y = -depth * S, above = depth < 0;
        if (above) rig.go([0, 1.6 - depth * 0.05, 4], [0, 0.8 + (depth + 12) * 0.05, -10], 50, [0, 0, 0], true); else rig.go([0, y, 4], [0, y - 0.6, -10], 50, [0, 0, 0], true);
        topSea.visible = topSea2.visible = clouds.visible = above || depth < 1; topSea.wave(t0); topSea2.wave(t0 * 1.3 + 2);
        var f = Math.max(0, Math.min(1, depth / 200)); bg.copy(top).lerp(mid, Math.min(1, f * 1.6)); if (f > 0.55) bg.lerp(deep, (f - 0.55) / 0.45);
        if (above) { bg.copy(stormC); } sc.background.copy(bg); sc.fog.color.copy(bg); sc.fog.density = above ? 0.012 : 0.06 + 0.12 * Math.max(0, f);
        hemi.intensity = above ? 0.35 : 1.1 * Math.pow(1 - f, 2.2); sun.intensity = above ? 0.25 : 1.2 * Math.pow(1 - f, 3);
        hemi.color.setRGB(Math.max(0, 0.75 - f * 3), 0.94 - f * 0.6, 1);   // red goes first, blue stays longest
        shafts.children.forEach(function (m) { m.material.opacity = 0.12 * Math.max(0, 1 - depth / 60); });
        surf.material.opacity = Math.max(0, Math.min(1, 1 - depth / 40)); surf.visible = !above;
        if (Math.floor(t0 * 10) % 3 === 0) caustic(t0);
        // inner wave moves
        var A = iwG.attributes.position; for (var j = 0; j < A.count; j++) { var bx = base[j * 3], bz = base[j * 3 + 2]; A.setY(j, Math.sin(bx * 0.25 + t0 * 0.6) * 0.8 + Math.sin(bz * 0.3 + t0 * 0.4) * 0.5); } A.needsUpdate = true; iwG.computeVertexNormals();
        iw.material.opacity = k === 2 ? 0.7 * seg(p, 0.1, 0.4) : 0; lamp.position.set(0, y + 0.5, 3); lamp.intensity = k === 2 ? 1.6 * seg(p, 0.05, 0.3) : 0; iw.material.emissive = iw.material.emissive || new T.Color(); iw.material.emissive.setHex(0x0c3346);
        // labels
        var show = p > 0.08 || !pl;
        gauge.forEach(function (gp) { gp[1].at(1.2, -gp[0] * S, -2).show(k === 1 && Math.abs(depth - gp[0]) < 35 && show); });
        nInner.at(1.5, -100 * S + 0.8, -6).show(k === 2 && p > 0.25 && p < 0.75);
        var left = colorsLeft.filter(function (c) { return depth < c[2]; }).map(function (c, j) { return names[colorsLeft.indexOf(c)]; });
        nCol.text((L.colors || '') + ' ' + (left.length ? left.join(', ') : (L.none || '—')) + '  ·  ' + Math.round(depth) + ' m').at(-1.6, y - 1.25, -3).show(k >= 1 && show);
      }
    };
  };
})();
