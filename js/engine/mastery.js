/* Mastery engine.
   One correct answer is never mastery. A skill becomes secure only with independent
   success on a core question AND a changed / context question, little help, and no
   repeated misconception in the recent window. */
window.FMQ = window.FMQ || {};

FMQ.mastery = (function () {
  var U = FMQ.util;
  var WINDOW = 6;

  var OUTCOMES = {
    independent: { icon: '✅', label: 'Correct — Independent', labelBm: 'Betul — Sendiri', weight: 3 },
    corrected:   { icon: '✅', label: 'Correct — Self-corrected', labelBm: 'Betul — Dibetulkan sendiri', weight: 2.5 },
    hint1:       { icon: '💡', label: 'Correct — 1 Hint', labelBm: 'Betul — 1 petunjuk', weight: 2 },
    hint2:       { icon: '💡💡', label: 'Correct — 2+ Hints', labelBm: 'Betul — 2+ petunjuk', weight: 1 },
    explained:   { icon: '📘', label: 'Learned with Explanation', labelBm: 'Belajar dengan penerangan', weight: 0.5 },
    wrong:       { icon: '🌱', label: 'Still learning', labelBm: 'Masih belajar', weight: 0 }
  };

  var STATES = {
    secure:   { icon: '🟢', label: 'I Can Do This', labelBm: 'Saya Boleh', parent: 'Secure', parentBm: 'Kukuh', tone: 'secure' },
    building: { icon: '🟡', label: 'I’m Building This', labelBm: 'Sedang Dibina', parent: 'Building', parentBm: 'Sedang dibina', tone: 'building' },
    practise: { icon: '🌱', label: 'Let’s Practise This', labelBm: 'Mari Berlatih', parent: 'Foundation repair', parentBm: 'Pemulihan asas', tone: 'practise' },
    unknown:  { icon: '○', label: 'Coming soon', labelBm: 'Akan datang', parent: 'Not yet assessed', parentBm: 'Belum dinilai', tone: 'unknown' }
  };

  function outcomeOf(a) {
    if (a.explained) return 'explained';
    if (!a.correct) return 'wrong';
    if (a.hints >= 2) return 'hint2';
    if (a.hints === 1) return 'hint1';
    if (!a.firstTry) return 'corrected';
    return 'independent';
  }
  function isStruggle(a) {
    var o = outcomeOf(a);
    return o === 'explained' || o === 'wrong' || o === 'hint2' || a.confused;
  }

  function attemptsFor(state, skillId) {
    return state.attempts.filter(function (a) { return a.skill === skillId; });
  }

  function computeState(state, skillId) {
    var all = attemptsFor(state, skillId);
    if (!all.length) return 'unknown';
    var recent = all.slice(-WINDOW);
    var last3 = recent.slice(-3);
    var indepCore = recent.some(function (a) { return outcomeOf(a) === 'independent' && a.level <= 2 && !a.changed; });
    var indepChanged = recent.some(function (a) { return outcomeOf(a) === 'independent' && (a.changed || a.level >= 3); });
    var cleanLast3 = last3.every(function (a) { var o = outcomeOf(a); return o !== 'wrong' && o !== 'explained' && !a.confused; });
    var hints3 = last3.reduce(function (n, a) { return n + (a.hints || 0); }, 0);
    var cats = {};
    var repeated = recent.some(function (a) {
      if (!a.errorCat) return false;
      cats[a.errorCat] = (cats[a.errorCat] || 0) + 1;
      return cats[a.errorCat] >= 2 && recent.indexOf(a) >= recent.length - 3;
    });
    // Multi-step skill: two independent level-4 wins count as core + changed.
    if (skillId === 'word-problems') {
      var wins = recent.filter(function (a) { return outcomeOf(a) === 'independent'; }).length;
      indepCore = indepChanged = wins >= 2;
    }
    if (indepCore && indepChanged && cleanLast3 && hints3 <= 1 && !repeated && last3.length >= 2) return 'secure';
    if (recent.some(function (a) { return a.correct && !a.explained; })) return 'building';
    return 'practise';
  }

  function allStates(state) {
    var out = {};
    FMQ.curriculum.skills.forEach(function (s) { out[s.id] = computeState(state, s.id); });
    return out;
  }

  /* ── Vocabulary ── */
  function vocabEntry(state, w) {
    return state.vocab[w] || { seen: 0, bridged: 0, independent: 0, last: null, lastDay: null };
  }
  function vocabStatus(state, w) {
    var v = vocabEntry(state, w);
    if (v.independent >= 2 && v.last === 'independent') return 'known';
    if (v.seen > 0) return 'growing';
    return 'new';
  }
  // Fading support: full → short → tap to reveal → plain.
  function fadeLevel(state, w) {
    if (vocabStatus(state, w) === 'known') return 'plain';
    var b = vocabEntry(state, w).bridged;
    if (b === 0) return 'full';
    if (b === 1) return 'short';
    return 'tap';
  }

  /* ── Recording ── */
  function starsFor(a) {
    var o = outcomeOf(a);
    var changed = a.changed || a.level >= 3;
    if (o === 'independent') return changed ? 3 : 2;
    if (o === 'corrected') return 2;
    if (o === 'hint1') return changed ? 3 : 2;
    if (o === 'hint2') return 1;
    return a.triedAlone ? 1 : 0; // +1 for trying independently
  }

  function record(state, a) {
    var today = U.dayKey();
    a.ts = a.ts || Date.now();
    a.day = a.day || today;
    a.outcome = outcomeOf(a);
    var before = computeState(state, a.skill);
    var sk = state.skills[a.skill] || (state.skills[a.skill] = {});
    var result = { stars: 0, comeback: false, mastered: false, wordWins: [], outcome: a.outcome };

    // Comeback: struggled on an earlier day, now independent on a changed / context question.
    if (a.outcome === 'independent' && (a.changed || a.level >= 3) && sk.struggledTs &&
        U.dayKey(sk.struggledTs) < a.day && (!sk.comebackTs || sk.comebackTs < sk.struggledTs)) {
      sk.comebackTs = a.ts;
      result.comeback = true;
      state.events.push({ ts: a.ts, day: a.day, type: 'comeback', skill: a.skill, qid: a.qid });
    }
    if (isStruggle(a)) sk.struggledTs = a.ts;
    if (a.confused) sk.gap = true;

    state.attempts.push(a);

    var after = computeState(state, a.skill);
    sk.state = after;
    if (after === 'secure') sk.flag = false;
    // Celebrate mastery once per skill; a later dip and recovery is quieter.
    if (after === 'secure' && before !== 'secure' && !sk.masteredTs) {
      sk.masteredTs = a.ts;
      sk.gap = false;
      sk.flag = false;
      result.mastered = true;
      result.stars += 5;
      state.events.push({ ts: a.ts, day: a.day, type: 'mastered', skill: a.skill });
    }
    result.stars += starsFor(a);

    // Maths-English vocabulary
    var q = FMQ.question(a.qid);
    (q && q.vocab || []).forEach(function (w) {
      var v = state.vocab[w] = vocabEntry(state, w);
      v.seen++;
      if (a.bridge) { v.bridged++; v.last = 'bridge'; }
      else if (a.correct && !a.explained) {
        var wasHelped = v.bridged > 0 && v.last !== 'independent';
        v.independent++; v.last = 'independent';
        if (wasHelped && v.lastWinDay !== a.day) {
          v.lastWinDay = a.day;
          result.wordWins.push(w);
          state.events.push({ ts: a.ts, day: a.day, type: 'word', word: w });
        }
      } else v.last = 'struggle';
      v.lastDay = a.day;
    });

    state.stars += result.stars;
    return result;
  }

  function lastSeenMap(state) {
    var m = {};
    state.attempts.forEach(function (a) { m[a.qid] = a.ts; });
    return m;
  }

  return {
    OUTCOMES: OUTCOMES, STATES: STATES,
    outcomeOf: outcomeOf, isStruggle: isStruggle,
    computeState: computeState, allStates: allStates, attemptsFor: attemptsFor,
    vocabStatus: vocabStatus, fadeLevel: fadeLevel, vocabEntry: vocabEntry,
    record: record, lastSeenMap: lastSeenMap
  };
})();
