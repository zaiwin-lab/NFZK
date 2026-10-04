/* Language layer: 'bm' (Bahasa Malaysia), 'dual' (BM + English), 'en' (English).
   Learner-facing text is written as pairs [English, BM]. In 'dual' mode BM leads and the
   English sits underneath, so English is always visible while BM makes it understandable. */
window.FMQ = window.FMQ || {};

FMQ.i18n = (function () {
  var E = function (s) { return FMQ.util.esc(s); };
  function lang() {
    try { var p = FMQ.store.get().profile; return p.lang || FMQ.learner.defaultLang || 'dual'; } catch (e) { return 'dual'; }
  }
  function setLang(l) { var s = FMQ.store.get(); s.profile.lang = l; FMQ.store.save(); }

  // Plain text in the current language (dual → BM).
  function x(en, bm) { var l = lang(); return l === 'en' || !bm ? en : bm; }
  // HTML: in dual mode BM first, English underneath.
  function X(en, bm, cls) {
    var l = lang();
    if (l === 'en' || !bm) return E(en);
    if (l === 'bm' || bm === en) return E(bm);
    return E(bm) + '<span class="en2' + (cls ? ' ' + cls : '') + '">' + E(en) + '</span>';
  }
  // Same for a [en, bm] pair or a plain string.
  function P(v) { return Array.isArray(v) ? X(v[0], v[1]) : E(v); }
  function p(v) { return Array.isArray(v) ? x(v[0], v[1]) : v; }

  /* Option text translation (numbers stay as they are). */
  var OPT = {
    'A right angle': 'Sudut tegak', 'Smaller than a right angle': 'Lebih kecil daripada sudut tegak', 'Bigger than a right angle': 'Lebih besar daripada sudut tegak',
    'Parallel': 'Selari', 'Perpendicular': 'Serenjang', 'Neither': 'Bukan kedua-duanya', 'All the same': 'Semua sama',
    'Fewer': 'Berkurang', 'More': 'Bertambah', 'Less': 'Kurang'
  };
  function trOpt(o) {
    if (OPT[o]) return OPT[o];
    var t = trWord(o);
    if (t !== o) return t;
    return o.replace(/^(\d{4}) hours$/, 'jam $1')
      .replace(/(\d+) hours?/g, '$1 jam').replace(/(\d+) minutes?/g, '$1 minit')
      .replace(/^Area = /, 'Luas = ').replace(/ wheels$/, ' roda');
  }

  /* Labels inside charts and tables. */
  var WORD = {
    Monday: 'Isnin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Khamis', Friday: 'Jumaat', Saturday: 'Sabtu', Sunday: 'Ahad',
    Mon: 'Isn', Tue: 'Sel', Wed: 'Rab', Thu: 'Kha', Fri: 'Jum',
    Red: 'Merah', Blue: 'Biru', Green: 'Hijau', Yellow: 'Kuning', red: 'merah', blue: 'biru', yellow: 'kuning',
    Football: 'Bola sepak', Netball: 'Bola jaring', Swimming: 'Renang', Mango: 'Mangga', Banana: 'Pisang',
    Day: 'Hari', Sold: 'Dijual', Drink: 'Minuman', Pupils: 'Murid', Sport: 'Sukan', Fruit: 'Buah',
    mangoes: 'mangga', rambutans: 'rambutan', Start: 'Mula', hours: 'jam'
  };
  function trWord(w) { return WORD[w] || w; }

  return { lang: lang, setLang: setLang, x: x, X: X, P: P, p: p, trOpt: trOpt, trWord: trWord };
})();
FMQ.trWord = function (w) { return FMQ.i18n.trWord(w); };
