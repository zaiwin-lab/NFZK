/* Small, accessible inline-SVG/HTML visuals for questions and Guide lessons.
   Labels follow the chosen language (BM in 'bm' and 'dual' modes, English in 'en'). */
window.FMQ = window.FMQ || {};

FMQ.visual = (function () {
  var E = FMQ.util.esc;
  function bmMode() { return FMQ.i18n && FMQ.i18n.lang() !== 'en'; }
  function w(en) { return bmMode() ? FMQ.i18n.trWord(en) : en; }
  function two(en, bm) { return bmMode() && bm ? bm : en; }

  function bar(v) {
    var W = 300, h = 56, pw = W / v.parts, s = '';
    for (var i = 0; i < v.parts; i++) s += '<rect x="' + (i * pw + 2) + '" y="2" width="' + (pw - 4) + '" height="' + (h - 4) + '" rx="8" class="' + (i < v.shaded ? 'v-fill' : 'v-empty') + '"/>';
    return '<svg viewBox="0 0 ' + W + ' ' + h + '" class="v-svg v-bar" role="img" aria-label="Bar with ' + v.parts + ' equal parts, ' + v.shaded + ' shaded">' + s + '</svg>';
  }

  function dots(v) {
    var per = v.total / v.groups, html = '';
    for (var g = 0; g < v.groups; g++) {
      var d = '';
      for (var i = 0; i < per; i++) d += '<span class="v-dot"></span>';
      html += '<div class="v-group' + (v.highlight && g < v.highlight ? ' is-on' : '') + '">' + d + '</div>';
    }
    return '<div class="v-dots" role="img" aria-label="' + v.total + ' dots in ' + v.groups + ' equal groups">' + html + '</div>';
  }

  function rect(v) {
    var maxW = 240, maxH = 130, k = Math.min(maxW / v.w, maxH / v.h), rw = v.w * k, rh = v.h * k;
    var x = 50, y = 18, W = rw + 100, H = rh + 54, g = '';
    if (v.grid) {
      for (var i = 1; i < v.w; i++) g += '<line x1="' + (x + i * k) + '" y1="' + y + '" x2="' + (x + i * k) + '" y2="' + (y + rh) + '" class="v-gridline"/>';
      for (var j = 1; j < v.h; j++) g += '<line x1="' + x + '" y1="' + (y + j * k) + '" x2="' + (x + rw) + '" y2="' + (y + j * k) + '" class="v-gridline"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="v-svg v-rect" role="img" aria-label="Rectangle ' + v.w + ' ' + v.unit + ' by ' + v.h + ' ' + v.unit + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + rw + '" height="' + rh + '" rx="4" class="v-shape"/>' + g +
      '<text x="' + (x + rw / 2) + '" y="' + (y + rh + 28) + '" text-anchor="middle" class="v-label">' + v.w + ' ' + E(v.unit) + '</text>' +
      '<text x="' + (x - 10) + '" y="' + (y + rh / 2 + 5) + '" text-anchor="end" class="v-label">' + v.h + ' ' + E(v.unit) + '</text></svg>';
  }

  function grid(v) {
    var c = 34, s = '';
    for (var r = 0; r < v.rows + 2; r++) for (var q = 0; q < v.cols + 2; q++) {
      var on = r > 0 && r <= v.rows && q > 0 && q <= v.cols;
      s += '<rect x="' + (q * c) + '" y="' + (r * c) + '" width="' + c + '" height="' + c + '" class="' + (on ? 'v-fill v-cell' : 'v-cell') + '"/>';
    }
    var W = (v.cols + 2) * c, H = (v.rows + 2) * c;
    return '<svg viewBox="-1 -1 ' + (W + 2) + ' ' + (H + 2) + '" class="v-svg v-grid" role="img" aria-label="Grid with a shaded shape ' + v.cols + ' squares by ' + v.rows + ' squares">' + s + '</svg>';
  }

  function beads(v) {
    return '<div class="v-beads">' + v.groups.map(function (g) {
      var b = ''; for (var i = 0; i < g.n; i++) b += '<span class="v-bead tone-' + g.tone + '"></span>';
      return '<div class="v-beadrow"><span class="v-beadlabel">' + E(two(g.label, g.labelBm || w(g.label))) + '</span><div class="v-beadset">' + b + '</div></div>';
    }).join('') + '</div>';
  }

  function ratioRows(v) {
    var a = two(v.a, v.aBm), b = two(v.b, v.bBm);
    return '<div class="v-ratio"><div class="v-ratiorow"><span class="v-chip">' + v.ra + ' ' + E(a) + '</span><span class="v-arrow" aria-hidden="true">→</span><span class="v-chip tone-b">' + v.rb + ' ' + E(b) + '</span></div></div>';
  }

  function flowers(v) {
    var s = '';
    for (var i = 0; i < v.total; i++) s += '<span class="v-flower' + (i < v.red ? ' is-red' : '') + '" aria-hidden="true">✿</span>';
    return '<div class="v-flowers" role="img" aria-label="' + v.total + ' flowers, ' + v.red + ' are red">' + s + '</div>';
  }

  function picto(v) {
    var rows = v.rows.map(function (r) {
      var icons = ''; for (var i = 0; i < r[1]; i++) icons += '<span class="v-pic" aria-hidden="true">' + E(v.icon) + '</span>';
      return '<tr><th scope="row">' + E(w(r[0])) + '</th><td><span class="sr-only">' + r[1] + ' pictures</span>' + icons + '</td></tr>';
    }).join('');
    var key = bmMode() ? '<b>Petunjuk:</b> <span aria-hidden="true">' + E(v.icon) + '</span> mewakili ' + v.key + ' ' + E(v.unitBm || v.unit)
      : '<b>Key:</b> <span aria-hidden="true">' + E(v.icon) + '</span> represents ' + v.key + ' ' + E(v.unit);
    return '<figure class="v-picto"><figcaption>' + E(two(v.title, v.titleBm)) + '</figcaption><table>' + rows + '</table><p class="v-key">' + key + '</p></figure>';
  }

  function table(v) {
    var head = bmMode() && v.headBm ? v.headBm : v.head, rows = bmMode() && v.rowsBm ? v.rowsBm : v.rows;
    return '<div class="v-tablewrap"><table class="v-table"><thead><tr>' + head.map(function (x) { return '<th scope="col">' + E(x) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td>' + E(c) + '</td>' : '<th scope="row">' + E(w(c)) + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }

  function clock24(v) {
    return '<div class="v-clock" role="img" aria-label="Digital clock showing ' + v.time + ' hours">' + (bmMode() ? '<small>jam</small>' : '') + '<span>' + E(v.time.slice(0, 2)) + '</span><i>:</i><span>' + E(v.time.slice(2)) + '</span>' + (bmMode() ? '' : '<small>hours</small>') + '</div>';
  }

  /* Analogue clock: short hour hand, long minute hand, optional 5-minute marks and a hand legend. */
  function clock(v) {
    var C = 120, R = 92, s = '';
    s += '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" class="v-face"/>';
    for (var i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = R - (big ? 10 : 5);
      s += '<line x1="' + (C + r1 * Math.sin(a)) + '" y1="' + (C - r1 * Math.cos(a)) + '" x2="' + (C + (R - 2) * Math.sin(a)) + '" y2="' + (C - (R - 2) * Math.cos(a)) + '" class="' + (big ? 'v-tickmark v-tickmark--big' : 'v-tickmark') + '"/>';
    }
    for (var n = 1; n <= 12; n++) {
      var b = n * 30 * Math.PI / 180;
      s += '<text x="' + (C + 70 * Math.sin(b)) + '" y="' + (C - 70 * Math.cos(b) + 7) + '" text-anchor="middle" class="v-clocknum">' + n + '</text>';
      if (v.five) s += '<text x="' + (C + 110 * Math.sin(b)) + '" y="' + (C - 110 * Math.cos(b) + 5) + '" text-anchor="middle" class="v-fivenum">' + (n === 12 ? '0' : n * 5) + '</text>';
    }
    if (!v.plain || v.label) {
      var ha = ((v.h % 12) + v.m / 60) * 30 * Math.PI / 180, ma = v.m * 6 * Math.PI / 180;
      var hh = '<line x1="' + C + '" y1="' + C + '" x2="' + (C + 48 * Math.sin(ha)) + '" y2="' + (C - 48 * Math.cos(ha)) + '" class="v-hand v-hand--hour' + (v.label === 'hour' ? ' is-glow' : '') + '"/>';
      var mh = '<line x1="' + C + '" y1="' + C + '" x2="' + (C + 78 * Math.sin(ma)) + '" y2="' + (C - 78 * Math.cos(ma)) + '" class="v-hand v-hand--min' + (v.label === 'minute' ? ' is-glow' : '') + '"/>';
      s += hh + mh;
    }
    s += '<circle cx="' + C + '" cy="' + C + '" r="6" class="v-hub"/>';
    var legend = v.label ? '<p class="v-handlegend"><span class="lg lg--hour' + (v.label === 'minute' ? ' is-dim' : '') + '"><i></i>' + E(two('Short hand = hour', 'Jarum pendek = jam')) + '</span>' +
      '<span class="lg lg--min' + (v.label === 'hour' ? ' is-dim' : '') + '"><i></i>' + E(two('Long hand = minutes', 'Jarum panjang = minit')) + '</span></p>' : '';
    var label = v.plain && !v.label ? 'Clock face with numbers 1 to 12' : 'Clock showing ' + v.h + ':' + (v.m < 10 ? '0' : '') + v.m;
    return '<figure class="v-clockfig"><svg viewBox="-2 -2 244 244" class="v-svg v-analog" role="img" aria-label="' + label + '">' + s + '</svg>' + legend + '</figure>';
  }

  /* 24-hour day bar: a.m. and p.m. halves, optional activity markers. */
  function daybar(v) {
    var L = 14, Wd = 292, s = '', x = function (hr) { return L + hr / 24 * Wd; };
    s += '<rect x="' + L + '" y="34" width="' + Wd / 2 + '" height="26" rx="6" class="v-am' + (v.mark === 'pm' ? ' is-dim' : '') + '"/>';
    s += '<rect x="' + (L + Wd / 2) + '" y="34" width="' + Wd / 2 + '" height="26" rx="6" class="v-pm' + (v.mark === 'am' ? ' is-dim' : '') + '"/>';
    s += '<text x="' + x(6) + '" y="52" text-anchor="middle" class="v-daylabel">a.m.</text><text x="' + x(18) + '" y="52" text-anchor="middle" class="v-daylabel">p.m.</text>';
    [0, 6, 12, 18, 24].forEach(function (hr) { s += '<line x1="' + x(hr) + '" y1="60" x2="' + x(hr) + '" y2="68" class="v-axis"/><text x="' + x(hr) + '" y="82" text-anchor="middle" class="v-tick">' + (hr === 24 ? 12 : hr === 0 ? 12 : hr > 12 ? hr - 12 : hr) + '</text>'; });
    s += '<text x="' + x(0) + '" y="98" text-anchor="start" class="v-tick">' + E(two('midnight', 'tengah malam')) + '</text><text x="' + x(12) + '" y="98" text-anchor="middle" class="v-tick">' + E(two('noon', 'tengah hari')) + '</text><text x="' + x(24) + '" y="98" text-anchor="end" class="v-tick">' + E(two('midnight', 'tengah malam')) + '</text>';
    (v.dots || []).forEach(function (d) { s += '<text x="' + x(d[0]) + '" y="26" text-anchor="middle" class="v-dayicon">' + d[1] + '</text>'; });
    return '<svg viewBox="0 0 320 104" class="v-svg v-daybar" role="img" aria-label="A day: a.m. is midnight to noon, p.m. is noon to midnight">' + s + '</svg>';
  }

  /* Duration timeline: start → jumps → end. */
  function timeline(v) {
    var parts = ['<span class="tl-time">' + E(v.from) + '</span>'];
    if (!v.jumps.length) parts.push('<span class="tl-jump tl-jump--q">? ' + E(two('how long', 'berapa lama')) + '</span><span class="tl-time">' + E(v.to) + '</span>');
    v.jumps.forEach(function (j) { parts.push('<span class="tl-jump">+ ' + E(two(j[1][0], j[1][1])) + '</span><span class="tl-time">' + E(j[0]) + '</span>'); });
    return '<div class="v-timeline" role="img" aria-label="Timeline from ' + E(v.from) + ' to ' + E(v.to) + '">' + parts.join('') + '</div>';
  }

  /* Place-value table. */
  function pvtable(v) {
    var digits = String(v.n).split(''), names = bmMode() ? ['ribu', 'ratus', 'puluh', 'sa'] : ['thousands', 'hundreds', 'tens', 'ones'];
    names = names.slice(4 - digits.length);
    return '<div class="v-tablewrap"><table class="v-table v-pv"><thead><tr>' + names.map(function (x) { return '<th scope="col">' + E(x) + '</th>'; }).join('') + '</tr></thead><tbody><tr>' +
      digits.map(function (d, i) { return '<td class="' + (v.mark !== undefined && digits.length - 1 - i === v.mark ? 'is-mark' : '') + '">' + d + '</td>'; }).join('') + '</tr></tbody></table></div>';
  }

  /* Column addition / subtraction, revealing the answer column by column. */
  function column(v) {
    var a = String(v.a), b = String(v.b), len = Math.max(a.length, b.length) + 1;
    function cells(str, cls) { str = str.padStart(len, ' '); return str.split('').map(function (ch) { return '<span class="cc' + (cls ? ' ' + cls : '') + '">' + (ch === ' ' ? '' : E(ch)) + '</span>'; }).join(''); }
    var res = '';
    if (v.upto) {
      var full = v.op === '+' ? String(Number(a) + Number(b)) : String(Number(a) - Number(b));
      full = full.padStart(len, ' ');
      res = full.split('').map(function (ch, i) { return '<span class="cc cc--res">' + (len - i <= v.upto && ch !== ' ' ? E(ch) : '') + '</span>'; }).join('');
    }
    return '<div class="v-column" role="img" aria-label="' + E(a + ' ' + v.op + ' ' + b) + '"><div class="cr">' + cells(a) + '</div><div class="cr"><span class="cop">' + E(v.op) + '</span>' + cells(b) + '</div><div class="cr cr--line"></div>' + (res ? '<div class="cr">' + res + '</div>' : '') + '</div>';
  }

  function barchart(v) {
    var max = Math.max.apply(null, v.bars.map(function (b) { return b[1]; }));
    var top = Math.ceil((max + v.step) / v.step) * v.step, W = 320, H = 200, L = 36, B = 28, T = 10;
    var ch = H - B - T, cw = W - L - 8, bw = cw / v.bars.length, s = '';
    for (var y = 0; y <= top; y += v.step) {
      var py = T + ch - y / top * ch;
      s += '<line x1="' + L + '" y1="' + py + '" x2="' + (W - 8) + '" y2="' + py + '" class="v-gridline"/><text x="' + (L - 6) + '" y="' + (py + 4) + '" text-anchor="end" class="v-tick">' + y + '</text>';
    }
    v.bars.forEach(function (b, i) {
      var hh = b[1] / top * ch, x = L + i * bw + bw * 0.2;
      s += '<rect x="' + x + '" y="' + (T + ch - hh) + '" width="' + bw * 0.6 + '" height="' + hh + '" rx="3" class="v-fill"/>' +
        '<text x="' + (x + bw * 0.3) + '" y="' + (H - 8) + '" text-anchor="middle" class="v-tick">' + E(w(b[0])) + '</text>';
    });
    s += '<line x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (T + ch) + '" class="v-axis"/><line x1="' + L + '" y1="' + (T + ch) + '" x2="' + (W - 8) + '" y2="' + (T + ch) + '" class="v-axis"/>';
    return '<figure class="v-chartfig"><figcaption>' + E(two(v.title, v.titleBm)) + '</figcaption><svg viewBox="0 0 ' + W + ' ' + H + '" class="v-svg v-barchart" role="img" aria-label="Bar chart: ' +
      v.bars.map(function (b) { return E(b[0]) + ' ' + b[1]; }).join(', ') + '">' + s + '</svg></figure>';
  }

  function coord(v) {
    var n = 6, c = 34, o = 30, top = 26, W = o + n * c + 34, H = top + n * c + 30, s = '';
    for (var i = 0; i <= n; i++) {
      s += '<line x1="' + (o + i * c) + '" y1="' + top + '" x2="' + (o + i * c) + '" y2="' + (top + n * c) + '" class="v-gridline"/>';
      s += '<line x1="' + o + '" y1="' + (top + i * c) + '" x2="' + (o + n * c) + '" y2="' + (top + i * c) + '" class="v-gridline"/>';
      s += '<text x="' + (o + i * c) + '" y="' + (top + n * c + 18) + '" text-anchor="middle" class="v-tick">' + i + '</text>';
      s += '<text x="' + (o - 10) + '" y="' + (top + (n - i) * c + 4) + '" text-anchor="end" class="v-tick">' + i + '</text>';
    }
    s += '<line x1="' + o + '" y1="' + (top + n * c) + '" x2="' + (o + n * c) + '" y2="' + (top + n * c) + '" class="v-axis"/><line x1="' + o + '" y1="' + top + '" x2="' + o + '" y2="' + (top + n * c) + '" class="v-axis"/>';
    (v.points || []).forEach(function (p) {
      var px = o + p[1] * c, py = top + (n - p[2]) * c, lab = w(p[0]), right = p[1] >= n - 1 && lab.length > 1;
      s += '<circle cx="' + px + '" cy="' + py + '" r="6" class="v-point"/><text x="' + (right ? px - 9 : px + 9) + '" y="' + (py - 9) + '" text-anchor="' + (right ? 'end' : 'start') + '" class="v-label v-label--pt">' + E(lab) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="v-svg v-coord" role="img" aria-label="Coordinate grid from 0 to 6 with ' +
      (v.points || []).map(function (p) { return 'point ' + E(p[0]); }).join(', ') + '">' + s + '</svg>';
  }

  function angle(v) {
    var cx = 70, cy = 150, r = 120, a = v.deg * Math.PI / 180;
    var x2 = cx + r * Math.cos(-a), y2 = cy + r * Math.sin(-a);
    var arc = v.deg === 90 ? '<path d="M' + (cx + 22) + ' ' + cy + ' L' + (cx + 22) + ' ' + (cy - 22) + ' L' + cx + ' ' + (cy - 22) + '" class="v-arc"/>'
      : '<path d="M' + (cx + 30) + ' ' + cy + ' A30 30 0 0 0 ' + (cx + 30 * Math.cos(-a)) + ' ' + (cy + 30 * Math.sin(-a)) + '" class="v-arc"/>';
    return '<svg viewBox="0 0 230 170" class="v-svg v-angle" role="img" aria-label="An angle"><line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r + 30) + '" y2="' + cy + '" class="v-ray"/><line x1="' + cx + '" y1="' + cy + '" x2="' + x2 + '" y2="' + y2 + '" class="v-ray"/>' + arc + '</svg>';
  }

  function lines(v) {
    var s;
    if (v.type === 'parallel') s = '<line x1="30" y1="50" x2="230" y2="' + (50 + v.rot) + '" class="v-ray"/><line x1="30" y1="110" x2="230" y2="' + (110 + v.rot) + '" class="v-ray"/>';
    else if (v.type === 'perpendicular') s = '<line x1="30" y1="120" x2="230" y2="120" class="v-ray"/><line x1="130" y1="20" x2="130" y2="150" class="v-ray"/><path d="M130 104 L146 104 L146 120" class="v-arc"/>';
    else s = '<line x1="30" y1="130" x2="230" y2="60" class="v-ray"/><line x1="40" y1="40" x2="220" y2="150" class="v-ray"/>';
    return '<svg viewBox="0 0 260 170" class="v-svg v-lines" role="img" aria-label="Two lines">' + s + '</svg>';
  }

  function polygon(v) {
    var n = v.sides, cx = 90, cy = 90, r = 70, pts = [];
    if (n === 4) pts = ['20,45', '160,45', '160,135', '20,135'];
    else for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); }
    return '<svg viewBox="0 0 180 180" class="v-svg v-poly" role="img" aria-label="A shape"><polygon points="' + pts.join(' ') + '" class="v-shape"/></svg>';
  }

  // Solid shapes with dashed hidden edges, so every face, edge and vertex can be counted.
  function solid(v) {
    function L(a, b, hidden) { return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="' + (hidden ? 'v-edge v-edge--hidden' : 'v-edge') + '"/>'; }
    function box(f, dx, dy) {
      var A = [f[0], f[1]], B = [f[0] + f[2], f[1]], C = [f[0] + f[2], f[1] + f[3]], D = [f[0], f[1] + f[3]];
      var a = [A[0] + dx, A[1] - dy], b = [B[0] + dx, B[1] - dy], c = [C[0] + dx, C[1] - dy], d = [D[0] + dx, D[1] - dy];
      return '<path d="M' + A + ' L' + B + ' L' + C + ' L' + D + 'Z" class="v-shape"/><path d="M' + A + ' L' + a + ' L' + b + ' L' + B + 'Z" class="v-shape v-shape--2"/><path d="M' + B + ' L' + b + ' L' + c + ' L' + C + 'Z" class="v-shape v-shape--3"/>' +
        L(d, a, 1) + L(d, c, 1) + L(d, D, 1);
    }
    var art = {
      'cube': function () { return box([40, 55, 75, 75], 35, 28); },
      'cuboid': function () { return box([20, 65, 115, 65], 40, 28); },
      'square-based pyramid': function () {
        var p = [95, 15], a = [30, 125], b = [125, 125], c = [160, 98], d = [65, 98];
        return '<path d="M' + a + ' L' + b + ' L' + p + 'Z" class="v-shape"/><path d="M' + b + ' L' + c + ' L' + p + 'Z" class="v-shape v-shape--3"/>' + L(c, d, 1) + L(d, a, 1) + L(d, p, 1);
      },
      'triangular prism': function () {
        var A = [25, 130], B = [75, 50], C = [125, 130], dx = 60, dy = 22, a = [A[0] + dx, A[1] - dy], b = [B[0] + dx, B[1] - dy], c = [C[0] + dx, C[1] - dy];
        return '<path d="M' + A + ' L' + B + ' L' + C + 'Z" class="v-shape"/><path d="M' + B + ' L' + b + ' L' + c + ' L' + C + 'Z" class="v-shape v-shape--3"/>' + L(A, a, 1) + L(a, b, 1) + L(a, c, 1);
      }
    }[v.shape];
    return '<svg viewBox="0 0 200 150" class="v-svg v-solid" role="img" aria-label="A ' + E(v.shape) + ', with hidden edges shown as dashed lines">' + (art ? art() : '') + '</svg>';
  }

  var kinds = { bar: bar, dots: dots, rect: rect, grid: grid, beads: beads, ratioRows: ratioRows, flowers: flowers, picto: picto, table: table, clock24: clock24,
    clock: clock, daybar: daybar, timeline: timeline, pvtable: pvtable, column: column,
    barchart: barchart, coord: coord, angle: angle, lines: lines, polygon: polygon, solid: solid };
  return function (v) { return v && kinds[v.kind] ? '<div class="visual">' + kinds[v.kind](v) + '</div>' : ''; };
})();
