/* footnotes: when a footnote link points into a closed lesson (details), open it first, then go there */
(function(){
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest('a[href^="#fn"]'); if(!a) return;
    var t = document.getElementById(a.getAttribute("href").slice(1)); if(!t) return;
    for(var p = t.parentElement; p; p = p.parentElement){ if(p.tagName === "DETAILS") p.open = true; if(p.hidden) p.hidden = false; }
    e.preventDefault();
    t.scrollIntoView({block: "center", behavior: "smooth"});
    try{ history.replaceState(null, "", "#" + t.id); }catch(err){}
    t.classList.add("fn-flash"); setTimeout(function(){ t.classList.remove("fn-flash"); }, 1600);
  });
})();
