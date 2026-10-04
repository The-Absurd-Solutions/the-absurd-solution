/* The sky over the climb (version 14): one real constellation per station, each a metaphor.
   A constellation first shows exactly as it is seen from Earth, the figure everyone knows. Then, as
   the film moves through its station, the camera turns about 12° and the stars separate in depth: the
   figure was a matter of where we stand. The page's dichotomy, in the sky.
   Stars from the HYG Database v4.0, figure lines from d3-celestial (data/constellations.json, see
   data/SOURCES.txt). Depth is each star's real distance on a log scale (the distance modulus), so the
   nearest and the farthest stars of a figure both stay in view while it turns.
   three.js draws the live film on one WebGL canvas over the film box. A still frame (reduced motion),
   or a page where three.js does not arrive, gets the flat figure on a 2D canvas. The words are HTML,
   laid out here each frame, never over the woman or the boulder. film.js owns the only animation
   loop and calls ClimbSky.frame() from it. */
const ClimbSky = (() => {
  'use strict';

  const DEG = Math.PI / 180, TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  // visible between t0 and t1, fading in and out over `f` seconds of film
  const win = (t, t0, t1, f = .35) => smooth(t0 - f, t0, t) * (1 - smooth(t1, t1 + f, t));
  // appearances run on the clock (ms), whatever the film is doing
  const STAR_IN = 650, STAR_GAP = 45, LINE_IN = 800, LINE_GAP = 60, TETHER_AT = 900, NOTE_OUT = 380, STAGGER = 70, GRACE = 260, LEAD_IN = 500;
  // one figure at a time: a station's sky starts LEAD seconds of film before its moment and fades in and
  // out over FADE seconds inside its own span, so two figures never show together
  let LEAD = .45;   // FILM.sky.lead overrides it (version 15)
  const FADE = .15;
  const LY = 3.26156;   // light-years in a parsec
  const SWAY = { per: 260, max: 56, k: .04 };   // scroll sway: px of scroll per radian, px at most, share of width

  // Star names: Bayer letters as Greek, constellations in the genitive (for the tooltips)
  const GREEK = { Alp: 'α', Bet: 'β', Gam: 'γ', Del: 'δ', Eps: 'ε', Zet: 'ζ', Eta: 'η', The: 'θ', Iot: 'ι', Kap: 'κ', Lam: 'λ', Mu: 'μ', Nu: 'ν', Xi: 'ξ', Omi: 'ο', Pi: 'π', Rho: 'ρ', Sig: 'σ', Tau: 'τ', Ups: 'υ', Phi: 'φ', Chi: 'χ', Psi: 'ψ', Ome: 'ω' };
  const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const GENITIVE = { Boo: 'Boötis', CrB: 'Coronae Borealis', Cyg: 'Cygni', Tau: 'Tauri', Lib: 'Librae', Cas: 'Cassiopeiae', Gem: 'Geminorum', Ori: 'Orionis' };
  function designation(bayer) {   // 'Kap-1 Boo' → 'κ¹ Boötis', '27 Tau' → '27 Tauri'
    const m = /^([A-Za-z]+|\d+)(?:-(\d))?\s+(\w+)$/.exec(bayer || '');
    if (!m) return bayer || '';
    return `${GREEK[m[1]] || m[1]}${m[2] ? SUP[+m[2]] : ''} ${GENITIVE[m[3]] || m[3]}`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const lyText = pc => `${Math.round(pc * LY).toLocaleString('en')}`;

  // Colours: the figures are neutral white whatever the palette; the darkening behind them is the
  // palette's ink. Re-read on every palette change.
  const C = { ink: [11, 11, 11], label: 'sans-serif' };
  function toRGB(v, fallback) {
    v = (v || '').trim();
    let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) { let x = m[1]; if (x.length === 3) x = x.replace(/./g, c => c + c); return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)); }
    m = v.match(/^rgba?\(([^)]+)\)$/i);
    if (m) return m[1].split(/[ ,/]+/).slice(0, 3).map(x => Math.round(parseFloat(x)));
    return fallback;
  }
  function readColours() {
    const cs = getComputedStyle(document.documentElement);
    C.ink = toRGB(cs.getPropertyValue('--ink'), [11, 11, 11]);
    C.label = cs.getPropertyValue('--mono').trim() || 'sans-serif';
    if (G) G.ink(C.ink);
    dirty = true;
  }

  let api = null, F = null, SKY = null, debug = false, stillPage = false;
  let data = null, cons = [], notes = [];
  let cv2 = null, ctx2 = null, cvGL = null, notesEl = null, legendEl = null, tickEl = null;
  let W = 1, H = 1, DPR = 1;
  let THREE = null, G = null, mode = 'wait';   // 'wait' → 'gl' (three.js) or '2d' (flat figures)
  let view = null, still = false, lastNow = 0, tipShown = false, dirty = true, lastSig = '';
  let flashT0 = -1e9, lastShown = null;
  const par = { yaw: 0, pitch: 0 };   // pointer parallax, radians
  const pendingStills = [];
  const mobilePortrait = () => !!(api && api.narrow() && !F.narrowSkyOnly && F.portraitSrc);

  // The portrait film has its own open sky. Never map the landscape's tracks into this frame.
  let mobileObstacles = [], mobileSlot = null, mobileSearchAt = -Infinity, mobileRetry = 0;
  function mobileBounds() {
    const supplied = api.mobileSkyArea && api.mobileSkyArea();
    const r = supplied || { x: 16, y: 68, w: W - 32, h: H - 84 };
    const x = Math.max(8, r.x), y = Math.max(8, r.y);
    return { x, y, w: Math.max(0, Math.min(r.w, W - x - 8)), h: Math.max(0, Math.min(r.h, H - y - 8)) };
  }
  // Read real line boxes only during layout, not from the film's animation loop.
  function measureMobileObstacles() {
    mobileObstacles = [];
    mobileSlot = null;
    clearMobileSelection();
    clearTimeout(mobileRetry); mobileRetry = 0;
    if (!mobilePortrait()) return;
    const fb = api.frame(), scroll = window.scrollY, range = document.createRange();
    const add = r => {
      if (r.width > 0 && r.height > 0) mobileObstacles.push({ x: r.left - fb.left, y: r.top + scroll - fb.top, w: r.width, h: r.height });
    };
    for (const host of document.querySelectorAll('main, footer')) {
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.nodeValue.trim() || !node.parentElement || node.parentElement.closest('.sr, [hidden], [aria-hidden="true"], #work, script, style')) continue;
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) add(r);
      }
      for (const el of host.querySelectorAll('img, video, canvas, svg, a, button, input, select, textarea, summary, .evidence-plate')) {
        if (!el.closest('[aria-hidden="true"], .sr')) add(el.getBoundingClientRect());
      }
    }
    mobileSearchAt = -Infinity;
  }
  function mobileArea() {
    const bounds = mobileBounds(), now = performance.now(), scroll = window.scrollY;
    const visible = mobileObstacles.filter(r => r.y + r.h > scroll + bounds.y - 10 && r.y < scroll + bounds.y + bounds.h + 10);
    const clear = a => a.x >= bounds.x && a.y >= bounds.y && a.x + a.w <= bounds.x + bounds.w && a.y + a.h <= bounds.y + bounds.h &&
      !visible.some(r => a.x < r.x + r.w + 10 && a.x + a.w + 10 > r.x && a.y + scroll < r.y + r.h + 10 && a.y + scroll + a.h + 10 > r.y);
    // Keep a clear position. If text reaches it, remove hit targets immediately before searching again.
    if (mobileSlot && clear(mobileSlot)) return mobileSlot;
    if (mobileSlot) { mobileSlot = null; mobileSearchAt = now; clearMobileSelection(); }
    let searched = false;
    if (now - mobileSearchAt >= 140) {
      searched = true;
      mobileSearchAt = now;
      for (const [w, h] of [[160, 180], [136, 156], [120, 148]]) {
        if (w > bounds.w || h > bounds.h) continue;
        const positions = [];
        for (let y = bounds.y; y <= bounds.y + bounds.h - h; y += 24) positions.push(y);
        positions.push(bounds.y + bounds.h - h);
        positions.sort((a, b) => Math.abs(a - H * .53) - Math.abs(b - H * .53));
        for (const y of positions) for (const x of [bounds.x + bounds.w - w, bounds.x]) {
          const candidate = { x, y, w, h, available: true };
          if (clear(candidate)) { mobileSlot = candidate; dirty = true; return mobileSlot; }
        }
      }
    }
    // Reduced motion has no RAF loop: retry once after the search cooldown when scrolling stops.
    if (stillPage && !searched && !mobileRetry) mobileRetry = setTimeout(() => { mobileRetry = 0; if (api.kick) api.kick(); }, 160);
    return { x: bounds.x, y: bounds.y, w: 0, h: 0, available: false };
  }

  /* ---------------- Views: the live film, or a still frame for reduced motion ---------------- */
  const liveView = {
    px(fx, fy, t) { const [x, y] = api.toScreen(fx, fy, t), fb = api.frame(); return [x - fb.left, y - fb.top]; },
    area: () => mobilePortrait() ? mobileArea() : api.noteArea(),
    narrow: () => api.narrow(),
  };
  function stillView(w, h) {
    return { px: (fx, fy) => [fx * w, fy * h], area: () => ({ x: 8, y: 8, w: w - 16, h: h - 16 }), narrow: () => false };
  }

  /* ---------------- The constellations, as stars, lines and words ---------------- */
  function star(s, raw) {
    const L = SKY.distance, k = SKY.depth;
    // depth: the real distance on a log scale, relative to the figure's median star
    const d = s.dist ? clamp(k * Math.log(s.dist / raw.zMedian), -.62 * L, .9 * L) : 0;
    const f = (L + d) / L;   // pushed back along its own line of sight, so the view from Earth is unchanged
    return {
      name: s.name || '', bayer: s.bayer || '', mag: s.mag, dist: s.dist, role: s.role || '',
      u: s.sky[0], v: s.sky[1], d, P: [s.sky[0] * f, s.sky[1] * f, -d],
      r: clamp(2.65 - .4 * s.mag, .95, 3.3),   // core radius in CSS px, by magnitude
      x: 0, y: 0, a: 0, k: 0, order: 0,
    };
  }
  function buildGeometry() {
    cons = [];
    for (const key of api.stationKeys()) {
      const cfg = SKY.stations[key];
      const raw = cfg && data.find(c => c.id === cfg.id);
      if (!raw) continue;
      const keep = cfg.keep ? new Set(cfg.keep) : null;
      const idx = [], stars = [];
      raw.stars.forEach((s, j) => {
        if (keep && !keep.has(s.name) && !keep.has(s.bayer)) return;
        idx[j] = stars.length;
        stars.push(star(s, raw));
      });
      const lines = raw.lines.filter(([a, b]) => idx[a] !== undefined && idx[b] !== undefined).map(([a, b]) => [idx[a], idx[b]]);
      const segs = (raw.segments || []).filter(g => idx[g.from] !== undefined && idx[g.to] !== undefined).map(g => ({ a: idx[g.from], b: idx[g.to], label: g.label }));
      // the brightest arrive first
      stars.slice().sort((p, q) => p.mag - q.mag).forEach((s, j) => { s.order = j; });
      // lines in the order of the figure, each drawn from the star that is already there
      const byName = new Map(stars.map(s => [s.name || s.bayer, s]));
      let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
      for (const s of stars) { u0 = Math.min(u0, s.u); u1 = Math.max(u1, s.u); v0 = Math.min(v0, s.v); v1 = Math.max(v1, s.v); }
      const dists = stars.map(s => s.dist).filter(Boolean);
      cons.push({
        key, cfg, raw, stars, lines, segs, byName,
        box: { u0, u1, v0, v1 },
        span: dists.length ? [Math.min(...dists), Math.max(...dists)] : null,
        tethers: (cfg.tethers || []).map(([sn, track]) => ({ s: byName.get(sn), track })).filter(x => x.s),
        bornAt: -1, a: 0, k: 0, pl: null, g: null,
      });
    }
  }
  // the film-time windows, per station; called again when the film's duration is known
  function buildTimes() {
    if (typeof SKY.lead === 'number') LEAD = SKY.lead;
    const keys = api.stationKeys(), T = key => api.T(key), tE = api.end();
    const B = keys.map((k, i) => (i ? T(k) - LEAD : -1));
    B.push(tE + 1);
    for (const c of cons) {
      const i = keys.indexOf(c.key);
      const t0 = B[i] + FADE, t1 = B[i + 1] - FADE, tm = T(c.key);
      // seen from Earth until just after the station's moment; then it turns, until just before it leaves
      const s0 = i === 0 ? .25 : tm + .2;
      const s1 = i + 1 < keys.length ? Math.max(s0 + .3, T(keys[i + 1]) - LEAD - FADE - .2) : Math.max(s0 + .15, tE - .03);
      c.alpha = t => win(t, t0, t1, FADE);
      c.turn = t => ease(clamp((t - s0) / (s1 - s0)));
      c.t0 = t0 - FADE; c.t1 = t1 + FADE;
    }
  }

  /* ---------------- Where a figure sits ---------------- */
  // its box on the canvas: in the film's sky on wide screens, beside the woman on phones
  function boxFor(c, t) {
    const narrow = view.narrow();
    if (narrow && mobilePortrait()) {
      const A = mobileArea();
      return { x: A.x + 22, y: A.y + 22, w: Math.max(20, A.w - 44), h: Math.max(20, A.h - 72), align: '' };
    }
    // a film in the right half only (FILM.halfCrop) may have its own placements; version 15 covers the page and uses wide
    const P = (narrow && !still ? c.cfg.narrow : (api.half && c.cfg.half) || c.cfg.wide) || {};
    const A = view.area();
    if (narrow && !still) {
      const [x0, y0, x1, y1] = P.at || [0, 0, 1, 1];
      return { x: A.x + x0 * A.w, y: A.y + y0 * A.h, w: (x1 - x0) * A.w, h: (y1 - y0) * A.h, align: P.align || '' };
    }
    let x0, y0, x1, y1;
    if (P.track && P.box) {
      const q = api.at(P.track, t) || [.5, .5];
      [x0, y0, x1, y1] = [q[0] + P.box[0], q[1] + P.box[1], q[0] + P.box[2], q[1] + P.box[3]];
    } else {
      [x0, y0, x1, y1] = P.at || [.4, .05, .9, .4];
      if (P.drift) {
        const w = api.at(F.world, t), w0 = api.at(F.world, api.T(c.key));
        const dx = (w[0] - w0[0]) * P.drift, dy = (w[1] - w0[1]) * P.drift;
        x0 += dx; x1 += dx; y0 += dy; y1 += dy;
      }
    }
    const [px0, ay] = view.px(x0, y0, t), [px1, by] = view.px(x1, y1, t);
    const ax = Math.min(px0, px1), bx = Math.max(px0, px1);   // a mirrored mapping swaps the two sides
    // never past the film's edges, the bar or the rail
    const L = Math.max(ax, A.x + 6), R = Math.min(bx, A.x + A.w - 4), T = Math.max(ay, A.y + 4), B = Math.min(by, A.y + A.h - 4);
    return { x: L, y: T, w: Math.max(24, R - L), h: Math.max(24, B - T), align: P.align || '' };
  }
  // the figure's scale (px per sky unit) and where the sky's origin lands
  function placeFigure(c, t) {
    const R = boxFor(c, t), { u0, u1, v0, v1 } = c.box;
    const bw = Math.max(.2, u1 - u0), bh = Math.max(.2, v1 - v0);
    let s = Math.min(R.w / bw, R.h / bh) * .9;
    s = Math.min(s, (view.narrow() ? .34 : .3) * H);   // never huge on a big screen (version 17: larger, .3)
    let cx = R.x + R.w / 2, cy = R.y + R.h / 2;
    if (R.align.includes('right')) cx = R.x + R.w - bw * s / 2 - 4;
    if (R.align.includes('left')) cx = R.x + bw * s / 2 + 4;
    if (R.align.includes('top')) cy = R.y + bh * s / 2 + 4;
    if (R.align.includes('bottom')) cy = R.y + R.h - bh * s / 2 - 4;
    let px = cx - (u0 + u1) / 2 * s, py = cy + (v0 + v1) / 2 * s;
    // the figure sways left and right as the page scrolls, as if the sky turned
    if (!still && !mobilePortrait()) px += Math.sin(window.scrollY / SWAY.per) * Math.min(SWAY.max, W * SWAY.k);
    // the figure keeps clear of the woman and the boulder: if its extent would touch them, it steps aside
    if (!still && !mobilePortrait()) {
      const ex = exclusion(t), fx0 = px + u0 * s - 14, fx1 = px + u1 * s + 14, fy0 = py - v1 * s - 14, fy1 = py - v0 * s + 14;
      if (fx0 < ex.x + ex.w && fx1 > ex.x && fy0 < ex.y + ex.h && fy1 > ex.y) {
        const up = fy1 - ex.y, right = ex.x + ex.w - fx0, left = fx1 - ex.x;
        if (up <= Math.min(left, right)) py -= up; else if (right < left) px += right; else px -= left;
      }
    }
    return { R, s, px, py };
  }

  /* ---------------- Projection: three.js's camera, or the flat view from Earth ---------------- */
  function project(c, t) {
    const pl = c.pl;
    if (mode === 'gl' && !still) {
      aim(c, pl, t);
      const v = G.v3, cam = G.cam;
      for (const s of c.stars) {
        v.set(s.P[0], s.P[1], s.P[2]).project(cam);
        s.x = (v.x + 1) / 2 * W; s.y = (1 - v.y) / 2 * H;
      }
    } else {
      for (const s of c.stars) { s.x = pl.px + s.u * pl.s; s.y = pl.py - s.v * pl.s; }
    }
  }
  function aim(c, pl, t) {
    const L = SKY.distance, k = c.k;
    const yaw = (c.cfg.yaw || 12) * k * DEG + par.yaw, pitch = (c.cfg.pitch || 0) * k * DEG + par.pitch;
    const cam = G.cam;
    cam.position.set(L * Math.sin(yaw) * Math.cos(pitch), L * Math.sin(pitch), L * Math.cos(yaw) * Math.cos(pitch));
    cam.lookAt(0, 0, 0);
    // one sky unit at the figure's own distance is pl.s pixels; the sky's origin lands at (px, py)
    cam.fov = 2 * Math.atan(H / (2 * L * pl.s)) / DEG;
    cam.aspect = W / H;
    cam.setViewOffset(W, H, W / 2 - pl.px, H / 2 - pl.py, W, H);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  }

  // the woman and the boulder, on the canvas: nothing is drawn or written over them
  function exclusion(t) {
    const c = api.at('climber', t), s = api.at('sphere', t), b = F.climberBox;
    const r = F.sphereR, ry = r * 16 / 9;
    const x0 = Math.min(c[0] - b[0], s[0] - r), x1 = Math.max(c[0] + b[0], s[0] + r);
    const y0 = Math.min(c[1] - b[1], s[1] - ry), y1 = Math.max(c[1] + b[1], s[1] + ry);
    const [qx0, py0] = view.px(x0, y0, t), [qx1, py1] = view.px(x1, y1, t);
    const px0 = Math.min(qx0, qx1), px1 = Math.max(qx0, qx1);
    return { x: px0 - 6, y: py0 - 6, w: px1 - px0 + 12, h: py1 - py0 + 12 };
  }
  function people(t) {
    const out = [];
    for (const [name, hw, hh] of F.keepClear || []) {
      if (api.vis(name, t) < .5) continue;
      const p = api.at(name, t);
      if (!p) continue;
      const [ax, y0] = view.px(p[0] - hw, p[1] - hh, t), [bx, y1] = view.px(p[0] + hw, p[1] + hh, t);
      const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx);
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
    }
    return out;
  }
  // where a tether ends: just over the head of the one it reaches
  function headOf(track, t) {
    const p = api.at(track, t);
    if (!p) return null;
    const kc = (F.keepClear || []).find(k => k[0] === track);
    const up = track === 'climber' ? F.climberBox[1] * .95 : kc ? kc[2] * 1.1 : .03;
    const [x, y] = view.px(p[0], p[1] - up, t);
    return [x, y - 4];
  }

  /* ---------------- Per frame: what shows, and how far each figure has turned ---------------- */
  function update(t, now, dt) {
    if (!still) parallax(dt);
    const portrait = view.narrow() && mobilePortrait();
    if (portrait && !mobileArea().available) { cons.forEach(c => { c.a = 0; }); return null; }
    // The mobile sky belongs to the section being read. A paused video frame can sit exactly
    // in the desktop fade gap, and several sections share a single reduced-motion poster.
    let mobileKey = portrait && api.activeStation && api.activeStation();
    if (portrait && !mobileKey) {
      const keys = api.stationKeys();
      mobileKey = keys[0];
      for (const key of keys) if (t >= api.T(key)) mobileKey = key;
    }
    let shown = null;
    for (const c of cons) {
      const a = portrait ? Number(c.key === mobileKey) : c.alpha(t);
      c.a = a;
      if (a < .005) { c.bornAt = -1; continue; }
      if (c.bornAt < 0) c.bornAt = still ? -1e9 : now;
      c.k = still ? 0 : c.turn(t);
      c.pl = placeFigure(c, t);
      project(c, t);
      const age = now - c.bornAt;
      for (const s of c.stars) {
        s.k = still ? 1 : easeOut(clamp((age - s.order * STAR_GAP) / STAR_IN));
        s.a = a * s.k;
      }
      c.lineG = c.lines.map((l, j) => (still ? 1 : easeOut(clamp((age - 220 - j * LINE_GAP) / LINE_IN))));
      c.tetherG = still ? 0 : easeOut(clamp((age - TETHER_AT - c.lines.length * 30) / 900));
      if (!shown || a > shown.a) shown = c;
    }
    return shown;
  }
  function parallax(dt) {
    const p = api.pointer, fb = api.frame();
    let ty = 0, tp = 0;
    if (p.on && !p.down && !p.touch) {
      const nx = clamp((p.x - fb.left) / Math.max(1, fb.width) * 2 - 1, -1, 1), ny = clamp((p.y - fb.top) / Math.max(1, fb.height) * 2 - 1, -1, 1);
      ty = nx * 2.4 * DEG; tp = -ny * 1.5 * DEG;
    }
    const k = 1 - Math.exp(-dt * 2.6);
    par.yaw += (ty - par.yaw) * k; par.pitch += (tp - par.pitch) * k;
  }

  /* ---------------- The words: names, meanings, the constellation's title ---------------- */
  function buildNotes() {
    if (!notesEl) return;
    notesEl.querySelectorAll('.note').forEach(el => el.remove());
    notes = [];
    const add = (c, kind, html, pri, extra) => {
      const el = document.createElement('span');
      el.className = `note note-${kind}`;
      const inner = document.createElement('span');
      inner.className = 'note-in';
      inner.innerHTML = html;
      el.appendChild(inner);
      notesEl.appendChild(el);
      notes.push(Object.assign({ c, kind, el, pri, w: 0, h: 0, on: false, pl: null, plAt: 0, cx: 0, cy: 0, cf: .5, tg: null, onAt: -1e9, offAt: -1e9, delay: 0, failAt: -1, lastLead: null }, extra));
    };
    // version 15: only the meanings the page's words are tied to (data-node, the tethers' stars) or that tie the figure
    // to someone in the film; the rest of the figure goes unnamed
    const tied = new Set([...document.querySelectorAll('[data-node]')].map(el => el.dataset.node));
    for (const n of Object.values((F.tethers && F.tethers.nodes) || {})) { if (n.star) tied.add(n.star); (n.stars || []).forEach(x => tied.add(x)); }
    for (const c of cons) {
      let pri = 1;
      const own = new Set((c.cfg.tethers || []).map(([sn]) => sn));
      // the meanings first: on a star, its role (version 15: without the star's name)
      for (const s of c.stars) {
        if (!s.role || !(tied.has(s.name) || own.has(s.name))) continue;
        add(c, 'star', `<em class="n-role">${esc(s.role)}</em><span class="n-name">${esc(s.name || designation(s.bayer))}</span>`, pri++, { s, at: ['e', 'w', 'se', 'sw', 'ne', 'nw', 's', 'n'] });
      }
      for (const g of c.segs) if (tied.has(g.label)) add(c, 'seg', `<em class="n-role">${esc(g.label)}</em>`, pri++, { g });
      // the title: the constellation's Latin name, its English one, and where we stand
      const span = c.span ? `${lyText(c.span[0])}–${lyText(c.span[1])} light-years` : '';
      add(c, 'title', `<span class="n-latin">${esc(c.raw.latin)}</span><em class="n-eng">${esc(c.raw.english)}</em><span class="n-state"><span class="n-earth">as seen from Earth</span><span class="n-depth">in depth · ${esc(span)}</span></span>`, pri++, {});
      for (const nm of c.cfg.names || []) {
        const s = c.byName.get(nm);
        // plain names only where there is room for them (not on a phone's band)
        if (s && !s.role) add(c, 'star', `<span class="n-name">${esc(s.name)}</span>`, pri++, { s, at: ['e', 'w', 'ne', 'se', 'nw', 'sw', 'n', 's'], plain: true, wide: true });
      }
    }
    measureNotes();
  }
  let legendRect = null;   // read once per layout, never in the loop
  function measureNotes() {
    for (const n of notes) { n.w = n.el.offsetWidth; n.h = n.el.offsetHeight; n.pl = null; n.state = null; }
    legendRect = legendEl && legendEl.offsetParent ? { x: legendEl.offsetLeft, y: legendEl.offsetTop, w: legendEl.offsetWidth, h: legendEl.offsetHeight } : null;
  }
  // Entrances that start together are staggered by 70 ms, in order of priority.
  let batchAt = -1e9, batchN = 0;
  function setOn(n, on, now = performance.now()) {
    if (n.on === on) return;
    n.on = on;
    if (on) {
      if (now - batchAt > 240) batchN = 0;
      batchAt = now;
      n.delay = Math.min(5, batchN++) * STAGGER;
      n.onAt = now;
      n.el.style.setProperty('--d', `${n.delay}ms`);
    } else { n.offAt = now; n.failAt = -1; }
    n.el.classList.toggle('on', on);
  }
  const overlap = (a, b, pad = 0) => a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
  const inside = (r, s) => r.x >= s.x && r.y >= s.y && r.x + r.w <= s.x + s.w && r.y + r.h <= s.y + s.h;
  const glowR = s => s.r * 1.7 + 3;

  // where a word's target is on the canvas
  function targetOf(n) {
    const c = n.c;
    if (c.a < .5) return null;
    if (n.kind === 'star') return n.s.a > .55 ? { x: n.s.x, y: n.s.y, r: glowR(n.s) } : null;
    if (n.kind === 'seg') {
      const A = c.stars[n.g.a], B = c.stars[n.g.b], j = c.lines.findIndex(([p, q]) => (p === n.g.a && q === n.g.b) || (p === n.g.b && q === n.g.a));
      if (A.a < .5 || B.a < .5 || (j >= 0 && c.lineG[j] < .55)) return null;   // words wait until their line is mostly drawn
      return { edge: true, a: [A.x, A.y], b: [B.x, B.y] };
    }
    // the title: beside the figure's extent
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of c.stars) { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y); }
    return { box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } };
  }

  // Placement. A label keeps its place while it fits (it moves with its star, rigidly); every half
  // second it may take a better one, and then it slides there instead of jumping.
  const DIRS = { n: [0, -1], ne: [.75, -.75], e: [1, 0], se: [.75, .75], s: [0, 1], sw: [-.75, .75], w: [-1, 0], nw: [-.75, -.75] };
  const fits = (r, ex, placed, S) => inside(r, S) && !ex.some(e => overlap(r, e, 4)) && !placed.some(q => overlap(r, q, 3));
  function nameAt(n, d, gap) {
    const [dx, dy] = DIRS[d] || DIRS.e;
    const ax = dx * gap, ay = dy * gap;
    // beside a star the label's first line is centred on it, the way charts set names
    const oy = dy > .1 ? ay : dy < -.1 ? ay - n.h : ay - (n.plain ? n.h / 2 : n.h * .32);
    return { kind: 'name', d, gap, dx, dy, ox: dx > .1 ? ax : dx < -.1 ? ax - n.w : ax - n.w / 2, oy };
  }
  const nameRect = (n, tg, ox, oy) => ({ x: tg.x + ox, y: tg.y + oy, w: n.w, h: n.h });
  function searchName(n, tg, ex, placed, S) {
    const base = tg.r + 5;
    const dirs = n.at || ['e', 'w', 'n', 's'];
    // the nearest place that is clear of the woman, the boulder, the stars and the other labels, in any of
    // the label's directions (in their order), before a farther one with a leader line
    const far = base + (view.narrow() ? 96 : 64);
    for (let gap = base, step = 0; gap <= far; gap += 8, step++) {
      for (let i = 0; i < dirs.length; i++) {
        const pl = nameAt(n, dirs[i], gap);
        const r = nameRect(n, tg, pl.ox, pl.oy);
        if (!inside(r, S)) continue;
        if (ex.some(e => overlap(r, e, 3)) || placed.some(q => overlap(r, q, 3))) continue;
        pl.rank = step * 10 + i; pl.base = base;
        return pl;
      }
    }
    return null;
  }
  function placeName(n, tg, ex, placed, S, now) {
    const was = n.pl && n.pl.kind === 'name' ? n.pl : null;
    const keep = !!was && fits(nameRect(n, tg, was.ox, was.oy), ex, placed, S);
    if (keep && now - n.plAt < 500) return was;
    const best = searchName(n, tg, ex, placed, S);
    n.plAt = now;
    if (keep && (!best || best.rank >= was.rank)) return was;
    return best;
  }
  // the title: below the figure's extent, else beside it, else above
  const BOX_SIDES = ['below', 'left', 'right', 'above'];
  function boxAt(n, b, side) {
    if (side === 'below') return { kind: 'box', side, ox: 0, oy: b.h + 14 };
    if (side === 'above') return { kind: 'box', side, ox: 0, oy: -n.h - 14 };
    if (side === 'left') return { kind: 'box', side, ox: -n.w - 18, oy: b.h - n.h };
    return { kind: 'box', side, ox: b.w + 18, oy: b.h - n.h };
  }
  const boxRect = (n, b, ox, oy) => ({ x: b.x + ox, y: b.y + oy, w: n.w, h: n.h });
  function placeBox(n, tg, ex, placed, S, now) {
    const b = tg.box, was = n.pl && n.pl.kind === 'box' ? n.pl : null;
    if (was && now - n.plAt < 500 && fits(boxRect(n, b, was.ox, was.oy), ex, placed, S)) return was;
    n.plAt = now;
    for (let i = 0; i < BOX_SIDES.length; i++) {
      const pl = boxAt(n, b, BOX_SIDES[i]);
      // slide along that side until it fits
      for (let k = 0; k <= 6; k++) {
        const shift = k * 12 * (BOX_SIDES[i] === 'below' || BOX_SIDES[i] === 'above' ? 1 : 0);
        const r = boxRect(n, b, pl.ox + shift, pl.oy);
        if (fits(r, ex, placed, S)) { pl.ox += shift; pl.rank = i; return pl; }
      }
    }
    return was && fits(boxRect(n, b, was.ox, was.oy), ex, placed, S) ? was : null;
  }
  // a segment's word: flat, beside the segment's middle, its nearest edge 10 px from the line
  function flatGeom(n, tg, f, side) {
    const [ax, ay] = tg.a, [bx, by] = tg.b;
    const px = lerp(ax, bx, f), py = lerp(ay, by, f);
    let tx = bx - ax, ty = by - ay;
    if (tx < 0) { tx = -tx; ty = -ty; }
    const ang = Math.atan2(ty, tx), nx = Math.sin(ang) * side, ny = -Math.cos(ang) * side;
    const reach = 10 + (n.w / 2) * Math.abs(nx) + (n.h / 2) * Math.abs(ny);
    const cx = px + nx * reach, cy = py + ny * reach;
    return { rect: { x: cx - n.w / 2, y: cy - n.h / 2, w: n.w, h: n.h } };
  }
  const EDGE_F = [.5, .4, .6, .3, .7];
  function placeEdge(n, tg, ex, placed, S) {
    if (Math.hypot(tg.b[0] - tg.a[0], tg.b[1] - tg.a[1]) < 24) return null;
    const was = n.pl && n.pl.kind === 'flat' ? n.pl : null;
    if (was && fits(flatGeom(n, tg, was.f, was.side).rect, ex, placed, S)) return was;
    for (let i = 0; i < EDGE_F.length; i++) for (const side of [1, -1]) {
      if (fits(flatGeom(n, tg, EDGE_F[i], side).rect, ex, placed, S)) return { kind: 'flat', f: EDGE_F[i], side, rank: i };
    }
    return null;
  }
  // where a placed label is drawn this frame (its smoothed place), with its leader line
  function noteGeom(n, tg) {
    const pl = n.pl;
    if (pl.kind === 'flat') {
      const r = flatGeom(n, tg, n.cf, pl.side).rect;
      return { rect: r, lead: null, transform: `translate3d(${r.x.toFixed(2)}px,${r.y.toFixed(2)}px,0)` };
    }
    if (pl.kind === 'box') {
      const r = boxRect(n, tg.box, n.cx, n.cy);
      return { rect: r, lead: null, transform: `translate3d(${r.x.toFixed(2)}px,${r.y.toFixed(2)}px,0)` };
    }
    const r = nameRect(n, tg, n.cx, n.cy);
    let lead = null;
    if (pl.gap > pl.base + 9) {
      // from the star to the side of the label that faces it
      const ax = pl.dx > .1 ? r.x : pl.dx < -.1 ? r.x + r.w : r.x + r.w / 2;
      const ay = pl.dy > .1 ? r.y : pl.dy < -.1 ? r.y + r.h : r.y + r.h * .32;
      const vx = ax - tg.x, vy = ay - tg.y, len = Math.hypot(vx, vy);
      if (len > tg.r + 6) { const ux = vx / len, uy = vy / len; lead = { x1: tg.x + ux * (tg.r + 1), y1: tg.y + uy * (tg.r + 1), x2: ax - ux * 3, y2: ay - uy * 3 }; }
    }
    return { rect: r, lead, transform: `translate3d(${r.x.toFixed(2)}px,${r.y.toFixed(2)}px,0)` };
  }

  function layoutNotes(shown, t, now, dt) {
    const leads = [];
    if (!notesEl) return leads;
    if (mobilePortrait()) { notes.forEach(n => setOn(n, false, now)); return leads; }
    const narrow = view.narrow();
    const max = shown && narrow && shown.cfg.maxNarrow ? shown.cfg.maxNarrow : narrow ? F.maxNotes.narrow : F.maxNotes.wide;
    const S = view.area();
    const ex = [exclusion(t), ...people(t)];
    const hint = api.hint && api.hint();
    if (hint) ex.push(hint);
    const placed = legendRect ? [legendRect] : [];
    for (const r of api.captions()) placed.push({ x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 12 });
    // the stars themselves stay clear of words
    const starRects = shown ? shown.stars.filter(s => s.a > .3).map(s => ({ s, r: { x: s.x - glowR(s) * .7, y: s.y - glowR(s) * .7, w: glowR(s) * 1.4, h: glowR(s) * 1.4 } })) : [];
    const k = 1 - Math.exp(-dt * 14);   // how fast a label slides to a new place
    const cands = [];
    for (const n of notes) {
      n.tg = n.c === shown && !(narrow && n.wide) ? targetOf(n) : null;
      if (n.tg) cands.push(n);
      else setOn(n, false, now);
    }
    cands.sort((a, b) => a.pri - b.pri);
    let count = 0;
    for (const n of cands) {
      const tg = n.tg;
      const exn = ex.concat(starRects.filter(q => q.s !== n.s).map(q => q.r));
      let pl = null;
      if (count < max) pl = tg.edge ? placeEdge(n, tg, exn, placed, S) : tg.box ? placeBox(n, tg, exn, placed, S, now) : placeName(n, tg, exn, placed, S, now);
      if (pl) n.failAt = -1;
      else if (n.on && n.pl && count < max) {
        // no room this frame: hold the last place a moment rather than flicker
        if (n.failAt < 0) n.failAt = now;
        if (now - n.failAt < GRACE) pl = n.pl;
      }
      if (!pl) { setOn(n, false, now); continue; }
      const along = pl.kind === 'flat';
      if (!n.on || !n.pl || n.pl.kind !== pl.kind || (along && n.pl.side !== pl.side)) { if (along) n.cf = pl.f; else { n.cx = pl.ox; n.cy = pl.oy; } }   // a label appears in place
      n.pl = pl;
      if (along) n.cf += (pl.f - n.cf) * k;
      else { n.cx += (pl.ox - n.cx) * k; n.cy += (pl.oy - n.cy) * k; }
      let geo = noteGeom(n, tg);
      // a label sliding to a new place never crosses the woman or the boulder: it jumps the rest of the way
      if (n.failAt < 0 && overlap(geo.rect, ex[0], 2)) {
        if (along) n.cf = pl.f; else { n.cx = pl.ox; n.cy = pl.oy; }
        geo = noteGeom(n, tg);
      }
      if (n.failAt >= 0 && overlap(geo.rect, ex[0], 2)) { setOn(n, false, now); continue; }   // never over the woman, even while holding
      setOn(n, true, now);
      n.el.style.transform = geo.transform;
      placed.push(geo.rect);
      n.rect = geo.rect;
      n.lastLead = geo.lead;
      if (geo.lead) leads.push({ ...geo.lead, g: easeOut(clamp((now - n.onAt - n.delay) / LEAD_IN)), a: 1 });
      count++;
      // the title says where we stand: on Earth, then in depth
      if (n.kind === 'title') {
        const st = n.c.k < .35 ? 'earth' : 'depth';
        if (st !== n.state) { n.state = st; n.el.classList.toggle('deep', st === 'depth'); }
      }
    }
    // labels on their way out keep following their star while they fade, unless that would cover the woman
    for (const n of notes) {
      if (n.on || !n.pl) continue;
      const age = now - n.offAt;
      if (age > NOTE_OUT) continue;
      if (n.tg) {
        const geo = noteGeom(n, n.tg);
        if (!overlap(geo.rect, ex[0], 2)) { n.el.style.transform = geo.transform; n.lastLead = geo.lead; n.rect = geo.rect; }
      }
      if (n.lastLead) leads.push({ ...n.lastLead, g: 1, a: 1 - age / NOTE_OUT });
    }
    return leads;
  }

  /* ---------------- The darkening behind a figure ----------------
     A soft field around the stars, along the lines and under the words: enough dusk for white to read
     on the film's pale sky, and nothing anywhere else. */
  function fieldSources(c, out) {
    let n = 0;
    const push = (x, y, w) => { if (n < 64) { out[n * 3] = x; out[n * 3 + 1] = y; out[n * 3 + 2] = w; n++; } };
    for (const s of c.stars) if (s.a > .02) push(s.x, s.y, s.k * (.5 + .4 * clamp((4.5 - s.mag) / 4.5)));
    c.lines.forEach(([i, j], q) => {
      const A = c.stars[i], B = c.stars[j], g = c.lineG[q];
      if (g < .02) return;
      const len = Math.hypot(B.x - A.x, B.y - A.y), m = Math.max(1, Math.floor(len / 34));
      for (let k = 1; k < m; k++) { const f = k / m * g; push(lerp(A.x, B.x, f), lerp(A.y, B.y, f), .42); }
    });
    return n;
  }
  // the words' backings: [centre x, centre y, half width, half height, strength], at most eight
  function labelShapes(c, now) {
    const out = [];
    for (const nt of notes) {
      if (nt.c !== c || !nt.rect || out.length >= 8) continue;
      const k = nt.on ? easeOut(clamp((now - nt.onAt - nt.delay) / 650)) : 1 - clamp((now - nt.offAt) / NOTE_OUT);
      if (k <= .01) continue;
      const r = nt.rect;
      out.push([r.x + r.w / 2, r.y + r.h / 2, r.w / 2 - 2, Math.max(2, r.h / 2 - 4), k]);
    }
    return out;
  }
  const LABEL_DIM = 0;    // the most dusk under a word (times the figure's own fade); version 15: none
  // one soft ellipse under the whole figure, so the dusk reads as one patch of sky, not as blots
  function fieldEllipse(c, sigma) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of c.stars) { if (s.a < .02) continue; x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y); }
    if (x0 > x1) return null;
    const k = c.stars.reduce((m, s) => Math.max(m, s.k), 0);
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, rx: (x1 - x0) / 2 + sigma * 1.3, ry: (y1 - y0) / 2 + sigma * 1.3, w: .62 * k };
  }
  function fieldBounds(c, sigma, ell) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of c.stars) { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y); }
    for (const nt of notes) if (nt.c === c && nt.on && nt.rect) { x0 = Math.min(x0, nt.rect.x); y0 = Math.min(y0, nt.rect.y); x1 = Math.max(x1, nt.rect.x + nt.rect.w); y1 = Math.max(y1, nt.rect.y + nt.rect.h); }
    const m = sigma * 2.6;
    x0 -= m; y0 -= m; x1 += m; y1 += m;
    if (ell) { x0 = Math.min(x0, ell.cx - ell.rx * 2.2); x1 = Math.max(x1, ell.cx + ell.rx * 2.2); y0 = Math.min(y0, ell.cy - ell.ry * 2.2); y1 = Math.max(y1, ell.cy + ell.ry * 2.2); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  const dayOnly = () => document.documentElement.classList.contains('sky-only');   // phones: the sky behind the words, on paper
  const dimOf = c => (dayOnly() ? 0 : (c.cfg.dim ?? (view.narrow() && !still ? SKY.dim.narrow : SKY.dim.wide))) * c.a;   // no dusk on paper
  const sigmaOf = c => clamp(c.pl.s * .34, 24, 64);

  /* ---------------- three.js ---------------- */
  const STAR_VS = `
    attribute float aSize;
    attribute float aAlpha;
    uniform float uDpr;
    varying float vAlpha;
    varying float vCore;
    varying float vR;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      float R = aSize * 4.6 + 2.0;          // the sprite: the core and its glow, CSS px
      gl_PointSize = 2.0 * R * uDpr;
      vCore = aSize / R;
      vR = R * uDpr;
      vAlpha = aAlpha;
    }`;
  const STAR_FS = `
    uniform vec3 uColor;
    varying float vAlpha;
    varying float vCore;
    varying float vR;
    void main() {
      float d = length(gl_PointCoord * 2.0 - 1.0);   // 0 at the centre, 1 at the sprite's edge
      float aa = 1.0 / vR;
      float core = 1.0 - smoothstep(vCore - aa, vCore + aa, d);
      float c2 = vCore * vCore;
      float glow = exp(-d * d / (c2 * 4.0)) * .5 + exp(-d * d / (c2 * 22.0)) * .14;
      float a = (core + glow * (1.0 - core)) * (1.0 - smoothstep(.82, 1.0, d)) * vAlpha;
      if (a < .004) discard;
      gl_FragColor = vec4(uColor, a);
    }`;
  // a line of constant screen width between two points of the scene, shortened at both ends (stars keep
  // a little air around them), drawn on up to aProg of its length, solid or dashed
  const LINE_VS = `
    attribute vec3 aA;
    attribute vec3 aB;
    attribute float aAlpha;
    attribute vec2 aGap;
    attribute float aProg;
    attribute float aDash;
    uniform vec2 uRes;
    uniform float uWidth;
    varying float vAlpha;
    varying float vAcross;
    varying float vAlong;
    varying float vDash;
    void main() {
      vec4 ca = projectionMatrix * modelViewMatrix * vec4(aA, 1.0);
      vec4 cb = projectionMatrix * modelViewMatrix * vec4(aB, 1.0);
      vec2 sa = (ca.xy / ca.w * .5 + .5) * uRes;
      vec2 sb = (cb.xy / cb.w * .5 + .5) * uRes;
      vec2 dv = sb - sa;
      float len = length(dv);
      vec2 dir = len > 1e-4 ? dv / len : vec2(1.0, 0.0);
      float s0 = min(aGap.x, len * .5), s1 = max(len - aGap.y, s0);
      float e1 = mix(s0, s1, aProg);
      float along = mix(s0, e1, position.x);
      float hw = uWidth * .5 + 1.0;
      vec2 p = sa + dir * along + vec2(-dir.y, dir.x) * position.y * hw;
      vAcross = position.y * hw;
      vAlong = along - s0;
      vAlpha = aAlpha * step(.5, e1 - s0);
      vDash = aDash;
      gl_Position = vec4(p / uRes * 2.0 - 1.0, 0.0, 1.0);
    }`;
  const LINE_FS = `
    uniform vec3 uColor;
    uniform float uWidth;
    varying float vAlpha;
    varying float vAcross;
    varying float vAlong;
    varying float vDash;
    void main() {
      float a = clamp(uWidth * .5 + .5 - abs(vAcross), 0.0, 1.0);
      if (vDash > 0.0) { float ph = fract(vAlong / vDash); a *= smoothstep(0.0, .1, ph) * (1.0 - smoothstep(.46, .56, ph)); }
      a *= vAlpha;
      if (a < .004) discard;
      gl_FragColor = vec4(uColor, a);
    }`;
  const RING_FS = `
    uniform vec3 uColor;
    varying float vAlpha;
    varying float vCore;
    varying float vR;
    void main() {
      float d = length(gl_PointCoord * 2.0 - 1.0);
      float w = 1.1 / vR;
      float a = (1.0 - smoothstep(w * .5, w * 1.5, abs(d - .55))) * vAlpha;
      if (a < .004) discard;
      gl_FragColor = vec4(uColor, a);
    }`;
  const FIELD_VS = `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const FIELD_FS = `
    uniform vec3 uSrc[64];
    uniform int uN;
    uniform float uSigma;
    uniform float uMax;
    uniform vec4 uEll;      // the figure's extent: centre and radii, CSS px
    uniform float uEllW;
    uniform vec4 uLab[8];   // the words: centre and half size, CSS px
    uniform float uLabA[8];
    uniform int uNL;
    uniform float uMaxL;
    uniform vec3 uColor;
    uniform float uDpr;
    uniform float uH;
    void main() {
      vec2 p = gl_FragCoord.xy / uDpr;
      p.y = uH - p.y;
      vec2 e = (p - uEll.xy) / uEll.zw;
      float s = uEllW * exp(-dot(e, e)), k = 1.0 / (uSigma * uSigma);
      for (int i = 0; i < 64; i++) {
        if (i >= uN) break;
        vec2 d = p - uSrc[i].xy;
        s += uSrc[i].z * exp(-dot(d, d) * k);
      }
      float a = uMax * (1.0 - exp(-1.5 * s));
      // under every word a little more dusk, a soft rounded shape, so white reads on the palest sky
      float l = 0.0;
      for (int i = 0; i < 8; i++) {
        if (i >= uNL) break;
        vec2 q = max(abs(p - uLab[i].xy) - uLab[i].zw, 0.0);
        l = max(l, uLabA[i] * exp(-dot(q, q) / 110.0));
      }
      a = max(a, uMaxL * l);
      if (a < .003) discard;
      gl_FragColor = vec4(uColor, a);
    }`;

  function glSetup() {
    if (!cvGL || !THREE) return null;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cvGL, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    } catch (e) { return null; }
    if (!renderer.getContext()) return null;
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    const white = new THREE.Vector3(1, 1, 1), ink = new THREE.Vector3(.05, .05, .05);
    const res = new THREE.Vector2(1, 1), dpr = { value: 1 };
    const common = { transparent: true, depthTest: false, depthWrite: false };
    const starMat = new THREE.ShaderMaterial({ ...common, uniforms: { uColor: { value: white }, uDpr: dpr }, vertexShader: STAR_VS, fragmentShader: STAR_FS });
    const ringMat = new THREE.ShaderMaterial({ ...common, uniforms: { uColor: { value: white }, uDpr: dpr }, vertexShader: STAR_VS, fragmentShader: RING_FS });
    const figMat = new THREE.ShaderMaterial({ ...common, uniforms: { uColor: { value: white }, uRes: { value: res }, uWidth: { value: 1.8 } }, vertexShader: LINE_VS, fragmentShader: LINE_FS });
    const overMat = new THREE.ShaderMaterial({ ...common, uniforms: { uColor: { value: white }, uRes: { value: res }, uWidth: { value: .8 } }, vertexShader: LINE_VS, fragmentShader: LINE_FS });
    const src = new Float32Array(64 * 3);
    const fieldMat = new THREE.ShaderMaterial({
      ...common, side: THREE.DoubleSide,
      uniforms: {
        uSrc: { value: src }, uN: { value: 0 }, uSigma: { value: 40 }, uMax: { value: .4 }, uEll: { value: new THREE.Vector4(0, 0, 1, 1) }, uEllW: { value: .6 },
        uLab: { value: Array.from({ length: 8 }, () => new THREE.Vector4()) }, uLabA: { value: new Float32Array(8) }, uNL: { value: 0 }, uMaxL: { value: .6 },
        uColor: { value: ink }, uDpr: dpr, uH: { value: 1 },
      },
      vertexShader: FIELD_VS, fragmentShader: FIELD_FS,
    });
    // a batch of lines: one quad per line, its ends and looks per instance
    const lineBatch = (max, mat) => {
      const geo = new THREE.InstancedBufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0], 3));
      geo.setIndex([0, 1, 2, 2, 1, 3]);
      const at = {};
      for (const [k, n] of [['aA', 3], ['aB', 3], ['aAlpha', 1], ['aGap', 2], ['aProg', 1], ['aDash', 1]]) {
        at[k] = new THREE.InstancedBufferAttribute(new Float32Array(max * n), n);
        at[k].setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute(k, at[k]);
      }
      geo.instanceCount = 0;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      return { mesh, geo, at, max, n: 0 };
    };
    const pointBatch = (max, mat, positions) => {
      const geo = new THREE.BufferGeometry();
      const pos = new THREE.Float32BufferAttribute(positions || new Float32Array(max * 3), 3);
      if (!positions) pos.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('position', pos);
      const size = new THREE.Float32BufferAttribute(new Float32Array(max), 1), alpha = new THREE.Float32BufferAttribute(new Float32Array(max), 1);
      size.setUsage(THREE.DynamicDrawUsage); alpha.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('aSize', size); geo.setAttribute('aAlpha', alpha);
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      return { pts, geo, pos, size, alpha };
    };
    // every constellation: its own little scene, stars at their places in depth
    for (const c of cons) {
      const scene = new THREE.Scene();
      const lines = lineBatch(Math.max(1, c.lines.length), figMat);
      c.lines.forEach(([i, j], q) => {
        lines.at.aA.array.set(c.stars[i].P, q * 3); lines.at.aB.array.set(c.stars[j].P, q * 3);
        lines.at.aGap.array.set([glowR(c.stars[i]) - 1, glowR(c.stars[j]) - 1], q * 2);
      });
      lines.geo.instanceCount = c.lines.length;
      lines.at.aA.needsUpdate = lines.at.aB.needsUpdate = lines.at.aGap.needsUpdate = true;
      const P = new Float32Array(c.stars.length * 3);
      c.stars.forEach((s, j) => P.set(s.P, j * 3));
      const stars = pointBatch(c.stars.length, starMat, P);
      scene.add(lines.mesh, stars.pts);
      c.g = { scene, lines, stars };
    }
    // the overlay, in canvas pixels: the darkening, the tethers and leaders, and the rings at a tether's end
    const ortho = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
    const fieldScene = new THREE.Scene(), overScene = new THREE.Scene();
    const field = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fieldMat);
    field.frustumCulled = false;
    fieldScene.add(field);
    const over = lineBatch(24, overMat), rings = pointBatch(8, ringMat);
    overScene.add(over.mesh, rings.pts);
    const cam = new THREE.PerspectiveCamera(30, 1, .05, 200);
    cvGL.addEventListener('webglcontextlost', e => { e.preventDefault(); }, false);
    cvGL.addEventListener('webglcontextrestored', () => { dirty = true; }, false);
    return {
      renderer, cam, ortho, fieldScene, overScene, field, fieldMat, src, over, rings, res, dpr, starMat, figMat, overMat,
      v3: new THREE.Vector3(),
      ink(rgb) { ink.set(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255); },
      // the figures' colour: white over the film, the page's ink on paper (phones)
      tone(rgb) { const v = rgb ? [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255] : [1, 1, 1]; [starMat, ringMat, figMat, overMat].forEach(m => m.uniforms.uColor.value.set(v[0], v[1], v[2])); },
      size() {
        renderer.setPixelRatio(DPR);
        renderer.setSize(W, H, false);
        res.set(W, H); dpr.value = DPR;
        fieldMat.uniforms.uH.value = H;
        ortho.left = 0; ortho.right = W; ortho.top = 0; ortho.bottom = H; ortho.updateProjectionMatrix();
      },
    };
  }

  function glDraw(c, leads, t) {
    const r = G.renderer;
    r.setRenderTarget(null);
    r.clear();
    if (!c) return;
    G.tone(dayOnly() ? C.ink : null);
    // the figure: star alphas, sizes and how far each line is drawn
    const st = c.g.stars, k = view.narrow() ? .88 : 1;
    c.stars.forEach((s, j) => { st.size.array[j] = s.r * k * 1.35 * (.65 + .35 * s.k); st.alpha.array[j] = s.a; });
    st.size.needsUpdate = st.alpha.needsUpdate = true;
    const ln = c.g.lines;
    c.lines.forEach(([i, j], q) => {
      ln.at.aAlpha.array[q] = .95 * c.a * Math.min(c.stars[i].k, 1);   // version 17: the figure stands out
      ln.at.aProg.array[q] = c.lineG[q];
    });
    ln.at.aAlpha.needsUpdate = ln.at.aProg.needsUpdate = true;
    // the darkening
    const sigma = sigmaOf(c), n = fieldSources(c, G.src), ell = fieldEllipse(c, sigma), b = fieldBounds(c, sigma, ell);
    if (ell) { G.fieldMat.uniforms.uEll.value.set(ell.cx, ell.cy, ell.rx, ell.ry); G.fieldMat.uniforms.uEllW.value = ell.w; } else G.fieldMat.uniforms.uEllW.value = 0;
    G.fieldMat.uniforms.uN.value = n;
    G.fieldMat.uniforms.uSigma.value = sigma;
    G.fieldMat.uniforms.uMax.value = dimOf(c);
    const labs = labelShapes(c, performance.now()), U = G.fieldMat.uniforms;
    labs.forEach((q, j) => { U.uLab.value[j].set(q[0], q[1], q[2], q[3]); U.uLabA.value[j] = q[4]; });
    U.uNL.value = labs.length;
    U.uMaxL.value = LABEL_DIM * c.a;
    G.field.position.set(b.x + b.w / 2, b.y + b.h / 2, 0);
    G.field.scale.set(Math.max(1, b.w), Math.max(1, b.h), 1);
    // tethers, then leaders
    const ov = G.over, at = ov.at;
    let q = 0, rq = 0;
    const seg = (x1, y1, x2, y2, a, g0, g1, prog, dash) => {
      if (q >= ov.max) return;
      at.aA.array.set([x1, y1, 0], q * 3); at.aB.array.set([x2, y2, 0], q * 3);
      at.aAlpha.array[q] = a; at.aGap.array.set([g0, g1], q * 2); at.aProg.array[q] = prog; at.aDash.array[q] = dash;
      q++;
    };
    for (const th of tetherLines(c, t)) {
      seg(th.x1, th.y1, th.x2, th.y2, th.a, th.g0, 3.5, th.g, 6);
      if (rq < 8 && th.g > .98) { G.rings.pos.array.set([th.x2, th.y2, 0], rq * 3); G.rings.size.array[rq] = 1.25; G.rings.alpha.array[rq] = th.a * 1.3; rq++; }
    }
    for (const l of leads) seg(l.x1, l.y1, l.x2, l.y2, .55 * l.a, 0, 0, l.g, 0);
    ov.geo.instanceCount = q;
    for (const k2 of Object.keys(at)) at[k2].needsUpdate = true;
    G.rings.geo.setDrawRange(0, rq);
    G.rings.pos.needsUpdate = G.rings.size.needsUpdate = G.rings.alpha.needsUpdate = true;
    // draw: the dusk behind, the figure in depth, the tethers over
    r.render(G.fieldScene, G.ortho);
    aim(c, c.pl, t);
    r.render(c.g.scene, G.cam);
    r.render(G.overScene, G.ortho);
  }
  // a tether drops from its star to someone in the film
  function tetherLines(c, t) {
    const out = [];
    if (mobilePortrait()) return out;
    if (still || c.tetherG < .01) return out;
    if (document.documentElement.classList.contains('sky-only')) return out;   // phones without the film: nothing in it to tie a star to
    const A = view.area();
    for (const th of c.tethers) {
      const h = headOf(th.track, t), vis = api.vis(th.track, t);
      if (!h || vis < .05 || th.s.a < .5) continue;
      if (h[0] < A.x || h[0] > A.x + A.w) continue;   // someone behind the words (or out of the frame): no line to them
      out.push({ x1: th.s.x, y1: th.s.y, x2: h[0], y2: h[1], a: .5 * c.a * vis, g0: glowR(th.s), g: c.tetherG });
    }
    return out;
  }

  /* ---------------- The flat figure, on a 2D canvas (still frames, or without three.js) ---------------- */
  function draw2D(ctx, c, leads, t, opts = {}) {
    const ink = C.ink.join(',');
    // the darkening: soft discs around the stars and along the lines
    const sigma = sigmaOf(c), src = new Float32Array(64 * 3), n = fieldSources(c, src), dim = dimOf(c), ell = fieldEllipse(c, sigma);
    ctx.save();
    if (ell) {
      ctx.save();
      ctx.translate(ell.cx, ell.cy); ctx.scale(ell.rx, ell.ry);
      const ge = ctx.createRadialGradient(0, 0, 0, 0, 0, 2);
      ge.addColorStop(0, `rgba(${ink},${(dim * .5 * ell.w).toFixed(3)})`); ge.addColorStop(.5, `rgba(${ink},${(dim * .2 * ell.w).toFixed(3)})`); ge.addColorStop(1, `rgba(${ink},0)`);
      ctx.fillStyle = ge; ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
    }
    for (let i = 0; i < n; i++) {
      const x = src[i * 3], y = src[i * 3 + 1], w = src[i * 3 + 2], R = sigma * 1.9;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, `rgba(${ink},${(dim * .42 * w).toFixed(3)})`);
      gr.addColorStop(.5, `rgba(${ink},${(dim * .2 * w).toFixed(3)})`);
      gr.addColorStop(1, `rgba(${ink},0)`);
      ctx.fillStyle = gr;
      ctx.fillRect(x - R, y - R, R * 2, R * 2);
    }
    if (!still) for (const q of labelShapes(c, performance.now())) {
      ctx.save();
      ctx.shadowColor = `rgba(${ink},${(LABEL_DIM * c.a * q[4]).toFixed(3)})`; ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(${ink},${(LABEL_DIM * c.a * q[4] * .9).toFixed(3)})`;
      ctx.fillRect(q[0] - q[2], q[1] - q[3], q[2] * 2, q[3] * 2);
      ctx.restore();
    }
    // lines, kept clear of the stars
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,255,255,.92)';
    c.lines.forEach(([i, j], q) => {
      const A = c.stars[i], B = c.stars[j], g = c.lineG[q];
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
      const g0 = glowR(A) - 1, g1 = glowR(B) - 1;
      if (len < g0 + g1 + 2 || g < .01) return;
      const ux = dx / len, uy = dy / len, e = g0 + (len - g0 - g1) * g;
      ctx.globalAlpha = c.a * A.k;
      ctx.beginPath(); ctx.moveTo(A.x + ux * g0, A.y + uy * g0); ctx.lineTo(A.x + ux * e, A.y + uy * e); ctx.stroke();
    });
    for (const l of leads) {
      ctx.globalAlpha = .55 * l.a; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(lerp(l.x1, l.x2, l.g), lerp(l.y1, l.y2, l.g)); ctx.stroke();
    }
    // stars: a white core and a soft glow
    for (const s of c.stars) {
      if (s.a < .01) continue;
      const r = s.r * (opts.k || 1);
      ctx.globalAlpha = s.a;
      const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 4.4);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.3, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(s.x, s.y, r * 4.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, TAU); ctx.fill();
    }
    if (opts.title) {
      let x0 = 1e9, y1 = -1e9;
      for (const s of c.stars) { x0 = Math.min(x0, s.x); y1 = Math.max(y1, s.y); }
      ctx.globalAlpha = .92 * c.a;
      ctx.fillStyle = '#fff';
      ctx.font = `500 10px ${C.label}`;
      ctx.textBaseline = 'top';
      const name = c.raw.latin.toUpperCase().split('').join(' ');
      ctx.shadowColor = `rgba(${ink},.6)`; ctx.shadowBlur = 6;
      ctx.fillText(name, x0, y1 + 14);
    }
    ctx.restore();
  }

  // ?debug: every track over the film, and the box each figure sits in
  function drawDebug(t, shown) {
    if (!ctx2) return;
    ctx2.font = `600 10px ${C.label}`;
    ctx2.textBaseline = 'middle';
    for (const name of Object.keys(F.track)) {
      const p = api.at(name, t);
      if (!p) continue;
      const [x, y] = view.px(p[0], p[1], t);
      ctx2.strokeStyle = 'rgba(0,120,255,.95)'; ctx2.lineWidth = 1.2;
      ctx2.beginPath(); ctx2.moveTo(x - 6, y); ctx2.lineTo(x + 6, y); ctx2.moveTo(x, y - 6); ctx2.lineTo(x, y + 6); ctx2.stroke();
      ctx2.fillStyle = 'rgba(0,90,220,1)'; ctx2.fillText(name, x + 8, y - 7);
    }
    const ex = exclusion(t);
    ctx2.strokeStyle = 'rgba(0,120,255,.7)'; ctx2.setLineDash([3, 3]); ctx2.strokeRect(ex.x, ex.y, ex.w, ex.h); ctx2.setLineDash([]);
    const S = view.area();
    ctx2.strokeStyle = 'rgba(0,160,90,.7)'; ctx2.strokeRect(S.x, S.y, S.w, S.h);
    if (shown) {
      const R = shown.pl.R;
      ctx2.strokeStyle = 'rgba(220,0,160,.8)'; ctx2.setLineDash([5, 4]); ctx2.strokeRect(R.x, R.y, R.w, R.h); ctx2.setLineDash([]);
      ctx2.fillStyle = 'rgba(220,0,160,1)'; ctx2.fillText(`${shown.key} · turn ${shown.k.toFixed(2)}`, R.x + 4, R.y + 9);
    }
  }

  /* ---------------- Hover: which star is this? ---------------- */
  function hover(shown) {
    if (mobilePortrait()) { if (tipShown) { api.tip(null); tipShown = false; } return; }
    const p = api.pointer;
    if (!shown || !p.on || p.down || api.spotHover()) { if (tipShown) { api.tip(null); tipShown = false; } return; }
    const fb = api.frame(), x = p.x - fb.left, y = p.y - fb.top, hit = p.touch ? 22 : 13;
    let best = null, bd = hit * hit;
    for (const s of shown.stars) {
      if (s.a < .5) continue;
      const d = (s.x - x) ** 2 + (s.y - y) ** 2;
      if (d < bd) { bd = d; best = s; }
    }
    if (best) {
      const title = best.name ? `${esc(best.name)} · ${esc(designation(best.bayer))}` : esc(designation(best.bayer));
      const far = best.dist ? `${lyText(best.dist)} light-years away` : 'distance unknown';
      const mag = `magnitude ${best.mag < 0 ? '−' : ''}${Math.abs(best.mag).toFixed(2)}`;
      api.tip({ title, line: `${far}, ${mag}.`, hint: best.role ? esc(best.role) : esc(shown.raw.latin) }, best.x + fb.left, best.y + fb.top - 10);
      tipShown = true;
    } else if (tipShown) { api.tip(null); tipShown = false; }
  }

  /* A phone has real tap targets, outside the decorative film's aria-hidden subtree.
     Only the points capture taps; every gap and every vertical swipe keeps native page scrolling. */
  let mobileControls = null, mobileHint = null, mobileLabel = null, mobileNodes = [];
  let mobileConstellation = null, mobileSelection = null, mobileScroll = 0;
  function clearMobileSelection() {
    mobileSelection = null;
    if (mobileLabel) mobileLabel.hidden = true;
    if (mobileHint) mobileHint.hidden = !mobileControls || mobileControls.hidden || !mobileNodes.some(n => !n.el.hidden);
    for (const n of mobileNodes) {
      n.el.setAttribute('aria-expanded', 'false');
      n.ring.style.borderWidth = '1px';
    }
  }
  function selectMobileNode(n) {
    if (mobileSelection === n) { clearMobileSelection(); return; }
    clearMobileSelection();
    mobileSelection = n;
    mobileScroll = window.scrollY;
    mobileHint.hidden = true;
    n.el.setAttribute('aria-expanded', 'true');
    n.ring.style.borderWidth = '2px';
    const s = n.s;
    const title = document.createElement('strong');
    title.textContent = s.name || designation(s.bayer);
    title.style.cssText = 'display:block;font:500 14px/1.3 var(--font-text,sans-serif);margin-bottom:4px;overflow-wrap:anywhere';
    const detail = document.createElement('span');
    detail.textContent = `${s.dist ? `${lyText(s.dist)} light-years away` : 'Distance unknown'}${s.role ? ` · ${s.role}` : ''}`;
    detail.style.cssText = 'display:block;font:400 11px/1.45 var(--font-text,sans-serif);overflow-wrap:anywhere';
    mobileLabel.replaceChildren(title, detail);
    mobileLabel.hidden = false;
    placeMobileLabel();
  }
  function placeMobileLabel() {
    if (!mobileSelection || !mobileLabel) return;
    const A = mobileArea(), fb = api.frame();
    if (!A.available) { clearMobileSelection(); return; }
    mobileLabel.style.width = `${A.w}px`;
    mobileLabel.style.maxHeight = `${A.h}px`;
    mobileLabel.style.left = `${fb.left + A.x}px`;
    mobileLabel.style.top = `${fb.top + A.y}px`;
  }
  function initMobileControls() {
    mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-sky-controls';
    mobileControls.setAttribute('role', 'group');
    mobileControls.setAttribute('aria-label', 'Explore constellation stars');
    mobileControls.style.cssText = 'position:fixed;inset:0;z-index:8;pointer-events:none;color:#f3f0e8';
    mobileControls.hidden = true;
    mobileHint = document.createElement('span');
    mobileHint.className = 'mobile-sky-hint';
    mobileHint.style.cssText = 'position:fixed;pointer-events:none;font:400 9px/1.3 var(--font-label,monospace);letter-spacing:.06em;text-align:center;text-transform:uppercase;text-shadow:0 1px 8px #091929';
    mobileHint.setAttribute('aria-hidden', 'true');
    mobileLabel = document.createElement('div');
    mobileLabel.id = 'mobile-star-detail';
    mobileLabel.className = 'mobile-sky-label';
    mobileLabel.setAttribute('role', 'status');
    mobileLabel.setAttribute('aria-live', 'polite');
    mobileLabel.style.cssText = 'position:fixed;z-index:1;box-sizing:border-box;padding:10px 12px;overflow:hidden;pointer-events:none;color:#f3f0e8;background:rgba(10,28,44,.94);border:1px solid rgba(243,240,232,.3);text-shadow:none';
    mobileLabel.hidden = true;
    mobileControls.append(mobileHint, mobileLabel);
    document.body.appendChild(mobileControls);
    addEventListener('scroll', () => {
      if (mobileSelection && Math.abs(window.scrollY - mobileScroll) > 8) clearMobileSelection();
    }, { passive: true });
    document.addEventListener('click', e => {
      if (mobileSelection && !mobileControls.contains(e.target)) clearMobileSelection();
    }, { passive: true });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') clearMobileSelection(); });
  }
  function buildMobileNodes(c) {
    clearMobileSelection();
    mobileNodes.forEach(n => n.el.remove());
    mobileNodes = [];
    mobileConstellation = c;
    if (!c) return;
    mobileHint.textContent = `${c.raw.latin} · Tap a star`;
    const sorted = c.stars.slice().sort((a, b) => Number(!!b.role) - Number(!!a.role) || a.mag - b.mag);
    for (const s of sorted) {
      const el = document.createElement('button'), ring = document.createElement('span');
      el.type = 'button';
      el.className = 'mobile-sky-node';
      el.setAttribute('aria-label', `${s.name || designation(s.bayer)}, ${c.raw.latin}. Show star details`);
      el.setAttribute('aria-controls', 'mobile-star-detail');
      el.setAttribute('aria-expanded', 'false');
      el.style.cssText = 'position:fixed;left:0;top:0;width:44px;height:44px;min-width:44px;min-height:44px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:#f3f0e8;pointer-events:auto;touch-action:pan-y;cursor:pointer;-webkit-tap-highlight-color:transparent';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.cssText = 'position:absolute;inset:15px;border:1px solid rgba(243,240,232,.8);border-radius:50%;box-shadow:0 0 8px rgba(10,28,44,.7);pointer-events:none';
      el.appendChild(ring);
      const n = { c, s, el, ring, placed: '' };
      let press = null, moved = false;
      el.addEventListener('pointerdown', e => { press = { x: e.clientX, y: e.clientY, scroll: window.scrollY }; moved = false; }, { passive: true });
      el.addEventListener('pointermove', e => { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) moved = true; }, { passive: true });
      el.addEventListener('pointercancel', () => { moved = true; press = null; }, { passive: true });
      el.addEventListener('click', e => {
        if (!mobilePortrait() || (e.detail && (moved || (press && Math.abs(window.scrollY - press.scroll) > 8)))) return;
        selectMobileNode(n);
      });
      el.hidden = true;
      mobileNodes.push(n);
      mobileControls.insertBefore(el, mobileLabel);
    }
  }
  function updateMobileControls(shown) {
    if (!mobileControls) return;
    if (!mobilePortrait() || !shown || shown.a < .5 || !mobileArea().available) {
      mobileControls.hidden = true;
      clearMobileSelection();
      return;
    }
    if (mobileConstellation !== shown) buildMobileNodes(shown);
    mobileControls.hidden = false;
    const A = mobileArea(), fb = api.frame(), placed = [];
    // Stable priority keeps neighbouring 44px squares from stealing one another's taps.
    for (const n of mobileNodes) {
      const s = n.s;
      const fits = s.a > .5 && s.x >= A.x + 22 && s.x <= A.x + A.w - 22 && s.y >= A.y + 22 && s.y <= A.y + A.h - 50;
      const on = fits && !placed.some(p => Math.abs(p.x - s.x) < 44 && Math.abs(p.y - s.y) < 44);
      if (n.el.hidden === on) n.el.hidden = !on;
      if (!on) { if (mobileSelection === n) clearMobileSelection(); continue; }
      placed.push(s);
      const transform = `translate3d(${(fb.left + s.x - 22).toFixed(2)}px,${(fb.top + s.y - 22).toFixed(2)}px,0)`;
      if (transform !== n.placed) { n.el.style.transform = transform; n.placed = transform; }
    }
    mobileHint.style.left = `${fb.left + A.x}px`;
    mobileHint.style.top = `${fb.top + A.y + A.h - 24}px`;
    mobileHint.style.width = `${A.w}px`;
    mobileHint.hidden = !placed.length || !!mobileSelection;
    placeMobileLabel();
  }

  // A failed optional sky layer must never stop the film's requestAnimationFrame loop.
  let renderFault = false;
  function stopSkyAfterError(err) {
    if (!renderFault) console.warn('sky: keeping the film without constellation controls', err && err.message);
    renderFault = true;
    if (mobileControls) mobileControls.hidden = true;
    if (cvGL) cvGL.style.visibility = 'hidden';
    if (cv2) cv2.style.visibility = 'hidden';
  }

  /* ---------------- The loop's call ---------------- */
  function frame(t, now) {
    if (renderFault) return;
    try { renderFrame(t, now); } catch (err) { stopSkyAfterError(err); }
  }
  function renderFrame(t, now) {
    if (mode === 'wait' || !cons.length) return;
    const dt = clamp((now - lastNow) / 1000, .001, .05);
    lastNow = now;
    view = liveView; still = false;
    const shown = update(t, now, dt);
    lastShown = shown;
    const leads = layoutNotes(shown, t, now, dt);
    // draw only when something moved: the film, the pointer, an entrance, a word
    const busy = shown && (now - shown.bornAt < 3200 || leads.some(l => l.g < 1 || l.a < 1) || notes.some(n => n.c === shown && (n.on ? now - n.onAt - n.delay < 700 : now - n.offAt < NOTE_OUT)));
    const sig = shown ? `${shown.key}|${t.toFixed(4)}|${Math.round(window.scrollY)}|${par.yaw.toFixed(4)}|${par.pitch.toFixed(4)}|${W}x${H}` : 'none';
    if (dirty || busy || sig !== lastSig || debug) {
      dirty = false; lastSig = sig;
      if (mode === 'gl') glDraw(shown, leads, t);
      else if (ctx2) {
        ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx2.clearRect(0, 0, W, H);
        if (shown) draw2D(ctx2, shown, leads, t);
      }
      if (debug && ctx2) {
        if (mode === 'gl') { ctx2.setTransform(DPR, 0, 0, DPR, 0, 0); ctx2.clearRect(0, 0, W, H); }
        drawDebug(t, shown);
      }
    }
    hover(shown);
    updateMobileControls(shown);
    placeTick(now);
  }

  /* ---------------- A checkpoint is saved: a small white tick rises over the climber ---------------- */
  function flash() {
    if (mobilePortrait()) return;
    flashT0 = performance.now();
    if (!tickEl) return;
    tickEl.classList.remove('on');
    void tickEl.offsetWidth;   // restart the animation
    tickEl.classList.add('on');
  }
  function placeTick(now) {
    if (mobilePortrait()) return;
    if (!tickEl || now - flashT0 > 1600) return;
    const p = api.at('climber', api.tD ? api.tD() : 0) || [.4, .7];
    const [x, y] = view.px(p[0], p[1] - F.climberBox[1], 0);
    tickEl.style.transform = `translate3d(${(x + 8).toFixed(1)}px,${(y - 20).toFixed(1)}px,0)`;
  }

  /* ---------------- Reduced motion: the flat figure, drawn once over each still frame ---------------- */
  function drawStill(canvas, t, opts = {}) {
    if (renderFault) return;
    try { renderStill(canvas, t, opts); } catch (err) { stopSkyAfterError(err); }
  }
  function renderStill(canvas, t, opts = {}) {
    if (!cons.length) { pendingStills.push([canvas, t, opts]); return; }
    const box = opts.live && mobilePortrait() ? api.frame() : null;
    const w = box ? box.width : canvas.clientWidth, h = box ? box.height : canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
    if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const saved = { view, W, H };
    // opts.live: a canvas over the film's own frame (version 15), placed through the film's mapping (cover, mirror)
    view = opts.live ? liveView : stillView(w, h); still = true; W = w; H = h;
    const shown = update(t, 0, .016);
    if (shown) draw2D(ctx, shown, [], t, { title: !mobilePortrait(), k: .9 });
    if (opts.live) { lastShown = shown; updateMobileControls(shown); }
    ({ view, W, H } = saved);
    still = false;
    for (const c of cons) c.bornAt = -1;
  }

  // For screen readers: what the sky says at each station, in words.
  function summaries() {
    for (const c of cons) {
      const sec = document.querySelector(`.station[data-key="${c.key}"]`);
      if (!sec || sec.querySelector('.film-says')) continue;
      const words = [`${c.raw.latin}, ${c.raw.english}: ${c.raw.meaning}`];
      for (const s of c.stars) if (s.role) words.push(`${s.name || designation(s.bayer)}, ${s.role}`);
      for (const g of c.segs) words.push(g.label);
      const p = document.createElement('p');
      p.className = 'sr film-says';
      p.textContent = `In the sky over the film: ${words.join('; ')}.`;
      sec.appendChild(p);
    }
  }

  /* ---------------- Public ---------------- */
  function ready() {
    buildGeometry();
    buildTimes();
    buildNotes();
    summaries();
    layout();
    pendingStills.splice(0).forEach(([cnv, t, o]) => drawStill(cnv, t, o));
    dirty = true;
  }
  function loadData() {
    return fetch(SKY.src, { credentials: 'same-origin' }).then(r => { if (!r.ok) throw new Error(`${SKY.src}: ${r.status}`); return r.json(); });
  }
  function init(a) {
    api = a; F = a.FILM; SKY = F.sky; debug = a.debug;
    stillPage = document.documentElement.classList.contains('still-mode');
    cv2 = document.querySelector('canvas.net');
    cvGL = document.querySelector('canvas.sky');
    notesEl = document.querySelector('.notes');
    legendEl = document.querySelector('.net-legend');
    initMobileControls();
    if (notesEl) {
      tickEl = document.createElement('span');
      tickEl.className = 'sky-tick';
      tickEl.setAttribute('aria-hidden', 'true');
      notesEl.appendChild(tickEl);
    }
    view = liveView;
    readColours();
    addEventListener('tas:palette', readColours);
    addEventListener('tas:type', () => { readColours(); measureNotes(); dirty = true; });   // a new face: new label sizes
    if (!SKY) return;
    const dataP = loadData();
    // three.js only for the moving film; reduced motion never downloads it
    const threeP = stillPage ? Promise.resolve(null) : import('three').catch(() => null);
    Promise.all([dataP, threeP]).then(([d, three]) => {
      data = d.constellations || [];
      ready();
      if (stillPage) return;
      THREE = three;
      G = THREE ? glSetup() : null;
      if (G) { mode = 'gl'; G.ink(C.ink); layout(); if (cv2 && !debug) cv2.style.visibility = 'hidden'; }
      else { mode = '2d'; ctx2 = cv2 && cv2.getContext('2d'); if (cvGL) cvGL.style.display = 'none'; }
      if (debug && cv2 && !ctx2) ctx2 = cv2.getContext('2d');
      dirty = true;
      if (api.kick) api.kick();
    }).catch(err => { console.warn('sky:', err && err.message); });
  }
  function rebuild() { if (cons.length) { buildTimes(); dirty = true; } }
  function layout() {
    if (!api) return;   // film.js lays out once before it hands over its api
    const fb = api.frame(), host = api.filmBox();
    W = Math.max(1, Math.round(fb.width)); H = Math.max(1, Math.round(fb.height));
    DPR = Math.min(2, devicePixelRatio || 1);
    const style = `left:${(fb.left - host.left).toFixed(1)}px;top:${(fb.top - host.top).toFixed(1)}px;width:${W}px;height:${H}px`;
    if (cv2) { cv2.width = Math.round(W * DPR); cv2.height = Math.round(H * DPR); cv2.style.cssText = style + (mode === 'gl' && !debug ? ';visibility:hidden' : ''); }
    if (cvGL) { cvGL.style.cssText = style + (mode === '2d' ? ';display:none' : ''); if (G) G.size(); }
    if (notesEl) notesEl.style.cssText = style;
    if (!mobilePortrait() && mobileControls) { mobileControls.hidden = true; clearMobileSelection(); }
    measureMobileObstacles();
    measureNotes();
    dirty = true;
  }
  function hide() {
    if (G) G.renderer.clear();
    if (ctx2) { ctx2.setTransform(1, 0, 0, 1, 0, 0); ctx2.clearRect(0, 0, cv2.width, cv2.height); }
    notes.forEach(n => setOn(n, false));
    if (mobileControls) { mobileControls.hidden = true; clearMobileSelection(); }
  }

  // peek: for tests (?test), what is on the canvas now
  const peek = () => ({
    mode,
    shown: cons.filter(c => c.a > .005).map(c => ({
      key: c.key, id: c.raw.id, a: c.a, turn: c.k, box: c.pl && c.pl.R, s: c.pl && c.pl.s, px: c.pl && c.pl.px, py: c.pl && c.pl.py,
      stars: c.stars.map(s => ({ name: s.name || s.bayer, x: s.x, y: s.y, u: s.u, v: s.v, a: s.a, r: glowR(s) })),
      tethers: tetherLines(c, api.tD ? api.tD() : 0).map(l => [l.x1, l.y1, l.x2, l.y2]),
    })),
    notes: notes.filter(n => n.on).map(n => ({ kind: n.kind, text: n.el.textContent, rect: n.rect })),
  });
  // version 15: where a star of the figure on screen is now (canvas px over the film box), for the tethers to the page
  // version 15: the words of the sky on screen (screen px), so the tethers to the page can pass them by
  function wordRects() {
    if (mode === 'wait' || !api) return [];
    const fb = api.frame(), out = [];
    for (const n of notes) if (n.on && n.rect) out.push({ x0: fb.left + n.rect.x - 5, y0: fb.top + n.rect.y - 4, x1: fb.left + n.rect.x + n.rect.w + 5, y1: fb.top + n.rect.y + n.rect.h + 4 });
    return out;
  }
  // version 15: the middle of a figure's labelled segment (Cassiopeia's four steps), like starAt
  function segAt(label) {
    if (mode === 'wait' || !cons.length) return undefined;
    const c = lastShown, g = c && c.segs.find(q => q.label === label);
    if (!g) return null;
    const A = c.stars[g.a], B = c.stars[g.b];
    return { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2, a: Math.min(A.a, B.a) * c.a, r: 3 };
  }
  // version 15: a star's (or a segment's) words light up while the words on the page that it is tied to are hovered
  function lightNote(name, on) {
    for (const n of notes) {
      const hit = (n.s && (n.s.name === name || n.s.bayer === name)) || (n.g && n.g.label === name);
      if (hit && n.kind !== 'title') n.el.classList.toggle('lit', !!on);
    }
  }
  // undefined: the sky is not running (still frames, or no data); null: that star is not on screen now
  function starAt(name) {
    if (mode === 'wait' || !cons.length) return undefined;
    const c = lastShown;
    const s = c && c.byName.get(name);
    if (!s) return null;
    return { x: s.x, y: s.y, a: s.a * c.a, r: glowR(s) };
  }
  return { init, rebuild, layout, frame, hide, flash, drawStill, measure: measureNotes, peek, starAt, segAt, lightNote, wordRects };
})();
