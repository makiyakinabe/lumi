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

  // ---------------------------------------------------------------- the screen
  A.PARENT.pet = 'fun';
  A.VOICE.pet = () => {
    const id = S.petId;
    if (!id) return '';
    const p = petState(id);
    if (!p.name) return `Your new ${D.PETS[id].name.toLowerCase()}! Pick a name.`;
    const m = mood(p);
    return { happy: `${p.name} is happy to see you!`, hungry: `${p.name} is hungry. Tap Feed.`, bored: `${p.name} wants to play.`, dirty: `${p.name} is messy. Time for a wash.`, sleepy: `${p.name} is sleepy.` }[m];
  };
  A.SCREENS.pet = () => {
    const owned = A.ownedPets();
    if (!S.petId || !owned.includes(S.petId)) S.petId = owned[0];
    const id = S.petId;
    const info = D.PETS[id];
    const p = petState(id);
    const m = mood(p);
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

    const anim = S.petAnim || '';
    const needs = NEEDS.map((n) => `<div class="need-row">
      <span class="need-ic" style="color:${n.color}">${ic(n.icon, 32)}</span>
      <div class="need-bar" role="img" aria-label="${n.label}: ${p[n.id] > 66 ? 'full' : p[n.id] > 33 ? 'half' : 'low'}"><div class="need-fill" style="width:${Math.round(p[n.id])}%;background:${n.color}"></div></div>
      <button class="need-btn" data-a="petAct" data-v="${n.id}" style="--nc:${n.color}">${n.act}</button>
    </div>`).join('');
    let actionPanel = '';
    if (S.petMode === 'food') {
      actionPanel = `<div class="pet-choices">${info.foods.map(([e, l]) => `<button class="food-btn" data-a="petFeed" data-v="${e}" aria-label="${l}"><span class="emoji" style="font-size:54px">${e}</span><span>${l}</span></button>`).join('')}</div>`;
    } else if (S.petMode === 'clean') {
      actionPanel = `<div class="pet-tip">${ic('hand', 34)}<span>Rub ${esc(p.name)} to wash</span></div>`;
    } else if (S.petMode === 'fun') {
      actionPanel = `<div class="pet-choices"><button class="food-btn" data-a="petToy"><span class="emoji" style="font-size:60px">${info.toy}</span><span>Throw</span></button></div>`;
    }
    return `
<section class="screen" aria-label="Pet corner">
  ${A.srTitle(p.name)}
  ${head}
  <div class="row gap24 grow">
    <div class="panel pet-room grow ${anim === 'sleep' ? 'lights-off' : ''}" id="petRoom">
      <div class="floor" style="height:26%"></div>
      <div class="pet-bowl">${ic('feed', 60)}</div>
      <div class="pet-pos ${anim === 'eat' || anim === 'play' ? 'hop' : ''} ${S.petMode === 'clean' ? 'washing' : ''}" id="petPos">${petSvg(id, anim === 'sleep' ? 'sleepy' : anim ? 'happy' : m, 330, { asleep: anim === 'sleep' })}</div>
      ${anim === 'eat' ? `<span class="fly-food emoji">${S.petFood || '🦴'}</span>` : ''}
      ${anim === 'play' ? `<span class="fly-toy emoji">${info.toy}</span>` : ''}
      ${anim === 'sleep' ? '<span class="zz" style="left:62%;top:22%;font-size:46px">z</span><span class="zz" style="left:68%;top:12%;font-size:32px">z</span>' : ''}
      ${m !== 'happy' && !anim ? `<div class="pet-thought">${ic({ hungry: 'feed', bored: 'ball', dirty: 'soap', sleepy: 'sleep' }[m], 44)}</div>` : ''}
      <span class="pet-name">${ic('heart', 20)}<span>${esc(p.name)}</span></span>
    </div>
    <div class="col gap12" style="width:380px">
      ${needs}
      ${actionPanel}
    </div>
  </div>
</section>`;
  };
  A.GUIDE.pet = () => {
    const id = S.petId;
    if (!id) return null;
    const p = petState(id);
    if (!p.name) return { sel: '[data-a="petName"]', say: 'Tap a name.' };
    if (S.petMode === 'food') return { sel: '[data-a="petFeed"]', say: 'Tap some food.' };
    if (S.petMode === 'fun') return { sel: '[data-a="petToy"]', say: 'Tap to throw it.' };
    if (S.petMode === 'clean') return { sel: '#petPos', say: 'Rub to wash.' };
    const m = mood(p);
    if (m === 'happy') return null;
    const need = { hungry: 'food', bored: 'fun', dirty: 'clean', sleepy: 'rest' }[m];
    return { sel: `[data-a="petAct"][data-v="${need}"]`, say: A.VOICE.pet() };
  };
  A.AFTER.pet = () => {
    if (S.petMode !== 'clean') return;
    const pos = document.getElementById('petPos');
    const room = document.getElementById('petRoom');
    if (!pos) return;
    const p = petState(S.petId);
    let down = false;
    let last = null;
    const s = () => A.stage.getBoundingClientRect().width / 1194;
    pos.addEventListener('pointerdown', (e) => { down = true; last = { x: e.clientX, y: e.clientY }; pos.setPointerCapture(e.pointerId); });
    const up = () => { down = false; };
    pos.addEventListener('pointerup', up);
    pos.addEventListener('pointercancel', up);
    pos.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y) / s();
      last = { x: e.clientX, y: e.clientY };
      p.clean = Math.min(100, p.clean + dist / 14);
      const fill = A.stage.querySelector('[data-a="petAct"][data-v="clean"]').previousElementSibling.firstElementChild;
      fill.style.width = Math.round(p.clean) + '%';
      if (Math.random() < 0.3) {
        const r = room.getBoundingClientRect();
        const b = document.createElement('span');
        b.className = 'bubble-dot';
        b.style.left = ((e.clientX - r.left) / s()) + 'px';
        b.style.top = ((e.clientY - r.top) / s()) + 'px';
        room.appendChild(b);
        setTimeout(() => b.remove(), 1400);
      }
      if (p.clean >= 100) {
        down = false;
        S.petMode = null;
        tone(784, 0.4, 0.09);
        careStar('wash');
        render();
        say(`${p.name} is clean and shiny!`);
      }
    });
  };

  function play(animName, ms) {
    S.petAnim = animName;
    render();
    later(() => { S.petAnim = null; render(); }, ms);
  }

  Object.assign(A.ACTIONS, {
    petTab: (d) => { S.petId = d.v; if (FOLLOWERS.includes(d.v)) { state.buddy = d.v; save(); } S.petMode = null; render(); say(A.VOICE.pet()); },
    petName: (d) => {
      const p = petState(S.petId);
      p.name = d.v;
      save();
      render();
      say(`Hello, ${d.v}!`);
    },
    petAct: (d) => {
      const p = petState(S.petId);
      if (d.v === 'rest') {
        S.petMode = null;
        p.rest = Math.min(100, p.rest + 45);
        save();
        tone(330, 1.2, 0.06);
        careStar('sleep');
        say(`Shh. ${p.name} is having a nap.`);
        play('sleep', 3500);
        return;
      }
      S.petMode = S.petMode === d.v ? null : d.v;
      render();
      if (d.v === 'food') say(`What should ${p.name} eat?`);
      if (d.v === 'fun') say('Tap the toy to throw it!');
      if (d.v === 'clean') say(`Rub ${p.name} with your finger to wash.`);
    },
    petFeed: (d) => {
      const p = petState(S.petId);
      p.food = Math.min(100, p.food + 35);
      S.petFood = d.v;
      S.petMode = null;
      save();
      tone(523, 0.2, 0.08);
      careStar('feed');
      say(pick(['Yum yum!', 'Crunch, crunch!', 'Delicious!']));
      play('eat', 1600);
    },
    petToy: () => {
      const p = petState(S.petId);
      p.fun = Math.min(100, p.fun + 20);
      save();
      tone(660, 0.25, 0.08);
      if (p.fun >= 100) { S.petMode = null; careStar('play'); say(`${p.name} had so much fun!`); } else say(pick(['Fetch!', 'Wheee!', 'Again!']));
      play('play', 1200);
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
  A.ACTIONS.nav = (d) => { if (d.to === 'pet') { S.petMode = null; S.petAnim = null; } return nav(d); };

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
