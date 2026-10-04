/* Generators: foundation skills for catching up — reading the clock, basic +/− facts, times tables.
   These sit underneath the Year 4 skills, so the engine can step back to them. Bilingual. */
(function () {
  var G = FMQ.gen, T = G.T, h = G.h, pad = h.pad, NAMES = h.NAMES;
  function cl(hr, m) { return hr + ':' + pad(m); }
  function hr12(x) { x = ((x - 1) % 12 + 12) % 12 + 1; return x; }
  var SHORT = ['The short hand shows the hour. The long hand shows the minutes.', 'Jarum pendek menunjukkan jam. Jarum panjang menunjukkan minit.'];

  /* ══════════ READING THE CLOCK ══════════ */
  T({ id: 'clk-oclock', skill: 'clock', level: 1, make: function (R) {
    var H = R.int(1, 12);
    return { text: 'What time does the clock show?', visual: { kind: 'clock', h: H, m: 0 }, answer: cl(H, 0),
      bm: 'Pukul berapakah yang ditunjukkan oleh jam ini?', simple: 'Read the clock.',
      wrong: [[cl(12, H * 5 % 60), 'UNDERSTAND', ['You swapped the hands. ' + SHORT[0], 'Anda tertukar jarum. ' + SHORT[1]]], [cl(hr12(H + 1), 0), 'EXECUTE', ['Look again: which number does the short hand point to?', 'Lihat semula: jarum pendek menunjuk ke nombor berapa?']], [cl(hr12(H - 1), 0), 'EXECUTE', ['Look again: which number does the short hand point to?', 'Lihat semula: jarum pendek menunjuk ke nombor berapa?']]],
      hints: [SHORT, ['The long hand points straight up at 12. That means “o’clock”: 0 minutes.', 'Jarum panjang menunjuk tepat ke 12. Itu bermaksud tepat: 0 minit.'], ['Read the short hand. It points to ' + H + '.', 'Baca jarum pendek. Ia menunjuk ke ' + H + '.']],
      show: [['Long hand on 12 → 0 minutes (o’clock).', 'Jarum panjang di 12 → 0 minit (tepat).'], ['Short hand on ' + H + ' → ' + H + ' o’clock = ' + cl(H, 0) + '.', 'Jarum pendek di ' + H + ' → pukul ' + H + ' tepat = ' + cl(H, 0) + '.']] };
  } });

  T({ id: 'clk-half', skill: 'clock', level: 1, make: function (R) {
    var H = R.int(1, 12);
    return { text: 'What time does the clock show?', visual: { kind: 'clock', h: H, m: 30 }, answer: cl(H, 30),
      bm: 'Pukul berapakah yang ditunjukkan oleh jam ini?', simple: 'Read the clock.',
      wrong: [[cl(hr12(H + 1), 30), 'CONCEPT', ['At half past, the short hand is halfway between two numbers. The hour is the number it has passed.', 'Pada setengah jam, jarum pendek berada di tengah dua nombor. Jamnya ialah nombor yang sudah dilepasi.']], [cl(H, 6), 'CONCEPT', ['The long hand on 6 means 30 minutes, not 6. Count in 5s.', 'Jarum panjang di 6 bermaksud 30 minit, bukan 6. Kira 5-5.']], [cl(6, H * 5 % 60), 'UNDERSTAND', ['You swapped the hands. ' + SHORT[0], 'Anda tertukar jarum. ' + SHORT[1]]]],
      hints: [SHORT, ['The long hand points to 6. Count in 5s from 12 to 6: 5, 10, 15, 20, 25, 30.', 'Jarum panjang di 6. Kira 5-5 dari 12 hingga 6: 5, 10, 15, 20, 25, 30.'], ['The short hand is between ' + H + ' and ' + hr12(H + 1) + '. The hour is ' + H + '.', 'Jarum pendek di antara ' + H + ' dan ' + hr12(H + 1) + '. Jamnya ' + H + '.']],
      show: [['Long hand on 6 → 30 minutes (half past).', 'Jarum panjang di 6 → 30 minit (setengah jam).'], ['Short hand just past ' + H + ' → ' + cl(H, 30) + ', half past ' + H + '.', 'Jarum pendek baru melepasi ' + H + ' → ' + cl(H, 30) + ', pukul ' + H + ' setengah.']] };
  } });

  T({ id: 'clk-quarter', skill: 'clock', level: 1, make: function (R) {
    var H = R.int(1, 12), past = R.chance(0.5), m = past ? 15 : 45, num = past ? 3 : 9;
    return { text: 'What time does the clock show?', visual: { kind: 'clock', h: H, m: m }, answer: cl(H, m),
      bm: 'Pukul berapakah yang ditunjukkan oleh jam ini?', simple: 'Read the clock.',
      wrong: [[cl(H, num), 'CONCEPT', ['The long hand on ' + num + ' means ' + m + ' minutes. Count in 5s.', 'Jarum panjang di ' + num + ' bermaksud ' + m + ' minit. Kira 5-5.']], [cl(hr12(H + 1), m), 'EXECUTE', ['The short hand has not reached the next number yet. The hour is still ' + H + '.', 'Jarum pendek belum sampai ke nombor seterusnya. Jamnya masih ' + H + '.']], [cl(H, past ? 45 : 15), 'CONCEPT', ['Quarter past is 15 minutes (long hand on 3). Quarter to is 45 minutes (long hand on 9).', 'Suku jam selepas = 15 minit (jarum panjang di 3). 45 minit = jarum panjang di 9.']]],
      hints: [SHORT, ['The long hand points to ' + num + '. Count in 5s from 12: ' + (past ? '5, 10, 15.' : '5, 10, 15 … 45.'), 'Jarum panjang di ' + num + '. Kira 5-5 dari 12: ' + (past ? '5, 10, 15.' : '5, 10, 15 … 45.')], ['The short hand is just after ' + H + '. The hour is ' + H + '.', 'Jarum pendek baru melepasi ' + H + '. Jamnya ' + H + '.']],
      show: [['Long hand on ' + num + ' → ' + m + ' minutes.', 'Jarum panjang di ' + num + ' → ' + m + ' minit.'], ['The time is ' + cl(H, m) + (past ? ', quarter past ' + H : ', quarter to ' + hr12(H + 1)) + '.', 'Waktunya ' + cl(H, m) + (past ? ', pukul ' + H + ' suku' : ', lagi suku pukul ' + hr12(H + 1)) + '.']] };
  } });

  T({ id: 'clk-five', skill: 'clock', level: 2, make: function (R) {
    var H = R.int(1, 12), k; do { k = R.int(1, 11); } while (k === 6 || k === 3 || k === 9);
    var m = k * 5;
    return { text: 'What time does the clock show?', visual: { kind: 'clock', h: H, m: m }, answer: cl(H, m),
      bm: 'Pukul berapakah yang ditunjukkan oleh jam ini?', simple: 'Read the clock. Count the minutes in 5s.',
      wrong: [[cl(H, k), 'CONCEPT', ['Each number on the clock is 5 minutes. The long hand on ' + k + ' means ' + m + ' minutes.', 'Setiap nombor pada jam ialah 5 minit. Jarum panjang di ' + k + ' bermaksud ' + m + ' minit.']], [cl(hr12(H + 1), m), 'EXECUTE', ['The short hand has not reached ' + hr12(H + 1) + ' yet. The hour is ' + H + '.', 'Jarum pendek belum sampai ke ' + hr12(H + 1) + '. Jamnya ' + H + '.']], [cl(k, H * 5 % 60), 'UNDERSTAND', ['You swapped the hands. ' + SHORT[0], 'Anda tertukar jarum. ' + SHORT[1]]]],
      hints: [SHORT, ['Count the minutes in 5s from 12 to where the long hand points: 5, 10, 15…', 'Kira minit 5-5 dari 12 hingga jarum panjang: 5, 10, 15…'], ['The long hand is on ' + k + ': ' + k + ' × 5 = ' + m + ' minutes. The short hand is just after ' + H + '.', 'Jarum panjang di ' + k + ': ' + k + ' × 5 = ' + m + ' minit. Jarum pendek baru melepasi ' + H + '.']],
      show: [['Long hand on ' + k + ' → ' + k + ' × 5 = ' + m + ' minutes.', 'Jarum panjang di ' + k + ' → ' + k + ' × 5 = ' + m + ' minit.'], ['Short hand after ' + H + ' → hour ' + H + '. Time: ' + cl(H, m) + '.', 'Jarum pendek selepas ' + H + ' → jam ' + H + '. Waktu: ' + cl(H, m) + '.']] };
  } });

  T({ id: 'clk-words', skill: 'clock', level: 1, make: function (R) {
    var H = R.int(1, 12), kind = R.pick(['oclock', 'half', 'qpast', 'qto']);
    var m = { oclock: 0, half: 30, qpast: 15, qto: 45 }[kind], hour = kind === 'qto' ? hr12(H - 1) : H;
    var en = { oclock: H + ' o’clock', half: 'half past ' + H, qpast: 'quarter past ' + H, qto: 'quarter to ' + H }[kind];
    var bm = { oclock: 'pukul ' + H + ' tepat', half: 'pukul ' + H + ' setengah (' + H + ':30)', qpast: 'pukul ' + H + ' suku (' + H + ':15)', qto: 'lagi suku pukul ' + H + ' (suku jam sebelum pukul ' + H + ')' }[kind];
    return { text: 'Which time is “' + en + '”?', answer: cl(hour, m),
      bm: 'Waktu manakah ialah “' + bm + '”?', simple: 'Write ' + en + ' with numbers.',
      wrong: [[cl(kind === 'qto' ? H : hr12(H - 1), m), 'CONCEPT', kind === 'qto' ? ['“Quarter to ' + H + '” is 15 minutes BEFORE ' + H + ' o’clock.', '“Lagi suku pukul ' + H + '” ialah 15 minit SEBELUM pukul ' + H + '.'] : ['Check the hour: it is ' + H + '.', 'Semak jam: ' + H + '.']],
        [cl(hour, m === 30 ? 15 : 30), 'CONCEPT', ['Half past = 30 minutes. Quarter = 15 minutes.', 'Setengah jam = 30 minit. Suku jam = 15 minit.']], [cl(hour, m === 45 ? 15 : 45), 'CONCEPT', ['Quarter past = 15 minutes. Quarter to = 45 minutes.', 'Suku jam selepas = 15 minit. Lagi suku = 45 minit.']]],
      hints: [['O’clock = 0 minutes. Half past = 30. Quarter past = 15. Quarter to = 45.', 'Tepat = 0 minit. Setengah = 30. Suku = 15. Lagi suku = 45.'], kind === 'qto' ? ['“Quarter to” means 15 minutes before the hour.', '“Lagi suku” bermaksud 15 minit sebelum jam itu.'] : ['“Past” means after the hour.', '“Selepas” bermaksud selepas jam itu.'], ['Write the hour, then “:”, then the minutes.', 'Tulis jam, kemudian “:”, kemudian minit.']],
      show: [['“' + en + '” = ' + cl(hour, m) + '.', '“' + bm + '” = ' + cl(hour, m) + '.']] };
  } });

  T({ id: 'clk-later', skill: 'clock', level: 2, make: function (R) {
    var H = R.int(1, 11), m = R.pick([0, 15, 30, 45]), add = R.pick([30, 60, 60, 90, 120]);
    var tot = H * 60 + m + add, eh = hr12(Math.floor(tot / 60)), em = tot % 60;
    var addEn = { 30: '30 minutes', 60: '1 hour', 90: '1 hour 30 minutes', 120: '2 hours' }[add], addBm = { 30: '30 minit', 60: '1 jam', 90: '1 jam 30 minit', 120: '2 jam' }[add];
    return { text: 'The clock shows the time now.\nWhat time will it be ' + addEn + ' later?', visual: { kind: 'clock', h: H, m: m }, answer: cl(eh, em),
      bm: 'Jam ini menunjukkan waktu sekarang. Pukul berapakah ' + addBm + ' kemudian?', simple: 'Read the clock. Then move forward ' + addEn + '.',
      wrong: [[cl(H, m), 'UNDERSTAND', ['That is the time now. Move forward ' + addEn + '.', 'Itu waktu sekarang. Gerak ke depan ' + addBm + '.']], [cl(hr12(Math.floor((tot - 60) / 60)), (tot - 60) % 60), 'EXECUTE', ['Check the hours you added.', 'Semak jam yang ditambah.']], [cl(hr12(Math.floor((tot + 30) / 60)), (tot + 30) % 60), 'EXECUTE', ['Check the minutes you added.', 'Semak minit yang ditambah.']]],
      hints: [['First read the time now: ' + cl(H, m) + '.', 'Baca waktu sekarang dahulu: ' + cl(H, m) + '.'], ['1 hour later: the short hand moves to the next number. 30 minutes later: the long hand goes half way round.', '1 jam kemudian: jarum pendek ke nombor seterusnya. 30 minit kemudian: jarum panjang bergerak separuh pusingan.'], ['Add the hours first, then the minutes. Remember 60 minutes = 1 hour.', 'Tambah jam dahulu, kemudian minit. Ingat 60 minit = 1 jam.']],
      show: [['Now: ' + cl(H, m) + '.', 'Sekarang: ' + cl(H, m) + '.'], [cl(H, m) + ' + ' + addEn + ' = ' + cl(eh, em) + '.', cl(H, m) + ' + ' + addBm + ' = ' + cl(eh, em) + '.']] };
  } });

  var DAY = [
    ['eats breakfast', 'bersarapan', 7, 'am', 'eat breakfast'], ['goes to school', 'pergi ke sekolah', 7, 'am', 'go to school'], ['has recess', 'berehat di sekolah', 10, 'am', 'have recess'],
    ['eats lunch', 'makan tengah hari', 1, 'pm', 'eat lunch'], ['does homework', 'membuat kerja rumah', 4, 'pm', 'do homework'], ['plays outside', 'bermain di luar', 5, 'pm', 'play outside'],
    ['eats dinner', 'makan malam', 8, 'pm', 'eat dinner'], ['goes to sleep', 'tidur', 9, 'pm', 'go to sleep'], ['wakes up', 'bangun tidur', 6, 'am', 'wake up']
  ];
  T({ id: 'clk-ampm', skill: 'clock', level: 1, make: function (R) {
    var d = R.pick(DAY), n = R.pick(NAMES), am = d[3] === 'am';
    return { text: n + ' ' + d[0] + ' at ' + d[2] + ':00.\nIs it a.m. or p.m.?', answer: am ? 'a.m.' : 'p.m.', count: 2, order: ['a.m.', 'p.m.'],
      bm: n + ' ' + d[1] + ' pada pukul ' + d[2] + ':00. Adakah waktu itu a.m. atau p.m.?', simple: 'Is it in the morning (a.m.) or after 12 noon (p.m.)?',
      wrong: [[am ? 'p.m.' : 'a.m.', 'CONCEPT', ['a.m. = from midnight to 12 noon (morning). p.m. = after 12 noon (afternoon, evening, night).', 'a.m. = tengah malam hingga 12 tengah hari (pagi). p.m. = selepas 12 tengah hari (petang, malam).']]],
      hints: [['a.m. is the morning: before 12 noon.', 'a.m. ialah waktu pagi: sebelum 12 tengah hari.'], ['p.m. is after 12 noon: afternoon, evening and night.', 'p.m. ialah selepas 12 tengah hari: petang dan malam.'], ['When do people usually ' + d[4] + '? Morning or later?', 'Bila biasanya orang ' + d[1] + '? Pagi atau selepas tengah hari?']],
      show: [[d[0].charAt(0).toUpperCase() + d[0].slice(1) + ' at ' + d[2] + ':00 happens in the ' + (am ? 'morning → a.m.' : (d[2] >= 7 ? 'evening/night' : 'afternoon') + ' → p.m.'), d[1].charAt(0).toUpperCase() + d[1].slice(1) + ' pada pukul ' + d[2] + ':00 berlaku pada waktu ' + (am ? 'pagi → a.m.' : (d[2] >= 7 ? 'malam' : 'petang') + ' → p.m.')]] };
  } });

  /* ══════════ BASIC + / − FACTS ══════════ */
  T({ id: 'bf-add', skill: 'basic-facts', level: 1, make: function (R) {
    var big = R.chance(0.5), a = big ? R.int(11, 59) : R.int(3, 9), b = big ? R.int(11, 39) : R.int(3, 9);
    var s = a + b;
    return { text: 'What is ' + a + ' + ' + b + '?', answer: s, bm: 'Berapakah ' + a + ' + ' + b + '?', simple: 'Add ' + a + ' and ' + b + '.',
      wrong: [[s - 1, 'EXECUTE', ['Count on carefully from ' + a + '.', 'Kira ke depan dengan teliti dari ' + a + '.']], [s + 1, 'EXECUTE', ['Count on carefully from ' + a + '.', 'Kira ke depan dengan teliti dari ' + a + '.']], [Math.abs(a - b), 'PLAN', ['This is +. Add, don’t take away.', 'Ini tanda +. Tambah, jangan tolak.']]],
      hints: [['Start from the bigger number.', 'Mula dari nombor yang lebih besar.'], big ? ['Add the tens first, then the ones.', 'Tambah puluh dahulu, kemudian sa.'] : ['Make 10 first: how much does ' + Math.max(a, b) + ' need to make 10?', 'Buat 10 dahulu: ' + Math.max(a, b) + ' perlu berapa lagi untuk jadi 10?'], ['Count on ' + Math.min(a, b) + ' more from ' + Math.max(a, b) + '.', 'Kira ' + Math.min(a, b) + ' lagi dari ' + Math.max(a, b) + '.']],
      show: [[a + ' + ' + b + ' = ' + s + '.', a + ' + ' + b + ' = ' + s + '.']], check: ['Check: ' + s + ' − ' + b + ' = ' + a + ' ✓', 'Semak: ' + s + ' − ' + b + ' = ' + a + ' ✓'] };
  } });

  T({ id: 'bf-sub', skill: 'basic-facts', level: 1, make: function (R) {
    var big = R.chance(0.5), a = big ? R.int(30, 99) : R.int(11, 19), b = big ? R.int(11, a - 5) : R.int(3, 9);
    var d = a - b;
    return { text: 'What is ' + a + ' − ' + b + '?', answer: d, bm: 'Berapakah ' + a + ' − ' + b + '?', simple: 'Take ' + b + ' away from ' + a + '.',
      wrong: [[d + 1, 'EXECUTE', ['Count back carefully.', 'Kira ke belakang dengan teliti.']], [d - 1, 'EXECUTE', ['Count back carefully.', 'Kira ke belakang dengan teliti.']], [a + b, 'PLAN', ['This is −. Take away, don’t add.', 'Ini tanda −. Tolak, jangan tambah.']], [h.colAbs(a, b), 'EXECUTE', ['If the top ones digit is smaller, regroup a ten.', 'Jika digit sa di atas lebih kecil, kumpul semula satu puluh.']]],
      hints: [['Start at ' + a + ' and count back ' + b + '.', 'Mula di ' + a + ' dan kira ke belakang ' + b + '.'], big ? ['Take away the tens first, then the ones.', 'Tolak puluh dahulu, kemudian sa.'] : ['Take away to get to 10 first, then take away the rest.', 'Tolak hingga 10 dahulu, kemudian tolak bakinya.'], ['Check by adding: your answer + ' + b + ' should be ' + a + '.', 'Semak dengan tambah: jawapan + ' + b + ' patut jadi ' + a + '.']],
      show: [[a + ' − ' + b + ' = ' + d + '.', a + ' − ' + b + ' = ' + d + '.']], check: ['Check: ' + d + ' + ' + b + ' = ' + a + ' ✓', 'Semak: ' + d + ' + ' + b + ' = ' + a + ' ✓'] };
  } });

  T({ id: 'bf-missing', skill: 'basic-facts', level: 2, make: function (R) {
    var a = R.int(4, 30), b = R.int(3, 25), s = a + b;
    return { text: a + ' + ? = ' + s + '\nWhat is the missing number?', answer: b, bm: a + ' + ? = ' + s + '. Apakah nombor yang tertinggal?', simple: 'What do you add to ' + a + ' to make ' + s + '?',
      wrong: [[s + a, 'PLAN', ['You added. Find what is missing: take away.', 'Anda menambah. Cari nombor yang tertinggal: tolak.']], [b + 1, 'EXECUTE', ['Check: ' + a + ' + ' + (b + 1) + ' = ' + (s + 1) + '.', 'Semak: ' + a + ' + ' + (b + 1) + ' = ' + (s + 1) + '.']], [b - 1, 'EXECUTE', ['Check: ' + a + ' + ' + (b - 1) + ' = ' + (s - 1) + '.', 'Semak: ' + a + ' + ' + (b - 1) + ' = ' + (s - 1) + '.']]],
      hints: [['How much more do we need to get from ' + a + ' to ' + s + '?', 'Berapa lagi diperlukan dari ' + a + ' ke ' + s + '?'], ['Find the missing part: ' + s + ' − ' + a + '.', 'Cari bahagian yang hilang: ' + s + ' − ' + a + '.'], ['Count on from ' + a + ' up to ' + s + '.', 'Kira dari ' + a + ' hingga ' + s + '.']],
      show: [[s + ' − ' + a + ' = ' + b + '.', s + ' − ' + a + ' = ' + b + '.'], [a + ' + ' + b + ' = ' + s + ' ✓', a + ' + ' + b + ' = ' + s + ' ✓']] };
  } });

  T({ id: 'bf-bonds', skill: 'basic-facts', level: 1, make: function (R) {
    var to = R.pick([10, 20, 100]), a = to === 100 ? R.mult(10, 90, 5) : R.int(1, to - 1), b = to - a;
    return { text: a + ' + ? = ' + to, answer: b, bm: a + ' + ? = ' + to, simple: 'How much more makes ' + to + '?', step: to === 100 ? 5 : 1,
      wrong: [[to + a, 'PLAN', ['Find the part that is missing, not the total.', 'Cari bahagian yang tertinggal, bukan jumlahnya.']], [b + (to === 100 ? 10 : 1), 'EXECUTE', ['Check by adding them together.', 'Semak dengan menambah kedua-duanya.']]],
      hints: [['Which number joins ' + a + ' to make ' + to + '?', 'Nombor apa yang bergabung dengan ' + a + ' untuk jadi ' + to + '?'], ['Count on from ' + a + ' to ' + to + '.', 'Kira dari ' + a + ' hingga ' + to + '.'], [to + ' − ' + a + ' = ?', to + ' − ' + a + ' = ?']],
      show: [[a + ' + ' + b + ' = ' + to + '.', a + ' + ' + b + ' = ' + to + '.']] };
  } });

  /* ══════════ TIMES TABLES (SIFIR) ══════════ */
  T({ id: 'tt-fact', skill: 'times-tables', level: 1, make: function (R) {
    var t = R.int(2, 10), n = R.int(1, 10), p = t * n;
    return { text: n + ' × ' + t + ' = ?', answer: p, step: t, bm: n + ' × ' + t + ' = ?', simple: n + ' groups of ' + t + '.',
      wrong: [[p + t, 'EXECUTE', ['That is one group too many. Count the groups: ' + n + '.', 'Itu terlebih satu kumpulan. Kira kumpulan: ' + n + '.']], [Math.max(0, p - t), 'EXECUTE', ['That is one group too few. Count the groups: ' + n + '.', 'Itu terkurang satu kumpulan. Kira kumpulan: ' + n + '.']], [n + t, 'PLAN', ['You added. × means groups of.', 'Anda menambah. × bermaksud kumpulan.']]],
      hints: [[n + ' × ' + t + ' means ' + n + ' groups of ' + t + '.', n + ' × ' + t + ' bermaksud ' + n + ' kumpulan ' + t + '.'], ['Skip-count in ' + t + 's: ' + [1, 2, 3].map(function (i) { return i * t; }).join(', ') + '…', 'Kira lompat ' + t + '-' + t + ': ' + [1, 2, 3].map(function (i) { return i * t; }).join(', ') + '…'], ['Count ' + n + ' jumps of ' + t + '.', 'Kira ' + n + ' lompatan ' + t + '.']],
      show: [['Skip-count: ' + Array.from({ length: n }, function (_, i) { return (i + 1) * t; }).join(', ') + '.', 'Kira lompat: ' + Array.from({ length: n }, function (_, i) { return (i + 1) * t; }).join(', ') + '.'], [n + ' × ' + t + ' = ' + p + '.', n + ' × ' + t + ' = ' + p + '.']] };
  } });

  T({ id: 'tt-div', skill: 'times-tables', level: 1, make: function (R) {
    var t = R.int(2, 10), n = R.int(2, 10), p = t * n;
    return { text: p + ' ÷ ' + t + ' = ?', answer: n, bm: p + ' ÷ ' + t + ' = ?', simple: 'How many groups of ' + t + ' make ' + p + '?',
      wrong: [[n + 1, 'EXECUTE', ['Check: ' + (n + 1) + ' × ' + t + ' = ' + (n + 1) * t + '.', 'Semak: ' + (n + 1) + ' × ' + t + ' = ' + (n + 1) * t + '.']], [n - 1 || n + 2, 'EXECUTE', ['Check with the times table.', 'Semak dengan sifir.']], [p - t, 'PLAN', ['÷ means share into equal groups, not take away.', '÷ bermaksud bahagi sama rata, bukan tolak.']]],
      hints: [['Which number times ' + t + ' makes ' + p + '?', 'Nombor apa darab ' + t + ' jadi ' + p + '?'], ['Use the ' + t + ' times table.', 'Guna sifir ' + t + '.'], ['Skip-count in ' + t + 's until you reach ' + p + '. Count the jumps.', 'Kira lompat ' + t + '-' + t + ' hingga ' + p + '. Kira bilangan lompatan.']],
      show: [[n + ' × ' + t + ' = ' + p + ', so ' + p + ' ÷ ' + t + ' = ' + n + '.', n + ' × ' + t + ' = ' + p + ', jadi ' + p + ' ÷ ' + t + ' = ' + n + '.']] };
  } });

  T({ id: 'tt-missing', skill: 'times-tables', level: 2, make: function (R) {
    var t = R.int(2, 9), n = R.int(2, 10), p = t * n;
    return { text: '? × ' + t + ' = ' + p + '\nWhat is the missing number?', answer: n, bm: '? × ' + t + ' = ' + p + '. Apakah nombor yang tertinggal?', simple: 'How many ' + t + 's make ' + p + '?',
      wrong: [[p - t, 'PLAN', ['You subtracted. Think: how many groups of ' + t + '?', 'Anda menolak. Fikir: berapa kumpulan ' + t + '?']], [n + 1, 'EXECUTE', ['Check: ' + (n + 1) + ' × ' + t + ' = ' + (n + 1) * t + '.', 'Semak: ' + (n + 1) + ' × ' + t + ' = ' + (n + 1) * t + '.']], [p + t, 'PLAN', ['The missing number is smaller than ' + p + '.', 'Nombor yang tertinggal lebih kecil daripada ' + p + '.']]],
      hints: [['Say the ' + t + ' times table until you reach ' + p + '.', 'Sebut sifir ' + t + ' hingga sampai ' + p + '.'], ['This is the same as ' + p + ' ÷ ' + t + '.', 'Ini sama dengan ' + p + ' ÷ ' + t + '.'], ['Count the jumps of ' + t + ' to reach ' + p + '.', 'Kira lompatan ' + t + ' untuk sampai ' + p + '.']],
      show: [[n + ' × ' + t + ' = ' + p + '.', n + ' × ' + t + ' = ' + p + '.']] };
  } });
})();
