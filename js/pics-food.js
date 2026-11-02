/*
  pics-food.js
  Drawn pictures (in place of emoji) for food and drink, the kitchen, animals and their food, plants,
  and bathroom and health things. Soft, rounded and shaded like the rest of Lumi (see pics.js).
  Keys are the emoji the data files use, written as escapes so this file holds no emoji.
  Each picture is on a 48 x 48 grid.
*/
(function () {
  'use strict';
  const LP = window.LP;
  if (!LP) return;
  const V = (m, c, o) => LP.vol(m, c, o);
  const D = (cx, cy, rx, ry) => LP.drop(cx, cy, rx, ry || 3);
  const S = LP.shine;
  const L = LP.line;
  const INK = LP.INK;
  const add = (key, label, svg) => LP.add(key, { label, svg });
  // overlapping round shapes that share one outer outline (no lines inside)
  const blob = (m, c) => `<g fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="3.2">${m}</g>${V(m, c, { line: false })}`;
  // friendly animal eyes (not copied from emoji)
  const eyes = (x1, x2, y, r) => `<circle cx="${x1}" cy="${y}" r="${r || 1.9}" fill="${INK}"/><circle cx="${x2}" cy="${y}" r="${r || 1.9}" fill="${INK}"/><circle cx="${x1 + 0.6}" cy="${y - 0.7}" r=".6" fill="#fff"/><circle cx="${x2 + 0.6}" cy="${y - 0.7}" r=".6" fill="#fff"/>`;
  const bowl = (c, rim) => `${D(24, 43, 17)}${V('<path d="M6 24h36c0 10-8 17-18 17S6 34 6 24z"/>', c)}${V('<ellipse cx="24" cy="24" rx="18" ry="4.5"/>', rim || '#FFFFFF', { lineOpacity: 0.4 })}`;

  // ---------------------------------------------------------------- food
  add('\u{1F34C}', 'Banana', `${D(24, 42, 15)}${V('<path d="M8 14c2 14 12 24 28 22 4 0 6-2 4-4-12 2-22-6-26-20-1-3-6-2-6 2z"/>', '#FFD84D')}
    ${V('<path d="M8 14c-1-3 0-6 2-7l3 3c-2 1-3 2-3 4z"/>', '#8A6A3A')}<path d="M14 18c4 8 11 13 20 14" fill="none" stroke="#E0B22A" stroke-width="1.6" stroke-linecap="round"/>${S(16, 17, 1.6, 4, -40)}`);
  add('\u{1F34E}', 'Apple', `${D(24, 43, 15)}${V('<path d="M24 14c-6-4-17-2-17 11 0 10 7 17 12 17 2 0 3-1 5-1s3 1 5 1c5 0 12-7 12-17 0-13-11-15-17-11z"/>', '#E5484D')}
    ${L('M24 14c0-4 1-7 3-9', '#7A4E2A', 2.4)}${V('<path d="M26 10c3-5 9-6 11-4-2 4-7 6-11 4z"/>', '#6BBF59')}${S(15, 21, 2.6, 4.5, 20)}`);
  add('\u{1F357}', 'Chicken', `${D(24, 43, 16)}${V('<path d="M34 12c6 3 7 12 2 17-4 4-10 4-13 1L13 38c-2 2-5 1-6-1s0-4 2-5l9-9c-3-4-2-10 3-13 4-2 9-2 13 2z"/>', '#D9893F')}
    ${V('<circle cx="9" cy="37" r="3.6"/><circle cx="12" cy="40" r="3.2"/>', '#FFF6E8')}${S(28, 15, 3, 2, -30)}<path d="M23 23c3 2 7 2 10 0" fill="none" stroke="#B5682A" stroke-width="1.4" stroke-linecap="round"/>`);
  add('\u{1F35A}', 'Rice', `${bowl('#6FA8DC')}${V('<path d="M8 24c0-8 7-13 16-13s16 5 16 13c-5 2-10 3-16 3s-11-1-16-3z"/>', '#FFFEFA', { lineOpacity: 0.35 })}
    ${[[16, 18], [22, 15], [28, 17], [33, 20], [19, 22], [27, 22]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry=".8" fill="#E6E0D2"/>`).join('')}`);
  add('\u{1F35C}', 'Noodles', `${bowl('#E07A5F', '#F6D9A8')}<path d="M10 24c4-3 6 2 9-1s5 2 8-1 5 2 8-1 4 2 4 3" fill="none" stroke="#F4C35A" stroke-width="2.6" stroke-linecap="round"/>
    ${V('<circle cx="17" cy="21" r="3"/>', '#F6E7D3', { lineOpacity: 0.4 })}${V('<path d="M27 19h8l-1 3h-7z"/>', '#7FB069', { lineOpacity: 0.4 })}${L('M30 4l6 20M35 3l3 21', '#C99A6B', 2)}
    <path d="M18 9c-2-3 2-4 0-7M24 10c-2-3 2-4 0-7" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`);
  add('\u{1F35E}', 'Bread', `${D(24, 42, 17)}${V('<path d="M8 22c-4-2-4-10 4-12 4-2 20-2 24 0 8 2 8 10 4 12v14c0 2-2 4-4 4H12c-2 0-4-2-4-4z"/>', '#E3A55C')}
    ${V('<path d="M12 22c-2-1-2-6 3-7 4-1 14-1 18 0 5 1 5 6 3 7v12c0 2-1 3-3 3H15c-2 0-3-1-3-3z"/>', '#FBE6C2', { lineOpacity: 0.3 })}${S(16, 14, 3, 1.5, -10)}`);
  add('\u{1F366}', 'Ice cream', `${D(24, 44, 8)}${V('<path d="M15 24h18l-8 19c-.4 1-1.6 1-2 0z"/>', '#E3A55C')}<path d="M17 28l12 6M19 33l8 4M31 28l-12 6M29 33l-8 4" stroke="#C07F3A" stroke-width="1.2"/>
    ${V('<path d="M13 24c-3-1-3-6 1-7 0-6 6-9 10-7 4-2 10 1 10 7 4 1 4 6 1 7z"/>', '#F7B6CD')}${V('<circle cx="24" cy="8" r="3"/>', '#E5484D')}${S(18, 15, 2.6, 1.6, -20)}`);
  add('\u{1F36A}', 'Biscuit', `${D(24, 42, 16)}${V('<circle cx="24" cy="24" r="17"/>', '#D9A066')}${[[17, 18], [28, 16], [31, 27], [20, 30], [25, 23], [14, 26]].map(([x, y]) => V(`<circle cx="${x}" cy="${y}" r="2.3"/>`, '#6B4226', { lineOpacity: 0.2 })).join('')}${S(16, 13, 3, 1.6, -30)}`);
  add('\u{1F371}', 'Lunch box', `${D(24, 43, 19)}${V('<rect x="5" y="12" width="38" height="28" rx="6"/>', '#4FB3A9')}${V('<rect x="8" y="15" width="32" height="22" rx="3"/>', '#FFF8EC', { lineOpacity: 0.3 })}
    <path d="M24 15v22M24 26h16" stroke="#C9B9A2" stroke-width="1.6"/>${V('<path d="M10 28c0-6 4-10 7-10s7 4 7 10z"/>', '#FFFEFA', { lineOpacity: 0.3 })}${V('<circle cx="29" cy="20.5" r="3"/><circle cx="35" cy="20.5" r="3"/>', '#E5484D', { lineOpacity: 0.3 })}${V('<path d="M27 29h11v6H27z"/>', '#7FB069', { lineOpacity: 0.3 })}`);
  add('\u{1F373}', 'Cooking', `${D(22, 43, 16)}${V('<ellipse cx="21" cy="27" rx="16" ry="13"/>', '#3E4A5A')}${L('M34 32l11 9', '#2B2F3A', 5)}
    ${V('<path d="M10 26c0-6 6-9 11-8 6-1 12 3 11 9-1 5-7 7-11 6-6 1-11-1-11-7z"/>', '#FFFFFF', { lineOpacity: 0.3 })}${V('<circle cx="21" cy="25" r="5"/>', '#FFC627')}${S(19, 23, 1.6, 1)}`);
  add('\u{1F37D}', 'Plate', `${D(24, 41, 20)}${V('<ellipse cx="24" cy="30" rx="18" ry="9"/>', '#FFFFFF')}<ellipse cx="24" cy="29" rx="11" ry="5" fill="#EEF0F2"/>
    ${L('M5 8v22M3 8v6c0 2 4 2 4 0V8', '#9AA6B2', 2)}${V('<path d="M43 8c-3 2-4 7-3 11h3v12h-2"/>', '#C9D1D9', { lineOpacity: 0.4 })}${L('M43 19v12', '#9AA6B2', 2.4)}`);
  add('\u{1F382}', 'Birthday cake', `${D(24, 44, 19)}${V('<rect x="6" y="24" width="36" height="17" rx="4"/>', '#F7B6CD')}${V('<path d="M6 26c4 4 7-2 12 2s7-2 12 2 7-2 12 0v-4H6z"/>', '#FFFFFF', { lineOpacity: 0.3 })}
    ${[14, 24, 34].map((x) => `${V(`<rect x="${x - 1.6}" y="13" width="3.2" height="11" rx="1"/>`, '#8EC5F2', { lineOpacity: 0.4 })}${V(`<path d="M${x} 6c3 3 2 6 0 6s-3-3 0-6z"/>`, '#FFB627', { lineOpacity: 0.3 })}`).join('')}
    ${[[12, 34], [20, 36], [28, 33], [36, 36]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#E5484D"/>`).join('')}`);
  add('\u{1F944}', 'Spoon', `${D(24, 43, 12)}${V('<ellipse cx="17" cy="14" rx="8" ry="10" transform="rotate(-35 17 14)"/>', '#C9D1D9')}<ellipse cx="17" cy="14" rx="5" ry="7" transform="rotate(-35 17 14)" fill="url(#lpMetal)" opacity=".8"/>
    ${V('<path d="M21 20l17 18c1.5 1.5 0 4-2 3L19 22z"/>', '#C9D1D9')}${S(14, 11, 1.6, 3, -35)}`);
  add('\u{1F955}', 'Carrot', `${D(22, 43, 12)}${V('<path d="M30 14c4 3 4 8 1 11L13 42c-2 1-4-1-3-3l13-22c2-4 5-5 7-3z"/>', '#F28C28')}
    <path d="M18 30l4 2M22 24l4 2M15 36l3 1" stroke="#C9661A" stroke-width="1.4" stroke-linecap="round"/>${V('<path d="M30 14c0-6 2-9 4-10 0 4 0 7-2 10zM31 15c4-4 9-5 11-4-2 3-6 5-10 5zM30 13c-3-5-2-9 0-10 2 3 2 7 1 10z"/>', '#6BBF59')}`);
  add('\u{1F95A}', 'Egg', `${D(24, 43, 13)}${V('<path d="M24 6c8 0 13 13 13 21s-6 14-13 14-13-6-13-14S16 6 24 6z"/>', '#FFF6E8')}${S(19, 16, 2.6, 5, 20)}`);
  add('\u{1F95B}', 'Milk', `${D(24, 44, 11)}${V('<path d="M14 10h20l-2 32c0 1-1 2-2 2H18c-1 0-2-1-2-2z"/>', '#EAF4FA')}<path d="M15.4 18h17.2l-1.5 23H16.9z" fill="#FFFFFF"/>
    <path d="M14 10h20l-2 32c0 1-1 2-2 2H18c-1 0-2-1-2-2z" fill="url(#lpGlass)"/>${S(18, 24, 1.4, 6)}`);
  add('\u{1F963}', 'Cereal', `${bowl('#F4A259')}${[[13, 21], [18, 18], [24, 20], [30, 18], [35, 21], [21, 23], [28, 23]].map(([x, y]) => V(`<circle cx="${x}" cy="${y}" r="2.6"/>`, '#E3A55C', { lineOpacity: 0.3 })).join('')}${V('<path d="M30 6l6 16-2 1-6-16z"/>', '#C9D1D9', { lineOpacity: 0.4 })}`);
  add('\u{1F964}', 'Cup with straw', `${D(24, 44, 11)}${L('M27 14l4-11 6 1', '#E5484D', 2.6)}${V('<path d="M12 14h24l-3 28c0 1-1 2-2 2H17c-1 0-2-1-2-2z"/>', '#8EC5F2')}${V('<rect x="10" y="11" width="28" height="5" rx="2"/>', '#FFFFFF', { lineOpacity: 0.4 })}<rect x="15" y="24" width="18" height="8" rx="2" fill="#fff" opacity=".7"/>${S(17, 30, 1.4, 6)}`);
  add('\u{1F966}', 'Broccoli', `${D(24, 44, 13)}${V('<path d="M20 26h8l2 16h-12z"/>', '#9CCB6A')}${blob('<circle cx="16" cy="20" r="8"/><circle cx="32" cy="20" r="8"/><circle cx="24" cy="14" r="9"/><circle cx="24" cy="24" r="7"/>', '#4E9A45')}
    ${[[14, 17], [22, 11], [30, 15], [26, 20], [34, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#3C7A35"/>`).join('')}${S(19, 10, 2.6, 1.6, -20)}`);
  add('\u{1F969}', 'Dog food', `${D(24, 43, 19)}${V('<path d="M5 26h38l-3 13c0 2-2 3-4 3H12c-2 0-4-1-4-3z"/>', '#E07A5F')}${V('<ellipse cx="24" cy="26" rx="19" ry="5"/>', '#C2614A')}
    ${[[14, 24], [20, 22], [27, 23], [33, 25], [24, 26], [17, 27]].map(([x, y]) => V(`<circle cx="${x}" cy="${y}" r="2.4"/>`, '#9A5A34', { lineOpacity: 0.2 })).join('')}${V('<path d="M18 34c0-2 3-2 3 0 0-2 3-2 3 0 0 2-3 4-3 4s-3-2-3-4z"/>', '#FFFFFF', { lineOpacity: 0.2 })}`);
  add('\u{1F990}', 'Shrimp', `${D(24, 43, 15)}${V('<path d="M36 14c-12-6-27 2-27 14 0 6 4 10 10 10 4 0 6-2 6-4-5 0-9-2-9-6 0-6 8-10 16-8z"/>', '#F28C5A')}
    ${V('<path d="M18 38l-6 5 2-7zM18 38l1 7 3-6z"/>', '#E46A3E')}<path d="M16 20c2 3 2 6 0 9M22 17c2 3 2 7 0 10M28 16c1 3 1 6-1 9" fill="none" stroke="#D45A30" stroke-width="1.4"/>${eyes(33, 33, 15, 1.6)}${L('M36 14c4-4 8-6 10-4M35 13c2-5 4-8 7-8', '#D45A30', 1.2)}`);
  add('\u{1F9C0}', 'Cheese', `${D(24, 42, 18)}${V('<path d="M5 30l30-16 8 6v14L5 38z"/>', '#FFD23F')}${V('<path d="M5 30l30-16 8 6L13 34z"/>', '#FFE680', { lineOpacity: 0.4 })}
    ${[[30, 26, 2.6], [20, 32, 2], [37, 31, 1.8], [11, 34, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8B83A"/>`).join('')}`);
  add('\u{1F9C3}', 'Juice box', `${D(24, 44, 12)}${L('M30 9l3-6h5', '#FFFFFF', 3)}${L('M30 9l3-6h5', '#E5484D', 1.4)}${V('<rect x="13" y="9" width="22" height="33" rx="3"/>', '#F4A259')}${V('<path d="M13 9l4-4h18l-2 4z"/>', '#E08A3A', { lineOpacity: 0.4 })}
    ${V('<circle cx="24" cy="26" r="7"/>', '#FFB627', { lineOpacity: 0.3 })}${V('<path d="M24 19c2-3 5-3 6-2-1 2-4 3-6 2z"/>', '#6BBF59', { lineOpacity: 0.3 })}${S(17, 18, 1.4, 5)}`);
  add('\u{1FAD6}', 'Teapot', `${D(24, 43, 17)}${V('<path d="M36 24c5-2 8 2 6 6-1 3-5 4-7 3"/>', '#7FB8C9')}${V('<path d="M12 28c-5-3-8-8-8-10 3 0 7 3 9 6"/>', '#7FB8C9')}
    ${V('<ellipse cx="24" cy="29" rx="13" ry="12"/>', '#7FB8C9')}${V('<ellipse cx="24" cy="17" rx="9" ry="3"/>', '#5E9AAE')}${V('<circle cx="24" cy="12.5" r="2.4"/>', '#5E9AAE')}<path d="M13 30c6 3 16 3 22 0" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>${S(18, 24, 2.4, 4, 20)}`);
  add('\u{1FAD9}', 'Jar', `${D(24, 44, 13)}${V('<rect x="12" y="6" width="24" height="7" rx="2"/>', '#C99A6B')}${V('<path d="M12 13h24c2 2 3 4 3 7v18c0 3-2 5-5 5H14c-3 0-5-2-5-5V20c0-3 1-5 3-7z"/>', '#DCEEF7')}
    <path d="M10 26h28v12c0 3-2 5-5 5H15c-3 0-5-2-5-5z" fill="#FFFFFF"/><path d="M12 13h24c2 2 3 4 3 7v18c0 3-2 5-5 5H14c-3 0-5-2-5-5V20c0-3 1-5 3-7z" fill="url(#lpGlass)"/><path d="M12 13h24c2 2 3 4 3 7v18c0 3-2 5-5 5H14c-3 0-5-2-5-5V20c0-3 1-5 3-7z" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="1.6"/>${S(14, 22, 1.4, 5)}`);

  // ---------------------------------------------------------------- animals and their food
  add('\u{1F41F}', 'Fish', `${D(24, 43, 15)}${V('<path d="M36 24l9-8v16z"/>', '#F4A259')}${V('<path d="M4 24c4-9 14-13 22-11 6 1 10 6 11 11-1 5-5 10-11 11-8 2-18-2-22-11z"/>', '#FFB64D')}
    ${V('<path d="M18 13c2-4 8-5 10-2z"/>', '#F4A259', { lineOpacity: 0.4 })}<path d="M20 15c3 5 3 13 0 18M26 14c3 6 3 14 0 20" fill="none" stroke="#E8913A" stroke-width="1.4"/>${eyes(11, 11, 22, 2)}${S(15, 18, 3, 1.4, -15)}`);
  add('\u{1F436}', 'Puppy', `${D(24, 44, 16)}${V('<path d="M8 16c-4 2-6 12-2 16 3 2 6 0 7-3z"/><path d="M40 16c4 2 6 12 2 16-3 2-6 0-7-3z"/>', '#9A6A44')}
    ${V('<ellipse cx="24" cy="25" rx="15" ry="15"/>', '#D9A877')}${V('<ellipse cx="24" cy="32" rx="9" ry="7"/>', '#F6E2C6', { lineOpacity: 0.3 })}
    ${eyes(18, 30, 23, 2.1)}<ellipse cx="24" cy="29" rx="3" ry="2.2" fill="${INK}"/>${L('M24 31v2M21 34c2 1.5 4 1.5 6 0', INK, 1.4)}<ellipse cx="14" cy="29" rx="2.4" ry="1.4" fill="#F08A80" opacity=".5"/><ellipse cx="34" cy="29" rx="2.4" ry="1.4" fill="#F08A80" opacity=".5"/>`);
  add('\u{1F981}', 'Lion', `${D(24, 45, 17)}${blob(Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${(24 + Math.cos(a) * 15).toFixed(1)}" cy="${(24 + Math.sin(a) * 15).toFixed(1)}" r="6.5"/>`; }).join(''), '#D9822B')}
    ${V('<circle cx="24" cy="24" r="13"/>', '#F4B450')}${V('<circle cx="14" cy="13" r="3.4"/><circle cx="34" cy="13" r="3.4"/>', '#F4B450')}${V('<ellipse cx="24" cy="30" rx="7" ry="5"/>', '#FFE3B0', { lineOpacity: 0.3 })}
    ${eyes(19, 29, 22, 2)}<path d="M21.5 27h5l-2.5 2.6z" fill="#7A4A2A"/>${L('M24 29.6v1.6M21 32.6c2 1.4 4 1.4 6 0', INK, 1.3)}`);
  add('\u{1F998}', 'Kangaroo', `${D(24, 45, 16)}${V('<path d="M36 34c6 2 10 6 10 10-6-2-10-4-12-7z"/>', '#C98A55')}${V('<path d="M16 42c-2-10 0-20 8-24 6-3 12 2 12 10 0 8-5 14-12 15z"/>', '#D9A066')}
    ${V('<path d="M18 22c-4-4-6-10-3-14 3-1 5 1 6 4"/>', '#D9A066')}${V('<path d="M19 9c-1-4 0-7 2-7 1 3 1 5 0 8z"/><path d="M14 9c-2-3-1-6 1-7 2 3 2 5 1 8z"/>', '#C98A55')}
    ${V('<path d="M22 32c3-2 7-1 8 2 0 4-4 6-8 4z"/>', '#F0CFA0', { lineOpacity: 0.3 })}${V('<ellipse cx="18" cy="43" rx="6" ry="2.4"/>', '#C98A55')}${eyes(15, 15, 10, 1.4)}<circle cx="11.6" cy="14" r="1.2" fill="${INK}"/>`);
  add('\u{1F9B4}', 'Bone', `${D(24, 41, 18)}${V('<path d="M12 18c-4-5 2-11 6-7l12 12c4-4 10 2 6 6 4 4-2 10-6 6L18 23c-4 4-10-2-6-5z" transform="rotate(10 24 24)"/>', '#FFF6E8')}${S(15, 15, 2, 1.2, 40)}`);

  // ---------------------------------------------------------------- plants
  add('\u{1F333}', 'Tree', `${D(24, 45, 16)}${V('<path d="M21 28h6l1 16h-8z"/>', '#9A6A44')}${blob('<circle cx="15" cy="22" r="10"/><circle cx="33" cy="22" r="10"/><circle cx="24" cy="14" r="12"/><circle cx="24" cy="26" r="9"/>', '#5DAA5A')}${S(18, 9, 4, 2.2, -20)}`);
  add('\u{1F33F}', 'Plants', `${D(24, 44, 12)}${L('M24 44C22 32 26 18 24 4', '#4E9A45', 2.4)}${[[24, 36, -1], [24, 28, 1], [24, 20, -1], [24, 12, 1]].map(([x, y, s]) => V(`<path d="M${x} ${y}c${s * 4} -6 ${s * 12} -6 ${s * 14} -4 c${-s * 2} 5 ${-s * 9} 7 ${-s * 14} 4z"/>`, '#6BBF59')).join('')}`);
  add('\u{1FAB4}', 'Pot plant', `${D(24, 45, 14)}${V('<path d="M23 26c-10-2-14-12-10-20 6 4 10 10 10 20zM25 26c10-2 14-12 10-20-6 4-10 10-10 20zM24 27c-3-8-1-16 0-22 3 6 3 14 0 22z"/>', '#5DAA5A')}${V('<path d="M12 26h24l-3 17c0 1-1 2-2 2H17c-1 0-2-1-2-2z"/>', '#E07A5F')}${V('<rect x="10" y="24" width="28" height="5" rx="2"/>', '#C2614A')}`);

  // ---------------------------------------------------------------- party
  add('\u{1F56F}', 'Candle', `${D(24, 45, 10)}<circle cx="24" cy="10" r="9" fill="url(#lpGlow)"/>${V('<rect x="17" y="18" width="14" height="25" rx="2"/>', '#F7B6CD')}<path d="M17 24l14 5M17 32l14 5" stroke="#fff" stroke-width="2" opacity=".7"/>${L('M24 18v-3', INK, 1.4)}${V('<path d="M24 4c4 4 3 9 0 10-3-1-4-6 0-10z"/>', '#FFB627', { lineOpacity: 0.3 })}<path d="M24 8c1.6 2 1.4 4 0 5-1.4-1-1.6-3 0-5z" fill="#FFF3B0"/>`);

  // ---------------------------------------------------------------- bathroom and health
  add('\u{1F9B7}', 'Tooth', `${D(24, 45, 12)}${V('<path d="M14 8c4-3 7-1 10 0 3-1 6-3 10 0 5 4 3 12 1 17-1 4-2 18-6 18-2 0-2-10-5-10s-3 10-5 10c-4 0-5-14-6-18-2-5-4-13 1-17z"/>', '#FFFFFF')}${S(17, 13, 2, 4, 15)}`);
  add('\u{1FAA5}', 'Toothbrush', `${D(24, 44, 14)}${V('<path d="M8 40L33 15l4 4-25 25c-1 1-3 1-4 0s-1-3 0-4z"/>', '#4FB3A9')}${V('<path d="M31 13l6-6 5 5-6 6z"/>', '#4FB3A9')}
    ${V('<path d="M33 5l7 7 3-3-7-7z"/>', '#FFFFFF', { lineOpacity: 0.4 })}${[0, 1, 2].map((i) => `<path d="M${35 + i * 2.2} ${1.6 + i * 2.2}l-3 3" stroke="#8EC5F2" stroke-width="1.6" stroke-linecap="round"/>`).join('')}${S(18, 28, 1.2, 6, 45)}`);
  add('\u{1F9F4}', 'Lotion', `${D(24, 45, 11)}${V('<rect x="20" y="4" width="8" height="5" rx="1"/>', '#9AA6B2')}${V('<path d="M26 6h10v3h-8z"/>', '#9AA6B2')}${V('<rect x="21" y="9" width="6" height="5"/>', '#C9D1D9')}
    ${V('<path d="M15 14h18c2 0 3 1 3 3v24c0 2-1 3-3 3H15c-2 0-3-1-3-3V17c0-2 1-3 3-3z"/>', '#F7B6CD')}<rect x="15" y="22" width="18" height="12" rx="2" fill="#fff" opacity=".75"/>${S(16, 27, 1.4, 6)}`);
  add('\u{1F9FC}', 'Soap', `${D(24, 43, 17)}${V('<rect x="8" y="18" width="32" height="20" rx="9"/>', '#F7B6CD')}${V('<rect x="12" y="20" width="24" height="9" rx="4.5"/>', '#FCD3E1', { lineOpacity: 0.25 })}
    ${[[12, 12, 4], [21, 8, 3], [30, 11, 4.6], [37, 15, 2.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#EAF6FC" stroke="#8EC5F2" stroke-width="1.2"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 4}" fill="#fff"/>`).join('')}`);
  add('\u{1F9FD}', 'Sponge', `${D(24, 43, 18)}${V('<path d="M6 18c0-3 2-5 5-5h26c3 0 5 2 5 5v6H6z"/>', '#6BBF59')}${V('<path d="M6 24h36v12c0 3-2 5-5 5H11c-3 0-5-2-5-5z"/>', '#FFD23F')}
    ${[[12, 30], [20, 34], [29, 29], [36, 35], [16, 37], [33, 31], [24, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#E0B22A"/>`).join('')}`);
  add('\u{1F9FB}', 'Toilet paper', `${D(24, 44, 18)}${V('<path d="M10 14h24v22H10z"/>', '#FFFFFF', { lineOpacity: 0.4 })}${V('<path d="M32 30h10v12H18c-3 0-6-1-6-3h20z"/>', '#FFFFFF')}
    ${V('<ellipse cx="10" cy="25" rx="5" ry="11"/>', '#F2F4F6')}${V('<ellipse cx="34" cy="25" rx="5" ry="11"/>', '#FFFFFF')}${V('<ellipse cx="34" cy="25" rx="2" ry="4.4"/>', '#C9A27E', { lineOpacity: 0.3 })}${S(20, 17, 6, 1.2)}`);
  add('\u{1F48A}', 'Medicine', `${D(24, 43, 15)}<g transform="rotate(-35 24 24)">${V('<path d="M24 14h7c4 0 7 3 7 7s-3 7-7 7h-7z"/>', '#FFFFFF')}${V('<path d="M24 14h-7c-4 0-7 3-7 7s3 7 7 7h7z"/>', '#E5484D')}${S(16, 18, 2.4, 1.2)}</g>`);
  add('\u{1FA7A}', 'Stethoscope', `${D(26, 45, 12)}${L('M12 6v10c0 8 6 12 12 12s12-4 12-12V6', '#3E5463', 3)}${V('<circle cx="12" cy="5" r="2.4"/><circle cx="36" cy="5" r="2.4"/>', '#9AA6B2')}
    ${L('M24 28v6c0 5 4 8 9 8', '#3E5463', 3)}${V('<circle cx="36" cy="40" r="6"/>', '#C9D1D9')}<circle cx="36" cy="40" r="3.2" fill="url(#lpMetal)"/>${S(34, 38, 1.4, 1)}`);
})();
