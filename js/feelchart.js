/*
  feelchart.js
  Grown-ups › Progress › "Feelings and breaks": a week at a glance.
  For each day: the feelings the child shared (hard ones stand out), the breaks they asked for, the waiting
  practice, and what was on that day (timetable steps that are not every day, Coming up events, changes
  like a late bus, journal notes). Below it, Lumi points out patterns from the last four weeks in plain
  words, for example "More worried feelings and breaks on days with Bus in the timetable", "Most breaks
  were in the afternoon" or "Most breaks were during Homework". These are hints to look into, not a diagnosis.
  From now on every feeling, break and change is also kept with its time and place (state.log[day].moments).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, render } = A;
  const HARD = ['worried', 'scared', 'angry', 'sad'];
  const FEEL_COL = { happy: '#F4C430', excited: '#F4A259', calm: '#7FC4B8', okay: '#9CCB7A', sad: '#5B8FD9', worried: '#9B87D9', scared: '#4FB3A9', angry: '#E5534B', tired: '#9AA6B2' };

  // ---------------------------------------------------------------- keep the time and place of each moment
  const prevTrack = A.onTrack;
  A.onTrack = (kind, detail, opts) => {
    if (prevTrack) prevTrack(kind, detail, opts);
    if (!['feelings', 'breaks', 'changes', 'calm', 'waits', 'moveBreak', 'comingUp'].includes(kind)) return;
    const k = A.dateKey();
    const day = state.log[k] || (state.log[k] = {});
    const m = day.moments || (day.moments = []);
    const now = new Date();
    let where = '';
    if (S.screen === 'routine' && S.day && S.day.plan[S.day.i]) where = A.stepInfo(S.day.plan[S.day.i]).label;
    else if (kind === 'breaks') where = detail || '';
    m.push({ t: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, k: kind, d: typeof detail === 'string' ? detail.slice(0, 40) : '', w: where });
    if (m.length > 60) m.splice(0, m.length - 60);
    A.save();
  };

  // ---------------------------------------------------------------- the days
  const keyOf = (d) => A.dateKey(d);
  function weekDays(offset) {
    const now = new Date();
    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) - offset * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  }
  const dayId = (d) => D.DAYS[(d.getDay() + 6) % 7].id;
  const logOf = (d) => state.log[keyOf(d)] || {};
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
  const hardOf = (lg) => HARD.reduce((t, f) => t + ((lg.feelings || {})[f] || 0), 0);
  const active = (lg) => Object.keys(lg).some((k) => k !== 'moments');
  // steps that are on some days but not every day (they are what makes a day different)
  // max 4: steps that make a day stand out (for the chart); max 6: any step that is not on every day (for patterns)
  function specialSteps(max) {
    const cnt = {};
    D.DAYS.forEach((d) => { const seen = new Set((state.week[d.id] || []).map((s) => s.custom ? 'c:' + s.custom : s.id)); seen.forEach((id) => { cnt[id] = (cnt[id] || 0) + 1; }); });
    return new Set(Object.keys(cnt).filter((id) => cnt[id] <= (max || 4)));
  }
  function happenings(d, special) {
    const out = [];
    (state.week[dayId(d)] || []).forEach((s) => {
      const id = s.custom ? 'c:' + s.custom : s.id;
      if (special.has(id) && !out.some((o) => o.id === id)) { const info = A.stepInfo(s); out.push({ id, label: info.label, art: A.stepArt(info, 26) }); }
    });
    (state.comingUp || []).filter((e) => e.date === keyOf(d)).forEach((e) => out.push({ id: 'cu:' + e.id, label: e.title, art: ic('kStories', 26) }));
    const lg = logOf(d);
    if (lg.changes) out.push({ id: 'change', label: lg.changes > 1 ? `${lg.changes} plan changes` : 'Plan changed', art: ic('wDifferent', 26) });
    (state.journal || []).filter((j) => String(j.when || '').slice(0, 10) === keyOf(d)).forEach((j) => out.push({ id: 'j', label: `Journal: ${(j.tags || []).slice(0, 2).join(', ') || j.mood || 'note'}`, art: ic('journal', 26) }));
    return out;
  }

  // ---------------------------------------------------------------- patterns (last 4 weeks)
  function patterns() {
    const days = [];
    for (let i = 27; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const used = days.filter((d) => active(logOf(d)));
    if (used.length < 5) return [`${ic('clock', 16)} Patterns show here after about a week of using Lumi (${used.length} day${used.length === 1 ? '' : 's'} so far).`];
    const out = [];
    const load = (d) => hardOf(logOf(d)) + (logOf(d).breaks || 0);
    const avg = (arr) => (arr.length ? arr.reduce((t, d) => t + load(d), 0) / arr.length : 0);
    // occasional timetable steps (on 4 days or fewer)
    const special = specialSteps(4);
    const found = [];
    special.forEach((id) => {
      const withIt = used.filter((d) => (state.week[dayId(d)] || []).some((s) => (s.custom ? 'c:' + s.custom : s.id) === id));
      const without = used.filter((d) => !withIt.includes(d));
      if (withIt.length < 2 || !without.length) return;
      const a = avg(withIt);
      const b = avg(without);
      const s = (state.week[dayId(withIt[0])] || []).find((x) => (x.custom ? 'c:' + x.custom : x.id) === id);
      const label = s ? A.stepInfo(s).label : id;
      if (a >= 1 && a >= b + 0.8) found.push([a - b, `${ic('up', 16)} More worried or upset feelings and breaks on days with <b>${esc(label)}</b> in the timetable (about ${a.toFixed(1)} a day, compared with ${b.toFixed(1)} on other days).`]);
      else if (b >= 1 && b >= a + 0.8) found.push([b - a, `${ic('down', 16)} Calmer on days with <b>${esc(label)}</b> (about ${a.toFixed(1)} hard moments a day, compared with ${b.toFixed(1)} on other days).`]);
    });
    found.sort((x, y) => y[0] - x[0]).slice(0, 2).forEach((f) => out.push(f[1]));
    // school days (steps on most weekdays) compared with days off
    const cnt = {};
    D.DAYS.forEach((d) => new Set((state.week[d.id] || []).map((x) => x.id)).forEach((id) => { cnt[id] = (cnt[id] || 0) + 1; }));
    const weekly = Object.keys(cnt).filter((id) => cnt[id] >= 5 && cnt[id] <= 6);
    if (weekly.length) {
      const isSchool = (d) => (state.week[dayId(d)] || []).some((x) => weekly.includes(x.id));
      const on = used.filter(isSchool);
      const off = used.filter((d) => !isSchool(d));
      const name = weekly.includes('school') ? 'school days' : weekly.includes('bus') ? 'bus days' : 'weekdays';
      if (on.length >= 2 && off.length >= 2) {
        const a = avg(on);
        const b = avg(off);
        if (a >= 1 && a >= b + 0.8) out.push(`${ic('school', 16)} Harder on <b>${name}</b> (about ${a.toFixed(1)} hard moments a day, compared with ${b.toFixed(1)} on days off).`);
        else if (b >= 1 && b >= a + 0.8) out.push(`${ic('home', 16)} Harder on <b>days off</b> (about ${b.toFixed(1)} hard moments a day, compared with ${a.toFixed(1)} on ${name}). Days off may need more structure.`);
      }
    }
    // changes of plan
    const chDays = used.filter((d) => logOf(d).changes);
    if (chDays.length >= 2) {
      const a = avg(chDays);
      const b = avg(used.filter((d) => !logOf(d).changes));
      if (a >= b + 0.8) out.push(`${ic('wDifferent', 16)} Days with a change of plan (like a late bus) were harder (about ${a.toFixed(1)} hard moments, compared with ${b.toFixed(1)}). A Coming up story can help before known changes.`);
    }
    // when and where the breaks were
    const moments = used.flatMap((d) => (logOf(d).moments || []).map((m) => Object.assign({ day: d }, m)));
    const breaks = moments.filter((m) => m.k === 'breaks');
    if (breaks.length >= 3) {
      const part = (t) => { const h = Number(t.slice(0, 2)); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };
      const byPart = {};
      breaks.forEach((m) => { byPart[part(m.t)] = (byPart[part(m.t)] || 0) + 1; });
      const top = Object.entries(byPart).sort((a, b) => b[1] - a[1])[0];
      if (top[1] / breaks.length >= 0.5) out.push(`${ic('clock', 16)} Most breaks were in the <b>${top[0]}</b> (${top[1]} of ${breaks.length}).`);
      const byWhere = {};
      breaks.filter((m) => m.w).forEach((m) => { byWhere[m.w] = (byWhere[m.w] || 0) + 1; });
      const topW = Object.entries(byWhere).sort((a, b) => b[1] - a[1])[0];
      if (topW && topW[1] >= 2) out.push(`${ic('kBreak', 16)} Breaks happened most often during <b>${esc(topW[0])}</b> (${topW[1]} times).`);
    }
    // weekdays
    const byDay = {};
    used.forEach((d) => { const id = dayId(d); (byDay[id] = byDay[id] || []).push(load(d)); });
    const dayAvg = Object.entries(byDay).filter(([, v]) => v.length >= 2).map(([id, v]) => [id, v.reduce((a, b) => a + b, 0) / v.length]);
    if (dayAvg.length >= 3) {
      const all = dayAvg.reduce((t, x) => t + x[1], 0) / dayAvg.length;
      const top = dayAvg.sort((a, b) => b[1] - a[1])[0];
      if (top[1] >= 1.5 && top[1] >= all * 1.8) out.push(`${ic('calendar', 16)} <b>${esc(D.DAYS.find((x) => x.id === top[0]).name)}s</b> tend to be harder than other days.`);
    }
    // waiting practice
    const wp = state.waitPractice;
    if (wp && wp.times) {
      const best = Math.max(0, ...Object.values(wp.best || {}));
      const fav = Object.entries(wp.used || {}).sort((a, b) => b[1] - a[1])[0];
      out.push(`${ic('hourglass', 16)} Waiting practice: ${wp.times} time${wp.times === 1 ? '' : 's'}, longest wait <b>${best} seconds</b>${fav ? `; what helps most while waiting: <b>${{ breathe: 'breathing', count: 'counting', squeeze: 'squeezing', look: 'looking around' }[fav[0]]}</b>` : ''}.`);
    }
    if (out.length === (wp && wp.times ? 1 : 0)) out.unshift(`${ic('check', 16)} No clear patterns in the last four weeks. Feelings and breaks are spread across the week.`);
    return out;
  }

  // ---------------------------------------------------------------- the chart
  A.feelChartHtml = () => {
    const off = S.fcWeek || 0;
    const days = weekDays(off);
    const special = specialSteps();
    const today = A.dateKey();
    const maxDots = 6;
    const dots = (lg) => {
      const list = [];
      Object.entries(lg.feelings || {}).sort((a, b) => (HARD.includes(b[0]) ? 1 : 0) - (HARD.includes(a[0]) ? 1 : 0)).forEach(([f, n]) => { for (let i = 0; i < n; i++) list.push(f); });
      const shown = list.slice(0, maxDots).map((f) => `<span class="fc-feel ${HARD.includes(f) ? 'hard' : ''}" title="${esc(f)}">${A.D.FEELINGS[f] ? L.face(f, 26) : `<i style="background:${FEEL_COL[f] || '#C9D1D9'}"></i>`}</span>`).join('');
      return shown + (list.length > maxDots ? `<span class="fc-more">+${list.length - maxDots}</span>` : '');
    };
    const cols = days.map((d) => {
      const lg = logOf(d);
      const k = keyOf(d);
      const future = k > today;
      const brk = lg.breaks || 0;
      const hap = happenings(d, special);
      return `<div class="fc-col ${k === today ? 'today' : ''} ${future ? 'future' : ''} ${!active(lg) && !future ? 'quiet' : ''}">
        <div class="fc-day"><b>${D.DAYS[(d.getDay() + 6) % 7].short}</b><span>${d.getDate()}/${d.getMonth() + 1}</span></div>
        <div class="fc-cell fc-feels">${dots(lg) || (future ? '' : '<span class="fc-none">-</span>')}</div>
        <div class="fc-cell fc-brks">${brk ? `${ic('kBreak', 24)}<b>${brk}</b>` : future ? '' : '<span class="fc-none">-</span>'}</div>
        <div class="fc-cell fc-wait">${lg.waitSecs ? `${ic('hourglass', 22)}<span>${lg.waitSecs}s</span>` : ''}</div>
        <div class="fc-cell fc-haps">${hap.map((h) => `<span class="fc-hap" title="${esc(h.label)}" role="img" aria-label="${esc(h.label)}">${h.art}</span>`).join('')}</div>
      </div>`;
    }).join('');
    const label = off === 0 ? 'This week' : off === 1 ? 'Last week' : `${off} weeks ago`;
    const hard = days.reduce((t, d) => t + hardOf(logOf(d)), 0);
    const brks = days.reduce((t, d) => t + (logOf(d).breaks || 0), 0);
    const good = days.reduce((t, d) => t + sum(logOf(d).feelings) - hardOf(logOf(d)), 0);
    return `<div class="fc">
      <div class="row between"><h2 class="g-h">Feelings and breaks</h2>
        <div class="row gap8"><button class="mini-btn bordered" data-a="fcWeek" data-v="1" aria-label="Earlier week">${ic('back', 16)}</button><span class="fc-week">${label}</span><button class="mini-btn bordered" data-a="fcWeek" data-v="-1" aria-label="Later week" ${off === 0 ? 'disabled' : ''}>${ic('arrow', 16)}</button></div></div>
      <p class="g-note">${good} happy or calm moments, ${hard} hard moments (worried, scared, sad, angry) and ${brks} break${brks === 1 ? '' : 's'}. The bottom row shows what was different about each day.</p>
      <div class="fc-grid">
        <div class="fc-col fc-labels"><div class="fc-day"></div><div class="fc-cell">Feelings</div><div class="fc-cell">Breaks</div><div class="fc-cell">Waiting</div><div class="fc-cell">That day</div></div>
        ${cols}
      </div>
      ${(() => {
        // the names go in a list under the chart (the columns are too narrow for words)
        const rows = days.map((d) => ({ d, hap: happenings(d, special) })).filter((r) => r.hap.length);
        return rows.length ? `<ul class="fc-haplist">${rows.map((r) => `<li><b>${D.DAYS[(r.d.getDay() + 6) % 7].short}</b><span>${r.hap.map((h) => esc(h.label)).join(', ')}</span></li>`).join('')}</ul>` : '';
      })()}
      <div class="g-sub-h">What Lumi noticed (last 4 weeks)</div>
      <ul class="insights fc-pat">${patterns().map((t) => `<li>${t.replace(/^(<svg[\s\S]*?<\/svg>)\s*/, '$1<span>')}</span></li>`).join('')}</ul>
      <p class="g-note">These are hints to look into together, not a diagnosis. Share them with a teacher or therapist if they help.</p>
    </div>`;
  };
  Object.assign(A.ACTIONS, {
    fcWeek: (d) => { S.fcWeek = Math.max(0, Math.min(8, (S.fcWeek || 0) + Number(d.v))); render(); }
  });
})();
