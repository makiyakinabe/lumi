/*
  learn-bedroom.js
  Learn with Lumi: two everyday lessons played as real scenes at home (engine: stories.js, SX.lesson;
  same pattern as learn-teeth.js).

  Get dressed ('dress', all ages). A bedroom in the morning: open the curtains, look at the weather and pick
  clothes for a hot sunny day (every choice is fine, Lumi explains), pyjamas into the laundry basket,
  underpants from the drawer (Medium+), T-shirt, shorts or long pants (each one appears on Lumi as it goes on).
  Then at the front door: a sock on each foot one at a time (try a shoe first and Lumi says "socks first"),
  shoes, press the sticky straps down (Challenge), and a check in the mirror by the door.

  Pack my school bag ('pack', primary and teen). Lumi's desk the evening before school: read tomorrow on the
  picture timetable, drag the Maths and English books into the open bag (another book comes back: "not
  today"), pencil case, fill the water bottle (Medium+), bottle into the side pocket, snack box (Medium+),
  homework folder (Challenge), drag the zip along to close the bag, and put the bag by the front door.

  Clothes are drawn in Lumi's own 240 x 240 drawing grid and added inside his .sx-lumi box after each draw
  (wearOn), so they walk and scale with him. Shared pieces for other lessons: SX.HOME.laundryBasket(pj),
  SX.HOME.schoolBag({ inside, bottle, zip }), SX.HOME.frontDoor(evening).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { tone, esc, ic } = A;
  const W = SX.W;
  const H = SX.H;
  const HOME = (SX.HOME = SX.HOME || {});
  const svg = (vb, inner, o) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" aria-hidden="true"${o ? ' ' + o : ''}>${inner}</svg>`;
  const nest = (x, y, w, h, vb, inner) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}" overflow="visible">${inner}</svg>`;
  const T = (x, y, t, size, fill) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${size}" fill="${fill}">${esc(t)}</text>`;
  const level = () => (A.level ? A.level() : 2);
  const STAR = (x, y, r, fill) => `<path d="M${x} ${y - r}l${r * 0.29} ${r * 0.6} ${r * 0.66} ${r * 0.1}-${r * 0.48} ${r * 0.46} ${r * 0.12} ${r * 0.66}-${r * 0.59}-${r * 0.31}-${r * 0.59} ${r * 0.31} ${r * 0.12}-${r * 0.66}-${r * 0.48}-${r * 0.46} ${r * 0.66}-${r * 0.1}z" fill="${fill}"/>`;
  let uid = 0;

  // ================================================================ Lumi's box (his drawing is a 268 grid, feet at 244)
  const KY = 244 / 268;
  const lumiBox = (sp) => ({ x: sp.x - sp.h / 2, y: sp.y - sp.h * KY, w: sp.h, h: sp.h });
  const onLumi = (sp, lx, ly) => { const k = sp.h / 268; return { x: sp.x - sp.h / 2 + (lx + 14) * k, y: sp.y - sp.h * KY + (ly + 14) * k, k }; };
  // a drop target over Lumi's body, with a soft dashed ring so the child can see where things go
  const lumiZone = (sp, id) => {
    const a = onLumi(sp, 30, 56);
    const b = onLumi(sp, 210, 234);
    return SX.at(a.x, a.y, b.x - a.x, b.y - a.y, '<span class="lr-zone"></span>', { target: true, id, z: 7, label: 'Lumi', cls: 'no-outline' });
  };
  // Lumi wears none of his dress-up things while he gets dressed
  const BARE = { head: 'none', body: 'none', back: 'none', feet: 'none' };

  // ================================================================ clothes on Lumi (Lumi's grid)
  const CL = {
    tee: '#5B8FD9', teeDk: '#3D6DB5', shorts: '#3E5463', shortsDk: '#2A3B48', pants: '#A07850', pantsDk: '#7A5636',
    under: '#FFFFFF', band: '#4FB3A9', pj: '#AFD5F3', pjDk: '#86B7E2', sock: '#FFFFFF', stripe: '#E5534B',
    shoe: '#2F9E95', shoeDk: '#21766E', sole: '#F4F6F8'
  };
  const P = (d) => `<path d="${d}"/>`;
  const SHIRT = P('M-12 150 Q120 184 252 150 L252 184 Q120 208 -12 184 Z');
  const NECK = 'M-12 150 Q120 184 252 150';
  const SLEEVES = P('M38 152 L11 165 Q2 180 13 193 L48 182 Z M202 152 L229 165 Q238 180 227 193 L192 182 Z');
  // shorts and long pants: below the T-shirt, the legs come down over the top of the feet
  const SHORTS = P('M46 186 Q120 208 194 186 Q201 200 193 213 Q156 217 124 213 L120 205 L116 213 Q84 217 47 213 Q39 200 46 186 Z');
  const PANTS = P('M46 186 Q120 208 194 186 Q203 206 193 223 Q156 227 124 223 L120 206 L116 223 Q84 227 47 223 Q37 206 46 186 Z');
  const BRIEFS = P('M54 192 Q120 214 186 192 Q189 205 178 212 Q148 214 130 222 L110 222 Q92 214 62 212 Q51 205 54 192 Z');
  const FEET = { L: 88, R: 152 };
  const wearDefs = (id) => `<defs><clipPath id="${id}c"><ellipse cx="120" cy="136" rx="92" ry="86"/></clipPath>
    <mask id="${id}m" maskUnits="userSpaceOnUse" x="-20" y="-20" width="280" height="290"><rect x="-20" y="-20" width="280" height="290" fill="#fff"/><ellipse cx="88" cy="218" rx="23" ry="13" fill="#000"/><ellipse cx="152" cy="218" rx="23" ry="13" fill="#000"/></mask></defs>`;
  // a T-shirt follows Lumi's round shape; underpants leave his feet in front
  const onBody = (id, inner) => `<g clip-path="url(#${id}c)">${inner}</g>`;
  const feetFront = (id, inner) => `<g mask="url(#${id}m)">${inner}</g>`;
  const shirtArt = (id) => `${vol(SLEEVES, CL.tee)}${onBody(id, `${vol(SHIRT, CL.tee, { shade: 'v' })}<path d="${NECK}" fill="none" stroke="${CL.teeDk}" stroke-width="7"/>${STAR(120, 184, 8, '#fff')}`)}`;
  const bottomArt = (id, kind) => {
    const c = kind === 'pants' ? CL.pants : CL.shorts;
    const dk = kind === 'pants' ? CL.pantsDk : CL.shortsDk;
    return `${vol(kind === 'pants' ? PANTS : SHORTS, c, { shade: 'v' })}<path d="M120 200V208" stroke="${dk}" stroke-width="3" stroke-linecap="round"/>${kind === 'pants' ? `<path d="M80 204V219M160 204V219" stroke="${dk}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>` : `<path d="M50 208 Q84 212 114 208M126 208 Q156 212 190 208" stroke="${dk}" stroke-width="2.5" fill="none" opacity=".7"/>`}`;
  };
  const underArt = (id) => feetFront(id, `${vol(BRIEFS, CL.under, { shade: 'v' })}<path d="M55 194 Q120 216 185 194" fill="none" stroke="${CL.band}" stroke-width="6" stroke-linecap="round"/>`);
  const pjArt = (id) => `${vol(SLEEVES, CL.pj)}${vol(PANTS, CL.pjDk, { shade: 'v' })}<circle cx="70" cy="210" r="3" fill="#fff"/><circle cx="100" cy="214" r="3" fill="#fff"/><circle cx="140" cy="214" r="3" fill="#fff"/><circle cx="170" cy="210" r="3" fill="#fff"/>${onBody(id, `${vol(SHIRT, CL.pj, { shade: 'v' })}<path d="${NECK}" fill="none" stroke="#fff" stroke-width="6"/>
    ${STAR(80, 174, 6, '#fff')}${STAR(160, 174, 6, '#fff')}${STAR(120, 186, 6, '#fff')}`)}
    <path d="M22 174 a6 6 0 1 0 6 -8 a4.5 4.5 0 1 1 -6 8z M214 174 a6 6 0 1 1 -6 -8 a4.5 4.5 0 1 0 6 8z" fill="#fff"/>`;
  const sockArt = (fx) => `${vol(`<ellipse cx="${fx}" cy="218.5" rx="24.5" ry="13.5"/>`, CL.sock)}<path d="M${fx - 20} 222 Q${fx} 216 ${fx + 20} 222" fill="none" stroke="${CL.stripe}" stroke-width="3.5" stroke-linecap="round"/>`;
  // a shoe from the front; side L/R; open = the sticky strap stands up
  const shoeArt = (fx, side, open) => {
    const s = side === 'L' ? -1 : 1;
    const ax = fx + 22 * s;
    return `${vol(`<rect x="${fx - 28}" y="222" width="56" height="11" rx="5.5"/>`, CL.sole)}${vol(`<path d="M${fx - 26} 225 C${fx - 27} 201 ${fx + 27} 201 ${fx + 26} 225 Z"/>`, CL.shoe)}<path d="M${fx - 14} 226 Q${fx} 215 ${fx + 14} 226 Z" fill="#fff" opacity=".85"/>
      <g${open ? ` transform="rotate(${s * 62} ${ax} 212)"` : ''}>${vol(`<rect x="${Math.min(ax, ax - 46 * s)}" y="208" width="46" height="9" rx="4"/>`, CL.shoeDk)}<rect x="${s < 0 ? fx + 12 : fx - 22}" y="209.5" width="10" height="6" rx="2" fill="#C9D1D9"/></g>`;
  };
  // everything Lumi is wearing, in his grid; o.noPj leaves the pyjamas off (they are a separate thing to drag)
  function wearInner(wear, o) {
    const op = o || {};
    const id = 'lrw' + (++uid);
    const g = (k, inner) => `<g class="lr-g${op.fresh === k ? ' lr-new' : ''}">${inner}</g>`;
    let h = wearDefs(id);
    // socks go under the shorts' legs; shoes are in front of everything
    ['L', 'R'].forEach((s) => { if (wear['sock' + s] && !wear['shoe' + s]) h += g('sock' + s, sockArt(FEET[s])); });
    if (wear.pj && !op.noPj) h += g('pj', pjArt(id));
    if (wear.under) h += g('under', underArt(id));
    if (wear.bottom) h += g('bottom', bottomArt(id, wear.bottom));
    if (wear.shirt) h += g('shirt', shirtArt(id));
    ['L', 'R'].forEach((s) => { if (wear['shoe' + s]) h += g('shoe' + s, shoeArt(FEET[s], s, wear['shoe' + s] === 'open')); });
    return h;
  }
  // after each draw: put the clothes on Lumi (inside his box, so they move with him)
  function wearOn(box, st, o) {
    const lu = box.querySelector('.sx-lumi');
    if (!lu || !st.data.wear) return;
    lu.querySelectorAll('.lr-wear').forEach((e) => e.remove());
    lu.insertAdjacentHTML('beforeend', `<svg class="lr-wear" viewBox="-14 -14 268 268" aria-hidden="true">${wearInner(st.data.wear, Object.assign({ fresh: st.s.fresh }, o || {}))}</svg>`);
    st.s.fresh = null;
  }

  // ================================================================ clothes as things (flat, shaded)
  const teeIn = () => `${LP.drop(70, 114, 58, 6)}${vol('<path d="M46 10 Q70 24 94 10 L132 28 L120 58 L104 52 L104 108 Q70 116 36 108 L36 52 L20 58 L8 28 Z"/>', CL.tee)}<path d="M46 10 Q70 26 94 10" fill="none" stroke="${CL.teeDk}" stroke-width="6" stroke-linecap="round"/>${STAR(70, 70, 15, '#fff')}`;
  const shortsIn = () => `${LP.drop(60, 92, 52, 5)}${vol('<path d="M16 12 H104 L114 86 H70 L60 44 L50 86 H6 Z"/>', CL.shorts, { shade: 'v' })}${vol('<rect x="14" y="8" width="92" height="15" rx="6"/>', CL.shortsDk)}<path d="M54 23 q6 10 12 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const pantsIn = () => `${LP.drop(55, 124, 48, 5)}${vol('<path d="M18 12 H92 L102 120 H64 L55 46 L46 120 H8 Z"/>', CL.pants, { shade: 'v' })}${vol('<rect x="16" y="8" width="78" height="14" rx="6"/>', CL.pantsDk)}<path d="M33 30 V114 M77 30 V114" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>`;
  const underIn = () => `${LP.drop(50, 72, 42, 4)}${vol('<path d="M8 14 H92 L86 38 Q70 44 60 66 H40 Q30 44 14 38 Z"/>', CL.under)}${vol('<rect x="6" y="8" width="88" height="12" rx="5"/>', CL.band)}`;
  const teeFlat = () => svg('0 0 140 120', teeIn());
  const bottomFlat = (kind) => (kind === 'pants' ? svg('0 0 110 130', pantsIn()) : svg('0 0 120 96', shortsIn()));
  const underFlat = () => svg('0 0 100 76', underIn());
  const raincoatIn = () => `${LP.drop(50, 104, 40, 5)}${vol('<path d="M30 20 Q50 0 70 20 L86 92 Q50 102 14 92 Z"/>', '#F4D35E')}<path d="M50 30 V94" stroke="#C98A1E" stroke-width="3"/><circle cx="44" cy="48" r="3.5" fill="#C98A1E"/><circle cx="44" cy="66" r="3.5" fill="#C98A1E"/><path d="M36 22 Q50 12 64 22" fill="none" stroke="#C98A1E" stroke-width="3"/>`;
  const sockSide = () => svg('0 0 84 100', `${LP.drop(46, 95, 34, 4)}${vol('<path d="M20 6 H52 V56 L70 64 Q84 72 78 86 Q74 94 62 94 H28 Q14 94 18 80 Z"/>', CL.sock)}<path d="M20 16 H52 M20 25 H52" stroke="${CL.stripe}" stroke-width="5"/><path d="M60 70 q13 4 16 14" fill="none" stroke="#DCE4EA" stroke-width="6" stroke-linecap="round"/>`);
  const shoeSideIn = (flip, c, dk) => `<g${flip ? ' transform="translate(100 0) scale(-1 1)"' : ''}>${LP.drop(50, 59, 46, 5)}${vol('<path d="M8 50 V30 Q8 14 26 14 H42 Q52 28 70 32 L86 36 Q96 40 96 50 Z"/>', c || CL.shoe)}<path d="M62 33 Q82 36 94 46 L94 50 H62 Z" fill="#fff" opacity=".8"/>
    ${vol('<rect x="4" y="48" width="94" height="10" rx="5"/>', CL.sole)}${vol('<rect x="30" y="25" width="36" height="10" rx="4" transform="rotate(14 48 30)"/>', dk || CL.shoeDk)}<path d="M12 30 Q12 20 24 20" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/></g>`;
  const shoeSide = (flip) => svg('0 0 100 64', shoeSideIn(flip));
  const pjPeek = () => `${vol('<path d="M18 40 Q22 14 46 18 Q60 4 80 16 Q104 8 118 30 L122 46 H16 Z"/>', CL.pj)}${STAR(50, 30, 6, '#fff')}${STAR(92, 26, 6, '#fff')}`;

  // ================================================================ rooms
  function wall(c, floorTop, skirt, stripes) {
    let h = `<rect width="${W}" height="${H}" fill="${c}"/>`;
    if (stripes) for (let x = 0; x < W; x += 64) h += `<rect x="${x}" width="30" height="${floorTop}" fill="#fff" opacity=".16"/>`;
    return h + `<rect width="${W}" height="${floorTop}" fill="url(#lpShadeV)" opacity=".18"/><rect y="${floorTop - 14}" width="${W}" height="14" fill="${skirt}"/><rect y="${floorTop - 14}" width="${W}" height="3" fill="#fff" opacity=".5"/>`;
  }
  function woodFloor(top, c, line) {
    let h = `<rect y="${top}" width="${W}" height="${H - top}" fill="${c}"/>`;
    const rows = [0, 16, 36, 62, 94, 132, 176];
    rows.forEach((r, i) => {
      const y = top + r;
      if (y >= H) return;
      h += `<path d="M0 ${y}H${W}" stroke="${line}" stroke-width="2" opacity=".55"/>`;
      const next = Math.min(H, top + (rows[i + 1] || H));
      for (let x = (i * 151) % 260; x < W; x += 260) h += `<path d="M${x} ${y}V${next}" stroke="${line}" stroke-width="2" opacity=".4"/>`;
    });
    return h + `<rect y="${top}" width="${W}" height="${H - top}" fill="url(#lpFloorFade)"/>`;
  }
  function tileFloor(top, c, line) {
    let h = `<rect y="${top}" width="${W}" height="${H - top}" fill="${c}"/>`;
    [0, 22, 50, 86, 130].forEach((r) => { if (top + r < H) h += `<path d="M0 ${top + r}H${W}" stroke="${line}" stroke-width="2" opacity=".6"/>`; });
    for (let i = -8; i <= 16; i++) h += `<path d="M${W / 2 + i * 70} ${top}L${W / 2 + i * 150} ${H}" stroke="${line}" stroke-width="2" opacity=".45"/>`;
    return h + `<rect y="${top}" width="${W}" height="${H - top}" fill="url(#lpFloorFade)"/>`;
  }
  // the view from a window: HDB blocks, trees, the sky (a sunny morning, or dusk)
  function cityView(w, h, dusk) {
    let s = `<rect width="${w}" height="${h}" fill="${dusk ? 'url(#lrDusk)' : 'url(#lpSky)'}"/>`;
    if (dusk) {
      s += `<circle cx="${w * 0.76}" cy="${h * 0.22}" r="15" fill="#FFF3C4"/><circle cx="${w * 0.76 + 7}" cy="${h * 0.22 - 4}" r="13" fill="#56609A"/>`;
      [[0.18, 0.12], [0.42, 0.2], [0.6, 0.08], [0.9, 0.34]].forEach(([fx, fy]) => { s += `<circle cx="${w * fx}" cy="${h * fy}" r="2" fill="#fff" opacity=".85"/>`; });
    } else {
      s += `<circle cx="${w - 58}" cy="50" r="52" fill="url(#lpGlow)"/><circle cx="${w - 58}" cy="50" r="24" fill="#FFD84D"/><circle cx="${w - 64}" cy="44" r="9" fill="#fff" opacity=".45"/>`;
      [[0.2, 0.2, 1], [0.5, 0.34, 0.8]].forEach(([fx, fy, k]) => { const x = w * fx; const y = h * fy; s += `<g opacity=".95"><ellipse cx="${x}" cy="${y}" rx="${30 * k}" ry="${11 * k}" fill="#fff"/><circle cx="${x - 9 * k}" cy="${y - 6 * k}" r="${12 * k}" fill="#fff"/><circle cx="${x + 10 * k}" cy="${y - 8 * k}" r="${10 * k}" fill="#fff"/></g>`; });
    }
    const blocks = [[0.03, 0.5, 0.25, '#F3DCC2', '#DDBF9C'], [0.32, 0.38, 0.27, '#DCE9F3', '#B7CCDD'], [0.66, 0.58, 0.3, '#F2D3DA', '#D9AFBA']];
    blocks.forEach(([fx, ft, fw, c, dk], b) => {
      const bx = fx * w;
      const by = ft * h;
      const bw = fw * w;
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="${h - by}" fill="${dusk ? '#7C7AA8' : c}"/><rect x="${bx}" y="${by}" width="${bw}" height="7" fill="${dusk ? '#5E5C8A' : dk}"/>`;
      for (let y = by + 15, r = 0; y < h - 8; y += 15, r++) {
        for (let x = bx + 6, k = 0; x < bx + bw - 10; x += 13, k++) {
          const lit = (r * 3 + k * 5 + b) % 4 === 0;
          s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="7" height="6" rx="1" fill="${dusk ? (lit ? '#FFE08A' : '#5E5C8A') : '#A9C2D6'}" opacity="${dusk ? 1 : 0.75}"/>`;
        }
      }
    });
    s += `<circle cx="${w * 0.14}" cy="${h + 8}" r="${h * 0.2}" fill="${dusk ? '#4E7A5C' : '#7BC67E'}"/><circle cx="${w * 0.3}" cy="${h + 14}" r="${h * 0.16}" fill="${dusk ? '#5B8A68' : '#8FD18E'}"/><circle cx="${w * 0.88}" cy="${h + 10}" r="${h * 0.18}" fill="${dusk ? '#4E7A5C' : '#7BC67E'}"/>`;
    return s;
  }
  function windowArt(x, y, w, h, dusk) {
    return `${vol(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>`, '#FFFFFF')}${nest(x + 14, y + 14, w - 28, h - 28, `0 0 ${w - 28} ${h - 28}`, cityView(w - 28, h - 28, dusk)).replace('overflow="visible"', 'overflow="hidden"')}
      <rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" fill="url(#lpGlass)" opacity=".5"/><path d="M${x + w / 2} ${y + 14}V${y + h - 14}M${x + 14} ${y + h * 0.46}H${x + w - 14}" stroke="#fff" stroke-width="7"/>
      ${vol(`<rect x="${x - 10}" y="${y + h - 4}" width="${w + 20}" height="14" rx="5"/>`, '#FFFFFF')}`;
  }

  // ---------------------------------------------------------------- the bedroom
  const BED_FLOOR = 430;
  const WIN = { x: 280, y: 40, w: 320, h: 212 };
  const CUR = { x: 262, y: 32, w: 356, h: 240 };
  function chestArt() {
    let h = `${LP.drop(119, 444, 102, 8)}${vol('<rect x="30" y="246" width="178" height="186" rx="10"/>', '#EBCDA6', { shade: 'h' })}${vol('<rect x="22" y="234" width="194" height="18" rx="8"/>', '#D7AE82')}`;
    [262, 318, 374].forEach((y) => { h += `${vol(`<rect x="42" y="${y}" width="154" height="48" rx="7"/>`, '#F3DABA', { lineOpacity: 0.35 })}<circle cx="96" cy="${y + 24}" r="5" fill="#B98A5A"/><circle cx="142" cy="${y + 24}" r="5" fill="#B98A5A"/>`; });
    h += '<path d="M40 432v10M198 432v10" stroke="#B98A5A" stroke-width="8" stroke-linecap="round"/>';
    // an alarm clock (seven o'clock) and a teddy on top
    h += `${LP.drop(54, 234, 24, 3)}<path d="M38 230l-6 6M70 230l6 6" stroke="${LP.INK}" stroke-width="3" stroke-linecap="round"/>${vol('<circle cx="54" cy="208" r="23"/>', '#F4A259')}<circle cx="54" cy="208" r="16" fill="#fff"/><path d="M54 208V196M54 208l-8 5" stroke="${LP.INK}" stroke-width="3" stroke-linecap="round"/>${vol('<circle cx="40" cy="186" r="6"/><circle cx="68" cy="186" r="6"/>', '#E07A5F')}`;
    h += `${LP.drop(196, 234, 18, 3)}${vol('<circle cx="184" cy="196" r="7"/><circle cx="208" cy="196" r="7"/><ellipse cx="196" cy="222" rx="16" ry="13"/><circle cx="196" cy="204" r="12"/>', '#C9915F')}${vol('<ellipse cx="196" cy="208" rx="6" ry="4"/>', '#F1D4B0', { lineOpacity: 0.3 })}<circle cx="191" cy="201" r="1.8" fill="${LP.INK}"/><circle cx="201" cy="201" r="1.8" fill="${LP.INK}"/>`;
    return h;
  }
  function bedArt() {
    return `${LP.drop(884, 446, 232, 12)}${vol('<rect x="648" y="196" width="42" height="246" rx="16"/>', '#C99A6B', { shade: 'h' })}<rect x="658" y="214" width="22" height="90" rx="8" fill="#fff" opacity=".18"/>
      ${vol('<rect x="676" y="370" width="440" height="50" rx="10"/>', '#C99A6B', { shade: 'v' })}<path d="M700 420v20M1090 420v20" stroke="#A87B50" stroke-width="12" stroke-linecap="round"/>
      ${vol('<rect x="680" y="320" width="436" height="58" rx="16"/>', '#FFFFFF', { shade: 'v' })}
      ${vol('<path d="M698 300 q42 -20 92 -2 q8 16 0 30 q-48 12 -92 0 q-8 -14 0 -28z"/>', '#FFFFFF')}<path d="M716 310 q30 -8 56 0" stroke="#DCE6EE" stroke-width="3" fill="none"/>
      ${vol('<path d="M800 318 h316 v74 h-310 q-22 -34 -6 -74z"/>', '#8EC0DC', { shade: 'v' })}${vol('<path d="M800 318 q-16 30 -2 60 q22 -2 34 -20 q-12 -20 -32 -40z"/>', '#B7D8EA', { lineOpacity: 0.4 })}
      ${[860, 930, 1000, 1070].map((x, i) => `<circle cx="${x}" cy="${348 + (i % 2) * 18}" r="6" fill="#fff" opacity=".7"/>`).join('')}`;
  }
  function frameArt() {
    return `${vol('<rect x="50" y="48" width="140" height="112" rx="8"/>', '#D7AE82')}<rect x="62" y="60" width="116" height="88" rx="4" fill="#FFFDF7"/>
      <circle cx="152" cy="82" r="12" fill="#FFD23F"/><path d="M152 62v-4M152 106v-4M172 82h4M128 82h4" stroke="#FFD23F" stroke-width="3" stroke-linecap="round"/>
      <path d="M78 134 l24 -24 24 24z" fill="#E5534B"/><rect x="84" y="134" width="36" height="12" fill="#F4A259"/><path d="M62 146 q58 -10 116 0" stroke="#7FB069" stroke-width="5" fill="none"/>`;
  }
  SX.bg.bedRoom = (st) => {
    const open = st && st.data && st.data.curtains;
    return `${wall('#FCEBD5', BED_FLOOR, '#F2D7B8', true)}${woodFloor(BED_FLOOR, '#E2B98C', '#C9996A')}
      ${frameArt()}${windowArt(WIN.x, WIN.y, WIN.w, WIN.h, false)}
      <path d="M256 32H624" stroke="url(#lpMetal)" stroke-width="8" stroke-linecap="round"/>${vol('<circle cx="254" cy="32" r="8"/><circle cx="626" cy="32" r="8"/>', '#C9D1D9')}
      ${open ? '<path d="M300 256 L580 256 L700 530 L360 530 Z" fill="#FFF3B0" opacity=".24"/><ellipse cx="530" cy="522" rx="190" ry="32" fill="#FFF3B0" opacity=".3"/>' : ''}
      <ellipse cx="520" cy="522" rx="190" ry="34" fill="#E5D9F2"/><ellipse cx="520" cy="522" rx="168" ry="24" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 9"/>
      ${chestArt()}${bedArt()}`;
  };

  // the curtains: closed in the dark morning, open and tied back after a tap
  function curtainArt(open) {
    const c = '#9AD0C2';
    const folds = (x0, x1) => Array.from({ length: Math.floor((x1 - x0) / 26) }, (_, i) => `<path d="M${x0 + 14 + i * 26} 10V228" stroke="#6FAE9F" stroke-width="5" opacity=".35"/>`).join('');
    const rings = Array.from({ length: 12 }, (_, i) => `<circle cx="${10 + i * 30.5}" cy="4" r="5" fill="none" stroke="#9AA6B2" stroke-width="3"/>`).join('');
    if (!open) {
      return svg('0 0 356 240', `${rings}<rect x="172" y="8" width="12" height="226" fill="#FFF3B0" opacity=".9"/>
        <g class="lr-cur-l">${vol('<path d="M4 6 H182 V230 Q140 240 96 230 Q50 240 4 230 Z"/>', c, { shade: 'h' })}${folds(4, 182)}</g>
        <g class="lr-cur-r">${vol('<path d="M174 6 H352 V230 Q306 240 262 230 Q218 240 174 230 Z"/>', c, { shade: 'h' })}${folds(174, 352)}</g>`);
    }
    return svg('0 0 356 240', `${rings}
      <g class="lr-cur-l">${vol('<path d="M4 6 H58 Q44 110 50 148 Q58 190 56 230 Q30 240 4 230 Z"/>', c, { shade: 'h' })}<path d="M18 10V226M36 10V226" stroke="#6FAE9F" stroke-width="5" opacity=".35"/>${vol('<rect x="0" y="142" width="58" height="12" rx="6"/>', '#F4B860')}</g>
      <g class="lr-cur-r">${vol('<path d="M298 6 H352 V230 Q326 240 300 230 Q298 190 306 148 Q312 110 298 6 Z"/>', c, { shade: 'h' })}<path d="M320 10V226M338 10V226" stroke="#6FAE9F" stroke-width="5" opacity=".35"/>${vol('<rect x="298" y="142" width="58" height="12" rx="6"/>', '#F4B860')}</g>`);
  }
  const curtainsEl = (st, canTap) => {
    const open = st.data.curtains;
    return SX.at(CUR.x, CUR.y, CUR.w, CUR.h, curtainArt(open), { k: !open && canTap ? 'curtains' : null, label: open ? null : 'Curtains', z: 10, cls: `lr-cur ${open ? 'open' : 'ln-glow'} ${st.s.anim ? 'anim' : ''}` });
  };
  // the laundry basket (pj = the pyjamas are in it)
  function basketArt(pj) {
    let weave = '';
    [62, 80, 98, 116].forEach((y) => { weave += `<path d="M${14 + (y - 40) * 0.1} ${y}H${126 - (y - 40) * 0.1}" stroke="#B88A55" stroke-width="3" opacity=".6"/>`; });
    for (let x = 30; x < 120; x += 16) weave += `<path d="M${x} 50 L${x + (70 - x) * 0.12} 134" stroke="#B88A55" stroke-width="2.5" opacity=".45"/>`;
    return svg('0 0 140 150', `${LP.drop(70, 144, 62, 7)}${pj ? pjPeek() : ''}${vol('<path d="M12 40 H128 L116 140 H24 Z"/>', '#E3C08F', { shade: 'h' })}${weave}${vol('<rect x="4" y="32" width="132" height="16" rx="8"/>', '#D4AE78')}<rect x="20" y="36" width="20" height="8" rx="4" fill="#9C7244"/><rect x="100" y="36" width="20" height="8" rx="4" fill="#9C7244"/>`);
  }
  const BASKET = { x: 226, y: 350, w: 140, h: 150 };
  const basketEl = (st, target) => SX.at(BASKET.x, BASKET.y, BASKET.w, BASKET.h, basketArt(st.data.pjIn), { target: !!target, id: 'basket', label: 'Laundry basket', z: 4 });
  // the top drawer pulled open (the underpants lie on top)
  const drawerOpen = () => svg('0 0 206 90', `${vol('<path d="M10 4 H196 L204 34 H2 Z"/>', '#C79C6E')}<path d="M18 8 H188 L194 30 H12 Z" fill="#9C7244" opacity=".55"/>${vol('<rect x="0" y="30" width="206" height="56" rx="8"/>', '#F3DABA')}<circle cx="80" cy="58" r="6" fill="#B98A5A"/><circle cx="126" cy="58" r="6" fill="#B98A5A"/>`);
  // the clothes Lumi chose, laid out on the bed
  const TEE_AT = { x: 812, y: 210, w: 140, h: 120 };
  const BOT_AT = { shorts: { x: 966, y: 236, w: 120, h: 96 }, pants: { x: 978, y: 204, w: 104, h: 124 } };
  const bottomOf = (st) => st.data.bottom || 'shorts';
  function bedClothes(st, drag) {
    if (!st.data.bottom) return '';
    const w = st.data.wear || {};
    let h = '';
    if (!w.shirt) h += SX.at(TEE_AT.x, TEE_AT.y, TEE_AT.w, TEE_AT.h, teeFlat(), drag === 'shirt' ? { cls: 'sx-drag lr-tee', label: 'T-shirt', z: 8 } : { z: 3, cls: st.s.fresh === 'bed' ? 'lr-in' : '' });
    const b = BOT_AT[bottomOf(st)];
    if (!w.bottom) h += SX.at(b.x, b.y, b.w, b.h, bottomFlat(bottomOf(st)), drag === 'bottom' ? { cls: 'sx-drag lr-bottom', label: bottomOf(st) === 'pants' ? 'Long pants' : 'Shorts', z: 8 } : { z: 3, cls: st.s.fresh === 'bed' ? 'lr-in' : '' });
    return h;
  }
  const BED_LUMI = { x: 520, y: 540, h: 270 };
  const bedSpot = (st, o) => Object.assign({}, BED_LUMI, { look: BARE, mood: st.done ? 'excited' : 'happy' }, o || {});
  const bedBubble = (text, w) => SX.bubble(396, 262, text, { w: w || 240 });
  const roomThings = (st, o) => {
    const op = o || {};
    return curtainsEl(st, op.curtains) + basketEl(st, op.basket) + bedClothes(st, op.drag);
  };

  // ---------------------------------------------------------------- the front door (both lessons)
  const DOOR_FLOOR = 434;
  function frontDoor(evening) {
    let h = `${wall(evening ? '#EADFCF' : '#EFE6D6', DOOR_FLOOR, '#E0D2BA')}${tileFloor(DOOR_FLOOR, '#E9ECEF', '#C9D1D9')}`;
    if (evening) h += '<ellipse cx="560" cy="0" rx="460" ry="150" fill="url(#lpGlow)" opacity=".55"/>';
    // the door
    h += `${vol('<rect x="768" y="24" width="224" height="412" rx="8"/>', '#D9B48A', { shade: 'h' })}${vol('<rect x="782" y="38" width="196" height="398" rx="4"/>', '#B07D4F', { shade: 'h' })}
      ${vol('<rect x="806" y="64" width="148" height="150" rx="6"/><rect x="806" y="240" width="148" height="170" rx="6"/>', '#A06F45', { lineOpacity: 0.35, shade: 'v' })}
      <circle cx="880" cy="110" r="6" fill="#3E4A5A"/><circle cx="880" cy="110" r="3" fill="#8EC5F2"/>${vol('<rect x="790" y="236" width="14" height="40" rx="5"/>', '#C9D1D9')}${vol('<rect x="790" y="252" width="40" height="10" rx="5"/>', '#C9D1D9')}
      ${vol('<path d="M772 442 H988 L998 480 H762 Z"/>', '#A9746A', { shade: 'v' })}<path d="M780 452 H980 M776 466 H984" stroke="#8A5A50" stroke-width="3" opacity=".6"/>`;
    // the open shoe rack, with a grown-up's shoes on the lower shelf
    h += `${LP.drop(136, 446, 112, 8)}${vol('<rect x="30" y="200" width="12" height="244" rx="5"/><rect x="230" y="200" width="12" height="244" rx="5"/>', '#C99A6B')}
      ${vol('<rect x="24" y="294" width="224" height="12" rx="5"/><rect x="24" y="384" width="224" height="12" rx="5"/>', '#D9B48A')}
      ${nest(46, 348, 84, 38, '0 0 100 64', shoeSideIn(false, '#5A4636', '#3E2F24'))}${nest(140, 348, 84, 38, '0 0 100 64', shoeSideIn(false, '#5A4636', '#3E2F24'))}`;
    // a low bench to sit on
    h += `${LP.drop(340, 444, 92, 6)}<path d="M268 392v48M412 392v48" stroke="#A87B50" stroke-width="12" stroke-linecap="round"/>${vol('<rect x="252" y="376" width="176" height="20" rx="8"/>', '#D9B48A')}`;
    // keys on a hook, a light switch, an umbrella in its stand
    h += `${vol('<rect x="1020" y="150" width="60" height="12" rx="5"/>', '#C9D1D9')}<path d="M1036 162v14M1062 162v18" stroke="#9AA6B2" stroke-width="3"/>${vol('<circle cx="1036" cy="182" r="7"/><circle cx="1062" cy="186" r="7"/>', '#F4B860')}
      ${vol('<rect x="1012" y="232" width="34" height="50" rx="6"/>', '#FFFFFF')}<rect x="1024" y="244" width="10" height="18" rx="3" fill="#E3E8ED"/>
      ${LP.drop(1060, 444, 34, 5)}<path d="M1060 300v120" stroke="#3E4A5A" stroke-width="5" stroke-linecap="round"/><path d="M1060 300q-4 -10 4 -12" stroke="#3E4A5A" stroke-width="5" fill="none" stroke-linecap="round"/>${vol('<path d="M1060 320 L1046 410 Q1060 418 1074 410 Z"/>', '#E5534B')}${vol('<rect x="1036" y="380" width="48" height="62" rx="8"/>', '#7E64C8', { shade: 'h' })}`;
    return h;
  }
  SX.bg.bedDoor = () => frontDoor(false);
  if (!HOME.frontDoor) HOME.frontDoor = frontDoor;

  const DOOR_LUMI = { x: 600, y: 528, h: 320 };
  const doorSpot = (st, o) => Object.assign({}, DOOR_LUMI, { look: BARE, mood: st.done ? 'excited' : 'happy' }, o || {});
  const footAt = (s) => onLumi(DOOR_LUMI, FEET[s], 218);
  const SOCK_AT = [{ x: 262, y: 278 }, { x: 348, y: 278 }];
  const SHOE_AT = { L: { x: 34, y: 232 }, R: { x: 138, y: 232 } };
  const sideName = (s) => (s === 'L' ? 'left' : 'right');
  // a place by each foot: a drop target (socks, shoes) or a button (straps); the ring shows where
  function footSpots(st, mode) {
    return ['L', 'R'].map((s) => {
      const f = footAt(s);
      const x = s === 'L' ? f.x - 64 : DOOR_LUMI.x;
      const w = s === 'L' ? DOOR_LUMI.x - x : f.x + 64 - DOOR_LUMI.x;
      const y = f.y - 64;
      const hh = 106;
      const wear = st.data.wear;
      const need = mode === 'sock' ? !wear['sock' + s] : mode === 'shoe' ? !wear['shoe' + s] : wear['shoe' + s] === 'open';
      const ring = need ? svg(`0 0 ${w.toFixed(1)} ${hh}`, `<ellipse cx="${(f.x - x).toFixed(1)}" cy="${(f.y - y + 6).toFixed(1)}" rx="33" ry="21" fill="#fff" fill-opacity=".3" stroke="#2F9E95" stroke-width="4" stroke-dasharray="10 7"/>`) : '';
      if (mode === 'strap') return need ? SX.at(x, y, w, hh, ring, { k: 'strap', v: s, label: `Press the ${sideName(s)} strap`, z: 7, cls: 'lr-foot lr-strap' }) : '';
      return SX.at(x, y, w, hh, ring, { target: true, id: 'foot' + s, label: `Lumi's ${sideName(s)} foot`, z: 7, cls: 'lr-foot no-outline' });
    }).join('');
  }
  const rackShoes = (st, drag) => ['L', 'R'].map((s) => (st.data.wear['shoe' + s] ? '' : SX.at(SHOE_AT[s].x, SHOE_AT[s].y, 100, 64, shoeSide(s === 'L'), drag ? { cls: 'sx-drag lr-shoe', id: 'shoe' + s, label: `${s === 'L' ? 'Left' : 'Right'} shoe`, z: 8 } : { z: 3 }))).join('');
  const doorBubble = (text, w) => SX.bubble(452, 132, text, { w: w || 250 });
  // put a sock or shoe on the foot it was dropped on (or the other foot, if that one already has it)
  function putOn(st, kind, side, value) {
    const w = st.data.wear;
    let s = side;
    if (w[kind + s]) s = s === 'L' ? 'R' : 'L';
    if (w[kind + s]) return false;
    w[kind + s] = value || true;
    st.s.fresh = kind + s;
    st.s.tip = null;
    return true;
  }

  // ---------------------------------------------------------------- the mirror by the door
  SX.bg.bedMirror = () => `${wall('#EFE6D6', 474, '#E0D2BA')}${tileFloor(474, '#E9ECEF', '#C9D1D9')}
    <g transform="translate(110 296) scale(1.5)">${LP.drop(40, 116, 30, 5)}${vol('<path d="M40 70c-30-4-38-34-26-52 10 16 22 24 26 52zM40 70c30-4 38-34 26-52-10 16-22 24-26 52zM40 72c-4-30 0-50 0-66 10 18 10 40 0 66z"/>', '#7BC67E')}${vol('<path d="M18 74h44l-6 40H24z"/>', '#E07A5F')}</g>
    ${LP.drop(550, 560, 250, 10)}${vol('<rect x="296" y="10" width="508" height="548" rx="30"/>', '#C99A6B', { shade: 'h' })}
    <rect x="314" y="28" width="472" height="512" rx="18" fill="#E8F1F5"/><rect x="314" y="430" width="472" height="110" fill="#DDE3E8"/><path d="M314 430H786" stroke="#C9D1D9" stroke-width="3"/>
    <rect x="660" y="70" width="110" height="362" rx="4" fill="#B07D4F" opacity=".22"/><rect x="330" y="300" width="120" height="10" fill="#C99A6B" opacity=".25"/>
    <rect x="314" y="28" width="472" height="512" rx="18" fill="url(#lpGlass)" opacity=".7"/><path d="M700 60l60-26M690 110l86-40" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".55"/>`;
  const MIRROR_LUMI = { x: 550, y: 506, h: 330 };
  function checklist(st) {
    const rows = [
      ['T-shirt', svg('0 0 140 120', teeIn())],
      [bottomOf(st) === 'pants' ? 'Long pants' : 'Shorts', bottomFlat(bottomOf(st))],
      ['Socks', sockSide()],
      ['Shoes', shoeSide(false)]
    ];
    return SX.at(836, 66, 256, 404, `<span class="lr-check"><span class="lr-check-t">All on?</span>${rows.map(([t, art], i) => `<span class="lr-ci"><span class="lr-ci-art">${art}</span><span class="lr-ci-l">${esc(t)}</span><span class="lr-ci-ok ${st.done ? 'on' : ''}" style="animation-delay:${i * 0.25}s">${st.done ? ic('check', 22) : ''}</span></span>`).join('')}</span>`, { z: 6 });
  }
  const sparkles = () => [[380, 150, 34], [740, 210, 28], [420, 430, 24], [700, 400, 30]].map(([x, y, s], i) => SX.at(x, y, s, s, svg('0 0 40 40', '<path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="#FFD23F"/>'), { z: 7, cls: 'lr-spark', style: `animation-delay:${i * 0.3}s` })).join('');

  // ================================================================ where each step starts (for Back, levels, and "Practise again")
  const D_ORDER = ['curtains', 'weather', 'pyjamas', 'under', 'shirt', 'bottoms', 'socks', 'shoes', 'straps', 'mirror'];
  function dressUpTo(st, id) {
    const at = D_ORDER.indexOf(id);
    const past = (k) => D_ORDER.indexOf(k) < at;
    const lv = level();
    const shoe = past('shoes') ? (lv >= 3 && !past('straps') ? 'open' : 'shut') : null;
    st.data.curtains = past('curtains');
    st.data.pjIn = past('pyjamas');
    st.data.wear = {
      pj: !past('pyjamas'),
      under: lv >= 2 && past('under'),
      shirt: past('shirt'),
      bottom: past('bottoms') ? bottomOf(st) : null,
      sockL: past('socks'),
      sockR: past('socks'),
      shoeL: shoe,
      shoeR: shoe
    };
  }

  // ================================================================ Get dressed: the steps
  const PICKS = [
    { label: 'T-shirt and shorts', bottom: 'shorts', art: () => svg('0 0 70 62', `${nest(2, 0, 40, 34, '0 0 140 120', teeIn())}${nest(30, 24, 38, 32, '0 0 120 96', shortsIn())}`),
      text: 'A T-shirt and shorts keep Lumi cool on a hot, sunny day.', praise: 'Good choice! Cool and comfy.', bubble: 'Cool and comfy!' },
    { label: 'T-shirt and long pants', bottom: 'pants', art: () => svg('0 0 70 62', `${nest(2, 0, 40, 34, '0 0 140 120', teeIn())}${nest(34, 14, 34, 44, '0 0 110 130', pantsIn())}`),
      text: 'Long pants are fine too. The T-shirt keeps Lumi cool.', praise: 'Good choice! Long pants are fine too.', bubble: 'Comfy!' },
    { label: 'Raincoat', bottom: 'shorts', art: () => svg('0 0 100 110', raincoatIn()),
      text: 'A raincoat is for rainy days. It is sunny today, so Lumi picks a T-shirt and shorts.', praise: 'Good thinking! No rain today.', bubble: 'No rain today!' }
  ];
  // a "put it on Lumi" step: drag the thing from where it is onto Lumi
  function putOnStep(o) {
    return {
      id: o.id,
      min: o.min,
      bg: 'bedRoom',
      text: o.text,
      task: (st) => (st.done ? '' : SX.val(o.task, st)),
      lumi: (st) => bedSpot(st),
      enter(st) { dressUpTo(st, o.id); },
      draw(st) {
        let h = roomThings(st, { drag: st.done ? null : o.key });
        if (o.extra) h += o.extra(st);
        if (!st.done) h += lumiZone(BED_LUMI, 'lumi');
        return h;
      },
      after(st, box) {
        wearOn(box, st);
        if (st.done) return;
        SX.dragTo(box, o.sel, '[data-id="lumi"]', () => { o.wear(st); st.s.fresh = o.key; SX.ok(); SX.done(st, SX.val(o.praise, st)); return true; }, { pad: 30, miss: () => SX.say(SX.val(o.miss, st)) });
      },
      auto(st) { o.wear(st); st.s.fresh = o.key; SX.done(st, SX.val(o.praise, st)); },
      demo: () => ({ sel: o.sel, to: '[data-id="lumi"]' }),
      guide: (st) => (st.done ? null : { sel: o.sel, to: '[data-id="lumi"]', say: SX.val(o.task, st) })
    };
  }
  const dressSteps = [
    {
      id: 'curtains',
      bg: 'bedRoom',
      text: (st) => (st.data.curtains ? 'Good morning! Now the room is bright.' : 'Good morning! Lumi is awake, but the room is still dark.'),
      task: (st) => (st.done ? '' : 'Tap the curtains to open them.'),
      lumi: (st) => bedSpot(st, { mood: st.data.curtains ? 'excited' : 'calm' }),
      enter(st) { dressUpTo(st, 'curtains'); },
      draw(st) {
        let h = roomThings(st, { curtains: true });
        if (!st.data.curtains) h += '<div class="lr-dim"></div>';
        else if (st.s.anim) h += '<div class="lr-dim out"></div>';
        if (st.done) h += bedBubble('Good morning, sun!', 262);
        return h;
      },
      tap(st, k) {
        if (k !== 'curtains' || st.data.curtains) return;
        st.data.curtains = true;
        st.s.anim = true;
        tone(392, 0.25, 0.04);
        setTimeout(() => tone(523, 0.3, 0.05), 160);
        SX.done(st, 'Swish! The sun is shining.');
      },
      after(st, box) { wearOn(box, st); st.s.anim = false; },
      auto(st) { st.data.curtains = true; st.s.anim = true; SX.done(st, 'Swish! The sun is shining.'); },
      demo: () => ({ sel: '[data-k="curtains"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="curtains"]', say: 'Tap the curtains.' })
    },
    {
      id: 'weather',
      bg: 'bedRoom',
      text: (st) => (st.s.pick == null ? 'Lumi looks out of the window. It is sunny and hot today.' : PICKS[st.s.pick].text),
      task: (st) => (st.done ? '' : 'What should Lumi wear today? Tap one.'),
      lumi: (st) => bedSpot(st),
      enter(st) { dressUpTo(st, 'weather'); st.data.bottom = null; },
      draw(st) {
        let h = roomThings(st);
        if (!st.done) h += SX.choices(PICKS.map((p) => ({ label: p.label, art: p.art() })), 'wear', { style: 'right:22px;top:22px;', cls: 'col lr-picks' });
        else h += bedBubble(PICKS[st.s.pick].bubble, 210);
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'wear' || st.done) return;
        const i = Number(d.v);
        st.s.pick = i;
        st.data.bottom = PICKS[i].bottom;
        st.s.fresh = 'bed';
        SX.ok();
        SX.done(st, PICKS[i].praise);
      },
      after(st, box) { wearOn(box, st); },
      auto(st) { st.s.pick = 0; st.data.bottom = 'shorts'; st.s.fresh = 'bed'; SX.done(st, PICKS[0].praise); },
      demo: () => ({ sel: '.lr-picks .sx-choice', tap: true }),
      guide: (st) => (st.done ? null : { sel: '.lr-picks .sx-choice', say: 'Tap what Lumi should wear.' })
    },
    {
      id: 'pyjamas',
      bg: 'bedRoom',
      text: 'Pyjamas off first. They go in the laundry basket to be washed.',
      task: (st) => (st.done ? '' : 'Drag the pyjamas into the laundry basket.'),
      lumi: (st) => bedSpot(st),
      enter(st) { dressUpTo(st, 'pyjamas'); },
      draw(st) {
        let h = roomThings(st, { basket: !st.done });
        if (st.data.wear.pj) {
          const b = lumiBox(BED_LUMI);
          const id = 'lrp' + (++uid);
          h += SX.at(b.x, b.y, b.w, b.h, `<svg viewBox="-14 -14 268 268" width="100%" height="100%" overflow="visible" aria-hidden="true">${wearDefs(id)}${pjArt(id)}</svg>`, { cls: 'sx-drag lr-pj', label: 'Pyjamas', z: 6 });
        }
        return h;
      },
      after(st, box) {
        wearOn(box, st, { noPj: true });
        if (st.done) return;
        SX.dragTo(box, '.lr-pj', '[data-id="basket"]', () => { st.data.wear.pj = false; st.data.pjIn = true; SX.ok(); SX.done(st, 'Into the basket. Pyjamas off!'); return true; }, { pad: 30, miss: () => SX.say('Put the pyjamas in the laundry basket.') });
      },
      auto(st) { st.data.wear.pj = false; st.data.pjIn = true; SX.done(st, 'Into the basket. Pyjamas off!'); },
      demo: () => ({ sel: '.lr-pj', to: '[data-id="basket"]' }),
      guide: (st) => (st.done ? null : { sel: '.lr-pj', to: '[data-id="basket"]', say: 'Drag the pyjamas into the basket.' })
    },
    putOnStep({
      id: 'under', min: 2, key: 'under', sel: '.lr-under',
      text: 'Clean underpants go on first. They are in the top drawer.',
      task: 'Drag the underpants onto Lumi.',
      praise: 'Clean underpants on!',
      miss: 'Bring the underpants to Lumi.',
      wear: (st) => { st.data.wear.under = true; },
      extra: (st) => SX.at(16, 248, 206, 90, drawerOpen(), { z: 3 }) + (st.data.wear.under ? '' : SX.at(86, 222, 100, 76, underFlat(), { cls: 'sx-drag lr-under', label: 'Underpants', z: 8 }))
    }),
    putOnStep({
      id: 'shirt', key: 'shirt', sel: '.lr-tee',
      text: 'Next, the T-shirt. The star picture goes at the front.',
      task: 'Drag the T-shirt onto Lumi.',
      praise: 'Head in, arms in. T-shirt on!',
      miss: 'Bring the T-shirt to Lumi.',
      wear: (st) => { st.data.wear.shirt = true; }
    }),
    putOnStep({
      id: 'bottoms', key: 'bottom', sel: '.lr-bottom',
      text: (st) => (bottomOf(st) === 'pants' ? 'Now the long pants. Lumi pulls them up.' : 'Now the shorts. Lumi pulls them up.'),
      task: (st) => (bottomOf(st) === 'pants' ? 'Drag the long pants onto Lumi.' : 'Drag the shorts onto Lumi.'),
      praise: (st) => (bottomOf(st) === 'pants' ? 'Long pants on!' : 'Shorts on!'),
      miss: 'Bring them to Lumi.',
      wear: (st) => { st.data.wear.bottom = bottomOf(st); }
    }),
    {
      id: 'socks',
      bg: 'bedDoor',
      text: 'Lumi goes to the front door. Socks go on first, then shoes.',
      task: (st) => (st.done ? '' : st.data.wear.sockL || st.data.wear.sockR ? 'Now the other sock, on the other foot.' : 'Drag a sock onto each foot.'),
      lumi: (st) => doorSpot(st),
      enter(st) { dressUpTo(st, 'socks'); },
      draw(st) {
        const w = st.data.wear;
        let h = rackShoes(st, !st.done);
        if (!st.done) h += footSpots(st, 'sock');
        // the socks still on the bench stay where they are (the first one taken is the one nearer the rack)
        const on = (w.sockL ? 1 : 0) + (w.sockR ? 1 : 0);
        for (let i = on; i < 2; i++) h += SX.at(SOCK_AT[i].x, SOCK_AT[i].y, 84, 100, sockSide(), { cls: 'sx-drag lr-sock', id: 'sock' + i, label: 'Sock', z: 8 });
        if (st.s.tip) h += doorBubble(st.s.tip, 180);
        else if (st.done) h += doorBubble('Cosy feet!', 170);
        return h;
      },
      after(st, box) {
        wearOn(box, st);
        if (st.done) return;
        SX.dragTo(box, '.lr-sock', '.lr-foot', (t) => {
          if (!putOn(st, 'sock', t.dataset.id.slice(4))) return false;
          SX.ok();
          if (st.data.wear.sockL && st.data.wear.sockR) SX.done(st, 'Two socks on. Cosy feet!');
          else { SX.render(); SX.say('One sock on. Now the other foot.'); }
          return true;
        }, { miss: () => SX.say('Put the sock on Lumi\'s foot.') });
        // a shoe before the socks: it goes back, and Lumi says socks first (never wrong)
        SX.dragTo(box, '.lr-shoe', '.lr-foot', () => {
          st.s.tip = 'Socks first!';
          tone(523, 0.15, 0.04);
          SX.render();
          SX.say('Socks first, then shoes. Put the socks on.');
          return false;
        });
      },
      auto(st) { st.data.wear.sockL = true; st.data.wear.sockR = true; st.s.tip = null; st.s.fresh = 'sockR'; SX.done(st, 'Two socks on. Cosy feet!'); },
      demo: (st) => ({ sel: '.lr-sock', to: `[data-id="foot${st.data.wear.sockL ? 'R' : 'L'}"]` }),
      guide: (st) => (st.done ? null : { sel: '.lr-sock', to: `[data-id="foot${st.data.wear.sockL ? 'R' : 'L'}"]`, say: 'Drag a sock onto Lumi\'s foot.' })
    },
    {
      id: 'shoes',
      bg: 'bedDoor',
      text: 'Socks are on. Now the shoes, one on each foot.',
      task: (st) => (st.done ? '' : st.data.wear.shoeL || st.data.wear.shoeR ? 'Now the other shoe.' : 'Drag a shoe onto each foot.'),
      lumi: (st) => doorSpot(st),
      enter(st) { dressUpTo(st, 'shoes'); },
      draw(st) {
        let h = rackShoes(st, !st.done);
        if (!st.done) h += footSpots(st, 'shoe');
        else h += doorBubble('Ready to go!', 180);
        return h;
      },
      after(st, box) {
        wearOn(box, st);
        if (st.done) return;
        SX.dragTo(box, '.lr-shoe', '.lr-foot', (t) => {
          if (!putOn(st, 'shoe', t.dataset.id.slice(4), level() >= 3 ? 'open' : 'shut')) return false;
          SX.ok();
          if (st.data.wear.shoeL && st.data.wear.shoeR) SX.done(st, 'Both shoes on. Well done!');
          else { SX.render(); SX.say('One shoe on. Now the other foot.'); }
          return true;
        }, { miss: () => SX.say('Put the shoe on Lumi\'s foot.') });
      },
      auto(st) { const v = level() >= 3 ? 'open' : 'shut'; st.data.wear.shoeL = v; st.data.wear.shoeR = v; st.s.fresh = 'shoeR'; SX.done(st, 'Both shoes on. Well done!'); },
      demo: (st) => ({ sel: '.lr-shoe', to: `[data-id="foot${st.data.wear.shoeL ? 'R' : 'L'}"]` }),
      guide: (st) => (st.done ? null : { sel: '.lr-shoe', to: `[data-id="foot${st.data.wear.shoeL ? 'R' : 'L'}"]`, say: 'Drag a shoe onto Lumi\'s foot.' })
    },
    {
      id: 'straps',
      min: 3,
      bg: 'bedDoor',
      text: 'The shoes have sticky straps. Press them down to close them.',
      task: (st) => (st.done ? '' : 'Tap each strap to close it.'),
      lumi: (st) => doorSpot(st),
      enter(st) { dressUpTo(st, 'straps'); },
      draw(st) {
        let h = rackShoes(st, false);
        if (!st.done) h += footSpots(st, 'strap');
        else h += doorBubble('Rrrip! Stuck!', 190);
        return h;
      },
      tap(st, k, el, d) {
        if (k !== 'strap' || st.done) return;
        const s = d.v;
        if (st.data.wear['shoe' + s] !== 'open') return;
        st.data.wear['shoe' + s] = 'shut';
        st.s.fresh = 'shoe' + s;
        [0, 50, 100].forEach((t, i) => setTimeout(() => tone(260 + i * 40, 0.05, 0.05), t));
        if (st.data.wear.shoeL === 'shut' && st.data.wear.shoeR === 'shut') SX.done(st, 'Rrrip! Both straps are closed.');
        else { SX.render(); SX.say('One strap closed. Now the other one.'); }
      },
      after(st, box) { wearOn(box, st); },
      auto(st) { st.data.wear.shoeL = 'shut'; st.data.wear.shoeR = 'shut'; SX.done(st, 'Rrrip! Both straps are closed.'); },
      demo: () => ({ sel: '.lr-strap', tap: true }),
      guide: (st) => (st.done ? null : { sel: '.lr-strap', say: 'Tap the strap.' })
    },
    {
      id: 'mirror',
      bg: 'bedMirror',
      text: 'Lumi checks in the mirror by the door. Is everything on?',
      task: (st) => (st.done ? '' : 'Tap the mirror to see Lumi.'),
      lumi: (st) => Object.assign({}, MIRROR_LUMI, { look: BARE, mood: st.done ? 'excited' : 'happy' }),
      enter(st) { dressUpTo(st, 'mirror'); },
      draw(st) {
        let h = checklist(st);
        if (!st.done) h += SX.at(314, 28, 472, 512, '', { k: 'mirror', label: 'The mirror', z: 6, cls: 'lr-mirrorhit' });
        else h += sparkles() + SX.bubble(334, 46, 'Looking good!', { w: 200 });
        return h;
      },
      tap(st, k) { if (k === 'mirror' && !st.done) { tone(880, 0.3, 0.06); SX.done(st, 'All dressed. Looking good, Lumi!'); } },
      after(st, box) { wearOn(box, st); },
      auto(st) { SX.done(st, 'All dressed. Looking good, Lumi!'); },
      demo: () => ({ sel: '[data-k="mirror"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="mirror"]', say: 'Tap the mirror.' })
    }
  ];
  SX.lessonWithLevels({ tut: 'dress', realText: 'In the morning: pyjamas off, then underpants, T-shirt, shorts, socks and shoes. One thing at a time.', realSay: 'got dressed for real' }, dressSteps);

  // ================================================================ Pack my school bag: things
  const BOOK = {
    maths: { label: 'Maths', c: '#4A86D9', dk: '#2F5FA8' },
    english: { label: 'English', c: '#E5534B', dk: '#B5332C' },
    science: { label: 'Science', c: '#4FA35A', dk: '#357A3F' },
    chinese: { label: 'Chinese', c: '#E8A92E', dk: '#B5801A' }
  };
  const SHELF = ['science', 'maths', 'chinese', 'english'];
  const NEED = ['maths', 'english'];
  // a picture for each subject, centred at cx, cy
  const bookPic = (id, cx, cy) => {
    const b = BOOK[id];
    if (id === 'maths') return `<path d="M${cx - 16} ${cy - 3}h12v-12h6v12h12v6h-12v12h-6v-12h-12z" fill="${b.dk}"/><path d="M${cx + 8} ${cy - 13}h10M${cx + 8} ${cy - 7}h10" stroke="${b.dk}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (id === 'english') return `<path d="M${cx - 17} ${cy + 12} L${cx - 8} ${cy - 13} L${cx + 1} ${cy + 12} M${cx - 13} ${cy + 3} H${cx - 3}" fill="none" stroke="${b.dk}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M${cx + 7} ${cy - 6}h10M${cx + 7} ${cy + 2}h10M${cx + 7} ${cy + 10}h8" stroke="${b.dk}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (id === 'science') return `<path d="M${cx - 6} ${cy - 16}h12v10l11 17q2 6 -4 6h-26q-6 0 -4 -6l11 -17z" fill="#fff" stroke="${b.dk}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${cx - 12} ${cy + 6}h24l4 7q1 4 -3 4h-26q-4 0 -3 -4z" fill="${b.c}"/><circle cx="${cx + 2}" cy="${cy - 1}" r="2.5" fill="${b.c}"/>`;
    return `<path d="M${cx} ${cy - 20}v5M${cx} ${cy + 15}v7" stroke="${b.dk}" stroke-width="3" stroke-linecap="round"/><ellipse cx="${cx}" cy="${cy}" rx="15" ry="13" fill="#E5534B"/><path d="M${cx} ${cy - 13}v26M${cx - 8} ${cy - 11}q-5 11 0 22M${cx + 8} ${cy - 11}q5 11 0 22" stroke="#B5332C" stroke-width="2" fill="none"/><rect x="${cx - 7}" y="${cy - 17}" width="14" height="5" rx="2" fill="${b.c}"/><rect x="${cx - 7}" y="${cy + 12}" width="14" height="5" rx="2" fill="${b.c}"/>`;
  };
  const bookArt = (id) => svg('0 0 104 132', `${LP.drop(52, 128, 46, 5)}${vol('<rect x="6" y="4" width="92" height="122" rx="7"/>', BOOK[id].c, { shade: 'h' })}<rect x="6" y="4" width="12" height="122" rx="5" fill="${BOOK[id].dk}" opacity=".55"/>
    <circle cx="57" cy="46" r="27" fill="#fff"/>${bookPic(id, 57, 46)}<rect x="17" y="86" width="80" height="28" rx="8" fill="#fff"/>${T(57, 106, BOOK[id].label, 16, LP.INK)}`);
  const bookMini = (id) => svg('0 0 64 80', `${vol('<rect x="4" y="3" width="56" height="74" rx="6"/>', BOOK[id].c, { shade: 'h' })}<circle cx="33" cy="40" r="22" fill="#fff"/><g transform="translate(33 40) scale(.8) translate(-33 -40)">${bookPic(id, 33, 40)}</g>`);
  const pencilCaseArt = () => svg('0 0 116 56', `${LP.drop(58, 53, 52, 4)}<path d="M30 16 l4 -14 4 14z" fill="#F4D35E"/><path d="M46 14 l4 -12 4 12z" fill="#E5534B"/><path d="M62 16 l4 -14 4 14z" fill="#5B8FD9"/>
    ${vol('<rect x="4" y="12" width="108" height="40" rx="18"/>', '#F4A259', { shade: 'v' })}<path d="M14 21 H100" stroke="#B5682A" stroke-width="3" stroke-dasharray="4 3"/>${vol('<rect x="98" y="16" width="14" height="10" rx="3"/>', '#C9D1D9')}${STAR(56, 36, 7, '#fff')}`);
  const bottleArt = (full) => svg('0 0 64 110', `${LP.drop(32, 106, 24, 4)}${vol('<rect x="13" y="24" width="38" height="80" rx="12"/>', '#DDF0FB', { shade: 'h' })}
    ${full ? '<rect x="15" y="40" width="34" height="62" rx="10" fill="#6FB8E8" opacity=".8"/><path d="M17 42 h30" stroke="#fff" stroke-width="2" opacity=".7"/>' : '<rect x="15" y="94" width="34" height="8" rx="4" fill="#6FB8E8" opacity=".5"/>'}
    <rect x="13" y="24" width="38" height="80" rx="12" fill="url(#lpGlass)"/>${vol('<rect x="16" y="6" width="32" height="22" rx="6"/>', '#2F9E95')}<path d="M40 8 q14 -2 12 12" fill="none" stroke="#21766E" stroke-width="4" stroke-linecap="round"/>`);
  const jugArt = () => svg('0 0 74 104', `${LP.drop(36, 100, 30, 4)}<path d="M56 30 q16 4 12 26 q-2 14 -14 16" fill="none" stroke="#B7D8EA" stroke-width="7" stroke-linecap="round"/>
    ${vol('<path d="M12 18 L4 10 H54 L58 24 V92 Q58 98 52 98 H18 Q12 98 12 92 Z"/>', '#E9F6FD', { shade: 'h' })}<path d="M14 40 H56 V92 Q56 96 52 96 H18 Q14 96 14 92 Z" fill="#6FB8E8" opacity=".7"/><path d="M12 18 L4 10 H54 L58 24 V92 Q58 98 52 98 H18 Q12 98 12 92 Z" fill="url(#lpGlass)"/>`);
  const snackArt = () => svg('0 0 96 60', `${LP.drop(48, 57, 42, 4)}${vol('<rect x="6" y="18" width="84" height="38" rx="10"/>', '#9FD8C9', { shade: 'v' })}${vol('<rect x="2" y="10" width="92" height="16" rx="8"/>', '#4FB3A9')}<rect x="10" y="20" width="10" height="10" rx="3" fill="#2F7E79"/><rect x="76" y="20" width="10" height="10" rx="3" fill="#2F7E79"/>
    ${vol('<circle cx="48" cy="40" r="9"/>', '#E5534B')}<path d="M48 31 q2 -5 6 -6" stroke="#6B4A3A" stroke-width="2.5" fill="none"/>`);
  const folderArt = () => svg('0 0 90 104', `${LP.drop(45, 100, 38, 4)}<rect x="16" y="4" width="58" height="40" rx="3" fill="#fff" stroke="#D5DBE1" stroke-width="2"/><path d="M24 14h40M24 22h40M24 30h28" stroke="#C9D1D9" stroke-width="3" stroke-linecap="round"/>
    ${vol('<path d="M6 22 H84 V96 Q84 100 80 100 H10 Q6 100 6 96 Z"/>', '#F4D35E', { shade: 'h' })}<path d="M6 22 H84" stroke="#C98A1E" stroke-width="3"/>${vol('<circle cx="45" cy="60" r="18"/>', '#FFFFFF', { lineOpacity: 0.3 })}${STAR(45, 60, 12, '#E5534B')}`);
  // the school bag, seen from the front: open at the top until it is zipped (zip 0..1), with a side pocket
  const BAG_C = '#7E64C8';
  const BAG_DK = '#5B45A8';
  const zipX = (t) => 28 + 164 * t;
  const zipY = (t) => 76 * (1 - 2 * t + 2 * t * t);
  function bagInside(list) {
    let h = '';
    const book = (x, id, rot) => `<g transform="rotate(${rot} ${x + 13} 100)">${vol(`<rect x="${x}" y="44" width="26" height="90" rx="3"/>`, BOOK[id].c, { shade: 'h' })}<rect x="${x + 3}" y="46" width="20" height="6" rx="2" fill="#fff" opacity=".85"/></g>`;
    if (list.includes('folder')) h += vol('<rect x="126" y="40" width="20" height="90" rx="3"/>', '#F4D35E', { shade: 'h' });
    if (list.includes('maths')) h += book(70, 'maths', -6);
    if (list.includes('english')) h += book(96, 'english', 3);
    if (list.includes('pencil')) h += `<g transform="rotate(8 150 70)">${vol('<rect x="122" y="58" width="56" height="22" rx="10"/>', '#F4A259')}</g>`;
    if (list.includes('snack')) h += `${vol('<rect x="64" y="74" width="54" height="30" rx="8"/>', '#9FD8C9')}${vol('<rect x="62" y="70" width="58" height="10" rx="5"/>', '#4FB3A9')}`;
    return h;
  }
  function bagArt(o) {
    const op = o || {};
    const id = 'lrb' + (++uid);
    const f = Math.max(0, Math.min(1, op.zip || 0));
    const xf = zipX(f);
    const TOP = 'M28 76 Q110 0 192 76';
    const LENS = 'M28 76 Q110 0 192 76 Q110 126 28 76 Z';
    const BODY = 'M28 76 Q110 0 192 76 L194 210 Q194 228 176 228 L44 228 Q26 228 26 210 Z';
    const FRONT = 'M28 76 Q110 126 192 76 L194 210 Q194 228 176 228 L44 228 Q26 228 26 210 Z';
    let h = `<defs><clipPath id="${id}o"><path d="${LENS}"/></clipPath><clipPath id="${id}r"><rect x="${xf.toFixed(1)}" y="0" width="${(240 - xf).toFixed(1)}" height="240"/></clipPath></defs>`;
    h += `${LP.drop(112, 232, 98, 8)}<path d="M92 30 Q110 0 128 30" fill="none" stroke="${BAG_DK}" stroke-width="10" stroke-linecap="round"/>`;
    h += vol(P(BODY), BAG_C, { shade: 'h' });
    if (f < 1) h += `<g clip-path="url(#${id}r)"><g clip-path="url(#${id}o)"><rect width="230" height="240" fill="#3A2E62"/>${bagInside(op.inside || [])}<path d="${LENS}" fill="url(#lpShadeV)" opacity=".35"/></g></g>`;
    h += vol(P(FRONT), BAG_C, { shade: 'h', line: false });
    h += `<path d="M192 76 L194 210 Q194 228 176 228 L44 228 Q26 228 26 210 L28 76" fill="none" stroke="${LP.INK}" stroke-opacity=".55" stroke-width="1.6"/>`;
    h += `<path d="${TOP}" fill="none" stroke="#D5CCF0" stroke-width="5" stroke-dasharray="3 3"/>`;
    if (f < 1) h += `<g clip-path="url(#${id}r)"><path d="M28 76 Q110 126 192 76" fill="none" stroke="#D5CCF0" stroke-width="5" stroke-dasharray="3 3"/><path d="M28 76 Q110 126 192 76" fill="none" stroke="${LP.INK}" stroke-opacity=".45" stroke-width="1.6"/></g>`;
    // front pocket, and the side pocket (with the water bottle in it)
    h += `${vol('<rect x="52" y="132" width="116" height="78" rx="24"/>', '#9B85DC', { shade: 'h' })}<path d="M64 148 H156" stroke="#D5CCF0" stroke-width="4" stroke-dasharray="3 3"/>${vol('<rect x="148" y="142" width="10" height="16" rx="3"/>', '#C9D1D9')}${STAR(110, 182, 11, '#F4D35E')}`;
    if (op.bottle) h += `${vol('<rect x="188" y="74" width="26" height="128" rx="9"/>', '#DDF0FB', { shade: 'h' })}<rect x="190" y="96" width="22" height="104" rx="8" fill="#6FB8E8" opacity=".8"/>${vol('<rect x="190" y="60" width="22" height="18" rx="5"/>', '#2F9E95')}`;
    h += `${vol('<path d="M186 124 H210 Q220 124 220 134 V200 Q220 212 208 212 H190 Z"/>', '#A99BD8', { shade: 'h' })}<path d="M190 140 H218 M190 156 H219 M190 172 H219 M190 188 H219" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>`;
    return svg('0 0 230 240', h);
  }
  if (!HOME.laundryBasket) HOME.laundryBasket = basketArt;
  if (!HOME.schoolBag) HOME.schoolBag = bagArt;

  // ================================================================ Pack my school bag: the room
  const DESK_TOP = 318;
  SX.bg.packDesk = () => `<defs><linearGradient id="lrDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E4C86"/><stop offset=".55" stop-color="#9B7BB5"/><stop offset="1" stop-color="#F2A97C"/></linearGradient></defs>
    ${wall('#F3E9DC', 440, '#E3D3BC', true)}${woodFloor(440, '#D9B48A', '#B98A5A')}<ellipse cx="560" cy="0" rx="480" ry="170" fill="url(#lpGlow)" opacity=".55"/>
    ${windowArt(20, 40, 192, 186, true)}
    ${vol('<rect x="226" y="198" width="476" height="14" rx="5"/>', '#C99A6B')}<path d="M260 212 v16 h18 M668 212 v16 h-18" stroke="#9AA6B2" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${LP.drop(510, 476, 300, 10)}<path d="M240 334v136M776 334v136" stroke="#A87B50" stroke-width="16" stroke-linecap="round"/>
    ${vol('<rect x="560" y="334" width="210" height="44" rx="6"/>', '#D9B48A', { shade: 'v' })}<rect x="645" y="352" width="40" height="8" rx="4" fill="#A87B50"/>
    ${vol(`<rect x="222" y="${DESK_TOP - 10}" width="572" height="14" rx="5"/>`, '#E8C9A0')}${vol(`<rect x="222" y="${DESK_TOP + 2}" width="572" height="18" rx="5"/>`, '#C99A6B', { shade: 'v' })}`;
  SX.bg.packDoor = () => frontDoor(true);
  const DESK_LUMI = { x: 124, y: 552, h: 240 };
  const BAG = { x: 836, y: 290 };
  const TT_AT = { x: 730, y: 20, w: 368, h: 252 };
  const BOOK_X = (i) => 238 + i * 112;
  const ITEM = { jug: [74, 104], pencil: [116, 56], bottle: [64, 110], snack: [96, 60], folder: [90, 104] };
  const LABEL = { jug: 'Water jug', pencil: 'Pencil case', bottle: 'Water bottle', snack: 'Snack box', folder: 'Homework folder' };
  // where the things on the desk stand (only the ones this level uses)
  function deskSpots() {
    const lv = level();
    const list = ['jug', 'pencil', 'bottle', 'snack', 'folder'].filter((k) => ((k === 'jug' || k === 'snack') ? lv >= 2 : k === 'folder' ? lv >= 3 : true));
    const x0 = 236;
    const x1 = 724;
    const sum = list.reduce((n, k) => n + ITEM[k][0], 0);
    const gap = Math.min(40, (x1 - x0 - sum) / (list.length + 1));
    let x = x0 + (x1 - x0 - sum - gap * (list.length - 1)) / 2;
    const out = {};
    list.forEach((k) => { out[k] = { x, y: DESK_TOP + 2 - ITEM[k][1], w: ITEM[k][0], h: ITEM[k][1] }; x += ITEM[k][0] + gap; });
    return out;
  }
  const ART = { jug: jugArt, pencil: pencilCaseArt, bottle: (st) => bottleArt(st.data.bottle !== 'empty'), snack: snackArt, folder: folderArt };
  // o.drag = the thing to drag now; o.target = the thing that is a drop target (the bottle, when filling)
  function deskThings(st, o) {
    const op = o || {};
    const spots = deskSpots();
    const inBag = st.data.inBag || [];
    return Object.keys(spots).map((k) => {
      if (k === 'bottle' ? st.data.bottle === 'bag' : inBag.includes(k)) return '';
      const p = spots[k];
      const opt = op.drag === k ? { cls: `sx-drag lr-${k}`, id: k, label: LABEL[k], z: 8 } : op.target === k ? { target: true, id: k, label: LABEL[k], z: 4, cls: st.s.fresh === k ? 'lr-in' : '' } : { z: 4, cls: st.s.fresh === k ? 'lr-in' : '' };
      return SX.at(p.x, p.y, p.w, p.h, ART[k](st), opt);
    }).join('');
  }
  const shelfBooks = (st, drag) => SHELF.map((id, i) => ((st.data.inBag || []).includes(id) ? '' : SX.at(BOOK_X(i), 66, 104, 132, bookArt(id), drag ? { cls: 'sx-drag lr-book', id: 'book-' + id, label: `${BOOK[id].label} book`, z: 6 } : { z: 3 }))).join('');
  function timetable(st, k) {
    const packed = st.data.inBag || [];
    const row = (id, tick) => `<span class="lr-tt-row"><span class="lr-tt-pic">${bookMini(id)}${tick ? `<span class="lr-tt-tick">${ic('check', 16)}</span>` : ''}</span><span class="lr-tt-name">${esc(BOOK[id].label)}</span></span>`;
    const html = `<span class="lr-tt ${st.data.tt ? 'on' : ''}"><span class="lr-tt-pin"></span><span class="lr-tt-title">My timetable</span><span class="lr-tt-cols">
      <span class="lr-tt-col today"><span class="lr-tt-day">Today</span>${['chinese', 'science'].map((b) => row(b)).join('')}</span>
      <span class="lr-tt-col tmr"><span class="lr-tt-day">Tomorrow</span>${NEED.map((b) => row(b, packed.includes(b))).join('')}</span></span></span>`;
    return SX.at(TT_AT.x, TT_AT.y, TT_AT.w, TT_AT.h, html, { k, label: 'Timetable', z: 3, cls: `lr-ttbox ${k ? 'ln-glow' : ''}` });
  }
  const bagEl = (st, target) => SX.at(BAG.x, BAG.y, 230, 240, bagArt({ inside: st.data.inBag, bottle: st.data.bottle === 'bag', zip: st.data.zip }), { target: !!target, id: 'bag', label: 'School bag', z: 4, cls: st.s.fresh === 'bag' ? 'lr-bump' : '' });
  const deskBubble = (text, w) => SX.bubble(18, 248, text, { w: w || 230 });
  const deskSpot = (st, o) => Object.assign({}, DESK_LUMI, { look: { back: 'none' }, mood: st.done ? 'excited' : 'happy' }, o || {});
  const P_ORDER = ['timetable', 'books', 'pencil', 'fill', 'bottle', 'snack', 'folder', 'zip', 'door'];
  function packUpTo(st, id) {
    const at = P_ORDER.indexOf(id);
    const past = (k) => P_ORDER.indexOf(k) < at;
    const lv = level();
    const inBag = [];
    if (past('books')) inBag.push('maths', 'english');
    if (past('pencil')) inBag.push('pencil');
    if (past('snack') && lv >= 2) inBag.push('snack');
    if (past('folder') && lv >= 3) inBag.push('folder');
    st.data.inBag = inBag;
    st.data.bottle = past('bottle') ? 'bag' : lv < 2 || past('fill') ? 'full' : 'empty';
    st.data.tt = past('timetable');
    st.data.zip = past('zip') ? 1 : 0;
  }
  // a "put it in the bag" step for one thing on the desk
  function intoBag(o) {
    const to = o.pocket ? '[data-id="pocket"]' : '[data-id="bag"]';
    const put = (st) => { if (o.key === 'bottle') st.data.bottle = 'bag'; else st.data.inBag = (st.data.inBag || []).concat(o.key); st.s.fresh = 'bag'; };
    return {
      id: o.id,
      min: o.min,
      bg: 'packDesk',
      text: o.text,
      task: (st) => (st.done ? '' : o.task),
      lumi: (st) => deskSpot(st),
      enter(st) { packUpTo(st, o.id); },
      draw(st) {
        let h = timetable(st) + shelfBooks(st) + deskThings(st, { drag: st.done ? null : o.key }) + bagEl(st, !st.done);
        if (o.pocket && !st.done) h += SX.at(BAG.x + 168, BAG.y + 96, 66, 130, '', { target: true, id: 'pocket', label: 'Side pocket', z: 5 });
        if (st.done) h += deskBubble(o.bubble, o.bubbleW);
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, `.lr-${o.key}`, o.pocket ? '[data-id="pocket"], [data-id="bag"]' : '[data-id="bag"]', () => {
          put(st);
          tone(700, 0.12, 0.05);
          SX.done(st, o.praise);
          return true;
        }, { pad: 30, miss: () => SX.say(o.miss) });
      },
      auto(st) { put(st); SX.done(st, o.praise); },
      demo: () => ({ sel: `.lr-${o.key}`, to }),
      guide: (st) => (st.done ? null : { sel: `.lr-${o.key}`, to, say: o.task })
    };
  }
  const nextBook = (st) => NEED.find((b) => !(st.data.inBag || []).includes(b)) || NEED[0];
  const packSteps = [
    {
      id: 'timetable',
      bg: 'packDesk',
      text: 'It is the evening before school. Lumi packs his bag for tomorrow.',
      task: (st) => (st.done ? '' : 'Tap the timetable to see tomorrow\'s lessons.'),
      lumi: (st) => deskSpot(st),
      enter(st) { packUpTo(st, 'timetable'); },
      draw(st) {
        let h = timetable(st, st.done ? null : 'tt') + shelfBooks(st) + deskThings(st) + bagEl(st);
        if (st.done) h += deskBubble('Maths and English!', 230);
        return h;
      },
      tap(st, k) { if (k === 'tt' && !st.done) { st.data.tt = true; tone(660, 0.2, 0.05); SX.done(st, 'Tomorrow is Maths and English.'); } },
      auto(st) { st.data.tt = true; SX.done(st, 'Tomorrow is Maths and English.'); },
      demo: () => ({ sel: '[data-k="tt"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="tt"]', say: 'Tap the timetable.' })
    },
    {
      id: 'books',
      bg: 'packDesk',
      text: 'Tomorrow is Maths and English. Find those books on the shelf.',
      task: (st) => (st.done ? '' : (st.data.inBag || []).length ? `Now drag the ${BOOK[nextBook(st)].label} book into the bag.` : 'Drag the Maths and English books into the bag.'),
      lumi: (st) => deskSpot(st),
      enter(st) { packUpTo(st, 'books'); },
      draw(st) {
        let h = timetable(st) + shelfBooks(st, !st.done) + deskThings(st) + bagEl(st, !st.done);
        if (st.s.tip) h += deskBubble(st.s.tip, 180);
        else if (st.done) h += deskBubble('Both books in!', 200);
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lr-book', '[data-id="bag"]', (t, el) => {
          const id = el.dataset.id.slice(5);
          if (!NEED.includes(id)) {
            // another day's book goes gently back to the shelf
            st.s.tip = 'Not today!';
            tone(523, 0.15, 0.04);
            SX.render();
            SX.say(`Not today. ${BOOK[id].label} is not on tomorrow's timetable, so it stays on the shelf.`);
            return false;
          }
          st.data.inBag = (st.data.inBag || []).concat(id);
          st.s.tip = null;
          st.s.fresh = 'bag';
          tone(700, 0.12, 0.05);
          if (NEED.every((b) => st.data.inBag.includes(b))) SX.done(st, 'Maths and English are in the bag.');
          else { SX.render(); SX.say(`${BOOK[id].label} is in. Now the ${BOOK[nextBook(st)].label} book.`); }
          return true;
        }, { pad: 30, miss: () => SX.say('Put the book in the bag.') });
      },
      auto(st) { st.data.inBag = NEED.slice(); st.s.tip = null; st.s.fresh = 'bag'; SX.done(st, 'Maths and English are in the bag.'); },
      demo: (st) => ({ sel: `[data-id="book-${nextBook(st)}"]`, to: '[data-id="bag"]' }),
      guide: (st) => (st.done ? null : { sel: `[data-id="book-${nextBook(st)}"]`, to: '[data-id="bag"]', say: `Drag the ${BOOK[nextBook(st)].label} book into the bag.` })
    },
    intoBag({ id: 'pencil', key: 'pencil', text: 'Lumi needs his pencil case to write and draw.', task: 'Drag the pencil case into the bag.', praise: 'The pencil case is in.', bubble: 'Pencils ready!', bubbleW: 190, miss: 'Put the pencil case in the bag.' }),
    {
      id: 'fill',
      min: 2,
      bg: 'packDesk',
      text: 'The water bottle is empty. Lumi fills it with water from the jug.',
      task: (st) => (st.done ? '' : 'Drag the jug to the water bottle.'),
      lumi: (st) => deskSpot(st),
      enter(st) { packUpTo(st, 'fill'); },
      draw(st) {
        let h = timetable(st) + shelfBooks(st) + deskThings(st, { drag: st.done ? null : 'jug', target: st.done ? null : 'bottle' }) + bagEl(st);
        if (st.done) h += deskBubble('Glug, glug!', 170);
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lr-jug', '[data-id="bottle"]', () => {
          st.data.bottle = 'full';
          st.s.fresh = 'bottle';
          [0, 140, 280].forEach((t) => setTimeout(() => tone(330, 0.1, 0.04), t));
          SX.done(st, 'Glug, glug. The bottle is full.');
          return false;
        }, { pad: 30, miss: () => SX.say('Bring the jug to the bottle.') });
      },
      auto(st) { st.data.bottle = 'full'; st.s.fresh = 'bottle'; SX.done(st, 'Glug, glug. The bottle is full.'); },
      demo: () => ({ sel: '.lr-jug', to: '[data-id="bottle"]' }),
      guide: (st) => (st.done ? null : { sel: '.lr-jug', to: '[data-id="bottle"]', say: 'Drag the jug to the bottle.' })
    },
    intoBag({ id: 'bottle', key: 'bottle', pocket: true, text: 'Water to drink at school. The bottle goes in the side pocket.', task: 'Drag the water bottle into the side pocket.', praise: 'In the side pocket, easy to reach.', bubble: 'Water ready!', bubbleW: 180, miss: 'Put the bottle in the side pocket.' }),
    intoBag({ id: 'snack', min: 2, key: 'snack', text: 'A snack for recess, when Lumi gets hungry.', task: 'Drag the snack box into the bag.', praise: 'The snack box is in.', bubble: 'Yum, for recess!', bubbleW: 210, miss: 'Put the snack box in the bag.' }),
    intoBag({ id: 'folder', min: 3, key: 'folder', text: 'Lumi finished his homework. The teacher needs to see it.', task: 'Drag the homework folder into the bag.', praise: 'Homework in. The teacher will be happy!', bubble: 'Homework done!', bubbleW: 210, miss: 'Put the folder in the bag.' }),
    {
      id: 'zip',
      bg: 'packDesk',
      text: 'Everything is in. Zip the bag closed, so nothing falls out.',
      task: (st) => (st.done ? '' : 'Drag the zip along the top of the bag.'),
      lumi: (st) => deskSpot(st),
      enter(st) { packUpTo(st, 'zip'); },
      draw(st) {
        let h = timetable(st) + shelfBooks(st) + deskThings(st) + bagEl(st);
        if (!st.done) {
          const f = st.data.zip;
          h += SX.at(BAG.x + zipX(1) - 34, BAG.y + zipY(1) - 34, 68, 68, '<span class="lr-zipend"></span>', { id: 'zipend', z: 8 });
          h += SX.at(BAG.x + zipX(f) - 46, BAG.y + zipY(f) - 46, 92, 92, svg('0 0 92 92', `<circle cx="46" cy="46" r="40" fill="#FFF6C8" opacity=".55"/>${vol('<rect x="36" y="38" width="20" height="14" rx="4"/>', '#C9D1D9')}${vol('<path d="M40 50 h12 l4 30 q-10 8 -20 0 z"/>', '#F4D35E')}<circle cx="46" cy="72" r="4" fill="#3A2E62"/>`), { cls: 'lr-zippull', label: 'The zip', z: 9 });
        } else h += deskBubble('Zzzip!', 130);
        return h;
      },
      after(st, box) {
        if (st.done) return;
        const pull = box.querySelector('.lr-zippull');
        if (!pull || pull.dataset.wired) return;
        pull.dataset.wired = '1';
        let ticks = 0;
        A.SG.drag(pull, box, {
          noMove: true,
          move(p) {
            if (st.done) return;
            const t = Math.max(0, Math.min(1, (p.x - BAG.x - 28) / 164));
            if (t <= st.data.zip) return;
            st.data.zip = t > 0.93 ? 1 : t;
            const bag = box.querySelector('[data-id="bag"]');
            if (bag) bag.innerHTML = bagArt({ inside: st.data.inBag, bottle: st.data.bottle === 'bag', zip: st.data.zip });
            pull.style.left = `${Math.round(BAG.x + zipX(st.data.zip) - 46)}px`;
            pull.style.top = `${Math.round(BAG.y + zipY(st.data.zip) - 46)}px`;
            if (Math.floor(st.data.zip * 10) > ticks) { ticks = Math.floor(st.data.zip * 10); tone(420 + ticks * 50, 0.04, 0.03); }
            if (st.data.zip >= 1) SX.done(st, 'Zzzip! The bag is closed.');
          },
          drop() { if (!st.done) SX.say('Keep going, all the way along the top.'); return true; },
          tap: () => SX.say('Hold the zip and slide it along the top of the bag.')
        });
      },
      auto(st) { st.data.zip = 1; SX.done(st, 'Zzzip! The bag is closed.'); },
      demo: () => ({ sel: '.lr-zippull', to: '[data-id="zipend"]' }),
      guide: (st) => (st.done ? null : { sel: '.lr-zippull', to: '[data-id="zipend"]', say: 'Drag the zip along the top of the bag.' })
    },
    {
      id: 'door',
      bg: 'packDoor',
      text: 'Lumi puts his bag by the front door, so it is ready in the morning.',
      task: (st) => (st.done ? '' : 'Drag the bag to the front door.'),
      lumi: (st) => ({ x: 150, y: 548, h: 230, look: { back: 'none' }, mood: st.done ? 'excited' : 'happy' }),
      enter(st) { packUpTo(st, 'door'); },
      draw(st) {
        const at = st.done ? { x: 536, y: 300 } : { x: 288, y: 300 };
        let h = SX.at(SHOE_AT.L.x, SHOE_AT.L.y, 100, 64, shoeSide(true), { z: 3 }) + SX.at(SHOE_AT.R.x, SHOE_AT.R.y, 100, 64, shoeSide(false), { z: 3 });
        if (!st.done) h += SX.at(532, 300, 236, 246, svg('0 0 236 246', '<ellipse cx="118" cy="226" rx="104" ry="16" fill="#fff" fill-opacity=".35" stroke="#2F9E95" stroke-width="4" stroke-dasharray="12 8"/>'), { target: true, id: 'spot', label: 'By the front door', z: 2 });
        h += SX.at(at.x, at.y, 230, 240, bagArt({ inside: st.data.inBag, bottle: true, zip: 1 }), st.done ? { z: 4 } : { cls: 'sx-drag lr-bagdrag', label: 'School bag', z: 8 });
        if (st.done) h += SX.bubble(300, 110, 'Ready for tomorrow!', { w: 250 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lr-bagdrag', '[data-id="spot"]', () => { tone(600, 0.15, 0.05); SX.done(st, 'All ready for school tomorrow!'); return true; }, { pad: 30, miss: () => SX.say('Put the bag by the door.') });
      },
      auto(st) { SX.done(st, 'All ready for school tomorrow!'); },
      demo: () => ({ sel: '.lr-bagdrag', to: '[data-id="spot"]' }),
      guide: (st) => (st.done ? null : { sel: '.lr-bagdrag', to: '[data-id="spot"]', say: 'Drag the bag to the door.' })
    }
  ];
  SX.lessonWithLevels({ tut: 'pack', realText: 'Pack your bag the night before: look at the timetable, then books, pencil case and water bottle. Zip it up.', realSay: 'packed your school bag for real' }, packSteps);
})();
