/* Day or night look (build/themes.py). Runs in <head> before the page paints. The visitor's choice is kept in
   localStorage "ikreTheme" ("day" or "night"); with no choice, the device's own light/dark setting decides.
   Also closes the "still under construction" notice for good once the visitor closes it. */
(function () {
  var d = document.documentElement, t = null;
  try { t = localStorage.getItem('ikreTheme'); } catch (e) {}
  if (t !== 'day' && t !== 'night') t = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'night' : 'day';
  d.setAttribute('data-theme', t);
  var noticeOff = false; try { noticeOff = localStorage.getItem('ikreNotice') === 'off'; } catch (e) {}
  if (noticeOff) d.classList.add('no-notice');
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('themeBtn');
    if (b) {
      var set = function () { b.setAttribute('aria-pressed', d.getAttribute('data-theme') === 'night' ? 'true' : 'false'); };
      set();
      b.addEventListener('click', function () {
        var n = d.getAttribute('data-theme') === 'night' ? 'day' : 'night';
        d.setAttribute('data-theme', n); set();
        try { localStorage.setItem('ikreTheme', n); } catch (e) {}
      });
    }
    var x = document.getElementById('siteNoticeX'), bar = document.getElementById('siteNotice');
    if (x && bar) x.addEventListener('click', function () {
      bar.remove(); try { localStorage.setItem('ikreNotice', 'off'); } catch (e) {}
    });
  });
})();
