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
  var SURAHS = [["Al-Fatiha", 7], ["Al-Baqarah", 286], ["Al Imran", 200], ["An-Nisa", 176], ["Al-Ma'idah", 120], ["Al-An'am", 165], ["Al-A'raf", 206], ["Al-Anfal", 75], ["At-Tawbah", 129], ["Yunus", 109], ["Hud", 123], ["Yusuf", 111], ["Ar-Ra'd", 43], ["Ibrahim", 52], ["Al-Hijr", 99], ["An-Nahl", 128], ["Al-Isra", 111], ["Al-Kahf", 110], ["Maryam", 98], ["Ta Ha", 135], ["Al-Anbiya", 112], ["Al-Hajj", 78], ["Al-Mu'minun", 118], ["An-Nur", 64], ["Al-Furqan", 77], ["Ash-Shu'ara", 227], ["An-Naml", 93], ["Al-Qasas", 88], ["Al-Ankabut", 69], ["Ar-Rum", 60], ["Luqman", 34], ["As-Sajdah", 30], ["Al-Ahzab", 73], ["Saba", 54], ["Fatir", 45], ["Ya Sin", 83], ["As-Saffat", 182], ["Sad", 88], ["Az-Zumar", 75], ["Ghafir", 85], ["Fussilat", 54], ["Ash-Shura", 53], ["Az-Zukhruf", 89], ["Ad-Dukhan", 59], ["Al-Jathiyah", 37], ["Al-Ahqaf", 35], ["Muhammad", 38], ["Al-Fath", 29], ["Al-Hujurat", 18], ["Qaf", 45], ["Adh-Dhariyat", 60], ["At-Tur", 49], ["An-Najm", 62], ["Al-Qamar", 55], ["Ar-Rahman", 78], ["Al-Waqi'ah", 96], ["Al-Hadid", 29], ["Al-Mujadilah", 22], ["Al-Hashr", 24], ["Al-Mumtahanah", 13], ["As-Saff", 14], ["Al-Jumu'ah", 11], ["Al-Munafiqun", 11], ["At-Taghabun", 18], ["At-Talaq", 12], ["At-Tahrim", 12], ["Al-Mulk", 30], ["Al-Qalam", 52], ["Al-Haqqah", 52], ["Al-Ma'arij", 44], ["Nuh", 28], ["Al-Jinn", 28], ["Al-Muzzammil", 20], ["Al-Muddaththir", 56], ["Al-Qiyamah", 40], ["Al-Insan", 31], ["Al-Mursalat", 50], ["An-Naba", 40], ["An-Nazi'at", 46], ["Abasa", 42], ["At-Takwir", 29], ["Al-Infitar", 19], ["Al-Mutaffifin", 36], ["Al-Inshiqaq", 25], ["Al-Buruj", 22], ["At-Tariq", 17], ["Al-A'la", 19], ["Al-Ghashiyah", 26], ["Al-Fajr", 30], ["Al-Balad", 20], ["Ash-Shams", 15], ["Al-Layl", 21], ["Ad-Duha", 11], ["Ash-Sharh", 8], ["At-Tin", 8], ["Al-Alaq", 19], ["Al-Qadr", 5], ["Al-Bayyinah", 8], ["Az-Zalzalah", 8], ["Al-Adiyat", 11], ["Al-Qari'ah", 11], ["At-Takathur", 8], ["Al-Asr", 3], ["Al-Humazah", 9], ["Al-Fil", 5], ["Quraisch", 4], ["Al-Ma'un", 7], ["Al-Kauthar", 3], ["Al-Kafirun", 6], ["An-Nasr", 3], ["Al-Masad", 5], ["Al-Ikhlas", 4], ["Al-Falaq", 5], ["An-Nas", 6]];
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
      t.title = num + ". " + x[0] + " · " + x[1] + " Verse" + (ready ? "" : " \u00b7 bald verf\u00fcgbar");
      t.innerHTML = '<span class="qp-n"></span><span class="qp-name"></span><span class="qp-a"></span><span class="qp-bar"></span>';
      t.querySelector(".qp-n").textContent = num;
      t.querySelector(".qp-name").textContent = x[0];
      t.querySelector(".qp-a").textContent = x[1] + " Verse";
      grid.appendChild(t);
    });
  }
  function updateTiles(){
    if(!grid) return;
    grid.querySelectorAll(".qp-tile[data-slug]").forEach(function(t){
      var total = +t.dataset.total, known = surahKnownCount(t.dataset.slug, total);
      t.querySelector(".qp-bar").style.width = (total ? known / total * 100 : 0) + "%";
      t.querySelector(".qp-a").textContent = known ? known + " / " + total + " Verse" : total + " Verse";
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
    if(tStat) tStat.textContent = tKnown + " von " + TOTAL_QURAN_AYAHS + " Verse (" + tPct + "%)";
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
