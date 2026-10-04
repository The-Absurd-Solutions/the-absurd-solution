/* Sisyphus × Sociogram — the page is one continuous climb, the climb is a film, and a real
   constellation stands in the film's sky at every station (sky.js). Scroll position maps to a moment
   in the film, one per station.
   Drag the film to scrub it; hold the boulder to push. Stations you reach are checkpoints:
   whatever rolls back stops at the last one. Everything film-specific is in film-config.js.
   The film glides: a spring carries scroll into film time, two copies of the film blend the
   moments between frames, and the sky follows the moment actually on screen. */
(() => {
  'use strict';

  const doc = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrowMQ = matchMedia('(max-width: 899px)');
  const fineMQ = matchMedia('(pointer: fine)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const debug = /[?&]debug\b/.test(location.search);   // draws every track over the film
  const probe = debug || /[?&]test\b/.test(location.search);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const SKY = typeof ClimbSky === 'object' ? ClimbSky : null;   // the constellations over the film
  const LEFT = typeof LeftColumn === 'object' ? LeftColumn : null;   // the left column's split headings, images, rails and seams
  const TETH = typeof Tethers === 'object' ? Tethers : null;   // version 15: the lines from the film to the words on the left

  const filmEl = $('.film');
  const filmToggle = $('.film-toggle');
  const heroTitle = $('.hero-title');
  const frameEl = $('.film-frame');
  const vids = $$('.film-v');
  const slipEl = $('.slip');
  const sayEl = $('.say');
  const hintEl = $('.hint');
  const hintText = $('.hint-t');
  const hintBar = $('.hint-bar');
  const markX = $('.mark .x');
  const altStation = $('.alt-station');
  // version 17: the lift in the bar: its rolling floor number, its level, the panel's links and the call button's boulder
  const liftRoll = $('.lift-roll'), writeBtn = $('.bar .write');
  const navFloors = $$('.links a[data-floors]').map(a => { const [f0, f1 = f0] = a.dataset.floors.split('-').map(Number); return { a, f0, f1 }; });
  const stations = $$('.station');
  const touchEl = $('.film-touch');
  const spotsEl = $('.spots');
  const railEl = $('.rail');
  const tipEl = $('.tip');

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  // How it moves (seconds, and film seconds per second).
  const MOTION = {
    spring: .2,        // scroll → film time: a critically damped spring, so starts and stops ease in and out
    springFast: .06,   // while dragging, pushing or coasting the film answers directly
    maxSpeed: 18,      // even after a long jump the film never races faster than this
    lenisLerp: .09,    // desktop wheel smoothing
    jump: 1.25,        // a click to a station glides for this long
  };

  // Without motion (or on a data-saving connection) the film is never downloaded: four stills stand in.
  const stillMode = reduced.matches || saveData;
  if (stillMode) doc.classList.add('still-mode');
  // version 15: the film is mirrored (the woman pushes toward the words); every overlay is mapped with it
  const MIRROR = !!FILM.mirror, DIR = MIRROR ? -1 : 1;
  if (MIRROR) doc.classList.add('film-mirror');

  /* ---------------- Smooth scrolling: desktop wheels glide, touch keeps its own momentum ---------------- */
  let lenis = null;
  if (!stillMode && fineMQ.matches && typeof window.Lenis === 'function' && !/[?&]nolenis\b/.test(location.search)) {
    try { lenis = new window.Lenis({ lerp: MOTION.lenisLerp, smoothWheel: true, autoRaf: false }); }
    catch (e) { lenis = null; }   // without it everything scrolls natively
  }
  function scrollToY(y, glide) {
    if (lenis) lenis.scrollTo(y, glide ? { duration: MOTION.jump, easing: easeInOut, force: true } : { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: glide && !reduced.matches ? 'smooth' : 'instant' });
  }
  const instant = y => scrollToY(y, false);

  /* ---------------- Layout: scroll anchors per station ---------------- */
  let vw = innerWidth, vh = innerHeight, narrow = narrowMQ.matches, bandH = vh, bandTop = 0, readH = vh, readingTop = 0;
  let S = [], maxScroll = 1, frameBox = { left: 0, width: vw, top: 0, height: vh }, filmBox = { left: 0, top: 0 };
  let colLeft = 0, colRight = 0, barH = 64, touchRect = null, sharpX = 0, mainTop = 0;
  let reserve = 52;   // the bottom of the film taken by the rail (on phones: by the palette dock)
  const BAND = { top: 18, bottom: 18, rail: 8 };   // phones: the band's edges kept clear (version 17: no rail, no picker)
  let filmCompact = false, filmExpandedByUser = null, collapseAfter = Infinity;
  const skyOnly = () => narrow && FILM.narrowSkyOnly === true;   // phones: the constellations without the film
  const portraitMode = () => narrow && FILM.narrowFullscreen === true;
  // Use the headline's document position, independent of the band's size, to avoid resize/scroll oscillation.
  // A deliberate choice stays in effect while reading and when rotating the device.
  function syncMobileFilm(y) {
    const compact = narrow && !skyOnly() && !portraitMode() && !(filmExpandedByUser ?? (y < collapseAfter && vh >= 500));
    doc.classList.toggle('sky-only', skyOnly());
    if (filmToggle) {
      const hide = !narrow || skyOnly() || portraitMode();
      if (filmToggle.hidden !== hide) filmToggle.hidden = hide;
      if (filmToggle.getAttribute('aria-expanded') !== String(!compact)) {
        filmToggle.setAttribute('aria-expanded', String(!compact));
        filmToggle.querySelector('span').textContent = compact ? 'Expand film' : 'Minimize film';
      }
    }
    if (compact === filmCompact) return false;
    filmCompact = compact;
    doc.classList.toggle('film-compact', compact);
    return true;
  }
  const OPEN_GAP = 32;   // wide screens: the film's open part starts this far right of the words
  // the film's object-position across its box: pinned left on wide screens (FILM.wideFocusX), centred in the band
  const focusX = () => (narrow ? .5 : clamp(typeof FILM.wideFocusX === 'number' ? FILM.wideFocusX : .5));
  const focusY = () => portraitMode() ? (vw > vh ? .82 : .5) : narrow ? (filmCompact ? (vw > vh ? .72 : .82) : parseFloat(FILM.narrowFocusY) / 100) : .5;

  // Wide screens: the bar has nothing behind it but the film, so the words scroll away under its lower edge.
  const mainEl = $('main');
  let clipY = -2;
  function clipUnderBar(y) {
    const top = narrow && !portraitMode() ? -1 : Math.max(0, Math.round(y + (portraitMode() ? readingTop : barH) - mainTop));
    if (top === clipY) return;
    clipY = top;
    mainEl.style.clipPath = top < 0 ? '' : `inset(${top}px 0 0 0)`;
  }

  function layout() {
    vw = innerWidth; vh = innerHeight;
    narrow = narrowMQ.matches;
    if (narrow) previewT = null;
    doc.classList.toggle('sky-only', skyOnly());   // before anything is measured: the band's size depends on it
    barH = $('.bar').getBoundingClientRect().height;
    if (writeBtn) { const bw = writeBtn.getBoundingClientRect().width, bb = writeBtn.querySelector('.boulder'); writeBtn.style.setProperty('--run', `${Math.max(0, bw - (bb ? bb.offsetWidth : 26) - 18).toFixed(1)}px`); }
    collapseAfter = heroTitle.getBoundingClientRect().bottom + scrollY - barH - 16;
    syncMobileFilm(scrollY);
    const box = filmEl.getBoundingClientRect();
    filmBox = { left: box.left, top: box.top };
    bandH = narrow ? box.height : vh;
    bandTop = narrow ? box.top : 0;
    readingTop = portraitMode() ? barH : 0;
    readH = portraitMode() ? Math.max(1, vh - readingTop) : narrow && !skyOnly() && !portraitMode() ? bandTop : vh;
    if (narrow) {
      const controlBottom = filmToggle && !filmToggle.hidden ? vh - filmToggle.getBoundingClientRect().top + 8 : 18;   // sky-only: no toggle, only a small margin
      BAND.bottom = Math.min(controlBottom, Math.max(16, bandH - BAND.top - 16));
    }
    maxScroll = Math.max(1, doc.scrollHeight - vh);
    const top = el => el.getBoundingClientRect().top + scrollY;
    // A station's moment arrives when its heading reaches reading height.
    S = stations.map((el, i) => (i === 0 ? 0 : clamp(top(el) - readingTop - readH * (portraitMode() ? .15 : .55), 0, maxScroll)));
    for (let i = 1; i < S.length; i++) S[i] = Math.max(S[i], S[i - 1] + 1);
    S.push(Math.max(maxScroll, S[S.length - 1] + 1));
    const fb = frameEl.getBoundingClientRect();
    frameBox = { left: fb.left, width: fb.width, top: fb.top, height: fb.height };
    // what the film keeps clear: on wide screens the rail at the bottom; on phones the palette dock at the
    // band's bottom (the rail rides at the band's top there, see BAND)
    const rr = railEl && railEl.getBoundingClientRect();
    reserve = narrow ? BAND.bottom : rr && rr.height ? Math.max(24, vh - rr.top + 4) : 24;   // version 17: no rail, a small margin
    const col = $('.col').getBoundingClientRect();
    colLeft = col.left; colRight = col.right;
    mainTop = mainEl.getBoundingClientRect().top + scrollY;
    // wide screens: the film covers the page. Its open part, right of the words, is where things in it are tied to
    // the words, and where the sky, the captions, the hint and the rail go.
    sharpX = narrow ? 0 : Math.max(frameBox.left, colRight + OPEN_GAP);
    filmEl.style.setProperty('--film-x', `${focusX() * 100}%`);
    filmEl.style.setProperty('--film-y', `${focusY() * 100}%`);
    clipY = -2;
    clipUnderBar(scrollY);
    mapTimes();
    placeTouch();
    placeRail();
    positionHint();
    if (SKY) SKY.layout();
    if (LEFT) LEFT.measure();
    if (TETH) TETH.measure();
    if (stillMode) stillShown = -1;
  }

  /* ---------------- Station → time ---------------- */
  let duration = FILM.referenceDuration, endT = duration, T = [];
  const fps = 24, halfFrame = 1 / (fps * 2);
  const keys = stations.map(el => el.dataset.key);
  const scaled = t => t * duration / FILM.referenceDuration;

  function mapTimes() {
    const byKey = new Map(FILM.stations.map(s => [s.station, s.t]));
    endT = Math.max(0, duration - halfFrame);
    T = stations.map((el, i) => {
      const t = byKey.has(el.dataset.key) ? byKey.get(el.dataset.key) : (FILM.stations[i] || { t: 0 }).t;
      return clamp(scaled(t), 0, endT);
    });
    for (let i = 1; i < T.length; i++) T[i] = Math.max(T[i], T[i - 1]);
    T.push(endT);
  }
  const Tkey = key => { const i = keys.indexOf(key); return i < 0 ? 0 : T[i]; };

  function timeAt(y) {
    if (y <= S[0]) return T[0];
    for (let i = 0; i < S.length - 1; i++) {
      if (y <= S[i + 1]) return lerp(T[i], T[i + 1], clamp((y - S[i]) / Math.max(1, S[i + 1] - S[i])));
    }
    return T[T.length - 1];
  }
  // the inverse: the scroll position where the film reaches t
  function scrollAt(t) {
    t = clamp(t, T[0], T[T.length - 1]);
    for (let i = 0; i < T.length - 1; i++) {
      const a = T[i], b = T[i + 1];
      if (t < b || i === T.length - 2) return b > a ? lerp(S[i], S[i + 1], clamp((t - a) / (b - a))) : S[i];
    }
    return S[S.length - 1];
  }
  const stationAt = t => { let i = 0; while (i < stations.length - 1 && t >= T[i + 1] - .02) i++; return i; };

  /* ---------------- Tracks: where things are in the film ---------------- */
  // Catmull-Rom through the keyframes, so pinned nodes move as smoothly as the camera.
  function at(name, t) {
    const K = FILM.track[name];
    if (!K) return null;
    const r = t * FILM.referenceDuration / duration;
    if (r <= K[0][0]) return [K[0][1], K[0][2]];
    const n = K.length;
    if (r >= K[n - 1][0]) return [K[n - 1][1], K[n - 1][2]];
    let i = 0;
    while (i < n - 2 && r > K[i + 1][0]) i++;
    const p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(n - 1, i + 2)];
    const u = (r - p1[0]) / Math.max(1e-3, p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
    const cr = (a, b, c, d) => .5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3);
    return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
  }
  function vis(name, t) {
    const w = FILM.visible[name];
    if (!w) return 1;
    const r = t * FILM.referenceDuration / duration;
    return smooth(w[0] - .3, w[0], r) * (1 - smooth(w[1], w[1] + .3, r));
  }

  /* ---------------- Film coordinates → screen ----------------
     The band on phones is a crop of the 16:9 frame that pans with the climb (portraitCrop); wide screens show the
     whole frame over the whole page (halfCrop, a crop for a film in the right half, is off in version 15). Each covers
     its box (object-fit: cover), never zoomed further: centred in the band, pinned left on wide screens. */
  const progressOf = t => clamp(t / Math.max(.001, endT));
  const cropOf = () => (narrow ? FILM.portraitCrop : FILM.halfCrop || { from: .5, to: .5, width: 1 });
  function cropLeft(t) {
    const c = cropOf();
    return clamp(lerp(c.from, c.to, progressOf(t)) - c.width / 2, 0, 1 - c.width);
  }
  // px, py: the object-position of the picture in its box
  function displayed() {
    const W = frameBox.width, Hh = frameBox.height, aspect = cropOf().width * 16 / 9;
    const dH = Math.max(W / aspect, Hh);
    return { dW: dH * aspect, dH, px: focusX(), py: focusY() };
  }
  // screen → film, the inverse of toScreen: x and y as fractions of the frame
  function fromScreen(sx, sy, t) {
    const W = frameBox.width, Hh = frameBox.height, { dW, dH, px, py } = displayed();
    let lx = sx - frameBox.left;
    if (MIRROR) lx = W - lx;
    return [cropLeft(t) + (lx + px * (dW - W)) / dW * cropOf().width, (sy - frameBox.top + py * (dH - Hh)) / dH];
  }
  function toScreen(fx, fy, t) {
    const W = frameBox.width, Hh = frameBox.height;
    let lx, ly;
    if (stillMode && narrow) {
      // reduced motion on phones: a 16:9 still covers the band (see showStill)
      const k = Math.max(W / 16, Hh / 9), sW = 16 * k, sH = 9 * k;
      lx = fx * sW - stillPosX * (sW - W); ly = fy * sH - focusY() * (sH - Hh);
    } else {
      const x = (fx - cropLeft(t)) / cropOf().width;
      const { dW, dH, px, py } = displayed();
      lx = x * dW - px * (dW - W); ly = fy * dH - py * (dH - Hh);
    }
    if (MIRROR) lx = W - lx;   // a mirrored film (FILM.mirror) is flipped about its box's centre, and every overlay with it
    return [frameBox.left + lx, frameBox.top + ly];
  }
  const unit = () => { const { dW } = displayed(); return dW / cropOf().width / 100; };
  // the part of the frame where the sky's figures may sit, in film coordinates
  function safe(t) {
    const { dW, dH, py } = displayed();
    const left = cropLeft(t), w = cropOf().width;
    if (!narrow) {
      // the film's open part: right of the words, under the bar, above the rail
      const a = fromScreen(sharpX + 8, barH + 8, t), b = fromScreen(frameBox.left + frameBox.width - 8, vh - reserve - 12, t);
      return { x0: Math.max(left + .02, Math.min(a[0], b[0])), x1: Math.min(left + w - .02, Math.max(a[0], b[0])), y0: Math.max(.06, a[1]), y1: Math.min(1 - (reserve + 12) / frameBox.height, b[1]) };
    }
    const top = py * (dH - frameBox.height) / dH, bot = top + frameBox.height / dH;
    return { x0: left + .02, x1: left + w - .02, y0: top + (BAND.top + 2) / dH, y1: bot - (BAND.bottom + 4) / dH };
  }
  // where the words may go, in canvas pixels: on wide screens the film's open part, right of the words and under the bar
  function noteArea() {
    if (!narrow) {
      const x = Math.max(10, sharpX - frameBox.left + 10), y = Math.max(10, barH + 8 - frameBox.top);
      return { x, y, w: frameBox.width - x - 10, h: frameBox.height - reserve - 10 - y };
    }
    return { x: 8, y: BAND.top, w: frameBox.width - 16, h: frameBox.height - BAND.top - BAND.bottom };
  }

  /* ---------------- Two copies of the film: every moment between two frames ----------------
     The film has 24 frames a second, and a scroll asks for every moment in between. Two copies sit
     on top of each other, one on frame k, one on frame k + 1, and the top copy's opacity is the
     fraction between them. When the climb moves on, only the copy that is no longer needed seeks,
     while it is hidden. If seeks turn out slow (some browsers), one copy does the work alone. */
  const rvfc = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
  const layers = vids.map(el => ({ el, req: -1, painted: -1, pending: false, next: -1, t0: 0, guard: 0, seekedAt: 0, ms: [] }));
  const L0 = layers[0], L1 = layers[1] || null;
  let blend = !!L1 && !narrow && !/[?&]noblend\b/.test(location.search);   // phones decode one layer; desktop blends adjacent frames
  let lastFrame = Math.max(1, Math.round(FILM.referenceDuration * fps) - 1);
  let topOpacity = 0, topShown = -1, tD = 0;   // tD: the moment on screen; the sky, hotspots and rail follow it
  const stats = { seeks: 0, total: 0, max: 0, samples: [], blend };
  const firstSeeks = [];
  const frameTime = j => (j + .5) / fps;   // the middle of frame j, safe against rounding

  function seekLayer(L, j) {
    if (L.pending) { L.next = j; return; }   // one seek at a time per copy; the latest wish waits
    if (L.req === j) return;                 // there already, or about to be painted
    L.req = j; L.next = -1; L.pending = true; L.t0 = performance.now();
    clearTimeout(L.guard);
    L.guard = setTimeout(() => { if (L.pending) { L.pending = false; L.req = -1; } }, 600);   // never wait forever on a lost 'seeked'
    if (FILM.allIntra && typeof L.el.fastSeek === 'function') L.el.fastSeek(frameTime(j));
    else L.el.currentTime = frameTime(j);
  }
  // The first twenty seeks decide: blending stays on while seeks are fast.
  function judge(ms) {
    if (!blend || firstSeeks.length >= 20) return;
    firstSeeks.push(ms);
    if (firstSeeks.length < 20) return;
    const median = firstSeeks.slice().sort((a, b) => a - b)[10];
    if (median > 30) { blend = false; stats.blend = false; if (L1) L1.el.style.opacity = '0'; topShown = 0; }
  }
  layers.forEach(L => {
    L.el.addEventListener('seeked', () => {
      const ms = performance.now() - L.t0;
      clearTimeout(L.guard);
      L.pending = false;
      L.seekedAt = performance.now();
      if (!rvfc) L.painted = L.req;
      stats.seeks++; stats.total += ms; stats.max = Math.max(stats.max, ms);
      if (stats.samples.length < 400) stats.samples.push(+ms.toFixed(1));
      if (L.ms.length < 400) L.ms.push(ms);
      judge(ms);
      if (L.next >= 0) { const j = L.next; L.next = -1; seekLayer(L, j); }
    });
    // The frame each copy actually shows (it reaches the screen a display frame after the seek).
    if (rvfc) {
      const painted = (now, md) => { L.painted = Math.round(md.mediaTime * fps); L.el.requestVideoFrameCallback(painted); };
      L.el.requestVideoFrameCallback(painted);
    }
  });

  // f: the wanted moment, in frames (continuous)
  function present(f) {
    f = clamp(f, 0, lastFrame);
    if (!blend) {
      seekLayer(L0, Math.round(f));
      topOpacity = 0;
      tD = (L0.painted >= 0 ? L0.painted : Math.round(f)) / fps;
      return;
    }
    const k = Math.min(Math.floor(f), lastFrame - 1);
    const h0 = L0.pending ? L0.req : L0.painted, h1 = L1.pending ? L1.req : L1.painted;
    // the copy that already holds one of the two frames keeps it; the other one moves
    let swap;
    if (h0 === k || h1 === k + 1) swap = false;
    else if (h1 === k || h0 === k + 1) swap = true;
    else swap = Math.abs(h0 - k - 1) + Math.abs(h1 - k) < Math.abs(h0 - k) + Math.abs(h1 - k - 1);
    seekLayer(L0, swap ? k + 1 : k);
    seekLayer(L1, swap ? k : k + 1);
    const now = performance.now();
    for (const L of layers) if (!L.pending && L.req >= 0 && L.painted !== L.req && now - L.seekedAt > 80) L.painted = L.req;   // a missed callback
    // what is on screen, and the top opacity that puts their blend exactly at f
    const p0 = L0.painted, p1 = L1.painted;
    if (p0 < 0 && p1 < 0) { topOpacity = 0; tD = f / fps; return; }
    let o;
    if (p1 < 0) o = 0;
    else if (p0 < 0) o = 1;
    else if (p1 === p0) o = 0;
    else if (Math.abs(p1 - p0) === 1) o = clamp((f - p0) / (p1 - p0));
    else o = Math.abs(f - p1) < Math.abs(f - p0) ? 1 : 0;   // frames further apart are never mixed: no ghosts
    topOpacity = o;
    tD = ((p0 < 0 ? p1 : p0) * (1 - o) + (p1 < 0 ? p0 : p1) * o) / fps;
  }
  function paintTop() {
    if (!L1 || !blend) return;
    const o = topOpacity;
    if (Math.abs(o - topShown) < .0015 && (o > 0 || topShown === 0) && (o < 1 || topShown === 1)) return;
    topShown = o;
    L1.el.style.opacity = o.toFixed(4);
  }

  /* ---------------- Loading the film whole, so every seek is local ---------------- */
  let ready = false, loadedSrc = '', objectURL = '', loadRequest = 0, loadController = null;
  let filmFailed = false;

  function setLoading(p) {
    doc.classList.toggle('loading', p < 1);
    if (hintBar) hintBar.style.setProperty('--load', p.toFixed(3));
    if (hintText) hintText.textContent = p < 1 ? `Developing the film · ${Math.round(p * 100)}%` : '';
    positionHint();
  }

  async function fetchWhole(url, signal, isCurrent) {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const total = +res.headers.get('content-length') || 0;
    if (!res.body || !total) return res.blob();
    const reader = res.body.getReader();
    const parts = []; let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value); got += value.length;
      if (isCurrent()) setLoading(Math.min(.99, got / total));
    }
    return new Blob(parts, { type: 'video/mp4' });
  }

  // Every media wait settles, including unsupported codecs, interrupted loads and offline use.
  function waitForMedia(el, type, signal, timeout = 12000) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        el.removeEventListener(type, success);
        el.removeEventListener('error', failure);
        signal.removeEventListener('abort', abort);
      };
      const success = () => { cleanup(); resolve(); };
      const failure = () => { cleanup(); reject(new Error('Film could not be decoded')); };
      const abort = () => { cleanup(); reject(new DOMException('Superseded film load', 'AbortError')); };
      const timer = setTimeout(() => { cleanup(); reject(new Error('Film loading timed out')); }, timeout);
      el.addEventListener(type, success, { once: true });
      el.addEventListener('error', failure, { once: true });
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
      else if (el.error) failure();
    });
  }

  async function loadFilm() {
    doc.classList.toggle('sky-only', skyOnly());
    if (skyOnly()) { setLoading(1); return; }   // phones: the film is never fetched; the sky runs on the scroll alone
    const src = narrow && FILM.portraitSrc ? FILM.portraitSrc : FILM.src;
    if (src === loadedSrc) return;
    const request = ++loadRequest;
    if (loadController) loadController.abort();
    loadController = new AbortController();
    const { signal } = loadController;
    const isCurrent = () => request === loadRequest && !signal.aborted;
    loadedSrc = src;
    ready = false;
    filmFailed = false;
    doc.classList.remove('film-ready', 'film-failed');
    blend = !!L1 && !narrow && !/[?&]noblend\b/.test(location.search);
    stats.blend = blend;
    firstSeeks.length = 0;
    const activeLayers = blend ? layers : [L0];
    if (L1 && !blend) {
      L1.el.pause();
      L1.el.removeAttribute('src');
      L1.el.load();
      L1.el.style.opacity = '0';
    }
    setLoading(0);
    let url = src;
    const fetchDeadline = setTimeout(() => loadController && request === loadRequest && loadController.abort(), 20000);
    try {
      const blob = await fetchWhole(src, signal, isCurrent);
      if (!isCurrent()) return;
      if (objectURL) URL.revokeObjectURL(objectURL);
      objectURL = url = URL.createObjectURL(blob);
    } catch (e) {
      if (request !== loadRequest) return;
      if (signal.aborted) {
        filmFailed = true;
        doc.classList.add('film-failed');
        setLoading(1);
        return;
      }
      // Fall back to streaming from the server; seeking still works, a little less smoothly.
      if (debug) console.warn('film: streaming fallback', e);
    } finally {
      clearTimeout(fetchDeadline);
    }
    if (!isCurrent()) return;
    try {
      await Promise.all(activeLayers.map(async L => {
        clearTimeout(L.guard);
        Object.assign(L, { req: -1, painted: -1, pending: false, next: -1 });
        L.el.src = url;
        L.el.load();
        if (L.el.readyState < 1) await waitForMedia(L.el, 'loadedmetadata', signal);
      }));
      if (!isCurrent()) return;
      const v = L0.el;
      const d = isFinite(v.duration) && v.duration > 0 ? v.duration : FILM.referenceDuration;
      lastFrame = Math.max(1, Math.round(d * fps) - 1);
      if (Math.abs(d - duration) > 1e-3) { duration = d; mapTimes(); if (SKY) SKY.rebuild(); }
      // Muted inline playback primes iOS decoding; do not wait forever for autoplay permission.
      await Promise.all(activeLayers.map(async L => {
        try {
          await Promise.race([L.el.play(), new Promise(r => setTimeout(r, 1200))]);
        } catch (e) { /* the poster remains if this browser cannot decode a seeked frame */ }
        if (isCurrent()) L.el.pause();
      }));
      if (!isCurrent()) return;
      cur = timeAt(scrollY); vel = 0;
      const firstFrame = waitForMedia(L0.el, 'seeked', signal);
      present(clamp(cur - roll, 0, endT) * fps);
      await firstFrame;
      if (!isCurrent()) return;
      if (v.readyState < 2 || !v.videoWidth) throw new Error('No decoded film frame');
      ready = true;
      setLoading(1);
      doc.classList.add('film-ready');
      if (L1 && blend) { L1.el.style.opacity = '0.02'; topShown = .02; }
      kick();
    } catch (e) {
      if (request !== loadRequest) return;
      filmFailed = true;
      activeLayers.forEach(L => L.el.pause());
      doc.classList.remove('film-ready');
      doc.classList.add('film-failed');
      setLoading(1);
      if (debug) console.warn('film: keeping the poster', e);
    }
  }

  /* ---------------- Checkpoints: saved in sequence ---------------- */
  const saved = new Set([0]);
  function floorAt(t) {
    let f = 0;
    saved.forEach(i => { if (T[i] <= t + 1e-3 && T[i] > f) f = T[i]; });
    return f;
  }
  function checkpoint(target) {
    const i = stationAt(target);
    if (saved.has(i) || target < T[i] - .02) return;
    saved.add(i);
    const stop = railEl && railEl.querySelector(`.rail-stop[data-i="${i}"]`);
    if (stop) { stop.classList.add('saved', 'just'); setTimeout(() => stop.classList.remove('just'), 1400); stop.querySelector('button').setAttribute('aria-label', stopLabel(i)); }
    if (SKY && booted) SKY.flash();
  }

  /* ---------------- The idle slip: the film rolls back, never past a checkpoint ---------------- */
  const CAPTIONS = [
    ['every unautomated Monday…', ''],
    ['“One always finds one’s burden again.”', 'Albert Camus'],
    ['the documented process says this can’t happen.', ''],
    ['fine. let’s automate this.', 'it won’t happen again'],
  ];
  let lastActive = performance.now(), slipArmed = true, slips = 0, rolling = false, rollT0 = 0, roll = 0, slipBack = 0;
  let previewT = null;   // version 15: hovered or focused words ease the film to their moment (the page stays put)

  function activity() {
    lastActive = performance.now();
    slipArmed = true;
    if (rolling) { rolling = false; slipEl.classList.remove('on'); }
    kick();
  }
  function canSlip() {
    if (stillMode || !ready || slips >= CAPTIONS.length || rolling || !slipArmed || document.hidden) return false;
    if (drag || pushing || easing || inertia || railDrag || previewT !== null) return false;
    const p = scrollY / maxScroll;
    if (p < .02 || p > .96) return false;
    return cur - floorAt(cur) > .22;
  }
  // Captions sit in the film's quiet sky, top left; the words of the sky keep clear of them.
  const captionRects = new Map();
  function placeCaption(el) {
    const w = el.offsetWidth, h = el.offsetHeight;
    const area = noteArea();
    let left, top;
    if (narrow) { left = vw / 2 - w / 2; top = bandTop + BAND.top + 4; }
    else { left = frameBox.left + area.x + 8; top = frameBox.top + frameBox.height * .16; }
    left = Math.round(clamp(left, 12, vw - w - 12)); top = Math.round(clamp(top, barH + 8, vh - h - reserve - 8));
    el.style.transform = `translate(${left}px, ${top}px)`;
    captionRects.set(el, { x: left - frameBox.left, y: top - frameBox.top, w, h });
  }
  const captionRect = () => [...captionRects].filter(([el]) => el.classList.contains('on')).map(([, r]) => r);
  setInterval(() => {
    if (performance.now() - lastActive < FILM.slip.idle || !canSlip()) return;
    slipArmed = false;
    rolling = true;
    rollT0 = performance.now();
    const room = cur - floorAt(cur) - .02;
    slipBack = Math.min(FILM.slip.back, room);
    const [text, small] = CAPTIONS[slips++];
    const limited = slipBack < FILM.slip.back - .01;
    slipEl.innerHTML = text + (limited ? '<small>saved in sequence · it stops at the checkpoint</small>' : small ? `<small>${small}</small>` : '');
    slipEl.style.textAlign = narrow ? 'center' : 'left';
    placeCaption(slipEl);
    slipEl.classList.add('on');
    kick();
  }, 250);

  let sayTimer = 0;
  function say(text, small) {
    if (!sayEl) return;
    sayEl.innerHTML = text + (small ? `<small>${small}</small>` : '');
    if (slipEl.classList.contains('on')) slipEl.classList.remove('on');
    sayEl.style.textAlign = narrow ? 'center' : 'left';
    placeCaption(sayEl);
    sayEl.classList.add('on');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => sayEl.classList.remove('on'), 2600);
  }

  /* ---------------- Hint: “developing the film”, then how to move ---------------- */
  function positionHint() {
    if (!hintEl) return;
    // in the film's quiet sky, where the captions appear later
    const w = hintEl.offsetWidth;
    // phones: inside the film band, top left under the rail, so it never covers text
    const x = narrow ? 12 : sharpX + 18;
    const y = narrow ? bandTop + BAND.top + 2 : frameBox.top + frameBox.height * .16;
    const left = Math.round(clamp(x, 12, vw - w - 12)), top = Math.round(y);
    hintEl.style.transform = `translate(${left}px, ${top}px)`;
    hintR = { x: left - frameBox.left - 6, y: top - frameBox.top - 6, w: w + 12, h: hintEl.offsetHeight + 12 };
  }
  let hintR = null;

  /* ---------------- Dragging the film, inertia, holding the boulder ---------------- */
  let drag = null, inertia = 0, inertiaT = 0, pushing = false, push = null, easing = null, holdTimer = 0, railDrag = false, pushP = -1;
  const pointer = { x: -1e4, y: -1e4, on: false, down: false, touch: false };

  function cancelAuto() { inertia = 0; easing = null; }
  // a running glide (wheel or station jump) stops where it is
  function holdStill() { if (lenis) lenis.scrollTo(window.scrollY, { immediate: true, force: true }); }
  function placeTouch() {
    if (!touchEl) return;
    if (portraitMode()) {
      touchEl.style.cssText = 'display:none';
      touchRect = null;
      return;
    }
    const left = narrow ? 0 : Math.max(frameBox.left, colRight + 16);   // drag anywhere right of the words
    const top = narrow ? bandTop : Math.max(frameBox.top, barH);
    touchEl.style.cssText = `left:${left}px;top:${top}px;width:${Math.max(0, vw - left)}px;height:${Math.max(0, vh - top)}px`;
    touchRect = { left, top, right: vw, bottom: vh };
  }
  const inFilm = (x, y) => !!touchRect && x >= touchRect.left && x <= touchRect.right && y >= touchRect.top && y <= touchRect.bottom;
  addEventListener('pointermove', e => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.touch = e.pointerType !== 'mouse';
    const over = inFilm(e.clientX, e.clientY);
    pointer.on = over;
    doc.classList.toggle('film-hover', over && e.pointerType === 'mouse');
  }, { passive: true });
  doc.addEventListener('pointerleave', () => { pointer.on = false; doc.classList.remove('film-hover'); });

  if (touchEl) {
    touchEl.addEventListener('pointerdown', e => {
      if (e.button !== 0 || stillMode) return;
      cancelAuto(); holdStill();
      pointer.on = true; pointer.down = true; pointer.x = e.clientX; pointer.y = e.clientY; pointer.touch = e.pointerType !== 'mouse';
      drag = { id: e.pointerId, x0: e.clientX, t0: timeAt(scrollY), t: timeAt(scrollY), lastX: e.clientX, lastT: performance.now(), v: 0, moved: false };
      try { touchEl.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    });
    touchEl.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) < 5) return;
      drag.moved = true;
      doc.classList.add('dragging');
      const spp = FILM.drag.secondsPerWidth * duration / FILM.referenceDuration / Math.max(240, frameBox.width);
      // the camera travels right (left, mirrored), so pulling the scene against it moves the climb forward
      drag.t = clamp(drag.t0 - DIR * dx * spp, 0, endT);
      instant(scrollAt(drag.t));
      const now = performance.now(), dtm = Math.max(1, now - drag.lastT);
      drag.v = lerp(drag.v, -DIR * (e.clientX - drag.lastX) * spp / dtm * 1000, .35);   // film seconds per second
      drag.lastX = e.clientX; drag.lastT = now;
      activity();
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved && performance.now() - drag.lastT < 90 && Math.abs(drag.v) > .25) { inertia = clamp(drag.v, -5, 5); inertiaT = drag.t; }
      drag = null;
      pointer.down = false;
      if (e.pointerType !== 'mouse') pointer.on = false;
      doc.classList.remove('dragging');
      kick();
    };
    touchEl.addEventListener('pointerup', end);
    touchEl.addEventListener('pointercancel', end);
    touchEl.addEventListener('lostpointercapture', end);
  }
  ['wheel', 'keydown', 'touchstart'].forEach(type => addEventListener(type, e => {
    if (type === 'touchstart' && e.target.closest && e.target.closest('.film-touch, .spot, .rail')) return;
    cancelAuto();
  }, { passive: true }));

  function pushStart() {
    if (pushing || stillMode || !ready) return;
    cancelAuto(); holdStill();
    pushing = true;
    push = { t: timeAt(scrollY), held: 0 };
    doc.classList.add('pushing');
    spotHover = null; showTip(null);
    say('Hold, and push.', 'let go, and it rolls back to the last checkpoint');
    kick();
  }
  function pushEnd() {
    if (!pushing) return;
    pushing = false;
    doc.classList.remove('pushing');
    const t = push.t, floor = floorAt(t);
    if (t - floor > .08 && t < endT - .02) {
      easing = { from: scrollY, to: scrollAt(floor), t0: performance.now(), dur: FILM.push.back };
      const i = T.indexOf(floor);
      say('Saved in sequence.', `back to checkpoint ${stations[Math.max(0, i)].dataset.station}`);
    }
    kick();
  }

  function driveScroll(now, dt) {
    if (inertia) {
      inertiaT = clamp(inertiaT + inertia * dt, 0, endT);
      inertia *= Math.exp(-dt * FILM.drag.friction);
      if (Math.abs(inertia) < .05 || inertiaT <= 0 || inertiaT >= endT) inertia = 0;
      instant(scrollAt(inertiaT));
    }
    pushP = -1;
    if (pushing) {
      push.held += dt;
      // effort comes in steps
      const sp = FILM.push.speed * smooth(0, FILM.push.ramp, push.held) * (.55 + .45 * Math.abs(Math.sin(push.held * 3.4)));
      push.t = Math.min(endT, push.t + sp * dt);
      instant(scrollAt(push.t));
      const i = stationAt(push.t), f = floorAt(push.t), nx = i + 1 < T.length ? T[i + 1] : endT;
      pushP = clamp((push.t - f) / Math.max(.05, nx - f));
    }
    if (easing) {
      const p = clamp((now - easing.t0) / easing.dur);
      instant(lerp(easing.from, easing.to, easeInOut(p)));
      if (p >= 1) easing = null;
    }
  }

  /* ---------------- Hotspots: things in the film you can ask about ---------------- */
  const spots = {};
  const stationName = key => { const el = stations[keys.indexOf(key)]; return el ? `${el.dataset.station} · ${el.dataset.name}` : key; };
  let spotHover = null;
  function buildSpots() {
    if (!spotsEl) return;
    (FILM.hotspots || []).forEach(h => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `spot spot-${h.id}${h.push ? ' spot-push' : ''}`;
      b.innerHTML = '<i></i>';
      b.tabIndex = h.push ? 0 : -1;
      b.setAttribute('aria-label', h.push ? `${h.title}. Enter: go to ${stationName(h.go)}. Hold Space: push the climb.` : `${h.title}: ${h.line} Go to ${stationName(h.go)}.`);
      spotsEl.appendChild(b);
      const s = { ...h, el: b, on: false, touch: false, x: 0, y: 0, d: 34 };
      spots[h.id] = s;
      // on a touch screen there is no hover: the first tap tells what it is, the second one goes
      let tipUntil = 0;
      const go = () => {
        if (s.touch && performance.now() > tipUntil) { tipUntil = performance.now() + 2600; spotHover = s; showSpotTip(s); setTimeout(() => { if (spotHover === s) { spotHover = null; showTip(null); } }, 2600); return; }
        spotHover = null; showTip(null);
        jumpTo(h.go);
      };
      b.addEventListener('pointerdown', e => { s.touch = e.pointerType !== 'mouse'; }, true);
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { spotHover = s; showSpotTip(s); } });
      b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && spotHover === s) { spotHover = null; showTip(null); } });
      b.addEventListener('focus', () => { spotHover = s; showSpotTip(s); });
      b.addEventListener('blur', () => { if (spotHover === s) { spotHover = null; showTip(null); } });
      b.addEventListener('contextmenu', e => e.preventDefault());
      if (!h.push) { b.addEventListener('click', go); return; }
      // the boulder: a click jumps, a long press pushes
      let pressed = false;
      b.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        pressed = true;
        try { b.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => { holdTimer = 0; pushStart(); }, FILM.push.hold);
      });
      const release = () => {
        if (!pressed) return;
        pressed = false;
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = 0; go(); }
        else pushEnd();
      };
      b.addEventListener('pointerup', release);
      b.addEventListener('pointercancel', () => { pressed = false; clearTimeout(holdTimer); holdTimer = 0; pushEnd(); });
      b.addEventListener('click', e => { if (e.detail === 0) { s.touch = false; go(); } });   // Enter on the keyboard
      b.addEventListener('keydown', e => { if (e.key === ' ') { e.preventDefault(); if (!e.repeat) pushStart(); } });
      b.addEventListener('keyup', e => { if (e.key === ' ') { e.preventDefault(); pushEnd(); } });
    });
  }
  function placeSpots(t) {
    const area = noteArea();
    for (const id in spots) {
      const s = spots[id], p = at(s.track, t);
      let on = !!p && vis(s.track, t) > .5 && (s.from === undefined || t >= scaled(s.from)) && (s.to === undefined || t <= scaled(s.to));
      let x = 0, y = 0;
      if (on) {
        [x, y] = toScreen(p[0] + (s.dx || 0), p[1], t);
        const cx = x - frameBox.left, cy = y - frameBox.top;
        on = cx >= area.x && cx <= area.x + area.w && cy >= area.y && cy <= area.y + area.h + 10;
      }
      if (on) {
        if (s.push) {
          const d = Math.max(34, 2 * FILM.sphereR * unit() * 100);
          if (Math.abs(d - s.d) > .5) {
            s.d = d;
            s.el.style.width = s.el.style.height = `${d.toFixed(0)}px`;
            s.el.style.margin = `${(-d / 2).toFixed(0)}px 0 0 ${(-d / 2).toFixed(0)}px`;
          }
        }
        s.x = x; s.y = y;
        s.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
        if (spotHover === s) showSpotTip(s);
      }
      if (on !== s.on) { s.on = on; s.el.classList.toggle('on', on); if (!on && spotHover === s) { spotHover = null; showTip(null); } }
    }
  }
  function jumpTo(key) {
    const i = keys.indexOf(key);
    if (i < 0) return;
    cancelAuto();
    scrollToY(S[i] + 2, true);
  }

  /* ---------------- Tooltip ---------------- */
  let tipHTML = '', tipW = 0, tipH = 0, tipOn = false;
  function showTip(c, x, y) {
    if (!tipEl) return;
    if (!c) { if (tipOn) { tipEl.classList.remove('on'); tipOn = false; } return; }
    const html = `<b>${c.title}</b>${c.line}${c.hint ? `<small>${c.hint}</small>` : ''}`;
    // measured only when the words change, never every frame
    if (html !== tipHTML) { tipEl.innerHTML = html; tipHTML = html; tipW = tipEl.offsetWidth; tipH = tipEl.offsetHeight; }
    const left = clamp(x - tipW / 2, 8, vw - tipW - 8), top = Math.max(barH + 6, y - tipH - 12);
    tipEl.style.transform = `translate3d(${left.toFixed(2)}px,${top.toFixed(2)}px,0)`;
    if (!tipOn) { tipEl.classList.add('on'); tipOn = true; }
  }
  function showSpotTip(s) {
    const hint = (s.hint || 'Click to go there').replace(/^Click/, s.touch ? 'Tap again' : 'Click');
    showTip({ title: s.title, line: s.line, hint }, s.x, s.y - s.d / 2 + 4);
  }

  /* ---------------- The climb rail: stations, checkpoints, scrubbing ---------------- */
  const stopLabel = i => `Go to ${stations[i].dataset.station} · ${stations[i].dataset.name}${saved.has(i) ? ' — checkpoint saved' : ''}`;
  function buildRail() {
    if (!railEl) return;
    const list = $('.rail-stops', railEl);
    stations.forEach((el, i) => {
      const li = document.createElement('li');
      li.className = 'rail-stop' + (saved.has(i) ? ' saved' : '');
      li.dataset.i = i;
      li.innerHTML = `<button type="button" aria-label="${stopLabel(i)}"><i></i></button><span class="rail-lbl" aria-hidden="true">${el.dataset.station} · ${el.dataset.name}</span>`;
      li.querySelector('button').addEventListener('click', () => jumpTo(el.dataset.key));
      list.appendChild(li);
    });
    const track = $('.rail-track', railEl);
    let id = null;
    const scrub = e => {
      const r = track.getBoundingClientRect();
      instant(scrollAt(clamp((e.clientX - r.left) / r.width) * endT));
      activity();
    };
    track.addEventListener('pointerdown', e => { if (e.button !== 0) return; cancelAuto(); holdStill(); id = e.pointerId; railDrag = true; try { track.setPointerCapture(id); } catch (err) { /* gone */ } scrub(e); });
    track.addEventListener('pointermove', e => { if (e.pointerId === id) scrub(e); });
    const up = e => { if (e.pointerId === id) { id = null; railDrag = false; } };
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
  }
  function placeRail() {
    if (!railEl) return;
    const left = narrow ? 18 : sharpX + 22;   // wide screens: along the bottom of the film's open part
    const right = narrow ? 18 : 24;
    railEl.style.setProperty('--rail-l', `${left}px`);
    // phones: at the top of the film band, just under its fade (measured, so it holds whatever the viewport units do)
    if (narrow) railEl.style.setProperty('--rail-top', `${(bandTop + BAND.rail).toFixed(1)}px`); else railEl.style.removeProperty('--rail-top');
    railEl.style.setProperty('--rail-w', `${Math.max(120, vw - left - right)}px`);
    $$('.rail-stop', railEl).forEach((li, i) => li.style.setProperty('--x', `${(T[i] / Math.max(.001, endT) * 100).toFixed(2)}%`));
  }
  let lastRailP = -1;
  function updateRail(t) {
    if (!railEl) return;
    const p = clamp(t / Math.max(.001, endT));
    if (Math.abs(p - lastRailP) < .0002) return;
    lastRailP = p;
    railEl.style.setProperty('--p', p.toFixed(5));
  }

  /* ---------------- Version 17: the lift ----------------
     The readout rolls to the floor you are on like an elevator's counter (up as you climb, down as you go back) and
     its name rises in. The panel lights the section you are in; on the roof the call button's boulder has arrived. */
  function liftTo(i, prev) {
    const el = stations[i];
    navFloors.forEach(({ a, f0, f1 }) => a.classList.toggle('on', i >= f0 && i <= f1));
    if (writeBtn) writeBtn.classList.toggle('on', i === stations.length - 1);
    altStation.textContent = el.dataset.name;
    if (!liftRoll) return;
    const old = liftRoll.lastElementChild, b = document.createElement('b');
    b.textContent = el.dataset.station;
    liftRoll.appendChild(b);
    if (!old || prev < 0 || reduced.matches) { if (old) old.remove(); return; }
    const d = i > prev ? 1 : -1, easing = 'cubic-bezier(.65,0,.35,1)';
    old.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-110 * d}%)` }], { duration: 560, easing, fill: 'forwards' }).finished.then(() => old.remove(), () => old.remove());
    b.animate([{ transform: `translateY(${110 * d}%)` }, { transform: 'translateY(0)' }], { duration: 560, easing });
    altStation.animate([{ opacity: 0, transform: `translateY(${7 * d}px)` }, { opacity: 1, transform: 'none' }], { duration: 480, easing, delay: 90, fill: 'backwards' });
  }
  // the boulder in the call button turns with the climb on screen (and back, when the climb slips)
  let climbShown = -1;
  function turnBoulder(t) {
    if (!writeBtn) return;
    const c = clamp(t / Math.max(.001, endT));
    if (Math.abs(c - climbShown) < .0015) return;
    climbShown = c;
    writeBtn.style.setProperty('--climb', c.toFixed(4));
  }

  /* ---------------- Status line: the current station ---------------- */
  let lastStation = -1;
  function updateStatus(t, y) {
    let i = 0;
    while (i < stations.length - 1 && y >= S[i + 1] - 1) i++;
    if (i !== lastStation) {
      const prevStation = lastStation;
      lastStation = i;
      liftTo(i, prevStation);
      stations.forEach((el, j) => el.classList.toggle('is-active', j === i));   // the floor you are on: its level tag turns red
    }
  }

  /* ---------------- The one loop ---------------- */
  let running = false, lastT = 0, summitOn = false, booted = false;
  let cur = 0, vel = 0;   // the film's moment (seconds) and its speed: a critically damped spring follows the scroll
  function spring(target, dt, smoothTime) {
    const omega = 2 / smoothTime, x = omega * dt, e = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
    const maxChange = MOTION.maxSpeed * smoothTime;
    const change = clamp(cur - target, -maxChange, maxChange);
    const temp = (vel + omega * change) * dt;
    vel = (vel - omega * temp) * e;
    let out = cur - change + (change + temp) * e;
    if ((target - cur > 0) === (out > target)) { out = target; vel = 0; }   // never overshoot the scroll
    cur = out;
    if (Math.abs(target - cur) < 1e-4 && Math.abs(vel) < 1e-3) { cur = target; vel = 0; }
  }
  function frame(now) {
    const dt = clamp((now - lastT) / 1000, .001, .05);
    lastT = now;
    if (lenis) lenis.raf(now);
    driveScroll(now, dt);
    // the only read: the scroll position (boxes are measured on layout, never while scrolling)
    const y = scrollY;

    // Resize only between gestures; drag and rail scrubbing retain one coordinate map throughout.
    if (narrow && !drag && !railDrag && !pushing && !inertia && !easing && syncMobileFilm(y)) layout();

    const target = timeAt(y);
    // hovered words may ask for their own moment; checkpoints still follow the scroll
    const fast = drag || inertia || pushing || easing || railDrag;
    if (fast && previewT !== null) previewT = null;
    spring(previewT !== null ? previewT : target, dt, fast ? MOTION.springFast : MOTION.spring);
    if (booted) checkpoint(target);
    if (rolling) roll = slipBack * easeInOut(clamp((now - rollT0) / FILM.slip.duration));
    else { roll += -roll * (1 - Math.exp(-dt * 4)); if (roll < .002) roll = 0; }
    const shown = clamp(cur - roll, 0, endT);
    if (ready) present(shown * fps);
    const tp = ready ? tD : skyOnly() ? shown : 0;   // the sky and the hotspots follow the moment on screen (phones: the scroll's moment)

    // writes
    paintTop();
    clipUnderBar(y);
    if (pushP >= 0 && spots.sphere) spots.sphere.el.style.setProperty('--p', pushP.toFixed(3));
    // the summit: the last frame holds and the brand's × turns once
    const atTop = y >= maxScroll - 8 && Math.abs(target - cur) < .05 && previewT === null;
    if (atTop && !summitOn) {
      summitOn = true;
      markX.classList.remove('spin'); requestAnimationFrame(() => markX.classList.add('spin'));
    } else if (summitOn && y < maxScroll - 90) summitOn = false;
    updateStatus(shown, y);
    if (LEFT) LEFT.update(y + readingTop, readH, portraitMode(), narrow);
    updateRail(tp);
    turnBoulder(tp);
    if (!narrow) placeSpots(tp);
    if (SKY && !filmCompact) SKY.frame(tp, now);
    if (TETH && !narrow && !filmCompact) TETH.frame(y, tp, now);
    hintEl.classList.toggle('on', !ready && !filmFailed && !skyOnly() && doc.classList.contains('is-in'));

    if (document.hidden) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function kick() {
    if (stillMode) { updateStatusStill(); return; }
    if (running || document.hidden) return;
    running = true;
    lastT = performance.now();
    requestAnimationFrame(frame);
  }
  function updateStatusStill() {
    const y = scrollY;
    if (syncMobileFilm(y)) layout();
    clipUnderBar(y);
    updateStatus(clamp(y / maxScroll) * endT, y);
    if (LEFT) LEFT.update(y + readingTop, readH, true, narrow);   // reduced motion: everything joined
    const t = showStill(Math.max(0, lastStation));
    if (narrow) drawStills();
    if (TETH && !narrow && !filmCompact) TETH.frame(y, t, performance.now());
  }
  /* Reduced motion (version 15): the film's frame stays, as stills. Each floor shows the still nearest its moment
     (FILM.stillFor), with the sky's flat figure over it on wide screens, and its tethers drawn at once. */
  let stillShown = -1, stillPosX = .5;
  const posterImg = $('.film-poster');
  function showStill(i) {
    const map = FILM.stillFor || [0, 1, 1, 2, 2, 2, 3, 3];
    const k = map[Math.min(i, map.length - 1)], t = FILM.stills[k] * FILM.referenceDuration;
    if (k !== stillShown && posterImg) {
      stillShown = k;
      const src = posterImg.closest('picture') && posterImg.closest('picture').querySelector('source');
      if (src) src.remove();   // phones too show the whole frame, cropped by the band
      posterImg.src = portraitMode() && FILM.portraitStills ? `${FILM.portraitStills}${k + 1}.jpg` : !narrow && FILM.halfStills ? `${FILM.halfStills}${k + 1}.jpg` : `video/woman-still-${k + 1}.jpg`;
      if (portraitMode()) {
        posterImg.style.objectPosition = `50% ${focusY() * 100}%`;
      } else if (narrow) {
        // the band keeps the climb in view, as the moving band does
        const W = frameBox.width, Hh = frameBox.height, sW = 16 * Math.max(W / 16, Hh / 9);
        const c = FILM.portraitCrop, centre = lerp(c.from, c.to, clamp(t / FILM.referenceDuration)), w = W / sW;
        stillPosX = clamp((centre - w / 2) / Math.max(1e-3, 1 - w));
        posterImg.style.objectPosition = `${(stillPosX * 100).toFixed(2)}% ${focusY() * 100}%`;
      } else posterImg.style.objectPosition = '';
      drawStills();
    }
    return t;
  }

  /* ---------------- Anchor links glide too (with Lenis); keyboard users land where they point ---------------- */
  if (lenis) document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    cancelAuto();
    scrollToY(clamp(el.getBoundingClientRect().top + scrollY - ((portraitMode() ? readingTop : barH) + 12), 0, maxScroll), true);
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    if (e.detail === 0 || a.classList.contains('skip')) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  });

  /* ---------------- Reduced motion: the flat figures drawn once over each still ---------------- */
  function drawStills() {
    if (!SKY) return;
    // the flat figure over the still in the film's frame (wide screens: the frame is the whole 16:9 picture)
    const cv = $('canvas.net');
    if (!cv || stillShown < 0) return;
    SKY.drawStill(cv, FILM.stills[stillShown] * FILM.referenceDuration, { live: true });
  }

  /* ---------------- Boot ---------------- */
  const api = {
    FILM, debug, pointer,
    at, vis, toScreen, safe, unit, noteArea,
    T: Tkey, end: () => endT, scaled, stationKeys: () => keys.slice(), captions: captionRect,
    activeStation: () => keys[Math.max(0, lastStation)],
    frame: () => frameBox, filmBox: () => filmBox, narrow: () => narrow,
    mobileSkyArea: () => ({ x: 16, y: barH + 12, w: vw - 32, h: Math.max(64, vh - barH - 28) }),
    tip: (c, x, y) => { if (!spotHover) showTip(c, x, y); },
    spotHover: () => !!spotHover,
    hint: () => (hintR && hintEl.classList.contains('on') ? hintR : null),
    tD: () => tD,
    kick: () => kick(),
    // version 15, for the tethers
    stillMode,
    star: SKY && SKY.starAt ? name => SKY.starAt(name) : null,
    skyWords: () => {
      const out = SKY && SKY.wordRects ? SKY.wordRects() : [];
      for (const r of captionRect()) out.push({ x0: frameBox.left + r.x - 6, y0: frameBox.top + r.y - 6, x1: frameBox.left + r.x + r.w + 6, y1: frameBox.top + r.y + r.h + 6 });
      if (hintR && hintEl.classList.contains('on')) out.push({ x0: frameBox.left + hintR.x, y0: frameBox.top + hintR.y, x1: frameBox.left + hintR.x + hintR.w, y1: frameBox.top + hintR.y + hintR.h });
      return out;
    },
    spotHoverId: () => (spotHover ? spotHover.id : null),
    preview: t => { const v = t === null || t === undefined || stillMode || narrow ? null : clamp(t, 0, endT); if (v !== previewT) { previewT = v; activity(); } },
    layoutInfo: () => ({ vw, vh, narrow, bandTop, readH, barH, colLeft, colRight, reserve, sharpX, filmTop: narrow ? bandTop : frameBox.top, railY: narrow ? bandTop + BAND.rail + 22 : vh - 10 - 36 + 22 }),
    mirror: MIRROR, half: !!FILM.halfCrop,
    seg: SKY && SKY.segAt ? label => SKY.segAt(label) : null,
    lightNote: SKY && SKY.lightNote ? (name, on) => SKY.lightNote(name, on) : null,
  };

  if (LEFT) LEFT.init();
  layout();
  buildRail();
  buildSpots();
  if (SKY) SKY.init(api);
  if (TETH) { TETH.init(api); TETH.measure(); }

  if (filmToggle) filmToggle.addEventListener('click', () => {
    filmExpandedByUser = filmCompact;
    layout();
    kick();
  });

  let resizeT = 0;
  function relayout() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      layout();
      if (lenis) lenis.resize();
      if (stillMode) { stillShown = -1; updateStatusStill(); }
      else loadFilm();
      kick();
    }, 120);
  }
  addEventListener('resize', relayout, { passive: true });
  // Engineering notes open and close in place: everything below moves, so stations, splits and the sky
  // are measured again at once (the scroll position itself stays where it is)
  $$('details.eng-notes').forEach(d => d.addEventListener('toggle', () => { layout(); if (lenis) lenis.resize(); kick(); }));
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe($('main'));
  ['scroll', 'wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(e => addEventListener(e, activity, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) activity(); });
  reduced.addEventListener('change', () => location.reload());
  addEventListener('tas:palette', () => { if (stillMode) requestAnimationFrame(drawStills); });

  const start = () => {
    doc.classList.add('is-in');
    if (stillMode) {
      addEventListener('scroll', updateStatusStill, { passive: true });
      // the tethers answer the pointer too: hovering a thing in the still underlines its words
      addEventListener('pointermove', () => { if (pointer.on || doc.classList.contains('tt-over')) updateStatusStill(); }, { passive: true });
      updateStatusStill();
    } else {
      loadFilm();
      kick();
    }
    // stations already passed when the page opens (a reload halfway down) are not checkpoints yet
    setTimeout(() => { booted = true; }, 400);
  };
  kick();
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(() => { layout(); start(); });
  if (document.fonts) document.fonts.ready.then(() => { layout(); if (SKY) SKY.measure(); kick(); });

  const median = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return +s[Math.floor(s.length / 2)].toFixed(1); };
  if (probe) window.__film = {
    FILM, stats, saved, lenis: () => !!lenis,
    state: () => ({
      ready, cur, vel, tD, presented: tD, o: topOpacity, blend, duration, S: S.slice(), T: T.slice(), maxScroll, src: loadedSrc, pushing, inertia,
      layers: layers.map(L => ({ req: L.req, painted: L.painted, pending: L.pending, seeks: L.ms.length, median: median(L.ms) })),
    }),
    scrollAt, timeAt, at, toScreen,
    // the figure and the sphere, as a screen rectangle (for layout checks)
    figureBox: () => {
      const t = tD, c = at('climber', t), s = at('sphere', t), b = FILM.climberBox, r = FILM.sphereR;
      const [ax, y0] = toScreen(Math.min(c[0] - b[0], s[0] - r), Math.min(c[1] - b[1], s[1] - r * 16 / 9), t);
      const [bx, y1] = toScreen(Math.max(c[0] + b[0], s[0] + r), Math.max(c[1] + b[1], s[1] + r * 16 / 9), t);
      return { left: Math.min(ax, bx), top: y0, right: Math.max(ax, bx), bottom: y1 };
    },
  };
})();
