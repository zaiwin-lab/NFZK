/* Check My Level — Test E: Applied Maths (time first, then money and measurement).
   Same schema as diag-tests.js. Time items climb: reading the clock → a.m./p.m. →
   24-hour → units → duration → end time → does it make sense? */
(function () {
  var D = FMQ.diag;
  Object.assign(D.SKILLS, {
    'clock-read': ['Reading the Clock', 'Membaca Jam', '⏰'],
    'am-pm': ['a.m. and p.m.', 'a.m. dan p.m.', '🌗'],
    'time-24': ['24-Hour Time', 'Sistem 24 Jam', '🕐'],
    'time-units': ['Time Units', 'Unit Masa', '⏱️'],
    'duration': ['How Long (Duration)', 'Tempoh Masa', '⏳'],
    'money': ['Money', 'Wang', '💵'],
    'measure': ['Measurement', 'Ukuran', '📏']
  });
  var t = D.test('E');
  t.ready = true; t.minutes = 10;
  t.blurb = ['Clock, a.m./p.m., 24-hour time, how long, money, measuring', 'Jam, a.m./p.m., sistem 24 jam, tempoh masa, wang, ukuran'];

  function o(en, bm, ok, err, why) { var r = { t: [en, bm == null ? en : bm] }; if (ok) r.ok = true; else { r.err = err; r.why = why; } return r; }

  D.QUESTIONS.push(
    { id: 'E1', test: 'E', topic: 'Reading the clock', anchor: 'clock-read', prereq: 'o’clock and half past (Y1–2)', difficulty: 1, type: 'core', format: 'mcq', stage: 'DO', dims: ['KNOWLEDGE'],
      q: ['What time does the clock show?', 'Pukul berapakah yang ditunjukkan oleh jam ini?'], visual: { kind: 'clock', h: 4, m: 30 },
      opts: [o('4:30', null, true), o('6:20', null, false, 'KNOWLEDGE', 'swapped the hands'), o('5:30', null, false, 'KNOWLEDGE', 'used the hour the short hand is going to, not the one it passed'), o('4:06', null, false, 'KNOWLEDGE', 'read the long hand’s number as minutes')],
      hints: [['Short hand = hour. Long hand on 6 = 30 minutes.', 'Jarum pendek = jam. Jarum panjang di 6 = 30 minit.']],
      show: [['The long hand points to 6: that is 30 minutes (half past).', 'Jarum panjang menunjuk ke 6: 30 minit (setengah).'], ['The short hand has passed 4 → 4:30.', 'Jarum pendek sudah melepasi 4 → 4:30.']] },
    { id: 'E2', test: 'E', topic: 'Reading the clock', anchor: 'clock-read', prereq: 'counting in 5s (Y2)', difficulty: 2, type: 'core', format: 'mcq', stage: 'DO', dims: ['KNOWLEDGE'],
      q: ['What time does the clock show?', 'Pukul berapakah yang ditunjukkan oleh jam ini?'], visual: { kind: 'clock', h: 2, m: 35 },
      opts: [o('7:10', null, false, 'KNOWLEDGE', 'swapped the hands'), o('2:35', null, true), o('3:35', null, false, 'KNOWLEDGE', 'used the next hour'), o('2:07', null, false, 'KNOWLEDGE', 'read the long hand’s number as minutes')],
      hints: [['Count in 5s for the long hand: 1 → 5, 2 → 10 … 7 → ?', 'Kira 5-5 untuk jarum panjang: 1 → 5, 2 → 10 … 7 → ?']],
      show: [['Long hand on 7 → 7 × 5 = 35 minutes.', 'Jarum panjang di 7 → 7 × 5 = 35 minit.'], ['Short hand just after 2 → 2:35.', 'Jarum pendek baru melepasi 2 → 2:35.']] },
    { id: 'E3', test: 'E', topic: 'Time in words', anchor: 'clock-read', prereq: 'quarter past / to (Y2)', difficulty: 2, type: 'core', format: 'mcq', stage: 'WHAT', dims: ['UNDERSTAND', 'KNOWLEDGE'],
      q: ['Which time is “quarter to 9”?', 'Waktu manakah “lagi suku pukul 9”?'],
      opts: [o('9:45', null, false, 'UNDERSTAND', 'read “quarter to” as “quarter past/45 after”'), o('8:45', null, true), o('9:15', null, false, 'UNDERSTAND', 'read “quarter to” as “quarter past”'), o('8:15', null, false, 'KNOWLEDGE', 'quarter = 15 but wrong direction')],
      hints: [['“Quarter to 9” means 15 minutes BEFORE 9 o’clock.', '“Lagi suku pukul 9” bermaksud 15 minit SEBELUM pukul 9.']],
      show: [['15 minutes before 9:00 is 8:45.', '15 minit sebelum 9:00 ialah 8:45.']] },
    { id: 'E4', test: 'E', topic: 'a.m. and p.m.', anchor: 'am-pm', prereq: 'parts of the day (Y1)', difficulty: 1, type: 'core', format: 'mcq', stage: 'WHAT', dims: ['UNDERSTAND', 'KNOWLEDGE'],
      q: ['Fathiya eats dinner at 7:30 in the evening.\nIs that 7:30 a.m. or 7:30 p.m.?', 'Fathiya makan malam pada pukul 7:30 malam.\nAdakah itu 7:30 a.m. atau 7:30 p.m.?'],
      opts: [o('7:30 a.m.', null, false, 'KNOWLEDGE', 'a.m./p.m. mixed up'), o('7:30 p.m.', null, true)],
      hints: [['a.m. = midnight to noon (morning). p.m. = noon to midnight (afternoon and night).', 'a.m. = tengah malam hingga tengah hari (pagi). p.m. = tengah hari hingga tengah malam (petang dan malam).']],
      show: [['Evening is after noon, so it is p.m.', 'Malam adalah selepas tengah hari, jadi p.m.']] },
    { id: 'E5', test: 'E', topic: '24-hour time', anchor: 'time-24', prereq: 'a.m. and p.m. (Y3)', difficulty: 2, type: 'core', format: 'mcq', stage: 'DO', dims: ['KNOWLEDGE'],
      q: ['Write 3:20 p.m. in the 24-hour system.', 'Tulis 3:20 p.m. dalam sistem 24 jam.'],
      opts: [o('0320 hours', 'jam 0320', false, 'KNOWLEDGE', 'did not add 12 for p.m.'), o('1520 hours', 'jam 1520', true), o('1320 hours', 'jam 1320', false, 'CALCULATION', 'added 10 instead of 12'), o('1820 hours', 'jam 1820', false, 'CALCULATION', 'added 15 instead of 12')],
      hints: [['For p.m. times (after 1 p.m.), add 12 to the hour.', 'Untuk waktu p.m. (selepas 1 p.m.), tambah 12 pada jam.']],
      show: [['3 + 12 = 15', '3 + 12 = 15'], ['3:20 p.m. = 1520 hours', '3:20 p.m. = jam 1520']] },
    { id: 'E6', test: 'E', topic: 'Time units', anchor: 'time-units', prereq: '1 hour = 60 minutes (Y2)', difficulty: 2, type: 'core', format: 'number', stage: 'DO', dims: ['KNOWLEDGE', 'CALCULATION'], unit: ['minutes', 'minit'],
      q: ['2 hours 15 minutes = ___ minutes', '2 jam 15 minit = ___ minit'],
      ans: 135, numErr: { 215: ['KNOWLEDGE', 'used 1 hour = 100 minutes'], 17: ['PLAN', 'added the numbers'], 75: ['CALCULATION', 'counted only 1 hour'], 120: ['UNDERSTAND', 'forgot the 15 minutes'] },
      hints: [['1 hour = 60 minutes. So 2 hours = ?', '1 jam = 60 minit. Jadi 2 jam = ?']],
      show: [['2 hours = 2 × 60 = 120 minutes', '2 jam = 2 × 60 = 120 minit'], ['120 + 15 = 135 minutes', '120 + 15 = 135 minit']] },
    { id: 'E7', test: 'E', topic: 'Duration', anchor: 'duration', prereq: '1 hour = 60 minutes (Y2)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'DO', dims: ['PLAN', 'CALCULATION', 'KNOWLEDGE'],
      q: ['A movie starts at 2:40 p.m. and ends at 4:10 p.m.\nHow long is the movie?', 'Sebuah filem bermula pada 2:40 p.m. dan tamat pada 4:10 p.m.\nBerapa lamakah filem itu?'],
      visual: { kind: 'timeline', from: '2:40', to: '4:10', jumps: [] },
      opts: [o('1 hour 30 minutes', '1 jam 30 minit', true), o('1 hour 70 minutes', '1 jam 70 minit', false, 'KNOWLEDGE', 'subtracted like decimals (1 hour = 100 minutes)'), o('2 hours 30 minutes', '2 jam 30 minit', false, 'CALCULATION', 'counted the hours wrongly'), o('6 hours 50 minutes', '6 jam 50 minit', false, 'PLAN', 'added the times')],
      hints: [['Jump to the next o’clock first: 2:40 → 3:00 is how many minutes?', 'Lompat ke pukul tepat dahulu: 2:40 → 3:00 ialah berapa minit?']],
      show: [['2:40 → 3:00 = 20 minutes', '2:40 → 3:00 = 20 minit'], ['3:00 → 4:00 = 1 hour', '3:00 → 4:00 = 1 jam'], ['4:00 → 4:10 = 10 minutes', '4:00 → 4:10 = 10 minit'], ['Total: 1 hour 30 minutes', 'Jumlah: 1 jam 30 minit']] },
    { id: 'E8', test: 'E', topic: 'End time', anchor: 'duration', prereq: 'adding minutes across the hour (Y3)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'DO', dims: ['UNDERSTAND', 'CALCULATION', 'KNOWLEDGE'],
      q: ['A swimming class starts at 10:45 a.m. and lasts 50 minutes.\nWhat time does it end?', 'Kelas renang bermula pada 10:45 a.m. dan berlangsung selama 50 minit.\nPukul berapakah kelas itu tamat?'],
      opts: [o('10:95 a.m.', null, false, 'KNOWLEDGE', 'did not change 60 minutes into 1 hour'), o('11:35 a.m.', null, true), o('11:45 a.m.', null, false, 'CALCULATION', 'added 1 hour instead of 50 minutes'), o('9:55 a.m.', null, false, 'PLAN', 'subtracted instead of adding')],
      hints: [['10:45 + 15 minutes = 11:00. How many minutes are still left to add?', '10:45 + 15 minit = 11:00. Berapa minit lagi perlu ditambah?']],
      show: [['10:45 → 11:00 uses 15 minutes', '10:45 → 11:00 guna 15 minit'], ['50 − 15 = 35 minutes more', '50 − 15 = 35 minit lagi'], ['11:00 + 35 minutes = 11:35 a.m.', '11:00 + 35 minit = 11:35 a.m.']] },
    { id: 'E9', test: 'E', topic: 'Money', anchor: 'money', prereq: 'RM and sen (Y2)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'HOW', dims: ['PLAN', 'CALCULATION', 'UNDERSTAND'],
      q: ['Aina has RM20. She buys a book for RM7.50 and a pen for RM2.80.\nHow much money does she have left?', 'Aina ada RM20. Dia membeli buku berharga RM7.50 dan pen berharga RM2.80.\nBerapakah baki wangnya?'],
      opts: [o('RM10.30', null, false, 'UNDERSTAND', 'gave the amount spent, not the money left'), o('RM12.50', null, false, 'UNDERSTAND', 'forgot the pen'), o('RM9.70', null, true), o('RM9.30', null, false, 'CALCULATION', 'regrouping slip with sen')],
      hints: [['First find how much she spends altogether. Then take it away from RM20.', 'Mula-mula cari jumlah yang dibelanjakan. Kemudian tolak daripada RM20.']],
      show: [['Spent: RM7.50 + RM2.80 = RM10.30', 'Dibelanjakan: RM7.50 + RM2.80 = RM10.30'], ['Left: RM20.00 − RM10.30 = RM9.70', 'Baki: RM20.00 − RM10.30 = RM9.70']] },
    { id: 'E10', test: 'E', topic: 'Mass', anchor: 'measure', prereq: '1 kg = 1 000 g (Y3)', difficulty: 2, type: 'core', format: 'number', stage: 'DO', dims: ['KNOWLEDGE'], unit: ['g', 'g'],
      q: ['2 kg 300 g = ___ g', '2 kg 300 g = ___ g'],
      ans: 2300, numErr: { 2030: ['KNOWLEDGE', 'place-value slip with grams'], 230: ['KNOWLEDGE', 'used 1 kg = 100 g'], 302: ['PLAN', 'added the numbers'], 23: ['KNOWLEDGE', 'did not convert'] },
      hints: [['1 kg = 1 000 g. So 2 kg = ? g', '1 kg = 1 000 g. Jadi 2 kg = ? g']],
      show: [['2 kg = 2 000 g', '2 kg = 2 000 g'], ['2 000 + 300 = 2 300 g', '2 000 + 300 = 2 300 g']] },
    { id: 'E11', test: 'E', topic: 'Length', anchor: 'measure', prereq: '1 m = 100 cm (Y2)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'HOW', dims: ['KNOWLEDGE', 'PLAN', 'CALCULATION'],
      q: ['A ribbon is 3 m long. Mira cuts off 85 cm.\nHow long is the ribbon left?', 'Seutas reben panjangnya 3 m. Mira memotong 85 cm.\nBerapakah panjang reben yang tinggal?'],
      opts: [o('215 cm', null, true), o('15 cm', null, false, 'KNOWLEDGE', 'treated 3 m as 100 cm'), o('385 cm', null, false, 'PLAN', 'added instead of subtracting'), o('225 cm', null, false, 'CALCULATION', 'subtraction slip')],
      hints: [['Make the units the same first: 3 m = ? cm', 'Samakan unit dahulu: 3 m = ? cm']],
      show: [['3 m = 300 cm', '3 m = 300 cm'], ['300 − 85 = 215 cm', '300 − 85 = 215 cm']] },
    { id: 'E12', test: 'E', topic: 'Does it make sense?', anchor: 'duration', prereq: '', difficulty: 3, type: 'challenge', format: 'mcq', stage: 'CHECK', dims: ['CHECK', 'UNDERSTAND'],
      q: ['Ali walked to school. He left at 7:10 a.m. and arrived at 7:40 a.m.\nHe says the walk took 3 hours. Is he right?', 'Ali berjalan ke sekolah. Dia bertolak pada 7:10 a.m. dan tiba pada 7:40 a.m.\nDia kata perjalanan itu mengambil masa 3 jam. Betulkah?'],
      opts: [o('Yes, it took 3 hours.', 'Ya, 3 jam.', false, 'CHECK', 'did not check if the answer makes sense'), o('No, it took 30 minutes.', 'Tidak, 30 minit sahaja.', true), o('No, it took 40 minutes.', 'Tidak, 40 minit.', false, 'CALCULATION', 'used the arrival minutes only')],
      hints: [['Is the hour the same at the start and the end? Then only the minutes changed.', 'Adakah jamnya sama semasa mula dan tamat? Jika ya, hanya minit yang berubah.']],
      show: [['Both times are in the 7 o’clock hour.', 'Kedua-dua waktu dalam jam 7.'], ['40 − 10 = 30 minutes, not 3 hours.', '40 − 10 = 30 minit, bukan 3 jam.']] }
  );

  var probes = [
    { id: 'P-CLK', topic: 'O’clock (Y1)', anchor: 'clock-read', year: 1, format: 'mcq', q: ['What time is it?', 'Pukul berapa?'], visual: { kind: 'clock', h: 3, m: 0 },
      opts: [o('3:00', null, true), o('12:15', null, false, 'KNOWLEDGE', 'swapped the hands'), o('12:03', null, false, 'KNOWLEDGE', 'swapped the hands')] },
    { id: 'P-HOUR', topic: '1 hour = 60 minutes (Y2)', anchor: 'time-units', year: 2, format: 'number', q: ['1 hour = ___ minutes', '1 jam = ___ minit'], ans: 60, numErr: { 100: ['KNOWLEDGE', 'thinks 1 hour = 100 minutes'], 12: ['KNOWLEDGE', 'used the clock numbers'] } },
    { id: 'P-SEN', topic: 'RM1 = 100 sen (Y2)', anchor: 'money', year: 2, format: 'number', q: ['RM1 = ___ sen', 'RM1 = ___ sen'], ans: 100, numErr: { 10: ['KNOWLEDGE', 'RM1 = 10 sen'] } },
    { id: 'P-KG', topic: '1 kg = 1 000 g (Y3)', anchor: 'measure', year: 3, format: 'number', q: ['1 kg = ___ g', '1 kg = ___ g'], ans: 1000, numErr: { 100: ['KNOWLEDGE', '1 kg = 100 g'], 10: ['KNOWLEDGE', '1 kg = 10 g'] } },
    { id: 'P-M', topic: '1 m = 100 cm (Y2)', anchor: 'measure', year: 2, format: 'number', q: ['1 m = ___ cm', '1 m = ___ cm'], ans: 100, numErr: { 10: ['KNOWLEDGE', '1 m = 10 cm'], 1000: ['KNOWLEDGE', 'mixed up with 1 km = 1 000 m'] } }
  ];
  probes.forEach(function (p) { p.isProbe = true; p.probeKind = 'prerequisite'; p.dims = ['KNOWLEDGE']; p.type = 'core'; p.difficulty = 1; p.prereq = ''; D.PROBES.push(p); });
  Object.assign(D.PROBE_MAP, { E1: 'P-CLK', E2: 'P-CLK', E3: 'P-CLK', E6: 'P-HOUR', E7: 'P-HOUR', E8: 'P-HOUR', E9: 'P-SEN', E10: 'P-KG', E11: 'P-M' });
})();
