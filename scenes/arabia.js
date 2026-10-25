/* Live scene: a relief map of the Hijaz and the Red Sea (Blender, models/arabia.json) for the history pages.
   Each chapter gets a directive from the page (ctx.L.story[k]): which place to fly to, which route to draw,
   which places glow, night or day, and the date. Place names come from ctx.L.names. No people are shown. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).arabia = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {}, STORY = L.story || [], NAMES = L.names || {};
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    var day = new T.Color(0xa99478), dusk = new T.Color(0x3b2a33), night = new T.Color(0x060914);
    sc.background = day.clone(); sc.fog = new T.Fog(day.getHex(), 50, 190);
    var hemi = new T.HemisphereLight(0xdfe8ff, 0x6a4a30, 0.7); sc.add(hemi);
    var sun = new T.DirectionalLight(0xffe2b8, 1.5); sun.position.set(-60, 80, 40); sc.add(sun);
    var sp = []; for (var i = 0; i < 1500; i++) { var th = Math.random() * Math.PI * 2, ph = 0.08 + Math.random() * 0.45 * Math.PI; sp.push(Math.cos(th) * Math.cos(ph) * 600, Math.sin(ph) * 600, Math.sin(th) * Math.cos(ph) * 600); }
    var stars = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(sp, 3)), new T.PointsMaterial({ size: 1.3, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    sc.add(stars);
    var P = {}, R = {}, glows = {}, lines = {}, labels = {}, ready;
    var outer = new T.Mesh(new T.PlaneGeometry(2000, 2000), new T.MeshStandardMaterial({ color: 0x9a7a56, roughness: 1 })); outer.rotation.x = -Math.PI / 2; outer.position.y = -0.4; sc.add(outer);
    ready = new Promise(function (ok) {
      ctx.model('models/arabia.json', function (g) {
        sc.add(g.scene); g.scene.updateMatrixWorld(true);
        g.scene.traverse(function (o) {
          if (/^P_/.test(o.name)) P[o.name.slice(2)] = o.getWorldPosition(new T.Vector3());
          if (/^R_/.test(o.name) && o.userData.pts) { try { R[o.name.slice(2)] = JSON.parse(o.userData.pts).map(function (q) { return new T.Vector3(q[0], q[2], -q[1]); }); } catch (e) {} }
          if (o.isMesh && o.name === 'Sea') { o.material.transparent = true; o.material.opacity = 0.88; o.material.color.setHex(0x1d4f6e); o.material.roughness = 0.25; o.material.metalness = 0.1; o.renderOrder = 1; }
          if (o.isMesh && o.name === 'Land') {
            var tl = new T.TextureLoader(), nm = tl.load(ctx.base + 'models/tex/rock_n.jpg'); nm.wrapS = nm.wrapT = T.RepeatWrapping; nm.repeat.set(70, 90);
            o.material.normalMap = nm; o.material.normalScale = new T.Vector2(0.6, 0.6); o.material.needsUpdate = true; o.receiveShadow = true;
          }
        });
        // glows and labels for every place
        Object.keys(P).forEach(function (k) {
          var gl = K.glow(2.4, 'rgba(255,240,200,1)', 'rgba(255,190,90,.35)'); gl.position.copy(P[k]).add(new T.Vector3(0, 0.25, 0)); gl.material.opacity = 0; sc.add(gl); glows[k] = gl;
          var off = { Arafah: [3.2, 0.6, 1.2], Hira: [-0.2, 1.2, -0.5], Taif: [1.2, 0.6, 0] }[k] || [0, 0.6, 0];
          if (NAMES[k]) labels[k] = ctx.label(NAMES[k]).at(P[k].x + off[0], P[k].y + off[1], P[k].z + off[2]);
        });
        // routes: a tube that grows along the path
        Object.keys(R).forEach(function (k) {
          var curve = new T.CatmullRomCurve3(R[k]), geo = new T.TubeGeometry(curve, 240, 0.32, 8, false);
          var m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0xffa21a, transparent: true, opacity: 1, fog: false }));
          m.visible = false; sc.add(m); var head = K.glow(3.2, 'rgba(255,250,230,1)', 'rgba(255,200,110,.45)'); head.visible = false; sc.add(head);
          lines[k] = { mesh: m, curve: curve, head: head, count: geo.index.count };
        });
        ok();
      }, ok);
    });
    var year = ctx.label(''), k = 0, p = 0, pl = false;
    function tgt(name, dist, high, side) {
      var c = P[name] || new T.Vector3(); dist = dist || 22; high = high == null ? 0.55 : high; side = side || 0.35;
      return [[c.x - dist * side, c.y + dist * high, c.z + dist * (1 - side * 0.4)], [c.x, c.y, c.z]];
    }
    function chapter(i, instant) {
      k = i; var s = STORY[i] || {};
      var a = s.wide ? [[0, 120, 70], [0, 0, -6]] : tgt(s.at || 'Makkah', s.dist, s.high, s.side);
      rig.go(a[0], a[1], s.fov || 38, [0.5, 0, -0.8], instant);
      year.text(s.year || '');
    }
    var col = new T.Color();
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, play) {
        k = i; p = pr; pl = play; var s = STORY[k] || {};
        var cd = ctx.camera.position.distanceTo(rig.at); sc.fog.near = cd * 0.9; sc.fog.far = cd * 3.2;
        var nt = s.night ? 1 : 0; col.copy(day).lerp(s.night ? night : dusk, s.night ? 1 : (s.dusk ? 0.6 : 0)); sc.background.lerp(col, Math.min(1, dt * 2)); sc.fog.color.copy(sc.background);
        hemi.intensity += ((s.night ? 0.18 : 0.7) - hemi.intensity) * Math.min(1, dt * 2); sun.intensity += ((s.night ? 0.12 : 1.5) - sun.intensity) * Math.min(1, dt * 2);
        stars.material.opacity += ((s.night ? 0.9 : 0) - stars.material.opacity) * Math.min(1, dt * 2);
        Object.keys(glows).forEach(function (n) {
          var on = (s.glow || []).indexOf(n) > -1, g = glows[n], tg = on ? (0.85 + 0.15 * Math.sin(now * 0.004)) : 0;
          if (s.spread && n === s.spread) { var r = 2.4 + 60 * ease(p); g.scale.set(r, r, 1); tg = 0.7 * (1 - ease(p) * 0.6); } else g.scale.set(2.4, 2.4, 1);
          g.material.opacity += (tg - g.material.opacity) * Math.min(1, dt * 3);
        });
        Object.keys(lines).forEach(function (n) {
          var ln = lines[n], on = s.route === n, done = (s.routesDone || []).indexOf(n) > -1;
          ln.mesh.visible = on || done; ln.head.visible = on;
          if (on) { var t = ease(Math.min(1, p / 0.8)) * (s.stop || 1); ln.mesh.geometry.setDrawRange(0, Math.floor(ln.count * t / 3) * 3); ln.head.position.copy(ln.curve.getPointAt(Math.min(0.999, t))).add(new T.Vector3(0, 0.3, 0)); }
          else if (done) ln.mesh.geometry.setDrawRange(0, ln.count);
        });
        Object.keys(labels).forEach(function (n) { labels[n].show((s.names || []).indexOf(n) > -1 && (p > 0.06 || !pl)); });
        var c = P[s.at || 'Makkah']; year.show(false);
      }
    };
  };
})();
