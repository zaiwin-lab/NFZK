/* Analytics for the child progress page and the parent dashboard.
   Always "Fathiya today vs Fathiya before" — never compared with anyone else. */
window.FMQ = window.FMQ || {};

FMQ.analytics = (function () {
  var U = FMQ.util, M = FMQ.mastery;

  function inRange(a, from, to) { return a.day >= from && a.day <= to; }
  function sn(id) { var s = FMQ.skill(id); return s ? s.name : id; }

  function stats(state, from, to) {
    var at = state.attempts.filter(function (a) { return inRange(a, from, to); });
    var n = at.length;
    var o = function (k) { return at.filter(function (a) { return M.outcomeOf(a) === k; }).length; };
    var changed = at.filter(function (a) { return a.changed || a.level >= 3; });
    var sessions = state.sessions.filter(function (s) { return s.day >= from && s.day <= to && s.mode !== 'demo'; });
    var cats = {};
    at.forEach(function (a) { if (a.errorCat) cats[a.errorCat] = (cats[a.errorCat] || 0) + 1; });
    var repeated = Object.keys(cats).reduce(function (s, k) { return s + Math.max(0, cats[k] - 1); }, 0);
    var words = state.events.filter(function (e) { return e.type === 'word' && e.day >= from && e.day <= to; }).length;
    return {
      questions: n,
      independent: o('independent'),
      independentRate: n ? o('independent') / n : 0,
      hinted: at.filter(function (a) { return a.hints > 0; }).length,
      hints: at.reduce(function (s, a) { return s + (a.hints || 0); }, 0),
      explained: o('explained'),
      bridge: at.filter(function (a) { return a.bridge; }).length,
      confused: at.filter(function (a) { return a.confused; }).length,
      changed: changed.length,
      changedWins: changed.filter(function (a) { return a.correct && !a.explained && a.hints === 0; }).length,
      sessions: sessions.length,
      minutes: sessions.reduce(function (s, x) { return s + (x.minutes || 0); }, 0),
      wordWins: words,
      repeated: repeated,
      cats: cats,
      comebacks: state.events.filter(function (e) { return e.type === 'comeback' && e.day >= from && e.day <= to; }).length
    };
  }

  function weeks(state) {
    var today = U.dayKey();
    return {
      now: stats(state, U.addDays(today, -6), today),
      before: stats(state, U.addDays(today, -13), U.addDays(today, -7))
    };
  }

  // "Fathiya today vs Fathiya before"
  function selfCompare(state) {
    var w = weeks(state), lines = [];
    var a = w.now, b = w.before;
    if (!b.questions) return { lines: [], first: true };
    if (a.independentRate > b.independentRate + 0.04) lines.push({ dir: 'up', text: 'More questions solved without hints' });
    if (a.wordWins > 0) lines.push({ dir: 'up', text: 'Better understanding of English Maths words' });
    if (a.changedWins > b.changedWins) lines.push({ dir: 'up', text: 'More success on changed questions' });
    if (a.repeated < b.repeated) lines.push({ dir: 'down', text: 'Fewer repeated errors' });
    if (a.questions && a.hints / a.questions < (b.hints / Math.max(1, b.questions)) - 0.05) lines.push({ dir: 'down', text: 'Fewer hints needed' });
    if (a.comebacks > 0) lines.push({ dir: 'up', text: a.comebacks + ' Comeback Win' + (a.comebacks > 1 ? 's' : '') });
    return { lines: lines, first: false };
  }

  function streak(state) {
    var days = {};
    state.sessions.forEach(function (s) { if (s.mode === 'quest' || s.mode === 'diagnostic') days[s.day] = true; });
    var d = U.dayKey(), n = 0;
    if (!days[d]) d = U.addDays(d, -1); // today not done yet: streak still counts up to yesterday
    while (days[d]) { n++; d = U.addDays(d, -1); }
    return { current: n, total: Object.keys(days).length };
  }

  function skillGroups(state) {
    var st = M.allStates(state), g = { secure: [], building: [], practise: [], unknown: [] };
    FMQ.curriculum.skills.forEach(function (s) { g[st[s.id]].push(s); });
    return g;
  }

  function vocabList(state) {
    return Object.keys(state.vocab).map(function (w) {
      var v = state.vocab[w];
      return { word: w, status: M.vocabStatus(state, w), bridged: v.bridged, seen: v.seen, bm: (FMQ.vocab[w] || {}).bm };
    }).sort(function (a, b) {
      var r = { known: 0, growing: 1, 'new': 2 };
      return r[a.status] - r[b.status] || b.seen - a.seen;
    });
  }

  function errorPatterns(state, days) {
    var from = U.addDays(U.dayKey(), -(days || 14));
    var by = {};
    state.attempts.forEach(function (a) {
      if (!a.errorCat || a.day < from) return;
      var e = by[a.errorCat] || (by[a.errorCat] = { cat: a.errorCat, count: 0, skills: {} });
      e.count++; e.skills[a.skill] = (e.skills[a.skill] || 0) + 1;
    });
    return Object.keys(by).map(function (k) {
      var e = by[k];
      e.topSkills = Object.keys(e.skills).sort(function (x, y) { return e.skills[y] - e.skills[x]; }).slice(0, 2);
      return e;
    }).sort(function (a, b) { return b.count - a.count; });
  }

  function observations(state) {
    var out = [], name = FMQ.learner.name;
    if (state.attempts.length < 6) return ['Not enough evidence yet. After two or three quests, ' + FMQ.learner.buddy + ' will describe patterns here.'];
    var from = U.addDays(U.dayKey(), -14);
    var bySkill = {};
    state.attempts.forEach(function (a) {
      if (a.day < from || !a.errorCat) return;
      var s = bySkill[a.skill] || (bySkill[a.skill] = {});
      s[a.errorCat] = (s[a.errorCat] || 0) + 1;
    });
    Object.keys(bySkill).forEach(function (sid) {
      var cats = bySkill[sid], top = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; })[0];
      if (cats[top] < 2 || out.length >= 2) return;
      var n = sn(sid);
      var words = (FMQ.questions.filter(function (q) { return q.skill === sid; }).reduce(function (w, q) { return w.concat(q.vocab || []); }, []))
        .filter(function (w) { return state.vocab[w] && M.vocabStatus(state, w) !== 'known'; });
      if (top === 'EXECUTE') out.push(name + ' usually chooses the right method in ' + n.toLowerCase() + ' but sometimes makes calculation slips. Encourage the CHECK step rather than reteaching the topic.');
      else if (top === 'UNDERSTAND') out.push(name + ' can calculate in ' + n.toLowerCase() + ' but sometimes misreads what the question asks' + (words[0] ? ' (for example ‘' + words[0] + '’)' : '') + '. Continue contextual questions with Maths-English vocabulary support.');
      else if (top === 'CONCEPT') out.push('The idea behind ' + n.toLowerCase() + ' is still developing. Short visual explanations followed by a changed question are working best.');
      else if (top === 'PLAN') out.push('In ' + n.toLowerCase() + ', ' + name + ' sometimes picks the wrong operation. Practise deciding WHAT the question asks and HOW to solve it before calculating.');
      else if (top === 'CHECK') out.push('In ' + n.toLowerCase() + ', answers are close but units or the final check are missed. Ask: “Did I answer the actual question?”');
    });
    var cb = state.events.filter(function (e) { return e.type === 'comeback'; }).slice(-1)[0];
    if (cb) out.push(name + '’s ' + sn(cb.skill).toLowerCase() + ' improved after support: she later solved a changed question independently. Reassess later using a word problem.');
    var vl = vocabList(state).filter(function (v) { return v.status !== 'known' && v.bridged >= 2; }).slice(0, 2);
    if (vl.length) out.push('Still uses Bahasa support for ‘' + vl.map(function (v) { return v.word; }).join('’ and ‘') + '’. Support is fading automatically as she meets these words again.');
    if (!out.length) out.push(name + ' is working steadily with little help. Keep sessions short and let the changed questions confirm what is secure.');
    return out.slice(0, 4);
  }

  function recommendation(state) {
    var c = FMQ.quest.chooseFocus(state);
    var s = FMQ.skill(c.focus);
    var why = c.stepBackFrom
      ? 'Strengthen ' + s.name.toLowerCase() + ' first, because ' + FMQ.skill(c.stepBackFrom).name.toLowerCase() + ' depends on it.'
      : (M.computeState(state, c.focus) === 'unknown' ? 'Not yet assessed, and it is part of the current Year 4 priorities.' : 'Still building. A changed question will confirm whether the idea has transferred.');
    return { skill: s, why: why };
  }

  /* Session summary — written when a quest ends. */
  function summarise(state, quest) {
    var res = quest.results, end = Date.now();
    var strengthened = [], needed = [], comebacks = [], mastered = [], words = [];
    res.forEach(function (r) {
      if (r.correct && !r.explained && strengthened.indexOf(r.skill) < 0) strengthened.push(r.skill);
      if (r.hints || r.explained) needed.push({ skill: r.skill, hints: r.hints, explained: r.explained });
      if (r.comeback) comebacks.push(r.skill);
      if (r.mastered) mastered.push(r.skill);
      (r.wordWins || []).forEach(function (w) { if (words.indexOf(w) < 0) words.push(w); });
    });
    var minutes = Math.max(1, Math.round((end - quest.startedAt) / 60000));
    var next = quest.mode === 'demo' ? null : FMQ.quest.nextFocusAfter(state, quest);
    return {
      id: quest.id, mode: quest.mode, day: quest.day, start: quest.startedAt, end: end, minutes: minutes,
      focus: quest.focus || null, stepBackFrom: quest.stepBackFrom || null,
      questions: res.length, independent: res.filter(function (r) { return r.outcome === 'independent'; }).length,
      strengthened: strengthened, needed: needed, comebacks: comebacks, mastered: mastered, improvedWords: words,
      stars: quest.stars, next: next
    };
  }

  return {
    stats: stats, weeks: weeks, selfCompare: selfCompare, streak: streak, skillGroups: skillGroups,
    vocabList: vocabList, errorPatterns: errorPatterns, observations: observations,
    recommendation: recommendation, summarise: summarise
  };
})();
