/*
  learn-teeth.js
  Learn with Lumi: Brush teeth, as a real bathroom at home (engine: stories.js, SX.lesson).
  Pull the step stool to the sink, turn on the tap and wet the brush, squeeze a pea of toothpaste,
  then the mirror view: brush the top teeth, the bottom teeth, the back teeth, the tongue (Lumi's
  friendly open smile, teeth inside the mouth), spit into the sink, rinse with the cup, put the brush
  back and turn off the tap, and smile in the mirror.
  Every step: Lumi shows it first (see-through hand), "Show me" shows it again, "Do it with me" helps.

  Shared home pieces for other lessons are on SX.HOME (bathroom wall, tiles, sink, tap, stool, cup...).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { S, state, tone } = A;
  const W = SX.W;
  const H = SX.H;
  const svg = (vb, inner, o) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" aria-hidden="true" ${o || ''}>${inner}</svg>`;
  const lumiColour = () => window.Lumi.COLORS[(A.lookWith() || {}).color] || window.Lumi.COLORS.orange;

  // ================================================================ shared home pieces (SX.HOME)
  const HOME = (SX.HOME = SX.HOME || {});
  // a wall with square tiles and a floor; floorTop = where the floor starts
  HOME.tiledWall = (c1, line, floorTop, floorC) => `<rect width="${W}" height="${H}" fill="${c1}"/>
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 84} 0V${floorTop}" stroke="${line}" stroke-width="3"/>`).join('')}${Array.from({ length: 7 }, (_, j) => `<path d="M0 ${j * 84}H${W}" stroke="${line}" stroke-width="3"/>`).join('')}
    <rect width="${W}" height="${floorTop}" fill="url(#lpShadeV)" opacity=".18"/>
    <rect y="${floorTop - 12}" width="${W}" height="12" fill="${line}"/>
    <rect y="${floorTop}" width="${W}" height="${H - floorTop}" fill="${floorC}"/>${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${floorTop + 16 + i * i * 7}H${W}" stroke="#000" stroke-opacity=".05" stroke-width="2"/>`).join('')}
    <rect y="${floorTop}" width="${W}" height="${H - floorTop}" fill="url(#lpFloorFade)"/>`;
  HOME.mirror = (x, y, w, h, inner) => `${vol(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26"/>`, '#FFFFFF')}<rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="18" fill="#DCEEF7"/>${inner || ''}
    <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="18" fill="url(#lpGlass)"/><path d="M${x + 40} ${y + h - 40}l${w * 0.25} ${-h * 0.45}M${x + 70} ${y + h - 30}l${w * 0.18} ${-h * 0.32}" stroke="#fff" stroke-opacity=".55" stroke-width="10" stroke-linecap="round"/>`;
  // the sink unit: counter at y, from x to x + w; the basin is centred at bx
  HOME.vanity = (x, y, w, bx, floorTop, c) => `${LP.drop(x + w / 2, floorTop + 4, w / 2 + 10, 8)}
    ${vol(`<rect x="${x + 10}" y="${y + 20}" width="${w - 20}" height="${floorTop - y - 20}" rx="8"/>`, c || '#C9A27A', { shade: 'v' })}
    <path d="M${x + w / 2} ${y + 30}V${floorTop - 10}" stroke="#000" stroke-opacity=".15" stroke-width="3"/>${[x + w / 2 - 22, x + w / 2 + 22].map((kx) => `<circle cx="${kx}" cy="${y + 70}" r="6" fill="#E8D7BF" stroke="${LP.INK}" stroke-opacity=".3" stroke-width="2"/>`).join('')}
    ${vol(`<rect x="${x}" y="${y}" width="${w}" height="24" rx="8"/>`, '#F7F4EF', { shade: 'v' })}
    <ellipse cx="${bx}" cy="${y + 8}" rx="96" ry="13" fill="#C7DCE8"/><ellipse cx="${bx}" cy="${y + 10}" rx="84" ry="9" fill="#AFC9D9"/><circle cx="${bx}" cy="${y + 11}" r="4" fill="#8A97A6"/>`;
  // a tap behind the basin: the spout ends at (sx, sy)
  HOME.tapSvg = (on) => svg('0 0 80 90', `${vol('<rect x="22" y="40" width="16" height="48" rx="6"/>', '#DDE3E9', { shade: 'h' })}<path d="M30 46V30a10 10 0 0 1 10-10h20a8 8 0 0 1 8 8v10" fill="none" stroke="url(#lpMetal)" stroke-width="12" stroke-linecap="round"/>
    ${vol(`<rect x="${on ? 8 : 14}" y="6" width="34" height="11" rx="5" transform="rotate(${on ? -18 : 0} 30 12)"/>`, on ? '#4FB3A9' : '#9AA6B2')}<circle cx="30" cy="14" r="5" fill="#C9D1D9" stroke="${LP.INK}" stroke-opacity=".3"/>`);
  HOME.water = (h) => `<svg viewBox="0 0 30 ${h}" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true"><rect x="7" y="0" width="16" height="${h}" rx="8" fill="#9AD3F5" opacity=".75"/><rect x="11" y="0" width="5" height="${h}" rx="2.5" fill="#fff" opacity=".6"/></svg>`;
  HOME.stool = (c) => svg('0 0 140 90', `${LP.drop(70, 86, 62, 6)}${vol('<path d="M18 34h104l-10 52H28z"/>', c || '#F4B860')}${vol('<rect x="6" y="18" width="128" height="22" rx="10"/>', c || '#F4B860')}<path d="M40 60h60" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>`);
  HOME.cup = (water, c) => svg('0 0 50 64', `${LP.drop(25, 60, 18, 4)}${vol('<path d="M8 8h34l-5 50H13z"/>', c || '#BFE3F7', { lineOpacity: 0.45 })}${water ? '<path d="M11 24h28l-3 32H14z" fill="#6FB8E8" opacity=".75"/>' : ''}<path d="M8 8h34l-5 50H13z" fill="url(#lpGlass)"/>`);
  HOME.towel = (c) => svg('0 0 140 170', `<rect x="2" y="6" width="136" height="8" rx="4" fill="url(#lpMetal)"/>${vol('<path d="M20 10h100v140a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z"/>', c || '#F4A3B9', { shade: 'h' })}<path d="M20 128h100M20 138h100" stroke="#fff" stroke-opacity=".7" stroke-width="4"/>`);
  HOME.plant = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})">${LP.drop(40, 116, 30, 5)}${vol('<path d="M40 70c-30-4-38-34-26-52 10 16 22 24 26 52zM40 70c30-4 38-34 26-52-10 16-22 24-26 52zM40 72c-4-30 0-50 0-66 10 18 10 40 0 66z"/>', '#7BC67E')}${vol('<path d="M18 74h44l-6 40H24z"/>', '#E07A5F')}</g>`;
  HOME.mat = (x, y, w, c) => `<ellipse cx="${x + w / 2}" cy="${y}" rx="${w / 2}" ry="20" fill="${c || '#BFE3F7'}"/><ellipse cx="${x + w / 2}" cy="${y}" rx="${w / 2 - 14}" ry="12" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="10 8"/>`;
  HOME.lumiColour = lumiColour;

  // ================================================================ this lesson's props
  const BRUSH = '#4FB3A9';
  const brushArt = (o) => {
    const op = o || {};
    const paste = op.paste || 0;
    return svg('0 0 200 48', `${LP.drop(100, 44, 90, 4)}${vol('<rect x="58" y="18" width="136" height="16" rx="8"/>', BRUSH, { shade: 'v' })}<rect x="150" y="21" width="34" height="6" rx="3" fill="#fff" opacity=".45"/>
      ${vol('<rect x="6" y="16" width="58" height="20" rx="7"/>', '#FFFFFF')}${[12, 22, 32, 42, 52].map((x) => `<rect x="${x}" y="4" width="7" height="14" rx="3" fill="${op.wet ? '#CFEAFB' : '#EAF4FB'}" stroke="#8EC5F2" stroke-width="1.5"/>`).join('')}
      ${paste > 0 ? `<g transform="translate(35 4) scale(${Math.max(0.25, Math.min(1, paste))})"><path d="M-22 0c4-10 12-12 20-8 6-6 18-4 22 4 4 8-4 12-20 10-14 2-26 0-22-6z" fill="#FFFFFF" stroke="#8EC5F2" stroke-width="2.5"/><path d="M-14 -4c6-2 12-2 18 0" stroke="#7FD1C4" stroke-width="4" stroke-linecap="round" fill="none"/></g>` : ''}
      ${op.wet ? '<circle cx="20" cy="40" r="3" fill="#8EC5F2"/><circle cx="44" cy="42" r="2.5" fill="#8EC5F2"/>' : ''}`);
  };
  const pasteArt = (pressed) => svg('0 0 130 44', `${LP.drop(65, 40, 58, 4)}${vol(`<path d="M8 ${pressed ? 14 : 8}h86l20 8v8l-20 8H8a6 6 0 0 1-6-6v-${pressed ? 6 : 12}a6 6 0 0 1 6-6z"/>`, '#FFFFFF')}<path d="M8 ${pressed ? 18 : 14}h70" stroke="#E5534B" stroke-width="6" stroke-linecap="round"/><path d="M8 ${pressed ? 26 : 26}h50" stroke="#4FB3A9" stroke-width="4" stroke-linecap="round"/>
    ${vol('<rect x="112" y="14" width="16" height="16" rx="4"/>', '#4FB3A9')}`);

  // Lumi's friendly face up close, in the mirror: big smile, teeth in the mouth, tongue behind the bottom teeth
  // Areas (scene px) for brushing: top teeth, bottom teeth, the back teeth at both sides, the tongue.
  const FACE = { x: 157, y: 34, w: 800, h: 502 };
  const topCurve = (x) => 330 - 12 * (1 - Math.pow((x - 400) / 150, 2)); // the top lip inside edge
  const bez = (t) => { // the bottom of the mouth, right to left
    const p = [[550, 330], [530, 478], [270, 478], [250, 330]];
    const u = 1 - t;
    const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0];
    const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1];
    const dx = -3 * u * u * p[0][0] + 3 * u * u * p[1][0] - 6 * u * t * p[1][0] + 6 * u * t * p[2][0] - 3 * t * t * p[2][0] + 3 * t * t * p[3][0];
    const dy = -3 * u * u * p[0][1] + 3 * u * u * p[1][1] - 6 * u * t * p[1][1] + 6 * u * t * p[2][1] - 3 * t * t * p[2][1] + 3 * t * t * p[3][1];
    return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  function faceSvg(st, o) {
    const op = o || {};
    const c = lumiColour();
    const clean = st.data.clean || {};
    const tooth = (x, y, w, h, up, ang, key) => `<g transform="translate(${x} ${y}) rotate(${ang || 0})"><path d="${up ? `M${-w / 2} 0v${-h + 10}a10 10 0 0 1 10 -10h${w - 20}a10 10 0 0 1 10 10v${h - 10}z` : `M${-w / 2} 0v${h - 10}a10 10 0 0 0 10 10h${w - 20}a10 10 0 0 0 10 -10v${-h + 10}z`}" fill="#FFFFFF" stroke="#D9D2C7" stroke-width="2.5"/>
      <path d="M${-w / 2 + 6} ${up ? -h + 8 : 6}v${h - 18}" stroke="#EAF4FB" stroke-width="5" stroke-linecap="round"/>
      <g class="lt-plaque lt-pl-${key}" style="opacity:${clean[key] ? 0 : 1}"><circle cx="${-w / 6}" cy="${up ? -h / 2 : h / 2}" r="4" fill="#E9D68A"/><circle cx="${w / 6}" cy="${up ? -h / 3 : h / 3}" r="3" fill="#E9D68A"/></g></g>`;
    // top teeth hang from the top lip, along its curve; the two front ones are a little bigger
    const tops = [0, 1, 2, 3, 4, 5].map((i) => {
      const x = 287 + i * 45 + 2;
      const big = i === 2 || i === 3;
      const key = i === 0 || i === 5 ? 'side' : 'top';
      return tooth(x, topCurve(x) + 2, big ? 44 : 40, big ? 38 : 32, false, 0, key);
    }).join('');
    // bottom teeth stand on the bottom of the mouth, following its curve
    const bots = [0.2, 0.31, 0.43, 0.57, 0.69, 0.8].map((t, i) => {
      const p = bez(t);
      const key = i === 0 || i === 5 ? 'side' : 'bottom';
      return tooth(p.x, p.y - 4, 38, 28, true, p.a - 180, key);
    }).join('');
    const foam = op.foam || 0;
    const bubbles = [[300, 345, 9], [360, 352, 7], [450, 350, 8], [510, 344, 9], [330, 420, 7], [470, 424, 8], [400, 360, 6], [262, 336, 6], [540, 338, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#BFE3F7" stroke-width="2"/>`).join('');
    const eyes = op.happy
      ? '<path d="M250 205q30 -30 60 0M490 205q30 -30 60 0" fill="none" stroke="#3B2F2F" stroke-width="12" stroke-linecap="round"/>'
      : '<ellipse cx="282" cy="200" rx="24" ry="28" fill="#3B2F2F"/><ellipse cx="518" cy="200" rx="24" ry="28" fill="#3B2F2F"/><circle cx="291" cy="188" r="8" fill="#fff"/><circle cx="527" cy="188" r="8" fill="#fff"/>';
    return `<svg viewBox="0 0 800 502" width="100%" height="100%" aria-hidden="true">
      <defs><clipPath id="ltMirrorClip"><rect x="0" y="0" width="800" height="502" rx="22"/></clipPath>
        <radialGradient id="ltMouth" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#E58A98"/><stop offset="1" stop-color="#C46677"/></radialGradient></defs>
      <g clip-path="url(#ltMirrorClip)">
        <rect width="800" height="502" fill="#E4F2F9"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 84} 0V502" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`).join('')}
        <circle cx="160" cy="70" r="62" fill="${c.body}"/><circle cx="160" cy="70" r="34" fill="#fff" opacity=".35"/><circle cx="640" cy="70" r="62" fill="${c.body}"/><circle cx="640" cy="70" r="34" fill="#fff" opacity=".35"/>
        <ellipse cx="400" cy="380" rx="370" ry="330" fill="${c.body}"/><ellipse cx="400" cy="380" rx="370" ry="330" fill="url(#lpShade)" opacity=".5"/>
        <ellipse cx="400" cy="400" rx="250" ry="190" fill="#fff" opacity=".28"/>
        ${eyes}<ellipse cx="215" cy="290" rx="40" ry="22" fill="#EF8A7A" opacity=".5"/><ellipse cx="585" cy="290" rx="40" ry="22" fill="#EF8A7A" opacity=".5"/>
        <path id="ltMouthShape" d="M250 330Q400 306 550 330C530 478 270 478 250 330z" fill="url(#ltMouth)"/>
        <ellipse cx="400" cy="436" rx="104" ry="30" fill="#F4A8B8"/><path d="M400 414v26" stroke="#E58A9C" stroke-width="4" stroke-linecap="round"/><ellipse cx="370" cy="426" rx="26" ry="8" fill="#fff" opacity=".35"/>
        ${tops}${bots}
        <path d="M250 330Q400 306 550 330C530 478 270 478 250 330z" fill="none" stroke="#B2566A" stroke-width="9" stroke-linejoin="round"/>
        <g class="lt-foam" style="opacity:${foam}">${bubbles}</g>
        ${op.sparkle ? '<g class="lt-sparkle"><path d="M600 300l8 20 20 8-20 8-8 20-8-20-20-8 20-8z" fill="#FFD23F"/><path d="M200 330l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="#FFD23F"/><path d="M420 260l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="#FFF3B0"/></g>' : ''}
      </g></svg>`;
  }
  // brushing areas over the face, in scene px
  const AREA = {
    top: { x: FACE.x + 290, y: FACE.y + 300, w: 230, h: 70 },
    bottom: { x: FACE.x + 300, y: FACE.y + 400, w: 200, h: 60 },
    sideL: { x: FACE.x + 240, y: FACE.y + 310, w: 70, h: 120 },
    sideR: { x: FACE.x + 490, y: FACE.y + 310, w: 70, h: 120 },
    tongue: { x: FACE.x + 320, y: FACE.y + 400, w: 160, h: 60 }
  };

  // ================================================================ rooms
  const FLOOR = 470;
  const COUNTER = { x: 470, y: 318, w: 470, bx: 700 };
  SX.bg.homeBath = () => `${HOME.tiledWall('#E3F2EF', '#FFFFFF', FLOOR, '#E9D8C0')}
    ${HOME.mirror(540, 40, 300, 220)}
    ${vol('<rect x="900" y="60" width="150" height="16" rx="8"/>', '#C9D1D9')}
    ${HOME.mat(420, 512, 420, '#BFE3F7')}
    ${HOME.vanity(COUNTER.x, COUNTER.y, COUNTER.w, COUNTER.bx, FLOOR)}
    ${HOME.plant(508, 236, 0.7)}`;
  SX.bg.homeBathMirror = () => `${HOME.tiledWall('#E3F2EF', '#FFFFFF', 560, '#E9D8C0')}${vol(`<rect x="${FACE.x - 16}" y="${FACE.y - 16}" width="${FACE.w + 32}" height="${FACE.h + 32}" rx="34"/>`, '#FFFFFF')}`;

  // ================================================================ where things are
  const LUMI_FLOOR = { x: 230, y: 500, h: 210 };
  const LUMI_STOOL = { x: 435, y: 450, h: 200 };
  const lumiAt = (st) => Object.assign({}, st.data.stool ? LUMI_STOOL : LUMI_FLOOR);
  const SPOT = {
    stool: { x: 360, y: 420, w: 150, h: 90 },
    tap: { x: 652, y: 210, w: 100, h: 112 },
    cup: { x: 856, y: 236, w: 64, h: 82 },
    brushCup: { x: 808, y: 196, w: 140, h: 36 },
    brushCounter: { x: 500, y: 276, w: 190, h: 46 },
    paste: { x: 770, y: 284, w: 120, h: 40 }
  };
  const tapEl = (st, k) => SX.at(SPOT.tap.x, SPOT.tap.y, SPOT.tap.w, SPOT.tap.h, HOME.tapSvg(st.data.tapOn), { k, label: st.data.tapOn ? 'Turn off the tap' : 'Turn on the tap', cls: `lt-tap ${k ? 'sx-glow' : ''}`, z: 3, id: 'tap' });
  const TK = SPOT.tap.w / 80;
  const SPOUT = { x: SPOT.tap.x + 68 * TK, y: SPOT.tap.y + 40 * TK };
  const waterEl = (st) => (st.data.tapOn ? SX.at(SPOUT.x - 15, SPOUT.y, 30, COUNTER.y + 8 - SPOUT.y, HOME.water(COUNTER.y + 8 - SPOUT.y), { cls: 'lt-water', z: 2 }) : '');
  const waterTarget = () => SX.at(SPOUT.x - 55, SPOUT.y - 10, 110, COUNTER.y - SPOUT.y + 10, '', { target: true, id: 'water', label: 'The running water', z: 2 });
  // the toothbrush standing in its cup (the draggable one turns inside its own box)
  const brushInCup = (art, o) => SX.at(SPOT.brushCup.x, SPOT.brushCup.y, SPOT.brushCup.w, SPOT.brushCup.h, `<div class="lt-rot">${art}</div>`, o);
  const cupEl = (st, o) => SX.at(SPOT.cup.x, SPOT.cup.y, SPOT.cup.w, SPOT.cup.h, HOME.cup(st.data.cupWater), Object.assign({ z: 4, cls: 'lt-cup' }, o || {}));
  const counterThings = (st, skip) => {
    const sk = skip || {};
    let h = '';
    if (!sk.tap) h += tapEl(st) + waterEl(st);
    if (!sk.cup) h += cupEl(st);
    if (!sk.paste) h += SX.at(SPOT.paste.x, SPOT.paste.y, SPOT.paste.w, SPOT.paste.h, pasteArt(), { z: 4 });
    if (!sk.brush) h += st.data.brushIn === 'cup' ? brushInCup(brushArt({ wet: st.data.wet }), { z: 3 })
      : SX.at(SPOT.brushCounter.x, SPOT.brushCounter.y, SPOT.brushCounter.w, SPOT.brushCounter.h, brushArt({ wet: st.data.wet, paste: st.data.paste ? 1 : 0 }), { z: 4 });
    if (st.data.stool) h += SX.at(SPOT.stool.x + 6, SPOT.stool.y + 6, SPOT.stool.w, SPOT.stool.h, HOME.stool(), { z: 4 });
    return h;
  };
  // the progress bar while brushing
  const bar = (st) => `<div class="ln-progress" style="left:${FACE.x + 250}px;top:${FACE.y + FACE.h - 34}px;width:300px"><i style="width:${Math.round(Math.min(1, (st.s.rub || 0) / (st.s.need || 700)) * 100)}%"></i></div>`;

  // a brushing step in the mirror: area = which teeth; the plaque on those teeth fades as Lumi brushes
  function brushStep(id, key, areas, text, task, praise, extra) {
    return Object.assign({
      id,
      bg: 'homeBathMirror',
      text,
      task,
      lumi: null,
      enter(st) { st.s.need = 650; },
      draw(st) {
        const clean = st.data.clean || {};
        const foam = Math.min(0.95, (st.data.foam || 0) + (st.done ? 0 : 0));
        let h = SX.at(FACE.x, FACE.y, FACE.w, FACE.h, faceSvg(st, { foam, sparkle: st.done && key === 'top' && false }), { z: 1, cls: 'lt-face' });
        areas.forEach((a, i) => { h += SX.at(AREA[a].x, AREA[a].y, AREA[a].w, AREA[a].h, '', { target: true, id: key + i, cls: `lt-area lt-${key} ${st.done || clean[key] ? '' : 'ln-glow'}`, label: 'Brush here', z: 3 }); });
        if (!st.done) {
          h += SX.at(930, 300, 170, 44, brushArt({ wet: true, paste: 1 }), { cls: 'lt-brush', label: 'Toothbrush', z: 8 });
          h += bar(st);
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        let counted = 0;
        SX.scrub(box, '.lt-brush', {
          area: `.lt-${key}`,
          need: st.s.need,
          progress(f) {
            box.querySelectorAll(`.lt-pl-${key}`).forEach((p) => { p.style.opacity = String(1 - f); });
            const fo = box.querySelector('.lt-foam');
            st.data.foam = Math.max(st.data.foam || 0, Math.min(0.95, 0.2 + f * 0.8));
            if (fo) fo.style.opacity = String(st.data.foam);
            const b = box.querySelector('.ln-progress i');
            if (b) b.style.width = Math.round(f * 100) + '%';
            const n = Math.floor(f * 10);
            if (n > counted && n < 10) { counted = n; SX.say(String(n)); }
          },
          full() { SX.say('Ten! All clean. Let go of the brush.'); },
          done() { st.data.clean = Object.assign({}, st.data.clean, { [key]: true }); SX.done(st, praise); },
          more: 'Keep brushing. Back and forth, back and forth.'
        });
      },
      auto(st) { st.data.clean = Object.assign({}, st.data.clean, { [key]: true }); st.data.foam = 0.9; SX.done(st, praise); },
      demo: () => ({ sel: `.lt-${key}`, rub: true }),
      guide: (st) => (st.done ? null : { sel: '.lt-brush', say: task })
    }, extra || {});
  }

  // ================================================================ the steps
  const steps = [
    {
      id: 'stool',
      bg: 'homeBath',
      text: "It's time to brush teeth. The sink is high, so Lumi uses a step stool.",
      task: (st) => (st.done ? '' : 'Drag the step stool to the sink.'),
      lumi: (st) => Object.assign(lumiAt(st), { mood: st.done ? 'excited' : 'happy' }),
      enter(st) { st.data.brushIn = 'cup'; st.data.stool = false; },
      draw(st) {
        let h = counterThings(st, { brush: false });
        if (!st.data.stool) {
          h += SX.at(SPOT.stool.x, SPOT.stool.y, SPOT.stool.w, SPOT.stool.h, '<div class="lt-spot"></div>', { target: true, id: 'stoolspot', label: 'In front of the sink', z: 1 });
          h += SX.at(930, 440, 140, 90, HOME.stool(), { cls: 'lt-stool', label: 'Step stool', z: 6 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lt-stool', '[data-id="stoolspot"]', () => { st.data.stool = true; SX.ok(); SX.done(st, 'Up Lumi goes! Now Lumi can reach the sink.'); return true; }, { miss: () => SX.say('Bring the stool to the sink, where the circle is.') });
      },
      auto(st) { st.data.stool = true; SX.done(st, 'Up Lumi goes! Now Lumi can reach the sink.'); },
      guide: (st) => (st.done ? null : { sel: '.lt-stool', to: '[data-id="stoolspot"]', say: 'Drag the stool to the sink.' })
    },
    {
      id: 'wet',
      bg: 'homeBath',
      text: 'First, a little water on the toothbrush.',
      task: (st) => (st.done ? '' : !st.data.tapOn ? 'Tap the tap to turn the water on.' : 'Drag the toothbrush under the water.'),
      lumi: (st) => lumiAt(st),
      enter(st) { st.data.stool = true; st.data.brushIn = 'cup'; },
      draw(st) {
        let h = counterThings(st, { tap: true, brush: true });
        h += tapEl(st, st.data.tapOn ? null : 'tap') + waterEl(st);
        if (st.data.tapOn && !st.done) {
          h += waterTarget();
          h += brushInCup(brushArt(), { cls: 'lt-brush', label: 'Toothbrush', z: 6 });
        } else if (st.done) h += SX.at(SPOT.brushCounter.x, SPOT.brushCounter.y, SPOT.brushCounter.w, SPOT.brushCounter.h, brushArt({ wet: true }), { z: 4 });
        else h += brushInCup(brushArt(), { z: 3 });
        return h;
      },
      tap(st, k) {
        if (k !== 'tap' || st.data.tapOn) return;
        st.data.tapOn = true;
        tone(300, 0.4, 0.03);
        SX.render();
        SX.say('Shhh, the water is running. Now drag the toothbrush under the water.');
      },
      after(st, box) {
        if (st.done || !st.data.tapOn) return;
        SX.dragTo(box, '.lt-brush', '[data-id="water"]', () => { st.data.wet = true; st.data.brushIn = 'counter'; SX.ok(); SX.done(st, 'The toothbrush is wet.'); return true; }, { miss: () => SX.say('Hold it under the running water.') });
      },
      auto(st) { st.data.tapOn = true; st.data.wet = true; st.data.brushIn = 'counter'; SX.done(st, 'The toothbrush is wet.'); },
      demo: (st) => (!st.data.tapOn ? { sel: '[data-k="tap"]', tap: true } : { sel: '.lt-brush', to: '[data-id="water"]' }),
      guide: (st) => (st.done ? null : !st.data.tapOn ? { sel: '[data-k="tap"]', say: 'Tap the tap.' } : { sel: '.lt-brush', to: '[data-id="water"]', say: 'Drag the toothbrush under the water.' })
    },
    {
      id: 'paste',
      bg: 'homeBath',
      text: 'Now the toothpaste. Lumi needs just a little, the size of a pea.',
      task: (st) => (st.done ? '' : 'Press and hold the toothpaste.'),
      lumi: (st) => lumiAt(st),
      enter(st) { st.data.stool = true; st.data.tapOn = true; st.data.wet = true; st.data.brushIn = 'counter'; st.s.p = 0; },
      draw(st) {
        let h = counterThings(st, { paste: true, brush: true });
        h += SX.at(SPOT.brushCounter.x, SPOT.brushCounter.y, SPOT.brushCounter.w, SPOT.brushCounter.h, `<div class="lt-brushp">${brushArt({ wet: true, paste: st.done ? 1 : st.s.p })}</div>`, { z: 4, id: 'brushp' });
        if (!st.done) {
          h += SX.at(SPOT.brushCounter.x + 60, SPOT.brushCounter.y - 56, 150, 50, pasteArt(st.s.pressing), { cls: 'lt-paste sx-glow', label: 'Toothpaste: press and hold', z: 6, style: 'transform:rotate(180deg) scaleY(-1)' });
          h += `<div class="ln-tip" style="left:${SPOT.brushCounter.x + 20}px;top:${SPOT.brushCounter.y - 110}px">Just a pea</div>`;
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        const t = box.querySelector('.lt-paste');
        if (!t || t.dataset.wired) return;
        t.dataset.wired = '1';
        let iv = null;
        const stop = () => { clearInterval(iv); iv = null; if (!st.done && st.s.p > 0) SX.say('A little more. Press and hold.'); };
        t.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          A.hideHand();
          clearInterval(iv);
          iv = setInterval(() => {
            st.s.p = Math.min(1, st.s.p + 0.07);
            const b = box.querySelector('.lt-brushp');
            if (b) b.innerHTML = brushArt({ wet: true, paste: st.s.p });
            tone(300 + st.s.p * 200, 0.05, 0.02);
            if (st.s.p >= 1) { clearInterval(iv); iv = null; SX.done(st, 'Just a pea. Perfect!'); }
          }, 90);
        });
        t.addEventListener('pointerup', stop);
        t.addEventListener('pointerleave', stop);
        t.addEventListener('pointercancel', stop);
      },
      auto(st) { st.s.p = 1; SX.done(st, 'Just a pea. Perfect!'); },
      demo: () => ({ sel: '.lt-paste', tap: true }),
      guide: (st) => (st.done ? null : { sel: '.lt-paste', say: 'Press and hold the toothpaste.' })
    },
    brushStep('top', 'top', ['top'], 'Lumi looks in the mirror and smiles wide, so the teeth can be seen.', 'Brush the top teeth. Move the brush back and forth.', 'Sparkly top teeth!', {
      enter(st) { st.s.need = 650; st.data.clean = {}; st.data.foam = 0; }
    }),
    brushStep('bottom', 'bottom', ['bottom'], 'Now the bottom teeth. Lumi counts to ten.', 'Brush the bottom teeth. Back and forth.', 'Shiny bottom teeth!'),
    brushStep('sides', 'side', ['sideL', 'sideR'], 'The teeth at the back need brushing too, on both sides.', 'Brush the back teeth on each side.', 'The back teeth are clean too!', { min: 2 }),
    brushStep('tongue', 'tongue', ['tongue'], 'Last, a gentle brush on the tongue. Soft and slow, it may tickle.', 'Gently brush the tongue.', 'Fresh and clean!', { min: 3 }),
    {
      id: 'spit',
      bg: 'homeBath',
      text: 'Lumi has foam in his mouth. Spit it into the sink.',
      task: (st) => (st.done ? '' : 'Tap Lumi to spit into the sink.'),
      lumi: (st) => Object.assign(lumiAt(st), { mood: st.done ? 'happy' : 'calm' }),
      enter(st) { st.data.stool = true; st.data.tapOn = true; st.data.brushIn = 'counter'; },
      draw(st) {
        let h = counterThings(st);
        const L2 = LUMI_STOOL;
        if (!st.done) {
          h += `<div class="lt-foamface" style="left:${L2.x + 6}px;top:${L2.y - 112}px"></div>`;
          h += SX.at(L2.x - 90, L2.y - 190, 180, 190, '', { k: 'spit', label: 'Spit into the sink', z: 7 });
        } else h += `<div class="lt-splash" style="left:${COUNTER.bx - 60}px;top:${COUNTER.y - 24}px"></div>`;
        return h;
      },
      tap(st, k) { if (k === 'spit') { tone(220, 0.15, 0.05); SX.done(st, 'Ptoo! Into the sink. Well done.'); } },
      auto(st) { SX.done(st, 'Ptoo! Into the sink. Well done.'); },
      demo: () => ({ sel: '[data-k="spit"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="spit"]', say: 'Tap Lumi to spit.' })
    },
    {
      id: 'rinse',
      min: 2,
      bg: 'homeBath',
      text: 'Rinse with a little water from the cup.',
      task: (st) => (st.done ? '' : !st.data.cupWater ? 'Drag the cup under the tap to fill it.' : 'Drag the cup to Lumi to take a sip.'),
      lumi: (st) => lumiAt(st),
      enter(st) { st.data.stool = true; st.data.tapOn = true; st.data.cupWater = false; },
      draw(st) {
        let h = counterThings(st, { cup: true });
        if (!st.done) {
          h += cupEl(st, { cls: 'lt-cup lt-cupdrag', label: 'Cup', z: 8 });
          h += st.data.cupWater ? SX.at(LUMI_STOOL.x - 80, LUMI_STOOL.y - 180, 160, 170, '', { target: true, id: 'lumi', label: 'Lumi', z: 7 }) : waterTarget();
        } else h += cupEl(st);
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lt-cupdrag', st.data.cupWater ? '[data-id="lumi"]' : '[data-id="water"]', () => {
          if (!st.data.cupWater) { st.data.cupWater = true; SX.ok(); SX.render(); SX.say('The cup has water. Now drag it to Lumi.'); return true; }
          st.data.cupWater = false;
          SX.done(st, 'Swish, swish, and spit. All rinsed!');
          return true;
        });
      },
      auto(st) { st.data.cupWater = false; SX.done(st, 'Swish, swish, and spit. All rinsed!'); },
      demo: (st) => ({ sel: '.lt-cupdrag', to: st.data.cupWater ? '[data-id="lumi"]' : '[data-id="water"]' }),
      guide: (st) => (st.done ? null : { sel: '.lt-cupdrag', to: st.data.cupWater ? '[data-id="lumi"]' : '[data-id="water"]', say: st.data.cupWater ? 'Drag the cup to Lumi.' : 'Drag the cup under the tap.' })
    },
    {
      id: 'tidy',
      bg: 'homeBath',
      text: 'Tidy up: the toothbrush goes back in the cup, and the water goes off.',
      task: (st) => (st.done ? '' : st.data.brushIn !== 'cup' ? 'Drag the toothbrush into the cup.' : 'Tap the tap to turn the water off.'),
      lumi: (st) => lumiAt(st),
      enter(st) { st.data.stool = true; st.data.tapOn = true; st.data.brushIn = 'counter'; st.data.cupWater = false; },
      draw(st) {
        let h = counterThings(st, { tap: true, brush: true, cup: true });
        h += tapEl(st, st.data.brushIn === 'cup' && st.data.tapOn ? 'tapoff' : null) + waterEl(st);
        h += cupEl(st, st.data.brushIn !== 'cup' ? { target: true, id: 'cup', label: 'Cup' } : {});
        if (st.data.brushIn === 'cup') h += brushInCup(brushArt({ wet: true }), { z: 3 });
        else h += SX.at(SPOT.brushCounter.x, SPOT.brushCounter.y, SPOT.brushCounter.w, SPOT.brushCounter.h, brushArt({ wet: true }), { cls: 'lt-brush', label: 'Toothbrush', z: 8 });
        return h;
      },
      tap(st, k) {
        if (k !== 'tapoff') return;
        st.data.tapOn = false;
        tone(500, 0.12, 0.05);
        SX.done(st, 'Water off. All tidy!');
      },
      after(st, box) {
        if (st.done || st.data.brushIn === 'cup') return;
        SX.dragTo(box, '.lt-brush', '[data-id="cup"]', () => { st.data.brushIn = 'cup'; SX.ok(); SX.render(); SX.say('In the cup. Now turn the water off.'); return true; });
      },
      auto(st) { st.data.brushIn = 'cup'; st.data.tapOn = false; SX.done(st, 'Water off. All tidy!'); },
      demo: (st) => (st.data.brushIn !== 'cup' ? { sel: '.lt-brush', to: '[data-id="cup"]' } : { sel: '[data-k="tapoff"]', tap: true }),
      guide: (st) => (st.done ? null : st.data.brushIn !== 'cup' ? { sel: '.lt-brush', to: '[data-id="cup"]', say: 'Drag the toothbrush into the cup.' } : { sel: '[data-k="tapoff"]', say: 'Turn the water off.' })
    },
    {
      id: 'smile',
      bg: 'homeBathMirror',
      text: 'All done! Lumi looks in the mirror.',
      task: (st) => (st.done ? '' : 'Tap the mirror to see the big smile.'),
      lumi: null,
      enter(st) { st.data.clean = { top: true, bottom: true, side: true, tongue: true }; st.data.foam = 0; },
      draw(st) {
        let h = SX.at(FACE.x, FACE.y, FACE.w, FACE.h, faceSvg(st, { foam: 0, sparkle: st.done, happy: st.done }), { z: 1, k: st.done ? null : 'mirror', label: 'The mirror' });
        if (st.done) h += SX.bubble(FACE.x + FACE.w - 300, FACE.y + 30, 'Clean teeth!', { w: 220 });
        return h;
      },
      tap(st, k) { if (k === 'mirror') { tone(880, 0.3, 0.06); SX.done(st, 'What a shiny, clean smile!'); } },
      auto(st) { SX.done(st, 'What a shiny, clean smile!'); },
      guide: (st) => (st.done ? null : { sel: '[data-k="mirror"]', say: 'Tap the mirror.' }),
      demo: () => ({ sel: '[data-k="mirror"]', tap: true })
    }
  ];

  // steps can be for Medium (min 2) or Challenge (min 3) only, like the old lessons
  const def = { tut: 'teeth', realText: 'Brush your teeth in the morning and at night. Lumi can count to ten with you.', realSay: 'brushed your teeth for real' };
  Object.defineProperty(def, 'steps', { get: () => steps.filter((s) => !s.min || s.min <= A.level()), set() {}, enumerable: true });
  Object.defineProperty(def, 'pages', { get: () => def.steps, set() {}, enumerable: true });
  SX.lesson(def);
  SX.levelSteps = (list) => list.filter((s) => !s.min || s.min <= A.level());
  // helper for other lesson files: SX.lessonWithLevels({ tut, ... }, steps)
  SX.lessonWithLevels = (d, list) => {
    Object.defineProperty(d, 'steps', { get: () => SX.levelSteps(list), set() {}, enumerable: true });
    Object.defineProperty(d, 'pages', { get: () => d.steps, set() {}, enumerable: true });
    SX.lesson(d);
  };
})();
