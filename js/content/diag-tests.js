/* Diagnostic Assessment Layer — "Check My Level" content.
   Pure content: adding a test or questions never needs engine/UI changes.
   Schema (one question):
   { id, test, topic, anchor (Y4 skill key), prereq (embedded Y1–3 skill or ''), difficulty 1–3,
     type 'core'|'integration'|'challenge', format 'mcq'|'number'|'explain'|'numexplain',
     stage 'WHAT'|'HOW'|'DO'|'CHECK'|'' , dims [dimensions this item gives evidence for],
     pair { group, kind:'direct'|'context' } (optional — same skill asked plainly vs in context),
     chain 'id' (optional — WHAT→HOW→DO→CHECK steps of one problem),
     q [en, bm], table {head:[[en,bm]...], rows:[[...]]} (optional),
     opts [{ t:[en,bm], ok:true } | { t:[en,bm], err:'PLAN', why:'chose addition for how-many-more' }]  (mcq)
     ans number, unit [en,bm], numErr { value: [DIM, why] }                                          (number)
     keys [[regex-source...], [regex-source...]]  explanation heuristic: groups of acceptable ideas (explain)
     hints [[en,bm], ...]  (shown only AFTER the first attempt is recorded)
     show [[en,bm], ...]   worked example (only after retries) }
   Dimensions: UNDERSTAND, PLAN, KNOWLEDGE, CALCULATION, EXPLANATION, CHECK. */
window.FMQ = window.FMQ || {};

FMQ.diag = FMQ.diag || {};
FMQ.diag.VERSION = 'diag-1.0';

FMQ.diag.DIMS = [
  { id: 'UNDERSTAND', en: 'Understanding Questions', bm: 'Memahami Soalan', q: ['Did she understand what was being asked?', 'Adakah dia faham apa yang ditanya?'] },
  { id: 'PLAN', en: 'Planning / Choosing Method', bm: 'Merancang / Memilih Kaedah', q: ['Did she choose the correct operation or method?', 'Adakah dia memilih operasi atau kaedah yang betul?'] },
  { id: 'KNOWLEDGE', en: 'Concept / Prerequisite Knowledge', bm: 'Konsep / Pengetahuan Asas', q: ['Does she appear to lack the concept or a prerequisite?', 'Adakah dia kelihatan belum menguasai konsep atau asasnya?'] },
  { id: 'CALCULATION', en: 'Calculation Accuracy', bm: 'Ketepatan Pengiraan', q: ['Was the strategy right but the working wrong?', 'Strategi betul tetapi pengiraan silap?'] },
  { id: 'EXPLANATION', en: 'Explanation', bm: 'Penerangan', q: ['Could she explain the reasoning?', 'Bolehkah dia menerangkan penaakulannya?'] },
  { id: 'CHECK', en: 'Checking Behaviour', bm: 'Tabiat Menyemak', q: ['Did she notice unreasonable or incomplete answers?', 'Adakah dia perasan jawapan yang tidak munasabah atau tidak lengkap?'] }
];

FMQ.diag.SKILLS = {
  'place-value': ['Place Value', 'Nilai Tempat', '🔢'],
  'number-names': ['Reading & Writing Numbers', 'Membaca & Menulis Nombor', '🔤'],
  'expanded-form': ['Expanded Form', 'Bentuk Cerakinan', '🧩'],
  'compare-order': ['Comparing & Ordering', 'Membanding & Menyusun', '⚖️'],
  'rounding': ['Rounding', 'Membundar', '🎯'],
  'estimation': ['Estimation', 'Anggaran', '🤏'],
  'patterns': ['Number Patterns', 'Pola Nombor', '🔁'],
  'number-sense': ['Number Reasoning', 'Penaakulan Nombor', '💭'],
  'addition': ['Addition', 'Tambah', '➕'],
  'subtraction': ['Subtraction', 'Tolak', '➖'],
  'multiplication': ['Multiplication', 'Darab', '✖️'],
  'division': ['Division', 'Bahagi', '➗'],
  'mixed-ops': ['Mixed Operations', 'Operasi Bergabung', '🔀'],
  'choose-op': ['Choosing the Operation', 'Memilih Operasi', '🧭'],
  'reasonableness': ['Checking Answers', 'Menyemak Jawapan', '✅'],
  'word-problems': ['Word Problems', 'Penyelesaian Masalah', '📖'],
  'key-info': ['Finding Key Information', 'Mencari Maklumat Penting', '🔍'],
  'two-step': ['Two-Step Problems', 'Masalah Dua Langkah', '🪜'],
  'tables-data': ['Reading Tables', 'Membaca Jadual', '📊'],
  'inverse-ops': ['Inverse Operations', 'Operasi Songsang', '🔄'],
  'proportion': ['Scaling Up', 'Kadaran', '📈'],
  'maths-language': ['Maths Words', 'Kata Matematik', '🗣️'],
  'explaining': ['Explaining My Thinking', 'Menerangkan Pemikiran', '🗣️']
};

FMQ.diag.TESTS = [
  { id: 'A', icon: '🔢', title: ['Number Foundation', 'Asas Nombor'], blurb: ['Numbers to 100 000, place value, rounding, patterns', 'Nombor hingga 100 000, nilai tempat, membundar, pola'], minutes: 10, ready: true },
  { id: 'B', icon: '➗', title: ['Operations', 'Operasi'], blurb: ['+ − × ÷, mixed operations, checking', '+ − × ÷, operasi bergabung, menyemak'], minutes: 10, ready: true },
  { id: 'C', icon: '🧠', title: ['Problem Solver', 'Penyelesai Masalah'], blurb: ['Word problems, tables, explaining, does it make sense?', 'Masalah berayat, jadual, menerang, munasabahkah?'], minutes: 10, ready: true },
  { id: 'L', icon: '🗣️', title: ['Maths Words', 'Kata Matematik'], blurb: ['subtract from, remaining, twice, each… in English and BM', 'tolak daripada, baki, dua kali ganda, setiap… dalam BI dan BM'], minutes: 5, ready: true },
  { id: 'D', icon: '🍰', title: ['Fractions & Decimals', 'Pecahan & Perpuluhan'], blurb: ['Coming soon', 'Akan datang'], minutes: 9, ready: false },
  { id: 'E', icon: '💰', title: ['Applied Maths', 'Matematik Gunaan'], blurb: ['Money, time and measurement — coming soon', 'Wang, masa dan ukuran — akan datang'], minutes: 9, ready: false },
  { id: 'F', icon: '📐', title: ['Shape & Data', 'Bentuk & Data'], blurb: ['Shapes, tables, graphs — coming soon', 'Bentuk, jadual, graf — akan datang'], minutes: 9, ready: false }
];

