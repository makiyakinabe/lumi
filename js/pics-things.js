/*
  pics-things.js
  Drawn pictures (in place of emoji) for everyday things, places, transport, clothes and toys.
  48 x 48 grid, soft shading from the LP toolkit (pics.js). Keys are the emoji they replace.
*/
(function () {
  'use strict';
  const LP = window.LP;
  if (!LP) return;
  const V = (m, c, o) => LP.vol(m, c, o);
  const D = (cx, cy, rx, ry) => LP.drop(cx, cy, rx, ry);
  const S = (cx, cy, rx, ry, r) => LP.shine(cx, cy, rx, ry, r);
  const INK = LP.INK;
  const add = (key, label, svg) => LP.add(key, { label, svg });
  const T = (x, y, txt, size, fill) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${size}" fill="${fill}">${txt}</text>`;

  // ---------------------------------------------------------------- play and toys
  add('\u{26BD}', 'Ball', `${D(24, 44, 15, 3)}${V('<circle cx="24" cy="24" r="17"/>', '#FFFFFF')}
    <path d="M24 16l6.5 4.7-2.5 7.6h-8l-2.5-7.6z" fill="#2E3440"/>
    <path d="M24 7.5v8.5M30.5 20.7l8-2.6M28 28.3l5 6.8M20 28.3l-5 6.8M17.5 20.7l-8-2.6" stroke="#2E3440" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M18 8.5l6-1 6 1-2 3.5h-8zM39.5 17l1.5 6-2.5 5-3-3 .5-6zM8.5 17l-1.5 6 2.5 5 3-3-.5-6zM14 38l5 2.5h10l5-2.5-3-3H17z" fill="#2E3440" opacity=".9"/>${S(17, 15, 4, 2.4, -30)}`);
  add('\u{1F3BE}', 'Tennis ball', `${D(24, 44, 14, 3)}${V('<circle cx="24" cy="24" r="17"/>', '#D7E84A')}
    <path d="M10 12c8 5 9 19 0 24M38 12c-8 5-9 19 0 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>${S(17, 15, 4, 2.4, -30)}`);
  add('\u{1F3B2}', 'Dice', `${D(24, 44, 16, 3)}${V('<path d="M8 15l16-7 16 7v18l-16 8-16-8z"/>', '#FFFFFF')}
    <path d="M24 22L8 15v18l16 8z" fill="#000" opacity=".05"/><path d="M24 22l16-7v18l-16 8z" fill="#000" opacity=".12"/>
    <path d="M8 15l16 7 16-7M24 22v19" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.4"/>
    <ellipse cx="24" cy="15" rx="2.4" ry="1.4" fill="#E5534B"/><circle cx="13" cy="22" r="1.9" fill="${INK}"/><circle cx="19" cy="31" r="1.9" fill="${INK}"/>
    <circle cx="29" cy="24" r="1.9" fill="${INK}"/><circle cx="35" cy="29" r="1.9" fill="${INK}"/><circle cx="29" cy="34" r="1.9" fill="${INK}"/><circle cx="35" cy="20" r="1.9" fill="${INK}"/>`);
  add('\u{1F3AE}', 'Game controller', `${D(24, 41, 18, 3)}${V('<path d="M8 20c1-5 4-7 9-7h14c5 0 8 2 9 7l3 12c1 5-4 8-8 4l-4-4H17l-4 4c-4 4-9 1-8-4z"/>', '#4A4F6A')}
    ${V('<path d="M13 21h3v-3h3v3h3v3h-3v3h-3v-3h-3z"/>', '#2B2F4A', { lineOpacity: 0.3 })}
    <circle cx="31" cy="20" r="2.3" fill="#E5534B"/><circle cx="36" cy="23" r="2.3" fill="#4FB3A9"/><circle cx="31" cy="26" r="2.3" fill="#F4D35E"/><circle cx="26" cy="23" r="2.3" fill="#5B8FD9"/>${S(15, 15, 4, 1.5, -10)}`);
  add('\u{1FA80}', 'Yo-yo', `${D(26, 44, 12, 3)}<path d="M24 3v15" stroke="#C99A6B" stroke-width="1.6"/>${V('<circle cx="24" cy="29" r="13"/>', '#E5534B')}
    ${V('<circle cx="24" cy="29" r="6"/>', '#FFD23F')}<path d="M11 29h26" stroke="${INK}" stroke-opacity=".3" stroke-width="1.6"/>${S(19, 23, 3.4, 2, -30)}`);
  add('\u{1F9E9}', 'Puzzle', `${D(24, 44, 16, 3)}${V('<path d="M8 12h10c-2-6 10-6 8 0h10v10c6-2 6 10 0 8v10H26c2 6-10 6-8 0H8V30c-6 2-6-10 0-8z"/>', '#7BC67E')}${S(14, 16, 4, 2, -20)}`);
  add('\u{1F9F1}', 'Blocks', `${D(24, 44, 18, 3)}${V('<rect x="6" y="28" width="16" height="13" rx="2"/>', '#E5534B')}${V('<rect x="24" y="28" width="16" height="13" rx="2"/>', '#5B8FD9')}
    ${V('<rect x="15" y="14" width="16" height="13" rx="2"/>', '#FFD23F')}${V('<path d="M23 3l8 10H15z"/>', '#7BC67E')}
    ${T(14, 38, 'A', 9, '#fff')}${T(32, 38, 'B', 9, '#fff')}${T(23, 24, 'C', 9, '#9A6A10')}`);
  add('\u{1F9F8}', 'Teddy', `${D(24, 45, 15, 3)}${V('<circle cx="13" cy="10" r="5"/><circle cx="35" cy="10" r="5"/>', '#C99A6B')}
    ${V('<ellipse cx="24" cy="33" rx="12" ry="11"/><ellipse cx="12" cy="40" rx="5" ry="4"/><ellipse cx="36" cy="40" rx="5" ry="4"/><ellipse cx="11" cy="29" rx="4" ry="6"/><ellipse cx="37" cy="29" rx="4" ry="6"/>', '#C99A6B')}
    ${V('<circle cx="24" cy="17" r="11"/>', '#D4A774')}<ellipse cx="24" cy="21" rx="5" ry="4" fill="#F1D3AE"/><ellipse cx="24" cy="19.5" rx="2" ry="1.4" fill="${INK}"/>
    <circle cx="19.5" cy="15" r="1.6" fill="${INK}"/><circle cx="28.5" cy="15" r="1.6" fill="${INK}"/><ellipse cx="24" cy="34" rx="6" ry="5" fill="#F1D3AE"/>
    <path d="M18 27l6 3 6-3-2 4h-8z" fill="#E5534B"/>`);
  add('\u{1F3A8}', 'Drawing', `${D(24, 44, 18, 3)}${V('<path d="M24 6c11 0 19 7 19 16 0 6-5 7-9 6-3-1-5 2-3 5 2 4-1 7-7 7C13 40 5 32 5 23S13 6 24 6z"/>', '#E8C99B')}
    <circle cx="15" cy="17" r="3" fill="#E5534B"/><circle cx="24" cy="13" r="3" fill="#FFD23F"/><circle cx="33" cy="17" r="3" fill="#5B8FD9"/><circle cx="12" cy="26" r="3" fill="#7BC67E"/><circle cx="19" cy="33" r="3" fill="#9B87D9"/>
    <path d="M31 40l12-16" stroke="#C99A6B" stroke-width="3.4" stroke-linecap="round"/><path d="M43 24l2-3" stroke="#E5534B" stroke-width="3.4" stroke-linecap="round"/>`);
  add('\u{1F388}', 'Balloon', `${D(24, 45, 8, 2)}<path d="M24 32c-2 5 3 7 0 13" fill="none" stroke="#9AA6B2" stroke-width="1.4"/>
    ${V('<path d="M24 3c8 0 13 6 13 13 0 8-7 15-13 16-6-1-13-8-13-16 0-7 5-13 13-13z"/><path d="M22 32h4l-1 3h-2z"/>', '#E5534B')}${S(19, 11, 3, 5, 20)}`);
  add('\u{1F381}', 'Present', `${D(24, 44, 18, 3)}${V('<rect x="8" y="20" width="32" height="21" rx="3"/>', '#7E64C8')}${V('<rect x="6" y="14" width="36" height="8" rx="3"/>', '#9B87D9')}
    <rect x="21" y="14" width="6" height="27" fill="#FFD23F"/><rect x="21" y="14" width="6" height="27" fill="url(#lpShadeV)"/>
    ${V('<path d="M24 14c-4-9-14-8-10-1 2 2 6 2 10 1zM24 14c4-9 14-8 10-1-2 2-6 2-10 1z"/>', '#FFD23F')}`);
  add('\u{1F941}', 'Drum', `${D(24, 44, 17, 3)}${V('<path d="M8 18v16c0 4 7 7 16 7s16-3 16-7V18z"/>', '#E5534B')}
    <path d="M8 22l8 17M16 22l8 19M24 22l8 19M32 22l8 15" stroke="#FFD23F" stroke-width="1.6" opacity=".9"/>${V('<ellipse cx="24" cy="18" rx="16" ry="6"/>', '#FFF4E0')}
    <path d="M30 13L42 3M36 15l9-8" stroke="#C99A6B" stroke-width="2.6" stroke-linecap="round"/><circle cx="42" cy="3" r="2" fill="#F1D3AE"/><circle cx="45" cy="7" r="2" fill="#F1D3AE"/>`);
  add('\u{1F6DD}', 'Swing', `${D(24, 45, 20, 3)}<path d="M6 44L13 6M42 44L35 6" stroke="#5B8FD9" stroke-width="3.4" stroke-linecap="round"/>${V('<rect x="9" y="4" width="30" height="5" rx="2.5"/>', '#4A78A8')}
    <path d="M18 9v22M30 9v22" stroke="#9AA6B2" stroke-width="1.8"/>${V('<rect x="15" y="30" width="18" height="5" rx="2"/>', '#E5534B')}`);
  add('\u{1F6FC}', 'Roller skate', `${D(24, 45, 18, 3)}${V('<path d="M12 6h12v18c4 0 14 2 16 8v4H10V8c0-1 1-2 2-2z"/>', '#F59FBF')}
    <path d="M14 12h8M14 17h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>${V('<rect x="8" y="34" width="34" height="4" rx="2"/>', '#9AA6B2')}
    ${V('<circle cx="15" cy="41" r="4"/><circle cx="35" cy="41" r="4"/>', '#7E64C8')}`);
  add('\u{1F9F6}', 'Ball of wool', `${D(24, 44, 15, 3)}${V('<circle cx="24" cy="24" r="16"/>', '#E58BA6')}
    <path d="M10 18c8 2 18 12 22 22M14 10c6 6 14 18 14 30M30 9c-2 8 4 18 12 21M9 28c8-2 22 2 28 10" fill="none" stroke="#C2577A" stroke-width="1.6" opacity=".8"/>
    <path d="M38 34c4 4 6 8 4 10" fill="none" stroke="#E58BA6" stroke-width="2" stroke-linecap="round"/>${S(17, 15, 4, 2.4, -30)}`);

  // ---------------------------------------------------------------- school and paper things
  add('\u{270F}', 'Pencil', `${D(24, 44, 16, 2.6)}<g transform="rotate(-40 24 24)">${V('<rect x="18" y="4" width="12" height="30" rx="2"/>', '#FFD23F')}
    ${V('<rect x="18" y="2" width="12" height="6" rx="2"/>', '#F59FBF')}<rect x="18" y="8" width="12" height="3" fill="#C9D1D9"/>${V('<path d="M18 34h12l-6 10z"/>', '#F1D3AE')}<path d="M22.5 41l1.5 3 1.5-3z" fill="${INK}"/>
    <path d="M22 11v23M26 11v23" stroke="#E0A21A" stroke-width="1"/></g>`);
  add('\u{2702}', 'Scissors', `${D(24, 44, 14, 2.6)}<path d="M20 27L34 4M28 27L14 4" stroke="url(#lpMetal)" stroke-width="5" stroke-linecap="round"/>
    <path d="M20 27L34 4M28 27L14 4" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2" fill="none"/><circle cx="24" cy="20.5" r="1.8" fill="${INK}"/>
    <circle cx="16" cy="34" r="6.5" fill="none" stroke="#C8423A" stroke-width="5"/><circle cx="32" cy="34" r="6.5" fill="none" stroke="#C8423A" stroke-width="5"/>
    <circle cx="16" cy="34" r="6.5" fill="none" stroke="#E5534B" stroke-width="3.2"/><circle cx="32" cy="34" r="6.5" fill="none" stroke="#E5534B" stroke-width="3.2"/>`);
  add('\u{1F4DA}', 'Books', `${D(24, 44, 19, 3)}${V('<rect x="5" y="32" width="38" height="9" rx="2"/>', '#5B8FD9')}<rect x="8" y="34.5" width="32" height="4" rx="1" fill="#fff" opacity=".7"/>
    ${V('<rect x="8" y="23" width="32" height="9" rx="2"/>', '#E5534B')}<rect x="11" y="25.5" width="26" height="4" rx="1" fill="#fff" opacity=".7"/>
    ${V('<rect x="6" y="14" width="34" height="9" rx="2"/>', '#7BC67E')}<rect x="9" y="16.5" width="28" height="4" rx="1" fill="#fff" opacity=".7"/>
    ${V('<path d="M12 4h22l2 10H10z"/>', '#FFD23F')}`);
  add('\u{1F4DD}', 'Task card', `${D(24, 45, 15, 3)}${V('<rect x="9" y="5" width="26" height="37" rx="3"/>', '#FFFFFF')}
    <path d="M14 13h16M14 19h16M14 25h12M14 31h14" stroke="#9FC3DC" stroke-width="2" stroke-linecap="round"/>
    <g transform="rotate(35 34 26)">${V('<rect x="31" y="10" width="7" height="24" rx="1.5"/>', '#FFD23F')}${V('<path d="M31 34h7l-3.5 7z"/>', '#F1D3AE')}</g>`);
  add('\u{1F4C5}', 'Calendar', `${D(24, 45, 17, 3)}${V('<rect x="7" y="9" width="34" height="33" rx="4"/>', '#FFFFFF')}${V('<path d="M7 13a4 4 0 0 1 4-4h26a4 4 0 0 1 4 4v6H7z"/>', '#E5534B')}
    <rect x="14" y="5" width="3.4" height="8" rx="1.7" fill="#9AA6B2"/><rect x="30.6" y="5" width="3.4" height="8" rx="1.7" fill="#9AA6B2"/>
    ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${11 + c * 7}" y="${23 + r * 6}" width="5" height="4" rx="1" fill="${r === 1 && c === 2 ? '#4FB3A9' : '#E3E8ED'}"/>`).join('')).join('')}`);
  add('\u{1F392}', 'School bag', `${D(24, 45, 16, 3)}<path d="M18 9c0-6 12-6 12 0" fill="none" stroke="#2B4A7A" stroke-width="3"/>${V('<path d="M10 16c0-5 4-8 9-8h10c5 0 9 3 9 8v22c0 3-2 5-5 5H15c-3 0-5-2-5-5z"/>', '#4A78A8')}
    ${V('<rect x="14" y="26" width="20" height="13" rx="4"/>', '#5B8FD9')}<path d="M14 30h20" stroke="#2B4A7A" stroke-width="1.6"/>${V('<rect x="21.5" y="28.5" width="5" height="3" rx="1"/>', '#FFD23F', { lineOpacity: 0.3 })}${S(15, 13, 3, 1.5, -20)}`);
  add('\u{1F4E6}', 'Box', `${D(24, 44, 18, 3)}${V('<path d="M6 16l18-7 18 7v20l-18 8-18-8z"/>', '#D9A877')}
    <path d="M24 23L6 16v20l18 8z" fill="#000" opacity=".05"/><path d="M24 23l18-7v20l-18 8z" fill="#000" opacity=".14"/>
    <path d="M6 16l18 7 18-7M24 23v21" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.4"/><path d="M15 12.5l18 7v6" fill="none" stroke="#F2E2C4" stroke-width="3"/>`);
  add('\u{1F48C}', 'Invitation', `${D(24, 44, 18, 3)}${V('<rect x="5" y="12" width="38" height="27" rx="3"/>', '#FFF4E0')}<path d="M5 14l19 14 19-14" fill="none" stroke="#E6C9A0" stroke-width="2"/>
    ${V('<path d="M24 34c-6-4-9-6-9-9.5a4 4 0 0 1 9-2 4 4 0 0 1 9 2C33 28 30 30 24 34z"/>', '#E5534B')}`);
  add('\u{1F3AB}', 'Queue ticket', `${D(24, 44, 16, 3)}${V('<path d="M10 8h28v8a3 3 0 0 0 0 6v18H10V22a3 3 0 0 0 0-6z"/>', '#FFF8EC')}
    <path d="M13 19h22" stroke="#C9A27E" stroke-width="1.4" stroke-dasharray="2 2"/>${T(24, 16, 'No.', 6, '#8A97A6')}${T(24, 33, '1024', 9.5, '#E5534B')}`);
  add('\u{1F39F}', 'Ticket', `${D(24, 44, 18, 3)}<g transform="rotate(-12 24 24)">${V('<path d="M6 15h36v6a3 3 0 0 0 0 6v6H6v-6a3 3 0 0 0 0-6z"/>', '#F4A259')}
    <path d="M14 15v18" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 2"/>${T(29, 27, 'ADMIT', 7, '#fff')}</g>`);
  add('\u{1FAAA}', 'ID card', `${D(24, 44, 19, 3)}${V('<rect x="4" y="11" width="40" height="27" rx="4"/>', '#8EC5F2')}<rect x="4" y="11" width="40" height="7" rx="3" fill="#4A78A8"/>
    ${V('<rect x="8" y="21" width="12" height="13" rx="2"/>', '#FFFFFF', { lineOpacity: 0.3 })}<circle cx="14" cy="26" r="3" fill="#C99A6B"/><path d="M9.5 34c1-4 8-4 9 0" fill="#C99A6B"/>
    <path d="M24 24h15M24 29h11" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`);
  add('\u{1F4B3}', 'Card', `${D(24, 44, 19, 3)}${V('<rect x="4" y="11" width="40" height="27" rx="4"/>', '#4A78A8', { shade: 'v' })}<rect x="4" y="16" width="40" height="5" fill="#2B4A7A"/>
    ${V('<rect x="9" y="25" width="8" height="6" rx="1.2"/>', '#F4D35E', { lineOpacity: 0.3 })}<path d="M26 32h13" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>`);
  add('\u{1FA99}', 'Coins', `${D(24, 44, 17, 3)}${V('<ellipse cx="18" cy="34" rx="12" ry="5"/><path d="M6 30v4c0 3 5 5 12 5s12-2 12-5v-4"/>', '#C9A227')}
    ${V('<circle cx="29" cy="20" r="13"/>', '#E8B83A')}<circle cx="29" cy="20" r="9.5" fill="none" stroke="#B98A1E" stroke-opacity=".6" stroke-width="1.4"/>${T(29, 24.5, '$1', 10, '#7A5A10')}${S(24, 14, 3, 1.8, -30)}`);
  add('\u{1F511}', 'Key', `${D(24, 44, 15, 3)}<g transform="rotate(-35 24 24)">${V('<circle cx="14" cy="24" r="8"/>', '#E8B83A')}<circle cx="14" cy="24" r="3" fill="#FFF8EC"/>
    ${V('<path d="M21 22h20v4h-3v5h-4v-5h-3v4h-4v-4h-6z"/>', '#E8B83A')}</g>`);

  // ---------------------------------------------------------------- devices and sound
  add('\u{1F4F1}', 'Phone', `${D(24, 45, 11, 2.6)}${V('<rect x="13" y="3" width="22" height="40" rx="5"/>', '#2B2F4A', { shade: 'h' })}<rect x="15.5" y="7.5" width="17" height="30" rx="2" fill="#8EC5F2"/>
    <rect x="18" y="12" width="5" height="5" rx="1.4" fill="#F4A259"/><rect x="25" y="12" width="5" height="5" rx="1.4" fill="#7BC67E"/><rect x="18" y="20" width="5" height="5" rx="1.4" fill="#E58BA6"/><rect x="25" y="20" width="5" height="5" rx="1.4" fill="#FFD23F"/>
    <rect x="15.5" y="7.5" width="17" height="30" rx="2" fill="url(#lpGlass)"/><rect x="21" y="4.6" width="6" height="1.4" rx=".7" fill="#4A4F6A"/>`);
  add('\u{1F4FA}', 'TV', `${D(24, 45, 16, 3)}<path d="M18 38l-3 6M30 38l3 6" stroke="#4A4F6A" stroke-width="2.6" stroke-linecap="round"/>${V('<rect x="4" y="8" width="40" height="30" rx="5"/>', '#3E4A5A', { shade: 'v' })}
    <rect x="8" y="12" width="32" height="22" rx="2" fill="#8EC5F2"/><path d="M8 28l8-7 6 5 6-6 12 9v5H8z" fill="#7BC67E"/><circle cx="33" cy="18" r="3" fill="#FFD23F"/><rect x="8" y="12" width="32" height="22" rx="2" fill="url(#lpGlass)"/>`);
  add('\u{1F3A7}', 'Headphones', `${D(24, 45, 16, 3)}<path d="M9 28c0-13 6-21 15-21s15 8 15 21" fill="none" stroke="#3E5463" stroke-width="4.4" stroke-linecap="round"/>
    ${V('<rect x="4" y="25" width="11" height="17" rx="5"/><rect x="33" y="25" width="11" height="17" rx="5"/>', '#7E64C8')}${S(8, 29, 1.4, 3)}${S(37, 29, 1.4, 3)}`);
  add('\u{1F514}', 'Bell', `${D(24, 45, 14, 3)}${V('<path d="M24 6c8 0 12 7 12 15v8l4 6H8l4-6v-8c0-8 4-15 12-15z"/>', '#F4D35E')}
    ${V('<circle cx="24" cy="39" r="4"/>', '#E0A21A')}${V('<circle cx="24" cy="5" r="2.4"/>', '#E0A21A')}${S(18, 16, 2.4, 5, 10)}`);

  // ---------------------------------------------------------------- clothes
  add('\u{1F455}', 'T-shirt', `${D(24, 45, 16, 3)}${V('<path d="M16 6l-11 6 4 10 5-2v21h20V20l5 2 4-10-11-6c-1 4-4 6-8 6s-7-2-8-6z"/>', '#5B8FD9')}
    <path d="M16 6c1 4 4 6 8 6s7-2 8-6" fill="none" stroke="#2B4A7A" stroke-width="1.8"/>${S(17, 20, 2, 5, 0)}`);
  add('\u{1F456}', 'Trousers', `${D(24, 45, 15, 3)}${V('<path d="M12 5h24l3 38h-10l-5-24-5 24H9z"/>', '#4A6A9A')}
    <path d="M12 9h24" stroke="#2B4A7A" stroke-width="1.6"/><path d="M24 9v10" stroke="#2B4A7A" stroke-width="1.4"/><path d="M15 12c1 3 4 3 5 0M28 12c1 3 4 3 5 0" fill="none" stroke="#2B4A7A" stroke-width="1.2"/>`);
  add('\u{1FA73}', 'Shorts', `${D(24, 44, 16, 3)}${V('<path d="M9 9h30l3 25H28l-4-13-4 13H6z"/>', '#7BC67E')}
    <path d="M9 13h30" stroke="#4E9A52" stroke-width="1.6"/><path d="M24 13v8" stroke="#4E9A52" stroke-width="1.4"/>`);
  add('\u{1FA72}', 'Underwear', `${D(24, 40, 15, 3)}${V('<path d="M6 14h36l-4 8c-5 2-9 6-10 12h-8c-1-6-5-10-10-12z"/>', '#8EC5F2')}
    <path d="M6 17h36" stroke="#5B8FD9" stroke-width="2.4"/>`);
  add('\u{1F9E5}', 'Coat', `${D(24, 45, 17, 3)}${V('<path d="M17 5l-10 6-3 26 6 1 2-17v21h24V21l2 17 6-1-3-26-10-6-7 8z"/>', '#C2577A')}
    ${V('<path d="M17 5l7 8 7-8 3 4-10 9-10-9z"/>', '#E58BA6')}<path d="M24 18v24" stroke="#8A3A5A" stroke-width="1.6"/>
    <circle cx="27" cy="24" r="1.4" fill="#FFD23F"/><circle cx="27" cy="31" r="1.4" fill="#FFD23F"/><circle cx="27" cy="38" r="1.4" fill="#FFD23F"/>`);
  add('\u{1F9E2}', 'Cap', `${D(24, 40, 18, 3)}${V('<path d="M8 30c0-12 7-20 16-20s16 8 16 20z"/>', '#E5534B')}${V('<path d="M24 30h22c0 3-3 5-8 5H24z"/>', '#C8423A')}
    ${V('<circle cx="24" cy="10" r="2.4"/>', '#C8423A')}<path d="M24 11v19M16 13c-2 5-3 11-3 17" fill="none" stroke="#C8423A" stroke-width="1.2"/>${S(16, 18, 3, 2, -30)}`);
  add('\u{1F9E4}', 'Gloves', `${D(24, 45, 18, 3)}${V('<path d="M6 40V20c0-2 1-3 3-3s3 1 3 3v-8c0-2 1-3 3-3s3 1 3 3v12l3-4c1-2 3-2 4 0l-5 10v10z"/>', '#4FB3A9')}
    ${V('<path d="M42 40V20c0-2-1-3-3-3s-3 1-3 3v-8c0-2-1-3-3-3s-3 1-3 3v12l-3-4c-1-2-3-2-4 0l5 10v10z"/>', '#3E958F')}`);
  add('\u{1F9E6}', 'Socks', `${D(24, 45, 18, 3)}${V('<path d="M8 5h11v22l6 5c3 3 1 9-4 9-3 0-5-1-7-3l-6-7c-1-1-1-2-1-4z"/>', '#F59FBF')}<path d="M8 10h11" stroke="#C2577A" stroke-width="2.4"/>
    ${V('<path d="M25 5h11v22l6 5c3 3 1 9-4 9-3 0-5-1-7-3l-6-7c-1-1-1-2-1-4z"/>', '#F59FBF')}<path d="M25 10h11" stroke="#C2577A" stroke-width="2.4"/>`);
  add('\u{1F45F}', 'Shoes', `${D(24, 44, 20, 3)}${V('<path d="M5 30c0-6 2-14 6-16 2 4 8 6 12 6l10 4c6 2 11 4 11 9v4H5z"/>', '#E5534B')}
    ${V('<path d="M5 37h39v3c0 2-1 3-3 3H8c-2 0-3-1-3-3z"/>', '#FFFFFF')}<path d="M16 21l3 4M20 20l3 4M24 21l3 4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`);
  add('\u{1FA74}', 'Slippers', `${D(24, 45, 20, 3)}${V('<path d="M6 30c0-14 4-24 8-24s8 10 8 24c0 7-3 11-8 11s-8-4-8-11z"/>', '#4FB3A9')}${V('<path d="M26 30c0-14 4-24 8-24s8 10 8 24c0 7-3 11-8 11s-8-4-8-11z"/>', '#4FB3A9')}
    <path d="M14 13c-5 6-6 10-6 14M14 13c5 6 6 10 6 14M34 13c-5 6-6 10-6 14M34 13c5 6 6 10 6 14" fill="none" stroke="#2F7E79" stroke-width="2.4" stroke-linecap="round"/>`);

  // ---------------------------------------------------------------- home things
  add('\u{1FA91}', 'Chair', `${D(24, 45, 15, 3)}<path d="M13 28v15M35 28v15M15 4v24M33 4v24" stroke="#A87B50" stroke-width="3" stroke-linecap="round"/>
    ${V('<rect x="13" y="4" width="22" height="16" rx="4"/>', '#C99A6B')}${V('<rect x="9" y="25" width="30" height="6" rx="3"/>', '#D9A877')}`);
  add('\u{1F6CF}', 'Bed', `${D(24, 44, 21, 3)}<path d="M5 30v13M43 34v9" stroke="#8A6A4A" stroke-width="3" stroke-linecap="round"/>${V('<rect x="3" y="12" width="7" height="24" rx="3"/>', '#A87B50')}
    ${V('<rect x="6" y="28" width="38" height="9" rx="3"/>', '#C99A6B')}${V('<path d="M10 20c0-2 1-3 3-3h8c2 0 3 1 3 3v8H10z"/>', '#FFFFFF')}${V('<path d="M18 22h22c3 0 4 2 4 4v4H18z"/>', '#7BA7E5')}`);
  add('\u{1F6C1}', 'Bath', `${D(24, 45, 20, 3)}<path d="M10 4c-3 0-4 2-4 5v13" fill="none" stroke="url(#lpMetal)" stroke-width="3"/><path d="M10 4c-3 0-4 2-4 5v13" fill="none" stroke="${INK}" stroke-opacity=".3" stroke-width="1"/>
    ${[[18, 18], [24, 14], [30, 19], [36, 15]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#fff" stroke="#9FC3DC" stroke-width="1.2"/>`).join('')}
    ${V('<path d="M3 22h42v6c0 7-5 11-12 11H15C8 39 3 35 3 28z"/>', '#FFFFFF')}<path d="M3 24h42" stroke="#8EC5F2" stroke-width="3"/><path d="M11 39l-2 4M37 39l2 4" stroke="#9AA6B2" stroke-width="2.6" stroke-linecap="round"/>`);
  add('\u{1F6BD}', 'Toilet', `${D(24, 45, 15, 3)}${V('<rect x="12" y="3" width="24" height="14" rx="3"/>', '#FFFFFF')}${V('<rect x="31" y="6" width="3.4" height="2.4" rx="1"/>', '#C9D1D9')}
    ${V('<path d="M8 21h32c0 8-5 13-11 14l1 8H18l1-8C13 34 8 29 8 21z"/>', '#FFFFFF')}${V('<ellipse cx="24" cy="21" rx="16" ry="4"/>', '#E3E8ED')}<ellipse cx="24" cy="21" rx="11" ry="2.4" fill="#BFE3F7"/>`);
  add('\u{1FA9E}', 'Mirror', `${D(24, 45, 14, 3)}${V('<ellipse cx="24" cy="21" rx="15" ry="18"/>', '#D9A877')}<ellipse cx="24" cy="21" rx="11.5" ry="14.5" fill="#CFE6F5"/><ellipse cx="24" cy="21" rx="11.5" ry="14.5" fill="url(#lpGlass)"/>
    <path d="M17 14l6-5M18 21l10-9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>${V('<rect x="19" y="38" width="10" height="5" rx="2"/>', '#C99A6B')}`);
  add('\u{1F9FA}', 'Laundry basket', `${D(24, 45, 18, 3)}<path d="M14 18c0-8 20-8 20 0" fill="none" stroke="#C99A6B" stroke-width="3"/>
    ${V('<path d="M5 18h38l-4 23c0 2-2 3-4 3H13c-2 0-4-1-4-3z"/>', '#D9A877')}<path d="M7 25h34M8 32h32M9 38h30" stroke="#A87B50" stroke-width="1.4"/>
    <path d="M12 18v24M20 18v26M28 18v26M36 18v24" stroke="#A87B50" stroke-width="1.2" opacity=".7"/>${V('<path d="M10 18c2-5 7-6 10-3 3-4 9-3 10 1 3-2 8 0 8 2z"/>', '#8EC5F2', { lineOpacity: 0.3 })}`);
  add('\u{1F6CD}', 'Shopping bags', `${D(24, 45, 20, 3)}<path d="M10 14c0-7 10-7 10 0M26 18c0-7 10-7 10 0" fill="none" stroke="#8A3A5A" stroke-width="2.4"/>
    ${V('<path d="M6 14h18l2 28H4z"/>', '#E58BA6')}${V('<path d="M22 18h18l3 25H21z"/>', '#F4A259')}${S(10, 22, 1.6, 4)}`);
  add('\u{1F6D2}', 'Trolley', `${D(24, 45, 19, 3)}<path d="M3 7h6l5 24h24" fill="none" stroke="#5B8FD9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${V('<path d="M9 11h33l-4 16H13z"/>', '#8EC5F2')}<path d="M14 16h26M15 21h24M20 11l2 16M28 11v16M35 11l-2 16" stroke="#5B8FD9" stroke-width="1.4" opacity=".8"/>
    ${V('<circle cx="16" cy="39" r="3.6"/><circle cx="34" cy="39" r="3.6"/>', '#4A4F6A')}`);

  // ---------------------------------------------------------------- places and transport
  // an HDB-style block of flats with a little home in front
  add('\u{1F3E0}', 'Home', `${D(24, 45, 20, 3)}${V('<rect x="22" y="4" width="20" height="38" rx="2"/>', '#F2E2C4')}
    ${[0, 1, 2, 3, 4].map((r) => `<rect x="25" y="${8 + r * 6.4}" width="5" height="3.6" rx=".6" fill="#8EC5F2"/><rect x="34" y="${8 + r * 6.4}" width="5" height="3.6" rx=".6" fill="#8EC5F2"/>`).join('')}
    <rect x="22" y="4" width="20" height="3" fill="#E07A5F"/>${V('<path d="M4 26l11-10 11 10v16H4z"/>', '#FFF4E0')}${V('<path d="M2 27l13-12 13 12-2 2-11-10L4 29z"/>', '#E07A5F')}
    ${V('<rect x="12" y="32" width="6" height="10" rx="1"/>', '#C99A6B')}<rect x="6" y="29" width="4" height="4" rx=".6" fill="#8EC5F2"/>`);
  add('\u{1F3EB}', 'School', `${D(24, 45, 21, 3)}${V('<rect x="3" y="18" width="42" height="24" rx="2"/>', '#F6C28B')}${V('<path d="M14 18V12l10-7 10 7v6z"/>', '#E8A15A')}
    <circle cx="24" cy="12.5" r="3" fill="#fff" stroke="${INK}" stroke-opacity=".4"/><path d="M24 11v1.6l1.2.8" stroke="${INK}" stroke-width=".9" fill="none"/>
    ${[0, 1].map((r) => [0, 1, 3, 4].map((c) => `<rect x="${6 + c * 8}" y="${22 + r * 9}" width="5" height="5" rx=".8" fill="#BFE3F7"/>`).join('')).join('')}
    ${V('<rect x="20" y="31" width="8" height="11" rx="1"/>', '#A87B50')}<path d="M24 5V1h5v3h-5" fill="#E5534B"/>`);
  add('\u{1F3E5}', 'Clinic', `${D(24, 45, 20, 3)}${V('<rect x="5" y="9" width="38" height="33" rx="3"/>', '#FFFFFF')}
    ${V('<rect x="18" y="13" width="12" height="12" rx="2"/>', '#E5534B', { lineOpacity: 0.2 })}<path d="M24 15.5v7M20.5 19h7" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
    ${[9, 33].map((x) => `<rect x="${x}" y="15" width="6" height="5" rx=".8" fill="#BFE3F7"/><rect x="${x}" y="26" width="6" height="5" rx=".8" fill="#BFE3F7"/>`).join('')}
    ${V('<rect x="19" y="31" width="10" height="11" rx="1"/>', '#8EC5F2')}<rect x="5" y="9" width="38" height="3" fill="#4FB3A9"/>`);
  add('\u{1F3D6}', 'Beach', `<rect x="2" y="30" width="44" height="14" rx="4" fill="#F6DDA8"/><path d="M2 30c8-3 14 2 22 0s14-3 22 0v-6H2z" fill="#8EC5F2"/><path d="M2 30c8-3 14 2 22 0s14-3 22 0" fill="none" stroke="#fff" stroke-width="1.6"/>
    <path d="M22 14l6 26" stroke="#C99A6B" stroke-width="2"/>${V('<path d="M6 18c4-9 16-13 26-8 3 2 6 5 7 8-11-4-22-4-33 0z"/>', '#E5534B')}<path d="M14 15c3-1 7-1 9-1M27 13c3 1 6 3 8 5" fill="none" stroke="#fff" stroke-width="2.4"/>
    ${V('<path d="M32 38l6-4 4 4z"/>', '#FFD23F')}<circle cx="40" cy="8" r="4" fill="#FFD23F"/>`);
  // the MRT: a white train with a red stripe on a track
  add('\u{1F687}', 'MRT train', `${D(24, 45, 18, 3)}<path d="M8 44l6-6M40 44l-6-6M14 41h20" stroke="#8A97A6" stroke-width="2" stroke-linecap="round"/>
    ${V('<path d="M10 10c0-4 3-6 7-6h14c4 0 7 2 7 6v24c0 3-2 5-5 5H15c-3 0-5-2-5-5z"/>', '#F4F6F8')}<rect x="10" y="27" width="28" height="4" fill="#E5534B"/>
    <rect x="14" y="9" width="20" height="13" rx="3" fill="#2B2F4A"/><rect x="14" y="9" width="20" height="13" rx="3" fill="url(#lpGlass)"/>
    <circle cx="15.5" cy="34" r="2" fill="#FFD23F"/><circle cx="32.5" cy="34" r="2" fill="#FFD23F"/><rect x="21" y="5.5" width="6" height="2" rx="1" fill="#4FB3A9"/>`);
  add('\u{1F68C}', 'Bus', `${D(24, 45, 20, 3)}${V('<rect x="4" y="6" width="40" height="32" rx="6"/>', '#5FA54A')}<rect x="4" y="26" width="40" height="4" fill="#3F7A32"/>
    <rect x="8" y="10" width="32" height="13" rx="2" fill="#BFE3F7"/><rect x="8" y="10" width="32" height="13" rx="2" fill="url(#lpGlass)"/><rect x="13" y="7.5" width="22" height="2" rx="1" fill="#2B2F4A"/>
    <circle cx="10" cy="33" r="2" fill="#FFD23F"/><circle cx="38" cy="33" r="2" fill="#FFD23F"/>${V('<rect x="9" y="37" width="7" height="6" rx="2"/><rect x="32" y="37" width="7" height="6" rx="2"/>', '#2B2F4A')}`);
  add('\u{1F697}', 'Car', `${D(24, 44, 21, 3)}${V('<path d="M4 30c0-4 2-6 6-7l5-9c1-2 3-3 5-3h10c2 0 4 1 5 3l4 9c4 1 6 3 6 7v5H4z"/>', '#E5534B')}
    <path d="M16 23l3-8h4v8zM26 23v-8h4l4 8z" fill="#BFE3F7"/><circle cx="7.5" cy="30" r="1.6" fill="#FFD23F"/><circle cx="40.5" cy="30" r="1.6" fill="#FFD23F"/>
    ${V('<circle cx="13" cy="36" r="5"/><circle cx="35" cy="36" r="5"/>', '#2B2F4A')}<circle cx="13" cy="36" r="2" fill="#C9D1D9"/><circle cx="35" cy="36" r="2" fill="#C9D1D9"/>${S(12, 26, 3, 1.2)}`);

  window.LP_THINGS_KEYS = ['\u{26BD}', '\u{2702}', '\u{270F}', '\u{1F381}', '\u{1F388}', '\u{1F392}', '\u{1F39F}', '\u{1F3A7}', '\u{1F3A8}', '\u{1F3AB}', '\u{1F3AE}', '\u{1F3B2}', '\u{1F3BE}', '\u{1F3D6}', '\u{1F3E0}', '\u{1F3E5}', '\u{1F3EB}', '\u{1F455}', '\u{1F456}', '\u{1F45F}', '\u{1F48C}', '\u{1F4B3}', '\u{1F4C5}', '\u{1F4DA}', '\u{1F4DD}', '\u{1F4E6}', '\u{1F4F1}', '\u{1F4FA}', '\u{1F511}', '\u{1F514}', '\u{1F687}', '\u{1F68C}', '\u{1F697}', '\u{1F6BD}', '\u{1F6C1}', '\u{1F6CD}', '\u{1F6CF}', '\u{1F6D2}', '\u{1F6DD}', '\u{1F6FC}', '\u{1F941}', '\u{1F9E2}', '\u{1F9E4}', '\u{1F9E5}', '\u{1F9E6}', '\u{1F9E9}', '\u{1F9F1}', '\u{1F9F6}', '\u{1F9F8}', '\u{1F9FA}', '\u{1FA72}', '\u{1FA73}', '\u{1FA74}', '\u{1FA80}', '\u{1FA91}', '\u{1FA99}', '\u{1FA9E}', '\u{1FAAA}'];
})();
