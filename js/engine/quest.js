/* Daily Quest generator and in-session adaptation.
   Structure: Easy Start (2) → Today's Skill (3) → Foundation Fix (1–2) → Mini Boss (1) → Victory.
   The session always ends. Repairs (changed questions) are capped so struggling never
   means "more questions". */
window.FMQ = window.FMQ || {};

FMQ.diagnosticSet = ['as-2', 'mon-1', 't24-2', 'du-2', 'pc-2', 'fr-2', 'ra-2', 'pe-2', 'ar-2', 'da-2'];

// Preferred changed questions for reassessment (same idea, different situation).
FMQ.twins = {
  'mon-1': ['mon-5', 'mon-3'], 'mon-2': ['mon-4'], 'mon-4': ['wp-5', 'mon-2'],
  'as-2': ['as-3', 'as-4'], 'as-1': ['as-5'], 'as-5': ['da-5'],
  'fr-2': ['fr-3', 'fr-5'], 'fr-1': ['fr-4'],
  'pc-2': ['pc-3', 'pc-5'], 'pc-1': ['pc-4'],
  'dec-2': ['dec-3', 'dec-5'], 'dec-1': ['dec-5'],
  't24-2': ['t24-3', 't24-1'], 'du-2': ['du-5', 'du-3'], 'du-4': ['du-1'],
  'pe-2': ['pe-3', 'pe-1'], 'ar-2': ['ar-3', 'ar-4'], 'ar-1': ['ar-2'],
  'ra-2': ['ra-3'], 'ra-1': ['ra-4'], 'da-2': ['da-3'], 'da-1': ['da-2'],
  'me-2': ['me-3'], 'td-2': ['td-5'], 'td-1': ['td-3'], 'pv-1': ['pv-3']
};

FMQ.sections = {
  easy:  { title: 'Easy Start',      intro: 'Two quick ones to warm up.' },
  skill: { title: 'Today’s Skill',   intro: 'Now our main skill for today.' },
  fix:   { title: 'Foundation Fix',  intro: 'Let’s strengthen one building block 🌱.' },
  boss:  { title: 'Mini Boss',       intro: 'One thinking question. Take your time.' },
  diag:  { title: 'Getting to know you', intro: '' },
  practice: { title: 'Practice', intro: '' },
  demo:  { title: 'Sample', intro: '' }
};

