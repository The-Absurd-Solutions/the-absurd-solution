/* The network over the climb (version 14), after J. L. Moreno's sociograms.
   People are round, systems are square. Every line is one white hairline: curves are social ties,
   straight lines engineered connections. Every node is pinned to something in the film (FILM.track) or left
   behind in the scene, and every position is a function of film time, so the network stays on
   the image while the film is scrubbed, and scrubbing backwards undoes the story.
   The words over the film (FILM.notes) are HTML, laid out here each frame: sparse, never over
   the woman or the boulder, with thin leader lines drawn on the canvas.
   film.js owns the only animation loop and calls ClimbNet.frame() from it. */
const ClimbNet = (() => {
  'use strict';

  const TAU = Math.PI * 2, ASPECT = 16 / 9;
  // Colours come from the page's tokens (the shared palettes recolour them); re-read on every palette change.
  const C = { ink: '11,11,11', ink2: '68,68,68', grey: '64,64,64', paper: '255,255,255' };
  // The network's lines are neutral white whatever the palette, at one hairline weight; a faint dark halo
  // keeps them legible where they cross the film's light sky.
  const WHITE = '255,255,255', LINE_W = .9, HALO_W = 2.6, HALO_A = .25;
  function toRGB(v, fallback) {
    v = (v || '').trim();
    let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) { let x = m[1]; if (x.length === 3) x = x.replace(/./g, c => c + c); return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)).join(','); }
    m = v.match(/^rgba?\(([^)]+)\)$/i);
    if (m) return m[1].split(/[ ,/]+/).slice(0, 3).map(x => Math.round(parseFloat(x))).join(',');
    return fallback;
  }
  function readColours() {
    const cs = getComputedStyle(document.documentElement);
    C.ink = toRGB(cs.getPropertyValue('--ink'), '11,11,11');
    C.ink2 = toRGB(cs.getPropertyValue('--ink-2'), '68,68,68');
    C.grey = toRGB(cs.getPropertyValue('--muted'), '64,64,64');
    C.paper = toRGB(cs.getPropertyValue('--chalk'), '255,255,255');
    C.label = cs.getPropertyValue('--mono').trim() || 'sans-serif';   // the label face (the type palette remaps it)
  }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // visible between t0 and t1, fading in and out over `f` seconds of film
  const win = (t, t0, t1, f = .35) => smooth(t0 - f, t0, t) * (1 - smooth(t1, t1 + f, t));
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  // a soft overshoot, for nodes that appear
  const popIn = x => { const c1 = 1.5, u = x - 1; return 1 + (c1 + 1) * u * u * u + c1 * u * u; };
  // appearances run on the clock (ms), whatever the film is doing
  const NODE_IN = 520, EDGE_IN = 500, LEAD_IN = 500, NOTE_OUT = 380, STAGGER = 70, GRACE = 260;
  // one diagram at a time: a station's scene starts LEAD seconds of film before its moment, and fades in
  // and out over FADE seconds inside its own span, so two scenes never show together
  const LEAD = .45, FADE = .15;
  function mulberry(seed) {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let api = null, F = null, debug = false;
  let cv = null, ctx = null, DPR = 1, W = 0, H = 0;
  let notesEl = null, legendEl = null;
  let nodes = [], edges = [], shapes = [], byId = {}, edgeById = {};
  let notes = [];
  let view = null, still = false;
  let flashT0 = -1e9, lastNow = 0, tipShown = false;

  /* ---------------- Views: the live film, or a still frame for reduced motion ---------------- */
  const liveView = {
    px(fx, fy, t) { const [x, y] = api.toScreen(fx, fy, t), fb = api.frame(); return [x - fb.left, y - fb.top]; },
    safe: t => api.safe(t),
    unit: () => api.unit(),
    k: () => (api.narrow() ? .82 : 1),
  };
  function stillView(w, h) {
    return {
      px: (fx, fy) => [fx * w, fy * h],
      safe: () => ({ x0: .03, x1: .97, y0: .05, y1: .95 }),
      unit: () => w / 100,
      k: () => 1,
    };
  }

  /* ---------------- The story, as nodes and edges ---------------- */
  function build() {
    nodes = []; edges = []; shapes = []; byId = {}; edgeById = {};
    const rnd = mulberry(7);
    const T = key => api.T(key), tE = api.end() + 1;
    const t1 = T('boulder-1'), t2 = T('boulder-2'), t3 = T('boulder-3'), t4 = T('lever'), t5 = T('path'), t6 = T('person'), t7 = T('summit');
    const sc = F.scenes;
    // Scene i (station i) holds the film from B[i] to B[i + 1]. A roll-back or a transition shows one
    // scene or the next, never both; nodes leaving fade within FADE seconds of film.
    const B = [-1, t1, t2, t3, t4, t5, t6, t7].map((t, i) => (i ? t - LEAD : -1));
    B.push(tE + 1);
    const sw = (i, d = 0) => t => win(t, B[i] + FADE + d, B[i + 1] - FADE, FADE);   // d: a stagger inside the scene
    const onward = (i, d = 0) => t => win(t, B[i] + FADE + d, tE, FADE);           // from scene i to the end
    const leave = i => B[i + 1] - FADE;                                             // scene i's people join her network

    const at = name => t => api.at(name, t);
    const vis = name => t => api.vis(name, t);
    // offsets are in % of the frame width both ways, so shapes stay round
    const off = (p, du, dv) => { const k = view.k(); return [p[0] + du * k / 100, p[1] + dv * k / 100 * ASPECT]; };
    const rel = (fn, du, dv) => t => off(fn(t), du, dv);
    // keep a scene's anchor inside the visible, readable part of the film
    const keep = (fn, ext) => t => {
      const p = fn(t), s = view.safe(t), mx = ext * view.k() / 100, my = mx * ASPECT;
      return [clamp(p[0], s.x0 + mx, Math.max(s.x0 + mx, s.x1 - mx)), clamp(p[1], s.y0 + my, Math.max(s.y0 + my, s.y1 - my))];
    };
    // left behind in the scene at t0: from then on it moves with the scene, not with the climber
    const pin = (fn, t0) => t => {
      const p0 = fn(t0), w0 = api.at(F.world, t0), w = api.at(F.world, t);
      return [p0[0] + w[0] - w0[0], p0[1] + w[1] - w0[1]];
    };
    const travel = (a, b, t0, d = .9) => t => {
      if (t <= t0) return a(t);
      const q = b(t);
      if (t >= t0 + d) return q;
      const p = a(t), e = ease((t - t0) / d);
      return [lerp(p[0], q[0], e), lerp(p[1], q[1], e)];
    };
    const centroid = list => t => {
      let x = 0, y = 0;
      for (const n of list) { const p = n.pos(t); x += p[0]; y += p[1]; }
      return [x / list.length, y / list.length];
    };
    const N = (id, o) => {
      Object.assign(o, { id, ph: rnd() * TAU, ax: 0, ay: 0, x: 0, y: 0, a: 0, born: -1, s: 1 });
      nodes.push(o);
      if (id) byId[id] = o;
      return o;
    };
    const E = (id, a, b, kind, alpha, extra) => {
      const e = Object.assign({ id, a, b, kind, alpha, bend: (edges.length % 2 ? 1 : -1) * (.12 + rnd() * .1), born: -1, g: 0, ea: 0 }, extra);
      edges.push(e);
      if (id) edgeById[id] = e;
      return e;
    };
    const always = () => 1;

    // ---- I · The absurd: at the foot of the hill the climber is a lone node.
    const me = N('me', { kind: 'me', role: 'Vesna Božić · engineer and sociologist', pos: at('climber'), alpha: always });
    N('sphereTop', { kind: 'none', pos: t => { const p = api.at('sphere', t); return [p[0], p[1] - F.sphereR * ASPECT]; }, alpha: always });

    // her own network: what she built and who she built it with, gathered station by station
    const follow = [];
    const slot = j => rel(at('climber'), sc.following[j][0], sc.following[j][1]);
    const join = (j, kind, role, from, tJ) => {
      const n = N('f' + j, { kind, role, pos: travel(from, slot(j), tJ, .6), alpha: t => smooth(tJ - .06, tJ, t) });
      E(null, me, n, kind === 'eng' ? 'eng' : 'tie', n.alpha);
      follow.push(n);
      return n;
    };

    // ---- II · Istražimo: a ring of questions around the cliff top; its people answer, and every answer keeps its version.
    const V = sc.version;
    const vA = keep(rel(at(V.anchor), V.du, V.dv), V.r + 1);
    const a1 = sw(1);
    const v3 = N('v3', { kind: 'hub', text: 'v3', role: 'the published instrument, v3', pos: vA, alpha: a1 });
    shapes.push({ kind: 'ring', c: vA, r: V.r, alpha: a1 });
    const qRoles = ['question', 'scale', 'options', 'consent', 'question', 'matrix', 'ranking', 'logic'];
    qRoles.forEach((role, j) => {
      const ang = -Math.PI / 2 + j * TAU / 8;
      N('q' + j, { kind: 'eng', role, pos: t => off(vA(t), Math.cos(ang) * V.r, Math.sin(ang) * V.r), alpha: sw(1, j * .05) });
    });
    const P = sc.participants;
    P.at.forEach(([du, dv, anchor], j) => {
      const real = j < 3, from = anchor || P.anchor;
      const n = N('p' + j, {
        kind: 'soc', small: !real, role: real ? 'someone on the cliff · a participant' : 'a participant',
        pos: rel(at(from), du, dv), alpha: t => sw(1, .05 + j * .07)(t) * api.vis(from, t),
      });
      E(j === P.answer ? 'answer' : null, n, v3, 'eng', sw(1, .15 + j * .07));
    });
    join(0, 'eng', 'Istražimo · the research platform', vA, leave(1));
    join(1, 'soc', 'a researcher', t => off(vA(t), V.r, 0), leave(1));

    // ---- III · Shared foundations: the tower's door is the identity hub; each floor runs its own session.
    const TW = sc.tower;
    const hA = keep(at('door'), TW.ext);
    const a2 = sw(2);
    const hub = N('hub', { kind: 'hub', role: 'identity + access · the shared portal', pos: hA, alpha: a2 });
    N('cap2', { kind: 'none', pos: t => off(hA(t), 0, 5.5), alpha: a2 });
    TW.apps.forEach(([du, dv, name], j) => {
      const sA = keep(rel(hA, du, dv), 4);
      const al = sw(2, .1 + j * .12);
      const ses = N('ses' + j, { kind: 'eng', role: `${name} · its own session`, pos: sA, alpha: al });
      E(j === 2 ? 'ticket' : null, hub, ses, 'eng', al, { ticket: j });
      for (let m = 0; m < 4; m++) {
        const ang = rnd() * TAU, rad = 2.3 + rnd() * 1.5;
        const mem = N(null, {
          kind: 'soc', small: m > 1, role: ['a member', 'a manager', 'a member', 'an admin'][m],
          pos: t => off(sA(t), Math.cos(ang) * rad, Math.sin(ang) * rad), alpha: sw(2, .2 + j * .12 + m * .04),
        });
        E(null, ses, mem, 'tie', mem.alpha);
      }
    });
    join(2, 'eng', 'the shared portal', hA, leave(2));
    join(3, 'soc', 'an admin', t => off(hA(t), -3, -2), leave(2));

    // ---- IV · From scans to search: the blocks along the ramp are scans; they settle into entries,
    //      each tied to its page; the one still in doubt goes to the person reviewing.
    const a3 = sw(3);
    const PG = sc.page;
    const pA = pin(keep(rel(at(PG.anchor), PG.du, PG.dv), 6), t3);
    shapes.push({ kind: 'page', c: pA, w: PG.w, h: PG.h, alpha: a3 });
    N('page', { kind: 'none', pos: t => off(pA(t), -PG.w / 2, -PG.h / 2), alpha: a3 });
    const pageEdge = N(null, { kind: 'none', pos: t => off(pA(t), PG.w / 2, 0), alpha: a3 });
    const idxA = keep(rel(at(sc.index.anchor), sc.index.du, sc.index.dv), 5);
    const a3i = sw(3, .75);
    const index = N('index', { kind: 'hub', role: 'the search index · a verified release', pos: idxA, alpha: a3i });
    N('cap3', { kind: 'none', pos: t => off(idxA(t), 0, 2.6), alpha: a3i });
    const sitter = N('sitter', { kind: 'soc', role: 'someone reviewing', pos: rel(at('sitter'), 0, -2.2), alpha: t => Math.max(sw(3, .4)(t), onward(6, .3)(t)) * api.vis('sitter', t) });   // reviewing here; connected again at the end
    const FR = sc.fragments;
    const scatter = [[-7, 6], [8, -7], [-3, 9], [11, 5], [4, -10], [-8, -2], [6, 11], [13, -2], [1, 7]];
    let prev = null;
    for (let j = 0; j < 9; j++) {
      const tRise = B[3] + j * .05;
      const dx = (j - 4) * FR.spread / 800;
      const ground = pin(t => { const b = api.at(FR.anchor, t); return [b[0] + dx, b[1] + F.ramp * dx]; }, tRise);
      const sPos = t => off(pA(t), scatter[j][0], scatter[j][1]);
      const rise = travel(ground, sPos, tRise, .7);
      let pos = rise, alpha, kind = 'eng', role = 'a scan', id = null;
      if (j < 6) {
        const e = sc.entries[j >> 1], side = (j & 1) ? 1.15 : -1.15;
        pos = travel(rise, t => off(pA(t), e[0] + side, e[1]), t3 + .4 + (j >> 1) * .15, .8);
        role = (j & 1) ? 'an image' : 'a text';
        alpha = t => win(t, tRise + .05, leave(3), FADE);
        if (j === 2) id = 'entry';
      } else if (j === 6) {
        pos = travel(rise, t => off(sitter.pos(t), -3, -3.5), t3 + .7, 1);
        kind = 'open'; role = 'a scan kept for review'; id = 'scan';
        alpha = t => win(t, tRise + .05, leave(3), FADE);
      } else {
        alpha = t => win(t, tRise + .05, t3 + .55, FADE);
      }
      const n = N(id, { kind, small: true, role, pos, alpha });
      if (j < 6 && (j & 1)) {
        E(null, prev, n, 'tie', t => win(t, t3 + 1, leave(3), FADE));                                      // text + image: one entry
        E(null, n, index, 'eng', t => win(t, t3 + 1.15 + (j >> 1) * .12, leave(3), FADE));                   // published to search
      }
      if (j < 6 && !(j & 1)) E(j === 0 ? 'provenance' : null, n, pageEdge, 'prov', t => win(t, t3 + .95, leave(3), FADE));
      if (j === 6) { E(null, n, pageEdge, 'prov', t => win(t, t3 + .95, leave(3), FADE)); E(null, n, sitter, 'tie', t => win(t, t3 + 1.4, leave(3), FADE)); }
      prev = n;
    }
    join(4, 'eng', 'the archive search', idxA, leave(3));
    join(5, 'soc', 'an archivist', t => off(pA(t), 0, 0), leave(3));

    // ---- V · The lever: the portal's two pillars hold the two sides; the beam between them is the seam.
    const LV = sc.lever;
    // the two pillars are kept as a pair, so the two sides never fold onto each other on a narrow crop
    const pair = t => { const l = api.at(LV.left, t), r = api.at(LV.right, t); return [(l[0] + r[0]) / 2, (l[1] + r[1]) / 2, Math.max(.06, (r[0] - l[0]) / 2)]; };
    const pc = keep(t => pair(t), LV.ext + 8);
    const lA = t => { const c = pc(t); return [c[0] - pair(t)[2] * view.k(), c[1]]; };
    const rA = t => { const c = pc(t); return [c[0] + pair(t)[2] * view.k(), c[1]]; };
    const bA = keep(t => [pc(t)[0], api.at(LV.seam, t)[1]], 3);
    const a4 = sw(4);
    const engRoles = ['AI systems & integration', 'RAG & evaluations', 'agents & automation', 'serverless platforms', 'web apps & design systems'];
    const socRoles = ['adoption & incentives', 'workflow research', 'trust, GDPR & audit', 'handover & training', 'first-feature strategy'];
    const eN = LV.eng.map(([du, dv], j) => N(null, { kind: 'eng', role: engRoles[j], pos: rel(lA, du, dv), alpha: sw(4, .1 + j * .05) }));
    const sN = LV.soc.map(([du, dv], j) => N(null, { kind: 'soc', role: socRoles[j], pos: rel(rA, du, dv), alpha: sw(4, .15 + j * .05) }));
    LV.grid.forEach(([a, b]) => E(null, eN[a], eN[b], 'eng', a4));
    LV.ties.forEach(([a, b]) => E(null, sN[a], sN[b], 'tie', a4));
    LV.bridges.forEach(([a, b], j) => E(null, eN[a], sN[b], 'eng', sw(4, .55 + j * .1)));
    N('seam', { kind: 'none', pos: bA, alpha: a4 });
    shapes.push({ kind: 'cross', c: bA, alpha: a4 });
    N('engMid', { kind: 'none', pos: centroid(eN), alpha: a4 });
    N('socMid', { kind: 'none', pos: centroid(sN), alpha: a4 });
    join(6, 'soc', 'a team lead', sN[1].pos, leave(4));

    // ---- VI · The path: four gates on the steps; a project takes them in order.
    const G = sc.gates;
    const gA = keep(at(G.anchor), G.ext);
    const a5 = sw(5);
    const gates = G.at.map(([du, dv], j) => N('gate' + j, { kind: 'gate', role: ['diagnose', 'specify', 'build', 'hand over'][j], pos: rel(gA, du, dv), alpha: sw(5, j * .08) }));
    const prog = t => clamp((t - (t5 - .15)) / Math.max(.3, t6 - t5 - .3));
    shapes.push({ kind: 'path', pts: gates, prog, alpha: a5 });
    N('token', {
      kind: 'token', role: 'a project, one turn at a time', alpha: a5,
      pos: t => {
        const u = prog(t) * (gates.length - 1), i = Math.min(gates.length - 2, Math.floor(u));
        const p = gates[i].pos(t), q = gates[i + 1].pos(t), e = ease(u - i);
        return [lerp(p[0], q[0], e), lerp(p[1], q[1], e)];
      },
    });
    join(7, 'soc', 'the owner, after the handover', gates[3].pos, leave(5));

    // ---- VII · Who is pushing: the people who gather under the portal connect to her.
    const a6 = onward(6);
    const aud = sc.audience.at.map(([du, dv], j) => {
      const n = N('aud' + j, { kind: 'soc', role: ['a researcher', 'a member', 'a manager', 'a participant'][j], pos: rel(at('group'), du, dv), alpha: t => onward(6, .05 + j * .07)(t) * api.vis('group', t) });
      E(j === 1 ? 'trust' : j === 2 ? 'adoption' : null, n, me, 'tie', onward(6, .2 + j * .07), { arc: true });
      return n;
    });
    const amph = [0, 1].map(j => {
      const n = N('amph' + j, { kind: 'soc', role: ['an admin', 'an analyst'][j], pos: rel(at('amph'), (j - .5) * 4.5, -2), alpha: t => onward(6, .3 + j * .1)(t) * api.vis('amph', t) });
      E(null, n, me, 'tie', n.alpha, { arc: true });
      return n;
    });
    E(null, sitter, me, 'tie', onward(6, .35), { arc: true });
    const base = N('base', { kind: 'soc', role: 'someone at the tower', pos: rel(at('baseP'), 0, -2.2), alpha: t => onward(6, .15)(t) * api.vis('baseP', t) });
    E(null, base, me, 'tie', base.alpha, { arc: true });

    // ---- VIII · Summit: everyone is connected, and three open lines wait for three sentences.
    const a7 = onward(7);
    [[0, aud[0], 'eng'], [2, aud[1], 'eng'], [4, sitter, 'eng'], [1, aud[2], 'tie'], [3, aud[3], 'tie'], [5, amph[0], 'tie'], [6, amph[1], 'tie'], [7, aud[3], 'tie']]
      .forEach(([j, b, kind]) => E(null, follow[j], b, kind, a7));
    E(null, aud[0], aud[1], 'tie', a7); E(null, aud[2], aud[3], 'tie', a7); E(null, aud[1], amph[0], 'tie', a7);
    N('group', { kind: 'none', pos: t => off(api.at('group', t), 0, 2.4), alpha: a7 });
    // the three lines stay together: the group, not each line, is kept inside the frame
    const TH = sc.three;
    const mu = TH.at.reduce((m, p) => m + p[0], 0) / TH.at.length, mv = TH.at.reduce((m, p) => m + p[1], 0) / TH.at.length;
    const half = Math.max(...TH.at.map(p => Math.abs(p[1] - mv))) + 2.5;
    const thA = keep(rel(at(TH.anchor), mu, mv), half);
    const openRoles = ['what you are building', 'who it is for', 'where you are stuck'];
    TH.at.forEach(([du, dv], j) => {
      const o = N('open' + j, { kind: 'open', role: openRoles[j], pos: rel(thA, du - mu, dv - mv), alpha: onward(7, .1 + j * .12) });
      E(null, me, o, 'dot', o.alpha);
    });
  }

  /* ---------------- The words over the film ---------------- */
  function buildNotes() {
    if (!notesEl) return;
    notesEl.querySelectorAll('.note').forEach(el => el.remove());
    const keys = api.stationKeys();
    notes = (F.notes || []).map(cfg => {
      const el = document.createElement('span');
      const style = cfg.style || 'name';
      // a label of more than one word on a line is never rotated: it is set flat, beside the line
      const flat = (style === 'edge' || style === 'along') && /\s/.test(cfg.text.trim());
      el.className = `note note-${style}${flat ? ' note-flat' : ''}`;
      const inner = document.createElement('span');
      inner.className = 'note-in';
      inner.textContent = cfg.text;
      el.appendChild(inner);
      notesEl.appendChild(el);
      let t0, t1;
      if (cfg.t) { t0 = api.scaled(cfg.t[0]); t1 = api.scaled(cfg.t[1]); }
      else {
        const i = keys.indexOf(cfg.s);
        t0 = i === 0 ? -1 : api.T(cfg.s) - LEAD + FADE;
        t1 = i + 1 < keys.length ? api.T(keys[i + 1]) - LEAD - FADE : api.end() + 1;
      }
      return { cfg, el, style, flat, t0, t1, w: 0, h: 0, on: false, pl: null, plAt: 0, cx: 0, cy: 0, cf: .5, tg: null, onAt: -1e9, offAt: -1e9, delay: 0, failAt: -1, lastLead: null };
    });
    measureNotes();
  }
  let legendRect = null;   // read once per layout, never in the loop
  function measureNotes() {
    for (const n of notes) { n.w = n.el.offsetWidth; n.h = n.el.offsetHeight; n.pl = null; }
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

  // where a note's target is on the canvas
  function targetOf(n, t) {
    const on = n.cfg.on;
    if (on === 'ramp') {
      const s = api.at('sphere', t);
      const bx = s[0] + F.sphereR * 1.4, by = s[1] + F.sphereR * ASPECT;
      const p = view.px(bx + .02, by + F.ramp * .02, t), q = view.px(bx + .16, by + F.ramp * .16, t);
      return { edge: true, a: p, b: q, c: null };
    }
    if (on.startsWith('edge:')) {
      const e = edgeById[on.slice(5)];
      if (!e || e.a.a < .5 || e.b.a < .5 || e.ea < .5 || e.g < .55) return null;   // words wait until their line is mostly drawn
      const a = [e.a.x, e.a.y], b = [e.b.x, e.b.y];
      return { edge: true, a, b, c: e.kind === 'tie' ? ctrl(e) : null };
    }
    const nd = byId[on];
    if (!nd || nd.a < .55) return null;
    return { x: nd.x, y: nd.y, r: rad(nd) };
  }
  const rad = n => (n.kind === 'hub' ? 8 : n.kind === 'me' ? 6 : n.kind === 'none' ? 0 : n.kind === 'gate' ? 6 : 4);

  // Placement. A label keeps its place while it fits (it moves with its node, rigidly); every half
  // second it may take a better one, and then it slides there instead of jumping.
  const DIRS = { n: [0, -1], ne: [.75, -.75], e: [1, 0], se: [.75, .75], s: [0, 1], sw: [-.75, .75], w: [-1, 0], nw: [-.75, -.75] };
  const fits = (r, ex, placed, S) => inside(r, S) && !ex.some(e => overlap(r, e, 4)) && !placed.some(q => overlap(r, q, 3));
  // a name label for one direction and distance; its offsets are relative to the node
  function nameAt(n, d, gap) {
    const [dx, dy] = DIRS[d] || DIRS.n;
    const ax = dx * gap, ay = dy * gap;
    return { kind: 'name', d, gap, dx, dy, ox: dx > .1 ? ax : dx < -.1 ? ax - n.w : ax - n.w / 2, oy: dy > .1 ? ay : dy < -.1 ? ay - n.h : ay - n.h / 2 };
  }
  const nameRect = (n, tg, ox, oy) => ({ x: tg.x + ox, y: tg.y + oy, w: n.w, h: n.h });
  function searchName(n, tg, ex, placed, S) {
    const base = n.style === 'caption' ? 4 : tg.r + 11;
    const dirs = n.cfg.at || ['n', 'ne', 'e', 's'];
    for (let i = 0; i < dirs.length; i++) {
      // step outward until the label clears the woman, the boulder and the other labels
      for (let gap = base, step = 0; gap <= base + 150; gap += 8, step++) {
        const pl = nameAt(n, dirs[i], gap);
        const r = nameRect(n, tg, pl.ox, pl.oy);
        if (!inside(r, S)) break;
        if (ex.some(e => overlap(r, e, 4)) || placed.some(q => overlap(r, q, 3))) continue;
        pl.rank = i * 100 + step; pl.base = base;
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
  // a point on the line (or the tie's curve) at f, and the direction there, kept upright
  function edgePoint(tg, f) {
    const [ax, ay] = tg.a, [bx, by] = tg.b, c = tg.c;
    let px, py, tx, ty;
    if (c) {
      const g = 1 - f;
      px = g * g * ax + 2 * g * f * c[0] + f * f * bx; py = g * g * ay + 2 * g * f * c[1] + f * f * by;
      tx = 2 * g * (c[0] - ax) + 2 * f * (bx - c[0]); ty = 2 * g * (c[1] - ay) + 2 * f * (by - c[1]);
    } else { px = lerp(ax, bx, f); py = lerp(ay, by, f); tx = bx - ax; ty = by - ay; }
    if (tx < 0) { tx = -tx; ty = -ty; }
    return { px, py, ang: Math.atan2(ty, tx) };
  }
  // a one-word edge label: along the line, just above it
  function edgeGeom(n, tg, f) {
    const { px, py, ang } = edgePoint(tg, f), nx = Math.sin(ang), ny = -Math.cos(ang);   // the side above the line
    const o = n.h / 2 + 3, mx = px + nx * o, my = py + ny * o;
    const cs = Math.abs(Math.cos(ang)), sn = Math.abs(Math.sin(ang));
    const bw = n.w * cs + n.h * sn, bh = n.w * sn + n.h * cs;
    return { mx, my, ang, rect: { x: mx - bw / 2, y: my - bh / 2, w: bw, h: bh } };
  }
  // a longer edge label: flat, beside the line's middle on one side, its nearest edge 12 px from the line
  function flatGeom(n, tg, f, side) {
    const { px, py, ang } = edgePoint(tg, f), nx = Math.sin(ang) * side, ny = -Math.cos(ang) * side;
    const reach = 12 + (n.w / 2) * Math.abs(nx) + (n.h / 2) * Math.abs(ny);
    const cx = px + nx * reach, cy = py + ny * reach;
    return { rect: { x: cx - n.w / 2, y: cy - n.h / 2, w: n.w, h: n.h } };
  }
  const EDGE_F = [.5, .4, .6, .32, .68];
  function placeEdge(n, tg, ex, placed, S) {
    if (n.flat) {
      if (Math.hypot(tg.b[0] - tg.a[0], tg.b[1] - tg.a[1]) < 28) return null;
      const was = n.pl && n.pl.kind === 'flat' ? n.pl : null;
      if (was && fits(flatGeom(n, tg, was.f, was.side).rect, ex, placed, S)) return was;
      for (let i = 0; i < EDGE_F.length; i++) for (const side of [1, -1]) {
        if (fits(flatGeom(n, tg, EDGE_F[i], side).rect, ex, placed, S)) return { kind: 'flat', f: EDGE_F[i], side, rank: i };
      }
      return null;
    }
    if (Math.hypot(tg.b[0] - tg.a[0], tg.b[1] - tg.a[1]) < n.w * .8) return null;
    const was = n.pl && n.pl.kind === 'edge' ? n.pl : null;
    if (was && fits(edgeGeom(n, tg, was.f).rect, ex, placed, S)) return was;
    for (let i = 0; i < EDGE_F.length; i++) if (fits(edgeGeom(n, tg, EDGE_F[i]).rect, ex, placed, S)) return { kind: 'edge', f: EDGE_F[i], rank: i };
    return null;
  }
  // where a placed label is drawn this frame (its smoothed place), with its leader line
  function noteGeom(n, tg) {
    const pl = n.pl;
    if (pl.kind === 'flat') {
      const r = flatGeom(n, tg, n.cf, pl.side).rect;
      return { rect: r, lead: null, transform: `translate3d(${r.x.toFixed(2)}px,${r.y.toFixed(2)}px,0)` };
    }
    if (pl.kind === 'edge') {
      const g = edgeGeom(n, tg, n.cf);
      return { rect: g.rect, lead: null, transform: `translate3d(${g.mx.toFixed(2)}px,${g.my.toFixed(2)}px,0) rotate(${g.ang.toFixed(4)}rad) translate(${(-n.w / 2).toFixed(2)}px,${(-n.h / 2).toFixed(2)}px)` };
    }
    const r = nameRect(n, tg, n.cx, n.cy);
    let lead = null;
    if (!(n.style === 'caption' && pl.gap <= pl.base + .1)) {
      // from the node to the side of the label that faces it
      const ax = pl.dx > .1 ? r.x : pl.dx < -.1 ? r.x + r.w : r.x + r.w / 2;
      const ay = pl.dy > .1 ? r.y : pl.dy < -.1 ? r.y + r.h : r.y + r.h / 2;
      const vx = ax - tg.x, vy = ay - tg.y, len = Math.hypot(vx, vy);
      if (len > tg.r + 5) { const ux = vx / len, uy = vy / len; lead = { x1: tg.x + ux * (tg.r + 2), y1: tg.y + uy * (tg.r + 2), x2: ax - ux * 2, y2: ay - uy * 2 }; }
    }
    return { rect: r, lead, transform: `translate3d(${r.x.toFixed(2)}px,${r.y.toFixed(2)}px,0)` };
  }

  // the woman and the boulder, on the canvas: nothing is written over them
  function exclusion(t) {
    const c = api.at('climber', t), s = api.at('sphere', t), b = F.climberBox;
    const r = F.sphereR, ry = r * ASPECT;
    const x0 = Math.min(c[0] - b[0], s[0] - r), x1 = Math.max(c[0] + b[0], s[0] + r);
    const y0 = Math.min(c[1] - b[1], s[1] - ry), y1 = Math.max(c[1] + b[1], s[1] + ry);
    const [px0, py0] = view.px(x0, y0, t), [px1, py1] = view.px(x1, y1, t);
    return { x: px0 - 6, y: py0 - 6, w: px1 - px0 + 12, h: py1 - py0 + 12 };
  }

  function people(t) {
    const out = [];
    for (const [name, hw, hh] of F.keepClear || []) {
      if (api.vis(name, t) < .5) continue;
      const p = api.at(name, t);
      if (!p) continue;
      const [x0, y0] = view.px(p[0] - hw, p[1] - hh, t), [x1, y1] = view.px(p[0] + hw, p[1] + hh, t);
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
    }
    return out;
  }
  function layoutNotes(t, now, dt) {
    if (!notesEl) return [];
    const max = api.narrow() ? F.maxNotes.narrow : F.maxNotes.wide;
    const S = api.noteArea();
    const ex = [exclusion(t), ...people(t)];
    const placed = legendRect ? [legendRect] : [];
    for (const r of api.captions()) placed.push({ x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 12 });
    const k = 1 - Math.exp(-dt * 14);   // how fast a label slides to a new place
    const leads = [];
    const cands = [];
    for (const n of notes) {
      n.tg = targetOf(n, t);
      if (n.tg && t >= n.t0 && t <= n.t1) cands.push(n);
      else setOn(n, false, now);
    }
    cands.sort((a, b) => a.cfg.pri - b.cfg.pri);
    let shown = 0;
    for (const n of cands) {
      const tg = n.tg;
      let pl = shown < max ? (tg.edge ? placeEdge(n, tg, ex, placed, S) : placeName(n, tg, ex, placed, S, now)) : null;
      if (pl) n.failAt = -1;
      else if (n.on && n.pl && shown < max) {
        // no room this frame: hold the last place a moment rather than flicker
        if (n.failAt < 0) n.failAt = now;
        if (now - n.failAt < GRACE) pl = n.pl;
      }
      if (!pl) { setOn(n, false, now); continue; }
      const along = pl.kind === 'edge' || pl.kind === 'flat';
      if (!n.on || !n.pl || n.pl.kind !== pl.kind || (pl.kind === 'flat' && n.pl.side !== pl.side)) { if (along) n.cf = pl.f; else { n.cx = pl.ox; n.cy = pl.oy; } }   // a label appears in place
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
      n.lastLead = geo.lead;
      if (geo.lead) leads.push({ ...geo.lead, g: easeOut(clamp((now - n.onAt - n.delay) / LEAD_IN)), a: 1 });
      shown++;
    }
    // labels on their way out keep following their node while they fade, unless that would cover the woman
    for (const n of notes) {
      if (n.on || !n.pl) continue;
      const age = now - n.offAt;
      if (age > NOTE_OUT) continue;
      if (n.tg) {
        const geo = noteGeom(n, n.tg);
        if (!overlap(geo.rect, ex[0], 2)) { n.el.style.transform = geo.transform; n.lastLead = geo.lead; }
      }
      if (n.lastLead) leads.push({ ...n.lastLead, g: 1, a: 1 - age / NOTE_OUT });
    }
    return leads;
  }

  /* ---------------- Drawing ---------------- */
  function positions(t, now, dt) {
    const p = api.pointer, fb = api.frame();
    const px = p.x - fb.left, py = p.y - fb.top;
    const pull = !still && p.on && !p.down;
    const R = api.narrow() ? 90 : 130, ef = 1 - Math.exp(-dt * 9);
    for (const n of nodes) {
      const a = n.alpha(t);
      n.a = a;
      if (a < .01) { n.ax = n.ay = 0; n.born = -1; continue; }
      if (n.born < 0) n.born = now;
      n.s = still ? 1 : popIn(clamp((now - n.born) / NODE_IN));
      const q = n.pos(t), [x, y] = view.px(q[0], q[1], t);
      let bx = 0, by = 0;
      if (!still && n.kind === 'soc') { bx = Math.sin(now * .0011 + n.ph) * 1.2; by = Math.cos(now * .0009 + n.ph * 1.7) * 1.2; }
      // the cursor draws people in a little; systems stay where they are built
      let tx = 0, ty = 0;
      if (pull && (n.kind === 'soc' || n.kind === 'open')) {
        const dx = px - x, dy = py - y, d = Math.hypot(dx, dy);
        if (d < R && d > 1) { const f = (1 - d / R) ** 2 * .22; tx = Math.max(-14, Math.min(14, dx * f)); ty = Math.max(-14, Math.min(14, dy * f)); }
      }
      n.ax += (tx - n.ax) * ef; n.ay += (ty - n.ay) * ef;
      n.x = x + bx + n.ax; n.y = y + by + n.ay;
    }
    for (const e of edges) {
      e.ea = e.alpha(t) * Math.min(e.a.a, e.b.a);
      if (e.ea < .02) { e.born = -1; e.g = 0; continue; }
      if (e.born < 0) e.born = now;
      e.g = still ? 1 : easeOut(clamp((now - e.born) / EDGE_IN));   // drawn from its source to its target
    }
  }

  function drawShapes(t) {
    const u = view.unit() * view.k();
    for (const s of shapes) {
      const a = s.alpha(t);
      if (a < .02) continue;
      if (s.kind === 'ring') {
        const c = s.c(t), [x, y] = view.px(c[0], c[1], t);
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(x, y, s.r * u, 0, TAU);
        ctx.lineWidth = HALO_W; ctx.strokeStyle = `rgba(${C.ink},${HALO_A})`; ctx.stroke();
        ctx.lineWidth = LINE_W; ctx.strokeStyle = `rgba(${WHITE},.85)`; ctx.stroke();
      } else if (s.kind === 'page') {
        const c = s.c(t), [x, y] = view.px(c[0], c[1], t), w = s.w * u, h = s.h * u;
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgba(${C.paper},.82)`; ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${C.ink},.6)`; ctx.strokeRect(x - w / 2 + .5, y - h / 2 + .5, w - 1, h - 1);
        // lines of text, and an image box
        ctx.lineWidth = .8; ctx.strokeStyle = `rgba(${C.grey},.45)`;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) { const ly = y - h / 2 + h * (.16 + i * .1); ctx.moveTo(x - w * .36, ly); ctx.lineTo(x + w * (i === 3 ? .1 : .36), ly); }
        ctx.stroke();
        ctx.strokeRect(x - w * .36, y + h * .06, w * .72, h * .3);
      } else if (s.kind === 'cross') {
        const c = s.c(t), [x, y] = view.px(c[0], c[1], t), r = 5;
        ctx.globalAlpha = a;
        ctx.lineCap = 'round';
        ctx.lineWidth = 3.4; ctx.strokeStyle = `rgba(${C.ink},.24)`;
        ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke();
        ctx.lineWidth = 1.2; ctx.strokeStyle = `rgb(${WHITE})`; ctx.stroke();
        ctx.lineCap = 'butt';
      } else if (s.kind === 'path') {
        const pts = s.pts.filter(g => g.a > .05).map(g => [g.x, g.y]);
        if (pts.length < 2) continue;
        ctx.globalAlpha = a;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.lineWidth = HALO_W; ctx.strokeStyle = `rgba(${C.ink},${HALO_A * .7})`; ctx.stroke();
        ctx.setLineDash([2, 4]); ctx.lineWidth = LINE_W; ctx.strokeStyle = `rgba(${WHITE},.6)`; ctx.stroke(); ctx.setLineDash([]);
        // the turns already taken are built: solid, like an engineered connection
        const u2 = s.prog(t) * (pts.length - 1), i2 = Math.floor(u2);
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i <= Math.min(i2, pts.length - 1); i++) ctx.lineTo(pts[i][0], pts[i][1]);
        if (i2 < pts.length - 1) { const f = ease(u2 - i2); ctx.lineTo(lerp(pts[i2][0], pts[i2 + 1][0], f), lerp(pts[i2][1], pts[i2 + 1][1], f)); }
        ctx.lineWidth = HALO_W; ctx.strokeStyle = `rgba(${C.ink},${HALO_A})`; ctx.stroke();
        ctx.lineWidth = LINE_W; ctx.strokeStyle = `rgba(${WHITE},.95)`; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // a social tie's curve: a gentle bow, or an arch over the boulder for the ties that reach her
  function ctrl(e) {
    const x1 = e.a.x, y1 = e.a.y, x2 = e.b.x, y2 = e.b.y;
    if (e.arc) return [(x1 + x2) / 2, Math.min(y1, y2) - Math.abs(x2 - x1) * .2 - 10];
    return [(x1 + x2) / 2 - (y2 - y1) * e.bend * .5, (y1 + y2) / 2 + (x2 - x1) * e.bend * .5];
  }
  function edgePath(e, p, pointer, g = 1) {
    const x1 = e.a.x, y1 = e.a.y, x2 = e.b.x, y2 = e.b.y;
    p.moveTo(x1, y1);
    if (e.kind !== 'tie') { p.lineTo(x1 + (x2 - x1) * g, y1 + (y2 - y1) * g); return; }
    // social ties are curves, and they flex toward the cursor
    let [cx, cy] = ctrl(e);
    if (pointer) {
      const dx = pointer[0] - cx, dy = pointer[1] - cy, d = Math.hypot(dx, dy);
      if (d < 170) { const f = (1 - d / 170) * .35; cx += dx * f; cy += dy * f; }
    }
    if (g >= .999) { p.quadraticCurveTo(cx, cy, x2, y2); return; }
    // the first part of the curve, up to g (de Casteljau)
    const qx = x1 + (cx - x1) * g, qy = y1 + (cy - y1) * g, rx = cx + (x2 - cx) * g, ry = cy + (y2 - cy) * g;
    p.quadraticCurveTo(qx, qy, qx + (rx - qx) * g, qy + (ry - qy) * g);
  }

  function drawEdges() {
    const ptr = api.pointer, fb = api.frame();
    const pointer = !still && ptr.on && !ptr.down ? [ptr.x - fb.left, ptr.y - fb.top] : null;
    // the kinds differ by form only: engineered connections run straight and solid, social ties curve,
    // provenance is dashed and the open questions dotted
    const style = {
      tie: { a: .8 },
      eng: { a: .9 },
      prov: { a: .62, dash: [1.4, 3] },
      dot: { a: .62, dash: [2, 4] },
    };
    for (const pass of [0, 1]) {
      for (const e of edges) {
        if (e.ea < .02 || e.g < .01) continue;
        const st = style[e.kind];
        const p = new Path2D();
        edgePath(e, p, pointer, e.g);
        ctx.globalAlpha = e.ea;
        if (pass === 0) { ctx.setLineDash([]); ctx.lineWidth = HALO_W; ctx.strokeStyle = `rgba(${C.ink},${st.dash ? HALO_A * .7 : HALO_A})`; }
        else { ctx.setLineDash(st.dash || []); ctx.lineWidth = LINE_W; ctx.strokeStyle = `rgba(${WHITE},${st.a})`; }
        ctx.stroke(p);
      }
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function drawTickets(now) {
    if (still) return;
    const s = now / 1000;
    for (const e of edges) {
      if (e.ticket === undefined || e.ea < .6 || e.g < .999) continue;
      const ph = ((s + e.ticket * 1.2) % 3.6) / 1.2;
      if (ph > 1) continue;
      const f = ease(ph), x = lerp(e.a.x, e.b.x, f), y = lerp(e.a.y, e.b.y, f);
      ctx.globalAlpha = e.ea * Math.sin(Math.PI * ph);
      ctx.fillStyle = `rgba(${C.ink},.3)`; ctx.beginPath(); ctx.arc(x, y, 3.8, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgb(${WHITE})`; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawNodes(now) {
    for (const n of nodes) {
      if (n.a < .02 || n.kind === 'none') continue;
      const x = n.x, y = n.y, k = n.s;
      if (k < .02) continue;
      ctx.globalAlpha = n.a;
      if (n.kind === 'soc') {
        const r = (n.small ? 2.1 : 2.7) * k;
        ctx.fillStyle = `rgba(${C.paper},.92)`; ctx.beginPath(); ctx.arc(x, y, r + 1.6 * k, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgb(${C.ink2})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      } else if (n.kind === 'eng') {
        const h = (n.small ? 2 : 2.5) * k, o = h + 1.6 * k;
        ctx.fillStyle = `rgba(${C.paper},.92)`; ctx.fillRect(x - o, y - o, o * 2, o * 2);
        ctx.fillStyle = `rgb(${C.ink})`; ctx.fillRect(x - h, y - h, h * 2, h * 2);
      } else if (n.kind === 'hub') {
        const h = 6.5 * k;
        ctx.fillStyle = `rgb(${C.paper})`; ctx.fillRect(x - h, y - h, h * 2, h * 2);
        ctx.lineWidth = 1.4; ctx.strokeStyle = `rgb(${C.ink})`; ctx.strokeRect(x - h + .7, y - h + .7, Math.max(0, h * 2 - 1.4), Math.max(0, h * 2 - 1.4));
        ctx.fillStyle = `rgb(${C.ink})`; ctx.fillRect(x - 2 * k, y - 2 * k, 4 * k, 4 * k);
      } else if (n.kind === 'open') {
        const r = (n.small ? 2.6 : 4.4) * k;
        ctx.fillStyle = `rgba(${C.paper},.95)`; ctx.beginPath(); ctx.arc(x, y, r + 1.4 * k, 0, TAU); ctx.fill();
        ctx.lineWidth = 1.2; ctx.strokeStyle = `rgb(${C.ink})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      } else if (n.kind === 'gate') {
        // a small portal: two posts and a lintel
        const g = new Path2D(); g.moveTo(x - 4 * k, y + 5 * k); g.lineTo(x - 4 * k, y - 4 * k); g.lineTo(x + 4 * k, y - 4 * k); g.lineTo(x + 4 * k, y + 5 * k);
        ctx.lineWidth = 3.6; ctx.strokeStyle = `rgba(${C.paper},.85)`; ctx.stroke(g);
        ctx.lineWidth = 1.6; ctx.strokeStyle = `rgb(${C.ink})`; ctx.stroke(g);
      } else if (n.kind === 'token') {
        ctx.fillStyle = `rgb(${C.paper})`; ctx.beginPath(); ctx.arc(x, y, 5.2 * k, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgb(${C.ink})`; ctx.beginPath(); ctx.arc(x, y, 3.4 * k, 0, TAU); ctx.fill();
      } else if (n.kind === 'me') {
        if (!still) {
          const ph = (now % 2800) / 2800;
          ctx.globalAlpha = .32 * (1 - ph) * Math.min(1, k);
          ctx.lineWidth = 1; ctx.strokeStyle = `rgb(${C.ink})`; ctx.beginPath(); ctx.arc(x, y, 8 + ph * 16, 0, TAU); ctx.stroke();
          ctx.globalAlpha = n.a;
        }
        ctx.fillStyle = `rgba(${C.paper},.95)`; ctx.beginPath(); ctx.arc(x, y, 6.4 * k, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgb(${C.ink})`; ctx.beginPath(); ctx.arc(x, y, 4.3 * k, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // leader lines grow from the node toward their label, and fade with it on the way out
  function drawLeads(leads) {
    for (const l of leads) {
      if (l.a < .02 || l.g < .01) continue;
      const ex = l.x1 + (l.x2 - l.x1) * l.g, ey = l.y1 + (l.y2 - l.y1) * l.g;
      ctx.globalAlpha = l.a;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(ex, ey);
      ctx.lineWidth = 2.6; ctx.strokeStyle = `rgba(${C.paper},.7)`; ctx.stroke();
      ctx.lineWidth = .8; ctx.strokeStyle = `rgba(${C.ink},.62)`; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // a checkpoint is saved: a small white tick rises over the climber
  function drawFlash(now) {
    const e = (now - flashT0) / 1500;
    if (e < 0 || e > 1 || still) return;
    const me = byId.me;
    const x = me.x + 10, y = me.y - 22 - e * 12;
    ctx.globalAlpha = 1 - smooth(.55, 1, e);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const tick = new Path2D(); tick.moveTo(x - 4, y); tick.lineTo(x - 1, y + 3); tick.lineTo(x + 5, y - 4);
    ctx.lineWidth = 4; ctx.strokeStyle = `rgba(${C.ink},.3)`; ctx.stroke(tick);
    ctx.lineWidth = 1.6; ctx.strokeStyle = `rgb(${WHITE})`; ctx.stroke(tick);
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    ctx.globalAlpha = 1;
  }

  // ?debug: every track over the film, to check a retune
  function drawDebug(t) {
    ctx.font = `600 10px ${C.label}`;
    ctx.textBaseline = 'middle';
    for (const name of Object.keys(F.track)) {
      const p = api.at(name, t);
      if (!p) continue;
      const [x, y] = view.px(p[0], p[1], t);
      ctx.strokeStyle = 'rgba(0,120,255,.95)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
      ctx.fillStyle = 'rgba(0,90,220,1)'; ctx.fillText(name, x + 8, y - 7);
    }
    ctx.font = `500 9px ${C.label}`;
    ctx.fillStyle = 'rgba(160,0,160,.95)';
    for (const n of nodes) if (n.a > .3 && n.kind !== 'none') ctx.fillText(n.id || n.role, n.x + 6, n.y + 8);
    const ex = exclusion(t);
    ctx.strokeStyle = 'rgba(0,120,255,.7)'; ctx.setLineDash([3, 3]); ctx.strokeRect(ex.x, ex.y, ex.w, ex.h); ctx.setLineDash([]);
    const S = api.noteArea();
    ctx.strokeStyle = 'rgba(0,160,90,.7)'; ctx.strokeRect(S.x, S.y, S.w, S.h);
  }

  function render(t, now, dt) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    positions(t, now, dt);
    const leads = still ? [] : layoutNotes(t, now, dt);
    drawShapes(t);
    drawEdges();
    drawTickets(now);
    drawLeads(leads);
    drawNodes(now);
    drawFlash(now);
    if (debug && !still) drawDebug(t);
  }

  /* ---------------- Hover: who is this? ---------------- */
  function hover() {
    const p = api.pointer;
    if (!p.on || p.down || api.spotHover()) { if (tipShown) { api.tip(null); tipShown = false; } return; }
    const fb = api.frame(), x = p.x - fb.left, y = p.y - fb.top, hit = p.touch ? 20 : 12;
    let best = null, bd = hit * hit;
    for (const n of nodes) {
      if (n.a < .5 || n.kind === 'none') continue;
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < bd) { bd = d; best = n; }
    }
    if (best) { api.tip({ title: best.kind === 'eng' || best.kind === 'hub' ? 'system' : best.kind === 'me' ? 'the climber' : best.kind === 'gate' ? 'a turn' : best.kind === 'open' ? 'waiting' : 'person', line: best.role }, best.x + fb.left, best.y + fb.top - 8); tipShown = true; }
    else if (tipShown) { api.tip(null); tipShown = false; }
  }

  /* ---------------- Public ---------------- */
  function init(a) {
    api = a; F = a.FILM; debug = a.debug;
    cv = document.querySelector('.net');
    notesEl = document.querySelector('.notes');
    legendEl = document.querySelector('.net-legend');
    if (cv) ctx = cv.getContext('2d');
    view = liveView;
    readColours();
    addEventListener('tas:palette', readColours);
    addEventListener('tas:type', () => { readColours(); measureNotes(); });   // a new face: new label sizes
    build();
    buildNotes();
    summaries();
    layout();
  }
  function rebuild() { view = liveView; build(); buildNotes(); }
  function layout() {
    if (!cv) return;
    const fb = api.frame(), host = api.filmBox();
    W = Math.max(1, fb.width); H = Math.max(1, fb.height);
    DPR = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    const style = `left:${(fb.left - host.left).toFixed(1)}px;top:${(fb.top - host.top).toFixed(1)}px;width:${W.toFixed(1)}px;height:${H.toFixed(1)}px`;
    cv.style.cssText = style;
    if (notesEl) notesEl.style.cssText = style;
    measureNotes();
  }
  function frame(t, now) {
    if (!ctx) return;
    const dt = clamp((now - lastNow) / 1000, .001, .05);
    lastNow = now;
    view = liveView; still = false;
    render(t, now, dt);
    hover();
  }
  function hide() {
    if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); }
    notes.forEach(n => setOn(n, false));
  }
  function flash() { flashT0 = performance.now(); }

  // Reduced motion: the same network, drawn once over each still frame.
  function drawStill(canvas, t) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const saved = { ctx, W, H, DPR, view };
    DPR = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
    ctx = canvas.getContext('2d'); W = w; H = h;
    view = stillView(w, h); still = true;
    render(t, 0, .016);
    ({ ctx, W, H, DPR, view } = saved);
    still = false;
  }

  // For screen readers: what the film says at each station, in words.
  function summaries() {
    document.querySelectorAll('.station').forEach(sec => {
      const key = sec.dataset.key;
      const words = (F.notes || []).filter(n => n.s === key).map(n => n.text);
      if (!words.length || sec.querySelector('.film-says')) return;
      const p = document.createElement('p');
      p.className = 'sr film-says';
      p.textContent = `In the film here: ${words.join('; ')}.`;
      sec.appendChild(p);
    });
  }

  // peek: for tests (?test), the scene nodes and their visibility as functions of film time
  const peek = () => ({ nodes, shapes, byId });
  return { init, rebuild, layout, frame, hide, flash, drawStill, measure: measureNotes, peek };
})();
