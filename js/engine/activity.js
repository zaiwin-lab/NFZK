/* Daily log — what she did and how long she actually studied.
   Study time counts only while the app is on screen AND being used: after 2 minutes with
   no touch, click, key or scroll, the clock stops (so a quest left open overnight does
   not count as hours of study).
   Stored in the main learner record:
     state.activity[day] = { ms, first, last }   active study time per day
     state.profile.activeMs                       running total (used to time each session)
     state.log = [{ ts, end, day, type:'lesson', id, steps, of, ms }]  things that are not sessions */
window.FMQ = window.FMQ || {};

FMQ.activity = (function () {
  var U = FMQ.util, TICK = 10000, IDLE = 120000, lastInput = Date.now(), timer = null, n = 0;

  function st() { return FMQ.store.get(); }
  function ensure(s) {
    s.activity = s.activity || {};
    s.log = s.log || [];
    s.profile.activeMs = s.profile.activeMs || 0;
    return s;
  }
  function active() { return document.visibilityState === 'visible' && Date.now() - lastInput < IDLE; }
  function tick() {
    if (!active()) return;
    var s = ensure(st()), now = Date.now(), d = U.dayKey(), a = s.activity[d] = s.activity[d] || { ms: 0, first: now, last: now };
    a.ms += TICK; a.last = now; s.profile.activeMs += TICK;
    if (++n % 3 === 0) FMQ.store.save();
  }
  function start() {
    if (timer) return;
    ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (e) { document.addEventListener(e, function () { lastInput = Date.now(); }, { passive: true, capture: true }); });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') FMQ.store.save(); else lastInput = Date.now(); });
    window.addEventListener('pagehide', function () { FMQ.store.save(); });
    timer = setInterval(tick, TICK);
  }
  function totalMs() { return ensure(st()).profile.activeMs; }

  /* Lessons (Panduan) are not sessions, so they are logged here. */
  var openLesson = null;
  function lessonOpen(l) {
    var s = ensure(st()), now = Date.now();
    openLesson = { ts: now, end: now, day: U.dayKey(), type: 'lesson', id: l.id, steps: 1, of: l.steps.length, ms0: totalMs(), ms: 0 };
    s.log.push(openLesson);
    if (s.log.length > 3000) s.log.splice(0, s.log.length - 3000);
    FMQ.store.save();
  }
  function lessonStep(step) {
    if (!openLesson) return;
    openLesson.steps = Math.max(openLesson.steps, step + 1);
    openLesson.end = Date.now(); openLesson.ms = totalMs() - openLesson.ms0;
    FMQ.store.save();
  }
  function lessonClose() { if (openLesson) { lessonStep(openLesson.steps - 1); openLesson = null; } }

  /* Everything that happened on one day, oldest first. */
  function entries(state, day) {
    var out = [];
    state.sessions.forEach(function (s) {
      if (s.day !== day || s.mode === 'demo') return;
      out.push({ ts: s.start, kind: 'session', s: s });
    });
    (state.log || []).forEach(function (e) { if (e.day === day) out.push({ ts: e.ts, kind: e.type, e: e }); });
    if (FMQ.diagEngine) FMQ.diagEngine.appSessions().forEach(function (s) {
      var main = s.responses.filter(function (y) { return !y.isProbe; });
      if (!s.responses.length || U.dayKey(s.startedAt) !== day) return;
      out.push({ ts: s.startedAt, kind: 'test', t: s, n: main.length, k: main.filter(function (y) { return y.correct; }).length,
        ms: s.responses.reduce(function (a, y) { return a + (y.totalTimeMs || y.timeSpentMs || 0); }, 0) });
    });
    return out.sort(function (a, b) { return a.ts - b.ts; });
  }
  /* Minutes for a day: measured active time when we have it; otherwise (older days, before
     the tracker existed) an estimate from session lengths, marked as estimated. */
  function dayInfo(state, day) {
    var a = (state.activity || {})[day], list = entries(state, day);
    if (a && a.ms) return { day: day, minutes: Math.round(a.ms / 60000), measured: true, first: a.first, last: a.last, list: list };
    var est = list.reduce(function (m, x) { return m + (x.kind === 'session' ? Math.min(x.s.minutes || 0, 40) : x.kind === 'test' ? Math.round(x.ms / 60000) : 0); }, 0);
    return { day: day, minutes: est, measured: false, first: list.length ? list[0].ts : null, last: null, list: list };
  }
  function days(state, n) {
    var out = [], today = U.dayKey();
    for (var i = 0; i < n; i++) out.push(dayInfo(state, U.addDays(today, -i)));
    return out;
  }

  return { start: start, totalMs: totalMs, lessonOpen: lessonOpen, lessonStep: lessonStep, lessonClose: lessonClose, entries: entries, dayInfo: dayInfo, days: days, ensure: ensure };
})();
