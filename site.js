// Language: each language has its own copy of every page (root = Albanian, en/, nl/, de/).
// The flags in the header are plain links to the same page in the other language.
(function(){
  var cur = (document.documentElement.lang || "sq").slice(0, 2);
  var DIRS = { sq: "", en: "en/", nl: "nl/", de: "de/" };
  if(!(cur in DIRS)) cur = "sq";
  window.ikreLang = cur;
  window.ikreLangHref = function(code, href){
    if(!code || !(code in DIRS) || code === cur || !href || /^(#|https?:|\/\/|\.\.\/)/.test(href)) return href;
    return (cur === "sq" ? "" : "../") + DIRS[code] + href;
  };
  function remember(code){ try{ localStorage.setItem("ikreLang", code); }catch(e){} }
  Array.prototype.slice.call(document.querySelectorAll(".lang-flag")).forEach(function(a){
    a.addEventListener("click", function(){ remember(a.dataset.lang); });
  });
  var kl = document.getElementById("kushLanguage");
  if(kl){
    kl.addEventListener("change", function(){
      if(!kl.value) return;
      remember(kl.value);
      Array.prototype.slice.call(document.querySelectorAll(".lang-flag")).forEach(function(a){
        a.classList.toggle("suggest", a.dataset.lang === kl.value && a.dataset.lang !== cur);
      });
    });
  }
})();

/* Gentle language hint: if the browser's language is one of ours and differs from
   this page, offer the other version once. Nothing changes unless the visitor clicks. */
(function(){
  var HINT = {
    sq: ["🇦🇱 Kjo faqe është edhe në shqip.", "Hape në shqip", "Mbyll"],
    en: ["🇬🇧 This site is also in English.", "Open in English", "Close"],
    nl: ["🇳🇱 Deze site is ook in het Nederlands.", "Open in het Nederlands", "Sluiten"],
    de: ["🇩🇪 Diese Seite gibt es auch auf Deutsch.", "Auf Deutsch öffnen", "Schließen"]
  };
  var cur = window.ikreLang, chosen = null, off = null;
  try{ chosen = localStorage.getItem("ikreLang"); off = localStorage.getItem("ikreLangHint"); }catch(e){}
  if(chosen || off) return;
  var want = null, langs = navigator.languages || [navigator.language || ""];
  for(var i = 0; i < langs.length; i++){ var l = (langs[i] || "").slice(0, 2).toLowerCase(); if(HINT[l]){ want = l; break; } }
  if(!want || want === cur) return;
  var flag = document.querySelector('.lang-flag[data-lang="' + want + '"]');
  var header = document.querySelector("header");
  if(!flag || !header) return;
  var t = HINT[want];
  var bar = document.createElement("div");
  bar.className = "lang-hint"; bar.setAttribute("role", "note"); bar.lang = want;
  bar.innerHTML = '<div class="wrap"><span></span> <a></a> <button type="button"></button></div>';
  bar.querySelector("span").textContent = t[0];
  var a = bar.querySelector("a"); a.textContent = t[1] + " →"; a.href = flag.getAttribute("href");
  a.addEventListener("click", function(){ try{ localStorage.setItem("ikreLang", want); }catch(e){} });
  var x = bar.querySelector("button"); x.textContent = "✕"; x.setAttribute("aria-label", t[2]);
  x.addEventListener("click", function(){ bar.remove(); try{ localStorage.setItem("ikreLangHint", "off"); }catch(e){} });
  header.insertAdjacentElement("afterend", bar);
})();
(function(){
  var dd = document.getElementById("navLearnDropdown");
  if(!dd) return;
  var btn = dd.querySelector(".nav-dropdown-btn");
  var menu = dd.querySelector(".nav-dropdown-menu");
  function close(){ menu.hidden = true; btn.setAttribute("aria-expanded","false"); }
  function open(){ menu.hidden = false; btn.setAttribute("aria-expanded","true"); }
  btn.addEventListener("click", function(e){
    e.stopPropagation();
    if(menu.hidden) open(); else close();
  });
  document.addEventListener("click", function(e){
    if(!dd.contains(e.target)) close();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape") close();
  });
  Array.prototype.slice.call(menu.querySelectorAll("a")).forEach(function(a){
    a.addEventListener("click", close);
  });
})();
(function(){
  var btn = document.getElementById("navMenuBtn");
  if(!btn) return;
  var LABELS = { sq: ["☰ Menu", "✕ Mbyll"], en: ["☰ Menu", "✕ Close"], nl: ["☰ Menu", "✕ Sluiten"], de: ["☰ Menü", "✕ Schließen"] };
  var lab = LABELS[window.ikreLang] || LABELS.sq;
  var nav = btn.closest(".nav");
  function set(open){
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? lab[1] : lab[0];
  }
  btn.addEventListener("click", function(){ set(!nav.classList.contains("open")); });
  nav.querySelectorAll(".nav-links a").forEach(function(a){ a.addEventListener("click", function(){ set(false); }); });
})();