FMQ.diag.QUESTIONS = [
  /* ───────────── TEST A — NUMBER FOUNDATION ───────────── */
  { id: 'A1', test: 'A', topic: 'Whole numbers', anchor: 'place-value', prereq: 'place value to 1 000 (Y2–3)', difficulty: 1, type: 'core', format: 'mcq', stage: 'DO', dims: ['KNOWLEDGE'],
    q: ['What is the value of the digit 7 in 47 352?', 'Apakah nilai digit 7 dalam 47 352?'],
    opts: [{ t: ['7 000', '7 000'], ok: true }, { t: ['700', '700'], err: 'KNOWLEDGE', why: 'place-value slip (one place too low)' }, { t: ['70 000', '70 000'], err: 'KNOWLEDGE', why: 'place-value slip (one place too high)' }, { t: ['7', '7'], err: 'KNOWLEDGE', why: 'gave the digit, not its value' }],
    hints: [['Say the places from the right: ones, tens, hundreds, thousands, ten thousands. Where is the 7?', 'Sebut tempat dari kanan: sa, puluh, ratus, ribu, puluh ribu. Di mana 7?']],
    show: [['47 352 = 40 000 + 7 000 + 300 + 50 + 2', '47 352 = 40 000 + 7 000 + 300 + 50 + 2'], ['The 7 is in the thousands place, so its value is 7 000.', '7 berada di tempat ribu, jadi nilainya 7 000.']] },
  { id: 'A2', test: 'A', topic: 'Whole numbers', anchor: 'number-names', prereq: 'zero as a place holder (Y2)', difficulty: 1, type: 'core', format: 'mcq', stage: 'DO', dims: ['KNOWLEDGE', 'UNDERSTAND'],
    q: ['Which number is “sixty thousand four hundred and five”?', 'Nombor manakah “enam puluh ribu empat ratus lima”?'],
    opts: [{ t: ['64 005', '64 005'], err: 'KNOWLEDGE', why: 'zero place-holder in wrong place' }, { t: ['60 405', '60 405'], ok: true }, { t: ['60 450', '60 450'], err: 'UNDERSTAND', why: 'misread “five” as “fifty”' }, { t: ['6 405', '6 405'], err: 'KNOWLEDGE', why: 'missing zero place-holder (4-digit number)' }],
    hints: [['Sixty thousand = 60 000. Then add four hundred and five.', 'Enam puluh ribu = 60 000. Kemudian tambah empat ratus lima.']],
    show: [['60 000 + 400 + 5 = 60 405', '60 000 + 400 + 5 = 60 405'], ['There are no thousands and no tens, so those places get a 0.', 'Tiada ribu dan tiada puluh, jadi tempat itu diisi 0.']] },
  { id: 'A3', test: 'A', topic: 'Whole numbers', anchor: 'expanded-form', prereq: 'place value to 1 000 (Y2–3)', difficulty: 1, type: 'core', format: 'number', stage: 'DO', dims: ['KNOWLEDGE'],
    q: ['Fill in the missing number:\n38 064 = 30 000 + 8 000 + ___ + 4', 'Isikan nombor yang tertinggal:\n38 064 = 30 000 + 8 000 + ___ + 4'],
    ans: 60, numErr: { 6: ['KNOWLEDGE', 'gave the digit, not its value'], 600: ['KNOWLEDGE', 'place-value slip'], 64: ['UNDERSTAND', 'wrote the last two digits together'] },
    hints: [['Which digit is in the tens place of 38 064? What is it worth?', 'Digit apakah di tempat puluh dalam 38 064? Berapakah nilainya?']],
    show: [['38 064: 3 ten thousands, 8 thousands, 0 hundreds, 6 tens, 4 ones.', '38 064: 3 puluh ribu, 8 ribu, 0 ratus, 6 puluh, 4 sa.'], ['6 tens = 60', '6 puluh = 60']] },
  { id: 'A4', test: 'A', topic: 'Comparing numbers', anchor: 'compare-order', prereq: 'comparing 3-digit numbers (Y2)', difficulty: 2, type: 'core', format: 'mcq', stage: 'DO', dims: ['KNOWLEDGE', 'UNDERSTAND'], pair: { group: 'compare', kind: 'direct' },
    q: ['Which number is the greatest?', 'Nombor manakah yang paling besar?'],
    opts: [{ t: ['52 019', '52 019'], err: 'KNOWLEDGE', why: 'compared from the right (ones) instead of the left' }, { t: ['52 109', '52 109'], err: 'KNOWLEDGE', why: 'did not compare the hundreds digit carefully' }, { t: ['52 190', '52 190'], ok: true }, { t: ['51 920', '51 920'], err: 'UNDERSTAND', why: 'chose the smallest — misread “greatest”' }],
    hints: [['Compare from the LEFT. The ten thousands and thousands are the same for three of them… now look at the hundreds.', 'Banding dari KIRI. Puluh ribu dan ribu sama bagi tiga nombor… sekarang lihat ratus.']],
    show: [['52 019, 52 109, 52 190 all start with 52 thousand.', '52 019, 52 109, 52 190 semuanya bermula dengan 52 ribu.'], ['Hundreds: 0, 1, 1. Then tens: 52 190 has 9 tens, 52 109 has 0 tens. 52 190 is greatest.', 'Ratus: 0, 1, 1. Kemudian puluh: 52 190 ada 9 puluh, 52 109 ada 0 puluh. 52 190 paling besar.']] },
  { id: 'A5', test: 'A', topic: 'Rounding', anchor: 'rounding', prereq: 'rounding to nearest 10/100 (Y3)', difficulty: 2, type: 'core', format: 'mcq', stage: 'DO', dims: ['KNOWLEDGE', 'UNDERSTAND'],
    q: ['Round 46 381 to the nearest thousand.', 'Bundarkan 46 381 kepada ribu yang terdekat.'],
    opts: [{ t: ['46 000', '46 000'], ok: true }, { t: ['47 000', '47 000'], err: 'KNOWLEDGE', why: 'rounding rule: rounded up when hundreds digit < 5' }, { t: ['46 400', '46 400'], err: 'UNDERSTAND', why: 'rounded to the nearest hundred — misread the place' }, { t: ['50 000', '50 000'], err: 'UNDERSTAND', why: 'rounded to the nearest ten thousand — misread the place' }],
    hints: [['Find the thousands digit. Then look at the digit just to its right (the hundreds). Is it 5 or more?', 'Cari digit ribu. Kemudian lihat digit di sebelah kanannya (ratus). Adakah 5 atau lebih?']],
    show: [['46 381 is between 46 000 and 47 000.', '46 381 berada di antara 46 000 dan 47 000.'], ['The hundreds digit is 3 (less than 5), so round down to 46 000.', 'Digit ratus ialah 3 (kurang daripada 5), jadi bundar ke bawah: 46 000.']] },
  { id: 'A6', test: 'A', topic: 'Comparing numbers', anchor: 'compare-order', prereq: 'comparing 3-digit numbers (Y2)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'DO', dims: ['UNDERSTAND', 'KNOWLEDGE'], pair: { group: 'compare', kind: 'context' },
    q: ['Visitors to the Kuching Waterfront festival:\nFriday 23 480 · Saturday 32 840 · Sunday 28 340\nWhich day had the MOST visitors?', 'Pengunjung pesta di Kuching Waterfront:\nJumaat 23 480 · Sabtu 32 840 · Ahad 28 340\nHari manakah paling RAMAI pengunjung?'],
    opts: [{ t: ['Friday', 'Jumaat'], err: 'KNOWLEDGE', why: 'compared the wrong digits' }, { t: ['Saturday', 'Sabtu'], ok: true }, { t: ['Sunday', 'Ahad'], err: 'UNDERSTAND', why: 'misread the numbers in context' }],
    hints: [['Look only at the ten thousands digit first: 2, 3, 2.', 'Lihat digit puluh ribu dahulu: 2, 3, 2.']],
    show: [['32 840 has 3 ten thousands; the others have only 2.', '32 840 ada 3 puluh ribu; yang lain hanya 2.'], ['So Saturday had the most visitors.', 'Jadi Sabtu paling ramai pengunjung.']] },
  { id: 'A7', test: 'A', topic: 'Estimation', anchor: 'estimation', prereq: 'addition with regrouping (Y3)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'DO', dims: ['UNDERSTAND', 'PLAN', 'CALCULATION'], pair: { group: 'addition', kind: 'context' },
    q: ['A kuih shop sold 2 980 kuih lapis on Monday and 4 950 on Tuesday.\nABOUT how many did it sell altogether? (Round each to the nearest thousand.)', 'Sebuah kedai kuih menjual 2 980 kuih lapis pada hari Isnin dan 4 950 pada hari Selasa.\nANGGARKAN jumlah kuih yang dijual. (Bundarkan setiap satu kepada ribu terdekat.)'],
    opts: [{ t: ['7 000', '7 000'], err: 'CALCULATION', why: 'rounding slip (4 950 rounded down)' }, { t: ['8 000', '8 000'], ok: true }, { t: ['2 000', '2 000'], err: 'PLAN', why: 'subtracted instead of adding for “altogether”' }, { t: ['7 930', '7 930'], err: 'UNDERSTAND', why: 'gave the exact total, not an estimate' }],
    hints: [['2 980 is close to 3 000. What is 4 950 close to?', '2 980 hampir 3 000. 4 950 hampir berapa?']],
    show: [['2 980 → 3 000 and 4 950 → 5 000', '2 980 → 3 000 dan 4 950 → 5 000'], ['3 000 + 5 000 = about 8 000', '3 000 + 5 000 = kira-kira 8 000']] },
  { id: 'A8', test: 'A', topic: 'Number patterns', anchor: 'patterns', prereq: 'counting in steps (Y2–3)', difficulty: 2, type: 'integration', format: 'number', stage: 'DO', dims: ['KNOWLEDGE', 'CALCULATION'],
    q: ['What is the missing number in the pattern?\n31 200, 31 450, 31 700, ___, 32 200', 'Apakah nombor yang tertinggal dalam pola ini?\n31 200, 31 450, 31 700, ___, 32 200'],
    ans: 31950, numErr: { 31900: ['CALCULATION', 'counting-on slip'], 32700: ['KNOWLEDGE', 'found the wrong step size'], 31800: ['KNOWLEDGE', 'found the wrong step size'], 32950: ['CALCULATION', 'counting-on slip (wrong place)'] },
    hints: [['How much bigger is each number than the one before?', 'Setiap nombor bertambah berapa daripada nombor sebelumnya?']],
    show: [['31 450 − 31 200 = 250, so the pattern goes up by 250.', '31 450 − 31 200 = 250, jadi pola bertambah 250.'], ['31 700 + 250 = 31 950', '31 700 + 250 = 31 950']] },
  { id: 'A9', test: 'A', topic: 'Number reasoning', anchor: 'number-sense', prereq: 'comparing numbers (Y2)', difficulty: 3, type: 'challenge', format: 'mcq', stage: 'CHECK', dims: ['EXPLANATION', 'KNOWLEDGE'],
    q: ['Aiman says: “9 999 is bigger than 10 001 because 9 is the biggest digit.”\nWhich is the best reply?', 'Aiman berkata: “9 999 lebih besar daripada 10 001 kerana 9 ialah digit paling besar.”\nPilih jawapan yang paling baik.'],
    opts: [{ t: ['He is right — 9 is the biggest digit.', 'Dia betul — 9 ialah digit paling besar.'], err: 'KNOWLEDGE', why: 'judged size by digits, not place value' }, { t: ['He is wrong — 10 001 ends in 1.', 'Dia salah — 10 001 berakhir dengan 1.'], err: 'EXPLANATION', why: 'right conclusion, weak reason' }, { t: ['He is wrong — 10 001 has a ten thousand, and 9 999 has none.', 'Dia salah — 10 001 ada satu puluh ribu, 9 999 tiada.'], ok: true }, { t: ['He is right — 9 999 has more 9s.', 'Dia betul — 9 999 ada lebih banyak 9.'], err: 'KNOWLEDGE', why: 'judged size by digits, not place value' }],
    hints: [['How many digits does each number have? Which place is the biggest?', 'Berapa digit setiap nombor? Tempat manakah paling besar?']],
    show: [['10 001 has 5 digits (a ten thousand). 9 999 has 4 digits.', '10 001 ada 5 digit (satu puluh ribu). 9 999 ada 4 digit.'], ['So 10 001 is bigger, even though its digits are small.', 'Jadi 10 001 lebih besar walaupun digitnya kecil.']] },
  { id: 'A10', test: 'A', topic: 'Number reasoning', anchor: 'place-value', prereq: 'ordering digits (Y2)', difficulty: 3, type: 'challenge', format: 'number', stage: 'DO', dims: ['UNDERSTAND', 'KNOWLEDGE'],
    q: ['Use each digit once: 4, 0, 7, 2, 9\nWhat is the SMALLEST 5-digit number you can make?', 'Guna setiap digit sekali: 4, 0, 7, 2, 9\nApakah nombor 5 digit yang PALING KECIL boleh dibentuk?'],
    ans: 20479, numErr: { 2479: ['UNDERSTAND', 'put 0 first (not a 5-digit number)'], 97420: ['UNDERSTAND', 'made the largest number — misread “smallest”'], 24079: ['KNOWLEDGE', 'did not order the remaining digits'], 40279: ['KNOWLEDGE', 'did not order the digits'] },
    hints: [['A 5-digit number cannot start with 0. Which is the smallest digit you CAN start with?', 'Nombor 5 digit tidak boleh bermula dengan 0. Digit terkecil manakah yang BOLEH di depan?']],
    show: [['Start with 2 (smallest digit that is not 0).', 'Mulakan dengan 2 (digit terkecil yang bukan 0).'], ['Then the rest from smallest: 0, 4, 7, 9 → 20 479', 'Kemudian selebihnya dari terkecil: 0, 4, 7, 9 → 20 479']] },

  /* ───────────── TEST B — OPERATIONS ───────────── */
  { id: 'B1', test: 'B', topic: 'Addition', anchor: 'addition', prereq: '3-digit addition with regrouping (Y3)', difficulty: 2, type: 'core', format: 'number', stage: 'DO', dims: ['CALCULATION', 'KNOWLEDGE'], pair: { group: 'addition', kind: 'direct' },
    q: ['Add in columns:\n23 614 + 7 258 + 345 = ?', 'Tambah dalam lajur:\n23 614 + 7 258 + 345 = ?'],
    ans: 31217, numErr: { 30872: ['UNDERSTAND', 'left out the third number'], 20107: ['CALCULATION', 'regrouping error (did not carry)'], 31117: ['CALCULATION', 'regrouping error (hundreds)'], 31207: ['CALCULATION', 'regrouping error (tens)'], 65372: ['KNOWLEDGE', 'misaligned place values (345 lined up on the left)'] },
    hints: [['Line up the ONES of all three numbers on the right. Add one column at a time and carry.', 'Susun SA ketiga-tiga nombor di sebelah kanan. Tambah satu lajur demi satu lajur dan kumpul semula.']],
    show: [['Ones 4+8+5 = 17 → 7 carry 1. Tens 1+5+4+1 = 11 → 1 carry 1.', 'Sa 4+8+5 = 17 → 7 simpan 1. Puluh 1+5+4+1 = 11 → 1 simpan 1.'], ['Hundreds 6+2+3+1 = 12 → 2 carry 1. Thousands 3+7+1 = 11 → 1 carry 1. Ten thousands 2+1 = 3. Answer 31 217.', 'Ratus 6+2+3+1 = 12 → 2 simpan 1. Ribu 3+7+1 = 11 → 1 simpan 1. Puluh ribu 2+1 = 3. Jawapan 31 217.']] },
  { id: 'B2', test: 'B', topic: 'Subtraction', anchor: 'subtraction', prereq: 'subtraction across zeros (Y3)', difficulty: 2, type: 'core', format: 'number', stage: 'DO', dims: ['CALCULATION', 'KNOWLEDGE'], pair: { group: 'subtraction', kind: 'direct' },
    q: ['50 000 − 12 345 = ?', '50 000 − 12 345 = ?'],
    ans: 37655, numErr: { 42345: ['CALCULATION', 'regrouping error (took smaller digit from larger)'], 38655: ['CALCULATION', 'regrouping error across zeros'], 37665: ['CALCULATION', 'regrouping error across zeros'], 62345: ['PLAN', 'added instead of subtracting'] },
    hints: [['50 000 has zeros. Borrow from the 5: 50 000 = 4 ten thousands, 9 thousands, 9 hundreds, 9 tens, 10 ones.', '50 000 ada sifar. Pinjam dari 5: 50 000 = 4 puluh ribu, 9 ribu, 9 ratus, 9 puluh, 10 sa.']],
    show: [['Think 49 999 + 1. 49 999 − 12 345 = 37 654.', 'Fikir 49 999 + 1. 49 999 − 12 345 = 37 654.'], ['Add the 1 back: 37 655.', 'Tambah semula 1: 37 655.']] },
  { id: 'B3', test: 'B', topic: 'Multiplication', anchor: 'multiplication', prereq: 'times tables 2–9 (Y2–3)', difficulty: 3, type: 'core', format: 'number', stage: 'DO', dims: ['CALCULATION', 'KNOWLEDGE'], pair: { group: 'multiplication', kind: 'direct' },
    q: ['2 136 × 13 = ?', '2 136 × 13 = ?'],
    ans: 27768, numErr: { 8544: ['KNOWLEDGE', 'did not shift one place when multiplying by the tens digit'], 6408: ['UNDERSTAND', 'multiplied by 3 only'], 2136: ['UNDERSTAND', 'multiplied by 1 only'], 27668: ['CALCULATION', 'regrouping slip'], 27758: ['CALCULATION', 'regrouping slip'], 2149: ['PLAN', 'added instead of multiplying'] },
    hints: [['Split 13 into 10 + 3. Work out 2 136 × 3 and 2 136 × 10, then add.', 'Pecahkan 13 kepada 10 + 3. Kira 2 136 × 3 dan 2 136 × 10, kemudian tambah.']],
    show: [['2 136 × 3 = 6 408 and 2 136 × 10 = 21 360', '2 136 × 3 = 6 408 dan 2 136 × 10 = 21 360'], ['6 408 + 21 360 = 27 768', '6 408 + 21 360 = 27 768']] },
  { id: 'B4', test: 'B', topic: 'Division', anchor: 'division', prereq: 'short division / division facts (Y3)', difficulty: 3, type: 'core', format: 'number', stage: 'DO', dims: ['CALCULATION', 'KNOWLEDGE'], pair: { group: 'division', kind: 'direct' },
    q: ['Long division:\n36 024 ÷ 6 = ?', 'Bahagi panjang:\n36 024 ÷ 6 = ?'],
    ans: 6004, numErr: { 604: ['KNOWLEDGE', 'left out a zero in the quotient'], 64: ['KNOWLEDGE', 'left out the zeros in the quotient'], 6040: ['KNOWLEDGE', 'zero in the quotient in the wrong place'], 6014: ['CALCULATION', 'division slip'], 6003: ['CALCULATION', 'division slip'] },
    hints: [['36 ÷ 6 = 6. Then 0 ÷ 6 — write a 0 in the answer! Keep going.', '36 ÷ 6 = 6. Kemudian 0 ÷ 6 — tulis 0 dalam jawapan! Teruskan.']],
    show: [['36 ÷ 6 = 6 → 0 ÷ 6 = 0 → 2 ÷ 6 = 0 rem 2 → 24 ÷ 6 = 4', '36 ÷ 6 = 6 → 0 ÷ 6 = 0 → 2 ÷ 6 = 0 baki 2 → 24 ÷ 6 = 4'], ['Answer 6 004. Check: 6 004 × 6 = 36 024 ✓', 'Jawapan 6 004. Semak: 6 004 × 6 = 36 024 ✓']] },
  { id: 'B5', test: 'B', topic: 'Subtraction', anchor: 'subtraction', prereq: 'subtraction with regrouping (Y3)', difficulty: 2, type: 'core', format: 'mcq', stage: 'DO', dims: ['PLAN', 'UNDERSTAND', 'CALCULATION'], pair: { group: 'subtraction', kind: 'context' },
    q: ['For Hari Raya, Siti saved RM 1 250 and her aunt Puan Aminah saved RM 3 400.\nHow much MORE did Puan Aminah save?', 'Untuk Hari Raya, Siti menyimpan RM 1 250 dan ibu saudaranya Puan Aminah menyimpan RM 3 400.\nBerapa LEBIH wang simpanan Puan Aminah?'],
    opts: [{ t: ['RM 4 650', 'RM 4 650'], err: 'PLAN', why: 'chose addition for how-many-more' }, { t: ['RM 2 250', 'RM 2 250'], err: 'CALCULATION', why: 'regrouping error' }, { t: ['RM 2 150', 'RM 2 150'], ok: true }, { t: ['RM 3 400', 'RM 3 400'], err: 'UNDERSTAND', why: 'copied a number from the question' }],
    hints: [['“How much more” means find the DIFFERENCE between the two amounts.', '“Berapa lebih” bermaksud cari BEZA antara dua jumlah.']],
    show: [['RM 3 400 − RM 1 250', 'RM 3 400 − RM 1 250'], ['= RM 2 150', '= RM 2 150']] },
  { id: 'B6', test: 'B', topic: 'Choosing the operation', anchor: 'choose-op', prereq: 'meaning of division (Y2)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'HOW', chain: 'B-rows', dims: ['PLAN'],
    q: ['On Sports Day, 1 152 pupils sit in 8 equal rows.\nHOW do you find the number of pupils in each row?', 'Pada Hari Sukan, 1 152 murid duduk dalam 8 barisan yang sama banyak.\nBAGAIMANA mencari bilangan murid dalam setiap barisan?'],
    opts: [{ t: ['1 152 × 8', '1 152 × 8'], err: 'PLAN', why: 'chose multiplication for equal sharing' }, { t: ['1 152 ÷ 8', '1 152 ÷ 8'], ok: true }, { t: ['1 152 − 8', '1 152 − 8'], err: 'PLAN', why: 'chose subtraction for equal sharing' }, { t: ['1 152 + 8', '1 152 + 8'], err: 'PLAN', why: 'chose addition for equal sharing' }],
    hints: [['The pupils are SHARED equally into rows. Which operation shares equally?', 'Murid DIBAHAGIKAN sama rata kepada barisan. Operasi manakah membahagi sama rata?']],
    show: [['Equal rows → share → divide.', 'Barisan sama banyak → bahagi sama rata → bahagi.'], ['1 152 ÷ 8', '1 152 ÷ 8']] },
  { id: 'B7', test: 'B', topic: 'Division', anchor: 'division', prereq: 'division facts (Y3)', difficulty: 2, type: 'integration', format: 'number', stage: 'DO', chain: 'B-rows', dims: ['CALCULATION'], pair: { group: 'division', kind: 'context' },
    q: ['Now DO it: how many pupils are in each row?\n(1 152 pupils, 8 equal rows)', 'Sekarang BUAT: berapa murid dalam setiap barisan?\n(1 152 murid, 8 barisan sama banyak)'],
    ans: 144, unit: ['pupils', 'murid'], numErr: { 9216: ['PLAN', 'multiplied instead of dividing'], 1144: ['PLAN', 'subtracted instead of dividing'], 1160: ['PLAN', 'added instead of dividing'], 134: ['CALCULATION', 'division slip'], 154: ['CALCULATION', 'division slip'], 14: ['KNOWLEDGE', 'missing digit (place value in division)'] },
    hints: [['11 ÷ 8 = 1 remainder 3. Bring the 3 to the next digit: 35 ÷ 8 = ?', '11 ÷ 8 = 1 baki 3. Bawa 3 ke digit seterusnya: 35 ÷ 8 = ?']],
    show: [['11 ÷ 8 = 1 r 3 → 35 ÷ 8 = 4 r 3 → 32 ÷ 8 = 4', '11 ÷ 8 = 1 b 3 → 35 ÷ 8 = 4 b 3 → 32 ÷ 8 = 4'], ['144 pupils. Check: 144 × 8 = 1 152 ✓', '144 murid. Semak: 144 × 8 = 1 152 ✓']] },
  { id: 'B8', test: 'B', topic: 'Mixed operations', anchor: 'mixed-ops', prereq: '2-digit subtraction with borrowing (Y2)', difficulty: 2, type: 'integration', format: 'number', stage: 'DO', dims: ['PLAN', 'UNDERSTAND', 'CALCULATION'],
    q: ['Brackets first:\n(40 000 + 3 700) − 26 500 = ?', 'Kurungan dahulu:\n(40 000 + 3 700) − 26 500 = ?'],
    ans: 17200, numErr: { 70200: ['PLAN', 'added everything (ignored the − sign)'], 13500: ['UNDERSTAND', 'left out the 3 700 inside the bracket'], 17300: ['CALCULATION', 'subtraction slip'], 23200: ['CALCULATION', 'regrouping error'], 27200: ['CALCULATION', 'regrouping error'] },
    hints: [['Do the bracket first: 40 000 + 3 700 = ?. Then subtract 26 500 from that answer.', 'Buat kurungan dahulu: 40 000 + 3 700 = ?. Kemudian tolak 26 500 daripada jawapan itu.']],
    show: [['40 000 + 3 700 = 43 700', '40 000 + 3 700 = 43 700'], ['43 700 − 26 500 = 17 200', '43 700 − 26 500 = 17 200']] },
  { id: 'B11', test: 'B', topic: 'Inverse operations', anchor: 'inverse-ops', prereq: 'multiplication and division facts (Y2–3)', difficulty: 3, type: 'integration', format: 'number', stage: 'HOW', dims: ['PLAN', 'KNOWLEDGE', 'CALCULATION'],
    q: ['Find the missing number:\n□ × 5 = 12 000', 'Cari nombor yang tertinggal:\n□ × 5 = 12 000'],
    ans: 2400, numErr: { 60000: ['PLAN', 'multiplied instead of using the inverse (÷)'], 11995: ['PLAN', 'subtracted instead of dividing'], 12005: ['PLAN', 'added instead of dividing'], 240: ['KNOWLEDGE', 'place-value slip in division'], 24000: ['KNOWLEDGE', 'place-value slip in division'], 2040: ['CALCULATION', 'division slip'] },
    hints: [['Something times 5 makes 12 000. Undo × 5 by doing ÷ 5.', 'Sesuatu darab 5 menjadi 12 000. Songsangkan × 5 dengan ÷ 5.']],
    show: [['□ = 12 000 ÷ 5', '□ = 12 000 ÷ 5'], ['= 2 400. Check: 2 400 × 5 = 12 000 ✓', '= 2 400. Semak: 2 400 × 5 = 12 000 ✓']] },
  { id: 'B9', test: 'B', topic: 'Checking answers', anchor: 'reasonableness', prereq: 'rounding to nearest 100 (Y3)', difficulty: 3, type: 'challenge', format: 'mcq', stage: 'CHECK', dims: ['CHECK', 'EXPLANATION'],
    q: ['Hafiz worked out 398 × 5 and got 19 900.\nWithout working it out fully, does his answer make sense?', 'Hafiz mengira 398 × 5 dan mendapat 19 900.\nTanpa mengira sepenuhnya, munasabahkah jawapannya?'],
    opts: [{ t: ['Yes — multiplying always makes a big number.', 'Ya — darab sentiasa beri nombor besar.'], err: 'CHECK', why: 'accepted an unreasonable answer' }, { t: ['Yes — it has the digits 9 and 0.', 'Ya — ada digit 9 dan 0.'], err: 'CHECK', why: 'accepted an unreasonable answer' }, { t: ['No — 398 is about 400, and 400 × 5 = 2 000, so 19 900 is far too big.', 'Tidak — 398 hampir 400, dan 400 × 5 = 2 000, jadi 19 900 terlalu besar.'], ok: true }, { t: ['No — the answer must end in 8.', 'Tidak — jawapan mesti berakhir dengan 8.'], err: 'KNOWLEDGE', why: 'faulty rule about last digits' }],
    hints: [['Round 398 to a friendly number first. What is that × 5?', 'Bundarkan 398 kepada nombor mudah dahulu. Berapa kali 5?']],
    show: [['398 ≈ 400. 400 × 5 = 2 000.', '398 ≈ 400. 400 × 5 = 2 000.'], ['19 900 is about 10 times too big — Hafiz made a place-value mistake. (398 × 5 = 1 990)', '19 900 kira-kira 10 kali terlalu besar — Hafiz silap nilai tempat. (398 × 5 = 1 990)']] },
  { id: 'B10', test: 'B', topic: 'Mixed operations', anchor: 'explaining', prereq: 'multiplication facts (Y2–3)', difficulty: 3, type: 'challenge', format: 'explain', stage: 'HOW', dims: ['EXPLANATION', 'PLAN'],
    q: ['Aina has 4 packets of karipap. Each packet has 6 karipap. She gives 5 karipap to her friends.\nIn your own words (or a number sentence), explain HOW you would find how many karipap she has left.', 'Aina ada 4 bungkus karipap. Setiap bungkus ada 6 biji. Dia memberi 5 biji kepada kawannya.\nDengan ayat sendiri (atau ayat matematik), terangkan BAGAIMANA mencari baki karipapnya.'],
    keys: [['4\\s*[x×*]\\s*6', '6\\s*[x×*]\\s*4', '\\b24\\b', 'times', 'darab', 'multiply', 'kali', '6\\s*\\+\\s*6'], ['\\b5\\b', 'tolak', 'minus', 'subtract', 'take away', 'give', 'beri', '\\b19\\b', '−|-']], answerText: ['4 × 6 = 24, then 24 − 5 = 19', '4 × 6 = 24, kemudian 24 − 5 = 19'],
    hints: [['First find how many karipap there are altogether. Then think about the 5 she gives away.', 'Cari dahulu jumlah semua karipap. Kemudian fikir tentang 5 biji yang diberi.']],
    show: [['Step 1: 4 packets × 6 = 24 karipap.', 'Langkah 1: 4 bungkus × 6 = 24 biji.'], ['Step 2: 24 − 5 = 19 karipap left.', 'Langkah 2: 24 − 5 = 19 biji tinggal.']] },

  /* ───────────── TEST C — PROBLEM SOLVER ───────────── */
  { id: 'C1', test: 'C', topic: 'One-step problems', anchor: 'word-problems', prereq: 'subtraction with regrouping (Y3)', difficulty: 1, type: 'core', format: 'mcq', stage: 'DO', dims: ['PLAN', 'UNDERSTAND', 'CALCULATION'], pair: { group: 'subtraction', kind: 'context' },
    q: ['Ali has 245 marbles. Ben has 512 marbles.\nHow many MORE marbles does Ben have than Ali?', 'Ali ada 245 biji guli. Ben ada 512 biji guli.\nBerapa biji guli LEBIH yang Ben ada berbanding Ali?'],
    opts: [{ t: ['757', '757'], err: 'PLAN', why: 'chose addition for how-many-more' }, { t: ['267', '267'], ok: true }, { t: ['333', '333'], err: 'CALCULATION', why: 'regrouping error (took smaller digit from larger)' }, { t: ['245', '245'], err: 'UNDERSTAND', why: 'copied a number from the question' }],
    hints: [['“How many more” compares two amounts. Find the difference.', '“Berapa lebih” membandingkan dua jumlah. Cari bezanya.']],
    show: [['512 − 245', '512 − 245'], ['= 267', '= 267']] },
  { id: 'C2', test: 'C', topic: 'Finding key information', anchor: 'key-info', prereq: 'reading a word problem (Y2–3)', difficulty: 1, type: 'core', format: 'mcq', stage: 'WHAT', chain: 'C-durian', dims: ['UNDERSTAND'],
    q: ['A durian seller in Kuching had 480 durians. He sold 125 in the morning and 210 in the afternoon. Each durian costs RM 15.\nQuestion: How many durians are LEFT?\nWHAT? Which information do you NOT need?', 'Seorang penjual durian di Kuching ada 480 biji durian. Dia menjual 125 biji pada waktu pagi dan 210 biji pada waktu petang. Sebiji durian berharga RM 15.\nSoalan: Berapa biji durian yang TINGGAL?\nAPA? Maklumat manakah yang TIDAK diperlukan?'],
    opts: [{ t: ['480 durians at the start', '480 biji durian pada mulanya'], err: 'UNDERSTAND', why: 'could not identify the key information' }, { t: ['125 sold in the morning', '125 biji dijual pagi'], err: 'UNDERSTAND', why: 'could not identify the key information' }, { t: ['210 sold in the afternoon', '210 biji dijual petang'], err: 'UNDERSTAND', why: 'could not identify the key information' }, { t: ['RM 15 for each durian', 'RM 15 sebiji'], ok: true }],
    hints: [['The question is about how many durians, not about money.', 'Soalan ini tentang bilangan durian, bukan tentang wang.']],
    show: [['We need: 480 at the start, 125 and 210 sold.', 'Kita perlukan: 480 pada mulanya, 125 dan 210 dijual.'], ['The price RM 15 is extra information.', 'Harga RM 15 ialah maklumat tambahan.']] },
  { id: 'C3', test: 'C', topic: 'Two-step problems', anchor: 'choose-op', prereq: 'meaning of subtraction (Y1–2)', difficulty: 2, type: 'core', format: 'mcq', stage: 'HOW', chain: 'C-durian', dims: ['PLAN', 'UNDERSTAND'],
    q: ['Durian seller: 480 durians, sold 125 in the morning and 210 in the afternoon.\nHOW? Which plan finds how many durians are LEFT?', 'Penjual durian: 480 biji, menjual 125 biji pagi dan 210 biji petang.\nBAGAIMANA? Rancangan manakah mencari berapa biji yang TINGGAL?'],
    opts: [{ t: ['480 + 125 + 210', '480 + 125 + 210'], err: 'PLAN', why: 'added everything (keyword guessing)' }, { t: ['480 − 125', '480 − 125'], err: 'UNDERSTAND', why: 'used only part of the information (missed the second step)' }, { t: ['480 − 125 − 210', '480 − 125 − 210'], ok: true }, { t: ['125 + 210', '125 + 210'], err: 'PLAN', why: 'found the total sold, not what is left' }],
    hints: [['Durians were sold twice. Each time, some were taken away from the 480.', 'Durian dijual dua kali. Setiap kali, sebahagian diambil daripada 480.']],
    show: [['Left = start − morning − afternoon', 'Tinggal = mula − pagi − petang'], ['480 − 125 − 210', '480 − 125 − 210']] },
  { id: 'C4', test: 'C', topic: 'Two-step problems', anchor: 'two-step', prereq: 'subtraction with regrouping (Y3)', difficulty: 2, type: 'core', format: 'number', stage: 'DO', chain: 'C-durian', dims: ['CALCULATION', 'UNDERSTAND'], pair: { group: 'subtraction', kind: 'context' },
    q: ['DO: How many durians are left?\n(480 at the start, sold 125 and 210)', 'BUAT: Berapa biji durian yang tinggal?\n(480 pada mulanya, dijual 125 dan 210)'],
    ans: 145, unit: ['durians', 'biji'], numErr: { 355: ['UNDERSTAND', 'stopped after step 1'], 270: ['UNDERSTAND', 'used only the afternoon sales'], 335: ['PLAN', 'found total sold instead of what is left'], 815: ['PLAN', 'added everything'], 155: ['CALCULATION', 'subtraction slip'], 245: ['CALCULATION', 'regrouping error'], 135: ['CALCULATION', 'subtraction slip'] },
    hints: [['First 480 − 125. Then take away 210 from that answer.', 'Mula-mula 480 − 125. Kemudian tolak 210 daripada jawapan itu.']],
    show: [['480 − 125 = 355', '480 − 125 = 355'], ['355 − 210 = 145 durians left', '355 − 210 = 145 biji tinggal']] },
  { id: 'C5', test: 'C', topic: 'Checking answers', anchor: 'reasonableness', prereq: 'comparing numbers (Y2)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'CHECK', chain: 'C-durian', dims: ['CHECK', 'EXPLANATION'],
    q: ['CHECK: Danial said there were 815 durians left.\nDoes his answer make sense?', 'SEMAK: Danial berkata ada 815 biji durian yang tinggal.\nMunasabahkah jawapannya?'],
    opts: [{ t: ['Yes — it is a big number, so it must be right.', 'Ya — nombornya besar, jadi mesti betul.'], err: 'CHECK', why: 'accepted an impossible answer' }, { t: ['No — he only had 480, so there cannot be more than 480 left.', 'Tidak — dia hanya ada 480, jadi baki tidak boleh lebih daripada 480.'], ok: true }, { t: ['Yes — he added correctly.', 'Ya — dia menambah dengan betul.'], err: 'CHECK', why: 'checked the working, not the sense of the answer' }, { t: ['No — the answer should be an even number.', 'Tidak — jawapan sepatutnya nombor genap.'], err: 'EXPLANATION', why: 'right conclusion, weak reason' }],
    hints: [['After selling, should the seller have MORE or FEWER durians than at the start?', 'Selepas menjual, penjual ada LEBIH atau KURANG durian berbanding pada mulanya?']],
    show: [['Selling takes durians away, so “left” must be less than 480.', 'Menjual mengurangkan durian, jadi “tinggal” mesti kurang daripada 480.'], ['815 is more than 480, so it cannot be right.', '815 lebih daripada 480, jadi ia tidak mungkin betul.']] },
  { id: 'C6', test: 'C', topic: 'Tables', anchor: 'tables-data', prereq: 'subtraction within 100 (Y2)', difficulty: 2, type: 'integration', format: 'mcq', stage: 'DO', dims: ['UNDERSTAND', 'PLAN'], pair: { group: 'subtraction', kind: 'context' },
    q: ['The table shows jars of Hari Raya cookies sold at a stall.\nHow many more jars were sold on the BEST day than on the WORST day?', 'Jadual menunjukkan balang kuih raya yang dijual di sebuah gerai.\nBerapa balang lebih dijual pada hari TERBAIK berbanding hari PALING SEDIKIT?'],
    table: { head: [['Day', 'Hari'], ['Jars sold', 'Balang dijual']], rows: [[['Monday', 'Isnin'], '48'], [['Tuesday', 'Selasa'], '36'], [['Wednesday', 'Rabu'], '52'], [['Thursday', 'Khamis'], '29']] },
    opts: [{ t: ['23', '23'], ok: true }, { t: ['81', '81'], err: 'PLAN', why: 'chose addition for how-many-more' }, { t: ['16', '16'], err: 'UNDERSTAND', why: 'read the wrong rows from the table' }, { t: ['165', '165'], err: 'UNDERSTAND', why: 'found the total instead of the difference' }],
    hints: [['Find the biggest number and the smallest number in the table first.', 'Cari nombor paling besar dan paling kecil dalam jadual dahulu.']],
    show: [['Best day: Wednesday 52. Worst day: Thursday 29.', 'Hari terbaik: Rabu 52. Paling sedikit: Khamis 29.'], ['52 − 29 = 23', '52 − 29 = 23']] },
  { id: 'C7', test: 'C', topic: 'Two-step problems', anchor: 'two-step', prereq: 'multiplication facts (Y2–3)', difficulty: 2, type: 'integration', format: 'number', stage: 'DO', dims: ['PLAN', 'UNDERSTAND', 'CALCULATION', 'CHECK'], pair: { group: 'multiplication', kind: 'context' },
    q: ['A box of kek lapis Sarawak costs RM 35. Mama buys 4 boxes and pays with RM 200.\nHow much change does she get?', 'Sekotak kek lapis Sarawak berharga RM 35. Mama membeli 4 kotak dan membayar RM 200.\nBerapakah baki wangnya?'],
    ans: 60, unit: ['RM', 'RM'], numErr: { 140: ['CHECK', 'stopped after step 1 (did not finish the question)'], 165: ['PLAN', 'used only one box (200 − 35)'], 340: ['PLAN', 'added instead of subtracting'], 70: ['CALCULATION', 'subtraction or multiplication slip'], 50: ['CALCULATION', 'subtraction slip'], 239: ['UNDERSTAND', 'added all the numbers'] },
    hints: [['Step 1: the cost of 4 boxes. Step 2: change from RM 200.', 'Langkah 1: harga 4 kotak. Langkah 2: baki daripada RM 200.']],
    show: [['4 × RM 35 = RM 140', '4 × RM 35 = RM 140'], ['RM 200 − RM 140 = RM 60', 'RM 200 − RM 140 = RM 60']] },
  { id: 'C8', test: 'C', topic: 'Explaining', anchor: 'explaining', prereq: 'meaning of subtraction as difference (Y1–2)', difficulty: 3, type: 'challenge', format: 'mcq', stage: 'HOW', dims: ['EXPLANATION', 'PLAN'],
    q: ['Nurul says: “When a question says HOW MANY MORE, you always add.”\nWhich is the best reply?', 'Nurul berkata: “Bila soalan tanya BERAPA LEBIH, kita mesti tambah.”\nPilih jawapan yang paling baik.'],
    opts: [{ t: ['She is right — “more” means add.', 'Dia betul — “lebih” bermaksud tambah.'], err: 'PLAN', why: 'believes keyword “more” means add' }, { t: ['She is right — adding makes the answer bigger.', 'Dia betul — tambah menjadikan jawapan lebih besar.'], err: 'PLAN', why: 'believes keyword “more” means add' }, { t: ['She is wrong — you multiply.', 'Dia salah — kita darab.'], err: 'EXPLANATION', why: 'right conclusion, wrong reason' }, { t: ['She is wrong — “how many more” compares two amounts, so we subtract to find the difference.', 'Dia salah — “berapa lebih” membandingkan dua jumlah, jadi kita tolak untuk mencari beza.'], ok: true }],
    hints: [['Think of Ali (245 marbles) and Ben (512). Did we add or find the difference?', 'Fikirkan Ali (245 guli) dan Ben (512). Kita tambah atau cari beza?']],
    show: [['“How many more” = the gap between two amounts.', '“Berapa lebih” = jurang antara dua jumlah.'], ['The gap is found by subtracting: bigger − smaller.', 'Jurang dicari dengan menolak: besar − kecil.']] },
  { id: 'C9', test: 'C', topic: 'Two-step problems', anchor: 'two-step', prereq: 'division facts (Y3)', difficulty: 3, type: 'challenge', format: 'numexplain', stage: 'DO', dims: ['PLAN', 'CALCULATION', 'EXPLANATION'],
    q: ['A ribbon 1 000 cm long is cut into 4 equal pieces. Then 30 cm is cut off ONE piece.\nHow long is that piece now? Write your answer, then explain your steps.', 'Seutas reben sepanjang 1 000 cm dipotong kepada 4 bahagian sama panjang. Kemudian 30 cm dipotong daripada SATU bahagian.\nBerapakah panjang bahagian itu sekarang? Tulis jawapan, kemudian terangkan langkahmu.'],
    ans: 220, unit: ['cm', 'cm'], numErr: { 250: ['UNDERSTAND', 'stopped after step 1'], 970: ['PLAN', 'subtracted 30 first and forgot to divide'], 242: ['PLAN', 'did the steps in the wrong order (970 ÷ 4)'], 880: ['UNDERSTAND', 'took 30 from every piece'], 230: ['CALCULATION', 'subtraction slip'], 210: ['CALCULATION', 'subtraction slip'] },
    keys: [['÷|/|divide|bahagi|\\b250\\b|4\\s*(equal|sama)|share'], ['30|tolak|minus|subtract|cut|potong|\\b220\\b|−|-']],
    hints: [['First: 1 000 cm shared into 4 equal pieces. How long is one piece?', 'Mula-mula: 1 000 cm dibahagi kepada 4 sama panjang. Berapa panjang satu bahagian?']],
    show: [['1 000 ÷ 4 = 250 cm', '1 000 ÷ 4 = 250 cm'], ['250 − 30 = 220 cm', '250 − 30 = 220 cm']] },
  { id: 'C10', test: 'C', topic: 'Proportion', anchor: 'proportion', prereq: 'times tables (Y2–3)', difficulty: 3, type: 'challenge', format: 'number', stage: 'HOW', dims: ['PLAN', 'UNDERSTAND', 'CALCULATION'],
    q: ['A kuih factory in Kuching makes 3 600 kuih in 4 days.\nAt the same rate, how many kuih does it make in 12 days?', 'Sebuah kilang kuih di Kuching membuat 3 600 biji kuih dalam 4 hari.\nPada kadar yang sama, berapa biji kuih dibuat dalam 12 hari?'],
    ans: 10800, unit: ['kuih', 'biji'], numErr: { 43200: ['PLAN', 'multiplied by 12 days instead of scaling 4 → 12 days'], 300: ['PLAN', 'divided by 12'], 14400: ['UNDERSTAND', 'multiplied by 4'], 3608: ['PLAN', 'added the days'], 900: ['UNDERSTAND', 'found one day only (stopped after step 1)'], 10600: ['CALCULATION', 'multiplication slip'] },
    hints: [['12 days is how many groups of 4 days?', '12 hari ialah berapa kumpulan 4 hari?']],
    show: [['12 ÷ 4 = 3, so 12 days is 3 times as long.', '12 ÷ 4 = 3, jadi 12 hari ialah 3 kali ganda.'], ['3 600 × 3 = 10 800 kuih', '3 600 × 3 = 10 800 biji']] },
  { id: 'C11', test: 'C', topic: 'Two-step problems', anchor: 'two-step', prereq: 'addition with regrouping (Y3)', difficulty: 2, type: 'integration', format: 'number', stage: 'DO', chain: 'C-bottles', dims: ['UNDERSTAND', 'PLAN', 'CALCULATION'],
    q: ['A shop in Miri sold 12 300 bottles of water in January.\nIn February it sold 4 600 MORE than in January.\nHow many bottles did it sell in February?', 'Sebuah kedai di Miri menjual 12 300 botol air pada bulan Januari.\nPada bulan Februari, kedai itu menjual 4 600 botol LEBIH daripada Januari.\nBerapa botol dijual pada bulan Februari?'],
    ans: 16900, unit: ['bottles', 'botol'], numErr: { 7700: ['UNDERSTAND', '“more than” read as subtract'], 4600: ['UNDERSTAND', 'copied a number from the question'], 16800: ['CALCULATION', 'addition slip'], 17900: ['CALCULATION', 'addition slip'] },
    hints: [['February = January’s amount AND 4 600 more on top.', 'Februari = jumlah Januari DAN 4 600 lagi.']],
    show: [['12 300 + 4 600', '12 300 + 4 600'], ['= 16 900 bottles', '= 16 900 botol']] },
  { id: 'C12', test: 'C', topic: 'Two-step problems', anchor: 'two-step', prereq: 'doubling (Y2)', difficulty: 3, type: 'challenge', format: 'number', stage: 'DO', chain: 'C-bottles', followOn: { from: 'C11', factor: 2 }, dims: ['UNDERSTAND', 'PLAN', 'CALCULATION'],
    q: ['In March the shop sold TWICE as many bottles as in February.\nUse your February answer. How many bottles did it sell in March?', 'Pada bulan Mac kedai itu menjual DUA KALI GANDA botol berbanding Februari.\nGuna jawapan Februari kamu. Berapa botol dijual pada bulan Mac?'],
    ans: 33800, unit: ['bottles', 'botol'], numErr: { 16902: ['UNDERSTAND', '“twice” read as + 2'], 24600: ['UNDERSTAND', 'used January instead of the earlier result'], 8450: ['PLAN', '“twice” read as halve'], 33600: ['CALCULATION', 'doubling slip'] },
    hints: [['Twice = 2 times. February × 2.', 'Dua kali ganda = darab 2. Februari × 2.']],
    show: [['February = 16 900', 'Februari = 16 900'], ['16 900 × 2 = 33 800 bottles', '16 900 × 2 = 33 800 botol']] },

  /* ───────────── TEST L — MATHS WORDS (language check) ─────────────
     Each item is shown in ENGLISH first. If missed, a BM version is served as a language probe,
     so we learn whether the maths or the English word was the barrier. */
  { id: 'L1', test: 'L', topic: 'Maths language', anchor: 'maths-language', phrase: ['subtract from', 'tolak daripada'], prereq: '', difficulty: 1, type: 'core', format: 'mcq', langItem: true, dims: ['UNDERSTAND'],
    q: ['Subtract 15 from 40.', 'Tolak 15 daripada 40.'],
    opts: [{ t: ['25', '25'], ok: true }, { t: ['55', '55'], err: 'UNDERSTAND', why: '“subtract from” not understood (added)' }, { t: ['15', '15'], err: 'UNDERSTAND', why: 'copied a number' }, { t: ['-25', '-25'], err: 'UNDERSTAND', why: 'subtracted in the wrong order (15 − 40)' }], hints: [['Start with 40. Take 15 away.', 'Mula dengan 40. Ambil 15.']] },
  { id: 'L2', test: 'L', topic: 'Maths language', anchor: 'maths-language', phrase: ['remaining', 'baki / tinggal'], prereq: '', difficulty: 1, type: 'core', format: 'mcq', langItem: true, dims: ['UNDERSTAND'],
    q: ['Amir had 60 stickers. He gave away 24.\nHow many stickers are remaining?', 'Amir ada 60 pelekat. Dia memberi 24 pelekat.\nBerapa pelekat yang tinggal?'],
    opts: [{ t: ['84', '84'], err: 'UNDERSTAND', why: '“remaining” not understood (added)' }, { t: ['36', '36'], ok: true }, { t: ['24', '24'], err: 'UNDERSTAND', why: 'copied a number' }, { t: ['60', '60'], err: 'UNDERSTAND', why: 'copied a number' }], hints: [['“Remaining” = what is left after giving some away.', '“Remaining” = baki selepas memberi.']] },
  { id: 'L3', test: 'L', topic: 'Maths language', anchor: 'maths-language', phrase: ['twice', 'dua kali ganda'], prereq: '', difficulty: 1, type: 'core', format: 'mcq', langItem: true, dims: ['UNDERSTAND'],
    q: ['What is twice 350?', 'Berapakah dua kali ganda 350?'],
    opts: [{ t: ['352', '352'], err: 'UNDERSTAND', why: '“twice” read as + 2' }, { t: ['175', '175'], err: 'UNDERSTAND', why: '“twice” read as half' }, { t: ['700', '700'], ok: true }, { t: ['3 502', '3 502'], err: 'UNDERSTAND', why: 'wrote a 2 next to the number' }], hints: [['Twice means 2 times.', 'Twice = 2 kali.']] },
  { id: 'L4', test: 'L', topic: 'Maths language', anchor: 'maths-language', phrase: ['more than', 'lebih daripada'], prereq: '', difficulty: 1, type: 'core', format: 'mcq', langItem: true, dims: ['UNDERSTAND'],
    q: ['What number is 300 more than 4 650?', 'Nombor manakah 300 lebih daripada 4 650?'],
    opts: [{ t: ['4 350', '4 350'], err: 'UNDERSTAND', why: '“more than” read as subtract' }, { t: ['4 950', '4 950'], ok: true }, { t: ['7 650', '7 650'], err: 'KNOWLEDGE', why: 'added in the wrong place' }, { t: ['4 653', '4 653'], err: 'KNOWLEDGE', why: 'added in the wrong place' }], hints: [['More than = bigger. Add 300.', 'Lebih daripada = lebih besar. Tambah 300.']] },
  { id: 'L5', test: 'L', topic: 'Maths language', anchor: 'maths-language', phrase: ['partition', 'cerakin'], prereq: '', difficulty: 1, type: 'core', format: 'mcq', langItem: true, dims: ['UNDERSTAND', 'KNOWLEDGE'],
    q: ['Partition 5 307 by place value.', 'Cerakinkan 5 307 mengikut nilai tempat.'],
    opts: [{ t: ['5 000 + 300 + 7', '5 000 + 300 + 7'], ok: true }, { t: ['5 000 + 300 + 70', '5 000 + 300 + 70'], err: 'KNOWLEDGE', why: 'place-value slip' }, { t: ['500 + 30 + 7', '500 + 30 + 7'], err: 'KNOWLEDGE', why: 'place-value slip' }, { t: ['5 + 3 + 0 + 7', '5 + 3 + 0 + 7'], err: 'UNDERSTAND', why: '“partition” not understood (split digits)' }], hints: [['Partition = split into thousands, hundreds, tens and ones.', 'Partition = pecahkan kepada ribu, ratus, puluh dan sa.']] },
  { id: 'L6', test: 'L', topic: 'Maths language', anchor: 'maths-language', phrase: ['each', 'setiap'], prereq: '', difficulty: 1, type: 'core', format: 'mcq', langItem: true, dims: ['UNDERSTAND'],
    q: ['There are 6 boxes. Each box has 25 pens.\nHow many pens are there?', 'Ada 6 kotak. Setiap kotak ada 25 batang pen.\nBerapa batang pen semuanya?'],
    opts: [{ t: ['31', '31'], err: 'UNDERSTAND', why: '“each” not understood (added)' }, { t: ['25', '25'], err: 'UNDERSTAND', why: 'copied a number' }, { t: ['19', '19'], err: 'UNDERSTAND', why: 'subtracted' }, { t: ['150', '150'], ok: true }], hints: [['Each box has 25 — and there are 6 boxes.', 'Setiap kotak ada 25 — dan ada 6 kotak.']] },
  { id: 'L7', test: 'L', topic: 'Maths language', anchor: 'maths-language', phrase: ['altogether', 'kesemuanya'], prereq: '', difficulty: 1, type: 'core', format: 'mcq', langItem: true, dims: ['UNDERSTAND'],
    q: ['Mira has RM 45 and Lina has RM 38.\nHow much money do they have altogether?', 'Mira ada RM 45 dan Lina ada RM 38.\nBerapakah jumlah wang mereka kesemuanya?'],
    opts: [{ t: ['RM 7', 'RM 7'], err: 'UNDERSTAND', why: '“altogether” not understood (subtracted)' }, { t: ['RM 83', 'RM 83'], ok: true }, { t: ['RM 45', 'RM 45'], err: 'UNDERSTAND', why: 'copied a number' }, { t: ['RM 73', 'RM 73'], err: 'CALCULATION', why: 'addition slip (did not carry)' }], hints: [['Altogether = put both amounts together.', 'Altogether = gabungkan kedua-dua jumlah.']] }

  /* Tests D, E, F: add questions here with test: 'D' | 'E' | 'F' and set ready: true in TESTS. */
];

