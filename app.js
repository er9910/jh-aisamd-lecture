/* Slide reveal + count-up + background mood orchestration */
(function () {
  const stage = document.querySelector('deck-stage');
  if (!stage) return;

  // section dividers / hero slides get an intense, lively background
  const INTENSE = new Set([0, 4, 8, 19, 25, 30, 33]); // 0-based slide indices

  function countUp(el, to, dur) {
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(to * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // run the per-slide entrance once the slide is actually rendered/visible.
  // deck-stage keeps inactive slides at visibility:hidden, and animations
  // created while hidden freeze at frame 0 — so defer to the next frames.
  function runEntrance(slide, index) {
    const inner = slide.querySelector('.inner');
    if (inner) {
      void inner.offsetWidth; // reflow so re-entry replays
      inner.classList.add('is-active');
    }

    if (window.deckBG) window.deckBG.setMood(INTENSE.has(index) ? 0.85 : 0.18);

    // chart: count-up numbers (bar heights are inline --ph in the HTML)
    const vals = slide.querySelectorAll('.val[data-to]');
    if (vals.length) {
      vals.forEach((v, i) => {
        v.textContent = '0';
        setTimeout(() => countUp(v, +v.dataset.to, 1300), 360 + i * 100);
      });
    }
  }

  function activate(slide, index) {
    // reset every slide's reveal immediately so the outgoing one is clean
    document.querySelectorAll('deck-stage > section .inner.is-active')
      .forEach((n) => n.classList.remove('is-active'));
    if (!slide) return;
    // wait two frames: the new slide's visibility:visible must apply and
    // paint before its CSS animations are created, or they freeze at 0.
    requestAnimationFrame(() => requestAnimationFrame(() => runEntrance(slide, index)));
  }

  stage.addEventListener('slidechange', (e) => {
    activate(e.detail.slide, e.detail.index);
  });

  // initial — in case slidechange already fired before listener attached
  function initFirst() {
    const slides = [...stage.querySelectorAll(':scope > section')];
    let active = stage.querySelector(':scope > section[data-deck-active]');
    if (!active) active = slides[0];
    if (active && !active.querySelector('.inner.is-active')) {
      activate(active, slides.indexOf(active));
    }
  }
  setTimeout(initFirst, 120);
  setTimeout(initFirst, 500);
})();
