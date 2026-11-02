/*
  movebreak.js
  "Move with Lumi": movement breaks on the Break screen (kid.js).
  Many children settle better by moving than by sitting still. Lumi shows one move at a time and counts
  slowly while the child copies. Two kinds:
  - Calm moves: pushing, squeezing and slow stretching (helps the body settle).
  - Energy moves: jumping, marching, shaking out (wakes up a tired or fidgety body).
  Little ones get animal moves, Teens get calmer stretches. Every move has a sitting version (grown-ups
  can choose "seated moves only"). The child can skip a move or stop at any time; there is no score.
  Movement is always offered as a choice: breathing stays the first thing on the Break screen.
  Grown-ups (Sensory > Play and breaks): movement breaks on or off, and calm / energy / child chooses.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, tone } = A;

  // anim: how Lumi moves on screen. icon: a small picture of the move. seated: the sitting version.
  const MOVES = {
    calm: [
      { id: 'push', name: 'Wall push', say: 'Push the wall, strong and slow.', seated: 'Push your hands together, strong and slow.', anim: 'push', icon: 'kBreak' },
      { id: 'reach', name: 'Big stretch', say: 'Reach up high, high, high.', seated: 'Sit tall and reach up high.', anim: 'reach', icon: 'stretch' },
      { id: 'hug', name: 'Squeeze hug', say: 'Hug yourself tight. Then let go.', seated: 'Hug yourself tight. Then let go.', anim: 'hug', icon: 'hug' },
      { id: 'circles', name: 'Slow arm circles', say: 'Make big slow circles with your arms.', seated: 'Make big slow circles with your arms.', anim: 'circles', icon: 'motion' },
      { id: 'fists', name: 'Squeeze and let go', say: 'Squeeze your hands tight. Now let go.', seated: 'Squeeze your hands tight. Now let go.', anim: 'squeeze', icon: 'kSqueeze' }
    ],
    energy: [
      { id: 'jump', name: 'Jumps', say: 'Jump, jump, jump!', seated: 'Bounce your knees up and down.', anim: 'jump', icon: 'jump' },
      { id: 'march', name: 'March', say: 'March on the spot. Knees up!', seated: 'March your feet on the floor.', anim: 'march', icon: 'go' },
      { id: 'star', name: 'Star jumps', say: 'Arms out, legs out, like a star!', seated: 'Arms out wide like a star, then in.', anim: 'star', icon: 'stretch' },
      { id: 'shake', name: 'Shake it out', say: 'Shake your hands, shake your arms, shake it all out!', seated: 'Shake your hands and arms.', anim: 'shake', icon: 'motion' },
      { id: 'toes', name: 'Touch your toes', say: 'Reach down and touch your toes.', seated: 'Reach down to your feet.', anim: 'bend', icon: 'person' }
    ]
  };
  // Little ones: the same moves as animals
  const LITTLE = {
    calm: [
      { id: 'cat', name: 'Cat stretch', say: 'Stretch like a sleepy cat. Big stretch!', seated: 'Stretch your arms like a sleepy cat.', anim: 'reach', icon: 'stretch' },
      { id: 'bear', name: 'Bear hug', say: 'Give yourself a big bear hug.', seated: 'Give yourself a big bear hug.', anim: 'hug', icon: 'hug' },
      { id: 'turtle', name: 'Turtle tuck', say: 'Curl up small like a turtle. Now pop out!', seated: 'Curl up small like a turtle. Now sit tall!', anim: 'squeeze', icon: 'kSqueeze' },
      { id: 'tree', name: 'Tall tree', say: 'Stand tall like a tree. Sway slowly.', seated: 'Sit tall like a tree. Sway slowly.', anim: 'sway', icon: 'sTree' }
    ],
    energy: [
      { id: 'bunny', name: 'Bunny hops', say: 'Hop, hop, hop like a bunny!', seated: 'Bounce like a bunny in your seat.', anim: 'jump', icon: 'jump' },
      { id: 'elephant', name: 'Elephant stomps', say: 'Stomp, stomp, like a big elephant!', seated: 'Stomp your feet like an elephant.', anim: 'march', icon: 'go' },
      { id: 'jelly', name: 'Wobbly jelly', say: 'Wiggle like a wobbly jelly!', seated: 'Wiggle like a wobbly jelly!', anim: 'shake', icon: 'motion' },
      { id: 'starfish', name: 'Starfish', say: 'Big starfish! Arms and legs out.', seated: 'Big starfish arms! Out, and in.', anim: 'star', icon: 'stretch' }
    ]
  };
  // Teens: calmer stretches
  const TEEN = {
    calm: [
      { id: 'neck', name: 'Neck roll', say: 'Slowly tip your head to one side, then the other.', seated: 'Slowly tip your head to one side, then the other.', anim: 'tilt', icon: 'person' },
      { id: 'shrug', name: 'Shoulder shrugs', say: 'Lift your shoulders up to your ears. Drop them down.', seated: 'Lift your shoulders up to your ears. Drop them down.', anim: 'shrug', icon: 'person' },
      { id: 'push', name: 'Wall push', say: 'Push the wall, strong and slow.', seated: 'Press your palms together, strong and slow.', anim: 'push', icon: 'kBreak' },
      { id: 'reach', name: 'Side stretch', say: 'Reach one arm over your head. Then the other.', seated: 'Reach one arm over your head. Then the other.', anim: 'side', icon: 'stretch' },
      { id: 'fists', name: 'Squeeze and release', say: 'Make tight fists. Hold. Release.', seated: 'Make tight fists. Hold. Release.', anim: 'squeeze', icon: 'kSqueeze' }
    ],
    energy: [
      { id: 'march', name: 'March', say: 'March on the spot.', seated: 'March your feet.', anim: 'march', icon: 'go' },
      { id: 'jacks', name: 'Jumping jacks', say: 'Jumping jacks, nice and steady.', seated: 'Arms up and down, nice and steady.', anim: 'star', icon: 'stretch' },
      { id: 'swing', name: 'Arm swings', say: 'Swing your arms forward and back.', seated: 'Swing your arms forward and back.', anim: 'swing', icon: 'motion' },
      { id: 'shake', name: 'Shake out', say: 'Shake out your hands and arms.', seated: 'Shake out your hands and arms.', anim: 'shake', icon: 'motion' }
    ]
  };
  const setFor = () => (state.profile.age === 'little' ? LITTLE : state.profile.age === 'teen' ? TEEN : MOVES);
  const seated = () => !!state.settings.moveSeated;
  const kindSetting = () => state.settings.moveKind || 'choose'; // 'choose' | 'calm' | 'energy'
  A.moveBreakOn = () => state.settings.moveBreak !== false;

  // ---------------------------------------------------------------- Lumi shows the move (arms, legs and arrows)
  // Lumi's round body comes from lumi.js. For movement breaks we add arms and legs and move them every frame,
  // in time with the count, so the child can see exactly what to do: where the arms go, how the knees lift,
  // which way to tip. Dotted arrows show the direction. Numbers are in Lumi's own drawing units
  // (body centre 120,136, body bottom 220, floor 262).
  const FLOOR = 262;
  const ARM = [44, 42];
  const LEG = [32, 32];
  const SH = { L: [42, 150], R: [198, 150] };         // shoulders (on the body)
  const SH_BACK = [176, 138];                          // far shoulder when Lumi turns to push a wall
  const HIP = { L: [96, 204], R: [144, 204] };
  const REST = { L: [20, 230], R: [220, 230] };       // hands hanging down (on the body)
  const FEET = { L: [94, FLOOR], R: [146, FLOOR] };
  const WALL = 292;
  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  const wave = (p) => (1 - Math.cos(TAU * p)) / 2;    // 0 → 1 → 0 once per count
  const frac = (t) => t - Math.floor(t);
  const body = (o) => Object.assign({ tx: 0, ty: 0, rot: 0, sy: 1 }, o);
  // a point on Lumi's body → the screen (squash, then tip about the bottom of the body, then move)
  function onBody(b, pt) {
    const x = pt[0];
    const y = 220 - (220 - pt[1]) * b.sy;
    const r = (b.rot * Math.PI) / 180;
    const c = Math.cos(r);
    const sn = Math.sin(r);
    const dx = x - 120;
    const dy = y - 220;
    return [120 + dx * c - dy * sn + b.tx, 220 + dx * sn + dy * c + b.ty];
  }
  // two-bone reach: from a joint to a target; the elbow or knee bends outwards
  function reach(a, t, len, side, down) {
    let dx = t[0] - a[0];
    let dy = t[1] - a[1];
    let d = Math.hypot(dx, dy) || 0.01;
    const l1 = len[0];
    const l2 = len[1];
    const max = l1 + l2 - 0.5;
    if (d > max) { t = [a[0] + (dx / d) * max, a[1] + (dy / d) * max]; dx = t[0] - a[0]; dy = t[1] - a[1]; d = max; }
    d = Math.max(d, 4);
    const ux = dx / d;
    const uy = dy / d;
    const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    const n1 = [-uy, ux];
    const n2 = [uy, -ux];
    const score = (n) => n[0] * side + n[1] * down;
    const n = score(n1) >= score(n2) ? n1 : n2;
    return { a, j: [a[0] + ux * x + n[0] * h, a[1] + uy * x + n[1] * h], e: t };
  }

  // Each move: where the body, hands and feet are at time t (t counts up by 1 each count).
  // Hands are given on the body (they move with it) unless the move says hands: 'world'.
  const POSES = {
    jump(t, sit) {
      const w = wave(frac(t));
      if (sit) return { b: body({ ty: -7 * w }), hands: { L: mix(REST.L, [30, 196], w), R: mix(REST.R, [210, 196], w) }, feet: { L: [94, FLOOR - 10 * w], R: [146, FLOOR - 10 * w] } };
      const air = Math.max(0, (w - 0.3) / 0.7);
      return {
        b: body({ ty: 10 * (1 - w) - 46 * w, sy: 1 - 0.07 * (1 - w) + 0.03 * w }),
        hands: { L: mix(REST.L, [-8, 96], w), R: mix(REST.R, [248, 96], w) },
        feet: { L: [94, FLOOR - 36 * air], R: [146, FLOOR - 36 * air] }, shadow: 1 - 0.45 * w
      };
    },
    march(t, sit) {
      const q = Math.sin(TAU * frac(t));
      const l = Math.max(0, q);
      const r = Math.max(0, -q);
      const up = sit ? 20 : 34;
      return {
        b: body({ ty: sit ? 0 : -3 * (l + r), rot: 3 * q }),
        hands: { L: mix(REST.L, [56, 168], r), R: mix(REST.R, [184, 168], l) }, big: { L: 1 + 0.25 * r, R: 1 + 0.25 * l },
        feet: { L: [94, FLOOR - up * l], R: [146, FLOOR - up * r] }
      };
    },
    star(t, sit) {
      const p = frac(t);
      const w = wave(p);
      const hop = sit ? 0 : Math.abs(Math.sin(TAU * p));
      return {
        b: body({ ty: -16 * hop }),
        hands: { L: mix(REST.L, [-36, 70], w), R: mix(REST.R, [276, 70], w) },
        feet: sit ? FEET : { L: [lerp(94, 56, w), FLOOR - 14 * hop], R: [lerp(146, 184, w), FLOOR - 14 * hop] }, shadow: 1 - 0.2 * hop
      };
    },
    shake(t, sit) {
      const f = Math.sin(TAU * 3 * t);
      const g = Math.cos(TAU * 3 * t);
      return {
        b: body({ rot: 3 * Math.sin(TAU * 2 * t), ty: sit ? 0 : -3 * Math.abs(f) }),
        hands: { L: [12 + 14 * f, 188 + 16 * g], R: [228 - 14 * f, 188 - 16 * g] },
        feet: sit ? FEET : { L: [94 + 4 * f, FLOOR], R: [146 - 4 * f, FLOOR] }
      };
    },
    bend(t, sit) {
      const w = wave(frac(t));
      const b = body({ ty: (sit ? 14 : 22) * w, sy: 1 - 0.1 * w });
      return { b, hands: 'world', L: mix(onBody(b, REST.L), [84, FLOOR - 6], w), R: mix(onBody(b, REST.R), [156, FLOOR - 6], w), feet: FEET };
    },
    push(t, sit) {
      const w = wave(frac(t));
      if (sit) return { b: body({ sy: 1 - 0.03 * w }), hands: { L: [lerp(64, 112, w), 176], R: [lerp(176, 128, w), 176] }, feet: FEET };
      const b = body({ tx: 4 + 18 * w, rot: 6 + 6 * w });
      return { b, hands: 'world', L: [WALL - 14, 122], R: [WALL - 14, 152], feet: { L: [84, FLOOR], R: [140, FLOOR] }, backL: true };
    },
    reach(t) {
      const w = wave(frac(t));
      return { b: body({ sy: 1 + 0.08 * w, ty: -4 * w }), hands: { L: mix(REST.L, [34, 30], w), R: mix(REST.R, [206, 30], w) }, feet: FEET };
    },
    side(t) {
      const u = Math.sin((TAU * t) / 2);
      return {
        b: body({ rot: -11 * u }),
        hands: { L: mix(REST.L, [62, -6], Math.max(0, -u)), R: mix(REST.R, [178, -6], Math.max(0, u)) }, feet: FEET
      };
    },
    hug(t) {
      const w = wave(frac(t));
      return { b: body({ sy: 1 - 0.05 * w }), hands: { L: mix([-14, 150], [150, 174], w), R: mix([254, 150], [90, 180], w) }, feet: FEET };
    },
    circles(t) {
      const a = TAU * frac(t);
      return {
        b: body({ ty: -3 * Math.abs(Math.sin(a)) }),
        hands: { L: [16 - 36 * Math.sin(a), 128 - 36 * Math.cos(a)], R: [224 + 36 * Math.sin(a), 128 - 36 * Math.cos(a)] }, feet: FEET
      };
    },
    swing(t) {
      const q = Math.sin(TAU * frac(t));
      const l = Math.max(0, q);
      const r = Math.max(0, -q);
      return { b: body({ rot: 2 * q }), hands: { L: mix(REST.L, [64, 118], l), R: mix(REST.R, [176, 118], r) }, big: { L: 1 + 0.3 * l, R: 1 + 0.3 * r }, feet: FEET };
    },
    sway(t) {
      return { b: body({ rot: 8 * Math.sin((TAU * t) / 2) }), hands: { L: [40, 46], R: [200, 46] }, feet: FEET };
    },
    squeeze(t) {
      const w = wave(frac(t));
      return { b: body({ sy: 1 - 0.08 * w }), hands: { L: mix(REST.L, [100, 178], w), R: mix(REST.R, [140, 178], w) }, fist: w, feet: FEET };
    },
    tilt(t) {
      return { b: body({ rot: 13 * Math.sin((TAU * t) / 2) }), hands: { L: REST.L, R: REST.R }, feet: FEET };
    },
    shrug(t) {
      const w = wave(frac(t));
      return { b: body({ sy: 1 - 0.06 * w, ty: 4 * w }), lift: 44 * w, hands: { L: [REST.L[0] - 6 * w, REST.L[1] - 44 * w], R: [REST.R[0] + 6 * w, REST.R[1] - 44 * w] }, feet: FEET };
    }
  };

  // dotted arrows that show the direction of each move
  function guides(anim, sit) {
    const both = { side: 1, tilt: 1, swing: 1, sway: 1 };
    const G = {
      jump: ['M-44 236 L-44 150', 'M284 236 L284 150'],
      march: ['M54 262 L54 214', 'M186 262 L186 214'],
      star: sit ? ['M12 118 L-40 66', 'M228 118 L280 66'] : ['M12 118 L-40 66', 'M228 118 L280 66', 'M66 276 L30 276', 'M174 276 L210 276'],
      shake: ['M-62 196 l10 -12 l10 12 l10 -12 l10 12', 'M262 196 l10 -12 l10 12 l10 -12 l10 12'],
      bend: ['M-44 120 L-44 236', 'M284 120 L284 236'],
      push: sit ? ['M-56 176 L-4 176', 'M296 176 L244 176'] : ['M170 24 L262 24'],
      reach: ['M-34 160 L-34 40', 'M274 160 L274 40'],
      side: ['M36 6 Q120 -48 204 6'],
      hug: ['M-66 168 L-24 168', 'M306 168 L264 168'],
      circles: ['M16 70 A58 58 0 1 0 74 128', 'M224 70 A58 58 0 1 1 166 128'],
      swing: ['M-30 236 Q-70 172 -16 110', 'M270 236 Q310 172 256 110'],
      sway: ['M30 -4 Q120 -52 210 -4'],
      squeeze: ['M-20 176 L30 176', 'M260 176 L210 176'],
      tilt: ['M30 8 Q120 -50 210 8'],
      shrug: ['M2 160 L2 104', 'M238 160 L238 104']
    }[anim] || [];
    return G.map((d) => `<path d="${d}" class="mvf-guide" marker-end="url(#mvfArrow)"${both[anim] ? ' marker-start="url(#mvfArrow)"' : ''}/>`).join('');
  }

  function limbHtml(cls, col, edge, wdt, end) {
    return `<g class="${cls}"><path class="o" fill="none" stroke="${edge}" stroke-width="${wdt + 6}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path class="f" fill="none" stroke="${col}" stroke-width="${wdt}" stroke-linecap="round" stroke-linejoin="round"/>${end}</g>`;
  }
  // the whole figure, drawn once per move; frame() moves the parts
  function figureHtml(anim, kind) {
    const sit = seated();
    const look = A.lookWith({ spark: 'none' });
    const c = L.COLORS[look.color] || L.COLORS.orange;
    const mini = L.style === 'minimal';
    const col = mini ? '#fff' : c.body;
    const edge = mini ? L.MINI : c.feet;
    const foot = look.feet === 'boots' ? '#F4D35E' : mini ? '#fff' : c.feet;
    const footEdge = look.feet === 'boots' ? '#C98A1E' : mini ? L.MINI : c.feet;
    const ink = kind === 'calm' ? '#9C88D8' : '#E0A21A';
    const hand = `<circle class="h" r="14" fill="${col}" stroke="${edge}" stroke-width="3"/>`;
    const arm = (side) => limbHtml(`mvf-arm${side}`, col, edge, mini ? 12 : 18, hand);
    const leg = (side) => limbHtml(`mvf-leg${side}`, col, edge, mini ? 12 : 20, `<ellipse class="h" rx="22" ry="12" fill="${foot}" stroke="${footEdge}" stroke-width="${mini ? 5 : 0}"/>`);
    const back = anim === 'push' && !sit;
    const lumi = L.svg({ look, mood: kind === 'calm' ? 'calm' : 'excited', size: 268, noFeet: true, label: 'Lumi showing the move' })
      .replace(/width="268" height="268"/, 'x="-14" y="-14" width="268" height="268"');
    const chair = sit
      ? '<g class="mvf-chair"><rect x="30" y="96" width="14" height="166" rx="6" fill="#A87B50"/><rect x="196" y="96" width="14" height="166" rx="6" fill="#A87B50"/><rect x="26" y="90" width="188" height="16" rx="8" fill="#C99A6B"/><rect x="18" y="212" width="204" height="20" rx="10" fill="#C99A6B"/></g>'
      : '';
    const wall = back ? `<g class="mvf-wall"><rect x="${WALL}" y="20" width="34" height="${FLOOR - 20}" rx="6" fill="#E9DCC8"/><path d="M${WALL} 80 h34 M${WALL} 140 h34 M${WALL} 200 h34" stroke="#D6C4A8" stroke-width="3"/></g>` : '';
    return `<svg class="mvf" data-anim="${anim}" viewBox="-90 -40 420 330" width="400" height="314" role="img" aria-label="Lumi showing how to do the move">
      <defs><marker id="mvfArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="${ink}"/></marker></defs>
      <g class="mvf-guides" stroke="${ink}">${guides(anim, sit)}</g>
      ${wall}
      <ellipse class="mvf-shadow" cx="120" cy="${FLOOR + 4}" rx="92" ry="11" fill="#5A3C28" opacity=".1"/>
      ${chair}
      ${back ? arm('L') : ''}
      ${leg('L')}${leg('R')}
      <g class="mvf-body">${lumi}</g>
      ${back ? '' : arm('L')}${arm('R')}
    </svg>`;
  }
  const P = (pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
  function setLimb(g, k, start, big, fist, isFoot, side) {
    // start the drawn line a little way out from the joint so it grows out of the body
    const dx = k.j[0] - k.a[0];
    const dy = k.j[1] - k.a[1];
    const d = Math.hypot(dx, dy) || 1;
    const a0 = isFoot ? k.a : [k.a[0] + (dx / d) * start, k.a[1] + (dy / d) * start];
    const dd = `M${P(a0)} L${P(k.j)} L${P(k.e)}`;
    g.o.setAttribute('d', dd);
    g.f.setAttribute('d', dd);
    if (isFoot) {
      g.h.setAttribute('cx', (k.e[0] + side * 8).toFixed(1));
      g.h.setAttribute('cy', (k.e[1] + 2).toFixed(1));
    } else {
      g.h.setAttribute('cx', k.e[0].toFixed(1));
      g.h.setAttribute('cy', k.e[1].toFixed(1));
      g.h.setAttribute('r', ((fist ? lerp(14, 11, fist) : 14) * (big || 1)).toFixed(1));
      g.h.setAttribute('fill', fist > 0.5 ? g.edge : g.col);
    }
  }
  function frame(root, m, now) {
    const mv = m.list[m.i];
    const pose = (POSES[mv.anim] || POSES.reach)((now - m.t0) / beat(m.kind), seated());
    let parts = root._mvf;
    if (!parts) {
      const grab = (cls) => {
        const g = root.querySelector('.' + cls);
        const f = g.querySelector('.f');
        return { o: g.querySelector('.o'), f, h: g.querySelector('.h'), col: f.getAttribute('stroke'), edge: g.querySelector('.o').getAttribute('stroke') };
      };
      parts = root._mvf = { armL: grab('mvf-armL'), armR: grab('mvf-armR'), legL: grab('mvf-legL'), legR: grab('mvf-legR'), body: root.querySelector('.mvf-body'), shadow: root.querySelector('.mvf-shadow') };
    }
    const b = pose.b;
    parts.body.setAttribute('transform', `translate(${b.tx.toFixed(1)} ${b.ty.toFixed(1)}) rotate(${b.rot.toFixed(2)} 120 220) translate(0 ${(220 * (1 - b.sy)).toFixed(2)}) scale(1 ${b.sy.toFixed(3)})`);
    parts.shadow.setAttribute('rx', (92 * (pose.shadow || 1)).toFixed(1));
    const lift = pose.lift || 0;
    const world = pose.hands === 'world';
    ['L', 'R'].forEach((k) => {
      const side = k === 'L' ? -1 : 1;
      const sh = pose.backL && k === 'L' ? onBody(b, SH_BACK) : onBody(b, [SH[k][0], SH[k][1] - lift]);
      const target = world ? pose[k] : onBody(b, pose.hands[k]);
      const armSide = pose.backL && k === 'L' ? 1 : side;
      setLimb(parts['arm' + k], reach(sh, target, ARM, armSide, 0.5), 9, pose.big && pose.big[k], pose.fist || 0, false);
      const hip = onBody(b, HIP[k]);
      setLimb(parts['leg' + k], reach(hip, pose.feet[k], LEG, side, 0), 0, 1, 0, true, side);
    });
  }
  let raf = 0;
  function animate() {
    cancelAnimationFrame(raf);
    const tick = (now) => {
      const m = S.brk && S.brk.move;
      if (!m || m.stage !== 'go') { raf = 0; return; }
      const root = document.querySelector('svg.mvf');
      if (root) frame(root, m, now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------------- running a routine (plain timers: the app's own timers pause during a break)
  let timer = null;
  const stop = () => { clearInterval(timer); clearTimeout(timer); timer = null; cancelAnimationFrame(raf); raf = 0; };
  A.moveBreakStop = stop;
  const speak = (t) => { if (!S.brk || !S.brk.quiet) say(t); };
  function start(kind) {
    const b = S.brk;
    const all = setFor()[kind];
    const n = state.profile.age === 'little' ? 3 : 4;
    b.move = { stage: 'go', kind, list: all.slice(0, n), i: 0, count: 0 };
    A.track('moveBreak', kind === 'calm' ? 'Calm moves' : 'Energy moves', { quiet: true });
    showMove();
  }
  function beat(kind) { return kind === 'calm' ? 1900 : state.profile.age === 'little' ? 1100 : 950; }
  const COUNTS = { calm: 5, energy: 8 };
  function showMove() {
    stop();
    const m = S.brk.move;
    const mv = m.list[m.i];
    m.count = 0;
    m.t0 = performance.now() + 2600;
    A.drawBreak();
    animate();
    speak(`${mv.name}. ${seated() ? mv.seated : mv.say}`);
    // a short pause to look at the move, then Lumi counts slowly
    timer = setTimeout(() => {
      const total = state.profile.age === 'little' ? 5 : COUNTS[m.kind];
      timer = setInterval(() => {
        if (!S.brk || !S.brk.move || S.brk.move !== m) { stop(); return; }
        m.count += 1;
        tone(m.kind === 'calm' ? 392 + m.count * 20 : 523 + (m.count % 2) * 130, m.kind === 'calm' ? 0.5 : 0.15, 0.05);
        const el = document.querySelector('.mv-count');
        if (el) el.innerHTML = dotsHtml(m.count, total);
        if (m.kind === 'calm' || state.profile.age === 'little') speak(String(m.count));
        if (m.count >= total) { stop(); timer = setTimeout(next, 900); }
      }, beat(m.kind));
    }, 2600);
  }
  function next() {
    const m = S.brk && S.brk.move;
    if (!m) return;
    if (m.i < m.list.length - 1) { m.i += 1; tone(660, 0.2, 0.06); showMove(); return; }
    stop();
    m.stage = 'done';
    A.drawBreak();
    tone(784, 0.25, 0.07); setTimeout(() => tone(988, 0.35, 0.07), 160);
    speak(m.kind === 'calm' ? 'Well done. Your body feels calmer now.' : 'Great moving! Your body is awake and ready.');
  }
  const dotsHtml = (n, total) => Array.from({ length: total }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('');

  // ---------------------------------------------------------------- what the Break screen shows
  A.moveBreakHtml = (b) => {
    const m = b.move;
    if (m.stage === 'pick') {
      const little = state.profile.age === 'little';
      return `<div class="brk-mid mv-pick">
        <button class="mv-kind calm" data-a="mvStart" data-v="calm">
          <span class="mv-kind-lumi">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'calm', size: 150 })}</span>
          <b>${little ? 'Slow animal moves' : 'Calm moves'}</b><span>${little ? 'Cat stretch, bear hug' : 'Push, stretch, squeeze'}</span></button>
        <button class="mv-kind energy" data-a="mvStart" data-v="energy">
          <span class="mv-kind-lumi">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'excited', size: 150 })}</span>
          <b>${little ? 'Bouncy animal moves' : 'Energy moves'}</b><span>${little ? 'Bunny hops, elephant stomps' : 'Jump, march, shake'}</span></button>
      </div>`;
    }
    if (m.stage === 'done') {
      return `<div class="brk-mid mv-done">
        <span class="mv-lumi hop">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'excited', size: 220, wave: true })}</span>
        <div class="col gap16"><b class="mv-done-title">${m.kind === 'calm' ? 'Well done!' : 'Great moving!'}</b>
          <div class="row gap12"><button class="brk-opt" data-a="mvAgain">${ic('restart', 36)}<span>More moves</span></button>
          <button class="brk-opt" data-a="brkMove">${ic('kCalm', 36)}<span>Breathe</span></button></div></div>
      </div>`;
    }
    const mv = m.list[m.i];
    const total = state.profile.age === 'little' ? 5 : COUNTS[m.kind];
    return `<div class="brk-mid mv-go ${m.kind}">
      <div class="mv-stage">${figureHtml(mv.anim, m.kind)}</div>
      <div class="mv-card">
        <span class="mv-step">${m.i + 1} of ${m.list.length}</span>
        <span class="mv-ic">${ic(mv.icon, 72)}</span>
        <b class="mv-name">${esc(mv.name)}</b>
        <span class="mv-say">${esc(seated() ? mv.seated : mv.say)}</span>
        <span class="mv-count">${dotsHtml(m.count, total)}</span>
        <span class="row gap12"><button class="brk-opt small" data-a="mvSkip">${ic('arrow', 28)}<span>Skip</span></button><button class="brk-opt small" data-a="brkMove">${ic('stop', 28)}<span>Stop</span></button></span>
      </div>
    </div>`;
  };

  Object.assign(A.ACTIONS, {
    // the Move / Breathe button on the Break screen
    brkMove: () => {
      const b = S.brk;
      if (!b) return 'keep';
      stop();
      if (b.move) { b.move = null; A.drawBreak(); speak('Breathe slowly with me.'); return 'keep'; }
      const k = kindSetting();
      if (k === 'calm' || k === 'energy') { b.move = { stage: 'go' }; start(k); return 'keep'; }
      b.move = { stage: 'pick' };
      A.drawBreak();
      speak('Do you want calm moves, or energy moves?');
      return 'keep';
    },
    mvStart: (d) => { start(d.v); return 'keep'; },
    mvSkip: () => { stop(); next(); return 'keep'; },
    mvAgain: () => { const m = S.brk && S.brk.move; if (m) start(m.kind); return 'keep'; }
  });
})();
