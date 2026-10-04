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
  review: { title: 'Review Mix',     intro: 'A mix of skills you have practised. Let’s see what stuck 🌱.' },
  diag:  { title: 'Getting to know you', intro: '' },
  checkpoint: { title: 'Checkpoint ⭐', intro: '' },
  practice: { title: 'Practice', intro: '' },
  demo:  { title: 'Sample', intro: '' }
};

FMQ.quest = (function () {
  var U = FMQ.util, M = FMQ.mastery;
  var MAX_REPAIRS = 2;

  // Generated questions are tracked by template, so a template "rests" after it is used.
  function seenMaps(state) {
    var q = {}, t = {}, qn = {}, tn = {};
    state.attempts.forEach(function (a) {
      q[a.qid] = a.ts; qn[a.qid] = (qn[a.qid] || 0) + 1;
      if (a.qid.indexOf('g~') === 0) { var k = a.qid.split('~')[1]; t[k] = a.ts; tn[k] = (tn[k] || 0) + 1; }
    });
    return { q: q, t: t, qn: qn, tn: tn };
  }

  function usedTemplate(exclude, tplId) {
    return exclude.some(function (id) { return id.indexOf('g~' + tplId + '~') === 0; });
  }

  // Candidates = hand-written questions + generator templates, nearest level first,
  // least recently seen next, random tie-break so practice stays fresh for months.
  function pickQuestion(state, skillId, level, exclude, seen) {
    seen = seen && seen.q ? seen : seenMaps(state);
    var pool = FMQ.questions.filter(function (q) { return q.skill === skillId && exclude.indexOf(q.id) < 0; })
      .map(function (q) { return { level: q.level, ts: seen.q[q.id] || 0, uses: seen.qn[q.id] || 0, r: Math.random(), q: q }; });
    // A template makes new numbers and names each time, so it can be reused about 3× as often.
    FMQ.gen.templatesFor(skillId).forEach(function (t) {
      if (usedTemplate(exclude, t.id)) return;
      pool.push({ level: t.level, ts: seen.t[t.id] || 0, uses: (seen.tn[t.id] || 0) / 3, r: Math.random(), tpl: t.id });
    });
    if (!pool.length) return null;
    pool.sort(function (a, b) {
      var d = Math.abs(a.level - level) - Math.abs(b.level - level);
      if (d) return d;
      // Within ~2 days, treat as "recently seen"; otherwise prefer the oldest.
      var ra = a.ts > Date.now() - 2 * 86400000 ? 1 : 0, rb = b.ts > Date.now() - 2 * 86400000 ? 1 : 0;
      if (ra !== rb) return ra - rb;
      if (Math.floor(a.uses) !== Math.floor(b.uses)) return a.uses - b.uses;
      return a.r - b.r;
    });
    var best = pool[0];
    return best.q || FMQ.gen.instance(best.tpl);
  }

  function pickTwin(state, q, used) {
    var pref = (FMQ.twins[q.id] || []).filter(function (id) { return used.indexOf(id) < 0; });
    if (pref.length) return FMQ.question(pref[0]);
    var ex = used.concat([q.id]);
    var lvl = q.level >= 4 ? 4 : q.level;
    return pickQuestion(state, q.skill, lvl, ex) || pickQuestion(state, q.skill, Math.min(3, lvl + 1), used);
  }

  function hasEvidence(state, skillId) { return M.attemptsFor(state, skillId).length > 0; }

  function chooseFocus(state, opts) {
    opts = opts || {};
    var states = M.allStates(state);
    var pri = FMQ.learner.priorities;
    var lastFocus = opts.avoid || (state.sessions.filter(function (s) { return s.mode === 'quest'; }).slice(-1)[0] || {}).focus;
    var info = FMQ.planInfo ? FMQ.planInfo(state) : null;
    var weekSkills = info && info.inPlan ? info.week.skills : [];
    var best = null;
    FMQ.curriculum.skills.forEach(function (s) {
      if (s.id === 'word-problems') return;
      var st = states[s.id];
      if (st === 'secure') return;
      var score = 0;
      var pi = pri.indexOf(s.id);
      if (pi >= 0) score += 20 - pi;
      var wi = weekSkills.indexOf(s.id);
      if (wi >= 0) score += 30 - wi * 4; // this week's theme leads, unless already secure
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
    var seen = seenMaps(state);
    var dow = new Date().getDay();
    if ((dow === 0 || dow === 6) && state.sessions.filter(function (x) { return x.mode === 'quest'; }).length >= 3) return buildReview(state, seen);
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
    add(pickBoss(state, [focus], used, seen), 'boss', { changed: true });

    return {
      id: U.uid('q'), mode: 'quest', day: U.dayKey(), startedAt: Date.now(),
      focus: focus, stepBackFrom: pick.stepBackFrom, fixSkill: fixSkill,
      items: items, idx: 0, results: [], stars: 0, repairs: 0, struggles: 0, lightened: false
    };
  }

  function pickBoss(state, skills, used, seen) {
    seen = seen || seenMaps(state);
    var pool = FMQ.questions.filter(function (q) { return q.level === 4 && used.indexOf(q.id) < 0; })
      .map(function (q) { return { rel: q.related || [], ts: seen.q[q.id] || 0, q: q, r: Math.random() }; });
    FMQ.gen.templates.forEach(function (t) { if (t.level === 4 && !usedTemplate(used, t.id)) pool.push({ rel: t.related || [], ts: seen.t[t.id] || 0, tpl: t.id, r: Math.random() }); });
    pool.sort(function (a, b) {
      var ra = skills.some(function (s) { return a.rel.indexOf(s) >= 0; }) ? 0 : 1, rb = skills.some(function (s) { return b.rel.indexOf(s) >= 0; }) ? 0 : 1;
      if (ra !== rb) return ra - rb;
      if (Math.abs(a.ts - b.ts) > 86400000) return a.ts - b.ts;
      return a.r - b.r;
    });
    return pool[0] ? (pool[0].q || FMQ.gen.instance(pool[0].tpl)) : null;
  }

  /* Weekend Review Mix: shorter, spaced retrieval across practised skills. */
  function buildReview(state, seen) {
    var states = M.allStates(state), info = FMQ.planInfo(state), used = [], items = [];
    var lastTs = {};
    state.attempts.forEach(function (a) { lastTs[a.skill] = a.ts; });
    var practised = FMQ.curriculum.skills.map(function (s) { return s.id; }).filter(function (id) {
      return id !== 'word-problems' && states[id] !== 'unknown';
    });
    // This week's skills first, then the least recently practised.
    practised.sort(function (a, b) {
      var wa = info.week.skills.indexOf(a) >= 0 ? 0 : 1, wb = info.week.skills.indexOf(b) >= 0 ? 0 : 1;
      return wa - wb || (lastTs[a] || 0) - (lastTs[b] || 0);
    });
    function add(q, section, lvl) { if (!q) return; used.push(q.id); items.push({ qid: q.id, skill: q.skill, level: q.level, section: section, changed: q.level >= 3 }); }
    var easy = practised.filter(function (id) { return states[id] === 'secure'; })[0] || practised[0] || 'add-sub';
    add(pickQuestion(state, easy, 1, used, seen), 'easy');
    practised.filter(function (id) { return id !== easy; }).slice(0, 5).forEach(function (id) {
      add(pickQuestion(state, id, states[id] === 'secure' ? 3 : 2, used, seen), 'review');
    });
    add(pickBoss(state, practised.slice(0, 3), used, seen), 'boss');
    return { id: U.uid('q'), mode: 'quest', kind: 'review', day: U.dayKey(), startedAt: Date.now(), focus: (items[1] || items[0]).skill,
      items: items, idx: 0, results: [], stars: 0, repairs: 0, struggles: 0, lightened: false };
  }

  /* Checkpoint: the same skills as the first diagnostic, with new questions. */
  function buildCheckpoint(state, no) {
    var used = [], items = [];
    FMQ.diagnosticSet.forEach(function (id) {
      var skill = FMQ.question(id).skill;
      var q = pickQuestion(state, skill, 2, used.concat([id]));
      if (q) { used.push(q.id); items.push({ qid: q.id, skill: q.skill, level: q.level, section: 'checkpoint', changed: true }); }
    });
    return { id: U.uid('c'), mode: 'checkpoint', checkpoint: no, day: U.dayKey(), startedAt: Date.now(), items: items, idx: 0, results: [], stars: 0, repairs: 0, struggles: 0 };
  }

  function checkpointDue(state) {
    var info = FMQ.planInfo(state);
    if (!info.inPlan || !info.week.checkpoint) return null;
    var no = info.week.checkpoint;
    return state.sessions.some(function (s) { return s.mode === 'checkpoint' && s.checkpoint === no; }) ? null : no;
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
    if (quest.mode === 'diagnostic' || quest.mode === 'checkpoint') return null;
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
    buildDaily: buildDaily, buildDiagnostic: buildDiagnostic, buildCheckpoint: buildCheckpoint, checkpointDue: checkpointDue, seenMaps: seenMaps, buildPractice: buildPractice, buildDemo: buildDemo,
    adapt: adapt, chooseFocus: chooseFocus, nextFocusAfter: nextFocusAfter, pickQuestion: pickQuestion
  };
})();
