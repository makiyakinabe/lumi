/*
  icons.js
  Simple icons. Call icon(name, size) to get an SVG string.
  "line" icons use currentColor, so set the CSS `color` of the parent to recolour them.
  "art" icons have their own fixed colours.
*/
(function () {
  const line = (inner, sw) => {
    const f = (size, cls) =>
      `<svg class="ic ${cls || ''}" width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
    f.isLine = true;
    return f;
  };
  const art = (inner) => (size, cls) =>
    `<svg class="ic ${cls || ''}" width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;

  // detailed, colour-filled pictures drawn on a 48 x 48 grid
  const art48 = (inner) => (size, cls) =>
    `<svg class="ic ${cls || ''}" width="${size || 24}" height="${size || 24}" viewBox="0 0 48 48" aria-hidden="true">${inner}</svg>`;
  const K = 'stroke="#3B2F2F" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  // little 5-point stars with rounded points (used as decoration inside icons)
  const SPARK = (x, y, r, c) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.45 : r; pts.push((x + rr * Math.cos(a)).toFixed(2) + ' ' + (y + rr * Math.sin(a)).toFixed(2)); }
    return `<polygon points="${pts.join(' ')}" fill="${c || '#FFC727'}" stroke="${c ? c : '#F2A100'}" stroke-width="${r * 0.28}" stroke-linejoin="round"/>`;
  };

  const STAR = '12 3 14.6 8.6 20.6 9.2 16 13.2 17.3 19.2 12 16.1 6.7 19.2 8 13.2 3.4 9.2 9.4 8.6';
  let gid = 0;
  // a soft golden star with rounded points, a warm glow and a shiny highlight
  function glossyStar(size, cls) {
    const g = 'gst' + (++gid);
    return `<svg class="ic ${cls || ''}" width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24" aria-hidden="true">
      <defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE45C"/><stop offset=".55" stop-color="#FFC727"/><stop offset="1" stop-color="#F7A600"/></linearGradient>
      <radialGradient id="${g}b" cx=".42" cy=".42" r=".5"><stop offset="0" stop-color="#FFF6B8" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6B8" stop-opacity="0"/></radialGradient></defs>
      <polygon points="${STAR}" fill="url(#${g}a)" stroke="#F2A100" stroke-width="2.4" stroke-linejoin="round"/>
      <polygon points="${STAR}" fill="url(#${g}b)"/>
      <path d="M5.4 9.9 9.8 9.5 11.6 5.3" fill="none" stroke="#fff" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
      <path d="M14.5 9.6l.6 1.3" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".6"/></svg>`;
  }

  const ICONS = {
    // navigation and controls
    speaker: line('<path d="M5 9v6h4l5 4V5L9 9z"/><path d="M17.5 9a4 4 0 0 1 0 6"/>', 2.2),
    mute: line('<path d="M5 9v6h4l5 4V5L9 9z"/><path d="M17 9.5l4 5M21 9.5l-4 5"/>', 2.2),
    home: line('<path d="M4 11 12 4l8 7v9H4z"/>', 2.2),
    back: line('<path d="M15 5l-7 7 7 7"/>', 2.6),
    lock: line('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    check: line('<path d="M5 12l5 5 9-10"/>', 3),
    chev: line('<path d="M9 5l7 7-7 7"/>', 3),
    arrow: line('<path d="M5 12h14M13 6l6 6-6 6"/>', 2.8),
    x: line('<path d="M6 6l12 12M18 6 6 18"/>', 2.6),
    plus: line('<path d="M12 5v14M5 12h14"/>', 2.6),
    minus: line('<path d="M5 12h14"/>', 2.6),
    up: line('<path d="M6 15l6-6 6 6"/>', 2.6),
    down: line('<path d="M6 9l6 6 6-6"/>', 2.6),
    grip: line('<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>', 2.4),
    copy: line('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
    trash: line('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    undo: line('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', 2.4),
    bulb: line('<path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/><path d="M9.5 19h5M10.5 21.5h3"/>'),
    eye: line('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    camera: line('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
    dice: line('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" stroke-width="3.4"/>'),
    palette: line('<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><path d="M7.5 11h.01M10 7h.01M15 7h.01" stroke-width="3"/>'),
    pencil: line('<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>'),
    eraser: line('<path d="M4 16 13 7l6 6-6 6H8z"/><path d="M4 16l4 4"/>'),
    shop: line('<path d="M5 8h14l-1.5 12h-11z"/><path d="M9 8a3 3 0 0 1 6 0"/>'),
    gift: line('<rect x="4" y="10" width="16" height="10" rx="2"/><rect x="3" y="7" width="18" height="4" rx="1.5"/><path d="M12 7v13M12 7c-2-4-6-3-4 0M12 7c2-4 6-3 4 0"/>'),
    moon: line('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    calendar: line('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 9h16M9 3v4M15 3v4M8.5 14l2.5 2.5 4.5-5"/>'),
    medal: line('<circle cx="12" cy="14" r="6"/><path d="M8 3l2 6M16 3l-2 6"/>'),

    // the big four
    cloud: line('<path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11 3.5 3.5 0 0 0 7 18z"/>'),
    chat: line('<path d="M4 5h16v10H9l-5 4z"/>'),
    house: line('<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>'),
    heart: line('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'),
    shirt: line('<path d="M8 4l-4 3 2 3 2-1v11h8V9l2 1 2-3-4-3-2 2h-4z"/>'),

    // routine steps
    // a smiling tooth and a toothbrush with paste
    teeth: art48(`<path d="M5 15c0-5 5-6 8-4.5 2 1 4 1 6 0 3-1.5 8-.5 8 4.5 0 5-2 8-2.5 13-.6 6-1.5 13-4 13-2.5 0-2.5-6-3.5-9-.5-1.5-1.5-1.5-2 0-1 3-1 9-3.5 9s-3.5-7-4-13C7 23 5 20 5 15z" fill="#FFFFFF" ${K}/>
      <circle cx="12.5" cy="20" r="1.7" fill="#3B2F2F"/><circle cx="21.5" cy="20" r="1.7" fill="#3B2F2F"/>
      <path d="M13 25q4 3.5 8 0" fill="none" ${K}/><circle cx="10" cy="24" r="1.8" fill="#F2A7BE"/><circle cx="24" cy="24" r="1.8" fill="#F2A7BE"/>
      <rect x="37" y="20" width="6" height="25" rx="3" fill="#2F7E79" ${K}/><rect x="37" y="33" width="6" height="5" fill="#235F5B"/>
      <rect x="36.5" y="4" width="7.5" height="18" rx="3" fill="#FFFFFF" ${K}/>
      <rect x="30.5" y="5.5" width="6" height="14.5" rx="1.6" fill="#BFE3F7" ${K}/><path d="M30.5 9.2h6M30.5 12.8h6M30.5 16.4h6" stroke="#8EB8E5" stroke-width="1.2"/>
      <path d="M31 5.5c-2.6-.3-3.6 2.2-1.8 3.2-2 .5-1.8 3.4.4 3.3-1.6 1.3-.4 3.6 1.4 3" fill="#A8E0D4" stroke="#4E9E8E" stroke-width="1.3" stroke-linejoin="round"/>
      ${SPARK(6, 7, 4)}${SPARK(28, 38, 3.4, '#BFE3F7')}`),
    bowl: line('<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M9 4c-1 1.5 1 2.5 0 4M14 4c-1 1.5 1 2.5 0 4"/>'),
    // a school with a clock, flag and windows
    school: art48(`<path d="M3 43h42" stroke="#7FB069" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 9V2" ${K}/><path d="M24 2.5h8l-2 2.5 2 2.5h-8z" fill="#F4D35E" ${K}/>
      <rect x="8" y="20" width="32" height="23" fill="#F6C28B" ${K}/>
      <path d="M4 21.5 24 8l20 13.5z" fill="#E07A5F" ${K}/>
      <circle cx="24" cy="17" r="3.6" fill="#FFFFFF" ${K}/><path d="M24 15.2V17l1.3.9" stroke="#3B2F2F" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <rect x="11" y="24.5" width="7" height="6" rx="1" fill="#BFE3F7" ${K}/><rect x="30" y="24.5" width="7" height="6" rx="1" fill="#BFE3F7" ${K}/>
      <rect x="11" y="34" width="7" height="6" rx="1" fill="#BFE3F7" ${K}/><rect x="30" y="34" width="7" height="6" rx="1" fill="#BFE3F7" ${K}/>
      <path d="M20 43V33a4 4 0 0 1 8 0v10z" fill="#A87B50" ${K}/><circle cx="26" cy="38.5" r=".9" fill="#3B2F2F"/>`),
    // a plate with a fried egg, a fork and a knife
    cutlery: art48(`<circle cx="24" cy="25" r="14" fill="#FFFFFF" ${K}/><circle cx="24" cy="25" r="10" fill="#DCEEF7"/>
      <path d="M17.5 24c-1-4.5 3-7.5 6.5-6.5 3.5-1.8 8 1.5 7 5.5 1.5 3-1 7-5 6.5-3 2-7.5 0-8.5-2.5-1.3-.6-1-2.4 0-3z" fill="#FFFFFF" stroke="#D6C4A8" stroke-width="1.3"/>
      <circle cx="24.5" cy="24.5" r="3.6" fill="#F4D35E" stroke="#E09A2E" stroke-width="1.4"/><circle cx="23.4" cy="23.4" r="1" fill="#FFF8DC"/>
      <path d="M4 5v8M6.5 5v8M9 5v8" stroke="#3B2F2F" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M3.4 12.5h6.2v2.5a3.1 3.1 0 0 1-6.2 0z" fill="#D5DDE5" ${K}/><rect x="5.3" y="17.5" width="2.4" height="25" rx="1.2" fill="#D5DDE5" ${K}/>
      <path d="M40.5 5c3.5 2 4.5 9 4 17h-4z" fill="#D5DDE5" ${K}/><rect x="39.6" y="21" width="4" height="22" rx="2" fill="#C9A27E" ${K}/>`),
    bath: line('<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M6 12V6a2 2 0 0 1 4 0"/>'),
    dentist: line('<path d="M8 4c-3 0-4 3-3 6 1 2 1 4 2 8 .5 2 2 2 2.5 0L10 14h4l.5 4c.5 2 2 2 2.5 0 1-4 1-6 2-8 1-3 0-6-3-6-2 0-2.5 1-4 1S10 4 8 4z"/>'),
    scissors: line('<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8 16 19 4M16 16 5 4"/>'),
    ball: line('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3.2 3.2 3.2 9.6 0 12.8M18.4 5.6c-3.2 3.2-3.2 9.6 0 12.8"/>'),
    book: line('<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>'),
    train: line('<rect x="5" y="3" width="14" height="14" rx="4"/><path d="M5 10h14M9 21l2-4M15 21l-2-4"/><path d="M8.5 13.5h.01M15.5 13.5h.01" stroke-width="3"/>'),
    tree: line('<path d="M12 21v-6"/><path d="M12 3a5 5 0 0 0-4.6 7A4 4 0 0 0 9 17h6a4 4 0 0 0 1.6-7A5 5 0 0 0 12 3z"/>'),
    tablet: line('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M11 18h2"/>'),
    // a chunky, friendly pointing hand with a starry sleeve (the guide hand)
    hand: (size, cls) => {
      const shapes = '<rect x="24" y="4" width="19" height="56" rx="9.5"/><rect x="24" y="40" width="56" height="42" rx="18"/>' +
        '<rect x="42" y="37" width="14" height="21" rx="7"/><rect x="55" y="39" width="13" height="21" rx="6.5"/><rect x="67" y="43" width="12" height="19" rx="6"/>' +
        '<ellipse cx="24" cy="63" rx="12" ry="8" transform="rotate(-35 24 63)"/>';
      return `<svg class="ic ${cls || ''}" width="${size || 24}" height="${size || 24}" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="#3B2F2F" stroke="#3B2F2F" stroke-width="7" stroke-linejoin="round">${shapes}<rect x="27" y="74" width="58" height="24" rx="9"/></g>
        <g fill="#FFD2A6">${shapes}</g>
        <path d="M56 41v12M68 44v12" stroke="#E3A77B" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="28" y="7" width="11" height="9" rx="4.5" fill="#FFF1E8"/><ellipse cx="29.5" cy="27" rx="2.6" ry="7" fill="#fff" opacity=".55"/>
        <rect x="27" y="74" width="58" height="24" rx="9" fill="#7E64C8"/><rect x="27" y="74" width="58" height="7" rx="3.5" fill="#F4D35E"/>
        <path class="hand-star" d="M44 86l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z" fill="#F4D35E"/><circle cx="62" cy="90" r="2.4" fill="#F2A7BE"/><circle cx="74" cy="86" r="2" fill="#A8E0D4"/>
        <polygon class="hand-star" points="8 3 9.6 6.6 13.4 7 10.6 9.6 11.4 13.3 8 11.4 4.6 13.3 5.4 9.6 2.6 7 6.4 6.6" fill="#FFC727" stroke="#F2A100" stroke-width="1.4" stroke-linejoin="round"/><circle cx="52" cy="10" r="3" fill="#A8E0D4"/></svg>`;
    },
    rain: line('<path d="M7 15h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 8 3.5 3.5 0 0 0 7 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>'),
    clock: line('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    busLine: line('<rect x="4" y="4" width="16" height="13" rx="3"/><path d="M4 11h16"/><circle cx="8" cy="19" r="1.6"/><circle cx="16" cy="19" r="1.6"/>'),

    // talk board
    help: line('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>'),
    stop: line('<polygon points="8 3 16 3 21 8 21 16 16 21 8 21 3 16 3 8"/><path d="M8 12h8"/>'),
    pause: line('<rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/>'),
    hourglass: line('<path d="M7 3h10M7 21h10M8 3v3l4 6 4-6V3M8 21v-3l4-6 4 6v3"/>'),
    pin: line('<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>'),
    yes: line('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'),
    no: line('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
    smile: line('<circle cx="12" cy="12" r="9"/><path d="M8 14a5 5 0 0 0 8 0"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="3"/>'),

    // calm tools
    balloon: line('<circle cx="12" cy="9" r="6"/><path d="M12 15c-1 2 1 3 0 6"/>'),
    squeeze: line('<ellipse cx="12" cy="12" rx="9" ry="5.5"/>'),
    count: art('<circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><circle cx="19" cy="12" r="3" fill="currentColor"/>'),
    music: line('<path d="M9 18V5l10-2v13"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="16" r="2.2"/>'),

    // coloured art
    // glossy, rounded star (stars you earn, and the stars to tap)
    star: (size, cls) => glossyStar(size, cls),
    starGrey: art(`<polygon points="${STAR}" fill="#D6CEC3" stroke="#C3B9AC" stroke-width="2.2" stroke-linejoin="round"/>`),
    sparkle: (size, cls) => glossyStar(size, cls),
    sun: art('<circle cx="12" cy="12" r="4.5" fill="#F4D35E" stroke="#E09A2E" stroke-width="2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="#E09A2E" stroke-width="2" stroke-linecap="round"/>'),
    play: art('<circle cx="12" cy="12" r="11" fill="#FFFFFF"/><polygon points="10 7.5 16.5 12 10 16.5" fill="#2F7E79"/>'),
    bus: art('<rect x="4" y="4" width="16" height="13" rx="3" fill="#F4D35E" stroke="#3B2F2F" stroke-width="2"/><path d="M4 11h16" stroke="#3B2F2F" stroke-width="2"/><rect x="6.5" y="6" width="4.5" height="3.5" rx=".8" fill="#fff"/><rect x="13" y="6" width="4.5" height="3.5" rx=".8" fill="#fff"/><circle cx="8" cy="19" r="1.8" fill="#3B2F2F"/><circle cx="16" cy="19" r="1.8" fill="#3B2F2F"/>'),
    busPurple: art('<rect x="4" y="4" width="16" height="13" rx="3" fill="#B9A6E0" stroke="#3B2F2F" stroke-width="2"/><path d="M4 11h16" stroke="#3B2F2F" stroke-width="2"/><rect x="6.5" y="6" width="4.5" height="3.5" rx=".8" fill="#fff"/><rect x="13" y="6" width="4.5" height="3.5" rx=".8" fill="#fff"/><circle cx="8" cy="19" r="1.8" fill="#3B2F2F"/><circle cx="16" cy="19" r="1.8" fill="#3B2F2F"/>')
  };

  Object.assign(ICONS, {
    // ---------- before-you-go checklist things (colour) ----------
    shoes: art48(`<path d="M4 34c0-6 2-12 4-14h7c0 4 4 7 9 8l10 2c5 1 8 3 8 6v2H4z" fill="#8EB8E5" ${K}/><path d="M4 36h38v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#FFFFFF" ${K}/><path d="M16 26l3 2M19 23.5l3 2" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>`),
    bottle: art48(`<rect x="18" y="4" width="12" height="6" rx="2" fill="#2F7E79" ${K}/><path d="M17 10h14l2 6v24a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V16z" fill="#CFE6F5" ${K}/><path d="M16 24h16v16a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="#8EB8E5"/><path d="M21 18v4" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>`),
    lunchbox: art48(`<path d="M16 14v-3a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" fill="none" ${K}/><rect x="5" y="14" width="38" height="27" rx="6" fill="#EF8A7A" ${K}/><path d="M5 23h38" ${K}/><rect x="20" y="20" width="8" height="6" rx="2" fill="#F4D35E" ${K}/><circle cx="13" cy="33" r="3" fill="#FFFFFF" opacity=".7"/>`),
    bag: art48(`<path d="M17 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" fill="none" ${K}/><rect x="8" y="10" width="32" height="34" rx="9" fill="#E07A5F" ${K}/><rect x="14" y="27" width="20" height="12" rx="3" fill="#EF8A7A" ${K}/><path d="M14 31h20" ${K}/><path d="M12 18h24" stroke="#B5543B" stroke-width="1.8" stroke-linecap="round"/>`),
    buscard: art48(`<rect x="4" y="11" width="40" height="27" rx="5" fill="#7E64C8" ${K}/><rect x="9" y="17" width="9" height="7" rx="1.5" fill="#F4D35E"/><path d="M9 30h18M9 34h12" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/><path d="M33 20a6 6 0 0 1 0 9M37 17a10 10 0 0 1 0 15" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>`),
    umbrella: art48(`<path d="M4 24C4 13 13 6 24 6s20 7 20 18c-2.5-2-5-2-7 0-2.5-2-5.5-2-8 0-2.5-2-5.5-2-8 0-2.5-2-5.5-2-8 0-2-2-4.5-2-9 0z" fill="#F2A7BE" ${K}/><path d="M24 6v32a4 4 0 0 1-8 0" fill="none" ${K}/><path d="M14 22c1-7 5-13 10-16M34 22c-1-7-5-13-10-16" stroke="#D9849E" stroke-width="1.5" fill="none"/>`),
    jacket: art48(`<path d="M17 6l-9 5-4 22 7 1 1-12v22h24V22l1 12 7-1-4-22-9-5c-1 3-4 5-7 5s-6-2-7-5z" fill="#F4D35E" ${K}/><path d="M24 11v33" ${K}/><circle cx="27" cy="20" r="1.2" fill="#3B2F2F"/><circle cx="27" cy="28" r="1.2" fill="#3B2F2F"/><path d="M14 30h6M28 30h6" stroke="#C98A1E" stroke-width="2" stroke-linecap="round"/>`),
    cap2: art48(`<path d="M7 30c0-11 7-18 17-18s17 7 17 18z" fill="#2F7E79" ${K}/><path d="M30 30c5 0 12 1 15 5H24z" fill="#235F5B" ${K}/><circle cx="24" cy="12" r="2" fill="#F4D35E" ${K}/>`),
    folder: art48(`<path d="M4 12a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#8EB8E5" ${K}/><rect x="11" y="18" width="22" height="15" rx="1.5" fill="#FFFFFF" ${K}/><path d="M15 23h14M15 27h10" stroke="#9C8B7A" stroke-width="1.6" stroke-linecap="round"/>`),
    pencilcase: art48(`<rect x="4" y="16" width="40" height="20" rx="8" fill="#9CCB7A" ${K}/><path d="M8 18h32" stroke="#4F8A3F" stroke-width="2" stroke-dasharray="3 2"/><path d="M20 4l8 8-9 9h-5v-5z" fill="#F4D35E" ${K}/><path d="M14 16v5h5" fill="#F6C28B" ${K}/>`),
    towel: art48(`<rect x="8" y="6" width="26" height="36" rx="4" fill="#B9A6E0" ${K}/><path d="M8 30h26M8 34h26" stroke="#FFFFFF" stroke-width="2"/><path d="M34 8h4a2 2 0 0 1 2 2v28" fill="none" ${K}/>`),
    toilet: art48(`<rect x="9" y="5" width="16" height="15" rx="3" fill="#FFFFFF" ${K}/><path d="M7 21h28c0 7-4 11-9 12v8H14v-8C10 31 7 27 7 21z" fill="#FFFFFF" ${K}/><path d="M7 21h28" ${K}/><path d="M38 12v4M36 14h4" stroke="#8EB8E5" stroke-width="2" stroke-linecap="round"/><circle cx="40" cy="26" r="3" fill="#8EB8E5"/>`),
    washhands: art48(`<path d="M10 4h14v6H10z" fill="#D5DDE5" ${K}/><path d="M24 7h6a3 3 0 0 1 3 3v3" fill="none" ${K}/><path d="M33 16c-1.5 2-2 3-2 4a2 2 0 0 0 4 0c0-1-.5-2-2-4z" fill="#8EB8E5"/><path d="M8 34c2-6 6-9 11-9h6c4 0 6 2 6 4s-2 3-4 3h-6M8 40l10-1c6 0 12-3 16-7" fill="#F6C28B" ${K}/><circle cx="18" cy="18" r="3" fill="#FFFFFF" stroke="#8EB8E5" stroke-width="1.5"/><circle cx="12" cy="22" r="2" fill="#FFFFFF" stroke="#8EB8E5" stroke-width="1.5"/>`),
    tissue: art48(`<rect x="6" y="20" width="36" height="22" rx="4" fill="#9CCB7A" ${K}/><path d="M18 20c0-6 3-12 7-14 1 4 4 6 5 14z" fill="#FFFFFF" ${K}/><path d="M6 28h36" stroke="#4F8A3F" stroke-width="1.5"/>`),
    pyjamas: art48(`<path d="M16 5l-9 6 3 8 4-2v25h20V17l4 2 3-8-9-6c-1 3-4 4-8 4s-7-1-8-4z" fill="#8EB8E5" ${K}/><path d="M20 20l1.5 2.5 2.5.5-2 2 .5 2.5-2.5-1.3-2.5 1.3.5-2.5-2-2 2.5-.5z" fill="#F4D35E"/><path d="M28 30a4 4 0 1 0 4 4 3 3 0 0 1-4-4z" fill="#FFF1C2"/>`),
    medicine: art48(`<g transform="rotate(-35 24 24)"><path d="M17 17h7v14h-7a7 7 0 0 1 0-14z" fill="#EF8A7A" ${K}/><path d="M24 17h7a7 7 0 0 1 0 14h-7z" fill="#FFFFFF" ${K}/></g>`),

    // ---------- menu, modes and areas ----------
    together: line('<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2.5 20v-2a5 5 0 0 1 5-5h1a5 5 0 0 1 3.5 1.4A5 5 0 0 1 15.5 13h1a5 5 0 0 1 5 5v2"/>'),
    puzzle: line('<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4z"/>'),
    learn: line('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M21 9v6"/>'),
    paw: line('<circle cx="6" cy="10" r="2"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="18" cy="10" r="2"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-1.5 3-4 3s-4-1-4-3z"/>'),
    gear: line('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>'),
    chart: line('<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5" rx=".5"/><rect x="12" y="8" width="3" height="9" rx=".5"/><rect x="17" y="5" width="3" height="12" rx=".5"/>'),
    bell: line('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
    drop: line('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>'),
    stretch: line('<circle cx="12" cy="5" r="2"/><path d="M5 4l7 5 7-5M12 9v6M12 15l-4 6M12 15l4 6"/>'),
    upload: line('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>'),
    volume: line('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>'),
    backspace: line('<path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z"/><path d="M12 9l6 6M18 9l-6 6"/>'),
    playPause: line('<polygon points="7 5 19 12 7 19" fill="currentColor"/>'),
    pauseFill: line('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>'),
    bubbles: line('<circle cx="9" cy="14" r="5"/><circle cx="17" cy="7" r="3"/><circle cx="18" cy="16" r="2"/><path d="M7 12.5a2 2 0 0 1 2-2"/>'),
    cards: line('<rect x="3" y="6" width="9" height="13" rx="2"/><rect x="12" y="4" width="9" height="13" rx="2" transform="rotate(8 16 10)"/>'),
    sort: line('<path d="M3 13h7v7H3zM14 13h7v7h-7z"/><path d="M12 3v6M9 6l3 3 3-3"/>'),
    shapes: line('<circle cx="6.5" cy="12" r="3.5"/><rect x="11" y="8.5" width="6" height="7" rx="1"/><path d="M20 9l2.5 6h-5z"/>'),
    shuffle: line('<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/>'),
    thumb: line('<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7"/>'),
    person: line('<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>'),
    me: line('<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/><path d="M12 15v4" stroke-width="2.6"/>'),
    you: line('<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a6 6 0 0 1 10-4.5"/><path d="M14 16h7M18 13l3 3-3 3"/>'),
    want: line('<path d="M4 14c2-3 4-4 6-4h3M20 14c-2-3-4-4-6-4"/><path d="M8 18h8M12 10V4M9 7l3-3 3 3"/>'),
    go: line('<path d="M5 12h12M12 6l6 6-6 6"/><path d="M3 5v14"/>'),
    eat: line('<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 4-3 8h3v10"/>'),
    drink: line('<path d="M6 4h12l-1.5 16a1.5 1.5 0 0 1-1.5 1.4H9a1.5 1.5 0 0 1-1.5-1.4z"/><path d="M7 10h10"/><path d="M14 4l2-2"/>'),
    please: line('<path d="M12 21c-4-2-7-5-7-9V6l3 1 1 4M12 21c4-2 7-5 7-9V6l-3 1-1 4"/><path d="M9 11c0 3 1.5 5 3 6 1.5-1 3-3 3-6"/>'),
    dont: line('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'),
    open: line('<path d="M3 10l9-4 9 4v9l-9 3-9-3z"/><path d="M3 10l9 3 9-3M12 13v9M3 10 1 6l9-4 2 4M21 10l2-4-9-4-2 4"/>'),
    come: line('<path d="M19 12H7M12 6l-6 6 6 6"/><path d="M21 5v14"/>'),
    hurt: line('<rect x="2" y="9" width="20" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M10 11h.01M12 13h.01M14 11h.01M12 9.5h.01" stroke-width="2.6"/>'),
    big: line('<rect x="3" y="3" width="18" height="18" rx="3"/>'),
    little: line('<rect x="9" y="9" width="6" height="6" rx="1.5"/><rect x="3" y="3" width="18" height="18" rx="3" stroke-dasharray="2 3"/>'),
    hot: line('<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-6 1-9z"/>'),
    cold: line('<path d="M12 2v20M4 7l16 10M20 7 4 17M9 4l3 2 3-2M9 20l3-2 3 2"/>'),
    what: line('<path d="M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.4-1.5 2.4v1"/><path d="M12 19h.01" stroke-width="3"/><circle cx="12" cy="12" r="10"/>'),
    who: line('<circle cx="10" cy="8" r="4"/><path d="M3 21v-1a7 7 0 0 1 11-5.7"/><path d="M17 15a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2M19 21h.01" stroke-width="2.2"/>'),
    like: line('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M9 11l2 2 4-4"/>'),
    feed: line('<path d="M3 13h18a9 9 0 0 1-18 0z"/><circle cx="9" cy="10" r="1.5"/><circle cx="13" cy="9" r="1.5"/><circle cx="16" cy="10.5" r="1.3"/>'),
    soap: line('<rect x="4" y="11" width="16" height="9" rx="4"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="5" r="1.5"/><circle cx="17" cy="9" r="1"/>'),
    sleep: line('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/><path d="M15 3h4l-4 4h4"/>'),
    text: line('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
    motion: line('<path d="M3 12c3-6 6-6 9 0s6 6 9 0"/>'),
    sliders: line('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    target: line('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'),
    swap: line('<path d="M4 8h14l-4-4M20 16H6l4 4"/>'),
    jump: line('<circle cx="12" cy="4" r="2"/><path d="M6 9l6 2 6-2M12 11v4l-4 4M12 15l4 4"/><path d="M4 22h16" stroke-dasharray="2 2"/>'),
    hug: line('<circle cx="12" cy="6" r="3"/><path d="M4 12c2 3 5 4 8 4s6-1 8-4M7 21v-4M17 21v-4"/><path d="M9 13l3 2 3-2"/>'),
    snack: line('<circle cx="12" cy="12" r="8"/><path d="M9 9h.01M14 8h.01M15 13h.01M10 14h.01" stroke-width="2.6"/>'),
    quiet: line('<path d="M12 3a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4z"/><path d="M4 4l16 16"/>'),
    flag: line('<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>'),
    restart: line('<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 4v4.5h4.5"/>', 2.6),
    exit: line('<path d="M14 4H6v16h8"/><path d="M11 12h10M17 8l4 4-4 4"/>', 2.4),
    trophy: line('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>'),
    journal: line('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12 8h4M12 12h4"/>'),
    storybook: line('<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/><path d="M15 9l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="currentColor"/>'),
    fun: line('<path d="M12 3l2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 14.8 7.4 17.2l.9-5.1-3.8-3.6 5.2-.8z"/><path d="M5 20h.01M19 20h.01M12 21h.01" stroke-width="3"/>'),
    // streaks
    flame: art('<path d="M12 1.5c1.2 3.8 6.6 6.3 6.6 12.6a6.6 6.6 0 0 1-13.2 0c0-3.2 1.6-4.9 3.2-6.4.3 2.1 1.1 3.2 2.1 3.7C10.9 8.6 10.4 4.6 12 1.5z" fill="#FF9600" stroke="#E06A00" stroke-width="1"/><path d="M12 11.2c.9 2.1 3.4 3.3 3.4 6.2a3.4 3.4 0 0 1-6.8 0c0-1.7 1-2.7 1.9-3.5.2 1 .6 1.6 1.2 1.8-.3-1.7-.2-3.1.3-4.5z" fill="#FFC800"/>'),
    flameGrey: art('<path d="M12 1.5c1.2 3.8 6.6 6.3 6.6 12.6a6.6 6.6 0 0 1-13.2 0c0-3.2 1.6-4.9 3.2-6.4.3 2.1 1.1 3.2 2.1 3.7C10.9 8.6 10.4 4.6 12 1.5z" fill="#D6CEC3" stroke="#B8AC9C" stroke-width="1"/><path d="M12 11.2c.9 2.1 3.4 3.3 3.4 6.2a3.4 3.4 0 0 1-6.8 0c0-1.7 1-2.7 1.9-3.5.2 1 .6 1.6 1.2 1.8-.3-1.7-.2-3.1.3-4.5z" fill="#EDE7DF"/>'),
    shield: art('<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#8EB8E5" stroke="#4A78A8" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 7l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#fff"/>')
  });

  // ---------- kid-friendly colour icons (chunky outlines, bright fills, little faces) ----------
  const K2 = 'stroke="#3B2F2F" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const FACE = (x, y, s, sleepy) => {
    const k = s || 1;
    const eyes = sleepy
      ? `<path d="M${x - 6 * k} ${y} q${2 * k} ${2 * k} ${4 * k} 0 M${x + 2 * k} ${y} q${2 * k} ${2 * k} ${4 * k} 0" fill="none" stroke="#3B2F2F" stroke-width="${1.8 * k}" stroke-linecap="round"/>`
      : `<circle cx="${x - 4 * k}" cy="${y}" r="${1.7 * k}" fill="#3B2F2F"/><circle cx="${x + 4 * k}" cy="${y}" r="${1.7 * k}" fill="#3B2F2F"/><circle cx="${x - 3.5 * k}" cy="${y - 0.6 * k}" r="${0.5 * k}" fill="#fff"/><circle cx="${x + 4.5 * k}" cy="${y - 0.6 * k}" r="${0.5 * k}" fill="#fff"/>`;
    return eyes + `<path d="M${x - 3 * k} ${y + 3.6 * k} q${3 * k} ${3 * k} ${6 * k} 0" fill="none" stroke="#3B2F2F" stroke-width="${1.8 * k}" stroke-linecap="round"/>` +
      `<circle cx="${x - 7.5 * k}" cy="${y + 3 * k}" r="${1.7 * k}" fill="#F2A7BE" opacity=".9"/><circle cx="${x + 7.5 * k}" cy="${y + 3 * k}" r="${1.7 * k}" fill="#F2A7BE" opacity=".9"/>`;
  };
  const SHINE = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55"/>`;
  Object.assign(ICONS, {
    // "I need a break": a calm open hand, like a break card
    kBreak: art48(`<circle cx="24" cy="24" r="21.5" fill="#E9E1FA" ${K2}/>
      <g transform="translate(24 24.6) scale(.84) translate(-24 -25)">
      <rect x="10.2" y="21" width="7.4" height="15" rx="3.7" fill="#FFD3AE" ${K2} transform="rotate(-36 13.9 33)"/>
      <rect x="12.5" y="12.5" width="6.6" height="18" rx="3.3" fill="#FFD3AE" ${K2}/><rect x="19.1" y="8.5" width="6.8" height="22" rx="3.4" fill="#FFD3AE" ${K2}/>
      <rect x="25.9" y="9.8" width="6.8" height="21" rx="3.4" fill="#FFD3AE" ${K2}/><rect x="32.7" y="14.5" width="6.3" height="16" rx="3.15" fill="#FFD3AE" ${K2}/>
      <path d="M12.5 24 H39 V31.5 a9.5 9.5 0 0 1 -9.5 9.5 H22 a9.5 9.5 0 0 1 -9.5 -9.5 Z" fill="#FFD3AE"/>
      <path d="M39 25 V31.5 a9.5 9.5 0 0 1 -9.5 9.5 H22 a9.5 9.5 0 0 1 -8.6 -5.5" fill="none" ${K2}/>
      ${SHINE(15, 16, 1, 2.4)}${SHINE(21.8, 12, 1, 2.4)}
      <circle cx="22.9" cy="32.2" r="1.5" fill="#3B2F2F"/><circle cx="30.1" cy="32.2" r="1.5" fill="#3B2F2F"/><path d="M24.1 35.2 q2.4 2.4 4.8 0" fill="none" stroke="#3B2F2F" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="19.9" cy="34.6" r="1.6" fill="#F2A7BE"/><circle cx="33.1" cy="34.6" r="1.6" fill="#F2A7BE"/></g>`),
    kDay: art48(`<rect x="6" y="10" width="36" height="32" rx="7" fill="#fff" ${K2}/><path d="M6 17a7 7 0 0 1 7-7h22a7 7 0 0 1 7 7v4H6z" fill="#EF8A7A" ${K2}/>
      <rect x="13" y="5" width="5" height="10" rx="2.5" fill="#8EB8E5" ${K2}/><rect x="30" y="5" width="5" height="10" rx="2.5" fill="#8EB8E5" ${K2}/>
      <circle cx="24" cy="31.5" r="7.5" fill="#FFD23F" ${K2}/>${FACE(24, 30.5, 0.75)}`),
    kTalk: art48(`<path d="M9 8h30a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5H22l-9 8v-8H9a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5z" fill="#6FCBBE" ${K2}/>${SHINE(12, 13, 3, 2)}${FACE(24, 19, 1.1)}`),
    kCalm: art48(`<path d="M13 37h23a8.5 8.5 0 0 0 1-17 11.5 11.5 0 0 0-22-2 8.5 8.5 0 0 0-2 19z" fill="#D7CCF6" ${K2}/>${SHINE(18, 22, 3.5, 2)}${FACE(25, 27, 1, true)}
      <path d="M38 6h5l-5 5h5" fill="none" stroke="#7E64C8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`),
    kFun: art48(`<path d="M24 3.5l6 12.4 13.6 2-9.8 9.6 2.3 13.5L24 34.6l-12.1 6.4 2.3-13.5-9.8-9.6 13.6-2z" fill="#FFD23F" ${K2}/>${SHINE(19, 15, 2.5, 1.6)}${FACE(24, 24, 1)}`),
    kPuzzle: art48(`<path d="M8 13h10a4.5 4.5 0 1 1 9 0h10v10a4.5 4.5 0 1 1 0 9v10H27a4.5 4.5 0 1 0-9 0H8z" fill="#8FD07A" ${K2}/>${SHINE(13, 18, 2.5, 1.6)}${FACE(22, 27, 1)}`),
    kStories: art48(`<path d="M3 13c7-3 14-3 21 1 7-4 14-4 21-1v27c-7-3-14-3-21 1-7-4-14-4-21-1z" fill="#F59FBF" ${K2}/>
      <path d="M6 12c6-2 12-2 18 2v24c-6-4-12-4-18-2zM42 12c-6-2-12-2-18 2v24c6-4 12-4 18-2z" fill="#fff" ${K2}/>
      <path d="M10 19c3-.8 6-.6 9 .6M10 24c3-.8 6-.6 9 .6M29 19.6c3-1.2 6-1.4 9-.6M29 24.6c3-1.2 6-1.4 9-.6" stroke="#D6C4A8" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M33 2l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="#FFD23F" stroke="#3B2F2F" stroke-width="1.4" stroke-linejoin="round"/>`),
    kLearn: art48(`<path d="M4 18 24 9l20 9-20 9z" fill="#6C7BD9" ${K2}/><path d="M12 22v9c7 5 17 5 24 0v-9l-12 5z" fill="#8E9BEA" ${K2}/>
      <path d="M44 18v10" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round"/><circle cx="44" cy="31" r="3.5" fill="#FFD23F" ${K2}/>${SHINE(20, 15, 4, 1.4)}`),
    kHint: art48(`<path d="M24 5a14 14 0 0 0-8 25.5V35h16v-4.5A14 14 0 0 0 24 5z" fill="#FFE066" ${K2}/><rect x="16" y="35" width="16" height="7" rx="3" fill="#C9D3DC" ${K2}/>${SHINE(18, 12, 2.5, 4)}${FACE(24, 19, 1)}`),
    kPet: art48(`<ellipse cx="11" cy="20" rx="6" ry="11" fill="#A87B50" transform="rotate(18 11 20)" ${K2}/><ellipse cx="37" cy="20" rx="6" ry="11" fill="#A87B50" transform="rotate(-18 37 20)" ${K2}/>
      <circle cx="24" cy="26" r="15" fill="#E7B98A" ${K2}/><ellipse cx="24" cy="32" rx="8" ry="6" fill="#F6DCC0"/>
      <circle cx="19" cy="23" r="2" fill="#3B2F2F"/><circle cx="29" cy="23" r="2" fill="#3B2F2F"/><ellipse cx="24" cy="29" rx="3.2" ry="2.4" fill="#3B2F2F"/>
      <path d="M21 32.5q3 2.5 6 0" fill="none" stroke="#3B2F2F" stroke-width="1.8" stroke-linecap="round"/><path d="M23 34h2.4v3a1.2 1.2 0 0 1-2.4 0z" fill="#EF8A7A"/>`),
    kDress: art48(`<path d="M16 6 6 12l4 9 5-2v23h18V19l5 2 4-9-10-6c-1 3.5-4 5.5-8 5.5S17 9.5 16 6z" fill="#F59FBF" ${K2}/><path d="M24 20l2 4.2 4.6.6-3.4 3.2.9 4.6-4.1-2.3-4.1 2.3.9-4.6-3.4-3.2 4.6-.6z" fill="#FFD23F" stroke="#3B2F2F" stroke-width="1.5" stroke-linejoin="round"/>`),
    kRoom: art48(`<path d="M9 22v20h30V22" fill="#FFE3B8" ${K2}/><path d="M4 24 24 7l20 17" fill="#EF6F5E" ${K2}/><path d="M4 24 24 7l20 17z" fill="#EF6F5E" ${K2}/>
      <rect x="20" y="29" width="9" height="13" rx="2" fill="#A87B50" ${K2}/><rect x="12" y="27" width="6" height="6" rx="1.5" fill="#BFE3F7" ${K2}/><rect x="31" y="27" width="6" height="6" rx="1.5" fill="#BFE3F7" ${K2}/>
      <path d="M24 20c-1.4-2-4.5-1.2-4 1.2.3 1.5 2.5 3 4 4 1.5-1 3.7-2.5 4-4 .5-2.4-2.6-3.2-4-1.2z" fill="#fff"/>`),
    kTogether: art48(`<circle cx="15" cy="24" r="11" fill="#F6C28B" ${K2}/>${FACE(15, 23, 0.85)}<circle cx="33" cy="24" r="11" fill="#9CC7EE" ${K2}/>${FACE(33, 23, 0.85)}
      <path d="M24 9c-1.5-2.2-5-1.4-4.5 1.3.3 1.7 2.8 3.4 4.5 4.6 1.7-1.2 4.2-2.9 4.5-4.6.5-2.7-3-3.5-4.5-1.3z" fill="#EF6F8E" stroke="#3B2F2F" stroke-width="1.6"/>
      <path d="M15 40c3 4 15 4 18 0" fill="none" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round"/>`),
    // Together on the main menu: two chunky friends side by side with a heart (same style as the lock)
    kDuo: art48(`<path d="M24.5 43v-4.5a9.5 9.5 0 0 1 19 0V43z" fill="#8EB8E5" ${K2}/><circle cx="34" cy="20.5" r="7.5" fill="#8EB8E5" ${K2}/>${SHINE(30.6, 16.4, 1.4, 1.8)}${FACE(34, 21, 0.55)}
      <path d="M4.5 43v-5a11 11 0 0 1 22 0v5z" fill="#F4A3B9" ${K2}/><circle cx="15.5" cy="19" r="8.5" fill="#F4A3B9" ${K2}/>${SHINE(11.6, 14.4, 1.6, 2)}${FACE(15.5, 19.5, 0.6)}
      <path d="M24.6 13.2c-3-2-5.2-4-5-6.4.2-2.2 3-3 5-1.2 2-1.8 4.8-1 5 1.2.2 2.4-2 4.4-5 6.4z" fill="#F07C9B" ${K2} stroke-width="1.8"/>`),
    kLock: art48(`<path d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#3B2F2F" stroke-width="6" stroke-linecap="round"/><path d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#C9D3DC" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="9" y="20" width="30" height="22" rx="6" fill="#FFC93C" ${K2}/>${SHINE(14, 25, 2, 3)}${FACE(24, 30, 0.9)}`),
    // Play on the main menu: a chunky rounded play button with a face (same style as the icons beside it)
    kPlay: art48(`<path d="M17.5 8.6Q13.5 6.6 13.5 11V37q0 4.4 4 2.4l21.4-12q3.6-2.4 0-4.8z" fill="#6FCBBE" ${K2}/>${SHINE(17.6, 14.5, 1.8, 3)}${FACE(22.5, 23.5, 0.8)}`),
    kBalloon: art48(`<path d="M24 36c-1 3 2 4 0 8" fill="none" stroke="#3B2F2F" stroke-width="2" stroke-linecap="round"/><ellipse cx="24" cy="19" rx="13" ry="15" fill="#EF8A7A" ${K2}/><path d="M21.5 34h5l-2.5-2.5z" fill="#EF8A7A" ${K2}/>${SHINE(18.5, 12, 3, 5)}`),
    kSqueeze: art48(`<ellipse cx="24" cy="27" rx="19" ry="14" fill="#FFD23F" ${K2}/>${SHINE(14, 20, 4, 2)}${FACE(24, 26, 1.05)}<path d="M4 14l4 4M44 14l-4 4M24 6v5" stroke="#E0B83A" stroke-width="2.4" stroke-linecap="round"/>`),
    kCount: art48(`<rect x="5" y="8" width="38" height="32" rx="6" fill="#fff" ${K2}/><path d="M9 17h30M9 25h30M9 33h30" stroke="#C9B8A4" stroke-width="2"/>
      <circle cx="14" cy="17" r="3.6" fill="#EF8A7A" ${K2}/><circle cx="14" cy="25" r="3.6" fill="#FFD23F" ${K2}/><circle cx="22" cy="25" r="3.6" fill="#FFD23F" ${K2}/>
      <circle cx="14" cy="33" r="3.6" fill="#8FD07A" ${K2}/><circle cx="22" cy="33" r="3.6" fill="#8FD07A" ${K2}/><circle cx="30" cy="33" r="3.6" fill="#8FD07A" ${K2}/>`),
    kBell: art48(`<path d="M24 6a12 12 0 0 0-12 12v9l-4 6h32l-4-6v-9A12 12 0 0 0 24 6z" fill="#FFC93C" ${K2}/><circle cx="24" cy="38" r="4" fill="#E09A2E" ${K2}/><circle cx="24" cy="5" r="2.5" fill="#E09A2E" ${K2}/>${SHINE(18, 15, 2.2, 4)}
      <path d="M41 10q3 3 0 7M7 10q-3 3 0 7" fill="none" stroke="#8EB8E5" stroke-width="2.4" stroke-linecap="round"/>`),
    kBubbles: art48(`<circle cx="18" cy="27" r="13" fill="#BFE3F7" ${K2}/><circle cx="35" cy="14" r="8" fill="#DCD1F4" ${K2}/><circle cx="37" cy="34" r="6" fill="#CFE8C4" ${K2}/>
      ${SHINE(13, 21, 3.5, 2.5)}${SHINE(32, 10.5, 2, 1.4)}${SHINE(35, 31.5, 1.6, 1.1)}`),
    kCards: art48(`<rect x="5" y="10" width="20" height="28" rx="4" fill="#6FCBBE" transform="rotate(-10 15 24)" ${K2}/><rect x="22" y="9" width="20" height="28" rx="4" fill="#F59FBF" transform="rotate(10 32 23)" ${K2}/>
      <path d="M14 20l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="#fff"/><path d="M32 21c-1.3-1.8-4-1-3.6 1.1.3 1.4 2.2 2.7 3.6 3.6 1.4-.9 3.3-2.2 3.6-3.6.4-2.1-2.3-2.9-3.6-1.1z" fill="#fff"/>`),
    kSort: art48(`<rect x="4" y="26" width="18" height="16" rx="3" fill="#FFB067" ${K2}/><rect x="26" y="26" width="18" height="16" rx="3" fill="#8EB8E5" ${K2}/>
      <circle cx="13" cy="10" r="5" fill="#EF8A7A" ${K2}/><rect x="30" y="5" width="10" height="10" rx="2" fill="#8FD07A" ${K2}/><path d="M13 16v5M35 17v4" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round"/><path d="M10.5 19l2.5 3 2.5-3M32.5 18.5l2.5 3 2.5-3" fill="none" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`),
    kShapes: art48(`<circle cx="15" cy="30" r="10" fill="#EF8A7A" ${K2}/><rect x="24" y="22" width="18" height="18" rx="3" fill="#8EB8E5" ${K2}/><path d="M24 4l11 18H13z" fill="#FFD23F" ${K2}/>`),
    kTurns: art48(`<path d="M10 20a14 14 0 0 1 24-8l3 3" fill="none" stroke="#3B2F2F" stroke-width="6" stroke-linecap="round"/><path d="M10 20a14 14 0 0 1 24-8l3 3" fill="none" stroke="#6FCBBE" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M38 28a14 14 0 0 1-24 8l-3-3" fill="none" stroke="#3B2F2F" stroke-width="6" stroke-linecap="round"/><path d="M38 28a14 14 0 0 1-24 8l-3-3" fill="none" stroke="#F59FBF" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M39 8v9h-9z" fill="#6FCBBE" ${K2}/><path d="M9 40v-9h9z" fill="#F59FBF" ${K2}/>`),
    kHeart: art48(`<path d="M24 42C8 31 4 21 9.5 13.5c4-5.5 11-4.5 14.5 1 3.5-5.5 10.5-6.5 14.5-1C44 21 40 31 24 42z" fill="#F07C9B" ${K2}/>${SHINE(14, 16, 2.5, 3.5)}${FACE(24, 23, 1)}`),
    kFeed: art48(`<ellipse cx="24" cy="38" rx="19" ry="6" fill="#fff" ${K2}/><ellipse cx="24" cy="37" rx="12" ry="3" fill="#EFE7DA"/>
      <path d="M17 18c-4-3-11-1-11 7 0 6 4 10 7 10 1 0 2-.6 3-.6s2 .6 3 .6c3 0 7-4 7-10 0-8-7-10-11-7z" fill="#E5484D" ${K2}/><path d="M17 18c0-3 1-5 3-6" fill="none" stroke="#7A4E2A" stroke-width="2" stroke-linecap="round"/>
      <path d="M27 16c2 9 7 15 15 13 2 0 3-1 2-2.5-7 1-12-4-14-12-.6-2-3.5-1.5-3 1.5z" fill="#FFD84D" ${K2}/>${SHINE(12, 23, 1.8, 3)}`),
    kTune: art48(`<path d="M14 10a9 9 0 0 0-9 9v7l-3 5h24l-3-5v-7a9 9 0 0 0-9-9z" fill="#8EB8E5" ${K2}/><circle cx="14" cy="34" r="3" fill="#4A78A8" ${K2}/>
      <path d="M34 16a9 9 0 0 0-9 9v7l-3 5h24l-3-5v-7a9 9 0 0 0-9-9z" fill="#EF8A7A" ${K2}/><circle cx="34" cy="40" r="3" fill="#C9584A" ${K2}/>
      <path d="M30 4v8.5" stroke="#3B2F2F" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="27.5" cy="12.5" rx="3" ry="2.2" fill="#3B2F2F"/>`),
    kMaze: art48(`<rect x="5" y="5" width="38" height="38" rx="6" fill="#E7F3E1" ${K2}/>
      <path d="M5 16h22M16 27h22M5 38h11M27 27v-11M16 27v11" stroke="#8A6A4A" stroke-width="3" stroke-linecap="round"/>
      <circle cx="10" cy="10.5" r="3.5" fill="#F2A65A" ${K2}/><path d="M33 33l5-4 5 4v6h-10z" fill="#EF8A7A" ${K2}/>`),
    kCatch: art48(`<path d="M10 30h28l-4 12H14z" fill="#C9A27E" ${K2}/><path d="M12 34h24M13 38h22" stroke="#8A6A4A" stroke-width="1.4"/>
      <path d="M24 3l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.8 7-1z" fill="#FFD23F" ${K2}/><path d="M38 14l1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5z" fill="#FFD23F" ${K2}/>`),
    kFind: art48(`<circle cx="20" cy="20" r="13" fill="#DCEFED" ${K2}/><circle cx="20" cy="20" r="8" fill="#fff" stroke="#3B2F2F" stroke-width="1.6"/>${SHINE(16, 16, 2.4, 3.4)}
      <path d="M29.5 29.5l11 11" stroke="#3B2F2F" stroke-width="7" stroke-linecap="round"/><path d="M29.5 29.5l11 11" stroke="#B9A6E0" stroke-width="3.6" stroke-linecap="round"/>`),
    kWeather: art48(`<circle cx="16" cy="16" r="8" fill="#FFD23F" ${K2}/><path d="M16 2v3M16 27v3M2 16h3M27 16h3M6 6l2 2M24 24l2 2M6 26l2-2M24 8l2-2" stroke="#F4B400" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M17 36h20a7 7 0 0 0 1-13.9A10 10 0 0 0 19 23a6.5 6.5 0 0 0-2 13z" fill="#fff" ${K2}/><path d="M22 40l-2 4M29 40l-2 4M36 40l-2 4" stroke="#5E8FC4" stroke-width="2.4" stroke-linecap="round"/>`),
    kFlag: art48(`<path d="M10 44V6" stroke="#3B2F2F" stroke-width="3" stroke-linecap="round"/><path d="M11 7h26l-5 8 5 8H11z" fill="#FFB067" ${K2}/><path d="M18 12l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" fill="#FFD23F" stroke="#3B2F2F" stroke-width="1.3"/><ellipse cx="10" cy="44" rx="6" ry="2" fill="#C9B8A4"/>`)
  });

  // "Calm minimal" style swaps the colourful kid icons for simple line icons
  const LINE_FOR = { kDay: 'calendar', kTalk: 'chat', kCalm: 'cloud', kFun: 'fun', kPuzzle: 'puzzle', kStories: 'storybook', kLearn: 'learn', kHint: 'bulb', kPet: 'paw', kDress: 'shirt', kRoom: 'house', kTogether: 'together', kDuo: 'together', kLock: 'lock', kBalloon: 'balloon', kSqueeze: 'squeeze', kCount: 'count', kBell: 'bell', kBubbles: 'bubbles', kCards: 'cards', kSort: 'sort', kShapes: 'shapes', kTurns: 'swap', kHeart: 'heart', kFlag: 'flag', kFeed: 'apple', kTune: 'music', kMaze: 'puzzle', kCatch: 'star', kFind: 'search', kWeather: 'sun', wMore: 'plus', wDone: 'check', wNext: 'arrow', wDifferent: 'shuffle' };
  // ---------- colour pictures for every routine step (same style as the bus, teeth and school) ----------
  Object.assign(ICONS, {
    sShirt: art48(`<path d="M16 7 5 13l4.5 8.5 5-2.2V42h19V19.3l5 2.2L43 13 32 7c-1.2 3.4-4.2 5.4-8 5.4S17.2 10.4 16 7z" fill="#8EB8E5" ${K}/>
      <path d="M16 7c1.2 3.4 4.2 5.4 8 5.4s6.8-2 8-5.4" fill="none" stroke="#3B2F2F" stroke-width="1.8"/><rect x="27" y="22" width="6" height="6" rx="1.5" fill="#BFD8F2" ${K}/>
      <circle cx="24" cy="26" r="1.2" fill="#fff"/><circle cx="24" cy="32" r="1.2" fill="#fff"/><path d="M8 16l3 6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`),
    sWasher: art48(`<rect x="8" y="4" width="32" height="40" rx="6" fill="#fff" ${K}/><path d="M8 13h32" ${K}/><circle cx="14" cy="8.5" r="2" fill="#EF6F5E"/><rect x="20" y="7" width="14" height="3" rx="1.5" fill="#D5DDE5"/>
      <circle cx="24" cy="28" r="10.5" fill="#DCEEF7" ${K}/><path d="M15 29c3-2 6 2 9 0s6 2 9 0v1a9 9 0 0 1-18 0z" fill="#8EB8E5"/><path d="M19 23a6 6 0 0 1 4-2.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/>`),
    sRice: art48(`<path d="M37 4 27 22M42 6 30 23" stroke="#A87B50" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M6 24h36c0 10-8 18-18 18S6 34 6 24z" fill="#5B8FD9" ${K}/><path d="M9 24c1-8 7-12 15-12s14 4 15 12z" fill="#fff" ${K}/>
      <path d="M17 18l1.5 1M24 15.5l1 1.2M30 18.5l1.4.8M21 21l1 1" stroke="#D6C4A8" stroke-width="1.6" stroke-linecap="round"/><path d="M12 30h24" stroke="#8EB8E5" stroke-width="2" stroke-linecap="round" opacity=".8"/><circle cx="31" cy="20" r="2.4" fill="#EF8A7A"/>`),
    sDinner: art48(`<ellipse cx="24" cy="28" rx="20" ry="13" fill="#fff" ${K}/><ellipse cx="24" cy="28" rx="14" ry="8" fill="#F6EFE6"/>
      <path d="M13 27c5-6 13-6 18 0-5 6-13 6-18 0z" fill="#F2A65A" ${K}/><path d="M31 27l5-4v8z" fill="#F2A65A" ${K}/><circle cx="17" cy="26" r="1" fill="#3B2F2F"/>
      <circle cx="28" cy="35" r="3" fill="#7FB069" stroke="#3B2F2F" stroke-width="1.2"/><circle cx="32" cy="34" r="2.6" fill="#8FD07A" stroke="#3B2F2F" stroke-width="1.2"/>
      <path d="M20 12q2-3 0-6M26 12q2-3 0-6" stroke="#C9B8A4" stroke-width="1.8" fill="none" stroke-linecap="round"/>`),
    sPot: art48(`<path d="M17 9q2-3 0-6M24 9q2-3 0-6M31 9q2-3 0-6" stroke="#C9B8A4" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M8 18h32v14c0 6-5 10-11 10H19c-6 0-11-4-11-10z" fill="#9FB0BE" ${K}/><rect x="5" y="14" width="38" height="6" rx="3" fill="#C9D3DC" ${K}/>
      <path d="M5 24H2M43 24h3" stroke="#EF6F5E" stroke-width="3" stroke-linecap="round"/><ellipse cx="24" cy="14" rx="15" ry="3" fill="#F4C76A" ${K}/><circle cx="19" cy="13.5" r="1.6" fill="#7FB069"/><circle cx="27" cy="13" r="1.6" fill="#EF6F5E"/>
      <path d="M12 26v6" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`),
    sNoodles: art48(`<path d="M38 3 26 24M44 6 30 25" stroke="#A87B50" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M5 23h38c0 11-8 19-19 19S5 34 5 23z" fill="#E07A5F" ${K}/><ellipse cx="24" cy="23" rx="19" ry="5" fill="#F4C76A" ${K}/>
      <path d="M11 22c3-3 4 2 7-1s4 2 7-1 4 2 7-1 3 1 4 2" fill="none" stroke="#E0A040" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="21" r="2.2" fill="#fff" stroke="#3B2F2F" stroke-width="1"/><path d="M10 31c8 3 20 3 28 0" stroke="#fff" stroke-width="1.6" opacity=".6" fill="none"/>`),
    sPencil: art48(`<rect x="6" y="8" width="26" height="34" rx="3" fill="#fff" ${K}/><path d="M6 8h4v34H6z" fill="#8EB8E5" ${K}/><path d="M14 16h13M14 22h13M14 28h9" stroke="#C9D3DC" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 38 40 14l5 3.4-16 24.2-6.4 2.6z" fill="#FFD23F" ${K}/><path d="M24 38l5 3.6-6.4 2.6z" fill="#F6CBA4" ${K}/><path d="M40 14l2-3a3 3 0 0 1 5 3.4l-2 3z" fill="#F59FBF" ${K}/>`),
    sTherapy: art48(`<path d="M8 6h22a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4H17l-6 6v-6H8a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="#6FCBBE" ${K}/>
      <path d="M22 20h18a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-2v5l-5-5H22a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z" fill="#F59FBF" ${K}/>
      <path d="M31 25.6c-1-1.5-3.4-1-3 .9.2 1.2 1.9 2.4 3 3.2 1.1-.8 2.8-2 3-3.2.4-1.9-2-2.4-3-.9z" fill="#fff"/><circle cx="12" cy="15" r="1.4" fill="#3B2F2F"/><circle cx="19" cy="15" r="1.4" fill="#3B2F2F"/><path d="M13 19q2.5 2 5 0" stroke="#3B2F2F" stroke-width="1.4" fill="none" stroke-linecap="round"/>`),
    sTrain: art48(`<rect x="10" y="4" width="28" height="32" rx="7" fill="#fff" ${K}/><rect x="10" y="22" width="28" height="4" fill="#C2577A"/>
      <rect x="14" y="8" width="20" height="11" rx="3" fill="#BFE3F7" ${K}/><circle cx="16" cy="30" r="2" fill="#F4D35E" stroke="#3B2F2F" stroke-width="1.2"/><circle cx="32" cy="30" r="2" fill="#F4D35E" stroke="#3B2F2F" stroke-width="1.2"/>
      <path d="M15 36l-5 8M33 36l5 8M8 44h32" stroke="#6B7C8A" stroke-width="2.2" stroke-linecap="round"/><path d="M17 10l4 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`),
    sTree: art48(`<rect x="21" y="26" width="6" height="16" rx="2" fill="#A87B50" ${K}/><circle cx="24" cy="18" r="13" fill="#7FB069" ${K}/><circle cx="17" cy="21" r="7" fill="#8FC47A" ${K}/><circle cx="31" cy="21" r="7" fill="#8FC47A" ${K}/>
      <circle cx="19" cy="13" r="2.4" fill="#9CCB7A"/><circle cx="20" cy="22" r="1.6" fill="#EF6F5E"/><circle cx="29" cy="16" r="1.6" fill="#EF6F5E"/><path d="M4 43h40" stroke="#7FB069" stroke-width="3" stroke-linecap="round"/>`),
    sBall: art48(`<circle cx="24" cy="24" r="18" fill="#fff" ${K}/><path d="M24 6a18 18 0 0 1 0 36c6-6 6-30 0-36z" fill="#EF6F5E"/><path d="M24 6c-6 6-6 30 0 36A18 18 0 0 1 24 6z" fill="#5B8FD9"/>
      <path d="M6.5 20c8 3 27 3 35 0" fill="none" stroke="#FFD23F" stroke-width="5"/><circle cx="24" cy="24" r="18" fill="none" ${K}/><ellipse cx="16" cy="14" rx="3" ry="2" fill="#fff" opacity=".6"/>`),
    sTablet: art48(`<rect x="7" y="5" width="34" height="38" rx="5" fill="#3B2F2F"/><rect x="10" y="9" width="28" height="28" rx="2" fill="#9ED3F2"/>
      <circle cx="18" cy="17" r="4" fill="#FFD23F"/><path d="M10 33l8-9 6 6 5-5 9 8v4H10z" fill="#7FB069"/><circle cx="24" cy="40" r="1.6" fill="#9FB0BE"/>`),
    sBook: art48(`<path d="M3 12c7-3 14-3 21 1 7-4 14-4 21-1v28c-7-3-14-3-21 1-7-4-14-4-21-1z" fill="#7E64C8" ${K}/>
      <path d="M6 11c6-2 12-2 18 2v25c-6-4-12-4-18-2zM42 11c-6-2-12-2-18 2v25c6-4 12-4 18-2z" fill="#fff" ${K}/>
      <circle cx="14" cy="20" r="3.4" fill="#F4D35E"/><path d="M8 31l5-6 4 4 3-2v6c-4-1-8-1-12 0z" fill="#7FB069"/><path d="M28 18c3-.8 6-.8 9 0M28 23c3-.8 6-.8 9 0M28 28c3-.8 6-.8 7 0" stroke="#C9B8A4" stroke-width="1.8" stroke-linecap="round"/><path d="M34 2v10l2.5-2 2.5 2V3" fill="#EF6F5E" ${K}/>`),
    sBath: art48(`<circle cx="15" cy="16" r="4" fill="#fff" stroke="#BFE3F7" stroke-width="1.6"/><circle cx="22" cy="10" r="3" fill="#fff" stroke="#BFE3F7" stroke-width="1.6"/><circle cx="12" cy="8" r="2.2" fill="#fff" stroke="#BFE3F7" stroke-width="1.4"/>
      <path d="M4 22h40v6c0 7-6 12-13 12H17C10 40 4 35 4 28z" fill="#fff" ${K}/><path d="M6 24h36v3c0 2-1 3-3 3H9c-2 0-3-1-3-3z" fill="#9ED3F2"/><path d="M12 40l-2 4M36 40l2 4" ${K}/>
      <path d="M30 17c0-2 2-3.5 4-3s3 2 3 3.5c2 0 3 1 3 2.5H30z" fill="#FFD23F" ${K}/><circle cx="34.6" cy="16" r=".9" fill="#3B2F2F"/><path d="M37 16.4l2 .6-2 .6z" fill="#F2A65A"/>`),
    sShower: art48(`<path d="M8 44V8h16" fill="none" stroke="#9FB0BE" stroke-width="3" stroke-linecap="round"/><path d="M18 8h14l6 10H12z" fill="#D5DDE5" ${K}/>
      <g fill="#8EC9E8"><path d="M16 23l-1.5 4a1.6 1.6 0 0 0 3 0z"/><path d="M24 23l-1.5 4a1.6 1.6 0 0 0 3 0z"/><path d="M32 23l-1.5 4a1.6 1.6 0 0 0 3 0z"/><path d="M20 31l-1.5 4a1.6 1.6 0 0 0 3 0z"/><path d="M28 31l-1.5 4a1.6 1.6 0 0 0 3 0z"/><path d="M24 38l-1.5 4a1.6 1.6 0 0 0 3 0z"/></g>`),
    sMoon: art48(`<circle cx="24" cy="24" r="21" fill="#33406A" ${K}/><path d="M27 9a15 15 0 1 0 13 21 12 12 0 0 1-13-21z" fill="#FFE066" ${K}/>
      <path d="M16 24q2 2 4 0" stroke="#3B2F2F" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M17 29q3 2 6 0" stroke="#3B2F2F" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="14.5" cy="28" r="1.6" fill="#F2A7BE"/>
      <path d="M35 11l.8 1.8 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.7.9.4-1.9-1.4-1.3 1.9-.3z" fill="#fff"/><circle cx="37" cy="20" r="1.2" fill="#fff"/><circle cx="31" cy="37" r="1" fill="#fff"/>`),
    sNap: art48(`<rect x="4" y="22" width="40" height="18" rx="9" fill="#fff" ${K}/><path d="M10 31h28" stroke="#E6DCCB" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 6h7l-7 7h7M33 13h5l-5 5h5" fill="none" stroke="#7E64C8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 26q2 2 4 0M22 26q2 2 4 0" stroke="#3B2F2F" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M17 33q2 1.5 4 0" stroke="#3B2F2F" stroke-width="1.4" fill="none" stroke-linecap="round"/>`),
    sDentist: art48(`<path d="M8 15c0-6 6-7 9-5 2 1 4 1 6 0 3-2 9-1 9 5 0 5-2 8-3 14-.7 6-2 12-4.5 12S21.6 35 20.5 32c-.4-1.4-1.6-1.4-2 0-1 3-1 9-3.5 9S11 35 10.4 29C9.6 24 8 21 8 15z" fill="#fff" ${K}/>
      <circle cx="15.5" cy="19" r="1.5" fill="#3B2F2F"/><circle cx="24.5" cy="19" r="1.5" fill="#3B2F2F"/><path d="M17 24q3 2.5 6 0" stroke="#3B2F2F" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M36 8l2 4 4 .6-3 2.8.7 4-3.7-2-3.7 2 .7-4-3-2.8 4-.6z" fill="#BFE3F7" stroke="#8EB8E5" stroke-width="1.2" stroke-linejoin="round"/><path d="M38 26l6 16" stroke="#9FB0BE" stroke-width="2.6" stroke-linecap="round"/><circle cx="37" cy="24" r="3.4" fill="#DCEEF7" ${K}/>`),
    sScissors: art48(`<circle cx="12" cy="36" r="6" fill="#fff" stroke="#EF6F5E" stroke-width="3.4"/><circle cx="26" cy="38" r="6" fill="#fff" stroke="#EF6F5E" stroke-width="3.4"/>
      <path d="M15 31 38 6l3 2-22 26z" fill="#D5DDE5" ${K}/><path d="M22 33 42 15l2 3-20 18z" fill="#D5DDE5" ${K}/><circle cx="20" cy="31" r="1.6" fill="#3B2F2F"/>
      <rect x="30" y="34" width="14" height="5" rx="2" fill="#F59FBF" ${K}/><path d="M32 39v4M35 39v4M38 39v4M41 39v4" stroke="#3B2F2F" stroke-width="1.4" stroke-linecap="round"/>`),
    sTidy: art48(`<circle cx="15" cy="13" r="7" fill="#EF6F5E" ${K}/><path d="M9 11q6 3 12 0" stroke="#fff" stroke-width="1.6" fill="none"/><rect x="24" y="6" width="11" height="11" rx="2" fill="#5B8FD9" ${K}/><path d="M28 9h3M29.5 9v5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <rect x="5" y="20" width="38" height="22" rx="4" fill="#F4B400" ${K}/><rect x="3" y="18" width="42" height="6" rx="3" fill="#E09A2E" ${K}/><path d="M19 32h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`),
    sWork: art48(`<rect x="5" y="16" width="38" height="26" rx="5" fill="#A87B50" ${K}/><path d="M17 16v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" fill="none" ${K}/><path d="M5 26h38" ${K}/>
      <rect x="20" y="23" width="8" height="7" rx="2" fill="#F4D35E" ${K}/><rect x="28" y="30" width="13" height="9" rx="2" fill="#fff" ${K}/><circle cx="31.5" cy="34.5" r="1.8" fill="#8EB8E5"/><path d="M34.5 33.5h4M34.5 36h3" stroke="#C9B8A4" stroke-width="1.2" stroke-linecap="round"/>`),
    sSun: art48(`<g stroke="#E09A2E" stroke-width="2.6" stroke-linecap="round"><path d="M24 3v5M24 40v5M3 24h5M40 24h5M9 9l3.5 3.5M35.5 35.5 39 39M9 39l3.5-3.5M35.5 12.5 39 9"/></g>
      <circle cx="24" cy="24" r="11" fill="#FFD23F" ${K}/><circle cx="20" cy="23" r="1.4" fill="#3B2F2F"/><circle cx="28" cy="23" r="1.4" fill="#3B2F2F"/><path d="M21 27q3 2.4 6 0" stroke="#3B2F2F" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="18" cy="27" r="1.6" fill="#F2A7BE"/><circle cx="30" cy="27" r="1.6" fill="#F2A7BE"/>`)
  });

  // ================================================================ one style for the whole app (v13)
  // Every picture icon is drawn like the "My day" step icons: a soft dark outline, bright flat fills and a
  // little white shine. Pure control marks (back, close, plus, minus, tick, arrows, pause) stay as simple
  // rounded strokes so buttons stay calm. The "Calm minimal" art style still uses the original line icons.
  const LINE_ORIG = {};
  Object.keys(ICONS).forEach((k) => { if (ICONS[k].isLine) LINE_ORIG[k] = ICONS[k]; });
  const C = { ink: '#3B2F2F', red: '#EF6F5E', coral: '#F58B7A', orange: '#F4A259', yellow: '#FFD23F', gold: '#F4B400', green: '#7BC67E', dgreen: '#5DAA68',
    teal: '#4FB3A9', blue: '#5B8FD9', lblue: '#8EB8E5', sky: '#CFE8F7', purple: '#9B87D9', lav: '#C9B8EE', pink: '#F59FBF', skin: '#FFD3AE', brown: '#A87B50',
    grey: '#D5DDE5', dgrey: '#8A97A6', cream: '#FFF4D6', white: '#fff' };
  const SH = (x, y, rx, ry, r) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".6"${r ? ` transform="rotate(${r} ${x} ${y})"` : ''}/>`;
  // a thick coloured line with a dark edge (like the lock's shackle)
  const BAR = (d, col, w) => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${(w || 3.4) + 3.6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 3.4}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const EYES = (x, y, s) => { const k = s || 1; return `<circle cx="${x - 3.6 * k}" cy="${y}" r="${1.5 * k}" fill="${C.ink}"/><circle cx="${x + 3.6 * k}" cy="${y}" r="${1.5 * k}" fill="${C.ink}"/>`; };
  const SMILE = (x, y, s) => { const k = s || 1; return `<path d="M${x - 2.6 * k} ${y} q${2.6 * k} ${2.6 * k} ${5.2 * k} 0" fill="none" stroke="${C.ink}" stroke-width="${1.6 * k}" stroke-linecap="round"/>`; };
  const CHEEKS = (x, y, s) => { const k = s || 1; return `<circle cx="${x - 6.4 * k}" cy="${y}" r="${1.5 * k}" fill="#F2A7BE"/><circle cx="${x + 6.4 * k}" cy="${y}" r="${1.5 * k}" fill="#F2A7BE"/>`; };
  // a little child figure: head at (x, y), shirt colour, optional arms ('down', 'up', 'out', 'point')
  const KID = (x, y, shirt, arms, hair) => {
    const a = arms || 'down';
    const armPath = {
      down: `M${x - 7} ${y + 12} l-3 9 M${x + 7} ${y + 12} l3 9`,
      up: `M${x - 7} ${y + 12} l-6 -9 M${x + 7} ${y + 12} l6 -9`,
      out: `M${x - 7} ${y + 12} l-9 2 M${x + 7} ${y + 12} l9 2`,
      point: `M${x - 7} ${y + 12} l-3 9 M${x + 7} ${y + 12} l10 -2`,
      wave: `M${x - 7} ${y + 12} l-3 9 M${x + 7} ${y + 12} l6 -9`
    }[a];
    return `<path d="${armPath}" stroke="${C.ink}" stroke-width="6.4" stroke-linecap="round" fill="none"/><path d="${armPath}" stroke="${C.skin}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M${x - 8} ${y + 26} v-9 a8 8 0 0 1 16 0 v9 z" fill="${shirt}" ${K}/>
      <circle cx="${x}" cy="${y}" r="7" fill="${C.skin}" ${K}/>${hair ? `<path d="M${x - 7} ${y - 1} a7 7 0 0 1 14 0 q-4 -3 -7 -1 q-4 -2 -7 1z" fill="${hair}" ${K}/>` : ''}
      <circle cx="${x - 2.5}" cy="${y + 0.5}" r="1.1" fill="${C.ink}"/><circle cx="${x + 2.5}" cy="${y + 0.5}" r="1.1" fill="${C.ink}"/><path d="M${x - 1.8} ${y + 3.2} q1.8 1.6 3.6 0" fill="none" stroke="${C.ink}" stroke-width="1.2" stroke-linecap="round"/>`;
  };
  const SPEAKER = (fill) => `<path d="M7 18h7l10-8v28l-10-8H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" fill="${fill}" ${K}/>${SH(10, 21, 1.2, 1.8)}`;
  const gearPath = (() => {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a0 = (i / 16) * Math.PI * 2;
      const r = i % 2 ? 13.5 : 18;
      const a1 = a0 + Math.PI / 16;
      pts.push(`${(24 + r * Math.cos(a0)).toFixed(1)} ${(24 + r * Math.sin(a0)).toFixed(1)}`, `${(24 + r * Math.cos(a1)).toFixed(1)} ${(24 + r * Math.sin(a1)).toFixed(1)}`);
    }
    return 'M' + pts.join(' L') + 'Z';
  })();
  const alias = (to) => (size, cls) => ICONS[to](size, cls);

  Object.assign(ICONS, {
    // ---- sound and devices
    speaker: art48(`${SPEAKER(C.blue)}<path d="M30 18q5 6 0 12M35 13q9 11 0 22" fill="none" stroke="${C.teal}" stroke-width="3.2" stroke-linecap="round"/>`),
    volume: art48(`${SPEAKER(C.blue)}<path d="M29 19q4 5 0 10M34 15q7 9 0 18M39 11q10 13 0 26" fill="none" stroke="${C.teal}" stroke-width="2.8" stroke-linecap="round"/>`),
    mute: art48(`${SPEAKER(C.lblue)}<circle cx="36" cy="24" r="8.5" fill="${C.red}" ${K}/><path d="M33 21l6 6M39 21l-6 6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`),
    quiet: art48(`<circle cx="24" cy="24" r="18" fill="${C.yellow}" ${K}/>${SH(16, 14, 2.4, 3.4, -30)}<path d="M15 20q3 2.4 6 0M27 20q3 2.4 6 0" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/><path d="M19 31h10" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="21.5" y="22" width="5" height="16" rx="2.5" fill="${C.skin}" ${K}/>${CHEEKS(24, 27, 1.5)}`),
    music: art48(`<path d="M17 34V13l22-6v21" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/><path d="M17 13l22-6v6l-22 6z" fill="${C.purple}" ${K}/>
      <ellipse cx="12.5" cy="34.5" rx="6" ry="4.6" fill="${C.purple}" ${K} transform="rotate(-20 12.5 34.5)"/><ellipse cx="34.5" cy="28.5" rx="6" ry="4.6" fill="${C.purple}" ${K} transform="rotate(-20 34.5 28.5)"/>${SH(11, 33, 1.2, 1.8, 40)}${SH(33, 27, 1.2, 1.8, 40)}`),
    camera: art48(`<path d="M16 14l3-5h10l3 5" fill="${C.lblue}" ${K}/><rect x="5" y="14" width="38" height="26" rx="6" fill="${C.blue}" ${K}/>
      <circle cx="24" cy="27" r="9" fill="#fff" ${K}/><circle cx="24" cy="27" r="4.6" fill="${C.ink}"/><circle cx="22.4" cy="25.4" r="1.5" fill="#fff"/><circle cx="37" cy="20" r="2" fill="${C.yellow}" ${K}/>${SH(9.5, 19, 1.2, 2.2)}`),
    eye: art48(`<path d="M4 24q20-22 40 0-20 22-40 0z" fill="#fff" ${K}/><circle cx="24" cy="24" r="8.5" fill="${C.blue}" ${K}/><circle cx="24" cy="24" r="3.8" fill="${C.ink}"/><circle cx="26.6" cy="21.4" r="1.7" fill="#fff"/>`),
    upload: art48(`<path d="M7 30v7a4 4 0 0 0 4 4h26a4 4 0 0 0 4-4v-7" fill="${C.cream}" ${K}/><path d="M24 5l11 12h-6.5v14h-9V17H13z" fill="${C.teal}" ${K}/>${SH(22, 20, 1, 3)}`),
    text: art48(`<rect x="5" y="8" width="38" height="32" rx="7" fill="${C.cream}" ${K}/><path d="M11 33l6.5-18h1.5l6.5 18M13.8 27h9.4" fill="none" stroke="${C.blue}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="33" cy="29" r="4.2" fill="none" stroke="${C.red}" stroke-width="3"/><path d="M37.2 24.6v8.6" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>`),
    // ---- home and things
    home: art48(`<path d="M11 21v18a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3V21" fill="${C.cream}" ${K}/>${BAR('M7 23 24 8l17 15', C.red, 3.6)}<rect x="20" y="29" width="8" height="13" rx="2" fill="${C.blue}" ${K}/><circle cx="26" cy="36" r="1" fill="#fff"/>`),
    trash: art48(`<path d="M11 16h26l-2 23a4 4 0 0 1-4 3.5H17a4 4 0 0 1-4-3.5z" fill="${C.lblue}" ${K}/><path d="M19 22v14M24 22v14M29 22v14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M20 10V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" ${K}/><rect x="7" y="10" width="34" height="6" rx="3" fill="${C.blue}" ${K}/>`),
    dice: art48(`<rect x="8" y="8" width="32" height="32" rx="8" fill="#fff" ${K}/>${[[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${C.red}"/>`).join('')}`),
    palette: art48(`<path d="M24 6C13 6 5 14 5 24s8 18 19 18c3 0 4-2.4 2.8-4.8s.2-5 3.2-5H35c5 0 8-3.6 8-8.6C43 13.4 34.6 6 24 6z" fill="#F4D9A8" ${K}/>
      <circle cx="14" cy="22" r="3.6" fill="${C.red}" ${K}/><circle cx="20" cy="13.5" r="3.6" fill="${C.yellow}" ${K}/><circle cx="30" cy="13" r="3.6" fill="${C.green}" ${K}/><circle cx="36" cy="21" r="3.6" fill="${C.blue}" ${K}/><circle cx="15" cy="32" r="3.6" fill="${C.purple}" ${K}/>`),
    pencil: art48(`<path d="M9 39l2.4-9.4L31 10l7.4 7.4L19 37z" fill="${C.yellow}" ${K}/><path d="M31 10l3-3a3 3 0 0 1 4.2 0l3.2 3.2a3 3 0 0 1 0 4.2l-3 3z" fill="${C.pink}" ${K}/>
      <path d="M11.4 29.6 19 37" ${K}/><path d="M9 39l1.2-4.8 3.6 3.6z" fill="${C.ink}"/><path d="M14 31 33 12" stroke="#fff" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`),
    eraser: art48(`<path d="M7 32 23 14a3 3 0 0 1 4.2-.3l10 8.8a3 3 0 0 1 .3 4.2L25 41H15z" fill="${C.pink}" ${K}/><path d="M7 32l10-11.2 13 11.4L22.6 41H15z" fill="${C.lblue}" ${K}/><path d="M30 41h11" ${K}/>${SH(27, 18, 1.2, 2.6, 48)}`),
    shop: art48(`<path d="M10 16h28l-2.2 23.4a3.4 3.4 0 0 1-3.4 3.1H15.6a3.4 3.4 0 0 1-3.4-3.1z" fill="${C.orange}" ${K}/><path d="M18 20v-6a6 6 0 0 1 12 0v6" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>${SPARK(24, 30.5, 5.5)}`),
    gift: art48(`<rect x="8" y="21" width="32" height="20" rx="3" fill="${C.red}" ${K}/><rect x="6" y="14" width="36" height="8" rx="3" fill="${C.coral}" ${K}/><rect x="21" y="14" width="6" height="27" fill="${C.yellow}" ${K}/>
      <path d="M24 14c-3-6.5-12-7.6-12-2.4S21 14 24 14zM24 14c3-6.5 12-7.6 12-2.4S27 14 24 14z" fill="${C.yellow}" ${K}/>`),
    medal: art48(`<path d="M13 4h8.5l6 14H19z" fill="${C.blue}" ${K}/><path d="M35 4h-8.5l-6 14H29z" fill="${C.red}" ${K}/><circle cx="24" cy="30" r="12.5" fill="${C.yellow}" ${K}/><circle cx="24" cy="30" r="8.5" fill="none" stroke="${C.gold}" stroke-width="2"/>${SPARK(24, 30, 5, '#fff')}`),
    trophy: art48(`<path d="M14 10H7.5v3a6.5 6.5 0 0 0 7 6.5M34 10h6.5v3a6.5 6.5 0 0 1-7 6.5" fill="none" stroke="${C.ink}" stroke-width="2.4"/><path d="M13 6h22v11a11 11 0 0 1-22 0z" fill="${C.yellow}" ${K}/>
      <rect x="20.5" y="27" width="7" height="7" fill="${C.gold}" ${K}/><rect x="13" y="34" width="22" height="8" rx="2.5" fill="${C.brown}" ${K}/>${SPARK(24, 15.5, 4.6, '#fff')}${SH(16.5, 10, 1.1, 2.4)}`),
    target: art48(`<circle cx="24" cy="24" r="18" fill="${C.red}" ${K}/><circle cx="24" cy="24" r="12" fill="#fff" ${K}/><circle cx="24" cy="24" r="6" fill="${C.red}" ${K}/><circle cx="24" cy="24" r="1.8" fill="#fff"/>`),
    journal: art48(`<rect x="10" y="5" width="29" height="38" rx="4" fill="${C.purple}" ${K}/><path d="M17 5v38" ${K}/><rect x="21.5" y="12" width="12.5" height="9" rx="2" fill="#fff" ${K}/><path d="M24 15.5h7.5M24 18h5" stroke="${C.lav}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M8 13h5M8 21h5M8 29h5M8 37h5" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>`),
    gear: art48(`<path d="${gearPath}" fill="${C.dgrey}" ${K}/><circle cx="24" cy="24" r="6.5" fill="#fff" ${K}/>`),
    sliders: art48(`<path d="M7 14h34M7 24h34M7 34h34" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/><circle cx="30" cy="14" r="5" fill="${C.teal}" ${K}/><circle cx="16" cy="24" r="5" fill="${C.pink}" ${K}/><circle cx="27" cy="34" r="5" fill="${C.yellow}" ${K}/>`),
    chart: art48(`<rect x="9" y="25" width="8" height="15" rx="2" fill="${C.green}" ${K}/><rect x="20" y="15" width="8" height="25" rx="2" fill="${C.yellow}" ${K}/><rect x="31" y="7" width="8" height="33" rx="2" fill="${C.blue}" ${K}/><path d="M5 41h38" ${K}/>`),
    exit: art48(`<rect x="7" y="6" width="21" height="36" rx="3" fill="${C.brown}" ${K}/><rect x="11" y="10" width="13" height="12" rx="2" fill="#C89A6E"/><circle cx="23" cy="27" r="1.8" fill="${C.yellow}" ${K}/>${BAR('M28 24h13M35.5 18.5 41 24l-5.5 5.5', C.teal, 3)}`),
    pin: art48(`<path d="M24 44S10 30 10 19a14 14 0 0 1 28 0c0 11-14 25-14 25z" fill="${C.red}" ${K}/><circle cx="24" cy="19" r="5.5" fill="#fff" ${K}/>${SH(16, 14, 1.4, 3, 30)}`),
    clock: art48(`<circle cx="24" cy="25" r="18" fill="${C.blue}" ${K}/><circle cx="24" cy="25" r="13.5" fill="#fff" ${K}/><path d="M24 17v8l5.5 4" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 13.5v1.6M35.5 25h-1.6M24 36.5v-1.6M12.5 25h1.6" stroke="${C.lblue}" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="25" r="1.6" fill="${C.red}"/>`),
    hourglass: art48(`<path d="M14 9h20c0 9-7 11-7 15s7 6 7 15H14c0-9 7-11 7-15s-7-6-7-15z" fill="${C.sky}" ${K}/><path d="M18 14h12c-1 4-6 6-6 9-0-3-5-5-6-9z" fill="${C.yellow}"/><path d="M16.5 38h15c-1-5-7.5-6.4-7.5-9-0 2.6-6.5 4-7.5 9z" fill="${C.yellow}" ${K}/>
      <rect x="10" y="4" width="28" height="5.5" rx="2.5" fill="${C.brown}" ${K}/><rect x="10" y="38.5" width="28" height="5.5" rx="2.5" fill="${C.brown}" ${K}/>`),
    help: art48(`<circle cx="24" cy="24" r="18" fill="${C.red}" ${K}/><path d="M11.3 11.3l7.4 7.4M36.7 11.3l-7.4 7.4M11.3 36.7l7.4-7.4M36.7 36.7l-7.4-7.4" stroke="#fff" stroke-width="7.5"/>
      <circle cx="24" cy="24" r="18" fill="none" ${K}/><circle cx="24" cy="24" r="8.5" fill="${C.cream}" ${K}/>`),
    stop: art48(`<path d="M17 5h14l12 12v14L31 43H17L5 31V17z" fill="${C.red}" ${K}/><path d="M13 24h22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>${SH(14, 13, 1.3, 2.8, 45)}`),
    // ---- talk-board words and feelings
    yes: art48(`<circle cx="24" cy="24" r="19" fill="${C.green}" ${K}/><path d="M15 24.5l6 6 12-13" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>${SH(13, 15, 1.6, 3.2, 40)}`),
    no: art48(`<circle cx="24" cy="24" r="19" fill="${C.red}" ${K}/><path d="M17 17l14 14M31 17 17 31" stroke="#fff" stroke-width="4.2" stroke-linecap="round"/>${SH(13, 15, 1.6, 3.2, 40)}`),
    dont: art48(`<circle cx="24" cy="24" r="18" fill="#fff" ${K}/><path d="M17 33V19a2.6 2.6 0 0 1 5.2 0v-4a2.6 2.6 0 0 1 5.2 0v5a2.6 2.6 0 0 1 5.2 0v8c0 5-3 8-8 8h-1c-3.6 0-6.6-1.2-6.6-3z" fill="${C.skin}" ${K}/><circle cx="24" cy="24" r="15.5" fill="none" stroke="${C.red}" stroke-width="5"/><path d="M13 13l22 22" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="24" r="18" fill="none" ${K}/>`),
    smile: art48(`<circle cx="24" cy="24" r="18" fill="${C.yellow}" ${K}/>${SH(15.5, 14, 2.2, 3.4, -30)}${EYES(24, 21, 1.4)}${SMILE(24, 27.5, 1.5)}${CHEEKS(24, 27, 1.5)}`),
    thumb: art48(`<path d="M17 21l6-12c2.6-1.4 5 .4 4.6 3.4L26.4 19H37a4 4 0 0 1 3.9 4.9l-3 12A4 4 0 0 1 34 39H17z" fill="${C.skin}" ${K}/><path d="M28 26h8M27.5 32h7.5" stroke="#E8B48A" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="7" y="20" width="10" height="21" rx="2.5" fill="${C.blue}" ${K}/>`),
    like: art48(`<path d="M24 41C9 31 5 22 9.5 14.5c4-6 11.6-5 14.5 0.6 2.9-5.6 10.5-6.6 14.5-0.6C43 22 39 31 24 41z" fill="${C.pink}" ${K}/>${SH(14, 15, 1.6, 3, -30)}<path d="M17 24.5l5 5 9-9.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`),
    what: art48(`<path d="M8 8h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H22l-9 8v-8H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="${C.purple}" ${K}/><path d="M19.5 16.5a4.5 4.5 0 1 1 6.4 4.1c-1.4.7-1.9 1.6-1.9 3.2" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><circle cx="24" cy="28.6" r="2" fill="#fff"/>`),
    who: art48(`${KID(18, 17, C.teal, 'down', C.brown)}<path d="M30 4h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-6l-4 4v-4h-2a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="${C.purple}" ${K}/><path d="M33.6 9a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .8-1 1.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="36" cy="15.6" r="1.1" fill="#fff"/>`),
    person: art48(`${KID(24, 15, C.green, 'down', C.brown)}`),
    me: art48(`${KID(24, 15, C.orange, 'down', C.brown)}${SPARK(24, 33, 4.4, '#fff')}`),
    you: art48(`${KID(30, 15, C.blue, 'down', C.ink)}${BAR('M5 30h10M11 25l5 5-5 5', C.teal, 3)}`),
    want: art48(`${KID(18, 18, C.pink, 'point', C.brown)}${SPARK(38, 12, 7)}`),
    come: art48(`${KID(32, 15, C.purple, 'wave', C.brown)}${BAR('M18 30H5M10.5 24.5 5 30l5.5 5.5', C.teal, 3)}`),
    go: art48(`${KID(17, 15, C.green, 'out', C.brown)}${BAR('M30 30h13M37.5 24.5 43 30l-5.5 5.5', C.dgreen, 3)}`),
    hug: art48(`${KID(16, 16, C.orange, 'out', C.brown)}${KID(32, 16, C.blue, 'out', C.ink)}<path d="M24 12.5c-2-1.6-4-3.1-4-5 0-1.6 2.4-2.4 4-.8 1.6-1.6 4-.8 4 .8 0 1.9-2 3.4-4 5z" fill="${C.red}" ${K}/>`),
    jump: art48(`<ellipse cx="24" cy="44" rx="9" ry="2" fill="${C.ink}" opacity=".15"/>${KID(24, 10, C.yellow, 'up', C.brown)}<path d="M19 36l-3 4M29 36l3 4" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/><path d="M8 18h5M35 18h5M6 26h5M37 26h5" stroke="${C.lblue}" stroke-width="2.4" stroke-linecap="round"/>`),
    stretch: art48(`${KID(24, 10, C.teal, 'up', C.brown)}<path d="M19 36l-6 8M29 36l6 8" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><path d="M19 36l-6 8M29 36l6 8" stroke="${C.blue}" stroke-width="2.6" stroke-linecap="round"/>`),
    please: art48(`<path d="M23.4 8.5c-3.2 0-6.4 4-7.6 9.6l-1.6 7.6c-.6 3 .2 6 2.2 8.2V37h7z" fill="${C.skin}" ${K}/><path d="M24.6 8.5c3.2 0 6.4 4 7.6 9.6l1.6 7.6c.6 3-.2 6-2.2 8.2V37h-7z" fill="${C.skin}" ${K}/><path d="M18.6 20.5l4.6.8M18 25.5l5.2.6M29.4 20.5l-4.6.8M30 25.5l-5.2.6" stroke="#E3A87A" stroke-width="1.5" stroke-linecap="round"/><rect x="14" y="36" width="20" height="7" rx="3" fill="${C.blue}" ${K}/>${SPARK(38.5, 11, 4)}${SPARK(9.5, 15, 3)}`),
    hurt: art48(`<g transform="rotate(-40 24 24)"><rect x="3" y="16.5" width="42" height="15" rx="7.5" fill="#F4C49A" ${K}/><rect x="17" y="16.5" width="14" height="15" fill="${C.cream}" ${K}/>
      <circle cx="21" cy="21" r="1" fill="#E3A87A"/><circle cx="27" cy="21" r="1" fill="#E3A87A"/><circle cx="21" cy="27" r="1" fill="#E3A87A"/><circle cx="27" cy="27" r="1" fill="#E3A87A"/><circle cx="24" cy="24" r="1" fill="#E3A87A"/></g>`),
    big: art48(`<circle cx="20" cy="26" r="15" fill="${C.blue}" ${K}/>${SH(13, 18, 2, 3.6, -30)}<circle cx="39" cy="35" r="5" fill="${C.grey}" ${K}/>`),
    little: art48(`<circle cx="20" cy="26" r="15" fill="${C.grey}" ${K}/><circle cx="39" cy="35" r="5.5" fill="${C.orange}" ${K}/>${SH(37.5, 33, 1, 1.6, -30)}`),
    hot: art48(`<path d="M24 44c-9 0-15-6-15-14 0-7 5-11 7-17 1.4 3 3 5 5 6 0-6 3-11 8-15-1 6 3 9 6 13 2.4 3 4 6.4 4 10 0 10-6 17-15 17z" fill="${C.orange}" ${K}/><path d="M24 44c-4.6 0-8-3-8-7.6 0-4 3-6.4 5-10 1 2.6 2.6 3.6 4 4.4 1-3 2-4.6 4-6 0 3.4 3 5.4 3 9.6 0 5.4-3.4 9.6-8 9.6z" fill="${C.yellow}" ${K}/>`),
    cold: art48(`<rect x="7" y="9" width="34" height="32" rx="7" fill="${C.sky}" ${K}/>${SH(12.5, 15.5, 1.4, 3, 0)}<g stroke="${C.blue}" stroke-width="2.6" stroke-linecap="round"><path d="M24 15v20M15.3 20l17.4 10M15.3 30l17.4-10"/><path d="M21 16.5l3 2.5 3-2.5M21 33.5l3-2.5 3 2.5"/></g>`),
    drink: art48(`<path d="M27 11 33 3" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><path d="M27 11 33 3" stroke="${C.red}" stroke-width="2.8" stroke-linecap="round"/><path d="M11 12h26l-3 28a3 3 0 0 1-3 2.7H17a3 3 0 0 1-3-2.7z" fill="#fff" ${K}/>
      <path d="M12.6 21h22.8l-1.9 18.6a2 2 0 0 1-2 1.8H16.5a2 2 0 0 1-2-1.8z" fill="${C.orange}"/><path d="M11 12h26l-3 28a3 3 0 0 1-3 2.7H17a3 3 0 0 1-3-2.7z" fill="none" ${K}/>${SH(17, 27, 1.2, 4)}`),
    snack: art48(`<circle cx="24" cy="24" r="18" fill="#D9A066" ${K}/><path d="M38 14a8 8 0 0 1-6-4" fill="none" stroke="#C88A50" stroke-width="2"/>${[[17, 17], [29, 18], [22, 27], [33, 29], [15, 31]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#6B4430"/>`).join('')}${SH(13, 13, 1.4, 2.6, -40)}`),
    feed: art48(`<circle cx="17" cy="20" r="3.4" fill="${C.brown}" ${K}/><circle cx="24" cy="17" r="3.4" fill="#C89A6E" ${K}/><circle cx="31" cy="20" r="3.4" fill="${C.brown}" ${K}/><circle cx="21" cy="23" r="3" fill="#C89A6E" ${K}/><circle cx="28" cy="23.5" r="3" fill="#C89A6E" ${K}/>
      <path d="M5 26h38l-4 12.5a3.6 3.6 0 0 1-3.4 2.5H12.4A3.6 3.6 0 0 1 9 38.5z" fill="${C.red}" ${K}/><path d="M18 33h12" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`),
    soap: art48(`<rect x="7" y="22" width="30" height="18" rx="7" fill="${C.pink}" ${K}/>${SH(13, 27, 1.4, 3, 60)}<circle cx="33" cy="13" r="6" fill="${C.sky}" ${K}/><circle cx="21" cy="12" r="4" fill="${C.sky}" ${K}/><circle cx="40" cy="24" r="3.4" fill="${C.sky}" ${K}/>`),
    open: art48(`<path d="M8 20l16 6 16-6v18l-16 6-16-6z" fill="#D9A066" ${K}/><path d="M24 26v18" ${K}/><path d="M8 20 3 12l16-6 5 9zM40 20l5-8-16-6-5 9z" fill="#E8BC87" ${K}/>${SPARK(24, 9, 4)}`),
    sleep: alias('sNap'),
    eat: alias('cutlery'),
    drop: art48(`<path d="M24 5C18 14 11 21 11 29a13 13 0 0 0 26 0c0-8-7-15-13-24z" fill="${C.lblue}" ${K}/>${SH(18, 28, 1.8, 4.2, 10)}`),
    rain: art48(`<path d="M13 28h23a8 8 0 0 0 1-16 11 11 0 0 0-21-2 8 8 0 0 0-3 18z" fill="${C.grey}" ${K}/>${SH(16, 17, 1.4, 2.6, -40)}<path d="M15 34l-2 6M24 34l-2 6M33 34l-2 6" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>`),
    motion: art48(`<path d="M5 24c5-10 9-10 13 0s8 10 12 0 8-10 13 0" fill="none" stroke="${C.ink}" stroke-width="7.4" stroke-linecap="round"/><path d="M5 24c5-10 9-10 13 0s8 10 12 0 8-10 13 0" fill="none" stroke="${C.teal}" stroke-width="3.8" stroke-linecap="round"/>`),
    // ---- the same pictures as the matching "My day" and home icons
    moon: alias('sMoon'), calendar: alias('kDay'), cloud: alias('kCalm'), chat: alias('kTalk'), house: alias('kRoom'), heart: alias('kHeart'),
    shirt: alias('sShirt'), bowl: alias('sRice'), bath: alias('sBath'), dentist: alias('sDentist'), scissors: alias('sScissors'), ball: alias('sBall'),
    book: alias('sBook'), train: alias('sTrain'), tree: alias('sTree'), tablet: alias('sTablet'), busLine: alias('bus'), puzzle: alias('kPuzzle'),
    learn: alias('kLearn'), paw: alias('kPet'), bell: alias('kBell'), bubbles: alias('kBubbles'), cards: alias('kCards'), sort: alias('kSort'),
    shapes: alias('kShapes'), balloon: alias('kBalloon'), squeeze: alias('kSqueeze'), together: alias('kDuo'), bulb: alias('kHint'), lock: alias('kLock'),
    storybook: alias('kStories'), fun: alias('kFun'), flag: alias('kFlag'), sun: alias('sSun'),
    flame: art48(`<path d="M24 44c-9 0-15-6-15-14 0-7 5-11 7-17 1.4 3 3 5 5 6 0-6 3-11 8-15-1 6 3 9 6 13 2.4 3 4 6.4 4 10 0 10-6 17-15 17z" fill="#FF8A3D" ${K}/><path d="M24 44c-4.6 0-8-3-8-7.6 0-4 3-6.4 5-10 1 2.6 2.6 3.6 4 4.4 1-3 2-4.6 4-6 0 3.4 3 5.4 3 9.6 0 5.4-3.4 9.6-8 9.6z" fill="${C.yellow}" ${K}/>`),
    flameGrey: art48(`<path d="M24 44c-9 0-15-6-15-14 0-7 5-11 7-17 1.4 3 3 5 5 6 0-6 3-11 8-15-1 6 3 9 6 13 2.4 3 4 6.4 4 10 0 10-6 17-15 17z" fill="#D8CFC6" ${K}/><path d="M24 44c-4.6 0-8-3-8-7.6 0-4 3-6.4 5-10 1 2.6 2.6 3.6 4 4.4 1-3 2-4.6 4-6 0 3.4 3 5.4 3 9.6 0 5.4-3.4 9.6-8 9.6z" fill="#EFE9E3" ${K}/>`),
    apple: art48(`<path d="M24 14c-3-3-9-4-13 0-5 5-4 15 1 21 3 4 7 7 12 5 5 2 9-1 12-5 5-6 6-16 1-21-4-4-10-3-13 0z" fill="${C.red}" ${K}/><path d="M24 14c0-4 1-7 3-9" fill="none" stroke="${C.brown}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M26 10c3-4 8-5 11-3-2 4-7 5-11 3z" fill="${C.green}" ${K}/>${SH(15, 21, 1.8, 4, 20)}`),
    // room tabs
    rSofa: art48(`<rect x="9" y="12" width="30" height="16" rx="5" fill="${C.purple}" ${K}/><rect x="4" y="22" width="9" height="14" rx="4" fill="${C.purple}" ${K}/><rect x="35" y="22" width="9" height="14" rx="4" fill="${C.purple}" ${K}/>
      <rect x="11" y="25" width="26" height="11" rx="3" fill="${C.lav}" ${K}/><path d="M9 36v5M39 36v5" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>${SH(14, 16, 1.2, 2.4, 60)}`),
    rRug: art48(`<path d="M5 28h-3M5 33h-3M43 28h3M43 33h3" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/><ellipse cx="24" cy="30.5" rx="19" ry="11" fill="${C.pink}" ${K}/><ellipse cx="24" cy="30.5" rx="12.5" ry="6.5" fill="${C.cream}" ${K}/>
      <ellipse cx="24" cy="30.5" rx="6" ry="2.8" fill="${C.sky}" ${K}/>${SH(14, 26, 1.4, 3, 70)}`),
    rPlant: art48(`<path d="M24 30V15" stroke="${C.dgreen}" stroke-width="2.6" stroke-linecap="round"/><path d="M24 20c-9 1-14-4-14-11 8-1 14 3 14 11z" fill="${C.green}" ${K}/><path d="M24 17c1-8 7-11 14-10 0 7-6 11-14 10z" fill="${C.green}" ${K}/>
      <path d="M13 28h22l-3 13a3 3 0 0 1-3 2.4H19a3 3 0 0 1-3-2.4z" fill="${C.coral}" ${K}/><rect x="11" y="26" width="26" height="6" rx="3" fill="${C.red}" ${K}/>`),
    mic: art48(`<rect x="16" y="4" width="16" height="26" rx="8" fill="${C.pink}" ${K}/>${SH(21, 11, 1.4, 3.4)}<path d="M20 12h8M20 17h8M20 22h8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      <path d="M10 22a14 14 0 0 0 28 0" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/><path d="M24 36v6M16 43h16" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>`),
    laugh: art48(`<circle cx="24" cy="24" r="18" fill="${C.yellow}" ${K}/>${SH(15.5, 14, 2.2, 3.4, -30)}<path d="M14 20q3.2-3.4 6.4 0M27.6 20q3.2-3.4 6.4 0" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 26h20a10 10 0 0 1-20 0z" fill="${C.ink}"/><path d="M18 31.6a8 8 0 0 0 12 0 6 3 0 0 0-12 0z" fill="#EF8A7A"/>${CHEEKS(24, 27, 1.6)}<path d="M8 18c-2 2-2 5 0 6" stroke="${C.lblue}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`),
    // talk-board words that used to be plain marks
    wMore: art48(`<rect x="6" y="6" width="36" height="36" rx="10" fill="${C.teal}" ${K}/><path d="M24 14v20M14 24h20" stroke="#fff" stroke-width="5" stroke-linecap="round"/>${SH(12, 13, 1.4, 3, 40)}`),
    wDone: art48(`<rect x="6" y="6" width="36" height="36" rx="10" fill="${C.blue}" ${K}/><path d="M14.5 24.5l6.5 6.5 13-14" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>${SH(12, 13, 1.4, 3, 40)}`),
    wNext: art48(`<circle cx="24" cy="24" r="19" fill="${C.purple}" ${K}/><path d="M14 24h19M26 16.5l7.5 7.5-7.5 7.5" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>${SH(13, 15, 1.6, 3.2, 40)}`),
    wDifferent: art48(`<rect x="6" y="6" width="36" height="36" rx="10" fill="${C.orange}" ${K}/><path d="M13 17h5c6 0 8 14 14 14h3M13 31h5c2.4 0 4-2 5.4-4.6M26 19.6c1.4-1.6 3-2.6 6-2.6h3M31 13l4 4-4 4M31 27l4 4-4 4" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`),
    shield: art48(`<path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z" fill="${C.lblue}" ${K}/>${SPARK(24, 22, 7, '#fff')}${SH(14, 13, 1.4, 3.4)}`)
  });

  // ---------------------------------------------------------------- drawn pictures used in place of an emoji
  // (stories and tutorials list pictures as emoji; a few things have no good emoji, like a tissue packet)
  const PICS = {
    tissuepack: { label: 'Tissue packet', svg: `<ellipse cx="50" cy="84" rx="42" ry="5" fill="#6B4A3A" opacity=".15"/>
      <path d="M8 56c0-8 6-12 14-12h56c8 0 14 4 14 12v14c0 8-6 12-14 12H22c-8 0-14-4-14-12z" fill="#4FA3CF"/>
      <path d="M8 54c0-8 6-12 14-12h56c8 0 14 4 14 12v12c0 8-6 12-14 12H22c-8 0-14-4-14-12z" fill="#86C9EA"/>
      ${[[20, 66], [34, 72], [66, 72], [80, 64], [50, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff" opacity=".9"/><circle cx="${x}" cy="${y}" r="1.3" fill="#FFD84D"/>`).join('')}
      <path d="M24 44h52c2 0 3 1.6 2.4 3.4L74 58H26l-4.4-10.6C21 45.6 22 44 24 44z" fill="#FF9CB6"/><rect x="38" y="48" width="24" height="6" rx="3" fill="#fff" opacity=".85"/>
      <path d="M30 46c-8-12 0-26 14-22 4-12 22-12 22 2 12 0 14 14 4 20z" fill="#fff"/><path d="M30 46c-8-12 0-26 14-22 2 8 0 16-6 22z" fill="#EEF2F6"/>
      <path d="M46 26c3 6 3 13-1 20M60 28c3 6 2 12-2 18" stroke="#D8E0E8" stroke-width="2" fill="none" stroke-linecap="round"/>` }
  };
  window.lumiPic = (key, size) => {
    const p = PICS[key];
    if (!p) return null;
    return `<svg class="pic" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${p.label}">${p.svg}</svg>`;
  };
  window.lumiPicLabel = (key) => (PICS[key] ? PICS[key].label : key);

  window.icon = function (name, size, cls) {
    // the "Calm minimal" art style keeps simple line drawings everywhere
    if (window.ICON_MODE === 'line') {
      const ln = LINE_FOR[name] || name;
      if (LINE_ORIG[ln]) return LINE_ORIG[ln](size, cls);
      if (LINE_FOR[name] && ICONS[ln]) return ICONS[ln](size, cls);
    }
    return (ICONS[name] || ICONS.star)(size, cls);
  };
})();
