(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  if (!('IntersectionObserver' in window) || typeof Element.prototype.animate !== 'function') return;
  const controllers = [];
  const positions = {
    portal: { first: [218, 405], second: [1353, 789], start: [710, 825], states: ['application', 'workspace'] },
    catalog: { first: [200, 349], second: [1342, 918], start: [690, 851], states: ['selected', 'source'] }
  };
  const canPlay = () => !reduced.matches && !document.hidden && !connection?.saveData;

  document.querySelectorAll('[data-app-film]').forEach(panel => {
    const image = panel.querySelector('img');
    const stage = panel.querySelector('.film-stage');
    const cursor = panel.querySelector('.film-cursor');
    const ripple = panel.querySelector('.film-click');
    const config = positions[panel.dataset.appFilm];
    if (!image || !stage || !cursor || !ripple || !config) return;
    const animations = new Set();
    const timers = new Set();
    let visible = false;
    let played = false;
    let running = false;
    let generation = 0;
    panel.dataset.filmState = 'still';

    function resize() {
      const scale = Math.min(panel.clientWidth / 1586, panel.clientHeight / 992);
      stage.style.setProperty('--film-scale', String(scale));
      stage.style.setProperty('--film-x', `${(panel.clientWidth - 1586 * scale) / 2}px`);
      stage.style.setProperty('--film-y', `${(panel.clientHeight - 992 * scale) / 2}px`);
    }
    function track(element, frames, options) {
      const animation = element.animate(frames, options);
      animations.add(animation);
      const release = () => animations.delete(animation);
      animation.addEventListener('finish', release, { once: true });
      animation.addEventListener('cancel', release, { once: true });
      return animation;
    }
    function stop(staticPoster = false) {
      generation++;
      running = false;
      panel.dataset.filmPaused = 'true';
      timers.forEach(clearTimeout);
      timers.clear();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      panel.dataset.filmState = staticPoster || !played ? 'still' : config.states[1];
    }
    function later(delay, callback, token) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (generation === token && running && visible && canPlay()) callback();
      }, delay);
      timers.add(timer);
    }
    function click(point) {
      ripple.style.left = `${point[0] - 20}px`;
      ripple.style.top = `${point[1] - 20}px`;
      track(ripple, [{ opacity: .95, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1.65)' }], { duration: 360, easing: 'ease-out' });
    }
    async function start() {
      if (played || running || !visible || !canPlay()) return;
      const token = ++generation;
      try {
        if (!image.complete) await image.decode();
        if (token !== generation || !visible || !canPlay() || image.naturalWidth === 0) return;
        running = true;
        panel.dataset.filmPaused = 'false';
        resize();
        panel.dataset.filmState = 'preview';
        const at = (point, opacity, offset) => ({ transform: `translate(${point[0]}px,${point[1]}px)`, opacity, offset, easing: 'cubic-bezier(.3,0,.25,1)' });
        const movement = track(cursor, [
          at(config.start, 0, 0), at(config.start, 1, .1),
          at(config.first, 1, .3), at(config.first, 1, .43),
          at(config.second, 1, .68), at(config.second, 1, .88),
          at(config.second, 0, 1)
        ], { duration: 4800, easing: 'linear' });
        later(1480, () => { click(config.first); panel.dataset.filmState = config.states[0]; }, token);
        later(3320, () => { click(config.second); panel.dataset.filmState = config.states[1]; }, token);
        movement.addEventListener('finish', () => {
          if (token === generation) { played = true; stop(); }
        }, { once: true });
      } catch (_) {
        // Loading or animation failures always fall back to the complete static image.
        if (token === generation) stop(true);
      }
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        visible = entry.isIntersecting && entry.intersectionRatio >= .6;
        if (visible) start();
        else stop();
      });
    }, { threshold: [0, .6] });
    observer.observe(panel);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(panel);
    else addEventListener('resize', resize, { passive: true });
    resize();
    controllers.push({ start, stop });
  });
  function sync() {
    controllers.forEach(controller => {
      if (!canPlay()) controller.stop(reduced.matches || Boolean(connection?.saveData));
      else controller.start();
    });
  }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  connection?.addEventListener?.('change', sync);
  addEventListener('pagehide', () => controllers.forEach(controller => controller.stop()));
})();
