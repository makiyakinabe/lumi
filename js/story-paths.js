/*
  story-paths.js
  "You choose!": every story has two places where the child decides what happens next, and the story goes
  that way. Each choice opens its own little scene, where the child does the thing they chose (gives it to
  Lumi, or taps to do it), so no two tellings need be the same.

  - Nothing is a wrong answer. Every way is a good way.
  - "You did it!" shows the story the child made this time (their choices as pictures) and how many of the
    ways they have found so far, so playing again is a reason to choose something new.
  - The ways found are kept in state.storyPaths[storyId][forkKey] = [option numbers].

  A fork:  fork(storyId, afterStepId, { key, q, at, opts })
    at    the step whose picture and Lumi the fork borrows (default: the step it comes after)
    opts  [label, picture, what happens, what to do, 'give' | 'tap' | 'tap3', what Lumi says after, mood]
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, S, state, ic, esc, say, tone, save } = A;
  const SX = A.SX;
  if (!SX) return;
  const pic = (e) => (window.lumiPic && window.lumiPic(e, '100%')) || `<span class="sp-emoji">${e}</span>`;
  const found = (sid, key) => (((state.storyPaths || {})[sid] || {})[key] || []);

  function spotOf(ref, st) {
    let l = null;
    try { l = SX.val(ref.lumi, { data: st.data, s: {}, done: false }); } catch (e) { l = null; }
    const ok = l && [l.x, l.y, l.h].every((n) => typeof n === 'number' && isFinite(n));
    return ok ? { x: l.x, y: l.y, h: l.h, z: l.z, flip: l.flip } : { x: 300, y: 545, h: 220 };
  }
  const bgOf = (ref) => (typeof ref.bg === 'function' ? (st) => ref.bg({ data: st.data, s: {}, done: false }) : ref.bg);

  function fork(sid, afterId, def) {
    const story = D.STORIES.find((s) => s.id === sid);
    if (!story) return;
    const at = story.steps.findIndex((p) => p.id === afterId);
    const ref = story.steps.find((p) => p.id === (def.at || afterId));
    if (at < 0 || !ref) return;
    const opts = def.opts.map((o) => ({ label: o[0], e: o[1], art: pic(o[1]), text: o[2], task: o[3], kind: o[4], reply: o[5], mood: o[6] || 'happy' }));
    const mine = (st) => (st.data.paths || {})[def.key];
    const lumiSide = (st) => (spotOf(ref, st).x > 560 ? 'left' : 'right');

    const choose = {
      id: 'choose-' + def.key, fork: def.key, forkOpts: opts, noDemo: true,
      bg: bgOf(ref),
      text: (st) => (mine(st) != null ? `${opts[mine(st)].label}. Good choice!` : def.q),
      task: () => 'You choose! Tap one.',
      lumi: (st) => Object.assign(spotOf(ref, st), { mood: mine(st) != null ? 'excited' : 'happy' }),
      enter(st) { if (mine(st) != null) st.done = true, st.praise = 'You chose!'; },
      draw(st) {
        const side = lumiSide(st);
        return `<div class="sp-pick ${side}"><span class="sp-flag">${ic('star', 22)}<b>You choose!</b></span>
          ${opts.map((o, i) => `<button class="sp-opt ${mine(st) === i ? 'on' : ''}" data-a="sx" data-k="path" data-v="${i}" aria-label="${esc(o.label)}${found(sid, def.key).includes(i) ? '' : ', new'}">
            <span class="sp-art">${o.art}</span><b>${esc(o.label)}</b>${found(sid, def.key).includes(i) ? '' : '<i class="sp-new">New</i>'}</button>`).join('')}</div>`;
      },
      tap(st, k, el, d) {
        if (k !== 'path') return;
        const i = Number(d.v);
        st.data.paths = st.data.paths || {};
        st.data.paths[def.key] = i;
        state.storyPaths = state.storyPaths || {};
        const mineSaved = (state.storyPaths[sid] = state.storyPaths[sid] || {});
        if (!(mineSaved[def.key] || []).includes(i)) mineSaved[def.key] = (mineSaved[def.key] || []).concat(i);
        save();
        st.done = false;
        SX.done(st, 'You chose!');
      },
      guide: () => ({ sel: '.sp-opt', say: 'You choose what happens. Tap one.', tap: true })
    };

    const scenes = opts.map((o, i) => {
      const taps = o.kind === 'tap3' ? 3 : 1;
      return {
        id: `path-${def.key}-${i}`, when: (st) => mine(st) === i,
        bg: bgOf(ref),
        text: o.text,
        task: (st) => (taps > 1 ? `${o.task} (${Math.min(taps, st.s.n || 0)} of ${taps})` : o.task),
        lumi: (st) => Object.assign(spotOf(ref, st), { mood: st.done ? 'excited' : o.mood, wave: st.done }),
        draw(st) {
          const side = lumiSide(st);
          const sp = spotOf(ref, st);
          const x = side === 'left' ? 90 : 820;
          let h = '';
          if (!st.done) {
            h += o.kind === 'give'
              ? SX.at(x, 150, 200, 200, `<div class="sx-give">${o.art}<b>${esc(o.label)}</b></div>`, { cls: 'sx-drag sx-give-it', label: o.label, z: 9 })
              : SX.at(x, 150, 200, 200, `<div class="sx-give sp-tap">${o.art}<b>${esc(o.label)}</b></div>`, { k: 'do', cls: 'sp-do', label: o.label, z: 9 });
          } else {
            h += SX.bubble(Math.max(20, Math.min(SX.W - 340, sp.x - 150)), Math.max(14, sp.y - sp.h - 78), o.reply, { tail: 'down', w: 310 });
            h += `<span class="sp-spark" style="left:${Math.round(sp.x - 110)}px;top:${Math.round(sp.y - sp.h * 0.8)}px"></span><span class="sp-spark b" style="left:${Math.round(sp.x + 80)}px;top:${Math.round(sp.y - sp.h * 0.6)}px"></span>`;
          }
          return h;
        },
        tap(st, k, el) {
          if (k !== 'do' || st.done) return;
          st.s.n = (st.s.n || 0) + 1;
          tone(520 + st.s.n * 90, 0.14, 0.06);
          if (st.s.n >= taps) { SX.done(st, o.reply); return; }
          SX.render();
          say(taps - st.s.n === 1 ? 'One more!' : 'Again!');
        },
        after(st, box) {
          if (st.done || o.kind !== 'give') return;
          SX.dragTo(box, '.sx-give-it', '.sx-lumi', () => { SX.done(st, o.reply); return false; }, { pad: 46, miss: () => say('Drag it all the way to Lumi.'), tap: () => say('Drag it to Lumi.') });
        },
        auto(st) { st.s.n = taps; },
        guide: () => (o.kind === 'give' ? { sel: '.sx-give-it', to: '.sx-lumi', say: o.task } : { sel: '.sp-do', say: o.task, tap: true })
      };
    });
    story.steps.splice(at + 1, 0, choose, ...scenes);
    story.pages = story.steps;
  }

  // ---------------------------------------------------------------- the forks, two for every story
  const HELLO = (who, back) => [
    ['Wave', '👋', `Lumi waves to ${who}.`, 'Tap to wave.', 'tap', `${back} waves back!`],
    ['Smile', '🙂', `Lumi gives ${who} a big smile.`, 'Tap to smile.', 'tap', `${back} smiles too.`],
    ['Say hello', '💬', `Lumi says: "Hello!"`, 'Tap to say hello.', 'tap', `"Hello, Lumi!" says ${who}.`]
  ];
  const STICKERS = [
    ['Star sticker', '⭐', 'Lumi picks the shiny star sticker.', 'Drag the sticker to Lumi.', 'give', 'A star for a star!'],
    ['Lion sticker', '🦁', 'Lumi picks the brave lion sticker.', 'Drag the sticker to Lumi.', 'give', 'Roar! Brave like a lion.'],
    ['Balloon sticker', '🎈', 'Lumi picks the red balloon sticker.', 'Drag the sticker to Lumi.', 'give', 'Up, up and away!']
  ];
  const WAITING = (what) => [
    ['Read a book', '📚', `${what} Lumi reads a book about animals.`, 'Drag the book to Lumi.', 'give', 'Reading makes waiting easier.', 'calm'],
    ['Listen to music', '🎧', `${what} Lumi listens to quiet music.`, 'Drag the headphones to Lumi.', 'give', 'Nice and calm.', 'calm'],
    ['Do a puzzle', '🧩', `${what} Lumi does a little puzzle.`, 'Drag the puzzle to Lumi.', 'give', 'Click! The piece fits.', 'calm']
  ];

  fork('hawkerstory', 'eat', { key: 'drink', q: 'Lumi is thirsty. Which drink will Lumi get?', opts: [
    ['Water', '💧', 'Lumi gets a cup of water. Cool and fresh.', 'Drag the water to Lumi.', 'give', 'Ahh! Water is good.'],
    ['Juice', '🧃', 'Lumi gets a box of juice. Sweet!', 'Drag the juice to Lumi.', 'give', 'Yum! Sweet juice.'],
    ['Milk', '🥛', 'Lumi gets a cold glass of milk.', 'Drag the milk to Lumi.', 'give', 'Milk makes Lumi strong.']] });
  fork('hawkerstory', 'return', { key: 'after', q: 'Lunch is done. What does Lumi do next?', opts: [
    ['Wash hands', '🧼', 'Lumi washes hands with soap. Rub, rub, rub.', 'Tap the soap.', 'tap3', 'Clean hands!'],
    ['Say thank you', '💬', 'Lumi sees the uncle from the stall. Lumi says: "Thank you!"', 'Tap to say thank you.', 'tap', '"You are welcome!" says the uncle.'],
    ['Get ice cream', '🍦', 'Lumi has a little money left. Lumi gets an ice cream.', 'Drag the ice cream to Lumi.', 'give', 'A cold, sweet treat!', 'excited']] });

  fork('dentist', 'reception', { key: 'hello', q: 'The lady at the counter looks up. How does Lumi say hello?', opts: HELLO('the lady', 'She') });
  fork('dentist', 'sticker', { key: 'sticker', q: 'Lumi can pick one sticker. Which one?', opts: STICKERS });

  fork('haircut', 'hello', { key: 'ask', q: 'The hairdresser asks: "How would you like it?"', opts: [
    ['A little trim', '✂', 'Lumi says: "Just a little trim, please."', 'Tap to tell the hairdresser.', 'tap', '"A little trim it is!"'],
    ['Short and neat', '✨', 'Lumi says: "Short and neat, please."', 'Tap to tell the hairdresser.', 'tap', '"Short and neat. Got it!"'],
    ['Mum helps choose', '👩', 'Lumi is not sure. Lumi asks Mum to help choose.', 'Tap to ask Mum.', 'tap', 'Mum says: "Not too short, please."', 'worried']] });
  fork('haircut', 'thanks', { key: 'after', q: 'The haircut is done! What does Lumi do?', opts: [
    ['Look in the mirror', '🪞', 'Lumi looks in the mirror one more time.', 'Tap the mirror.', 'tap', 'Looking good, Lumi!'],
    ['High five', '✋', 'Lumi gives the hairdresser a high five.', 'Tap to high five.', 'tap', 'Smack! High five!', 'excited'],
    ['Thumbs up', '👍', 'Lumi gives a big thumbs up.', 'Tap for a thumbs up.', 'tap', 'The hairdresser gives one back!']] });

  fork('polyclinic', 'wait', { key: 'wait', q: 'The wait is long. What does Lumi do?', opts: WAITING('Lumi waits.') });
  fork('polyclinic', 'home', { key: 'rest', q: 'Lumi needs to rest and get better. What does Lumi choose?', opts: [
    ['Sleep in bed', '🛏', 'Lumi lies down in bed for a nap.', 'Tap to tuck Lumi in.', 'tap', 'Sleep helps Lumi get better.', 'sleepy'],
    ['Warm soup', '🥣', 'Mum makes warm soup for Lumi.', 'Drag the soup to Lumi.', 'give', 'Warm and yummy.', 'calm'],
    ['A quiet show', '📺', 'Lumi watches a quiet show on the sofa.', 'Tap to turn it on.', 'tap', 'Resting feels good.', 'calm']] });

  fork('shop', 'find', { key: 'treat', q: 'Mum says: "You can pick one treat." Which one?', opts: [
    ['An apple', '🍎', 'Lumi picks a big red apple.', 'Drag the apple to Lumi.', 'give', 'Crunchy!'],
    ['Biscuits', '🍪', 'Lumi picks a pack of biscuits.', 'Drag the biscuits to Lumi.', 'give', 'A treat for later.'],
    ['Juice', '🧃', 'Lumi picks a box of juice.', 'Drag the juice to Lumi.', 'give', 'Into the trolley it goes.']] });
  fork('shop', 'home', { key: 'help', q: 'The shopping is home. How does Lumi help?', opts: [
    ['Put things away', '📦', 'Lumi puts the things in the cupboard.', 'Tap to put one away.', 'tap3', 'All put away!'],
    ['Wash the apples', '🍎', 'Lumi washes the apples at the sink.', 'Tap to wash one.', 'tap3', 'Clean and shiny.'],
    ['Fold the bag', '🛍', 'Lumi folds the shopping bag for next time.', 'Tap to fold it.', 'tap', 'Ready for next time.']] });

  fork('mrt', 'platform', { key: 'wait', q: 'The train comes in 3 minutes. What does Lumi do?', opts: [
    ['Listen to music', '🎧', 'Lumi puts on headphones while waiting.', 'Drag the headphones to Lumi.', 'give', 'The platform feels quieter.', 'calm'],
    ['Watch the clock', '⏱', 'Lumi watches the minutes go down. 3… 2… 1…', 'Tap to count down.', 'tap3', 'Here comes the train!'],
    ['Breathe slowly', '🌬', 'Lumi stands still and breathes slowly.', 'Tap to breathe.', 'tap3', 'Calm and ready.', 'calm']] });
  fork('mrt', 'tapout', { key: 'exit', q: 'Which way does Lumi go up to the street?', opts: [
    ['The stairs', '🚶', 'Lumi walks up the stairs and holds the rail.', 'Tap to climb.', 'tap3', 'Up at the top!'],
    ['The lift', '♿', 'Lumi takes the lift. It is quieter.', 'Tap the lift button.', 'tap', 'Ding! The doors open.'],
    ['The escalator', '➡', 'Lumi stands on the left of the escalator.', 'Tap to step on.', 'tap', 'Up we go!']] });

  fork('party', 'present', { key: 'play', q: 'What does Lumi play first?', opts: [
    ['Balloons', '🎈', 'Lumi bops a balloon up in the air.', 'Tap the balloon.', 'tap3', 'Boing, boing, boing!', 'excited'],
    ['A puzzle', '🧩', 'Lumi finds a puzzle in a quiet corner.', 'Drag the puzzle to Lumi.', 'give', 'A calm way to play.', 'calm'],
    ['Dancing', '🎶', 'Music is on. Lumi dances!', 'Tap to dance.', 'tap3', 'What a dancer!', 'excited']] });
  fork('party', 'cake', { key: 'tired', at: 'present', q: 'The party is long. Lumi feels tired. What helps?', opts: [
    ['A quiet corner', '🤫', 'Lumi sits in a quiet corner for a little while.', 'Tap to rest.', 'tap', 'Better now.', 'calm'],
    ['A drink of water', '💧', 'Lumi has a drink of water.', 'Drag the water to Lumi.', 'give', 'Ahh. That helps.', 'calm'],
    ['Tell Mum', '💬', 'Lumi tells Mum: "I am tired."', 'Tap to tell Mum.', 'tap', 'Mum says: "Thank you for telling me."', 'worried']] });

  fork('teacher', 'hello', { key: 'hello', q: 'Ms Tan says good morning. How does Lumi say hello?', opts: HELLO('Ms Tan', 'Ms Tan') });
  fork('teacher', 'play', { key: 'tidy', q: 'Play time is over. What does Lumi tidy up?', opts: [
    ['The blocks', '🧱', 'Lumi puts the blocks back in the box.', 'Tap to put one away.', 'tap3', 'All tidy!'],
    ['The books', '📚', 'Lumi puts the books back on the shelf.', 'Tap to put one away.', 'tap3', 'Neat and tidy.'],
    ['The paints', '🎨', 'Lumi puts the lids back on the paints.', 'Tap to close one.', 'tap3', 'Ms Tan says: "Thank you, Lumi!"']] });

  fork('firedrill', 'explain', { key: 'ready', q: 'The alarm will be loud. How does Lumi get ready?', opts: [
    ['Ear defenders', '🎧', 'Lumi gets the ear defenders ready.', 'Drag them to Lumi.', 'give', 'Ready for the loud sound.', 'calm'],
    ['Cover my ears', '🙉', 'Lumi practises covering both ears.', 'Tap to cover ears.', 'tap', 'That works too.', 'calm'],
    ['Stand near Mr Raj', '🧑‍🏫', 'Lumi stands close to Mr Raj.', 'Tap to stand near him.', 'tap', 'Mr Raj says: "I am right here."', 'calm']] });
  fork('firedrill', 'water', { key: 'after', q: 'The drill is over. How does Lumi feel calm again?', opts: [
    ['A drink of water', '💧', 'Lumi has a long drink of water.', 'Drag the water to Lumi.', 'give', 'Cool and calm.', 'calm'],
    ['Slow breaths', '🌬', 'Lumi takes three slow breaths.', 'Tap to breathe.', 'tap3', 'In… and out. Calm.', 'calm'],
    ['A quiet book', '📚', 'Lumi reads a quiet book.', 'Drag the book to Lumi.', 'give', 'Quiet time helps.', 'calm']] });

  fork('work', 'apron', { key: 'hello', q: 'Lumi sees the team. How does Lumi greet them?', opts: [
    ['Wave', '👋', 'Lumi waves to the team.', 'Tap to wave.', 'tap', 'They wave back.'],
    ['Say "Good morning"', '💬', 'Lumi says: "Good morning!"', 'Tap to say it.', 'tap', '"Morning, Lumi!"'],
    ['Thumbs up', '👍', 'Lumi gives the team a thumbs up.', 'Tap for a thumbs up.', 'tap', 'Thumbs up back!']] });
  fork('work', 'praise', { key: 'break', q: 'It is break time. What does Lumi do?', opts: [
    ['Have a drink', '🥤', 'Lumi has a cold drink in the staff room.', 'Drag the drink to Lumi.', 'give', 'A good break.', 'calm'],
    ['Sit and rest', '🪑', 'Lumi sits down and rests.', 'Tap to sit.', 'tap', 'Resting helps Lumi work well.', 'calm'],
    ['Chat with a co-worker', '💬', 'Lumi asks a co-worker: "How is your day?"', 'Tap to ask.', 'tap', '"Good, thanks! And yours?"']] });

  fork('bus', 'sign', { key: 'wait', q: 'The bus comes in 5 minutes. What does Lumi do?', opts: [
    ['Listen to music', '🎧', 'Lumi listens to music at the bus stop.', 'Drag the headphones to Lumi.', 'give', 'The wait feels short.', 'calm'],
    ['Count the cars', '🚗', 'Lumi counts the cars going past.', 'Tap to count a car.', 'tap3', 'One, two, three cars!'],
    ['Sit on the bench', '🪑', 'Lumi sits on the bench.', 'Tap to sit.', 'tap', 'A good place to wait.', 'calm']] });
  fork('bus', 'tapout', { key: 'bye', q: 'Lumi is getting off. What does Lumi do?', opts: [
    ['Wave to the driver', '👋', 'Lumi waves to the driver.', 'Tap to wave.', 'tap', 'The driver waves back.'],
    ['Say thank you', '💬', 'Lumi says: "Thank you!"', 'Tap to say it.', 'tap', '"Have a good day!" says the driver.'],
    ['Smile', '🙂', 'Lumi gives the driver a smile.', 'Tap to smile.', 'tap', 'The driver smiles too.']] });

  fork('library', 'find', { key: 'second', q: 'Lumi can borrow one more book. Which one?', opts: [
    ['A lion book', '🦁', 'Lumi picks a book about lions.', 'Drag the book to Lumi.', 'give', 'Roar!'],
    ['A bus book', '🚌', 'Lumi picks a book about buses.', 'Drag the book to Lumi.', 'give', 'Beep beep!'],
    ['An art book', '🎨', 'Lumi picks a book about painting.', 'Drag the book to Lumi.', 'give', 'So many colours.']] });
  fork('library', 'borrow', { key: 'carry', q: 'How does Lumi carry the books home?', opts: [
    ['In the school bag', '🎒', 'Lumi puts the books in the bag.', 'Tap to put them in.', 'tap', 'Safe in the bag.'],
    ['In two hands', '🤲', 'Lumi holds the books with two hands.', 'Tap to hold them.', 'tap', 'Careful hands.'],
    ['In a shopping bag', '🛍', 'Lumi puts the books in a shopping bag.', 'Tap to put them in.', 'tap', 'Easy to carry.']] });

  fork('jab', 'ask', { key: 'look', q: 'Lumi can choose. Where will Lumi look?', opts: [
    ['Watch the nurse', '👀', 'Lumi likes to see what is happening.', 'Tap to watch.', 'tap', 'Knowing helps Lumi.', 'calm'],
    ['Watch a video', '📱', 'Lumi watches a video on the phone.', 'Drag the phone to Lumi.', 'give', 'A good thing to look at.', 'calm'],
    ['Look at Mum', '👩', 'Lumi looks at Mum. Mum smiles.', 'Tap to look at Mum.', 'tap', 'Mum is right here.', 'calm']] });
  fork('jab', 'sticker', { key: 'sticker', q: 'Lumi can pick one sticker. Which one?', opts: STICKERS });

  fork('thunder', 'cosy', { key: 'cosy', q: 'One more thing for the cosy corner. What?', opts: [
    ['Teddy', '🧸', 'Lumi brings Teddy into the cosy corner.', 'Drag Teddy to Lumi.', 'give', 'Teddy is soft and safe.', 'calm'],
    ['A book', '📚', 'Lumi brings a favourite book.', 'Drag the book to Lumi.', 'give', 'A story for a stormy day.', 'calm'],
    ['A little light', '💡', 'Lumi brings a little night light.', 'Drag the light to Lumi.', 'give', 'A warm, soft glow.', 'calm']] });
  fork('thunder', 'rainbow', { key: 'after', q: 'The storm is over! What does Lumi do?', opts: [
    ['Look out of the window', '👀', 'Lumi looks at the wet, shiny street.', 'Tap to look.', 'tap', 'Everything is washed clean.'],
    ['Splash in puddles', '💦', 'Lumi and Dad go out to splash in the puddles.', 'Tap to splash.', 'tap3', 'Splash, splash, splash!', 'excited'],
    ['A warm drink', '🫖', 'Dad makes a warm drink.', 'Drag the drink to Lumi.', 'give', 'Warm and cosy.', 'calm']] });

  fork('swim', 'pack', { key: 'snack', q: 'Swimming makes Lumi hungry. Which snack goes in the bag?', opts: [
    ['A banana', '🍌', 'Lumi packs a banana.', 'Drag the banana to Lumi.', 'give', 'Packed for later.'],
    ['Biscuits', '🍪', 'Lumi packs some biscuits.', 'Drag the biscuits to Lumi.', 'give', 'Packed for later.'],
    ['Milk', '🥛', 'Lumi packs a carton of milk.', 'Drag the milk to Lumi.', 'give', 'Packed for later.']] });
  fork('swim', 'dry', { key: 'warm', q: 'Lumi feels a little cold. How does Lumi get warm?', opts: [
    ['Put on a jacket', '🧥', 'Lumi puts on a warm jacket.', 'Drag the jacket to Lumi.', 'give', 'Snug and warm.'],
    ['A warm drink', '🫖', 'Lumi has a warm drink.', 'Drag the drink to Lumi.', 'give', 'Warm inside.', 'calm'],
    ['Jump up and down', '🏃', 'Lumi jumps up and down.', 'Tap to jump.', 'tap3', 'Warm again!', 'excited']] });

  fork('lost', 'toys', { key: 'toy', q: 'Which toy is Lumi looking at?', opts: [
    ['A teddy', '🧸', 'Lumi looks at a soft teddy in the window.', 'Tap to look closer.', 'tap', 'So fluffy…'],
    ['A game', '🎮', 'Lumi looks at a new game in the window.', 'Tap to look closer.', 'tap', 'So many buttons…'],
    ['A puzzle', '🧩', 'Lumi looks at a big puzzle in the window.', 'Tap to look closer.', 'tap', 'So many pieces…']] });
  fork('lost', 'found', { key: 'after', q: 'Lumi is with Dad again. What does Lumi do?', opts: [
    ['Hug Dad', '🥰', 'Lumi gives Dad a big hug.', 'Tap to hug.', 'tap', 'Safe again.'],
    ['Hold hands', '🤝', 'Lumi holds Dad\'s hand.', 'Tap to hold hands.', 'tap', 'Together again.'],
    ['Say how it felt', '💬', 'Lumi tells Dad: "I felt scared."', 'Tap to tell Dad.', 'tap', 'Dad says: "You did the right thing."', 'calm']] });

  // ---------------------------------------------------------------- "You did it!": the story the child made
  const forksOf = (s) => s.steps.filter((p) => p.fork);
  const waysOf = (s) => {
    const fs = forksOf(s);
    return { got: fs.reduce((n, f) => n + found(s.id, f.fork).length, 0), all: fs.reduce((n, f) => n + f.forkOpts.length, 0) };
  };
  A.storyEndExtra = (s, st) => {
    const fs = forksOf(s);
    if (!fs.length) return '';
    const picked = fs.map((f) => f.forkOpts[(st.data.paths || {})[f.fork]]).filter(Boolean);
    const w = waysOf(s);
    return `<div class="sp-recap" role="group" aria-label="Your story this time">
      <span class="sp-recap-h">Your story this time</span>
      <div class="row gap12">${picked.map((o) => `<span class="sp-chip"><span class="sp-art">${o.art}</span><b>${esc(o.label)}</b></span>`).join('')}</div>
      <span class="sp-ways" aria-label="${w.got} of ${w.all} ways found">${Array.from({ length: w.all }, (_, i) => ic(i < w.got ? 'star' : 'starGrey', 24)).join('')}<b>${w.got === w.all ? 'You found every way!' : `${w.got} of ${w.all} ways found. Play again and choose something new!`}</b></span>
    </div>`;
  };
  A.storyWaysTag = (s) => {
    const w = waysOf(s);
    return w.all && w.got ? `<span class="tag amber">${ic('star', 14)}<span>${w.got}/${w.all}</span></span>` : '';
  };
  // playing again keeps nothing from last time: the child chooses afresh
})();
