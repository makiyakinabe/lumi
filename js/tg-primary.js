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
  const saucer = '<ellipse cx="30" cy="44" rx="25" ry="9" fill="#C7D9E6"/><ellipse cx="30" cy="42" rx="25" ry="9" fill="#EEF4F8"/>';
  const bowl60 = (c) => `<path d="M8 30h44c-1 14-10 22-22 22S9 44 8 30z" fill="${c}"/><ellipse cx="30" cy="30" rx="22" ry="6" fill="#F7F1E6"/>`;
  const bottle60 = (c) => `<rect x="22" y="6" width="16" height="8" rx="2" fill="#E9E1D4"/><path d="M20 16h20l3 8v26a5 5 0 0 1-5 5H22a5 5 0 0 1-5-5V24z" fill="${c}"/><rect x="21" y="30" width="18" height="12" rx="2" fill="#fff" opacity=".85"/>`;
  const ITEMS = {
    chicken: { name: 'Chicken', art: S60(`${saucer}${[0, 1, 2].map((i) => `<path d="M${14 + i * 10} 40l9-14 7 3-8 14z" fill="#FBEFD9" stroke="#D9A86A" stroke-width="2" stroke-linejoin="round"/><path d="M${23 + i * 10} 26l7 3" stroke="#E3A85C" stroke-width="4" stroke-linecap="round"/>`).join('')}`) },
    cucumber: { name: 'Cucumber', art: S60(`${saucer}${[[18, 38], [30, 41], [42, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#E6F4D4" stroke="#4F8A3F" stroke-width="3"/><circle cx="${x}" cy="${y}" r="2.4" fill="#B9DA94"/>`).join('')}`) },
    chilli: { name: 'Chilli', art: S60(`${saucer}<ellipse cx="30" cy="40" rx="14" ry="5" fill="#E2412F"/><circle cx="26" cy="39" r="1.4" fill="#FFD9A8"/><circle cx="33" cy="41" r="1.2" fill="#FFD9A8"/>`) },
    fishcake: { name: 'Fishcake', art: S60(`${saucer}${[[18, 38], [30, 41], [42, 38]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="#FFFDF8" stroke="#F08AA0" stroke-width="3"/>`).join('')}`) },
    egg: { name: 'Fried egg', art: S60(`${saucer}<path d="M14 40c2-8 10-12 18-10s14 2 14 8-10 10-18 9-16-1-14-7z" fill="#fff" stroke="#E9E1D4" stroke-width="1.5"/><circle cx="30" cy="37" r="6" fill="#FFB928"/>`) },
    onion: { name: 'Spring onion', art: S60(`${saucer}${[[20, 38], [28, 42], [36, 37], [42, 42], [25, 34], [34, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="none" stroke="#5E9E45" stroke-width="2.4"/>`).join('')}`) },
    curry: { name: 'Curry', art: S60(`${bowl60('#C9A86A')}<ellipse cx="30" cy="30" rx="18" ry="4.6" fill="#D9822B"/><circle cx="25" cy="29" r="2.4" fill="#F6D58C"/><circle cx="35" cy="31" r="2" fill="#F6D58C"/>`) },
    eggs: { name: 'Soft eggs', art: S60(`${saucer}<ellipse cx="22" cy="38" rx="9" ry="6" fill="#FFF8EC" stroke="#E9DCC4" stroke-width="1.5"/><ellipse cx="22" cy="37" rx="4.5" ry="3" fill="#FFC24A"/><ellipse cx="38" cy="40" rx="9" ry="6" fill="#FFF8EC" stroke="#E9DCC4" stroke-width="1.5"/><ellipse cx="38" cy="39" rx="4.5" ry="3" fill="#FFC24A"/>`) },
    soy: { name: 'Soy sauce', art: S60(bottle60('#4A3326')) },
    red: { name: 'Red syrup', art: S60(bottle60('#E2415E')) },
    green: { name: 'Green syrup', art: S60(bottle60('#5DB85A')) },
    corn: { name: 'Sweet corn', art: S60(`${bowl60('#9CC5E0')}${[[22, 28], [28, 31], [34, 28], [40, 30], [26, 26], [32, 25]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#FFD23F" stroke="#D9A21E" stroke-width="1"/>`).join('')}`) },
    beans: { name: 'Red beans', art: S60(`${bowl60('#D7C3A6')}${[[22, 28], [28, 31], [34, 28], [40, 30], [26, 26], [32, 25]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.6" fill="#8E2F2A"/>`).join('')}`) },
    ice: { name: 'Ice', art: S60(`${bowl60('#BFD8EE')}${[[20, 24], [30, 22], [39, 25]].map(([x, y]) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2.4" fill="#E8F4FC" stroke="#9CC5E0" stroke-width="2"/>`).join('')}`) },
    spoon: { name: 'Spoon', art: S60('<ellipse cx="20" cy="18" rx="9" ry="12" fill="#DDE3E9" stroke="#8A94A0" stroke-width="2.5" transform="rotate(-35 20 18)"/><path d="M25 26 48 52" stroke="#8A94A0" stroke-width="5" stroke-linecap="round"/>') },
    fork: { name: 'Fork', art: S60('<path d="M14 6v14M20 6v14M26 6v14M12 18c0 7 4 10 8 10s8-3 8-10" stroke="#8A94A0" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M20 28 46 54" stroke="#8A94A0" stroke-width="5" stroke-linecap="round"/>') },
    straw: { name: 'Straw', art: S60('<path d="M22 54 38 6" stroke="#E07A5F" stroke-width="7" stroke-linecap="round"/><path d="M24 48l4-12M31 27l4-12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>') },
    packet: { name: 'Chilli packet', art: S60('<path d="M14 14h32l-2 32H16z" fill="#F7EDE1" stroke="#D9C9B4" stroke-width="2"/><path d="M18 28h24l-1 14H19z" fill="#E2412F"/><path d="M14 14h32" stroke="#D9C9B4" stroke-width="4"/>') }
  };
  const itemName = (k) => (ITEMS[k] ? ITEMS[k].name : k);

  // ---------------------------------------------------------------- each dish, drawn as it is being made
  // has = { layer: true or 0..1 } (200 x 140)
  const PLATE = '<ellipse cx="100" cy="116" rx="84" ry="18" fill="#6B4A3A" opacity=".12"/><ellipse cx="100" cy="106" rx="88" ry="28" fill="#C7D9E6"/><ellipse cx="100" cy="101" rx="88" ry="28" fill="#EEF4F8"/><ellipse cx="100" cy="101" rx="64" ry="19" fill="#fff"/>';
  const BOWL = (a, b) => `<ellipse cx="100" cy="130" rx="58" ry="7" fill="#6B4A3A" opacity=".14"/><path d="M22 72h156c-4 36-36 58-78 58S26 108 22 72z" fill="${a}"/><path d="M32 96c14 20 38 28 68 28s54-8 68-28c-10 24-34 34-68 34S42 120 32 96z" fill="${b}" opacity=".6"/><ellipse cx="100" cy="72" rx="78" ry="16" fill="#F7F1E6"/>`;
  const sauceDish = (cx, cy, c) => `<ellipse cx="${cx}" cy="${cy + 3}" rx="20" ry="7" fill="#C7D9E6"/><ellipse cx="${cx}" cy="${cy}" rx="20" ry="7" fill="#EEF4F8"/><ellipse cx="${cx}" cy="${cy - 1}" rx="13" ry="4.2" fill="${c}"/>`;
  const amt = (v) => (v === true ? 1 : Math.max(0, Math.min(1, Number(v) || 0)));
  function dishSvg(id, has) {
    const h = has || {};
    let b = '';
    if (id === 'chickenrice') {
      b = PLATE;
      const a = amt(h.rice);
      if (a > 0) {
        const s = 0.35 + a * 0.65;
        b += `<path d="M${84 - 46 * s} 104q${6 * s} ${-40 * s} ${46 * s} ${-42 * s}q${40 * s} ${2 * s} ${46 * s} ${42 * s}z" fill="#FFFDF5" stroke="#E6DDC8" stroke-width="2.5"/>`;
        b += [[70, 92], [82, 84], [94, 92], [76, 98], [100, 98], [88, 96]].filter((_, i) => i < 2 + a * 4).map(([x, y]) => `<path d="M${x} ${y}h5" stroke="#E6DDC8" stroke-width="2" stroke-linecap="round"/>`).join('');
      }
      if (h.cucumber) b += [[36, 104], [50, 110], [64, 112]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="6" fill="#E6F4D4" stroke="#4F8A3F" stroke-width="3"/>`).join('');
      if (h.chicken) b += [0, 1, 2, 3].map((i) => `<path d="M${110 + i * 13} 108l10-30 10 3-8 30z" fill="#FBEFD9" stroke="#D9A86A" stroke-width="2" stroke-linejoin="round"/><path d="M${120 + i * 13} 78l10 3" stroke="#E3A85C" stroke-width="5" stroke-linecap="round"/>`).join('');
      if (h.chilli) b += sauceDish(170, 64, '#E2412F');
    } else if (id === 'noodles') {
      b = BOWL('#E8775E', '#B84A35');
      if (h.noodles) {
        b += [0, 1, 2, 3, 4].map((i) => `<path d="M${40 + (i % 2) * 6} ${64 + i * 4}q10 -8 20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="${i % 2 ? '#C98F3A' : '#DDA64E'}" stroke-width="5" stroke-linecap="round"/>`).join('');
        b += [[56, 66], [84, 62], [112, 70], [138, 64], [70, 74], [126, 76]].map(([x, y]) => `<rect x="${x}" y="${y}" width="11" height="8" rx="3" fill="#7FB069" stroke="#4F8A3F" stroke-width="1.6"/>`).join('');
      }
      if (h.fishcake) b += [[60, 70], [76, 64], [92, 72]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#FFFDF8" stroke="#F08AA0" stroke-width="2.4"/>`).join('');
      if (h.egg) b += '<path d="M112 66c2-9 12-13 22-11s16 3 15 10-12 10-21 9-17-1-16-8z" fill="#fff" stroke="#E9E1D4" stroke-width="1.5"/><circle cx="130" cy="63" r="6.5" fill="#FFB928"/>';
      if (h.onion) b += [[54, 60], [100, 58], [118, 76], [146, 70], [84, 76], [70, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="#5E9E45" stroke-width="2.2"/>`).join('');
    } else if (id === 'prata') {
      b = PLATE;
      const d = amt(h.dough);
      if (h.cooked) {
        b += '<ellipse cx="92" cy="98" rx="56" ry="17" fill="#D9963F"/><ellipse cx="92" cy="95" rx="53" ry="15" fill="#F2BE68"/><path d="M56 94c14-6 34-8 56-4M66 100c16 4 34 3 50-3" stroke="#D9963F" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
        if (h.cut) b += '<path d="M70 82 76 110M108 81 104 111" stroke="#B8772E" stroke-width="3" stroke-linecap="round"/>';
      } else if (d > 0) b += `<ellipse cx="92" cy="96" rx="${20 + d * 34}" ry="${8 + d * 7}" fill="#F6E7C8" stroke="#E3CFA0" stroke-width="2.5"/>`;
      if (h.curry) b += '<path d="M152 62h36c-1 12-8 18-18 18s-17-6-18-18z" fill="#7CC0B6"/><ellipse cx="170" cy="62" rx="18" ry="5" fill="#D9822B"/><circle cx="165" cy="61" r="2.4" fill="#F6D58C"/><circle cx="175" cy="63" r="2" fill="#F6D58C"/>';
    } else if (id === 'kaya') {
      b = PLATE;
      const t = amt(h.toast);
      const k = amt(h.kaya);
      [[44, 76], [100, 80]].forEach(([x, y], i) => {
        b += `<rect x="${x}" y="${y}" width="50" height="28" rx="7" fill="#F6E2B8" stroke="#C99A5A" stroke-width="2.5"/>`;
        if (t > 0) b += `<rect x="${x}" y="${y}" width="50" height="28" rx="7" fill="#C98A3E" opacity="${(t * 0.7).toFixed(2)}"/>${[0, 1, 2].map((j) => `<path d="M${x + 10 + j * 14} ${y + 4}v20" stroke="#8E5A22" stroke-width="2.4" opacity="${(t * 0.6).toFixed(2)}"/>`).join('')}`;
        if (k > 0) b += `<rect x="${x + 4}" y="${y + 11}" width="${42 * k}" height="7" rx="3" fill="#7FB069"/><rect x="${x + 4}" y="${y + 18}" width="${42 * k}" height="3" rx="1.5" fill="#FFF3C4"/>`;
        if (h.cut) b += `<path d="M${x + 25} ${y - 2}v32" stroke="#fff" stroke-width="3"/>`;
        void i;
      });
      if (h.eggs) b += `${sauceDish(170, 66, '#FFF8EC')}<ellipse cx="164" cy="64" rx="5" ry="3.2" fill="#FFC24A"/><ellipse cx="176" cy="65" rx="5" ry="3.2" fill="#FFC24A"/>`;
      if (h.soy) b += '<path d="M158 66c4-2 8 1 12-1s8 2 12 0" stroke="#4A3326" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    } else if (id === 'kachang') {
      b = BOWL('#B9A6E0', '#8E78C9');
      const a = amt(h.ice);
      if (a > 0) {
        const s = 0.3 + a * 0.7;
        const L = 100 - 70 * s, R = 100 + 70 * s, T = 76 - 70 * s;
        b += `<path d="M${L} 76C${L + 4 * s} ${76 - 52 * s} ${100 - 40 * s} ${T} 100 ${T}S${R - 4 * s} ${76 - 52 * s} ${R} 76Q100 90 ${L} 76z" fill="#FBF9FE" stroke="#DCD4EC" stroke-width="2.5"/><path d="M${100 - 40 * s} ${76 - 30 * s}q${20 * s} ${-26 * s} ${46 * s} ${-30 * s}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>`;
      }
      if (h.red) b += '<path d="M56 50c14-10 28-4 44-12s28 2 44 0" stroke="#F26B8A" stroke-width="9" fill="none" stroke-linecap="round"/>';
      if (h.green) b += '<path d="M44 64c16-6 30 0 50-5s34 1 60-1" stroke="#7CC26A" stroke-width="8" fill="none" stroke-linecap="round"/>';
      if (h.corn) b += [[80, 34], [92, 28], [112, 32], [124, 40], [70, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="#FFD23F" stroke="#D9A21E" stroke-width="1.4"/>`).join('');
      if (h.beans) b += [[100, 22], [88, 40], [116, 46], [130, 30], [74, 54]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.6" fill="#8E2F2A"/>`).join('');
    } else if (id === 'milo') {
      // a glass mug: powder, then hot water, then stirred, then ice
      const p = amt(h.powder), w = amt(h.water), st = amt(h.stir);
      b = '<ellipse cx="100" cy="132" rx="40" ry="6" fill="#6B4A3A" opacity=".14"/><path d="M152 60c16 0 22 10 22 22s-8 22-24 22" stroke="#DCE6EE" stroke-width="9" fill="none"/>';
      const lvl = Math.max(p * 0.12, w * 0.8);
      if (lvl > 0) {
        const top = 126 - lvl * 92;
        const half = (y) => 34 - 6 * ((126 - y) / 92);
        const col = w > 0 ? (st >= 1 ? '#8A5A3C' : `rgb(${Math.round(176 - 38 * st)},${Math.round(130 - 40 * st)},${Math.round(92 - 32 * st)})`) : '#5E3A22';
        b += `<path d="M${100 - half(top)} ${top}H${100 + half(top)}L${100 + 28} 124q0 4-4 4H${76}q-4 0-4-4z" fill="${col}"/>`;
        if (w > 0 && st < 1) b += [[88, top + 6], [108, top + 14], [96, top + 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${4 - st * 3}" fill="#5E3A22" opacity="${(1 - st).toFixed(2)}"/>`).join('');
        if (st >= 1) b += `<ellipse cx="100" cy="${top + 1}" rx="${half(top) - 2}" ry="4" fill="#B88A64"/>`;
      }
      if (h.ice) b += [[86, 44], [102, 40], [114, 48]].map(([x, y]) => `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="3" fill="#E8F4FC" stroke="#9CC5E0" stroke-width="2" opacity=".95"/>`).join('');
      b += '<path d="M60 30h80l-10 96q-1 6-7 6H77q-6 0-7-6z" fill="#EEF6FA" opacity=".35" stroke="#BCD0DE" stroke-width="4" stroke-linejoin="round"/><path d="M70 40l8 80" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>';
    }
    return `<svg viewBox="0 0 200 140" width="100%" height="100%" aria-hidden="true">${b}</svg>`;
  }
  // a finished dish in its takeaway box (or cup), lid on or off
  function packSvg(id, lid) {
    const drink = DRINK[id];
    if (drink) {
      return `<svg viewBox="0 0 120 140" width="100%" height="100%" aria-hidden="true"><ellipse cx="60" cy="132" rx="34" ry="5" fill="#6B4A3A" opacity=".14"/>
        <path d="M22 40h76l-8 88q-1 6-7 6H37q-6 0-7-6z" fill="${id === 'milo' ? '#8A5A3C' : '#F7F4FB'}" stroke="#BCD0DE" stroke-width="4" stroke-linejoin="round"/>
        ${id === 'kachang' ? '<path d="M30 62c12-6 24 0 30-4s18 2 30-1" stroke="#F26B8A" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M30 80c12-4 26 2 34-2s16 0 26-2" stroke="#7CC26A" stroke-width="6" fill="none" stroke-linecap="round"/>' : ''}
        <path d="M32 54l6 70" stroke="#fff" stroke-width="5" opacity=".5" stroke-linecap="round"/>
        ${lid ? '<path d="M18 40c0-16 18-24 42-24s42 8 42 24z" fill="#F2F7FA" stroke="#BCD0DE" stroke-width="4" opacity=".95"/><rect x="16" y="36" width="88" height="8" rx="4" fill="#DCE6EE"/>' : ''}</svg>`;
    }
    const peek = DISHES.findIndex((d) => d.id === id);
    const fills = ['#FFFDF5', '#DDA64E', '#F2BE68', '#E9B46A', '#F7F4FB', '#8A5A3C'];
    return `<svg viewBox="0 0 140 120" width="100%" height="100%" aria-hidden="true"><ellipse cx="70" cy="112" rx="58" ry="6" fill="#6B4A3A" opacity=".14"/>
      <path d="M12 46h116l-8 58q-1 6-7 6H27q-6 0-7-6z" fill="#F3E6CF" stroke="#C9A878" stroke-width="4" stroke-linejoin="round"/>
      ${lid ? '<path d="M8 46l10-22h104l10 22z" fill="#F7EEDD" stroke="#C9A878" stroke-width="4" stroke-linejoin="round"/><path d="M40 34h60" stroke="#E2CDA8" stroke-width="4" stroke-linecap="round"/>'
        : `<ellipse cx="70" cy="48" rx="54" ry="10" fill="${fills[peek] || '#FFFDF5'}"/>${id === 'chickenrice' ? '<path d="M82 44l8-10 8 3-6 10z" fill="#FBEFD9" stroke="#D9A86A" stroke-width="2"/>' : ''}${id === 'noodles' ? '<path d="M30 46q8-6 16 0t16 0t16 0t16 0t16 0" stroke="#C98F3A" stroke-width="4" fill="none"/>' : ''}`}</svg>`;
  }
  const BAG = (tied, inside) => `<div class="hk-bag ${tied ? 'tied' : ''}">${inside}<svg class="hk-bag-svg" viewBox="0 0 220 200" preserveAspectRatio="none" aria-hidden="true">
      <path d="M30 60h160l10 124q1 10-9 10H29q-10 0-9-10z" fill="rgba(255,255,255,.55)" stroke="#E7A3B4" stroke-width="5" stroke-linejoin="round"/>
      ${tied ? '<path d="M70 60c0-30 20-40 40-26 20-14 40-4 40 26" fill="none" stroke="#E7A3B4" stroke-width="10" stroke-linecap="round"/><circle cx="110" cy="34" r="12" fill="#F4C6D2" stroke="#E7A3B4" stroke-width="4"/>'
        : '<path d="M60 60c0-40 30-54 50-54s50 14 50 54" fill="none" stroke="#E7A3B4" stroke-width="8"/>'}</svg></div>`;
  const POT = S60('<ellipse cx="30" cy="54" rx="24" ry="4" fill="#6B4A3A" opacity=".15"/><path d="M6 24h48v24a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill="#C9D1D9" stroke="#8A94A0" stroke-width="2.5"/><ellipse cx="30" cy="24" rx="24" ry="7" fill="#FFFDF5" stroke="#8A94A0" stroke-width="2.5"/><path d="M2 30h6M52 30h6" stroke="#8A94A0" stroke-width="4" stroke-linecap="round"/><path d="M36 22 50 4" stroke="#B5814C" stroke-width="4" stroke-linecap="round"/><ellipse cx="34" cy="23" rx="7" ry="3" fill="#E9E1D4" stroke="#8A94A0" stroke-width="2"/>');
  const TIN = S60('<rect x="14" y="10" width="32" height="44" rx="5" fill="#2E8B3E" stroke="#1F5E2A" stroke-width="2.5"/><rect x="14" y="8" width="32" height="7" rx="3" fill="#C9D1D9" stroke="#8A94A0" stroke-width="2"/><rect x="18" y="24" width="24" height="14" rx="3" fill="#fff"/><path d="M22 31h16" stroke="#2E8B3E" stroke-width="4" stroke-linecap="round"/>');
  const KETTLE = S60('<path d="M14 26h32l2 24a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z" fill="#DDE3E9" stroke="#8A94A0" stroke-width="2.5"/><path d="M46 32l10-6" stroke="#8A94A0" stroke-width="4" stroke-linecap="round"/><path d="M18 26c0-10 6-14 12-14s12 4 12 14" fill="none" stroke="#8A94A0" stroke-width="3"/><path d="M24 8c-2 4 2 6 0 10M32 6c-2 4 2 6 0 10" stroke="#C9D1D9" stroke-width="2" fill="none" stroke-linecap="round"/>');
  const BAGSRC = S60('<path d="M10 22h40l4 32H6z" fill="#FBE4EA" stroke="#E7A3B4" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 22c0-12 4-16 10-16s10 4 10 16" fill="none" stroke="#E7A3B4" stroke-width="3"/>');
  const SRC = { rice: ['Rice pot', POT], tin: ['Milo tin', TIN], kettle: ['Hot water', KETTLE], bag: ['Bag', BAGSRC] };

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
  const CARD_ART = sv('0 0 48 48', `<rect x="4" y="10" width="40" height="28" rx="5" fill="#9B87D9" ${K}/><rect x="4" y="16" width="40" height="5" fill="#3B2F2F"/><rect x="9" y="27" width="12" height="6" rx="1.6" fill="#FFD23F"/><path d="M28 30h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`);
  const READER_ART = sv('0 0 48 48', `<rect x="10" y="4" width="28" height="40" rx="6" fill="#5B6B7A" ${K}/><rect x="14" y="9" width="20" height="12" rx="2" fill="#BFE6C8"/><path d="M20 30q4-4 8 0M18 34q6-6 12 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
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
  A.hawkerTest = { startCook, recipe }; // for the automatic checks

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
          <span class="hk-rubart">${rubSvg(st.look, c.p)}</span><span class="hk-tool ${RUB_TOOL[st.look] || 'spoon'}" aria-hidden="true"></span></div>
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
