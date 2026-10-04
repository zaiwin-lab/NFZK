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

  var kinds = { bar: bar, dots: dots, rect: rect, grid: grid, beads: beads, ratioRows: ratioRows, flowers: flowers, picto: picto, table: table, clock24: clock24 };
  return function (v) { return v && kinds[v.kind] ? '<div class="visual">' + kinds[v.kind](v) + '</div>' : ''; };
})();
