/* "Check My Level" UI — child screens + Parent View (Paparan Ibu Bapa) diagnostic sections.
   Registers extra views/actions on the existing app; reuses its components and CSS. */
(function () {
  var A = FMQ.app, V = A._views, ACT = A._actions, ui = A._ui, H = A._h;
  var D = FMQ.diag, G = FMQ.diagEngine, I = FMQ.i18n, E = FMQ.util.esc, X = I.X, x = I.x;
  function P2(pair, force) { if (!pair) return ''; if (force === 'en') return E(pair[0]); if (force === 'bm') return E(pair[1]); return X(pair[0], pair[1]); }
  function lines(s) { return String(s).split('\n').map(function (l) { return '<span class="qline">' + E(l) + '</span>'; }).join(''); }
  function qtext(pair, force) {
    var l = force || I.lang();
    if (l === 'bm') return '<div class="qtext" id="qtext" lang="ms">' + lines(pair[1]) + '</div>';
    var en = '<div class="qtext" id="qtext">' + lines(pair[0]) + '</div>';
    if (l === 'en' || pair[0] === pair[1]) return en;
    return en + '<div class="qtext-bm" lang="ms"><span class="bm-tag">BM</span><span>' + E(pair[1]) + '</span></div>';
  }
  function skillLabel(id) { var s = D.SKILLS[id] || [id, id, '•']; return s[2] + ' ' + X(s[0], s[1]); }
  var CHILD = { secure: ['🟢', 'Secure', 'Kukuh'], growing: ['🟡', 'Growing', 'Sedang Berkembang'], needs: ['🔴', 'Needs Practice', 'Perlu Latihan'], none: ['⚪', 'Not Checked Yet', 'Belum Disemak'] };
  var PARENT = { secure: ['🟢', 'Secure', 'Kukuh'], growing: ['🟡', 'Developing', 'Sedang Berkembang'], needs: ['🔴', 'Needs Repair', 'Perlu Dipulihkan'], none: ['⚪', 'Not Tested', 'Belum Diuji'] };
  var TONE = { secure: 'secure', growing: 'building', needs: 'practise', none: 'unknown' };
  function chip(st, table) { var c = (table || CHILD)[st]; return '<span class="chip chip--' + TONE[st] + '"><span aria-hidden="true">' + c[0] + '</span> ' + X(c[1], c[2]) + '</span>'; }
  function fmt(ts) { return new Date(ts).toLocaleDateString(I.lang() === 'en' ? 'en-GB' : 'ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }); }

  /* ── Home card ── */
  function homeCard() {
    var inprog = D.TESTS.filter(function (t) { return G.active(t.id); }).length;
    return '<section class="dg-home"><button class="dg-homecard" data-act="dgOpen"><span class="dg-homeicon" aria-hidden="true">🩺</span><span class="dg-hometext"><b>' + X('Check My Level', 'Semak Tahap Saya') + '</b>' +
      '<small>' + X('Short Maths challenges to help MARIA understand how you learn.', 'Cabaran Matematik pendek untuk membantu MARIA memahami cara awak belajar.') + '</small>' +
      (inprog ? '<small class="dg-resume">▶ ' + X(inprog + ' challenge in progress — continue anytime', inprog + ' cabaran belum selesai — sambung bila-bila masa') + '</small>' : '') + '</span><span aria-hidden="true">→</span></button></section>';
  }

  /* ── Test list ── */
  V.checkLevel = function () {
    var cards = D.TESTS.map(function (t) {
      var act = G.active(t.id), last = G.lastComplete(t.id), body;
      if (!t.ready) body = '<span class="chip chip--unknown">' + X('Coming soon', 'Akan datang') + '</span>';
      else if (act) { var c = G.counts(act); body = '<div class="progress dg-mini"><span style="width:' + (c.done / c.total * 100) + '%"></span></div><button class="btn btn--primary btn--sm" data-act="dgStart" data-arg="' + t.id + '">' + X('Continue (' + c.done + '/' + c.total + ')', 'Sambung (' + c.done + '/' + c.total + ')') + '</button>'; }
      else if (last) body = '<span class="chip chip--secure">✅ ' + X('Done ' + fmt(last.endedAt), 'Selesai ' + fmt(last.endedAt)) + '</span> <button class="btn btn--ghost btn--sm" data-act="dgStart" data-arg="' + t.id + '">' + X('Check again', 'Semak lagi') + '</button>';
      else body = '<button class="btn btn--primary btn--sm" data-act="dgStart" data-arg="' + t.id + '">' + X('Start', 'Mula') + ' →</button>';
      var n = D.questionsFor(t.id).length;
      return '<li class="dg-test' + (t.ready ? '' : ' is-soon') + '"><span class="dg-ticon" aria-hidden="true">' + t.icon + '</span><div class="dg-tbody"><p class="dg-ttitle">' + X('Test ' + t.id + ' · ', 'Ujian ' + t.id + ' · ') + P2(t.title) + '</p>' +
        '<p class="muted small">' + P2(t.blurb) + (t.ready ? ' · ' + X('about ' + t.minutes + ' min · ' + n + ' questions', 'kira-kira ' + t.minutes + ' minit · ' + n + ' soalan') : '') + '</p><div class="dg-tact">' + body + '</div></div></li>';
    }).join('');
    var map = G.skillMap(), checked = Object.keys(map).filter(function (k) { return map[k].status !== 'none'; });
    var mine = checked.length ? '<section class="psec"><h2>' + X('What MARIA knows so far', 'Apa yang MARIA tahu setakat ini') + '</h2><ul class="dg-skills">' + checked.map(function (k) { return '<li>' + skillLabel(k) + ' ' + chip(map[k].status) + '</li>'; }).join('') + '</ul></section>' : '';
    return '<main class="screen">' + H.backBar('🩺 ' + X('Check My Level', 'Semak Tahap Saya')) +
      H.mariaBubble(X('Do one challenge at a time — you can stop and continue later. There is no time limit. If you are not sure, tap “I don’t know yet”. That helps me too!', 'Buat satu cabaran pada satu masa — boleh berhenti dan sambung kemudian. Tiada had masa. Jika tidak pasti, tekan “Belum tahu”. Itu pun membantu saya!'), { name: true }) +
      '<ul class="dg-tests">' + cards + '</ul>' + mine + '</main>';
  };

  /* ── Playing ── */
  function sess() { return G.byId(ui.dg.sid); }
  function startCard() { ui.dg.sel = null; ui.dg.changes = 0; ui.dg.t0 = Date.now(); ui.dg.rec = null; ui.dg.phase = 'q'; ui.dg.msg = null; }
  V.diagQ = function () {
    var s = sess(), d = ui.dg, t = D.test(s.test);
    var c = G.counts(s), n = Math.min(c.done + 1, c.total);
    var head = '<header class="play-top"><button class="iconbtn" data-act="dgPause" aria-label="' + E(x('Pause', 'Berhenti')) + '">✕</button>' +
      '<div class="play-meta"><span class="section-tag">🩺 ' + P2(t.title) + '</span><span class="qcount">' + (d.phase.indexOf('conf') === 0 ? '' : X('Question ' + n + ' of ' + c.total, 'Soalan ' + n + ' daripada ' + c.total)) + '</span></div>' + H.langSwitch(true) + '</header>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + c.total + '" aria-valuenow="' + c.done + '"><span style="width:' + (c.done / c.total * 100) + '%"></span></div>';
    if (d.phase === 'confStart' || d.phase === 'confEnd') return '<main class="screen play">' + head + confView(d.phase === 'confStart') + '</main>';
    var q = G.current(s);
    return '<main class="screen play">' + head + H.mariaBubble(q.isProbe ? X('Quick warm-up question 🌱', 'Soalan pemanas badan 🌱') : '') + questionCard(q) + '</main>';
  };
  function confView(isStart) {
    return '<article class="qcard"><div class="qtext">' + (isStart ? X('Before we start: how do you feel about Maths right now?', 'Sebelum mula: apa perasaan awak tentang Matematik sekarang?') : X('All done! How do you feel about Maths now?', 'Sudah siap! Apa perasaan awak tentang Matematik sekarang?')) + '</div>' +
      '<div class="dg-conf" role="group">' + D.CONFIDENCE.map(function (c) { return '<button class="dg-confbtn" data-act="dgConf" data-arg="' + c.v + '"><span class="dg-emoji" aria-hidden="true">' + c.e + '</span><span>' + P2(c.t) + '</span></button>'; }).join('') + '</div>' +
      '<button class="btn btn--ghost" data-act="dgConf" data-arg="0">' + X('Skip', 'Langkau') + '</button></article>';
  }
  function questionCard(q) {
    var d = ui.dg, force = q.forceLang || (q.langItem ? 'en' : null), answering = d.phase === 'q' || d.phase === 'retry';
    var stages = q.stage ? '<ol class="wh-steps" aria-label="Thinking steps">' + [['WHAT?', 'APA?', 'WHAT'], ['HOW?', 'BAGAIMANA?', 'HOW'], ['DO', 'BUAT', 'DO'], ['CHECK', 'SEMAK', 'CHECK']].map(function (z) {
      return '<li' + (z[2] === q.stage ? ' class="is-now"' : '') + '>' + (I.lang() === 'en' || force === 'en' ? z[0] : z[1]) + '</li>'; }).join('') + '</ol>' : '';
    var table = q.table ? '<div class="v-tablewrap"><table class="v-table"><thead><tr>' + q.table.head.map(function (h) { return '<th scope="col">' + P2(h, force) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      q.table.rows.map(function (r) { return '<tr>' + r.map(function (cell) { return '<td>' + (Array.isArray(cell) ? P2(cell, force) : E(cell)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' : '';
    var struck = d.rec ? [d.rec.answer].concat(d.rec.retryAnswers.map(function (r) { return r.answer; })) : [];
    var input = '';
    if (q.format === 'mcq') {
      input = '<div class="options" role="radiogroup" aria-labelledby="qtext">' + q.opts.map(function (o, i) {
        var v = o.t[0], isStruck = struck.indexOf(v) >= 0 && !(d.phase === 'done' && d.lastCorrect && d.sel === v), cls = 'opt' + (d.sel === v ? ' is-selected' : '') + (isStruck ? ' is-struck' : '') + (d.phase === 'worked' && o.ok ? ' is-correct' : '');
        return '<button class="' + cls + '" role="radio" aria-checked="' + (d.sel === v) + '" data-act="dgSelect" data-arg="' + E(v) + '"' + (!answering || isStruck ? ' disabled' : '') + '><span class="opt-letter" aria-hidden="true">' + 'ABCD'[i] + '</span><span class="opt-text">' + (o.t[0] === o.t[1] ? E(o.t[0]) : P2(o.t, force)) + '</span></button>';
      }).join('') + '</div>';
    } else {
      if (q.format === 'number' || q.format === 'numexplain') input += '<label class="dg-lbl" for="dg-num">' + X('Your answer', 'Jawapan awak') + (q.unit ? ' (' + P2(q.unit, force) + ')' : '') + '</label><input id="dg-num" class="dg-input" inputmode="numeric" autocomplete="off"' + (answering ? '' : ' disabled') + ' value="' + E(d.num || '') + '">';
      if (q.format === 'explain' || q.format === 'numexplain') input += '<label class="dg-lbl" for="dg-text">' + (q.format === 'explain' ? X('Explain here', 'Terangkan di sini') : X('Explain your steps (optional)', 'Terangkan langkah awak (pilihan)')) + '</label><textarea id="dg-text" class="exportbox dg-text"' + (answering ? '' : ' disabled') + '>' + E(d.text || '') + '</textarea>';
    }
    var hints = d.rec && d.rec.hintsCount ? '<section class="panel panel--help"><ol class="hints">' + (q.hints || []).slice(0, d.rec.hintsCount).map(function (h, i) { return '<li class="hint"><span class="hint-level">💡 ' + (i + 1) + '</span><p>' + P2(h, force) + '</p></li>'; }).join('') + '</ol></section>' : '';
    var foot;
    if (answering) foot = '<div class="play-foot dg-foot"><button class="btn btn--primary btn--block" data-act="dgSubmit">' + X('CHECK ANSWER', 'SEMAK JAWAPAN') + '</button>' +
      (d.phase === 'q' ? '<button class="btn btn--ghost btn--block" data-act="dgDontKnow">🤔 ' + X('I don’t know yet', 'Belum tahu') + '</button>' : '<button class="btn btn--ghost btn--block" data-act="dgNext">' + X('Skip for now →', 'Langkau dahulu →') + '</button>') + '</div>';
    else foot = feedback(q, force);
    return '<article class="qcard qcard--notools" aria-labelledby="qtext">' + qtext(q.q, force) + table + stages + input + hints + '</article>' + foot;
  }
  function feedback(q, force) {
    var d = ui.dg, rec = d.rec, more = rec && (q.hints || []).length > rec.hintsCount, next = '<button class="btn btn--primary btn--block" data-act="dgNext">' + X('Next →', 'Seterusnya →') + '</button>';
    if (d.phase === 'worked') return '<div class="feedback feedback--neutral" role="status"><p class="fb-title">📘 ' + X('Here is one way to do it', 'Ini satu cara untuk menyelesaikannya') + '</p><ol class="explain-steps">' + (q.show || []).map(function (st) { return '<li>' + P2(st, force) + '</li>'; }).join('') + '</ol><div class="fb-actions">' + next + '</div></div>';
    if (d.lastCorrect) return '<div class="feedback feedback--good" role="status"><p class="fb-title">' + (rec.attempts > 1 ? X('You got it! 🌟 Well done for trying again.', 'Betul! 🌟 Bagus kerana mencuba lagi.') : X('Great thinking! ⭐ MARIA noted your answer.', 'Pemikiran yang hebat! ⭐ MARIA sudah catat jawapan awak.')) + ' <span class="fb-stars">+1 ⭐</span></p><div class="fb-actions">' + next + '</div></div>';
    var first = rec.attempts === 1;
    var title = rec.dontKnow ? X('Thank you for being honest! 🌱 MARIA noted it.', 'Terima kasih kerana jujur! 🌱 MARIA sudah catat.') : first ? X('MARIA noted your answer. 🌱', 'MARIA sudah catat jawapan awak. 🌱') : X('Not quite yet — that’s okay!', 'Belum lagi — tidak mengapa!');
    var acts = (more ? '<button class="btn btn--soft" data-act="dgHint">💡 ' + X(first ? 'Hint & try again' : 'Another hint', first ? 'Petunjuk & cuba lagi' : 'Petunjuk lagi') + '</button>' : '') +
      (!more && q.show ? '<button class="btn btn--soft" data-act="dgWorked">📘 ' + X('Show me how', 'Tunjukkan cara') + '</button>' : '') + next;
    return '<div class="feedback feedback--almost" role="status"><p class="fb-title">' + title + '</p><p>' + (first ? X('Would you like a hint and one more try? You can also move on.', 'Mahu petunjuk dan cuba sekali lagi? Boleh juga teruskan.') : '') + '</p><div class="fb-actions">' + acts + '</div></div>';
  }
  function readAnswer(q) {
    var d = ui.dg, num = document.getElementById('dg-num'), tx = document.getElementById('dg-text');
    d.num = num ? num.value : d.num; d.text = tx ? tx.value : d.text;
    if (q.format === 'mcq') return d.sel ? { answer: d.sel } : null;
    if (q.format === 'number') return d.num && d.num.trim() ? { answer: d.num.trim() } : null;
    if (q.format === 'explain') return d.text && d.text.trim() ? { answer: d.text.trim() } : null;
    return d.num && d.num.trim() ? { answer: d.num.trim(), text: (d.text || '').trim() } : null;
  }
  function open(s) {
    ui.dg = { sid: s.id, phase: 'q' }; startCard(); ui.dg.num = ''; ui.dg.text = '';
    if (!s.responses.length && !s.confidenceStart) ui.dg.phase = 'confStart';
    H.go('diagQ');
  }
  function afterItem() {
    var s = sess(), end = G.advance(s);
    ui.dg.num = ''; ui.dg.text = '';
    if (end) { ui.dg.phase = 'confEnd'; H.render(); window.scrollTo(0, 0); return; }
    startCard(); H.render(); window.scrollTo(0, 0);
  }
  Object.assign(ACT, {
    dgOpen: function () { H.go('checkLevel'); },
    dgStart: function (tid) { var s = G.active(tid) || G.start(tid); open(s); },
    dgPause: function () { H.go('checkLevel'); },
    dgConf: function (v) {
      var s = sess(), start = ui.dg.phase === 'confStart';
      G.setConfidence(s, start ? 'confidenceStart' : 'confidenceEnd', Number(v) || null);
      if (start) { startCard(); H.render(); } else { G.finish(s); H.go('diagDone'); }
    },
    dgSelect: function (v) { if (ui.dg.sel && ui.dg.sel !== v) ui.dg.changes++; ui.dg.sel = v; H.render(); },
    dgSubmit: function () {
      var s = sess(), q = G.current(s), d = ui.dg, a = readAnswer(q);
      if (!a) { H.toast(x('Choose or type an answer first — or tap “I don’t know yet”', 'Pilih atau taip jawapan dahulu — atau tekan “Belum tahu”')); return; }
      var t = Date.now() - d.t0;
      if (d.phase === 'q') {
        d.rec = G.recordFirst(s, q, { answer: a.answer, text: a.text, timeMs: t, changed: d.changes > 0, changes: d.changes, probeFor: s.pendingProbe ? s.probeFor : null });
        d.lastCorrect = d.rec.correct;
      } else d.lastCorrect = G.recordRetry(s, d.rec, q, { answer: a.answer, text: a.text, timeMs: t });
      d.phase = 'done'; H.render();
    },
    dgDontKnow: function () {
      var s = sess(), q = G.current(s), d = ui.dg;
      d.rec = G.recordFirst(s, q, { dontKnow: true, timeMs: Date.now() - d.t0, probeFor: s.pendingProbe ? s.probeFor : null }); d.lastCorrect = false; d.phase = 'done'; H.render();
    },
    dgHint: function () { var d = ui.dg; G.hint(sess(), d.rec); d.phase = 'retry'; d.sel = null; d.t0 = Date.now(); d.num = ''; H.render(); },
    dgWorked: function () { G.worked(sess(), ui.dg.rec); ui.dg.phase = 'worked'; H.render(); },
    dgNext: function () { afterItem(); },
    dgExport: function () { ui.dgExportOpen = !ui.dgExportOpen; H.render(); },
    dgDownload: function () {
      try { var b = new Blob([G.exportJSON()], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'fathiya-diagnostic-log-' + FMQ.util.dayKey() + '.json'; document.body.appendChild(a); a.click(); a.remove(); }
      catch (e) { H.toast(x('Download not available — copy the text instead', 'Muat turun tidak tersedia — salin teks')); }
    },
    dgCopy: function () { H.copy(G.exportJSON()); },
    dgImportOpen: function () { ui.dgImportOpen = !ui.dgImportOpen; ui.dgImportMsg = null; H.render(); },
    dgImport: function () {
      var box = document.getElementById('dgimport'), r = G.importJSON(box ? box.value : '');
      ui.dgImportMsg = r.ok ? ['Imported: ' + r.added + ' new sessions, ' + r.updated + ' updated. Nothing was deleted.', 'Diimport: ' + r.added + ' sesi baharu, ' + r.updated + ' dikemas kini. Tiada yang dipadam.'] : ['That is not a diagnostic log backup.', 'Itu bukan sandaran log diagnostik.'];
      H.render();
    },
    dgToggle: function (id) { ui.dgOpenEv = ui.dgOpenEv || {}; ui.dgOpenEv[id] = !ui.dgOpenEv[id]; H.render(); }
  });
  document.addEventListener('input', function (e) { if (e.target && (e.target.id === 'dg-num' || e.target.id === 'dg-text') && ui.dg) { ui.dg[e.target.id === 'dg-num' ? 'num' : 'text'] = e.target.value; } });
  document.addEventListener('change', function (e) { if (e.target && e.target.id === 'dg-num' && ui.dg && ui.dg.phase === 'q') ui.dg.changes++; });

  /* ── Child results ── */
  V.diagDone = function () {
    var s = sess(), list = G.sessionSkills(s), name = FMQ.learner.name, order = { secure: 0, growing: 1, needs: 2, none: 3 };
    list.sort(function (a, b) { return order[a.st.status] - order[b.st.status]; });
    var t = D.test(s.test);
    return '<main class="screen screen--center done">' + H.mariaBubble('<b>' + X('Great work, ' + name + ' 🌱', 'Syabas, ' + name + ' 🌱') + '</b><br>' + X('MARIA learned more about how you do Maths today.', 'MARIA belajar lebih lanjut tentang cara awak membuat Matematik hari ini.'), { big: true, name: true }) +
      '<section class="done-card"><h2>' + t.icon + ' ' + P2(t.title) + '</h2><ul class="ticks dg-results">' + list.map(function (y) { return '<li><span>' + skillLabel(y.skill) + '</span>' + chip(y.st.status) + '</li>'; }).join('') + '</ul>' +
      '<p class="victory-stars">⭐ +' + s.stars + ' ' + X('Stars', 'Bintang') + '</p>' +
      '<p>' + X('Next mission: MARIA will help you practise the areas that need a little more work.', 'Misi seterusnya: MARIA akan bantu awak berlatih bahagian yang perlukan sedikit lagi usaha.') + '</p></section>' +
      '<button class="btn btn--primary btn--xl" data-act="dgOpen">' + X('Back to Check My Level', 'Kembali ke Semak Tahap') + '</button><button class="btn btn--ghost" data-act="go" data-arg="home">' + X('Home', 'Utama') + '</button></main>';
  };

  /* ── Parent View sections ── */
  var RATING = { strength: ['🟢', 'Looks secure', 'Nampak kukuh'], developing: ['🟡', 'Developing', 'Sedang berkembang'], concern: ['🔴', 'Needs attention', 'Perlu perhatian'] };
  function noEv() { return '<span class="chip chip--unknown">⚪ ' + X('Not enough evidence yet', 'Belum cukup bukti') + '</span>'; }
  function parentSections() {
    var map = G.skillMap(), dims = G.dimensions(), cs = G.concerns(), rec = G.recommend(), beh = G.behaviours(), lang = G.language(), conf = G.confidence(), ex = G.byId(D.EXAM.id);
    var exSkill = {}; if (ex) ex.responses.forEach(function (y) { var e = exSkill[y.anchorSkill] = exSkill[y.anchorSkill] || { n: 0, k: 0 }; e.n++; if (y.correct) e.k++; });
    var rows = Object.keys(D.SKILLS).map(function (k) {
      var m = map[k], e = exSkill[k];
      return '<tr><th scope="row">' + skillLabel(k) + '</th><td>' + chip(m.status, PARENT) + (m.n ? ' <span class="muted small">' + m.k + '/' + m.n + (m.n < 2 ? ' · ' + x('low confidence', 'keyakinan rendah') : '') + '</span>' : '') + '</td><td class="muted small">' + (e ? e.k + '/' + e.n : '—') + '</td><td><button class="btn btn--ghost btn--sm" data-act="dgToggle" data-arg="h-' + k + '">' + X('History', 'Sejarah') + '</button></td></tr>' +
        (ui.dgOpenEv && ui.dgOpenEv['h-' + k] ? '<tr><td colspan="4">' + historyHtml(k) + '</td></tr>' : '');
    }).join('');
    var mapSec = '<section class="psec dg-psec"><h2>🗺️ ' + X('Current Maths Map', 'Peta Matematik Semasa') + '</h2><p class="muted small">' + X('From the latest “Check My Level” attempt of each test (first-attempt answers, before any hint). One item is low-confidence evidence, never mastery.', 'Daripada percubaan “Semak Tahap” terkini setiap ujian (jawapan cubaan pertama, sebelum petunjuk). Satu soalan ialah bukti berkeyakinan rendah, bukan penguasaan.') + '</p>' +
      '<div class="tablewrap"><table class="ptable"><thead><tr><th scope="col">' + X('Skill', 'Kemahiran') + '</th><th scope="col">' + X('Now', 'Kini') + '</th><th scope="col">' + X('School exam Oct 2026', 'Peperiksaan Okt 2026') + '</th><th scope="col"></th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
    var dimRows = D.DIMS.map(function (d) {
      var o = dims[d.id], r = o.rating === 'insufficient' ? noEv() : '<span class="chip chip--' + (o.rating === 'strength' ? 'secure' : o.rating === 'developing' ? 'building' : 'practise') + '">' + RATING[o.rating][0] + ' ' + X(RATING[o.rating][1], RATING[o.rating][2]) + '</span> <span class="muted small">' + X('confidence: ' + o.conf, 'keyakinan: ' + ({ low: 'rendah', medium: 'sederhana', high: 'tinggi' })[o.conf]) + '</span>';
      return '<li class="dg-dim"><div><b>' + X(d.en, d.bm) + '</b><p class="muted small">' + P2(d.q) + ' · ' + X(o.ok + ' sound, ' + o.concern + ' concern, ' + o.unknown + ' “don’t know”', o.ok + ' baik, ' + o.concern + ' isu, ' + o.unknown + ' “belum tahu”') + '</p></div>' + r + '</li>';
    }).join('');
    var dimSec = '<section class="psec dg-psec"><h2>🧭 ' + X('Reasoning Diagnostic', 'Diagnostik Penaakulan') + '</h2><p class="muted small">' + X('Likely causes, not certainties. At least ' + G.MIN_ITEMS + ' pieces of evidence are needed before a rating is shown.', 'Punca yang mungkin, bukan kepastian. Sekurang-kurangnya ' + G.MIN_ITEMS + ' bukti diperlukan sebelum penilaian dipaparkan.') + '</p><ul class="dg-dims">' + dimRows + '</ul></section>';
    var evSec = '<section class="psec dg-psec"><h2>🔎 ' + X('Evidence: why MARIA thinks this', 'Bukti: kenapa MARIA berfikir begini') + '</h2>' + (cs.length ? '<ul class="dg-concerns">' + cs.map(function (c, i) {
      var name = c.skill.indexOf('pair:') === 0 ? X('Word-problem interpretation (' + c.skill.slice(5) + ')', 'Memahami masalah berayat (' + c.skill.slice(5) + ')') : skillLabel(c.skill);
      var open = ui.dgOpenEv && ui.dgOpenEv['c' + i];
      return '<li class="dg-concern"><button class="sessrow" data-act="dgToggle" data-arg="c' + i + '" aria-expanded="' + !!open + '"><span class="sess-what">' + name + ' — ' + (c.status === 'pattern' ? X('Needs attention', 'Perlu perhatian') : chip(c.status, PARENT)) + '</span><span class="sess-meta">' + (c.likely ? X('likely: ' + c.likely + ' · confidence ' + c.confidence, 'mungkin: ' + c.likely + ' · keyakinan ' + c.confidence) : '') + (c.needsMore ? ' · ' + X('needs further evidence', 'perlu bukti lanjut') : '') + ' ' + (open ? '▲' : '▼') + '</span></button>' +
        (open ? '<div class="dg-ev"><p class="small"><b>' + X('Evidence', 'Bukti') + '</b></p><ul class="small">' + c.evidence.map(function (e) { return '<li>' + E(e) + '</li>'; }).join('') + '</ul><p class="small"><b>' + X('Possible interpretation', 'Tafsiran yang mungkin') + ':</b> ' + P2(c.interpretation) + '</p></div>' : '') + '</li>';
    }).join('') + '</ul>' : '<p class="muted">' + X('No concerns identified yet from Check My Level. Complete Tests A–C to collect evidence.', 'Belum ada isu dikenal pasti daripada Semak Tahap. Lengkapkan Ujian A–C untuk mengumpul bukti.') + '</p>') + '</section>';
    var recSec = '<section class="psec psec--maria dg-psec"><h2>' + H.avatar(28) + ' ' + X('MARIA Recommends', 'Cadangan MARIA') + '</h2>' + (rec.enough ?
      '<p><b>' + X('Next session: ' + rec.minutes + ' minutes', 'Sesi seterusnya: ' + rec.minutes + ' minit') + '</b>' + (rec.lowConf ? ' <span class="muted small">' + X('(shorter — she reported low confidence)', '(lebih pendek — dia melaporkan keyakinan rendah)') + '</span>' : '') + '</p>' +
      '<p class="nf-label">' + X('Focus', 'Fokus') + '</p><ul class="obs">' + (rec.focus.length ? rec.focus.map(function (f) { return '<li>' + P2(f) + '</li>'; }).join('') : '<li>' + X('Keep going with the Daily Quest.', 'Teruskan dengan Misi Harian.') + '</li>') + '</ul>' +
      '<p class="nf-label">' + X('No need currently', 'Tidak perlu buat masa ini') + '</p><ul class="obs">' + (rec.noNeed.length ? rec.noNeed.map(function (f) { return '<li>' + X('additional ' + f[0] + ' drills', 'latihan tambahan ' + f[1]) + '</li>'; }).join('') : '<li class="muted">' + X('Nothing confirmed secure on 2+ items yet.', 'Belum ada yang disahkan kukuh pada 2+ soalan.') + '</li>') + '</ul>' +
      (rec.untested.length ? '<p class="muted small">' + X('Not yet checked: ', 'Belum disemak: ') + rec.untested.map(function (t) { return P2(t); }).join(', ') + '</p>' : '')
      : '<p>' + noEv() + '</p><p class="muted small">' + X('Recommendations appear after at least 5 answers in Check My Level.', 'Cadangan dipaparkan selepas sekurang-kurangnya 5 jawapan dalam Semak Tahap.') + '</p>') + '</section>';
    var behSec = '<section class="psec dg-psec"><h2>🌱 ' + X('How she learns (indicators)', 'Cara dia belajar (petunjuk)') + '</h2>' + (beh.enough ? '<p class="muted small">' + X('Speed is judged against her own median time (' + Math.round(beh.counts.medianMs / 1000) + 's), not a fixed limit.', 'Kelajuan dibanding dengan masa median dirinya sendiri (' + Math.round(beh.counts.medianMs / 1000) + 's), bukan had tetap.') + '</p><ul class="obs">' + (beh.list.length ? beh.list.map(function (b) { return '<li>' + P2(b.t) + ' <span class="muted small">(' + E(b.ev) + ')</span></li>'; }).join('') : '<li>' + noEv() + '</li>') + '</ul>' : noEv()) +
      '<h3>' + X('Maths words (English vs BM)', 'Kata matematik (BI vs BM)') + '</h3>' + (lang.length ? '<ul class="obs">' + lang.map(function (l) { return '<li>“' + E(l.phrase) + '”: ' + (l.understood === 'en' ? X('understood in English', 'difahami dalam BI') : l.understood === 'bm' ? X('understood only in BM', 'hanya difahami dalam BM') : l.understood === 'neither' ? X('not yet in either language', 'belum dalam kedua-dua bahasa') : X('BM check pending', 'semakan BM belum')) + '</li>'; }).join('') + '</ul>' : '<p class="muted small">' + X('Do Test L (Maths Words) to check.', 'Buat Ujian L (Kata Matematik) untuk menyemak.') + '</p>') +
      '<h3>' + X('Her confidence (self-report)', 'Keyakinan dirinya (laporan sendiri)') + '</h3>' + (conf.length ? '<ul class="obs">' + conf.map(function (c) { function em(v) { var z = D.CONFIDENCE.find(function (y) { return y.v === v; }); return z ? z.e + ' ' + x(z.t[0], z.t[1]) : '—'; } return '<li>' + X('Test ', 'Ujian ') + c.test + ' · ' + fmt(c.at) + ': ' + X('start ', 'mula ') + em(c.start) + ' → ' + X('end ', 'akhir ') + em(c.end) + '</li>'; }).join('') + '</ul>' : '<p class="muted small">' + noEv() + '</p>') + '</section>';
    var exSec = ex ? '<section class="psec dg-psec"><h2>📄 ' + P2(ex.label) + '</h2><p class="muted small">' + X('Source: school exam (Pentaksiran Sumatif Year 4, English-medium). Score ' + ex.score + ' — shown to parents only, never to ' + FMQ.learner.name + '.', 'Sumber: peperiksaan sekolah (Pentaksiran Sumatif Tahun 4, bahasa Inggeris). Markah ' + ex.score + ' — untuk ibu bapa sahaja, tidak dipaparkan kepada ' + FMQ.learner.name + '.') + ' ' + P2(D.EXAM.note) + '</p>' +
      '<button class="btn btn--ghost btn--sm" data-act="dgToggle" data-arg="exam">' + (ui.dgOpenEv && ui.dgOpenEv.exam ? X('Hide items', 'Tutup item') : X('Show items', 'Tunjuk item')) + '</button>' +
      (ui.dgOpenEv && ui.dgOpenEv.exam ? '<ul class="small">' + ex.responses.map(function (y) { return '<li>' + (y.correct ? '✓' : '✗') + ' ' + E(y.questionId) + ' · ' + E(y.topic) + '</li>'; }).join('') + '</ul>' : '') +
      '<h3>' + X('Hypotheses to test (not confirmed)', 'Hipotesis untuk diuji (belum disahkan)') + '</h3><ul class="obs">' + D.EXAM.hypotheses.map(function (h) {
        var st = h.skills.map(function (k) { return map[k]; }).filter(function (m) { return m && m.n; }), ev;
        if (h.id === 'P3') ev = lang.length ? lang.filter(function (l) { return l.understood !== 'en'; }).length + '/' + lang.length + x(' phrases not understood in English', ' frasa tidak difahami dalam BI') : null;
        else if (h.id === 'P5') ev = conf.length ? conf.length + x(' self-reports', ' laporan kendiri') : null;
        else ev = st.length ? st.filter(function (m) { return m.status === 'needs'; }).length + ' ' + x('needs repair', 'perlu dipulihkan') + ', ' + st.filter(function (m) { return m.status === 'growing'; }).length + ' ' + x('developing', 'berkembang') + ', ' + st.filter(function (m) { return m.status === 'secure'; }).length + ' ' + x('secure', 'kukuh') : null;
        return '<li><b>' + h.id + '</b> ' + P2(h.t) + ' — ' + (ev ? '<span class="small">' + X('app evidence so far: ', 'bukti aplikasi setakat ini: ') + E(ev) + '</span>' : noEv()) + '</li>';
      }).join('') + '</ul></section>' : '';
    var sessions = G.appSessions().slice().reverse().slice(0, 12).map(function (s) {
      var t = D.test(s.test), main = s.responses.filter(function (y) { return !y.isProbe; });
      return '<li class="sessrow"><span class="sess-day">' + fmt(s.startedAt) + '</span><span class="sess-what">' + X('Test ', 'Ujian ') + s.test + ' · ' + P2(t.title) + ' · ' + (s.kind === 'baseline' ? X('Baseline', 'Garis dasar') : X('Re-check #' + s.attemptNo, 'Semakan semula #' + s.attemptNo)) + (s.planWeek ? ' · ' + X('Week ', 'Minggu ') + s.planWeek : '') + '</span><span class="sess-meta">' + (s.status === 'complete' ? '✅' : '⏸') + ' ' + main.filter(function (y) { return y.correct; }).length + '/' + main.length + ' ' + x('first try', 'cubaan pertama') + ' · ' + s.responses.filter(function (y) { return y.isProbe; }).length + ' ' + x('step-down probes', 'soalan asas') + '</span></li>';
    }).join('');
    var dataSec = '<section class="psec dg-psec"><h2>💾 ' + X('Diagnostic sessions & backup', 'Sesi diagnostik & sandaran') + '</h2><ul class="sesslist">' + (sessions || '<li class="muted">' + X('No Check My Level sessions yet.', 'Belum ada sesi Semak Tahap.') + '</li>') + '</ul>' +
      '<p class="muted small">' + X('The diagnostic log is append-only and stored on this device under its own key. “Reset all progress” does not erase it. Back it up regularly.', 'Log diagnostik hanya ditambah dan disimpan pada peranti ini dengan kunci tersendiri. “Set semula kemajuan” tidak memadamnya. Sandarkan selalu.') + '</p><div class="demos">' +
      '<button class="btn btn--ghost" data-act="dgDownload">⬇ ' + X('Download diagnostic log (JSON)', 'Muat turun log diagnostik (JSON)') + '</button>' +
      '<button class="btn btn--ghost" data-act="dgExport">' + (ui.dgExportOpen ? X('Hide log text', 'Tutup teks log') : X('Show log text to copy', 'Tunjuk teks log untuk disalin')) + '</button>' +
      '<button class="btn btn--ghost" data-act="dgImportOpen">' + (ui.dgImportOpen ? X('Hide import', 'Tutup import') : X('Import diagnostic log', 'Import log diagnostik')) + '</button></div>' +
      (ui.dgExportOpen ? '<textarea id="dgexportbox" class="exportbox" readonly>' + E(G.exportJSON()) + '</textarea><button class="btn btn--soft" data-act="dgCopy">' + X('Copy log', 'Salin log') + '</button>' : '') +
      (ui.dgImportOpen ? '<label class="small" for="dgimport">' + X('Paste a diagnostic log here (it is merged — nothing is deleted)', 'Tampal log diagnostik di sini (digabungkan — tiada yang dipadam)') + '</label><textarea id="dgimport" class="exportbox"></textarea><button class="btn btn--soft" data-act="dgImport">' + X('Merge log', 'Gabung log') + '</button>' + (ui.dgImportMsg ? '<p class="small" role="status">' + P2(ui.dgImportMsg) + '</p>' : '') : '') + '</section>';
    return '<div class="dg-parent"><h2 class="dg-parent-h">🩺 ' + X('Check My Level — Diagnostic', 'Semak Tahap — Diagnostik') + '</h2>' + mapSec + dimSec + evSec + recSec + behSec + exSec + dataSec + '</div>';
  }
  function historyHtml(k) {
    var h = G.history(k);
    if (!h.rows.length) return '<p class="muted small">' + X('No history yet.', 'Belum ada sejarah.') + '</p>';
    return '<div class="tablewrap"><table class="ptable dg-hist"><thead><tr><th>' + X('When', 'Bila') + '</th><th>' + X('First try', 'Cubaan pertama') + '</th><th>' + X('Mistake types', 'Jenis kesilapan') + '</th><th>' + X('Hints / support', 'Petunjuk / bantuan') + '</th><th>' + X('Status', 'Status') + '</th></tr></thead><tbody>' +
      h.rows.map(function (r) {
        return '<tr><td>' + fmt(r.at) + '<br><span class="muted small">' + (r.kind === 'exam' ? X('School exam', 'Peperiksaan sekolah') : (r.kind === 'baseline' ? X('Baseline', 'Garis dasar') : X('Re-check', 'Semakan semula')) + ' · ' + r.test) + (r.week ? ' · W' + r.week : '') + '</span></td><td>' + r.first + '</td><td class="small">' + (Object.keys(r.errors).map(function (e) { return e + ' ×' + r.errors[e]; }).join(', ') || '—') + '</td>' +
          '<td class="small">' + (r.kind === 'exam' ? '—' : r.hints + ' ' + x('hints', 'petunjuk') + ', ' + r.afterSupport + ' ' + x('fixed after support', 'betul selepas bantuan') + (r.worked ? ', ' + r.worked + ' ' + x('worked examples', 'contoh langkah') : '') + (r.probes.length ? '<br>' + x('probes: ', 'asas: ') + E(r.probes.join(', ')) : '')) + '</td><td>' + chip(r.status, PARENT) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="muted small">' + (h.trend === null ? X('Improvement: needs a second Check My Level attempt to compare.', 'Kemajuan: perlu percubaan Semak Tahap kedua untuk dibandingkan.') : h.trend > 0 ? X('Improvement: ⬆ improved since first check.', 'Kemajuan: ⬆ bertambah baik sejak semakan pertama.') : h.trend < 0 ? X('Improvement: ⬇ lower than first check — worth revisiting.', 'Kemajuan: ⬇ lebih rendah daripada semakan pertama — perlu diulang.') : X('Improvement: same as first check.', 'Kemajuan: sama seperti semakan pertama.')) + '</p>';
  }

  FMQ.diagUI = { homeCard: homeCard, parentSections: parentSections };
  G.load();
})();
