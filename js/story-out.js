/*
  story-out.js
  Three real-life practice stories for going out:
  - 'shop'  At the supermarket: picture list, trolley or basket, find the items, busy and noisy (what helps?),
            queue, the cashier scans, pay, pack the bag, put the milk in the fridge at home.
  - 'mrt'   Taking the MRT: pack the bag, tap in at the gantry, stand behind the yellow line, let people get
            off first, offer a seat, hold the pole, a short delay (what helps?), find the station, tap out.
  - 'party' A birthday party: open the invitation, ring the doorbell, say hello, give the present, loud
            singing (what helps?), blow out the candles, a turn-taking dice game, eat cake, say thank you.
  Built on the story engine in stories.js (A.SX), the same way as story-hawker.js.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { esc, ic, L } = A;
  const W = SX.W;
  const H = SX.H;
  const P = (o) => A.person(o);
  const svg = (vb, inner) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" aria-hidden="true">${inner}</svg>`;
  const inner = (s) => s.replace(/^<svg[^>]*>|<\/svg>$/g, '');
  const txt = (x, y, t, size, fill, o) => `<text x="${x}" y="${y}" text-anchor="${(o && o.anchor) || 'middle'}" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${size}" fill="${fill}"${o && o.ls ? ` letter-spacing="${o.ls}"` : ''}>${esc(t)}</text>`;
  const pip = (o) => L.svg(Object.assign({ look: { color: 'leaf', head: 'partyhat' }, mood: 'excited', size: 200, label: 'Pip' }, o || {}));
  const pipAt = (x, y, s, o) => `<div class="sx-el" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;z-index:${(o && o.z) || 3}">${pip(Object.assign({ size: s }, o || {}))}</div>`;

  // ---------------------------------------------------------------- shared backgrounds
  const tiles = (top, colour, line) => {
    let h = `<rect y="${top}" width="${W}" height="${H - top}" fill="${colour}"/>`;
    for (let r = 0; r < 7; r++) h += `<path d="M0 ${(top + r * ((H - top) / 7)).toFixed(0)}H${W}" stroke="${line}" stroke-width="2" opacity="${0.3 + r * 0.06}"/>`;
    for (let c = -6; c <= 16; c++) h += `<path d="M${W / 2 + c * 46} ${top}L${W / 2 + c * 150} ${H}" stroke="${line}" stroke-width="2" opacity=".3"/>`;
    return h + `<rect y="${top}" width="${W}" height="${H - top}" fill="url(#lpFloorFade)"/>`;
  };
  const wall = (colour, top) => `<rect width="${W}" height="${top}" fill="${colour}"/><rect width="${W}" height="${top}" fill="url(#lpShadeV)" opacity=".25"/>`;
  const lights = (y, n) => Array.from({ length: n }, (_, i) => { const x = 60 + i * (W - 120) / Math.max(1, n - 1); return `<rect x="${x - 50}" y="${y}" width="100" height="12" rx="6" fill="#FFFDF2"/><ellipse cx="${x}" cy="${y + 20}" rx="70" ry="14" fill="url(#lpGlow)" opacity=".7"/>`; }).join('');

  // a living room at home (used by the MRT and party stories)
  SX.bg.outHome = () => `${wall('#F6E7D3', 380)}${tiles(380, '#E2C9A6', '#C9A985')}
    <rect x="70" y="60" width="230" height="170" rx="16" fill="#fff"/><rect x="84" y="74" width="202" height="142" rx="10" fill="url(#lpSky)"/><circle cx="240" cy="120" r="24" fill="#F4D35E"/><rect x="100" y="166" width="96" height="26" rx="13" fill="#fff"/>
    ${vol('<rect x="760" y="250" width="300" height="100" rx="26"/><rect x="780" y="200" width="260" height="80" rx="24"/>', '#B9A6E0')}<path d="M780 350v24M1040 350v24" stroke="#8A6A4A" stroke-width="10" stroke-linecap="round"/>
    ${LP.drop(560, 520, 300, 22)}${vol('<rect x="300" y="360" width="520" height="34" rx="12"/>', '#C99A6B')}<path d="M330 394v120M790 394v120" stroke="#A87B50" stroke-width="16" stroke-linecap="round"/>`;
  // a kitchen at home (shop story ending)
  SX.bg.outKitchen = () => `${wall('#EAF3EC', 360)}${tiles(360, '#DCCDB6', '#C3AF92')}
    ${[0, 1, 2, 3].map((i) => `<rect x="${60 + i * 120}" y="70" width="110" height="110" rx="10" fill="#fff" stroke="#D6E2DA" stroke-width="3"/>`).join('')}
    ${vol('<rect x="40" y="250" width="620" height="140" rx="10"/>', '#E8D3B5')}${vol('<rect x="30" y="236" width="640" height="26" rx="8"/>', '#F4F6F8')}
    ${[0, 1, 2, 3].map((i) => `<rect x="${70 + i * 150}" y="280" width="130" height="90" rx="8" fill="none" stroke="#C9AE88" stroke-width="3"/><rect x="${125 + i * 150}" y="296" width="20" height="6" rx="3" fill="#A88A64"/>`).join('')}`;

  // ================================================================ AT THE SUPERMARKET
  const GROC = {
    apples: { name: 'apples', price: 3, art: () => `${LP.drop(50, 94, 40, 6)}${vol('<circle cx="34" cy="62" r="20"/><circle cx="66" cy="62" r="20"/><circle cx="50" cy="40" r="20"/>', '#E5534B')}${LP.shine(42, 32, 6, 4, -30)}${LP.shine(26, 54, 5, 3, -30)}<path d="M50 22c0-6 3-9 6-11" stroke="#6B4A3A" stroke-width="3" fill="none" stroke-linecap="round"/>${vol('<path d="M54 16c8-6 16-2 16 2-8 4-14 2-16-2z"/>', '#7BC67E')}<path d="M16 50 L84 50 M18 66 L82 66 M28 34 L28 86 M50 22 L50 88 M72 34 L72 86" stroke="#F2D27A" stroke-width="2" opacity=".75"/>` },
    bread: { name: 'bread', price: 2.5, art: () => `${LP.drop(50, 92, 44, 6)}${vol('<path d="M10 82V50c0-18 18-28 40-28s40 10 40 28v32c0 4-3 6-6 6H16c-3 0-6-2-6-6z"/>', '#D9A066')}${vol('<path d="M14 54c0-16 16-26 36-26s36 10 36 26c-10 4-22 6-36 6s-26-2-36-6z"/>', '#B8743C')}<path d="M30 40l8 10M48 36l8 10M66 40l8 10" stroke="#F2D2A6" stroke-width="4" stroke-linecap="round"/>${vol('<rect x="16" y="64" width="68" height="16" rx="4"/>', '#FFFFFF', { lineOpacity: 0.3 })}<path d="M24 72h52" stroke="#E07A5F" stroke-width="3"/>` },
    milk: { name: 'milk', price: 3.5, art: () => `${LP.drop(50, 94, 30, 5)}${vol('<path d="M28 36h44v52c0 3-2 5-5 5H33c-3 0-5-2-5-5z"/>', '#FFFFFF', { shade: 'h' })}${vol('<path d="M28 36l8-16h28l8 16z"/>', '#5B8FD9')}<rect x="44" y="12" width="12" height="8" rx="2" fill="#E5534B"/><rect x="28" y="48" width="44" height="22" fill="#5B8FD9"/>${txt(50, 64, 'MILK', 12, '#fff')}<path d="M34 80q16-8 32 0" stroke="#8EC5F2" stroke-width="3" fill="none"/>` },
    eggs: { name: 'eggs', price: 3, art: () => `${LP.drop(50, 92, 44, 6)}${vol('<path d="M8 60h84l-6 26H14z"/>', '#C9C2B4')}${vol('<ellipse cx="26" cy="54" rx="11" ry="14"/><ellipse cx="50" cy="52" rx="11" ry="14"/><ellipse cx="74" cy="54" rx="11" ry="14"/>', '#F6E7D3')}${vol('<path d="M6 58h88v8H6z"/>', '#DAD3C5', { lineOpacity: 0.3 })}` },
    bananas: { name: 'bananas', price: 2, art: () => `${LP.drop(50, 90, 40, 6)}${vol('<path d="M14 40c6 30 34 44 66 34-24-2-46-14-54-36z"/><path d="M18 34c12 26 42 34 68 22-24 0-44-8-56-26z"/>', '#FFD84D')}<path d="M14 40l-4-8 6-2 4 6z" fill="#6B4A3A"/>` },
    carrots: { name: 'carrots', price: 1.5, art: () => `${LP.drop(50, 92, 36, 6)}${vol('<path d="M30 30l12 0-4 56zM48 28l12 0-4 58zM64 30l12 0-6 54z"/>', '#F4A259')}${vol('<path d="M34 30c-6-12 0-20 4-20 2 8 2 14 0 20zM52 28c-4-12 2-20 6-20 0 8 0 14-2 20zM68 30c-4-12 4-18 8-18 0 8-2 12-4 18z"/>', '#7BC67E')}` }
  };
  const LIST = ['apples', 'bread', 'milk'];
  const ON_SHELF = [['eggs', 360, 86], ['apples', 520, 86], ['carrots', 680, 86], ['milk', 840, 86], ['bananas', 440, 228], ['bread', 760, 228]];
  const groc = (id) => svg('0 0 100 100', GROC[id].art());
  const total = () => LIST.reduce((n, id) => n + GROC[id].price, 0);
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const trolley = (inside) => svg('0 0 200 170', `${LP.drop(100, 162, 90, 8)}<path d="M20 20h22l18 96h116" fill="none" stroke="#3E5463" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>${inside || ''}${vol('<path d="M46 40h146l-14 64H58z"/>', '#C9D1D9', { lineOpacity: 0.6 })}<path d="M46 40h146l-14 64H58z" fill="#fff" opacity=".25"/>${[70, 96, 122, 148, 172].map((x) => `<path d="M${x} 42l-4 60" stroke="#8A97A6" stroke-width="2"/>`).join('')}<path d="M50 62h138M54 84h128" stroke="#8A97A6" stroke-width="2"/>${vol('<circle cx="70" cy="146" r="11"/><circle cx="168" cy="146" r="11"/>', '#3E5463')}${vol('<rect x="10" y="12" width="26" height="12" rx="6"/>', '#E5534B')}`);
  const basket = (inside) => svg('0 0 170 120', `${LP.drop(85, 114, 76, 7)}<path d="M40 40c0-30 90-30 90 0" fill="none" stroke="#B5403A" stroke-width="8" stroke-linecap="round"/>${inside || ''}${vol('<path d="M10 44h150l-14 64H24z"/>', '#E5534B')}${[40, 66, 92, 118, 144].map((x) => `<rect x="${x - 8}" y="58" width="12" height="36" rx="4" fill="#B5403A" opacity=".55"/>`).join('')}`);
  const cartArt = (st, inside) => (st.data.cart === 'basket' ? basket(inside) : trolley(inside));
  const cartInside = (ids, isBasket) => ids.map((id, i) => `<svg x="${(isBasket ? 18 : 56) + i * 40}" y="${isBasket ? -4 : -6}" width="${isBasket ? 64 : 62}" height="${isBasket ? 64 : 62}" viewBox="0 0 100 100">${GROC[id].art()}</svg>`).join('');
  // the picture shopping list (ticks as items are found)
  const listCard = (st) => {
    const got = st.data.got || [];
    return `<div class="ot-list"><b>${ic('pencil', 18)}<span>Lumi's list</span></b>${LIST.map((id) => `<span class="ot-li ${got.includes(id) ? 'got' : ''}"><span class="ot-li-art">${groc(id)}</span><span>${GROC[id].name}</span>${got.includes(id) ? `<i>${ic('check', 18)}</i>` : ''}</span>`).join('')}</div>`;
  };
  const shelfUnit = (x, y, w, h) => `${vol(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`, '#E8EEF2', { shade: 'h' })}${[0, 1, 2].map((r) => `${vol(`<rect x="${x - 6}" y="${y + 120 + r * 142}" width="${w + 12}" height="16" rx="5"/>`, '#C9D1D9')}<rect x="${x}" y="${y + 136 + r * 142}" width="${w}" height="10" fill="#E5534B" opacity=".75"/>`).join('')}`;
  const filler = (x, y, n, seed) => Array.from({ length: n }, (_, i) => { const c = ['#F4A259', '#8EC5F2', '#7FB069', '#B48AD9', '#F2D27A', '#E58BA6'][(i + seed) % 6]; const hh = 44 + ((i * 7 + seed) % 3) * 10; return vol(`<rect x="${x + i * 34}" y="${y - hh}" width="28" height="${hh}" rx="4"/>`, c, { shade: 'h', lineOpacity: 0.35 }) + `<rect x="${x + i * 34 + 4}" y="${y - hh + 12}" width="20" height="12" rx="2" fill="#fff" opacity=".7"/>`; }).join('');
  SX.bg.outMartDoor = () => `${wall('#E9F3EA', 400)}${tiles(400, '#E4E8EC', '#C9D1D9')}${lights(18, 4)}
    ${vol('<rect x="300" y="40" width="520" height="70" rx="14"/>', '#E5534B', { shade: 'v' })}${txt(560, 88, 'FRESHMART', 40, '#fff', { ls: 3 })}
    ${vol('<rect x="320" y="130" width="480" height="290" rx="8"/>', '#B8C4CE')}<rect x="334" y="144" width="222" height="276" fill="url(#lpSky)"/><rect x="564" y="144" width="222" height="276" fill="url(#lpSky)"/>${filler(360, 380, 5, 1)}${filler(600, 380, 5, 3)}<rect x="334" y="144" width="452" height="276" fill="url(#lpGlass)"/><path d="M560 144v276" stroke="#8A97A6" stroke-width="6"/>`;
  SX.bg.outAisle = () => `${wall('#F3F6F8', 470)}${tiles(470, '#E4E8EC', '#C9D1D9')}${lights(16, 5)}
    ${vol('<rect x="440" y="18" width="300" height="46" rx="10"/>', '#7FB069', { shade: 'v' })}${txt(590, 50, 'FRUIT  &  BREAD', 24, '#fff', { ls: 1 })}
    ${shelfUnit(320, 70, 660, 420)}${filler(330, 470, 4, 4)}${filler(830, 470, 4, 1)}
    ${vol('<rect x="20" y="100" width="260" height="380" rx="8"/>', '#E8EEF2', { shade: 'h' })}${[0, 1, 2].map((r) => `${filler(30, 218 + r * 120, 7, r)}${vol(`<rect x="14" y="${220 + r * 120}" width="272" height="14" rx="5"/>`, '#C9D1D9')}`).join('')}`;
  SX.bg.outCheckout = () => `${wall('#F3F6F8', 420)}${tiles(420, '#E4E8EC', '#C9D1D9')}${lights(16, 4)}
    ${shelfUnit(40, 60, 330, 420)}${filler(50, 190, 9, 2)}${filler(50, 332, 9, 4)}
    <path d="M760 40v40" stroke="#9AA6B2" stroke-width="5"/>${vol('<rect x="700" y="76" width="120" height="70" rx="12"/>', '#2E4A7A', { shade: 'v' })}${txt(760, 124, '3', 40, '#FFD23F')}${vol('<circle cx="760" cy="62" r="10"/>', '#7FD18A')}`;
  // the checkout counter, drawn in front of the cashier
  const checkout = (x, y, w, h) => SX.at(x, y, w, h, svg(`0 0 ${w} ${h}`, `${vol(`<rect x="0" y="0" width="${w}" height="${h}" rx="10"/>`, '#DADFE4', { shade: 'v' })}<rect x="0" y="0" width="${w}" height="18" rx="8" fill="#3E5463"/><rect x="0" y="18" width="${w}" height="6" fill="#E5534B"/>`), { z: 2, cls: 'ot-front' });
  const cashier = (o) => SX.at(560, 140, 130, 260, P(Object.assign({ who: 'cashier', h: 260, mood: 'smile' }, o || {})), { z: 1 });

  const shopSteps = [
    {
      id: 'list', bg: 'outMartDoor',
      text: 'Lumi and Mum are going to the supermarket. Lumi has a picture shopping list.',
      task: (st) => (st.s.read ? '' : 'Tap the list to read it.'),
      lumi: { x: 200, y: 550, h: 220 },
      draw(st) {
        let h = SX.at(900, 260, 130, 260, P({ who: 'mum', h: 260, flip: true, item: 'bag', pose: 'give' }), { z: 3 });
        h += SX.at(330, 300, 220, 210, listCard(st), { k: st.s.read ? '' : 'list', label: "Lumi's shopping list", cls: st.s.read ? 'ot-list-open' : 'ot-list-btn', z: 6 });
        if (st.s.read) h += SX.bubble(600, 230, "Apples, bread and milk. Let's find them!", { w: 260, tail: 'right' });
        return h;
      },
      tap(st, k) { if (k !== 'list') return; st.s.read = true; SX.ok(); SX.done(st, 'Apples, bread and milk. Lumi knows what to buy.'); },
      guide: () => ({ sel: '.ot-list-btn', say: 'Tap the list.' })
    },
    {
      id: 'cart', bg: 'outMartDoor',
      text: 'Inside the door there are trolleys and baskets.',
      task: 'Choose a trolley or a basket.',
      lumi: (st) => ({ x: st.data.cart === 'basket' ? 700 : st.data.cart ? 390 : 560, y: 550, h: 210 }),
      draw(st) {
        let h = SX.at(120, 340, 230, 200, trolley(), { k: 'cart', v: 'trolley', label: 'Trolley', cls: `ot-pick ${st.data.cart === 'trolley' ? 'on' : ''}`, z: 6 });
        h += SX.at(800, 390, 200, 150, basket(), { k: 'cart', v: 'basket', label: 'Basket', cls: `ot-pick ${st.data.cart === 'basket' ? 'on' : ''}`, z: 6 });
        h += SX.at(170, 290, 130, 40, '<span class="ot-tag">Trolley</span>', { z: 7 }) + SX.at(835, 340, 130, 40, '<span class="ot-tag">Basket</span>', { z: 7 });
        return h;
      },
      tap(st, k, el, d) { if (k !== 'cart') return; st.data.cart = d.v; SX.ok(); SX.done(st, d.v === 'trolley' ? 'A trolley. Lumi pushes it slowly and carefully.' : 'A basket. Lumi carries it by the handle.'); },
      guide: () => ({ sel: '.ot-pick', say: 'Tap the trolley or the basket.' })
    },
    {
      id: 'find', bg: 'outAisle',
      text: 'Now Lumi looks on the shelves for the things on the list.',
      task: (st) => (st.s.tip || `Drag each thing on the list into the ${st.data.cart === 'basket' ? 'basket' : 'trolley'}.`),
      lumi: { x: 110, y: 565, h: 190 },
      enter(st) { st.data.got = []; },
      draw(st) {
        let h = SX.at(24, 20, 220, 210, listCard(st), { z: 6, label: "Lumi's list" });
        ON_SHELF.forEach(([id, x, y]) => { if (!st.data.got.includes(id)) h += SX.at(x, y, 110, 110, groc(id), { cls: 'sx-drag ot-item', id, label: GROC[id].name, z: 6 }); });
        h += SX.at(190, 370, 220, 190, cartArt(st, cartInside(st.data.got, st.data.cart === 'basket')), { target: true, cls: 'ot-cart', z: 4, label: st.data.cart === 'basket' ? 'Basket' : 'Trolley' });
        if (st.s.tipText) h += SX.bubble(st.s.tipX, st.s.tipY, st.s.tipText, { w: 250 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ot-item', '.ot-cart', (t, el) => {
          const id = el.dataset.id;
          if (!LIST.includes(id)) {
            const sp = ON_SHELF.find((s) => s[0] === id);
            st.s.tipText = `${cap(GROC[id].name)} are not on the list today.`;
            st.s.tipX = Math.min(820, sp[1] - 60);
            st.s.tipY = sp[2] + 120;
            st.s.tip = 'Look at the list. Find apples, bread and milk.';
            SX.nope(null, st.s.tipText + ' Look at the list.');
            SX.render();
            return false;
          }
          st.data.got.push(id);
          st.s.tipText = null; st.s.tip = null;
          A.tone(700 + st.data.got.length * 80, 0.12, 0.05);
          if (st.data.got.length === LIST.length) SX.done(st, 'Lumi found everything on the list!');
          else { SX.render(); SX.say(`${cap(GROC[id].name)}. Tick! What else is on the list?`); }
          return true;
        }, { miss: () => SX.say(`Put it in the ${st.data.cart === 'basket' ? 'basket' : 'trolley'}.`) });
      },
      guide: (st) => { const n = LIST.find((id) => !st.data.got.includes(id)) || LIST[0]; return { sel: `.ot-item[data-id="${n}"]`, say: `Find the ${GROC[n].name}. Drag them in.` }; }
    },
    SX.copeStep({
      id: 'busy', bg: 'outAisle',
      text: 'The supermarket gets busy. A trolley squeaks, a baby cries and a speaker makes an announcement. It feels too loud.',
      lumi: (st) => ({ x: 250, y: 560, h: 220, mood: st.done ? 'calm' : 'worried' }),
      draw: (st) => SX.at(30, 200, 130, 260, P({ who: 'woman', h: 260, item: 'bag', pose: 'give' }), { z: 3 }) + SX.at(470, 330, 90, 180, P({ who: 'baby', h: 180, mood: 'sad' }), { z: 3 }) + SX.at(330, 410, 170, 145, cartArt(st, cartInside(LIST, st.data.cart === 'basket')), { z: 6 }) + SX.bubble(440, 250, 'Waaah!', { w: 110 }),
      options: [SX.HEADPHONES, { label: 'Show my break card', art: SX.ART.breakCard, reply: 'Mum sees the card. They stand in a quiet corner for a minute.' }, SX.BREATHE]
    }),
    {
      id: 'queue', bg: 'outCheckout',
      text: 'Now Lumi goes to the checkout. There is a queue.',
      task: (st) => (st.s.front ? '' : st.s.gap ? 'The line moved! Tap Lumi to move up.' : 'Wait for the person in front to pay.'),
      lumi: (st) => ({ x: st.s.front ? 560 : 880, y: 560, h: 200, mood: st.s.gap ? 'excited' : 'calm' }),
      enter(st) { st.s.ahead = 1; st.s.front = false; SX.later(st, () => { st.s.ahead = 0; st.s.gap = true; A.tone(700, 0.12, 0.05); SX.render(); SX.say('The line moved! Tap Lumi to move up.'); }, 2800); },
      draw(st) {
        let h = cashier({ pose: st.s.ahead ? 'give' : 'stand', item: st.s.ahead ? 'card' : '' }) + checkout(400, 380, 600, 110);
        h += SX.at(st.s.ahead ? 500 : 130, 300, 120, 240, P({ who: 'man', h: 240, flip: !st.s.ahead, item: 'bag', pose: 'give' }), { z: 3 });
        h += SX.at(st.s.front ? 650 : 960, 440, 140, 120, cartArt(st, cartInside(LIST, st.data.cart === 'basket')), { z: 6 });
        if (st.s.gap) h += SX.at(780, 330, 200, 240, '', { k: 'step', label: 'Move up', cls: 'ot-lumihit', z: 7 });
        else if (!st.s.front) h += SX.bubble(800, 240, 'Waiting... 1, 2, 3...', { w: 190 });
        return h;
      },
      tap(st, k) { if (k !== 'step' || !st.s.gap) return; st.s.gap = false; st.s.front = true; SX.ok(); SX.done(st, "It's Lumi's turn. Waiting is hard, and Lumi did it."); },
      guide: (st) => (st.s.gap ? { sel: '.ot-lumihit', say: 'Tap Lumi to move up.' } : null)
    },
    {
      id: 'scan', bg: 'outCheckout',
      text: 'The cashier says hello. Each thing goes over the scanner. Beep!',
      task: (st) => (st.s.n < LIST.length ? 'Drag each thing over the red scanner light.' : ''),
      lumi: { x: 990, y: 560, h: 190, flip: true },
      enter(st) { st.s.scanned = []; st.s.n = 0; },
      draw(st) {
        let h = cashier({ mood: 'talk' }) + checkout(240, 380, 820, 110);
        h += SX.at(560, 356, 140, 46, svg('0 0 140 46', `${vol('<rect x="2" y="4" width="136" height="38" rx="8"/>', '#2B2F4A')}<rect x="14" y="14" width="112" height="18" rx="4" fill="#E5534B" opacity="${st.s.flash ? 1 : 0.6}"/><rect x="14" y="14" width="112" height="18" rx="4" fill="url(#lpGlass)"/>`), { target: true, id: 'scanner', cls: 'ot-scanner', z: 5, label: 'Scanner' });
        const sum = st.s.scanned.reduce((n, id) => n + GROC[id].price, 0);
        h += SX.at(760, 120, 190, 150, `<div class="ot-screen"><span>${st.s.scanned.map((id) => `${cap(GROC[id].name)} ${SX.money(GROC[id].price)}`).join('<br>') || 'Welcome!'}</span><b>Total ${SX.money(sum)}</b></div>`, { z: 3 });
        LIST.forEach((id, i) => {
          if (st.s.scanned.includes(id)) h += SX.at(760 + i * 70, 300, 80, 80, groc(id), { z: 4 });
          else h += SX.at(270 + i * 88, 300, 96, 96, groc(id), { cls: 'sx-drag ot-scanitem', id, label: GROC[id].name, z: 6 });
        });
        return h;
      },
      after(st, box) {
        if (st.s.n >= LIST.length) return;
        SX.dragTo(box, '.ot-scanitem', '.ot-scanner', (t, el) => {
          st.s.scanned.push(el.dataset.id);
          st.s.n += 1;
          st.s.flash = true;
          A.tone(1568, 0.12, 0.07);
          SX.later(st, () => { st.s.flash = false; SX.render(); }, 300);
          if (st.s.n === LIST.length) SX.done(st, `Beep, beep, beep! All scanned. The total is ${SX.money(total())}.`); else { SX.render(); SX.say('Beep!'); }
          return true;
        }, { miss: () => SX.say('Move it over the red light.') });
      },
      guide: () => ({ sel: '.ot-scanitem', say: 'Drag it over the red light.' })
    },
    SX.payStep({
      id: 'pay', bg: 'outCheckout',
      price: () => total(),
      lumi: { x: 260, y: 560, h: 190 },
      counter: { x: 330, y: 300, w: 230, h: 110 },
      draw: (st) => cashier({ pose: st.done ? 'wave' : 'stand' }) + checkout(240, 380, 820, 110),
      doneText: 'Lumi paid. Lumi says "Thank you!" to the cashier.'
    }),
    {
      id: 'pack', bg: 'outCheckout',
      text: 'Now pack the shopping into the bag.',
      task: (st) => (st.s.packed.length < LIST.length ? 'Drag each thing into the green bag.' : ''),
      lumi: { x: 990, y: 560, h: 190, flip: true },
      enter(st) { st.s.packed = []; },
      draw(st) {
        let h = cashier({ pose: 'wave' }) + checkout(240, 380, 820, 110);
        h += SX.at(300, 230, 220, 210, svg('0 0 200 190', `${LP.drop(100, 184, 90, 8)}<path d="M60 70c0-50 80-50 80 0" fill="none" stroke="#3F7A4E" stroke-width="10" stroke-linecap="round"/>${st.s.packed.map((id, i) => `<svg x="${34 + i * 44}" y="18" width="74" height="74" viewBox="0 0 100 100">${GROC[id].art()}</svg>`).join('')}${vol('<path d="M24 70h152l-14 112H38z"/>', '#7FB069')}<path d="M70 120h60" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>`), { target: true, id: 'bag', cls: 'ot-bag', z: 4, label: 'Shopping bag' });
        LIST.forEach((id, i) => { if (!st.s.packed.includes(id)) h += SX.at(620 + i * 96, 290, 92, 92, groc(id), { cls: 'sx-drag ot-packitem', id, label: GROC[id].name, z: 6 }); });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ot-packitem', '.ot-bag', (t, el) => {
          st.s.packed.push(el.dataset.id);
          A.tone(600 + st.s.packed.length * 90, 0.1, 0.05);
          if (st.s.packed.length === LIST.length) SX.done(st, 'All packed! Lumi carries the bag.'); else SX.render();
          return true;
        }, { miss: () => SX.say('Put it in the green bag.') });
      },
      guide: () => ({ sel: '.ot-packitem', say: 'Drag it into the bag.' })
    },
    {
      id: 'home', bg: 'outKitchen',
      text: 'Lumi and Mum are home. Milk must stay cold.',
      task: (st) => (st.s.tip || 'Put the milk in the fridge.'),
      lumi: { x: 560, y: 560, h: 200 },
      draw(st) {
        let h = SX.at(760, 70, 300, 470, svg('0 0 300 470', `${LP.drop(150, 462, 140, 12)}${vol('<rect x="10" y="4" width="280" height="452" rx="22"/>', '#F4F6F8', { shade: 'h' })}${st.done
          ? `<rect x="26" y="20" width="248" height="420" rx="12" fill="#E3F1FA"/>${[120, 230, 340].map((y) => `<rect x="26" y="${y}" width="248" height="8" fill="#C9D1D9"/>`).join('')}<svg x="80" y="250" width="90" height="90" viewBox="0 0 100 100">${GROC.milk.art()}</svg><ellipse cx="150" cy="60" rx="90" ry="30" fill="url(#lpGlow)"/>`
          : '<path d="M10 170h280" stroke="#C9D1D9" stroke-width="4"/><rect x="246" y="60" width="14" height="80" rx="7" fill="#9AA6B2"/><rect x="246" y="200" width="14" height="120" rx="7" fill="#9AA6B2"/>'}`), { target: true, id: 'fridge', cls: 'ot-fridge', z: 3, label: 'Fridge' });
        h += SX.at(40, 270, 130, 260, P({ who: 'mum', h: 260, mood: 'smile' }), { z: 4 });
        LIST.forEach((id, i) => { if (!(st.done && id === 'milk')) h += SX.at(220 + i * 120, 140, 100, 100, groc(id), { cls: `sx-drag ot-homeitem ${id === 'milk' ? 'milk' : ''}`, id, label: GROC[id].name, z: 6 }); });
        if (st.s.tipText) h += SX.bubble(200, 260, st.s.tipText, { w: 300, tail: 'up' });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ot-homeitem', '.ot-fridge', (t, el) => {
          if (el.dataset.id !== 'milk') { st.s.tipText = el.dataset.id === 'bread' ? 'Bread goes in the cupboard. Find the milk.' : 'Apples can stay in the fruit bowl. Find the milk.'; st.s.tip = 'Which one is the milk?'; SX.nope(null, st.s.tipText); SX.render(); return false; }
          st.s.tipText = null;
          SX.done(st, 'The milk is in the fridge. Lumi did the shopping!');
          return true;
        }, { miss: () => SX.say('Put the milk in the fridge.') });
      },
      guide: () => ({ sel: '.ot-homeitem.milk', say: 'Drag the milk into the fridge.' })
    }
  ];
  SX.story({ id: 'shop', title: 'At the supermarket', tint: '#DDF0D8', steps: shopSteps });

  // ================================================================ TAKING THE MRT
  const backpack = (inside, open) => svg('0 0 200 220', `${LP.drop(100, 214, 86, 8)}<path d="M60 40c0-36 80-36 80 0" fill="none" stroke="#3E5463" stroke-width="10" stroke-linecap="round"/>${vol('<path d="M28 60c0-20 16-30 72-30s72 10 72 30v132c0 10-8 18-18 18H46c-10 0-18-8-18-18z"/>', '#4FB3A9')}${open ? '<path d="M40 60c0-14 14-20 60-20s60 6 60 20z" fill="#2B5E5A"/>' : ''}${inside || ''}${vol('<rect x="54" y="130" width="92" height="56" rx="14"/>', '#3E958F')}<path d="M70 150h60" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>`);
  const bottle = () => svg('0 0 50 110', `${LP.drop(25, 106, 18, 4)}${vol('<rect x="10" y="22" width="30" height="82" rx="10"/>', '#8EC5F2', { shade: 'h' })}<rect x="10" y="22" width="30" height="82" rx="10" fill="url(#lpGlass)"/>${vol('<rect x="14" y="6" width="22" height="18" rx="5"/>', '#2F7E79')}<rect x="10" y="56" width="30" height="20" fill="#2F7E79" opacity=".6"/>`);
  const ball = () => svg('0 0 80 80', `${LP.drop(40, 76, 30, 5)}${vol('<circle cx="40" cy="38" r="32"/>', '#F4A259')}<path d="M10 38h60M40 6v64" stroke="#C9783A" stroke-width="3"/>${LP.shine(28, 24, 8, 5, -30)}`);
  // [id, label, art, width, height, viewBox (for showing it inside the bag)]
  const PACK = [['card', 'Travel card', () => SX.prop.card(), 120, 80, '0 0 90 60'], ['phone', 'Phone', () => SX.prop.phone(), 60, 108, '0 0 50 90'], ['bottle', 'Water bottle', bottle, 56, 112, '0 0 50 110'], ['ball', 'Ball', ball, 84, 84, '0 0 80 80']];
  const NEED = ['card', 'phone', 'bottle'];
  const gantryRow = (sign) => `${wall('#E3ECF2', 380)}${tiles(380, '#D3DCE4', '#B4C1CC')}${lights(18, 4)}
    ${vol('<rect x="360" y="40" width="400" height="66" rx="12"/>', '#2B2F4A', { shade: 'v' })}${txt(560, 86, sign, 30, '#FFC727', { ls: 2 })}
    ${[200, 920].map((x) => `${vol(`<rect x="${x - 60}" y="250" width="120" height="200" rx="14"/>`, '#C9D1D9', { shade: 'h' })}${vol(`<rect x="${x - 60}" y="240" width="120" height="24" rx="10"/>`, '#3E4A5A')}`).join('')}`;
  const gantry = (open) => svg('0 0 360 260', `${LP.drop(180, 250, 170, 12)}${vol('<rect x="10" y="40" width="110" height="210" rx="16"/><rect x="240" y="40" width="110" height="210" rx="16"/>', '#C9D1D9', { shade: 'h' })}${vol('<rect x="10" y="30" width="110" height="26" rx="10"/><rect x="240" y="30" width="110" height="26" rx="10"/>', '#3E4A5A')}
    ${open ? vol('<path d="M120 120l26 -50 10 6-26 50z"/><path d="M240 120l-26 -50-10 6 26 50z"/>', '#E5534B', { lineOpacity: 0.4 }) : vol('<path d="M120 110h56v24h-56z"/><path d="M184 110h56v24h-56z"/>', '#E5534B', { lineOpacity: 0.4 })}
    ${vol('<rect x="64" y="58" width="50" height="34" rx="6"/>', open ? '#7FD18A' : '#FFD23F')}<path d="M78 76q11 -10 22 0" fill="none" stroke="#3E4A5A" stroke-width="3" stroke-linecap="round"/>${open ? '<path d="M150 196l18 18 30-38" fill="none" stroke="#3FA45A" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' : ''}`);
  SX.bg.outConcourse = () => gantryRow('TO PLATFORM');
  SX.bg.outExit = () => `${gantryRow('ORCHARD  NS22')}${vol('<rect x="900" y="130" width="180" height="56" rx="10"/>', '#7FB069', { shade: 'v' })}${txt(990, 168, 'EXIT  A', 26, '#fff')}`;
  SX.bg.outPlatform = (st, noSign) => `${wall('#E3ECF2', 300)}<rect y="0" width="${W}" height="60" fill="#C9D6E0"/>${lights(22, 4)}
    ${noSign ? '' : `${vol('<rect x="40" y="76" width="330" height="64" rx="10"/>', '#2B2F4A', { shade: 'v' })}${txt(205, 120, 'Next train  2 min', 28, '#FFC727')}`}
    <rect y="150" width="${W}" height="150" fill="#9FB0BE"/><rect y="150" width="${W}" height="150" fill="url(#lpShadeV)" opacity=".4"/>${[200, 240].map((y) => `<rect y="${y}" width="${W}" height="10" fill="#6B7A88"/>`).join('')}
    ${tiles(300, '#D3DCE4', '#B4C1CC')}<rect y="300" width="${W}" height="30" fill="#FFD23F"/>${Array.from({ length: 56 }, (_, i) => `<circle cx="${10 + i * 20}" cy="315" r="4" fill="#E0B21A"/>`).join('')}`;
  const train = (open) => `${vol(`<rect x="60" y="110" width="${W - 120}" height="200" rx="26"/>`, '#F4F6F8', { shade: 'v' })}<rect x="60" y="138" width="${W - 120}" height="16" fill="#C2577A"/><rect x="60" y="282" width="${W - 120}" height="10" fill="#C2577A"/>
    ${[150, 330, 790, 970].map((x) => `<rect x="${x - 70}" y="170" width="140" height="84" rx="10" fill="#BFE3F7"/><rect x="${x - 70}" y="170" width="140" height="84" rx="10" fill="url(#lpGlass)"/>`).join('')}
    ${open ? `<rect x="460" y="154" width="200" height="146" fill="#4E5E6E"/><rect x="460" y="154" width="200" height="146" fill="url(#lpShadeV)"/>${vol('<rect x="400" y="154" width="60" height="146" rx="6"/><rect x="660" y="154" width="60" height="146" rx="6"/>', '#DADFE4')}`
    : `${vol('<rect x="460" y="154" width="100" height="146" rx="6"/><rect x="560" y="154" width="100" height="146" rx="6"/>', '#DADFE4')}<rect x="476" y="170" width="68" height="60" rx="6" fill="#BFE3F7"/><rect x="576" y="170" width="68" height="60" rx="6" fill="#BFE3F7"/>`}`;
  SX.bg.outTrainArrive = (st) => `${SX.bg.outPlatform(st, true)}${train(st && st.s && st.s.open)}`;
  SX.bg.outTrainIn = () => `<rect width="${W}" height="${H}" fill="#E9EEF2"/>${tiles(430, '#B8C4CE', '#9AA6B2')}
    ${[160, 560, 960].map((x) => `<rect x="${x - 130}" y="40" width="260" height="140" rx="16" fill="#BFE3F7"/><rect x="${x - 130}" y="40" width="260" height="140" rx="16" fill="url(#lpGlass)"/><rect x="${x - 130}" y="40" width="260" height="140" rx="16" fill="none" stroke="#C9D1D9" stroke-width="8"/>`).join('')}
    ${vol(`<rect x="20" y="210" width="${W - 40}" height="110" rx="16"/>`, '#7FA6D9', { shade: 'v', lineOpacity: 0.3 })}${vol('<rect x="20" y="210" width="260" height="110" rx="16"/>', '#D97FA4', { shade: 'v', lineOpacity: 0.3 })}
    ${vol(`<rect x="20" y="310" width="${W - 40}" height="80" rx="18"/>`, '#5B8FD9', { shade: 'v' })}${vol('<rect x="20" y="310" width="260" height="80" rx="18"/>', '#C2577A', { shade: 'v' })}${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${280 + i * 140} 312v76" stroke="#4A78A8" stroke-width="3"/>`).join('')}
    ${vol('<rect x="50" y="190" width="200" height="34" rx="10"/>', '#FFFFFF', { lineOpacity: 0.3 })}${txt(150, 214, 'Priority seat', 20, '#C2577A')}`;
  const pole = (x) => `<rect x="${x - 9}" y="0" width="18" height="${H}" fill="url(#lpMetal)"/><rect x="${x - 9}" y="0" width="18" height="${H}" fill="none" stroke="#8A97A6" stroke-width="2"/>`;
  const STATIONS = ['Bishan', 'Braddell', 'Toa Payoh', 'Novena', 'Newton', 'Orchard', 'Somerset'];
  const GOAL = 'Orchard';
  const SPOTS = [[470, 318], [640, 450], [290, 480]]; // the first one is on the yellow line
  const gantryStep = (o) => ({
    id: o.id, bg: o.bg, text: o.text,
    task: 'Drag the card onto the yellow card reader.',
    lumi: (st) => (st.done ? { x: 560, y: 380, h: 160 } : { x: 300, y: 560, h: 210 }),
    draw(st) {
      let h = SX.at(380, 200, 360, 260, gantry(st.done), { z: st.done ? 6 : 3 });
      h += SX.at(434, 248, 70, 54, '', { target: true, id: 'reader', cls: 'ot-reader', z: 7 });
      if (!st.done) h += SX.at(150, 420, 120, 80, SX.prop.card(), { cls: 'sx-drag ot-card', label: 'Travel card', z: 8 });
      else h += SX.bubble(560, 120, 'Beep! The gate opens.', { w: 220 });
      return h;
    },
    after(st, box) {
      if (st.done) return;
      SX.dragTo(box, '.ot-card', '.ot-reader', () => { A.tone(1568, 0.12, 0.07); setTimeout(() => A.tone(2093, 0.18, 0.06), 140); SX.done(st, o.doneText); return true; }, { pad: 40, miss: () => SX.say('Bring the card to the yellow reader.') });
    },
    guide: () => ({ sel: '.ot-card', say: 'Drag the card to the yellow reader.' })
  });
  const seatedGrandpa = (mood) => SX.at(100, 220, 100, 200, P({ who: 'grandpa', h: 200, pose: 'sit', mood: mood || 'smile' }), { z: 4 });

  const mrtSteps = [
    {
      id: 'pack', bg: 'outHome',
      text: 'Today Lumi is taking the MRT. Before going out, Lumi packs the bag.',
      task: (st) => (st.s.tip || 'Drag the travel card, phone and water bottle into the bag.'),
      lumi: { x: 170, y: 560, h: 220 },
      enter(st) { st.s.packed = []; },
      draw(st) {
        const ins = st.s.packed.map((id, i) => { const p = PACK.find((q) => q[0] === id); return `<svg x="${44 + i * 40}" y="6" width="${id === 'card' ? 66 : 40}" height="66" viewBox="${p[5]}">${inner(p[2]())}</svg>`; }).join('');
        let h = SX.at(840, 290, 200, 220, backpack(ins, true), { target: true, id: 'bag', cls: 'ot-backpack', z: 4, label: 'Bag' });
        const spots = [[340, 270], [490, 252], [590, 248], [690, 268]];
        PACK.forEach(([id, label, art, w, hh], i) => { if (!st.s.packed.includes(id)) h += SX.at(spots[i][0], spots[i][1] + (110 - hh), w, hh, art(), { cls: 'sx-drag ot-packit', id, label, z: 6 }); });
        if (st.s.tipText) h += SX.bubble(560, 120, st.s.tipText, { w: 260 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ot-packit', '.ot-backpack', (t, el) => {
          const id = el.dataset.id;
          if (!NEED.includes(id)) { st.s.tipText = 'The ball can stay at home today.'; st.s.tip = 'We only need the card, phone and water bottle.'; SX.nope(null, 'The ball can stay at home today.'); SX.render(); return false; }
          st.s.packed.push(id); st.s.tipText = null; st.s.tip = null;
          A.tone(640 + st.s.packed.length * 90, 0.1, 0.05);
          if (st.s.packed.length === NEED.length) SX.done(st, 'Card, phone, water bottle. Lumi is ready to go!'); else SX.render();
          return true;
        }, { miss: () => SX.say('Put it in the bag.') });
      },
      guide: (st) => { const n = NEED.find((id) => !st.s.packed.includes(id)) || 'card'; return { sel: `.ot-packit[data-id="${n}"]`, say: 'Drag it into the bag.' }; }
    },
    gantryStep({ id: 'gantry', bg: 'outConcourse', text: 'At the station, Lumi taps the travel card at the gantry.', doneText: 'Beep! The gate opens and Lumi walks through.' }),
    {
      id: 'platform', bg: 'outPlatform',
      text: 'The platform is busy. The yellow line keeps people safe from the train.',
      task: (st) => (st.s.tip || 'Where should Lumi stand? Tap a safe place behind the yellow line.'),
      lumi: (st) => (st.s.spot != null ? { x: SPOTS[st.s.spot][0], y: SPOTS[st.s.spot][1] + 20, h: 190 } : { x: 120, y: 560, h: 200 }),
      draw(st) {
        let h = SX.at(860, 290, 120, 240, P({ who: 'woman', h: 240, flip: true, item: 'phone', pose: 'give' }), { z: 3 });
        if (!st.done) SPOTS.forEach(([x, y], i) => { h += SX.at(x - 60, y - 34, 120, 60, '<div class="ot-feet"><i></i><i></i></div>', { k: 'spot', v: i, label: i === 0 ? 'On the yellow line' : 'Behind the yellow line', z: 4, cls: 'ot-spot' }); });
        if (st.s.tipText) h += SX.bubble(380, 170, st.s.tipText, { w: 300 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'spot') return;
        const i = Number(d.v);
        if (i === 0) { st.s.tipText = 'That is on the yellow line, too close to the train. Step back.'; st.s.tip = 'Choose a place further back, behind the yellow line.'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.spot = i; st.s.tipText = null;
        SX.ok();
        SX.done(st, 'Lumi waits safely behind the yellow line.');
      },
      guide: () => ({ sel: '.ot-spot[data-v="2"]', say: 'Tap a place behind the yellow line.' })
    },
    {
      id: 'alight', bg: 'outTrainArrive',
      text: (st) => (st.s.left >= 2 ? 'Everyone who wants to get off has left.' : 'The train arrives and the doors open. People are getting off.'),
      task: (st) => (st.s.left >= 2 ? 'Now tap the doors to get on.' : 'Wait. Let people get off first.'),
      lumi: (st) => (st.done ? { x: 560, y: 330, h: 140, z: 3 } : { x: 290, y: 560, h: 190 }),
      enter(st) {
        st.s.open = false; st.s.left = 0;
        SX.later(st, () => { st.s.open = true; A.tone(880, 0.15, 0.05); SX.render(); SX.say('The doors open. Let people get off first.'); }, 900);
        SX.later(st, () => { st.s.left = 1; SX.render(); }, 2600);
        SX.later(st, () => { st.s.left = 2; SX.render(); SX.say('Now tap the doors to get on.'); }, 4300);
      },
      draw(st) {
        let h = '';
        if (st.s.open && st.s.left < 1) h += SX.at(505, 150, 110, 220, P({ who: 'man', h: 220 }), { z: 4 });
        if (st.s.open && st.s.left < 2) h += SX.at(st.s.left === 1 ? 510 : 590, 190, 100, 200, P({ who: 'girl', h: 200 }), { z: 4 });
        if (st.s.left >= 1) h += SX.at(850, 300, 120, 240, P({ who: 'man', h: 240, flip: true }), { z: 3 });
        if (st.s.left >= 2) h += SX.at(730, 330, 100, 200, P({ who: 'girl', h: 200, flip: true }), { z: 3 });
        if (st.s.open && !st.done) h += SX.at(460, 154, 200, 146, '', { k: 'board', label: 'Train doors', cls: `ot-doors ${st.s.left >= 2 ? 'go' : ''}`, z: 6 });
        if (st.s.tipText && st.s.left < 2) h += SX.bubble(180, 330, st.s.tipText, { w: 250, tail: 'down' });
        return h;
      },
      tap(st, k, el) {
        if (k !== 'board') return;
        if (st.s.left < 2) { st.s.tipText = 'Wait. People are still getting off.'; SX.nope(el, 'Wait. Let people get off first.'); SX.render(); return; }
        st.s.tipText = null;
        SX.ok();
        SX.done(st, 'Lumi let people off first, then got on. Well done!');
      },
      guide: (st) => (st.s.left >= 2 ? { sel: '.ot-doors', say: 'Tap the doors.' } : null)
    },
    {
      id: 'seat', bg: 'outTrainIn',
      text: (st) => (st.s.gp ? 'A grandpa with a walking stick gets on. He looks tired. Lumi is in the priority seat.' : 'Lumi sits down in a seat.'),
      task: (st) => (st.s.gp ? 'What could Lumi do?' : 'Look around the train.'),
      lumi: (st) => (st.done ? { x: 600, y: 540, h: 200 } : { x: 150, y: 400, h: 170 }),
      enter(st) { st.s.gp = false; SX.later(st, () => { st.s.gp = true; SX.render(); SX.say('A grandpa with a walking stick gets on. He looks tired. What could Lumi do?'); }, 1800); },
      draw(st) {
        let h = SX.at(700, 220, 100, 200, P({ who: 'woman', h: 200, pose: 'sit', item: 'phone' }), { z: 3 }) + SX.at(860, 220, 100, 200, P({ who: 'boy', h: 200, pose: 'sit' }), { z: 3 });
        if (st.s.gp) h += st.done ? seatedGrandpa() : SX.at(380, 270, 120, 260, P({ who: 'grandpa', h: 260, flip: true, mood: 'calm' }), { z: 4 }) + SX.at(372, 390, 14, 150, '<div class="ot-stick"></div>', { z: 5 });
        if (st.s.gp && !st.done) h += SX.choices([{ label: 'Offer my seat', art: ic('hug', 56) }, { label: 'Keep sitting', art: ic('hourglass', 56) }], 'seat', { style: 'right:24px;top:24px;', cls: 'col' });
        if (st.s.tipText) h += SX.bubble(520, 140, st.s.tipText, { w: 300 });
        if (st.done) h += SX.bubble(220, 110, 'Thank you, young one!', { w: 220, tail: 'left' });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'seat') return;
        if (d.v === '1') { st.s.tipText = 'Grandpa needs to sit more than Lumi. What else could Lumi do?'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null;
        SX.ok();
        SX.done(st, 'Lumi said "Please sit here." Grandpa says thank you!');
      },
      guide: (st) => (st.s.gp ? { sel: '.sx-choice', say: 'What could Lumi do?' } : null)
    },
    {
      id: 'pole', bg: (st) => `${SX.bg.outTrainIn(st)}${pole(520)}`,
      text: 'Now Lumi is standing. The train starts to move and it sways a little.',
      task: 'Tap the pole so Lumi can hold on.',
      lumi: (st) => (st.done ? { x: 580, y: 545, h: 210 } : { x: 860, y: 545, h: 210 }),
      draw(st) {
        let h = seatedGrandpa();
        if (!st.done) h += SX.at(480, 0, 80, H, '', { k: 'pole', label: 'Pole', cls: 'ot-pole', z: 6 });
        return h;
      },
      tap(st, k) { if (k !== 'pole') return; SX.ok(); SX.done(st, 'Lumi holds the pole. Steady and safe!'); },
      guide: () => ({ sel: '.ot-pole', say: 'Tap the pole.' })
    },
    SX.copeStep({
      id: 'delay', bg: (st) => `${SX.bg.outTrainIn(st)}${pole(520)}`,
      text: 'The train stops between stations. The driver says: "There is a short delay. We will move shortly."',
      lumi: (st) => ({ x: 580, y: 545, h: 210, mood: st.done ? 'calm' : 'worried' }),
      draw: () => seatedGrandpa('calm') + SX.bubble(330, 24, 'Short delay...', { w: 170 }),
      options: [{ label: 'Text my family', art: SX.prop.phone(), reply: 'Lumi texts Mum: "The train is late. I am OK."' }, { label: 'Listen to music', art: SX.ART.headphones, reply: 'Music helps the waiting feel shorter.', apply: (st) => { st.data.phones = true; } }, { label: 'Listen to the announcement', art: ic('speaker', 56), reply: 'The driver says the train will move soon. Lumi waits calmly.' }]
    }),
    {
      id: 'map', bg: () => `<rect width="${W}" height="${H}" fill="#E9EEF2"/>${tiles(470, '#B8C4CE', '#9AA6B2')}${vol(`<rect x="40" y="36" width="${W - 80}" height="240" rx="18"/>`, '#FFFFFF', { shade: 'v' })}${pole(1080)}`,
      text: 'The train moves again. Lumi looks at the map above the door.',
      task: (st) => (st.s.tip || "Lumi's card says where to get off. Tap that station on the map."),
      lumi: { x: 870, y: 560, h: 200 },
      draw(st) {
        let h = `<div class="ot-map" style="left:70px;top:70px"><span class="ot-map-line"></span>${STATIONS.map((s, i) => `<button class="ot-stn ${st.done && s === GOAL ? 'on' : ''} ${i === 4 ? 'now' : ''}" data-a="sx" data-k="stn" data-v="${s}" style="left:${i * 138}px">${i === 4 ? '<span class="ot-here">Train is here</span>' : ''}<i></i><b>NS${17 + i}</b><span>${s}</span></button>`).join('')}</div>`;
        h += SX.at(150, 320, 320, 190, `<div class="ot-dest">${ic('pin', 34)}<span>Lumi gets off at</span><b>${GOAL}</b><i>NS22</i></div>`, { z: 6, label: 'Lumi gets off at Orchard' });
        if (st.s.tipText) h += SX.bubble(500, 300, st.s.tipText, { w: 280 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'stn') return;
        if (d.v !== GOAL) { st.s.tipText = `That is ${d.v}. Lumi's card says ${GOAL}.`; st.s.tip = `Find ${GOAL} on the map.`; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null;
        SX.ok();
        SX.done(st, `${GOAL}! The next stop. Lumi gets ready to get off.`);
      },
      guide: () => ({ sel: `.ot-stn[data-v="${GOAL}"]`, say: `Tap ${GOAL}.` })
    },
    gantryStep({ id: 'tapout', bg: 'outExit', text: 'Lumi gets off at Orchard. To leave the station, Lumi taps the card again.', doneText: 'Beep! Lumi made the whole trip. Every trip makes it a little easier.' })
  ];
  SX.story({ id: 'mrt', title: 'Taking the MRT', tint: '#DCEAF5', ages: ['primary', 'teen'], steps: mrtSteps });

  // ================================================================ A BIRTHDAY PARTY
  const balloons = () => [[90, 140, '#EF8A7A'], [150, 110, '#8EB8E5'], [960, 130, '#B9A6E0'], [1020, 100, '#9CCB7A']].map(([x, y, c]) => `<path d="M${x} ${y + 46} q-8 40 6 90" stroke="#9C8B7A" stroke-width="3" fill="none"/>${vol(`<ellipse cx="${x}" cy="${y}" rx="34" ry="44"/>`, c)}${LP.shine(x - 12, y - 16, 8, 12, 20)}`).join('');
  SX.bg.outCorridor = () => `${wall('#F1E6D2', 400)}${tiles(400, '#D6CDBE', '#BDB2A0')}<rect width="${W}" height="40" fill="#E2D5BC"/>
    ${vol('<rect x="380" y="70" width="300" height="400" rx="10"/>', '#C9A27E', { shade: 'h' })}${vol('<rect x="406" y="96" width="248" height="374" rx="6"/>', '#B07D4F', { shade: 'h' })}${vol('<circle cx="626" cy="290" r="12"/>', '#E8B83A')}
    ${vol('<rect x="470" y="130" width="120" height="70" rx="8"/>', '#FFF8EC')}${txt(530, 162, '#08-12', 20, '#8A6A4A')}${txt(530, 188, 'Pip', 22, '#C2577A')}
    ${[200, 860].map((x) => `${vol(`<rect x="${x - 40}" y="380" width="80" height="90" rx="10"/>`, '#E07A5F')}${vol(`<path d="M${x} 380c-50-10-60-90-10-120 0 50 10 80 10 120zM${x} 380c50-10 60-90 10-120 0 50-10 80-10 120z"/>`, '#7BC67E')}`).join('')}`;
  SX.bg.outPartyRoom = () => `${wall('#FFF1C2', 380)}${tiles(380, '#F2D7B0', '#D9B98C')}<path d="M0 40 Q280 100 557 40 Q835 100 ${W} 40" stroke="#C98A1E" stroke-width="4" fill="none"/>
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${30 + i * 84} ${54 + Math.sin(i) * 8} l28 0 l-14 36z" fill="${['#EF8A7A', '#8EB8E5', '#9CCB7A', '#B9A6E0', '#F2A7BE'][i % 5]}"/>`).join('')}
    ${vol('<rect x="380" y="110" width="360" height="60" rx="14"/>', '#E58BA6', { shade: 'v' })}${txt(560, 152, 'HAPPY BIRTHDAY PIP', 28, '#fff', { ls: 1 })}${balloons()}`;
  const partyTable = () => svg('0 0 600 200', `${LP.drop(300, 192, 280, 14)}<path d="M80 80v110M520 80v110" stroke="#A87B50" stroke-width="16" stroke-linecap="round"/>${vol('<rect x="20" y="40" width="560" height="50" rx="14"/>', '#FFFFFF')}<path d="M20 70h560" stroke="#F2A7BE" stroke-width="10"/>`);
  const cake = (lit) => svg('0 0 260 220', `${LP.drop(130, 212, 120, 10)}${vol('<ellipse cx="130" cy="196" rx="124" ry="18"/>', '#FFFFFF')}${vol('<path d="M30 110h200v76c0 10-44 18-100 18s-100-8-100-18z"/>', '#F2A7BE', { shade: 'h' })}${vol('<ellipse cx="130" cy="110" rx="100" ry="22"/>', '#FFF1F5')}
    <path d="M30 140q25 14 50 0t50 0 50 0 50 0" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${[70, 110, 150, 190].map((x, i) => `${vol(`<rect x="${x - 6}" y="56" width="12" height="54" rx="4"/>`, ['#8EB8E5', '#9CCB7A', '#FFD23F', '#B9A6E0'][i])}${lit[i] ? `<ellipse cx="${x}" cy="40" rx="26" ry="26" fill="url(#lpGlow)" opacity=".6"/><ellipse cx="${x}" cy="44" rx="9" ry="15" fill="#FFB347"/><ellipse cx="${x}" cy="48" rx="5" ry="8" fill="#FFF3B0"/>` : `<path d="M${x} 52q-6-10 0-18q6-8 0-16" stroke="#C9D1D9" stroke-width="3" fill="none" opacity=".8"/>`}`).join('')}`);
  const present = () => svg('0 0 120 110', `${LP.drop(60, 104, 52, 6)}${vol('<rect x="10" y="40" width="100" height="62" rx="6"/>', '#7E64C8')}${vol('<rect x="4" y="28" width="112" height="20" rx="5"/>', '#9B87D9')}<rect x="52" y="28" width="16" height="74" fill="#FFD23F"/>${vol('<path d="M60 28c-20-26-40-10-24 0zM60 28c20-26 40-10 24 0z"/>', '#FFD23F')}`);
  const dice = (n) => { const pts = { 1: [[50, 50]], 2: [[30, 30], [70, 70]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[30, 30], [70, 30], [30, 70], [70, 70]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[30, 26], [70, 26], [30, 50], [70, 50], [30, 74], [70, 74]] }[n || 5]; return svg('0 0 100 100', `${LP.drop(50, 96, 42, 5)}${vol('<rect x="8" y="6" width="84" height="84" rx="18"/>', '#FFFFFF')}${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#3B2F2F"/>`).join('')}`); };
  const sliceArt = (left) => svg('0 0 200 140', `${LP.drop(100, 130, 90, 8)}${vol('<ellipse cx="100" cy="112" rx="92" ry="22"/>', '#FFFFFF')}${left > 0 ? `<g transform="translate(100 100) scale(${0.5 + left * 0.17}) translate(-100 -100)">${vol('<path d="M40 100l120-30v40l-120 20z"/>', '#F2A7BE')}${vol('<path d="M40 100l120-30-30-30z"/>', '#FFF1F5')}<circle cx="130" cy="52" r="8" fill="#E5534B"/></g>` : '<circle cx="90" cy="110" r="3" fill="#F2A7BE"/><circle cx="110" cy="114" r="2" fill="#F2A7BE"/>'}`);
  const envelope = (open) => svg('0 0 220 170', `${LP.drop(110, 162, 100, 8)}${open ? `${vol('<rect x="24" y="-116" width="172" height="150" rx="10"/>', '#FFFFFF')}${vol('<circle cx="110" cy="-82" r="18"/>', '#F4D35E')}${txt(110, -74, '6', 22, '#8A6A4A')}${txt(110, -34, 'Party!', 26, '#C2577A')}${txt(110, -10, 'Pip is turning 6', 15, '#8A6A4A')}${txt(110, 12, 'Saturday, 2 pm', 15, '#8A6A4A')}` : ''}${vol('<rect x="10" y="60" width="200" height="100" rx="10"/>', '#F7B6CD')}${vol(open ? '<path d="M10 64l100 -46 100 46z"/>' : '<path d="M10 64l100 56 100-56z"/>', '#F2A0BE')}${!open ? vol('<circle cx="110" cy="108" r="16"/>', '#E5534B') : ''}`);
  const doorOpen = () => SX.at(406, 96, 248, 374, '<div class="ot-dooropen"></div>', { z: 2 });

  const partySteps = [
    {
      id: 'invite', bg: 'outHome',
      text: 'Lumi got a letter. Who could it be from?',
      task: (st) => (st.s.open ? '' : 'Tap the envelope to open it.'),
      lumi: { x: 200, y: 560, h: 220 },
      draw: (st) => SX.at(450, 170, 260, 200, envelope(st.s.open), { k: st.s.open ? '' : 'open', label: 'Envelope', cls: st.s.open ? '' : 'ot-env', z: 6 }) + (st.s.open ? SX.bubble(280, 120, "It's from Pip!", { w: 160, tail: 'down' }) : ''),
      tap(st, k) { if (k !== 'open') return; st.s.open = true; SX.ok(); SX.done(st, "It's an invitation to Pip's birthday party on Saturday!"); },
      guide: () => ({ sel: '.ot-env', say: 'Tap the envelope.' })
    },
    {
      id: 'door', bg: 'outCorridor',
      text: "On Saturday, Lumi and Mum go to Pip's home. The door is closed.",
      task: (st) => (st.done ? '' : st.s.rang ? 'Wait for someone to open the door.' : 'Press the doorbell.'),
      lumi: { x: 820, y: 560, h: 210, flip: true },
      draw(st) {
        let h = SX.at(970, 270, 130, 260, P({ who: 'mum', h: 260, flip: true, pose: 'give', item: 'bag' }), { z: 4 });
        h += SX.at(700, 250, 56, 76, svg('0 0 56 76', `${vol('<rect x="4" y="4" width="48" height="68" rx="10"/>', '#F4F6F8')}${vol('<circle cx="28" cy="38" r="14"/>', st.s.rang ? '#7FD18A' : '#FFD23F')}`), { k: st.s.rang ? '' : 'bell', label: 'Doorbell', cls: st.s.rang ? '' : 'ot-bell', z: 6 });
        if (st.done) h += doorOpen() + pipAt(430, 240, 200, { wave: true, z: 3 });
        if (st.s.rang && !st.done) h += SX.bubble(620, 150, 'Ding dong!', { w: 140 });
        return h;
      },
      tap(st, k) {
        if (k !== 'bell') return;
        st.s.rang = true;
        A.tone(988, 0.3, 0.08); setTimeout(() => A.tone(784, 0.4, 0.08), 300);
        SX.render();
        SX.later(st, () => SX.done(st, "The door opens. It's Pip!"), 1600);
      },
      guide: (st) => (st.s.rang ? null : { sel: '.ot-bell', say: 'Press the doorbell.' })
    },
    {
      id: 'greet', bg: 'outCorridor',
      text: 'Pip says: "Hi Lumi! You came!"',
      task: 'How could Lumi say hello? Tap one.',
      lumi: (st) => ({ x: 820, y: 560, h: 210, flip: true, wave: st.s.pick === 0 }),
      draw(st) {
        let h = doorOpen() + pipAt(430, 240, 200, { mood: 'happy', wave: st.s.pick != null, z: 3 });
        h += SX.choices([{ label: 'Wave', art: ic('hug', 56) }, { label: 'Smile', art: ic('smile', 56) }, { label: 'Say "Happy birthday!"', art: ic('kTalk', 56) }], 'hi', { on: st.s.pick, style: 'left:24px;top:24px;', cls: 'col' });
        if (st.s.pick != null) h += SX.bubble(560, 150, 'Yay! Come in, Lumi!', { w: 200, tail: 'down' });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'hi') return;
        st.s.pick = Number(d.v);
        if (st.s.pick === 2) SX.say('Happy birthday, Pip!');
        SX.ok();
        SX.done(st, ['Lumi waves hello. Pip waves back!', 'A big smile says hello too!', 'Pip loves hearing "Happy birthday!"'][st.s.pick]);
      },
      guide: () => ({ sel: '.sx-choice', say: 'How could Lumi say hello?' })
    },
    {
      id: 'present', bg: 'outPartyRoom',
      text: 'Inside there are balloons and friends. Lumi brought a present for Pip.',
      task: 'Drag the present to Pip.',
      lumi: { x: 230, y: 560, h: 210 },
      draw(st) {
        let h = SX.at(880, 300, 110, 220, P({ who: 'girl', h: 220, flip: true, pose: 'wave' }), { z: 3 }) + SX.at(470, 290, 110, 220, P({ who: 'boy', h: 220 }), { z: 3 });
        h += SX.at(640, 330, 200, 200, pip({ size: 200, mood: st.done ? 'excited' : 'happy', wave: st.done }), { target: true, id: 'pip', cls: 'ot-pip', z: 4, label: 'Pip' });
        if (!st.done) h += SX.at(310, 410, 120, 110, present(), { cls: 'sx-drag ot-present', label: 'Present', z: 8 });
        else h += SX.at(680, 450, 100, 92, present(), { z: 6 }) + SX.bubble(680, 230, 'Thank you, Lumi!', { w: 190 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ot-present', '.ot-pip', () => { SX.done(st, 'Pip says "Thank you!" Giving a present is kind.'); return true; }, { miss: () => SX.say('Give it to Pip.') });
      },
      guide: () => ({ sel: '.ot-present', say: 'Drag the present to Pip.' })
    },
    SX.copeStep({
      id: 'sing', bg: 'outPartyRoom',
      text: 'Everyone sings "Happy Birthday" very loudly and claps. It is so loud!',
      lumi: (st) => ({ x: 260, y: 560, h: 220, mood: st.done ? 'happy' : 'worried' }),
      draw: () => SX.at(440, 300, 110, 220, P({ who: 'boy', h: 220, mood: 'talk', pose: 'wave' }), { z: 3 }) + pipAt(580, 330, 190, { mood: 'excited', z: 3 }) + SX.at(780, 300, 110, 220, P({ who: 'girl', h: 220, mood: 'talk', flip: true, pose: 'wave' }), { z: 3 }) + SX.bubble(520, 220, 'Happy birthday to you!', { w: 220 }),
      options: [{ label: 'Cover my ears', art: ic('quiet', 56), reply: 'Covering ears is OK. Lumi can still join the party.' }, SX.HEADPHONES, SX.BREATHE]
    }),
    {
      id: 'candles', bg: 'outPartyRoom',
      text: 'Here is the birthday cake! Pip lets Lumi help blow out the candles.',
      task: (st) => (st.s.lit.some(Boolean) ? 'Tap each candle to blow it out.' : ''),
      lumi: { x: 200, y: 560, h: 210 },
      enter(st) { st.s.lit = [true, true, true, true]; },
      draw(st) {
        let h = pipAt(850, 300, 200, { mood: 'excited', z: 2 }) + SX.at(260, 370, 600, 200, partyTable(), { z: 3 });
        h += SX.at(430, 222, 260, 220, cake(st.s.lit), { z: 4 });
        [70, 110, 150, 190].forEach((x, i) => { if (st.s.lit[i]) h += SX.at(430 + x - 22, 222 + 14, 44, 70, '', { k: 'candle', v: i, label: `Candle ${i + 1}`, cls: 'ot-candle', z: 6 }); });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'candle') return;
        st.s.lit[Number(d.v)] = false;
        A.tone(420, 0.25, 0.04);
        if (!st.s.lit.some(Boolean)) SX.done(st, 'Whoosh! All the candles are out. Everyone cheers!'); else { SX.render(); SX.say('Whoosh!'); }
      },
      guide: () => ({ sel: '.ot-candle', say: 'Tap a candle.' })
    },
    {
      id: 'game', bg: 'outPartyRoom',
      text: (st) => (st.s.turn < 2 ? `Now there is a dice game. Everyone takes turns. It's ${['Pip', 'Sara'][st.s.turn]}'s turn.` : "Now it's Lumi's turn!"),
      task: (st) => (st.s.turn < 2 ? 'Wait for your turn.' : st.s.rolled ? '' : 'Tap the dice to roll.'),
      lumi: { x: 170, y: 560, h: 200 },
      enter(st) { st.s.turn = 0; st.s.rolls = [null, null, null]; st.s.face = 5; nextTurn(st); },
      draw(st) {
        const who = [{ n: 'Pip', art: pip({ size: 60 }) }, { n: 'Sara', art: P({ who: 'girl', crop: 'bust', h: 60 }) }, { n: 'Lumi', art: SX.lumi(st, { h: 60 }) }];
        let h = `<div class="ot-turns" style="left:340px;top:186px">${who.map((p, i) => `<span class="ot-turn ${st.s.turn === i ? 'on' : ''}"><span class="ot-turn-art">${p.art}</span><b>${p.n}</b><em>${st.s.rolls[i] ? st.s.rolls[i] : st.s.turn === i ? '...' : ''}</em></span>`).join('')}</div>`;
        h += SX.at(260, 370, 600, 200, partyTable(), { z: 3 });
        h += SX.at(505, 300, 110, 110, dice(st.s.face), { k: 'dice', label: 'Dice', cls: `ot-dice ${st.s.turn === 2 && !st.s.rolled ? 'sx-glow' : ''} ${st.s.spin ? 'spin' : ''}`, z: 6 });
        if (st.s.tipText && st.s.turn < 2) h += SX.bubble(640, 300, st.s.tipText, { w: 250 });
        return h;
      },
      tap(st, k, el) {
        if (k !== 'dice') return;
        if (st.s.turn < 2) { st.s.tipText = `It's ${['Pip', 'Sara'][st.s.turn]}'s turn. Lumi waits.`; SX.nope(el, st.s.tipText); SX.render(); return; }
        if (st.s.rolled) return;
        st.s.rolled = true;
        st.s.face = 1 + Math.floor(Math.random() * 6);
        st.s.rolls[2] = st.s.face;
        A.tone(660, 0.1, 0.05);
        SX.done(st, `Lumi rolled ${st.s.face}! Great waiting and turn-taking.`);
      },
      guide: (st) => (st.s.turn === 2 && !st.s.rolled ? { sel: '.ot-dice', say: 'Tap the dice.' } : null)
    },
    {
      id: 'cake', bg: 'outPartyRoom',
      text: 'Now everyone gets a slice of birthday cake. Yum!',
      task: (st) => (st.s.bites < 3 ? 'Tap the cake to take a bite.' : ''),
      lumi: { x: 560, y: 430, h: 220, z: 2 },
      enter(st) { st.s.bites = 0; },
      draw(st) {
        let h = pipAt(850, 290, 180, { mood: 'happy', z: 2 }) + SX.at(260, 370, 600, 200, partyTable(), { z: 3 });
        h += SX.at(450, 330, 220, 150, sliceArt(3 - st.s.bites), { k: 'bite', label: 'Cake', cls: 'ot-slice', z: 6 });
        if (st.s.bites > 0 && st.s.bites < 3) h += SX.bubble(660, 180, ['Yum!', 'So sweet!'][st.s.bites - 1], { w: 130, tail: 'left' });
        return h;
      },
      tap(st, k) {
        if (k !== 'bite' || st.s.bites >= 3) return;
        st.s.bites += 1;
        A.tone(520 + st.s.bites * 90, 0.12, 0.05);
        if (st.s.bites >= 3) SX.done(st, 'All gone! That was yummy cake.'); else { SX.render(); SX.say(['Yum!', 'So sweet!'][st.s.bites - 1]); }
      },
      guide: () => ({ sel: '.ot-slice', say: 'Tap the cake.' })
    },
    {
      id: 'bye', bg: 'outCorridor',
      text: 'The party is over. It is time to go home.',
      task: (st) => (st.s.said ? '' : 'Tap the talk card to say thank you and bye.'),
      lumi: { x: 820, y: 560, h: 210, flip: true },
      draw(st) {
        let h = doorOpen() + pipAt(430, 240, 200, { mood: 'happy', wave: !!st.s.said, z: 3 });
        h += SX.at(970, 270, 130, 260, P({ who: 'mum', h: 260, flip: true, pose: 'wave' }), { z: 4 });
        h += SX.talkCard([{ t: 'Thank you', art: ic('kHeart', 52) }, { t: 'bye!', art: ic('hug', 52) }], 'say', { said: st.s.said, style: 'left:30px;top:30px;' });
        if (st.s.said) h += SX.bubble(560, 150, 'Bye Lumi! Thanks for coming!', { w: 240 });
        return h;
      },
      tap(st, k) {
        if (k !== 'say' || st.s.said) return;
        st.s.said = true;
        SX.say('Thank you, bye!');
        SX.render();
        SX.later(st, () => SX.done(st, 'Pip waves goodbye. Lumi had fun at the party!'), 1400);
      },
      guide: (st) => (st.s.said ? null : { sel: '.sx-talk', say: 'Tap the talk card.' })
    }
  ];
  // the other players roll one after another, then it's Lumi's turn
  function nextTurn(st) {
    SX.later(st, () => {
      if (st.s.turn >= 2) return;
      st.s.spin = true;
      SX.render();
      SX.later(st, () => {
        st.s.spin = false;
        st.s.face = 1 + Math.floor(Math.random() * 6);
        st.s.rolls[st.s.turn] = st.s.face;
        st.s.turn += 1;
        st.s.tipText = null;
        A.tone(660, 0.1, 0.05);
        SX.render();
        SX.say(st.s.turn < 2 ? "Now it's Sara's turn. Lumi waits." : "Now it's Lumi's turn! Tap the dice.");
        nextTurn(st);
      }, 700);
    }, 1500);
  }
  SX.story({ id: 'party', title: 'A birthday party', tint: '#FFE9C2', ages: ['little', 'primary'], steps: partySteps });
})();
