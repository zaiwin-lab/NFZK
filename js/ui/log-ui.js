/* Parent View: Daily Log (Rekod Harian) — study time per day and everything she did,
   with times, results and a copyable text version for sending to family. */
(function () {
  var A = FMQ.app, ACT = A._actions, ui = A._ui, H = A._h, AC = FMQ.activity;
  var I = FMQ.i18n, X = I.X, x = I.x, E = FMQ.util.esc, U = FMQ.util;

  function clock(ts) { return ts ? new Date(ts).toLocaleTimeString(I.lang() === 'en' ? 'en-GB' : 'ms-MY', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''; }
  function acts(n) { return [n + (n === 1 ? ' activity' : ' activities'), n + ' aktiviti']; }
  function mins(m) { if (m < 1) return '<1 min'; return m < 60 ? m + ' min' : Math.floor(m / 60) + ' j ' + (m % 60) + ' min'; }
  function minsEn(m) { if (m < 1) return '<1 min'; return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function skillPair(id) { var s = FMQ.skill(id); return s ? [s.name, s.nameBm || s.name] : [id || '', id || '']; }

  var MODE = {
    quest: ['🗺️', 'Daily Quest', 'Misi Harian'], practice: ['🌱', 'Practice', 'Latihan'], drill: ['⚡', 'Latih Tubi', 'Latih Tubi'],
    checkpoint: ['⭐', 'Checkpoint', 'Semakan'], diagnostic: ['🧭', 'First check-in', 'Diagnostik pertama']
  };
  // One entry → [icon, [en, bm] title, [en, bm] detail, minutes|null]
  function describe(it) {
    if (it.kind === 'session') {
      var s = it.s, m = MODE[s.mode] || ['•', s.mode, s.mode];
      var what = s.title ? s.title : s.kind === 'review' ? ['Review Mix', 'Ulang Kaji Campuran'] : (s.mode === 'diagnostic' || s.mode === 'checkpoint') ? null : skillPair(s.focus);
      var mn = s.activeMin || Math.min(s.minutes || 0, 40);
      return [m[0], what ? [m[1] + ' · ' + what[0], m[2] + ' · ' + what[1]] : [m[1], m[2]],
        [s.questions + ' questions · ' + s.independent + ' correct on her own' + (s.comebacks && s.comebacks.length ? ' · 🎉 comeback' : '') + (s.mastered && s.mastered.length ? ' · 🏆 mastered' : ''),
         s.questions + ' soalan · ' + s.independent + ' betul sendiri' + (s.comebacks && s.comebacks.length ? ' · 🎉 bangkit' : '') + (s.mastered && s.mastered.length ? ' · 🏆 dikuasai' : '')], mn];
    }
    if (it.kind === 'lesson') {
      var e = it.e, l = FMQ.lesson(e.id), t = l ? l.title : [e.id, e.id];
      return ['📘', ['Guide · ' + t[0], 'Panduan · ' + t[1]], ['Read ' + e.steps + ' of ' + e.of + ' steps' + (e.steps >= e.of ? ' ✓' : ''), 'Baca ' + e.steps + ' daripada ' + e.of + ' langkah' + (e.steps >= e.of ? ' ✓' : '')], e.ms ? Math.max(1, Math.round(e.ms / 60000)) : null];
    }
    if (it.kind === 'test') {
      var d = FMQ.diag.test(it.t.test), tt = d ? d.title : ['', ''];
      return ['🩺', ['Check My Level · Test ' + it.t.test + ' ' + tt[0], 'Semak Tahap · Ujian ' + it.t.test + ' ' + tt[1]],
        [it.k + ' of ' + it.n + ' right first time' + (it.t.status === 'complete' ? '' : ' (not finished)'), it.k + ' daripada ' + it.n + ' betul kali pertama' + (it.t.status === 'complete' ? '' : ' (belum selesai)')],
        it.ms ? Math.max(1, Math.round(it.ms / 60000)) : null];
    }
    return ['•', [it.kind, it.kind], ['', ''], null];
  }

  function isOpen(day, dflt) { return ui.logOpen && day in ui.logOpen ? ui.logOpen[day] : dflt; }
  function parentSection() {
    var state = H.state(); AC.ensure(state);
    var days = AC.days(state, 14), today = days[0], week = days.slice(0, 7);
    var studied = week.filter(function (d) { return d.minutes > 0 || d.list.length; });
    var weekMin = week.reduce(function (a, d) { return a + d.minutes; }, 0);
    var avg = studied.length ? Math.round(weekMin / studied.length) : 0;
    var max = Math.max.apply(null, days.map(function (d) { return d.minutes; }).concat([20]));
    var target = 20;

    var bars = days.slice().reverse().map(function (d) {
      var h = Math.round(d.minutes / max * 100), lab = new Date(d.day + 'T12:00:00').toLocaleDateString(I.lang() === 'en' ? 'en-GB' : 'ms-MY', { weekday: 'narrow' });
      return '<div class="lg-col' + (d.day === today.day ? ' is-today' : '') + '" title="' + E(H.fmtDay(d.day) + ': ' + d.minutes + ' min') + '"><span class="lg-val">' + (d.minutes || '') + '</span>' +
        '<span class="lg-bar' + (d.minutes >= target ? ' is-goal' : '') + (d.measured ? '' : ' is-est') + '" style="height:' + Math.max(d.minutes ? 4 : 0, h) + '%"></span><span class="lg-day">' + E(lab) + '</span></div>';
    }).join('');

    var list = days.filter(function (d) { return d.minutes > 0 || d.list.length; }).map(function (d, i) {
      var open = isOpen(d.day, i === 0);
      var span = d.first ? clock(d.first) + (d.last ? ' – ' + clock(d.last) : '') : '';
      var items = d.list.map(function (it) {
        var z = describe(it);
        return '<li class="lg-item"><span class="lg-time">' + clock(it.ts) + '</span><span class="lg-icon" aria-hidden="true">' + z[0] + '</span><span class="lg-what"><b>' + X(z[1][0], z[1][1]) + '</b><small>' + X(z[2][0], z[2][1]) + '</small></span>' +
          (z[3] ? '<span class="lg-min">' + z[3] + ' min</span>' : '') + '</li>';
      }).join('');
      return '<li class="lg-day-row"><button class="sessrow" data-act="logToggle" data-arg="' + d.day + '" aria-expanded="' + open + '">' +
        '<span class="sess-day">' + H.fmtDay(d.day) + '</span><span class="sess-what">' + (d.measured || !d.minutes ? '' : '~') + X(minsEn(d.minutes), mins(d.minutes)) + ' · ' + X(acts(d.list.length)[0], acts(d.list.length)[1]) + '</span>' +
        '<span class="sess-meta">' + E(span) + (d.measured ? '' : ' · ' + x('estimated', 'anggaran')) + ' ' + (open ? '▲' : '▼') + '</span></button>' +
        (open ? (items ? '<ul class="lg-items">' + items + '</ul>' : '<p class="muted small">' + X('Used the app (browsing, no activity finished).', 'Membuka aplikasi (melihat-lihat, tiada aktiviti diselesaikan).') + '</p>') : '') + '</li>';
    }).join('');

    return '<section class="psec lg-sec"><h2>📅 ' + X('Daily Log', 'Rekod Harian') + '</h2>' +
      '<p class="muted small">' + X('Study time counts only while ' + FMQ.learner.name + ' is actively using the app (it stops after 2 minutes without a touch). Days marked ~ are estimated from older records.', 'Masa belajar dikira hanya semasa ' + FMQ.learner.name + ' sedang menggunakan aplikasi (berhenti selepas 2 minit tanpa sentuhan). Hari bertanda ~ ialah anggaran daripada rekod lama.') + '</p>' +
      '<div class="kpis lg-kpis">' +
        '<div class="kpi"><p class="kpi-label">' + X('Today', 'Hari ini') + '</p><p class="kpi-val">' + E(minsEn(today.minutes)) + '</p><p class="kpi-sub">' + X(acts(today.list.length)[0], acts(today.list.length)[1]) + '</p></div>' +
        '<div class="kpi"><p class="kpi-label">' + X('Last 7 days', '7 hari lepas') + '</p><p class="kpi-val">' + X(minsEn(weekMin), mins(weekMin)) + '</p><p class="kpi-sub">' + X('studied on ' + studied.length + ' of 7 days', 'belajar ' + studied.length + ' daripada 7 hari') + '</p></div>' +
        '<div class="kpi"><p class="kpi-label">' + X('Average per study day', 'Purata sehari belajar') + '</p><p class="kpi-val">' + avg + ' min</p><p class="kpi-sub">' + X('aim: about ' + target + ' min', 'sasaran: kira-kira ' + target + ' min') + '</p></div>' +
      '</div>' +
      '<div class="lg-chart" role="img" aria-label="' + E(x('Minutes studied, last 14 days', 'Minit belajar, 14 hari lepas')) + '">' + bars + '</div>' +
      '<p class="legend"><span><i class="lg-key is-goal"></i>' + X(target + '+ min', target + '+ min') + '</span><span><i class="lg-key"></i>' + X('under ' + target + ' min', 'kurang ' + target + ' min') + '</span></p>' +
      (list ? '<ul class="sesslist lg-days">' + list + '</ul>' : '<p class="muted">' + X('Nothing logged in the last 14 days yet.', 'Belum ada rekod dalam 14 hari lepas.') + '</p>') +
      '<button class="btn btn--ghost btn--sm" data-act="logCopy">📋 ' + X('Copy this week’s log (for WhatsApp)', 'Salin rekod minggu ini (untuk WhatsApp)') + '</button></section>';
  }

  function weekText() {
    var state = H.state(), days = AC.days(state, 7), name = FMQ.learner.name;
    var out = ['📅 ' + x('Study log', 'Rekod belajar') + ' — ' + name];
    days.forEach(function (d) {
      out.push('');
      out.push(H.fmtDay(d.day) + ': ' + (d.list.length || d.minutes ? (d.measured ? '' : '~') + x(minsEn(d.minutes), mins(d.minutes)) : x('rest day', 'hari rehat')));
      d.list.forEach(function (it) { var z = describe(it); out.push('  ' + clock(it.ts) + ' ' + z[0] + ' ' + x(z[1][0], z[1][1]) + ' — ' + x(z[2][0], z[2][1]) + (z[3] ? ' (' + z[3] + ' min)' : '')); });
    });
    return out.join('\n');
  }

  Object.assign(ACT, {
    logToggle: function (day, el) { ui.logOpen = ui.logOpen || {}; ui.logOpen[day] = !(el && el.getAttribute('aria-expanded') === 'true'); H.render(); },
    logCopy: function () { H.copy(weekText()); }
  });

  FMQ.logUI = { parentSection: parentSection, weekText: weekText };
})();