FMQ.quest = (function () {
  var U = FMQ.util, M = FMQ.mastery;
  var MAX_REPAIRS = 2;

  function pickQuestion(state, skillId, level, exclude, seen) {
    seen = seen || M.lastSeenMap(state);
    var pool = FMQ.questions.filter(function (q) { return q.skill === skillId && exclude.indexOf(q.id) < 0; });
    if (!pool.length) return null;
    pool.sort(function (a, b) {
      var d = Math.abs(a.level - level) - Math.abs(b.level - level);
      if (d) return d;
      return (seen[a.id] || 0) - (seen[b.id] || 0);
    });
    return pool[0];
  }

  function pickTwin(state, q, used) {
    var pref = (FMQ.twins[q.id] || []).filter(function (id) { return used.indexOf(id) < 0; });
    if (pref.length) return FMQ.question(pref[0]);
    var lvl = q.level >= 4 ? 4 : Math.min(3, q.level + 1);
    return pickQuestion(state, q.skill, lvl, used.concat([q.id]));
  }

  function hasEvidence(state, skillId) { return M.attemptsFor(state, skillId).length > 0; }

  function chooseFocus(state, opts) {
    opts = opts || {};
    var states = M.allStates(state);
    var pri = FMQ.learner.priorities;
    var lastFocus = opts.avoid || (state.sessions.filter(function (s) { return s.mode === 'quest'; }).slice(-1)[0] || {}).focus;
    var best = null;
    FMQ.curriculum.skills.forEach(function (s) {
      if (s.id === 'word-problems') return;
      var st = states[s.id];
      if (st === 'secure') return;
      var score = 0;
      var pi = pri.indexOf(s.id);
      if (pi >= 0) score += 20 - pi;
      var atts = M.attemptsFor(state, s.id);
      var last = atts[atts.length - 1];
      if (st === 'building' && last && (last.hints > 0 || last.explained || !last.correct)) score += 12; // repaired, needs reassessment
      if (st === 'practise') score += 10;
      if (st === 'unknown') score += 4;
      if (state.skills[s.id] && state.skills[s.id].gap) score += 6;
      score += (16 - s.order) * 0.3;
      if (s.id === lastFocus) score -= 14; // revisit through spaced retrieval instead
      if (!best || score > best.score) best = { id: s.id, score: score };
    });
    var focus = best ? best.id : 'word-problems';
    // Step backward when a prerequisite is clearly missing.
    var sk = FMQ.skill(focus), stepBack = null;
    var gap = (sk.prereqs || []).find(function (p) { return states[p] === 'practise' && hasEvidence(state, p); });
    if (gap) { stepBack = focus; focus = gap; }
    return { focus: focus, stepBackFrom: stepBack, states: states };
  }

  function buildDaily(state) {
    var seen = M.lastSeenMap(state);
    var pick = chooseFocus(state);
    var focus = pick.focus, states = pick.states;
    var used = [], items = [];
    function add(q, section, extra) {
      if (!q) return;
      used.push(q.id);
      items.push(Object.assign({ qid: q.id, skill: q.skill, level: q.level, section: section, changed: q.level >= 3 }, extra || {}));
    }

    // A. Easy Start — spaced retrieval from recent / secure skills.
    var prevFocus = (state.sessions.filter(function (s) { return s.mode === 'quest'; }).slice(-1)[0] || {}).focus;
    var easyPool = [];
    if (prevFocus && prevFocus !== focus && prevFocus !== 'word-problems') easyPool.push(prevFocus);
    FMQ.curriculum.skills.forEach(function (s) {
      if (s.id !== focus && s.id !== 'word-problems' && (states[s.id] === 'secure' || states[s.id] === 'building') && easyPool.indexOf(s.id) < 0) easyPool.push(s.id);
    });
    // Prefer the least-recently practised for spacing.
    var lastTs = {};
    state.attempts.forEach(function (a) { lastTs[a.skill] = a.ts; });
    var head = easyPool.slice(0, 1);
    var rest = easyPool.slice(1).sort(function (a, b) { return (lastTs[a] || 0) - (lastTs[b] || 0); });
    easyPool = head.concat(rest);
    ['add-sub', 'times-divide', 'place-value'].forEach(function (id) { if (easyPool.indexOf(id) < 0 && id !== focus) easyPool.push(id); });
    easyPool.slice(0, 2).forEach(function (sid) {
      add(pickQuestion(state, sid, states[sid] === 'secure' ? 2 : 1, used, seen), 'easy', { changed: false });
    });

    // B. Today's Skill — foundation → normal → changed context.
    [1, 2, 3].forEach(function (lvl) { add(pickQuestion(state, focus, lvl, used, seen), 'skill'); });

    // C. Foundation Fix — a prerequisite or earlier gap.
    var fixSkill = null;
    var fsk = FMQ.skill(pick.stepBackFrom || focus);
    fixSkill = (fsk.prereqs || []).find(function (p) { return p !== focus && states[p] !== 'secure'; });
    if (!fixSkill) {
      fixSkill = FMQ.curriculum.skills.map(function (s) { return s.id; }).find(function (id) {
        return id !== focus && id !== 'word-problems' && state.skills[id] && state.skills[id].gap;
      });
    }
    if (!fixSkill) {
      fixSkill = FMQ.learner.priorities.find(function (id) { return id !== focus && id !== 'word-problems' && states[id] !== 'secure' && easyPool.slice(0, 2).indexOf(id) < 0; });
    }
    if (fixSkill) add(pickQuestion(state, fixSkill, 1, used, seen), 'fix');

    // D. Mini Boss — multi-step, linked to today's work when possible.
    var bosses = FMQ.questions.filter(function (q) { return q.level === 4 && used.indexOf(q.id) < 0; });
    bosses.sort(function (a, b) {
      var ra = (a.related || []).indexOf(focus) >= 0 ? 0 : 1, rb = (b.related || []).indexOf(focus) >= 0 ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return (seen[a.id] || 0) - (seen[b.id] || 0);
    });
    if (bosses[0]) add(bosses[0], 'boss', { changed: true });

    return {
      id: U.uid('q'), mode: 'quest', day: U.dayKey(), startedAt: Date.now(),
      focus: focus, stepBackFrom: pick.stepBackFrom, fixSkill: fixSkill,
      items: items, idx: 0, results: [], stars: 0, repairs: 0, struggles: 0, lightened: false
    };
  }

  function buildDiagnostic() {
    return {
      id: U.uid('d'), mode: 'diagnostic', day: U.dayKey(), startedAt: Date.now(),
      items: FMQ.diagnosticSet.map(function (id) { var q = FMQ.question(id); return { qid: id, skill: q.skill, level: q.level, section: 'diag', changed: false }; }),
      idx: 0, results: [], stars: 0, repairs: 0, struggles: 0
    };
  }

  function buildPractice(state, skillId) {
    var used = [], items = [];
    [1, 2, 3].forEach(function (lvl) {
      var q = pickQuestion(state, skillId, lvl, used);
      if (q) { used.push(q.id); items.push({ qid: q.id, skill: q.skill, level: q.level, section: 'practice', changed: q.level >= 3 }); }
    });
    return { id: U.uid('p'), mode: 'practice', day: U.dayKey(), startedAt: Date.now(), focus: skillId, items: items, idx: 0, results: [], stars: 0, repairs: 0, struggles: 0 };
  }

  function buildDemo(qid) {
    var q = FMQ.question(qid);
    return { id: U.uid('s'), mode: 'demo', day: U.dayKey(), startedAt: Date.now(), focus: q.skill,
      items: [{ qid: qid, skill: q.skill, level: q.level, section: 'demo', changed: false }], idx: 0, results: [], stars: 0, repairs: 0, struggles: 0 };
  }

  /* Adapt the remaining queue after a result. Returns a note for MARIA, or null. */
  function adapt(state, quest, item, a) {
    if (quest.mode === 'diagnostic') return null;
    var struggle = M.isStruggle(a);
    if (!struggle) return null;
    quest.struggles++;
    var note = null;
    var cap = quest.mode === 'demo' ? 1 : MAX_REPAIRS;
    if (quest.repairs < cap) {
      var used = quest.items.map(function (i) { return i.qid; });
      var twin = pickTwin(state, FMQ.question(item.qid), used);
      if (twin) {
        quest.items.splice(quest.idx + 1, 0, { qid: twin.id, skill: twin.skill, level: twin.level, section: item.section, changed: true, repair: true, of: item.qid });
        quest.repairs++;
        note = 'twin';
      }
    }
    // Do not overload: after repeated struggle, lighten the rest of the session.
    if (quest.struggles >= 3 && !quest.lightened && quest.mode === 'quest') {
      quest.lightened = true;
      quest.items = quest.items.filter(function (it, i) {
        return i <= quest.idx + 1 || it.repair || (it.section !== 'boss' && !(it.section === 'skill' && it.level >= 3));
      });
      note = note ? note + '+light' : 'light';
    }
    return note;
  }

  function nextFocusAfter(state, quest) {
    return chooseFocus(state, { avoid: quest.focus }).focus;
  }

  return {
    buildDaily: buildDaily, buildDiagnostic: buildDiagnostic, buildPractice: buildPractice, buildDemo: buildDemo,
    adapt: adapt, chooseFocus: chooseFocus, nextFocusAfter: nextFocusAfter, pickQuestion: pickQuestion
  };
})();
