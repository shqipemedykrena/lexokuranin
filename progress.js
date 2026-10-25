(function(){
  var MASTERY_KEY = "ikreMastery";
  var TOTAL_QURAN_AYAHS = 6236;

  function loadMastery(){
    try{ return JSON.parse(localStorage.getItem(MASTERY_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function saveMastery(m){
    try{ localStorage.setItem(MASTERY_KEY, JSON.stringify(m)); }catch(e){}
  }
  var mastery = loadMastery();

  function surahKnownCount(slug, total){
    var s = mastery[slug] || {};
    var n = 0;
    for(var i=1;i<=total;i++){ if(s[i] === "yes") n++; }
    return n;
  }

  function totalKnownCount(){
    var n = 0;
    Object.keys(mastery).forEach(function(slug){
      Object.keys(mastery[slug]).forEach(function(k){
        if(mastery[slug][k] === "yes") n++;
      });
    });
    return n;
  }

  function renderButtons(){
    if(typeof SURAH === "undefined") return;
    document.querySelectorAll(".mastery-check").forEach(function(row){
      var a = row.dataset.a;
      var val = (mastery[SURAH.slug] || {})[a];
      row.querySelectorAll(".mcheck-btn").forEach(function(btn){
        var isActive = btn.dataset.val === val;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    });
  }

  /* all 114 surahs: Albanian name and number of ayahs. Only surahs with content on this page are "ready". */
  var SURAHS = [["El-Fatiha", 7], ["El-Bekare", 286], ["Ali Imran", 200], ["En-Nisa", 176], ["El-Maide", 120], ["El-En'am", 165], ["El-A'raf", 206], ["El-Enfal", 75], ["Et-Teube", 129], ["Junus", 109], ["Hud", 123], ["Jusuf", 111], ["Er-Ra'd", 43], ["Ibrahim", 52], ["El-Hixhr", 99], ["En-Nahl", 128], ["El-Isra", 111], ["El-Kehf", 110], ["Merjem", 98], ["Ta Ha", 135], ["El-Enbija", 112], ["El-Haxhxh", 78], ["El-Mu'minun", 118], ["En-Nur", 64], ["El-Furkan", 77], ["Esh-Shu'ara", 227], ["En-Neml", 93], ["El-Kasas", 88], ["El-Ankebut", 69], ["Er-Rum", 60], ["Lukman", 34], ["Es-Sexhde", 30], ["El-Ahzab", 73], ["Sebe'", 54], ["Fatir", 45], ["Jasin", 83], ["Es-Saffat", 182], ["Sad", 88], ["Ez-Zumer", 75], ["Gafir", 85], ["Fussilet", 54], ["Esh-Shura", 53], ["Ez-Zuhruf", 89], ["Ed-Duhan", 59], ["El-Xhathije", 37], ["El-Ahkaf", 35], ["Muhamed", 38], ["El-Feth", 29], ["El-Huxhurat", 18], ["Kaf", 45], ["Edh-Dharijat", 60], ["Et-Tur", 49], ["En-Nexhm", 62], ["El-Kamer", 55], ["Er-Rrahman", 78], ["El-Vakia", 96], ["El-Hadid", 29], ["El-Muxhadele", 22], ["El-Hashr", 24], ["El-Mumtehine", 13], ["Es-Saff", 14], ["El-Xhumua", 11], ["El-Munafikun", 11], ["Et-Tegabun", 18], ["Et-Talak", 12], ["Et-Tahrim", 12], ["El-Mulk", 30], ["El-Kalem", 52], ["El-Hakka", 52], ["El-Mearixh", 44], ["Nuh", 28], ["El-Xhinn", 28], ["El-Muzzemmil", 20], ["El-Muddeththir", 56], ["El-Kijame", 40], ["El-Insan", 31], ["El-Murselat", 50], ["En-Nebe'", 40], ["En-Naziat", 46], ["Abese", 42], ["Et-Tekvir", 29], ["El-Infitar", 19], ["El-Mutaffifin", 36], ["El-Inshikak", 25], ["El-Buruxh", 22], ["Et-Tarik", 17], ["El-A'la", 19], ["El-Gashije", 26], ["El-Fexhr", 30], ["El-Beled", 20], ["Esh-Shems", 15], ["El-Lejl", 21], ["Ed-Duha", 11], ["Esh-Sherh", 8], ["Et-Tin", 8], ["El-Alek", 19], ["El-Kadr", 5], ["El-Bejjine", 8], ["Ez-Zelzele", 8], ["El-Adijat", 11], ["El-Kari'a", 11], ["Et-Tekathur", 8], ["El-Asr", 3], ["El-Humeze", 9], ["El-Fil", 5], ["Kurejsh", 4], ["El-Ma'un", 7], ["El-Kevther", 3], ["El-Kafirun", 6], ["En-Nasr", 3], ["El-Mesed", 5], ["El-Ihlas", 4], ["El-Felek", 5], ["En-Nas", 6]];
  var READY_SLUGS = {1:"el-fatiha",105:"el-fil",106:"kurejsh",107:"el-maun",108:"el-kevther",109:"el-kafirun",110:"en-nasr",111:"el-mesed",112:"el-ihlas",113:"el-felek",114:"en-nas"};
  var READY = {};
  Object.keys(READY_SLUGS).forEach(function(n){ READY[n] = { slug: READY_SLUGS[n], href: "meso.html#sure-" + n }; });
  var grid = document.getElementById("qpGrid");
  if(grid && !grid.children.length){
    SURAHS.forEach(function(x, i){
      var num = i + 1, ready = READY[num];
      var t = document.createElement(ready ? "a" : "div");
      t.className = "qp-tile " + (ready ? "qp-ready" : "qp-soon");
      if(ready){ t.href = ready.href; t.dataset.slug = ready.slug; }
      t.dataset.total = x[1];
      t.title = num + ". " + x[0] + " · " + x[1] + " ajete" + (ready ? "" : " · së shpejti");
      t.innerHTML = '<span class="qp-n"></span><span class="qp-name"></span><span class="qp-a"></span><span class="qp-bar"></span>';
      t.querySelector(".qp-n").textContent = num;
      t.querySelector(".qp-name").textContent = x[0];
      t.querySelector(".qp-a").textContent = x[1] + " ajete";
      grid.appendChild(t);
    });
  }
  function updateTiles(){
    if(!grid) return;
    grid.querySelectorAll(".qp-tile[data-slug]").forEach(function(t){
      var total = +t.dataset.total, known = surahKnownCount(t.dataset.slug, total);
      t.querySelector(".qp-bar").style.width = (total ? known / total * 100 : 0) + "%";
      t.querySelector(".qp-a").textContent = known ? known + " / " + total + " ajete" : total + " ajete";
      t.classList.toggle("qp-done", known === total && total > 0);
    });
  }

  function updateStats(){
    mastery = loadMastery();
    updateTiles();
    if(typeof window.ikreOnMastery === "function") window.ikreOnMastery(mastery);

    var tKnown = totalKnownCount();
    var tPct = TOTAL_QURAN_AYAHS ? +((tKnown / TOTAL_QURAN_AYAHS) * 100).toFixed(2) : 0;
    var tFill = document.getElementById("pgTotalFill");
    var tStat = document.getElementById("pgTotalStat");
    if(tFill) tFill.style.width = Math.max(tPct, tKnown > 0 ? 0.4 : 0) + "%";
    if(tStat) tStat.textContent = tKnown + " nga " + TOTAL_QURAN_AYAHS + " ajete (" + tPct + "%)";
  }

  document.addEventListener("click", function(e){
    var btn = e.target.closest(".mcheck-btn");
    if(!btn || typeof SURAH === "undefined") return;
    var row = btn.closest(".mastery-check");
    var a = row.dataset.a;
    var slug = SURAH.slug;
    mastery = loadMastery();
    if(!mastery[slug]) mastery[slug] = {};
    var val = btn.dataset.val;
    if(mastery[slug][a] === val){
      delete mastery[slug][a];
    } else {
      mastery[slug][a] = val;
    }
    saveMastery(mastery);
    renderButtons();
    updateStats();
  });

  window.ikreRenderMastery = function(){ mastery = loadMastery(); renderButtons(); updateStats(); };
  renderButtons();
  updateStats();
})();
