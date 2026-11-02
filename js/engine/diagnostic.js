/* Diagnostic engine — TEST → OBSERVE → CAPTURE → DIAGNOSE → RECOMMEND.
   Append-only log in its own versioned key (never touches the main learner record):
     localStorage['fmq:diag:v1:<learnerId>'] = { schema, created, sessions: [session...] }
   A session = one attempt at one test. Sessions are never deleted or replaced, so
   Baseline → Week 1 → Week 2 … can always be compared. Ratings are evidence-based and
   tentative: below a minimum number of items we say "Not enough evidence yet". */
window.FMQ = window.FMQ || {};

FMQ.diagEngine = (function () {
  var D = FMQ.diag, U = FMQ.util, log = null;
  var SCHEMA = 1, MIN_ITEMS = 3;
  function key() { return 'fmq:diag:v1:' + FMQ.learner.id; }

  /* ── persistence ── */
  function fresh() { return { schema: SCHEMA, learner: FMQ.learner.id, created: Date.now(), sessions: [] }; }
  function load() {
    log = FMQ.storageDriver.get(key()) || fresh();
    if (!Array.isArray(log.sessions)) log.sessions = [];
    log.schema = log.schema || SCHEMA;
    seedExam();
    return log;
  }
  function get() { return log || load(); }
  function save() { if (log) FMQ.storageDriver.set(key(), log); }
  function seedExam() {
    var ex = D.EXAM;
    if (!ex || log.sessions.some(function (s) { return s.id === ex.id; })) return;
    log.sessions.unshift({
      id: ex.id, test: 'EXAM', source: 'school-exam', status: 'complete', appVersion: D.VERSION, startedAt: ex.startedAt, endedAt: ex.endedAt,
      score: ex.score, minutes: ex.minutes, label: ex.label, hypotheses: ex.hypotheses.map(function (h) { return h.id; }),
      responses: ex.items.map(function (it) {
        return { sessionId: ex.id, test: 'EXAM', source: 'school-exam', questionId: it[0], topic: it[2], anchorSkill: it[1], correct: it[3], firstAttemptResult: it[3] ? 'correct' : 'incorrect', finalResult: it[3] ? 'correct' : 'incorrect', likelyError: it[4] || null, timestamp: ex.startedAt };
      })
    });
    save();
  }

  /* ── sessions ── */
  function appSessions() { return get().sessions.filter(function (s) { return s.source !== 'school-exam'; }); }
  function sessionsFor(test) { return appSessions().filter(function (s) { return s.test === test; }); }
  function active(test) { return sessionsFor(test).filter(function (s) { return s.status === 'in-progress'; }).pop() || null; }
  function lastComplete(test) { return sessionsFor(test).filter(function (s) { return s.status === 'complete'; }).pop() || null; }
  function byId(id) { return get().sessions.find(function (s) { return s.id === id; }); }
  function start(test) {
    var prev = sessionsFor(test).filter(function (s) { return s.status === 'complete'; }).length;
    var s = { id: U.uid('dg'), test: test, source: 'app', appVersion: D.VERSION, schema: SCHEMA, startedAt: Date.now(), status: 'in-progress',
      attemptNo: prev + 1, kind: prev ? 'recheck' : 'baseline', planWeek: planWeek(),
      order: D.questionsFor(test).map(function (q) { return q.id; }), idx: 0, pendingProbe: null, probesServed: [],
      confidenceStart: null, confidenceEnd: null, stars: 0, responses: [] };
    get().sessions.push(s); save(); return s;
  }
  function planWeek() { try { var i = FMQ.planInfo(FMQ.store.get()); return i && i.inPlan ? i.weekNo : null; } catch (e) { return null; } }
  function current(s) {
    if (s.pendingProbe) return D.probe(s.pendingProbe);
    return s.idx < s.order.length ? D.question(s.order[s.idx]) : null;
  }
  function counts(s) { return { done: s.idx, total: s.order.length }; }

  /* ── scoring ── */
  function norm(v) { return String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''); }
  function explainQuality(q, text) {
    text = String(text || '').trim();
    if (!text) return { given: false, quality: 'none' };
    if (!q.keys) return { given: true, quality: 'unrated' };
    var hit = q.keys.filter(function (grp) { return grp.some(function (src) { return new RegExp(src, 'i').test(text); }); }).length;
    return { given: true, quality: hit >= q.keys.length ? 'clear' : hit ? 'partial' : 'unclear', matched: hit + '/' + q.keys.length };
  }
  function score(q, ans, text, s) {
    var r = { correct: false, errDim: null, errWhy: null };
    if (q.format === 'mcq') {
      var o = q.opts.find(function (y) { return y.t[0] === ans; });
      if (o && o.ok) r.correct = true; else if (o) { r.errDim = o.err || null; r.errWhy = o.why || null; }
    } else if (q.format === 'number' || q.format === 'numexplain') {
      var n = norm(ans);
      r.correct = n !== '' && Number(n) === q.ans;
      if (!r.correct && q.numErr && q.numErr[Number(n)]) { r.errDim = q.numErr[Number(n)][0]; r.errWhy = q.numErr[Number(n)][1]; }
      if (!r.correct && q.followOn && s) {
        var prev = s.responses.filter(function (y) { return y.questionId === q.followOn.from; }).pop();
        if (prev && prev.answer && !prev.correct && Number(n) === Number(norm(prev.answer)) * q.followOn.factor) {
          r.carried = true; r.errDim = 'CALCULATION'; r.errWhy = 'carried an earlier error forward (method correct)';
        }
      }
      if (!r.correct && !r.errDim && n !== '') { r.errDim = null; r.errWhy = 'unclassified wrong answer'; }
    }
    if (q.format === 'explain' || q.format === 'numexplain') {
      var e = explainQuality(q, q.format === 'explain' ? ans : text);
      r.explanationGiven = e.given; r.explanationQuality = e.quality; r.explanationMatched = e.matched;
      if (q.format === 'explain') { r.correct = e.quality === 'clear'; if (!r.correct) { r.errDim = 'EXPLANATION'; r.errWhy = e.quality === 'partial' ? 'explanation partly complete' : 'explanation unclear'; } }
    }
    return r;
  }

  /* ── capture ── */
  function recordFirst(s, q, p) {
    var dk = p.dontKnow, sc = dk ? { correct: false } : score(q, p.answer, p.text, s);
    var rec = {
      sessionId: s.id, appVersion: D.VERSION, test: s.test, questionId: q.id, topic: q.topic, anchorSkill: q.anchor, prerequisiteSkill: q.prereq || '',
      difficulty: q.difficulty, questionType: q.type, format: q.format, stage: q.stage || '', pair: q.pair || null, chain: q.chain || null,
      isProbe: !!q.isProbe, probeKind: q.isProbe ? q.probeKind : null, probeFor: q.isProbe ? p.probeFor || null : null, probeYear: q.isProbe ? q.year : null,
      langShown: q.forceLang || (q.langItem ? 'en' : FMQ.i18n.lang()), langItem: !!q.langItem, phrase: q.phrase ? q.phrase[0] : null,
      answer: dk ? null : p.answer, explanationText: p.text || (q.format === 'explain' ? p.answer : null) || null,
      correctAnswer: correctText(q), correct: !!sc.correct, firstAttemptResult: dk ? 'dont-know' : sc.correct ? 'correct' : 'incorrect', finalResult: dk ? 'dont-know' : sc.correct ? 'correct' : 'incorrect',
      likelyError: sc.errDim || null, likelyErrorWhy: sc.errWhy || null, carriedError: !!sc.carried,
      timeSpentMs: p.timeMs, totalTimeMs: p.timeMs, hintRequested: false, hintsCount: 0, attempts: 1, changedAnswer: !!p.changed, answerChanges: p.changes || 0,
      explanationGiven: !!sc.explanationGiven, explanationQuality: (q.format === 'explain' || q.format === 'numexplain') ? (sc.explanationQuality || 'none') : 'n/a',
      skipped: !!dk, dontKnow: !!dk, workedExampleShown: false, retryAnswers: [], timestamp: Date.now()
    };
    s.responses.push(rec); s.stars += 1; addStars(1); save(); return rec;
  }
  function recordRetry(s, rec, q, p) {
    var sc = score(q, p.answer, p.text, s);
    rec.attempts += 1; rec.totalTimeMs += p.timeMs || 0;
    rec.retryAnswers.push({ answer: p.answer, correct: !!sc.correct, likelyError: sc.errDim || null, hintsSoFar: rec.hintsCount, ts: Date.now() });
    rec.finalResult = sc.correct ? (rec.hintsCount ? 'correct-after-hint' : 'correct-after-retry') : 'incorrect';
    if (q.format === 'numexplain' && p.text) { var e = explainQuality(q, p.text); rec.explanationGiven = true; rec.explanationQuality = e.quality; }
    save(); return sc.correct;
  }
  function hint(s, rec) { rec.hintRequested = true; rec.hintsCount += 1; save(); }
  function worked(s, rec) { rec.workedExampleShown = true; if (rec.finalResult === 'incorrect' || rec.finalResult === 'dont-know') rec.finalResult = 'shown-worked-example'; save(); }
  function correctText(q) {
    if (q.format === 'mcq') return q.opts.find(function (o) { return o.ok; }).t[0];
    if (q.format === 'explain') return q.answerText ? q.answerText[0] : '(explanation)';
    return String(q.ans);
  }
  function addStars(n) { try { var st = FMQ.store.get(); st.stars += n; FMQ.store.save(); } catch (e) {} }

  /* After an item is finished: step down to a Y2–3 probe if the first attempt was missed. */
  function advance(s) {
    var last = s.responses[s.responses.length - 1];
    if (s.pendingProbe) { s.pendingProbe = null; s.idx++; }
    else {
      var pid = last && !last.isProbe && last.firstAttemptResult !== 'correct' ? D.PROBE_MAP[last.questionId] : null;
      if (pid && s.probesServed.indexOf(pid) < 0) { s.pendingProbe = pid; s.probesServed.push(pid); s.probeFor = last.questionId; }
      else s.idx++;
    }
    save();
    return s.idx >= s.order.length && !s.pendingProbe;
  }
  function finish(s) {
    if (s.status === 'complete') return;
    s.status = 'complete'; s.endedAt = Date.now(); s.stars += 5; addStars(5); save();
  }
  function setConfidence(s, which, v) { s[which] = { value: v, ts: Date.now() }; save(); }

  /* ── analysis ── */
  // Evidence used for "current" ratings: the most recent session of each test (in progress counts).
  function latestSessions() {
    var out = {};
    appSessions().forEach(function (s) { if (s.responses.length) out[s.test] = s; });
    return Object.keys(out).map(function (k) { return out[k]; });
  }
  function latestResponses(includeProbes) {
    var r = [];
    latestSessions().forEach(function (s) { s.responses.forEach(function (y) { if (includeProbes || !y.isProbe) r.push(y); }); });
    return r;
  }
  function skillStatus(resps) {
    var n = resps.length; if (!n) return { status: 'none', n: 0 };
    var k = resps.filter(function (y) { return y.correct; }).length;
    var supported = resps.filter(function (y) { return !y.correct && /after/.test(y.finalResult); }).length;
    var st = k === n ? 'secure' : (k / n >= 0.5 || k + supported >= n) ? 'growing' : 'needs';
    return { status: st, n: n, k: k, supported: supported, conf: n >= 3 ? 'medium' : 'low' };
  }
  function skillMap(resps) {
    resps = resps || latestResponses(false);
    var map = {};
    Object.keys(D.SKILLS).forEach(function (id) { map[id] = skillStatus(resps.filter(function (y) { return y.anchorSkill === id && !y.isProbe; })); });
    return map;
  }
  function dimensions(resps) {
    resps = resps || latestResponses(false);
    var out = {};
    D.DIMS.forEach(function (d) { out[d.id] = { ok: 0, concern: 0, unknown: 0, items: [] }; });
    resps.forEach(function (y) {
      var q = D.question(y.questionId) || D.probe(y.questionId); if (!q) return;
      var dims = q.dims || [];
      if (y.dontKnow) { dims.forEach(function (d) { out[d].unknown++; }); return; }
      if (y.correct) dims.forEach(function (d) { out[d].ok++; out[d].items.push(y); });
      else if (y.carriedError) { out.PLAN.ok++; out.CALCULATION.concern++; out.CALCULATION.items.push(y); }
      else if (y.likelyError) { out[y.likelyError].concern++; out[y.likelyError].items.push(y); }
      if (q.format === 'numexplain' && y.explanationGiven) { if (y.explanationQuality === 'clear') out.EXPLANATION.ok++; else out.EXPLANATION.concern++; }
    });
    Object.keys(out).forEach(function (k) {
      var o = out[k], n = o.ok + o.concern;
      o.n = n;
      if (n < MIN_ITEMS) { o.rating = 'insufficient'; o.conf = null; return; }
      var r = o.concern / n;
      o.rating = r < 0.25 ? 'strength' : r < 0.5 ? 'developing' : 'concern';
      o.conf = n >= 8 && (r < 0.15 || r > 0.6) ? 'high' : n >= 5 ? 'medium' : 'low';
    });
    return out;
  }
  function pairs(resps) {
    resps = resps || latestResponses(false);
    var g = {};
    resps.forEach(function (y) {
      if (!y.pair || y.dontKnow && false) return;
      var p = g[y.pair.group] = g[y.pair.group] || { direct: { n: 0, k: 0 }, context: { n: 0, k: 0 }, planErrors: 0, fixedAfterHint: 0 };
      p[y.pair.kind].n++; if (y.correct) p[y.pair.kind].k++;
      if (y.pair.kind === 'context' && y.likelyError === 'PLAN') p.planErrors++;
      if (y.pair.kind === 'context' && !y.correct && /after/.test(y.finalResult)) p.fixedAfterHint++;
    });
    return g;
  }
  function median(a) { if (!a.length) return 0; a = a.slice().sort(function (x, y) { return x - y; }); var m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
  function behaviours(resps) {
    resps = resps || latestResponses(true);
    var answered = resps.filter(function (y) { return !y.dontKnow && y.timeSpentMs > 0; });
    var med = median(answered.map(function (y) { return y.timeSpentMs; }));
    var c = { fastAccurate: 0, slowAccurate: 0, fastInaccurate: 0, slowInaccurate: 0, calc: 0, reading: 0, hintHelped: 0, hinted: 0, worked: 0, selfCorrect: 0, dontKnow: 0, weakExplain: 0, n: resps.length, medianMs: med };
    resps.forEach(function (y) {
      if (y.dontKnow) c.dontKnow++;
      if (!y.dontKnow && med && y.timeSpentMs) {
        var fast = y.timeSpentMs < 0.6 * med, slow = y.timeSpentMs > 1.6 * med;
        if (fast && y.correct) c.fastAccurate++; if (slow && y.correct) c.slowAccurate++;
        if (fast && !y.correct) c.fastInaccurate++; if (slow && !y.correct) c.slowInaccurate++;
      }
      if (y.likelyError === 'CALCULATION') c.calc++;
      if (y.likelyError === 'UNDERSTAND') c.reading++;
      if (y.hintsCount) { c.hinted++; if (/after/.test(y.finalResult) && y.hintsCount === 1) c.hintHelped++; }
      if (y.workedExampleShown) c.worked++;
      if (y.changedAnswer && y.correct) c.selfCorrect++;
      if ((y.format === 'numexplain' && y.correct && y.explanationQuality !== 'clear') || (y.likelyError === 'EXPLANATION')) c.weakExplain++;
    });
    var P = pairs(resps.filter(function (y) { return !y.isProbe; })), dc = Object.keys(P).filter(function (k) { var p = P[k]; return p.direct.n && p.context.n && p.direct.k / p.direct.n >= 0.75 && p.context.k / p.context.n <= 0.5; });
    var list = [];
    function add(cond, en, bm, ev) { if (cond) list.push({ t: [en, bm], ev: ev }); }
    var ans = Math.max(1, answered.length);
    add(c.fastAccurate >= 2, 'Fast and accurate on some items', 'Cepat dan tepat pada beberapa soalan', c.fastAccurate + ' items');
    add(c.slowAccurate >= 2, 'Slow but accurate — takes time and gets there', 'Perlahan tetapi tepat — ambil masa dan berjaya', c.slowAccurate + ' items');
    add(c.fastInaccurate >= 2, 'Fast but inaccurate — may be rushing or guessing', 'Cepat tetapi tidak tepat — mungkin tergesa-gesa atau meneka', c.fastInaccurate + ' items');
    add(c.calc >= 2, 'Repeated calculation slips', 'Kesilapan pengiraan berulang', c.calc + ' items');
    add(c.reading >= 2, 'Repeated question-reading / interpretation slips', 'Kesilapan membaca / memahami soalan berulang', c.reading + ' items');
    add(c.hintHelped >= 1, 'Improves after one hint', 'Berjaya selepas satu petunjuk', c.hintHelped + ' of ' + c.hinted + ' hinted items');
    add(c.worked >= 2, 'Needed a worked example on several items', 'Memerlukan contoh langkah demi langkah pada beberapa soalan', c.worked + ' items');
    add(c.selfCorrect >= 1, 'Self-corrects (changed answer before checking, then right)', 'Membetulkan sendiri (tukar jawapan sebelum semak, kemudian betul)', c.selfCorrect + ' items');
    add(c.dontKnow >= 2, 'Uses “I don’t know yet” / skips (' + Math.round(c.dontKnow / Math.max(1, c.n) * 100) + '% of items)', 'Guna “Belum tahu” / langkau', c.dontKnow + ' items');
    add(dc.length > 0, 'Stronger on direct calculation than the same skill in context', 'Lebih kuat dalam pengiraan terus berbanding kemahiran sama dalam konteks', dc.join(', '));
    add(c.weakExplain >= 1, 'Right answer but weaker explanation', 'Jawapan betul tetapi penerangan lemah', c.weakExplain + ' items');
    return { counts: c, list: list, directVsContext: dc, enough: answered.length >= 5 };
  }
  function language(resps) {
    resps = resps || latestResponses(true);
    var out = [];
    resps.filter(function (y) { return y.langItem; }).forEach(function (y) {
      var probe = resps.find(function (z) { return z.isProbe && z.probeFor === y.questionId && z.sessionId === y.sessionId; });
      out.push({ phrase: y.phrase, id: y.questionId, understood: y.correct ? 'en' : probe ? (probe.correct ? 'bm' : 'neither') : 'not-yet-checked' });
    });
    return out;
  }
  function probes(resps) {
    resps = resps || latestResponses(true);
    return resps.filter(function (y) { return y.isProbe && y.probeKind === 'prerequisite'; });
  }
  function confidence() {
    var out = [];
    appSessions().forEach(function (s) { if (s.confidenceStart || s.confidenceEnd) out.push({ test: s.test, at: s.startedAt, start: s.confidenceStart && s.confidenceStart.value, end: s.confidenceEnd && s.confidenceEnd.value }); });
    return out;
  }

  /* Evidence per concern skill. */
  var WHY = {
    UNDERSTAND: ['The main issue appears to be interpreting what the question asks, more than the maths itself.', 'Isu utama nampaknya memahami kehendak soalan, lebih daripada matematiknya.'],
    PLAN: ['She may be choosing the operation from keywords rather than from the meaning of the situation.', 'Dia mungkin memilih operasi berdasarkan kata kunci, bukan makna situasi.'],
    KNOWLEDGE: ['A concept or an earlier-year foundation may not be secure yet.', 'Satu konsep atau asas tahun sebelumnya mungkin belum kukuh.'],
    CALCULATION: ['The method looks right; the working (e.g. regrouping) is where it goes wrong.', 'Kaedah nampak betul; kesilapan berlaku semasa mengira (cth. mengumpul semula).'],
    EXPLANATION: ['She may know more than she can yet put into words.', 'Dia mungkin tahu lebih daripada apa yang boleh diterangkan.'],
    CHECK: ['She may not yet be checking whether an answer is sensible or complete.', 'Dia mungkin belum menyemak sama ada jawapan munasabah atau lengkap.']
  };
  function concerns() {
    var resps = latestResponses(true), main = resps.filter(function (y) { return !y.isProbe; }), map = skillMap(main), out = [];
    Object.keys(map).forEach(function (sid) {
      var m = map[sid]; if (m.status !== 'needs' && m.status !== 'growing') return;
      var items = main.filter(function (y) { return y.anchorSkill === sid; }), tally = {};
      var ev = items.map(function (y) {
        if (y.likelyError) tally[y.likelyError] = (tally[y.likelyError] || 0) + 1;
        var res = y.dontKnow ? '“I don’t know yet”' : y.correct ? '✓ first try' : '✗ first try' + (y.answer != null ? ' (answered ' + String(y.answer).slice(0, 40) + ')' : '');
        var after = y.correct ? '' : y.finalResult === 'correct-after-hint' ? ' → ✓ after ' + y.hintsCount + ' hint' + (y.hintsCount > 1 ? 's' : '') : y.finalResult === 'shown-worked-example' ? ' → needed worked example' : y.attempts > 1 ? ' → still ✗ after retry' : '';
        return y.questionId + ' ' + y.topic + ': ' + res + (y.likelyErrorWhy ? ' — likely ' + y.likelyError + ': ' + y.likelyErrorWhy : '') + after;
      });
      var pr = resps.filter(function (y) { return y.isProbe && items.some(function (z) { return z.questionId === y.probeFor; }); });
      pr.forEach(function (y) { ev.push('Step-down probe ' + y.questionId + ' (Year ' + y.probeYear + ' ' + y.topic + '): ' + (y.correct ? '✓ — the earlier-year foundation looks OK' : y.dontKnow ? '“I don’t know yet”' : '✗ — the gap may start at Year ' + y.probeYear)); });
      var top = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })[0];
      var nEv = items.length + pr.length;
      out.push({ skill: sid, status: m.status, evidence: ev, likely: top || null, likelyCount: top ? tally[top] : 0,
        confidence: !top ? 'low' : tally[top] >= 3 ? 'high' : tally[top] >= 2 ? 'medium' : 'low', needsMore: nEv < MIN_ITEMS || !top,
        interpretation: top ? WHY[top] : ['Not enough evidence yet to suggest a cause.', 'Belum cukup bukti untuk mencadangkan punca.'],
        probeGap: pr.some(function (y) { return !y.correct; }) });
    });
    // Paired direct vs context finding.
    var P = pairs(main);
    Object.keys(P).forEach(function (g) {
      var p = P[g];
      if (p.direct.n && p.context.n && p.direct.k / p.direct.n >= 0.75 && p.context.k / p.context.n < 0.67) {
        out.unshift({ skill: 'pair:' + g, status: 'pattern', evidence: [
          'Direct ' + g + ': ' + p.direct.k + '/' + p.direct.n + ' correct', 'Contextual ' + g + ': ' + p.context.k + '/' + p.context.n + ' correct',
          p.planErrors ? p.planErrors + '× chose the wrong operation in context' : null, p.fixedAfterHint ? 'Corrected ' + p.fixedAfterHint + ' after a hint' : null].filter(Boolean),
          likely: p.planErrors ? 'PLAN' : 'UNDERSTAND', confidence: p.context.n >= 3 ? 'medium' : 'low', needsMore: p.context.n < 3,
          interpretation: ['Underlying ' + g + ' may be secure. The current issue appears more related to interpreting the question than to the calculation itself.', g + ' asas mungkin sudah kukuh. Isu semasa nampaknya lebih berkaitan memahami soalan berbanding pengiraan.'] });
      }
    });
    return out;
  }

  function recommend() {
    var map = skillMap(), dims = dimensions(), b = behaviours(), conf = confidence(), cs = concerns();
    var evidenceN = latestResponses(false).length;
    if (evidenceN < 5) return { enough: false };
    var lowConf = conf.length && conf.slice(-3).some(function (c) { return (c.end || c.start) && (c.end || c.start) <= 2; });
    var minutes = (b.counts.dontKnow >= 3 || lowConf || b.counts.slowInaccurate >= 3) ? 10 : 15;
    var focus = [];
    var dimFocus = { UNDERSTAND: ['interpreting word problems (what is the question asking?)', 'memahami masalah berayat (apa yang ditanya?)'], PLAN: ['choosing the operation from the meaning, not keywords', 'memilih operasi berdasarkan makna, bukan kata kunci'], CALCULATION: ['careful column working and regrouping', 'pengiraan lajur dan mengumpul semula dengan teliti'], CHECK: ['checking answers: does it make sense?', 'menyemak jawapan: munasabahkah?'], EXPLANATION: ['saying the steps out loud', 'menyebut langkah dengan kuat'], KNOWLEDGE: ['rebuilding the foundation concept first', 'membina semula konsep asas dahulu'] };
    Object.keys(dims).forEach(function (k) { if (dims[k].rating === 'concern') focus.push(dimFocus[k]); });
    Object.keys(map).forEach(function (s) { if (map[s].status === 'needs') focus.push([D.SKILLS[s][0], D.SKILLS[s][1]]); });
    cs.forEach(function (c) { if (c.probeGap) focus.push([D.SKILLS[c.skill] ? D.SKILLS[c.skill][0] + ' — start from the earlier-year step' : c.skill, D.SKILLS[c.skill] ? D.SKILLS[c.skill][1] + ' — mula dari langkah tahun awal' : c.skill]); });
    var seen = {}; focus = focus.filter(function (f) { if (seen[f[0]]) return false; seen[f[0]] = 1; return true; }).slice(0, 4);
    var noNeed = Object.keys(map).filter(function (s) { return map[s].status === 'secure' && map[s].n >= 2; }).map(function (s) { return D.SKILLS[s]; });
    var untested = D.TESTS.filter(function (t) { return t.ready && !sessionsFor(t.id).some(function (s) { return s.responses.length; }); }).map(function (t) { return t.title; });
    return { enough: true, minutes: minutes, focus: focus, noNeed: noNeed, untested: untested, lowConf: lowConf };
  }

  /* History of one skill across every session (exam first). */
  function history(skill) {
    var rows = [];
    get().sessions.slice().sort(function (a, b) { return a.startedAt - b.startedAt; }).forEach(function (s) {
      var r = s.responses.filter(function (y) { return y.anchorSkill === skill && !y.isProbe; }); if (!r.length) return;
      var errs = {}; r.forEach(function (y) { if (y.likelyError) errs[y.likelyError] = (errs[y.likelyError] || 0) + 1; });
      var st = skillStatus(r);
      rows.push({ session: s.id, source: s.source, test: s.test, at: s.startedAt, kind: s.source === 'school-exam' ? 'exam' : s.kind, week: s.planWeek,
        first: st.k + '/' + st.n, errors: errs, hints: r.reduce(function (a, y) { return a + (y.hintsCount || 0); }, 0),
        afterSupport: r.filter(function (y) { return /after/.test(y.finalResult); }).length, worked: r.filter(function (y) { return y.workedExampleShown; }).length,
        status: st.status, probes: s.responses.filter(function (y) { return y.isProbe && r.some(function (z) { return z.questionId === y.probeFor; }); }).map(function (y) { return y.questionId + (y.correct ? ' ✓' : ' ✗'); }) });
    });
    var rank = { needs: 0, growing: 1, secure: 2 };
    var appRows = rows.filter(function (x) { return x.source !== 'school-exam'; });
    var trend = appRows.length >= 2 ? (rank[appRows[appRows.length - 1].status] - rank[appRows[0].status]) : null;
    return { rows: rows, trend: trend };
  }

  /* Child view: categories for one session only. */
  function sessionSkills(s) {
    var m = {}; s.responses.filter(function (y) { return !y.isProbe; }).forEach(function (y) { (m[y.anchorSkill] = m[y.anchorSkill] || []).push(y); });
    return Object.keys(m).map(function (k) { return { skill: k, st: skillStatus(m[k]) }; });
  }

  /* Export / import (merge, never delete). */
  function exportJSON() { return JSON.stringify({ kind: 'fmq-diagnostic-log', exportedAt: new Date().toISOString(), appVersion: D.VERSION, log: get() }, null, 2); }
  function importJSON(txt) {
    var data; try { data = JSON.parse(txt); } catch (e) { return { ok: false }; }
    var inc = data && data.log ? data.log : data;
    if (!inc || !Array.isArray(inc.sessions)) return { ok: false };
    var added = 0, updated = 0;
    inc.sessions.forEach(function (s) {
      if (!s || !s.id || !Array.isArray(s.responses)) return;
      var have = byId(s.id);
      if (!have) { get().sessions.push(s); added++; }
      else if (s.responses.length > have.responses.length) { get().sessions[get().sessions.indexOf(have)] = s; updated++; }
    });
    get().sessions.sort(function (a, b) { return a.startedAt - b.startedAt; });
    save(); return { ok: true, added: added, updated: updated };
  }

  return { load: load, get: get, save: save, start: start, active: active, lastComplete: lastComplete, sessionsFor: sessionsFor, appSessions: appSessions, byId: byId,
    current: current, counts: counts, recordFirst: recordFirst, recordRetry: recordRetry, hint: hint, worked: worked, advance: advance, finish: finish, setConfidence: setConfidence,
    skillMap: skillMap, skillStatus: skillStatus, dimensions: dimensions, pairs: pairs, behaviours: behaviours, language: language, probes: probes, confidence: confidence,
    concerns: concerns, recommend: recommend, history: history, sessionSkills: sessionSkills, exportJSON: exportJSON, importJSON: importJSON, score: score, MIN_ITEMS: MIN_ITEMS, key: key };
})();
