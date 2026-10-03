/* Version 15: the film talks to the page. A hairline leaves the film at a thing in it (the woman, the boulder,
   the door, someone who sits down to review, the portal, the steps, the people, three stars) and ties it to
   the words on the left that stand for it ([data-tether]). A line draws itself from the film to its words when
   they reach reading height, and fades when they leave. Hovering or focusing the words lights the thing,
   writes its name beside it and eases the film to its moment; hovering the thing in the film underlines its
   words in red.
   The lines never cross the woman, the boulder or the text: they travel through the film, beside the column
   (on phones, up the right margin), and enter the column only on the row of their own words, from the right.
   Anchors are measured once per layout (film.js calls measure); film.js's one loop calls frame with the scroll
   position and the moment on screen, so nothing is read from the layout while the page moves. */
const Tethers = (() => {
  'use strict';

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const DRAW = 950, FADE = 420, IN = 200;   // ms: a line draws on; fades out; its first light
  // version 17: along every line that has arrived, signals travel from the sky to the words, two at a time
  const PULSE = 2600, TRAIL = 46;           // ms for one signal to cross; the length of its light trail, px
  const GAP = 12;                            // px between the words and the dot at their edge
  const doc = document.documentElement;

  let api = null, F = null, C = null;
  let cv = null, ctx = null, labelEl = null;
  let W = 1, H = 1, DPR = 1, L = null;
  let reduced = false, still = false;
  const links = [];
  const groups = [];
  let hot = null;                       // words hovered or focused: { links, src, node }
  let filmHot = new Set(), filmHotSig = '', overNode = false;
  let lastSig = '', dirty = true, labelText = '', labelW = 0, labelH = 0, labelOn = false;
  const col = { ink: '23,25,26', chalk: '233,230,224', red: '196,67,42' };
  const SPOT_TO_NODE = {};

  function toRGB(v, fallback) {
    v = (v || '').trim();
    let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) { let x = m[1]; if (x.length === 3) x = x.replace(/./g, c => c + c); return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)).join(','); }
    m = v.match(/^rgba?\(([^)]+)\)$/i);
    if (m) return m[1].split(/[ ,/]+/).slice(0, 3).map(x => Math.round(parseFloat(x))).join(',');
    return fallback;
  }
  function readColours() {
    const cs = getComputedStyle(doc);
    col.ink = toRGB(cs.getPropertyValue('--ink'), col.ink);
    col.chalk = toRGB(cs.getPropertyValue('--chalk'), col.chalk);
    col.red = toRGB(cs.getPropertyValue('--red'), col.red);
    dirty = true;
  }

  /* ---------------- The words: one link per tethered element ---------------- */
  function init(a) {
    api = a; F = a.FILM; C = F.tethers;
    if (!C) return;
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    still = !!a.stillMode;
    for (const key in C.nodes) if (C.nodes[key].spot) SPOT_TO_NODE[C.nodes[key].spot] = key;
    document.querySelectorAll('[data-tether]').forEach(el => {
      const key = el.dataset.tether, node = C.nodes[key];
      if (!node) return;
      const star = el.dataset.node || null;
      const k = { el, key, node, star, i: links.filter(q => q.key === key).length, ax: 0, ay: 0, sy: 0, N: null, path: null, on: false, g: 0, a: 0, onAt: 0, offAt: -1e9, li: el.closest('.step') };
      links.push(k);
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') setHot([k], el); });
      el.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && !hot) setHot([k], el); }, { passive: true });
      el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && hot && hot.src === el) setHot(null); });
    });
    // keyboard: one stop per floor (the stair's four steps and the roof's three questions are one stop each)
    const seen = new Set();
    for (const k of links) {
      const g = k.el.closest('.steps, .questions, .practice, h2.dz') || k.el;
      if (seen.has(g)) { groups.find(x => x.el === g).links.push(k); continue; }
      seen.add(g);
      groups.push({ el: g, links: [k] });
    }
    for (const g of groups) {
      if (!g.el.hasAttribute('tabindex')) g.el.tabIndex = 0;
      g.el.classList.add('tt-focus');
      g.el.addEventListener('focus', () => setHot(g.links, g.el));
      g.el.addEventListener('blur', () => { if (hot && hot.src === g.el) setHot(null); });
    }
    // a wheel or a touch hands the film back to the scroll
    ['wheel', 'touchstart'].forEach(t => addEventListener(t, () => { if (hot && hot.src !== document.activeElement) setHot(null); }, { passive: true }));

    cv = document.createElement('canvas');
    cv.className = 'tethers';
    cv.setAttribute('aria-hidden', 'true');
    labelEl = document.createElement('p');
    labelEl.className = 'tt-label';
    labelEl.setAttribute('aria-hidden', 'true');
    const after = document.querySelector('.film-touch');
    if (after) { after.before(cv); } else document.body.appendChild(cv);
    document.body.appendChild(labelEl);
    ctx = cv.getContext('2d');
    readColours();
    addEventListener('tas:palette', readColours);
    addEventListener('tas:type', () => { labelText = ''; dirty = true; });
    if (/[?&](test|debug)\b/.test(location.search)) {
      // for tests: the anchors measured again, live, from the page as it is now
      const anchorNow = i => { doc.classList.add('tt-measure'); const r = anchorOf(links[i]); doc.classList.remove('tt-measure'); return r; };
      window.__tethers = { peek, links, anchorNow, frameAt: () => ({ y: lastY, t: lastT }) };
    }
  }

  function setHot(list, src) {
    const was = hot;
    hot = list && list.length ? { links: list, src, node: list[0].node } : null;
    if (!was && !hot) return;
    if (api.preview) {
      const k0 = hot && hot.links[0], n = hot && hot.node;
      const src = k0 && (k0.src || (k0.N && k0.N.src));
      const sky = src === 'sky' && n.skyAt !== undefined;
      api.preview(hot ? api.scaled(sky ? n.skyAt : n.at) : null);
    }
    dirty = true;
    if (still && api.kick) api.kick();   // stills: no loop runs, so draw now
  }

  /* ---------------- Measuring: once per layout ---------------- */
  // the box of an element's words (not of the element): the union of its text's line boxes
  const range = document.createRange();
  function textBox(el, skip) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (!n.nodeValue.trim() || (skip && n.parentElement && n.parentElement.closest(skip))) continue;
      range.selectNodeContents(n);
      for (const q of range.getClientRects()) {
        if (q.width < 1 || q.height < 1) continue;
        x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom);
      }
    }
    if (x0 > x1) { const b = el.getBoundingClientRect(); return { left: b.left, top: b.top, right: b.right, bottom: b.bottom }; }
    return { left: x0, top: y0, right: x1, bottom: y1 };
  }
  function anchorOf(k) {
    const el = k.el;
    let x, y;
    if (el.classList.contains('practice-half')) {
      // a wing of the services pair: its right edge, at its heading
      const b = el.getBoundingClientRect(), hd = (el.querySelector('.practice-heading') || el).getBoundingClientRect();
      x = b.right + 8; y = (hd.top + hd.bottom) / 2;
    } else if (el.classList.contains('practice')) {
      // the two wings: at their seam, on the pair's right edge
      const b = el.getBoundingClientRect(), ax = el.querySelector('.dz-axis');
      x = b.right + 8; y = ax ? ax.getBoundingClientRect().top : (b.top + b.bottom) / 2;
    } else if (el.classList.contains('drail')) {
      // a rail: beside its pair, on the cut between the two words
      const t = textBox(el.querySelector('.drail-pair') || el, '.drail-cut'), cut = el.querySelector('.drail-cut');
      x = t.right + GAP; y = cut ? (cut.getBoundingClientRect().top + cut.getBoundingClientRect().bottom) / 2 : (t.top + t.bottom) / 2;
    } else if (el.matches('h2.dz')) {
      // a split heading: on its cut, beyond its longer line
      const t = textBox(el), cut = el.querySelector('.dz-cut');
      x = t.right + GAP + 6; y = cut ? cut.getBoundingClientRect().top : (t.top + t.bottom) / 2;
    } else if (el.matches('.questions li')) {
      // a question: at the end of its answer line
      const b = el.getBoundingClientRect(), t = textBox(el.querySelector('.q') || el);
      x = b.right + 8; y = (t.top + t.bottom) / 2;
    } else {
      const t = textBox(el);
      x = t.right + GAP; y = (t.top + t.bottom) / 2;
    }
    return [x, y];
  }
  function measure() {
    if (!api || !links.length) return;
    L = api.layoutInfo();
    // the splits rest joined while the words are measured, so every anchor is where it is read
    doc.classList.add('tt-measure');
    const sy = window.scrollY;
    for (const k of links) { const [x, y] = anchorOf(k); k.ax = x; k.ay = y + sy; }
    doc.classList.remove('tt-measure');
    // the canvas covers the window
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = L.vw; H = L.vh;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    labelText = '';
    dirty = true;
  }

  /* ---------------- The film's side: where each thing is now ---------------- */
  // a line leaves from its thing in the film when that is in the sharp part of the film, else from the sky's star
  // (or segment) with the same meaning; it keeps its source while it shows
  function filmNode(k, t) {
    const n = k.node, p = n.track && api.at(n.track, t);
    if (!p) return null;
    const spread = n.spread && k.star && n.stars ? (n.stars.indexOf(k.star) - 1) * n.spread : 0;
    const [x, y] = api.toScreen(p[0] + (n.dx || 0) + spread, p[1] - (n.up || 0) + (n.dy || 0), t);
    return { x, y, v: api.vis(n.track, t), r: 3.5, star: false, src: 'film' };
  }
  const skyName = k => k.star || k.node.star || null;
  function skyNode(k) {
    const name = skyName(k);
    if (!name || !api.star) return undefined;
    let s = api.star(name);
    if (!s && api.seg) { const g = api.seg(name); if (g !== undefined) s = g; }
    if (s === undefined) return undefined;   // the sky is not running here (stills, phones without it)
    if (!s || s.a < .45) return null;        // not on screen now, or still arriving
    const fb = api.frame();
    return { x: fb.left + s.x, y: fb.top + s.y, v: clamp((s.a - .45) / .4), r: s.r + 1.5, star: true, src: 'sky', name };
  }
  function nodeOf(k, t) {
    // version 17: a line to the sky that had to start in the film (the sky was not drawn yet) moves to its star as
    // soon as the star is there, and draws itself again from it
    if (k.src === 'film' && k.node.prefer === 'sky' && skyName(k)) {
      const S = skyNode(k);
      if (S && S.v > .5 && onFilm(S)) { k.src = 'sky'; k.onAt = performance.now(); k.g = 0; return S; }
    }
    if (k.src) return k.src === 'sky' ? skyNode(k) : filmNode(k, t);
    // version 17: words tied to the sky wait for their star; the film stands in only where the sky is not drawn
    if (k.node.prefer === 'sky' && skyName(k)) {
      const N = skyNode(k);
      if (N !== undefined) return N;
    }
    const order = k.node.prefer === 'sky' ? [skyNode, filmNode] : [filmNode, skyNode];
    let first = null;
    for (const f of order) {
      const N = f(k, t);
      if (!N) continue;
      if (N.v > .5 && onFilm(N)) return N;
      first = first || N;
    }
    return first;
  }
  // is the thing on the film, clear of the words, the bar and the rail?
  function onFilm(N) {
    if (L.narrow) return N.x > 6 && N.x < L.vw - 4 && N.y > L.bandTop + 52 && N.y < L.vh - 6;
    // wide screens: in the film's open part, right of the words (the film covers the page, the bar included)
    return N.x > Math.max(L.sharpX + 10, L.colRight + 40) && N.x < L.vw - 8 && N.y > Math.max(L.filmTop, L.barH) + 12 && N.y < L.vh - L.reserve - 4;
  }
  // the woman and the boulder, on the screen: no line crosses them
  function exclusions(t) {
    const c = api.at('climber', t), s = api.at('sphere', t), b = F.climberBox, r = F.sphereR, ry = r * 16 / 9;
    const box = (x0, y0, x1, y1) => {
      const [ax, ay] = api.toScreen(x0, y0, t), [bx, by] = api.toScreen(x1, y1, t);   // mirrored: x comes back swapped
      return { x0: Math.min(ax, bx) - 7, y0: Math.min(ay, by) - 7, x1: Math.max(ax, bx) + 7, y1: Math.max(ay, by) + 7 };
    };
    return [box(c[0] - b[0], c[1] - b[1], c[0] + b[0], c[1] + b[1]), box(s[0] - r, s[1] - ry, s[0] + r, s[1] + ry)];
  }

  /* ---------------- Routes: soft curves through the film, then along the words' own row ---------------- */
  function bez(out, x0, y0, x1, y1, x2, y2, x3, y3, n) {
    for (let i = out.length ? 1 : 0; i <= n; i++) {
      const u = i / n, v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
      out.push(a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3);
    }
  }
  function quad(out, x0, y0, x1, y1, x2, y2, n) {
    for (let i = 1; i <= n; i++) {
      const u = i / n, v = 1 - u;
      out.push(v * v * x0 + 2 * v * u * x1 + u * u * x2, v * v * y0 + 2 * v * u * y1 + u * u * y2);
    }
  }
  // how a line fares: -1 if it crosses the woman or the boulder (the first px may start on its own thing),
  // else how much of it runs over the sky's words (they are passed by when there is a way)
  function cost(pts, ex, soft, skip) {
    let run = 0, over = 0;
    for (let i = 2; i < pts.length; i += 2) {
      const x0 = pts[i - 2], y0 = pts[i - 1], x1 = pts[i], y1 = pts[i + 1];
      const len = Math.hypot(x1 - x0, y1 - y0), m = Math.max(1, Math.ceil(len / 6));
      for (let j = 1; j <= m; j++) {
        run += len / m;
        if (run < skip) continue;
        const x = x0 + (x1 - x0) * j / m, y = y0 + (y1 - y0) * j / m;
        for (const e of ex) if (x > e.x0 && x < e.x1 && y > e.y0 && y < e.y1) return -1;
        for (const e of soft) if (x > e.x0 && x < e.x1 && y > e.y0 && y < e.y1) { over++; break; }
      }
    }
    return over;
  }
  // a polyline with its running length; a star's line starts at the edge of its glow
  function pack(pts, trim) {
    if (trim > 0) {
      let d = 0;
      for (let i = 2; i < pts.length; i += 2) {
        const l = Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
        if (d + l >= trim) {
          const f = (trim - d) / Math.max(1e-3, l);
          pts = [pts[i - 2] + (pts[i] - pts[i - 2]) * f, pts[i - 1] + (pts[i + 1] - pts[i - 1]) * f].concat(pts.slice(i));
          break;
        }
        d += l;
      }
    }
    const n = pts.length / 2, cum = new Float32Array(n);
    for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(pts[2 * i] - pts[2 * i - 2], pts[2 * i + 1] - pts[2 * i - 1]);
    return { pts, cum, len: cum[n - 1] };
  }
  // the first shape that passes the woman and the boulder, and the sky's words if any shape can
  function best(shapes, N, ex, soft) {
    let pick = null, low = 1e9;
    for (const pts of shapes) {
      const c = cost(pts, ex, soft, N.r + 10);
      if (c < 0 || c >= low) continue;
      pick = pts; low = c;
      if (c === 0) break;
    }
    return pick ? pack(pick, N.star ? N.r : 0) : null;
  }
  // wide screens: from the thing, a soft curve to just right of the column, on the words' row; then into it
  function routeWide(N, A, ex, soft) {
    const Jx = Math.max(A.x, L.colRight + 26);
    const dx = N.x - Jx, dy = N.y - A.y;
    if (dx < 36) return null;
    const h = Math.min(260, Math.max(28, dx * .5));
    const top = Math.min(ex[0].y0, ex[1].y0);
    // [first handle, second handle's reach]: every control point stays right of the column, so the curve does too
    const tries = dy > 28
      ? [[N.x, N.y - Math.min(460, Math.max(26, dy * .62)), h], [N.x - dx * .55, N.y, dx * .14], [N.x, Math.min(N.y - 26, top - 34), h],
        [N.x - dx * .3, N.y + 40, dx * .1], [N.x + 30, A.y - 30, h]]
      : [[N.x - dx * .38, N.y, h], [N.x - dx * .3, N.y + Math.max(50, (A.y - N.y) * .6), h * .6], [N.x, Math.max(N.y, A.y) + 70, h * .4],
        [N.x - dx * .25, N.y - 80, h], [N.x, N.y - 110, h]];
    const shapes = tries.map(([px, py, reach]) => {
      const pts = [];
      bez(pts, N.x, N.y, px, py, Jx + Math.max(20, reach), A.y, Jx, A.y, 30);
      if (Jx > A.x + .5) pts.push(A.x, A.y);
      return pts;
    });
    return best(shapes, N, ex, soft);
  }
  // phones: from the thing, over the woman and the boulder to the right margin inside the band, up the
  // margin to the words' row, then a soft corner into it
  function routeNarrow(N, A, ex, soft) {
    const lane = L.vw - Math.max(8, Math.min(12, (L.vw - L.colRight) / 2));
    const railY = L.railY;
    // up from the thing, over the woman and the boulder, to the margin: below the rail, inside the band
    let yT = N.y - 26;
    for (const e of ex) if (e.x1 > N.x - 4 && e.x0 < lane + 4 && e.y1 > yT - 14) yT = Math.min(yT, e.y0 - 18);
    yT = Math.max(yT, railY + 22);
    if (yT > N.y - 8 || A.y > railY - 30) return null;
    const pts = [N.x, N.y];
    const over = lane - N.x, r1 = Math.max(0, Math.min(22, (N.y - yT) * .8, Math.abs(over) / 2));
    if (Math.abs(over) < 4) pts.push(lane, yT);
    else {
      const sx = Math.sign(over);
      // soft corners: up, across, up
      pts.push(N.x, yT + r1); quad(pts, N.x, yT + r1, N.x, yT, N.x + sx * r1, yT, 8);
      pts.push(lane - sx * r1, yT); quad(pts, lane - sx * r1, yT, lane, yT, lane, yT - r1, 8);
    }
    // up the margin to the words' row, then a soft corner into it
    const r2 = Math.max(0, Math.min(18, lane - A.x));
    pts.push(lane, A.y + r2);
    if (r2 > 2) { quad(pts, lane, A.y + r2, lane, A.y, lane - r2, A.y, 8); pts.push(A.x, A.y); }
    return best([pts], N, ex, soft);
  }

  /* ---------------- Per frame ---------------- */
  let lastY = 0, lastT = 0;
  function frame(y, t, now) {
    if (!cv || !L || !links.length) return;
    lastY = y; lastT = t;
    const narrow = L.narrow;
    // reading height: a line draws on once its words rise past it, and stays while they are read; it fades
    // when they leave (on phones the reading area is the part above the band)
    const top = narrow ? L.barH + 12 : L.barH + L.vh * .06;
    const enter = narrow ? L.bandTop - 30 : L.vh * .68, stay = narrow ? L.bandTop - 26 : L.vh * .86;
    const line = narrow ? (L.barH + L.bandTop) * .5 : L.vh * .46;
    const ex = exclusions(t), soft = api.skyWords ? api.skyWords() : [];
    const cands = [];
    for (const k of links) {
      k.sy = k.ay - y;
      k.N = nodeOf(k, t);
      const isHot = !!hot && hot.links.includes(k);
      const vis = !!k.N && k.N.v > .5 && onFilm(k.N);
      const inBand = k.sy > top - (k.on ? 18 : 0) && k.sy < (k.on ? stay : enter);
      const seen = k.sy > L.barH + 4 && k.sy < (narrow ? L.bandTop - 8 : L.vh - 8);
      k.want = vis && (inBand || (isHot && seen));
      k.why = !k.N ? 'no node' : k.N.v <= .5 ? 'hidden' : !vis ? 'off film' : !k.want ? 'not read' : '';
      if (k.want) cands.push(k);
    }
    const score = k => (hot && hot.links.includes(k) ? -1e5 : 0) + Math.abs(k.sy - line) - (k.on ? 120 : 0);
    cands.sort((a, b) => score(a) - score(b));
    const max = narrow ? C.max.narrow : C.max.wide;
    const chosen = new Set(cands.slice(0, max));
    let anim = false;
    for (const k of links) {
      let want = chosen.has(k);
      // the route, whenever the line shows (it fades out along its words, too)
      if (want || k.a > 0) {
        const A = { x: k.ax, y: k.sy };
        const path = k.N && onFilm(k.N) ? (narrow ? routeNarrow(k.N, A, ex, soft) : routeWide(k.N, A, ex, soft)) : null;
        if (path) k.path = path; else if (want) { want = false; k.why = 'no route'; }
      }
      if (want && !k.on) { k.on = true; k.onAt = now; k.src = k.N.src; if (reduced || still) k.g = 1; }
      else if (!want && k.on) { k.on = false; k.offAt = now; }
      if (k.on) {
        k.g = reduced || still ? 1 : Math.max(k.g, easeOut(clamp((now - k.onAt) / DRAW)));
        k.a = reduced || still ? 1 : clamp((now - k.onAt) / IN);
        if (k.g < 1 || k.a < 1 || (!reduced && !still && k.g > .97)) anim = true;
      } else if (k.a > 0) {
        k.a = reduced || still ? 0 : clamp(1 - (now - k.offAt) / FADE);
        if (k.a > 0) anim = true; else { k.g = 0; k.path = null; k.src = null; }
      }
      if (k.li) { const lit = k.on && k.g > .9; if (lit !== !!k.lit) { k.lit = lit; k.li.classList.toggle('tt-on', lit); } }
    }
    hoverFilm();
    const pulse = !!hot && !reduced && !still;
    const sig = `${y.toFixed(1)}|${t.toFixed(4)}|${hot ? links.indexOf(hot.links[0]) : -1}|${filmHotSig}`;
    if (!dirty && !anim && !pulse && sig === lastSig) return;
    dirty = false; lastSig = sig;
    draw(now);
    placeLabel(ex);
  }

  // the thing under the pointer in the film (or its hotspot) underlines its words
  function hoverFilm() {
    const p = api.pointer, set = new Set();
    let near = false;
    if (p.on && !p.down && !p.touch) {
      for (const k of links) {
        if (!k.on || k.a < .5 || !k.N) continue;
        const r = Math.max(16, k.N.r + 10);
        if ((p.x - k.N.x) ** 2 + (p.y - k.N.y) ** 2 < r * r) { set.add(k); near = true; }
      }
    }
    const sid = api.spotHoverId && api.spotHoverId();
    if (sid && SPOT_TO_NODE[sid]) for (const k of links) if (k.key === SPOT_TO_NODE[sid]) set.add(k);
    const sig = [...set].map(k => links.indexOf(k)).join(',');
    if (near !== overNode) { overNode = near; doc.classList.toggle('tt-over', near); }
    if (sig === filmHotSig) return;
    for (const k of filmHot) if (!set.has(k)) k.el.classList.remove('tt-hot');
    for (const k of set) k.el.classList.add('tt-hot');
    filmHot = set; filmHotSig = sig;
  }

  /* ---------------- Drawing ---------------- */
  function strokeTo(path, g) {
    const { pts, cum, len } = path, stop = len * g;
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 1; i < cum.length; i++) {
      if (cum[i] <= stop) { ctx.lineTo(pts[2 * i], pts[2 * i + 1]); continue; }
      const f = (stop - cum[i - 1]) / Math.max(1e-3, cum[i] - cum[i - 1]);
      ctx.lineTo(pts[2 * i - 2] + (pts[2 * i] - pts[2 * i - 2]) * f, pts[2 * i - 1] + (pts[2 * i + 1] - pts[2 * i - 1]) * f);
      break;
    }
  }
  // a signal at fraction f of a line: a short trail of light and a bright head, in the page's accent
  function at(path, d) {
    const { pts, cum } = path;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < d) i++;
    const f = (d - cum[i - 1]) / Math.max(1e-3, cum[i] - cum[i - 1]);
    return [pts[2 * i - 2] + (pts[2 * i] - pts[2 * i - 2]) * f, pts[2 * i - 1] + (pts[2 * i + 1] - pts[2 * i - 1]) * f];
  }
  function signal(path, f, a) {
    const d1 = path.len * f, d0 = Math.max(0, d1 - TRAIL), n = 6;
    const fade = Math.min(1, f / .08, (1 - f) / .08);   // in at the star, out at the words
    if (fade <= 0) return;
    for (let s = 0; s < n; s++) {   // the trail, brighter toward its head
      const p0 = at(path, d0 + (d1 - d0) * s / n), p1 = at(path, d0 + (d1 - d0) * (s + 1) / n);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
      ctx.lineWidth = 2.6; ctx.strokeStyle = `rgba(${col.red},${(((s + 1) / n) * .85 * a * fade).toFixed(3)})`; ctx.stroke();
    }
    const [hx, hy] = at(path, d1);
    ctx.beginPath(); ctx.arc(hx, hy, 4.6, 0, Math.PI * 2); ctx.fillStyle = `rgba(${col.chalk},${(.75 * a * fade).toFixed(3)})`; ctx.fill();
    ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, Math.PI * 2); ctx.fillStyle = `rgba(${col.red},${(a * fade).toFixed(3)})`; ctx.fill();
  }
  function draw(now) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const k of links) {
      if (k.a < .01 || !k.path || k.g <= 0) continue;
      const lit = (!!hot && hot.links.includes(k)) || filmHot.has(k);
      const a = k.a * (k.N ? clamp(k.N.v * 1.6 - .6, .2, 1) : 1);
      // a faint halo of paper under the line keeps it legible over the film's darker stone
      ctx.lineWidth = lit ? 5 : 4.2;
      ctx.strokeStyle = `rgba(${col.chalk},${(.55 * a).toFixed(3)})`;
      strokeTo(k.path, k.g); ctx.stroke();
      ctx.lineWidth = lit ? 2.2 : 1.6;
      ctx.strokeStyle = `rgba(${col.ink},${((lit ? .95 : .8) * a).toFixed(3)})`;
      strokeTo(k.path, k.g); ctx.stroke();
      const [nx, ny] = k.path.pts;
      // the thing in the film: a small ring (a star is its own node)
      if (!k.N || !k.N.star) {
        ctx.beginPath(); ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.chalk},${(.7 * a).toFixed(3)})`; ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${col.ink},${((lit ? .95 : .6) * a).toFixed(3)})`; ctx.stroke();
      }
      if (lit && hot && hot.links.includes(k)) {
        const r = (k.N && k.N.star ? k.N.r + 5 : 8) + (reduced || still ? 0 : 2.2 * Math.sin(now / 260));
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${col.ink},${(.6 * a).toFixed(3)})`; ctx.stroke();
      }
      // the words' end: a small dot at their edge, once the line has arrived; it lights as each signal reaches it
      if (k.g > .97) {
        const p = k.path.pts, q = p.length;
        let flash = 0;
        if (!reduced && !still) {
          for (const ph of [0, .5]) {
            const f = ((now - k.onAt) / PULSE + ph) % 1;
            signal(k.path, f, a);
            flash = Math.max(flash, f > .9 ? 1 - (f - .9) / .1 : f < .06 ? (.06 - f) / .06 * .4 : 0);
          }
        }
        ctx.beginPath(); ctx.arc(p[q - 2], p[q - 1], (lit ? 2.8 : 2.3) + 2.6 * flash, 0, Math.PI * 2);
        ctx.fillStyle = flash > .05 ? `rgba(${col.red},${(Math.min(1, .7 + flash) * a).toFixed(3)})` : `rgba(${col.ink},${((lit ? .95 : .7) * a).toFixed(3)})`;
        ctx.fill();
      }
    }
  }
  // the thing's name, beside it, while its words are hovered or focused
  let litNote = '';
  function placeLabel(ex) {
    const k = hot && hot.links.find(q => q.on && q.path && q.a > .3);
    const note = k && k.N && k.N.star ? k.N.name : '';
    if (note !== litNote) { if (api.lightNote) { if (litNote) api.lightNote(litNote, false); if (note) api.lightNote(note, true); } litNote = note; }
    if (!k || note) { if (labelOn) { labelEl.classList.remove('on'); labelOn = false; } return; }
    const text = k.star || k.node.title;
    if (text !== labelText) { labelEl.textContent = text; labelText = text; labelW = labelEl.offsetWidth; labelH = labelEl.offsetHeight; }
    const [nx, ny] = k.path.pts;
    let x = nx + 12, y = ny - labelH - 10;
    const hits = (ax, ay) => ex.some(e => ax < e.x1 && ax + labelW > e.x0 && ay < e.y1 && ay + labelH > e.y0);
    if (hits(x, y)) y = Math.min(...ex.map(e => e.y0)) - labelH - 6;
    if (x + labelW > L.vw - 8) x = nx - 12 - labelW;
    y = Math.max(L.barH + 6, y);
    labelEl.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    if (!labelOn) { labelEl.classList.add('on'); labelOn = true; }
  }

  // for tests (?test): the lines on screen, their two ends, and where their words are
  function peek() {
    return links.filter(k => k.on || k.a > 0).map(k => ({
      key: k.key, star: k.star, text: k.el.textContent.trim().slice(0, 40), on: k.on, g: +k.g.toFixed(3), a: +k.a.toFixed(3),
      node: k.N && [+k.N.x.toFixed(1), +k.N.y.toFixed(1)], start: k.path && [+k.path.pts[0].toFixed(1), +k.path.pts[1].toFixed(1)],
      end: k.path && [+k.path.pts[k.path.pts.length - 2].toFixed(1), +k.path.pts[k.path.pts.length - 1].toFixed(1)],
      anchor: [+k.ax.toFixed(1), +k.sy.toFixed(1)], pts: k.path ? Array.from(k.path.pts, v => +v.toFixed(1)) : null,
    }));
  }

  return { init, measure, frame, peek };
})();
