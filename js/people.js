/*
  people.js
  The people in Lumi's world, drawn as full-body characters in the same soft, rounded, shaded style as
  Lumi (no emoji faces). Used in the stories and wherever a person picture is needed.

  A.person(opts) returns an <svg>. opts:
    who      a ready-made person: mum, dad, grandma, grandpa, helper, teacher, dentist, doctor, nurse,
             hairdresser, uncle (hawker), aunty (hawker), cashier, staff (MRT), supervisor (café),
             pharmacist, customer, man, woman, girl, boy, baby, friend
    h        height in px (width is half of it) or '1em'
    pose     'stand' | 'wave' | 'point' | 'hold' | 'sit' | 'give' (holds an item out to the right)
    mood     'happy' | 'smile' | 'talk' | 'calm' | 'surprised' | 'sad'
    item     something in the hand: scissors, book, tray, clipboard, mirror, toothbrush, ladle, card,
             phone, present, menu, bag, ticket, cup, plate, pills, comb, dryer
    flip     true to face the other way
    crop     'bust' (head and shoulders, for small pictures) | 'head'
    any of skin, hair, hairColour, top, bottom, shoes, coat, apron, skirt, glasses, hat, mask to override
  Also A.PEOPLE (the presets) and A.personSize(h) helpers.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const LP = window.LP;
  const INK = '#3B2F2F';
  const SKIN = { light: '#FBDDC3', fair: '#F3C9A3', tan: '#DDA77B', brown: '#B97C54', deep: '#8C5A3B' };
  const vol = (m, c, o) => LP.vol(m, c, Object.assign({ lineOpacity: 0.5, lineWidth: 2.2 }, o || {}));
  const dark = (hex, f) => { const n = parseInt(hex.slice(1), 16); const k = (v) => Math.max(0, Math.min(255, Math.round(v * (f || 0.8)))); return `rgb(${k(n >> 16)},${k((n >> 8) & 255)},${k(n & 255)})`; };

  const PEOPLE = {
    mum: { skin: 'fair', hair: 'bob', hairColour: '#2B2730', top: '#E58BA6', bottom: '#4A5A7A', shoes: '#7A4E3A' },
    dad: { skin: 'tan', hair: 'short', hairColour: '#222026', top: '#5B8FD9', bottom: '#3B3F4A', shoes: '#4A3A30', collar: true },
    grandma: { skin: 'light', hair: 'bun', hairColour: '#CFCFD4', top: '#9B87D9', bottom: '#6B5A8A', shoes: '#5A4A3A', glasses: true },
    grandpa: { skin: 'tan', hair: 'bald', hairColour: '#E0E0E0', top: '#7FB069', bottom: '#5A5A60', shoes: '#4A3A30', glasses: true, collar: true },
    helper: { skin: 'brown', hair: 'pony', hairColour: '#1F1B1F', top: '#F4A259', bottom: '#3E5463', shoes: '#4A3A30' },
    teacher: { skin: 'fair', hair: 'long', hairColour: '#2B2730', top: '#FFFFFF', coat: '#6FC2B5', skirt: '#3E5463', shoes: '#5A3A30', lanyard: '#E5534B', name: 'Ms Tan' },
    dentist: { skin: 'brown', hair: 'short', hairColour: '#1F1B1F', top: '#4FB3A9', coat: '#FFFFFF', bottom: '#4FB3A9', shoes: '#F2F2F2', mask: 'chin', gloves: '#8EC5F2' },
    doctor: { skin: 'fair', hair: 'pony', hairColour: '#3A2A22', top: '#8EB8E5', coat: '#FFFFFF', bottom: '#5A6A80', shoes: '#4A3A30', stetho: true },
    nurse: { skin: 'tan', hair: 'bun', hairColour: '#1F1B1F', top: '#8EC0DC', bottom: '#8EC0DC', shoes: '#F2F2F2', badge: true },
    hairdresser: { skin: 'tan', hair: 'curly', hairColour: '#5A3A2A', top: '#F2A7BE', apron: '#2F2F38', bottom: '#2F2F38', shoes: '#2F2F38' },
    uncle: { skin: 'tan', hair: 'short', hairColour: '#8E8E94', top: '#FFFFFF', apron: '#3F70B5', bottom: '#4A4F5A', shoes: '#3A3A3A', towel: true },
    aunty: { skin: 'fair', hair: 'bun', hairColour: '#1F1B1F', top: '#F4A259', apron: '#C2577A', bottom: '#4A4F5A', shoes: '#3A3A3A' },
    cashier: { skin: 'brown', hair: 'pony', hairColour: '#1F1B1F', top: '#E0913E', bottom: '#3B3F4A', shoes: '#3A3A3A', badge: true, collar: true },
    staff: { skin: 'deep', hair: 'short', hairColour: '#141214', top: '#2E4A7A', bottom: '#22344F', shoes: '#1F1F1F', hat: 'cap', hatColour: '#2E4A7A', badge: true, collar: true },
    supervisor: { skin: 'fair', hair: 'short', hairColour: '#2B2730', top: '#FFFFFF', apron: '#6B4A3A', bottom: '#3B3F4A', shoes: '#3A3A3A', hat: 'cap', hatColour: '#6B4A3A', badge: true },
    pharmacist: { skin: 'light', hair: 'bob', hairColour: '#3A2A22', top: '#C9E4F5', coat: '#FFFFFF', bottom: '#5A6A80', shoes: '#4A3A30', glasses: true, badge: true },
    customer: { skin: 'tan', hair: 'short', hairColour: '#3A2A22', top: '#9CCB7A', bottom: '#4A5A7A', shoes: '#4A3A30' },
    man: { skin: 'brown', hair: 'short', hairColour: '#1F1B1F', top: '#EF8A7A', bottom: '#3B3F4A', shoes: '#4A3A30' },
    woman: { skin: 'light', hair: 'long', hairColour: '#5A3A2A', top: '#8EC0DC', skirt: '#C2577A', shoes: '#7A4E3A' },
    girl: { skin: 'fair', hair: 'pigtails', hairColour: '#2B2730', top: '#F7B6CD', skirt: '#7E64C8', shoes: '#E5534B', kid: true },
    boy: { skin: 'tan', hair: 'spiky', hairColour: '#1F1B1F', top: '#FFD23F', bottom: '#4A78A8', shoes: '#3A3A3A', kid: true },
    friend: { skin: 'brown', hair: 'curly', hairColour: '#1F1B1F', top: '#7FC4B8', bottom: '#5B5BA8', shoes: '#F4A259', kid: true },
    baby: { skin: 'light', hair: 'tuft', hairColour: '#6B4A3A', top: '#FFE6A8', bottom: '#FFE6A8', shoes: '#FFE6A8', kid: true, baby: true }
  };

  // ---------------------------------------------------------------- parts (viewBox 0 0 200 400, feet at 390)
  function hairBack(o) {
    const c = o.hairColour;
    switch (o.hair) {
      case 'long': return vol('<path d="M44 92c0-44 26-66 56-66s56 22 56 66v92c0 10-10 14-18 10l-6-50H68l-6 50c-8 4-18 0-18-10z"/>', c);
      case 'bob': return vol('<path d="M42 96c0-46 26-68 58-68s58 22 58 68v40c0 12-12 16-20 10l-6-24H68l-6 24c-8 6-20 2-20-10z"/>', c);
      case 'pigtails': return vol('<ellipse cx="36" cy="112" rx="18" ry="26"/><ellipse cx="164" cy="112" rx="18" ry="26"/>', c);
      case 'pony': return vol('<path d="M140 70c30 8 34 50 20 78-4 8-14 6-14-2 4-24 2-46-10-62z"/>', c);
      default: return '';
    }
  }
  function hairFront(o) {
    const c = o.hairColour;
    switch (o.hair) {
      case 'short': return vol('<path d="M42 92c-2-40 24-62 58-62s60 22 58 62c-8-14-22-22-38-24-6 10-22 16-40 14-14 0-26 4-38 10z"/>', c);
      case 'spiky': return vol('<path d="M44 94c-6-30 8-56 30-62l6-12 12 10 10-14 10 14 14-8 2 14c22 10 30 32 26 58-8-14-24-22-42-22-20 0-44 6-68 22z"/>', c);
      case 'curly': return vol(`${[[56, 64], [72, 46], [94, 38], [118, 42], [140, 54], [152, 76], [48, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="18"/>`).join('')}`, c);
      case 'bun': return vol('<circle cx="100" cy="30" r="20"/><path d="M42 96c-2-42 24-64 58-64s60 22 58 64c-10-18-30-30-58-30s-48 12-58 30z"/>', c);
      case 'bob': return vol('<path d="M42 98c-2-44 24-68 58-68s60 24 58 68c-14-10-28-30-30-46-10 14-34 26-58 28-10 2-20 8-28 18z"/>', c);
      case 'long': return vol('<path d="M44 96c-2-42 24-66 56-66s58 24 56 66c-10-16-26-38-28-50-14 18-40 28-62 30-8 2-16 10-22 20z"/>', c);
      case 'pony': return vol('<path d="M42 96c-2-42 24-66 58-66s60 24 58 66c-12-18-32-32-58-34-26 2-46 16-58 34z"/>', c);
      case 'pigtails': return vol('<path d="M42 96c-2-42 24-66 58-66s60 24 58 66c-12-16-30-30-58-30s-46 14-58 30z"/>', c);
      case 'bald': return vol('<path d="M44 108c-6-12-4-26 4-30 2 12 4 22 6 32zM156 108c6-12 4-26-4-30-2 12-4 22-6 32z"/>', c);
      case 'tuft': return vol('<path d="M92 40c2-14 14-18 20-10-8 0-10 6-8 12z"/>', c);
      default: return '';
    }
  }
  function face(o) {
    const m = o.mood || 'happy';
    const eyeY = 100;
    let eyes;
    if (m === 'calm') eyes = `${LP.line('M70 101 q8 6 16 0', INK, 4)}${LP.line('M114 101 q8 6 16 0', INK, 4)}`;
    else eyes = `<ellipse cx="78" cy="${eyeY}" rx="7" ry="${m === 'surprised' ? 9 : 8}" fill="${INK}"/><ellipse cx="122" cy="${eyeY}" rx="7" ry="${m === 'surprised' ? 9 : 8}" fill="${INK}"/><circle cx="80.5" cy="${eyeY - 3}" r="2.6" fill="#fff"/><circle cx="124.5" cy="${eyeY - 3}" r="2.6" fill="#fff"/>`;
    const brows = m === 'sad' ? `${LP.line('M66 84 l18 4', dark(o.hairColour, 0.9), 3.4)}${LP.line('M134 84 l-18 4', dark(o.hairColour, 0.9), 3.4)}` : `${LP.line('M66 86 q11 -6 22 -1', dark(o.hairColour, 0.9), 3.4)}${LP.line('M112 85 q11 -5 22 1', dark(o.hairColour, 0.9), 3.4)}`;
    let mouth;
    if (m === 'talk') mouth = `<path d="M88 124 q12 16 24 0 q-12 4 -24 0z" fill="#9A3E44" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M93 130 q7 5 14 0" fill="#E5737A"/>`;
    else if (m === 'surprised') mouth = `<ellipse cx="100" cy="128" rx="7" ry="9" fill="#9A3E44" stroke="${INK}" stroke-width="2.4"/>`;
    else if (m === 'sad') mouth = LP.line('M88 132 q12 -10 24 0', INK, 3.6);
    else if (m === 'smile' || m === 'calm') mouth = LP.line('M88 124 q12 10 24 0', INK, 3.6);
    else mouth = `<path d="M86 122 q14 18 28 0z" fill="#9A3E44" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M92 128 q8 6 16 0" fill="#E5737A"/>`;
    const nose = `<path d="M98 110 q4 4 0 8" fill="none" stroke="${dark(SKIN[o.skin] || o.skin, 0.78)}" stroke-width="2.6" stroke-linecap="round"/>`;
    const glasses = o.glasses ? `<g fill="none" stroke="${INK}" stroke-width="3"><circle cx="78" cy="100" r="15"/><circle cx="122" cy="100" r="15"/><path d="M93 99h14"/></g><g fill="#fff" opacity=".25"><circle cx="78" cy="100" r="13"/><circle cx="122" cy="100" r="13"/></g>` : '';
    return `<ellipse cx="66" cy="118" rx="10" ry="6" fill="#F08A80" opacity=".45"/><ellipse cx="134" cy="118" rx="10" ry="6" fill="#F08A80" opacity=".45"/>${brows}${eyes}${nose}${mouth}${glasses}`;
  }
  function head(o, skin) {
    const ears = vol('<ellipse cx="42" cy="104" rx="10" ry="14"/><ellipse cx="158" cy="104" rx="10" ry="14"/>', skin);
    const h = vol('<ellipse cx="100" cy="98" rx="58" ry="62"/>', skin);
    let mask = '';
    if (o.mask === 'chin') mask = vol('<path d="M70 134c10 10 50 10 60 0l4 14c-16 14-52 14-68 0z"/>', '#9FD3EE', { lineOpacity: 0.35 }) + `<path d="M70 136l-28-30M130 136l28-30" stroke="#E8F2F8" stroke-width="2.4"/>`;
    if (o.mask === 'on') mask = vol('<path d="M64 112c20 -6 52 -6 72 0l-2 26c-10 16-58 16-68 0z"/>', '#9FD3EE', { lineOpacity: 0.35 });
    let hat = '';
    if (o.hat === 'cap') hat = vol(`<path d="M44 76c4-36 30-52 56-52s52 16 56 52z"/><path d="M110 76c22-2 46 2 62 10-14 6-40 6-62 2z"/>`, o.hatColour || '#2E4A7A');
    if (o.hat === 'chef') hat = vol('<path d="M56 64c-14-10-8-36 12-32 4-18 28-22 36-6 10-14 36-8 34 10 20 0 22 26 6 30v8H56z"/>', '#FFFFFF');
    return `${ears}${h}${face(o)}${hairFront(o)}${mask}${hat}`;
  }
  // an arm from the shoulder (x, y) along a curve to the hand
  function arm(d, sleeve, skin, hand, gloves) {
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="31" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${sleeve}" stroke-width="26" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="url(#lpShadeH)" stroke-width="26" stroke-linecap="round" opacity=".7"/>${vol(`<circle cx="${hand[0]}" cy="${hand[1]}" r="13"/>`, gloves || skin)}`;
  }
  const ARMS = {
    stand: { L: ['M58 172 Q40 222 50 262', [50, 266]], R: ['M142 172 Q160 222 150 262', [150, 266]] },
    wave: { L: ['M58 172 Q40 222 50 262', [50, 266]], R: ['M142 172 Q184 146 180 96', [180, 90]] },
    point: { L: ['M58 172 Q40 222 50 262', [50, 266]], R: ['M142 172 Q186 186 214 176', [218, 175]] },
    hold: { L: ['M58 172 Q46 222 84 232', [86, 232]], R: ['M142 172 Q154 222 116 232', [114, 232]] },
    give: { L: ['M58 172 Q40 222 50 262', [50, 266]], R: ['M142 172 Q172 214 206 214', [210, 214]] },
    sit: { L: ['M58 172 Q44 220 70 246', [72, 248]], R: ['M142 172 Q156 220 130 246', [128, 248]] }
  };
  function item(name, x, y) {
    const g = (s) => `<g transform="translate(${x} ${y})">${s}</g>`;
    switch (name) {
      case 'scissors': return g(`${vol('<circle cx="-10" cy="10" r="8"/><circle cx="10" cy="10" r="8"/>', '#E5534B')}<path d="M-6 4 L8 -30 M6 4 L-8 -30" stroke="url(#lpMetal)" stroke-width="6" stroke-linecap="round"/><path d="M-6 4 L8 -30 M6 4 L-8 -30" stroke="${INK}" stroke-opacity=".4" stroke-width="1.4" fill="none"/>`);
      case 'comb': return g(vol('<rect x="-24" y="-6" width="48" height="10" rx="4"/>', '#2F2F38') + `<path d="M-20 4v10M-12 4v10M-4 4v10M4 4v10M12 4v10M20 4v10" stroke="#2F2F38" stroke-width="3"/>`);
      case 'dryer': return g(vol('<path d="M-30 -18h44a14 14 0 0 1 0 28h-44z"/><rect x="-12" y="8" width="14" height="30" rx="5"/>', '#7E64C8'));
      case 'book': return g(vol('<rect x="-26" y="-20" width="52" height="38" rx="4"/>', '#E5534B') + '<rect x="-22" y="-16" width="44" height="6" rx="2" fill="#fff" opacity=".6"/>');
      case 'clipboard': return g(vol('<rect x="-22" y="-30" width="44" height="58" rx="5"/>', '#C99A6B') + vol('<rect x="-16" y="-22" width="32" height="44" rx="2"/>', '#FFFFFF', { lineOpacity: 0.25 }) + vol('<rect x="-10" y="-34" width="20" height="10" rx="3"/>', '#9AA6B2'));
      case 'mirror': return g(vol('<rect x="-5" y="4" width="10" height="34" rx="4"/>', '#C99A6B') + vol('<circle cx="0" cy="-12" r="20"/>', '#CFE6F5') + '<path d="M-10 -20 l8 -6" stroke="#fff" stroke-width="4" stroke-linecap="round"/>');
      case 'toothbrush': return g(vol('<rect x="-4" y="-30" width="8" height="54" rx="4"/>', '#4FB3A9') + vol('<rect x="-6" y="-42" width="12" height="14" rx="3"/>', '#FFFFFF'));
      case 'ladle': return g(`<path d="M0 22 L0 -26" stroke="url(#lpMetal)" stroke-width="7" stroke-linecap="round"/>${vol('<path d="M-16 -26a16 12 0 0 0 32 0z"/>', '#C9D1D9')}`);
      case 'card': return g(vol('<rect x="-22" y="-14" width="44" height="28" rx="5"/>', '#4A78A8') + '<rect x="-22" y="-6" width="44" height="6" fill="#2B4A7A"/><rect x="8" y="4" width="10" height="6" rx="2" fill="#F4D35E"/>');
      case 'phone': return g(vol('<rect x="-13" y="-24" width="26" height="46" rx="6"/>', '#2B2F4A') + '<rect x="-10" y="-19" width="20" height="34" rx="3" fill="#8EC5F2"/>');
      case 'present': return g(vol('<rect x="-24" y="-18" width="48" height="38" rx="4"/>', '#7E64C8') + '<rect x="-4" y="-18" width="8" height="38" fill="#FFD23F"/>' + vol('<path d="M0 -18c-12-14-24-6-14 2zM0 -18c12-14 24-6 14 2z"/>', '#FFD23F'));
      case 'menu': return g(vol('<rect x="-22" y="-30" width="44" height="58" rx="4"/>', '#FFF4D6') + '<path d="M-14 -18h28M-14 -8h22M-14 2h28M-14 12h18" stroke="#C9A27E" stroke-width="3" stroke-linecap="round"/>');
      case 'bag': return g(vol('<path d="M-22 -14h44l4 36h-52z"/>', '#E58BA6') + '<path d="M-10 -14c0-14 20-14 20 0" fill="none" stroke="#9A4876" stroke-width="4"/>');
      case 'ticket': return g(vol('<rect x="-18" y="-12" width="36" height="24" rx="3"/>', '#FFF8EC') + '<path d="M-10 -2h20M-10 5h12" stroke="#E5534B" stroke-width="3" stroke-linecap="round"/>');
      case 'cup': return g(vol('<path d="M-14 -16h28l-4 34h-20z"/>', '#FFFFFF') + '<path d="M-13 -8h26" stroke="#C99A6B" stroke-width="5"/>');
      case 'plate': return g(vol('<ellipse cx="0" cy="0" rx="30" ry="12"/>', '#FFFFFF'));
      case 'tray': return g(vol('<path d="M-46 -6h92l-6 16h-80z"/>', '#7FA7C9'));
      case 'pills': return g(vol('<rect x="-16" y="-20" width="32" height="40" rx="6"/>', '#FFFFFF') + vol('<rect x="-16" y="-28" width="32" height="10" rx="3"/>', '#E5534B') + '<rect x="-10" y="-6" width="20" height="12" rx="2" fill="#8EC5F2"/>');
      default: return '';
    }
  }
  function bodyParts(o, skin) {
    const pose = ARMS[o.pose] ? o.pose : 'stand';
    const sit = pose === 'sit';
    const kid = o.kid;
    const top = o.top || '#9CCB7A';
    const sleeve = o.coat || top;
    // legs and shoes
    const legC = o.skirt ? skin : o.bottom || '#4A5A7A';
    const legs = sit
      ? vol('<rect x="64" y="268" width="32" height="56" rx="14"/><rect x="104" y="268" width="32" height="56" rx="14"/>', legC) + vol('<ellipse cx="78" cy="328" rx="22" ry="12"/><ellipse cx="122" cy="328" rx="22" ry="12"/>', o.shoes || '#4A3A30')
      : vol('<rect x="66" y="262" width="30" height="118" rx="13"/><rect x="104" y="262" width="30" height="118" rx="13"/>', legC) + vol('<ellipse cx="78" cy="384" rx="24" ry="12"/><ellipse cx="122" cy="384" rx="24" ry="12"/>', o.shoes || '#4A3A30');
    const skirt = o.skirt ? vol('<path d="M56 250h88l18 66c-30 10-94 10-124 0z"/>', o.skirt) : '';
    // torso
    const torso = vol('<path d="M56 186c0-24 18-40 44-40s44 16 44 40v84c0 8-6 12-12 12H68c-6 0-12-4-12-12z"/>', top);
    let over = '';
    if (o.coat) over += vol('<path d="M56 186c0-24 18-40 44-40l-14 136H68c-6 0-12-4-12-12zM144 186c0-24-18-40-44-40l14 136h18c6 0 12-4 12-12z"/>', o.coat) + `<path d="M86 160l14 22 14-22" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="2.4"/>`;
    if (o.apron) over += vol('<path d="M70 168h60v104c0 6-4 10-10 10H80c-6 0-10-4-10-10z"/>', o.apron) + `<path d="M74 168l-12-20M126 168l12-20" stroke="${o.apron}" stroke-width="6" stroke-linecap="round"/><rect x="84" y="214" width="32" height="20" rx="4" fill="#fff" opacity=".18"/>`;
    if (o.collar) over += vol('<path d="M80 150l20 18 20-18 6 12-26 16-26-16z"/>', '#FFFFFF', { lineOpacity: 0.3 });
    if (o.lanyard) over += `<path d="M82 152 L100 214 L118 152" fill="none" stroke="${o.lanyard}" stroke-width="5"/>${vol('<rect x="88" y="210" width="24" height="30" rx="4"/>', '#FFFFFF', { lineOpacity: 0.4 })}`;
    if (o.badge) over += vol('<rect x="112" y="186" width="22" height="12" rx="3"/>', '#FFFFFF', { lineOpacity: 0.4 });
    if (o.stetho) over += `<path d="M84 152 q-10 50 16 56 q26 -6 16 -56" fill="none" stroke="#3E5463" stroke-width="5"/>${vol('<circle cx="100" cy="210" r="8"/>', '#C9D1D9')}`;
    if (o.towel) over += vol('<path d="M120 150c12 0 22 8 24 20l-6 30c-6 0-12-4-14-10z"/>', '#FFFFFF', { lineOpacity: 0.35 });
    const a = ARMS[pose];
    const arms = `${arm(a.L[0], sleeve, skin, a.L[1], o.gloves)}${arm(a.R[0], sleeve, skin, a.R[1], o.gloves)}`;
    const hold = o.item ? (pose === 'hold' ? item(o.item, 100, 226) : item(o.item, a.R[1][0], a.R[1][1] - 6)) : '';
    const neck = vol('<rect x="88" y="140" width="24" height="20" rx="8"/>', skin);
    const ground = LP.drop(100, sit ? 334 : 388, 70, 12);
    void kid;
    return { ground, legs, skirt, neck, torso, over, arms, hold };
  }

  function person(opts) {
    const base = PEOPLE[opts && opts.who] || PEOPLE.customer;
    const o = Object.assign({}, base, opts || {});
    const skin = SKIN[o.skin] || o.skin || SKIN.fair;
    const p = bodyParts(o, skin);
    // kids: a bigger head on a shorter body
    const kidT = o.kid ? (o.baby ? 'translate(100 390) scale(0.86 0.62) translate(-100 -390)' : 'translate(100 390) scale(0.92 0.78) translate(-100 -390)') : '';
    const headT = o.kid ? (o.baby ? 'translate(100 390) scale(0.9) translate(-100 -390) translate(0 70)' : 'translate(100 390) scale(0.92) translate(-100 -390) translate(0 44)') : '';
    const inner = `${p.ground}<g transform="${kidT}">${p.legs}${p.skirt}${p.torso}${p.over}${p.neck}</g>
      <g transform="${headT}">${hairBack(o)}${head(o, skin)}</g><g transform="${kidT}">${p.arms}${p.hold}</g>`;
    const flip = o.flip ? '<g transform="translate(200 0) scale(-1 1)">' : '<g>';
    const crop = o.crop === 'head' ? '30 22 140 150' : o.crop === 'bust' ? '8 22 184 184' : '-20 0 240 400';
    const [, , vw, vh] = crop.split(' ').map(Number);
    const h = o.h == null ? 240 : o.h;
    const w = h === '1em' ? '1em' : Math.round((h * vw) / vh);
    const label = o.label || o.name || (opts && opts.who) || 'person';
    return `<svg class="person ${o.cls || ''}" viewBox="${crop}" width="${w}" height="${h}" overflow="${o.crop ? 'hidden' : 'visible'}" role="img" aria-label="${label}">${flip}${inner}</g></svg>`;
  }
  A.person = person;
  A.PEOPLE = PEOPLE;
  A.SKIN = SKIN;
  window.lumiPerson = person;

  // person pictures in place of person emoji (talk board, partners, stories)
  const bust = (who, label, extra) => ({ label, fn: (size, cls) => person(Object.assign({ who, crop: 'bust', h: size, label, cls }, extra || {})).replace('class="person', `class="pic person ${cls || ''}`) });
  LP.add(['🧑', '🙋'], bust('customer', 'Person'));
  LP.add('👩', bust('mum', 'Mum'));
  LP.add('👨', bust('dad', 'Dad'));
  LP.add('👵', bust('grandma', 'Grandma'));
  LP.add('👴', bust('grandpa', 'Grandpa'));
  LP.add('👶', bust('baby', 'Baby'));
  LP.add(['🧒', '👧'], bust('girl', 'Girl'));
  LP.add('👦', bust('boy', 'Boy'));
  LP.add('🧑‍⚕️', bust('doctor', 'Doctor'));
  LP.add('🧑‍🏫', bust('teacher', 'Teacher'));
  LP.add('🧑‍🍳', bust('supervisor', 'Supervisor', { hat: 'chef' }));
  LP.add('🧑‍🦱', bust('hairdresser', 'Hairdresser'));
  LP.add('🧍', bust('friend', 'Standing'));
  LP.add('👪', { label: 'Family', fn: (size, cls) => `<svg class="pic ${cls || ''}" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="Family">
    ${person({ who: 'dad', crop: 'bust', h: 30 }).replace('<svg', '<svg x="1" y="4"')}${person({ who: 'mum', crop: 'bust', h: 30 }).replace('<svg', '<svg x="22" y="4"')}${person({ who: 'girl', crop: 'bust', h: 24 }).replace('<svg', '<svg x="13" y="22"')}</svg>` });
})();
