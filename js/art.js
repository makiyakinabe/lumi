/*
  art.js
  The Art studio (Fun › Art). Three tabs:

  Colour in   Colouring pages drawn in Lumi's style, in groups: Lumi, Animals, Places, Transport, Toys,
              Home things and Food (the extra pages are in art-pages.js). Pick a crayon, tap a part to fill it. With "Colour dots"
              on, each part shows a small dot of the colour it could be, so the child can match colours;
              any colour is still fine, nothing is ever wrong. Undo, start again, and save to My art.
  Paint       A big sheet of paper and a finger: three brush sizes, a rainbow brush, a glitter brush,
              five stamps (star, heart, flower, paw, Lumi), an eraser, undo and start again.
              "Give me an idea" suggests something to paint.
  My art      Every saved picture in a wooden frame. Tap one to see it big; Lumi says what she likes.

  Pencil case  More art materials to buy with stars: a star glitter pen, a neon marker, watercolours,
              a shiny metal pen, chalk, and a pack of extra stamps. Each one works for colouring in and
              for painting (a glitter-pen fill sparkles with little stars; a glitter-pen line leaves stars).
  Frames      In Lumi's room (Room > Art) the child buys picture frames: wooden, white, gold, rainbow,
              a round flower frame and a standing easel. Each frame shows one of the child's own pictures,
              chosen in the room (tap the frame, then Picture) or from My art (Hang in room).
              Frames move, grow, shrink, turn and go away like everything else in the room.

  Why: drawing and colouring build hand control and hand-eye coordination, and give children who
  speak few words a way to show what they feel. Colours, crayons and stamps are big and easy to hit.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, save, render, later, tone } = A;

  // ---------------------------------------------------------------- colours
  const COLORS = [
    ['#EF6F5E', 'red'], ['#F3A24E', 'orange'], ['#F6D24A', 'yellow'], ['#7CC46A', 'green'], ['#4FB3A9', 'teal'], ['#5E9BE0', 'blue'], ['#9C7FD9', 'purple'],
    ['#F28DB2', 'pink'], ['#A8744A', 'brown'], ['#F6C9A0', 'peach'], ['#9AA6B2', 'grey'], ['#FFFFFF', 'white'], ['#A9D8F5', 'light blue'], ['#4A3F3B', 'dark brown']
  ];
  const INK = '#3B2F2F';
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

  // ---------------------------------------------------------------- the pencil case: materials to buy with stars
  const MATS = [
    { id: 'crayon', name: 'Crayon', price: 0, say: 'Crayon.' },
    { id: 'glitter', name: 'Star glitter pen', price: 4, say: 'Star glitter pen! It leaves little stars.' },
    { id: 'neon', name: 'Neon marker', price: 3, say: 'Neon marker. It glows!' },
    { id: 'water', name: 'Watercolour', price: 4, say: 'Watercolour. Soft and splashy.' },
    { id: 'metal', name: 'Shiny metal pen', price: 5, say: 'Shiny metal pen. It shines like gold.' },
    { id: 'chalk', name: 'Chalk', price: 3, say: 'Chalk. Dusty and soft.' },
    { id: 'stamps', name: 'More stamps', price: 5, pack: true, say: 'More stamps: a rocket, a sun, a car, a cat and a rainbow!' }
  ];
  const MAT = Object.fromEntries(MATS.map((m) => [m.id, m]));
  const matArt = (id) => `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">${{
    crayon: `<g transform="rotate(35 32 32)"><rect x="24" y="14" width="16" height="40" rx="3" fill="#EF6F5E" stroke="${INK}" stroke-width="2.5"/><path d="M24 14l8-12 8 12z" fill="#EF6F5E" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="24" y="24" width="16" height="16" fill="#fff" opacity=".8"/></g>`,
    glitter: `<g transform="rotate(35 32 32)"><rect x="25" y="12" width="14" height="44" rx="6" fill="#9C7FD9" stroke="${INK}" stroke-width="2.5"/><path d="M25 12l7-10 7 10z" fill="#F6D24A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="28" r="3" fill="#fff"/><circle cx="30" cy="40" r="2" fill="#F6D24A"/></g><path d="M10 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#F6D24A" stroke="${INK}" stroke-width="1.5"/><path d="M52 44l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="#F28DB2"/>`,
    neon: `<g transform="rotate(35 32 32)"><rect x="22" y="18" width="20" height="38" rx="6" fill="#3B2F2F"/><rect x="24" y="20" width="16" height="34" rx="5" fill="#7CF0C8"/><path d="M26 18l6-12 6 12z" fill="#7CF0C8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></g><circle cx="14" cy="14" r="9" fill="#7CF0C8" opacity=".35"/>`,
    water: `<rect x="6" y="34" width="44" height="22" rx="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>${['#EF6F5E', '#F6D24A', '#5E9BE0'].map((c, k) => `<ellipse cx="${16 + k * 12}" cy="45" rx="5" ry="4" fill="${c}" opacity=".85"/>`).join('')}<g transform="rotate(40 40 24)"><rect x="37" y="2" width="6" height="30" rx="3" fill="#C99568" stroke="${INK}" stroke-width="2"/><path d="M36 32h8l-1 8q-3 5-6 0z" fill="#5E9BE0" stroke="${INK}" stroke-width="2"/></g>`,
    metal: `<defs><linearGradient id="matGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B8862B"/><stop offset=".45" stop-color="#FFF1B0"/><stop offset="1" stop-color="#C99A2E"/></linearGradient></defs><g transform="rotate(35 32 32)"><rect x="25" y="12" width="14" height="44" rx="6" fill="url(#matGold)" stroke="${INK}" stroke-width="2.5"/><path d="M25 12l7-10 7 10z" fill="#E0E6EC" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></g>`,
    chalk: `<g transform="rotate(30 32 32)"><rect x="24" y="10" width="16" height="44" rx="6" fill="#F7F1E6" stroke="${INK}" stroke-width="2.5"/><circle cx="29" cy="22" r="1.5" fill="#D9CFC0"/><circle cx="35" cy="34" r="1.5" fill="#D9CFC0"/></g><circle cx="12" cy="52" r="2" fill="#EDE5D8"/><circle cx="18" cy="56" r="1.5" fill="#EDE5D8"/>`,
    stamps: `<rect x="20" y="4" width="18" height="16" rx="6" fill="#C99568" stroke="${INK}" stroke-width="2.5"/><rect x="25" y="18" width="8" height="10" fill="#A8744A" stroke="${INK}" stroke-width="2.5"/><rect x="12" y="28" width="34" height="12" rx="4" fill="#5E9BE0" stroke="${INK}" stroke-width="2.5"/><path d="M46 46l2.4 5.6 5.6 2.4-5.6 2.4L46 62l-2.4-5.6L38 54l5.6-2.4z" fill="#F6D24A" stroke="${INK}" stroke-width="1.5"/><circle cx="18" cy="52" r="6" fill="#EF6F5E" stroke="${INK}" stroke-width="2"/>`
  }[id]}</svg>`;
  const ownsMat = (id) => id === 'crayon' || (state.art && (state.art.mats || []).includes(id));

  // ---------------------------------------------------------------- colouring pages (viewBox 0 0 600 450)
  // each part: [id, guide colour, [dot x, dot y], svg shape]; lines: drawn on top, not colourable
  const P = (id, g, dot, el) => ({ id, g, dot, el });
  const petal = (k, g) => P('petal' + k, g, [300 + 62 * Math.sin((k * Math.PI) / 3), 150 - 62 * Math.cos((k * Math.PI) / 3)], `<ellipse cx="300" cy="96" rx="27" ry="42" transform="rotate(${k * 60} 300 150)"/>`);
  const arc = (k, r, g) => P('band' + k, g, [300 - r + 10, 296 - 4], `<path d="M${300 - r} 300A${r} ${r} 0 0 1 ${300 + r} 300H${300 + r - 20}A${r - 20} ${r - 20} 0 0 0 ${300 - r + 20} 300Z"/>`);
  const PAGES = [
    { id: 'lumi', name: 'Lumi', parts: [
      P('sky', 12, [60, 60], '<rect x="0" y="0" width="600" height="450"/>'),
      P('grass', 3, [70, 425], '<path d="M0 372Q300 344 600 372V450H0Z"/>'),
      P('earL', 1, [158, 108], '<circle cx="195" cy="128" r="50"/>'), P('earR', 1, [442, 108], '<circle cx="405" cy="128" r="50"/>'),
      P('inL', 9, [195, 120], '<circle cx="195" cy="128" r="27"/>'), P('inR', 9, [405, 120], '<circle cx="405" cy="128" r="27"/>'),
      P('body', 1, [300, 150], '<circle cx="300" cy="250" r="150"/>'), P('tummy', 9, [300, 335], '<ellipse cx="300" cy="300" rx="92" ry="78"/>'),
      P('footL', 1, [236, 410], '<ellipse cx="240" cy="400" rx="54" ry="26"/>'), P('footR', 1, [364, 410], '<ellipse cx="360" cy="400" rx="54" ry="26"/>'),
      P('cheekL', 7, [215, 262], '<circle cx="215" cy="262" r="19"/>'), P('cheekR', 7, [385, 262], '<circle cx="385" cy="262" r="19"/>')],
      lines: `<circle cx="256" cy="224" r="14" fill="${INK}"/><circle cx="344" cy="224" r="14" fill="${INK}"/><circle cx="261" cy="219" r="4.5" fill="#fff"/><circle cx="349" cy="219" r="4.5" fill="#fff"/><path d="M280 262q20 22 40 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` },
    { id: 'train', name: 'MRT train', parts: [
      P('sky', 12, [40, 40], '<rect x="0" y="0" width="600" height="300"/>'),
      P('sun', 2, [520, 70], '<circle cx="520" cy="70" r="40"/>'),
      P('cloud', 11, [130, 92], '<path d="M70 110a30 30 0 0 1 30-36 36 36 0 0 1 66-6 28 28 0 0 1 38 26 22 22 0 0 1-6 42H86a22 22 0 0 1-16-26z"/>'),
      P('ground', 10, [40, 420], '<rect x="0" y="300" width="600" height="150"/>'),
      P('track', 8, [575, 392], '<rect x="0" y="352" width="600" height="20" rx="4"/>'),
      P('wheel1', 13, [140, 340], '<circle cx="140" cy="340" r="23"/>'), P('wheel2', 13, [300, 340], '<circle cx="300" cy="340" r="23"/>'), P('wheel3', 13, [460, 340], '<circle cx="460" cy="340" r="23"/>'),
      P('body', 11, [110, 300], '<rect x="60" y="148" width="480" height="186" rx="42"/>'),
      P('stripe', 0, [100, 258], '<rect x="60" y="245" width="480" height="26"/>'),
      P('win1', 12, [130, 202], '<rect x="94" y="174" width="72" height="56" rx="12"/>'), P('win2', 12, [218, 202], '<rect x="182" y="174" width="72" height="56" rx="12"/>'),
      P('win3', 12, [382, 202], '<rect x="346" y="174" width="72" height="56" rx="12"/>'), P('win4', 12, [470, 202], '<rect x="434" y="174" width="72" height="56" rx="12"/>'),
      P('doorL', 4, [283, 300], '<rect x="266" y="168" width="34" height="150" rx="6"/>'), P('doorR', 4, [317, 300], '<rect x="300" y="168" width="34" height="150" rx="6"/>'),
      P('light', 2, [518, 300], '<circle cx="518" cy="300" r="13"/>')],
      lines: `<path d="M283 190v40M317 190v40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/><path d="M0 352h600" stroke="${INK}" stroke-width="3"/>` },
    { id: 'noodles', name: 'Noodles', parts: [
      P('table', 8, [50, 50], '<rect x="0" y="0" width="600" height="450"/>'),
      P('mat', 12, [70, 400], '<rect x="40" y="90" width="520" height="340" rx="30"/>'),
      P('chop1', 0, [430, 70], '<polygon points="418,38 436,44 360,214 344,208"/>'), P('chop2', 0, [468, 92], '<polygon points="458,58 474,66 386,222 370,216"/>'),
      P('bowl', 5, [300, 360], '<path d="M108 214Q300 236 492 214Q484 384 300 404Q116 384 108 214Z"/>'),
      P('band', 11, [150, 288], '<path d="M122 272Q300 294 478 272L472 296Q300 318 128 296Z"/>'),
      P('soup', 2, [170, 222], '<ellipse cx="300" cy="212" rx="192" ry="48"/>'),
      P('egg', 11, [196, 214], '<ellipse cx="228" cy="204" rx="48" ry="30"/>'), P('yolk', 1, [228, 204], '<circle cx="228" cy="204" r="16"/>'),
      P('leaf1', 3, [380, 196], '<path d="M340 214q14-34 70-30-12 34-70 30z"/>'), P('leaf2', 3, [430, 224], '<path d="M396 234q22-24 66-12-20 28-66 12z"/>'),
      P('fishcake', 11, [312, 188], '<circle cx="306" cy="186" r="22"/>')],
      lines: `<path d="M300 186m-10 0a10 10 0 1 1 10 10" fill="none" stroke="#F28DB2" stroke-width="5" stroke-linecap="round"/><path d="M150 236q20-12 40 0t40 0M330 248q20-12 40 0t40 0M250 250q20-12 40 0" fill="none" stroke="#C99A1E" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M220 120q-14-20 0-40t0-40M300 110q-14-20 0-40t0-40M380 120q-14-20 0-40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"/>` },
    { id: 'flower', name: 'Flower', parts: [
      P('sky', 12, [500, 230], '<rect x="0" y="0" width="600" height="450"/>'),
      P('sun', 2, [90, 80], '<circle cx="90" cy="80" r="46"/>'),
      P('cloud', 11, [470, 88], '<path d="M410 110a30 30 0 0 1 30-36 36 36 0 0 1 66-6 28 28 0 0 1 38 26 22 22 0 0 1-6 42H426a22 22 0 0 1-16-26z"/>'),
      P('grass', 3, [70, 420], '<path d="M0 362Q150 336 300 360T600 352V450H0Z"/>'),
      P('stem', 3, [300, 220], '<rect x="293" y="176" width="14" height="150" rx="6"/>'),
      P('leafL', 3, [255, 236], '<path d="M296 268Q236 258 222 214Q280 214 296 258Z"/>'), P('leafR', 3, [345, 246], '<path d="M304 290Q364 280 378 236Q320 236 304 280Z"/>'),
      petal(0, 7), petal(1, 6), petal(2, 7), petal(3, 6), petal(4, 7), petal(5, 6),
      P('middle', 2, [300, 150], '<circle cx="300" cy="150" r="31"/>'),
      P('pot', 1, [300, 395], '<path d="M242 334H358L344 432H256Z"/>'), P('rim', 8, [300, 328], '<rect x="230" y="316" width="140" height="26" rx="9"/>')],
      lines: `<path d="M90 16v-14M90 158v-14M26 80h-14M168 80h-14M44 34l-10-10M146 136l10 10M136 34l10-10M44 126l-10 10" stroke="#E0B12F" stroke-width="6" stroke-linecap="round"/><circle cx="290" cy="142" r="4" fill="${INK}" opacity=".5"/><circle cx="310" cy="156" r="4" fill="${INK}" opacity=".5"/><circle cx="302" cy="138" r="4" fill="${INK}" opacity=".5"/>` },
    { id: 'fish', name: 'Fish tank', parts: [
      P('water', 12, [540, 60], '<rect x="0" y="0" width="600" height="450"/>'),
      P('sand', 9, [300, 425], '<path d="M0 378Q150 356 300 378T600 372V450H0Z"/>'),
      P('weed1', 3, [100, 330], '<path d="M88 400C66 340 118 300 92 236C132 286 112 332 124 400Z"/>'), P('weed2', 4, [512, 330], '<path d="M500 400C478 330 532 296 506 226C548 280 524 330 538 400Z"/>'),
      P('rock1', 10, [180, 398], '<ellipse cx="180" cy="398" rx="52" ry="28"/>'), P('rock2', 8, [430, 404], '<ellipse cx="430" cy="404" rx="42" ry="22"/>'),
      P('tail1', 1, [370, 200], '<path d="M330 200L392 156V244Z"/>'), P('fish1', 1, [300, 200], '<ellipse cx="262" cy="200" rx="84" ry="52"/>'),
      P('stripe1', 11, [250, 182], '<path d="M236 152Q254 200 236 248L262 250Q278 200 262 150Z"/>'), P('stripe2', 11, [310, 196], '<path d="M300 158Q314 200 300 242L318 238Q330 200 318 162Z"/>'),
      P('tail2', 2, [336, 310], '<path d="M364 312L318 284V340Z"/>'), P('fish2', 5, [430, 312], '<ellipse cx="420" cy="312" rx="62" ry="36"/>')],
      lines: `<circle cx="210" cy="188" r="9" fill="${INK}"/><circle cx="213" cy="185" r="3" fill="#fff"/><circle cx="456" cy="304" r="7" fill="${INK}"/><path d="M190 214q10 8 20 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>${[[150, 120, 10], [170, 84, 7], [148, 52, 12], [470, 230, 9], [486, 198, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="4"/>`).join('')}` },
    { id: 'house', name: 'Rainbow house', parts: [
      P('sky', 12, [50, 50], '<rect x="0" y="0" width="600" height="450"/>'),
      arc(0, 270, 0), arc(1, 250, 1), arc(2, 230, 2), arc(3, 210, 3), arc(4, 190, 5),
      P('grass', 3, [60, 425], '<path d="M0 330Q300 296 600 330V450H0Z"/>'),
      P('cloudL', 11, [60, 300], '<path d="M10 316a26 26 0 0 1 30-34 32 32 0 0 1 58 4 22 22 0 0 1 8 40H22a18 18 0 0 1-12-10z"/>'),
      P('cloudR', 11, [540, 300], '<path d="M590 316a26 26 0 0 0-30-34 32 32 0 0 0-58 4 22 22 0 0 0-8 40h76a18 18 0 0 0 12-10z"/>'),
      P('trunk', 8, [498, 355], '<rect x="488" y="300" width="20" height="78" rx="5"/>'), P('tree', 3, [498, 270], '<circle cx="498" cy="276" r="46"/>'),
      P('walls', 2, [248, 360], '<rect x="210" y="250" width="180" height="140"/>'), P('roof', 0, [300, 222], '<polygon points="188,256 300,168 412,256"/>'),
      P('door', 8, [300, 360], '<rect x="280" y="318" width="40" height="72" rx="6"/>'),
      P('winL', 12, [248, 298], '<rect x="228" y="280" width="40" height="36" rx="6"/>'), P('winR', 12, [352, 298], '<rect x="332" y="280" width="40" height="36" rx="6"/>')],
      lines: `<path d="M248 280v36M228 298h40M352 280v36M332 298h40" stroke="${INK}" stroke-width="3"/><circle cx="312" cy="356" r="4" fill="${INK}"/>` }
  ];
  const IDEAS = ['Paint the sun and the sky.', 'Paint your favourite food.', 'Paint how you feel today.', 'Paint Lumi a new friend.', 'Paint a rainbow.', 'Paint your family.', 'Paint a train going fast.', 'Paint the sea and a fish.', 'Paint your house.', 'Paint a big flower.'];
  const PRAISE = ['I love the colours!', 'That is beautiful!', 'You worked so hard on this.', 'This makes me smile.', 'What a lovely picture!', 'I would hang this on my wall!'];

  // ---------------------------------------------------------------- state
  const AR = () => {
    if (!state.art) state.art = { works: [], fills: {}, dots: state.profile && state.profile.age === 'teen' ? false : true, done: {} };
    if (!state.art.mats) state.art.mats = [];
    if (!state.art.hang) state.art.hang = {};
    return state.art;
  };
  const SA = () => S.ar || (S.ar = { tab: 'colour', page: 'lumi', color: 1, hist: [], tool: 'brush', size: 1, stamp: 'star', view: null, idea: '', mat: 'crayon', box: false, buy: null, hangPick: false });
  const pageNow = () => PAGES.find((p) => p.id === SA().page) || PAGES[0];
  const fillsOf = (id) => AR().fills[id] || (AR().fills[id] = {});
  const today = () => A.todayKey();
  function maybeAward() {
    const a = AR();
    if (!a.aw || a.aw.d !== today()) a.aw = { d: today(), n: 0 };
    if (a.aw.n >= 3) return;
    a.aw.n += 1; save();
    if (A.award) A.award(1);
  }
  function blip(f) { if (A.MUSIC) A.MUSIC.note(null, { f, peak: 0.14, down: 0.25 }); }
  function nextPart() {
    const pg = pageNow(), fills = fillsOf(pg.id);
    return pg.parts.find((p) => !fills[p.id]) || null;
  }

  // ---------------------------------------------------------------- drawing the colouring page
  const DEFS = `<defs><filter id="arSoft" x="-5%" y="-5%" width="110%" height="110%" primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB">
      <feOffset in="SourceAlpha" dx="-0.04" dy="-0.06" result="o1"/><feGaussianBlur in="o1" stdDeviation="0.03" result="b1"/><feComposite in="SourceAlpha" in2="b1" operator="out" result="sh"/><feFlood flood-color="#3B2F2F" flood-opacity="0.16"/><feComposite in2="sh" operator="in" result="shade"/>
      <feOffset in="SourceAlpha" dx="0.03" dy="0.05" result="o2"/><feGaussianBlur in="o2" stdDeviation="0.025" result="b2"/><feComposite in="SourceAlpha" in2="b2" operator="out" result="hl"/><feFlood flood-color="#FFFFFF" flood-opacity="0.45"/><feComposite in2="hl" operator="in" result="light"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="light"/></feMerge></filter>
      <filter id="arNeon" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="m-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient></defs>`;
  // a fill is a crayon colour number, or "colour|material" for the materials from the pencil case
  const parseFill = (f) => { if (!f) return null; const [c, m] = String(f).split('|'); return { c: Number(c), m: m || 'crayon' }; };
  function matDefs(c, m) {
    const col = COLORS[c - 1][0], id = `m-${m}-${c}`;
    if (m === 'glitter') return `<pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="${col}"/><rect width="36" height="36" fill="url(#m-sheen)" opacity=".5"/>${[[8, 8, 4, '#fff'], [26, 14, 3, '#FFF3B0'], [16, 26, 3.4, '#fff'], [31, 31, 2.4, '#FFF3B0'], [4, 30, 2, '#fff']].map(([x, y, r, f2]) => `<path d="M${x} ${y - r * 1.6}l${r * 0.45} ${r * 1.15} ${r * 1.15} ${r * 0.45}-${r * 1.15} ${r * 0.45}-${r * 0.45} ${r * 1.15}-${r * 0.45}-${r * 1.15}-${r * 1.15}-${r * 0.45} ${r * 1.15}-${r * 0.45}z" fill="${f2}"/>`).join('')}<circle cx="20" cy="4" r="1.2" fill="#fff"/><circle cx="2" cy="18" r="1" fill="#fff"/></pattern>`;
    if (m === 'water') return `<radialGradient id="${id}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="${mix(col, '#FFFFFF', 0.6)}"/><stop offset=".55" stop-color="${mix(col, '#FFFFFF', 0.3)}"/><stop offset="1" stop-color="${col}"/></radialGradient>`;
    if (m === 'metal') return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(col, '#3B2F2F', 0.25)}"/><stop offset=".35" stop-color="${col}"/><stop offset=".5" stop-color="${mix(col, '#FFFFFF', 0.75)}"/><stop offset=".65" stop-color="${col}"/><stop offset="1" stop-color="${mix(col, '#3B2F2F', 0.3)}"/></linearGradient>`;
    if (m === 'chalk') return `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${mix(col, '#FFFFFF', 0.2)}"/><circle cx="3" cy="4" r="1.3" fill="#fff" opacity=".7"/><circle cx="10" cy="9" r="1.1" fill="#fff" opacity=".6"/><circle cx="7" cy="12" r=".9" fill="${mix(col, '#3B2F2F', 0.2)}" opacity=".5"/><circle cx="12" cy="2" r=".8" fill="#fff" opacity=".7"/></pattern>`;
    return '';
  }
  function fillAttrs(f) {
    const q = parseFill(f);
    if (!q) return 'fill="#FFFFFF"';
    const col = COLORS[q.c - 1][0];
    if (q.m === 'neon') return `fill="${mix(col, '#FFFFFF', 0.2)}" filter="url(#arNeon)"`;
    if (q.m === 'crayon') return `fill="${col}" filter="url(#arSoft)"`;
    return `fill="url(#m-${q.m}-${q.c})" filter="url(#arSoft)"`;
  }
  function pageSvg(pg, opts) {
    const o = opts || {};
    const fills = fillsOf(pg.id);
    const used = new Set();
    const parts = pg.parts.map((p) => {
      const f = fills[p.id], q = parseFill(f);
      if (q && q.m !== 'crayon' && q.m !== 'neon') used.add(q.c + '|' + q.m);
      return p.el.replace(/^<(\w+) /, `<$1 class="ar-part ${f ? 'filled' : ''} ${q && q.m === 'glitter' ? 'glit' : ''}" ${o.thumb ? '' : `data-r="${p.id}"`} ${fillAttrs(f)} ${o.thumb ? '' : 'data-a="arFill"'} `);
    }).join('');
    const extra = [...used].map((k) => { const [c, m] = k.split('|'); return matDefs(Number(c), m); }).join('');
    const dots = o.dots ? pg.parts.filter((p) => !fills[p.id]).map((p) => `<g class="ar-dot" data-d="${p.id}" pointer-events="none"><circle cx="${p.dot[0]}" cy="${p.dot[1]}" r="11" fill="#fff"/><circle cx="${p.dot[0]}" cy="${p.dot[1]}" r="8" fill="${COLORS[p.g][0]}" stroke="${INK}" stroke-width="1.5"/></g>`).join('') : '';
    return `<svg class="${o.cls || 'ar-page'}" viewBox="0 0 600 450" ${o.size ? `width="${o.size[0]}" height="${o.size[1]}"` : ''} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(pg.name)} colouring page">${DEFS.replace('</defs>', extra + '</defs>')}
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">${parts}</g><g pointer-events="none">${pg.lines}</g>${dots}</svg>`;
  }

  // ---------------------------------------------------------------- screen parts
  const crayons = () => {
    const s = SA();
    const m = MAT[s.mat] || MAT.crayon;
    return `<div class="ar-crayons" role="group" aria-label="Colours"><button class="ar-case-btn" data-a="arCase" aria-label="Pencil case. Now using ${esc(m.name)}">${matArt(m.id)}<b>${esc(m.name)}</b></button>${COLORS.map(([c, name], i) => `<button class="ar-crayon ${s.color === i + 1 ? 'on' : ''}" data-a="arColor" data-c="${i + 1}" style="--c:${c}" aria-label="${name}" aria-pressed="${s.color === i + 1}"><i></i></button>`).join('')}</div>`;
  };
  function pencilCase() {
    const s = SA();
    if (!s.box) return '';
    const card = (m) => {
      const have = ownsMat(m.id), on = !m.pack && s.mat === m.id, wants = s.buy === m.id, afford = state.stars >= m.price;
      const status = on ? `<span class="ic-green">${ic('check', 26)}</span><span>Using</span>` : have ? (m.pack ? `<span class="ic-green">${ic('check', 26)}</span><span>Yours</span>` : '<span class="ar-use">Use</span>')
        : wants ? `<span class="ar-buyit ${afford ? '' : 'faded'}">${ic('shop', 22)}${ic('star', 20)}${m.price}</span>` : `<span class="price ${afford ? '' : 'grey'}">${ic(afford ? 'star' : 'starGrey', 20)}${m.price}</span>`;
      return `<button class="ar-mat ${on ? 'on' : ''} ${have ? 'owned' : ''} ${wants ? 'want' : ''} ${!have && !afford ? 'locked' : ''}" data-a="${wants ? 'arMatBuy' : 'arMat'}" data-v="${m.id}" aria-label="${esc(m.name)}${have ? '' : ', ' + m.price + ' stars'}">${matArt(m.id)}<b>${esc(m.name)}</b><span class="ar-mat-st">${status}</span></button>`;
    };
    return `<div class="ar-case" role="dialog" aria-label="Pencil case"><div class="ar-case-head"><b>Pencil case</b><span class="muted">${s.buy && !ownsMat(s.buy) ? (state.stars >= MAT[s.buy].price ? 'Tap again to buy it.' : `You need ${MAT[s.buy].price - state.stars} more stars.`) : 'Pick something to colour with.'}</span><button class="ar-btn" data-a="arCaseClose" aria-label="Close">${ic('x', 28)}</button></div><div class="ar-mats">${MATS.map(card).join('')}</div></div>`;
  }
  const catOf = (id) => (A.ART_CATS ? A.ART_CATS.find((c) => c.pages.includes(id)) || A.ART_CATS[0] : null);
  // "More pictures": a tab for each group, and big pictures to choose from
  function picker(thumb) {
    const s = SA();
    if (!s.pick || !A.ART_CATS) return '';
    const cat = A.ART_CATS.find((c) => c.id === s.pickCat) || catOf(s.page);
    const tabs = A.ART_CATS.map((c) => { const first = PAGES.find((p) => p.id === c.pages[0]); return `<button class="ar-tab ${c.id === cat.id ? 'on' : ''}" data-a="arCatTab" data-v="${c.id}" aria-pressed="${c.id === cat.id}">${first ? pageSvg(first, { thumb: true, cls: 'ar-tabpic' }) : ''}<span>${esc(c.name)}</span></button>`; }).join('');
    const pics = cat.pages.map((id) => PAGES.find((p) => p.id === id)).filter(Boolean).map((p) => thumb(p, 'arPickPage')).join('');
    return `<div class="ar-pick" role="dialog" aria-label="Choose a picture"><div class="ar-pick-head"><b>Choose a picture</b><span class="grow"></span><button class="round-btn" data-a="arCatsOff" aria-label="Close">${ic('x', 30)}</button></div>
      <div class="ar-tabs" role="group" aria-label="Groups">${tabs}</div><div class="ar-pick-grid">${pics}</div></div>`;
  }
  function colourTab() {
    const s = SA(), a = AR(), pg = pageNow();
    const thumb = (p, act) => `<button class="ar-thumb ${p.id === pg.id ? 'on' : ''}" data-a="${act || 'arPage'}" data-v="${p.id}" aria-pressed="${p.id === pg.id}">${pageSvg(p, { thumb: true, cls: 'ar-mini' })}<b>${esc(p.name)}</b></button>`;
    // pictures come in groups (Animals, Places, Transport, Toys, Home things, Food): the side shows the
    // group of the picture being coloured; "More pictures" opens every group
    const cat = catOf(pg.id);
    const left = cat
      ? `<div class="ar-side" role="group" aria-label="${esc(cat.name)} pictures"><button class="ar-cat-btn" data-a="arCats" aria-label="${esc(cat.name)}. More pictures">${ic('palette', 26)}<span><b>${esc(cat.name)}</b><small>More pictures</small></span></button>${cat.pages.map((id) => PAGES.find((p) => p.id === id)).filter(Boolean).map((p) => thumb(p)).join('')}</div>`
      : `<div class="ar-side" role="group" aria-label="Pages">${PAGES.map((p) => thumb(p)).join('')}</div>`;
    const doneAll = !nextPart();
    const bar = `<div class="ar-bar">
      <span class="ar-lumi" id="arLumi">${L.svg({ look: A.lookWith(), mood: doneAll ? 'excited' : 'happy', size: 84 })}</span>
      <span class="ar-msg">${doneAll ? 'All done! It looks beautiful.' : a.dots ? 'Pick a crayon, then tap a part.' : 'Pick a crayon, tap to colour.'}</span>
      <span class="grow"></span>
      <button class="ar-chip ${a.dots ? 'on' : ''}" data-a="arDots" aria-pressed="${a.dots}"><span class="ar-dotic"></span><span>Colour dots</span></button>
      <button class="ar-btn" data-a="arUndo" aria-label="Undo" ${s.hist.length ? '' : 'disabled'}>${ic('undo', 30)}</button>
      <button class="ar-btn" data-a="arClear" aria-label="Start again">${ic('restart', 30)}</button>
      <button class="ar-save ${doneAll ? 'glow' : ''}" data-a="arSave">${ic('check', 28)}<span>Save</span></button>
    </div>`;
    return `<div class="row grow ar-body">${left}<div class="col grow ar-main">${bar}<div class="panel ar-paper grow" id="arPaper">${pageSvg(pg, { dots: a.dots })}${pencilCase()}</div></div>${crayons()}</div>${picker(thumb)}`;
  }
  const TOOLS = [['brush', 'Brush'], ['rainbow', 'Rainbow'], ['glitter', 'Glitter'], ['stamp', 'Stamps'], ['eraser', 'Eraser']];
  const STAMPS = ['star', 'heart', 'flower', 'paw', 'lumi'];
  const MORE_STAMPS = ['rocket', 'sun', 'car', 'cat', 'rainbow'];
  const stampList = () => (ownsMat('stamps') ? STAMPS.concat(MORE_STAMPS) : STAMPS);
  const toolArt = {
    brush: '<svg viewBox="0 0 48 48" width="40" height="40"><path d="M30 6l12 12-16 16-12-12z" fill="#C99A6B" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 22l12 12-4 4c-4 4-12 6-16 4 2-4 0-8 4-12z" fill="#5E9BE0" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    rainbow: '<svg viewBox="0 0 48 48" width="40" height="40">' + ['#EF6F5E', '#F6D24A', '#7CC46A', '#5E9BE0'].map((c, i) => `<path d="M${6 + i * 4} 38a${18 - i * 4} ${18 - i * 4} 0 0 1 ${36 - i * 8} 0" fill="none" stroke="${c}" stroke-width="4.5"/>`).join('') + '</svg>',
    glitter: '<svg viewBox="0 0 48 48" width="40" height="40"><path d="M24 4l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="#F6D24A" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/><circle cx="40" cy="40" r="3" fill="#F28DB2"/><circle cx="9" cy="38" r="2.5" fill="#9C7FD9"/></svg>',
    stamp: '<svg viewBox="0 0 48 48" width="40" height="40"><rect x="16" y="4" width="16" height="16" rx="6" fill="#C99A6B" stroke="#3B2F2F" stroke-width="2.4"/><rect x="20" y="18" width="8" height="10" fill="#A8744A" stroke="#3B2F2F" stroke-width="2.4"/><rect x="8" y="28" width="32" height="12" rx="4" fill="#F28DB2" stroke="#3B2F2F" stroke-width="2.4"/></svg>',
    eraser: '<svg viewBox="0 0 48 48" width="40" height="40"><path d="M6 30L24 12l16 16-14 14H18z" fill="#F7B7C8" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 22l16 16" stroke="#3B2F2F" stroke-width="2.4"/><path d="M26 42h16" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round"/></svg>'
  };
  const stampArt = (k) => `<svg viewBox="0 0 48 48" width="34" height="34">${{
    star: '<path d="M24 5l5.8 12 13.2 1.8-9.6 9.2 2.4 13L24 34.8 12.2 41l2.4-13L5 18.8 18.2 17z" fill="#F6D24A" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/>',
    heart: '<path d="M24 42S6 31 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z" fill="#F28DB2" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/>',
    flower: [0, 72, 144, 216, 288].map((r) => `<circle cx="24" cy="12" r="8" transform="rotate(${r} 24 24)" fill="#9C7FD9" stroke="#3B2F2F" stroke-width="2"/>`).join('') + '<circle cx="24" cy="24" r="7" fill="#F6D24A" stroke="#3B2F2F" stroke-width="2"/>',
    paw: '<ellipse cx="24" cy="31" rx="11" ry="9" fill="#A8744A" stroke="#3B2F2F" stroke-width="2"/>' + [[12, 18], [20, 11], [28, 11], [36, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#A8744A" stroke="#3B2F2F" stroke-width="2"/>`).join(''),
    lumi: '<circle cx="13" cy="13" r="7" fill="#F3A24E" stroke="#3B2F2F" stroke-width="2"/><circle cx="35" cy="13" r="7" fill="#F3A24E" stroke="#3B2F2F" stroke-width="2"/><circle cx="24" cy="26" r="16" fill="#F3A24E" stroke="#3B2F2F" stroke-width="2"/><circle cx="19" cy="24" r="2.4" fill="#3B2F2F"/><circle cx="29" cy="24" r="2.4" fill="#3B2F2F"/><path d="M21 30q3 3 6 0" stroke="#3B2F2F" stroke-width="2" fill="none" stroke-linecap="round"/>',
    rocket: `<path d="${SP.rocket}" fill="#E0E6EC" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="20" r="4.5" fill="#5E9BE0" stroke="#3B2F2F" stroke-width="2"/><path d="M19 34l-6 8M29 34l6 8" stroke="#3B2F2F" stroke-width="2.4"/><path d="M21 38l3 7 3-7z" fill="#F3A24E" stroke="#3B2F2F" stroke-width="2"/>`,
    sun: `<circle cx="24" cy="24" r="11" fill="#F6D24A" stroke="#3B2F2F" stroke-width="2.4"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<path d="M24 5v6" stroke="#E0A21E" stroke-width="3.4" stroke-linecap="round" transform="rotate(${r} 24 24)"/>`).join('')}`,
    car: `<path d="${SP.car}" fill="#EF6F5E" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/><circle cx="15" cy="34" r="5" fill="#3B2F2F"/><circle cx="33" cy="34" r="5" fill="#3B2F2F"/><path d="M17 20h6v6h-9zM26 20h5l4 6h-9z" fill="#BFE3F7"/>`,
    cat: `<path d="${SP.cat}" fill="#9AA6B2" stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round"/><circle cx="19" cy="25" r="2.2" fill="#3B2F2F"/><circle cx="29" cy="25" r="2.2" fill="#3B2F2F"/><path d="M22 30q2 2 4 0" stroke="#3B2F2F" stroke-width="2" fill="none"/>`,
    rainbow: ['#EF6F5E', '#F6D24A', '#7CC46A', '#5E9BE0'].map((c, i) => `<path d="M${6 + i * 4} 36a${18 - i * 4} ${18 - i * 4} 0 0 1 ${36 - i * 8} 0" fill="none" stroke="${c}" stroke-width="4.6"/>`).join('')
  }[k]}</svg>`;
  // outlines shared by the stamp buttons and the stamps painted on the paper (48 x 48)
  const SP = {
    rocket: 'M24 4c8 6 10 16 8 30H16c-2-14 0-24 8-30z',
    car: 'M6 32v-6l6-8h18l8 8h4v6z',
    cat: 'M10 38V18l6 6h16l6-6v20q-14 6-28 0z'
  };
  function paintTab() {
    const s = SA();
    const left = `<div class="ar-side ar-tools" role="group" aria-label="Tools">
      ${TOOLS.map(([id, name]) => `<button class="ar-tool ${s.tool === id ? 'on' : ''}" data-a="arTool" data-v="${id}" aria-pressed="${s.tool === id}">${toolArt[id]}<b>${name}</b></button>`).join('')}
      <div class="ar-sizes" role="group" aria-label="Brush size">${[0, 1, 2].map((i) => `<button class="${s.size === i ? 'on' : ''}" data-a="arSize" data-v="${i}" aria-pressed="${s.size === i}" aria-label="${['Thin', 'Medium', 'Thick'][i]}"><i style="width:${8 + i * 9}px;height:${8 + i * 9}px"></i></button>`).join('')}</div>
    </div>`;
    const stamps = s.tool === 'stamp' ? `<div class="ar-stamps" role="group" aria-label="Stamps">${stampList().map((k) => `<button class="${s.stamp === k ? 'on' : ''}" data-a="arStamp" data-v="${k}" aria-pressed="${s.stamp === k}" aria-label="${k} stamp">${stampArt(k)}</button>`).join('')}</div>` : `<span class="ar-msg">${esc(s.idea || 'Paint anything you like!')}</span>`;
    const bar = `<div class="ar-bar">
      <span class="ar-lumi" id="arLumi">${L.svg({ look: A.lookWith(), mood: 'happy', size: 84 })}</span>
      ${stamps}
      <span class="grow"></span>
      <button class="ar-chip" data-a="arIdea">${ic('kHint', 30)}<span>Idea</span></button>
      <button class="ar-btn" data-a="arUndo" aria-label="Undo">${ic('undo', 30)}</button>
      <button class="ar-btn" data-a="arClear" aria-label="Start again">${ic('restart', 30)}</button>
      <button class="ar-save" data-a="arSave">${ic('check', 28)}<span>Save</span></button>
    </div>`;
    return `<div class="row grow ar-body">${left}<div class="col grow ar-main">${bar}<div class="panel ar-paper paint grow" id="arPaper"><canvas id="arCanvas" width="1200" height="900" aria-label="Painting paper"></canvas>${pencilCase()}</div></div>${crayons()}</div>`;
  }
  function galleryTab() {
    const s = SA(), works = AR().works;
    if (s.view) {
      const w = works.find((x) => x.id === s.view);
      if (w) return `<div class="col grow ar-view"><div class="ar-bar"><span class="ar-lumi" id="arLumi">${L.svg({ look: A.lookWith(), mood: 'excited', size: 84 })}</span><span class="ar-msg">${esc(s.praise || PRAISE[0])}</span><span class="grow"></span>
        <button class="ar-btn" data-a="arDel" data-v="${w.id}" aria-label="Take this picture out">${ic('trash', 30)}</button><button class="ar-chip" data-a="arHang">${ic('house', 28)}<span>Hang in room</span></button><button class="ar-save" data-a="arBackToWall">${ic('back', 28)}<span>All my art</span></button></div>
        <div class="grow ar-bigframe">${s.hangPick ? hangBar(w) : ''}<span class="ar-frame big"><img src="${w.img}" alt="Your picture"></span></div></div>`;
    }
    if (!works.length) return `<div class="col grow ar-empty"><span>${L.svg({ look: A.lookWith(), mood: 'happy', size: 160 })}</span><b>Your art will go here.</b><span class="muted">Colour or paint a picture, then tap Save.</span>
      <div class="row gap16"><button class="ar-save" data-a="arTab" data-v="colour">${ic('palette', 28)}<span>Colour in</span></button><button class="ar-save" data-a="arTab" data-v="paint">${toolArt.brush}<span>Paint</span></button></div></div>`;
    return `<div class="ar-wall grow">${works.map((w, i) => `<button class="ar-frame" data-a="arOpen" data-v="${w.id}" aria-label="Picture ${i + 1}" style="--tilt:${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg"><img src="${w.img}" alt=""></button>`).join('')}</div>`;
  }

  A.PARENT.art = 'fun';
  A.VOICE.art = () => ({ colour: 'Pick a crayon, then tap a part of the picture.', paint: 'Paint with your finger.', gallery: 'Here is your art.' }[SA().tab]);
  A.SCREENS.art = () => {
    const s = SA();
    const tabs = [['colour', 'Colour in', 'palette'], ['paint', 'Paint', 'pencil'], ['gallery', 'My art', 'heart']];
    const body = s.tab === 'paint' ? paintTab() : s.tab === 'gallery' ? galleryTab() : colourTab();
    return `
<section class="screen ar-screen" aria-label="Art studio">
  ${A.srTitle('Art studio')}
  <div class="row" style="height:60px;gap:12px;flex:none">
    ${A.backBtn()}${A.speakBtn(A.VOICE.art())}
    <div class="mu-tabs" role="tablist">${tabs.map(([id, name, icon]) => `<button class="tab shelf-tab ${s.tab === id ? 'on' : ''}" data-a="arTab" data-v="${id}" role="tab" aria-selected="${s.tab === id}">${ic(icon, 30)}<span>${name}</span>${id === 'gallery' && AR().works.length ? `<em class="ar-count">${AR().works.length}</em>` : ''}</button>`).join('')}</div>
    ${A.starChip(true)}
  </div>
  ${body}
</section>`;
  };
  A.GUIDE.art = () => {
    const s = SA();
    if (s.tab !== 'colour' || !AR().dots) return null;
    const p = nextPart();
    if (!p) return { sel: '[data-a="arSave"]', say: 'Tap Save to keep it.', delay: state.settings.guideDelay * 1000 + 3000 };
    if (s.color !== p.g + 1) return { sel: `[data-a="arColor"][data-c="${p.g + 1}"]`, say: `Try ${COLORS[p.g][1]}.`, delay: state.settings.guideDelay * 1000 + 3000 };
    return { sel: `#arPaper .ar-dot[data-d="${p.id}"]`, say: 'Tap the dot.', delay: state.settings.guideDelay * 1000 + 3000 };
  };

  // ---------------------------------------------------------------- painting
  let cv = null, cx = null, undo = [], hue = 0;
  const SIZES = [10, 24, 46];
  function snapshot() { if (!cx) return; undo.push(cx.getImageData(0, 0, 1200, 900)); if (undo.length > 15) undo.shift(); }
  function paper() { cx.save(); cx.globalCompositeOperation = 'source-over'; cx.fillStyle = '#FFFFFF'; cx.fillRect(0, 0, 1200, 900); cx.restore(); }
  function strokeStyle() {
    const s = SA();
    if (s.tool === 'rainbow') { hue = (hue + 4) % 360; return `hsl(${hue} 80% 62%)`; }
    if (s.tool === 'eraser') return '#FFFFFF';
    return COLORS[s.color - 1][0];
  }
  let starGap = 0;
  function matLine(a, b) {
    const s = SA(), m = s.mat, w = SIZES[s.size], col = COLORS[s.color - 1][0];
    const seg = (c, lw, alpha, dx, dy) => { cx.globalAlpha = alpha; cx.strokeStyle = c; cx.lineWidth = lw; cx.beginPath(); cx.moveTo(a[0] + (dx || 0), a[1] + (dy || 0)); cx.lineTo(b[0] + (dx || 0), b[1] + (dy || 0)); cx.stroke(); };
    cx.save(); cx.lineCap = 'round'; cx.lineJoin = 'round';
    if (m === 'neon') { cx.shadowColor = col; cx.shadowBlur = w * 1.2; seg(mix(col, '#FFFFFF', 0.25), w * 0.8, 1); cx.shadowBlur = 0; seg('#FFFFFF', Math.max(2, w * 0.22), 0.9); }
    else if (m === 'water') { for (let k = 0; k < 3; k++) seg(mix(col, '#FFFFFF', 0.15), w * (1.3 + k * 0.35), 0.12, (Math.random() - 0.5) * w * 0.4, (Math.random() - 0.5) * w * 0.4); }
    else if (m === 'metal') { seg(mix(col, '#3B2F2F', 0.3), w, 1, 0, w * 0.12); seg(col, w * 0.8, 1); seg(mix(col, '#FFFFFF', 0.8), Math.max(2, w * 0.25), 0.95, -w * 0.15, -w * 0.15); }
    else if (m === 'chalk') { const d = Math.hypot(b[0] - a[0], b[1] - a[1]); const n = Math.max(3, d / 2); cx.fillStyle = mix(col, '#FFFFFF', 0.25); for (let k = 0; k < n * 3; k++) { const t = Math.random(), r = (Math.random() - 0.5) * w; cx.globalAlpha = 0.25 + Math.random() * 0.4; cx.fillRect(a[0] + (b[0] - a[0]) * t + r * 0.7, a[1] + (b[1] - a[1]) * t + (Math.random() - 0.5) * w, 1.5 + Math.random() * 2.5, 1.5 + Math.random() * 2.5); } }
    else if (m === 'glitter') {
      cx.shadowColor = 'rgba(59,47,47,0.18)'; cx.shadowBlur = 3; cx.shadowOffsetY = 2; seg(col, w * 0.7, 1); cx.shadowColor = 'transparent';
      starGap += Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (starGap > 22) {
        starGap -= 22;
        const x = b[0] + (Math.random() - 0.5) * w * 1.4, y = b[1] + (Math.random() - 0.5) * w * 1.4, r = 4 + Math.random() * (w * 0.35);
        cx.globalAlpha = 1; cx.fillStyle = ['#FFFFFF', '#FFF3B0', '#F6D24A', mix(col, '#FFFFFF', 0.6)][Math.floor(Math.random() * 4)];
        cx.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? r * 0.38 : r, aa = (j * Math.PI) / 4 - Math.PI / 2; cx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(59,47,47,.35)'; cx.lineWidth = 1; cx.stroke();
      }
    }
    cx.restore();
  }
  function line(a, b) {
    const s = SA(), w = SIZES[s.size] * (s.tool === 'eraser' ? 1.6 : 1);
    if (s.tool === 'brush' && s.mat && s.mat !== 'crayon' && ownsMat(s.mat)) { matLine(a, b); return; }
    cx.save();
    cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.lineWidth = w; cx.strokeStyle = strokeStyle();
    if (s.tool !== 'eraser') { cx.shadowColor = 'rgba(59,47,47,0.18)'; cx.shadowBlur = 3; cx.shadowOffsetY = 2; }
    cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke();
    if (s.tool !== 'eraser') { cx.shadowColor = 'transparent'; cx.globalAlpha = 0.28; cx.strokeStyle = '#fff'; cx.lineWidth = Math.max(2, w * 0.22); cx.beginPath(); cx.moveTo(a[0] - w * 0.18, a[1] - w * 0.18); cx.lineTo(b[0] - w * 0.18, b[1] - w * 0.18); cx.stroke(); }
    cx.restore();
  }
  function glitter(p) {
    const s = SA(), r = SIZES[s.size] * 1.4;
    cx.save();
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * r;
      const x = p[0] + Math.cos(a) * d, y = p[1] + Math.sin(a) * d, k = 2 + Math.random() * 5;
      cx.fillStyle = Math.random() < 0.3 ? '#FFFFFF' : `hsl(${(hue += 23) % 360} 85% 65%)`;
      if (Math.random() < 0.25) { cx.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? k * 0.8 : k * 2.6, aa = (j * Math.PI) / 4; cx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } cx.fill(); } else { cx.beginPath(); cx.arc(x, y, k * 0.7, 0, Math.PI * 2); cx.fill(); }
    }
    cx.restore();
  }
  function stamp(p) {
    const s = SA(), k = s.stamp, sz = 40 + SA().size * 30, col = COLORS[s.color - 1][0];
    cx.save(); cx.translate(p[0], p[1]); cx.scale(sz / 24, sz / 24); cx.translate(-24, -24);
    cx.lineWidth = 2.4; cx.strokeStyle = INK; cx.lineJoin = 'round';
    cx.shadowColor = 'rgba(59,47,47,0.22)'; cx.shadowBlur = 2; cx.shadowOffsetY = 1.5;
    const fill = (path, c) => { const pp = new Path2D(path); cx.fillStyle = c; cx.fill(pp); cx.shadowColor = 'transparent'; cx.stroke(pp); cx.shadowColor = 'rgba(59,47,47,0.22)'; };
    const circ = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    if (k === 'star') fill('M24 5l5.8 12 13.2 1.8-9.6 9.2 2.4 13L24 34.8 12.2 41l2.4-13L5 18.8 18.2 17z', col);
    if (k === 'heart') fill('M24 42S6 31 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z', col);
    if (k === 'flower') { [0, 72, 144, 216, 288].forEach((r) => { const a = (r * Math.PI) / 180; fill(circ(24 + Math.sin(a) * 12, 24 - Math.cos(a) * 12, 8), col); }); fill(circ(24, 24, 7), '#F6D24A'); }
    if (k === 'paw') { fill('M13 31a11 9 0 1 0 22 0a11 9 0 1 0-22 0', col); [[12, 18], [20, 11], [28, 11], [36, 18]].forEach(([x, y]) => fill(circ(x, y, 5), col)); }
    if (k === 'rocket') { fill(SP.rocket, '#E0E6EC'); fill(circ(24, 20, 4.5), col); fill('M21 34l3 9 3-9z', '#F3A24E'); }
    if (k === 'sun') { fill(circ(24, 24, 11), col); cx.lineWidth = 3.4; cx.strokeStyle = '#E0A21E'; for (let r = 0; r < 8; r++) { const a = (r * Math.PI) / 4; cx.beginPath(); cx.moveTo(24 + Math.sin(a) * 14, 24 - Math.cos(a) * 14); cx.lineTo(24 + Math.sin(a) * 19, 24 - Math.cos(a) * 19); cx.stroke(); } cx.lineWidth = 2.4; cx.strokeStyle = INK; }
    if (k === 'car') { fill(SP.car, col); fill(circ(15, 34, 5), INK); fill(circ(33, 34, 5), INK); cx.fillStyle = '#BFE3F7'; cx.fill(new Path2D('M17 20h6v6h-9zM26 20h5l4 6h-9z')); }
    if (k === 'cat') { fill(SP.cat, col); cx.fillStyle = INK; cx.fill(new Path2D(circ(19, 25, 2.2))); cx.fill(new Path2D(circ(29, 25, 2.2))); cx.stroke(new Path2D('M22 30q2 2 4 0')); }
    if (k === 'rainbow') { cx.lineWidth = 4.6; ['#EF6F5E', '#F6D24A', '#7CC46A', '#5E9BE0'].forEach((c2, i) => { cx.strokeStyle = c2; cx.beginPath(); cx.arc(24, 36, 18 - i * 4, Math.PI, 0); cx.stroke(); }); }
    if (k === 'lumi') { fill(circ(13, 13, 7), '#F3A24E'); fill(circ(35, 13, 7), '#F3A24E'); fill(circ(24, 26, 16), '#F3A24E'); cx.fillStyle = INK; cx.fill(new Path2D(circ(19, 24, 2.4))); cx.fill(new Path2D(circ(29, 24, 2.4))); cx.fillStyle = '#F28DB2'; cx.fill(new Path2D(circ(15, 30, 2.6))); cx.fill(new Path2D(circ(33, 30, 2.6))); cx.stroke(new Path2D('M21 30q3 3 6 0')); }
    cx.restore();
    blip(660 + (stampList().indexOf(k) % 6) * 90);
  }
  function wirePaint() {
    cv = document.getElementById('arCanvas');
    if (!cv) { cx = null; return; }
    cx = cv.getContext('2d');
    if (S.arPaint) cx.putImageData(S.arPaint, 0, 0); else paper();
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 1200, ((e.clientY - r.top) / r.height) * 900]; };
    let last = null, moved = 0;
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      snapshot(); const p = pos(e); last = p; moved = 0;
      const t = SA().tool;
      if (t === 'stamp') { stamp(p); last = null; } else if (t === 'glitter') glitter(p); else line(p, [p[0] + 0.1, p[1] + 0.1]);
      S.arDirty = true;
    });
    cv.addEventListener('pointermove', (e) => {
      if (!last) return;
      const p = pos(e), t = SA().tool;
      if (t === 'glitter') { if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 14) { glitter(p); last = p; } return; }
      line(last, p); moved += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p;
    });
    const up = () => { if (last || SA().tool === 'stamp') S.arPaint = cx.getImageData(0, 0, 1200, 900); last = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }
  // fit the 4:3 sheet into the space left on any screen
  function fitPaper() {
    const box = document.getElementById('arPaper');
    if (!box) return;
    const el = box.firstElementChild;
    if (!el || el.tagName !== 'CANVAS') return;
    const w = box.clientWidth - 24, h = box.clientHeight - 24;
    const k = Math.min(w / 4, h / 3);
    el.style.width = Math.floor(k * 4) + 'px'; el.style.height = Math.floor(k * 3) + 'px';
  }
  window.addEventListener('resize', () => { if (S.screen === 'art') fitPaper(); });

  A.AFTER.art = () => {
    fitPaper();
    if (SA().tab === 'paint') wirePaint();
  };

  // ---------------------------------------------------------------- saving
  function toImage(cb) {
    const s = SA();
    const out = document.createElement('canvas'); out.width = 600; out.height = 450;
    const c = out.getContext('2d');
    if (s.tab === 'paint') { if (!cv) return; c.drawImage(cv, 0, 0, 600, 450); cb(out.toDataURL('image/jpeg', 0.85)); return; }
    const svg = pageSvg(pageNow(), { thumb: true, size: [600, 450] });
    const img = new Image();
    img.onload = () => { c.fillStyle = '#fff'; c.fillRect(0, 0, 600, 450); c.drawImage(img, 0, 0, 600, 450); cb(out.toDataURL('image/jpeg', 0.85)); };
    img.onerror = () => cb(null);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function lumiCheer(mood) {
    const el = document.getElementById('arLumi');
    if (el) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }
  }

  Object.assign(A.ACTIONS, {
    arTab: (d) => { const s = SA(); if (s.tab === 'paint' && cx) S.arPaint = cx.getImageData(0, 0, 1200, 900); s.tab = d.v; s.view = null; s.hist = []; render(); say(A.VOICE.art()); },
    arPage: (d) => { const s = SA(); s.page = d.v; s.hist = []; render(); say(pageNow().name + '.'); },
    arCats: () => { const s = SA(); s.pick = true; s.pickCat = (catOf(s.page) || {}).id; render(); say('Choose a picture.'); },
    arCatTab: (d) => { const s = SA(); s.pickCat = d.v; render(); const c = A.ART_CATS.find((x) => x.id === d.v); if (c) say(c.name + '.'); },
    arPickPage: (d) => { const s = SA(); s.page = d.v; s.hist = []; s.pick = false; render(); say(pageNow().name + '.'); },
    arCatsOff: () => { SA().pick = false; render(); },
    arColor: (d) => {
      SA().color = Number(d.c);
      stageEl().querySelectorAll('.ar-crayon').forEach((b) => { const on = b.dataset.c === d.c; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      blip(440 + Number(d.c) * 30);
      say(COLORS[Number(d.c) - 1][1]);
    },
    arFill: (d, el) => {
      const s = SA(), pg = pageNow(), fills = fillsOf(pg.id), p = pg.parts.find((x) => x.id === d.r);
      if (!p) return;
      s.hist.push([p.id, fills[p.id] || 0]);
      const f = s.mat && s.mat !== 'crayon' && ownsMat(s.mat) ? `${s.color}|${s.mat}` : s.color;
      fills[p.id] = f; save();
      if (typeof f === 'string' && !['neon'].includes(s.mat)) { render(); if (!nextPart()) finishPage(pg); return; }
      const q = parseFill(f), col = COLORS[q.c - 1][0];
      el.setAttribute('fill', q.m === 'neon' ? mix(col, '#FFFFFF', 0.2) : col); el.setAttribute('filter', q.m === 'neon' ? 'url(#arNeon)' : 'url(#arSoft)'); el.classList.add('filled', 'pop');
      const dot = stageEl().querySelector(`.ar-dot[data-d="${p.id}"]`); if (dot) dot.remove();
      blip(523 + (s.color % 7) * 40);
      lumiCheer();
      if (!nextPart()) finishPage(pg);
      else {
        const u = stageEl().querySelector('[data-a="arUndo"]'); if (u) u.disabled = false;
      }
    },
    arDots: () => { AR().dots = !AR().dots; save(); render(); },
    arUndo: () => {
      const s = SA();
      if (s.tab === 'paint') { if (undo.length && cx) { cx.putImageData(undo.pop(), 0, 0); S.arPaint = cx.getImageData(0, 0, 1200, 900); } return; }
      const h = s.hist.pop(); if (!h) return;
      const fills = fillsOf(pageNow().id);
      if (h[1]) fills[h[0]] = h[1]; else delete fills[h[0]];
      save(); render();
    },
    arClear: () => {
      const s = SA();
      if (s.tab === 'paint') { if (cx) { snapshot(); paper(); S.arPaint = cx.getImageData(0, 0, 1200, 900); } say('A fresh sheet.'); return; }
      const fills = fillsOf(pageNow().id);
      s.hist = Object.keys(fills).map((k) => [k, fills[k]]);
      AR().fills[pageNow().id] = {}; save(); render(); say('A fresh page. Tap Undo to bring it back.');
    },
    arSave: () => {
      toImage((img) => {
        if (!img) return;
        const a = AR();
        a.works.unshift({ id: A.uid(), img, t: Date.now() });
        while (a.works.length > 12) { const hung = new Set(Object.values(a.hang)); const k = a.works.map((w) => hung.has(w.id)).lastIndexOf(false); a.works.splice(k >= 0 ? k : a.works.length - 1, 1); }
        save();
        if (SA().tab === 'paint') maybeAward();
        A.showToast(`${ic('palette', 36)}<span>Saved to My art</span>`);
        say('Saved! You can see it in My art.');
        render();
      });
    },
    arTool: (d) => { SA().tool = d.v; if (cx) S.arPaint = cx.getImageData(0, 0, 1200, 900); render(); say({ brush: 'Brush.', rainbow: 'Rainbow brush!', glitter: 'Glitter!', stamp: 'Pick a stamp, then tap the paper.', eraser: 'Eraser.' }[d.v]); },
    arSize: (d) => { SA().size = Number(d.v); stageEl().querySelectorAll('.ar-sizes button').forEach((b) => b.classList.toggle('on', b.dataset.v === d.v)); },
    arStamp: (d) => { SA().stamp = d.v; stageEl().querySelectorAll('.ar-stamps button').forEach((b) => b.classList.toggle('on', b.dataset.v === d.v)); blip(700); },
    arIdea: () => { const s = SA(); const list = IDEAS.filter((x) => x !== s.idea); s.idea = list[Math.floor(Math.random() * list.length)]; if (s.tool === 'stamp') s.tool = 'brush'; if (cx) S.arPaint = cx.getImageData(0, 0, 1200, 900); render(); say(s.idea); },
    arOpen: (d) => { const s = SA(); s.view = d.v; s.praise = PRAISE[Math.floor(Math.random() * PRAISE.length)]; render(); say(s.praise); },
    arBackToWall: () => { SA().view = null; render(); },
    arDel: (d) => { const a = AR(); a.works = a.works.filter((w) => w.id !== d.v); Object.keys(a.hang).forEach((k) => { if (a.hang[k] === d.v) delete a.hang[k]; }); save(); SA().view = null; render(); say('Taken out.'); }
  });
  function finishPage(pg) {
    const key = pg.id + '@' + today();
    if (!AR().done[key]) { AR().done[key] = 1; maybeAward(); }
    later(() => { render(); say('All done! It looks beautiful. Tap Save to keep it.'); }, 350);
  }
  // when a frame is bought, it shows the newest picture straight away
  const roomBuy = A.ACTIONS.roomBuy;
  if (roomBuy) A.ACTIONS.roomBuy = (d, el) => {
    const had = state.owned.includes(d.id);
    roomBuy(d, el);
    if (!had && state.owned.includes(d.id) && d.id && d.id.startsWith('af-')) {
      const a = AR();
      if (!a.hang[d.id] && a.works.length) a.hang[d.id] = a.works[0].id;
      save(); S.roomPick = d.id; render();
      say(a.works.length ? 'Your picture is in the frame! Tap the paint palette to change it.' : 'A new frame! Make a picture in Art to put in it.');
    }
  };
  function stageEl() { return document.getElementById('stage') || document; }
  // ---------------------------------------------------------------- picture frames for Lumi's room
  // Each frame is a normal room item (it moves, grows, shrinks, turns and goes away like the rest).
  // Its picture is one of the child's saved works: state.art.hang[frameId] = work id.
  const FRAMES = [
    { id: 'af-wood', name: 'Wooden frame', price: 3, pos: { left: 4, top: 14, w: 14 } },
    { id: 'af-white', name: 'White frame', price: 3, pos: { left: 44, top: 12, w: 13 } },
    { id: 'af-rainbow', name: 'Rainbow frame', price: 5, pos: { left: 58, top: 14, w: 13 } },
    { id: 'af-gold', name: 'Gold frame', price: 6, pos: { left: 5, top: 40, w: 14 } },
    { id: 'af-flower', name: 'Flower frame', price: 5, pos: { left: 84, top: 3, w: 12 } },
    { id: 'af-easel', name: 'Easel', price: 6, pos: { left: 80, bottom: 4, w: 15 } }
  ];
  const FRAME = Object.fromEntries(FRAMES.map((f) => [f.id, f]));
  FRAMES.forEach((f) => { if (!A.D.ROOM.some((r) => r.id === f.id)) A.D.ROOM.push(Object.assign({ tab: 'art' }, f)); });
  const workFor = (fid) => {
    const a = AR(), id = a.hang[fid];
    return a.works.find((w) => w.id === id) || null;
  };
  // the picture (or a "your art here" card) inside a frame, in a 24 x 18 box at x, y
  const picIn = (fid, x, y, w, h, clip) => {
    const work = workFor(fid);
    if (work) return `<image href="${work.img}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"${clip ? ` clip-path="url(#${clip})"` : ''}/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFFDF8"${clip ? ` clip-path="url(#${clip})"` : ''}/><path d="M${x + w * 0.3} ${y + h * 0.7}l${w * 0.12} -${h * 0.25} ${w * 0.1} ${h * 0.14} ${w * 0.12} -${h * 0.3} ${w * 0.16} ${h * 0.41}z" fill="#CFE8BE"/><circle cx="${x + w * 0.72}" cy="${y + h * 0.3}" r="${h * 0.1}" fill="#F6D24A"/>`;
  };
  const nail = (cx0) => `<path d="M${cx0 - 6} 4L${cx0} 0.8 ${cx0 + 6} 4" fill="none" stroke="#8A6A4A" stroke-width=".5"/><circle cx="${cx0}" cy=".8" r=".7" fill="#9AA6B2"/>`;
  function frameSvg(fid, size) {
    const sz = size || 40, u = fid.replace('af-', '');
    let vb = '0 0 24 22', body = '';
    if (u === 'wood') body = `${nail(12)}<defs><linearGradient id="fw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D2A06E"/><stop offset="1" stop-color="#8A5A34"/></linearGradient></defs><rect x="1" y="4" width="22" height="17.5" rx="1" fill="url(#fw)" stroke="${INK}" stroke-width=".5"/><rect x="2.6" y="5.6" width="18.8" height="14.3" fill="#FFFDF8"/>${picIn(fid, 3.4, 6.4, 17.2, 12.7)}<rect x="2.6" y="5.6" width="18.8" height="14.3" fill="none" stroke="#6B4425" stroke-width=".35"/>`;
    if (u === 'white') body = `${nail(12)}<rect x="1" y="4" width="22" height="17.5" rx="1" fill="#FFFFFF" stroke="#C9C1B6" stroke-width=".6"/><rect x="2.4" y="5.4" width="19.2" height="14.7" fill="#F1ECE4"/>${picIn(fid, 4, 7, 16, 11.5)}<rect x="1" y="4" width="22" height="17.5" rx="1" fill="none" stroke="${INK}" stroke-width=".4"/>`;
    if (u === 'rainbow') body = `${nail(12)}${['#EF6F5E', '#F3A24E', '#F6D24A', '#7CC46A', '#5E9BE0', '#9C7FD9'].map((c, i) => `<rect x="${1 + i * 0.45}" y="${4 + i * 0.45}" width="${22 - i * 0.9}" height="${17.5 - i * 0.9}" rx="1.4" fill="${c}"/>`).join('')}${picIn(fid, 3.8, 6.8, 16.4, 11.9)}<rect x="1" y="4" width="22" height="17.5" rx="1.4" fill="none" stroke="${INK}" stroke-width=".45"/>`;
    if (u === 'gold') body = `${nail(12)}<defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1B0"/><stop offset=".4" stop-color="#E0B23E"/><stop offset=".7" stop-color="#FFE48A"/><stop offset="1" stop-color="#A97E1E"/></linearGradient></defs><rect x="1" y="4" width="22" height="17.5" rx="1" fill="url(#fg)" stroke="${INK}" stroke-width=".5"/><rect x="2.2" y="5.2" width="19.6" height="15.1" fill="none" stroke="#FFF6CC" stroke-width=".4" stroke-dasharray=".6 .6"/>${[[1.8, 4.8], [22.2, 4.8], [1.8, 20.7], [22.2, 20.7]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#F6D24A" stroke="${INK}" stroke-width=".3"/>`).join('')}${picIn(fid, 3.4, 6.4, 17.2, 12.7)}<rect x="3.4" y="6.4" width="17.2" height="12.7" fill="none" stroke="#8A6512" stroke-width=".4"/>`;
    if (u === 'flower') { vb = '0 0 24 24'; body = `<defs><clipPath id="fcl-${fid}"><circle cx="12" cy="12" r="7.2"/></clipPath></defs>${Array.from({ length: 10 }, (_, k) => `<ellipse cx="12" cy="3.2" rx="3" ry="3.4" transform="rotate(${k * 36} 12 12)" fill="${k % 2 ? '#F28DB2' : '#F7B7C8'}" stroke="${INK}" stroke-width=".35"/>`).join('')}<circle cx="12" cy="12" r="8.2" fill="#FFF4D6" stroke="${INK}" stroke-width=".4"/>${picIn(fid, 4.8, 4.8, 14.4, 14.4, 'fcl-' + fid)}<circle cx="12" cy="12" r="7.2" fill="none" stroke="#C9573A" stroke-width=".35"/>`; }
    if (u === 'easel') { vb = '0 0 24 30'; body = `<path d="M7 29L11 6M17 29L13 6M12 21v8" stroke="#A8744A" stroke-width="1.4" stroke-linecap="round"/><path d="M7 29L11 6M17 29L13 6" stroke="${INK}" stroke-width=".3"/><rect x="3" y="18.5" width="18" height="1.6" rx=".6" fill="#C99568" stroke="${INK}" stroke-width=".35"/><rect x="3.5" y="4" width="17" height="14.5" rx=".6" fill="#FFFDF8" stroke="${INK}" stroke-width=".45"/>${picIn(fid, 4.3, 4.8, 15.4, 12.9)}<rect x="10.5" y="2.6" width="3" height="2" rx=".5" fill="#C99568" stroke="${INK}" stroke-width=".3"/>`; }
    return `<svg width="${sz}" height="${sz}" viewBox="${vb}" aria-hidden="true">${body}</svg>`;
  }
  // frames draw through the same Lumi.item() the room uses for everything else
  const baseItem = L.item;
  L.item = (id, size) => (FRAME[id] ? frameSvg(id, size) : baseItem(id, size));

  // Room > Art: tap a frame you own, then Picture, to choose what goes in it
  function frameTools() {
    const id = S.roomPick;
    if (S.screen !== 'room' || !FRAME[id]) return;
    const bar = document.querySelector('.room-foot .size-bar.tools');
    if (!bar || bar.querySelector('[data-a="framePic"]')) return;
    bar.insertAdjacentHTML('afterbegin', `<button class="size-btn frame-pic" data-a="framePic" data-id="${id}" aria-label="Choose the picture">${ic('palette', 30)}</button>`);
  }
  function framePicker() {
    const id = S.framePick, works = AR().works;
    const foot = document.querySelector('.room-foot');
    if (S.screen !== 'room' || !id || !foot) return;
    const now = AR().hang[id];
    foot.innerHTML = works.length
      ? `<div class="frame-strip" role="group" aria-label="Pick a picture for the ${esc(FRAME[id].name.toLowerCase())}">${works.map((w, i) => `<button class="frame-thumb ${w.id === now ? 'on' : ''}" data-a="frameSet" data-id="${id}" data-w="${w.id}" aria-label="Picture ${i + 1}"><img src="${w.img}" alt=""></button>`).join('')}<button class="icon-btn size-done" data-a="framePickDone" aria-label="Done">${ic('check', 30)}</button></div>`
      : `<div class="frame-strip empty"><span>${ic('palette', 34)}</span><b>Make a picture in Art first.</b><button class="primary" data-a="frameToArt" style="height:64px">${ic('pencil', 28)}<span>Art</span></button><button class="icon-btn size-done" data-a="framePickDone" aria-label="Done">${ic('check', 30)}</button></div>`;
  }
  const prevAfter = A.afterRender;
  A.afterRender = () => { if (prevAfter) prevAfter(); try { if (S.screen !== 'room') S.framePick = null; frameTools(); framePicker(); } catch (e) { /* frames are only decoration */ } };

  // My art: hang the picture you are looking at in one of your frames
  const ownedFrames = () => FRAMES.filter((f) => state.owned.includes(f.id));
  function hangBar(w) {
    const fr = ownedFrames();
    if (!fr.length) return `<div class="ar-hang"><b>Buy a frame in Lumi's room to hang it.</b><button class="ar-save" data-a="frameShop">${ic('house', 28)}<span>Get a frame</span></button><button class="ar-btn" data-a="arHangClose" aria-label="Close">${ic('x', 28)}</button></div>`;
    return `<div class="ar-hang"><b>Which frame?</b>${fr.map((f) => `<button class="ar-hang-f ${AR().hang[f.id] === w.id ? 'on' : ''}" data-a="arHangIn" data-id="${f.id}" data-w="${w.id}" aria-label="${esc(f.name)}">${frameSvg(f.id, 70)}</button>`).join('')}<button class="ar-btn" data-a="frameShop" aria-label="Get another frame">${ic('plus', 28)}</button><button class="ar-btn" data-a="arHangClose" aria-label="Close">${ic('x', 28)}</button></div>`;
  }
  A.artFrames = FRAMES; A.artHangBar = hangBar;

  Object.assign(A.ACTIONS, {
    arCase: () => { const s = SA(); s.box = !s.box; s.buy = null; if (cx) S.arPaint = cx.getImageData(0, 0, 1200, 900); render(); if (s.box) say('Pencil case. Pick something to colour with.'); },
    arCaseClose: () => { const s = SA(); s.box = false; s.buy = null; if (cx) S.arPaint = cx.getImageData(0, 0, 1200, 900); render(); },
    arMat: (d) => {
      const s = SA(), m = MAT[d.v];
      if (cx) S.arPaint = cx.getImageData(0, 0, 1200, 900);
      if (ownsMat(m.id)) {
        if (m.pack) { s.box = false; s.tool = 'stamp'; if (s.tab !== 'paint') s.tab = 'paint'; render(); say('Pick a stamp, then tap the paper.'); return; }
        s.mat = m.id; s.box = false; if (s.tool !== 'brush' && s.tab === 'paint') s.tool = 'brush'; render(); say(m.say); blip(700); return;
      }
      s.buy = m.id; render();
      say(state.stars >= m.price ? `${m.name}. ${m.price} stars. Tap it again to buy it.` : `${m.name}. You need ${m.price - state.stars} more stars.`);
    },
    arMatBuy: (d) => {
      const s = SA(), m = MAT[d.v];
      if (cx) S.arPaint = cx.getImageData(0, 0, 1200, 900);
      if (state.stars < m.price) { say(`You need ${m.price - state.stars} more stars.`); return; }
      state.stars -= m.price; AR().mats.push(m.id); save();
      tone(659, 0.3, 0.1);
      s.buy = null;
      if (!m.pack) s.mat = m.id;
      render();
      A.showToast(`${matArt(m.id)}<span>New: ${esc(m.name)}</span>`);
      say(`A new ${m.name.toLowerCase()}! ${m.say}`);
    },
    arHang: () => { SA().hangPick = true; render(); say('Which frame shall we hang it in?'); },
    arHangClose: () => { SA().hangPick = false; render(); },
    arHangIn: (d) => {
      AR().hang[d.id] = d.w;
      if (state.roomAway) state.roomAway = state.roomAway.filter((x) => x !== d.id);
      save(); SA().hangPick = false; tone(784, 0.25, 0.08);
      A.showToast(`${frameSvg(d.id, 48)}<span>In Lumi's room!</span>`);
      render(); say("It's hanging in Lumi's room!");
    },
    frameShop: () => { S.roomTab = 'art'; S.roomSel = null; S.roomPick = null; SA().hangPick = false; A.go('room'); say('Pick a frame to buy.'); },
    framePic: (d) => { S.framePick = d.id; render(); say(AR().works.length ? 'Pick a picture for the frame.' : 'Make a picture in Art first.'); },
    frameSet: (d) => {
      AR().hang[d.id] = d.w; save(); tone(784, 0.2, 0.06);
      const box = document.querySelector(`.room-scene .movable[data-id="${d.id}"] .decor-turn`);
      if (box) box.innerHTML = frameSvg(d.id, '100%').replace('height="100%"', '');
      document.querySelectorAll('.frame-thumb').forEach((b) => b.classList.toggle('on', b.dataset.w === d.w));
      say('Lovely!');
    },
    framePickDone: () => { S.framePick = null; render(); },
    frameToArt: () => { S.framePick = null; const s = SA(); s.tab = 'colour'; A.go('art'); }
  });
  A.artPages = PAGES; // for tests
})();
