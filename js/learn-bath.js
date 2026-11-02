/*
  learn-bath.js
  Learn with Lumi: Wash hands (all ages) and Use the toilet (little ones), as a real home bathroom and toilet
  (engine: stories.js, SX.lesson; shared home pieces from learn-teeth.js on SX.HOME).

  Wash hands: little ones pull the step stool to the sink; turn on the tap; then a close-up of the hands over the
  basin: wet them under the water, press and hold the soap pump, rub the palms to make bubbles while Lumi counts
  to ten, between the fingers (Medium), the backs of the hands (Challenge), rinse the bubbles away, turn off the
  tap (Medium), dry with the towel, and a high five.
  Use the toilet: switch on the light (Challenge), open the toilet door, lift the lid, put the small seat on
  (Medium), shorts down, sit, take your time and breathe, pull the toilet paper, paper into the toilet, shorts up,
  close the lid (Medium), flush (it is loud, and that is okay; headphones help), wash hands, high five.
  Nothing is timed or wrong: a miss only gets a gentle hint. Every step: Lumi shows it first, "Show me" shows it
  again, "Do it with me" helps.

  New shared pieces on SX.HOME: pump (a soap pump bottle), bigTap (a close-up basin mixer).
  Rooms: SX.bg.bathHands (the basin close-up), SX.bg.toiletDoor (the hallway), SX.bg.toiletRoom (the toilet).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const SX = A.SX;
  const LP = window.LP;
  const { vol } = LP;
  const { S, state, tone } = A;
  const W = SX.W;
  const HOME = SX.HOME;
  const svg = (vb, inner, o) => `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible" aria-hidden="true" ${o || ''}>${inner}</svg>`;
  const ageNow = () => (state.profile && state.profile.age) || '';
  const little = () => ageNow() === 'little';
  const level = () => A.level();

  // a point on Lumi (in his own 240 grid) in scene px, for a spot { x, y (feet), h }
  const onLumi = (sp, vx, vy) => ({ x: sp.x - sp.h / 2 + ((vx + 14) * sp.h) / 268, y: sp.y - (sp.h * 244) / 268 + ((vy + 14) * sp.h) / 268 });
  // a clear tap area over Lumi (k = what the tap does)
  const lumiHit = (sp, k, label) => {
    const a = onLumi(sp, 26, 30);
    const b = onLumi(sp, 214, 232);
    return SX.at(a.x, a.y, b.x - a.x, b.y - a.y, '', { k, label, cls: 'lb-lumihit', z: 7 });
  };
  // the progress bar while rubbing
  const bar = (st, x, y, w) => `<div class="ln-progress lb-bar" style="left:${x}px;top:${y}px;width:${w}px"><i style="width:${Math.round(Math.min(1, (st.s.rub || 0) / (st.s.need || 700)) * 100)}%"></i></div>`;

  // ================================================================ shared pieces (new on SX.HOME)
  // a soap pump bottle; the pump head goes down while it is pressed (.down on a parent)
  HOME.pump = HOME.pump || ((c) => svg('0 0 150 300', `${LP.drop(75, 292, 62, 7)}
    <g class="lb-pumphead">${vol('<rect x="66" y="34" width="18" height="76" rx="6"/>', '#E3E8ED', { shade: 'h' })}
      ${vol('<rect x="98" y="30" width="40" height="13" rx="6"/><rect x="128" y="34" width="12" height="22" rx="5"/>', '#F4F6F8', { shade: 'v' })}
      ${vol('<rect x="34" y="20" width="76" height="26" rx="12"/>', '#FFFFFF', { shade: 'v' })}</g>
    ${vol('<rect x="52" y="98" width="46" height="32" rx="8"/>', '#FFFFFF', { shade: 'h' })}
    ${vol('<path d="M22 150c0-14 10-24 24-24h58c14 0 24 10 24 24v124c0 10-8 18-18 18H40c-10 0-18-8-18-18z"/>', '#EEF8F4', { shade: 'h' })}
    <path d="M28 178h94v94c0 8-6 14-14 14H42c-8 0-14-6-14-14z" fill="${c || '#8ED3BE'}" opacity=".85"/>
    ${vol('<rect x="40" y="196" width="70" height="56" rx="12"/>', '#FFFFFF', { lineOpacity: 0.25 })}
    <circle cx="62" cy="220" r="10" fill="none" stroke="#5FB8A0" stroke-width="4"/><circle cx="86" cy="230" r="7" fill="none" stroke="#5FB8A0" stroke-width="3.5"/><circle cx="84" cy="208" r="4.5" fill="#5FB8A0"/>
    <path d="M22 150c0-14 10-24 24-24h58c14 0 24 10 24 24v124c0 10-8 18-18 18H40c-10 0-18-8-18-18z" fill="url(#lpGlass)" opacity=".7"/>`));
  // a close-up basin mixer (side view): the spout ends at (214, 152); the lever lifts up when it is on
  HOME.bigTap = HOME.bigTap || ((on) => svg('0 0 240 300', `${LP.drop(70, 294, 54, 7)}${vol('<ellipse cx="70" cy="286" rx="44" ry="11"/>', '#C9D1D9', { shade: 'v' })}
    ${vol('<rect x="48" y="104" width="44" height="184" rx="14"/>', '#D5DCE3', { shade: 'h' })}
    <path d="M70 120V98a34 34 0 0 1 34-34h76a34 34 0 0 1 34 34v38" fill="none" stroke="#8A97A6" stroke-width="34" stroke-linecap="round"/>
    <path d="M70 120V98a34 34 0 0 1 34-34h76a34 34 0 0 1 34 34v38" fill="none" stroke="#DDE3E9" stroke-width="28" stroke-linecap="round"/>
    <path d="M76 104v-6a28 28 0 0 1 28-28h74" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="7" stroke-linecap="round"/>
    ${vol('<rect x="200" y="136" width="28" height="18" rx="5"/>', '#AEB8C2', { shade: 'v' })}
    <g transform="rotate(${on ? 26 : 0} 70 92)">${vol('<rect x="6" y="80" width="74" height="24" rx="12"/>', on ? '#4FB3A9' : '#AEB8C2', { shade: 'v' })}</g>
    ${vol('<circle cx="70" cy="92" r="16"/>', '#E3E8ED')}`));

  // a blob of liquid soap
  const blobArt = () => svg('0 0 90 60', '<path d="M10 42c-5-14 9-26 23-22 6-13 27-15 35-2 14-2 21 12 15 22-4 10-21 14-37 12-18 2-32-2-36-10z" fill="#C7EFE2" stroke="#4FA88E" stroke-width="2.5"/><ellipse cx="34" cy="30" rx="10" ry="5" fill="#fff" opacity=".9"/><circle cx="62" cy="25" r="4.5" fill="#fff" opacity=".85"/><circle cx="50" cy="44" r="3" fill="#fff" opacity=".7"/>');
  // water splashing where it lands
  const splashArt = () => svg('0 0 90 40', '<ellipse cx="45" cy="22" rx="26" ry="8" fill="#BFE3F7" opacity=".85"/><circle cx="16" cy="14" r="4" fill="#9AD3F5"/><circle cx="74" cy="12" r="4" fill="#9AD3F5"/><circle cx="28" cy="6" r="3" fill="#BFE3F7"/><circle cx="62" cy="5" r="3" fill="#BFE3F7"/><ellipse cx="45" cy="20" rx="12" ry="4" fill="#fff" opacity=".8"/>');
  // little shines when something is clean
  const sparkles = (x, y) => `<div class="lb-sparkle" style="left:${x}px;top:${y}px">${svg('0 0 200 120', '<path d="M30 40l7 17 17 7-17 7-7 17-7-17-17-7 17-7z" fill="#FFD23F"/><path d="M160 20l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="#FFE680"/><path d="M110 80l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="#FFD23F"/>')}</div>`;

  // a soft whoosh for the flush: quiet, and quieter still with headphones on
  let actx = null;
  function whoosh(soft) {
    if (!state.settings.sounds || S.mute) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const n = Math.floor(actx.sampleRate * 1.8);
      const buf = actx.createBuffer(1, n, actx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < n; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
      const src = actx.createBufferSource();
      src.buffer = buf;
      const f = actx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1100, t);
      f.frequency.linearRampToValueAtTime(260, t + 1.6);
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(soft ? 0.05 : 0.14, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
      src.connect(f);
      f.connect(g);
      g.connect(actx.destination);
      src.start(t);
      src.stop(t + 1.8);
    } catch (e) { /* audio not supported */ }
  }

  // press and hold something (the soap pump): o.progress(p, box), o.done(), o.more (said when let go too soon)
  function wireHold(st, box, sel, o) {
    const t = box.querySelector(sel);
    if (!t || t.dataset.wired) return;
    t.dataset.wired = '1';
    const tok = st.token;
    let iv = null;
    const stop = () => {
      t.classList.remove('down');
      if (!iv) return;
      clearInterval(iv);
      iv = null;
      if (!st.done && st.s.p > 0 && st.s.p < 1) SX.say(o.more || 'A little more. Press and hold.');
    };
    t.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (st.done) return;
      A.hideHand();
      t.classList.add('down');
      clearInterval(iv);
      iv = setInterval(() => {
        if (S.sx !== st || st.token !== tok) { clearInterval(iv); iv = null; return; }
        st.s.p = Math.min(1, (st.s.p || 0) + 0.075);
        o.progress(st.s.p, box);
        tone(300 + st.s.p * 220, 0.05, 0.02);
        if (st.s.p >= 1) { clearInterval(iv); iv = null; t.classList.remove('down'); o.done(); }
      }, 90);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => t.addEventListener(ev, stop));
  }

  // ================================================================ the sink at home (SX.bg.homeBath from learn-teeth.js)
  const COUNTER = { x: 470, y: 318, w: 470, bx: 700 };
  const SINK = {
    stool: { x: 330, y: 420, w: 150, h: 90 },
    tap: { x: 652, y: 210, w: 100, h: 112 },
    pump: { x: 826, y: 212, w: 54, h: 108 },
    towel: { x: 905, y: 58, w: 140, h: 170 }
  };
  const SPOUT = { x: SINK.tap.x + 68 * (SINK.tap.w / 80), y: SINK.tap.y + 40 * (SINK.tap.w / 80) };
  const LUMI_FLOOR = { x: 250, y: 500, h: 204 };
  const LUMI_STOOL = { x: 430, y: 450, h: 200 };
  const sinkLumi = (st) => Object.assign({}, st.data.stool ? LUMI_STOOL : LUMI_FLOOR);
  function sinkThings(st, o) {
    const op = o || {};
    let h = SX.at(SINK.tap.x, SINK.tap.y, SINK.tap.w, SINK.tap.h, HOME.tapSvg(st.data.tapOn), { k: op.tapK, label: st.data.tapOn ? 'Turn off the tap' : 'Turn on the tap', cls: op.tapK ? 'lb-tap sx-glow' : 'lb-deco', z: 3 });
    if (st.data.tapOn) h += SX.at(SPOUT.x - 15, SPOUT.y, 30, COUNTER.y + 8 - SPOUT.y, HOME.water(COUNTER.y + 8 - SPOUT.y), { cls: 'lb-water lb-deco', z: 2 });
    h += SX.at(SINK.pump.x, SINK.pump.y, SINK.pump.w, SINK.pump.h, HOME.pump(), { cls: 'lb-deco', z: 3 });
    h += SX.at(SINK.towel.x, SINK.towel.y, SINK.towel.w, SINK.towel.h, HOME.towel('#F4A3B9'), { cls: 'lb-deco', z: 2 });
    if (st.data.stool) h += SX.at(SINK.stool.x + 6, SINK.stool.y + 6, SINK.stool.w, SINK.stool.h, HOME.stool(), { cls: 'lb-deco', z: 4 });
    return h;
  }

  // ================================================================ the basin close-up
  const HS = 380; // the hands picture, px wide
  const HSH = Math.round((HS * 240) / 260);
  const CU = { tap: { x: 342, y: 0, w: 240, h: 300 }, spout: { x: 556, y: 152 }, basinY: 478 };
  // where the hands are: under the water (the stream lands on the fingertips), or to the side to rub with soap
  const POS = { under: { x: CU.spout.x - Math.round((128 * HS) / 260), y: 170 }, side: { x: 500, y: 178 } };
  const FINGERTIP = { x: CU.spout.x, y: POS.under.y + 100 };
  SX.bg.bathHands = () => `<defs><radialGradient id="lbBowl" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#F4F8FA"/><stop offset=".7" stop-color="#D6E4EC"/><stop offset="1" stop-color="#B9CCD8"/></radialGradient></defs>
    ${HOME.tiledWall('#E3F2EF', '#FFFFFF', 560, '#E9D8C0')}
    ${vol(`<rect x="-20" y="292" width="${W + 40}" height="300"/>`, '#F6F1EA', { shade: 'v' })}<rect x="0" y="292" width="${W}" height="8" fill="#fff" opacity=".8"/>
    ${vol('<ellipse cx="556" cy="430" rx="322" ry="112"/>', '#FFFFFF', { shade: 'v' })}<ellipse cx="556" cy="438" rx="290" ry="90" fill="url(#lbBowl)"/>
    <ellipse cx="556" cy="438" rx="290" ry="90" fill="none" stroke="#9FB3C1" stroke-opacity=".6" stroke-width="3"/>
    ${vol('<ellipse cx="556" cy="482" rx="24" ry="9"/>', '#C9D1D9')}<path d="M540 482h32M546 478h20M546 486h20" stroke="#8A97A6" stroke-width="2"/>`;
  // Lumi watches and counts, in a little round window
  const coach = (st, mood) => `<div class="lb-coach" style="left:968px;top:424px" aria-hidden="true">${SX.lumi(st, { mood: mood || 'happy', h: 150 })}</div>
    <div class="lb-count ${st.s.count ? 'on' : ''}" style="left:944px;top:410px">${st.s.count || ''}</div>`;
  // the towel rail on the wall in the close-up
  const towelRail = () => SX.at(890, 30, 180, 22, svg('0 0 180 22', vol('<rect x="2" y="4" width="176" height="14" rx="7"/>', '#C9D1D9', { shade: 'v' })), { cls: 'lb-deco', z: 2 });
  const showCount = (box, n) => { const c = box.querySelector('.lb-count'); if (c) { c.textContent = String(n); c.classList.add('on'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } };
  // the hands, the tap, the water, the pump. o: { mode, pos, p, tapK, pump, blob, towel, cls, mood }
  function closeUp(st, o) {
    const where = o.pos || 'under';
    const pos = POS[where];
    let h = SX.at(CU.tap.x, CU.tap.y, CU.tap.w, CU.tap.h, HOME.bigTap(st.data.tapOn), { k: o.tapK, label: st.data.tapOn ? 'Turn off the tap' : 'Turn on the tap', cls: o.tapK ? 'lb-bigtap sx-glow' : 'lb-deco', z: 3 });
    if (st.data.tapOn) {
      h += SX.at(CU.spout.x - 12, CU.spout.y - 4, 24, CU.basinY - CU.spout.y, HOME.water(CU.basinY - CU.spout.y), { cls: 'lb-water lb-deco', z: 2 });
      if (where === 'under') {
        h += SX.at(CU.spout.x - 10, CU.spout.y - 4, 20, FINGERTIP.y - CU.spout.y + 8, HOME.water(FINGERTIP.y - CU.spout.y + 8), { cls: 'lb-water lb-front lb-deco', z: 5 });
        h += SX.at(FINGERTIP.x - 45, FINGERTIP.y - 14, 90, 40, splashArt(), { cls: 'lb-splash lb-deco', z: 5 });
      } else h += SX.at(CU.spout.x - 45, CU.basinY - 26, 90, 40, splashArt(), { cls: 'lb-splash lb-deco', z: 2 });
    }
    h += SX.at(70, 160, 150, 300, HOME.pump(), { label: o.pump ? 'Soap pump: press and hold' : null, cls: o.pump ? 'lb-pump lb-pump-hold sx-glow' : 'lb-pump lb-deco', z: 3 });
    h += SX.at(pos.x, pos.y, HS, HSH, A.washHandsSvg(HS, o.mode || 'wet'), { cls: `lb-hands ${o.cls || ''}`, z: 4, label: o.label || 'Hands', style: `--p:${o.p == null ? 1 : o.p};` });
    if (o.blob) h += SX.at(pos.x + 148, pos.y + 166, 86, 58, blobArt(), { cls: 'lb-blob lb-deco', z: 6, style: `--s:${o.blob};` });
    if (o.towel) h += towelRail() + SX.at(900, 30, 160, 194, HOME.towel('#F4A3B9'), { cls: 'lb-towel sx-drag', label: 'Towel', z: 8 });
    h += coach(st, o.mood);
    return h;
  }
  // rub the hands with a finger (or with a tool, like the towel). o: { area, tool, set(f, box), praise, more, count }
  function rubWire(st, box, o) {
    if (st.done) return;
    SX.scrub(box, o.tool || '.lb-hands', {
      area: o.area || '.lb-hands',
      need: st.s.need,
      noMove: !o.tool,
      progress(f) {
        const hd = box.querySelector('.lb-hands');
        if (hd) {
          hd.classList.add('rubbing');
          clearTimeout(hd.lbT);
          hd.lbT = setTimeout(() => hd.classList.remove('rubbing'), 280);
        }
        if (o.set) o.set(f, box);
        const b = box.querySelector('.lb-bar i');
        if (b) b.style.width = Math.round(f * 100) + '%';
        if (o.count !== false) {
          const n = Math.floor(f * 10);
          if (n > (st.s.count || 0) && n < 10) { st.s.count = n; SX.say(String(n)); showCount(box, n); }
        }
      },
      // done as soon as it is full: no need to lift the finger at the right moment
      full() {
        if (o.count !== false) { st.s.count = 10; showCount(box, 10); }
        SX.done(st, o.praise);
      },
      done() { SX.done(st, o.praise); },
      more: o.more || 'Keep rubbing. Lumi is counting.'
    });
  }
  // a rubbing step at the basin. def: { view(st, f) -> closeUp options, p(f) -> --p while rubbing, zones, tip, praise... }
  function rubStep(def) {
    return Object.assign({
      bg: 'bathHands',
      lumi: null,
      draw(st) {
        const f = st.done ? 1 : Math.min(1, (st.s.rub || 0) / st.s.need);
        const v = def.view(st, f);
        let h = closeUp(st, Object.assign({}, v, { mood: st.done ? 'excited' : 'happy' }));
        if (def.zones) def.zones.forEach((z) => { h += SX.at(z.x, z.y, z.w, z.h, '', { cls: `lb-zone ${st.done ? '' : 'ln-glow'}`, z: 5 }); });
        if (def.tip && !st.done) h += `<div class="ln-tip lb-tip" style="left:${def.tip.x}px;top:${def.tip.y}px">${def.tip.t}</div>`;
        if (!st.done) h += bar(st, (v.pos === 'side' ? POS.side.x : POS.under.x) + 40, 536, 300);
        else h += sparkles(v.pos === 'side' ? 620 : 456, 170);
        return h;
      },
      after(st, box) {
        rubWire(st, box, {
          area: def.zones ? '.lb-zone' : '.lb-hands',
          set: (f, b) => { const hd = b.querySelector('.lb-hands'); if (hd && def.p) hd.style.setProperty('--p', def.p(f).toFixed(3)); if (def.set) def.set(f, b); },
          praise: def.praise,
          more: def.more
        });
      },
      auto(st) { st.s.rub = st.s.need; SX.done(st, def.praise); },
      demo: () => ({ sel: def.zones ? '.lb-zone' : '.lb-hands', rub: true }),
      guide: (st) => (st.done ? null : { sel: '.lb-hands', say: def.guideSay || 'Rub the hands with your finger.' })
    }, def);
  }

  // ================================================================ Wash hands
  const handSteps = [
    {
      id: 'stool',
      ages: ['little'],
      bg: 'homeBath',
      text: 'Time to wash hands! The sink is high, so Lumi uses his step stool.',
      task: (st) => (st.done ? '' : 'Drag the step stool to the sink.'),
      lumi: (st) => Object.assign(sinkLumi(st), { mood: st.done ? 'excited' : 'happy' }),
      enter(st) { st.data.stool = false; st.data.tapOn = false; },
      draw(st) {
        let h = sinkThings(st);
        if (!st.data.stool) {
          h += SX.at(SINK.stool.x, SINK.stool.y, SINK.stool.w, SINK.stool.h, '<div class="lb-spot"></div>', { target: true, id: 'stoolspot', label: 'In front of the sink', z: 1 });
          h += SX.at(24, 440, 140, 90, HOME.stool(), { cls: 'lb-stool sx-drag', label: 'Step stool', z: 6 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lb-stool', '[data-id="stoolspot"]', () => { st.data.stool = true; SX.ok(); SX.done(st, 'Up Lumi goes! Now he can reach the sink.'); return true; }, { miss: () => SX.say('Bring the stool to the sink, where the circle is.') });
      },
      auto(st) { st.data.stool = true; SX.done(st, 'Up Lumi goes! Now he can reach the sink.'); },
      guide: (st) => (st.done ? null : { sel: '.lb-stool', to: '[data-id="stoolspot"]', say: 'Drag the stool to the sink.' })
    },
    {
      id: 'tapon',
      bg: 'homeBath',
      text: () => (little() ? 'First, turn on the water. Not too strong.' : 'Before eating, Lumi washes his hands. First, turn on the water.'),
      task: (st) => (st.done ? '' : 'Tap the tap to turn the water on.'),
      lumi: (st) => Object.assign(sinkLumi(st), { mood: st.done ? 'excited' : 'happy' }),
      enter(st) { st.data.stool = true; st.data.tapOn = false; },
      draw: (st) => sinkThings(st, { tapK: st.data.tapOn ? null : 'tap' }),
      tap(st, k) {
        if (k !== 'tap' || st.data.tapOn) return;
        st.data.tapOn = true;
        tone(300, 0.4, 0.03);
        SX.done(st, 'Water on! Feel it first. Not too hot.');
      },
      auto(st) { st.data.tapOn = true; SX.done(st, 'Water on! Feel it first. Not too hot.'); },
      demo: () => ({ sel: '[data-k="tap"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="tap"]', say: 'Tap the tap.' })
    },
    rubStep({
      id: 'wet',
      text: 'Hold your hands under the water. Get them wet all over.',
      task: (st) => (st.done ? '' : 'Rub the hands under the water.'),
      guideSay: 'Rub the hands under the water.',
      praise: 'Wet all over!',
      more: 'A little more. Wet them all over.',
      enter(st) { st.data.tapOn = true; st.s.need = 520; },
      view: (st, f) => ({ mode: 'wet', pos: 'under', p: f }),
      p: (f) => f
    }),
    {
      id: 'soap',
      bg: 'bathHands',
      text: 'Now some soap, away from the water. One press is enough.',
      task: (st) => (st.done ? '' : 'Press and hold the soap pump.'),
      lumi: null,
      enter(st) { st.data.tapOn = true; st.s.p = 0; },
      draw(st) {
        let h = closeUp(st, { mode: 'wet', pos: 'side', p: 1, pump: !st.done, blob: st.done ? 1 : Math.max(0.001, st.s.p || 0), mood: st.done ? 'excited' : 'happy' });
        if (!st.done) h += '<div class="ln-tip lb-tip" style="left:58px;top:92px">Just one press</div>';
        return h;
      },
      after(st, box) {
        if (st.done) return;
        wireHold(st, box, '.lb-pump-hold', {
          progress(p, b) { const bl = b.querySelector('.lb-blob'); if (bl) bl.style.setProperty('--s', p.toFixed(3)); },
          done() { SX.done(st, 'A blob of soap. Just right!'); },
          more: 'Press and hold the pump a little longer.'
        });
      },
      auto(st) { st.s.p = 1; SX.done(st, 'A blob of soap. Just right!'); },
      demo: () => ({ sel: '.lb-pump-hold', tap: true, hold: true }),
      guide: (st) => (st.done ? null : { sel: '.lb-pump-hold', say: 'Press and hold the soap pump.' })
    },
    rubStep({
      id: 'bubbles',
      text: 'Rub your palms together to make lots of bubbles. Lumi counts to ten.',
      task: (st) => (st.done ? '' : 'Rub the hands with your finger.'),
      praise: 'Ten! Lots of bubbles.',
      enter(st) { st.data.tapOn = true; st.s.need = level() >= 3 ? 1000 : 820; },
      view: (st, f) => ({ mode: 'soap', pos: 'side', p: f, blob: st.done ? 0 : Math.max(0, 1 - f * 1.6) }),
      p: (f) => f,
      set(f, b) { const bl = b.querySelector('.lb-blob'); if (bl) bl.style.setProperty('--s', Math.max(0, 1 - f * 1.6).toFixed(3)); }
    }),
    rubStep({
      id: 'fingers',
      min: 2,
      text: 'Wash between the fingers too. Slide them in and out.',
      task: (st) => (st.done ? '' : 'Rub between the fingers.'),
      guideSay: 'Rub between the fingers.',
      praise: 'Clean fingers!',
      enter(st) { st.data.tapOn = true; st.s.need = 600; },
      view: () => ({ mode: 'soap', pos: 'side', p: 1, cls: 'lb-fing' }),
      zones: [{ x: 610, y: 262, w: 162, h: 136 }],
      tip: { x: 836, y: 252, t: 'Between the fingers' }
    }),
    rubStep({
      id: 'backs',
      min: 3,
      text: 'Now the backs of the hands, and the thumbs.',
      task: (st) => (st.done ? '' : 'Rub the backs of the hands.'),
      guideSay: 'Rub the backs of the hands.',
      praise: 'The backs are clean too!',
      enter(st) { st.data.tapOn = true; st.s.need = 600; },
      view: () => ({ mode: 'soap', pos: 'side', p: 1, cls: 'lb-back' }),
      zones: [{ x: 598, y: 372, w: 94, h: 98 }, { x: 690, y: 372, w: 94, h: 98 }],
      tip: { x: 852, y: 252, t: 'The backs of the hands' }
    }),
    rubStep({
      id: 'rinse',
      text: 'Hands back under the water. Rinse all the bubbles away.',
      task: (st) => (st.done ? '' : 'Rub the hands under the water.'),
      guideSay: 'Rub the hands under the water.',
      praise: 'No more bubbles!',
      more: 'Keep rinsing. Rub, rub under the water.',
      enter(st) { st.data.tapOn = true; st.s.need = 700; },
      view: (st, f) => ({ mode: 'rinse', pos: 'under', p: f }),
      p: (f) => f
    }),
    {
      id: 'tapoff',
      min: 2,
      bg: 'bathHands',
      text: 'All rinsed. Turn the water off, so it is not wasted.',
      task: (st) => (st.done ? '' : 'Tap the tap to turn the water off.'),
      lumi: null,
      enter(st) { st.data.tapOn = true; },
      draw: (st) => closeUp(st, { mode: 'wet', pos: 'under', p: 1, tapK: st.data.tapOn ? 'tapoff' : null, mood: st.done ? 'excited' : 'happy' }),
      tap(st, k) {
        if (k !== 'tapoff' || !st.data.tapOn) return;
        st.data.tapOn = false;
        tone(500, 0.12, 0.05);
        SX.done(st, 'Water off. Good job!');
      },
      auto(st) { st.data.tapOn = false; SX.done(st, 'Water off. Good job!'); },
      demo: () => ({ sel: '[data-k="tapoff"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="tapoff"]', say: 'Tap the tap to turn it off.' })
    },
    {
      id: 'dry',
      bg: 'bathHands',
      text: () => (level() < 2 ? 'Lumi turns the water off. Now dry your hands with the towel.' : 'Now dry your hands with the towel.'),
      task: (st) => (st.done ? '' : 'Drag the towel over the hands to dry them.'),
      lumi: null,
      enter(st) { st.data.tapOn = false; st.s.need = 650; },
      draw(st) {
        const f = st.done ? 1 : Math.min(1, (st.s.rub || 0) / st.s.need);
        let h = closeUp(st, { mode: 'wet', pos: 'under', p: 1 - f, towel: !st.done, mood: st.done ? 'excited' : 'happy' });
        if (!st.done) h += bar(st, POS.under.x + 40, 536, 300);
        else h += towelRail() + SX.at(900, 30, 160, 194, HOME.towel('#F4A3B9'), { cls: 'lb-deco', z: 3 }) + sparkles(456, 170);
        return h;
      },
      after(st, box) {
        rubWire(st, box, { tool: '.lb-towel', area: '.lb-hands', praise: 'Dry and clean!', more: 'Keep drying. Pat, pat, rub.', count: false, set: (f, b) => { const hd = b.querySelector('.lb-hands'); if (hd) hd.style.setProperty('--p', (1 - f).toFixed(3)); } });
      },
      auto(st) { st.s.rub = st.s.need; SX.done(st, 'Dry and clean!'); },
      demo: () => ({ sel: '.lb-towel', to: '.lb-hands', rub: true }),
      guide: (st) => (st.done ? null : { sel: '.lb-towel', say: 'Drag the towel over the hands.' })
    },
    {
      id: 'five',
      bg: 'homeBath',
      text: 'All done! Lumi has clean hands, ready to eat.',
      task: (st) => (st.done ? '' : 'Tap Lumi to give him a high five.'),
      lumi: (st) => Object.assign(sinkLumi(st), { mood: st.done ? 'excited' : 'happy', wave: !!st.done }),
      enter(st) { st.data.stool = true; st.data.tapOn = false; },
      draw(st) {
        let h = sinkThings(st);
        if (!st.done) h += lumiHit(sinkLumi(st), 'five', 'Give Lumi a high five');
        else h += SX.bubble(330, 160, 'Clean hands!', { w: 200, tail: 'down' }) + sparkles(150, 250);
        return h;
      },
      tap(st, k) { if (k === 'five') { tone(880, 0.3, 0.06); SX.done(st, 'High five! Clean hands, well done.'); } },
      auto(st) { SX.done(st, 'High five! Clean hands, well done.'); },
      demo: () => ({ sel: '[data-k="five"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="five"]', say: 'Tap Lumi for a high five.' })
    }
  ];

  // ================================================================ the toilet at home
  // the hallway with the toilet door; the light switch is outside, like in many Singapore homes
  const DOOR = { x: 460, y: 66, w: 240, h: 404 };
  const SWITCH = { x: 724, y: 236, w: 56, h: 84 };
  const tilesIn = (x, y, w, h, c, line, s) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>${Array.from({ length: Math.ceil(w / s) }, (_, i) => `<path d="M${x + i * s} ${y}v${h}" stroke="${line}" stroke-width="2"/>`).join('')}${Array.from({ length: Math.ceil(h / s) }, (_, j) => `<path d="M${x} ${y + j * s}h${w}" stroke="${line}" stroke-width="2"/>`).join('')}`;
  SX.bg.toiletDoor = () => `<rect width="${W}" height="470" fill="#F6EBDD"/><rect width="${W}" height="470" fill="url(#lpShadeV)" opacity=".2"/>
    <rect y="452" width="${W}" height="18" fill="#E2CDB2"/><rect y="452" width="${W}" height="4" fill="#fff" opacity=".5"/>
    <rect y="470" width="${W}" height="100" fill="#D9B48A"/>${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100 - 30} 470l${-40 + i * 7} 100" stroke="#B98E62" stroke-opacity=".45" stroke-width="2"/>`).join('')}
    ${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${486 + i * i * 9}H${W}" stroke="#000" stroke-opacity=".05" stroke-width="2"/>`).join('')}<rect y="470" width="${W}" height="100" fill="url(#lpFloorFade)"/>
    ${vol('<rect x="110" y="110" width="200" height="150" rx="10"/>', '#C9A27A', { shade: 'v' })}<rect x="124" y="124" width="172" height="122" rx="4" fill="url(#lpSky)"/>
    <path d="M124 246l50-60 40 40 30-26 52 46z" fill="#9CCB7A"/><path d="M124 246l50-60 40 40 30-26 52 46z" fill="url(#lpShadeV)" opacity=".4"/><circle cx="262" cy="156" r="14" fill="#FFD84D"/>
    ${LP.drop(960, 472, 110, 8)}${vol('<rect x="860" y="380" width="200" height="90" rx="10"/>', '#E8D5BC', { shade: 'v' })}<path d="M870 420h180" stroke="#C9A27A" stroke-width="3"/>${HOME.plant(984, 262, 0.95)}`;
  // the toilet room: tiles, a louvre window, a shelf, the bidet hose, the roll holder, a small sink, a floor trap
  SX.bg.toiletRoom = () => `${HOME.tiledWall('#EAF2F6', '#FFFFFF', 470, '#D3DEE6')}
    ${vol('<rect x="104" y="34" width="190" height="168" rx="12"/>', '#FFFFFF')}<rect x="118" y="48" width="162" height="140" rx="6" fill="#CFE6F2"/>
    ${Array.from({ length: 6 }, (_, i) => `<g transform="rotate(-8 199 ${62 + i * 22})">${vol(`<rect x="122" y="${54 + i * 22}" width="154" height="16" rx="4"/>`, '#E9F3F8', { lineOpacity: 0.3 })}<rect x="122" y="${54 + i * 22}" width="154" height="16" rx="4" fill="url(#lpGlass)"/></g>`).join('')}
    ${vol('<rect x="104" y="296" width="190" height="14" rx="6"/>', '#FFFFFF', { shade: 'v' })}<g transform="translate(112 252)">${vol('<rect x="0" y="0" width="54" height="44" rx="16"/>', '#FFFFFF', { shade: 'v' })}<ellipse cx="27" cy="22" rx="7" ry="13" fill="#E3E8ED"/></g>
    <path d="M415 166v22" stroke="#9AA6B2" stroke-width="6" stroke-linecap="round"/>${vol('<circle cx="415" cy="168" r="7"/>', '#C9D1D9')}
    <path d="M510 352c-14 60-30 92-6 96 20 4 24-30 30-54" fill="none" stroke="#9AA6B2" stroke-width="7" stroke-linecap="round"/><path d="M510 352c-14 60-30 92-6 96 20 4 24-30 30-54" fill="none" stroke="#DDE3E9" stroke-width="3" stroke-linecap="round"/>
    ${vol('<circle cx="534" cy="392" r="12"/>', '#D5DCE3')}${vol('<rect x="496" y="292" width="30" height="14" rx="5"/>', '#C9D1D9', { shade: 'v' })}${vol('<rect x="501" y="298" width="18" height="58" rx="8"/>', '#E3E8ED', { shade: 'h' })}
    <g transform="translate(766 292)">${vol('<rect x="2" y="2" width="96" height="14" rx="6"/>', '#D5DCE3', { shade: 'v' })}${vol('<rect x="6" y="12" width="8" height="26" rx="3"/><rect x="86" y="12" width="8" height="26" rx="3"/>', '#C9D1D9')}
      ${vol('<rect x="12" y="18" width="76" height="48" rx="18"/>', '#FFFFFF', { shade: 'v' })}<path d="M20 22v40M80 22v40" stroke="#E3E8ED" stroke-width="2"/></g>
    ${vol('<rect x="906" y="72" width="166" height="150" rx="16"/>', '#FFFFFF')}<rect x="918" y="84" width="142" height="126" rx="10" fill="#DCEEF7"/><rect x="918" y="84" width="142" height="126" rx="10" fill="url(#lpGlass)"/>
    ${LP.drop(990, 474, 60, 7)}${vol('<path d="M966 336h48l-6 134h-36z"/>', '#FFFFFF', { shade: 'h' })}
    <g transform="translate(948 238) scale(.9)">${vol('<rect x="22" y="40" width="16" height="48" rx="6"/>', '#DDE3E9', { shade: 'h' })}<path d="M30 46V30a10 10 0 0 1 10-10h20a8 8 0 0 1 8 8v10" fill="none" stroke="url(#lpMetal)" stroke-width="12" stroke-linecap="round"/>${vol('<rect x="14" y="6" width="34" height="11" rx="5"/>', '#9AA6B2')}</g>
    ${vol('<path d="M900 300h180c0 30-30 48-90 48s-90-18-90-48z"/>', '#FFFFFF', { shade: 'v' })}<ellipse cx="990" cy="302" rx="80" ry="10" fill="#C7DCE8"/>
    ${vol('<ellipse cx="830" cy="520" rx="26" ry="9"/>', '#C9D1D9')}<path d="M812 520h36M818 515h24M818 525h24" stroke="#8A97A6" stroke-width="2"/>`;

  // ---------------------------------------------------------------- toilet props
  // the toilet, front view (220 x 290): cistern, bowl, seat; the lid down, or up against the cistern
  const toiletSvg = (o) => {
    const op = o || {};
    const cistern = `${vol('<rect x="34" y="26" width="152" height="104" rx="14"/>', '#F8FAFB', { shade: 'h' })}${vol('<rect x="26" y="12" width="168" height="22" rx="10"/>', '#FFFFFF', { shade: 'v' })}`;
    const lidUp = `${vol('<path d="M26 150V74c0-28 30-42 84-42s84 14 84 42v76z"/>', '#FFFFFF', { shade: 'h' })}<path d="M42 146V80c0-18 24-30 68-30s68 12 68 30v66" fill="none" stroke="#DCE3E8" stroke-width="4"/>`;
    const bowl = vol('<path d="M16 152c0 50 34 78 56 94l-4 30q42 10 84 0l-4-30c22-16 56-44 56-94z"/>', '#FFFFFF', { shade: 'h' });
    const seat = `<ellipse cx="110" cy="157" rx="95" ry="28" fill="#DCE3E8"/>${vol('<ellipse cx="110" cy="150" rx="95" ry="28"/>', '#FFFFFF')}<ellipse cx="110" cy="153" rx="64" ry="16" fill="#A9D2EA"/><ellipse cx="110" cy="157" rx="40" ry="8" fill="#86BCDD"/><ellipse cx="110" cy="153" rx="64" ry="16" fill="none" stroke="#8A97A6" stroke-opacity=".55" stroke-width="2"/>`;
    const lidDown = `<ellipse cx="110" cy="157" rx="96" ry="28" fill="#DCE3E8"/>${vol('<ellipse cx="110" cy="147" rx="96" ry="30"/>', '#FFFFFF')}<ellipse cx="94" cy="139" rx="46" ry="9" fill="#fff" opacity=".85"/>`;
    const kid = op.kid ? `<ellipse cx="110" cy="152" rx="74" ry="20" fill="#5E9FCF"/>${vol('<path fill-rule="evenodd" d="M36 148a74 20 0 1 0 148 0a74 20 0 1 0-148 0zM72 150a38 9 0 1 0 76 0a38 9 0 1 0-76 0z"/>', '#8EC5F2')}${vol('<rect x="26" y="138" width="16" height="20" rx="7"/><rect x="178" y="138" width="16" height="20" rx="7"/>', '#F4B860')}` : '';
    return svg('0 0 220 290', `${LP.drop(110, 282, 76, 8)}${cistern}${op.lid === 'open' ? lidUp : ''}${bowl}${op.lid === 'open' ? seat + kid : lidDown}`);
  };
  const flushArt = (down) => svg('0 0 120 70', `${vol('<ellipse cx="60" cy="44" rx="36" ry="13"/>', '#C9D1D9', { shade: 'v' })}${vol(`<path d="M30 ${down ? 42 : 36}a30 11 0 0 1 60 0v4a30 11 0 0 1-60 0z"/>`, '#E9EDF1', { shade: 'v' })}<ellipse cx="60" cy="${down ? 42 : 36}" rx="30" ry="11" fill="#F4F6F8" stroke="#8A97A6" stroke-opacity=".6" stroke-width="1.6"/><path d="M60 ${down ? 31 : 25}v22" stroke="#8A97A6" stroke-width="2.4"/>`);
  // the small seat for little ones (it hangs on a hook by the toilet)
  const kidSeatArt = () => svg('0 0 110 124', `${LP.drop(55, 120, 40, 4)}
    ${vol('<path fill-rule="evenodd" d="M55 20c28 0 48 22 48 50s-20 48-48 48S7 98 7 70 27 20 55 20zm0 24c-14 0-23 12-23 27s9 25 23 25 23-10 23-25-9-27-23-27z"/>', '#8EC5F2')}
    ${vol('<rect x="0" y="58" width="14" height="26" rx="6"/><rect x="96" y="58" width="14" height="26" rx="6"/>', '#F4B860')}`);
  // toilet paper: the end hanging from the roll, and a torn-off piece folded in half
  const zig = (x0, x1, y) => { let d = ''; for (let x = x1, i = 0; x > x0; x -= 6, i++) d += `L${Math.max(x0, x - 6)} ${y + (i % 2 ? 0 : 4)}`; return d; };
  const paperTail = (short) => { const b = short ? 18 : 70; return svg('0 0 72 92', `<path d="M14 0h44v${b}${zig(14, 58, b)}z" fill="#FFFFFF" stroke="#C9D1D9" stroke-width="2" stroke-linejoin="round"/><path d="M14 0h44v10H14z" fill="#000" opacity=".06"/>${short ? '' : '<path d="M16 36h40" stroke="#D5DCE3" stroke-width="2" stroke-dasharray="4 4"/>'}`); };
  const paperPiece = () => svg('0 0 70 60', `${LP.drop(35, 56, 28, 3)}<path d="M8 10h50l4 40H12z" fill="#F2F4F6" stroke="#C9D1D9" stroke-width="2"/><path d="M4 6h54l2 40H6z" fill="#FFFFFF" stroke="#C9D1D9" stroke-width="2"/><path d="M8 26h48" stroke="#E3E8ED" stroke-width="2" stroke-dasharray="4 4"/>`);
  const switchArt = (on) => svg('0 0 56 84', `${LP.drop(28, 82, 24, 3)}${vol('<rect x="3" y="3" width="50" height="76" rx="9"/>', '#FFFFFF', { shade: 'v' })}${vol('<rect x="15" y="16" width="26" height="50" rx="6"/>', '#F2F4F6')}
    <path d="M17 ${on ? 41 : 20}h22v22H17z" fill="#000" opacity=".08"/><circle cx="28" cy="${on ? 26 : 56}" r="4.5" fill="${on ? '#F4B860' : '#C9D1D9'}" stroke="${LP.INK}" stroke-opacity=".3"/>`);
  // the toilet door: closed (a sign, a lever, a little air vent) or open (the toilet inside; dark until the light is on)
  const doorSvg = (open, light) => {
    const inside = `${tilesIn(14, 14, 212, 300, '#DCEBF3', '#FFFFFF', 34)}<rect x="14" y="314" width="212" height="86" fill="#C9D6DF"/><rect x="14" y="314" width="212" height="86" fill="url(#lpFloorFade)"/>
      <svg x="62" y="150" width="130" height="172" viewBox="0 0 220 290">${toiletSvg({ lid: 'closed' }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
      ${light ? '<rect x="14" y="14" width="212" height="386" fill="#FFF6C8" opacity=".25"/>' : '<rect x="14" y="14" width="212" height="386" fill="#2B2F4A" opacity=".66"/>'}
      ${vol('<path d="M14 14l48 22v342l-48 22z"/>', '#E9D5BC', { shade: 'h' })}`;
    const shut = `${vol('<rect x="16" y="14" width="208" height="386" rx="4"/>', '#EAD8C0', { shade: 'h' })}
      <rect x="36" y="186" width="168" height="110" rx="8" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4"/>
      ${vol('<rect x="78" y="56" width="84" height="84" rx="14"/>', '#FFFFFF')}<g transform="translate(92 66) scale(.26)">${vol('<rect x="34" y="26" width="152" height="104" rx="14"/><path d="M16 152c0 50 34 78 56 94l-4 30q42 10 84 0l-4-30c22-16 56-44 56-94z"/><ellipse cx="110" cy="147" rx="96" ry="30"/>', '#5B8FD9', { lineWidth: 5 })}</g>
      ${Array.from({ length: 4 }, (_, i) => `<rect x="60" y="${322 + i * 14}" width="120" height="8" rx="3" fill="#C9A27A" opacity=".6"/>`).join('')}
      ${vol('<circle cx="194" cy="232" r="11"/>', '#D5DCE3')}${vol('<rect x="160" y="226" width="40" height="12" rx="6"/>', '#E3E8ED', { shade: 'v' })}
      ${light ? '<rect x="16" y="396" width="208" height="6" rx="3" fill="#FFE27A"/><rect x="16" y="398" width="208" height="12" fill="#FFE27A" opacity=".35"/>' : ''}`;
    return svg(`0 0 ${DOOR.w} ${DOOR.h}`, `${vol(`<rect x="0" y="0" width="${DOOR.w}" height="${DOOR.h}" rx="6"/>`, '#FFFFFF', { shade: 'v' })}${open ? inside : shut}`);
  };

  // ---------------------------------------------------------------- where things are in the toilet
  const TOI = { x: 530, y: 190, w: 220, h: 290 };
  const STAND = { x: 400, y: 530, h: 200 };
  const SIT = { x: 640, y: 402, h: 180 };
  const HOOK = { x: 360, y: 172, w: 110, h: 124 };
  const ROLL = { x: 780, y: 344, w: 72, h: 92 };
  const PIECE = { x: SIT.x + 40, y: SIT.y - 118, w: 92, h: 80 };
  const shortsCls = (st) => `lb-shorts ${st.data.pants === 'down' ? 'lb-down' : ''} ${st.s.anim ? `lb-go-${st.s.anim}` : ''}`;
  const tLumi = (st, mood, extra) => Object.assign({}, st.data.sit ? SIT : STAND, { mood: mood || 'happy', cls: shortsCls(st) }, extra || {});
  // set the toilet for a step (so Back and Next always show the right picture)
  const setT = (st, o) => Object.assign(st.data, { lid: 'closed', kid: false, pants: 'up', sit: false, paper: '', phones: !!st.data.phones }, o);
  function toiletThings(st, o) {
    const op = o || {};
    let h = SX.at(TOI.x, TOI.y, TOI.w, TOI.h, toiletSvg({ lid: st.data.lid, kid: st.data.kid }), { cls: 'lb-deco', z: 2 });
    h += SX.at(TOI.x + 50, TOI.y - 26, 120, 70, flushArt(op.flushDown), { k: op.flushK, label: 'Flush button', cls: op.flushK ? 'lb-flush sx-glow' : 'lb-deco', z: 3 });
    if (!st.data.kid && !op.kidDrag) h += SX.at(HOOK.x, HOOK.y, HOOK.w, HOOK.h, kidSeatArt(), { cls: 'lb-deco', z: 2 });
    h += SX.at(ROLL.x, ROLL.y, ROLL.w, ROLL.h, paperTail(st.data.paper !== ''), { cls: op.pull ? 'lb-tail sx-drag' : 'lb-deco', label: op.pull ? 'Toilet paper' : null, z: op.pull ? 6 : 2 });
    h += SX.at(TOI.x + 50, 470, 120, 77, HOME.stool('#8EC5F2'), { cls: 'lb-deco', z: 3 });
    return h;
  }
  const lidHit = (st, k) => (st.data.lid === 'open' ? SX.at(TOI.x + 22, TOI.y + 30, 176, 122, '', { k, label: 'Close the lid', cls: 'lb-hit ln-glow', z: 7 })
    : SX.at(TOI.x + 12, TOI.y + 112, 196, 76, '', { k, label: 'Lift the lid', cls: 'lb-hit ln-glow', z: 7 }));

  const toiletSteps = [
    {
      id: 'light',
      min: 3,
      bg: 'toiletDoor',
      text: 'Lumi needs to go to the toilet. First, switch on the light.',
      task: (st) => (st.done ? '' : 'Tap the light switch.'),
      lumi: (st) => ({ x: 300, y: 530, h: 210, mood: st.done ? 'excited' : 'happy', cls: 'lb-shorts' }),
      enter(st) { setT(st, {}); st.data.light = false; st.data.door = false; },
      draw: (st) => SX.at(DOOR.x, DOOR.y, DOOR.w, DOOR.h, doorSvg(false, st.data.light), { cls: 'lb-deco', z: 1 }) + SX.at(SWITCH.x - 18, SWITCH.y - 14, SWITCH.w + 36, SWITCH.h + 28, `<span class="lb-switch">${switchArt(st.data.light)}</span>`, { k: st.data.light ? null : 'light', label: 'Light switch', cls: st.data.light ? 'lb-switchbox' : 'lb-switchbox sx-glow', z: 3 }),
      tap(st, k) { if (k !== 'light' || st.data.light) return; st.data.light = true; tone(1200, 0.06, 0.05); SX.done(st, 'Click! The light is on.'); },
      auto(st) { st.data.light = true; SX.done(st, 'Click! The light is on.'); },
      demo: () => ({ sel: '[data-k="light"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="light"]', say: 'Tap the light switch.' })
    },
    {
      id: 'door',
      bg: 'toiletDoor',
      text: () => (level() >= 3 ? 'The light is on. Now Lumi opens the toilet door.' : 'Lumi needs to go to the toilet. Everyone does!'),
      task: (st) => (st.done ? '' : 'Tap the door to open it.'),
      lumi: (st) => Object.assign(st.data.door ? { x: 580, y: 512, h: 200 } : { x: 300, y: 530, h: 210 }, { mood: 'happy', cls: 'lb-shorts' }),
      enter(st) { setT(st, {}); st.data.light = true; st.data.door = false; },
      draw: (st) => SX.at(DOOR.x, DOOR.y, DOOR.w, DOOR.h, doorSvg(st.data.door, st.data.light), { k: st.data.door ? null : 'door', label: 'Toilet door', cls: st.data.door ? 'lb-deco' : 'lb-door', z: 1 }) + SX.at(SWITCH.x - 18, SWITCH.y - 14, SWITCH.w + 36, SWITCH.h + 28, `<span class="lb-switch">${switchArt(true)}</span>`, { cls: 'lb-switchbox lb-deco', z: 1 }),
      tap(st, k) { if (k !== 'door' || st.data.door) return; st.data.door = true; tone(520, 0.12, 0.05); SX.done(st, 'The door is open. In Lumi goes.'); },
      auto(st) { st.data.door = true; SX.done(st, 'The door is open. In Lumi goes.'); },
      demo: () => ({ sel: '[data-k="door"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="door"]', say: 'Tap the door.' })
    },
    {
      id: 'lid',
      bg: 'toiletRoom',
      text: 'This is the toilet. First, lift the lid up.',
      task: (st) => (st.done ? '' : 'Tap the lid to lift it.'),
      lumi: (st) => tLumi(st, st.done ? 'excited' : 'happy'),
      enter(st) { setT(st, {}); },
      draw: (st) => toiletThings(st) + (st.done ? '' : lidHit(st, 'lid')),
      tap(st, k) { if (k !== 'lid' || st.data.lid === 'open') return; st.data.lid = 'open'; tone(600, 0.12, 0.05); SX.done(st, 'Lid up!'); },
      auto(st) { st.data.lid = 'open'; SX.done(st, 'Lid up!'); },
      demo: () => ({ sel: '[data-k="lid"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="lid"]', say: 'Tap the lid.' })
    },
    {
      id: 'kidseat',
      min: 2,
      bg: 'toiletRoom',
      text: 'Lumi puts his small seat on top, so he feels safe and comfy.',
      task: (st) => (st.done ? '' : 'Drag the small seat onto the toilet.'),
      lumi: (st) => tLumi(st),
      enter(st) { setT(st, { lid: 'open' }); },
      draw(st) {
        let h = toiletThings(st, { kidDrag: !st.done });
        if (!st.done) {
          h += SX.at(TOI.x + 26, TOI.y + 116, 168, 70, '<div class="lb-spot lb-oval"></div>', { target: true, id: 'seat', label: 'The toilet seat', z: 4 });
          h += SX.at(HOOK.x, HOOK.y, HOOK.w, HOOK.h, kidSeatArt(), { cls: 'lb-kidseat sx-drag', label: 'Small seat', z: 8 });
        }
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lb-kidseat', '[data-id="seat"]', () => { st.data.kid = true; SX.ok(); SX.done(st, 'The small seat fits. Safe and comfy.'); return true; }, { miss: () => SX.say('Put it on the toilet seat, in the circle.') });
      },
      auto(st) { st.data.kid = true; SX.done(st, 'The small seat fits. Safe and comfy.'); },
      guide: (st) => (st.done ? null : { sel: '.lb-kidseat', to: '[data-id="seat"]', say: 'Drag the small seat onto the toilet.' })
    },
    {
      id: 'pants',
      bg: 'toiletRoom',
      text: 'Now pull the shorts down, so they stay dry.',
      task: (st) => (st.done ? '' : 'Tap Lumi to pull his shorts down.'),
      lumi: (st) => tLumi(st),
      enter(st) { setT(st, { lid: 'open', kid: level() >= 2 }); },
      draw: (st) => toiletThings(st) + (st.done ? '' : lumiHit(STAND, 'pants', 'Pull the shorts down')),
      tap(st, k) {
        if (k !== 'pants' || st.data.pants === 'down') return;
        st.data.pants = 'down';
        st.s.anim = 'down';
        SX.later(st, () => { st.s.anim = ''; }, 1200);
        tone(440, 0.12, 0.04);
        SX.done(st, 'Shorts down. Ready to sit.');
      },
      auto(st) { st.data.pants = 'down'; SX.done(st, 'Shorts down. Ready to sit.'); },
      demo: () => ({ sel: '[data-k="pants"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="pants"]', say: 'Tap Lumi.' })
    },
    {
      id: 'sit',
      bg: 'toiletRoom',
      text: 'Lumi climbs up the step and sits down on the toilet.',
      task: (st) => (st.done ? '' : 'Tap the toilet seat to help Lumi sit.'),
      lumi: (st) => tLumi(st, st.done ? 'calm' : 'happy'),
      enter(st) { setT(st, { lid: 'open', kid: level() >= 2, pants: 'down' }); },
      draw: (st) => toiletThings(st) + (st.data.sit ? '' : SX.at(TOI.x + 12, TOI.y + 112, 196, 82, '', { k: 'sit', label: 'Sit on the toilet', cls: 'lb-hit ln-glow', z: 7 })),
      tap(st, k) { if (k !== 'sit' || st.data.sit) return; st.data.sit = true; tone(520, 0.15, 0.05); SX.done(st, 'Lumi is sitting on the toilet. Well done!'); },
      auto(st) { st.data.sit = true; SX.done(st, 'Lumi is sitting on the toilet. Well done!'); },
      demo: () => ({ sel: '[data-k="sit"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="sit"]', say: 'Tap the toilet seat.' })
    },
    {
      id: 'wait',
      bg: 'toiletRoom',
      text: 'Take your time. Lumi waits for his pee or poo to come out.',
      task: (st) => (st.done ? '' : 'Tap the circle and breathe slowly with Lumi.'),
      lumi: (st) => tLumi(st, st.done ? 'happy' : 'calm'),
      enter(st) { setT(st, { lid: 'open', kid: level() >= 2, pants: 'down', sit: true }); st.s.n = 0; st.s.phase = ''; },
      draw(st) {
        const ph = st.s.phase || '';
        const word = st.done ? 'All done' : ph === 'in' ? 'Breathe in' : ph === 'out' ? 'Breathe out' : st.s.n ? 'Once more' : 'Breathe';
        let h = toiletThings(st);
        h += SX.at(116, 322, 190, 190, `<span class="lb-breath-ring"></span><span class="lb-breath-word">${word}</span><span class="lb-breath-dots">${[0, 1].map((i) => `<i class="${i < (st.s.n || 0) ? 'on' : ''}"></i>`).join('')}</span>`, { k: st.done ? null : 'breathe', label: 'Breathe with Lumi', cls: `lb-breathe ${ph ? 'lb-' + ph : ''} ${st.done ? 'lb-still' : ''}`, z: 6 });
        return h;
      },
      tap(st, k) {
        if (k !== 'breathe' || st.s.phase || st.done) return;
        st.s.phase = 'in';
        SX.render();
        SX.say('Breathe in, slowly.');
        SX.later(st, () => { if (st.done) return; st.s.phase = 'out'; SX.render(); SX.say('And breathe out.'); }, 3600);
        SX.later(st, () => {
          if (st.done) return;
          st.s.phase = '';
          st.s.n = (st.s.n || 0) + 1;
          if (st.s.n >= 2) { tone(660, 0.2, 0.05); SX.done(st, 'All finished. Taking your time is okay.'); } else { SX.render(); SX.say('Once more. Tap the circle.'); }
        }, 7200);
      },
      auto(st) { st.s.n = 2; st.s.phase = ''; SX.done(st, 'All finished. Taking your time is okay.'); },
      demo: () => ({ sel: '[data-k="breathe"]', tap: true }),
      guide: (st) => (st.done || st.s.phase ? null : { sel: '[data-k="breathe"]', say: 'Tap the circle and breathe.' })
    },
    {
      id: 'paper',
      bg: 'toiletRoom',
      text: 'Lumi is finished. Now he needs some toilet paper.',
      task: (st) => (st.done ? '' : 'Pull the toilet paper down.'),
      lumi: (st) => tLumi(st),
      enter(st) { setT(st, { lid: 'open', kid: level() >= 2, pants: 'down', sit: true }); },
      draw(st) {
        let h = toiletThings(st, { pull: !st.done });
        if (!st.done) h += SX.at(ROLL.x - 4, 448, 80, 80, '<div class="lb-spot"><span class="lb-down-arrow"></span></div>', { target: true, id: 'pull', label: 'Pull down to here', z: 4 });
        else h += SX.at(PIECE.x, PIECE.y, PIECE.w, PIECE.h, paperPiece(), { cls: 'lb-piece lb-wipe lb-deco', z: 6 });
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lb-tail', '[data-id="pull"]', () => { st.data.paper = 'used'; tone(900, 0.08, 0.04); SX.done(st, 'Rip! Lumi wipes his bottom, from front to back.'); return true; }, { miss: () => SX.say('Pull the paper down, to the circle.') });
      },
      auto(st) { st.data.paper = 'used'; SX.done(st, 'Rip! Lumi wipes his bottom, from front to back.'); },
      guide: (st) => (st.done ? null : { sel: '.lb-tail', to: '[data-id="pull"]', say: 'Pull the toilet paper down.' })
    },
    {
      id: 'bin',
      bg: 'toiletRoom',
      text: 'Used toilet paper goes into the toilet, not on the floor.',
      task: (st) => (st.done ? '' : 'Drag the paper into the toilet.'),
      lumi: (st) => tLumi(st),
      enter(st) { setT(st, { lid: 'open', kid: level() >= 2, pants: 'down', sit: true, paper: 'used' }); },
      draw(st) {
        let h = toiletThings(st);
        if (!st.done) {
          h += SX.at(TOI.x + 50, TOI.y + 222, 120, 64, '<div class="lb-spot lb-oval"></div>', { target: true, id: 'bowl', label: 'Into the toilet', z: 6 });
          h += SX.at(PIECE.x, PIECE.y, PIECE.w, PIECE.h, paperPiece(), { cls: 'lb-piece sx-drag', label: 'Used toilet paper', z: 8 });
        } else h += `<div class="lb-plop" style="left:${TOI.x + 80}px;top:${TOI.y + 228}px"></div>`;
        return h;
      },
      after(st, box) {
        if (st.done) return;
        SX.dragTo(box, '.lb-piece', '[data-id="bowl"]', () => { st.data.paper = 'gone'; tone(330, 0.15, 0.05); SX.done(st, 'Plop! Into the toilet.'); return true; }, { miss: () => SX.say('Drop the paper into the toilet, in the circle.') });
      },
      auto(st) { st.data.paper = 'gone'; SX.done(st, 'Plop! Into the toilet.'); },
      guide: (st) => (st.done ? null : { sel: '.lb-piece', to: '[data-id="bowl"]', say: 'Drag the paper into the toilet.' })
    },
    {
      id: 'pantsup',
      bg: 'toiletRoom',
      text: 'Lumi stands up and pulls his shorts up.',
      task: (st) => (st.done ? '' : 'Tap Lumi to pull his shorts up.'),
      lumi: (st) => tLumi(st, st.done ? 'excited' : 'happy'),
      enter(st) { setT(st, { lid: 'open', kid: level() >= 2, pants: 'down', sit: true, paper: 'gone' }); },
      draw: (st) => toiletThings(st) + (st.done ? '' : lumiHit(SIT, 'up', 'Stand up and pull the shorts up')),
      tap(st, k) {
        if (k !== 'up' || st.data.pants === 'up') return;
        st.data.pants = 'up';
        st.data.sit = false;
        st.data.kid = false;
        st.s.anim = 'up';
        SX.later(st, () => { st.s.anim = ''; }, 1200);
        tone(560, 0.12, 0.04);
        SX.done(st, 'Shorts up. All neat!');
      },
      auto(st) { st.data.pants = 'up'; st.data.sit = false; st.data.kid = false; SX.done(st, 'Shorts up. All neat!'); },
      demo: () => ({ sel: '[data-k="up"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="up"]', say: 'Tap Lumi.' })
    },
    {
      id: 'closelid',
      min: 2,
      bg: 'toiletRoom',
      text: 'The small seat goes back on its hook. Now close the lid.',
      task: (st) => (st.done ? '' : 'Tap the lid to close it.'),
      lumi: (st) => tLumi(st),
      enter(st) { setT(st, { lid: 'open', paper: 'gone' }); },
      draw: (st) => toiletThings(st) + (st.done ? '' : lidHit(st, 'close')),
      tap(st, k) { if (k !== 'close' || st.data.lid !== 'open') return; st.data.lid = 'closed'; tone(400, 0.12, 0.05); SX.done(st, 'Lid down. Ready to flush.'); },
      auto(st) { st.data.lid = 'closed'; SX.done(st, 'Lid down. Ready to flush.'); },
      demo: () => ({ sel: '[data-k="close"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="close"]', say: 'Tap the lid to close it.' })
    },
    {
      id: 'flush',
      bg: 'toiletRoom',
      text: () => (level() < 2 ? 'Lid down. Now flush! It makes a loud whoosh, and that is okay.' : 'Now flush! It makes a loud whoosh, and that is okay.'),
      task: (st) => (st.done ? '' : 'Press the flush button.'),
      lumi: (st) => tLumi(st, 'happy'),
      enter(st) { setT(st, { paper: 'gone' }); },
      draw(st) {
        let h = toiletThings(st, { flushK: st.done ? null : 'flush', flushDown: st.done });
        if (!st.data.phones && !st.done) {
          h += SX.at(186, 214, 100, 86, SX.prop.headphones(), { k: 'phones', label: 'Put on headphones', cls: 'lb-phones', z: 4 });
          h += '<div class="ln-tip lb-tip" style="left:100px;top:324px">Too loud? Tap the<br>headphones.</div>';
        }
        if (st.done) h += `<div class="lb-swirl" style="left:${TOI.x + 20}px;top:${TOI.y + 60}px"></div>${SX.bubble(TOI.x + 238, TOI.y + 4, 'Whoosh!', { w: 130, tail: 'left' })}`;
        return h;
      },
      tap(st, k) {
        if (k === 'phones' && !st.data.phones) { st.data.phones = true; SX.ok(); SX.render(); SX.say('Headphones on. The noise will be softer.'); return; }
        if (k !== 'flush' || st.done) return;
        whoosh(st.data.phones);
        SX.done(st, 'Whoosh! All gone. The noise stops soon.');
      },
      auto(st) { SX.done(st, 'Whoosh! All gone. The noise stops soon.'); },
      demo: () => ({ sel: '[data-k="flush"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="flush"]', say: 'Press the flush button.' })
    },
    rubStep({
      id: 'wash',
      text: 'After the toilet, always wash your hands with soap. Rub, rub, rub!',
      task: (st) => (st.done ? '' : 'Rub the hands with your finger.'),
      praise: 'Bubbles! Now rinse and dry. Clean hands!',
      enter(st) { st.data.tapOn = true; st.s.need = 700; },
      view: (st, f) => ({ mode: 'soap', pos: 'side', p: f, blob: st.done ? 0 : Math.max(0, 1 - f * 1.6) }),
      p: (f) => f,
      set(f, b) { const bl = b.querySelector('.lb-blob'); if (bl) bl.style.setProperty('--s', Math.max(0, 1 - f * 1.6).toFixed(3)); }
    }),
    {
      id: 'five',
      bg: 'toiletRoom',
      text: 'All done! Lumi used the toilet all by himself.',
      task: (st) => (st.done ? '' : 'Tap Lumi to give him a high five.'),
      lumi: (st) => tLumi(st, st.done ? 'excited' : 'happy', { wave: !!st.done }),
      enter(st) { setT(st, { paper: 'gone' }); },
      draw(st) {
        let h = toiletThings(st);
        if (!st.done) h += lumiHit(STAND, 'five', 'Give Lumi a high five');
        else h += SX.bubble(STAND.x - 250, 410, 'I did it!', { w: 150, tail: 'right' }) + sparkles(STAND.x - 100, 326);
        return h;
      },
      tap(st, k) { if (k === 'five') { tone(880, 0.3, 0.06); SX.done(st, 'High five! Lumi is so proud of you.'); } },
      auto(st) { SX.done(st, 'High five! Lumi is so proud of you.'); },
      demo: () => ({ sel: '[data-k="five"]', tap: true }),
      guide: (st) => (st.done ? null : { sel: '[data-k="five"]', say: 'Tap Lumi for a high five.' })
    }
  ];

  // ================================================================ register the lessons
  // like SX.lessonWithLevels (steps by level: min 2 Medium, min 3 Challenge), and also by age: a step with
  // ages: ['little'] is only for little ones (the step stool)
  function register(d, list) {
    const now = () => SX.levelSteps(list).filter((s) => !s.ages || s.ages.includes(ageNow()));
    Object.defineProperty(d, 'steps', { get: now, set() {}, enumerable: true });
    Object.defineProperty(d, 'pages', { get: now, set() {}, enumerable: true });
    SX.lesson(d);
  }
  register({ tut: 'hands', realText: 'Wash your hands before you eat and after the toilet. Lumi can count to ten with you.', realSay: 'washed your hands for real' }, handSteps);
  SX.lessonWithLevels({ tut: 'toilet', realText: 'When you need to go, go to the toilet. Take your time, and ask a grown-up if you need help.', realSay: 'used the toilet for real' }, toiletSteps);
})();
