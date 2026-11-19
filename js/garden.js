/*
  garden.js
  Lumi's garden (Fun › Garden). Four wooden planters in Lumi's back garden.

  Plant       Tap an empty planter and pick a seed: tomato, strawberry, carrot or sunflower.
              Planting is the same four picture steps every time, shown along the top like a timetable:
              1 Dig (drag the spade to the soil), 2 Seed (drag the seeds into the hole),
              3 Cover (pat the soil three times), 4 Water (drag the watering can to the soil).
  Look after  Plants grow while their soil is wet (dark). When the soil turns light and cracked the plant
              droops and needs water. Weeds pop up (tap to pull them, they go in the green bin), a snail
              may crawl onto the leaves (tap it and Lumi moves it gently to the grass), and when there are
              flowers a bee comes to visit (tap it: bees help flowers turn into fruit).
              Tap a plant to touch and smell it: Lumi says how its leaves feel and smell.
  Pick        Ripe tomatoes and strawberries are tapped one by one into the basket, a carrot is pulled
              with three tugs, a sunflower gives its seeds. Then the planter is ready for a new seed.
  Away        Plants grow a little while the child is away (one step after a few hours) and wait,
              thirsty, for water. Plants never die and nothing is ever lost.

  Why: gardening practises following steps in order and waiting for something to grow, it is calm,
  and touching and smelling plants is gentle sensory play. Everything works by tapping too, so
  dragging is never needed: tap a tool, then tap the planter.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, save, render, later, every } = A;
  const INK = '#3B2F2F';
  const K = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  // ---------------------------------------------------------------- plants
  const PLANTS = {
    tomato: { name: 'Tomato', many: 'tomatoes', fruits: 3, color: '#EF6F5E', feel: 'Tomato leaves feel a little fuzzy. Sniff! They smell fresh and green.', ripe: 'The tomatoes are red and ready. Tap them to pick!', fact: 'Tomatoes grow from little yellow flowers.' },
    strawberry: { name: 'Strawberry', many: 'strawberries', fruits: 4, color: '#E5505E', feel: 'Strawberry leaves come in threes. They feel bumpy, with soft hairs.', ripe: 'The strawberries are red. Tap them to pick!', fact: 'Strawberries grow from little white flowers.' },
    carrot: { name: 'Carrot', many: 'carrots', fruits: 1, color: '#F3A24E', feel: 'Carrot tops are soft and feathery, like a feather. They smell like a carrot!', ripe: 'The carrot is ready. Tap it three times to pull it up!', fact: 'The carrot grows under the soil. We eat the root!' },
    sunflower: { name: 'Sunflower', many: 'sunflower seeds', fruits: 1, color: '#F6D24A', feel: 'Sunflower leaves feel rough, like sandpaper. Sunflowers turn to face the sun!', ripe: 'The sunflower is open. Tap the flower to get its seeds!', fact: 'One sunflower has lots of seeds. We can plant them again!' }
  };
  const ORDER = ['tomato', 'strawberry', 'carrot', 'sunflower'];
  const STEPS = [['dig', 'Dig'], ['seed', 'Seed'], ['cover', 'Cover'], ['water', 'Water']];
  // two rows of planters: two at the back (smaller, further away) and two at the front
  const POS = [{ x: 430, y: 432, k: 0.82 }, { x: 748, y: 432, k: 0.82 }, { x: 405, y: 640, k: 1.08 }, { x: 738, y: 640, k: 1.08 }];
  const SOIL_Y = 352; // planters are drawn around their soil at 0,352, then moved into place
  const plotT = (i) => `translate(${POS[i].x},${POS[i].y}) scale(${POS[i].k}) translate(0,${-SOIL_Y})`;
  const WET_MS = 60000, GROW_S = 30, AWAY_MS = 3 * 3600 * 1000;

  // ---------------------------------------------------------------- state
  const GD = () => {
    if (!state.garden) state.garden = { plots: [0, 1, 2, 3].map(() => ({ p: null, st: 0, g: 0, wet: 0, weeds: 0, snail: false, picked: 0, pulls: 0 })), basket: {}, seen: Date.now(), planted: 0 };
    return state.garden;
  };
  const SG = () => S.gd || (S.gd = { tool: null, task: null, msg: '', anim: null, bee: null, picker: null, drag: false, mood: 'happy' });
  const now = () => Date.now();
  const isWet = (pl) => pl.wet > now();
  function limitedAward(n) {
    const g = GD();
    if (!g.aw || g.aw.d !== A.todayKey()) g.aw = { d: A.todayKey(), n: 0 };
    if (g.aw.n >= 5) return;
    g.aw.n += n; save();
    if (A.award) A.award(n);
  }
  function blip(f, d) { if (A.MUSIC) A.MUSIC.note(null, { f, peak: 0.14, down: d || 0.25 }); }
  function tell(msg, mood) { const s = SG(); s.msg = msg; if (mood) s.mood = mood; say(msg); }

  // ---------------------------------------------------------------- drawing
  const DEFS = `<defs>
    <linearGradient id="gdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F7"/><stop offset="1" stop-color="#E8F5FB"/></linearGradient>
    <linearGradient id="gdGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8D88A"/><stop offset="1" stop-color="#7CB863"/></linearGradient>
    <linearGradient id="gdWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C99568"/><stop offset="1" stop-color="#9B6B43"/></linearGradient>
    <linearGradient id="gdSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A5A34"/><stop offset="1" stop-color="#A8744A"/></linearGradient>
    <radialGradient id="gdLeaf" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FD884"/><stop offset="1" stop-color="#4E9A3E"/></radialGradient>
    <radialGradient id="gdRed" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFB3A6"/><stop offset=".45" stop-color="#EF5E4E"/><stop offset="1" stop-color="#C23A2E"/></radialGradient>
    <radialGradient id="gdOrange" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFD1A0"/><stop offset=".5" stop-color="#F3963E"/><stop offset="1" stop-color="#D2732A"/></radialGradient>
    <radialGradient id="gdSun" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF3B0"/><stop offset="1" stop-color="#F6C744"/></radialGradient>
    <radialGradient id="gdWet" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#7A5034"/><stop offset="1" stop-color="#4E3220"/></radialGradient>
    <radialGradient id="gdDry" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#D9B48A"/><stop offset="1" stop-color="#B58A5E"/></radialGradient>
  </defs>`;
  const leaf = (x, y, rx, ry, rot) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#gdLeaf)" ${K}/><path d="M${x} ${y}l${(Math.cos((rot * Math.PI) / 180) * rx * 0.8).toFixed(1)} ${(Math.sin((rot * Math.PI) / 180) * rx * 0.8).toFixed(1)}" stroke="#3E7A30" stroke-width="2" stroke-linecap="round"/>`;
  const stem = (h, w) => `<path d="M0 0C-4 ${-h * 0.4} 4 ${-h * 0.7} 0 ${-h}" fill="none" stroke="#5E9E45" stroke-width="${w || 7}" stroke-linecap="round"/>`;
  const shine = (x, y, r) => `<ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.28}" ry="${r * 0.18}" fill="#fff" opacity=".7"/>`;
  function sprout() { return `${stem(30, 6)}${leaf(-12, -30, 13, 8, -25)}${leaf(12, -30, 13, 8, 25)}`; }
  function seedSign(p) {
    const c = PLANTS[p].color;
    return `<g transform="translate(58,6)"><rect x="-3" y="-44" width="6" height="46" fill="#C99568" ${K}/><rect x="-20" y="-66" width="40" height="30" rx="5" fill="#FFFDF8" ${K}/><circle cx="0" cy="-51" r="9" fill="${c}" stroke="${INK}" stroke-width="2"/></g>`;
  }
  // a plant drawn with its root at 0,0 (the middle of the soil)
  function plantArt(i, pl) {
    const p = pl.p, st = pl.st;
    if (!p) return '';
    if (st === 0) return `<ellipse cx="0" cy="2" rx="34" ry="9" fill="#5A3A24" ${K}/>`;
    if (st === 1) return sprout();
    const fr = (k, x, y, inner) => (pl.picked & (1 << k) ? '' : `<g class="gd-fruit" data-a="gdPick" data-plot="${i}" data-k="${k}" role="button" aria-label="Pick">${inner(x, y)}</g>`);
    if (p === 'tomato') {
      const h = [0, 0, 70, 110, 130, 135][st];
      let s = st >= 3 ? `<rect x="22" y="${-h - 10}" width="7" height="${h + 14}" rx="3" fill="#D9C08A" ${K}/>` : '';
      s += stem(h);
      const L2 = [[-20, -h * 0.3, -150], [20, -h * 0.45, -30], [-22, -h * 0.65, -160], [22, -h * 0.8, -20], [-14, -h * 0.95, -120], [14, -h, -60]];
      s += L2.slice(0, st === 2 ? 4 : 6).map(([x, y, r]) => leaf(x, y, 20, 10, r)).join('');
      if (st === 4) s += [[-26, -h * 0.55], [26, -h * 0.7], [-8, -h * 0.85]].map(([x, y]) => `<g transform="translate(${x},${y})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-6" rx="3.5" ry="6" fill="#F6D24A" stroke="${INK}" stroke-width="1.5" transform="rotate(${r})"/>`).join('')}<circle r="3" fill="#E0A21E"/></g>`).join('');
      if (st === 5) s += [[-28, -h * 0.5], [28, -h * 0.62], [-6, -h * 0.82]].map(([x, y], k) => fr(k, x, y, (a, b) => `<circle cx="${a}" cy="${b}" r="17" fill="url(#gdRed)" ${K}/>${shine(a, b, 17)}<path d="M${a - 8} ${b - 15}l8 4 8-4-4 6h-8z" fill="#5E9E45" stroke="${INK}" stroke-width="2"/>`)).join('');
      return s;
    }
    if (p === 'strawberry') {
      const tri = (x, y, r) => `<g transform="translate(${x},${y}) rotate(${r})">${[-35, 0, 35].map((a) => `<ellipse cx="0" cy="-15" rx="9" ry="13" transform="rotate(${a})" fill="url(#gdLeaf)" ${K}/>`).join('')}</g>`;
      const n = st === 2 ? 3 : 5;
      let s = `${[[-30, -22, -40], [30, -22, 40], [0, -38, 0], [-46, -10, -70], [46, -10, 70]].slice(0, n).map(([x, y, r]) => `<path d="M0 0L${x * 0.7} ${y * 0.7}" stroke="#5E9E45" stroke-width="4"/>${tri(x, y, r)}`).join('')}`;
      if (st === 4) s += [[-34, -4], [34, -6], [0, -6]].map(([x, y]) => `<g transform="translate(${x},${y})">${[0, 72, 144, 216, 288].map((r) => `<circle cx="0" cy="-6" r="5" fill="#fff" stroke="${INK}" stroke-width="1.5" transform="rotate(${r})"/>`).join('')}<circle r="3.5" fill="#F6D24A"/></g>`).join('');
      if (st === 5) s += [[-46, 2], [-18, 6], [18, 6], [46, 2]].map(([x, y], k) => fr(k, x, y, (a, b) => `<path d="M${a} ${b + 20}C${a - 18} ${b + 6} ${a - 14} ${b - 10} ${a} ${b - 8}C${a + 14} ${b - 10} ${a + 18} ${b + 6} ${a} ${b + 20}Z" fill="url(#gdRed)" ${K}/>${[[-5, 0], [5, 0], [0, 8], [-6, 9], [6, 9]].map(([dx, dy]) => `<circle cx="${a + dx}" cy="${b + dy}" r="1.4" fill="#FFE27A"/>`).join('')}<path d="M${a - 9} ${b - 9}l9 3 9-3-3 -5-6 3-6-3z" fill="#5E9E45" stroke="${INK}" stroke-width="1.6"/>`)).join('');
      return s;
    }
    if (p === 'carrot') {
      const h = [0, 0, 40, 64, 80, 84][st];
      const frond = (a, len) => { const x = Math.sin((a * Math.PI) / 180) * len, y = -Math.cos((a * Math.PI) / 180) * len; return `<path d="M0 0L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#5E9E45" stroke-width="3.5" stroke-linecap="round"/>${[0.45, 0.65, 0.85, 1].map((t) => `<circle cx="${(x * t).toFixed(1)}" cy="${(y * t).toFixed(1)}" r="${(7 - t * 3).toFixed(1)}" fill="url(#gdLeaf)" stroke="${INK}" stroke-width="1.6"/>`).join('')}`; };
      let s = [-40, -20, 0, 20, 40].slice(st === 2 ? 1 : 0, st === 2 ? 4 : 5).map((a) => frond(a, h)).join('');
      if (st >= 4) {
        const lift = st === 5 ? pl.pulls * 14 : 0;
        const carrot = `<g transform="translate(0,${-lift})"><path d="M-16 -2Q0 -10 16 -2L4 ${54 + 0}Q0 60 -4 54Z" fill="url(#gdOrange)" ${K}/><path d="M-8 12h7M2 24h7M-5 36h6" stroke="#B85E1E" stroke-width="2.4" stroke-linecap="round"/></g>`;
        s = `<g transform="translate(0,${-lift})">${s}</g>`;
        s = (st === 5 ? fr(0, 0, 0, () => `<g class="gd-carrot">${carrot}${s}</g>`) : `<path d="M-16 -2Q0 -10 16 -2z" fill="url(#gdOrange)" ${K}/>${s}`);
      }
      return s;
    }
    if (p === 'sunflower') {
      const h = [0, 0, 70, 130, 175, 185][st];
      let s = stem(h, 9);
      s += [[-24, -h * 0.25, -160], [24, -h * 0.4, -20], [-26, -h * 0.58, -165], [26, -h * 0.72, -15]].slice(0, st === 2 ? 2 : 4).map(([x, y, r]) => leaf(x, y, 26, 13, r)).join('');
      if (st === 3) s += `<circle cx="0" cy="${-h}" r="10" fill="#7CB863" ${K}/>`;
      if (st === 4) s += `<g transform="translate(0,${-h})">${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<ellipse cx="0" cy="-12" rx="6" ry="10" transform="rotate(${r})" fill="#9CCB7A" stroke="${INK}" stroke-width="2"/>`).join('')}<circle r="12" fill="#7CB863" ${K}/></g>`;
      if (st === 5) s += fr(0, 0, -h, (a, b) => `<g transform="translate(${a},${b})">${Array.from({ length: 14 }, (_, k) => `<ellipse cx="0" cy="-30" rx="9" ry="18" transform="rotate(${k * 25.7})" fill="#F6D24A" stroke="${INK}" stroke-width="2"/>`).join('')}<circle r="24" fill="#7A4E2C" ${K}/>${Array.from({ length: 12 }, (_, k) => `<circle cx="${(Math.cos(k * 2.4) * (k * 1.6)).toFixed(1)}" cy="${(Math.sin(k * 2.4) * (k * 1.6)).toFixed(1)}" r="2" fill="#4E3220"/>`).join('')}${shine(0, 0, 22)}</g>`);
      return s;
    }
    return '';
  }
  const plantHeight = (pl) => (!pl.p || pl.st < 2 ? 40 : pl.p === 'sunflower' ? [0, 0, 70, 130, 175, 185][pl.st] : pl.p === 'strawberry' ? 50 : pl.p === 'carrot' ? 70 : [0, 0, 70, 110, 130, 135][pl.st]);
  function planter(i) {
    const g = GD(), s = SG(), pl = g.plots[i], cx = 0;
    const task = s.task && s.task.plot === i ? s.task : null;
    const wet = isWet(pl), dry = pl.p && !wet && !task;
    const soil = task ? (task.step === 'water' && task.done ? 'url(#gdWet)' : 'url(#gdDry)') : wet ? 'url(#gdWet)' : 'url(#gdDry)';
    const dim = s.task && !task ? 'opacity=".45"' : '';
    let out = `<g class="gd-plot ${task ? 'focus' : ''}" transform="${plotT(i)}" ${dim} data-a="gdPlot" data-plot="${i}">
      <rect class="gd-hit" x="${cx - 104}" y="290" width="208" height="160" fill="transparent" data-plot="${i}" role="button" aria-label="Planter ${i + 1}${pl.p ? ', ' + PLANTS[pl.p].name : ', empty'}"/>
      <ellipse cx="${cx}" cy="446" rx="108" ry="14" fill="#3B2F2F" opacity=".14"/>
      <path d="M${cx - 96} 368L${cx - 82} 338V408L${cx - 96} 440Z" fill="url(#gdSide)" ${K}/>
      <path d="M${cx + 96} 368L${cx + 82} 338V408L${cx + 96} 440Z" fill="url(#gdSide)" ${K}/>
      <path d="M${cx - 82} 338H${cx + 82}L${cx + 96} 368H${cx - 96}Z" fill="#8A5A34" ${K}/>
      <path d="M${cx - 76} 342H${cx + 76}L${cx + 86} 364H${cx - 86}Z" fill="${soil}" pointer-events="none"/>
      ${!wet && pl.p ? `<path d="M${cx - 50} 352l10 4 6-5M${cx + 20} 358l8-4 8 5M${cx - 6} 346l4 6" fill="none" stroke="#8A6040" stroke-width="2" stroke-linecap="round" pointer-events="none"/>` : ''}
      ${wet ? `<ellipse cx="${cx - 30}" cy="350" rx="16" ry="3" fill="#fff" opacity=".22" pointer-events="none"/>` : ''}
      <rect x="${cx - 96}" y="368" width="192" height="72" fill="url(#gdWood)" ${K}/>
      <path d="M${cx - 96} 392H${cx + 96}M${cx - 96} 416H${cx + 96}" stroke="#7A4E2C" stroke-width="2.5"/>
      <path d="M${cx - 40} 368v24M${cx + 30} 392v24M${cx - 10} 416v24" stroke="#7A4E2C" stroke-width="2"/>
      <rect x="${cx - 92}" y="371" width="184" height="4" rx="2" fill="#fff" opacity=".22"/>`;
    // the planting job in progress: hole, seeds, soil pile
    if (task) {
      const st = task.step;
      if (st === 'seed' || (st === 'cover' && task.pats < 3) || (st === 'dig' && task.done)) out += `<ellipse cx="${cx}" cy="354" rx="26" ry="8" fill="#3A2416" ${K}/><path d="M${cx + 30} 356q16-22 34 0z" fill="#8A6040" ${K}/>`;
      if ((st === 'cover' && task.pats < 3) || (st === 'seed' && task.done)) out += `<g class="gd-seeds">${[-8, 0, 8].map((x) => `<ellipse cx="${cx + x}" cy="353" rx="3.5" ry="2.4" fill="#F6E1A6" stroke="${INK}" stroke-width="1.4"/>`).join('')}</g>`;
      if (st === 'cover' && task.pats > 0 && task.pats < 3) out += `<ellipse cx="${cx}" cy="353" rx="${10 + task.pats * 8}" ry="${4 + task.pats * 2}" fill="#6B4425"/>`;
      if ((st === 'cover' && task.pats >= 3) || st === 'water') out += `<ellipse cx="${cx}" cy="352" rx="34" ry="9" fill="#5A3A24" ${K}/>`;
    }
    if (pl.p && !task) {
      const droop = dry && pl.st >= 1 ? 'gd-droop' : '';
      out += `<g class="gd-plant ${droop}" transform="translate(${cx},${SOIL_Y})" data-a="gdTouch" data-plot="${i}">${plantArt(i, pl)}</g>`;
      if (pl.st === 0 || pl.st === 1) out += seedSign(pl.p).replace('translate(58,6)', `translate(${cx + 58},${SOIL_Y + 6})`);
      if (dry && pl.st < 5) out += `<g transform="translate(${cx + 46},${SOIL_Y - plantHeight(pl) - 40})" pointer-events="none"><g class="gd-thirsty"><path d="M0 -22C-12 -6-12 6 0 10 12 6 12-6 0-22z" fill="#8EC5F0" ${K}/>${shine(0, 0, 10)}</g></g>`;
      if (pl.st === 5) out += `<g transform="translate(${cx - 64},${SOIL_Y - plantHeight(pl) - 20})" pointer-events="none"><g class="gd-ready"><path d="M0 -14l4 9 10 1-8 7 3 10-9-6-9 6 3-10-8-7 10-1z" fill="#F6D24A" ${K}/></g></g>`;
      for (let k = 0; k < pl.weeds; k++) {
        const x = cx + (k ? 56 : -58);
        out += `<g class="gd-weed" data-a="gdWeed" data-plot="${i}" role="button" aria-label="Weed"><rect x="${x - 22}" y="${SOIL_Y - 40}" width="44" height="48" fill="transparent"/><path d="M${x} ${SOIL_Y + 4}l-12-26M${x} ${SOIL_Y + 4}l0-32M${x} ${SOIL_Y + 4}l12-24" stroke="#6E8F2E" stroke-width="5" stroke-linecap="round"/><path d="M${x - 12} ${SOIL_Y - 22}l-6-8 9 2zM${x} ${SOIL_Y - 28}l-4-9 7 4zM${x + 12} ${SOIL_Y - 20}l7-7-2 9z" fill="#8DB04A" stroke="${INK}" stroke-width="1.6"/></g>`;
      }
      if (pl.snail) {
        const y = SOIL_Y - Math.min(plantHeight(pl) * 0.55, 70);
        out += `<g class="gd-snail" data-a="gdSnail" data-plot="${i}" transform="translate(${cx + 18},${y})" role="button" aria-label="Snail"><rect x="-26" y="-30" width="56" height="44" fill="transparent"/><path d="M-22 8h40q6 0 6-6" fill="#C9C38A" ${K}/><circle cx="-2" cy="-6" r="15" fill="#C99568" ${K}/><path d="M-2 -6m-8 0a8 8 0 1 0 8-8" fill="none" stroke="#7A4E2C" stroke-width="2.5"/><path d="M22 2l4-12M18 2l-2-12" stroke="${INK}" stroke-width="2"/><circle cx="26" cy="-12" r="2.5" fill="${INK}"/><circle cx="16" cy="-12" r="2.5" fill="${INK}"/></g>`;
      }
    }
    // little animations: digging, watering, a pat
    const an = s.anim && s.anim.plot === i ? s.anim : null;
    if (an && an.kind === 'water') out += `<g transform="translate(${cx + 34},${SOIL_Y - 150})" pointer-events="none"><g class="gd-pour">${CAN}${[0, 1, 2, 3, 4, 5].map((k) => `<circle class="gd-drop" style="animation-delay:${k * 0.12}s" cx="${-62 + (k % 3) * 9}" cy="${30}" r="4" fill="#8EC5F0"/>`).join('')}</g></g>`;
    if (an && an.kind === 'dig') out += `<g transform="translate(${cx + 10},${SOIL_Y - 90})" pointer-events="none"><g class="gd-digging">${SPADE}</g></g>`;
    if (an && an.kind === 'seed') out += `<g class="gd-drop-seeds" transform="translate(${cx},${SOIL_Y - 60})" pointer-events="none">${[-8, 0, 8].map((x, k) => `<ellipse class="gd-fall" style="animation-delay:${k * 0.1}s" cx="${x}" cy="0" rx="3.5" ry="2.4" fill="#F6E1A6" stroke="${INK}" stroke-width="1.4"/>`).join('')}</g>`;
    if (an && an.kind === 'pat') out += `<g transform="translate(${cx},${SOIL_Y - 30})" pointer-events="none"><g class="gd-pat"><path d="M-18 10c0-14 6-24 18-24s18 10 18 24c0 6-6 10-18 10s-18-4-18-10z" fill="#F6C9A0" ${K}/><path d="M-8 -12v12M0 -14v14M8 -12v12" stroke="${INK}" stroke-width="2"/></g></g>`;
    if (an && an.kind === 'grow') out += `<g transform="translate(${cx},${SOIL_Y - plantHeight(pl) - 10})" pointer-events="none">${[0, 1, 2, 3, 4].map((k) => `<g transform="rotate(${k * 72}) translate(0,-34)"><path class="gd-spark" style="animation-delay:${k * 0.08}s" d="M0 -8l2.4 5.6 5.6 2.4-5.6 2.4L0 8l-2.4-5.6L-8 0l5.6-2.4z" fill="#F6D24A"/></g>`).join('')}</g>`;
    if (an && an.kind === 'sniff') out += `<g transform="translate(${cx + 40},${SOIL_Y - plantHeight(pl) - 20})" pointer-events="none">${[0, 1, 2].map((k) => `<path class="gd-smell" style="animation-delay:${k * 0.25}s" d="M${k * 10} 0q-8-10 0-20t0-20" fill="none" stroke="#9C7FD9" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>`;
    return out + '</g>';
  }
  const CAN = `<g transform="rotate(-28)"><path d="M-30 -10h44v40q0 8-8 8h-28q-8 0-8-8z" fill="#5E9BE0" ${K}/><path d="M-30 0l-34 -20" stroke="#5E9BE0" stroke-width="9" stroke-linecap="round"/><path d="M-30 0l-34 -20" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".4"/><ellipse cx="-66" cy="-21" rx="8" ry="5" fill="#8EB8E5" ${K}/><path d="M-22 -10q16-22 30 0" fill="none" stroke="${INK}" stroke-width="5"/><rect x="-24" y="4" width="32" height="6" rx="3" fill="#fff" opacity=".35"/></g>`;
  const SPADE = `<g><rect x="-4" y="-60" width="8" height="54" rx="3" fill="#C99568" ${K}/><rect x="-12" y="-68" width="24" height="10" rx="5" fill="#C99568" ${K}/><path d="M-16 -6h32v20q0 20-16 28-16-8-16-28z" fill="#B7C3CE" ${K}/><path d="M-8 0v18" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/></g>`;
  const SEEDBAG = `<g><path d="M-22 -30h44v58H-22z" fill="#F6E1A6" ${K}/><path d="M-22 -30l6-8h32l6 8" fill="#E8C48F" ${K}/><circle cx="0" cy="-2" r="12" fill="#7CC46A" ${K}/><path d="M0 -2v-8m0 8q-6-4-8-10m8 10q6-4 8-10" stroke="${INK}" stroke-width="2" fill="none"/></g>`;

  function sceneSvg() {
    const g = GD(), s = SG(), t = (now() / 1000).toFixed(1);
    const lumiSvg = L.svg({ look: A.lookWith(), mood: s.mood || 'happy', size: 150 });
    const bee = s.bee != null && g.plots[s.bee] && g.plots[s.bee].st === 4 ? `<g class="gd-bee" data-a="gdBee" data-plot="${s.bee}" transform="${plotT(s.bee)} translate(0,${SOIL_Y - plantHeight(g.plots[s.bee]) - 30})" role="button" aria-label="Bee"><g class="gd-bee-fly"><circle r="26" fill="transparent"/><ellipse cx="-6" cy="-12" rx="9" ry="12" fill="#fff" opacity=".85" ${K}/><ellipse cx="6" cy="-12" rx="9" ry="12" fill="#fff" opacity=".85" ${K}/><ellipse cx="0" cy="0" rx="16" ry="11" fill="#F6D24A" ${K}/><path d="M-5 -10v20M5 -10v20" stroke="${INK}" stroke-width="4"/><circle cx="12" cy="-2" r="2" fill="${INK}"/></g></g>` : '';
    const anyFlower = g.plots.some((p) => p.p && p.st >= 3);

    const fit = S.gdFit || 'xMidYMax meet';
    return `<svg class="gd-svg" viewBox="0 0 1000 770" preserveAspectRatio="${fit}" role="img" aria-label="Lumi's garden">${DEFS}
      <rect x="-600" y="-600" width="2200" height="1370" fill="url(#gdSky)"/>
      <g transform="translate(120,150)"><g class="gd-sunrays" style="animation-delay:-${t}s">${Array.from({ length: 12 }, (_, k) => `<path d="M0 -58v-16" stroke="#F6C744" stroke-width="6" stroke-linecap="round" transform="rotate(${k * 30})"/>`).join('')}</g></g>
      <g transform="translate(120,150)"><circle r="44" fill="url(#gdSun)" ${K}/><circle cx="-14" cy="-6" r="4" fill="${INK}"/><circle cx="14" cy="-6" r="4" fill="${INK}"/><path d="M-12 10q12 10 24 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="-24" cy="6" r="6" fill="#F2A7BE" opacity=".7"/><circle cx="24" cy="6" r="6" fill="#F2A7BE" opacity=".7"/></g>
      <g class="gd-cloud" style="animation-delay:-${t}s"><path d="M400 152a26 26 0 0 1 26-30 32 32 0 0 1 58-6 24 24 0 0 1 32 22 18 18 0 0 1-4 36H414a18 18 0 0 1-14-22z" fill="#fff" ${K}/></g>
      <g class="gd-cloud slow" style="animation-delay:-${t}s"><path d="M720 110a20 20 0 0 1 20-24 26 26 0 0 1 46-4 20 20 0 0 1 26 18 14 14 0 0 1-4 28H732a14 14 0 0 1-12-18z" fill="#fff" ${K}/></g>
      <path d="M-600 300Q-200 230 200 280T700 262T1600 290V770H-600Z" fill="#B9DDA2"/>
      <g>${Array.from({ length: 44 }, (_, k) => `<path d="M${k * 50 - 604} 344V268l18-16 18 16V344Z" fill="#FFFDF8" ${K}/>`).join('')}<rect x="-610" y="286" width="2220" height="12" fill="#F1E6D6" ${K}/><rect x="-610" y="322" width="2220" height="12" fill="#F1E6D6" ${K}/></g>
      ${[[60, 330, '#F28DB2'], [170, 336, '#F6D24A'], [880, 334, '#9C7FD9'], [960, 330, '#F28DB2']].map(([x, y, c]) => `<path d="M${x} ${y + 22}v-20" stroke="#5E9E45" stroke-width="3"/><circle cx="${x}" cy="${y}" r="7" fill="${c}" ${K}/>`).join('')}
      <path d="M-600 352Q0 334 500 350T1600 346V770H-600Z" fill="url(#gdGrass)"/>
      <path d="M-40 770C140 640 250 560 300 470L330 470C320 580 260 680 210 770Z" fill="#E9D6B4" opacity=".75"/>
      ${Array.from({ length: 30 }, (_, k) => `<path d="M${-60 + k * 40} ${770 - (k % 4) * 9}l4-16 4 16" stroke="#5E9E45" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`).join('')}
      ${[0, 1].map(planter).join('')}
      ${anyFlower ? `<g class="gd-butterfly" style="animation-delay:-${t}s" pointer-events="none"><g transform="translate(590,330)"><ellipse cx="-8" cy="0" rx="10" ry="14" fill="#F28DB2" ${K}/><ellipse cx="8" cy="0" rx="10" ry="14" fill="#9C7FD9" ${K}/><rect x="-2" y="-10" width="4" height="20" rx="2" fill="${INK}"/></g></g>` : ''}
      <g transform="translate(262,724)"><rect x="-26" y="-50" width="52" height="60" rx="8" fill="#5FA05A" ${K}/><rect x="-30" y="-58" width="60" height="12" rx="6" fill="#4E8A48" ${K}/><path d="M-10 -28l6 8 12-14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="0" y="2" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="Nunito, sans-serif">${g.weedsOut || 0}</text></g>
      ${g.snailsMoved ? `<g transform="translate(320,752) scale(.7)"><path d="M-22 8h40q6 0 6-6" fill="#C9C38A" ${K}/><circle cx="-2" cy="-6" r="15" fill="#C99568" ${K}/><path d="M22 2l4-12M18 2l-2-12" stroke="${INK}" stroke-width="2"/></g>` : ''}
      <g transform="translate(6,520) scale(1.4)">${lumiSvg}</g>
      ${[2, 3].map(planter).join('')}
      ${bee}
    </svg>`;
  }

  // ---------------------------------------------------------------- the screen
  const TOOLS = [['spade', 'Spade', SPADE, '-46 -74 92 106'], ['seeds', 'Seeds', SEEDBAG, '-38 -44 76 76'], ['can', 'Watering can', CAN, '-84 -52 116 96']];
  const toolSvg = (art, vb) => `<svg viewBox="${vb}" width="72" height="72" aria-hidden="true">${art}</svg>`;
  const fruitIcon = (p) => `<svg viewBox="-60 -70 120 120" width="40" height="40" aria-hidden="true">${{
    tomato: `<circle cx="0" cy="0" r="40" fill="url(#gdRed)" ${K}/><path d="M-18 -36l18 9 18-9-9 14h-18z" fill="#5E9E45" ${K}/>`,
    strawberry: `<path d="M0 44C-40 12-32-24 0-20 32-24 40 12 0 44Z" fill="url(#gdRed)" ${K}/><path d="M-20 -22l20 6 20-6-6-12-14 6-14-6z" fill="#5E9E45" ${K}/>`,
    carrot: `<path d="M-20 -30Q0 -40 20 -30L4 44Q0 50-4 44Z" fill="url(#gdOrange)" ${K}/><path d="M-8 -36l-8-20M0 -38v-24M8 -36l8-20" stroke="#5E9E45" stroke-width="7" stroke-linecap="round"/>`,
    sunflower: `${Array.from({ length: 10 }, (_, k) => `<ellipse cx="0" cy="-30" rx="10" ry="18" transform="rotate(${k * 36})" fill="#F6D24A" stroke="${INK}" stroke-width="3"/>`).join('')}<circle r="22" fill="#7A4E2C" ${K}/>`
  }[p]}</svg>`;
  function stepsBar() {
    const t = SG().task;
    if (!t) return '';
    const idx = STEPS.findIndex(([id]) => id === t.step);
    return `<div class="gd-steps" aria-label="Planting steps">${STEPS.map(([id, name], k) => `<span class="gd-step ${k < idx ? 'done' : k === idx ? 'now' : ''}"><b>${k < idx ? ic('check', 22) : k + 1}</b><svg viewBox="-80 -80 160 160" width="44" height="44" aria-hidden="true">${{ dig: SPADE, seed: SEEDBAG, cover: '<path d="M-36 20c0-28 12-48 36-48s36 20 36 48c0 12-12 20-36 20s-36-8-36-20z" fill="#F6C9A0" stroke="#3B2F2F" stroke-width="5"/>', water: CAN }[id]}</svg><span>${name}</span></span>`).join('')}</div>`;
  }
  function picker() {
    return `<div class="gd-picker" role="dialog" aria-label="Pick a seed"><b class="gd-picker-title">What shall we plant?</b><div class="gd-packets">${ORDER.map((p) => `<button class="gd-packet" data-a="gdChoose" data-v="${p}" style="--c:${PLANTS[p].color}"><span class="gd-packet-top"></span><span class="gd-packet-pic">${fruitIcon(p)}</span><b>${PLANTS[p].name}</b></button>`).join('')}</div><button class="ar-btn gd-close" data-a="gdPickerClose" aria-label="Not now">${ic('x', 30)}</button></div>`;
  }
  A.PARENT.garden = 'fun';
  A.VOICE.garden = () => SG().msg || "Welcome to Lumi's garden!";
  A.SCREENS.garden = () => {
    const s = SG(), g = GD();
    const basket = ORDER.map((p) => `<span class="gd-b ${g.basket[p] ? '' : 'none'}">${fruitIcon(p)}<b>${g.basket[p] || 0}</b></span>`).join('');
    return `
<section class="screen gd-screen" aria-label="Lumi's garden">
  ${A.srTitle("Lumi's garden")}
  <div class="row" style="height:60px;gap:12px;flex:none">
    ${A.backBtn()}${A.speakBtn(A.VOICE.garden())}
    <div class="gd-msg grow">${s.task ? stepsBar() : `<span>${esc(s.msg || "Welcome to Lumi's garden!")}</span>`}</div>
    ${A.starChip(true)}
  </div>
  <div class="row grow gd-body">
    <div class="panel gd-scene grow" id="gdScene">${sceneSvg()}${s.picker != null ? picker() : ''}</div>
    <div class="gd-side">
      ${TOOLS.map(([id, name, art, vb]) => `<button class="gd-tool ${s.tool === id ? 'on' : ''}" data-tool="${id}" aria-pressed="${s.tool === id}" aria-label="${name}">${toolSvg(art, vb)}<b>${name}</b></button>`).join('')}
      <div class="gd-basket" aria-label="Basket"><span class="gd-basket-art">${ic('shop', 30)}<b>Basket</b></span><div class="gd-bs">${basket}</div></div>
    </div>
  </div>
</section>`;
  };
  A.GUIDE.garden = () => {
    const s = SG(), g = GD(), d = state.settings.guideDelay * 1000 + 3500;
    if (s.picker != null) return { sel: '.gd-packet', say: 'Pick a seed.', delay: d };
    if (s.task) {
      const t = s.task;
      const tool = { dig: 'spade', seed: 'seeds', water: 'can' }[t.step];
      if (tool && s.tool !== tool) return { sel: `[data-tool="${tool}"]`, say: { spade: 'Tap the spade.', seeds: 'Tap the seeds.', can: 'Tap the watering can.' }[tool], delay: d };
      return { sel: `.gd-hit[data-plot="${t.plot}"]`, say: t.step === 'cover' ? 'Pat the soil.' : 'Now tap the soil.', delay: d };
    }
    const i = g.plots.findIndex((p) => p.weeds); if (i >= 0) return { sel: `.gd-weed[data-plot="${i}"]`, say: 'Pull the weed.', delay: d };
    const sn = g.plots.findIndex((p) => p.snail); if (sn >= 0) return { sel: `.gd-snail[data-plot="${sn}"]`, say: 'Move the snail.', delay: d };
    const r = g.plots.findIndex((p) => p.st === 5 && p.p); if (r >= 0) return { sel: `.gd-fruit[data-plot="${r}"]`, say: 'Pick it!', delay: d };
    const dry = g.plots.findIndex((p) => p.p && !isWet(p)); if (dry >= 0) return s.tool === 'can' ? { sel: `.gd-hit[data-plot="${dry}"]`, say: 'Water this one.', delay: d } : { sel: '[data-tool="can"]', say: 'Tap the watering can.', delay: d };
    const e = g.plots.findIndex((p) => !p.p); if (e >= 0) return { sel: `.gd-hit[data-plot="${e}"]`, say: 'Tap a planter to plant a seed.', delay: d };
    return null;
  };

  // ---------------------------------------------------------------- the garden clock
  function refresh() { if (SG().drag) return; render(); }
  let saveTick = 0;
  function tick() {
    if (S.screen !== 'garden') return;
    const g = GD(), s = SG();
    let changed = false;
    g.plots.forEach((pl, i) => {
      if (!pl.p || pl.st >= 5 || (s.task && s.task.plot === i)) return;
      if (isWet(pl) && !pl.snail) {
        pl.g += (100 / GROW_S) * (pl.weeds ? 0.5 : 1);
        if (pl.g >= 100) { pl.g = 0; pl.st += 1; changed = true; grew(i); }
      }
      if (pl.st >= 1 && pl.weeds < 2 && Math.random() < 1 / 40) { pl.weeds += 1; changed = true; if (!s.task) tell('A weed is growing! Tap it to pull it out.'); }
      if (pl.st >= 2 && !pl.snail && !g.plots.some((x) => x.snail) && Math.random() < 1 / 90) { pl.snail = true; changed = true; if (!s.task) tell('A snail is on the leaves! Tap it to move it gently to the grass.'); }
      if (pl.st === 4 && s.bee == null && Math.random() < 1 / 8) { s.bee = i; changed = true; if (!s.task) tell('A bee! Tap the bee. Bees help flowers turn into fruit.', 'excited'); }
      if (pl.p && pl.wet && !isWet(pl) && !pl.toldDry) { pl.toldDry = true; changed = true; if (!s.task) tell(`The ${PLANTS[pl.p].name.toLowerCase()} is thirsty. The soil is dry.`); }
    });
    if (s.anim && s.anim.until < now()) { s.anim = null; changed = true; }
    g.seen = now();
    if (++saveTick % 10 === 0) save();
    if (changed) refresh();
  }
  function grew(i) {
    const pl = GD().plots[i], P = PLANTS[pl.p];
    SG().anim = { plot: i, kind: 'grow', until: now() + 1200 };
    blip(660, 0.3); later(() => blip(880, 0.3), 120);
    const lines = { 2: `The ${P.name.toLowerCase()} is growing bigger!`, 3: `Look how tall the ${P.name.toLowerCase()} is!`, 4: pl.p === 'carrot' ? 'The carrot is growing under the soil!' : `Flowers! The ${P.name.toLowerCase()} has flowers.`, 5: P.ripe };
    tell(lines[pl.st] || 'It grew!', 'excited');
  }
  A.ENTER.garden = () => {
    const g = GD(), s = SG();
    const away = now() - (g.seen || now());
    if (away > AWAY_MS && g.plots.some((p) => p.p && p.st < 5)) {
      g.plots.forEach((p) => { if (p.p && p.st >= 1 && p.st < 5) { p.st += 1; p.g = 0; } p.wet = 0; p.toldDry = false; });
      s.msg = 'Your plants grew while you were away! Now they are thirsty.';
    } else if (!s.msg) s.msg = g.plots.some((p) => p.p) ? "Let's look after the garden." : "Welcome to Lumi's garden! Tap a planter to plant a seed.";
    g.seen = now(); save();
    every(tick, 1000);
  };

  // ---------------------------------------------------------------- doing things
  function useTool(tool, i) {
    const g = GD(), s = SG(), pl = g.plots[i], t = s.task;
    if (t) {
      if (t.plot !== i) { tell('Let\'s finish this planter first.'); refresh(); return; }
      const need = { dig: 'spade', seed: 'seeds', water: 'can' }[t.step];
      if (t.step === 'cover') { pat(i); return; }
      if (tool !== need) { tell({ spade: 'First dig a hole with the spade.', seeds: 'Now put the seeds in the hole.', can: 'Now give it some water.' }[need]); refresh(); return; }
      if (t.step === 'dig') { s.anim = { plot: i, kind: 'dig', until: now() + 1300 }; t.done = true; blip(300, 0.2); later(() => blip(260, 0.2), 300); later(() => blip(320, 0.2), 600); tell('Dig, dig, dig! A hole for the seeds.', 'excited'); refresh(); later(() => nextStep('seed'), 1500); return; }
      if (t.step === 'seed') { s.anim = { plot: i, kind: 'seed', until: now() + 1000 }; t.done = true; blip(900, 0.15); later(() => blip(1000, 0.15), 120); tell('The seeds are in the hole.'); refresh(); later(() => nextStep('cover'), 1300); return; }
      if (t.step === 'water') {
        s.anim = { plot: i, kind: 'water', until: now() + 1600 }; t.done = true; pour();
        tell('Glug, glug! The seeds have a drink.'); refresh();
        later(() => {
          pl.p = t.plant; pl.st = 0; pl.g = 0; pl.wet = now() + WET_MS; pl.toldDry = false; pl.picked = 0; pl.pulls = 0; pl.weeds = 0; pl.snail = false;
          s.task = null; s.tool = null; g.planted = (g.planted || 0) + 1; save();
          tell(`You planted a ${PLANTS[pl.p].name.toLowerCase()}! Now we wait for it to grow.`, 'excited'); refresh();
          later(() => { if (pl.st === 0) { pl.st = 1; grew(i); tell('Look! A tiny sprout!', 'excited'); limitedAward(1); save(); refresh(); } }, 2500);
        }, 1700);
        return;
      }
      return;
    }
    if (tool === 'can') {
      if (!pl.p) { tell('There is nothing growing here yet. Tap the planter to plant a seed.'); refresh(); return; }
      s.anim = { plot: i, kind: 'water', until: now() + 1600 }; pour();
      pl.wet = now() + WET_MS; pl.toldDry = false; save();
      tell(pl.st >= 5 ? 'It has water. Now pick it!' : `Glug, glug! The ${PLANTS[pl.p].name.toLowerCase()} is drinking. Now it can grow.`, 'excited'); refresh();
      return;
    }
    if (tool === 'seeds' || tool === 'spade') {
      if (!pl.p) { s.picker = i; tell('What shall we plant?'); refresh(); return; }
      tell('Something is already growing here.'); refresh();
    }
  }
  function pour() { [0, 1, 2, 3, 4].forEach((k) => later(() => blip(1200 + Math.random() * 500, 0.08), k * 180)); }
  function nextStep(step) {
    const t = SG().task; if (!t) return;
    t.step = step; t.done = false; t.pats = 0;
    SG().tool = null;
    tell({ seed: 'Now put the seeds in. Tap the seeds, then the hole.', cover: 'Pat the soil to cover the seeds. Pat, pat, pat!', water: 'Now give them a drink. Tap the watering can, then the soil.' }[step]);
    refresh();
  }
  function pat(i) {
    const t = SG().task;
    t.pats = (t.pats || 0) + 1; SG().anim = { plot: i, kind: 'pat', until: now() + 350 };
    blip(220 + t.pats * 40, 0.15);
    if (t.pats >= 3) { tell('All covered. Snug as a bug!', 'excited'); refresh(); later(() => nextStep('water'), 1200); }
    else { tell(['Pat!', 'Pat, pat!'][t.pats - 1]); refresh(); }
  }

  Object.assign(A.ACTIONS, {
    gdPlot: (d) => {
      const i = Number(d.plot), s = SG(), g = GD(), pl = g.plots[i];
      if (s.task) { if (s.task.step === 'cover' && s.task.plot === i) { pat(i); return 'keep'; } if (s.tool) { useTool(s.tool, i); return 'keep'; } }
      if (s.tool) { useTool(s.tool, i); return 'keep'; }
      if (!pl.p && !s.task) { s.picker = i; tell('What shall we plant?'); refresh(); return 'keep'; }
      if (s.task) { const need = { dig: 'spade', seed: 'seeds', water: 'can' }[s.task.step]; tell({ spade: 'Tap the spade first.', seeds: 'Tap the seeds first.', can: 'Tap the watering can first.' }[need]); refresh(); return; }
      if (pl.p && !isWet(pl)) { tell('The soil is dry. Tap the watering can, then the planter.'); refresh(); return; }
      touch(i);
      return 'keep';
    },
    gdTouch: (d) => { const s = SG(); if (s.tool) { useTool(s.tool, Number(d.plot)); return 'keep'; } touch(Number(d.plot)); return 'keep'; },
    gdChoose: (d) => { const s = SG(); const i = s.picker; s.picker = null; s.task = { plot: i, plant: d.v, step: 'dig', done: false, pats: 0 }; s.tool = null; tell(`A ${PLANTS[d.v].name.toLowerCase()}! First dig a hole. Tap the spade, then the soil.`, 'excited'); refresh(); },
    gdPickerClose: () => { SG().picker = null; tell('Maybe later.'); refresh(); },
    gdWeed: (d) => { const g = GD(), pl = g.plots[Number(d.plot)]; if (pl.weeds) pl.weeds -= 1; g.weedsOut = (g.weedsOut || 0) + 1; save(); blip(500, 0.12); later(() => blip(380, 0.15), 90); tell('Pop! The weed is in the green bin.', 'excited'); refresh(); return 'keep'; },
    gdSnail: (d) => { const g = GD(); g.plots[Number(d.plot)].snail = false; g.snailsMoved = (g.snailsMoved || 0) + 1; save(); blip(520, 0.3); tell('Gently does it. The snail is happy in the grass now.', 'happy'); refresh(); return 'keep'; },
    gdBee: (d) => { const s = SG(), pl = GD().plots[Number(d.plot)]; s.bee = null; pl.g = Math.min(99, pl.g + 45); blip(330, 0.4); tell('Buzz! The bee helps the flowers turn into fruit.', 'excited'); refresh(); return 'keep'; },
    gdPick: (d) => {
      const g = GD(), i = Number(d.plot), pl = g.plots[i], P = PLANTS[pl.p], k = Number(d.k);
      if (pl.p === 'carrot') {
        pl.pulls = (pl.pulls || 0) + 1; blip(300 + pl.pulls * 80, 0.2);
        if (pl.pulls < 3) { tell(['Pull!', 'Pull harder!'][pl.pulls - 1], 'excited'); refresh(); return 'keep'; }
      }
      pl.picked |= 1 << k;
      const got = pl.p === 'sunflower' ? 6 : 1;
      g.basket[pl.p] = (g.basket[pl.p] || 0) + got;
      blip(784, 0.2); later(() => blip(1046, 0.25), 110);
      const left = P.fruits - [0, 1, 2, 3].filter((b) => pl.picked & (1 << b)).length;
      if (left > 0) { tell(`${P.fruits - left} in the basket!`, 'excited'); save(); refresh(); return 'keep'; }
      const p = pl.p;
      Object.assign(pl, { p: null, st: 0, g: 0, wet: 0, weeds: 0, snail: false, picked: 0, pulls: 0 });
      save(); limitedAward(2);
      tell(`${p === 'sunflower' ? 'Six sunflower seeds' : p === 'carrot' ? 'A big carrot' : `${P.fruits} ${P.many}`} in the basket! ${P.fact} The planter is ready for a new seed.`, 'excited');
      refresh(); return 'keep';
    }
  });
  function touch(i) {
    const pl = GD().plots[i];
    if (!pl.p) return;
    if (pl.st < 1) { tell('The seeds are sleeping under the soil. Water helps them wake up.'); refresh(); return; }
    SG().anim = { plot: i, kind: 'sniff', until: now() + 1500 };
    blip(600, 0.3);
    tell(pl.st === 5 ? PLANTS[pl.p].ripe : PLANTS[pl.p].feel, 'happy'); refresh();
  }

  // tools: tap one and then a planter, or drag it onto a planter
  function fitGarden() {
    const box = document.getElementById('gdScene'), svg = box && box.querySelector('.gd-svg');
    if (!svg) return;
    const fit = box.clientWidth / Math.max(1, box.clientHeight) >= 1000 / 770 ? 'xMidYMax slice' : 'xMidYMax meet';
    S.gdFit = fit; svg.setAttribute('preserveAspectRatio', fit);
  }
  window.addEventListener('resize', () => { if (S.screen === 'garden') fitGarden(); });
  A.AFTER.garden = () => {
    fitGarden();
    const side = document.querySelector('.gd-side');
    if (!side || side.dataset.wired) return;
    side.dataset.wired = '1';
    side.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.gd-tool'); if (!btn) return;
      e.preventDefault();
      const id = btn.dataset.tool, start = [e.clientX, e.clientY];
      let ghost = null;
      const move = (ev) => {
        if (!ghost && Math.hypot(ev.clientX - start[0], ev.clientY - start[1]) > 12) {
          ghost = document.createElement('div'); ghost.className = 'gd-ghost'; ghost.innerHTML = btn.querySelector('svg').outerHTML; document.body.appendChild(ghost); SG().drag = true;
        }
        if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
      };
      const up = (ev) => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        const s = SG();
        if (!ghost) { s.tool = s.tool === id ? null : id; side.querySelectorAll('.gd-tool').forEach((b) => { const on = b.dataset.tool === s.tool; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); blip(560, 0.12);
          if (s.tool) { tell({ spade: 'Now tap the soil.', seeds: s.task ? 'Now tap the hole.' : 'Now tap an empty planter.', can: 'Now tap a planter to water it.' }[s.tool]); const m = document.querySelector('.gd-msg span'); if (m) m.textContent = s.msg; A.applyGuide(); }
          return; }
        ghost.remove(); s.drag = false;
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const hit = el && el.closest && el.closest('[data-plot]');
        if (hit) useTool(id, Number(hit.dataset.plot)); else render();
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
    // keyboard and switch users: Enter on a tool picks it up
    side.addEventListener('keydown', (e) => { const btn = e.target.closest('.gd-tool'); if (btn && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const s = SG(); s.tool = s.tool === btn.dataset.tool ? null : btn.dataset.tool; render(); } });
  };
  A.gardenPlants = PLANTS; // for tests
})();
