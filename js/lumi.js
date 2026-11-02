/*
  lumi.js
  Draws Lumi (the companion), feeling faces and every item as SVG strings.

  Lumi.svg({ look, mood, size, wave })  -> Lumi in an outfit and mood
  Lumi.face(kind, size)                 -> a round feeling face (happy, sad, angry, worried, scared)
  Lumi.item(id, size)                   -> a small picture of a clothing or room item
  Lumi.COLORS                           -> body colours Lumi can be
*/
(function () {
  let uid = 0;
  const INK = '#3B2F2F';

  // Body colours. None of them match the five feeling colours, so a body colour is never mistaken for a feeling.
  const COLORS = {
    orange: { name: 'Orange', body: '#F2A65A', feet: '#E08E45' },
    pink: { name: 'Pink', body: '#F2A7BE', feet: '#D9849E' },
    leaf: { name: 'Leaf green', body: '#9CCB7A', feet: '#7FAE5E' },
    cocoa: { name: 'Cocoa', body: '#C99A6B', feet: '#A87B50' },
    cloud: { name: 'Cloud grey', body: '#CFC8BE', feet: '#ADA59A' }
  };

  const DEFAULT_LOOK = { color: 'orange', pattern: 'none', head: 'none', body: 'none', back: 'none', feet: 'none', spark: 'none' };

  // ---------- face parts (Lumi is drawn on a 240 x 240 grid) ----------
  const LINE = `fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
  const EYES = `<circle cx="90" cy="118" r="11" fill="${INK}"/><circle cx="150" cy="118" r="11" fill="${INK}"/><circle cx="93" cy="114" r="3.5" fill="#fff"/><circle cx="153" cy="114" r="3.5" fill="#fff"/>`;
  const SMALL_EYES = `<circle cx="90" cy="118" r="10" fill="${INK}"/><circle cx="150" cy="118" r="10" fill="${INK}"/><circle cx="92" cy="115" r="3" fill="#fff"/><circle cx="152" cy="115" r="3" fill="#fff"/>`;
  const CHEEKS = `<ellipse cx="72" cy="144" rx="12" ry="7" fill="#EF8A7A" opacity=".55"/><ellipse cx="168" cy="144" rx="12" ry="7" fill="#EF8A7A" opacity=".55"/>`;
  const WORRY_BROWS = `<path d="M76 100 L102 90 M164 100 L138 90" ${LINE}/>`;

  // Faces rely on eyebrows and mouth shape, so no clothing is ever allowed to cover them.
  const FACES = {
    happy: EYES + CHEEKS + `<path d="M104 142 Q120 158 136 142" ${LINE}/>`,
    excited: EYES + CHEEKS + `<path d="M100 138 Q120 170 140 138 Z" fill="${INK}"/>`,
    worried: WORRY_BROWS + SMALL_EYES + `<path d="M102 150 Q111 142 120 150 Q129 158 138 150" ${LINE}/>`,
    sad: WORRY_BROWS + SMALL_EYES + `<path d="M104 156 Q120 142 136 156" ${LINE}/><path d="M78 130 q-7 11 0 15 q7 -4 0 -15z" fill="#8EB8E5"/>`,
    scared: `<path d="M76 96 L100 88 M164 96 L140 88" ${LINE}/>` + SMALL_EYES + `<ellipse cx="120" cy="152" rx="9" ry="11" fill="${INK}"/>`,
    calm: `<path d="M80 118 Q90 128 100 118 M140 118 Q150 128 160 118" ${LINE}/>` + CHEEKS + `<path d="M110 148 Q120 156 130 148" ${LINE}/>`
  };
  FACES.sleepy = FACES.calm;

  // ---------- clothing, drawn in layers ----------
  const BACK = {
    cape: '<path d="M44 112 L16 230 L224 230 L196 112 Z" fill="#7E64C8"/><path d="M44 112 L196 112" stroke="#5B45A8" stroke-width="6" stroke-linecap="round"/>',
    starcape: '<path d="M44 112 L16 230 L224 230 L196 112 Z" fill="#33406A"/><path d="M30 190l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1zM204 168l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#F4D35E"/>',
    wings: '<path d="M60 128 C24 76 -6 104 8 138 C20 166 50 162 60 150 Z" fill="#EAF4FB" stroke="#8EB8E5" stroke-width="4"/><path d="M180 128 C216 76 246 104 232 138 C220 166 190 162 180 150 Z" fill="#EAF4FB" stroke="#8EB8E5" stroke-width="4"/>',
    backpack: '<rect x="178" y="112" width="44" height="78" rx="16" fill="#E07A5F"/><rect x="186" y="148" width="28" height="24" rx="7" fill="#EF8A7A"/>',
    heartbag: '<path d="M206 196 C182 180 186 156 198 158 C202 158 205 161 206 164 C207 161 210 158 214 158 C226 156 230 180 206 196 Z" fill="#EF8A7A"/>'
  };
  const BACK_FRONT = {
    backpack: '<path d="M164 100 Q186 150 172 198" stroke="#B5543B" stroke-width="7" fill="none" stroke-linecap="round"/>',
    heartbag: '<path d="M70 104 Q140 150 202 164" stroke="#D9644F" stroke-width="5" fill="none" stroke-linecap="round"/>'
  };
  const BODY = {
    scarf: '<path d="M44 172 Q120 196 196 172 L198 190 Q120 216 42 190 Z" fill="#E09A2E"/><path d="M150 196 L162 236 L178 232 L170 192 Z" fill="#E09A2E"/><path d="M60 180 L60 194 M90 188 L90 202 M150 188 L150 202 M180 180 L180 194" stroke="#fff" stroke-opacity=".55" stroke-width="4"/>',
    bravescarf: '<path d="M44 172 Q120 196 196 172 L198 190 Q120 216 42 190 Z" fill="#F4B400"/><path d="M150 196 L162 236 L178 232 L170 192 Z" fill="#F4B400"/><path d="M96 192 l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#fff"/>',
    raincoat: '<path d="M42 166 Q36 222 72 226 L168 226 Q204 222 198 166 Q120 194 42 166 Z" fill="#F4D35E"/><path d="M120 184 L120 224" stroke="#E0B83A" stroke-width="4"/><circle cx="110" cy="198" r="4" fill="#C98A1E"/><circle cx="110" cy="214" r="4" fill="#C98A1E"/>'
  };
  const HEAD = {
    cap: '<path d="M64 76 Q120 6 176 76 Q120 64 64 76 Z" fill="#2F7E79"/><path d="M150 72 Q190 68 206 82 Q180 88 152 82 Z" fill="#235F5B"/>',
    talkercap: '<path d="M64 76 Q120 6 176 76 Q120 64 64 76 Z" fill="#7E64C8"/><path d="M150 72 Q190 68 206 82 Q180 88 152 82 Z" fill="#5B45A8"/><path d="M106 36 h28 v16 h-14 l-7 7 v-7 h-7 z" fill="#fff"/>',
    flowers: '<circle cx="76" cy="66" r="10" fill="#F2A7BE"/><circle cx="76" cy="66" r="4" fill="#F4D35E"/><circle cx="100" cy="54" r="10" fill="#F2A7BE"/><circle cx="100" cy="54" r="4" fill="#F4D35E"/><circle cx="120" cy="50" r="10" fill="#fff"/><circle cx="120" cy="50" r="4" fill="#F4D35E"/><circle cx="140" cy="54" r="10" fill="#F2A7BE"/><circle cx="140" cy="54" r="4" fill="#F4D35E"/><circle cx="164" cy="66" r="10" fill="#F2A7BE"/><circle cx="164" cy="66" r="4" fill="#F4D35E"/>',
    phones: `<path d="M48 96 Q48 26 120 26 Q192 26 192 96" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><rect x="30" y="84" width="30" height="46" rx="12" fill="#2F7E79"/><rect x="180" y="84" width="30" height="46" rx="12" fill="#2F7E79"/>`,
    partyhat: '<path d="M94 70 L120 2 L146 70 Z" fill="#7E64C8"/><path d="M103 50 L137 50 M110 30 L130 30" stroke="#F4D35E" stroke-width="5" stroke-linecap="round"/><circle cx="120" cy="4" r="8" fill="#F4D35E"/>',
    bow: '<g transform="translate(152 50)"><path d="M0 0 L-24 -15 L-24 15 Z" fill="#F2A7BE"/><path d="M0 0 L24 -15 L24 15 Z" fill="#F2A7BE"/><circle r="8" fill="#D9849E"/></g>',
    buckethat: '<path d="M74 72 Q74 20 120 20 Q166 20 166 72 Z" fill="#8EB8E5"/><path d="M50 72 H190 L178 86 H62 Z" fill="#5E8FC4"/>',
    crown: '<path d="M84 74 L90 28 L106 50 L120 20 L134 50 L150 28 L156 74 Z" fill="#F4B400" stroke="#C98A1E" stroke-width="3" stroke-linejoin="round"/><circle cx="120" cy="60" r="6" fill="#EF8A7A"/>',
    calmcrown: '<path d="M84 74 L90 28 L106 50 L120 20 L134 50 L150 28 L156 74 Z" fill="#B9A6E0" stroke="#7E64C8" stroke-width="3" stroke-linejoin="round"/><path d="M108 66 h24 a7 7 0 0 0 0-14 a10 10 0 0 0-19 1 a6 6 0 0 0-5 13z" fill="#fff"/>'
  };
  const PATTERN = {
    spots: '<circle cx="50" cy="140" r="10" fill="#fff" opacity=".4"/><circle cx="190" cy="148" r="12" fill="#fff" opacity=".4"/><circle cx="60" cy="184" r="8" fill="#fff" opacity=".4"/><circle cx="180" cy="102" r="7" fill="#fff" opacity=".4"/><circle cx="58" cy="104" r="6" fill="#fff" opacity=".4"/><circle cx="182" cy="186" r="7" fill="#fff" opacity=".4"/>',
    stripes: '<path d="M36 124 L60 124 M32 150 L58 150 M38 176 L62 176 M180 124 L204 124 M182 150 L208 150 M178 176 L202 176" stroke="#fff" stroke-opacity=".5" stroke-width="9" stroke-linecap="round"/>'
  };

  // The spark above Lumi's head shows how Lumi feels: bright when good, small and dim when worried or sad.
  function spark(shape, mood, x, y) {
    const low = mood === 'worried' || mood === 'sad' || mood === 'scared';
    const high = mood === 'calm' || mood === 'sleepy' || mood === 'excited';
    const glow = low ? 11 : high ? 22 : 17;
    const scale = low ? 0.6 : high ? 1.15 : 1;
    const fill = low ? '#E8C04A' : '#FFC727';
    let s;
    if (shape === 'heart') s = '<path d="M0 12 C-15 3 -14 -11 -5 -11 C-2 -11 -0.5 -8 0 -6 C0.5 -8 2 -11 5 -11 C14 -11 15 3 0 12 Z"/>';
    else if (shape === 'flower') s = '<circle cx="0" cy="-7" r="5"/><circle cx="6.7" cy="-2.2" r="5"/><circle cx="4.1" cy="5.7" r="5"/><circle cx="-4.1" cy="5.7" r="5"/><circle cx="-6.7" cy="-2.2" r="5"/><circle r="3.5" fill="#FFF1C2"/>';
    else s = `<polygon points="0 -14 4.1 -5.6 13.3 -4.3 6.7 2.2 8.2 11.3 0 7 -8.2 11.3 -6.7 2.2 -13.3 -4.3 -4.1 -5.6" stroke="${low ? '#C9A12E' : '#F2A100'}" stroke-width="3.2" stroke-linejoin="round"/><path d="M-9 -3 L-3.4 -3.7 -0.6 -10" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
    return `<circle cx="${x}" cy="${y}" r="${glow}" fill="#F4D35E" opacity="${low ? 0.3 : 0.45}"/><g transform="translate(${x} ${y}) scale(${scale})" fill="${fill}">${s}</g>`;
  }

  // ---------- Lumi in each art style (chosen by grown-ups) ----------
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
    return '#' + [ch(n >> 16), ch((n >> 8) & 255), ch(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const poly = (cx, cy, rx, ry, n, jit, rot) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (rot || -Math.PI / 2) + (i * 2 * Math.PI) / n;
      const j = jit ? jit[i % jit.length] : 1;
      pts.push(`${(cx + rx * j * Math.cos(a)).toFixed(1)},${(cy + ry * j * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const JIT = [1, 0.95, 1.03, 0.97, 1.01, 0.94, 1.04, 0.97, 1];
  const MINI = '#3E5463';
  function pixelCells(test, cell, fill, edge) {
    let out = '';
    for (let y = 0; y < 240; y += cell) {
      for (let x = 0; x < 240; x += cell) {
        const cx = x + cell / 2;
        const cy = y + cell / 2;
        if (!test(cx, cy)) continue;
        const border = edge && (!test(cx - cell, cy) || !test(cx + cell, cy) || !test(cx, cy - cell) || !test(cx, cy + cell));
        out += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${border ? edge : fill}"/>`;
      }
    }
    return out;
  }
  const inEllipse = (x0, y0, rx, ry) => (x, y) => ((x - x0) / rx) ** 2 + ((y - y0) / ry) ** 2 <= 1;
  function bodyFor(art, c, wave, id, look) {
    const belly = '#F7C79A';
    if (art === 'paper') {
      const dark = shade(c.body, -0.22);
      let h = `<polygon points="${poly(126, 142, 92, 86, 9, JIT)}" fill="#000" opacity=".12"/>`;
      if (wave) h += `<polygon points="190,62 214,74 218,118 196,124 184,96" fill="${dark}"/>`;
      h += `<polygon points="${poly(68, 58, 26, 26, 5, null, -1.2)}" fill="${dark}"/><polygon points="${poly(172, 58, 26, 26, 5, null, -1.9)}" fill="${dark}"/>`;
      h += `<polygon points="${poly(68, 60, 12, 12, 5, null, -1.2)}" fill="${belly}"/><polygon points="${poly(172, 60, 12, 12, 5, null, -1.9)}" fill="${belly}"/>`;
      h += `<polygon points="${poly(120, 136, 92, 86, 9, JIT)}" fill="${c.body}"/>`;
      h += `<polygon points="120,50 40,104 120,136" fill="#fff" opacity=".12"/><polygon points="120,136 212,150 168,214" fill="#000" opacity=".1"/>`;
      h += `<polygon points="${poly(120, 172, 52, 40, 7, [1, 0.96, 1.02], -1.57)}" fill="${belly}"/>`;
      if (!look || look.head === 'none') h += '<polygon points="120,32 106,58 134,58" fill="#7FB069"/><polygon points="120,32 120,58 134,58" fill="#5E9A4A"/>';
      return h;
    }
    if (art === 'water') {
      const f = `${id}w`;
      let h = `<defs><filter id="${f}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter></defs><g filter="url(#${f})">`;
      if (wave) h += `<ellipse cx="200" cy="96" rx="18" ry="34" transform="rotate(28 200 96)" fill="${c.body}" opacity=".55"/>`;
      h += `<circle cx="68" cy="58" r="24" fill="${c.body}" opacity=".5"/><circle cx="172" cy="58" r="24" fill="${c.body}" opacity=".5"/>`;
      h += `<ellipse cx="120" cy="136" rx="90" ry="84" fill="${c.body}" opacity=".55"/>`;
      h += `<ellipse cx="96" cy="118" rx="66" ry="60" fill="#B9C8F0" opacity=".35"/><ellipse cx="150" cy="156" rx="62" ry="56" fill="#E6C8F0" opacity=".35"/>`;
      h += `<ellipse cx="120" cy="172" rx="50" ry="38" fill="#fff" opacity=".4"/></g>`;
      h += `<ellipse cx="120" cy="136" rx="90" ry="84" fill="none" stroke="${c.body}" stroke-opacity=".35" stroke-width="3"/>`;
      return h;
    }
    if (art === 'minimal') {
      const L2 = `fill="#fff" stroke="${MINI}" stroke-width="6"`;
      let h = '';
      if (wave) h += `<ellipse cx="200" cy="96" rx="16" ry="32" transform="rotate(28 200 96)" ${L2}/>`;
      h += `<circle cx="68" cy="58" r="22" ${L2}/><circle cx="172" cy="58" r="22" ${L2}/>`;
      h += `<ellipse cx="120" cy="136" rx="88" ry="82" ${L2}/>`;
      h += '<circle cx="196" cy="70" r="11" fill="#8FBAAA"/>';
      return h;
    }
    if (art === 'pixel') {
      const edge = shade(c.body, -0.35);
      let h = '';
      if (wave) h += pixelCells((x, y) => x > 186 && x < 222 && y > 56 && y < 128, 12, c.body, edge);
      h += pixelCells((x, y) => inEllipse(68, 58, 26, 26)(x, y) || inEllipse(172, 58, 26, 26)(x, y) || inEllipse(120, 138, 94, 86)(x, y), 12, c.body, edge);
      h += pixelCells(inEllipse(120, 172, 54, 40), 12, belly, null);
      h += pixelCells((x, y) => inEllipse(68, 58, 12, 12)(x, y) || inEllipse(172, 58, 12, 12)(x, y), 12, belly, null);
      return h;
    }
    // soft (and cozy diorama: soft with a little 3D shading)
    let h = '';
    if (art === 'diorama') h += `<ellipse cx="124" cy="226" rx="86" ry="12" fill="#000" opacity=".12"/>`;
    if (wave) h += `<ellipse cx="200" cy="96" rx="18" ry="34" transform="rotate(28 200 96)" fill="${c.body}"/>`;
    h += `<circle cx="68" cy="58" r="24" fill="${c.body}"/><circle cx="172" cy="58" r="24" fill="${c.body}"/>`;
    h += `<circle cx="68" cy="58" r="12" fill="${belly}"/><circle cx="172" cy="58" r="12" fill="${belly}"/>`;
    h += `<ellipse cx="120" cy="136" rx="90" ry="84" fill="${c.body}"/>`;
    if (art === 'diorama') h += `<path d="M196 110 A90 84 0 0 1 120 220 A90 84 0 0 0 196 110z" fill="#000" opacity=".1"/><ellipse cx="92" cy="98" rx="26" ry="16" fill="#fff" opacity=".22"/>`;
    h += `<ellipse cx="120" cy="170" rx="52" ry="40" fill="${belly}"/>`;
    // soft light from the top left gives the ball a little volume
    if (art !== 'diorama') h += `<defs><radialGradient id="${id}l" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient></defs><ellipse cx="120" cy="136" rx="90" ry="84" fill="url(#${id}l)"/>`;
    return h;
  }
  function feetFor(art, c) {
    if (art === 'paper') return `<polygon points="${poly(88, 218, 24, 13, 6)}" fill="${c.feet}"/><polygon points="${poly(152, 218, 24, 13, 6)}" fill="${c.feet}"/>`;
    if (art === 'water') return `<ellipse cx="88" cy="218" rx="22" ry="12" fill="${c.feet}" opacity=".6"/><ellipse cx="152" cy="218" rx="22" ry="12" fill="${c.feet}" opacity=".6"/>`;
    if (art === 'minimal') return `<path d="M68 224 h40 M132 224 h40" stroke="${MINI}" stroke-width="6" stroke-linecap="round"/>`;
    return `<rect x="66" y="210" width="44" height="18" fill="${c.feet}"/><rect x="130" y="210" width="44" height="18" fill="${c.feet}"/>`;
  }
  function pixelFace(mood) {
    const K = INK;
    const r = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f || K}"/>`;
    const closed = mood === 'calm' || mood === 'sleepy';
    let h = closed ? r(78, 116, 24, 8) + r(138, 116, 24, 8) : r(82, 106, 18, 22) + r(140, 106, 18, 22) + r(86, 108, 6, 6, '#fff') + r(144, 108, 6, 6, '#fff');
    if (mood === 'worried' || mood === 'sad' || mood === 'scared') h += r(76, 92, 24, 6) + r(140, 92, 24, 6);
    if (mood === 'happy' || closed) h += r(102, 140, 8, 8) + r(110, 148, 20, 8) + r(130, 140, 8, 8);
    else if (mood === 'excited') h += r(104, 140, 32, 16);
    else if (mood === 'scared') h += r(112, 144, 16, 18);
    else h += r(102, 150, 8, 8) + r(110, 142, 20, 8) + r(130, 150, 8, 8);
    h += r(64, 136, 16, 8, '#EF8A7A') + r(160, 136, 16, 8, '#EF8A7A');
    return h;
  }

  function svg(opts) {
    const o = opts || {};
    const look = Object.assign({}, DEFAULT_LOOK, o.look || {});
    const mood = o.mood || 'happy';
    const size = o.size || 240;
    const c = COLORS[look.color] || COLORS.orange;
    const id = 'lumi' + (++uid);
    const label = o.label || 'Lumi';

    let s = `<svg class="lumi" width="${size}" height="${size}" viewBox="-14 -14 268 268" role="img" aria-label="${label}">`;
    s += `<defs><clipPath id="${id}"><ellipse cx="120" cy="136" rx="90" ry="84"/></clipPath></defs>`;
    if (BACK[look.back]) s += BACK[look.back];
    const art = o.style || Lumi.style || 'soft';
    s += bodyFor(art, c, o.wave, id, look);
    if (PATTERN[look.pattern]) s += `<g clip-path="url(#${id})">${PATTERN[look.pattern]}</g>`;
    // body clothing
    if (look.body === 'shirt') {
      s += `<g clip-path="url(#${id})"><rect x="20" y="150" width="200" height="90" fill="#fff"/>`;
      if (look.shirt) s += `<image href="${look.shirt}" x="24" y="146" width="192" height="94" preserveAspectRatio="xMidYMid slice"/>`;
      s += '</g>';
    } else if (BODY[look.body]) {
      s += BODY[look.body];
    }
    if (BACK_FRONT[look.back]) s += BACK_FRONT[look.back];
    s += art === 'pixel' ? pixelFace(mood) : art === 'minimal' ? (FACES[mood] || FACES.happy).replace(/#EF8A7A/g, '#C9D3D6') : FACES[mood] || FACES.happy;
    // feet
    if (o.noFeet) {
      // movement breaks draw their own legs and feet (movebreak.js)
    } else if (look.feet !== 'boots' && art !== 'soft' && art !== 'diorama') {
      s += feetFor(art, c);
    } else if (look.feet === 'boots') {
      s += '<path d="M62 204 h46 v16 q0 10 -10 10 h-28 q-8 0 -8 -8 z" fill="#F4D35E" stroke="#C98A1E" stroke-width="3"/><path d="M132 204 h46 v18 q0 8 -8 8 h-28 q-10 0 -10 -10 z" fill="#F4D35E" stroke="#C98A1E" stroke-width="3"/>';
    } else {
      s += `<ellipse cx="88" cy="218" rx="22" ry="12" fill="${c.feet}"/><ellipse cx="152" cy="218" rx="22" ry="12" fill="${c.feet}"/>`;
    }
    if (HEAD[look.head]) s += HEAD[look.head];
    // the spark moves to the side when a hat is in the way
    const clear = look.head === 'none' || look.head === 'bow' || look.head === 'flowers';
    if (look.spark && look.spark !== 'none') s += clear ? spark(look.spark, mood, 120, 18) : spark(look.spark, mood, 214, 24);
    s += '</svg>';
    return s;
  }

  // ---------- round feeling faces (used on feeling cards and the talk board) ----------
  const FACE_LINE = `stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"`;
  const FEELING_FACES = {
    happy: ['#F4D35E', `<circle cx="46" cy="54" r="6" fill="${INK}"/><circle cx="74" cy="54" r="6" fill="${INK}"/><path d="M42 70 Q60 88 78 70" ${FACE_LINE}/>`],
    sad: ['#8EB8E5', `<path d="M38 46 L52 50 M82 46 L68 50" ${FACE_LINE}/><circle cx="46" cy="58" r="6" fill="${INK}"/><circle cx="74" cy="58" r="6" fill="${INK}"/><path d="M44 84 Q60 70 76 84" ${FACE_LINE}/>`],
    angry: ['#EF8A7A', `<path d="M36 42 L54 50 M84 42 L66 50" ${FACE_LINE}/><circle cx="46" cy="58" r="6" fill="${INK}"/><circle cx="74" cy="58" r="6" fill="${INK}"/><path d="M44 82 L76 82" ${FACE_LINE}/>`],
    worried: ['#B9A6E0', `<path d="M36 48 L52 42 M84 48 L68 42" ${FACE_LINE}/><circle cx="46" cy="58" r="6" fill="${INK}"/><circle cx="74" cy="58" r="6" fill="${INK}"/><path d="M42 80 Q51 73 60 80 Q69 87 78 80" ${FACE_LINE}/>`],
    scared: ['#A8D8CF', `<path d="M38 40 L52 36 M82 40 L68 36" ${FACE_LINE}/><circle cx="46" cy="56" r="8" fill="${INK}"/><circle cx="74" cy="56" r="8" fill="${INK}"/><ellipse cx="60" cy="84" rx="8" ry="10" fill="${INK}"/>`]
  };
  function face(kind, size) {
    const f = FEELING_FACES[kind] || FEELING_FACES.happy;
    return `<svg width="${size || 60}" height="${size || 60}" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="${f[0]}"/>${f[1]}</svg>`;
  }

  // ---------- small item pictures (24 x 24 grid) ----------
  const ITEM = {
    none: '<circle cx="12" cy="12" r="8" fill="none" stroke="#9C8B7A" stroke-width="2"/><path d="M6.5 17.5 17.5 6.5" stroke="#9C8B7A" stroke-width="2" stroke-linecap="round"/>',
    spots: '<circle cx="12" cy="12" r="9" fill="#F2A65A"/><circle cx="8" cy="9" r="2" fill="#fff" opacity=".7"/><circle cx="15" cy="14" r="2.4" fill="#fff" opacity=".7"/><circle cx="9" cy="16" r="1.5" fill="#fff" opacity=".7"/>',
    stripes: '<circle cx="12" cy="12" r="9" fill="#F2A65A"/><path d="M5 9h14M4 13h16M6 17h12" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>',
    cap: '<path d="M4 15 Q12 3 20 15 Q12 13 4 15 Z" fill="#2F7E79"/><path d="M16 14 Q21 13 23 16 L16 16 Z" fill="#235F5B"/>',
    talkercap: '<path d="M4 15 Q12 3 20 15 Q12 13 4 15 Z" fill="#7E64C8"/><path d="M16 14 Q21 13 23 16 L16 16 Z" fill="#5B45A8"/><path d="M9 7 h6 v3 h-3 l-2 2 v-2 h-1 z" fill="#fff"/>',
    flowers: '<circle cx="6" cy="13" r="3.5" fill="#F2A7BE"/><circle cx="12" cy="10" r="3.5" fill="#F2A7BE"/><circle cx="18" cy="13" r="3.5" fill="#F2A7BE"/><circle cx="6" cy="13" r="1.4" fill="#F4D35E"/><circle cx="12" cy="10" r="1.4" fill="#F4D35E"/><circle cx="18" cy="13" r="1.4" fill="#F4D35E"/>',
    phones: '<path d="M5 15 V12 a7 7 0 0 1 14 0 V15" stroke="#3B2F2F" stroke-width="2" fill="none"/><rect x="3" y="13" width="5" height="7" rx="2" fill="#2F7E79"/><rect x="16" y="13" width="5" height="7" rx="2" fill="#2F7E79"/>',
    partyhat: '<path d="M7 21 L12 3 L17 21 Z" fill="#7E64C8"/><path d="M9 15h6M10.5 9.5h3" stroke="#F4D35E" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="3" r="2" fill="#F4D35E"/>',
    bow: '<path d="M12 12 L3 6 V18 Z" fill="#F2A7BE"/><path d="M12 12 L21 6 V18 Z" fill="#F2A7BE"/><circle cx="12" cy="12" r="2.6" fill="#D9849E"/>',
    buckethat: '<path d="M7 15 Q7 6 12 6 Q17 6 17 15 Z" fill="#8EB8E5"/><path d="M3 15 H21 L19 18 H5 Z" fill="#5E8FC4"/>',
    crown: '<path d="M3 19 L5 7 L9 12 L12 5 L15 12 L19 7 L21 19 Z" fill="#F4B400" stroke="#C98A1E" stroke-width="1" stroke-linejoin="round"/>',
    calmcrown: '<path d="M3 19 L5 7 L9 12 L12 5 L15 12 L19 7 L21 19 Z" fill="#B9A6E0" stroke="#7E64C8" stroke-width="1" stroke-linejoin="round"/><path d="M9 17h6a2 2 0 0 0 0-4 3 3 0 0 0-5.5.5A1.8 1.8 0 0 0 9 17z" fill="#fff"/>',
    scarf: '<path d="M4 9 Q12 13 20 9 V12 Q12 16 4 12 Z" fill="#E09A2E"/><path d="M14 13 L16 21 L19 20 L17 12 Z" fill="#E09A2E"/>',
    bravescarf: '<path d="M4 9 Q12 13 20 9 V12 Q12 16 4 12 Z" fill="#F4B400"/><path d="M14 13 L16 21 L19 20 L17 12 Z" fill="#F4B400"/><path d="M9 11.5l.7 1.4 1.5.2-1.1 1 .3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1 1.5-.2z" fill="#fff"/>',
    raincoat: '<path d="M7 4 L17 4 L20 21 L4 21 Z" fill="#F4D35E" stroke="#C98A1E" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 4 V21" stroke="#C98A1E" stroke-width="1.5"/>',
    shirt: '<path d="M8 4l-4 3 2 3 2-1v11h8V9l2 1 2-3-4-3-2 2h-4z" fill="#fff" stroke="#7E64C8" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 13 q1.5 -1.5 3 0 t3 0" stroke="#2F7E79" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
    cape: '<path d="M7 4 L17 4 L21 21 L3 21 Z" fill="#7E64C8"/>',
    starcape: '<path d="M7 4 L17 4 L21 21 L3 21 Z" fill="#33406A"/><polygon points="12 9 13 11.5 15.6 11.7 13.6 13.3 14.2 15.8 12 14.4 9.8 15.8 10.4 13.3 8.4 11.7 11 11.5" fill="#F4D35E"/>',
    wings: '<path d="M12 12 C8 4 2 4 2 9 C2 14 8 15 12 12 Z" fill="#EAF4FB" stroke="#8EB8E5" stroke-width="1.5"/><path d="M12 12 C16 4 22 4 22 9 C22 14 16 15 12 12 Z" fill="#EAF4FB" stroke="#8EB8E5" stroke-width="1.5"/>',
    backpack: '<rect x="5" y="6" width="14" height="15" rx="4" fill="#E07A5F"/><path d="M9 6 V4 H15 V6" fill="none" stroke="#B5543B" stroke-width="2"/><rect x="8" y="13" width="8" height="5" rx="1.5" fill="#EF8A7A"/>',
    heartbag: '<path d="M12 21C4 15 3 8 7.5 6 9.5 5 11 6.5 12 8c1-1.5 2.5-3 4.5-2C21 8 20 15 12 21z" fill="#EF8A7A"/><path d="M5 7 Q12 -1 19 7" stroke="#D9644F" stroke-width="1.5" fill="none"/>',
    boots: '<path d="M4 4 H9 V16 H12 Q12 20 9 20 H4 Z" fill="#F4D35E"/><path d="M13 4 H18 V16 H21 Q21 20 18 20 H13 Z" fill="#F4D35E"/>',
    'spark-star': '<polygon points="12 3 14.6 8.6 20.6 9.2 16 13.2 17.3 19.2 12 16.1 6.7 19.2 8 13.2 3.4 9.2 9.4 8.6" fill="#FFC727" stroke="#F2A100" stroke-width="2.2" stroke-linejoin="round"/><path d="M5.4 9.9 9.8 9.5 11.6 5.3" fill="none" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".85"/>',
    'spark-heart': '<path d="M12 21C4 15 3 8 7.5 6 9.5 5 11 6.5 12 8c1-1.5 2.5-3 4.5-2C21 8 20 15 12 21z" fill="#F4B400"/>',
    'spark-flower': '<circle cx="17" cy="12" r="4" fill="#F4B400"/><circle cx="13.5" cy="16.8" r="4" fill="#F4B400"/><circle cx="8" cy="15" r="4" fill="#F4B400"/><circle cx="8" cy="9" r="4" fill="#F4B400"/><circle cx="13.5" cy="7.2" r="4" fill="#F4B400"/><circle cx="12" cy="12" r="3" fill="#FFF1C2"/>',
    // room items
    picture: '<rect x="4" y="4" width="16" height="16" rx="2" fill="#fff" stroke="#C9A27E" stroke-width="2.4"/><polygon points="12 7.5 13.4 10.4 16.6 10.8 14.2 13 14.9 16.2 12 14.6 9.1 16.2 9.8 13 7.4 10.8 10.6 10.4" fill="#F4D35E"/>',
    lamp: '<path d="M8 3h8l3 7H5z" fill="#F4D35E" stroke="#C98A1E" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 10v9M8 21h8" stroke="#6B5A4E" stroke-width="2" stroke-linecap="round"/>',
    beanbag: '<path d="M3 19c0-7 4-12 9-12s9 5 9 12c0 2-18 2-18 0z" fill="#EF8A7A"/><path d="M8 12 q4 -2 8 0" stroke="#D9644F" stroke-width="1.2" fill="none"/>',
    bookshelf: '<rect x="4" y="3" width="16" height="18" rx="2" fill="#C9A27E"/><rect x="6" y="5" width="3" height="6" fill="#8EB8E5"/><rect x="10" y="6" width="3" height="5" fill="#F4D35E"/><rect x="14" y="5" width="3" height="6" fill="#B9A6E0"/><rect x="6" y="13" width="12" height="6" fill="#E8CDB0"/>',
    rainbow: '<path d="M3 18a9 9 0 0 1 18 0" stroke="#EF8A7A" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M6 18a6 6 0 0 1 12 0" stroke="#F4D35E" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M9 18a3 3 0 0 1 6 0" stroke="#8EB8E5" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    plant: '<circle cx="12" cy="9" r="6" fill="#7FB069"/><path d="M8 14h8l-1 7H9z" fill="#E07A5F"/>',
    sunflower: '<path d="M12 12v9" stroke="#7FB069" stroke-width="2"/><circle cx="12" cy="8" r="6" fill="#F4D35E"/><circle cx="12" cy="8" r="2.6" fill="#A87B50"/><path d="M12 16 q-4 -1 -5 2" stroke="#7FB069" stroke-width="2" fill="none"/>',
    cactus: '<rect x="10" y="4" width="4" height="14" rx="2" fill="#7FB069"/><path d="M10 12 H7 V8" stroke="#7FB069" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 10 H17 V7" stroke="#7FB069" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M7 17h10l-1 4H8z" fill="#E07A5F"/>',
    fishtank: '<rect x="3" y="6" width="18" height="14" rx="3" fill="#CFE6F5" stroke="#8EB8E5" stroke-width="1.2"/><path d="M7 13c2-2 5-2 7 0-2 2-5 2-7 0z" fill="#EE964B"/><path d="M14 13l3-2v4z" fill="#EE964B"/>',
    puppy: '<ellipse cx="6" cy="10" rx="3" ry="5" fill="#A87B50"/><ellipse cx="18" cy="10" rx="3" ry="5" fill="#A87B50"/><circle cx="12" cy="13" r="7" fill="#C99A6B"/><circle cx="9.5" cy="12" r="1.2" fill="#3B2F2F"/><circle cx="14.5" cy="12" r="1.2" fill="#3B2F2F"/><ellipse cx="12" cy="15.5" rx="2" ry="1.4" fill="#3B2F2F"/>',
    kitten: '<path d="M5 12 L5 4 L10 8 Z M19 12 L19 4 L14 8 Z" fill="#CFC8BE"/><circle cx="12" cy="13" r="7" fill="#CFC8BE"/><circle cx="9.5" cy="12" r="1.2" fill="#3B2F2F"/><circle cx="14.5" cy="12" r="1.2" fill="#3B2F2F"/><path d="M11 15 h2 l-1 1z" fill="#EF8A7A"/>'
  };
  function item(id, size) {
    return `<svg width="${size || 40}" height="${size || 40}" viewBox="0 0 24 24" aria-hidden="true">${ITEM[id] || ITEM.none}</svg>`;
  }

  // ---------- Lumi turning round (soft and cozy diorama styles) ----------
  // Lumi is a ball, so the outline stays round while the face, belly, ears and feet slide around it, and a
  // little tail comes into view at the back. The light stays where it is (top left), so the shading does too.
  // angle: 0 = facing you, 90 = side, 180 = back. Drawn frame by frame by the "turn around" trick.
  function turnSvg(opts, angle) {
    const o = opts || {};
    const look = Object.assign({}, DEFAULT_LOOK, o.look || {});
    const mood = o.mood || 'happy';
    const size = o.size || 240;
    const c = COLORS[look.color] || COLORS.orange;
    const art = o.style || Lumi.style || 'soft';
    const id = 'lumiT' + (++uid);
    const a = (angle * Math.PI) / 180;
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    const belly = '#F7C79A';
    const ear = (side) => { // side: -1 left, 1 right (as seen from the front)
      const x = 120 + side * 52 * cos;
      const inner = cos > 0.12 ? `<ellipse cx="${x}" cy="58" rx="${12 * cos}" ry="12" fill="${belly}"/>` : '';
      return `<ellipse cx="${x}" cy="58" rx="${24 * (0.72 + 0.28 * Math.abs(cos))}" ry="24" fill="${c.body}"/>${inner}`;
    };
    // things closer to us are drawn last
    const earZ = (side) => -side * 52 * sin;
    const ears = [-1, 1].sort((p, q) => earZ(p) - earZ(q));
    const offCentre = look.back === 'backpack' || look.back === 'heartbag';
    const backItem = BACK[look.back] ? `<g transform="translate(${cos >= 0 ? 0 : offCentre ? -80 - 70 * sin : 0} 0)">${BACK[look.back]}</g>` : '';
    let s = `<svg class="lumi" width="${size}" height="${size}" viewBox="-14 -14 268 268" role="img" aria-label="${o.label || 'Lumi'}">`;
    s += `<defs><clipPath id="${id}"><ellipse cx="120" cy="136" rx="90" ry="84"/></clipPath>
      <radialGradient id="${id}l" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient></defs>`;
    if (art === 'diorama') s += `<ellipse cx="124" cy="226" rx="${78 + 8 * Math.abs(cos)}" ry="11" fill="#000" opacity=".12"/>`;
    // feet, then ears behind the body when they are on the far side
    const footX = (side) => 120 + side * 32 * cos;
    const feet = [-1, 1].map((side) => `<ellipse cx="${footX(side)}" cy="218" rx="22" ry="12" fill="${c.feet}"/>`).join('');
    if (cos >= 0) s += backItem;
    ears.forEach((e) => { s += ear(e); }); // ears sit on top of the head, behind the round body
    s += feet;
    s += `<ellipse cx="120" cy="136" rx="90" ry="84" fill="${c.body}"/>`;
    // things on the body: the belly and face slide across and get narrower near the edge
    const slide = (r, w) => `translate(${120 + r * sin} 0) scale(${Math.max(0.3, Math.abs(cos) * w + (1 - w))} 1) translate(-120 0)`;
    s += `<g clip-path="url(#${id})">`;
    if (PATTERN[look.pattern]) s += `<g transform="translate(${-60 * sin} 0)">${PATTERN[look.pattern]}</g>`;
    if (cos > -0.12) s += `<g transform="${slide(64, 1)}" opacity="${Math.min(1, (cos + 0.12) * 4)}"><ellipse cx="120" cy="170" rx="52" ry="40" fill="${belly}"/></g>`;
    // the little round tail on Lumi's back
    if (cos < 0.12) s += `<g transform="${slide(-74, 1)}" opacity="${Math.min(1, (0.12 - cos) * 4)}"><circle cx="120" cy="178" r="20" fill="${belly}"/><circle cx="114" cy="172" r="7" fill="#fff" opacity=".45"/></g>`;
    if (look.body === 'shirt' || BODY[look.body]) {
      // clothes wrap round Lumi, so they stay put (only the shirt picture slides)
      if (look.body === 'shirt') {
        s += `<rect x="20" y="150" width="200" height="90" fill="#fff"/>`;
        if (look.shirt && cos > 0.05) s += `<g transform="${slide(64, 1)}"><image href="${look.shirt}" x="24" y="146" width="192" height="94" preserveAspectRatio="xMidYMid slice"/></g>`;
      }
    }
    s += `<ellipse cx="120" cy="136" rx="90" ry="84" fill="url(#${id}l)"/>`;
    s += '</g>';
    if (BODY[look.body] && look.body !== 'shirt') s += `<g transform="translate(${30 * sin} 0)">${BODY[look.body]}</g>`;
    if (cos > -0.12) s += `<g transform="${slide(72, 1)}" opacity="${Math.min(1, (cos + 0.12) * 4)}">${FACES[mood] || FACES.happy}</g>`;
    if (cos < 0) s += backItem;
    if (HEAD[look.head]) s += `<g transform="translate(${18 * sin} 0)">${HEAD[look.head]}</g>`;
    s += '</svg>';
    return s;
  }
  const canTurn = (style) => ['soft', 'diorama'].includes(style || Lumi.style || 'soft');

  const Lumi = { svg, face, item, COLORS, DEFAULT_LOOK, MINI, style: 'soft', turnSvg, canTurn };
  window.Lumi = Lumi;
})();