FMQ.diag.questionsFor = function (testId) { return FMQ.diag.QUESTIONS.filter(function (q) { return q.test === testId; }); };
FMQ.diag.question = function (id) { return FMQ.diag.QUESTIONS.find(function (q) { return q.id === id; }); };
FMQ.diag.test = function (id) { return FMQ.diag.TESTS.find(function (t) { return t.id === id; }); };

/* ───────────── PREREQUISITE PROBES (Y2–3 step-down) ─────────────
   Served once, straight after a Y4 item is missed or answered "I don't know yet",
   to find where the foundation breaks. Recorded with isProbe: true. */
FMQ.diag.PROBES = [
  { id: 'P-PV3', topic: 'Place value (3-digit)', anchor: 'place-value', year: 2, format: 'mcq', q: ['What is the value of the digit 4 in 346?', 'Apakah nilai digit 4 dalam 346?'], opts: [{ t: ['40', '40'], ok: true }, { t: ['4', '4'], err: 'KNOWLEDGE', why: 'digit not value' }, { t: ['400', '400'], err: 'KNOWLEDGE', why: 'place-value slip' }] },
  { id: 'P-ZERO', topic: 'Zero as place holder (3-digit)', anchor: 'number-names', year: 2, format: 'number', q: ['Write the number: three hundred and seven', 'Tulis nombor: tiga ratus tujuh'], ans: 307, numErr: { 37: ['KNOWLEDGE', 'missing zero place-holder'], 3007: ['KNOWLEDGE', 'extra zero'] } },
  { id: 'P-EXP3', topic: 'Expanded form (3-digit)', anchor: 'expanded-form', year: 2, format: 'number', q: ['527 = 500 + ___ + 7', '527 = 500 + ___ + 7'], ans: 20, numErr: { 2: ['KNOWLEDGE', 'digit not value'], 200: ['KNOWLEDGE', 'place-value slip'] } },
  { id: 'P-CMP3', topic: 'Comparing 3-digit numbers', anchor: 'compare-order', year: 2, format: 'mcq', q: ['Which is bigger?', 'Manakah lebih besar?'], opts: [{ t: ['409', '409'], err: 'KNOWLEDGE', why: 'compared the ones first' }, { t: ['490', '490'], ok: true }] },
  { id: 'P-RND100', topic: 'Rounding to nearest hundred', anchor: 'rounding', year: 3, format: 'mcq', q: ['Round 268 to the nearest hundred.', 'Bundarkan 268 kepada ratus terdekat.'], opts: [{ t: ['200', '200'], err: 'KNOWLEDGE', why: 'rounding rule' }, { t: ['300', '300'], ok: true }, { t: ['270', '270'], err: 'UNDERSTAND', why: 'rounded to the nearest ten' }] },
  { id: 'P-STEP', topic: 'Counting in steps', anchor: 'patterns', year: 2, format: 'number', q: ['What comes next? 120, 130, 140, ___', 'Apakah seterusnya? 120, 130, 140, ___'], ans: 150, numErr: { 141: ['KNOWLEDGE', 'counted in ones'] } },
  { id: 'P-ADD3', topic: '3-digit addition with regrouping', anchor: 'addition', year: 3, format: 'number', q: ['457 + 286 = ?', '457 + 286 = ?'], ans: 743, numErr: { 633: ['CALCULATION', 'did not carry'], 733: ['CALCULATION', 'did not carry (tens)'], 643: ['CALCULATION', 'did not carry (hundreds)'] } },
  { id: 'P-SUB2', topic: '2-digit subtraction with borrowing', anchor: 'subtraction', year: 2, format: 'number', q: ['62 − 27 = ?', '62 − 27 = ?'], ans: 35, numErr: { 45: ['CALCULATION', 'took smaller digit from larger (no borrowing)'], 89: ['PLAN', 'added'] } },
  { id: 'P-TT', topic: 'Times tables', anchor: 'multiplication', year: 2, format: 'number', q: ['7 × 8 = ?', '7 × 8 = ?'], ans: 56, numErr: { 54: ['KNOWLEDGE', 'times-table fact'], 15: ['PLAN', 'added'] } },
  { id: 'P-TT2', topic: 'Times tables (×3 scaling)', anchor: 'proportion', year: 3, format: 'number', q: ['6 × 3 = ? and 60 × 3 = ?\nType the answer for 60 × 3.', '6 × 3 = ? dan 60 × 3 = ?\nTaip jawapan untuk 60 × 3.'], ans: 180, numErr: { 18: ['KNOWLEDGE', 'place-value when multiplying tens'], 63: ['PLAN', 'added'] } },
  { id: 'P-DIVS', topic: 'Short division', anchor: 'division', year: 3, format: 'number', q: ['84 ÷ 4 = ?', '84 ÷ 4 = ?'], ans: 21, numErr: { 2: ['KNOWLEDGE', 'missed a digit'], 12: ['KNOWLEDGE', 'reversed the digits'] } },
  { id: 'P-INV', topic: 'Missing factor (inverse)', anchor: 'inverse-ops', year: 3, format: 'number', q: ['□ × 5 = 40', '□ × 5 = 40'], ans: 8, numErr: { 200: ['PLAN', 'multiplied'], 35: ['PLAN', 'subtracted'] } },
  { id: 'P-DIFF', topic: '“How many more” (small numbers)', anchor: 'word-problems', year: 2, format: 'mcq', q: ['Ali has 15 sweets. Ben has 9 sweets.\nHow many more sweets does Ali have?', 'Ali ada 15 gula-gula. Ben ada 9 gula-gula.\nBerapa lebih gula-gula Ali?'], opts: [{ t: ['24', '24'], err: 'PLAN', why: 'chose addition for how-many-more' }, { t: ['6', '6'], ok: true }, { t: ['15', '15'], err: 'UNDERSTAND', why: 'copied a number' }] },
  { id: 'P-DOUBLE', topic: 'Doubling', anchor: 'two-step', year: 2, format: 'number', q: ['Double 45 = ?', 'Gandakan 45 = ?'], ans: 90, numErr: { 47: ['UNDERSTAND', 'double read as + 2'], 80: ['CALCULATION', 'did not carry'] } }
];
// Which Y2–3 probe each Y4 item steps down to.
FMQ.diag.PROBE_MAP = {
  A1: 'P-PV3', A2: 'P-ZERO', A3: 'P-EXP3', A4: 'P-CMP3', A5: 'P-RND100', A6: 'P-CMP3', A7: 'P-RND100', A8: 'P-STEP', A9: 'P-CMP3', A10: 'P-PV3',
  B1: 'P-ADD3', B2: 'P-SUB2', B3: 'P-TT', B4: 'P-DIVS', B5: 'P-DIFF', B6: 'P-DIVS', B7: 'P-DIVS', B8: 'P-SUB2', B11: 'P-INV', B9: 'P-RND100', B10: 'P-TT',
  C1: 'P-DIFF', C3: 'P-SUB2', C4: 'P-SUB2', C6: 'P-DIFF', C7: 'P-TT', C9: 'P-DIVS', C10: 'P-TT2', C11: 'P-ADD3', C12: 'P-DOUBLE'
};
// Language probes: each Test L item gets a BM-only twin.
FMQ.diag.QUESTIONS.filter(function (q) { return q.langItem; }).forEach(function (q) {
  FMQ.diag.PROBES.push(Object.assign({}, q, { id: q.id + '-bm', langItem: false, forceLang: 'bm', probeKind: 'language', year: 4 }));
  FMQ.diag.PROBE_MAP[q.id] = q.id + '-bm';
});
FMQ.diag.PROBES.forEach(function (p) { p.isProbe = true; p.probeKind = p.probeKind || 'prerequisite'; p.dims = p.dims || ['KNOWLEDGE']; p.type = p.type || 'core'; p.difficulty = p.difficulty || 1; p.prereq = p.prereq || ''; });
FMQ.diag.probe = function (id) { return FMQ.diag.PROBES.find(function (p) { return p.id === id; }); };

