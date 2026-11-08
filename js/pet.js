/*
  pet.js
  The Pet corner (like a Tamagotchi). It unlocks when the child buys a pet for Lumi's room.
  The pet slowly gets hungry, bored, messy and sleepy in real time. The child feeds it, plays with it,
  washes it and puts it to bed. It never gets sick and never runs away: it just looks a little sad
  until someone cares for it. The first time each kind of care happens each day earns a star.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, S, state, ic, esc, say, tone, save, award, track, render, go, later, pick } = A;

  const NEEDS = [
    { id: 'food', label: 'Food', icon: 'feed', act: 'Feed', color: '#E0913E', perHour: 6 },
    { id: 'fun', label: 'Fun', icon: 'ball', act: 'Play', color: '#4F8A3F', perHour: 5 },
    { id: 'clean', label: 'Clean', icon: 'soap', act: 'Wash', color: '#4A78A8', perHour: 3 },
    { id: 'rest', label: 'Sleep', icon: 'sleep', act: 'Sleep', color: '#7E64C8', perHour: 4 }
  ];

  function petState(id) {
    let p = state.pets[id];
    if (!p) p = state.pets[id] = { name: '', food: 80, fun: 80, clean: 90, rest: 80, last: Date.now() };
    const hours = (Date.now() - (p.last || Date.now())) / 3600000;
    if (hours > 0.01) {
      NEEDS.forEach((n) => { p[n.id] = Math.max(10, p[n.id] - n.perHour * hours); });
      p.last = Date.now();
      save();
    }
    return p;
  }
  function mood(p) {
    const low = NEEDS.map((n) => [n.id, p[n.id]]).sort((a, b) => a[1] - b[1])[0];
    if (low[1] >= 40) return 'happy';
    return { food: 'hungry', fun: 'bored', clean: 'dirty', rest: 'sleepy' }[low[0]];
  }

  // ---------------------------------------------------------------- pet pictures
  function petSvg(kind, md, size, opts) {
    const o = opts || {};
    const sleepy = md === 'sleepy' || o.asleep;
    const sad = md === 'hungry' || md === 'bored';
    const eyes = sleepy
      ? '<path d="M74 82 q8 6 16 0 M110 82 q8 6 16 0" stroke="#3B2F2F" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : '<circle cx="82" cy="80" r="7" fill="#3B2F2F"/><circle cx="118" cy="80" r="7" fill="#3B2F2F"/><circle cx="84.5" cy="77.5" r="2.2" fill="#fff"/><circle cx="120.5" cy="77.5" r="2.2" fill="#fff"/>';
    const mouth = sad ? '<path d="M88 116 q12 -8 24 0" stroke="#3B2F2F" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : sleepy ? '<ellipse cx="100" cy="114" rx="5" ry="4" fill="#3B2F2F"/>'
        : '<path d="M86 108 q14 14 28 0" stroke="#3B2F2F" stroke-width="4" fill="none" stroke-linecap="round"/>';
    const mud = md === 'dirty' ? '<circle cx="70" cy="150" r="10" fill="#A87B50" opacity=".7"/><circle cx="130" cy="160" r="8" fill="#A87B50" opacity=".7"/><circle cx="120" cy="60" r="7" fill="#A87B50" opacity=".6"/>' : '';
    let body;
    if (kind === 'kitten') {
      body = `<path class="tail" d="M150 160 q40 -10 30 -50 q-4 -14 -14 -6" stroke="#B8B0A5" stroke-width="12" fill="none" stroke-linecap="round"/>
        <ellipse cx="100" cy="150" rx="56" ry="38" fill="#CFC8BE"/>
        <path d="M58 70 L62 22 L92 50 Z M142 70 L138 22 L108 50 Z" fill="#CFC8BE"/><path d="M64 58 L66 34 L84 50 Z M136 58 L134 34 L116 50 Z" fill="#F2A7BE"/>
        <circle cx="100" cy="88" r="48" fill="#CFC8BE"/><ellipse cx="100" cy="104" rx="22" ry="16" fill="#EFEAE3"/>
        ${eyes}<path d="M96 98 h8 l-4 5z" fill="#EF8A7A"/>${mouth}
        <path d="M60 100 h22 M60 108 h22 M118 100 h22 M118 108 h22" stroke="#8A8178" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="78" cy="184" rx="14" ry="8" fill="#B8B0A5"/><ellipse cx="122" cy="184" rx="14" ry="8" fill="#B8B0A5"/>`;
    } else if (kind === 'fishtank') {
      return `<svg class="pet-svg" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="Fish, feeling ${md}">
        <circle cx="100" cy="108" r="84" fill="#DCEEF7" stroke="#8EB8E5" stroke-width="5"/><path d="M22 96 q78 -16 156 0 v40 q-78 80 -156 0z" fill="#8EB8E5" opacity=".55"/>
        <path d="M60 176 q10 -30 0 -50 M140 176 q-6 -26 4 -46" stroke="#7FB069" stroke-width="7" fill="none" stroke-linecap="round"/>
        <g class="fish-swim"><path class="tail" d="M128 112 l26 -18 v38 z" fill="#E0913E"/><ellipse cx="100" cy="112" rx="34" ry="24" fill="#F4A65A"/>
        <path d="M92 90 q8 -12 18 0" fill="#E0913E"/>${sleepy ? '<path d="M80 108 q6 4 12 0" stroke="#3B2F2F" stroke-width="3" fill="none"/>' : '<circle cx="84" cy="106" r="5" fill="#3B2F2F"/><circle cx="85.5" cy="104.5" r="1.6" fill="#fff"/>'}
        ${sad ? '<path d="M72 122 q6 -4 12 0" stroke="#3B2F2F" stroke-width="3" fill="none"/>' : '<path d="M72 118 q6 6 12 0" stroke="#3B2F2F" stroke-width="3" fill="none"/>'}</g>
        <circle cx="70" cy="60" r="6" fill="none" stroke="#fff" stroke-width="3"/><circle cx="84" cy="44" r="4" fill="none" stroke="#fff" stroke-width="3"/>
        ${md === 'dirty' ? '<path d="M30 120 q70 30 140 0 v20 q-70 50 -140 0z" fill="#9CCB7A" opacity=".5"/>' : ''}</svg>`;
    } else {
      body = `<path class="tail" d="M150 150 q34 -20 28 -50" stroke="#A87B50" stroke-width="12" fill="none" stroke-linecap="round"/>
        <ellipse cx="100" cy="150" rx="58" ry="38" fill="#C99A6B"/><ellipse cx="124" cy="146" rx="18" ry="14" fill="#A87B50" opacity=".6"/>
        <circle cx="100" cy="86" r="50" fill="#C99A6B"/>
        <ellipse cx="52" cy="92" rx="16" ry="32" fill="#A87B50" transform="rotate(18 52 92)"/><ellipse cx="148" cy="92" rx="16" ry="32" fill="#A87B50" transform="rotate(-18 148 92)"/>
        <ellipse cx="100" cy="106" rx="26" ry="20" fill="#E8CBA8"/>${eyes}<ellipse cx="100" cy="98" rx="9" ry="7" fill="#3B2F2F"/>${mouth}
        ${!sad && !sleepy ? '<path d="M96 116 q4 12 8 0" fill="#EF8A7A"/>' : ''}
        <ellipse cx="76" cy="184" rx="15" ry="9" fill="#A87B50"/><ellipse cx="124" cy="184" rx="15" ry="9" fill="#A87B50"/>`;
    }
    return `<svg class="pet-svg" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="${kind === 'kitten' ? 'Kitten' : 'Puppy'}, feeling ${md}">${body}${mud}</svg>`;
  }

  // ---------------------------------------------------------------- care rewards: one star per kind of care per day
  function careStar(act) {
    const today = A.dateKey();
    const c = state.petCareDay && state.petCareDay.d === today ? state.petCareDay : (state.petCareDay = { d: today, done: [] });
    state.stats.petCare += 1;
    track('petCare', act);
    if (!c.done.includes(act)) { c.done.push(act); award(1); }
    save();
  }

  // ---------------------------------------------------------------- the screen: real care, with your hands
  // Feed:  drag food into the bowl; the pet trots over and eats (fish: drag food into the tank).
  // Play:  drag the toy and let go to throw it; the pet runs to it and brings it back. Tap the pet to tickle.
  //        (fish: move a finger on the glass and the fish follows it)
  // Wash:  bath time. Rub the soap on the pet, then the shower, then the towel (fish: wipe the glass).
  // Sleep: drag the pet to its bed, tuck the blanket over it, turn off the lamp. Shh, a lullaby.
  const LP = window.LP;
  const vol = (m, c, o) => LP.vol(m, c, o);
  const pic = (e, size) => (window.lumiPic && window.lumiPic(e, size)) || `<span class="emoji" style="font-size:${Math.round(size * 0.8)}px">${e}</span>`;
  const PET_W = 280;
  const HOME_X = 62; // where the pet stands (% of the room, its middle)
  const EAT_X = 37; // next to the bowl
  const BED_X = 22; // on its bed
  const isFish = (id) => id === 'fishtank';
  const care = () => S.care || (S.care = { mode: null });
  const petX = () => (S.petX == null ? HOME_X : S.petX);
  const resetCare = (mode) => { S.care = { mode: mode || null, phase: 'soap', p: 0, step: 0 }; S.petX = HOME_X; S.petFromX = null; S.petAnim = null; };

  // things in the room, drawn in the same soft style
  const bowlSvg = () => `<svg viewBox="0 0 160 90" width="100%" height="100%" overflow="visible" aria-hidden="true">${LP.drop(80, 86, 70, 6)}${vol('<path d="M8 30 h144 q-8 52 -72 52 q-64 0 -72 -52z"/>', '#E07A5F')}${vol('<ellipse cx="80" cy="30" rx="72" ry="12"/>', '#F2A08A', { lineOpacity: 0.3 })}<ellipse cx="80" cy="31" rx="60" ry="8" fill="#B5503A" opacity=".45"/></svg>`;
  const bedSvg = () => `<svg viewBox="0 0 280 120" width="100%" height="100%" overflow="visible" aria-hidden="true">${LP.drop(140, 114, 130, 8)}${vol('<path d="M10 50 q0 -40 40 -40 h180 q40 0 40 40 v40 q0 22 -22 22 h-216 q-22 0 -22 -22z"/>', '#9B87D9')}${vol('<ellipse cx="140" cy="62" rx="108" ry="30"/>', '#D9CFF2', { lineOpacity: 0.3 })}</svg>`;
  const blanketSvg = () => `<svg viewBox="0 0 200 110" width="100%" height="100%" overflow="visible" aria-hidden="true">${LP.drop(100, 104, 90, 6)}${vol('<path d="M8 20 q92 -26 184 0 v66 q-92 26 -184 0z"/>', '#8EC5F2')}${[40, 80, 120, 160].map((x) => `<circle cx="${x}" cy="54" r="7" fill="#fff" opacity=".7"/>`).join('')}<path d="M8 30 q92 -24 184 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/></svg>`;
  const lampSvg = (on) => `<svg viewBox="0 0 90 220" width="100%" height="100%" overflow="visible" aria-hidden="true">${on ? '<ellipse cx="45" cy="80" rx="70" ry="60" fill="url(#lpGlow)" opacity=".9"/>' : ''}${LP.drop(45, 214, 34, 4)}<path d="M45 70 v136" stroke="#7A5434" stroke-width="7"/>${vol('<ellipse cx="45" cy="208" rx="30" ry="8"/>', '#7A5434')}${vol('<path d="M16 70 l12 -50 h34 l12 50z"/>', on ? '#F4D35E' : '#9C8F7A')}</svg>`;
  const tubSvg = () => `<svg viewBox="0 0 320 150" width="100%" height="100%" overflow="visible" aria-hidden="true">${LP.drop(160, 146, 150, 8)}${vol('<path d="M10 30 h300 q-10 100 -60 108 h-180 q-50 -8 -60 -108z"/>', '#FFFFFF', { shade: 'h' })}${vol('<rect x="2" y="22" width="316" height="18" rx="9"/>', '#DCEEF7')}<path d="M70 138 l-10 12 M250 138 l10 12" stroke="#9AA6B2" stroke-width="8" stroke-linecap="round"/>${[60, 120, 190, 250].map((x, i) => `<circle cx="${x}" cy="${26 - (i % 2) * 8}" r="${12 + (i % 2) * 5}" fill="#fff" stroke="#DCEEF7" stroke-width="2"/>`).join('')}</svg>`;
  const TOOLS = {
    soap: () => `<svg viewBox="0 0 90 70" width="100%" height="100%" aria-hidden="true">${LP.drop(45, 66, 36, 4)}${vol('<rect x="8" y="14" width="74" height="46" rx="18"/>', '#F2A7BE')}<circle cx="70" cy="12" r="8" fill="#fff" stroke="#DCEEF7" stroke-width="2"/><circle cx="58" cy="6" r="5" fill="#fff" stroke="#DCEEF7" stroke-width="2"/></svg>`,
    shower: () => `<svg viewBox="0 0 90 90" width="100%" height="100%" aria-hidden="true">${LP.drop(45, 86, 30, 4)}<path d="M20 80 q0 -40 30 -50" stroke="#9AA6B2" stroke-width="10" fill="none" stroke-linecap="round"/>${vol('<path d="M40 22 l38 -12 l6 24 l-36 14z"/>', '#C9D1D9')}${[0, 1, 2].map((i) => `<path d="M${54 + i * 9} ${44 + i * 2} l-4 16" stroke="#8EC5F2" stroke-width="4" stroke-linecap="round"/>`).join('')}</svg>`,
    towel: () => `<svg viewBox="0 0 100 70" width="100%" height="100%" aria-hidden="true">${LP.drop(50, 66, 42, 4)}${vol('<rect x="6" y="10" width="88" height="50" rx="22"/>', '#7FB069')}<path d="M26 14 v42 M74 14 v42" stroke="#fff" stroke-width="4" opacity=".5"/></svg>`,
    sponge: () => `<svg viewBox="0 0 90 70" width="100%" height="100%" aria-hidden="true">${LP.drop(45, 66, 36, 4)}${vol('<rect x="8" y="12" width="74" height="48" rx="12"/>', '#F4C430')}${[[24, 28], [44, 40], [62, 26], [34, 48], [60, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#C99A1E" opacity=".6"/>`).join('')}</svg>`
  };
  const WASH = { soap: { tool: 'soap', need: 1100, tip: (n) => `Rub the soap on ${n}. Make lots of bubbles!` }, rinse: { tool: 'shower', need: 900, tip: (n) => `Now the shower. Rub it over ${n} to wash the bubbles away.` }, dry: { tool: 'towel', need: 800, tip: (n) => `Dry ${n} with the towel. Rub, rub, rub!` } };
  const WASH_ORDER = ['soap', 'rinse', 'dry'];
  // overlays drawn inside the pet's own box (280 x 280)
  const FOAM = [[70, 80], [120, 60], [170, 78], [210, 110], [60, 140], [110, 120], [160, 130], [200, 170], [90, 190], [140, 180], [190, 210], [100, 236], [150, 232], [60, 210]];
  const MUD = [[98, 210], [182, 224], [168, 84], [90, 120]];
  const DROPS = [[80, 70], [200, 90], [60, 160], [220, 170], [120, 230], [170, 250], [140, 50]];

  // what to do now, in a few words (said aloud, and shown under the bars)
  function tipFor(id, p) {
    const c = care();
    const n = p.name;
    if (c.mode === 'food') return isFish(id) ? `Drag some food into the tank for ${n}.` : `Drag some food into the bowl for ${n}.`;
    if (c.mode === 'fun') return isFish(id) ? `Move your finger on the tank. ${n} swims after it!` : `Drag the toy and let go to throw it. Or tap ${n} to tickle!`;
    if (c.mode === 'clean') return isFish(id) ? `Wipe the green off the glass with the sponge.` : c.phase === 'done' ? `${n} is clean and shiny!` : WASH[c.phase].tip(n);
    if (c.mode === 'rest') {
      if (c.step >= 3) return `Shh... ${n} is fast asleep.`;
      if (isFish(id)) return `Tap the lamp to turn off the tank light.`;
      return [`Drag ${n} to the bed.`, `Drag the blanket over ${n}.`, 'Tap the lamp to turn off the light.'][c.step];
    }
    return '';
  }

  A.PARENT.pet = 'fun';
  A.VOICE.pet = () => {
    const id = S.petId;
    if (!id) return '';
    const p = petState(id);
    if (!p.name) return `Your new ${D.PETS[id].name.toLowerCase()}! Pick a name.`;
    if (care().mode) return tipFor(id, p);
    const m = mood(p);
    return { happy: `${p.name} is happy to see you!`, hungry: `${p.name} is hungry. Tap Feed.`, bored: `${p.name} wants to play. Tap Play.`, dirty: `${p.name} is messy. Time for a bath!`, sleepy: `${p.name} is sleepy. Tap Sleep.` }[m];
  };
  A.SCREENS.pet = () => {
    const owned = A.ownedPets();
    if (!S.petId || !owned.includes(S.petId)) S.petId = owned[0];
    const id = S.petId;
    const info = D.PETS[id];
    const p = petState(id);
    const m = mood(p);
    const fish = isFish(id);
    const tabs = owned.length > 1 ? owned.map((k) => `<button class="tab ${k === id ? 'on' : ''}" data-a="petTab" data-v="${k}" aria-pressed="${k === id}">${A.L.item(k, 36)}</button>`).join('') : '';
    const head = `<div class="row between" style="height:60px">
      <div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE.pet())}<div class="row gap8">${tabs}</div></div>
      <span></span></div>`;

    if (!p.name) {
      return `<section class="screen" aria-label="Name your pet">${A.srTitle('Name your pet')}${head}
        <div class="row gap24 grow">
          <div class="panel pet-room grow"><div class="floor" style="height:26%"></div><div class="pet-pos hop">${petSvg(id, 'happy', 320)}</div></div>
          <div class="col gap16" style="width:400px;justify-content:center">
            <div class="label center-text">${ic('heart', 30)} Pick a name</div>
            ${info.names.map((n) => `<button class="name-btn" data-a="petName" data-v="${n}">${n}</button>`).join('')}
          </div>
        </div></section>`;
    }

    const c = care();
    const mode = c.mode;
    const asleep = mode === 'rest' && c.step >= 3;
    const washing = mode === 'clean';
    // the room
    let room = '';
    if (!fish) room += `<div class="pc-bowl ${mode === 'food' ? 'target' : ''}" id="petBowl" role="img" aria-label="Food bowl">${c.bowl ? `<span class="pc-bowl-food">${pic(c.bowl, 64)}</span>` : ''}${bowlSvg()}</div>`;
    if (!fish && (mode === 'rest')) room += `<div class="pc-bed ${c.step === 0 ? 'target' : ''}" id="petBed" role="img" aria-label="Bed">${bedSvg()}</div>`;
    if (mode === 'rest') room += `<button class="pc-lamp ${c.step === 2 || (fish && c.step < 3) ? 'go' : ''}" data-a="petLamp" aria-label="${asleep ? 'Turn the light on' : 'Turn the light off'}">${lampSvg(!asleep)}</button>`;
    if (mode === 'rest' && !fish && c.step === 1) room += `<div class="pc-blanket pc-drag" id="petBlanket" role="img" aria-label="Blanket">${blanketSvg()}</div>`;
    if (mode === 'food') room += `<div class="pc-shelf">${info.foods.map(([e, l]) => `<div class="pc-food pc-drag" data-food="${e}" role="img" aria-label="${esc(l)}"><span class="pc-food-art">${pic(e, 64)}</span><span>${esc(l)}</span></div>`).join('')}</div>`;
    if (mode === 'fun' && !fish && !c.carry) room += `<div class="pc-toy pc-drag" id="petToy" role="img" aria-label="Toy" style="${c.toyX != null ? `left:${c.toyX}%;` : ''}">${pic(info.toy, 74)}</div>`;
    if (washing && !fish && c.phase !== 'done') room += `<div class="pc-tub">${tubSvg()}</div>`;
    if (washing) {
      const tools = fish ? ['sponge'] : WASH_ORDER.map((ph) => WASH[ph].tool);
      const now = fish ? 'sponge' : c.phase !== 'done' ? WASH[c.phase].tool : '';
      room += `<div class="pc-tools">${tools.map((t) => `<div class="pc-tool ${t === now ? 'on pc-drag' : 'off'}" data-tool="${t}" role="img" aria-label="${t}">${TOOLS[t]()}</div>`).join('')}</div>`;
    }
    // the pet, with what is happening on it
    let over = '';
    if (!fish) {
      const dirtyNow = washing && c.phase === 'soap' ? 1 - c.p : 0; // (outside the bath, the drawing has its own mud)
      if (dirtyNow > 0) over += MUD.map(([x, y], i) => `<i class="pc-mud" data-i="${i}" style="left:${x}px;top:${y}px;opacity:${dirtyNow.toFixed(2)}"></i>`).join('');
      if (washing && (c.phase === 'soap' || c.phase === 'rinse')) {
        const shown = c.phase === 'soap' ? Math.ceil(c.p * FOAM.length) : Math.ceil((1 - c.p) * FOAM.length);
        over += FOAM.map(([x, y], i) => `<i class="pc-foam" data-i="${i}" style="left:${x}px;top:${y}px;${i < shown ? '' : 'opacity:0'}"></i>`).join('');
      }
      if (washing && c.phase === 'dry') over += DROPS.map(([x, y], i) => `<i class="pc-drop" data-i="${i}" style="left:${x}px;top:${y}px;${i < Math.ceil((1 - c.p) * DROPS.length) ? '' : 'opacity:0'}"></i>`).join('');
      if (mode === 'rest' && c.step >= 2) over += `<span class="pc-tucked">${blanketSvg()}</span>`;
      if (c.carry) over += `<span class="pc-carry">${pic(info.toy, 60)}</span>`;
    } else if (washing) {
      over += `<i class="pc-algae" style="opacity:${(1 - c.p).toFixed(2)}"></i>`;
    }
    if (mode === 'food' && fish && c.flakes) over += '<i class="pc-flakes"></i>';
    const x = S.petFromX != null ? S.petFromX : petX();
    const svgMood = asleep ? 'sleepy' : S.petAnim ? 'happy' : washing ? 'happy' : m;
    const petHtml = `<div class="pet-pos pc-pet ${S.petAnim || ''} ${mode === 'rest' && !fish && c.step === 0 ? 'pc-drag pc-carryable' : ''} ${mode === 'rest' && c.step >= 1 && !fish ? 'onbed' : ''} ${washing && !fish && c.phase !== 'done' ? 'inbath' : ''} ${mode === 'fun' && fish ? 'following' : ''}" id="petPos" style="left:${x}%" role="img" aria-label="${esc(p.name)}">${petSvg(id, svgMood, PET_W, { asleep })}${over}</div>`;

    const needs = NEEDS.map((n) => `<div class="need-row ${mode === n.id ? 'on' : ''}">
      <span class="need-ic" style="color:${n.color}">${ic(n.icon, 32)}</span>
      <div class="need-bar" role="img" aria-label="${n.label}: ${p[n.id] > 66 ? 'full' : p[n.id] > 33 ? 'half' : 'low'}"><div class="need-fill" data-need="${n.id}" style="width:${Math.round(p[n.id])}%;background:${n.color}"></div></div>
      <button class="need-btn" data-a="petAct" data-v="${n.id}" style="--nc:${n.color}" aria-pressed="${mode === n.id}">${mode === n.id ? 'Stop' : n.act}</button>
    </div>`).join('');
    const tip = mode ? `<div class="pet-tip">${ic(asleep ? 'sleep' : 'hand', 34)}<span>${esc(tipFor(id, p))}</span>${asleep ? `<button class="g-btn small" data-a="petWake">${ic('sun', 20)}<span>Wake up</span></button>` : ''}</div>` : '';
    return `
<section class="screen" aria-label="Pet corner">
  ${A.srTitle(p.name)}
  ${head}
  <div class="row gap24 grow">
    <div class="panel pet-room pc-room grow ${asleep ? 'lights-off' : ''} ${fish ? 'fish' : ''}" id="petRoom">
      <div class="floor" style="height:26%"></div>
      ${room}
      ${petHtml}
      ${asleep ? `<span class="zz" style="left:${petX() + 6}%;top:34%;font-size:46px">z</span><span class="zz" style="left:${petX() + 12}%;top:24%;font-size:32px">z</span><span class="pc-moon">${ic('moon', 54)}</span>` : ''}
      ${m !== 'happy' && !mode && !S.petAnim ? `<div class="pet-thought">${ic({ hungry: 'feed', bored: 'ball', dirty: 'soap', sleepy: 'sleep' }[m], 44)}</div>` : ''}
      <span class="pet-name">${ic('heart', 20)}<span>${esc(p.name)}</span></span>
    </div>
    <div class="col gap12" style="width:380px">
      ${needs}
      ${tip}
    </div>
  </div>
</section>`;
  };
  A.GUIDE.pet = () => {
    const id = S.petId;
    if (!id) return null;
    const p = petState(id);
    if (!p.name) return { sel: '[data-a="petName"]', say: 'Tap a name.' };
    const c = care();
    const fish = isFish(id);
    const say = tipFor(id, p);
    if (c.mode === 'food') return { sel: '.pc-food', say };
    if (c.mode === 'fun') return fish ? { sel: '#petPos', say } : { sel: '#petToy', say };
    if (c.mode === 'clean') return c.phase === 'done' ? null : { sel: '.pc-tool.on', say };
    if (c.mode === 'rest') return c.step >= 3 ? null : fish || c.step === 2 ? { sel: '.pc-lamp', say } : c.step === 0 ? { sel: '#petPos', say } : { sel: '#petBlanket', say };
    const m = mood(p);
    if (m === 'happy') return null;
    const need = { hungry: 'food', bored: 'fun', dirty: 'clean', sleepy: 'rest' }[m];
    return { sel: `[data-a="petAct"][data-v="${need}"]`, say: A.VOICE.pet() };
  };

  // ---------------------------------------------------------------- doing it
  // where an element sits inside the room (room px, whatever the screen scale)
  function rectIn(el, box) {
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = box.offsetWidth / (b.width || 1);
    return { x: (r.left - b.left) * k, y: (r.top - b.top) * k, w: r.width * k, h: r.height * k };
  }
  const inside = (pt, r, pad) => pt.x > r.x - (pad || 0) && pt.x < r.x + r.w + (pad || 0) && pt.y > r.y - (pad || 0) && pt.y < r.y + r.h + (pad || 0);
  const pct = (x, box) => Math.max(8, Math.min(92, (x / box.offsetWidth) * 100));
  function walkTo(x) { S.petFromX = petX(); S.petX = x; }
  function bump(need, by) {
    const p = petState(S.petId);
    p[need] = Math.min(100, p[need] + by);
    save();
    const f = A.stage.querySelector(`.need-fill[data-need="${need}"]`);
    if (f) f.style.width = Math.round(p[need]) + '%';
    return p;
  }
  function done(need, act, line) {
    const c = care();
    if (c.starred && c.starred[act]) return;
    c.starred = Object.assign({}, c.starred, { [act]: true });
    careStar(act);
    say(line);
  }

  function feedWith(food, box) {
    const id = S.petId;
    const c = care();
    if (c.busy) return;
    c.busy = true;
    if (isFish(id)) {
      c.flakes = true; S.petAnim = 'eat'; render(); tone(880, 0.12, 0.05);
      later(() => {
        c.flakes = false; c.busy = false; S.petAnim = null;
        const p = bump('food', 30);
        render();
        if (p.food >= 100) done('food', 'feed', `${p.name} is full! Glub glub, thank you!`); else say(pick(['Glub glub! Yum!', 'Nibble, nibble!', 'Tasty!']));
      }, 1600);
      return;
    }
    c.bowl = food;
    walkTo(EAT_X);
    S.petAnim = 'walk';
    render();
    tone(523, 0.15, 0.06);
    later(() => { S.petFromX = null; S.petAnim = 'eat'; render(); tone(330, 0.1, 0.05); later(() => tone(360, 0.1, 0.05), 300); later(() => tone(330, 0.1, 0.05), 600); }, 950);
    later(() => {
      c.bowl = null; c.busy = false;
      const p = bump('food', 30);
      walkTo(HOME_X); S.petAnim = 'walk';
      render();
      if (p.food >= 100) done('food', 'feed', `${p.name} is full! Thank you for the yummy food.`); else say(pick(['Yum yum!', 'Crunch, crunch!', 'Delicious! More please?']));
      later(() => { S.petFromX = null; S.petAnim = null; render(); }, 950);
    }, 2300);
  }

  function throwToy(x) {
    const c = care();
    const p = petState(S.petId);
    c.busy = true;
    c.toyX = x;
    walkTo(x);
    S.petAnim = 'run';
    render();
    tone(660, 0.2, 0.06);
    say(pick(['Fetch!', 'Go get it!', 'Wheee!']));
    later(() => { c.carry = true; c.toyX = null; S.petFromX = null; walkTo(HOME_X); render(); }, 1000);
    later(() => {
      c.carry = false; c.busy = false; S.petFromX = null; S.petAnim = 'hop';
      bump('fun', 25);
      render();
      if (p.fun >= 100) done('fun', 'play', `${p.name} had so much fun! Good throwing!`); else say(pick(['Again! Again!', 'Good catch!', 'Woohoo!']));
      later(() => { if (S.petAnim === 'hop') { S.petAnim = null; render(); } }, 700);
    }, 2000);
  }

  function nextWash(p) {
    const c = care();
    const k = WASH_ORDER.indexOf(c.phase);
    if (k < WASH_ORDER.length - 1) {
      c.phase = WASH_ORDER[k + 1]; c.p = 0;
      tone(784, 0.2, 0.06);
      render();
      say(c.phase === 'rinse' ? `So many bubbles! Now rinse ${p.name} with the shower.` : `All rinsed. Now dry ${p.name} with the towel.`);
      return;
    }
    c.phase = 'done'; c.p = 1;
    p.clean = 100; save();
    S.petAnim = 'shake';
    render();
    tone(784, 0.3, 0.08); later(() => tone(988, 0.3, 0.08), 160);
    done('clean', 'wash', `${p.name} is clean, dry and shiny!`);
    later(() => { if (S.petAnim === 'shake') { S.petAnim = null; render(); } }, 900);
  }

  A.AFTER.pet = () => {
    const box = document.getElementById('petRoom');
    const pet = document.getElementById('petPos');
    if (!box || !pet || !A.SG) return;
    const id = S.petId;
    const p = petState(id);
    const c = care();
    const fish = isFish(id);
    // the pet walks smoothly to where it is going
    if (S.petFromX != null && S.petFromX !== petX()) requestAnimationFrame(() => requestAnimationFrame(() => { pet.style.left = petX() + '%'; }));
    // tickle (play), or wake up (asleep)
    pet.addEventListener('click', () => {
      if (c.mode === 'fun' && !fish && !c.busy) {
        bump('fun', 6);
        pet.classList.remove('giggle'); void pet.offsetWidth; pet.classList.add('giggle');
        tone(900, 0.08, 0.05); setTimeout(() => tone(1100, 0.08, 0.05), 90);
        say(pick(['Hee hee hee!', 'That tickles!', 'Giggle!']));
        if (p.fun >= 100) done('fun', 'play', `${p.name} had so much fun!`);
      } else if (c.mode === 'rest' && c.step >= 3) A.ACTIONS.petWake();
    });
    if (c.mode === 'food') {
      box.querySelectorAll('.pc-food').forEach((el) => {
        A.SG.drag(el, box, {
          drop: (pt) => {
            const target = fish ? rectIn(pet, box) : rectIn(document.getElementById('petBowl'), box);
            const onPet = inside(pt, rectIn(pet, box), 10);
            if (inside(pt, target, 40) || (!fish && onPet)) { feedWith(el.dataset.food, box); return false; }
            say(fish ? 'Put the food in the tank.' : 'Put the food in the bowl.');
            return false;
          },
          tap: () => say(`${el.getAttribute('aria-label')}. Drag it ${fish ? 'into the tank' : 'into the bowl'}.`)
        });
      });
    }
    if (c.mode === 'fun' && !fish) {
      const toy = document.getElementById('petToy');
      if (toy && !c.busy) A.SG.drag(toy, box, { drop: (pt) => { throwToy(pct(pt.x, box)); return true; }, tap: () => say('Drag the toy, then let go to throw it!') });
    }
    if (c.mode === 'fun' && fish) {
      // the fish follows a finger on the glass
      const swim = pet.querySelector('.fish-swim');
      let down = false;
      let last = null;
      let face = 1;
      const k = () => box.offsetWidth / (box.getBoundingClientRect().width || 1);
      pet.addEventListener('pointerdown', (e) => { down = true; last = { x: e.clientX, y: e.clientY }; try { pet.setPointerCapture(e.pointerId); } catch (err) { /* old browser */ } });
      const up = () => { down = false; };
      pet.addEventListener('pointerup', up);
      pet.addEventListener('pointercancel', up);
      pet.addEventListener('pointermove', (e) => {
        if (!down || !swim) return;
        const r = pet.getBoundingClientRect();
        const fx = ((e.clientX - r.left) / r.width) * 200 - 100;
        const fy = ((e.clientY - r.top) / r.height) * 200 - 112;
        const ddx = e.clientX - last.x;
        if (Math.abs(ddx) > 3) face = ddx < 0 ? 1 : -1; // the fish faces the way the finger goes
        swim.style.transform = `translate(${Math.max(-50, Math.min(50, fx))}px, ${Math.max(-40, Math.min(40, fy))}px) scaleX(${face})`;
        const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y) * k();
        last = { x: e.clientX, y: e.clientY };
        const before = p.fun;
        bump('fun', dist / 40);
        if (before < 100 && p.fun >= 100) done('fun', 'play', `${p.name} loved swimming after your finger!`);
      });
    }
    if (c.mode === 'clean' && c.phase !== 'done') {
      const tool = box.querySelector('.pc-tool.on');
      if (tool) {
        const need = fish ? 800 : WASH[c.phase].need;
        A.SG.drag(tool, box, {
          move: (pt, dx, dy) => {
            if (!inside(pt, rectIn(pet, box), 10) || c.p >= 1) return;
            c.p = Math.min(1, c.p + Math.hypot(dx, dy) / need);
            // update what is on the pet without redrawing (the finger is still down)
            if (fish) { const a = pet.querySelector('.pc-algae'); if (a) a.style.opacity = (1 - c.p).toFixed(2); }
            if (c.phase === 'soap') {
              pet.querySelectorAll('.pc-foam').forEach((f) => { f.style.opacity = Number(f.dataset.i) < Math.ceil(c.p * FOAM.length) ? '' : '0'; });
              pet.querySelectorAll('.pc-mud').forEach((f) => { f.style.opacity = (1 - c.p).toFixed(2); });
            }
            if (c.phase === 'rinse') pet.querySelectorAll('.pc-foam').forEach((f) => { f.style.opacity = Number(f.dataset.i) < Math.ceil((1 - c.p) * FOAM.length) ? '' : '0'; });
            if (c.phase === 'dry') pet.querySelectorAll('.pc-drop').forEach((f) => { f.style.opacity = Number(f.dataset.i) < Math.ceil((1 - c.p) * DROPS.length) ? '' : '0'; });
            if (Math.random() < 0.25) {
              const b = document.createElement('span');
              b.className = c.phase === 'rinse' ? 'pc-spray' : 'bubble-dot';
              b.style.left = pt.x + 'px'; b.style.top = pt.y + 'px';
              box.appendChild(b);
              setTimeout(() => b.remove(), 1200);
            }
            if (Math.floor(c.p * 8) !== Math.floor((c.p - Math.hypot(dx, dy) / need) * 8)) tone(520 + c.p * 400, 0.06, 0.03);
          },
          drop: () => {
            if (c.p >= 1) setTimeout(() => {
              if (fish) { c.phase = 'done'; p.clean = 100; save(); tone(784, 0.3, 0.08); render(); done('clean', 'wash', `The tank is sparkling clean! ${p.name} can see you.`); } else nextWash(p);
            }, 0);
            else if (c.p > 0.05) say('Keep going! Rub a little more.');
            return false;
          },
          tap: () => say(tipFor(id, p))
        });
      }
    }
    if (c.mode === 'rest' && !fish) {
      if (c.step === 0) {
        A.SG.drag(pet, box, {
          drop: (pt) => {
            if (inside(pt, rectIn(document.getElementById('petBed'), box), 60)) {
              c.step = 1; S.petX = BED_X; S.petFromX = null;
              tone(523, 0.15, 0.05); render();
              say(`${p.name} is on the bed. Now drag the blanket over ${p.name}.`);
              return true;
            }
            say(`Drag ${p.name} onto the bed.`);
            return false;
          },
          tap: () => say(`Drag ${p.name} onto the bed.`)
        });
      }
      const bl = document.getElementById('petBlanket');
      if (bl && c.step === 1) {
        A.SG.drag(bl, box, {
          drop: (pt) => {
            if (inside(pt, rectIn(pet, box), 30)) { c.step = 2; tone(587, 0.15, 0.05); render(); say('Snug as a bug! Now tap the lamp to turn off the light.'); return true; }
            say(`Put the blanket over ${p.name}.`);
            return false;
          },
          tap: () => say(`Drag the blanket over ${p.name}.`)
        });
      }
    }
  };

  // sleeping: the sleep bar fills slowly while the room is dark and the lullaby plays
  function sleepTick() {
    const c = care();
    if (S.screen !== 'pet' || c.mode !== 'rest' || c.step < 3) return;
    const p = bump('rest', 7);
    if (p.rest >= 100) { done('rest', 'sleep', `${p.name} had a lovely sleep. Sweet dreams!`); return; }
    later(sleepTick, 700);
  }
  function stopLullaby() {
    if (S.petLullaby && window.LumiAudio && window.LumiAudio.playing === 'lullaby') window.LumiAudio.stop();
    S.petLullaby = false;
  }
  A.petStopLullaby = stopLullaby;

  Object.assign(A.ACTIONS, {
    petTab: (d) => { stopLullaby(); S.petId = d.v; if (FOLLOWERS.includes(d.v)) { state.buddy = d.v; save(); } resetCare(null); render(); say(A.VOICE.pet()); },
    petName: (d) => {
      const p = petState(S.petId);
      p.name = d.v;
      save();
      render();
      say(`Hello, ${d.v}!`);
    },
    petAct: (d) => {
      const c = care();
      stopLullaby();
      if (c.mode === d.v) { resetCare(null); render(); say(A.VOICE.pet()); return; }
      resetCare(d.v);
      const id = S.petId;
      if (d.v === 'rest' && isFish(id)) care().step = 2;
      render();
      say(tipFor(id, petState(id)));
    },
    petLamp: () => {
      const c = care();
      const p = petState(S.petId);
      if (c.step >= 3) { A.ACTIONS.petWake(); return; }
      if (c.step < 2 && !isFish(S.petId)) { say(tipFor(S.petId, p)); return; }
      c.step = 3;
      tone(392, 0.4, 0.05);
      render();
      say(`Click. Goodnight, ${p.name}.`);
      if (window.LumiAudio && state.settings.sounds && state.settings.roomMusic !== false && !S.mute && !window.LumiAudio.playing) { window.LumiAudio.play('lullaby'); S.petLullaby = true; }
      later(sleepTick, 1200);
    },
    petWake: () => {
      const p = petState(S.petId);
      stopLullaby();
      resetCare(null);
      S.petAnim = 'hop';
      render();
      say(`Good morning, ${p.name}!`);
      later(() => { S.petAnim = null; render(); }, 800);
    }
  });

  // when a pet is bought in the room, point the child to the pet corner
  const roomBuy = A.ACTIONS.roomBuy;
  A.ACTIONS.roomBuy = (d) => {
    const had = state.owned.includes(d.id);
    const r = roomBuy(d);
    if (!had && state.owned.includes(d.id) && D.PETS[d.id]) {
      petState(d.id);
      save();
      later(() => A.showReminder(A.L.item(d.id, 40), `Visit your ${D.PETS[d.id].name.toLowerCase()} in the Pet corner!`), 900);
    }
    return r;
  };
  const nav = A.ACTIONS.nav;
  A.ACTIONS.nav = (d) => { if (d.to === 'pet') { S.care = null; S.petX = null; S.petFromX = null; S.petAnim = null; } return nav(d); };

  A.petSvg = petSvg;

  // ================================================================ the pet walks with Lumi
  // The puppy or kitten stays next to Lumi on every child screen: home, the day's games, stories, play.
  // It is drawn inside Lumi's own box, so when Lumi walks across a scene the pet walks too.
  // (The fish tank stays in the bedroom. Fish can't walk!)
  const FOLLOWERS = ['puppy', 'kitten'];
  // every walking pet the child owns, the one picked last in the Pet corner first
  A.buddyPets = () => {
    if (state.settings.buddy === false) return [];
    const owned = FOLLOWERS.filter((k) => state.owned.includes(k));
    return owned.includes(state.buddy) ? [state.buddy].concat(owned.filter((k) => k !== state.buddy)) : owned;
  };
  // Lumi's box on each screen, most specific first
  const LUMI_BOX = ['.sx-lumi', '.ch-lumi', '.sc-lumi', '.wk-lumi', '.dr-lumi', '.bf-lumi', '.bs-lumi', '.gn-lumi', '.st-lumi', '.bubble-lumi', '.calm-lumi', '.les-lumi', '.lumi-pos', '.lumi-pos-static'];
  // private moments where the pets wait outside
  const WAITS_OUTSIDE = ['potty', 'toilet', 'bath', 'shower'];
  function placeBuddy() {
    const pets = A.buddyPets();
    const scr = S.screen || '';
    if (!pets.length || scr === 'pet' || /^cg|^grown|^parent/.test(scr)) return;
    const root = A.stage.querySelector('#screen');
    if (!root) return;
    if (scr === 'routine' && S.day && S.day.plan) {
      const st = S.day.plan[S.day.i];
      if (st && WAITS_OUTSIDE.includes(st.id)) return;
    }
    let box = null;
    for (const sel of LUMI_BOX) { box = root.querySelector(sel); if (box && box.querySelector('svg.lumi')) break; box = null; }
    if (!box || box.querySelector('.pet-buddy')) return;
    const lumi = box.querySelector('svg.lumi');
    const W = parseFloat(lumi.getAttribute('width')) || 240;
    const H = parseFloat(lumi.getAttribute('height')) || W;
    if (W < 120) return; // too small to share the space
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    // measure in the box's own pixels (the stage is scaled to fit the tablet)
    const br = box.getBoundingClientRect();
    const lr = lumi.getBoundingClientRect();
    const k = lr.width / W || 1;
    const lx = (lr.left - br.left) / k;
    const ly = (lr.top - br.top) / k;
    // put the pets on the side with more room
    let frac;
    if (box.dataset.x != null) frac = (parseFloat(box.dataset.x) + W / 2) / (box.parentElement.offsetWidth || 978); // where Lumi is walking to
    else { const sr = root.getBoundingClientRect(); frac = (lr.left + lr.width / 2 - sr.left) / (sr.width || 1); }
    const side = frac > 0.55 ? 'left' : 'right';
    const sleepy = /sleepy/.test(lumi.getAttribute('aria-label') || '') || !!box.querySelector('.wk-z');
    const P = Math.round(Math.max(64, Math.min(160, W * 0.4)));
    pets.slice(0, 2).forEach((kind, n) => {
      const sz = n ? Math.round(P * 0.85) : P;
      const step = n ? P * 0.62 : 0; // the second pet trots a little further out
      const left = side === 'right' ? lx + W * 0.74 + step : lx + W * 0.26 - sz - step;
      const top = ly + H * 0.9 - sz * 0.95 - (n ? P * 0.04 : 0);
      const el = document.createElement('span');
      el.className = `pet-buddy ${side} b${n}`;
      el.style.cssText = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${sz}px;height:${sz}px`;
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = petSvg(kind, sleepy ? 'sleepy' : 'happy', sz, { asleep: sleepy });
      box.appendChild(el);
      // the second pet only comes along when there is room for it
      if (n) {
        const clip = (box.closest('.panel, .scene') || root).getBoundingClientRect();
        const r = el.getBoundingClientRect();
        if (r.right > clip.right + 2 || r.left < clip.left - 2) el.remove();
      }
    });
  }
  A.placeBuddy = placeBuddy;
  const prevAfter = A.afterRender;
  A.afterRender = () => { if (prevAfter) prevAfter(); try { placeBuddy(); } catch (e) { /* the pet is only decoration */ } };
})();
