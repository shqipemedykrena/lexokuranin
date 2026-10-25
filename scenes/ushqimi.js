/* Live scene: "The food that increased" (Muslim 2039). Models from Blender (models/mk-ushqimi.json):
   a clay pot on a hearth with a fire, bread on a cloth, and a bowl that is cloned into rows.
   The bowls fill one row after another while the pot stays full; the count of men who ate rises to one thousand.
   Last chapter: groups of ten for the bread of Abu Talhah and Umm Sulaym. No people are shown. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).ushqimi = function (ctx) {
    var T = ctx.T, K = ctx.K, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    function ease(k) { k = Math.max(0, Math.min(1, k)); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function seg(p, a, b) { return ease((p - a) / (b - a)); }
    sc.background = new T.Color(0x0c0806); sc.fog = new T.FogExp2(0x0c0806, 0.09);
    sc.add(new T.HemisphereLight(0x6a7890, 0x22140a, 0.25));
    var fire = new T.PointLight(0xff8a3a, 3, 6, 2); fire.position.set(0, 0.18, 0); fire.castShadow = true; fire.shadow.mapSize.set(1024, 1024); sc.add(fire);
    var moon = new T.DirectionalLight(0x9db0d8, 0.35); moon.position.set(-4, 6, 3); moon.castShadow = true; sc.add(moon);
    var flames = []; for (var i = 0; i < 6; i++) { var f = K.glow(0.2, 'rgba(255,240,200,1)', 'rgba(255,120,30,.6)'); f.position.set(Math.cos(i) * 0.08, 0.12, Math.sin(i) * 0.08); sc.add(f); flames.push(f); }
    var steam = []; for (i = 0; i < 14; i++) { var s = K.glow(0.35, 'rgba(255,255,255,.35)', 'rgba(255,255,255,.08)', false); sc.add(s); steam.push([s, Math.random()]); }
    var nCount = ctx.label(''), nPot = ctx.label(L.pot || '');
    // the small sack of barley beside the hearth (one sa')
    var sack = new T.Mesh(new T.SphereGeometry(0.16, 24, 16), new T.MeshStandardMaterial({ color: 0x6e5a3e, roughness: 0.95 })); sack.scale.set(1, 1.25, 1); sack.position.set(-0.75, 0.19, 0.25); sack.castShadow = true; sc.add(sack);
    var tie = new T.Mesh(new T.CylinderGeometry(0.035, 0.05, 0.08, 12), sack.material); tie.position.set(-0.75, 0.42, 0.25); sc.add(tie);
    var N = {}, bowls = [], R = 10, ROWS = 10, ready = new Promise(function (ok) {
      ctx.model('models/mk-ushqimi.json', function (g) {
        sc.add(g.scene); g.scene.traverse(function (o) { if (o.name) N[o.name] = o; });
        var b = N.Bowl, food = N.BowlFood; if (b && food) {
          b.visible = food.visible = false;
          for (var r = 0; r < ROWS; r++) for (var c = 0; c < R; c++) {
            var gb = new T.Group(), bb = b.clone(), ff = food.clone(); ff.material = food.material.clone(); gb.add(bb, ff); bb.position.set(0, 0, 0); ff.position.set(0, 0.05, 0);
            var ang = -0.9 + (c / (R - 1)) * 1.8, rad = 1.3 + r * 0.32;
            gb.position.set(Math.sin(ang) * rad, 0, -Math.cos(ang) * rad + 0.2); gb.scale.setScalar(0.8); gb.visible = false; sc.add(gb); bowls.push([gb, ff]);
          }
        }
        ok();
      }, ok);
    });
    var shots = [[[1.6, 1.3, 2.0], [0, 0.45, 0], 40, [-0.1, 0, -0.2]], [[2.2, 2.6, 3.6], [0, 0.3, -1.6], 46, [-0.2, 0.2, 0.2]], [[0.2, 1.9, 1.8], [0, 0.2, -1.0], 44, [0.1, 0, 0]]];
    var k = 0, p = 0, playing = false;
    function chapter(i, instant) { k = i; var q = shots[i] || shots[0]; rig.go(q[0], q[1], q[2], q[3], instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; playing = pl;
        var fl = 1 + Math.sin(now * 0.019) * 0.12 + Math.sin(now * 0.047) * 0.08; fire.intensity = 3 * fl;
        flames.forEach(function (f, j) { var s = 0.16 + 0.07 * Math.sin(now * 0.01 + j * 1.7); f.scale.set(s, s * 1.6, 1); f.position.y = 0.12 + 0.03 * Math.sin(now * 0.008 + j); });
        steam.forEach(function (s, j) { s[1] = (s[1] + dt * 0.12) % 1; var t = s[1]; s[0].position.set(Math.sin(t * 6 + j) * 0.1 * t, 0.7 + t * 1.2, Math.cos(t * 5 + j) * 0.08 * t); s[0].scale.setScalar(0.25 + t * 0.6); s[0].material.opacity = 0.5 * Math.sin(t * Math.PI); });
        // chapter 2: 1000 men; each bowl here = 10 men, filled row by row; the pot level does not drop
        var filled = k === 0 ? 0 : k === 1 ? Math.floor(100 * seg(p, 0.08, 0.9)) : 100;
        bowls.forEach(function (b, j) { b[0].visible = k >= 1 && (k === 1 ? j < filled + 10 : true); b[1].visible = j < filled; if (k === 2) b[0].visible = j < 8; });
        // chapter 3: 70 to 80 men in groups of ten: 8 bowls in a row, glowing one by one
        // chapter 3: groups of ten come in turn: ten bowls fill together, round after round, up to eighty
        var round = Math.min(7, Math.floor(p * 8.5)), inRound = (p * 8.5) % 1;
        if (k === 2) bowls.forEach(function (b, j) { b[0].visible = j < 10; b[1].visible = j < 10 && inRound > 0.12 && inRound < 0.96; });
        if (N.Stew) N.Stew.position.y = N.Stew.position.y;   // stays where it is: still brimming
        var men = k === 1 ? filled * 10 : k === 2 ? Math.min(80, (round + (inRound > 0.12 ? 1 : 0)) * 10) : 0;
        nCount.text(men + ' ' + (L.men || '')).at(0, 1.25, -2.2).show(k >= 1 && (p > 0.05 || !pl));
        nPot.at(0, 0.95, 0).show(k === 1 && p > 0.5);
      }
    };
  };
})();
