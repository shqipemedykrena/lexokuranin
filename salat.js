/* Prayer-time calculator for namazi.html (owner, 28 Oct 2026; spec: prayer_time_calculator_spec.md).
   Everything is worked out in this browser. The only outside call is the place search (OpenStreetMap Nominatim),
   and only after the visitor presses "Search" or "Use my location". Time zones come from tz-lookup (CC0, self-hosted).
   Engine: sun position after Meeus (low precision, about 0.01°), each event found by 3 rounds of
   "guess the time, recompute the sun there". All instants are UTC; the IANA time zone only formats them. */
(function (G) {
  'use strict';
  var R = Math.PI / 180, DAY = 864e5;
  function sun(ms) {                       // ms = UTC instant -> declination (deg) and equation of time (minutes)
    var T = (ms / DAY + 2440587.5 - 2451545) / 36525;
    var L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
    var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    var C = Math.sin(M * R) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * R) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * R) * 0.000289;
    var om = 125.04 - 1934.136 * T, lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * R);
    var eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(om * R);
    var dec = Math.asin(Math.sin(eps * R) * Math.sin(lam * R)) / R;
    var y = Math.pow(Math.tan(eps * R / 2), 2);
    var E = y * Math.sin(2 * L0 * R) - 2 * e * Math.sin(M * R) + 4 * e * y * Math.sin(M * R) * Math.cos(2 * L0 * R)
          - 0.5 * y * y * Math.sin(4 * L0 * R) - 1.25 * e * e * Math.sin(2 * M * R);
    return { dec: dec, eqt: 4 * E / R };
  }
  function transit(d0, lon) {              // d0 = UTC midnight of a day; returns the UTC instant of solar noon near it
    var t = d0 + (720 - 4 * lon) * 6e4;
    for (var i = 0; i < 3; i++) t = d0 + (720 - 4 * lon - sun(t).eqt) * 6e4;
    return t;
  }
  function hourAngle(lat, dec, alt) {      // hours from noon when the sun's centre is at altitude alt; NaN if never
    var c = (Math.sin(alt * R) - Math.sin(lat * R) * Math.sin(dec * R)) / (Math.cos(lat * R) * Math.cos(dec * R));
    return (c < -1 || c > 1) ? NaN : Math.acos(c) / R / 15;
  }
  function cross(noon, lat, lon, alt, dir) {   // dir -1 = morning, +1 = evening; alt may be a function of declination
    var t = noon, ok = true;
    for (var i = 0; i < 3; i++) {
      var s = sun(t), a = typeof alt === 'function' ? alt(sun(noon).dec) : alt, h = hourAngle(lat, s.dec, a);
      if (isNaN(h)) { ok = false; break; }
      t = noon + dir * h * 36e5;
    }
    return ok ? t : null;
  }
  function asrAlt(factor, lat) { return function (dec) { return Math.atan(1 / (factor + Math.tan(Math.abs(lat - dec) * R))) / R; }; }

  var parts = {};
  function fmt(tz) {
    return parts[tz] || (parts[tz] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }));
  }
  function local(ms, tz) {                 // -> {y,m,d,hh,mm} in the place's own time zone
    var o = {}; fmt(tz).formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, hh: +o.hour % 24, mm: +o.minute };
  }
  function todayIn(tz) { var l = local(Date.now(), tz); return { y: l.y, m: l.m, d: l.d }; }
  function utcOffset(ms, tz) {             // minutes east of UTC at that instant
    var l = local(ms, tz); return Math.round((Date.UTC(l.y, l.m - 1, l.d, l.hh, l.mm) - Math.floor(ms / 6e4) * 6e4) / 6e4);
  }

  // Solar noon that falls on local calendar day (y,m,d) in tz
  function noonOn(y, m, d, lon, tz) {
    var d0 = Date.UTC(y, m - 1, d), t = transit(d0, lon);
    for (var k = 0; k < 2; k++) {
      var l = local(t, tz), diff = Math.round((Date.UTC(l.y, l.m - 1, l.d) - d0) / DAY);
      if (!diff) break;
      t = transit(d0 - diff * DAY, lon);
    }
    return t;
  }
  var METHODS = { m15: { fajr: 15, isha: 15 }, mwl: { fajr: 18, isha: 17 }, ehv: { fajr: 15, isha: 15, summer: true } };
  function raw(y, m, d, p) {
    var n = noonOn(y, m, d, p.lon, p.tz);
    return { noon: n, rise: cross(n, p.lat, p.lon, -0.833, -1), set: cross(n, p.lat, p.lon, -0.833, 1) };
  }
  // One day. p = {lat, lon, tz}; o = {method:'m15'|'mwl'|'ehv', asr:1|2}
  function day(y, m, d, p, o) {
    var M = METHODS[o.method] || METHODS.m15, r = raw(y, m, d, p), n = r.noon;
    var prev = raw(y, m, d - 1, p), next = raw(y, m, d + 1, p);
    var out = { y: y, m: m, d: d, dhuhr: n, sunrise: r.rise, maghrib: r.set, asr: cross(n, p.lat, p.lon, asrAlt(o.asr === 2 ? 2 : 1, p.lat), 1), rule: {} };
    out.fajr = cross(n, p.lat, p.lon, -M.fajr, -1);
    out.isha = cross(n, p.lat, p.lon, -M.isha, 1);
    var nightBefore = (r.rise && prev.set) ? r.rise - prev.set : null, nightAfter = (next.rise && r.set) ? next.rise - r.set : null;
    if (M.summer && (m === 6 || m === 7)) {
      // Reconstructed from the Stichting Alabraar Eindhoven June/July 2026 timetables (unofficial, not verified by the mosque)
      out.fajr = nightBefore ? r.rise - nightBefore * 14 / 60 : null;
      out.isha = r.set ? r.set + 90 * 6e4 : null;
      out.rule.fajr = out.rule.isha = 'summer';
    } else {
      // Short nights: Fajr no earlier than (angle/60) of the night before sunrise, Isha no later than that after sunset
      if (nightBefore) { var f = r.rise - nightBefore * M.fajr / 60; if (out.fajr === null || out.fajr < f) { out.fajr = f; out.rule.fajr = 'share'; } }
      else if (out.fajr === null) out.rule.fajr = 'none';
      if (nightAfter) { var s = r.set + nightAfter * M.isha / 60; if (out.isha === null || out.isha > s) { out.isha = s; out.rule.isha = 'share'; } }
      else if (out.isha === null) out.rule.isha = 'none';
    }
    // Midnight (end of Isha, IslamQA 9940): halfway from sunset to the next Fajr
    var nf = null;
    if (r.set) nf = dayFajr(y, m, d + 1, p, M, next, r.set);
    out.midnight = (r.set && nf) ? r.set + (nf - r.set) / 2 : null;
    if (!r.rise || !r.set) { out.polar = true; out.fajr = out.isha = out.asr = out.midnight = null; out.rule = {}; }
    return out;
  }
  function dayFajr(y, m, d, p, M, rr, prevSet) {   // Fajr of the next day, for the midnight column
    var dt = new Date(Date.UTC(y, m - 1, d)), mm = dt.getUTCMonth() + 1;
    var f = cross(rr.noon, p.lat, p.lon, -M.fajr, -1), nb = (rr.rise && prevSet) ? rr.rise - prevSet : null;
    if (M.summer && (mm === 6 || mm === 7)) return nb ? rr.rise - nb * 14 / 60 : null;
    if (nb) { var g = rr.rise - nb * M.fajr / 60; if (f === null || f < g) f = g; }
    return f;
  }
  function month(y, m, p, o) {
    var n = new Date(Date.UTC(y, m, 0)).getUTCDate(), a = [];
    for (var d = 1; d <= n; d++) a.push(day(y, m, d, p, o));
    return a;
  }
  function hm(ms, tz, y, m, d) {           // "06:07", rounded to the nearest minute; "+1" when it falls on the next date
    if (ms === null || ms === undefined || isNaN(ms)) return '';
    var l = local(Math.round(ms / 6e4) * 6e4, tz), s = (l.hh < 10 ? '0' : '') + l.hh + ':' + (l.mm < 10 ? '0' : '') + l.mm;
    if (y && Date.UTC(l.y, l.m - 1, l.d) > Date.UTC(y, m - 1, d)) s += ' (+1)';
    return s;
  }
  G.Salat = { day: day, month: month, hm: hm, local: local, todayIn: todayIn, utcOffset: utcOffset, METHODS: METHODS };
})(typeof window !== 'undefined' ? window : globalThis);

