/* Generators: fractions, percentages, 24-hour time, duration, measurement. Bilingual. */
(function () {
  var G = FMQ.gen, T = G.T, h = G.h, num = h.num, pad = h.pad, t24 = h.t24, t24b = h.t24b, t12 = h.t12, dur = h.dur, durBm = h.durBm, NAMES = h.NAMES;

  /* ══════════ FRACTIONS ══════════ */
  T({ id: 'fr-shaded', skill: 'fractions', level: 1, make: function (R) {
    var n = R.int(3, 8), k = R.int(1, n - 1);
    return { text: 'This bar is cut into ' + n + ' equal parts.\nWhat fraction is shaded?', visual: { kind: 'bar', parts: n, shaded: k }, answer: k + '/' + n,
      bm: 'Bar ini dibahagi kepada ' + n + ' bahagian yang sama besar. Apakah pecahan bagi bahagian berlorek?', simple: 'The bar has ' + n + ' same-size parts. What fraction is coloured?',
      wrong: [[(n - k) + '/' + n, 'UNDERSTAND', ['That is the part that is not shaded.', 'Itu bahagian yang tidak berlorek.']], [k + '/' + (n - k), 'CONCEPT', ['The bottom number counts all the parts.', 'Nombor bawah (penyebut) mengira semua bahagian.']], [n + '/' + k, 'CONCEPT', ['Which number goes on top: shaded parts or all parts?', 'Nombor manakah di atas: bahagian berlorek atau semua bahagian?']], [k + '/' + (n + 1), 'EXECUTE', ['Count all the parts again.', 'Kira semua bahagian sekali lagi.']]],
      hints: [['How many equal parts are there?', 'Ada berapa bahagian yang sama besar?'], ['The bottom number shows all the parts. The top number shows the shaded parts.', 'Nombor bawah = semua bahagian. Nombor atas = bahagian berlorek.'], ['Count the shaded parts. That goes on top.', 'Kira bahagian berlorek. Itu nombor atas.']],
      show: [[n + ' equal parts → bottom number ' + n + '.', n + ' bahagian sama besar → nombor bawah ' + n + '.'], [k + ' shaded → top number ' + k + '.', k + ' berlorek → nombor atas ' + k + '.'], ['Fraction: ' + k + '/' + n + '.', 'Pecahan: ' + k + '/' + n + '.']] };
  } });

  T({ id: 'fr-of', skill: 'fractions', level: 2, make: function (R) {
    var n = R.pick([2, 3, 4, 5, 6, 8, 10]), k = R.int(1, n - 1), m = R.int(2, 9), t = n * m;
    return { text: 'What is ' + k + '/' + n + ' of ' + t + '?', answer: k * m, keepWords: ['of'],
      bm: 'Berapakah ' + k + '/' + n + ' daripada ' + t + '?', simple: 'Share ' + t + ' into ' + n + ' equal groups. How much is in ' + k + ' group' + (k > 1 ? 's' : '') + '?',
      wrong: [[k > 1 ? m : t - m, k > 1 ? 'PLAN' : 'UNDERSTAND', k > 1 ? ['That is 1/' + n + '. We need ' + k + ' parts.', 'Itu 1/' + n + '. Kita perlukan ' + k + ' bahagian.'] : ['That is the part that is left.', 'Itu bahagian yang tinggal.']], [t * k, 'CONCEPT', ['A fraction of an amount is smaller than the amount. Share first.', 'Pecahan daripada sesuatu nilai lebih kecil daripada nilai itu. Bahagi dahulu.']], [t - k * m, 'UNDERSTAND', ['That is the part that is left over.', 'Itu bahagian yang berbaki.']]],
      hints: [['What does the ' + n + ' in ' + k + '/' + n + ' tell you to do with ' + t + '?', 'Apakah maksud ' + n + ' dalam ' + k + '/' + n + ' bagi ' + t + '?'], ['First find 1/' + n + ' of ' + t + ' by sharing into ' + n + ' equal groups.', 'Cari 1/' + n + ' daripada ' + t + ' dahulu: bahagi kepada ' + n + ' kumpulan sama.'], ['1/' + n + ' of ' + t + ' is one group. ' + k + '/' + n + ' is ' + k + ' of those groups.', '1/' + n + ' daripada ' + t + ' ialah satu kumpulan. ' + k + '/' + n + ' ialah ' + k + ' kumpulan.']],
      show: [[t + ' ÷ ' + n + ' = ' + m + ', so 1/' + n + ' of ' + t + ' = ' + m + '.', t + ' ÷ ' + n + ' = ' + m + ', jadi 1/' + n + ' daripada ' + t + ' = ' + m + '.'], [k + ' × ' + m + ' = ' + k * m + '.', k + ' × ' + m + ' = ' + k * m + '.']] };
  } });

  var FR_THINGS = [['cupcakes', 'chocolate', 'biji kek cawan', 'berperisa coklat'], ['marbles', 'blue', 'biji guli', 'berwarna biru'], ['pupils', 'girls', 'orang murid', 'perempuan'], ['durians', 'sold', 'biji durian', 'telah dijual']];
  T({ id: 'fr-ofctx', skill: 'fractions', level: 3, make: function (R) {
    var th = R.pick(FR_THINGS), n = R.pick([3, 4, 5, 6, 8]), k = R.int(1, n - 1), m = R.int(2, 8), t = n * m;
    var line = k + '/' + n + ' of them are ' + th[1] + '.';
    return { text: 'There are ' + t + ' ' + th[0] + '.\n' + line + '\nHow many ' + (th[1] === 'girls' ? 'girls are there?' : th[0] + ' are ' + th[1] + '?'), answer: k * m, keepWords: ['of'],
      bm: 'Ada ' + t + ' ' + th[2] + '. ' + k + '/' + n + ' daripadanya ' + th[3] + '. Berapakah bilangannya?', simple: t + ' ' + th[0] + ' in ' + n + ' equal groups. ' + k + ' group' + (k > 1 ? 's are' : ' is') + ' ' + th[1] + '. How many?',
      wrong: [[k > 1 ? m : t - m, 'PLAN', k > 1 ? ['That is 1/' + n + '. We need ' + k + ' groups.', 'Itu 1/' + n + '. Kita perlukan ' + k + ' kumpulan.'] : ['That is the rest.', 'Itu bakinya.']], [t - k * m, 'UNDERSTAND', ['That is the other part.', 'Itu bahagian yang lain.']], [t * k, 'CONCEPT', ['Share ' + t + ' into ' + n + ' groups first.', 'Bahagi ' + t + ' kepada ' + n + ' kumpulan dahulu.']]],
      hints: [['What does the ' + n + ' in ' + k + '/' + n + ' tell you to do?', 'Apakah maksud ' + n + ' dalam ' + k + '/' + n + '?'], ['Share ' + t + ' into ' + n + ' equal groups first.', 'Bahagi ' + t + ' kepada ' + n + ' kumpulan sama dahulu.'], ['One group is 1/' + n + '. How many groups do we need?', 'Satu kumpulan ialah 1/' + n + '. Berapa kumpulan kita perlukan?']],
      show: [[t + ' ÷ ' + n + ' = ' + m + '.', t + ' ÷ ' + n + ' = ' + m + '.'], [k + ' × ' + m + ' = ' + k * m + '.', k + ' × ' + m + ' = ' + k * m + '.']],
      check: ['Check: ' + k * m + ' is less than ' + t + ' ✓', 'Semak: ' + k * m + ' kurang daripada ' + t + ' ✓'] };
  } });

  T({ id: 'fr-equiv', skill: 'fractions', level: 1, make: function (R) {
    var b = R.int(2, 5), a = R.int(1, b - 1), s = R.int(2, 4);
    var mul = ['Multiply the top and the bottom by the same number.', 'Darab nombor atas dan bawah dengan nombor yang sama.'];
    return { text: 'Which fraction is equal to ' + a + '/' + b + '?', visual: { kind: 'bar', parts: b, shaded: a }, answer: (a * s) + '/' + (b * s),
      bm: 'Pecahan manakah sama nilai dengan ' + a + '/' + b + '?', simple: 'Which fraction is the same amount as ' + a + '/' + b + '?',
      wrong: [[(a + s) + '/' + (b + s), 'CONCEPT', ['Adding the same number does not keep fractions equal. Multiply instead.', 'Menambah nombor yang sama tidak mengekalkan nilai pecahan. Darab.']], [(a * s) + '/' + b, 'CONCEPT', mul], [a + '/' + (b * s), 'CONCEPT', mul]],
      hints: [['Equal fractions show the same amount.', 'Pecahan setara menunjukkan nilai yang sama.'], mul, ['Try multiplying ' + a + '/' + b + ' by ' + s + ' on top and bottom.', 'Cuba darab ' + a + '/' + b + ' dengan ' + s + ' di atas dan di bawah.']],
      show: [[a + ' × ' + s + ' = ' + a * s + ', ' + b + ' × ' + s + ' = ' + b * s + '.', a + ' × ' + s + ' = ' + a * s + ', ' + b + ' × ' + s + ' = ' + b * s + '.'], [a + '/' + b + ' = ' + (a * s) + '/' + (b * s) + '.', a + '/' + b + ' = ' + (a * s) + '/' + (b * s) + '.']] };
  } });

  T({ id: 'fr-compare', skill: 'fractions', level: 2, make: function (R) {
    var ds = R.shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 4), big = R.chance(0.5);
    var ans = big ? Math.min.apply(null, ds) : Math.max.apply(null, ds);
    var msg = ['With 1 on top, a bigger bottom number means smaller pieces.', 'Jika nombor atas 1, nombor bawah yang besar bermaksud kepingan lebih kecil.'];
    return { text: 'Which is the ' + (big ? 'largest' : 'smallest') + ' fraction?', answer: '1/' + ans,
      bm: 'Pecahan manakah yang paling ' + (big ? 'besar' : 'kecil') + '?', simple: 'Which piece is the ' + (big ? 'biggest' : 'smallest') + '?',
      wrong: ds.filter(function (d) { return d !== ans; }).map(function (d) { return ['1/' + d, 'CONCEPT', msg]; }),
      hints: [['All the fractions have 1 on top. What does the bottom number tell us?', 'Semua pecahan ada 1 di atas. Apa maksud nombor bawah?'], ['The bottom number is how many pieces one whole is cut into.', 'Nombor bawah ialah bilangan kepingan satu benda dipotong.'], big ? ['More pieces means smaller pieces. Find the fewest pieces.', 'Lebih banyak kepingan, lebih kecil setiap kepingan. Cari yang paling sedikit kepingan.'] : ['More pieces means smaller pieces. Find the most pieces.', 'Lebih banyak kepingan, lebih kecil setiap kepingan. Cari yang paling banyak kepingan.']],
      show: [['1/' + ans + ' cuts the whole into ' + ans + ' pieces.', '1/' + ans + ' memotong satu benda kepada ' + ans + ' kepingan.'], ['So 1/' + ans + ' is the ' + (big ? 'largest' : 'smallest') + '.', 'Jadi 1/' + ans + ' paling ' + (big ? 'besar' : 'kecil') + '.']] };
  } });

  /* ══════════ PERCENTAGES ══════════ */
  T({ id: 'pc-100', skill: 'percent', level: 1, make: function (R) {
    var n = R.int(3, 97); if (n % 10 === 0) n++;
    return { text: 'Write ' + n + '/100 as a percentage.', answer: n + '%', bm: 'Tulis ' + n + '/100 sebagai peratus.', simple: n + ' out of 100. What percent is that?',
      wrong: [[(n * 10) + '%', 'CONCEPT', ['Out of 100, the top number is the percent.', 'Daripada 100, nombor atas ialah peratusnya.']], [(100 - n) + '%', 'UNDERSTAND', ['That is the part that is left.', 'Itu bahagian yang tinggal.']], [Math.round(n / 10) + '%', 'CONCEPT', ['Percent means “out of 100”.', 'Peratus bermaksud “daripada 100”.']]],
      hints: [['Percent means “out of 100”.', 'Peratus bermaksud “daripada 100”.'], ['The fraction already has 100 at the bottom.', 'Pecahan ini sudah ada 100 di bawah.'], ['The top number becomes the percentage.', 'Nombor atas menjadi peratus.']],
      show: [[n + '/100 means ' + n + ' out of 100 = ' + n + '%.', n + '/100 bermaksud ' + n + ' daripada 100 = ' + n + '%.']] };
  } });

  T({ id: 'pc-10', skill: 'percent', level: 2, make: function (R) {
    var k = R.int(1, 9);
    return { text: k + '/10 = ?%', answer: (k * 10) + '%', bm: k + '/10 = ?%', simple: 'Write ' + k + ' tenths as a percent.',
      wrong: [[k + '%', 'CONCEPT', [k + '% is ' + k + ' out of 100. Our fraction is out of 10.', k + '% ialah ' + k + ' daripada 100. Pecahan kita daripada 10.']], [(k + 10) + '%', 'CONCEPT', ['We don’t add. Make the bottom 100.', 'Jangan tambah. Jadikan nombor bawah 100.']], [(100 - k * 10) + '%', 'UNDERSTAND', ['That is the other part.', 'Itu bahagian yang lain.']]],
      hints: [['Percent means out of 100. What is the bottom number now?', 'Peratus bermaksud daripada 100. Apa nombor bawah sekarang?'], ['Change 10 into 100. What do you multiply by?', 'Tukar 10 kepada 100. Darab dengan berapa?'], ['Multiply the top and bottom by 10.', 'Darab nombor atas dan bawah dengan 10.']],
      show: [[k + '/10 = ' + k * 10 + '/100 = ' + k * 10 + '%.', k + '/10 = ' + k * 10 + '/100 = ' + k * 10 + '%.']] };
  } });

  var PC_SCENES = [['flowers', 'red', 'kuntum bunga', 'berwarna merah'], ['pupils', 'wearing glasses', 'orang murid', 'memakai cermin mata'], ['marbles', 'blue', 'biji guli', 'berwarna biru'], ['seats', 'taken', 'buah kerusi', 'telah diduduki']];
  T({ id: 'pc-ctx', skill: 'percent', level: 3, make: function (R) {
    var den = R.pick([10, 20, 25, 50]), k = R.int(1, den - 1), sc = R.pick(PC_SCENES), p = k * 100 / den, f = 100 / den;
    return { text: 'There are ' + den + ' ' + sc[0] + '.\n' + k + ' ' + (k === 1 ? 'is' : 'are') + ' ' + sc[1] + '.\nWhat percentage ' + (k === 1 ? 'is' : 'are') + ' ' + sc[1] + '?', answer: p + '%',
      visual: den === 10 && sc[0] === 'flowers' ? { kind: 'flowers', total: 10, red: k } : undefined,
      bm: 'Ada ' + den + ' ' + sc[2] + '. ' + k + ' ' + sc[3] + '. Berapakah peratusnya?', simple: k + ' out of ' + den + ' are ' + sc[1] + '. What percent is that?',
      wrong: [[k + '%', 'CONCEPT', ['There are ' + den + ', not 100. Change to “out of 100”.', 'Ada ' + den + ', bukan 100. Tukar kepada “daripada 100”.']], [(100 - p) + '%', 'UNDERSTAND', ['That is the other part.', 'Itu bahagian yang lain.']], [(p + 10) + '%', 'EXECUTE', ['Check what you multiplied by.', 'Semak nombor yang anda darab.']]],
      hints: [['Write it as a fraction first: ' + k + ' out of ' + den + '.', 'Tulis sebagai pecahan dahulu: ' + k + ' daripada ' + den + '.'], ['Make the bottom number 100. What do you multiply ' + den + ' by?', 'Jadikan nombor bawah 100. ' + den + ' didarab dengan berapa?'], [den + ' × ' + f + ' = 100. Multiply ' + k + ' by ' + f + ' too.', den + ' × ' + f + ' = 100. Darab ' + k + ' dengan ' + f + ' juga.']],
      show: [[k + '/' + den + ' = ' + p + '/100.', k + '/' + den + ' = ' + p + '/100.'], [p + '/100 = ' + p + '%.', p + '/100 = ' + p + '%.']] };
  } });

  var PC_FR = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80], [1, 10, 10], [3, 10, 30], [9, 10, 90], [1, 20, 5], [3, 20, 15], [7, 20, 35], [1, 25, 4], [2, 25, 8], [1, 50, 2]];
  T({ id: 'pc-frac', skill: 'percent', level: 2, make: function (R) {
    var f = R.pick(PC_FR), x = 100 / f[1];
    return { text: 'Write ' + f[0] + '/' + f[1] + ' as a percentage.', answer: f[2] + '%', bm: 'Tulis ' + f[0] + '/' + f[1] + ' sebagai peratus.', simple: f[0] + '/' + f[1] + ' is how many percent?',
      wrong: [['' + f[0] + f[1] + '%', 'CONCEPT', ['We don’t write the digits side by side. Make the bottom 100.', 'Jangan tulis digit bersebelahan. Jadikan nombor bawah 100.']], [f[1] + '%', 'CONCEPT', ['Change the bottom number to 100 first.', 'Tukar nombor bawah kepada 100 dahulu.']], [(100 - f[2]) + '%', 'UNDERSTAND', ['That is the other part.', 'Itu bahagian yang lain.']], [f[0] + '%', 'CONCEPT', ['The fraction is out of ' + f[1] + ', not 100.', 'Pecahan ini daripada ' + f[1] + ', bukan 100.']]],
      hints: [['What do you multiply ' + f[1] + ' by to make 100?', f[1] + ' didarab dengan berapa untuk jadi 100?'], [f[1] + ' × ' + x + ' = 100. Do the same to the top.', f[1] + ' × ' + x + ' = 100. Buat yang sama pada nombor atas.'], [f[0] + ' × ' + x + ' = ?', f[0] + ' × ' + x + ' = ?']],
      show: [[f[0] + '/' + f[1] + ' = ' + f[2] + '/100 = ' + f[2] + '%.', f[0] + '/' + f[1] + ' = ' + f[2] + '/100 = ' + f[2] + '%.']] };
  } });

  T({ id: 'pc-left', skill: 'percent', level: 3, make: function (R) {
    var den = R.pick([4, 5, 10, 20]), k = R.int(1, den - 1), food = R.pick([['pizza', 'piza'], ['cake', 'kek'], ['watermelon', 'tembikai']]), n = R.pick(NAMES), left = (den - k) * 100 / den;
    return { text: 'A ' + food[0] + ' is cut into ' + den + ' equal pieces.\n' + n + ' eats ' + k + ' piece' + (k > 1 ? 's' : '') + '.\nWhat percentage of the ' + food[0] + ' is left?', answer: left + '%', keepWords: ['left'],
      bm: 'Sebiji ' + food[1] + ' dipotong kepada ' + den + ' keping yang sama besar. ' + n + ' makan ' + k + ' keping. Berapakah peratus ' + food[1] + ' yang tinggal?', simple: den + ' pieces. ' + n + ' eats ' + k + '. What percent is still there?',
      wrong: [[(100 - left) + '%', 'UNDERSTAND', ['That is the part eaten. The question asks what is left.', 'Itu bahagian yang dimakan. Soalan bertanya bahagian yang tinggal.']], [(den - k) + '%', 'CONCEPT', ['Change “out of ' + den + '” to “out of 100” first.', 'Tukar “daripada ' + den + '” kepada “daripada 100” dahulu.']], [k + '%', 'CONCEPT', ['Find the pieces left, then change to a percent.', 'Cari kepingan yang tinggal, kemudian tukar kepada peratus.']], [(left + 10) + '%', 'EXECUTE', ['Check what you multiplied by.', 'Semak nombor yang anda darab.']], [Math.max(5, left - 5) + '%', 'EXECUTE', ['Check what you multiplied by.', 'Semak nombor yang anda darab.']]],
      hints: [['Are we finding the pieces eaten or the pieces left?', 'Kita cari kepingan yang dimakan atau yang tinggal?'], ['How many pieces are left out of ' + den + '?', 'Berapa kepingan tinggal daripada ' + den + '?'], [(den - k) + ' out of ' + den + ' are left. Change ' + (den - k) + '/' + den + ' into a percentage.', (den - k) + ' daripada ' + den + ' tinggal. Tukar ' + (den - k) + '/' + den + ' kepada peratus.']],
      show: [[den + ' − ' + k + ' = ' + (den - k) + ' pieces left.', den + ' − ' + k + ' = ' + (den - k) + ' keping tinggal.'], [(den - k) + '/' + den + ' = ' + left + '/100 = ' + left + '%.', (den - k) + '/' + den + ' = ' + left + '/100 = ' + left + '%.']],
      check: ['Check: ' + left + '% + ' + (100 - left) + '% = 100% ✓', 'Semak: ' + left + '% + ' + (100 - left) + '% = 100% ✓'] };
  } });

  /* ══════════ 24-HOUR TIME ══════════ */
  T({ id: 't24-to24', skill: 'time24', level: 1, make: function (R) {
    var pm = R.chance(0.7), hr = R.int(1, 11), m = R.mult(0, 55, 5), t = (pm ? hr + 12 : hr) * 60 + m;
    return { text: 'Which 24-hour time is the same as ' + t12(t) + '?', answer: t24(t), bm: 'Waktu sistem 24 jam manakah sama dengan ' + t12(t) + '?', simple: t12(t) + '. What is it in 24-hour time?',
      wrong: [[t24(pm ? t - 720 : t + 720), 'CONCEPT', pm ? ['That is in the morning. p.m. is after noon.', 'Itu waktu pagi. p.m. ialah selepas tengah hari.'] : ['That is after noon. a.m. is in the morning.', 'Itu selepas tengah hari. a.m. ialah waktu pagi.']], [t24(pm ? t - 120 : t + 600), 'EXECUTE', pm ? ['For p.m. times, add 12 to the hour, not 10.', 'Untuk waktu p.m., tambah 12 pada jam, bukan 10.'] : ['For a.m. times, keep the hour.', 'Untuk waktu a.m., jam kekal sama.']], [t24(t + 60), 'EXECUTE', ['Check the hour again.', 'Semak jam sekali lagi.']]],
      hints: [pm ? ['p.m. times are after 12 noon.', 'Waktu p.m. ialah selepas jam 12 tengah hari.'] : ['a.m. times are from midnight to noon.', 'Waktu a.m. ialah dari tengah malam hingga tengah hari.'], pm ? ['For p.m. times, add 12 to the hour.', 'Untuk waktu p.m., tambah 12 pada jam.'] : ['For a.m. times, keep the hour and write 2 digits.', 'Untuk waktu a.m., jam kekal dan tulis 2 digit.'], pm ? [hr + ' + 12 = ?', hr + ' + 12 = ?'] : ['Write ' + hr + ' as ' + pad(hr) + '.', 'Tulis ' + hr + ' sebagai ' + pad(hr) + '.']],
      show: [[t12(t) + (pm ? ' → ' + hr + ' + 12 = ' + (hr + 12) + '.' : ' → hour ' + pad(hr) + '.'), t12(t) + (pm ? ' → ' + hr + ' + 12 = ' + (hr + 12) + '.' : ' → jam ' + pad(hr) + '.')], [t12(t) + ' = ' + t24(t) + '.', t12(t) + ' = ' + t24b(t) + '.']] };
  } });

  var EVENTS = [['The school bus', 'leaves', 'Bas sekolah bertolak'], ['The movie', 'starts', 'Filem bermula'], ['The night market', 'begins', 'Pasar malam bermula'], ['The shop', 'closes', 'Kedai ditutup']];
  T({ id: 't24-to12', skill: 'time24', level: 2, make: function (R) {
    var e = R.pick(EVENTS), t = R.int(13, 22) * 60 + R.mult(5, 55, 5), H = Math.floor(t / 60);
    return { text: e[0] + ' ' + e[1] + ' at ' + t24(t) + '.\nWhat time is this in 12-hour time?', visual: { kind: 'clock24', time: h.hhmm(t) }, answer: t12(t),
      bm: e[2] + ' pada ' + t24b(t) + '. Apakah waktu itu dalam sistem 12 jam?', simple: 'Write ' + t24(t) + ' with a.m. or p.m.',
      wrong: [[t12(t - 600), 'CONCEPT', ['Take away 12 from the hour, not 10.', 'Tolak 12 daripada jam, bukan 10.']], [t12(t - 720), 'CONCEPT', ['Hours after 12 are p.m.', 'Jam selepas 12 ialah p.m.']], [t12(t - 840), 'EXECUTE', ['Check: hour − 12.', 'Semak: jam − 12.']]],
      hints: [['Is ' + t24(t) + ' before or after 12 noon?', 'Adakah ' + t24b(t) + ' sebelum atau selepas jam 12 tengah hari?'], ['After noon, take away 12 from the hour.', 'Selepas tengah hari, tolak 12 daripada jam.'], [H + ' − 12 = ? Keep the minutes.', H + ' − 12 = ? Minit kekal sama.']],
      show: [[H + ' − 12 = ' + (H - 12) + '.', H + ' − 12 = ' + (H - 12) + '.'], [t24(t) + ' = ' + t12(t) + '.', t24b(t) + ' = ' + t12(t) + '.']] };
  } });

  T({ id: 't24-ctx', skill: 'time24', level: 3, make: function (R) {
    var sc = R.pick([['Ayah comes home from work at', 'Ayah pulang dari kerja pada'], ['The badminton match ends at', 'Perlawanan badminton tamat pada'], ['Ibu starts cooking dinner at', 'Ibu mula memasak makan malam pada']]);
    var t = R.int(17, 22) * 60 + R.mult(5, 55, 5), H = Math.floor(t / 60);
    return { text: sc[0] + ' ' + t12(t) + '.\nWhich 24-hour time shows this?', answer: t24(t), bm: sc[1] + ' ' + t12(t) + '. Waktu sistem 24 jam manakah menunjukkan waktu ini?', simple: t12(t) + ' in the evening. Write it in 24-hour time.',
      wrong: [[t24(t - 720), 'CONCEPT', ['That is in the morning. p.m. is after noon.', 'Itu waktu pagi. p.m. ialah selepas tengah hari.']], [t24(t - 120), 'EXECUTE', ['Add 12 to the hour, not 10.', 'Tambah 12 pada jam, bukan 10.']], [t24(t + 120), 'EXECUTE', ['Check: hour + 12.', 'Semak: jam + 12.']]],
      hints: [['Is ' + t12(t) + ' in the morning or the evening?', 'Adakah ' + t12(t) + ' waktu pagi atau petang/malam?'], ['For p.m. times, add 12 to the hour.', 'Untuk waktu p.m., tambah 12 pada jam.'], [(H - 12) + ' + 12 = ?', (H - 12) + ' + 12 = ?']],
      show: [[(H - 12) + ' + 12 = ' + H + '.', (H - 12) + ' + 12 = ' + H + '.'], [t12(t) + ' = ' + t24(t) + '.', t12(t) + ' = ' + t24b(t) + '.']] };
  } });

  T({ id: 't24-part', skill: 'time24', level: 1, make: function (R) {
    var bands = { morning: [300, 690], afternoon: [780, 1050], night: [1200, 1410] }, bmw = { morning: 'pagi', afternoon: 'petang', night: 'malam' };
    var want = R.pick(['morning', 'afternoon', 'night']), others = Object.keys(bands).filter(function (b) { return b !== want; });
    function tIn(b) { return R.mult(bands[b][0], bands[b][1], 15); }
    var ans = tIn(want), msg = ['Look at the hour. Is it before or after 12?', 'Lihat jam. Sebelum atau selepas 12?'];
    return { text: 'Which 24-hour time is in the ' + want + '?', answer: t24(ans), bm: 'Waktu sistem 24 jam manakah pada waktu ' + bmw[want] + '?', simple: 'Which time is in the ' + want + '?',
      wrong: [[t24(tIn(others[0])), 'CONCEPT', msg], [t24(tIn(others[1])), 'CONCEPT', msg], [t24(tIn(others[R.int(0, 1)]) + 30), 'CONCEPT', ['Hours from 13 to 18 are the afternoon.', 'Jam 13 hingga 18 ialah waktu petang.']]],
      hints: [['The first two digits show the hour.', 'Dua digit pertama menunjukkan jam.'], ['Morning hours are before 12. Afternoon is about 12 to 18. Night is after 19.', 'Pagi: sebelum 12. Petang: kira-kira 12 hingga 18. Malam: selepas 19.'], ['Find the time whose hour fits the ' + want + '.', 'Cari waktu yang jamnya sesuai dengan waktu ' + bmw[want] + '.']],
      show: [[t24(ans) + ' = ' + t12(ans) + ', which is in the ' + want + '.', t24b(ans) + ' = ' + t12(ans) + ', iaitu waktu ' + bmw[want] + '.']] };
  } });

  /* ══════════ DURATION ══════════ */
  T({ id: 'du-conv', skill: 'duration', level: 2, make: function (R) {
    var hr = R.int(1, 4), m = R.mult(5, 55, 5), total = hr * 60 + m;
    if (R.chance(0.5)) {
      return { text: 'Convert ' + dur(total) + ' to minutes.', answer: total + ' minutes', bm: 'Tukar ' + durBm(total) + ' kepada minit.', simple: 'Write ' + dur(total) + ' using only minutes.',
        wrong: [[(hr * 100 + m) + ' minutes', 'CONCEPT', ['1 hour is 60 minutes, not 100.', '1 jam ialah 60 minit, bukan 100.']], [(hr * 60) + ' minutes', 'EXECUTE', ['Don’t forget the extra ' + m + ' minutes.', 'Jangan lupa ' + m + ' minit lagi.']], [(total + 60) + ' minutes', 'EXECUTE', ['Check the hours: ' + hr + ' × 60.', 'Semak jam: ' + hr + ' × 60.']]],
        hints: [['How many minutes are in 1 hour?', 'Berapa minit dalam 1 jam?'], [hr + ' hour' + (hr > 1 ? 's' : '') + ' = ' + hr + ' × 60 minutes.', hr + ' jam = ' + hr + ' × 60 minit.'], [(hr * 60) + ' minutes + ' + m + ' minutes = ?', (hr * 60) + ' minit + ' + m + ' minit = ?']],
        show: [[hr + ' × 60 = ' + hr * 60 + ' minutes.', hr + ' × 60 = ' + hr * 60 + ' minit.'], [hr * 60 + ' + ' + m + ' = ' + total + ' minutes.', hr * 60 + ' + ' + m + ' = ' + total + ' minit.']] };
    }
    return { text: 'Convert ' + total + ' minutes to hours and minutes.', answer: dur(total), bm: 'Tukar ' + total + ' minit kepada jam dan minit.', simple: 'Write ' + total + ' minutes as hours and minutes.',
      wrong: [[dur(total + 40), 'CONCEPT', ['1 hour is 60 minutes, not 100.', '1 jam ialah 60 minit, bukan 100.']], [dur(total - 60), 'EXECUTE', ['Count how many 60s fit into ' + total + '.', 'Kira berapa kali 60 masuk dalam ' + total + '.']], [dur(total + 10), 'EXECUTE', ['Check the minutes left over.', 'Semak minit yang berbaki.']]],
      hints: [['How many minutes make 1 hour?', 'Berapa minit sama dengan 1 jam?'], ['How many groups of 60 fit into ' + total + '?', 'Berapa kumpulan 60 dalam ' + total + '?'], [hr + ' × 60 = ' + hr * 60 + '. How many minutes are left over?', hr + ' × 60 = ' + hr * 60 + '. Berapa minit berbaki?']],
      show: [[total + ' = ' + hr * 60 + ' + ' + m + '.', total + ' = ' + hr * 60 + ' + ' + m + '.'], [hr * 60 + ' minutes = ' + hr + ' hour' + (hr > 1 ? 's' : '') + '.', hr * 60 + ' minit = ' + hr + ' jam.'], ['So ' + total + ' minutes = ' + dur(total) + '.', 'Jadi ' + total + ' minit = ' + durBm(total) + '.']] };
  } });

  var ACTS = [['The movie', 'movie', 'Filem itu'], ['The swimming lesson', 'lesson', 'Kelas renang itu'], ['The football match', 'match', 'Perlawanan bola sepak itu'], ['The school concert', 'concert', 'Konsert sekolah itu']];
  T({ id: 'du-between', skill: 'duration', level: 2, make: function (R) {
    var a = R.pick(ACTS), s = R.int(13, 17) * 60 + R.mult(5, 55, 5), d = R.mult(35, 170, 5), e = s + d;
    var naiveH = Math.floor(e / 60) - Math.floor(s / 60), naiveM = (e % 60) - (s % 60);
    var naive = naiveM < 0 ? naiveH * 100 + naiveM : null;
    var naiveStr = naive ? (Math.floor(naive / 100) ? Math.floor(naive / 100) + ' hour' + (Math.floor(naive / 100) > 1 ? 's ' : ' ') : '') + (naive % 100) + ' minutes' : dur(d + 40);
    var nextH = Math.ceil(s / 60) * 60;
    return { text: a[0] + ' starts at ' + t12(s) + ' and ends at ' + t12(e) + '.\nWhat is the duration of the ' + a[1] + '?', answer: dur(d),
      bm: a[2] + ' bermula pada ' + t12(s) + ' dan tamat pada ' + t12(e) + '. Berapakah tempoh masanya?', simple: 'It begins at ' + t12(s) + '. It finishes at ' + t12(e) + '. How long is it?',
      wrong: [[naiveStr, 'CONCEPT', ['An hour has 60 minutes, not 100. Count on from the start time.', '1 jam ada 60 minit, bukan 100. Kira ke depan dari waktu mula.']], [dur(d + 60), 'EXECUTE', ['Count the hours again.', 'Kira jam sekali lagi.']], [dur(Math.abs(d - 15) || 5), 'EXECUTE', ['Count the minutes again.', 'Kira minit sekali lagi.']]],
      hints: [['Duration is the time from start to end.', 'Tempoh masa ialah masa dari mula hingga tamat.'], ['Count on in jumps: first to the next o’clock.', 'Kira ke depan dalam lompatan: mula-mula ke jam tepat yang berikutnya.'], ['From ' + t12(s) + ' to ' + t12(nextH) + ' is ' + (nextH - s) + ' minutes. Keep counting to ' + t12(e) + '.', 'Dari ' + t12(s) + ' ke ' + t12(nextH) + ' ialah ' + (nextH - s) + ' minit. Teruskan kira hingga ' + t12(e) + '.']],
      show: [['Count on from ' + t12(s) + ' to ' + t12(e) + '.', 'Kira dari ' + t12(s) + ' hingga ' + t12(e) + '.'], ['Duration = ' + dur(d) + '.', 'Tempoh masa = ' + durBm(d) + '.']],
      check: ['Check: ' + t12(s) + ' + ' + dur(d) + ' = ' + t12(e) + ' ✓', 'Semak: ' + t12(s) + ' + ' + durBm(d) + ' = ' + t12(e) + ' ✓'] };
  } });

  T({ id: 'du-end', skill: 'duration', level: 3, make: function (R) {
    var ev = R.pick([['Tuition', 'Kelas tuisyen'], ['Football practice', 'Latihan bola sepak'], ['The quiz', 'Kuiz itu'], ['Mengaji class', 'Kelas mengaji']]);
    var s = R.int(7, 18) * 60 + R.mult(30, 55, 5), d = R.int(1, 2) * 60 + R.mult(20, 50, 5), e = s + d;
    var sm = s % 60, dm = d % 60, dh = Math.floor(d / 60), naive = (Math.floor(s / 60) + dh) * 100 + sm + dm;
    var naiveStr = sm + dm >= 60 ? pad(Math.floor(naive / 100)) + pad(naive % 100) + ' hours' : t24(e + 60);
    return { text: ev[0] + ' begins at ' + t24(s) + '.\nIt lasts ' + dur(d) + '.\nWhat time does it end?', answer: t24(e),
      bm: ev[1] + ' bermula pada ' + t24b(s) + '. Ia berlangsung selama ' + durBm(d) + '. Pukul berapakah ia tamat?', simple: 'It starts at ' + t24(s) + ' and goes on for ' + dur(d) + '. When does it finish?',
      wrong: [[naiveStr, 'CONCEPT', ['Minutes only go up to 59. 60 minutes make 1 hour.', 'Minit hanya hingga 59. 60 minit = 1 jam.']], [t24(s + dh * 60), 'EXECUTE', ['You added the hours. Now add the minutes too.', 'Anda menambah jam. Sekarang tambah minit juga.']], [t24(s + dm), 'EXECUTE', ['You added the minutes. Did you add the hours too?', 'Anda menambah minit. Sudah tambah jam juga?']]],
      hints: [['Are we finding the duration or the end time?', 'Kita cari tempoh masa atau waktu tamat?'], ['Add the hours first, then the minutes.', 'Tambah jam dahulu, kemudian minit.'], [t24(s) + ' + ' + dh + ' hour' + (dh > 1 ? 's' : '') + ' = ' + t24(s + dh * 60) + '. Now add ' + dm + ' minutes. Remember: 60 minutes make 1 hour.', t24b(s) + ' + ' + dh + ' jam = ' + t24b(s + dh * 60) + '. Sekarang tambah ' + dm + ' minit. Ingat: 60 minit = 1 jam.']],
      show: [[t24(s) + ' + ' + dh + ' h = ' + t24(s + dh * 60) + '.', t24b(s) + ' + ' + dh + ' jam = ' + t24b(s + dh * 60) + '.'], ['+ ' + dm + ' minutes = ' + t24(e) + '.', '+ ' + dm + ' minit = ' + t24b(e) + '.']],
      check: ['Check: the minutes part is less than 60 ✓', 'Semak: bahagian minit kurang daripada 60 ✓'] };
  } });

  T({ id: 'du-between24', skill: 'duration', level: 3, make: function (R) {
    var n = R.pick(NAMES), act = R.pick([['reads', 'membaca', 'read'], ['practises the piano', 'berlatih piano', 'practise'], ['plays badminton', 'bermain badminton', 'play'], ['helps in the kitchen', 'membantu di dapur', 'help']]);
    var s = R.int(7, 19) * 60 + R.mult(35, 55, 5), d = R.mult(20, 95, 5), e = s + d, nextH = Math.ceil(s / 60) * 60;
    var naive = (Math.floor(e / 60) * 100 + e % 60) - (Math.floor(s / 60) * 100 + s % 60);
    return { text: n + ' ' + act[0] + ' from ' + h.hhmm(s) + ' hours to ' + t24(e) + '.\nHow long does ' + n + ' ' + act[2] + '?', answer: dur(d),
      bm: n + ' ' + act[1] + ' dari ' + t24b(s) + ' hingga ' + t24b(e) + '. Berapa lamakah masanya?', simple: 'Start ' + t24(s) + '. Stop ' + t24(e) + '. How many minutes?',
      wrong: [[naive !== d ? naive + ' minutes' : dur(d + 10), 'CONCEPT', ['You subtracted like normal numbers. An hour has 60 minutes, so count on instead.', 'Anda menolak seperti nombor biasa. 1 jam ada 60 minit, jadi kira ke depan.']], [dur(d + 15), 'EXECUTE', ['Count on in jumps to the next o’clock.', 'Kira ke depan hingga jam tepat berikutnya.']], [dur(d + 60), 'EXECUTE', ['Check the hours.', 'Semak jam.']]],
      hints: [['We need the time between two clock times.', 'Kita perlukan masa antara dua waktu.'], ['Count on from ' + t24(s) + ' to the next o’clock first.', 'Kira dari ' + t24b(s) + ' hingga jam tepat berikutnya dahulu.'], [t24(s) + ' → ' + t24(nextH) + ' is ' + (nextH - s) + ' minutes. Then count to ' + t24(e) + '.', t24b(s) + ' → ' + t24b(nextH) + ' ialah ' + (nextH - s) + ' minit. Kemudian kira hingga ' + t24b(e) + '.']],
      show: [['Count on: ' + t24(s) + ' → ' + t24(nextH) + ' → ' + t24(e) + '.', 'Kira: ' + t24b(s) + ' → ' + t24b(nextH) + ' → ' + t24b(e) + '.'], ['Total: ' + dur(d) + '.', 'Jumlah: ' + durBm(d) + '.']] };
  } });

  T({ id: 'du-units', skill: 'duration', level: 1, make: function (R) {
    var f = R.pick([['hours are in 1 day', 24, 'jam dalam 1 hari'], ['minutes are in 1 hour', 60, 'minit dalam 1 jam'], ['days are in 1 week', 7, 'hari dalam 1 minggu'], ['months are in 1 year', 12, 'bulan dalam 1 tahun'], ['days are in 2 weeks', 14, 'hari dalam 2 minggu'], ['minutes are in half an hour', 30, 'minit dalam setengah jam'], ['seconds are in 1 minute', 60, 'saat dalam 1 minit'], ['minutes are in 2 hours', 120, 'minit dalam 2 jam']]);
    var msg = ['Think about a clock or a calendar.', 'Fikir tentang jam atau kalendar.'];
    return { text: 'How many ' + f[0] + '?', answer: f[1], step: f[1] > 20 ? 10 : 2, bm: 'Berapakah bilangan ' + f[2] + '?', simple: 'How many ' + f[0] + '?',
      wrong: [[f[1] === 60 ? 100 : 60, 'CONCEPT', msg], [f[1] === 24 ? 12 : 24, 'CONCEPT', msg]],
      hints: [msg, ['Count it in your head: one day, one hour, one week…', 'Kira dalam kepala: satu hari, satu jam, satu minggu…'], ['Use what you know: 1 hour = 60 minutes, 1 day = 24 hours, 1 week = 7 days.', 'Ingat: 1 jam = 60 minit, 1 hari = 24 jam, 1 minggu = 7 hari.']],
      show: [['There are ' + f[1] + ' ' + f[0] + '.', 'Ada ' + f[1] + ' ' + f[2] + '.']] };
  } });

  /* ══════════ MEASUREMENT ══════════ */
  var CONV = [['m', 'cm', 100, 'metres', 'centimetres', 'meter', 'sentimeter'], ['cm', 'mm', 10, 'centimetres', 'millimetres', 'sentimeter', 'milimeter'], ['km', 'm', 1000, 'kilometres', 'metres', 'kilometer', 'meter'], ['kg', 'g', 1000, 'kilograms', 'grams', 'kilogram', 'gram'], ['l', 'ml', 1000, 'litres', 'millilitres', 'liter', 'mililiter']];
  T({ id: 'me-conv', skill: 'measure', level: 1, make: function (R) {
    var c = R.pick(CONV), v = R.int(2, 9), ans = v * c[2], other = c[2] === 1000 ? 100 : 1000;
    var fact = ['1 ' + c[0] + ' = ' + num(c[2]) + ' ' + c[1] + '.', '1 ' + c[0] + ' = ' + num(c[2]) + ' ' + c[1] + '.'];
    return { text: 'Convert ' + v + ' ' + c[0] + ' to ' + c[4] + '.', answer: ans, fmt: function (x) { return num(x) + ' ' + c[1]; },
      bm: 'Tukar ' + v + ' ' + c[0] + ' kepada ' + c[6] + '.', simple: 'Write ' + v + ' ' + c[0] + ' in ' + c[4] + '.',
      wrong: [[v * other, 'CONCEPT', fact], [v * (c[2] === 10 ? 1000 : 10), 'CONCEPT', fact], [v + c[2], 'PLAN', ['Each ' + c[0] + ' is ' + num(c[2]) + ' ' + c[1] + ': multiply.', 'Setiap ' + c[0] + ' ialah ' + num(c[2]) + ' ' + c[1] + ': darab.']]],
      hints: [['How many ' + c[4] + ' are in 1 ' + c[0] + '?', 'Berapa ' + c[6] + ' dalam 1 ' + c[0] + '?'], fact, [v + ' × ' + num(c[2]) + ' = ?', v + ' × ' + num(c[2]) + ' = ?']],
      show: [fact, [v + ' ' + c[0] + ' = ' + num(ans) + ' ' + c[1] + '.', v + ' ' + c[0] + ' = ' + num(ans) + ' ' + c[1] + '.']] };
  } });

  T({ id: 'me-left', skill: 'measure', level: 3, make: function (R) {
    var n = R.pick(NAMES), rice = R.chance(0.5), k = R.int(1, 3), used = R.mult(150, k * 1000 - 100, 50), whole = k * 1000, u = rice ? ' g' : ' ml';
    if (used % 1000 === 0) used -= 50;
    var ans = whole - used;
    var text = rice ? 'A bag of rice has a mass of ' + k + ' kg.\n' + n + ' uses ' + num(used) + ' g.\nWhat is the mass of rice remaining?' : 'A bottle has ' + k + ' litre' + (k > 1 ? 's' : '') + ' of water.\n' + n + ' pours out ' + num(used) + ' ml.\nHow much water is left?';
    return { text: text, answer: ans, fmt: function (x) { return num(x) + u; }, keepWords: ['left'], step: 50,
      bm: rice ? 'Sebungkus beras berjisim ' + k + ' kg. ' + n + ' menggunakan ' + num(used) + ' g. Berapakah jisim beras yang tinggal?' : 'Sebotol air berisi ' + k + ' liter. ' + n + ' menuang keluar ' + num(used) + ' ml. Berapakah isi padu air yang tinggal?',
      simple: 'There is ' + k + (rice ? ' kg of rice. ' : ' l of water. ') + num(used) + u + ' is used. How much is still there?',
      wrong: [[whole + used, 'UNDERSTAND', ['You added. Some was used, so there is less now.', 'Anda menambah. Ada yang digunakan, jadi sekarang berkurang.']], [used, 'UNDERSTAND', ['That is the amount used, not the amount left.', 'Itu yang digunakan, bukan yang tinggal.']], [ans + 100, 'EXECUTE', ['Check the subtraction.', 'Semak tolakan.']]],
      hints: [['Are the units the same?', 'Adakah unitnya sama?'], rice ? ['Change ' + k + ' kg into grams.', 'Tukar ' + k + ' kg kepada gram.'] : ['Change ' + k + ' l into millilitres.', 'Tukar ' + k + ' l kepada mililiter.'], [k + (rice ? ' kg = ' : ' l = ') + num(whole) + u + '. Now take away ' + num(used) + u + '.', k + (rice ? ' kg = ' : ' l = ') + num(whole) + u + '. Sekarang tolak ' + num(used) + u + '.']],
      show: [[k + (rice ? ' kg = ' : ' l = ') + num(whole) + u + '.', k + (rice ? ' kg = ' : ' l = ') + num(whole) + u + '.'], [num(whole) + ' − ' + num(used) + ' = ' + num(ans) + u + '.', num(whole) + ' − ' + num(used) + ' = ' + num(ans) + u + '.']],
      check: ['Check: ' + num(ans) + ' + ' + num(used) + ' = ' + num(whole) + ' ✓', 'Semak: ' + num(ans) + ' + ' + num(used) + ' = ' + num(whole) + ' ✓'] };
  } });

  T({ id: 'me-heavy', skill: 'measure', level: 2, make: function (R) {
    var heavy = R.chance(0.5), kg = R.int(1, 3), gs = [];
    while (gs.length < 3) { var g = R.mult(150, 2950, 50); if (g !== kg * 1000 && gs.indexOf(g) < 0) gs.push(g); }
    var items = [{ s: kg + ' kg', v: kg * 1000 }].concat(gs.map(function (g) { return { s: num(g) + ' g', v: g }; }));
    var best = items.slice().sort(function (a, b) { return heavy ? b.v - a.v : a.v - b.v; })[0];
    var msg = ['Change all the masses to grams first. 1 kg = 1 000 g.', 'Tukar semua jisim kepada gram dahulu. 1 kg = 1 000 g.'];
    return { text: 'Which mass is the ' + (heavy ? 'heaviest' : 'lightest') + '?', answer: best.s, bm: 'Jisim manakah yang paling ' + (heavy ? 'berat' : 'ringan') + '?', simple: 'Which one weighs the ' + (heavy ? 'most' : 'least') + '?',
      wrong: items.filter(function (i) { return i !== best; }).map(function (i) { return [i.s, 'CONCEPT', msg]; }),
      hints: [['Are all the masses in the same unit?', 'Adakah semua jisim dalam unit yang sama?'], ['Change kg to g: 1 kg = 1 000 g.', 'Tukar kg kepada g: 1 kg = 1 000 g.'], [kg + ' kg = ' + num(kg * 1000) + ' g. Now compare all four in grams.', kg + ' kg = ' + num(kg * 1000) + ' g. Sekarang bandingkan keempat-empatnya dalam gram.']],
      show: [[kg + ' kg = ' + num(kg * 1000) + ' g.', kg + ' kg = ' + num(kg * 1000) + ' g.'], ['In grams, the ' + (heavy ? 'heaviest' : 'lightest') + ' is ' + best.s + '.', 'Dalam gram, yang paling ' + (heavy ? 'berat' : 'ringan') + ' ialah ' + best.s + '.']] };
  } });

  T({ id: 'me-add', skill: 'measure', level: 2, make: function (R) {
    var a = R.int(1, 3), b = R.mult(150, 800, 50), c = R.mult(150, 900, 50), tot = a * 1000 + b + c;
    return { text: 'What is ' + a + ' kg ' + b + ' g + ' + c + ' g?\nGive your answer in grams.', answer: tot, fmt: function (x) { return num(x) + ' g'; }, step: 100,
      bm: 'Berapakah ' + a + ' kg ' + b + ' g + ' + c + ' g? Beri jawapan dalam gram.', simple: 'Add the masses. Write the answer in grams.',
      wrong: [[a + b + c, 'CONCEPT', ['Change ' + a + ' kg to grams first: 1 kg = 1 000 g.', 'Tukar ' + a + ' kg kepada gram dahulu: 1 kg = 1 000 g.']], [a * 100 + b + c, 'CONCEPT', ['1 kg is 1 000 g, not 100 g.', '1 kg ialah 1 000 g, bukan 100 g.']], [tot - 1000, 'EXECUTE', ['Check the kilograms.', 'Semak kilogram.']]],
      hints: [['Change everything to grams.', 'Tukar semuanya kepada gram.'], [a + ' kg = ' + num(a * 1000) + ' g.', a + ' kg = ' + num(a * 1000) + ' g.'], [num(a * 1000) + ' + ' + b + ' + ' + c + ' = ?', num(a * 1000) + ' + ' + b + ' + ' + c + ' = ?']],
      show: [[a + ' kg ' + b + ' g = ' + num(a * 1000 + b) + ' g.', a + ' kg ' + b + ' g = ' + num(a * 1000 + b) + ' g.'], [num(a * 1000 + b) + ' + ' + c + ' = ' + num(tot) + ' g.', num(a * 1000 + b) + ' + ' + c + ' = ' + num(tot) + ' g.']] };
  } });
})();
