/* Borrowed palettes for the Sisyphus film pages. Each palette recolours the page tokens and grades the
   black-and-white film through a gradient map (shadows → highlights), so the film's sky melts into the page.
   Choose with the dock, the [ and ] keys, or ?palette=<id>. "original" keeps the plain black and white. */
(() => {
  'use strict';

  const PALETTES = [
    { id: 'original', name: 'Original', ref: 'Black and white, red ×',
      page: null, film: null },
    { id: 'cyanotype', name: 'Cyanotype', ref: 'Anna Atkins, Photographs of British Algae, 1843',
      page: { chalk: '#f3f0e8', chalk2: '#e9e5da', ink: '#0d2a4f', ink2: '#2f4b74', muted: '#536a8c', accent: '#c4432a' },
      film: ['#0b2547', '#1f4f86', '#86a7c8', '#f3f0e8'] },
    { id: 'klein', name: 'Klein Blue', ref: 'Yves Klein, IKB 79, 1959',
      page: { chalk: '#ffffff', chalk2: '#f1f3fb', ink: '#0b0b0b', ink2: '#3a3a3a', muted: '#585b66', accent: '#002fa7' },
      film: ['#001552', '#002fa7', '#8fa4e8', '#ffffff'] },
    { id: 'riso', name: 'Risograph', ref: 'Riso duotone: Federal Blue and Fluorescent Pink',
      page: { chalk: '#f6f2eb', chalk2: '#ede7dd', ink: '#1d2b6e', ink2: '#3a4887', muted: '#5d6696', accent: '#e8338c' },
      film: ['#1d2b6e', '#5a4c9c', '#ff94c8', '#f6f2eb'] },
    { id: 'aerochrome', name: 'Aerochrome', ref: 'Kodak infrared film; Richard Mosse, Infra, 2011',
      page: { chalk: '#fff4f7', chalk2: '#fbe4eb', ink: '#2a0c24', ink2: '#57294b', muted: '#7d4f70', accent: '#d10f5a' },
      film: ['#2a0c24', '#8f1d5a', '#f593b7', '#fff4f7'] },
    { id: 'thermal', name: 'Thermal', ref: 'Thermal imaging, the ironbow scale',
      page: { chalk: '#f7f5f2', chalk2: '#eeeae4', ink: '#140b2c', ink2: '#3a2c5a', muted: '#625879', accent: '#f25a00' },
      film: ['#140b2c', '#4f0f78', '#b81f5c', '#f26a10', '#ffc94d', '#f7f5f2'] },
    { id: 'stalker', name: 'Stalker', ref: 'Andrei Tarkovsky, Stalker, 1979',
      page: { chalk: '#ecebe0', chalk2: '#e1e0d1', ink: '#1b211a', ink2: '#40473b', muted: '#5f6656', accent: '#a9491f' },
      film: ['#131913', '#465641', '#b5bb9f', '#ecebe0'] },
    { id: 'algiers', name: 'Algiers noon', ref: 'Albert Camus, Noces, 1938',
      page: { chalk: '#fbf8f1', chalk2: '#f1ecdf', ink: '#10265c', ink2: '#2c477f', muted: '#566790', accent: '#b87400' },
      film: ['#0d2256', '#2b56a8', '#bccde4', '#fbf8f1'] },
    { id: 'exat', name: 'EXAT 51', ref: 'EXAT 51, Zagreb, 1951 — Yugoslav modernism',
      page: { chalk: '#dcdcd6', chalk2: '#d0d0c9', ink: '#121212', ink2: '#353533', muted: '#52524e', accent: '#d8211a' },
      film: ['#161616', '#5f5f5a', '#a9a9a3', '#dcdcd6'] },
    { id: 'washi', name: 'Washi & vermilion', ref: 'Yasujirō Ozu; the vermilion hanko seal',
      page: { chalk: '#f2ede3', chalk2: '#e8e1d3', ink: '#1b1a17', ink2: '#45423b', muted: '#6b665d', accent: '#c9341b' },
      film: ['#1b1a17', '#5b564d', '#c7bfb0', '#f2ede3'] },
    { id: 'floors', name: 'Floors', ref: 'Version 04: hazy concrete sky, cast concrete, a red ×',
      page: { chalk: '#e9e6e0', chalk2: '#eeece7', ink: '#17191a', ink2: '#34373a', muted: '#54575a', accent: '#c62318' },
      film: ['#17191a', '#54575a', '#b8b4ab', '#e9e6e0'] },
    { id: 'haze2049', name: '2049 haze', ref: 'Blade Runner 2049, 2017 — Roger Deakins’ orange Las Vegas',
      page: { chalk: '#fbefe2', chalk2: '#f4dfc8', ink: '#2a1206', ink2: '#5a2b12', muted: '#7c4e30', accent: '#cc0000' },
      film: ['#1e0b03', '#7a2e0b', '#e98a3c', '#fbefe2'] },
    // Round two, wilder. Two are dark: Negative prints the film in reverse (its fog turns to night, so the stars
    // come out over a black sky), Gilded lights it in gold on black.
    { id: 'negative', name: 'Negative', ref: 'The film printed in reverse: the fog turns to night',
      page: { chalk: '#0e0f12', chalk2: '#181a1f', ink: '#f1ede4', ink2: '#c9c4b8', muted: '#9a958a', accent: '#ff3b1f' },
      film: ['#efeae0', '#8d8a84', '#2b2c31', '#0e0f12'] },
    { id: 'gilded', name: 'Gilded', ref: 'Gold on black, and the red of the posters: an opening night',
      page: { chalk: '#0c0b09', chalk2: '#17150f', ink: '#f3e6c0', ink2: '#cfc09a', muted: '#9c8f6d', accent: '#cc0000' },
      film: ['#0c0b09', '#3b3322', '#b59a5a', '#f3e6c0'] },
    { id: 'acid', name: 'Acid', ref: 'Rave flyers, 1990s: acid lime and hot pink',
      page: { chalk: '#f3ffd9', chalk2: '#e6f7c2', ink: '#0f1400', ink2: '#33400a', muted: '#56622c', accent: '#c8005f' },
      film: ['#0b1000', '#3f6200', '#c4f500', '#f3ffd9'] },
    { id: 'bauhaus', name: 'Bauhaus', ref: 'Bauhaus, Dessau, 1925: primaries on paper',
      page: { chalk: '#f4efe3', chalk2: '#ebe3d1', ink: '#121212', ink2: '#33302b', muted: '#5e5a52', accent: '#d4231a' },
      film: ['#0f1d4a', '#2c56c9', '#f2c12e', '#f4efe3'] },
    { id: 'miami', name: 'Miami', ref: 'Miami Vice, 1984: a synthwave sunset',
      page: { chalk: '#fff1f5', chalk2: '#fde0ea', ink: '#1d0f3a', ink2: '#3d2a6b', muted: '#6a5a8c', accent: '#c9105f' },
      film: ['#1d0f3a', '#a3195b', '#ff9f7a', '#fff1f5'] },
    { id: 'phosphor', name: 'Phosphor', ref: 'A green phosphor screen, with a red alarm',
      page: { chalk: '#ebf6ec', chalk2: '#d9eedb', ink: '#03200b', ink2: '#164a22', muted: '#3d6b47', accent: '#c81d25' },
      film: ['#000b03', '#00521a', '#3fe063', '#ebf6ec'] },
    { id: 'neon', name: 'Neon', ref: 'Tokyo at night: violet and electric cyan',
      page: { chalk: '#f2f0ff', chalk2: '#e3dfff', ink: '#130f36', ink2: '#2f2a6b', muted: '#5a5591', accent: '#d1127a' },
      film: ['#0a0522', '#3b1a96', '#29d9ff', '#f2f0ff'] },
    { id: 'constructivist', name: 'Constructivist', ref: 'Rodchenko and Lissitzky: red and black on aged paper',
      page: { chalk: '#f1e5cc', chalk2: '#e7d6b4', ink: '#121212', ink2: '#34302a', muted: '#5e574b', accent: '#cc0000' },
      film: ['#121212', '#5c0b0b', '#c93a28', '#f1e5cc'] },
    { id: 'glacier', name: 'Glacier', ref: 'Glacier ice and a safety-orange flag',
      page: { chalk: '#eef6fb', chalk2: '#dcecf6', ink: '#0a2131', ink2: '#24465e', muted: '#4d6a7e', accent: '#b93c0c' },
      film: ['#05121c', '#1e4d6b', '#9fd3ee', '#eef6fb'] },
    { id: 'lavender', name: 'Lavender dusk', ref: 'Lavender dusk under a burnt-orange sun',
      page: { chalk: '#f6f1fb', chalk2: '#ebe1f6', ink: '#25163b', ink2: '#463466', muted: '#6d5d88', accent: '#c4410c' },
      film: ['#170d27', '#664796', '#d6bff0', '#f6f1fb'] },
    { id: 'memphis', name: 'Memphis', ref: 'Memphis Group, Milan, 1981: indigo, teal and yellow',
      page: { chalk: '#fff7e6', chalk2: '#ffecc2', ink: '#1b1464', ink2: '#3a3290', muted: '#5f58a8', accent: '#cf0072' },
      film: ['#1b1464', '#00a3a3', '#ffd23f', '#fff7e6'] },
  ];

  // Type pairings (display / text / labels). Fonts load from Google Fonts only when chosen;
  // the dock's "Aa" previews load a two-glyph subset of each display face.
  const TYPES = [
    { id: 'original', name: 'Libre Franklin', ref: 'The dichotomy site', display: "'Libre Franklin'", text: "'Libre Franklin'", label: "'Libre Franklin'", weight: 500, tracking: '-.04em' },
    { id: 'grotesk', name: 'Space Grotesk', ref: 'Space Grotesk + IBM Plex', display: "'Space Grotesk'", text: "'IBM Plex Sans'", label: "'IBM Plex Mono'", weight: 500, tracking: '-.035em',
      gf: ['Space+Grotesk:wght@400;500;600', 'IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400', 'IBM+Plex+Mono:wght@400;500'], pv: 'Space+Grotesk:wght@500' },
    { id: 'editorial', name: 'Instrument Serif', ref: 'Instrument Serif + Instrument Sans', display: "'Instrument Serif'", text: "'Instrument Sans'", label: "'JetBrains Mono'", weight: 400, tracking: '-.01em',
      gf: ['Instrument+Serif:ital@0;1', 'Instrument+Sans:ital,wght@0,400..700;1,400..700', 'JetBrains+Mono:wght@400;500'], pv: 'Instrument+Serif' },
    { id: 'swiss', name: 'Schibsted Grotesk', ref: 'Swiss style: one grotesk for everything', display: "'Schibsted Grotesk'", text: "'Schibsted Grotesk'", label: "'Schibsted Grotesk'", weight: 600, tracking: '-.04em',
      gf: ['Schibsted+Grotesk:ital,wght@0,400..900;1,400..900'], pv: 'Schibsted+Grotesk:wght@600' },
    { id: 'brutal', name: 'Archivo Expanded', ref: 'Archivo at 125% width + Space Mono', display: "'Archivo'", text: "'Archivo'", label: "'Space Mono'", weight: 750, tracking: '-.03em', stretch: '125%',
      gf: ['Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900', 'Space+Mono:wght@400;700'], pv: 'Archivo:wdth,wght@125,750' },
    { id: 'modernist', name: 'Syne', ref: 'Syne + Manrope + Geist Mono', display: "'Syne'", text: "'Manrope'", label: "'Geist Mono'", weight: 600, tracking: '-.02em',
      gf: ['Syne:wght@400..800', 'Manrope:wght@400..700', 'Geist+Mono:wght@400;500'], pv: 'Syne:wght@600' },
    { id: 'literary', name: 'Fraunces', ref: 'Fraunces + Newsreader', display: "'Fraunces'", text: "'Newsreader'", label: "'IBM Plex Mono'", weight: 400, tracking: '-.02em',
      gf: ['Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700', 'Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600', 'IBM+Plex+Mono:wght@400;500'], pv: 'Fraunces:wght@400' },
    { id: 'gallery', name: 'Bodoni Moda', ref: 'Bodoni Moda + Hanken Grotesk', display: "'Bodoni Moda'", text: "'Hanken Grotesk'", label: "'Hanken Grotesk'", weight: 500, tracking: '-.015em',
      gf: ['Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700', 'Hanken+Grotesk:ital,wght@0,400..700;1,400..700'], pv: 'Bodoni+Moda:wght@500' },
    { id: 'blueprint', name: 'Barlow Condensed', ref: 'Barlow Condensed + Martian Mono', display: "'Barlow Condensed'", text: "'Barlow'", label: "'Martian Mono'", weight: 500, tracking: '0em',
      gf: ['Barlow+Condensed:ital,wght@0,400;0,500;0,600;1,400', 'Barlow:ital,wght@0,400;0,500;1,400', 'Martian+Mono:wght@400;500'], pv: 'Barlow+Condensed:wght@500' },
    { id: 'terminal', name: 'JetBrains Mono', ref: 'JetBrains Mono + IBM Plex Sans', display: "'JetBrains Mono'", text: "'IBM Plex Sans'", label: "'JetBrains Mono'", weight: 500, tracking: '-.04em',
      gf: ['JetBrains+Mono:ital,wght@0,400..700;1,400', 'IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400'], pv: 'JetBrains+Mono:wght@500' },
    { id: 'bricolage', name: 'Bricolage Grotesque', ref: 'Bricolage Grotesque + Fragment Mono', display: "'Bricolage Grotesque'", text: "'Bricolage Grotesque'", label: "'Fragment Mono'", weight: 600, tracking: '-.035em',
      gf: ['Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800', 'Fragment+Mono:ital@0;1'], pv: 'Bricolage+Grotesque:wght@600' },
    // round two, wilder
    { id: 'unbounded', name: 'Unbounded', ref: 'Unbounded + Inter Tight + Space Mono: wide and round', display: "'Unbounded'", text: "'Inter Tight'", label: "'Space Mono'", weight: 600, tracking: '-.03em',
      gf: ['Unbounded:wght@300..900', 'Inter+Tight:ital,wght@0,400..700;1,400', 'Space+Mono:wght@400;700'], pv: 'Unbounded:wght@600' },
    { id: 'shoulders', name: 'Big Shoulders', ref: 'Big Shoulders + Public Sans: Chicago industrial, condensed', display: "'Big Shoulders Display'", text: "'Public Sans'", label: "'IBM Plex Mono'", weight: 800, tracking: '0em',
      gf: ['Big+Shoulders+Display:wght@100..900', 'Public+Sans:ital,wght@0,400..700;1,400', 'IBM+Plex+Mono:wght@400;500'], pv: 'Big+Shoulders+Display:wght@800' },
    { id: 'anton', name: 'Anton', ref: 'Anton + Work Sans + DM Mono: the poster', display: "'Anton'", text: "'Work Sans'", label: "'DM Mono'", weight: 400, tracking: '0em',
      gf: ['Anton', 'Work+Sans:ital,wght@0,400..700;1,400', 'DM+Mono:wght@400;500'], pv: 'Anton' },
    { id: 'dela', name: 'Dela Gothic One', ref: 'Dela Gothic One + Zen Kaku Gothic: a Tokyo poster', display: "'Dela Gothic One'", text: "'Zen Kaku Gothic New'", label: "'Space Mono'", weight: 400, tracking: '-.01em',
      gf: ['Dela+Gothic+One', 'Zen+Kaku+Gothic+New:wght@400;500;700', 'Space+Mono:wght@400;700'], pv: 'Dela+Gothic+One' },
    { id: 'bungee', name: 'Bungee', ref: 'Bungee + Karla + Silkscreen: signs and pixels', display: "'Bungee'", text: "'Karla'", label: "'Silkscreen'", weight: 400, tracking: '0em',
      gf: ['Bungee', 'Karla:ital,wght@0,400..700;1,400', 'Silkscreen:wght@400;700'], pv: 'Bungee' },
    { id: 'major', name: 'Major Mono', ref: 'Major Mono Display + Sora: a strange machine', display: "'Major Mono Display'", text: "'Sora'", label: "'Major Mono Display'", weight: 400, tracking: '-.02em',
      gf: ['Major+Mono+Display', 'Sora:wght@300..700'], pv: 'Major+Mono+Display' },
    { id: 'cormorant', name: 'Cormorant', ref: 'Cormorant Garamond + Jost: fashion', display: "'Cormorant Garamond'", text: "'Jost'", label: "'Jost'", weight: 500, tracking: '-.01em',
      gf: ['Cormorant+Garamond:ital,wght@0,300..700;1,300..700', 'Jost:ital,wght@0,300..700;1,400'], pv: 'Cormorant+Garamond:wght@500' },
    { id: 'abril', name: 'Abril Fatface', ref: 'Abril Fatface + Source Serif + Courier Prime: the newspaper', display: "'Abril Fatface'", text: "'Source Serif 4'", label: "'Courier Prime'", weight: 400, tracking: '-.01em',
      gf: ['Abril+Fatface', 'Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400', 'Courier+Prime:wght@400;700'], pv: 'Abril+Fatface' },
    { id: 'tilt', name: 'Tilt Warp', ref: 'Tilt Warp + Outfit: warped and playful', display: "'Tilt Warp'", text: "'Outfit'", label: "'Space Mono'", weight: 400, tracking: '-.02em',
      gf: ['Tilt+Warp', 'Outfit:wght@300..700', 'Space+Mono:wght@400;700'], pv: 'Tilt+Warp' },
    { id: 'climate', name: 'Climate Crisis', ref: 'Climate Crisis + Inter Tight: type that melts', display: "'Climate Crisis'", text: "'Inter Tight'", label: "'JetBrains Mono'", weight: 400, tracking: '-.01em',
      gf: ['Climate+Crisis', 'Inter+Tight:ital,wght@0,400..700;1,400', 'JetBrains+Mono:wght@400;500'], pv: 'Climate+Crisis' },
    { id: 'gloock', name: 'Gloock', ref: 'Gloock + Gantari + Fragment Mono: a sharp serif', display: "'Gloock'", text: "'Gantari'", label: "'Fragment Mono'", weight: 400, tracking: '-.02em',
      gf: ['Gloock', 'Gantari:ital,wght@0,300..800;1,400', 'Fragment+Mono'], pv: 'Gloock' },
    { id: 'syncopate', name: 'Syncopate', ref: 'Syncopate + Manrope: wide capitals', display: "'Syncopate'", text: "'Manrope'", label: "'Space Mono'", weight: 700, tracking: '.01em',
      gf: ['Syncopate:wght@400;700', 'Manrope:wght@400..700', 'Space+Mono:wght@400;700'], pv: 'Syncopate:wght@700' },
  ];
  const FALLBACK = "'Libre Franklin', Arial, sans-serif";
  const GF = 'https://fonts.googleapis.com/css2?';
  const TYPE_KEY = 'tas-type:' + location.pathname;
  const loadedTypes = new Set();

  const root = document.documentElement;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const KEY = 'tas-palette:' + location.pathname;   // each page remembers its own choice

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const rgb = h => hex(h).map(v => Math.round(v * 255)).join(',');

  // One gradient-map filter per palette: luminance first, then a per-channel table from shadow to highlight.
  function buildFilters() {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    const defs = document.createElementNS(SVGNS, 'defs');
    PALETTES.filter(p => p.film).forEach(p => {
      const f = document.createElementNS(SVGNS, 'filter');
      f.id = `pal-${p.id}`;
      f.setAttribute('color-interpolation-filters', 'sRGB');
      const m = document.createElementNS(SVGNS, 'feColorMatrix');
      m.setAttribute('type', 'matrix');
      m.setAttribute('values', '.2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  0 0 0 1 0');
      const t = document.createElementNS(SVGNS, 'feComponentTransfer');
      const stops = p.film.map(hex);
      ['R', 'G', 'B'].forEach((c, i) => {
        const fn = document.createElementNS(SVGNS, `feFunc${c}`);
        fn.setAttribute('type', 'table');
        fn.setAttribute('tableValues', stops.map(s => s[i].toFixed(4)).join(' '));
        t.appendChild(fn);
      });
      f.append(m, t);
      defs.appendChild(f);
    });
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  function apply(id, persist) {
    const p = PALETTES.find(x => x.id === id) || PALETTES[0];
    const s = root.style;
    if (p.page) {
      const c = p.page;
      s.setProperty('--chalk', c.chalk); s.setProperty('--chalk-2', c.chalk2); s.setProperty('--sand', c.chalk2);
      s.setProperty('--ink', c.ink); s.setProperty('--ochre-ink', c.ink); s.setProperty('--ink-2', c.ink2);
      s.setProperty('--muted', c.muted); s.setProperty('--ochre', c.muted); s.setProperty('--red', c.accent);
      s.setProperty('--line', `rgba(${rgb(c.ink)},.16)`);
      s.setProperty('--pal-filter', `contrast(1.07) brightness(var(--film-bri,1.12)) url(#pal-${p.id})`);
      s.setProperty('--pal-map', `url(#pal-${p.id})`);   // the plain gradient map, for stills and objects
      root.dataset.palette = p.id;
    } else {
      ['--chalk', '--chalk-2', '--sand', '--ink', '--ochre-ink', '--ink-2', '--muted', '--ochre', '--red', '--line', '--pal-filter', '--pal-map']
        .forEach(k => s.removeProperty(k));
      delete root.dataset.palette;
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = p.page ? p.page.chalk : '#ffffff';
    if (persist) { try { localStorage.setItem(KEY, p.id); } catch (e) { /* storage may be unavailable */ } }
    if (dock) {
      dock.querySelectorAll('button[data-id]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === p.id)));
      dock.querySelector('.pal-name').textContent = p.name;
      dock.querySelector('.pal-ref').textContent = `${String(PALETTES.indexOf(p)).padStart(2, '0')} · ${p.ref}`;
      const c = p.page || { chalk: '#ffffff', ink: '#0b0b0b', accent: '#c7240e' };
      const dot = dock.querySelector('.pal-dot');
      dot.style.setProperty('--a', c.chalk); dot.style.setProperty('--b', c.ink); dot.style.setProperty('--c', c.accent);
    }
    current = p.id;
    // Lets canvases and other layers re-read the colour tokens.
    dispatchEvent(new CustomEvent('tas:palette', { detail: { id: p.id } }));
  }

  function addSheet(href) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
  function loadType(t) {
    if (!t.gf || loadedTypes.has(t.id)) return;
    loadedTypes.add(t.id);
    addSheet(GF + t.gf.map(f => 'family=' + f).join('&') + '&display=swap');
  }
  function applyType(id, persist) {
    const t = TYPES.find(x => x.id === id) || TYPES[0];
    const s = root.style;
    if (t.gf) {
      loadType(t);
      s.setProperty('--font-display', `${t.display}, ${FALLBACK}`);
      s.setProperty('--font-text', `${t.text}, ${FALLBACK}`);
      s.setProperty('--font-label', `${t.label}, ${FALLBACK}`);
      s.setProperty('--display-weight', String(t.weight));
      s.setProperty('--display-tracking', t.tracking);
      s.setProperty('--display-stretch', t.stretch || 'normal');
      root.dataset.type = t.id;
    } else {
      ['--font-display', '--font-text', '--font-label', '--display-weight', '--display-tracking', '--display-stretch'].forEach(k => s.removeProperty(k));
      delete root.dataset.type;
    }
    if (persist) { try { localStorage.setItem(TYPE_KEY, t.id); } catch (e) { /* storage may be unavailable */ } }
    if (dock) {
      dock.querySelectorAll('button[data-type]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === t.id)));
      dock.querySelector('.type-name').textContent = `${t.name} · ${t.ref}`;
      const aa = dock.querySelector('.pal-aa');
      aa.style.fontFamily = `${t.display}, ${FALLBACK}`;
      aa.style.fontWeight = String(t.weight);
      aa.style.fontStretch = t.stretch || 'normal';
    }
    currentType = t.id;
    // Layout changes with the face: once it has loaded, let the page measure itself again.
    const faces = [`${t.weight} 40px ${t.display}`, `400 16px ${t.text}`, `500 12px ${t.label}`];
    const done = () => {
      dispatchEvent(new Event('resize'));
      dispatchEvent(new CustomEvent('tas:type', { detail: { id: t.id } }));
    };
    if (document.fonts && document.fonts.load) Promise.all(faces.map(f => document.fonts.load(f))).then(done, done);
    else done();
  }

  let dock = null;
  let current = 'original';
  let currentType = 'original';

  function buildDock() {
    // Collapsed to one small pill so it never covers the text; it opens upward into the swatches.
    dock = document.createElement('div');
    dock.className = 'pal-dock';
    dock.setAttribute('role', 'group');
    dock.setAttribute('aria-label', 'Colour palette and type');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'pal-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="pal-dot" aria-hidden="true"></span><span class="pal-name"></span><span class="pal-aa" aria-hidden="true">Aa</span>';
    const panel = document.createElement('div');
    panel.className = 'pal-panel';
    panel.hidden = true;
    const ref = document.createElement('span');
    ref.className = 'pal-ref';
    const row = document.createElement('div');
    row.className = 'pal-row';
    PALETTES.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.id = p.id;
      b.title = `${p.name} — ${p.ref}`;
      b.setAttribute('aria-label', `Palette: ${p.name}, ${p.ref}`);
      const c = p.page || { chalk: '#ffffff', ink: '#0b0b0b', accent: '#c7240e' };
      b.style.setProperty('--a', c.chalk); b.style.setProperty('--b', c.ink); b.style.setProperty('--c', c.accent);
      b.addEventListener('click', () => apply(p.id, true));
      row.appendChild(b);
    });
    const typeHead = document.createElement('span');
    typeHead.className = 'type-name';
    const typeRow = document.createElement('div');
    typeRow.className = 'type-row';
    TYPES.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.type = t.id;
      b.textContent = 'Aa';
      b.title = `${t.name} — ${t.ref}`;
      b.setAttribute('aria-label', `Type: ${t.name}, ${t.ref}`);
      b.style.fontFamily = `${t.display}, ${FALLBACK}`;
      b.style.fontWeight = String(t.weight);
      if (t.stretch) b.style.fontStretch = t.stretch;
      b.addEventListener('click', () => applyType(t.id, true));
      typeRow.appendChild(b);
    });
    // Two-glyph previews of every display face, so the buttons show their type before it is chosen.
    addSheet(GF + TYPES.filter(t => t.pv).map(t => 'family=' + t.pv).join('&') + '&text=Aa&display=swap');
    const sep = document.createElement('span');
    sep.className = 'pal-sep';
    sep.textContent = 'Type';
    panel.append(ref, row, sep, typeHead, typeRow);
    dock.append(panel, toggle);
    const setOpen = open => {
      dock.classList.toggle('open', open);
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); } });
    document.addEventListener('pointerdown', e => { if (!panel.hidden && !dock.contains(e.target)) setOpen(false); });
    document.body.appendChild(dock);
  }

  function step(d) {
    const i = PALETTES.findIndex(p => p.id === current);
    apply(PALETTES[(i + d + PALETTES.length) % PALETTES.length].id, true);
  }

  function init() {
    buildFilters();
    buildDock();
    let id = new URLSearchParams(location.search).get('palette');
    if (!id) { try { id = localStorage.getItem(KEY); } catch (e) { id = null; } }
    // A page can choose its own default with <html data-palette-default="…">.
    apply(id || root.dataset.paletteDefault || 'original', false);
    let tid = new URLSearchParams(location.search).get('type');
    if (!tid) { try { tid = localStorage.getItem(TYPE_KEY); } catch (e) { tid = null; } }
    applyType(tid || root.dataset.typeDefault || 'original', false);
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === ']') step(1);
      if (e.key === '[') step(-1);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.TAS_PALETTES = { list: PALETTES.map(p => p.id), apply: id => apply(id, false), types: TYPES.map(t => t.id), applyType: id => applyType(id, false) };
})();
