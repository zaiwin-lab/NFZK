/* Question generators — core.
   Each template (in js/content/gen-*.js) builds a complete question from a seed: text,
   options, hints, worked steps and error-tagged distractors, in English AND Bahasa Malaysia.
   The id carries the seed ("g~template~seed"), so any question can be rebuilt from history.

   Inside a template, any learner-facing string may be either:
     'English only'            or
     ['English', 'Bahasa Malaysia']
   build() splits them into parallel fields: hints / hintsBm, show / showBm, check / checkBm,
   wrong[option] = [category, English, BM], why.q / why.qBm, why.options / why.optionsBm. */
window.FMQ = window.FMQ || {};

FMQ.gen = (function () {
  var templates = [], byId = {}, cache = {};

  /* ── seeded randomness ── */
  function rng(seed) {
    var s = seed >>> 0;
    function next() {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    var R = {
      next: next,
      int: function (a, b) { return a + Math.floor(next() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      shuffle: function (arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
      chance: function (p) { return next() < p; },
      mult: function (a, b, m) { return m * R.int(Math.ceil(a / m), Math.floor(b / m)); }
    };
    return R;
  }

  /* ── formatting (Malaysian textbook style) ── */
  function num(n) { return n < 1000 ? String(n) : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function rm(sen) { return 'RM' + (sen / 100).toFixed(2); }
  function d1(tenths) { return (tenths / 10).toFixed(1); }
  function d2(hundredths) { return (hundredths / 100).toFixed(2); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function wrap(min) { return ((min % 1440) + 1440) % 1440; }
  function t24(min) { min = wrap(min); return pad(Math.floor(min / 60)) + pad(min % 60) + ' hours'; }
  function t24b(min) { min = wrap(min); return 'jam ' + pad(Math.floor(min / 60)) + pad(min % 60); }
  function hhmm(min) { min = wrap(min); return pad(Math.floor(min / 60)) + pad(min % 60); }
  function t12(min) {
    min = wrap(min);
    var h = Math.floor(min / 60), m = min % 60;
    return ((h % 12) || 12) + ':' + pad(m) + ' ' + (h < 12 ? 'a.m.' : 'p.m.');
  }
  function clock(min) { min = wrap(min); var h = Math.floor(min / 60) % 12 || 12; return h + ':' + pad(min % 60); }
  function dur(min) {
    var h = Math.floor(min / 60), m = min % 60, p = [];
    if (h) p.push(h + ' hour' + (h > 1 ? 's' : ''));
    if (m || !h) p.push(m + ' minute' + (m !== 1 ? 's' : ''));
    return p.join(' ');
  }
  function durBm(min) {
    var h = Math.floor(min / 60), m = min % 60, p = [];
    if (h) p.push(h + ' jam'); if (m || !h) p.push(m + ' minit');
    return p.join(' ');
  }
  function colAbs(a, b) { var s = 0, p = 1; while (a || b) { s += Math.abs(a % 10 - b % 10) * p; a = Math.floor(a / 10); b = Math.floor(b / 10); p *= 10; } return s; }
  function pt(x, y) { return '(' + x + ', ' + y + ')'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var NAMES = ['Aina', 'Hakim', 'Mei Ling', 'Ravi', 'Siti', 'Danial', 'Farah', 'Amir', 'Aisyah', 'Kumar', 'Jia Hui', 'Nurul', 'Arif', 'Priya', 'Zara', 'Haziq', 'Wei Jie', 'Alya'];

  // Word Bridge words found in the text (common tiny words only when the template asks).
  var SKIP = { 'of': 1, 'than': 1, 'each': 1, 'value': 1, 'digit': 1 };
  function autoVocab(text, extra) {
    var found = [];
    Object.keys(FMQ.vocab).forEach(function (w) {
      if (SKIP[w] && (extra || []).indexOf(w) < 0) return;
      var re = new RegExp('(^|[^A-Za-z])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])', 'i');
      if (re.test(text)) found.push(w);
    });
    found.sort(function (a, b) { return b.length - a.length; });
    var out = [];
    found.forEach(function (w) { if (!out.some(function (o) { return o.indexOf(w) >= 0; })) out.push(w); });
    return out.slice(0, 3);
  }

  function T(def) { templates.push(def); byId[def.id] = def; }

  function tidy(t) { return typeof t === 'string' ? t.replace(/\.\./g, '.') : t; }
  function en(v) { return tidy(Array.isArray(v) ? v[0] : v); }
  function bm(v) { return Array.isArray(v) ? tidy(v[1]) : null; }

  function build(tplId, seed) {
    var key = tplId + '~' + seed;
    if (cache[key]) return cache[key];
    var tpl = byId[tplId];
    if (!tpl) return null;
    var R = rng(seed * 7919 + tplId.length * 104729);
    var o = tpl.make(R);
    var fmt = o.fmt || String;
    var f = function (v) { return typeof v === 'number' ? fmt(v) : v; };
    var ans = f(o.answer), opts = [ans], wrong = {};
    (o.wrong || []).forEach(function (w) {
      if (w[0] == null || opts.length >= (o.count || 4)) return;
      if (typeof w[0] === 'number' && (w[0] < 0 || !isFinite(w[0]))) return;
      var s = f(w[0]);
      if (opts.indexOf(s) >= 0) return;
      opts.push(s); wrong[s] = [w[1], en(w[2]), bm(w[2])];
    });
    var k = 1;
    while (opts.length < (o.count || 4) && k < 60 && typeof o.answer === 'number') {
      var step = o.step || 1, cand = o.answer + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * step;
      k++;
      if (cand < (o.min || 0)) continue;
      var s2 = fmt(cand);
      if (opts.indexOf(s2) < 0) opts.push(s2);
    }
    if (o.order) opts.sort(function (a, b) { return o.order.indexOf(a) - o.order.indexOf(b); });
    else if (!o.keepOrder) opts = R.shuffle(opts);
    var why = o.why ? { q: en(o.why.q), qBm: bm(o.why.q), options: o.why.options.map(en), optionsBm: o.why.options.map(bm), answer: o.why.answer } : undefined;
    var q = {
      id: 'g~' + tplId + '~' + seed, gen: tplId, skill: tpl.skill, level: tpl.level, related: tpl.related,
      text: tidy(o.text), bm: tidy(o.bm), simple: tidy(o.simple), visual: o.visual, options: opts, answer: ans,
      optionsBm: o.optionsBm, vocab: o.vocab || autoVocab(o.text, o.keepWords),
      hints: o.hints.map(en), hintsBm: o.hints.map(bm), show: o.show.map(en), showBm: o.show.map(bm),
      wrong: wrong, check: o.check ? en(o.check) : undefined, checkBm: o.check ? bm(o.check) : undefined, why: why
    };
    cache[key] = q;
    return q;
  }

  function fromId(id) { var p = id.split('~'); return build(p[1], Number(p[2])); }
  function templatesFor(skill) { return templates.filter(function (t) { return t.skill === skill; }); }
  function instance(tplId, seed) { return build(tplId, seed == null ? Math.floor(Math.random() * 1e9) : seed); }

  return {
    T: T, templates: templates, byId: byId, templatesFor: templatesFor, build: build, fromId: fromId, instance: instance, rng: rng,
    h: { num: num, rm: rm, d1: d1, d2: d2, pad: pad, t24: t24, t24b: t24b, hhmm: hhmm, t12: t12, clock: clock, dur: dur, durBm: durBm, colAbs: colAbs, pt: pt, cap: cap, NAMES: NAMES },
    fmt: { num: num, rm: rm, t24: t24, t12: t12, dur: dur }
  };
})();

// Unified lookup: hand-written questions first, then generated ones.
(function () {
  var staticLookup = FMQ.question;
  FMQ.question = function (id) {
    if (id && id.indexOf('g~') === 0) return FMQ.gen.fromId(id);
    return staticLookup(id);
  };
})();
