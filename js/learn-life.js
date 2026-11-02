/*
  learn-life.js
  Learn with Lumi: three everyday-life lessons played as real scenes (engine: stories.js, SX.lessonWithLevels).
  Same pattern as learn-teeth.js: Lumi shows each step first, "Show me" shows it again, "Do it with me" helps.

  - 'canteen'  (primary) Buy food at the school canteen at recess: wash hands (or skip), join the queue
               behind a friend, wait calmly as the line moves, choose from the picture menu, say it with the
               talk card or point, pay ($1.20 to $1.80, cash, card or phone), say thank you (Medium+),
               carry the tray to an empty seat, eat, return the tray (Medium+).
  - 'sandwich' (teen) Make a sandwich in an HDB kitchen: wash hands, two slices onto the plate, choose a
               filling (kaya, peanut butter, jam), spread it with the knife, put the top slice on, cut it in
               half along the line (fingers away from the blade), knife in the sink and wipe the counter
               (Medium+), jar back on the shelf (Challenge), enjoy.
  - 'laundry'  (teen) Do the laundry in the HDB service yard: sort lights and darks (a wrong basket gently
               bounces back with a hint), check the pockets (Challenge), load the lights, one cap of
               detergent (press and hold to the line, then into the drawer), close the door, Normal and
               Start, "45 minutes later...", open the door when it beeps, hang the clothes on the rack,
               dry and fresh (Medium+).

  Shared pieces added: SX.HOME.lifeSinkClose (washing hands up close), SX.HOME.lifeWindow (an HDB window),
  SX.prop.lifeCloth / lifeBasket / lifeSlice / lifeKnife / lifeJar (new keys only).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { esc, ic, tone } = A;
  const W = SX.W;
  const H = SX.H;
  const HOME = (SX.HOME = SX.HOME || {});
  const P = (o) => A.person(o);
  const svg = (vb, inner, par) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" preserveAspectRatio="${par || 'xMidYMid meet'}" aria-hidden="true">${inner}</svg>`;
  const T = (x, y, t, size, fill, o) => `<text x="${x}" y="${y}" text-anchor="${(o && o.anchor) || 'middle'}" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${size}" fill="${fill}"${o && o.ls ? ` letter-spacing="${o.ls}"` : ''}>${esc(t)}</text>`;
  // an svg with a fixed size (food art) placed inside another svg
  const at = (s, x, y) => s.replace('<svg ', `<svg x="${x}" y="${y}" `);
  const food = (id, w, h) => A.foodSvg(id, w, h);
  const bar = (x, y, w, f) => `<div class="ln-progress" style="left:${x}px;top:${y}px;width:${w}px"><i style="width:${Math.round(Math.min(1, f) * 100)}%"></i></div>`;
  const setBar = (box, f) => { const b = box.querySelector('.ln-progress i'); if (b) b.style.width = Math.round(Math.min(1, f) * 100) + '%'; };
  const tip = (x, y, text, o) => `<div class="ln-tip ll-tip ${(o && o.cls) || ''}" style="left:${x}px;top:${y}px">${o && o.icon ? ic(o.icon, 26) : ''}<span>${esc(text)}</span></div>`;
  // a tiled floor in perspective
  const floor = (top, c, line) => {
    let s = `<rect y="${top}" width="${W}" height="${H - top}" fill="${c}"/>`;
    for (let r = 1; r < 7; r++) s += `<path d="M0 ${Math.round(top + ((r * r + r) * (H - top)) / 56)}H${W}" stroke="${line}" stroke-width="2" opacity="${0.35 + r * 0.06}"/>`;
    for (let k = -8; k <= 18; k++) s += `<path d="M${W / 2 + k * 46} ${top}L${W / 2 + k * 150} ${H}" stroke="${line}" stroke-width="2" opacity=".32"/>`;
    return s + `<rect y="${top}" width="${W}" height="${H - top}" fill="url(#lpFloorFade)"/>`;
  };
  // press and hold an element: fills st.s.p from 0 to 1, then calls full()
  function holdToFill(st, box, el, o) {
    if (!el || el.dataset.wired) return;
    el.dataset.wired = '1';
    const token = st.token;
    let iv = null;
    const stop = () => {
      if (!iv) return;
      clearInterval(iv);
      iv = null;
      box.classList.remove(o.cls);
      if (st.token === token && !st.s.full && st.s.p > 0) SX.say(o.more || 'A little more. Press and hold.');
    };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (st.s.full) return;
      A.hideHand();
      box.classList.add(o.cls);
      clearInterval(iv);
      iv = setInterval(() => {
        if (st.token !== token || A.S.sx !== st) { clearInterval(iv); iv = null; return; }
        st.s.p = Math.min(1, (st.s.p || 0) + (o.rate || 0.06));
        o.progress(st.s.p);
        tone(300 + st.s.p * 260, 0.05, 0.02);
        if (st.s.p >= 1) { clearInterval(iv); iv = null; box.classList.remove(o.cls); st.s.full = true; o.full(); }
      }, 90);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, stop));
  }

  // ================================================================ washing hands up close (canteen and kitchen)
  const HANDS = { x: 392, y: 112, w: 330 };
  HANDS.h = Math.round((HANDS.w * 240) / 260);
  const SPX = Math.round(HANDS.x + (HANDS.w * 128) / 260);
  // o: { wall, line, front (colour under the counter), kitchen: true (a pump bottle, not a wall dispenser) }
  HOME.lifeSinkClose = (o) => {
    const op = o || {};
    let s = HOME.tiledWall(op.wall || '#E3F2EF', op.line || '#FFFFFF', 560, '#E9D8C0');
    // a tap on the wall, its spout just above the hands
    s += vol(`<rect x="${SPX - 104}" y="30" width="40" height="52" rx="10"/>`, '#E3E8ED', { shade: 'h' });
    s += `<path d="M${SPX - 70} 56H${SPX - 16}a16 16 0 0 1 16 16V${HANDS.y - 2}" fill="none" stroke="#8A97A6" stroke-width="22" stroke-linecap="round"/><path d="M${SPX - 70} 56H${SPX - 16}a16 16 0 0 1 16 16V${HANDS.y - 2}" fill="none" stroke="url(#lpMetal)" stroke-width="15" stroke-linecap="round"/>`;
    s += vol(`<rect x="${SPX - 60}" y="26" width="16" height="30" rx="6"/>`, '#C9D1D9') + vol(`<rect x="${SPX - 72}" y="20" width="44" height="12" rx="6"/>`, '#4FB3A9');
    // soap
    if (op.kitchen) {
      s += `${LP.drop(840, 404, 40, 6)}${vol('<rect x="808" y="320" width="64" height="84" rx="16"/>', '#F4A3B9', { shade: 'h' })}<rect x="816" y="344" width="48" height="36" rx="8" fill="#fff" opacity=".7"/>${vol('<rect x="830" y="296" width="20" height="26" rx="4"/><path d="M836 296h34v-10h-34z"/>', '#FFFFFF')}`;
    } else {
      s += `${vol('<rect x="800" y="150" width="84" height="120" rx="14"/>', '#FFFFFF', { shade: 'h' })}<rect x="814" y="166" width="56" height="40" rx="8" fill="#BFE3F7"/><rect x="814" y="166" width="56" height="40" rx="8" fill="url(#lpGlass)"/>${vol('<rect x="826" y="262" width="32" height="18" rx="6"/>', '#C9D1D9')}${vol('<rect x="816" y="220" width="52" height="30" rx="8"/>', '#4FB3A9')}`;
    }
    // the sink: counter top with the basin, the front below
    s += `${vol(`<rect x="0" y="470" width="${W}" height="${H - 470}"/>`, op.front || '#CFE3DD', { shade: 'v', lineOpacity: 0.2 })}`;
    s += vol(`<rect x="-10" y="400" width="${W + 20}" height="76" rx="10"/>`, '#F4F6F8', { shade: 'v', lineOpacity: 0.3 });
    s += `<ellipse cx="${SPX}" cy="440" rx="236" ry="28" fill="#AEBBC6"/><ellipse cx="${SPX}" cy="444" rx="220" ry="22" fill="#C9D3DC"/><ellipse cx="${SPX}" cy="446" rx="220" ry="22" fill="url(#lpShadeV)" opacity=".5"/><circle cx="${SPX}" cy="448" r="7" fill="#8A97A6"/>`;
    return s;
  };
  SX.bg.lifeCanteenSink = () => HOME.lifeSinkClose({ wall: '#E5F1E6', line: '#FFFFFF', front: '#D7E6D2' });
  SX.bg.lifeKitchenSink = () => HOME.lifeSinkClose({ wall: '#EAF2EE', line: '#FFFFFF', front: '#E8C9A0', kitchen: true });

  // a hand-washing step: rub the hands (no tool) until they are soapy; o.skip adds a "my hands are clean" choice
  function handsStep(o) {
    const praise = o.praise || 'Clean hands!';
    return {
      id: o.id || 'hands',
      min: o.min,
      bg: o.bg,
      text: o.text,
      task: (st) => (st.done ? '' : 'Rub the hands together with soap.'),
      lumi: (st) => ({ x: 150, y: 562, h: 200, mood: st.done ? 'excited' : 'happy' }),
      enter(st) { st.s.need = o.need || 520; },
      draw(st) {
        const f = st.done ? 1 : Math.min(1, (st.s.rub || 0) / st.s.need);
        const rinse = st.done && !st.s.skipped;
        let h = SX.at(HANDS.x, HANDS.y, HANDS.w, HANDS.h, `<div class="ll-handsart ${rinse ? 'wh-auto' : ''}" style="--p:${rinse ? 1 : f.toFixed(2)}">${A.washHandsSvg(HANDS.w, rinse ? 'rinse' : 'soap')}</div>`, { cls: `ll-hands ${st.done ? '' : 'll-rubme'}`, label: 'Hands. Rub them with your finger.', z: 4 });
        if (!st.done) h += bar(SPX - 150, 494, 300, f);
        if (o.skip && !st.done) h += SX.choices([{ label: o.skip, art: ic('washhands', 56) }], 'skip', { style: 'right:22px;bottom:22px;', cls: 'll-skip' });
        if (st.done && !st.s.skipped) h += SX.bubble(176, 190, 'Rinse and dry.', { w: 190, tail: 'right' });
        return h;
      },
      tap(st, k) {
        if (k !== 'skip' || st.done) return;
        st.s.skipped = true;
        SX.ok();
        SX.done(st, o.skipPraise || 'OK. Lumi\'s hands are clean already.');
      },
      after(st, box) {
        if (st.done) return;
        const el = box.querySelector('.ll-hands');
        if (!el) return;
        const off = () => el.classList.remove('rubbing');
        ['pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, off));
        SX.scrub(box, el, {
          area: '.ll-hands',
          noMove: true,
          need: st.s.need,
          progress(f) {
            const a = el.querySelector('.ll-handsart');
            if (a) a.style.setProperty('--p', f.toFixed(2));
            el.classList.add('rubbing');
            setBar(box, f);
          },
          full() { SX.say('Lots of bubbles! Now let go.'); },
          done() { off(); SX.done(st, praise); },
          more: 'Keep rubbing. The palms, the backs and the fingers.'
        });
      },
      auto(st) { SX.done(st, praise); },
      demo: () => ({ sel: '.ll-hands', rub: true }),
      guide: (st) => (st.done ? null : { sel: '.ll-hands', say: 'Rub the hands with your finger.' })
    };
  }

  // ================================================================ BUY FOOD AT THE SCHOOL CANTEEN (primary)
  const C = { wall: '#FBF1DC', ceil: '#EFE2C8', beam: '#DCC8A6', pillar: '#EAD8B9', floor: '#DCE4D9', line: '#BFCBBC' };
  const STALL = { sign: 'RICE AND NOODLES', num: '3', c: '#E07A5F' };
  const MENU = [
    { id: 'chickenrice', name: 'Chicken rice', price: 1.5, art: ['rice', 'chicken'] },
    { id: 'noodles', name: 'Fishball noodles', price: 1.2, art: ['noodles'] },
    { id: 'nasilemak', name: 'Nasi lemak', price: 1.5, art: ['rice', 'egg'] },
    { id: 'fishsoup', name: 'Fish soup', price: 1.8, art: ['soup'] }
  ];
  const dishOf = (st) => MENU.find((m) => m.id === st.data.dish) || MENU[0];
  const dishArt = (d, w, h) => `<span class="ll-dish">${d.art.map((a) => `<span>${food(a, w, h)}</span>`).join('')}</span>`;
  const trayFood = (d) => d.art.map((a, i) => at(food(a, 96, 76), d.art.length > 1 ? 18 + i * 92 : 62, -2)).join('');
  // school children in uniform
  const KIDS = { boy: { who: 'boy', top: '#FFFFFF', bottom: '#3E5A8A' }, friend: { who: 'friend', top: '#FFFFFF', bottom: '#3E5A8A' }, girl: { who: 'girl', top: '#FFFFFF', skirt: '#4A78A8' } };
  const kid = (k, o) => P(Object.assign({ h: 220 }, KIDS[k], o || {}));

  const fan = (x, y) => `<g transform="translate(${x - 60} ${y})"><path d="M60 0v14" stroke="#9AA6B2" stroke-width="4"/>${vol('<ellipse cx="60" cy="18" rx="10" ry="6"/>', '#C9D1D9')}${vol('<path d="M60 18 L8 24 q-4 -6 4 -10z M60 18 L112 24 q4 -6 -4 -10z"/>', '#E3E8ED', { lineOpacity: 0.3 })}</g>`;
  const tree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v30" stroke="#8A6A4A" stroke-width="8" stroke-linecap="round"/>${vol('<circle cx="-18" cy="-8" r="22"/><circle cx="16" cy="-12" r="26"/><circle cx="0" cy="-32" r="24"/>', '#7BC67E', { lineOpacity: 0.25 })}</g>`;
  // the canteen: ceiling, beams, fans, pillars; o.open = [x0, x1] shows the school field between pillars
  function room(floorTop, o) {
    const op = o || {};
    let s = `<rect width="${W}" height="${H}" fill="${C.wall}"/><rect width="${W}" height="${floorTop}" fill="url(#lpShadeV)" opacity=".2"/>`;
    if (op.open) {
      const [x0, x1] = op.open;
      const top = 62;
      const bot = floorTop - 46;
      const bw = Math.min(260, x1 - x0 - 90);
      s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${bot - top}" fill="url(#lpSky)"/>`;
      s += `<g opacity=".85">${vol(`<rect x="${x0 + 60}" y="${top + 30}" width="${bw}" height="${bot - top - 30}"/>`, '#F6ECDC', { shade: 'v', lineOpacity: 0.2 })}`;
      for (let y = top + 54; y < bot - 40; y += 46) s += `<rect x="${x0 + 60}" y="${y}" width="${bw}" height="7" fill="#6FA0CC" opacity=".6"/><rect x="${x0 + 60}" y="${y + 12}" width="${bw}" height="16" fill="#E8DCC6" opacity=".7"/>`;
      s += '</g>';
      s += `<rect x="${x0}" y="${bot - 36}" width="${x1 - x0}" height="36" fill="#A9D68C"/>`;
      s += [0.12, 0.5, 0.86].map((f, i) => tree(x0 + (x1 - x0) * f, bot - 30, 0.85 + (i % 2) * 0.2)).join('');
      s += vol(`<rect x="${x0}" y="${bot}" width="${x1 - x0}" height="46"/>`, C.pillar, { shade: 'v', lineOpacity: 0.3 });
    }
    s += `<rect width="${W}" height="56" fill="${C.ceil}"/><rect y="52" width="${W}" height="10" fill="${C.beam}"/>`;
    (op.fans || []).forEach((x) => { s += fan(x, 62); });
    (op.pillars || []).forEach((x) => { s += vol(`<rect x="${x - 17}" y="58" width="34" height="${floorTop - 58}" rx="4"/>`, C.pillar, { shade: 'h', lineOpacity: 0.3 }); });
    return s + floor(floorTop, C.floor, C.line);
  }
  // the back of a stall: sign on top, tiled wall, a shelf with bowls and a pot, a picture menu (o.board)
  function stallBack(x, y, w, h, o) {
    const op = o || {};
    const sh = op.sh || 54;
    const size = op.size || 26;
    const c = op.c || STALL.c;
    let s = vol(`<rect x="${x}" y="${y + sh - 4}" width="${w}" height="${h - sh + 4}" rx="6"/>`, '#FFF8EC', { shade: 'v', lineOpacity: 0.3 });
    for (let i = 1; i < Math.floor(w / 40); i++) s += `<path d="M${x + i * 40} ${y + sh}V${y + h}" stroke="#F1E4CE" stroke-width="2"/>`;
    for (let j = 1; j < Math.floor((h - sh) / 40); j++) s += `<path d="M${x} ${y + sh + j * 40}H${x + w}" stroke="#F1E4CE" stroke-width="2"/>`;
    if (!op.plain) {
      const sy = y + sh + (op.shelfY || 70);
      const k = op.small ? 0.7 : 1;
      const sx = x + (op.board ? 222 : 16);
      s += vol(`<rect x="${sx}" y="${sy}" width="${Math.round(170 * k)}" height="${Math.round(10 * k)}" rx="4"/>`, '#C9D1D9');
      s += [0, 1, 2].map((i) => vol(`<path d="M${sx + 12 * k} ${sy - (9 + i * 10) * k}h${46 * k}l${-6 * k} ${10 * k}h${-34 * k}z"/>`, '#FFFFFF', { lineOpacity: 0.45 })).join('');
      s += vol(`<rect x="${sx + 82 * k}" y="${sy - 48 * k}" width="${62 * k}" height="${48 * k}" rx="${10 * k}"/>`, '#C9D1D9', { shade: 'h' }) + vol(`<ellipse cx="${sx + 113 * k}" cy="${sy - 48 * k}" rx="${33 * k}" ry="${8 * k}"/>`, '#E3E8ED') + vol(`<rect x="${sx + 106 * k}" y="${sy - 62 * k}" width="${14 * k}" height="${10 * k}" rx="4"/>`, '#3E5463');
    }
    if (op.board) {
      const bx = x + 26;
      const by = y + sh + 14;
      s += vol(`<rect x="${bx}" y="${by}" width="160" height="108" rx="10"/>`, '#3B2F2F', { lineOpacity: 0.3 });
      s += [['rice', 0, 0], ['noodles', 1, 0], ['egg', 0, 1], ['soup', 1, 1]].map(([f, cx, r]) => at(food(f, 60, 42), bx + 12 + cx * 76, by + 8 + r * 50)).join('');
    }
    s += vol(`<rect x="${x - 6}" y="${y}" width="${w + 12}" height="${sh}" rx="12"/>`, c, { shade: 'v' });
    s += T(x + w / 2 + (op.num ? 18 : 0), Math.round(y + sh / 2 + size * 0.36), op.sign || STALL.sign, size, '#fff', { ls: 1 });
    if (op.num) s += vol(`<circle cx="${x + 32}" cy="${y + sh / 2}" r="${Math.round(sh * 0.34)}"/>`, '#FFFFFF', { lineOpacity: 0.3 }) + T(x + 32, Math.round(y + sh / 2 + sh * 0.15), op.num, Math.round(sh * 0.4), c);
    return s;
  }
  // the front of a stall counter (in front of the stall aunty); o.glass = [x, w] shows a glass food display
  function counterFront(x, y, w, h, o) {
    const op = o || {};
    const gh = op.glass ? 50 : 0;
    let s = '';
    if (op.glass) {
      const [gx, gw] = op.glass;
      s += `<rect x="${gx}" y="2" width="${gw}" height="${gh}" rx="6" fill="#E6F4FA" fill-opacity=".45" stroke="#9FB8C8" stroke-width="2.5"/>`;
      s += [['#F6E7A8', 0], ['#FFFFFF', 1], ['#9CCB7A', 2], ['#F4A259', 3]].map(([c, i]) => vol(`<rect x="${gx + 12 + i * ((gw - 24) / 4)}" y="${gh - 16}" width="${(gw - 24) / 4 - 8}" height="14" rx="4"/>`, c, { lineOpacity: 0.3 })).join('');
      s += `<rect x="${gx}" y="2" width="${gw}" height="${gh}" rx="6" fill="url(#lpGlass)" opacity=".8"/>`;
    }
    s += vol(`<rect x="0" y="${gh}" width="${w}" height="16" rx="5"/>`, '#EEF1F4', { lineOpacity: 0.4 });
    s += vol(`<rect x="6" y="${gh + 14}" width="${w - 12}" height="${h - gh - 14}" rx="6"/>`, '#DCE2E7', { shade: 'v', lineOpacity: 0.4 });
    s += `<rect x="6" y="${gh + 14}" width="${w - 12}" height="14" fill="${STALL.c}" opacity=".85"/>`;
    for (let i = 1; i < Math.floor(w / 180) + 1; i++) s += `<path d="M${Math.round((i * w) / (Math.floor(w / 180) + 1))} ${gh + 34}V${h - 8}" stroke="#B9C3CC" stroke-width="3"/>`;
    return SX.at(x, y, w, h, svg(`0 0 ${w} ${h}`, s, 'none'), { z: 2, cls: 'll-front' });
  }
  // a row of small stalls far away (for the seating area)
  const farStalls = (y, o) => `<g opacity="${(o && o.opacity) || 1}">${[['DRINKS', '#4FA3D9'], [STALL.sign, STALL.c], ['SNACKS', '#7FB069']].map(([t, c], i) => stallBack(24 + i * 236, y, 216, 166, { sign: t, c, sh: 36, size: 17, small: true, shelfY: 58 }) + vol(`<rect x="${20 + i * 236}" y="${y + 120}" width="224" height="46" rx="6"/>`, '#DCE2E7', { shade: 'v', lineOpacity: 0.35 }) + `<rect x="${20 + i * 236}" y="${y + 120}" width="224" height="9" fill="${c}" opacity=".8"/>`).join('')}</g>`;

  // ---------------------------------------------------------------- backgrounds
  const QY = 546; // where feet stand in the queue
  const SLOT = [492, 662, 832]; // places in the queue, nearest the counter first
  const LUMI_START = 1010;
  SX.bg.lifeCanteenQueue = () => `${room(400, { open: [600, W], fans: [300, 860], pillars: [604, 868, 1100] })}
    ${stallBack(24, 70, 540, 330, { num: STALL.num, board: true })}
    ${SLOT.map((x) => `<rect x="${x - 46}" y="${QY + 2}" width="92" height="10" rx="5" fill="#F4D35E"/><rect x="${x - 46}" y="${QY + 2}" width="92" height="4" rx="2" fill="#fff" opacity=".45"/>`).join('')}`;
  SX.bg.lifeStallClose = () => `${room(476, {})}
    ${vol(`<rect x="24" y="92" width="${W - 48}" height="300"/>`, '#FFF8EC', { shade: 'v', lineOpacity: 0.3 })}
    ${Array.from({ length: 26 }, (_, i) => `<path d="M${24 + i * 42} 96V390" stroke="#F1E4CE" stroke-width="2"/>`).join('')}${[1, 2, 3, 4, 5, 6].map((j) => `<path d="M24 ${92 + j * 42}H${W - 24}" stroke="#F1E4CE" stroke-width="2"/>`).join('')}
    ${vol('<rect x="40" y="226" width="250" height="10" rx="4"/>', '#C9D1D9')}${[0, 1, 2, 3].map((i) => vol(`<path d="M${52 + i * 56} ${216 - (i % 2) * 10}h44l-6 10h-32z"/>`, '#FFFFFF', { lineOpacity: 0.45 })).join('')}
    ${vol('<rect x="880" y="112" width="190" height="262" rx="14"/>', '#E3E8ED', { shade: 'h' })}<rect x="896" y="128" width="158" height="226" rx="8" fill="#DDEFF7"/>
    ${[0, 1, 2].map((r) => `<rect x="896" y="${196 + r * 72}" width="158" height="6" fill="#C9D1D9"/>${[0, 1, 2, 3].map((c) => vol(`<rect x="${906 + c * 37}" y="${150 + r * 72}" width="24" height="46" rx="7"/>`, ['#F4A259', '#8EC5F2', '#E5534B', '#9CCB7A'][(c + r) % 4], { lineOpacity: 0.35 })).join('')}`).join('')}<rect x="896" y="128" width="158" height="226" rx="8" fill="url(#lpGlass)"/>
    ${vol(`<rect x="18" y="14" width="${W - 36}" height="80" rx="16"/>`, STALL.c, { shade: 'v' })}${T(530, 68, STALL.sign, 40, '#fff', { ls: 2 })}
    ${vol('<circle cx="70" cy="54" r="27"/>', '#FFFFFF', { lineOpacity: 0.3 })}${T(70, 66, STALL.num, 32, STALL.c)}`;
  SX.bg.lifeCanteenHall = () => `${room(300, { open: [760, W], fans: [380, 640], pillars: [764, 1100] })}${farStalls(68)}`;
  SX.bg.lifeCanteenEat = () => `${room(300, { open: [760, W], fans: [380, 640], pillars: [764] })}${farStalls(68, { opacity: 0.75 })}`;
  SX.bg.lifeTrayReturn = () => `${room(410, { fans: [300], pillars: [560] })}
    ${vol('<rect x="590" y="96" width="370" height="56" rx="12"/>', '#FFFFFF', { shade: 'v' })}${T(775, 134, 'TRAY RETURN', 30, '#3F7A4E', { ls: 2 })}
    ${LP.drop(775, 440, 200, 12)}${vol('<rect x="590" y="164" width="370" height="270" rx="16"/>', '#5B8F6A', { shade: 'v' })}<rect x="606" y="180" width="338" height="236" rx="10" fill="#3F6B4C"/>
    ${[0, 1, 2].map((r) => `<rect x="606" y="${238 + r * 64}" width="338" height="10" rx="4" fill="#2F5A3A"/>${r < 2 ? `<path d="M630 ${236 + r * 64}h290l-10 -14H640z" fill="#8EB8DC"/><path d="M634 ${224 + r * 64}h282l-8 -10H642z" fill="#A9CBE6"/>` : ''}`).join('')}
    ${LP.drop(520, 432, 66, 8)}${vol('<path d="M462 330h116l-10 100h-96z"/>', '#7FB069', { shade: 'h' })}${vol('<rect x="456" y="318" width="128" height="18" rx="6"/>', '#5B8F6A')}`;

  // ---------------------------------------------------------------- people and things at the stall
  // the stall aunty behind the close-up counter (her legs are behind the counter front)
  const AUNTY = { x: 96, y: 166 };
  const AUNTY_BUB = { x: 112, y: 100 };
  const aunty = (o) => SX.at(AUNTY.x, AUNTY.y, 130, 260, P(Object.assign({ who: 'aunty', h: 260, mood: 'smile' }, o || {})), { z: 1 });
  const closeCounter = (o) => aunty(o) + counterFront(14, 372, W - 28, 104);
  const queueFront = (pose) => SX.at(370, 108, 132, 220, P({ who: 'aunty', h: 220, pose: pose || 'stand', mood: 'smile', item: pose === 'give' ? 'plate' : '' }), { z: 1 }) + counterFront(16, 220, 556, 182, { glass: [22, 300] });
  const kidAt = (k, x, o) => {
    const op = o || {};
    return SX.at(x - 66, QY - 214, 132, 220, kid(k, op), { z: 3, cls: op.cls || '', style: op.style || '' });
  };
  // the menu board at the stall (o.locked: just to look at; o.point: Lumi points at the chosen dish)
  function menuBoard(st, o) {
    const op = o || {};
    const items = MENU.map((m) => {
      const inner = `${dishArt(m, 62, 50)}<span class="ll-mname">${esc(m.name)}</span><span class="ll-mprice">${SX.money(m.price)}</span>${op.point && st.data.dish === m.id ? `<span class="ll-pointhand">${ic('hand', 46)}</span>` : ''}`;
      const cls = `ll-mitem ${st.data.dish === m.id ? 'on' : ''}`;
      return op.locked ? `<span class="${cls}">${inner}</span>` : `<button class="${cls}" data-a="sx" data-k="dish" data-v="${m.id}" aria-label="${esc(m.name)}, ${SX.money(m.price)}">${inner}</button>`;
    }).join('');
    return `<div class="ll-menu ${op.locked ? 'locked' : ''}" style="left:332px;top:104px"><b class="ll-menu-title">Menu</b>${items}</div>`;
  }
  // the change, coin by coin (the pay step's own change button stays underneath for tapping)
  const PAYC = { x: 330, y: 226, w: 280, h: 110 };
  function changeCoins(st) {
    if (st.s.method !== 'cash' || !(st.s.change > 0)) return '';
    let left = Math.round(st.s.change * 100);
    const coins = [];
    [100, 50, 20, 10].forEach((c) => { while (left >= c && coins.length < 4) { coins.push(c / 100); left -= c; } });
    const w = 58 + (coins.length - 1) * 42;
    return SX.at(PAYC.x + PAYC.w / 2 - w / 2, PAYC.y + PAYC.h + 4, w, 64, svg(`0 0 ${w} 64`, coins.map((c, i) => at(SX.prop.coin(c).replace('width="100%" height="100%"', 'width="58" height="58"'), i * 42, 4)).join('')), { cls: 'll-change sx-glow', z: 5 });
  }

  // ---------------------------------------------------------------- the seats
  const TABLE = { x: 240, y: 296, w: 820, h: 200 };
  const PLACES = [365, 555, 745, 935];
  const TAKEN = { 0: 'girl', 2: 'boy' };
  const KIDFOOD = { 0: 'noodles', 2: 'rice' };
  const tableEl = () => {
    const stools = PLACES.map((px) => px - TABLE.x);
    const inner = `${LP.drop(410, 186, 400, 14)}
      ${[140, 680].map((x) => `<path d="M${x} 86V176" stroke="#5B6B7A" stroke-width="14" stroke-linecap="round"/><path d="M${x - 40} 180h80" stroke="#5B6B7A" stroke-width="10" stroke-linecap="round"/>`).join('')}
      ${stools.map((x) => `<path d="M${x} 92L${x} 150" stroke="#7A8794" stroke-width="7"/>${vol(`<ellipse cx="${x}" cy="156" rx="44" ry="14"/>`, '#4A78A8')}`).join('')}
      ${vol('<rect x="6" y="12" width="808" height="74" rx="22"/>', '#EEF3F6', { lineOpacity: 0.4 })}<rect x="6" y="12" width="808" height="74" rx="22" fill="url(#lpMarble)" opacity=".6"/>
      ${vol('<rect x="6" y="70" width="808" height="18" rx="9"/>', '#C9D3DC', { lineOpacity: 0.4 })}`;
    return SX.at(TABLE.x, TABLE.y, TABLE.w, TABLE.h, svg(`0 0 ${TABLE.w} ${TABLE.h}`, inner), { z: 2 });
  };
  const sitter = (i) => SX.at(PLACES[i] - 60, 180, 120, 200, kid(TAKEN[i], { pose: 'sit', h: 200, mood: 'smile' }), { z: 1 }) + SX.at(PLACES[i] - 48, 300, 96, 76, food(KIDFOOD[i], 96, 76), { z: 3 });
  const seatAt = (i) => ({ x: PLACES[i], y: 345, h: 168, z: 1 });

  // ---------------------------------------------------------------- the steps
  function serveNext(st) {
    SX.later(st, () => {
      if (st.done || !st.s.q.length) return;
      st.s.left = st.s.q.shift();
      st.s.slid = st.s.q.length > 0;
      st.s.gap = true;
      tone(700, 0.12, 0.05);
      SX.render();
      SX.say('The line moved! Tap Lumi to step forward.');
      SX.later(st, () => { st.s.left = null; st.s.slid = false; }, 1300);
    }, 3000);
  }
  const canteenSteps = [
    handsStep({
      id: 'hands',
      bg: 'lifeCanteenSink',
      text: 'It is recess! Lumi is hungry. First, wash hands at the sink.',
      skip: 'My hands are clean',
      need: 480,
      praise: 'Clean hands! Ready to buy food.'
    }),
    {
      id: 'line',
      bg: 'lifeCanteenQueue',
      text: 'Lumi goes to the food stall. His friend is in the queue.',
      task: (st) => (st.done ? '' : 'Tap the yellow spot behind the friend.'),
      lumi: (st) => ({ x: st.done ? SLOT[2] : LUMI_START, y: QY, h: 200, flip: true, mood: 'happy' }),
      draw(st) {
        let h = queueFront('give') + kidAt('boy', SLOT[0], { flip: true, pose: 'hold', item: 'tray' }) + kidAt('friend', SLOT[1], { flip: true, mood: 'smile', pose: st.done ? 'wave' : 'stand' });
        if (!st.done) h += SX.at(SLOT[2] - 70, 380, 140, 186, '<span class="ll-spot"></span>', { k: 'join', label: 'Join the queue here', cls: 'll-joinhit', z: 4 });
        h += SX.bubble(SLOT[1] - 64, 238, st.done ? 'Hi, Lumi!' : 'The line starts here.', { w: st.done ? 130 : 220 });
        return h;
      },
      tap(st, k) { if (k === 'join' && !st.done) { SX.ok(); SX.done(st, 'Lumi joined the queue, behind his friend.'); } },
      auto(st) { SX.done(st, 'Lumi joined the queue, behind his friend.'); },
      demo: () => ({ sel: '[data-k="join"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="join"]', say: 'Tap the yellow spot behind the friend.' })
    },
    {
      id: 'wait',
      bg: 'lifeCanteenQueue',
      text: 'Now Lumi waits for his turn. Waiting can be hard. Lumi stays calm.',
      task: (st) => (st.done ? '' : st.s.gap ? 'The line moved! Tap Lumi to step forward.' : 'Wait for the line to move. You can count with Lumi.'),
      lumi: (st) => ({ x: SLOT[st.s.at == null ? 2 : st.s.at], y: QY, h: 200, flip: true, mood: st.done ? 'excited' : st.s.gap ? 'happy' : 'calm' }),
      enter(st) { st.s.q = ['boy', 'friend']; st.s.at = 2; st.s.gap = false; serveNext(st); },
      draw(st) {
        let h = queueFront(st.s.q.length ? 'give' : 'stand');
        st.s.q.forEach((k, i) => { h += kidAt(k, SLOT[i], { flip: true, pose: i === 0 ? 'hold' : 'stand', item: i === 0 ? 'tray' : '', mood: 'smile', cls: st.s.slid ? 'll-slide' : '', style: `--dx:${SLOT[1] - SLOT[0]}px;` }); });
        if (st.s.left) h += kidAt(st.s.left, SLOT[0], { flip: true, pose: 'hold', item: 'tray', mood: 'smile', cls: 'll-leave' });
        const lx = SLOT[st.s.at];
        if (st.done) h += SX.bubble(560, 150, 'Hello! What would you like?', { w: 200, tail: 'left' });
        else if (st.s.gap) {
          h += SX.at(SLOT[st.s.q.length] - 60, QY - 22, 120, 44, '<div class="hk-steps"></div>', { z: 2 });
          h += SX.at(lx - 100, 356, 200, 206, '', { k: 'step', label: 'Take a step forward', cls: 'hk-lumihit', z: 6 });
        } else h += `<button class="ll-count" data-a="sx" data-k="count" style="left:${lx - 112}px;top:250px" aria-label="Count with Lumi">${ic('kCount', 34)}<span>Count with me</span></button>`;
        return h;
      },
      tap(st, k) {
        if (k === 'count') { tone(620, 0.12, 0.04); SX.say('One, two, three, four, five. Breathe in, and out.'); return; }
        if (k !== 'step' || !st.s.gap || st.done) return;
        st.s.gap = false;
        st.s.at = st.s.q.length;
        st.s.left = null;
        st.s.slid = false;
        SX.ok();
        if (st.s.at === 0) { SX.done(st, 'It is Lumi\'s turn! He waited so well.'); return; }
        SX.render();
        SX.say('Good. Now wait again.');
        serveNext(st);
      },
      auto(st) { st.s.q = []; st.s.at = 0; st.s.gap = false; st.s.left = null; SX.done(st, 'It is Lumi\'s turn! He waited so well.'); },
      demo: (st) => (st.s.gap ? { sel: '[data-k="step"]', tap: true } : { sel: '[data-k="count"]', tap: true }),
      guide: (st) => (st.done ? null : st.s.gap ? { sel: '[data-k="step"]', say: 'Tap Lumi to step forward.' } : { sel: '[data-k="count"]', say: 'Wait calmly. Tap to count with Lumi.' })
    },
    {
      id: 'menu',
      bg: 'lifeStallClose',
      text: (st) => (st.data.dish ? `Lumi chose ${dishOf(st).name.toLowerCase()}.` : 'The aunty says hello. Look at the pictures on the menu.'),
      task: (st) => (st.done ? '' : 'Tap the food Lumi wants.'),
      lumi: { x: 990, y: 558, h: 196, flip: true },
      enter(st) { st.data.dish = null; },
      draw: (st) => closeCounter({ mood: st.done ? 'smile' : 'talk' }) + menuBoard(st) + (st.done ? '' : SX.bubble(AUNTY_BUB.x, AUNTY_BUB.y, 'Hello! What would you like?', { w: 200 })),
      tap(st, k, el, d) {
        if (k !== 'dish' || st.done) return;
        st.data.dish = d.v;
        SX.ok();
        SX.done(st, `${dishOf(st).name}! A good choice.`);
      },
      auto(st) { st.data.dish = st.data.dish || 'chickenrice'; SX.done(st, `${dishOf(st).name}! A good choice.`); },
      demo: () => ({ sel: '[data-k="dish"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="dish"]', say: 'Tap the food you want.' })
    },
    {
      id: 'order',
      bg: 'lifeStallClose',
      text: 'Now tell the aunty. Use the talk card, or point to the picture.',
      task: (st) => (st.done ? '' : 'Tap the talk card, or tap Point.'),
      lumi: (st) => ({ x: 990, y: 558, h: 196, flip: true, mood: st.done ? 'excited' : 'happy' }),
      enter(st) { st.data.dish = st.data.dish || 'chickenrice'; st.s.said = false; st.s.pointed = false; },
      draw(st) {
        const d = dishOf(st);
        let h = closeCounter({ mood: 'smile', pose: st.done ? 'wave' : 'stand' }) + menuBoard(st, { locked: true, point: st.s.pointed });
        h += SX.talkCard([{ t: 'One', art: '' }, { t: d.name, art: food(d.art[d.art.length - 1], 52, 42) }, { t: 'please', art: '' }], 'say', { said: st.s.said, style: 'left:300px;top:394px;' });
        h += `<button class="ll-point ${st.s.pointed ? 'on' : ''}" data-a="sx" data-k="point" style="left:772px;top:404px" aria-label="Point to the picture">${ic('hand', 44)}<span>Point</span></button>`;
        if (st.done) h += SX.bubble(AUNTY_BUB.x, AUNTY_BUB.y, `OK! ${SX.money(d.price)}, please.`, { w: 190 });
        return h;
      },
      tap(st, k) {
        if (st.done || st.s.said || st.s.pointed) return;
        const d = dishOf(st);
        if (k === 'say') {
          st.s.said = true;
          SX.say(`One ${d.name.toLowerCase()}, please.`);
          SX.render();
          SX.later(st, () => SX.done(st, `The aunty understood. ${SX.money(d.price)}, please.`), 1500);
        } else if (k === 'point') {
          st.s.pointed = true;
          SX.say('This one, please.');
          SX.render();
          SX.later(st, () => SX.done(st, `The aunty understood. ${SX.money(d.price)}, please.`), 1300);
        }
      },
      auto(st) { st.s.said = true; SX.done(st, `The aunty understood. ${SX.money(dishOf(st).price)}, please.`); },
      demo: () => ({ sel: '.sx-talk', tap: true }),
      guide: (st) => (st.done ? null : { sel: '.sx-talk', say: 'Tap the talk card.' })
    },
    payStep(),
    {
      id: 'thanks',
      min: 2,
      bg: 'lifeStallClose',
      text: (st) => `The aunty puts the ${dishOf(st).name.toLowerCase()} on a tray. It is ready!`,
      task: (st) => (st.done ? '' : 'Tap the talk card to say thank you.'),
      lumi: (st) => ({ x: 900, y: 558, h: 190, flip: true, mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        let h = closeCounter({ pose: st.done ? 'wave' : 'stand', mood: 'smile' });
        h += SX.at(330, 282, 230, 126, SX.prop.tray(trayFood(dishOf(st))), { z: 3 });
        h += SX.talkCard([{ t: 'Thank you!', art: ic('heart', 52) }], 'thanks', { said: st.done, style: 'left:620px;top:150px;' });
        if (st.done) h += SX.bubble(AUNTY_BUB.x, AUNTY_BUB.y, 'You are welcome!', { w: 190 });
        return h;
      },
      tap(st, k) { if (k === 'thanks' && !st.done) { SX.say('Thank you!'); SX.done(st, 'Lumi said thank you. The aunty smiles.'); } },
      auto(st) { SX.done(st, 'Lumi said thank you. The aunty smiles.'); },
      demo: () => ({ sel: '[data-k="thanks"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="thanks"]', say: 'Say thank you.' })
    },
    {
      id: 'carry',
      bg: 'lifeCanteenHall',
      text: 'Carry the tray slowly, with two hands. Find an empty seat.',
      task: (st) => (st.done ? '' : 'Drag the tray to an empty seat.'),
      lumi: (st) => (st.done ? seatAt(st.data.seat) : { x: 120, y: 560, h: 190 }),
      enter(st) { st.data.seat = null; st.s.tip = null; },
      draw(st) {
        const d = dishOf(st);
        let h = tableEl() + sitter(0) + sitter(2);
        PLACES.forEach((px, i) => {
          if (st.done) return;
          h += SX.at(px - 86, 300, 172, 86, TAKEN[i] ? '' : '<span class="ll-seatmark"></span>', { target: true, id: `seat${i}`, cls: `ll-seat ${TAKEN[i] ? 'taken' : ''}`, label: TAKEN[i] ? 'Someone is sitting here' : 'Empty seat', z: 3 });
        });
        if (st.s.tip != null && !st.done) h += SX.bubble(PLACES[st.s.tip] - 40, 132, 'Someone is sitting here.', { w: 200 });
        if (!st.done) h += SX.at(150, 440, 210, 116, SX.prop.tray(trayFood(d)), { cls: 'll-tray sx-drag', label: 'Tray with food', z: 8 });
        else h += SX.at(PLACES[st.data.seat] - 84, 286, 168, 92, SX.prop.tray(trayFood(d)), { z: 3 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ll-tray', '.ll-seat', (t) => {
          const i = Number(t.dataset.id.slice(4));
          if (TAKEN[i]) { st.s.tip = i; SX.say('That seat is taken. Find an empty seat.'); SX.render(); return false; }
          st.s.tip = null;
          st.data.seat = i;
          SX.ok();
          SX.done(st, 'Lumi found an empty seat. Careful carrying!');
          return true;
        }, { miss: () => SX.say('Put the tray at an empty seat.') });
      },
      auto(st) { st.data.seat = 1; st.s.tip = null; SX.done(st, 'Lumi found an empty seat. Careful carrying!'); },
      guide: (st) => (st.done ? null : { sel: '.ll-tray', to: '[data-id="seat1"]', say: 'Drag the tray to an empty seat.' })
    },
    {
      id: 'eat',
      bg: 'lifeCanteenEat',
      text: 'Lumi sits next to his friend and eats. Yum!',
      task: (st) => (st.done ? '' : 'Tap the food to help Lumi eat.'),
      lumi: (st) => ({ x: 470, y: 436, h: 250, z: 3, mood: st.done ? 'excited' : 'happy' }),
      enter(st) { st.s.bites = 0; if (st.data.seat == null) st.data.seat = 1; },
      draw(st) {
        const d = dishOf(st);
        const left = Math.max(0, 3 - st.s.bites);
        let h = SX.at(744, 214, 156, 260, kid('friend', { pose: 'sit', h: 260, mood: 'smile' }), { z: 3 });
        h += SX.at(0, 392, W, 178, svg(`0 0 ${W} 178`, `${vol(`<rect x="-30" y="0" width="${W + 60}" height="150" rx="34"/>`, '#EEF3F6', { lineOpacity: 0.35 })}<rect x="-30" y="0" width="${W + 60}" height="150" rx="34" fill="url(#lpMarble)" opacity=".6"/>${vol(`<rect x="-30" y="132" width="${W + 60}" height="50"/>`, '#C9D3DC', { shade: 'v', lineOpacity: 0.3 })}`, 'none'), { z: 4 });
        h += SX.at(762, 372, 124, 100, food('noodles', 124, 100), { z: 5 });
        h += SX.at(306, 372, 348, 190, SX.prop.tray(''), { z: 5 });
        h += `<button class="ll-plate sx-el" data-a="sx" data-k="bite" style="left:350px;top:384px;width:260px;height:116px;z-index:6" aria-label="Take a bite">${left ? `<span class="ll-left" style="opacity:${0.45 + left * 0.18};transform:scale(${0.72 + left * 0.09})">${dishArt(d, 120, 96)}</span>` : `<span class="ll-left ll-empty">${svg('0 0 140 70', `${LP.drop(70, 58, 60, 8)}${vol('<ellipse cx="70" cy="38" rx="62" ry="22"/>', '#FFFFFF')}<ellipse cx="70" cy="36" rx="44" ry="13" fill="#EEF0F2"/>`)}</span>`}</button>`;
        if (st.s.bites > 0 && !st.done) h += SX.bubble(600, 160, ['Yum!', 'Mmm, tasty!'][st.s.bites - 1] || 'Yum!', { w: 150, tail: 'left' });
        if (st.done) h += SX.bubble(600, 160, 'All finished!', { w: 160, tail: 'left' });
        return h;
      },
      tap(st, k) {
        if (k !== 'bite' || st.done) return;
        st.s.bites += 1;
        tone(520 + st.s.bites * 80, 0.12, 0.05);
        if (st.s.bites >= 3) { SX.done(st, 'All finished! Lumi enjoyed his lunch.'); return; }
        SX.render();
        SX.say(['Yum!', 'Mmm, tasty!'][st.s.bites - 1]);
      },
      auto(st) { st.s.bites = 3; SX.done(st, 'All finished! Lumi enjoyed his lunch.'); },
      demo: () => ({ sel: '[data-k="bite"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="bite"]', say: 'Tap the food.' })
    },
    {
      id: 'return',
      min: 2,
      bg: 'lifeTrayReturn',
      text: 'After eating, return the tray. Then the table is clean for the next person.',
      task: (st) => (st.done ? '' : 'Drag the tray to the tray return.'),
      lumi: (st) => (st.done ? { x: 380, y: 556, h: 200, mood: 'excited' } : { x: 150, y: 556, h: 200 }),
      draw(st) {
        const empty = svg('0 0 140 70', `${vol('<ellipse cx="70" cy="38" rx="56" ry="20"/>', '#FFFFFF')}<ellipse cx="70" cy="36" rx="40" ry="12" fill="#EEF0F2"/>`);
        let h = SX.at(590, 164, 370, 270, '', { target: !st.done, id: 'station', cls: 'll-station', label: 'Tray return' });
        h += SX.at(966, 168, 150, 250, P({ who: 'aunty', h: 250, top: '#8EC0DC', apron: '#3E5463', flip: true, mood: 'smile', pose: st.done ? 'wave' : 'stand' }), { z: 1 });
        if (!st.done) h += SX.at(240, 440, 210, 116, SX.prop.tray(`<g transform="translate(40 4)">${empty.replace('width="100%" height="100%"', 'width="140" height="70"')}</g>`), { cls: 'll-tray sx-drag', label: 'Empty tray', z: 8 });
        else { h += SX.at(626, 300, 300, 66, SX.prop.tray(''), { z: 2 }); h += SX.bubble(716, 172, 'Thank you for returning your tray!', { w: 230, tail: 'right' }); }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ll-tray', '[data-id="station"]', () => { SX.ok(); SX.done(st, 'Lumi returned the tray. Recess done!'); return true; }, { miss: () => SX.say('Bring the tray to the green tray return.') });
      },
      auto(st) { SX.done(st, 'Lumi returned the tray. Recess done!'); },
      guide: (st) => (st.done ? null : { sel: '.ll-tray', to: '[data-id="station"]', say: 'Drag the tray to the tray return.' })
    }
  ];
  // paying at the stall: SX.payStep, plus the real coins in the change, "Do it with me", and where each drag goes
  function payStep() {
    const step = SX.payStep({
      id: 'llpay',
      bg: 'lifeStallClose',
      price: (st) => dishOf(st).price,
      lumi: { x: 640, y: 558, h: 186, flip: true },
      counter: PAYC,
      wallet: [2, 1, 0.5, 0.2, 0.1],
      draw: (st) => closeCounter({ mood: 'smile' }) + changeCoins(st),
      doneText: 'Lumi paid and took his change.'
    });
    const guide0 = step.guide;
    const where = (st) => (st.s.method === 'card' ? '[data-id="reader"]' : st.s.method === 'phone' ? '[data-id="qr"]' : '.sx-pay-drop');
    step.guide = (st) => {
      if (st.done) return null;
      const g = guide0(st);
      if (g && st.s.method && /sx-money/.test(g.sel)) g.to = where(st);
      return g;
    };
    step.demo = (st) => {
      const g = step.guide(st);
      if (!g) return null;
      return g.to ? { sel: g.sel, to: g.to } : { sel: g.sel, tap: true };
    };
    step.auto = (st) => {
      st.s.method = st.s.method || 'cash';
      st.s.paid = dishOf(st).price;
      st.s.change = 0;
      SX.done(st, 'Lumi paid. Well done!');
    };
    return step;
  }
  SX.lessonWithLevels({ tut: 'canteen', realText: 'At recess, buy your food like Lumi: wait in the queue, choose, pay, and say thank you.', realSay: 'bought food at the canteen' }, canteenSteps);

  // ================================================================ MAKE A SANDWICH (teen)
  const K = { back: 262, front: 482 };
  const FILLS = [
    { id: 'kaya', name: 'Kaya', c: '#B4C25C', c2: '#9BAA45', lid: '#3E8E5E' },
    { id: 'peanut', name: 'Peanut butter', c: '#C98B4A', c2: '#B07434', lid: '#E5534B' },
    { id: 'jam', name: 'Strawberry jam', c: '#C93A4F', c2: '#A82C3F', lid: '#F4F6F8' }
  ];
  const fillOf = (st) => FILLS[st.data.fill == null ? 0 : st.data.fill];
  // a slice of bread lying flat (seen from the side and above)
  const FACE = 'M24 34C10 32 10 12 28 9C44 2 106 2 122 9C140 12 140 32 126 34L128 76Q128 82 122 82L28 82Q22 82 22 76Z';
  const INNER = 'M33 38C24 36 24 21 36 18C50 12 100 12 114 18C126 21 126 36 117 38L118 70Q118 74 114 74L36 74Q32 74 32 70Z';
  const crumbDots = [[50, 44], [92, 52], [70, 64], [104, 30], [44, 62], [80, 30]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.4" fill="#E6CB96"/>`).join('');
  const sliceInner = (o) => {
    const op = o || {};
    const f = op.fill;
    const spread = f ? `<g class="ll-spreadL" style="opacity:${op.amt == null ? 1 : op.amt}"><path d="${INNER}" fill="${f.c}"/><path d="M44 30q20 -8 40 0M60 50q22 -8 44 2M46 64q18 -6 34 0" fill="none" stroke="${f.c2}" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M40 26q14 -6 26 -2" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round" fill="none"/></g>` : '';
    return `<path d="${FACE}" transform="translate(0 9)" fill="#B8783D"/><path d="${FACE}" fill="#FBE7BF" stroke="#D29655" stroke-width="6" stroke-linejoin="round"/><path d="${FACE}" fill="url(#lpShade)" opacity=".45"/>${crumbDots}${spread}`;
  };
  SX.prop.lifeSlice = (o) => svg('0 0 150 100', `${LP.drop(75, 94, 66, 7)}${sliceInner(o)}`);
  // a sandwich: the bottom slice, the filling and the top slice
  const sandInner = (f) => `<path d="${FACE}" transform="translate(0 25)" fill="#B8783D"/><path d="${FACE}" transform="translate(0 17)" fill="#F2D9A6" stroke="#D29655" stroke-width="5"/><path d="${FACE}" transform="translate(0 12)" fill="${f.c}"/>${sliceInner()}`;
  const sandwichSvg = (f) => svg('0 0 150 114', `${LP.drop(75, 108, 68, 7)}${sandInner(f)}`);
  // cut in half along the middle; bites (0-3) come off the front half
  const CUTY = 46;
  const cutSvg = (f, bites) => {
    const b = [[118, 92, 16], [96, 100, 15], [72, 100, 15]].slice(0, bites || 0).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('');
    return svg('0 0 150 124', `<defs><clipPath id="llCutTop"><rect x="0" y="-20" width="150" height="${CUTY + 20}"/></clipPath><clipPath id="llCutBot"><rect x="0" y="${CUTY}" width="150" height="120"/></clipPath>
      <mask id="llBite"><rect x="-10" y="-10" width="170" height="150" fill="#fff"/>${b}</mask></defs>
      ${LP.drop(75, 116, 70, 7)}
      <g transform="translate(0 -8)"><g clip-path="url(#llCutTop)">${sandInner(f)}</g>
        <rect x="24" y="${CUTY}" width="102" height="8" fill="#FBE7BF"/><rect x="24" y="${CUTY + 8}" width="102" height="5" fill="${f.c}"/><rect x="24" y="${CUTY + 13}" width="102" height="7" fill="#F2D9A6"/>
        <path d="M24 ${CUTY}v20M126 ${CUTY}v20" stroke="#C98B4A" stroke-width="4" stroke-linecap="round"/><path d="M24 ${CUTY + 20}h102" stroke="#B8783D" stroke-width="2"/></g>
      <g mask="url(#llBite)"><g transform="translate(0 12)"><g clip-path="url(#llCutBot)">${sandInner(f)}</g></g></g>`);
  };
  const breadBag = () => svg('0 0 190 110', `${LP.drop(92, 102, 88, 8)}
    ${vol('<rect x="16" y="22" width="150" height="76" rx="30"/>', '#D9A066', { shade: 'v' })}${[40, 56, 72, 88, 104, 120, 136].map((x) => `<path d="M${x} 26V96" stroke="#B8783D" stroke-width="2" opacity=".55"/>`).join('')}
    ${vol('<ellipse cx="164" cy="60" rx="16" ry="38"/>', '#FBE7BF', { lineOpacity: 0.4 })}<ellipse cx="164" cy="60" rx="16" ry="38" fill="none" stroke="#D29655" stroke-width="5"/>
    <path d="M14 18Q4 60 14 104L170 104Q186 104 186 88V32Q186 16 170 16Z" fill="#FFFFFF" fill-opacity=".28" stroke="#9FB8C8" stroke-width="2.5"/>
    <rect x="44" y="40" width="70" height="38" rx="10" fill="#F4D35E" opacity=".92"/><path d="M60 70q10 -24 20 -24q10 0 20 24" fill="none" stroke="#C98B2A" stroke-width="4" stroke-linecap="round"/>
    <path d="M14 18Q4 60 14 104" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>${vol('<path d="M2 52l14 4v10l-14 4z"/>', '#4FB3A9')}`);
  // a butter knife (coat: what is on the blade)
  SX.prop.lifeKnife = (coat) => svg('0 0 200 40', `${LP.drop(100, 36, 92, 4)}${vol('<rect x="118" y="12" width="78" height="18" rx="9"/>', '#4FB3A9', { shade: 'v' })}<rect x="134" y="16" width="44" height="4" rx="2" fill="#fff" opacity=".45"/>
    ${vol('<rect x="110" y="13" width="12" height="16" rx="3"/>', '#C9D1D9')}<path d="M8 22Q8 11 22 11L112 13V29L22 29Q9 29 8 22Z" fill="url(#lpMetal)" stroke="${LP.INK}" stroke-opacity=".45" stroke-width="1.6"/>
    ${coat ? `<path d="M10 22Q11 14 24 14L62 15V27L24 27Q12 28 10 22Z" fill="${coat}"/>` : ''}<path d="M28 16h70" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/>`);
  // a glass jar of the filling
  SX.prop.lifeJar = (f) => svg('0 0 76 92', `${LP.drop(38, 88, 30, 4)}${vol('<rect x="10" y="20" width="56" height="66" rx="12"/>', f.c, { shade: 'h' })}<rect x="16" y="44" width="44" height="24" rx="5" fill="#FFFFFF" opacity=".92"/><rect x="16" y="50" width="44" height="6" fill="${f.lid === '#F4F6F8' ? f.c : f.lid}" opacity=".85"/>
    <rect x="10" y="20" width="56" height="66" rx="12" fill="url(#lpGlass)"/>${vol('<rect x="8" y="8" width="60" height="16" rx="6"/>', f.lid, { shade: 'v' })}${f.lid === '#F4F6F8' ? '<path d="M14 12h48M14 18h48M22 8v16M38 8v16M54 8v16" stroke="#E5534B" stroke-width="2" opacity=".6"/>' : ''}`);
  const cloth = () => svg('0 0 120 70', `${LP.drop(60, 64, 54, 6)}${vol('<path d="M8 20Q8 10 20 10H100Q112 10 112 22V50Q112 60 100 60H20Q8 60 8 50Z"/>', '#5BA8E0')}<path d="M8 34Q60 42 112 32" stroke="#3E8AC4" stroke-width="3" fill="none"/>${[[24, 22], [44, 18], [70, 22], [92, 20], [30, 48], [58, 50], [86, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff" opacity=".45"/>`).join('')}`);
  const crumbs = () => svg('0 0 150 80', [[20, 30], [34, 50], [52, 24], [60, 60], [78, 40], [96, 22], [102, 58], [120, 36], [130, 60], [44, 38], [88, 64], [112, 18]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${4 + (i % 3)}" ry="${3 + (i % 2)}" fill="${i % 2 ? '#C98B4A' : '#D9A066'}" stroke="#8A5A2A" stroke-opacity=".4"/>`).join(''));

  // ---------------------------------------------------------------- the kitchen
  // an HDB window: sky, the next block with laundry poles, trees; o.grille adds white grille bars
  HOME.lifeWindow = (x, y, w, h, o) => {
    const op = o || {};
    const bx = Math.round(x + w * 0.46);
    const bw = Math.round(w * 0.46);
    let s = vol(`<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="10"/>`, '#FFFFFF', { shade: 'v' });
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#lpSky)"/>`;
    s += `<circle cx="${x + 64}" cy="${y + 52}" r="46" fill="url(#lpGlow)"/><circle cx="${x + 64}" cy="${y + 52}" r="20" fill="#FFE07A"/>`;
    s += vol(`<rect x="${bx}" y="${y + 26}" width="${bw}" height="${h - 26}"/>`, '#F6E3C4', { shade: 'h', lineOpacity: 0.2 }) + `<rect x="${bx}" y="${y + 26}" width="${bw}" height="10" fill="#E58B6A"/>`;
    for (let r = 0; y + 50 + r * 46 < y + h - 20; r++) {
      for (let c = 0; c < 3; c++) s += `<rect x="${bx + 14 + (c * (bw - 20)) / 3}" y="${y + 50 + r * 46}" width="${(bw - 20) / 3 - 14}" height="20" rx="3" fill="#8FB6D2"/>`;
      s += `<path d="M${bx - 34} ${y + 76 + r * 46}H${bx + 6}" stroke="#C9A66B" stroke-width="4" stroke-linecap="round"/>${['#E58BA6', '#8EC5F2', '#F4D35E'].slice(0, 2 + (r % 2)).map((c, i) => `<rect x="${bx - 30 + i * 12}" y="${y + 78 + r * 46}" width="9" height="14" rx="2" fill="${c}"/>`).join('')}`;
    }
    s += [0.1, 0.32].map((f, i) => tree(x + w * f + 20, y + h - 6, 0.7 + i * 0.15)).join('');
    if (op.grille) for (let i = 1; i < Math.floor(w / 38); i++) s += `<rect x="${x + i * 38 - 2}" y="${y}" width="4" height="${h}" fill="#FFFFFF" opacity=".85"/>`;
    s += `<rect x="${x + w / 2 - 3}" y="${y}" width="6" height="${h}" fill="#C9D1D9"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#lpGlass)" opacity=".5"/>`;
    s += vol(`<rect x="${x - 18}" y="${y + h + 8}" width="${w + 36}" height="14" rx="5"/>`, '#E3E8ED');
    return s;
  };
  const JARS = [{ x: 268, y: 106 }, { x: 362, y: 106 }, { x: 456, y: 106 }]; // jar places on the shelf
  const JAR_C = { x: 786, y: 230, w: 66, h: 80 }; // the jar in use, on the counter
  const BAG = { x: 268, y: 262, w: 190, h: 110 };
  const SL = { x: 482, y: 348, w: 150, h: 100 };
  const SR = { x: 652, y: 348, w: 150, h: 100 };
  const SAND = { x: 546, y: 330, w: 190, h: 157 };
  const KNIFE = { x: 846, y: 418, w: 190, h: 38 };
  const CRUMBS = { x: 286, y: 386, w: 150, h: 80 };
  SX.bg.lifeKitchen = () => {
    let s = HOME.tiledWall('#E6F1EC', '#FFFFFF', 560, '#D9C7AE');
    s += HOME.lifeWindow(586, 30, 250, 176);
    s += `${LP.drop(997, 162, 120, 8)}${vol('<rect x="880" y="-10" width="250" height="166" rx="8"/>', '#E8C9A0', { shade: 'v' })}<path d="M997 -10V156" stroke="#C9A27A" stroke-width="4"/>${[978, 1016].map((x) => vol(`<rect x="${x - 4}" y="112" width="8" height="30" rx="4"/>`, '#C9D1D9')).join('')}`;
    s += `${vol('<rect x="250" y="196" width="300" height="12" rx="4"/>', '#C9A27A', { shade: 'v' })}<path d="M276 208v14M524 208v14" stroke="#A88A64" stroke-width="6" stroke-linecap="round"/>`;
    // the counter top, its edge and the cupboards under it
    s += `<rect y="${K.back - 8}" width="${W}" height="8" fill="#D5DDE0"/>${vol(`<rect x="-10" y="${K.back}" width="${W + 20}" height="${K.front - K.back}"/>`, '#EDE6DA', { shade: 'v', lineOpacity: 0.2 })}`;
    s += [[120, 300], [330, 440], [560, 300], [760, 460], [930, 380], [1050, 300], [200, 420], [700, 270], [460, 470], [990, 450]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#CFC4B2"/>`).join('');
    s += vol(`<rect x="-10" y="${K.front}" width="${W + 20}" height="18" rx="4"/>`, '#D9CFBF', { shade: 'v', lineOpacity: 0.3 });
    s += `<rect y="${K.front + 18}" width="${W}" height="${556 - K.front - 18}" fill="#E8C9A0"/><rect y="${K.front + 18}" width="${W}" height="${556 - K.front - 18}" fill="url(#lpShadeV)" opacity=".35"/>${[280, 560, 840].map((x) => `<path d="M${x} ${K.front + 18}V556" stroke="#C9A27A" stroke-width="4"/>`).join('')}${[250, 310, 530, 590, 810, 870].map((x) => vol(`<rect x="${x - 14}" y="${K.front + 28}" width="28" height="7" rx="3.5"/>`, '#C9D1D9')).join('')}<rect y="550" width="${W}" height="8" fill="#B08A64"/>`;
    // the sink and its tap
    s += `<ellipse cx="978" cy="318" rx="104" ry="36" fill="#C9D3DC" stroke="${LP.INK}" stroke-opacity=".35" stroke-width="1.6"/><ellipse cx="978" cy="322" rx="90" ry="28" fill="#AEBBC6"/><ellipse cx="978" cy="326" rx="90" ry="28" fill="url(#lpShadeV)" opacity=".5"/><circle cx="978" cy="330" r="6" fill="#8A97A6"/>`;
    s += HOME.tapSvg(false).replace('width="100%" height="100%"', 'x="940" y="196" width="80" height="90"');
    // the plate in the middle of the counter
    s += `${LP.drop(642, 440, 214, 26)}${vol('<ellipse cx="642" cy="404" rx="200" ry="62"/>', '#FFFFFF')}<ellipse cx="642" cy="408" rx="150" ry="42" fill="#EEF2F5"/><path d="M500 382q140 -40 280 0" stroke="#fff" stroke-width="6" fill="none" opacity=".8" stroke-linecap="round"/>`;
    return s;
  };
  const kLumi = (o) => (st) => Object.assign({ x: 135, y: 562, h: 250, mood: st.done ? 'excited' : 'happy' }, o || {});
  // the jars on the shelf (the one in use is on the counter instead), the bread bag and the knife
  function kitchenThings(st, o) {
    const op = o || {};
    let h = '';
    FILLS.forEach((f, i) => {
      const inUse = st.data.fill === i && !st.data.jarBack;
      if (op.jarDrag === i) return;
      if (!inUse) h += SX.at(JARS[i].x, JARS[i].y, 76, 92, SX.prop.lifeJar(f), { z: 2 });
      else if (op.jarSpot !== false) h += SX.at(JAR_C.x, JAR_C.y, JAR_C.w, JAR_C.h, SX.prop.lifeJar(f), { z: 3 });
    });
    if (op.bag !== false) h += SX.at(BAG.x, BAG.y, BAG.w, BAG.h, breadBag(), { z: 3 });
    if (op.knife !== false) h += st.data.knifeIn ? SX.at(916, 300, 120, 26, SX.prop.lifeKnife(), { z: 2, style: 'opacity:.85' }) : SX.at(KNIFE.x, KNIFE.y, KNIFE.w, KNIFE.h, SX.prop.lifeKnife(st.data.spread ? fillOf(st).c : ''), { z: 4 });
    if (op.crumbs !== false && st.data.cut && !st.data.wiped) h += SX.at(CRUMBS.x, CRUMBS.y, CRUMBS.w, CRUMBS.h, crumbs(), { z: 2 });
    return h;
  }
  const sliceAt = (s, o, extra) => SX.at(s.x, s.y, s.w, s.h, SX.prop.lifeSlice(o), Object.assign({ z: 3 }, extra || {}));
  const sandAt = (st, extra) => SX.at(SAND.x, SAND.y, SAND.w, SAND.h, cutSvg(fillOf(st), st.s.bites || 0), Object.assign({ z: 3 }, extra || {}));

  const sandwichSteps = [
    handsStep({
      id: 'hands',
      bg: 'lifeKitchenSink',
      text: 'Lumi is hungry. He will make a sandwich. First, wash hands.',
      need: 420,
      praise: 'Clean hands! Ready to make food.'
    }),
    {
      id: 'bread',
      bg: 'lifeKitchen',
      text: 'A sandwich needs two slices of bread.',
      task: (st) => (st.done ? '' : st.data.slices ? 'Now drag one more slice onto the plate.' : 'Drag a slice of bread onto the plate.'),
      lumi: kLumi(),
      enter(st) { st.data.slices = 0; st.data.fill = null; st.data.spread = false; st.data.top = false; st.data.cut = false; st.data.knifeIn = false; st.data.wiped = false; st.data.jarBack = false; },
      draw(st) {
        let h = kitchenThings(st);
        if (st.data.slices >= 1) h += sliceAt(SL);
        if (st.data.slices >= 2) h += sliceAt(SR);
        if (!st.done) {
          const slot = st.data.slices ? SR : SL;
          h += SX.at(slot.x, slot.y, slot.w, slot.h - 8, '<span class="ll-dash"></span>', { target: true, id: 'slot', label: 'On the plate', z: 2 });
          h += SX.at(404, 264, 130, 88, SX.prop.lifeSlice(), { cls: 'll-slice sx-drag', label: 'A slice of bread', z: 8 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ll-slice', '[data-id="slot"]', () => {
          st.data.slices += 1;
          SX.ok();
          if (st.data.slices >= 2) SX.done(st, 'Two slices on the plate!');
          else { SX.render(); SX.say('One slice. Now one more.'); }
          return true;
        }, { miss: () => SX.say('Put the bread on the plate.') });
      },
      auto(st) { st.data.slices = 2; SX.done(st, 'Two slices on the plate!'); },
      guide: (st) => (st.done ? null : { sel: '.ll-slice', to: '[data-id="slot"]', say: 'Drag the bread onto the plate.' })
    },
    {
      id: 'filling',
      bg: 'lifeKitchen',
      text: 'Now choose a filling. Any one is fine!',
      task: (st) => (st.done ? '' : 'Tap the filling Lumi likes.'),
      lumi: kLumi(),
      enter(st) { st.data.slices = 2; st.data.fill = null; },
      draw(st) {
        let h = kitchenThings(st) + sliceAt(SL) + sliceAt(SR);
        if (!st.done) h += SX.choices(FILLS.map((f) => ({ label: f.name, art: SX.prop.lifeJar(f) })), 'fill', { style: 'right:22px;top:18px;', cls: 'col ll-fills' });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'fill' || st.done) return;
        st.data.fill = Number(d.v);
        SX.ok();
        SX.done(st, `${fillOf(st).name}! Yum.`);
      },
      auto(st) { st.data.fill = 0; SX.done(st, `${fillOf(st).name}! Yum.`); },
      demo: () => ({ sel: '.sx-choice', tap: true }),
      guide: (st) => (st.done ? null : { sel: '.sx-choice', say: 'Tap a filling.' })
    },
    {
      id: 'spread',
      bg: 'lifeKitchen',
      text: (st) => `Spread the ${fillOf(st).name.toLowerCase()} on one slice, all over.`,
      task: (st) => (st.done ? '' : 'Rub the knife over the bread.'),
      lumi: kLumi(),
      enter(st) { st.data.slices = 2; if (st.data.fill == null) st.data.fill = 0; st.data.spread = false; st.s.need = 600; },
      draw(st) {
        const f = st.done ? 1 : Math.min(1, (st.s.rub || 0) / st.s.need);
        let h = kitchenThings(st, { knife: false }) + sliceAt(SL, { fill: fillOf(st), amt: f }, { cls: `ll-slotL ${st.done ? '' : 'ln-glow'}`, id: 'slotL', label: 'Spread here' }) + sliceAt(SR);
        if (!st.done) { h += SX.at(KNIFE.x - 40, KNIFE.y - 10, KNIFE.w + 20, KNIFE.h + 8, SX.prop.lifeKnife(fillOf(st).c), { cls: 'll-knife sx-drag', label: 'Knife', z: 8 }); h += bar(SL.x + 10, 268, 130, f); }
        else h += SX.at(KNIFE.x, KNIFE.y, KNIFE.w, KNIFE.h, SX.prop.lifeKnife(fillOf(st).c), { z: 4 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.scrub(box, '.ll-knife', {
          area: '.ll-slotL',
          need: st.s.need,
          progress(f) { box.querySelectorAll('.ll-spreadL').forEach((p) => { p.style.opacity = String(f); }); setBar(box, f); },
          full() { SX.say('All covered! Let go of the knife.'); },
          done() { st.data.spread = true; SX.done(st, 'Spread all over. Nice and even!'); },
          more: 'Keep spreading. Side to side.'
        });
      },
      auto(st) { st.data.spread = true; SX.done(st, 'Spread all over. Nice and even!'); },
      demo: () => ({ sel: '.ll-slotL', rub: true }),
      guide: (st) => (st.done ? null : { sel: '.ll-knife', say: 'Rub the knife over the bread.' })
    },
    {
      id: 'top',
      bg: 'lifeKitchen',
      text: 'Now put the other slice on top.',
      task: (st) => (st.done ? '' : 'Drag the plain slice onto the other slice.'),
      lumi: kLumi(),
      enter(st) { st.data.slices = 2; if (st.data.fill == null) st.data.fill = 0; st.data.spread = true; st.data.top = false; },
      draw(st) {
        let h = kitchenThings(st);
        if (!st.done) {
          h += sliceAt(SL, { fill: fillOf(st) }, { target: true, id: 'slotL', label: 'The slice with the filling' });
          h += sliceAt(SR, {}, { cls: 'll-top sx-drag', label: 'Plain slice', z: 8 });
        } else h += SX.at(SL.x, SL.y - 12, SL.w, 114, sandwichSvg(fillOf(st)), { z: 3 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ll-top', '[data-id="slotL"]', () => { st.data.top = true; SX.ok(); SX.done(st, 'A sandwich!'); return true; }, { miss: () => SX.say('Put it right on top of the other slice.') });
      },
      auto(st) { st.data.top = true; SX.done(st, 'A sandwich!'); },
      guide: (st) => (st.done ? null : { sel: '.ll-top', to: '[data-id="slotL"]', say: 'Drag the plain slice on top.' })
    },
    {
      id: 'cut',
      bg: 'lifeKitchen',
      text: 'Cut the sandwich in half. Go slowly and keep your fingers away from the blade.',
      task: (st) => (st.done ? '' : 'Move the knife along the dotted line.'),
      lumi: kLumi(),
      enter(st) { st.data.top = true; st.data.spread = true; if (st.data.fill == null) st.data.fill = 0; st.data.cut = false; st.s.need = 520; },
      draw(st) {
        let h = kitchenThings(st, { knife: false });
        if (!st.done) {
          h += SX.at(SAND.x, SAND.y + 6, SAND.w, Math.round((SAND.w * 114) / 150), sandwichSvg(fillOf(st)), { z: 3 });
          h += `<div class="ll-cutline" style="left:${SAND.x + 30}px;top:${SAND.y + 6 + Math.round(((CUTY + 6) * SAND.w) / 150)}px;width:${SAND.w - 60}px"></div>`;
          h += SX.at(SAND.x - 14, SAND.y + 44, SAND.w + 110, 72, '', { cls: 'll-cutzone', label: 'The dotted line', z: 5 });
          h += SX.at(830, 368, 210, 42, SX.prop.lifeKnife(), { cls: 'll-knife sx-drag', label: 'Knife', z: 8 });
          h += tip(300, 216, 'Fingers away from the blade', { icon: 'hand' });
          h += bar(SAND.x + 30, 268, 130, Math.min(1, (st.s.rub || 0) / st.s.need));
        } else {
          h += sandAt(st);
          h += SX.at(KNIFE.x, KNIFE.y, KNIFE.w, KNIFE.h, SX.prop.lifeKnife(), { z: 4 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.scrub(box, '.ll-knife', {
          area: '.ll-cutzone',
          need: st.s.need,
          progress(f) { setBar(box, f); const l = box.querySelector('.ll-cutline'); if (l) l.style.setProperty('--f', f.toFixed(2)); },
          full() { SX.say('Cut through! Let go of the knife.'); },
          done() { st.data.cut = true; SX.done(st, 'Cut in half. Careful and safe!'); },
          more: 'Slowly. Keep moving along the line.'
        });
      },
      auto(st) { st.data.cut = true; SX.done(st, 'Cut in half. Careful and safe!'); },
      demo: () => ({ sel: '.ll-cutzone', rub: true }),
      guide: (st) => (st.done ? null : { sel: '.ll-knife', say: 'Move the knife along the dotted line.' })
    },
    {
      id: 'sink',
      min: 2,
      bg: 'lifeKitchen',
      text: 'Time to clean up. The knife goes in the sink, to wash later.',
      task: (st) => (st.done ? '' : 'Drag the knife into the sink.'),
      lumi: kLumi(),
      enter(st) { st.data.cut = true; if (st.data.fill == null) st.data.fill = 0; st.data.knifeIn = false; },
      draw(st) {
        let h = kitchenThings(st, { knife: !!st.done }) + sandAt(st);
        if (!st.done) {
          h += SX.at(870, 278, 216, 86, '', { target: true, id: 'sink', cls: 'll-round', label: 'The sink', z: 2 });
          h += SX.at(KNIFE.x, KNIFE.y, KNIFE.w, KNIFE.h, SX.prop.lifeKnife(), { cls: 'll-knife sx-drag', label: 'Knife', z: 8 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ll-knife', '[data-id="sink"]', () => { st.data.knifeIn = true; SX.ok(); SX.done(st, 'In the sink. Safe and tidy.'); return true; }, { miss: () => SX.say('Put the knife in the sink.') });
      },
      auto(st) { st.data.knifeIn = true; SX.done(st, 'In the sink. Safe and tidy.'); },
      guide: (st) => (st.done ? null : { sel: '.ll-knife', to: '[data-id="sink"]', say: 'Drag the knife into the sink.' })
    },
    {
      id: 'wipe',
      min: 2,
      bg: 'lifeKitchen',
      text: 'There are crumbs on the counter. Wipe them away.',
      task: (st) => (st.done ? '' : 'Rub the cloth over the crumbs.'),
      lumi: kLumi(),
      enter(st) { st.data.cut = true; st.data.knifeIn = true; if (st.data.fill == null) st.data.fill = 0; st.data.wiped = false; st.s.need = 480; },
      draw(st) {
        const f = st.done ? 1 : Math.min(1, (st.s.rub || 0) / st.s.need);
        let h = kitchenThings(st, { crumbs: false }) + sandAt(st);
        if (!st.done) {
          h += SX.at(CRUMBS.x, CRUMBS.y, CRUMBS.w, CRUMBS.h, `<div class="ll-crumbin" style="opacity:${(1 - f).toFixed(2)}">${crumbs()}</div>`, { cls: 'll-crumbs ln-glow', label: 'Crumbs', z: 3 });
          h += SX.at(880, 400, 124, 72, cloth(), { cls: 'll-cloth sx-drag', label: 'Cloth', z: 8 });
          h += bar(CRUMBS.x + 10, CRUMBS.y + CRUMBS.h + 4, 130, f);
        } else h += SX.at(900, 420, 110, 64, cloth(), { z: 3 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.scrub(box, '.ll-cloth', {
          area: '.ll-crumbs',
          need: st.s.need,
          progress(f) { const c = box.querySelector('.ll-crumbin'); if (c) c.style.opacity = String(1 - f); setBar(box, f); },
          full() { SX.say('All clean! Let go of the cloth.'); },
          done() { st.data.wiped = true; SX.done(st, 'A clean counter!'); },
          more: 'Keep wiping.'
        });
      },
      auto(st) { st.data.wiped = true; SX.done(st, 'A clean counter!'); },
      demo: () => ({ sel: '.ll-crumbs', rub: true }),
      guide: (st) => (st.done ? null : { sel: '.ll-cloth', say: 'Rub the cloth over the crumbs.' })
    },
    {
      id: 'putaway',
      min: 3,
      bg: 'lifeKitchen',
      text: (st) => `Close the ${fillOf(st).name.toLowerCase()} jar and put it back on the shelf.`,
      task: (st) => (st.done ? '' : 'Drag the jar to its place on the shelf.'),
      lumi: kLumi(),
      enter(st) { st.data.cut = true; st.data.knifeIn = true; st.data.wiped = true; if (st.data.fill == null) st.data.fill = 0; st.data.jarBack = false; },
      draw(st) {
        const i = st.data.fill;
        let h = kitchenThings(st, { jarDrag: st.done ? null : i }) + sandAt(st);
        if (!st.done) {
          h += SX.at(JARS[i].x - 8, JARS[i].y - 8, 92, 106, '<span class="ll-dash"></span>', { target: true, id: 'shelf', label: 'The jar\'s place on the shelf', z: 2 });
          h += SX.at(JAR_C.x - 6, JAR_C.y - 6, JAR_C.w + 12, JAR_C.h + 12, SX.prop.lifeJar(fillOf(st)), { cls: 'll-jar sx-drag', label: 'Jar', z: 8 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ll-jar', '[data-id="shelf"]', () => { st.data.jarBack = true; SX.ok(); SX.done(st, 'Back on the shelf. All tidy!'); return true; }, { miss: () => SX.say('Put the jar on the shelf, in the empty place.') });
      },
      auto(st) { st.data.jarBack = true; SX.done(st, 'Back on the shelf. All tidy!'); },
      guide: (st) => (st.done ? null : { sel: '.ll-jar', to: '[data-id="shelf"]', say: 'Drag the jar to the shelf.' })
    },
    {
      id: 'enjoy',
      bg: 'lifeKitchen',
      text: 'The sandwich is ready. Lumi made it himself!',
      task: (st) => (st.done ? '' : 'Tap the sandwich to take a bite.'),
      lumi: kLumi(),
      enter(st) { st.data.cut = true; if (st.data.fill == null) st.data.fill = 0; st.s.bites = 0; },
      draw(st) {
        let h = kitchenThings(st) + SX.at(SAND.x, SAND.y, SAND.w, SAND.h, cutSvg(fillOf(st), st.s.bites), { k: st.done ? null : 'bite', label: 'Take a bite', cls: st.done ? '' : 'll-bite', z: 3 });
        if (st.s.bites > 0) h += SX.bubble(54, 254, st.done ? 'Yummy!' : 'Yum!', { w: 130, tail: 'down' });
        return h;
      },
      tap(st, k) {
        if (k !== 'bite' || st.done) return;
        st.s.bites += 1;
        tone(520 + st.s.bites * 80, 0.12, 0.05);
        if (st.s.bites >= 3) { SX.done(st, 'Yum! Lumi made his own sandwich.'); return; }
        SX.render();
        SX.say(['Yum!', 'Crunch, munch.'][st.s.bites - 1]);
      },
      auto(st) { st.s.bites = 3; SX.done(st, 'Yum! Lumi made his own sandwich.'); },
      demo: () => ({ sel: '[data-k="bite"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="bite"]', say: 'Tap the sandwich.' })
    }
  ];
  SX.lessonWithLevels({ tut: 'sandwich', realText: 'Make a sandwich with a grown-up nearby. Go slowly with the knife.', realSay: 'made a sandwich' }, sandwichSteps);

  // ================================================================ DO THE LAUNDRY (teen)
  const CLOTHES = {
    wtee: { id: 'wtee', name: 'white T-shirt', kind: 'tee', c: '#FFFFFF', light: true },
    jeans: { id: 'jeans', name: 'black jeans', kind: 'jeans', c: '#3A3F4A', light: false },
    towel: { id: 'towel', name: 'yellow towel', kind: 'towel', c: '#FFE29A', light: true },
    ntee: { id: 'ntee', name: 'navy T-shirt', kind: 'tee', c: '#2E4A7A', light: false },
    shirt: { id: 'shirt', name: 'light blue shirt', kind: 'shirt', c: '#CFE6F7', light: true, min: 2 },
    socks: { id: 'socks', name: 'dark socks', kind: 'socks', c: '#4A4F57', light: false, min: 2 }
  };
  const ORDER = ['wtee', 'jeans', 'towel', 'ntee', 'shirt', 'socks'];
  const sortList = () => ORDER.map((id) => CLOTHES[id]).filter((c) => !c.min || c.min <= A.level());
  const lightsList = () => sortList().filter((c) => c.light);
  // clothes drawn on a 120 x 112 grid (o.pegs: hanging on the rack; o.wet: drops)
  function clothMarkup(c, o) {
    const op = o || {};
    const ln = '#3B2F2F';
    let s = '';
    if (c.kind === 'tee' || c.kind === 'shirt') {
      s += vol('<path d="M36 12L50 6Q60 14 70 6L84 12L112 34L98 52L88 44V102Q88 106 84 106H36Q32 106 32 102V44L22 52L8 34Z"/>', c.c, { lineOpacity: 0.5 });
      s += `<path d="M50 6Q60 18 70 6" fill="none" stroke="${ln}" stroke-opacity=".4" stroke-width="2"/>`;
      if (c.kind === 'shirt') s += `${vol('<path d="M50 6L60 22L52 26L44 10zM70 6L60 22L68 26L76 10z"/>', '#FFFFFF', { lineOpacity: 0.4 })}<path d="M60 22V102" stroke="${ln}" stroke-opacity=".3" stroke-width="2"/>${[40, 58, 76, 94].map((y) => `<circle cx="60" cy="${y}" r="2.6" fill="#8A97A6"/>`).join('')}${vol('<rect x="68" y="40" width="16" height="16" rx="3"/>', c.c, { lineOpacity: 0.45 })}`;
    } else if (c.kind === 'towel') {
      s += vol('<rect x="18" y="8" width="84" height="98" rx="8"/>', c.c, { lineOpacity: 0.5 }) + '<path d="M18 80H102M18 90H102" stroke="#fff" stroke-width="5"/><path d="M18 20H102" stroke="#F4C24A" stroke-width="3" opacity=".6"/>';
    } else if (c.kind === 'jeans') {
      s += vol('<path d="M30 8H90L98 104H68L60 44L52 104H22Z"/>', c.c, { lineOpacity: 0.5 }) + '<path d="M30 18H90" stroke="#5A6070" stroke-width="3"/><path d="M60 18V44" stroke="#5A6070" stroke-width="2"/><path d="M36 22q8 10 16 0M68 22q8 10 16 0" fill="none" stroke="#C9A66B" stroke-width="2"/>';
    } else {
      s += vol('<path d="M24 8H48V64Q48 72 56 76L70 84Q80 90 74 98Q68 106 58 100L30 84Q24 80 24 72Z"/><path d="M62 8H86V64Q86 72 94 76L104 82Q112 88 106 96Q100 104 92 98L68 84Q62 80 62 72Z"/>', c.c, { lineOpacity: 0.5 }) + '<path d="M24 16H48M62 16H86" stroke="#8A97A6" stroke-width="3"/>';
    }
    if (op.pegs) s += [44, 76].map((x) => vol(`<rect x="${x - 5}" y="-4" width="10" height="22" rx="3"/>`, '#E58BA6', { lineOpacity: 0.4 })).join('');
    if (op.wet) s += [[40, 70], [80, 64], [58, 92]].map(([x, y]) => `<path d="M${x} ${y - 7}c-3 5-5 7-5 10a5 5 0 0 0 10 0c0-3-2-5-5-10z" fill="#9AD3F5" stroke="#4E9BD0" stroke-width="1.4"/>`).join('');
    return s;
  }
  SX.prop.lifeCloth = (c, o) => svg('0 0 120 112', `${o && o.pegs ? '' : LP.drop(60, 108, 44, 4)}${clothMarkup(c, o)}`);
  // a plastic laundry basket with clothes peeking out (ids)
  SX.prop.lifeBasket = (colour, ids) => {
    const peek = (ids || []).map((id, i) => `<g transform="translate(${18 + i * 34} ${-12 + (i % 2) * 8}) scale(.5)">${clothMarkup(CLOTHES[id])}</g>`).join('');
    const holes = [0, 1, 2].map((r) => [0, 1, 2, 3, 4, 5].map((c) => `<rect x="${34 + c * 20 - r * 1.5}" y="${66 + r * 22}" width="11" height="13" rx="3" fill="#000" opacity=".16"/>`).join('')).join('');
    return svg('0 0 180 150', `${LP.drop(90, 144, 82, 8)}${peek}${vol('<path d="M10 40H170L156 138Q154 146 146 146H34Q26 146 24 138Z"/>', colour, { shade: 'h' })}${holes}${vol('<rect x="4" y="32" width="172" height="16" rx="8"/>', colour)}<rect x="66" y="52" width="48" height="10" rx="5" fill="#000" opacity=".18"/>`);
  };
  const hamper = (n) => svg('0 0 180 200', `${LP.drop(90, 194, 80, 8)}${['#E58BA6', '#2E4A7A', '#FFE29A', '#CFE6F7', '#3A3F4A', '#FFFFFF'].slice(0, Math.max(0, n)).map((c, i) => `<ellipse cx="${46 + (i % 3) * 44}" cy="${34 - Math.floor(i / 3) * 12}" rx="32" ry="18" fill="${c}" stroke="#3B2F2F" stroke-opacity=".35" stroke-width="1.6"/>`).join('')}
    ${vol('<path d="M14 36H166L152 186Q150 194 142 194H38Q30 194 28 186Z"/>', '#D9B98A', { shade: 'h' })}${[60, 86, 112, 138, 164].map((y) => `<path d="M${18 + (y - 36) * 0.09} ${y}H${162 - (y - 36) * 0.09}" stroke="#B8945E" stroke-width="3"/>`).join('')}${[40, 68, 96, 124, 152].map((x) => `<path d="M${x} 40V190" stroke="#B8945E" stroke-width="2" opacity=".6"/>`).join('')}${vol('<rect x="8" y="30" width="164" height="14" rx="7"/>', '#C9A36A')}`);
  // the front-loading washing machine; o: { open, drawer, soap, clothes: [colours], spin, water, display }
  function machineSvg(o) {
    const op = o || {};
    const cx = 120;
    const cy = 160;
    const blobs = (op.clothes || []).map((c, i) => { const a = i * 2.2 + 0.6; const x = cx + Math.cos(a) * 22; const y = cy + 18 + Math.sin(a) * 12; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="30" ry="17" fill="${c}" stroke="#3B2F2F" stroke-opacity=".3" stroke-width="1.5" transform="rotate(${i * 50} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('');
    let s = `${LP.drop(120, 268, 118, 9)}${vol('<rect x="6" y="4" width="228" height="258" rx="20"/>', '#F8FAFC', { shade: 'h' })}<rect x="6" y="58" width="228" height="3" fill="#D5DDE5"/>
      <rect x="122" y="18" width="62" height="28" rx="6" fill="#2F3B48"/>${op.display ? T(153, 40, op.display, 18, '#8FF0B0') : ''}
      ${vol('<circle cx="208" cy="32" r="16"/>', '#DDE3E9')}<path d="M208 32l-8 -9" stroke="#3E5463" stroke-width="4" stroke-linecap="round"/>`;
    s += op.drawer ? `${vol('<rect x="-22" y="12" width="104" height="38" rx="6"/>', '#E3E8ED')}<rect x="-14" y="18" width="40" height="24" rx="4" fill="#B9C6D2"/><rect x="32" y="18" width="40" height="24" rx="4" fill="#B9C6D2"/>${op.soap ? '<rect x="-12" y="30" width="36" height="10" rx="3" fill="#3E8FD0" opacity=".85"/>' : ''}`
      : `${vol('<rect x="16" y="14" width="84" height="34" rx="6"/>', '#EEF2F5', { lineOpacity: 0.4 })}<path d="M30 40h56" stroke="#9AA6B2" stroke-width="4" stroke-linecap="round"/>`;
    const inside = `<circle cx="${cx}" cy="${cy}" r="62" fill="#4A5866"/><circle cx="${cx}" cy="${cy}" r="56" fill="#8A97A6"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${(cx + Math.cos(i * 0.785) * 40).toFixed(1)}" cy="${(cy + Math.sin(i * 0.785) * 40).toFixed(1)}" r="3.5" fill="#5D6B78"/>`).join('')}`;
    if (op.open) {
      s += `<circle cx="${cx}" cy="${cy}" r="76" fill="#E3E8ED" stroke="#3B2F2F" stroke-opacity=".35" stroke-width="1.6"/>${inside}<g>${blobs}</g>`;
      s += `<ellipse cx="18" cy="${cy}" rx="30" ry="82" fill="#C9D1D9" stroke="#3B2F2F" stroke-opacity=".4" stroke-width="1.6"/><ellipse cx="18" cy="${cy}" rx="19" ry="62" fill="#9FB8C8"/><ellipse cx="18" cy="${cy}" rx="19" ry="62" fill="url(#lpGlass)"/>`;
    } else {
      s += `<defs><clipPath id="llDrum"><circle cx="${cx}" cy="${cy}" r="60"/></clipPath></defs><circle cx="${cx}" cy="${cy}" r="80" fill="url(#lpMetal)" stroke="#3B2F2F" stroke-opacity=".4" stroke-width="1.6"/>
        <g clip-path="url(#llDrum)">${inside}${op.water ? `<rect x="${cx - 62}" y="${cy + 8}" width="124" height="60" fill="#7FC4E8" opacity=".75"/>` : ''}<g class="${op.spin ? 'll-spin' : ''}">${blobs}</g>${op.water ? `<path d="M${cx - 62} ${cy + 8}q15 -8 31 0t31 0t31 0t31 0" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>` : ''}</g>
        <circle cx="${cx}" cy="${cy}" r="60" fill="#9FB8C8" opacity=".25"/><circle cx="${cx}" cy="${cy}" r="60" fill="url(#lpGlass)"/><circle cx="${cx}" cy="${cy}" r="60" fill="none" stroke="#3B2F2F" stroke-opacity=".35" stroke-width="2"/>
        ${vol(`<rect x="${cx + 70}" y="${cy - 20}" width="14" height="40" rx="6"/>`, '#C9D1D9')}`;
    }
    s += '<rect x="18" y="250" width="30" height="14" rx="4" fill="#9AA6B2"/><rect x="192" y="250" width="30" height="14" rx="4" fill="#9AA6B2"/>';
    return svg('0 0 240 270', s);
  }
  const MACH = { x: 236, y: 190, w: 240, h: 270 };
  const DOORC = { x: MACH.x + 120, y: MACH.y + 160 };
  const LB = { x: 728, y: 380, w: 170, h: 150 };
  const DB = { x: 914, y: 380, w: 170, h: 150 };
  const HAMP = { x: 500, y: 336, w: 180, h: 200 };
  const CAB = { x: 560, y: 340, w: 230, h: 124 };
  const BOT = { x: 584, y: 190, w: 104, h: 152 };
  const CAP = { x: 694, y: 270, w: 80, h: 74 };
  const RACK = { x: 640, y: 112, w: 440, h: 356 };
  const SPOTS = [{ x: 676, y: 150 }, { x: 806, y: 150 }, { x: 936, y: 150 }];
  const yLumi = (o) => (st) => Object.assign({ x: 128, y: 556, h: 214, mood: st.done ? 'excited' : 'happy' }, o || {});
  const lightsCols = (st) => (st.data.lights && st.data.lights.length ? st.data.lights : lightsList().map((c) => c.id)).map((id) => CLOTHES[id].c);
  const machineEl = (o, extra) => SX.at(MACH.x, MACH.y, MACH.w, MACH.h, machineSvg(o), Object.assign({ z: 2, cls: 'll-machine' }, extra || {}));
  const basketEl = (id, b, ids, o) => SX.at(b.x, b.y, b.w, b.h, SX.prop.lifeBasket(id === 'darks' ? '#5A6270' : '#EEF2F5', ids), Object.assign({ z: 4, id, cls: 'll-basket', label: id === 'darks' ? 'Darks basket' : 'Lights basket' }, o || {}));
  const tag = (b, light, text) => `<div class="ll-tag" style="left:${b.x + b.w / 2}px;top:${b.y - 46}px"><i class="ll-sw ${light ? 'light' : 'dark'}"></i><span>${esc(text)}</span></div>`;
  const cabinet = () => SX.at(CAB.x, CAB.y, CAB.w, CAB.h, svg(`0 0 ${CAB.w} ${CAB.h}`, `${LP.drop(CAB.w / 2, CAB.h - 4, CAB.w / 2, 8)}${vol(`<rect x="4" y="10" width="${CAB.w - 8}" height="${CAB.h - 16}" rx="8"/>`, '#BFD8E8', { shade: 'v' })}${vol(`<rect x="0" y="2" width="${CAB.w}" height="14" rx="5"/>`, '#E3EEF5')}<path d="M${CAB.w / 2} 22V${CAB.h - 12}" stroke="#9FBCD0" stroke-width="3"/>${[CAB.w / 2 - 18, CAB.w / 2 + 18].map((x) => `<rect x="${x - 3}" y="50" width="6" height="24" rx="3" fill="#8A97A6"/>`).join('')}`), { z: 2 });
  const bottle = () => svg('0 0 104 152', `${LP.drop(52, 148, 44, 5)}${vol('<path d="M20 40Q20 30 30 30H70Q84 30 86 44L92 132Q92 146 78 146H24Q12 146 12 132Z"/>', '#4FA3D9', { shade: 'h' })}<path d="M70 44Q84 44 84 60V84Q84 92 76 92" fill="none" stroke="#2F7FB5" stroke-width="7" opacity=".6"/>
    ${vol('<rect x="26" y="70" width="46" height="50" rx="10"/>', '#FFFFFF', { lineOpacity: 0.3 })}<path d="M49 78c-8 11-12 16-12 22a12 12 0 0 0 24 0c0-6-4-11-12-22z" fill="#4FA3D9"/><path d="M43 101a7 7 0 0 0 6 6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M64 80l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#8EC5F2"/>
    ${vol('<rect x="30" y="12" width="34" height="20" rx="5"/>', '#2F7FB5')}${vol('<path d="M64 16h18l6 6h-24z"/>', '#2F7FB5')}`);
  const capSvg = (p) => svg('0 0 80 74', `${LP.drop(40, 70, 30, 4)}<defs><clipPath id="llCapIn"><path d="M14 14H66L60 66H20Z"/></clipPath></defs>
    <path d="M14 14H66L60 66H20Z" fill="#D7EEF8" stroke="#3B2F2F" stroke-opacity=".45" stroke-width="1.6"/>
    <g clip-path="url(#llCapIn)"><rect class="ll-capfill" x="10" y="${66 - 40 * p}" width="60" height="${40 * p + 2}" fill="#3E8FD0" opacity=".85"/></g>
    <path d="M17 26H63" stroke="#E5534B" stroke-width="3" stroke-dasharray="6 4"/><path d="M66 26l8 -5v10z" fill="#E5534B"/>
    <path d="M14 14H66L60 66H20Z" fill="url(#lpGlass)"/>`);
  const RACKBARS = [156, 296];
  const rackEl = () => SX.at(RACK.x, RACK.y, RACK.w, RACK.h, svg(`0 0 ${RACK.w} ${RACK.h}`, `${LP.drop(RACK.w / 2, RACK.h - 4, RACK.w / 2 - 10, 10)}
    ${[[20, 64], [RACK.w - 20, RACK.w - 64]].map(([a, b]) => `<path d="M${a} ${RACK.h - 8}L${(a + b) / 2} 30L${b} ${RACK.h - 8}" fill="none" stroke="#9AA6B2" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M${a} ${RACK.h - 8}L${(a + b) / 2} 30L${b} ${RACK.h - 8}" fill="none" stroke="url(#lpMetal)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    ${RACKBARS.map((y) => `<path d="M30 ${y - RACK.y}H${RACK.w - 30}" stroke="#8A97A6" stroke-width="12" stroke-linecap="round"/><path d="M30 ${y - RACK.y}H${RACK.w - 30}" stroke="url(#lpMetal)" stroke-width="8" stroke-linecap="round"/>`).join('')}`), { z: 2 });
  const hungEl = (c, i, o) => SX.at(SPOTS[i].x, SPOTS[i].y, 120, 112, SX.prop.lifeCloth(c, Object.assign({ pegs: true }, o || {})), Object.assign({ z: 3 }, (o && o.extra) || {}));
  SX.bg.lifeYard = () => {
    let s = `<rect width="${W}" height="${H}" fill="#F1EEE6"/><rect y="200" width="${W}" height="252" fill="#E2E9ED"/>`;
    for (let x = 0; x <= W; x += 56) s += `<path d="M${x} 200V452" stroke="#FFFFFF" stroke-width="3"/>`;
    for (let y = 200; y <= 452; y += 56) s += `<path d="M0 ${y}H${W}" stroke="#FFFFFF" stroke-width="3"/>`;
    s += `<rect width="${W}" height="452" fill="url(#lpShadeV)" opacity=".15"/>`;
    s += HOME.lifeWindow(662, 40, 400, 210, { grille: true });
    s += `<path d="M600 0V452" stroke="#C9D1D9" stroke-width="18"/><path d="M600 0V452" stroke="url(#lpMetal)" stroke-width="12"/>${[90, 300].map((y) => `<rect x="588" y="${y}" width="24" height="12" rx="3" fill="#B9C3CC"/>`).join('')}`;
    s += `${vol('<rect x="318" y="96" width="34" height="22" rx="6"/>', '#C9D1D9')}${vol('<rect x="308" y="86" width="22" height="10" rx="4"/>', '#4FB3A9')}<path d="M352 108q40 0 40 40v44" fill="none" stroke="#9AA6B2" stroke-width="10" stroke-linecap="round"/>`;
    s += floor(452, '#D7D1C4', '#BFB7A6');
    s += `<rect x="520" y="500" width="70" height="40" rx="6" fill="#B9B2A3"/>${[0, 1, 2, 3].map((i) => `<path d="M${530 + i * 16} 506v28" stroke="#8F887A" stroke-width="4" stroke-linecap="round"/>`).join('')}`;
    return s;
  };

  const laundrySteps = [
    {
      id: 'sort',
      bg: 'lifeYard',
      text: 'Before washing, sort the clothes. Light colours go in one basket, dark colours in the other.',
      task: (st) => {
        if (st.done) return '';
        const cur = sortList()[st.s.i];
        if (!cur) return '';
        return A.level() < 2 ? `Drag the ${cur.name} to the ${cur.light ? 'Lights' : 'Darks'} basket.` : `Is the ${cur.name} light or dark? Drag it to its basket.`;
      },
      lumi: yLumi(),
      enter(st) { st.s.i = 0; st.s.tip = null; st.data.lights = []; st.data.darks = []; },
      draw(st) {
        const list = sortList();
        const cur = list[st.s.i];
        let h = machineEl({}) + SX.at(HAMP.x, HAMP.y, HAMP.w, HAMP.h, hamper(list.length - st.s.i - (cur ? 1 : 0)), { z: 3 });
        h += basketEl('lights', LB, st.data.lights, { target: !st.done }) + basketEl('darks', DB, st.data.darks, { target: !st.done });
        h += tag(LB, true, 'Lights') + tag(DB, false, 'Darks');
        if (cur && !st.done) h += SX.at(HAMP.x + 20, HAMP.y - 96, 140, 130, SX.prop.lifeCloth(cur), { cls: 'll-item sx-drag', label: cur.name, z: 8 });
        if (st.s.tip && !st.done) { const b = st.s.tip === 'lights' ? LB : DB; h += SX.bubble(b.x - 30, b.y - 140, st.s.tip === 'lights' ? 'Light colours go here.' : 'Dark colours go here.', { w: 220 }); }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        const cur = sortList()[st.s.i];
        if (!cur) return;
        SX.dragTo(box, '.ll-item', '.ll-basket', (t) => {
          const want = cur.light ? 'lights' : 'darks';
          if (t.dataset.id !== want) {
            st.s.tip = want;
            SX.say(`The ${cur.name} is ${cur.light ? 'light' : 'dark'}. It goes in the ${cur.light ? 'Lights' : 'Darks'} basket.`);
            SX.render();
            return false;
          }
          st.s.tip = null;
          st.data[want].push(cur.id);
          st.s.i += 1;
          SX.ok();
          if (st.s.i >= sortList().length) SX.done(st, 'All sorted! Lights and darks.');
          else { SX.render(); SX.say(`Good. Now the ${sortList()[st.s.i].name}.`); }
          return true;
        }, { miss: () => SX.say('Put it in a basket.') });
      },
      auto(st) {
        st.data.lights = sortList().filter((c) => c.light).map((c) => c.id);
        st.data.darks = sortList().filter((c) => !c.light).map((c) => c.id);
        st.s.i = sortList().length;
        st.s.tip = null;
        SX.done(st, 'All sorted! Lights and darks.');
      },
      guide: (st) => {
        const cur = sortList()[st.s.i];
        if (st.done || !cur) return null;
        return { sel: '.ll-item', to: `[data-id="${cur.light ? 'lights' : 'darks'}"]`, say: `Drag it to the ${cur.light ? 'Lights' : 'Darks'} basket.` };
      }
    },
    {
      id: 'pockets',
      min: 3,
      bg: 'lifeYard',
      text: 'Check the pockets first. A tissue in the wash makes a big mess!',
      task: (st) => (st.done ? '' : 'Tap the shirt pocket to check it.'),
      lumi: yLumi(),
      enter(st) { if (!st.data.lights || !st.data.lights.length) st.data.lights = lightsList().map((c) => c.id); st.data.darks = st.data.darks || []; },
      draw(st) {
        let h = machineEl({}) + basketEl('lights', LB, st.data.lights) + basketEl('darks', DB, st.data.darks) + tag(LB, true, 'Lights') + tag(DB, false, 'Darks');
        h += SX.at(CAB.x - 176, 24, 342, 306, '', { z: 5, cls: 'll-zoom' }) + SX.at(CAB.x - 150, 44, 290, 270, SX.prop.lifeCloth(CLOTHES.shirt), { z: 6, cls: 'll-bigshirt' });
        if (!st.done) h += SX.at(CAB.x - 150 + 118, 44 + 68, 110, 96, '', { k: 'pocket', label: 'The shirt pocket', cls: 'll-pocket ln-glow', z: 7 });
        else {
          h += SX.at(CAB.x - 150 + 150, 44 + 26, 90, 70, svg('0 0 90 70', `${vol('<path d="M14 40Q8 22 26 18Q34 4 50 12Q68 6 72 24Q86 30 78 46Q76 62 56 58Q40 68 28 58Q10 58 14 40Z"/>', '#FFFFFF')}<path d="M30 30q10 8 22 0M40 44q8 6 18 -2" stroke="#C9D1D9" stroke-width="2.4" fill="none"/>`), { z: 8 });
          h += SX.bubble(CAB.x + 120, 60, 'A tissue!', { w: 130, tail: 'left' });
        }
        return h;
      },
      tap(st, k) { if (k === 'pocket' && !st.done) { tone(880, 0.15, 0.05); SX.done(st, 'Found a tissue! Good thing Lumi checked.'); } },
      auto(st) { SX.done(st, 'Found a tissue! Good thing Lumi checked.'); },
      demo: () => ({ sel: '[data-k="pocket"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="pocket"]', say: 'Tap the pocket.' })
    },
    {
      id: 'load',
      bg: 'lifeYard',
      text: 'Wash one basket at a time. Today Lumi washes the light clothes.',
      task: (st) => (st.done ? '' : 'Drag the Lights basket to the washing machine.'),
      lumi: yLumi(),
      enter(st) { if (!st.data.lights || !st.data.lights.length) st.data.lights = lightsList().map((c) => c.id); st.data.darks = st.data.darks && st.data.darks.length ? st.data.darks : sortList().filter((c) => !c.light).map((c) => c.id); st.data.loaded = false; },
      draw(st) {
        let h = machineEl({ open: true, clothes: st.done ? lightsCols(st) : [] }) + basketEl('darks', DB, st.data.darks) + tag(DB, false, 'Darks: next time');
        if (!st.done) {
          h += SX.at(DOORC.x - 92, DOORC.y - 92, 184, 184, '', { target: true, id: 'drum', cls: 'll-round', label: 'Inside the washing machine', z: 3 });
          h += basketEl('lights', LB, st.data.lights, { cls: 'll-basket ll-lbasket sx-drag', z: 8 }) + tag(LB, true, 'Lights');
        } else h += basketEl('lights', { x: 520, y: 400, w: 150, h: 132 }, []);
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.ll-lbasket', '[data-id="drum"]', () => { st.data.loaded = true; SX.ok(); SX.done(st, 'In they go! The clothes are in the machine.'); return true; }, { miss: () => SX.say('Bring the basket to the round door.') });
      },
      auto(st) { st.data.loaded = true; SX.done(st, 'In they go! The clothes are in the machine.'); },
      guide: (st) => (st.done ? null : { sel: '.ll-lbasket', to: '[data-id="drum"]', say: 'Drag the Lights basket to the machine.' })
    },
    {
      id: 'soap',
      bg: 'lifeYard',
      text: 'Now the soap. Lumi needs one cap of liquid detergent.',
      task: (st) => (st.done ? '' : !st.s.full ? 'Press and hold the bottle. Fill the cap to the red line.' : 'Drag the cap to the soap drawer.'),
      lumi: yLumi(),
      enter(st) { st.data.loaded = true; st.s.p = 0; st.s.full = false; },
      draw(st) {
        let h = machineEl({ open: true, clothes: lightsCols(st), drawer: true, soap: st.done }) + cabinet();
        h += SX.at(BOT.x, BOT.y, BOT.w, BOT.h, `<div class="ll-bottle-in">${bottle()}</div>`, { cls: `ll-hold ${st.s.full ? '' : 'll-holdme'}`, label: 'Detergent bottle: press and hold', z: 6 });
        h += `<div class="ll-pour" style="left:${CAP.x + 34}px;top:${BOT.y + 34}px;height:${CAP.y - BOT.y - 20}px"></div>`;
        if (!st.done) {
          h += SX.at(CAP.x, CAP.y, CAP.w, CAP.h, capSvg(st.s.p || 0), { cls: `ll-cap ${st.s.full ? 'sx-drag sx-glow' : ''}`, label: 'Measuring cap', z: 8 });
          if (st.s.full) h += SX.at(MACH.x - 34, MACH.y - 6, 150, 72, '', { target: true, id: 'drawer', cls: 'll-drawer ln-glow', label: 'The soap drawer', z: 4 });
          else h += tip(CAP.x + 90, CAP.y - 6, 'Up to the line', { cls: 'll-tipsmall' });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        if (!st.s.full) {
          holdToFill(st, box, box.querySelector('.ll-hold'), {
            cls: 'll-pouring',
            progress(p) { const f = box.querySelector('.ll-capfill'); if (f) { f.setAttribute('y', String(66 - 40 * p)); f.setAttribute('height', String(40 * p + 2)); } },
            full() { SX.render(); SX.say('Stop! Up to the line. Now pour it into the soap drawer.'); }
          });
          return;
        }
        SX.dragTo(box, '.ll-cap', '[data-id="drawer"]', () => { st.data.soap = true; SX.ok(); SX.done(st, 'One cap of soap. Just right!'); return true; }, { miss: () => SX.say('Pour it into the drawer at the top of the machine.') });
      },
      auto(st) { st.s.p = 1; st.s.full = true; st.data.soap = true; SX.done(st, 'One cap of soap. Just right!'); },
      demo: (st) => (!st.s.full ? { sel: '.ll-hold', tap: true } : { sel: '.ll-cap', to: '[data-id="drawer"]' }),
      guide: (st) => (st.done ? null : !st.s.full ? { sel: '.ll-hold', say: 'Press and hold the bottle.' } : { sel: '.ll-cap', to: '[data-id="drawer"]', say: 'Drag the cap to the soap drawer.' })
    },
    {
      id: 'door',
      bg: 'lifeYard',
      text: 'Close the drawer and the door, until it clicks.',
      task: (st) => (st.done ? '' : 'Tap the door to close it.'),
      lumi: yLumi(),
      draw(st) {
        let h = machineEl({ open: !st.done, clothes: lightsCols(st) }) + cabinet() + SX.at(BOT.x, BOT.y, BOT.w, BOT.h, bottle(), { z: 3 });
        if (!st.done) h += SX.at(MACH.x - 30, DOORC.y - 96, 230, 192, '', { k: 'door', label: 'Close the door', cls: 'll-doorhit ln-glow', z: 4 });
        else h += SX.bubble(MACH.x + 150, MACH.y - 80, 'Click!', { w: 100, tail: 'down' });
        return h;
      },
      tap(st, k) { if (k === 'door' && !st.done) { tone(240, 0.08, 0.06); setTimeout(() => tone(520, 0.08, 0.05), 90); SX.done(st, 'Click! The door is shut.'); } },
      auto(st) { SX.done(st, 'Click! The door is shut.'); },
      demo: () => ({ sel: '[data-k="door"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="door"]', say: 'Tap the door to close it.' })
    },
    {
      id: 'start',
      bg: 'lifeYard',
      text: 'Choose the wash on the control panel. Normal is for everyday clothes.',
      task: (st) => (st.done ? '' : !st.s.prog ? 'Tap Normal.' : 'Now press Start.'),
      lumi: yLumi(),
      enter(st) { st.s.prog = null; st.s.hint = null; },
      draw(st) {
        const PROGS = [{ id: 'quick', name: 'Quick', time: '30 min', icon: 'clock' }, { id: 'normal', name: 'Normal', time: '45 min', icon: 'shirt' }, { id: 'heavy', name: 'Heavy', time: '60 min', icon: 'towel' }];
        let h = machineEl({ clothes: lightsCols(st), water: st.done, spin: st.done, display: st.s.prog ? '45' : '' });
        const scr = st.done ? 'Washing...' : st.s.prog ? 'Normal  45 min' : 'Choose a wash';
        h += `<div class="ll-panel" style="left:556px;top:30px"><div class="ll-panel-top"><span class="ll-screen">${esc(scr)}</span></div>
          <div class="ll-progs">${PROGS.map((p) => `<button class="ll-prog ${st.s.prog === p.id ? 'on' : ''} ${st.s.hint === p.id ? 'nudge' : ''}" data-a="sx" data-k="prog" data-v="${p.id}">${ic(p.icon, 40)}<b>${p.name}</b><small>${p.time}</small></button>`).join('')}</div>
          <button class="ll-start ${st.s.prog && !st.done ? 'ready' : ''} ${st.done ? 'going' : ''}" data-a="sx" data-k="start">${ic('play', 36)}<span>Start</span></button></div>`;
        return h;
      },
      tap(st, k, el, d) {
        if (st.done) return;
        if (k === 'prog') {
          if (d.v !== 'normal') { st.s.hint = d.v; SX.say(d.v === 'quick' ? 'Quick is for a few clothes. Lumi chooses Normal for everyday clothes.' : 'Heavy is for towels and bed sheets. Lumi chooses Normal today.'); SX.render(); return; }
          st.s.prog = 'normal';
          st.s.hint = null;
          SX.ok();
          SX.render();
          SX.say('Normal. 45 minutes. Now press Start.');
          return;
        }
        if (k === 'start') {
          if (!st.s.prog) { SX.say('First, tap Normal.'); return; }
          st.data.running = true;
          tone(660, 0.12, 0.05);
          setTimeout(() => tone(880, 0.16, 0.05), 140);
          SX.done(st, 'The machine is washing!');
        }
      },
      auto(st) { st.s.prog = 'normal'; st.data.running = true; SX.done(st, 'The machine is washing!'); },
      demo: (st) => ({ sel: st.s.prog ? '[data-k="start"]' : '[data-k="prog"][data-v="normal"]', tap: true }),
      guide: (st) => (st.done ? null : !st.s.prog ? { sel: '[data-k="prog"][data-v="normal"]', say: 'Tap Normal.' } : { sel: '[data-k="start"]', say: 'Press Start.' })
    },
    {
      id: 'wait',
      bg: 'lifeYard',
      text: 'The wash takes 45 minutes. Lumi can rest while he waits.',
      task: (st) => (st.done ? '' : 'Tap the clock to skip ahead.'),
      lumi: (st) => ({ x: 128, y: 556, h: 214, mood: st.done ? 'excited' : 'calm' }),
      enter(st) { st.s.skip = false; },
      draw(st) {
        let h = machineEl({ clothes: lightsCols(st), water: !st.done, spin: !st.done, display: st.done ? '0' : '45' });
        h += `<button class="ll-clock ${st.s.skip ? 'spin' : ''}" data-a="sx" data-k="clock" style="left:440px;top:24px" aria-label="Skip ahead">${svg('0 0 100 100', `${vol('<circle cx="50" cy="50" r="44"/>', '#FFFFFF')}<circle cx="50" cy="50" r="37" fill="none" stroke="#E6DCCB" stroke-width="2"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${(50 + Math.sin(i * 0.5236) * 33).toFixed(1)} ${(50 - Math.cos(i * 0.5236) * 33).toFixed(1)}L${(50 + Math.sin(i * 0.5236) * 38).toFixed(1)} ${(50 - Math.cos(i * 0.5236) * 38).toFixed(1)}" stroke="#9AA6B2" stroke-width="${i % 3 ? 2 : 4}" stroke-linecap="round"/>`).join('')}<path class="ll-hh" d="M50 50V30" stroke="#3B2F2F" stroke-width="5" stroke-linecap="round"/><path class="ll-hm" d="M50 50L70 50" stroke="#E5534B" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="50" r="4.5" fill="#3B2F2F"/>`)}<span class="ll-clock-l">${ic('wNext', 26)}<span>Skip ahead</span></span></button>`;
        if (st.s.skip && !st.done) h += '<div class="ll-caption" style="left:640px;top:276px">45 minutes later...</div>';
        if (st.done) h += SX.bubble(MACH.x + 256, MACH.y + 36, 'Beep, beep, beep!', { w: 200, tail: 'left' });
        else if (!st.s.skip) h += SX.bubble(20, 252, 'I can rest while I wait.', { w: 200, tail: 'down' });
        return h;
      },
      tap(st, k) {
        if (k !== 'clock' || st.s.skip || st.done) return;
        st.s.skip = true;
        SX.render();
        SX.say('45 minutes later...');
        SX.later(st, () => {
          [0, 1, 2].forEach((i) => setTimeout(() => tone(1046, 0.14, 0.05), i * 260));
          st.data.washed = true;
          SX.done(st, 'Beep, beep! The washing is done.');
        }, 2600);
      },
      auto(st) { st.s.skip = true; st.data.washed = true; SX.done(st, 'Beep, beep! The washing is done.'); },
      demo: () => ({ sel: '[data-k="clock"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="clock"]', say: 'Tap the clock to skip ahead.' })
    },
    {
      id: 'open',
      bg: 'lifeYard',
      text: 'The machine beeped. The clothes are clean!',
      task: (st) => (st.done ? '' : 'Tap the door to open it.'),
      lumi: yLumi(),
      draw(st) {
        let h = machineEl({ open: st.done, clothes: lightsCols(st), display: '0' });
        if (!st.done) h += SX.at(MACH.x + 22, DOORC.y - 96, 196, 192, '', { k: 'open', label: 'Open the door', cls: 'll-doorhit ln-glow', z: 4 });
        else h += basketEl('lights', { x: 500, y: 390, w: 170, h: 150 }, st.data.lights && st.data.lights.length ? st.data.lights : lightsList().map((c) => c.id));
        return h;
      },
      tap(st, k) { if (k === 'open' && !st.done) { tone(520, 0.1, 0.05); SX.done(st, 'Clean, wet clothes. Into the basket.'); } },
      auto(st) { SX.done(st, 'Clean, wet clothes. Into the basket.'); },
      demo: () => ({ sel: '[data-k="open"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="open"]', say: 'Tap the door to open it.' })
    },
    {
      id: 'hang',
      bg: 'lifeYard',
      text: 'Hang the clothes on the rack to dry in the breeze.',
      task: (st) => { if (st.done) return ''; const cur = lightsList()[st.s.i]; return cur ? `Drag the ${cur.name} onto the rack.` : ''; },
      lumi: yLumi(),
      enter(st) { st.s.i = 0; st.s.hung = []; },
      draw(st) {
        const list = lightsList();
        const cur = list[st.s.i];
        let h = machineEl({ open: true }) + rackEl();
        st.s.hung.forEach((id, i) => { h += hungEl(CLOTHES[id], i, { wet: true }); });
        if (!st.done) {
          list.forEach((c, i) => { if (i >= st.s.hung.length) h += SX.at(SPOTS[i].x, SPOTS[i].y, 120, 112, '<span class="ll-dash"></span>', { target: i === st.s.hung.length, id: `spot${i}`, cls: 'll-hangspot', label: 'A place on the rack', z: 2 }); });
          h += basketEl('lights', { x: 470, y: 400, w: 170, h: 150 }, list.slice(st.s.i + 1).map((c) => c.id));
          if (cur) h += SX.at(484, 300, 140, 130, SX.prop.lifeCloth(cur, { wet: true }), { cls: 'll-item sx-drag', label: cur.name, z: 8 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        const cur = lightsList()[st.s.i];
        if (!cur) return;
        SX.dragTo(box, '.ll-item', '.ll-hangspot', () => {
          st.s.hung.push(cur.id);
          st.s.i += 1;
          SX.ok();
          if (st.s.i >= lightsList().length) SX.done(st, 'All hung up to dry!');
          else { SX.render(); SX.say(`Good. Now the ${lightsList()[st.s.i].name}.`); }
          return true;
        }, { miss: () => SX.say('Hang it on the rack, at the dotted place.'), pad: 40 });
      },
      auto(st) { st.s.hung = lightsList().map((c) => c.id); st.s.i = st.s.hung.length; SX.done(st, 'All hung up to dry!'); },
      guide: (st) => (st.done ? null : { sel: '.ll-item', to: `[data-id="spot${st.s.hung.length}"]`, say: 'Drag it onto the rack.' })
    },
    {
      id: 'dry',
      min: 2,
      bg: 'lifeYard',
      text: 'Later, the sun and the breeze dry the clothes.',
      task: (st) => (st.done ? '' : 'Tap the T-shirt to feel it.'),
      lumi: yLumi(),
      draw(st) {
        let h = machineEl({}) + rackEl() + '<div class="ll-sunwash"></div>';
        lightsList().forEach((c, i) => { h += hungEl(c, i, c.id === 'wtee' && !st.done ? { extra: { k: 'feel', label: 'Feel the T-shirt', cls: 'll-feel' } } : {}); });
        if (st.done) h += SX.bubble(SPOTS[0].x - 40, 30, 'Soft and dry!', { w: 170, tail: 'down' });
        return h;
      },
      tap(st, k) { if (k === 'feel' && !st.done) { tone(880, 0.2, 0.05); SX.done(st, 'Soft, dry and fresh! Laundry done.'); } },
      auto(st) { SX.done(st, 'Soft, dry and fresh! Laundry done.'); },
      demo: () => ({ sel: '[data-k="feel"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="feel"]', say: 'Tap the T-shirt.' })
    }
  ];
  SX.lessonWithLevels({ tut: 'laundry', realText: 'Do the laundry with a grown-up the first time. One step at a time.', realSay: 'did the laundry' }, laundrySteps);
})();
