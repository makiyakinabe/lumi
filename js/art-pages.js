/*
  art-pages.js
  More colouring pages for the Art studio, sorted into groups the child can pick from:
  Lumi and flowers, Animals, Places, Transport, Toys, Home things and Food.
  Each page is drawn in Lumi's style (thick soft outlines, big simple parts that are easy to tap).
  A part is [id, guide colour, [dot x, dot y], one svg shape]; the guide colour is the number of a crayon
  in art.js (0 red, 1 orange, 2 yellow, 3 green, 4 teal, 5 blue, 6 purple, 7 pink, 8 brown, 9 peach,
  10 grey, 11 white, 12 light blue, 13 dark brown). "lines" are drawn on top and cannot be coloured.
  The page area is 600 x 450.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const PAGES = A.artPages;
  if (!PAGES) return;
  const INK = '#3B2F2F';
  const P = (id, g, dot, el) => ({ id, g, dot, el });
  const sky = (g) => P('sky', g === undefined ? 12 : g, [40, 40], '<rect x="0" y="0" width="600" height="450"/>');
  const cloud = (id, x, y) => P(id, 11, [x + 60, y + 30], `<path d="M${x} ${y + 36}a30 30 0 0 1 30-36 36 36 0 0 1 66-6 28 28 0 0 1 38 26 22 22 0 0 1-6 42H${x + 16}a22 22 0 0 1-16-26z"/>`);
  const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r || 10}" fill="${INK}"/><circle cx="${x + 3}" cy="${y - 3}" r="${(r || 10) * 0.32}" fill="#fff"/>`;
  // a tilted oval as a path (a transform would be undone by the "pop" when a part is coloured)
  const oval = (cx, cy, rx, ry, deg) => {
    const t = (deg * Math.PI) / 180, dx = rx * Math.cos(t), dy = rx * Math.sin(t);
    const a = `${(cx - dx).toFixed(1)} ${(cy - dy).toFixed(1)}`, b = `${(cx + dx).toFixed(1)} ${(cy + dy).toFixed(1)}`;
    return `<path d="M${a}A${rx} ${ry} ${deg} 1 0 ${b}A${rx} ${ry} ${deg} 1 0 ${a}Z"/>`;
  };
  const smile = (x, y, w) => `<path d="M${x - w} ${y}q${w} ${w * 0.9} ${w * 2} 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;

  const MORE = [
    // ------------------------------------------------------------ Animals
    { id: 'cat', name: 'Cat', parts: [
      sky(12),
      P('floor', 8, [40, 425], '<rect x="0" y="330" width="600" height="120"/>'),
      P('rug', 6, [130, 384], '<ellipse cx="300" cy="380" rx="220" ry="44"/>'),
      P('yarn', 5, [110, 330], '<circle cx="110" cy="330" r="36"/>'),
      P('tail', 1, [470, 262], '<path d="M396 340C470 330 506 282 476 236C466 222 448 230 454 246C474 282 452 312 392 316Z"/>'),
      P('body', 1, [228, 330], '<ellipse cx="300" cy="306" rx="106" ry="78"/>'),
      P('tummy', 11, [300, 334], '<ellipse cx="300" cy="322" rx="50" ry="50"/>'),
      P('pawL', 11, [258, 374], '<ellipse cx="258" cy="372" rx="32" ry="18"/>'), P('pawR', 11, [342, 374], '<ellipse cx="342" cy="372" rx="32" ry="18"/>'),
      P('earL', 1, [232, 116], '<polygon points="214,160 232,84 284,138"/>'), P('earR', 1, [368, 116], '<polygon points="386,160 368,84 316,138"/>'),
      P('inL', 7, [240, 126], '<polygon points="228,146 238,106 262,134"/>'), P('inR', 7, [360, 126], '<polygon points="372,146 362,106 338,134"/>'),
      P('head', 1, [300, 128], '<circle cx="300" cy="180" r="84"/>'),
      P('collar', 0, [258, 262], '<rect x="240" y="252" width="120" height="18" rx="9"/>'),
      P('bell', 2, [300, 280], '<circle cx="300" cy="280" r="13"/>')],
      lines: `${eye(268, 176, 11)}${eye(332, 176, 11)}<path d="M292 198h16l-8 9z" fill="#F28DB2" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M300 207q-10 12-20 4M300 207q10 12 20 4" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M250 200h-46M252 212l-42 10M350 200h46M348 212l42 10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M84 314q26 16 52-4M80 336q30 12 60-6M92 354q20 8 40-2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` },
    { id: 'butterfly', name: 'Butterfly', parts: [
      sky(12),
      P('sun', 2, [70, 70], '<circle cx="70" cy="70" r="40"/>'),
      P('grass', 3, [40, 425], '<path d="M0 380Q150 356 300 378T600 370V450H0Z"/>'),
      P('flowerL', 7, [80, 380], '<circle cx="80" cy="380" r="24"/>'), P('flowerR', 0, [530, 384], '<circle cx="530" cy="384" r="24"/>'),
      P('wingUL', 6, [168, 196], oval(216, 172, 94, 70, -22)),
      P('wingUR', 6, [432, 196], oval(384, 172, 94, 70, 22)),
      P('wingLL', 7, [214, 306], oval(238, 288, 62, 50, 24)),
      P('wingLR', 7, [386, 306], oval(362, 288, 62, 50, -24)),
      P('spotL', 2, [212, 160], '<circle cx="212" cy="160" r="26"/>'), P('spotR', 2, [388, 160], '<circle cx="388" cy="160" r="26"/>'),
      P('dotL', 4, [246, 290], '<circle cx="246" cy="290" r="16"/>'), P('dotR', 4, [354, 290], '<circle cx="354" cy="290" r="16"/>'),
      P('body', 13, [300, 270], '<ellipse cx="300" cy="236" rx="20" ry="92"/>'),
      P('head', 13, [300, 128], '<circle cx="300" cy="128" r="24"/>')],
      lines: `<path d="M292 108q-18-46-46-54M308 108q18-46 46-54" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="246" cy="54" r="7" fill="${INK}"/><circle cx="354" cy="54" r="7" fill="${INK}"/><circle cx="292" cy="124" r="4" fill="#fff"/><circle cx="308" cy="124" r="4" fill="#fff"/><path d="M80 404v40M530 408v36" stroke="#4F8A3F" stroke-width="6" stroke-linecap="round"/><path d="M70 16v-12M70 128v-12M12 70h-10M136 70h-10" stroke="#E0B12F" stroke-width="6" stroke-linecap="round"/>` },

    // ------------------------------------------------------------ Places
    { id: 'playground', name: 'Playground', parts: [
      sky(12),
      P('sun', 2, [530, 70], '<circle cx="530" cy="70" r="40"/>'),
      cloud('cloud', 270, 50),
      P('grass', 3, [40, 425], '<path d="M0 330Q300 300 600 330V450H0Z"/>'),
      P('sand', 9, [300, 412], '<ellipse cx="300" cy="410" rx="120" ry="28"/>'),
      P('tower', 5, [155, 300], '<rect x="110" y="170" width="90" height="170" rx="6"/>'),
      P('roof', 0, [155, 160], '<polygon points="94,178 155,108 216,178"/>'),
      P('slide', 2, [300, 270], '<path d="M200 190L392 330H428V352H368L200 228Z"/>'),
      P('frame', 7, [454, 300], '<path d="M430 340L472 168H560L592 340H572L546 190H486L450 340Z"/>'),
      P('seat', 1, [516, 290], '<rect x="486" y="282" width="60" height="16" rx="7"/>'),
      P('ball', 0, [86, 396], '<circle cx="86" cy="396" r="26"/>')],
      lines: `<path d="M122 214h66M122 252h66M122 290h66" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M494 190v92M538 190v92" stroke="${INK}" stroke-width="3"/><path d="M64 384q22 14 44 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>` },
    { id: 'beach', name: 'Beach', parts: [
      sky(12),
      P('sun', 2, [520, 66], '<circle cx="520" cy="66" r="42"/>'),
      cloud('cloud', 70, 50),
      P('sea', 5, [40, 250], '<rect x="0" y="200" width="600" height="130"/>'),
      P('sail', 11, [470, 214], '<polygon points="458,232 458,150 506,232"/>'),
      P('boat', 0, [460, 248], '<path d="M404 236H524L504 262H424Z"/>'),
      P('sand', 9, [40, 425], '<path d="M0 300Q300 268 600 300V450H0Z"/>'),
      P('pole', 8, [240, 330], '<rect x="234" y="214" width="12" height="160" rx="5"/>'),
      P('umbrella', 0, [184, 206], '<path d="M140 222A100 72 0 0 1 340 222Z"/>'),
      P('towel', 4, [400, 406], '<polygon points="330,382 470,382 502,432 298,432"/>'),
      P('bucket', 2, [115, 384], '<path d="M88 352H142L134 412H96Z"/>'),
      P('shell', 7, [540, 410], '<path d="M512 420Q540 372 568 420Z"/>')],
      lines: `<path d="M240 150v72M240 150L180 222M240 150L300 222" stroke="${INK}" stroke-width="3"/><path d="M92 352q23-34 46 0" fill="none" stroke="${INK}" stroke-width="4"/><path d="M30 252q20-10 40 0t40 0M200 290q20-10 40 0t40 0M360 280q20-10 40 0t40 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/><path d="M340 396h120M330 412h140" stroke="#fff" stroke-width="5" opacity=".7"/><path d="M526 418l14-30M554 418l-14-30" stroke="${INK}" stroke-width="3"/>` },

    // ------------------------------------------------------------ Transport
    { id: 'bus', name: 'Bus', parts: [
      sky(12),
      P('sun', 2, [540, 60], '<circle cx="540" cy="60" r="36"/>'),
      P('tree', 3, [60, 190], '<circle cx="60" cy="200" r="50"/>'),
      P('trunk', 8, [60, 290], '<rect x="50" y="240" width="20" height="96" rx="5"/>'),
      P('road', 10, [40, 420], '<rect x="0" y="330" width="600" height="120"/>'),
      P('body', 3, [140, 300], '<rect x="100" y="140" width="420" height="200" rx="32"/>'),
      P('sign', 13, [140, 168], '<rect x="124" y="156" width="130" height="34" rx="8"/>'),
      P('win1', 12, [160, 238], '<rect x="124" y="204" width="80" height="64" rx="12"/>'), P('win2', 12, [256, 238], '<rect x="216" y="204" width="80" height="64" rx="12"/>'),
      P('win3', 12, [348, 238], '<rect x="308" y="204" width="80" height="64" rx="12"/>'),
      P('door', 12, [456, 260], '<rect x="404" y="176" width="96" height="150" rx="10"/>'),
      P('stripe', 2, [150, 296], '<rect x="100" y="286" width="300" height="20"/>'),
      P('light', 2, [506, 312], '<circle cx="506" cy="312" r="12"/>'),
      P('wheel1', 13, [190, 344], '<circle cx="190" cy="344" r="30"/>'), P('wheel2', 13, [430, 344], '<circle cx="430" cy="344" r="30"/>')],
      lines: `<text x="189" y="182" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="24" fill="#F6A23A">54</text><path d="M452 176v150" stroke="${INK}" stroke-width="3"/><circle cx="190" cy="344" r="10" fill="#D8DEE4" stroke="${INK}" stroke-width="3"/><circle cx="430" cy="344" r="10" fill="#D8DEE4" stroke="${INK}" stroke-width="3"/><path d="M30 400h70M180 400h70M330 400h70M480 400h70" stroke="#fff" stroke-width="8" stroke-linecap="round"/>` },
    { id: 'plane', name: 'Aeroplane', parts: [
      sky(12),
      P('sun', 2, [530, 70], '<circle cx="530" cy="70" r="42"/>'),
      cloud('cloud1', 60, 60), cloud('cloud2', 380, 300),
      P('hills', 3, [60, 425], '<path d="M0 390Q120 330 240 380T480 370T600 380V450H0Z"/>'),
      P('wingBack', 5, [280, 176], '<polygon points="262,212 322,212 288,146 254,146"/>'),
      P('tail', 0, [146, 168], '<polygon points="122,212 180,212 156,128 118,128"/>'),
      P('body', 11, [220, 250], '<path d="M110 232Q110 202 150 202H440Q500 202 524 232Q500 262 440 262H150Q110 262 110 232Z"/>'),
      P('stripe', 0, [180, 240], '<rect x="112" y="234" width="390" height="12"/>'),
      P('cockpit', 12, [478, 222], '<path d="M462 212H486Q506 214 512 228H462Z"/>'),
      P('win1', 12, [330, 222], '<circle cx="330" cy="222" r="10"/>'), P('win2', 12, [366, 222], '<circle cx="366" cy="222" r="10"/>'), P('win3', 12, [402, 222], '<circle cx="402" cy="222" r="10"/>'),
      P('wing', 5, [262, 300], '<polygon points="250,244 330,244 266,340 214,340"/>')],
      lines: '' },

    // ------------------------------------------------------------ Toys
    { id: 'teddy', name: 'Teddy bear', parts: [
      sky(9),
      P('floor', 8, [40, 425], '<rect x="0" y="380" width="600" height="70"/>'),
      P('earL', 8, [196, 104], '<circle cx="214" cy="112" r="40"/>'), P('earR', 8, [404, 104], '<circle cx="386" cy="112" r="40"/>'),
      P('inL', 9, [214, 114], '<circle cx="214" cy="114" r="20"/>'), P('inR', 9, [386, 114], '<circle cx="386" cy="114" r="20"/>'),
      P('body', 8, [240, 300], '<ellipse cx="300" cy="306" rx="96" ry="86"/>'),
      P('tummy', 9, [300, 320], '<ellipse cx="300" cy="318" rx="54" ry="50"/>'),
      P('armL', 8, [196, 300], oval(200, 296, 30, 56, 24)),
      P('armR', 8, [404, 300], oval(400, 296, 30, 56, -24)),
      P('legL', 8, [232, 392], '<ellipse cx="236" cy="390" rx="48" ry="30"/>'), P('legR', 8, [368, 392], '<ellipse cx="364" cy="390" rx="48" ry="30"/>'),
      P('padL', 9, [226, 392], '<circle cx="226" cy="392" r="16"/>'), P('padR', 9, [374, 392], '<circle cx="374" cy="392" r="16"/>'),
      P('head', 8, [300, 116], '<circle cx="300" cy="166" r="86"/>'),
      P('muzzle', 9, [300, 206], '<ellipse cx="300" cy="200" rx="40" ry="30"/>'),
      P('bowL', 0, [268, 252], '<path d="M300 252L262 236V268Z"/>'), P('bowR', 0, [332, 252], '<path d="M300 252L338 236V268Z"/>')],
      lines: `${eye(268, 154, 10)}${eye(332, 154, 10)}<ellipse cx="300" cy="190" rx="13" ry="9" fill="${INK}"/><path d="M300 198v8M288 212q12 10 24 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="300" cy="252" r="9" fill="#EF6F5E" stroke="${INK}" stroke-width="3"/>` },
    { id: 'blocks', name: 'Blocks and ball', parts: [
      sky(12),
      P('floor', 8, [40, 425], '<rect x="0" y="380" width="600" height="70"/>'),
      P('block1', 0, [134, 300], '<rect x="110" y="280" width="100" height="100" rx="10"/>'),
      P('block2', 5, [244, 300], '<rect x="220" y="280" width="100" height="100" rx="10"/>'),
      P('block3', 2, [190, 200], '<rect x="165" y="180" width="100" height="100" rx="10"/>'),
      P('ball', 7, [430, 300], '<circle cx="452" cy="320" r="60"/>'),
      P('band', 2, [452, 322], '<path d="M394 306Q452 284 510 306L510 336Q452 314 394 336Z"/>'),
      P('car', 4, [470, 412], '<path d="M380 430V412Q380 402 390 402H410L424 384H486L500 402H548Q560 402 560 412V430Z"/>'),
      P('carWin', 12, [455, 396], '<path d="M432 400L442 390H474L482 400Z"/>'),
      P('wheel1', 13, [420, 432], '<circle cx="420" cy="432" r="13"/>'), P('wheel2', 13, [520, 432], '<circle cx="520" cy="432" r="13"/>')],
      lines: `<text x="160" y="346" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="54" fill="#fff" stroke="${INK}" stroke-width="3">A</text><text x="270" y="346" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="54" fill="#fff" stroke="${INK}" stroke-width="3">B</text><text x="215" y="246" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="54" fill="#fff" stroke="${INK}" stroke-width="3">C</text>` },
    { id: 'kite', name: 'Kite', parts: [
      sky(12),
      P('sun', 2, [530, 66], '<circle cx="530" cy="66" r="40"/>'),
      cloud('cloud', 60, 70),
      P('grass', 3, [40, 425], '<path d="M0 370Q300 340 600 370V450H0Z"/>'),
      P('k1', 0, [330, 140], '<polygon points="300,50 390,166 300,166"/>'), P('k2', 2, [270, 140], '<polygon points="300,50 210,166 300,166"/>'),
      P('k3', 5, [270, 200], '<polygon points="210,166 300,166 300,300"/>'), P('k4', 3, [330, 200], '<polygon points="390,166 300,166 300,300"/>'),
      P('bow1', 7, [300, 330], '<path d="M300 330l-22-12v24zM300 330l22-12v24z"/>'),
      P('bow2', 6, [326, 372], '<path d="M326 372l-22-12v24zM326 372l22-12v24z"/>'),
      P('bow3', 1, [306, 412], '<path d="M306 412l-22-12v24zM306 412l22-12v24z"/>')],
      lines: `<path d="M300 300C300 320 296 326 300 330C320 350 330 360 326 372C318 392 300 400 306 412" fill="none" stroke="${INK}" stroke-width="3"/><path d="M300 50v250M210 166h180" stroke="${INK}" stroke-width="3"/>` },

    // ------------------------------------------------------------ Home things
    { id: 'teapot', name: 'Teapot and cup', parts: [
      sky(9),
      P('table', 8, [40, 425], '<rect x="0" y="330" width="600" height="120"/>'),
      P('cloth', 11, [100, 350], '<rect x="60" y="330" width="480" height="40"/>'),
      P('handle', 5, [118, 250], '<path d="M156 208Q96 214 108 278Q118 322 168 304L160 284Q130 292 128 266Q126 236 158 230Z"/>'),
      P('spout', 5, [418, 216], '<path d="M360 244Q420 234 440 170L458 176Q448 266 366 286Z"/>'),
      P('pot', 5, [260, 290], '<ellipse cx="260" cy="256" rx="112" ry="86"/>'),
      P('lid', 5, [260, 168], '<path d="M196 182Q260 136 324 182Z"/>'),
      P('knob', 2, [260, 144], '<circle cx="260" cy="146" r="13"/>'),
      P('saucer', 11, [430, 350], '<ellipse cx="485" cy="346" rx="64" ry="13"/>'),
      P('cupHandle', 7, [538, 296], '<path d="M524 286Q556 284 552 310Q548 332 520 330L522 318Q538 318 538 308Q540 298 524 300Z"/>'),
      P('cup', 7, [485, 320], '<path d="M440 282H530Q526 340 485 344Q444 340 440 282Z"/>'),
      P('tea', 8, [485, 284], '<ellipse cx="485" cy="284" rx="45" ry="8"/>')],
      lines: `<circle cx="226" cy="250" r="16" fill="#fff" opacity=".85"/><circle cx="262" cy="276" r="12" fill="#fff" opacity=".85"/><circle cx="294" cy="244" r="10" fill="#fff" opacity=".85"/><path d="M470 270q-10-16 0-30t0-30M500 268q-10-16 0-30t0-30" fill="none" stroke="#B9B2C8" stroke-width="4" stroke-linecap="round"/>` },
    { id: 'washer', name: 'Washing machine', parts: [
      sky(12),
      P('floor', 10, [40, 425], '<rect x="0" y="400" width="600" height="50"/>'),
      P('machine', 11, [196, 380], '<rect x="170" y="110" width="260" height="300" rx="24"/>'),
      P('top', 10, [196, 148], '<path d="M194 110H406Q430 110 430 134V172H170V134Q170 110 194 110Z"/>'),
      P('screen', 4, [244, 140], '<rect x="208" y="128" width="72" height="26" rx="6"/>'),
      P('knob', 0, [380, 141], '<circle cx="380" cy="141" r="16"/>'),
      P('ring', 10, [300, 216], '<circle cx="300" cy="290" r="96"/>'),
      P('glass', 12, [300, 250], '<circle cx="300" cy="290" r="72"/>'),
      P('clothes', 7, [300, 330], '<path d="M240 300Q270 270 300 300T360 300Q350 352 300 358Q250 352 240 300Z"/>'),
      P('basket', 1, [510, 380], '<path d="M462 336H560L548 410H474Z"/>'),
      P('laundry', 6, [512, 330], '<ellipse cx="511" cy="334" rx="50" ry="18"/>')],
      lines: `<path d="M250 252q22-20 52-14" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/><path d="M466 360h90M470 384h82" stroke="${INK}" stroke-width="3"/>` },

    // ------------------------------------------------------------ Food
    { id: 'icecream', name: 'Ice cream', parts: [
      sky(12),
      P('table', 9, [40, 425], '<rect x="0" y="380" width="600" height="70"/>'),
      P('stick', 11, [118, 340], '<rect x="110" y="250" width="12" height="150" rx="5"/>'),
      P('lolly', 6, [92, 210], '<circle cx="116" cy="216" r="54"/>'),
      P('cone', 9, [300, 330], '<polygon points="246,250 354,250 300,420"/>'),
      P('scoop1', 7, [252, 226], '<circle cx="300" cy="214" r="62"/>'),
      P('scoop2', 8, [300, 116], '<circle cx="300" cy="140" r="52"/>'),
      P('cherry', 0, [300, 82], '<circle cx="300" cy="80" r="17"/>'),
      P('rind', 3, [430, 360], '<path d="M410 370A90 90 0 0 0 590 370Z"/>'),
      P('melon', 0, [500, 340], '<path d="M424 370A76 76 0 0 0 576 370Z"/>')],
      lines: `<path d="M262 280l70 56M276 316l46 38M338 280l-70 56M326 314l-44 36" stroke="${INK}" stroke-width="3" opacity=".55"/><path d="M300 64q6-24 24-30" fill="none" stroke="#4F8A3F" stroke-width="5" stroke-linecap="round"/><path d="M90 196q26-24 52 0t-26 46" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/><ellipse cx="470" cy="346" rx="4" ry="7" fill="${INK}"/><ellipse cx="500" cy="332" rx="4" ry="7" fill="${INK}"/><ellipse cx="530" cy="346" rx="4" ry="7" fill="${INK}"/>` }
  ];
  MORE.forEach((pg) => { if (!PAGES.some((p) => p.id === pg.id)) PAGES.push(pg); });

  // the groups shown in the Art studio, in this order
  A.ART_CATS = [
    { id: 'lumi', name: 'Lumi', pages: ['lumi', 'flower'] },
    { id: 'animals', name: 'Animals', pages: ['fish', 'cat', 'butterfly'] },
    { id: 'places', name: 'Places', pages: ['house', 'playground', 'beach'] },
    { id: 'transport', name: 'Transport', pages: ['train', 'bus', 'plane'] },
    { id: 'toys', name: 'Toys', pages: ['teddy', 'blocks', 'kite'] },
    { id: 'home', name: 'Home things', pages: ['teapot', 'washer'] },
    { id: 'food', name: 'Food', pages: ['noodles', 'icecream'] }
  ];
  void smile;
})();
