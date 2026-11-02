/*
  pics.js
  Lumi never shows emoji. Every picture is drawn, with soft shading so things look rounded and real
  rather than flat. This file has:
  - shared gradients (one hidden <svg> in the page) used by every drawing for light and shadow
  - LP, a small toolkit for drawing shaded things:
      LP.vol(markup, colour, opts)   a shape (or shapes) filled with a colour, then shaded and outlined
      LP.drop(cx, cy, rx, ry, o)     a soft shadow on the ground
      LP.shine(cx, cy, rx, ry, rot)  a white highlight
      LP.add(key(s), { label, vb, svg } or { label, fn(size) })   register a picture
      LP.svg(key, size)              a registered picture as an <svg> (size: number or '1em')
  - window.lumiPic(key, size): pictures by key (an emoji character, or a name like 'tissuepack')
  - the emoji sweeper: any emoji that still reaches the screen (from data, labels, settings) is swapped
    for its drawing as soon as it appears, sized to the text around it (1em).
  Pictures are drawn on a 48 x 48 grid unless they say otherwise (vb).
*/
(function () {
  'use strict';

  // ---------------------------------------------------------------- shared light and shadow
  const DEFS = `<svg id="lp-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>
    <radialGradient id="lpShade" cx="34%" cy="26%" r="88%"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></radialGradient>
    <linearGradient id="lpShadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <linearGradient id="lpShadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
    <linearGradient id="lpGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".3" stop-color="#fff" stop-opacity=".15"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>
    <linearGradient id="lpMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6F8"/><stop offset=".45" stop-color="#C9D1D9"/><stop offset=".55" stop-color="#E3E8ED"/><stop offset="1" stop-color="#9AA6B2"/></linearGradient>
    <linearGradient id="lpWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A877"/><stop offset="1" stop-color="#B07D4F"/></linearGradient>
    <linearGradient id="lpMarble" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#EEF0F2"/><stop offset="1" stop-color="#DADFE4"/></linearGradient>
    <radialGradient id="lpDrop"><stop offset="0" stop-color="#3B2A20" stop-opacity=".34"/><stop offset=".6" stop-color="#3B2A20" stop-opacity=".14"/><stop offset="1" stop-color="#3B2A20" stop-opacity="0"/></radialGradient>
    <radialGradient id="lpGlow"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></radialGradient>
    <linearGradient id="lpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F7"/><stop offset="1" stop-color="#EAF6FC"/></linearGradient>
    <linearGradient id="lpFloorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset=".25" stop-color="#000" stop-opacity="0"/></linearGradient>
  </defs></svg>`;
  function injectDefs() {
    if (document.getElementById('lp-defs') || !document.body) return;
    document.body.insertAdjacentHTML('afterbegin', DEFS);
  }
  injectDefs();
  document.addEventListener('DOMContentLoaded', injectDefs);

  // ---------------------------------------------------------------- the toolkit
  const INK = '#3B2F2F';
  const LP = {
    INK,
    // a shaded shape: colour, then the light/shadow overlay, then a soft outline
    vol(markup, colour, o) {
      const op = o || {};
      const shade = op.shade === 'v' ? 'lpShadeV' : op.shade === 'h' ? 'lpShadeH' : 'lpShade';
      const line = op.line === false ? '' : `<g fill="none" stroke="${op.lineColour || INK}" stroke-opacity="${op.lineOpacity == null ? 0.55 : op.lineOpacity}" stroke-width="${op.lineWidth || 1.6}" stroke-linejoin="round" stroke-linecap="round">${markup}</g>`;
      return `<g fill="${colour}">${markup}</g>${op.flat ? '' : `<g fill="url(#${shade})">${markup}</g>`}${line}`;
    },
    drop: (cx, cy, rx, ry, o) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#lpDrop)"${o && o.opacity ? ` opacity="${o.opacity}"` : ''}/>`,
    shine: (cx, cy, rx, ry, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".7"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`,
    line: (d, colour, w) => `<path d="${d}" fill="none" stroke="${colour || INK}" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round"/>`,
    REG: {},
    add(keys, def) { [].concat(keys).forEach((k) => { LP.REG[norm(k)] = def; }); },
    has: (k) => !!LP.REG[norm(k)],
    label: (k) => (LP.REG[norm(k)] ? LP.REG[norm(k)].label : ''),
    svg(key, size, cls) {
      const def = LP.REG[norm(key)];
      if (!def) return null;
      const s = size == null ? 48 : size;
      if (def.fn) return def.fn(s, cls);
      return `<svg class="pic ${cls || ''}" width="${s}" height="${s}" viewBox="${def.vb || '0 0 48 48'}" role="img" aria-label="${def.label || ''}">${typeof def.svg === 'function' ? def.svg() : def.svg}</svg>`;
    }
  };
  // emoji keys are matched without the "show as emoji" marker (U+FE0F) and skin tones
  function norm(k) { return String(k).replace(/️/g, '').replace(/[\u{1F3FB}-\u{1F3FF}]/gu, ''); }
  window.LP = LP;

  // the older picture hook (icons.js) keeps working: our drawings first, then the old ones
  const older = window.lumiPic;
  window.lumiPic = (key, size) => LP.svg(key, size) || (older ? older(key, size) : null);
  const olderLabel = window.lumiPicLabel;
  window.lumiPicLabel = (key) => LP.label(key) || (olderLabel ? olderLabel(key) : key);

  // ---------------------------------------------------------------- the emoji sweeper
  // one emoji, including joined ones (person + medical sign) and the "as emoji" marker
  const EMOJI = /\p{Extended_Pictographic}(?:️|[\u{1F3FB}-\u{1F3FF}])*(?:‍\p{Extended_Pictographic}(?:️|[\u{1F3FB}-\u{1F3FF}])*)*/gu;
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1, TITLE: 1 };
  const missing = new Set();
  function picFor(seq) {
    if (LP.has(seq)) return LP.svg(seq, '1em', 'em-pic');
    // a joined emoji we have not drawn: use its first part (for example the person)
    const first = seq.split('‍')[0];
    if (LP.has(first)) return LP.svg(first, '1em', 'em-pic');
    missing.add(seq);
    return null;
  }
  function sweepText(node) {
    const t = node.nodeValue;
    if (!t || !EMOJI.test(t)) { EMOJI.lastIndex = 0; return; }
    EMOJI.lastIndex = 0;
    const p = node.parentNode;
    if (!p || SKIP[p.nodeName] || (p.closest && p.closest('svg'))) return;
    const frag = document.createDocumentFragment();
    let last = 0;
    let changed = false;
    t.replace(EMOJI, (m, at) => {
      const svg = picFor(m);
      if (!svg) return m;
      if (at > last) frag.appendChild(document.createTextNode(t.slice(last, at)));
      const span = document.createElement('span');
      span.className = 'em';
      span.innerHTML = svg;
      frag.appendChild(span);
      last = at + m.length;
      changed = true;
      return m;
    });
    if (!changed) return;
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    p.replaceChild(frag, node);
  }
  function sweep(root) {
    if (!root) return;
    if (root.nodeType === 3) { sweepText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(sweepText);
  }
  LP.sweep = sweep;
  LP.missing = missing;
  function start() {
    const stage = document.getElementById('stage') || document.body;
    sweep(stage);
    new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (m.type === 'characterData') sweepText(m.target);
        else m.addedNodes.forEach((n) => sweep(n));
      });
    }).observe(stage, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
