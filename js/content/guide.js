/* Panduan / Guide — short picture lessons that teach from the very beginning.
   Each lesson: a few steps [English, BM] with a picture, then a Latih Tubi (drill) round
   built from the matching question templates. Time is taught first and in the most detail. */
window.FMQ = window.FMQ || {};

FMQ.guide = {
  topics: [
    { id: 'time', icon: '⏰', title: ['Time', 'Masa'], lessons: [
      { id: 'clock-meet', icon: '🕛', skill: 'clock', title: ['Meet the clock', 'Kenali jam'], drill: ['clk-oclock'],
        steps: [
          { t: ['A clock has the numbers 1 to 12 around it. 12 is at the top.', 'Jam ada nombor 1 hingga 12 di sekelilingnya. 12 berada di atas.'], v: { kind: 'clock', h: 12, m: 0, plain: true } },
          { t: ['A clock has two hands. The SHORT hand shows the HOUR.', 'Jam ada dua jarum. Jarum PENDEK menunjukkan JAM.'], v: { kind: 'clock', h: 3, m: 0, label: 'hour' } },
          { t: ['The LONG hand shows the MINUTES.', 'Jarum PANJANG menunjukkan MINIT.'], v: { kind: 'clock', h: 3, m: 0, label: 'minute' } },
          { t: ['Tip: Short = hour. Long = minutes. Always read the short hand first.', 'Tip: Pendek = jam. Panjang = minit. Sentiasa baca jarum pendek dahulu.'], v: { kind: 'clock', h: 3, m: 0, label: 'both' } }
        ] },
      { id: 'clock-oclock', icon: '🕒', skill: 'clock', title: ['O’clock', 'Pukul tepat'], drill: ['clk-oclock'],
        steps: [
          { t: ['When the long hand points straight up to 12, it is “o’clock”: 0 minutes.', 'Apabila jarum panjang menunjuk tepat ke 12, itu “pukul tepat”: 0 minit.'], v: { kind: 'clock', h: 3, m: 0, label: 'minute' } },
          { t: ['Then read the short hand. Here it points to 3. The time is 3 o’clock = 3:00.', 'Kemudian baca jarum pendek. Di sini ia menunjuk ke 3. Waktunya pukul 3 tepat = 3:00.'], v: { kind: 'clock', h: 3, m: 0, label: 'hour' } },
          { t: ['Long hand on 12, short hand on 7 → 7 o’clock = 7:00.', 'Jarum panjang di 12, jarum pendek di 7 → pukul 7 tepat = 7:00.'], v: { kind: 'clock', h: 7, m: 0 } },
          { t: ['Careful: don’t mix up the hands. On this clock, 12:15 would be wrong. It is 3:00.', 'Hati-hati: jangan tertukar jarum. Jam ini bukan 12:15. Ia 3:00.'], v: { kind: 'clock', h: 3, m: 0 } }
        ] },
      { id: 'clock-half', icon: '🕧', skill: 'clock', title: ['Half past', 'Setengah jam'], drill: ['clk-half', 'clk-oclock'],
        steps: [
          { t: ['When the long hand points down to 6, it has gone half way round: 30 minutes.', 'Apabila jarum panjang menunjuk ke 6, ia sudah separuh pusingan: 30 minit.'], v: { kind: 'clock', h: 4, m: 30, label: 'minute' } },
          { t: ['At half past, the short hand is half way between two numbers. Use the number it has PASSED.', 'Pada setengah jam, jarum pendek berada di tengah dua nombor. Guna nombor yang sudah DILEPASI.'], v: { kind: 'clock', h: 4, m: 30, label: 'hour' } },
          { t: ['Here the short hand has passed 4 (not reached 5). So it is half past 4 = 4:30.', 'Di sini jarum pendek sudah melepasi 4 (belum sampai 5). Jadi pukul 4 setengah = 4:30.'], v: { kind: 'clock', h: 4, m: 30 } },
          { t: ['Long hand on 6 means 30, not 6. Half past 9 = 9:30.', 'Jarum panjang di 6 bermaksud 30, bukan 6. Pukul 9 setengah = 9:30.'], v: { kind: 'clock', h: 9, m: 30 } }
        ] },
      { id: 'clock-five', icon: '🖐️', skill: 'clock', title: ['Count minutes in 5s', 'Kira minit 5-5'], drill: ['clk-five', 'clk-half'],
        steps: [
          { t: ['For the long hand, each number is worth 5 minutes. Count in 5s from 12.', 'Bagi jarum panjang, setiap nombor bernilai 5 minit. Kira 5-5 dari 12.'], v: { kind: 'clock', h: 12, m: 0, five: true, plain: true } },
          { t: ['1 → 5, 2 → 10, 3 → 15, 4 → 20, 5 → 25, 6 → 30, 7 → 35, 8 → 40, 9 → 45, 10 → 50, 11 → 55.', '1 → 5, 2 → 10, 3 → 15, 4 → 20, 5 → 25, 6 → 30, 7 → 35, 8 → 40, 9 → 45, 10 → 50, 11 → 55.'], v: { kind: 'clock', h: 12, m: 0, five: true, plain: true } },
          { t: ['Long hand on 7 → 7 × 5 = 35 minutes. Short hand just after 2 → hour 2. Time: 2:35.', 'Jarum panjang di 7 → 7 × 5 = 35 minit. Jarum pendek baru melepasi 2 → jam 2. Waktu: 2:35.'], v: { kind: 'clock', h: 2, m: 35, five: true } },
          { t: ['Long hand on 4 → 20 minutes. Short hand just after 10 → 10:20.', 'Jarum panjang di 4 → 20 minit. Jarum pendek baru melepasi 10 → 10:20.'], v: { kind: 'clock', h: 10, m: 20, five: true } }
        ] },
      { id: 'clock-quarter', icon: '🕒', skill: 'clock', title: ['Quarter past & quarter to', 'Suku jam'], drill: ['clk-quarter', 'clk-words'],
        steps: [
          { t: ['A quarter of an hour is 15 minutes. Long hand on 3 = 15 minutes = “quarter past”.', 'Suku jam ialah 15 minit. Jarum panjang di 3 = 15 minit = “pukul … suku”.'], v: { kind: 'clock', h: 6, m: 15, five: true } },
          { t: ['This clock shows quarter past 6 = 6:15.', 'Jam ini menunjukkan pukul 6 suku = 6:15.'], v: { kind: 'clock', h: 6, m: 15 } },
          { t: ['Long hand on 9 = 45 minutes. Only 15 minutes are left before the next hour: “quarter to”.', 'Jarum panjang di 9 = 45 minit. Tinggal 15 minit sebelum jam seterusnya: “lagi suku”.'], v: { kind: 'clock', h: 6, m: 45, five: true } },
          { t: ['This clock shows 6:45 = quarter to 7. The short hand is almost at 7, but the hour is still 6.', 'Jam ini menunjukkan 6:45 = lagi suku pukul 7. Jarum pendek hampir ke 7, tetapi jamnya masih 6.'], v: { kind: 'clock', h: 6, m: 45 } }
        ] },
      { id: 'ampm', icon: '🌞', skill: 'clock', title: ['a.m. and p.m.', 'a.m. dan p.m.'], drill: ['clk-ampm'],
        steps: [
          { t: ['A day has 24 hours. The clock goes round twice.', 'Sehari ada 24 jam. Jarum jam berpusing dua kali.'], v: { kind: 'daybar' } },
          { t: ['a.m. = from 12 midnight to 12 noon (night and morning).', 'a.m. = dari 12 tengah malam hingga 12 tengah hari (malam dan pagi).'], v: { kind: 'daybar', mark: 'am' } },
          { t: ['p.m. = from 12 noon to 12 midnight (afternoon, evening, night).', 'p.m. = dari 12 tengah hari hingga 12 tengah malam (petang dan malam).'], v: { kind: 'daybar', mark: 'pm' } },
          { t: ['Breakfast at 7:00 is 7:00 a.m. Dinner at 8:00 is 8:00 p.m.', 'Sarapan pukul 7:00 ialah 7:00 a.m. Makan malam pukul 8:00 ialah 8:00 p.m.'], v: { kind: 'daybar', dots: [[7, '🍳'], [20, '🍛']] } }
        ] },
      { id: 'time24-learn', icon: '🕐', skill: 'time24', title: ['24-hour time', 'Sistem 24 jam'], drill: ['t24-to24', 't24-to12'],
        steps: [
          { t: ['24-hour time uses 4 digits: 2 for the hour, 2 for the minutes. 0730 hours = 7:30 a.m.', 'Sistem 24 jam guna 4 digit: 2 untuk jam, 2 untuk minit. Jam 0730 = 7:30 a.m.'], v: { kind: 'clock24', time: '0730' } },
          { t: ['a.m. times keep the same hour: 9:15 a.m. = 0915 hours.', 'Waktu a.m. jamnya sama: 9:15 a.m. = jam 0915.'], v: { kind: 'clock24', time: '0915' } },
          { t: ['p.m. times: ADD 12 to the hour. 3:00 p.m. → 3 + 12 = 15 → 1500 hours.', 'Waktu p.m.: TAMBAH 12 pada jam. 3:00 p.m. → 3 + 12 = 15 → jam 1500.'], v: { kind: 'clock24', time: '1500' } },
          { t: ['Going back: 1845 hours → 18 − 12 = 6 → 6:45 p.m.', 'Sebaliknya: jam 1845 → 18 − 12 = 6 → 6:45 p.m.'], v: { kind: 'clock24', time: '1845' } }
        ] },
      { id: 'duration-learn', icon: '⏳', skill: 'duration', title: ['How long? (duration)', 'Berapa lama? (tempoh masa)'], drill: ['clk-later', 'du-between'],
        steps: [
          { t: ['Duration means how long something takes, from the start to the end.', 'Tempoh masa bermaksud berapa lama sesuatu berlaku, dari mula hingga tamat.'], v: { kind: 'timeline', from: '2:15', to: '4:00', jumps: [] } },
          { t: ['Count on in jumps. First jump to a nice time: 2:15 → 3:15 is 1 hour.', 'Kira ke depan dalam lompatan. Lompat dahulu: 2:15 → 3:15 ialah 1 jam.'], v: { kind: 'timeline', from: '2:15', to: '4:00', jumps: [['3:15', ['1 hour', '1 jam']]] } },
          { t: ['Then 3:15 → 4:00 is 45 minutes.', 'Kemudian 3:15 → 4:00 ialah 45 minit.'], v: { kind: 'timeline', from: '2:15', to: '4:00', jumps: [['3:15', ['1 hour', '1 jam']], ['4:00', ['45 minutes', '45 minit']]] } },
          { t: ['Add the jumps: 1 hour + 45 minutes = 1 hour 45 minutes. Remember: 1 hour = 60 minutes, not 100.', 'Tambah lompatan: 1 jam + 45 minit = 1 jam 45 minit. Ingat: 1 jam = 60 minit, bukan 100.'], v: { kind: 'timeline', from: '2:15', to: '4:00', jumps: [['3:15', ['1 hour', '1 jam']], ['4:00', ['45 minutes', '45 minit']]] } }
        ] },
      { id: 'time-units', icon: '📅', skill: 'duration', title: ['Units of time', 'Unit masa'], drill: ['du-units', 'du-conv'],
        steps: [
          { t: ['Learn these by heart:', 'Hafal ini:'], v: { kind: 'table', head: ['Time', 'Equal to'], headBm: ['Masa', 'Sama dengan'], rows: [['1 minute', '60 seconds'], ['1 hour', '60 minutes'], ['1 day', '24 hours'], ['1 week', '7 days'], ['1 year', '12 months']], rowsBm: [['1 minit', '60 saat'], ['1 jam', '60 minit'], ['1 hari', '24 jam'], ['1 minggu', '7 hari'], ['1 tahun', '12 bulan']] } },
          { t: ['Hours to minutes: multiply by 60. 2 hours = 2 × 60 = 120 minutes.', 'Jam kepada minit: darab 60. 2 jam = 2 × 60 = 120 minit.'] },
          { t: ['2 hours 15 minutes = 120 + 15 = 135 minutes.', '2 jam 15 minit = 120 + 15 = 135 minit.'] }
        ] }
    ] },
    { id: 'numbers', icon: '🔢', title: ['Numbers', 'Nombor'], lessons: [
      { id: 'pv-learn', icon: '🔢', skill: 'place-value', title: ['Place value', 'Nilai tempat'], drill: ['pv-value', 'pv-order'],
        steps: [
          { t: ['Each place is 10 times bigger than the one on its right: ones, tens, hundreds, thousands.', 'Setiap tempat 10 kali lebih besar daripada tempat di kanannya: sa, puluh, ratus, ribu.'], v: { kind: 'pvtable', n: 4572 } },
          { t: ['In 4 572, the 5 is in the hundreds place. Its value is 500.', 'Dalam 4 572, digit 5 di tempat ratus. Nilainya 500.'], v: { kind: 'pvtable', n: 4572, mark: 2 } },
          { t: ['A zero holds a place: 2 409 has 0 tens.', 'Sifar menjaga tempat: 2 409 ada 0 puluh.'], v: { kind: 'pvtable', n: 2409, mark: 1 } }
        ] },
      { id: 'add-learn', icon: '➕', skill: 'basic-facts', title: ['Adding (and carrying)', 'Tambah (dan mengumpul semula)'], drill: ['bf-add', 'as-add'],
        steps: [
          { t: ['Write the numbers in columns: ones under ones, tens under tens.', 'Tulis nombor dalam lajur: sa di bawah sa, puluh di bawah puluh.'], v: { kind: 'column', a: 254, b: 138, op: '+' } },
          { t: ['Add the ones first: 4 + 8 = 12. Write 2, carry 1 ten.', 'Tambah sa dahulu: 4 + 8 = 12. Tulis 2, bawa 1 puluh.'], v: { kind: 'column', a: 254, b: 138, op: '+', upto: 1 } },
          { t: ['Tens: 5 + 3 + 1 = 9. Hundreds: 2 + 1 = 3. Answer 392.', 'Puluh: 5 + 3 + 1 = 9. Ratus: 2 + 1 = 3. Jawapan 392.'], v: { kind: 'column', a: 254, b: 138, op: '+', upto: 3 } }
        ] },
      { id: 'sub-learn', icon: '➖', skill: 'basic-facts', title: ['Subtracting (and regrouping)', 'Tolak (dan mengumpul semula)'], drill: ['bf-sub', 'as-sub'],
        steps: [
          { t: ['Bigger number on top, line up the columns.', 'Nombor besar di atas, susun lajur.'], v: { kind: 'column', a: 352, b: 127, op: '−' } },
          { t: ['Ones: 2 − 7 cannot be done. Regroup 1 ten into 10 ones: 12 − 7 = 5.', 'Sa: 2 − 7 tidak boleh. Kumpul semula 1 puluh jadi 10 sa: 12 − 7 = 5.'], v: { kind: 'column', a: 352, b: 127, op: '−', upto: 1 } },
          { t: ['Tens: 4 − 2 = 2 (one ten was moved). Hundreds: 3 − 1 = 2. Answer 225.', 'Puluh: 4 − 2 = 2 (satu puluh sudah dipindah). Ratus: 3 − 1 = 2. Jawapan 225.'], v: { kind: 'column', a: 352, b: 127, op: '−', upto: 3 } }
        ] },
      { id: 'tables-learn', icon: '🔟', skill: 'times-tables', title: ['Times tables (sifir)', 'Sifir'], drill: ['tt-fact', 'tt-missing'],
        steps: [
          { t: ['× means groups of. 3 × 4 = 3 groups of 4.', '× bermaksud kumpulan. 3 × 4 = 3 kumpulan 4.'], v: { kind: 'dots', total: 12, groups: 3 } },
          { t: ['Skip-count: 4, 8, 12. So 3 × 4 = 12.', 'Kira lompat: 4, 8, 12. Jadi 3 × 4 = 12.'], v: { kind: 'dots', total: 12, groups: 3, highlight: 3 } },
          { t: ['Turn it around: 4 × 3 = 12 too. Learn one table a week.', 'Terbalikkan: 4 × 3 juga 12. Hafal satu sifir setiap minggu.'] }
        ] },
      { id: 'div-learn', icon: '➗', skill: 'times-tables', title: ['Dividing = sharing', 'Bahagi = kongsi sama rata'], drill: ['tt-div', 'td-share'],
        steps: [
          { t: ['÷ means share into equal groups. 12 ÷ 3: share 12 into 3 groups.', '÷ bermaksud bahagi sama rata. 12 ÷ 3: bahagi 12 kepada 3 kumpulan.'], v: { kind: 'dots', total: 12, groups: 3 } },
          { t: ['Each group has 4. So 12 ÷ 3 = 4.', 'Setiap kumpulan ada 4. Jadi 12 ÷ 3 = 4.'], v: { kind: 'dots', total: 12, groups: 3, highlight: 1 } },
          { t: ['Check with times: 3 × 4 = 12 ✓', 'Semak dengan darab: 3 × 4 = 12 ✓'] }
        ] }
    ] },
    { id: 'money', icon: '💵', title: ['Money', 'Wang'], lessons: [
      { id: 'money-learn', icon: '💵', skill: 'money', title: ['Ringgit and sen', 'Ringgit dan sen'], drill: ['mon-sen', 'mon-total'],
        steps: [
          { t: ['RM1 = 100 sen. RM3.45 means 3 ringgit and 45 sen.', 'RM1 = 100 sen. RM3.45 bermaksud 3 ringgit dan 45 sen.'] },
          { t: ['To add or subtract money, line up the decimal points.', 'Untuk tambah atau tolak wang, susun titik perpuluhan sebaris.'], v: { kind: 'column', a: '30.00', b: '12.50', op: '−', money: true } },
          { t: ['Spending or paying makes your money LESS: subtract. “Total” means add.', 'Berbelanja atau membayar mengurangkan wang: tolak. “Jumlah” bermaksud tambah.'] }
        ] }
    ] },
    { id: 'fractions', icon: '🍕', title: ['Fractions', 'Pecahan'], lessons: [
      { id: 'fraction-learn', icon: '🍕', skill: 'fractions', title: ['Parts of a whole', 'Bahagian daripada satu'], drill: ['fr-shaded', 'fr-of'],
        steps: [
          { t: ['A fraction has two numbers. The bottom number tells how many EQUAL parts.', 'Pecahan ada dua nombor. Nombor bawah ialah bilangan bahagian yang SAMA BESAR.'], v: { kind: 'bar', parts: 4, shaded: 0 } },
          { t: ['The top number tells how many parts we take. 3 of 4 parts shaded = 3/4.', 'Nombor atas ialah bilangan bahagian yang diambil. 3 daripada 4 bahagian berlorek = 3/4.'], v: { kind: 'bar', parts: 4, shaded: 3 } },
          { t: ['3/4 of 20: share 20 into 4 groups (5 each), then take 3 groups: 15.', '3/4 daripada 20: bahagi 20 kepada 4 kumpulan (5 setiap satu), kemudian ambil 3 kumpulan: 15.'], v: { kind: 'dots', total: 20, groups: 4, highlight: 3 } }
        ] }
    ] },
    { id: 'measure', icon: '📏', title: ['Measurement', 'Ukuran'], lessons: [
      { id: 'units-learn', icon: '📏', skill: 'measure', title: ['Units to remember', 'Unit yang perlu diingat'], drill: ['me-conv'],
        steps: [
          { t: ['Length, mass and volume each have small and big units.', 'Panjang, jisim dan isi padu ada unit kecil dan unit besar.'], v: { kind: 'table', head: ['Big', 'Small'], headBm: ['Besar', 'Kecil'], rows: [['1 m', '100 cm'], ['1 cm', '10 mm'], ['1 km', '1 000 m'], ['1 kg', '1 000 g'], ['1 l', '1 000 ml']] } },
          { t: ['Big unit → small unit: multiply. 3 kg = 3 × 1 000 = 3 000 g.', 'Unit besar → unit kecil: darab. 3 kg = 3 × 1 000 = 3 000 g.'] },
          { t: ['Before adding or subtracting, make the units the same.', 'Sebelum tambah atau tolak, jadikan unitnya sama.'] }
        ] }
    ] }
  ]
};

FMQ.lesson = function (id) {
  var found = null;
  FMQ.guide.topics.forEach(function (t) { t.lessons.forEach(function (l) { if (l.id === id) found = l; }); });
  return found;
};
