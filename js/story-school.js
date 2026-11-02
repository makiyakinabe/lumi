/*
  story-school.js
  Three real-life practice stories, built on the story engine (stories.js):
  - A new teacher (Little ones, Primary): bag in the cubby, a new teacher, feelings and coping, saying
    hello, the visual timetable ("What's next?"), art, snack, play, goodbye.
  - Fire drill at school (all ages): the alarm, coping with the noise, leaving the bag, lining up,
    walking down the stairs, the assembly point, being counted, all clear, a drink of water.
  - Asking for help at work (Teens): café work training: apron, napkins, wiping tables, asking
    "Can you show me?", filling the sugar jars, a customer question, clocking out.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { L, ic, esc } = A;
  const W = SX.W;
  const H = SX.H;
  const P = (o) => A.person(o);
  const txt = (x, y, t, size, fill, o) => `<text x="${x}" y="${y}" text-anchor="${(o && o.anchor) || 'middle'}" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${size}" fill="${fill}">${esc(t)}</text>`;
  const svgBox = (vb, inner) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" aria-hidden="true">${inner}</svg>`;
  const inner = (svg) => svg.replace(/^<svg[^>]*>|<\/svg>$/g, '');

  // Lumi can wear a café apron (Asking for help at work): drawn on his tummy, so it moves with him
  const lumiPlain = SX.lumi;
  SX.lumi = (st, o) => {
    const svg = lumiPlain(st, o);
    if (!(st && st.data && st.data.skApron)) return svg;
    const apron = `<g>${vol('<path d="M70 178h100c2 16-2 34-12 44H82c-10-10-14-28-12-44z"/><rect x="92" y="158" width="56" height="26" rx="6"/>', '#6B4A3A', { lineOpacity: 0.4 })}
      <path d="M94 160 L76 138 M146 160 L164 138" stroke="#6B4A3A" stroke-width="6" stroke-linecap="round"/><rect x="104" y="192" width="32" height="18" rx="4" fill="#fff" opacity=".22"/></g>`;
    return svg.replace(/<\/svg>$/, `${apron}</svg>`);
  };

  // ---------------------------------------------------------------- shared props
  const PR = {
    backpack: (c) => svgBox('0 0 100 110', `${LP.drop(50, 104, 40, 6)}${vol('<rect x="14" y="16" width="72" height="86" rx="22"/>', c || '#4A78A8')}${vol('<rect x="26" y="58" width="48" height="34" rx="10"/>', '#FFD23F')}<path d="M34 18c0-16 32-16 32 0" fill="none" stroke="#2B4A7A" stroke-width="6"/><path d="M30 64h40" stroke="#C99A10" stroke-width="3"/>`),
    lunchbox: (open) => svgBox('0 0 120 80', `${LP.drop(60, 74, 54, 5)}${vol('<rect x="8" y="26" width="104" height="46" rx="10"/>', '#7FB069')}${open ? `${vol('<rect x="18" y="30" width="40" height="30" rx="6"/>', '#F6D38E')}${vol('<circle cx="84" cy="44" r="16"/>', '#E5534B')}<path d="M84 28v-6" stroke="#6B4A3A" stroke-width="3"/>` : vol('<rect x="6" y="14" width="108" height="18" rx="8"/>', '#5B9A4A')}`),
    bottle: () => svgBox('0 0 50 110', `${LP.drop(25, 106, 18, 4)}${vol('<rect x="10" y="26" width="30" height="78" rx="10"/>', '#8EC5F2')}<rect x="10" y="26" width="30" height="78" rx="10" fill="url(#lpGlass)"/>${vol('<rect x="14" y="10" width="22" height="18" rx="5"/>', '#4A78A8')}`),
    alarm: (ring) => svgBox('0 0 100 100', `${vol('<rect x="10" y="10" width="80" height="80" rx="14"/>', '#E5534B')}${vol('<circle cx="50" cy="46" r="24"/>', '#C9D1D9')}<circle cx="50" cy="46" r="8" fill="#9AA6B2"/>${txt(50, 84, 'FIRE', 13, '#fff')}${ring ? '<g class="sk-ring"><path d="M-8 30q-10 16 0 32M-22 22q-16 24 0 48M108 30q10 16 0 32M122 22q16 24 0 48" fill="none" stroke="#E5534B" stroke-width="5" stroke-linecap="round"/></g>' : ''}`),
    tag: () => svgBox('0 0 120 70', `${LP.drop(60, 66, 54, 4)}${vol('<rect x="4" y="8" width="112" height="56" rx="10"/>', '#FFFFFF')}<rect x="4" y="8" width="112" height="16" rx="8" fill="#E5534B"/>${txt(60, 52, 'LUMI', 22, '#3B2F2F')}<circle cx="60" cy="16" r="4" fill="#fff"/>`),
    cloth: () => svgBox('0 0 90 60', `${LP.drop(45, 56, 40, 4)}${vol('<path d="M6 16c10-10 26 4 40-4s28-6 38 6l-4 34c-12 8-24-2-38 4s-26 2-34-6z"/>', '#7FC4F0')}<path d="M18 24h52M16 38h56" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`),
    apron: () => svgBox('0 0 100 130', `${vol('<path d="M18 46h64c4 30 0 64-12 80H30C18 110 14 76 18 46z"/><rect x="32" y="12" width="36" height="38" rx="8"/>', '#6B4A3A')}<path d="M34 14 L22 0 M66 14 L78 0" stroke="#6B4A3A" stroke-width="6" stroke-linecap="round"/><rect x="38" y="70" width="24" height="18" rx="4" fill="#fff" opacity=".22"/>`),
    card: () => svgBox('0 0 90 60', `${LP.drop(45, 56, 40, 4)}${vol('<rect x="4" y="4" width="82" height="52" rx="8"/>', '#2F7E79')}<circle cx="24" cy="26" r="11" fill="#fff" opacity=".85"/><path d="M42 20h34M42 32h24" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>${txt(45, 50, 'STAFF', 10, '#fff')}`),
    paintPot: (c) => svgBox('0 0 60 60', `${LP.drop(30, 56, 24, 4)}${vol('<path d="M8 22h44l-4 32H12z"/>', '#FFFFFF')}${vol('<ellipse cx="30" cy="22" rx="22" ry="8"/>', c)}`),
    jar: (level, lid) => svgBox('0 0 120 160', `${LP.drop(60, 154, 50, 6)}<rect x="16" y="34" width="88" height="118" rx="18" fill="#EAF4FB" opacity=".55"/>
      ${level > 0 ? `<rect x="20" y="${150 - level * 1.1}" width="80" height="${level * 1.1}" rx="12" fill="#FFFFFF" stroke="#E6DCCB" stroke-width="2"/>${[0, 1, 2, 3].map((i) => `<circle cx="${32 + i * 18}" cy="${150 - level * 1.1 + 8}" r="2" fill="#E6DCCB"/>`).join('')}` : ''}
      <rect x="16" y="34" width="88" height="118" rx="18" fill="url(#lpGlass)"/><rect x="16" y="34" width="88" height="118" rx="18" fill="none" stroke="#9FB0BE" stroke-width="3"/>
      ${lid ? vol('<rect x="10" y="18" width="100" height="22" rx="8"/>', '#C99A6B') : '<rect x="22" y="28" width="76" height="8" rx="4" fill="#C9D1D9"/>'}`),
    scoop: (full) => svgBox('0 0 110 60', `${LP.drop(55, 56, 46, 4)}<path d="M64 30h40" stroke="url(#lpMetal)" stroke-width="10" stroke-linecap="round"/>${vol('<path d="M4 18h62v14a30 22 0 0 1-62 0z"/>', '#C9D1D9')}${full ? vol('<ellipse cx="35" cy="20" rx="30" ry="10"/>', '#FFFFFF', { lineOpacity: 0.3 }) : ''}`),
    lid: () => svgBox('0 0 110 40', `${LP.drop(55, 36, 48, 4)}${vol('<rect x="5" y="8" width="100" height="24" rx="9"/>', '#C99A6B')}`),
    sugarBag: () => svgBox('0 0 110 140', `${LP.drop(55, 136, 46, 5)}${vol('<path d="M14 30h82l6 104H8z"/>', '#F6E7D3')}${vol('<path d="M14 30l10-18h62l10 18z"/>', '#E8CDB0')}${txt(55, 92, 'SUGAR', 18, '#B5543B')}`),
    napkin: (folded) => svgBox('0 0 120 100', folded
      ? `${LP.drop(60, 86, 48, 6)}${vol('<path d="M14 78L60 20l46 58z"/>', '#FFFFFF')}<path d="M60 20v58" stroke="#E6DCCB" stroke-width="2"/><path d="M40 82l30-46" stroke="url(#lpMetal)" stroke-width="6" stroke-linecap="round"/>`
      : `${LP.drop(60, 86, 52, 6)}${vol('<path d="M12 30l96-8 4 56-100 6z"/>', '#FFFFFF')}<path d="M14 56l96-6" stroke="#E6DCCB" stroke-width="2"/>`),
    timeClock: (out) => svgBox('0 0 140 180', `${LP.drop(70, 176, 56, 6)}${vol('<rect x="10" y="10" width="120" height="160" rx="16"/>', '#3E4A5A', { shade: 'h' })}<rect x="22" y="24" width="96" height="44" rx="6" fill="${out ? '#7FD18A' : '#9FC3DC'}"/>${txt(70, 54, out ? 'OUT 5:00' : '4:59 PM', 18, '#1F2A33')}<rect x="44" y="96" width="52" height="10" rx="5" fill="#1F2A33"/>${txt(70, 140, 'TAP CARD', 14, '#C9D1D9')}`)
  };

  // ---------------------------------------------------------------- backgrounds
  function classroom(o) {
    const op = o || {};
    let planks = '';
    for (let i = 0; i < 7; i++) planks += `<path d="M0 ${440 + i * 20}H${W}" stroke="#C49A6E" stroke-width="2" opacity=".5"/>`;
    return `<rect width="${W}" height="${H}" fill="#E6F2DE"/><rect y="0" width="${W}" height="30" fill="#D4E6C8"/>
      <rect y="430" width="${W}" height="${H - 430}" fill="#D9B48A"/>${planks}<rect y="430" width="${W}" height="${H - 430}" fill="url(#lpFloorFade)"/><rect y="420" width="${W}" height="12" fill="#B9946A"/>
      ${vol('<rect x="40" y="60" width="200" height="160" rx="12"/>', '#FFFFFF')}<rect x="52" y="72" width="176" height="136" rx="6" fill="url(#lpSky)"/><path d="M140 72v136M52 140h176" stroke="#fff" stroke-width="6"/>${vol('<circle cx="196" cy="104" r="14"/>', '#F4D35E', { line: false })}
      ${vol('<rect x="320" y="44" width="480" height="236" rx="12"/>', '#9AA6B2')}<rect x="332" y="56" width="456" height="212" rx="6" fill="#FFFFFF"/><rect x="332" y="56" width="456" height="212" rx="6" fill="url(#lpGlass)" opacity=".5"/>${vol('<rect x="360" y="274" width="400" height="10" rx="4"/>', '#9AA6B2')}
      ${op.boardText ? txt(560, 100, op.boardText, 30, '#2F7E79') : ''}
      <g transform="translate(838 40)">${vol('<circle cx="36" cy="36" r="32"/>', '#FFFFFF')}<path d="M36 36V16M36 36l14 8" stroke="#3B2F2F" stroke-width="4" stroke-linecap="round"/></g>
      ${vol('<rect x="950" y="150" width="140" height="276" rx="8"/>', '#B07D4F', { shade: 'h' })}<rect x="972" y="172" width="96" height="70" rx="6" fill="url(#lpSky)"/>${vol('<circle cx="1068" cy="300" r="8"/>', '#E8B83A')}
      ${vol('<rect x="960" y="110" width="120" height="30" rx="6"/>', '#3F9A5A')}${txt(1020, 132, 'EXIT', 20, '#fff')}`;
  }
  SX.bg.schoolClass = () => classroom();
  SX.bg.schoolTimetable = () => classroom({ boardText: "Today's plan" });
  SX.bg.schoolStairs = () => {
    let s = `<rect width="${W}" height="${H}" fill="#EEF0E6"/>${vol('<rect x="820" y="40" width="220" height="150" rx="10"/>', '#FFFFFF')}<rect x="832" y="52" width="196" height="126" rx="6" fill="url(#lpSky)"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 80 + i * 150;
      const y = 170 + i * 62;
      s += `<rect x="${x}" y="${y}" width="${W - x}" height="62" fill="#C9C2B4"/><rect x="${x}" y="${y}" width="${W - x}" height="16" fill="#E2DCCF"/><rect x="${x}" y="${y}" width="${W - x}" height="5" fill="#F4C542"/>`;
    }
    s += `<rect x="0" y="${170 + 6 * 62}" width="${W}" height="${H}" fill="#C9C2B4"/>`;
    // the hand rail at Lumi's hand height, with posts down to each step
    for (let i = 0; i < 6; i++) s += `<path d="M${120 + i * 150} ${118 + i * 62}v54" stroke="#9AA6B2" stroke-width="5"/>`;
    s += `<path d="M40 85 L${80 + 6 * 150} ${85 + (6 * 150 + 40) * 62 / 150}" stroke="url(#lpMetal)" stroke-width="12" stroke-linecap="round"/><path d="M40 85 L${80 + 6 * 150} ${85 + (6 * 150 + 40) * 62 / 150}" stroke="#3B2F2F" stroke-opacity=".25" stroke-width="2"/>`;
    return s;
  };
  SX.bg.schoolField = () => `<rect width="${W}" height="${H}" fill="url(#lpSky)"/><circle cx="1040" cy="60" r="36" fill="#FFE07A"/>
    ${vol('<rect x="40" y="70" width="440" height="230" rx="8"/>', '#F6C28B', { shade: 'v' })}${[0, 1].map((r) => [0, 1, 2, 3, 4].map((c) => (r === 1 && c === 2 ? '' : `<rect x="${70 + c * 82}" y="${100 + r * 76}" width="56" height="48" rx="6" fill="#BFE3F7"/>`)).join('')).join('')}
    ${vol('<rect x="215" y="200" width="90" height="100" rx="6"/>', '#B07D4F')}<path d="M260 200v100" stroke="#8A5A3B" stroke-width="3"/>${txt(260, 60, 'LUMI PRIMARY SCHOOL', 22, '#B5543B')}
    <rect y="290" width="${W}" height="${H - 290}" fill="#8FC47A"/><path d="M0 290 Q557 270 ${W} 290" fill="#9CCB7A"/>
    ${[620, 740].map((x) => `${LP.drop(x, 296, 50, 8)}<path d="M${x} 296v-60" stroke="#8A6A4A" stroke-width="12"/>${vol(`<circle cx="${x}" cy="210" r="46"/>`, '#5DAA68')}`).join('')}
    <path d="M925 380v-150" stroke="#9AA6B2" stroke-width="8"/>${vol('<rect x="850" y="150" width="150" height="80" rx="10"/>', '#3F9A5A')}${txt(925, 182, 'ASSEMBLY', 18, '#fff')}${txt(925, 210, 'POINT', 18, '#fff')}`;
  function cafe(o) {
    const op = o || {};
    let s = `<rect width="${W}" height="${H}" fill="#FBF0E2"/><rect y="0" width="${W}" height="40" fill="#E8CDB0"/>
      ${vol('<rect x="60" y="70" width="300" height="170" rx="10"/>', '#3B2F2F')}${txt(210, 120, 'CAFE MENU', 28, '#FFE6A8')}<path d="M100 150h200M100 180h160M100 210h180" stroke="#F6E7D3" stroke-width="4" stroke-linecap="round" opacity=".6"/>
      ${[480, 660, 840].map((x) => `<path d="M${x} 0v60" stroke="#6B4A3A" stroke-width="3"/>${vol(`<path d="M${x - 30} 90h60l-14-30h-32z"/>`, '#F4D35E')}<ellipse cx="${x}" cy="100" rx="44" ry="14" fill="url(#lpGlow)"/>`).join('')}
      <rect y="400" width="${W}" height="${H - 400}" fill="#C99A6B"/><rect y="400" width="${W}" height="${H - 400}" fill="url(#lpFloorFade)"/>`;
    if (op.counter) s += `${vol(`<rect x="0" y="330" width="${W}" height="140"/>`, '#A87B50', { shade: 'v' })}${vol(`<rect x="-10" y="318" width="${W + 20}" height="24" rx="8"/>`, '#E8CDB0')}`;
    if (op.table) s += `<ellipse cx="600" cy="${H + 40}" rx="600" ry="190" fill="url(#lpDrop)"/>${vol(`<ellipse cx="600" cy="${H + 20}" rx="560" ry="170"/>`, '#D9A877')}<ellipse cx="600" cy="${H + 20}" rx="560" ry="170" fill="url(#lpWood)" opacity=".5"/>`;
    return s;
  }
  SX.bg.schoolCafe = () => cafe({ table: true });
  SX.bg.schoolCafeCounter = () => cafe({ counter: true });
  SX.bg.schoolCafeBack = () => `<rect width="${W}" height="${H}" fill="#EEE6DA"/><rect y="430" width="${W}" height="${H - 430}" fill="#B9AFA2"/><rect y="430" width="${W}" height="${H - 430}" fill="url(#lpFloorFade)"/>
    ${[0, 1, 2, 3].map((i) => `${vol(`<rect x="${40 + i * 90}" y="120" width="84" height="310" rx="6"/>`, '#8EB8DC', { shade: 'h' })}<rect x="${66 + i * 90}" y="170" width="32" height="6" rx="3" fill="#5A7A9A"/>`).join('')}
    ${vol('<rect x="560" y="110" width="160" height="14" rx="6"/>', '#8A6A4A')}${[600, 680].map((x) => `<path d="M${x} 124v16" stroke="#8A6A4A" stroke-width="5" stroke-linecap="round"/>`).join('')}
    ${txt(640, 90, 'STAFF ONLY', 22, '#8A6A4A')}`;

  // children in the class
  const KIDS = [
    { who: 'girl' }, { who: 'boy' }, { who: 'friend' }, { who: 'girl', skin: 'brown', top: '#9CCB7A', hairColour: '#1F1B1F' }, { who: 'boy', skin: 'light', top: '#EF8A7A', hair: 'short' }, { who: 'friend', skin: 'fair', top: '#F4A259', hair: 'pigtails', hairColour: '#5A3A2A' }
  ];
  const kid = (i, o) => P(Object.assign({}, KIDS[i % KIDS.length], o || {}));
  const TAN = { who: 'teacher', name: 'Ms Tan' };
  const RAJ = { who: 'teacher', name: 'Mr Raj', skin: 'brown', hair: 'short', hairColour: '#1F1B1F', skirt: '', bottom: '#3E5463', coat: '#F4A259', lanyard: '#4A78A8' };
  const lumiHit = (spot, o) => SX.at(spot.x - spot.h * 0.4, spot.y - spot.h * 0.85, spot.h * 0.8, spot.h * 0.85, '', Object.assign({ z: 4, label: 'Lumi' }, o || {}));
  const faceArt = (k) => L.face(k, 60);

  // ================================================================ A new teacher
  const CUBBIES = ['MEI', 'RAJ', 'LUMI', 'ALI', 'SITI', 'JUN'];
  const cubbyAt = (i) => ({ x: 30 + (i % 3) * 104, y: 236 + Math.floor(i / 3) * 98 });
  const PLAN = [{ label: 'Art', icon: 'palette' }, { label: 'Snack', icon: 'snack' }, { label: 'Play', icon: 'sBall' }, { label: 'Home time', icon: 'home' }];
  const REGIONS = [
    { id: 'sky', d: 'M20 20h260v130H20z' },
    { id: 'grass', d: 'M20 150h260v80H20z' },
    { id: 'house', d: 'M70 110h100v90H70z M60 112l60-50 60 50z' },
    { id: 'sun', d: 'M240 60a26 26 0 1 1-52 0a26 26 0 1 1 52 0z' }
  ];
  const PAINTS = ['#5B8FD9', '#F4D35E', '#E5534B', '#7BC67E', '#B48AD9'];
  const CORNERS = [
    { id: 'blocks', x: 380, art: () => svgBox('0 0 200 200', `${LP.drop(100, 190, 90, 8)}${vol('<rect x="20" y="120" width="60" height="60" rx="6"/>', '#E5534B')}${vol('<rect x="90" y="120" width="60" height="60" rx="6"/>', '#5B8FD9')}${vol('<rect x="55" y="60" width="60" height="60" rx="6"/>', '#F4D35E')}${vol('<path d="M120 120l30-50 30 50z"/>', '#7BC67E')}`) },
    { id: 'book', x: 640, art: () => svgBox('0 0 200 200', `${LP.drop(100, 190, 90, 8)}${vol('<rect x="20" y="30" width="160" height="160" rx="8"/>', '#C99A6B')}${[0, 1].map((r) => `<rect x="30" y="${84 + r * 72}" width="140" height="8" fill="#8A6A4A"/>${[0, 1, 2, 3, 4].map((i) => vol(`<rect x="${36 + i * 26}" y="${44 + r * 72}" width="20" height="40" rx="3"/>`, ['#E5534B', '#5B8FD9', '#7BC67E', '#F4A259', '#B48AD9'][(i + r) % 5], { lineOpacity: 0.3 })).join('')}`).join('')}`) },
    { id: 'puzzle', x: 880, art: () => svgBox('0 0 200 200', `${LP.drop(100, 186, 92, 10)}${vol('<path d="M10 140h180l-10 44H20z"/>', '#9CCB7A')}${[0, 1, 2].map((i) => vol(`<path d="M${40 + i * 46} 128h34v-10a8 8 0 1 1 12 0v10h-4v24h-42z"/>`, ['#F4D35E', '#E5534B', '#5B8FD9'][i])).join('')}`) }
  ];
  const teacherSteps = [
    {
      id: 'bag', bg: 'schoolClass',
      text: 'Good morning! Lumi arrives at school. First, Lumi puts the school bag away.',
      task: (st) => st.s.tip || 'Drag the bag into the cubby with Lumi\'s name.',
      lumi: { x: 560, y: 550, h: 210 },
      draw(st) {
        let h = CUBBIES.map((n, i) => {
          const c = cubbyAt(i);
          const mine = n === 'LUMI';
          const bag = (!mine && i % 2 === 0) || (mine && st.done) ? `<g transform="translate(18 6) scale(.48)">${inner(PR.backpack(mine ? '#E5534B' : ['#7E64C8', '#4A78A8', '#7FB069'][i % 3]))}</g>` : '';
          return SX.at(c.x, c.y, 100, 94, svgBox('0 0 84 80', `${vol('<rect x="2" y="2" width="80" height="76" rx="6"/>', '#C99A6B')}<rect x="8" y="8" width="68" height="52" rx="4" fill="#6B4A3A"/>${bag}<rect x="14" y="62" width="56" height="13" rx="3" fill="#fff"/>${txt(42, 73, n, 11, mine ? '#E5534B' : '#3B2F2F')}${mine ? '<circle cx="74" cy="12" r="6" fill="#F4D35E"/>' : ''}`), { target: !st.done, id: n, cls: 'sk-cubby', z: 2 });
        }).join('');
        if (!st.done) h += SX.at(640, 420, 100, 110, PR.backpack('#E5534B'), { cls: 'sx-drag sk-bag', label: 'Lumi\'s bag', z: 8 });
        if (st.s.tipAt) h += SX.bubble(st.s.tipAt.x, st.s.tipAt.y, 'This one is not Lumi\'s. Look for LUMI.', { w: 240 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.sk-bag', '.sk-cubby', (t) => {
          if (t.dataset.id !== 'LUMI') { const c = cubbyAt(CUBBIES.indexOf(t.dataset.id)); st.s.tipAt = { x: c.x + 40, y: c.y - 70 }; st.s.tip = 'Look for the cubby that says LUMI, with a star.'; SX.nope(null, 'That is not Lumi\'s cubby. Look for the name LUMI.'); SX.render(); return false; }
          st.s.tipAt = null;
          SX.done(st, 'The bag is in Lumi\'s cubby.');
          return true;
        }, { miss: () => SX.say('Put the bag in a cubby.') });
      },
      guide: () => ({ sel: '.sk-bag', say: 'Drag the bag into Lumi\'s cubby.' })
    },
    {
      id: 'feel', bg: 'schoolClass',
      text: 'Today Lumi\'s teacher, Mrs Lim, is away. A new teacher is here instead.',
      task: 'How does Lumi feel? Tap a feeling.',
      lumi: (st) => ({ x: 380, y: 550, h: 220, mood: st.data.feel === 'happy' ? 'happy' : 'worried' }),
      draw(st) {
        const opts = [{ label: 'Worried', art: faceArt('worried') }, { label: 'Scared', art: faceArt('scared') }, { label: 'Okay', art: faceArt('happy') }];
        let h = SX.at(560, 190, 150, 300, P(Object.assign({ h: 300, mood: 'smile' }, TAN)), { z: 2 });
        h += SX.choices(opts, 'feel', { on: st.s.pick, style: 'right:24px;top:24px;', cls: 'col' });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'feel') return;
        st.s.pick = Number(d.v);
        st.data.feel = ['worried', 'scared', 'happy'][st.s.pick];
        SX.ok();
        SX.done(st, ['It is okay to feel worried. Changes can feel big.', 'It is okay to feel scared. New things can feel strange.', 'Lumi feels okay. That is great!'][st.s.pick]);
      },
      guide: () => ({ sel: '.sx-choice', say: 'How does Lumi feel?' })
    },
    SX.copeStep({
      id: 'cope', bg: 'schoolClass',
      text: 'When something changes, there are things that can help.',
      draw: () => SX.at(600, 190, 150, 300, P(Object.assign({ h: 300, mood: 'smile' }, TAN)), { z: 2 }),
      options: [SX.BREATHE, { label: 'Ask "What\'s next?"', art: SX.ART.next, reply: 'Good idea. Knowing what comes next helps.' }, { label: 'Squeeze my hands', art: SX.ART.squeeze, reply: 'Squeeze tight, then let go. Lumi feels calmer.' }]
    }),
    {
      id: 'hello', bg: 'schoolClass',
      text: 'The new teacher smiles. "Good morning! My name is Ms Tan."',
      task: (st) => (st.s.said ? '' : 'Say hello. Tap the talk card.'),
      lumi: { x: 300, y: 550, h: 220 },
      draw(st) {
        let h = SX.at(600, 170, 160, 320, P(Object.assign({ h: 320, pose: 'wave', mood: 'talk' }, TAN)), { z: 2 });
        h += SX.bubble(770, 100, st.s.said ? 'Nice to meet you, Lumi!' : 'Good morning! I am Ms Tan.', { tail: 'left', w: 250 });
        h += SX.talkCard([{ t: 'Hello', art: ic('smile', 52) }, { t: 'I am Lumi', art: ic('me', 52) }], 'say', { said: st.s.said, style: 'left:420px;bottom:20px;' });
        return h;
      },
      tap(st, k) {
        if (k !== 'say' || st.s.said) return;
        st.s.said = true;
        SX.say('Hello, I am Lumi.');
        SX.render();
        SX.later(st, () => SX.done(st, 'Ms Tan says: "Nice to meet you, Lumi!"'), 1500);
      },
      guide: () => ({ sel: '.sx-talk', say: 'Tap the talk card to say hello.' })
    },
    {
      id: 'plan', bg: 'schoolTimetable',
      text: 'Ms Tan shows today\'s plan on the board. Each card is something we will do.',
      task: (st) => (st.s.n < PLAN.length ? 'Tap "What\'s next?" to see each part of the day.' : ''),
      lumi: { x: 200, y: 550, h: 210 },
      enter(st) { st.s.n = 0; },
      draw(st) {
        let h = SX.at(840, 190, 150, 300, P(Object.assign({ h: 300, pose: 'point', mood: 'talk', flip: true }, TAN)), { z: 2 });
        PLAN.forEach((p, i) => {
          const shown = i < st.s.n;
          h += SX.at(350 + i * 108, 116, 96, 140, `<div class="sk-plan ${shown ? 'shown' : ''}">${shown ? `${ic(p.icon, 60)}<b>${esc(p.label)}</b>` : '<span class="sk-q">?</span>'}</div>`, { z: 3 });
        });
        if (st.s.n < PLAN.length) h += `<button class="sk-next" data-a="sx" data-k="next" style="left:430px;top:320px">${ic('wNext', 48)}<span>What's next?</span></button>`;
        return h;
      },
      tap(st, k) {
        if (k !== 'next' || st.s.n >= PLAN.length) return;
        st.s.n += 1;
        A.tone(600 + st.s.n * 60, 0.15, 0.05);
        if (st.s.n >= PLAN.length) { SX.done(st, 'Art, snack, play, then home time. The same as always!'); return; }
        SX.render();
        SX.say(`${st.s.n === 1 ? 'First' : 'Next'} is ${PLAN[st.s.n - 1].label.toLowerCase()}. What's next?`);
      },
      guide: () => ({ sel: '.sk-next', say: 'Tap What\'s next.' })
    },
    {
      id: 'art', bg: 'schoolClass',
      text: 'First, art time! Lumi paints a picture.',
      task: (st) => (Object.keys(st.s.paint).length >= REGIONS.length ? '' : !st.s.colour ? 'Tap a paint colour.' : 'Now tap part of the picture to paint it.'),
      lumi: { x: 170, y: 550, h: 200 },
      enter(st) { st.s.paint = {}; st.s.colour = null; },
      draw(st) {
        const parts = REGIONS.map((r) => `<path d="${r.d}" fill="${st.s.paint[r.id] || '#FFFFFF'}" stroke="#9AA6B2" stroke-width="3" ${st.s.paint[r.id] ? '' : 'stroke-dasharray="8 6"'} data-a="sx" data-k="part" data-v="${r.id}" class="sk-part ${st.s.paint[r.id] ? 'painted' : ''}"/>`).join('');
        let h = SX.at(320, 60, 420, 400, svgBox('0 0 300 286', `${LP.drop(150, 282, 140, 6)}<path d="M40 240 L20 282 M260 240 L280 282 M150 240v42" stroke="#8A6A4A" stroke-width="8" stroke-linecap="round"/>${vol('<rect x="6" y="6" width="288" height="238" rx="8"/>', '#C99A6B')}${parts}`), { z: 3, cls: 'sk-easel', label: 'Painting' });
        h += `<div class="sk-paints">${PAINTS.map((c) => `<button class="sk-pot ${st.s.colour === c ? 'on' : ''}" data-a="sx" data-k="colour" data-v="${c}" aria-label="Paint colour">${PR.paintPot(c)}</button>`).join('')}</div>`;
        return h;
      },
      tap(st, k, el, d) {
        if (k === 'colour') { st.s.colour = d.v; SX.ok(); SX.render(); SX.say('Now tap the picture.'); return; }
        if (k === 'part') {
          if (!st.s.colour) { SX.nope(null, 'Pick a colour first.'); return; }
          st.s.paint[d.v] = st.s.colour;
          A.tone(700, 0.12, 0.05);
          if (Object.keys(st.s.paint).length >= REGIONS.length) { SX.done(st, 'What a beautiful painting!'); return; }
          SX.render();
        }
      },
      guide: (st) => (!st.s.colour ? { sel: '.sk-pot', say: 'Tap a colour.' } : { sel: '.sk-part:not(.painted)', say: 'Tap the picture.' })
    },
    {
      id: 'snack', bg: 'schoolClass',
      text: 'Next is snack time, the same as every day.',
      task: (st) => (!st.s.out ? 'Drag the lunch box onto the desk.' : st.s.bites < 2 ? 'Tap the food to eat.' : ''),
      lumi: { x: 330, y: 470, h: 200, z: 3 },
      enter(st) { st.s.out = false; st.s.bites = 0; },
      draw(st) {
        let h = SX.at(420, 380, 380, 140, svgBox('0 0 380 140', `${LP.drop(190, 136, 180, 8)}<path d="M40 60v76M340 60v76" stroke="#8A6A4A" stroke-width="10"/>${vol('<rect x="10" y="40" width="360" height="30" rx="8"/>', '#D9A877')}`), { target: !st.s.out, id: 'desk', z: 4 });
        if (!st.s.out) h += SX.at(860, 430, 130, 90, PR.lunchbox(false), { cls: 'sx-drag sk-box', label: 'Lunch box', z: 8 });
        else h += SX.at(520, 330, 160, 106, PR.lunchbox(st.s.bites < 2), { k: 'eat', label: 'Eat the snack', z: 6, cls: st.s.bites < 2 ? 'sx-glow' : '' });
        if (st.s.bites === 1) h += SX.bubble(390, 160, 'Yum!', { w: 100 });
        return h;
      },
      after(st, box) {
        if (st.s.out) return;
        SX.dragTo(box, '.sk-box', '[data-id="desk"]', () => { st.s.out = true; SX.ok(); SX.render(); SX.say('Open it. Now tap the food to eat.'); return true; }, { miss: () => SX.say('Put the lunch box on the desk.') });
      },
      tap(st, k) {
        if (k !== 'eat' || st.s.bites >= 2) return;
        st.s.bites += 1;
        if (st.s.bites >= 2) { SX.done(st, 'Lumi ate the snack. Just like every day.'); return; }
        SX.render();
        SX.say('Yum! One more bite.');
      },
      guide: (st) => (!st.s.out ? { sel: '.sk-box', say: 'Drag the lunch box to the desk.' } : { sel: '[data-k="eat"]', say: 'Tap the food.' })
    },
    {
      id: 'play', bg: 'schoolClass',
      text: (st) => (st.data.corner ? `Play time! Lumi goes to the ${st.data.corner} corner. A friend comes over.` : 'Then it is play time. Where will Lumi play?'),
      task: (st) => (!st.data.corner ? 'Tap a play corner.' : !st.s.said ? 'The friend asks to play. Tap the talk card to answer.' : ''),
      lumi: (st) => (st.data.corner ? { x: CORNERS.find((c) => c.id === st.data.corner).x - 110, y: 550, h: 190 } : { x: 160, y: 550, h: 200 }),
      draw(st) {
        let h = CORNERS.map((c) => SX.at(c.x - 80, 300, 200, 200, c.art(), { k: 'corner', v: c.id, label: `${c.id} corner`, cls: `sk-corner ${st.data.corner === c.id ? 'on' : ''}`, z: 3 })).join('');
        if (st.data.corner) {
          const c = CORNERS.find((x) => x.id === st.data.corner);
          const fx = c.x + 110 > W - 110 ? c.x - 40 : c.x + 110;
          h += SX.at(fx, 330, 100, 200, kid(2, { h: 200, pose: st.s.said ? 'wave' : 'stand', mood: 'talk', flip: true }), { z: 6 });
          h += SX.bubble(fx - 70, 220, st.s.said ? 'Yay! Let\'s play!' : 'Can I play too?', { w: 180 });
          h += SX.talkCard([{ t: 'Yes', art: ic('yes', 52) }, { t: 'Let\'s play!', art: ic('sBall', 52) }], 'say', { said: st.s.said, style: 'left:260px;top:24px;' });
        }
        return h;
      },
      tap(st, k, el, d) {
        if (k === 'corner' && !st.data.corner) { st.data.corner = d.v; SX.ok(); SX.render(); SX.say('A friend asks: Can I play too?'); return; }
        if (k === 'say' && st.data.corner && !st.s.said) { st.s.said = true; SX.say('Yes, let\'s play!'); SX.render(); SX.later(st, () => SX.done(st, 'Lumi and the friend play together.'), 1200); }
      },
      guide: (st) => (!st.data.corner ? { sel: '.sk-corner', say: 'Tap a play corner.' } : { sel: '.sx-talk', say: 'Tap the talk card.' })
    },
    {
      id: 'bye', bg: 'schoolClass',
      text: 'It is home time. Lumi had a good day with Ms Tan.',
      task: (st) => (st.s.said ? '' : 'Wave goodbye. Tap the talk card.'),
      lumi: (st) => ({ x: 860, y: 550, h: 210, mood: st.s.said ? 'excited' : 'happy', wave: !!st.s.said }),
      draw(st) {
        let h = SX.at(430, 170, 160, 320, P(Object.assign({ h: 320, pose: 'wave', mood: 'talk' }, TAN)), { z: 2 });
        h += SX.talkCard([{ t: 'Bye', art: ic('smile', 52) }, { t: 'Ms Tan', art: P(Object.assign({ crop: 'bust', h: 52 }, TAN)) }], 'say', { said: st.s.said, style: 'left:40px;top:24px;' });
        if (st.s.said) h += SX.bubble(590, 120, 'Bye, Lumi! Mrs Lim will be back tomorrow.', { tail: 'left', w: 260 });
        return h;
      },
      tap(st, k) {
        if (k !== 'say' || st.s.said) return;
        st.s.said = true;
        SX.say('Bye, Ms Tan!');
        SX.render();
        SX.later(st, () => SX.done(st, 'Tomorrow, Mrs Lim comes back. Lumi was brave today!'), 1500);
      },
      guide: () => ({ sel: '.sx-talk', say: 'Tap the talk card to say bye.' })
    }
  ];

  // ================================================================ Fire drill at school
  const LINE = [1000, 900, 790, 690, 590]; // places in the line, nearest the door first; 790 is the gap
  const STAIR = (i) => ({ x: 80 + i * 150 + 80, y: 170 + i * 62 + 14 });
  const SIT = [140, 270, 400, 530, 660, 790]; // where the class sits at the field; index 3 is Lumi's place
  const drillSteps = [
    {
      id: 'explain', bg: 'schoolClass',
      text: 'Mr Raj says: "Today we will have a fire drill. It is practice, so we know what to do."',
      task: (st) => (st.done ? '' : 'Tap the fire alarm on the wall to see it.'),
      lumi: { x: 520, y: 550, h: 210 },
      draw: (st) => SX.at(700, 180, 150, 300, P(Object.assign({ h: 300, pose: 'point', mood: 'talk', flip: true }, RAJ)), { z: 2 }) + SX.at(250, 250, 70, 70, PR.alarm(false), { k: 'alarm', label: 'Fire alarm', cls: st.done ? '' : 'sx-glow', z: 3 }),
      tap(st, k) { if (k === 'alarm') SX.done(st, 'That is the fire alarm. When it rings, we walk outside together, calmly.'); },
      guide: () => ({ sel: '[data-k="alarm"]', say: 'Tap the fire alarm.' })
    },
    SX.copeStep({
      id: 'alarm', bg: 'schoolClass',
      text: 'Ring, ring, ring! The alarm rings. It is very loud!',
      draw: () => SX.at(250, 250, 70, 70, PR.alarm(true), { z: 3, cls: 'sk-alarm' }) + SX.at(640, 180, 150, 300, P(Object.assign({ h: 300, mood: 'calm', flip: true }, RAJ)), { z: 2 }),
      options: [SX.HEADPHONES, { label: 'Cover my ears', art: SX.ART.quiet, reply: 'Covering ears makes the alarm softer.' }, { label: 'Hold Mr Raj\'s hand', art: SX.ART.hug, reply: 'Mr Raj will help Lumi. Lumi is not alone.' }]
    }),
    {
      id: 'bag', bg: 'schoolClass',
      text: 'Everyone stops what they are doing. What about Lumi\'s bag?',
      task: 'Tap what Lumi should do.',
      lumi: (st) => ({ x: 380, y: 550, h: 210, mood: st.done ? 'happy' : 'worried' }),
      draw(st) {
        const bagArt = `<span style="display:block;width:56px;height:56px">${PR.backpack('#E5534B')}</span>`;
        let h = SX.at(470, 380, 100, 110, PR.backpack('#E5534B'), { z: 3 });
        h += SX.choices([{ label: 'Leave my bag', art: bagArt }, { label: 'Take my bag', art: bagArt }], 'bag', { on: st.s.pick, style: 'right:24px;top:24px;', cls: 'col' });
        if (st.s.hint) h += SX.bubble(420, 140, 'In a fire drill we leave our bags, so we can walk out quickly. Mr Raj keeps the room safe.', { tail: 'left', w: 300 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'bag') return;
        if (Number(d.v) === 1) { st.s.hint = true; st.s.pick = 1; SX.nope(el, 'In a fire drill we leave our bags behind, so we can walk out quickly. Try again.'); SX.render(); return; }
        st.s.pick = 0;
        st.s.hint = false;
        SX.ok();
        SX.done(st, 'Yes! We leave our bags and go.');
      },
      guide: () => ({ sel: '.sx-choice', say: 'What should Lumi do with the bag?' })
    },
    {
      id: 'line', bg: 'schoolClass',
      text: 'The class lines up at the door, one behind the other.',
      task: (st) => (st.done ? '' : 'Drag Lumi\'s name tag into the gap in the line.'),
      lumi: (st) => (st.done ? { x: 790, y: 550, h: 170 } : { x: 230, y: 550, h: 190 }),
      draw(st) {
        let h = '';
        LINE.forEach((x, i) => { if (i !== 2) h += SX.at(x - 50, 340, 100, 200, kid(i, { h: 200, flip: true }), { z: 3 }); });
        if (!st.done) {
          h += SX.at(740, 350, 100, 190, '<div class="sk-gap"></div>', { target: true, id: 'gap', z: 2 });
          h += SX.at(320, 440, 120, 70, PR.tag(), { cls: 'sx-drag sk-tag', label: 'Lumi\'s name tag', z: 8 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.sk-tag', '[data-id="gap"]', () => { SX.done(st, 'Lumi is in the line. We stay together.'); return true; }, { miss: () => SX.say('Put the name tag in the empty space in the line.') });
      },
      guide: () => ({ sel: '.sk-tag', say: 'Drag the name tag into the gap.' })
    },
    {
      id: 'stairs', bg: 'schoolStairs',
      text: (st) => (st.s.walk ? 'Lumi holds the rail and walks down, one step at a time.' : 'The class goes down the stairs.'),
      task: (st) => (!st.s.walk ? 'Should Lumi walk or run? Tap one.' : st.s.n < 5 ? 'Tap the next step to walk down.' : ''),
      lumi: (st) => Object.assign({ h: 150 }, STAIR(st.s.n || 0)),
      enter(st) { st.s.n = 0; st.s.walk = false; },
      draw(st) {
        let h = SX.at(980, 404, 70, 150, kid(0, { h: 150 }), { z: 3 }) + SX.at(1036, 404, 70, 150, kid(1, { h: 150 }), { z: 3 });
        if (!st.s.walk) {
          h += SX.choices([{ label: 'Walk', art: ic('go', 56) }, { label: 'Run', art: ic('jump', 56) }], 'how', { style: 'right:24px;top:24px;', cls: 'col' });
          if (st.s.hint) h += SX.bubble(340, 40, 'Running on stairs can make us fall. We walk, holding the rail.', { w: 280 });
        } else if (st.s.n < 5) {
          const nx = STAIR(st.s.n + 1);
          h += SX.at(nx.x - 50, nx.y - 30, 100, 44, '<div class="sk-foot"></div>', { k: 'step', label: 'Next step', z: 6 });
        }
        return h;
      },
      tap(st, k, el, d) {
        if (k === 'how') {
          if (Number(d.v) === 1) { st.s.hint = true; SX.nope(el, 'Running on stairs can make us fall. We walk, holding the rail.'); SX.render(); return; }
          st.s.walk = true;
          SX.ok();
          SX.render();
          SX.say('Walk, holding the rail. Tap the next step.');
          return;
        }
        if (k === 'step' && st.s.walk && st.s.n < 5) {
          st.s.n += 1;
          A.tone(500 + st.s.n * 40, 0.1, 0.05);
          if (st.s.n >= 5) { SX.done(st, 'Slow and steady. Lumi walked all the way down.'); return; }
          SX.render();
        }
      },
      guide: (st) => (!st.s.walk ? { sel: '.sx-choice', say: 'Walk or run?' } : { sel: '[data-k="step"]', say: 'Tap the next step.' })
    },
    {
      id: 'field', bg: 'schoolField',
      text: 'Everyone walks to the assembly point at the field and sits down with the class.',
      task: (st) => (st.done ? '' : 'Tap the empty spot to sit with the class.'),
      lumi: (st) => (st.done ? { x: SIT[3], y: 530, h: 130 } : { x: 260, y: 400, h: 150 }),
      draw(st) {
        let h = SX.at(960, 270, 120, 240, P(Object.assign({ h: 240, item: 'clipboard', pose: 'hold', flip: true }, RAJ)), { z: 3 });
        SIT.forEach((x, i) => { if (i !== 3) h += SX.at(x - 50, 400, 100, 140, kid(i, { h: 140, pose: 'sit' }), { z: 3 }); });
        if (!st.done) h += SX.at(SIT[3] - 50, 470, 100, 60, '<div class="sk-spot"></div>', { k: 'sit', label: 'Lumi\'s spot', z: 4 });
        return h;
      },
      tap(st, k) { if (k === 'sit') SX.done(st, 'Lumi sits with the class. Everyone is calm and quiet.'); },
      guide: () => ({ sel: '[data-k="sit"]', say: 'Tap the empty spot.' })
    },
    {
      id: 'count', bg: 'schoolField',
      text: 'Mr Raj counts everyone, to make sure the whole class is here.',
      task: (st) => (Object.keys(st.s.n).length < SIT.length ? 'Count along! Tap each child, and Lumi too.' : ''),
      lumi: { x: SIT[3], y: 530, h: 130 },
      enter(st) { st.s.n = {}; },
      draw(st) {
        let h = SX.at(960, 270, 120, 240, P(Object.assign({ h: 240, item: 'clipboard', pose: 'hold', mood: 'talk', flip: true }, RAJ)), { z: 3 });
        SIT.forEach((x, i) => {
          if (i !== 3) h += SX.at(x - 50, 400, 100, 140, kid(i, { h: 140, pose: 'sit' }), { z: 3 });
          h += SX.at(x - 52, 390, 104, 150, st.s.n[i] ? `<span class="sk-num">${st.s.n[i]}</span>` : '', { k: 'count', v: i, label: i === 3 ? 'Count Lumi' : 'Count this child', z: 6, cls: `sk-count ${st.s.n[i] ? 'counted' : ''}` });
        });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'count') return;
        const i = Number(d.v);
        if (st.s.n[i]) return;
        const n = Object.keys(st.s.n).length + 1;
        st.s.n[i] = n;
        A.tone(500 + n * 60, 0.12, 0.05);
        SX.say(String(n));
        if (n >= SIT.length) SX.later(st, () => SX.done(st, 'Six! Everyone is here and safe.'), 600);
        SX.render();
      },
      guide: () => ({ sel: '.sk-count:not(.counted)', say: 'Tap a child to count.' })
    },
    {
      id: 'clear', bg: 'schoolField',
      text: 'Mr Raj says: "All clear! The drill is over. Well done, everyone."',
      task: (st) => (st.done ? '' : 'Walk back with the class. Tap the school door.'),
      lumi: (st) => (st.done ? { x: 330, y: 310, h: 110 } : { x: SIT[3], y: 530, h: 140 }),
      draw(st) {
        let h = SX.at(960, 270, 120, 240, P(Object.assign({ h: 240, pose: 'wave', mood: 'happy', flip: true }, RAJ)), { z: 3 });
        h += SX.at(205, 190, 110, 116, '', { k: 'door', label: 'School door', cls: st.done ? '' : 'sk-doorhit', z: 4 });
        return h;
      },
      tap(st, k) { if (k === 'door') SX.done(st, 'Back to class. Lumi did it, even with the loud alarm!'); },
      guide: () => ({ sel: '[data-k="door"]', say: 'Tap the door.' })
    },
    {
      id: 'water', bg: 'schoolClass',
      text: 'Back in class, it is time for a drink and a rest. Practising helps Lumi know what to do.',
      task: (st) => (st.done ? '' : 'Drag the water bottle to Lumi.'),
      lumi: { x: 440, y: 550, h: 220, mood: 'calm' },
      draw(st) {
        let h = lumiHit({ x: 440, y: 550, h: 220 }, { target: true, id: 'lumi' });
        if (!st.done) h += SX.at(760, 400, 60, 130, PR.bottle(), { cls: 'sx-drag sk-bottle', label: 'Water bottle', z: 8 });
        else h += SX.at(520, 400, 50, 110, PR.bottle(), { z: 6 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.sk-bottle', '[data-id="lumi"]', () => { SX.done(st, 'Glug, glug. Lumi feels calm again.'); return true; }, { miss: () => SX.say('Bring the bottle to Lumi.') });
      },
      guide: () => ({ sel: '.sk-bottle', say: 'Drag the water to Lumi.' })
    }
  ];

  // ================================================================ Asking for help at work
  // the front of the café counter, seen from the staff side (the customer stands behind it)
  const counterFront = () => SX.at(0, 318, W, 160, `<svg viewBox="0 318 ${W} 160" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">${vol(`<rect x="0" y="330" width="${W}" height="148"/>`, '#8A6040', { shade: 'v' })}${vol(`<rect x="-10" y="318" width="${W + 20}" height="24" rx="8"/>`, '#E8CDB0')}<path d="M0 380H${W}M0 430H${W}" stroke="#6B4A3A" stroke-opacity=".4" stroke-width="3"/></svg>`, { z: 6, cls: 'sk-front' });
  const BOSS = { who: 'supervisor', name: 'Ms Wong', skin: 'tan', hair: 'pony', hairColour: '#2B2730' };
  const SPILLS = [[400, 440], [620, 480], [790, 430]];
  const workSteps = [
    {
      id: 'apron', bg: 'schoolCafeBack',
      text: 'Lumi is doing work training at a café. First, get ready in the staff room.',
      task: (st) => (st.done ? '' : 'Drag the apron onto Lumi.'),
      lumi: { x: 480, y: 550, h: 220 },
      draw(st) {
        let h = lumiHit({ x: 480, y: 550, h: 220 }, { target: true, id: 'lumi' });
        if (!st.done) h += SX.at(590, 124, 100, 130, PR.apron(), { cls: 'sx-drag sk-apron', label: 'Apron', z: 8 });
        h += SX.at(880, 160, 120, 156, PR.timeClock(false), { z: 2 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.sk-apron', '[data-id="lumi"]', () => { st.data.skApron = true; SX.done(st, 'Apron on. Lumi is ready to work!'); return true; }, { miss: () => SX.say('Bring the apron to Lumi.') });
      },
      guide: () => ({ sel: '.sk-apron', say: 'Drag the apron onto Lumi.' })
    },
    {
      id: 'napkins', bg: 'schoolCafe',
      text: 'The first job: fold the napkins for the tables.',
      task: (st) => (st.s.done < 4 ? 'Tap each napkin to fold it.' : ''),
      lumi: { x: 150, y: 450, h: 200, z: 3 },
      enter(st) { st.s.f = [false, false, false, false]; st.s.done = 0; },
      draw(st) {
        return st.s.f.map((f, i) => SX.at(300 + i * 180, 400, 150, 125, PR.napkin(f), { k: 'fold', v: i, label: f ? 'Folded napkin' : 'Napkin', z: 4, cls: f ? '' : 'sk-napkin' })).join('');
      },
      tap(st, k, el, d) {
        if (k !== 'fold') return;
        const i = Number(d.v);
        if (st.s.f[i]) return;
        st.s.f[i] = true;
        st.s.done += 1;
        A.tone(600 + st.s.done * 60, 0.1, 0.05);
        if (st.s.done >= 4) { SX.done(st, 'All the napkins are folded. Neat!'); return; }
        SX.render();
      },
      guide: () => ({ sel: '.sk-napkin', say: 'Tap a napkin.' })
    },
    {
      id: 'wipe', bg: 'schoolCafe',
      text: 'Next: wipe the table, so it is clean for the customers.',
      task: (st) => (st.done ? '' : 'Rub the cloth over the spills.'),
      lumi: { x: 150, y: 450, h: 200, z: 3 },
      enter(st) { st.s.dirt = SPILLS.map(() => 1); },
      draw(st) {
        let h = SPILLS.map(([x, y], i) => SX.at(x - 60, y - 34, 120, 68, svgBox('0 0 120 68', `<ellipse cx="60" cy="34" rx="54" ry="26" fill="#8A5A3B" opacity=".55"/><ellipse cx="50" cy="30" rx="26" ry="12" fill="#6B4A3A" opacity=".5"/>${[[24, 50], [96, 20], [90, 52]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="4" fill="#B08050"/>`).join('')}`), { z: 2, cls: 'sk-spill', id: `spill${i}`, style: `opacity:${st.s.dirt[i]}` })).join('');
        if (!st.done) h += SX.at(920, 440, 120, 80, PR.cloth(), { cls: 'sx-drag sk-cloth', label: 'Cloth', z: 8 });
        else h += '<div class="sk-sparkle" style="left:540px;top:380px"></div><div class="sk-sparkle" style="left:760px;top:410px"></div>';
        return h;
      },
      after(st, box) {
        if (st.done) return;
        const cloth = box.querySelector('.sk-cloth');
        if (!cloth || cloth.dataset.wired) return;
        cloth.dataset.wired = '1';
        A.SG.drag(cloth, box, {
          move: (p) => {
            SPILLS.forEach(([x, y], i) => {
              if (st.s.dirt[i] > 0 && Math.hypot(p.x - x, p.y - y) < 85) {
                st.s.dirt[i] = Math.max(0, st.s.dirt[i] - 0.05);
                const el = box.querySelector(`[data-id="spill${i}"]`);
                if (el) el.style.opacity = st.s.dirt[i];
              }
            });
          },
          drop: () => {
            if (st.s.dirt.every((d) => d <= 0.06)) { SX.done(st, 'Sparkling clean!'); return true; }
            SX.say('Keep rubbing the spills.');
            return false;
          }
        });
      },
      guide: () => ({ sel: '.sk-cloth', say: 'Rub the cloth over the spills.' })
    },
    {
      id: 'ask', bg: 'schoolCafeCounter',
      text: 'The supervisor, Ms Wong, says: "Lumi, please fill the sugar jars." Lumi is not sure how.',
      task: (st) => (st.s.said ? '' : 'Ask for help. Tap the talk card.'),
      lumi: (st) => ({ x: 900, y: 550, h: 210, mood: st.s.said ? 'happy' : 'worried', flip: true }),
      draw(st) {
        let h = SX.at(120, 150, 160, 320, P(Object.assign({ h: 320, pose: st.s.said ? 'wave' : 'point', mood: 'talk' }, BOSS)), { z: 2 });
        h += SX.at(360, 230, 70, 94, PR.jar(0, false), { z: 3 }) + SX.at(440, 230, 70, 94, PR.jar(0, false), { z: 3 }) + SX.at(530, 200, 90, 116, PR.sugarBag(), { z: 3 });
        if (st.s.said) h += SX.bubble(270, 90, 'Of course! Watch me first.', { tail: 'left', w: 230 });
        h += SX.talkCard([{ t: 'Can you', art: ic('you', 52) }, { t: 'show me?', art: ic('eye', 52) }], 'say', { said: st.s.said, style: 'left:340px;bottom:20px;' });
        return h;
      },
      tap(st, k) {
        if (k !== 'say' || st.s.said) return;
        st.s.said = true;
        SX.say('Can you show me?');
        SX.render();
        SX.later(st, () => SX.done(st, 'Ms Wong says: "Of course!" Asking for help is a good choice.'), 1500);
      },
      guide: () => ({ sel: '.sx-talk', say: 'Tap the talk card to ask for help.' })
    },
    {
      id: 'demo', bg: 'schoolCafeCounter',
      text: 'Ms Wong shows Lumi how, one step at a time.',
      task: (st) => (st.s.n < 3 ? 'Tap each step card to watch.' : ''),
      lumi: { x: 950, y: 550, h: 190, flip: true },
      enter(st) { st.s.n = 0; },
      draw(st) {
        let h = SX.at(120, 150, 160, 320, P(Object.assign({ h: 320, pose: st.s.n > 0 ? 'hold' : 'stand', mood: 'talk' }, BOSS)), { z: 2 });
        h += SX.at(300, 210, 80, 108, PR.jar(st.s.n >= 1 ? 90 : 0, st.s.n >= 3), { z: 3 });
        const cards = [{ t: '1 Fill', art: PR.scoop(true) }, { t: '2 Wipe', art: PR.cloth() }, { t: '3 Close the lid', art: PR.lid() }];
        h += `<div class="sk-demo">${cards.map((c, i) => `<button class="sk-demo-card ${i < st.s.n ? 'done' : i === st.s.n ? 'now' : ''}" data-a="sx" data-k="demo" data-v="${i}"><span class="sk-demo-art">${c.art}</span><b>${esc(c.t)}</b>${i < st.s.n ? `<span class="sk-tick">${ic('check', 22)}</span>` : ''}</button>`).join('')}</div>`;
        h += SX.bubble(270, 90, ['Watch me.', 'First, fill the jar with sugar.', 'Then wipe the rim clean.', 'Last, close the lid. Done!'][st.s.n], { tail: 'left', w: 220 });
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'demo') return;
        if (Number(d.v) !== st.s.n) { SX.nope(el, 'Tap the cards in order: fill, wipe, then the lid.'); return; }
        st.s.n += 1;
        SX.ok();
        if (st.s.n >= 3) { SX.done(st, 'Fill, wipe, close the lid. Now Lumi knows how!'); return; }
        SX.render();
        SX.say(['First, fill the jar with sugar.', 'Then wipe the rim clean.'][st.s.n - 1]);
      },
      guide: () => ({ sel: '.sk-demo-card.now', say: 'Tap the next step card.' })
    },
    {
      id: 'fill', bg: 'schoolCafeCounter',
      text: 'Now it is Lumi\'s turn to fill the sugar jar.',
      task: (st) => (st.s.phase === 'fill' ? 'Drag the scoop of sugar into the jar.' : st.s.phase === 'wipe' ? 'Tap the cloth to wipe the rim.' : st.s.phase === 'lid' ? 'Drag the lid onto the jar.' : ''),
      lumi: { x: 950, y: 550, h: 190, flip: true },
      enter(st) { st.s.phase = 'fill'; st.s.level = 0; },
      draw(st) {
        let h = SX.at(420, 140, 150, 200, PR.jar(st.s.level, st.s.phase === 'done'), { target: true, id: 'jar', z: 3 });
        h += SX.at(160, 170, 110, 140, PR.sugarBag(), { z: 3 });
        if (st.s.phase === 'fill') h += SX.at(200, 360, 140, 76, PR.scoop(true), { cls: 'sx-drag sk-scoop', label: 'Scoop of sugar', z: 8 });
        if (st.s.phase === 'wipe') h += SX.at(640, 360, 110, 74, PR.cloth(), { k: 'wipe', label: 'Cloth', cls: 'sx-glow', z: 8 });
        if (st.s.phase === 'lid') h += SX.at(640, 380, 140, 50, PR.lid(), { cls: 'sx-drag sk-lid', label: 'Lid', z: 8 });
        const order = ['fill', 'wipe', 'lid', 'done'];
        h += `<div class="sk-checklist">${['Fill', 'Wipe', 'Lid'].map((t, i) => `<span class="${order.indexOf(st.s.phase) > i ? 'done' : ''}">${order.indexOf(st.s.phase) > i ? ic('check', 20) : `<i>${i + 1}</i>`}${t}</span>`).join('')}</div>`;
        return h;
      },
      after(st, box) {
        if (st.s.phase === 'fill') SX.dragTo(box, '.sk-scoop', '[data-id="jar"]', () => {
          st.s.level += 50;
          A.tone(700, 0.12, 0.05);
          if (st.s.level >= 100) { st.s.phase = 'wipe'; SX.render(); SX.say('Full! Now tap the cloth to wipe the rim.'); return true; }
          SX.render();
          SX.say('One more scoop.');
          return true;
        }, { miss: () => SX.say('Pour the sugar into the jar.') });
        if (st.s.phase === 'lid') SX.dragTo(box, '.sk-lid', '[data-id="jar"]', () => { st.s.phase = 'done'; SX.done(st, 'Lumi filled the sugar jar all by himself!'); return true; }, { miss: () => SX.say('Put the lid on the jar.') });
      },
      tap(st, k) {
        if (k === 'wipe' && st.s.phase === 'wipe') { st.s.phase = 'lid'; SX.ok(); SX.render(); SX.say('Clean! Now drag the lid onto the jar.'); }
      },
      guide: (st) => (st.s.phase === 'fill' ? { sel: '.sk-scoop', say: 'Drag the scoop to the jar.' } : st.s.phase === 'wipe' ? { sel: '[data-k="wipe"]', say: 'Tap the cloth.' } : { sel: '.sk-lid', say: 'Drag the lid onto the jar.' })
    },
    SX.copeStep({
      id: 'customer', bg: 'schoolCafeCounter',
      text: 'A customer asks Lumi a question very fast. Lumi does not understand.',
      task: 'What could Lumi do? Tap one.',
      lumi: (st) => ({ x: 560, y: 560, h: 210, z: 7, flip: true, mood: st.done ? 'happy' : 'worried' }),
      draw: () => SX.at(170, 110, 150, 310, P({ who: 'customer', h: 310, mood: 'talk', item: 'card', pose: 'give' }), { z: 2 }) + counterFront() + SX.bubble(330, 8, 'Canigetanoatmilklatte, lesssweet?', { tail: 'left', w: 230 }),
      options: [
        { label: '"Can you say it again?"', art: SX.ART.talk, reply: 'The customer says it slowly: "Oat milk latte, less sweet, please." Now Lumi understands!' },
        { label: 'Get my supervisor', art: P(Object.assign({ crop: 'bust', h: 60 }, BOSS)), reply: 'Ms Wong comes over to help. That is a good choice.' },
        { label: 'Show my talk app', art: ic('phone', 60), reply: '"I use this app to talk. Please wait." The customer smiles and waits.' }
      ]
    }),
    {
      id: 'praise', bg: 'schoolCafeCounter',
      text: 'At the end of the shift, Ms Wong says: "Great work today, Lumi! Asking for help is a skill."',
      task: (st) => (st.done ? '' : 'Give Ms Wong a high five. Tap her hand.'),
      lumi: (st) => ({ x: 560, y: 550, h: 210, mood: st.done ? 'excited' : 'happy', wave: !!st.done }),
      draw(st) {
        let h = SX.at(220, 150, 160, 320, P(Object.assign({ h: 320, pose: 'wave', mood: 'happy' }, BOSS)), { z: 2 });
        h += SX.at(322, 158, 72, 72, '', { k: 'five', label: 'High five', cls: st.done ? '' : 'sk-handhit', z: 6 });
        if (st.done) h += SX.bubble(400, 80, 'See you next week!', { w: 190 });
        return h;
      },
      tap(st, k) { if (k === 'five') { A.tone(880, 0.15, 0.07); SX.done(st, 'High five! Lumi worked hard today.'); } },
      guide: () => ({ sel: '[data-k="five"]', say: 'Tap Ms Wong\'s hand.' })
    },
    {
      id: 'clock', bg: 'schoolCafeBack',
      text: 'Before going home, staff clock out at the time clock.',
      task: (st) => (st.done ? '' : 'Drag the staff card to the time clock.'),
      lumi: { x: 640, y: 550, h: 210 },
      draw(st) {
        let h = SX.at(860, 160, 140, 182, PR.timeClock(st.done), { target: !st.done, id: 'clock', z: 2 });
        if (!st.done) h += SX.at(420, 440, 110, 74, PR.card(), { cls: 'sx-drag sk-card', label: 'Staff card', z: 8 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.sk-card', '[data-id="clock"]', () => { A.tone(1568, 0.12, 0.06); SX.done(st, 'Beep! Lumi clocked out. Time to go home.'); return true; }, { miss: () => SX.say('Bring the card to the time clock.') });
      },
      guide: () => ({ sel: '.sk-card', say: 'Drag the card to the time clock.' })
    }
  ];

  SX.story({ id: 'teacher', title: 'A new teacher', tint: '#DCEFD3', ages: ['little', 'primary'], steps: teacherSteps });
  SX.story({ id: 'firedrill', title: 'Fire drill at school', tint: '#FDE2D8', steps: drillSteps });
  SX.story({ id: 'work', title: 'Asking for help at work', tint: '#F3E3CF', ages: ['teen'], steps: workSteps });
})();
