/*
  daygames.js
  Every part of the day is played with Lumi, then done for real. No star tapping.
  A small engine turns each step into a few stages. Each stage is one simple action:
    tap   - tap something (the curtains, the lamp, the swing)
    drag  - slide something to a place (food to Lumi's mouth, toys into the box). Several items can
            belong to one stage. A tap makes the item float there by itself.
    rub   - rub with a finger (scrub with a sponge, wipe the table, stir the pot). Taps count too.
    hold  - press and hold (a big breath, a hug, open wide at the dentist). Three taps also work.
  After each stage the scene changes (Lumi moves, the lights go off, the bath fills...).
  The last stage leads to "Your turn!" and the real-life button. Grown-ups' own steps get a short
  "do it together" version with their photo or picture.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, chime, render, later } = A;
  const SG = A.SG;
  const { G, drag, near, turnCard, updateDots, panel, cur, ack } = SG;

  // ---------------------------------------------------------------- prop art (same chunky, rounded style as the rest of Lumi)
  const K = 'stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  const sv = (vb, body) => `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${body}</svg>`;
  const person = (shirt, hair, extra) => sv('0 0 100 140', `<path d="M18 140c0-30 14-48 32-48s32 18 32 48z" fill="${shirt}" ${K}/>
    <circle cx="50" cy="56" r="28" fill="#F6CBA4" ${K}/><path d="M22 52c2-20 14-30 28-30s26 10 28 30c-8-8-18-12-28-12s-20 4-28 12z" fill="${hair}" ${K}/>
    <circle cx="40" cy="60" r="3" fill="#3B2F2F"/><circle cx="60" cy="60" r="3" fill="#3B2F2F"/><path d="M42 70q8 6 16 0" fill="none" stroke="#3B2F2F" stroke-width="3" stroke-linecap="round"/>
    <circle cx="33" cy="68" r="4" fill="#F2A7BE" opacity=".8"/><circle cx="67" cy="68" r="4" fill="#F2A7BE" opacity=".8"/>${extra || ''}`);
  // soft picture-book food (drawn in routinegames.js, shared with breakfast)
  const food = {};
  ['rice', 'chicken', 'veg', 'fish', 'soup', 'glass', 'noodles', 'tray'].forEach((k) => { food[k] = A.foodSvg(k); });
  const ART = {
    bed: sv('0 0 300 150', `<rect x="6" y="20" width="26" height="126" rx="10" fill="#A87B50" ${K}/><rect x="24" y="70" width="270" height="56" rx="14" fill="#fff" ${K}/><rect x="34" y="126" width="250" height="20" rx="6" fill="#A87B50" ${K}/>`),
    pillow: sv('0 0 120 60', `<rect x="4" y="6" width="112" height="48" rx="22" fill="#fff" ${K}/>`),
    blanket: sv('0 0 260 110', `<rect x="4" y="4" width="252" height="102" rx="24" fill="#6FCBBE" ${K}/><g fill="#FFE45C" opacity=".85"><circle cx="40" cy="34" r="6"/><circle cx="110" cy="70" r="6"/><circle cx="180" cy="30" r="6"/><circle cx="220" cy="78" r="6"/><circle cx="70" cy="84" r="5"/></g>`),
    blanketFold: sv('0 0 200 50', `<rect x="4" y="4" width="192" height="42" rx="16" fill="#6FCBBE" ${K}/>`),
    lampOn: sv('0 0 80 140', `<path d="M14 54L26 10h28l12 44z" fill="#FFE45C" ${K}/><rect x="36" y="54" width="8" height="66" fill="#A87B50"/><rect x="16" y="118" width="48" height="16" rx="6" fill="#A87B50" ${K}/><circle cx="40" cy="70" r="30" fill="#FFF1A8" opacity=".35"/>`),
    lampOff: sv('0 0 80 140', `<path d="M14 54L26 10h28l12 44z" fill="#C9C1D9" ${K}/><rect x="36" y="54" width="8" height="66" fill="#A87B50"/><rect x="16" y="118" width="48" height="16" rx="6" fill="#A87B50" ${K}/>`),
    book: sv('0 0 100 80', `<rect x="12" y="8" width="76" height="64" rx="8" fill="#F59FBF" ${K}/><rect x="20" y="8" width="10" height="64" fill="#E07A9F"/><path d="M44 30h30M44 42h22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
    bookOpen: sv('0 0 160 100', `<path d="M8 16c24-8 48-8 72 4 24-12 48-12 72-4v76c-24-8-48-8-72 4-24-12-48-12-72-4z" fill="#fff" ${K}/><path d="M80 20v76" ${K}/><circle cx="40" cy="48" r="14" fill="#F4D35E"/><path d="M98 66l14-20 14 20z" fill="#7FB069"/><path d="M112 66l10-14 12 14z" fill="#5E9A4A"/>`),
    pyjamas: SG.pjArt.replace('width="100" height="92"', 'width="100%" height="100%"'),
    toilet: ic('toilet', 150).replace(/width="150" height="150"/, 'width="100%" height="100%"'),
    paper: sv('0 0 80 80', `<rect x="6" y="20" width="48" height="44" rx="20" fill="#fff" ${K}/><circle cx="30" cy="42" r="8" fill="#E6DCCB" ${K}/><path d="M54 42h18v34H40" fill="#fff" ${K}/>`),
    flush: sv('0 0 60 60', `<circle cx="30" cy="30" r="24" fill="#DCEEF7" ${K}/><circle cx="30" cy="30" r="12" fill="#8EB8E5" ${K}/>`),
    sink: sv('0 0 180 120', `<rect x="80" y="4" width="20" height="40" rx="6" fill="#D5DDE5" ${K}/><path d="M90 12h40v16" fill="none" stroke="#3B2F2F" stroke-width="8" stroke-linecap="round"/><path d="M8 50h164c0 40-30 64-82 64S8 90 8 50z" fill="#fff" ${K}/><ellipse cx="90" cy="54" rx="74" ry="10" fill="#DCEEF7"/>`),
    soap: sv('0 0 70 70', `<rect x="10" y="26" width="50" height="38" rx="12" fill="#F59FBF" ${K}/><rect x="28" y="10" width="14" height="18" rx="4" fill="#fff" ${K}/><circle cx="54" cy="16" r="6" fill="#fff" ${K}/>`),
    bathtub: sv('0 0 320 160', `<path d="M10 50h300v30c0 44-36 72-80 72H90c-44 0-80-28-80-72z" fill="#fff" ${K}/><rect x="4" y="40" width="312" height="18" rx="9" fill="#DCEEF7" ${K}/><path d="M60 152l-10 6M260 152l10 6" ${K}/>`),
    tubWater: sv('0 0 300 40', `<path d="M6 10c30-10 60 10 90 0s60 10 90 0 60 10 90 0 24 6 24 6v24H6z" fill="#9ED3F2" opacity=".85"/>`),
    tap: sv('0 0 90 80', `<rect x="10" y="10" width="20" height="56" rx="8" fill="#D5DDE5" ${K}/><path d="M20 20h50v18" fill="none" stroke="#3B2F2F" stroke-width="10" stroke-linecap="round"/><path d="M20 20h50v18" fill="none" stroke="#D5DDE5" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="10" r="9" fill="#EF6F5E" ${K}/>`),
    showerHead: sv('0 0 120 120', `<path d="M10 4v40h50" fill="none" stroke="#3B2F2F" stroke-width="10" stroke-linecap="round"/><path d="M10 4v40h50" fill="none" stroke="#D5DDE5" stroke-width="5" stroke-linecap="round"/><path d="M50 30h40l14 26H36z" fill="#D5DDE5" ${K}/>`),
    water: sv('0 0 100 160', `<g stroke="#8EC9E8" stroke-width="6" stroke-linecap="round" opacity=".85"><path d="M20 10v40M40 20v50M60 10v44M80 22v40M30 70v40M50 84v46M70 70v40"/></g>`),
    sponge: sv('0 0 90 60', `<rect x="6" y="8" width="78" height="44" rx="14" fill="#FFD23F" ${K}/><g fill="#E0B83A"><circle cx="24" cy="24" r="4"/><circle cx="50" cy="34" r="5"/><circle cx="68" cy="22" r="3.5"/></g>`),
    towel: ic('towel', 150).replace(/width="150" height="150"/, 'width="100%" height="100%"'),
    gate: sv('0 0 220 200', `<rect x="4" y="30" width="22" height="166" rx="6" fill="#A87B50" ${K}/><rect x="194" y="30" width="22" height="166" rx="6" fill="#A87B50" ${K}/><path d="M26 60 Q110 20 194 60" fill="none" stroke="#2F7E79" stroke-width="12"/><rect x="58" y="4" width="104" height="34" rx="8" fill="#fff" ${K}/><text x="110" y="28" text-anchor="middle" font-size="18" font-weight="900" fill="#2F7E79" font-family="Nunito, ui-rounded, sans-serif">SCHOOL</text>`),
    cubby: sv('0 0 160 160', `<rect x="4" y="4" width="152" height="152" rx="10" fill="#C99A6B" ${K}/><rect x="16" y="16" width="56" height="58" rx="6" fill="#8C6A4C"/><rect x="88" y="16" width="56" height="58" rx="6" fill="#8C6A4C"/><rect x="16" y="86" width="56" height="58" rx="6" fill="#8C6A4C"/><rect x="88" y="86" width="56" height="58" rx="6" fill="#8C6A4C"/>`),
    bag: ic('bag', 120).replace(/width="120" height="120"/, 'width="100%" height="100%"'),
    teacher: person('#7E64C8', '#3B2F2F'),
    therapist: person('#2F7E79', '#A87B50'),
    dentistP: person('#FFFFFF', '#3B2F2F', '<path d="M30 112h40" stroke="#8EB8E5" stroke-width="6" stroke-linecap="round"/>'),
    hairdresser: person('#F59FBF', '#E07A5F'),
    uncle: person('#FFFFFF', '#6B5A4E', '<rect x="30" y="96" width="40" height="44" fill="#E07A5F" opacity=".7"/>'),
    desk: sv('0 0 260 130', `<rect x="4" y="10" width="252" height="24" rx="8" fill="#C99A6B" ${K}/><rect x="20" y="34" width="16" height="92" fill="#A87B50" ${K}/><rect x="224" y="34" width="16" height="92" fill="#A87B50" ${K}/>`),
    chair: sv('0 0 100 120', `<rect x="14" y="6" width="72" height="60" rx="12" fill="#2F7E79" ${K}/><rect x="10" y="62" width="80" height="18" rx="6" fill="#2F7E79" ${K}/><path d="M20 80v34M80 80v34" ${K}/>`),
    table: sv('0 0 360 120', `<rect x="4" y="6" width="352" height="26" rx="10" fill="#C99A6B" ${K}/><rect x="30" y="32" width="18" height="84" fill="#A87B50" ${K}/><rect x="312" y="32" width="18" height="84" fill="#A87B50" ${K}/>`),
    plate: sv('0 0 160 50', `<ellipse cx="80" cy="25" rx="76" ry="21" fill="#fff" ${K}/><ellipse cx="80" cy="24" rx="54" ry="12" fill="#F6EFE6"/>`),
    pencil: sv('0 0 100 30', `<path d="M6 15l16-9h66v18H22z" fill="#FFD23F" ${K}/><path d="M6 15l16-9v18z" fill="#F6CBA4" ${K}/><rect x="80" y="6" width="14" height="18" rx="3" fill="#F59FBF" ${K}/>`),
    worksheet: sv('0 0 120 150', `<rect x="6" y="6" width="108" height="138" rx="8" fill="#fff" ${K}/><path d="M22 30h76M22 50h76M22 70h76M22 90h60" stroke="#DCEEF7" stroke-width="5" stroke-linecap="round"/>`),
    worksheetDone: sv('0 0 120 150', `<rect x="6" y="6" width="108" height="138" rx="8" fill="#fff" ${K}/><path d="M22 30c10-6 20 6 30 0s20 6 30 0 12 4 16 2M22 50c10-6 20 6 30 0s20 6 30 0M22 70c10-6 20 6 30 0s20 6 30 0 12 4 16 2M22 90c10-6 20 6 30 0" stroke="#5B8FD9" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M70 108l10 12 20-24" stroke="#4F8A3F" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    shelf: sv('0 0 160 180', `<rect x="4" y="4" width="152" height="172" rx="8" fill="#C99A6B" ${K}/><rect x="14" y="56" width="132" height="8" fill="#8C6A4C"/><rect x="14" y="116" width="132" height="8" fill="#8C6A4C"/><rect x="24" y="16" width="16" height="40" fill="#5B8FD9"/><rect x="44" y="20" width="16" height="36" fill="#7FB069"/><rect x="64" y="14" width="16" height="42" fill="#F4D35E"/><rect x="30" y="76" width="16" height="40" fill="#E07A5F"/><rect x="50" y="80" width="16" height="36" fill="#B9A6E0"/>`),
    beanbag: sv('0 0 220 120', `<path d="M10 100c0-50 40-90 100-90s100 40 100 90c0 10-20 16-100 16S10 110 10 100z" fill="#B9A6E0" ${K}/>`),
    block1: sv('0 0 60 60', `<rect x="4" y="4" width="52" height="52" rx="8" fill="#EF6F5E" ${K}/><text x="30" y="40" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="Nunito, ui-rounded, sans-serif">A</text>`),
    block2: sv('0 0 60 60', `<rect x="4" y="4" width="52" height="52" rx="8" fill="#5B8FD9" ${K}/><text x="30" y="40" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="Nunito, ui-rounded, sans-serif">B</text>`),
    block3: sv('0 0 60 60', `<rect x="4" y="4" width="52" height="52" rx="8" fill="#FFD23F" ${K}/><text x="30" y="40" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="Nunito, ui-rounded, sans-serif">C</text>`),
    ball: sv('0 0 80 80', `<circle cx="40" cy="40" r="34" fill="#EF6F5E" ${K}/><path d="M10 32q30 14 60 0M14 54q26-12 52 0" stroke="#fff" stroke-width="6" fill="none"/>`),
    teddy: sv('0 0 90 100', `<circle cx="22" cy="20" r="12" fill="#C99A6B" ${K}/><circle cx="68" cy="20" r="12" fill="#C99A6B" ${K}/><circle cx="45" cy="36" r="26" fill="#C99A6B" ${K}/><ellipse cx="45" cy="78" rx="30" ry="22" fill="#C99A6B" ${K}/><circle cx="36" cy="34" r="3" fill="#3B2F2F"/><circle cx="54" cy="34" r="3" fill="#3B2F2F"/><ellipse cx="45" cy="44" rx="7" ry="5" fill="#F6DCC0"/>`),
    car: sv('0 0 110 60', `<path d="M8 38c0-8 4-12 12-13l14-14h34l16 14c10 1 18 5 18 13v8H8z" fill="#5B8FD9" ${K}/><path d="M38 14h12v12H26zM56 14h12l12 12H56z" fill="#DCEEF7"/><circle cx="28" cy="48" r="9" fill="#3B2F2F"/><circle cx="84" cy="48" r="9" fill="#3B2F2F"/>`),
    toybox: sv('0 0 200 130', `<rect x="6" y="30" width="188" height="94" rx="12" fill="#F4B400" ${K}/><rect x="0" y="18" width="200" height="22" rx="8" fill="#E09A2E" ${K}/><text x="100" y="92" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="Nunito, ui-rounded, sans-serif">TOYS</text>`),
    swing: sv('0 0 240 230', `<path d="M14 226L44 10h152l30 216" fill="none" stroke="#A87B50" stroke-width="12" stroke-linejoin="round"/><path d="M44 10h152" stroke="#A87B50" stroke-width="14" stroke-linecap="round"/>`),
    swingSeat: sv('0 0 120 170', `<path d="M24 0v150M96 0v150" stroke="#6B7C8A" stroke-width="5"/><rect x="10" y="146" width="100" height="18" rx="6" fill="#EF6F5E" ${K}/>`),
    slide: sv('0 0 260 230', `<path d="M30 226V40" stroke="#6B7C8A" stroke-width="10"/><path d="M70 226V40" stroke="#6B7C8A" stroke-width="10"/><path d="M34 70h32M34 110h32M34 150h32M34 190h32" stroke="#6B7C8A" stroke-width="7"/><path d="M60 40c40 10 80 60 110 130 12 30 40 50 86 50v-24c-34 0-52-14-62-40C162 80 118 26 70 18z" fill="#F4B400" ${K}/>`),
    tree: sv('0 0 180 240', `<rect x="78" y="140" width="26" height="96" rx="8" fill="#A87B50" ${K}/><circle cx="90" cy="96" r="72" fill="#7FB069" ${K}/><circle cx="60" cy="80" r="14" fill="#9CCB7A"/>`),
    tablet: sv('0 0 140 100', `<rect x="6" y="6" width="128" height="88" rx="14" fill="#3B2F2F"/><rect x="14" y="14" width="112" height="72" rx="6" fill="#33406A"/>`),
    tabletOn: sv('0 0 140 100', `<rect x="6" y="6" width="128" height="88" rx="14" fill="#3B2F2F"/><rect x="14" y="14" width="112" height="72" rx="6" fill="#9ED3F2"/><circle cx="50" cy="50" r="14" fill="#FFD23F"/><path d="M76 66l16-24 16 24z" fill="#7FB069"/>`),
    timer: sv('0 0 100 110', `<circle cx="50" cy="60" r="42" fill="#fff" ${K}/><path d="M50 60V32M50 60l18 10" ${K} fill="none"/><rect x="40" y="4" width="20" height="12" rx="4" fill="#EF6F5E" ${K}/>`),
    timerOn: sv('0 0 100 110', `<circle cx="50" cy="60" r="42" fill="#DCEFED" ${K}/><path d="M50 60V32A28 28 0 0 1 74 46z" fill="#2F7E79"/><path d="M50 60V32M50 60l18 10" ${K} fill="none"/><rect x="40" y="4" width="20" height="12" rx="4" fill="#EF6F5E" ${K}/>`),
    sofa: sv('0 0 300 140', `<rect x="10" y="20" width="280" height="80" rx="30" fill="#8EB8E5" ${K}/><rect x="4" y="60" width="292" height="60" rx="20" fill="#9CC7EE" ${K}/><path d="M30 120v16M270 120v16" ${K}/>`),
    puzzle1: sv('0 0 80 80', `<path d="M8 20h20a8 8 0 1 1 16 0h20v20a8 8 0 1 1 0 16v20H8z" fill="#8FD07A" ${K}/>`),
    puzzle2: sv('0 0 80 80', `<path d="M8 8h56v24a8 8 0 1 0 0 16v24H8V48a8 8 0 1 1 0-16z" fill="#F59FBF" ${K}/>`),
    puzzleBoard: sv('0 0 200 120', `<rect x="4" y="4" width="192" height="112" rx="14" fill="#fff" ${K}/><rect x="20" y="22" width="70" height="76" rx="8" fill="#F1ECFB" stroke="#C9B8E8" stroke-width="3" stroke-dasharray="8 6"/><rect x="110" y="22" width="70" height="76" rx="8" fill="#F1ECFB" stroke="#C9B8E8" stroke-width="3" stroke-dasharray="8 6"/>`),
    gantry: sv('0 0 160 180', `<rect x="4" y="40" width="40" height="136" rx="10" fill="#D5DDE5" ${K}/><rect x="116" y="40" width="40" height="136" rx="10" fill="#D5DDE5" ${K}/><rect x="10" y="56" width="28" height="22" rx="4" fill="#FFD23F" ${K}/><path d="M44 110h30M116 110H86" stroke="#EF6F5E" stroke-width="10" stroke-linecap="round"/>`),
    gantryOpen: sv('0 0 160 180', `<rect x="4" y="40" width="40" height="136" rx="10" fill="#D5DDE5" ${K}/><rect x="116" y="40" width="40" height="136" rx="10" fill="#D5DDE5" ${K}/><rect x="10" y="56" width="28" height="22" rx="4" fill="#8FD07A" ${K}/><path d="M44 110l-4 30M116 110l4 30" stroke="#8FD07A" stroke-width="8" stroke-linecap="round"/>`),
    card: ic('buscard', 100).replace(/width="100" height="100"/, 'width="100%" height="100%"'),
    train: sv('0 0 420 180', `<rect x="6" y="20" width="408" height="150" rx="30" fill="#fff" ${K}/><rect x="6" y="50" width="408" height="16" fill="#C2577A"/>${[40, 140, 240, 340].map((x) => `<rect x="${x}" y="78" width="60" height="56" rx="10" fill="#BFE3F7" ${K}/>`).join('')}`),
    linespot: sv('0 0 200 40', `<rect x="4" y="12" width="192" height="16" rx="8" fill="#FFD23F" ${K}/><path d="M60 6v28M100 6v28M140 6v28" stroke="#E0B83A" stroke-width="4"/>`),
    dentChair: sv('0 0 260 200', `<path d="M40 150l30-80c6-14 16-22 34-22h120c18 0 24 12 24 28v40c0 18-8 34-30 34z" fill="#2F7E79" ${K}/><rect x="110" y="150" width="40" height="46" fill="#9FB7C8" ${K}/><path d="M200 20q30 0 30 40" fill="none" stroke="#9C8B7A" stroke-width="8"/><ellipse cx="230" cy="68" rx="22" ry="12" fill="#FFF1A8" ${K}/>`),
    sticker: sv('0 0 90 90', `<circle cx="45" cy="45" r="38" fill="#FFD23F" ${K}/><circle cx="34" cy="38" r="5" fill="#3B2F2F"/><circle cx="56" cy="38" r="5" fill="#3B2F2F"/><path d="M30 54q15 14 30 0" fill="none" stroke="#3B2F2F" stroke-width="5" stroke-linecap="round"/>`),
    barberChair: sv('0 0 200 220', `<rect x="30" y="20" width="140" height="110" rx="24" fill="#E07A5F" ${K}/><rect x="20" y="120" width="160" height="34" rx="12" fill="#E07A5F" ${K}/><rect x="86" y="154" width="28" height="44" fill="#9FB7C8" ${K}/><rect x="50" y="196" width="100" height="16" rx="6" fill="#9FB7C8" ${K}/>`),
    cape: sv('0 0 160 120', `<path d="M20 10h120l16 104H4z" fill="#7E64C8" ${K}/><path d="M60 10q20 18 40 0" fill="none" stroke="#fff" stroke-width="4"/>`),
    scissors: sv('0 0 100 80', `<circle cx="22" cy="58" r="14" fill="none" stroke="#EF6F5E" stroke-width="7"/><circle cx="54" cy="64" r="14" fill="none" stroke="#EF6F5E" stroke-width="7"/><path d="M30 46l60-40M46 52l48-22" stroke="#9FB0BE" stroke-width="8" stroke-linecap="round"/>`),
    mirror: sv('0 0 140 180', `<ellipse cx="70" cy="84" rx="60" ry="76" fill="#DCEEF7" stroke="#C99A6B" stroke-width="10"/><path d="M40 50l20-20M50 80l40-40" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>`),
    washer: sv('0 0 180 200', `<rect x="6" y="6" width="168" height="188" rx="20" fill="#fff" ${K}/><rect x="6" y="6" width="168" height="38" rx="18" fill="#E6F0FB" ${K}/><circle cx="90" cy="118" r="56" fill="#DCEEF7" ${K}/><circle cx="90" cy="118" r="40" fill="#BFE3F7"/><circle cx="34" cy="25" r="8" fill="#EF6F5E" ${K}/>`),
    washerOn: sv('0 0 180 200', `<rect x="6" y="6" width="168" height="188" rx="20" fill="#fff" ${K}/><rect x="6" y="6" width="168" height="38" rx="18" fill="#E6F0FB" ${K}/><circle cx="90" cy="118" r="56" fill="#DCEEF7" ${K}/><circle cx="90" cy="118" r="40" fill="#8EB8E5"/><path d="M60 112q30-24 60 0M58 128q32 20 64 0" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="34" cy="25" r="8" fill="#8FD07A" ${K}/>`),
    startBtn: sv('0 0 80 80', `<circle cx="40" cy="40" r="32" fill="#8FD07A" ${K}/><path d="M32 26l20 14-20 14z" fill="#fff"/>`),
    shirtR: sv('0 0 100 92', `<path d="M34 12 L50 18 L66 12 L92 26 L82 44 L72 38 L72 86 L28 86 L28 38 L18 44 L8 26 Z" fill="#EF6F5E" ${K}/>`),
    shirtY: sv('0 0 100 92', `<path d="M34 12 L50 18 L66 12 L92 26 L82 44 L72 38 L72 86 L28 86 L28 38 L18 44 L8 26 Z" fill="#FFD23F" ${K}/>`),
    sock: sv('0 0 70 90', `<path d="M14 6h28v44l16 16a10 10 0 0 1-8 18H26a14 14 0 0 1-14-14z" fill="#F59FBF" ${K}/><path d="M14 16h28" stroke="#fff" stroke-width="5"/>`),
    detergent: sv('0 0 80 110', `<rect x="10" y="30" width="60" height="76" rx="14" fill="#6FCBBE" ${K}/><rect x="28" y="8" width="24" height="24" rx="5" fill="#2F7E79" ${K}/><path d="M24 64h32" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`),
    pot: sv('0 0 200 120', `<path d="M20 30h160v52c0 22-18 36-40 36H60c-22 0-40-14-40-36z" fill="#9FB0BE" ${K}/><rect x="10" y="22" width="180" height="16" rx="8" fill="#C9D3DC" ${K}/><path d="M10 50H0M190 50h10" ${K}/>`),
    potFull: sv('0 0 200 120', `<path d="M20 30h160v52c0 22-18 36-40 36H60c-22 0-40-14-40-36z" fill="#9FB0BE" ${K}/><ellipse cx="100" cy="30" rx="80" ry="12" fill="#F4C76A" ${K}/><circle cx="70" cy="28" r="6" fill="#7FB069"/><circle cx="110" cy="26" r="6" fill="#EF6F5E"/><circle cx="140" cy="30" r="5" fill="#fff"/><path d="M80 12q4-8 0-12M110 12q4-8 0-12" stroke="#C9B8A4" stroke-width="3" fill="none"/>`),
    stove: sv('0 0 260 60', `<rect x="4" y="10" width="252" height="40" rx="10" fill="#6B7C8A" ${K}/><ellipse cx="130" cy="20" rx="70" ry="8" fill="#3B2F2F"/>`),
    egg: A.foodSvg('wholeEgg'),
    carrot: A.foodSvg('carrot'),
    tomato: A.foodSvg('tomato'),
    bowlFood: food.rice,
    stall: sv('0 0 260 220', `<rect x="10" y="40" width="240" height="176" rx="10" fill="#fff" ${K}/><rect x="10" y="40" width="240" height="50" rx="10" fill="#E07A5F" ${K}/><text x="130" y="74" text-anchor="middle" font-size="24" font-weight="900" fill="#fff" font-family="Nunito, ui-rounded, sans-serif">NOODLES</text><rect x="26" y="170" width="208" height="20" rx="6" fill="#E8CDB0"/>`),
    tissue: sv('0 0 80 50', `<rect x="4" y="10" width="72" height="34" rx="8" fill="#BFE3F7" ${K}/><path d="M28 10q12-12 24 0" fill="#fff" ${K}/>`),
    hawkerTable: sv('0 0 260 140', `<ellipse cx="130" cy="34" rx="120" ry="24" fill="#B9A6E0" ${K}/><rect x="120" y="56" width="20" height="78" fill="#8A7AB0"/><circle cx="20" cy="120" r="16" fill="#C9B9EA" ${K}/><circle cx="240" cy="120" r="16" fill="#C9B9EA" ${K}/>`),
    phone: sv('0 0 60 100', `<rect x="6" y="4" width="48" height="92" rx="10" fill="#3B2F2F"/><rect x="12" y="14" width="36" height="66" rx="4" fill="#9ED3F2"/>`),
    charger: sv('0 0 100 60', `<rect x="60" y="14" width="34" height="34" rx="8" fill="#fff" ${K}/><path d="M60 31H10" stroke="#3B2F2F" stroke-width="5" stroke-linecap="round"/><path d="M74 24l-4 8h8l-4 8" stroke="#8FD07A" stroke-width="4" fill="none"/>`),
    bottle: ic('bottle', 100).replace(/width="100" height="100"/, 'width="100%" height="100%"'),
    folder: ic('folder', 100).replace(/width="100" height="100"/, 'width="100%" height="100%"'),
    pencilcase: ic('pencilcase', 100).replace(/width="100" height="100"/, 'width="100%" height="100%"'),
    lunchbox: ic('lunchbox', 100).replace(/width="100" height="100"/, 'width="100%" height="100%"'),
    cafeTable: sv('0 0 260 120', `<rect x="4" y="10" width="252" height="22" rx="8" fill="#FFF8EC" ${K}/><rect x="120" y="32" width="20" height="84" fill="#A87B50"/><rect x="80" y="110" width="100" height="8" rx="4" fill="#A87B50"/>`),
    napkin: sv('0 0 70 60', `<path d="M6 10h58l-6 44H12z" fill="#fff" ${K}/><path d="M6 10l29 20 29-20" fill="none" ${K}/>`),
    board: sv('0 0 140 120', `<rect x="6" y="6" width="128" height="100" rx="10" fill="#fff" ${K}/><path d="M24 34h70M24 54h90M24 74h50" stroke="#C9B8A4" stroke-width="5" stroke-linecap="round"/><path d="M96 70l8 10 16-20" stroke="#4F8A3F" stroke-width="5" fill="none"/>`),
    dirt: sv('0 0 80 50', `<ellipse cx="40" cy="25" rx="34" ry="16" fill="#C9A27E" opacity=".55"/><circle cx="20" cy="22" r="5" fill="#A87B50" opacity=".5"/><circle cx="56" cy="30" r="4" fill="#A87B50" opacity=".5"/>`),
    picture: sv('0 0 120 120', `<rect x="6" y="6" width="108" height="108" rx="20" fill="#fff" ${K}/>`)
  };
  const artHtml = (p) => (p.html ? p.html : ART[p.art] || food[p.art] || (p.icon ? ic(p.icon, Math.round(Math.min(p.w, p.h || p.w))) : ''));

  // ---------------------------------------------------------------- backgrounds (soft and simple, so the props stand out)
  const BG = {
    bedroom: (g) => `<div class="sc-wall" style="background:${g.dark ? '#5D6894' : '#EEE8F9'}"></div><div class="sc-floor" style="background:#E8CDB0"></div><div class="sc-window ${g.dark || g.night ? 'night' : ''}" style="left:44px;top:30px"></div>`,
    kitchen: () => `<div class="sc-wall" style="background:#FFF1C2"></div><div class="sc-tiles"></div><div class="sc-floor" style="background:#E8CDB0"></div><div class="sc-window" style="right:60px;top:26px"></div>`,
    bathroom: () => `<div class="sc-wall" style="background:#DCEFED"></div><div class="sc-tiles"></div><div class="sc-floor" style="background:#CFE6E4"></div>`,
    school: () => `<div class="sc-wall" style="background:#DCEEF7"></div><div class="sc-building"></div><div class="sc-floor" style="background:#8FC47A"></div>`,
    classroom: () => `<div class="sc-wall" style="background:#E7F3E1"></div><div class="sc-board"></div><div class="sc-floor" style="background:#D9CDB8"></div>`,
    park: () => `<div class="sc-wall" style="background:#DCEEF7"></div><div class="sc-sun"></div><div class="sc-floor" style="background:#8FC47A;height:30%"></div>`,
    living: () => `<div class="sc-wall" style="background:#F6E7D3"></div><div class="sc-floor" style="background:#E8CDB0"></div><div class="sc-window" style="left:44px;top:30px"></div>`,
    station: () => `<div class="sc-wall" style="background:#E3ECF2"></div><div class="sc-floor" style="background:#B8C4CE;height:26%"></div><div class="sc-edge"></div>`,
    clinic: () => `<div class="sc-wall" style="background:#EAF7F5"></div><div class="sc-floor" style="background:#D9E8E4"></div>`,
    salon: () => `<div class="sc-wall" style="background:#FBE9EE"></div><div class="sc-floor sc-check"></div>`,
    laundry: () => `<div class="sc-wall" style="background:#E6F0FB"></div><div class="sc-tiles"></div><div class="sc-floor" style="background:#D6E0E8"></div>`,
    hawker: () => `<div class="sc-wall" style="background:#FFF4E0"></div><div class="sc-floor" style="background:#D9C2A0"></div>`,
    cafe: () => `<div class="sc-wall" style="background:#FBF0E2"></div><div class="sc-floor" style="background:#D9B48A"></div><div class="sc-sign">CAFÉ</div>`,
    plain: (g, info) => `<div class="sc-wall" style="background:${info.tint}"></div><div class="sc-floor" style="background:rgba(0,0,0,.06)"></div>`
  };

  // ---------------------------------------------------------------- the engine
  // the scene after the first `upto` stages are done: props shown/hidden/changed, Lumi's place, mood and clothes
  function stateAt(cfg, g, upto) {
    const props = {};
    Object.entries(cfg.props).forEach(([id, p]) => { props[id] = Object.assign({ id }, p); });
    const lumi = Object.assign({ x: 120, y: 160, size: 190, mood: 'happy', wear: null }, cfg.lumi || {});
    const scene = { dark: false, night: !!cfg.night };
    for (let k = 0; k < upto; k++) {
      // things slid somewhere in this stage stay there (or stay packed away)...
      Object.entries(g.moved || {}).forEach(([id, m]) => { if (m.k === k) { props[id].x = m.at[0]; props[id].y = m.at[1]; } });
      Object.entries(g.gone || {}).forEach(([id, gk]) => { if (gk === k) props[id].hidden = true; });
      // ...then this stage's changes
      const d = cfg.stages[k].done || {};
      (d.show || []).forEach((id) => { props[id].hidden = false; });
      (d.hide || []).forEach((id) => { props[id].hidden = true; });
      Object.entries(d.set || {}).forEach(([id, ch]) => { Object.assign(props[id], ch); if (ch.x != null) props[id].hidden = false; });
      if (d.lumi) Object.assign(lumi, d.lumi);
      if (d.dark != null) scene.dark = d.dark;
      if (d.night != null) scene.night = d.night;
    }
    return { props, lumi, scene };
  }
  const stageNow = (cfg, g) => (g.phase === 'turn' ? null : cfg.stages[g.st]);
  function lumiHtml(l, g, cfg) {
    const wear = l.wear === 'pj' ? SG.outfitSvg({ pj: true }, l.size) : '';
    const foam = g.foam ? `<span class="sc-foamcoat" style="opacity:${Math.min(1, g.foam)}"></span>` : '';
    const towel = l.wear === 'towel' ? '<span class="sc-towelwrap"></span>' : '';
    const cape = l.wear === 'cape' ? `<span class="sc-capewrap">${ART.cape}</span>` : '';
    const zz = l.mood === 'sleepy' && l.zz ? '<span class="wk-z z1">z</span><span class="wk-z z2">z</span><span class="wk-z z3">Z</span>' : '';
    return `${L.svg({ look: A.dayLook(), mood: l.mood, size: l.size, label: 'Lumi' })}${wear}${cape}${towel}${foam}${zz}`;
  }
  function makeScene(cfg) {
    return {
      cfg,
      init: () => ({ st: 0, placed: {}, moved: {}, gone: {}, rub: 0, taps: 0, foam: 0 }),
      total: () => cfg.stages.length,
      progress: (g) => (g.phase === 'turn' ? cfg.stages.length : g.st),
      real: cfg.real || 'I did it!',
      voice: (g) => (g.phase === 'turn' ? cfg.turn : stageNow(cfg, g).say),
      guide(g) {
        if (g.phase === 'turn') return { sel: '[data-a="sgReal"]', say: cfg.turnGuide || 'Now you do it. Then tap the green button.' };
        const s = stageNow(cfg, g);
        if (s.act === 'drag') {
          const left = (s.items || [s.item]).find((id) => !g.placed[id]);
          if (!left) return null;
          return { sel: `.sc-prop[data-id="${left}"]`, say: s.hint || 'Slide it with your finger, or tap it.' };
        }
        const tgt = s.target === 'lumi' ? '.sc-lumi' : `.sc-prop[data-id="${s.target}"]`;
        return { sel: tgt, say: s.hint || { tap: 'Tap here.', rub: 'Rub with your finger.', hold: 'Press and hold.' }[s.act] };
      },
      scene(g, info) {
        const { props, lumi, scene } = stateAt(cfg, g, g.phase === 'turn' ? cfg.stages.length : g.st);
        const s = stageNow(cfg, g);
        const from = g.lumiFrom || lumi;
        const active = new Set();
        if (s) {
          if (s.act === 'drag') (s.items || [s.item]).concat(s.wrong || []).forEach((id) => { if (!g.placed[id]) active.add(id); });
          else if (s.target && s.target !== 'lumi') active.add(s.target);
          if (s.act === 'drag' && s.target && s.target !== 'lumi' && s.target !== 'mouth') active.add('__t:' + s.target);
        }
        const propHtml = Object.values(props).map((p) => {
          if (p.hidden) return '';
          let x = p.x, y = p.y;
          const slot = g.placed[p.id];
          if (slot && slot.at) { x = slot.at[0]; y = slot.at[1]; } else if (slot) return '';
          const isItem = active.has(p.id) && s && s.act === 'drag';
          const isTap = active.has(p.id) && s && s.act !== 'drag';
          const tapAction = isTap && s.act !== 'rub';
          const isDrop = active.has('__t:' + p.id);
          const role = tapAction ? `data-a="sgTap" data-k="tgt" role="button" aria-label="${esc(p.label || p.id)}"` : isTap ? `role="button" aria-label="${esc(p.label || p.id)}"` : isItem ? `role="button" aria-label="${esc(p.label || p.id)}"` : '';
          return `<div class="sc-prop ${isTap ? 'is-target' : ''} ${isItem ? 'is-item' : ''} ${isDrop ? 'is-drop' : ''} ${p.cls || ''}" data-id="${p.id}" ${role} style="left:${x}px;top:${y}px;width:${p.w}px;height:${p.h || p.w}px;z-index:${p.z || 3}">${artHtml(p)}</div>`;
        }).join('');
        const lumiTarget = s && (s.target === 'lumi' || s.target === 'mouth');
        const lumiTap = s && s.target === 'lumi' && (s.act === 'tap' || s.act === 'hold');
        const lumiRub = s && s.target === 'lumi' && s.act === 'rub';
        return `<div class="panel scene grow sg sc ${scene.dark ? 'dark' : ''}">
          ${(BG[cfg.bg] || BG.plain)(scene, info)}
          ${propHtml}
          <div class="sc-lumi ${lumiTarget && s.act === 'drag' ? 'is-drop' : ''} ${lumiTap || lumiRub ? 'is-target' : ''} ${g.phase === 'turn' ? 'hop' : ''} ${lumi.anim && g.phase !== 'turn' ? lumi.anim : ''}" ${lumiTap ? 'data-a="sgTap" data-k="tgt" role="button" aria-label="Lumi"' : ''}
            data-x="${lumi.x}" data-y="${lumi.y}" style="left:${from.x}px;top:${from.y}px;width:${lumi.size}px;height:${lumi.size}px;z-index:${lumi.z || 6}">${lumiHtml(lumi, g, cfg)}</div>
          ${scene.dark ? '<div class="sc-darkness"></div>' : ''}
          <div class="sc-fx"></div>
          ${s && s.act === 'hold' ? `<div class="sc-holdring"><span style="--h:${g.hold || 0}"></span></div>` : ''}
          ${s && s.act === 'rub' ? `<div class="sc-rubbar"><span style="width:${Math.round(Math.min(1, g.rub / (s.need || 520)) * 100)}%"></span></div>` : ''}
          ${g.phase === 'turn' ? turnCard(info, cfg.turnCard || cfg.turn, cfg.turnPos || 'right') : ''}
          ${g.bubble ? `<div class="sc-say" style="left:${g.bubble.x}px;top:${g.bubble.y}px">${esc(g.bubble.text)}</div>` : ''}
        </div>`;
      },
      tap(g, k) {
        if (k !== 'tgt' || g.phase === 'turn') return;
        const s = stageNow(cfg, g);
        if (s.act === 'tap') {
          g.taps += 1;
          if (s.each) { const el = A.stage.querySelector(s.target === 'lumi' ? '.sc-lumi' : `.sc-prop[data-id="${s.target}"]`); if (el) { el.classList.remove(s.each); void el.offsetWidth; el.classList.add(s.each); } }
          tone(520 + g.taps * 80, 0.15, 0.06);
          if (s.counting) say(String(g.taps));
          if (g.taps >= (s.count || 1)) next(g);
        } else if (s.act === 'rub') {
          rubBy(g, s, 90, null);
        } else if (s.act === 'hold') {
          g.taps += 1;
          if (g.taps >= 3) next(g);
        }
      },
      after(g, box) {
        // walk Lumi to the new place
        const lu = box.querySelector('.sc-lumi');
        if (lu) {
          const tx = Number(lu.dataset.x), ty = Number(lu.dataset.y);
          if (g.lumiFrom && (g.lumiFrom.x !== tx || g.lumiFrom.y !== ty)) requestAnimationFrame(() => requestAnimationFrame(() => { lu.classList.add('walking'); lu.style.left = tx + 'px'; lu.style.top = ty + 'px'; setTimeout(() => lu.classList.remove('walking'), 950); }));
          g.lumiFrom = { x: tx, y: ty };
        }
        if (g.phase === 'turn') return;
        const s = stageNow(cfg, g);
        if (s.act === 'drag') bindDrag(g, s, box);
        if (s.act === 'rub') bindRub(g, s, box);
        if (s.act === 'hold') bindHold(g, s, box);
      }
    };
    // ---- stage done: move on
    function next(g) {
      const s = stageNow(cfg, g);
      // items that were slid somewhere stay there (or stay packed away)
      Object.entries(g.placed).forEach(([id, v]) => { if (v && v.at) g.moved[id] = { at: v.at, k: g.st }; else g.gone[id] = g.st; });
      g.st += 1; g.taps = 0; g.rub = 0; g.hold = 0; g.placed = {}; g.rubbing = false;
      if (s && s.done && s.done.foam != null) g.foam = s.done.foam;
      g.bubble = s && s.done && s.done.bubble ? s.done.bubble : null;
      if (s && s.sound === 'chime') chime(); else ack();
      if (g.st >= cfg.stages.length) { chime(); SG.setPhase(g, 'turn'); return; }
      render();
      say(cfg.stages[g.st].say);
    }
    // ---- drag stage (one or several items to a target)
    function targetPoint(s, box) {
      if (s.target === 'mouth' || s.target === 'lumi') {
        const lu = box.querySelector('.sc-lumi');
        const sz = lu.offsetWidth;
        return { x: lu.offsetLeft + sz * 0.5, y: lu.offsetTop + sz * (s.target === 'mouth' ? 0.6 : 0.55), r: s.target === 'mouth' ? 110 : sz * 0.6 };
      }
      const t = box.querySelector(`.sc-prop[data-id="${s.target}"]`);
      return { x: t.offsetLeft + t.offsetWidth / 2, y: t.offsetTop + t.offsetHeight / 2, r: Math.max(90, Math.max(t.offsetWidth, t.offsetHeight) * 0.6) };
    }
    function bindDrag(g, s, box) {
      const items = s.items || [s.item];
      // things that do not belong (Challenge): they bounce back with a gentle word
      (s.wrong || []).forEach((id) => {
        const el = box.querySelector(`.sc-prop[data-id="${id}"]`);
        if (!el) return;
        const nope = () => { tone(330, 0.2, 0.06); say(s.wrongSay || 'Not that one.'); el.classList.remove('wiggle-once'); void el.offsetWidth; el.classList.add('wiggle-once'); };
        drag(el, box, { drop: (p) => { const t = targetPoint(s, box); if (near(p, t.x, t.y, t.r)) nope(); return false; }, tap: nope });
      });
      items.forEach((id, n) => {
        const el = box.querySelector(`.sc-prop[data-id="${id}"]`);
        if (!el || g.placed[id]) return;
        const place = () => {
          const k = Object.keys(g.placed).length;
          g.placed[id] = s.slots ? { at: s.slots[k] } : true;
          tone(440 + k * 90, 0.18, 0.07);
          if (s.onEach) say(typeof s.onEach === 'function' ? s.onEach(id, k) : s.onEach[k % s.onEach.length]);
          if (s.lumiEat) { const lu = box.querySelector('.sc-lumi'); if (lu) { lu.classList.remove('chomp'); void lu.offsetWidth; lu.classList.add('chomp'); } }
          if (items.every((x) => g.placed[x])) later(() => { if (cur() === g) next(g); }, s.lumiEat ? 900 : 400);
          else render();
        };
        drag(el, box, {
          drop: (p) => { const t = targetPoint(s, box); if (near(p, t.x, t.y, t.r)) { el.style.visibility = 'hidden'; place(); return true; } return false; },
          tap: () => {
            const t = targetPoint(s, box);
            el.classList.add('fly');
            el.style.transform = `translate(${t.x - el.offsetLeft - el.offsetWidth / 2}px, ${t.y - el.offsetTop - el.offsetHeight / 2}px) scale(.7)`;
            setTimeout(() => { el.style.visibility = 'hidden'; place(); }, 450);
          }
        });
      });
    }
    // ---- rub stage (sponge, cloth, spoon, pencil...)
    function rubBy(g, s, amount, pt) {
      g.rub += amount;
      const need = s.need || 520;
      const bar = A.stage.querySelector('.sc-rubbar span');
      if (bar) bar.style.width = Math.round(Math.min(1, g.rub / need) * 100) + '%';
      if (s.foamGrow) { g.foam = Math.min(1, g.rub / need); const fc = A.stage.querySelector('.sc-foamcoat'); if (fc) fc.style.opacity = g.foam; else if (g.foam > 0.05) { const lu = A.stage.querySelector('.sc-lumi'); if (lu) lu.insertAdjacentHTML('beforeend', `<span class="sc-foamcoat" style="opacity:${g.foam}"></span>`); } }
      if (s.foamWash) { g.foam = Math.max(0, 1 - g.rub / need); const fc = A.stage.querySelector('.sc-foamcoat'); if (fc) fc.style.opacity = g.foam; }
      if (pt) fx(s.fx || 'foam', pt);
      if (!g.rubbing) { g.rubbing = true; if (s.rubSay) say(s.rubSay); }
      if (g.rub >= need) { g.rubbing = false; next(g); }
    }
    function fx(kind, pt) {
      const box = panel();
      const layer = box && box.querySelector('.sc-fx');
      if (!layer) return;
      const b = document.createElement('span');
      b.className = 'sc-p ' + kind;
      b.style.left = pt.x - 10 + Math.random() * 20 + 'px';
      b.style.top = pt.y - 10 + Math.random() * 20 + 'px';
      layer.appendChild(b);
      if (layer.children.length > 40) layer.firstChild.remove();
      setTimeout(() => b.remove(), 1800);
    }
    function bindRub(g, s, box) {
      const el = s.target === 'lumi' ? box.querySelector('.sc-lumi') : box.querySelector(`.sc-prop[data-id="${s.target}"]`);
      if (!el) return;
      el.classList.add('is-rub');
      let since = 0;
      drag(el, box, {
        noMove: true,
        move: (p, dx, dy) => { const d = Math.hypot(dx, dy); since += d; const emit = since > 22; if (emit) since = 0; rubBy(g, s, d, emit ? p : null); },
        drop: () => true,
        tap: (p) => { rubBy(g, s, 90, p); fx(s.fx || 'foam', p); }
      });
    }
    // ---- hold stage
    function bindHold(g, s, box) {
      const el = s.target === 'lumi' ? box.querySelector('.sc-lumi') : box.querySelector(`.sc-prop[data-id="${s.target}"]`);
      const ring = box.querySelector('.sc-holdring span');
      if (!el) return;
      let t0 = 0, raf = 0;
      const ms = s.ms || 2500;
      const step = () => {
        const p = Math.min(1, (Date.now() - t0) / ms);
        g.hold = p;
        if (ring) ring.style.setProperty('--h', p);
        if (p >= 1) { t0 = 0; next(g); return; }
        raf = requestAnimationFrame(step);
      };
      el.addEventListener('pointerdown', (e) => { if (S.paused) return; e.preventDefault(); t0 = Date.now(); if (s.holdSay) say(s.holdSay); cancelAnimationFrame(raf); raf = requestAnimationFrame(step); });
      const stop = () => { if (!t0) return; t0 = 0; cancelAnimationFrame(raf); if (g.hold < 1) { g.hold = 0; if (ring) ring.style.setProperty('--h', 0); } };
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointerleave', stop);
      el.addEventListener('pointercancel', stop);
    }
  }

  // ================================================================ the steps
  // positions are in the scene's own space (about 978 x 434)
  const MOUTH_SAYS = ['Mmm, yummy!', 'Num, num, num!', 'Delicious!', 'Glug, glug!'];
  const STEPS = {
    potty: {
      bg: 'bathroom', lumi: { x: 90, y: 190, size: 170 },
      props: { toilet: { art: 'toilet', x: 330, y: 150, w: 190, label: 'Toilet' }, paper: { art: 'paper', x: 560, y: 230, w: 80, label: 'Toilet paper' }, flush: { art: 'flush', x: 570, y: 120, w: 60, label: 'Flush button' }, sink: { art: 'sink', x: 700, y: 170, w: 200, h: 130, label: 'Sink' }, soap: { art: 'soap', x: 860, y: 120, w: 60, label: 'Soap' } },
      stages: [
        { say: 'Lumi needs the toilet. Tap the toilet.', act: 'tap', target: 'toilet', done: { lumi: { x: 340, y: 100, mood: 'calm' } } },
        { say: 'All done? Tap the toilet paper.', act: 'tap', target: 'paper' },
        { say: 'Now flush the toilet. Tap the button.', act: 'tap', target: 'flush', done: { lumi: { x: 560, y: 180, mood: 'happy' } } },
        { say: 'Wash your hands at the sink. Rub, rub, rub!', act: 'rub', target: 'sink', need: 480, fx: 'foam', rubSay: 'Bubbles everywhere!' }
      ],
      turn: "Clean hands! Now it's your turn. Go to the toilet, then wash your hands.", real: 'I went!', turnPos: 'right'
    },
    nap: {
      bg: 'bedroom', night: false, lumi: { x: 420, y: 120, size: 180, mood: 'calm' },
      props: { bed: { art: 'bed', x: 330, y: 180, w: 420, h: 210, z: 2 }, pillow: { art: 'pillow', x: 360, y: 230, w: 120, h: 60, z: 3 }, blanket: { art: 'blanket', x: 760, y: 260, w: 200, h: 90, label: 'Blanket', z: 7 }, curtain: { art: 'lampOn', x: 230, y: 200, w: 70, h: 120, label: 'Lamp' } },
      stages: [
        { say: 'Quiet time. Tap the lamp to make the room dim.', act: 'tap', target: 'curtain', done: { set: { curtain: { art: 'lampOff' } }, dark: true } },
        { say: 'Cover Lumi with the blanket. Slide it onto Lumi.', act: 'drag', item: 'blanket', target: 'lumi', done: { set: { blanket: { x: 380, y: 250, w: 360, h: 120 } } } },
        { say: 'Breathe slowly with Lumi. Press and hold Lumi.', act: 'hold', target: 'lumi', ms: 3000, holdSay: 'In… and out…', done: { lumi: { mood: 'sleepy', zz: true } } }
      ],
      turn: "Shh. Lumi is resting. Now it's your turn to have quiet time.", real: 'I rested', turnPos: 'right'
    },
    bedtime: {
      bg: 'bedroom', night: true, lumi: { x: 120, y: 170, size: 180, wear: 'pj' },
      props: { bed: { art: 'bed', x: 400, y: 180, w: 420, h: 210, z: 2 }, pillow: { art: 'pillow', x: 430, y: 230, w: 120, h: 60, z: 3 }, book: { art: 'book', x: 860, y: 190, w: 80, h: 64, label: 'Story book', hidden: false }, lamp: { art: 'lampOn', x: 860, y: 260, w: 70, h: 120, label: 'Lamp' }, blanket: { art: 'blanket', x: 600, y: 300, w: 200, h: 86, label: 'Blanket', z: 7, hidden: true }, open: { art: 'bookOpen', x: 270, y: 60, w: 180, h: 112, hidden: true, z: 8 } },
      stages: [
        { say: 'Bedtime! Lumi is cosy in pyjamas. Story time. Tap the book.', act: 'tap', target: 'book', done: { hide: ['book'], show: ['open'], lumi: { x: 470, y: 120, mood: 'calm' } } },
        { say: 'The end. Now tap the lamp to turn off the light.', act: 'tap', target: 'lamp', done: { hide: ['open'], set: { lamp: { art: 'lampOff' } }, dark: true, show: ['blanket'] } },
        { say: 'Tuck Lumi in. Slide the blanket onto Lumi.', act: 'drag', item: 'blanket', target: 'lumi', done: { set: { blanket: { x: 440, y: 250, w: 360, h: 120 } }, lumi: { mood: 'sleepy', zz: true } } }
      ],
      turn: "Goodnight, Lumi. Now it's your turn. A story, lights off, and sleep.", real: 'Goodnight!', turnPos: 'right'
    },
    bath: {
      bg: 'bathroom', lumi: { x: 90, y: 180, size: 170 },
      props: { tub: { art: 'bathtub', x: 330, y: 230, w: 380, h: 190, z: 8 }, water: { art: 'tubWater', x: 352, y: 268, w: 336, h: 44, z: 9, hidden: true }, tap: { art: 'tap', x: 690, y: 180, w: 90, h: 80, label: 'Tap' }, sponge: { art: 'sponge', x: 790, y: 300, w: 90, h: 60, label: 'Sponge', hidden: true }, towel: { art: 'towel', x: 110, y: 40, w: 110, label: 'Towel' }, pj: { art: 'pyjamas', x: 250, y: 70, w: 100, h: 92, label: 'Pyjamas', hidden: true } },
      stages: [
        { say: 'Bath time! Turn on the tap.', act: 'tap', target: 'tap', done: { show: ['water', 'sponge'], lumi: { x: 420, y: 110, mood: 'excited' } } },
        { say: 'Scrub Lumi with soap. Rub Lumi with your finger.', act: 'rub', target: 'lumi', need: 560, fx: 'foam', foamGrow: true, rubSay: 'Scrub, scrub, scrub!', done: { foam: 1 } },
        { say: 'Now rinse the bubbles away. Rub again to wash them off.', act: 'rub', target: 'lumi', need: 420, fx: 'drop', foamWash: true, done: { foam: 0, hide: ['water', 'sponge'], lumi: { x: 750, y: 210, mood: 'happy' } } },
        { say: 'Dry Lumi with the towel. Slide the towel to Lumi.', act: 'drag', item: 'towel', target: 'lumi', done: { lumi: { wear: 'towel', mood: 'excited' }, show: ['pj'] } },
        { say: 'Now pyjamas on! Slide the pyjamas to Lumi.', act: 'drag', item: 'pj', target: 'lumi', done: { lumi: { wear: 'pj', mood: 'happy' } } }
      ],
      turn: "Squeaky clean and cosy in pyjamas! Now it's your turn. Have your bath, dry off and put your pyjamas on.", real: 'Bath and pyjamas done', turnPos: 'right'
    },
    shower: {
      bg: 'bathroom', lumi: { x: 90, y: 180, size: 170 },
      props: { head: { art: 'showerHead', x: 420, y: 20, w: 110, label: 'Shower' }, water: { art: 'water', x: 440, y: 100, w: 110, h: 170, hidden: true, z: 9 }, mat: { html: '<span class="sc-mat"></span>', x: 400, y: 360, w: 200, h: 30 }, towel: { art: 'towel', x: 820, y: 150, w: 110, label: 'Towel' }, pj: { art: 'pyjamas', x: 820, y: 160, w: 100, h: 92, label: 'Pyjamas', hidden: true } },
      stages: [
        { say: 'Shower time! Tap the shower to turn on the water. Warm, not too hot.', act: 'tap', target: 'head', done: { show: ['water'], lumi: { x: 410, y: 180, mood: 'excited' } } },
        { say: 'Shampoo and soap. Rub Lumi to make bubbles.', act: 'rub', target: 'lumi', need: 560, fx: 'foam', foamGrow: true, done: { foam: 1 } },
        { say: 'Rinse the bubbles off. Rub again.', act: 'rub', target: 'lumi', need: 420, fx: 'drop', foamWash: true, done: { foam: 0, hide: ['water'], lumi: { x: 600, y: 180 } } },
        { say: 'Dry off with the towel. Slide it to Lumi.', act: 'drag', item: 'towel', target: 'lumi', done: { lumi: { wear: 'towel', mood: 'excited' }, show: ['pj'] } },
        { say: 'Now pyjamas on! Slide the pyjamas to Lumi.', act: 'drag', item: 'pj', target: 'lumi', done: { lumi: { wear: 'pj', mood: 'happy' } } }
      ],
      turn: "All clean and cosy! Now it's your turn. Shower, dry off and put your pyjamas on.", real: 'Shower and pyjamas done', turnPos: 'right'
    },
    school: {
      bg: 'school', lumi: { x: 40, y: 190, size: 170 },
      props: { gate: { art: 'gate', x: 200, y: 130, w: 220, h: 200, label: 'School gate' }, bag: { art: 'bag', x: 120, y: 260, w: 80, label: 'School bag', hidden: true }, cubby: { art: 'cubby', x: 560, y: 160, w: 150, label: 'Cubby' }, teacher: { art: 'teacher', x: 790, y: 130, w: 130, h: 182, label: 'Teacher' } },
      stages: [
        { say: 'Here is school. Walk through the gate. Tap the gate.', act: 'tap', target: 'gate', done: { lumi: { x: 380, y: 190 }, show: ['bag'], set: { bag: { x: 470, y: 280 } } } },
        { say: 'Put the bag in the cubby. Slide the bag.', act: 'drag', item: 'bag', target: 'cubby', done: { hide: ['bag'] } },
        { say: 'Say good morning to the teacher. Tap the teacher.', act: 'tap', target: 'teacher', done: { bubble: { text: 'Good morning, Lumi!', x: 640, y: 50 }, lumi: { x: 620, y: 200, mood: 'excited' } } }
      ],
      turn: "Lumi is ready for school. Now it's your turn. Walk in, put your bag away and say good morning.", real: "I'm at school", turnPos: 'right'
    },
    lunch: {
      bg: 'kitchen', lumi: { x: 369, y: 120, size: 240, z: 2 },
      props: { table: { html: '<span class="sc-tableband"></span>', x: 0, y: 304, w: 980, h: 140, z: 4 }, rice: { art: 'rice', x: 214, y: 249, w: 140, h: 112, label: 'Rice', z: 6 }, chicken: { art: 'chicken', x: 364, y: 254, w: 150, h: 120, label: 'Chicken', z: 6 }, veg: { art: 'veg', x: 524, y: 254, w: 150, h: 120, label: 'Vegetables', z: 6 }, water: { art: 'glass', x: 684, y: 238, w: 80, h: 120, label: 'Water', z: 6 } },
      stages: [
        { say: 'Lunch time! First, wash hands. Then slide the food to Lumi’s mouth.', act: 'drag', items: ['rice', 'chicken', 'veg', 'water'], target: 'mouth', lumiEat: true, onEach: MOUTH_SAYS, done: { lumi: { mood: 'excited' } } }
      ],
      turn: "Yummy lunch! Now it's your turn to eat your lunch.", real: 'I ate!', turnPos: 'right'
    },
    dinner: {
      bg: 'kitchen', night: true, lumi: { x: 369, y: 120, size: 240, z: 2 },
      props: { table: { html: '<span class="sc-tableband"></span>', x: 0, y: 304, w: 980, h: 140, z: 4 }, rice: { art: 'rice', x: 184, y: 249, w: 140, h: 112, label: 'Rice', z: 6 }, fish: { art: 'fish', x: 334, y: 254, w: 150, h: 120, label: 'Fish', z: 6 }, soup: { art: 'soup', x: 494, y: 249, w: 140, h: 112, label: 'Soup', z: 6 }, veg: { art: 'veg', x: 644, y: 254, w: 150, h: 120, label: 'Vegetables', z: 6 } },
      stages: [
        { say: 'Dinner with the family. Slide the food to Lumi’s mouth.', act: 'drag', items: ['rice', 'fish', 'soup', 'veg'], target: 'mouth', lumiEat: true, onEach: MOUTH_SAYS, done: { lumi: { mood: 'excited' } } }
      ],
      turn: "What a yummy dinner. Now it's your turn to eat with your family.", real: 'I ate!', turnPos: 'right'
    },
    homework: {
      bg: 'living', lumi: { x: 100, y: 150, size: 190, z: 2 },
      props: { desk: { art: 'desk', x: 280, y: 250, w: 420, h: 180, z: 4 }, sheet: { art: 'worksheet', x: 820, y: 120, w: 100, h: 125, label: 'Homework sheet' }, pencil: { art: 'pencil', x: 800, y: 300, w: 120, h: 36, label: 'Pencil' }, slot: { html: '<span></span>', x: 430, y: 150, w: 120, h: 110 } },
      stages: [
        { say: 'Homework time. Put the sheet and pencil on the desk.', act: 'drag', items: ['sheet', 'pencil'], target: 'desk', slots: [[440, 130], [560, 220]] },
        { say: 'Do the work. Rub on the sheet to write.', act: 'rub', target: 'sheet', need: 520, fx: 'scribble', rubSay: 'Good thinking!', done: { set: { sheet: { art: 'worksheetDone', x: 440, y: 130 } } } },
        { say: 'All done! Tap the sheet to show your grown-up.', act: 'tap', target: 'sheet', done: { lumi: { mood: 'excited', x: 120, y: 140 } } }
      ],
      turn: "Homework finished! Now it's your turn. Do your homework, then take a break.", real: 'I did it!', turnPos: 'right'
    },
    reading: {
      bg: 'living', lumi: { x: 380, y: 170, size: 190, z: 4 },
      props: { shelf: { art: 'shelf', x: 760, y: 150, w: 170, h: 190 }, book: { art: 'book', x: 790, y: 90, w: 100, h: 80, label: 'Story book' }, bag: { art: 'beanbag', x: 330, y: 300, w: 300, h: 130, z: 3 }, open: { art: 'bookOpen', x: 360, y: 40, w: 230, h: 140, hidden: true, z: 8 } },
      stages: [
        { say: 'Story time. Slide the book to Lumi.', act: 'drag', item: 'book', target: 'lumi', done: { show: ['open'], lumi: { mood: 'calm' } } },
        { say: 'Turn the pages. Tap the book three times.', act: 'tap', target: 'open', count: 3, each: 'flip', counting: true },
        { say: 'The end! Tap the book to close it.', act: 'tap', target: 'open', done: { hide: ['open'], lumi: { mood: 'excited' } } }
      ],
      turn: "What a lovely story. Now it's your turn to read a book.", real: 'I read', turnPos: 'right'
    },
    play: {
      bg: 'living', lumi: { x: 60, y: 180, size: 170 },
      props: { b1: { art: 'block1', x: 300, y: 330, w: 70, label: 'Red block' }, b2: { art: 'block2', x: 400, y: 330, w: 70, label: 'Blue block' }, b3: { art: 'block3', x: 500, y: 330, w: 70, label: 'Yellow block' }, spot: { html: '<span class="sc-spot"></span>', x: 640, y: 344, w: 90, h: 40 }, ball: { art: 'ball', x: 780, y: 290, w: 80, label: 'Ball', hidden: true }, box: { art: 'toybox', x: 760, y: 280, w: 190, h: 124, hidden: true, label: 'Toy box' } },
      stages: [
        { say: 'Play time! Build a tower. Slide the blocks onto the spot.', act: 'drag', items: ['b1', 'b2', 'b3'], target: 'spot', slots: [[650, 300], [650, 230], [650, 160]], onEach: ['One!', 'Two!', 'Three! A tower!'], done: { show: ['ball'] } },
        { say: 'Now bounce the ball. Tap it three times.', act: 'tap', target: 'ball', count: 3, each: 'bounce', counting: true, done: { hide: ['ball', 'b1', 'b2', 'b3'], show: ['box'] } },
        { say: 'Tidy up time. Tap the toy box to put everything away.', act: 'tap', target: 'box', done: { lumi: { mood: 'excited', x: 400, y: 180 } } }
      ],
      turn: "That was fun! Now it's your turn to play, then tidy up.", real: 'I played', turnPos: 'right'
    },
    park: {
      bg: 'park', lumi: { x: 60, y: 200, size: 160 },
      props: { tree: { art: 'tree', x: 20, y: 30, w: 170, h: 230, z: 1 }, swing: { art: 'swing', x: 260, y: 120, w: 240, h: 230, z: 2 }, seat: { art: 'swingSeat', x: 320, y: 128, w: 120, h: 170, z: 3, cls: 'sc-seat', label: 'Swing' }, slide: { art: 'slide', x: 600, y: 130, w: 260, h: 230, z: 2, label: 'Slide' }, bottle: { art: 'bottle', x: 880, y: 300, w: 70, label: 'Water bottle' } },
      stages: [
        { say: 'Let’s go on the swing. Tap the swing.', act: 'tap', target: 'seat', done: { lumi: { x: 305, y: 140, z: 4 }, hide: ['seat'] } },
        { say: 'Push Lumi! Tap Lumi four times.', act: 'tap', target: 'lumi', count: 4, each: 'push', counting: true, done: { show: ['seat'], lumi: { x: 520, y: 210 } } },
        { say: 'Now the slide! Tap the slide.', act: 'tap', target: 'slide', done: { lumi: { x: 760, y: 220, mood: 'excited', anim: 'slidein' } } },
        { say: 'Phew, thirsty! Slide the water bottle to Lumi.', act: 'drag', item: 'bottle', target: 'mouth', lumiEat: true, onEach: ['Glug, glug. Ahh!'] }
      ],
      turn: "The park is fun! Now it's your turn. Remember to drink water and stay with your grown-up.", real: 'I went to the park', turnPos: 'right'
    },
    screen: {
      bg: 'living', lumi: { x: 330, y: 150, size: 190, z: 4 },
      props: { sofa: { art: 'sofa', x: 260, y: 250, w: 340, h: 160, z: 3 }, timer: { art: 'timer', x: 700, y: 150, w: 100, h: 110, label: 'Timer' }, tablet: { art: 'tablet', x: 820, y: 290, w: 120, h: 86, label: 'Tablet' } },
      stages: [
        { say: 'Tablet time. First set the timer. Tap the timer.', act: 'tap', target: 'timer', done: { set: { timer: { art: 'timerOn' } } } },
        { say: 'Now tap the tablet to play.', act: 'tap', target: 'tablet', done: { set: { tablet: { art: 'tabletOn', x: 520, y: 200, z: 7 } }, lumi: { mood: 'excited' } } },
        { say: 'Ding! The timer rang. Time to stop. Tap the tablet to turn it off.', act: 'tap', target: 'tablet', done: { set: { tablet: { art: 'tablet', x: 820, y: 290 } }, lumi: { mood: 'happy' } } }
      ],
      turn: "Lumi stopped when the timer rang. Now it's your turn. When the timer rings, it's time to stop.", real: 'Done', turnPos: 'right'
    },
    therapy: {
      bg: 'living', lumi: { x: 80, y: 180, size: 170 },
      props: { therapist: { art: 'therapist', x: 760, y: 130, w: 130, h: 182, label: 'Therapist' }, board: { art: 'puzzleBoard', x: 380, y: 250, w: 220, h: 132 }, p1: { art: 'puzzle1', x: 620, y: 330, w: 70, label: 'Green piece' }, p2: { art: 'puzzle2', x: 260, y: 330, w: 70, label: 'Pink piece' } },
      stages: [
        { say: 'Time to see the therapist. Tap to say hello.', act: 'tap', target: 'therapist', done: { bubble: { text: 'Hello, Lumi! Let’s play.', x: 600, y: 50 }, lumi: { x: 200, y: 160 } } },
        { say: 'Let’s do a puzzle together. Slide the pieces onto the board.', act: 'drag', items: ['p1', 'p2'], target: 'board', slots: [[402, 266], [492, 266]] },
        { say: 'Great work! Take a big breath together. Press and hold Lumi.', act: 'hold', target: 'lumi', ms: 2500, holdSay: 'Breathe in… and out…', done: { lumi: { mood: 'excited' } } }
      ],
      turn: "Well done! Now it's your turn to see your therapist.", real: "I'm there", turnPos: 'right'
    },
    train: {
      bg: 'station', lumi: { x: 40, y: 150, size: 170 },
      props: { gantry: { art: 'gantry', x: 230, y: 160, w: 160, h: 180, label: 'Gantry' }, card: { art: 'card', x: 120, y: 340, w: 76, label: 'Card' }, line: { art: 'linespot', x: 520, y: 330, w: 200, h: 40, label: 'Yellow line', hidden: true }, train: { art: 'train', x: 1000, y: 120, w: 420, h: 180, z: 2, label: 'Train', cls: 'sc-train' } },
      stages: [
        { say: 'Tap your card at the gantry. Slide the card to the gantry.', act: 'drag', item: 'card', target: 'gantry', sound: 'chime', done: { set: { gantry: { art: 'gantryOpen' } }, lumi: { x: 240, y: 150 }, show: ['line'] } },
        { say: 'Wait behind the yellow line. Tap the yellow line.', act: 'tap', target: 'line', done: { lumi: { x: 540, y: 160 }, set: { train: { x: 520, y: 40, cls: 'sc-train arrive' } } } },
        { say: 'Here comes the train! Let people off first. Then tap the train to get on.', act: 'tap', target: 'train', done: { lumi: { x: 640, y: 80, size: 130, z: 3 } } }
      ],
      turn: "Lumi is on the train. Now it's your turn. Tap your card, wait behind the line, and let people off first.", real: "I'm on the train", turnPos: 'left'
    },
    dentist: {
      bg: 'clinic', lumi: { x: 60, y: 190, size: 160 },
      props: { chair: { art: 'dentChair', x: 300, y: 170, w: 260, h: 200, label: 'Dentist chair' }, doc: { art: 'dentistP', x: 640, y: 120, w: 130, h: 182, label: 'Dentist' }, sticker: { art: 'sticker', x: 820, y: 280, w: 80, label: 'Sticker', hidden: true } },
      stages: [
        { say: 'Hello, dentist! Sit in the big chair. Tap the chair.', act: 'tap', target: 'chair', done: { lumi: { x: 380, y: 110, mood: 'calm' } } },
        { say: 'Open wide! Press and hold Lumi while the dentist counts to five.', act: 'hold', target: 'lumi', ms: 4000, holdSay: 'One, two, three, four, five.', done: { show: ['sticker'], lumi: { mood: 'excited' } } },
        { say: 'All done! Tap your sticker.', act: 'tap', target: 'sticker', done: { set: { sticker: { x: 470, y: 250, z: 9 } } } }
      ],
      turn: "Brave Lumi! Now it's your turn to visit the dentist.", real: "I'm there", turnPos: 'right'
    },
    haircut: {
      bg: 'salon', lumi: { x: 60, y: 190, size: 160 },
      props: { chair: { art: 'barberChair', x: 330, y: 160, w: 200, h: 220, label: 'Chair' }, mirror: { art: 'mirror', x: 600, y: 60, w: 130, h: 168, label: 'Mirror' }, cape: { art: 'cape', x: 800, y: 300, w: 110, h: 84, label: 'Cape' }, scissors: { art: 'scissors', x: 790, y: 160, w: 100, h: 80, label: 'Scissors' }, cut: { html: '<span></span>', x: 0, y: 0, w: 1, hidden: true } },
      stages: [
        { say: 'Haircut time. Sit in the chair. Tap the chair.', act: 'tap', target: 'chair', done: { lumi: { x: 350, y: 100, mood: 'calm' } } },
        { say: 'Put on the cape, like a superhero! Slide it to Lumi.', act: 'drag', item: 'cape', target: 'lumi', done: { lumi: { wear: 'cape' } } },
        { say: 'Snip, snip. Tap the scissors three times.', act: 'tap', target: 'scissors', count: 3, each: 'snip', counting: true },
        { say: 'Look in the mirror! Tap the mirror.', act: 'tap', target: 'mirror', done: { lumi: { wear: null, mood: 'excited' } } }
      ],
      turn: "Lumi looks great! Now it's your turn for a haircut.", real: "I'm there", turnPos: 'right'
    },
    laundry: {
      bg: 'laundry', lumi: { x: 60, y: 190, size: 160 },
      props: { washer: { art: 'washer', x: 420, y: 150, w: 200, h: 222, label: 'Washing machine' }, s1: { art: 'shirtR', x: 700, y: 300, w: 90, h: 84, label: 'Red shirt' }, s2: { art: 'shirtY', x: 790, y: 300, w: 90, h: 84, label: 'Yellow shirt' }, sock: { art: 'sock', x: 880, y: 300, w: 60, h: 78, label: 'Sock' }, soap: { art: 'detergent', x: 260, y: 290, w: 76, h: 104, label: 'Detergent', hidden: true }, start: { art: 'startBtn', x: 640, y: 150, w: 70, label: 'Start button', hidden: true } },
      stages: [
        { say: 'Laundry time. Put the clothes in the washing machine.', act: 'drag', items: ['s1', 's2', 'sock'], target: 'washer', done: { show: ['soap'] } },
        { say: 'Add the detergent. Slide it to the machine.', act: 'drag', item: 'soap', target: 'washer', done: { show: ['start'] } },
        { say: 'Press start!', act: 'tap', target: 'start', done: { set: { washer: { art: 'washerOn', cls: 'spin' } }, hide: ['start'], lumi: { mood: 'excited' } } }
      ],
      turn: "The washing machine is on. Now it's your turn to do the laundry.", real: 'I did it!', turnPos: 'right'
    },
    chores: {
      bg: 'bedroom', lumi: { x: 60, y: 180, size: 170 },
      props: { box: { art: 'toybox', x: 380, y: 270, w: 200, h: 130, label: 'Toy box' }, teddy: { art: 'teddy', x: 660, y: 290, w: 80, h: 90, label: 'Teddy' }, ball: { art: 'ball', x: 760, y: 310, w: 70, label: 'Ball' }, car: { art: 'car', x: 840, y: 330, w: 100, h: 55, label: 'Toy car' }, bed: { art: 'bed', x: 620, y: 80, w: 330, h: 165, z: 1 }, mess: { art: 'blanketFold', x: 700, y: 120, w: 160, h: 40, z: 2, label: 'Messy blanket' } },
      stages: [
        { say: 'Tidy up time. Put the toys in the toy box.', act: 'drag', items: ['teddy', 'ball', 'car'], target: 'box', onEach: ['In it goes!', 'Nice!', 'All the toys are away!'] },
        { say: 'Now make the bed. Rub the blanket to make it smooth.', act: 'rub', target: 'mess', need: 380, fx: 'sparkle', done: { set: { mess: { art: 'blanket', x: 650, y: 120, w: 280, h: 90 } }, lumi: { mood: 'excited' } } }
      ],
      turn: "The room is tidy! Now it's your turn to tidy up.", real: 'I tidied', turnPos: 'left'
    },
    cook: {
      bg: 'kitchen', lumi: { x: 60, y: 170, size: 170 },
      props: { stove: { art: 'stove', x: 360, y: 340, w: 280, h: 60, z: 3 }, pot: { art: 'pot', x: 400, y: 236, w: 200, h: 120, z: 4, label: 'Pot' }, egg: { art: 'egg', x: 690, y: 320, w: 56, h: 66, label: 'Egg' }, carrot: { art: 'carrot', x: 770, y: 300, w: 56, h: 84, label: 'Carrot' }, tomato: { art: 'tomato', x: 850, y: 316, w: 66, label: 'Tomato' }, bowl: { art: 'bowlFood', x: 700, y: 200, w: 110, h: 88, hidden: true, label: 'Bowl' } },
      stages: [
        { say: 'Let’s cook! Ask a grown-up to help with hot things. Put the food in the pot.', act: 'drag', items: ['egg', 'carrot', 'tomato'], target: 'pot', done: { set: { pot: { art: 'potFull' } } } },
        { say: 'Stir the pot. Rub round and round.', act: 'rub', target: 'pot', need: 500, fx: 'steam', rubSay: 'Stir, stir, stir!' },
        { say: 'Dinner is ready. Tap the pot to serve it.', act: 'tap', target: 'pot', done: { show: ['bowl'], lumi: { mood: 'excited' } } }
      ],
      turn: "Lumi helped cook! Now it's your turn to help make dinner with your grown-up.", real: 'I helped!', turnPos: 'right'
    },
    hawker: {
      bg: 'hawker', lumi: { x: 40, y: 190, size: 160 },
      props: { stall: { art: 'stall', x: 620, y: 40, w: 260, h: 220, label: 'Noodle stall' }, uncle: { art: 'uncle', x: 706, y: 100, w: 86, h: 120, z: 4 }, table: { art: 'hawkerTable', x: 250, y: 260, w: 260, h: 140 }, tissue: { art: 'tissue', x: 140, y: 360, w: 80, h: 50, label: 'Tissue packet' }, card: { art: 'card', x: 210, y: 360, w: 70, label: 'Card', hidden: true }, noodles: { art: 'noodles', x: 690, y: 200, w: 100, h: 80, hidden: true, label: 'Noodles', z: 5 } },
      stages: [
        { say: 'Lunch at the hawker centre. Chope a seat. Slide the tissue packet onto the table.', act: 'drag', item: 'tissue', target: 'table', slots: [[340, 262]], done: { show: ['card'] } },
        { say: 'Order at the noodle stall. Tap the stall.', act: 'tap', target: 'stall', done: { bubble: { text: 'What would you like?', x: 600, y: 270 }, lumi: { x: 500, y: 200 } } },
        { say: 'Pay with your card. Slide the card to the stall.', act: 'drag', item: 'card', target: 'stall', sound: 'chime', done: { show: ['noodles'], bubble: { text: 'Thank you!', x: 620, y: 270 } } },
        { say: 'Carry the noodles to Lumi. Slide them to Lumi’s mouth.', act: 'drag', item: 'noodles', target: 'mouth', lumiEat: true, onEach: ['Slurp! Yummy noodles!'], done: { lumi: { mood: 'excited' } } }
      ],
      turn: "Lumi ordered lunch! Now it's your turn at the hawker centre.", real: 'I ate!', turnPos: 'left'
    },
    prepare: {
      bg: 'bedroom', night: true, lumi: { x: 60, y: 180, size: 170 },
      props: { bag: { art: 'bag', x: 420, y: 220, w: 150, label: 'Bag' }, folder: { art: 'folder', x: 640, y: 300, w: 80, label: 'Folder' }, pencils: { art: 'pencilcase', x: 730, y: 300, w: 80, label: 'Pencil case' }, bottle: { art: 'bottle', x: 820, y: 290, w: 80, label: 'Water bottle' }, phone: { art: 'phone', x: 660, y: 120, w: 50, h: 84, label: 'Phone' }, charger: { art: 'charger', x: 820, y: 150, w: 100, h: 60, label: 'Charger' } },
      stages: [
        { say: 'Get ready for tomorrow. Pack your bag.', act: 'drag', items: ['folder', 'pencils', 'bottle'], target: 'bag', onEach: ['Packed!', 'In it goes!', 'Bag ready!'] },
        { say: 'Charge the phone. Slide it to the charger.', act: 'drag', item: 'phone', target: 'charger', slots: [[836, 90]], done: { lumi: { mood: 'excited' } } }
      ],
      turn: "All ready for tomorrow! Now it's your turn to pack your bag and charge your phone.", real: "I'm ready", turnPos: 'right'
    },
    work: {
      bg: 'cafe', lumi: { x: 40, y: 190, size: 160 },
      props: { board: { art: 'board', x: 230, y: 90, w: 130, h: 112, label: 'Sign-in board' }, table: { art: 'cafeTable', x: 480, y: 260, w: 280, h: 130 }, dirt: { art: 'dirt', x: 560, y: 248, w: 110, h: 40, z: 5, label: 'Table to wipe' }, n1: { art: 'napkin', x: 820, y: 330, w: 70, h: 60, label: 'Napkin' }, n2: { art: 'napkin', x: 900, y: 330, w: 70, h: 60, label: 'Napkin' }, boss: { art: 'teacher', x: 820, y: 110, w: 110, h: 154, z: 2 } },
      stages: [
        { say: 'Work training. First, sign in. Tap the board.', act: 'tap', target: 'board', done: { lumi: { x: 380, y: 190 } } },
        { say: 'Wipe the table. Rub it clean.', act: 'rub', target: 'dirt', need: 420, fx: 'sparkle', done: { hide: ['dirt'] } },
        { say: 'Put the napkins on the table.', act: 'drag', items: ['n1', 'n2'], target: 'table', slots: [[520, 220], [660, 220]], done: { bubble: { text: 'Great work, Lumi!', x: 680, y: 40 }, lumi: { mood: 'excited' } } }
      ],
      turn: "Good job at work! Now it's your turn. Sign in, check your tasks, and ask if you're not sure.", real: "I'm at work", turnPos: 'right'
    }
  };
  // ---------------------------------------------------------------- difficulty (Grown-ups > Child > Difficulty)
  // Easy:      shorter games. Only the first two things to slide, two taps instead of three, less rubbing,
  //            shorter press-and-hold. The glow and the guide hand come early.
  // Medium:    the full game.
  // Challenge: the full game with more rubbing and holding, and no glowing hints (the hand still helps
  //            if the child waits).
  const clone = (o) => (Array.isArray(o) ? o.map(clone) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clone(v)])) : o);
  function forLevel(cfg, lv) {
    if (lv === 2) return cfg;
    const c = clone(cfg);
    c.stages.forEach((st) => {
      if (lv === 1) {
        if (st.act === 'drag' && st.items && st.items.length > 2) {
          st.items.slice(2).forEach((id) => { if (c.props[id]) c.props[id].hidden = true; });
          st.items = st.items.slice(0, 2);
          if (st.slots) st.slots = st.slots.slice(0, 2);
        }
        if (st.act === 'tap' && st.count > 2) { st.count = 2; st.say = st.say.replace(/three times/i, 'two times'); }
        if (st.act === 'rub') st.need = Math.round((st.need || 520) * 0.6);
        if (st.act === 'hold') st.ms = Math.round((st.ms || 1500) * 0.6);
      } else {
        // Challenge at meals: a teddy sits among the food. Only the food goes to Lumi's mouth.
        if (st.act === 'drag' && st.items && st.target === 'mouth' && !c.props.__teddy) {
          const right = Math.max(...st.items.map((id) => (c.props[id] ? c.props[id].x + c.props[id].w : 0)));
          c.props.__teddy = { art: 'teddy', x: Math.min(880, right + 18), y: 236, w: 80, h: 90, label: 'Teddy', z: 6 };
          st.wrong = ['__teddy'];
          st.wrongSay = "That's Teddy! Lumi can't eat Teddy. Pick the food.";
          st.say = st.say.replace('Slide the food', 'Slide only the food');
          // once the food is eaten, Teddy goes back to the toy box
          st.done = Object.assign({}, st.done, { hide: ((st.done && st.done.hide) || []).concat(['__teddy']) });
        }
        if (st.act === 'rub') st.need = Math.round((st.need || 520) * 1.3);
        if (st.act === 'hold') st.ms = Math.round((st.ms || 1500) * 1.3);
      }
    });
    return c;
  }
  const levelNow = () => (A.level ? A.level() : state.profile.level || 2);
  function levelled(cfg) {
    const byLv = { 1: makeScene(forLevel(cfg, 1)), 2: makeScene(cfg), 3: makeScene(forLevel(cfg, 3)) };
    const pick = (g) => byLv[(g && g.lv) || levelNow()] || byLv[2];
    const out = { cfg };
    ['total', 'progress', 'voice', 'guide', 'scene', 'tap', 'after'].forEach((k) => { out[k] = (g, ...rest) => pick(g)[k] && pick(g)[k](g, ...rest); });
    out.init = (step) => Object.assign(byLv[levelNow()].init(step), { lv: levelNow() });
    out.real = byLv[2].real;
    return out;
  }
  Object.entries(STEPS).forEach(([id, cfg]) => { G[id] = levelled(cfg); });

  // ---------------------------------------------------------------- Reading: your own book, or a Lumi story
  // Grown-ups choose how reading time works (Settings > Play and breaks): the child chooses, their own book,
  // or a Lumi story. "Your own book" plays the Lumi reading scene, then the child reads a real book.
  // "A Lumi story" opens today's story from the Stories shelf (a different one each day); at "The end" the
  // child taps "Back to My day" and the reading step is done.
  const readScene = G.reading;
  const readPref = () => state.settings.reading || 'choose';
  function storyOfDay() {
    const list = A.storiesForAge ? A.storiesForAge() : D.STORIES;
    if (!list.length) return null;
    const d = new Date();
    const n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    return list[n % list.length];
  }
  function openStory(story) {
    S.storyDay = { i: S.day ? S.day.i : -1 };
    if (story) A.ACTIONS.stOpen({ v: story.id });
    else A.go('stories', 'Pick a story to read with Lumi.');
  }
  function pickHtml() {
    const sd = storyOfDay();
    const pref = readPref();
    const own = `<button class="rd-card own" data-a="sgTap" data-k="rd-own" aria-label="My own book">
        <span class="rd-art">${ART.bookOpen}</span><b>My own book</b><span>Read a real book with a grown-up</span></button>`;
    const lumi = sd ? `<div class="rd-col"><button class="rd-card story" data-a="sgTap" data-k="rd-story" aria-label="Today's Lumi story: ${esc(sd.title)}" style="background:${sd.tint}">
        <span class="story-cover rd-cover">${A.storyCover ? A.storyCover(sd) : ''}<span class="cover-lumi">${L.svg({ look: A.dayLook(), mood: 'happy', size: 66 })}</span></span>
        <b>Today's Lumi story</b><span>${esc(sd.title)}</span></button>
        <button class="rd-more" data-a="sgTap" data-k="rd-more">${ic('storybook', 26)}<span>Pick another story</span></button></div>` : '';
    return `<div class="panel scene grow sg rd-pick">
      <div class="rd-lumi">${L.svg({ look: A.dayLook(), mood: 'happy', size: 170, label: 'Lumi' })}<span class="rd-say">Which book shall we read?</span></div>
      <div class="rd-cards">${pref === 'story' ? '' : own}${lumi}</div>
    </div>`;
  }
  G.reading = Object.assign({}, readScene, {
    init: (step) => Object.assign(readScene.init(step), { pick: readPref() === 'own' ? 'own' : null }),
    progress: (g) => (g.pick ? readScene.progress(g) : 0),
    voice: (g) => {
      if (g.pick) return readScene.voice(g);
      const sd = storyOfDay();
      if (readPref() === 'story' && sd) return `Story time! Today's Lumi story is ${sd.title}. Tap the book to read it.`;
      return "Story time! Do you want to read your own book, or today's Lumi story?";
    },
    guide: (g) => (g.pick ? readScene.guide(g) : { sel: readPref() === 'story' ? '.rd-card.story' : '.rd-card.own', say: 'Pick a book.' }),
    scene: (g, info) => (g.pick ? readScene.scene(g, info) : pickHtml()),
    after: (g, box) => {
      if (!g.pick) { S.storyDay = null; return; }
      if (readScene.after) readScene.after(g, box);
    },
    tap: (g, k, el) => {
      if (k === 'rd-own') { g.pick = 'own'; ack(); render(); say(readScene.voice(g)); return; }
      if (k === 'rd-story') { ack(); openStory(storyOfDay()); return; }
      if (k === 'rd-more') { ack(); openStory(null); return; }
      readScene.tap(g, k, el);
    }
  });

  // ---------------------------------------------------------------- grown-ups' own steps, and the quick version
  // Lumi holds up the step's picture (or photo), does it with the child, then "Your turn!"
  G.generic = {
    init: () => ({ st: 0 }),
    total: () => 2,
    progress: (g) => (g.phase === 'turn' ? 2 : g.st),
    real: 'I did it!',
    voice: (g) => {
      const info = A.stepInfo(S.day.plan[S.day.i]);
      return g.phase === 'turn' ? `Now it's your turn. ${info.voice}` : g.st === 0 ? `${info.voice} Tap the picture to do it with Lumi.` : 'Lumi is doing it. Tap Lumi to cheer!';
    },
    guide: (g) => (g.phase === 'turn' ? { sel: '[data-a="sgReal"]', say: 'Do it for real, then tap the green button.' } : { sel: g.st === 0 ? '.gn-pic' : '.gn-lumi', say: g.st === 0 ? 'Tap the picture.' : 'Tap Lumi.' }),
    scene(g, info) {
      const pic = info.photo ? `<img src="${info.photo}" alt="">` : A.stepArt(info, 170);
      const doing = g.st >= 1 || g.phase === 'turn';
      return `<div class="panel scene grow sg gn" style="background:${info.tint}">
        <div class="floor" style="height:22%"></div>
        <button class="gn-pic ${doing ? 'held' : ''}" data-a="sgTap" data-k="pic" aria-label="${esc(info.label)}">${pic}<span>${esc(info.label)}</span></button>
        <button class="gn-lumi ${doing ? 'doing' : ''} ${g.phase === 'turn' ? 'hop' : ''}" data-a="sgTap" data-k="lumi" aria-label="Lumi">${L.svg({ look: A.dayLook(), mood: g.phase === 'turn' ? 'excited' : doing ? 'happy' : 'calm', wave: doing, size: 230, label: 'Lumi' })}</button>
        ${g.phase === 'turn' ? turnCard(info, info.voice, 'right') : ''}
      </div>`;
    },
    tap(g, k) {
      if (g.phase === 'turn') return;
      if (k === 'pic' && g.st === 0) { g.st = 1; ack(); render(); say('Let’s do it together!'); return; }
      if (k === 'lumi' && g.st === 1) { chime(); SG.setPhase(g, 'turn'); }
    }
  };
})();
