/*
  story-hawker.js
  Lunch at the hawker centre: a real-life practice story.
  1 It's busy and noisy: choose what helps (headphones really go on).
  2 Chope a table: drag the tissue packet onto a free table of your choice.
  3 Pick a stall: chicken rice, noodles or drinks.
  4 Join the queue and step forward when the line moves.
  5 Order from the menu (one dish may be sold out), then say it with the talk card.
  6 Pay: cash, card or phone, guided.
  7 Carry the tray to your choped table.
  8 Eat, and take your tissue packet back.
  9 Return the tray to the tray return.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { esc } = A;
  const W = SX.W;
  const H = SX.H;
  const P = (o) => A.person(o);

  // ---------------------------------------------------------------- the stalls and their menus
  const STALLS = [
    { id: 'chicken', name: 'Chicken rice', sign: 'CHICKEN RICE', cn: '鸡饭', colour: '#E07A5F', who: 'aunty', hello: 'Hello! What would you like?',
      menu: [{ id: 'chickenrice', name: 'Chicken rice', price: 4.5, art: ['rice', 'chicken'] }, { id: 'roast', name: 'Roast chicken', price: 5, art: ['chicken'], out: true },
        { id: 'eggrice', name: 'Rice and egg', price: 3.5, art: ['rice', 'egg'] }, { id: 'veg', name: 'Vegetables', price: 3, art: ['veg'] }] },
    { id: 'noodles', name: 'Noodles', sign: 'NOODLES', cn: '面', colour: '#4A78A8', who: 'uncle', hello: 'Hi! What do you want?', ask: ['Soup', 'Dry'],
      menu: [{ id: 'fishball', name: 'Fishball noodles', price: 4, art: ['noodles'] }, { id: 'wanton', name: 'Wanton noodles', price: 4.5, art: ['noodles'], out: true },
        { id: 'soupnoodle', name: 'Noodle soup', price: 4, art: ['soup'] }, { id: 'fish', name: 'Fish and rice', price: 5.5, art: ['rice', 'fish'] }] },
    { id: 'drinks', name: 'Drinks', sign: 'DRINKS', cn: '饮料', colour: '#7FB069', who: 'man', hello: 'Hello! Which drink?',
      menu: [{ id: 'water', name: 'Water', price: 1, art: ['glass'] }, { id: 'milk', name: 'Milk', price: 1.8, art: ['milk'] },
        { id: 'teh', name: 'Teh', price: 1.6, art: ['glass'], out: true }, { id: 'soup2', name: 'Barley drink', price: 1.8, art: ['glass'] }] }
  ];
  const stallOf = (st) => STALLS.find((s) => s.id === st.data.stall) || STALLS[0];
  const dishOf = (st) => stallOf(st).menu.find((m) => m.id === st.data.dish) || stallOf(st).menu[0];
  // a drawing placed inside another SVG at x, y
  const nest = (svg, x, y) => svg.replace('<svg ', `<svg x="${x}" y="${y}" `);
  const food = (id, x, y, w, h) => nest(A.foodSvg(id, w, h), x, y);
  const tissue = (x, y, w) => nest(window.lumiPic('tissuepack', w), x, y);
  const dishArt = (d, w, h) => `<div class="hk-dish">${d.art.map((a) => `<span>${SX.prop.food(a, w || 84, h || 68)}</span>`).join('')}</div>`;

  // ---------------------------------------------------------------- drawing the hawker centre
  const floor = (top) => {
    let tiles = '';
    for (let r = 0; r < 8; r++) {
      const y = top + r * ((H - top) / 8);
      tiles += `<path d="M0 ${y.toFixed(0)}H${W}" stroke="#C9B9A2" stroke-width="2" opacity="${0.35 + r * 0.05}"/>`;
    }
    for (let c = -6; c <= 16; c++) tiles += `<path d="M${W / 2 + c * 40} ${top}L${W / 2 + c * 140} ${H}" stroke="#C9B9A2" stroke-width="2" opacity=".35"/>`;
    return `<rect y="${top}" width="${W}" height="${H - top}" fill="#E7D9C3"/>${tiles}<rect y="${top}" width="${W}" height="${H - top}" fill="url(#lpFloorFade)"/>`;
  };
  function stallSvg(s, x, y, w, h, o) {
    const op = o || {};
    const sh = Math.round(h * 0.2);
    let inside = '';
    if (s.id === 'chicken') inside = [0, 1, 2].map((i) => `<path d="M${x + w * (0.22 + i * 0.2)} ${y + sh + 14}v${h * 0.12}" stroke="#9AA6B2" stroke-width="3"/>${vol(`<ellipse cx="${x + w * (0.22 + i * 0.2)}" cy="${y + sh + 14 + h * 0.2}" rx="${w * 0.06}" ry="${h * 0.08}"/>`, '#E8A15A')}`).join('');
    if (s.id === 'noodles') inside = `${vol(`<rect x="${x + w * 0.16}" y="${y + sh + h * 0.12}" width="${w * 0.24}" height="${h * 0.2}" rx="6"/>`, '#C9D1D9')}${[0, 1, 2].map((i) => `<path d="M${x + w * (0.2 + i * 0.07)} ${y + sh + h * 0.1} q-8 -14 0 -26 q8 -12 0 -24" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>`).join('')}${vol(`<rect x="${x + w * 0.55}" y="${y + sh + h * 0.16}" width="${w * 0.28}" height="${h * 0.16}" rx="6"/>`, '#F6E2B8')}`;
    if (s.id === 'drinks') inside = [0, 1, 2].map((i) => `${vol(`<rect x="${x + w * (0.16 + i * 0.24)}" y="${y + sh + h * 0.1}" width="${w * 0.16}" height="${h * 0.24}" rx="8"/>`, ['#F4A259', '#B48A6A', '#E5D7A8'][i])}<rect x="${x + w * (0.16 + i * 0.24)}" y="${y + sh + h * 0.1}" width="${w * 0.16}" height="${h * 0.24}" rx="8" fill="url(#lpGlass)"/>`).join('');
    return `<g>${vol(`<rect x="${x}" y="${y + sh}" width="${w}" height="${h - sh}" rx="10"/>`, '#FFF8EC', { shade: 'v' })}
      ${vol(`<rect x="${x - 6}" y="${y}" width="${w + 12}" height="${sh}" rx="10"/>`, s.colour, { shade: 'v' })}
      <text x="${x + w / 2}" y="${y + sh * 0.7}" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${Math.round(sh * 0.48)}" fill="#fff" letter-spacing="1">${s.sign}  ${s.cn}</text>
      ${inside}
      ${op.noCounter ? '' : stallFront(s, x - 4, y + h * 0.62, w + 8, h * 0.38)}
      ${op.number ? `<text x="${x + w * 0.85}" y="${y + h * 0.9}" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${Math.round(h * 0.09)}" fill="${s.colour}">#0${op.number}</text>` : ''}</g>`;
  }
  // the front of a stall's counter (drawn over the stall owner, who stands behind it)
  const stallFront = (s, x, y, w, h) => `${vol(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`, '#F2F4F6', { shade: 'v' })}<rect x="${x}" y="${y}" width="${w}" height="${h * 0.16}" fill="${s.colour}" opacity=".85"/>`;
  const front = (s, x, y, w, h) => SX.at(x, y, w, h, `<svg viewBox="${x} ${y} ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">${stallFront(s, x, y, w, h)}</svg>`, { z: 2, cls: 'hk-front' });
  const ceiling = () => `<rect width="${W}" height="${H}" fill="#FBEFD9"/><rect width="${W}" height="44" fill="#E3CBA6"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 280 - 10}" y="0" width="22" height="${H}" fill="#EEDCC0"/>`).join('')}
    ${[200, 560, 920].map((x) => `<g transform="translate(${x - 60} 30)"><path d="M60 0v20" stroke="#9AA6B2" stroke-width="4"/>${vol('<ellipse cx="60" cy="24" rx="10" ry="6"/>', '#C9D1D9')}${vol('<path d="M60 24 L8 30 q-4 -6 4 -10z M60 24 L112 30 q4 -6 -4 -10z"/>', '#E3E8ED', { lineOpacity: 0.3 })}</g>`).join('')}`;
  // the hall seen from the tables: small stalls at the back
  SX.bg.hawkerHall = () => `${ceiling()}${STALLS.map((s, i) => stallSvg(s, 70 + i * 345, 70, 290, 150)).join('')}${floor(220)}
    ${[150, 480, 820].map((x) => `<g opacity=".55">${LP.drop(x, 238, 40, 6)}</g>`).join('')}`;
  // the stalls up close
  SX.bg.hawkerStalls = () => `${ceiling()}${STALLS.map((s, i) => stallSvg(s, 40 + i * 360, 70, 320, 300, { number: i + 1, noCounter: true })).join('')}${floor(370)}`;
  // one stall's counter, for ordering and paying
  SX.bg.hawkerCounter = (st) => {
    const s = stallOf(st);
    return `${ceiling()}${vol(`<rect x="40" y="56" width="${W - 80}" height="84" rx="16"/>`, s.colour, { shade: 'v' })}
      <text x="${W / 2}" y="114" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="46" fill="#fff" letter-spacing="2">${s.sign}  ${s.cn}</text>
      <rect x="40" y="140" width="${W - 80}" height="250" fill="#FFF8EC"/><rect x="40" y="140" width="${W - 80}" height="250" fill="url(#lpShadeV)" opacity=".4"/>
      ${floor(470)}`;
  };
  // a table up close, for eating
  SX.bg.hawkerTableClose = () => `${ceiling()}${STALLS.map((s, i) => `<g opacity=".55">${stallSvg(s, 70 + i * 345, 70, 290, 150)}</g>`).join('')}${floor(220)}
    <ellipse cx="${W / 2 + 60}" cy="${H - 40}" rx="520" ry="150" fill="url(#lpDrop)"/>
    ${vol(`<ellipse cx="${W / 2 + 60}" cy="${H - 60}" rx="500" ry="140"/>`, '#F2F4F6')}<ellipse cx="${W / 2 + 60}" cy="${H - 60}" rx="500" ry="140" fill="url(#lpMarble)" opacity=".7"/>`;
  // the tray return station
  SX.bg.hawkerTrayReturn = () => `${ceiling()}${floor(300)}
    ${vol('<rect x="600" y="70" width="420" height="380" rx="20"/>', '#5B8F6A', { shade: 'v' })}<rect x="620" y="90" width="380" height="64" rx="12" fill="#fff"/>
    <text x="810" y="134" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="34" fill="#3F7A4E">TRAY RETURN</text>
    ${[0, 1, 2, 3].map((r) => `<rect x="630" y="${180 + r * 62}" width="360" height="12" rx="5" fill="#2F5A3A"/>${r < 2 ? `<path d="M650 ${176 + r * 62}h320l-8 -18H658z" fill="#8EB8DC" opacity=".9"/>` : ''}`).join('')}
    ${STALLS.map((s, i) => `<g opacity=".5">${stallSvg(s, 30 + i * 180, 90, 160, 120)}</g>`).join('')}`;

  // ---------------------------------------------------------------- the tables in the hall
  // 'busy' = someone is eating there; 'choped' = someone else's tissue packet is already on it
  const TABLES = [
    { id: 't1', x: 250, y: 236, busy: true },
    { id: 't2', x: 640, y: 236 },
    { id: 't3', x: 380, y: 372 },
    { id: 't4', x: 790, y: 372, choped: true }
  ];
  const SLOT = [440, 660, 880]; // places in the queue, nearest the counter first
  const TW = 236;
  const TH = 154;
  function tableHtml(t, st, o) {
    const op = o || {};
    const mine = st.data.table === t.id;
    let on = '';
    if (t.choped) on += tissue(150, 22, 64);
    if (mine && !op.noTissue) on += tissue(98, 20, 64);
    if (t.busy) on += food('noodles', 64, 24, 70, 56);
    const sitter = t.busy ? SX.at(t.x + 70, t.y - 96, 100, 200, P({ who: 'grandpa', pose: 'sit', h: 200, mood: 'smile' }), { z: 1 }) : '';
    const table = SX.at(t.x, t.y, TW, TH, SX.prop.hawkerTable({ inner: on }), { target: !!op.target, id: t.id, cls: `hk-table ${mine ? 'mine' : ''}`, z: 2, label: op.target ? `Table${t.busy ? ', someone is eating here' : t.choped ? ', choped already' : ''}` : '' });
    return sitter + table;
  }
  // a few people around the hall
  const crowd = () => SX.at(40, 150, 90, 180, P({ who: 'woman', h: 180, item: 'tray', pose: 'hold' })) + SX.at(970, 140, 90, 180, P({ who: 'man', h: 180, flip: true })) + SX.at(1040, 190, 80, 160, P({ who: 'boy', h: 160, flip: true, pose: 'wave' }));

  // ---------------------------------------------------------------- the steps
  const steps = [
    SX.copeStep({
      id: 'arrive', bg: 'hawkerHall',
      text: 'Today Lumi is having lunch at the hawker centre. It is busy and noisy. Plates clink and people talk loudly.',
      lumi: (st) => ({ x: 200, y: 548, h: 230, mood: st.done ? 'happy' : 'worried' }),
      draw: (st) => crowd() + TABLES.map((t) => tableHtml(t, st)).join(''),
      options: [SX.HEADPHONES, { label: 'Find a quieter table', art: SX.ART.quiet, reply: 'Good idea. Tables at the side are often quieter.' }, SX.BREATHE]
    }),
    {
      id: 'chope', bg: 'hawkerHall',
      text: 'First, find a seat. In Singapore, people "chope" a table by leaving a tissue packet on it.',
      task: (st) => (st.s.tip ? st.s.tip : 'Drag the tissue packet onto a free table you like.'),
      lumi: { x: 150, y: 560, h: 210 },
      draw(st) {
        let h = crowd() + TABLES.map((t) => tableHtml(t, st, { target: !st.done })).join('');
        if (!st.done) h += SX.at(200, 440, 96, 96, SX.prop.tissuePack('100%'), { cls: 'sx-drag hk-tissue', label: 'Tissue packet', z: 8 });
        if (st.s.tipAt) h += SX.bubble(st.s.tipAt.x, st.s.tipAt.y, st.s.tipText, { w: 260, tail: 'down' });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.hk-tissue', '.hk-table', (t, el) => {
          const tb = TABLES.find((x) => x.id === t.dataset.id);
          if (tb.busy) { st.s.tipAt = { x: tb.x + 40, y: tb.y - 150 }; st.s.tipText = 'Someone is eating here. Try an empty table.'; st.s.tip = 'Someone is eating at that table. Choose an empty one.'; SX.nope(null, st.s.tipText); SX.render(); return false; }
          if (tb.choped) { st.s.tipAt = { x: tb.x + 20, y: tb.y - 80 }; st.s.tipText = 'See the tissue packet? Someone choped this table.'; st.s.tip = 'That table is already choped. Choose another one.'; SX.nope(null, st.s.tipText); SX.render(); return false; }
          st.data.table = tb.id;
          st.s.tipAt = null;
          SX.done(st, 'Table choped! The tissue packet saves it for Lumi.');
          return true;
        }, { miss: () => SX.say('Drop it on a table.') });
      },
      guide: () => ({ sel: '.hk-tissue', say: 'Drag the tissue packet onto an empty table.' })
    },
    {
      id: 'stall', bg: 'hawkerStalls',
      text: 'Now Lumi looks at the food stalls. There is chicken rice, noodles and drinks.',
      task: 'Which stall would Lumi like? Tap a stall.',
      lumi: (st) => ({ x: st.data.stall ? 200 + STALLS.findIndex((s) => s.id === st.data.stall) * 360 : 560, y: 560, h: 190 }),
      draw(st) {
        return STALLS.map((s, i) => SX.at(40 + i * 360, 70, 320, 300, '', { k: 'stall', v: s.id, label: `${s.name} stall`, cls: `hk-stall ${st.data.stall === s.id ? 'on' : ''}` })
          + SX.at(40 + i * 360 + 110, 150, 100, 200, P({ who: s.who, h: 200, pose: st.data.stall === s.id ? 'wave' : 'stand', item: s.id === 'noodles' ? 'ladle' : '' }), { z: 1, cls: 'hk-holder' })
          + front(s, 36 + i * 360, 256, 328, 114)).join('');
      },
      tap(st, k, el, d) {
        if (k !== 'stall') return;
        st.data.stall = d.v;
        const s = stallOf(st);
        SX.ok();
        SX.done(st, `${s.name}! Lumi walks to the ${s.name.toLowerCase()} stall.`);
      },
      guide: () => ({ sel: '.hk-stall', say: 'Tap the stall you like.' })
    },
    {
      id: 'queue', bg: 'hawkerCounter',
      text: (st) => `There is a queue at the ${stallOf(st).name.toLowerCase()} stall. Lumi waits for a turn.`,
      task: (st) => (st.s.gap ? 'The line moved! Tap Lumi to take a step forward.' : 'Wait for the line to move.'),
      lumi: (st) => ({ x: SLOT[st.s.lumi], y: 560, h: 200, mood: st.s.gap ? 'excited' : 'calm' }),
      enter(st) { st.s.ahead = 2; st.s.lumi = 2; st.s.gap = false; serveNext(st); },
      draw(st) {
        const s = stallOf(st);
        let h = SX.at(150, 150, 130, 260, P({ who: s.who, h: 260, pose: 'give', item: 'plate', mood: 'talk' }), { z: 1 }) + front(s, 20, 380, W - 40, 100);
        const who = ['woman', 'boy'];
        for (let i = 0; i < st.s.ahead; i++) h += SX.at(SLOT[i] - 58, 312, 116, 232, P({ who: who[i + (2 - st.s.ahead)], h: 232, flip: true }), { z: 3 });
        if (st.s.gap) h += SX.at(SLOT[st.s.lumi] - 100, 330, 200, 240, '', { k: 'step', label: 'Take a step forward', cls: 'hk-lumihit', z: 6 });
        else h += SX.bubble(SLOT[st.s.lumi] - 70, 250, 'Waiting... 1, 2, 3...', { w: 190 });
        if (st.s.gap) h += SX.at(SLOT[st.s.ahead] - 40, 520, 80, 40, '<div class="hk-steps"></div>', { z: 2 });
        return h;
      },
      tap(st, k) {
        if (k !== 'step' || !st.s.gap) return;
        st.s.gap = false;
        st.s.lumi = st.s.ahead;
        SX.ok();
        if (st.s.ahead === 0) { SX.done(st, "It's Lumi's turn! Waiting can be hard. Lumi did it."); return; }
        SX.render();
        SX.say('Good. Now wait again.');
        serveNext(st);
      },
      guide: (st) => (st.s.gap ? { sel: '.hk-lumihit', say: 'Tap Lumi to step forward.' } : null)
    },
    {
      id: 'order', bg: 'hawkerCounter',
      text: (st) => (st.data.dish ? `Lumi orders: one ${dishOf(st).name.toLowerCase()}.` : `${stallOf(st).hello} Look at the menu.`),
      task: (st) => (!st.data.dish ? 'Tap the food Lumi wants.' : st.s.ask && !st.data.style ? `Soup or dry? Tap one.` : !st.s.said ? 'Tap the talk card to order.' : ''),
      lumi: { x: 990, y: 560, h: 200, flip: true },
      enter(st) { st.data.dish = null; st.data.style = null; st.s.said = false; },
      draw(st) {
        const s = stallOf(st);
        let h = SX.at(140, 150, 130, 260, P({ who: s.who, h: 260, pose: st.s.said ? 'give' : 'stand', mood: 'talk' }), { z: 1 }) + front(s, 20, 380, W - 40, 100);
        // the menu board
        h += `<div class="hk-menu" style="left:330px;top:150px"><b class="hk-menu-title">Menu</b>${s.menu.map((m) => `<button class="hk-item ${st.data.dish === m.id ? 'on' : ''} ${m.out ? 'out' : ''}" data-a="sx" data-k="dish" data-v="${m.id}" aria-label="${esc(m.name)}, ${SX.money(m.price)}${m.out ? ', sold out' : ''}">${dishArt(m, 70, 56)}<span class="hk-name">${esc(m.name)}</span><span class="hk-price">${SX.money(m.price)}</span>${m.out ? '<span class="hk-out">SOLD OUT</span>' : ''}</button>`).join('')}</div>`;
        if (st.s.sorry) h += SX.bubble(170, 70, 'Sorry, that one is sold out today. Choose another one.', { w: 300 });
        const d = st.data.dish && dishOf(st);
        if (d && s.ask && !st.data.style) h += SX.choices(s.ask.map((a) => ({ label: a, art: SX.prop.food(a === 'Soup' ? 'soup' : 'noodles', 70, 56) })), 'style', { style: 'left:330px;bottom:24px;' });
        if (d && (!s.ask || st.data.style)) {
          const words = [{ t: 'One', art: '' }, { t: d.name + (st.data.style ? ` (${st.data.style.toLowerCase()})` : ''), art: SX.prop.food(d.art[d.art.length - 1], 52, 42) }, { t: 'please', art: '' }];
          h += SX.talkCard(words, 'say', { said: st.s.said, style: 'left:330px;bottom:20px;' });
        }
        if (st.s.said) h += SX.bubble(170, 70, `OK! ${SX.money(d.price)}, please.`, { w: 220 });
        return h;
      },
      tap(st, k, el, d) {
        const s = stallOf(st);
        if (k === 'dish') {
          const m = s.menu.find((x) => x.id === d.v);
          if (m.out) { st.s.sorry = true; SX.nope(el, 'Sorry, that one is sold out today. Choose another one.'); SX.render(); return; }
          st.s.sorry = false;
          st.data.dish = m.id;
          st.data.price = m.price;
          st.s.ask = !!s.ask;
          SX.ok();
          SX.render();
          SX.say(s.ask ? `${m.name}. The uncle asks: soup or dry?` : `${m.name}. Now tap the talk card to order.`);
          return;
        }
        if (k === 'style') { st.data.style = s.ask[Number(d.v)]; SX.ok(); SX.render(); SX.say(`${st.data.style}. Now tap the talk card to order.`); return; }
        if (k === 'say') {
          const m = dishOf(st);
          st.s.said = true;
          SX.say(`One ${m.name.toLowerCase()}${st.data.style ? ', ' + st.data.style.toLowerCase() : ''}, please.`);
          SX.later(st, () => SX.done(st, `Lumi ordered! The ${s.who === 'uncle' ? 'uncle' : s.who === 'aunty' ? 'aunty' : 'stall owner'} says: ${SX.money(m.price)}, please.`), 1600);
          SX.render();
        }
      },
      guide: (st) => (!st.data.dish ? { sel: '.hk-item:not(.out)', say: 'Tap the food you want.' } : st.s.ask && !st.data.style ? { sel: '.sx-choice', say: 'Soup or dry?' } : !st.s.said ? { sel: '.sx-talk', say: 'Tap the talk card.' } : null)
    },
    SX.payStep({
      id: 'pay', bg: 'hawkerCounter',
      price: (st) => dishOf(st).price,
      lumi: { x: 680, y: 560, h: 190, flip: true },
      counter: { x: 300, y: 330, w: 260, h: 120 },
      draw: (st) => SX.at(140, 150, 130, 260, P({ who: stallOf(st).who, h: 260, pose: 'give', item: st.done ? '' : 'plate', mood: 'smile' }), { z: 1 }) + front(stallOf(st), 20, 380, W - 40, 100),
      doneText: 'Lumi paid. Lumi says "Thank you!"'
    }),
    {
      id: 'carry', bg: 'hawkerHall',
      text: (st) => `The ${dishOf(st).name.toLowerCase()} is ready on a tray. Carry it carefully to Lumi's table.`,
      task: (st) => (st.s.tip || 'Drag the tray to the table with Lumi\'s tissue packet.'),
      lumi: (st) => { const t = TABLES.find((x) => x.id === st.data.table) || TABLES[1]; return st.done ? { x: t.x + TW + 40, y: t.y + 150, h: 180, z: 3 } : { x: 130, y: 560, h: 200 }; },
      draw(st) {
        let h = crowd() + TABLES.map((t) => tableHtml(t, st, { target: !st.done })).join('');
        const tb = TABLES.find((t) => t.id === st.data.table);
        if (!st.done) h += SX.at(170, 450, 200, 110, SX.prop.tray(trayFood(st)), { cls: 'sx-drag hk-tray', label: 'Tray with food', z: 8 });
        else h += SX.at(tb.x + 30, tb.y - 30, 180, 100, SX.prop.tray(trayFood(st)), { z: 4 });
        if (st.s.tipAt) h += SX.bubble(st.s.tipAt.x, st.s.tipAt.y, 'This is not Lumi\'s table.', { w: 230 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.hk-tray', '.hk-table', (t) => {
          if (t.dataset.id !== st.data.table) { const tb = TABLES.find((x) => x.id === t.dataset.id); st.s.tipAt = { x: tb.x + 10, y: tb.y - 70 }; st.s.tip = 'Look for Lumi\'s tissue packet.'; SX.nope(null, 'That is not Lumi\'s table. Look for the tissue packet.'); SX.render(); return false; }
          st.s.tipAt = null;
          SX.done(st, 'Lumi found the table. Careful carrying!');
          return true;
        }, { miss: () => SX.say('Put the tray on Lumi\'s table.') });
      },
      guide: () => ({ sel: '.hk-tray', say: 'Drag the tray to Lumi\'s table.' })
    },
    {
      id: 'eat', bg: 'hawkerTableClose',
      text: 'Lumi sits down to eat. Yum!',
      task: (st) => (st.s.bites < 3 ? 'Tap the food to help Lumi eat.' : !st.s.tissue ? 'Take the tissue packet back. Tap it.' : ''),
      lumi: (st) => ({ x: 560, y: 420, h: 230, z: 3, mood: st.s.bites > 0 ? 'happy' : 'excited' }),
      enter(st) { st.s.bites = 0; st.s.tissue = false; },
      draw(st) {
        const d = dishOf(st);
        const left = Math.max(0, 3 - st.s.bites);
        let h = SX.at(380, 330, 360, 190, SX.prop.tray(''), { z: 4 });
        h += `<button class="hk-plate sx-el" data-a="sx" data-k="bite" style="left:430px;top:300px;width:260px;height:180px;z-index:5" aria-label="Eat a bite">${left ? `<div class="hk-food-left" style="opacity:${0.35 + left * 0.22};transform:scale(${0.7 + left * 0.1})">${dishArt(d, 120, 96)}</div>` : `<div class="hk-food-left"><svg viewBox="0 0 120 60" width="150" height="75" aria-hidden="true">${LP.drop(60, 50, 54, 8)}${vol('<ellipse cx="60" cy="32" rx="54" ry="20"/>', '#FFFFFF')}<ellipse cx="60" cy="30" rx="38" ry="11" fill="#EEF0F2"/></svg></div>`}</button>`;
        if (!st.s.tissue) h += SX.at(800, 420, 90, 90, SX.prop.tissuePack('100%'), { k: 'tissue', label: 'Tissue packet', z: 5, cls: st.s.bites >= 3 ? 'sx-glow' : '' });
        if (st.s.bites > 0 && st.s.bites < 3) h += SX.bubble(640, 150, ['Yum!', 'Mmm, tasty!'][st.s.bites - 1], { w: 140, tail: 'left' });
        return h;
      },
      tap(st, k, el) {
        if (k === 'bite') {
          if (st.s.bites >= 3) return;
          st.s.bites += 1;
          A.tone(520 + st.s.bites * 80, 0.12, 0.05);
          SX.render();
          SX.say(st.s.bites < 3 ? ['Yum!', 'Mmm, tasty!'][st.s.bites - 1] : 'All finished! Now take the tissue packet back.');
          return;
        }
        if (k === 'tissue') {
          if (st.s.bites < 3) { SX.nope(el, 'Finish eating first.'); return; }
          st.s.tissue = true;
          SX.done(st, 'Lumi ate everything and took the tissue packet back.');
        }
      },
      guide: (st) => (st.s.bites < 3 ? { sel: '.hk-plate', say: 'Tap the food.' } : { sel: '[data-k="tissue"]', say: 'Tap the tissue packet.' })
    },
    {
      id: 'return', bg: 'hawkerTrayReturn',
      text: 'After eating, we return the tray to the tray return. It keeps the tables clean for the next person.',
      task: 'Drag the tray to the tray return.',
      lumi: (st) => (st.done ? { x: 560, y: 560, h: 200 } : { x: 210, y: 560, h: 200 }),
      draw(st) {
        let h = SX.at(620, 160, 380, 280, '', { target: true, id: 'station', cls: 'hk-station' });
        h += SX.at(1000, 240, 100, 200, P({ who: 'aunty', h: 200, pose: st.done ? 'wave' : 'stand', flip: true, top: '#8EC0DC', apron: '#3E5463' }), { z: 1 });
        if (!st.done) h += SX.at(260, 440, 200, 110, SX.prop.tray(food('rice', 66, 10, 90, 72)), { cls: 'sx-drag hk-tray', label: 'Empty tray', z: 8 });
        else { h += SX.at(650, 300, 320, 60, SX.prop.tray(''), { z: 2 }); h += SX.bubble(800, 120, 'Thank you for returning your tray!', { w: 260 }); }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.hk-tray', '.hk-station', () => { SX.done(st, 'Lumi returned the tray. The cleaner aunty says thank you!'); return true; }, { miss: () => SX.say('Bring the tray to the green tray return.') });
      },
      guide: () => ({ sel: '.hk-tray', say: 'Drag the tray to the tray return.' })
    }
  ];
  function trayFood(st) {
    const d = dishOf(st);
    return d.art.map((a, i) => food(a, d.art.length > 1 ? 24 + i * 88 : 62, 4, 96, 76)).join('');
  }
  // the people ahead are served one by one; when one leaves, there is a gap to step into
  function serveNext(st) {
    SX.later(st, () => {
      if (st.s.ahead <= 0) return;
      st.s.ahead -= 1;
      st.s.gap = true;
      A.tone(700, 0.12, 0.05);
      SX.render();
      SX.say('The line moved! Tap Lumi to step forward.');
    }, 2600);
  }

  SX.story({ id: 'hawkerstory', title: 'Lunch at the hawker centre', tint: '#FFE3C2', steps });
})();
