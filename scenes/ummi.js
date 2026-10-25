/* Live scene: the Prophet ﷺ who did not read or write (Quran 29:48, 7:157). Room model from Blender (models/mk-ummi.json).
   0 verse: a low desk with an unused reed pen, a closed ink pot and a blank sheet; 1 two old closed books on a shelf (Torah, Gospel);
   2 the desk again, the pen dry; 3 the scribes' desks, their sheets fill with lines of light; 4 the old books stay closed;
   5 the written sheets glow beside the closed books; 6 dawn through the window over the written sheets. No people. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).ummi = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    sc.background = new T.Color(0x0b0807); sc.fog = new T.FogExp2(0x0b0807, 0.08);
    var hemi = new T.HemisphereLight(0xa8b0c8, 0x2a1c12, 0.3); sc.add(hemi);
    var win = new T.SpotLight(0xffe0b0, 1.2, 14, 0.5, 0.6, 1.4); win.position.set(-4.6, 2.6, -1); win.target.position.set(0, 0.3, -1.2); win.castShadow = true; win.shadow.mapSize.set(1024, 1024); sc.add(win, win.target);
    var lamp = new T.PointLight(0xffa458, 1.3, 7, 2); lamp.position.set(1.6, 0.9, 0.8); lamp.castShadow = true; sc.add(lamp);
    var flame = K.glow(0.12, 'rgba(255,245,215,1)', 'rgba(255,160,60,.8)'); flame.position.copy(lamp.position); sc.add(flame);
    var halo = K.glow(0.9, 'rgba(255,200,130,.6)', 'rgba(255,140,60,.15)'); halo.position.copy(lamp.position); sc.add(halo);
    var nTorah = ctx.label(L.torah || ''), nGospel = ctx.label(L.gospel || ''), nScribes = ctx.label(L.scribes || '');
    var lines = [], N = {}, ready = new Promise(function (ok) {
      ctx.model('models/mk-ummi.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; if (/^Scribe\dLine\d/.test(o.name)) { o.material = o.material.clone(); lines.push(o); } if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
        lines.sort(function (a, b) { return a.name < b.name ? -1 : 1; }); ok();
      }, ok);
    });
    var SH = [
      [[0.55, 0.85, 0.75], [0, 0.32, 0], 36, [0.03, -0.02, -0.04]],
      [[2.3, 1.45, 0.5], [3.7, 1.3, -0.55], 38, [0.05, 0, -0.05]],
      [[-0.35, 0.6, 0.45], [0.15, 0.33, -0.05], 32, [0.03, 0, -0.03]],
      [[-1.2, 1.15, -0.4], [-1.5, 0.33, -1.75], 40, [0.15, -0.03, -0.05]],
      [[2.9, 1.35, 0.1], [3.72, 1.3, -0.55], 30, [0, 0, -0.06]],
      [[1.9, 1.3, 0.9], [0.6, 0.35, -1.5], 44, [-0.05, 0, -0.05]],
      [[-1.8, 1.5, 1.6], [0, 0.35, -1.6], 44, [0.08, 0, 0]]
    ];
    var k = 0, p = 0;
    function chapter(i, instant) { k = i; var s = SH[i] || SH[0]; rig.go(s[0], s[1], s[2], s[3], instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr;
        var fl = 1 + Math.sin(now * 0.013) * 0.05 + Math.sin(now * 0.031) * 0.04; lamp.intensity = 1.3 * fl; flame.scale.set(0.12 * fl, 0.16 * fl, 1);
        // lines appear on the scribes' sheets in chapter 4 and stay after; they glow brighter in chapters 6-7
        var n = lines.length, shown = k < 3 ? 0 : k === 3 ? Math.floor(n * X.seg(p, 0.1, 0.85)) : n;
        lines.forEach(function (o, j) { o.visible = j < shown; if (o.material.emissive) o.material.emissiveIntensity = (k >= 5 ? 4 : 2.5) * (0.9 + 0.1 * Math.sin(now * 0.003 + j)); });
        var dawn = k === 6 ? X.seg(p, 0.05, 0.6) : 0;
        win.intensity = 1.2 + 4 * dawn; win.color.setHex(dawn > 0.3 ? 0xffd29a : 0xffe0b0); hemi.intensity = 0.3 + 0.3 * dawn;
        var show = p > 0.08 || !pl;
        nTorah.at(3.72, 1.62, -0.25).show((k === 1 || k === 4) && show); nGospel.at(3.72, 1.58, -0.85).show((k === 1 || k === 4) && show);
        nScribes.at(0, 0.8, -1.9).show(k === 3 && p > 0.15);
      }
    };
  };
})();
