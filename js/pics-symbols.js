/*
  pics-symbols.js
  Drawn pictures (in place of emoji) for symbols, feeling faces, hands and gestures, and actions.
  - Feeling faces are round faces in Lumi's own feeling-face style.
  - Hands are soft shaded hands in the people's skin tone.
  - Actions (running, swimming, walking, breathing, superhero, covering ears...) show Lumi doing them,
    drawn when needed so they wear the child's own Lumi look.
  Everything is on a 48 x 48 grid and registered with LP.add (see pics.js).
*/
(function () {
  'use strict';
  const LP = window.LP;
  if (!LP) return;
  const K = LP.INK;
  const v = (m, c, o) => LP.vol(m, c, o);
  const SK = '#F3C9A3';
  const SK2 = '#C98F62';
  const add = (key, label, svg) => LP.add(key, { label, svg });
  const wrap = (size, cls, label, inner) => `<svg class="pic ${cls || ''}" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${label}">${inner}</svg>`;
  const addFn = (key, label, inner) => LP.add(key, { label, fn: (size, cls) => wrap(size, cls, label, inner()) });
  const stroke = (d, c, w, extra) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra || ''}/>`;
  // a thick shaded line with a soft outline (arrows, fingers, notes)
  const bar = (d, c, w) => `${stroke(d, K, w + 2.4, ' stroke-opacity=".5"')}${stroke(d, c, w)}`;

  // ---------------------------------------------------------------- feeling faces (Lumi's style)
  const EYES = `<circle cx="17.5" cy="22" r="2.5" fill="${K}"/><circle cx="30.5" cy="22" r="2.5" fill="${K}"/><circle cx="18.4" cy="21.1" r=".8" fill="#fff"/><circle cx="31.4" cy="21.1" r=".8" fill="#fff"/>`;
  const SHUT = stroke('M14 22.5 q3.5 -4 7 0 M27 22.5 q3.5 -4 7 0', K, 2.2);
  const SLEEP = stroke('M14 22 q3.5 3.5 7 0 M27 22 q3.5 3.5 7 0', K, 2.2);
  const BLUSH = '<ellipse cx="13.5" cy="28" rx="3" ry="1.8" fill="#F08A80" opacity=".5"/><ellipse cx="34.5" cy="28" rx="3" ry="1.8" fill="#F08A80" opacity=".5"/>';
  const SMILE = stroke('M17 29 Q24 35 31 29', K, 2.2);
  const OPEN = `<path d="M15.5 28 Q24 39 32.5 28 Z" fill="#9A3E44" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M19.5 33.2 Q24 35.6 28.5 33.2 Q24 31 19.5 33.2z" fill="#E5737A"/>`;
  const face = (c, inner) => `${LP.drop(24, 45, 15, 2.6)}${v('<circle cx="24" cy="24" r="19"/>', c)}${inner}`;
  add('\u{1F600}', 'Happy face', face('#F4D35E', `${EYES}${BLUSH}${OPEN}`));
  add('\u{1F601}', 'Big grin', face('#F4D35E', `${SHUT}${BLUSH}<path d="M14.5 27.5 Q24 38 33.5 27.5 Z" fill="#fff" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M15.5 28.5h17M20 28.5v4.6M24 28.5v5.4M28 28.5v4.6" stroke="#D5DBE1" stroke-width="1"/>`));
  add('\u{1F604}', 'Great', face('#FFC94D', `${SHUT}${BLUSH}${OPEN}`));
  add('\u{1F642}', 'Good', face('#F7DC7A', `${EYES}${BLUSH}${SMILE}`));
  add('\u{1F610}', 'Okay', face('#E9DDB0', `${EYES}${stroke('M18 31 H30', K, 2.2)}`));
  add('\u{1F611}', 'Bored', face('#D8CFC4', `${stroke('M14.5 22 h6 M27.5 22 h6', K, 2.4)}${stroke('M18 31 H30', K, 2.2)}`));
  add('\u{1F61F}', 'Hard', face('#B9A6E0', `${stroke('M13.5 18.5 l6 -2.5 M34.5 18.5 l-6 -2.5', K, 2)}${EYES}${stroke('M16.5 32 Q20.25 29 24 32 Q27.75 35 31.5 32', K, 2.2)}`));
  add('\u{1F622}', 'Very sad', face('#8EB8E5', `${stroke('M14 18.5 l6 -2.4 M34 18.5 l-6 -2.4', K, 2)}${EYES}${stroke('M18 33 Q24 28 30 33', K, 2.2)}<path d="M31.5 26 q-2.6 4.4 0 6 q2.6 -1.6 0 -6z" fill="#4E9BE0" stroke="#2F6FB0" stroke-width=".8"/>${LP.shine(31, 29.5, 0.6, 1.2)}`));
  add('\u{1F62E}', 'Surprised', face('#F7C59F', `${stroke('M14 16.5 q3.5 -2.5 7 -1 M27 15.5 q3.5 -1.5 7 1', K, 2)}<circle cx="17.5" cy="22" r="3" fill="${K}"/><circle cx="30.5" cy="22" r="3" fill="${K}"/><circle cx="18.5" cy="21" r=".9" fill="#fff"/><circle cx="31.5" cy="21" r=".9" fill="#fff"/><ellipse cx="24" cy="31.5" rx="3.6" ry="4.4" fill="#9A3E44" stroke="${K}" stroke-width="2"/>`));
  add('\u{1F634}', 'Tired', face('#C9C3E6', `${SLEEP}${stroke('M19.5 31 Q24 33 28.5 31', K, 2.2)}<text x="36" y="13" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="10" fill="#6B5BAE" stroke="#fff" stroke-width="2" paint-order="stroke">z</text><text x="41" y="7" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="7" fill="#6B5BAE" stroke="#fff" stroke-width="1.6" paint-order="stroke">z</text>`));
  add('\u{1F60C}', 'Calm', face('#A8D8CF', `${SLEEP}${BLUSH}${SMILE}`));
  add('\u{1F912}', 'Sick', face('#B5D99C', `${stroke('M14 18.5 l6 -2.4 M34 18.5 l-6 -2.4', K, 2)}${EYES}${stroke('M19 32 Q24 30 29 32', K, 2.2)}<ellipse cx="13.5" cy="27.5" rx="3.4" ry="2" fill="#E5534B" opacity=".45"/><ellipse cx="34.5" cy="27.5" rx="3.4" ry="2" fill="#E5534B" opacity=".45"/>
    <g transform="rotate(-28 33 34)">${v('<rect x="27" y="32.5" width="16" height="4" rx="2"/>', '#FFFFFF')}<rect x="27.6" y="33.6" width="6" height="1.8" rx=".9" fill="#E5534B"/></g>`));
  add('\u{1F915}', 'Hurt', face('#F4C27A', `${stroke('M14.5 20 l5.5 -2 M33.5 20 l-5.5 -2', K, 2)}${EYES}${stroke('M18.5 32.5 Q24 29 29.5 32.5', K, 2.2)}<g transform="rotate(-18 24 11)">${v('<rect x="9" y="7" width="30" height="8" rx="3"/>', '#FFF8EC', { lineOpacity: 0.4 })}<path d="M21 8.5v5M24 8.5v5M27 8.5v5" stroke="#E6C8A0" stroke-width="1"/></g>`));
  add('\u{1F927}', 'Sneezing', face('#F7B6B0', `${SHUT}${stroke('M20 31 q2 -2 4 0', K, 2)}${v('<path d="M26 27c6-4 14-2 16 4 2 7-6 11-12 9-5-1-8-8-4-13z"/>', '#FFFFFF', { lineOpacity: 0.4 })}<path d="M31 30q4 -1 7 2M30 34q4 0 7 2" stroke="#D8E0E8" stroke-width="1.2" fill="none"/>`));
  add('\u{1F929}', 'Excited', face('#FFC94D', `${[17.5, 30.5].map((x) => v(`<path d="M${x} 17.5l1.6 3.2 3.5.5-2.5 2.4.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.5-2.4 3.5-.5z"/>`, '#FFFFFF', { lineOpacity: 0.7, lineColour: '#E07A1E' })).join('')}${BLUSH}${OPEN}`));
  add('\u{1F970}', 'Loved', face('#F7A8C4', `${SHUT}${BLUSH}${SMILE}${[[8, 10, 0.32], [40, 13, 0.26], [38, 38, 0.3]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">${v('<path d="M0 10C-12 2-12-8-5-10-2-11 0-8 0-6c0-2 2-5 5-4 7 2 7 12-5 20z"/>', '#E5534B', { lineWidth: 4 })}</g>`).join('')}`));
  add('\u{1F92B}', 'Quiet', face('#C9E4F5', `${EYES}${stroke('M19 31 H29', K, 2.2)}${bar('M24 38 V27', SK, 4.6)}${v('<ellipse cx="24" cy="40" rx="5" ry="4"/>', SK)}`));
  add('\u{1F916}', 'Friendly robot', `${LP.drop(24, 45, 15, 2.6)}${bar('M24 9 V4', '#9AA6B2', 2)}${v('<circle cx="24" cy="4" r="2.6"/>', '#E5534B')}${v('<rect x="6" y="9" width="36" height="33" rx="9"/>', '#B8C4D0')}${v('<rect x="2" y="20" width="5" height="11" rx="2.5"/><rect x="41" y="20" width="5" height="11" rx="2.5"/>', '#8A97A6')}
    ${v('<rect x="12" y="16" width="9" height="9" rx="2.5"/><rect x="27" y="16" width="9" height="9" rx="2.5"/>', '#5FD1E8')}${LP.shine(14.5, 18.5, 1.2, 1.2)}${LP.shine(29.5, 18.5, 1.2, 1.2)}${v('<rect x="14" y="30" width="20" height="6" rx="3"/>', '#5A6878')}<path d="M19 30v6M24 30v6M29 30v6" stroke="#B8C4D0" stroke-width="1.2"/>`);

  // ---------------------------------------------------------------- hands
  // a hand: fingers (thick lines) and a palm, drawn as one shape with one soft outline
  const hand = (fingers, palm, skin, w) => {
    const c = skin || SK;
    const fw = w || 5.4;
    return `${fingers.map((d) => stroke(d, K, fw + 2.4, ' stroke-opacity=".5"')).join('')}<g fill="none" stroke="${K}" stroke-opacity=".5" stroke-width="2.4">${palm}</g>
      <g fill="${c}">${palm}</g>${fingers.map((d) => stroke(d, c, fw)).join('')}<g fill="url(#lpShade)">${palm}</g>`;
  };
  const sleeve = (x, y, w, h, c) => v(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`, c || '#5B8FD9');
  const OPENHAND = hand(['M17 24 V10', 'M22 23 V7', 'M27 23 V8', 'M31.5 25 V12', 'M14.5 32 L8.5 24.5'], '<rect x="13" y="21" width="22" height="20" rx="9"/>');
  add('\u270B', 'Stop, please', `${LP.drop(24, 46, 12, 2)}${sleeve(16, 39, 16, 8)}${OPENHAND}${stroke('M18 32 q6 3 12 0', SK2, 1.2)}`);
  add('\u{1F44B}', 'Wave', `${stroke('M38 9 q4 4 3 9 M42 6 q5 6 3 13', '#7BA7D9', 2)}${stroke('M8 30 q-3 5 -1 10', '#7BA7D9', 2)}<g transform="rotate(-18 24 32)">${sleeve(16, 39, 16, 8)}${OPENHAND}</g>`);
  add('\u270A', 'Squeeze', `${LP.drop(24, 46, 12, 2)}${sleeve(15, 37, 18, 9)}${hand([], '<rect x="11" y="18" width="26" height="22" rx="9"/><circle cx="15.5" cy="18" r="4.6"/><circle cx="21.5" cy="16.5" r="4.8"/><circle cx="27.5" cy="16.5" r="4.8"/><circle cx="33" cy="18.5" r="4.4"/>')}${stroke('M18.5 16 v6 M24.5 15 v7 M30.5 16 v6', SK2, 1.3)}${bar('M13 29 Q21 32.5 30 27', SK, 5.6)}`);
  add('\u{1F44D}', 'Thumbs up', `${LP.drop(22, 46, 12, 2)}${sleeve(33, 24, 9, 15)}${hand(['M19 23 V8'], '<rect x="11" y="21" width="24" height="19" rx="8"/>', SK, 6.4)}${stroke('M13 28 h18 M13 33.5 h18', SK2, 1.3)}`);
  add('\u{1F44F}', 'Clap', `${stroke('M24 4 v5 M15 7 l3 4 M33 7 l-3 4', '#F4B400', 2.2)}<g transform="translate(-3 4) rotate(-16 24 32) scale(.86)">${OPENHAND}</g><g transform="translate(51 4) scale(-1 1) rotate(-16 24 32) scale(.86)">${hand(['M17 24 V10', 'M22 23 V7', 'M27 23 V8', 'M31.5 25 V12', 'M14.5 32 L8.5 24.5'], '<rect x="13" y="21" width="22" height="20" rx="9"/>', '#E6B48A')}</g>`);
  add('\u{1F90F}', 'Just a little', `${LP.drop(24, 46, 12, 2)}${sleeve(10, 36, 14, 10)}${hand(['M23 25 C23 15 28 11.5 34 13', 'M15.5 31 C14 23 22 20 30.5 20'], '<rect x="11" y="24" width="20" height="16" rx="8"/>', SK, 5)}${stroke('M35.5 15.5 l3 1.5 M33.5 19.5 l3 -0.5', '#F4B400', 1.6)}`);
  add('\u{1F91D}', 'Hold hands', `${LP.drop(24, 44, 18, 2.4)}${sleeve(1, 20, 9, 14, '#5B8FD9')}${sleeve(38, 19, 9, 14, '#E0913E')}${hand([], '<ellipse cx="19" cy="27.5" rx="11" ry="8"/>', SK)}${hand(['M29 21 Q22 22 19 27', 'M30 26 Q23 27 20 31.5', 'M30 31 Q25 32 22 35'], '<ellipse cx="31" cy="27" rx="9" ry="8"/>', '#C98F62', 4.2)}`);
  add('\u{1F932}', 'Show me', `${LP.drop(24, 45, 18, 2.4)}${hand(['M7 20 q-2 -6 1 -9', 'M41 20 q2 -6 -1 -9'], '<path d="M5 22 q1 15 18 18 v-9 q-11 -2 -13 -11z"/><path d="M43 22 q-1 15 -18 18 v-9 q11 -2 13 -11z"/>', SK, 4.4)}${stroke('M23 31 v9 M25 31 v9', SK2, 1.1)}`);
  add('\u{1FAF4}', 'Can you open it?', `${LP.drop(24, 44, 18, 2.4)}${sleeve(1, 23, 9, 14)}${hand(['M26 26 Q28 18 33 16.5'], '<path d="M9 25 q12 -3 22 1 h11 a3 3 0 0 1 0 6 h-10 q-3 6 -12 6.5 q-7 .5 -11 -3z"/>', SK, 4.6)}${stroke('M31 29 h10 M14 31 q7 2 14 -1', SK2, 1.2)}`);
  add('\u{1F440}', 'Watch', `${[13.5, 34.5].map((x) => `${v(`<ellipse cx="${x}" cy="24" rx="10" ry="12.5"/>`, '#FFFFFF')}<circle cx="${x + 3.4}" cy="25" r="5.4" fill="#7A5236"/><circle cx="${x + 3.8}" cy="25" r="3" fill="${K}"/><circle cx="${x + 2.4}" cy="23.4" r="1.2" fill="#fff"/>`).join('')}`);
  add('\u{1F442}', 'Listen', `${LP.drop(24, 46, 10, 2)}${v('<path d="M30 6C18 4 11 13 12.5 23c1 6 4 9 6.5 13 2.4 4 6.4 6 10 3 3-2.4 2-6 0-9-2-4 5-6.6 7-12.6C38.5 9.6 36 7 30 6z"/>', SK)}${stroke('M29 13 C22 12 19 17 21 22 c1.6 3.6 5.6 3.6 5.6 7', SK2, 2.2)}`);
  add('\u{1F443}', 'Nose', `${v('<circle cx="24" cy="24" r="20"/>', SK)}${EYES}${v('<path d="M24 20 C24 26 20 29 19.5 31.5 c-.4 2.4 2 3.4 4.5 3 2.6.4 5-.6 4.5-3 -.5-2.5-4.5-5.5-4.5-11.5z"/>', '#EDB58C')}<circle cx="21.8" cy="32.4" r="1" fill="${SK2}"/><circle cx="26.2" cy="32.4" r="1" fill="${SK2}"/>${stroke('M37 10 l3 -3 M40 15 l4 -1', '#F4B400', 1.8)}`);

  // ---------------------------------------------------------------- Lumi doing things (drawn with the child's own Lumi)
  function lumi(x, y, size, opts) {
    const L = window.Lumi;
    if (!L) return '';
    let look = {};
    try { look = window.LumiApp && window.LumiApp.lookWith ? window.LumiApp.lookWith({ spark: 'none' }) : {}; } catch (e) { look = {}; }
    const o = opts || {};
    return L.svg({ look: Object.assign({}, look, o.look || {}), mood: o.mood || 'happy', size, wave: !!o.wave }).replace('<svg class="lumi"', `<svg x="${x}" y="${y}"`);
  }
  const lumiColour = () => {
    try { const look = window.LumiApp.lookWith(); return window.Lumi.COLORS[look.color].body; } catch (e) { return '#F2A65A'; }
  };
  addFn('\u{1F3C3}', 'Run', () => `${stroke('M3 16 h9 M1 24 h11 M4 32 h8', '#9AB3D0', 2.4)}${LP.drop(28, 45, 14, 2.2)}<g transform="rotate(10 28 26)">${lumi(9, 5, 40, { mood: 'excited' })}</g><circle cx="13" cy="42" r="2.6" fill="#E3D6C3"/><circle cx="8" cy="43" r="1.8" fill="#E3D6C3"/>`);
  addFn('\u{1F3CA}', 'Swim', () => `${lumi(6, 1, 36, { mood: 'excited' })}<path d="M0 30 q6 -4 12 0 t12 0 t12 0 t12 0 V48 H0z" fill="#5BB6E6"/><path d="M0 30 q6 -4 12 0 t12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M0 38 q6 -3 12 0 t12 0 t12 0 t12 0" fill="none" stroke="#9ED6F2" stroke-width="2"/>${LP.shine(10, 42, 4, 1)}`);
  addFn('\u{1F6B6}', 'Walk', () => `${lumi(5, 1, 38)}${[[8, 44, -12], [16, 40, 12], [32, 44, -12], [40, 40, 12]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="3.4" fill="#C9B9A2" transform="rotate(${r} ${x} ${y})"/>`).join('')}`);
  addFn('\u{1F9D8}', 'Take a big breath', () => `<circle cx="24" cy="24" r="22" fill="#E6DFF8"/><circle cx="24" cy="24" r="22" fill="none" stroke="#C9B8EE" stroke-width="2" stroke-dasharray="3 4"/>${lumi(6, 6, 36, { mood: 'calm' })}`);
  addFn('\u{1F9B8}', 'Superhero', () => `${LP.drop(24, 46, 14, 2.2)}${lumi(4, 3, 40, { mood: 'excited', look: { back: 'cape' } })}${[[6, 8], [41, 10], [42, 30]].map(([x, y]) => v(`<path d="M${x} ${y - 3.4} Q${x} ${y} ${x + 3.4} ${y} Q${x} ${y} ${x} ${y + 3.4} Q${x} ${y} ${x - 3.4} ${y} Q${x} ${y} ${x} ${y - 3.4}Z"/>`, '#FFD23F', { lineOpacity: 0.3 })).join('')}`);
  addFn('\u{1F645}', 'No', () => `${lumi(2, 4, 36, { mood: 'worried' })}${v('<circle cx="36" cy="35" r="10"/>', '#E5534B')}${stroke('M32 31 l8 8 M40 31 l-8 8', '#fff', 3)}`);
  addFn('\u{1F646}', 'Big arms', () => { const c = lumiColour(); return `${bar('M11 30 C3 14 12 3 24 3 C36 3 45 14 37 30', c, 6)}${lumi(5, 9, 38, { mood: 'excited' })}`; });
  addFn('\u{1F649}', 'Cover my ears', () => { const c = lumiColour(); return `${stroke('M2 8 l5 4 M2 16 h5 M46 8 l-5 4 M46 16 h-5', '#9AB3D0', 2)}${lumi(4, 4, 40, { mood: 'calm' })}${v('<ellipse cx="14.6" cy="14.6" rx="5.4" ry="6"/><ellipse cx="33.4" cy="14.6" rx="5.4" ry="6"/>', c)}`; });
  addFn('\u{1F5E3}', 'Speak up', () => `${lumi(0, 6, 34, { mood: 'excited' })}${stroke('M34 18 q4 6 0 12 M38.5 14 q6 10 0 20 M43 10 q8 14 0 28', '#2F7E79', 2.4)}`);

  // ---------------------------------------------------------------- time
  add('\u23F0', 'Alarm clock', `${LP.drop(24, 46, 14, 2.2)}${bar('M14 40 l-3 5 M34 40 l3 5', '#8A97A6', 2)}${v('<circle cx="12" cy="11" r="6"/><circle cx="36" cy="11" r="6"/>', '#F4B400')}${v('<circle cx="24" cy="27" r="16"/>', '#E5534B')}${v('<circle cx="24" cy="27" r="11.5"/>', '#FFFFFF', { lineOpacity: 0.3 })}
    ${[0, 90, 180, 270].map((a) => `<rect x="23.3" y="16.6" width="1.4" height="2.6" rx=".7" fill="#9AA6B2" transform="rotate(${a} 24 27)"/>`).join('')}${stroke('M24 27 V19.5 M24 27 l5.5 3', K, 2.2)}<circle cx="24" cy="27" r="1.6" fill="${K}"/>`);
  add('\u23F1', 'Timer', `${LP.drop(24, 46, 13, 2.2)}${v('<rect x="20" y="3" width="8" height="5" rx="2"/><rect x="34.5" y="10" width="5" height="4" rx="1.5" transform="rotate(40 37 12)"/>', '#8A97A6')}${v('<circle cx="24" cy="27" r="16"/>', '#C9D1D9')}${v('<circle cx="24" cy="27" r="12"/>', '#FFFFFF', { lineOpacity: 0.3 })}
    <path d="M24 27 L24 15 A12 12 0 0 1 34.4 21 Z" fill="#8FD19E" opacity=".75"/>${stroke('M24 27 L31 19', '#E5534B', 2.4)}<circle cx="24" cy="27" r="1.8" fill="${K}"/>`);
  add('\u23F3', 'Wait', `${LP.drop(24, 46, 13, 2)}${v('<path d="M14 9 h20 c0 9 -7 11 -7 15 s7 6 7 15 h-20 c0 -9 7 -11 7 -15 s-7 -6 -7 -15z"/>', '#DDEEF8', { lineOpacity: 0.4 })}<path d="M16.5 12 h15 c-1 5 -6 7 -7.5 9 c-1.5 -2 -6.5 -4 -7.5 -9z" fill="#F2C063"/><path d="M15.5 37.5 c1 -5 5 -7 8.5 -7 s7.5 2 8.5 7z" fill="#F2C063"/><path d="M24 24 v7" stroke="#F2C063" stroke-width="1.4"/>
    <path d="M14 9 h20 c0 9 -7 11 -7 15 s7 6 7 15 h-20 c0 -9 7 -11 7 -15 s-7 -6 -7 -15z" fill="url(#lpGlass)"/>${v('<rect x="10" y="4" width="28" height="6" rx="3"/><rect x="10" y="38" width="28" height="6" rx="3"/>', '#B07D4F')}`);
  add('\u23F8', 'Break', `${LP.drop(24, 46, 14, 2.2)}${v('<circle cx="24" cy="24" r="19"/>', '#7E64C8')}${v('<rect x="16" y="14" width="5.6" height="20" rx="2.4"/><rect x="26.4" y="14" width="5.6" height="20" rx="2.4"/>', '#FFFFFF', { lineOpacity: 0.25 })}`);

  // ---------------------------------------------------------------- signs and symbols
  const arrowHead = (x, y, rot, c) => `<g transform="translate(${x} ${y}) rotate(${rot})">${v('<path d="M0 -6.5 L7 0 L0 6.5 Z"/>', c)}</g>`;
  add('\u267B', 'Recycle and return', `${[0, 120, 240].map((a) => `<g transform="rotate(${a} 24 25)">${bar('M14.6 15.5 A13 13 0 0 1 30 12.6', '#4FA85E', 5)}${arrowHead(31.5, 13.4, 22, '#4FA85E')}</g>`).join('')}`);
  add('\u267F', 'Wheelchair accessible', `${v('<rect x="4" y="4" width="40" height="40" rx="10"/>', '#2E6FB7')}<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 20 a9.5 9.5 0 1 0 12 12"/><path d="M22 15 v11 h8 l4 8"/><path d="M22 21 h7"/></g><circle cx="22" cy="10.5" r="3" fill="#fff"/>`);
  add('\u2705', 'All clear', `${LP.drop(24, 46, 14, 2)}${v('<rect x="5" y="5" width="38" height="38" rx="11"/>', '#4FA85E')}${stroke('M14 25 l7 7 l13 -15', '#fff', 4.4)}`);
  const sparkle = (x, y, r, c) => v(`<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z"/>`, c || '#FFC727', { lineColour: '#C98A1E', lineOpacity: 0.6 });
  add('\u2728', 'Sparkles', `${sparkle(19, 26, 14)}${sparkle(36, 11, 7, '#FFE07A')}${sparkle(37, 36, 5.5, '#FFE07A')}`);
  add('\u27A1', 'What\'s next?', `${LP.drop(24, 44, 18, 2)}${v('<path d="M5 19 h20 v-9 l18 14 l-18 14 v-9 h-20 z"/>', '#4A90D9')}${LP.shine(14, 22, 7, 1.4)}`);
  add('\u2B50', 'Star', `${LP.drop(24, 45, 15, 2.4)}${v('<path d="M24 4 l5.9 12 13.1 1.9 -9.5 9.3 2.3 13.1 L24 34.1 12.2 40.3 14.5 27.2 5 17.9 18.1 16z"/>', '#FFC727', { lineColour: '#C98A1E', lineOpacity: 0.7 })}${LP.shine(19, 18, 2.6, 1.2, -30)}`);
  add('\u{1F300}', 'Spin around', `${bar('M25 24 a2.5 2.5 0 1 1 -4 -2 a6 6 0 1 1 10 5 a10 10 0 1 1 -15 -12 a14 14 0 0 1 20 -1', '#5B8FD9', 3.6)}`);
  add('\u{1F324}', 'Sunny', `${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="17" y="1" width="3" height="6" rx="1.5" fill="#F4B400" transform="rotate(${a} 18.5 17)"/>`).join('')}${v('<circle cx="18.5" cy="17" r="9"/>', '#FFC727')}${v('<path d="M15 41 a7 7 0 0 1 1 -14 a9 9 0 0 1 17 -3 a7.5 7.5 0 0 1 9 7 a6.5 6.5 0 0 1 -1 10z"/>', '#FFFFFF')}`);
  add('\u{1F32C}', 'Big breaths', `${bar('M5 17 H27 a5.5 5.5 0 1 0 -5.5 -5.5', '#8EC5F2', 3.4)}${bar('M5 26 H34 a5.5 5.5 0 1 1 -5.5 5.5', '#8EC5F2', 3.4)}${bar('M9 35 H20', '#8EC5F2', 3.4)}`);
  const NOTE = (x, y, c) => `${bar(`M${x + 4.6} ${y} V${y - 24}`, c, 2.6)}${v(`<ellipse cx="${x}" cy="${y}" rx="6" ry="4.6" transform="rotate(-20 ${x} ${y})"/>`, c)}`;
  add('\u{1F3B5}', 'Music', `${LP.drop(22, 45, 10, 2)}${NOTE(18, 37, '#7E64C8')}${v('<path d="M22.6 13 c6 1 9 4 10 9 c-2-3-5-4-10-4z"/>', '#7E64C8')}`);
  add('\u{1F3B6}', 'Singing', `${LP.drop(24, 45, 16, 2)}${NOTE(12, 39, '#E5739A')}${NOTE(32, 34, '#E5739A')}${v('<path d="M15 14 L37 8 V13 L15 19z"/>', '#E5739A')}`);
  add('\u{1F49C}', 'Feelings card', `${LP.drop(24, 45, 15, 2.4)}${v('<path d="M24 42C8 32 4 20 10 12 15 6 21 8 24 13c3-5 9-7 14-1 6 8 2 20-14 30z"/>', '#9B6FD9')}${LP.shine(15, 16, 3, 1.8, -40)}`);
  add('\u{1F4A1}', 'Night light', `<circle cx="24" cy="19" r="20" fill="url(#lpGlow)"/>${v('<path d="M24 4 a13 13 0 0 0 -8 23.4 c2 1.6 2.6 3.6 2.6 6 h10.8 c0 -2.4 .6 -4.4 2.6 -6 A13 13 0 0 0 24 4z"/>', '#FFE36B')}${stroke('M21 33 q1 -8 3 -14 q2 6 3 14', '#E0A21A', 1.4)}${v('<rect x="18" y="33" width="12" height="8" rx="2"/>', '#A9B4BF', { shade: 'v' })}<path d="M18 36h12M18 38.6h12" stroke="#7E8A96" stroke-width="1"/>${v('<rect x="21" y="41" width="6" height="3" rx="1.5"/>', '#7E8A96')}${LP.shine(19, 11, 2, 3.4, 20)}`);
  add('\u{1F4A5}', 'Throw it', `${v('<path d="M24 2 l4 11 11-6-4 11 11 3-11 5 6 10-11-3-1 12-6-10-7 9 1-12-11 1 8-8-9-7 12-2-4-11 10 6z"/>', '#F4842E', { lineColour: '#B5541B' })}${v('<path d="M24 13 l3 6 6-2-2 6 6 3-6 3 2 6-6-2-3 6-3-6-6 2 2-6-6-3 6-3-2-6 6 2z"/>', '#FFD23F', { lineOpacity: 0.3 })}`);
  const DROP = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">${v('<path d="M0 -14 C5 -6 9 -1 9 4 a9 9 0 0 1 -18 0 C-9 -1 -5 -6 0 -14z"/>', c || '#4E9BE0', { lineWidth: 1.6 / s })}${LP.shine(-3.4, 2, 1.8, 3.2, 20)}</g>`;
  add('\u{1F4A7}', 'Water', `${LP.drop(24, 45, 10, 2)}${DROP(24, 26, 1.45)}`);
  add('\u{1F4A6}', 'Splash', `${DROP(15, 22, 0.9, '#5BB6E6')}${DROP(33, 18, 0.7, '#5BB6E6')}${DROP(30, 38, 0.6, '#5BB6E6')}`);
  add('\u{1F4AC}', 'Talk', `${LP.drop(24, 46, 14, 2)}${v('<path d="M8 6 h32 a5 5 0 0 1 5 5 v18 a5 5 0 0 1 -5 5 H22 l-9 9 v-9 H8 a5 5 0 0 1 -5 -5 V11 a5 5 0 0 1 5 -5z"/>', '#FFFFFF')}<circle cx="15" cy="20" r="2.6" fill="#7E64C8"/><circle cx="24" cy="20" r="2.6" fill="#7E64C8"/><circle cx="33" cy="20" r="2.6" fill="#7E64C8"/>`);
  add('\u{1F4E2}', 'Tell someone', `${LP.drop(22, 46, 14, 2)}${v('<path d="M6 20 h7 l20 -12 v32 l-20 -12 h-7 z"/>', '#E5534B', { shade: 'v' })}${v('<rect x="11" y="27" width="6" height="11" rx="2"/>', '#8A97A6')}${v('<rect x="3" y="18" width="6" height="12" rx="3"/>', '#F2F4F6')}${stroke('M38 16 q4 8 0 16 M42 11 q7 13 0 26', '#F4B400', 2.4)}`);
  const loopArrow = (c) => `${bar('M9 27 V22 a8 8 0 0 1 8 -8 H33', c, 4.4)}${arrowHead(33, 14, 0, c)}${bar('M39 21 V26 a8 8 0 0 1 -8 8 H15', c, 4.4)}${arrowHead(15, 34, 180, c)}`;
  add('\u{1F501}', 'Try again', loopArrow('#4A90D9'));
  add('\u{1F504}', 'Swap', `${bar('M10 24 A14 14 0 0 1 34 14', '#2FA39A', 4.4)}${arrowHead(35, 15, 50, '#2FA39A')}${bar('M38 24 A14 14 0 0 1 14 34', '#2FA39A', 4.4)}${arrowHead(13, 33, 230, '#2FA39A')}`);
  add('\u{1F50A}', 'Too loud', `${LP.drop(18, 45, 12, 2)}${v('<path d="M5 18 h8 l11 -9 v30 l-11 -9 h-8 z"/>', '#3E5463', { shade: 'v' })}${stroke('M30 17 q4 7 0 14 M35 12 q8 12 0 24 M40 8 q11 16 0 32', '#2F9E96', 2.6)}`);
  const block = (x, y, s, c, t) => `${v(`<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.24}"/>`, c)}<text x="${x + s / 2}" y="${y + s * 0.72}" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="${s * (t.length > 1 ? 0.52 : 0.66)}" fill="#fff">${t}</text>`;
  add('\u{1F51F}', 'Count to ten', `${LP.drop(24, 46, 15, 2)}${block(6, 6, 36, '#4A90D9', '10')}`);
  add('\u{1F522}', 'Numbers', `${LP.drop(24, 45, 20, 2)}${block(2, 26, 16, '#E5534B', '1')}${block(16, 10, 16, '#F4B400', '2')}${block(30, 26, 16, '#4FA85E', '3')}`);
  add('\u{1F535}', 'Blue', `${LP.drop(24, 45, 14, 2.4)}${v('<circle cx="24" cy="23" r="17"/>', '#3F7FD9')}${LP.shine(18, 16, 4.4, 2.6, -35)}`);
  add('\u{1F7E4}', 'Fish flakes', `${LP.drop(24, 42, 17, 3)}${[[10, 34, 20, '#B9774A'], [18, 36, -12, '#9C5E36'], [26, 33, 34, '#C98F62'], [34, 35, -24, '#9C5E36'], [15, 29, -30, '#C98F62'], [23, 27, 10, '#B9774A'], [31, 29, 28, '#9C5E36'], [20, 22, -16, '#9C5E36'], [28, 23, 40, '#C98F62']].map(([x, y, r, c]) => `<g transform="rotate(${r} ${x} ${y})">${v(`<path d="M${x - 5} ${y - 1} l4 -3 6 1 1 4 -5 2z"/>`, c, { lineWidth: 1 })}</g>`).join('')}`);
  add('\u{1FAE7}', 'Bubbles', `${[[18, 26, 12, '#B9A6E0'], [34, 14, 7, '#8EC5F2'], [36, 34, 6, '#F7A8C4']].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".25"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#lpGlass)"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="1.8"/>${LP.shine(x - r * 0.4, y - r * 0.4, r * 0.24, r * 0.14, -40)}`).join('')}`);
})();
