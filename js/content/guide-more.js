/* More Panduan modules: decimals, percentages, perimeter & area, ratio, data,
   shapes & coordinates and word problems. Same lesson format as guide.js. */
(function () {
  FMQ.guide.topics.push(
    { id: 'decimals', icon: '🔸', title: ['Decimals', 'Perpuluhan'], lessons: [
      { id: 'dec-learn', icon: '🔸', skill: 'decimals', title: ['Tenths and hundredths', 'Persepuluh dan perseratus'], drill: ['dec-frac', 'dec-sub1', 'dec-add'],
        steps: [
          { t: ['Split 1 whole into 10 equal parts. Each part is one tenth: 0.1.', 'Bahagikan 1 keseluruhan kepada 10 bahagian sama. Setiap bahagian ialah satu persepuluh: 0.1.'], v: { kind: 'bar', parts: 10, shaded: 1 } },
          { t: ['3 parts out of 10 shaded = 3/10 = 0.3.', '3 daripada 10 bahagian berlorek = 3/10 = 0.3.'], v: { kind: 'bar', parts: 10, shaded: 3 } },
          { t: ['The dot separates whole numbers from parts. 2.5 means 2 wholes and 5 tenths.', 'Titik memisahkan nombor bulat dengan bahagian. 2.5 bermaksud 2 bulat dan 5 persepuluh.'], v: { kind: 'table', head: ['Ones', 'Tenths', 'Hundredths'], headBm: ['Sa', 'Persepuluh', 'Perseratus'], rows: [['2', '5', '0'], ['0', '7', '5']] } },
          { t: ['0.75 = 7 tenths and 5 hundredths = 75/100. Like RM0.75 = 75 sen!', '0.75 = 7 persepuluh dan 5 perseratus = 75/100. Sama seperti RM0.75 = 75 sen!'] }
        ] },
      { id: 'dec-sub-learn', icon: '➖', skill: 'decimals', title: ['Adding and subtracting decimals', 'Tambah dan tolak perpuluhan'], drill: ['dec-sub1', 'dec-sub2', 'dec-add', 'dec-ctx'],
        steps: [
          { t: ['Line up the dots, one under the other. Then ones are under ones, tenths under tenths.', 'Susun titik perpuluhan sebaris, satu di bawah yang lain. Sa di bawah sa, persepuluh di bawah persepuluh.'], v: { kind: 'column', a: '5.40', b: '2.15', op: '−' } },
          { t: ['A whole number like 6 can be written as 6.00. Fill empty places with 0.', 'Nombor bulat seperti 6 boleh ditulis 6.00. Isi tempat kosong dengan 0.'], v: { kind: 'column', a: '6.00', b: '1.25', op: '−' } },
          { t: ['Start from the right. Regroup (borrow) like normal subtraction.', 'Mula dari kanan. Kumpul semula (pinjam) seperti tolak biasa.'], v: { kind: 'column', a: '6.00', b: '1.25', op: '−', upto: 2 } },
          { t: ['6.00 − 1.25 = 4.75. Keep the dot in the answer, in the same line.', '6.00 − 1.25 = 4.75. Letak titik dalam jawapan, sebaris.'], v: { kind: 'column', a: '6.00', b: '1.25', op: '−', upto: 4 } },
          { t: ['CHECK: 4.75 + 1.25 = 6.00 ✓', 'SEMAK: 4.75 + 1.25 = 6.00 ✓'] }
        ] }
    ] },
    { id: 'percent', icon: '💯', title: ['Percentages', 'Peratus'], lessons: [
      { id: 'pc-learn', icon: '💯', skill: 'percent', title: ['Percent means “out of 100”', 'Peratus bermaksud “daripada 100”'], drill: ['pc-100', 'pc-frac', 'pc-10'],
        steps: [
          { t: ['% means “out of 100”. 25% = 25 out of 100.', '% bermaksud “daripada 100”. 25% = 25 daripada 100.'], v: { kind: 'grid', cols: 10, rows: 10 } },
          { t: ['Half = 50%. A quarter = 25%. The whole thing = 100%.', 'Separuh = 50%. Suku = 25%. Keseluruhan = 100%.'], v: { kind: 'bar', parts: 4, shaded: 1 } },
          { t: ['10% is one tenth. To find 10% of 60, divide by 10: 6.', '10% ialah satu persepuluh. Untuk cari 10% daripada 60, bahagi dengan 10: 6.'], v: { kind: 'bar', parts: 10, shaded: 1 } },
          { t: ['50% of 40 = half of 40 = 20. 25% of 40 = 40 ÷ 4 = 10.', '50% daripada 40 = separuh 40 = 20. 25% daripada 40 = 40 ÷ 4 = 10.'] }
        ] },
      { id: 'pc-use-learn', icon: '🛍️', skill: 'percent', title: ['Percent in real life', 'Peratus dalam kehidupan'], drill: ['pc-ctx', 'pc-left', 'pc-10'],
        steps: [
          { t: ['If 30% of a class are boys, the rest are girls: 100% − 30% = 70%.', 'Jika 30% murid ialah lelaki, bakinya perempuan: 100% − 30% = 70%.'] },
          { t: ['Find 20% of 50: 10% is 5, so 20% is 5 + 5 = 10.', 'Cari 20% daripada 50: 10% ialah 5, jadi 20% ialah 5 + 5 = 10.'], v: { kind: 'bar', parts: 10, shaded: 2 } },
          { t: ['Always ask: percent OF WHAT? Then find 10% or 50% first, and build from there.', 'Sentiasa tanya: peratus DARIPADA APA? Kemudian cari 10% atau 50% dahulu, dan bina dari situ.'] }
        ] }
    ] },
    { id: 'shape-space', icon: '🔲', title: ['Perimeter & Area', 'Perimeter & Luas'], lessons: [
      { id: 'perimeter-learn', icon: '🔲', skill: 'perimeter', title: ['Perimeter: around the edge', 'Perimeter: sekeliling tepi'], drill: ['pe-rect', 'pe-square', 'pe-side'],
        steps: [
          { t: ['Perimeter is the distance all the way AROUND a shape. Imagine walking along the edge.', 'Perimeter ialah jarak SEKELILING sesuatu bentuk. Bayangkan berjalan di sepanjang tepinya.'], v: { kind: 'rect', w: 6, h: 4, unit: 'cm' } },
          { t: ['Add every side: 6 + 4 + 6 + 4 = 20 cm.', 'Tambah semua sisi: 6 + 4 + 6 + 4 = 20 cm.'], v: { kind: 'rect', w: 6, h: 4, unit: 'cm' } },
          { t: ['A square has 4 equal sides. Side 5 cm → perimeter 5 × 4 = 20 cm.', 'Segi empat sama ada 4 sisi sama panjang. Sisi 5 cm → perimeter 5 × 4 = 20 cm.'], v: { kind: 'rect', w: 5, h: 5, unit: 'cm' } },
          { t: ['Perimeter is a length, so the unit is cm or m (not cm²).', 'Perimeter ialah panjang, jadi unitnya cm atau m (bukan cm²).'] }
        ] },
      { id: 'area-learn', icon: '🟩', skill: 'area', title: ['Area: the space inside', 'Luas: ruang di dalam'], drill: ['ar-grid', 'ar-rect', 'ar-which'],
        steps: [
          { t: ['Area is the space INSIDE a shape. We count the squares that cover it.', 'Luas ialah ruang DI DALAM sesuatu bentuk. Kita kira petak yang menutupinya.'], v: { kind: 'grid', cols: 4, rows: 3 } },
          { t: ['3 rows of 4 squares = 12 squares. Area = 12 square units.', '3 baris dengan 4 petak = 12 petak. Luas = 12 unit persegi.'], v: { kind: 'grid', cols: 4, rows: 3 } },
          { t: ['Quick way for a rectangle: length × width. 6 cm × 4 cm = 24 cm².', 'Cara cepat untuk segi empat tepat: panjang × lebar. 6 cm × 4 cm = 24 cm².'], v: { kind: 'rect', w: 6, h: 4, unit: 'cm', grid: true } },
          { t: ['Don’t mix them up: perimeter = around (add sides). Area = inside (multiply).', 'Jangan tertukar: perimeter = sekeliling (tambah sisi). Luas = di dalam (darab).'] }
        ] }
    ] },
    { id: 'ratio', icon: '⚖️', title: ['Ratio', 'Nisbah'], lessons: [
      { id: 'ratio-learn', icon: '⚖️', skill: 'ratio', title: ['For every …', 'Bagi setiap …'], drill: ['ra-beads', 'ra-order', 'ra-scale'],
        steps: [
          { t: ['A ratio compares two amounts. 2 red beads for every 3 blue beads → red : blue = 2 : 3.', 'Nisbah membandingkan dua kuantiti. 2 manik merah bagi setiap 3 manik biru → merah : biru = 2 : 3.'], v: { kind: 'beads', groups: [{ n: 2, tone: 'a', label: 'red', labelBm: 'merah' }, { n: 3, tone: 'b', label: 'blue', labelBm: 'biru' }] } },
          { t: ['Order matters! blue : red = 3 : 2, not 2 : 3.', 'Susunan penting! biru : merah = 3 : 2, bukan 2 : 3.'], v: { kind: 'beads', groups: [{ n: 3, tone: 'b', label: 'blue', labelBm: 'biru' }, { n: 2, tone: 'a', label: 'red', labelBm: 'merah' }] } },
          { t: ['“For every 1 cup of rice, 2 cups of water.” For 4 cups of rice: 4 × 2 = 8 cups of water.', '“Bagi setiap 1 cawan beras, 2 cawan air.” Untuk 4 cawan beras: 4 × 2 = 8 cawan air.'], v: { kind: 'ratioRows', a: 'cup of rice', aBm: 'cawan beras', b: 'cups of water', bBm: 'cawan air', ra: 1, rb: 2, rows: 1 } },
          { t: ['Scale both sides by the same number. 1 : 2 → 4 : 8.', 'Darab kedua-dua belah dengan nombor yang sama. 1 : 2 → 4 : 8.'] }
        ] }
    ] },
    { id: 'data', icon: '📊', title: ['Data', 'Data'], lessons: [
      { id: 'picto-learn', icon: '🖼️', skill: 'data', title: ['Pictographs and tables', 'Piktograf dan jadual'], drill: ['da-picto', 'da-picto-diff', 'da-table-total'],
        steps: [
          { t: ['A pictograph uses pictures. Always read the KEY first: what is one picture worth?', 'Piktograf menggunakan gambar. Sentiasa baca KUNCI dahulu: berapa nilai satu gambar?'], v: { kind: 'picto', title: 'Books read', titleBm: 'Buku dibaca', icon: '📘', key: 2, unit: 'books', unitBm: 'buku', rows: [['Ali', 3], ['Mei', 5]] } },
          { t: ['If 📘 = 2 books, then Ali read 3 × 2 = 6 books and Mei read 5 × 2 = 10 books.', 'Jika 📘 = 2 buku, Ali membaca 3 × 2 = 6 buku dan Mei membaca 5 × 2 = 10 buku.'] },
          { t: ['“How many more?” means find the difference: 10 − 6 = 4 more books.', '“Berapa lebih banyak?” bermaksud cari beza: 10 − 6 = 4 buku lagi.'] },
          { t: ['In a table, find the row and the column you need, then read where they meet.', 'Dalam jadual, cari baris dan lajur yang diperlukan, kemudian baca di tempat ia bertemu.'], v: { kind: 'table', head: ['Day', 'Cakes sold'], headBm: ['Hari', 'Kek dijual'], rows: [['Monday', '12'], ['Tuesday', '18']] } }
        ] },
      { id: 'barchart-learn', icon: '📊', skill: 'data', title: ['Bar charts', 'Carta palang'], drill: ['da-bar', 'da-table-most', 'da-picto'],
        steps: [
          { t: ['In a bar chart, the taller the bar, the bigger the number.', 'Dalam carta palang, lebih tinggi palang, lebih besar nombornya.'], v: { kind: 'barchart', title: 'Favourite fruit', titleBm: 'Buah kegemaran', step: 2, bars: [['apple', 6], ['banana', 10], ['mango', 4]] } },
          { t: ['Read across from the top of the bar to the numbers on the side. Banana = 10.', 'Baca dari hujung atas palang ke nombor di tepi. Pisang = 10.'] },
          { t: ['Most popular = tallest bar. Least popular = shortest bar.', 'Paling digemari = palang paling tinggi. Paling kurang = palang paling rendah.'] }
        ] }
    ] },
    { id: 'shapes', icon: '📐', title: ['Shapes & Coordinates', 'Bentuk & Koordinat'], lessons: [
      { id: 'shapes-learn', icon: '📐', skill: 'shapes', title: ['Angles, lines and solids', 'Sudut, garis dan bentuk 3D'], drill: ['sh-angle', 'sh-lines', 'sh-solid', 'sh-sides'],
        steps: [
          { t: ['A right angle is a square corner, like the corner of a book: 90°.', 'Sudut tegak ialah bucu segi empat, seperti bucu buku: 90°.'], v: { kind: 'angle', deg: 90 } },
          { t: ['Parallel lines never meet, like train tracks.', 'Garis selari tidak pernah bertemu, seperti landasan kereta api.'], v: { kind: 'lines', type: 'parallel', rot: 0 } },
          { t: ['Perpendicular lines meet at a right angle.', 'Garis serenjang bertemu pada sudut tegak.'], v: { kind: 'lines', type: 'perpendicular', rot: 0 } },
          { t: ['A cube has 6 faces, 12 edges and 8 vertices (corners).', 'Kubus ada 6 muka, 12 tepi dan 8 bucu.'], v: { kind: 'solid', shape: 'cube' } }
        ] },
      { id: 'coord-learn', icon: '📍', skill: 'coordinates', title: ['Coordinates', 'Koordinat'], drill: ['co-read', 'co-find', 'co-move'],
        steps: [
          { t: ['A point has two numbers: (across, up). Always go ACROSS first, then UP.', 'Satu titik ada dua nombor: (melintang, ke atas). Sentiasa pergi MELINTANG dahulu, kemudian KE ATAS.'], v: { kind: 'coord', points: [['A', 4, 2]] } },
          { t: ['Point A: go across 4, then up 2 → A is at (4, 2).', 'Titik A: melintang 4, kemudian naik 2 → A di (4, 2).'], v: { kind: 'coord', points: [['A', 4, 2]] } },
          { t: ['(2, 4) is a different place! B is at (2, 4).', '(2, 4) ialah tempat yang lain! B di (2, 4).'], v: { kind: 'coord', points: [['A', 4, 2], ['B', 2, 4]] } },
          { t: ['Tip: “Along the corridor, then up the stairs.”', 'Tip: “Jalan sepanjang koridor, kemudian naik tangga.”'] }
        ] }
    ] },
    { id: 'problems', icon: '🧩', title: ['Word problems', 'Soalan berayat'], lessons: [
      { id: 'wp-learn', icon: '🧩', skill: 'word-problems', title: ['WHAT? HOW? DO. CHECK.', 'APA? BAGAIMANA? BUAT. SEMAK.'], drill: ['wp-change', 'wp-save', 'wp-time', 'wp-shareleft'],
        steps: [
          { t: ['WHAT? Read slowly. What does the question ask you to find? Underline it.', 'APA? Baca perlahan-lahan. Apa yang soalan minta awak cari? Garis di bawahnya.'] },
          { t: ['HOW? Which operation? total/altogether → +, left/change → −, each/groups → × or ÷.', 'BAGAIMANA? Operasi apa? jumlah/semua sekali → +, baki → −, setiap/kumpulan → × atau ÷.'], v: { kind: 'table', head: ['Words', 'Do'], headBm: ['Perkataan', 'Buat'], rows: [['total, altogether', '+'], ['left, change, difference', '−'], ['each, groups of', '×'], ['shared equally', '÷']] } },
          { t: ['DO: work out one step at a time. Write each step down.', 'BUAT: kira satu langkah demi satu langkah. Tulis setiap langkah.'] },
          { t: ['CHECK: is the answer sensible? Use the opposite operation to check.', 'SEMAK: adakah jawapan munasabah? Guna operasi bertentangan untuk semak.'] },
          { t: ['Example: Aina has RM20. She buys a book for RM12.50. How much is left? 20.00 − 12.50 = RM7.50. Check: 7.50 + 12.50 = 20 ✓', 'Contoh: Aina ada RM20. Dia beli buku RM12.50. Berapa baki? 20.00 − 12.50 = RM7.50. Semak: 7.50 + 12.50 = 20 ✓'], v: { kind: 'column', a: '20.00', b: '12.50', op: '−', upto: 4, money: true } }
        ] }
    ] }
  );
})();
