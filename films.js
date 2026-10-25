/* Ikre: the short Blender films on the Miracles page. They load only when close to view,
   play muted while visible and pause when out of view. With reduced motion they stay on the poster. */
(function () {
  var vids = [].slice.call(document.querySelectorAll('.mk-cine video'));
  if (!vids.length) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;
  function load(v) {
    if (v.dataset.on) return; v.dataset.on = '1';
    [].forEach.call(v.querySelectorAll('source[data-src]'), function (s) { s.src = s.getAttribute('data-src'); });
    v.load();
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting && en.intersectionRatio > 0.35) { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else if (!v.paused) v.pause();
    });
  }, { threshold: [0, 0.35, 0.7] });
  vids.forEach(function (v) { io.observe(v); });
})();
