/*
  routinegames.js
  Hands-on routine steps. Instead of only tapping stars, the child plays the step with Lumi first,
  then does it for real ("Your turn!"):
  - Wake up:   open the curtains, pull the blanket down, slide Lumi out of bed onto the rug.
  - Teeth:     put toothpaste on the brush, brush the food bits off Lumi's smiling teeth, rinse.
               Then an optional 2-minute "Brush with Lumi" timer for the real thing.
  - Get dressed: Lumi walks to the wardrobe, the doors swing open, pyjamas go in the basket, then the
               child helps Lumi pick a shirt, shorts and socks, which float onto Lumi.
  - Breakfast: slide (or tap) each food to Lumi's mouth until Lumi's tummy is full.
  - Bus:       live bus arrival times (LTA DataMall, the same data the MyTransport.SG app uses),
               a bus that drives closer as the minutes go down, gentle reminders at the right
               moments, a car-spotting game while waiting, and tapping the bus card.
  Every drag can also be done with a simple tap, for children who find dragging hard.
  Grown-ups can switch these games off (Sensory tab) and set up live bus times (Child tab).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, chime, save, render, later, dots, speakBtn, fmt } = A;

  // ---------------------------------------------------------------- helpers
  const panel = () => A.stage.querySelector('.sg');
  const cur = () => S.day && S.day.game;
  const ack = () => tone(880, 0.25, 0.07);
  function local(e, box) {
    const r = box.getBoundingClientRect();
    const k = box.offsetWidth / r.width; // the stage may be scaled to fit the tablet
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  }
  // "Tap instead of drag" (Grown-ups › Sensory): for children who find dragging hard. Tap a thing to
  // pick it up (it glows), then tap where it goes. Rubbing: each tap on the place rubs a little.
  const tapMode = () => !!state.settings.tapMove;
  function wireTapDrop(box) {
    if (box.dataset.tapWired) return;
    box.dataset.tapWired = '1';
    box.addEventListener('pointerup', (e) => {
      const pk = S.picked;
      if (!tapMode() || !pk || pk.box !== box || e.lumiPicked || !document.body.contains(pk.el)) return;
      const p = local(e, box);
      const r = pk.el.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      const k = box.offsetWidth / (b.width || 1);
      const c = { x: (r.left - b.left + r.width / 2) * k, y: (r.top - b.top + r.height / 2) * k };
      if (pk.o.move) {
        // rubbing: a tap over the place counts as a short rub there
        S.tapMoving = true;
        for (let i = 0; i < 4; i++) pk.o.move(p, i % 2 ? -36 : 36, 0, { moved: 999 });
      }
      if (!pk.o.noMove) pk.el.style.transform = `translate(${p.x - c.x + (parseFloat(pk.dx) || 0)}px, ${p.y - c.y + (parseFloat(pk.dy) || 0)}px)`;
      const keep = pk.o.drop ? pk.o.drop(p, { moved: 999 }) : false;
      S.tapMoving = false;
      if (keep) { pk.el.classList.remove('tap-picked'); S.picked = null; return; }
      pk.el.classList.add('snap');
      pk.el.style.transform = '';
      setTimeout(() => pk.el.classList.remove('snap'), 300);
    });
  }
  A.tapPick = (el, box, o) => {
    if (S.picked && S.picked.el !== el) S.picked.el.classList.remove('tap-picked');
    S.picked = { el, box, o };
    el.classList.add('tap-picked');
    A.hideHand();
    tone(660, 0.12, 0.05);
    say(o.move && !o.drop ? 'Now tap where to rub.' : 'Now tap where it goes.');
  };
  // drag an element with a finger; a short tap without moving calls o.tap instead
  function drag(el, box, o) {
    wireTapDrop(box);
    if (tapMode()) {
      el.addEventListener('pointerup', (e) => {
        if (S.paused) return;
        e.lumiPicked = true;
        if (S.picked && S.picked.el === el && o.tap) { o.tap(local(e, box)); return; }
        A.tapPick(el, box, o);
      });
      return;
    }
    let st = null;
    el.addEventListener('pointerdown', (e) => {
      if (S.paused) return;
      e.preventDefault();
      const p = local(e, box);
      st = { x0: p.x, y0: p.y, lx: p.x, ly: p.y, moved: 0 };
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* old browser */ }
      el.classList.add('dragging');
      A.hideHand();
      if (o.start) o.start(p);
    });
    el.addEventListener('pointermove', (e) => {
      if (!st) return;
      const p = local(e, box);
      const dx = p.x - st.lx, dy = p.y - st.ly;
      st.moved += Math.hypot(dx, dy);
      st.lx = p.x; st.ly = p.y;
      if (!o.noMove) el.style.transform = `translate(${p.x - st.x0}px, ${p.y - st.y0}px)`;
      if (o.move) o.move(p, dx, dy, st);
    });
    const end = (e) => {
      if (!st) return;
      const s = st;
      st = null;
      el.classList.remove('dragging');
      const p = local(e, box);
      if (s.moved < 12 && o.tap) { el.style.transform = ''; o.tap(p); return; }
      const keep = o.drop ? o.drop(p, s) : false;
      if (!keep) { el.classList.add('snap'); el.style.transform = ''; setTimeout(() => el.classList.remove('snap'), 300); }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
  const near = (p, x, y, r) => Math.hypot(p.x - x, p.y - y) < r;
  function setPhase(g, ph, line) {
    g.phase = ph;
    render();
    if (line !== false) say(line || voiceFor(g));
  }
  function turnCard(info, text, pos) {
    return `<div class="sg-turn ${pos || ''}"><span class="sg-turn-art">${A.stepArt(info, 64)}</span><span class="sg-turn-txt"><b>Your turn!</b><span>${esc(text)}</span></span></div>`;
  }
  function updateDots(n, total) {
    const el = A.stage.querySelector('.sg-dots');
    if (el) el.innerHTML = dots(n, total, 'var(--green)', 24);
  }

  // ================================================================ the games
  const G = {};

  // ---------------------------------------------------------------- Wake up
  G.wake = {
    init: () => ({ blanket: 0 }),
    total: 3,
    progress: (g) => ({ 0: 0, 1: 1, 2: 2, turn: 3 })[g.phase],
    real: "I'm up!",
    voice: (g) => ({
      0: 'Lumi is still sleeping. Tap the curtains to let the sun in.',
      1: 'Good morning, Lumi! Pull the blanket down.',
      2: 'Now help Lumi get out of bed. Slide Lumi onto the rug.',
      turn: "Lumi is up! Big stretch. Now it's your turn. Get out of bed, like Lumi."
    })[g.phase],
    guide: (g) => ({
      0: { sel: '.wk-window', say: 'Tap the curtains.' },
      1: { sel: '.wk-blanket', say: 'Pull the blanket down with your finger.' },
      2: { sel: '.wk-lumi', say: 'Slide Lumi to the rug.' },
      turn: { sel: '[data-a="sgReal"]', say: "Get up, then tap I'm up." }
    })[g.phase],
    scene(g, info) {
      const ph = g.phase;
      const night = ph === 0;
      const mood = ph === 0 ? 'sleepy' : ph === 1 ? 'calm' : ph === 'turn' ? 'excited' : 'happy';
      const onRug = ph === 'turn';
      return `<div class="panel scene grow sg wk ${night ? 'night' : 'day'}">
        <button class="wk-window ${night ? '' : 'open'}" data-a="sgTap" data-k="curtain" aria-label="Open the curtains">
          <span class="wk-sky">${night ? `<span class="wk-moon">${ic('moon', 54)}</span>` : `<span class="wk-sun">${ic('sun', 74)}</span>`}</span>
          <span class="wk-curtain l"></span><span class="wk-curtain r"></span><span class="wk-rod"></span>
        </button>
        <div class="floor" style="height:22%"></div>
        <div class="wk-rug ${onRug ? 'on' : ''}"></div>
        <div class="wk-head"></div><div class="wk-pillow"></div>
        <div class="wk-lumi ${onRug ? 'on-rug hop' : ''}" ${ph === 2 ? 'role="button" aria-label="Slide Lumi onto the rug"' : ''}>${L.svg({ look: A.dayLook(), mood, size: 190, label: 'Lumi' })}</div>
        ${night ? '<span class="wk-z z1">z</span><span class="wk-z z2">z</span><span class="wk-z z3">Z</span>' : ''}
        <div class="wk-bed"></div>
        <div class="wk-blanket ${ph === 2 || onRug ? 'folded' : ''}" ${ph === 1 ? 'role="button" aria-label="Pull the blanket down"' : ''} style="${ph === 1 ? `transform:translateY(${g.blanket}px)` : ''}"><span class="wk-stars"></span></div>
        ${onRug ? turnCard(info, 'Get out of bed and stretch, like Lumi.') : ''}
      </div>`;
    },
    tap(g, k) {
      if (k === 'curtain' && g.phase === 0) { chime(); setPhase(g, 1); }
    },
    after(g, box) {
      if (g.phase === 1) {
        const b = box.querySelector('.wk-blanket');
        drag(b, box, {
          noMove: true,
          move: (p, dx, dy) => { g.blanket = Math.max(0, Math.min(120, g.blanket + dy)); b.style.transform = `translateY(${g.blanket}px)`; },
          drop: () => { if (g.blanket > 70) { ack(); setPhase(g, 2); return true; } g.blanket = 0; b.style.transform = ''; return true; },
          tap: () => { ack(); setPhase(g, 2); }
        });
      }
      if (g.phase === 2) {
        const el = box.querySelector('.wk-lumi');
        const rug = box.querySelector('.wk-rug');
        const rx = rug.offsetLeft + rug.offsetWidth / 2, ry = rug.offsetTop + rug.offsetHeight / 2;
        drag(el, box, {
          drop: (p) => { if (near(p, rx, ry - 60, 170)) { chime(); setPhase(g, 'turn'); return true; } return false; },
          tap: () => { chime(); setPhase(g, 'turn'); }
        });
      }
    }
  };

  // ---------------------------------------------------------------- Brush teeth
  // Lumi gives a big friendly grin (teeth together, no open mouth). A few soft yellow food bits sit on the
  // teeth to brush away.
  const TEETH_TOP = [[140, 245], [180, 248], [220, 248], [260, 245]];
  const TEETH_BOT = [[160, 283], [200, 287], [240, 283]];
  const SPOTS = TEETH_TOP.concat(TEETH_BOT);
  const FX = 70, FY = 14; // where the face sits in the scene
  function faceSvg(g) {
    const col = (L.COLORS[(state.look || {}).color] || L.COLORS.orange);
    const body = col.body, light = '#F7C79A';
    const shine = g.phase === 'turn';
    return `<svg class="tb-face" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="Lumi smiling with teeth showing">
      <circle cx="92" cy="92" r="48" fill="${body}"/><circle cx="308" cy="92" r="48" fill="${body}"/>
      <circle cx="92" cy="92" r="24" fill="${light}"/><circle cx="308" cy="92" r="24" fill="${light}"/>
      <ellipse cx="200" cy="215" rx="188" ry="178" fill="${body}"/>
      <ellipse cx="200" cy="292" rx="122" ry="78" fill="${light}"/>
      ${shine ? '<path d="M120 152 q20 -22 40 0 M240 152 q20 -22 40 0" fill="none" stroke="#3B2F2F" stroke-width="9" stroke-linecap="round"/>'
        : '<circle cx="140" cy="152" r="15" fill="#3B2F2F"/><circle cx="260" cy="152" r="15" fill="#3B2F2F"/><circle cx="145" cy="146" r="5" fill="#fff"/><circle cx="265" cy="146" r="5" fill="#fff"/>'}
      <ellipse cx="84" cy="210" rx="26" ry="15" fill="#EF8A7A" opacity=".5"/><ellipse cx="316" cy="210" rx="26" ry="15" fill="#EF8A7A" opacity=".5"/>
      <path d="M116 222 Q200 238 284 222 Q276 306 200 310 Q124 306 116 222 Z" fill="#fff" stroke="#C9705F" stroke-width="5" stroke-linejoin="round"/>
      <path d="M122 264 Q200 274 278 264" fill="none" stroke="#E6D9CB" stroke-width="3" stroke-linecap="round"/>
      <path d="M160 231v34M200 234v34M240 231v34M180 270v33M220 270v33" stroke="#EDE3D8" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M130 232 Q140 236 150 237" fill="none" stroke="#fff" stroke-width="4" opacity=".9"/>
      ${shine ? '<g fill="#fff"><path d="M168 236l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M246 272l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/></g><g fill="#BFE3F7"><path d="M300 236l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M94 262l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/></g>' : ''}
    </svg>`;
  }
  // soft yellow food bits (no faces, nothing scary)
  const BUG = '<svg viewBox="0 0 30 30" width="30" height="30"><path d="M15 5c5 0 9 3 9 8 0 6-4 10-9 10S6 19 6 13c0-5 4-8 9-8z" fill="#EBCB5E" opacity=".92"/><circle cx="12" cy="11" r="2.6" fill="#F7E7A8"/><circle cx="19" cy="17" r="1.6" fill="#D6AE3C"/></svg>';
  const BRUSH = (paste) => `<svg viewBox="0 0 240 70" width="240" height="70" aria-hidden="true">
    <rect x="70" y="26" width="166" height="20" rx="10" fill="#2F7E79" stroke="#3B2F2F" stroke-width="3"/>
    <rect x="150" y="30" width="60" height="12" rx="6" fill="#6FCBBE"/>
    <rect x="6" y="24" width="72" height="24" rx="8" fill="#fff" stroke="#3B2F2F" stroke-width="3"/>
    <path d="M12 24v-12M22 24v-12M32 24v-12M42 24v-12M52 24v-12M62 24v-12" stroke="#8EC9E8" stroke-width="5" stroke-linecap="round"/>
    ${paste ? '<path d="M8 10c8-8 16 4 24-2s16 4 24-2 12 2 14 4" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M8 10c8-8 16 4 24-2s16 4 24-2 12 2 14 4" fill="none" stroke="#7FD3C4" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 8"/>' : ''}
  </svg>`;
  G.teeth = {
    // Easy: half the food bits are already gone
    init: () => ({ paste: false, rub: SPOTS.map(() => 0), clean: SPOTS.map((_, k) => A.level() === 1 && k % 2 === 1), pre: A.level() === 1 ? Math.floor(SPOTS.length / 2) : 0, talked: false, half: false, timer: 0 }),
    total: (g) => 7 - (g.pre || 0),
    progress: (g) => g.clean.filter(Boolean).length - (g.pre || 0),
    real: 'I brushed!',
    voice: (g) => ({
      0: "Lumi has food bits on Lumi's teeth. First, tap the toothpaste.",
      1: 'Now brush the food bits away. Up and down, round and round.',
      2: 'All clean! Tap the cup to rinse.',
      turn: "Sparkly clean teeth! Now it's your turn. Brush your teeth, like Lumi."
    })[g.phase],
    guide: (g) => {
      if (g.phase === 0) return { sel: '.tb-paste', say: 'Tap the toothpaste.' };
      if (g.phase === 1) { const k = g.clean.indexOf(false); return { sel: `.tb-spot[data-k="spot${k}"]`, say: 'Scrub this tooth with the brush.' }; }
      if (g.phase === 2) return { sel: '.tb-cup', say: 'Tap the cup.' };
      return { sel: '[data-a="sgReal"]', say: 'Brush your teeth, then tap I brushed.' };
    },
    scene(g, info) {
      const spots = SPOTS.map(([x, y], k) => g.clean[k] ? '' : `<button class="tb-spot" data-a="sgTap" data-k="spot${k}" style="left:${FX + x - 15}px;top:${FY + y - 15}px" aria-label="Food bit ${k + 1}">${BUG}</button>`).join('');
      return `<div class="panel scene grow sg tb" style="background:#DCEFED">
        <div class="tb-tiles"></div>
        <div class="tb-facewrap" style="left:${FX}px;top:${FY}px">${faceSvg(g)}</div>
        ${spots}
        <div class="tb-foam"></div>
        ${g.phase === 0 ? `<button class="tb-paste" data-a="sgTap" data-k="paste" aria-label="Toothpaste"><svg viewBox="0 0 120 60" width="150" height="75"><path d="M10 14h70l24 10v12l-24 10H10z" fill="#fff" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/><rect x="104" y="22" width="12" height="16" rx="3" fill="#2F7E79" stroke="#3B2F2F" stroke-width="3"/><path d="M24 22h40v16H24z" fill="#6FCBBE"/><circle cx="44" cy="30" r="5" fill="#fff"/></svg></button>` : ''}
        ${g.phase === 2 || g.phase === 'turn' ? `<button class="tb-cup ${g.phase === 'turn' ? 'used' : ''}" data-a="sgTap" data-k="cup" aria-label="Rinse cup"><svg viewBox="0 0 80 100" width="96" height="120"><path d="M10 10h60l-8 84H18z" fill="#BFE3F7" stroke="#3B2F2F" stroke-width="4" stroke-linejoin="round"/><path d="M14 36h52l-5 56H19z" fill="#8EB8E5"/><path d="M22 20v40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg></button>` : ''}
        ${g.phase === 1 || g.phase === 0 ? `<div class="tb-brush ${g.paste ? 'ready' : ''}" role="button" aria-label="Toothbrush">${BRUSH(g.paste)}</div>` : ''}
        ${g.phase === 'turn' ? turnCard(info, 'Brush your teeth for two minutes. Lumi can count with you.', 'right') : ''}
        ${g.phase === 'turn' ? `<button class="sg-timer-btn ${g.timer ? 'on' : ''}" data-a="sgTap" data-k="timer">${g.timer ? `<span class="tb-ring" style="--p:${(120 - g.timer) / 120}"></span><span class="tb-time">${Math.floor(g.timer / 60)}:${String(g.timer % 60).padStart(2, '0')}</span>` : `${ic('clock', 30)}<span>Brush with Lumi</span>`}</button>` : ''}
      </div>`;
    },
    tap(g, k) {
      if (k === 'paste' && g.phase === 0) { g.paste = true; ack(); setPhase(g, 1); return; }
      if (k === 'cup' && g.phase === 2) { tone(520, 0.4, 0.07); later(() => tone(700, 0.4, 0.07), 200); setPhase(g, 'turn'); return; }
      if (k === 'timer' && g.phase === 'turn' && !g.timer) { startBrushTimer(g); return; }
      const m = /^spot(\d)$/.exec(k);
      if (m && g.phase === 1) rubSpot(g, Number(m[1]), 45); // three taps clean a tooth
    },
    after(g, box) {
      if (g.phase !== 1) return;
      const br = box.querySelector('.tb-brush');
      const foam = box.querySelector('.tb-foam');
      const bx = br.offsetLeft, by = br.offsetTop;
      let since = 0;
      drag(br, box, {
        start: () => { if (!g.talked) { g.talked = true; say('Up and down. Round and round.'); } },
        move: (p, dx, dy, st) => {
          const hx = bx + 40 + (p.x - st.x0), hy = by + 30 + (p.y - st.y0); // the brush head
          const dist = Math.hypot(dx, dy);
          since += dist;
          if (since > 24) {
            since = 0;
            const b = document.createElement('span');
            b.className = 'foam-b';
            b.style.left = hx - 9 + Math.random() * 18 + 'px';
            b.style.top = hy - 9 + Math.random() * 18 + 'px';
            foam.appendChild(b);
            if (foam.children.length > 36) foam.firstChild.remove();
          }
          SPOTS.forEach(([x, y], k) => { if (!g.clean[k] && near({ x: hx, y: hy }, FX + x, FY + y, 40)) rubSpot(g, k, dist); });
        },
        drop: () => false
      });
    }
  };
  function rubSpot(g, k, amount) {
    g.rub[k] += amount;
    const el = A.stage.querySelector(`.tb-spot[data-k="spot${k}"]`);
    if (el && !el.classList.contains('wiggle')) { el.classList.add('wiggle'); setTimeout(() => el.classList.remove('wiggle'), 300); }
    if (g.rub[k] < 130 || g.clean[k]) return;
    g.clean[k] = true;
    if (el) el.classList.add('gone');
    tone(620 + k * 70, 0.25, 0.06);
    const n = g.clean.filter(Boolean).length;
    updateDots(n - (g.pre || 0), SPOTS.length - (g.pre || 0));
    if (n === 4 && !g.half && !g.pre) { g.half = true; say('Great scrubbing! Now the bottom teeth.'); }
    if (n === SPOTS.length) later(() => { if (cur() === g) setPhase(g, 2); }, 500);
  }
  function startBrushTimer(g) {
    g.timer = 120;
    render();
    say("Let's brush together for two minutes. Top teeth first.");
    if (window.LumiAudio && !window.LumiAudio.playing && state.settings.sounds) { window.LumiAudio.play('lullaby'); g.music = true; }
    const id = A.every(() => {
      if (cur() !== g || S.screen !== 'routine') { clearInterval(id); if (g.music && window.LumiAudio) window.LumiAudio.stop(); return; }
      g.timer -= 1;
      if (g.timer === 90) say('Now the bottom teeth.');
      if (g.timer === 60) say('Halfway! The inside of your teeth now.');
      if (g.timer === 30) say('Nearly done. Brush your tongue gently.');
      const ring = A.stage.querySelector('.tb-ring');
      const t = A.stage.querySelector('.tb-time');
      if (ring) ring.style.setProperty('--p', (120 - g.timer) / 120);
      if (t) t.textContent = `${Math.floor(g.timer / 60)}:${String(g.timer % 60).padStart(2, '0')}`;
      if (g.timer <= 0) {
        clearInterval(id);
        g.timer = 0;
        if (g.music && window.LumiAudio) window.LumiAudio.stop();
        chime();
        say("Two minutes! All done. Tap I brushed.");
        render();
      }
    }, 1000);
  }

  // ---------------------------------------------------------------- Get dressed
  // Lumi walks to the wardrobe, the doors swing open, pyjamas go in the basket, then the child helps
  // Lumi choose a shirt, shorts and socks. Each one floats out of the wardrobe and onto Lumi.
  const DR_TOPS = [{ name: 'red shirt', c: '#EF6F5E', p: 'star' }, { name: 'yellow shirt', c: '#FFD23F', p: 'stripe' }];
  const DR_BOTS = [{ name: 'blue shorts', c: '#5B8FD9' }, { name: 'green shorts', c: '#7FB069' }];
  const DR_SOCKS = [{ name: 'pink socks', c: '#F59FBF' }, { name: 'white socks', c: '#FFFFFF' }];
  const DR_PART = { 2: ['top', DR_TOPS], 3: ['bottom', DR_BOTS], 4: ['socks', DR_SOCKS] };
  const STAR5 = (x, y, r, fill) => `<path d="M${x} ${y - r}l${r * 0.29} ${r * 0.6} ${r * 0.66} ${r * 0.1}-${r * 0.48} ${r * 0.46} ${r * 0.12} ${r * 0.66}-${r * 0.59}-${r * 0.31}-${r * 0.59} ${r * 0.31} ${r * 0.12}-${r * 0.66}-${r * 0.48}-${r * 0.46} ${r * 0.66}-${r * 0.1}z" fill="${fill}"/>`;
  const shirtArt = (t) => `<svg viewBox="0 0 100 92" width="100" height="92" aria-hidden="true"><path d="M50 14c0-6 4-10 8-8" fill="none" stroke="#6B4F3A" stroke-width="3" stroke-linecap="round"/><path d="M20 22 L50 14 L80 22" fill="none" stroke="#6B4F3A" stroke-width="3" stroke-linecap="round"/>
    <path d="M34 20 L50 26 L66 20 L92 34 L82 52 L72 46 L72 88 L28 88 L28 46 L18 52 L8 34 Z" fill="${t.c}" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/>
    ${t.p === 'star' ? STAR5(50, 58, 12, '#fff') : '<path d="M28 58h44M28 72h44" stroke="#fff" stroke-width="6" opacity=".8"/>'}</svg>`;
  const shortsArt = (t) => `<svg viewBox="0 0 100 66" width="100" height="66" aria-hidden="true"><path d="M14 8h72l7 52H59l-9-26-9 26H7z" fill="${t.c}" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/><path d="M14 18h72" stroke="#3B2F2F" stroke-width="2.5" opacity=".5"/></svg>`;
  const socksArt = (t) => `<svg viewBox="0 0 100 66" width="100" height="66" aria-hidden="true"><g stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round" fill="${t.c}"><path d="M14 6h20v30l10 10a8 8 0 0 1-6 14H22a10 10 0 0 1-10-10z"/><path d="M58 6h20v30l10 10a8 8 0 0 1-6 14H66a10 10 0 0 1-10-10z"/></g><path d="M14 14h20M58 14h20" stroke="#EF6F5E" stroke-width="4"/></svg>`;
  const pjArt = '<svg viewBox="0 0 100 92" width="100" height="92" aria-hidden="true"><path d="M34 12 L50 18 L66 12 L92 26 L82 44 L72 38 L72 86 L28 86 L28 38 L18 44 L8 26 Z" fill="#9CC7EE" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/><path d="M38 40l2 4 4 .5-3 3 .8 4.5-3.8-2-3.8 2 .8-4.5-3-3 4-.5zM62 62l2 4 4 .5-3 3 .8 4.5-3.8-2-3.8 2 .8-4.5-3-3 4-.5z" fill="#fff"/></svg>';
  // clothes drawn in Lumi's own coordinates, laid on top of Lumi
  function outfitSvg(g, size) {
    const shirt = (c, extra) => `<path d="M40 170 Q120 194 200 170 Q212 198 196 216 Q120 238 44 216 Q28 198 40 170 Z" fill="${c}" stroke="rgba(59,47,47,.35)" stroke-width="3"/>
      <path d="M40 172 Q22 178 14 196 L34 206 Q40 196 46 192 Z M200 172 Q218 178 226 196 L206 206 Q200 196 194 192 Z" fill="${c}" stroke="rgba(59,47,47,.35)" stroke-width="3"/>${extra || ''}`;
    let h = '';
    if (g.pj) h += shirt('#9CC7EE', STAR5(90, 200, 9, '#fff') + STAR5(150, 196, 9, '#fff'));
    else if (g.top != null) { const t = DR_TOPS[g.top]; h += shirt(t.c, t.p === 'star' ? STAR5(120, 202, 14, '#fff') : '<path d="M46 196 Q120 218 194 196 M50 208 Q120 230 190 208" stroke="#fff" stroke-width="6" fill="none" opacity=".8"/>'); }
    if (g.bottom != null) h += `<path d="M58 208 Q120 228 182 208 L186 226 Q154 232 124 226 L116 226 Q86 232 54 226 Z" fill="${DR_BOTS[g.bottom].c}" stroke="rgba(59,47,47,.35)" stroke-width="3"/>`;
    if (g.socks != null) h += `<g fill="${DR_SOCKS[g.socks].c}" stroke="rgba(59,47,47,.45)" stroke-width="3"><ellipse cx="88" cy="222" rx="21" ry="10"/><ellipse cx="152" cy="222" rx="21" ry="10"/></g><path d="M70 220h36M134 220h36" stroke="#EF6F5E" stroke-width="3"/>`;
    return `<svg class="dr-outfit" width="${size}" height="${size}" viewBox="-14 -14 268 268" aria-hidden="true">${h}</svg>`;
  }
  function dressedLumi(g, mood) {
    return `${L.svg({ look: Object.assign(A.dayLook(), { body: 'none' }), mood: mood || 'happy', size: 220, label: 'Lumi getting dressed' })}${outfitSvg(g, 220)}`;
  }
  // a piece of clothing floats from the wardrobe onto Lumi
  function flyTo(fromEl, box, html, done) {
    const b = box.getBoundingClientRect();
    const k = box.offsetWidth / b.width;
    const r = fromEl.getBoundingClientRect();
    const lu = box.querySelector('.dr-lumi').getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'dr-fly';
    f.innerHTML = html;
    f.style.left = (r.left - b.left) * k + 'px';
    f.style.top = (r.top - b.top) * k + 'px';
    box.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      f.style.transform = `translate(${(lu.left + lu.width / 2 - r.left - r.width / 2) * k}px, ${(lu.top + lu.height * 0.62 - r.top - r.height / 2) * k}px) scale(.7) rotate(360deg)`;
      f.style.opacity = '0.2';
    }));
    setTimeout(() => { f.remove(); done(); }, 700);
  }
  G.dressed = {
    init: () => ({ pj: true, top: null, bottom: null, socks: null, busy: false }),
    total: 5,
    progress: (g) => ({ 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, turn: 5 })[g.phase],
    real: "I'm dressed!",
    voice: (g) => ({
      0: 'Time to get dressed! Tap the wardrobe to open it.',
      1: 'First, pyjamas off. Tap Lumi to put the pyjamas in the basket.',
      2: 'Which shirt should Lumi wear? Tap one.',
      3: 'Now shorts. Which ones?',
      4: 'Last, socks. Pick a pair.',
      turn: "Lumi looks great! Now it's your turn. Pyjamas off, then shirt, shorts and socks."
    })[g.phase],
    guide: (g) => {
      if (g.phase === 0) return { sel: '.dr-wardrobe', say: 'Tap the wardrobe.' };
      if (g.phase === 1) return { sel: '.dr-lumi', say: 'Tap the pyjamas.' };
      if (g.phase === 'turn') return { sel: '[data-a="sgReal"]', say: "Get dressed, then tap I'm dressed." };
      const [part] = DR_PART[g.phase];
      return { sel: `.dr-item[data-k="${part}0"]`, say: 'Choose one for Lumi.' };
    },
    scene(g, info) {
      const ph = g.phase;
      const open = ph !== 0;
      const pick = DR_PART[ph] ? DR_PART[ph][0] : '';
      const item = (part, list, art, k, x, y) => {
        const used = g[part] != null;
        const on = pick === part && !g.busy;
        return used && g[part] === k ? '' : `<button class="dr-item ${on ? 'pickme' : ''}" data-a="sgTap" data-k="${part}${k}" ${on ? '' : 'disabled'} style="left:${x}px;top:${y}px" aria-label="${esc(list[k].name)}">${art(list[k])}</button>`;
      };
      const where = ph === 'turn' ? 'done' : open ? 'near' : '';
      const fresh = g.fresh || '';
      return `<div class="panel scene grow sg dr ${fresh ? 'fresh-' + fresh : ''}" style="background:#DCEEF7">
        <div class="floor" style="height:22%"></div>
        <div class="dr-rug"></div>
        <div class="dr-basket ${g.pj ? '' : 'full'}">${g.pj ? '' : `<span class="dr-pj-in">${pjArt}</span>`}<svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true"><path d="M8 20h104l-10 66H18z" fill="#E8C99B" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/><path d="M14 40h92M16 58h88M18 74h84" stroke="#C9A27E" stroke-width="3"/></svg></div>
        <button class="dr-wardrobe ${open ? 'open' : ''}" data-a="sgTap" data-k="wardrobe" aria-label="Open the wardrobe" ${open ? 'tabindex="-1"' : ''}>
          <span class="dr-inside"><span class="dr-rail"></span><span class="dr-shelf s1"></span><span class="dr-shelf s2"></span></span>
          <span class="dr-door l"><span class="dr-knob"></span></span><span class="dr-door r"><span class="dr-knob"></span></span>
        </button>
        ${open ? item('top', DR_TOPS, shirtArt, 0, 638, 52) + item('top', DR_TOPS, shirtArt, 1, 758, 52)
          + item('bottom', DR_BOTS, shortsArt, 0, 638, 178) + item('bottom', DR_BOTS, shortsArt, 1, 758, 178)
          + item('socks', DR_SOCKS, socksArt, 0, 638, 272) + item('socks', DR_SOCKS, socksArt, 1, 758, 272) : ''}
        <div class="dr-lumi ${where} ${ph === 'turn' ? 'twirl' : ''}" ${ph === 1 ? 'role="button" aria-label="Take off the pyjamas"' : ''}>${dressedLumi(g, ph === 'turn' ? 'excited' : 'happy')}</div>
        ${ph === 1 ? `<span class="dr-think">${pjArt}${ic('arrow', 28)}<span class="dr-mini-basket"></span></span>` : ''}
        ${ph === 'turn' ? `<span class="dr-sparkles">${ic('sparkle', 40)}${ic('sparkle', 30)}${ic('sparkle', 36)}</span>` + turnCard(info, 'Pyjamas off, then shirt, shorts and socks, like Lumi.') : ''}
      </div>`;
    },
    tap(g, k, el) {
      const box = panel();
      if (k === 'wardrobe' && g.phase === 0) {
        tone(440, 0.3, 0.06); later(() => tone(660, 0.3, 0.06), 180);
        g.fresh = 'open';
        setPhase(g, 1);
        return;
      }
      const m = /^(top|bottom|socks)(\d)$/.exec(k);
      if (!m || g.busy || !DR_PART[g.phase] || DR_PART[g.phase][0] !== m[1]) return;
      const part = m[1], idx = Number(m[2]);
      const list = DR_PART[g.phase][1];
      g.busy = true;
      el.style.visibility = 'hidden';
      say('The ' + list[idx].name + '!');
      flyTo(el, box, el.innerHTML, () => {
        if (cur() !== g) return;
        g[part] = idx;
        g.busy = false;
        ack();
        const next = { 2: 3, 3: 4, 4: 'turn' }[g.phase];
        if (next === 'turn') { chime(); g.fresh = 'done'; }
        setPhase(g, next);
      });
    },
    after(g, box) {
      g.fresh = ''; // the opening and walking animations only play once
      if (g.phase !== 1) return;
      const lu = box.querySelector('.dr-lumi');
      const basket = box.querySelector('.dr-basket');
      const off = () => {
        if (!g.pj) return;
        g.pj = false;
        flyToBasket(box, basket, lu, () => { ack(); say('Into the basket!'); setPhase(g, 2); });
        lu.innerHTML = dressedLumi(g);
      };
      drag(lu, box, {
        noMove: true,
        drop: (p) => { if (p.x < 300) off(); return true; },
        tap: off
      });
    }
  };
  function flyToBasket(box, basket, from, done) {
    const b = box.getBoundingClientRect();
    const k = box.offsetWidth / b.width;
    const r = from.getBoundingClientRect();
    const t = basket.getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'dr-fly';
    f.innerHTML = pjArt;
    const x0 = (r.left + r.width / 2 - b.left) * k - 50, y0 = (r.top + r.height * 0.7 - b.top) * k - 46;
    f.style.left = x0 + 'px';
    f.style.top = y0 + 'px';
    box.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      f.style.transform = `translate(${(t.left + t.width / 2 - b.left) * k - 50 - x0}px, ${(t.top - b.top) * k - 30 - y0}px) scale(.6) rotate(-200deg)`;
    }));
    setTimeout(() => { f.remove(); done(); }, 700);
  }

  // ---------------------------------------------------------------- food pictures
  // Soft, picture-book food: no dark outlines, gentle shading, dishes seen from a little above (like a
  // table in a children's book). Shared by breakfast here and by lunch, dinner, cooking and the hawker centre.
  const SHADOW = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.16}" fill="#6B4A3A" opacity=".16"/>`;
  const PLATE = (cx, cy, rx, ry, col) => `${SHADOW(cx, cy + ry * 0.75, rx * 0.92)}<ellipse cx="${cx}" cy="${cy + ry * 0.18}" rx="${rx}" ry="${ry}" fill="${col ? col[1] : '#C7D9E6'}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col ? col[0] : '#E4EEF5'}"/><ellipse cx="${cx}" cy="${cy + ry * 0.04}" rx="${rx * 0.74}" ry="${ry * 0.68}" fill="#fff"/>`;
  // a bowl seen from a little above: body, rim and the dark inside
  const BOWL = (body, dark, rim) => `${SHADOW(50, 75, 32)}<path d="M10 38h80c-1 22-17 36-40 36S11 60 10 38z" fill="${body}"/><path d="M14 52c8 14 20 20 36 20s28-6 36-20c-6 18-18 22-36 22S20 70 14 52z" fill="${dark}" opacity=".55"/>
    <path d="M18 46c3 10 10 16 18 19" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".45"/><ellipse cx="50" cy="38" rx="40" ry="10" fill="${rim}"/>`;
  const FOODART = {
    rice: { vb: '0 0 100 80', body: `${BOWL('#6FA8DC', '#3F70B5', '#9CC8EE')}<ellipse cx="50" cy="38.5" rx="36" ry="8" fill="#4E7FBE"/>
      <path d="M15 39c1-15 15-26 35-26s34 11 35 26c-10 4-22 6-35 6s-25-2-35-6z" fill="#FFFEFA"/><path d="M60 15c13 3 24 12 25 24-6 2-12 3.6-19 4.6 4-9 2-20-6-28.6z" fill="#EDE8DD"/>
      ${[[30, 26], [40, 20], [52, 18], [62, 24], [36, 33], [48, 28], [70, 32], [26, 36], [56, 35]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.3" fill="#E8E2D4" transform="rotate(${i * 37} ${x} ${y})"/>`).join('')}` },
    chicken: { vb: '0 0 100 80', body: `${PLATE(50, 52, 46, 15)}<path d="M20 50c-2-8 6-14 14-12 2-6 12-6 14 0-6 2-10 8-10 14-8 2-16 2-18-2z" fill="#8BC86A"/><path d="M26 48c2-4 6-6 10-5" stroke="#6DAE4E" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g transform="rotate(-18 52 44)"><ellipse cx="46" cy="44" rx="17" ry="11" fill="#D98A3A"/><ellipse cx="45" cy="41" rx="14" ry="7.5" fill="#F0AE55"/><ellipse cx="41" cy="38.5" rx="5" ry="2" fill="#FFD48A" opacity=".8"/><rect x="60" y="41" width="12" height="5" rx="2.5" fill="#F7EBDD"/><circle cx="73" cy="41.6" r="3.6" fill="#FBF3E8"/><circle cx="73" cy="46.4" r="3.6" fill="#FBF3E8"/></g>
      <g transform="rotate(14 66 50)"><ellipse cx="60" cy="52" rx="15" ry="10" fill="#D98A3A"/><ellipse cx="59" cy="49.4" rx="12" ry="6.6" fill="#F0AE55"/><rect x="72" y="49" width="10" height="5" rx="2.5" fill="#F7EBDD"/><circle cx="83" cy="49.4" r="3.2" fill="#FBF3E8"/><circle cx="83" cy="54" r="3.2" fill="#FBF3E8"/></g>` },
    veg: { vb: '0 0 100 80', body: `${PLATE(50, 50, 46, 15)}
      ${[[24, 47], [36, 42], [50, 40], [64, 42], [76, 47]].map(([x, y], i) => i % 2
        ? `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.4" fill="#E2483B"/><ellipse cx="${x}" cy="${y - 0.6}" rx="7.6" ry="4.6" fill="#F26B57"/><path d="M${x - 4} ${y - 1}q4 2 8 0M${x} ${y - 4}v6" stroke="#FFB3A3" stroke-width="1.2" fill="none" opacity=".9"/>`
        : `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.4" fill="#4E9A3A"/><ellipse cx="${x}" cy="${y - 0.6}" rx="8.2" ry="5" fill="#CDEBA8"/><ellipse cx="${x}" cy="${y - 0.6}" rx="4.4" ry="2.6" fill="#E9F6D4"/>${[-2.4, 0, 2.4].map((d) => `<circle cx="${x + d}" cy="${y - 0.6}" r=".7" fill="#A9CF7E"/>`).join('')}`).join('')}
      ${[[30, 55], [44, 52], [58, 52], [70, 55]].map(([x, y], i) => i % 2 ? `<ellipse cx="${x}" cy="${y}" rx="9" ry="5.6" fill="#4E9A3A"/><ellipse cx="${x}" cy="${y - 0.5}" rx="7.4" ry="4.4" fill="#CDEBA8"/><ellipse cx="${x}" cy="${y - 0.5}" rx="3.8" ry="2.2" fill="#E9F6D4"/>`
        : `<ellipse cx="${x}" cy="${y}" rx="9" ry="5.6" fill="#E2483B"/><ellipse cx="${x}" cy="${y - 0.5}" rx="6.8" ry="4" fill="#F26B57"/>`).join('')}` },
    fish: { vb: '0 0 100 80', body: `${PLATE(50, 50, 46, 15)}<path d="M22 48c2-8 14-12 30-12s26 4 28 10c-2 8-14 12-30 12s-27-4-28-10z" fill="#EE8B6A"/><path d="M24 46c4-6 14-8 28-8s22 3 26 7c-4 2-14 4-28 4s-22-1-26-3z" fill="#F7A889"/>
      <path d="M34 40q4 6 0 13M46 38q4 8 0 17M58 38q4 8 0 17M70 40q3 6 0 13" stroke="#FFD2C0" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M70 52c4-6 12-6 16 0-4 4-12 4-16 0z" fill="#FFE066"/><path d="M71 52c4-4 10-4 14 0" stroke="#FFF6B0" stroke-width="1.6" fill="none"/><circle cx="26" cy="54" r="3" fill="#7CC26A"/><circle cx="21" cy="52" r="2.6" fill="#8FD07A"/><circle cx="24" cy="57.5" r="2.4" fill="#6DAE4E"/>` },
    soup: { vb: '0 0 100 80', body: `<path d="M40 22q-4-6 0-12M52 20q-4-6 0-12M64 22q-4-6 0-12" stroke="#E7DCD0" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".9"/>${BOWL('#7CC0B6', '#3F8F84', '#A9DDD5')}
      <ellipse cx="50" cy="38.5" rx="35" ry="7.6" fill="#E9964C"/><ellipse cx="50" cy="37.4" rx="30" ry="5.6" fill="#F3AE62"/>
      <circle cx="38" cy="37" r="5" fill="#FFF3DC"/><path d="M34.6 37a3.4 3.4 0 0 1 6.8 0" stroke="#E9C996" stroke-width="1.4" fill="none"/><circle cx="58" cy="36" r="5" fill="#FFF3DC"/><path d="M54.6 36a3.4 3.4 0 0 1 6.8 0" stroke="#E9C996" stroke-width="1.4" fill="none"/>
      <path d="M46 40c2-3 6-3 8 0-2 2-6 2-8 0zM64 41c2-3 6-3 8 0-2 2-6 2-8 0zM28 41c2-2.6 5-2.6 7 0-2 1.8-5 1.8-7 0z" fill="#6DAE4E"/>` },
    glass: { vb: '0 0 60 90', body: `${SHADOW(30, 86, 20)}<path d="M8 10h44l-5 72c-.2 3-2.8 5-6 5H19c-3.2 0-5.8-2-6-5z" fill="#E8F4FA" opacity=".9"/><path d="M10.6 32h38.8l-3.4 49.6c-.2 2.6-2.2 4.4-4.8 4.4H18.8c-2.6 0-4.6-1.8-4.8-4.4z" fill="#9AD3F0"/>
      <ellipse cx="30" cy="32" rx="19.4" ry="3.4" fill="#BFE6F8"/><ellipse cx="30" cy="10" rx="22" ry="4" fill="#F6FBFE"/><ellipse cx="30" cy="10" rx="19" ry="2.8" fill="#DDEFF8"/><path d="M15 18l2.4 58" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` },
    noodles: { vb: '0 0 100 80', body: `<path d="M70 2 52 34M80 6 58 36" stroke="#B5814C" stroke-width="4" stroke-linecap="round"/><path d="M70 2 66 9M80 6 76 12" stroke="#E07A5F" stroke-width="4" stroke-linecap="round"/>${BOWL('#E8775E', '#B84A35', '#F49A82')}
      <ellipse cx="50" cy="38.5" rx="35" ry="7.6" fill="#E9B44C"/><path d="M18 38c5-5 8 3 13-2s8 3 13-2 8 3 13-2 8 3 13-2 6 2 9 4" stroke="#FFD97A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 41c5-4 8 2 13-1.6s8 2 13-1.6 8 2 13-1.6 8 2 13-1.6" stroke="#F2C35E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="35" rx="8" ry="5" fill="#fff"/><ellipse cx="36" cy="35.2" rx="4.2" ry="3" fill="#FFB627"/><path d="M56 34c3-6 10-7 14-3-3 5-9 6-14 3z" fill="#5FAE4A"/><path d="M57 34c3-3 8-4 12-3" stroke="#B9E59A" stroke-width="1.4" fill="none"/>` },
    // breakfast
    toast: { vb: '0 0 60 60', body: `${SHADOW(30, 56, 22)}<path d="M9 28C2 12 14 4 30 4s28 8 21 24v24c0 2.2-1.8 4-4 4H13c-2.2 0-4-1.8-4-4z" fill="#C67F3C"/><path d="M14 30c-4-11 4-18 16-18s20 7 16 18v21H14z" fill="#F3C877"/>
      <path d="M16 31c-2-8 4-13 12-14" stroke="#FFE3A6" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="22" y="28" width="16" height="12" rx="3" fill="#FFE98A"/><rect x="22" y="28" width="16" height="5" rx="2.5" fill="#FFF6C4"/>` },
    egg: { vb: '0 0 60 50', body: `${SHADOW(30, 44, 22)}<path d="M6 26c0-12 10-20 22-18 8-6 20-2 24 8 6 10-2 24-18 24-8 4-20 2-24-4-3-3-4-6-4-10z" fill="#FFFDF8"/><path d="M8 32c4 6 14 9 22 7 10 2 20-2 22-10-2 12-12 16-20 15-8 3-18 1-22-4z" fill="#EFE7D8"/>
      <circle cx="29" cy="24" r="9.5" fill="#F9A21B"/><circle cx="29" cy="23" r="8" fill="#FFBE3B"/><ellipse cx="26" cy="20" rx="2.6" ry="1.8" fill="#FFF1C2"/>` },
    banana: { vb: '0 0 64 50', body: `${SHADOW(32, 46, 22)}<path d="M5 10c4 20 22 32 48 26 5-1.4 7-4.4 6-6.4-20 6-37-3-46-20-2-3.6-8.4-3.4-8 .4z" fill="#F2B930"/><path d="M6 10c6 14 20 24 44 22 4-.4 7-1.4 9-2.4-20 5-36-4-45-19.6-2-3.4-8-3.4-8 0z" fill="#FFD84D"/>
      <path d="M11 12c6 10 16 16 30 17" stroke="#FFEFA0" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M5 10l-2-5 4-1 2 4z" fill="#7A5A2E"/><circle cx="58.6" cy="31" r="2" fill="#7A5A2E"/>` },
    milk: { vb: '0 0 50 80', body: `${SHADOW(25, 77, 17)}<path d="M6 7h38l-4.4 64c-.2 3-2.6 5-5.6 5H16c-3 0-5.4-2-5.6-5z" fill="#E8F2F8"/><path d="M8.2 22h33.6l-3.4 49c-.2 2.4-2 4-4.4 4H16c-2.4 0-4.2-1.6-4.4-4z" fill="#FFFFFF"/>
      <ellipse cx="25" cy="22" rx="16.8" ry="3" fill="#F4F8FB"/><ellipse cx="25" cy="7" rx="19" ry="3.4" fill="#F6FBFE"/><ellipse cx="25" cy="7" rx="16.6" ry="2.4" fill="#DDEBF4"/><path d="M13 14l2 52" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M36 26l-2 42" stroke="#DCE8F0" stroke-width="2.4" stroke-linecap="round"/>` },
    // cooking
    wholeEgg: { vb: '0 0 60 70', body: `${SHADOW(30, 66, 18)}<ellipse cx="30" cy="38" rx="21" ry="27" fill="#F2E3CC"/><ellipse cx="28" cy="35" rx="18" ry="24" fill="#FFF6E8"/><ellipse cx="22" cy="24" rx="4.6" ry="7" fill="#fff" opacity=".9"/>` },
    carrot: { vb: '0 0 60 90', body: `<path d="M30 24c-4-8-14-14-20-12 4 8 12 12 20 12zM30 24c0-10 2-18 8-22 2 10-2 18-8 22zM30 24c6-6 16-8 20-4-6 6-14 6-20 4z" fill="#5FAE4A"/>
      <path d="M18 26c4-4 20-4 24 0L33 82c-.6 4-5.4 4-6 0z" fill="#EF8A2E"/><path d="M30 26c6 0 10 1 12 2L34 80c-.4 2.8-2 3.4-3 2.6z" fill="#F7A54A"/><path d="M22 38h6M26 52h5M24 64h4M33 44h5" stroke="#D4701C" stroke-width="2" stroke-linecap="round"/>` },
    tomato: { vb: '0 0 70 70', body: `${SHADOW(35, 66, 22)}<circle cx="35" cy="40" r="25" fill="#E2483B"/><circle cx="32" cy="37" r="21" fill="#F26350"/><ellipse cx="24" cy="30" rx="5" ry="7" fill="#FF9C8A" opacity=".8" transform="rotate(-30 24 30)"/>
      <path d="M35 18l-9-4 6 7-10 1 11 3-2 6 4-5 4 5-2-6 11-3-10-1 6-7z" fill="#4E9A3A"/><path d="M35 18v-7" stroke="#4E9A3A" stroke-width="3" stroke-linecap="round"/>` },
    // the wooden tray the dishes sit on
    tray: { vb: '0 0 320 64', body: `<ellipse cx="160" cy="44" rx="154" ry="18" fill="#6B4A3A" opacity=".14"/><rect x="6" y="14" width="308" height="36" rx="18" fill="#C8875A"/><rect x="6" y="10" width="308" height="34" rx="17" fill="#E2A672"/><rect x="18" y="16" width="284" height="22" rx="11" fill="#EDB988"/>` }
  };
  // breakfast dishes: each on its own plate
  const noShadow = (b) => b.replace(/<ellipse[^>]*opacity=".16"\/>/, '');
  FOODART.toastPlate = { vb: '0 0 110 88', body: `${PLATE(55, 66, 50, 16)}<g transform="translate(25 6)">${noShadow(FOODART.toast.body)}</g>` };
  FOODART.eggPlate = { vb: '0 0 110 88', body: `${PLATE(55, 64, 50, 16)}<g transform="translate(19 28) scale(1.2)">${noShadow(FOODART.egg.body)}</g>` };
  FOODART.bananaPlate = { vb: '0 0 110 88', body: `${PLATE(55, 64, 50, 16)}<circle cx="34" cy="60" r="7" fill="#D93A3A"/><circle cx="33" cy="58.6" r="5.6" fill="#F0524A"/><path d="M30 54l3 2 3-2" stroke="#5FAE4A" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="44" cy="64" r="6.4" fill="#D93A3A"/><circle cx="43" cy="62.6" r="5" fill="#F0524A"/><path d="M40 58l3 2 3-2" stroke="#5FAE4A" stroke-width="2" fill="none" stroke-linecap="round"/><g transform="translate(26 22) scale(1.05)">${noShadow(FOODART.banana.body)}</g>` };
  const foodSvg = (id, w, h) => { const f = FOODART[id]; return `<svg viewBox="${f.vb}" width="${w || '100%'}" height="${h || '100%'}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${f.body}</svg>`; };
  A.FOODART = FOODART;
  A.foodSvg = foodSvg;

  // ---------------------------------------------------------------- Breakfast
  const FOODS = [
    { id: 'toast', label: 'toast', x: 236, y: 281, w: 132, say: 'Crunch, crunch!', svg: foodSvg('toastPlate', 132, 106) },
    { id: 'egg', label: 'egg', x: 378, y: 281, w: 132, say: 'Mmm, yummy egg!', svg: foodSvg('eggPlate', 132, 106) },
    { id: 'banana', label: 'banana', x: 520, y: 281, w: 132, say: 'Yummy banana and strawberries!', svg: foodSvg('bananaPlate', 132, 106) },
    { id: 'milk', label: 'milk', x: 662, y: 235, w: 80, say: 'Glug, glug, glug!', svg: foodSvg('milk', 80, 128) },
  ];
  const MOUTH = { x: 489, y: 262 };
  G.breakfast = {
    // Easy: just the toast and the milk
    init: () => { const skip = FOODS.map((f) => A.level() === 1 && f.id !== 'toast' && f.id !== 'milk'); return { eaten: skip.slice(), skip }; },
    total: (g) => FOODS.length - (g.skip || []).filter(Boolean).length,
    progress: (g) => g.eaten.filter(Boolean).length - (g.skip || []).filter(Boolean).length,
    real: 'I ate!',
    voice: (g) => g.phase === 'turn'
      ? "Lumi's tummy is full and happy! Now it's your turn to eat your breakfast."
      : 'Lumi is hungry! Slide the food to Lumi’s mouth. You can tap the food too.',
    guide: (g) => {
      if (g.phase === 'turn') return { sel: '[data-a="sgReal"]', say: 'Eat your breakfast, then tap I ate.' };
      const k = g.eaten.indexOf(false);
      if (k < 0) return null;
      return { sel: `.bf-food[data-k="${k}"]`, say: `Give Lumi the ${FOODS[k].label}.` };
    },
    scene(g, info) {
      const full = g.phase === 'turn';
      return `<div class="panel scene grow sg bf" style="background:#FFF1C2">
        <div class="bf-window"></div>
        <div class="bf-lumi ${full ? 'hop' : ''}">${L.svg({ look: A.dayLook(), mood: full ? 'excited' : 'happy', size: 280, label: 'Lumi at the table' })}</div>
        <div class="bf-table"></div>
        ${FOODS.map((f, k) => g.eaten[k] ? '' : `<div class="bf-food" data-k="${k}" role="button" aria-label="Give Lumi the ${f.label}" style="left:${f.x}px;top:${f.y}px">${f.svg}</div>`).join('')}
        ${full ? turnCard(info, 'Eat your breakfast at the table, like Lumi.', 'right') : ''}
      </div>`;
    },
    after(g, box) {
      if (g.phase === 'turn') return;
      box.querySelectorAll('.bf-food').forEach((el) => {
        const k = Number(el.dataset.k);
        const f = FOODS[k];
        const eat = () => {
          if (g.eaten[k]) return;
          g.eaten[k] = true;
          el.classList.add('eaten');
          const lu = box.querySelector('.bf-lumi');
          if (lu) { lu.innerHTML = L.svg({ look: A.dayLook(), mood: 'excited', size: 280, label: 'Lumi eating' }); lu.classList.add('chomp'); }
          tone(392, 0.12, 0.08); later(() => tone(330, 0.12, 0.08), 160);
          say(f.say);
          updateDots(G.breakfast.progress(g), G.breakfast.total(g));
          later(() => {
            if (cur() !== g) return;
            if (g.eaten.every(Boolean)) { chime(); setPhase(g, 'turn'); return; }
            const l2 = box.querySelector('.bf-lumi');
            if (l2) { l2.classList.remove('chomp'); l2.innerHTML = L.svg({ look: A.dayLook(), mood: 'happy', size: 280, label: 'Lumi at the table' }); }
          }, 1100);
        };
        drag(el, box, {
          drop: (p) => { if (near(p, MOUTH.x, MOUTH.y, 120)) { eat(); return true; } return false; },
          tap: () => {
            // the food flies to Lumi's mouth by itself
            el.classList.add('fly');
            el.style.transform = `translate(${MOUTH.x - f.x - f.w / 2}px, ${MOUTH.y - f.y - 30}px) scale(.6)`;
            setTimeout(eat, 450);
          }
        });
      });
    }
  };

  // ---------------------------------------------------------------- Bus (live arrival times)
  // LTA DataMall's Bus Arrival API needs an AccountKey and does not allow browsers to call it
  // directly, so the app asks a tiny relay (see tools/bus-relay-worker.js). Without one, Lumi
  // runs a short practice countdown instead.
  async function busFetch() {
    const b = state.bus || {};
    const base = (b.proxy || '').trim();
    if (!b.stop) throw new Error('Add the bus stop number first.');
    if (!base) throw new Error('Add the relay link first.');
    const url = base + (base.includes('?') ? '&' : '?') + 'BusStopCode=' + encodeURIComponent(b.stop.trim());
    const headers = { accept: 'application/json' };
    if (b.key) headers.AccountKey = b.key.trim();
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error('The relay answered ' + r.status + '.');
    const j = await r.json();
    const list = j.Services || [];
    const sv = list.find((s) => !b.service || String(s.ServiceNo).toUpperCase() === b.service.trim().toUpperCase());
    if (!sv) throw new Error(b.service ? `Bus ${b.service} is not running at stop ${b.stop} right now.` : 'No buses found at this stop right now.');
    const mins = (nb) => (nb && nb.EstimatedArrival ? Math.max(0, Math.round((new Date(nb.EstimatedArrival) - Date.now()) / 60000)) : null);
    const nb = sv.NextBus || {};
    return { service: sv.ServiceNo, mins: mins(nb), next: mins(sv.NextBus2), load: nb.Load || '', type: nb.Type || '', wab: nb.Feature === 'WAB' };
  }
  A.busFetch = busFetch;

  const CAR_COLOURS = [['red', '#EF6F5E'], ['blue', '#5B8FD9'], ['yellow', '#FFD23F'], ['green', '#7FB069']];
  const BUS_SVG = (num) => `<svg viewBox="0 0 220 120" width="220" height="120" aria-hidden="true">
    <rect x="6" y="10" width="208" height="88" rx="16" fill="#7FB069" stroke="#3B2F2F" stroke-width="4"/>
    <rect x="6" y="64" width="208" height="12" fill="#5E9A4A"/>
    <rect x="16" y="22" width="40" height="62" rx="6" fill="#BFE3F7" stroke="#3B2F2F" stroke-width="3" class="bus-door"/>
    <path d="M36 24v58" stroke="#3B2F2F" stroke-width="2"/>
    <rect x="66" y="22" width="40" height="32" rx="6" fill="#DCEEF7" stroke="#3B2F2F" stroke-width="3"/>
    <rect x="114" y="22" width="40" height="32" rx="6" fill="#DCEEF7" stroke="#3B2F2F" stroke-width="3"/>
    <rect x="162" y="22" width="40" height="32" rx="6" fill="#DCEEF7" stroke="#3B2F2F" stroke-width="3"/>
    <rect x="62" y="0" width="60" height="18" rx="4" fill="#2B2F4A"/><text x="92" y="14" text-anchor="middle" font-size="13" font-weight="800" fill="#FFC727" font-family="Nunito, ui-rounded, sans-serif">${esc(num || 'BUS')}</text>
    <circle cx="8" cy="80" r="5" fill="#FFE45C" stroke="#3B2F2F" stroke-width="2"/>
    <circle cx="52" cy="100" r="15" fill="#3B2F2F"/><circle cx="52" cy="100" r="6" fill="#C9D3DC"/>
    <circle cx="170" cy="100" r="15" fill="#3B2F2F"/><circle cx="170" cy="100" r="6" fill="#C9D3DC"/>
  </svg>`;
  const CAR_SVG = (c) => `<svg viewBox="0 0 110 60" width="110" height="60" aria-hidden="true"><path d="M8 38c0-8 4-12 12-13l14-14h34l16 14c10 1 18 5 18 13v8H8z" fill="${c}" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/><path d="M38 14h12v12H26zM56 14h12l12 12H56z" fill="#DCEEF7"/><circle cx="28" cy="48" r="9" fill="#3B2F2F"/><circle cx="84" cy="48" r="9" fill="#3B2F2F"/></svg>`;
  const STOP_X = 300; // where the bus stops
  const busX = (m) => (m == null ? 1000 : Math.max(STOP_X, Math.min(1000, STOP_X + (m / 12) * 640)));
  function busLine(g) {
    const m = g.mins;
    if (m == null) return 'Let’s check when the bus is coming.';
    const walk = Number((state.bus || {}).walk) || 0;
    if (m <= 0) return 'The bus is here! Get your card ready.';
    if (m <= 2) return `The bus is almost here. ${m === 1 ? 'One minute' : 'Two minutes'}. Get your card ready.`;
    if (walk && m <= walk + 1 && g.src === 'live') return `${m} minutes. Time to walk to the bus stop, holding hands.`;
    if (m <= 5) return `${m} minutes. Stand at the bus stop and wait behind the line.`;
    if (m <= 10) return `${m} minutes. ${g.late ? 'Let\u2019s play while we wait.' : 'Check your bag and put your shoes on.'}`;
    return `The bus comes in ${m} minutes. Lots of time. Let's play a game while we wait.`;
  }
  const bucket = (m) => (m == null ? 'x' : m <= 0 ? 0 : m <= 2 ? 2 : m <= 5 ? 5 : m <= 10 ? 10 : 99);
  function busInfoText(g) {
    const t = { DD: 'a big double-decker bus', SD: 'a single-deck bus', BD: 'a long bendy bus' }[g.type];
    const l = { SEA: 'There are seats for you.', SDA: 'You might stand. Hold on tight.', LSD: 'It is very full. That’s okay. Hold on tight.' }[g.load];
    return [t ? `It is ${t}.` : '', l || ''].filter(Boolean).join(' ');
  }
  G.bus = {
    init: (step) => {
      // a pretend "bus is late" day (only when practising; live times already show the real wait)
      const late = S.day.change === 'late' && !(state.bus && state.bus.live && state.bus.proxy);
      return { mins: null, next: null, src: 'practice', said: {}, err: '', service: (state.bus && state.bus.service) || '', target: 0, spotted: 0, popped: 0, wg: 'cars', started: false, late, label: step.label || 'Bus', phase: late ? 'late' : 0 };
    },
    total: 3,
    progress: (g) => (g.phase === 'turn' ? 3 : g.phase === 'here' ? 2 : g.phase === 0 && g.mins != null && g.mins <= 5 ? 1 : 0),
    real: "I'm on the bus!",
    barMid: (g) => g.phase === 0 ? `<span class="sg-wg"><span class="sg-wg-l">While we wait:</span>
      <button class="sg-wg-b ${g.wg === 'cars' ? 'on' : ''}" data-a="sgTap" data-k="wg-cars" aria-pressed="${g.wg === 'cars'}"><span class="sg-wg-car">${CAR_SVG('#EF6F5E')}</span><span>Cars</span></button>
      <button class="sg-wg-b ${g.wg === 'bubbles' ? 'on' : ''}" data-a="sgTap" data-k="wg-bubbles" aria-pressed="${g.wg === 'bubbles'}">${ic('kBubbles', 34)}<span>Bubbles</span></button></span>` : '',
    voice: (g) => {
      if (g.phase === 'turn') return "Find a seat and sit down. Now it's your turn to get on the bus.";
      if (g.phase === 'here') return 'The bus is here! Tap your bus card on the reader. ' + busInfoText(g);
      if (g.phase === 'late') return 'Oh! The bus is late. It will come in five more minutes. That\u2019s okay. We can play while we wait.';
      return busLine(g);
    },
    guide: (g) => {
      if (g.phase === 'turn') return { sel: '[data-a="sgReal"]', say: "Get on the bus, then tap I'm on the bus." };
      if (g.phase === 'here') return { sel: '.bus-reader', say: 'Tap your card on the reader.' };
      if (g.phase === 'late') return { sel: '[data-k="lateGo"]', say: 'Tap Play while we wait.' };
      if (g.wg === 'bubbles') return { sel: '.bus-bub', say: 'Pop a bubble.', quiet: true, delay: 9000 };
      return { sel: `.bus-car[data-c="${g.target}"]`, say: `Find the ${CAR_COLOURS[g.target][0]} car.`, quiet: true, delay: 9000 };
    },
    scene(g, info) {
      const here = g.phase === 'here' || g.phase === 'turn';
      const lateCard = g.phase === 'late';
      const m = here ? 0 : lateCard ? (g.mins == null ? 10 : g.mins) : g.mins;
      const tgt = CAR_COLOURS[g.target];
      const waitGame = g.phase === 0 ? (g.wg === 'bubbles'
        ? `<div class="bs-spot"><span class="bs-pop-ic">${ic('kBubbles', 30)}</span><span>Pop the bubbles</span><span class="bs-count">${g.popped}</span></div><div class="bs-bubs"></div>`
        : `<div class="bs-spot"><span class="bs-dot" style="background:${tgt[1]}"></span><span>Find the ${tgt[0]} car</span><span class="bs-count">${ic('star', 26)}${g.spotted}</span></div><div class="bs-cars"></div>`) : '';
      return `<div class="panel scene grow sg bs" style="background:#DCEEF7">
        <div class="bs-pave"></div><div class="bs-road"><span class="bs-lane"></span></div>
        <div class="bs-pole"><span class="bs-sign">${ic('busLine', 34)}<b>${esc(g.service || '')}</b></span></div>
        <div class="bs-lumi ${here ? 'hop' : ''}">${L.svg({ look: A.lookWith({ back: state.owned.includes('backpack') ? 'backpack' : state.look.back }), mood: here ? 'excited' : lateCard && g.feel !== 'okay' ? 'worried' : 'happy', size: 180, label: 'Lumi waiting for the bus' })}</div>
        <div class="bs-bubble" ${g.phase === 'turn' || lateCard ? 'hidden' : ''}>${esc(here ? (g.phase === 'turn' ? 'Find a seat. Hold on!' : 'The bus is here! Tap your card.') : busLine(g))}</div>
        <div class="bs-board" aria-live="polite">
          <div class="bs-board-top"><span class="bs-num">${ic('busLine', 26)}<span>${esc(g.service ? 'Bus ' + g.service : g.label)}</span></span>
            ${g.late ? '<span class="bs-src bs-late-tag">Late +5</span>' : ''}<span class="bs-src ${g.src}">${g.src === 'live' ? '<i></i>Live' : 'Practice'}</span></div>
          <div class="bs-mins">${m == null ? '…' : m <= 0 ? 'Here!' : `<b>${m}</b><span>min</span>`}</div>
          <div class="bs-next">${here ? esc(busInfoText(g)) || '&nbsp;' : g.next != null ? `Next bus: ${g.next} min` : g.err ? esc(g.err) : '&nbsp;'}</div>
          <div class="bs-wait">${dots(Math.max(0, 6 - Math.min(6, Math.ceil((m || 0) / 2))), 6, 'var(--changed)', 16)}</div>
        </div>
        ${waitGame}
        ${lateCard ? `<div class="bs-late"><span class="bs-late-head">${ic('clock', 44)}<span><b>The bus is late</b><span>5 more minutes</span></span></span>
          <span class="bs-late-q">How do you feel? <i>(you can skip)</i></span>
          <span class="row gap8">${[['okay', 'Okay', 'happy'], ['worried', 'Worried', 'worried'], ['cross', 'Cross', 'angry']].map(([k, l, f]) => `<button class="bs-feel ${g.feel === k ? 'on' : ''}" data-a="sgTap" data-k="feel-${k}">${L.face(f, 44)}<span>${l}</span></button>`).join('')}</span>
          <button class="primary bs-late-go" data-a="sgTap" data-k="lateGo">${ic('kPuzzle', 34)}<span>Play while we wait</span></button></div>` : ''}
        <div class="bs-bus ${here ? 'at-stop' : ''}" style="left:${here ? STOP_X : busX(m)}px">${BUS_SVG(g.service)}${here ? `<button class="bus-reader ${g.phase === 'turn' ? 'paid' : ''}" data-a="sgTap" data-k="card" aria-label="Tap your bus card">${ic('buscard', 40)}</button>` : ''}${g.wab && here ? `<span class="bs-wab" title="Wheelchair accessible">♿</span>` : ''}</div>
        ${g.phase === 'turn' ? turnCard(info, 'Get on the bus with your grown-up and find a seat.', 'bus') : ''}
      </div>`;
    },
    tap(g, k, el) {
      if (k === 'card' && g.phase === 'here') {
        tone(1320, 0.12, 0.08); later(() => tone(1320, 0.12, 0.08), 160);
        setPhase(g, 'turn', 'Beep! ' + G.bus.voice(Object.assign({}, g, { phase: 'turn' })));
        return;
      }
      if (k === 'lateGo' && g.phase === 'late') { setPhase(g, 0, 'Let\u2019s play while we wait. Watch the minutes go down.'); return; }
      const fm = /^feel-(\w+)$/.exec(k);
      if (fm && g.phase === 'late') {
        g.feel = fm[1];
        A.track('feelings', { okay: 'happy', worried: 'worried', cross: 'angry' }[g.feel]);
        render();
        say({ okay: 'You feel okay. Great!', worried: 'You feel worried. That\u2019s okay. The bus is still coming.', cross: 'You feel cross. That\u2019s okay. Waiting is hard.' }[g.feel] + ' Let\u2019s play while we wait.');
        later(() => { if (cur() === g && g.phase === 'late') setPhase(g, 0, false); }, 3200);
        return;
      }
      if (k === 'wg-cars' || k === 'wg-bubbles') { if (g.phase === 0) { g.wg = k.slice(3); render(); } return; }
      const bm = /^bub$/.exec(k);
      if (bm && g.phase === 0) {
        if (el.classList.contains('pop')) return;
        el.classList.add('pop');
        g.popped += 1;
        tone(500 + (g.popped % 8) * 60, 0.15, 0.07);
        say(String(g.popped));
        const c = A.stage.querySelector('.bs-count');
        if (c) c.textContent = g.popped;
        if (g.popped % 5 === 0) A.award(1);
        setTimeout(() => el.remove(), 260);
        return;
      }
      const m = /^car(\d)$/.exec(k);
      if (m && g.phase === 0) {
        const c = Number(m[1]);
        el.disabled = true;
        if (c === g.target) {
          g.spotted += 1;
          el.classList.add('got');
          tone(784, 0.2, 0.07);
          say(pick(['Yes! The ' + CAR_COLOURS[c][0] + ' car!', 'Well spotted!', 'You found it!']));
          g.target = (g.target + 1 + Math.floor(Math.random() * 3)) % CAR_COLOURS.length;
          const sp = A.stage.querySelector('.bs-spot');
          if (sp) sp.innerHTML = `<span class="bs-dot" style="background:${CAR_COLOURS[g.target][1]}"></span><span>Find the ${CAR_COLOURS[g.target][0]} car</span><span class="bs-count">${ic('star', 26)}${g.spotted}</span>`;
          if (g.spotted % 3 === 0) A.award(1);
        } else {
          say(`That one is ${CAR_COLOURS[c][0]}. Look for ${CAR_COLOURS[g.target][0]}.`);
        }
      }
    },
    after(g, box) {
      if (!g.started && g.phase === 0) startBus(g);
      if (g.phase !== 0) return;
      if (g.wg === 'bubbles') {
        // bubbles float up while we wait: tap to pop, and Lumi counts them
        const field = box.querySelector('.bs-bubs');
        const blow = () => {
          if (!field || !field.isConnected || S.paused) return;
          const b = document.createElement('button');
          b.className = 'bus-bub';
          b.dataset.a = 'sgTap';
          b.dataset.k = 'bub';
          b.setAttribute('aria-label', 'Bubble');
          const sz = 54 + Math.round(Math.random() * 34);
          b.style.width = b.style.height = sz + 'px';
          b.style.left = Math.round(Math.random() * 560) + 'px';
          b.style.animationDuration = (6 + Math.random() * 3).toFixed(1) + 's';
          field.appendChild(b);
          setTimeout(() => b.remove(), 9500);
        };
        blow();
        const id = setInterval(() => { if (!field.isConnected || cur() !== g) { clearInterval(id); return; } blow(); }, 1100);
        return;
      }
      // cars drive past while we wait
      const lane = box.querySelector('.bs-cars');
      const spawn = () => {
        if (!lane || !lane.isConnected || S.paused) return;
        const want = Math.random() < 0.45 ? g.target : Math.floor(Math.random() * CAR_COLOURS.length);
        const b = document.createElement('button');
        b.className = 'bus-car';
        b.dataset.a = 'sgTap';
        b.dataset.k = 'car' + want;
        b.dataset.c = want;
        b.setAttribute('aria-label', CAR_COLOURS[want][0] + ' car');
        b.innerHTML = CAR_SVG(CAR_COLOURS[want][1]);
        lane.appendChild(b);
        setTimeout(() => b.remove(), 7200);
      };
      spawn();
      const id = setInterval(() => { if (!lane.isConnected || cur() !== g) { clearInterval(id); return; } spawn(); }, 2600);
    }
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function startBus(g) {
    g.started = true;
    const b = state.bus || {};
    const announce = () => {
      const k = bucket(g.mins);
      if (g.said[k]) return;
      g.said[k] = true;
      if (g.said.first) say(busLine(g));
      g.said.first = true;
    };
    const apply = () => {
      if (cur() !== g || S.screen !== 'routine') return false;
      if (g.phase === 0 && g.mins != null && g.mins <= 0) { chime(); setPhase(g, 'here'); return false; }
      if (g.phase !== 0) return false;
      updateBusDom(g);
      announce();
      return true;
    };
    if (b.live && b.stop && b.proxy) {
      const pull = () => busFetch().then((r) => {
        Object.assign(g, { src: 'live', err: '', mins: r.mins, next: r.next, load: r.load, type: r.type, wab: r.wab, service: r.service });
        apply();
      }).catch((e) => {
        if (g.src !== 'live') { g.err = 'Live times not working, so we are practising.'; practise(g, apply); }
        A.track('busError', String(e.message || e), { quiet: true });
      });
      pull();
      const id = A.every(() => { if (cur() !== g || g.phase !== 0) { clearInterval(id); return; } pull(); }, 30000);
    } else {
      practise(g, apply);
    }
  }
  // practice: the countdown runs fast (one "minute" every 4 seconds) so the child sees the whole thing
  function practise(g, apply) {
    g.src = 'practice';
    g.mins = g.late ? 10 : 6;
    g.next = g.mins + 8;
    g.type = 'DD'; g.load = 'SEA'; g.wab = true;
    apply();
    const id = A.every(() => {
      if (cur() !== g || g.phase !== 0) { clearInterval(id); return; }
      g.mins -= 1;
      g.next = Math.max(g.mins + 4, g.next - 1);
      if (!apply()) clearInterval(id);
    }, g.late ? 3000 : 4000);
  }
  function updateBusDom(g) {
    const box = panel();
    if (!box) return;
    const m = g.mins;
    const bus = box.querySelector('.bs-bus');
    if (bus) bus.style.left = busX(m) + 'px';
    const mins = box.querySelector('.bs-mins');
    if (mins) mins.innerHTML = m == null ? '…' : m <= 0 ? 'Here!' : `<b>${m}</b><span>min</span>`;
    const nx = box.querySelector('.bs-next');
    if (nx) nx.innerHTML = g.next != null ? `Next bus: ${g.next} min` : g.err ? esc(g.err) : '&nbsp;';
    const src = box.querySelector('.bs-src:not(.bs-late-tag)');
    if (src) { src.className = 'bs-src ' + g.src; src.innerHTML = g.src === 'live' ? '<i></i>Live' : 'Practice'; }
    const num = box.querySelector('.bs-num span');
    if (num) num.textContent = g.service ? 'Bus ' + g.service : g.label;
    const bub = box.querySelector('.bs-bubble');
    if (bub) bub.textContent = busLine(g);
    const w = box.querySelector('.bs-wait');
    if (w) w.innerHTML = dots(Math.max(0, 6 - Math.min(6, Math.ceil((m || 0) / 2))), 6, 'var(--changed)', 16);
    updateDots(G.bus.progress(g), 3);
  }

  // ---------------------------------------------------------------- Teens: task checklist
  // Teens get the real steps as a short checklist with an optional timer, and Lumi as a small helper.
  const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  G.task = {
    init: (step) => {
      const T = D.TASKS[step.id];
      return { step: step.id, label: A.stepInfo(step).label, list: T.list.slice(), ticks: T.list.map(() => false), timerLen: T.timer || 0, timer: 0 };
    },
    total: (g) => g.list.length,
    progress: (g) => g.ticks.filter(Boolean).length,
    real: 'Done',
    voice: (g) => (g.phase === 'turn' ? `All done. ${A.praise()}` : `${g.label}. Tick each step when it is done.`),
    guide: (g) => {
      if (g.phase === 'turn') return { sel: '[data-a="sgReal"]', say: 'Tap Done.' };
      const k = g.ticks.indexOf(false);
      return { sel: `.tk-item[data-k="t${k}"]`, say: g.list[k] + '. Tick it when it is done.', quiet: true };
    },
    scene(g, info) {
      const done = g.phase === 'turn';
      const rows = g.list.map((t, k) => `<button class="tk-item ${g.ticks[k] ? 'on' : ''}" data-a="sgTap" data-k="t${k}" aria-pressed="${g.ticks[k]}">
        <span class="tk-num">${k + 1}</span><span class="tk-txt">${esc(t)}</span><span class="tk-box">${g.ticks[k] ? ic('check', 26) : ''}</span></button>`).join('');
      return `<div class="panel scene grow sg tk" style="background:${info.tint}">
        <div class="tk-side">
          <span class="tk-art">${A.stepArt(info, 130)}</span>
          <span class="tk-title">${esc(g.label)}</span>
          ${g.timerLen ? `<button class="tk-timer ${g.timer ? 'on' : ''}" data-a="sgTap" data-k="timer">${ic('clock', 26)}<span class="tk-time">${g.timer ? mmss(g.timer) : 'Timer ' + mmss(g.timerLen)}</span></button>` : ''}
          ${done ? `<span class="tk-done">${ic('check', 30)}<span>All done</span></span>` : `<span class="tk-lumi">${L.svg({ look: A.dayLook(), mood: 'calm', size: 96, label: 'Lumi' })}</span>`}
        </div>
        <div class="tk-list n${Math.min(g.list.length, 6)}">${rows}</div>
      </div>`;
    },
    tap(g, k) {
      if (k === 'timer') {
        if (g.timer) return;
        g.timer = g.timerLen;
        render();
        say(`Timer on. ${Math.round(g.timerLen / 60)} minutes.`);
        const id = A.every(() => {
          if (cur() !== g || S.screen !== 'routine') { clearInterval(id); return; }
          g.timer -= 1;
          const t = A.stage.querySelector('.tk-time');
          if (t) t.textContent = mmss(Math.max(0, g.timer));
          if (g.timer <= 0) { clearInterval(id); g.timer = 0; chime(); say('Time is up.'); render(); }
        }, 1000);
        return;
      }
      const m = /^t(\d+)$/.exec(k);
      if (!m) return;
      const i = Number(m[1]);
      g.ticks[i] = !g.ticks[i];
      if (g.ticks[i]) tone(660 + i * 50, 0.18, 0.06);
      if (g.ticks.every(Boolean)) { chime(); setPhase(g, 'turn'); return; }
      if (g.phase === 'turn') g.phase = 0;
      render();
    }
  };

  // ================================================================ hooks used by app.js
  // which game a step uses: Teens' task checklists, or the hands-on games (the bus game is used by everyone)
  // Every step is interactive: its own Lumi game, a Teens task checklist, or the quick "do it with Lumi"
  // version (used for grown-ups' own steps, or when grown-ups switch the full games off). No star tapping.
  const NOT_STEPS = ['task', 'generic', 'cu'];
  function gid(step) {
    if (!step) return null;
    if (step.cu && G.cu) return 'cu'; // a "Coming up" event (comingup.js)
    if ((state.profile.routineMode || 'play') === 'tasks') return step.id === 'bus' ? 'bus' : D.TASKS && D.TASKS[step.id] ? 'task' : 'generic';
    if (state.settings.stepGames === false) return 'generic';
    return !step.custom && G[step.id] && !NOT_STEPS.includes(step.id) ? step.id : 'generic';
  }
  function gameFor(step) {
    const d = S.day;
    const id = gid(step);
    if (!d.game || d.game.id !== id || d.game.i !== d.i) d.game = Object.assign({ id, i: d.i, phase: 0 }, G[id].init(step));
    return d.game;
  }
  function voiceFor(g) { return G[g.id].voice(g); }
  // the bar always shows, in words, the one thing to do now (not only spoken), so a child who
  // cannot hear it, or missed it, can still see what to do
  function barLine(g, def, turn) {
    let line = '';
    try { const gd = def.guide && def.guide(g); line = gd && gd.say ? gd.say : ''; } catch (e) { line = ''; }
    if (turn) return `<span class="sg-label sg-do turn">${ic('kHeart', 26)}<span>Now you! Do it for real.</span></span>`;
    return line ? `<span class="sg-label sg-do">${ic('hand', 28)}<span>${esc(line)}</span></span>` : '<span class="sg-label">Play with Lumi</span>';
  }
  A.stepGame = {
    has: (step) => !!gid(step),
    voice: (step) => voiceFor(gameFor(step)),
    guide: (step) => { const g = gameFor(step); return G[g.id].guide(g); },
    scene: (step, info) => { const g = gameFor(step); return G[g.id].scene(g, info); },
    bar(step, info) {
      const g = gameFor(step);
      const def = G[g.id];
      const turn = g.phase === 'turn';
      const total = typeof def.total === 'function' ? def.total(g) : def.total;
      if (g.id === 'task') {
        return `<div class="bar">${speakBtn(voiceFor(g), 52)}<span class="time-chip">${ic('clock', 26)}<span>${fmt(step.time)}</span></span><span class="grow"></span>
          <span class="sg-dots">${dots(def.progress(g), total, 'var(--green)', 22)}</span>
          <button class="primary ${turn ? '' : 'faded'}" data-a="sgReal" style="height:76px">${ic('check', 32)}<span>Done</span></button></div>`;
      }
      return `<div class="bar">${speakBtn(voiceFor(g), 52)}<span class="time-chip">${ic('clock', 26)}<span>${fmt(step.time)}</span></span>
        ${def.barMid && def.barMid(g) ? def.barMid(g) : barLine(g, def, turn)}<span class="grow"></span>
        <span class="sg-dots">${dots(def.progress(g), total, 'var(--green)', 24)}</span>
        ${turn ? `<button class="primary" data-a="sgReal" style="height:76px">${ic('check', 32)}<span>${esc(def.real)}</span></button>`
          : `<button class="sg-skip" data-a="sgSkip" aria-label="Skip the game">${ic('arrow', 22)}<span>Skip</span></button>`}</div>`;
    }
  };
  A.AFTER.routine = () => {
    const d = S.day;
    if (!d || d.celebrate || A.activeChange() || A.checklistPending()) return;
    const step = d.plan[d.i];
    if (!A.stepGame.has(step)) return;
    const g = gameFor(step);
    const box = panel();
    if (box && G[g.id].after) G[g.id].after(g, box);
  };

  // shared with daygames.js, which adds a scene for every other part of the day
  A.SG = { G, drag, near, setPhase, turnCard, updateDots, panel, cur, ack, local, outfitSvg, pjArt };

  Object.assign(A.ACTIONS, {
    sgTap: (d, el) => {
      const g = cur();
      if (!g || !G[g.id].tap) return 'keep';
      G[g.id].tap(g, d.k, el);
      return undefined;
    },
    sgSkip: () => {
      const g = cur();
      if (!g) return 'keep';
      if (g.id === 'bus' && (g.phase === 0 || g.phase === 'late')) { g.mins = 0; setPhase(g, 'here'); return 'keep'; }
      setPhase(g, 'turn');
      return 'keep';
    },
    sgReal: () => {
      const g = cur();
      if (g) A.track('stepGames', g.id, { quiet: true });
      A.completeStep();
      return 'keep';
    }
  });
})();
