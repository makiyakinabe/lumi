/*
  rugs.js
  Lumi's rug. Wherever Lumi stands on a floor (home, menu, chat, room, games...), a soft, cute rug is laid
  under his feet, so he is never standing on a plain flat block. The child can collect and choose rugs in
  Lumi's room (Room > Rugs). The Cloud rug is free; the others cost a few stars.

  How it works: after every screen is drawn, each floor is checked for a big Lumi standing on it. If there
  is one, a rug picture is placed just under his feet (behind him and his pets). Screens where Lumi is
  not on the floor (in bed, in the bath, at the table) get no rug.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { S, state, ic, esc, say, tone, save, render } = A;

  // ---------------------------------------------------------------- the rug pictures (320 x 110, seen lying on the floor)
  const CX = 160;
  const CY = 55;
  const ring = (n, rx, ry, fn) => Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2; return fn(CX + rx * Math.cos(a), CY + ry * Math.sin(a), a, k); }).join('');
  const heart = (x, y, c) => `<path d="M${x} ${y + 5}c-5-3-10-5-10-9a5 3.4 0 0 1 10-1a5 3.4 0 0 1 10 1c0 4-5 6-10 9z" fill="${c}"/>`;
  const star = (x, y, r, c) => {
    let d = '';
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5; const rr = k % 2 ? r * 0.45 : r; d += `${k ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a) * 0.62).toFixed(1)}`; }
    return `<path d="${d}z" fill="${c}" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`;
  };
  const thick = (rx, ry, c) => `<ellipse cx="${CX}" cy="${CY + 5}" rx="${rx}" ry="${ry}" fill="${c || '#5A3C28'}" opacity=".14"/>`;

  const RUGS = [
    {
      id: 'cloud', name: 'Cloud rug', price: 0,
      art: () => thick(156, 48) +
        ring(24, 146, 43, (x, y) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="17" ry="11" fill="#fff"/>`) +
        `<ellipse cx="${CX}" cy="${CY}" rx="146" ry="43" fill="#fff"/><ellipse cx="${CX}" cy="${CY}" rx="128" ry="35" fill="#BFE3F7"/>` +
        `<ellipse cx="${CX}" cy="${CY}" rx="110" ry="27" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 8" stroke-linecap="round"/>` +
        heart(66, 52, '#F7B6CD') + heart(254, 52, '#F7B6CD') + `<circle cx="108" cy="80" r="4" fill="#fff"/><circle cx="212" cy="80" r="4" fill="#fff"/><circle cx="118" cy="30" r="3.5" fill="#fff"/><circle cx="202" cy="30" r="3.5" fill="#fff"/>`
    },
    {
      id: 'bear', name: 'Bear rug', price: 3,
      art: () => thick(150, 46) +
        `<ellipse cx="84" cy="16" rx="30" ry="16" fill="#D9A06B"/><ellipse cx="236" cy="16" rx="30" ry="16" fill="#D9A06B"/><ellipse cx="84" cy="17" rx="16" ry="8" fill="#F7C9C9"/><ellipse cx="236" cy="17" rx="16" ry="8" fill="#F7C9C9"/>` +
        `<ellipse cx="${CX}" cy="${CY}" rx="146" ry="44" fill="#E7B98A"/><ellipse cx="${CX}" cy="${CY + 2}" rx="118" ry="32" fill="#F6DDBF"/>` +
        `<ellipse cx="${CX}" cy="${CY}" rx="138" ry="40" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 8" stroke-linecap="round" opacity=".8"/>` +
        `<circle cx="138" cy="88" r="4" fill="#6B4A3A"/><circle cx="182" cy="88" r="4" fill="#6B4A3A"/><ellipse cx="${CX}" cy="93" rx="7" ry="4.5" fill="#6B4A3A"/><ellipse cx="124" cy="94" rx="8" ry="4" fill="#F5A3A3" opacity=".7"/><ellipse cx="196" cy="94" rx="8" ry="4" fill="#F5A3A3" opacity=".7"/>`
    },
    {
      id: 'flower', name: 'Flower rug', price: 4,
      art: () => thick(156, 50) +
        ring(10, 118, 34, (x, y) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="42" ry="20" fill="#F7A8C4" stroke="#fff" stroke-width="3"/>`) +
        `<ellipse cx="${CX}" cy="${CY}" rx="112" ry="32" fill="#F7A8C4"/><ellipse cx="${CX}" cy="${CY}" rx="96" ry="26" fill="#FFE07A"/>` +
        ring(14, 80, 19, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#F4B400"/>`)
    },
    {
      id: 'stripes', name: 'Stripy rug', price: 4,
      art: () => {
        const cols = ['#FFB3BA', '#FFD8A8', '#FFF1A8', '#BDEBC8', '#B8DDF8', '#D7C6F2'];
        let bands = '';
        for (let i = 0; i < 12; i++) bands += `<rect x="${12 + i * 25}" y="0" width="26" height="110" fill="${cols[i % cols.length]}"/>`;
        let tassel = '';
        for (let k = -2; k <= 2; k++) tassel += `<path d="M14 ${CY + k * 9} h-12 M306 ${CY + k * 9} h12" stroke="#E7A9B6" stroke-width="4" stroke-linecap="round"/>`;
        return thick(150, 46) + tassel + `<defs><clipPath id="rugStripe"><ellipse cx="${CX}" cy="${CY}" rx="146" ry="43"/></clipPath></defs><g clip-path="url(#rugStripe)">${bands}</g>` +
          `<ellipse cx="${CX}" cy="${CY}" rx="146" ry="43" fill="none" stroke="#fff" stroke-width="6"/><ellipse cx="${CX}" cy="${CY}" rx="132" ry="37" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 8" stroke-linecap="round"/>`;
      }
    },
    {
      id: 'starry', name: 'Starry rug', price: 5,
      art: () => thick(152, 47) +
        `<ellipse cx="${CX}" cy="${CY}" rx="148" ry="45" fill="#8C9AE0"/><ellipse cx="${CX}" cy="${CY}" rx="138" ry="40" fill="#46549E"/>` +
        `<path d="M86 34a16 10 0 1 0 14 16a12 8 0 1 1 -14 -16z" fill="#FFE07A"/>` +
        star(226, 36, 11, '#FFE07A') + star(252, 66, 7, '#FFE07A') + star(66, 72, 8, '#FFE07A') + star(118, 86, 5, '#fff') + star(198, 88, 6, '#FFE07A') +
        `<circle cx="140" cy="24" r="2.5" fill="#fff"/><circle cx="186" cy="20" r="2" fill="#fff"/><circle cx="278" cy="50" r="2" fill="#fff"/><circle cx="40" cy="50" r="2" fill="#fff"/>`
    },
    {
      id: 'rainbow', name: 'Rainbow rug', price: 6,
      art: () => {
        const cols = ['#FF8A80', '#FFB74D', '#FFE066', '#8BD38F', '#7FC4F0', '#B79CE8', '#FFF7EC'];
        return thick(152, 47) + cols.map((c, i) => `<ellipse cx="${CX}" cy="${CY}" rx="${148 - i * 18}" ry="${45 - i * 5.5}" fill="${c}"/>`).join('') +
          ring(18, 148, 45, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#fff"/>`);
      }
    }
  ];
  const RUG = Object.fromEntries(RUGS.map((r) => [r.id, r]));
  // Calm minimal: a quiet outlined rug, no pattern
  const MINIMAL = () => `<ellipse cx="${CX}" cy="${CY}" rx="146" ry="43" fill="#fff" stroke="#C9D3D6" stroke-width="5"/><ellipse cx="${CX}" cy="${CY}" rx="122" ry="33" fill="none" stroke="#DCE3E5" stroke-width="3" stroke-dasharray="6 9" stroke-linecap="round"/>`;

  const owned = () => (Array.isArray(state.rugs) ? state.rugs : (state.rugs = ['cloud']));
  const current = () => (RUG[state.rug] && owned().includes(state.rug) ? state.rug : 'cloud');
  function rugSvg(id, width, cls) {
    const w = width || 320;
    const minimal = document.querySelector('#stage.art-minimal, .art-minimal') && !cls;
    const inner = minimal ? MINIMAL() : (RUG[id] || RUG.cloud).art();
    return `<svg class="rug-svg ${cls || ''}" width="${Math.round(w)}" height="${Math.round((w * 110) / 320)}" viewBox="-12 -4 344 118" aria-hidden="true">${inner}</svg>`;
  }
  A.rugSvg = (id, width) => rugSvg(id || current(), width);

  // ---------------------------------------------------------------- lay the rug under Lumi's feet on every floor
  function layRugs() {
    const root = A.stage.querySelector('#screen');
    if (!root) return;
    root.querySelectorAll('.floor').forEach((floor) => {
      const panel = floor.parentElement;
      if (!panel || panel.querySelector(':scope > .lumi-rug') || panel.querySelector('.wk-rug')) return;
      // the biggest Lumi in this scene (not the little faces on buttons)
      let lumi = null;
      let best = 0;
      panel.querySelectorAll('svg.lumi').forEach((s) => {
        if (s.closest('button.ch-open, .bubble, .pet-buddy')) return;
        const w = parseFloat(s.getAttribute('width')) || 0;
        if (w > best) { best = w; lumi = s; }
      });
      if (!lumi || best < 120) return;
      const pr = panel.getBoundingClientRect();
      if (!pr.width) return;
      const k = panel.offsetWidth / pr.width; // the stage is scaled to fit the screen
      const lr = lumi.getBoundingClientRect();
      const fr = floor.getBoundingClientRect();
      const feetY = (lr.top + lr.height * (244 / 268) - pr.top) * k; // Lumi's feet sit at 230 in his 268 box
      const floorTop = (fr.top - pr.top) * k;
      if (feetY < floorTop - 6) return; // Lumi is not standing on this floor
      const cx = (lr.left + lr.width / 2 - pr.left) * k;
      const lw = lr.width * k;
      const pets = lumi.parentElement && lumi.parentElement.querySelector('.pet-buddy');
      const w = Math.min(panel.offsetWidth * 0.98, lw * (pets ? 1.45 : 1.12));
      const h = (w * 118) / 344;
      const el = document.createElement('div');
      el.className = 'lumi-rug';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = `left:${Math.round(cx - w / 2)}px;top:${Math.round(feetY - h * 0.52)}px;width:${Math.round(w)}px;height:${Math.round(h)}px`;
      el.innerHTML = rugSvg(current(), w);
      floor.insertAdjacentElement('afterend', el);
    });
    // the wake-up game's rug (slide Lumi onto it) uses the child's rug too
    const wk = root.querySelector('.wk-rug');
    if (wk && !wk.querySelector('.rug-svg')) wk.innerHTML = rugSvg(current(), wk.offsetWidth || 190);
  }
  const prevAfter = A.afterRender;
  A.afterRender = () => { if (prevAfter) prevAfter(); try { layRugs(); } catch (e) { /* the rug is only decoration */ } };

  // ---------------------------------------------------------------- Room > Rugs
  A.rugTiles = () => RUGS.map((r) => {
    const have = owned().includes(r.id);
    const on = current() === r.id;
    const afford = state.stars >= r.price;
    const status = on ? `<span class="ic-green">${ic('check', 28)}</span>`
      : have ? '<span class="rug-wear">Use</span>'
        : `<span class="price ${afford ? '' : 'grey'}">${ic(afford ? 'star' : 'starGrey', 20)}${r.price}</span>`;
    return `<button class="item-tile rug-tile ${have ? 'owned' : ''} ${on || S.roomSel === 'rug:' + r.id ? 'sel' : ''} ${!have && !afford ? 'locked' : ''}" data-a="rugPick" data-id="${r.id}" aria-label="${esc(r.name)}${on ? ', on the floor now' : have ? ', yours' : ', ' + r.price + ' stars'}" aria-pressed="${on}">
      <span class="item-art">${rugSvg(r.id, 118, 'thumb')}</span>${status}</button>`;
  }).join('');
  A.rugBuyBar = () => {
    const id = (S.roomSel || '').replace('rug:', '');
    const r = RUG[id];
    if (!r) return '';
    const afford = state.stars >= r.price;
    return `<div class="buy-bar">
      <span class="item-art">${rugSvg(r.id, 90, 'thumb')}</span>
      <span class="label grow">${esc(r.name)}</span>
      <button class="primary ${afford ? '' : 'faded'}" data-a="rugBuy" data-id="${r.id}" style="height:72px" aria-label="Buy for ${r.price} stars">${ic('shop', 32)}${ic('star', 28)}<span>${r.price}</span></button>
    </div>`;
  };
  function use(id) {
    state.rug = id;
    save();
    S.roomSel = null;
    render();
  }
  Object.assign(A.ACTIONS, {
    rugPick: (d) => {
      const r = RUG[d.id];
      if (!r) return;
      if (owned().includes(r.id)) { use(r.id); tone(587, 0.2, 0.06); say(`${r.name}. Lumi likes it!`); return; }
      S.roomSel = 'rug:' + r.id;
      render();
      say(state.stars >= r.price ? `${r.name}. ${r.price} stars. Tap to buy it.` : `${r.name}. You need ${r.price - state.stars} more stars.`);
    },
    rugBuy: (d) => {
      const r = RUG[d.id];
      if (!r) return;
      if (state.stars < r.price) { say(`You need ${r.price - state.stars} more stars.`); return; }
      state.stars -= r.price;
      owned().push(r.id);
      tone(659, 0.3, 0.1);
      use(r.id);
      say(`A new ${r.name.toLowerCase()} for Lumi!`);
    }
  });
})();
