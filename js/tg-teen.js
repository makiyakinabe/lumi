/*
  tg-teen.js: two-player games for Teens (13-18). See teamgames.js for the frame and helpers.
  Calm, grown-up games about real life. Each one is played with Lumi (Lumi takes its own turns) or with
  a grown-up, sibling or friend on the same tablet.
  - Plan our outing      take turns choosing where, how, when, the budget and what to bring; the other
                         player agrees or asks to change. Ends with a plan and a checklist.
  - Would you rather?    both choose in secret, then reveal. Same or different, both are fine. Add a reason.
  - Our silly story      take turns picking who, where and what happened; Lumi reads the comic strip.
  - Shop and pay         find the things on the list, the cashier scans them, pay and check the change.
  - How would you feel?  a real-life situation; each player picks a feeling and one thing that helps.
  - Phone practice       short calls and chats; the teen picks (or types) each line and Lumi says it out loud.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const T = A.TG;
  const { ic, esc, L } = T;

  // ---------------------------------------------------------------- small pictures (48 grid, same style as the app's icons)
  const K = 'stroke="#3B2F2F" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  const SH = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55"/>`;
  const note = (amt, fill) => `<rect x="3" y="12" width="42" height="24" rx="4" fill="${fill}" ${K}/><rect x="7" y="16" width="34" height="16" rx="3" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/><circle cx="14" cy="24" r="4" fill="#fff" opacity=".55"/><text x="31" y="29" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="Nunito, ui-rounded, sans-serif">${amt}</text>`;
  const coin = (amt, fill) => `<circle cx="24" cy="24" r="17" fill="${fill}" ${K}/><circle cx="24" cy="24" r="12.5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".6"/><text x="24" y="28.5" text-anchor="middle" font-size="${amt.length > 3 ? 10 : 12}" font-weight="800" fill="#3B2F2F" font-family="Nunito, ui-rounded, sans-serif">${amt}</text>`;
  const PIC = {
    beach: `<rect x="4" y="6" width="40" height="36" rx="8" fill="#CFE8F7" ${K}/><circle cx="34" cy="15" r="5" fill="#FFD23F" ${K}/><path d="M4.9 27c5-3 9 3 14 0s9 3 14 0 8 2 10.2 0V31H4.9z" fill="#5B8FD9"/><path d="M4.9 31h38.2v3.5c0 4-3 7.5-7 7.5H12c-4 0-7.1-3.5-7.1-7.5z" fill="#F4D9A8"/><rect x="4" y="6" width="40" height="36" rx="8" fill="none" ${K}/><path d="M14 31v-10" ${K}/><path d="M7 22c2-6 12-6 14 0z" fill="#EF6F5E" ${K}/>`,
    space: `<rect x="4" y="6" width="40" height="36" rx="8" fill="#34406E" ${K}/><circle cx="22" cy="26" r="8" fill="#F4A259" ${K}/><ellipse cx="22" cy="26" rx="14" ry="4" fill="none" stroke="#FFD23F" stroke-width="2.2" transform="rotate(-18 22 26)"/><circle cx="36" cy="13" r="1.6" fill="#FFF4C8"/><circle cx="11" cy="13" r="1.3" fill="#FFF4C8"/><circle cx="37" cy="34" r="1.3" fill="#FFF4C8"/>`,
    robot: `<path d="M24 5v5" ${K}/><circle cx="24" cy="5" r="2.4" fill="#EF6F5E" ${K}/><rect x="12" y="10" width="24" height="17" rx="5" fill="#D5DDE5" ${K}/><circle cx="19" cy="18" r="2.6" fill="#4FB3A9" ${K}/><circle cx="29" cy="18" r="2.6" fill="#4FB3A9" ${K}/><path d="M20 23h8" ${K}/><rect x="14" y="29" width="20" height="14" rx="4" fill="#8EB8E5" ${K}/><path d="M14 33h-5M34 33h5" stroke="#3B2F2F" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="36" r="2.2" fill="#FFD23F"/>`,
    dino: `<path d="M8 38c0-8 6-14 14-14h6c0-8 2-16 9-16 4 0 6 3 5 6-1 2-3 3-6 3v15c0 4-1 6-4 6v4h-4v-4H17v4h-4v-4c-3 0-5-1-5-4z" fill="#7BC67E" ${K}/><circle cx="38" cy="11" r="1.4" fill="#3B2F2F"/><path d="M10 27l-6-3 4 7" fill="#7BC67E" ${K}/><path d="M18 24l2-4 2 4M24 24l2-4 2 4" fill="#5DAA68" ${K}/>`,
    grandma: `<circle cx="24" cy="9" r="4.5" fill="#D5DDE5" ${K}/><path d="M12 44v-8a12 12 0 0 1 24 0v8z" fill="#9B87D9" ${K}/><circle cx="24" cy="20" r="9" fill="#FFD3AE" ${K}/><path d="M15 19a9 9 0 0 1 18 0c-3-3-6-4-9-4s-6 1-9 4z" fill="#E4E8EE" ${K}/><circle cx="20.5" cy="21" r="2.4" fill="none" stroke="#3B2F2F" stroke-width="1.3"/><circle cx="27.5" cy="21" r="2.4" fill="none" stroke="#3B2F2F" stroke-width="1.3"/><path d="M22 25q2 1.6 4 0" stroke="#3B2F2F" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
    treasure: `<path d="M8 22h32v17a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill="#A87B50" ${K}/><path d="M8 22c0-7 6-12 16-12s16 5 16 12z" fill="#C89A6E" ${K}/><path d="M8 28h32" ${K}/><rect x="21" y="25" width="6" height="7" rx="1.5" fill="#FFD23F" ${K}/><circle cx="16" cy="9" r="3" fill="#FFD23F" ${K}/><circle cx="33" cy="8" r="2.4" fill="#FFD23F" ${K}/>`,
    prata: `<ellipse cx="24" cy="36" rx="20" ry="7" fill="#E4EEF5" ${K}/><ellipse cx="24" cy="31" rx="15" ry="5" fill="#E9B44C" ${K}/><ellipse cx="24" cy="26" rx="15" ry="5" fill="#F2C35E" ${K}/><ellipse cx="24" cy="21" rx="15" ry="5" fill="#F7D488" ${K}/><path d="M16 20q8 3 16 0" stroke="#E9B44C" stroke-width="1.4" fill="none"/>`,
    icecream: `<path d="M16 24l8 20 8-20z" fill="#E9B44C" ${K}/><path d="M19 30l9-4M21 36l6-3" stroke="#C88A3C" stroke-width="1.3"/><circle cx="19" cy="20" r="7" fill="#F59FBF" ${K}/><circle cx="29" cy="20" r="7" fill="#CDEBA8" ${K}/><circle cx="24" cy="12" r="6.5" fill="#FFF4D6" ${K}/><circle cx="24" cy="5.5" r="2.2" fill="#EF6F5E" ${K}/>`,
    pizza: `<path d="M8 12c10-5 22-5 32 0L24 44z" fill="#F7D488" ${K}/><path d="M8 12c10-5 22-5 32 0l-2 4c-9-4-19-4-28 0z" fill="#E9A05C" ${K}/><circle cx="20" cy="21" r="3" fill="#EF6F5E" ${K}/><circle cx="29" cy="20" r="3" fill="#EF6F5E" ${K}/><circle cx="24" cy="30" r="3" fill="#EF6F5E" ${K}/>`,
    bubbletea: `<path d="M27 4l-2 10" stroke="#3B2F2F" stroke-width="3.6" stroke-linecap="round"/><path d="M27 4l-2 10" stroke="#F59FBF" stroke-width="1.6" stroke-linecap="round"/><path d="M12 13h24l-3 28a3 3 0 0 1-3 2.6H18a3 3 0 0 1-3-2.6z" fill="#E8D2B8" ${K}/><path d="M11 12h26" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round"/>${[[19, 37], [24, 38], [29, 37], [21, 33], [27, 33]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#5A3E2E"/>`).join('')}${SH(17, 20, 1, 3)}`,
    phone: `<rect x="13" y="4" width="22" height="40" rx="5" fill="#3B2F2F"/><rect x="15.5" y="8" width="17" height="30" rx="2" fill="#BFE3F7"/><circle cx="24" cy="41" r="1.4" fill="#fff"/><rect x="13" y="4" width="22" height="40" rx="5" fill="none" ${K}/>`,
    phoneDead: `<rect x="13" y="4" width="22" height="40" rx="5" fill="#3B2F2F"/><rect x="15.5" y="8" width="17" height="30" rx="2" fill="#5B6370"/><rect x="18" y="19" width="11" height="7" rx="1.5" fill="none" stroke="#fff" stroke-width="1.5"/><rect x="29" y="21" width="1.6" height="3" fill="#fff"/><rect x="19.4" y="20.4" width="2.4" height="4.2" fill="#EF6F5E"/><rect x="13" y="4" width="22" height="40" rx="5" fill="none" ${K}/>`,
    wallet: `<rect x="6" y="14" width="36" height="24" rx="5" fill="#A87B50" ${K}/><path d="M12 14l14-7 3 7" fill="#7BC67E" ${K}/><rect x="30" y="21" width="12" height="9" rx="3" fill="#C89A6E" ${K}/><circle cx="35" cy="25.5" r="1.6" fill="#FFD23F"/>`,
    basket: `<path d="M14 18l6-10M34 18l-6-10" ${K}/><path d="M6 18h36l-4 20a4 4 0 0 1-4 3H14a4 4 0 0 1-4-3z" fill="#F4A259" ${K}/><path d="M16 24v12M24 24v12M32 24v12" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
    morning: `<rect x="4" y="6" width="40" height="36" rx="8" fill="#FCE3C8" ${K}/><path d="M14 32a10 10 0 0 1 20 0z" fill="#F9C46B" ${K}/><path d="M24 14v4M13 19l3 3M35 19l-3 3" stroke="#F4A259" stroke-width="2.4" stroke-linecap="round"/><path d="M4.9 32h38.2v3c0 3.8-3.2 7-7 7H11.9c-3.8 0-7-3.2-7-7z" fill="#B9D7A0"/><rect x="4" y="6" width="40" height="36" rx="8" fill="none" ${K}/>`,
    afternoon: `<rect x="4" y="6" width="40" height="36" rx="8" fill="#CFE8F7" ${K}/><circle cx="24" cy="17" r="6.5" fill="#FFD23F" ${K}/><path d="M12 31c0-3 3-5 6-4 1-3 7-3 8 0 3-1 6 1 6 4z" fill="#fff" ${K}/><path d="M4.9 34h38.2v1c0 3.8-3.2 7-7 7H11.9c-3.8 0-7-3.2-7-7z" fill="#B9D7A0"/><rect x="4" y="6" width="40" height="36" rx="8" fill="none" ${K}/>`,
    busLate: `<rect x="6" y="10" width="28" height="26" rx="6" fill="#FFD23F" ${K}/><rect x="10" y="14" width="20" height="9" rx="2" fill="#CFE8F7" ${K}/><circle cx="13" cy="37" r="3" fill="#3B2F2F"/><circle cx="27" cy="37" r="3" fill="#3B2F2F"/><circle cx="36" cy="16" r="9" fill="#fff" ${K}/><path d="M36 11v5l3 2" ${K}/>`
  };
  const NOTE = { 2: ['$2', '#9B87D9'], 5: ['$5', '#5DAA68'], 10: ['$10', '#EF6F5E'], 20: ['$20', '#E9A05C'], 50: ['$50', '#5B8FD9'] };
  const svg = (inner, size) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">${inner}</svg>`;
  function pic(id, size) {
    if (PIC[id]) return svg(PIC[id], size);
    if (/^note\d+$/.test(id)) { const n = NOTE[id.slice(4)] || ['$' + id.slice(4), '#5DAA68']; return svg(note(n[0], n[1]), size); }
    if (id.startsWith('food:')) return A.foodSvg(id.slice(5), size, size);
    if (id.startsWith('pet:')) return A.petSvg ? A.petSvg(id.slice(4), 'happy', size) : ic('kPet', size);
    if (id === 'lumi') return L.svg({ look: A.lookWith(), mood: 'happy', size });
    if (id === 'tissuepack') return window.lumiPic ? window.lumiPic(id, size) : ic('tissue', size);
    return ic(id, size);
  }
  // feeling faces: the app's faces plus calm and surprised in the same style
  function faceSvg(kind, size) {
    const L5 = 'stroke="#3B2F2F" stroke-width="5" stroke-linecap="round" fill="none"';
    if (kind === 'calm') return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="#A8D8CF"/><path d="M38 56 Q46 62 54 56 M66 56 Q74 62 82 56" ${L5}/><path d="M48 76 Q60 84 72 76" ${L5}/></svg>`;
    if (kind === 'surprised') return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="#F9C46B"/><path d="M38 38 Q46 32 54 38 M66 38 Q74 32 82 38" ${L5}/><circle cx="46" cy="54" r="6" fill="#3B2F2F"/><circle cx="74" cy="54" r="6" fill="#3B2F2F"/><ellipse cx="60" cy="82" rx="9" ry="11" fill="#3B2F2F"/></svg>`;
    return L.face(kind, size);
  }
  const money = (c) => '$' + (c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2));
  const sayMoney = (c) => { const d = Math.floor(c / 100); const ct = c % 100; return ct ? `${d} dollars ${ct}` : `${d} dollar${d === 1 ? '' : 's'}`; };
  const other = (who) => (who === 'child' ? 'other' : 'child');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const opt = (k, v, picId, label, extra) => `<button class="tg-choice ${extra || ''}" data-a="tg" data-k="${k}" data-v="${esc(v)}" aria-label="${esc(label)}">${pic(picId, 84)}<span>${esc(label)}</span></button>`;
  // in play with Lumi, while Lumi chooses: dim the choices and say so
  const lumiBusy = (g) => T.solo() && g.turn === 'other' && !g.won;
  const thinking = (text) => `<div class="tgt-thinking">${T.avatar('other', 40)}<span>${esc(text || 'Lumi is choosing...')}</span></div>`;
  // "pass the tablet" card for secret choices in Together mode
  const passCard = (to, hidden) => `<div class="tgt-pass">${T.avatar(to, 110)}<b>Pass the tablet to ${esc(T.nameOf(to))}</b><span>${esc(hidden)}</span>
    <button class="primary" data-a="tg" data-k="ready" style="height:76px">${ic('check', 30)}<span>I'm ready</span></button></div>`;

  // ================================================================ 1. Plan our outing
  const OUT = {
    where: { q: 'Where shall we go?', name: 'Where', opts: [['park', 'Park', 'sTree', 0], ['mall', 'Mall', 'shop', 1000], ['zoo', 'Zoo', 'kPet', 2000], ['beach', 'Beach', 'beach', 0], ['library', 'Library', 'book', 0], ['hawker', 'Hawker centre', 'sNoodles', 600]] },
    how: { q: 'How do we get there?', name: 'How', opts: [['mrt', 'MRT', 'sTrain', 400], ['bus', 'Bus', 'bus', 400], ['walk', 'Walk', 'go', 0]] },
    when: { q: 'When shall we go?', name: 'When', opts: [['morning', 'Morning', 'morning'], ['afternoon', 'Afternoon', 'afternoon']] },
    leave: { q: 'What time do we leave?', name: 'Leave at', opts: [['8', '8:00 am', 'clock'], ['10', '10:00 am', 'clock'], ['13', '1:00 pm', 'clock'], ['15', '3:00 pm', 'clock']] },
    budget: { q: 'How much can we spend?', name: 'Budget', opts: [['500', '$5', 'note5'], ['1000', '$10', 'note10'], ['2000', '$20', 'note20']] },
    bring: { q: 'What should we bring?', name: 'Bring', multi: true, opts: [['water', 'Water', 'bottle'], ['card', 'Travel card', 'buscard'], ['phone', 'Phone', 'phone'], ['umbrella', 'Umbrella', 'umbrella'], ['money', 'Money', 'wallet'], ['cap', 'Cap', 'cap2']] }
  };
  const outSteps = (lv) => (lv === 1 ? ['where', 'how', 'bring'] : lv === 3 ? ['where', 'how', 'when', 'leave', 'budget', 'bring'] : ['where', 'how', 'when', 'budget', 'bring']);
  function outOpts(g, key) {
    let o = OUT[key].opts;
    if (key === 'leave') o = o.filter(([v]) => (g.plan.when === 'afternoon' ? Number(v) >= 12 : Number(v) < 12));
    return o;
  }
  const outOpt = (key, v) => OUT[key].opts.find((o) => o[0] === v);
  const outLabel = (key, v) => (Array.isArray(v) ? v.map((x) => outOpt(key, x)[1]).join(', ') : (outOpt(key, v) || [])[1]);
  const outIcon = (key, v) => (key === 'bring' ? 'bag' : (outOpt(key, v) || [])[2] || 'pin');
  function outCost(g) {
    const w = outOpt('where', g.plan.where);
    const h = outOpt('how', g.plan.how);
    return (w ? w[3] : 0) + (h ? h[3] : 0);
  }
  const outSummary = (g) => g.steps.map((k) => `${OUT[k].name}: ${outLabel(k, g.plan[k])}.`).join(' ');
  function outNext(g) {
    g.round += 1;
    g.k += 1;
    g.sel = null;
    if (g.k >= g.steps.length) {
      if (T.level() === 3 && g.plan.budget && outCost(g) > Number(g.plan.budget)) { g.phase = 'check'; T.setTurn(g, 'child'); return; }
      g.phase = 'done';
      T.setTurn(g, 'child', `Our plan is ready! ${outSummary(g)}`);
      return;
    }
    g.phase = 'pick';
    g.picker = g.k % 2 === 0 ? 'child' : 'other';
    T.setTurn(g, g.picker);
  }
  T.register({
    id: 'outing', name: 'Plan our outing', icon: 'pin', tint: '#E3EEF5', ink: '#4A78A8', kind: 'Planning', sub: 'Where, how, when and what to bring',
    ages: ['teen'], skill: 'lifeskills',
    init(g) {
      g.steps = outSteps(T.level());
      g.total = g.steps.length;
      g.k = 0; g.phase = 'pick'; g.picker = 'child'; g.sel = null; g.plan = {};
    },
    voice(g) {
      const key = g.steps[g.k];
      if (g.phase === 'done') return 'Our plan is ready. Check the list, then tap Finish.';
      if (g.phase === 'check') return `This plan costs about ${sayMoney(outCost(g))}, but our budget is ${sayMoney(Number(g.plan.budget))}. Pick a bigger budget.`;
      if (g.phase === 'confirm') return `${T.nameOf(g.picker)} chose ${outLabel(key, g.sel)}. ${T.nameOf(other(g.picker))}, do you agree?`;
      return `${T.nameOf(g.picker)}: ${OUT[key].q}`;
    },
    stage(g) {
      if (g.phase === 'done') {
        const rows = g.steps.map((k) => `<div class="tgt-plan-row"><span class="tgt-plan-ic">${pic(outIcon(k, g.plan[k]), 40)}</span><b>${OUT[k].name}</b><span>${esc(outLabel(k, g.plan[k]))}</span></div>`).join('');
        const list = (g.plan.bring || []).map((b) => `<span class="tgt-check">${ic('check', 18)}<span>${esc(outLabel('bring', b))}</span></span>`).join('');
        return `<div class="tgt-plan"><div class="tgt-plan-h">${ic('pin', 30)}<span>Our plan</span></div>${rows}${list ? `<div class="tgt-plan-list"><b>Checklist</b>${list}</div>` : ''}</div>`;
      }
      if (g.phase === 'check') {
        const need = outCost(g);
        return `<div class="col gap24" style="align-items:center"><div class="tg-say tgt-q">This plan costs about ${money(need)}. Our budget is ${money(Number(g.plan.budget))}.</div>
          <div class="tg-choices">${OUT.budget.opts.map(([v, l, p]) => opt('budget', v, p, l, Number(v) < need ? 'tgt-low' : '')).join('')}</div></div>`;
      }
      const key = g.steps[g.k];
      if (g.phase === 'confirm') {
        const chosen = Array.isArray(g.sel) ? g.sel : [g.sel];
        return `<div class="col gap24" style="align-items:center"><div class="tg-say tgt-q">${esc(T.nameOf(g.picker))} chose:</div>
          <div class="tg-choices">${chosen.map((v) => { const o = outOpt(key, v); return `<div class="tg-choice on">${pic(o[2], 84)}<span>${esc(o[1])}</span></div>`; }).join('')}</div>
          ${lumiBusy(g) ? thinking('Lumi is thinking...') : `<div class="row gap16"><button class="primary" data-a="tg" data-k="agree" style="height:76px">${ic('thumb', 32)}<span>Agree</span></button>
          <button class="primary soft-btn" data-a="tg" data-k="change" style="height:76px">${ic('swap', 30)}<span>Change</span></button></div>`}</div>`;
      }
      const multi = OUT[key].multi;
      const sel = g.sel || (multi ? [] : null);
      return `<div class="col gap24" style="align-items:center"><div class="tg-say tgt-q">${esc(OUT[key].q)}</div>
        <div class="tg-choices tgt-opts ${lumiBusy(g) ? 'tgt-wait' : ''}">${outOpts(g, key).map(([v, l, p]) => opt('pick', v, p, l, multi && sel.includes(v) ? 'on' : '')).join('')}</div>${lumiBusy(g) ? thinking() : ''}
        ${multi && !lumiBusy(g) ? `<button class="primary ${sel.length ? '' : 'faded'}" data-a="tg" data-k="doneBring" style="height:72px">${ic('check', 30)}<span>Done</span></button>` : ''}</div>`;
    },
    bar(g) {
      if (g.phase !== 'done') return '';
      return `<div class="bar">${A.speakBtn(`Our plan. ${outSummary(g)}`, 52)}<span class="tg-bar-note">Read it together, then finish.</span><span class="grow"></span>
        <button class="primary" data-a="tg" data-k="finish" style="height:76px">${ic('check', 32)}<span>Finish</span></button></div>`;
    },
    guide(g) {
      if (g.phase === 'done') return { sel: '[data-k="finish"]', say: 'Tap Finish.' };
      if (g.phase === 'check') return { sel: '.tg-choice:not(.tgt-low)', say: 'Pick a bigger budget.' };
      if (g.phase === 'confirm') return { sel: '[data-k="agree"]', say: 'Agree, or change it.' };
      if (OUT[g.steps[g.k]].multi && g.sel && g.sel.length) return { sel: '[data-k="doneBring"]', say: 'Tap Done.' };
      return { sel: '.tgt-opts .tg-choice', say: 'Pick one.' };
    },
    tap(g, k, el, d) {
      const key = g.steps[g.k];
      if (k === 'pick') {
        if (OUT[key].multi) { g.sel = g.sel || []; g.sel = g.sel.includes(d.v) ? g.sel.filter((x) => x !== d.v) : g.sel.concat(d.v); T.tone(560, 0.12, 0.05); T.render(); return; }
        g.sel = d.v; g.phase = 'confirm'; T.cheer(); T.setTurn(g, other(g.picker)); return;
      }
      if (k === 'doneBring') { if (!g.sel || !g.sel.length) { T.nope(el); return; } g.phase = 'confirm'; T.cheer(); T.setTurn(g, other(g.picker)); return; }
      if (k === 'agree') { g.plan[key] = g.sel; T.cheer(); T.say('Agreed!'); T.later(() => { if (T.cur() === g) outNext(g); }, 600); return; }
      if (k === 'change') { g.picker = other(g.picker); g.phase = 'pick'; g.sel = null; T.setTurn(g, g.picker, `Okay. ${T.nameOf(g.picker)}, you choose.`); return; }
      if (k === 'budget') {
        if (Number(d.v) < outCost(g)) { T.nope(el); T.say('That is not enough. Pick a bigger one.'); return; }
        g.plan.budget = d.v; g.phase = 'done'; T.cheer(); T.setTurn(g, 'child', `Our plan is ready! ${outSummary(g)}`); return;
      }
      if (k === 'finish') T.win(g, { text: 'Plan ready!', sub: esc(outSummary(g)), say: 'Plan ready. Have a great outing!' });
    },
    lumiTurn(g) {
      const key = g.steps[g.k];
      if (g.phase === 'pick' && g.picker === 'other') {
        if (OUT[key].multi) g.sel = ['water', 'card', 'phone'].concat(g.plan.where === 'beach' || g.plan.where === 'park' ? ['cap'] : ['money']);
        else {
          let o = outOpts(g, key);
          if (key === 'budget' && T.level() === 3) o = o.filter(([v]) => Number(v) >= outCost(g));
          g.sel = T.pick(o.length ? o : OUT[key].opts, 1)[0][0];
        }
        g.phase = 'confirm';
        T.cheer();
        T.setTurn(g, 'child', `Lumi chose ${outLabel(key, g.sel)}. Do you agree?`);
        return;
      }
      if (g.phase === 'confirm' && g.picker === 'child') {
        g.plan[key] = g.sel;
        T.say(T.pick(['Good idea!', 'I agree!', 'Sounds good!'], 1)[0]);
        T.later(() => { if (T.cur() === g) outNext(g); }, 900);
      }
    }
  });

  // ================================================================ 2. Would you rather?
  const PAIRS = [
    [['bubbletea', 'Bubble tea'], ['drink', 'Juice']],
    [['beach', 'Beach'], ['shop', 'Mall']],
    [['pet:puppy', 'Dogs'], ['pet:kitten', 'Cats']],
    [['sTrain', 'MRT'], ['bus', 'Bus']],
    [['food:chicken', 'Chicken rice'], ['pizza', 'Pizza']],
    [['palette', 'Drawing'], ['music', 'Music']],
    [['rain', 'Rain'], ['sSun', 'Sunshine']],
    [['morning', 'Early mornings'], ['sMoon', 'Late nights']]
  ];
  const WHY = [['tasty', "it's tasty"], ['fun', "it's fun"], ['quiet', "it's quiet"], ['cool', "it's cool"], ['relax', "it's relaxing"], ['exciting', "it's exciting"]];
  const whyLabel = (v) => (WHY.find((w) => w[0] === v) || ['', ''])[1];
  function ratherRound(g) {
    g.pair = g.pairs[g.round];
    g.picks = { child: null, other: null };
    g.why = { child: null, other: null };
    g.phase = 'pick';
    g.turn = g.first;
  }
  function ratherReveal(g) {
    g.phase = 'reveal';
    const same = g.picks.child === g.picks.other;
    if (same) g.same += 1;
    T.setTurn(g, 'child', same ? 'Same! You both chose ' + g.pair[g.picks.child][1] + '.' : "Different! That's okay. People like different things.");
  }
  T.register({
    id: 'rather', name: 'Would you rather?', icon: 'what', tint: '#F1ECFB', ink: '#7E64C8', kind: 'Chatting', sub: 'Choose, compare and say why',
    ages: ['teen'], skill: 'social',
    init(g) {
      g.total = T.level() === 1 ? 4 : 6;
      g.pairs = T.pick(PAIRS, g.total);
      g.same = 0;
      g.first = 'child';
      ratherRound(g);
    },
    voice(g) {
      if (g.phase === 'pass') return `Pass the tablet to ${T.nameOf(g.turn)}.`;
      if (g.phase === 'reveal') return g.picks.child === g.picks.other ? 'Same! Say why if you like.' : "Different! That's okay. Say why if you like.";
      return `${T.nameOf(g.turn)}: would you rather have ${g.pair[0][1]} or ${g.pair[1][1]}?`;
    },
    stage(g) {
      if (g.phase === 'pass') return passCard(g.turn, `${T.nameOf(other(g.turn))}'s choice is hidden.`);
      if (g.phase === 'reveal') {
        const same = g.picks.child === g.picks.other;
        const side = (who) => {
          const p = g.pair[g.picks[who]];
          const why = g.why[who];
          const chips = !why && !(T.solo() && who === 'other') ? `<div class="tgt-why">${WHY.map(([v, l]) => `<button class="tgt-chip" data-a="tg" data-k="why" data-v="${who}:${v}" data-any="1">${esc(l)}</button>`).join('')}</div>` : '';
          return `<div class="tgt-side">${T.avatar(who, 56)}<div class="tg-choice on">${pic(p[0], 88)}<span>${esc(p[1])}</span></div>
            ${why ? `<div class="tgt-because">because ${esc(whyLabel(why))}</div>` : chips}</div>`;
        };
        return `<div class="tgt-reveal"><div class="tgt-result ${same ? 'same' : ''}">${same ? 'Same!' : "Different, that's okay"}</div><div class="row gap24" style="align-items:flex-start">${side('child')}${side('other')}</div></div>`;
      }
      const hidden = g.picks[other(g.turn)] != null ? `<div class="tgt-hidden">${T.avatar(other(g.turn), 36)}<span>${esc(T.nameOf(other(g.turn)))} has chosen</span>${ic('lock', 22)}</div>` : '';
      return `<div class="col gap24" style="align-items:center"><div class="tg-say tgt-q">Would you rather...</div>
        <div class="row gap24 tgt-pair ${lumiBusy(g) ? 'tgt-wait' : ''}">${g.pair.map(([p, l], i) => `<button class="tg-choice tgt-big" data-a="tg" data-k="pick" data-v="${i}">${pic(p, 130)}<span>${esc(l)}</span></button>${i === 0 ? '<span class="tgt-or">or</span>' : ''}`).join('')}</div>${lumiBusy(g) ? thinking() : hidden}</div>`;
    },
    bar(g) {
      if (g.phase !== 'reveal') return '';
      const need = T.level() === 3 && !g.why.child;
      return `<div class="bar"><span class="tg-bar-note">${need ? 'Say why you chose it, then go on.' : 'Talk about it, then go on.'}</span><span class="grow"></span>
        <button class="primary ${need ? 'faded' : ''}" data-a="tg" data-k="next" data-any="1" style="height:76px"><span>Next</span>${ic('arrow', 30)}</button></div>`;
    },
    guide(g) {
      if (g.phase === 'pass') return { sel: '[data-k="ready"]', say: 'Tap when you are ready.' };
      if (g.phase === 'reveal') return T.level() === 3 && !g.why.child ? { sel: '.tgt-chip', say: 'Why did you choose it?' } : { sel: '[data-k="next"]', say: 'Tap Next.' };
      return { sel: '.tgt-big', say: 'Pick one.' };
    },
    tap(g, k, el, d) {
      if (k === 'ready') { g.phase = 'pick'; T.render(); T.say(this.voice(g)); return; }
      if (k === 'pick') {
        g.picks[g.turn] = Number(d.v);
        T.tone(560, 0.12, 0.05);
        if (g.turn === g.first) {
          if (!T.solo()) g.phase = 'pass';
          T.setTurn(g, other(g.first));
          return;
        }
        ratherReveal(g);
        return;
      }
      if (k === 'why') {
        const [who, v] = d.v.split(':');
        g.why[who] = v;
        T.tone(660, 0.12, 0.05);
        T.render();
        T.say(`${T.nameOf(who)} chose it because ${whyLabel(v)}.`);
        return;
      }
      if (k === 'next') {
        if (T.level() === 3 && !g.why.child) { T.nope(el); T.say('Say why first. Pick a reason.'); return; }
        g.round += 1;
        if (g.round >= g.total) { T.win(g, { text: 'Great chat!', sub: `You chose the same thing ${g.same} time${g.same === 1 ? '' : 's'}. Different choices are just as good.` }); return; }
        g.first = other(g.first);
        ratherRound(g);
        T.setTurn(g, g.first);
      }
    },
    lumiTurn(g) {
      if (g.phase !== 'pick') return;
      g.picks.other = Math.random() < 0.5 ? 0 : 1;
      g.why.other = T.pick(WHY, 1)[0][0];
      T.tone(560, 0.12, 0.05);
      if (g.first === 'other') { T.setTurn(g, 'child', 'Lumi has chosen. Your turn!'); return; }
      ratherReveal(g);
    }
  });

  // ================================================================ 3. Our silly story
  const STORY = {
    who: { q: 'Who is in our story?', name: 'Who', opts: [['lumi', 'Lumi', 'Lumi'], ['pet:kitten', 'a cat', 'The cat'], ['grandma', 'Grandma', 'Grandma'], ['robot', 'a robot', 'The robot'], ['dino', 'a dinosaur', 'The dinosaur']] },
    where: { q: 'Where are they?', name: 'Where', opts: [['sTrain', 'on the MRT'], ['sNoodles', 'at the hawker centre'], ['beach', 'at the beach'], ['space', 'in space'], ['school', 'at school']] },
    what: { q: 'What happened?', name: 'What happened', opts: [['shoes', 'lost a shoe'], ['treasure', 'found treasure'], ['music', 'danced and danced'], ['prata', 'ate 100 prata'], ['sNap', 'fell fast asleep']] },
    then: { q: 'Then what?', name: 'Then', opts: [['together', 'met a friend'], ['rain', 'it started to rain'], ['bus', 'a bus came by'], ['volume', 'music started to play']] },
    end: { q: 'How does it end?', name: 'Ending', opts: [['smile', 'Everyone laughed.'], ['home', 'Everyone went home.'], ['icecream', 'Everyone had ice cream.']] }
  };
  const storySlots = (lv) => (lv === 1 ? ['who', 'where', 'what'] : lv === 3 ? ['who', 'where', 'what', 'then', 'end'] : ['who', 'where', 'what', 'end']);
  function storyLines(g) {
    const o = (s) => (g.picks[s] ? STORY[s].opts.find((x) => x[0] === g.picks[s]) : null);
    const who = o('who');
    const out = [];
    if (who && o('where')) out.push(`Once upon a time, ${who[1]} was ${o('where')[1]}.`);
    if (o('what')) out.push(`${who ? who[2] : 'Someone'} ${o('what')[1]}!`);
    if (o('then')) out.push(`Then ${o('then')[1]}.`);
    if (o('end')) out.push(`In the end, ${o('end')[1].charAt(0).toLowerCase()}${o('end')[1].slice(1)}`);
    else out.push('The end!');
    return out;
  }
  T.register({
    id: 'story', name: 'Our silly story', icon: 'storybook', tint: '#FBEAD9', ink: '#B5652E', kind: 'Ideas', sub: 'Take turns to make a funny story',
    ages: ['teen'], skill: 'social',
    init(g) {
      g.slots = storySlots(T.level());
      g.total = g.slots.length;
      g.picks = {};
      g.phase = 'pick';
    },
    voice(g) {
      if (g.phase === 'read') return storyLines(g).join(' ');
      return `${T.nameOf(g.turn)}: ${STORY[g.slots[g.round]].q}`;
    },
    stage(g) {
      const read = g.phase === 'read';
      const panels = g.slots.map((s, i) => {
        const o = g.picks[s] ? STORY[s].opts.find((x) => x[0] === g.picks[s]) : null;
        return `<div class="tgt-panel ${o ? 'on' : ''} ${i === g.round && !read ? 'now' : ''}">${o ? pic(o[0], read ? 92 : 56) : '<span class="tgt-q-mark">?</span>'}<span>${o ? esc(o[1]) : esc(STORY[s].name)}</span></div>`;
      }).join('');
      if (read) return `<div class="tgt-story read"><div class="tgt-strip">${panels}</div><div class="tgt-story-text">${storyLines(g).map((l) => `<p>${esc(l)}</p>`).join('')}</div></div>`;
      const s = g.slots[g.round];
      return `<div class="tgt-story"><div class="tgt-strip">${panels}</div><div class="tg-say tgt-q">${esc(STORY[s].q)}</div>
        <div class="tg-choices tgt-opts ${lumiBusy(g) ? 'tgt-wait' : ''}">${STORY[s].opts.map(([p, l]) => `<button class="tg-choice" data-a="tg" data-k="pick" data-v="${esc(p)}">${pic(p, 68)}<span>${esc(cap(l))}</span></button>`).join('')}</div>${lumiBusy(g) ? thinking() : ''}</div>`;
    },
    bar(g) {
      if (g.phase !== 'read') return '';
      return `<div class="bar"><button class="primary soft-btn" data-a="tg" data-k="read" style="height:76px">${ic('speaker', 30)}<span>Read again</span></button><span class="grow"></span>
        <button class="primary" data-a="tg" data-k="finish" style="height:76px">${ic('check', 32)}<span>Finish</span></button></div>`;
    },
    guide(g) {
      if (g.phase === 'read') return { sel: '[data-k="finish"]', say: 'Tap Finish.', delay: 9000 };
      return { sel: '.tgt-opts .tg-choice', say: 'Pick one.' };
    },
    tap(g, k, el, d) {
      if (k === 'pick') {
        if (g.phase !== 'pick') return;
        g.picks[g.slots[g.round]] = d.v;
        g.round += 1;
        T.cheer();
        if (g.round >= g.slots.length) { g.phase = 'read'; g.turn = 'child'; T.render(); T.later(() => { if (T.cur() === g) T.say(storyLines(g).join(' ')); }, 500); return; }
        T.swap(g);
        return;
      }
      if (k === 'read') { T.say(storyLines(g).join(' ')); return; }
      if (k === 'finish') T.win(g, { text: 'What a story!', sub: esc(storyLines(g).join(' ')), say: 'What a silly story! Well done.' });
    },
    lumiTurn(g) {
      if (g.phase !== 'pick') return;
      const s = g.slots[g.round];
      this.tap(g, 'pick', null, { v: T.pick(STORY[s].opts, 1)[0][0] });
    }
  });

  // ================================================================ 4. Shop and pay
  // [id, label, picture, price in cents (Easy/Medium), price in cents (Challenge)]
  const ITEMS = [
    ['milk', 'Milk', 'food:milk', 200, 240], ['bread', 'Bread', 'food:toast', 300, 280], ['apples', 'Apples', 'apple', 400, 350], ['eggs', 'Eggs', 'food:wholeEgg', 300, 320],
    ['rice', 'Rice', 'sRice', 500, 490], ['juice', 'Juice', 'drink', 200, 170], ['biscuits', 'Biscuits', 'snack', 100, 130], ['tissues', 'Tissues', 'tissuepack', 200, 210]
  ];
  const MONEY = { 1: [100, 200, 500], 2: [100, 200, 500, 1000], 3: [10, 20, 50, 100, 200, 500, 1000] };
  function moneyPic(c, size) {
    if (c < 100) return svg(coin(c + 'c', '#D5DDE5'), size);
    if (c === 100) return svg(coin('$1', '#F2C35E'), size);
    const n = NOTE[c / 100];
    return svg(note(n[0], n[1]), size);
  }
  const itemOf = (id) => ITEMS.find((x) => x[0] === id);
  const priceOf = (id) => (T.level() === 3 ? itemOf(id)[4] : itemOf(id)[3]);
  const shopTotal = (g) => g.basket.reduce((s, id) => s + priceOf(id), 0);
  const paidTotal = (g) => g.pay.reduce((s, c) => s + c, 0);
  function shopToPay(g) {
    g.phase = 'pay';
    g.round = 2;
    T.setTurn(g, 'child', `That's ${sayMoney(shopTotal(g))}. ${T.solo() ? 'Pay Lumi' : 'Pay the cashier'} with the money.`);
  }
  function shopChangeOptions(g) {
    const ch = paidTotal(g) - shopTotal(g);
    const opts = [ch, ch + 100, ch > 50 ? ch - 50 : ch + 50, ch + 10];
    return T.shuffle(opts.filter((v, i) => opts.indexOf(v) === i && v >= 0).slice(0, 3));
  }
  function shopDone(g) {
    g.round = 4;
    const ch = paidTotal(g) - shopTotal(g);
    T.win(g, { text: 'Shopping done!', sub: `Total ${money(shopTotal(g))}, paid ${money(paidTotal(g))}${ch ? `, change ${money(ch)}` : ''}.`, say: 'Shopping done. Well counted!' });
  }
  T.register({
    id: 'shop', name: 'Shop and pay', icon: 'shop', tint: '#FFF1DE', ink: '#B07A12', kind: 'Money', sub: 'Shopping list, paying and change',
    ages: ['teen'], skill: 'lifeskills',
    init(g) {
      g.list = T.pick(ITEMS, T.level() === 1 ? 2 : 3).map((x) => x[0]);
      g.basket = [];
      g.scanned = [];
      g.pay = [];
      g.total = 4;
      g.phase = 'shop';
      g.changeOpts = null;
    },
    voice(g) {
      const list = g.list.map((id) => itemOf(id)[1]).join(', ');
      if (g.phase === 'shop') return `Find the things on our list: ${list}.`;
      if (g.phase === 'scan') return T.solo() ? 'Lumi is scanning your shopping.' : `${T.nameOf('other')}, you are the cashier. Scan each thing.`;
      if (g.phase === 'pay') return `That's ${sayMoney(shopTotal(g))}. ${T.level() === 1 ? 'Pay exactly that much.' : 'Pay with enough money.'}`;
      if (g.phase === 'change') return T.solo() ? `Help Lumi count your change. You paid ${sayMoney(paidTotal(g))}.` : `${T.nameOf('other')}, what is the right change?`;
      if (g.phase === 'check') return `The change is ${sayMoney(paidTotal(g) - shopTotal(g))}. Is it right?`;
      return '';
    },
    stage(g) {
      const listCard = `<div class="tgt-list"><b>Our list</b>${g.list.map((id) => `<span class="${g.basket.includes(id) ? 'got' : ''}">${pic(itemOf(id)[2], 34)}<em>${esc(itemOf(id)[1])}</em>${g.basket.includes(id) ? ic('check', 18) : ''}</span>`).join('')}</div>`;
      const basket = `<div class="tgt-basket">${pic('basket', 56)}${g.basket.map((id) => `<span class="tgt-bitem">${pic(itemOf(id)[2], 44)}</span>`).join('')}</div>`;
      if (g.phase === 'shop') {
        return `<div class="tgt-shop">${listCard}<div class="tgt-shelf">${ITEMS.map(([id, l, p]) => `<button class="tgt-item ${g.basket.includes(id) ? 'taken' : ''}" data-a="tg" data-k="item" data-v="${id}" aria-label="${esc(l)} ${money(priceOf(id))}">${pic(p, 64)}<span>${esc(l)}</span><b>${money(priceOf(id))}</b></button>`).join('')}</div>${basket}</div>`;
      }
      const done = g.scanned.length === g.basket.length;
      const till = `<div class="tgt-till"><span>Total</span><b>${done ? money(shopTotal(g)) : '...'}</b></div>`;
      if (g.phase === 'scan') {
        return `<div class="tgt-counter">${T.avatar('other', 80)}<div class="col gap16" style="align-items:center"><div class="tg-say tgt-q">${T.solo() ? 'Lumi is the cashier' : `${esc(T.nameOf('other'))} is the cashier`}</div>
          <div class="row gap12">${g.basket.map((id) => `<button class="tgt-item ${g.scanned.includes(id) ? 'taken scanned' : ''}" data-a="tg" data-k="scan" data-v="${id}">${pic(itemOf(id)[2], 60)}<span>${esc(itemOf(id)[1])}</span><b>${g.scanned.includes(id) ? money(priceOf(id)) : 'Scan'}</b></button>`).join('')}</div>${till}</div></div>`;
      }
      if (g.phase === 'pay') {
        return `<div class="tgt-counter col"><div class="row gap24" style="align-items:center">${till}<div class="tgt-till pay"><span>Paying</span><b>${money(paidTotal(g))}</b></div></div>
          <div class="tgt-tray">${g.pay.length ? g.pay.map((c, i) => `<button class="tgt-money in" data-a="tg" data-k="unpay" data-v="${i}" aria-label="Take back ${money(c)}">${moneyPic(c, 60)}</button>`).join('') : '<span class="muted">Tap the money to pay</span>'}</div>
          <div class="tgt-wallet">${MONEY[T.level()].map((c) => `<button class="tgt-money" data-a="tg" data-k="money" data-v="${c}" aria-label="${money(c)}">${moneyPic(c, 84)}</button>`).join('')}</div></div>`;
      }
      const ch = paidTotal(g) - shopTotal(g);
      if (g.phase === 'change') {
        return `<div class="tgt-counter col"><div class="tg-say tgt-q">Paid ${money(paidTotal(g))}. Total ${money(shopTotal(g))}. What is the change?</div>
          <div class="tg-choices">${g.changeOpts.map((v) => `<button class="tg-choice tgt-amt" data-a="tg" data-k="change" data-v="${v}">${money(v)}</button>`).join('')}</div></div>`;
      }
      return `<div class="tgt-counter col"><div class="tgt-sum">${money(paidTotal(g))} − ${money(shopTotal(g))} = <b>${money(ch)}</b></div><div class="tg-say tgt-q">That's ${money(ch)} change. Is it right?</div>
        <button class="primary" data-a="tg" data-k="checked" data-any="1" style="height:76px">${ic('check', 30)}<span>Yes, that's right</span></button></div>`;
    },
    guide(g) {
      if (g.phase === 'shop') { const next = g.list.find((id) => !g.basket.includes(id)); return next ? { sel: `.tgt-item[data-v="${next}"]`, say: `Find the ${itemOf(next)[1].toLowerCase()}.` } : null; }
      if (g.phase === 'scan') { const next = g.basket.find((id) => !g.scanned.includes(id)); return next ? { sel: `[data-k="scan"][data-v="${next}"]`, say: 'Scan it.' } : null; }
      if (g.phase === 'pay') {
        const left = shopTotal(g) - paidTotal(g);
        if (left <= 0) return { sel: '[data-k="paid"]', say: 'Tap Pay.' };
        // a sensible hint: the biggest coin or note that still fits (Easy pays exactly), or one note that covers it
        const vals = MONEY[T.level()];
        const fit = vals.filter((c) => c <= left);
        const cover = vals.filter((c) => c >= left);
        const c = T.level() === 1 || !cover.length ? fit[fit.length - 1] : cover[0];
        return { sel: `.tgt-wallet .tgt-money[data-v="${c}"]`, say: 'Tap the money.' };
      }
      if (g.phase === 'change') return { sel: `[data-k="change"][data-v="${paidTotal(g) - shopTotal(g)}"]`, say: 'Which is the right change?' };
      if (g.phase === 'check') return { sel: '[data-k="checked"]', say: 'Is it right?' };
      return null;
    },
    bar(g) {
      if (g.phase !== 'pay') return '';
      const paid = paidTotal(g);
      const tot = shopTotal(g);
      const ok = T.level() === 1 ? paid === tot : paid >= tot;
      return `<div class="bar"><span class="tg-bar-note">${T.level() === 1 ? `Pay exactly ${money(tot)}. Tap money in the tray to take it back.` : `Pay at least ${money(tot)}.`}</span><span class="grow"></span>
        <button class="primary ${ok ? '' : 'faded'}" data-a="tg" data-k="paid" style="height:76px">${ic('check', 30)}<span>Pay</span></button></div>`;
    },
    tap(g, k, el, d) {
      if (k === 'item') {
        if (g.phase !== 'shop' || g.basket.includes(d.v)) return;
        if (!g.list.includes(d.v)) { T.nope(el); T.say(`${itemOf(d.v)[1]} is not on our list.`); return; }
        g.basket.push(d.v); T.cheer(); T.say(itemOf(d.v)[1] + '.');
        if (g.basket.length === g.list.length) { g.phase = 'scan'; g.round = 1; T.render(); T.later(() => { if (T.cur() === g) T.setTurn(g, 'other'); }, 700); return; }
        T.render();
        return;
      }
      if (k === 'scan') {
        if (g.phase !== 'scan' || g.scanned.includes(d.v)) return;
        g.scanned.push(d.v); T.tone(1040, 0.12, 0.06); T.render(); T.say(sayMoney(priceOf(d.v)));
        if (g.scanned.length === g.basket.length) T.later(() => { if (T.cur() === g) shopToPay(g); }, 900);
        return;
      }
      if (k === 'money') { g.pay.push(Number(d.v)); T.tone(700, 0.1, 0.05); T.render(); return; }
      if (k === 'unpay') { g.pay.splice(Number(d.v), 1); T.render(); return; }
      if (k === 'paid') {
        const paid = paidTotal(g);
        const tot = shopTotal(g);
        if (paid < tot) { T.nope(el); T.say(`Not enough yet. It costs ${sayMoney(tot)}.`); return; }
        if (T.level() === 1 && paid !== tot) { T.nope(el); T.say(`That's too much. Try to pay exactly ${sayMoney(tot)}. Tap money in the tray to take it back.`); return; }
        T.cheer();
        g.round = 3;
        if (paid === tot) { T.say('Exactly right! No change.'); T.later(() => { if (T.cur() === g) shopDone(g); }, 900); return; }
        if (T.level() === 3) {
          g.changeOpts = shopChangeOptions(g);
          g.phase = 'change';
          // Together: the cashier works out the change. With Lumi: the teen helps Lumi count it.
          T.setTurn(g, T.solo() ? 'child' : 'other');
          return;
        }
        g.phase = 'check';
        T.setTurn(g, 'child', `Here is your change: ${sayMoney(paid - tot)}. Is it right?`);
        return;
      }
      if (k === 'change') {
        if (Number(d.v) !== paidTotal(g) - shopTotal(g)) { T.nope(el); T.say('Not quite. Count again.'); return; }
        T.cheer(); g.phase = 'check'; T.setTurn(g, 'child', `${sayMoney(Number(d.v))} change. Let's check it together.`);
        return;
      }
      if (k === 'checked') { T.cheer(); shopDone(g); }
    },
    lumiTurn(g) {
      if (g.phase !== 'scan') return;
      const next = g.basket.find((id) => !g.scanned.includes(id));
      if (!next) return;
      g.scanned.push(next); T.tone(1040, 0.12, 0.06); T.render(); T.say(`${itemOf(next)[1]}, ${sayMoney(priceOf(next))}.`);
      if (g.scanned.length === g.basket.length) T.later(() => { if (T.cur() === g) shopToPay(g); }, 1300);
      else T.later(() => { if (T.cur() === g) this.lumiTurn(g); }, 1300);
    }
  });

  // ================================================================ 5. How would you feel?
  const SITU = [
    { id: 'bus', text: 'The bus is late.', pic: 'busLate', lumi: ['worried', 'plan'] },
    { id: 'cancel', text: 'A friend cancels your plans.', pic: 'chat', lumi: ['sad', 'tell'] },
    { id: 'mark', text: 'You got a good mark.', pic: 'medal', lumi: ['happy', 'tell'] },
    { id: 'battery', text: 'Your phone battery dies.', pic: 'phoneDead', lumi: ['surprised', 'plan'] },
    { id: 'noise', text: 'It is very loud at the mall.', pic: 'volume', lumi: ['worried', 'break'] },
    { id: 'newclass', text: 'You start a new class.', pic: 'school', lumi: ['worried', 'breathe'] }
  ];
  const FEELS = [['happy', 'Happy'], ['sad', 'Sad'], ['angry', 'Angry'], ['worried', 'Worried'], ['calm', 'Calm'], ['surprised', 'Surprised']];
  const HELPS = [['breathe', 'Breathe slowly', 'kCalm'], ['help', 'Ask for help', 'help'], ['music', 'Listen to music', 'music'], ['break', 'Take a break', 'kBreak'], ['tell', 'Tell someone', 'chat'], ['plan', 'Plan B', 'wNext']];
  const feelsFor = (lv) => (lv === 1 ? FEELS.slice(0, 4) : lv === 2 ? FEELS.slice(0, 5) : FEELS);
  const helpsFor = (lv) => (lv === 1 ? HELPS.slice(0, 4) : HELPS);
  function feelRound(g) {
    g.situ = g.situs[g.round];
    g.ans = { child: {}, other: {} };
    g.phase = 'pick';
    g.turn = g.first;
  }
  function feelReveal(g) {
    g.phase = 'reveal';
    const same = g.ans.child.f === g.ans.other.f;
    T.setTurn(g, 'child', same ? 'You both feel the same.' : 'Different feelings are okay. Everyone feels things in their own way.');
  }
  T.register({
    id: 'feel', name: 'How would you feel?', icon: 'kHeart', tint: '#FBE3E8', ink: '#C2577A', kind: 'Feelings', sub: 'A feeling and one thing that helps',
    ages: ['teen'], skill: 'emotions',
    init(g) {
      g.total = T.level() === 1 ? 3 : 5;
      g.situs = T.pick(SITU, g.total);
      g.first = 'child';
      feelRound(g);
    },
    voice(g) {
      if (g.phase === 'pass') return `Pass the tablet to ${T.nameOf(g.turn)}.`;
      if (g.phase === 'reveal') return g.ans.child.f === g.ans.other.f ? 'You both feel the same.' : 'Different feelings are okay.';
      return `${g.situ.text} ${T.nameOf(g.turn)}, how would you feel, and what would help?`;
    },
    stage(g) {
      const card = `<div class="tgt-situ">${pic(g.situ.pic, 64)}<b>${esc(g.situ.text)}</b></div>`;
      if (g.phase === 'pass') return passCard(g.turn, `${T.nameOf(other(g.turn))}'s answer is hidden.`);
      if (g.phase === 'reveal') {
        const side = (who) => {
          const a = g.ans[who];
          const f = FEELS.find((x) => x[0] === a.f);
          const h = HELPS.find((x) => x[0] === a.h);
          return `<div class="tgt-side">${T.avatar(who, 52)}<b>${esc(T.nameOf(who))}</b><div class="tgt-feel on">${faceSvg(a.f, 76)}<span>${esc(f[1])}</span></div><div class="tgt-help on">${pic(h[2], 32)}<span>${esc(h[1])}</span></div></div>`;
        };
        const same = g.ans.child.f === g.ans.other.f;
        return `<div class="tgt-reveal">${card}<div class="row gap24" style="align-items:flex-start">${side('child')}${side('other')}</div>
          <div class="tgt-result ${same ? 'same' : ''}">${same ? 'You both feel the same' : 'Different feelings are okay'}</div></div>`;
      }
      const a = g.ans[g.turn];
      if (lumiBusy(g)) return `<div class="tgt-feelpick">${card}${thinking('Lumi is thinking about it...')}</div>`;
      return `<div class="tgt-feelpick">${card}
        <div class="tgt-row-h">I would feel...</div><div class="tgt-feels">${feelsFor(T.level()).map(([v, l]) => `<button class="tgt-feel ${a.f === v ? 'on' : ''}" data-a="tg" data-k="f" data-v="${v}">${faceSvg(v, 58)}<span>${l}</span></button>`).join('')}</div>
        <div class="tgt-row-h">What would help...</div><div class="tgt-helps">${helpsFor(T.level()).map(([v, l, p]) => `<button class="tgt-help ${a.h === v ? 'on' : ''}" data-a="tg" data-k="h" data-v="${v}">${pic(p, 32)}<span>${l}</span></button>`).join('')}</div></div>`;
    },
    bar(g) {
      if (g.phase === 'pick') {
        const a = g.ans[g.turn];
        return `<div class="bar"><span class="tg-bar-note">Pick a feeling and one thing that helps.</span><span class="grow"></span>
          <button class="primary ${a.f && a.h ? '' : 'faded'}" data-a="tg" data-k="done" style="height:76px">${ic('check', 30)}<span>Done</span></button></div>`;
      }
      if (g.phase === 'reveal') return `<div class="bar"><span class="tg-bar-note">Talk about it if you like.</span><span class="grow"></span><button class="primary" data-a="tg" data-k="next" data-any="1" style="height:76px"><span>Next</span>${ic('arrow', 30)}</button></div>`;
      return '';
    },
    guide(g) {
      if (g.phase === 'pass') return { sel: '[data-k="ready"]', say: 'Tap when you are ready.' };
      if (g.phase === 'reveal') return { sel: '[data-k="next"]', say: 'Tap Next.' };
      const a = g.ans[g.turn];
      if (!a.f) return { sel: '.tgt-feels .tgt-feel', say: 'How would you feel?' };
      if (!a.h) return { sel: '.tgt-helps .tgt-help', say: 'What would help?' };
      return { sel: '[data-k="done"]', say: 'Tap Done.' };
    },
    tap(g, k, el, d) {
      if (k === 'ready') { g.phase = 'pick'; T.render(); T.say(this.voice(g)); return; }
      if (k === 'f' || k === 'h') {
        if (g.phase !== 'pick') return;
        g.ans[g.turn][k] = d.v; T.tone(560, 0.12, 0.05); T.render();
        T.say(k === 'f' ? FEELS.find((x) => x[0] === d.v)[1] : HELPS.find((x) => x[0] === d.v)[1]);
        return;
      }
      if (k === 'done') {
        const a = g.ans[g.turn];
        if (!a.f || !a.h) { T.nope(el); return; }
        T.cheer();
        if (g.turn === g.first) {
          if (!T.solo()) g.phase = 'pass';
          T.setTurn(g, other(g.first));
          return;
        }
        feelReveal(g);
        return;
      }
      if (k === 'next') {
        g.round += 1;
        if (g.round >= g.total) { T.win(g, { text: 'Thank you for sharing', sub: 'Knowing what helps you is a real skill.', say: 'Thank you for sharing your feelings.' }); return; }
        g.first = other(g.first);
        feelRound(g);
        T.setTurn(g, g.first);
      }
    },
    lumiTurn(g) {
      if (g.phase !== 'pick') return;
      const [f, h] = g.situ.lumi;
      g.ans.other = { f: feelsFor(T.level()).some((x) => x[0] === f) ? f : 'worried', h: helpsFor(T.level()).some((x) => x[0] === h) ? h : 'help' };
      T.cheer();
      if (g.first === 'other') { T.setTurn(g, 'child', `Lumi has answered. ${g.situ.text} How would you feel?`); return; }
      feelReveal(g);
    }
  });

  // ================================================================ 6. Phone practice
  const SCRIPTS = [
    { id: 'tea', name: 'Order bubble tea', them: 'Bubble tea shop', icon: 'bubbletea', call: false, lines: [
      { them: 'Hi! What would you like?' },
      { me: ['Can I have a brown sugar milk tea, please?', 'One mango green tea, please.', 'Can I have a pearl milk tea?'] },
      { them: 'Sure. What sugar level?' },
      { me: ['Less sweet, please.', 'Normal sugar, please.', 'Half sugar, please.'] },
      { them: "That's $3.50. Cash or card?" },
      { me: ['Card, please.', 'Here is the cash.', 'Can I pay by phone?'] },
      { them: 'Here you go. Enjoy!' },
      { me: ['Thank you!', 'Thanks, have a nice day.', 'Thank you very much.'] }
    ] },
    { id: 'sick', name: 'Call in sick', them: 'School office', icon: 'phone', call: true, lines: [
      { them: 'Hello, school office.' },
      { me: ["Hi, this is {name}. I'm not well today.", "Hello. It's {name}. I can't come to school today.", "Hi, it's {name}. I'm sick today."] },
      { them: "Oh no. What's wrong?" },
      { me: ['I have a fever.', 'My stomach hurts.', 'I have a bad cough.'] },
      { them: 'Please rest. Are you seeing a doctor?' },
      { me: ["Yes, I'm going to the clinic.", 'My mum is taking me.', "I'll rest at home first."] },
      { them: 'Okay. Get well soon.' },
      { me: ['Thank you. Bye.', 'Thanks, bye.', 'Thank you for your help.'] }
    ] },
    { id: 'mrt', name: 'Ask for directions', them: 'MRT staff', icon: 'sTrain', call: false, lines: [
      { them: 'Hi, can I help you?' },
      { me: ['Excuse me, how do I get to Orchard?', 'Which train goes to Jurong East?', 'Where is the exit to the bus stop?'] },
      { them: 'Take the red line. Platform B.' },
      { me: ['How many stops is it?', 'Which way is platform B?', 'Is it far?'] },
      { them: "About five stops. It's down the escalator." },
      { me: ['Thank you for your help!', 'Thanks!', 'Okay, thank you.'] }
    ] },
    { id: 'teacher', name: 'Ask a teacher', them: 'Teacher', icon: 'school', call: false, lines: [
      { them: 'Yes, {name}? Do you need something?' },
      { me: ["I don't understand this question.", 'Can you help me, please?', 'Can you explain it again?'] },
      { them: 'Sure. Which part?' },
      { me: ['This part here.', 'Number three.', 'The first step.'] },
      { them: 'Let me show you. Is that clearer now?' },
      { me: ['Yes, thank you.', 'A little. Can you show me one more?', 'Yes, I get it now.'] },
      { them: 'Great. Ask me any time.' },
      { me: ['Thank you, teacher.', 'Thanks!', 'I will.'] }
    ] }
  ];
  const fill = (s) => s.replace('{name}', state().childName || 'me');
  const state = () => A.TG.state;
  const KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
  function phoneNext(g) {
    g.li += 1;
    g.typing = false;
    g.typed = '';
    const line = g.script.lines[g.li];
    if (!line) { T.win(g, { text: g.script.call ? 'Call done!' : 'Well done!', sub: 'You spoke up clearly.', say: 'Well done. You spoke up clearly!' }); return; }
    if (line.them) { T.setTurn(g, 'other', T.solo() ? '' : `${T.nameOf('other')}, read the next line out loud.`); return; }
    T.setTurn(g, 'child', 'Your turn. Pick what to say.');
  }
  T.register({
    id: 'phone', name: 'Phone practice', icon: 'kTalk', tint: '#E3F1EF', ink: '#2F7E79', kind: 'Speaking up', sub: 'Practise calls and everyday chats',
    ages: ['teen'], skill: 'communication',
    init(g) {
      g.script = null;
      g.li = -1;
      g.log = [];
      g.typing = false;
      g.typed = '';
      g.total = 0;
      g.hideTurn = true;
    },
    voice(g) {
      if (!g.script) return 'Pick something to practise.';
      const line = g.script.lines[g.li];
      if (!line) return '';
      if (line.them) return T.solo() ? '' : `${T.nameOf('other')}, read this out loud: ${fill(line.them)}`;
      return 'Your turn. Pick what to say, and Lumi will say it.';
    },
    stage(g) {
      if (!g.script) {
        const list = T.level() === 1 ? SCRIPTS.slice(0, 2) : SCRIPTS;
        return `<div class="col gap24" style="align-items:center"><div class="tg-say tgt-q">What shall we practise?</div>
          <div class="tg-choices">${list.map((s) => `<button class="tg-choice tgt-script" data-a="tg" data-k="script" data-v="${s.id}">${pic(s.icon, 72)}<span>${esc(s.name)}</span></button>`).join('')}</div></div>`;
      }
      const s = g.script;
      const line = s.lines[g.li];
      const bubbles = g.log.slice(-6).map((m) => `<div class="tgt-msg ${m.who}">${esc(m.text)}</div>`).join('');
      const phone = `<div class="tgt-phone"><div class="tgt-phone-top">${pic(s.icon, 40)}<span><b>${esc(s.them)}</b><small>${s.call ? 'On a call' : 'Talking face to face'}</small></span>${s.call ? `<span class="tgt-live">${ic('phone', 18)}</span>` : ''}</div>
        <div class="tgt-msgs">${bubbles || '<span class="muted">...</span>'}</div></div>`;
      let side = '';
      if (line && line.them) {
        side = T.solo()
          ? `<div class="tgt-them">${T.avatar('other', 72)}<span class="muted">Lumi is talking...</span></div>`
          : `<div class="tgt-them">${T.avatar('other', 72)}<span class="tgt-them-h">${esc(T.nameOf('other'))}, read this out loud:</span><div class="tgt-them-line">${esc(fill(line.them))}</div>
            <button class="primary" data-a="tg" data-k="said" style="height:76px">${ic('check', 30)}<span>I said it</span></button></div>`;
      } else if (line && line.me) {
        const n = T.level() === 1 ? 2 : 3;
        if (g.typing) {
          side = `<div class="tgt-type"><div class="tgt-typed">${esc(g.typed) || '<span class="muted">Type what you want to say</span>'}</div>
            <div class="tgt-keys">${KEYS.map((k) => `<button class="key" data-a="tg" data-k="key" data-v="${k}">${k}</button>`).join('')}
            <button class="key wide" data-a="tg" data-k="key" data-v=" ">space</button><button class="key" data-a="tg" data-k="key" data-v="back" aria-label="Delete">${ic('backspace', 22)}</button></div>
            <div class="row gap12"><button class="primary soft-btn" data-a="tg" data-k="typeOff" style="height:64px"><span>Back</span></button><button class="primary ${g.typed.trim() ? '' : 'faded'}" data-a="tg" data-k="sayTyped" style="height:64px">${ic('speaker', 26)}<span>Say it</span></button></div></div>`;
        } else {
          side = `<div class="tgt-mine"><span class="tgt-them-h">What will you say?</span>${line.me.slice(0, n).map((t, i) => `<button class="tgt-line" data-a="tg" data-k="say" data-v="${i}">${ic('speaker', 26)}<span>${esc(fill(t))}</span></button>`).join('')}
            ${T.level() === 3 ? `<button class="tgt-line own" data-a="tg" data-k="typeOn">${ic('text', 26)}<span>Type my own</span></button>` : ''}</div>`;
        }
      }
      return `<div class="tgt-call">${phone}<div class="tgt-callside">${side}</div></div>`;
    },
    guide(g) {
      if (!g.script) return { sel: '.tgt-script', say: 'Pick one.' };
      const line = g.script.lines[g.li];
      if (!line) return null;
      if (line.them) return T.solo() ? null : { sel: '[data-k="said"]', say: 'Read it, then tap I said it.' };
      if (g.typing) return g.typed.trim() ? { sel: '[data-k="sayTyped"]', say: 'Tap Say it.' } : null;
      return { sel: '.tgt-line', say: 'Pick what to say.' };
    },
    tap(g, k, el, d) {
      if (k === 'script') {
        g.script = SCRIPTS.find((s) => s.id === d.v);
        g.total = g.script.lines.filter((l) => l.me).length;
        g.li = -1;
        T.cheer();
        phoneNext(g);
        return;
      }
      const line = g.script && g.script.lines[g.li];
      if (!line) return;
      if (k === 'said') { if (!line.them) return; g.log.push({ who: 'them', text: fill(line.them) }); T.tone(520, 0.1, 0.05); phoneNext(g); return; }
      if (!line.me || g.busy) return;
      if (k === 'say') {
        const t = fill(line.me[Number(d.v)]);
        g.log.push({ who: 'me', text: t }); g.round += 1; g.busy = true; T.say(t); T.render();
        T.later(() => { g.busy = false; if (T.cur() === g) phoneNext(g); }, 1600);
        return;
      }
      if (k === 'typeOn') { g.typing = true; T.render(); return; }
      if (k === 'typeOff') { g.typing = false; T.render(); return; }
      if (k === 'key') { if (d.v === 'back') g.typed = g.typed.slice(0, -1); else if (g.typed.length < 60) g.typed += g.typed ? d.v.toLowerCase() : d.v; T.render(); return; }
      if (k === 'sayTyped') {
        if (!g.typed.trim()) { T.nope(el); return; }
        const t = g.typed.trim();
        g.log.push({ who: 'me', text: t }); g.round += 1; g.typing = false; g.busy = true; T.say(t); T.render();
        T.later(() => { g.busy = false; if (T.cur() === g) phoneNext(g); }, 1600);
      }
    },
    lumiTurn(g) {
      const line = g.script && g.script.lines[g.li];
      if (!line || !line.them) return;
      const t = fill(line.them);
      g.log.push({ who: 'them', text: t });
      T.render();
      T.say(t);
      T.later(() => { if (T.cur() === g && g.script.lines[g.li] === line) phoneNext(g); }, 1800);
    }
  });
})();
