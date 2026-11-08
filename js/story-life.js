/*
  story-life.js
  Six more real-life practice stories:
  - 'bus'      Taking the bus: check the bus number, let the wrong bus go, wave the bus down, tap in, find a seat,
               a noisy ride (what helps?), press the bell at the right stop, tap out.
  - 'library'  At the library: a quiet voice, find a book about animals, read it, a noisy reader (what helps?),
               borrow it at the self-check machine, return it in the book drop.
  - 'jab'      Getting a vaccination: wait for your number, ask the nurse, what helps?, roll up the sleeve,
               count 1-2-3, put on the plaster, take the sticker.
  - 'thunder'  When there is thunder: close the window, the loud boom (what helps?), make a cosy corner,
               do something calm, the storm ends.
  - 'swim'     Swimming lesson: pack the swim bag, find a free cubicle, shower first, cold water (what helps?),
               go in step by step, kick with the float, dry off.
  - 'lost'     If I get lost: Dad is gone, stay where you are, breathe, find someone who works there, show the
               card with Dad's number, Dad comes.
  Built on the story engine in stories.js (A.SX), the same way as story-out.js.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { esc, ic } = A;
  const W = SX.W;
  const H = SX.H;
  const P = (o) => A.person(o);
  const svg = (vb, inner) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" aria-hidden="true">${inner}</svg>`;
  const txt = (x, y, t, size, fill, o) => `<text x="${x}" y="${y}" text-anchor="${(o && o.anchor) || 'middle'}" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${size}" fill="${fill}"${o && o.ls ? ` letter-spacing="${o.ls}"` : ''}>${esc(t)}</text>`;
  const person = (x, y, h, o, z) => SX.at(x, y, h / 2, h, P(Object.assign({ h }, o)), { z: z == null ? 3 : z });

  // ---------------------------------------------------------------- shared backgrounds
  const tiles = (top, colour, line) => {
    let h = `<rect y="${top}" width="${W}" height="${H - top}" fill="${colour}"/>`;
    for (let r = 0; r < 7; r++) h += `<path d="M0 ${(top + r * ((H - top) / 7)).toFixed(0)}H${W}" stroke="${line}" stroke-width="2" opacity="${0.3 + r * 0.06}"/>`;
    for (let c = -6; c <= 16; c++) h += `<path d="M${W / 2 + c * 46} ${top}L${W / 2 + c * 150} ${H}" stroke="${line}" stroke-width="2" opacity=".3"/>`;
    return h + `<rect y="${top}" width="${W}" height="${H - top}" fill="url(#lpFloorFade)"/>`;
  };
  const wall = (colour, top) => `<rect width="${W}" height="${top}" fill="${colour}"/><rect width="${W}" height="${top}" fill="url(#lpShadeV)" opacity=".25"/>`;
  const lights = (y, n) => Array.from({ length: n }, (_, i) => { const x = 60 + i * (W - 120) / Math.max(1, n - 1); return `<rect x="${x - 50}" y="${y}" width="100" height="12" rx="6" fill="#FFFDF2"/><ellipse cx="${x}" cy="${y + 20}" rx="70" ry="14" fill="url(#lpGlow)" opacity=".7"/>`; }).join('');
  const glassPane = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#lpSky)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#lpGlass)"/>`;

  // ================================================================ TAKING THE BUS
  const BUS = '65';
  const hdb = (x, w, h, c) => `${vol(`<rect x="${x}" y="${330 - h}" width="${w}" height="${h}" rx="4"/>`, c, { shade: 'h', lineOpacity: 0.25 })}${Array.from({ length: Math.floor(h / 34) }, (_, r) => Array.from({ length: Math.floor(w / 36) }, (__, c2) => `<rect x="${x + 10 + c2 * 36}" y="${330 - h + 12 + r * 34}" width="20" height="16" rx="3" fill="#fff" opacity=".7"/>`).join('')).join('')}`;
  SX.bg.lfBusStop = () => `<rect width="${W}" height="330" fill="url(#lpSky)"/>${hdb(30, 190, 260, '#F2D2A6')}${hdb(250, 160, 210, '#B9D7EA')}${hdb(900, 190, 240, '#CDE7C2')}
    <circle cx="470" cy="62" r="36" fill="#F4D35E" opacity=".9"/>
    <rect y="330" width="${W}" height="100" fill="#8A97A6"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 100 + 10}" y="376" width="60" height="8" rx="4" fill="#fff" opacity=".8"/>`).join('')}
    <rect y="424" width="${W}" height="14" fill="#C9D1D9"/>${tiles(438, '#E4DDD2', '#CFC5B6')}
    <path d="M660 160v370M1060 160v370" stroke="#6B7A88" stroke-width="12" stroke-linecap="round"/>${vol('<rect x="620" y="140" width="480" height="34" rx="10"/>', '#2F7E79', { shade: 'v' })}
    <rect x="676" y="186" width="370" height="220" rx="8" fill="#DCEFF7" opacity=".7"/><rect x="676" y="186" width="370" height="220" rx="8" fill="url(#lpGlass)"/>
    ${vol('<rect x="700" y="440" width="320" height="20" rx="8"/>', '#C99A6B')}<path d="M720 460v40M1000 460v40" stroke="#8A6A4A" stroke-width="8" stroke-linecap="round"/>
    <path d="M560 120v420" stroke="#6B7A88" stroke-width="10" stroke-linecap="round"/>
    <g transform="translate(470 96)">${vol('<rect x="4" y="4" width="172" height="242" rx="14"/>', '#2B2F4A', { shade: 'v' })}${txt(90, 40, 'BUS STOP', 22, '#fff', { ls: 2 })}${['54', '65', '852'].map((n, i) => `<g transform="translate(25 ${56 + i * 60})">${vol('<rect x="2" y="2" width="126" height="44" rx="10"/>', '#FFFFFF', { lineOpacity: 0.3 })}${txt(65, 35, n, 28, '#2B2F4A')}</g>`).join('')}</g>`;
  // a single-deck bus; num on the LED sign; faces left, front door at the left end
  const busArt = (num, open) => svg('0 0 560 250', `${LP.drop(280, 240, 260, 12)}
    ${vol('<rect x="10" y="14" width="540" height="200" rx="30"/>', num === BUS ? '#7FB069' : '#5B8FD9', { shade: 'v' })}<rect x="10" y="150" width="540" height="22" fill="#fff" opacity=".85"/>
    ${vol('<rect x="22" y="28" width="96" height="40" rx="8"/>', '#2B2F4A')}${txt(70, 60, num, 30, '#FFB000')}
    <rect x="130" y="30" width="400" height="38" rx="8" fill="#2B2F4A"/>${txt(330, 58, num === BUS ? 'LIBRARY' : 'BEDOK', 24, '#FFB000', { ls: 3 })}
    ${[160, 260, 360, 460].map((x) => glassPane(x - 40, 82, 86, 62)).join('')}
    ${open ? '<rect x="30" y="80" width="84" height="130" rx="6" fill="#4E5E6E"/><rect x="30" y="80" width="84" height="130" rx="6" fill="url(#lpShadeV)"/>' : `${glassPane(30, 80, 40, 128)}${glassPane(74, 80, 40, 128)}`}
    ${vol('<circle cx="140" cy="214" r="28"/><circle cx="440" cy="214" r="28"/>', '#3E4A5A')}<circle cx="140" cy="214" r="10" fill="#C9D1D9"/><circle cx="440" cy="214" r="10" fill="#C9D1D9"/>
    <rect x="4" y="170" width="16" height="20" rx="4" fill="#FFE07A"/>`);
  // the inside of the bus (seats, poles, the next-stop screen)
  SX.bg.lfBusIn = () => `<rect width="${W}" height="${H}" fill="#EEF2F4"/>${tiles(450, '#B8C4CE', '#9AA6B2')}
    ${[150, 450, 750, 1000].map((x) => glassPane(x - 110, 110, 220, 120)).join('')}
    ${[200, 520, 840].map((x) => `${vol(`<rect x="${x - 110}" y="300" width="220" height="40" rx="12"/>`, '#5B8FD9', { shade: 'v' })}${vol(`<rect x="${x - 110}" y="250" width="220" height="70" rx="14"/>`, '#4A78A8', { shade: 'v' })}<path d="M${x - 90} 340v100M${x + 90} 340v100" stroke="#6B7A88" stroke-width="8"/>`).join('')}
    ${[360, 680, 1000].map((x) => `<rect x="${x - 8}" y="0" width="16" height="${H}" fill="#F4C430"/><rect x="${x - 8}" y="0" width="16" height="${H}" fill="url(#lpShadeH)" opacity=".4"/>`).join('')}
    <rect y="0" width="${W}" height="18" fill="#C9D1D9"/>`;
  // the front of the bus, inside (driver, card reader)
  SX.bg.lfBusFront = () => `<rect width="${W}" height="${H}" fill="#E9EEF2"/>${tiles(450, '#B8C4CE', '#9AA6B2')}
    <rect x="40" y="30" width="640" height="220" rx="20" fill="url(#lpSky)"/><rect x="40" y="200" width="640" height="50" fill="#8A97A6"/><rect x="40" y="30" width="640" height="220" rx="20" fill="url(#lpGlass)"/>
    ${vol('<rect x="20" y="250" width="700" height="80" rx="16"/>', '#3E4A5A', { shade: 'v' })}
    ${vol('<rect x="880" y="40" width="200" height="420" rx="14"/>', '#4E5E6E')}<rect x="900" y="60" width="160" height="380" rx="8" fill="url(#lpSky)"/><rect x="880" y="430" width="200" height="40" fill="#C9D1D9"/>
    <rect x="752" y="80" width="16" height="400" fill="#F4C430"/>`;
  const reader = (lit) => svg('0 0 90 120', `${LP.drop(45, 116, 36, 4)}${vol('<rect x="6" y="6" width="78" height="104" rx="14"/>', '#3E4A5A', { shade: 'h' })}${vol('<rect x="16" y="18" width="58" height="40" rx="6"/>', lit ? '#7FD18A' : '#FFD23F')}${txt(45, 92, 'TAP', 20, '#fff')}${lit ? '<path d="M32 38l9 9 16-16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' : ''}`);
  const tapStep = (o) => ({
    id: o.id, bg: o.bg, text: o.text,
    task: 'Drag the travel card onto the card reader.',
    lumi: o.lumi,
    draw(st) {
      let h = (o.draw ? o.draw(st) : '') + SX.at(o.rx, o.ry, 90, 120, reader(st.done), { target: true, id: 'reader', cls: 'ot-reader', z: 4, label: 'Card reader' });
      if (!st.done) h += SX.at(o.cx, o.cy, 120, 80, SX.prop.card(), { cls: 'sx-drag lf-card', label: 'Travel card', z: 8 });
      else h += SX.bubble(o.rx - 80, o.ry - 80, 'Beep!', { w: 100 });
      return h;
    },
    after(st, box) {
      if (st.done) return;
      SX.dragTo(box, '.lf-card', '[data-id="reader"]', () => { A.tone(1568, 0.12, 0.07); setTimeout(() => A.tone(2093, 0.18, 0.06), 140); SX.done(st, o.doneText); return true; }, { pad: 40, miss: () => SX.say('Bring the card to the card reader.') });
    },
    guide: () => ({ sel: '.lf-card', to: '[data-id="reader"]', say: 'Drag the card to the reader.' })
  });
  const SEATS = [200, 520, 840];

  const busSteps = [
    {
      id: 'sign', bg: 'lfBusStop',
      text: 'Lumi is going to the library by bus. At the bus stop, Lumi checks the sign. Lumi’s card says bus 65.',
      task: (st) => (st.s.tip || 'Tap bus 65 on the bus stop sign.'),
      lumi: { x: 860, y: 545, h: 210 },
      draw(st) {
        let h = '';
        ['54', '65', '852'].forEach((n, i) => { h += SX.at(495, 152 + i * 60, 130, 48, '', { k: 'plate', v: n, label: `Bus ${n}`, cls: `lf-plate ${st.done && n === BUS ? 'on' : ''}`, z: 4 }); });
        h += SX.at(930, 380, 170, 110, `<div class="lf-note">${ic('bus', 34)}<b>Bus ${BUS}</b><span>to the library</span></div>`, { z: 6, label: 'Lumi takes bus 65' });
        if (st.s.tipText) h += SX.bubble(660, 210, st.s.tipText, { w: 230 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'plate') return;
        if (d.v !== BUS) { st.s.tipText = `That is bus ${d.v}. Lumi needs ${BUS}.`; st.s.tip = `Find ${BUS} on the sign.`; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; SX.ok();
        SX.done(st, `Bus ${BUS} stops here. Now Lumi waits for it.`);
      },
      guide: () => ({ sel: `.lf-plate[data-v="${BUS}"]`, say: `Tap ${BUS}.` })
    },
    {
      id: 'wait', bg: 'lfBusStop',
      text: (st) => (st.s.phase === 0 ? 'Lumi waits at the bus stop. A bus is coming...' : st.s.phase === 1 ? 'A bus is here. Look at the number on the front. Is it bus 65?' : st.s.phase === 2 ? 'Here comes another bus. It is bus 65!' : 'The driver saw Lumi wave. The bus stops and the door opens.'),
      task: (st) => (st.s.phase === 1 ? 'Should Lumi get on bus 54?' : st.s.phase === 2 ? 'Wave so the driver knows to stop.' : st.s.phase === 3 ? 'Tap the bus door to get on.' : st.s.phase === 1.5 ? 'Wait for bus 65.' : 'Wait for the bus.'),
      lumi: (st) => ({ x: st.done ? 260 : 860, y: 545, h: 210, mood: st.s.phase === 1 ? 'worried' : 'happy' }),
      enter(st) { st.s.phase = 0; SX.later(st, () => { st.s.phase = 1; A.tone(300, 0.3, 0.04); SX.render(); SX.say('A bus is here. It is bus 54. Should Lumi get on?'); }, 1300); },
      draw(st) {
        let h = '';
        const p = st.s.phase;
        if (p === 1) h += SX.at(40, 196, 560, 250, busArt('54', true), { z: 2, cls: 'lf-drive-in' });
        if (p === 1.5) h += SX.at(40, 196, 560, 250, busArt('54', false), { z: 2, cls: 'lf-drive-out' });
        if (p >= 2) h += SX.at(40, 196, 560, 250, busArt(BUS, p >= 3), { z: 2, cls: p === 2 ? 'lf-drive-in' : '' });
        if (p === 3 && !st.done) h += SX.at(66, 270, 90, 140, '', { k: 'door', label: 'Bus door', cls: 'lf-door', z: 6 });
        if (p === 1) h += SX.choices([{ label: 'Get on', art: ic('bus', 56) }, { label: 'Let it go', art: ic('hourglass', 56) }], 'which', { style: 'right:24px;top:24px;', cls: 'col' });
        if (p === 2) h += SX.at(860, 200, 190, 120, `<span class="lf-btn">${ic('wave', 40)}<span>Wave</span></span>`, { k: 'wave', label: 'Wave to the driver', z: 7 });
        if (st.s.tipText) h += SX.bubble(640, 200, st.s.tipText, { w: 240 });
        return h;
      },
      tap(st, k, el, d) {
        if (k === 'which') {
          if (d.v === '0') { st.s.tipText = 'That is bus 54. It goes somewhere else.'; SX.nope(el, 'That is bus 54. Lumi needs bus 65. Let it go.'); SX.render(); return; }
          st.s.tipText = null; st.s.phase = 1.5; SX.ok(); SX.render(); SX.say('Bye, bus 54! Lumi waits for bus 65.');
          SX.later(st, () => { st.s.phase = 2; SX.render(); SX.say('Here comes bus 65! Wave so the driver knows to stop.'); }, 2200);
          return;
        }
        if (k === 'wave' && st.s.phase === 2) { st.s.phase = 3; SX.ok(); SX.render(); SX.say('The bus stops. Tap the door to get on.'); return; }
        if (k === 'door' && st.s.phase === 3) { SX.ok(); SX.done(st, 'Lumi let the wrong bus go and got on bus 65!'); }
      },
      guide: (st) => (st.s.phase === 1 ? { sel: '.sx-choice[data-v="1"]', say: 'Let it go.', tap: true } : st.s.phase === 2 ? { sel: '[data-k="wave"]', say: 'Tap Wave.', tap: true } : st.s.phase === 3 ? { sel: '[data-k="door"]', say: 'Tap the door.', tap: true } : null)
    },
    tapStep({
      id: 'tapin', bg: 'lfBusFront',
      text: 'Lumi says hello to the driver and taps the travel card.',
      lumi: { x: 960, y: 555, h: 210, flip: true },
      draw: () => person(140, 120, 220, { who: 'man', pose: 'sit', mood: 'smile', top: '#3F70B5' }, 2) + SX.at(20, 250, 700, 80, svg('0 0 700 80', vol('<rect x="0" y="0" width="700" height="80" rx="16"/>', '#3E4A5A', { shade: 'v' })), { z: 3 }) + SX.at(250, 176, 120, 120, svg('0 0 120 120', `${vol('<circle cx="60" cy="60" r="48"/>', '#2B2F4A')}<circle cx="60" cy="60" r="30" fill="#E9EEF2"/>`), { z: 4 }),
      rx: 714, ry: 200, cx: 790, cy: 440,
      doneText: 'Beep! The card works. Lumi says thank you to the driver.'
    }),
    {
      id: 'seat', bg: 'lfBusIn',
      text: 'Lumi looks for a seat. Some seats have people in them.',
      task: (st) => (st.s.tip || 'Tap an empty seat.'),
      lumi: (st) => (st.done ? { x: SEATS[1], y: 380, h: 170 } : { x: 1040, y: 560, h: 200, flip: true }),
      draw(st) {
        let h = person(SEATS[0] - 50, 180, 200, { who: 'woman', pose: 'sit', item: 'phone' }) + person(SEATS[2] - 50, 180, 200, { who: 'grandma', pose: 'sit' });
        if (!st.done) SEATS.forEach((x, i) => { h += SX.at(x - 110, 240, 220, 110, '', { k: 'seat', v: i, label: i === 1 ? 'Empty seat' : 'Seat with someone in it', cls: 'lf-seat', z: 6 }); });
        if (st.s.tipText) h += SX.bubble(420, 120, st.s.tipText, { w: 260 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'seat') return;
        if (d.v !== '1') { st.s.tipText = 'Someone is sitting there. Find an empty seat.'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; SX.ok(); SX.done(st, 'Lumi sits down in the empty seat.');
      },
      guide: () => ({ sel: '.lf-seat[data-v="1"]', say: 'Tap the empty seat.' })
    },
    SX.copeStep({
      id: 'noisy', bg: 'lfBusIn',
      text: 'The bus is noisy. The engine hums, and a man talks loudly on his phone.',
      lumi: (st) => ({ x: SEATS[1], y: 380, h: 170, mood: st.done ? 'calm' : 'worried' }),
      draw: () => person(SEATS[0] - 50, 180, 200, { who: 'woman', pose: 'sit', item: 'phone' }) + person(SEATS[2] - 50, 180, 200, { who: 'grandma', pose: 'sit' }) + person(660, 240, 260, { who: 'man', item: 'phone', mood: 'talk', flip: true }, 6) + SX.bubble(700, 160, 'HELLO? YES!', { w: 150 }),
      options: [SX.HEADPHONES, { label: 'Look out of the window', art: ic('tree', 56), reply: 'Lumi watches the trees go by. It helps.' }, SX.BREATHE]
    }),
    {
      id: 'bell', bg: 'lfBusIn',
      text: (st) => (st.s.stop === 'Library' ? 'The screen says: Next stop, Library. That is Lumi’s stop!' : 'Lumi watches the screen. It shows the next stop.'),
      task: (st) => (st.s.stop === 'Library' ? 'Press the red bell button now.' : 'Wait for the screen to say Library.'),
      lumi: { x: SEATS[1], y: 380, h: 170 },
      enter(st) { st.s.stop = 'Blk 123'; SX.later(st, () => { st.s.stop = 'Library'; A.tone(880, 0.15, 0.05); SX.render(); SX.say('Next stop, Library! Press the bell.'); }, 3200); },
      draw(st) {
        let h = person(SEATS[0] - 50, 180, 200, { who: 'woman', pose: 'sit' }) + person(SEATS[2] - 50, 180, 200, { who: 'grandma', pose: 'sit' });
        h += SX.at(380, 26, 380, 76, `<div class="lf-busscreen ${st.done ? 'stopping' : ''}">${st.done ? 'BUS STOPPING' : `Next stop: <b>${esc(st.s.stop)}</b>`}</div>`, { z: 6, label: st.done ? 'Bus stopping' : `Next stop: ${st.s.stop}` });
        h += SX.at(644, 230, 72, 72, svg('0 0 72 72', `${vol('<rect x="4" y="10" width="64" height="52" rx="12"/>', '#F4C430')}${vol('<circle cx="36" cy="36" r="18"/>', st.done ? '#FF7A6E' : '#E5534B')}`), { k: 'bell', label: 'Bell button', cls: `lf-bell ${st.s.stop === 'Library' && !st.done ? 'go' : ''}`, z: 7 });
        if (st.s.tipText) h += SX.bubble(720, 150, st.s.tipText, { w: 250 });
        if (st.done) h += SX.bubble(740, 260, 'Ding!', { w: 90, tail: 'left' });
        return h;
      },
      tap(st, k, el) {
        if (k !== 'bell' || st.done) return;
        if (st.s.stop !== 'Library') { st.s.tipText = 'Not yet. Wait until the screen says Library.'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; A.tone(1320, 0.25, 0.06);
        SX.done(st, 'Ding! The driver knows Lumi wants to get off.');
      },
      guide: (st) => (st.s.stop === 'Library' ? { sel: '.lf-bell', say: 'Press the bell.', tap: true } : null)
    },
    tapStep({
      id: 'tapout', bg: 'lfBusFront',
      text: 'The bus stops at the library. Before getting off, Lumi taps the card again.',
      lumi: { x: 960, y: 555, h: 210 },
      draw: () => person(140, 120, 220, { who: 'man', pose: 'sit', mood: 'smile', top: '#3F70B5' }, 2) + SX.at(20, 250, 700, 80, svg('0 0 700 80', vol('<rect x="0" y="0" width="700" height="80" rx="16"/>', '#3E4A5A', { shade: 'v' })), { z: 3 }),
      rx: 714, ry: 200, cx: 470, cy: 440,
      doneText: 'Beep! Lumi gets off at the library. Lumi took the bus. Well done!'
    })
  ];
  SX.story({ id: 'bus', title: 'Taking the bus', tint: '#DDEFD6', steps: busSteps });

  // ================================================================ AT THE LIBRARY
  const BOOKS = [['cars', 'Cars', 'bus', '#E5534B'], ['animals', 'Animals', 'paw', '#7FB069'], ['space', 'Space', 'moon', '#3E4A7A'], ['food', 'Food', 'apple', '#F4A259'], ['trains', 'Trains', 'train', '#5B8FD9']];
  const book = (b, o) => `<div class="lf-book ${o || ''}" style="background:${b[3]}">${ic(b[2], 46)}<b>${esc(b[1])}</b></div>`;
  const bookshelf = (x, y, w, rows, seed) => `${vol(`<rect x="${x}" y="${y}" width="${w}" height="${rows * 90 + 20}" rx="8"/>`, '#B07D4F', { shade: 'h' })}${Array.from({ length: rows }, (_, r) => `<rect x="${x + 10}" y="${y + 10 + r * 90}" width="${w - 20}" height="80" fill="#7A5434"/>${Array.from({ length: Math.floor((w - 30) / 22) }, (__, i) => { const c = ['#E5534B', '#7FB069', '#5B8FD9', '#F4C430', '#B48AD9', '#4FB3A9', '#F2A7BE'][(i * 3 + r + seed) % 7]; const hh = 56 + ((i * 5 + r + seed) % 3) * 8; return `<rect x="${x + 16 + i * 22}" y="${y + 86 + r * 90 - hh}" width="18" height="${hh}" rx="2" fill="${c}"/><rect x="${x + 19 + i * 22}" y="${y + 92 + r * 90 - hh}" width="12" height="4" fill="#fff" opacity=".5"/>`; }).join('')}`).join('')}`;
  SX.bg.lfLibrary = () => `${wall('#F4EBDD', 430)}${tiles(430, '#CDB79A', '#B39C7E')}${lights(14, 4)}
    ${bookshelf(30, 70, 280, 4, 0)}${bookshelf(820, 70, 270, 4, 3)}
    ${glassPane(360, 60, 400, 220)}<path d="M560 60v220M360 170h400" stroke="#fff" stroke-width="8"/>
    ${vol('<rect x="440" y="300" width="240" height="60" rx="14"/>', '#FFFFFF', { lineOpacity: 0.3 })}${txt(560, 340, 'QUIET PLEASE', 26, '#2F7E79', { ls: 1 })}`;
  SX.bg.lfReading = () => `${wall('#EFE6F4', 420)}${tiles(420, '#C9B4E0', '#B09AC8')}${bookshelf(40, 60, 300, 4, 1)}${glassPane(420, 60, 300, 200)}
    ${LP.drop(560, 540, 220, 18)}${vol('<ellipse cx="560" cy="490" rx="210" ry="70"/>', '#F2A65A')}${vol('<ellipse cx="560" cy="440" rx="170" ry="70"/>', '#F7C79A')}
    ${bookshelf(800, 120, 260, 3, 5)}`;
  SX.bg.lfKiosk = () => `${wall('#EAF2F0', 430)}${tiles(430, '#CDB79A', '#B39C7E')}${lights(14, 3)}${bookshelf(860, 70, 220, 4, 2)}
    ${LP.drop(560, 520, 220, 16)}${vol('<rect x="380" y="60" width="360" height="460" rx="24"/>', '#3E4A5A', { shade: 'h' })}${vol('<rect x="360" y="300" width="400" height="40" rx="12"/>', '#5A6878')}`;
  const libSteps = [
    {
      id: 'voice', bg: 'lfLibrary',
      text: 'Lumi goes to the library. People are reading. It is a quiet place.',
      task: (st) => (st.s.tip || 'How should Lumi talk in the library?'),
      lumi: (st) => ({ x: 560, y: 550, h: 210, mood: st.done ? 'calm' : 'happy' }),
      draw(st) {
        let h = person(330, 290, 240, { who: 'grandpa', item: 'book', pose: 'hold' }) + person(720, 300, 230, { who: 'girl', item: 'book', pose: 'hold', flip: true });
        if (!st.done) h += SX.choices([{ label: 'A quiet voice', art: ic('quiet', 56) }, { label: 'A loud voice', art: ic('volume', 56) }], 'voice', { style: 'right:24px;top:24px;', cls: 'col' });
        if (st.s.tipText) h += SX.bubble(640, 170, st.s.tipText, { w: 260 });
        if (st.done) h += SX.bubble(640, 232, 'Hello... (whisper)', { w: 190, tail: 'left' });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'voice') return;
        if (d.v === '1') { st.s.tipText = 'Shh. A loud voice can stop people reading.'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; SX.ok(); SX.done(st, 'A quiet voice. Lumi whispers in the library.');
      },
      guide: () => ({ sel: '.sx-choice[data-v="0"]', say: 'Tap A quiet voice.', tap: true })
    },
    {
      id: 'find', bg: 'lfLibrary',
      text: 'Lumi wants a book about animals.',
      task: (st) => (st.s.tip || 'Find the book with an animal on it. Drag it to Lumi’s basket.'),
      lumi: { x: 820, y: 555, h: 200 },
      draw(st) {
        let h = SX.at(220, 140, 680, 30, '', { z: 1 });
        if (!st.done) BOOKS.forEach((b, i) => { h += SX.at(330 + i * 92, 380, 84, 120, book(b), { cls: 'sx-drag lf-pickbook', id: b[0], label: `Book about ${b[1]}`, z: 6 }); });
        h += SX.at(900, 400, 170, 130, svg('0 0 170 130', `${LP.drop(85, 124, 76, 6)}<path d="M40 40c0-36 90-36 90 0" fill="none" stroke="#2F7E79" stroke-width="8" stroke-linecap="round"/>${st.done ? `<rect x="50" y="10" width="70" height="60" rx="6" fill="#7FB069"/>` : ''}${vol('<path d="M10 44h150l-14 80H24z"/>', '#4FB3A9')}`), { target: true, id: 'basket', cls: 'lf-basket', z: 5, label: 'Basket' });
        if (st.s.tipText) h += SX.bubble(380, 250, st.s.tipText, { w: 280 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lf-pickbook', '.lf-basket', (t, el) => {
          const b = BOOKS.find((x) => x[0] === el.dataset.id);
          if (b[0] !== 'animals') { st.s.tipText = `That book is about ${b[1].toLowerCase()}. Look for the animal.`; st.s.tip = 'Find the book with the paw print.'; SX.nope(null, st.s.tipText); SX.render(); return false; }
          st.s.tipText = null; SX.done(st, 'A book about animals! Lumi found it.');
          return true;
        }, { miss: () => SX.say('Put the book in the basket.') });
      },
      guide: () => ({ sel: '.lf-pickbook[data-id="animals"]', to: '.lf-basket', say: 'Drag the animal book to the basket.' })
    },
    {
      id: 'read', bg: 'lfReading',
      text: 'Lumi sits on a big beanbag and reads.',
      task: (st) => (st.s.page < 3 ? 'Tap the book to turn the page.' : ''),
      lumi: { x: 520, y: 450, h: 200 },
      enter(st) { st.s.page = 0; },
      draw(st) {
        const pages = [['paw', 'Dogs say woof'], ['tree', 'Monkeys climb trees'], ['drop', 'Fish swim'], ['sun', 'The end']];
        const pg = pages[Math.min(st.s.page, 3)];
        return SX.at(720, 130, 300, 220, `<div class="lf-open"><span>${ic(pg[0], 72)}</span><b>${esc(pg[1])}</b><span class="lf-pg">${st.s.page + 1} / 4</span></div>`, { k: st.s.page < 3 ? 'page' : '', label: 'The animal book', cls: st.s.page < 3 ? 'lf-openbtn' : '', z: 6 });
      },
      tap(st, k) {
        if (k !== 'page') return;
        st.s.page += 1; A.tone(700 + st.s.page * 80, 0.1, 0.05);
        if (st.s.page >= 3) SX.done(st, 'The end! Lumi read the whole book.'); else SX.render();
      },
      guide: () => ({ sel: '.lf-openbtn', say: 'Tap the book.', tap: true })
    },
    SX.copeStep({
      id: 'loud', bg: 'lfReading',
      text: 'A boy nearby is reading out loud, and a book trolley squeaks past.',
      lumi: (st) => ({ x: 520, y: 450, h: 200, mood: st.done ? 'calm' : 'worried' }),
      draw: () => person(820, 250, 240, { who: 'boy', item: 'book', pose: 'hold', mood: 'talk', flip: true }) + SX.bubble(560, 150, 'AND THE LION SAID...', { w: 210, tail: 'right' }),
      options: [SX.HEADPHONES, { label: 'Move to a quieter seat', art: ic('quiet', 56), reply: 'Lumi finds a quieter corner. Much better.' }, SX.BREATHE]
    }),
    {
      id: 'borrow', bg: 'lfKiosk',
      text: (st) => (st.s.stage ? 'The machine says: Now put your book on the pad.' : 'To borrow the book, Lumi uses the self-check machine.'),
      task: (st) => (st.done ? '' : st.s.stage ? 'Drag the book onto the pad.' : 'First, drag the library card onto the screen.'),
      lumi: { x: 210, y: 555, h: 210 },
      enter(st) { st.s.stage = 0; },
      draw(st) {
        let h = SX.at(410, 90, 300, 190, `<div class="lf-kscreen">${st.done ? `${ic('check', 46)}<b>Borrowed!</b><span>Return by 30 Nov</span>` : st.s.stage ? `${ic('book', 46)}<b>Put your book on the pad</b>` : `${ic('buscard', 46)}<b>Scan your library card</b>`}</div>`, { target: !st.s.stage, id: 'screen', z: 4, label: 'Machine screen' });
        h += SX.at(420, 300, 280, 40, '', { target: !!st.s.stage, id: 'pad', cls: 'lf-pad', z: 4 });
        if (!st.s.stage) h += SX.at(150, 230, 120, 80, svg('0 0 90 60', `${LP.drop(45, 57, 40, 3)}${vol('<rect x="3" y="4" width="84" height="52" rx="7"/>', '#2F7E79', { shade: 'v' })}${txt(45, 36, 'LIBRARY', 13, '#fff')}`), { cls: 'sx-drag lf-libcard', label: 'Library card', z: 8 });
        if (st.s.stage && !st.done) h += SX.at(820, 380, 84, 120, book(BOOKS[1]), { cls: 'sx-drag lf-lendbook', label: 'The animal book', z: 8 });
        if (st.done) h += SX.at(500, 230, 84, 120, book(BOOKS[1]), { z: 5 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        if (!st.s.stage) SX.dragTo(box, '.lf-libcard', '[data-id="screen"]', () => { A.tone(1568, 0.12, 0.07); st.s.stage = 1; SX.render(); SX.say('Beep! Now put the book on the pad.'); return true; }, { pad: 30, miss: () => SX.say('Hold the card up to the screen.') });
        else SX.dragTo(box, '.lf-lendbook', '[data-id="pad"]', () => { A.tone(1568, 0.12, 0.07); setTimeout(() => A.tone(2093, 0.18, 0.06), 140); SX.done(st, 'Beep! The book is borrowed. Lumi can take it home.'); return true; }, { pad: 40, miss: () => SX.say('Put the book on the pad.') });
      },
      guide: (st) => (st.s.stage ? { sel: '.lf-lendbook', to: '[data-id="pad"]', say: 'Drag the book onto the pad.' } : { sel: '.lf-libcard', to: '[data-id="screen"]', say: 'Drag the card to the screen.' })
    },
    {
      id: 'return', bg: () => `${wall('#F4EBDD', 430)}${tiles(430, '#CDB79A', '#B39C7E')}${vol('<rect x="420" y="80" width="300" height="420" rx="18"/>', '#7A8A9A', { shade: 'h' })}${vol('<rect x="460" y="190" width="220" height="50" rx="10"/>', '#2B2F4A')}${txt(570, 150, 'BOOK RETURN', 26, '#fff', { ls: 1 })}`,
      text: 'Two weeks later, Lumi has finished the book. Time to give it back.',
      task: 'Drag the book into the book return slot.',
      lumi: { x: 230, y: 555, h: 210 },
      draw(st) {
        let h = SX.at(450, 180, 240, 70, '', { target: true, id: 'slot', cls: 'lf-slot', z: 4, label: 'Book return slot' });
        if (!st.done) h += SX.at(820, 380, 84, 120, book(BOOKS[1]), { cls: 'sx-drag lf-retbook', label: 'The animal book', z: 8 });
        else h += SX.bubble(560, 300, 'Thank you!', { w: 140 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lf-retbook', '[data-id="slot"]', () => { A.tone(500, 0.2, 0.05); SX.done(st, 'Whoosh! The book is back. Now Lumi can borrow a new one.'); return true; }, { pad: 40, miss: () => SX.say('Put the book in the slot.') });
      },
      guide: () => ({ sel: '.lf-retbook', to: '[data-id="slot"]', say: 'Drag the book into the slot.' })
    }
  ];
  SX.story({ id: 'library', title: 'At the library', tint: '#F3E6D2', steps: libSteps });

  // ================================================================ GETTING A VACCINATION
  const LUMI_ARM = '#F2A65A';
  // Lumi's arm, close up: o.up (sleeve rolled up), o.plaster, o.clean
  const arm = (o) => svg('0 0 460 260', `${LP.drop(230, 254, 210, 8)}${vol('<rect x="4" y="4" width="452" height="246" rx="40"/>', '#FFFFFF', { lineOpacity: 0.25 })}
    <g>
    ${vol('<path d="M60 96 h300 a38 38 0 0 1 0 76 h-300 z"/>', LUMI_ARM)}${LP.shine(180, 108, 70, 8, 0)}
    ${o.up
      ? `${vol('<path d="M40 40 h70 q24 0 24 24 v132 q0 24 -24 24 h-70 q-16 0 -16 -16 v-148 q0 -16 16 -16 z"/>', '#5B8FD9')}${vol('<rect x="96" y="66" width="34" height="136" rx="14"/>', '#4A78A8')}${o.clean ? '<ellipse cx="250" cy="134" rx="40" ry="22" fill="#fff" opacity=".4"/>' : ''}`
      : `${vol('<path d="M40 40 h170 q30 0 30 30 v120 q0 30 -30 30 h-170 q-16 0 -16 -16 v-148 q0 -16 16 -16 z"/>', '#5B8FD9')}<path d="M232 62 v136" stroke="#4A78A8" stroke-width="6" stroke-linecap="round"/>`}
    ${o.plaster ? `${vol('<rect x="214" y="116" width="76" height="36" rx="14" transform="rotate(-8 252 134)"/>', '#F7C79A')}<rect x="238" y="122" width="28" height="24" rx="5" fill="#E9B98A" transform="rotate(-8 252 134)"/>` : ''}</g>
    ${txt(400, 40, 'Lumi\u2019s arm', 20, '#6B5A4E')}`);
  const qScreen = (n) => `<div class="lf-qscreen"><span>Now serving</span><b>${n}</b></div>`;
  const ticket = () => `<div class="lf-ticket"><span>Your number</span><b>2045</b></div>`;
  const nurseAt = (x, y, o) => person(x, y, 280, Object.assign({ who: 'nurse', mood: 'smile' }, o || {}), 3);
  const jabSteps = [
    {
      id: 'queue', bg: 'carePolyWait',
      text: 'Lumi and Mum are at the clinic. Lumi is getting a vaccination today. It helps Lumi’s body stay strong.',
      task: (st) => (st.s.tip || (st.s.n === 2045 ? 'It is 2045! Tap the screen.' : 'Wait for the screen to show 2045, Lumi’s number.')),
      lumi: { x: 300, y: 555, h: 200 },
      enter(st) {
        st.s.n = 2043;
      },
      // the first step of a story opens before its screen (timers set then are cleared), so the waiting starts once it is drawn
      after(st) {
        if (st.s.started) return;
        st.s.started = true;
        SX.later(st, () => { st.s.n = 2044; A.tone(880, 0.12, 0.04); SX.render(); }, 1800);
        SX.later(st, () => { st.s.n = 2045; A.tone(880, 0.12, 0.05); setTimeout(() => A.tone(1175, 0.15, 0.05), 140); SX.render(); SX.say('2045! That is Lumi’s number. Tap the screen.'); }, 3800);
      },
      draw(st) {
        let h = person(80, 300, 250, { who: 'mum', pose: 'sit' }, 3);
        h += SX.at(620, 40, 300, 150, qScreen(st.s.n), { k: 'screen', label: `Now serving ${st.s.n}`, cls: `lf-qbtn ${st.s.n === 2045 && !st.done ? 'go' : ''}`, z: 5 });
        h += SX.at(400, 300, 150, 100, ticket(), { z: 6, label: 'Lumi’s number is 2045' });
        if (st.s.tipText) h += SX.bubble(640, 220, st.s.tipText, { w: 260 });
        return h;
      },
      tap(st, k, el) {
        if (k !== 'screen' || st.done) return;
        if (st.s.n !== 2045) { st.s.tipText = `That says ${st.s.n}. Lumi has 2045. Not yet.`; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; SX.ok(); SX.done(st, 'It is Lumi’s turn. Lumi and Mum go in.');
      },
      guide: (st) => (st.s.n === 2045 ? { sel: '.lf-qbtn', say: 'Tap the screen.', tap: true } : null)
    },
    {
      id: 'ask', bg: 'careConsult',
      text: 'Nurse Siti says: "First I clean your arm. Then a quick poke, like a small pinch. Then it’s done."',
      task: (st) => (st.done ? '' : 'Lumi has a question. Tap the card to ask it.'),
      lumi: { x: 330, y: 555, h: 210, mood: 'worried' },
      draw(st) {
        let h = nurseAt(760, 260, { mood: st.done ? 'talk' : 'smile', flip: true });
        h += `<div style="position:absolute;left:470px;top:60px;z-index:6">${SX.talkCard([{ t: 'Will', art: ic('what', 40) }, { t: 'it', art: '' }, { t: 'hurt?', art: ic('hurt', 40) }], 'ask', { said: st.done })}</div>`;
        if (st.done) h += SX.bubble(520, 200, 'Just a little pinch. It is over very fast.', { w: 260, tail: 'right' });
        return h;
      },
      tap(st, k) { if (k !== 'ask') return; SX.say('Will it hurt?'); SX.ok(); SX.done(st, 'Asking helps. Now Lumi knows what will happen.'); },
      guide: () => ({ sel: '.sx-talk', say: 'Tap the card.', tap: true })
    },
    SX.copeStep({
      id: 'nervous', bg: 'careConsult',
      text: 'Lumi feels nervous. That is OK. Lots of people feel nervous before a poke.',
      lumi: (st) => ({ x: 330, y: 555, h: 210, mood: st.done ? 'calm' : 'worried' }),
      draw: () => nurseAt(760, 260, { flip: true }) + person(100, 280, 260, { who: 'mum' }, 4),
      options: [{ label: 'Hold Mum’s hand', art: ic('hug', 56), reply: 'Mum holds Lumi’s hand. Lumi feels safe.' }, { label: 'Squeeze a soft ball', art: SX.ART.squeeze, reply: 'Squeeze, squeeze. Lumi’s hands feel busy and calm.' }, SX.BREATHE]
    }),
    {
      id: 'sleeve', bg: 'careConsult',
      text: 'Nurse Siti needs to see the top of Lumi’s arm.',
      task: (st) => (st.s.up ? (st.done ? '' : 'Now the nurse cleans the spot. Tap the arm.') : 'Tap the sleeve to roll it up.'),
      lumi: { x: 140, y: 555, h: 180, mood: 'worried' },
      draw(st) {
        let h = nurseAt(880, 250, { flip: true, item: 'clipboard' });
        h += SX.at(240, 120, 460, 260, arm({ up: st.s.up, clean: st.done }), { k: st.done ? '' : st.s.up ? 'clean' : 'sleeve', label: st.s.up ? 'Lumi’s arm' : 'Lumi’s sleeve', cls: st.done ? '' : 'lf-armbtn', z: 5 });
        if (st.done) h += SX.bubble(520, 60, 'Cool and wet! That is the cleaning.', { w: 270 });
        return h;
      },
      tap(st, k) {
        if (k === 'sleeve') { st.s.up = true; SX.ok(); SX.render(); SX.say('Sleeve up. Now the nurse cleans the spot. Tap the arm.'); return; }
        if (k === 'clean') { SX.ok(); SX.done(st, 'The arm is clean and ready.'); }
      },
      guide: () => ({ sel: '.lf-armbtn', say: 'Tap the arm.', tap: true })
    },
    {
      id: 'count', bg: 'careConsult',
      text: 'Nurse Siti says: "Let’s count together. One, two, three!"',
      task: (st) => (st.s.n < 3 ? `Tap ${st.s.n + 1}.` : ''),
      lumi: (st) => ({ x: 200, y: 555, h: 200, mood: st.done ? 'excited' : 'worried' }),
      enter(st) { st.s.n = 0; },
      draw(st) {
        let h = nurseAt(880, 250, { flip: true });
        h += `<div class="lf-count" style="left:360px;top:110px">${[1, 2, 3].map((n) => `<button class="lf-num ${st.s.n >= n ? 'on' : ''} ${st.s.n + 1 === n ? 'next' : ''}" data-a="sx" data-k="num" data-v="${n}" aria-label="${n}">${n}</button>`).join('')}</div>`;
        if (st.done) h += SX.bubble(380, 330, 'All done! That was quick.', { w: 240 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'num') return;
        const n = Number(d.v);
        if (n !== st.s.n + 1) { SX.nope(el, `Tap ${st.s.n + 1} first.`); return; }
        st.s.n = n; A.tone(600 + n * 120, 0.15, 0.06); SX.say(['One', 'Two', 'Three!'][n - 1]);
        if (n === 3) SX.done(st, 'Pinch... and it is over! Lumi was so brave.'); else SX.render();
      },
      guide: (st) => ({ sel: `.lf-num[data-v="${st.s.n + 1}"]`, say: `Tap ${st.s.n + 1}.`, tap: true })
    },
    {
      id: 'plaster', bg: 'careConsult',
      text: 'Now a plaster goes on the spot.',
      task: 'Drag the plaster onto Lumi’s arm.',
      lumi: (st) => ({ x: 140, y: 555, h: 180, mood: st.done ? 'happy' : 'calm' }),
      draw(st) {
        let h = nurseAt(880, 250, { flip: true });
        h += SX.at(240, 120, 460, 260, arm({ up: true, plaster: st.done }), { z: 4, label: 'Lumi’s arm' });
        h += SX.at(440, 220, 110, 80, '', { target: true, id: 'spot', z: 5 });
        if (!st.done) h += SX.at(760, 430, 110, 60, svg('0 0 110 60', `${vol('<rect x="4" y="8" width="102" height="44" rx="16"/>', '#F7C79A')}<rect x="38" y="16" width="34" height="28" rx="5" fill="#E9B98A"/>`), { cls: 'sx-drag lf-plaster', label: 'Plaster', z: 8 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lf-plaster', '[data-id="spot"]', () => { SX.done(st, 'Plaster on! The arm may feel a bit sore later. That is normal.'); return true; }, { pad: 40, miss: () => SX.say('Put the plaster on the spot.') });
      },
      guide: () => ({ sel: '.lf-plaster', to: '[data-id="spot"]', say: 'Drag the plaster onto the arm.' })
    },
    {
      id: 'sticker', bg: 'careConsult',
      text: 'Nurse Siti says: "You did so well! Here is a sticker."',
      task: (st) => (st.done ? '' : 'Tap the sticker to take it.'),
      lumi: (st) => ({ x: 330, y: 555, h: 210, mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        let h = nurseAt(760, 260, { flip: true, pose: st.done ? 'wave' : 'give' });
        if (!st.done) h += SX.at(620, 280, 110, 110, `<span class="lf-sticker">${ic('star', 70)}<b>BRAVE</b></span>`, { k: 'sticker', label: 'Brave sticker', cls: 'sx-glow', z: 7 });
        else h += SX.at(300, 300, 70, 70, `<span class="lf-sticker small">${ic('star', 44)}</span>`, { z: 7 });
        return h;
      },
      tap(st, k) { if (k !== 'sticker') return; A.tone(988, 0.2, 0.06); SX.done(st, 'A brave sticker! Lumi says thank you to Nurse Siti.'); },
      guide: () => ({ sel: '[data-k="sticker"]', say: 'Tap the sticker.', tap: true })
    }
  ];
  SX.story({ id: 'jab', title: 'Getting a vaccination', tint: '#DCEBF7', steps: jabSteps });

  // ================================================================ WHEN THERE IS THUNDER
  const stormSky = (st) => {
    const sunny = st && st.data && st.data.sunny;
    const sky = sunny ? '<rect x="330" y="70" width="460" height="260" fill="url(#lpSky)"/><circle cx="700" cy="130" r="38" fill="#F4D35E"/>'
      + [['#E5534B', 0], ['#F4A259', 14], ['#F4D35E', 28], ['#7FB069', 42], ['#5B8FD9', 56], ['#9B87D9', 70]].map(([c, d]) => `<path d="M${370 + d} 330 A${190 - d} ${190 - d} 0 0 1 ${750 - d} 330" fill="none" stroke="${c}" stroke-width="14" opacity=".85"/>`).join('')
      : `<rect x="330" y="70" width="460" height="260" fill="#59627A"/>${[[420, 130, 70], [560, 110, 90], [700, 140, 70]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="#7A8399"/>`).join('')}${Array.from({ length: 18 }, (_, i) => `<path d="M${350 + i * 26} ${190 + (i % 3) * 30}l-10 34" stroke="#BFD3E6" stroke-width="3" stroke-linecap="round"/>`).join('')}`;
    return sky;
  };
  SX.bg.lfStormRoom = (st) => `${wall('#EDE6F4', 400)}${tiles(400, '#D8C8B0', '#C2AE90')}
    ${stormSky(st)}${vol('<rect x="316" y="56" width="488" height="288" rx="12" fill="none" stroke-width="16"/>', '#FFFFFF')}
    ${st && st.data && st.data.closed ? '<path d="M560 64v272" stroke="#fff" stroke-width="12"/><rect x="330" y="70" width="460" height="260" fill="url(#lpGlass)"/>' : '<path d="M560 64v272" stroke="#fff" stroke-width="12"/><path d="M790 70 l90 -20 v300 l-90 -20z" fill="#DCEFF7" opacity=".85" stroke="#fff" stroke-width="8"/>'}
    ${vol('<rect x="40" y="290" width="240" height="90" rx="24"/><rect x="56" y="250" width="208" height="70" rx="22"/>', '#B9A6E0')}<path d="M56 380v20M264 380v20" stroke="#8A6A4A" stroke-width="10" stroke-linecap="round"/>
    ${st && st.data && !st.data.closed ? '<ellipse cx="760" cy="440" rx="60" ry="12" fill="#8EC5F2" opacity=".7"/>' : ''}`;
  const blanket = () => svg('0 0 140 100', `${LP.drop(70, 96, 60, 5)}${vol('<path d="M10 30 q60 -30 120 0 v50 q-60 24 -120 0z"/>', '#E58BA6')}<path d="M24 40 q46 -20 92 0 M24 58 q46 -20 92 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`);
  const pillow = () => svg('0 0 120 80', `${LP.drop(60, 76, 52, 5)}${vol('<rect x="8" y="10" width="104" height="60" rx="24"/>', '#8EC5F2')}`);
  const torch = () => svg('0 0 120 60', `${LP.drop(60, 56, 50, 4)}${vol('<rect x="10" y="18" width="70" height="26" rx="10"/>', '#F4C430')}${vol('<path d="M80 12h22l10 -6v52l-10 -6h-22z"/>', '#3E4A5A')}`);
  const COSY = [['blanket', 'Blanket', blanket, 140, 100], ['pillow', 'Pillow', pillow, 120, 80], ['torch', 'Torch', torch, 120, 60]];
  const thunderSteps = [
    {
      id: 'window', bg: 'lfStormRoom',
      text: 'Lumi is playing at home with Dad. The sky turns dark, and it starts to rain.',
      task: (st) => (st.done ? '' : 'Rain is coming in! Tap the window to close it.'),
      lumi: { x: 520, y: 555, h: 200 },
      enter(st) { st.data.closed = false; st.data.sunny = false; },
      draw(st) {
        let h = person(110, 230, 230, { who: 'dad', pose: 'sit' }, 4);
        if (!st.done) h += SX.at(780, 60, 110, 290, '', { k: 'window', label: 'The open window', cls: 'lf-winbtn', z: 6 });
        return h;
      },
      tap(st, k) { if (k !== 'window') return; st.data.closed = true; SX.ok(); SX.done(st, 'Click! The window is closed. The rain stays outside.'); },
      guide: () => ({ sel: '.lf-winbtn', say: 'Tap the window.', tap: true })
    },
    SX.copeStep({
      id: 'boom', bg: 'lfStormRoom',
      text: 'Flash! Then... BOOM! Thunder is very loud. It cannot come inside, but it can feel scary.',
      lumi: (st) => ({ x: 520, y: 555, h: 200, mood: st.done ? 'calm' : 'scared' }),
      draw: () => person(110, 230, 230, { who: 'dad', pose: 'sit' }, 4) + '<div class="lf-flash"></div>' + SX.bubble(400, 90, 'BOOM!', { w: 110 }),
      options: [{ label: 'Cover my ears', art: ic('quiet', 56), reply: 'Hands over ears. The boom sounds softer.' }, SX.HEADPHONES, { label: 'Sit close to Dad', art: ic('hug', 56), reply: 'Dad gives a big hug. Lumi feels safe.' }]
    }),
    {
      id: 'cosy', bg: 'lfStormRoom',
      text: 'Dad has an idea: "Let’s make a cosy corner while the storm passes."',
      task: (st) => (st.s.got.length < 3 ? 'Drag the blanket, pillow and torch into the cosy corner.' : ''),
      lumi: { x: 760, y: 555, h: 190 },
      enter(st) { st.s.got = []; },
      draw(st) {
        let h = person(60, 230, 230, { who: 'dad', pose: 'point' }, 4);
        h += SX.at(300, 330, 300, 220, svg('0 0 300 220', `${LP.drop(150, 214, 140, 10)}${vol('<path d="M20 210 L150 20 L280 210 Z"/>', '#F4D35E')}<path d="M150 20 L120 210 M150 20 L180 210" stroke="#E0B21A" stroke-width="4"/><path d="M110 210 q40 -90 80 0z" fill="#5A4A3A" opacity=".55"/>${st.s.got.map((id, i) => `<g transform="translate(${60 + i * 62} ${150 - (i % 2) * 14}) scale(.5)">${COSY.find((c) => c[0] === id)[2]().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`).join('')}`), { target: true, id: 'tent', cls: 'lf-tent', z: 3, label: 'Cosy corner' });
        const spots = [[660, 150], [830, 170], [980, 300]];
        COSY.forEach(([id, label, art, w, hh], i) => { if (!st.s.got.includes(id)) h += SX.at(spots[i][0], spots[i][1], w, hh, art(), { cls: 'sx-drag lf-cosy', id, label, z: 7 }); });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lf-cosy', '.lf-tent', (t, el) => {
          st.s.got.push(el.dataset.id); A.tone(640 + st.s.got.length * 100, 0.12, 0.05);
          if (st.s.got.length === 3) SX.done(st, 'A cosy corner! Snug and safe inside.'); else SX.render();
          return true;
        }, { miss: () => SX.say('Put it in the cosy corner.') });
      },
      guide: () => ({ sel: '.lf-cosy', to: '.lf-tent', say: 'Drag it into the cosy corner.' })
    },
    {
      id: 'calm', bg: 'lfStormRoom',
      text: 'The storm is still going. Lumi does something calm while waiting.',
      task: (st) => (st.done ? '' : 'What would Lumi like to do?'),
      lumi: { x: 450, y: 520, h: 190, mood: 'calm' },
      draw(st) {
        let h = '';
        if (!st.done) h += SX.choices([{ label: 'Read a book', art: ic('book', 56) }, { label: 'Draw a picture', art: ic('palette', 56) }, { label: 'Listen to music', art: SX.ART.headphones }], 'do', { style: 'right:24px;top:24px;', cls: 'col' });
        if (st.done) h += SX.bubble(540, 300, st.s.reply, { w: 260, tail: 'left' });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'do') return;
        const i = Number(d.v);
        if (i === 2) st.data.phones = true;
        st.s.reply = ['Lumi reads by torchlight. Cosy!', 'Lumi draws a rainbow for later.', 'Soft music covers the rumbles.'][i];
        SX.ok(); SX.done(st, st.s.reply);
      },
      guide: () => ({ sel: '.sx-choice', say: 'Pick one.', tap: true })
    },
    {
      id: 'rainbow', bg: 'lfStormRoom',
      text: (st) => (st.data.sunny ? 'The rain has stopped. The sun is out, and there is a rainbow!' : 'It is quiet now. No more booms. Is the storm over?'),
      task: (st) => (st.done ? '' : 'Tap the window to look outside.'),
      lumi: (st) => ({ x: 560, y: 555, h: 200, mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        let h = person(110, 230, 230, { who: 'dad', pose: st.done ? 'wave' : 'sit' }, 4);
        if (!st.done) h += SX.at(330, 70, 460, 260, '', { k: 'look', label: 'The window', cls: 'lf-winbtn', z: 6 });
        return h;
      },
      tap(st, k) { if (k !== 'look') return; st.data.sunny = true; A.tone(988, 0.2, 0.06); SX.done(st, 'A rainbow! Storms are loud, but they always end.'); },
      guide: () => ({ sel: '.lf-winbtn', say: 'Tap the window.', tap: true })
    }
  ];
  SX.story({ id: 'thunder', title: 'When there is thunder', tint: '#E4E2F2', steps: thunderSteps });

  // ================================================================ SWIMMING LESSON
  const swimsuit = () => svg('0 0 100 100', `${LP.drop(50, 96, 36, 5)}${vol('<path d="M28 10h12q10 16 20 0h12l4 40q-10 20 -10 44h-32q0 -24 -10 -44z"/>', '#E58BA6')}<path d="M34 50h32" stroke="#fff" stroke-width="4" opacity=".6"/>`);
  const goggles = () => svg('0 0 120 60', `${LP.drop(60, 56, 50, 4)}<path d="M8 30h104" stroke="#3E4A5A" stroke-width="5"/>${vol('<ellipse cx="38" cy="30" rx="22" ry="16"/><ellipse cx="82" cy="30" rx="22" ry="16"/>', '#4FB3A9')}<ellipse cx="38" cy="30" rx="16" ry="11" fill="url(#lpGlass)"/><ellipse cx="82" cy="30" rx="16" ry="11" fill="url(#lpGlass)"/>`);
  const towel = () => svg('0 0 120 80', `${LP.drop(60, 76, 52, 5)}${vol('<rect x="6" y="14" width="108" height="56" rx="26"/>', '#7FB069')}<path d="M30 20v44M90 20v44" stroke="#fff" stroke-width="4" opacity=".5"/>`);
  const teddy = () => svg('0 0 100 100', `${LP.drop(50, 96, 36, 5)}${vol('<circle cx="28" cy="22" r="12"/><circle cx="72" cy="22" r="12"/><circle cx="50" cy="42" r="28"/><ellipse cx="50" cy="80" rx="30" ry="18"/>', '#B07D4F')}<circle cx="41" cy="40" r="3.5" fill="#3B2F2F"/><circle cx="59" cy="40" r="3.5" fill="#3B2F2F"/><ellipse cx="50" cy="52" rx="8" ry="6" fill="#E8C9A8"/>`);
  const SWIM_PACK = [['swimsuit', 'Swimsuit', swimsuit, 100, 100], ['goggles', 'Goggles', goggles, 120, 60], ['towel', 'Towel', towel, 120, 80], ['teddy', 'Teddy', teddy, 100, 100]];
  const SWIM_NEED = ['swimsuit', 'goggles', 'towel'];
  SX.bg.lfChanging = () => `${wall('#E3F1F6', 440)}${tiles(440, '#D3E0E8', '#B4C6D2')}${lights(14, 4)}
    ${Array.from({ length: 6 }, (_, i) => vol(`<rect x="${40 + i * 62}" y="80" width="58" height="320" rx="6"/>`, '#7FA6D9', { shade: 'h', lineOpacity: 0.3 }) + `<circle cx="${84 + i * 62}" cy="240" r="5" fill="#3E4A5A"/>`).join('')}
    ${vol('<rect x="440" y="70" width="640" height="370" rx="10"/>', '#F4F6F8')}`;
  SX.bg.lfPool = () => `<rect width="${W}" height="300" fill="#E3F1F6"/>${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 60} 0v300" stroke="#C9E1EC" stroke-width="2"/>`).join('')}${glassPane(200, 30, 300, 130)}${glassPane(620, 30, 300, 130)}
    <rect y="290" width="${W}" height="44" fill="#E9EEF2"/><rect y="330" width="${W}" height="${H - 330}" fill="#5BB7E0"/><rect y="330" width="${W}" height="${H - 330}" fill="url(#lpShadeV)" opacity=".25"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 120 - 20} ${380 + (i % 3) * 50} q30 -10 60 0 t60 0" stroke="#fff" stroke-width="3" fill="none" opacity=".45"/>`).join('')}
    ${Array.from({ length: 40 }, (_, i) => `<circle cx="${380 + i * 20}" cy="356" r="7" fill="${i % 4 < 2 ? '#E5534B' : '#fff'}"/>`).join('')}
    ${[0, 1, 2].map((i) => vol(`<rect x="${60 + i * 50}" y="${300 + i * 50}" width="${300 - i * 50}" height="50"/>`, '#C9DCE6', { lineOpacity: 0.3 })).join('')}
    <path d="M70 240 v-20 q0 -20 20 -20 h20 v340" fill="none" stroke="url(#lpMetal)" stroke-width="12"/>`;
  const STEP_SPOTS = [[140, 340], [190, 390], [240, 440]];
  const coach = (x, y, o) => person(x, y, 260, Object.assign({ who: 'woman', top: '#E5534B', bottom: '#2F2F38', mood: 'smile', flip: true }, o || {}), 3);
  const water = () => SX.at(0, 430, W, H - 430, '<div class="lf-water"></div>', { z: 6 });
  const swimSteps = [
    {
      id: 'pack', bg: 'outHome',
      text: 'Today is Lumi’s swimming lesson! First, pack the swim bag.',
      task: (st) => (st.s.tip || 'Drag the swimsuit, goggles and towel into the bag.'),
      lumi: { x: 170, y: 560, h: 210 },
      enter(st) { st.s.packed = []; },
      draw(st) {
        let h = SX.at(860, 300, 200, 200, svg('0 0 200 200', `${LP.drop(100, 194, 90, 8)}<path d="M60 60c0-50 80-50 80 0" fill="none" stroke="#2B5E8A" stroke-width="10" stroke-linecap="round"/>${vol('<path d="M20 60h160l-12 130H32z"/>', '#5B8FD9')}${st.s.packed.length ? `${txt(100, 140, `${st.s.packed.length} / 3`, 30, '#fff')}` : ''}`), { target: true, id: 'bag', cls: 'lf-swimbag', z: 4, label: 'Swim bag' });
        const spots = [[330, 250], [470, 280], [620, 270], [720, 240]];
        SWIM_PACK.forEach(([id, label, art, w, hh], i) => { if (!st.s.packed.includes(id)) h += SX.at(spots[i][0], spots[i][1], w, hh, art(), { cls: 'sx-drag lf-swimit', id, label, z: 6 }); });
        if (st.s.tipText) h += SX.bubble(520, 120, st.s.tipText, { w: 260 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lf-swimit', '.lf-swimbag', (t, el) => {
          const id = el.dataset.id;
          if (!SWIM_NEED.includes(id)) { st.s.tipText = 'Teddy can wait at home. Teddy does not like water!'; st.s.tip = 'Pack the swimsuit, goggles and towel.'; SX.nope(null, st.s.tipText); SX.render(); return false; }
          st.s.packed.push(id); st.s.tipText = null; A.tone(640 + st.s.packed.length * 90, 0.1, 0.05);
          if (st.s.packed.length === 3) SX.done(st, 'Swimsuit, goggles, towel. Ready to swim!'); else SX.render();
          return true;
        }, { miss: () => SX.say('Put it in the bag.') });
      },
      guide: (st) => { const n = SWIM_NEED.find((id) => !st.s.packed.includes(id)) || 'swimsuit'; return { sel: `.lf-swimit[data-id="${n}"]`, to: '.lf-swimbag', say: 'Drag it into the bag.' }; }
    },
    {
      id: 'cubicle', bg: 'lfChanging',
      text: 'At the pool, Lumi changes into the swimsuit in the changing room.',
      task: (st) => (st.s.tip || 'Find a free cubicle. Look for the green sign.'),
      lumi: (st) => (st.done ? { x: 760, y: 540, h: 170, z: 2 } : { x: 300, y: 555, h: 200 }),
      draw(st) {
        let h = '';
        [false, true, false].forEach((free, i) => {
          const x = 480 + i * 200;
          h += SX.at(x, 90, 180, 340, `<div class="lf-cubicle ${free ? 'free' : ''} ${st.done && free ? 'shut' : ''}"><span>${free ? 'FREE' : 'IN USE'}</span></div>`, { k: st.done ? '' : 'cub', v: i, label: free ? 'Free cubicle' : 'Cubicle in use', z: 3 });
        });
        if (st.s.tipText) h += SX.bubble(420, 440, st.s.tipText, { w: 300 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'cub') return;
        if (d.v !== '1') { st.s.tipText = 'That one is in use. Someone is inside. Look for green.'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; SX.ok(); SX.done(st, 'A free cubicle. Lumi changes inside and locks the door.');
      },
      guide: () => ({ sel: '[data-k="cub"][data-v="1"]', say: 'Tap the green one.', tap: true })
    },
    {
      id: 'shower', bg: 'lfChanging',
      text: 'Before swimming, everyone has a quick shower.',
      task: (st) => (st.done ? '' : 'Tap the shower to turn it on.'),
      lumi: (st) => ({ x: 640, y: 545, h: 200, mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        let h = SX.at(560, 60, 160, 120, svg('0 0 160 120', `<path d="M10 20h90v30" fill="none" stroke="url(#lpMetal)" stroke-width="12" stroke-linecap="round"/>${vol('<path d="M60 50h80l-10 26H70z"/>', '#C9D1D9')}${st.done ? Array.from({ length: 7 }, (_, i) => `<path d="M${76 + i * 9} 84v30" stroke="#8EC5F2" stroke-width="4" stroke-linecap="round"/>`).join('') : ''}`), { k: st.done ? '' : 'shower', label: 'Shower', cls: st.done ? '' : 'lf-showerbtn', z: 6 });
        if (st.done) h += `<div class="lf-rain" style="left:560px;top:180px;width:170px;height:330px"></div>` + SX.bubble(760, 220, 'Brr! A bit cold!', { w: 170, tail: 'left' });
        return h;
      },
      tap(st, k) { if (k !== 'shower') return; A.tone(440, 0.3, 0.04); SX.done(st, 'Splash! A quick shower, and Lumi is ready.'); },
      guide: () => ({ sel: '.lf-showerbtn', say: 'Tap the shower.', tap: true })
    },
    SX.copeStep({
      id: 'big', bg: 'lfPool',
      text: 'The pool looks big, and the water feels cold on Lumi’s toes.',
      lumi: (st) => ({ x: 520, y: 320, h: 190, mood: st.done ? 'calm' : 'worried' }),
      draw: () => coach(800, 60) + SX.at(760, 34, 140, 40, '<span class="ot-tag">Coach Mei</span>', { z: 7 }),
      options: [{ label: 'Hold the rail', art: ic('hand', 56), reply: 'Lumi holds the rail. Steady.' }, { label: 'Ask the coach for help', art: SX.ART.ask, reply: 'Coach Mei says: "I am right here with you."' }, SX.BREATHE]
    }),
    {
      id: 'steps', bg: 'lfPool',
      text: 'Lumi goes into the water slowly, one step at a time.',
      task: (st) => (st.s.n < 3 ? `Tap step ${st.s.n + 1}.` : ''),
      lumi: (st) => (st.s.n > 0 ? { x: STEP_SPOTS[st.s.n - 1][0], y: STEP_SPOTS[st.s.n - 1][1], h: 170, mood: st.done ? 'excited' : 'happy' } : { x: 420, y: 320, h: 170 }),
      enter(st) { st.s.n = 0; },
      draw(st) {
        let h = coach(800, 60, { pose: st.done ? 'wave' : 'point' });
        if (st.s.n >= 3) h += water();
        if (!st.done) [0, 1, 2].forEach((i) => { h += SX.at(80 + i * 50, 300 + i * 50, 220, 46, `<span class="lf-stepnum">${i + 1}</span>`, { k: 'step', v: i, label: `Step ${i + 1}`, cls: `lf-step ${st.s.n === i ? 'next' : ''} ${st.s.n > i ? 'on' : ''}`, z: 4 + i }); });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'step') return;
        const i = Number(d.v);
        if (i !== st.s.n) { SX.nope(el, `Step ${st.s.n + 1} first. Slowly.`); return; }
        st.s.n += 1; A.tone(520 + st.s.n * 100, 0.12, 0.05);
        if (st.s.n === 3) SX.done(st, 'Lumi is in the water! One step at a time worked.'); else SX.render();
      },
      guide: (st) => ({ sel: `.lf-step[data-v="${st.s.n}"]`, say: `Tap step ${st.s.n + 1}.`, tap: true })
    },
    {
      id: 'kick', bg: 'lfPool',
      text: 'Coach Mei gives Lumi a float. "Hold on, and kick your feet!"',
      task: (st) => (st.s.k < 5 ? `Tap Kick! (${st.s.k} of 5)` : ''),
      lumi: (st) => ({ x: 260 + st.s.k * 110, y: 500, h: 160, mood: 'excited' }),
      enter(st) { st.s.k = 0; },
      draw(st) {
        let h = coach(980, 60, { pose: 'wave' }) + water();
        h += SX.at(170 + st.s.k * 110, 420, 180, 40, svg('0 0 180 40', vol('<rect x="4" y="4" width="172" height="32" rx="16"/>', '#F4C430')), { z: 7 });
        if (st.s.k > 0) h += SX.at(100 + st.s.k * 110, 430, 120, 60, '<div class="lf-splash"></div>', { z: 7 });
        if (!st.done) h += SX.at(870, 340, 200, 100, `<span class="lf-btn">${ic('jump', 40)}<span>Kick!</span></span>`, { k: 'kick', label: 'Kick', z: 8 });
        return h;
      },
      tap(st, k) {
        if (k !== 'kick') return;
        st.s.k += 1; A.tone(380 + st.s.k * 60, 0.1, 0.05);
        if (st.s.k >= 5) SX.done(st, 'Kick, kick, kick! Lumi swam across with the float!'); else SX.render();
      },
      guide: () => ({ sel: '[data-k="kick"]', say: 'Tap Kick!', tap: true })
    },
    {
      id: 'dry', bg: 'lfChanging',
      text: 'The lesson is over. Coach Mei says: "Great swimming today!" Time to dry off.',
      task: 'Drag the towel onto Lumi.',
      lumi: (st) => ({ x: 560, y: 545, h: 200, mood: st.done ? 'excited' : 'happy', cls: st.done ? 'lf-towelled' : '' }),
      draw(st) {
        let h = SX.at(460, 280, 200, 260, '', { target: true, id: 'lumi', z: 4 });
        if (!st.done) h += SX.at(860, 360, 120, 80, towel(), { cls: 'sx-drag lf-towel', label: 'Towel', z: 8 });
        else h += SX.at(470, 430, 180, 110, towel(), { z: 6 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lf-towel', '[data-id="lumi"]', () => { SX.done(st, 'Warm and dry! Lumi had a great swimming lesson.'); return true; }, { pad: 30, miss: () => SX.say('Bring the towel to Lumi.') });
      },
      guide: () => ({ sel: '.lf-towel', to: '[data-id="lumi"]', say: 'Drag the towel onto Lumi.' })
    }
  ];
  SX.story({ id: 'swim', title: 'Swimming lesson', tint: '#D6EEF5', ages: ['little', 'primary'], steps: swimSteps });

  // ================================================================ IF I GET LOST
  const shopFront = (x, name, colour, inner) => `${vol(`<rect x="${x}" y="80" width="300" height="320" rx="10"/>`, '#FFFFFF', { lineOpacity: 0.3 })}${vol(`<rect x="${x - 10}" y="60" width="320" height="56" rx="10"/>`, colour, { shade: 'v' })}${txt(x + 150, 98, name, 26, '#fff', { ls: 2 })}
    <rect x="${x + 20}" y="130" width="260" height="250" rx="6" fill="url(#lpSky)" opacity=".55"/>${inner || ''}<rect x="${x + 20}" y="130" width="260" height="250" rx="6" fill="url(#lpGlass)"/>`;
  const toys = (x) => `${vol(`<rect x="${x + 50}" y="300" width="70" height="70" rx="8"/>`, '#E5534B')}${vol(`<circle cx="${x + 200}" cy="330" r="38"/>`, '#5B8FD9')}${vol(`<path d="M${x + 120} 250 l40 -60 l40 60z"/>`, '#F4C430')}`;
  SX.bg.lfMall = () => `${wall('#F5EFE6', 420)}${tiles(420, '#E8E2D8', '#D2C9BA')}${lights(12, 5)}
    ${shopFront(30, 'TOY TOWN', '#E5534B', toys(30))}${shopFront(410, 'BOOKS', '#5B8FD9')}${shopFront(790, 'SHOES', '#7FB069')}`;
  const helperCard = () => `<div class="lf-idcard">${ic('kHeart', 26)}<b>If I am lost</b><span>Please call my Dad</span><i>${ic('text', 22)} 9123 4567</i></div>`;
  const lostSteps = [
    {
      id: 'toys', bg: 'lfMall',
      text: 'Lumi and Dad are at the mall. Lumi sees toys in a shop window.',
      task: (st) => (st.done ? '' : 'Tap the toy shop window to look.'),
      lumi: (st) => ({ x: 360, y: 555, h: 200, mood: st.done ? 'worried' : 'excited' }),
      draw(st) {
        let h = st.done ? '' : person(860, 260, 260, { who: 'dad', flip: true, item: 'bag', pose: 'give' }, 4);
        if (!st.done) h += SX.at(50, 130, 260, 250, '', { k: 'toys', label: 'Toy shop window', cls: 'lf-winbtn', z: 6 });
        if (st.done) h += SX.bubble(420, 230, 'Dad? Where is Dad?', { w: 200, tail: 'left' });
        return h;
      },
      tap(st, k) { if (k !== 'toys') return; SX.ok(); SX.done(st, 'Ooh, toys! But when Lumi turns around... Dad is not there.'); },
      guide: () => ({ sel: '[data-k="toys"]', say: 'Tap the toy window.', tap: true })
    },
    {
      id: 'stay', bg: 'lfMall',
      text: 'Lumi cannot see Dad anywhere. Lumi is lost.',
      task: (st) => (st.done ? '' : 'What should Lumi do first?'),
      lumi: (st) => ({ x: 360, y: 555, h: 200, mood: st.done ? 'calm' : 'scared' }),
      draw(st) {
        let h = '';
        if (!st.done) h += SX.choices([{ label: 'Stay where I am', art: ic('stop', 56) }, { label: 'Run to look for Dad', art: ic('go', 56) }, { label: 'Go outside', art: ic('exit', 56) }], 'first', { style: 'right:24px;top:24px;', cls: 'col' });
        if (st.s.tipText) h += SX.bubble(420, 200, st.s.tipText, { w: 290, tail: 'left' });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'first') return;
        if (d.v !== '0') { st.s.tipText = d.v === '1' ? 'Running makes it harder for Dad to find Lumi. Stay where you are.' : 'Never go outside on your own. Stay inside, where Dad can find you.'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; SX.ok(); SX.done(st, 'Stay where you are. Then Dad can find Lumi.');
      },
      guide: () => ({ sel: '.sx-choice[data-v="0"]', say: 'Stay where you are.', tap: true })
    },
    SX.copeStep({
      id: 'scared', bg: 'lfMall',
      text: 'Lumi’s heart is beating fast. Feeling scared is OK.',
      lumi: (st) => ({ x: 360, y: 555, h: 200, mood: st.done ? 'calm' : 'scared' }),
      options: [SX.BREATHE, { label: 'Squeeze my hands', art: SX.ART.squeeze, reply: 'Squeeze and let go. Lumi’s body feels calmer.' }, { label: 'Say: I can do this', art: SX.ART.talk, reply: 'Lumi says quietly: "I can do this. I know what to do."' }]
    }),
    {
      id: 'helper', bg: 'lfMall',
      text: 'Now Lumi looks for a helper. The best helper is someone who works here.',
      task: (st) => (st.s.tip || 'Tap the person who works here. Look for a uniform and a name badge.'),
      lumi: { x: 200, y: 555, h: 190, mood: 'calm' },
      draw(st) {
        let h = '';
        h += SX.at(360, 250, 130, 290, P({ who: 'woman', h: 260, item: 'phone', pose: 'give', mood: 'talk' }), { k: 'who', v: 0, label: 'A shopper on the phone', cls: 'lf-who', z: 4 });
        h += SX.at(620, 250, 130, 290, P({ who: 'staff', h: 260, mood: 'smile' }), { k: 'who', v: 1, label: 'Someone who works at the mall, with a uniform and badge', cls: 'lf-who', z: 4 });
        h += SX.at(590, 430, 200, 110, svg('0 0 200 110', `${vol('<rect x="4" y="10" width="192" height="96" rx="12"/>', '#2F7E79', { shade: 'v' })}${txt(100, 70, 'i  INFO', 34, '#fff', { ls: 2 })}`), { z: 5 });
        h += SX.at(880, 250, 130, 290, P({ who: 'boy', h: 240, mood: 'happy', flip: true }), { k: 'who', v: 2, label: 'A boy playing', cls: 'lf-who', z: 4 });
        if (st.s.tipText) h += SX.bubble(380, 150, st.s.tipText, { w: 320 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'who') return;
        if (d.v !== '1') { st.s.tipText = d.v === '0' ? 'She is shopping, not working here. Look for a uniform and badge.' : 'He is a child too. Look for a grown-up who works here.'; SX.nope(el, st.s.tipText); SX.render(); return; }
        st.s.tipText = null; SX.ok(); SX.done(st, 'Yes! She works at the information counter. She can help.');
      },
      guide: () => ({ sel: '.lf-who[data-v="1"]', say: 'Tap the person with the uniform.', tap: true })
    },
    {
      id: 'card', bg: 'lfMall',
      text: 'Lumi has a card in the bag for times like this. It has Dad’s phone number.',
      task: (st) => (st.done ? '' : 'Drag the card to the helper.'),
      lumi: { x: 330, y: 555, h: 200, mood: 'calm' },
      draw(st) {
        let h = SX.at(620, 250, 130, 290, P({ who: 'staff', h: 260, mood: st.done ? 'talk' : 'smile', item: st.done ? 'phone' : '', pose: st.done ? 'give' : 'stand' }), { target: true, id: 'staff', z: 4, label: 'The helper' });
        h += SX.at(590, 430, 200, 110, svg('0 0 200 110', `${vol('<rect x="4" y="10" width="192" height="96" rx="12"/>', '#2F7E79', { shade: 'v' })}${txt(100, 70, 'i  INFO', 34, '#fff', { ls: 2 })}`), { z: 5 });
        if (!st.done) h += SX.at(80, 200, 220, 140, helperCard(), { cls: 'sx-drag lf-help', label: 'Card: If I am lost, please call my Dad', z: 8 });
        else h += SX.bubble(780, 170, 'Hello, is this Lumi’s Dad? Lumi is at the info counter.', { w: 290, tail: 'left' });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lf-help', '[data-id="staff"]', () => { A.tone(880, 0.15, 0.05); SX.done(st, 'The helper reads the card and calls Dad.'); return true; }, { pad: 30, miss: () => SX.say('Show the card to the helper.') });
      },
      guide: () => ({ sel: '.lf-help', to: '[data-id="staff"]', say: 'Drag the card to the helper.' })
    },
    {
      id: 'found', bg: 'lfMall',
      text: 'Here comes Dad! "I am so glad you stayed and asked for help."',
      task: (st) => (st.done ? '' : 'Tap Dad to give him a big hug.'),
      lumi: (st) => ({ x: st.done ? 560 : 330, y: 555, h: 200, mood: 'excited' }),
      draw(st) {
        let h = SX.at(620, 250, 130, 290, P({ who: 'staff', h: 260, mood: 'smile', pose: 'wave' }), { z: 3 });
        h += SX.at(st.done ? 640 : 880, 250, 140, 290, P({ who: 'dad', h: 280, flip: true, pose: 'wave', mood: 'happy' }), { k: st.done ? '' : 'dad', label: 'Dad', cls: st.done ? '' : 'lf-who', z: 5 });
        if (st.done) h += `<div class="lf-hearts" style="left:520px;top:200px"></div>`;
        return h;
      },
      tap(st, k) { if (k !== 'dad') return; A.tone(988, 0.2, 0.06); SX.done(st, 'Hug! Lumi stayed put, found a helper and showed the card. Lumi knows what to do.'); },
      guide: () => ({ sel: '[data-k="dad"]', say: 'Tap Dad.', tap: true })
    }
  ];
  SX.story({ id: 'lost', title: 'If I get lost', tint: '#FBE3D6', steps: lostSteps });
})();
