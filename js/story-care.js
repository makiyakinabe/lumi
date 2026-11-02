/*
  story-care.js
  Three real-life practice stories about looking after our bodies (engine: stories.js).
  - Lumi visits the dentist: tell the receptionist your name, wait, climb into the big chair, the light,
    open wide, count teeth, polishing tickles, rinse, a sticker, brushing at home.
  - Haircut day: say hello, climb up and pump the chair, the mirror view with the cape, snip the long
    fur, the loud clippers, brush the hair off, see the new look, say thank you, pay.
  - A visit to the polyclinic: take a queue ticket, wait, watch for 1024, tell the doctor, the
    stethoscope, say aaah, the ear check, pay at the pharmacy, medicine and rest at home.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const W = SX.W;
  const H = SX.H;
  const P = (o) => A.person(o);
  const svg = (vb, inner) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" aria-hidden="true">${inner}</svg>`;
  const T = (x, y, text, size, colour, o) => `<text x="${x}" y="${y}" text-anchor="${(o && o.anchor) || 'middle'}" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${size}" fill="${colour}">${text}</text>`;
  // a point on Lumi's own drawing (his 240 x 240 grid) placed in the scene
  function onLumi(spot, lx, ly) {
    const k = spot.h / 268;
    const x = spot.flip ? 240 - lx : lx;
    return { x: spot.x - spot.h / 2 + (x + 14) * k, y: spot.y - spot.h * (244 / 268) + (ly + 14) * k, k };
  }
  const lumiColour = () => window.Lumi.COLORS[(A.lookWith() || {}).color] || window.Lumi.COLORS.orange;
  // a clear tap area over Lumi
  const lumiHit = (spot, k, label) => {
    const a = onLumi(spot, 20, 30);
    const b = onLumi(spot, 220, 230);
    return SX.at(Math.min(a.x, b.x), a.y, Math.abs(b.x - a.x), b.y - a.y, '', { k, label, cls: 'cr-lumihit', z: 7 });
  };
  // a drop target over Lumi's body
  const lumiTarget = (spot, id) => {
    const a = onLumi(spot, 40, 60);
    const b = onLumi(spot, 200, 220);
    return SX.at(Math.min(a.x, b.x), a.y, Math.abs(b.x - a.x), b.y - a.y, '', { target: true, id, cls: 'cr-target', z: 7, label: 'Lumi' });
  };

  // ---------------------------------------------------------------- shared rooms and props
  const wall = (c1, c2, floorTop, floorC) => `<rect width="${W}" height="${H}" fill="${c1}"/><rect width="${W}" height="${floorTop}" fill="url(#lpShadeV)" opacity=".25"/><rect y="${floorTop - 14}" width="${W}" height="14" fill="${c2}"/>
    <rect y="${floorTop}" width="${W}" height="${H - floorTop}" fill="${floorC}"/>${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${floorTop + 18 + i * i * 7}H${W}" stroke="#000" stroke-opacity=".05" stroke-width="2"/>`).join('')}<rect y="${floorTop}" width="${W}" height="${H - floorTop}" fill="url(#lpFloorFade)"/>`;
  const windowArt = (x, y, w, h) => `${vol(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>`, '#FFFFFF')}<rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="6" fill="url(#lpSky)"/>
    <ellipse cx="${x + w * 0.3}" cy="${y + h * 0.55}" rx="${w * 0.2}" ry="${h * 0.1}" fill="#fff" opacity=".9"/><circle cx="${x + w * 0.75}" cy="${y + h * 0.3}" r="${h * 0.12}" fill="#FFD84D"/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="6" fill="url(#lpGlass)" opacity=".6"/>
    <path d="M${x + w / 2} ${y + 10}V${y + h - 10}" stroke="#fff" stroke-width="6"/>`;
  const plantArt = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})">${LP.drop(40, 116, 30, 5)}${vol('<path d="M40 70c-30-4-38-34-26-52 10 16 22 24 26 52zM40 70c30-4 38-34 26-52-10 16-22 24-26 52zM40 72c-4-30 0-50 0-66 10 18 10 40 0 66z"/>', '#7BC67E')}${vol('<path d="M18 74h44l-6 40H24z"/>', '#E07A5F')}</g>`;
  const clockArt = (x, y, r) => `${vol(`<circle cx="${x}" cy="${y}" r="${r}"/>`, '#FFFFFF')}<circle cx="${x}" cy="${y}" r="${r * 0.8}" fill="none" stroke="#E6DCCB" stroke-width="2"/><path d="M${x} ${y}V${y - r * 0.6}M${x} ${y}l${r * 0.4} ${r * 0.24}" stroke="${LP.INK}" stroke-width="4" stroke-linecap="round"/>`;
  const waitChairs = (x, y, n, c) => Array.from({ length: n }, (_, i) => `<g transform="translate(${x + i * 108} ${y})">${LP.drop(48, 112, 46, 6)}<path d="M14 70v40M82 70v40" stroke="#8A97A6" stroke-width="6" stroke-linecap="round"/>${vol('<rect x="6" y="0" width="84" height="60" rx="16"/>', c)}${vol('<rect x="0" y="52" width="96" height="22" rx="10"/>', c)}</g>`).join('');
  const counterFront = (x, y, w, h, c, stripe) => SX.at(x, y, w, h, svg(`0 0 ${w} ${h}`, `${vol(`<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="12"/>`, c, { shade: 'v' })}<rect x="2" y="2" width="${w - 4}" height="${Math.round(h * 0.14)}" rx="6" fill="${stripe}" opacity=".9"/>`), { z: 3, cls: 'cr-front' });
  const teddyArt = () => svg('0 0 60 60', `${LP.drop(30, 56, 20, 4)}${vol('<circle cx="16" cy="14" r="8"/><circle cx="44" cy="14" r="8"/><ellipse cx="30" cy="40" rx="18" ry="16"/><circle cx="30" cy="22" r="14"/>', '#C9915F')}${vol('<ellipse cx="30" cy="27" rx="7" ry="5"/>', '#F1D4B0', { lineOpacity: 0.3 })}<circle cx="25" cy="19" r="2.2" fill="${LP.INK}"/><circle cx="35" cy="19" r="2.2" fill="${LP.INK}"/><circle cx="30" cy="25" r="2" fill="${LP.INK}"/>`);
  const cupArt = (water) => svg('0 0 50 64', `${LP.drop(25, 60, 18, 4)}${vol('<path d="M8 8h34l-5 50H13z"/>', '#E9F6FD', { lineOpacity: 0.45 })}${water ? '<path d="M11 24h28l-3 32H14z" fill="#8EC5F2" opacity=".75"/>' : ''}<path d="M8 8h34l-5 50H13z" fill="url(#lpGlass)"/>`);
  const toothbrushArt = () => svg('0 0 40 120', `${LP.drop(20, 116, 12, 3)}${vol('<rect x="15" y="34" width="10" height="80" rx="5"/>', '#4FB3A9')}${vol('<rect x="11" y="6" width="18" height="30" rx="5"/>', '#FFFFFF')}${[10, 16, 22, 28].map((y) => `<path d="M13 ${y}h14" stroke="#8EC5F2" stroke-width="3" stroke-linecap="round"/>`).join('')}`);
  const stickerArt = () => svg('0 0 60 60', `${LP.drop(30, 56, 22, 4)}${vol('<circle cx="30" cy="28" r="26"/>', '#FFFFFF')}${vol('<path d="M30 9l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"/>', '#FFD23F')}`);
  const medBagArt = () => svg('0 0 90 100', `${LP.drop(45, 96, 38, 5)}${vol('<path d="M10 22h70l-4 72H14z"/>', '#FFFFFF')}<path d="M10 22l10-14h50l10 14" fill="#EEF2F5" stroke="${LP.INK}" stroke-opacity=".4" stroke-width="1.6"/>${vol('<path d="M36 46h18v12h12v18H54v12H36V76H24V58h12z"/>', '#4FB3A9', { lineOpacity: 0.3 })}`);
  function ticketArt() { return svg('0 0 76 70', `${LP.drop(38, 66, 30, 4)}${vol('<path d="M6 6h64v56l-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6z"/>', '#FFFFFF')}${T(38, 26, 'No.', 12, '#8A97A6')}${T(38, 48, '1024', 20, '#E5534B')}`); }
  // say something with a talk card, then mark the step done after the reply
  function talkTap(st, k, line, praise) {
    if (k !== 'say' || st.s.said) return;
    st.s.said = true;
    SX.say(line);
    SX.render();
    SX.later(st, () => SX.done(st, praise), 1500);
  }

  // ================================================================ 1. Lumi visits the dentist
  SX.bg.careDentalWait = () => `${wall('#E8F6F3', '#C7E6DF', 380, '#DCE8E4')}${windowArt(470, 50, 200, 150)}${clockArt(780, 90, 38)}
    ${vol('<rect x="890" y="60" width="150" height="190" rx="14"/>', '#FFFFFF')}${vol('<path d="M930 110c0-22 22-26 32-18 10-8 32-4 32 18 0 22-6 32-8 54-2 16-10 16-12 0-2-10-12-10-14 0-2 16-10 16-12 0-2-22-18-32-18-54z"/>', '#FFFFFF', { lineColour: '#8EB8E5', lineOpacity: 1, lineWidth: 4 })}${T(965, 232, 'SMILE!', 22, '#4FB3A9')}
    ${vol('<rect x="40" y="70" width="330" height="40" rx="12"/>', '#4FB3A9', { shade: 'v' })}${T(205, 98, 'TOOTH CLINIC', 24, '#fff')}
    ${waitChairs(420, 300, 4, '#7FC4B8')}`;
  SX.bg.careDentalRoom = () => `${wall('#F1FAF8', '#CFE9E3', 400, '#E3EEEB')}${windowArt(60, 60, 180, 140)}
    ${vol('<rect x="900" y="200" width="190" height="200" rx="12"/>', '#FFFFFF')}${[0, 1].map((r) => `<rect x="914" y="${214 + r * 92}" width="162" height="80" rx="8" fill="#F2F6F8" stroke="#D5DEE4" stroke-width="2"/>`).join('')}
    ${vol('<rect x="300" y="60" width="150" height="110" rx="10"/>', '#2B2F4A')}<rect x="312" y="72" width="126" height="86" rx="6" fill="#6E8BA8" opacity=".6"/>${[0, 1, 2, 3].map((i) => `<path d="M${330 + i * 28} 92c0-10 12-12 12 0v24c0 8-12 8-12 0z" fill="#fff" opacity=".85"/>`).join('')}`;
  SX.bg.careBathroom = () => `${wall('#E3F1FA', '#BFD9EA', 420, '#D6E4EE')}${Array.from({ length: 10 }, (_, i) => Array.from({ length: 5 }, (_, j) => `<rect x="${i * 112}" y="${j * 84}" width="112" height="84" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`).join('')).join('')}
    ${vol('<rect x="740" y="40" width="300" height="230" rx="20"/>', '#FFFFFF')}<rect x="756" y="56" width="268" height="198" rx="12" fill="#DCEEF7"/><rect x="756" y="56" width="268" height="198" rx="12" fill="url(#lpGlass)"/>
    ${vol('<path d="M720 330h340v30H720z"/>', '#FFFFFF')}${vol('<path d="M740 360h300l-30 80H770z"/>', '#F2F6F8')}<path d="M890 330v-30h30" fill="none" stroke="url(#lpMetal)" stroke-width="10" stroke-linecap="round"/>`;
  const dentistChair = (tilt) => svg('0 0 380 320', `${LP.drop(200, 306, 150, 12)}<path d="M200 230v64" stroke="url(#lpMetal)" stroke-width="26"/>${vol('<ellipse cx="200" cy="296" rx="80" ry="14"/>', '#C9D1D9')}
    <g transform="rotate(${tilt ? -16 : 0} 200 230)">${vol('<path d="M40 210c0-20 14-30 34-30h220c26 0 40 14 40 34v10c0 12-8 20-20 20H60c-12 0-20-8-20-20z"/>', '#4FB3A9')}
      ${vol('<path d="M70 190c-10-60 0-150 20-176 6-8 60-8 66 0 10 30 6 120-6 176z"/>', '#4FB3A9')}${vol('<rect x="88" y="8" width="56" height="34" rx="14"/>', '#6FC9BE')}
      ${vol('<path d="M290 214h70c12 0 18 8 18 18v4c0 8-6 14-14 14h-74z"/>', '#4FB3A9')}</g>`);
  const lampArt = (on) => svg('0 0 260 200', `<path d="M10 0v40q0 30 40 40l120 30" fill="none" stroke="url(#lpMetal)" stroke-width="12" stroke-linecap="round"/>
    ${on ? '<path d="M150 140 L60 330 L320 330 L230 140z" fill="url(#lpGlow)" opacity=".9"/>' : ''}${vol('<path d="M140 96h100l-14 46h-72z"/>', '#E3E8ED')}<ellipse cx="190" cy="142" rx="38" ry="8" fill="${on ? '#FFF6C8' : '#C9D1D9'}"/>`);
  const SEAT = { x: 590, y: 400, h: 190 };
  const TILTED = { x: 600, y: 390, h: 190, cls: 'cr-tilt' };
  const dentist = (o) => SX.at(840, 120, 150, 330, P(Object.assign({ who: 'dentist', h: 330, pose: 'stand', mood: 'smile', flip: true }, o)), { z: 4 });
  // the open mouth, up close, with eight teeth to count
  const TEETH = [{ x: 150, y: 150 }, { x: 215, y: 132 }, { x: 290, y: 132 }, { x: 355, y: 150 }, { x: 150, y: 250 }, { x: 215, y: 268 }, { x: 290, y: 268 }, { x: 355, y: 250 }];
  const mouthArt = () => svg('0 0 520 400', `${LP.drop(260, 388, 220, 14)}${vol('<ellipse cx="256" cy="200" rx="238" ry="186"/>', lumiColour().body)}
    ${vol('<path d="M70 200c0-90 80-130 186-130s186 40 186 130-80 130-186 130S70 290 70 200z"/>', '#B4434F')}<path d="M110 220c40 60 250 60 292 0-20 70-272 70-292 0z" fill="#E77A86"/>
    ${TEETH.map((t) => vol(`<path d="M${t.x - 28} ${t.y - 30}h56c4 0 6 4 6 8v38c0 14-10 22-34 22s-34-8-34-22V${t.y - 22}c0-4 2-8 6-8z"/>`, '#FFFFFF', { lineOpacity: 0.35 })).join('')}`);
  const dentistSteps = [
    {
      id: 'reception', bg: 'careDentalWait',
      text: 'Today Lumi and Mum are at the dentist. First, Lumi says hello at the counter.',
      task: (st) => (st.s.said ? '' : 'Tap the talk card to tell the receptionist Lumi\'s name.'),
      lumi: { x: 450, y: 560, h: 200, flip: true },
      draw(st) {
        let h = SX.at(140, 150, 120, 250, P({ who: 'nurse', h: 250, pose: st.s.said ? 'wave' : 'stand', mood: st.s.said ? 'talk' : 'smile' }), { z: 1 });
        h += counterFront(40, 330, 330, 140, '#FFFFFF', '#4FB3A9');
        h += SX.at(580, 330, 110, 230, P({ who: 'mum', h: 230 }), { z: 6 });
        h += SX.talkCard([{ t: 'My name', art: '' }, { t: 'is Lumi', art: SX.lumi(st, { h: 52 }) }], 'say', { said: st.s.said, style: 'left:690px;top:40px;' });
        if (st.s.said) h += SX.bubble(230, 70, 'Thank you, Lumi. Please have a seat.', { w: 260, tail: 'down' });
        return h;
      },
      tap: (st, k) => talkTap(st, k, 'My name is Lumi.', 'Lumi told the receptionist. Now Lumi waits for a turn.'),
      guide: (st) => (st.s.said ? null : { sel: '.sx-talk', say: 'Tap the talk card.' })
    },
    SX.copeStep({
      id: 'wait', bg: 'careDentalWait',
      text: 'Lumi sits in the waiting room. It can feel a bit strange. That is okay.',
      lumi: (st) => ({ x: 470, y: 400, h: 170, mood: st.done ? 'calm' : 'worried' }),
      draw: () => SX.at(560, 186, 110, 230, P({ who: 'mum', pose: 'sit', h: 230 }), { z: 4 }),
      options: [{ label: 'Read a book', art: svg('0 0 60 50', `${LP.drop(30, 46, 24, 4)}${vol('<path d="M6 8c10-4 18-2 24 4 6-6 14-8 24-4v34c-10-4-18-2-24 4-6-6-14-8-24-4z"/>', '#E5534B')}<path d="M30 12v34" stroke="#fff" stroke-width="2"/>`), reply: 'A book helps the time go faster.' },
        Object.assign({}, SX.HEADPHONES, { label: 'Listen to music', reply: 'Lumi listens to calm music.' }), SX.BREATHE]
    }),
    {
      id: 'chair', bg: 'careDentalRoom',
      text: (st) => (st.s.said ? 'The dentist smiles. "Climb into the big chair, Lumi."' : 'The dentist says, "Hello Lumi! I am Dr Raj."'),
      task: (st) => (!st.s.said ? 'Tap the talk card to say hello back.' : !st.done ? 'Tap the big chair to climb in.' : ''),
      lumi: (st) => (st.done ? SEAT : { x: 240, y: 560, h: 200 }),
      draw(st) {
        let h = SX.at(420, 150, 380, 320, dentistChair(false), { k: st.s.said && !st.done ? 'sit' : '', z: 2, cls: 'cr-chair', label: 'The big chair' });
        h += dentist({ pose: st.s.said ? 'point' : 'wave', mood: 'talk' });
        if (!st.s.said) h += SX.talkCard([{ t: 'Hello,', art: '' }, { t: 'Dr Raj!', art: '' }], 'hello', { style: 'left:60px;top:40px;' });
        else if (!st.done) h += SX.bubble(700, 60, 'Climb into the big chair, Lumi.', { w: 230, tail: 'down' });
        return h;
      },
      tap(st, k) {
        if (k === 'hello' && !st.s.said) { st.s.said = true; SX.say('Hello, Dr Raj!'); SX.ok(); SX.render(); return; }
        if (k === 'sit' && st.s.said && !st.done) SX.done(st, 'Lumi climbs into the big chair. It is soft.');
      },
      guide: (st) => (!st.s.said ? { sel: '.sx-talk', say: 'Tap the talk card.' } : { sel: '.cr-chair', say: 'Tap the big chair.' })
    },
    {
      id: 'tilt', bg: 'careDentalRoom',
      text: 'The chair can lean back slowly, so the dentist can see Lumi\'s teeth.',
      task: (st) => (st.done ? '' : 'Tap the green button to lean the chair back.'),
      lumi: (st) => (st.done ? TILTED : SEAT),
      draw(st) {
        let h = SX.at(420, 150, 380, 320, dentistChair(st.done), { z: 2 });
        h += dentist({});
        h += SX.at(290, 390, 110, 110, svg('0 0 100 100', `${LP.drop(50, 92, 40, 6)}${vol('<rect x="10" y="20" width="80" height="66" rx="14"/>', '#E3E8ED')}${vol('<circle cx="50" cy="52" r="22"/>', '#5BAA4A')}<path d="M40 48l10 10 10-10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`), { k: 'button', label: 'Lean the chair back', cls: st.done ? '' : 'sx-glow', z: 6 });
        return h;
      },
      tap(st, k) { if (k === 'button' && !st.done) { A.tone(300, 0.6, 0.04); SX.done(st, 'Whirr! The chair leans back slowly. Lumi lies back.'); } },
      guide: () => ({ sel: '[data-k="button"]', say: 'Tap the green button.' })
    },
    {
      id: 'light', bg: 'careDentalRoom',
      text: (st) => (!st.s.on ? 'There is a big light above the chair.' : 'Now the dentist asks Lumi to open wide, like a lion!'),
      task: (st) => (!st.s.on ? 'Tap the light to switch it on.' : !st.s.open ? 'Tap Lumi to open wide.' : ''),
      lumi: (st) => Object.assign({}, TILTED, { mood: st.s.open ? 'excited' : 'calm' }),
      draw(st) {
        let h = SX.at(420, 150, 380, 320, dentistChair(true), { z: 2 });
        h += SX.at(470, 0, 260, 200, lampArt(st.s.on), { k: 'lamp', label: 'The light', z: 6, cls: st.s.on ? '' : 'sx-glow' });
        h += dentist({ pose: st.s.on ? 'point' : 'stand', mood: 'talk', mask: st.s.on ? 'on' : 'chin' });
        if (st.s.on && !st.s.open) h += lumiHit(TILTED, 'open', 'Open wide');
        if (st.s.on) h += SX.bubble(70, 60, st.s.open ? 'Aaah! Great job.' : 'The light is bright. Lumi can close his eyes if it is too bright.', { w: 270 });
        return h;
      },
      tap(st, k) {
        if (k === 'lamp' && !st.s.on) { st.s.on = true; A.tone(880, 0.1, 0.05); SX.render(); SX.say('Click! The light is on. Now tap Lumi to open wide.'); return; }
        if (k === 'open' && st.s.on && !st.s.open) { st.s.open = true; SX.done(st, 'Aaah! Lumi opens wide like a lion.'); }
      },
      guide: (st) => (!st.s.on ? { sel: '[data-k="lamp"]', say: 'Tap the light.' } : { sel: '[data-k="open"]', say: 'Tap Lumi.' })
    },
    {
      id: 'count', bg: 'careDentalRoom',
      text: 'The dentist uses a little mirror to look at each tooth. Let\'s count Lumi\'s teeth!',
      task: (st) => (st.done ? '' : 'Tap each tooth to count it.'),
      lumi: { x: 260, y: 470, h: 160, cls: 'cr-tilt', mood: 'excited' },
      enter(st) { st.s.got = []; },
      draw(st) {
        let h = SX.at(80, 280, 320, 270, dentistChair(true), { z: 2 });
        h += SX.at(440, 40, 520, 400, mouthArt(), { z: 3 });
        TEETH.forEach((t, i) => {
          const got = st.s.got.includes(i);
          h += SX.at(440 + t.x - 34, 40 + t.y - 34, 68, 70, `<span class="cr-tooth-n">${got ? st.s.got.indexOf(i) + 1 : ''}</span>`, { k: 'tooth', v: i, label: `Tooth ${i + 1}`, cls: `cr-tooth ${got ? 'got' : ''}`, z: 6 });
        });
        const last = st.s.got.length ? TEETH[st.s.got[st.s.got.length - 1]] : { x: 420, y: 330 };
        h += SX.at(440 + last.x + 16, 40 + last.y - 10, 120, 50, svg('0 0 120 50', `<path d="M40 25H118" stroke="url(#lpMetal)" stroke-width="8" stroke-linecap="round"/>${vol('<circle cx="24" cy="25" r="18"/>', '#CFE6F5')}<circle cx="24" cy="25" r="18" fill="url(#lpGlass)"/>`), { z: 7, cls: 'cr-dmirror' });
        h += SX.at(960, 230, 130, 290, P({ who: 'dentist', h: 290, mood: 'smile', flip: true, mask: 'on' }), { z: 4 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'tooth' || st.done) return;
        const i = Number(d.v);
        if (st.s.got.includes(i)) return;
        st.s.got.push(i);
        const n = st.s.got.length;
        A.tone(500 + n * 60, 0.12, 0.05);
        if (n >= 8) { SX.done(st, 'Eight shiny teeth! Lumi\'s teeth are healthy.'); return; }
        SX.render();
        SX.say(['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][n - 1]);
      },
      guide: () => ({ sel: '.cr-tooth:not(.got)', say: 'Tap a tooth.' })
    },
    SX.copeStep({
      id: 'polish', bg: 'careDentalRoom',
      text: 'Now the dentist polishes Lumi\'s teeth. Bzzz! It tickles a little.',
      lumi: (st) => Object.assign({}, TILTED, { mood: st.done ? 'calm' : 'worried' }),
      draw: () => SX.at(420, 150, 380, 320, dentistChair(true), { z: 2 }) + SX.at(470, 0, 260, 200, lampArt(true), { z: 4 })
        + SX.at(110, 130, 150, 330, P({ who: 'dentist', h: 330, pose: 'give', item: 'toothbrush', mask: 'on' }), { z: 4 }),
      options: [{ label: 'Hold my teddy', art: teddyArt(), reply: 'Lumi hugs his teddy. That feels safe.' },
        { label: 'Squeeze my hands', art: SX.ART.squeeze, reply: 'Squeeze, and let go. Lumi feels calmer.' },
        { label: 'Raise my hand to say stop', art: A.ic('stop', 64), reply: 'The dentist stops for a little rest. Raising a hand is a good way to ask.' }]
    }),
    {
      id: 'rinse', bg: 'careDentalRoom',
      text: 'All clean! Now Lumi rinses with a little water. Swish, swish, and spit.',
      task: (st) => (st.done ? '' : 'Drag the cup of water to Lumi.'),
      lumi: (st) => Object.assign({}, SEAT, { mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        let h = SX.at(420, 150, 380, 320, dentistChair(false), { z: 2 });
        h += dentist({});
        h += SX.at(250, 330, 120, 150, svg('0 0 120 150', `${LP.drop(60, 146, 50, 6)}<path d="M60 70v74" stroke="url(#lpMetal)" stroke-width="12"/>${vol('<path d="M10 40h100l-12 34H22z"/>', '#FFFFFF')}<ellipse cx="60" cy="42" rx="44" ry="8" fill="#DDEAF2"/>`), { z: 1 });
        if (!st.done) {
          h += lumiTarget(SEAT, 'mouth');
          h += SX.at(290, 250, 60, 76, cupArt(true), { cls: 'sx-drag cr-cup', label: 'Cup of water', z: 8 });
        } else h += SX.bubble(380, 110, 'Swish, swish... and spit!', { w: 200, tail: 'down' });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.cr-cup', '[data-id="mouth"]', () => { A.tone(400, 0.3, 0.04); SX.done(st, 'Swish, swish, spit! Lumi\'s mouth feels fresh.'); return true; }, { miss: () => SX.say('Bring the cup to Lumi.') });
      },
      guide: () => ({ sel: '.cr-cup', say: 'Drag the cup to Lumi.' })
    },
    {
      id: 'sticker', bg: 'careDentalRoom',
      text: '"All done! You were brave, Lumi," says Dr Raj. He gives Lumi a sticker.',
      task: (st) => (st.done ? '' : 'Drag the star sticker onto Lumi.'),
      lumi: (st) => ({ x: 520, y: 560, h: 220, mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        const spot = { x: 520, y: 560, h: 220 };
        let h = dentist({ pose: 'give', mood: 'talk' });
        if (!st.done) {
          h += lumiTarget(spot, 'lumi');
          h += SX.at(760, 290, 80, 80, stickerArt(), { cls: 'sx-drag cr-sticker', label: 'Star sticker', z: 8 });
        } else {
          const p = onLumi(spot, 150, 170);
          h += SX.at(p.x - 26, p.y - 26, 52, 52, stickerArt(), { z: 7 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.cr-sticker', '[data-id="lumi"]', () => { SX.done(st, 'A shiny star sticker! Lumi was brave.'); return true; }, { miss: () => SX.say('Put the sticker on Lumi.') });
      },
      guide: () => ({ sel: '.cr-sticker', say: 'Drag the sticker onto Lumi.' })
    },
    {
      id: 'home', bg: 'careBathroom',
      text: 'At home, Lumi brushes his teeth every morning and every night, to keep them strong.',
      task: (st) => (st.done ? '' : 'Drag the toothbrush to Lumi to brush.'),
      lumi: (st) => ({ x: 480, y: 560, h: 230, mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        const spot = { x: 480, y: 560, h: 230 };
        let h = '';
        if (!st.done) {
          h += lumiTarget(spot, 'lumi');
          h += SX.at(800, 250, 40, 120, toothbrushArt(), { cls: 'sx-drag cr-brush', label: 'Toothbrush', z: 8 });
        } else {
          const p = onLumi(spot, 150, 150);
          h += SX.at(p.x - 6, p.y - 70, 40, 120, toothbrushArt(), { z: 7, cls: 'cr-brushing' });
          h += SX.bubble(600, 120, 'Brush, brush, brush!', { w: 190 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.cr-brush', '[data-id="lumi"]', () => { SX.done(st, 'Brush, brush, brush! Shiny clean teeth.'); return true; }, { miss: () => SX.say('Bring the toothbrush to Lumi.') });
      },
      guide: () => ({ sel: '.cr-brush', say: 'Drag the toothbrush to Lumi.' })
    }
  ];
  SX.story({ id: 'dentist', title: 'Lumi visits the dentist', tint: '#D7F0EA', steps: dentistSteps });

  // ================================================================ 2. Haircut day
  SX.bg.careSalon = () => `${wall('#FBE9EE', '#F2C6D5', 400, '#EADBE2')}${Array.from({ length: 12 }, (_, i) => Array.from({ length: 3 }, (_, j) => `<rect x="${i * 96}" y="${400 + j * 57}" width="96" height="57" fill="${(i + j) % 2 ? '#FFFFFF' : '#E9D6E0'}" opacity=".85"/>`).join('')).join('')}
    ${vol('<rect x="50" y="60" width="40" height="230" rx="20"/>', '#FFFFFF')}${[0, 1, 2, 3, 4].map((i) => `<path d="M52 ${96 + i * 44} L88 ${74 + i * 44}" stroke="#EF8A7A" stroke-width="12"/>`).join('')}${vol('<rect x="44" y="44" width="52" height="24" rx="10"/><rect x="44" y="282" width="52" height="24" rx="10"/>', '#C9D1D9')}
    ${vol('<rect x="140" y="60" width="300" height="56" rx="14"/>', '#C2577A', { shade: 'v' })}${T(290, 98, 'HAPPY HAIR SALON', 24, '#fff')}
    ${[540, 820].map((x) => `${vol(`<rect x="${x}" y="50" width="220" height="250" rx="22"/>`, '#FFFFFF')}<rect x="${x + 14}" y="64" width="192" height="222" rx="14" fill="#DCEEF7"/><rect x="${x + 14}" y="64" width="192" height="222" rx="14" fill="url(#lpGlass)"/>${vol(`<rect x="${x - 10}" y="300" width="240" height="22" rx="8"/>`, '#F6E7D3')}`).join('')}${plantArt(1040, 280, 1)}`;
  // the mirror view: the big mirror fills the scene; we see Lumi's reflection and the hairdresser behind him
  SX.bg.careMirror = () => `<rect width="${W}" height="${H}" fill="#FBE9EE"/>${vol('<rect x="190" y="14" width="740" height="500" rx="34"/>', '#F6E7D3')}
    <rect x="212" y="34" width="696" height="460" rx="22" fill="#F7EEF3"/><rect x="212" y="34" width="696" height="300" fill="#FDF5F8"/><rect x="212" y="334" width="696" height="160" fill="#EFE1E8"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${212 + i * 87}" y="334" width="87" height="160" fill="${i % 2 ? '#FFFFFF' : '#E9D6E0'}" opacity=".6"/>`).join('')}
    <g opacity=".7">${vol('<rect x="250" y="70" width="40" height="200" rx="20"/>', '#FFFFFF')}${[0, 1, 2, 3].map((i) => `<path d="M252 ${100 + i * 44} L288 ${78 + i * 44}" stroke="#EF8A7A" stroke-width="12"/>`).join('')}${plantArt(320, 230, 0.8)}</g>
    ${vol('<path d="M470 470c0-150 40-210 110-210s110 60 110 210z"/>', '#3E4A5A')}${vol('<rect x="430" y="440" width="300" height="40" rx="16"/>', '#3E4A5A')}
    <rect x="212" y="34" width="696" height="460" rx="22" fill="url(#lpGlass)" opacity=".5"/><path d="M820 60l60-26M800 110l90-40" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".55"/>
    ${vol(`<rect x="0" y="500" width="${W}" height="70"/>`, '#F6E7D3', { shade: 'v' })}
    ${vol('<rect x="40" y="430" width="34" height="80" rx="10"/>', '#8EC5F2')}${vol('<rect x="44" y="410" width="26" height="24" rx="6"/>', '#E3E8ED')}${vol('<rect x="980" y="470" width="90" height="16" rx="6"/>', '#2F2F38')}`;
  const MIRROR_LUMI = { x: 580, y: 470, h: 250, flip: true };
  const TUFTS = [{ lx: 92, ly: 44, r: -20 }, { lx: 120, ly: 34, r: 0 }, { lx: 148, ly: 44, r: 20 }, { lx: 26, ly: 132, r: -78 }, { lx: 214, ly: 132, r: 78 }];
  const tuftInner = (c, rot) => `<g transform="rotate(${rot} 30 60)">${vol('<path d="M30 66c-18 0-24-16-18-30 4 6 8 8 10 8-2-14 2-30 12-40 0 12 4 20 10 24 2-6 6-10 12-12-2 14 2 22-4 34-4 10-12 16-22 16z"/>', c.body)}</g>`;
  const tuftArt = (c, rot) => svg('0 0 60 70', tuftInner(c, rot));
  const capeOn = () => ({});
  // the salon gown, drawn over Lumi in his own drawing grid so it fits him exactly
  function gown(st, spot) {
    if (!st.data.cape) return '';
    const left = spot.x - spot.h / 2;
    const top = spot.y - spot.h * (244 / 268);
    return SX.at(left, top, spot.h, spot.h, `<svg viewBox="-14 -14 268 268" width="100%" height="100%" overflow="visible" aria-hidden="true">${vol('<path d="M54 166 Q120 190 186 166 L230 238 Q120 258 10 238 Z"/>', '#7E64C8')}
      ${[[60, 210], [100, 226], [150, 220], [190, 212], [124, 204], [80, 238], [170, 240]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity=".75"/>`).join('')}${vol('<path d="M54 162 Q120 186 186 162 L188 174 Q120 200 52 174 Z"/>', '#FFFFFF', { lineOpacity: 0.3 })}</svg>`, { z: 6, cls: 'cr-gown' });
  }
  const hairdresser = (o) => SX.at(700, 70, 200, 420, P(Object.assign({ who: 'hairdresser', h: 420, pose: 'stand', mood: 'smile', flip: true }, o || {})), { z: 3 });
  function tufts(st) {
    const c = lumiColour();
    return TUFTS.map((t, i) => {
      if (st.data.cut && st.data.cut[i]) return '';
      const p = onLumi(MIRROR_LUMI, t.lx, t.ly);
      const rot = Math.sign(p.x - MIRROR_LUMI.x) * Math.abs(t.r);
      return SX.at(p.x - 30, p.y - 52, 60, 70, tuftArt(c, rot), { z: 6, cls: 'cr-tuft', id: 'tuft' + i });
    }).join('');
  }
  const scissorsArt = () => svg('0 0 70 90', `${LP.drop(35, 86, 24, 4)}${vol('<circle cx="20" cy="70" r="12"/><circle cx="50" cy="70" r="12"/>', '#E5534B')}<circle cx="20" cy="70" r="6" fill="#FBE9EE"/><circle cx="50" cy="70" r="6" fill="#FBE9EE"/><path d="M26 60 L46 6 M44 60 L24 6" stroke="url(#lpMetal)" stroke-width="9" stroke-linecap="round"/><path d="M26 60 L46 6 M44 60 L24 6" stroke="${LP.INK}" stroke-opacity=".35" stroke-width="1.6" fill="none"/>`);
  const capeArt = () => svg('0 0 120 90', `${LP.drop(60, 86, 52, 5)}${vol('<path d="M10 20c20-12 80-12 100 0l-6 60c-30 8-58 8-88 0z"/>', '#7E64C8')}${[[34, 44], [62, 56], [86, 40], [48, 70], [80, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff" opacity=".8"/>`).join('')}`);
  const brushArt = () => svg('0 0 120 70', `${LP.drop(60, 66, 50, 4)}${vol('<rect x="6" y="10" width="78" height="34" rx="14"/>', '#C99A6B')}${vol('<rect x="80" y="18" width="36" height="18" rx="8"/>', '#8A6A4A')}${Array.from({ length: 9 }, (_, i) => `<path d="M${14 + i * 8} 44v18" stroke="#3B2F2F" stroke-width="3" stroke-linecap="round"/>`).join('')}`);
  const clippersArt = () => svg('0 0 70 120', `${LP.drop(35, 116, 22, 4)}${vol('<rect x="14" y="20" width="42" height="94" rx="18"/>', '#3E4A5A', { shade: 'h' })}${vol('<rect x="10" y="6" width="50" height="20" rx="4"/>', '#C9D1D9')}<path d="M2 4l-12-10M68 4l12-10M-4 22h-12M74 22h12" stroke="#E5534B" stroke-width="4" stroke-linecap="round"/>`);
  const haircutSteps = [
    {
      id: 'hello', bg: 'careSalon',
      text: 'Lumi\'s fur is getting long. Today Lumi is at the hair salon.',
      task: (st) => (st.s.said ? '' : 'Tap the talk card to say hello.'),
      lumi: { x: 330, y: 560, h: 210 },
      draw(st) {
        let h = SX.at(560, 140, 160, 340, P({ who: 'hairdresser', h: 340, pose: st.s.said ? 'wave' : 'stand', mood: st.s.said ? 'talk' : 'smile' }), { z: 4 });
        h += SX.at(130, 380, 110, 180, P({ who: 'mum', h: 180 }), { z: 3 });
        h += SX.talkCard([{ t: 'Hello!', art: '' }, { t: 'A haircut, please', art: scissorsArt() }], 'say', { said: st.s.said, style: 'left:760px;top:340px;' });
        if (st.s.said) h += SX.bubble(700, 80, 'Hello Lumi! Come and sit here.', { w: 240 });
        return h;
      },
      tap: (st, k) => talkTap(st, k, 'Hello! A haircut, please.', 'Lumi said hello. The hairdresser is friendly.'),
      guide: (st) => (st.s.said ? null : { sel: '.sx-talk', say: 'Tap the talk card.' })
    },
    {
      id: 'climb', bg: 'careSalon',
      text: (st) => (!st.s.sat ? 'This is the hairdresser\'s chair. It goes up and down.' : 'The chair is low. Press the pedal to pump the chair up.'),
      task: (st) => (!st.s.sat ? 'Tap the chair to climb up.' : !st.done ? 'Tap the pedal to pump the chair up.' : ''),
      lumi: (st) => (st.s.sat ? { x: 650, y: 380 - st.s.up * 24, h: 190 } : { x: 330, y: 560, h: 210 }),
      enter(st) { st.s.up = 0; },
      draw(st) {
        const lift = st.s.up * 24;
        let h = SX.at(540, 250 - lift, 220, 210 + lift, svg(`0 0 220 ${210 + lift}`, `${LP.drop(110, 204 + lift, 90, 10)}<path d="M110 120v${76 + lift}" stroke="url(#lpMetal)" stroke-width="22"/>${vol(`<ellipse cx="110" cy="${198 + lift}" rx="70" ry="12"/>`, '#3E4A5A')}
          ${vol('<path d="M44 96c-4-50 6-90 20-96h92c14 6 24 46 20 96z"/>', '#3E4A5A')}${vol('<path d="M30 110c0-14 10-22 24-22h112c14 0 24 8 24 22v8c0 10-8 16-18 16H48c-10 0-18-6-18-16z"/>', '#4A5868')}`), { k: st.s.sat ? '' : 'sit', label: 'The chair', z: 2, cls: 'cr-salonchair' });
        h += SX.at(760, 470, 90, 56, svg('0 0 80 50', `${LP.drop(40, 46, 34, 4)}${vol('<path d="M6 30l60-20 8 14-60 22z"/>', '#C9D1D9')}`), { k: 'pedal', label: 'The pedal', z: 6, cls: st.s.sat && !st.done ? 'sx-glow' : '' });
        h += SX.at(880, 130, 160, 340, P({ who: 'hairdresser', h: 340, pose: 'point', mood: 'smile', flip: true }), { z: 4 });
        if (st.s.sat && st.s.up > 0 && !st.done) h += SX.bubble(780, 380, 'Pump!', { w: 100 });
        return h;
      },
      tap(st, k, el) {
        if (k === 'sit' && !st.s.sat) { st.s.sat = true; SX.ok(); SX.render(); SX.say('Lumi climbs up onto the chair. Now tap the pedal to pump it up.'); return; }
        if (k === 'pedal') {
          if (!st.s.sat) { SX.nope(el, 'Sit on the chair first.'); return; }
          if (st.done) return;
          st.s.up += 1;
          A.tone(300 + st.s.up * 60, 0.15, 0.05);
          if (st.s.up >= 3) { SX.done(st, 'Pump, pump, pump! Lumi is up high, ready for the haircut.'); return; }
          SX.render();
          SX.say('Pump! Again.');
        }
      },
      guide: (st) => (!st.s.sat ? { sel: '.cr-salonchair', say: 'Tap the chair.' } : { sel: '[data-k="pedal"]', say: 'Tap the pedal.' })
    },
    {
      id: 'cape', bg: 'careMirror',
      text: 'Look in the big mirror! Lumi can see himself, and the hairdresser behind him.',
      task: (st) => (st.data.cape ? '' : 'Drag the cape onto Lumi in the mirror.'),
      lumi: (st) => Object.assign({}, MIRROR_LUMI, { look: capeOn(st), mood: st.data.cape ? 'excited' : 'happy' }),
      draw(st) {
        let h = hairdresser({ pose: st.data.cape ? 'stand' : 'hold' });
        h += gown(st, MIRROR_LUMI) + tufts(st);
        if (!st.data.cape) {
          h += lumiTarget(MIRROR_LUMI, 'lumi');
          h += SX.at(960, 330, 120, 90, capeArt(), { cls: 'sx-drag cr-cape', label: 'The cape', z: 8 });
        }
        return h;
      },
      after(st, box) {
        if (st.data.cape) return;
        SX.dragTo(box, '.cr-cape', '[data-id="lumi"]', () => { st.data.cape = true; SX.done(st, 'The cape keeps cut hair off Lumi. Like a superhero!'); return true; }, { miss: () => SX.say('Put the cape on Lumi.') });
      },
      guide: () => ({ sel: '.cr-cape', say: 'Drag the cape onto Lumi.' })
    },
    {
      id: 'snip', bg: 'careMirror',
      text: 'Lumi keeps very still. The hairdresser cuts the long fur. Snip, snip!',
      task: (st) => (st.done ? '' : 'Drag the scissors over each long tuft of fur.'),
      lumi: (st) => Object.assign({}, MIRROR_LUMI, { look: capeOn(st), mood: 'calm' }),
      enter(st) { st.data.cape = true; st.data.cut = [false, false, false, false, false]; },
      draw(st) {
        let h = hairdresser({ pose: 'hold', item: 'comb' });
        h += gown(st, MIRROR_LUMI) + tufts(st);
        h += st.data.cut.map((c, i) => (c ? SX.at(400 + i * 70, 488, 50, 30, svg('0 0 50 30', vol('<path d="M4 24c10-14 30-18 42-6-14 0-26 6-42 6z"/>', lumiColour().body)), { z: 4 }) : '')).join('');
        if (!st.done) h += SX.at(960, 300, 70, 90, scissorsArt(), { cls: 'cr-scissors', label: 'Scissors', z: 9 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        const sc = box.querySelector('.cr-scissors');
        if (!sc || sc.dataset.wired) return;
        sc.dataset.wired = '1';
        A.SG.drag(sc, box, {
          move(p) {
            box.querySelectorAll('.cr-tuft').forEach((t) => {
              if (t.classList.contains('cr-fall')) return;
              const r = SX.rectIn(t, box);
              if (p.x > r.x - 14 && p.x < r.x + r.w + 14 && p.y > r.y - 14 && p.y < r.y + r.h + 14) {
                t.classList.add('cr-fall');
                st.data.cut[Number(t.dataset.id.slice(4))] = true;
                A.tone(1400, 0.06, 0.06);
                setTimeout(() => A.tone(1700, 0.06, 0.06), 70);
              }
            });
          },
          drop() {
            if (st.data.cut.every(Boolean)) SX.done(st, 'Snip, snip! All the long fur is cut. Lumi kept so still.');
            else { SX.render(); SX.say('Snip! Find the other long tufts.'); }
            return false;
          }
        });
      },
      guide: () => ({ sel: '.cr-scissors', say: 'Drag the scissors over the long fur.' })
    },
    SX.copeStep({
      id: 'buzz', bg: 'careMirror',
      text: 'Now the clippers go BZZZZ to tidy the edges. It is loud!',
      lumi: (st) => Object.assign({}, MIRROR_LUMI, { look: capeOn(st), mood: st.done ? 'calm' : 'worried' }),
      draw: (st) => hairdresser({ pose: 'give' }) + gown(st, MIRROR_LUMI) + SX.at(870, 170, 60, 100, clippersArt(), { z: 4, cls: 'cr-buzz' }),
      options: [Object.assign({}, SX.HEADPHONES, { reply: 'The headphones make the buzz quiet. Lumi feels okay.' }),
        { label: 'Cover my ears', art: A.ic('hug', 64), reply: 'Lumi covers his ears. The noise is softer.' },
        { label: 'Ask for a break', art: SX.ART.breakCard, reply: 'The hairdresser stops for a little break. Then they finish together.' }]
    }),
    {
      id: 'brush', bg: 'careMirror',
      text: 'There is cut fur on the cape. The hairdresser brushes it off.',
      task: (st) => (st.done ? '' : 'Rub the brush over the cape to brush the hair off.'),
      lumi: (st) => Object.assign({}, MIRROR_LUMI, { look: capeOn(st), mood: 'happy' }),
      enter(st) { st.s.rub = 0; st.data.cape = true; st.data.cut = [true, true, true, true, true]; },
      draw(st) {
        let h = hairdresser({}) + gown(st, MIRROR_LUMI);
        if (!st.done) {
          const a = onLumi(MIRROR_LUMI, 30, 150);
          const b = onLumi(MIRROR_LUMI, 210, 230);
          h += SX.at(Math.min(a.x, b.x), a.y, Math.abs(b.x - a.x), b.y - a.y, Array.from({ length: 14 }, (_, i) => `<i class="cr-bit" style="left:${8 + (i * 37) % 84}%;top:${10 + (i * 53) % 78}%;transform:rotate(${i * 40}deg);background:${lumiColour().body}"></i>`).join(''), { z: 6, cls: 'cr-bits', id: 'cape' });
          h += SX.at(960, 320, 120, 70, brushArt(), { cls: 'cr-brushtool', label: 'Brush', z: 9 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        const br = box.querySelector('.cr-brushtool');
        if (!br || br.dataset.wired) return;
        br.dataset.wired = '1';
        A.SG.drag(br, box, {
          move(p, dx, dy) {
            const bits = box.querySelector('.cr-bits');
            if (!bits) return;
            const r = SX.rectIn(bits, box);
            if (p.x > r.x - 30 && p.x < r.x + r.w + 30 && p.y > r.y - 30 && p.y < r.y + r.h + 30) {
              st.s.rub += Math.hypot(dx, dy);
              bits.style.opacity = String(Math.max(0, 1 - st.s.rub / 600));
              if (st.s.rub > 600 && !st.s.clean) { st.s.clean = true; SX.say('All clean! Let go.'); }
            }
          },
          drop() {
            if (st.s.rub > 600) SX.done(st, 'Swish, swish! All the cut fur is brushed away.');
            else SX.say('Keep rubbing the brush over the cape.');
            return false;
          }
        });
      },
      guide: () => ({ sel: '.cr-brushtool', say: 'Rub the brush over the cape.' })
    },
    {
      id: 'look', bg: 'careMirror',
      text: 'The cape comes off. Time to see Lumi\'s new haircut!',
      task: (st) => (st.done ? '' : 'Tap the mirror to look at Lumi\'s new look.'),
      lumi: (st) => Object.assign({}, MIRROR_LUMI, { mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        let h = hairdresser({ pose: st.done ? 'wave' : 'hold', item: st.done ? '' : 'mirror', mood: 'talk' });
        if (!st.done) h += SX.at(212, 34, 696, 460, '', { k: 'look', label: 'Look in the mirror', z: 6, cls: 'cr-mirrorhit' });
        else {
          const c = lumiColour();
          const card = (label, withTufts) => `<div class="cr-photo"><div class="cr-photo-pic">${SX.lumi(st, { h: 120, mood: withTufts ? 'happy' : 'excited' })}${withTufts ? `<svg class="cr-photo-tufts" viewBox="-14 -14 268 268" aria-hidden="true">${TUFTS.map((t) => `<g transform="translate(${t.lx - 30} ${t.ly - 52})">${tuftInner(c, Math.sign(t.lx - 120) * Math.abs(t.r))}</g>`).join('')}</svg>` : ''}</div><b>${label}</b></div>`;
          h += `<div class="cr-photos" style="left:14px;top:130px">${card('Before', true)}${card('Now', false)}</div>`;
          h += SX.bubble(720, 20, 'Looking great, Lumi!', { w: 200 });
        }
        return h;
      },
      tap(st, k) { if (k === 'look' && !st.done) SX.done(st, 'Wow! Neat and tidy. Lumi loves his new haircut.'); },
      guide: () => ({ sel: '.cr-mirrorhit', say: 'Tap the mirror.' })
    },
    {
      id: 'thanks', bg: 'careSalon',
      text: 'Lumi hops down from the chair. It is kind to say thank you.',
      task: (st) => (st.s.said ? '' : 'Tap the talk card to say thank you.'),
      lumi: { x: 420, y: 560, h: 210, mood: 'excited' },
      draw(st) {
        let h = SX.at(600, 140, 160, 340, P({ who: 'hairdresser', h: 340, pose: st.s.said ? 'wave' : 'stand', mood: 'talk' }), { z: 4 });
        h += SX.talkCard([{ t: 'Thank you!', art: '' }], 'say', { said: st.s.said, style: 'left:800px;top:340px;' });
        if (st.s.said) h += SX.bubble(720, 80, 'You\'re welcome! You were so still.', { w: 250 });
        return h;
      },
      tap: (st, k) => talkTap(st, k, 'Thank you!', 'Lumi said thank you. That makes people happy.'),
      guide: (st) => (st.s.said ? null : { sel: '.sx-talk', say: 'Tap the talk card.' })
    },
    SX.payStep({
      id: 'pay', bg: 'careSalon',
      price: 12,
      text: 'The haircut costs $12. How will Lumi pay?',
      lumi: { x: 700, y: 560, h: 190, flip: true },
      counter: { x: 330, y: 330, w: 260, h: 120 },
      wallet: [10, 5, 2, 1],
      draw: () => SX.at(160, 150, 150, 320, P({ who: 'hairdresser', h: 320, pose: 'give', mood: 'smile' }), { z: 1 }) + counterFront(120, 400, 500, 120, '#F6E7D3', '#C2577A'),
      doneText: 'Lumi paid for the haircut. Bye bye!'
    })
  ];
  SX.story({ id: 'haircut', title: 'Haircut day', tint: '#FBE0EA', steps: haircutSteps });

  // ================================================================ 3. A visit to the polyclinic
  SX.bg.carePolyHall = () => `${wall('#EAF2F7', '#C9D9E5', 400, '#DCE5EC')}${vol('<rect x="40" y="40" width="460" height="60" rx="14"/>', '#2E7FB8', { shade: 'v' })}${T(270, 80, 'POLYCLINIC', 30, '#fff')}
    ${vol('<rect x="560" y="40" width="200" height="140" rx="12"/>', '#FFFFFF')}<path d="M660 78v64M628 110h64" stroke="#E5534B" stroke-width="22" stroke-linecap="round"/>
    ${waitChairs(860, 300, 2, '#8EC0DC')}${windowArt(820, 70, 180, 130)}`;
  SX.bg.carePolyWait = () => `${wall('#EAF2F7', '#C9D9E5', 400, '#DCE5EC')}${waitChairs(60, 300, 4, '#8EC0DC')}${waitChairs(640, 300, 4, '#8EC0DC')}${clockArt(1040, 80, 34)}`;
  SX.bg.careConsult = () => `${wall('#F3F8FC', '#D6E4EE', 410, '#E1EAF0')}${windowArt(60, 60, 200, 150)}
    ${vol('<rect x="300" y="60" width="140" height="190" rx="10"/>', '#FFFFFF')}${T(370, 100, 'E', 54, LP.INK)}${T(370, 150, 'F P', 36, LP.INK)}${T(370, 190, 'T O Z', 24, LP.INK)}${T(370, 222, 'L P E D', 16, LP.INK)}
    ${vol('<path d="M720 300h300v40H720z"/>', '#C99A6B')}<path d="M740 340v70M1000 340v70" stroke="#8A6A4A" stroke-width="10"/>${vol('<rect x="800" y="210" width="130" height="90" rx="8"/>', '#2B2F4A')}<rect x="810" y="220" width="110" height="64" rx="4" fill="#8EC5F2"/>`;
  SX.bg.carePharmacy = () => `${wall('#EEF6F1', '#CFE3D7', 410, '#DCE8E1')}${vol('<rect x="40" y="30" width="380" height="50" rx="14"/>', '#4FB3A9', { shade: 'v' })}${T(230, 65, 'PHARMACY', 28, '#fff')}
    ${[0, 1, 2].map((r) => `<rect x="40" y="${150 + r * 76}" width="560" height="10" rx="4" fill="#C99A6B"/>${Array.from({ length: 10 }, (_, i) => vol(`<rect x="${48 + i * 55}" y="${108 + r * 76}" width="44" height="42" rx="5"/>`, ['#FFFFFF', '#E3F1FA', '#FBE9EE', '#FFF4D6'][(i + r) % 4], { lineOpacity: 0.3 })).join('')}`).join('')}
    ${vol('<rect x="720" y="50" width="300" height="90" rx="12"/>', '#2B2F4A')}${T(870, 88, 'COLLECT', 22, '#C9CCE0')}${T(870, 126, '1024', 32, '#FFC727')}`;
  SX.bg.careBedroom = () => `${wall('#FFF1E2', '#F2D7B8', 420, '#E8CDB0')}${windowArt(100, 60, 200, 160)}
    ${vol('<rect x="640" y="300" width="420" height="140" rx="22"/>', '#C99A6B')}${vol('<rect x="620" y="210" width="60" height="240" rx="18"/>', '#A87B50')}${vol('<rect x="680" y="270" width="140" height="56" rx="24"/>', '#FFFFFF')}`;
  const NUMBERS = [1019, 1021, 1022, 1024];
  const doctor = (o) => SX.at(800, 120, 160, 340, P(Object.assign({ who: 'doctor', h: 340, pose: 'stand', mood: 'smile', flip: true }, o)), { z: 4 });
  const PATIENT = { x: 520, y: 560, h: 220 };
  const polyclinicSteps = [
    {
      id: 'ticket', bg: 'carePolyHall',
      text: 'Lumi has a cough. Mum and Lumi go to the polyclinic. First, get a queue number.',
      task: (st) => (!st.s.printed ? 'Tap the big button on the machine.' : !st.done ? 'Tap the ticket to take it.' : ''),
      lumi: { x: 640, y: 560, h: 200, flip: true },
      draw(st) {
        let h = SX.at(250, 140, 200, 360, svg('0 0 200 360', `${LP.drop(100, 354, 90, 10)}${vol('<rect x="20" y="10" width="160" height="340" rx="20"/>', '#E3E8ED', { shade: 'h' })}<rect x="40" y="34" width="120" height="90" rx="8" fill="#2B2F4A"/>${T(100, 72, 'Queue', 18, '#C9CCE0')}${T(100, 104, 'ticket', 18, '#C9CCE0')}
          ${vol('<rect x="60" y="250" width="80" height="16" rx="6"/>', '#2B2F4A')}`), { z: 2 });
        h += SX.at(300, 290, 100, 100, svg('0 0 100 100', `${LP.drop(50, 92, 36, 5)}${vol('<circle cx="50" cy="48" r="38"/>', '#5BAA4A')}${T(50, 56, 'PRESS', 18, '#fff')}`), { k: 'press', label: 'Press for a ticket', z: 6, cls: st.s.printed ? '' : 'sx-glow' });
        if (st.s.printed && !st.done) h += SX.at(312, 394, 76, 70, ticketArt(), { k: 'take', label: 'Ticket 1024', z: 7, cls: 'cr-ticket-out sx-glow' });
        h += SX.at(780, 330, 110, 230, P({ who: 'mum', h: 230, pose: st.done ? 'point' : 'stand', flip: true }), { z: 4 });
        if (st.done) h += SX.at(530, 400, 76, 70, ticketArt(), { z: 7 });
        return h;
      },
      tap(st, k) {
        if (k === 'press' && !st.s.printed) { st.s.printed = true; A.tone(600, 0.1, 0.05); SX.render(); SX.say('Bzzt! A ticket comes out. Tap the ticket to take it.'); return; }
        if (k === 'take' && st.s.printed && !st.done) { st.data.ticket = 1024; SX.done(st, 'Lumi\'s number is 1024. Lumi keeps the ticket safe.'); }
      },
      guide: (st) => (!st.s.printed ? { sel: '[data-k="press"]', say: 'Tap the button.' } : { sel: '[data-k="take"]', say: 'Tap the ticket.' })
    },
    SX.copeStep({
      id: 'wait', bg: 'carePolyWait',
      text: 'There are lots of people waiting. It can feel long.',
      lumi: (st) => ({ x: 216, y: 400, h: 170, mood: st.done ? 'calm' : 'worried' }),
      draw: () => SX.at(53, 186, 110, 230, P({ who: 'mum', pose: 'sit', h: 230 }), { z: 4 }) + SX.at(377, 186, 110, 230, P({ who: 'grandpa', pose: 'sit', h: 230 }), { z: 4 })
        + SX.at(633, 186, 110, 230, P({ who: 'woman', pose: 'sit', h: 230 }), { z: 4 }),
      options: [Object.assign({}, SX.HEADPHONES, { label: 'Listen to music' }), { label: 'Play a quiet game', art: SX.prop.phone(), reply: 'A quiet game on the phone helps the time pass.' },
        { label: 'Watch for my number', art: ticketArt(), reply: 'Good idea. Lumi watches the screen for 1024.' }]
    }),
    {
      id: 'screen', bg: 'carePolyWait',
      text: (st) => `The screen shows the number being called. Lumi's ticket says 1024. Now it says ${NUMBERS[st.s.i]}.`,
      task: (st) => (st.done ? '' : 'Watch the screen. When it shows 1024, tap it.'),
      lumi: (st) => (st.done ? { x: 900, y: 560, h: 190, mood: 'excited' } : { x: 216, y: 400, h: 170, mood: 'calm' }),
      enter(st) { st.s.i = 0; tick(st); },
      draw(st) {
        const n = NUMBERS[st.s.i];
        let h = SX.at(380, 26, 360, 190, svg('0 0 360 190', `${vol('<rect x="6" y="6" width="348" height="178" rx="16"/>', '#2B2F4A')}${T(180, 54, 'NOW SERVING', 26, '#C9CCE0')}${T(180, 132, n, 70, n === 1024 ? '#7FD18A' : '#FFC727')}${T(180, 170, n === 1024 ? 'ROOM 5' : 'ROOM ' + (2 + st.s.i), 20, '#C9CCE0')}`), { k: 'screen', label: `Screen showing ${n}`, z: 6, cls: n === 1024 && !st.done ? 'sx-glow' : '' });
        h += SX.at(53, 186, 110, 230, P({ who: 'mum', pose: 'sit', h: 230 }), { z: 4 }) + SX.at(377, 186, 110, 230, P({ who: 'grandpa', pose: 'sit', h: 230 }), { z: 4 });
        h += SX.at(30, 470, 86, 80, ticketArt(), { z: 7 });
        h += SX.at(120, 488, 150, 44, '<span class="cr-tag">Lumi: 1024</span>', { z: 7 });
        if (st.s.hint) h += SX.bubble(760, 110, st.s.hint, { w: 270, tail: 'left' });
        return h;
      },
      tap(st, k, el) {
        if (k !== 'screen' || st.done) return;
        const n = NUMBERS[st.s.i];
        if (n !== 1024) { st.s.hint = `That says ${n}. Lumi's number is 1024. Keep watching.`; SX.nope(el, st.s.hint); SX.render(); return; }
        st.s.hint = null;
        SX.done(st, 'Ding! 1024 is Lumi\'s number. Lumi and Mum walk to room 5.');
      },
      guide: (st) => (NUMBERS[st.s.i] === 1024 ? { sel: '[data-k="screen"]', say: 'Tap the screen.' } : null)
    },
    {
      id: 'tell', bg: 'careConsult',
      text: 'The doctor says, "Hello Lumi. How can I help you today?"',
      task: (st) => (st.s.said ? '' : 'Tap the talk card to tell the doctor.'),
      lumi: PATIENT,
      draw(st) {
        let h = doctor({ pose: st.s.said ? 'stand' : 'wave', mood: 'talk' });
        h += SX.at(300, 330, 110, 230, P({ who: 'mum', h: 230 }), { z: 3 });
        h += SX.talkCard([{ t: 'I have', art: '' }, { t: 'a cough', art: A.ic('hurt', 52) }], 'say', { said: st.s.said, style: 'left:40px;top:250px;' });
        if (st.s.said) h += SX.bubble(620, 60, 'Thank you for telling me. Let me listen.', { w: 260 });
        return h;
      },
      tap: (st, k) => talkTap(st, k, 'I have a cough.', 'Lumi told the doctor. Telling helps the doctor help.'),
      guide: (st) => (st.s.said ? null : { sel: '.sx-talk', say: 'Tap the talk card.' })
    },
    {
      id: 'listen', bg: 'careConsult',
      text: 'The doctor uses a stethoscope to listen to Lumi\'s chest.',
      task: (st) => (st.done ? '' : 'Drag the stethoscope to Lumi\'s chest.'),
      lumi: (st) => Object.assign({}, PATIENT, { mood: st.done ? 'happy' : 'calm' }),
      draw(st) {
        let h = doctor({ pose: 'give' });
        if (!st.done) {
          h += lumiTarget(PATIENT, 'chest');
          h += SX.at(690, 300, 90, 90, svg('0 0 90 90', `${LP.drop(45, 86, 30, 4)}<path d="M60 20 q30 10 10 40" fill="none" stroke="#3E5463" stroke-width="5"/>${vol('<circle cx="40" cy="60" r="20"/>', '#C9D1D9')}<circle cx="40" cy="60" r="12" fill="url(#lpMetal)"/>`), { cls: 'sx-drag cr-stetho', label: 'Stethoscope', z: 8 });
        } else {
          const p = onLumi(PATIENT, 120, 175);
          h += SX.at(p.x - 24, p.y - 24, 48, 48, svg('0 0 48 48', vol('<circle cx="24" cy="24" r="18"/>', '#C9D1D9')), { z: 7 });
          h += SX.bubble(600, 130, 'Ooh, it feels cold! Breathe in... and out.', { w: 250, tail: 'down' });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.cr-stetho', '[data-id="chest"]', () => { SX.done(st, 'It feels cold! Lumi breathes in and out. The doctor listens.'); return true; }, { miss: () => SX.say('Put it on Lumi\'s chest.') });
      },
      guide: () => ({ sel: '.cr-stetho', say: 'Drag the stethoscope to Lumi.' })
    },
    {
      id: 'aah', bg: 'careConsult',
      text: (st) => (!st.s.on ? 'Next, the doctor looks inside Lumi\'s mouth with a little light.' : 'Say aaah!'),
      task: (st) => (!st.s.on ? 'Tap the little torch to switch it on.' : !st.s.open ? 'Tap Lumi to say aaah.' : ''),
      lumi: (st) => Object.assign({}, PATIENT, { mood: st.s.open ? 'excited' : 'calm' }),
      draw(st) {
        let h = doctor({ pose: 'point', mood: 'talk' });
        h += SX.at(700, 330, 90, 50, svg('0 0 90 50', `${st.s.on ? '<path d="M8 25 L-130 -30 L-130 80z" fill="url(#lpGlow)"/>' : ''}${LP.drop(45, 46, 36, 3)}${vol('<rect x="10" y="16" width="70" height="20" rx="8"/>', '#3E5463')}<circle cx="12" cy="26" r="7" fill="${st.s.on ? '#FFF6C8' : '#C9D1D9'}"/>`), { k: 'torch', label: 'Little torch', z: 8, cls: st.s.on ? '' : 'sx-glow' });
        if (st.s.on && !st.s.open) h += lumiHit(PATIENT, 'open', 'Say aaah');
        if (st.s.open) h += SX.bubble(600, 130, 'Aaaah!', { w: 120, tail: 'down' });
        return h;
      },
      tap(st, k) {
        if (k === 'torch' && !st.s.on) { st.s.on = true; A.tone(880, 0.1, 0.05); SX.render(); SX.say('Click! Now tap Lumi to say aaah.'); return; }
        if (k === 'open' && st.s.on && !st.s.open) { st.s.open = true; SX.done(st, 'Aaaah! Lumi\'s throat is a bit red. Medicine will help.'); }
      },
      guide: (st) => (!st.s.on ? { sel: '[data-k="torch"]', say: 'Tap the torch.' } : { sel: '[data-k="open"]', say: 'Tap Lumi.' })
    },
    SX.copeStep({
      id: 'ears', bg: 'careConsult',
      text: 'Last, the doctor gently looks in Lumi\'s ears. It feels a bit strange.',
      lumi: (st) => ({ x: 360, y: 560, h: 220, mood: st.done ? 'calm' : 'worried' }),
      draw: () => SX.at(480, 120, 160, 340, P({ who: 'doctor', h: 340, pose: 'give', mood: 'smile', flip: true }), { z: 4 }) + SX.at(140, 330, 110, 230, P({ who: 'mum', h: 230 }), { z: 3 }),
      options: [{ label: 'Squeeze Mum\'s hand', art: SX.ART.squeeze, reply: 'Mum holds Lumi\'s hand. Squeeze, and let go.' }, SX.BREATHE,
        { label: 'Say "Wait, please"', art: SX.ART.talk, reply: 'The doctor waits a moment until Lumi is ready.' }]
    }),
    SX.payStep({
      id: 'pharmacy', bg: 'carePharmacy',
      price: 8.5,
      text: 'At the pharmacy, Lumi\'s medicine is ready. It is $8.50. How will Lumi pay?',
      lumi: { x: 700, y: 560, h: 190, flip: true },
      counter: { x: 330, y: 330, w: 260, h: 120 },
      draw: (st) => SX.at(150, 150, 150, 320, P({ who: 'pharmacist', h: 320, pose: 'give', item: st.done ? '' : 'pills', mood: 'smile' }), { z: 1 }) + counterFront(100, 400, 540, 120, '#FFFFFF', '#4FB3A9')
        + SX.at(500, 290, 80, 90, medBagArt(), { z: 4 }),
      doneText: 'Lumi paid and has the medicine. Say thank you!'
    }),
    {
      id: 'home', bg: 'careBedroom',
      text: (st) => (!st.s.med ? 'At home, Mum gives Lumi the medicine with some water.' : 'Rest helps Lumi\'s body get better.'),
      task: (st) => (!st.s.med ? 'Drag the cup of water to Lumi.' : !st.done ? 'Tap the bed so Lumi can rest.' : ''),
      lumi: (st) => (st.done ? { x: 780, y: 360, h: 170, mood: 'calm', z: 3 } : { x: 420, y: 560, h: 210, mood: st.s.med ? 'happy' : 'calm' }),
      draw(st) {
        let h = SX.at(170, 330, 110, 230, P({ who: 'mum', h: 230, pose: st.s.med ? 'point' : 'give', item: st.s.med ? '' : 'pills' }), { z: 4 });
        if (!st.s.med) {
          h += lumiTarget({ x: 420, y: 560, h: 210 }, 'lumi');
          h += SX.at(300, 250, 60, 76, cupArt(true), { cls: 'sx-drag cr-cup', label: 'Cup of water', z: 8 });
        }
        h += SX.at(640, 210, 420, 230, '', { k: st.s.med && !st.done ? 'bed' : '', label: 'The bed', z: 2, cls: st.s.med && !st.done ? 'cr-bedhit' : '' });
        if (st.done) h += SX.at(650, 300, 410, 130, svg('0 0 410 130', vol('<path d="M10 30c60-30 330-30 390 0v76c-60 20-330 20-390 0z"/>', '#8EC0DC')), { z: 4 });
        return h;
      },
      after(st, box) {
        if (st.s.med) return;
        SX.dragTo(box, '.cr-cup', '[data-id="lumi"]', () => { st.s.med = true; SX.ok(); SX.render(); SX.say('Gulp! Lumi took the medicine. Now tap the bed so Lumi can rest.'); return true; }, { miss: () => SX.say('Bring the water to Lumi.') });
      },
      tap(st, k) { if (k === 'bed' && st.s.med && !st.done) SX.done(st, 'Lumi rests in bed. Soon Lumi will feel better.'); },
      guide: (st) => (!st.s.med ? { sel: '.cr-cup', say: 'Drag the water to Lumi.' } : { sel: '.cr-bedhit', say: 'Tap the bed.' })
    }
  ];
  // the screen calls numbers one after another until it reaches 1024 (then it waits for the child)
  function tick(st) {
    SX.later(st, () => {
      if (st.s.i >= NUMBERS.length - 1) return;
      st.s.i += 1;
      st.s.hint = null;
      A.tone(st.s.i === NUMBERS.length - 1 ? 988 : 660, 0.2, 0.06);
      SX.render();
      if (NUMBERS[st.s.i] === 1024) SX.say('Ding! 1024! That is Lumi\'s number. Tap the screen.');
      else { SX.say(`${NUMBERS[st.s.i]}. Not yet.`); tick(st); }
    }, 2600);
  }
  SX.story({ id: 'polyclinic', title: 'A visit to the polyclinic', tint: '#DCEBF7', steps: polyclinicSteps });
})();
