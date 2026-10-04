/* Small, accessible inline-SVG/HTML visuals for questions: fraction bars, dot groups,
   rectangles with side labels, area grids, beads for ratio, pictographs, tables, a 24-hour clock. */
window.FMQ = window.FMQ || {};

FMQ.visual = (function () {
  var E = FMQ.util.esc;

  function bar(v) {
    var w = 300, h = 56, pw = w / v.parts, s = '';
    for (var i = 0; i < v.parts; i++) {
      s += '<rect x="' + (i * pw + 2) + '" y="2" width="' + (pw - 4) + '" height="' + (h - 4) + '" rx="8" class="' + (i < v.shaded ? 'v-fill' : 'v-empty') + '"/>';
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="v-svg v-bar" role="img" aria-label="Bar with ' + v.parts + ' equal parts, ' + v.shaded + ' shaded">' + s + '</svg>';
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
    var x = 50, y = 18, W = rw + 100, H = rh + 54, grid = '';
    if (v.grid) {
      for (var i = 1; i < v.w; i++) grid += '<line x1="' + (x + i * k) + '" y1="' + y + '" x2="' + (x + i * k) + '" y2="' + (y + rh) + '" class="v-gridline"/>';
      for (var j = 1; j < v.h; j++) grid += '<line x1="' + x + '" y1="' + (y + j * k) + '" x2="' + (x + rw) + '" y2="' + (y + j * k) + '" class="v-gridline"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="v-svg v-rect" role="img" aria-label="Rectangle ' + v.w + ' ' + v.unit + ' by ' + v.h + ' ' + v.unit + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + rw + '" height="' + rh + '" rx="4" class="v-shape"/>' + grid +
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
      return '<div class="v-beadrow"><span class="v-beadlabel">' + E(g.label) + '</span><div class="v-beadset">' + b + '</div></div>';
    }).join('') + '</div>';
  }

  function ratioRows(v) {
    var row = '<div class="v-ratiorow"><span class="v-chip">' + v.ra + ' cup ' + E(v.a) + '</span><span class="v-arrow" aria-hidden="true">→</span><span class="v-chip tone-b">' + v.rb + ' cups ' + E(v.b) + '</span></div>';
    return '<div class="v-ratio">' + row + '</div>';
  }

  function flowers(v) {
    var s = '';
    for (var i = 0; i < v.total; i++) s += '<span class="v-flower' + (i < v.red ? ' is-red' : '') + '" aria-hidden="true">✿</span>';
    return '<div class="v-flowers" role="img" aria-label="' + v.total + ' flowers, ' + v.red + ' are red">' + s + '</div>';
  }

  function picto(v) {
    var rows = v.rows.map(function (r) {
      var icons = ''; for (var i = 0; i < r[1]; i++) icons += '<span class="v-pic" aria-hidden="true">' + E(v.icon) + '</span>';
      return '<tr><th scope="row">' + E(r[0]) + '</th><td><span class="sr-only">' + r[1] + ' pictures</span>' + icons + '</td></tr>';
    }).join('');
    return '<figure class="v-picto"><figcaption>' + E(v.title) + '</figcaption><table>' + rows + '</table>' +
      '<p class="v-key"><b>Key:</b> <span aria-hidden="true">' + E(v.icon) + '</span> represents ' + v.key + ' ' + E(v.unit) + '</p></figure>';
  }

  function table(v) {
    return '<div class="v-tablewrap"><table class="v-table"><thead><tr>' + v.head.map(function (h) { return '<th scope="col">' + E(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + v.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td>' + E(c) + '</td>' : '<th scope="row">' + E(c) + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }

  function clock24(v) {
    return '<div class="v-clock" role="img" aria-label="Digital clock showing ' + v.time + ' hours"><span>' + E(v.time.slice(0, 2)) + '</span><i>:</i><span>' + E(v.time.slice(2)) + '</span><small>hours</small></div>';
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
      var h = b[1] / top * ch, x = L + i * bw + bw * 0.2;
      s += '<rect x="' + x + '" y="' + (T + ch - h) + '" width="' + bw * 0.6 + '" height="' + h + '" rx="3" class="v-fill"/>' +
        '<text x="' + (x + bw * 0.3) + '" y="' + (H - 8) + '" text-anchor="middle" class="v-tick">' + E(b[0]) + '</text>';
    });
    s += '<line x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (T + ch) + '" class="v-axis"/><line x1="' + L + '" y1="' + (T + ch) + '" x2="' + (W - 8) + '" y2="' + (T + ch) + '" class="v-axis"/>';
    return '<figure class="v-chartfig"><figcaption>' + E(v.title) + '</figcaption><svg viewBox="0 0 ' + W + ' ' + H + '" class="v-svg v-barchart" role="img" aria-label="Bar chart: ' +
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
      var px = o + p[1] * c, py = top + (n - p[2]) * c, right = p[1] >= n - 1 && p[0].length > 1;
      s += '<circle cx="' + px + '" cy="' + py + '" r="6" class="v-point"/><text x="' + (right ? px - 9 : px + 9) + '" y="' + (py - 9) + '" text-anchor="' + (right ? 'end' : 'start') + '" class="v-label v-label--pt">' + E(p[0]) + '</text>';
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
    function box(f, dx, dy) { // f = front rectangle [x, y, w, h]
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
    barchart: barchart, coord: coord, angle: angle, lines: lines, polygon: polygon, solid: solid };
  return function (v) { return v && kinds[v.kind] ? '<div class="visual">' + kinds[v.kind](v) + '</div>' : ''; };
})();
