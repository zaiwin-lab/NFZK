/* Bridge: Check My Level (diagnostic tests) → daily learning.
   After every test, skills she struggled with become the focus of her quests, drills and
   Mixed Challenge, so the tests change what she practises — not just what the parent reads.
   - "Needs practice" in a test   → that curriculum skill is flagged for catch-up
   - "Growing"                    → marked as a gap (a smaller boost)
   - missed an earlier-year step  → the matching foundation (basic facts, times tables, clock) is flagged
   A flag clears itself when the skill becomes secure in daily practice (mastery.js). */
window.FMQ = window.FMQ || {};

FMQ.bridge = (function () {
  // Check My Level skill → curriculum skill
  var MAP = {
    'place-value': 'place-value', 'number-names': 'place-value', 'expanded-form': 'place-value', 'compare-order': 'place-value',
    'rounding': 'place-value', 'estimation': 'place-value', 'patterns': 'place-value', 'number-sense': 'place-value',
    'addition': 'add-sub', 'subtraction': 'add-sub', 'inverse-ops': 'add-sub',
    'multiplication': 'times-divide', 'division': 'times-divide', 'mixed-ops': 'times-divide',
    'choose-op': 'word-problems', 'reasonableness': 'word-problems', 'word-problems': 'word-problems', 'key-info': 'word-problems', 'two-step': 'word-problems',
    'tables-data': 'data', 'proportion': 'ratio',
    'clock-read': 'clock', 'am-pm': 'time24', 'time-24': 'time24', 'duration': 'duration', 'time-units': 'duration',
    'money': 'money', 'measure': 'measure'
  };
  // Missed the earlier-year step-down question → which foundation to rebuild
  var FOUNDATION = { addition: 'basic-facts', subtraction: 'basic-facts', 'inverse-ops': 'times-tables', multiplication: 'times-tables', division: 'times-tables',
    'two-step': 'basic-facts', 'word-problems': 'basic-facts', 'clock-read': 'clock', duration: 'clock', 'time-units': 'clock' };

  function apply() {
    if (!FMQ.diagEngine) return [];
    var G = FMQ.diagEngine, state = FMQ.store.get(), M = FMQ.mastery, changed = [];
    function mark(id, how, from) {
      if (!FMQ.skill(id) || M.computeState(state, id) === 'secure') return;
      var k = state.skills[id] = state.skills[id] || {};
      if (how === 'flag' && !k.flag) { k.flag = true; k.flagFrom = 'test'; k.flagTs = Date.now(); changed.push(id); }
      if (how === 'gap' && !k.gap && !k.flag) { k.gap = true; changed.push(id); }
      k.testFrom = (k.testFrom || []).concat(from).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(-6);
    }
    var map = G.skillMap();
    Object.keys(map).forEach(function (sid) {
      var cur = MAP[sid]; if (!cur) return;
      if (map[sid].status === 'needs') mark(cur, 'flag', sid);
      else if (map[sid].status === 'growing') mark(cur, 'gap', sid);
    });
    G.concerns().forEach(function (c) { if (c.probeGap && FOUNDATION[c.skill]) mark(FOUNDATION[c.skill], 'flag', c.skill); });
    FMQ.store.save();
    return changed;
  }

  function hook() {
    if (!FMQ.diagEngine || FMQ.diagEngine._bridged) return;
    var finish = FMQ.diagEngine.finish;
    FMQ.diagEngine.finish = function (s) { var r = finish.apply(this, arguments); apply(); return r; };
    FMQ.diagEngine._bridged = true;
  }

  return { MAP: MAP, apply: apply, hook: hook };
})();
FMQ.bridge.hook();
// Tests taken before this bridge existed: apply their results once.
document.addEventListener('DOMContentLoaded', function () {
  try { var st = FMQ.store.get(); if (!st.profile.bridgeApplied) { FMQ.bridge.apply(); st.profile.bridgeApplied = true; FMQ.store.save(); } } catch (e) {}
});
