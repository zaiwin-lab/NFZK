/* UI layer — renders views and routes actions to the engine.
   Child views stay deliberately simple; the intelligence lives in js/engine. */
(function () {
  var U = FMQ.util, M = FMQ.mastery, A = FMQ.analytics, maria = FMQ.maria, E = U.esc;
  var state, root;
  var ui = { view: 'home', quest: null, card: null, line: null, summary: null, modal: null, confirmReset: false, exportOpen: false };

  /* ───────── helpers ───────── */
  function save() { FMQ.store.save(); }
  function go(view) { ui.view = view; ui.modal = null; render(); window.scrollTo(0, 0); }
  function sname(id) { var s = FMQ.skill(id); return s ? s.name : id; }
  function sicon(id) { var s = FMQ.skill(id); return s ? s.icon : '•'; }
  function today() { return U.dayKey(); }
  function doneToday() { return state.sessions.some(function (s) { return s.day === today() && s.mode === 'quest'; }); }
  function fmtDay(key) {
    var d = new Date(key + 'T12:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function lines(text) { return text.split('\n').map(function (l) { return '<span class="qline">' + l + '</span>'; }).join(''); }

  function avatar(size) {
    return '<svg class="maria-av" width="' + (size || 44) + '" height="' + (size || 44) + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--teal)"/><stop offset="1" stop-color="var(--violet)"/></linearGradient></defs>' +
      '<circle cx="24" cy="26" r="20" fill="url(#mg)"/>' +
      '<path d="M24 6c0-4 4-6 8-5-1 4-4 6-8 5z" fill="var(--green)"/><path d="M24 6c0-3-3-5-6-4 1 3 3 4 6 4z" fill="var(--green)" opacity=".75"/>' +
      '<circle cx="17.5" cy="25" r="2.2" fill="var(--on-accent)"/><circle cx="30.5" cy="25" r="2.2" fill="var(--on-accent)"/>' +
      '<path d="M17 32c3.5 3.5 10.5 3.5 14 0" stroke="var(--on-accent)" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';
  }
  function mariaBubble(text, opts) {
    opts = opts || {};
    if (!text) return '';
    return '<div class="maria' + (opts.big ? ' maria--big' : '') + '">' + avatar(opts.big ? 56 : 40) +
      '<div class="maria-bubble">' + (opts.name ? '<p class="maria-name">' + FMQ.brand().buddy + ' <span>· ' + E(FMQ.brand().buddySub) + '</span></p>' : '') +
      '<p class="maria-text">' + text + '</p></div></div>';
  }
  function stateChip(st) {
    var s = M.STATES[st];
    return '<span class="chip chip--' + s.tone + '"><span aria-hidden="true">' + s.icon + '</span> ' + s.label + '</span>';
  }

  /* ───────── views ───────── */
  var views = {};

  views.onboarding = function () {
    var t = maria.onboarding();
    return '<main class="screen screen--center onboard">' +
      '<div class="brandmark">' + brandLockup() + '</div>' +
      '<div class="onboard-card">' + avatar(84) +
      '<p class="maria-name">' + FMQ.brand().buddy + ' <span>· ' + E(FMQ.brand().buddySub) + '</span></p>' +
      '<h1 class="onboard-hello">' + E(t[0]) + '</h1>' +
      '<div class="onboard-lines">' + t.slice(1).map(function (l, i) { return '<p style="--d:' + i + '">' + E(l) + '</p>'; }).join('') + '</div>' +
      '<button class="btn btn--primary btn--xl" data-act="begin">LET’S GO 🚀</button></div></main>';
  };

  function brandLockup(small) {
    var b = FMQ.brand();
    return '<div class="lockup' + (small ? ' lockup--sm' : '') + '"><span class="lockup-mark" aria-hidden="true">' + avatar(small ? 30 : 36) + '</span>' +
      '<span class="lockup-text"><b>' + E(b.title) + '</b><small>Year ' + FMQ.learner.year + ' · ' + E(b.tagline) + '</small></span></div>';
  }

  views.home = function () {
    var g = maria.greeting(state), st = A.streak(state), groups = A.skillGroups(state);
    var growing = groups.building.length + groups.practise.filter(function (s) { return M.attemptsFor(state, s.id).length; }).length;
    var aq = state.activeQuest && state.activeQuest.day === today() ? state.activeQuest : null;
    var done = doneToday();
    var cta;
    if (done) {
      cta = '<div class="cta-done"><p class="cta-done-title">✅ Today’s quest is complete</p><p>A new quest will be ready tomorrow.</p></div>';
    } else {
      var label = aq && aq.idx > 0 ? 'CONTINUE TODAY’S QUEST' : 'START TODAY’S QUEST WITH ' + FMQ.brand().buddy;
      var preview = '';
      if (state.profile.diagnosticDone && !aq) {
        var f = FMQ.quest.chooseFocus(state);
        preview = '<p class="cta-sub">Today: ' + sicon(f.focus) + ' ' + E(sname(f.focus)) + ' · about 15 minutes</p>';
      } else if (!state.profile.diagnosticDone) {
        preview = '<p class="cta-sub">First, 10 short questions so ' + E(FMQ.learner.buddy) + ' knows where to begin</p>';
      } else if (aq) {
        preview = '<p class="cta-sub">' + (aq.items.length - aq.idx) + ' questions left</p>';
      }
      cta = '<button class="btn btn--primary btn--xl btn--quest" data-act="startQuest">' + label + ' <span aria-hidden="true">→</span></button>' + preview;
    }
    return '<main class="screen home">' +
      '<header class="topbar">' + brandLockup(true) + '</header>' +
      '<section class="home-hero"><h1 class="hello">Hi ' + E(FMQ.learner.name) + ' 👋</h1>' +
      mariaBubble('<b>' + E(g.title) + '</b><br>' + E(g.text), { name: true }) + '</section>' +
      '<section class="stats" aria-label="My progress at a glance">' +
        stat('🔥', st.current ? st.current + (st.current === 1 ? ' day' : ' days') : 'Start', 'Learning Streak') +
        stat('⭐', state.stars, 'Stars') +
        stat('🌱', growing, 'Skills Growing') +
        stat('🏆', groups.secure.length, 'Skills Mastered') +
      '</section>' +
      '<section class="cta">' + cta + '</section>' +
      '<nav class="secondary" aria-label="More">' +
        navBtn('practice', '🌱', 'Practice My Skills') + navBtn('progress', '🏆', 'My Progress') + navBtn('parent', '👨‍👧', 'Parent View') +
      '</nav>' +
      '<footer class="foot">' + E(FMQ.brand().full) + '</footer></main>';
  };
  function stat(icon, val, label) {
    return '<div class="stat"><span class="stat-icon" aria-hidden="true">' + icon + '</span><span class="stat-val">' + E(val) + '</span><span class="stat-label">' + E(label) + '</span></div>';
  }
  function navBtn(view, icon, label) {
    return '<button class="navbtn" data-act="go" data-arg="' + view + '"><span aria-hidden="true">' + icon + '</span> ' + E(label) + '</button>';
  }

  /* ── Question play ── */
  function currentItem() { return ui.quest.items[ui.quest.idx]; }

  function newCard() {
    var item = currentItem(), q = FMQ.question(item.qid);
    var prev = ui.quest.items[ui.quest.idx - 1];
    var line = null;
    if (ui.pendingLine) { line = ui.pendingLine; ui.pendingLine = null; }
    else if (item.repair) line = 'Same idea, new situation. Let’s see if it transfers.';
    else if (ui.quest.mode === 'diagnostic' && ui.quest.idx === 0) line = 'Try your best. There’s no rush, and no score.';
    else if (ui.quest.mode === 'quest' && (!prev || prev.section !== item.section)) line = maria.sectionIntro(ui.quest, item.section);
    else if (ui.quest.mode === 'practice' && ui.quest.idx === 0) line = 'Three questions on ' + sname(ui.quest.focus).toLowerCase() + '. Then we stop.';
    ui.line = line;
    ui.card = { q: q, item: item, selected: null, tries: 0, wrongPicked: [], hints: 0, explained: false,
      bridge: false, bridgeOpen: false, bridgeWord: null, bridgeOut: null, revealed: {},
      confused: false, confuse: null, phase: 'answer', result: null, errorCat: null, triedAlone: false,
      why: null, startTs: Date.now() };
  }

  function startQuest(q) {
    ui.quest = q;
    if (q.mode === 'quest' || q.mode === 'diagnostic') { state.activeQuest = q; save(); }
    newCard();
    go('play');
  }

  function highlightText(q, on) {
    var html = E(q.text);
    if (!on || !q.vocab || !q.vocab.length) return lines(html);
    var words = q.vocab.slice().sort(function (a, b) { return b.length - a.length; });
    words.forEach(function (w) {
      var v = FMQ.vocab[w]; if (!v) return;
      var re = new RegExp('(^|[^A-Za-z])(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z])', 'i');
      html = html.replace(re, function (m, pre, word) {
        return pre + '<mark class="wb wb--' + v.role + '" data-w="' + E(w) + '">' + word + '</mark>';
      });
    });
    return lines(html);
  }

  views.play = function () {
    var c = ui.card, q = c.q, item = c.item, quest = ui.quest;
    var total = quest.items.length, n = quest.idx + 1;
    var sec = FMQ.sections[item.section] || { title: '' };
    var tag = quest.mode === 'quest' ? sec.title : quest.mode === 'diagnostic' ? 'Getting to know you' : quest.mode === 'practice' ? 'Practice · ' + sname(quest.focus) : 'Sample flow';
    var head = '<header class="play-top"><button class="iconbtn" data-act="pause" aria-label="Pause and go home">✕</button>' +
      '<div class="play-meta"><span class="section-tag">' + E(tag) + (item.repair ? ' <span class="tag-changed">Changed question</span>' : '') + '</span>' +
      '<span class="qcount">Question ' + n + ' of ' + total + '</span></div></header>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + (n - 1) + '"><span style="width:' + ((n - 1) / total * 100) + '%"></span></div>';

    var body;
    if (c.confuse) body = confuseView();
    else if (c.phase === 'explain') body = explainView();
    else body = questionView();

    return '<main class="screen play">' + head + (c.confuse ? '' : mariaBubble(ui.line ? E(ui.line) : '')) + body + '</main>';
  };

  function questionView() {
    var c = ui.card, q = c.q;
    var locked = c.phase !== 'answer';
    var opts = q.options.map(function (o, i) {
      var letter = 'ABCD'[i];
      var cls = 'opt';
      var struck = c.wrongPicked.indexOf(o) >= 0;
      if (c.selected === o) cls += ' is-selected';
      if (struck) cls += ' is-struck';
      if (c.phase === 'done' && o === q.answer && ui.quest.mode !== 'diagnostic') cls += ' is-correct';
      return '<button class="' + cls + '" role="radio" aria-checked="' + (c.selected === o) + '" data-act="select" data-arg="' + E(o) + '"' + (locked || struck ? ' disabled' : '') + '>' +
        '<span class="opt-letter" aria-hidden="true">' + letter + '</span><span class="opt-text">' + E(o) + '</span>' + (struck ? '<span class="sr-only"> (already tried)</span>' : '') + '</button>';
    }).join('');

    var steps = q.level >= 4 ? '<ol class="wh-steps" aria-label="Thinking steps"><li>WHAT?</li><li>HOW?</li><li>DO</li><li>CHECK</li></ol>' : '';

    var tools = '';
    if (c.phase === 'answer') {
      tools = '<div class="tools" role="group" aria-label="Help tools">' +
        '<button class="tool tool--help' + (c.hints ? ' is-on' : '') + '" data-act="help"' + (c.hints >= 3 ? ' disabled' : '') + '><span aria-hidden="true">💡</span> Help Me' + (c.hints ? ' <small>' + c.hints + '/3</small>' : '') + '</button>' +
        '<button class="tool tool--bridge' + (c.bridgeOpen ? ' is-on' : '') + '" data-act="bridge" aria-expanded="' + c.bridgeOpen + '"><span aria-hidden="true">🌐</span> Word Bridge</button>' +
        '<button class="tool tool--confused" data-act="confused"><span aria-hidden="true">😕</span> I’m Confused</button></div>';
    }

    var help = c.hints ? helpPanel() : '';
    var bridge = c.bridgeOpen && c.phase === 'answer' ? bridgePanel() : '';

    var foot;
    if (c.phase === 'answer') {
      foot = '<div class="play-foot"><button class="btn btn--primary btn--block" data-act="check"' + (c.selected ? '' : ' disabled') + '>CHECK ANSWER</button></div>';
    } else foot = feedbackPanel();

    return '<article class="qcard" aria-labelledby="qtext">' +
      '<div class="qtext" id="qtext">' + highlightText(q, c.bridgeOpen && c.phase === 'answer') + '</div>' +
      FMQ.visual(q.visual) + steps +
      '<div class="options" role="radiogroup" aria-labelledby="qtext">' + opts + '</div>' +
      tools + help + bridge + '</article>' + foot;
  }

  function helpPanel() {
    var c = ui.card, labels = ['Notice', 'Strategy', 'One step together'];
    var list = c.q.hints.slice(0, c.hints).map(function (h, i) {
      return '<li class="hint"><span class="hint-level">💡 ' + (i + 1) + ' · ' + labels[i] + '</span><p>' + E(h) + '</p></li>';
    }).join('');
    var more = c.phase === 'answer' && c.hints >= 3 ? '<button class="btn btn--soft" data-act="showMe">📘 Show Me How</button>' : '';
    return '<section class="panel panel--help" aria-live="polite"><ol class="hints">' + list + '</ol>' + more + '</section>';
  }

  function bridgePanel() {
    var c = ui.card, q = c.q;
    var chips = (q.vocab || []).map(function (w) {
      var v = FMQ.vocab[w]; if (!v) return '';
      var lvl = M.fadeLevel(state, w), role = FMQ.vocabRoles[v.role];
      var bm;
      if (lvl === 'full') bm = v.bm;
      else if (lvl === 'short') bm = v.short;
      else if (lvl === 'tap') bm = c.revealed[w] ? v.short : null;
      else bm = c.revealed[w] ? v.short : null;
      var right = bm ? '<span class="pair-bm">' + E(bm) + '</span>'
        : '<span class="pair-tap">' + (lvl === 'plain' ? 'You know this ✓ · tap to check' : 'Tap if you need help') + '</span>';
      return '<button class="pair pair--' + v.role + (c.bridgeWord === w ? ' is-active' : '') + '" data-act="bridgeWord" data-arg="' + E(w) + '">' +
        '<span class="pair-role" title="' + E(role.label) + '"><span aria-hidden="true">' + role.icon + '</span><span class="sr-only">' + E(role.label) + ':</span></span>' +
        '<span class="pair-en">' + E(w) + '</span><span class="pair-arrow" aria-hidden="true">↔</span>' + right + '</button>';
    }).join('');
    if (!chips) chips = '<p class="muted">No tricky words here. You can still read the sentence in BM or in simpler English.</p>';

    var out = '';
    if (c.bridgeOut === 'word' && c.bridgeWord) {
      var v = FMQ.vocab[c.bridgeWord];
      out = '<div class="bridge-out"><p class="bo-label">“' + E(c.bridgeWord) + '”</p><p>' + E(v.explain) + '</p><p class="bo-bm" lang="ms">' + E(v.explainBm) + '</p></div>';
    } else if (c.bridgeOut === 'sentence') {
      out = '<div class="bridge-out"><p class="bo-label">In Bahasa Malaysia</p><p class="bo-bm" lang="ms">' + E(q.bm) + '</p></div>';
    } else if (c.bridgeOut === 'simple') {
      out = '<div class="bridge-out"><p class="bo-label">Simpler English</p><p>' + E(q.simple) + '</p></div>';
    }
    var after = c.bridgeOut ? '<p class="bridge-after">' + avatar(24) + ' ' + E(maria.bridgeAfter()) + '</p>' : '';
    var hasWords = (q.vocab || []).length > 0;
    return '<section class="panel panel--bridge" aria-label="Word Bridge" aria-live="polite">' +
      '<p class="panel-title">🌐 Word Bridge <span>English stays. Bahasa helps.</span></p>' +
      '<div class="pairs">' + chips + '</div>' +
      '<div class="bridge-acts">' +
        (hasWords ? '<button class="mini' + (c.bridgeOut === 'word' ? ' is-on' : '') + '" data-act="bridgeAct" data-arg="word">1 · Explain this word</button>' : '') +
        '<button class="mini' + (c.bridgeOut === 'sentence' ? ' is-on' : '') + '" data-act="bridgeAct" data-arg="sentence">' + (hasWords ? '2' : '1') + ' · Explain this sentence in BM</button>' +
        '<button class="mini' + (c.bridgeOut === 'simple' ? ' is-on' : '') + '" data-act="bridgeAct" data-arg="simple">' + (hasWords ? '3' : '2') + ' · Make the English simpler</button>' +
      '</div>' + out + after + '</section>';
  }

  function feedbackPanel() {
    var c = ui.card, q = c.q, r = c.result || {}, quest = ui.quest;
    var html = '';
    if (c.phase === 'retry') {
      var nudge = q.wrong && q.wrong[c.wrongPicked[c.wrongPicked.length - 1]];
      return '<div class="feedback feedback--almost" role="status" tabindex="-1" id="fb">' +
        '<p class="fb-title">' + E(maria.wrongFirst()) + '</p>' +
        '<p>' + E(nudge ? nudge[1] : 'Check what the question is asking.') + '</p>' +
        '<div class="fb-actions"><button class="btn btn--primary" data-act="retry">Try again</button>' +
        (c.hints < 3 ? '<button class="btn btn--ghost" data-act="helpFromFb">💡 Help Me</button>' : '') + '</div></div>';
    }
    if (c.phase === 'diag') {
      return '<div class="feedback feedback--neutral" role="status" tabindex="-1" id="fb"><p class="fb-title">' +
        E(c.correctNow ? maria.rightDiag() : maria.wrongDiag()) + '</p>' +
        '<div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">Next →</button></div></div>';
    }
    // done (correct)
    var o = M.OUTCOMES[r.outcome] || M.OUTCOMES.independent;
    if (r.comeback) {
      html += '<div class="comeback" role="status"><p class="comeback-title">COMEBACK WIN 🎉</p><p>' + E(maria.comeback(q.skill)) + '</p></div>';
    }
    if (r.mastered) html += '<div class="mastered"><span aria-hidden="true">🏆</span> ' + E(maria.mastered(q.skill)) + '</div>';
    html += '<div class="feedback feedback--good" role="status" tabindex="-1" id="fb">' +
      '<p class="fb-outcome"><span aria-hidden="true">' + o.icon + '</span> ' + E(o.label) + (r.stars ? ' <span class="fb-stars">+' + r.stars + ' ⭐</span>' : '') + '</p>' +
      '<p class="fb-title">' + E(c.message) + '</p>' +
      (q.check ? '<p class="fb-check"><b>CHECK</b> ' + E(q.check) + '</p>' : '');
    if (q.why && quest.mode !== 'diagnostic' && (r.outcome === 'independent' || r.outcome === 'corrected')) html += whyBlock();
    html += '<div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">' + (quest.idx + 1 >= quest.items.length ? 'Finish ✓' : 'Next →') + '</button></div></div>';
    return html;
  }

  function whyBlock() {
    var c = ui.card, w = c.q.why;
    if (c.why === null) {
      return '<div class="why"><p class="why-q">Bonus: ' + E(w.q) + '</p><div class="why-opts">' +
        w.options.map(function (o, i) { return '<button class="mini" data-act="why" data-arg="' + i + '">' + E(o) + '</button>'; }).join('') + '</div></div>';
    }
    return '<div class="why"><p class="why-q">' + (c.why ? '⭐ +3 You explained your thinking.' : 'The reason is: ' + E(w.options[w.answer]) + '.') + '</p></div>';
  }

  function explainView() {
    var c = ui.card, q = c.q;
    return '<article class="qcard qcard--explain"><p class="explain-tag">📘 Show Me How</p>' +
      '<div class="qtext qtext--small">' + lines(E(q.text)) + '</div>' + FMQ.visual(q.visual) +
      '<ol class="explain-steps">' + q.show.map(function (s) { return '<li>' + E(s) + '</li>'; }).join('') + '</ol>' +
      '<p class="explain-answer">Answer: <b>' + E(q.answer) + '</b></p></article>' +
      (function () {
        var nx = ui.quest.items[ui.quest.idx + 1], twin = nx && nx.repair && nx.of === q.id;
        return '<div class="feedback feedback--neutral" role="status" tabindex="-1" id="fb">' +
          '<p class="fb-title">' + avatar(24) + ' ' + E(twin ? maria.afterExplain() : 'Now you’ve seen how it works. We’ll meet this idea again soon.') + '</p>' +
          '<div class="fb-actions"><button class="btn btn--primary btn--block" data-act="next">' + (twin ? 'Try a different one →' : nx ? 'Next →' : 'Finish ✓') + '</button></div></div>';
      })();
  }

  function confuseView() {
    var c = ui.card, cf = c.confuse, lad = cf.ladder;
    if (cf.done) {
      return mariaBubble(E(maria.confusedBack())) +
        '<article class="qcard qcard--mini"><p class="mini-tag">✓ Building block done</p><div class="qtext">' + lines(E(c.q.text)) + '</div></article>' +
        '<div class="play-foot"><button class="btn btn--primary btn--block" data-act="cfBack">Back to the question →</button></div>';
    }
    var step = lad.steps[cf.i];
    var opts = step.options.map(function (o) {
      return '<button class="opt opt--mini' + (cf.picked && cf.picked.indexOf(o) >= 0 ? ' is-struck' : '') + '" data-act="cfPick" data-arg="' + E(o) + '"' + (cf.picked && cf.picked.indexOf(o) >= 0 ? ' disabled' : '') + '><span class="opt-text">' + E(o) + '</span></button>';
    }).join('');
    return mariaBubble(E(cf.i === 0 ? maria.confused() + ' ' + lad.intro : (cf.msg || 'Good.'))) +
      '<article class="qcard qcard--mini" aria-live="polite"><p class="mini-tag">Smaller step ' + (cf.i + 1) + ' of ' + lad.steps.length + '</p>' +
      '<div class="qtext">' + lines(E(step.text)) + '</div>' + FMQ.visual(step.visual) +
      '<div class="options options--mini">' + opts + '</div>' +
      (cf.wrong ? '<p class="mini-hint">💡 ' + E(step.hint) + '</p>' : '') + '</article>' +
      '<div class="play-foot"><button class="btn btn--ghost btn--block" data-act="cfBack">Back to the question</button></div>';
  }

  /* ── After the quest ── */
  views.diagResults = function () {
    var res = ui.quest.results, know = [], grow = [];
    res.forEach(function (r) {
      var list = r.outcome === 'independent' ? know : grow;
      if (list.indexOf(r.skill) < 0) list.push(r.skill);
    });
    grow = grow.filter(function (s) { return know.indexOf(s) < 0; });
    function li(s, icon) { return '<li><span aria-hidden="true">' + icon + '</span> ' + sicon(s) + ' ' + E(sname(s)) + '</li>'; }
    return '<main class="screen screen--center done">' + mariaBubble(E(maria.diagnosticDone()), { big: true, name: true }) +
      '<section class="done-card"><h2>Things you already know</h2><ul class="ticks">' + (know.length ? know.map(function (s) { return li(s, '✅'); }).join('') : '<li>We’ll find them together soon.</li>') + '</ul>' +
      '<h2>Things we’ll make stronger</h2><ul class="ticks">' + grow.map(function (s) { return li(s, '🌱'); }).join('') + '</ul></section>' +
      '<button class="btn btn--primary btn--xl" data-act="firstMission">Start my first mission 🚀</button></main>';
  };

  views.victory = function () {
    var s = ui.summary, mode = s.mode;
    var title = mode === 'practice' ? 'Practice Complete 🎉' : mode === 'demo' ? 'Sample complete' : 'Quest Complete 🎉';
    var list = s.strengthened.map(function (id) { return '<li><span aria-hidden="true">✅</span> ' + E(sname(id)) + '</li>'; })
      .concat(s.improvedWords.map(function (w) { return '<li><span aria-hidden="true">✅</span> Understanding “' + E(w) + '”</li>'; })).join('');
    var cb = s.comebacks.length ? '<div class="comeback comeback--inline"><p class="comeback-title">COMEBACK WIN 🎉</p><p>' + s.comebacks.map(function (id) { return E(sname(id)); }).join(', ') + ': you used to need help with this. Today you solved it by yourself.</p></div>' : '';
    var ms = s.mastered.length ? '<p class="mastered">🏆 Mastered: ' + s.mastered.map(function (id) { return E(sname(id)); }).join(', ') + '</p>' : '';
    var next = s.next ? '<h2>Tomorrow we’ll continue with</h2><ul class="ticks"><li><span aria-hidden="true">🌱</span> ' + E(sname(s.next)) + '</li></ul>' : '';
    var buttons = mode === 'demo'
      ? '<button class="btn btn--primary btn--block" data-act="go" data-arg="parent">Back to Parent View</button>'
      : '<button class="btn btn--primary btn--block" data-act="go" data-arg="home">Back Home</button>' +
        '<div class="row2"><button class="btn btn--ghost" data-act="go" data-arg="progress">View Progress</button>' +
        '<button class="btn btn--ghost" data-act="parentSummary" data-arg="' + E(s.id) + '">Parent Summary</button></div>';
    return '<main class="screen screen--center done victory">' +
      '<div class="victory-burst" aria-hidden="true"><span>⭐</span><span>🌱</span><span>⭐</span></div>' +
      '<h1 class="victory-title">' + title + '</h1>' + cb +
      '<section class="done-card">' + (list ? '<h2>Today you strengthened</h2><ul class="ticks">' + list + '</ul>' : '<p>You practised carefully today.</p>') + ms + next +
      '<p class="victory-stars">⭐ +' + s.stars + ' Stars</p></section>' +
      mariaBubble(E(maria.end()), { name: true }) +
      '<div class="done-actions">' + buttons + '</div>' + (ui.modal ? modal() : '') + '</main>';
  };

  /* ── Child progress ── */
  views.progress = function () {
    var st = M.allStates(state), cmp = A.selfCompare(state), vocab = A.vocabList(state), streak = A.streak(state);
    var journey = FMQ.curriculum.skills.map(function (s) {
      return '<li class="jrow jrow--' + st[s.id] + '"><span class="jicon" aria-hidden="true">' + s.icon + '</span><span class="jname">' + E(s.name) + '</span>' + stateChip(st[s.id]) + '</li>';
    }).join('');
    var words = vocab.length ? vocab.map(function (v) {
      return '<li class="word word--' + v.status + '"><span aria-hidden="true">' + (v.status === 'known' ? '✅' : '🌱') + '</span> ' + E(v.word) + '<span class="sr-only">' + (v.status === 'known' ? ' (I know this)' : ' (growing)') + '</span></li>';
    }).join('') : '<li class="muted">Words will appear here as you meet them in questions.</li>';
    var vs = cmp.first ? '<p class="muted">After one more week, you’ll see how you’ve grown here.</p>'
      : (cmp.lines.length ? '<ul class="vs">' + cmp.lines.map(function (l) { return '<li><span class="vs-arrow vs-' + l.dir + '" aria-hidden="true">' + (l.dir === 'up' ? '⬆' : '⬇') + '</span> ' + E(l.text) + '</li>'; }).join('') + '</ul>'
      : '<p class="muted">Steady week. Keep going one small step at a time.</p>');
    var cbs = state.events.filter(function (e) { return e.type === 'comeback'; }).slice(-5).reverse();
    var cbHtml = cbs.length ? '<section class="pcard"><h2>Comeback Wins 🎉</h2><ul class="ticks">' + cbs.map(function (e) { return '<li>' + sicon(e.skill) + ' ' + E(sname(e.skill)) + ' <span class="muted">· ' + fmtDay(e.day) + '</span></li>'; }).join('') + '</ul></section>' : '';
    return '<main class="screen progresspage">' + backBar('My Progress') +
      '<section class="pcard"><h2>Maths Journey</h2><p class="muted">What can I do now?</p><ul class="journey">' + journey + '</ul></section>' +
      '<section class="pcard"><h2>English Power from Maths</h2><ul class="words">' + words + '</ul></section>' +
      '<section class="pcard"><h2>' + E(FMQ.learner.name) + ' vs ' + E(FMQ.learner.name) + '</h2><p class="muted">This week compared with before. Nobody else.</p>' + vs + '</section>' +
      cbHtml +
      '<section class="pcard pcard--row"><div><b>' + state.stars + '</b><span>⭐ Stars</span></div><div><b>' + streak.total + '</b><span>📅 Learning days</span></div></section>' +
      '</main>';
  };

  function backBar(title, parent) {
    return '<header class="backbar' + (parent ? ' backbar--parent' : '') + '"><button class="iconbtn" data-act="go" data-arg="home" aria-label="Back home">←</button><h1>' + E(title) + '</h1></header>';
  }

  views.practice = function () {
    var st = M.allStates(state);
    var tiles = FMQ.curriculum.skills.map(function (s) {
      var x = M.STATES[st[s.id]];
      return '<button class="ptile" data-act="practise" data-arg="' + s.id + '"><span class="ptile-icon" aria-hidden="true">' + s.icon + '</span><span class="ptile-name">' + E(s.name) + '</span><span class="ptile-state"><span aria-hidden="true">' + x.icon + '</span> ' + E(x.label) + '</span></button>';
    }).join('');
    return '<main class="screen">' + backBar('Practice My Skills') +
      mariaBubble('Pick one skill. We’ll do three questions, then stop.') +
      '<div class="ptiles">' + tiles + '</div></main>';
  };

  /* ── Parent dashboard ── */
  views.parent = function () {
    var w = A.weeks(state), now = w.now, before = w.before, groups = A.skillGroups(state);
    var name = FMQ.learner.name;
    function pct(x) { return Math.round(x * 100) + '%'; }
    function delta(a, b, fmt, invert) {
      if (!before.questions) return '';
      var d = a - b; if (Math.abs(d) < 0.005) return '<span class="delta">no change</span>';
      var good = invert ? d < 0 : d > 0;
      return '<span class="delta ' + (good ? 'delta--good' : 'delta--watch') + '">' + (d > 0 ? '▲ ' : '▼ ') + fmt(Math.abs(d)) + ' vs last week</span>';
    }
    var hintRate = now.questions ? now.hinted / now.questions : 0, hintRateB = before.questions ? before.hinted / before.questions : 0;
    var bridgeRate = now.questions ? now.bridge / now.questions : 0, bridgeRateB = before.questions ? before.bridge / before.questions : 0;
    var kpis = [
      kpi('Sessions', now.sessions, now.minutes + ' minutes in total'),
      kpi('Independent answers', now.questions ? pct(now.independentRate) : '—', delta(now.independentRate, before.independentRate, pct)),
      kpi('Hint usage', now.questions ? pct(hintRate) : '—', now.hints + ' hints · ' + delta(hintRate, hintRateB, pct, true)),
      kpi('Word Bridge usage', now.questions ? pct(bridgeRate) : '—', delta(bridgeRate, bridgeRateB, pct, true) || 'of questions'),
      kpi('Changed-question success', now.changed ? now.changedWins + ' / ' + now.changed : '—', 'solved independently'),
      kpi('Comeback wins', now.comebacks, 'this week')
    ].join('');

    function skillList(arr, empty) {
      return arr.length ? '<ul class="slist">' + arr.map(function (s) { return '<li>' + s.icon + ' ' + E(s.name) + '</li>'; }).join('') + '</ul>' : '<p class="muted">' + empty + '</p>';
    }
    var practiseSeen = groups.practise.filter(function (s) { return M.attemptsFor(state, s.id).length; });

    var obs = A.observations(state).map(function (t) { return '<li>' + E(t) + '</li>'; }).join('');
    var rec = A.recommendation(state);
    var pats = A.errorPatterns(state, 14), maxP = pats.reduce(function (m, p) { return Math.max(m, p.count); }, 1);
    var patHtml = pats.length ? '<ul class="bars">' + pats.map(function (p) {
      var cat = FMQ.curriculum.errorCategories[p.cat];
      return '<li><span class="bar-label">' + E(cat.label) + '</span><span class="bar-track"><span class="bar-fill" style="width:' + (p.count / maxP * 100) + '%"></span></span><span class="bar-val">' + p.count + '</span>' +
        '<span class="bar-note">Mostly in ' + p.topSkills.map(function (s) { return E(sname(s).toLowerCase()); }).join(' and ') + ' · ' + E(cat.parent) + '</span></li>';
    }).join('') + '</ul>' : '<p class="muted">No recurring errors in the last 14 days.</p>';

    var vocabAll = A.vocabList(state);
    // Words still needing Bahasa help first, then words now understood alone; the rest are summarised.
    var vocab = vocabAll.filter(function (v) { return v.status !== 'known' && v.bridged > 0; })
      .concat(vocabAll.filter(function (v) { return v.status === 'known' && v.bridged > 0; }))
      .concat(vocabAll.filter(function (v) { return v.status === 'known' && !v.bridged; })).slice(0, 12);
    var restWords = vocabAll.length - vocab.length;
    var vocabHtml = vocab.length ? '<div class="tablewrap"><table class="ptable"><thead><tr><th scope="col">Word</th><th scope="col">Bahasa Malaysia</th><th scope="col">Status</th><th scope="col" class="num">Bahasa help</th></tr></thead><tbody>' +
      vocab.map(function (v) {
        return '<tr><th scope="row">' + E(v.word) + '</th><td lang="ms">' + E(v.bm || '') + '</td><td>' + (v.status === 'known' ? '<span class="chip chip--secure">✅ Understood alone</span>' : '<span class="chip chip--building">🌱 Growing</span>') + '</td><td class="num">' + v.bridged + '×</td></tr>';
      }).join('') + '</tbody></table></div>' + (restWords > 0 ? '<p class="muted small">' + restWords + ' more words met in questions, so far without needing Bahasa help.</p>' : '') : '<p class="muted">No vocabulary data yet.</p>';

    var sess = state.sessions.filter(function (s) { return s.mode !== 'demo'; }).slice(-10);
    var chart = sess.length ? independenceChart(sess) : '<p class="muted">Sessions will appear here.</p>';
    var recent = sess.slice().reverse().slice(0, 6).map(function (s) {
      return '<li><button class="sessrow" data-act="parentSummary" data-arg="' + E(s.id) + '"><span class="sess-day">' + fmtDay(s.day) + '</span><span class="sess-what">' +
        (s.mode === 'diagnostic' ? 'First diagnostic' : s.mode === 'practice' ? 'Practice · ' + E(sname(s.focus)) : 'Daily Quest · ' + E(sname(s.focus))) + '</span><span class="sess-meta">' + s.minutes + ' min · ' + s.independent + '/' + s.questions + ' independent' + (s.comebacks.length ? ' · 🎉' : '') + '</span></button></li>';
    }).join('');

    return '<main class="screen parent">' + backBar('Parent View', true) +
      '<p class="parent-sub">' + E(name) + ' · Year ' + FMQ.learner.year + ' · ' + (state.profile.demo ? '<span class="chip chip--unknown">Sample history loaded</span>' : 'Live data') + '</p>' +
      '<section class="psec"><h2>This Week</h2><div class="kpis">' + kpis + '</div></section>' +
      '<section class="psec"><h2>What can ' + E(name) + ' do now?</h2><div class="skillcols">' +
        '<div><h3>' + stateChip('secure') + ' Secure skills</h3>' + skillList(groups.secure, 'None confirmed yet. Secure means independent on a core and a changed question.') + '</div>' +
        '<div><h3>' + stateChip('building') + ' Building skills</h3>' + skillList(groups.building, 'None right now.') + '</div>' +
        '<div><h3>' + stateChip('practise') + ' Foundation repair</h3>' + skillList(practiseSeen, 'No foundations need repair right now.') + '</div></div>' +
        '<p class="muted small">' + groups.unknown.length + ' skills not yet assessed. One correct answer never counts as mastery here.</p></section>' +
      '<section class="psec psec--maria"><h2>' + avatar(28) + ' ' + E(FMQ.brand().buddy) + '’s Observation</h2><ul class="obs">' + obs + '</ul>' +
        '<div class="nextfocus"><p class="nf-label">Recommended Next Focus</p><p class="nf-skill">' + rec.skill.icon + ' ' + E(rec.skill.name) + '</p><p>' + E(rec.why) + '</p></div></section>' +
      '<section class="psec"><h2>What is improving?</h2><p class="muted small">How each recent session was answered.</p>' + chart + '</section>' +
      '<section class="psec"><h2>Why is ' + E(name) + ' struggling?</h2><p class="muted small">Recurring error patterns, last 14 days. Each wrong attempt is classified by where the reasoning broke down.</p>' + patHtml + '</section>' +
      '<section class="psec"><h2>Maths-English Vocabulary</h2>' + vocabHtml + '</section>' +
      '<section class="psec"><h2>Recent Sessions</h2><ul class="sesslist">' + (recent || '<li class="muted">No sessions yet.</li>') + '</ul></section>' +
      '<section class="psec"><h2>See how it works</h2><p class="muted small">Try the three signature tools as a sample. Samples are not saved to ' + E(name) + '’s record.</p><div class="demos">' +
        '<button class="btn btn--ghost" data-act="demo" data-arg="mon-1">💡 Help Me → 📘 Show Me How → changed question</button>' +
        '<button class="btn btn--ghost" data-act="demo" data-arg="as-2">🌐 Word Bridge: “difference”</button>' +
        '<button class="btn btn--ghost" data-act="demo" data-arg="fr-2">😕 I’m Confused: 3/4 of 20</button></div></section>' +
      '<section class="psec psec--about"><h2>How this works</h2><p class="lede">Smart learning that meets your child where they are.</p><ul class="about">' +
        '<li><b>Adaptive Maths practice.</b> Short daily quests target missing foundations first, then move forward.</li>' +
        '<li><b>Guided help without instant answers.</b> Three levels of hints come before any worked solution.</li>' +
        '<li><b>English support through Bahasa when needed.</b> Word Bridge support fades as words become familiar.</li>' +
        '<li><b>Progress parents can actually understand.</b> Most systems ask “Was the answer right?” This one also asks “Could ' + E(name) + ' solve it independently?”</li></ul></section>' +
      '<section class="psec"><h2>Data</h2><div class="demos">' +
        '<button class="btn btn--ghost" data-act="loadDemo">Load sample history</button>' +
        '<button class="btn btn--ghost" data-act="exportData">' + (ui.exportOpen ? 'Hide data' : 'Export data (JSON)') + '</button>' +
        '<button class="btn ' + (ui.confirmReset ? 'btn--danger' : 'btn--ghost') + '" data-act="reset">' + (ui.confirmReset ? 'Tap again to erase all progress' : 'Reset all progress') + '</button></div>' +
        (ui.exportOpen ? '<label class="sr-only" for="exportbox">Learner data</label><textarea id="exportbox" class="exportbox" readonly>' + E(FMQ.store.exportJSON()) + '</textarea><button class="btn btn--soft" data-act="copyExport">Copy</button>' : '') +
        '<p class="muted small">Progress is saved on this device. Learner settings live in <code>js/content/learner.js</code>.</p></section>' +
      (ui.modal ? modal() : '') + '</main>';
  };
  function kpi(label, val, sub) {
    return '<div class="kpi"><p class="kpi-label">' + E(label) + '</p><p class="kpi-val">' + E(val) + '</p><p class="kpi-sub">' + (sub || '') + '</p></div>';
  }
  function independenceChart(sess) {
    var cols = sess.map(function (s) {
      var n = Math.max(1, s.questions), ind = s.independent, help = s.needed.filter(function (x) { return !x.explained; }).length;
      var exp = s.needed.filter(function (x) { return x.explained; }).length;
      var other = Math.max(0, n - ind - help - exp);
      function seg(cls, v, lbl) { return v ? '<span class="seg ' + cls + '" style="flex:' + v + '" title="' + v + ' ' + lbl + '"></span>' : ''; }
      return '<div class="col"><div class="stack" role="img" aria-label="' + fmtDay(s.day) + ': ' + ind + ' independent, ' + help + ' with hints, ' + exp + ' explained, ' + other + ' other">' +
        seg('seg--other', other, 'other') + seg('seg--exp', exp, 'explained') + seg('seg--help', help, 'with hints') + seg('seg--ind', ind, 'independent') +
        '</div><span class="col-label">' + new Date(s.day + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + '</span></div>';
    }).join('');
    return '<div class="chartwrap"><div class="ichart">' + cols + '</div></div><p class="legend"><span><i class="seg--ind"></i>Independent</span><span><i class="seg--help"></i>With hints</span><span><i class="seg--exp"></i>Learned with explanation</span><span><i class="seg--other"></i>Self-corrected or still learning</span></p>';
  }

  function modal() {
    var s = state.sessions.find(function (x) { return x.id === ui.modal; }) || ui.summary;
    if (!s) return '';
    var txt = summaryText(s);
    return '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mtitle"><div class="modal-card">' +
      '<h2 id="mtitle">Today’s Learning <span class="muted">· ' + fmtDay(s.day) + '</span></h2><dl class="summary">' +
      txt.map(function (r) { return '<div><dt>' + E(r[0]) + '</dt><dd>' + E(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="row2"><button class="btn btn--ghost" data-act="copySummary">Copy</button><button class="btn btn--primary" data-act="closeModal">Close</button></div></div></div>';
  }
  function summaryText(s) {
    var support = s.needed.length ? s.needed.map(function (x) { return x.explained ? 'Explanation for ' + sname(x.skill).toLowerCase() : x.hints + ' hint' + (x.hints > 1 ? 's' : '') + ' for ' + sname(x.skill).toLowerCase(); }).join('; ') : 'None. All answers without hints.';
    return [
      ['Completed', s.minutes + ' minutes · ' + s.questions + ' questions (' + s.independent + ' independent)'],
      ['Strengthened', s.strengthened.length ? s.strengthened.map(sname).join(', ') : '—'],
      ['Improved', s.improvedWords.length ? 'Understanding ' + s.improvedWords.map(function (w) { return '“' + w + '”'; }).join(', ') + ' without Bahasa help' : (s.mastered.length ? 'Mastered ' + s.mastered.map(sname).join(', ') : '—')],
      ['Needed support', support],
      ['Comeback', s.comebacks.length ? 'Solved a changed ' + s.comebacks.map(function (x) { return sname(x).toLowerCase(); }).join(', ') + ' question independently' : '—'],
      ['Next', s.next ? sname(s.next) : '—']
    ];
  }

  /* ───────── actions ───────── */
  function finalize(correct, explained) {
    var c = ui.card, q = c.q, item = c.item, quest = ui.quest;
    var a = {
      qid: q.id, skill: q.skill, level: q.level, mode: quest.mode, section: item.section, changed: !!item.changed,
      correct: correct, firstTry: c.tries <= 1, tries: c.tries, hints: c.hints, explained: !!explained,
      bridge: c.bridge, confused: c.confused, triedAlone: c.triedAlone,
      errorCat: (correct && c.tries <= 1) ? null : (c.errorCat || (explained && !c.tries ? 'CONCEPT' : null)),
      ms: Date.now() - c.startTs
    };
    var r;
    if (quest.mode === 'demo') r = M.record(JSON.parse(JSON.stringify(state)), a);
    else {
      r = M.record(state, a);
      if (c.confused) {
        var p = (FMQ.skill(q.skill).prereqs || []).find(function (id) { return M.computeState(state, id) !== 'secure'; });
        if (p) (state.skills[p] = state.skills[p] || {}).gap = true;
      }
    }
    quest.stars += r.stars;
    quest.results.push({ qid: q.id, skill: q.skill, correct: correct, explained: !!explained, hints: c.hints, outcome: r.outcome, comeback: r.comeback, mastered: r.mastered, wordWins: r.wordWins });
    var note = FMQ.quest.adapt(state, quest, item, a);
    if (note && note.indexOf('light') >= 0) ui.pendingLine = maria.lighten();
    c.result = r;
    c.lastAttempt = a;
    if (quest.mode !== 'demo') { state.activeQuest = (quest.mode === 'quest' || quest.mode === 'diagnostic') ? quest : state.activeQuest; save(); }
    return r;
  }

  function finish() {
    var quest = ui.quest;
    var s = A.summarise(state, quest);
    if (quest.mode !== 'demo') {
      state.sessions.push(s);
      if (quest.mode === 'diagnostic') state.profile.diagnosticDone = true;
      if (state.activeQuest && state.activeQuest.id === quest.id) state.activeQuest = null;
      save();
    }
    ui.summary = s;
    go(quest.mode === 'diagnostic' ? 'diagResults' : 'victory');
  }

  function focusFeedback() {
    var fb = document.getElementById('fb');
    if (fb) { fb.focus({ preventScroll: true }); fb.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }); }
  }

  var actions = {
    begin: function () { state.profile.onboarded = true; save(); startQuest(FMQ.quest.buildDiagnostic()); },
    go: function (v) { ui.confirmReset = false; ui.exportOpen = false; go(v); },
    startQuest: function () {
      var aq = state.activeQuest;
      if (aq && aq.day === today() && aq.idx < aq.items.length) {
        ui.quest = aq; newCard(); if (aq.idx > 0) ui.line = 'Welcome back. Let’s continue where we paused.'; go('play'); return;
      }
      if (!state.profile.diagnosticDone) { startQuest(FMQ.quest.buildDiagnostic()); return; }
      if (doneToday()) return;
      startQuest(FMQ.quest.buildDaily(state));
    },
    firstMission: function () {
      var q = FMQ.quest.buildDaily(state);
      q.items = q.items.filter(function (i) { return i.section === 'skill' || i.section === 'fix'; });
      startQuest(q);
    },
    practise: function (id) { startQuest(FMQ.quest.buildPractice(state, id)); },
    demo: function (qid) { startQuest(FMQ.quest.buildDemo(qid)); },
    pause: function () {
      if (ui.quest && (ui.quest.mode === 'quest' || ui.quest.mode === 'diagnostic')) { state.activeQuest = ui.quest; save(); }
      go(ui.quest && ui.quest.mode === 'demo' ? 'parent' : 'home');
    },
    select: function (opt) { if (ui.card.phase !== 'answer') return; ui.card.selected = opt; render(); },
    check: function () {
      var c = ui.card, q = c.q;
      if (!c.selected || c.phase !== 'answer') return;
      c.tries++;
      var ok = c.selected === q.answer;
      if (!ok) {
        var w = q.wrong && q.wrong[c.selected];
        c.errorCat = w ? w[0] : (c.bridge ? 'UNDERSTAND' : q.level <= 1 ? 'CONCEPT' : 'PLAN');
        if (c.hints === 0 && c.tries === 1) c.triedAlone = true;
      }
      if (ui.quest.mode === 'diagnostic') {
        finalize(ok, false); c.correctNow = ok; c.phase = 'diag'; render(); focusFeedback(); return;
      }
      if (ok) {
        var r = finalize(true, false);
        c.message = maria.correct({ outcome: r.outcome, item: c.item, q: q, wordWins: r.wordWins, quest: ui.quest });
        c.phase = 'done';
      } else {
        c.wrongPicked.push(c.selected);
        c.selected = null;
        if (c.tries >= 2) { finalize(false, true); c.phase = 'explain'; ui.line = 'Let’s look at it together.'; }
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
      var p = document.querySelector('.panel--help .hint:last-child'); if (p) p.scrollIntoView({ block: 'nearest' });
    },
    showMe: function () { finalize(false, true); ui.card.phase = 'explain'; ui.line = null; render(); window.scrollTo(0, 0); },
    bridge: function () {
      var c = ui.card; c.bridgeOpen = !c.bridgeOpen; c.bridge = true;
      if (c.bridgeOpen && !c.bridgeWord && c.q.vocab && c.q.vocab.length) c.bridgeWord = c.q.vocab[0];
      render();
    },
    bridgeWord: function (w) { var c = ui.card; c.bridgeWord = w; c.revealed[w] = true; c.bridgeOut = 'word'; render(); },
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
        cf.i++; cf.wrong = false; cf.picked = []; cf.msg = U.pick(['Good.', 'Yes, that’s it.', 'Good. One more small step.']);
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
      if (quest.mode === 'quest' || quest.mode === 'diagnostic') { state.activeQuest = quest; save(); }
      newCard(); render(); window.scrollTo(0, 0);
    },
    parentSummary: function (id) { ui.modal = id; render(); var m = document.querySelector('.modal-card button:last-child'); if (m) m.focus(); },
    closeModal: function () { ui.modal = null; render(); },
    copySummary: function () {
      var s = state.sessions.find(function (x) { return x.id === ui.modal; }) || ui.summary;
      var text = 'Today’s Learning — ' + FMQ.learner.name + ' (' + fmtDay(s.day) + ')\n' + summaryText(s).map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
      copy(text);
    },
    loadDemo: function () { state = FMQ.loadDemo(); ui.confirmReset = false; render(); },
    reset: function () {
      if (!ui.confirmReset) { ui.confirmReset = true; render(); return; }
      ui.confirmReset = false; state = FMQ.store.reset(); go('onboarding');
    },
    exportData: function () { ui.exportOpen = !ui.exportOpen; render(); },
    copyExport: function () { copy(FMQ.store.exportJSON()); }
  };

  function copy(text) {
    try {
      navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, function () { toast('Select the text and copy it'); });
    } catch (e) { toast('Select the text and copy it'); }
  }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1800);
  }

  function render() {
    root.innerHTML = views[ui.view]();
    root.dataset.view = ui.view;
  }

  function boot() {
    root = document.getElementById('app');
    document.title = FMQ.brand().title;
    state = FMQ.store.load();
    var t = today();
    state.lastVisitDay = t; save();
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
