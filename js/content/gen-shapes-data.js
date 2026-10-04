/* Generators: perimeter, area, ratio, data, shapes & angles, coordinates, multi-step. Bilingual. */
(function () {
  var G = FMQ.gen, T = G.T, h = G.h, num = h.num, rm = h.rm, t24 = h.t24, t24b = h.t24b, dur = h.dur, durBm = h.durBm, pt = h.pt, NAMES = h.NAMES;
  function unitFmt(u) { return function (x) { return x + ' ' + u; }; }

  /* ══════════ PERIMETER ══════════ */
  T({ id: 'pe-rect', skill: 'perimeter', level: 2, make: function (R) {
    var w = R.int(4, 15), ht; do { ht = R.int(2, 12); } while (ht === w);
    var u = R.pick(['cm', 'm']), P = 2 * (w + ht);
    return { text: 'A rectangle is ' + w + ' ' + u + ' long and ' + ht + ' ' + u + ' wide.\nWhat is its perimeter?', visual: { kind: 'rect', w: w, h: ht, unit: u }, answer: P, fmt: unitFmt(u),
      bm: 'Sebuah segi empat tepat panjangnya ' + w + ' ' + u + ' dan lebarnya ' + ht + ' ' + u + '. Berapakah perimeternya?', simple: 'The rectangle is ' + w + ' ' + u + ' by ' + ht + ' ' + u + '. How far is it all the way around?',
      wrong: [[w * ht, 'CONCEPT', [w + ' × ' + ht + ' is the area. Perimeter adds the sides around.', w + ' × ' + ht + ' ialah luas. Perimeter ialah jumlah semua sisi.']], [w + ht, 'EXECUTE', ['That is only 2 sides. A rectangle has 4.', 'Itu 2 sisi sahaja. Segi empat tepat ada 4 sisi.']], [2 * w + ht, 'EXECUTE', ['Count all four sides.', 'Kira keempat-empat sisi.']]],
      hints: [['Perimeter means all the way around. How many sides?', 'Perimeter ialah jarak mengelilingi bentuk. Ada berapa sisi?'], ['A rectangle has 2 long sides and 2 short sides.', 'Segi empat tepat ada 2 sisi panjang dan 2 sisi pendek.'], [w + ' + ' + ht + ' + ' + w + ' + ' + ht + ' = ?', w + ' + ' + ht + ' + ' + w + ' + ' + ht + ' = ?']],
      show: [['Sides: ' + w + ', ' + ht + ', ' + w + ', ' + ht + '.', 'Sisi: ' + w + ', ' + ht + ', ' + w + ', ' + ht + '.'], [w + ' + ' + ht + ' + ' + w + ' + ' + ht + ' = ' + P + ' ' + u + '.', w + ' + ' + ht + ' + ' + w + ' + ' + ht + ' = ' + P + ' ' + u + '.']] };
  } });

  T({ id: 'pe-square', skill: 'perimeter', level: 1, make: function (R) {
    var s = R.int(3, 12), u = R.pick(['cm', 'm']);
    return { text: 'A square has sides of ' + s + ' ' + u + '.\nWhat is its perimeter?', visual: { kind: 'rect', w: s, h: s, unit: u }, answer: 4 * s, fmt: unitFmt(u),
      bm: 'Sebuah segi empat sama mempunyai sisi ' + s + ' ' + u + '. Berapakah perimeternya?', simple: 'Each side is ' + s + ' ' + u + '. How far all the way around?',
      wrong: [[s * s, 'CONCEPT', [s + ' × ' + s + ' is the area. Perimeter goes around the edge.', s + ' × ' + s + ' ialah luas. Perimeter ialah jarak di sekeliling tepi.']], [2 * s, 'EXECUTE', ['A square has 4 sides, not 2.', 'Segi empat sama ada 4 sisi, bukan 2.']], [3 * s, 'EXECUTE', ['Count all 4 sides.', 'Kira semua 4 sisi.']]],
      hints: [['How many sides does a square have?', 'Segi empat sama ada berapa sisi?'], ['All the sides of a square are equal. Perimeter adds them all.', 'Semua sisi segi empat sama adalah sama panjang. Perimeter = jumlah semua sisi.'], [s + ' + ' + s + ' + ' + s + ' + ' + s + ' = ?', s + ' + ' + s + ' + ' + s + ' + ' + s + ' = ?']],
      show: [['4 equal sides.', '4 sisi sama panjang.'], ['4 × ' + s + ' = ' + 4 * s + ' ' + u + '.', '4 × ' + s + ' = ' + 4 * s + ' ' + u + '.']] };
  } });

  T({ id: 'pe-side', skill: 'perimeter', level: 3, make: function (R) {
    var s; do { s = R.int(3, 15); } while (s === 4);
    var P = 4 * s;
    return { text: 'A square photo frame has a perimeter of ' + P + ' cm.\nHow long is one side?', answer: s, fmt: unitFmt('cm'),
      bm: 'Sebuah bingkai gambar segi empat sama mempunyai perimeter ' + P + ' cm. Berapakah panjang satu sisi?', simple: 'All 4 sides together are ' + P + ' cm. How long is one side?',
      wrong: [[P / 2, 'EXECUTE', ['A square has 4 sides, not 2.', 'Segi empat sama ada 4 sisi, bukan 2.']], [P - 4, 'PLAN', ['Share the perimeter equally between the 4 sides.', 'Bahagi perimeter sama rata kepada 4 sisi.']], [s + 2, 'EXECUTE', ['Check: 4 × your answer should be ' + P + '.', 'Semak: 4 × jawapan anda patut jadi ' + P + '.']]],
      hints: [['How many equal sides does a square have?', 'Segi empat sama ada berapa sisi yang sama panjang?'], ['4 equal sides make ' + P + ' cm. Which operation finds one side?', '4 sisi sama panjang = ' + P + ' cm. Operasi apa untuk cari satu sisi?'], [P + ' ÷ 4 = ?', P + ' ÷ 4 = ?']],
      show: [[P + ' ÷ 4 = ' + s + ' cm.', P + ' ÷ 4 = ' + s + ' cm.']], check: ['Check: 4 × ' + s + ' = ' + P + ' ✓', 'Semak: 4 × ' + s + ' = ' + P + ' ✓'] };
  } });

  T({ id: 'pe-missing', skill: 'perimeter', level: 3, make: function (R) {
    var l = R.int(6, 15), w; do { w = R.int(2, 10); } while (w === l);
    var P = 2 * (l + w);
    return { text: 'A rectangle has a perimeter of ' + P + ' cm.\nIts length is ' + l + ' cm.\nHow wide is it?', answer: w, fmt: unitFmt('cm'),
      bm: 'Sebuah segi empat tepat mempunyai perimeter ' + P + ' cm. Panjangnya ' + l + ' cm. Berapakah lebarnya?', simple: 'All the way around is ' + P + ' cm. The long side is ' + l + ' cm. How long is the short side?',
      wrong: [[P - l, 'PLAN', ['The perimeter has two lengths, not one.', 'Perimeter ada dua panjang, bukan satu.']], [P - 2 * l, 'EXECUTE', ['That is both widths together. Halve it.', 'Itu dua lebar. Bahagi dua.']], [P / 4, 'PLAN', ['It is a rectangle, not a square.', 'Ini segi empat tepat, bukan segi empat sama.']]],
      hints: [['The perimeter is length + width + length + width.', 'Perimeter = panjang + lebar + panjang + lebar.'], ['Take away both lengths from the perimeter.', 'Tolak kedua-dua panjang daripada perimeter.'], [P + ' − ' + l + ' − ' + l + ' = ' + (P - 2 * l) + '. That is two widths.', P + ' − ' + l + ' − ' + l + ' = ' + (P - 2 * l) + '. Itu dua lebar.']],
      show: [[P + ' − ' + 2 * l + ' = ' + (P - 2 * l) + ' (two widths).', P + ' − ' + 2 * l + ' = ' + (P - 2 * l) + ' (dua lebar).'], [(P - 2 * l) + ' ÷ 2 = ' + w + ' cm.', (P - 2 * l) + ' ÷ 2 = ' + w + ' cm.']],
      check: ['Check: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' ✓', 'Semak: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' ✓'] };
  } });

  T({ id: 'pe-fence', skill: 'perimeter', level: 3, make: function (R) {
    var n = R.pick(['Encik Lim', 'Puan Rohani', 'Mr Kumar', 'Mak Cik Siti']), l = R.int(8, 25), w; do { w = R.int(4, 15); } while (w === l);
    var place = R.pick([['garden', 'kebun'], ['chicken coop', 'reban ayam'], ['vegetable plot', 'petak sayur']]), P = 2 * (l + w);
    return { text: n + ' puts a fence around a ' + place[0] + '.\nThe ' + place[0] + ' is ' + l + ' m long and ' + w + ' m wide.\nHow many metres of fence are needed?', visual: { kind: 'rect', w: l, h: w, unit: 'm' }, answer: P, fmt: unitFmt('m'),
      bm: n + ' memasang pagar di sekeliling ' + place[1] + '. Panjangnya ' + l + ' m dan lebarnya ' + w + ' m. Berapa meter pagar yang diperlukan?', simple: 'It is ' + l + ' m by ' + w + ' m. The fence goes all the way round. How long is the fence?',
      wrong: [[l * w, 'PLAN', ['You found the area. A fence goes around the edge.', 'Anda mencari luas. Pagar dipasang di sekeliling tepi.']], [l + w, 'EXECUTE', ['That is two sides. Go all the way round.', 'Itu dua sisi. Kira semua sisi.']], [P + 2, 'EXECUTE', ['Add the four sides again.', 'Tambah keempat-empat sisi sekali lagi.']]],
      hints: [['Does the fence go around the edge or cover the inside?', 'Pagar di sekeliling tepi atau menutup bahagian dalam?'], ['Around the edge means perimeter.', 'Di sekeliling tepi bermaksud perimeter.'], [l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ?', l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ?']],
      show: [['The fence goes around → perimeter.', 'Pagar di sekeliling → perimeter.'], [l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' m.', l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' m.']] };
  } });

  /* ══════════ AREA ══════════ */
  T({ id: 'ar-grid', skill: 'area', level: 1, make: function (R) {
    var c = R.int(3, 6), r = R.int(2, 4);
    return { text: 'Each small square is 1 cm².\nWhat is the area of the shaded shape?', visual: { kind: 'grid', cols: c, rows: r }, answer: c * r, fmt: unitFmt('cm²'),
      bm: 'Setiap petak kecil ialah 1 cm². Berapakah luas bentuk berlorek?', simple: 'Count the coloured squares. Each one is 1 cm².',
      wrong: [[2 * (c + r), 'CONCEPT', ['You counted around the edge. Area counts the squares inside.', 'Anda mengira di sekeliling tepi. Luas mengira petak di dalam.']], [c + r, 'CONCEPT', ['You added the sides. Count all the squares.', 'Anda menambah sisi. Kira semua petak.']], [c * r - 1, 'EXECUTE', ['Count the squares again carefully.', 'Kira petak sekali lagi dengan teliti.']]],
      hints: [['Area is the space inside. What can you count?', 'Luas ialah ruang di dalam. Apa yang boleh dikira?'], ['Count the shaded squares. Try counting by rows.', 'Kira petak berlorek. Cuba kira mengikut baris.'], [r + ' rows of ' + c + ' squares.', r + ' baris, setiap baris ' + c + ' petak.']],
      show: [[r + ' × ' + c + ' = ' + c * r + ' squares.', r + ' × ' + c + ' = ' + c * r + ' petak.'], ['Area = ' + c * r + ' cm².', 'Luas = ' + c * r + ' cm².']] };
  } });

  T({ id: 'ar-rect', skill: 'area', level: 2, make: function (R) {
    var l = R.int(3, 12), w; do { w = R.int(2, 9); } while (w === l);
    return { text: 'A rectangle is ' + l + ' cm long and ' + w + ' cm wide.\nWhat is its area?', visual: { kind: 'rect', w: l, h: w, unit: 'cm', grid: l <= 10 }, answer: l * w + ' cm²',
      bm: 'Sebuah segi empat tepat panjangnya ' + l + ' cm dan lebarnya ' + w + ' cm. Berapakah luasnya?', simple: 'The rectangle is ' + l + ' cm by ' + w + ' cm. How much space is inside?',
      wrong: [[2 * (l + w) + ' cm²', 'PLAN', ['That is the perimeter. Area is the space inside.', 'Itu perimeter. Luas ialah ruang di dalam.']], [(l + w) + ' cm²', 'PLAN', ['You added. Area multiplies length × width.', 'Anda menambah. Luas = panjang × lebar.']], [l * w + ' cm', 'CHECK', ['The number is right. Area uses square units.', 'Nombornya betul. Luas menggunakan unit persegi (cm²).']]],
      hints: [['Area is the space inside the rectangle.', 'Luas ialah ruang di dalam segi empat tepat.'], ['Area of a rectangle = length × width.', 'Luas segi empat tepat = panjang × lebar.'], [l + ' × ' + w + ' = ? Check the unit too.', l + ' × ' + w + ' = ? Semak unitnya juga.']],
      show: [['Area = length × width.', 'Luas = panjang × lebar.'], [l + ' × ' + w + ' = ' + l * w + ' cm².', l + ' × ' + w + ' = ' + l * w + ' cm².']] };
  } });

  T({ id: 'ar-ctx', skill: 'area', level: 3, make: function (R) {
    var sc = R.pick([['A classroom floor', 'Lantai bilik darjah', 'm'], ['A school field', 'Padang sekolah', 'm'], ['A notice board', 'Papan kenyataan', 'cm'], ['A carpet', 'Permaidani', 'm']]);
    var l = R.int(5, 12), w; do { w = R.int(3, 9); } while (w === l);
    return { text: sc[0] + ' is ' + l + ' ' + sc[2] + ' long and ' + w + ' ' + sc[2] + ' wide.\nWhat is its area?', answer: l * w, fmt: unitFmt(sc[2] + '²'),
      bm: sc[1] + ' panjangnya ' + l + ' ' + sc[2] + ' dan lebarnya ' + w + ' ' + sc[2] + '. Berapakah luasnya?', simple: 'It is ' + l + ' by ' + w + '. How much space does it cover?',
      wrong: [[2 * (l + w), 'PLAN', ['That is the perimeter. Area is the space inside.', 'Itu perimeter. Luas ialah ruang di dalam.']], [l * w - w, 'EXECUTE', ['Check: ' + l + ' × ' + w + '.', 'Semak: ' + l + ' × ' + w + '.']], [l + w, 'PLAN', ['Area multiplies, it does not add.', 'Luas didarab, bukan ditambah.']]],
      hints: [['Is area the edge or the space inside?', 'Luas ialah tepi atau ruang di dalam?'], ['Length × width.', 'Panjang × lebar.'], [l + ' × ' + w + ' = ?', l + ' × ' + w + ' = ?']],
      show: [['Area = ' + l + ' × ' + w + ' = ' + l * w + ' ' + sc[2] + '².', 'Luas = ' + l + ' × ' + w + ' = ' + l * w + ' ' + sc[2] + '².']] };
  } });

  var AP = [['cover a table top with cloth', 'area', 'menutup permukaan meja dengan kain'], ['put ribbon around the edge of a card', 'perimeter', 'meletakkan reben di sekeliling tepi kad'], ['paint a wall', 'area', 'mengecat dinding'], ['put a fence around a field', 'perimeter', 'memasang pagar di sekeliling padang'], ['cover the floor with tiles', 'area', 'menutup lantai dengan jubin'], ['put a frame around a picture', 'perimeter', 'memasang bingkai di sekeliling gambar']];
  T({ id: 'ar-which', skill: 'area', level: 3, make: function (R) {
    var sc = R.pick(AP), n = R.pick(NAMES), u = 'm', l = R.int(3, 8), w; do { w = R.int(2, 6); } while (w === l || l * w === 2 * (l + w));
    if (/card|picture|table/.test(sc[0])) { u = 'cm'; l *= 10; w *= 10; }
    var isA = sc[1] === 'area', A = 'Area = ' + l * w + ' ' + u + '²', P = 'Perimeter = ' + 2 * (l + w) + ' ' + u;
    var ans = isA ? A : P, wr = isA ? P : A, calc = ['Check the calculation.', 'Semak pengiraan.'];
    return { text: n + ' wants to ' + sc[0] + '.\nIt is ' + l + ' ' + u + ' long and ' + w + ' ' + u + ' wide.\nWhich is correct?', answer: ans,
      bm: n + ' ingin ' + sc[2] + '. Panjangnya ' + l + ' ' + u + ' dan lebarnya ' + w + ' ' + u + '. Yang manakah betul?', simple: 'Does ' + n + ' need the edge or the inside space? Pick the right one.',
      wrong: [[wr, 'PLAN', isA ? ['Covering is about the space inside.', 'Menutup bermaksud ruang di dalam (luas).'] : ['Going around the edge is perimeter.', 'Di sekeliling tepi ialah perimeter.']], [isA ? 'Area = ' + 2 * (l + w) + ' ' + u + '²' : 'Perimeter = ' + (l + w) + ' ' + u, 'EXECUTE', calc], [isA ? 'Area = ' + (l + w) + ' ' + u + '²' : 'Perimeter = ' + l * w + ' ' + u, 'EXECUTE', calc]],
      hints: [['Is this about the edge, or the space inside?', 'Adakah ini tentang tepi, atau ruang di dalam?'], isA ? ['Covering a surface is about the space inside: area.', 'Menutup permukaan ialah ruang di dalam: luas.'] : ['Going around the edge is perimeter.', 'Di sekeliling tepi ialah perimeter.'], isA ? ['Area = ' + l + ' × ' + w + '.', 'Luas = ' + l + ' × ' + w + '.'] : ['Perimeter = ' + l + ' + ' + w + ' + ' + l + ' + ' + w + '.', 'Perimeter = ' + l + ' + ' + w + ' + ' + l + ' + ' + w + '.']],
      show: [isA ? ['Covering → area.', 'Menutup → luas.'] : ['Around the edge → perimeter.', 'Di sekeliling tepi → perimeter.'], [ans + '.', (isA ? 'Luas = ' + l * w + ' ' + u + '²' : ans) + '.']],
      why: { q: ['How did you choose?', 'Bagaimana anda memilih?'], options: [isA ? ['Covering a surface needs the space inside', 'Menutup permukaan memerlukan ruang di dalam'] : ['Going around needs the distance around the edge', 'Mengelilingi memerlukan jarak di sekeliling tepi'], ['I picked the biggest number', 'Saya pilih nombor paling besar'], ['Area and perimeter are the same', 'Luas dan perimeter adalah sama']], answer: 0 } };
  } });

  /* ══════════ RATIO ══════════ */
  var COL = { red: 'merah', blue: 'biru', yellow: 'kuning' };
  T({ id: 'ra-beads', skill: 'ratio', level: 1, make: function (R) {
    var a = R.int(1, 6), b; do { b = R.int(1, 6); } while (b === a);
    var c = R.pick([['red', 'blue', 'a', 'b'], ['yellow', 'red', 'c', 'a'], ['blue', 'yellow', 'b', 'c']]);
    return { text: 'There are ' + a + ' ' + c[0] + ' beads and ' + b + ' ' + c[1] + ' beads.\nWhat is the ratio of ' + c[0] + ' beads to ' + c[1] + ' beads?', visual: { kind: 'beads', groups: [{ n: a, tone: c[2], label: c[0], labelBm: COL[c[0]] }, { n: b, tone: c[3], label: c[1], labelBm: COL[c[1]] }] },
      answer: a + ' : ' + b, bm: 'Ada ' + a + ' biji manik ' + COL[c[0]] + ' dan ' + b + ' biji manik ' + COL[c[1]] + '. Apakah nisbah manik ' + COL[c[0]] + ' kepada manik ' + COL[c[1]] + '?', simple: c[0] + ': ' + a + '. ' + c[1] + ': ' + b + '. Write ' + c[0] + ' : ' + c[1] + '.',
      wrong: [[b + ' : ' + a, 'UNDERSTAND', ['The order matters. Which colour comes first in the question?', 'Susunan penting. Warna manakah disebut dahulu dalam soalan?']], [a + ' : ' + (a + b), 'CONCEPT', [(a + b) + ' is all the beads. Compare the two colours.', (a + b) + ' ialah semua manik. Bandingkan dua warna itu.']], [(a + b) + ' : ' + b, 'CONCEPT', ['Compare the two colours, not the total.', 'Bandingkan dua warna, bukan jumlahnya.']]],
      hints: [['Which colour is mentioned first?', 'Warna manakah disebut dahulu?'], ['In a ratio, the order follows the words.', 'Dalam nisbah, susunannya mengikut ayat.'], ['Write the number of ' + c[0] + ', then “:”, then the number of ' + c[1] + '.', 'Tulis bilangan ' + COL[c[0]] + ', kemudian “:”, kemudian bilangan ' + COL[c[1]] + '.']],
      show: [[c[0] + ': ' + a + ', ' + c[1] + ': ' + b + '.', COL[c[0]] + ': ' + a + ', ' + COL[c[1]] + ': ' + b + '.'], ['Ratio = ' + a + ' : ' + b + '.', 'Nisbah = ' + a + ' : ' + b + '.']] };
  } });

  var RA = [['cup of rice', 'cups of water', 'cups of rice', 'cawan beras', 'cawan air'], ['egg', 'spoons of sugar', 'eggs', 'biji telur', 'sudu gula'], ['table', 'chairs', 'tables', 'buah meja', 'buah kerusi'], ['car', 'wheels', 'cars', 'buah kereta', 'biji roda']];
  T({ id: 'ra-scale', skill: 'ratio', level: 2, make: function (R) {
    var r = R.pick(RA), b = r[1] === 'wheels' ? 4 : R.int(2, 5), m = R.int(2, 6);
    return { text: 'For every 1 ' + r[0] + ', there are ' + b + ' ' + r[1] + '.\nHow many ' + r[1] + ' are there for ' + m + ' ' + r[2] + '?',
      answer: b * m, visual: { kind: 'ratioRows', a: r[0], b: r[1], aBm: r[3], bBm: r[4], ra: 1, rb: b, rows: 1 },
      bm: 'Bagi setiap 1 ' + r[3] + ', ada ' + b + ' ' + r[4] + '. Berapakah bilangan ' + r[4] + ' untuk ' + m + ' ' + r[3] + '?', simple: '1 has ' + b + '. ' + m + ' have how many?',
      wrong: [[b + m, 'PLAN', ['You added. Each one has its own ' + b + '.', 'Anda menambah. Setiap satu ada ' + b + ' sendiri.']], [b * m + b, 'EXECUTE', ['Count the groups again: ' + m + '.', 'Kira kumpulan sekali lagi: ' + m + '.']], [m, 'UNDERSTAND', ['That is the first amount. We need the ' + r[1] + '.', 'Itu kuantiti pertama. Kita perlukan ' + r[4] + '.']]],
      hints: [['How many ' + r[1] + ' go with 1 ' + r[0] + '?', 'Berapa ' + r[4] + ' bagi 1 ' + r[3] + '?'], ['Each one gets its own ' + b + '. Make ' + m + ' groups.', 'Setiap satu dapat ' + b + '. Buat ' + m + ' kumpulan.'], [m + ' × ' + b + ' = ?', m + ' × ' + b + ' = ?']],
      show: [['1 → ' + b + '.', '1 → ' + b + '.'], [m + ' → ' + m + ' × ' + b + ' = ' + b * m + '.', m + ' → ' + m + ' × ' + b + ' = ' + b * m + '.']],
      check: ['Check: ' + b * m + ' ÷ ' + m + ' = ' + b + ' ✓', 'Semak: ' + b * m + ' ÷ ' + m + ' = ' + b + ' ✓'] };
  } });

  T({ id: 'ra-order', skill: 'ratio', level: 2, make: function (R) {
    var g = R.int(8, 20), b; do { b = R.int(8, 20); } while (b === g);
    var boysFirst = R.chance(0.5), x = boysFirst ? b : g, y = boysFirst ? g : b;
    return { text: 'In a class, there are ' + g + ' girls and ' + b + ' boys.\nWhat is the ratio of ' + (boysFirst ? 'boys to girls' : 'girls to boys') + '?', answer: x + ' : ' + y,
      bm: 'Dalam sebuah kelas, ada ' + g + ' orang murid perempuan dan ' + b + ' orang murid lelaki. Apakah nisbah ' + (boysFirst ? 'murid lelaki kepada murid perempuan' : 'murid perempuan kepada murid lelaki') + '?', simple: 'Girls: ' + g + '. Boys: ' + b + '. Write ' + (boysFirst ? 'boys : girls' : 'girls : boys') + '.',
      wrong: [[y + ' : ' + x, 'UNDERSTAND', boysFirst ? ['Check the order: boys come first in the question.', 'Semak susunan: murid lelaki disebut dahulu.'] : ['Check the order: girls come first in the question.', 'Semak susunan: murid perempuan disebut dahulu.']], [x + ' : ' + (g + b), 'CONCEPT', [(g + b) + ' is the whole class. Compare the two groups.', (g + b) + ' ialah seluruh kelas. Bandingkan dua kumpulan.']], [(g + b) + ' : ' + y, 'CONCEPT', ['Compare boys and girls, not the whole class.', 'Bandingkan lelaki dan perempuan, bukan seluruh kelas.']]],
      hints: [['Which group comes first in the question?', 'Kumpulan manakah disebut dahulu dalam soalan?'], ['The ratio follows the order of the words.', 'Nisbah mengikut susunan dalam ayat.'], boysFirst ? ['Write the number of boys first.', 'Tulis bilangan murid lelaki dahulu.'] : ['Write the number of girls first.', 'Tulis bilangan murid perempuan dahulu.']],
      show: [[boysFirst ? 'Boys ' + b + ', girls ' + g + '.' : 'Girls ' + g + ', boys ' + b + '.', boysFirst ? 'Lelaki ' + b + ', perempuan ' + g + '.' : 'Perempuan ' + g + ', lelaki ' + b + '.'], ['Ratio = ' + x + ' : ' + y + '.', 'Nisbah = ' + x + ' : ' + y + '.']] };
  } });

  T({ id: 'ra-inverse', skill: 'ratio', level: 3, make: function (R) {
    var n = R.int(3, 8), boxes = R.int(3, 9), total = n * boxes;
    return { text: 'The ratio of boxes to pencils is 1 : ' + n + '.\nThere are ' + total + ' pencils.\nHow many boxes are there?', answer: boxes,
      bm: 'Nisbah kotak kepada pensel ialah 1 : ' + n + '. Ada ' + total + ' batang pensel. Berapakah bilangan kotak?', simple: 'One box has ' + n + ' pencils. There are ' + total + ' pencils. How many boxes?',
      wrong: [[total * n, 'PLAN', ['Each box holds ' + n + ' pencils. Make groups of ' + n + '.', 'Setiap kotak ada ' + n + ' pensel. Buat kumpulan ' + n + '.']], [total - n, 'PLAN', ['You subtracted. Think about groups of ' + n + '.', 'Anda menolak. Fikir tentang kumpulan ' + n + '.']], [boxes + 1, 'EXECUTE', ['Check: boxes × ' + n + ' should be ' + total + '.', 'Semak: kotak × ' + n + ' patut jadi ' + total + '.']]],
      hints: [['What does 1 : ' + n + ' tell us about one box?', 'Apakah maksud 1 : ' + n + ' bagi satu kotak?'], ['Each box has ' + n + ' pencils. How many groups of ' + n + ' make ' + total + '?', 'Setiap kotak ada ' + n + ' pensel. Berapa kumpulan ' + n + ' dalam ' + total + '?'], [total + ' ÷ ' + n + ' = ?', total + ' ÷ ' + n + ' = ?']],
      show: [['1 box : ' + n + ' pencils.', '1 kotak : ' + n + ' pensel.'], [total + ' ÷ ' + n + ' = ' + boxes + ' boxes.', total + ' ÷ ' + n + ' = ' + boxes + ' kotak.']],
      check: ['Check: ' + boxes + ' × ' + n + ' = ' + total + ' ✓', 'Semak: ' + boxes + ' × ' + n + ' = ' + total + ' ✓'] };
  } });

  /* ══════════ DATA ══════════ */
  var DAYBM = { Monday: 'Isnin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Khamis' };
  var PICTO = [
    { title: 'Books read this month', titleBm: 'Buku dibaca bulan ini', icon: '📕', unit: 'books', unitBm: 'buah buku', labels: ['Aina', 'Bala', 'Chen', 'Devi'], bm: 'buku yang dibaca',
      q: function (l) { return 'How many books did ' + l + ' read?'; }, qb: function (l) { return 'Berapakah buku yang dibaca oleh ' + l + '?'; } },
    { title: 'Durians sold', titleBm: 'Durian yang dijual', icon: '●', unit: 'durians', unitBm: 'biji durian', labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], bm: 'durian yang dijual',
      q: function (l) { return 'How many durians were sold on ' + l + '?'; }, qb: function (l) { return 'Berapakah durian yang dijual pada hari ' + DAYBM[l] + '?'; } },
    { title: 'Bottles collected for recycling', titleBm: 'Botol dikumpul untuk kitar semula', icon: '🧴', unit: 'bottles', unitBm: 'botol', labels: ['4 Bestari', '4 Cemerlang', '4 Dinamik', '4 Gemilang'], bm: 'botol yang dikumpul',
      q: function (l) { return 'How many bottles did ' + l + ' collect?'; }, qb: function (l) { return 'Berapakah botol yang dikumpul oleh kelas ' + l + '?'; } }
  ];
  function pictoData(R, keyChoices) {
    var p = R.pick(PICTO), key = R.pick(keyChoices), rows = p.labels.slice(0, R.int(3, 4)).map(function (l) { return [l, R.int(1, 6)]; });
    return { p: p, key: key, rows: rows, visual: { kind: 'picto', title: p.title, titleBm: p.titleBm, icon: p.icon, key: key, unit: p.unit, unitBm: p.unitBm, rows: rows } };
  }
  T({ id: 'da-picto', skill: 'data', level: 2, make: function (R) {
    var d = pictoData(R, [2, 5, 10]), row = R.pick(d.rows), ans = row[1] * d.key;
    return { text: 'The pictograph shows ' + d.p.title.toLowerCase() + '.\n' + d.p.q(row[0]), visual: d.visual, answer: ans, step: d.key,
      bm: 'Piktograf menunjukkan ' + d.p.bm + '. ' + d.p.qb(row[0]), simple: 'Find ' + row[0] + '. Each picture means ' + d.key + '. How many?',
      wrong: [[row[1], 'CHECK', ['You counted the pictures. Check the key: each picture means ' + d.key + '.', 'Anda mengira gambar. Lihat petunjuk: setiap gambar mewakili ' + d.key + '.']], [row[1] + d.key, 'EXECUTE', ['Each picture is ' + d.key + ', so multiply, don’t add.', 'Setiap gambar mewakili ' + d.key + ', jadi darab, jangan tambah.']], [ans + d.key, 'EXECUTE', ['Count the pictures again.', 'Kira gambar sekali lagi.']]],
      hints: [['Look at the key. What does one picture represent?', 'Lihat petunjuk. Satu gambar mewakili berapa?'], ['One picture = ' + d.key + ' ' + d.p.unit + '. Count the pictures for ' + row[0] + '.', 'Satu gambar = ' + d.key + ' ' + d.p.unitBm + '. Kira gambar bagi ' + row[0] + '.'], [row[1] + ' pictures × ' + d.key + ' = ?', row[1] + ' gambar × ' + d.key + ' = ?']],
      show: [['Key: 1 picture = ' + d.key + ' ' + d.p.unit + '.', 'Petunjuk: 1 gambar = ' + d.key + ' ' + d.p.unitBm + '.'], [row[0] + ': ' + row[1] + ' × ' + d.key + ' = ' + ans + '.', row[0] + ': ' + row[1] + ' × ' + d.key + ' = ' + ans + '.']],
      why: { q: ['Why did you multiply by ' + d.key + '?', 'Kenapa anda darab dengan ' + d.key + '?'], options: [['The key says each picture represents ' + d.key, 'Petunjuk menyatakan setiap gambar mewakili ' + d.key], ['Because there are ' + d.key + ' rows', 'Kerana ada ' + d.key + ' baris'], ['Because big numbers are better', 'Kerana nombor besar lebih baik']], answer: 0 } };
  } });

  T({ id: 'da-picto-diff', skill: 'data', level: 3, make: function (R) {
    var d = pictoData(R, [2, 5, 10]), rs = R.shuffle(d.rows), a = rs[0], b = rs[1];
    if (a[1] === b[1]) { a[1] = a[1] + 1; }
    var hi = a[1] > b[1] ? a : b, lo = hi === a ? b : a, ans = (hi[1] - lo[1]) * d.key;
    return { text: 'Look at the pictograph.\nHow many more ' + d.p.unit + ' did ' + hi[0] + ' have than ' + lo[0] + '?', visual: d.visual, answer: ans, step: d.key, keepWords: ['than'],
      bm: 'Lihat piktograf. Berapa banyak lagi ' + d.p.unitBm + ' bagi ' + hi[0] + ' berbanding ' + lo[0] + '?', simple: 'How much bigger is ' + hi[0] + '’s number than ' + lo[0] + '’s?',
      wrong: [[hi[1] - lo[1], 'CHECK', ['That is the number of pictures. Use the key: each picture is ' + d.key + '.', 'Itu bilangan gambar. Guna petunjuk: setiap gambar = ' + d.key + '.']], [(hi[1] + lo[1]) * d.key, 'UNDERSTAND', ['You added. “How many more” compares.', 'Anda menambah. “Berapa banyak lagi” bermaksud bandingkan.']], [hi[1] * d.key, 'UNDERSTAND', ['That is only ' + hi[0] + '. Compare it with ' + lo[0] + '.', 'Itu ' + hi[0] + ' sahaja. Bandingkan dengan ' + lo[0] + '.']]],
      hints: [['We are comparing two rows. Which two?', 'Kita membandingkan dua baris. Yang mana?'], ['Find each row using the key, then compare.', 'Cari nilai setiap baris dengan petunjuk, kemudian bandingkan.'], [hi[0] + ': ' + hi[1] + ' × ' + d.key + '. ' + lo[0] + ': ' + lo[1] + ' × ' + d.key + '. Find the difference.', hi[0] + ': ' + hi[1] + ' × ' + d.key + '. ' + lo[0] + ': ' + lo[1] + ' × ' + d.key + '. Cari bezanya.']],
      show: [[hi[0] + ': ' + hi[1] * d.key + '. ' + lo[0] + ': ' + lo[1] * d.key + '.', hi[0] + ': ' + hi[1] * d.key + '. ' + lo[0] + ': ' + lo[1] * d.key + '.'], [hi[1] * d.key + ' − ' + lo[1] * d.key + ' = ' + ans + '.', hi[1] * d.key + ' − ' + lo[1] * d.key + ' = ' + ans + '.']] };
  } });

  var TABLES = [
    { head: ['Drink', 'Pupils'], headBm: ['Minuman', 'Murid'], rows: ['Milo', 'Teh tarik', 'Sirap', 'Soya'], what: 'favourite drinks of some pupils', bm: 'minuman kegemaran beberapa orang murid' },
    { head: ['Sport', 'Pupils'], headBm: ['Sukan', 'Murid'], rows: ['Football', 'Badminton', 'Netball', 'Swimming'], what: 'favourite sports of some pupils', bm: 'sukan kegemaran beberapa orang murid' },
    { head: ['Fruit', 'Pupils'], headBm: ['Buah', 'Murid'], rows: ['Mango', 'Durian', 'Rambutan', 'Banana'], what: 'favourite fruits of some pupils', bm: 'buah kegemaran beberapa orang murid' }
  ];
  function tableData(R) {
    var t = R.pick(TABLES), n = R.int(3, 4), vals = [];
    while (vals.length < n) { var v = R.int(5, 30); if (vals.indexOf(v) < 0) vals.push(v); }
    return { t: t, rows: t.rows.slice(0, n).map(function (r, i) { return [r, vals[i]]; }) };
  }
  T({ id: 'da-table-total', skill: 'data', level: 3, make: function (R) {
    var d = tableData(R), sum = d.rows.reduce(function (s, r) { return s + r[1]; }, 0);
    return { text: 'The table shows the ' + d.t.what + '.\nHow many pupils were asked altogether?', visual: { kind: 'table', head: d.t.head, headBm: d.t.headBm, rows: d.rows }, answer: sum,
      bm: 'Jadual menunjukkan ' + d.t.bm + '. Berapakah jumlah semua murid?', simple: 'Add all the pupils in the table.',
      wrong: [[sum - d.rows[d.rows.length - 1][1], 'EXECUTE', ['Did you add every row?', 'Sudah tambah setiap baris?']], [Math.max.apply(null, d.rows.map(function (r) { return r[1]; })), 'UNDERSTAND', ['That is only one row. “Altogether” means add them all.', 'Itu satu baris sahaja. “Jumlah semua” bermaksud tambah semuanya.']], [sum + 10, 'EXECUTE', ['Check the adding.', 'Semak tambahan.']]],
      hints: [['“Altogether” means all the groups together.', '“Jumlah semua” bermaksud semua kumpulan digabungkan.'], ['Add all the numbers in the Pupils column.', 'Tambah semua nombor dalam lajur Murid.'], ['Look for pairs that are easy to add first.', 'Cari pasangan yang mudah ditambah dahulu.']],
      show: [[d.rows.map(function (r) { return r[1]; }).join(' + ') + ' = ' + sum + '.', d.rows.map(function (r) { return r[1]; }).join(' + ') + ' = ' + sum + '.']] };
  } });

  T({ id: 'da-table-most', skill: 'data', level: 2, make: function (R) {
    var d = tableData(R), most = R.chance(0.6), sorted = d.rows.slice().sort(function (a, b) { return most ? b[1] - a[1] : a[1] - b[1]; });
    var msg = most ? ['Most popular has the biggest number.', 'Paling digemari mempunyai nombor paling besar.'] : ['Least popular has the smallest number.', 'Paling kurang digemari mempunyai nombor paling kecil.'];
    return { text: 'The table shows the ' + d.t.what + '.\nWhich is the ' + (most ? 'most popular' : 'least popular') + '?', visual: { kind: 'table', head: d.t.head, headBm: d.t.headBm, rows: d.rows }, answer: sorted[0][0],
      bm: 'Jadual menunjukkan ' + d.t.bm + '. Yang manakah paling ' + (most ? 'digemari' : 'kurang digemari') + '?', simple: 'Which did the ' + (most ? 'most' : 'fewest') + ' pupils choose?',
      wrong: sorted.slice(1).map(function (r) { return [r[0], 'UNDERSTAND', msg]; }),
      hints: [[(most ? 'Most' : 'Least') + ' popular means chosen by the ' + (most ? 'most' : 'fewest') + ' pupils.', 'Paling ' + (most ? 'digemari' : 'kurang digemari') + ' bermaksud dipilih oleh paling ' + (most ? 'ramai' : 'sedikit') + ' murid.'], ['Look at the Pupils column.', 'Lihat lajur Murid.'], ['Find the ' + (most ? 'biggest' : 'smallest') + ' number.', 'Cari nombor paling ' + (most ? 'besar' : 'kecil') + '.']],
      show: [['The ' + (most ? 'biggest' : 'smallest') + ' number is ' + sorted[0][1] + ' → ' + sorted[0][0] + '.', 'Nombor paling ' + (most ? 'besar' : 'kecil') + ' ialah ' + sorted[0][1] + ' → ' + sorted[0][0] + '.']] };
  } });

  T({ id: 'da-bar', skill: 'data', level: 2, make: function (R) {
    var step = R.pick([2, 5, 10]), labels = R.pick([['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Red', 'Blue', 'Green', 'Yellow'], ['4A', '4B', '4C', '4D']]);
    var bars = labels.map(function (l) { return [l, step * R.int(1, 8)]; });
    var what = R.pick([['Cupcakes sold at the school canteen', 'cupcakes', 'Kek cawan dijual di kantin sekolah', 'kek cawan'], ['Votes for favourite colour', 'votes', 'Undi warna kegemaran', 'undi'], ['Library books borrowed', 'books', 'Buku perpustakaan dipinjam', 'buku']]);
    var two = R.shuffle(bars).slice(0, 2), hi = two[0][1] >= two[1][1] ? two[0] : two[1], lo = hi === two[0] ? two[1] : two[0];
    if (hi[1] === lo[1]) hi[1] += step;
    var vis = { kind: 'barchart', title: what[0], titleBm: what[2], bars: bars, step: step };
    var lb = function (x) { return FMQ.trWord ? FMQ.trWord(x) : x; };
    if (R.chance(0.5)) return { text: 'Look at the bar chart.\nHow many ' + what[1] + ' were there for ' + hi[0] + '?', visual: vis, answer: hi[1], step: step,
      bm: 'Lihat carta palang. Berapakah bilangan ' + what[3] + ' bagi ' + lb(hi[0]) + '?', simple: 'How tall is the ' + hi[0] + ' bar?',
      wrong: [[hi[1] - step, 'EXECUTE', ['Read the top of the bar across to the scale.', 'Baca dari hujung palang ke skala.']], [hi[1] / step, 'CHECK', ['Check the scale: each line is ' + step + '.', 'Semak skala: setiap garis bernilai ' + step + '.']], [hi[1] + step, 'EXECUTE', ['Read the top of the bar carefully.', 'Baca hujung palang dengan teliti.']]],
      hints: [['Find the bar for ' + hi[0] + '.', 'Cari palang bagi ' + lb(hi[0]) + '.'], ['Look at the scale on the side. Each line goes up by ' + step + '.', 'Lihat skala di tepi. Setiap garis naik ' + step + '.'], ['Read across from the top of the bar to the scale.', 'Baca dari hujung palang ke skala.']],
      show: [['The bar for ' + hi[0] + ' reaches ' + hi[1] + '.', 'Palang bagi ' + lb(hi[0]) + ' sampai ' + hi[1] + '.']] };
    return { text: 'Look at the bar chart.\nHow many more ' + what[1] + ' were there for ' + hi[0] + ' than for ' + lo[0] + '?', visual: vis, answer: hi[1] - lo[1], step: step, keepWords: ['than'],
      bm: 'Lihat carta palang. Berapa banyak lagi ' + what[3] + ' bagi ' + lb(hi[0]) + ' berbanding ' + lb(lo[0]) + '?', simple: 'How much taller is the ' + hi[0] + ' bar than the ' + lo[0] + ' bar?',
      wrong: [[hi[1] + lo[1], 'UNDERSTAND', ['You added. “How many more” compares.', 'Anda menambah. “Berapa banyak lagi” bermaksud bandingkan.']], [hi[1], 'UNDERSTAND', ['That is one bar. Compare the two bars.', 'Itu satu palang. Bandingkan dua palang.']], [(hi[1] - lo[1]) / step, 'CHECK', ['Check the scale: each line is ' + step + '.', 'Semak skala: setiap garis bernilai ' + step + '.']]],
      hints: [['We are comparing two bars. Which two?', 'Kita membandingkan dua palang. Yang mana?'], ['Read each bar using the scale.', 'Baca setiap palang menggunakan skala.'], [hi[0] + ' is ' + hi[1] + ', ' + lo[0] + ' is ' + lo[1] + '. Find the difference.', lb(hi[0]) + ' ialah ' + hi[1] + ', ' + lb(lo[0]) + ' ialah ' + lo[1] + '. Cari bezanya.']],
      show: [[hi[1] + ' − ' + lo[1] + ' = ' + (hi[1] - lo[1]) + '.', hi[1] + ' − ' + lo[1] + ' = ' + (hi[1] - lo[1]) + '.']] };
  } });

  /* ══════════ SHAPES & ANGLES ══════════ */
  var SOLIDS = [['cube', 6, 12, 8, 'kubus'], ['cuboid', 6, 12, 8, 'kuboid'], ['square-based pyramid', 5, 8, 5, 'piramid tapak segi empat sama'], ['triangular prism', 5, 9, 6, 'prisma segi tiga']];
  var PROPBM = { faces: 'muka', edges: 'tepi', vertices: 'bucu' };
  T({ id: 'sh-solid', skill: 'shapes', level: 1, make: function (R) {
    var s = R.pick(SOLIDS), k = R.int(1, 3), prop = ['', 'faces', 'edges', 'vertices'][k], v = s[k];
    var msg = ['Check which part we are counting: faces are flat surfaces, edges are lines, vertices are corners.', 'Semak bahagian yang dikira: muka ialah permukaan rata, tepi ialah garis, bucu ialah penjuru.'];
    return { text: 'How many ' + prop + ' does a ' + s[0] + ' have?', visual: { kind: 'solid', shape: s[0] }, answer: v,
      bm: 'Berapakah bilangan ' + PROPBM[prop] + ' bagi sebuah ' + s[4] + '?', simple: 'Count the ' + prop + ' of a ' + s[0] + '.',
      wrong: [s[1], s[2], s[3]].filter(function (x) { return x !== v; }).map(function (o) { return [o, 'CONCEPT', msg]; }),
      hints: [{ faces: ['Faces are the flat surfaces.', 'Muka ialah permukaan rata.'], edges: ['Edges are where two faces meet.', 'Tepi ialah garis tempat dua muka bertemu.'], vertices: ['Vertices are the corners.', 'Bucu ialah penjuru.'] }[prop],
        ['Imagine holding a ' + s[0] + '. Count the ' + prop + ' on the front first. Dashed lines are hidden at the back.', 'Bayangkan anda memegang ' + s[4] + '. Kira ' + PROPBM[prop] + ' di depan dahulu. Garis putus-putus tersembunyi di belakang.'],
        ['Then count the back and the sides. Don’t count any twice.', 'Kemudian kira bahagian belakang dan tepi. Jangan kira dua kali.']],
      show: [['A ' + s[0] + ' has ' + s[1] + ' faces, ' + s[2] + ' edges and ' + s[3] + ' vertices.', 'Sebuah ' + s[4] + ' ada ' + s[1] + ' muka, ' + s[2] + ' tepi dan ' + s[3] + ' bucu.']] };
  } });

  T({ id: 'sh-angle', skill: 'shapes', level: 2, make: function (R) {
    var kind = R.pick(['right', 'smaller', 'bigger']), deg = kind === 'right' ? 90 : kind === 'smaller' ? R.mult(25, 70, 5) : R.mult(110, 160, 5);
    var opts = { right: 'A right angle', smaller: 'Smaller than a right angle', bigger: 'Bigger than a right angle' };
    var msg = ['A right angle is a square corner, like the corner of a book. Compare with that.', 'Sudut tegak seperti penjuru buku. Bandingkan dengannya.'];
    return { text: 'Look at the angle.\nIs it a right angle, smaller than a right angle, or bigger than a right angle?', visual: { kind: 'angle', deg: deg }, answer: opts[kind], count: 3, order: [opts.smaller, opts.right, opts.bigger],
      bm: 'Lihat sudut ini. Adakah ia sudut tegak, lebih kecil daripada sudut tegak, atau lebih besar daripada sudut tegak?', simple: 'Compare the angle with the corner of a book.',
      wrong: Object.keys(opts).filter(function (k) { return k !== kind; }).map(function (k) { return [opts[k], 'CONCEPT', msg]; }),
      hints: [['A right angle looks like the corner of a book or a square.', 'Sudut tegak seperti penjuru buku atau segi empat sama.'], ['Imagine putting the corner of a book on the angle.', 'Bayangkan meletakkan penjuru buku pada sudut itu.'], ['Is the opening wider or narrower than the book’s corner?', 'Bukaannya lebih luas atau lebih sempit daripada penjuru buku?']],
      show: [kind === 'right' ? ['This angle is a square corner: a right angle.', 'Sudut ini seperti penjuru segi empat: sudut tegak.'] : kind === 'smaller' ? ['This angle is narrower than a square corner.', 'Sudut ini lebih sempit daripada sudut tegak.'] : ['This angle is wider than a square corner.', 'Sudut ini lebih luas daripada sudut tegak.']] };
  } });

  T({ id: 'sh-lines', skill: 'shapes', level: 2, make: function (R) {
    var kind = R.pick(['parallel', 'perpendicular', 'neither']), opts = { parallel: 'Parallel', perpendicular: 'Perpendicular', neither: 'Neither' };
    var msg = ['Parallel lines never meet. Perpendicular lines meet at a right angle.', 'Garis selari tidak pernah bertemu. Garis serenjang bertemu pada sudut tegak.'];
    return { text: 'Look at the two lines.\nAre they parallel, perpendicular, or neither?', visual: { kind: 'lines', type: kind, rot: R.int(-20, 20) }, answer: opts[kind], count: 3, order: ['Parallel', 'Perpendicular', 'Neither'],
      bm: 'Lihat dua garis ini. Adakah garis itu selari, serenjang, atau bukan kedua-duanya?', simple: 'Do the lines meet? If they meet, is it a square corner?',
      wrong: Object.keys(opts).filter(function (k) { return k !== kind; }).map(function (k) { return [opts[k], 'CONCEPT', msg]; }),
      hints: [['Do the lines meet, or would they meet if they were longer?', 'Adakah garis itu bertemu, atau akan bertemu jika dipanjangkan?'], ['Parallel lines stay the same distance apart and never meet.', 'Garis selari sentiasa sama jarak dan tidak pernah bertemu.'], ['If they meet, is it at a square corner? That is perpendicular.', 'Jika bertemu, adakah pada sudut tegak? Itu serenjang.']],
      show: [kind === 'parallel' ? ['They stay the same distance apart: parallel.', 'Jaraknya sentiasa sama: selari.'] : kind === 'perpendicular' ? ['They meet at a right angle: perpendicular.', 'Bertemu pada sudut tegak: serenjang.'] : ['They meet, but not at a right angle: neither.', 'Bertemu, tetapi bukan pada sudut tegak: bukan kedua-duanya.']] };
  } });

  T({ id: 'sh-sides', skill: 'shapes', level: 1, make: function (R) {
    var s = R.pick([['triangle', 3, 'segi tiga'], ['pentagon', 5, 'pentagon'], ['hexagon', 6, 'heksagon'], ['octagon', 8, 'oktagon'], ['rectangle', 4, 'segi empat tepat']]);
    var cnt = ['Count the sides again, one by one.', 'Kira sisi sekali lagi, satu demi satu.'];
    return { text: 'How many sides does a ' + s[0] + ' have?', visual: { kind: 'polygon', sides: s[1] }, answer: s[1],
      bm: 'Berapakah bilangan sisi bagi sebuah ' + s[2] + '?', simple: 'Count the sides of the ' + s[0] + '.',
      wrong: [[s[1] + 1, 'EXECUTE', cnt], [s[1] - 1, 'EXECUTE', cnt], [s[1] * 2, 'CONCEPT', ['Count the straight sides only.', 'Kira sisi yang lurus sahaja.']]],
      hints: [['Look at the shape.', 'Lihat bentuk itu.'], ['Put your finger on one side and count around.', 'Letak jari pada satu sisi dan kira sekeliling.'], ['Stop when you get back to the start.', 'Berhenti apabila kembali ke tempat mula.']],
      show: [['A ' + s[0] + ' has ' + s[1] + ' sides.', 'Sebuah ' + s[2] + ' ada ' + s[1] + ' sisi.']] };
  } });

  /* ══════════ COORDINATES ══════════ */
  var ACROSS = ['Go across first, then up.', 'Gerak melintang dahulu, kemudian ke atas.'];
  T({ id: 'co-read', skill: 'coordinates', level: 1, make: function (R) {
    var x, y; do { x = R.int(1, 6); y = R.int(1, 6); } while (x === y);
    return { text: 'Look at the grid.\nWhat are the coordinates of point A?', visual: { kind: 'coord', points: [['A', x, y]] }, answer: pt(x, y),
      bm: 'Lihat grid. Apakah koordinat titik A?', simple: 'How far across and how far up is A?',
      wrong: [[pt(y, x), 'UNDERSTAND', ACROSS], [pt(x + 1, y), 'EXECUTE', ['Count the grid lines from 0.', 'Kira garisan grid dari 0.']], [pt(x, y - 1 || y + 1), 'EXECUTE', ['Count the lines going up from 0.', 'Kira garisan ke atas dari 0.']]],
      hints: [['Start at 0, the corner where the two number lines meet.', 'Mula di 0, penjuru tempat dua garis nombor bertemu.'], ['Go across first. How far across is A?', 'Gerak melintang dahulu. Berapa jauh A ke kanan?'], ['Then go up. Write (across, up).', 'Kemudian ke atas. Tulis (melintang, atas).']],
      show: [['Across: ' + x + '. Up: ' + y + '.', 'Melintang: ' + x + '. Atas: ' + y + '.'], ['A = ' + pt(x, y) + '.', 'A = ' + pt(x, y) + '.']] };
  } });

  T({ id: 'co-find', skill: 'coordinates', level: 2, make: function (R) {
    var x, y; do { x = R.int(1, 6); y = R.int(1, 6); } while (x === y);
    var letters = R.shuffle(['P', 'Q', 'R', 'S']), used = {}, pts = [[letters[0], x, y], [letters[1], y, x]];
    used[x + ',' + y] = used[y + ',' + x] = 1;
    [letters[2], letters[3]].forEach(function (l) { var a, b; do { a = R.int(0, 6); b = R.int(0, 6); } while (used[a + ',' + b]); used[a + ',' + b] = 1; pts.push([l, a, b]); });
    var cnt = ['Count the grid lines carefully from 0.', 'Kira garisan grid dengan teliti dari 0.'];
    return { text: 'Which point is at ' + pt(x, y) + '?', visual: { kind: 'coord', points: pts }, answer: letters[0], order: ['P', 'Q', 'R', 'S'],
      bm: 'Titik manakah berada pada ' + pt(x, y) + '?', simple: 'Go across ' + x + ', then up ' + y + '. Which letter is there?',
      wrong: [[letters[1], 'UNDERSTAND', ['Go across first (' + x + '), then up (' + y + ').', 'Melintang dahulu (' + x + '), kemudian ke atas (' + y + ').']], [letters[2], 'EXECUTE', cnt], [letters[3], 'EXECUTE', cnt]],
      hints: [['The first number is how far across.', 'Nombor pertama ialah jarak melintang.'], ['Go across ' + x + ' from 0.', 'Gerak melintang ' + x + ' dari 0.'], ['Now go up ' + y + '. Which point is there?', 'Sekarang naik ' + y + '. Titik apa di situ?']],
      show: [['Across ' + x + ', up ' + y + ' → point ' + letters[0] + '.', 'Melintang ' + x + ', atas ' + y + ' → titik ' + letters[0] + '.']] };
  } });

  T({ id: 'co-move', skill: 'coordinates', level: 3, make: function (R) {
    var x = R.int(0, 3), y = R.int(0, 3), r = R.int(1, 3), u; do { u = R.int(1, 3); } while (u === r);
    return { text: 'A robot starts at ' + pt(x, y) + '.\nIt moves ' + r + ' units right and ' + u + ' units up.\nWhere is the robot now?', visual: { kind: 'coord', points: [['Start', x, y]] }, answer: pt(x + r, y + u),
      bm: 'Sebuah robot bermula di ' + pt(x, y) + '. Ia bergerak ' + r + ' unit ke kanan dan ' + u + ' unit ke atas. Di manakah robot itu sekarang?', simple: 'Start at ' + pt(x, y) + '. Go right ' + r + ', then up ' + u + '. Where are you?',
      wrong: [[pt(x + u, y + r), 'UNDERSTAND', ['Right changes the first number. Up changes the second.', 'Ke kanan mengubah nombor pertama. Ke atas mengubah nombor kedua.']], [pt(x + r, y), 'EXECUTE', ['Don’t forget to move up too.', 'Jangan lupa bergerak ke atas juga.']], [pt(Math.max(0, x - r), y + u), 'EXECUTE', ['Right means the first number gets bigger.', 'Ke kanan bermaksud nombor pertama bertambah.']]],
      hints: [['Which number changes when you move right?', 'Nombor manakah berubah apabila bergerak ke kanan?'], ['Moving right adds to the first number. Moving up adds to the second.', 'Ke kanan menambah nombor pertama. Ke atas menambah nombor kedua.'], [x + ' + ' + r + ' = ?, and ' + y + ' + ' + u + ' = ?', x + ' + ' + r + ' = ?, dan ' + y + ' + ' + u + ' = ?']],
      show: [['Right ' + r + ': ' + x + ' + ' + r + ' = ' + (x + r) + '.', 'Kanan ' + r + ': ' + x + ' + ' + r + ' = ' + (x + r) + '.'], ['Up ' + u + ': ' + y + ' + ' + u + ' = ' + (y + u) + '.', 'Atas ' + u + ': ' + y + ' + ' + u + ' = ' + (y + u) + '.'], ['New point: ' + pt(x + r, y + u) + '.', 'Titik baharu: ' + pt(x + r, y + u) + '.']] };
  } });

  T({ id: 'co-dist', skill: 'coordinates', level: 3, make: function (R) {
    var y = R.int(1, 5), x1 = R.int(0, 2), x2 = R.int(x1 + 2, 6);
    return { text: 'Point A is at ' + pt(x1, y) + '.\nPoint B is at ' + pt(x2, y) + '.\nHow many units apart are A and B?', visual: { kind: 'coord', points: [['A', x1, y], ['B', x2, y]] }, answer: x2 - x1,
      bm: 'Titik A di ' + pt(x1, y) + ' dan titik B di ' + pt(x2, y) + '. Berapa unit jarak antara A dan B?', simple: 'How many jumps from A to B?',
      wrong: [[x1 + x2, 'PLAN', ['You added. Find the gap between them.', 'Anda menambah. Cari jarak antara keduanya.']], [x2, 'UNDERSTAND', ['That is where B is. Count from A to B.', 'Itu kedudukan B. Kira dari A ke B.']], [x2 - x1 + 1, 'EXECUTE', ['Count the jumps, not the dots.', 'Kira lompatan, bukan titik.']]],
      hints: [['Both points are at the same height. Only the first number changes.', 'Kedua-dua titik sama tinggi. Hanya nombor pertama berubah.'], ['Count the jumps from ' + x1 + ' to ' + x2 + '.', 'Kira lompatan dari ' + x1 + ' ke ' + x2 + '.'], [x2 + ' − ' + x1 + ' = ?', x2 + ' − ' + x1 + ' = ?']],
      show: [[x2 + ' − ' + x1 + ' = ' + (x2 - x1) + ' units.', x2 + ' − ' + x1 + ' = ' + (x2 - x1) + ' unit.']] };
  } });

  /* ══════════ MULTI-STEP (Mini Boss) ══════════ */
  T({ id: 'wp-change', skill: 'word-problems', level: 4, related: ['money', 'times-divide'], make: function (R) {
    var n = R.pick(NAMES), it = R.pick([['shirts', 'helai baju'], ['storybooks', 'buah buku cerita'], ['packets of nasi lemak', 'bungkus nasi lemak'], ['notebooks', 'buah buku nota']]);
    var q = R.int(2, 4), p, P; do { p = R.mult(250, 1590, 10); P = R.pick([2000, 5000, 10000]); } while (p * q >= P - 100 || p % 100 === 0);
    var cost = p * q, ans = P - cost;
    return { text: n + ' buys ' + q + ' ' + it[0] + ' at ' + rm(p) + ' each.\n' + n + ' pays with ' + rm(P) + '.\nHow much change does ' + n + ' get?', answer: ans, fmt: rm, keepWords: ['each'],
      bm: n + ' membeli ' + q + ' ' + it[1] + ' dengan harga ' + rm(p) + ' setiap satu. ' + n + ' membayar dengan ' + rm(P) + '. Berapakah baki wang yang diterima?', simple: 'One costs ' + rm(p) + '. ' + n + ' takes ' + q + '. ' + n + ' gives ' + rm(P) + '. How much money comes back?',
      wrong: [[P - p, 'PLAN', ['You took away only one. ' + n + ' buys ' + q + '.', 'Anda tolak satu sahaja. ' + n + ' membeli ' + q + '.']], [cost, 'UNDERSTAND', ['That is the cost. The question asks for the change.', 'Itu harganya. Soalan bertanya baki wang.']], [ans + 100, 'EXECUTE', ['Check the subtraction.', 'Semak tolakan.']]],
      hints: [['WHAT? We need the change. What must we know first?', 'APA? Kita perlukan baki wang. Apa yang perlu diketahui dahulu?'], ['HOW? Step 1: find the cost of ' + q + '. Step 2: take it from ' + rm(P) + '.', 'BAGAIMANA? Langkah 1: cari harga ' + q + '. Langkah 2: tolak daripada ' + rm(P) + '.'], ['DO: ' + q + ' × ' + rm(p) + ' = ' + rm(cost) + '. Now find the change from ' + rm(P) + '.', 'BUAT: ' + q + ' × ' + rm(p) + ' = ' + rm(cost) + '. Sekarang cari baki daripada ' + rm(P) + '.']],
      show: [['Step 1: ' + q + ' × ' + rm(p) + ' = ' + rm(cost) + '.', 'Langkah 1: ' + q + ' × ' + rm(p) + ' = ' + rm(cost) + '.'], ['Step 2: ' + rm(P) + ' − ' + rm(cost) + ' = ' + rm(ans) + '.', 'Langkah 2: ' + rm(P) + ' − ' + rm(cost) + ' = ' + rm(ans) + '.']],
      check: ['Check: ' + rm(cost) + ' + ' + rm(ans) + ' = ' + rm(P) + ' ✓', 'Semak: ' + rm(cost) + ' + ' + rm(ans) + ' = ' + rm(P) + ' ✓'] };
  } });

  T({ id: 'wp-save', skill: 'word-problems', level: 4, related: ['money', 'decimals'], make: function (R) {
    var n = R.pick(NAMES), s = R.int(3, 12), w = R.int(4, 9), saved = s * w * 100, sp; do { sp = R.mult(550, saved - 300, 10); } while (sp % 100 === 0);
    var ans = saved - sp;
    return { text: n + ' saves RM' + s + ' every week.\nAfter ' + w + ' weeks, ' + n + ' spends ' + rm(sp) + ' on a gift.\nHow much money does ' + n + ' have now?', answer: ans, fmt: rm,
      bm: n + ' menyimpan RM' + s + ' setiap minggu. Selepas ' + w + ' minggu, ' + n + ' membelanjakan ' + rm(sp) + ' untuk hadiah. Berapakah wang ' + n + ' sekarang?', simple: n + ' keeps RM' + s + ' each week for ' + w + ' weeks. Then ' + n + ' uses ' + rm(sp) + '. How much is still there?',
      wrong: [[saved + sp, 'UNDERSTAND', ['Spending makes the money smaller.', 'Berbelanja mengurangkan wang.']], [saved, 'UNDERSTAND', ['That is the money saved. ' + n + ' spends some after that.', 'Itu wang yang disimpan. ' + n + ' berbelanja selepas itu.']], [ans + 100, 'EXECUTE', ['Check the subtraction.', 'Semak tolakan.']]],
      hints: [['WHAT? Money at the end. What happens first, and what happens next?', 'APA? Wang pada akhirnya. Apa berlaku dahulu, dan apa berlaku kemudian?'], ['HOW? Step 1: total saved in ' + w + ' weeks. Step 2: take away the gift.', 'BAGAIMANA? Langkah 1: jumlah simpanan ' + w + ' minggu. Langkah 2: tolak harga hadiah.'], ['DO: ' + w + ' × RM' + s + ' = ' + rm(saved) + '. Now ' + rm(saved) + ' − ' + rm(sp) + '.', 'BUAT: ' + w + ' × RM' + s + ' = ' + rm(saved) + '. Sekarang ' + rm(saved) + ' − ' + rm(sp) + '.']],
      show: [['Saved: ' + w + ' × RM' + s + ' = ' + rm(saved) + '.', 'Simpanan: ' + w + ' × RM' + s + ' = ' + rm(saved) + '.'], [rm(saved) + ' − ' + rm(sp) + ' = ' + rm(ans) + '.', rm(saved) + ' − ' + rm(sp) + ' = ' + rm(ans) + '.']],
      check: ['Check: ' + rm(ans) + ' + ' + rm(sp) + ' = ' + rm(saved) + ' ✓', 'Semak: ' + rm(ans) + ' + ' + rm(sp) + ' = ' + rm(saved) + ' ✓'] };
  } });

  T({ id: 'wp-fracleft', skill: 'word-problems', level: 4, related: ['fractions', 'add-sub'], make: function (R) {
    var n = R.pick(NAMES), d = R.pick([3, 4, 5, 6]), k = R.int(1, d - 1), m = R.int(4, 12), t = d * m, give = k * m, ans = t - give;
    var thing = R.pick([['marbles', 'biji guli'], ['stickers', 'keping pelekat'], ['sweets', 'biji gula-gula']]);
    return { text: n + ' has ' + t + ' ' + thing[0] + '.\n' + n + ' gives ' + k + '/' + d + ' of them to a friend.\nHow many ' + thing[0] + ' does ' + n + ' have left?', answer: ans, keepWords: ['of', 'left'],
      bm: n + ' ada ' + t + ' ' + thing[1] + '. ' + n + ' memberi ' + k + '/' + d + ' daripadanya kepada kawan. Berapakah baki ' + thing[1] + ' ' + n + '?', simple: n + ' has ' + t + '. ' + n + ' gives away ' + k + '/' + d + '. How many are still with ' + n + '?',
      wrong: [[give, 'UNDERSTAND', [give + ' is what was given away. The question asks what is left.', give + ' ialah yang diberi. Soalan bertanya bakinya.']], [t - k, 'CONCEPT', [k + '/' + d + ' of ' + t + ' is not ' + k + '. Share ' + t + ' into ' + d + ' groups.', k + '/' + d + ' daripada ' + t + ' bukan ' + k + '. Bahagi ' + t + ' kepada ' + d + ' kumpulan.']], [t + give, 'UNDERSTAND', ['Giving away makes it less.', 'Memberi menjadikannya berkurang.']]],
      hints: [['WHAT? We need what ' + n + ' still has.', 'APA? Kita cari baki ' + n + '.'], ['HOW? Step 1: find ' + k + '/' + d + ' of ' + t + '. Step 2: take that away from ' + t + '.', 'BAGAIMANA? Langkah 1: cari ' + k + '/' + d + ' daripada ' + t + '. Langkah 2: tolak daripada ' + t + '.'], ['DO: ' + t + ' ÷ ' + d + ' = ' + m + ', so ' + k + '/' + d + ' = ' + give + '. Now ' + t + ' − ' + give + '.', 'BUAT: ' + t + ' ÷ ' + d + ' = ' + m + ', jadi ' + k + '/' + d + ' = ' + give + '. Sekarang ' + t + ' − ' + give + '.']],
      show: [[k + '/' + d + ' of ' + t + ' = ' + give + '.', k + '/' + d + ' daripada ' + t + ' = ' + give + '.'], [t + ' − ' + give + ' = ' + ans + '.', t + ' − ' + give + ' = ' + ans + '.']],
      check: ['Check: ' + ans + ' + ' + give + ' = ' + t + ' ✓', 'Semak: ' + ans + ' + ' + give + ' = ' + t + ' ✓'] };
  } });

  T({ id: 'wp-time', skill: 'word-problems', level: 4, related: ['duration', 'time24'], make: function (R) {
    var n = R.pick(NAMES), s = R.int(8, 15) * 60 + R.mult(0, 45, 15), a = R.mult(25, 70, 5), b = R.mult(20, 55, 5), e = s + a + b;
    return { text: n + ' starts homework at ' + t24(s) + '.\nMaths takes ' + a + ' minutes.\nThen English takes ' + b + ' minutes.\nWhat time does ' + n + ' finish?', answer: t24(e),
      bm: n + ' mula membuat kerja rumah pada ' + t24b(s) + '. Matematik mengambil masa ' + a + ' minit. Kemudian Bahasa Inggeris mengambil masa ' + b + ' minit. Pukul berapakah ' + n + ' selesai?', simple: 'Start: ' + t24(s) + '. ' + a + ' minutes, then ' + b + ' minutes more. When does ' + n + ' finish?',
      wrong: [[t24(s + a), 'PLAN', ['That is after Maths only. Add English too.', 'Itu selepas Matematik sahaja. Tambah Bahasa Inggeris juga.']], [t24(s + a + b + 40), 'CONCEPT', ['60 minutes make 1 hour, not 100.', '60 minit = 1 jam, bukan 100.']], [t24(e - 60), 'EXECUTE', ['Check the hour.', 'Semak jam.']]],
      hints: [['WHAT? We need the finishing time.', 'APA? Kita cari waktu selesai.'], ['HOW? Add both times together, then add them to the start time.', 'BAGAIMANA? Tambah kedua-dua masa, kemudian tambah pada waktu mula.'], ['DO: ' + a + ' + ' + b + ' = ' + (a + b) + ' minutes = ' + dur(a + b) + '. Add that to ' + t24(s) + '.', 'BUAT: ' + a + ' + ' + b + ' = ' + (a + b) + ' minit = ' + durBm(a + b) + '. Tambah pada ' + t24b(s) + '.']],
      show: [[a + ' + ' + b + ' = ' + (a + b) + ' minutes = ' + dur(a + b) + '.', a + ' + ' + b + ' = ' + (a + b) + ' minit = ' + durBm(a + b) + '.'], [t24(s) + ' + ' + dur(a + b) + ' = ' + t24(e) + '.', t24b(s) + ' + ' + durBm(a + b) + ' = ' + t24b(e) + '.']] };
  } });

  T({ id: 'wp-fencecost', skill: 'word-problems', level: 4, related: ['perimeter', 'times-divide'], make: function (R) {
    var l = R.int(5, 12), w; do { w = R.int(3, 8); } while (w === l);
    var c = R.int(2, 6), P = 2 * (l + w), ans = P * c;
    return { text: 'A garden is ' + l + ' m long and ' + w + ' m wide.\nFencing costs RM' + c + ' for each metre.\nHow much does it cost to fence around the whole garden?', visual: { kind: 'rect', w: l, h: w, unit: 'm' }, answer: ans, fmt: function (x) { return 'RM' + x; }, keepWords: ['each'],
      bm: 'Sebuah kebun panjangnya ' + l + ' m dan lebarnya ' + w + ' m. Kos pagar ialah RM' + c + ' bagi setiap meter. Berapakah kos memagar sekeliling kebun itu?', simple: 'The garden is ' + l + ' m by ' + w + ' m. 1 m of fence costs RM' + c + '. The fence goes all around. How much money?',
      wrong: [[l * w * c, 'PLAN', ['You used the area. A fence goes around the edge.', 'Anda guna luas. Pagar dipasang di sekeliling tepi.']], [P, 'UNDERSTAND', [P + ' m is the length of fence. Now find the cost.', P + ' m ialah panjang pagar. Sekarang cari kosnya.']], [(l + w) * c, 'EXECUTE', ['Go all the way around: 4 sides.', 'Kira semua 4 sisi.']]],
      hints: [['WHAT? We need a cost. What must we measure first?', 'APA? Kita cari kos. Apa yang perlu diukur dahulu?'], ['HOW? Step 1: find the perimeter. Step 2: multiply by RM' + c + '.', 'BAGAIMANA? Langkah 1: cari perimeter. Langkah 2: darab dengan RM' + c + '.'], ['DO: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' m. Now ' + P + ' × RM' + c + '.', 'BUAT: ' + l + ' + ' + w + ' + ' + l + ' + ' + w + ' = ' + P + ' m. Sekarang ' + P + ' × RM' + c + '.']],
      show: [['Perimeter: ' + P + ' m.', 'Perimeter: ' + P + ' m.'], ['Cost: ' + P + ' × RM' + c + ' = RM' + ans + '.', 'Kos: ' + P + ' × RM' + c + ' = RM' + ans + '.']] };
  } });

  T({ id: 'wp-shareleft', skill: 'word-problems', level: 4, related: ['times-divide', 'add-sub'], make: function (R) {
    var n = R.pick(NAMES), g = R.int(3, 6), each = R.int(3, 8), eat = R.int(2, 9), t = g * each + eat;
    return { text: 'Mak bakes ' + t + ' cookies.\nThe family eats ' + eat + ' cookies.\n' + n + ' shares the rest equally among ' + g + ' friends.\nHow many cookies does each friend get?', answer: each, keepWords: ['each'],
      bm: 'Mak membakar ' + t + ' keping biskut. Keluarga makan ' + eat + ' keping. ' + n + ' membahagikan bakinya sama rata kepada ' + g + ' orang kawan. Berapakah biskut yang setiap kawan dapat?', simple: t + ' cookies. ' + eat + ' are eaten. The rest go to ' + g + ' friends, the same number each. How many for one friend?',
      wrong: [[Math.floor(t / g), 'PLAN', ['First take away the cookies eaten. Then share.', 'Tolak biskut yang dimakan dahulu. Kemudian bahagi.']], [t - eat, 'UNDERSTAND', ['That is the cookies left to share. Now share them.', 'Itu biskut yang tinggal. Sekarang bahagikan.']], [each + 1, 'EXECUTE', ['Check: ' + g + ' × your answer should be ' + (t - eat) + '.', 'Semak: ' + g + ' × jawapan anda patut jadi ' + (t - eat) + '.']]],
      hints: [['WHAT? We need the cookies for one friend.', 'APA? Kita cari biskut untuk seorang kawan.'], ['HOW? Step 1: cookies left after eating. Step 2: share them equally.', 'BAGAIMANA? Langkah 1: biskut yang tinggal. Langkah 2: bahagi sama rata.'], ['DO: ' + t + ' − ' + eat + ' = ' + (t - eat) + '. Now ' + (t - eat) + ' ÷ ' + g + '.', 'BUAT: ' + t + ' − ' + eat + ' = ' + (t - eat) + '. Sekarang ' + (t - eat) + ' ÷ ' + g + '.']],
      show: [[t + ' − ' + eat + ' = ' + (t - eat) + '.', t + ' − ' + eat + ' = ' + (t - eat) + '.'], [(t - eat) + ' ÷ ' + g + ' = ' + each + '.', (t - eat) + ' ÷ ' + g + ' = ' + each + '.']],
      check: ['Check: ' + g + ' × ' + each + ' + ' + eat + ' = ' + t + ' ✓', 'Semak: ' + g + ' × ' + each + ' + ' + eat + ' = ' + t + ' ✓'] };
  } });

  T({ id: 'wp-sales', skill: 'word-problems', level: 4, related: ['money', 'data'], make: function (R) {
    var p = R.pick([[150, 'roti canai', 'roti canai'], [120, 'curry puffs', 'karipap'], [250, 'packs of kuih lapis', 'bungkus kuih lapis'], [180, 'banana fritters', 'pisang goreng']]), a = R.int(12, 30), b = R.int(10, 30), ans = (a + b) * p[0];
    return { text: 'The canteen sells ' + p[1] + ' at ' + rm(p[0]) + ' each.\nThe table shows how many were sold.\nHow much money did the canteen get on both days altogether?',
      visual: { kind: 'table', head: ['Day', 'Sold'], headBm: ['Hari', 'Dijual'], rows: [['Monday', a], ['Tuesday', b]] }, answer: ans, fmt: rm, keepWords: ['each'],
      bm: 'Kantin menjual ' + p[2] + ' dengan harga ' + rm(p[0]) + ' setiap satu. Jadual menunjukkan bilangan yang dijual. Berapakah jumlah wang yang kantin terima pada kedua-dua hari?', simple: 'Add the two days. Then find the money.',
      wrong: [[a * p[0], 'PLAN', ['That is Monday only. Add Tuesday too.', 'Itu hari Isnin sahaja. Tambah hari Selasa juga.']], [(a + b) * 100, 'EXECUTE', ['Each one costs ' + rm(p[0]) + ', not RM1.', 'Setiap satu berharga ' + rm(p[0]) + ', bukan RM1.']], [b * p[0], 'PLAN', ['That is Tuesday only. Add Monday too.', 'Itu hari Selasa sahaja. Tambah hari Isnin juga.']]],
      hints: [['WHAT? We need the money from both days.', 'APA? Kita cari wang bagi kedua-dua hari.'], ['HOW? Step 1: total sold. Step 2: multiply by the price.', 'BAGAIMANA? Langkah 1: jumlah dijual. Langkah 2: darab dengan harga.'], ['DO: ' + a + ' + ' + b + ' = ' + (a + b) + '. Now ' + (a + b) + ' × ' + rm(p[0]) + '.', 'BUAT: ' + a + ' + ' + b + ' = ' + (a + b) + '. Sekarang ' + (a + b) + ' × ' + rm(p[0]) + '.']],
      show: [[a + ' + ' + b + ' = ' + (a + b) + ' sold.', a + ' + ' + b + ' = ' + (a + b) + ' dijual.'], [(a + b) + ' × ' + rm(p[0]) + ' = ' + rm(ans) + '.', (a + b) + ' × ' + rm(p[0]) + ' = ' + rm(ans) + '.']] };
  } });

  T({ id: 'wp-ribbon', skill: 'word-problems', level: 4, related: ['measure', 'times-divide'], make: function (R) {
    var piece = R.pick([20, 25, 40, 50]), count = R.int(3, 9), L = piece * count, n = R.pick(NAMES);
    var Lm = L % 100 === 0 ? (L / 100) + ' m' : (L / 100).toFixed(L % 10 === 0 ? 1 : 2) + ' m', chk = ['Check: pieces × ' + piece + ' cm should be ' + L + ' cm.', 'Semak: kepingan × ' + piece + ' cm patut jadi ' + L + ' cm.'];
    return { text: n + ' has a ribbon ' + Lm + ' long.\n' + n + ' cuts it into pieces of ' + piece + ' cm each.\nHow many pieces does ' + n + ' get?', answer: count, keepWords: ['each'],
      bm: n + ' ada reben sepanjang ' + Lm + '. ' + n + ' memotongnya kepada kepingan ' + piece + ' cm setiap satu. Berapakah bilangan kepingan yang ' + n + ' dapat?', simple: 'The ribbon is ' + Lm + '. Each piece is ' + piece + ' cm. How many pieces?',
      wrong: [[count * 10, 'CONCEPT', ['1 m = 100 cm. Change the units first.', '1 m = 100 cm. Tukar unit dahulu.']], [count + 1, 'EXECUTE', chk], [count - 1, 'EXECUTE', chk]],
      hints: [['WHAT? We need the number of pieces.', 'APA? Kita cari bilangan kepingan.'], ['HOW? Step 1: change ' + Lm + ' into cm. Step 2: divide by ' + piece + ' cm.', 'BAGAIMANA? Langkah 1: tukar ' + Lm + ' kepada cm. Langkah 2: bahagi dengan ' + piece + ' cm.'], ['DO: ' + Lm + ' = ' + L + ' cm. Now ' + L + ' ÷ ' + piece + '.', 'BUAT: ' + Lm + ' = ' + L + ' cm. Sekarang ' + L + ' ÷ ' + piece + '.']],
      show: [[Lm + ' = ' + L + ' cm.', Lm + ' = ' + L + ' cm.'], [L + ' ÷ ' + piece + ' = ' + count + ' pieces.', L + ' ÷ ' + piece + ' = ' + count + ' keping.']] };
  } });
})();
