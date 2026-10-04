/* The 12-week journey.
   Each week has a theme the child can look forward to. The engine still adapts every day:
   it steps back to missing foundations, skips skills that are already secure and keeps
   spaced review going. The plan only gives each week a direction.
   Weeks 6 and 12 open with a Checkpoint that compares the child with her own first diagnostic. */
window.FMQ = window.FMQ || {};

FMQ.plan = {
  weeks: [
    { n: 1,  title: 'Number Builders',  titleBm: 'Pembina Nombor',      icon: '🧱', skills: ['basic-facts', 'place-value', 'add-sub'], goal: 'Strong number foundations and words like total, difference and altogether.', goalBm: 'Asas nombor yang kukuh dan perkataan seperti jumlah, beza dan jumlah keseluruhan.' },
    { n: 2,  title: 'Money Smart',      titleBm: 'Bijak Wang',          icon: '💵', skills: ['decimals', 'money'],                     goal: 'Decimal subtraction and real shopping problems: change, remaining, total.', goalBm: 'Tolak perpuluhan dan masalah membeli-belah: baki wang, baki, jumlah.' },
    { n: 3,  title: 'Time Explorer',    titleBm: 'Penjelajah Masa',     icon: '🕐', skills: ['clock', 'time24', 'duration'],           goal: 'Reading the clock, 24-hour time and how long things take.', goalBm: 'Membaca jam, sistem 24 jam dan tempoh masa.' },
    { n: 4,  title: 'Fraction Friends', titleBm: 'Kawan Pecahan',       icon: '🍕', skills: ['times-tables', 'fractions', 'times-divide'], goal: 'Times tables, equal parts, fractions of amounts and sharing.', goalBm: 'Sifir, bahagian sama besar, pecahan daripada kuantiti dan bahagi.' },
    { n: 5,  title: 'Percent Power',    titleBm: 'Kuasa Peratus',       icon: '💯', skills: ['percent', 'fractions'],                 goal: 'From fractions to percentages, out of 100.', goalBm: 'Daripada pecahan kepada peratus, daripada 100.' },
    { n: 6,  title: 'Shape Up',         titleBm: 'Bentuk Hebat',        icon: '🔲', skills: ['perimeter', 'area'],                    goal: 'Around the edge or the space inside? Perimeter and area.', goalBm: 'Di sekeliling tepi atau ruang di dalam? Perimeter dan luas.', checkpoint: 1 },
    { n: 7,  title: 'Measure It',       titleBm: 'Jom Ukur',            icon: '📏', skills: ['measure', 'decimals'],                  goal: 'Length, mass and volume, and changing units.', goalBm: 'Panjang, jisim dan isi padu, serta menukar unit.' },
    { n: 8,  title: 'Ratio Ranger',     titleBm: 'Wira Nisbah',         icon: '⚖️', skills: ['ratio', 'times-divide'],                goal: 'Comparing amounts with ratio and “for every”.', goalBm: 'Membandingkan kuantiti dengan nisbah dan “bagi setiap”.' },
    { n: 9,  title: 'Data Detective',   titleBm: 'Detektif Data',       icon: '📊', skills: ['data'],                                 goal: 'Reading pictographs, tables and bar charts.', goalBm: 'Membaca piktograf, jadual dan carta palang.' },
    { n: 10, title: 'Shapes & Grids',   titleBm: 'Bentuk & Grid',       icon: '📐', skills: ['shapes', 'coordinates'],                goal: 'Angles, lines, solid shapes and coordinates.', goalBm: 'Sudut, garis, bentuk tiga dimensi dan koordinat.' },
    { n: 11, title: 'Problem Solver',   titleBm: 'Penyelesai Masalah',  icon: '🧩', skills: ['word-problems', 'money', 'duration'],   goal: 'Two-step problems: WHAT? HOW? DO. CHECK.', goalBm: 'Masalah dua langkah: APA? BAGAIMANA? BUAT. SEMAK.' },
    { n: 12, title: 'Grand Review',     titleBm: 'Ulang Kaji Besar',    icon: '🏆', skills: [],                                       goal: 'Everything together, then the final Checkpoint.', goalBm: 'Semua sekali, kemudian Semakan akhir.', checkpoint: 2 }
  ],

  milestones: [5, 10, 20, 30, 45, 60, 75, 90]
};

FMQ.planInfo = function (state) {
  var U = FMQ.util, today = U.dayKey();
  var start = state.profile.startDay || today;
  var day = Math.max(0, U.daysBetween(start, today));
  var wk = Math.floor(day / 7) + 1;
  var inPlan = wk <= 12;
  var week = FMQ.plan.weeks[Math.min(wk, 12) - 1];
  var weekStart = U.addDays(start, (wk - 1) * 7);
  var questDays = {};
  state.sessions.forEach(function (s) { if (s.mode === 'quest' || s.mode === 'checkpoint' || s.mode === 'diagnostic') questDays[s.day] = s; });
  var daysThisWeek = 0;
  for (var i = 0; i < 7; i++) if (questDays[U.addDays(weekStart, i)]) daysThisWeek++;
  return {
    start: start, day: day, weekNo: wk, inPlan: inPlan, week: week, weekStart: weekStart,
    dayOfWeek: day % 7, daysThisWeek: daysThisWeek, goal: FMQ.learner.weeklyGoal || 5,
    // After week 12 the portal keeps going in "bonus weeks" that cycle through review.
    bonus: !inPlan
  };
};

// Days completed in a given plan week (1-based).
FMQ.weekDays = function (state, wk) {
  var U = FMQ.util, start = state.profile.startDay || U.dayKey(), ws = U.addDays(start, (wk - 1) * 7), n = 0;
  var days = {};
  state.sessions.forEach(function (s) { if (s.mode === 'quest' || s.mode === 'checkpoint' || s.mode === 'diagnostic') days[s.day] = 1; });
  for (var i = 0; i < 7; i++) if (days[U.addDays(ws, i)]) n++;
  return n;
};
