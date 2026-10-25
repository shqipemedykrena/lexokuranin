/* Ikre: the whole Quran. Surah list, reader, verse ticks, bookmarks, search.
   Data: quran/q-{lang}-{chunk}.js (window.QD). Meta + names: window.QMETA, window.QNAMES (inline in kurani.html). */
(function(){
  var LANG = (document.documentElement.lang || "sq").slice(0, 2);
  var M = window.QMETA, NAMES = window.QNAMES;
  if(!M || !NAMES) return;
  var BASE = (function(){
    var s = document.querySelector('script[src*="quran-reader.js"]');
    return s ? s.getAttribute("src").replace("quran-reader.js", "") : "";
  })();

  var T = {
    sq: {juzT:"Xhuzet", read:"E lexova këtë sure", readOn:"Lexuar ✓", readCount:function(k){ return k + " / 114 sure të lexuara"; }, khatm:function(n){ return n ? "Hatme të plota: " + n : ""; }, newKhatm:"I lexova të gjitha. Fillo hatmen tjetër", night:"Natë", keys:"Tastiera: J / K ajeti tjetër / i mëparshëm, N / P surja tjetër / e mëparshme", gotoRef:function(r){ return "Shko te " + r + " →"; }, verses:"ajete", meccan:"Mekase", medinan:"Medinase", all:"Të gjitha", juz:"Xhuzi", bism:"Me emrin e Allahut, të Gjithëmëshirshmit, Mëshirëplotit",
      know:"E di përmendësh", known:"E di ✓", save:"Ruaje", saved:"E ruajtur ★", link:"Lidhja", copied:"Lidhja u kopjua", prev:"Surja e mëparshme", next:"Surja tjetër",
      back:"Të gjitha suret", goto:"Shko te ajeti", go:"Shko", size:"Madhësia e shkronjave", trOn:"Shfaq përkthimin", sqOn:"Shfaq edhe përkthimin shqip",
      cont:"Vazhdo ku e le", contAt:"Ke mbetur te", bm:"Ajetet e ruajtura", none:"Ende asnjë ajet i ruajtur. Kliko „Ruaje“ te një ajet.",
      searchPh:"Kërko një sure (emër ose numër)", textPh:"Kërko një fjalë në përkthim, p.sh. „durim“", searchBtn:"Kërko", loading:"Duke u ngarkuar…",
      results:function(n,q){ return n + " ajete me „" + q + "“" + (n > 200 ? " (shfaqen 200 të parat)" : ""); }, noRes:"Asnjë ajet nuk u gjet.",
      wbw:"Fjalë për fjalë, me texhvid dhe test →", ofS:"nga", knownOf:function(k,t){ return k + " / " + t + " ajete i di"; },
      markAll:"I di të gjitha ajetet e kësaj sureje", unmarkAll:"Hiq shënimet e kësaj sureje", sajda:"Sexhde", tr:"Përkthimi"},
    en: {juzT:"Juz", read:"I read this surah", readOn:"Read ✓", readCount:function(k){ return k + " / 114 surahs read"; }, khatm:function(n){ return n ? "Complete readings: " + n : ""; }, newKhatm:"I read them all. Start the next reading", night:"Night", keys:"Keyboard: J / K next / previous verse, N / P next / previous surah", gotoRef:function(r){ return "Go to " + r + " \u2192"; }, verses:"verses", meccan:"Meccan", medinan:"Medinan", all:"All", juz:"Juz", bism:"In the name of Allah, the Entirely Merciful, the Especially Merciful",
      know:"I know it by heart", known:"Known ✓", save:"Save", saved:"Saved ★", link:"Link", copied:"Link copied", prev:"Previous surah", next:"Next surah",
      back:"All surahs", goto:"Go to verse", go:"Go", size:"Text size", trOn:"Show translation", sqOn:"Also show the Albanian translation",
      cont:"Continue where you stopped", contAt:"You stopped at", bm:"Saved verses", none:"No saved verses yet. Click “Save” on a verse.",
      searchPh:"Find a surah (name or number)", textPh:"Search a word in the translation, e.g. “patience”", searchBtn:"Search", loading:"Loading…",
      results:function(n,q){ return n + " verses with “" + q + "”" + (n > 200 ? " (showing the first 200)" : ""); }, noRes:"No verses found.",
      wbw:"Word by word, with tajweed and a test →", ofS:"of", knownOf:function(k,t){ return k + " / " + t + " verses known"; },
      markAll:"I know every verse of this surah", unmarkAll:"Clear this surah", sajda:"Prostration", tr:"Translation"},
    nl: {juzT:"Djoez", read:"Ik heb deze soera gelezen", readOn:"Gelezen ✓", readCount:function(k){ return k + " / 114 soera's gelezen"; }, khatm:function(n){ return n ? "Volledig uitgelezen: " + n + " keer" : ""; }, newKhatm:"Ik heb alles gelezen. Begin opnieuw", night:"Nacht", keys:"Toetsen: J / K volgend / vorig vers, N / P volgende / vorige soera", gotoRef:function(r){ return "Ga naar " + r + " \u2192"; }, verses:"verzen", meccan:"Mekkaans", medinan:"Medinees", all:"Alle", juz:"Djoez", bism:"In de naam van Allah, de Erbarmer, de Meest Barmhartige",
      know:"Ken ik uit mijn hoofd", known:"Gekend ✓", save:"Bewaar", saved:"Bewaard ★", link:"Link", copied:"Link gekopieerd", prev:"Vorige soera", next:"Volgende soera",
      back:"Alle soera's", goto:"Ga naar vers", go:"Ga", size:"Tekstgrootte", trOn:"Toon vertaling", sqOn:"Toon ook de Albanese vertaling",
      cont:"Ga verder waar je stopte", contAt:"Je stopte bij", bm:"Bewaarde verzen", none:"Nog geen bewaarde verzen. Klik op „Bewaar” bij een vers.",
      searchPh:"Zoek een soera (naam of nummer)", textPh:"Zoek een woord in de vertaling, bv. „geduld”", searchBtn:"Zoek", loading:"Laden…",
      results:function(n,q){ return n + " verzen met „" + q + "”" + (n > 200 ? " (de eerste 200)" : ""); }, noRes:"Geen verzen gevonden.",
      wbw:"Woord voor woord, met tadjwied en een test →", ofS:"van", knownOf:function(k,t){ return k + " / " + t + " verzen gekend"; },
      markAll:"Ik ken alle verzen van deze soera", unmarkAll:"Wis deze soera", sajda:"Neerknieling", tr:"Vertaling"},
    de: {juzT:"Dschuz", read:"Ich habe diese Sure gelesen", readOn:"Gelesen ✓", readCount:function(k){ return k + " / 114 Suren gelesen"; }, khatm:function(n){ return n ? "Ganz gelesen: " + n + "-mal" : ""; }, newKhatm:"Ich habe alles gelesen. Neu beginnen", night:"Nacht", keys:"Tasten: J / K nächster / vorheriger Vers, N / P nächste / vorherige Sure", gotoRef:function(r){ return "Gehe zu " + r + " \u2192"; }, verses:"Verse", meccan:"Mekkanisch", medinan:"Medinensisch", all:"Alle", juz:"Dschuz", bism:"Im Namen Allahs, des Allerbarmers, des Barmherzigen",
      know:"Kann ich auswendig", known:"Gekonnt ✓", save:"Merken", saved:"Gemerkt ★", link:"Link", copied:"Link kopiert", prev:"Vorherige Sure", next:"Nächste Sure",
      back:"Alle Suren", goto:"Zum Vers", go:"Los", size:"Schriftgröße", trOn:"Übersetzung zeigen", sqOn:"Auch die albanische Übersetzung zeigen",
      cont:"Weiterlesen, wo du aufgehört hast", contAt:"Du warst bei", bm:"Gemerkte Verse", none:"Noch keine gemerkten Verse. Klicke bei einem Vers auf „Merken“.",
      searchPh:"Sure suchen (Name oder Nummer)", textPh:"Ein Wort in der Übersetzung suchen, z. B. „Geduld“", searchBtn:"Suchen", loading:"Wird geladen…",
      results:function(n,q){ return n + " Verse mit „" + q + "“" + (n > 200 ? " (die ersten 200)" : ""); }, noRes:"Keine Verse gefunden.",
      wbw:"Wort für Wort, mit Tadschwid und Test →", ofS:"von", knownOf:function(k,t){ return k + " / " + t + " Verse gekonnt"; },
      markAll:"Ich kann alle Verse dieser Sure", unmarkAll:"Diese Sure zurücksetzen", sajda:"Niederwerfung", tr:"Übersetzung"}
  }[LANG] || null;
  var TR_LANG = LANG; // translation shown under the Arabic
  /* tajweed colours: data cpfair/quran-tajweed (CC BY 4.0) mapped on the Tanzil text, see build/tajweed.py */
  var TJ = {
    sq: {on:"Texhvid", title:"Ngjyrat e texhvidit", c:"lëvizje", leg:[[8,"Gunne: tingulli kalon nga hunda"],[11,"Idgam: dy shkronja bëhen një (me gunne)"],[12,"Idgam pa gunne"],[9,"Ihfa: 'n' fshihet pak, me tingull nga hunda"],[16,"Iklab: 'n' dëgjohet si 'm'"],[17,"Kalkale: një kërcim i vogël në zë"],[1,"Lam shemsije: 'l' e fjalës 'el' fshihet"],[3,"Med: 2 lëvizje"],[4,"Med: 2, 4 ose 6 lëvizje"],[5,"Med: 4 ose 5 lëvizje"],[7,"Med: 6 lëvizje"],[2,"Shkronjë që nuk lexohet"]], src:"Të dhënat e texhvidit: quran-tajweed (cpfair, CC BY 4.0)."},
    en: {on:"Tajweed", title:"Tajweed colours", c:"counts", leg:[[8,"Ghunnah: the sound passes through the nose"],[11,"Idgham: two letters become one (with ghunnah)"],[12,"Idgham without ghunnah"],[9,"Ikhfa: the 'n' is half hidden, with a nasal sound"],[16,"Iqlab: 'n' is heard as 'm'"],[17,"Qalqalah: a small bounce in the voice"],[1,"Lam shamsiyyah: the 'l' of 'al' is hidden"],[3,"Madd: 2 counts"],[4,"Madd: 2, 4 or 6 counts"],[5,"Madd: 4 or 5 counts"],[7,"Madd: 6 counts"],[2,"Silent letter"]], src:"Tajweed data: quran-tajweed (cpfair, CC BY 4.0)."},
    nl: {on:"Tadjwied", title:"Tadjwied-kleuren", c:"tellen", leg:[[8,"Ghunna: de klank gaat door de neus"],[11,"Idgham: twee letters worden één (met ghunna)"],[12,"Idgham zonder ghunna"],[9,"Ikhfa: de 'n' wordt half verborgen, met een neusklank"],[16,"Iqlab: 'n' klinkt als 'm'"],[17,"Qalqala: een klein sprongetje in de klank"],[1,"Lam shamsiyya: de 'l' van 'al' valt weg"],[3,"Madd: 2 tellen"],[4,"Madd: 2, 4 of 6 tellen"],[5,"Madd: 4 of 5 tellen"],[7,"Madd: 6 tellen"],[2,"Stille letter"]], src:"Tadjwied-gegevens: quran-tajweed (cpfair, CC BY 4.0)."},
    de: {on:"Tadschwid", title:"Tadschwid-Farben", c:"Zählzeiten", leg:[[8,"Ghunna: Der Laut geht durch die Nase"],[11,"Idgham: Zwei Buchstaben werden zu einem (mit Ghunna)"],[12,"Idgham ohne Ghunna"],[9,"Ikhfa: Das 'n' wird halb versteckt, mit Nasenklang"],[16,"Iqlab: 'n' klingt wie 'm'"],[17,"Qalqala: ein kleiner Sprung im Klang"],[1,"Lam Schamsiyya: Das 'l' von 'al' verschwindet"],[3,"Madd: 2 Zählzeiten"],[4,"Madd: 2, 4 oder 6 Zählzeiten"],[5,"Madd: 4 oder 5 Zählzeiten"],[7,"Madd: 6 Zählzeiten"],[2,"Stummer Buchstabe"]], src:"Tadschwid-Daten: quran-tajweed (cpfair, CC BY 4.0)."}
  }[LANG];
  var WI = {
    sq: {base:"Fjala bazë", root:"Rrënja", a:"Fjala bazë del {a} herë në Kuran.", b:"Rrënja del {b} herë.", all:"Shih të gjitha ajetet →", close:"Mbyll", src:"Të dhënat: Quranic Arabic Corpus.", hint:"Kliko një fjalë arabe për të parë rrënjën e saj."},
    en: {base:"Base word", root:"Root", a:"The base word appears {a} times in the Quran.", b:"The root appears {b} times.", all:"See all verses →", close:"Close", src:"Data: Quranic Arabic Corpus.", hint:"Tap an Arabic word to see its root."},
    nl: {base:"Grondwoord", root:"Wortel", a:"Het grondwoord staat {a} keer in de Koran.", b:"De wortel staat {b} keer in de Koran.", all:"Bekijk alle verzen →", close:"Sluiten", src:"Gegevens: Quranic Arabic Corpus.", hint:"Tik op een Arabisch woord om de wortel te zien."},
    de: {base:"Grundwort", root:"Wurzel", a:"Das Grundwort kommt {a}-mal im Koran vor.", b:"Die Wurzel kommt {b}-mal vor.", all:"Alle Verse ansehen →", close:"Schließen", src:"Daten: Quranic Arabic Corpus.", hint:"Tippe auf ein arabisches Wort, um seine Wurzel zu sehen."}
  }[LANG];
  var rootCount = null;
  function lemTable(){
    if(window.QWL) return Promise.resolve(window.QWL);
    return new Promise(function(res, rej){ var e = document.createElement("script"); e.src = BASE + "quran/q-wl-lem.js"; e.onload = function(){ res(window.QWL); }; e.onerror = rej; document.head.appendChild(e); });
  }
  function wordPop(span){
    var art = span.closest(".qr-v"); if(!art || !current || !WI) return;
    var s = current, v = +art.dataset.v, w = +span.dataset.w;
    document.querySelectorAll(".qw.sel").forEach(function(x){ x.classList.remove("sel"); }); span.classList.add("sel");
    Promise.all([chunk("wl", M.chunk[s - 1]), lemTable()]).then(function(r){
      var ids = (r[0][String(s)][v - 1] || "").split(","), id = +ids[w], Lt = r[1];
      if(!rootCount){ rootCount = {}; Lt.forEach(function(x){ if(x[1]) rootCount[x[1]] = (rootCount[x[1]] || 0) + x[2]; }); }
      var box = $("qrWord"); if(!box){ box = el("div", "qr-wpop"); box.id = "qrWord"; box.setAttribute("role", "dialog"); box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
      box.innerHTML = "";
      var x = el("button", "qr-wx", "\u00D7"); x.type = "button"; x.setAttribute("aria-label", WI.close); x.addEventListener("click", function(){ box.hidden = true; span.classList.remove("sel"); }); box.appendChild(x);
      var wd = el("p", "qr-ww", span.textContent); wd.lang = "ar"; wd.dir = "rtl"; box.appendChild(wd);
      box.appendChild(el("p", "qr-wr", s + ":" + v));
      if(id >= 0 && Lt[id]){
        var L0 = Lt[id];
        var dl = el("dl", "qr-wdl");
        dl.appendChild(el("dt", null, WI.base)); var d1 = el("dd", null, L0[0]); d1.lang = "ar"; dl.appendChild(d1);
        if(L0[1]){ dl.appendChild(el("dt", null, WI.root)); var d2 = el("dd", null, L0[1].split("").join(" ")); d2.lang = "ar"; dl.appendChild(d2); }
        box.appendChild(dl);
        box.appendChild(el("p", "qr-wc", WI.a.replace("{a}", L0[2]) + (L0[1] ? " " + WI.b.replace("{b}", rootCount[L0[1]]) : "")));
        var a = el("a", "qr-wall", WI.all); a.href = "mrekullite.html#numrat";
        a.addEventListener("click", function(){ save("ikreWcQuery", L0[0]); });
        box.appendChild(a);
      }
      box.appendChild(el("p", "qr-wsrc", WI.src));
      box.hidden = false;
    });
  }
  var BISM_TJ = [[7,1,0],[15,1,0],[16,1,1],[24,1,3],[28,1,0],[29,1,1],[35,1,4]];
  function fillAr(p, text, spans){
    p.textContent = "";
    if(!spans || !spans.length){ paint(p, text, null); return; }
    var r = new Array(text.length), i, j;
    for(i = 0; i < spans.length; i++) for(j = spans[i][0]; j < spans[i][0] + spans[i][1] && j < text.length; j++) r[j] = spans[i][2];
    /* keep a letter and its marks together: colour the whole letter group */
    var MARK = /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/;
    for(i = 0; i < text.length; ){
      j = i + 1; while(j < text.length && MARK.test(text[j])) j++;
      var g = r[i]; if(g == null) for(var q = i + 1; q < j; q++) if(r[q] != null){ g = r[q]; break; }
      for(q = i; q < j; q++) r[q] = g;
      i = j;
    }
    paint(p, text, r);
  }
  /* words become tappable spans (.qw); pause marks and spaces stay plain text */
  var PAUSE_RE = /^[\u06D6-\u06DC\u06DE\u06E9]+$/;
  function paint(p, text, r){
    var re = /[^ ]+/g, m, last = 0, wi = 0;
    while((m = re.exec(text))){
      if(m.index > last) p.appendChild(document.createTextNode(text.slice(last, m.index)));
      var tok = m[0], host = p;
      if(!PAUSE_RE.test(tok)){ host = document.createElement("span"); host.className = "qw"; host.dataset.w = wi++; p.appendChild(host); }
      var k = m.index, end = m.index + tok.length;
      while(k < end){
        var c = r ? r[k] : null, e = k + 1;
        while(e < end && (r ? r[e] : null) === c) e++;
        var part = text.slice(k, e);
        if(c == null) host.appendChild(document.createTextNode(part));
        else { var sp = document.createElement("span"); sp.className = "tj" + c; sp.textContent = part; host.appendChild(sp); }
        k = e;
      }
      last = end;
    }
    if(last < text.length) p.appendChild(document.createTextNode(text.slice(last)));
  }

  /* ---------- storage ---------- */
  function load(k, d){ try{ var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }catch(e){ return d; } }
  function save(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  var READY = {1:"el-fatiha",105:"el-fil",106:"kurejsh",107:"el-maun",108:"el-kevther",109:"el-kafirun",110:"en-nasr",111:"el-mesed",112:"el-ihlas",113:"el-felek",114:"en-nas"};
  function slug(s){ return READY[s] || ("sure-" + s); }
  var prefs = load("ikreQuranPrefs", {size: 1, tr: true, sq: false}); var curData = null;
  function mastery(){ return load("ikreMastery", {}); }
  function knownCount(m, s){ var o = m[slug(s)] || {}, n = 0; for(var k in o) if(o[k] === "yes") n++; return n; }

  /* ---------- data loading ---------- */
  var pending = {};
  function chunk(lang, k){
    var key = lang + "-" + k;
    if(window.QD && window.QD[key]) return Promise.resolve(window.QD[key]);
    if(pending[key]) return pending[key];
    pending[key] = new Promise(function(res, rej){
      var el = document.createElement("script");
      el.src = BASE + "quran/q-" + key + ".js";
      el.onload = function(){ res(window.QD[key]); };
      el.onerror = function(){ delete pending[key]; rej(new Error("load " + key)); };
      document.head.appendChild(el);
    });
    return pending[key];
  }
  function surahText(lang, s){ return chunk(lang, M.chunk[s - 1]).then(function(d){ return d[String(s)]; }); }

  /* ---------- helpers ---------- */
  function $(id){ return document.getElementById(id); }
  function el(tag, cls, txt){ var e = document.createElement(tag); if(cls) e.className = cls; if(txt != null) e.textContent = txt; return e; }
  var AR_DIG = "٠١٢٣٤٥٦٧٨٩";
  function arNum(n){ return String(n).replace(/\d/g, function(d){ return AR_DIG[+d]; }); }
  function normAr(s){ return s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/[\u0671\u0622\u0623\u0625]/g, "\u0627").replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647"); }
  function norm(s){ return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'‘`]/g, "'"); }
  function juzAt(s, v){ var j = 0; for(var i = 0; i < M.juz.length; i++){ var a = M.juz[i]; if(a[0] < s || (a[0] === s && a[1] <= v)) j = i + 1; } return j; }
  function juzStarts(s){ var o = {}; M.juz.forEach(function(a, i){ if(a[0] === s) o[a[1]] = i + 1; }); return o; }
  function isSajda(s, v){ return M.sajda.some(function(a){ return a[0] === s && a[1] === v; }); }
  var toastT;
  function toast(msg){ var t = $("qrToast"); if(!t) return; t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function(){ t.hidden = true; }, 1800); }

  /* ---------- overview: surah list ---------- */
  var filter = "all", query = "";
  function renderList(){
    var grid = $("qrList"); if(!grid) return;
    var m = mastery(), q = norm(query.trim()), rd = readSet();
    grid.innerHTML = "";
    var ref = /^(\d{1,3}):(\d{1,3})$/.exec(query.trim());
    if(ref && +ref[1] >= 1 && +ref[1] <= 114 && +ref[2] >= 1 && +ref[2] <= M.counts[+ref[1] - 1]){
      var go = el("a", "qr-tile qr-goref", T.gotoRef(NAMES[+ref[1] - 1] + " " + ref[1] + ":" + ref[2])); go.href = "#" + ref[1] + ":" + ref[2]; grid.appendChild(go);
    }
    var shown = 0;
    for(var s = 1; s <= 114; s++){
      var type = M.type[s - 1];
      if(filter !== "all" && type !== filter) continue;
      if(q && !(String(s) === q || norm(NAMES[s - 1]).indexOf(q) > -1 || M.ar[s - 1].indexOf(query.trim()) > -1)) continue;
      shown++;
      var total = M.counts[s - 1], k = knownCount(m, s);
      var a = el("a", "qr-tile" + (k === total ? " done" : "") + (rd[s] ? " read" : ""));
      a.href = "#" + s;
      a.innerHTML = '<span class="qr-num"></span><span class="qr-names"><span class="qr-name"></span><span class="qr-meta"></span></span><span class="qr-arn" lang="ar" dir="rtl"></span><span class="qr-bar"><i></i></span>';
      a.querySelector(".qr-num").textContent = s;
      a.querySelector(".qr-name").textContent = NAMES[s - 1];
      a.querySelector(".qr-meta").textContent = (type === "M" ? T.meccan : T.medinan) + " · " + (k ? k + "/" : "") + total + " " + T.verses;
      a.querySelector(".qr-arn").textContent = M.ar[s - 1];
      a.querySelector(".qr-bar i").style.width = (k / total * 100) + "%";
      grid.appendChild(a);
    }
    if(!shown && !ref) grid.appendChild(el("p", "qr-empty", T.noRes));
    // totals
    var tk = 0; for(var x = 1; x <= 114; x++) tk += knownCount(m, x);
    var pct = +(tk / 6236 * 100).toFixed(2);
    if($("pgTotalStat")) $("pgTotalStat").textContent = tk + " / 6236 " + T.verses + " (" + pct + "%)";
    if($("pgTotalFill")) $("pgTotalFill").style.width = Math.max(pct, tk ? .4 : 0) + "%";
  }
  function readSet(){ return load("ikreQuranRead", {}); }
  function renderJuz(){
    var box = $("qrJuz"); if(!box || box.children.length) return;
    M.juz.forEach(function(a, i){
      var x = el("a", "qr-juzc"); x.href = "#" + a[0] + ":" + a[1];
      x.appendChild(el("b", null, i + 1)); x.appendChild(el("span", null, NAMES[a[0] - 1] + " " + a[0] + ":" + a[1]));
      box.appendChild(x);
    });
  }
  function renderRead(){
    var box = $("qrReadStat"); if(!box) return;
    var r = readSet(), k = Object.keys(r).length, n = load("ikreQuranKhatm", 0);
    box.innerHTML = "";
    box.appendChild(el("span", null, T.readCount(k)));
    if(n) box.appendChild(el("span", "qr-khatm", T.khatm(n)));
    if(k === 114){
      var b = el("button", "qr-small", T.newKhatm); b.type = "button";
      b.addEventListener("click", function(){ save("ikreQuranKhatm", n + 1); save("ikreQuranRead", {}); renderRead(); renderList(); });
      box.appendChild(b);
    }
  }
  function renderContinue(){
    var box = $("qrContinue"); if(!box) return;
    var last = load("ikreQuranLast", null);
    if(!last){ box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = "";
    var a = el("a", "qr-cont");
    a.href = "#" + last.s + ":" + last.v;
    a.innerHTML = '<span class="qr-cont-k"></span><span class="qr-cont-t"></span><span class="qr-cont-go">→</span>';
    a.querySelector(".qr-cont-k").textContent = T.cont;
    a.querySelector(".qr-cont-t").textContent = T.contAt + " " + NAMES[last.s - 1] + " " + last.s + ":" + last.v;
    box.appendChild(a);
  }
  function renderBookmarks(){
    var box = $("qrBookmarks"); if(!box) return;
    var b = load("ikreQuranBm", []);
    box.innerHTML = "";
    var pan = box.closest(".qr-panel"); if(pan) pan.hidden = !b.length;
    if(!b.length) return;
    var ul = el("ul", "qr-bml");
    b.forEach(function(x){
      var li = el("li"), a = el("a", null, NAMES[x[0] - 1] + " " + x[0] + ":" + x[1]);
      a.href = "#" + x[0] + ":" + x[1]; li.appendChild(a); ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  /* ---------- text search ---------- */
  function runSearch(){
    var qIn = $("qrText"), out = $("qrResults"); if(!qIn || !out) return;
    var q = qIn.value.trim(); if(q.length < 2){ out.innerHTML = ""; return; }
    out.innerHTML = ""; out.appendChild(el("p", "qr-muted", T.loading));
    var isAr = /[\u0600-\u06FF]/.test(q), SL = isAr ? "ar" : TR_LANG;
    var ps = []; for(var k = 0; k < M.nchunks; k++) ps.push(chunk(SL, k));
    Promise.all(ps).then(function(){
      var nq = isAr ? normAr(q) : norm(q), hits = [];
      for(var s = 1; s <= 114; s++){
        var arr = window.QD[SL + "-" + M.chunk[s - 1]][String(s)];
        for(var v = 0; v < arr.length; v++){ var hay = isAr ? normAr(arr[v]) : norm(arr[v]); if(hay.indexOf(nq) > -1) hits.push([s, v + 1, arr[v]]); }
      }
      out.innerHTML = "";
      out.appendChild(el("p", "qr-res-n", hits.length ? T.results(hits.length, q) : T.noRes));
      var ol = el("ol", "qr-res");
      hits.slice(0, 200).forEach(function(h){
        var li = el("li"), a = el("a");
        a.href = "#" + h[0] + ":" + h[1];
        var ref = el("span", "qr-res-ref", NAMES[h[0] - 1] + " " + h[0] + ":" + h[1]);
        var tx = el("span", "qr-res-t" + (isAr ? " qr-res-ar" : "")); if(isAr){ tx.lang = "ar"; tx.dir = "rtl"; }
        // highlight (diacritic-insensitive)
        var n = norm(h[2]), i = isAr ? -1 : n.indexOf(nq);
        if(i > -1){ tx.appendChild(document.createTextNode(h[2].slice(0, i))); tx.appendChild(el("mark", null, h[2].slice(i, i + q.length))); tx.appendChild(document.createTextNode(h[2].slice(i + q.length))); }
        else tx.textContent = h[2];
        a.appendChild(ref); a.appendChild(tx); li.appendChild(a); ol.appendChild(li);
      });
      out.appendChild(ol);
    }).catch(function(){ out.innerHTML = ""; });
  }

  /* ---------- reader ---------- */
  var current = 0, observer = null;
  function applyPrefs(){
    var r = $("qrReader"); if(!r) return;
    r.style.setProperty("--qr-scale", prefs.size);
    r.classList.toggle("no-tr", !prefs.tr);
    r.classList.toggle("show-sq", !!prefs.sq);
    document.body.classList.toggle("qr-night", !!prefs.night);
    var nt = $("qrNight"); if(nt) nt.checked = !!prefs.night;
    var b = $("qrTr"); if(b) b.checked = !!prefs.tr;
    var c = $("qrSq"); if(c) c.checked = !!prefs.sq;
    var tj = $("qrTj"); if(tj) tj.checked = !!prefs.tj;
    r.classList.toggle("tj-on", !!prefs.tj);
    var lg = $("qrTjLeg"); if(lg) lg.hidden = !prefs.tj;
  }
  function tjFor(s){ return prefs.tj ? chunk("tj", M.chunk[s - 1]).then(function(d){ return d[String(s)]; }, function(){ return null; }) : Promise.resolve(null); }
  function paintAr(){
    if(!curData) return;
    var s = curData.s;
    tjFor(s).then(function(tj){
      if(current !== s) return; curData.tj = tj;
      var bi = document.querySelector("#qrVerses .qr-bism-ar"); if(bi) fillAr(bi, "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tj ? BISM_TJ : null);
      document.querySelectorAll("#qrVerses .qr-v").forEach(function(art){
        var v = +art.dataset.v, p = art.querySelector(".qr-ar"), end = p.querySelector(".qr-end");
        fillAr(p, curData.ar[v - 1] + " ", tj ? tj[v - 1] : null); p.appendChild(end);
      });
    });
  }
  function openSurah(s, v){
    var ov = $("qrOverview"), rd = $("qrReader");
    ov.hidden = true; rd.hidden = false;
    if(current !== s){
      current = s;
      var langs = ["ar", TR_LANG]; if(TR_LANG !== "sq") langs.push("sq");
      $("qrVerses").innerHTML = ""; $("qrVerses").appendChild(el("p", "qr-muted", T.loading));
      Promise.all(langs.map(function(l){ return surahText(l, s); }).concat([tjFor(s)])).then(function(res){
        if(current !== s) return;
        var tjd = res.pop();
        buildSurah(s, res[0], res[1], res[2], tjd);
        if(v) focusVerse(s, v); else window.scrollTo(0, rd.offsetTop - 70);
      });
    } else if(v) focusVerse(s, v); else window.scrollTo(0, rd.offsetTop - 70);
  }
  function buildSurah(s, ar, tr, sq, tjd){
    curData = {s: s, ar: ar, tj: tjd};
    var total = M.counts[s - 1];
    $("qrTitle").textContent = s + ". " + NAMES[s - 1];
    $("qrTitleAr").textContent = "سُورَةُ " + M.ar[s - 1];
    $("qrInfo").textContent = (M.type[s - 1] === "M" ? T.meccan : T.medinan) + " · " + total + " " + T.verses + " · " + T.juz + " " + juzAt(s, 1);
    var p = $("qrPrev"), n = $("qrNext");
    p.hidden = s === 1; n.hidden = s === 114;
    p.href = "#" + (s - 1); n.href = "#" + (s + 1);
    p.querySelector("span").textContent = s > 1 ? NAMES[s - 2] : "";
    n.querySelector("span").textContent = s < 114 ? NAMES[s] : "";
    $("qrGotoV").max = total; $("qrGotoV").value = "";
    var w = $("qrWbw"); w.hidden = !READY[s]; w.href = "meso.html#sure-" + s;
    var box = $("qrVerses"); box.innerHTML = "";
    if(s !== 1 && s !== 9){
      var b = el("div", "qr-bism");
      var bp = el("p", "qr-bism-ar"); bp.setAttribute("lang", "ar"); fillAr(bp, "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tjd ? BISM_TJ : null); b.appendChild(bp);
      b.appendChild(el("p", "qr-bism-tr", T.bism));
      box.appendChild(b);
    }
    var js = juzStarts(s), m = mastery()[slug(s)] || {}, bm = load("ikreQuranBm", []);
    var frag = document.createDocumentFragment();
    for(var i = 0; i < ar.length; i++){
      var v = i + 1;
      if(js[v] && !(s === 1 && v === 1)){ var j = el("div", "qr-juz", T.juz + " " + js[v]); frag.appendChild(j); }
      var art = el("article", "qr-v");
      art.id = "v-" + s + "-" + v; art.dataset.v = v;
      var a = el("p", "qr-ar"); a.lang = "ar"; a.dir = "rtl";
      fillAr(a, ar[i] + " ", tjd ? tjd[i] : null);
      a.appendChild(el("span", "qr-end", "﴿" + arNum(v) + "﴾"));
      var t = el("p", "qr-tr", tr[i]);
      var head = el("div", "qr-vhead");
      var num = el("a", "qr-vn", s + ":" + v); num.href = "#" + s + ":" + v;
      head.appendChild(num);
      if(isSajda(s, v)) head.appendChild(el("span", "qr-sajda", "۩ " + T.sajda));
      var mi = window.QMIRA && window.QMIRA.v[s + ":" + v];
      if(mi){ var ml = el("a", "qr-mira", "✦ " + window.QMIRA.label + ": " + mi[1] + " →"); ml.href = "mrekullite.html#" + mi[0]; head.appendChild(ml); }
      art.appendChild(head); art.appendChild(a); art.appendChild(t);
      if(sq){ var q = el("p", "qr-tr qr-sq", sq[i]); q.lang = "sq"; art.appendChild(q); }
      var acts = el("div", "qr-acts");
      var kb = el("button", "qr-act qr-know" + (m[v] === "yes" ? " on" : ""), m[v] === "yes" ? T.known : T.know);
      kb.type = "button"; kb.dataset.act = "know"; kb.setAttribute("aria-pressed", m[v] === "yes");
      var isB = bm.some(function(x){ return x[0] === s && x[1] === v; });
      var sb = el("button", "qr-act qr-save" + (isB ? " on" : ""), isB ? T.saved : T.save);
      sb.type = "button"; sb.dataset.act = "save"; sb.setAttribute("aria-pressed", isB);
      var lb = el("button", "qr-act", T.link); lb.type = "button"; lb.dataset.act = "link";
      acts.appendChild(kb); acts.appendChild(sb); acts.appendChild(lb);
      art.appendChild(acts);
      frag.appendChild(art);
    }
    box.appendChild(frag);
    updateSurahStat(s); updateRead(s);
    watchReading(s);
  }
  function updateRead(s){
    var b = $("qrRead"); if(!b) return; var on = !!readSet()[s];
    b.textContent = on ? T.readOn : T.read; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
  }
  function updateSurahStat(s){
    var k = knownCount(mastery(), s), t = M.counts[s - 1];
    $("qrKnown").textContent = T.knownOf(k, t);
    $("qrKnownFill").style.width = (k / t * 100) + "%";
    $("qrAll").textContent = k === t ? T.unmarkAll : T.markAll;
  }
  function focusVerse(s, v){
    var e = $("v-" + s + "-" + v); if(!e) return;
    e.scrollIntoView({block: "center"});
    e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash");
    save("ikreQuranLast", {s: s, v: v});
  }
  function watchReading(s){
    if(observer) observer.disconnect();
    if(!("IntersectionObserver" in window)) return;
    var t;
    observer = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var v = +en.target.dataset.v;
          clearTimeout(t); t = setTimeout(function(){ if(current === s) save("ikreQuranLast", {s: s, v: v}); }, 600);
        }
      });
    }, {rootMargin: "-40% 0px -55% 0px"});
    document.querySelectorAll("#qrVerses .qr-v").forEach(function(x){ observer.observe(x); });
  }
  function showOverview(){
    current = 0;
    if(observer) observer.disconnect();
    $("qrReader").hidden = true; $("qrOverview").hidden = false;
    renderList(); renderContinue(); renderBookmarks(); renderJuz(); renderRead();
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function(e){
    var qw = e.target.closest("#qrVerses .qr-v .qw"); if(qw){ wordPop(qw); return; }
    var b = e.target.closest(".qr-act"); if(!b) return;
    var art = b.closest(".qr-v"), s = current, v = +art.dataset.v;
    if(b.dataset.act === "know"){
      var m = mastery(), sl = slug(s); m[sl] = m[sl] || {};
      if(m[sl][v] === "yes") delete m[sl][v]; else m[sl][v] = "yes";
      save("ikreMastery", m);
      var on = m[sl][v] === "yes";
      b.classList.toggle("on", on); b.textContent = on ? T.known : T.know; b.setAttribute("aria-pressed", on);
      updateSurahStat(s);
    } else if(b.dataset.act === "save"){
      var bm = load("ikreQuranBm", []), i = -1;
      bm.forEach(function(x, j){ if(x[0] === s && x[1] === v) i = j; });
      if(i > -1) bm.splice(i, 1); else bm.unshift([s, v]);
      save("ikreQuranBm", bm.slice(0, 200));
      var on2 = i === -1;
      b.classList.toggle("on", on2); b.textContent = on2 ? T.saved : T.save; b.setAttribute("aria-pressed", on2);
    } else if(b.dataset.act === "link"){
      var url = location.href.split("#")[0] + "#" + s + ":" + v;
      var done = function(){ toast(T.copied); };
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function(){ toast(url); });
      else toast(url);
      history.replaceState(null, "", "#" + s + ":" + v);
    }
  });

  function route(){
    var h = decodeURIComponent(location.hash.slice(1));
    var m = /^(\d{1,3})(?::(\d{1,3}))?$/.exec(h);
    if(m){
      var s = +m[1], v = m[2] ? +m[2] : 0;
      if(s >= 1 && s <= 114){ if(v > M.counts[s - 1]) v = M.counts[s - 1]; openSurah(s, v); return; }
    }
    showOverview();
  }

  function init(){
    if(!$("qrList")) return;
    $("qrFind").addEventListener("input", function(){ query = this.value; renderList(); });
    document.querySelectorAll(".qr-chip").forEach(function(c){
      c.addEventListener("click", function(){
        filter = c.dataset.f;
        document.querySelectorAll(".qr-chip").forEach(function(x){ x.setAttribute("aria-pressed", x === c); });
        renderList();
      });
    });
    $("qrTextForm").addEventListener("submit", function(e){ e.preventDefault(); runSearch(); });
    $("qrGoto").addEventListener("submit", function(e){
      e.preventDefault(); var v = +$("qrGotoV").value;
      if(current && v >= 1 && v <= M.counts[current - 1]){ history.replaceState(null, "", "#" + current + ":" + v); focusVerse(current, v); }
    });
    $("qrSmaller").addEventListener("click", function(){ prefs.size = Math.max(.8, +(prefs.size - .1).toFixed(2)); save("ikreQuranPrefs", prefs); applyPrefs(); });
    $("qrBigger").addEventListener("click", function(){ prefs.size = Math.min(1.8, +(prefs.size + .1).toFixed(2)); save("ikreQuranPrefs", prefs); applyPrefs(); });
    $("qrTr").addEventListener("change", function(){ prefs.tr = this.checked; save("ikreQuranPrefs", prefs); applyPrefs(); });
    var tjT = $("qrTj"); if(tjT && TJ){
      tjT.parentNode.lastChild.textContent = " " + TJ.on;
      tjT.addEventListener("change", function(){ prefs.tj = this.checked; save("ikreQuranPrefs", prefs); applyPrefs(); paintAr(); });
      var lg = el("details", "qr-tjleg"); lg.id = "qrTjLeg"; lg.hidden = true;
      var sm = el("summary", null, TJ.title); lg.appendChild(sm);
      var ul = el("ul");
      TJ.leg.forEach(function(x){ var li = el("li"); var d = el("span", "qr-tjdot tjb" + x[0]); li.appendChild(d); li.appendChild(document.createTextNode(" " + x[1])); ul.appendChild(li); });
      lg.appendChild(ul); lg.appendChild(el("p", "qr-tjsrc", TJ.src));
      var vs = $("qrVerses"); vs.parentNode.insertBefore(lg, vs);
    }
    var sqT = $("qrSq"); if(sqT) sqT.addEventListener("change", function(){ prefs.sq = this.checked; save("ikreQuranPrefs", prefs); applyPrefs(); });
    $("qrAll").addEventListener("click", function(){
      var s = current; if(!s) return;
      var m = mastery(), sl = slug(s), t = M.counts[s - 1], all = knownCount(m, s) === t;
      m[sl] = {}; if(!all) for(var v = 1; v <= t; v++) m[sl][v] = "yes";
      save("ikreMastery", m);
      document.querySelectorAll("#qrVerses .qr-know").forEach(function(b){ b.classList.toggle("on", !all); b.textContent = !all ? T.known : T.know; b.setAttribute("aria-pressed", !all); });
      updateSurahStat(s);
    });
    var nt = $("qrNight"); if(nt){ nt.parentNode.lastChild.textContent = " " + T.night; nt.addEventListener("change", function(){ prefs.night = this.checked; save("ikreQuranPrefs", prefs); applyPrefs(); }); }
    var rb = $("qrRead"); if(rb) rb.addEventListener("click", function(){
      if(!current) return; var r = readSet(); if(r[current]) delete r[current]; else r[current] = 1; save("ikreQuranRead", r); updateRead(current);
    });
    var kh = $("qrKeys"); if(kh) kh.textContent = (WI ? WI.hint + " " : "") + T.keys;
    if($("qrJuzT")) $("qrJuzT").textContent = T.juzT;
    document.addEventListener("keydown", function(e){
      if(!current || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target; if(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      var k = e.key.toLowerCase();
      if(k === "n" && current < 114){ location.hash = "#" + (current + 1); }
      else if(k === "p" && current > 1){ location.hash = "#" + (current - 1); }
      else if(k === "j" || k === "k"){
        var last = load("ikreQuranLast", {s: current, v: 1}), v = last.s === current ? last.v : 1;
        v = Math.min(M.counts[current - 1], Math.max(1, v + (k === "j" ? 1 : -1)));
        history.replaceState(null, "", "#" + current + ":" + v); focusVerse(current, v);
      } else return;
      e.preventDefault();
    });
    applyPrefs();
    window.addEventListener("hashchange", route);
    route();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