/* The calculator box in #nz-times. Texts come from data-t on #nzCalc (build/namazi_more.py CALC). */
(function () {
  'use strict';
  var box = document.getElementById('nzCalc');
  if (!box || !window.Salat) return;
  var T = JSON.parse(box.getAttribute('data-t')), S = window.Salat, L = T.lang;
  var $ = function (id) { return document.getElementById(id); };
  var q = $('nzcQ'), form = $('nzcForm'), msg = $('nzcMsg'), pick = $('nzcPick'), out = $('nzcOut');
  var KEYP = 'ikrePrayPlace', KEYS = 'ikrePraySet';
  function get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function put(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function say(t, bad) { msg.textContent = t || ''; msg.classList.toggle('is-bad', !!bad); }

  var set = get(KEYS) || {}; if (!S.METHODS[set.method]) set.method = 'm15'; if (set.asr !== 2) set.asr = 1;
  var place = get(KEYP), example = false;
  if (!place || typeof place.lat !== 'number') { place = T.ex; example = true; }
  var ym = null;

  // settings
  [].forEach.call(box.querySelectorAll('input[name="nzcM"]'), function (r) { r.checked = r.value === set.method; r.addEventListener('change', function () { set.method = r.value; put(KEYS, set); draw(); }); });
  [].forEach.call(box.querySelectorAll('input[name="nzcA"]'), function (r) { r.checked = +r.value === set.asr; r.addEventListener('change', function () { set.asr = +r.value; put(KEYS, set); draw(); }); });

  // time zones: tz-lookup is only loaded when a new place is chosen
  var tzP = null;
  function tzFor(lat, lon) {
    tzP = tzP || new Promise(function (ok, no) {
      if (window.tzlookup) return ok();
      var s = document.createElement('script'); s.src = box.getAttribute('data-tz'); s.onload = ok; s.onerror = no; document.head.appendChild(s);
    });
    return tzP.then(function () { return window.tzlookup(lat, lon); });
  }
  function label(r) {
    var a = r.address || {}, n = a.city || a.town || a.village || a.municipality || a.hamlet || a.suburb || r.name || '';
    var bits = [n, a.state || a.county, a.country].filter(function (x, i, arr) { return x && arr.indexOf(x) === i; });
    return bits.join(', ') || r.display_name;
  }
  function km(a, b) { var R = Math.PI / 180, x = (b.lon - a.lon) * Math.cos((a.lat + b.lat) / 2 * R), y = b.lat - a.lat; return Math.sqrt(x * x + y * y) * 111.2; }
  function choose(c) {
    pick.hidden = true; pick.innerHTML = ''; say(T.busy);
    tzFor(c.lat, c.lon).then(function (tz) {
      place = { name: c.name, lat: Math.round(c.lat * 1e3) / 1e3, lon: Math.round(c.lon * 1e3) / 1e3, tz: tz };
      example = false; put(KEYP, place); ym = null; say(''); draw();
      out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, function () { say(T.err, true); });
  }
  function search(text) {
    var btn = $('nzcGo'); btn.disabled = true; say(T.busy); pick.hidden = true;
    var u = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=' + L + '&q=' + encodeURIComponent(text);
    fetch(u, { headers: { 'Accept': 'application/json' } }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (a) {
      btn.disabled = false;
      var c = [];
      a.forEach(function (r) {
        var o = { name: label(r), lat: +r.lat, lon: +r.lon };
        if (isNaN(o.lat) || isNaN(o.lon)) return;
        if (c.some(function (x) { return x.name === o.name || km(x, o) < 20; })) return;
        c.push(o);
      });
      if (!c.length) return say(T.none, true);
      if (c.length === 1) return choose(c[0]);
      say(T.pick);
      pick.innerHTML = c.slice(0, 6).map(function (o, i) { return '<button type="button" data-i="' + i + '">' + esc(o.name) + '</button>'; }).join('');
      pick.hidden = false;
      [].forEach.call(pick.querySelectorAll('button'), function (b) { b.addEventListener('click', function () { choose(c[+b.getAttribute('data-i')]); }); });
      pick.querySelector('button').focus();
    }).catch(function () { btn.disabled = false; say(T.err, true); });
  }
  form.addEventListener('submit', function (ev) { ev.preventDefault(); var t = q.value.trim(); if (t.length > 1) search(t); else q.focus(); });
  $('nzcGeo').addEventListener('click', function () {
    if (!navigator.geolocation) return say(T.geoErr, true);
    say(T.busy);
    navigator.geolocation.getCurrentPosition(function (p) {
      var lat = p.coords.latitude, lon = p.coords.longitude;
      // the town name: only rounded coordinates (about 1 km) leave this device
      var u = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&accept-language=' + L + '&lat=' + lat.toFixed(2) + '&lon=' + lon.toFixed(2);
      fetch(u).then(function (r) { return r.json(); }).then(function (r) { choose({ name: label(r), lat: lat, lon: lon }); })
        .catch(function () { choose({ name: T.here, lat: lat, lon: lon }); });
    }, function () { say(T.geoErr, true); }, { timeout: 15000, maximumAge: 6e5 });
  });
  $('nzcForget').addEventListener('click', function () { put(KEYP, null); place = T.ex; example = true; ym = null; q.value = ''; draw(); say(T.forgot); });
  $('nzcPrev').addEventListener('click', function () { step(-1); });
  $('nzcNext').addEventListener('click', function () { step(1); });
  function step(n) { var m = ym.m + n, y = ym.y; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } ym = { y: y, m: m }; draw(); }

  var rows = [], monthName = '';
  var KEYS6 = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight'];
  function offs(tz, y) {
    var a = S.utcOffset(Date.UTC(y, 0, 15), tz), b = S.utcOffset(Date.UTC(y, 6, 15), tz);
    function f(m) { var s = m < 0 ? '−' : '+', h = Math.floor(Math.abs(m) / 60), mm = Math.abs(m) % 60; return 'UTC' + s + h + (mm ? ':' + (mm < 10 ? '0' : '') + mm : ''); }
    return a === b ? f(a) : T.zone2.replace('{a}', f(Math.min(a, b))).replace('{b}', f(Math.max(a, b)));
  }
  function draw() {
    var tz = place.tz, now = S.todayIn(tz);
    if (!ym) ym = { y: now.y, m: now.m };
    var days = S.month(ym.y, ym.m, place, set), M = S.METHODS[set.method];
    // Albanian names are written out: some browsers ship without Albanian date names
    var SQM = ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'], SQD = ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'];
    monthName = L === 'sq' ? SQM[ym.m - 1] + ' ' + ym.y : new Intl.DateTimeFormat(L, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ym.y, ym.m - 1, 5)));
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    var wd = new Intl.DateTimeFormat(L, { weekday: 'short', timeZone: 'UTC' });
    var star = { share: false, summer: false }, polar = false;
    rows = [];
    var body = days.map(function (r) {
      var isToday = r.y === now.y && r.m === now.m && r.d === now.d, cells = [], plain = [];
      if (r.polar) polar = true;
      KEYS6.forEach(function (k) {
        var v = k === 'midnight' ? S.hm(r[k], tz) : S.hm(r[k], tz, r.y, r.m, r.d), mark = r.rule[k];
        if (mark === 'share' || mark === 'summer') star[mark] = true;
        plain.push(v || '—');
        cells.push('<td' + (k === 'sunrise' || k === 'midnight' ? ' class="nz-csub"' : '') + '>' + (v ? esc(v) + (mark === 'share' || mark === 'summer' ? '<sup>*</sup>' : '') : '—') + '</td>');
      });
      var dd = new Date(Date.UTC(r.y, r.m - 1, r.d)), dname = L === 'sq' ? SQD[dd.getUTCDay()] : wd.format(dd);
      dname = dname.charAt(0).toUpperCase() + dname.slice(1).replace(/\.$/, '');
      rows.push([r.y + '-' + (r.m < 10 ? '0' : '') + r.m + '-' + (r.d < 10 ? '0' : '') + r.d].concat(plain));
      return '<tr' + (isToday ? ' class="is-today" aria-current="date"' : '') + '><th scope="row"><span class="nz-cd">' + r.d + '</span> <span class="nz-cw">' + esc(dname) + '</span>' + (isToday ? ' <span class="nz-ctoday">' + esc(T.today) + '</span>' : '') + '</th>' + cells.join('') + '</tr>';
    }).join('');
    $('nzcBody').innerHTML = body;
    $('nzcPlace').textContent = place.name;
    $('nzcEx').hidden = !example;
    $('nzcForget').hidden = example;
    $('nzcMonth').textContent = monthName;
    var info = [];
    info.push('<b>' + esc(T.iPlace) + ':</b> ' + esc(place.name) + ' (' + place.lat.toFixed(2) + ', ' + place.lon.toFixed(2) + ')');
    info.push('<b>' + esc(T.iTime) + ':</b> ' + esc(T.zone.replace('{z}', offs(tz, ym.y))));
    var summerMonth = M.summer && (ym.m === 6 || ym.m === 7);
    info.push('<b>' + esc((T.cols[1] + ', ' + T.cols[6]).replace(/\u00ad/g, '')) + ':</b> ' + esc(summerMonth ? T.mSummer : T['m_' + (set.method === 'mwl' ? 'mwl' : 'm15')]));
    info.push('<b>' + esc(T.cols[4].replace(/\u00ad/g, '')) + ':</b> ' + esc(set.asr === 2 ? T.aHan : T.aStd));
    var notes = [];
    if (star.share) notes.push('<sup>*</sup> ' + esc(T.share.replace('{f}', M.fajr).replace('{i}', M.isha)));
    if (star.summer) notes.push('<sup>*</sup> ' + esc(T.summer));
    if (polar) notes.push('— ' + esc(T.polar));
    $('nzcInfo').innerHTML = '<ul>' + info.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' + notes.map(function (x) { return '<p>' + x + '</p>'; }).join('');
    $('nzcPrintH').textContent = T.printH.replace('{p}', place.name).replace('{m}', monthName);
  }
  function fileName(ext) {
    var p = place.name.split(',')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return T.file + '-' + (p || 'place') + '-' + ym.y + '-' + (ym.m < 10 ? '0' : '') + ym.m + '.' + ext;
  }
  $('nzcCsv').addEventListener('click', function () {
    var sep = L === 'en' ? ',' : ';';
    var cell = function (v) { v = String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var lines = [[T.printH.replace('{p}', place.name).replace('{m}', monthName)], [T.cols[0]].concat(T.cols.slice(1))].concat(rows);
    var txt = '﻿' + lines.map(function (r) { return r.map(cell).join(sep); }).join('\r\n').replace(/\u00ad/g, '') + '\r\n\r\n' + cell($('nzcInfo').innerText.replace(/\s*\n\s*/g, ' | ')) + '\r\n';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = fileName('csv'); document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  });
  $('nzcPrint').addEventListener('click', function () {
    var h = document.documentElement; h.classList.add('nz-pt');
    var off = function () { h.classList.remove('nz-pt'); window.removeEventListener('afterprint', off); };
    window.addEventListener('afterprint', off);
    window.print();
  });
  draw();
})();
