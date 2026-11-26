/*
  tg-primary.js: two-player games for Primary (7-12). See teamgames.js for the frame and helpers.
  Every game is played with Lumi (solo, Lumi takes its own turns) or with a grown-up (Together).
  - Hawker uncle       a real food stall: order, cook (scoop, wash, cut, fry, top), pack to eat here or take away, pay, thank you
  - I spy              a busy picture: one gives a clue, the other finds it
  - Music echo         one plays a short drum beat, the other copies it
  - Lumi says          picture instruction cards: one leads, the other does it for real
  - Hide Lumi          hide Lumi in the room, find it by asking yes/no questions
  - Build it together  copy a block picture; the colour of the next block says whose turn it is
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const T = A.TG;
  const { ic, esc, L } = T;
  const K = 'stroke="#3B2F2F" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  const sv = (vb, body, w, h) => `<svg viewBox="${vb}" width="${w || '100%'}" height="${h || '100%'}" aria-hidden="true">${body}</svg>`;
  const otherOf = (w) => (w === 'child' ? 'other' : 'child');
  const nm = (w) => T.nameOf(w);
  const lumiBig = (mood, size, wave) => L.svg({ look: A.lookWith(), mood: mood || 'happy', size: size || 160, wave });
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const food = (id) => (A.foodSvg ? A.foodSvg(id) : '');
  const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  // ================================================================ 1. Hawker uncle
  // A real hawker stall. The customer picks from the menu, says "eat here" or "take away" (and from Medium,
  // a request like "no chilli"). The uncle makes it the way it is really made at a stall, one job at a time:
  // scoop the rice, wash and cut the vegetables, chop the chicken, fry the noodles, add the toppings. Then the
  // order is packed: on a tray with a spoon and fork to eat here, or in a box with a lid, a spoon and a tied
  // bag to take away. Then the customer pays and says thank you, and the two swap jobs.
  // The child is the uncle first. Every job works with a finger (rub, slice) or with taps (switch users too).
  const FPLATE = '<ellipse cx="50" cy="68" rx="42" ry="6" fill="#6B4A3A" opacity=".16"/><ellipse cx="48" cy="57" rx="42" ry="14" fill="#C7D9E6"/><ellipse cx="48" cy="54" rx="42" ry="14" fill="#E4EEF5"/><ellipse cx="48" cy="54" rx="31" ry="9.5" fill="#fff"/>';
  const PRATA = `${FPLATE}<ellipse cx="38" cy="50" rx="24" ry="9" fill="#D9963F"/><ellipse cx="38" cy="48.4" rx="22" ry="7.6" fill="#F2BE68"/><path d="M22 48c6-3 14-4 22-2M28 52c8 2 14 1 20-2" stroke="#D9963F" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="44" rx="20" ry="7.6" fill="#D9963F"/><ellipse cx="50" cy="42.6" rx="18" ry="6.4" fill="#F7CB7A"/><path d="M38 41c5-2 12-2 18 0" stroke="#FFE3A6" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M70 46h24c-1 9-6 13-12 13s-11-4-12-13z" fill="#7CC0B6"/><ellipse cx="82" cy="46" rx="12" ry="3.6" fill="#E9964C"/><circle cx="79" cy="45.4" r="1.6" fill="#FFF3DC"/><circle cx="85" cy="46.2" r="1.4" fill="#6DAE4E"/>`;
  const KACHANG = `<ellipse cx="50" cy="75" rx="30" ry="4.6" fill="#6B4A3A" opacity=".16"/><path d="M14 46h72c-1 18-16 28-36 28S15 64 14 46z" fill="#B9A6E0"/><path d="M18 56c8 12 18 16 32 16s24-4 32-16c-6 14-16 18-32 18S24 70 18 56z" fill="#8E78C9" opacity=".6"/>
    <path d="M20 46c0-22 14-36 30-36s30 14 30 36z" fill="#F7F4FB"/><path d="M26 30c8-6 16-2 24-6s14 2 22 0" stroke="#F26B8A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M22 40c10-4 18 0 28-3s18 1 28-1" stroke="#7CC26A" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="14" r="3" fill="#B5543B"/><circle cx="52" cy="12" r="3" fill="#B5543B"/><circle cx="58" cy="17" r="2.6" fill="#FFD23F"/><circle cx="38" cy="19" r="2.6" fill="#FFD23F"/><ellipse cx="50" cy="46" rx="36" ry="7" fill="#D4C6F2"/>`;
  const MILO = `<ellipse cx="50" cy="77" rx="18" ry="3.4" fill="#6B4A3A" opacity=".16"/><path d="M58 4 50 30" stroke="#E07A5F" stroke-width="4" stroke-linecap="round"/><path d="M32 16h36l-4 56c-.2 2.6-2.4 4.6-5 4.6H41c-2.6 0-4.8-2-5-4.6z" fill="#EEF4F8"/>
    <path d="M34 30h32l-3 41c-.2 2-1.8 3.4-3.8 3.4H40.8c-2 0-3.6-1.4-3.8-3.4z" fill="#8A5A3C"/><ellipse cx="50" cy="30" rx="16" ry="3" fill="#A87050"/><ellipse cx="50" cy="16" rx="18" ry="3.2" fill="#F6FBFE"/><path d="M38 36l1.4 32" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`;
  const DISHES = [
    { id: 'chickenrice', name: 'Chicken rice', price: 4, art: () => food('chicken') },
    { id: 'noodles', name: 'Fried noodles', price: 4, art: () => food('noodles') },
    { id: 'prata', name: 'Roti prata', price: 2, art: () => sv('0 0 100 80', PRATA) },
    { id: 'kaya', name: 'Kaya toast', price: 3, art: () => food('toastPlate') },
    { id: 'kachang', name: 'Ice kachang', price: 3, art: () => sv('0 0 100 80', KACHANG) },
    { id: 'milo', name: 'Milo', price: 2, art: () => sv('0 0 100 80', MILO) }
  ];
  const dish = (id) => DISHES.find((d) => d.id === id);
  const DRINK = { milo: true, kachang: true }; // packed in a cup to take away
  // requests a customer can make (from Medium): leave one thing out
  const NO = { chickenrice: 'chilli', noodles: 'onion', kaya: 'soy', kachang: 'beans', milo: 'ice' };

  // ---------------------------------------------------------------- the things on the counter (60 x 60 pictures)
  const S60 = (body) => sv('0 0 60 60', body);
  // a tiny happy face, for the things that are friends (the tin, the box, the bag, the packet)
  const face = (x, y, s = 1) => `<circle cx="${x - 4 * s}" cy="${y}" r="${1.5 * s}" fill="#3B2F2F"/><circle cx="${x + 4 * s}" cy="${y}" r="${1.5 * s}" fill="#3B2F2F"/><circle cx="${x - 3.5 * s}" cy="${y - 0.6 * s}" r="${0.5 * s}" fill="#fff"/><circle cx="${x + 4.5 * s}" cy="${y - 0.6 * s}" r="${0.5 * s}" fill="#fff"/><path d="M${x - 2.4 * s} ${y + 2.4 * s}q${2.4 * s} ${2.4 * s} ${4.8 * s} 0" stroke="#3B2F2F" stroke-width="${1.2 * s}" fill="none" stroke-linecap="round"/><ellipse cx="${x - 7.4 * s}" cy="${y + 2.4 * s}" rx="${1.9 * s}" ry="${1.1 * s}" fill="#F49AA4" opacity=".75"/><ellipse cx="${x + 7.4 * s}" cy="${y + 2.4 * s}" rx="${1.9 * s}" ry="${1.1 * s}" fill="#F49AA4" opacity=".75"/>`;
  // a kopitiam plate: white, with the green line round the rim
  const saucer = '<ellipse cx="30" cy="48" rx="25" ry="6" fill="#6B4A3A" opacity=".13"/><ellipse cx="30" cy="44.5" rx="26" ry="9.5" fill="#B9CCDA"/><ellipse cx="30" cy="42.5" rx="26" ry="9.5" fill="#FAFCFD"/><ellipse cx="30" cy="42.5" rx="22.5" ry="7.9" fill="none" stroke="#5FAE9E" stroke-width="1.5"/><ellipse cx="30" cy="43" rx="16.5" ry="5.4" fill="#EDF2F6"/>';
  // a small steel bowl
  const bowl60 = (c) => `<ellipse cx="30" cy="54" rx="18" ry="3" fill="#6B4A3A" opacity=".14"/><path d="M8 30h44c-1 14-10 22-22 22S9 44 8 30z" fill="#C9D2DA" stroke="#7D8894" stroke-width="1.6"/><path d="M14 38c4 7 9 10 16 10" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="30" cy="30" rx="22" ry="6.4" fill="#E8EDF1" stroke="#7D8894" stroke-width="1.6"/><ellipse cx="30" cy="30.6" rx="18.5" ry="4.8" fill="${c}"/>`;
  // a sauce bottle with a cap, a label and a shine
  const bottle60 = (c, cap, mark) => `<ellipse cx="30" cy="56" rx="13" ry="2.6" fill="#6B4A3A" opacity=".14"/><rect x="24" y="3" width="12" height="8" rx="2.4" fill="${cap}" stroke="#3B2F2F" stroke-opacity=".25"/><path d="M25 11h10v4l5 6v29a5 5 0 0 1-5 5H25a5 5 0 0 1-5-5V21l5-6z" fill="${c}" stroke="#3B2F2F" stroke-opacity=".25" stroke-width="1.4"/>
    <rect x="21.6" y="28" width="16.8" height="16" rx="3" fill="#FFFBF2"/>${mark}<path d="M23.6 22v26" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`;
  const drop = (c) => `<path d="M30 30.5c3 3.6 4.6 6 4.6 8a4.6 4.6 0 0 1-9.2 0c0-2 1.6-4.4 4.6-8z" fill="${c}"/>`;
  // spoon and fork: shiny steel, drawn upright and then tilted
  const SPOON_G = `<path d="M30 3c6.6 0 10.2 5.6 10.2 11.6S36.2 26.4 30 26.4s-10.2-5.8-10.2-11.8S23.4 3 30 3z" fill="#D5DCE3" stroke="#6F7B87" stroke-width="2"/>
    <path d="M30 6.6c4.2 0 6.6 3.6 6.6 7.8S34 22.4 30 22.4s-6.6-3.8-6.6-8S25.8 6.6 30 6.6z" fill="#B8C3CE"/><path d="M26.2 11.2c.8-2.2 2.4-3.4 4.6-3.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M28.4 25.8 27.2 32l-1.8 21.6a4.6 4.6 0 0 0 9.2 0L32.8 32l-1.2-6.2z" fill="#D5DCE3" stroke="#6F7B87" stroke-width="2" stroke-linejoin="round"/><path d="M29.6 33.6 28.8 51.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
  const FORK_G = `<path d="M20 5a1.6 1.6 0 0 1 3.2 0v10h2.4V5a1.6 1.6 0 0 1 3.2 0v10h2.4V5a1.6 1.6 0 0 1 3.2 0v10h2.4V5a1.6 1.6 0 0 1 3.2 0v12c0 4.4-2.8 7.6-6.4 8.6L32.8 32l1.8 21.6a4.6 4.6 0 0 1-9.2 0L27.2 32l-.8-6.4C22.8 24.6 20 21.4 20 17z" fill="#D5DCE3" stroke="#6F7B87" stroke-width="2" stroke-linejoin="round"/>
    <path d="M23.4 18.4c1 2.4 2.8 3.8 5 4.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M29.6 33.6 28.8 51.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
  const SPOON = S60(`<ellipse cx="34" cy="55" rx="16" ry="2.8" fill="#6B4A3A" opacity=".16"/><g transform="rotate(28 30 30)">${SPOON_G}</g>`);
  const FORK = S60(`<ellipse cx="26" cy="55" rx="16" ry="2.8" fill="#6B4A3A" opacity=".16"/><g transform="rotate(-28 30 30)">${FORK_G}</g>`);
  // a bendy straw with stripes
  const STRAW = S60('<path d="M27 57V25q0-8 7-12l12-8" fill="none" stroke="#B9472F" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 57V25q0-8 7-12l12-8" fill="none" stroke="#fff" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 57V25q0-8 7-12l12-8" fill="none" stroke="#EF5B4C" stroke-width="6.2" stroke-dasharray="4.4 4.4" stroke-linejoin="round"/><path d="M24.6 22.6l4.8 1.4M25.4 19.4l4.6 2M27.2 16.4l4.2 2.6" stroke="#B9472F" stroke-width="1.2" stroke-linecap="round"/>');
  // a chilli packet with zigzag ends and a happy chilli on it
  const ZIG_TOP = 'l2 -2.4 l2 2.4 '.repeat(8), ZIG_BOT = 'l-2 2.4 l-2 -2.4 '.repeat(8);
  const PACKET = S60(`<ellipse cx="30" cy="56" rx="17" ry="2.6" fill="#6B4A3A" opacity=".14"/><path d="M14 9 ${ZIG_TOP}V51 ${ZIG_BOT}Z" fill="#FFF1E2" stroke="#D9A98A" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="17" y="16" width="26" height="30" rx="5" fill="#E2412F"/><path d="M24 24c4-4 12-2 12 6s-6 12-14 12c4-4 4-10 2-18z" fill="#FF6B57"/><path d="M34 22c0-3 2-4 4-4" stroke="#4F8A3F" stroke-width="2.6" fill="none" stroke-linecap="round"/>${face(29, 31, 0.7)}<path d="M19 18.4h3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`);
  const ITEMS = {
    chicken: { name: 'Chicken', art: S60(`${saucer}${[0, 1, 2, 3].map((i) => `<g transform="translate(${15 + i * 9.6} 41) rotate(${-24 + i * 9})"><rect x="-4.6" y="-15" width="10" height="17" rx="2.8" fill="#FFF4E2" stroke="#D9A86A" stroke-width="1.4"/><rect x="-4.6" y="-15" width="10" height="5" rx="2.4" fill="#E2A04A"/><path d="M-2.4 -13.6h4" stroke="#FFE2B0" stroke-width="1.2" stroke-linecap="round"/><path d="M-1.6 -6v6" stroke="#F3E1C4" stroke-width="1.2" stroke-linecap="round"/></g>`).join('')}<circle cx="26" cy="29" r="1.6" fill="none" stroke="#5E9E45" stroke-width="1.4"/><circle cx="38" cy="31" r="1.4" fill="none" stroke="#5E9E45" stroke-width="1.3"/>`) },
    cucumber: { name: 'Cucumber', art: S60(`${saucer}${[[19, 39], [31, 42], [42, 38], [25, 34], [37, 33]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#EAF6DC" stroke="#3F7A33" stroke-width="2.6"/><circle cx="${x}" cy="${y}" r="3.4" fill="#D3EBB8"/><circle cx="${x - 1.4}" cy="${y - 0.6}" r=".9" fill="#F6FBEF"/><circle cx="${x + 1.4}" cy="${y + 0.6}" r=".9" fill="#F6FBEF"/><circle cx="${x + 0.4}" cy="${y - 1.6}" r=".8" fill="#F6FBEF"/>`).join('')}`) },
    chilli: { name: 'Chilli', art: S60(`${saucer}<ellipse cx="30" cy="41" rx="14.5" ry="5.4" fill="#C8301F"/><ellipse cx="29" cy="40" rx="12" ry="4" fill="#E64A33"/><path d="M22 40c3-2 7-2 10 0" stroke="#FF8A70" stroke-width="1.6" fill="none" stroke-linecap="round"/>${[[25, 41], [33, 39], [36, 42], [28, 38.4]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="1" fill="#FFE0A6"/>`).join('')}<circle cx="31" cy="42.6" r="1" fill="#FFF6E6"/>`) },
    fishcake: { name: 'Fishcake', art: S60(`${saucer}${[[18, 40], [30, 43], [42, 39], [24, 35], [36, 34]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7.6" ry="5.4" fill="#FFFDF8" stroke="#E8607C" stroke-width="2.6"/><path d="M${x - 3} ${y}q3-2.4 6 0" stroke="#F7B6C3" stroke-width="1.4" fill="none" stroke-linecap="round"/>`).join('')}`) },
    egg: { name: 'Fried egg', art: S60(`${saucer}<path d="M13 41c1-8 9-13 17-11 5-3 14-1 16 5s-3 11-11 11-23 2-22-5z" fill="#fff" stroke="#E2B370" stroke-width="2"/><path d="M15 43c4 2 10 2 14 1" stroke="#EFCB92" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="30" cy="37" r="6.6" fill="#FFB020"/><circle cx="28" cy="35.2" r="2" fill="#FFE08A"/>`) },
    onion: { name: 'Spring onion', art: S60(`${saucer}${[[19, 39, 3.6], [27, 43, 3], [35, 38, 3.8], [42, 42, 2.8], [24, 35, 2.6], [33, 44, 2.6], [39, 34, 2.4], [29, 37, 2.2]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 3 ? '#E3F2CF' : '#F2F8E8'}" stroke="${i % 2 ? '#4F8A3F' : '#6FB04F'}" stroke-width="1.8"/>`).join('')}`) },
    curry: { name: 'Curry', art: S60(`${bowl60('#D9822B')}<ellipse cx="25" cy="29.6" rx="3.6" ry="2.4" fill="#F4D58A" stroke="#D9A04A" stroke-width="1"/><ellipse cx="36" cy="31" rx="3" ry="2" fill="#F4D58A" stroke="#D9A04A" stroke-width="1"/><circle cx="31" cy="29" r="1.4" fill="#F7B24A" opacity=".9"/><circle cx="20" cy="31" r="1" fill="#F7B24A"/><path d="M40 28.4c1.6.4 2.6 1.2 3 2" stroke="#7DB35A" stroke-width="1.6" stroke-linecap="round"/>`) },
    eggs: { name: 'Soft eggs', art: S60(`${saucer}<ellipse cx="21" cy="39" rx="9.5" ry="6.4" fill="#FFF8EC" stroke="#E2D3B8" stroke-width="1.5"/><ellipse cx="21" cy="38" rx="5" ry="3.4" fill="#FFB31F"/><ellipse cx="19.6" cy="37" rx="1.6" ry="1" fill="#FFE8A8"/><ellipse cx="38" cy="41" rx="9.5" ry="6.4" fill="#FFF8EC" stroke="#E2D3B8" stroke-width="1.5"/><ellipse cx="38" cy="40" rx="5" ry="3.4" fill="#FFB31F"/><ellipse cx="36.6" cy="39" rx="1.6" ry="1" fill="#FFE8A8"/><path d="M25 45c2 1 4 1 6 0" stroke="#5A3A26" stroke-width="1.6" fill="none" stroke-linecap="round"/>`) },
    soy: { name: 'Soy sauce', art: S60(bottle60('#4A3326', '#E2412F', drop('#4A3326'))) },
    red: { name: 'Red syrup', art: S60(bottle60('#E2415E', '#FFD23F', drop('#E2415E'))) },
    green: { name: 'Green syrup', art: S60(bottle60('#4FAE57', '#FFD23F', drop('#4FAE57'))) },
    corn: { name: 'Sweet corn', art: S60(`${bowl60('#F7D97A')}${[[20, 29], [25, 31.6], [30, 28.6], [35, 31.4], [40, 29.4], [24, 27.4], [33, 26.6], [28, 32.4]].map(([x, y]) => `<rect x="${x - 2.4}" y="${y - 2}" width="4.8" height="4" rx="1.6" fill="#FFCE2E" stroke="#D99A14" stroke-width=".9"/><circle cx="${x - 0.8}" cy="${y - 0.8}" r=".7" fill="#FFF2B0"/>`).join('')}`) },
    beans: { name: 'Red beans', art: S60(`${bowl60('#6B2320')}${[[20, 29], [26, 31.6], [31, 28.4], [36, 31.2], [41, 29.4], [24, 27], [34, 26.6]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="2.3" fill="${i % 2 ? '#9C3A30' : '#8A2F27'}"/><ellipse cx="${x - 1}" cy="${y - 0.8}" rx="1" ry=".6" fill="#D07A6A"/>`).join('')}`) },
    ice: { name: 'Ice', art: S60(`${bowl60('#DCEBF7')}${[[19, 26, -10], [30, 23, 8], [40, 27, -4], [25, 30, 14], [35, 31, -12]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2.4" fill="#F2FAFF" stroke="#8DBBDD" stroke-width="1.6"/><path d="M${x - 3} ${y - 2.6}h3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g>`).join('')}<path d="M47 12l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#BFE3F7"/>`) },
    spoon: { name: 'Spoon', art: SPOON },
    fork: { name: 'Fork', art: FORK },
    straw: { name: 'Straw', art: STRAW },
    packet: { name: 'Chilli packet', art: PACKET }
  };
  const itemName = (k) => (ITEMS[k] ? ITEMS[k].name : k);

  // ---------------------------------------------------------------- each dish, drawn as it is being made
  // has = { layer: true or 0..1 } (200 x 140)
  const PLATE = '<ellipse cx="100" cy="118" rx="84" ry="14" fill="#6B4A3A" opacity=".13"/><ellipse cx="100" cy="106" rx="88" ry="28" fill="#B9CCDA"/><ellipse cx="100" cy="101" rx="88" ry="28" fill="#FAFCFD"/><ellipse cx="100" cy="101" rx="78" ry="23.6" fill="none" stroke="#5FAE9E" stroke-width="3"/><ellipse cx="100" cy="102" rx="62" ry="17.6" fill="#EDF2F6"/><path d="M30 92c8-8 22-12 34-14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>';
  const BOWL = (a, b) => `<ellipse cx="100" cy="132" rx="58" ry="6" fill="#6B4A3A" opacity=".15"/><path d="M22 72h156c-4 36-36 58-78 58S26 108 22 72z" fill="${a}"/><path d="M32 96c14 20 38 28 68 28s54-8 68-28c-10 24-34 34-68 34S42 120 32 96z" fill="${b}" opacity=".6"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${46 + i * 18}" cy="${92 + Math.abs(3 - i) * -1.6}" r="3.4" fill="#fff" opacity=".75"/>`).join('')}<path d="M40 86c6 12 16 20 28 24" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/><ellipse cx="100" cy="72" rx="78" ry="16" fill="#F7F1E6" stroke="${b}" stroke-width="2.4"/>`;
  const sauceDish = (cx, cy, c) => `<ellipse cx="${cx}" cy="${cy + 4}" rx="20" ry="6" fill="#6B4A3A" opacity=".12"/><ellipse cx="${cx}" cy="${cy + 2.4}" rx="21" ry="7.4" fill="#B9CCDA"/><ellipse cx="${cx}" cy="${cy}" rx="21" ry="7.4" fill="#FAFCFD"/><ellipse cx="${cx}" cy="${cy}" rx="17.6" ry="5.8" fill="none" stroke="#5FAE9E" stroke-width="1.4"/><ellipse cx="${cx}" cy="${cy - 0.6}" rx="13" ry="4.2" fill="${c}"/>`;
  const steelBowl = (cx, cy, c) => `<ellipse cx="${cx}" cy="${cy + 18}" rx="16" ry="3.4" fill="#6B4A3A" opacity=".14"/><path d="M${cx - 19} ${cy}h38c-1 12-8 18-19 18s-18-6-19-18z" fill="#C9D2DA" stroke="#7D8894" stroke-width="1.8"/><path d="M${cx - 13} ${cy + 7}c4 5 8 7 13 7" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="${cx}" cy="${cy}" rx="19" ry="5.4" fill="#E8EDF1" stroke="#7D8894" stroke-width="1.8"/><ellipse cx="${cx}" cy="${cy + 0.6}" rx="15.6" ry="4" fill="${c}"/>`;
  const amt = (v) => (v === true ? 1 : Math.max(0, Math.min(1, Number(v) || 0)));
  function dishSvg(id, has) {
    const h = has || {};
    let b = '';
    if (id === 'chickenrice') {
      b = PLATE;
      const a = amt(h.rice);
      if (a > 0) {
        const s = 0.35 + a * 0.65;
        b += `<path d="M${84 - 48 * s} 106q${4 * s} ${-44 * s} ${48 * s} ${-46 * s}q${44 * s} ${2 * s} ${48 * s} ${46 * s}q${-48 * s} ${8 * s} ${-96 * s} 0z" fill="#FFFDF5" stroke="#E6DDC8" stroke-width="2.4"/>`;
        // rice grains
        b += [[66, 96], [76, 88], [88, 84], [98, 92], [72, 100], [84, 96], [94, 100], [104, 98], [80, 78], [62, 102], [90, 74], [106, 104]].filter((_, i) => i < 3 + a * 9).map(([x, y], i) => `<ellipse cx="${84 + (x - 84) * s}" cy="${106 + (y - 106) * s}" rx="3" ry="1.5" fill="#EFE7D4" transform="rotate(${(i * 37) % 80 - 40} ${84 + (x - 84) * s} ${106 + (y - 106) * s})"/>`).join('');
        if (a >= 1) b += '<path d="M70 72c4-6 10-9 16-9" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>';
      }
      if (h.cucumber) b += [[34, 104], [48, 110], [62, 113], [42, 98]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.4" fill="#EAF6DC" stroke="#3F7A33" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#D3EBB8"/><circle cx="${x - 2}" cy="${y}" r="1" fill="#F6FBEF"/><circle cx="${x + 2}" cy="${y}" r="1" fill="#F6FBEF"/>`).join('');
      if (h.chicken) {
        b += [0, 1, 2, 3, 4].map((i) => `<g transform="translate(${112 + i * 12} 104) rotate(${-14 + i * 6})"><path d="M-6 0l2-30h13l1 30z" fill="#FFF4E2" stroke="#D9A86A" stroke-width="1.8" stroke-linejoin="round"/><path d="M-4 -30h13l.4 7H-4.4z" fill="#E09A44"/><path d="M-1 -28h7" stroke="#FFD9A0" stroke-width="1.6" stroke-linecap="round"/><path d="M0 -18v14" stroke="#F3E1C4" stroke-width="1.6" stroke-linecap="round"/></g>`).join('');
        b += '<path d="M116 76c10-2 26-2 44 2" stroke="#8A5A2A" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".45"/>';
        b += [[122, 70], [134, 72], [148, 70], [158, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#F2F8E8" stroke="#4F8A3F" stroke-width="1.6"/>`).join('');
      }
      if (h.chilli) b += `${sauceDish(170, 62, '#E64A33')}<circle cx="165" cy="61" r="1.3" fill="#FFE0A6"/><circle cx="173" cy="62.4" r="1.2" fill="#FFE0A6"/><circle cx="169" cy="60" r="1" fill="#FFF6E6"/>`;
    } else if (id === 'noodles') {
      b = BOWL('#E8775E', '#B84A35');
      if (h.noodles) {
        b += '<ellipse cx="100" cy="70" rx="70" ry="12" fill="#C98F3A"/>';
        b += [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${36 + (i % 2) * 6} ${60 + i * 3.6}q10 -8 20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="${['#E8B95A', '#C98F3A', '#F0C86A'][i % 3]}" stroke-width="4.6" stroke-linecap="round"/>`).join('');
        // choy sum leaves and bean sprouts
        b += [[50, 62, -20], [86, 58, 10], [118, 66, -30], [146, 60, 20], [66, 72, 40]].map(([x, y, r]) => `<path d="M${x} ${y}c-2-8 4-14 10-14 4 6 2 14-10 14z" fill="#6FAF52" stroke="#3F7A33" stroke-width="1.4" transform="rotate(${r} ${x} ${y})"/>`).join('');
        b += [[74, 62], [104, 70], [132, 72], [60, 68]].map(([x, y]) => `<path d="M${x} ${y}q6 -4 12 0" stroke="#FFF8E6" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join('');
      }
      if (h.fishcake) b += [[60, 68], [76, 62], [92, 70]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9.4" ry="5.6" fill="#FFFDF8" stroke="#E8607C" stroke-width="2.6"/><path d="M${x - 4} ${y}q4-3 8 0" stroke="#F7B6C3" stroke-width="1.6" fill="none" stroke-linecap="round"/>`).join('');
      if (h.egg) b += '<path d="M110 64c2-9 12-13 22-11s17 3 16 10-12 11-21 10-18-1-17-9z" fill="#fff" stroke="#E2B370" stroke-width="2"/><circle cx="129" cy="62" r="7" fill="#FFB020"/><circle cx="127" cy="60" r="2.2" fill="#FFE08A"/>';
      if (h.onion) b += [[54, 58], [100, 56], [118, 74], [148, 68], [84, 74], [70, 56], [138, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#F2F8E8" stroke="#4F8A3F" stroke-width="1.8"/>`).join('');
    } else if (id === 'prata') {
      b = PLATE;
      const d = amt(h.dough);
      if (h.cooked) {
        b += '<ellipse cx="92" cy="99" rx="57" ry="17.4" fill="#C9853A"/><ellipse cx="92" cy="95.6" rx="54" ry="15.4" fill="#F2BE68"/>';
        b += '<path d="M54 95c10-8 30-11 50-8s22 8 10 11-34 2-36-3 8-6 20-5" stroke="#D9963F" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
        b += [[64, 90], [116, 92], [100, 104], [76, 102], [126, 100]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2" fill="#B8772E" opacity=".6"/>`).join('');
        b += '<path d="M60 88c8-4 18-6 28-6" stroke="#FFE3A6" stroke-width="3" fill="none" stroke-linecap="round"/>';
        if (h.cut) b += '<path d="M72 81 77 112M110 80 106 112M56 98h72" stroke="#A56A28" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 0"/>';
      } else if (d > 0) b += `<ellipse cx="92" cy="97" rx="${20 + d * 34}" ry="${8 + d * 7}" fill="#F6E7C8" stroke="#E3CFA0" stroke-width="2.5"/><path d="M${92 - 10 - d * 20} 96q${10 + d * 20} -6 ${20 + d * 40} 0" stroke="#FFF6E2" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      if (h.curry) b += `${steelBowl(170, 60, '#D9822B')}<ellipse cx="165" cy="60" rx="3.6" ry="2.2" fill="#F4D58A"/><ellipse cx="176" cy="61.4" rx="3" ry="1.8" fill="#F4D58A"/><circle cx="171" cy="59" r="1.4" fill="#F7B24A"/>`;
    } else if (id === 'kaya') {
      b = PLATE;
      const t = amt(h.toast);
      const k = amt(h.kaya);
      [[40, 76], [100, 80]].forEach(([x, y]) => {
        b += `<rect x="${x}" y="${y}" width="54" height="30" rx="8" fill="#F6E2B8" stroke="#B8833E" stroke-width="2.5"/><rect x="${x + 4}" y="${y + 4}" width="46" height="22" rx="5" fill="#FBEFD2"/>`;
        if (t > 0) b += `<rect x="${x}" y="${y}" width="54" height="30" rx="8" fill="#C98A3E" opacity="${(t * 0.62).toFixed(2)}"/>${[0, 1, 2].map((j) => `<path d="M${x + 12 + j * 15} ${y + 4}v22" stroke="#7A4A1E" stroke-width="2.6" stroke-linecap="round" opacity="${(t * 0.6).toFixed(2)}"/>`).join('')}`;
        if (k > 0) b += `<rect x="${x + 4}" y="${y + 10}" width="${46 * k}" height="8" rx="3" fill="#8C6A2E"/><rect x="${x + 4}" y="${y + 11}" width="${46 * k}" height="3" rx="1.5" fill="#7FB069" opacity=".8"/>${k >= 1 ? `<rect x="${x + 14}" y="${y + 17}" width="24" height="6" rx="1.6" fill="#FFF0B8" stroke="#E8CF7A" stroke-width="1.2"/>` : ''}`;
        if (h.cut) b += `<path d="M${x + 27} ${y - 2}v34" stroke="#FAFCFD" stroke-width="3.4"/>`;
      });
      if (h.eggs) b += `${sauceDish(170, 64, '#FFF8EC')}<ellipse cx="164" cy="62.6" rx="5.4" ry="3.4" fill="#FFB31F"/><ellipse cx="177" cy="64" rx="5.4" ry="3.4" fill="#FFB31F"/><ellipse cx="162.6" cy="61.8" rx="1.6" ry="1" fill="#FFE8A8"/><ellipse cx="175.6" cy="63.2" rx="1.6" ry="1" fill="#FFE8A8"/>`;
      if (h.soy) b += '<path d="M158 66c4-2 8 1 12-1s8 2 12 0" stroke="#4A3326" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="168" cy="69" r="1.6" fill="#4A3326"/>';
    } else if (id === 'kachang') {
      b = BOWL('#B9A6E0', '#8E78C9');
      const a = amt(h.ice);
      if (a > 0) {
        const s = 0.3 + a * 0.7;
        const L = 100 - 70 * s, R = 100 + 70 * s, T = 76 - 70 * s;
        b += `<path d="M${L} 76C${L + 4 * s} ${76 - 52 * s} ${100 - 40 * s} ${T} 100 ${T}S${R - 4 * s} ${76 - 52 * s} ${R} 76Q100 90 ${L} 76z" fill="#FBF9FE" stroke="#DCD4EC" stroke-width="2.5"/><path d="M${100 - 40 * s} ${76 - 30 * s}q${20 * s} ${-26 * s} ${46 * s} ${-30 * s}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>`;
        b += [[80, 60], [112, 50], [128, 66], [92, 40], [70, 70]].filter((_, i) => i < a * 5).map(([x, y]) => `<circle cx="${100 + (x - 100) * s}" cy="${76 + (y - 76) * s}" r="2" fill="#E3ECF3"/>`).join('');
      }
      if (h.red) b += '<path d="M56 50c14-10 28-4 44-12s28 2 44 0" stroke="#F26B8A" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M62 47c8-4 14-4 20-6" stroke="#FFB3C4" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      if (h.green) b += '<path d="M44 64c16-6 30 0 50-5s34 1 60-1" stroke="#7CC26A" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M52 62c8-2 16-2 22-3" stroke="#C4E8B4" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      if (h.corn) b += [[80, 34], [92, 28], [112, 32], [124, 40], [70, 44], [102, 44]].map(([x, y]) => `<rect x="${x - 4}" y="${y - 3.4}" width="8" height="6.8" rx="2.6" fill="#FFCE2E" stroke="#D99A14" stroke-width="1.3"/><circle cx="${x - 1.4}" cy="${y - 1.2}" r="1.1" fill="#FFF2B0"/>`).join('');
      if (h.beans) b += [[100, 22], [88, 40], [116, 46], [130, 30], [74, 54]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.6" fill="#8E2F2A"/><ellipse cx="${x - 1.6}" cy="${y - 1.2}" rx="1.6" ry="1" fill="#D07A6A"/>`).join('');
    } else if (id === 'milo') {
      // a glass mug: powder, then hot water, then stirred, then ice
      const p = amt(h.powder), w = amt(h.water), st = amt(h.stir);
      b = '<ellipse cx="100" cy="134" rx="42" ry="5" fill="#6B4A3A" opacity=".15"/><path d="M152 60c16 0 22 10 22 22s-8 22-24 22" stroke="#DCE6EE" stroke-width="9" fill="none"/>';
      const lvl = Math.max(p * 0.12, w * 0.8);
      if (lvl > 0) {
        const top = 126 - lvl * 92;
        const half = (y) => 34 - 6 * ((126 - y) / 92);
        const col = w > 0 ? (st >= 1 ? '#8A5A3C' : `rgb(${Math.round(176 - 38 * st)},${Math.round(130 - 40 * st)},${Math.round(92 - 32 * st)})`) : '#5E3A22';
        b += `<path d="M${100 - half(top)} ${top}H${100 + half(top)}L${100 + 28} 124q0 4-4 4H${76}q-4 0-4-4z" fill="${col}"/>`;
        if (w > 0 && st < 1) b += [[88, top + 6], [108, top + 14], [96, top + 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${4 - st * 3}" fill="#5E3A22" opacity="${(1 - st).toFixed(2)}"/>`).join('');
        if (st >= 1) b += `<ellipse cx="100" cy="${top + 1}" rx="${half(top) - 2}" ry="4" fill="#B88A64"/>${[[90, top], [104, top + 1], [112, top - 1]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#D9B48E"/>`).join('')}`;
        if (w > 0) b += [0, 1].map((i) => `<path d="M${92 + i * 16} ${top - 8}c-5-6 5-10 0-18" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`).join('');
      }
      if (h.ice) b += [[86, 44], [102, 40], [114, 48]].map(([x, y]) => `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="3" fill="#E8F4FC" stroke="#9CC5E0" stroke-width="2" opacity=".95"/><path d="M${x - 4} ${y - 4}h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`).join('');
      b += '<path d="M60 30h80l-10 96q-1 6-7 6H77q-6 0-7-6z" fill="#EEF6FA" opacity=".35" stroke="#BCD0DE" stroke-width="4" stroke-linejoin="round"/><path d="M70 40l8 80" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>';
    }
    return `<svg viewBox="0 0 200 140" width="100%" height="100%" aria-hidden="true">${b}</svg>`;
  }
  // a finished dish in its takeaway box (or cup), lid on or off. A closed box gets a rubber band, like at a real stall.
  function packSvg(id, lid) {
    const drink = DRINK[id];
    if (drink) {
      const liquid = id === 'milo' ? '#8A5A3C' : '#F7F4FB';
      return `<svg viewBox="0 0 120 140" width="100%" height="100%" aria-hidden="true"><ellipse cx="60" cy="134" rx="34" ry="4.4" fill="#6B4A3A" opacity=".15"/>
        <path d="M22 40h76l-8 88q-1 6-7 6H37q-6 0-7-6z" fill="${liquid}" stroke="#BCD0DE" stroke-width="4" stroke-linejoin="round"/>
        ${id === 'kachang' ? '<path d="M30 62c12-6 24 0 30-4s18 2 30-1" stroke="#F26B8A" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M30 80c12-4 26 2 34-2s16 0 26-2" stroke="#7CC26A" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="48" cy="96" r="3" fill="#FFCE2E"/><circle cx="66" cy="100" r="3" fill="#8E2F2A"/>' : '<ellipse cx="60" cy="46" rx="36" ry="4" fill="#B88A64"/>'}
        <path d="M32 54l6 70" stroke="#fff" stroke-width="5" opacity=".5" stroke-linecap="round"/>
        ${lid ? `<ellipse cx="60" cy="40" rx="40" ry="7" fill="#F4F8FB" stroke="#BCD0DE" stroke-width="3"/><ellipse cx="60" cy="40" rx="30" ry="4.6" fill="#FFE4EC"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${40 + i * 10}" cy="40" r="1.8" fill="#F28AA6"/>`).join('')}<path d="M18 40v5q0 3 4 3h76q4 0 4-3v-5" fill="none" stroke="#BCD0DE" stroke-width="3"/>${face(60, 84, 2.4)}` : ''}</svg>`;
    }
    const fills = { chickenrice: '#FFFDF5', noodles: '#DDA64E', prata: '#F2BE68', kaya: '#E9B46A' };
    const peek = {
      chickenrice: '<path d="M80 44l8-10 9 3-6 10z" fill="#FFF4E2" stroke="#D9A86A" stroke-width="2"/><path d="M93 45l8-10 9 3-6 10z" fill="#FFF4E2" stroke="#D9A86A" stroke-width="2"/><circle cx="40" cy="47" r="5" fill="#EAF6DC" stroke="#3F7A33" stroke-width="2"/>',
      noodles: '<path d="M26 47q8-6 16 0t16 0t16 0t16 0t16 0t16 0" stroke="#C98F3A" stroke-width="4" fill="none"/><path d="M48 44c-1-5 3-8 7-8 2 4 1 8-7 8z" fill="#6FAF52"/>',
      prata: '<path d="M30 48c12-6 30-8 50-6" stroke="#C9853A" stroke-width="3" fill="none"/>',
      kaya: '<rect x="44" y="40" width="22" height="10" rx="3" fill="#C98A3E"/><rect x="72" y="40" width="22" height="10" rx="3" fill="#C98A3E"/>'
    };
    return `<svg viewBox="0 0 140 120" width="100%" height="100%" aria-hidden="true"><ellipse cx="70" cy="113" rx="58" ry="5" fill="#6B4A3A" opacity=".15"/>
      <path d="M12 46h116l-8 58q-1 6-7 6H27q-6 0-7-6z" fill="#D9B07A" stroke="#9C7343" stroke-width="3.4" stroke-linejoin="round"/><path d="M18 52h104l-1.4 10H19.4z" fill="#C99A62" opacity=".55"/><path d="M24 72v30M116 72v30" stroke="#E7C796" stroke-width="2.4" stroke-linecap="round"/>
      ${lid ? `<path d="M8 46l10-22h104l10 22z" fill="#E2BE8A" stroke="#9C7343" stroke-width="3.4" stroke-linejoin="round"/><path d="M30 30h80" stroke="#F0D4A6" stroke-width="3" stroke-linecap="round"/>
          <path d="M30 24l-4 22v64" fill="none" stroke="#E2412F" stroke-width="4" stroke-linecap="round"/><path d="M110 24l4 22v64" fill="none" stroke="#E2412F" stroke-width="4" stroke-linecap="round"/>${face(70, 80, 2.6)}`
        : `<ellipse cx="70" cy="48" rx="54" ry="9" fill="${fills[id] || '#FFFDF5'}"/>${peek[id] || ''}`}</svg>`;
  }
  // the classic "THANK YOU" bag
  const BAG = (tied, inside) => `<div class="hk-bag ${tied ? 'tied' : ''}">${inside}<svg class="hk-bag-svg" viewBox="0 0 220 200" preserveAspectRatio="none" aria-hidden="true">
      <path d="M30 60h160l10 124q1 10-9 10H29q-10 0-9-10z" fill="rgba(255,255,255,.5)" stroke="#E2412F" stroke-width="4" stroke-linejoin="round"/>
      <path d="M40 72l-4 100M180 72l4 100" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>
      <g opacity=".92"><circle cx="44" cy="180" r="9" fill="none" stroke="#E2412F" stroke-width="2.4"/><circle cx="41" cy="178" r="1.4" fill="#E2412F"/><circle cx="47" cy="178" r="1.4" fill="#E2412F"/><path d="M40 182.4q4 3.4 8 0" stroke="#E2412F" stroke-width="2" fill="none" stroke-linecap="round"/>
      <text x="126" y="186" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="16" fill="#E2412F" letter-spacing="2">THANK YOU</text></g>
      ${tied ? '<path d="M64 62c0-34 22-46 46-28 24-18 46-6 46 28" fill="none" stroke="#F3D2CB" stroke-width="12" stroke-linecap="round"/><path d="M64 62c0-34 22-46 46-28 24-18 46-6 46 28" fill="none" stroke="#E2412F" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M94 30c8 2 24 2 32 0l-6 12h-20z" fill="#F3D2CB" stroke="#E2412F" stroke-width="3" stroke-linejoin="round"/><path d="M100 24c-6-8-16-6-16 0s10 8 16 4M120 24c6-8 16-6 16 0s-10 8-16 4" fill="#F3D2CB" stroke="#E2412F" stroke-width="3"/>'
        : '<path d="M56 60c0-40 30-54 54-54s54 14 54 54" fill="none" stroke="#F3D2CB" stroke-width="10"/><path d="M56 60c0-40 30-54 54-54s54 14 54 54" fill="none" stroke="#E2412F" stroke-width="3" opacity=".6"/>'}</svg></div>`;
  // the rice pot with its wooden paddle, the Milo tin, the kopi pot, a stack of bags
  const POT = S60(`<ellipse cx="30" cy="56" rx="25" ry="3" fill="#6B4A3A" opacity=".16"/><path d="M5 25h50v22a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8z" fill="#C9D2DA" stroke="#6F7B87" stroke-width="2.2"/><path d="M10 31v14" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><path d="M5 38h50" stroke="#A9B4BF" stroke-width="1.6"/>
    <path d="M1 30h5M54 30h5" stroke="#6F7B87" stroke-width="4" stroke-linecap="round"/><ellipse cx="30" cy="25" rx="25" ry="7.4" fill="#E8EDF1" stroke="#6F7B87" stroke-width="2.2"/><ellipse cx="30" cy="25.6" rx="21" ry="5.4" fill="#FFFDF5"/>
    ${[[20, 25], [26, 27], [34, 24], [40, 26.4], [24, 23.4], [30, 26.6]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry=".9" fill="#E9E1CC"/>`).join('')}
    <path d="M37 24 50 3" stroke="#C99A62" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="35" cy="24.4" rx="7" ry="3.4" fill="#E2BE8A" stroke="#9C7343" stroke-width="1.6"/>
    <path d="M16 15c-3-4 3-6 0-11M26 13c-3-4 3-6 0-11" stroke="#DCE6EE" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  const TIN = S60(`<ellipse cx="30" cy="57" rx="17" ry="2.6" fill="#6B4A3A" opacity=".16"/><rect x="13" y="11" width="34" height="45" rx="5" fill="#2E8B3E" stroke="#1F5E2A" stroke-width="2.2"/><rect x="13" y="7" width="34" height="8" rx="3" fill="#D5DCE3" stroke="#6F7B87" stroke-width="1.8"/><path d="M17 18v32" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".35"/>
    <rect x="17" y="24" width="26" height="22" rx="5" fill="#FFF8E6"/><path d="M23 32h12l-1.4 9a2 2 0 0 1-2 1.6h-5.2a2 2 0 0 1-2-1.6z" fill="#8A5A3C"/><path d="M35 34c3 0 3 4 0 4" stroke="#8A5A3C" stroke-width="1.6" fill="none"/>${face(29, 37.4, 0.45)}<path d="M27 30c-1-2 1-3 0-5M31 30c-1-2 1-3 0-5" stroke="#B88A64" stroke-width="1.2" fill="none" stroke-linecap="round"/>`);
  const KETTLE = S60(`<ellipse cx="28" cy="57" rx="17" ry="2.6" fill="#6B4A3A" opacity=".16"/><path d="M14 22h28l3 30a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4z" fill="#D5DCE3" stroke="#6F7B87" stroke-width="2.2"/><path d="M16 26l-1.6 24" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>
    <path d="M44 44c6-6 8-18 14-26" stroke="#6F7B87" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M44 44c6-6 8-18 14-26" stroke="#D5DCE3" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M12 30c-6 0-8 4-8 10s3 9 8 9" stroke="#6F7B87" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="28" cy="22" rx="14" ry="4" fill="#E8EDF1" stroke="#6F7B87" stroke-width="2"/><circle cx="28" cy="17" r="3" fill="#3B2F2F"/>
    <path d="M56 12c-3-3 2-5 0-9M50 14c-3-3 2-5 0-9" stroke="#DCE6EE" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);
  const BAGSRC = S60(`<ellipse cx="30" cy="57" rx="22" ry="2.6" fill="#6B4A3A" opacity=".16"/><path d="M8 26h40l4 30H6z" fill="#F7F1EC" stroke="#E2412F" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 22h40l4 30H9z" fill="#fff" stroke="#E2412F" stroke-width="2" stroke-linejoin="round"/>
    <path d="M21 22c0-12 4-16 10-16s10 4 10 16" fill="none" stroke="#E2412F" stroke-width="2.6"/><circle cx="32" cy="34" r="7" fill="none" stroke="#E2412F" stroke-width="1.8"/><circle cx="29.6" cy="32.6" r="1" fill="#E2412F"/><circle cx="34.4" cy="32.6" r="1" fill="#E2412F"/><path d="M29 35.6q3 2.6 6 0" stroke="#E2412F" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M20 46h24" stroke="#E2412F" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 2"/>`);
  const SRC = { rice: ['Rice pot', POT], tin: ['Milo tin', TIN], kettle: ['Hot water', KETTLE], bag: ['Bag', BAGSRC] };
  // the tool under the finger while rubbing (64 x 64)
  const T64 = (body) => `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">${body}</svg>`;
  const TOOLS = {
    ladle: T64('<path d="M36 30 58 6" stroke="#9C7343" stroke-width="7" stroke-linecap="round"/><path d="M36 30 58 6" stroke="#C99A62" stroke-width="3" stroke-linecap="round"/><path d="M8 30a16 16 0 0 0 32 0z" fill="#C9D2DA" stroke="#6F7B87" stroke-width="3"/><path d="M14 34c2 4 6 7 10 7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>'),
    flipper: T64('<path d="M38 28 58 6" stroke="#3B2F2F" stroke-width="7" stroke-linecap="round"/><path d="M8 26l18-12 16 18-18 12z" fill="#D5DCE3" stroke="#6F7B87" stroke-width="3" stroke-linejoin="round"/><path d="M16 26l10-7M20 31l10-7M24 36l10-7" stroke="#8F9CA8" stroke-width="2" stroke-linecap="round"/>'),
    knife: T64('<path d="M8 50 40 18c4-4 10-2 8 4L20 54z" fill="#D5DCE3" stroke="#6F7B87" stroke-width="3" stroke-linejoin="round"/><path d="M40 18l16-14" stroke="#C99A62" stroke-width="8" stroke-linecap="round"/><path d="M12 50l16-16" stroke="#8C6A2E" stroke-width="4" stroke-linecap="round" opacity=".8"/>'),
    shaver: T64('<rect x="10" y="20" width="40" height="26" rx="8" fill="#E7F3FB" stroke="#5B8FB9" stroke-width="3"/><path d="M14 46h32" stroke="#6F7B87" stroke-width="4" stroke-linecap="round"/><path d="M30 20V6" stroke="#5B8FB9" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="6" r="5" fill="#F26B8A"/><path d="M16 52l2 4M30 52v5M44 52l-2 4" stroke="#BFE3F7" stroke-width="3" stroke-linecap="round"/>'),
    spoon: T64('<g transform="rotate(35 32 32) translate(2 2)">' + SPOON_G.replace(/stroke-width="2"/g, 'stroke-width="2.4"') + '</g>'),
    hand: T64('<path d="M20 58c-6-6-12-14-12-22 0-4 4-5 6-2l4 6V12c0-3 5-3 5 0v18-22c0-3 5-3 5 0v22-18c0-3 5-3 5 0v20-14c0-3 5-3 5 0v24c0 10-4 16-8 20z" fill="#FFD9B8" stroke="#B87E54" stroke-width="2.6" stroke-linejoin="round"/>')
  };

  // the work you rub with a finger: wash in the sink, fry in the wok, spread the dough, toast, spread kaya, shave ice, stir
  function rubSvg(look, p) {
    const q = Math.max(0, Math.min(1, p));
    const spin = Math.round(q * 540);
    const leaves = (op) => [[-40, -14, -20], [-6, -26, 10], [26, -6, 40], [-24, 18, -60], [16, 22, 70]].map(([x, y, r]) => `<g transform="translate(${130 + x} ${126 + y}) rotate(${r})"><path d="M0 0c-6-16 0-34 10-40 10 6 16 24 10 40z" fill="#7FB069" stroke="#4F8A3F" stroke-width="2.4"/><path d="M10 -36v34" stroke="#CFE3B4" stroke-width="3"/></g>`).join('') + (op ? `<g opacity="${op}">${[[-30, -10], [20, -20], [6, 22], [-10, 6], [34, 14]].map(([x, y]) => `<circle cx="${130 + x}" cy="${126 + y}" r="7" fill="#8A6A4A" opacity=".55"/>`).join('')}</g>` : '');
    if (look === 'sink') {
      return `<svg viewBox="0 0 260 260" width="100%" height="100%" aria-hidden="true"><rect x="20" y="70" width="220" height="170" rx="26" fill="#C9D1D9" stroke="#8A94A0" stroke-width="5"/><rect x="38" y="88" width="184" height="134" rx="18" fill="#9FC7E4"/>
        <path d="M130 14v40" stroke="#8A94A0" stroke-width="12" stroke-linecap="round"/><path d="M130 50h30" stroke="#8A94A0" stroke-width="10" stroke-linecap="round"/><path d="M130 58v30" stroke="#BFE3F7" stroke-width="10" stroke-linecap="round" opacity=".9"/>
        ${leaves((1 - q).toFixed(2))}${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${60 + i * 28}" cy="${110 + (i % 2) * 70}" r="${5 + (i % 3) * 3}" fill="#fff" opacity="${(q * 0.9).toFixed(2)}"/>`).join('')}</svg>`;
    }
    if (look === 'dough') {
      return `<svg viewBox="0 0 260 260" width="100%" height="100%" aria-hidden="true"><circle cx="130" cy="130" r="122" fill="#C9D1D9" stroke="#8A94A0" stroke-width="6"/><circle cx="130" cy="130" r="108" fill="#DDE3E9"/>
        <ellipse cx="130" cy="130" rx="${34 + q * 66}" ry="${30 + q * 62}" fill="#F6E7C8" stroke="#E3CFA0" stroke-width="4"/><path d="M${110 - q * 40} 128q${20 + q * 40} -14 ${40 + q * 80} 0" stroke="#E9D6A8" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
    }
    if (look === 'grill' || look === 'spread') {
      const toast = look === 'grill' ? q : 1;
      const kaya = look === 'spread' ? q : 0;
      return `<svg viewBox="0 0 260 260" width="100%" height="100%" aria-hidden="true">${look === 'grill' ? '<rect x="10" y="40" width="240" height="180" rx="20" fill="#4A525E"/>' + [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M30 ${62 + i * 22}h200" stroke="#2F3640" stroke-width="6"/>`).join('') : '<ellipse cx="130" cy="150" rx="120" ry="80" fill="#EEF4F8" stroke="#C7D9E6" stroke-width="5"/>'}
        ${[[40, 80], [140, 80]].map(([x, y]) => `<rect x="${x}" y="${y}" width="84" height="100" rx="14" fill="#F6E2B8" stroke="#C99A5A" stroke-width="4"/><rect x="${x}" y="${y}" width="84" height="100" rx="14" fill="#C98A3E" opacity="${(toast * 0.72).toFixed(2)}"/>
          ${[0, 1, 2].map((j) => `<path d="M${x + 16 + j * 26} ${y + 10}v80" stroke="#7A4A1E" stroke-width="4" opacity="${(toast * 0.55).toFixed(2)}"/>`).join('')}
          ${kaya ? `<rect x="${x + 8}" y="${y + 10}" width="${68 * kaya}" height="80" rx="10" fill="#7FB069" opacity=".9"/><rect x="${x + 8}" y="${y + 40}" width="${68 * kaya}" height="14" rx="5" fill="#FFF3C4"/>` : ''}`).join('')}</svg>`;
    }
    if (look === 'ice') {
      return `<svg viewBox="0 0 260 260" width="100%" height="100%" aria-hidden="true"><circle cx="130" cy="130" r="122" fill="#B9A6E0" stroke="#8E78C9" stroke-width="6"/><circle cx="130" cy="130" r="100" fill="#F4F8FB"/>
        <circle cx="130" cy="130" r="${20 + q * 74}" fill="#fff" stroke="#E3ECF3" stroke-width="4"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${130 + Math.cos(i + spin / 60) * (20 + q * 60)}" cy="${130 + Math.sin(i + spin / 60) * (20 + q * 60)}" r="4" fill="#DDEBF5"/>`).join('')}</svg>`;
    }
    if (look === 'cup') {
      const col = `rgb(${Math.round(176 - 38 * q)},${Math.round(130 - 40 * q)},${Math.round(92 - 32 * q)})`;
      return `<svg viewBox="0 0 260 260" width="100%" height="100%" aria-hidden="true"><circle cx="130" cy="130" r="122" fill="#DCE3E8" stroke="#B9C4CE" stroke-width="6"/><circle cx="130" cy="130" r="104" fill="#fff"/><circle cx="130" cy="130" r="94" fill="${col}"/>
        <g transform="rotate(${spin} 130 130)">${[[-40, -20], [30, -40], [10, 40], [-30, 36], [46, 20]].map(([x, y]) => `<circle cx="${130 + x}" cy="${130 + y}" r="${9 - q * 8}" fill="#5E3A22" opacity="${(1 - q).toFixed(2)}"/>`).join('')}<path d="M130 60q40 10 50 60" stroke="#B88A64" stroke-width="6" fill="none" opacity="${(q * 0.8).toFixed(2)}" stroke-linecap="round"/></g></svg>`;
    }
    // the wok (fried noodles) and the hot pan (prata)
    const pan = look === 'pan';
    return `<svg viewBox="0 0 260 260" width="100%" height="100%" aria-hidden="true"><circle cx="130" cy="130" r="122" fill="#4A525E" stroke="#2F3640" stroke-width="6"/><circle cx="130" cy="130" r="${pan ? 108 : 96}" fill="${pan ? '#555D69' : '#6E7783'}"/>
      <g transform="rotate(${spin} 130 130)">${pan ? `<circle cx="130" cy="130" r="82" fill="#F6E7C8" stroke="#E3CFA0" stroke-width="5"/><circle cx="130" cy="130" r="82" fill="#E0A04B" opacity="${(q * 0.85).toFixed(2)}"/><path d="M80 120q50-24 100 4M90 150q40 16 80-6" stroke="#C9853A" stroke-width="4" fill="none" opacity="${q.toFixed(2)}"/>`
        : `${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${64 + (i % 2) * 8} ${96 + i * 14}q16 -12 32 0t32 0t32 0t32 0" fill="none" stroke="${q > 0.5 ? '#C98F3A' : '#E9C766'}" stroke-width="7" stroke-linecap="round"/>`).join('')}${[[90, 100], [150, 110], [120, 160], [170, 150], [96, 170], [140, 84]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="12" rx="4" fill="#7FB069" stroke="#4F8A3F" stroke-width="2"/>`).join('')}`}</g>
      ${[0, 1, 2].map((i) => `<path d="M${100 + i * 30} 40c-8 -10 8 -16 0 -28" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="${(0.2 + q * 0.6).toFixed(2)}"/>`).join('')}</svg>`;
  }
  const RUB_TOOL = { sink: 'hand', wok: 'ladle', pan: 'flipper', dough: 'hand', grill: 'flipper', spread: 'knife', ice: 'shaver', cup: 'spoon' };

  // ---------------------------------------------------------------- how each dish is really made
  // k: taps (tap the pot), rub (rub with a finger, or tap), chop (slice the dotted lines), pick (tap each thing)
  function recipe(id, lv, no) {
    const tops = (all) => ({ items: all, need: all.filter((x) => x !== no) });
    const R = {
      chickenrice: [
        { k: 'taps', src: 'rice', n: lv === 1 ? 2 : 3, layer: 'rice', title: 'Scoop the rice', say: 'Scoop rice onto the plate. Tap the rice pot.' },
        { k: 'chop', item: 'chicken', title: 'Chop the chicken', say: 'Chop the chicken into slices. Slide along the dotted lines.' },
        lv >= 2 && { k: 'chop', item: 'cucumber', title: 'Slice the cucumber', say: 'Slice the cucumber.' },
        Object.assign({ k: 'pick', kind: 'top', title: 'Put it on the plate', say: 'Put the chicken on the rice. Then the cucumber and the chilli.' }, tops(lv >= 2 ? ['chicken', 'cucumber', 'chilli'] : ['chicken', 'chilli']))
      ],
      noodles: [
        lv >= 2 && { k: 'rub', look: 'sink', title: 'Wash the vegetables', say: 'Wash the vegetables. Rub them in the water.' },
        { k: 'chop', item: 'choysum', title: 'Cut the vegetables', say: 'Cut the vegetables.' },
        { k: 'rub', look: 'wok', layer: 'noodles', title: 'Fry the noodles', say: 'Fry the noodles in the wok. Round and round.' },
        Object.assign({ k: 'pick', kind: 'top', title: 'Add the toppings', say: 'Add the toppings on the noodles.' }, tops(lv >= 2 ? ['fishcake', 'egg', 'onion'] : ['fishcake', 'onion']))
      ],
      prata: [
        { k: 'rub', look: 'dough', layer: 'dough', title: 'Spread the dough', say: 'Spread the dough out thin. Round and round.' },
        { k: 'rub', look: 'pan', layer: 'cooked', title: 'Cook the prata', say: 'Cook the prata on the hot pan until it is golden.' },
        lv >= 2 && { k: 'chop', item: 'prata', layer: 'cut', title: 'Cut the prata', say: 'Cut the prata into pieces.' },
        Object.assign({ k: 'pick', kind: 'top', title: 'Add the curry', say: 'Add a bowl of curry.' }, tops(['curry']))
      ],
      kaya: [
        { k: 'rub', look: 'grill', layer: 'toast', title: 'Toast the bread', say: 'Toast the bread on the grill. Rub until it is golden.' },
        { k: 'rub', look: 'spread', layer: 'kaya', title: 'Spread the kaya', say: 'Spread the kaya and butter.' },
        { k: 'chop', item: 'toast', layer: 'cut', title: 'Cut the toast', say: 'Cut the kaya toast.' },
        lv >= 2 && Object.assign({ k: 'pick', kind: 'top', title: 'Add the eggs', say: 'Add the soft eggs.' }, tops(['eggs', 'soy']))
      ],
      kachang: [
        { k: 'rub', look: 'ice', layer: 'ice', title: 'Shave the ice', say: 'Shave the ice into the bowl. Round and round.' },
        Object.assign({ k: 'pick', kind: 'top', title: 'Add the toppings', say: 'Add the syrup and the toppings.' }, tops(lv >= 2 ? ['red', 'green', 'corn', 'beans'] : ['red', 'green', 'corn']))
      ],
      milo: [
        { k: 'taps', src: 'tin', n: lv === 1 ? 2 : 3, layer: 'powder', title: 'Scoop the Milo', say: 'Scoop the Milo powder into the cup. Tap the tin.' },
        { k: 'taps', src: 'kettle', n: 2, layer: 'water', title: 'Pour the hot water', say: 'Pour the hot water. Tap the kettle.' },
        { k: 'rub', look: 'cup', layer: 'stir', title: 'Stir the Milo', say: 'Stir the Milo. Round and round.' },
        lv >= 2 && Object.assign({ k: 'pick', kind: 'top', title: 'Add ice', say: 'Add ice to make it cold.' }, tops(['ice']))
      ]
    };
    // a job with nothing left to do ("no ice" for a Milo whose only topping is ice) is skipped
    return (R[id] || []).filter((s) => s && !(s.k === 'pick' && !s.need.length)).map((s) => Object.assign({ dish: id }, s));
  }
  // then the order is packed: to eat here, or to take away
  function packing(g) {
    const lv = T.level();
    const drinks = g.order.filter((id) => DRINK[id]), foods = g.order.filter((id) => !DRINK[id]);
    const extras = [].concat(foods.length ? ['spoon', 'fork'] : [], drinks.length ? ['straw'] : []);
    if (g.where === 'here') {
      return [
        { k: 'pick', kind: 'tray', items: g.order.slice(), need: g.order.slice(), title: 'Put it on the tray', say: 'Put the food on the tray.' },
        lv >= 2 && { k: 'pick', kind: 'extras', items: extras, need: extras, title: foods.length ? 'Add a spoon and fork' : 'Add a straw', say: foods.length ? 'Add a spoon and a fork.' : 'Add a straw.' }
      ].filter(Boolean);
    }
    const away = [].concat(foods.length ? ['spoon'] : [], g.order.includes('chickenrice') && g.no !== 'chilli' ? ['packet'] : [], drinks.length ? ['straw'] : []);
    return [
      { k: 'pick', kind: 'box', items: g.order.slice(), need: g.order.slice(), title: drinks.length && !foods.length ? 'Pour it into the cup' : 'Pack the food', say: drinks.length && !foods.length ? 'Pour it into the takeaway cup.' : 'Pack the food into the takeaway box.' },
      lv >= 2 && { k: 'pick', kind: 'lid', items: g.order.slice(), need: g.order.slice(), title: 'Close the lid', say: 'Close the lid.' },
      lv >= 2 && { k: 'pick', kind: 'extras', items: away, need: away, title: away.length > 1 ? 'Add a spoon and sauce' : `Add a ${itemName(away[0]).toLowerCase()}`, say: 'Add what they need.' },
      { k: 'taps', src: 'bag', n: lv === 1 ? 1 : 2, title: lv === 1 ? 'Put it in the bag' : 'Bag it and tie it', say: lv === 1 ? 'Put it in the bag.' : 'Put it in the bag. Then tie the bag.' }
    ].filter(Boolean);
  }
  if (A.KITCHEN) Object.assign(A.KITCHEN.VEG, {
    cucumber: { name: 'cucumber', c: '#CFE8B0', d: '#4F8A3F' },
    choysum: { name: 'vegetables', c: '#9CCB6B', d: '#4F8A3F' },
    prata: { name: 'prata', c: '#F2BE68', d: '#C9853A' }
  });
  const cookStep = (g) => (g.cook && g.cook.steps[g.cook.si]) || null;
  // a bank card with a chip and a tap sign, and the card reader at the stall
  const CARD_ART = sv('0 0 48 48', `<ellipse cx="24" cy="41" rx="18" ry="2.4" fill="#6B4A3A" opacity=".14"/><rect x="3" y="9" width="42" height="29" rx="5" fill="#7E64C8" ${K}/><path d="M3 30c12-6 26-8 42-4v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#9B87D9"/>
    <rect x="8" y="15" width="10" height="8" rx="2" fill="#FFD23F" stroke="#C99A1E" stroke-width="1"/><path d="M8 19h10M13 15v8" stroke="#C99A1E" stroke-width=".9"/><path d="M33 14.6a6 6 0 0 1 0 8.8M36 12.4a9 9 0 0 1 0 13.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M8 31h4M14 31h4M20 31h4M26 31h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".9"/><path d="M38 33.4l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill="#FFD23F"/>`);
  const READER_ART = sv('0 0 48 48', `<ellipse cx="24" cy="46" rx="13" ry="1.8" fill="#6B4A3A" opacity=".16"/><rect x="10" y="3" width="28" height="42" rx="6" fill="#4E5D6C" ${K}/><rect x="13.4" y="7" width="21.2" height="13" rx="2.4" fill="#BFE6C8"/><text x="24" y="17.6" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="10" fill="#2F6E3C">$</text>
    <path d="M19.6 29.4q4.4-4.4 8.8 0M17 26.6q7-7 14 0M22.4 32q1.6-1.6 3.2 0" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>${[0, 1, 2].map((i) => `<rect x="${15 + i * 6.6}" y="37" width="4.6" height="3.4" rx="1.2" fill="#8FA0B0"/>`).join('')}<circle cx="35" cy="5.6" r="1.2" fill="#7BE08E"/>`);
  const coinArt = (v) => sv('0 0 48 48', `<circle cx="24" cy="24" r="19" fill="${v === 2 ? '#E8C25A' : '#D8DEE5'}" ${K}/><circle cx="24" cy="24" r="14" fill="none" stroke="${v === 2 ? '#C79A2E' : '#A9B3BE'}" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-size="19" font-weight="800" fill="#3B2F2F" font-family="Nunito, ui-rounded, sans-serif">$${v}</text>`);
  // the child is the uncle first (that is the fun part), then the customer, and so on
  const customer = (g) => (g.round % 2 === 0 ? 'other' : 'child');
  const uncle = (g) => otherOf(customer(g));
  const hkTotal = (g) => g.order.reduce((s, id) => s + dish(id).price, 0);
  const hkPaid = (g) => g.coins.reduce((s, v) => s + v, 0);
  const orderLine = (g) => (g.order.length === 1 ? `One ${lc(dish(g.order[0]).name)}, please!` : `One ${lc(dish(g.order[0]).name)} and one ${lc(dish(g.order[1]).name)}, please!`);
  const noLine = (id) => `No ${itemName(NO[id]).toLowerCase()}, please.`;
  const canAsk = (g) => T.level() >= 2 && g.order.some((id) => NO[id] && recipe(id, T.level(), null).some((s) => s.k === 'pick' && s.items.includes(NO[id])));
  function hkRound(g) {
    g.phase = 'order';
    g.order = [];
    g.coins = [];
    g.bubble = null;
    g.where = null;
    g.no = null;
    g.cook = null;
    g.made = {};
    g.pack = { tray: [], box: [], lid: [], extras: [], bag: 0 };
    g.need = T.level() === 3 ? 2 : 1;
    T.setTurn(g, customer(g));
  }
  function hkOrder(g, id) {
    if (g.order.includes(id) || g.phase !== 'order') return;
    g.order.push(id);
    T.tone(600 + g.order.length * 80, 0.15, 0.06);
    if (g.order.length < g.need) { T.render(); T.say(dish(id).name + '. And one more?'); return; }
    g.bubble = { who: customer(g), text: orderLine(g) };
    g.phase = 'where';
    T.render();
    T.say(orderLine(g));
    // a hawker always asks: Lumi asks by itself; a child or grown-up uncle taps the question
    T.later(() => {
      if (T.cur() !== g || g.phase !== 'where') return;
      if (g.solo && uncle(g) === 'other') hkAsk(g, 'where');
      else T.setTurn(g, uncle(g), 'Ask the customer: eat here or take away?');
    }, 1500);
  }
  const ASK = { where: 'Eat here or take away?', extra: 'Anything else?' };
  function hkAsk(g, which) {
    if (g.phase !== which || (g.bubble && g.bubble.who === uncle(g))) return;
    g.bubble = { who: uncle(g), text: ASK[which] };
    T.tone(660, 0.12, 0.05);
    T.setTurn(g, customer(g), ASK[which]);
  }
  function hkWhere(g, v) {
    if (g.phase !== 'where' || !g.bubble || g.bubble.who !== uncle(g)) return;
    g.where = v;
    g.bubble = { who: customer(g), text: v === 'here' ? 'Eat here.' : 'Take away, please.' };
    T.tone(700, 0.15, 0.06);
    T.render();
    T.say(g.bubble.text);
    if (canAsk(g)) {
      g.phase = 'extra';
      T.later(() => {
        if (T.cur() !== g || g.phase !== 'extra') return;
        if (g.solo && uncle(g) === 'other') hkAsk(g, 'extra');
        else T.setTurn(g, uncle(g), 'Ask the customer: anything else?');
      }, 1300);
      return;
    }
    T.later(() => { if (T.cur() === g) startCook(g); }, 1300);
  }
  function hkExtra(g, v) {
    if (g.phase !== 'extra' || !g.bubble || g.bubble.who !== uncle(g)) return;
    const id = g.order.find((x) => NO[x] === v);
    g.no = id ? v : null;
    g.bubble = { who: customer(g), text: id ? noLine(id) : "That's all, thank you." };
    g.phase = 'cookwait';
    T.render();
    T.say(g.bubble.text);
    T.later(() => { if (T.cur() === g) startCook(g); }, 1400);
  }
  function startCook(g) {
    const lv = T.level();
    const steps = [].concat(...g.order.map((id) => recipe(id, lv, g.no)), packing(g));
    g.cook = { steps, si: 0, p: 0, taps: 0, cut: [], picked: [], n: { 1: 2, 2: 3, 3: 4 }[lv] || 3, busy: false };
    g.made = {};
    g.order.forEach((id) => { g.made[id] = {}; });
    g.phase = 'cook';
    g.bubble = { who: uncle(g), text: g.where === 'here' ? 'OK! Coming up.' : 'OK! Take away.' };
    T.setTurn(g, uncle(g), `Time to cook! ${steps[0].say}`);
  }
  // one job is done: show it, then the next job
  function stepDone(g) {
    const c = g.cook;
    const st = cookStep(g);
    if (!st || c.busy) return;
    c.busy = true;
    if (st.layer && st.k === 'chop') g.made[st.dish][st.layer] = true;
    T.cheer();
    T.render();
    T.later(() => {
      if (T.cur() !== g || g.phase !== 'cook') return;
      c.si += 1; c.p = 0; c.taps = 0; c.cut = []; c.picked = []; c.busy = false;
      const nx = cookStep(g);
      if (!nx) { hkReady(g); return; }
      T.render();
      T.say(nx.say);
      if (g.solo && g.turn === 'other') lumiWork(g);
    }, 900);
  }
  function hkReady(g) {
    g.phase = 'pay';
    g.bubble = { who: uncle(g), text: T.level() === 3 ? `Here you go! That's $${hkTotal(g)}.` : 'Here you go!' };
    T.render();
    T.say(g.bubble.text);
    T.later(() => { if (T.cur() === g) T.setTurn(g, customer(g)); }, 1500);
  }
  function hkTap(g) {
    const c = g.cook, st = cookStep(g);
    if (g.phase !== 'cook' || !st || st.k !== 'taps' || c.busy || c.taps >= st.n) return;
    c.taps += 1;
    if (st.layer) g.made[st.dish][st.layer] = c.taps / st.n;
    if (st.src === 'bag') g.pack.bag = c.taps;
    T.tone(500 + c.taps * 90, 0.12, 0.06);
    if (c.taps >= st.n) { stepDone(g); return; }
    T.render();
    if (st.src === 'bag') T.say('Now tie the bag.');
  }
  function hkRub(g, dp) {
    const c = g.cook, st = cookStep(g);
    if (g.phase !== 'cook' || !st || st.k !== 'rub' || c.busy) return false;
    c.p = Math.min(1, c.p + dp);
    if (st.layer) g.made[st.dish][st.layer] = c.p;
    if (c.p >= 1) { if (st.layer) g.made[st.dish][st.layer] = true; stepDone(g); return true; }
    return false;
  }
  function hkCut(g, i) {
    const c = g.cook, st = cookStep(g);
    if (g.phase !== 'cook' || !st || st.k !== 'chop' || c.busy || c.cut.includes(i)) return;
    c.cut.push(i);
    T.tone(300 + c.cut.length * 40, 0.08, 0.1);
    if (c.cut.length >= c.n) stepDone(g);
  }
  function hkPick(g, item, el) {
    const c = g.cook, st = cookStep(g);
    if (g.phase !== 'cook' || !st || st.k !== 'pick' || c.busy || c.picked.includes(item)) return;
    if (!st.need.includes(item)) {
      // the customer asked for it to be left out
      T.nope(el);
      T.say(`The customer said: no ${itemName(item).toLowerCase()}.`);
      return;
    }
    c.picked.push(item);
    if (st.kind === 'top') g.made[st.dish][item] = true;
    else g.pack[st.kind].push(item);
    T.tone(620 + c.picked.length * 70, 0.12, 0.06);
    if (st.need.every((x) => c.picked.includes(x))) { stepDone(g); return; }
    T.render();
  }
  // Lumi does each job in turn when Lumi is the uncle
  function lumiWork(g) {
    const n = (g.workN = (g.workN || 0) + 1);
    const work = () => {
      if (T.cur() !== g || g.phase !== 'cook' || g.workN !== n || g.turn !== 'other') return;
      const c = g.cook, st = cookStep(g);
      if (!st || c.busy) return; // stepDone starts the next job
      if (st.k === 'chop') { const i = [...Array(c.n).keys()].find((k) => !c.cut.includes(k)); if (i != null) hkCut(g, i); if (!c.busy) T.render(); }
      else if (st.k === 'rub') { if (!hkRub(g, 0.25)) T.render(); }
      else if (st.k === 'taps') hkTap(g);
      else if (st.k === 'pick') { const it = st.need.find((x) => !c.picked.includes(x)); if (it) hkPick(g, it); }
      if (!c.busy) T.later(work, 650);
    };
    T.later(work, 800);
  }
  function hkPaidDone(g) {
    if (g.phase !== 'pay') return;
    g.phase = 'thanks';
    g.bubble = { who: uncle(g), text: 'Paid! Thank you.' };
    T.tone(1046, 0.2, 0.07);
    T.render();
    T.later(() => { if (T.cur() === g) T.setTurn(g, customer(g), 'Now say thank you!'); }, 900);
  }
  function hkCoin(g, v, el) {
    const total = hkTotal(g);
    if (hkPaid(g) + v > total) { T.nope(el); T.say(`Too much! We need $${total}. Try a smaller coin.`); return; }
    g.coins.push(v);
    T.tone(880, 0.12, 0.06);
    if (hkPaid(g) === total) { hkPaidDone(g); return; }
    T.render();
  }
  function hkThanks(g, w) {
    if (g.phase !== 'thanks') return;
    if (w !== 'thanks') { T.say(w === 'yummy' ? 'Yummy!' : 'Bye-bye!'); T.later(() => { if (T.cur() === g) T.say('And say thank you.'); }, 900); return; }
    g.phase = 'bye';
    g.bubble = { who: customer(g), text: 'Thank you!' };
    T.render();
    T.say('Thank you!');
    T.later(() => {
      if (T.cur() !== g) return;
      g.bubble = { who: uncle(g), text: g.where === 'away' ? 'Welcome! Come again!' : "You're welcome. Enjoy!" };
      g.round += 1;
      T.render();
      T.say(g.bubble.text);
      T.later(() => {
        if (T.cur() !== g) return;
        if (g.round >= g.total) { T.win(g, { text: 'Yummy teamwork!', sub: 'You cooked, packed and served like a real hawker.', say: 'Well done! You were a great uncle and a great customer.' }); return; }
        hkRound(g);
      }, 1600);
    }, 1100);
  }
  const roleName = (g, who) => (who === customer(g) ? 'Customer' : 'Uncle');
  A.hawkerTest = { startCook, recipe, ITEMS, dishSvg, packSvg, BAG, SRC, TOOLS, rubSvg }; // for the automatic checks

  // ---------------------------------------------------------------- drawing the stall
  function ticketHtml(g, mini) {
    const st = cookStep(g);
    const shown = st && st.dish ? st.dish : null;
    return `<div class="hk-ticket2">
      <div class="hk-tk-top">${ic('journal', 24)}<b>Order</b>${g.where ? `<span class="hk-tag ${g.where}">${g.where === 'here' ? ic('cutlery', 20) : `<span class="hk-tagic">${BAGSRC}</span>`}<span>${g.where === 'here' ? 'Eat here' : 'Take away'}</span></span>` : ''}</div>
      <div class="hk-tk-list">${g.order.map((id) => `<span class="hk-tk-line ${shown === id ? 'on' : ''}">${mini ? `<span class="hk-tk-pic">${dish(id).art()}</span>` : ''}<span>${esc(dish(id).name)}</span></span>`).join('')}</div>
      ${g.no ? `<span class="hk-tk-no">${ic('x', 18)}<span>No ${esc(itemName(g.no).toLowerCase())}</span></span>` : ''}
    </div>`;
  }
  function stepsHtml(g) {
    const c = g.cook;
    return `<div class="hk-prog" role="img" aria-label="Job ${c.si + 1} of ${c.steps.length}">${c.steps.map((s, i) => `<i class="${i < c.si || (i === c.si && c.busy) ? 'done' : i === c.si ? 'on' : ''}"></i>`).join('')}</div>`;
  }
  function stationHtml(g) {
    const c = g.cook;
    const st = cookStep(g);
    const mine = !(g.solo && g.turn === 'other');
    if (!st) return '';
    const head = `<div class="hk-job"><b>${esc(st.title)}</b>${stepsHtml(g)}</div>`;
    if (st.k === 'chop') {
      const K2 = A.KITCHEN;
      return `${head}<div class="hk-cook hk-chop">${K2.chopHtml(st.item, c.n, c.cut)}</div>`;
    }
    if (st.k === 'rub') {
      return `${head}<div class="hk-station"><div class="hk-rubbox ${mine ? '' : 'lumi'}" data-look="${st.look}" role="button" tabindex="0" aria-label="${esc(st.title)}. Rub or tap.">
          <span class="hk-rubart">${rubSvg(st.look, c.p)}</span><span class="hk-tool ${RUB_TOOL[st.look] || 'spoon'}" aria-hidden="true">${TOOLS[RUB_TOOL[st.look]] || TOOLS.spoon}</span></div>
        <div class="hk-side">${st.dish ? `<span class="hk-view">${dishSvg(st.dish, g.made[st.dish])}</span>` : ''}${A.KITCHEN.bar(c.p)}<span class="hk-hint">${ic('hand', 22)}<span>Rub round and round, or tap</span></span></div></div>`;
    }
    if (st.k === 'taps') {
      const [name, art] = SRC[st.src];
      const dots = `<span class="hk-dots">${[...Array(st.n).keys()].map((i) => `<i class="${i < c.taps ? 'on' : ''}"></i>`).join('')}</span>`;
      const view = st.src === 'bag' ? packView(g, 'bag') : `<span class="hk-view">${dishSvg(st.dish, g.made[st.dish])}</span>`;
      return `${head}<div class="hk-station"><button class="hk-src" data-a="tg" data-k="tap" aria-label="${esc(name)}"><span class="hk-src-art">${art}</span><span class="hk-src-name">${esc(name)}</span>${dots}</button>
        <span class="hk-arrow2">${ic('arrow', 40)}</span>${view}</div>`;
    }
    // pick: tap each thing
    const items = st.items.map((it) => {
      const done = c.picked.includes(it);
      const no = !st.need.includes(it);
      const art = st.kind === 'tray' || st.kind === 'box' ? dishSvg(it, g.made[it]) : st.kind === 'lid' ? packSvg(it, false) : ITEMS[it].art;
      const name = st.kind === 'tray' || st.kind === 'box' || st.kind === 'lid' ? dish(it).name : itemName(it);
      return `<button class="hk-pick ${done ? 'done' : ''} ${no ? 'no' : ''}" data-a="tg" data-k="pick" data-v="${it}" aria-label="${esc(name)}${no ? ', the customer said no' : ''}" ${done ? 'disabled' : ''}>
        <span class="hk-pick-art">${art}</span><span class="hk-pick-name">${esc(name)}</span>${done ? `<span class="hk-pick-ok">${ic('check', 20)}</span>` : ''}${no ? `<span class="hk-pick-no">${ic('x', 22)}</span>` : ''}</button>`;
    }).join('');
    const view = st.kind === 'top' ? `<span class="hk-view">${dishSvg(st.dish, g.made[st.dish])}</span>` : packView(g, st.kind);
    return `${head}<div class="hk-station"><div class="hk-picks n${st.items.length}">${items}</div><span class="hk-arrow2">${ic('arrow', 40)}</span>${view}</div>`;
  }
  // the order being packed: on the tray, or in boxes (and then the bag)
  function packView(g, kind) {
    const P = g.pack;
    if (g.where === 'here') {
      const on = P.tray.map((id) => `<span class="hk-onTray">${dishSvg(id, g.made[id])}</span>`).join('');
      const ex = P.extras.map((x) => `<span class="hk-ex">${ITEMS[x].art}</span>`).join('');
      return `<div class="hk-traybox n${P.tray.length}">${on || '<span class="hk-empty">Tray</span>'}<span class="hk-exrow">${ex}</span></div>`;
    }
    const boxes = P.box.map((id) => `<span class="hk-box">${packSvg(id, P.lid.includes(id))}</span>`).join('');
    const ex = P.extras.map((x) => `<span class="hk-ex">${ITEMS[x].art}</span>`).join('');
    const inside = `<span class="hk-bagin">${boxes || '<span class="hk-empty">Takeaway</span>'}<span class="hk-exrow">${ex}</span></span>`;
    if (kind === 'bag' || P.bag > 0) return BAG(P.bag >= 2 || (T.level() === 1 && P.bag >= 1), inside);
    return `<div class="hk-packarea">${inside}</div>`;
  }
  T.register({
    id: 'hawker', name: 'Hawker uncle', icon: 'sNoodles', tint: '#FCE6D6', ink: '#B4572E', kind: 'Pretend play', sub: 'Cook, pack and serve at a food stall',
    ages: ['primary'], skill: 'social',
    init(g) {
      g.total = T.level() === 1 ? 2 : 3;
      g.phase = 'order'; g.order = []; g.coins = []; g.bubble = null; g.need = T.level() === 3 ? 2 : 1;
      g.where = null; g.no = null; g.cook = null; g.made = {}; g.pack = { tray: [], box: [], lid: [], extras: [], bag: 0 };
      g.turn = customer(g);
    },
    voice(g) {
      const c = customer(g);
      const you = (who) => (who === 'child' ? 'You are' : `${nm(who)} is`);
      if (g.phase === 'order') return c === 'child' ? `You are the customer. What would you like? Pick ${g.need > 1 ? 'two things' : 'from the menu'}.` : (T.solo() ? 'You are the hawker uncle! Lumi is the customer. Lumi is choosing.' : `${nm(c)} is the customer. What would you like?`);
      if ((g.phase === 'where' || g.phase === 'extra') && g.turn !== c) return `${you(g.turn)} the uncle. Ask the customer: ${lc(ASK[g.phase])}`;
      if (g.phase === 'where') return c === 'child' ? 'Eat here or take away? Tap one.' : `${you(c)} the customer.`;
      if (g.phase === 'extra') return c === 'child' ? 'Anything else? You can ask for no chilli, or say that is all.' : `${you(c)} the customer.`;
      if (g.phase === 'cook') { const st = cookStep(g); return st ? `${you(g.turn)} the uncle. ${st.say}` : `${you(g.turn)} the uncle.`; }
      if (g.phase === 'pay') return T.level() === 3 ? `That's $${hkTotal(g)}. Pay with the coins.` : 'Pay with the card. Tap the card.';
      if (g.phase === 'thanks') return 'Say thank you!';
      return '';
    },
    stage(g) {
      const c = customer(g), u = uncle(g);
      const person = (who, side) => `<div class="hk-person ${side} ${g.turn === who ? 'on' : ''}">
          ${g.bubble && g.bubble.who === who ? `<div class="tg-say hk-bubble">${esc(g.bubble.text)}</div>` : ''}
          ${T.avatar(who, g.phase === 'cook' ? 80 : 100)}<span class="hk-role">${roleName(g, who)}</span><span class="hk-name">${esc(nm(who))}</span></div>`;
      let mid = '';
      if (g.phase === 'order') {
        mid = `<div class="hk-board"><div class="hk-board-title">Menu</div><div class="hk-menu">${DISHES.map((d) => `<button class="hk-dish ${g.order.includes(d.id) ? 'on' : ''}" data-a="tg" data-k="order" data-v="${d.id}">
            <span class="hk-art">${d.art()}</span><b>${d.name}</b>${T.level() === 3 ? `<span class="hk-price">$${d.price}</span>` : ''}</button>`).join('')}</div></div>`;
      } else if (g.phase === 'where' || g.phase === 'extra' || g.phase === 'cookwait') {
        const asked = g.bubble && g.bubble.who === uncle(g);
        let opts = '';
        if ((g.phase === 'where' || g.phase === 'extra') && !asked && g.turn === uncle(g) && !(g.solo && g.turn === 'other') && g.bubble && g.bubble.who === customer(g)) {
          opts = `<button class="hk-ask" data-a="tg" data-k="ask" data-v="${g.phase}">${ic('kTalk', 40)}<span>${esc(ASK[g.phase])}</span></button>`;
        }
        if (g.phase === 'where' && asked) opts = `<div class="hk-choose">${[['here', 'Eat here', 'cutlery'], ['away', 'Take away', 'bag']].map(([v, l, i]) => `<button class="hk-opt" data-a="tg" data-k="where" data-v="${v}">${v === 'away' ? `<span class="hk-optic">${BAGSRC}</span>` : ic(i, 54)}<span>${l}</span>${v === 'away' ? '<small>"Dabao"</small>' : ''}</button>`).join('')}</div>`;
        if (g.phase === 'extra' && asked) {
          const asks = g.order.filter((id) => NO[id] && recipe(id, T.level(), null).some((s) => s.k === 'pick' && s.items.includes(NO[id])));
          opts = `<div class="hk-choose">${asks.map((id) => `<button class="hk-opt" data-a="tg" data-k="extra" data-v="${NO[id]}"><span class="hk-opt-art">${ITEMS[NO[id]].art}<i>${ic('x', 30)}</i></span><span>No ${esc(itemName(NO[id]).toLowerCase())}</span></button>`).join('')}<button class="hk-opt" data-a="tg" data-k="extra" data-v="none">${ic('check', 54)}<span>That's all</span></button></div>`;
        }
        mid = `${ticketHtml(g, true)}${opts}`;
      } else if (g.phase === 'cook') {
        mid = `<div class="hk-kitchen">${ticketHtml(g, false)}${stationHtml(g)}</div>`;
      } else {
        const done = `<div class="hk-done">${packView(g, g.where === 'away' ? 'bag' : 'tray')}</div>`;
        let pay = '';
        if (g.phase === 'pay') {
          pay = T.level() === 3
            ? `<div class="hk-pay"><span class="hk-total">$${hkTotal(g)}</span><div class="hk-coins">${[1, 2, 1, 2].map((v) => `<button class="hk-coin" data-a="tg" data-k="coin" data-v="${v}" aria-label="$${v} coin">${coinArt(v)}</button>`).join('')}</div>
                <div class="hk-coin-tray">${g.coins.map((v) => `<span class="hk-coin small">${coinArt(v)}</span>`).join('')}<span class="hk-paid">$${hkPaid(g)} of $${hkTotal(g)}</span></div></div>`
            : `<div class="hk-pay row"><button class="hk-card" data-a="tg" data-k="card" aria-label="Pay with the card">${CARD_ART}</button><span class="hk-arrow">${ic('arrow', 40)}</span><span class="hk-reader">${READER_ART}</span></div>`;
        } else {
          pay = `<div class="tg-talk hk-talk">${[['thanks', 'Thank you', 'kHeart'], ['yummy', 'Yummy!', 'smile'], ['bye', 'Bye-bye', 'come']].map(([k, label, icon]) => `<button class="tg-word" data-a="tg" data-k="word" data-v="${k}" ${g.phase === 'bye' ? 'disabled' : ''}>${ic(icon, 46)}<span>${label}</span></button>`).join('')}</div>`;
        }
        mid = `<div class="hk-endrow">${done}${pay}</div>`;
      }
      return `<div class="hk-awning"><span class="hk-sign">${ic('cutlery', 32)}<span>Lumi's Food Stall</span></span></div>
        <div class="hk-row ${g.phase === 'cook' ? 'cooking' : ''}">${person(c, 'left')}<div class="hk-mid">${mid}</div>${person(u, 'right')}</div>`;
    },
    after(g, box) {
      if (!box || g.phase !== 'cook' || g.turn !== uncle(g) || (g.solo && g.turn !== 'child')) return; // only the uncle cooks
      const c = g.cook, st = cookStep(g);
      if (!st || c.busy) return;
      if (st.k === 'chop') A.KITCHEN.chopWire(box, (i) => hkCut(g, i));
      if (st.k === 'rub') {
        const el = box.querySelector('.hk-rubbox');
        if (!el) return;
        const art = el.querySelector('.hk-rubart'), tool = el.querySelector('.hk-tool');
        const meter = box.querySelector('.ev-meter i'), view = box.querySelector('.hk-side .hk-view');
        const scale = () => (A.stageScale ? A.stageScale() : 1);
        let last = null;
        const show = (e) => {
          if (art) art.innerHTML = rubSvg(st.look, c.p);
          if (meter) meter.style.width = Math.round(c.p * 100) + '%';
          if (view) view.innerHTML = dishSvg(st.dish, g.made[st.dish]);
          if (tool && e) { const r = el.getBoundingClientRect(); tool.style.left = ((e.clientX - r.left) / r.width) * 100 + '%'; tool.style.top = ((e.clientY - r.top) / r.height) * 100 + '%'; }
        };
        const step = (dp, e) => { if (hkRub(g, dp)) return; show(e); };
        el.addEventListener('pointerdown', (e) => { last = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } step(0.1, e); });
        el.addEventListener('pointermove', (e) => { if (!last) return; const d = Math.hypot(e.clientX - last.x, e.clientY - last.y) / scale(); last = { x: e.clientX, y: e.clientY }; if (d > 0) step(d / 1300, e); });
        const end = () => { last = null; };
        el.addEventListener('pointerup', end);
        el.addEventListener('pointercancel', end);
        // keyboard and switch: Enter or Space is a good rub
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step(0.2); } });
        el.addEventListener('click', (e) => { if (e.detail === 0) step(0.2); });
      }
    },
    guide(g) {
      const c = customer(g);
      if (g.phase === 'order') return { sel: '.hk-dish:not(.on)', say: 'Pick from the menu.' };
      if ((g.phase === 'where' || g.phase === 'extra') && g.turn !== c) return { sel: '.hk-ask', say: 'Ask the customer.' };
      if (g.phase === 'where' && g.turn === c) return { sel: '.hk-opt', say: 'Eat here or take away?' };
      if (g.phase === 'extra' && g.turn === c) return { sel: '.hk-opt', say: 'Anything else?' };
      if (g.phase === 'cook') {
        const st = cookStep(g);
        if (!st || g.cook.busy) return null;
        if (st.k === 'chop') return { sel: '.ck-cut:not(.done)', say: 'Slice along the dotted line.' };
        if (st.k === 'rub') return { sel: '.hk-rubbox', say: 'Rub round and round.' };
        if (st.k === 'taps') return { sel: '.hk-src', say: st.say };
        return { sel: '.hk-pick:not(.done):not(.no)', say: st.say };
      }
      if (g.phase === 'pay') return T.level() === 3 ? { sel: '.hk-coin', say: 'Tap the coins to pay.' } : { sel: '.hk-card', say: 'Tap the card.' };
      if (g.phase === 'thanks') return { sel: '[data-k="word"][data-v="thanks"]', say: 'Say thank you.' };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'order' && g.turn === customer(g)) hkOrder(g, d.v);
      else if (k === 'where' && g.turn === customer(g)) hkWhere(g, d.v);
      else if (k === 'extra' && g.turn === customer(g)) hkExtra(g, d.v);
      else if (k === 'ask' && g.turn === uncle(g)) hkAsk(g, d.v);
      else if (k === 'tap' && g.turn === uncle(g)) hkTap(g);
      else if (k === 'pick' && g.turn === uncle(g)) hkPick(g, d.v, el);
      else if (k === 'card' && g.turn === customer(g)) hkPaidDone(g);
      else if (k === 'coin' && g.phase === 'pay' && g.turn === customer(g)) hkCoin(g, Number(d.v), el);
      else if (k === 'word' && g.turn === customer(g)) hkThanks(g, d.v);
    },
    lumiTurn(g) {
      if (g.phase === 'order' && g.order.length < g.need) {
        const pickOne = () => { const left = DISHES.filter((d) => !g.order.includes(d.id)); hkOrder(g, rnd(left).id); };
        pickOne();
        if (g.need > 1) T.later(() => { if (T.cur() === g && g.phase === 'order') pickOne(); }, 1100);
      } else if (g.phase === 'where') {
        T.later(() => { if (T.cur() === g) hkWhere(g, Math.random() < 0.5 ? 'here' : 'away'); }, 600);
      } else if (g.phase === 'extra') {
        const asks = g.order.filter((id) => NO[id] && recipe(id, T.level(), null).some((s) => s.k === 'pick' && s.items.includes(NO[id])));
        T.later(() => { if (T.cur() === g) hkExtra(g, Math.random() < 0.6 && asks.length ? NO[asks[0]] : 'none'); }, 600);
      } else if (g.phase === 'cook') {
        lumiWork(g);
      } else if (g.phase === 'pay') {
        if (T.level() !== 3) { hkPaidDone(g); return; }
        const step = () => { if (T.cur() !== g || g.phase !== 'pay') return; const left = hkTotal(g) - hkPaid(g); hkCoin(g, left >= 2 ? 2 : 1); if (g.phase === 'pay') T.later(step, 700); };
        step();
      } else if (g.phase === 'thanks') {
        hkThanks(g, 'thanks');
      }
    }
  });

  // ================================================================ 2. I spy
  const KIND = { food: 'you can eat', drink: 'you can drink', toy: 'you play with', clothes: 'you can wear', vehicle: 'you can ride in', plant: 'that grows', school: 'you use at school', rain: 'you use when it rains', sky: 'you see in the sky', music: 'that makes a sound', animal: 'that is an animal', read: 'you can read' };
  const OBJ = [
    { id: 'apple', icon: 'apple', name: 'apple', colour: 'red', kind: 'food' },
    { id: 'balloon', icon: 'kBalloon', name: 'balloon', colour: 'red', kind: 'toy' },
    { id: 'bag', icon: 'bag', name: 'school bag', colour: 'red', kind: 'school' },
    { id: 'umbrella', icon: 'umbrella', name: 'umbrella', colour: 'pink', kind: 'rain' },
    { id: 'shoes', icon: 'shoes', name: 'shoe', colour: 'blue', kind: 'clothes' },
    { id: 'shirt', icon: 'sShirt', name: 'T-shirt', colour: 'blue', kind: 'clothes' },
    { id: 'cap', icon: 'cap2', name: 'cap', colour: 'green', kind: 'clothes' },
    { id: 'bottle', icon: 'bottle', name: 'water bottle', colour: 'blue', kind: 'drink' },
    { id: 'juice', icon: 'drink', name: 'cup of juice', colour: 'orange', kind: 'drink' },
    { id: 'bus', icon: 'bus', name: 'bus', colour: 'yellow', kind: 'vehicle' },
    { id: 'train', icon: 'sTrain', name: 'train', colour: 'white', kind: 'vehicle' },
    { id: 'tree', icon: 'sTree', name: 'tree', colour: 'green', kind: 'plant' },
    { id: 'plant', icon: 'rPlant', name: 'plant in a pot', colour: 'green', kind: 'plant' },
    { id: 'sun', icon: 'sSun', name: 'sun', colour: 'yellow', kind: 'sky' },
    { id: 'bell', icon: 'kBell', name: 'bell', colour: 'yellow', kind: 'music' },
    { id: 'notes', icon: 'music', name: 'music notes', colour: 'purple', kind: 'music' },
    { id: 'cookie', icon: 'snack', name: 'cookie', colour: 'brown', kind: 'food' },
    { id: 'dog', icon: 'kPet', name: 'dog', colour: 'brown', kind: 'animal' },
    { id: 'book', icon: 'sBook', name: 'book', colour: 'purple', kind: 'read' },
    { id: 'pencil', icon: 'sPencil', name: 'notebook', colour: 'yellow', kind: 'school' }
  ];
  const obj = (id) => OBJ.find((o) => o.id === id);
  // spots in the picture (percent of the scene), kept clear of the turn chip at the top left
  // everything stands on the ground (the lower part of each picture); only the sun is up in the sky
  // rows of places on the ground of each picture (the platform starts lower at the MRT station)
  const ROWS = { park: [58, 72, 86], kitchen: [61, 74, 87], mrt: [72, 81, 90] };
  const spotsFor = (scene) => [].concat(...(ROWS[scene] || ROWS.park).map((y, r) => [0, 1, 2, 3, 4, 5].map((c) => [9 + c * 16.4 + (r % 2 ? 7 : 0) - (c === 5 && r % 2 ? 9 : 0), y + (c % 2 ? -1.5 : 1.5)])));
  const SKY = [88, 13.5]; // right on top of the sun in the park picture
  // things that only make sense in some places: no sun or trees indoors, no bus in a kitchen
  const ONLY = { sun: ['park'], tree: ['park'], bus: ['park'], train: ['park', 'mrt'] };
  const fitsScene = (o, scene) => !ONLY[o.id] || ONLY[o.id].includes(scene);
  const SCENES = {
    park: '<rect width="1000" height="520" fill="#DCEEF7"/><circle cx="880" cy="70" r="44" fill="#FBE7A1"/><rect y="250" width="1000" height="270" fill="#A9D68E"/><path d="M0 250 Q500 220 1000 250" fill="#B9DE9F"/><path d="M380 520 Q470 380 620 250 L700 250 Q560 400 520 520z" fill="#F0DDBB"/>',
    kitchen: '<rect width="1000" height="520" fill="#FFF3D9"/><g stroke="#F3E2BE" stroke-width="2">' + Array.from({ length: 12 }, (_, i) => `<path d="M${i * 90} 0v300"/>`).join('') + Array.from({ length: 4 }, (_, i) => `<path d="M0 ${i * 80}h1000"/>`).join('') + '</g><rect y="300" width="1000" height="40" fill="#D9A27E"/><rect y="340" width="1000" height="180" fill="#F2D5B8"/>',
    mrt: '<rect width="1000" height="520" fill="#E5EDF3"/><rect width="1000" height="60" fill="#CCD8E2"/><rect y="330" width="1000" height="18" fill="#FFD23F"/><rect y="348" width="1000" height="172" fill="#C3CED8"/><rect x="560" y="110" width="420" height="210" rx="26" fill="#fff" opacity=".7"/>'
  };
  const SCENE_IDS = ['park', 'kitchen', 'mrt'];
  const finder = (g) => (g.round % 2 === 0 ? 'child' : 'other');
  const giver = (g) => otherOf(finder(g));
  function clueFor(t) {
    if (T.level() === 1) return { text: `Find the ${t.name}!`, pic: true };
    if (T.level() === 2) return { text: `Find something ${KIND[t.kind]}.`, pic: false };
    return { text: `Find something ${t.colour} ${KIND[t.kind]}.`, pic: false };
  }
  // does object o also fit the clue for target t? (then the clue would not be clear)
  function fitsClue(o, t) {
    if (T.level() === 1) return o.id === t.id;
    if (T.level() === 2) return o.kind === t.kind;
    return o.kind === t.kind && o.colour === t.colour;
  }
  const sceneSize = () => ({ 1: 8, 2: 10, 3: 12 }[T.level()] || 10);
  function lay(g, ids) {
    // spread out: two things are never so close that a finger could touch both (the picture is about 1110 x 575)
    const spread = (list, n) => {
      for (let gap = 118; gap >= 60; gap -= 14) {
        const got = [];
        list.forEach((p) => { if (got.length < n && got.every((q) => Math.hypot((p[0] - q[0]) * 11.1, (p[1] - q[1]) * 5.75) >= gap)) got.push(p); });
        if (got.length >= n) return got;
      }
      return list.slice(0, n);
    };
    const spots = spread(T.shuffle(spotsFor(g.scene)), ids.length);
    g.items = T.shuffle(ids).map((id, i) => (id === 'sun' ? { id, x: SKY[0], y: SKY[1], r: 0 } : { id, x: spots[i][0], y: spots[i][1], r: Math.round(Math.random() * 10 - 5) }));
  }
  // a picture where the clue fits only the target; on Challenge add look-alikes (same colour or same kind)
  function fiScene(g, t) {
    const n = sceneSize();
    const pool = T.shuffle(OBJ.filter((o) => o.id !== t.id && !fitsClue(o, t) && fitsScene(o, g.scene)));
    let picks = pool;
    if (T.level() === 3) {
      const near = pool.filter((o) => o.colour === t.colour || o.kind === t.kind);
      picks = near.slice(0, 4).concat(pool.filter((o) => !near.slice(0, 4).includes(o)));
    }
    lay(g, picks.slice(0, n - 1).map((o) => o.id).concat(t.id));
    g.target = t.id;
    g.clue = clueFor(t);
    g.wrong = [];
  }
  function fiRound(g) {
    g.scene = SCENE_IDS[g.round % SCENE_IDS.length];
    g.wrong = []; g.found = false; g.lumiLook = null;
    if (giver(g) === 'child') {
      // the child is the clue-giver: pick a secret thing from three in the picture
      g.phase = 'secret';
      g.target = null; g.clue = null;
      const here = OBJ.filter((o) => fitsScene(o, g.scene));
      g.options = T.shuffle(here).slice(0, 3).map((o) => o.id);
      const rest = T.shuffle(here.filter((o) => !g.options.includes(o.id))).slice(0, sceneSize() - 3).map((o) => o.id);
      lay(g, g.options.concat(rest));
      T.setTurn(g, 'child', T.solo() ? 'Your turn to give a clue. Pick a secret thing for Lumi to find.' : `Your turn to give a clue. Pick a secret thing for ${nm('other')} to find.`);
    } else {
      g.phase = 'find';
      fiScene(g, rnd(OBJ.filter((o) => fitsScene(o, g.scene))));
      T.setTurn(g, 'child', T.solo() ? `Lumi says: ${g.clue.text}` : `${nm('other')}, read the clue to ${nm('child')}. ${g.clue.text}`);
    }
  }
  function fiPickSecret(g, id) {
    const t = obj(id);
    g.target = id;
    g.clue = clueFor(t);
    // swap out anything else the clue would fit, so it points to the secret thing only
    g.items.forEach((it) => {
      if (it.id !== id && fitsClue(obj(it.id), t)) {
        const sw = OBJ.find((o) => !fitsClue(o, t) && !g.items.some((x) => x.id === o.id));
        if (sw) it.id = sw.id;
      }
    });
    g.phase = 'find';
    T.cheer();
    T.setTurn(g, 'other', `${T.solo() ? 'Your clue for Lumi' : 'Your clue'}: ${g.clue.text}`);
  }
  function fiTap(g, id, el) {
    if (g.phase !== 'find' || g.found) return;
    if (id !== g.target) {
      T.nope(el);
      if (!g.wrong.includes(id)) g.wrong.push(id);
      T.say(`That's the ${obj(id).name}. Try again! ${g.clue.text}`);
      T.render();
      return;
    }
    g.found = true;
    T.cheer();
    T.say(`Yes! The ${obj(id).name}! ${g.turn === 'other' ? (T.solo() ? 'Lumi found it.' : `${nm('other')} found it.`) : 'You found it!'}`);
    g.round += 1;
    T.render();
    T.later(() => {
      if (T.cur() !== g) return;
      if (g.round >= g.total) { T.win(g, { text: 'Super finders!', say: 'Great looking and great clues!' }); return; }
      fiRound(g);
    }, 1800);
  }
  T.register({
    id: 'findit', name: 'I spy', icon: 'eye', tint: '#E3F1FB', ink: '#3D74B5', kind: 'Looking', sub: 'One gives a clue, one finds it',
    ages: ['primary'], skill: 'thinking',
    init(g) {
      g.total = 4;
      g.scene = 'park'; g.phase = 'find'; g.items = []; g.wrong = []; g.found = false; g.options = []; g.lumiLook = null;
      fiScene(g, rnd(OBJ.filter((o) => fitsScene(o, g.scene))));
      g.turn = 'child';
    },
    voice(g) {
      if (g.phase === 'secret') return 'Pick a secret thing for the other player to find.';
      if (!g.clue) return '';
      if (g.turn === 'child') return g.clue.text;
      return T.solo() ? `Lumi is looking. ${g.clue.text}` : `${nm('other')}, ${lc(g.clue.text)}`;
    },
    stage(g) {
      const bg = `<svg class="fi-bg" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">${SCENES[g.scene] || SCENES.park}</svg>`;
      const size = T.level() === 3 ? 70 : 82;
      const items = g.items.map((it) => `<button class="fi-obj ${g.wrong.includes(it.id) ? 'tried' : ''} ${g.found && it.id === g.target ? 'found' : ''} ${g.lumiLook === it.id ? 'looking' : ''}" data-a="tg" data-k="obj" data-v="${it.id}" aria-label="${esc(obj(it.id).name)}"
        style="left:${it.x}%;top:${it.y}%;--r:${it.r}deg">${ic(obj(it.id).icon, size)}</button>`).join('');
      return `${bg}<div class="fi-field">${items}</div>`;
    },
    bar(g) {
      if (g.phase === 'secret') {
        return `<div class="bar fi-bar"><span class="fi-label">${ic('kHint', 34)}<span>Pick a secret thing</span></span>
          <div class="fi-opts">${g.options.map((id) => `<button class="fi-opt" data-a="tg" data-k="secret" data-v="${id}">${ic(obj(id).icon, 52)}<span>${esc(obj(id).name)}</span></button>`).join('')}</div></div>`;
      }
      if (!g.clue) return '';
      const t = obj(g.target);
      const who = giver(g);
      return `<div class="bar fi-bar">
        <span class="fi-from">${T.avatar(who, 54)}<span>${esc(who === 'child' ? 'Your clue' : `${nm(who)}'s clue`)}</span></span>
        <div class="fi-clue">${g.clue.pic ? `<span class="fi-clue-pic">${ic(t.icon, 60)}</span>` : `<span class="fi-clue-pic">${ic('eye', 46)}</span>`}<b>${esc(g.clue.text)}</b></div>
        ${A.speakBtn(g.clue.text, 60)}
      </div>`;
    },
    guide(g) {
      if (g.phase === 'secret') return { sel: '.fi-opt', say: 'Pick a secret thing.' };
      if (g.phase === 'find' && g.target && !g.found) return { sel: `.fi-obj[data-v="${g.target}"]`, say: g.clue.text, delay: 9000 };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'secret' && g.phase === 'secret') { fiPickSecret(g, d.v); return; }
      if (k === 'obj' && g.turn === finder(g)) fiTap(g, d.v, el);
    },
    lumiTurn(g) {
      if (g.phase !== 'find' || !g.target || g.found) return;
      // Lumi looks around, sometimes tries a wrong one first (said kindly), then finds it
      const wrong = Math.random() < 0.5 && g.wrong.length === 0 ? rnd(g.items.filter((it) => it.id !== g.target)) : null;
      const look = (id, then) => { g.lumiLook = id; T.render(); T.later(() => { if (T.cur() === g) { g.lumiLook = null; then(); } }, 1000); };
      if (wrong) {
        T.say('Hmm, is it this one?');
        look(wrong.id, () => { g.wrong.push(wrong.id); T.render(); T.say(`Oops, that's the ${obj(wrong.id).name}. Let me look again.`); T.later(() => { if (T.cur() === g) look(g.target, () => fiTap(g, g.target)); }, 1500); });
      } else {
        T.say('I think I see it!');
        look(g.target, () => fiTap(g, g.target));
      }
    }
  });

  // ================================================================ 3. Music echo
  const DRUMS = [
    { c: '#EF6F5E', d: '#C94E3F', f: 262, name: 'red' },
    { c: '#FFD23F', d: '#D8A81E', f: 330, name: 'yellow' },
    { c: '#5B8FD9', d: '#3E6EB5', f: 392, name: 'blue' },
    { c: '#7BC67E', d: '#559E58', f: 523, name: 'green' }
  ];
  const drumArt = (dr) => sv('0 0 120 110', `<ellipse cx="60" cy="98" rx="48" ry="8" fill="#6B4A3A" opacity=".15"/><path d="M14 34v44c0 10 20 18 46 18s46-8 46-18V34" fill="${dr.c}" ${K}/>
    <path d="M14 50c10 6 28 9 46 9s36-3 46-9" fill="none" stroke="${dr.d}" stroke-width="3"/><path d="M26 44l12 40M50 48l6 40M74 48l-6 40M94 44l-12 40" stroke="#fff" stroke-width="2.4" opacity=".5"/>
    <ellipse cx="60" cy="34" rx="46" ry="16" fill="#FFF8EC" ${K}/><ellipse cx="60" cy="34" rx="34" ry="10" fill="none" stroke="#EADCC5" stroke-width="2"/>`);
  const lens = () => ({ 1: [2, 2, 3, 3], 2: [2, 3, 3, 4], 3: [3, 4, 4, 5] }[T.level()] || [2, 3, 3, 4]);
  const drumsNow = () => (T.level() === 3 ? 4 : 3);
  const ecLeader = (g) => (g.round % 2 === 0 ? 'other' : 'child');
  function hit(i) {
    T.tone(DRUMS[i].f, 0.32, 0.12);
    const el = A.stage.querySelector(`.ec-drum[data-v="${i}"]`);
    if (el) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
  }
  function playBack(g, pattern, done) {
    g.busy = true;
    T.render();
    pattern.forEach((i, n) => T.later(() => { if (T.cur() === g) hit(i); }, 450 + n * 650));
    T.later(() => { if (T.cur() !== g) return; g.busy = false; if (done) done(); }, 450 + pattern.length * 650 + 250);
  }
  function ecRound(g) {
    g.phase = 'lead';
    g.pattern = [];
    g.input = [];
    g.len = lens()[g.round] || 3;
    T.setTurn(g, ecLeader(g));
  }
  function ecToEcho(g) {
    g.phase = 'echo';
    g.input = [];
    g.busy = true;
    T.render();
    T.later(() => { if (T.cur() === g) { g.busy = false; T.setTurn(g, otherOf(ecLeader(g)), `Now copy it, ${otherOf(ecLeader(g)) === 'child' ? (T.state.childName || 'you') : nm('other')}!`); } }, 700);
  }
  function ecDrum(g, i, el) {
    if (g.busy) return;
    hit(i);
    if (g.phase === 'lead') {
      g.pattern.push(i);
      if (g.pattern.length >= g.len) ecToEcho(g); else T.render();
      return;
    }
    const want = g.pattern[g.input.length];
    if (i !== want) {
      T.nope(el);
      g.input = [];
      T.say('Oops! Listen again.');
      g.busy = true;
      T.later(() => { if (T.cur() === g) playBack(g, g.pattern, () => { T.render(); T.say('Your turn to copy.'); }); }, 900);
      return;
    }
    g.input.push(i);
    if (g.input.length < g.pattern.length) { T.render(); return; }
    g.round += 1;
    g.busy = true;
    T.cheer();
    T.render();
    T.say(rnd(['You copied it!', 'Perfect echo!', 'Great listening!']));
    T.later(() => {
      if (T.cur() !== g) return;
      g.busy = false;
      if (g.round >= g.total) { T.win(g, { text: 'Music makers!', say: 'Great listening! You made music together.' }); return; }
      ecRound(g);
    }, 1400);
  }
  T.register({
    id: 'echo', name: 'Music echo', icon: 'music', tint: '#EFE7FB', ink: '#7055B8', kind: 'Listening', sub: 'Play a beat, copy the beat',
    ages: ['primary'], skill: 'thinking',
    init(g) { g.total = 4; g.phase = 'lead'; g.pattern = []; g.input = []; g.len = lens()[0]; g.busy = false; g.turn = 'other'; },
    voice(g) {
      if (g.phase === 'lead') return g.turn === 'child' ? `You lead! Play ${g.len} drums.` : (T.solo() ? 'Listen to Lumi play.' : `${nm('other')}, play ${g.len} drums.`);
      return g.turn === 'child' ? 'Now copy the beat.' : (T.solo() ? 'Lumi is copying.' : `${nm('other')}, copy the beat.`);
    },
    stage(g) {
      const n = drumsNow();
      const filled = g.phase === 'lead' ? g.pattern : g.input;
      const slots = Array.from({ length: g.len }, (_, k) => `<span class="ec-slot ${k < filled.length ? 'on' : ''}" style="${k < filled.length ? `background:${DRUMS[filled[k]].c}` : ''}"></span>`).join('');
      const who = g.turn === 'child' ? 'You' : nm(g.turn);
      return `<div class="ec-wrap">
        <div class="ec-head"><span class="ec-what">${g.phase === 'lead' ? `${ic('music', 34)}<span>${esc(who)} ${g.turn === 'child' ? 'play' : 'plays'}</span>` : `${ic('restart', 30)}<span>${esc(who)} ${g.turn === 'child' ? 'copy' : 'copies'}</span>`}</span><span class="ec-slots">${slots}</span></div>
        <div class="ec-drums n${n}">${DRUMS.slice(0, n).map((dr, i) => `<button class="ec-drum" data-a="tg" data-k="drum" data-v="${i}" aria-label="${dr.name} drum" ${g.busy ? 'disabled' : ''}>${drumArt(dr)}</button>`).join('')}</div>
        <div class="ec-foot">${g.phase === 'echo' ? `<button class="ec-again" data-a="tg" data-k="again" data-any="1" ${g.busy ? 'disabled' : ''}>${ic('speaker', 30)}<span>Listen again</span></button>` : ''}</div>
      </div>`;
    },
    guide(g) {
      if (g.busy) return null;
      if (g.phase === 'echo') return { sel: `.ec-drum[data-v="${g.pattern[g.input.length]}"]`, say: 'Copy the beat.', delay: 9000 };
      return { sel: '.ec-drum', say: 'Tap the drums.' };
    },
    tap(g, k, el, d) {
      if (k === 'again' && g.phase === 'echo' && !g.busy) { g.input = []; playBack(g, g.pattern, () => T.render()); return; }
      if (k === 'drum') ecDrum(g, Number(d.v), el);
    },
    lumiTurn(g) {
      if (g.busy) return;
      if (g.phase === 'lead') {
        const pat = Array.from({ length: g.len }, () => Math.floor(Math.random() * drumsNow()));
        g.busy = true;
        T.render();
        pat.forEach((i, k) => T.later(() => { if (T.cur() === g) { g.pattern.push(i); T.render(); hit(i); } }, 300 + k * 700));
        T.later(() => { if (T.cur() === g) { g.busy = false; ecToEcho(g); } }, 300 + pat.length * 700 + 300);
      } else if (g.phase === 'echo') {
        g.busy = true;
        T.render();
        const head = g.pattern.slice(0, -1);
        head.forEach((i, k) => T.later(() => { if (T.cur() === g) { g.input.push(i); T.render(); hit(i); } }, 300 + k * 700));
        T.later(() => { if (T.cur() !== g) return; g.busy = false; g.input = head.slice(); ecDrum(g, g.pattern[g.pattern.length - 1]); }, 300 + head.length * 700);
      }
    }
  });

  // ================================================================ 4. Lumi says
  // little pictures of a child doing each action
  const SKIN = '#FFD3AE';
  const limb = (d, col) => `<path d="${d}" stroke="#3B2F2F" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d}" stroke="${col || SKIN}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  function kidPose(pose) {
    const arms = {
      nose: 'M17 22l-3 9M31 22q5-6-6-9',
      sit: 'M17 22l-3 8M31 22l3 8',
      stand: 'M17 22l-3 9M31 22l3 9',
      clap: 'M17 22q1 7 7 5M31 22q-1 7-7 5',
      wave: 'M17 22l-3 9M31 22l6-9',
      jump: 'M17 22l-6-9M31 22l6-9',
      head: 'M17 22q-7-6-1-12M31 22q7-6 1-12',
      turn: 'M17 22l-3 9M31 22l3 9'
    }[pose];
    const legs = pose === 'sit' ? 'M20 33l-1 3h-7v7M28 33l1 3h7v7' : pose === 'jump' ? 'M21 33l-4 8M27 33l4 8' : 'M21 33v10M27 33v10';
    let extra = '';
    if (pose === 'sit') extra += `<rect x="9" y="33" width="30" height="4" rx="2" fill="#C99A6B" ${K}/><path d="M12 37v9M36 37v9" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round"/>`;
    if (pose === 'jump') extra += '<ellipse cx="24" cy="46.5" rx="9" ry="1.6" fill="#3B2F2F" opacity=".15"/><path d="M6 22h4M38 22h4M5 30h4M39 30h4" stroke="#8EB8E5" stroke-width="2" stroke-linecap="round"/>';
    if (pose === 'clap') extra += '<path d="M24 21l-1-4M28 21l2-3M20 21l-3-2" stroke="#F4B400" stroke-width="2" stroke-linecap="round"/>';
    if (pose === 'wave') extra += '<path d="M41 9q3 3 0 6M44 6q4 5 0 10" stroke="#8EB8E5" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    if (pose === 'turn') extra += '<path d="M7 31a18 8 0 1 0 8-13" fill="none" stroke="#9B87D9" stroke-width="2.6" stroke-linecap="round"/><path d="M12 15l3 3-4 2" fill="none" stroke="#9B87D9" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    if (pose === 'stand') extra += '<path d="M41 34V16M37 20l4-4 4 4" fill="none" stroke="#5DAA68" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    if (pose === 'nose') extra += '';
    return sv('0 0 48 48', `${extra}${limb(legs, '#5B8FD9')}<path d="M17 33v-9a7 7 0 0 1 14 0v9z" fill="#7BC67E" ${K}/>${limb(arms)}
      <circle cx="24" cy="12" r="7" fill="${SKIN}" ${K}/><path d="M17 11a7 7 0 0 1 14 0q-4-3-7-1q-4-2-7 1z" fill="#A87B50" ${K}/>
      <circle cx="21.6" cy="12.6" r="1" fill="#3B2F2F"/><circle cx="26.4" cy="12.6" r="1" fill="#3B2F2F"/><path d="M22.2 15.4q1.8 1.4 3.6 0" fill="none" stroke="#3B2F2F" stroke-width="1.1" stroke-linecap="round"/>`);
  }
  const ACTS = [
    { id: 'nose', text: 'Touch your nose', done: 'I touched my nose!' },
    { id: 'sit', text: 'Sit down', done: 'I sat down!' },
    { id: 'stand', text: 'Stand up tall', done: 'I stood up tall!' },
    { id: 'clap', text: 'Clap two times', done: 'Clap, clap!' },
    { id: 'wave', text: 'Wave hello', done: 'Hello!' },
    { id: 'jump', text: 'Jump', done: 'Boing!' },
    { id: 'head', text: 'Hands on your head', done: 'Hands on my head!' },
    { id: 'turn', text: 'Turn around', done: 'Wheee, I turned around!' }
  ];
  const act = (id) => ACTS.find((a) => a.id === id);
  const lsLeader = (g) => (g.round % 2 === 0 ? 'other' : 'child');
  const cardText = (ids) => (ids.length === 1 ? act(ids[0]).text : `${act(ids[0]).text}, then ${lc(act(ids[1]).text)}`);
  function lsDeal(g) {
    const two = T.level() === 3;
    const deck = T.shuffle(ACTS.map((a) => a.id));
    g.options = [0, 1, 2].map((k) => (two ? [deck[k * 2], deck[k * 2 + 1]] : [deck[k]]));
  }
  function lsRound(g) {
    g.phase = 'pick';
    g.card = null;
    g.doing = null;
    lsDeal(g);
    T.setTurn(g, lsLeader(g));
  }
  function lsPick(g, k) {
    if (g.phase !== 'pick') return;
    g.card = g.options[k];
    g.phase = 'show';
    T.cheer();
    const lead = lsLeader(g);
    const line = `${lead === 'child' ? 'You say' : `${nm(lead)} says`}: ${cardText(g.card)}!`;
    T.render();
    T.say(line);
    T.later(() => { if (T.cur() === g) { g.phase = 'do'; T.setTurn(g, otherOf(lead), ''); } }, 1900);
  }
  function lsDone(g) {
    if (g.phase !== 'do') return;
    g.phase = 'well';
    g.round += 1;
    g.doing = null;
    T.cheer();
    T.say(rnd(['Well done!', 'You did it!', 'Great moving!']));
    T.render();
    T.later(() => {
      if (T.cur() !== g) return;
      if (g.round >= g.total) { T.win(g, { text: 'Great listening!', say: 'Great listening and great moving!' }); return; }
      lsRound(g);
    }, 1300);
  }
  T.register({
    id: 'lumisays', name: 'Lumi says', icon: 'jump', tint: '#E7F4E0', ink: '#4F8A3F', kind: 'Following', sub: 'Lead with picture cards, then swap',
    ages: ['primary'], skill: 'communication',
    init(g) { g.total = 6; g.phase = 'pick'; g.card = null; g.doing = null; g.turn = 'other'; lsDeal(g); },
    voice(g) {
      if (g.phase === 'pick') return g.turn === 'child' ? 'You lead! Pick a card.' : (T.solo() ? 'Lumi is picking a card.' : `${nm('other')}, pick a card.`);
      if (!g.card) return '';
      if (g.phase !== 'do') return '';
      return g.turn === 'child' ? `${cardText(g.card)}! Then tap Done.` : (T.solo() ? `Lumi is doing it: ${lc(cardText(g.card))}.` : `${nm('other')}: ${lc(cardText(g.card))}! Then tap Done.`);
    },
    stage(g) {
      if (g.phase === 'pick') {
        return `<div class="ls-pick"><div class="tg-say ls-q">${esc(g.turn === 'child' ? 'You lead. Pick a card!' : `${nm(g.turn)} picks a card`)}</div>
          <div class="ls-cards">${g.options.map((ids, k) => `<button class="ls-card" data-a="tg" data-k="pick" data-v="${k}">
            <span class="ls-pics">${ids.map((id) => `<span class="ls-pic">${kidPose(id)}</span>`).join(`<span class="ls-then">${ic('chev', 22)}</span>`)}</span><b>${esc(cardText(ids))}</b></button>`).join('')}</div></div>`;
      }
      const lead = lsLeader(g);
      const doer = otherOf(lead);
      const lumiDoing = T.solo() && doer === 'other';
      const showDo = g.phase === 'do';
      return `<div class="ls-do">
        <div class="ls-big"><span class="ls-from">${T.avatar(lead, 44)}<span>${esc(lead === 'child' ? 'You say' : nm(lead) + ' says')}</span></span>
          <span class="ls-pics big">${g.card.map((id) => `<span class="ls-pic">${kidPose(id)}</span>`).join(`<span class="ls-then">${ic('chev', 30)}</span>`)}</span>
          <b>${esc(cardText(g.card))}!</b>${A.speakBtn(cardText(g.card), 56)}</div>
        <div class="ls-doer">${lumiDoing ? `<div class="ls-lumi ${g.doing ? 'go-' + g.doing : ''}">${lumiBig(g.doing ? 'excited' : 'happy', 190)}</div><span class="ls-doer-name">${showDo ? 'Lumi does it!' : 'Lumi is listening'}</span>`
          : `${T.avatar(doer, 120)}<span class="ls-doer-name">${esc(doer === 'child' ? 'Your turn to do it!' : nm(doer) + ', do it!')}</span>
          <button class="primary ls-done" data-a="tg" data-k="done" ${showDo ? '' : 'disabled'}>${ic('check', 32)}<span>Done</span></button>`}</div>
      </div>`;
    },
    guide(g) {
      if (g.phase === 'pick') return { sel: '.ls-card', say: 'Pick a card.' };
      if (g.phase === 'do') return { sel: '.ls-done', say: 'Do it, then tap Done.', delay: 7000 };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'pick' && g.turn === lsLeader(g)) lsPick(g, Number(d.v));
      else if (k === 'done' && g.turn !== lsLeader(g)) lsDone(g);
    },
    lumiTurn(g) {
      if (g.phase === 'pick') { lsPick(g, Math.floor(Math.random() * 3)); return; }
      if (g.phase === 'do') {
        g.doing = g.card[0];
        T.render();
        T.say(act(g.card[0]).done);
        const second = g.card[1];
        T.later(() => {
          if (T.cur() !== g) return;
          if (second) { g.doing = second; T.render(); T.say(act(second).done); T.later(() => { if (T.cur() === g) lsDone(g); }, 1900); } else lsDone(g);
        }, 1900);
      }
    }
  });

  // ================================================================ 5. Hide Lumi
  const PLACES = [
    { id: 'bed', name: 'under the bed', short: 'the bed', x: 21, y: 74, w: 26, at: { under: 1, nearBed: 1 } },
    { id: 'wardrobe', name: 'on top of the wardrobe', short: 'the wardrobe', x: 88, y: 50, w: 13, at: { high: 1 } },
    { id: 'box', name: 'in the toy box', short: 'the toy box', x: 42, y: 80, w: 11, at: { inside: 1, nearBed: 1 } },
    { id: 'table', name: 'under the table', short: 'the table', x: 66, y: 76, w: 17, at: { under: 1 } },
    { id: 'curtain', name: 'behind the curtain', short: 'the curtain', x: 48, y: 36, w: 15, at: { behind: 1 } },
    { id: 'plant', name: 'behind the plant', short: 'the plant', x: 9, y: 44, w: 9, at: { behind: 1 } }
  ];
  const QUESTIONS = [
    { k: 'high', q: 'Is Lumi up high?', icon: 'up' },
    { k: 'under', q: 'Is Lumi under something?', icon: 'down' },
    { k: 'inside', q: 'Is Lumi inside something?', icon: 'open' },
    { k: 'behind', q: 'Is Lumi behind something?', icon: 'eye' },
    { k: 'nearBed', q: 'Is Lumi near the bed?', icon: 'sNap' }
  ];
  const place = (id) => PLACES.find((p) => p.id === id);
  const placesNow = () => (T.level() === 1 ? PLACES.filter((p) => ['bed', 'wardrobe', 'box', 'table'].includes(p.id)) : PLACES);
  const questionsNow = () => QUESTIONS.filter((q) => placesNow().some((p) => p.at[q.k]));
  const truth = (spot, k) => !!place(spot).at[k];
  const mustAsk = () => ({ 1: 0, 2: 1, 3: 2 }[T.level()]);
  const hider = (g) => (g.round % 2 === 0 ? 'other' : 'child');
  const seeker = (g) => otherOf(hider(g));
  const PLACE_ART = {
    bed: sv('0 0 120 70', `<rect x="4" y="8" width="12" height="58" rx="5" fill="#A87B50" ${K}/><rect x="10" y="26" width="104" height="22" rx="8" fill="#fff" ${K}/><rect x="40" y="24" width="72" height="26" rx="9" fill="#8EC5E8" ${K}/><rect x="16" y="20" width="26" height="12" rx="6" fill="#fff" ${K}/><rect x="12" y="48" width="104" height="8" rx="3" fill="#A87B50" ${K}/><path d="M18 56v10M108 56v10" stroke="#3B2F2F" stroke-width="3" stroke-linecap="round"/>`),
    wardrobe: sv('0 0 60 110', `<rect x="4" y="6" width="52" height="98" rx="5" fill="#D9A06A" ${K}/><path d="M30 10v90" ${K}/><circle cx="25" cy="56" r="2.2" fill="#3B2F2F"/><circle cx="35" cy="56" r="2.2" fill="#3B2F2F"/><rect x="2" y="2" width="56" height="8" rx="3" fill="#C88A55" ${K}/>`),
    box: sv('0 0 60 50', `<rect x="4" y="14" width="52" height="34" rx="5" fill="#F4A259" ${K}/><rect x="2" y="8" width="56" height="10" rx="4" fill="#F7BE7A" ${K}/><path d="M14 30h32" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="38" r="3" fill="#FFD23F"/>`),
    table: sv('0 0 90 60', `<rect x="4" y="8" width="82" height="10" rx="4" fill="#C99A6B" ${K}/><path d="M12 18v38M78 18v38" stroke="#3B2F2F" stroke-width="6" stroke-linecap="round"/><path d="M12 18v38M78 18v38" stroke="#A87B50" stroke-width="2.6" stroke-linecap="round"/><circle cx="45" cy="4" r="5" fill="#EF6F5E" ${K}/>`),
    curtain: sv('0 0 80 90', `<rect x="10" y="8" width="60" height="70" rx="4" fill="#BFE3F7" ${K}/><rect x="4" y="2" width="72" height="6" rx="3" fill="#A87B50"/><path d="M6 8h20c-4 20 2 50-4 76H6z" fill="#F59FBF" ${K}/><path d="M74 8H54c4 20-2 50 4 76h16z" fill="#F59FBF" ${K}/>`),
    plant: sv('0 0 50 90', `<path d="M25 52V24" stroke="#5DAA68" stroke-width="3"/><path d="M25 34c-14 0-20-10-18-22 10 0 18 8 18 22zM25 28c2-14 10-22 20-20 0 12-8 20-20 20zM25 44c-10 2-18-4-20-12 10-2 18 2 20 12z" fill="#7BC67E" ${K}/><path d="M12 52h26l-4 32H16z" fill="#EF6F5E" ${K}/>`)
  };
  function hlRound(g) {
    g.spot = null; g.asked = []; g.empty = []; g.q = null; g.wrongAns = 0; g.foundAt = null;
    const h = hider(g);
    if (T.solo() && h === 'other') {
      g.phase = 'lumihide';
      T.setTurn(g, 'other', 'Close your eyes! Lumi is hiding. One, two, three...');
    } else if (T.solo()) {
      g.phase = 'hide';
      T.setTurn(g, 'child', 'Lumi is closing its eyes. Tap where Lumi should hide!');
    } else {
      g.phase = 'cover';
      T.setTurn(g, h, `${nm(seeker(g))}, close your eyes! ${nm(h)}, get ready to hide Lumi.`);
    }
  }
  function hlHide(g, spot) {
    g.spot = spot;
    T.cheer();
    g.phase = 'seek';
    const s = seeker(g);
    const line = T.solo() && s === 'other' ? 'Lumi is hidden. Now Lumi will ask you a question.' : `Lumi is hidden! ${s === 'child' ? 'Open your eyes' : nm(s) + ', open your eyes'}. ${mustAsk() ? `Ask ${mustAsk() === 1 ? 'a question' : 'two questions'}, then look.` : 'Where is Lumi?'}`;
    T.setTurn(g, s, line);
  }
  function hlAsk(g, k) {
    if (g.asked.some((a) => a.k === k) || g.q) return;
    g.q = k;
    const q = QUESTIONS.find((x) => x.k === k);
    if (T.solo() && hider(g) === 'other') {
      // Lumi is the hider and answers
      T.say(q.q);
      T.render();
      const yes = truth(g.spot, k);
      T.later(() => { if (T.cur() !== g) return; g.asked.push({ k, yes }); g.q = null; T.render(); T.say(`Lumi says ${yes ? 'yes' : 'no'}!`); }, 1100);
      return;
    }
    g.phase = 'answer';
    g.wrongAns = 0;
    T.setTurn(g, hider(g), `${q.q} ${hider(g) === 'child' ? 'Tap yes or no.' : nm(hider(g)) + ', tap yes or no.'}`);
  }
  function hlAnswer(g, yes, el) {
    if (g.phase !== 'answer') return;
    const right = truth(g.spot, g.q);
    if (yes !== right) {
      g.wrongAns += 1;
      T.nope(el);
      if (g.wrongAns < 2) { T.say(`Hmm, are you sure? Lumi is ${place(g.spot).name}.`); return; }
      T.say(`Lumi is ${place(g.spot).name}, so the answer is ${right ? 'yes' : 'no'}.`);
    } else {
      T.cheer();
      T.say(yes ? 'Yes!' : 'No!');
    }
    g.asked.push({ k: g.q, yes: right });
    g.q = null;
    g.phase = 'seek';
    T.render();
    T.later(() => { if (T.cur() === g) T.setTurn(g, seeker(g), ''); }, 1300);
  }
  function hlLook(g, spot, el) {
    if (g.phase !== 'seek' || g.q) return;
    if (g.asked.length < mustAsk()) { T.nope(el); T.say(mustAsk() - g.asked.length === 1 ? 'Ask a question first.' : `Ask ${mustAsk() - g.asked.length} questions first.`); return; }
    if (g.empty.includes(spot)) return;
    if (spot !== g.spot) {
      g.empty.push(spot);
      T.nope(el);
      T.render();
      T.say(`Not by ${place(spot).short}. Keep looking!`);
      if (T.solo() && seeker(g) === 'other') T.later(() => { if (T.cur() === g) T.kick(); }, 600);
      return;
    }
    g.foundAt = spot;
    g.phase = 'found';
    g.round += 1;
    T.cheer();
    T.render();
    T.say(`Peekaboo! Lumi was ${place(spot).name}!`);
    T.later(() => {
      if (T.cur() !== g) return;
      if (g.round >= g.total) { T.win(g, { text: 'Hide and seek stars!', say: 'Great hiding, great asking and great answers!' }); return; }
      hlRound(g);
    }, 2100);
  }
  T.register({
    id: 'hidelumi', name: 'Hide Lumi', icon: 'kRoom', tint: '#FBEFD9', ink: '#B07A12', kind: 'Yes and no', sub: 'Hide Lumi, ask yes or no questions',
    ages: ['primary'], skill: 'communication',
    init(g) { g.total = 4; g.spot = null; g.asked = []; g.empty = []; g.q = null; g.foundAt = null; g.wrongAns = 0; g.turn = 'other'; g.phase = T.solo() ? 'lumihide' : 'cover'; },
    voice(g) {
      const s = seeker(g), h = hider(g);
      if (g.phase === 'lumihide') return 'Close your eyes! Lumi is hiding.';
      if (g.phase === 'cover') return `${nm(s)}, close your eyes! ${nm(h)}, tap Ready.`;
      if (g.phase === 'hide') return h === 'child' ? 'Tap where Lumi should hide.' : `${nm(h)}, tap where Lumi should hide.`;
      if (g.phase === 'seek') return s === 'child' ? (g.asked.length < mustAsk() ? 'Ask a question.' : 'Where is Lumi? Tap a place to look.') : (T.solo() ? 'Lumi is thinking.' : `${nm(s)}, ask a question or look.`);
      if (g.phase === 'answer') { const q = QUESTIONS.find((x) => x.k === g.q); return q ? q.q : ''; }
      return '';
    },
    stage(g) {
      const h = hider(g), s = seeker(g);
      if (g.phase === 'cover') {
        return `<div class="hl-cover"><span class="hl-eyes">${ic('eye', 90)}</span><b>${esc(nm(s))}, close your eyes!</b><span>${esc(nm(h))} hides Lumi.</span>
          <button class="primary" data-a="tg" data-k="ready" style="height:80px">${ic('check', 30)}<span>Ready</span></button></div>`;
      }
      if (g.phase === 'lumihide') {
        return `<div class="hl-cover"><span class="hl-eyes">${ic('eye', 90)}</span><b>Close your eyes!</b><span>Lumi is hiding... 1, 2, 3</span></div>`;
      }
      const peek = T.solo() && h === 'child' && g.phase !== 'hide' ? g.spot : null;
      const showAt = g.foundAt || peek;
      const spots = placesNow().map((p) => `<button class="hl-place ${g.empty.includes(p.id) ? 'empty' : ''}" data-a="tg" data-k="place" data-v="${p.id}" aria-label="${esc(p.name)}" style="left:${p.x}%;top:${p.y}%;width:${p.w}%">
        <span class="hl-art">${PLACE_ART[p.id]}</span>${showAt === p.id ? `<span class="hl-lumi ${g.foundAt ? 'pop' : 'peek'}">${lumiBig(g.foundAt ? 'excited' : 'happy', 70)}</span>` : ''}
        ${g.empty.includes(p.id) ? `<span class="hl-x">${ic('no', 30)}</span>` : ''}</button>`).join('');
      const blind = g.phase === 'hide' && T.solo() ? `<div class="hl-blind">${lumiBig('calm', 100)}<span>Lumi's eyes are closed</span></div>` : '';
      return `<div class="hl-room"><div class="hl-wall"></div><div class="hl-floor"></div>${spots}${blind}</div>`;
    },
    bar(g) {
      if (g.phase === 'answer') {
        const q = QUESTIONS.find((x) => x.k === g.q);
        return `<div class="bar hl-bar"><span class="hl-qtext">${T.avatar(seeker(g), 50)}<b>${esc(q ? q.q : '')}</b></span><span class="grow"></span>
          <button class="hl-yes" data-a="tg" data-k="answer" data-v="yes">${ic('yes', 52)}<span>Yes</span></button>
          <button class="hl-no" data-a="tg" data-k="answer" data-v="no">${ic('no', 52)}<span>No</span></button></div>`;
      }
      if (g.phase !== 'seek' && g.phase !== 'found') return '';
      const qs = questionsNow().map((q) => {
        const a = g.asked.find((x) => x.k === q.k);
        return `<button class="hl-q ${a ? (a.yes ? 'yes' : 'no') : ''} ${g.q === q.k ? 'asking' : ''}" data-a="tg" data-k="ask" data-v="${q.k}" ${a ? 'disabled' : ''}>${ic(q.icon, 28)}<span>${esc(q.q.replace('Is Lumi ', '').replace('?', ''))}</span>${a ? `<i>${a.yes ? 'Yes' : 'No'}</i>` : ''}</button>`;
      }).join('');
      return `<div class="bar hl-bar"><span class="hl-qlabel">${ic('what', 34)}<span>${mustAsk() ? `Ask ${mustAsk() === 1 ? '1 question' : '2 questions'}` : 'Ask (if you like)'}</span></span><div class="hl-qs">${qs}</div></div>`;
    },
    guide(g) {
      if (g.phase === 'cover') return { sel: '[data-k="ready"]', say: 'Tap Ready.' };
      if (g.phase === 'hide') return { sel: '.hl-place', say: 'Pick a hiding place.' };
      if (g.phase === 'answer') return { sel: truth(g.spot, g.q) ? '.hl-yes' : '.hl-no', say: 'Yes or no?', delay: 9000 };
      if (g.phase === 'seek' && !g.q) return g.asked.length < mustAsk() ? { sel: '.hl-q:not([disabled])', say: 'Ask a question.' } : { sel: `.hl-place[data-v="${g.spot}"]`, say: 'Tap a place to look.', delay: 9000 };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'ready' && g.phase === 'cover') { g.phase = 'hide'; T.render(); T.say(`${hider(g) === 'child' ? 'Tap' : nm(hider(g)) + ', tap'} where Lumi should hide.`); return; }
      if (k === 'place' && g.phase === 'hide') { hlHide(g, d.v); return; }
      if (k === 'place' && g.phase === 'seek' && g.turn === seeker(g)) { hlLook(g, d.v, el); return; }
      if (k === 'ask' && g.phase === 'seek' && g.turn === seeker(g)) { hlAsk(g, d.v); return; }
      if (k === 'answer' && g.phase === 'answer' && g.turn === hider(g)) hlAnswer(g, d.v === 'yes', el);
    },
    lumiTurn(g) {
      if (g.phase === 'lumihide') {
        T.later(() => { if (T.cur() === g && g.phase === 'lumihide') hlHide(g, rnd(placesNow()).id); }, 1800);
        return;
      }
      if (g.phase !== 'seek' || g.q) return;
      // Lumi is the seeker: ask (so the child answers yes or no), then look where the answers point
      const need = Math.max(1, mustAsk());
      const left = questionsNow().filter((q) => !g.asked.some((a) => a.k === q.k));
      if (g.asked.length < need && left.length) { hlAsk(g, rnd(left).k); return; }
      const open = placesNow().filter((p) => !g.empty.includes(p.id));
      const fits = open.filter((p) => g.asked.every((a) => !!p.at[a.k] === a.yes));
      const pickP = rnd(fits.length ? fits : open);
      T.say(`Is Lumi ${pickP.name}? Let me look.`);
      T.later(() => { if (T.cur() === g && g.phase === 'seek') hlLook(g, pickP.id); }, 1300);
    }
  });

  // ================================================================ 6. Build it together
  const COLS = { red: { c: '#EF6F5E', who: 'child' }, yellow: { c: '#FFD23F', who: 'child' }, blue: { c: '#5B8FD9', who: 'other' }, green: { c: '#7BC67E', who: 'other' } };
  const blockArt = (col, size) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><circle cx="16" cy="8" r="4" fill="${COLS[col].c}" ${K}/><circle cx="32" cy="8" r="4" fill="${COLS[col].c}" ${K}/><rect x="4" y="9" width="40" height="35" rx="7" fill="${COLS[col].c}" ${K}/><rect x="9" y="13" width="14" height="5" rx="2.5" fill="#fff" opacity=".55"/></svg>`;
  const buShape = () => ({ 1: [1, 4], 2: [2, 3], 3: [2, 4] }[T.level()] || [2, 3]); // [columns, rows]
  function buPattern(n) {
    for (let tries = 0; tries < 50; tries++) {
      const p = Array.from({ length: n }, () => rnd(Object.keys(COLS)));
      const kids = p.filter((c) => COLS[c].who === 'child').length;
      if (kids >= 2 && n - kids >= 2) return p;
    }
    return Array.from({ length: n }, (_, i) => ['red', 'blue', 'yellow', 'green'][i % 4]);
  }
  function buNext(g) {
    const col = g.pattern[g.placed];
    const who = COLS[col].who;
    T.setTurn(g, who, `A ${col} block! ${who === 'child' ? 'Your turn.' : nm('other') + "'s turn."}`);
  }
  function buPlace(g, col, el) {
    const need = g.pattern[g.placed];
    if (col !== need) { T.nope(el); T.say(`Look again. We need a ${need} block.`); return; }
    g.placed += 1;
    g.round = g.placed;
    T.tone(440 + g.placed * 60, 0.18, 0.07);
    if (g.placed >= g.pattern.length) {
      T.render();
      T.later(() => { if (T.cur() === g) T.win(g, { text: 'We built it together!', say: 'It matches! You built it together.' }); }, 700);
      return;
    }
    const nextWho = COLS[g.pattern[g.placed]].who;
    if (nextWho === g.turn) { T.render(); T.say(`Another one! A ${g.pattern[g.placed]} block.`); T.kick(); } else buNext(g);
  }
  T.register({
    id: 'build', name: 'Build it together', icon: 'kSort', tint: '#FDECE3', ink: '#C0574A', kind: 'Teamwork', sub: 'Copy the picture, one block each',
    ages: ['primary'], skill: 'social',
    init(g) {
      const [cols, rows] = buShape();
      g.cols = cols; g.rows = rows;
      g.pattern = buPattern(cols * rows);
      g.placed = 0;
      g.total = g.pattern.length;
      g.turn = COLS[g.pattern[0]].who;
    },
    voice(g) {
      const col = g.pattern[g.placed];
      if (!col) return 'It matches!';
      return `Copy the picture. We need a ${col} block. ${g.turn === 'child' ? 'Your turn.' : (T.solo() ? "Lumi's turn." : `${nm('other')}'s turn.`)}`;
    },
    stage(g) {
      // the copy fills from the bottom row up, left to right
      const order = [];
      for (let r = g.rows - 1; r >= 0; r--) for (let c = 0; c < g.cols; c++) order.push([r, c]);
      const big = g.rows > 3 ? 88 : 108;
      const cell = (k, mode) => {
        const col = g.pattern[k];
        if (mode === 'target') return `<span class="bu-cell">${blockArt(col, big * 0.62)}</span>`;
        const on = k < g.placed;
        const next = k === g.placed;
        return `<span class="bu-cell slot ${next ? 'next' : ''}" style="width:${big}px;height:${big}px">${on ? blockArt(col, big) : next ? `<span class="bu-ghost" style="border-color:${COLS[col].c}"></span>` : ''}</span>`;
      };
      const grid = (mode) => {
        const cells = [];
        for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) { const k = order.findIndex(([rr, cc]) => rr === r && cc === c); cells.push(cell(k, mode)); }
        return `<div class="bu-grid" style="grid-template-columns:repeat(${g.cols}, auto)">${cells.join('')}</div>`;
      };
      const tray = (who) => {
        const mine = Object.keys(COLS).filter((c) => COLS[c].who === who);
        const active = g.turn === who && !g.won;
        return `<div class="bu-tray ${active ? 'on' : ''}">${T.avatar(who, 54)}<span class="bu-tname">${esc(who === 'child' ? 'Your blocks' : nm(who) + "'s blocks")}</span>
          <div class="bu-blocks">${mine.map((c) => `<button class="bu-block" data-a="tg" data-k="block" data-v="${c}" data-who="${who}" ${!active && who === 'child' ? 'data-any="1"' : ''} aria-label="${c} block">${blockArt(c, 80)}</button>`).join('')}</div></div>`;
      };
      return `<div class="bu-wrap">
        ${tray('child')}
        <div class="bu-center"><div class="bu-panel target"><span class="bu-label">${ic('eye', 24)}<span>Copy this</span></span>${grid('target')}</div>
          <div class="bu-panel build"><span class="bu-label">${ic('kSort', 24)}<span>Our build</span></span>${grid('build')}</div></div>
        ${tray('other')}
      </div>`;
    },
    guide(g) {
      const col = g.pattern[g.placed];
      if (!col) return null;
      return { sel: `.bu-block[data-v="${col}"]`, say: `Tap the ${col} block.` };
    },
    tap(g, k, el, d) {
      if (k !== 'block' || g.placed >= g.pattern.length) return;
      if (d.who !== g.turn) { T.nope(el); T.say(`It's ${g.turn === 'child' ? 'your' : nm(g.turn) + "'s"} turn. We need a ${g.pattern[g.placed]} block.`); return; }
      if (T.solo() && d.who === 'other') return;
      buPlace(g, d.v, el);
    },
    lumiTurn(g) {
      const col = g.pattern[g.placed];
      if (!col || COLS[col].who !== 'other') return;
      buPlace(g, col);
    }
  });
})();
