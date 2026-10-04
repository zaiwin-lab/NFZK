/* Sample progress history so the portal can be demonstrated immediately.
   Loaded only from Parent View → "Load sample history". It replays real question
   outcomes through the mastery engine, so every number shown is internally consistent.
   Code: I independent · C self-corrected · H1 one hint · H2 two+ hints · X explained · W wrong
   Flags: b = used Word Bridge · cf = used I'm Confused · t = changed (twin) question */
window.FMQ = window.FMQ || {};

FMQ.demoHistory = [
  { ago: 12, mode: 'diagnostic', focus: null, items: ['as-2:W:b', 'mon-1:W', 't24-2:I', 'du-2:W', 'pc-2:W', 'fr-2:W', 'ra-2:I', 'pe-2:W', 'ar-2:I', 'da-2:W'] },
  { ago: 11, focus: 'money',    items: ['td-1:I', 'as-1:I', 'mon-2:H1', 'mon-1:X:b', 'mon-5:H2:t', 'mon-3:W', 'dec-1:C', 'wp-1:X'] },
  { ago: 10, focus: 'money',    items: ['as-5:I', 'pv-1:I', 'mon-2:I', 'mon-4:H1', 'mon-5:H1:b', 'dec-4:I', 'wp-4:H2'] },
  { ago: 9,  focus: 'duration', items: ['mon-2:I', 'td-2:I', 'du-1:I', 'du-2:H2:b', 'du-5:X:t', 'du-4:C', 't24-1:I', 'wp-2:W'] },
  { ago: 7,  focus: 'percent',  items: ['du-1:I', 'as-3:I', 'pc-1:I', 'pc-2:H1', 'pc-3:I', 'fr-1:I', 'wp-3:H2'] },
  { ago: 6,  focus: 'fractions', items: ['pc-4:I', 'as-4:I:b', 'fr-4:I', 'fr-2:H2:cf', 'fr-3:X:t', 'td-5:I', 'wp-4:H1'] },
  { ago: 4,  focus: 'perimeter', items: ['fr-5:H1', 'td-3:I', 'pe-1:I', 'pe-2:C', 'pe-3:I', 'ar-1:I', 'wp-3:I'] },
  { ago: 3,  focus: 'money',    items: ['pe-4:I', 'td-4:I', 'mon-2:I', 'mon-4:I', 'mon-3:I', 'dec-1:I', 'wp-5:H1'] },
  { ago: 2,  focus: 'decimals', items: ['mon-5:I', 'pc-3:I', 'dec-4:I', 'dec-2:X', 'dec-5:H2:t', 'dec-3:W', 't24-3:I', 'wp-1:H1:b'] },
  { ago: 1,  focus: 'time24',   items: ['dec-1:I', 'as-2:H1:b', 't24-4:I', 't24-2:I', 't24-3:I', 'du-4:I', 'ar-2:I', 'wp-2:H1'] }
];

FMQ.loadDemo = function () {
  var U = FMQ.util, M = FMQ.mastery;
  var state = FMQ.store.fresh();
  state.profile.onboarded = true;
  state.profile.diagnosticDone = true;
  state.profile.demo = true;
  state.profile.startDay = U.addDays(U.dayKey(), -12);
  var today = U.dayKey();

  FMQ.demoHistory.forEach(function (d, di) {
    var day = U.addDays(today, -d.ago);
    var t0 = new Date(day + 'T16:05:00').getTime();
    var results = [], stars = 0;
    d.items.forEach(function (code, i) {
      var parts = code.split(':'), q = FMQ.question(parts[0]), o = parts[1], flags = parts.slice(2);
      var wrongCat = q.wrong ? q.wrong[Object.keys(q.wrong)[0]][0] : 'CONCEPT';
      var a = {
        qid: q.id, skill: q.skill, level: q.level, mode: d.mode || 'quest', section: d.mode === 'diagnostic' ? 'diag' : 'skill',
        changed: flags.indexOf('t') >= 0 || q.level >= 3,
        correct: o !== 'W' && o !== 'X', firstTry: o !== 'C', tries: o === 'C' ? 2 : 1,
        hints: o === 'H1' ? 1 : o === 'H2' ? 2 : o === 'X' ? 3 : 0,
        explained: o === 'X', bridge: flags.indexOf('b') >= 0, confused: flags.indexOf('cf') >= 0,
        triedAlone: o === 'W', errorCat: (o === 'W' || o === 'X' || o === 'C') ? wrongCat : null,
        ts: t0 + i * 130000, day: day
      };
      var r = M.record(state, a);
      stars += r.stars;
      results.push({ skill: a.skill, correct: a.correct, explained: a.explained, hints: a.hints, outcome: r.outcome, comeback: r.comeback, mastered: r.mastered, wordWins: r.wordWins });
    });
    var strengthened = [], needed = [], comebacks = [], mastered = [], words = [];
    results.forEach(function (r) {
      if (r.correct && !r.explained && strengthened.indexOf(r.skill) < 0) strengthened.push(r.skill);
      if (r.hints || r.explained) needed.push({ skill: r.skill, hints: r.hints, explained: r.explained });
      if (r.comeback) comebacks.push(r.skill);
      if (r.mastered) mastered.push(r.skill);
      r.wordWins.forEach(function (w) { if (words.indexOf(w) < 0) words.push(w); });
    });
    // Put the day's focus first so "Yesterday you became stronger at…" names the main skill.
    if (d.focus && strengthened.indexOf(d.focus) > 0) { strengthened.splice(strengthened.indexOf(d.focus), 1); strengthened.unshift(d.focus); }
    var next = FMQ.demoHistory[di + 1];
    state.sessions.push({
      id: 'demo-' + d.ago, mode: d.mode || 'quest', day: day, start: t0, end: t0 + d.items.length * 130000,
      minutes: 13 + (d.items.length % 5) + (d.ago % 3), focus: d.focus, questions: results.length,
      independent: results.filter(function (r) { return r.outcome === 'independent'; }).length,
      strengthened: strengthened, needed: needed, comebacks: comebacks, mastered: mastered, improvedWords: words,
      stars: stars, next: next ? next.focus : null
    });
  });
  state.lastVisitDay = U.addDays(today, -1);
  FMQ.store.replace(state);
  return state;
};
