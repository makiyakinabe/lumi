/*
  art.js
  The Art studio (Fun › Art). Three tabs:

  Colour in   Six colouring pages drawn in Lumi's style (Lumi, an MRT train, a bowl of noodles, a flower,
              a fish tank, a house under a rainbow). Pick a crayon, tap a part to fill it. With "Colour dots"
              on, each part shows a small dot of the colour it could be, so the child can match colours;
              any colour is still fine, nothing is ever wrong. Undo, start again, and save to My art.
  Paint       A big sheet of paper and a finger: three brush sizes, a rainbow brush, a glitter brush,
              five stamps (star, heart, flower, paw, Lumi), an eraser, undo and start again.
              "Give me an idea" suggests something to paint.
  My art      Every saved picture in a wooden frame. Tap one to see it big; Lumi says what she likes.

  Why: drawing and colouring build hand control and hand-eye coordination, and give children who
  speak few words a way to show what they feel. Colours, crayons and stamps are big and easy to hit.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, save, render, later } = A;

  // ---------------------------------------------------------------- colours
  const COLORS = [
    ['#EF6F5E', 'red'], ['#F3A24E', 'orange'], ['#F6D24A', 'yellow'], ['#7CC46A', 'green'], ['#4FB3A9', 'teal'], ['#5E9BE0', 'blue'], ['#9C7FD9', 'purple'],
    ['#F28DB2', 'pink'], ['#A8744A', 'brown'], ['#F6C9A0', 'peach'], ['#9AA6B2', 'grey'], ['#FFFFFF', 'white'], ['#A9D8F5', 'light blue'], ['#4A3F3B', 'dark brown']
  ];
  const INK = '#3B2F2F';

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
    return state.art;
  };
  const SA = () => S.ar || (S.ar = { tab: 'colour', page: 'lumi', color: 1, hist: [], tool: 'brush', size: 1, stamp: 'star', view: null, idea: '' });
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
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="light"/></feMerge></filter></defs>`;
  function pageSvg(pg, opts) {
    const o = opts || {};
    const fills = fillsOf(pg.id);
    const parts = pg.parts.map((p) => {
      const f = fills[p.id];
      return p.el.replace(/^<(\w+) /, `<$1 class="ar-part ${f ? 'filled' : ''}" ${o.thumb ? '' : `data-r="${p.id}"`} fill="${f ? COLORS[f - 1][0] : '#FFFFFF'}" ${f ? 'filter="url(#arSoft)"' : ''} ${o.thumb ? '' : 'data-a="arFill"'} `);
    }).join('');
    const dots = o.dots ? pg.parts.filter((p) => !fills[p.id]).map((p) => `<g class="ar-dot" data-d="${p.id}" pointer-events="none"><circle cx="${p.dot[0]}" cy="${p.dot[1]}" r="11" fill="#fff"/><circle cx="${p.dot[0]}" cy="${p.dot[1]}" r="8" fill="${COLORS[p.g][0]}" stroke="${INK}" stroke-width="1.5"/></g>`).join('') : '';
    return `<svg class="${o.cls || 'ar-page'}" viewBox="0 0 600 450" ${o.size ? `width="${o.size[0]}" height="${o.size[1]}"` : ''} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(pg.name)} colouring page">${DEFS}
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">${parts}</g><g pointer-events="none">${pg.lines}</g>${dots}</svg>`;
  }

  // ---------------------------------------------------------------- screen parts
  const crayons = () => {
    const s = SA();
    return `<div class="ar-crayons" role="group" aria-label="Colours">${COLORS.map(([c, name], i) => `<button class="ar-crayon ${s.color === i + 1 ? 'on' : ''}" data-a="arColor" data-c="${i + 1}" style="--c:${c}" aria-label="${name}" aria-pressed="${s.color === i + 1}"><i></i></button>`).join('')}</div>`;
  };
  function colourTab() {
    const s = SA(), a = AR(), pg = pageNow();
    const left = `<div class="ar-side" role="group" aria-label="Pages">${PAGES.map((p) => `<button class="ar-thumb ${p.id === pg.id ? 'on' : ''}" data-a="arPage" data-v="${p.id}" aria-pressed="${p.id === pg.id}">${pageSvg(p, { thumb: true, cls: 'ar-mini' })}<b>${esc(p.name)}</b></button>`).join('')}</div>`;
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
    return `<div class="row grow ar-body">${left}<div class="col grow ar-main">${bar}<div class="panel ar-paper grow" id="arPaper">${pageSvg(pg, { dots: a.dots })}</div></div>${crayons()}</div>`;
  }
  const TOOLS = [['brush', 'Brush'], ['rainbow', 'Rainbow'], ['glitter', 'Glitter'], ['stamp', 'Stamps'], ['eraser', 'Eraser']];
  const STAMPS = ['star', 'heart', 'flower', 'paw', 'lumi'];
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
    lumi: '<circle cx="13" cy="13" r="7" fill="#F3A24E" stroke="#3B2F2F" stroke-width="2"/><circle cx="35" cy="13" r="7" fill="#F3A24E" stroke="#3B2F2F" stroke-width="2"/><circle cx="24" cy="26" r="16" fill="#F3A24E" stroke="#3B2F2F" stroke-width="2"/><circle cx="19" cy="24" r="2.4" fill="#3B2F2F"/><circle cx="29" cy="24" r="2.4" fill="#3B2F2F"/><path d="M21 30q3 3 6 0" stroke="#3B2F2F" stroke-width="2" fill="none" stroke-linecap="round"/>'
  }[k]}</svg>`;
  function paintTab() {
    const s = SA();
    const left = `<div class="ar-side ar-tools" role="group" aria-label="Tools">
      ${TOOLS.map(([id, name]) => `<button class="ar-tool ${s.tool === id ? 'on' : ''}" data-a="arTool" data-v="${id}" aria-pressed="${s.tool === id}">${toolArt[id]}<b>${name}</b></button>`).join('')}
      <div class="ar-sizes" role="group" aria-label="Brush size">${[0, 1, 2].map((i) => `<button class="${s.size === i ? 'on' : ''}" data-a="arSize" data-v="${i}" aria-pressed="${s.size === i}" aria-label="${['Thin', 'Medium', 'Thick'][i]}"><i style="width:${8 + i * 9}px;height:${8 + i * 9}px"></i></button>`).join('')}</div>
    </div>`;
    const stamps = s.tool === 'stamp' ? `<div class="ar-stamps" role="group" aria-label="Stamps">${STAMPS.map((k) => `<button class="${s.stamp === k ? 'on' : ''}" data-a="arStamp" data-v="${k}" aria-pressed="${s.stamp === k}" aria-label="${k} stamp">${stampArt(k)}</button>`).join('')}</div>` : `<span class="ar-msg">${esc(s.idea || 'Paint anything you like!')}</span>`;
    const bar = `<div class="ar-bar">
      <span class="ar-lumi" id="arLumi">${L.svg({ look: A.lookWith(), mood: 'happy', size: 84 })}</span>
      ${stamps}
      <span class="grow"></span>
      <button class="ar-chip" data-a="arIdea">${ic('kHint', 30)}<span>Idea</span></button>
      <button class="ar-btn" data-a="arUndo" aria-label="Undo">${ic('undo', 30)}</button>
      <button class="ar-btn" data-a="arClear" aria-label="Start again">${ic('restart', 30)}</button>
      <button class="ar-save" data-a="arSave">${ic('check', 28)}<span>Save</span></button>
    </div>`;
    return `<div class="row grow ar-body">${left}<div class="col grow ar-main">${bar}<div class="panel ar-paper paint grow" id="arPaper"><canvas id="arCanvas" width="1200" height="900" aria-label="Painting paper"></canvas></div></div>${crayons()}</div>`;
  }
  function galleryTab() {
    const s = SA(), works = AR().works;
    if (s.view) {
      const w = works.find((x) => x.id === s.view);
      if (w) return `<div class="col grow ar-view"><div class="ar-bar"><span class="ar-lumi" id="arLumi">${L.svg({ look: A.lookWith(), mood: 'excited', size: 84 })}</span><span class="ar-msg">${esc(s.praise || PRAISE[0])}</span><span class="grow"></span>
        <button class="ar-btn" data-a="arDel" data-v="${w.id}" aria-label="Take this picture out">${ic('trash', 30)}</button><button class="ar-save" data-a="arBackToWall">${ic('back', 28)}<span>All my art</span></button></div>
        <div class="grow ar-bigframe"><span class="ar-frame big"><img src="${w.img}" alt="Your picture"></span></div></div>`;
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
  function line(a, b) {
    const s = SA(), w = SIZES[s.size] * (s.tool === 'eraser' ? 1.6 : 1);
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
    if (k === 'lumi') { fill(circ(13, 13, 7), '#F3A24E'); fill(circ(35, 13, 7), '#F3A24E'); fill(circ(24, 26, 16), '#F3A24E'); cx.fillStyle = INK; cx.fill(new Path2D(circ(19, 24, 2.4))); cx.fill(new Path2D(circ(29, 24, 2.4))); cx.fillStyle = '#F28DB2'; cx.fill(new Path2D(circ(15, 30, 2.6))); cx.fill(new Path2D(circ(33, 30, 2.6))); cx.stroke(new Path2D('M21 30q3 3 6 0')); }
    cx.restore();
    blip(660 + STAMPS.indexOf(k) * 90);
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
      fills[p.id] = s.color; save();
      el.setAttribute('fill', COLORS[s.color - 1][0]); el.setAttribute('filter', 'url(#arSoft)'); el.classList.add('filled', 'pop');
      const dot = stageEl().querySelector(`.ar-dot[data-d="${p.id}"]`); if (dot) dot.remove();
      blip(523 + (s.color % 7) * 40);
      lumiCheer();
      if (!nextPart()) {
        const key = pg.id + '@' + today();
        if (!AR().done[key]) { AR().done[key] = 1; maybeAward(); }
        later(() => { render(); say('All done! It looks beautiful. Tap Save to keep it.'); }, 350);
      } else {
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
        if (a.works.length > 12) a.works.length = 12;
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
    arDel: (d) => { const a = AR(); a.works = a.works.filter((w) => w.id !== d.v); save(); SA().view = null; render(); say('Taken out.'); }
  });
  function stageEl() { return document.getElementById('stage') || document; }
  A.artPages = PAGES; // for tests
})();
