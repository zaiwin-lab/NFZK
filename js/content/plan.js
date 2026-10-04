/* The 12-week journey.
   Each week has a theme the child can look forward to. The engine still adapts every day:
   it steps back to missing foundations, skips skills that are already secure and keeps
   spaced review going. The plan only gives each week a direction.
   Weeks 6 and 12 open with a Checkpoint that compares the child with her own first diagnostic. */
window.FMQ = window.FMQ || {};

FMQ.plan = {
  weeks: [
    { n: 1,  title: 'Number Builders',  icon: '🧱', skills: ['place-value', 'add-sub'],        goal: 'Strong number foundations and words like total, difference and altogether.' },
    { n: 2,  title: 'Money Smart',      icon: '💵', skills: ['decimals', 'money'],             goal: 'Decimal subtraction and real shopping problems: change, remaining, total.' },
    { n: 3,  title: 'Time Explorer',    icon: '🕐', skills: ['time24', 'duration'],            goal: '24-hour time and how long things take.' },
    { n: 4,  title: 'Fraction Friends', icon: '🍕', skills: ['fractions', 'times-divide'],     goal: 'Equal parts, fractions of amounts and sharing.' },
    { n: 5,  title: 'Percent Power',    icon: '💯', skills: ['percent', 'fractions'],          goal: 'From fractions to percentages, out of 100.' },
    { n: 6,  title: 'Shape Up',         icon: '🔲', skills: ['perimeter', 'area'],             goal: 'Around the edge or the space inside? Perimeter and area.', checkpoint: 1 },
    { n: 7,  title: 'Measure It',       icon: '📏', skills: ['measure', 'decimals'],           goal: 'Length, mass and volume, and changing units.' },
    { n: 8,  title: 'Ratio Ranger',     icon: '⚖️', skills: ['ratio', 'times-divide'],         goal: 'Comparing amounts with ratio and “for every”.' },
    { n: 9,  title: 'Data Detective',   icon: '📊', skills: ['data'],                          goal: 'Reading pictographs, tables and bar charts.' },
    { n: 10, title: 'Shapes & Grids',   icon: '📐', skills: ['shapes', 'coordinates'],         goal: 'Angles, lines, solid shapes and coordinates.' },
    { n: 11, title: 'Problem Solver',   icon: '🧩', skills: ['word-problems', 'money', 'duration'], goal: 'Two-step problems: WHAT? HOW? DO. CHECK.' },
    { n: 12, title: 'Grand Review',     icon: '🏆', skills: [],                                goal: 'Everything together, then the final Checkpoint.', checkpoint: 2 }
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
