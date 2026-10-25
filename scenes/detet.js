/* Live scene: the barrier between two waters (Quran 25:53). Land model from Blender (models/mk-detet.json):
   a river that winds to the sea. The water is one moving surface painted from the river's path: sea blue,
   river green-brown, and a plume where the river enters the sea, with a fine line at its edge.
   0 verse, aerial; 1 sweet and salty side by side; 2 rivers and the sea (pull back along the river);
   3 Ibn Kathir: the dry land between them lights up; 4 Ibn Abbas and al-Qurtubi: the unseen line at the mouth;
   5 Ibn Ashur: a cut-away of two layers of different density; 6 both views together; 7 wide at sunset. */
(function () {
  (window.IkreScenes = window.IkreScenes || {}).detet = function (ctx) {
    var T = ctx.T, K = ctx.K, X = window.IkreKit, sc = ctx.scene, rig = ctx.rig, L = ctx.L || {};
    var dayC = new T.Color(0x9fb4c8), duskC = new T.Color(0xc98a62), col = new T.Color();
    sc.background = dayC.clone(); sc.fog = new T.Fog(dayC.getHex(), 160, 520);
    var hemi = new T.HemisphereLight(0xdfeaff, 0x7a6448, 0.75); sc.add(hemi);
    var sun = new T.DirectionalLight(0xfff0d8, 1.4); sun.position.set(-120, 160, 80); sc.add(sun);
    var path = [[0, -2], [4, 20], [-14, 45], [-6, 70], [16, 95], [10, 125], [-8, 150]];
    // the painted water
    var N = 1024, cv = document.createElement('canvas'); cv.width = cv.height = N; var g = cv.getContext('2d');
    function P(bx, by) { return [(bx + 200) / 400 * N, (-by + 200) / 400 * N]; }
    function paint(lineGlow) {
      g.fillStyle = '#0d3a58'; g.fillRect(0, 0, N, N);
      var gr = g.createLinearGradient(0, P(0, -40)[1], 0, P(0, 0)[1]); gr.addColorStop(0, 'rgba(25,90,120,0)'); gr.addColorStop(1, 'rgba(40,110,130,.6)'); g.fillStyle = gr; g.fillRect(0, P(0, 0)[1], N, P(0, -40)[1] - P(0, 0)[1]);
      g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#4b5532'; g.lineWidth = 8 / 400 * N; g.beginPath();
      path.forEach(function (q, i) { var a = P(q[0], q[1]); if (i) g.lineTo(a[0], a[1]); else g.moveTo(a[0], a[1]); }); g.stroke();
      // the plume: the river water fanning into the sea, and the line where it meets the salty water
      var c = P(0, -13); g.save(); g.translate(c[0], c[1]); g.scale(1, 1.35);
      var pg = g.createRadialGradient(0, -8, 4, 0, 0, 12 / 400 * N); pg.addColorStop(0, '#4f5a34'); pg.addColorStop(0.85, '#3f5a46'); pg.addColorStop(1, '#3a5a52');
      g.fillStyle = pg; g.beginPath(); var r0 = 12 / 400 * N;
      for (var a = 0; a <= 64; a++) { var an = a / 64 * Math.PI * 2, rr = r0 * (1 + 0.07 * Math.sin(an * 5 + 1) + 0.04 * Math.sin(an * 11)); if (a) g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); else g.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      g.closePath(); g.fill();
      g.strokeStyle = 'rgba(220,240,235,' + (0.35 + 0.6 * lineGlow) + ')'; g.lineWidth = 1.2 + 3 * lineGlow; g.stroke(); g.restore();
      tex.needsUpdate = true;
    }
    var tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 8;
    var wg = new T.PlaneGeometry(400, 400, 160, 160); wg.translate(0, 0, 0); wg.rotateX(-Math.PI / 2);
    var wm = new T.MeshStandardMaterial({ map: tex, roughness: 0.22, metalness: 0.1, transparent: true, opacity: 1 });
    var water = new T.Mesh(wg, wm); water.position.y = -0.35; sc.add(water);
    // land beyond the Blender model, so no edge shows
    var outerM = new T.MeshStandardMaterial({ color: 0xd8c4a0, roughness: 1 });
    [[0, -500, 1600, 700], [-480, -78, 660, 150], [480, -78, 660, 150]].forEach(function (b) { var m = new T.Mesh(new T.PlaneGeometry(b[2], b[3]), outerM); m.rotation.x = -Math.PI / 2; m.position.set(b[0], 2.4, b[1]); sc.add(m); });
    var base = wg.attributes.position.array.slice();
    var lastGlow = -1;
    // light on the dry land (Ibn Kathir) and the cut-away block (Ibn Ashur)
    var lg = document.createElement('canvas'); lg.width = lg.height = 128; var lx = lg.getContext('2d'), lgr = lx.createLinearGradient(0, 0, 0, 128);
    lgr.addColorStop(0, 'rgba(255,230,160,0)'); lgr.addColorStop(0.5, 'rgba(255,230,160,.9)'); lgr.addColorStop(1, 'rgba(255,230,160,0)'); lx.fillStyle = lgr; lx.fillRect(0, 0, 128, 128);
    var landGlow = new T.Mesh(new T.PlaneGeometry(260, 9), new T.MeshBasicMaterial({ map: new T.CanvasTexture(lg), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
    landGlow.rotation.x = -Math.PI / 2; landGlow.position.set(0, 3.2, -5.5); sc.add(landGlow);
    var block = new T.Group(); block.position.set(0, 10, 14);
    var top = new T.Mesh(new T.BoxGeometry(34, 3, 26), new T.MeshStandardMaterial({ color: 0x5e6a40, transparent: true, opacity: 0.92, roughness: 0.3 }));
    var bot = new T.Mesh(new T.BoxGeometry(34, 11, 26), new T.MeshStandardMaterial({ color: 0x0d3e62, transparent: true, opacity: 0.95, roughness: 0.3 }));
    top.position.y = -1.5; bot.position.y = -8.5; block.add(top, bot);
    var seam = new T.Mesh(new T.BoxGeometry(34.2, 0.25, 26.2), new T.MeshBasicMaterial({ color: 0xe8fff8, transparent: true, opacity: 0.9 })); seam.position.y = -3; block.add(seam);
    block.visible = false; sc.add(block);
    var nSweet = ctx.label(L.sweet || ''), nSalt = ctx.label(L.salt || ''), nRiver = ctx.label(L.river || ''), nSea = ctx.label(L.sea || ''),
        nLand = ctx.label(L.land || ''), nBar = ctx.label(L.barrier || ''), nDen = ctx.label(L.density || '');
    var ready = new Promise(function (ok) { ctx.model('models/mk-detet.json', function (gl) { sc.add(gl.scene); ok(); }, ok); });
    var SH = [
      [[-60, 120, 150], [0, 0, -20], 44, [4, -4, -6]],
      [[-26, 30, 48], [0, 0, 4], 40, [2, -2, -2]],
      [[-90, 95, 70], [-2, 0, -70], 46, [0, 0, -8]],
      [[70, 26, 55], [0, 2, -4], 40, [-3, 0, -2]],
      [[14, 7, 34], [0, -0.3, 9], 40, [-1, 0, -1]],
      [[50, 16, 46], [0, 4, 13], 36, [-2, 0, 0]],
      [[-45, 55, 75], [0, 0, 0], 44, [2, 0, -2]],
      [[-130, 75, 170], [0, 0, -40], 46, [6, 0, -6]]
    ];
    var k = 0, p = 0, t = 0;
    function chapter(i, instant) { k = i; var s = SH[i] || SH[0]; rig.go(s[0], s[1], s[2], s[3], instant); }
    return {
      ready: ready, chapter: chapter,
      update: function (dt, now, i, pr, pl) {
        k = i; p = pr; t += dt;
        var A = wg.attributes.position; for (var j = 0; j < A.count; j++) { var x = base[j * 3], z = base[j * 3 + 2]; A.setY(j, Math.sin(x * 0.15 + t * 0.9) * 0.12 + Math.sin((x + z) * 0.11 + t * 1.2) * 0.08); }
        A.needsUpdate = true; wg.computeVertexNormals();
        var lineOn = (k === 4 || k === 6) ? X.seg(p, 0.05, 0.4) * (0.75 + 0.25 * Math.sin(now * 0.004)) : (k === 1 ? 0.3 : 0);
        var q = Math.round(lineOn * 20) / 20; if (q !== lastGlow) { lastGlow = q; paint(q); }
        landGlow.material.opacity = (k === 3 || k === 6) ? 0.55 * X.seg(p, 0.05, 0.4) : 0;
        block.visible = k === 5; var rise = k === 5 ? X.seg(p, 0.05, 0.45) : 0; block.position.y = -6 + 16 * rise; block.scale.setScalar(Math.max(0.01, rise));
        var dusk = k === 7 ? X.seg(p, 0, 0.6) : 0; col.copy(dayC).lerp(duskC, dusk); sc.background.copy(col); sc.fog.color.copy(col);
        sun.color.setHex(dusk > 0.5 ? 0xffb070 : 0xfff0d8); sun.position.set(-120, 160 - 130 * dusk, 80 + 60 * dusk); sun.intensity = 1.4 - 0.5 * dusk;
        var show = p > 0.08 || !pl;
        nSweet.at(2, 1.5, -16).show(k === 1 && show); nSalt.at(-4, 1.5, 30).show(k === 1 && show);
        nRiver.at(-14, 2, -45).show(k === 2 && show); nSea.at(30, 2, 45).show(k === 2 && show);
        nLand.at(40, 4, -5).show((k === 3 || k === 6) && show); nBar.at(9, 0.8, 15).show((k === 4 || k === 6) && show);
        nDen.at(17, 7, 14).show(k === 5 && p > 0.3);
      }
    };
  };
})();
