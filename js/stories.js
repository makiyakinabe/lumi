/*
  stories.js
  Story adventures: interactive, real-life practice. Each story is a set of scenes the child acts out
  with Lumi, with step-by-step guidance: drag the tissue packet to chope a table, pick a stall, order from
  the menu, choose how to pay, carry the tray, return it. Lumi says what is happening and what to do
  next; the guide hand shows where to tap; nothing is ever timed or marked wrong.

  The engine is here; each story is its own file (story-*.js) and registers with A.SX.story({...}).

  A story:  { id, title, tint, ages: ['little','primary','teen'] (omit for all), steps: [step, ...] }
  A step:
    id
    bg       background: a name in SX.bg, or fn(st) returning SVG markup in scene pixels (SX.W x SX.H)
    text     what is happening (shown and read aloud): string or fn(st)
    task     what the child does now, e.g. "Drag the tissue packet onto a table you like." (omit = info)
    lumi     where Lumi stands: { x, y (his feet, scene px), h (size px), mood, flip, z, look } or fn(st)
             Layering: Lumi is z 5 unless the step says otherwise. Things in the scene are layered by their
             own z (SX.at(..., { z })): use z < 5 for things behind Lumi, z > 5 for things in front of him.
    draw(st)        HTML for the things in the scene (use SX.at to place them)
    enter(st)       when the step opens (st.s is a fresh object for this step)
    tap(st, k, el, d)  buttons made with SX.at(..., { k }) send data-a="sx" data-k
    after(st, box)  after each draw (wire drags with SX.dragTo)
    guide(st)       { sel, say } where the guide hand points until the task is done
  When the task is done the step calls SX.done(st, 'Well done!'); the Next arrow lights up.
  st (= S.sx) keeps st.data for the whole story (choices carry on: the table chosen, the food ordered).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, award, track, render, go, dots } = A;
  const LP = window.LP;
  const W = 1114;
  const H = 570;

  // the old page-by-page stories are replaced by the interactive ones in story-*.js
  D.STORIES.splice(0, D.STORIES.length);

  // ---------------------------------------------------------------- helpers for story files
  const val = (v, st) => (typeof v === 'function' ? v(st) : v);
  const SX = {
    W, H, LP, val,
    bg: {},
    prop: {},
    ART: {},
    person: (o) => A.person(o),
    story(def) {
      const i = D.STORIES.findIndex((s) => s.id === def.id);
      def.pages = def.steps; // older code counts pages
      if (i >= 0) D.STORIES[i] = def; else D.STORIES.push(def);
    },
    // a thing placed in the scene at x, y (top-left, scene px) with width w and height h
    at(x, y, w, h, inner, o) {
      const op = o || {};
      const style = `left:${Math.round(x)}px;top:${Math.round(y)}px;width:${Math.round(w)}px;height:${Math.round(h)}px;${op.z != null ? `z-index:${op.z};` : ''}${op.style || ''}`;
      const cls = `sx-el ${op.cls || ''} ${op.k ? 'sx-hit' : ''} ${op.drag ? 'sx-drag' : ''} ${op.target ? 'sx-target' : ''}`;
      const data = `${op.k ? ` data-a="sx" data-k="${esc(op.k)}"` : ''}${op.v != null ? ` data-v="${esc(op.v)}"` : ''}${op.id ? ` data-id="${esc(op.id)}"` : ''}`;
      const aria = op.label ? ` aria-label="${esc(op.label)}"` : '';
      const tag = op.k ? 'button' : 'div';
      return `<${tag} class="${cls}" style="${style}"${data}${aria}${op.k || op.label ? '' : ' aria-hidden="true"'}>${inner || ''}</${tag}>`;
    },
    // an inline SVG for a prop drawn in its own coordinates
    svg: (vb, inner, o) => `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="${(o && o.par) || 'xMidYMid meet'}" overflow="visible" aria-hidden="true">${inner}</svg>`,
    lumi(st, o) {
      const op = o || {};
      const look = Object.assign({}, A.lookWith(), st && st.data && st.data.phones ? { head: 'phones' } : {}, op.look || {});
      return L.svg({ look, mood: op.mood || 'happy', size: op.h || 220, wave: !!op.wave, label: 'Lumi' });
    },
    // a speech bubble; x, y = top-left corner area; tail: 'down' | 'left' | 'right'
    bubble(x, y, text, o) {
      const op = o || {};
      const w = op.w || Math.min(320, 48 + text.length * 10);
      return `<div class="sx-bubble ${op.tail || 'down'} ${op.cls || ''}" style="left:${Math.round(x)}px;top:${Math.round(y)}px;width:${w}px;${op.z != null ? `z-index:${op.z};` : ''}">${esc(text)}</div>`;
    },
    done(st, line) {
      if (st.done) return;
      st.done = true;
      st.praise = line || 'Well done!';
      tone(784, 0.25, 0.07);
      setTimeout(() => tone(988, 0.3, 0.07), 140);
      render();
      say(st.praise + ' Tap the arrow.');
    },
    ok: () => { tone(660, 0.15, 0.06); setTimeout(() => tone(880, 0.18, 0.06), 100); },
    nope(el, line) {
      tone(330, 0.2, 0.05);
      if (el) { el.classList.remove('wiggle-once'); void el.offsetWidth; el.classList.add('wiggle-once'); }
      if (line) say(line);
    },
    say: (t) => say(t),
    render: () => render(),
    // a timer for this step only (stops when the step changes or the story closes)
    later(st, fn, ms) {
      const token = st.token;
      return A.later(() => { if (S.sx === st && st.token === token && S.screen === 'story') fn(); }, ms);
    },
    // drag an item onto one of the targets; onDrop(targetEl, itemEl, p) returns true to keep it there
    dragTo(box, item, targetSel, onDrop, o) {
      const els = typeof item === 'string' ? Array.from(box.querySelectorAll(item)) : [item];
      els.forEach((el) => {
        if (!el || el.dataset.wired) return;
        el.dataset.wired = '1';
        A.SG.drag(el, box, {
          start: () => { box.classList.add('sx-dragging'); },
          drop: (p) => {
            box.classList.remove('sx-dragging');
            const pad = (o && o.pad) || 24;
            const t = Array.from(box.querySelectorAll(targetSel)).find((tg) => {
              const r = rectIn(tg, box);
              return p.x > r.x - pad && p.x < r.x + r.w + pad && p.y > r.y - pad && p.y < r.y + r.h + pad;
            });
            if (!t) { if (o && o.miss) o.miss(el); return false; }
            return !!onDrop(t, el, p);
          },
          tap: o && o.tap ? () => o.tap(el) : undefined
        });
      });
    },
    // a talk card: picture words and a speaker; tapping it speaks the sentence (data-k = k)
    talkCard(words, k, o) {
      const op = o || {};
      return `<button class="sx-talk ${op.said ? 'said' : ''}" data-a="sx" data-k="${k}" style="${op.style || ''}" aria-label="Say: ${esc(words.map((w) => w.t).join(' '))}">
        ${words.map((w) => `<span class="sx-talk-w">${w.art || ''}<b>${esc(w.t)}</b></span>`).join('')}<span class="sx-talk-say">${ic('speaker', 34)}</span></button>`;
    },
    // big picture choices inside the scene (data-k = k, data-v = index)
    choices(list, k, o) {
      const op = o || {};
      return `<div class="sx-choices ${op.cls || ''}" style="${op.style || ''}">${list.map((c, i) => `<button class="sx-choice ${op.on === i ? 'on' : ''} ${c.off ? 'off' : ''}" data-a="sx" data-k="${k}" data-v="${i}">${c.art ? `<span class="sx-ch-art">${c.art}</span>` : ''}<span>${esc(c.label)}</span>${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</button>`).join('')}</div>`;
    },
    money: (n) => (Math.round(n * 100) % 100 ? `$${n.toFixed(2)}` : `$${Math.round(n)}`),
    // a Learn with Lumi lesson: a story that teaches an everyday task (def.tut = the D.LEARN id it replaces).
    // Lessons are not on the Stories shelf; they open from Learn, and end with "Try it for real".
    lesson(def) {
      def.learn = true;
      def.id = def.id || 'learn-' + def.tut;
      const t = D.LEARN.find((x) => x.id === def.tut);
      if (t) { def.title = def.title || t.name; def.icon = def.icon || t.icon; def.tint = def.tint || t.tint; def.ages = def.ages || t.ages; }
      SX.story(def);
    },
    // scrub: drag a tool (or a finger, with no tool) over an area until it is clean / brushed / soapy.
    // o: { area: selector, need: px of rubbing, progress(frac, box), full(), drop: true keeps the tool where it is }
    scrub(box, tool, o) {
      const el = typeof tool === 'string' ? box.querySelector(tool) : tool;
      if (!el || el.dataset.wired) return;
      el.dataset.wired = '1';
      const st = S.sx;
      st.s.rub = st.s.rub || 0;
      const need = o.need || 700;
      let toldFull = false;
      A.SG.drag(el, box, {
        noMove: !!o.noMove,
        start: () => box.classList.add('sx-dragging'),
        move(p, dx, dy) {
          const areas = Array.from(box.querySelectorAll(o.area));
          const hit = areas.some((a) => { const r = rectIn(a, box); return p.x > r.x - 20 && p.x < r.x + r.w + 20 && p.y > r.y - 20 && p.y < r.y + r.h + 20; });
          if (!hit || st.s.full) return;
          st.s.rub += Math.hypot(dx, dy);
          const f = Math.min(1, st.s.rub / need);
          if (o.progress) o.progress(f, box);
          if (Math.floor(st.s.rub / 140) !== Math.floor((st.s.rub - Math.hypot(dx, dy)) / 140)) tone(520 + f * 300, 0.06, 0.03);
          if (f >= 1 && !toldFull) { toldFull = true; st.s.full = true; if (o.full) o.full(); }
        },
        drop() {
          box.classList.remove('sx-dragging');
          if (st.s.full) { if (o.done) o.done(); return !!o.keep; }
          if (st.s.rub > 30 && !S.tapMoving) SX.say(o.more || 'Keep going. Rub a little more.');
          return false;
        }
      });
    }
  };
  // where an element sits inside the scene box (in scene px, whatever the screen scale)
  function rectIn(el, box) {
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = box.offsetWidth / (b.width || 1);
    return { x: (r.left - b.left) * k, y: (r.top - b.top) * k, w: r.width * k, h: r.height * k };
  }
  SX.rectIn = rectIn;
  A.SX = SX;

  // ---------------------------------------------------------------- "Show me": a see-through hand does the step
  // Uses the step's demo(st) or guide(st): { sel, to (drop target), rub: true, tap: true }. A drag shows a faded
  // copy of the thing travelling to where it goes. Nothing really changes: the child still does it after.
  SX.demo = (st) => {
    const box = A.stage.querySelector('.sx-scene');
    const step = st && storyNow() && stepNow();
    if (!box || !step || st.done) return false;
    const g = (step.demo && step.demo(st)) || (step.guide && step.guide(st));
    if (!g) return false;
    const el = box.querySelector(g.sel);
    if (!el) { A.hintNow(); return false; }
    box.querySelectorAll('.sx-ghost, .sx-ghost-item').forEach((x) => x.remove());
    let to = g.to ? box.querySelector(g.to) : null;
    if (!to && !g.rub && !g.tap && el.dataset.wired) to = Array.from(box.querySelectorAll('.sx-target')).find((t) => !t.contains(el)) || null;
    const a = rectIn(el, box);
    const from = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    const hand = document.createElement('div');
    hand.className = 'sx-ghost';
    hand.innerHTML = ic('hand', 84);
    box.appendChild(hand);
    const at = (p, s) => `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) scale(${s || 1})`;
    let frames;
    let dur;
    if (to) {
      const b = rectIn(to, box);
      const end = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      const copy = el.cloneNode(true);
      [copy, ...copy.querySelectorAll('[data-a],[data-k],[data-id],[data-v]')].forEach((e) => { ['data-a', 'data-k', 'data-id', 'data-v', 'data-wired'].forEach((a) => e.removeAttribute(a)); });
      copy.className = 'sx-ghost-item';
      copy.style.cssText = `left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${a.h}px;`;
      box.appendChild(copy);
      const d = { x: end.x - from.x, y: end.y - from.y };
      copy.animate([{ transform: 'translate(0,0)', opacity: 0 }, { transform: 'translate(0,0)', opacity: 0.75, offset: 0.2 }, { transform: `translate(${d.x}px, ${d.y}px)`, opacity: 0.75, offset: 0.8 }, { transform: `translate(${d.x}px, ${d.y}px)`, opacity: 0 }], { duration: 2600, easing: 'ease-in-out' }).onfinish = () => copy.remove();
      frames = [{ transform: at(from, 1.15), opacity: 0 }, { transform: at(from), opacity: 1, offset: 0.2 }, { transform: at(end), opacity: 1, offset: 0.8 }, { transform: at(end), opacity: 0 }];
      dur = 2600;
    } else if (g.rub) {
      const w = Math.min(90, a.w / 2);
      frames = [{ transform: at(from), opacity: 0 }, { transform: at(from), opacity: 1, offset: 0.1 }];
      for (let i = 0; i < 6; i++) frames.push({ transform: at({ x: from.x + (i % 2 ? -w : w), y: from.y + (i % 3 - 1) * 12 }), opacity: 1, offset: 0.15 + i * 0.12 });
      frames.push({ transform: at(from), opacity: 0 });
      dur = 2800;
    } else {
      frames = [{ transform: at(from), opacity: 0 }, { transform: at(from), opacity: 1, offset: 0.2 }, { transform: at(from, 0.85), opacity: 1, offset: 0.35 }, { transform: at(from), opacity: 1, offset: 0.5 }, { transform: at(from, 0.85), opacity: 1, offset: 0.65 }, { transform: at(from), opacity: 0 }];
      dur = 2000;
    }
    hand.animate(frames, { duration: dur, easing: 'ease-in-out' }).onfinish = () => hand.remove();
    return true;
  };

  // ---------------------------------------------------------------- shared props (shaded, not flat)
  const vol = LP.vol;
  SX.prop.tissuePack = (w) => (window.lumiPic ? window.lumiPic('tissuepack', w || '100%') : '');
  SX.prop.headphones = () => `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">${LP.drop(24, 44, 16, 3)}<path d="M10 28c0-12 6-20 14-20s14 8 14 20" fill="none" stroke="#3E5463" stroke-width="5" stroke-linecap="round"/>${vol('<rect x="5" y="25" width="11" height="16" rx="5"/><rect x="32" y="25" width="11" height="16" rx="5"/>', '#7E64C8')}</svg>`;
  SX.prop.coin = (amt) => {
    const gold = amt >= 1;
    const r = amt >= 1 ? 22 : amt >= 0.5 ? 21 : 17;
    return `<svg viewBox="0 0 50 50" width="100%" height="100%" aria-hidden="true">${LP.drop(25, 46, 18, 4)}${vol(`<circle cx="25" cy="24" r="${r}"/>`, gold ? '#E8B83A' : '#C9D1D9')}<circle cx="25" cy="24" r="${r - 5}" fill="none" stroke="${gold ? '#B98A1E' : '#8A97A6'}" stroke-opacity=".6" stroke-width="1.6"/>
      <text x="25" y="${amt >= 1 ? 31 : 30}" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${amt >= 1 ? 18 : 15}" fill="${gold ? '#7A5A10' : '#4A5563'}">${amt >= 1 ? '$' + amt : Math.round(amt * 100) + '¢'}</text></svg>`;
  };
  SX.prop.note = (amt) => {
    const c = { 2: '#B48AD9', 5: '#7FB069', 10: '#E58BA6', 50: '#5B8FD9' }[amt] || '#7FB069';
    return `<svg viewBox="0 0 120 60" width="100%" height="100%" aria-hidden="true">${LP.drop(60, 57, 54, 4)}${vol('<rect x="4" y="4" width="112" height="50" rx="5"/>', c, { shade: 'v' })}<rect x="10" y="10" width="100" height="38" rx="3" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
      <circle cx="38" cy="29" r="13" fill="#fff" opacity=".35"/><text x="86" y="38" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="24" fill="#fff">$${amt}</text></svg>`;
  };
  SX.prop.card = () => `<svg viewBox="0 0 90 60" width="100%" height="100%" aria-hidden="true">${LP.drop(45, 57, 40, 3)}${vol('<rect x="3" y="4" width="84" height="52" rx="7"/>', '#4A78A8', { shade: 'v' })}<rect x="3" y="16" width="84" height="9" fill="#2B4A7A"/>${vol('<rect x="12" y="32" width="16" height="12" rx="2"/>', '#F4D35E', { lineOpacity: 0.3 })}<path d="M58 40h20" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/></svg>`;
  SX.prop.phone = (screen) => `<svg viewBox="0 0 50 90" width="100%" height="100%" aria-hidden="true">${LP.drop(25, 87, 20, 3)}${vol('<rect x="4" y="3" width="42" height="82" rx="9"/>', '#2B2F4A', { shade: 'h' })}<rect x="8" y="10" width="34" height="66" rx="4" fill="${screen || '#8EC5F2'}"/><rect x="8" y="10" width="34" height="66" rx="4" fill="url(#lpGlass)"/></svg>`;
  SX.prop.reader = (lit) => `<svg viewBox="0 0 80 110" width="100%" height="100%" aria-hidden="true">${LP.drop(40, 106, 34, 4)}${vol('<rect x="8" y="6" width="64" height="96" rx="12"/>', '#3E4A5A', { shade: 'h' })}<rect x="16" y="16" width="48" height="30" rx="4" fill="${lit ? '#7FD18A' : '#9FC3DC'}"/><rect x="16" y="16" width="48" height="30" rx="4" fill="url(#lpGlass)"/>
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${18 + c * 16}" y="${56 + r * 13}" width="12" height="9" rx="2" fill="#C9D1D9"/>`).join('')).join('')}${lit ? '<path d="M30 31l7 7 14-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M30 30 q10 -10 20 0 M34 34 q6 -6 12 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'}</svg>`;
  SX.prop.qr = () => `<svg viewBox="0 0 80 100" width="100%" height="100%" aria-hidden="true">${LP.drop(40, 97, 32, 3)}${vol('<rect x="6" y="4" width="68" height="88" rx="8"/>', '#C2577A', { shade: 'v' })}<rect x="14" y="22" width="52" height="52" rx="3" fill="#fff"/>
    ${[[18, 26], [52, 26], [18, 60]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="10" fill="none" stroke="#2B2F4A" stroke-width="3"/>`).join('')}${[[34, 28], [40, 36], [32, 44], [46, 46], [54, 52], [38, 56], [48, 62], [58, 64], [30, 52]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="5" fill="#2B2F4A"/>`).join('')}
    <text x="40" y="16" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="10" fill="#fff">SCAN TO PAY</text></svg>`;
  SX.prop.tray = (inner) => `<svg viewBox="0 0 220 120" width="100%" height="100%" overflow="visible" aria-hidden="true">${LP.drop(110, 110, 100, 9)}${vol('<path d="M8 70h204l-12 30H20z"/>', '#6E9CC4')}${vol('<path d="M8 64h204v10H8z"/>', '#8EB8DC', { lineOpacity: 0.35 })}${inner || ''}</svg>`;
  SX.prop.stool = (c) => `<svg viewBox="0 0 60 70" width="100%" height="100%" aria-hidden="true">${LP.drop(30, 66, 26, 4)}<path d="M30 30v34" stroke="#9AA6B2" stroke-width="6"/>${vol('<ellipse cx="30" cy="26" rx="26" ry="11"/>', c || '#C9B9EA')}</svg>`;
  // a round marble hawker table with two stools; o.inner draws things on top (in table coordinates)
  SX.prop.hawkerTable = (o) => {
    const op = o || {};
    return `<svg viewBox="0 0 260 170" width="100%" height="100%" overflow="visible" aria-hidden="true">${LP.drop(130, 160, 120, 12)}
      ${[[20, 132], [240, 132]].map(([x, y]) => `<path d="M${x} ${y - 20}v26" stroke="#9AA6B2" stroke-width="7"/>${vol(`<ellipse cx="${x}" cy="${y - 22}" rx="22" ry="9"/>`, op.stool || '#B9A6E0')}`).join('')}
      <path d="M130 70v84" stroke="url(#lpMetal)" stroke-width="16"/><path d="M96 156h68" stroke="#8A97A6" stroke-width="8" stroke-linecap="round"/>
      <path d="M12 66 q118 46 236 0 v9 q-118 46 -236 0z" fill="#C9D1D9"/>
      ${vol('<ellipse cx="130" cy="64" rx="118" ry="38"/>', '#F2F4F6')}<ellipse cx="130" cy="64" rx="118" ry="38" fill="url(#lpMarble)" opacity=".7"/><path d="M60 58 q30 -10 60 4 M150 70 q30 6 52 -6" stroke="#D5DBE1" stroke-width="2" fill="none"/>
      ${op.inner || ''}</svg>`;
  };
  SX.prop.sign = (text, colour, o) => {
    const op = o || {};
    const w = op.w || 220;
    return `<svg viewBox="0 0 ${w} 56" width="100%" height="100%" aria-hidden="true">${vol(`<rect x="3" y="3" width="${w - 6}" height="50" rx="10"/>`, colour, { shade: 'v' })}<text x="${w / 2}" y="37" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${op.size || 24}" fill="${op.ink || '#fff'}" letter-spacing="1">${esc(text)}</text></svg>`;
  };
  SX.prop.plant = () => `<svg viewBox="0 0 80 120" width="100%" height="100%" aria-hidden="true">${LP.drop(40, 116, 30, 4)}${vol('<path d="M40 70c-30-4-38-34-26-52 10 16 22 24 26 52zM40 70c30-4 38-34 26-52-10 16-22 24-26 52zM40 72c-4-30 0-50 0-66 10 18 10 40 0 66z"/>', '#7BC67E')}${vol('<path d="M18 74h44l-6 40H24z"/>', '#E07A5F')}</svg>`;
  SX.prop.fan = () => `<svg viewBox="0 0 120 60" width="100%" height="100%" aria-hidden="true"><path d="M60 0v20" stroke="#9AA6B2" stroke-width="4"/>${vol('<ellipse cx="60" cy="24" rx="10" ry="6"/>', '#C9D1D9')}${vol('<path d="M60 24 L8 30 q-4 -6 4 -10z M60 24 L112 30 q4 -6 -4 -10z"/>', '#E3E8ED', { lineOpacity: 0.35 })}</svg>`;
  SX.prop.chair = (c) => `<svg viewBox="0 0 120 160" width="100%" height="100%" aria-hidden="true">${LP.drop(60, 154, 52, 6)}<path d="M24 96v54M96 96v54" stroke="#8A6A4A" stroke-width="8" stroke-linecap="round"/>${vol('<rect x="20" y="10" width="80" height="80" rx="16"/>', c || '#4FB3A9')}${vol('<rect x="10" y="84" width="100" height="22" rx="10"/>', c || '#4FB3A9')}</svg>`;
  SX.prop.clock = () => `<svg viewBox="0 0 80 80" width="100%" height="100%" aria-hidden="true">${vol('<circle cx="40" cy="40" r="34"/>', '#FFFFFF')}<circle cx="40" cy="40" r="28" fill="none" stroke="#E6DCCB" stroke-width="2"/><path d="M40 40V20M40 40l14 8" stroke="${LP.INK}" stroke-width="4" stroke-linecap="round"/></svg>`;
  SX.prop.food = (id, w, h) => (A.foodSvg ? A.foodSvg(id, w, h) : '');
  // shared art for "what could help?" choices
  SX.ART.headphones = SX.prop.headphones();
  SX.ART.breathe = ic('kCalm', 64);
  SX.ART.squeeze = ic('kSqueeze', 64);
  SX.ART.breakCard = ic('kBreak', 64);
  SX.ART.talk = ic('kTalk', 64);
  SX.ART.wait = ic('hourglass', 64);
  SX.ART.music = ic('music', 64);
  SX.ART.ask = ic('help', 64);
  SX.ART.quiet = ic('quiet', 64);
  SX.ART.hug = ic('hug', 64);
  SX.ART.next = ic('wNext', 64);

  // ---------------------------------------------------------------- ready-made steps
  // "What could help?": the child picks a way to cope, and it really happens (headphones go on Lumi)
  // "What could help Lumi?": the child picks an idea, then does it for Lumi (gives it to him, puts the
  // headphones on his head, or breathes slowly with him), and then Lumi asks what helps the child.
  // What the child says helps them is kept for the grown-ups (Grown-ups > Progress).
  const breathText = (st) => (st.s.breath === 'in' ? 'Breathe in...' : st.s.breath === 'out' ? 'And out...' : 'Tap to breathe with Lumi');
  SX.copeStep = (o) => ({
    id: o.id || 'cope',
    bg: o.bg,
    text: (st) => {
      if (st.done) return val(o.text, st);
      const opt = st.s.pick != null ? o.options[st.s.pick] : null;
      if (opt && opt.breathe) return 'Let’s breathe slowly with Lumi. In through your nose, out through your mouth.';
      if (opt) return `Good idea: ${opt.label.toLowerCase()}. Give it to Lumi.`;
      return val(o.text, st);
    },
    task: (st) => {
      const opt = st.s.pick != null ? o.options[st.s.pick] : null;
      if (opt && opt.breathe) return `Tap the circle and breathe with Lumi (${Math.min(2, st.s.breaths || 0)} of 2).`;
      if (opt) return `Drag it to Lumi.`;
      return o.task || 'What could help Lumi? Tap one.';
    },
    lumi: o.lumi || ((st) => ({ x: 300, y: 540, h: 240, mood: st.done ? 'calm' : 'worried' })),
    draw(st) {
      const opt = st.s.pick != null ? o.options[st.s.pick] : null;
      let h = o.draw ? o.draw(st) : '';
      if (!opt || st.done) h += SX.choices(o.options, 'cope', { on: st.s.pick, style: 'right:24px;top:24px;', cls: 'col' });
      if (opt && !st.done && !opt.breathe) h += SX.at(900, 40, 180, 180, `<div class="sx-give">${opt.art || ''}<b>${esc(opt.label)}</b></div>`, { cls: 'sx-drag sx-give-it', label: opt.label, z: 9 });
      if (opt && opt.breathe && !st.done) h += SX.at(560, 150, 260, 260, `<span class="sx-bcirc"></span><b>${breathText(st)}</b>`, { k: 'breathe', cls: `sx-breathe-btn ${st.s.breath || ''}`, label: 'Breathe with Lumi', z: 9 });
      if (st.done && opt) h += SX.bubble(330, 120, opt.reply, { tail: 'left', w: 300 });
      if (st.done) h += mineBar(o, st);
      if (opt && opt.breathe && (st.s.breath || st.done)) h += '<div class="sx-breath" style="left:190px;top:270px"></div>';
      return h;
    },
    tap(st, k, el, d) {
      if (k === 'cope' && !st.done) {
        const i = Number(d.v);
        st.s.pick = i;
        st.s.breaths = 0;
        SX.ok();
        SX.render();
        const opt = o.options[i];
        say(opt.breathe ? 'Let’s breathe with Lumi. Tap the circle.' : `Good idea. Drag it to Lumi.`);
        return;
      }
      if (k === 'breathe' && !st.s.breath && !st.done) {
        // one slow breath: in for 3 seconds, out for 3 seconds; the child breathes along
        st.s.breath = 'in';
        tone(392, 0.5, 0.04);
        SX.render();
        SX.later(st, () => { st.s.breath = 'out'; tone(330, 0.6, 0.04); SX.render(); }, 3000);
        SX.later(st, () => {
          st.s.breath = null;
          st.s.breaths = (st.s.breaths || 0) + 1;
          if (st.s.breaths >= 2) { const opt = o.options[st.s.pick]; SX.done(st, opt.reply); return; }
          SX.render();
          say('Good. One more slow breath. Tap the circle.');
        }, 6000);
        return;
      }
      if (k === 'mine') {
        const opt = o.options[Number(d.v)];
        const kid = state.childName || 'you';
        st.s.mine = Number(d.v);
        state.myHelps = state.myHelps || {};
        state.myHelps[opt.label] = (state.myHelps[opt.label] || 0) + 1;
        save();
        track('myHelps', opt.label, { quiet: true });
        SX.ok();
        SX.render();
        say(`Good to know. ${opt.label} helps ${kid} too. I’ll remember that.`);
      }
    },
    after(st, box) {
      const opt = st.s.pick != null ? o.options[st.s.pick] : null;
      if (o.after) o.after(st, box);
      const lumiEl = box.querySelector('.sx-lumi');
      if (lumiEl) lumiEl.classList.toggle('breathe-in', st.s.breath === 'in');
      if (!opt || st.done || opt.breathe) return;
      SX.dragTo(box, '.sx-give-it', '.sx-lumi', () => {
        if (opt.apply) opt.apply(st);
        SX.done(st, opt.reply);
        return false;
      }, { pad: 40, miss: () => say('Drag it all the way to Lumi.'), tap: () => say('Drag it to Lumi.') });
    },
    guide: (st) => {
      const opt = st.s.pick != null ? o.options[st.s.pick] : null;
      if (opt && opt.breathe) return { sel: '.sx-breathe-btn', say: 'Tap the circle and breathe with Lumi.' };
      if (opt) return { sel: '.sx-give-it', say: 'Drag it to Lumi.', to: '.sx-lumi' };
      return { sel: '.sx-choice', say: o.task || 'What could help Lumi?' };
    },
    // "Do it with me": Lumi picks the first idea with the child
    auto(st) {
      const opt = o.options[0];
      st.s.pick = 0;
      if (opt.apply) opt.apply(st);
      st.s.breathing = !!opt.breathe;
      SX.done(st, opt.reply);
    }
  });
  // after helping Lumi: "And you? What helps you?" (the same ideas, small; optional)
  function mineBar(o, st) {
    return `<div class="sx-mine"><span class="sx-mine-q">${ic('person', 22)}<span>And you? What helps you?</span></span><div class="sx-mine-row">${o.options.map((c, i) => `<button class="sx-mine-b ${st.s.mine === i ? 'on' : ''}" data-a="sx" data-k="mine" data-v="${i}">${c.art ? `<span class="sx-mine-art">${c.art}</span>` : ''}<span>${esc(c.label)}</span></button>`).join('')}</div></div>`;
  }
  SX.HEADPHONES = { label: 'Wear headphones', art: SX.ART.headphones, reply: 'Headphones make the noise softer.', apply: (st) => { st.data.phones = true; } };
  SX.BREATHE = { label: 'Take slow breaths', art: SX.ART.breathe, reply: 'Breathe in, and out. Slowly. Lumi feels calmer.', breathe: true };

  // paying: the child picks cash, card or phone, then is guided through it
  // o: { id, bg, price (number or fn), text, lumi, draw (the cashier and counter), counter: {x,y,w,h}, wallet, doneText }
  SX.payStep = (o) => ({
    id: o.id || 'pay',
    bg: o.bg,
    text: (st) => (st.s.method ? o.textPaying || `${st.s.method === 'cash' ? 'Lumi pays with cash.' : st.s.method === 'card' ? 'Lumi pays with a card.' : 'Lumi pays with the phone.'}` : val(o.text, st) || `That is ${SX.money(val(o.price, st))}. How will Lumi pay?`),
    task: (st) => {
      const m = st.s.method;
      if (!m) return 'Choose how to pay.';
      if (m === 'cash') return st.s.paid >= val(o.price, st) ? 'Take your change.' : `Drag money onto the counter until it makes ${SX.money(val(o.price, st))}.`;
      if (m === 'card') return 'Drag the card to the card reader.';
      return 'Drag the phone to the QR code to scan it.';
    },
    lumi: o.lumi || { x: 230, y: 540, h: 210 },
    enter(st) { st.s.paid = 0; st.s.coins = []; },
    draw(st) {
      const price = val(o.price, st);
      let h = o.draw ? o.draw(st) : '';
      const cx = o.counter || { x: 420, y: 300, w: 300, h: 120 };
      h += SX.at(cx.x, cx.y, cx.w, cx.h, `<div class="sx-counter-pad"><b>${SX.money(price)}</b><span>${st.s.method === 'cash' ? `Given ${SX.money(st.s.paid)}` : 'to pay'}</span></div>`, { target: true, cls: 'sx-pay-drop', id: 'counter', z: 2 });
      if (!st.s.method) {
        h += SX.choices([{ label: 'Cash', art: SX.prop.note(5) }, { label: 'Card', art: SX.prop.card() }, { label: 'Phone (scan QR)', art: SX.prop.phone() }], 'payhow', { style: 'right:24px;top:24px;', cls: 'col pay' });
        return h;
      }
      if (st.s.method === 'cash') {
        const wallet = o.wallet || [10, 5, 2, 1, 0.5];
        if (st.s.paid < price) h += `<div class="sx-wallet"><span class="sx-wallet-label">${ic('kHeart', 20)}Lumi's money</span>${wallet.map((a) => `<span class="sx-money ${a >= 2 ? 'note' : 'coin'}" data-amt="${a}" role="img" aria-label="${SX.money(a)}">${a >= 2 ? SX.prop.note(a) : SX.prop.coin(a)}</span>`).join('')}</div>`;
        st.s.coins.forEach((a, i) => { h += SX.at(cx.x + 16 + (i % 3) * 92, cx.y - 64 - Math.floor(i / 3) * 34, a >= 2 ? 90 : 48, a >= 2 ? 46 : 48, a >= 2 ? SX.prop.note(a) : SX.prop.coin(a), { z: 3 }); });
        if (st.s.paid >= price && st.s.change > 0) {
          // the real coins of the change (e.g. 80 cents = 50 + 20 + 10), in one big tap area
          const coins = [];
          let left = Math.round(st.s.change * 100);
          [100, 50, 20, 10].forEach((c) => { while (left >= c && coins.length < 6) { coins.push(c / 100); left -= c; } });
          const w = Math.max(110, coins.length * 46 + 30);
          h += SX.at(cx.x + cx.w / 2 - w / 2, cx.y + cx.h + 6, w, 92, `<span class="sx-change">${coins.map((c) => `<span class="sx-change-coin">${SX.prop.coin(c)}</span>`).join('')}</span>`, { k: 'change', label: `Take the change: ${SX.money(st.s.change)}`, cls: 'sx-glow', z: 4 });
        }
      } else if (st.s.method === 'card') {
        h += SX.at(cx.x + cx.w + 24, cx.y - 60, 84, 116, SX.prop.reader(st.done), { target: true, id: 'reader', cls: 'sx-pay-dev', z: 3 });
        if (!st.done) h += `<span class="sx-money card" style="right:60px;bottom:40px;width:126px;height:84px">${SX.prop.card()}</span>`;
      } else {
        h += SX.at(cx.x + cx.w + 24, cx.y - 70, 84, 106, SX.prop.qr(), { target: true, id: 'qr', cls: 'sx-pay-dev', z: 3 });
        if (!st.done) h += `<span class="sx-money phone" style="right:70px;bottom:24px;width:64px;height:116px">${SX.prop.phone()}</span>`;
        else h += SX.bubble(cx.x + cx.w + 10, cx.y - 130, 'Paid!', { w: 110 });
      }
      return h;
    },
    tap(st, k, el, d) {
      if (k === 'payhow') {
        st.s.method = ['cash', 'card', 'phone'][Number(d.v)];
        SX.ok();
        render();
        say(SX.payLine(st, val(o.price, st)));
        return;
      }
      if (k === 'change') { st.s.change = 0; SX.ok(); SX.done(st, o.doneText || 'Lumi paid and took the change. Say thank you!'); }
    },
    after(st, box) {
      if (!st.s.method || st.done) return;
      const price = val(o.price, st);
      SX.dragTo(box, '.sx-money', st.s.method === 'cash' ? '.sx-pay-drop' : st.s.method === 'card' ? '[data-id="reader"]' : '[data-id="qr"]', (t, el) => {
        if (st.s.method === 'cash') {
          const a = Number(el.dataset.amt);
          if (st.s.paid >= price) return false;
          st.s.paid = Math.round((st.s.paid + a) * 100) / 100;
          st.s.coins.push(a);
          tone(1200, 0.08, 0.05);
          if (st.s.paid >= price) {
            st.s.change = Math.round((st.s.paid - price) * 100) / 100;
            if (st.s.change > 0) { render(); say(`Thank you. Here is ${SX.money(st.s.change)} change. Tap the change to take it.`); } else SX.done(st, o.doneText || 'Exactly right! Lumi paid. Say thank you!');
          } else { render(); say(`${SX.money(st.s.paid)}. A little more.`); }
          return true;
        }
        tone(1568, 0.12, 0.06);
        setTimeout(() => tone(2093, 0.18, 0.06), 140);
        SX.done(st, st.s.method === 'card' ? 'Beep! The card worked. Lumi paid. Say thank you!' : 'Beep! Paid with the phone. Say thank you!');
        return true;
      }, { miss: () => say(st.s.method === 'cash' ? 'Put the money on the counter.' : 'Bring it right up to the machine.') });
    },
    guide(st) {
      if (!st.s.method) return { sel: '.sx-choice', say: 'Choose how to pay.' };
      if (st.s.method === 'cash') {
        if (st.s.paid >= val(o.price, st)) return { sel: '[data-k="change"]', say: 'Take your change.' };
        const need = val(o.price, st) - st.s.paid;
        const best = need > 5 ? 10 : need > 2 ? 5 : need > 1 ? 2 : need > 0.5 ? 1 : 0.5;
        return { sel: `.sx-money[data-amt="${best}"]`, say: `Drag the ${SX.money(best)} onto the counter.` };
      }
      return { sel: '.sx-money', to: st.s.method === 'card' ? '[data-id="reader"]' : '[data-id="qr"]', say: st.s.method === 'card' ? 'Drag the card to the reader.' : 'Drag the phone to the QR code.' };
    },
    demo(st) {
      const g = this.guide(st);
      if (st.s.method === 'cash' && st.s.paid < val(o.price, st)) g.to = '.sx-pay-drop';
      if (g.sel === '.sx-choice') g.tap = true;
      return g;
    },
    // "Do it with me": pay together with the card (the quickest way)
    auto(st) {
      st.s.method = st.s.method || 'card';
      if (st.s.method === 'cash') { st.s.paid = val(o.price, st); st.s.change = 0; }
      tone(1568, 0.12, 0.06);
      SX.done(st, st.s.method === 'cash' ? (o.doneText || 'Lumi paid. Say thank you!') : st.s.method === 'card' ? 'Beep! The card worked. Lumi paid. Say thank you!' : 'Beep! Paid with the phone. Say thank you!');
    }
  });
  SX.payLine = (st, price) => (st.s.method === 'cash' ? `Cash. Drag money onto the counter. You need ${SX.money(price)}.` : st.s.method === 'card' ? 'Card. Drag the card to the card reader, and wait for the beep.' : 'Phone. Drag the phone to the QR code to scan it.');

  // ---------------------------------------------------------------- the stories shelf
  const coverOf = (s) => {
    const first = s.steps[0];
    const st = { data: {}, s: {}, done: false };
    let bg = '';
    try { bg = typeof first.bg === 'function' ? first.bg(st) : SX.bg[first.bg] ? SX.bg[first.bg](st) : ''; } catch (e) { bg = ''; }
    return `<svg class="story-cover-bg" viewBox="${s.coverView || `0 0 ${W} ${H}`}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg}</svg>`;
  };
  A.storyCover = coverOf;
  A.PARENT.stories = 'fun';
  A.VOICE.stories = () => 'Pick a story to play with Lumi.';
  A.SCREENS.stories = () => {
    const cards = A.storiesForAge().map((s) => {
      const read = state.stats.storyDone && state.stats.storyDone[s.id];
      return `<button class="story-card sx-card" data-a="stOpen" data-v="${s.id}" style="background:${s.tint}">
        <span class="story-cover">${coverOf(s)}<span class="cover-lumi">${L.svg({ look: A.lookWith(), mood: 'happy', size: 84 })}</span></span>
        <span class="story-name">${esc(s.title)}</span>
        ${read ? `<span class="tag green">${ic('check', 14)}<span>Played</span></span>` : `<span class="tag">${s.steps.length} steps</span>`}</button>`;
    }).join('');
    return `
<section class="screen" aria-label="Stories">
  ${A.srTitle('Story adventures')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.backBtn()}${A.speakBtn('Pick a story to play with Lumi.')}<span class="game-chip" style="background:#F2D2E4;color:#A8457A">${ic('kStories', 34)}<span>Stories</span></span></div>
    <span></span>
  </div>
  <div class="story-grid grow">${cards}</div>
</section>`;
  };
  A.GUIDE.stories = () => ({ sel: '.story-card', say: 'Tap a story.', delay: state.settings.guideDelay * 1000 + 3000 });

  // ---------------------------------------------------------------- playing a story
  const storyNow = () => D.STORIES.find((s) => s.id === S.sx.id);
  const stepNow = () => storyNow().steps[S.sx.i];
  function voice() {
    const st = S.sx;
    const step = stepNow();
    const text = val(step.text, st) || '';
    if (st.done) return `${st.praise || ''} Tap the arrow.`.trim();
    const task = val(step.task, st);
    return task ? `${text} ${task}` : text;
  }
  function lumiSpot(st) {
    const l = val(stepNow().lumi, st);
    return l ? Object.assign({ x: 220, y: 540, h: 220 }, l) : null;
  }
  const fromDay = () => !!(S.storyDay && S.day && S.day.i === S.storyDay.i && S.history.includes('routine'));
  A.PARENT.story = 'stories';
  A.VOICE.story = () => (S.sx ? (S.sx.ended ? (storyNow().learn ? 'You did it! Now you can try it for real.' : fromDay() ?'You did it! Well done. Tap the button to go back to your day.' : 'You did it! Well done.') : voice()) : '');
  A.SCREENS.story = () => {
    const s = storyNow();
    const st = S.sx;
    if (st.ended && s.learn) {
      // a lesson ends with the real thing: do it for real, Lumi cheers (a grown-up can confirm)
      const real = st.real;
      return `<section class="screen" aria-label="You did it">
        <div class="row between" style="height:60px">${A.backBtn()}<span></span></div>
        <div class="panel story-end learn-end grow">
          <div class="le-left">
            <div class="hop">${SX.lumi(st, { mood: 'excited', h: 210, wave: true })}</div>
            <div class="end-title">${ic('star', 44)}<span>You did it!</span>${ic('star', 44)}</div>
            <div class="end-sub">${esc(s.title)}</div>
          </div>
          <div class="le-real ${real ? 'did' : ''}">
            <span class="le-real-art">${ic(s.icon || 'star', 110)}</span>
            <b>${real ? 'Super! You did it for real.' : 'Now try it for real!'}</b>
            <span>${esc(real ? 'Lumi is so proud of you.' : s.realText || 'Next time, Lumi will be with you. Go slowly, one step at a time.')}</span>
            ${real ? `<span class="tag green">${ic('check', 16)}<span>Done for real</span></span>` : `<button class="primary" data-a="stReal" style="height:76px">${ic('thumb', 32)}<span>I did it for real!</span></button>`}
          </div>
          <div class="row gap16 le-btns">
            <button class="primary soft-btn" data-a="stAgain" style="height:76px">${ic('restart', 32)}<span>Practise again</span></button>
            <button class="primary ${real ? '' : 'soft-btn'}" data-a="nav" data-to="learn" style="height:76px">${ic('kLearn', 34)}<span>More to learn</span></button>
          </div>
        </div>
      </section>`;
    }
    if (st.ended) {
      return `<section class="screen" aria-label="You did it">
        <div class="row between" style="height:60px">${A.backBtn()}<span></span></div>
        <div class="panel story-end grow">
          <div class="hop">${SX.lumi(st, { mood: 'excited', h: 230, wave: true })}</div>
          <div class="end-title">${ic('star', 48)}<span>You did it!</span>${ic('star', 48)}</div>
          <div class="end-sub">${esc(s.title)}</div>
          ${fromDay() ? `<div class="row gap16">
            <button class="primary soft-btn" data-a="stAgain" style="height:84px">${ic('restart', 34)}<span>Play again</span></button>
            <button class="primary" data-a="stDayDone" style="height:84px">${ic('kDay', 40)}<span>Back to My day</span></button>
          </div>` : `<div class="row gap16">
            <button class="primary" data-a="stAgain" style="height:84px">${ic('restart', 34)}<span>Play again</span></button>
            <button class="primary soft-btn" data-a="nav" data-to="stories" style="height:84px">${ic('kStories', 34)}<span>More stories</span></button>
          </div>`}
        </div>
      </section>`;
    }
    const step = stepNow();
    const bg = typeof step.bg === 'function' ? step.bg(st) : SX.bg[step.bg] ? SX.bg[step.bg](st) : '';
    const spot = lumiSpot(st);
    const from = st.lumiAt || spot;
    const lumi = spot ? `<div class="sx-lumi ${spot.flip ? 'flip' : ''} ${spot.cls || ''}" style="left:${Math.round(from.x - from.h / 2)}px;top:${Math.round(from.y - from.h * (244 / 268))}px;width:${from.h}px;height:${from.h}px;z-index:${spot.z != null ? spot.z : 5};">${SX.lumi(st, spot)}</div>` : '';
    const text = val(step.text, st) || '';
    const task = val(step.task, st);
    const ready = st.done || !task;
    const last = st.i === s.steps.length - 1;
    return `
<section class="screen tight sx-screen" aria-label="${esc(s.title)}">
  ${A.srTitle(s.title)}
  <div class="row between" style="height:56px;flex:none">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(voice(), 52)}<span class="game-chip" style="background:${s.tint}">${ic(s.learn ? s.icon || 'kLearn' : 'kStories', 28)}<span>${esc(s.title)}</span></span></div>
    <div class="sx-steps" role="img" aria-label="Step ${st.i + 1} of ${s.steps.length}">${dots(st.i + 1, s.steps.length, '#A8457A', 15)}</div>
  </div>
  <div class="sx-scene sx-${esc(step.id || 'step')}" style="width:${W}px;height:${H}px">
    <svg class="sx-bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg}</svg>
    ${lumi}
    <div class="sx-layer">${step.draw ? step.draw(st) : ''}</div>
  </div>
  <div class="sx-bar">
    <button class="st-nav prev" data-a="stPrev" aria-label="Back a step" ${st.i === 0 ? 'disabled' : ''}>${ic('back', 38)}</button>
    <div class="sx-words">
      <p class="sx-text">${esc(text)}</p>
      ${st.done ? `<span class="sx-praise">${ic('check', 26)}<span>${esc(st.praise)}</span></span>` : task ? `<span class="sx-task">${ic('hand', 30)}<span>${esc(task)}</span></span>` : ''}
    </div>
    ${!st.done && task ? (st.s.shown && step.auto
      ? `<button class="sx-help together" data-a="stTogether" aria-label="Do it with me">${ic('kDuo', 40)}<span>Do it with me</span></button>`
      : `<button class="sx-help" data-a="stShow" aria-label="Show me">${ic('eye', 38)}<span>Show me</span></button>`) : ''}
    <button class="st-nav next ${ready ? 'ready' : 'faded'}" data-a="stNext" aria-label="${last ? 'Finish' : 'Next step'}">${last ? ic('star', 40) : ic('arrow', 42)}</button>
  </div>
</section>`;
  };
  // Fit the scene to the screen's shape. The scene is drawn at W x H; it is scaled (never squashed) to use the
  // space: on a tall or tablet-shaped screen the words sit under the picture, and on a wide screen (a phone held
  // sideways, a laptop) the picture grows to the full height and the words move to a column beside it.
  function fitScene() {
    const scr = A.stage.querySelector('.sx-screen');
    const box = scr && scr.querySelector(':scope > .sx-scene');
    const bar = scr && scr.querySelector(':scope > .sx-bar');
    if (!box || !bar) return;
    const SW = A.stageW || 1194, SH = A.stageH || 834;
    const PAD_X = 80, PAD_Y = 56, HEAD = 56, GAP = 16, BAR = 108, COL = 300;
    const sCol = Math.min((SW - PAD_X) / W, (SH - PAD_Y - HEAD - BAR - 2 * GAP) / H);
    const sRow = Math.min((SW - PAD_X - GAP - COL) / W, (SH - PAD_Y - HEAD - GAP) / H);
    const wide = sRow >= sCol * 0.95;
    const s = Math.min(wide ? sRow : sCol, 1.6);
    scr.classList.toggle('sx-wide', wide);
    box.style.transformOrigin = '0 0';
    box.style.transform = Math.abs(s - 1) < 0.005 ? '' : `scale(${s.toFixed(4)})`;
    box.style.marginRight = `${(W * (s - 1)).toFixed(1)}px`;
    box.style.marginBottom = `${(H * (s - 1)).toFixed(1)}px`;
    bar.style.width = wide ? '' : `${Math.round(W * s)}px`;
    bar.style.height = wide ? `${Math.round(H * s)}px` : '';
  }
  A.fitScene = fitScene;
  const resizeBefore = A.onStageResize;
  A.onStageResize = () => { if (resizeBefore) resizeBefore(); fitScene(); };

  // after each draw: walk Lumi to his new place, then let the step wire its drags
  A.AFTER.story = () => {
    fitScene();
    const st = S.sx;
    if (!st || st.ended) return;
    const box = A.stage.querySelector('.sx-scene');
    if (!box) return;
    const el = box.querySelector('.sx-lumi');
    const spot = lumiSpot(st);
    if (el && spot) {
      const from = st.lumiAt;
      if (from && (from.x !== spot.x || from.y !== spot.y || from.h !== spot.h)) {
        el.classList.add('walking');
        void el.offsetWidth;
        el.style.left = `${Math.round(spot.x - spot.h / 2)}px`;
        el.style.top = `${Math.round(spot.y - spot.h * (244 / 268))}px`;
        el.style.width = el.style.height = `${spot.h}px`;
        setTimeout(() => el.classList.remove('walking'), 950);
      }
      st.lumiAt = { x: spot.x, y: spot.y, h: spot.h };
    }
    const step = stepNow();
    if (step.after) step.after(st, box);
  };
  A.GUIDE.story = () => {
    const st = S.sx;
    if (!st) return null;
    if (st.ended && storyNow().learn) return st.real ? { sel: '[data-a="nav"][data-to="learn"]', say: 'Tap More to learn.', delay: 12000 } : { sel: '[data-a="stReal"]', say: 'When you do it for real, tap I did it for real.', delay: 9000 };
    if (st.ended) return fromDay() ? { sel: '[data-a="stDayDone"]', say: 'Back to My day.' } : { sel: '[data-a="nav"][data-to="stories"]', say: 'Pick another story.', delay: 12000 };
    const step = stepNow();
    if (st.done || !val(step.task, st)) return { sel: '[data-a="stNext"]', say: 'Tap the arrow.', delay: state.settings.guideDelay * 1000 + 3000 };
    const g = step.guide ? step.guide(st) : null;
    // in lessons Lumi shows the step first, so the hint hand waits until well after that
    const extra = storyNow().learn && state.settings.watchFirst !== false && !st.s.hinted ? 6000 : 2000;
    return g ? Object.assign({ delay: state.settings.guideDelay * 1000 + extra }, g) : null;
  };

  function openStep(n) {
    const st = S.sx;
    st.i = n;
    st.s = {};
    st.done = false;
    st.praise = '';
    st.token = (st.token || 0) + 1;
    const step = stepNow();
    if (step.enter) step.enter(st);
    tone(520, 0.12, 0.05);
    render();
    say(voice());
    watchFirst(st);
  }
  // in lessons, Lumi shows each new step once before the child tries ("watch me, then you"), unless a
  // grown-up turned it off. Lumi waits for the words to be heard first, so nothing happens at once.
  function watchFirst(st) {
    const s = storyNow();
    const step = stepNow();
    if (!s.learn || state.settings.watchFirst === false || !val(step.task, st) || step.noDemo) return;
    const words = (val(step.text, st) || '').length + (val(step.task, st) || '').length;
    SX.later(st, () => {
      if (st.done || S.paused) return;
      // the child already started (a finger is down, or they moved something): no need to show
      const box = A.stage.querySelector('.sx-scene');
      if (box && (box.classList.contains('sx-dragging') || box.querySelector('.dragging'))) { st.s.shown = true; helpButton(st); return; }
      st.s.shown = true;
      helpButton(st);
      SX.demo(st);
    }, Math.min(5200, 1600 + words * 28));
  }
  // swap "Show me" for "Do it with me" without redrawing the scene (a drag or rub may be going on)
  function helpButton(st) {
    const step = stepNow();
    const b = A.stage.querySelector('.sx-help');
    if (!b || !step.auto || st.done || b.dataset.a === 'stTogether') return;
    b.outerHTML = `<button class="sx-help together" data-a="stTogether" aria-label="Do it with me">${ic('kDuo', 40)}<span>Do it with me</span></button>`;
  }
  SX.next = () => A.ACTIONS.stNext();
  Object.assign(A.ACTIONS, {
    stOpen: (d) => {
      S.sx = { id: d.v, i: 0, data: {}, s: {}, done: false, ended: false, lumiAt: null, token: 1 };
      const step = storyNow().steps[0];
      if (step.enter) step.enter(S.sx);
      go('story');
      watchFirst(S.sx);
    },
    // "Show me": the see-through hand does the step; after that, "Do it with me" (if the step can)
    stShow: () => {
      const st = S.sx;
      const step = stepNow();
      const g = (step.demo && step.demo(st)) || (step.guide && step.guide(st));
      say(storyNow().learn ? `Watch. ${val(step.task, st) || ''}` : (g && g.say) || val(step.task, st) || '');
      // redraw first (the button becomes "Do it with me"), then the hand shows the step on the new drawing
      st.s.shown = true;
      helpButton(st);
      if (!SX.demo(st)) A.hintNow();
      track('hints', 'show-me', { quiet: true });
      return 'keep';
    },
    stTogether: () => {
      const st = S.sx;
      const step = stepNow();
      if (!step.auto || st.done) return 'keep';
      st.s.together = true;
      step.auto(st);
      if (!st.done) SX.done(st, 'We did it together!');
      return undefined;
    },
    stReal: () => {
      const st = S.sx;
      const s = storyNow();
      st.real = true;
      state.stats.realLife = state.stats.realLife || {};
      state.stats.realLife[s.tut] = (state.stats.realLife[s.tut] || 0) + 1;
      track('realLife', s.title);
      award(1);
      save();
      render();
      say(`Super! You ${s.realSay || 'did it for real'}. Lumi is so proud of you.`);
    },
    stNext: () => {
      const st = S.sx;
      const step = stepNow();
      if (!st.done && val(step.task, st)) { say(val(step.task, st)); A.hintNow(); return 'keep'; }
      const s = storyNow();
      if (st.i < s.steps.length - 1) { openStep(st.i + 1); return undefined; }
      st.ended = true;
      st.real = false;
      if (s.learn) {
        state.stats.tutorials += 1;
        state.stats.tutDone[s.tut] = (state.stats.tutDone[s.tut] || 0) + 1;
        save();
        track('tutorials', s.title);
        award(2);
        render();
        say(`You did it! You learned to ${s.title.toLowerCase()} with Lumi. Now you can try it for real.`);
        return undefined;
      }
      state.stats.stories = (state.stats.stories || 0) + 1;
      state.stats.storyDone[s.id] = (state.stats.storyDone[s.id] || 0) + 1;
      save();
      track('stories', s.title);
      award(2);
      render();
      say('You did it! Well done.');
      return undefined;
    },
    stPrev: () => { if (S.sx.i > 0) openStep(S.sx.i - 1); },
    sx: (d, el) => {
      const st = S.sx;
      const step = stepNow();
      if (!st || !step.tap) return 'keep';
      step.tap(st, d.k, el, d);
      return undefined;
    },
    stDayDone: () => {
      S.storyDay = null;
      A.go('routine', '');
      A.completeStep();
    },
    stAgain: () => { S.sx.ended = false; S.sx.real = false; S.sx.data = {}; S.sx.lumiAt = null; openStep(0); }
  });
  A.RESTART.story = () => { Object.assign(S.sx, { ended: false, data: {}, lumiAt: null, i: 0, s: {}, done: false }); };
})();
