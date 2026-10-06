/* UI layer — renders views and routes actions to the engine.
   Every learner-facing string is a pair (English, Bahasa Malaysia), shown through the
   language switch: BM, BM + English, or English. Child views stay deliberately simple. */
(function () {
  var U = FMQ.util, M = FMQ.mastery, A = FMQ.analytics, maria = FMQ.maria, E = U.esc, I = FMQ.i18n;
  var X = I.X, x = I.x, P = I.P, p = I.p;
  var state, root;
  var ui = { view: 'home', quest: null, card: null, line: null, summary: null, modal: null, confirmReset: false, exportOpen: false, lesson: null, step: 0 };

  /* ───────── helpers ───────── */
  function save() { FMQ.store.save(); }
  function go(view) { ui.view = view; ui.modal = null; render(); window.scrollTo(0, 0); }
  function lang() { return I.lang(); }
  function sk(id) { var s = FMQ.skill(id); return s ? [s.name, s.nameBm || s.name] : [id, id]; }
  function SN(id) { var s = sk(id); return X(s[0], s[1]); }
  function sn(id) { var s = sk(id); return x(s[0], s[1]); }
  function sicon(id) { var s = FMQ.skill(id); return s ? s.icon : '•'; }
  function today() { return U.dayKey(); }
  function doneToday() { return state.sessions.some(function (s) { return s.day === today() && (s.mode === 'quest' || s.mode === 'checkpoint'); }); }
  function tracked(m) { return m === 'quest' || m === 'diagnostic' || m === 'checkpoint'; }
  function assess(m) { return m === 'diagnostic' || m === 'checkpoint'; }
  function fmtDay(key) { return new Date(key + 'T12:00:00').toLocaleDateString(lang() === 'en' ? 'en-GB' : 'ms-MY', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function lines(html) { return html.split('\n').map(function (l) { return '<span class="qline">' + l + '</span>'; }).join(''); }
  function bmOf(arr, i) { return arr && arr[i] ? arr[i] : null; }

  function avatar(size) {
    return '<svg class="maria-av" width="' + (size || 44) + '" height="' + (size || 44) + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--teal)"/><stop offset="1" stop-color="var(--violet)"/></linearGradient></defs>' +
      '<circle cx="24" cy="26" r="20" fill="url(#mg)"/>' +
      '<path d="M24 6c0-4 4-6 8-5-1 4-4 6-8 5z" fill="var(--green)"/><path d="M24 6c0-3-3-5-6-4 1 3 3 4 6 4z" fill="var(--green)" opacity=".75"/>' +
      '<circle cx="17.5" cy="25" r="2.2" fill="var(--on-accent)"/><circle cx="30.5" cy="25" r="2.2" fill="var(--on-accent)"/>' +
      '<path d="M17 32c3.5 3.5 10.5 3.5 14 0" stroke="var(--on-accent)" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';
  }
  function mariaBubble(html, opts) {
    opts = opts || {};
    if (!html) return '';
    return '<div class="maria' + (opts.big ? ' maria--big' : '') + '">' + avatar(opts.big ? 56 : 40) +
      '<div class="maria-bubble">' + (opts.name ? '<p class="maria-name">' + FMQ.brand().buddy + ' <span>· ' + X(FMQ.brand().buddySub, 'Rakan Belajar ' + FMQ.learner.name) + '</span></p>' : '') +
      '<p class="maria-text">' + html + '</p></div></div>';
  }
  function stateChip(st) { var s = M.STATES[st]; return '<span class="chip chip--' + s.tone + '"><span aria-hidden="true">' + s.icon + '</span> ' + E(x(s.label, s.labelBm)) + '</span>'; }
  function langSwitch(compact) {
    var l = lang(), opts = [['bm', 'BM'], ['dual', 'BM + EN'], ['en', 'EN']];
    return '<div class="langsw' + (compact ? ' langsw--sm' : '') + '" role="group" aria-label="Language / Bahasa">' + opts.map(function (o) {
      return '<button class="langsw-btn' + (l === o[0] ? ' is-on' : '') + '" data-act="setLang" data-arg="' + o[0] + '" aria-pressed="' + (l === o[0]) + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function optLabel(q, o) {
    var i = q.options ? q.options.indexOf(o) : -1, bm = (q.optionsBm && i >= 0 && q.optionsBm[i]) || I.trOpt(o);
    return bm === o ? E(o) : X(o, bm);
  }

  /* ───────── views ───────── */
  var views = {};

  views.onboarding = function () {
    var t = maria.onboarding();
    return '<main class="screen screen--center onboard">' +
      '<div class="onboard-top">' + brandLockup() + langSwitch(true) + '</div>' +
      '<div class="onboard-card">' + avatar(84) +
      '<p class="maria-name">' + FMQ.brand().buddy + ' <span>· ' + X(FMQ.brand().buddySub, 'Rakan Belajar ' + FMQ.learner.name) + '</span></p>' +
      '<h1 class="onboard-hello">' + P(t[0]) + '</h1>' +
      '<div class="onboard-lines">' + t.slice(1).map(function (l, i) { return '<p style="--d:' + i + '">' + P(l) + '</p>'; }).join('') + '</div>' +
      '<button class="btn btn--primary btn--xl" data-act="begin">' + X('LET’S GO 🚀', 'JOM MULA 🚀') + '</button></div></main>';
  };

  function brandLockup(small) {
    var b = FMQ.brand();
    return '<div class="lockup' + (small ? ' lockup--sm' : '') + '"><span class="lockup-mark" aria-hidden="true">' + avatar(small ? 30 : 36) + '</span>' +
      '<span class="lockup-text"><b>' + E(b.title) + '</b><small>' + E(x('Year ', 'Tahun ') + FMQ.learner.year + ' · ' + x(b.tagline, 'Belajar Matematik. Bina Bahasa Inggeris. Berkembang Setiap Hari.')) + '</small></span></div>';
  }

  views.home = function () {
    var g = maria.greeting(state), st = A.streak(state), groups = A.skillGroups(state);
    var growing = groups.building.length + groups.practise.filter(function (s) { return M.attemptsFor(state, s.id).length; }).length;
    var aq = state.activeQuest && state.activeQuest.day === today() ? state.activeQuest : null;
    var cta;
    if (doneToday()) {
      cta = '<div class="cta-done"><p class="cta-done-title">' + X('✅ Today’s quest is complete', '✅ Misi hari ini selesai') + '</p><p>' + X('A new quest will be ready tomorrow. You can still read the Guide or do a Latih Tubi.', 'Misi baharu sedia esok. Awak masih boleh baca Panduan atau buat Latih Tubi.') + '</p></div>' +
        '<button class="btn btn--primary btn--xl btn--quest" data-act="mixDrill"><span>⚡ ' + X('BONUS CHALLENGE', 'CABARAN BONUS') + '</span> <span aria-hidden="true">→</span></button>' +
        '<p class="cta-sub">' + X('10 mixed questions on new and growing skills', '10 soalan campuran kemahiran baharu dan yang sedang dibina') + '</p>';
    } else {
      var label = aq && aq.idx > 0 ? X('CONTINUE TODAY’S QUEST', 'SAMBUNG MISI HARI INI') : X('START TODAY’S QUEST WITH ' + FMQ.brand().buddy, 'MULA MISI HARI INI BERSAMA ' + FMQ.brand().buddy);
      var preview = '';
      var dow = new Date().getDay(), weekend = (dow === 0 || dow === 6) && state.sessions.filter(function (s) { return s.mode === 'quest'; }).length >= 3;
      if (state.profile.diagnosticDone && !aq && FMQ.quest.checkpointDue(state)) {
        label = X('START CHECKPOINT WITH ' + FMQ.brand().buddy, 'MULA SEMAKAN BERSAMA ' + FMQ.brand().buddy);
        preview = X('Today: Checkpoint ⭐ · see how you’ve grown', 'Hari ini: Semakan ⭐ · lihat betapa awak sudah berkembang');
      } else if (state.profile.diagnosticDone && !aq && weekend) {
        preview = X('Today: 🍀 Review Mix · about 10 minutes', 'Hari ini: 🍀 Ulang Kaji Campuran · kira-kira 10 minit');
      } else if (state.profile.diagnosticDone && !aq) {
        var f = FMQ.quest.chooseFocus(state);
        preview = sicon(f.focus) + ' ' + X('Today: ' + sk(f.focus)[0] + ' · about 15 minutes', 'Hari ini: ' + sk(f.focus)[1] + ' · kira-kira 15 minit');
      } else if (!state.profile.diagnosticDone) {
        preview = X('First, a few short questions so ' + FMQ.learner.buddy + ' knows where to begin', 'Mula-mula, beberapa soalan pendek supaya ' + FMQ.learner.buddy + ' tahu di mana hendak bermula');
      } else if (aq) {
        preview = X((aq.items.length - aq.idx) + ' questions left', 'Tinggal ' + (aq.items.length - aq.idx) + ' soalan');
      }
      cta = '<button class="btn btn--primary btn--xl btn--quest" data-act="startQuest"><span>' + label + '</span> <span aria-hidden="true">→</span></button><p class="cta-sub">' + preview + '</p>';
    }
    return '<main class="screen home">' +
      '<header class="topbar">' + brandLockup(true) + langSwitch(true) + '</header>' +
      '<section class="home-hero"><h1 class="hello">' + E(x('Hi ', 'Hai ')) + E(FMQ.learner.name) + ' 👋</h1>' +
      mariaBubble('<b>' + P(g.title) + '</b><br>' + P(g.text), { name: true }) + '</section>' +
      '<section class="stats" aria-label="' + E(x('My progress at a glance', 'Kemajuan saya')) + '">' +
        stat('🔥', st.current ? st.current + ' ' + x(st.current === 1 ? 'day' : 'days', 'hari') : x('Start', 'Mula'), X('Learning Streak', 'Hari Berturut')) +
        stat('⭐', state.stars, X('Stars', 'Bintang')) +
        stat('🌱', growing, X('Skills Growing', 'Kemahiran Berkembang')) +
        stat('🏆', groups.secure.length, X('Skills Mastered', 'Kemahiran Dikuasai')) +
      '</section>' +
      '<section class="cta">' + cta + '</section>' +
      (state.profile.diagnosticDone ? weekCard() : '') +
      '<nav class="secondary" aria-label="More">' +
        '<div class="row2">' + navBtn('guide', '📘', X('Learn from basics', 'Panduan dari asas')) + navBtn('drills', '⚡', X('Drills', 'Latih Tubi')) + '</div>' +
        navBtn('practice', '🌱', X('Practice My Skills', 'Latihan Kemahiran')) + navBtn('progress', '🏆', X('My Progress', 'Kemajuan Saya')) + navBtn('parent', '👨‍👧', X('Parent View', 'Paparan Ibu Bapa')) +
      '</nav>' +
      '<footer class="foot">' + E(FMQ.brand().full) + '</footer></main>';
  };
  function weekCard() {
    var info = FMQ.planInfo(state), dots = '';
    for (var i = 0; i < info.goal; i++) dots += '<span class="wk-dot' + (i < info.daysThisWeek ? ' is-on' : '') + '" aria-hidden="true"></span>';
    var reached = info.daysThisWeek >= info.goal;
    var head = info.inPlan ? X('Week ' + info.weekNo + ' of 12', 'Minggu ' + info.weekNo + ' daripada 12') : X('Bonus weeks', 'Minggu bonus');
    var title = info.inPlan ? info.week.icon + ' ' + X(info.week.title, info.week.titleBm) : '🏆 ' + X('Keeping skills strong', 'Kekalkan kemahiran');
    return '<button class="weekcard" data-act="go" data-arg="progress">' +
      '<span class="wk-text"><span class="wk-label">' + head + '</span><span class="wk-title">' + title + '</span></span>' +
      '<span class="wk-goal"><span class="wk-dots">' + dots + '</span><span class="wk-sub">' + (reached ? X('Weekly goal reached 🌟', 'Sasaran minggu ini tercapai 🌟') : X(info.daysThisWeek + ' of ' + info.goal + ' days', info.daysThisWeek + ' daripada ' + info.goal + ' hari')) + '</span></span></button>';
  }
  function stat(icon, val, labelHtml) {
    return '<div class="stat"><span class="stat-icon" aria-hidden="true">' + icon + '</span><span class="stat-val">' + E(val) + '</span><span class="stat-label">' + labelHtml + '</span></div>';
  }
  function navBtn(view, icon, labelHtml) {
    return '<button class="navbtn" data-act="go" data-arg="' + view + '"><span aria-hidden="true">' + icon + '</span><span>' + labelHtml + '</span></button>';
  }

  /* ── Guide (Panduan) ── */
  views.guide = function () {
    var st = M.allStates(state);
    var topics = FMQ.guide.topics.map(function (t) {
      return '<section class="pcard"><h2>' + t.icon + ' ' + P(t.title) + '</h2><ul class="lessons">' + t.lessons.map(function (l) {
        var flag = (state.skills[l.skill] || {}).flag;
        return '<li><button class="lesson-row" data-act="openLesson" data-arg="' + l.id + '"><span class="lesson-icon" aria-hidden="true">' + l.icon + '</span><span class="lesson-name">' + P(l.title) + '</span>' +
          (flag ? '<span class="chip chip--practise">' + X('Start here', 'Mula di sini') + '</span>' : stateChip(st[l.skill])) + '</button></li>';
      }).join('') + '</ul></section>';
    }).join('');
    return '<main class="screen">' + backBar(X('Learn from basics', 'Panduan dari asas')) +
      mariaBubble(X('Pick a lesson. Read it slowly, look at the pictures, then try a quick Latih Tubi.', 'Pilih satu pelajaran. Baca perlahan-lahan, lihat gambar, kemudian cuba Latih Tubi.')) + topics + '</main>';
  };

  views.lesson = function () {
    var l = ui.lesson, i = ui.step, step = l.steps[i], last = i === l.steps.length - 1;
    var dots = l.steps.map(function (_, k) { return '<span class="ldot' + (k === i ? ' is-on' : k < i ? ' is-done' : '') + '"></span>'; }).join('');
    return '<main class="screen lessonpage">' +
      '<header class="play-top"><button class="iconbtn" data-act="go" data-arg="guide" aria-label="' + E(x('Back to the guide', 'Kembali ke panduan')) + '">←</button>' +
      '<div class="play-meta"><span class="section-tag">' + l.icon + ' ' + P(l.title) + '</span><span class="qcount">' + X('Step ' + (i + 1) + ' of ' + l.steps.length, 'Langkah ' + (i + 1) + ' daripada ' + l.steps.length) + '</span></div>' + langSwitch(true) + '</header>' +
      '<div class="ldots" aria-hidden="true">' + dots + '</div>' +
      '<article class="qcard lesson-card"><p class="lesson-text">' + P(step.t) + '</p>' + FMQ.visual(step.v) + '</article>' +
      '<div class="lesson-nav">' + (i > 0 ? '<button class="btn btn--ghost" data-act="lessonStep" data-arg="-1">← ' + X('Back', 'Kembali') + '</button>' : '<span></span>') +
      (last ? '<button class="btn btn--primary" data-act="drillLesson" data-arg="' + l.id + '">⚡ ' + X('Try a Latih Tubi', 'Cuba Latih Tubi') + '</button>'
        : '<button class="btn btn--primary" data-act="lessonStep" data-arg="1">' + X('Next', 'Seterusnya') + ' →</button>') + '</div></main>';
  };

  views.drills = function () {
    var groups = FMQ.guide.topics.map(function (t) {
      return '<section class="pcard"><h2>' + t.icon + ' ' + P(t.title) + '</h2><div class="drillgrid">' + t.lessons.map(function (l) {
        return '<button class="ptile" data-act="drillLesson" data-arg="' + l.id + '"><span class="ptile-icon" aria-hidden="true">' + l.icon + '</span><span class="ptile-name">' + P(l.title) + '</span><span class="ptile-state">⚡ 10 ' + X('questions', 'soalan') + '</span></button>';
      }).join('') + '</div></section>';
    }).join('');
    return '<main class="screen">' + backBar('⚡ ' + X('Drills', 'Latih Tubi')) +
      mariaBubble(P(maria.drillStart())) +
      '<button class="btn btn--primary btn--block" data-act="mixDrill">🎲 ' + X('Mixed Challenge · 10 questions', 'Cabaran Campuran · 10 soalan') + '</button>' + groups + '</main>';
  };

  views.drillDone = function () {
    var q = ui.quest, score = q.results.filter(function (r) { return r.correct && !r.explained; }).length, n = q.results.length;
    var l = FMQ.lesson(q.lessonId);
    var todayDrills = state.sessions.filter(function (s) { return s.mode === 'drill' && s.day === today(); }).length;
    var stars = '';
    for (var k = 0; k < n; k++) stars += '<span class="dstar' + (q.results[k].correct && !q.results[k].explained ? ' is-on' : '') + '">' + (q.results[k].correct ? '★' : '·') + '</span>';
    return '<main class="screen screen--center done">' +
      '<h1 class="victory-title">⚡ ' + X('Drill done', 'Latih Tubi selesai') + '</h1>' +
      '<section class="done-card drillscore"><p class="ds-big">' + score + ' / ' + n + '</p><div class="dstars" aria-hidden="true">' + stars + '</div></section>' +
      mariaBubble(P(maria.drillDone(score, n)) + (todayDrills >= 3 ? '<br>' + P(maria.restHint()) : ''), { name: true }) +
      '<div class="done-actions"><button class="btn btn--primary btn--block" data-act="drillAgain">⚡ ' + X('10 more questions', 'Lagi 10 soalan') + '</button>' +
      (l ? '<button class="btn btn--ghost btn--block" data-act="openLesson" data-arg="' + l.id + '">📘 ' + X('Read the guide again', 'Baca panduan semula') + '</button>' : '') +
      '<button class="btn btn--ghost btn--block" data-act="go" data-arg="home">' + X('Back Home', 'Kembali ke Laman Utama') + '</button></div></main>';
  };

  /* ── Question play ── */
  function currentItem() { return ui.quest.items[ui.quest.idx]; }

  function newCard() {
    var item = currentItem(), q = FMQ.question(item.qid);
    var prev = ui.quest.items[ui.quest.idx - 1], line = null, quest = ui.quest;
    if (ui.pendingLine) { line = ui.pendingLine; ui.pendingLine = null; }
    else if (item.repair) line = ['Same idea, new situation. Let’s see if it transfers.', 'Idea yang sama, situasi baharu. Mari lihat sama ada awak faham.'];
    else if (quest.mode === 'diagnostic' && quest.idx === 0) line = ['Try your best. There’s no rush, and no score.', 'Cuba sebaik mungkin. Tiada tergesa-gesa, dan tiada markah.'];
    else if (quest.mode === 'checkpoint' && quest.idx === 0) line = ['New questions on the skills from your first day. No score, just growth.', 'Soalan baharu tentang kemahiran hari pertama. Tiada markah, cuma melihat perkembangan.'];
    else if (quest.mode === 'drill' && quest.idx === 0) line = maria.drillStart();
    else if (quest.kind === 'review' && quest.idx === 1) line = [FMQ.sections.review.intro, FMQ.sections.review.introBm];
    else if (quest.mode === 'quest' && (!prev || prev.section !== item.section)) line = maria.sectionIntro(quest, item.section);
    else if (quest.mode === 'practice' && quest.idx === 0) line = ['Three questions on ' + sk(quest.focus)[0].toLowerCase() + '. Then we stop.', 'Tiga soalan tentang ' + sk(quest.focus)[1].toLowerCase() + '. Kemudian kita berhenti.'];
    ui.line = line;
    ui.card = { q: q, item: item, selected: null, tries: 0, wrongPicked: [], hints: 0, explained: false,
      bridge: false, bridgeOpen: false, bridgeWord: null, bridgeOut: null, revealed: {},
      confused: false, confuse: null, phase: 'answer', result: null, errorCat: null, triedAlone: false, why: null, startTs: Date.now() };
  }

  function startQuest(q) {
    ui.quest = q;
    if (tracked(q.mode)) { state.activeQuest = q; save(); }
    newCard();
    go('play');
  }

  function highlightText(q, on) {
    var html = E(q.text);
    if (on && q.vocab && q.vocab.length) {
      q.vocab.slice().sort(function (a, b) { return b.length - a.length; }).forEach(function (w) {
        var v = FMQ.vocab[w]; if (!v) return;
        var re = new RegExp('(^|[^A-Za-z])(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z])', 'i');
        html = html.replace(re, function (m, pre, word) { return pre + '<mark class="wb wb--' + v.role + '" data-w="' + E(w) + '">' + word + '</mark>'; });
      });
    }
    return lines(html);
  }
  // The question itself: English, BM, or both (BM directly under the English).
  function questionText(q, bridgeOn) {
    var l = lang(), bm = q.bm || q.text;
    if (l === 'bm') return '<div class="qtext" id="qtext" lang="ms">' + lines(E(bm)) + '</div>';
    var en = '<div class="qtext" id="qtext">' + highlightText(q, bridgeOn) + '</div>';
    if (l === 'en') return en;
    return en + '<div class="qtext-bm" lang="ms"><span class="bm-tag">BM</span><span>' + E(bm) + '</span></div>';
  }

  views.play = function () {
    var c = ui.card, item = c.item, quest = ui.quest;
    var total = quest.items.length, n = quest.idx + 1;
    var sec = FMQ.sections[item.section] || { title: '' };
    var tag = quest.mode === 'quest' ? X(sec.title, sec.titleBm) : quest.mode === 'diagnostic' ? X('Getting to know you', 'Kenali diri') : quest.mode === 'checkpoint' ? X('Checkpoint ⭐', 'Semakan ⭐')
      : quest.mode === 'practice' ? X('Practice · ', 'Latihan · ') + SN(quest.focus) : quest.mode === 'drill' ? '⚡ ' + (quest.title ? P(quest.title) : 'Latih Tubi') : X('Sample flow', 'Contoh');
    var head = '<header class="play-top"><button class="iconbtn" data-act="pause" aria-label="' + E(x('Pause and go home', 'Berhenti dan kembali')) + '">✕</button>' +
      '<div class="play-meta"><span class="section-tag">' + tag + (item.repair ? ' <span class="tag-changed">' + X('Changed question', 'Soalan berbeza') + '</span>' : '') + '</span>' +
      '<span class="qcount">' + X('Question ' + n + ' of ' + total, 'Soalan ' + n + ' daripada ' + total) + '</span></div>' + langSwitch(true) + '</header>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + (n - 1) + '"><span style="width:' + ((n - 1) / total * 100) + '%"></span></div>';
    var body = c.confuse ? confuseView() : c.phase === 'explain' ? explainView() : questionView();
    return '<main class="screen play">' + head + (c.confuse ? '' : mariaBubble(ui.line ? P(ui.line) : '')) + body + '</main>';
  };

  function questionView() {
    var c = ui.card, q = c.q, quest = ui.quest, drill = quest.mode === 'drill';
    var locked = c.phase !== 'answer';
    var opts = q.options.map(function (o, i) {
      var cls = 'opt', struck = c.wrongPicked.indexOf(o) >= 0;
      if (c.selected === o) cls += ' is-selected';
      if (struck) cls += ' is-struck';
      if ((c.phase === 'done' || c.phase === 'drillfb') && o === q.answer && !assess(quest.mode)) cls += ' is-correct';
      return '<button class="' + cls + '" role="radio" aria-checked="' + (c.selected === o) + '" data-act="select" data-arg="' + E(o) + '"' + (locked || struck ? ' disabled' : '') + '>' +
        '<span class="opt-letter" aria-hidden="true">' + 'ABCD'[i] + '</span><span class="opt-text">' + optLabel(q, o) + '</span>' + (struck ? '<span class="sr-only"> (already tried)</span>' : '') + '</button>';
    }).join('');
    var steps = q.level >= 4 ? '<ol class="wh-steps" aria-label="Thinking steps">' + (lang() === 'en' ? '<li>WHAT?</li><li>HOW?</li><li>DO</li><li>CHECK</li>' : '<li>APA?</li><li>BAGAIMANA?</li><li>BUAT</li><li>SEMAK</li>') + '</ol>' : '';
    var tools = '';
    if (c.phase === 'answer' && !drill) {
      tools = '<div class="tools" role="group" aria-label="Help tools">' +
        '<button class="tool tool--help' + (c.hints ? ' is-on' : '') + '" data-act="help"' + (c.hints >= 3 ? ' disabled' : '') + '><span aria-hidden="true">💡</span><span>' + E(x('Help Me', 'Bantu Saya')) + (c.hints ? ' <small>' + c.hints + '/3</small>' : '') + '</span></button>' +
        (lang() !== 'bm' ? '<button class="tool tool--bridge' + (c.bridgeOpen ? ' is-on' : '') + '" data-act="bridge" aria-expanded="' + c.bridgeOpen + '"><span aria-hidden="true">🌐</span><span>' + E(x('Word Bridge', 'Jambatan Kata')) + '</span></button>' : '') +
        '<button class="tool tool--confused" data-act="confused"><span aria-hidden="true">😕</span><span>' + E(x('I’m Confused', 'Saya Keliru')) + '</span></button></div>';
    }
    var help = c.hints ? helpPanel() : '';
    var bridge = c.bridgeOpen && c.phase === 'answer' && lang() !== 'bm' ? bridgePanel() : '';
    var foot = c.phase === 'answer' ? '<div class="play-foot"><button class="btn btn--primary btn--block" data-act="check"' + (c.selected ? '' : ' disabled') + '>' + X('CHECK ANSWER', 'SEMAK JAWAPAN') + '</button></div>' : feedbackPanel();
    return '<article class="qcard' + (tools ? '' : ' qcard--notools') + '" aria-labelledby="qtext">' + questionText(q, c.bridgeOpen && c.phase === 'answer') +
      FMQ.visual(q.visual) + steps + '<div class="options" role="radiogroup" aria-labelledby="qtext">' + opts + '</div>' + tools + help + bridge + '</article>' + foot;
  }

  function helpPanel() {
    var c = ui.card, labels = [['Notice', 'Perhatikan'], ['Strategy', 'Strategi'], ['One step together', 'Satu langkah bersama']];
    var list = c.q.hints.slice(0, c.hints).map(function (h, i) {
      return '<li class="hint"><span class="hint-level">💡 ' + (i + 1) + ' · ' + X(labels[i][0], labels[i][1]) + '</span><p>' + X(h, bmOf(c.q.hintsBm, i)) + '</p></li>';
    }).join('');
    var more = c.phase === 'answer' && c.hints >= 3 ? '<button class="btn btn--soft" data-act="showMe">📘 ' + X('Show Me How', 'Tunjukkan Cara') + '</button>' : '';
    return '<section class="panel panel--help" aria-live="polite"><ol class="hints">' + list + '</ol>' + more + '</section>';
  }

  function bridgePanel() {
    var c = ui.card, q = c.q;
    var chips = (q.vocab || []).map(function (w) {
      var v = FMQ.vocab[w]; if (!v) return '';
      var lvl = M.fadeLevel(state, w), role = FMQ.vocabRoles[v.role];
      var bm = lvl === 'full' ? v.bm : lvl === 'short' ? v.short : c.revealed[w] ? v.short : null;
      var right = bm ? '<span class="pair-bm">' + E(bm) + '</span>' : '<span class="pair-tap">' + (lvl === 'plain' ? X('You know this ✓ · tap to check', 'Awak tahu ✓ · tekan untuk semak') : X('Tap if you need help', 'Tekan jika perlu bantuan')) + '</span>';
      return '<button class="pair pair--' + v.role + (c.bridgeWord === w ? ' is-active' : '') + '" data-act="bridgeWord" data-arg="' + E(w) + '">' +
        '<span class="pair-role" title="' + E(role.label) + '"><span aria-hidden="true">' + role.icon + '</span><span class="sr-only">' + E(role.label) + ':</span></span>' +
        '<span class="pair-en">' + E(w) + '</span><span class="pair-arrow" aria-hidden="true">↔</span>' + right + '</button>';
    }).join('');
    if (!chips) chips = '<p class="muted">' + X('No tricky words here. You can still read it in BM or in simpler English.', 'Tiada perkataan sukar. Awak masih boleh baca dalam BM atau Bahasa Inggeris yang lebih mudah.') + '</p>';
    var out = '';
    if (c.bridgeOut === 'word' && c.bridgeWord) {
      var v = FMQ.vocab[c.bridgeWord];
      out = '<div class="bridge-out"><p class="bo-label">“' + E(c.bridgeWord) + '”</p><p>' + E(v.explain) + '</p><p class="bo-bm" lang="ms">' + E(v.explainBm) + '</p></div>';
    } else if (c.bridgeOut === 'sentence') {
      out = '<div class="bridge-out"><p class="bo-label">Bahasa Malaysia</p><p class="bo-bm" lang="ms">' + E(q.bm) + '</p></div>';
    } else if (c.bridgeOut === 'simple') {
      out = '<div class="bridge-out"><p class="bo-label">' + X('Simpler English', 'Bahasa Inggeris mudah') + '</p><p>' + E(q.simple) + '</p></div>';
    }
    var after = c.bridgeOut ? '<p class="bridge-after">' + avatar(24) + ' ' + P(maria.bridgeAfter()) + '</p>' : '';
    var hasWords = (q.vocab || []).length > 0;
    return '<section class="panel panel--bridge" aria-label="Word Bridge" aria-live="polite">' +
      '<p class="panel-title">🌐 ' + X('Word Bridge', 'Jambatan Kata') + ' <span>' + X('English stays. Bahasa helps.', 'Bahasa Inggeris kekal. BM membantu.') + '</span></p>' +
      '<div class="pairs">' + chips + '</div><div class="bridge-acts">' +
        (hasWords ? '<button class="mini' + (c.bridgeOut === 'word' ? ' is-on' : '') + '" data-act="bridgeAct" data-arg="word">1 · ' + X('Explain this word', 'Terangkan perkataan ini') + '</button>' : '') +
        '<button class="mini' + (c.bridgeOut === 'sentence' ? ' is-on' : '') + '" data-act="bridgeAct" data-arg="sentence">' + (hasWords ? '2' : '1') + ' · ' + X('Explain this sentence in BM', 'Terangkan ayat ini dalam BM') + '</button>' +
        '<button class="mini' + (c.bridgeOut === 'simple' ? ' is-on' : '') + '" data-act="bridgeAct" data-arg="simple">' + (hasWords ? '3' : '2') + ' · ' + X('Make the English simpler', 'Permudahkan Bahasa Inggeris') + '</button>' +
      '</div>' + out + after + '</section>';
  }

  function nextLabel() { return ui.quest.idx + 1 >= ui.quest.items.length ? X('Finish ✓', 'Selesai ✓') : X('Next →', 'Seterusnya →'); }

  function feedbackPanel() {
    var c = ui.card, q = c.q, r = c.result || {}, quest = ui.quest, html = '';
    if (c.phase === 'retry') {
      var nudge = q.wrong && q.wrong[c.wrongPicked[c.wrongPicked.length - 1]];
      return '<div class="feedback feedback--almost" role="status" tabindex="-1" id="fb"><p class="fb-title">' + P(maria.wrongFirst()) + '</p>' +
        '<p>' + (nudge ? X(nudge[1], nudge[2]) : X('Check what the question is asking.', 'Semak apa yang soalan tanya.')) + '</p>' +
        '<div class="fb-actions"><button class="btn btn--primary" data-act="retry">' + X('Try again', 'Cuba lagi') + '</button>' +
        (c.hints < 3 ? '<button class="btn btn--ghost" data-act="helpFromFb">💡 ' + X('Help Me', 'Bantu Saya') + '</button>' : '') + '</div></div>';
    }
    if (c.phase === 'diag') {
      return '<div class="feedback feedback--neutral" role="status" tabindex="-1" id="fb"><p class="fb-title">' + P(c.correctNow ? maria.rightDiag() : maria.wrongDiag()) + '</p>' +
        '<div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">' + nextLabel() + '</button></div></div>';
    }
    if (c.phase === 'drillfb') {
      if (c.correctNow) return '<div class="feedback feedback--good" role="status" tabindex="-1" id="fb"><p class="fb-title">' + P(maria.drillRight()) + '</p><div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">' + nextLabel() + '</button></div></div>';
      return '<div class="feedback feedback--almost" role="status" tabindex="-1" id="fb"><p class="fb-title">' + P(maria.drillWrong()) + '</p><p><b class="fb-ans">' + optLabel(q, q.answer) + '</b></p>' +
        '<ol class="explain-steps">' + q.show.map(function (s, i) { return '<li>' + X(s, bmOf(q.showBm, i)) + '</li>'; }).join('') + '</ol>' +
        '<div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">' + nextLabel() + '</button></div></div>';
    }
    var o = M.OUTCOMES[r.outcome] || M.OUTCOMES.independent;
    if (r.comeback) html += '<div class="comeback" role="status"><p class="comeback-title">' + X('COMEBACK WIN 🎉', 'KEMENANGAN BANGKIT 🎉') + '</p><p>' + P(maria.comeback(q.skill)) + '</p></div>';
    if (r.mastered) html += '<div class="mastered"><span aria-hidden="true">🏆</span> ' + P(maria.mastered(q.skill)) + '</div>';
    html += '<div class="feedback feedback--good" role="status" tabindex="-1" id="fb">' +
      '<p class="fb-outcome"><span aria-hidden="true">' + o.icon + '</span> ' + E(x(o.label, o.labelBm)) + (r.stars ? ' <span class="fb-stars">+' + r.stars + ' ⭐</span>' : '') + '</p>' +
      '<p class="fb-title">' + P(c.message) + '</p>' + (q.check ? '<p class="fb-check"><b>' + X('CHECK', 'SEMAK') + '</b> ' + X(q.check, q.checkBm) + '</p>' : '');
    if (q.why && !assess(quest.mode) && (r.outcome === 'independent' || r.outcome === 'corrected')) html += whyBlock();
    html += '<div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">' + nextLabel() + '</button></div></div>';
    return html;
  }

  function whyBlock() {
    var c = ui.card, w = c.q.why;
    if (c.why === null) {
      return '<div class="why"><p class="why-q">' + X('Bonus: ', 'Bonus: ') + X(w.q, w.qBm) + '</p><div class="why-opts">' +
        w.options.map(function (o, i) { return '<button class="mini" data-act="why" data-arg="' + i + '">' + X(o, bmOf(w.optionsBm, i)) + '</button>'; }).join('') + '</div></div>';
    }
    return '<div class="why"><p class="why-q">' + (c.why ? X('⭐ +3 You explained your thinking.', '⭐ +3 Awak menerangkan cara berfikir.') : X('The reason is: ', 'Sebabnya: ') + X(w.options[w.answer], bmOf(w.optionsBm, w.answer))) + '</p></div>';
  }

  function explainView() {
    var c = ui.card, q = c.q;
    var nx = ui.quest.items[ui.quest.idx + 1], twin = nx && nx.repair && nx.of === q.id;
    return '<article class="qcard qcard--explain"><p class="explain-tag">📘 ' + X('Show Me How', 'Tunjukkan Cara') + '</p>' +
      '<div class="qtext qtext--small">' + lines(E(lang() === 'bm' ? (q.bm || q.text) : q.text)) + '</div>' + FMQ.visual(q.visual) +
      '<ol class="explain-steps">' + q.show.map(function (s, i) { return '<li>' + X(s, bmOf(q.showBm, i)) + '</li>'; }).join('') + '</ol>' +
      '<p class="explain-answer">' + X('Answer: ', 'Jawapan: ') + '<b>' + optLabel(q, q.answer) + '</b></p></article>' +
      '<div class="feedback feedback--neutral" role="status" tabindex="-1" id="fb"><p class="fb-title">' + avatar(24) + ' ' +
      (twin ? P(maria.afterExplain()) : X('Now you’ve seen how it works. We’ll meet this idea again soon.', 'Sekarang awak sudah lihat caranya. Kita akan jumpa idea ini lagi.')) + '</p>' +
      '<div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">' + (twin ? X('Try a different one →', 'Cuba soalan lain →') : nextLabel()) + '</button></div></div>';
  }

  function confuseView() {
    var c = ui.card, cf = c.confuse, lad = cf.ladder;
    if (cf.done) {
      return mariaBubble(P(maria.confusedBack())) +
        '<article class="qcard qcard--mini"><p class="mini-tag">✓ ' + X('Building block done', 'Asas selesai') + '</p>' + questionText(c.q, false) + '</article>' +
        '<div class="play-foot"><button class="btn btn--primary btn--block" data-act="cfBack">' + X('Back to the question →', 'Kembali ke soalan →') + '</button></div>';
    }
    var step = lad.steps[cf.i];
    var opts = step.options.map(function (o, k) {
      var picked = cf.picked && cf.picked.indexOf(o) >= 0, bm = (step.optionsBm && step.optionsBm[k]) || I.trOpt(o);
      return '<button class="opt opt--mini' + (picked ? ' is-struck' : '') + '" data-act="cfPick" data-arg="' + E(o) + '"' + (picked ? ' disabled' : '') + '><span class="opt-text">' + (bm === o ? E(o) : X(o, bm)) + '</span></button>';
    }).join('');
    var intro = cf.i === 0 ? X(maria.confused()[0] + ' ' + lad.intro, maria.confused()[1] + ' ' + (lad.introBm || lad.intro)) : (cf.msg ? P(cf.msg) : X('Good.', 'Bagus.'));
    return mariaBubble(intro) +
      '<article class="qcard qcard--mini" aria-live="polite"><p class="mini-tag">' + X('Smaller step ' + (cf.i + 1) + ' of ' + lad.steps.length, 'Langkah kecil ' + (cf.i + 1) + ' daripada ' + lad.steps.length) + '</p>' +
      '<div class="qtext">' + lines(X(step.text, step.textBm)) + '</div>' + FMQ.visual(step.visual) +
      '<div class="options options--mini">' + opts + '</div>' +
      (cf.wrong ? '<p class="mini-hint">💡 ' + X(step.hint, step.hintBm) + '</p>' : '') + '</article>' +
      '<div class="play-foot"><button class="btn btn--ghost btn--block" data-act="cfBack">' + X('Back to the question', 'Kembali ke soalan') + '</button></div>';
  }

  /* ── After the quest ── */
  views.diagResults = function () {
    var res = ui.quest.results, know = [], grow = [];
    res.forEach(function (r) { var list = r.outcome === 'independent' ? know : grow; if (list.indexOf(r.skill) < 0) list.push(r.skill); });
    grow = grow.filter(function (s) { return know.indexOf(s) < 0; });
    function li(s, icon) { return '<li><span aria-hidden="true">' + icon + '</span> ' + sicon(s) + ' ' + SN(s) + '</li>'; }
    return '<main class="screen screen--center done">' + mariaBubble(P(maria.diagnosticDone()), { big: true, name: true }) +
      '<section class="done-card"><h2>' + X('Things you already know', 'Perkara yang awak sudah tahu') + '</h2><ul class="ticks">' + (know.length ? know.map(function (s) { return li(s, '✅'); }).join('') : '<li>' + X('We’ll find them together soon.', 'Kita akan cari bersama nanti.') + '</li>') + '</ul>' +
      '<h2>' + X('Things we’ll make stronger', 'Perkara yang akan kita kukuhkan') + '</h2><ul class="ticks">' + grow.map(function (s) { return li(s, '🌱'); }).join('') + '</ul></section>' +
      '<button class="btn btn--primary btn--xl" data-act="firstMission">' + X('Start my first mission 🚀', 'Mula misi pertama 🚀') + '</button></main>';
  };

  views.checkpointResults = function () {
    var no = ui.summary.checkpoint, rows = A.checkpointCompare(state, no), grew = rows.filter(function (r) { return r.grew; }).length;
    var list = rows.map(function (r) {
      return '<li class="tvn"><span class="tvn-skill">' + sicon(r.skill) + ' ' + SN(r.skill) + '</span>' +
        '<span class="tvn-then"><small>' + X('Then', 'Dulu') + '</small>' + P(A.outcomeWord(r.then)) + '</span><span class="tvn-arrow" aria-hidden="true">→</span>' +
        '<span class="tvn-now' + (r.grew ? ' is-grew' : '') + '"><small>' + X('Now', 'Kini') + '</small><span aria-hidden="true">' + (r.now === 'independent' ? '✅' : '🌱') + '</span> ' + P(A.outcomeWord(r.now)) + '</span></li>';
    }).join('');
    return '<main class="screen screen--center done"><h1 class="victory-title">' + X('Checkpoint ', 'Semakan ') + no + ' ⭐</h1>' +
      mariaBubble(P(maria.checkpointDone(grew)), { big: true, name: true }) +
      '<section class="done-card"><h2>' + X(FMQ.learner.name + ' then vs now', FMQ.learner.name + ' dulu dan kini') + '</h2><ul class="tvnlist">' + list + '</ul></section>' +
      '<div class="done-actions"><button class="btn btn--primary btn--block" data-act="go" data-arg="home">' + X('Back Home', 'Kembali ke Laman Utama') + '</button>' +
      '<button class="btn btn--ghost btn--block" data-act="go" data-arg="progress">' + X('View My Journey', 'Lihat Perjalanan Saya') + '</button></div></main>';
  };

  views.victory = function () {
    var s = ui.summary, mode = s.mode;
    var title = mode === 'practice' ? X('Practice Complete 🎉', 'Latihan Selesai 🎉') : mode === 'demo' ? X('Sample complete', 'Contoh selesai') : s.kind === 'review' ? X('Review Complete 🍀', 'Ulang Kaji Selesai 🍀') : X('Quest Complete 🎉', 'Misi Selesai 🎉');
    var list = s.strengthened.map(function (id) { return '<li><span aria-hidden="true">✅</span> ' + SN(id) + '</li>'; })
      .concat(s.improvedWords.map(function (w) { return '<li><span aria-hidden="true">✅</span> ' + X('Understanding “' + w + '”', 'Memahami “' + w + '”') + '</li>'; })).join('');
    var cb = s.comebacks.length ? '<div class="comeback comeback--inline"><p class="comeback-title">' + X('COMEBACK WIN 🎉', 'KEMENANGAN BANGKIT 🎉') + '</p><p>' + s.comebacks.map(SN).join(', ') + ': ' + X('you used to need help with this. Today you solved it by yourself.', 'dulu awak perlukan bantuan. Hari ini awak jawab sendiri.') + '</p></div>' : '';
    var ms = s.mastered.length ? '<p class="mastered">🏆 ' + X('Mastered: ', 'Dikuasai: ') + s.mastered.map(SN).join(', ') + '</p>' : '';
    if (s.stamp) ms += '<p class="stampline"><span class="stamp" aria-hidden="true">' + FMQ.plan.weeks[s.stamp - 1].icon + '</span> ' + P(maria.stamp(FMQ.plan.weeks[s.stamp - 1])) + '</p>';
    if (s.milestone) ms += '<p class="stampline"><span class="stamp" aria-hidden="true">🌸</span> ' + P(maria.milestone(s.milestone)) + '</p>';
    var next = s.next ? '<h2>' + X('Tomorrow we’ll continue with', 'Esok kita sambung dengan') + '</h2><ul class="ticks"><li><span aria-hidden="true">🌱</span> ' + SN(s.next) + '</li></ul>' : '';
    var buttons = mode === 'demo'
      ? '<button class="btn btn--primary btn--block" data-act="go" data-arg="parent">' + X('Back to Parent View', 'Kembali ke Paparan Ibu Bapa') + '</button>'
      : '<button class="btn btn--primary btn--block" data-act="go" data-arg="home">' + X('Back Home', 'Kembali ke Laman Utama') + '</button>' +
        '<div class="row2"><button class="btn btn--ghost" data-act="go" data-arg="progress">' + X('View Progress', 'Lihat Kemajuan') + '</button>' +
        '<button class="btn btn--ghost" data-act="parentSummary" data-arg="' + E(s.id) + '">' + X('Parent Summary', 'Ringkasan Ibu Bapa') + '</button></div>';
    return '<main class="screen screen--center done victory"><div class="victory-burst" aria-hidden="true"><span>⭐</span><span>🌱</span><span>⭐</span></div>' +
      '<h1 class="victory-title">' + title + '</h1>' + cb +
      '<section class="done-card">' + (list ? '<h2>' + X('Today you strengthened', 'Hari ini awak kukuhkan') + '</h2><ul class="ticks">' + list + '</ul>' : '<p>' + X('You practised carefully today.', 'Awak berlatih dengan teliti hari ini.') + '</p>') + ms + next +
      '<p class="victory-stars">⭐ +' + s.stars + ' ' + X('Stars', 'Bintang') + '</p></section>' +
      mariaBubble(P(maria.end()), { name: true }) + '<div class="done-actions">' + buttons + '</div>' + (ui.modal ? modal() : '') + '</main>';
  };

  /* ── Child progress ── */
  views.progress = function () {
    var st = M.allStates(state), cmp = A.selfCompare(state), vocab = A.vocabList(state), streak = A.streak(state);
    var journey = FMQ.curriculum.skills.map(function (s) {
      return '<li><button class="jrow jrow--' + st[s.id] + '" data-act="practise" data-arg="' + s.id + '"><span class="jicon" aria-hidden="true">' + s.icon + '</span><span class="jname">' + SN(s.id) + '</span>' + stateChip(st[s.id]) + '</button></li>';
    }).join('');
    var words = vocab.length ? vocab.map(function (v) {
      return '<li class="word word--' + v.status + '"><span aria-hidden="true">' + (v.status === 'known' ? '✅' : '🌱') + '</span> ' + E(v.word) + (lang() !== 'en' && v.bm ? ' <small lang="ms">' + E(v.bm) + '</small>' : '') + '</li>';
    }).join('') : '<li class="muted">' + X('Words will appear here as you meet them in questions.', 'Perkataan akan muncul di sini apabila awak bertemu dengannya.') + '</li>';
    var vs = cmp.first ? '<p class="muted">' + X('After one more week, you’ll see how you’ve grown here.', 'Selepas seminggu lagi, awak akan nampak perkembangan di sini.') + '</p>'
      : (cmp.lines.length ? '<ul class="vs">' + cmp.lines.map(function (l) { return '<li><span class="vs-arrow vs-' + l.dir + '" aria-hidden="true">' + (l.dir === 'up' ? '⬆' : '⬇') + '</span> ' + P(l.text) + '</li>'; }).join('') + '</ul>'
      : '<p class="muted">' + X('Steady week. Keep going one small step at a time.', 'Minggu yang stabil. Teruskan, satu langkah kecil setiap kali.') + '</p>');
    var cbs = state.events.filter(function (e) { return e.type === 'comeback'; }).slice(-5).reverse();
    var cbHtml = cbs.length ? '<section class="pcard"><h2>' + X('Comeback Wins 🎉', 'Kemenangan Bangkit 🎉') + '</h2><ul class="ticks">' + cbs.map(function (e) { return '<li>' + sicon(e.skill) + ' ' + SN(e.skill) + ' <span class="muted">· ' + fmtDay(e.day) + '</span></li>'; }).join('') + '</ul></section>' : '';
    return '<main class="screen progresspage">' + backBar(X('My Progress', 'Kemajuan Saya')) +
      '<section class="pcard"><h2>' + X('Maths Journey', 'Perjalanan Matematik') + '</h2><p class="muted">' + X('What can I do now? Tap a skill to practise it.', 'Apa yang saya boleh buat sekarang? Tekan kemahiran untuk berlatih.') + '</p><ul class="journey">' + journey + '</ul></section>' +
      journeyCard() + gardenCard() +
      '<section class="pcard"><h2>' + X('English Power from Maths', 'Kuasa Bahasa Inggeris dari Matematik') + '</h2><ul class="words">' + words + '</ul></section>' +
      '<section class="pcard"><h2>' + E(FMQ.learner.name) + ' vs ' + E(FMQ.learner.name) + '</h2><p class="muted">' + X('This week compared with before. Nobody else.', 'Minggu ini berbanding sebelum ini. Bukan dengan orang lain.') + '</p>' + vs + '</section>' + cbHtml +
      '<section class="pcard pcard--row"><div><b>' + state.stars + '</b><span>⭐ ' + X('Stars', 'Bintang') + '</span></div><div><b>' + streak.total + '</b><span>📅 ' + X('Learning days', 'Hari belajar') + '</span></div></section></main>';
  };

  function journeyCard() {
    if (!state.profile.diagnosticDone) return '';
    var info = FMQ.planInfo(state), stamps = {};
    state.events.forEach(function (e) { if (e.type === 'stamp') stamps[e.week] = true; });
    var stops = FMQ.plan.weeks.map(function (w) {
      var s = stamps[w.n] ? 'done' : w.n === info.weekNo ? 'now' : w.n < info.weekNo ? 'past' : 'next';
      return '<li class="stop stop--' + s + '"><span class="stop-icon" aria-hidden="true">' + w.icon + '</span><span class="stop-text"><small>' + X('Week ' + w.n, 'Minggu ' + w.n) + (w.checkpoint ? ' · ' + X('Checkpoint ⭐', 'Semakan ⭐') : '') + '</small>' + X(w.title, w.titleBm) + '</span>' +
        (s === 'done' ? '<span class="stop-badge">' + X('Stamp ✓', 'Setem ✓') + '</span>' : s === 'now' ? '<span class="stop-badge stop-badge--now">' + X('This week', 'Minggu ini') + '</span>' : '') + '</li>';
    }).join('');
    return '<section class="pcard"><h2>' + X('My 12-Week Journey', 'Perjalanan 12 Minggu Saya') + '</h2><p class="muted">' + X('Learn on ' + info.goal + ' days in a week to collect that week’s stamp.', 'Belajar ' + info.goal + ' hari seminggu untuk dapat setem minggu itu.') + '</p><ol class="stops">' + stops + '</ol></section>';
  }
  function gardenCard() {
    if (!state.profile.diagnosticDone) return '';
    var g = A.garden(state), rows = '', glyph = { grow: '🌿', bloom: '🌸', star: '⭐', soil: '' };
    for (var w = 0; w < g.weeks; w++) {
      rows += '<div class="grow"><span class="grow-label">' + x('W', 'M') + (w + 1) + '</span>' + g.cells.slice(w * 7, w * 7 + 7).map(function (c) {
        return '<span class="gcell gcell--' + c.kind + (c.future ? ' is-future' : '') + (c.today ? ' is-today' : '') + '" title="' + E(fmtDay(c.day)) + '">' + (glyph[c.kind] || '') + '</span>';
      }).join('') + '</div>';
    }
    return '<section class="pcard"><h2>' + X('My Learning Garden', 'Taman Pembelajaran Saya') + '</h2><p class="muted">' + X('Every learning day grows something. Rest days are fine.', 'Setiap hari belajar menumbuhkan sesuatu. Hari rehat pun tidak mengapa.') + '</p>' +
      '<div class="garden" role="img" aria-label="' + g.grown + ' learning days">' + rows + '</div>' +
      '<p class="legend"><span>🌿 ' + X('Learning day', 'Hari belajar') + '</span><span>🌸 ' + X('Comeback day', 'Hari bangkit') + '</span><span>⭐ ' + X('Checkpoint', 'Semakan') + '</span></p>' +
      '<p class="garden-count"><b>' + g.grown + '</b> ' + X('learning days grown', 'hari belajar') + '</p></section>';
  }

  function backBar(titleHtml, parent) {
    return '<header class="backbar' + (parent ? ' backbar--parent' : '') + '"><button class="iconbtn" data-act="go" data-arg="home" aria-label="' + E(x('Back home', 'Kembali')) + '">←</button><h1>' + titleHtml + '</h1>' + langSwitch(true) + '</header>';
  }

  views.practice = function () {
    var st = M.allStates(state);
    var tiles = FMQ.curriculum.skills.map(function (s) {
      var y = M.STATES[st[s.id]];
      return '<button class="ptile" data-act="practise" data-arg="' + s.id + '"><span class="ptile-icon" aria-hidden="true">' + s.icon + '</span><span class="ptile-name">' + SN(s.id) + '</span><span class="ptile-state"><span aria-hidden="true">' + y.icon + '</span> ' + E(x(y.label, y.labelBm)) + '</span></button>';
    }).join('');
    return '<main class="screen">' + backBar(X('Practice My Skills', 'Latihan Kemahiran')) +
      mariaBubble(X('Pick one skill. We’ll do three questions, then stop.', 'Pilih satu kemahiran. Kita buat tiga soalan, kemudian berhenti.')) + '<div class="ptiles">' + tiles + '</div></main>';
  };

  /* ── Parent dashboard ── */
  views.parent = function () {
    var w = A.weeks(state), now = w.now, before = w.before, groups = A.skillGroups(state), name = FMQ.learner.name;
    function pct(v) { return Math.round(v * 100) + '%'; }
    function delta(a, b, fmt, invert) {
      if (!before.questions) return '';
      var d = a - b; if (Math.abs(d) < 0.005) return '<span class="delta">' + X('no change', 'tiada perubahan') + '</span>';
      var good = invert ? d < 0 : d > 0;
      return '<span class="delta ' + (good ? 'delta--good' : 'delta--watch') + '">' + (d > 0 ? '▲ ' : '▼ ') + fmt(Math.abs(d)) + ' ' + X('vs last week', 'berbanding minggu lalu') + '</span>';
    }
    var hintRate = now.questions ? now.hinted / now.questions : 0, hintRateB = before.questions ? before.hinted / before.questions : 0;
    var bridgeRate = now.questions ? now.bridge / now.questions : 0, bridgeRateB = before.questions ? before.bridge / before.questions : 0;
    var drills = state.sessions.filter(function (s) { return s.mode === 'drill' && s.day >= U.addDays(today(), -6); });
    var kpis = [
      kpi(X('Sessions', 'Sesi'), now.sessions, X(now.minutes + ' minutes in total', now.minutes + ' minit semuanya')),
      kpi(X('Independent answers', 'Jawapan sendiri'), now.questions ? pct(now.independentRate) : '—', delta(now.independentRate, before.independentRate, pct)),
      kpi(X('Hint usage', 'Penggunaan petunjuk'), now.questions ? pct(hintRate) : '—', delta(hintRate, hintRateB, pct, true)),
      kpi(X('Latih Tubi rounds', 'Pusingan Latih Tubi'), drills.length, X('this week', 'minggu ini')),
      kpi(X('Changed-question success', 'Kejayaan soalan berbeza'), now.changed ? now.changedWins + ' / ' + now.changed : '—', X('solved independently', 'dijawab sendiri')),
      kpi(X('Comeback wins', 'Kemenangan bangkit'), now.comebacks, X('this week', 'minggu ini'))
    ].join('');
    function skillList(arr, emptyHtml) { return arr.length ? '<ul class="slist">' + arr.map(function (s) { return '<li>' + s.icon + ' ' + SN(s.id) + '</li>'; }).join('') + '</ul>' : '<p class="muted">' + emptyHtml + '</p>'; }
    var practiseSeen = groups.practise.filter(function (s) { return M.attemptsFor(state, s.id).length; });
    var obs = A.observations(state).map(function (t) { return '<li>' + P(t) + '</li>'; }).join('');
    var rec = A.recommendation(state);
    var pats = A.errorPatterns(state, 14), maxP = pats.reduce(function (m, q) { return Math.max(m, q.count); }, 1);
    var patHtml = pats.length ? '<ul class="bars">' + pats.map(function (q) {
      var cat = FMQ.curriculum.errorCategories[q.cat];
      return '<li><span class="bar-label">' + X(cat.label, cat.labelBm) + '</span><span class="bar-track"><span class="bar-fill" style="width:' + (q.count / maxP * 100) + '%"></span></span><span class="bar-val">' + q.count + '</span>' +
        '<span class="bar-note">' + X('Mostly in ', 'Kebanyakannya dalam ') + q.topSkills.map(SN).join(' & ') + ' · ' + X(cat.parent, cat.parentBm) + '</span></li>';
    }).join('') + '</ul>' : '<p class="muted">' + X('No recurring errors in the last 14 days.', 'Tiada kesilapan berulang dalam 14 hari lepas.') + '</p>';
    var vocabAll = A.vocabList(state);
    var vocab = vocabAll.filter(function (v) { return v.status !== 'known' && v.bridged > 0; }).concat(vocabAll.filter(function (v) { return v.status === 'known'; })).slice(0, 12);
    var vocabHtml = vocab.length ? '<div class="tablewrap"><table class="ptable"><thead><tr><th scope="col">' + X('Word', 'Perkataan') + '</th><th scope="col">BM</th><th scope="col">Status</th><th scope="col" class="num">' + X('BM help', 'Bantuan BM') + '</th></tr></thead><tbody>' +
      vocab.map(function (v) { return '<tr><th scope="row">' + E(v.word) + '</th><td lang="ms">' + E(v.bm || '') + '</td><td>' + (v.status === 'known' ? '<span class="chip chip--secure">✅ ' + X('Understood alone', 'Faham sendiri') + '</span>' : '<span class="chip chip--building">🌱 ' + X('Growing', 'Berkembang') + '</span>') + '</td><td class="num">' + v.bridged + '×</td></tr>'; }).join('') +
      '</tbody></table></div>' : '<p class="muted">' + X('No vocabulary data yet.', 'Belum ada data perbendaharaan kata.') + '</p>';
    var sess = state.sessions.filter(function (s) { return s.mode !== 'demo'; }).slice(-10);
    var chart = sess.length ? independenceChart(sess) : '<p class="muted">' + X('Sessions will appear here.', 'Sesi akan dipaparkan di sini.') + '</p>';
    var recent = sess.slice().reverse().slice(0, 6).map(function (s) {
      var what = s.mode === 'diagnostic' ? X('First diagnostic', 'Diagnostik pertama') : s.mode === 'checkpoint' ? X('Checkpoint ', 'Semakan ') + s.checkpoint + ' ⭐' : s.mode === 'drill' ? '⚡ Latih Tubi · ' + SN(s.focus) : s.mode === 'practice' ? X('Practice · ', 'Latihan · ') + SN(s.focus) : s.kind === 'review' ? X('Weekend Review Mix', 'Ulang Kaji Hujung Minggu') : X('Daily Quest · ', 'Misi Harian · ') + SN(s.focus);
      return '<li><button class="sessrow" data-act="parentSummary" data-arg="' + E(s.id) + '"><span class="sess-day">' + fmtDay(s.day) + '</span><span class="sess-what">' + what + '</span><span class="sess-meta">' + s.minutes + ' min · ' + s.independent + '/' + s.questions + ' ' + x('independent', 'sendiri') + (s.comebacks.length ? ' · 🎉' : '') + '</span></button></li>';
    }).join('');
    var basics = FMQ.curriculum.skills.filter(function (s) { return s.basic; }).map(function (s) {
      var k = state.skills[s.id] || {}, stt = M.computeState(state, s.id);
      return '<li class="basicrow"><span>' + s.icon + ' ' + SN(s.id) + '</span>' + stateChip(stt) +
        '<button class="btn ' + (k.flag ? 'btn--soft' : 'btn--ghost') + ' btn--sm" data-act="toggleBasic" data-arg="' + s.id + '" aria-pressed="' + !!k.flag + '">' + (k.flag ? X('✓ Teaching from basics', '✓ Diajar dari asas') : X('Start from basics', 'Mula dari asas')) + '</button></li>';
    }).join('');

    return '<main class="screen parent">' + backBar(X('Parent View', 'Paparan Ibu Bapa'), true) +
      '<p class="parent-sub">' + E(name) + ' · ' + X('Year ', 'Tahun ') + FMQ.learner.year + ' · ' + (state.profile.demo ? '<span class="chip chip--unknown">' + X('Sample history loaded', 'Contoh sejarah dimuatkan') + '</span>' : X('Live data', 'Data sebenar')) + '</p>' +
      '<section class="psec"><h2>' + X('Language', 'Bahasa') + '</h2><p class="muted small">' + X('BM + English shows every question in both languages. BM only is easiest for understanding; English only builds English. You can switch at any time.', 'BM + Inggeris memaparkan setiap soalan dalam dua bahasa. BM sahaja paling mudah difahami; Inggeris sahaja membina Bahasa Inggeris. Boleh ditukar bila-bila masa.') + '</p>' + langSwitch() + '</section>' +
      '<section class="psec"><h2>' + X('Foundations (catch-up)', 'Asas (pemulihan)') + '</h2><p class="muted small">' + X('If ' + name + ' is unsure about a basic skill, mark it here. Quests will start it from the basics, with Guide lessons and Latih Tubi drills, then move forward when it is secure.', 'Jika ' + name + ' belum faham sesuatu kemahiran asas, tandakan di sini. Misi akan bermula dari asas, dengan Panduan dan Latih Tubi, kemudian bergerak ke hadapan apabila sudah kukuh.') + '</p><ul class="basics">' + basics + '</ul></section>' +
      '<section class="psec"><h2>' + X('This Week', 'Minggu Ini') + '</h2><div class="kpis">' + kpis + '</div></section>' +
      '<section class="psec"><h2>' + X('What can ' + name + ' do now?', 'Apa yang ' + name + ' boleh buat sekarang?') + '</h2><div class="skillcols">' +
        '<div><h3>' + stateChip('secure') + '</h3>' + skillList(groups.secure, X('None confirmed yet.', 'Belum ada yang disahkan.')) + '</div>' +
        '<div><h3>' + stateChip('building') + '</h3>' + skillList(groups.building, X('None right now.', 'Tiada buat masa ini.')) + '</div>' +
        '<div><h3>' + stateChip('practise') + '</h3>' + skillList(practiseSeen, X('No foundations need repair right now.', 'Tiada asas yang perlu dipulihkan sekarang.')) + '</div></div>' +
        '<p class="muted small">' + X(groups.unknown.length + ' skills not yet assessed. One correct answer never counts as mastery here.', groups.unknown.length + ' kemahiran belum dinilai. Satu jawapan betul tidak dikira sebagai penguasaan.') + '</p></section>' +
      '<section class="psec psec--maria"><h2>' + avatar(28) + ' ' + X(FMQ.brand().buddy + '’s Observation', 'Pemerhatian ' + FMQ.brand().buddy) + '</h2><ul class="obs">' + obs + '</ul>' +
        '<div class="nextfocus"><p class="nf-label">' + X('Recommended Next Focus', 'Fokus Seterusnya') + '</p><p class="nf-skill">' + rec.skill.icon + ' ' + SN(rec.skill.id) + '</p><p>' + P(rec.why) + '</p></div></section>' +
      planSection() +
      '<section class="psec"><h2>' + X('What is improving?', 'Apa yang bertambah baik?') + '</h2>' + chart + '</section>' +
      '<section class="psec"><h2>' + X('Why is ' + name + ' struggling?', 'Kenapa ' + name + ' menghadapi kesukaran?') + '</h2><p class="muted small">' + X('Recurring error patterns, last 14 days.', 'Corak kesilapan berulang, 14 hari lepas.') + '</p>' + patHtml + '</section>' +
      '<section class="psec"><h2>' + X('Maths-English Vocabulary', 'Perbendaharaan Kata Matematik (Inggeris)') + '</h2>' + vocabHtml + '</section>' +
      '<section class="psec"><h2>' + X('Recent Sessions', 'Sesi Terkini') + '</h2><ul class="sesslist">' + (recent || '<li class="muted">' + X('No sessions yet.', 'Belum ada sesi.') + '</li>') + '</ul></section>' +
      '<section class="psec"><h2>' + X('See how it works', 'Lihat cara ia berfungsi') + '</h2><div class="demos">' +
        '<button class="btn btn--ghost" data-act="demo" data-arg="mon-1">💡 ' + X('Help Me → Show Me How', 'Bantu Saya → Tunjukkan Cara') + '</button>' +
        '<button class="btn btn--ghost" data-act="demo" data-arg="as-2">🌐 ' + X('Word Bridge', 'Jambatan Kata') + '</button>' +
        '<button class="btn btn--ghost" data-act="demo" data-arg="fr-2">😕 ' + X('I’m Confused', 'Saya Keliru') + '</button></div></section>' +
      '<section class="psec"><h2>' + X('Data', 'Data') + '</h2><div class="demos">' +
        '<button class="btn btn--ghost" data-act="loadDemo">' + X('Load sample history', 'Muat contoh sejarah') + '</button>' +
        '<button class="btn btn--ghost" data-act="exportData">' + (ui.exportOpen ? X('Hide backup', 'Tutup sandaran') : X('Back up progress', 'Sandarkan kemajuan')) + '</button>' +
        '<button class="btn btn--ghost" data-act="restoreOpen">' + (ui.restoreOpen ? X('Hide restore', 'Tutup pemulihan') : X('Restore from backup', 'Pulihkan dari sandaran')) + '</button>' +
        '<button class="btn ' + (ui.confirmReset ? 'btn--danger' : 'btn--ghost') + '" data-act="reset">' + (ui.confirmReset ? X('Tap again to erase all progress', 'Tekan sekali lagi untuk padam semua') : X('Reset all progress', 'Set semula kemajuan')) + '</button></div>' +
        (ui.exportOpen ? '<p class="small">' + X('Copy this text and keep it somewhere safe (for example, email it to yourself).', 'Salin teks ini dan simpan di tempat selamat (contohnya, emel kepada diri sendiri).') + '</p><label class="sr-only" for="exportbox">Backup</label><textarea id="exportbox" class="exportbox" readonly>' + E(FMQ.store.exportJSON()) + '</textarea><button class="btn btn--soft" data-act="copyExport">' + X('Copy backup', 'Salin sandaran') + '</button>' : '') +
        (ui.restoreOpen ? '<label class="small" for="restorebox">' + X('Paste a backup here', 'Tampal sandaran di sini') + '</label><textarea id="restorebox" class="exportbox"></textarea><button class="btn ' + (ui.confirmRestore ? 'btn--danger' : 'btn--soft') + '" data-act="restore">' + (ui.confirmRestore ? X('Tap again to replace current progress', 'Tekan sekali lagi untuk ganti kemajuan') : X('Restore', 'Pulihkan')) + '</button>' + (ui.restoreMsg ? '<p class="small" role="status">' + P(ui.restoreMsg) + '</p>' : '') : '') +
        backupNote() + '</section>' + (ui.modal ? modal() : '') + '</main>';
  };
  function planSection() {
    if (!state.profile.diagnosticDone) return '';
    var info = FMQ.planInfo(state), st = M.allStates(state), stamps = {};
    state.events.forEach(function (e) { if (e.type === 'stamp') stamps[e.week] = true; });
    var rows = FMQ.plan.weeks.map(function (w) {
      var days = FMQ.weekDays(state, w.n);
      var skills = w.skills.map(function (id) { return '<span class="chip chip--' + M.STATES[st[id]].tone + '">' + M.STATES[st[id]].icon + ' ' + SN(id) + '</span>'; }).join(' ');
      return '<tr' + (w.n === info.weekNo ? ' class="is-current"' : '') + '><th scope="row">' + w.n + '</th><td><b>' + w.icon + ' ' + X(w.title, w.titleBm) + '</b>' + (w.checkpoint ? ' <span class="chip chip--unknown">' + X('Checkpoint ', 'Semakan ') + w.checkpoint + '</span>' : '') + '<br><span class="muted small">' + X(w.goal, w.goalBm) + '</span><div class="plan-skills">' + skills + '</div></td>' +
        '<td class="num">' + (w.n > info.weekNo ? '—' : days + ' / 7' + (stamps[w.n] ? ' ✓' : '')) + '</td></tr>';
    }).join('');
    var cps = [1, 2].filter(function (no) { return state.sessions.some(function (s) { return s.mode === 'checkpoint' && s.checkpoint === no; }); });
    var cpHtml = cps.map(function (no) {
      var r = A.checkpointCompare(state, no);
      return '<h3>' + X('Checkpoint ', 'Semakan ') + no + '</h3><div class="tablewrap"><table class="ptable"><thead><tr><th scope="col">' + X('Skill', 'Kemahiran') + '</th><th scope="col">' + X('First diagnostic', 'Diagnostik pertama') + '</th><th scope="col">' + X('Checkpoint ', 'Semakan ') + no + '</th></tr></thead><tbody>' +
        r.map(function (y) { return '<tr><th scope="row">' + SN(y.skill) + '</th><td>' + P(A.outcomeWord(y.then)) + '</td><td>' + (y.grew ? '⬆ ' : '') + P(A.outcomeWord(y.now)) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }).join('');
    return '<section class="psec"><h2>' + X('3-Month Plan', 'Rancangan 3 Bulan') + '</h2><p class="muted small">' + (info.inPlan ? X('Week ' + info.weekNo + ' of 12 · started ' + fmtDay(info.start) + '.', 'Minggu ' + info.weekNo + ' daripada 12 · bermula ' + fmtDay(info.start) + '.') : X('The 12 weeks are complete.', '12 minggu telah tamat.')) + '</p>' +
      '<div class="tablewrap"><table class="ptable plan"><thead><tr><th scope="col">#</th><th scope="col">' + X('Theme and skills', 'Tema dan kemahiran') + '</th><th scope="col" class="num">' + X('Days', 'Hari') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      (cpHtml ? '<div class="cp">' + cpHtml + '</div>' : '') + '</section>';
  }
  function backupNote() {
    var lb = state.profile.lastBackup, days = lb ? U.daysBetween(lb, today()) : null;
    if (state.sessions.length < 3) return '';
    if (days === null || days > 7) return '<p class="backup-note">💾 ' + X('Progress is saved only on this device. A weekly backup keeps 3 months of progress safe.', 'Kemajuan disimpan pada peranti ini sahaja. Sandaran setiap minggu memastikan kemajuan 3 bulan selamat.') + '</p>';
    return '<p class="muted small">' + X('Last backup: ', 'Sandaran terakhir: ') + fmtDay(lb) + '.</p>';
  }
  function kpi(labelHtml, val, sub) { return '<div class="kpi"><p class="kpi-label">' + labelHtml + '</p><p class="kpi-val">' + E(val) + '</p><p class="kpi-sub">' + (sub || '') + '</p></div>'; }
  function independenceChart(sess) {
    var cols = sess.map(function (s) {
      var n = Math.max(1, s.questions), ind = s.independent, help = s.needed.filter(function (y) { return !y.explained; }).length;
      var exp = s.needed.filter(function (y) { return y.explained; }).length, other = Math.max(0, n - ind - help - exp);
      function seg(cls, v) { return v ? '<span class="seg ' + cls + '" style="flex:' + v + '"></span>' : ''; }
      return '<div class="col"><div class="stack" role="img" aria-label="' + fmtDay(s.day) + ': ' + ind + '/' + n + '">' + seg('seg--other', other) + seg('seg--exp', exp) + seg('seg--help', help) + seg('seg--ind', ind) +
        '</div><span class="col-label">' + new Date(s.day + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + '</span></div>';
    }).join('');
    return '<div class="chartwrap"><div class="ichart">' + cols + '</div></div><p class="legend"><span><i class="seg--ind"></i>' + X('Independent', 'Sendiri') + '</span><span><i class="seg--help"></i>' + X('With hints', 'Dengan petunjuk') + '</span><span><i class="seg--exp"></i>' + X('With explanation', 'Dengan penerangan') + '</span><span><i class="seg--other"></i>' + X('Other', 'Lain-lain') + '</span></p>';
  }

  function modal() {
    var s = state.sessions.find(function (y) { return y.id === ui.modal; }) || ui.summary;
    if (!s) return '';
    return '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mtitle"><div class="modal-card">' +
      '<h2 id="mtitle">' + X('Today’s Learning', 'Pembelajaran Hari Ini') + ' <span class="muted">· ' + fmtDay(s.day) + '</span></h2><dl class="summary">' +
      summaryText(s).map(function (r) { return '<div><dt>' + P(r[0]) + '</dt><dd>' + P(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="row2"><button class="btn btn--ghost" data-act="copySummary">' + X('Copy', 'Salin') + '</button><button class="btn btn--primary" data-act="closeModal">' + X('Close', 'Tutup') + '</button></div></div></div>';
  }
  function summaryText(s) {
    function names(ids, i) { return ids.map(function (id) { return sk(id)[i]; }).join(', '); }
    var support = s.needed.length ? [s.needed.map(function (y) { return y.explained ? 'Explanation for ' + sk(y.skill)[0].toLowerCase() : y.hints + ' hint' + (y.hints > 1 ? 's' : '') + ' for ' + sk(y.skill)[0].toLowerCase(); }).join('; '),
      s.needed.map(function (y) { return y.explained ? 'Penerangan untuk ' + sk(y.skill)[1].toLowerCase() : y.hints + ' petunjuk untuk ' + sk(y.skill)[1].toLowerCase(); }).join('; ')] : ['None. All answers without hints.', 'Tiada. Semua jawapan tanpa petunjuk.'];
    return [
      [['Completed', 'Selesai'], [s.minutes + ' minutes · ' + s.questions + ' questions (' + s.independent + ' independent)', s.minutes + ' minit · ' + s.questions + ' soalan (' + s.independent + ' sendiri)']],
      [['Strengthened', 'Dikukuhkan'], s.strengthened.length ? [names(s.strengthened, 0), names(s.strengthened, 1)] : '—'],
      [['Improved', 'Bertambah baik'], s.improvedWords.length ? ['Understanding ' + s.improvedWords.join(', ') + ' without BM help', 'Memahami ' + s.improvedWords.join(', ') + ' tanpa bantuan BM'] : s.mastered.length ? ['Mastered ' + names(s.mastered, 0), 'Menguasai ' + names(s.mastered, 1)] : '—'],
      [['Needed support', 'Perlukan bantuan'], support],
      [['Comeback', 'Bangkit'], s.comebacks.length ? ['Solved a changed ' + names(s.comebacks, 0).toLowerCase() + ' question independently', 'Menjawab soalan ' + names(s.comebacks, 1).toLowerCase() + ' yang berbeza sendiri'] : '—'],
      [['Next', 'Seterusnya'], s.next ? sk(s.next) : '—']
    ];
  }

  /* ───────── actions ───────── */
  function finalize(correct, explained) {
    var c = ui.card, q = c.q, item = c.item, quest = ui.quest;
    var a = {
      qid: q.id, skill: q.skill, level: q.level, mode: quest.mode, section: item.section, changed: !!item.changed,
      correct: correct, firstTry: c.tries <= 1, tries: c.tries, hints: c.hints, explained: !!explained,
      // Seeing the BM text counts as Bahasa support for vocabulary tracking.
      bridge: c.bridge || lang() !== 'en', lang: lang(), confused: c.confused, triedAlone: c.triedAlone,
      errorCat: (correct && c.tries <= 1) ? null : (c.errorCat || (explained && !c.tries ? 'CONCEPT' : null)),
      ms: Date.now() - c.startTs, checkpoint: quest.checkpoint || undefined
    };
    var r;
    if (quest.mode === 'demo') r = M.record(JSON.parse(JSON.stringify(state)), a);
    else {
      r = M.record(state, a);
      if (c.confused) {
        var pr = (FMQ.skill(q.skill).prereqs || []).find(function (id) { return M.computeState(state, id) !== 'secure'; });
        if (pr) (state.skills[pr] = state.skills[pr] || {}).gap = true;
      }
    }
    quest.stars += r.stars;
    quest.results.push({ qid: q.id, skill: q.skill, correct: correct, explained: !!explained, hints: c.hints, outcome: r.outcome, comeback: r.comeback, mastered: r.mastered, wordWins: r.wordWins });
    var note = FMQ.quest.adapt(state, quest, item, a);
    if (note && note.indexOf('light') >= 0) ui.pendingLine = maria.lighten();
    c.result = r; c.lastAttempt = a;
    if (quest.mode !== 'demo') { state.activeQuest = tracked(quest.mode) ? quest : state.activeQuest; save(); }
    return r;
  }

  function finish() {
    var quest = ui.quest, s = A.summarise(state, quest);
    if (quest.mode !== 'demo') {
      state.sessions.push(s);
      if (quest.mode === 'diagnostic') { state.profile.diagnosticDone = true; if (!state.profile.startDay) state.profile.startDay = today(); }
      if (tracked(quest.mode)) {
        var info = FMQ.planInfo(state);
        if (info.inPlan && info.daysThisWeek >= info.goal && !state.events.some(function (e) { return e.type === 'stamp' && e.week === info.weekNo; })) {
          state.events.push({ ts: Date.now(), day: today(), type: 'stamp', week: info.weekNo }); s.stamp = info.weekNo;
        }
        var grown = A.garden(state).grown;
        if (FMQ.plan.milestones.indexOf(grown) >= 0 && !state.events.some(function (e) { return e.type === 'milestone' && e.n === grown; })) {
          state.events.push({ ts: Date.now(), day: today(), type: 'milestone', n: grown }); s.milestone = grown;
        }
      }
      if (state.activeQuest && state.activeQuest.id === quest.id) state.activeQuest = null;
      save();
    }
    ui.summary = s;
    go(quest.mode === 'diagnostic' ? 'diagResults' : quest.mode === 'checkpoint' ? 'checkpointResults' : quest.mode === 'drill' ? 'drillDone' : 'victory');
  }

  function focusFeedback() {
    var fb = document.getElementById('fb');
    if (fb) { fb.focus({ preventScroll: true }); fb.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }); }
  }
  function startDrill(lessonId) {
    var l = FMQ.lesson(lessonId); if (!l) return;
    var q = FMQ.quest.buildDrill(l.drill, 10, l.title);
    q.lessonId = l.id;
    startQuest(q);
  }

  var actions = {
    begin: function () { state.profile.onboarded = true; save(); startQuest(FMQ.quest.buildDiagnostic()); },
    go: function (v) { ui.confirmReset = false; ui.exportOpen = false; go(v); },
    setLang: function (l) { I.setLang(l); render(); },
    startQuest: function () {
      var aq = state.activeQuest;
      if (aq && aq.day === today() && aq.idx < aq.items.length) {
        ui.quest = aq; newCard(); if (aq.idx > 0) ui.line = ['Welcome back. Let’s continue where we paused.', 'Selamat kembali. Mari sambung dari tempat kita berhenti.']; go('play'); return;
      }
      if (!state.profile.diagnosticDone) { startQuest(FMQ.quest.buildDiagnostic()); return; }
      if (doneToday()) return;
      var due = FMQ.quest.checkpointDue(state);
      startQuest(due ? FMQ.quest.buildCheckpoint(state, due) : FMQ.quest.buildDaily(state));
    },
    firstMission: function () {
      var q = FMQ.quest.buildDaily(state);
      q.items = q.items.filter(function (i) { return i.section === 'skill' || i.section === 'fix'; });
      startQuest(q);
    },
    practise: function (id) { startQuest(FMQ.quest.buildPractice(state, id)); },
    demo: function (qid) { startQuest(FMQ.quest.buildDemo(qid)); },
    openLesson: function (id) { ui.lesson = FMQ.lesson(id); ui.step = 0; go('lesson'); },
    lessonStep: function (d) { ui.step = Math.max(0, Math.min(ui.lesson.steps.length - 1, ui.step + Number(d))); render(); window.scrollTo(0, 0); },
    drillLesson: function (id) { startDrill(id); },
    drillAgain: function () { if (ui.quest.mix) actions.mixDrill(); else startDrill(ui.quest.lessonId); },
    mixDrill: function () {
      // Prefer skills she has not tried yet, then ones still growing; fall back to everything.
      var st = M.allStates(state), rank = { unknown: 0, practise: 1, building: 2, secure: 3 };
      var skills = FMQ.curriculum.skills.map(function (s) { return s.id; }).filter(function (id) { return FMQ.gen.templatesFor(id).length; })
        .sort(function (a, b) { return rank[st[a]] - rank[st[b]] || Math.random() - 0.5; }).slice(0, 4);
      var tpls = [];
      skills.forEach(function (id) { var all = FMQ.gen.templatesFor(id), easy = all.filter(function (t) { return t.level <= 2; }); (easy.length ? easy : all).slice(0, 3).forEach(function (t) { tpls.push(t.id); }); });
      var q = FMQ.quest.buildDrill(tpls, 10, ['Mixed Challenge', 'Cabaran Campuran']);
      q.mix = true; startQuest(q);
    },
    toggleBasic: function (id) { var k = state.skills[id] = state.skills[id] || {}; k.flag = !k.flag; save(); render(); },
    pause: function () {
      if (ui.quest && tracked(ui.quest.mode)) { state.activeQuest = ui.quest; save(); }
      go(ui.quest && ui.quest.mode === 'demo' ? 'parent' : ui.quest && ui.quest.mode === 'drill' ? 'drills' : 'home');
    },
    select: function (opt) { if (ui.card.phase !== 'answer') return; ui.card.selected = opt; render(); },
    check: function () {
      var c = ui.card, q = c.q;
      if (!c.selected || c.phase !== 'answer') return;
      c.tries++;
      var ok = c.selected === q.answer;
      if (!ok) {
        var wr = q.wrong && q.wrong[c.selected];
        c.errorCat = wr ? wr[0] : (c.bridge ? 'UNDERSTAND' : q.level <= 1 ? 'CONCEPT' : 'PLAN');
        if (c.hints === 0 && c.tries === 1) c.triedAlone = true;
      }
      if (assess(ui.quest.mode)) { finalize(ok, false); c.correctNow = ok; c.phase = 'diag'; render(); focusFeedback(); return; }
      if (ui.quest.mode === 'drill') { finalize(ok, false); c.correctNow = ok; if (!ok) c.wrongPicked.push(c.selected); c.phase = 'drillfb'; render(); focusFeedback(); return; }
      if (ok) {
        var r = finalize(true, false);
        c.message = maria.correct({ outcome: r.outcome, item: c.item, q: q, wordWins: r.wordWins, quest: ui.quest });
        c.phase = 'done';
      } else {
        c.wrongPicked.push(c.selected);
        c.selected = null;
        if (c.tries >= 2) { finalize(false, true); c.phase = 'explain'; ui.line = ['Let’s look at it together.', 'Mari kita lihat bersama.']; }
        else c.phase = 'retry';
      }
      render(); focusFeedback();
    },
    retry: function () { ui.card.phase = 'answer'; render(); },
    helpFromFb: function () { ui.card.phase = 'answer'; actions.help(); },
    help: function () {
      var c = ui.card; if (c.hints >= 3) return;
      c.hints++;
      if (c.hints === 1) ui.line = maria.help();
      render();
      var el = document.querySelector('.panel--help .hint:last-child'); if (el) el.scrollIntoView({ block: 'nearest' });
    },
    showMe: function () { finalize(false, true); ui.card.phase = 'explain'; ui.line = null; render(); window.scrollTo(0, 0); },
    bridge: function () {
      var c = ui.card; c.bridgeOpen = !c.bridgeOpen; c.bridge = true;
      if (c.bridgeOpen && !c.bridgeWord && c.q.vocab && c.q.vocab.length) c.bridgeWord = c.q.vocab[0];
      render();
    },
    bridgeWord: function (wd) { var c = ui.card; c.bridgeWord = wd; c.revealed[wd] = true; c.bridgeOut = 'word'; render(); },
    bridgeAct: function (t) { var c = ui.card; c.bridgeOut = t; if (t === 'word' && c.bridgeWord) c.revealed[c.bridgeWord] = true; render(); },
    confused: function () {
      var c = ui.card;
      c.confused = true;
      c.confuse = { ladder: c.q.confuse || FMQ.ladders[c.q.skill], i: 0, wrong: false, picked: [], done: false, msg: null };
      render(); window.scrollTo(0, 0);
    },
    cfPick: function (opt) {
      var cf = ui.card.confuse, step = cf.ladder.steps[cf.i];
      if (opt === step.answer) {
        cf.i++; cf.wrong = false; cf.picked = []; cf.msg = U.pick([['Good.', 'Bagus.'], ['Yes, that’s it.', 'Ya, betul.'], ['Good. One more small step.', 'Bagus. Satu lagi langkah kecil.']]);
        if (cf.i >= cf.ladder.steps.length) cf.done = true;
      } else { cf.wrong = true; cf.picked.push(opt); }
      render();
    },
    cfBack: function () { ui.card.confuse = null; ui.line = maria.confusedBack(); render(); window.scrollTo(0, 0); },
    why: function (i) {
      var c = ui.card; if (c.why !== null) return;
      c.why = Number(i) === c.q.why.answer;
      if (c.lastAttempt) c.lastAttempt.why = c.why;
      if (c.why && ui.quest.mode !== 'demo') { state.stars += 3; ui.quest.stars += 3; save(); }
      else if (c.why) ui.quest.stars += 3;
      render();
    },
    next: function () {
      var quest = ui.quest;
      quest.idx++;
      if (quest.idx >= quest.items.length) { finish(); return; }
      if (tracked(quest.mode)) { state.activeQuest = quest; save(); }
      newCard(); render(); window.scrollTo(0, 0);
    },
    parentSummary: function (id) { ui.modal = id; render(); var m = document.querySelector('.modal-card button:last-child'); if (m) m.focus(); },
    closeModal: function () { ui.modal = null; render(); },
    copySummary: function () {
      var s = state.sessions.find(function (y) { return y.id === ui.modal; }) || ui.summary;
      copy(x('Today’s Learning', 'Pembelajaran Hari Ini') + ' — ' + FMQ.learner.name + ' (' + fmtDay(s.day) + ')\n' + summaryText(s).map(function (r) { return p(r[0]) + ': ' + p(r[1]); }).join('\n'));
    },
    loadDemo: function () { state = FMQ.loadDemo(); ui.confirmReset = false; render(); },
    reset: function () {
      if (!ui.confirmReset) { ui.confirmReset = true; render(); return; }
      ui.confirmReset = false; state = FMQ.store.reset(); go('onboarding');
    },
    exportData: function () { ui.exportOpen = !ui.exportOpen; render(); },
    copyExport: function () { state.profile.lastBackup = today(); save(); copy(FMQ.store.exportJSON()); render(); },
    restoreOpen: function () { ui.restoreOpen = !ui.restoreOpen; ui.confirmRestore = false; ui.restoreMsg = null; render(); },
    restore: function () {
      var box = document.getElementById('restorebox'), txt = box ? box.value.trim() : '', data;
      try { data = JSON.parse(txt); } catch (e) { data = null; }
      if (!data || !data.profile || !Array.isArray(data.attempts) || !Array.isArray(data.sessions)) {
        ui.restoreMsg = ['That text is not a complete backup. Copy the whole backup, from the first { to the last }.', 'Teks itu bukan sandaran yang lengkap. Salin keseluruhan sandaran, dari { pertama hingga } terakhir.']; ui.confirmRestore = false; render(); return;
      }
      if (!ui.confirmRestore) {
        ui.confirmRestore = true; ui.restoreMsg = ['Backup found: ' + data.sessions.length + ' sessions, ' + data.attempts.length + ' answers.', 'Sandaran ditemui: ' + data.sessions.length + ' sesi, ' + data.attempts.length + ' jawapan.'];
        render(); var b = document.getElementById('restorebox'); if (b) b.value = txt; return;
      }
      FMQ.store.replace(data); state = FMQ.store.load(); ui.confirmRestore = false; ui.restoreOpen = false; ui.restoreMsg = null; toast(x('Progress restored', 'Kemajuan dipulihkan')); render();
    }
  };

  function copy(text) {
    try { navigator.clipboard.writeText(text).then(function () { toast(x('Copied', 'Disalin')); }, function () { toast(x('Select the text and copy it', 'Pilih teks dan salin')); }); }
    catch (e) { toast(x('Select the text and copy it', 'Pilih teks dan salin')); }
  }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1800);
  }

  function render() {
    document.documentElement.lang = lang() === 'en' ? 'en' : 'ms';
    root.innerHTML = views[ui.view]();
    root.dataset.view = ui.view;
  }

  function boot() {
    root = document.getElementById('app');
    document.title = FMQ.brand().title;
    state = FMQ.store.load();
    state.lastVisitDay = today(); save();
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      var fn = actions[el.dataset.act];
      if (fn) { e.preventDefault(); fn(el.dataset.arg, el); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ui.modal) { ui.modal = null; render(); }
      if (ui.view === 'play' && ui.card && ui.card.phase === 'answer' && !ui.card.confuse && /^[a-dA-D1-4]$/.test(e.key) && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'TEXTAREA') {
        var i = 'abcd1234'.indexOf(e.key.toLowerCase()) % 4, o = ui.card.q.options[i];
        if (o && ui.card.wrongPicked.indexOf(o) < 0) { ui.card.selected = o; render(); }
      }
    });
    ui.view = state.profile.onboarded ? 'home' : 'onboarding';
    render();
  }

  FMQ.app = { boot: boot, _ui: ui, _actions: actions };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
