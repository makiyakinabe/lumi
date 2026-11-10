/*
  learn.js
  "Learn with Lumi": guided tutorials for everyday tasks (brushing teeth, washing hands, getting dressed,
  packing a bag). Each step shows Lumi doing the action on the left, and the child doing it on the right:
  tap, press and hold, rub with a finger, or pick the right thing. "I did it" moves on when the child
  does the step for real. Grown-ups can build their own tutorials with photos (Grown-ups › Activities).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, award, track, render, go, later, pick, dots } = A;

  const emo = (e, size) => (window.lumiPic && window.lumiPic(e, size)) || `<span class="emoji" style="font-size:${size}px">${e}</span>`;
  const tapSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
    <rect x="6" y="18" width="16" height="44" rx="5" fill="#D5DDE5" stroke="#3B2F2F" stroke-width="3"/>
    <path d="M22 32 h38 a14 14 0 0 1 14 14 v10" fill="none" stroke="#3B2F2F" stroke-width="17" stroke-linecap="round"/>
    <path d="M22 32 h38 a14 14 0 0 1 14 14 v10" fill="none" stroke="#C9D3DC" stroke-width="11" stroke-linecap="round"/>
    <rect x="34" y="12" width="20" height="10" rx="4" fill="#2F7E79" stroke="#3B2F2F" stroke-width="3"/><path d="M44 22 v6" stroke="#3B2F2F" stroke-width="4"/>
    <path d="M74 70 c-4 6 -6 9 -6 12 a6 6 0 0 0 12 0 c0 -3 -2 -6 -6 -12z" fill="#8EB8E5"/></svg>`;
  const CUSTOM_ANIM = 'cheer';

  function lessonList() {
    const built = D.LEARN.filter((t) => A.tutOn(t));
    const mine = state.customActivities.filter((t) => t.on !== false).map((t) => ({
      id: t.id, name: t.name, icon: t.icon || 'star', photo: t.photo, tint: t.tint || '#F1ECFB', custom: true,
      steps: t.steps.map((s) => ({ say: s.text, act: 'real', photo: s.photo, icon: s.icon, anim: CUSTOM_ANIM }))
        .concat([{ say: 'All done! Well done.', act: 'done', prop: 'smile', anim: 'smile' }])
    }));
    return built.concat(mine);
  }
  // the built-in lessons are played as real-life scenes (learn-*.js, on the story engine); a lesson can
  // also point at a story (t.story). Lessons a grown-up made with photos use the simple player below.
  const sceneFor = (t) => {
    if (t.custom) return null;
    const id = t.story || 'learn-' + t.id;
    return D.STORIES.some((s) => s.id === id) ? id : null;
  };
  A.lessonScene = sceneFor;
  const lessonArt = (t, size) => (t.photo ? `<img class="step-photo" src="${t.photo}" width="${size}" height="${size}" alt="">` : ic(t.icon, size));

  // ---------------------------------------------------------------- Learn hub
  A.PARENT.learn = 'fun';
  A.VOICE.learn = () => 'Learn with Lumi. Pick one to do together.';
  A.SCREENS.learn = () => {
    const count = (name) => state.events.filter((e) => e.kind === 'tutorials' && e.detail === name).length;
    const rec = A.focusStories ? A.focusStories() : [];
    const rank = (t) => { const i = rec.indexOf(sceneFor(t)); return i < 0 ? 99 : i; };
    const cards = lessonList().slice().sort((a, b) => rank(a) - rank(b)).map((t) => `<button class="learn-card" ${sceneFor(t) ? `data-a="stOpen" data-v="${sceneFor(t)}"` : `data-a="lesOpen" data-v="${t.id}"`} style="background:${t.tint}">
      ${sceneFor(t) && A.storyPreview && A.storyPreview(sceneFor(t)) ? A.storyPreview(sceneFor(t)).html : `<span class="sx-mini plain"><span class="learn-art">${lessonArt(t, 110)}</span></span>`}
      ${rec.includes(sceneFor(t)) ? `<span class="fo-for">${ic('star', 16)}<span>For ${esc(state.childName || 'you')}</span></span>` : ''}
      <span class="sc-foot"><span class="learn-name">${esc(t.name)}</span>${sceneFor(t) ? `<span class="learn-steps">${(D.STORIES.find((x) => x.id === sceneFor(t)) || { steps: [] }).steps.length} small steps</span>` : ''}</span>
      <span class="learn-meta">${dots(Math.min(count(t.name), 5), 5, 'var(--gold)', 14)}</span>
      ${t.custom ? `<span class="tag mine">${ic('camera', 14)}<span>Ours</span></span>` : ''}</button>`).join('');
    return `
<section class="screen" aria-label="Learn with Lumi">
  ${A.srTitle('Learn with Lumi')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE.learn())}</div>
    <span></span>
  </div>
  <div class="learn-grid grow">${cards}</div>
</section>`;
  };
  A.GUIDE.learn = () => ({ sel: '.learn-card', say: 'Tap one to learn with Lumi.', delay: state.settings.guideDelay * 1000 + 3000 });
  const afterLearn = A.AFTER.learn;
  A.AFTER.learn = () => { if (afterLearn) afterLearn(); if (A.fitPreviews) A.fitPreviews(); };

  // ---------------------------------------------------------------- the lesson player
  function stepNow() { return S.les.steps[S.les.i]; }

  // ---------------------------------------------------------------- a pair of hands washing
  // Two shaded hands crossed and rubbing. mode: 'wet' (water), 'soap' (foam builds up as the child rubs),
  // 'rinse' (foam washes away, water drops). --p on a parent (0 to 1) is how far the child has rubbed;
  // each bubble or drop has a --t and shows once --p passes it. Rubbing adds .rubbing so the hands move.
  const washMode = (st) => (st.prop === 'towel' ? 'dry' : /^wet/i.test(st.say) ? 'wet' : /^rinse/i.test(st.say) ? 'rinse' : 'soap');
  function oneHand(shirt) {
    const fingers = [[-27.5, -146, 12.6], [-13.3, -156, 12.6], [0.9, -151, 12.6], [15.1, -136, 12]];
    const shapes = [
      ...fingers.map(([x, top, w]) => `<rect x="${x}" y="${top}" width="${w}" height="${-92 - top}" rx="${w / 2}"/>`),
      '<rect x="-33.5" y="-97" width="15" height="44" rx="7.5" transform="rotate(-35 -26 -55)"/>',
      '<rect x="-29" y="-106" width="58" height="72" rx="22"/>',
      '<rect x="-19" y="-48" width="38" height="52" rx="12"/>'
    ].join('');
    const nails = fingers.map(([x, top, w]) => `<rect x="${x + 2.7}" y="${top + 3}" width="${w - 5.4}" height="11" rx="4.2" fill="#FCE9DA" stroke="#D9A07C" stroke-width="1.2"/>
      <path d="M${x + 3} ${top + (-92 - top) * 0.55} q${w / 2 - 3} 3.2 ${w - 6} 0" fill="none" stroke="#CF9670" stroke-width="1.5" stroke-linecap="round"/>`).join('');
    return `<g fill="#6B4A3A" stroke="#6B4A3A" stroke-width="7" stroke-linejoin="round">${shapes}</g>
      <g fill="url(#whSkin)">${shapes}</g><g fill="url(#whShade)">${shapes}</g>${nails}
      <path d="M-16 -100 q16 -7 32 0" fill="none" stroke="#D49B76" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      <rect x="-25" y="-18" width="50" height="28" rx="9" fill="${shirt}" stroke="#6B4A3A" stroke-width="3.5"/>
      <rect x="-25" y="-18" width="50" height="9" rx="4.5" fill="#fff" opacity=".35"/>`;
  }
  function washHandsSvg(size, mode) {
    const bub = (x, y, r, t, cls) => `<g class="wh-b ${cls || ''}" style="--t:${t}"><circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" fill-opacity=".95" stroke="#9FD0EE" stroke-width="2"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${Math.max(1.4, r * 0.25)}" fill="#DDF1FC"/></g>`;
    const drop = (x, y, t) => `<path class="wh-b" style="--t:${t}" d="M${x} ${y - 9}c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z" fill="#9AD3F5" stroke="#4E9BD0" stroke-width="2"/>`;
    const FOAM = [[128, 150, 13, 0], [114, 168, 10, 0.08], [142, 170, 11, 0.12], [128, 128, 9, 0.18], [104, 140, 8, 0.25], [152, 136, 9, 0.3], [120, 186, 8, 0.36], [138, 112, 8, 0.42],
      [98, 118, 7, 0.5], [160, 116, 7, 0.55], [116, 100, 7, 0.62], [146, 94, 6, 0.68], [128, 196, 7, 0.74], [92, 160, 7, 0.8], [166, 156, 7, 0.86]];
    const DROPS = [[96, 96, 0], [164, 100, 0.15], [110, 70, 0.3], [150, 72, 0.45], [86, 140, 0.6], [174, 146, 0.75], [128, 214, 0.9]];
    let fx = '';
    if (mode === 'soap') fx = FOAM.map(([x, y, r, t]) => bub(x, y, r, t)).join('') + [[108, 52, 6, 0.5], [150, 40, 5, 0.7], [128, 28, 4, 0.85]].map(([x, y, r, t]) => bub(x, y, r, t, 'wh-up')).join('');
    if (mode === 'rinse') fx = FOAM.slice(0, 9).map(([x, y, r, t]) => bub(x, y, r, 0.9 - t, 'wh-out')).join('') + DROPS.map(([x, y, t]) => drop(x, y, t)).join('');
    if (mode === 'wet') fx = DROPS.map(([x, y, t]) => drop(x, y, t)).join('');
    const water = mode === 'soap' || mode === 'dry' ? '' : `<rect x="121" y="0" width="14" height="96" rx="7" fill="url(#whWater)" class="wh-stream"/>`;
    return `<svg class="wash-hands wh-${mode}" width="${size}" height="${Math.round(size * 240 / 260)}" viewBox="0 0 260 240" role="img" aria-label="Two hands washing">
      <defs><linearGradient id="whSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCDDBF"/><stop offset="1" stop-color="#EDBB93"/></linearGradient>
        <linearGradient id="whShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#8A4E2E" stop-opacity=".2"/></linearGradient>
        <linearGradient id="whWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F7" stop-opacity=".95"/><stop offset="1" stop-color="#BFE3F7" stop-opacity="0"/></linearGradient></defs>
      <ellipse cx="130" cy="232" rx="78" ry="6" fill="#3B2F2F" opacity=".08"/>
      ${water}
      <g class="wh-a wh-back"><g transform="translate(166 228) rotate(-24) scale(1.08)">${oneHand('#7FA9D6')}</g></g>
      <g class="wh-a wh-front"><g transform="translate(94 228) rotate(24) scale(-1.08 1.08)">${oneHand('#8EB8E5')}</g></g>
      ${fx}
    </svg>`;
  }

  A.washHandsSvg = washHandsSvg; // (size, mode: 'wet' | 'soap' | 'rinse' | 'dry'); --p (0..1) on a parent sets how soapy

  // Lumi's side: Lumi plus a prop that shows the action
  function lumiSide(st) {
    const big = (e) => emo(e, 96);
    const props = {
      wet: `<div class="prop prop-tap">${tapSvg(120)}<span class="drops"><i></i><i></i><i></i></span></div>`,
      paste: `<div class="prop prop-paste">${big(S.les.id === 'hands' ? '🧼' : '🧴')}</div>`,
      brush: `<div class="prop prop-brush">${big('🪥')}</div><span class="foam f1"></span><span class="foam f2"></span><span class="foam f3"></span>`,
      spit: `<div class="prop prop-cup">${big('💦')}</div>`,
      rinse: `<div class="prop prop-cup">${big('🥤')}</div>`,
      rub: `<div class="prop prop-hands wh-auto" style="--p:1">${washHandsSvg(122, washMode(st))}</div>`,
      dress: `<div class="prop prop-dress">${st.want ? big(st.want) : ''}</div>`,
      pack: `<div class="prop prop-pack">${st.want ? emo(st.want, 70) : ''}<span class="pack-bag">${ic('bag', 110)}</span></div>`,
      smile: `<span class="sparkles">${ic('sparkle', 46)}${ic('sparkle', 34)}${ic('sparkle', 40)}</span>`,
      cheer: ''
    };
    const mood = st.anim === 'smile' ? 'excited' : st.anim === 'brush' ? 'calm' : 'happy';
    const extra = st.anim === 'dress' && S.les.stepDone ? ' dressed' : '';
    return `<div class="panel les-side lumi-side">
      <span class="who-chip">${ic('sparkle', 22)}<span>Lumi</span></span>
      <div class="les-lumi anim-${st.anim}${extra}">
        <div class="${st.anim === 'smile' || st.anim === 'cheer' ? 'hop' : ''}">${L.svg({ look: A.lookWith(), mood, size: 270, wave: st.anim === 'cheer' })}</div>
        ${props[st.anim] || ''}
      </div>
    </div>`;
  }

  function mouthSvg(target) {
    const top = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${66 + i * 28}" y="${58 + Math.abs(i - 2.5) * 5}" width="26" height="30" rx="7" fill="#FFFFFF" stroke="#C9B8A4" stroke-width="2"/>`).join('');
    const bottom = [0, 1, 2, 3, 4].map((i) => `<rect x="${82 + i * 28}" y="${146 - Math.abs(i - 2) * 5}" width="26" height="26" rx="7" fill="#FFFFFF" stroke="#C9B8A4" stroke-width="2"/>`).join('');
    const hl = { teethTop: '<rect x="56" y="48" width="188" height="54" rx="18" class="target-hl"/>', teethBottom: '<rect x="72" y="128" width="156" height="50" rx="18" class="target-hl"/>', tongue: '<ellipse cx="150" cy="128" rx="70" ry="26" class="target-hl"/>' }[target] || '';
    return `<svg width="420" height="280" viewBox="0 0 300 200" aria-hidden="true">
      <path d="M14 76 Q150 -14 286 76 Q150 236 14 76Z" fill="#E07A7A" stroke="#B5543B" stroke-width="4"/>
      <path d="M40 78 Q150 14 260 78 Q150 206 40 78Z" fill="#7A2E2E"/>
      <ellipse cx="150" cy="132" rx="64" ry="24" fill="#F2A7BE"/>${top}${bottom}${hl}
    </svg>`;
  }
  function sinkSvg() {
    return `<svg width="300" height="230" viewBox="0 0 300 230" aria-hidden="true">
      <rect x="138" y="20" width="24" height="60" rx="8" fill="#D5DDE5" stroke="#3B2F2F" stroke-width="4"/><path d="M150 30 h50 v24" fill="none" stroke="#3B2F2F" stroke-width="10" stroke-linecap="round"/>
      <path d="M20 100 h260 q0 110 -130 110 q-130 0 -130 -110z" fill="#FFFFFF" stroke="#3B2F2F" stroke-width="5"/><ellipse cx="150" cy="104" rx="118" ry="16" fill="#DCEEF7"/><circle cx="150" cy="150" r="9" fill="#9C8B7A"/></svg>`;
  }

  // the child's side
  function youSide(st) {
    const L2 = S.les;
    const done = L2.stepDone;
    let inner = '';
    if (st.act === 'tap') {
      const art = st.prop === 'sink' ? sinkSvg() : st.prop === 'cup' ? emo('🥤', 180) : tapSvg(220);
      inner = `<button class="les-target tap-target ${done ? 'did' : ''}" data-a="lesTap" aria-label="${esc(st.say)}">${art}${done ? '<span class="drops big"><i></i><i></i><i></i><i></i></span>' : ''}</button>`;
    } else if (st.act === 'hold') {
      inner = `<button class="les-target les-hold ${done ? 'did' : ''}" aria-label="Press and hold">${emo(st.prop === 'soap' ? '🧼' : '🧴', 170)}<span class="hold-ring"></span></button><span class="les-hint">${ic('hand', 36)}<span>Press and hold</span></span>`;
    } else if (st.act === 'rub') {
      const art = /^teeth|tongue/.test(st.prop) ? mouthSvg(st.prop) : st.prop === 'towel' ? ic('towel', 230) : st.prop === 'zip' ? ic('bag', 230) : washHandsSvg(260, washMode(st));
      inner = `<div class="les-target rub-area ${done ? 'did' : ''}" style="--p:${done ? 1 : L2.progress}" role="button" aria-label="Rub here with your finger">${art}<div class="rub-bar"><div class="rub-fill" style="width:${Math.round(L2.progress * 100)}%"></div></div></div>
        <span class="les-hint">${ic('hand', 36)}<span>Rub with your finger</span></span>`;
    } else if (st.act === 'pick') {
      inner = `<div class="pick-row">${st.pick.map((e) => `<button class="pick-opt ${done && e === st.want ? 'right' : ''}" data-a="lesPick" data-v="${e}" aria-label="${esc(window.lumiPicLabel ? window.lumiPicLabel(e) : e)}">${emo(e, 110)}</button>`).join('')}</div>`;
    } else if (st.act === 'real') {
      inner = `<div class="real-card">${st.photo ? `<img src="${st.photo}" alt="">` : ic(st.icon || 'star', 200)}</div>`;
    } else {
      inner = `<div class="les-finish">${ic('star', 90)}${ic('star', 120)}${ic('star', 90)}</div>`;
    }
    return `<div class="panel les-side you-side ${done ? 'is-done' : ''}">
      <span class="who-chip you">${ic('person', 22)}<span>${esc(state.childName || 'You')}</span></span>
      <div class="you-stage">${inner}</div>
    </div>`;
  }

  A.PARENT.lesson = 'learn';
  A.VOICE.lesson = () => (S.les ? stepNow().say : '');
  A.SCREENS.lesson = () => {
    const L2 = S.les;
    const st = stepNow();
    const last = st.act === 'done';
    const nextBtn = last
      ? `<button class="primary" data-a="lesFinish" style="height:80px">${ic('star', 34)}<span>Finish</span></button>`
      : L2.stepDone
        ? `<button class="primary" data-a="lesNext" style="height:80px"><span>Next</span>${ic('arrow', 32)}</button>`
        : `<button class="primary soft-btn" data-a="lesNext" style="height:80px" aria-label="I did it for real">${ic('thumb', 32)}<span>I did it</span></button>`;
    return `
<section class="screen tight" aria-label="${esc(L2.name)}">
  ${A.srTitle(L2.name)}
  <div class="row between" style="height:56px;flex:none">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(st.say, 52)}<span class="game-chip" style="background:${L2.tint}">${lessonArt(L2, 28)}<span>${esc(L2.name)}</span></span></div>
    ${dots(L2.i + (L2.stepDone ? 1 : 0), L2.steps.length, 'var(--teal)', 18)}
  </div>
  <div class="row gap24 grow">${lumiSide(st)}${youSide(st)}</div>
  <div class="bar">
    ${A.speakBtn(st.say, 52)}<span class="les-say">${esc(st.say)}</span><span class="grow"></span>${nextBtn}
  </div>
</section>`;
  };

  A.AFTER.lesson = () => {
    const st = stepNow();
    const L2 = S.les;
    if (L2.stepDone) return;
    if (st.act === 'hold') {
      const t = A.stage.querySelector('.les-hold');
      let timer = null;
      const startHold = (e) => {
        e.preventDefault();
        t.classList.add('holding');
        tone(330, 0.8, 0.05);
        timer = setTimeout(() => { t.classList.remove('holding'); stepDone(); }, 1100);
      };
      const stopHold = () => { clearTimeout(timer); t.classList.remove('holding'); };
      t.addEventListener('pointerdown', startHold);
      t.addEventListener('pointerup', stopHold);
      t.addEventListener('pointerleave', stopHold);
      t.addEventListener('pointercancel', stopHold);
    }
    if (st.act === 'rub') {
      const area = A.stage.querySelector('.rub-area');
      const fill = area.querySelector('.rub-fill');
      const scale = () => A.stageScale();
      const need = A.level() === 1 ? 1300 : 2000;
      let last = null;
      let down = false;
      let counted = Math.floor(L2.progress * 10);
      area.addEventListener('pointerdown', (e) => { down = true; last = { x: e.clientX, y: e.clientY }; area.setPointerCapture(e.pointerId); });
      const up = () => { down = false; last = null; };
      area.addEventListener('pointerup', up);
      area.addEventListener('pointercancel', up);
      area.addEventListener('pointermove', (e) => {
        if (!down || L2.stepDone) return;
        const s = scale();
        const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y) / s;
        last = { x: e.clientX, y: e.clientY };
        L2.progress = Math.min(1, L2.progress + dist / need);
        fill.style.width = Math.round(L2.progress * 100) + '%';
        area.style.setProperty('--p', L2.progress.toFixed(3));
        area.classList.add('rubbing');
        clearTimeout(area._rubT);
        area._rubT = setTimeout(() => area.classList.remove('rubbing'), 260);
        if (Math.random() < 0.25 && area.querySelectorAll('.bubble-dot').length < 26) {
          const r = area.getBoundingClientRect();
          const b = document.createElement('span');
          b.className = 'bubble-dot';
          b.style.left = ((e.clientX - r.left) / s) + 'px';
          b.style.top = ((e.clientY - r.top) / s) + 'px';
          area.appendChild(b);
        }
        const tenth = Math.floor(L2.progress * 10);
        if (tenth > counted) {
          counted = tenth;
          tone(440 + tenth * 30, 0.15, 0.05);
          if (tenth < 10) say(String(tenth));
        }
        if (L2.progress >= 1) stepDone();
      });
    }
  };

  function stepDone() {
    const L2 = S.les;
    if (L2.stepDone) return;
    L2.stepDone = true;
    tone(784, 0.3, 0.09);
    setTimeout(() => tone(988, 0.4, 0.09), 140);
    render();
    say(pick(['Well done!', 'Great job!', 'You did it!']) + ' Tap Next.');
  }

  A.GUIDE.lesson = () => {
    const L2 = S.les;
    if (!L2) return null;
    const st = stepNow();
    if (st.act === 'done') return { sel: '[data-a="lesFinish"]', say: 'Tap Finish.' };
    if (L2.stepDone || st.act === 'real') return { sel: '[data-a="lesNext"]', say: st.act === 'real' ? 'Do it for real, then tap I did it.' : 'Tap Next.' };
    if (st.act === 'tap') return { sel: '[data-a="lesTap"]', say: st.say + ' Tap it.' };
    if (st.act === 'hold') return { sel: '.les-hold', say: 'Press and hold.' };
    if (st.act === 'rub') return { sel: '.rub-area', say: 'Rub with your finger, like Lumi.' };
    if (st.act === 'pick') return { sel: `[data-a="lesPick"][data-v="${st.want}"]`, say: st.say, quiet: !L2.wrong, delay: L2.wrong ? 300 : undefined };
    return null;
  };

  Object.assign(A.ACTIONS, {
    lesOpen: (d) => {
      const t = lessonList().find((x) => x.id === d.v);
      if (!t) return;
      const lv = A.level();
      S.les = Object.assign({}, t, { steps: t.steps.filter((s) => !s.min || s.min <= lv), i: 0, stepDone: false, progress: 0, wrong: 0 });
      go('lesson');
    },
    lesTap: () => {
      if (S.les.stepDone) return;
      tone(520, 0.3, 0.08);
      stepDone();
    },
    lesPick: (d, el) => {
      const st = stepNow();
      if (S.les.stepDone) return;
      if (d.v === st.want) { if (!S.les.wrong) track('correct', 'learn', { quiet: true }); stepDone(); return; }
      if (!S.les.wrong) track('tries', 'learn', { quiet: true });
      S.les.wrong += 1;
      el.classList.remove('wiggle-once');
      void el.offsetWidth;
      el.classList.add('wiggle-once');
      say('Not that one. ' + st.say);
      A.applyGuide();
    },
    lesNext: () => {
      const L2 = S.les;
      if (L2.i < L2.steps.length - 1) {
        L2.i += 1;
        L2.stepDone = false;
        L2.progress = 0;
        L2.wrong = 0;
        render();
        say(stepNow().say);
      }
    },
    lesFinish: () => {
      const L2 = S.les;
      state.stats.tutorials += 1;
      state.stats.tutDone[L2.id] = (state.stats.tutDone[L2.id] || 0) + 1;
      track('tutorials', L2.name);
      save();
      award(2);
      say(`You learned ${L2.name.toLowerCase()} with Lumi!`);
      S.history = S.history.filter((s) => s !== 'lesson');
      go('learn', '', { replace: true });
    }
  });
})();
