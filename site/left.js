/* The left column's dichotomy, after version 11: section headings, case images, the dichotomy
   rails, the services pair and the seams between stations sit apart while they enter and join
   by the time they reach reading height. --s is the split: 1 apart, 0 joined.
   Positions are measured once per layout (film.js calls measure); film.js's one loop calls
   update with the scroll position, so no box is read while the page scrolls. */
const LeftColumn = (() => {
  'use strict';
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = v => 1 - (1 - v) * (1 - v);
  const items = [];

  function init() {
    // Headings: both parts are real text in the markup; the cut runs between them.
    document.querySelectorAll('.col h2.dz').forEach(el => items.push({ el, kind: 'head' }));
    // Images: the original keeps the left half, an aria-hidden twin carries the right half.
    document.querySelectorAll('.col .study-image, .col .plate-image, .col .bldg').forEach(panel => {
      const img = panel.querySelector('img');
      if (!img) return;
      // The twin starts without a source: a copy made with its src would load at once (a detached image is
      // never lazy), and every image down the page would be fetched on arrival. It takes the original's
      // file only once the original has loaded, from the cache.
      const twin = document.createElement('img');
      twin.className = 'dz-twin';
      twin.alt = '';
      twin.setAttribute('aria-hidden', 'true');
      twin.decoding = 'async';
      ['width', 'height'].forEach(k => { if (img.hasAttribute(k)) twin.setAttribute(k, img.getAttribute(k)); });
      const give = () => { if (!twin.getAttribute('src')) twin.src = img.currentSrc || img.src; };
      // until the twin can show its half, the original shows the whole picture
      twin.addEventListener('load', () => panel.classList.add('dz-ready'), { once: true });
      if (img.complete && img.naturalWidth) give(); else img.addEventListener('load', give, { once: true });
      img.classList.add('dz-left');
      img.after(twin);
      items.push({ el: panel, kind: 'image' });
    });
    // Services: two practices on two surfaces, stacked in the column, joined on a red seam.
    // Each half joins on its own; the seam's × follows the pair.
    document.querySelectorAll('.col .practice').forEach(el => {
      items.push({ el, kind: 'practice' });
      el.querySelectorAll('.practice-half').forEach(h => items.push({ el: h, kind: 'half' }));
    });
    // Dichotomy rails: one pair per station.
    document.querySelectorAll('.col .drail').forEach(el => items.push({ el, kind: 'rail' }));
    // Floor numbers (version 15): cast from the bottom up as their floor reaches reading height.
    document.querySelectorAll('.col .floor-no').forEach(el => items.push({ el, kind: 'num' }));
    // Seams between stations: two lines drawn from the edges, closed by a red ×.
    document.querySelectorAll('.station[data-seam] > .col').forEach(col => {
      const seam = document.createElement('div');
      seam.className = 'dz-seam';
      seam.setAttribute('aria-hidden', 'true');
      seam.innerHTML = '<span></span><b>×</b><span></span>';
      col.prepend(seam);
      items.push({ el: seam, kind: 'seam' });
    });
  }

  // Page positions, read once per layout; the transforms these items carry never move their tops.
  function measure() {
    const y = window.scrollY;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      it.top = r.top + y;
      it.h = r.height;
      it.s = -1;
    }
  }

  // y: the scroll position; H: the reading area (the window, or above the film band on phones).
  function update(y, H, joined, mobile) {
    const join = mobile ? .72 : .68, span = 1.04 - join;
    for (const it of items) {
      let s = 0;
      if (!joined && it.top !== undefined) {
        const top = it.top - y;
        if (it.kind === 'seam') s = ease(clamp((top / H - (mobile ? .62 : .58)) / .36));
        // the centre of short elements, a little below the top edge of tall ones
        else s = ease(clamp(((top + Math.min(it.h, H * .2) / 2) / H - join) / span));
      }
      if (Math.abs(s - it.s) < .002 && (s > 0 || it.s === 0) && (s < 1 || it.s === 1)) continue;
      it.s = s;
      it.el.style.setProperty('--s', s.toFixed(3));
    }
  }

  return { init, measure, update };
})();
