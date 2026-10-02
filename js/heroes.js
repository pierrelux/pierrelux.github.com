// Hero animations for pierrelucbacon.com.
// One figure is shown per visit; the buttons under the caption switch between them.
(function () {
  var stage = document.querySelector('.hero-stage');
  if (!stage) return;
  var figs = Array.prototype.slice.call(stage.querySelectorAll('figure[data-hero]'));
  var picks = Array.prototype.slice.call(document.querySelectorAll('.hero-pick'));
  var replay = document.querySelector('.hero-replay');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stopCurrent = null;

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function rgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function ease(u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // ------------------------------------------------------------ passages (CSS-driven)
  function restartSvg(fig) {
    var svg = fig.querySelector('svg');
    var copy = svg.cloneNode(true);
    svg.parentNode.replaceChild(copy, svg);
    return copy;
  }
  function passages(fig) { restartSvg(fig); return function () {}; }

  // ------------------------------------------------------------ ice
  function lazySvg(fig, done) {
    var slot = fig.querySelector('.hero-lazy');
    if (!slot) return done();
    fetch(slot.getAttribute('data-src')).then(function (r) { return r.text(); }).then(function (txt) {
      slot.outerHTML = txt;
      done();
    });
  }
  function gunzip(b64) {
    var bin = atob(b64), buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    var ds = new DecompressionStream('gzip');
    return new Response(new Blob([buf]).stream().pipeThrough(ds)).arrayBuffer();
  }
  function ice(fig) {
    var stopped = false, raf = 0;
    lazySvg(fig, function () {
      if (stopped) return;
      var svg = restartSvg(fig);
      var M = JSON.parse(svg.getAttribute('data-meta'));
      // the close view is a real copy of the drawing (not <use>), so page styles apply in every browser
      var world = svg.querySelector('#ic-world'), zoom = svg.querySelector('.ic-zoom');
      var copy = world.cloneNode(true);
      copy.removeAttribute('id');
      zoom.appendChild(copy);
      var views = [world, copy];
      if (reduce || typeof DecompressionStream === 'undefined') return;
      gunzip(svg.getAttribute('data-b64')).then(function (buf) {
        if (stopped) return;
        var a = new Int16Array(buf), F = M.frames, n = M.moved.length;
        // cumulative sum of per-frame deltas -> displacement from the initial pose
        var disp = new Float32Array(F * n * 3);
        for (var j = 0; j < n * 3; j++) {
          var acc = 0;
          for (var f = 0; f < F; f++) { acc += a[f * n * 3 + j]; disp[f * n * 3 + j] = acc / 1000; }
        }
        var off = F * n * 3, ship = [];
        for (var f2 = 0; f2 < F; f2++) ship.push([a[off + f2 * 3] / 1000, a[off + f2 * 3 + 1] / 1000, a[off + f2 * 3 + 2] / 1000]);
        var els = [], ships = [], plans = [];
        views.forEach(function (v) {
          var byK = {};
          Array.prototype.forEach.call(v.querySelectorAll('.ic-floe'), function (p) { byK[p.getAttribute('data-k')] = p; });
          els.push(M.moved.map(function (k) { return byK[k]; }));
          ships.push(v.querySelector('.ic-ship'));
          plans.push(v.querySelector('.ic-plan'));
        });
        var win = svg.querySelector('.ic-window');
        var route = M.route, half = M.H2 / (2 * M.z);
        function tr(x, y, ang) { return 'translate(' + x.toFixed(3) + ' ' + y.toFixed(3) + ') rotate(' + (ang * 57.29578).toFixed(2) + ')'; }
        function set(fr) {
          var i = Math.min(Math.floor(fr), F - 1), u = fr - i, i2 = Math.min(i + 1, F - 1);
          for (var j = 0; j < n; j++) {
            var b0 = (i * n + j) * 3, b1 = (i2 * n + j) * 3, p0 = M.init[j];
            var x = p0[0] + disp[b0] + u * (disp[b1] - disp[b0]);
            var y = p0[1] + disp[b0 + 1] + u * (disp[b1 + 1] - disp[b0 + 1]);
            var t = p0[2] + disp[b0 + 2] + u * (disp[b1 + 2] - disp[b0 + 2]);
            var tf = tr(x, y, t);
            els[0][j].setAttribute('transform', tf);
            els[1][j].setAttribute('transform', tf);
          }
          var s0 = ship[i], s1 = ship[i2];
          var sx = s0[0] + u * (s1[0] - s0[0]), sy = s0[1] + u * (s1[1] - s0[1]), sa = s0[2] + u * (s1[2] - s0[2]);
          var st = tr(sx, sy, sa);
          ships[0].setAttribute('transform', st);
          ships[1].setAttribute('transform', st);
          // look-ahead along the planned route
          // start at the bow tip and follow the planned route for about four metres
          var bx = sx + M.bow * Math.cos(sa), by = sy + M.bow * Math.sin(sa);
          var d = 'M' + bx.toFixed(3) + ' ' + by.toFixed(3);
          for (var r = 0; r < route.length; r++) {
            if (route[r][1] > by + 0.15 && route[r][1] < by + 4) d += 'L' + route[r][0] + ' ' + route[r][1];
          }
          var pd = sy < M.y1 - 1.5 ? d : '';
          plans[0].setAttribute('d', pd);
          plans[1].setAttribute('d', pd);
          var cy = clamp(sy, M.y0 + M.W / (2 * M.z), M.y1 - M.W / (2 * M.z));
          var cx = clamp(sx, half, M.width - half);
          zoom.setAttribute('transform', 'matrix(0 ' + M.z + ' ' + M.z + ' 0 ' + (M.W / 2 - M.z * cy).toFixed(2) + ' ' + (M.top2 + M.H2 / 2 - M.z * cx).toFixed(2) + ')');
          win.setAttribute('x', (M.s * (cy - M.W / (2 * M.z) - M.y0)).toFixed(1));
          win.setAttribute('y', (M.s * (cx - half)).toFixed(1));
        }
        var t0 = null, dur = 14000;
        function step(ts) {
          if (stopped) return;
          if (t0 === null) t0 = ts;
          var p = clamp((ts - t0 - 300) / dur, 0, 1);
          set(p * (F - 1));
          if (p < 1) raf = requestAnimationFrame(step);
        }
        set(0);
        raf = requestAnimationFrame(step);
      });
    });
    return function () { stopped = true; cancelAnimationFrame(raf); };
  }

  // ------------------------------------------------------------ refrigerants
  function fridge(fig) {
    var svg = restartSvg(fig);
    var fluids = Array.prototype.slice.call(svg.querySelectorAll('.rf-fluid'));
    var dot = svg.querySelector('.rf-parcel');
    if (!dot) {
      dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('class', 'rf-parcel');
      dot.setAttribute('r', '4.5');
      svg.appendChild(dot);
    }
    if (reduce) { dot.style.display = 'none'; return function () {}; }
    fluids.forEach(function (f) { f.classList.remove('on'); f.classList.add('pending'); });
    var timers = [], raf = 0, per = 4200;
    function run(i) {
      if (i > 0) { fluids[i - 1].classList.remove('on'); fluids[i - 1].classList.add('done'); }
      var f = fluids[i];
      f.classList.remove('pending');
      f.classList.add('on', 'drawing');
      var path = f.querySelector('.rf-cycle');
      var len = path.getTotalLength();
      var t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var u = (ts - t0 - 1300) / (per - 1700);
        if (u < 0) { dot.style.opacity = 0; raf = requestAnimationFrame(step); return; }
        u = clamp(u, 0, 1);
        var p = path.getPointAtLength(len * u);
        dot.setAttribute('cx', p.x.toFixed(1));
        dot.setAttribute('cy', p.y.toFixed(1));
        dot.style.opacity = u < 1 ? 1 : 0;
        if (u < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      if (i + 1 < fluids.length) timers.push(setTimeout(function () { run(i + 1); }, per));
    }
    run(0);
    return function () { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }

  // ------------------------------------------------------------ calciner (canvas)
  var calcData = null;
  function loadCalciner(box, done) {
    if (calcData) return done(calcData);
    var meta = JSON.parse(box.getAttribute('data-meta'));
    function ready(buf) {
      var bytes = new Uint8Array(buf);
      var n = meta.nx * meta.ny;
      var toT = function (b) { return meta.tlo + (meta.thi - meta.tlo) * b / 255; };
      var arr = function (off, count) {
        var out = [];
        for (var f = 0; f < count; f++) {
          var a = new Float32Array(n);
          for (var j = 0; j < n; j++) a[j] = toT(bytes[off + f * n + j]);
          out.push(a);
        }
        return out;
      };
      calcData = { meta: meta, target: arr(0, 1)[0], unchanged: arr(n, meta.frames), mppi: arr(n * (1 + meta.frames), meta.frames) };
      done(calcData);
    }
    var b64 = box.getAttribute('data-b64');
    if (b64) {
      var bin = atob(b64), buf = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      ready(buf.buffer);
    } else {
      fetch(box.getAttribute('data-src')).then(function (r) { return r.arrayBuffer(); }).then(ready);
    }
  }

  function calciner(fig) {
    var box = fig.querySelector('.hc-calciner');
    var canvas = box.querySelector('canvas');
    var raf = 0, stopped = false;
    loadCalciner(box, function (D) {
      if (stopped) return;
      var M = D.meta, nx = M.nx, ny = M.ny;
      var C = {
        ink: rgb(css('--ink')), graphite: rgb(css('--graphite')), pencil: rgb(css('--pencil')),
        link: rgb(css('--link')), pad: rgb(css('--pad')), rule: rgb(css('--grid-major'))
      };
      var col = function (c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
      var serif = getComputedStyle(document.body).fontFamily;
      var sans = css('--sans');
      var VW = 480, VH = 440;
      var cols = [{ x: 44, label: 'unchanged heating', data: D.unchanged }, { x: 164, label: 'MPPI', data: D.mppi }];
      var CW = 80, CT = 64, CB = 384;            // column width, top, bottom (2 m x 8 m)
      var tmp = document.createElement('canvas');
      tmp.width = ny; tmp.height = nx;
      var tctx = tmp.getContext('2d');
      var img = tctx.createImageData(ny, nx);

      function size() {
        var w = box.clientWidth || 480;
        var dpr = window.devicePixelRatio || 1;
        canvas.style.width = w + 'px';
        canvas.style.height = (w * VH / VW) + 'px';
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(w * VH / VW * dpr);
        return canvas.width / VW;
      }
      var k = size();
      var ctx = canvas.getContext('2d');

      function frameField(data, f) {
        var i = Math.floor(f), u = f - i;
        var a = data[Math.min(i, M.frames - 1)], b = data[Math.min(i + 1, M.frames - 1)];
        var out = new Float32Array(nx * ny);
        for (var j = 0; j < out.length; j++) out[j] = a[j] + u * (b[j] - a[j]);
        return out;
      }
      // field index: row = across (0..ny-1), col = along (0..nx-1) -> idx = row * nx + col
      function paintField(F, x0) {
        var tgt = D.target;
        for (var along = 0; along < nx; along++) {
          for (var across = 0; across < ny; across++) {
            var idx = across * nx + along;
            var T = F[idx], d = T - tgt[idx];
            // vertical display: inlet (along = 0) at the bottom
            var p = ((nx - 1 - along) * ny + across) * 4;
            var base = clamp((T - 760) / 310, 0, 1) * 0.16;
            var c, a;
            if (d < -1.5) { c = C.link; a = clamp(-d / 35, 0, 1) * 0.85; }
            else if (d > 1.5) { c = C.pencil; a = clamp(d / 35, 0, 1) * 0.85; }
            else { c = C.pencil; a = 0; }
            // composite the two tints over transparent
            var ab = base * (1 - a), A = a + ab;
            img.data[p] = A ? (c[0] * a + C.pencil[0] * ab) / A : 0;
            img.data[p + 1] = A ? (c[1] * a + C.pencil[1] * ab) / A : 0;
            img.data[p + 2] = A ? (c[2] * a + C.pencil[2] * ab) / A : 0;
            img.data[p + 3] = Math.round(A * 255);
          }
        }
        tctx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(tmp, x0 * k, CT * k, CW * k, (CB - CT) * k);
      }
      function isotherms(F, x0) {
        ctx.strokeStyle = col(C.ink, 0.42);
        ctx.lineWidth = 0.8 * k;
        var sx = CW / (ny - 1), sy = (CB - CT) / (nx - 1);
        var X = function (across) { return (x0 + across * sx) * k; };
        var Y = function (along) { return (CB - along * sy) * k; };
        for (var lev = 800; lev <= 1050; lev += 25) {
          ctx.beginPath();
          for (var al = 0; al < nx - 1; al++) {
            for (var ac = 0; ac < ny - 1; ac++) {
              var v0 = F[ac * nx + al], v1 = F[ac * nx + al + 1], v2 = F[(ac + 1) * nx + al + 1], v3 = F[(ac + 1) * nx + al];
              var e = [];
              if ((v0 < lev) !== (v1 < lev)) e.push([ac, al + (lev - v0) / (v1 - v0)]);
              if ((v1 < lev) !== (v2 < lev)) e.push([ac + (lev - v1) / (v2 - v1), al + 1]);
              if ((v3 < lev) !== (v2 < lev)) e.push([ac + 1, al + (lev - v3) / (v2 - v3)]);
              if ((v0 < lev) !== (v3 < lev)) e.push([ac + (lev - v0) / (v3 - v0), al]);
              if (e.length >= 2) {
                ctx.moveTo(X(e[0][0]), Y(e[0][1])); ctx.lineTo(X(e[1][0]), Y(e[1][1]));
                if (e.length === 4) { ctx.moveTo(X(e[2][0]), Y(e[2][1])); ctx.lineTo(X(e[3][0]), Y(e[3][1])); }
              }
            }
          }
          ctx.stroke();
        }
      }
      function text(s, x, y, font, color, align) {
        ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align || 'left';
        ctx.fillText(s, x * k, y * k);
      }
      function controlsAt(t) {
        var i = clamp(Math.floor((t - M.t0) / M.control_dt), 0, M.controls.length - 1);
        return M.controls[i];
      }
      function draw(f) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var t = M.t0 + f * M.dt;
        cols.forEach(function (c, ci) {
          var F = frameField(c.data, f);
          paintField(F, c.x);
          isotherms(F, c.x);
          ctx.strokeStyle = col(C.ink, 1); ctx.lineWidth = 1.2 * k;
          ctx.strokeRect(c.x * k, CT * k, CW * k, (CB - CT) * k);
          // heater zones
          ctx.save();
          ctx.setLineDash([3 * k, 3 * k]); ctx.strokeStyle = col(C.graphite, 0.6); ctx.lineWidth = 0.8 * k;
          ctx.beginPath();
          ctx.moveTo(c.x * k, (CT + CB) / 2 * k); ctx.lineTo((c.x + CW) * k, (CT + CB) / 2 * k);
          ctx.moveTo((c.x + CW / 2) * k, CT * k); ctx.lineTo((c.x + CW / 2) * k, CB * k);
          ctx.stroke(); ctx.restore();
          var u = ci === 1 ? controlsAt(t) : [0.46, 0.46, 0.46, 0.46];
          // heater order: upstream-left, downstream-left, upstream-right, downstream-right
          var zones = [[c.x - 7, (CT + CB) / 2], [c.x - 7, CT], [c.x + CW + 2, (CT + CB) / 2], [c.x + CW + 2, CT]];
          zones.forEach(function (z, zi) {
            var a = clamp((u[zi] - 0.44) / 0.08, 0.12, 0.9);
            ctx.fillStyle = col(C.pencil, a);
            ctx.fillRect(z[0] * k, (z[1] + 2) * k, 5 * k, ((CB - CT) / 2 - 4) * k);
          });
          text(c.label, c.x + CW / 2, CT - 14, (12 * k) + 'px ' + sans, col(C.ink, 1), 'center');
          text('inlet', c.x + CW / 2, CB + 18, 'italic ' + (13 * k) + 'px ' + serif, col(C.graphite, 1), 'center');
        });
        // heater chart for MPPI
        var gx0 = 300, gx1 = 466, gy0 = 84, gy1 = 236, ulo = 0.445, uhi = 0.52;
        var GX = function (tt) { return (gx0 + (gx1 - gx0) * (tt - M.t0) / (80 - M.t0)) * k; };
        var GY = function (v) { return (gy1 - (gy1 - gy0) * (v - ulo) / (uhi - ulo)) * k; };
        text('MPPI heater settings', gx0, CT - 14, (12 * k) + 'px ' + sans, col(C.ink, 1));
        ctx.strokeStyle = col(C.graphite, 0.6); ctx.lineWidth = 1 * k;
        ctx.beginPath(); ctx.moveTo(gx0 * k, gy0 * k); ctx.lineTo(gx0 * k, gy1 * k); ctx.lineTo(gx1 * k, gy1 * k); ctx.stroke();
        [20, 40, 60, 80].forEach(function (tt) {
          text(String(tt), (GX(tt) / k), gy1 + 16, (11 * k) + 'px ' + sans, col(C.graphite, 1), 'center');
        });
        text('time (s)', gx1, gy1 + 34, 'italic ' + (13 * k) + 'px ' + serif, col(C.graphite, 1), 'right');
        [0.46, 0.5].forEach(function (v) {
          text(Math.round(v * 100) + '%', gx0 - 6, GY(v) / k + 4, (11 * k) + 'px ' + sans, col(C.graphite, 1), 'right');
        });
        var names = ['H1', 'H2', 'H3', 'H4'];
        for (var h = 0; h < 4; h++) {
          ctx.beginPath();
          for (var j = 0; j < M.controls.length; j++) {
            var ta = M.t0 + j * M.control_dt, tb = Math.min(80, ta + M.control_dt);
            if (ta > t) break;
            var v = M.controls[j][h];
            if (j === 0) ctx.moveTo(GX(ta), GY(v)); else ctx.lineTo(GX(ta), GY(v));
            ctx.lineTo(GX(Math.min(tb, t)), GY(v));
          }
          ctx.strokeStyle = h === 0 ? col(C.pencil, 1) : col(C.ink, 0.55);
          ctx.lineWidth = (h === 0 ? 2 : 1.1) * k;
          ctx.stroke();
        }
        text('H1, lower left', GX(M.t0 + 3) / k + 2, GY(0.514) / k - 8, (11 * k) + 'px ' + sans, col(C.pencil, 1));
        text('H2 to H4', gx1, GY(0.455) / k + 16, (11 * k) + 'px ' + sans, col(C.graphite, 1), 'right');
        // cursor and clock
        ctx.strokeStyle = col(C.graphite, 0.5); ctx.lineWidth = 1 * k;
        ctx.beginPath(); ctx.moveTo(GX(t), gy0 * k); ctx.lineTo(GX(t), gy1 * k); ctx.stroke();
        text('t = ' + Math.round(t) + ' s', gx0, 300, (22 * k) + 'px ' + serif, col(C.ink, 1));
        // legend
        ctx.fillStyle = col(C.link, 0.75); ctx.fillRect(gx0 * k, 326 * k, 12 * k, 12 * k);
        text('colder than the target field', gx0 + 18, 336, (11 * k) + 'px ' + sans, col(C.graphite, 1));
        ctx.fillStyle = col(C.pencil, 0.75); ctx.fillRect(gx0 * k, 346 * k, 12 * k, 12 * k);
        text('warmer than the target field', gx0 + 18, 356, (11 * k) + 'px ' + sans, col(C.graphite, 1));
        ctx.strokeStyle = col(C.ink, 0.6); ctx.lineWidth = 0.9 * k;
        ctx.beginPath(); ctx.moveTo(gx0 * k, 372 * k); ctx.lineTo((gx0 + 12) * k, 372 * k); ctx.stroke();
        text('isotherms every 25 K', gx0 + 18, 376, (11 * k) + 'px ' + sans, col(C.graphite, 1));
      }
      var last = M.frames - 1;
      if (reduce) { draw(6); return; }
      var t0 = null, dur = 12000;
      function step(ts) {
        if (stopped) return;
        if (t0 === null) t0 = ts;
        var u = clamp((ts - t0 - 400) / dur, 0, 1);
        draw(u * last);
        if (u < 1) raf = requestAnimationFrame(step);
      }
      draw(0);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!stopped && t0 === null) draw(0); });
      raf = requestAnimationFrame(step);
      window.addEventListener('resize', function () { k = size(); }, { passive: true });
    });
    return function () { stopped = true; cancelAnimationFrame(raf); };
  }

  var animators = { passages: passages, calciner: calciner, ice: ice, fridge: fridge };

  function show(key) {
    if (stopCurrent) { stopCurrent(); stopCurrent = null; }
    figs.forEach(function (f) { f.hidden = f.getAttribute('data-hero') !== key; });
    picks.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-hero') === key ? 'true' : 'false'); });
    var fig = figs.filter(function (f) { return f.getAttribute('data-hero') === key; })[0];
    stopCurrent = animators[key] ? animators[key](fig) : null;
  }
  picks.forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-hero')); });
  });
  if (replay) replay.addEventListener('click', function () {
    var on = picks.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
    if (on) show(on.getAttribute('data-hero'));
  });
  var controls = document.querySelector('.hero-controls');
  if (controls) controls.hidden = false;
  var keys = figs.map(function (f) { return f.getAttribute('data-hero'); });
  show(keys[Math.floor(Math.random() * keys.length)]);
})();
