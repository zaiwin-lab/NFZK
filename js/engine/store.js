/* Persistent learner record.
   All learner data lives in one JSON document per learner. The storage driver is
   swappable (localStorage today; a server or Supabase table later) without touching
   the engine or UI. */
window.FMQ = window.FMQ || {};

FMQ.storageDriver = (function () {
  var memory = {};
  function ls() { try { return window.localStorage; } catch (e) { return null; } }
  return {
    get: function (key) {
      try { var s = ls(); var raw = s ? s.getItem(key) : memory[key]; return raw ? JSON.parse(raw) : null; }
      catch (e) { return memory[key] ? JSON.parse(memory[key]) : null; }
    },
    set: function (key, value) {
      var raw = JSON.stringify(value);
      memory[key] = raw;
      try { var s = ls(); if (s) s.setItem(key, raw); } catch (e) { /* storage full or blocked: keep in memory */ }
    },
    remove: function (key) {
      delete memory[key];
      try { var s = ls(); if (s) s.removeItem(key); } catch (e) {}
    }
  };
})();

FMQ.util = {
  dayKey: function (d) {
    d = d ? new Date(d) : new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  },
  daysBetween: function (a, b) {
    var da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  },
  addDays: function (key, n) {
    var d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return FMQ.util.dayKey(d);
  },
  uid: function (p) { return (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
  pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
};

FMQ.store = (function () {
  var state = null;
  function key() { return 'fmq:v1:' + FMQ.learner.id; }

  function fresh() {
    var l = FMQ.learner;
    return {
      version: 1,
      profile: { id: l.id, name: l.name, year: l.year, createdAt: Date.now(), onboarded: false, diagnosticDone: false, demo: false },
      skills: {},       // skillId -> { state, struggledTs, comebackTs, masteredTs, gap }
      attempts: [],     // one record per question outcome (see recordAttempt)
      vocab: {},        // word -> { seen, bridged, independent, last, lastDay }
      sessions: [],     // completed sessions with summary
      events: [],       // { ts, day, type: 'comeback' | 'mastered' | 'word', skill, word }
      stars: 0,
      activeQuest: null,
      lastVisitDay: null
    };
  }

  return {
    load: function () {
      state = FMQ.storageDriver.get(key()) || fresh();
      // forward-compatible defaults
      var f = fresh();
      Object.keys(f).forEach(function (k) { if (state[k] === undefined) state[k] = f[k]; });
      state.profile.name = FMQ.learner.name;
      // Older records: the 12-week plan starts from the first session.
      if (!state.profile.startDay && state.sessions.length) state.profile.startDay = state.sessions[0].day;
      // Foundations named in the learner profile start flagged for catch-up (once).
      if (!state.profile.basicsApplied) {
        (FMQ.learner.startWithBasics || []).forEach(function (id) { (state.skills[id] = state.skills[id] || {}).flag = true; });
        state.profile.basicsApplied = true;
      }
      return state;
    },
    get: function () { return state || this.load(); },
    save: function () { if (state) FMQ.storageDriver.set(key(), state); },
    replace: function (next) { state = next; this.save(); },
    reset: function () { state = fresh(); this.save(); return state; },
    fresh: fresh,
    exportJSON: function () { return JSON.stringify(state, null, 2); }
  };
})();