FMQ.diag.CONFIDENCE = [
  { v: 1, e: '😟', t: ['Worried', 'Risau'] }, { v: 2, e: '😕', t: ['Not sure', 'Kurang pasti'] }, { v: 3, e: '😐', t: ['Okay', 'Biasa'] },
  { v: 4, e: '🙂', t: ['Good', 'Baik'] }, { v: 5, e: '😄', t: ['Great!', 'Hebat!'] }
];

/* ───────────── SCHOOL EXAM BASELINE (parent-only evidence) ─────────────
   Pentaksiran Sumatif Year 4, Oct 2026 (English-medium). Item-level, source = school exam.
   The overall score is shown ONLY in the parent view, never to the child. */
FMQ.diag.EXAM = {
  id: 'exam-2026-10', source: 'school-exam', test: 'EXAM', status: 'complete',
  label: ['Baseline: School exam Oct 2026', 'Garis dasar: Peperiksaan sekolah Okt 2026'],
  startedAt: new Date('2026-10-01T09:00:00+08:00').getTime(), endedAt: new Date('2026-10-01T10:15:00+08:00').getTime(),
  score: '6/50', minutes: 75,
  note: ['Parents thought Y1–3 were average-to-good (unverified); decline over recent months.', 'Ibu bapa menyangka Tahun 1–3 sederhana-baik (belum disahkan); menurun beberapa bulan kebelakangan.'],
  items: [
    ['A-Q1', 'number-names', 'Words → numeral with zeros (78,005)', false],
    ['A-Q2', 'expanded-form', 'Partition 90,415', false],
    ['A-Q3', 'rounding', 'Round 62,748 to nearest thousand', false],
    ['A-Q4', 'addition', 'Multi-addend column addition (partial working)', false],
    ['A-Q5', 'mixed-ops', 'Bracket + subtraction (used addition wrongly)', false, 'PLAN'],
    ['A-Q6', 'multiplication', '4-digit × 2-digit', false],
    ['A-Q7', 'division', 'Long division with zero in quotient', false],
    ['A-Q8', 'inverse-ops', 'Inverse operation (W × 8 = 10,000)', false],
    ['A-Q9', 'proportion', 'Proportional scaling (10 → 30 days)', false],
    ['A-Q10', 'patterns', 'Step pattern, X + Y', false],
    ['B-Library(a)', 'two-step', 'Library: remaining books (3 marks)', true],
    ['B-Library(b)', 'two-step', 'Library: follow-on part', false],
    ['B-Biscuits(a)', 'division', 'Biscuits → packets', false],
    ['B-Biscuits(b)', 'two-step', 'Packets → containers (uses earlier result)', false],
    ['B-Masks', 'two-step', 'Masks: “more than”, “twice”, total', false, 'UNDERSTAND'],
    ['B-Laptops', 'two-step', 'Laptops: ×, remaining, ÷ (multi-step)', false]
  ],
  hypotheses: [
    { id: 'P1', t: ['Place value / number sense (digit position vs value, expanded form, rounding)', 'Nilai tempat / deria nombor (kedudukan vs nilai digit, cerakinan, membundar)'], skills: ['place-value', 'number-names', 'expanded-form', 'rounding', 'compare-order', 'patterns'] },
    { id: 'P2', t: ['Operations (addition consistency, borrowing, multiplication procedure, long division, inverse ops)', 'Operasi (ketekalan tambah, meminjam, prosedur darab, bahagi panjang, operasi songsang)'], skills: ['addition', 'subtraction', 'multiplication', 'division', 'inverse-ops', 'mixed-ops'] },
    { id: 'P3', t: ['Maths language (subtract from, remaining, twice, more than, partition) — check EN and BM', 'Bahasa matematik (subtract from, remaining, twice, more than, partition) — semak BI dan BM'], skills: ['maths-language'] },
    { id: 'P4', t: ['Word problems (choosing the operation, splitting 2-step, using earlier results)', 'Masalah berayat (memilih operasi, memecah 2 langkah, guna jawapan awal)'], skills: ['word-problems', 'two-step', 'choose-op', 'proportion', 'key-info'] },
    { id: 'P5', t: ['Confidence (do not assume anxiety — ask her)', 'Keyakinan (jangan anggap cemas — tanya dia)'], skills: [] }
  ]
};
