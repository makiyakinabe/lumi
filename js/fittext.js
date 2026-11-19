/*
  fittext.js
  Words always stay inside their button or box, whatever the screen, the text size (Grown-ups › Sensory)
  or the home language. After each draw, every button and a few text boxes (the story words, turn cards,
  plan cards) are checked: if the words (and icon) do not fit, they are made a little smaller, step by step,
  down to 70%. Nothing changes when the words fit, so the designs stay as they are.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { stage } = A;
  const BOXES = '.bar, .sx-bar, button, [role="button"], .sx-words, .turn-card, .plan-card, .nn-card, .su-card, .ok-tile, .cu-words, .feel-card, .tile';
  const SKIP = '.grownup .g-panel, .scroll, .lib-scroll, .quick-phrases';
  const MIN = 0.7;

  // the part of el that its in-flow content needs, compared with the room inside el (screen pixels)
  function spill(el) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return 0;
    const cs = getComputedStyle(el);
    const inner = { l: r.left + parseFloat(cs.borderLeftWidth), r: r.right - parseFloat(cs.borderRightWidth), t: r.top + parseFloat(cs.borderTopWidth), b: r.bottom - parseFloat(cs.borderBottomWidth) };
    let l = Infinity, rr = -Infinity, t = Infinity, b = -Infinity;
    el.childNodes.forEach((n) => {
      let rects = [];
      if (n.nodeType === 3) { if (!n.nodeValue.trim()) return; const rg = document.createRange(); rg.selectNodeContents(n); rects = [...rg.getClientRects()]; }
      else if (n.nodeType === 1) {
        const c = getComputedStyle(n);
        if (c.position === 'absolute' || c.position === 'fixed' || c.display === 'none') return;
        rects = [n.getBoundingClientRect()];
      }
      rects.forEach((q) => { if (!q.width && !q.height) return; l = Math.min(l, q.left); rr = Math.max(rr, q.right); t = Math.min(t, q.top); b = Math.max(b, q.bottom); });
    });
    if (l === Infinity) return 0;
    return Math.max(inner.l - l, rr - inner.r, inner.t - t, b - inner.b);
  }
  function setZ(el, z) {
    el.dataset.fitz = z.toFixed(2);
    [...el.children].forEach((k) => { k.style.zoom = z === 1 ? '' : z.toFixed(2); });
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
    if (direct) { if (!el.dataset.fitfs) el.dataset.fitfs = getComputedStyle(el).fontSize; el.style.fontSize = z === 1 ? '' : `${(parseFloat(el.dataset.fitfs) * z).toFixed(1)}px`; }
  }
  function fitOne(el) {
    if (el.dataset.fitz) setZ(el, 1);
    const k = A.stageScale ? A.stageScale() : 1;
    if (spill(el) <= 2 * k) return;
    for (let z = 0.94; z >= MIN - 0.001; z -= 0.06) {
      setZ(el, z);
      if (spill(el) <= 2 * k) return;
    }
  }
  function fitAll() {
    try {
      stage.querySelectorAll(BOXES).forEach((el) => { if (!el.closest(SKIP) && !el.closest('[hidden]')) fitOne(el); });
    } catch (e) { /* only a helper */ }
  }
  A.fitText = fitAll;
  const prevAfter = A.afterRender;
  A.afterRender = () => { if (prevAfter) prevAfter(); fitAll(); };
  const prevResize = A.onStageResize;
  A.onStageResize = () => { if (prevResize) prevResize(); fitAll(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
})();
