/* Generators: place value, adding & subtracting, times & sharing, decimals, money. Bilingual. */
(function () {
  var G = FMQ.gen, T = G.T, h = G.h, num = h.num, rm = h.rm, d1 = h.d1, d2 = h.d2, colAbs = h.colAbs, NAMES = h.NAMES;

  /* ══════════ PLACE VALUE ══════════ */
  var PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
  var PLACES_BM = ['sa', 'puluh', 'ratus', 'ribu', 'puluh ribu'];
  T({ id: 'pv-value', skill: 'place-value', level: 1, make: function (R) {
    var n, pos, d, s;
    do {
      n = R.int(1000, 99999); s = String(n);
      pos = R.int(1, s.length - 1); d = Math.floor(n / Math.pow(10, pos)) % 10;
    } while (d === 0 || s.split(String(d)).length !== 2);
    var v = d * Math.pow(10, pos);
    return { text: 'In ' + num(n) + ', what is the value of the digit ' + d + '?', answer: v, fmt: num, vocab: ['value', 'digit'],
      bm: 'Dalam nombor ' + num(n) + ', apakah nilai digit ' + d + '?', simple: 'Look at ' + num(n) + '. How much is the ' + d + ' worth?',
      wrong: [[d, 'CONCEPT', ['The digit is ' + d + ', but its place makes it worth more. Which place is it in?', 'Digitnya ' + d + ', tetapi tempatnya menjadikan nilainya lebih besar. Di tempat manakah ia?']],
        [d * Math.pow(10, pos - 1), 'CONCEPT', ['Count the places again from the right.', 'Kira tempat sekali lagi dari kanan.']],
        [d * Math.pow(10, pos + 1), 'CONCEPT', ['Count the places again from the right: ones, tens, hundreds…', 'Kira tempat dari kanan: sa, puluh, ratus…']]],
      hints: [['Which place is the ' + d + ' in?', 'Digit ' + d + ' berada di tempat apa?'],
        ['Count the places from the right: ones, tens, hundreds, thousands…', 'Kira dari kanan: sa, puluh, ratus, ribu…'],
        ['The ' + d + ' is in the ' + PLACES[pos] + ' place. What is ' + d + ' ' + PLACES[pos] + '?', 'Digit ' + d + ' di tempat ' + PLACES_BM[pos] + '. Berapakah ' + d + ' ' + PLACES_BM[pos] + '?']],
      show: [['In ' + num(n) + ', the ' + d + ' is in the ' + PLACES[pos] + ' place.', 'Dalam ' + num(n) + ', digit ' + d + ' di tempat ' + PLACES_BM[pos] + '.'],
        [d + ' ' + PLACES[pos] + ' = ' + num(v) + '.', d + ' ' + PLACES_BM[pos] + ' = ' + num(v) + '.']] };
  } });

  T({ id: 'pv-round', skill: 'place-value', level: 2, make: function (R) {
    var to = R.pick([10, 100, 1000]), word = { 10: 'ten', 100: 'hundred', 1000: 'thousand' }[to], wb = { 10: 'puluh', 100: 'ratus', 1000: 'ribu' }[to];
    var n; do { n = R.int(1000, 9999); } while (n % to === 0);
    var lo = Math.floor(n / to) * to, hi = lo + to, nd = Math.floor((n % to) / (to / 10));
    var ans = nd >= 5 ? hi : lo, other = ans === hi ? lo : hi, up = ans === hi;
    var to2 = to === 1000 ? 100 : to * 10, alt = Math.round(n / to2) * to2;
    return { text: 'Round ' + num(n) + ' to the nearest ' + word + '.', answer: ans, fmt: num, step: to,
      bm: 'Bundarkan ' + num(n) + ' kepada ' + wb + ' yang terdekat.', simple: 'Which ' + word + ' is ' + num(n) + ' closest to?',
      wrong: [[other, 'CONCEPT', ['Look at the digit just right of the ' + word + 's place. Is it 5 or more?', 'Lihat digit di sebelah kanan tempat ' + wb + '. Adakah ia 5 atau lebih?']],
        [alt, 'UNDERSTAND', ['Check which place we round to: the nearest ' + word + '.', 'Semak tempat yang dibundarkan: ' + wb + ' yang terdekat.']],
        [n, 'UNDERSTAND', ['Rounding changes the number to the nearest ' + word + '.', 'Pembundaran menukar nombor kepada ' + wb + ' yang terdekat.']]],
      hints: [['Which two ' + word + 's is ' + num(n) + ' between?', num(n) + ' berada di antara dua ' + wb + ' yang mana?'],
        ['Look at the digit just to the right of the ' + word + 's place.', 'Lihat digit di sebelah kanan tempat ' + wb + '.'],
        ['That digit is ' + nd + '. 5 or more rounds up; less than 5 rounds down.', 'Digit itu ' + nd + '. 5 atau lebih, bundarkan ke atas; kurang daripada 5, bundarkan ke bawah.']],
      show: [[num(n) + ' is between ' + num(lo) + ' and ' + num(hi) + '.', num(n) + ' berada di antara ' + num(lo) + ' dan ' + num(hi) + '.'],
        ['The next digit is ' + nd + ', so we round ' + (up ? 'up' : 'down') + '.', 'Digit seterusnya ' + nd + ', jadi bundarkan ke ' + (up ? 'atas' : 'bawah') + '.'],
        [num(n) + ' rounds to ' + num(ans) + '.', num(n) + ' dibundarkan kepada ' + num(ans) + '.']] };
  } });

  T({ id: 'pv-more', skill: 'place-value', level: 2, make: function (R) {
    var n = R.int(10000, 89999), k = R.pick([10, 100, 1000, 10000]), more = R.chance(0.6);
    var ans = more ? n + k : n - k, sign = more ? 1 : -1;
    return { text: 'Which number is ' + num(k) + (more ? ' more than ' : ' less than ') + num(n) + '?', answer: ans, fmt: num,
      bm: 'Nombor manakah ' + num(k) + (more ? ' lebih daripada ' : ' kurang daripada ') + num(n) + '?', simple: 'Start at ' + num(n) + '. ' + (more ? 'Add ' : 'Take away ') + num(k) + '. Which number do you get?',
      wrong: [[n + sign * k * 10, 'CONCEPT', ['You changed the wrong place. Which place does ' + num(k) + ' change?', 'Tempat yang diubah salah. Tempat manakah yang ' + num(k) + ' ubah?']],
        [k >= 100 ? n + sign * k / 10 : n + sign * 1000, 'CONCEPT', ['Only the place of ' + num(k) + ' should change.', 'Hanya tempat bagi ' + num(k) + ' yang berubah.']],
        [n - sign * k, 'UNDERSTAND', more ? ['“More than” makes the number bigger.', '“Lebih daripada” menjadikan nombor lebih besar.'] : ['“Less than” makes the number smaller.', '“Kurang daripada” menjadikan nombor lebih kecil.']]],
      hints: [['Which place does ' + num(k) + ' change?', 'Tempat manakah yang ' + num(k) + ' ubah?'],
        ['Only one digit should change' + (more ? ' (unless it goes past 9).' : '.'), 'Hanya satu digit yang berubah' + (more ? ' (kecuali melebihi 9).' : '.')],
        [(more ? 'Add ' : 'Take away ') + num(k) + ' from ' + num(n) + ' in that place.', (more ? 'Tambah ' : 'Tolak ') + num(k) + (more ? ' kepada ' : ' daripada ') + num(n) + ' di tempat itu.']],
      show: [[num(n) + (more ? ' + ' : ' − ') + num(k) + ' = ' + num(ans) + '.', num(n) + (more ? ' + ' : ' − ') + num(k) + ' = ' + num(ans) + '.']] };
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
    var msg = ['Compare the thousands digits first, then the hundreds.', 'Bandingkan digit ribu dahulu, kemudian ratus.'];
    return { text: 'Which is the ' + (big ? 'largest' : 'smallest') + ' number?', answer: ans, fmt: num,
      wrong: nums.filter(function (x) { return x !== ans; }).map(function (x) { return [x, 'CONCEPT', msg]; }),
      bm: 'Nombor manakah yang paling ' + (big ? 'besar' : 'kecil') + '?', simple: 'Which number is the ' + (big ? 'biggest' : 'smallest') + '?',
      hints: [['All the numbers have 4 digits. Which place do we compare first?', 'Semua nombor ada 4 digit. Tempat manakah dibandingkan dahulu?'],
        ['Compare the thousands digits.', 'Bandingkan digit ribu.'],
        ['If the thousands are the same, compare the hundreds.', 'Jika digit ribu sama, bandingkan digit ratus.']],
      show: [['Compare from the left: thousands, then hundreds, then tens.', 'Bandingkan dari kiri: ribu, ratus, kemudian puluh.'],
        ['The ' + (big ? 'largest' : 'smallest') + ' is ' + num(ans) + '.', 'Yang paling ' + (big ? 'besar' : 'kecil') + ' ialah ' + num(ans) + '.']] };
  } });

  /* ══════════ ADDING & SUBTRACTING ══════════ */
  T({ id: 'as-add', skill: 'add-sub', level: 1, make: function (R) {
    var a, b; do { a = R.int(120, 699); b = R.int(110, 299); } while ((a % 10) + (b % 10) < 10);
    return { text: 'What is ' + a + ' + ' + b + '?', answer: a + b, step: 10, bm: 'Berapakah ' + a + ' + ' + b + '?', simple: 'Add ' + a + ' and ' + b + '.',
      wrong: [[a + b - 10, 'EXECUTE', ['Check the carry from the ones column.', 'Semak nilai yang dibawa dari lajur sa.']], [a + b + 100, 'EXECUTE', ['Check the hundreds column.', 'Semak lajur ratus.']], [Math.abs(a - b), 'PLAN', ['This is an add question. Look at the sign.', 'Ini soalan tambah. Lihat tanda.']]],
      hints: [['Add the ones first.', 'Tambah digit sa dahulu.'],
        [(a % 10) + ' + ' + (b % 10) + ' is more than 9. What do we do with the extra ten?', (a % 10) + ' + ' + (b % 10) + ' lebih daripada 9. Apa kita buat dengan satu puluh itu?'],
        ['Carry 1 ten into the tens column, then add the tens and the hundreds.', 'Bawa 1 puluh ke lajur puluh, kemudian tambah puluh dan ratus.']],
      show: [['Ones: ' + (a % 10) + ' + ' + (b % 10) + ' = ' + ((a % 10) + (b % 10)) + ' → carry 1 ten.', 'Sa: ' + (a % 10) + ' + ' + (b % 10) + ' = ' + ((a % 10) + (b % 10)) + ' → bawa 1 puluh.'],
        ['Then add the tens and hundreds.', 'Kemudian tambah puluh dan ratus.'], [a + ' + ' + b + ' = ' + (a + b) + '.', a + ' + ' + b + ' = ' + (a + b) + '.']],
      check: ['Check: ' + (a + b) + ' − ' + b + ' = ' + a + ' ✓', 'Semak: ' + (a + b) + ' − ' + b + ' = ' + a + ' ✓'] };
  } });

  T({ id: 'as-sub', skill: 'add-sub', level: 1, make: function (R) {
    var a, b; do { a = R.int(300, 950); b = R.int(105, a - 60); } while ((a % 10) >= (b % 10));
    return { text: 'What is ' + a + ' − ' + b + '?', answer: a - b, step: 10, bm: 'Berapakah ' + a + ' − ' + b + '?', simple: 'Take ' + b + ' away from ' + a + '.',
      wrong: [[colAbs(a, b), 'EXECUTE', ['In each column, if the top digit is smaller, regroup first.', 'Dalam setiap lajur, jika digit atas lebih kecil, kumpul semula dahulu.']], [a + b, 'PLAN', ['This is a subtract question. Look at the sign.', 'Ini soalan tolak. Lihat tanda.']], [a - b + 10, 'EXECUTE', ['Check the tens after regrouping.', 'Semak puluh selepas kumpul semula.']]],
      hints: [['Start with the ones column.', 'Mula dengan lajur sa.'],
        [(a % 10) + ' is smaller than ' + (b % 10) + '. We need to regroup a ten.', (a % 10) + ' lebih kecil daripada ' + (b % 10) + '. Kita perlu kumpul semula satu puluh.'],
        ['Change 1 ten into 10 ones, then subtract each column.', 'Tukar 1 puluh kepada 10 sa, kemudian tolak setiap lajur.']],
      show: [['Regroup 1 ten into 10 ones.', 'Kumpul semula 1 puluh menjadi 10 sa.'], ['Subtract the ones, tens and hundreds.', 'Tolak sa, puluh dan ratus.'], [a + ' − ' + b + ' = ' + (a - b) + '.', a + ' − ' + b + ' = ' + (a - b) + '.']],
      check: ['Check: ' + (a - b) + ' + ' + b + ' = ' + a + ' ✓', 'Semak: ' + (a - b) + ' + ' + b + ' = ' + a + ' ✓'] };
  } });

  T({ id: 'as-diff', skill: 'add-sub', level: 2, make: function (R) {
    var a = R.int(60, 480), b = R.int(15, a - 12), flip = R.chance(0.4);
    var x = flip ? b : a, y = flip ? a : b;
    return { text: 'What is the difference between ' + x + ' and ' + y + '?', answer: a - b, step: 10,
      bm: 'Apakah beza antara ' + x + ' dengan ' + y + '?', simple: 'How far apart are ' + x + ' and ' + y + '?',
      wrong: [[a + b, 'UNDERSTAND', ['You added. “Difference” compares the two numbers.', 'Anda menambah. “Beza” membandingkan dua nombor.']], [a - b + 10, 'EXECUTE', ['Check the subtraction again.', 'Semak tolakan sekali lagi.']], [a - b - 10, 'EXECUTE', ['Check the tens column.', 'Semak lajur puluh.']]],
      hints: [['What does “difference” ask us to do with two numbers?', 'Apakah maksud “beza” bagi dua nombor?'],
        ['To compare two numbers, take the smaller from the bigger.', 'Untuk membandingkan, tolak nombor kecil daripada nombor besar.'],
        ['Work out ' + a + ' − ' + b + '.', 'Kira ' + a + ' − ' + b + '.']],
      show: [['Difference = bigger number − smaller number.', 'Beza = nombor besar − nombor kecil.'], [a + ' − ' + b + ' = ' + (a - b) + '.', a + ' − ' + b + ' = ' + (a - b) + '.']],
      check: ['Check: ' + b + ' + ' + (a - b) + ' = ' + a + ' ✓', 'Semak: ' + b + ' + ' + (a - b) + ' = ' + a + ' ✓'] };
  } });

  var LEFT_SCENES = [
    { en: function (n, a, b) { return n + ' has ' + a + ' stickers.\n' + n + ' gives away ' + b + ' stickers.\nHow many stickers are left?'; }, bm: function (n, a, b) { return n + ' ada ' + a + ' keping pelekat. ' + n + ' memberi ' + b + ' keping pelekat kepada kawan. Berapakah baki pelekat?'; }, s: ['stickers', 'pelekat'] },
    { en: function (n, a, b) { return 'A bakery made ' + a + ' kuih.\n' + b + ' kuih were sold.\nHow many kuih are remaining?'; }, bm: function (n, a, b) { return 'Sebuah kedai membuat ' + a + ' biji kuih. ' + b + ' biji telah dijual. Berapakah baki kuih?'; }, s: ['kuih', 'kuih'] },
    { en: function (n, a, b) { return 'A storybook has ' + a + ' pages.\n' + n + ' has read ' + b + ' pages.\nHow many pages are left to read?'; }, bm: function (n, a, b) { return 'Sebuah buku cerita ada ' + a + ' halaman. ' + n + ' sudah membaca ' + b + ' halaman. Berapa halaman lagi yang tinggal?'; }, s: ['pages', 'halaman'] },
    { en: function (n, a, b) { return 'There are ' + a + ' chairs in the school hall.\n' + b + ' chairs are taken away.\nHow many chairs are remaining?'; }, bm: function (n, a, b) { return 'Ada ' + a + ' buah kerusi di dewan sekolah. ' + b + ' buah kerusi dibawa keluar. Berapakah baki kerusi?'; }, s: ['chairs', 'kerusi'] }
  ];
  T({ id: 'as-left', skill: 'add-sub', level: 3, make: function (R) {
    var sc = R.pick(LEFT_SCENES), n = R.pick(NAMES), a = R.int(150, 900), b = R.int(45, a - 30);
    return { text: sc.en(n, a, b), answer: a - b, step: 10, bm: sc.bm(n, a, b), simple: 'Start with ' + a + '. Take away ' + b + '. How many are still there?',
      wrong: [[a + b, 'UNDERSTAND', ['You added. Some were taken away, so there are fewer now.', 'Anda menambah. Ada yang diambil, jadi sekarang lebih sedikit.']], [a - b + 10, 'EXECUTE', ['Check the regrouping.', 'Semak kumpulan semula.']], [colAbs(a, b), 'EXECUTE', ['Regroup when the top digit is smaller.', 'Kumpul semula apabila digit atas lebih kecil.']]],
      hints: [['Will there be more ' + sc.s[0] + ' or fewer at the end?', 'Pada akhirnya, ' + sc.s[1] + ' bertambah atau berkurang?'], ['Fewer means subtract.', 'Berkurang bermaksud tolak.'], ['Write ' + a + ' and put ' + b + ' underneath. Start with the ones.', 'Tulis ' + a + ' dan letak ' + b + ' di bawahnya. Mula dengan sa.']],
      show: [['Some are taken away, so subtract.', 'Ada yang diambil, jadi tolak.'], [a + ' − ' + b + ' = ' + (a - b) + '.', a + ' − ' + b + ' = ' + (a - b) + '.']],
      check: ['Check: ' + (a - b) + ' + ' + b + ' = ' + a + ' ✓', 'Semak: ' + (a - b) + ' + ' + b + ' = ' + a + ' ✓'] };
  } });

  T({ id: 'as-together', skill: 'add-sub', level: 2, make: function (R) {
    var sc = R.pick([
      ['Class 4 Bestari has A pupils.\nClass 4 Cemerlang has B pupils.\nHow many pupils are there altogether?', 'Kelas 4 Bestari ada A orang murid. Kelas 4 Cemerlang ada B orang murid. Berapakah jumlah semua murid?'],
      ['A stall sold A durians on Saturday.\nIt sold B durians on Sunday.\nWhat is the total number of durians sold?', 'Sebuah gerai menjual A biji durian pada hari Sabtu dan B biji pada hari Ahad. Berapakah jumlah durian yang dijual?'],
      ['N collected A bottles for recycling.\nN’s brother collected B bottles.\nHow many bottles did they collect altogether?', 'N mengumpul A botol untuk dikitar semula. Abangnya mengumpul B botol. Berapakah jumlah semua botol?']
    ]);
    var n = R.pick(NAMES), a = R.int(36, 480), b = R.int(27, 390);
    function fill(s) { return s.replace(/\bA\b/g, a).replace(/\bB\b/g, b).replace(/\bN\b/g, n); }
    return { text: fill(sc[0]), answer: a + b, step: 10, bm: fill(sc[1]), simple: 'Put ' + a + ' and ' + b + ' together. How many?',
      wrong: [[Math.abs(a - b), 'UNDERSTAND', ['You found the difference. This question joins the groups.', 'Anda mencari beza. Soalan ini menggabungkan kumpulan.']], [a + b - 10, 'EXECUTE', ['Check the carry.', 'Semak nilai yang dibawa.']], [a + b + 10, 'EXECUTE', ['Check the tens column.', 'Semak lajur puluh.']]],
      hints: [['Are we joining the groups or comparing them?', 'Kita menggabungkan atau membandingkan?'], ['“Altogether” and “total” join amounts. Which operation?', '“Jumlah” bermaksud gabung. Operasi apa?'], ['Add ' + a + ' and ' + b + '. Start with the ones.', 'Tambah ' + a + ' dan ' + b + '. Mula dengan sa.']],
      show: [['Joining groups means add.', 'Menggabungkan kumpulan bermaksud tambah.'], [a + ' + ' + b + ' = ' + (a + b) + '.', a + ' + ' + b + ' = ' + (a + b) + '.']] };
  } });

  T({ id: 'as-compare', skill: 'add-sub', level: 3, make: function (R) {
    var n1 = R.pick(NAMES), n2; do { n2 = R.pick(NAMES); } while (n2 === n1);
    var a = R.int(80, 400), b = R.int(25, a - 15), more = R.chance(0.55), thing = R.pick(['marbles', 'stamps', 'points', 'beads']);
    var tb = { marbles: 'biji guli', stamps: 'keping setem', points: 'mata', beads: 'biji manik' }[thing];
    var text = n1 + ' has ' + a + ' ' + thing + '.\n' + n2 + ' has ' + b + ' ' + thing + '.\n' + (more ? 'How many more ' + thing + ' does ' + n1 + ' have?' : 'How many fewer ' + thing + ' does ' + n2 + ' have?');
    return { text: text, answer: a - b, step: 10,
      bm: n1 + ' ada ' + a + ' ' + tb + '. ' + n2 + ' ada ' + b + ' ' + tb + '. ' + (more ? 'Berapa banyak lagi ' + tb + ' yang ' + n1 + ' ada?' : 'Berapa kurang ' + tb + ' yang ' + n2 + ' ada?'),
      simple: n1 + ': ' + a + '. ' + n2 + ': ' + b + '. How big is the gap between them?',
      wrong: [[a + b, 'UNDERSTAND', ['You found the total. The question compares the two amounts.', 'Anda mencari jumlah. Soalan ini membandingkan dua nilai.']], [a - b + 10, 'EXECUTE', ['Check the subtraction.', 'Semak tolakan.']], [b, 'UNDERSTAND', ['That is how many ' + n2 + ' has. We need the difference.', 'Itu bilangan ' + n2 + '. Kita perlukan bezanya.']]],
      hints: [['Are we finding a total or comparing?', 'Kita mencari jumlah atau membandingkan?'], ['“How many ' + (more ? 'more' : 'fewer') + '” compares two amounts: subtract.', '“Berapa ' + (more ? 'banyak lagi' : 'kurang') + '” membandingkan dua nilai: tolak.'], ['Work out ' + a + ' − ' + b + '.', 'Kira ' + a + ' − ' + b + '.']],
      show: [['Comparing means find the difference.', 'Membandingkan bermaksud cari beza.'], [a + ' − ' + b + ' = ' + (a - b) + '.', a + ' − ' + b + ' = ' + (a - b) + '.']],
      check: ['Check: ' + b + ' + ' + (a - b) + ' = ' + a + ' ✓', 'Semak: ' + b + ' + ' + (a - b) + ' = ' + a + ' ✓'] };
  } });

  T({ id: 'as-start', skill: 'add-sub', level: 3, make: function (R) {
    var n = R.pick(NAMES), b = R.int(15, 90), c = R.int(b + 40, 400), a = c - b;
    return { text: n + ' had some marbles.\n' + n + ' won ' + b + ' more marbles.\nNow ' + n + ' has ' + c + ' marbles.\nHow many marbles did ' + n + ' have at first?', answer: a, step: 10,
      bm: n + ' ada beberapa biji guli. ' + n + ' menang ' + b + ' biji lagi. Sekarang ' + n + ' ada ' + c + ' biji. Berapakah guli ' + n + ' pada mulanya?',
      simple: n + ' got ' + b + ' new marbles. Now there are ' + c + '. How many were there before?',
      wrong: [[c + b, 'PLAN', ['Winning made the number bigger. To go back to the start, undo it.', 'Menang menambah guli. Untuk kembali ke permulaan, buat sebaliknya (tolak).']], [b, 'UNDERSTAND', ['That is how many were won.', 'Itu bilangan guli yang dimenangi.']], [a + 10, 'EXECUTE', ['Check the subtraction.', 'Semak tolakan.']]],
      hints: [['What happened to the marbles: did the number go up or down?', 'Guli bertambah atau berkurang?'], ['We know the end. To find the start, undo the change.', 'Kita tahu akhirnya. Untuk cari permulaan, buat sebaliknya.'], ['Undo “won ' + b + '” by taking away ' + b + ' from ' + c + '.', 'Tolak ' + b + ' daripada ' + c + '.']],
      show: [['The number went up by ' + b + '.', 'Guli bertambah ' + b + '.'], ['Go back: ' + c + ' − ' + b + ' = ' + a + '.', 'Kembali: ' + c + ' − ' + b + ' = ' + a + '.']],
      check: ['Check: ' + a + ' + ' + b + ' = ' + c + ' ✓', 'Semak: ' + a + ' + ' + b + ' = ' + c + ' ✓'] };
  } });

  /* ══════════ TIMES & SHARING ══════════ */
  T({ id: 'td-fact', skill: 'times-divide', level: 1, make: function (R) {
    var a = R.int(3, 9), b = R.int(3, 9);
    return { text: 'What is ' + a + ' × ' + b + '?', answer: a * b, step: a, bm: 'Berapakah ' + a + ' × ' + b + '?', simple: 'What is ' + a + ' groups of ' + b + '?',
      wrong: [[a * (b + 1), 'EXECUTE', ['That is ' + a + ' × ' + (b + 1) + '. One group too many.', 'Itu ' + a + ' × ' + (b + 1) + '. Terlebih satu kumpulan.']], [a * (b - 1), 'EXECUTE', ['That is ' + a + ' × ' + (b - 1) + '. One group too few.', 'Itu ' + a + ' × ' + (b - 1) + '. Terkurang satu kumpulan.']], [a + b, 'PLAN', ['You added. × means groups of.', 'Anda menambah. × bermaksud kumpulan.']]],
      hints: [[a + ' × ' + b + ' means ' + a + ' groups of ' + b + '.', a + ' × ' + b + ' bermaksud ' + a + ' kumpulan ' + b + '.'],
        ['Do you know ' + a + ' × ' + (b - 1) + '? Add one more ' + a + '.', 'Tahu ' + a + ' × ' + (b - 1) + '? Tambah satu lagi ' + a + '.'],
        [a + ' × ' + (b - 1) + ' = ' + a * (b - 1) + '. Now add ' + a + '.', a + ' × ' + (b - 1) + ' = ' + a * (b - 1) + '. Sekarang tambah ' + a + '.']],
      show: [[a + ' × ' + (b - 1) + ' = ' + a * (b - 1) + '.', a + ' × ' + (b - 1) + ' = ' + a * (b - 1) + '.'], [a * (b - 1) + ' + ' + a + ' = ' + a * b + '.', a * (b - 1) + ' + ' + a + ' = ' + a * b + '.']] };
  } });

  var SHARE = [['sweets', 'children', 'gula-gula', 'orang kanak-kanak', 'child'], ['stickers', 'friends', 'pelekat', 'orang kawan', 'friend'], ['rambutans', 'baskets', 'biji rambutan', 'bakul', 'basket'], ['pencils', 'pupils', 'batang pensel', 'orang murid', 'pupil']];
  T({ id: 'td-share', skill: 'times-divide', level: 2, make: function (R) {
    var s = R.pick(SHARE), g = R.int(3, 9), each = R.int(3, 12), total = g * each, bk = s[1] === 'baskets';
    return { text: 'There are ' + total + ' ' + s[0] + '.\nThey are ' + (bk ? 'put equally into ' : 'shared equally among ') + g + ' ' + s[1] + '.\nHow many ' + s[0] + (bk ? ' are in each basket?' : ' does each ' + s[4] + ' get?'),
      answer: each, keepWords: ['each'],
      bm: 'Ada ' + total + ' ' + s[2] + '. Semuanya dibahagi sama rata kepada ' + g + ' ' + s[3] + '. Berapakah bilangan ' + s[2] + ' bagi setiap satu?', simple: total + ' ' + s[0] + ' go to ' + g + ' ' + s[1] + ', the same number each. How many for one?',
      wrong: [[total - g, 'PLAN', ['You subtracted. Sharing equally uses division.', 'Anda menolak. Bahagi sama rata menggunakan bahagi.']], [each + 1, 'EXECUTE', ['Check: ' + g + ' × ' + (each + 1) + ' = ' + g * (each + 1) + ', not ' + total + '.', 'Semak: ' + g + ' × ' + (each + 1) + ' = ' + g * (each + 1) + ', bukan ' + total + '.']], [each - 1, 'EXECUTE', ['Check: ' + g + ' × ' + (each - 1) + ' = ' + g * (each - 1) + '.', 'Semak: ' + g + ' × ' + (each - 1) + ' = ' + g * (each - 1) + '.']]],
      hints: [['Are the ' + s[0] + ' joined or shared?', s[2] + ' itu digabung atau dikongsi?'], ['Sharing equally into groups uses division.', 'Bahagi sama rata ke dalam kumpulan menggunakan bahagi.'], ['Find ' + total + ' ÷ ' + g + '. Which number times ' + g + ' makes ' + total + '?', 'Cari ' + total + ' ÷ ' + g + '. Nombor apa darab ' + g + ' jadi ' + total + '?']],
      show: [[total + ' ÷ ' + g + ' = ' + each + ', because ' + g + ' × ' + each + ' = ' + total + '.', total + ' ÷ ' + g + ' = ' + each + ', kerana ' + g + ' × ' + each + ' = ' + total + '.']],
      check: ['Check: ' + g + ' × ' + each + ' = ' + total + ' ✓', 'Semak: ' + g + ' × ' + each + ' = ' + total + ' ✓'] };
  } });

  T({ id: 'td-groups', skill: 'times-divide', level: 3, make: function (R) {
    var item = R.pick(['pencils', 'crayons', 'buttons', 'cookies']), each = R.int(12, 48), n = R.int(3, 9), p = each * n;
    var ib = { pencils: 'batang pensel', crayons: 'batang krayon', buttons: 'biji butang', cookies: 'keping biskut' }[item], tens = Math.floor(each / 10) * 10;
    return { text: 'A box holds ' + each + ' ' + item + '.\nHow many ' + item + ' are in ' + n + ' boxes?', answer: p, step: 10,
      bm: 'Sebuah kotak memuatkan ' + each + ' ' + ib + '. Berapakah bilangan ' + ib + ' dalam ' + n + ' buah kotak?', simple: 'One box: ' + each + '. ' + n + ' boxes: how many?',
      wrong: [[each + n, 'PLAN', ['You added. There are ' + n + ' equal groups of ' + each + '.', 'Anda menambah. Ada ' + n + ' kumpulan yang sama, setiap satu ' + each + '.']], [tens * n, 'EXECUTE', ['Don’t forget to multiply the ones too.', 'Jangan lupa darab digit sa juga.']], [p + 10, 'EXECUTE', ['Check the ones: ' + (each % 10) + ' × ' + n + '.', 'Semak sa: ' + (each % 10) + ' × ' + n + '.']]],
      hints: [['Each box has the same number. How many boxes?', 'Setiap kotak sama banyak. Berapa kotak?'], ['Equal groups put together: multiply.', 'Kumpulan sama banyak digabung: darab.'], [each + ' × ' + n + ': do ' + tens + ' × ' + n + ' and ' + (each % 10) + ' × ' + n + ', then add.', each + ' × ' + n + ': kira ' + tens + ' × ' + n + ' dan ' + (each % 10) + ' × ' + n + ', kemudian tambah.']],
      show: [[each + ' × ' + n + ' = ' + tens * n + ' + ' + (each % 10) * n + ' = ' + p + '.', each + ' × ' + n + ' = ' + tens * n + ' + ' + (each % 10) * n + ' = ' + p + '.']] };
  } });

  T({ id: 'td-div', skill: 'times-divide', level: 2, make: function (R) {
    var d = R.int(2, 9), q = R.int(12, Math.floor(999 / d)), t = d * q;
    return { text: 'What is ' + num(t) + ' ÷ ' + d + '?', answer: q, bm: 'Berapakah ' + num(t) + ' ÷ ' + d + '?', simple: 'Share ' + num(t) + ' into ' + d + ' equal groups. How many in one group?',
      wrong: [[q + 1, 'EXECUTE', ['Check: ' + (q + 1) + ' × ' + d + ' = ' + (q + 1) * d + '.', 'Semak: ' + (q + 1) + ' × ' + d + ' = ' + (q + 1) * d + '.']], [t - d, 'PLAN', ['You subtracted ' + d + '. ÷ means share into equal groups.', 'Anda menolak ' + d + '. ÷ bermaksud bahagi sama rata.']], [q - 10, 'EXECUTE', ['Check the tens.', 'Semak puluh.']]],
      hints: [['How many groups of ' + d + ' are in ' + num(t) + '?', 'Berapa kumpulan ' + d + ' dalam ' + num(t) + '?'], ['Split ' + num(t) + ' into parts that are easy to divide by ' + d + '.', 'Pecahkan ' + num(t) + ' kepada bahagian yang mudah dibahagi dengan ' + d + '.'], ['Divide the hundreds first, then the tens, then the ones.', 'Bahagi ratus dahulu, kemudian puluh, kemudian sa.']],
      show: [[num(t) + ' ÷ ' + d + ' = ' + q + '.', num(t) + ' ÷ ' + d + ' = ' + q + '.'], ['Check with times: ' + q + ' × ' + d + ' = ' + num(t) + '.', 'Semak dengan darab: ' + q + ' × ' + d + ' = ' + num(t) + '.']],
      check: ['Check: ' + q + ' × ' + d + ' = ' + num(t) + ' ✓', 'Semak: ' + q + ' × ' + d + ' = ' + num(t) + ' ✓'] };
  } });

  T({ id: 'td-needed', skill: 'times-divide', level: 3, make: function (R) {
    var c = R.int(4, 9), p; do { p = R.int(20, 70); } while (p % c === 0);
    var fl = Math.floor(p / c), ans = fl + 1, rem = p - fl * c;
    return { text: p + ' pupils are going on a school trip.\nEach van can carry ' + c + ' pupils.\nHow many vans are needed?', answer: ans, keepWords: ['each'],
      bm: p + ' orang murid pergi lawatan sekolah. Setiap van boleh membawa ' + c + ' orang murid. Berapakah van yang diperlukan?', simple: p + ' pupils. One van takes ' + c + '. Every pupil needs a seat. How many vans?',
      wrong: [[fl, 'CHECK', ['After ' + fl + ' vans, some pupils are still waiting. They need a van too!', 'Selepas ' + fl + ' van, masih ada murid yang menunggu. Mereka perlukan van juga!']], [p - c, 'PLAN', ['You subtracted. Think about groups of ' + c + '.', 'Anda menolak. Fikir tentang kumpulan ' + c + '.']], [fl + 2, 'EXECUTE', ['Check how many pupils fit in the vans.', 'Semak berapa murid muat dalam van.']]],
      hints: [['How many pupils fit in one van?', 'Berapa murid muat dalam satu van?'], ['Find how many groups of ' + c + ' make ' + p + '. Are any pupils left over?', 'Cari berapa kumpulan ' + c + ' dalam ' + p + '. Ada murid yang berbaki?'], [p + ' ÷ ' + c + ' = ' + fl + ' remainder ' + rem + '. What happens to the pupils left over?', p + ' ÷ ' + c + ' = ' + fl + ' baki ' + rem + '. Bagaimana dengan murid yang berbaki?']],
      show: [[p + ' ÷ ' + c + ' = ' + fl + ' remainder ' + rem + '.', p + ' ÷ ' + c + ' = ' + fl + ' baki ' + rem + '.'], ['The ' + rem + ' pupils left over need one more van.', rem + ' murid yang berbaki perlukan satu van lagi.'], [fl + ' + 1 = ' + ans + ' vans.', fl + ' + 1 = ' + ans + ' buah van.']],
      why: { q: ['Why is the answer not ' + fl + '?', 'Kenapa jawapannya bukan ' + fl + '?'], options: [['Some pupils would be left with no van', 'Ada murid yang tiada van'], ['Because ' + fl + ' is too small a number', 'Kerana ' + fl + ' nombor yang terlalu kecil'], ['Vans always come in even numbers', 'Van sentiasa dalam nombor genap']], answer: 0 } };
  } });

  /* ══════════ DECIMALS ══════════ */
  T({ id: 'dec-sub1', skill: 'decimals', level: 1, make: function (R) {
    var a = R.int(25, 99), b = R.int(11, a - 6), ca = colAbs(a, b);
    return { text: 'What is ' + d1(a) + ' − ' + d1(b) + '?', answer: a - b, fmt: d1, bm: 'Berapakah ' + d1(a) + ' − ' + d1(b) + '?', simple: 'Take ' + d1(b) + ' away from ' + d1(a) + '.',
      wrong: [[a + b, 'PLAN', ['You added. Look at the sign.', 'Anda menambah. Lihat tanda.']], [a - b + 10, 'EXECUTE', ['Check the ones.', 'Semak sa.']], [ca !== a - b ? ca : a - b - 1, 'EXECUTE', ['Regroup when the top digit is smaller.', 'Kumpul semula apabila digit atas lebih kecil.']]],
      hints: [['Line up the decimal points first.', 'Susun titik perpuluhan dalam satu lajur dahulu.'], ['Subtract the tenths, then the ones.', 'Tolak persepuluh, kemudian sa.'], ['Tenths: ' + (a % 10) + ' − ' + (b % 10) + (a % 10 < b % 10 ? ' needs regrouping.' : '.'), 'Persepuluh: ' + (a % 10) + ' − ' + (b % 10) + (a % 10 < b % 10 ? ' perlu kumpul semula.' : '.')]],
      show: [['Line up the points: ' + d1(a) + ' − ' + d1(b) + '.', 'Susun titik perpuluhan: ' + d1(a) + ' − ' + d1(b) + '.'], ['Answer: ' + d1(a - b) + '.', 'Jawapan: ' + d1(a - b) + '.']],
      check: ['Check: ' + d1(a - b) + ' + ' + d1(b) + ' = ' + d1(a) + ' ✓', 'Semak: ' + d1(a - b) + ' + ' + d1(b) + ' = ' + d1(a) + ' ✓'] };
  } });

  T({ id: 'dec-sub2', skill: 'decimals', level: 2, make: function (R) {
    var a = R.int(35, 99), A = a * 10, B; do { B = R.int(105, A - 40); } while (B % 10 === 0);
    var ans = A - B;
    return { text: 'What is ' + d1(a) + ' − ' + d2(B) + '?', answer: ans, fmt: d2, bm: 'Berapakah ' + d1(a) + ' − ' + d2(B) + '?', simple: 'Take ' + d2(B) + ' away from ' + d1(a) + '.',
      wrong: [[colAbs(A, B), 'EXECUTE', ['In each column, if the top digit is smaller, regroup first.', 'Dalam setiap lajur, jika digit atas lebih kecil, kumpul semula dahulu.']], [ans + 10, 'EXECUTE', ['Check the tenths after regrouping.', 'Semak persepuluh selepas kumpul semula.']], [ans + 100, 'EXECUTE', ['Check the ones after regrouping.', 'Semak sa selepas kumpul semula.']]],
      hints: [['How many decimal places does each number have?', 'Berapa tempat perpuluhan bagi setiap nombor?'], ['Write ' + d1(a) + ' as ' + d2(A) + ' so both numbers have two decimal places.', 'Tulis ' + d1(a) + ' sebagai ' + d2(A) + ' supaya kedua-dua nombor ada dua tempat perpuluhan.'], ['Line up the points: ' + d2(A) + ' − ' + d2(B) + '. Start from the hundredths.', 'Susun titik: ' + d2(A) + ' − ' + d2(B) + '. Mula dari perseratus.']],
      show: [[d1(a) + ' = ' + d2(A) + '.', d1(a) + ' = ' + d2(A) + '.'], [d2(A) + ' − ' + d2(B) + ' = ' + d2(ans) + '.', d2(A) + ' − ' + d2(B) + ' = ' + d2(ans) + '.']],
      check: ['Check: ' + d2(ans) + ' + ' + d2(B) + ' = ' + d2(A) + ' ✓', 'Semak: ' + d2(ans) + ' + ' + d2(B) + ' = ' + d2(A) + ' ✓'] };
  } });

  T({ id: 'dec-frac', skill: 'decimals', level: 1, make: function (R) {
    if (R.chance(0.5)) {
      var t = R.int(1, 9);
      return { text: 'Which decimal is the same as ' + t + '/10?', answer: '0.' + t, bm: 'Nombor perpuluhan manakah sama dengan ' + t + '/10?', simple: 'Write ' + t + ' tenths as a decimal.',
        wrong: [['0.0' + t, 'CONCEPT', ['0.0' + t + ' is ' + t + ' hundredths. We need tenths.', '0.0' + t + ' ialah ' + t + ' perseratus. Kita perlukan persepuluh.']], [t + '.10', 'CONCEPT', ['The fraction line is not a decimal point.', 'Garis pecahan bukan titik perpuluhan.']], [t + '.0', 'CONCEPT', [t + '.0 is ' + t + ' whole ones.', t + '.0 ialah ' + t + ' sa.']]],
        hints: [[t + '/10 means ' + t + ' tenths.', t + '/10 bermaksud ' + t + ' persepuluh.'], ['Tenths are the first place after the decimal point.', 'Persepuluh ialah tempat pertama selepas titik perpuluhan.'], ['Write 0, then the point, then ' + t + '.', 'Tulis 0, kemudian titik, kemudian ' + t + '.']],
        show: [[t + '/10 = ' + t + ' tenths = 0.' + t + '.', t + '/10 = ' + t + ' persepuluh = 0.' + t + '.']] };
    }
    var hh = R.int(11, 99); if (hh % 10 === 0) hh++;
    return { text: 'Which decimal is the same as ' + hh + '/100?', answer: d2(hh), bm: 'Nombor perpuluhan manakah sama dengan ' + hh + '/100?', simple: 'Write ' + hh + ' hundredths as a decimal.',
      wrong: [[d1(hh), 'CONCEPT', [d1(hh) + ' is ' + hh + ' tenths. We need hundredths.', d1(hh) + ' ialah ' + hh + ' persepuluh. Kita perlukan perseratus.']], ['0.0' + hh, 'CONCEPT', ['Hundredths use two places after the point.', 'Perseratus menggunakan dua tempat selepas titik.']], [hh + '.100', 'CONCEPT', ['The fraction line is not a decimal point.', 'Garis pecahan bukan titik perpuluhan.']]],
      hints: [[hh + '/100 means ' + hh + ' hundredths.', hh + '/100 bermaksud ' + hh + ' perseratus.'], ['Hundredths use two places after the decimal point.', 'Perseratus menggunakan dua tempat selepas titik perpuluhan.'], ['Write 0, then the point, then ' + hh + '.', 'Tulis 0, kemudian titik, kemudian ' + hh + '.']],
      show: [[hh + '/100 = ' + d2(hh) + '.', hh + '/100 = ' + d2(hh) + '.']] };
  } });

  T({ id: 'dec-ctx', skill: 'decimals', level: 3, make: function (R) {
    var n = R.pick(NAMES), a = R.int(25, 95), A = a * 10, B = R.mult(105, A - 30, 5), rope = R.chance(0.5);
    if (B % 10 === 0) B += 5;
    var ans = A - B, u = rope ? ' m' : ' l';
    var text = rope ? 'A rope is ' + d1(a) + ' m long.\n' + n + ' cuts off ' + d2(B) + ' m.\nHow long is the rope now?' : 'A jug has ' + d1(a) + ' l of water.\n' + n + ' pours out ' + d2(B) + ' l.\nHow much water is left?';
    return { text: text, answer: ans, fmt: function (x) { return d2(x) + u; }, keepWords: ['left'],
      bm: rope ? 'Seutas tali panjangnya ' + d1(a) + ' m. ' + n + ' memotong ' + d2(B) + ' m. Berapakah panjang tali itu sekarang?' : 'Sebuah jag berisi ' + d1(a) + ' l air. ' + n + ' menuang keluar ' + d2(B) + ' l. Berapakah isi padu air yang tinggal?',
      simple: (rope ? 'The rope is ' + d1(a) + ' m. ' + d2(B) + ' m is cut away.' : 'The jug has ' + d1(a) + ' l. ' + d2(B) + ' l goes out.') + ' How much is still there?',
      wrong: [[A + B, 'UNDERSTAND', rope ? ['You added. Cutting makes the rope shorter.', 'Anda menambah. Memotong menjadikan tali lebih pendek.'] : ['You added. Pouring out leaves less water.', 'Anda menambah. Menuang keluar menjadikan air berkurang.']], [ans + 10, 'EXECUTE', ['Check the tenths after regrouping.', 'Semak persepuluh selepas kumpul semula.']], [colAbs(A, B), 'CONCEPT', ['Write ' + d1(a) + ' as ' + d2(A) + ' and line up the points.', 'Tulis ' + d1(a) + ' sebagai ' + d2(A) + ' dan susun titik perpuluhan.']]],
      hints: [['After that, is there more or less?', 'Selepas itu, bertambah atau berkurang?'], ['Less means subtract. Give both numbers two decimal places.', 'Berkurang bermaksud tolak. Beri kedua-dua nombor dua tempat perpuluhan.'], ['Work out ' + d2(A) + ' − ' + d2(B) + ' with the points lined up.', 'Kira ' + d2(A) + ' − ' + d2(B) + ' dengan titik disusun.']],
      show: [[d1(a) + ' = ' + d2(A) + '.', d1(a) + ' = ' + d2(A) + '.'], [d2(A) + ' − ' + d2(B) + ' = ' + d2(ans) + '.', d2(A) + ' − ' + d2(B) + ' = ' + d2(ans) + '.']],
      check: ['Check: ' + d2(ans) + ' + ' + d2(B) + ' = ' + d2(A) + ' ✓', 'Semak: ' + d2(ans) + ' + ' + d2(B) + ' = ' + d2(A) + ' ✓'] };
  } });

  T({ id: 'dec-add', skill: 'decimals', level: 2, make: function (R) {
    var a, b; do { a = R.int(105, 690); b = R.int(105, 390); } while ((a % 10) + (b % 10) < 10);
    return { text: 'What is ' + d2(a) + ' + ' + d2(b) + '?', answer: a + b, fmt: d2, bm: 'Berapakah ' + d2(a) + ' + ' + d2(b) + '?', simple: 'Add ' + d2(a) + ' and ' + d2(b) + '.',
      wrong: [[a + b - 10, 'EXECUTE', ['Check the carry from the hundredths.', 'Semak nilai yang dibawa dari perseratus.']], [Math.abs(a - b), 'PLAN', ['You subtracted. Look at the sign.', 'Anda menolak. Lihat tanda.']], [a + b + 100, 'EXECUTE', ['Check the ones.', 'Semak sa.']]],
      hints: [['Line up the decimal points.', 'Susun titik perpuluhan.'], ['Add the hundredths first. Is there a carry?', 'Tambah perseratus dahulu. Ada nilai yang dibawa?'], ['Then add the tenths, then the ones.', 'Kemudian tambah persepuluh, kemudian sa.']],
      show: [['Line up the points and add each column.', 'Susun titik dan tambah setiap lajur.'], [d2(a) + ' + ' + d2(b) + ' = ' + d2(a + b) + '.', d2(a) + ' + ' + d2(b) + ' = ' + d2(a + b) + '.']] };
  } });

  /* ══════════ MONEY ══════════ */
  var ITEMS = [['a storybook', 'sebuah buku cerita'], ['lunch', 'makan tengah hari'], ['a pencil box', 'sebuah kotak pensel'], ['a toy car', 'sebuah kereta mainan'], ['a water bottle', 'sebuah botol air'], ['a set of shuttlecocks', 'satu set bulu tangkis']];
  T({ id: 'mon-left', skill: 'money', level: 2, make: function (R) {
    var n = R.pick(NAMES), H = R.pick([1000, 1500, 2000, 3000, 5000]), s; do { s = R.mult(105, H - 120, 5); } while (s % 100 === 0);
    var it = R.pick(ITEMS), ans = H - s;
    return { text: n + ' has ' + rm(H) + '.\n' + n + ' spends ' + rm(s) + ' on ' + it[0] + '.\nHow much money does ' + n + ' have left?', answer: ans, fmt: rm, keepWords: ['left'],
      bm: n + ' ada ' + rm(H) + '. ' + n + ' membelanjakan ' + rm(s) + ' untuk ' + it[1] + '. Berapakah baki wang ' + n + '?', simple: n + ' has ' + rm(H) + '. ' + n + ' uses ' + rm(s) + ' to buy something. How much money is still there?',
      wrong: [[H + s, 'UNDERSTAND', ['You added. After spending, is there more or less money?', 'Anda menambah. Selepas berbelanja, wang bertambah atau berkurang?']], [ans + 100, 'EXECUTE', ['Check the ringgit after regrouping.', 'Semak ringgit selepas kumpul semula.']], [ans + 10, 'EXECUTE', ['Check the sen after regrouping.', 'Semak sen selepas kumpul semula.']]],
      hints: [['What are we trying to find?', 'Apa yang kita cari?'], [n + ' starts with money and then spends some. Should the amount become bigger or smaller?', n + ' ada wang, kemudian berbelanja. Wangnya bertambah atau berkurang?'], ['Start with ' + rm(H) + ' and place ' + rm(s) + ' underneath. Keep the decimal points aligned.', 'Tulis ' + rm(H) + ' dan letak ' + rm(s) + ' di bawahnya. Pastikan titik perpuluhan sebaris.']],
      show: [['Spending makes the money smaller, so subtract.', 'Berbelanja mengurangkan wang, jadi tolak.'], [rm(H) + ' − ' + rm(s) + ' = ' + rm(ans) + '.', rm(H) + ' − ' + rm(s) + ' = ' + rm(ans) + '.']],
      check: ['Check: ' + rm(ans) + ' + ' + rm(s) + ' = ' + rm(H) + ' ✓', 'Semak: ' + rm(ans) + ' + ' + rm(s) + ' = ' + rm(H) + ' ✓'],
      why: { q: ['How did you know to subtract?', 'Bagaimana anda tahu perlu tolak?'], options: [['Spending makes the money smaller', 'Berbelanja mengurangkan wang'], ['The numbers have decimal points', 'Nombornya ada titik perpuluhan'], ['Money questions always use subtract', 'Soalan wang sentiasa tolak']], answer: 0 } };
  } });

  T({ id: 'mon-total', skill: 'money', level: 1, make: function (R) {
    var a = R.mult(120, 990, 10), b = R.mult(110, 890, 10), p = R.pick([['A pen', 'a ruler', 'Sebatang pen', 'sebatang pembaris'], ['A drink', 'a curry puff', 'Segelas minuman', 'sebiji karipap'], ['A notebook', 'an eraser', 'Sebuah buku nota', 'sebiji pemadam']]);
    return { text: p[0] + ' costs ' + rm(a) + '.\n' + h.cap(p[1]) + ' costs ' + rm(b) + '.\nWhat is the total cost?', answer: a + b, fmt: rm, step: 10,
      bm: p[2] + ' berharga ' + rm(a) + '. ' + h.cap(p[3]) + ' berharga ' + rm(b) + '. Berapakah jumlah harganya?', simple: 'How much for both things together?',
      wrong: [[Math.abs(a - b), 'UNDERSTAND', ['You found the difference. “Total” joins the prices.', 'Anda mencari beza. “Jumlah” menggabungkan harga.']], [a + b + 100, 'EXECUTE', ['Check the ringgit.', 'Semak ringgit.']], [a + b - 10, 'EXECUTE', ['Check the sen.', 'Semak sen.']]],
      hints: [['Are we joining the prices or comparing them?', 'Kita menggabungkan atau membandingkan harga?'], ['“Total” means add.', '“Jumlah” bermaksud tambah.'], ['Add the sen first, then the ringgit.', 'Tambah sen dahulu, kemudian ringgit.']],
      show: [['Total means add.', 'Jumlah bermaksud tambah.'], [rm(a) + ' + ' + rm(b) + ' = ' + rm(a + b) + '.', rm(a) + ' + ' + rm(b) + ' = ' + rm(a + b) + '.']] };
  } });

  T({ id: 'mon-change', skill: 'money', level: 3, make: function (R) {
    var n = R.pick(NAMES), P = R.pick([1000, 2000, 5000]), c; do { c = R.mult(130, P - 150, 10); } while (c % 100 === 0);
    var it = R.pick(ITEMS), ans = P - c;
    return { text: n + ' pays ' + rm(P) + ' for ' + it[0] + ' that costs ' + rm(c) + '.\nHow much change does ' + n + ' get?', answer: ans, fmt: rm,
      bm: n + ' membayar ' + rm(P) + ' untuk ' + it[1] + ' yang berharga ' + rm(c) + '. Berapakah baki wang yang ' + n + ' terima?', simple: n + ' gives ' + rm(P) + '. The price is ' + rm(c) + '. How much money comes back?',
      wrong: [[P + c, 'UNDERSTAND', ['You added. Change is what comes back after paying.', 'Anda menambah. Baki wang ialah wang yang dipulangkan selepas membayar.']], [ans + 100, 'EXECUTE', ['Check the ringgit after regrouping.', 'Semak ringgit selepas kumpul semula.']], [ans + 20, 'EXECUTE', ['Check the sen.', 'Semak sen.']]],
      hints: [['What is “change” in a shop?', 'Apakah “baki wang” di kedai?'], ['Change is what is left from the money paid. Which operation?', 'Baki wang ialah wang yang tinggal selepas membayar. Operasi apa?'], ['Write ' + rm(P) + ' − ' + rm(c) + ' with the decimal points lined up.', 'Tulis ' + rm(P) + ' − ' + rm(c) + ' dengan titik perpuluhan sebaris.']],
      show: [['Change = money paid − price.', 'Baki wang = wang dibayar − harga.'], [rm(P) + ' − ' + rm(c) + ' = ' + rm(ans) + '.', rm(P) + ' − ' + rm(c) + ' = ' + rm(ans) + '.']],
      check: ['Check: ' + rm(c) + ' + ' + rm(ans) + ' = ' + rm(P) + ' ✓', 'Semak: ' + rm(c) + ' + ' + rm(ans) + ' = ' + rm(P) + ' ✓'] };
  } });

  var FOODS = [['Nasi lemak', 'bungkus nasi lemak'], ['Roti canai', 'keping roti canai'], ['A bowl of mee soup', 'mangkuk mi sup'], ['A cup of teh tarik', 'cawan teh tarik']];
  T({ id: 'mon-multi', skill: 'money', level: 2, make: function (R) {
    var f = R.pick(FOODS), p; do { p = R.mult(150, 690, 10); } while (p % 100 === 0);
    var q = R.int(2, 5), n = R.pick(NAMES), ans = p * q;
    return { text: f[0] + ' costs ' + rm(p) + ' each.\n' + n + ' buys ' + q + '.\nHow much does ' + n + ' pay?', answer: ans, fmt: rm, keepWords: ['each'], step: 10,
      bm: 'Harga satu ' + f[1] + ' ialah ' + rm(p) + '. ' + n + ' membeli ' + q + '. Berapakah yang ' + n + ' bayar?', simple: 'One is ' + rm(p) + '. ' + n + ' takes ' + q + '. How much money?',
      wrong: [[Math.floor(p / 100) * 100 * q + p % 100, 'EXECUTE', ['Multiply the sen part too.', 'Darab bahagian sen juga.']], [p * (q - 1), 'EXECUTE', ['Count the items again: ' + q + '.', 'Kira semula bilangannya: ' + q + '.']], [p + q * 100, 'PLAN', ['Buying ' + q + ' at the same price means ' + q + ' equal groups.', 'Membeli ' + q + ' dengan harga yang sama bermaksud ' + q + ' kumpulan sama.']]],
      hints: [['How many, and what does one cost?', 'Berapa banyak, dan berapa harga satu?'], [q + ' at the same price: multiply (or add ' + q + ' times).', q + ' dengan harga sama: darab (atau tambah ' + q + ' kali).'], ['Multiply the ringgit and the sen separately, then add.', 'Darab ringgit dan sen secara berasingan, kemudian tambah.']],
      show: [[rm(p) + ' × ' + q + ' = ' + rm(ans) + '.', rm(p) + ' × ' + q + ' = ' + rm(ans) + '.']] };
  } });

  T({ id: 'mon-sen', skill: 'money', level: 1, make: function (R) {
    var r = R.int(105, 995); if (r % 100 === 0) r += 5;
    var rg = Math.floor(r / 100);
    if (R.chance(0.5)) {
      return { text: 'How many sen are in ' + rm(r) + '?', answer: r + ' sen', bm: 'Berapakah sen dalam ' + rm(r) + '?', simple: 'Write ' + rm(r) + ' using only sen.',
        wrong: [[r * 10 + ' sen', 'CONCEPT', ['RM1 = 100 sen, not 1 000 sen.', 'RM1 = 100 sen, bukan 1 000 sen.']], [(r % 100) + ' sen', 'CONCEPT', ['Don’t forget the ringgit. RM1 = 100 sen.', 'Jangan lupa ringgit. RM1 = 100 sen.']], [rg + ' sen', 'CONCEPT', ['RM1 = 100 sen.', 'RM1 = 100 sen.']]],
        hints: [['How many sen make RM1?', 'Berapa sen sama dengan RM1?'], ['RM1 = 100 sen. How many ringgit are there?', 'RM1 = 100 sen. Ada berapa ringgit?'], ['Change the ringgit to sen, then add the sen.', 'Tukar ringgit kepada sen, kemudian tambah sen.']],
        show: [['RM' + rg + ' = ' + rg * 100 + ' sen.', 'RM' + rg + ' = ' + rg * 100 + ' sen.'], [rg * 100 + ' + ' + (r % 100) + ' = ' + r + ' sen.', rg * 100 + ' + ' + (r % 100) + ' = ' + r + ' sen.']] };
    }
    return { text: 'Write ' + r + ' sen in ringgit.', answer: rm(r), bm: 'Tulis ' + r + ' sen dalam ringgit.', simple: 'Change ' + r + ' sen to RM.',
      wrong: [['RM' + r + '.00', 'CONCEPT', ['100 sen = RM1. ' + r + ' sen is not ' + r + ' ringgit.', '100 sen = RM1. ' + r + ' sen bukan ' + r + ' ringgit.']], [rm(r * 10), 'CONCEPT', ['100 sen make RM1.', '100 sen = RM1.']], ['RM0.' + r, 'CONCEPT', ['How many whole ringgit are in ' + r + ' sen?', 'Ada berapa ringgit dalam ' + r + ' sen?']]],
      hints: [['How many sen make RM1?', 'Berapa sen sama dengan RM1?'], ['100 sen = RM1. How many hundreds are in ' + r + '?', '100 sen = RM1. Ada berapa ratus dalam ' + r + '?'], ['The hundreds become ringgit. The rest stays as sen.', 'Ratus menjadi ringgit. Bakinya kekal sebagai sen.']],
      show: [[r + ' sen = ' + rm(r) + '.', r + ' sen = ' + rm(r) + '.']] };
  } });
})();
