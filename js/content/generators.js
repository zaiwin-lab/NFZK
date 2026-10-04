/* Question generators — fresh practice for months, not days.
   Each template builds a complete question (text, options, hints, worked steps, Bahasa
   support, error-tagged distractors) from a seed. The question id carries the seed
   ("g~template~seed"), so any question can be rebuilt exactly from the history.
   Difficulty grows through reasoning and context, not only bigger numbers. */
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
  function t24(min) { min = ((min % 1440) + 1440) % 1440; return pad(Math.floor(min / 60)) + pad(min % 60) + ' hours'; }
  function t12(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return ((h % 12) || 12) + ':' + pad(m) + ' ' + (h < 12 ? 'a.m.' : 'p.m.');
  }
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

  var NAMES = ['Aina', 'Hakim', 'Mei Ling', 'Ravi', 'Siti', 'Danial', 'Farah', 'Amir', 'Aisyah', 'Kumar', 'Jia Hui', 'Nurul', 'Arif', 'Priya', 'Zara', 'Haziq', 'Wei Jie', 'Alya'];

  // Word Bridge words found in the text (common tiny words only when the template asks).
  var SKIP = { 'of': 1, 'than': 1, 'each': 1, 'value': 1, 'digit': 1, 'left': 0 };
  function autoVocab(text, extra) {
    var found = [];
    Object.keys(FMQ.vocab).forEach(function (w) {
      if (SKIP[w] && (extra || []).indexOf(w) < 0) return;
      var re = new RegExp('(^|[^A-Za-z])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])', 'i');
      if (re.test(text)) found.push(w);
    });
    // Prefer longer phrases; drop words contained in a chosen phrase.
    found.sort(function (a, b) { return b.length - a.length; });
    var out = [];
    found.forEach(function (w) { if (!out.some(function (o) { return o.indexOf(w) >= 0; })) out.push(w); });
    return out.slice(0, 3);
  }

  function T(def) { templates.push(def); byId[def.id] = def; }

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
      opts.push(s); wrong[s] = [w[1], w[2]];
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
    var tidy = function (t) { return typeof t === 'string' ? t.replace(/\.\./g, '.') : t; };
    ['text', 'bm', 'simple'].forEach(function (k) { o[k] = tidy(o[k]); });
    o.hints = o.hints.map(tidy); o.show = o.show.map(tidy);
    var q = {
      id: 'g~' + tplId + '~' + seed, gen: tplId, skill: tpl.skill, level: tpl.level, related: tpl.related,
      text: o.text, visual: o.visual, options: opts, answer: ans,
      vocab: o.vocab || autoVocab(o.text, o.keepWords),
      hints: o.hints, show: o.show, bm: o.bm, simple: o.simple, wrong: wrong, check: o.check, why: o.why
    };
    cache[key] = q;
    return q;
  }

  function fromId(id) {
    var p = id.split('~');
    return build(p[1], Number(p[2]));
  }

  /* ══════════ PLACE VALUE ══════════ */
  var PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
  T({ id: 'pv-value', skill: 'place-value', level: 1, make: function (R) {
    var n, pos, d, s;
    do {
      n = R.int(1000, 99999); s = String(n);
      pos = R.int(1, s.length - 1); d = Math.floor(n / Math.pow(10, pos)) % 10;
    } while (d === 0 || s.split(String(d)).length !== 2);
    var v = d * Math.pow(10, pos);
    return { text: 'In ' + num(n) + ', what is the value of the digit ' + d + '?', answer: v, fmt: num,
      vocab: ['value', 'digit'],
      wrong: [[d, 'CONCEPT', 'The digit is ' + d + ', but its place makes it worth more. Which place is it in?'],
        [d * Math.pow(10, pos - 1), 'CONCEPT', 'Count the places again from the right.'],
        [d * Math.pow(10, pos + 1), 'CONCEPT', 'Count the places again from the right: ones, tens, hundreds…']],
      hints: ['Which place is the ' + d + ' in?', 'Count the places from the right: ones, tens, hundreds, thousands…', 'The ' + d + ' is in the ' + PLACES[pos] + ' place. What is ' + d + ' ' + PLACES[pos] + '?'],
      show: ['In ' + num(n) + ', the ' + d + ' is in the ' + PLACES[pos] + ' place.', d + ' ' + PLACES[pos] + ' = ' + num(v) + '.'],
      bm: 'Dalam nombor ' + num(n) + ', apakah nilai digit ' + d + '?', simple: 'Look at ' + num(n) + '. How much is the ' + d + ' worth?' };
  } });

  T({ id: 'pv-round', skill: 'place-value', level: 2, make: function (R) {
    var to = R.pick([10, 100, 1000]), word = { 10: 'ten', 100: 'hundred', 1000: 'thousand' }[to];
    var n; do { n = R.int(1000, 9999); } while (n % to === 0);
    var lo = Math.floor(n / to) * to, hi = lo + to, nd = Math.floor((n % to) / (to / 10));
    var ans = nd >= 5 ? hi : lo, other = ans === hi ? lo : hi;
    var to2 = to === 1000 ? 100 : to * 10, alt = Math.round(n / to2) * to2;
    return { text: 'Round ' + num(n) + ' to the nearest ' + word + '.', answer: ans, fmt: num, step: to,
      wrong: [[other, 'CONCEPT', 'Look at the digit just right of the ' + word + 's place. Is it 5 or more?'], [alt, 'UNDERSTAND', 'Check which place we round to: the nearest ' + word + '.'], [n, 'UNDERSTAND', 'Rounding changes the number to the nearest ' + word + '.']],
      hints: ['Which two ' + word + 's is ' + num(n) + ' between?', 'Look at the digit just to the right of the ' + word + 's place.', 'That digit is ' + nd + '. 5 or more rounds up; less than 5 rounds down.'],
      show: [num(n) + ' is between ' + num(lo) + ' and ' + num(hi) + '.', 'The next digit is ' + nd + ', so we round ' + (ans === hi ? 'up' : 'down') + '.', num(n) + ' rounds to ' + num(ans) + '.'],
      bm: 'Bundarkan ' + num(n) + ' kepada ' + { 10: 'puluh', 100: 'ratus', 1000: 'ribu' }[to] + ' yang terdekat.', simple: 'Which ' + word + ' is ' + num(n) + ' closest to?' };
  } });

  T({ id: 'pv-more', skill: 'place-value', level: 2, make: function (R) {
    var n = R.int(10000, 89999), k = R.pick([10, 100, 1000, 10000]), more = R.chance(0.6);
    var ans = more ? n + k : n - k, sign = more ? 1 : -1;
    return { text: 'Which number is ' + num(k) + (more ? ' more than ' : ' less than ') + num(n) + '?', answer: ans, fmt: num, count: 4,
      wrong: [[n + sign * k * 10, 'CONCEPT', 'You changed the wrong place. Which place does ' + num(k) + ' change?'],
        [k >= 100 ? n + sign * k / 10 : n + sign * 1000, 'CONCEPT', 'Only the place of ' + num(k) + ' should change.'],
        [n - sign * k, 'UNDERSTAND', more ? '“More than” makes the number bigger.' : '“Less than” makes the number smaller.']],
      hints: ['Which place does ' + num(k) + ' change?', 'Only one digit should change' + (more ? ' (unless it goes past 9).' : '.'), (more ? 'Add ' : 'Take away ') + num(k) + ' from ' + num(n) + ' in that place.'],
      show: [num(n) + (more ? ' + ' : ' − ') + num(k) + ' = ' + num(ans) + '.'],
      bm: 'Nombor manakah ' + num(k) + (more ? ' lebih daripada ' : ' kurang daripada ') + num(n) + '?', simple: 'Start at ' + num(n) + '. ' + (more ? 'Add ' : 'Take away ') + num(k) + '. Which number do you get?' };
  } });

  T({ id: 'pv-order', skill: 'place-value', level: 1, make: function (R) {
    var digits, set = {};
    do { digits = [R.int(1, 9), R.int(0, 9), R.int(0, 9), R.int(0, 9)]; } while (new Set(digits).size < 4);
    var nums = [];
    while (nums.length < 4) {
      var p = R.shuffle(digits); if (p[0] === 0) continue;
      var v = Number(p.join('')); if (!set[v]) { set[v] = 1; nums.push(v); }
    }
    var big = R.chance(0.5), ans = big ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
    var w = nums.filter(function (x) { return x !== ans; }).map(function (x) { return [x, 'CONCEPT', 'Compare the thousands digits first, then the hundreds.']; });
    return { text: 'Which is the ' + (big ? 'largest' : 'smallest') + ' number?', answer: ans, fmt: num, wrong: w,
      hints: ['All the numbers have 4 digits. Which place do we compare first?', 'Compare the thousands digits.', 'If the thousands are the same, compare the hundreds.'],
      show: ['Compare from the left: thousands, then hundreds, then tens.', 'The ' + (big ? 'largest' : 'smallest') + ' is ' + num(ans) + '.'],
      bm: 'Nombor manakah yang paling ' + (big ? 'besar' : 'kecil') + '?', simple: 'Which number is the ' + (big ? 'biggest' : 'smallest') + '?' };
  } });

  /* ══════════ ADDING & SUBTRACTING ══════════ */
  function colAbs(a, b) { var s = 0, p = 1; while (a || b) { s += Math.abs(a % 10 - b % 10) * p; a = Math.floor(a / 10); b = Math.floor(b / 10); p *= 10; } return s; }

  T({ id: 'as-add', skill: 'add-sub', level: 1, make: function (R) {
    var a, b; do { a = R.int(120, 699); b = R.int(110, 299); } while ((a % 10) + (b % 10) < 10);
    return { text: 'What is ' + a + ' + ' + b + '?', answer: a + b, step: 10,
      wrong: [[a + b - 10, 'EXECUTE', 'Check the carry from the ones column.'], [a + b + 100, 'EXECUTE', 'Check the hundreds column.'], [Math.abs(a - b), 'PLAN', 'This is an add question. Look at the sign.']],
      hints: ['Add the ones first.', (a % 10) + ' + ' + (b % 10) + ' is more than 9. What do we do with the extra ten?', 'Carry 1 ten into the tens column, then add the tens and the hundreds.'],
      show: ['Ones: ' + (a % 10) + ' + ' + (b % 10) + ' = ' + ((a % 10) + (b % 10)) + ' → carry 1 ten.', 'Then add the tens and hundreds.', a + ' + ' + b + ' = ' + (a + b) + '.'],
      bm: 'Berapakah ' + a + ' + ' + b + '?', simple: 'Add ' + a + ' and ' + b + '.', check: 'Check: ' + (a + b) + ' − ' + b + ' = ' + a + ' ✓' };
  } });

  T({ id: 'as-sub', skill: 'add-sub', level: 1, make: function (R) {
    var a, b; do { a = R.int(300, 950); b = R.int(105, a - 60); } while ((a % 10) >= (b % 10));
    return { text: 'What is ' + a + ' − ' + b + '?', answer: a - b, step: 10,
      wrong: [[colAbs(a, b), 'EXECUTE', 'In each column, if the top digit is smaller, regroup first.'], [a + b, 'PLAN', 'This is a subtract question. Look at the sign.'], [a - b + 10, 'EXECUTE', 'Check the tens after regrouping.']],
      hints: ['Start with the ones column.', (a % 10) + ' is smaller than ' + (b % 10) + '. We need to regroup a ten.', 'Change 1 ten into 10 ones, then subtract each column.'],
      show: ['Regroup 1 ten into 10 ones.', 'Subtract the ones, tens and hundreds.', a + ' − ' + b + ' = ' + (a - b) + '.'],
      bm: 'Berapakah ' + a + ' − ' + b + '?', simple: 'Take ' + b + ' away from ' + a + '.', check: 'Check: ' + (a - b) + ' + ' + b + ' = ' + a + ' ✓' };
  } });

  T({ id: 'as-diff', skill: 'add-sub', level: 2, make: function (R) {
    var a = R.int(60, 480), b = R.int(15, a - 12), flip = R.chance(0.4);
    var x = flip ? b : a, y = flip ? a : b;
    return { text: 'What is the difference between ' + x + ' and ' + y + '?', answer: a - b, step: 10,
      wrong: [[a + b, 'UNDERSTAND', 'You added. “Difference” compares the two numbers.'], [a - b + 10, 'EXECUTE', 'Check the subtraction again.'], [a - b - 10, 'EXECUTE', 'Check the tens column.']],
      hints: ['What does “difference” ask us to do with two numbers?', 'To compare two numbers, take the smaller from the bigger.', 'Work out ' + a + ' − ' + b + '.'],
      show: ['Difference = bigger number − smaller number.', a + ' − ' + b + ' = ' + (a - b) + '.'],
      bm: 'Apakah perbezaan antara ' + x + ' dan ' + y + '?', simple: 'How far apart are ' + x + ' and ' + y + '?', check: 'Check: ' + b + ' + ' + (a - b) + ' = ' + a + ' ✓' };
  } });

  var LEFT_SCENES = [
    { en: function (n, a, b) { return n + ' has ' + a + ' stickers.\n' + n + ' gives away ' + b + ' stickers.\nHow many stickers are left?'; }, bm: function (n, a, b) { return n + ' ada ' + a + ' pelekat. ' + n + ' memberi ' + b + ' pelekat. Berapakah baki pelekat?'; }, s: 'stickers' },
    { en: function (n, a, b) { return 'A bakery made ' + a + ' kuih.\n' + b + ' kuih were sold.\nHow many kuih are remaining?'; }, bm: function (n, a, b) { return 'Sebuah kedai membuat ' + a + ' biji kuih. ' + b + ' biji telah dijual. Berapakah baki kuih?'; }, s: 'kuih' },
    { en: function (n, a, b) { return 'A storybook has ' + a + ' pages.\n' + n + ' has read ' + b + ' pages.\nHow many pages are left to read?'; }, bm: function (n, a, b) { return 'Sebuah buku cerita ada ' + a + ' halaman. ' + n + ' sudah membaca ' + b + ' halaman. Berapa halaman lagi yang tinggal?'; }, s: 'pages' },
    { en: function (n, a, b) { return 'There are ' + a + ' chairs in the school hall.\n' + b + ' chairs are taken away.\nHow many chairs are remaining?'; }, bm: function (n, a, b) { return 'Ada ' + a + ' buah kerusi di dewan sekolah. ' + b + ' buah kerusi dibawa keluar. Berapakah baki kerusi?'; }, s: 'chairs' }
  ];
  T({ id: 'as-left', skill: 'add-sub', level: 3, make: function (R) {
    var sc = R.pick(LEFT_SCENES), n = R.pick(NAMES), a = R.int(150, 900), b = R.int(45, a - 30);
    return { text: sc.en(n, a, b), answer: a - b, step: 10,
      wrong: [[a + b, 'UNDERSTAND', 'You added. Some were taken away, so there are fewer now.'], [a - b + 10, 'EXECUTE', 'Check the regrouping.'], [colAbs(a, b), 'EXECUTE', 'Regroup when the top digit is smaller.']],
      hints: ['Will there be more ' + sc.s + ' or fewer at the end?', 'Fewer means subtract.', 'Write ' + a + ' and put ' + b + ' underneath. Start with the ones.'],
      show: ['Some are taken away, so subtract.', a + ' − ' + b + ' = ' + (a - b) + '.'],
      bm: sc.bm(n, a, b), simple: 'Start with ' + a + '. Take away ' + b + '. How many are still there?', check: 'Check: ' + (a - b) + ' + ' + b + ' = ' + a + ' ✓' };
  } });

  T({ id: 'as-together', skill: 'add-sub', level: 2, make: function (R) {
    var sc = R.pick([
      ['Class 4 Bestari has A pupils.\nClass 4 Cemerlang has B pupils.\nHow many pupils are there altogether?', 'Kelas 4 Bestari ada A murid. Kelas 4 Cemerlang ada B murid. Berapakah jumlah keseluruhan murid?'],
      ['A stall sold A durians on Saturday.\nIt sold B durians on Sunday.\nWhat is the total number of durians sold?', 'Sebuah gerai menjual A biji durian pada hari Sabtu dan B biji pada hari Ahad. Berapakah jumlah durian yang dijual?'],
      ['N collected A bottles for recycling.\nN’s brother collected B bottles.\nHow many bottles did they collect altogether?', 'N mengumpul A botol untuk dikitar semula. Abangnya mengumpul B botol. Berapakah jumlah keseluruhan botol?']
    ]);
    var n = R.pick(NAMES), a = R.int(36, 480), b = R.int(27, 390);
    function fill(s) { return s.replace(/\bA\b/g, a).replace(/\bB\b/g, b).replace(/\bN\b/g, n); }
    return { text: fill(sc[0]), answer: a + b, step: 10,
      wrong: [[Math.abs(a - b), 'UNDERSTAND', 'You found the difference. This question joins the groups.'], [a + b - 10, 'EXECUTE', 'Check the carry.'], [a + b + 10, 'EXECUTE', 'Check the tens column.']],
      hints: ['Are we joining the groups or comparing them?', '“Altogether” and “total” join amounts. Which operation?', 'Add ' + a + ' and ' + b + '. Start with the ones.'],
      show: ['Joining groups means add.', a + ' + ' + b + ' = ' + (a + b) + '.'], bm: fill(sc[1]), simple: 'Put ' + a + ' and ' + b + ' together. How many?' };
  } });

  T({ id: 'as-compare', skill: 'add-sub', level: 3, make: function (R) {
    var n1 = R.pick(NAMES), n2; do { n2 = R.pick(NAMES); } while (n2 === n1);
    var a = R.int(80, 400), b = R.int(25, a - 15), more = R.chance(0.55), thing = R.pick(['marbles', 'stamps', 'points', 'beads']);
    var text = n1 + ' has ' + a + ' ' + thing + '.\n' + n2 + ' has ' + b + ' ' + thing + '.\n' + (more ? 'How many more ' + thing + ' does ' + n1 + ' have?' : 'How many fewer ' + thing + ' does ' + n2 + ' have?');
    return { text: text, answer: a - b, step: 10,
      wrong: [[a + b, 'UNDERSTAND', 'You found the total. The question compares the two amounts.'], [a - b + 10, 'EXECUTE', 'Check the subtraction.'], [b, 'UNDERSTAND', 'That is how many ' + n2 + ' has. We need the difference.']],
      hints: ['Are we finding a total or comparing?', '“How many ' + (more ? 'more' : 'fewer') + '” compares two amounts: subtract.', 'Work out ' + a + ' − ' + b + '.'],
      show: ['Comparing means find the difference.', a + ' − ' + b + ' = ' + (a - b) + '.'],
      bm: n1 + ' ada ' + a + ' ' + { marbles: 'guli', stamps: 'setem', points: 'mata', beads: 'manik' }[thing] + '. ' + n2 + ' ada ' + b + '. ' + (more ? 'Berapa banyak lagi yang ' + n1 + ' ada?' : 'Berapa kurang yang ' + n2 + ' ada?'),
      simple: n1 + ': ' + a + '. ' + n2 + ': ' + b + '. How big is the gap between them?', check: 'Check: ' + b + ' + ' + (a - b) + ' = ' + a + ' ✓' };
  } });

  T({ id: 'as-start', skill: 'add-sub', level: 3, make: function (R) {
    var n = R.pick(NAMES), b = R.int(15, 90), c = R.int(b + 40, 400), a = c - b;
    return { text: n + ' had some marbles.\n' + n + ' won ' + b + ' more marbles.\nNow ' + n + ' has ' + c + ' marbles.\nHow many marbles did ' + n + ' have at first?', answer: a, step: 10,
      wrong: [[c + b, 'PLAN', 'Winning made the number bigger. To go back to the start, undo it.'], [b, 'UNDERSTAND', 'That is how many were won.'], [a + 10, 'EXECUTE', 'Check the subtraction.']],
      hints: ['What happened to the marbles: did the number go up or down?', 'We know the end. To find the start, undo the change.', 'Undo “won ' + b + '” by taking away ' + b + ' from ' + c + '.'],
      show: ['The number went up by ' + b + '.', 'Go back: ' + c + ' − ' + b + ' = ' + a + '.'],
      bm: n + ' ada beberapa biji guli. ' + n + ' menang ' + b + ' biji lagi. Sekarang ' + n + ' ada ' + c + ' biji. Berapakah guli ' + n + ' pada mulanya?',
      simple: n + ' got ' + b + ' new marbles. Now there are ' + c + '. How many were there before?', check: 'Check: ' + a + ' + ' + b + ' = ' + c + ' ✓' };
  } });

  /* ══════════ TIMES & SHARING ══════════ */
  T({ id: 'td-fact', skill: 'times-divide', level: 1, make: function (R) {
    var a = R.int(3, 9), b = R.int(3, 9);
    return { text: 'What is ' + a + ' × ' + b + '?', answer: a * b, step: a,
      wrong: [[a * (b + 1), 'EXECUTE', 'That is ' + a + ' × ' + (b + 1) + '. One group too many.'], [a * (b - 1), 'EXECUTE', 'That is ' + a + ' × ' + (b - 1) + '. One group too few.'], [a + b, 'PLAN', 'You added. × means groups of.']],
      hints: [a + ' × ' + b + ' means ' + a + ' groups of ' + b + '.', 'Do you know ' + a + ' × ' + (b - 1) + '? Add one more ' + a + '.', a + ' × ' + (b - 1) + ' = ' + a * (b - 1) + '. Now add ' + a + '.'],
      show: [a + ' × ' + (b - 1) + ' = ' + a * (b - 1) + '.', a * (b - 1) + ' + ' + a + ' = ' + a * b + '.'],
      bm: 'Berapakah ' + a + ' × ' + b + '?', simple: 'What is ' + a + ' groups of ' + b + '?' };
  } });

  var SHARE = [['sweets', 'children', 'gula-gula', 'kanak-kanak'], ['stickers', 'friends', 'pelekat', 'kawan'], ['rambutans', 'baskets', 'rambutan', 'bakul'], ['pencils', 'pupils', 'pensel', 'murid']];
  T({ id: 'td-share', skill: 'times-divide', level: 2, make: function (R) {
    var s = R.pick(SHARE), g = R.int(3, 9), each = R.int(3, 12), total = g * each;
    var verb = s[1] === 'baskets' ? 'put equally into' : 'shared equally among';
    var one = { children: 'child', friends: 'friend', baskets: 'basket', pupils: 'pupil' }[s[1]];
    return { text: 'There are ' + total + ' ' + s[0] + '.\nThey are ' + verb + ' ' + g + ' ' + s[1] + '.\nHow many ' + s[0] + (s[1] === 'baskets' ? ' are in each basket?' : ' does each ' + one + ' get?'),
      answer: each, keepWords: ['each'],
      wrong: [[total - g, 'PLAN', 'You subtracted. Sharing equally uses division.'], [each + 1, 'EXECUTE', 'Check: ' + g + ' × ' + (each + 1) + ' = ' + g * (each + 1) + ', not ' + total + '.'], [each - 1, 'EXECUTE', 'Check: ' + g + ' × ' + (each - 1) + ' = ' + g * (each - 1) + '.']],
      hints: ['Are the ' + s[0] + ' joined or shared?', 'Sharing equally into groups uses division.', 'Find ' + total + ' ÷ ' + g + '. Which number times ' + g + ' makes ' + total + '?'],
      show: [total + ' ÷ ' + g + ' = ' + each + ', because ' + g + ' × ' + each + ' = ' + total + '.'],
      bm: 'Ada ' + total + ' ' + s[2] + '. Semuanya dikongsi sama rata kepada ' + g + ' ' + s[3] + '. Berapakah yang setiap satu dapat?', simple: total + ' ' + s[0] + ' go to ' + g + ' ' + s[1] + ', the same number each. How many for one?',
      check: 'Check: ' + g + ' × ' + each + ' = ' + total + ' ✓' };
  } });

  T({ id: 'td-groups', skill: 'times-divide', level: 3, make: function (R) {
    var item = R.pick(['pencils', 'crayons', 'buttons', 'cookies']), each = R.int(12, 48), n = R.int(3, 9), p = each * n;
    return { text: 'A box holds ' + each + ' ' + item + '.\nHow many ' + item + ' are in ' + n + ' boxes?', answer: p, step: 10,
      wrong: [[each + n, 'PLAN', 'You added. There are ' + n + ' equal groups of ' + each + '.'], [Math.floor(each / 10) * 10 * n, 'EXECUTE', 'Don’t forget to multiply the ones too.'], [p + 10, 'EXECUTE', 'Check the ones: ' + (each % 10) + ' × ' + n + '.']],
      hints: ['Each box has the same number. How many boxes?', 'Equal groups put together: multiply.', each + ' × ' + n + ': do ' + Math.floor(each / 10) * 10 + ' × ' + n + ' and ' + (each % 10) + ' × ' + n + ', then add.'],
      show: [each + ' × ' + n + ' = ' + Math.floor(each / 10) * 10 * n + ' + ' + (each % 10) * n + ' = ' + p + '.'],
      bm: 'Sebuah kotak memuatkan ' + each + ' ' + { pencils: 'batang pensel', crayons: 'batang krayon', buttons: 'biji butang', cookies: 'keping biskut' }[item] + '. Berapakah jumlahnya dalam ' + n + ' kotak?', simple: 'One box: ' + each + '. ' + n + ' boxes: how many?' };
  } });

  T({ id: 'td-div', skill: 'times-divide', level: 2, make: function (R) {
    var d = R.int(2, 9), q = R.int(12, Math.floor(999 / d)), t = d * q;
    return { text: 'What is ' + num(t) + ' ÷ ' + d + '?', answer: q,
      wrong: [[q + 1, 'EXECUTE', 'Check: ' + (q + 1) + ' × ' + d + ' = ' + (q + 1) * d + '.'], [t - d, 'PLAN', 'You subtracted ' + d + '. ÷ means share into equal groups.'], [q - 10, 'EXECUTE', 'Check the tens.']],
      hints: ['How many groups of ' + d + ' are in ' + num(t) + '?', 'Split ' + num(t) + ' into parts that are easy to divide by ' + d + '.', 'Divide the hundreds first, then the tens, then the ones.'],
      show: [num(t) + ' ÷ ' + d + ' = ' + q + '.', 'Check with times: ' + q + ' × ' + d + ' = ' + num(t) + '.'],
      bm: 'Berapakah ' + num(t) + ' ÷ ' + d + '?', simple: 'Share ' + num(t) + ' into ' + d + ' equal groups. How many in one group?', check: 'Check: ' + q + ' × ' + d + ' = ' + num(t) + ' ✓' };
  } });

  T({ id: 'td-needed', skill: 'times-divide', level: 3, make: function (R) {
    var c = R.int(4, 9), p; do { p = R.int(20, 70); } while (p % c === 0);
    var fl = Math.floor(p / c), ans = fl + 1;
    return { text: p + ' pupils are going on a school trip.\nEach van can carry ' + c + ' pupils.\nHow many vans are needed?', answer: ans, keepWords: ['each'],
      wrong: [[fl, 'CHECK', 'After ' + fl + ' vans, some pupils are still waiting. They need a van too!'], [p - c, 'PLAN', 'You subtracted. Think about groups of ' + c + '.'], [fl + 2, 'EXECUTE', 'Check how many pupils fit in the vans.']],
      hints: ['How many pupils fit in one van?', 'Find how many groups of ' + c + ' make ' + p + '. Are any pupils left over?', p + ' ÷ ' + c + ' = ' + fl + ' remainder ' + (p - fl * c) + '. What happens to the pupils left over?'],
      show: [p + ' ÷ ' + c + ' = ' + fl + ' remainder ' + (p - fl * c) + '.', 'The ' + (p - fl * c) + ' pupils left over need one more van.', fl + ' + 1 = ' + ans + ' vans.'],
      bm: p + ' orang murid pergi lawatan sekolah. Setiap van boleh membawa ' + c + ' orang murid. Berapakah van yang diperlukan?', simple: p + ' pupils. One van takes ' + c + '. Every pupil needs a seat. How many vans?',
      why: { q: 'Why is the answer not ' + fl + '?', options: ['Some pupils would be left with no van', 'Because ' + fl + ' is too small a number', 'Vans always come in even numbers'], answer: 0 } };
  } });

  /* ══════════ DECIMALS ══════════ */
  T({ id: 'dec-sub1', skill: 'decimals', level: 1, make: function (R) {
    var a = R.int(25, 99), b = R.int(11, a - 6);
    return { text: 'What is ' + d1(a) + ' − ' + d1(b) + '?', answer: a - b, fmt: d1,
      wrong: [[a + b, 'PLAN', 'You added. Look at the sign.'], [a - b + 10, 'EXECUTE', 'Check the ones.'], [colAbs(a, b) !== a - b ? colAbs(a, b) : a - b - 1, 'EXECUTE', 'Regroup when the top digit is smaller.']],
      hints: ['Line up the decimal points first.', 'Subtract the tenths, then the ones.', 'Tenths: ' + (a % 10) + ' − ' + (b % 10) + (a % 10 < b % 10 ? ' needs regrouping.' : '.')],
      show: ['Line up the points: ' + d1(a) + ' − ' + d1(b) + '.', 'Answer: ' + d1(a - b) + '.'],
      bm: 'Berapakah ' + d1(a) + ' − ' + d1(b) + '?', simple: 'Take ' + d1(b) + ' away from ' + d1(a) + '.', check: 'Check: ' + d1(a - b) + ' + ' + d1(b) + ' = ' + d1(a) + ' ✓' };
  } });

  T({ id: 'dec-sub2', skill: 'decimals', level: 2, make: function (R) {
    var a = R.int(35, 99), A = a * 10, B; do { B = R.int(105, A - 40); } while (B % 10 === 0);
    var ans = A - B;
    return { text: 'What is ' + d1(a) + ' − ' + d2(B) + '?', answer: ans, fmt: d2,
      wrong: [[colAbs(A, B), 'EXECUTE', 'In each column, if the top digit is smaller, regroup first.'], [ans + 10, 'EXECUTE', 'Check the tenths after regrouping.'], [ans + 100, 'EXECUTE', 'Check the ones after regrouping.']],
      hints: ['How many decimal places does each number have?', 'Write ' + d1(a) + ' as ' + d2(A) + ' so both numbers have two decimal places.', 'Line up the points: ' + d2(A) + ' − ' + d2(B) + '. Start from the hundredths.'],
      show: [d1(a) + ' = ' + d2(A) + '.', d2(A) + ' − ' + d2(B) + ' = ' + d2(ans) + '.'],
      bm: 'Berapakah ' + d1(a) + ' − ' + d2(B) + '?', simple: 'Take ' + d2(B) + ' away from ' + d1(a) + '.', check: 'Check: ' + d2(ans) + ' + ' + d2(B) + ' = ' + d2(A) + ' ✓' };
  } });

  T({ id: 'dec-frac', skill: 'decimals', level: 1, make: function (R) {
    if (R.chance(0.5)) {
      var t = R.int(1, 9);
      return { text: 'Which decimal is the same as ' + t + '/10?', answer: '0.' + t,
        wrong: [['0.0' + t, 'CONCEPT', '0.0' + t + ' is ' + t + ' hundredths. We need tenths.'], [t + '.10', 'CONCEPT', 'The fraction line is not a decimal point.'], [t + '.0', 'CONCEPT', t + '.0 is ' + t + ' whole ones.']],
        hints: [t + '/10 means ' + t + ' tenths.', 'Tenths are the first place after the decimal point.', 'Write 0, then the point, then ' + t + '.'],
        show: [t + '/10 = ' + t + ' tenths = 0.' + t + '.'], bm: 'Nombor perpuluhan manakah sama dengan ' + t + '/10?', simple: 'Write ' + t + ' tenths as a decimal.' };
    }
    var h = R.int(11, 99); if (h % 10 === 0) h++;
    return { text: 'Which decimal is the same as ' + h + '/100?', answer: d2(h),
      wrong: [[d1(h), 'CONCEPT', d1(h) + ' is ' + h + ' tenths. We need hundredths.'], ['0.0' + h, 'CONCEPT', 'Hundredths use two places after the point.'], [h + '.100', 'CONCEPT', 'The fraction line is not a decimal point.']],
      hints: [h + '/100 means ' + h + ' hundredths.', 'Hundredths use two places after the decimal point.', 'Write 0, then the point, then ' + h + '.'],
      show: [h + '/100 = ' + d2(h) + '.'], bm: 'Nombor perpuluhan manakah sama dengan ' + h + '/100?', simple: 'Write ' + h + ' hundredths as a decimal.' };
  } });

  T({ id: 'dec-ctx', skill: 'decimals', level: 3, make: function (R) {
    var n = R.pick(NAMES), a = R.int(25, 95), A = a * 10, B = R.mult(105, A - 30, 5), ans = A - B, rope = R.chance(0.5);
    if (B % 10 === 0) B += 5, ans = A - B;
    var text = rope ? 'A rope is ' + d1(a) + ' m long.\n' + n + ' cuts off ' + d2(B) + ' m.\nHow long is the rope now?'
      : 'A jug has ' + d1(a) + ' l of water.\n' + n + ' pours out ' + d2(B) + ' l.\nHow much water is left?';
    var u = rope ? ' m' : ' l';
    return { text: text, answer: ans, fmt: function (h) { return d2(h) + u; }, keepWords: ['left'],
      wrong: [[A + B, 'UNDERSTAND', 'You added. ' + (rope ? 'Cutting makes the rope shorter.' : 'Pouring out leaves less water.')], [ans + 10, 'EXECUTE', 'Check the tenths after regrouping.'], [colAbs(A, B), 'CONCEPT', 'Write ' + d1(a) + ' as ' + d2(A) + ' and line up the points.']],
      hints: ['After that, is there more or less?', 'Less means subtract. Give both numbers two decimal places.', 'Work out ' + d2(A) + ' − ' + d2(B) + ' with the points lined up.'],
      show: [d1(a) + ' = ' + d2(A) + '.', d2(A) + ' − ' + d2(B) + ' = ' + d2(ans) + '.'],
      bm: rope ? 'Seutas tali panjangnya ' + d1(a) + ' m. ' + n + ' memotong ' + d2(B) + ' m. Berapakah panjang tali itu sekarang?' : 'Sebuah jag berisi ' + d1(a) + ' l air. ' + n + ' menuang keluar ' + d2(B) + ' l. Berapakah isi padu air yang tinggal?',
      simple: (rope ? 'The rope is ' + d1(a) + ' m. ' + d2(B) + ' m is cut away.' : 'The jug has ' + d1(a) + ' l. ' + d2(B) + ' l goes out.') + ' How much is still there?',
      check: 'Check: ' + d2(ans) + ' + ' + d2(B) + ' = ' + d2(A) + ' ✓' };
  } });

  T({ id: 'dec-add', skill: 'decimals', level: 2, make: function (R) {
    var a, b; do { a = R.int(105, 690); b = R.int(105, 390); } while ((a % 10) + (b % 10) < 10);
    return { text: 'What is ' + d2(a) + ' + ' + d2(b) + '?', answer: a + b, fmt: d2,
      wrong: [[a + b - 10, 'EXECUTE', 'Check the carry from the hundredths.'], [Math.abs(a - b), 'PLAN', 'You subtracted. Look at the sign.'], [a + b + 100, 'EXECUTE', 'Check the ones.']],
      hints: ['Line up the decimal points.', 'Add the hundredths first. Is there a carry?', 'Then add the tenths, then the ones.'],
      show: ['Line up the points and add each column.', d2(a) + ' + ' + d2(b) + ' = ' + d2(a + b) + '.'],
      bm: 'Berapakah ' + d2(a) + ' + ' + d2(b) + '?', simple: 'Add ' + d2(a) + ' and ' + d2(b) + '.' };
  } });

  /* ══════════ MONEY ══════════ */
  var ITEMS = [['a storybook', 'sebuah buku cerita'], ['lunch', 'makan tengah hari'], ['a pencil box', 'sebuah kotak pensel'], ['a toy car', 'sebuah kereta mainan'], ['a water bottle', 'sebotol air'], ['a badminton shuttlecock set', 'set bulu tangkis']];
  T({ id: 'mon-left', skill: 'money', level: 2, make: function (R) {
    var n = R.pick(NAMES), H = R.pick([1000, 1500, 2000, 3000, 5000]), s; do { s = R.mult(105, H - 120, 5); } while (s % 100 === 0);
    var it = R.pick(ITEMS), ans = H - s;
    return { text: n + ' has ' + rm(H) + '.\n' + n + ' spends ' + rm(s) + ' on ' + it[0] + '.\nHow much money does ' + n + ' have left?', answer: ans, fmt: rm, keepWords: ['left'],
      wrong: [[H + s, 'UNDERSTAND', 'You added. After spending, is there more or less money?'], [ans + 100, 'EXECUTE', 'Check the ringgit after regrouping.'], [ans + 10, 'EXECUTE', 'Check the sen after regrouping.']],
      hints: ['What are we trying to find?', n + ' starts with money and then spends some. Should the amount become bigger or smaller?', 'Start with ' + rm(H) + ' and place ' + rm(s) + ' underneath. Keep the decimal points aligned.'],
      show: ['Spending makes the money smaller, so subtract.', rm(H) + ' − ' + rm(s) + ' = ' + rm(ans) + '.'],
      bm: n + ' ada ' + rm(H) + '. ' + n + ' membelanjakan ' + rm(s) + ' untuk ' + it[1] + '. Berapakah baki wang ' + n + '?', simple: n + ' has ' + rm(H) + '. ' + n + ' uses ' + rm(s) + ' to buy something. How much money is still there?',
      check: 'Check: ' + rm(ans) + ' + ' + rm(s) + ' = ' + rm(H) + ' ✓',
      why: { q: 'How did you know to subtract?', options: ['Spending makes the money smaller', 'The numbers have decimal points', 'Money questions always use subtract'], answer: 0 } };
  } });

  T({ id: 'mon-total', skill: 'money', level: 1, make: function (R) {
    var a = R.mult(120, 990, 10), b = R.mult(110, 890, 10), p = R.pick([['A pen', 'a ruler', 'Sebatang pen', 'sebatang pembaris'], ['A drink', 'a curry puff', 'Minuman', 'karipap'], ['A notebook', 'an eraser', 'Sebuah buku nota', 'pemadam']]);
    return { text: p[0] + ' costs ' + rm(a) + '.\n' + p[1].charAt(0).toUpperCase() + p[1].slice(1) + ' costs ' + rm(b) + '.\nWhat is the total cost?', answer: a + b, fmt: rm, step: 10,
      wrong: [[Math.abs(a - b), 'UNDERSTAND', 'You found the difference. “Total” joins the prices.'], [a + b + 100, 'EXECUTE', 'Check the ringgit.'], [a + b - 10, 'EXECUTE', 'Check the sen.']],
      hints: ['Are we joining the prices or comparing them?', '“Total” means add.', 'Add the sen first, then the ringgit.'],
      show: ['Total means add.', rm(a) + ' + ' + rm(b) + ' = ' + rm(a + b) + '.'],
      bm: p[2] + ' berharga ' + rm(a) + '. ' + p[3].charAt(0).toUpperCase() + p[3].slice(1) + ' berharga ' + rm(b) + '. Berapakah jumlah harganya?', simple: 'How much for both things together?' };
  } });

  T({ id: 'mon-change', skill: 'money', level: 3, make: function (R) {
    var n = R.pick(NAMES), P = R.pick([1000, 2000, 5000]), c; do { c = R.mult(130, P - 150, 10); } while (c % 100 === 0);
    var it = R.pick(ITEMS), ans = P - c;
    return { text: n + ' pays ' + rm(P) + ' for ' + it[0] + ' that costs ' + rm(c) + '.\nHow much change does ' + n + ' get?', answer: ans, fmt: rm,
      wrong: [[P + c, 'UNDERSTAND', 'You added. Change is what comes back after paying.'], [ans + 100, 'EXECUTE', 'Check the ringgit after regrouping.'], [ans + 20, 'EXECUTE', 'Check the sen.']],
      hints: ['What is “change” in a shop?', 'Change is what is left from the money paid. Which operation?', 'Write ' + rm(P) + ' − ' + rm(c) + ' with the decimal points lined up.'],
      show: ['Change = money paid − price.', rm(P) + ' − ' + rm(c) + ' = ' + rm(ans) + '.'],
      bm: n + ' membayar ' + rm(P) + ' untuk ' + it[1] + ' yang berharga ' + rm(c) + '. Berapakah baki wang yang ' + n + ' terima?', simple: n + ' gives ' + rm(P) + '. The price is ' + rm(c) + '. How much money comes back?',
      check: 'Check: ' + rm(c) + ' + ' + rm(ans) + ' = ' + rm(P) + ' ✓' };
  } });

  var FOODS = [['Nasi lemak', 'packet', 'bungkus nasi lemak'], ['Roti canai', 'piece', 'keping roti canai'], ['A bowl of mee soup', 'bowl', 'mangkuk mi sup'], ['A cup of teh tarik', 'cup', 'cawan teh tarik']];
  T({ id: 'mon-multi', skill: 'money', level: 2, make: function (R) {
    var f = R.pick(FOODS), p; do { p = R.mult(150, 690, 10); } while (p % 100 === 0);
    var q = R.int(2, 5), n = R.pick(NAMES), ans = p * q;
    return { text: f[0] + ' costs ' + rm(p) + ' each.\n' + n + ' buys ' + q + '.\nHow much does ' + n + ' pay?', answer: ans, fmt: rm, keepWords: ['each'], step: 10,
      wrong: [[Math.floor(p / 100) * 100 * q + p % 100, 'EXECUTE', 'Multiply the sen part too.'], [p * (q - 1), 'EXECUTE', 'Count the items again: ' + q + '.'], [p + q * 100, 'PLAN', 'Buying ' + q + ' at the same price means ' + q + ' equal groups.']],
      hints: ['How many, and what does one cost?', q + ' at the same price: multiply (or add ' + q + ' times).', 'Multiply the ringgit and the sen separately, then add.'],
      show: [rm(p) + ' × ' + q + ' = ' + rm(ans) + '.'],
      bm: 'Sebiji/sebungkus ' + f[2] + ' berharga ' + rm(p) + '. ' + n + ' membeli ' + q + '. Berapakah yang ' + n + ' bayar?', simple: 'One is ' + rm(p) + '. ' + n + ' takes ' + q + '. How much money?' };
  } });

  T({ id: 'mon-sen', skill: 'money', level: 1, make: function (R) {
    var r = R.int(105, 995); if (r % 100 === 0) r += 5;
    if (R.chance(0.5)) {
      return { text: 'How many sen are in ' + rm(r) + '?', answer: r + ' sen',
        wrong: [[r * 10 + ' sen', 'CONCEPT', 'RM1 = 100 sen, not 1 000 sen.'], [(r % 100) + ' sen', 'CONCEPT', 'Don’t forget the ringgit. RM1 = 100 sen.'], [Math.floor(r / 100) + ' sen', 'CONCEPT', 'RM1 = 100 sen.']],
        hints: ['How many sen make RM1?', 'RM1 = 100 sen. How many ringgit are there?', 'Change the ringgit to sen, then add the sen.'],
        show: ['RM' + Math.floor(r / 100) + ' = ' + Math.floor(r / 100) * 100 + ' sen.', Math.floor(r / 100) * 100 + ' + ' + (r % 100) + ' = ' + r + ' sen.'],
        bm: 'Berapakah sen dalam ' + rm(r) + '?', simple: 'Write ' + rm(r) + ' using only sen.' };
    }
    return { text: 'Write ' + r + ' sen in ringgit.', answer: rm(r),
      wrong: [['RM' + r + '.00', 'CONCEPT', '100 sen = RM1. ' + r + ' sen is not ' + r + ' ringgit.'], [rm(r * 10), 'CONCEPT', '100 sen make RM1.'], ['RM0.' + r, 'CONCEPT', 'How many whole ringgit are in ' + r + ' sen?']],
      hints: ['How many sen make RM1?', '100 sen = RM1. How many hundreds are in ' + r + '?', 'The hundreds become ringgit. The rest stays as sen.'],
      show: [r + ' sen = ' + rm(r) + '.'], bm: 'Tulis ' + r + ' sen dalam ringgit.', simple: 'Change ' + r + ' sen to RM.' };
  } });

  /* ══════════ FRACTIONS ══════════ */
  T({ id: 'fr-shaded', skill: 'fractions', level: 1, make: function (R) {
    var n = R.int(3, 8), k = R.int(1, n - 1);
    return { text: 'This bar is cut into ' + n + ' equal parts.\nWhat fraction is shaded?', visual: { kind: 'bar', parts: n, shaded: k }, answer: k + '/' + n,
      wrong: [[(n - k) + '/' + n, 'UNDERSTAND', 'That is the part that is not shaded.'], [k + '/' + (n - k), 'CONCEPT', 'The bottom number counts all the parts.'], [n + '/' + k, 'CONCEPT', 'Which number goes on top: shaded parts or all parts?'], [k + '/' + (n + 1), 'EXECUTE', 'Count all the parts again.']],
      hints: ['How many equal parts are there?', 'The bottom number shows all the parts. The top number shows the shaded parts.', 'Count the shaded parts. That goes on top.'],
      show: [n + ' equal parts → bottom number ' + n + '.', k + ' shaded → top number ' + k + '.', 'Fraction: ' + k + '/' + n + '.'],
      bm: 'Bar ini dibahagi kepada ' + n + ' bahagian yang sama besar. Apakah pecahan yang berlorek?', simple: 'The bar has ' + n + ' same-size parts. What fraction is coloured?' };
  } });

  T({ id: 'fr-of', skill: 'fractions', level: 2, make: function (R) {
    var n = R.pick([2, 3, 4, 5, 6, 8, 10]), k = R.int(1, n - 1), m = R.int(2, 9), t = n * m;
    return { text: 'What is ' + k + '/' + n + ' of ' + t + '?', answer: k * m, keepWords: ['of'],
      wrong: [[k > 1 ? m : t - m, k > 1 ? 'PLAN' : 'UNDERSTAND', k > 1 ? 'That is 1/' + n + '. We need ' + k + ' parts.' : 'That is the part that is left.'], [t * k, 'CONCEPT', 'A fraction of an amount is smaller than the amount. Share first.'], [t - k * m, 'UNDERSTAND', 'That is the part that is left over.']],
      hints: ['What does the ' + n + ' in ' + k + '/' + n + ' tell you to do with ' + t + '?', 'First find 1/' + n + ' of ' + t + ' by sharing into ' + n + ' equal groups.', '1/' + n + ' of ' + t + ' is one group. ' + k + '/' + n + ' is ' + k + ' of those groups.'],
      show: [t + ' ÷ ' + n + ' = ' + m + ', so 1/' + n + ' of ' + t + ' = ' + m + '.', k + ' × ' + m + ' = ' + k * m + '.'],
      bm: 'Berapakah ' + k + '/' + n + ' daripada ' + t + '?', simple: 'Share ' + t + ' into ' + n + ' equal groups. How much is in ' + k + ' group' + (k > 1 ? 's' : '') + '?' };
  } });

  var FR_THINGS = [['cupcakes', 'chocolate', 'kek cawan', 'berperisa coklat'], ['marbles', 'blue', 'guli', 'berwarna biru'], ['pupils', 'girls', 'murid', 'perempuan'], ['durians', 'sold', 'biji durian', 'telah dijual']];
  T({ id: 'fr-ofctx', skill: 'fractions', level: 3, make: function (R) {
    var th = R.pick(FR_THINGS), n = R.pick([3, 4, 5, 6, 8]), k = R.int(1, n - 1), m = R.int(2, 8), t = n * m;
    var line = th[1] === 'girls' ? k + '/' + n + ' of them are girls.' : th[1] === 'sold' ? k + '/' + n + ' of them are sold.' : k + '/' + n + ' of them are ' + th[1] + '.';
    return { text: 'There are ' + t + ' ' + th[0] + '.\n' + line + '\nHow many ' + (th[1] === 'girls' ? 'girls are there?' : th[0] + ' are ' + th[1] + '?'), answer: k * m, keepWords: ['of'],
      wrong: [[k > 1 ? m : t - m, 'PLAN', k > 1 ? 'That is 1/' + n + '. We need ' + k + ' groups.' : 'That is the rest.'], [t - k * m, 'UNDERSTAND', 'That is the other part.'], [t * k, 'CONCEPT', 'Share ' + t + ' into ' + n + ' groups first.']],
      hints: ['What does the ' + n + ' in ' + k + '/' + n + ' tell you to do?', 'Share ' + t + ' into ' + n + ' equal groups first.', 'One group is 1/' + n + '. How many groups do we need?'],
      show: [t + ' ÷ ' + n + ' = ' + m + '.', k + ' × ' + m + ' = ' + k * m + '.'],
      bm: 'Ada ' + t + ' ' + th[2] + '. ' + k + '/' + n + ' daripadanya ' + th[3] + '. Berapakah bilangannya?', simple: t + ' ' + th[0] + ' in ' + n + ' equal groups. ' + k + ' group' + (k > 1 ? 's are' : ' is') + ' ' + th[1] + '. How many?',
      check: 'Check: ' + k * m + ' is less than ' + t + ' ✓' };
  } });

  T({ id: 'fr-equiv', skill: 'fractions', level: 1, make: function (R) {
    var b = R.int(2, 5), a = R.int(1, b - 1), s = R.int(2, 4);
    return { text: 'Which fraction is equal to ' + a + '/' + b + '?', visual: { kind: 'bar', parts: b, shaded: a }, answer: (a * s) + '/' + (b * s),
      wrong: [[(a + s) + '/' + (b + s), 'CONCEPT', 'Adding the same number does not keep fractions equal. Multiply instead.'], [(a * s) + '/' + b, 'CONCEPT', 'Multiply the top and the bottom by the same number.'], [a + '/' + (b * s), 'CONCEPT', 'Multiply the top and the bottom by the same number.']],
      hints: ['Equal fractions show the same amount.', 'Multiply the top and the bottom by the same number.', 'Try multiplying ' + a + '/' + b + ' by ' + s + ' on top and bottom.'],
      show: [a + ' × ' + s + ' = ' + a * s + ', ' + b + ' × ' + s + ' = ' + b * s + '.', a + '/' + b + ' = ' + (a * s) + '/' + (b * s) + '.'],
      bm: 'Pecahan manakah sama dengan ' + a + '/' + b + '?', simple: 'Which fraction is the same amount as ' + a + '/' + b + '?' };
  } });

  T({ id: 'fr-compare', skill: 'fractions', level: 2, make: function (R) {
    var ds = R.shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 4), big = R.chance(0.5);
    var ans = big ? Math.min.apply(null, ds) : Math.max.apply(null, ds);
    return { text: 'Which is the ' + (big ? 'largest' : 'smallest') + ' fraction?', answer: '1/' + ans,
      wrong: ds.filter(function (d) { return d !== ans; }).map(function (d) { return ['1/' + d, 'CONCEPT', 'With 1 on top, a bigger bottom number means smaller pieces.']; }),
      hints: ['All the fractions have 1 on top. What does the bottom number tell us?', 'The bottom number is how many pieces one whole is cut into.', 'More pieces means each piece is ' + (big ? 'smaller. Find the fewest pieces.' : 'smaller. Find the most pieces.')],
      show: ['1/' + ans + ' cuts the whole into ' + ans + ' pieces.', 'So 1/' + ans + ' is the ' + (big ? 'largest' : 'smallest') + '.'],
      bm: 'Pecahan manakah yang paling ' + (big ? 'besar' : 'kecil') + '?', simple: 'Which piece is the ' + (big ? 'biggest' : 'smallest') + '?' };
  } });

  /* ══════════ PERCENTAGES ══════════ */
  T({ id: 'pc-100', skill: 'percent', level: 1, make: function (R) {
    var n = R.int(3, 97); if (n % 10 === 0) n++;
    return { text: 'Write ' + n + '/100 as a percentage.', answer: n + '%',
      wrong: [[(n * 10) + '%', 'CONCEPT', 'Out of 100, the top number is the percent.'], [(100 - n) + '%', 'UNDERSTAND', 'That is the part that is left.'], [Math.round(n / 10) + '%', 'CONCEPT', 'Percent means “out of 100”.']],
      hints: ['Percent means “out of 100”.', 'The fraction already has 100 at the bottom.', 'The top number becomes the percentage.'],
      show: [n + '/100 means ' + n + ' out of 100 = ' + n + '%.'], bm: 'Tulis ' + n + '/100 sebagai peratus.', simple: n + ' out of 100. What percent is that?' };
  } });

  T({ id: 'pc-10', skill: 'percent', level: 2, make: function (R) {
    var k = R.int(1, 9);
    return { text: k + '/10 = ?%', answer: (k * 10) + '%',
      wrong: [[k + '%', 'CONCEPT', k + '% is ' + k + ' out of 100. Our fraction is out of 10.'], [(k + 10) + '%', 'CONCEPT', 'We don’t add. Make the bottom 100.'], [(100 - k * 10) + '%', 'UNDERSTAND', 'That is the other part.']],
      hints: ['Percent means out of 100. What is the bottom number now?', 'Change 10 into 100. What do you multiply by?', 'Multiply the top and bottom by 10.'],
      show: [k + '/10 = ' + k * 10 + '/100 = ' + k * 10 + '%.'], bm: k + '/10 bersamaan dengan berapa peratus?', simple: 'Write ' + k + ' tenths as a percent.' };
  } });

  var PC_SCENES = [['flowers', 'red', 'kuntum bunga', 'berwarna merah'], ['pupils', 'wearing glasses', 'murid', 'memakai cermin mata'], ['marbles', 'blue', 'biji guli', 'berwarna biru'], ['seats', 'taken', 'kerusi', 'telah diduduki']];
  T({ id: 'pc-ctx', skill: 'percent', level: 3, make: function (R) {
    var den = R.pick([10, 20, 25, 50]), k = R.int(1, den - 1), sc = R.pick(PC_SCENES), p = k * 100 / den;
    return { text: 'There are ' + den + ' ' + sc[0] + '.\n' + k + ' ' + (k === 1 ? 'is' : 'are') + ' ' + sc[1] + '.\nWhat percentage ' + (k === 1 ? 'is' : 'are') + ' ' + sc[1] + '?', answer: p + '%',
      visual: den === 10 && sc[0] === 'flowers' ? { kind: 'flowers', total: 10, red: k } : undefined,
      wrong: [[k + '%', 'CONCEPT', 'There are ' + den + ' ' + sc[0] + ', not 100. Change to “out of 100”.'], [(100 - p) + '%', 'UNDERSTAND', 'That is the part that is not ' + sc[1] + '.'], [(p + 10) + '%', 'EXECUTE', 'Check what you multiplied by.']],
      hints: ['Write it as a fraction first: ' + k + ' out of ' + den + '.', 'Make the bottom number 100. What do you multiply ' + den + ' by?', den + ' × ' + (100 / den) + ' = 100. Multiply ' + k + ' by ' + (100 / den) + ' too.'],
      show: [k + '/' + den + ' = ' + p + '/100.', p + '/100 = ' + p + '%.'],
      bm: 'Ada ' + den + ' ' + sc[2] + '. ' + k + ' ' + sc[3] + '. Berapakah peratusnya?', simple: k + ' out of ' + den + ' are ' + sc[1] + '. What percent is that?' };
  } });

  var PC_FR = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80], [1, 10, 10], [3, 10, 30], [9, 10, 90], [1, 20, 5], [3, 20, 15], [7, 20, 35], [1, 25, 4], [2, 25, 8], [1, 50, 2]];
  T({ id: 'pc-frac', skill: 'percent', level: 2, make: function (R) {
    var f = R.pick(PC_FR);
    return { text: 'Write ' + f[0] + '/' + f[1] + ' as a percentage.', answer: f[2] + '%',
      wrong: [['' + f[0] + f[1] + '%', 'CONCEPT', 'We don’t write the digits side by side. Make the bottom 100.'], [f[1] + '%', 'CONCEPT', 'Change the bottom number to 100 first.'], [(100 - f[2]) + '%', 'UNDERSTAND', 'That is the other part.'], [f[0] + '%', 'CONCEPT', 'The fraction is out of ' + f[1] + ', not 100.']],
      hints: ['What do you multiply ' + f[1] + ' by to make 100?', f[1] + ' × ' + (100 / f[1]) + ' = 100. Do the same to the top.', f[0] + ' × ' + (100 / f[1]) + ' = ?'],
      show: [f[0] + '/' + f[1] + ' = ' + f[2] + '/100 = ' + f[2] + '%.'], bm: 'Tulis ' + f[0] + '/' + f[1] + ' sebagai peratus.', simple: f[0] + '/' + f[1] + ' is how many percent?' };
  } });

  T({ id: 'pc-left', skill: 'percent', level: 3, make: function (R) {
    var den = R.pick([4, 5, 10, 20]), k = R.int(1, den - 1), food = R.pick([['pizza', 'piza'], ['cake', 'kek'], ['watermelon', 'tembikai']]), n = R.pick(NAMES), left = (den - k) * 100 / den;
    return { text: 'A ' + food[0] + ' is cut into ' + den + ' equal pieces.\n' + n + ' eats ' + k + ' piece' + (k > 1 ? 's' : '') + '.\nWhat percentage of the ' + food[0] + ' is left?', answer: left + '%', keepWords: ['left'],
      wrong: [[(100 - left) + '%', 'UNDERSTAND', 'That is the part eaten. The question asks what is left.'], [(den - k) + '%', 'CONCEPT', 'Change “out of ' + den + '” to “out of 100” first.'], [k + '%', 'CONCEPT', 'Find the pieces left, then change to a percent.'], [(left + 10) + '%', 'EXECUTE', 'Check what you multiplied by.'], [Math.max(5, left - 5) + '%', 'EXECUTE', 'Check what you multiplied by.']],
      hints: ['Are we finding the pieces eaten or the pieces left?', 'How many pieces are left out of ' + den + '?', (den - k) + ' out of ' + den + ' are left. Change ' + (den - k) + '/' + den + ' into a percentage.'],
      show: [den + ' − ' + k + ' = ' + (den - k) + ' pieces left.', (den - k) + '/' + den + ' = ' + left + '/100 = ' + left + '%.'],
      bm: 'Sebiji ' + food[1] + ' dipotong kepada ' + den + ' keping yang sama besar. ' + n + ' makan ' + k + ' keping. Berapakah peratus ' + food[1] + ' yang tinggal?', simple: den + ' pieces. ' + n + ' eats ' + k + '. What percent is still there?',
      check: 'Check: ' + left + '% + ' + (100 - left) + '% = 100% ✓' };
  } });

  /* ══════════ 24-HOUR TIME ══════════ */
  T({ id: 't24-to24', skill: 'time24', level: 1, make: function (R) {
    var pm = R.chance(0.7), h = R.int(1, 11), m = R.mult(0, 55, 5), t = (pm ? h + 12 : h) * 60 + m;
    return { text: 'Which 24-hour time is the same as ' + t12(t) + '?', answer: t24(t),
      wrong: [[t24(pm ? t - 720 : t + 720), 'CONCEPT', pm ? 'That is in the morning. p.m. is after noon.' : 'That is after noon. a.m. is in the morning.'], [t24(pm ? t - 120 : t + 600), 'EXECUTE', pm ? 'For p.m. times, add 12 to the hour, not 10.' : 'For a.m. times, keep the hour.'], [t24(t + 60), 'EXECUTE', 'Check the hour again.']],
      hints: [pm ? 'p.m. times are after 12 noon.' : 'a.m. times are from midnight to noon.', pm ? 'For p.m. times, add 12 to the hour.' : 'For a.m. times, keep the hour and write 2 digits.', pm ? h + ' + 12 = ?' : 'Write ' + h + ' as ' + pad(h) + '.'],
      show: [t12(t) + (pm ? ' → ' + h + ' + 12 = ' + (h + 12) + '.' : ' → hour ' + pad(h) + '.'), t12(t) + ' = ' + t24(t) + '.'],
      bm: 'Waktu 24 jam manakah sama dengan ' + t12(t) + '?', simple: t12(t) + '. What is it in 24-hour time?' };
  } });

  var EVENTS = [['The school bus', 'leaves', 'Bas sekolah bertolak'], ['The movie', 'starts', 'Filem bermula'], ['The night market', 'begins', 'Pasar malam bermula'], ['The shop', 'closes', 'Kedai ditutup']];
  T({ id: 't24-to12', skill: 'time24', level: 2, make: function (R) {
    var e = R.pick(EVENTS), t = R.int(13, 22) * 60 + R.mult(5, 55, 5);
    return { text: e[0] + ' ' + e[1] + ' at ' + t24(t) + '.\nWhat time is this in 12-hour time?', visual: { kind: 'clock24', time: t24(t).slice(0, 4) }, answer: t12(t),
      wrong: [[t12(t - 600), 'CONCEPT', 'Take away 12 from the hour, not 10.'], [t12(t - 720), 'CONCEPT', 'Hours after 12 are p.m.'], [t12(t - 840), 'EXECUTE', 'Check: hour − 12.']],
      hints: ['Is ' + t24(t) + ' before or after 12 noon?', 'After noon, take away 12 from the hour.', Math.floor(t / 60) + ' − 12 = ? Keep the minutes.'],
      show: [Math.floor(t / 60) + ' − 12 = ' + (Math.floor(t / 60) - 12) + '.', t24(t) + ' = ' + t12(t) + '.'],
      bm: e[2] + ' pada jam ' + t24(t).slice(0, 4) + '. Apakah waktu itu dalam sistem 12 jam?', simple: 'Write ' + t24(t) + ' with a.m. or p.m.' };
  } });

  T({ id: 't24-ctx', skill: 'time24', level: 3, make: function (R) {
    var sc = R.pick([['Ayah comes home from work at', 'Ayah pulang dari kerja pada'], ['The badminton match ends at', 'Perlawanan badminton tamat pada'], ['Ibu starts cooking dinner at', 'Ibu mula memasak makan malam pada']]);
    var t = R.int(17, 22) * 60 + R.mult(5, 55, 5);
    return { text: sc[0] + ' ' + t12(t) + '.\nWhich 24-hour time shows this?', answer: t24(t),
      wrong: [[t24(t - 720), 'CONCEPT', 'That is in the morning. p.m. is after noon.'], [t24(t - 120), 'EXECUTE', 'Add 12 to the hour, not 10.'], [t24(t + 120), 'EXECUTE', 'Check: hour + 12.']],
      hints: ['Is ' + t12(t) + ' in the morning or the evening?', 'For p.m. times, add 12 to the hour.', (Math.floor(t / 60) - 12) + ' + 12 = ?'],
      show: [(Math.floor(t / 60) - 12) + ' + 12 = ' + Math.floor(t / 60) + '.', t12(t) + ' = ' + t24(t) + '.'],
      bm: sc[1] + ' ' + t12(t) + '. Waktu 24 jam manakah menunjukkan waktu ini?', simple: t12(t) + ' in the evening. Write it in 24-hour time.' };
  } });

  T({ id: 't24-part', skill: 'time24', level: 1, make: function (R) {
    var bands = { morning: [300, 690], afternoon: [780, 1050], night: [1200, 1410] };
    var want = R.pick(['morning', 'afternoon', 'night']), others = Object.keys(bands).filter(function (b) { return b !== want; });
    function tIn(b) { return R.mult(bands[b][0], bands[b][1], 15); }
    var ans = tIn(want), w = [[t24(tIn(others[0])), 'CONCEPT', 'Look at the hour. Is it before or after 12?'], [t24(tIn(others[1])), 'CONCEPT', 'Look at the hour. Is it before or after 12?'], [t24(tIn(others[R.int(0, 1)]) + 30), 'CONCEPT', 'Hours from 13 to 18 are the afternoon.']];
    return { text: 'Which 24-hour time is in the ' + want + '?', answer: t24(ans), wrong: w,
      hints: ['The first two digits show the hour.', 'Morning hours are before 12. Afternoon is about 12 to 18. Night is after 19.', 'Find the time whose hour fits the ' + want + '.'],
      show: [t24(ans) + ' = ' + t12(ans) + ', which is in the ' + want + '.'],
      bm: 'Waktu 24 jam manakah pada waktu ' + { morning: 'pagi', afternoon: 'petang', night: 'malam' }[want] + '?', simple: 'Which time is in the ' + want + '?' };
  } });

  /* ══════════ DURATION ══════════ */
  T({ id: 'du-conv', skill: 'duration', level: 2, make: function (R) {
    var h = R.int(1, 4), m = R.mult(5, 55, 5), total = h * 60 + m;
    if (R.chance(0.5)) {
      return { text: 'Convert ' + dur(total) + ' to minutes.', answer: total + ' minutes',
        wrong: [[(h * 100 + m) + ' minutes', 'CONCEPT', '1 hour is 60 minutes, not 100.'], [(h * 60) + ' minutes', 'EXECUTE', 'Don’t forget the extra ' + m + ' minutes.'], [(total + 60) + ' minutes', 'EXECUTE', 'Check the hours: ' + h + ' × 60.']],
        hints: ['How many minutes are in 1 hour?', h + ' hour' + (h > 1 ? 's' : '') + ' = ' + h + ' × 60 minutes.', (h * 60) + ' minutes + ' + m + ' minutes = ?'],
        show: [h + ' × 60 = ' + h * 60 + ' minutes.', h * 60 + ' + ' + m + ' = ' + total + ' minutes.'], bm: 'Tukar ' + durBm(total) + ' kepada minit.', simple: 'Write ' + dur(total) + ' using only minutes.' };
    }
    return { text: 'Convert ' + total + ' minutes to hours and minutes.', answer: dur(total),
      wrong: [[dur(Math.floor(total / 100) * 60 + total % 100 < 60 ? Math.floor(total / 100) * 60 + total % 100 : total + 60), 'CONCEPT', '1 hour is 60 minutes, not 100.'], [dur(total - 60), 'EXECUTE', 'Count how many 60s fit into ' + total + '.'], [dur(total + 10), 'EXECUTE', 'Check the minutes left over.']],
      hints: ['How many minutes make 1 hour?', 'How many groups of 60 fit into ' + total + '?', h + ' × 60 = ' + h * 60 + '. How many minutes are left over?'],
      show: [total + ' = ' + h * 60 + ' + ' + m + '.', h * 60 + ' minutes = ' + h + ' hour' + (h > 1 ? 's' : '') + '.', 'So ' + total + ' minutes = ' + dur(total) + '.'],
      bm: 'Tukar ' + total + ' minit kepada jam dan minit.', simple: 'Write ' + total + ' minutes as hours and minutes.' };
  } });

  var ACTS = [['The movie', 'movie', 'Filem itu'], ['The swimming lesson', 'lesson', 'Kelas renang itu'], ['The football match', 'match', 'Perlawanan bola sepak itu'], ['The school concert', 'concert', 'Konsert sekolah itu']];
  T({ id: 'du-between', skill: 'duration', level: 2, make: function (R) {
    var a = R.pick(ACTS), s = R.int(13, 17) * 60 + R.mult(5, 55, 5), d = R.mult(35, 170, 5), e = s + d;
    var naiveH = Math.floor(e / 60) - Math.floor(s / 60), naiveM = (e % 60) - (s % 60);
    var naive = naiveM < 0 ? naiveH * 100 + naiveM : null; // "100-minute hour" mistake
    var naiveStr = naive ? (Math.floor(naive / 100) ? Math.floor(naive / 100) + ' hour' + (Math.floor(naive / 100) > 1 ? 's ' : ' ') : '') + (naive % 100) + ' minutes' : dur(d + 40);
    return { text: a[0] + ' starts at ' + t12(s) + ' and ends at ' + t12(e) + '.\nWhat is the duration of the ' + a[1] + '?', answer: dur(d),
      wrong: [[naiveStr, 'CONCEPT', 'An hour has 60 minutes, not 100. Count on from the start time.'], [dur(d + 60), 'EXECUTE', 'Count the hours again.'], [dur(Math.abs(d - 15) || 5), 'EXECUTE', 'Count the minutes again.']],
      hints: ['Duration is the time from start to end.', 'Count on in jumps: first to the next o’clock.', 'From ' + t12(s) + ' to ' + t12(Math.ceil(s / 60) * 60) + ' is ' + (Math.ceil(s / 60) * 60 - s) + ' minutes. Keep counting to ' + t12(e) + '.'],
      show: ['Count on from ' + t12(s) + ' to ' + t12(e) + '.', 'Duration = ' + dur(d) + '.'],
      bm: a[2] + ' bermula pada ' + t12(s) + ' dan tamat pada ' + t12(e) + '. Berapakah tempoh masanya?', simple: 'It begins at ' + t12(s) + '. It finishes at ' + t12(e) + '. How long is it?',
      check: 'Check: ' + t12(s) + ' + ' + dur(d) + ' = ' + t12(e) + ' ✓' };
  } });

  T({ id: 'du-end', skill: 'duration', level: 3, make: function (R) {
    var ev = R.pick([['Tuition', 'Kelas tuisyen'], ['Football practice', 'Latihan bola sepak'], ['The quiz', 'Kuiz itu'], ['Mengaji class', 'Kelas mengaji']]);
    var s = R.int(7, 18) * 60 + R.mult(30, 55, 5), d = R.int(1, 2) * 60 + R.mult(20, 50, 5), e = s + d;
    var sm = s % 60, dm = d % 60, naive = (Math.floor(s / 60) + Math.floor(d / 60)) * 100 + sm + dm;
    var naiveStr = sm + dm >= 60 ? pad(Math.floor(naive / 100)) + pad(naive % 100) + ' hours' : t24(e + 60);
    return { text: ev[0] + ' begins at ' + t24(s) + '.\nIt lasts ' + dur(d) + '.\nWhat time does it end?', answer: t24(e),
      wrong: [[naiveStr, 'CONCEPT', 'Minutes only go up to 59. 60 minutes make 1 hour.'], [t24(s + Math.floor(d / 60) * 60), 'EXECUTE', 'You added the hours. Now add the minutes too.'], [t24(s + dm), 'EXECUTE', 'You added the minutes. Did you add the hours too?']],
      hints: ['Are we finding the duration or the end time?', 'Add the hours first, then the minutes.', t24(s) + ' + ' + Math.floor(d / 60) + ' hour' + (d >= 120 ? 's' : '') + ' = ' + t24(s + Math.floor(d / 60) * 60) + '. Now add ' + dm + ' minutes. Remember: 60 minutes make 1 hour.'],
      show: [t24(s) + ' + ' + Math.floor(d / 60) + ' h = ' + t24(s + Math.floor(d / 60) * 60) + '.', '+ ' + dm + ' minutes = ' + t24(e) + '.'],
      bm: ev[1] + ' bermula pada jam ' + t24(s).slice(0, 4) + '. Ia berlangsung selama ' + durBm(d) + '. Pukul berapakah ia tamat?', simple: 'It starts at ' + t24(s) + ' and goes on for ' + dur(d) + '. When does it finish?',
      check: 'Check: the minutes part is less than 60 ✓' };
  } });

  T({ id: 'du-between24', skill: 'duration', level: 3, make: function (R) {
    var n = R.pick(NAMES), act = R.pick([['reads', 'membaca', 'read'], ['practises the piano', 'berlatih piano', 'practise'], ['plays badminton', 'bermain badminton', 'play'], ['helps in the kitchen', 'membantu di dapur', 'help']]);
    var s = R.int(7, 19) * 60 + R.mult(35, 55, 5), d = R.mult(20, 95, 5), e = s + d;
    var naive = (Math.floor(e / 60) * 100 + e % 60) - (Math.floor(s / 60) * 100 + s % 60);
    return { text: n + ' ' + act[0] + ' from ' + t24(s).slice(0, 4) + ' hours to ' + t24(e) + '.\nHow long does ' + n + ' ' + act[2] + '?', answer: dur(d),
      wrong: [[naive !== d ? naive + ' minutes' : dur(d + 10), 'CONCEPT', 'You subtracted like normal numbers. An hour has 60 minutes, so count on instead.'], [dur(d + 15), 'EXECUTE', 'Count on in jumps to the next o’clock.'], [dur(d + 60), 'EXECUTE', 'Check the hours.']],
      hints: ['We need the time between two clock times.', 'Count on from ' + t24(s) + ' to the next o’clock first.', t24(s) + ' → ' + t24(Math.ceil(s / 60) * 60) + ' is ' + (Math.ceil(s / 60) * 60 - s) + ' minutes. Then count to ' + t24(e) + '.'],
      show: ['Count on: ' + t24(s) + ' → ' + t24(Math.ceil(s / 60) * 60) + ' → ' + t24(e) + '.', 'Total: ' + dur(d) + '.'],
      bm: n + ' ' + act[1] + ' dari jam ' + t24(s).slice(0, 4) + ' hingga jam ' + t24(e).slice(0, 4) + '. Berapa lamakah masanya?', simple: 'Start ' + t24(s) + '. Stop ' + t24(e) + '. How many minutes?' };
  } });

  T({ id: 'du-units', skill: 'duration', level: 1, make: function (R) {
    var f = R.pick([['hours are in 1 day', 24, 'jam dalam 1 hari'], ['minutes are in 1 hour', 60, 'minit dalam 1 jam'], ['days are in 1 week', 7, 'hari dalam 1 minggu'], ['months are in 1 year', 12, 'bulan dalam 1 tahun'], ['days are in 2 weeks', 14, 'hari dalam 2 minggu'], ['minutes are in half an hour', 30, 'minit dalam setengah jam'], ['seconds are in 1 minute', 60, 'saat dalam 1 minit'], ['minutes are in 2 hours', 120, 'minit dalam 2 jam']]);
    return { text: 'How many ' + f[0] + '?', answer: f[1], wrong: [[f[1] === 60 ? 100 : 60, 'CONCEPT', 'Think about a clock or a calendar.'], [f[1] === 24 ? 12 : 24, 'CONCEPT', 'Think about a clock or a calendar.']], step: f[1] > 20 ? 10 : 2,
      hints: ['Think about a clock or a calendar.', 'Count it in your head: one day, one hour, one week…', 'Use what you know: 1 hour = 60 minutes, 1 day = 24 hours, 1 week = 7 days.'],
      show: ['There are ' + f[1] + ' ' + f[0] + '.'], bm: 'Berapakah bilangan ' + f[2] + '?', simple: 'How many ' + f[0] + '?' };
  } });

  /* ══════════ MEASUREMENT ══════════ */
  var CONV = [['m', 'cm', 100, 'metres', 'centimetres', 'meter', 'sentimeter'], ['cm', 'mm', 10, 'centimetres', 'millimetres', 'sentimeter', 'milimeter'], ['km', 'm', 1000, 'kilometres', 'metres', 'kilometer', 'meter'], ['kg', 'g', 1000, 'kilograms', 'grams', 'kilogram', 'gram'], ['l', 'ml', 1000, 'litres', 'millilitres', 'liter', 'mililiter']];
  T({ id: 'me-conv', skill: 'measure', level: 1, make: function (R) {
    var c = R.pick(CONV), v = R.int(2, 9), ans = v * c[2];
    var other = c[2] === 1000 ? 100 : 1000;
    return { text: 'Convert ' + v + ' ' + c[0] + ' to ' + c[4] + '.', answer: ans, fmt: function (x) { return num(x) + ' ' + c[1]; },
      wrong: [[v * other, 'CONCEPT', '1 ' + c[0] + ' = ' + num(c[2]) + ' ' + c[1] + '.'], [v * (c[2] === 10 ? 1000 : 10), 'CONCEPT', '1 ' + c[0] + ' = ' + num(c[2]) + ' ' + c[1] + '.'], [v + c[2], 'PLAN', 'Each ' + c[0] + ' is ' + num(c[2]) + ' ' + c[1] + ': multiply.']],
      hints: ['How many ' + c[4] + ' are in 1 ' + c[0] + '?', '1 ' + c[0] + ' = ' + num(c[2]) + ' ' + c[1] + '.', v + ' × ' + num(c[2]) + ' = ?'],
      show: ['1 ' + c[0] + ' = ' + num(c[2]) + ' ' + c[1] + '.', v + ' ' + c[0] + ' = ' + num(ans) + ' ' + c[1] + '.'], bm: 'Tukar ' + v + ' ' + c[0] + ' kepada ' + c[6] + '.', simple: 'Write ' + v + ' ' + c[0] + ' in ' + c[4] + '.' };
  } });

  T({ id: 'me-left', skill: 'measure', level: 3, make: function (R) {
    var n = R.pick(NAMES), rice = R.chance(0.5), k = R.int(1, 3), used = R.mult(150, k * 1000 - 100, 50), whole = k * 1000, ans = whole - used, u = rice ? ' g' : ' ml';
    if (used % 1000 === 0) used -= 50, ans = whole - used;
    var text = rice ? 'A bag of rice has a mass of ' + k + ' kg.\n' + n + ' uses ' + num(used) + ' g.\nWhat is the mass of rice remaining?' : 'A bottle has ' + k + ' litre' + (k > 1 ? 's' : '') + ' of water.\n' + n + ' pours out ' + num(used) + ' ml.\nHow much water is left?';
    return { text: text, answer: ans, fmt: function (x) { return num(x) + u; }, keepWords: ['left'], step: 50,
      wrong: [[whole + used, 'UNDERSTAND', 'You added. Some was used, so there is less now.'], [used, 'UNDERSTAND', 'That is the amount used, not the amount left.'], [ans + 100, 'EXECUTE', 'Check the subtraction.']],
      hints: ['Are the units the same?', 'Change ' + k + (rice ? ' kg into grams.' : ' l into millilitres.'), k + (rice ? ' kg = ' : ' l = ') + num(whole) + u + '. Now take away ' + num(used) + u + '.'],
      show: [k + (rice ? ' kg = ' : ' l = ') + num(whole) + u + '.', num(whole) + ' − ' + num(used) + ' = ' + num(ans) + u + '.'],
      bm: rice ? 'Sebungkus beras berjisim ' + k + ' kg. ' + n + ' menggunakan ' + num(used) + ' g. Berapakah jisim beras yang tinggal?' : 'Sebotol air berisi ' + k + ' liter. ' + n + ' menuang keluar ' + num(used) + ' ml. Berapakah air yang tinggal?',
      simple: 'There is ' + k + (rice ? ' kg of rice. ' : ' l of water. ') + num(used) + u + ' is used. How much is still there?', check: 'Check: ' + num(ans) + ' + ' + num(used) + ' = ' + num(whole) + ' ✓' };
  } });

  T({ id: 'me-heavy', skill: 'measure', level: 2, make: function (R) {
    var heavy = R.chance(0.5), kg = R.int(1, 3), gs = [];
    while (gs.length < 3) { var g = R.mult(150, 2950, 50); if (g !== kg * 1000 && gs.indexOf(g) < 0) gs.push(g); }
    var items = [{ s: kg + ' kg', v: kg * 1000 }].concat(gs.map(function (g) { return { s: num(g) + ' g', v: g }; }));
    var best = items.slice().sort(function (a, b) { return heavy ? b.v - a.v : a.v - b.v; })[0];
    return { text: 'Which mass is the ' + (heavy ? 'heaviest' : 'lightest') + '?', answer: best.s,
      wrong: items.filter(function (i) { return i !== best; }).map(function (i) { return [i.s, 'CONCEPT', 'Change all the masses to grams first. 1 kg = 1 000 g.']; }),
      hints: ['Are all the masses in the same unit?', 'Change kg to g: 1 kg = 1 000 g.', kg + ' kg = ' + num(kg * 1000) + ' g. Now compare all four in grams.'],
      show: [kg + ' kg = ' + num(kg * 1000) + ' g.', 'In grams, the ' + (heavy ? 'heaviest' : 'lightest') + ' is ' + best.s + '.'],
      bm: 'Jisim manakah yang paling ' + (heavy ? 'berat' : 'ringan') + '?', simple: 'Which one weighs the ' + (heavy ? 'most' : 'least') + '?' };
  } });

  T({ id: 'me-add', skill: 'measure', level: 2, make: function (R) {
    var a = R.int(1, 3), b = R.mult(150, 800, 50), c = R.mult(150, 900, 50), tot = a * 1000 + b + c;
    return { text: 'What is ' + a + ' kg ' + b + ' g + ' + c + ' g?\nGive your answer in grams.', answer: tot, fmt: function (x) { return num(x) + ' g'; }, step: 100,
      wrong: [[a + b + c, 'CONCEPT', 'Change ' + a + ' kg to grams first: 1 kg = 1 000 g.'], [a * 100 + b + c, 'CONCEPT', '1 kg is 1 000 g, not 100 g.'], [tot - 1000, 'EXECUTE', 'Check the kilograms.']],
      hints: ['Change everything to grams.', a + ' kg = ' + num(a * 1000) + ' g.', num(a * 1000) + ' + ' + b + ' + ' + c + ' = ?'],
      show: [a + ' kg ' + b + ' g = ' + num(a * 1000 + b) + ' g.', num(a * 1000 + b) + ' + ' + c + ' = ' + num(tot) + ' g.'],
      bm: 'Berapakah ' + a + ' kg ' + b + ' g + ' + c + ' g? Beri jawapan dalam gram.', simple: 'Add the masses. Write the answer in grams.' };
  } });

  /* ══════════ PERIMETER ══════════ */
  T({ id: 'pe-rect', skill: 'perimeter', level: 2, make: function (R) {
    var w = R.int(4, 15), h; do { h = R.int(2, 12); } while (h === w);
    var u = R.pick(['cm', 'm']), P = 2 * (w + h);
    return { text: 'A rectangle is ' + w + ' ' + u + ' long and ' + h + ' ' + u + ' wide.\nWhat is its perimeter?', visual: { kind: 'rect', w: w, h: h, unit: u }, answer: P, fmt: function (x) { return x + ' ' + u; },
      wrong: [[w * h, 'CONCEPT', w + ' × ' + h + ' is the area. Perimeter adds the sides around.'], [w + h, 'EXECUTE', 'That is only 2 sides. A rectangle has 4.'], [2 * w + h, 'EXECUTE', 'Count all four sides.']],
      hints: ['Perimeter means all the way around. How many sides?', 'A rectangle has 2 long sides and 2 short sides.', w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ?'],
      show: ['Sides: ' + w + ', ' + h + ', ' + w + ', ' + h + '.', w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ' + P + ' ' + u + '.'],
      bm: 'Sebuah segi empat tepat panjangnya ' + w + ' ' + u + ' dan lebarnya ' + h + ' ' + u + '. Berapakah perimeternya?', simple: 'The rectangle is ' + w + ' ' + u + ' by ' + h + ' ' + u + '. How far is it all the way around?' };
  } });

  T({ id: 'pe-square', skill: 'perimeter', level: 1, make: function (R) {
    var s = R.int(3, 12), u = R.pick(['cm', 'm']);
    return { text: 'A square has sides of ' + s + ' ' + u + '.\nWhat is its perimeter?', visual: { kind: 'rect', w: s, h: s, unit: u }, answer: 4 * s, fmt: function (x) { return x + ' ' + u; },
      wrong: [[s * s, 'CONCEPT', s + ' × ' + s + ' is the area. Perimeter goes around the edge.'], [2 * s, 'EXECUTE', 'A square has 4 sides, not 2.'], [3 * s, 'EXECUTE', 'Count all 4 sides.']],
      hints: ['How many sides does a square have?', 'All the sides of a square are equal. Perimeter adds them all.', s + ' + ' + s + ' + ' + s + ' + ' + s + ' = ?'],
      show: ['4 equal sides.', '4 × ' + s + ' = ' + 4 * s + ' ' + u + '.'], bm: 'Sebuah segi empat sama mempunyai sisi ' + s + ' ' + u + '. Berapakah perimeternya?', simple: 'Each side is ' + s + ' ' + u + '. How far all the way around?' };
  } });

  T({ id: 'pe-side', skill: 'perimeter', level: 3, make: function (R) {
    var s; do { s = R.int(3, 15); } while (s === 4);
    var P = 4 * s;
    return { text: 'A square photo frame has a perimeter of ' + P + ' cm.\nHow long is one side?', answer: s, fmt: function (x) { return x + ' cm'; },
      wrong: [[P / 2, 'EXECUTE', 'A square has 4 sides, not 2.'], [P - 4, 'PLAN', 'Share the perimeter equally between the 4 sides.'], [s + 2, 'EXECUTE', 'Check: 4 × your answer should be ' + P + '.']],
      hints: ['How many equal sides does a square have?', '4 equal sides make ' + P + ' cm. Which operation finds one side?', P + ' ÷ 4 = ?'],
      show: [P + ' ÷ 4 = ' + s + ' cm.'], bm: 'Sebuah bingkai gambar segi empat sama mempunyai perimeter ' + P + ' cm. Berapakah panjang satu sisi?', simple: 'All 4 sides together are ' + P + ' cm. How long is one side?',
      check: 'Check: 4 × ' + s + ' = ' + P + ' ✓' };
  } });

  T({ id: 'pe-missing', skill: 'perimeter', level: 3, make: function (R) {
    var l = R.int(6, 15), w; do { w = R.int(2, 10); } while (w === l);
    var P = 2 * (l + w);
    return { text: 'A rectangle has a perimeter of ' + P + ' cm.\nIts length is ' + l + ' cm.\nHow wide is it?', answer: w, fmt: function (x) { return x + ' cm'; },
      wrong: [[P - l, 'PLAN', 'The perimeter has two lengths, not one.'], [P - 2 * l, 'EXECUTE', 'That is both widths together. Halve it.'], [P / 4, 'PLAN', 'It is a rectangle, not a square.']],
      hints: ['The perimeter is length + width + length + width.', 'Take away both lengths from the perimeter.', P + ' − ' + l + ' − ' + l + ' = ' + (P - 2 * l) + '. That is two widths.'],
      show: [P + ' − ' + 2 * l + ' = ' + (P - 2 * l) + ' (two widths).', (P - 2 * l) + ' ÷ 2 = ' + w + ' cm.'],
      bm: 'Sebuah segi empat tepat mempunyai perimeter ' + P + ' cm. Panjangnya ' + l + ' cm. Berapakah lebarnya?', simple: 'All the way around is ' + P + ' cm. The long side is ' + l + ' cm. How long is the short side?',
      check: 'Check: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' ✓' };
  } });

  T({ id: 'pe-fence', skill: 'perimeter', level: 3, make: function (R) {
    var n = R.pick(['Encik Lim', 'Puan Rohani', 'Mr Kumar', 'Mak Cik Siti']), l = R.int(8, 25), w; do { w = R.int(4, 15); } while (w === l);
    var place = R.pick([['garden', 'kebun'], ['chicken coop', 'reban ayam'], ['vegetable plot', 'petak sayur']]), P = 2 * (l + w);
    return { text: n + ' puts a fence around a ' + place[0] + '.\nThe ' + place[0] + ' is ' + l + ' m long and ' + w + ' m wide.\nHow many metres of fence are needed?', visual: { kind: 'rect', w: l, h: w, unit: 'm' }, answer: P, fmt: function (x) { return x + ' m'; },
      wrong: [[l * w, 'PLAN', 'You found the area. A fence goes around the edge.'], [l + w, 'EXECUTE', 'That is two sides. Go all the way round.'], [P + 2, 'EXECUTE', 'Add the four sides again.']],
      hints: ['Does the fence go around the edge or cover the inside?', 'Around the edge means perimeter.', l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ?'],
      show: ['The fence goes around → perimeter.', l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' m.'],
      bm: n + ' memasang pagar di sekeliling ' + place[1] + '. Panjangnya ' + l + ' m dan lebarnya ' + w + ' m. Berapa meter pagar yang diperlukan?', simple: 'It is ' + l + ' m by ' + w + ' m. The fence goes all the way round. How long is the fence?' };
  } });

  /* ══════════ AREA ══════════ */
  T({ id: 'ar-grid', skill: 'area', level: 1, make: function (R) {
    var c = R.int(3, 6), r = R.int(2, 4);
    return { text: 'Each small square is 1 cm².\nWhat is the area of the shaded shape?', visual: { kind: 'grid', cols: c, rows: r }, answer: c * r, fmt: function (x) { return x + ' cm²'; },
      wrong: [[2 * (c + r), 'CONCEPT', 'You counted around the edge. Area counts the squares inside.'], [c + r, 'CONCEPT', 'You added the sides. Count all the squares.'], [c * r - 1, 'EXECUTE', 'Count the squares again carefully.']],
      hints: ['Area is the space inside. What can you count?', 'Count the shaded squares. Try counting by rows.', r + ' rows of ' + c + ' squares.'],
      show: [r + ' × ' + c + ' = ' + c * r + ' squares.', 'Area = ' + c * r + ' cm².'], bm: 'Setiap petak kecil ialah 1 cm². Berapakah luas bentuk berlorek?', simple: 'Count the coloured squares. Each one is 1 cm².' };
  } });

  T({ id: 'ar-rect', skill: 'area', level: 2, make: function (R) {
    var l = R.int(3, 12), w; do { w = R.int(2, 9); } while (w === l);
    return { text: 'A rectangle is ' + l + ' cm long and ' + w + ' cm wide.\nWhat is its area?', visual: { kind: 'rect', w: l, h: w, unit: 'cm', grid: l <= 10 }, answer: l * w + ' cm²',
      wrong: [[2 * (l + w) + ' cm²', 'PLAN', 'That is the perimeter. Area is the space inside.'], [(l + w) + ' cm²', 'PLAN', 'You added. Area multiplies length × width.'], [l * w + ' cm', 'CHECK', 'The number is right. Area uses square units.']],
      hints: ['Area is the space inside the rectangle.', 'Area of a rectangle = length × width.', l + ' × ' + w + ' = ? Check the unit too.'],
      show: ['Area = length × width.', l + ' × ' + w + ' = ' + l * w + ' cm².'], bm: 'Sebuah segi empat tepat panjangnya ' + l + ' cm dan lebarnya ' + w + ' cm. Berapakah luasnya?', simple: 'The rectangle is ' + l + ' cm by ' + w + ' cm. How much space is inside?' };
  } });

  T({ id: 'ar-ctx', skill: 'area', level: 3, make: function (R) {
    var sc = R.pick([['A classroom floor', 'Lantai bilik darjah', 'm'], ['A school field', 'Padang sekolah', 'm'], ['A notice board', 'Papan kenyataan', 'cm'], ['A carpet', 'Permaidani', 'm']]);
    var l = R.int(5, 12), w; do { w = R.int(3, 9); } while (w === l);
    return { text: sc[0] + ' is ' + l + ' ' + sc[2] + ' long and ' + w + ' ' + sc[2] + ' wide.\nWhat is its area?', answer: l * w, fmt: function (x) { return x + ' ' + sc[2] + '²'; },
      wrong: [[2 * (l + w), 'PLAN', 'That is the perimeter. Area is the space inside.'], [l * w - w, 'EXECUTE', 'Check: ' + l + ' × ' + w + '.'], [l + w, 'PLAN', 'Area multiplies, it does not add.']],
      hints: ['Is area the edge or the space inside?', 'Length × width.', l + ' × ' + w + ' = ?'],
      show: ['Area = ' + l + ' × ' + w + ' = ' + l * w + ' ' + sc[2] + '².'], bm: sc[1] + ' panjangnya ' + l + ' ' + sc[2] + ' dan lebarnya ' + w + ' ' + sc[2] + '. Berapakah luasnya?', simple: 'It is ' + l + ' by ' + w + '. How much space does it cover?' };
  } });

  var AP = [['cover a table top with cloth', 'area', 'menutup permukaan meja dengan kain'], ['put ribbon around the edge of a card', 'perimeter', 'meletakkan reben di sekeliling tepi kad'], ['paint a wall', 'area', 'mengecat dinding'], ['put a fence around a field', 'perimeter', 'memasang pagar di sekeliling padang'], ['cover the floor with tiles', 'area', 'menutup lantai dengan jubin'], ['put a frame around a picture', 'perimeter', 'memasang bingkai di sekeliling gambar']];
  T({ id: 'ar-which', skill: 'area', level: 3, make: function (R) {
    var sc = R.pick(AP), n = R.pick(NAMES), u = 'm', l = R.int(3, 8), w; do { w = R.int(2, 6); } while (w === l || l * w === 2 * (l + w));
    if (sc[0].indexOf('card') >= 0 || sc[0].indexOf('picture') >= 0 || sc[0].indexOf('table') >= 0) u = 'cm', l *= 10, w *= 10;
    var A = 'Area = ' + l * w + ' ' + u + '²', P = 'Perimeter = ' + 2 * (l + w) + ' ' + u;
    var ans = sc[1] === 'area' ? A : P, wr = sc[1] === 'area' ? P : A;
    return { text: n + ' wants to ' + sc[0] + '.\nIt is ' + l + ' ' + u + ' long and ' + w + ' ' + u + ' wide.\nWhich is correct?', answer: ans,
      wrong: [[wr, 'PLAN', sc[1] === 'area' ? 'Covering is about the space inside.' : 'Going around the edge is perimeter.'], [sc[1] === 'area' ? 'Area = ' + 2 * (l + w) + ' ' + u + '²' : 'Perimeter = ' + (l + w) + ' ' + u, 'EXECUTE', 'Check the calculation.'], [sc[1] === 'area' ? 'Area = ' + (l + w) + ' ' + u + '²' : 'Perimeter = ' + l * w + ' ' + u, 'EXECUTE', 'Check the calculation.']],
      hints: ['Is this about the edge, or the space inside?', sc[1] === 'area' ? 'Covering a surface is about the space inside: area.' : 'Going around the edge is perimeter.', sc[1] === 'area' ? 'Area = ' + l + ' × ' + w + '.' : 'Perimeter = ' + l + ' + ' + w + ' + ' + l + ' + ' + w + '.'],
      show: [sc[1] === 'area' ? 'Covering → area.' : 'Around the edge → perimeter.', ans + '.'],
      bm: n + ' ingin ' + sc[2] + '. Panjangnya ' + l + ' ' + u + ' dan lebarnya ' + w + ' ' + u + '. Yang manakah betul?', simple: 'Does ' + n + ' need the edge or the inside space? Pick the right one.',
      why: { q: 'How did you choose?', options: [sc[1] === 'area' ? 'Covering a surface needs the space inside' : 'Going around needs the distance around the edge', 'I picked the biggest number', 'Area and perimeter are the same'], answer: 0 } };
  } });

  /* ══════════ RATIO ══════════ */
  T({ id: 'ra-beads', skill: 'ratio', level: 1, make: function (R) {
    var a = R.int(1, 6), b; do { b = R.int(1, 6); } while (b === a);
    var c = R.pick([['red', 'blue', 'a', 'b'], ['yellow', 'red', 'c', 'a'], ['blue', 'yellow', 'b', 'c']]);
    return { text: 'There are ' + a + ' ' + c[0] + ' beads and ' + b + ' ' + c[1] + ' beads.\nWhat is the ratio of ' + c[0] + ' beads to ' + c[1] + ' beads?', visual: { kind: 'beads', groups: [{ n: a, tone: c[2], label: c[0] }, { n: b, tone: c[3], label: c[1] }] },
      answer: a + ' : ' + b, wrong: [[b + ' : ' + a, 'UNDERSTAND', 'The order matters. Which colour comes first in the question?'], [a + ' : ' + (a + b), 'CONCEPT', (a + b) + ' is all the beads. Compare the two colours.'], [(a + b) + ' : ' + b, 'CONCEPT', 'Compare the two colours, not the total.']],
      hints: ['Which colour is mentioned first?', 'In a ratio, the order follows the words.', 'Write the number of ' + c[0] + ', then “:”, then the number of ' + c[1] + '.'],
      show: [c[0] + ': ' + a + ', ' + c[1] + ': ' + b + '.', 'Ratio = ' + a + ' : ' + b + '.'], bm: 'Ada ' + a + ' manik ' + { red: 'merah', blue: 'biru', yellow: 'kuning' }[c[0]] + ' dan ' + b + ' manik ' + { red: 'merah', blue: 'biru', yellow: 'kuning' }[c[1]] + '. Apakah nisbahnya?', simple: c[0] + ': ' + a + '. ' + c[1] + ': ' + b + '. Write ' + c[0] + ' : ' + c[1] + '.' };
  } });

  var RA = [['cup of rice', 'cups of water', 'cups of rice', 'cawan beras', 'cawan air'], ['egg', 'spoons of sugar', 'eggs', 'biji telur', 'sudu gula'], ['table', 'chairs', 'tables', 'meja', 'kerusi'], ['car', 'wheels', 'cars', 'kereta', 'roda']];
  T({ id: 'ra-scale', skill: 'ratio', level: 2, make: function (R) {
    var r = R.pick(RA), b = r[1] === 'wheels' ? 4 : R.int(2, 5), m = R.int(2, 6);
    return { text: 'For every 1 ' + r[0] + ', there are ' + b + ' ' + r[1] + '.\nHow many ' + r[1] + ' are there for ' + m + ' ' + r[2] + '?',
      answer: b * m, wrong: [[b + m, 'PLAN', 'You added. Each one has its own ' + b + '.'], [b * m + b, 'EXECUTE', 'Count the groups again: ' + m + '.'], [m, 'UNDERSTAND', 'That is the first amount. We need the ' + r[1] + '.']],
      visual: { kind: 'ratioRows', a: r[0], b: r[1], ra: 1, rb: b, rows: 1 },
      hints: ['How many ' + r[1] + ' go with 1 ' + r[0] + '?', 'Each one gets its own ' + b + '. Make ' + m + ' groups.', m + ' × ' + b + ' = ?'],
      show: ['1 → ' + b + '.', m + ' → ' + m + ' × ' + b + ' = ' + b * m + '.'],
      bm: 'Bagi setiap 1 ' + r[3] + ', ada ' + b + ' ' + r[4] + '. Berapakah ' + r[4] + ' untuk ' + m + ' ' + r[3] + '?', simple: '1 has ' + b + '. ' + m + ' have how many?', check: 'Check: ' + b * m + ' ÷ ' + m + ' = ' + b + ' ✓' };
  } });

  T({ id: 'ra-order', skill: 'ratio', level: 2, make: function (R) {
    var g = R.int(8, 20), b; do { b = R.int(8, 20); } while (b === g);
    var boysFirst = R.chance(0.5);
    var x = boysFirst ? b : g, y = boysFirst ? g : b;
    return { text: 'In a class, there are ' + g + ' girls and ' + b + ' boys.\nWhat is the ratio of ' + (boysFirst ? 'boys to girls' : 'girls to boys') + '?', answer: x + ' : ' + y,
      wrong: [[y + ' : ' + x, 'UNDERSTAND', 'Check the order: ' + (boysFirst ? 'boys' : 'girls') + ' come first in the question.'], [x + ' : ' + (g + b), 'CONCEPT', (g + b) + ' is the whole class. Compare the two groups.'], [(g + b) + ' : ' + y, 'CONCEPT', 'Compare boys and girls, not the whole class.']],
      hints: ['Which group comes first in the question?', 'The ratio follows the order of the words.', 'Write the number of ' + (boysFirst ? 'boys' : 'girls') + ' first.'],
      show: [(boysFirst ? 'Boys ' + b + ', girls ' + g : 'Girls ' + g + ', boys ' + b) + '.', 'Ratio = ' + x + ' : ' + y + '.'],
      bm: 'Dalam sebuah kelas, ada ' + g + ' murid perempuan dan ' + b + ' murid lelaki. Apakah nisbah ' + (boysFirst ? 'lelaki kepada perempuan' : 'perempuan kepada lelaki') + '?', simple: 'Girls: ' + g + '. Boys: ' + b + '. Write ' + (boysFirst ? 'boys : girls' : 'girls : boys') + '.' };
  } });

  T({ id: 'ra-inverse', skill: 'ratio', level: 3, make: function (R) {
    var n = R.int(3, 8), boxes = R.int(3, 9), total = n * boxes;
    return { text: 'The ratio of boxes to pencils is 1 : ' + n + '.\nThere are ' + total + ' pencils.\nHow many boxes are there?', answer: boxes,
      wrong: [[total * n, 'PLAN', 'Each box holds ' + n + ' pencils. Make groups of ' + n + '.'], [total - n, 'PLAN', 'You subtracted. Think about groups of ' + n + '.'], [boxes + 1, 'EXECUTE', 'Check: boxes × ' + n + ' should be ' + total + '.']],
      hints: ['What does 1 : ' + n + ' tell us about one box?', 'Each box has ' + n + ' pencils. How many groups of ' + n + ' make ' + total + '?', total + ' ÷ ' + n + ' = ?'],
      show: ['1 box : ' + n + ' pencils.', total + ' ÷ ' + n + ' = ' + boxes + ' boxes.'],
      bm: 'Nisbah kotak kepada pensel ialah 1 : ' + n + '. Ada ' + total + ' batang pensel. Berapakah bilangan kotak?', simple: 'One box has ' + n + ' pencils. There are ' + total + ' pencils. How many boxes?', check: 'Check: ' + boxes + ' × ' + n + ' = ' + total + ' ✓' };
  } });

  /* ══════════ DATA ══════════ */
  var PICTO = [
    { title: 'Books read this month', icon: '📕', unit: 'books', labels: ['Aina', 'Bala', 'Chen', 'Devi'], bm: 'buku', verb: 'read', q: function (l) { return 'How many books did ' + l + ' read?'; }, qb: function (l) { return 'Berapakah buku yang dibaca oleh ' + l + '?'; } },
    { title: 'Durians sold', icon: '●', unit: 'durians', labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], bm: 'durian', q: function (l) { return 'How many durians were sold on ' + l + '?'; }, qb: function (l) { return 'Berapakah durian yang dijual pada hari ' + { Monday: 'Isnin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Khamis' }[l] + '?'; } },
    { title: 'Bottles collected for recycling', icon: '🧴', unit: 'bottles', labels: ['4 Bestari', '4 Cemerlang', '4 Dinamik', '4 Gemilang'], bm: 'botol', q: function (l) { return 'How many bottles did ' + l + ' collect?'; }, qb: function (l) { return 'Berapakah botol yang dikumpul oleh kelas ' + l + '?'; } }
  ];
  function pictoData(R, keyChoices) {
    var p = R.pick(PICTO), key = R.pick(keyChoices), rows = p.labels.slice(0, R.int(3, 4)).map(function (l) { return [l, R.int(1, 6)]; });
    return { p: p, key: key, rows: rows, visual: { kind: 'picto', title: p.title, icon: p.icon, key: key, unit: p.unit, rows: rows } };
  }
  T({ id: 'da-picto', skill: 'data', level: 2, make: function (R) {
    var d = pictoData(R, [2, 5, 10]), row = R.pick(d.rows), ans = row[1] * d.key;
    return { text: 'The pictograph shows ' + d.p.title.toLowerCase() + '.\n' + d.p.q(row[0]), visual: d.visual, answer: ans, step: d.key,
      wrong: [[row[1], 'CHECK', 'You counted the pictures. Check the key: each picture means ' + d.key + '.'], [row[1] + d.key, 'EXECUTE', 'Each picture is ' + d.key + ', so multiply, don’t add.'], [ans + d.key, 'EXECUTE', 'Count the pictures again.']],
      hints: ['Look at the key. What does one picture represent?', 'One picture = ' + d.key + ' ' + d.p.unit + '. Count the pictures for ' + row[0] + '.', row[1] + ' pictures × ' + d.key + ' = ?'],
      show: ['Key: 1 picture = ' + d.key + ' ' + d.p.unit + '.', row[0] + ': ' + row[1] + ' × ' + d.key + ' = ' + ans + '.'],
      bm: 'Piktograf menunjukkan data ' + d.p.bm + '. ' + d.p.qb(row[0]), simple: 'Find ' + row[0] + '. Each picture means ' + d.key + '. How many?',
      why: { q: 'Why did you multiply by ' + d.key + '?', options: ['The key says each picture represents ' + d.key, 'Because there are ' + d.key + ' rows', 'Because big numbers are better'], answer: 0 } };
  } });

  T({ id: 'da-picto-diff', skill: 'data', level: 3, make: function (R) {
    var d = pictoData(R, [2, 5, 10]), rs = R.shuffle(d.rows), a = rs[0], b = rs[1];
    if (a[1] === b[1]) a = [a[0], a[1] + 1], d.rows.forEach(function (r) { if (r[0] === a[0]) r[1] = a[1]; });
    var hi = a[1] > b[1] ? a : b, lo = hi === a ? b : a, ans = (hi[1] - lo[1]) * d.key;
    return { text: 'Look at the pictograph.\nHow many more ' + d.p.unit + ' did ' + hi[0] + ' have than ' + lo[0] + '?', visual: d.visual, answer: ans, step: d.key, keepWords: ['than'],
      wrong: [[hi[1] - lo[1], 'CHECK', 'That is the number of pictures. Use the key: each picture is ' + d.key + '.'], [(hi[1] + lo[1]) * d.key, 'UNDERSTAND', 'You added. “How many more” compares.'], [hi[1] * d.key, 'UNDERSTAND', 'That is only ' + hi[0] + '. Compare it with ' + lo[0] + '.']],
      hints: ['We are comparing two rows. Which two?', 'Find each row using the key, then compare.', hi[0] + ': ' + hi[1] + ' × ' + d.key + '. ' + lo[0] + ': ' + lo[1] + ' × ' + d.key + '. Find the difference.'],
      show: [hi[0] + ': ' + hi[1] * d.key + '. ' + lo[0] + ': ' + lo[1] * d.key + '.', hi[1] * d.key + ' − ' + lo[1] * d.key + ' = ' + ans + '.'],
      bm: 'Lihat piktograf. Berapa banyak lagi ' + d.p.bm + ' ' + hi[0] + ' berbanding ' + lo[0] + '?', simple: 'How much bigger is ' + hi[0] + '’s number than ' + lo[0] + '’s?' };
  } });

  var TABLES = [{ head: ['Drink', 'Pupils'], rows: ['Milo', 'Teh tarik', 'Sirap', 'Soya'], what: 'favourite drinks of some pupils', bm: 'minuman kegemaran murid' }, { head: ['Sport', 'Pupils'], rows: ['Football', 'Badminton', 'Netball', 'Swimming'], what: 'favourite sports of some pupils', bm: 'sukan kegemaran murid' }, { head: ['Fruit', 'Pupils'], rows: ['Mango', 'Durian', 'Rambutan', 'Banana'], what: 'favourite fruits of some pupils', bm: 'buah kegemaran murid' }];
  function tableData(R) {
    var t = R.pick(TABLES), n = R.int(3, 4), vals = [];
    while (vals.length < n) { var v = R.int(5, 30); if (vals.indexOf(v) < 0) vals.push(v); }
    return { t: t, rows: t.rows.slice(0, n).map(function (r, i) { return [r, vals[i]]; }) };
  }
  T({ id: 'da-table-total', skill: 'data', level: 3, make: function (R) {
    var d = tableData(R), sum = d.rows.reduce(function (s, r) { return s + r[1]; }, 0);
    return { text: 'The table shows the ' + d.t.what + '.\nHow many pupils were asked altogether?', visual: { kind: 'table', head: d.t.head, rows: d.rows }, answer: sum,
      wrong: [[sum - d.rows[d.rows.length - 1][1], 'EXECUTE', 'Did you add every row?'], [Math.max.apply(null, d.rows.map(function (r) { return r[1]; })), 'UNDERSTAND', 'That is only one row. “Altogether” means add them all.'], [sum + 10, 'EXECUTE', 'Check the adding.']],
      hints: ['“Altogether” means all the groups together.', 'Add all the numbers in the Pupils column.', 'Look for pairs that are easy to add first.'],
      show: [d.rows.map(function (r) { return r[1]; }).join(' + ') + ' = ' + sum + '.'], bm: 'Jadual menunjukkan ' + d.t.bm + '. Berapakah jumlah keseluruhan murid?', simple: 'Add all the pupils in the table.' };
  } });

  T({ id: 'da-table-most', skill: 'data', level: 2, make: function (R) {
    var d = tableData(R), most = R.chance(0.6), sorted = d.rows.slice().sort(function (a, b) { return most ? b[1] - a[1] : a[1] - b[1]; });
    return { text: 'The table shows the ' + d.t.what + '.\nWhich is the ' + (most ? 'most popular' : 'least popular') + '?', visual: { kind: 'table', head: d.t.head, rows: d.rows }, answer: sorted[0][0],
      wrong: sorted.slice(1).map(function (r) { return [r[0], 'UNDERSTAND', most ? 'Most popular has the biggest number.' : 'Least popular has the smallest number.']; }),
      hints: [(most ? 'Most' : 'Least') + ' popular means chosen by the ' + (most ? 'most' : 'fewest') + ' pupils.', 'Look at the Pupils column.', 'Find the ' + (most ? 'biggest' : 'smallest') + ' number.'],
      show: ['The ' + (most ? 'biggest' : 'smallest') + ' number is ' + sorted[0][1] + ' → ' + sorted[0][0] + '.'], bm: 'Yang manakah paling ' + (most ? 'digemari' : 'kurang digemari') + '?', simple: 'Which did the ' + (most ? 'most' : 'fewest') + ' pupils choose?' };
  } });

  T({ id: 'da-bar', skill: 'data', level: 2, make: function (R) {
    var step = R.pick([2, 5, 10]), labels = R.pick([['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Red', 'Blue', 'Green', 'Yellow'], ['4A', '4B', '4C', '4D']]);
    var bars = labels.map(function (l) { return [l, step * R.int(1, 8)]; }), what = R.pick([['Cupcakes sold at the school canteen', 'cupcakes'], ['Votes for favourite colour', 'votes'], ['Library books borrowed', 'books']]);
    var two = R.shuffle(bars).slice(0, 2), hi = two[0][1] >= two[1][1] ? two[0] : two[1], lo = hi === two[0] ? two[1] : two[0];
    if (hi[1] === lo[1]) hi = [hi[0], hi[1] + step], bars.forEach(function (b) { if (b[0] === hi[0]) b[1] = hi[1]; });
    var ask = R.chance(0.5);
    var vis = { kind: 'barchart', title: what[0], bars: bars, step: step };
    if (ask) return { text: 'Look at the bar chart.\nHow many ' + what[1] + ' were there for ' + hi[0] + '?', visual: vis, answer: hi[1], step: step,
      wrong: [[hi[1] - step, 'EXECUTE', 'Read the top of the bar across to the scale.'], [hi[1] / step, 'CHECK', 'Check the scale: each line is ' + step + '.'], [hi[1] + step, 'EXECUTE', 'Read the top of the bar carefully.']],
      hints: ['Find the bar for ' + hi[0] + '.', 'Look at the scale on the side. Each line goes up by ' + step + '.', 'Read across from the top of the bar to the scale.'],
      show: ['The bar for ' + hi[0] + ' reaches ' + hi[1] + '.'], bm: 'Lihat carta palang. Berapakah nilai bagi ' + hi[0] + '?', simple: 'How tall is the ' + hi[0] + ' bar?' };
    return { text: 'Look at the bar chart.\nHow many more ' + what[1] + ' were there for ' + hi[0] + ' than for ' + lo[0] + '?', visual: vis, answer: hi[1] - lo[1], step: step, keepWords: ['than'],
      wrong: [[hi[1] + lo[1], 'UNDERSTAND', 'You added. “How many more” compares.'], [hi[1], 'UNDERSTAND', 'That is one bar. Compare the two bars.'], [(hi[1] - lo[1]) / step, 'CHECK', 'Check the scale: each line is ' + step + '.']],
      hints: ['We are comparing two bars. Which two?', 'Read each bar using the scale.', hi[0] + ' is ' + hi[1] + ', ' + lo[0] + ' is ' + lo[1] + '. Find the difference.'],
      show: [hi[1] + ' − ' + lo[1] + ' = ' + (hi[1] - lo[1]) + '.'], bm: 'Lihat carta palang. Berapa banyak lagi bagi ' + hi[0] + ' berbanding ' + lo[0] + '?', simple: 'How much taller is the ' + hi[0] + ' bar than the ' + lo[0] + ' bar?' };
  } });

  /* ══════════ SHAPES & ANGLES ══════════ */
  var SOLIDS = [['cube', 6, 12, 8, 'kubus'], ['cuboid', 6, 12, 8, 'kuboid'], ['square-based pyramid', 5, 8, 5, 'piramid tapak segi empat sama'], ['triangular prism', 5, 9, 6, 'prisma segi tiga']];
  T({ id: 'sh-solid', skill: 'shapes', level: 1, make: function (R) {
    var s = R.pick(SOLIDS), k = R.int(1, 3), prop = ['', 'faces', 'edges', 'vertices'][k], v = s[k];
    var others = [s[1], s[2], s[3]].filter(function (x) { return x !== v; });
    return { text: 'How many ' + prop + ' does a ' + s[0] + ' have?', visual: { kind: 'solid', shape: s[0] }, answer: v,
      wrong: others.map(function (o) { return [o, 'CONCEPT', 'Check which part we are counting: faces are flat surfaces, edges are lines, vertices are corners.']; }),
      hints: ['What are ' + prop + '? ' + { faces: 'Faces are the flat surfaces.', edges: 'Edges are where two faces meet.', vertices: 'Vertices are the corners.' }[prop], 'Imagine holding a ' + s[0] + '. Count the ' + prop + ' on the front first.', 'Then count the back and the sides. Don’t count any twice.'],
      show: ['A ' + s[0] + ' has ' + s[1] + ' faces, ' + s[2] + ' edges and ' + s[3] + ' vertices.'],
      bm: 'Berapakah bilangan ' + { faces: 'permukaan', edges: 'tepi', vertices: 'bucu' }[prop] + ' bagi sebuah ' + s[4] + '?', simple: 'Count the ' + prop + ' of a ' + s[0] + '.' };
  } });

  T({ id: 'sh-angle', skill: 'shapes', level: 2, make: function (R) {
    var kind = R.pick(['right', 'smaller', 'bigger']), deg = kind === 'right' ? 90 : kind === 'smaller' ? R.mult(25, 70, 5) : R.mult(110, 160, 5);
    var opts = { right: 'A right angle', smaller: 'Smaller than a right angle', bigger: 'Bigger than a right angle' };
    return { text: 'Look at the angle.\nIs it a right angle, smaller than a right angle, or bigger than a right angle?', visual: { kind: 'angle', deg: deg }, answer: opts[kind], count: 3, order: [opts.smaller, opts.right, opts.bigger],
      wrong: Object.keys(opts).filter(function (k) { return k !== kind; }).map(function (k) { return [opts[k], 'CONCEPT', 'A right angle is a square corner, like the corner of a book. Compare with that.']; }),
      hints: ['A right angle looks like the corner of a book or a square.', 'Imagine putting the corner of a book on the angle.', 'Is the opening wider or narrower than the book’s corner?'],
      show: ['This angle is ' + (kind === 'right' ? 'a square corner: a right angle.' : kind === 'smaller' ? 'narrower than a square corner.' : 'wider than a square corner.')],
      bm: 'Lihat sudut ini. Adakah ia sudut tegak, lebih kecil daripada sudut tegak, atau lebih besar daripada sudut tegak?', simple: 'Compare the angle with the corner of a book.' };
  } });

  T({ id: 'sh-lines', skill: 'shapes', level: 2, make: function (R) {
    var kind = R.pick(['parallel', 'perpendicular', 'neither']);
    var opts = { parallel: 'Parallel', perpendicular: 'Perpendicular', neither: 'Neither' };
    return { text: 'Look at the two lines.\nAre they parallel, perpendicular, or neither?', visual: { kind: 'lines', type: kind, rot: R.int(-20, 20) }, answer: opts[kind], count: 3, order: ['Parallel', 'Perpendicular', 'Neither'],
      wrong: Object.keys(opts).filter(function (k) { return k !== kind; }).map(function (k) { return [opts[k], 'CONCEPT', 'Parallel lines never meet. Perpendicular lines meet at a right angle.']; }),
      hints: ['Do the lines meet, or would they meet if they were longer?', 'Parallel lines stay the same distance apart and never meet.', 'If they meet, is it at a square corner? That is perpendicular.'],
      show: [kind === 'parallel' ? 'They stay the same distance apart: parallel.' : kind === 'perpendicular' ? 'They meet at a right angle: perpendicular.' : 'They meet, but not at a right angle: neither.'],
      bm: 'Lihat dua garis ini. Adakah garis itu selari, serenjang, atau bukan kedua-duanya?', simple: 'Do the lines meet? If they meet, is it a square corner?' };
  } });

  T({ id: 'sh-sides', skill: 'shapes', level: 1, make: function (R) {
    var s = R.pick([['triangle', 3, 'segi tiga'], ['pentagon', 5, 'pentagon'], ['hexagon', 6, 'heksagon'], ['octagon', 8, 'oktagon'], ['rectangle', 4, 'segi empat tepat']]);
    return { text: 'How many sides does a ' + s[0] + ' have?', visual: { kind: 'polygon', sides: s[1] }, answer: s[1],
      wrong: [[s[1] + 1, 'EXECUTE', 'Count the sides again, one by one.'], [s[1] - 1, 'EXECUTE', 'Count the sides again, one by one.'], [s[1] * 2, 'CONCEPT', 'Count the straight sides only.']],
      hints: ['Look at the shape.', 'Put your finger on one side and count around.', 'Stop when you get back to the start.'],
      show: ['A ' + s[0] + ' has ' + s[1] + ' sides.'], bm: 'Berapakah bilangan sisi bagi sebuah ' + s[2] + '?', simple: 'Count the sides of the ' + s[0] + '.' };
  } });

  /* ══════════ COORDINATES ══════════ */
  function pt(x, y) { return '(' + x + ', ' + y + ')'; }
  T({ id: 'co-read', skill: 'coordinates', level: 1, make: function (R) {
    var x, y; do { x = R.int(1, 6); y = R.int(1, 6); } while (x === y);
    return { text: 'Look at the grid.\nWhat are the coordinates of point A?', visual: { kind: 'coord', points: [['A', x, y]] }, answer: pt(x, y),
      wrong: [[pt(y, x), 'UNDERSTAND', 'Go across first, then up.'], [pt(x + 1, y), 'EXECUTE', 'Count the grid lines from 0.'], [pt(x, y - 1 || y + 1), 'EXECUTE', 'Count the lines going up from 0.']],
      hints: ['Start at 0, the corner where the two number lines meet.', 'Go across first. How far across is A?', 'Then go up. Write (across, up).'],
      show: ['Across: ' + x + '. Up: ' + y + '.', 'A = ' + pt(x, y) + '.'], bm: 'Lihat grid. Apakah koordinat titik A?', simple: 'How far across and how far up is A?' };
  } });

  T({ id: 'co-find', skill: 'coordinates', level: 2, make: function (R) {
    var x, y; do { x = R.int(1, 6); y = R.int(1, 6); } while (x === y);
    var letters = R.shuffle(['P', 'Q', 'R', 'S']), used = {}, pts = [[letters[0], x, y], [letters[1], y, x]];
    used[x + ',' + y] = used[y + ',' + x] = 1;
    [letters[2], letters[3]].forEach(function (l) { var a, b; do { a = R.int(0, 6); b = R.int(0, 6); } while (used[a + ',' + b]); used[a + ',' + b] = 1; pts.push([l, a, b]); });
    return { text: 'Which point is at ' + pt(x, y) + '?', visual: { kind: 'coord', points: pts }, answer: letters[0], order: ['P', 'Q', 'R', 'S'],
      wrong: [[letters[1], 'UNDERSTAND', 'Go across first (' + x + '), then up (' + y + ').'], [letters[2], 'EXECUTE', 'Count the grid lines carefully from 0.'], [letters[3], 'EXECUTE', 'Count the grid lines carefully from 0.']],
      hints: ['The first number is how far across.', 'Go across ' + x + ' from 0.', 'Now go up ' + y + '. Which point is there?'],
      show: ['Across ' + x + ', up ' + y + ' → point ' + letters[0] + '.'], bm: 'Titik manakah berada pada ' + pt(x, y) + '?', simple: 'Go across ' + x + ', then up ' + y + '. Which letter is there?' };
  } });

  T({ id: 'co-move', skill: 'coordinates', level: 3, make: function (R) {
    var x = R.int(0, 3), y = R.int(0, 3), r = R.int(1, 3), u; do { u = R.int(1, 3); } while (u === r);
    return { text: 'A robot starts at ' + pt(x, y) + '.\nIt moves ' + r + ' units right and ' + u + ' units up.\nWhere is the robot now?', visual: { kind: 'coord', points: [['Start', x, y]] }, answer: pt(x + r, y + u),
      wrong: [[pt(x + u, y + r), 'UNDERSTAND', 'Right changes the first number. Up changes the second.'], [pt(x + r, y), 'EXECUTE', 'Don’t forget to move up too.'], [pt(Math.max(0, x - r), y + u), 'EXECUTE', 'Right means the first number gets bigger.']],
      hints: ['Which number changes when you move right?', 'Moving right adds to the first number. Moving up adds to the second.', (x) + ' + ' + r + ' = ?, and ' + y + ' + ' + u + ' = ?'],
      show: ['Right ' + r + ': ' + x + ' + ' + r + ' = ' + (x + r) + '.', 'Up ' + u + ': ' + y + ' + ' + u + ' = ' + (y + u) + '.', 'New point: ' + pt(x + r, y + u) + '.'],
      bm: 'Sebuah robot bermula di ' + pt(x, y) + '. Ia bergerak ' + r + ' unit ke kanan dan ' + u + ' unit ke atas. Di manakah robot itu sekarang?', simple: 'Start at ' + pt(x, y) + '. Go right ' + r + ', then up ' + u + '. Where are you?' };
  } });

  T({ id: 'co-dist', skill: 'coordinates', level: 3, make: function (R) {
    var y = R.int(1, 5), x1 = R.int(0, 2), x2 = R.int(x1 + 2, 6);
    return { text: 'Point A is at ' + pt(x1, y) + '.\nPoint B is at ' + pt(x2, y) + '.\nHow many units apart are A and B?', visual: { kind: 'coord', points: [['A', x1, y], ['B', x2, y]] }, answer: x2 - x1,
      wrong: [[x1 + x2, 'PLAN', 'You added. Find the gap between them.'], [x2, 'UNDERSTAND', 'That is where B is. Count from A to B.'], [x2 - x1 + 1, 'EXECUTE', 'Count the jumps, not the dots.']],
      hints: ['Both points are at the same height. Only the first number changes.', 'Count the jumps from ' + x1 + ' to ' + x2 + '.', x2 + ' − ' + x1 + ' = ?'],
      show: [x2 + ' − ' + x1 + ' = ' + (x2 - x1) + ' units.'], bm: 'Titik A di ' + pt(x1, y) + ' dan titik B di ' + pt(x2, y) + '. Berapa unit jarak antara A dan B?', simple: 'How many jumps from A to B?' };
  } });

  /* ══════════ MULTI-STEP (Mini Boss) ══════════ */
  T({ id: 'wp-change', skill: 'word-problems', level: 4, related: ['money', 'times-divide'], make: function (R) {
    var n = R.pick(NAMES), it = R.pick([['shirts', 'helai baju'], ['storybooks', 'buah buku cerita'], ['packets of nasi lemak', 'bungkus nasi lemak'], ['notebooks', 'buah buku nota']]);
    var q = R.int(2, 4), p, P; do { p = R.mult(250, 1590, 10); P = R.pick([2000, 5000, 10000]); } while (p * q >= P - 100 || p % 100 === 0);
    var cost = p * q, ans = P - cost;
    return { text: n + ' buys ' + q + ' ' + it[0] + ' at ' + rm(p) + ' each.\n' + n + ' pays with ' + rm(P) + '.\nHow much change does ' + n + ' get?', answer: ans, fmt: rm, keepWords: ['each'],
      wrong: [[P - p, 'PLAN', 'You took away only one. ' + n + ' buys ' + q + '.'], [cost, 'UNDERSTAND', 'That is the cost. The question asks for the change.'], [ans + 100, 'EXECUTE', 'Check the subtraction.']],
      hints: ['WHAT? We need the change. What must we know first?', 'HOW? Step 1: find the cost of ' + q + '. Step 2: take it from ' + rm(P) + '.', 'DO: ' + q + ' × ' + rm(p) + ' = ' + rm(cost) + '. Now find the change from ' + rm(P) + '.'],
      show: ['Step 1: ' + q + ' × ' + rm(p) + ' = ' + rm(cost) + '.', 'Step 2: ' + rm(P) + ' − ' + rm(cost) + ' = ' + rm(ans) + '.'],
      bm: n + ' membeli ' + q + ' ' + it[1] + ' dengan harga ' + rm(p) + ' setiap satu. ' + n + ' membayar dengan ' + rm(P) + '. Berapakah baki wang yang diterima?', simple: 'One costs ' + rm(p) + '. ' + n + ' takes ' + q + '. ' + n + ' gives ' + rm(P) + '. How much money comes back?',
      check: 'Check: ' + rm(cost) + ' + ' + rm(ans) + ' = ' + rm(P) + ' ✓' };
  } });

  T({ id: 'wp-save', skill: 'word-problems', level: 4, related: ['money', 'decimals'], make: function (R) {
    var n = R.pick(NAMES), s = R.int(3, 12), w = R.int(4, 9), saved = s * w * 100, sp; do { sp = R.mult(550, saved - 300, 10); } while (sp % 100 === 0);
    var ans = saved - sp;
    return { text: n + ' saves RM' + s + ' every week.\nAfter ' + w + ' weeks, ' + n + ' spends ' + rm(sp) + ' on a gift.\nHow much money does ' + n + ' have now?', answer: ans, fmt: rm,
      wrong: [[saved + sp, 'UNDERSTAND', 'Spending makes the money smaller.'], [saved, 'UNDERSTAND', 'That is the money saved. ' + n + ' spends some after that.'], [ans + 100, 'EXECUTE', 'Check the subtraction.']],
      hints: ['WHAT? Money at the end. What happens first, and what happens next?', 'HOW? Step 1: total saved in ' + w + ' weeks. Step 2: take away the gift.', 'DO: ' + w + ' × RM' + s + ' = ' + rm(saved) + '. Now ' + rm(saved) + ' − ' + rm(sp) + '.'],
      show: ['Saved: ' + w + ' × RM' + s + ' = ' + rm(saved) + '.', rm(saved) + ' − ' + rm(sp) + ' = ' + rm(ans) + '.'],
      bm: n + ' menyimpan RM' + s + ' setiap minggu. Selepas ' + w + ' minggu, ' + n + ' membelanjakan ' + rm(sp) + ' untuk hadiah. Berapakah wang ' + n + ' sekarang?', simple: n + ' keeps RM' + s + ' each week for ' + w + ' weeks. Then ' + n + ' uses ' + rm(sp) + '. How much is still there?',
      check: 'Check: ' + rm(ans) + ' + ' + rm(sp) + ' = ' + rm(saved) + ' ✓' };
  } });

  T({ id: 'wp-fracleft', skill: 'word-problems', level: 4, related: ['fractions', 'add-sub'], make: function (R) {
    var n = R.pick(NAMES), d = R.pick([3, 4, 5, 6]), k = R.int(1, d - 1), m = R.int(4, 12), t = d * m, give = k * m, ans = t - give;
    var thing = R.pick([['marbles', 'guli'], ['stickers', 'pelekat'], ['sweets', 'gula-gula']]);
    return { text: n + ' has ' + t + ' ' + thing[0] + '.\n' + n + ' gives ' + k + '/' + d + ' of them to a friend.\nHow many ' + thing[0] + ' does ' + n + ' have left?', answer: ans, keepWords: ['of', 'left'],
      wrong: [[give, 'UNDERSTAND', give + ' is what was given away. The question asks what is left.'], [t - k, 'CONCEPT', k + '/' + d + ' of ' + t + ' is not ' + k + '. Share ' + t + ' into ' + d + ' groups.'], [t + give, 'UNDERSTAND', 'Giving away makes it less.']],
      hints: ['WHAT? We need what ' + n + ' still has.', 'HOW? Step 1: find ' + k + '/' + d + ' of ' + t + '. Step 2: take that away from ' + t + '.', 'DO: ' + t + ' ÷ ' + d + ' = ' + m + ', so ' + k + '/' + d + ' = ' + give + '. Now ' + t + ' − ' + give + '.'],
      show: [k + '/' + d + ' of ' + t + ' = ' + give + '.', t + ' − ' + give + ' = ' + ans + '.'],
      bm: n + ' ada ' + t + ' ' + thing[1] + '. ' + n + ' memberi ' + k + '/' + d + ' daripadanya kepada kawan. Berapakah baki ' + thing[1] + ' ' + n + '?', simple: n + ' has ' + t + '. ' + n + ' gives away ' + k + '/' + d + '. How many are still with ' + n + '?',
      check: 'Check: ' + ans + ' + ' + give + ' = ' + t + ' ✓' };
  } });

  T({ id: 'wp-time', skill: 'word-problems', level: 4, related: ['duration', 'time24'], make: function (R) {
    var n = R.pick(NAMES), s = R.int(8, 15) * 60 + R.mult(0, 45, 15), a = R.mult(25, 70, 5), b = R.mult(20, 55, 5), e = s + a + b;
    return { text: n + ' starts homework at ' + t24(s) + '.\nMaths takes ' + a + ' minutes.\nThen English takes ' + b + ' minutes.\nWhat time does ' + n + ' finish?', answer: t24(e),
      wrong: [[t24(s + a), 'PLAN', 'That is after Maths only. Add English too.'], [t24(s + a + b + 40), 'CONCEPT', '60 minutes make 1 hour, not 100.'], [t24(e - 60), 'EXECUTE', 'Check the hour.']],
      hints: ['WHAT? We need the finishing time.', 'HOW? Add both times together, then add them to the start time.', 'DO: ' + a + ' + ' + b + ' = ' + (a + b) + ' minutes = ' + dur(a + b) + '. Add that to ' + t24(s) + '.'],
      show: [a + ' + ' + b + ' = ' + (a + b) + ' minutes = ' + dur(a + b) + '.', t24(s) + ' + ' + dur(a + b) + ' = ' + t24(e) + '.'],
      bm: n + ' mula membuat kerja rumah pada jam ' + t24(s).slice(0, 4) + '. Matematik mengambil masa ' + a + ' minit. Kemudian Bahasa Inggeris mengambil masa ' + b + ' minit. Pukul berapakah ' + n + ' selesai?', simple: 'Start: ' + t24(s) + '. ' + a + ' minutes, then ' + b + ' minutes more. When does ' + n + ' finish?' };
  } });

  T({ id: 'wp-fencecost', skill: 'word-problems', level: 4, related: ['perimeter', 'times-divide'], make: function (R) {
    var l = R.int(5, 12), w; do { w = R.int(3, 8); } while (w === l);
    var c = R.int(2, 6), P = 2 * (l + w), ans = P * c;
    return { text: 'A garden is ' + l + ' m long and ' + w + ' m wide.\nFencing costs RM' + c + ' for each metre.\nHow much does it cost to fence around the whole garden?', visual: { kind: 'rect', w: l, h: w, unit: 'm' }, answer: ans, fmt: function (x) { return 'RM' + x; }, keepWords: ['each'],
      wrong: [[l * w * c, 'PLAN', 'You used the area. A fence goes around the edge.'], [P, 'UNDERSTAND', P + ' m is the length of fence. Now find the cost.'], [(l + w) * c, 'EXECUTE', 'Go all the way around: 4 sides.']],
      hints: ['WHAT? We need a cost. What must we measure first?', 'HOW? Step 1: find the perimeter. Step 2: multiply by RM' + c + '.', 'DO: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' m. Now ' + P + ' × RM' + c + '.'],
      show: ['Perimeter: ' + P + ' m.', 'Cost: ' + P + ' × RM' + c + ' = RM' + ans + '.'],
      bm: 'Sebuah kebun panjangnya ' + l + ' m dan lebarnya ' + w + ' m. Pagar berharga RM' + c + ' bagi setiap meter. Berapakah kos memagar sekeliling kebun itu?', simple: 'The garden is ' + l + ' m by ' + w + ' m. 1 m of fence costs RM' + c + '. The fence goes all around. How much money?' };
  } });

  T({ id: 'wp-shareleft', skill: 'word-problems', level: 4, related: ['times-divide', 'add-sub'], make: function (R) {
    var n = R.pick(NAMES), g = R.int(3, 6), each = R.int(3, 8), eat = R.int(2, 9), t = g * each + eat;
    return { text: 'Mak bakes ' + t + ' cookies.\nThe family eats ' + eat + ' cookies.\n' + n + ' shares the rest equally among ' + g + ' friends.\nHow many cookies does each friend get?', answer: each, keepWords: ['each'],
      wrong: [[Math.floor(t / g), 'PLAN', 'First take away the cookies eaten. Then share.'], [t - eat, 'UNDERSTAND', 'That is the cookies left to share. Now share them.'], [each + 1, 'EXECUTE', 'Check: ' + g + ' × your answer should be ' + (t - eat) + '.']],
      hints: ['WHAT? We need the cookies for one friend.', 'HOW? Step 1: cookies left after eating. Step 2: share them equally.', 'DO: ' + t + ' − ' + eat + ' = ' + (t - eat) + '. Now ' + (t - eat) + ' ÷ ' + g + '.'],
      show: [t + ' − ' + eat + ' = ' + (t - eat) + '.', (t - eat) + ' ÷ ' + g + ' = ' + each + '.'],
      bm: 'Mak membakar ' + t + ' keping biskut. Keluarga makan ' + eat + ' keping. ' + n + ' berkongsi bakinya sama rata dengan ' + g + ' orang kawan. Berapakah biskut setiap kawan?', simple: t + ' cookies. ' + eat + ' are eaten. The rest go to ' + g + ' friends, the same number each. How many for one friend?',
      check: 'Check: ' + g + ' × ' + each + ' + ' + eat + ' = ' + t + ' ✓' };
  } });

  T({ id: 'wp-sales', skill: 'word-problems', level: 4, related: ['money', 'data'], make: function (R) {
    var p = R.pick([[150, 'Roti canai'], [120, 'Curry puffs'], [250, 'Kuih lapis packs'], [180, 'Banana fritters']]), a = R.int(12, 30), b = R.int(10, 30), ans = (a + b) * p[0];
    return { text: 'The canteen sells ' + p[1].toLowerCase() + ' at ' + rm(p[0]) + ' each.', visual: { kind: 'table', head: ['Day', 'Sold'], rows: [['Monday', a], ['Tuesday', b]] }, answer: ans, fmt: rm, keepWords: ['each'],
      wrong: [[a * p[0], 'PLAN', 'That is Monday only. Add Tuesday too.'], [(a + b) * 100, 'EXECUTE', 'Each one costs ' + rm(p[0]) + ', not RM1.'], [b * p[0], 'PLAN', 'That is Tuesday only. Add Monday too.']],
      hints: ['WHAT? We need the money from both days.', 'HOW? Step 1: total sold. Step 2: multiply by the price.', 'DO: ' + a + ' + ' + b + ' = ' + (a + b) + '. Now ' + (a + b) + ' × ' + rm(p[0]) + '.'],
      show: [a + ' + ' + b + ' = ' + (a + b) + ' sold.', (a + b) + ' × ' + rm(p[0]) + ' = ' + rm(ans) + '.'],
      bm: 'Kantin menjual ' + p[1].toLowerCase() + ' dengan harga ' + rm(p[0]) + ' setiap satu. Jadual menunjukkan jualan. Berapakah jumlah wang yang diterima pada hari Isnin dan Selasa?', simple: 'Add the two days. Then find the money.' };
  } });

  T({ id: 'wp-ribbon', skill: 'word-problems', level: 4, related: ['measure', 'times-divide'], make: function (R) {
    var piece = R.pick([20, 25, 40, 50]), count = R.int(3, 9), L = piece * count, n = R.pick(NAMES);
    var Lm = L % 100 === 0 ? (L / 100) + ' m' : (L / 100).toFixed(L % 10 === 0 ? 1 : 2) + ' m';
    return { text: n + ' has a ribbon ' + Lm + ' long.\n' + n + ' cuts it into pieces of ' + piece + ' cm each.\nHow many pieces does ' + n + ' get?', answer: count, keepWords: ['each'],
      wrong: [[count * 10, 'CONCEPT', '1 m = 100 cm. Change the units first.'], [count + 1, 'EXECUTE', 'Check: pieces × ' + piece + ' cm should be ' + L + ' cm.'], [count - 1, 'EXECUTE', 'Check: pieces × ' + piece + ' cm should be ' + L + ' cm.']],
      hints: ['WHAT? We need the number of pieces.', 'HOW? Step 1: change ' + Lm + ' into cm. Step 2: divide by ' + piece + ' cm.', 'DO: ' + Lm + ' = ' + L + ' cm. Now ' + L + ' ÷ ' + piece + '.'],
      show: [Lm + ' = ' + L + ' cm.', L + ' ÷ ' + piece + ' = ' + count + ' pieces.'],
      bm: n + ' ada reben sepanjang ' + Lm + '. ' + n + ' memotongnya kepada kepingan ' + piece + ' cm setiap satu. Berapakah kepingan yang ' + n + ' dapat?', simple: 'The ribbon is ' + Lm + '. Each piece is ' + piece + ' cm. How many pieces?' };
  } });

  /* ── fix the one template whose text needs the table question line ── */
  var sales = byId['wp-sales'], mk = sales.make;
  sales.make = function (R) { var o = mk(R); o.text += '\nThe table shows how many were sold.\nHow much money did the canteen get on both days altogether?'; return o; };

  function templatesFor(skill) { return templates.filter(function (t) { return t.skill === skill; }); }
  function instance(tplId, seed) { return build(tplId, seed == null ? Math.floor(Math.random() * 1e9) : seed); }

  return { templates: templates, templatesFor: templatesFor, build: build, fromId: fromId, instance: instance, rng: rng, fmt: { num: num, rm: rm, t24: t24, t12: t12, dur: dur } };
})();

// Unified lookup: hand-written questions first, then generated ones.
(function () {
  var staticLookup = FMQ.question;
  FMQ.question = function (id) {
    if (id && id.indexOf('g~') === 0) return FMQ.gen.fromId(id);
    return staticLookup(id);
  };
})();
