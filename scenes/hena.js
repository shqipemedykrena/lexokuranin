/* Live scene: the splitting of the Moon (Quran 54:1-2). Valley model from Blender (models/mk-valley.json):
   Makkah with its houses around the Ka'bah, mountains, Mount Hira. One shot per sentence:
   0 verse: night, full Moon over the mountains; 1 the Moon splits; 2 halves held apart, note with the hadith references;
   3 Hira seen between the two parts (one behind the mountain, one in front); 4 they rejoin, full Moon;
   5 wide over the whole valley; 6 dawn, the Moon fades; 7 night again, slow push to the whole Moon. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).hena = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    var night = new T.Color(0x070b18), dawn = new T.Color(0x9a7f86), col = new T.Color();
    sc.background = night.clone(); sc.fog = new T.Fog(night.getHex(), 200, 900);
    var hemi = new T.HemisphereLight(0x7f96d0, 0x1a140e, 0.5); sc.add(hemi);
    var moonL = new T.DirectionalLight(0xc8d6ff, 0.55); sc.add(moonL, moonL.target);
    var sun = new T.DirectionalLight(0xffc89a, 0); sun.position.set(400, 60, 200); sc.add(sun);
    var fill = new T.DirectionalLight(0x8a9cd0, 0.45); fill.position.set(-80, 120, 260); sc.add(fill);
    var stars = X.stars(sc, 1600, 1500);
    // the Moon: two textured halves with closed faces, and a glow
    var tex = new T.TextureLoader().load(ctx.base + 'models/tex/moon.jpg'); tex.encoding = T.sRGBEncoding;
    var R = 26, mm = new T.MeshBasicMaterial({ map: tex, color: 0xf4f1e6, fog: false }), cap = new T.MeshBasicMaterial({ color: 0x8c8a84, fog: false, side: T.DoubleSide });
    function half(up) {
      var g = new T.Group(), s = new T.Mesh(new T.SphereGeometry(R, 64, 32, 0, Math.PI * 2, up ? 0 : Math.PI / 2, Math.PI / 2), mm);
      var c = new T.Mesh(new T.CircleGeometry(R, 64), cap); c.rotation.x = up ? Math.PI / 2 : -Math.PI / 2; g.add(s, c); sc.add(g); return g;
    }
    var top = half(true), bot = half(false), moon = new T.Group();
    var glow = K.glow(R * 9, 'rgba(200,215,255,.55)', 'rgba(140,160,230,.12)'); sc.add(glow);
    var nHira = ctx.label(L.hira || ''), nRef = ctx.label(L.ref || ''), nFull = ctx.label(L.full || ''), nMakkah = ctx.label(L.makkah || '');
    var W = null, hira = new T.Vector3(75, 72, -95), makkah = new T.Vector3(0, 4, 10);
    var ready = new Promise(function (ok) {
      ctx.model('models/mk-valley.json', function (g) {
        sc.add(g.scene); g.scene.updateMatrixWorld(true); hira = X.wpos(g.scene, 'Hira'); makkah = X.wpos(g.scene, 'Makkah');
        W = X.find(g.scene, 'Windows'); g.scene.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; }); ok();
      }, ok);
    });
    var cam0 = new T.Vector3(-10, 16, 70), dir = new T.Vector3(), C = new T.Vector3();
    function moonHome() { dir.copy(hira).sub(cam0).normalize(); C.copy(cam0).addScaledVector(dir, 900); C.y += 70; return C; }
    var k = 0, p = 0, pl = false, split = 0, fade = 0;
    var SH = [
      [[-10, 16, 70], [40, 80, -150], 44, [2, 0, -4]],
      [[-10, 16, 70], [40, 95, -150], 40, [1, 0, -2]],
      [[-10, 16, 70], [40, 95, -150], 38, [1, 0, -2]],
      [[-4, 20, 52], [60, 75, -110], 34, [1, 0, -2]],
      [[-10, 16, 70], [40, 90, -150], 40, [1, 0, -3]],
      [[-90, 120, 190], [20, 20, -40], 48, [6, 0, -6]],
      [[-10, 22, 80], [40, 70, -150], 42, [2, 0, -2]],
      [[-10, 16, 70], [40, 108, -150], 30, [0, 0, 0]]
    ];
    function chapter(i, instant) { k = i; var s = SH[i] || SH[0]; rig.go(s[0], s[1], s[2], s[3], instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, play) {
        k = i; p = pr; pl = play;
        var targetSplit = k === 0 ? 0 : k === 1 ? X.seg(p, 0.15, 0.75) : (k === 2 || k === 3) ? 1 : k === 4 ? 1 - X.seg(p, 0.05, 0.6) : 0;
        split += (targetSplit - split) * Math.min(1, dt * 4);
        var c = moonHome();
        top.position.copy(c).add(new T.Vector3(-8 * split, 30 * split, 0)); bot.position.copy(c).add(new T.Vector3(10 * split, -150 * split, 0));
        top.rotation.z = -0.12 * split; bot.rotation.z = 0.14 * split;
        // the lower half passes in front of the mountain: drawn over it
        [bot].forEach(function (g) { g.children.forEach(function (m) { m.material.depthTest = split < 0.5; }); g.renderOrder = split > 0.5 ? 10 : 0; });
        glow.position.copy(c).add(new T.Vector3(0, -20 * split, 40 * split)); glow.scale.setScalar(R * (9 + 4 * split));
        // dawn in chapter 7: the sky lightens, the Moon fades
        var df = k === 6 ? X.seg(p, 0.1, 0.8) : 0; fade += (df - fade) * Math.min(1, dt * 2);
        col.copy(night).lerp(dawn, fade); sc.background.copy(col); sc.fog.color.copy(col);
        stars.material.opacity = 0.9 * (1 - fade); hemi.intensity = 0.5 + 0.5 * fade; sun.intensity = 1.4 * fade; moonL.intensity = 0.55 * (1 - fade);
        moonL.position.copy(c); moonL.target.position.copy(makkah);
        mm.opacity = cap.opacity = 1 - 0.85 * fade; mm.transparent = cap.transparent = fade > 0.01; glow.material.opacity = 0.9 * (1 - fade);
        if (W) W.traverse(function (o) { if (o.isMesh && o.material.emissive) o.material.emissiveIntensity = (k === 5 ? 1.2 : 0.6) * (1 + 0.1 * Math.sin(now * 0.002)); });
        var show = p > 0.08 || !pl;
        nHira.at(hira.x, hira.y + 6, hira.z).show((k === 3 || k === 5) && show);
        nRef.at(top.position.x, top.position.y + R + 10, top.position.z).show(k === 2 && show);
        nFull.at(c.x, c.y + R + 12, c.z).show(k === 4 && p > 0.6);
        nMakkah.at(makkah.x, makkah.y + 6, makkah.z).show(k === 5 && show);
      }
    };
  };
})();
