/*
  agepacks.js
  Age packs: one Lumi, three versions. Choosing an age group loads a pack that sets the look,
  the words Lumi uses, the timetable, the activities and how routine steps work.
  Age (look, tone, topics) is kept separate from ability (difficulty): grown-ups can still mix
  and match, e.g. the Teens look with Easy difficulty.

    Little ones (3-6): big and playful, Lumi is a cuddly friend, kindergarten routines, toilet training.
    Primary (7-12):    Lumi is a buddy, the school day, the bus, canteen and money skills.
    Teens (13-18):     calm and respectful, Lumi is a small helper, independence: MRT, chores,
                       cooking, the hawker centre, work training. Routine steps are task checklists.
*/
(function () {
  'use strict';
  const D = window.DATA;

  // ---------------------------------------------------------------- new routine steps
  Object.assign(D.STEPS, {
    potty: { label: 'Toilet', icon: 'toilet', voice: 'Toilet time. Then wash your hands.', tint: '#DCEEF7' },
    nap: { label: 'Nap', icon: 'sNap', voice: 'Quiet time. Let’s rest.', tint: '#F1ECFB' },
    shower: { label: 'Shower', icon: 'sShower', voice: 'Time for a shower.', tint: '#DCEEF7' },
    laundry: { label: 'Laundry', icon: 'sWasher', voice: 'Time to do the laundry.', tint: '#E6F0FB' },
    chores: { label: 'Tidy my room', icon: 'sTidy', voice: 'Time to tidy up.', tint: '#E7F3E1' },
    cook: { label: 'Help make dinner', icon: 'sPot', voice: 'Let’s cook together.', tint: '#FDECC8' },
    hawker: { label: 'Hawker centre', icon: 'sNoodles', voice: 'Lunch at the hawker centre.', tint: '#FDECC8' },
    prepare: { label: 'Pack for tomorrow', icon: 'bag', voice: 'Get ready for tomorrow.', tint: '#F6E7D3' },
    work: { label: 'Work training', icon: 'sWork', voice: 'Time for work training.', tint: '#E6F0FB' }
  });
  Object.assign(D.CHECK_ITEMS, {
    phone: { label: 'Phone', kind: 'bring', icon: 'tablet', voice: 'Bring your phone.' },
    keys: { label: 'House keys', kind: 'bring', icon: 'lock', voice: 'Bring your house keys.' },
    wallet: { label: 'Card or money', kind: 'bring', icon: 'buscard', voice: 'Bring your card or money.' },
    charger: { label: 'Charge phone', kind: 'do', icon: 'tablet', voice: 'Charge your phone.' }
  });

  // ---------------------------------------------------------------- talk words for going out (Teens, or Challenge)
  D.WORD_FOLDERS.splice(3, 0, { id: 'out', name: 'Out and about', icon: 'pin', minAge: 'teen' });
  D.WORDS.out = [
    { id: 'o-excuse', label: 'Excuse me', t: 'social', icon: 'hand' },
    { id: 'o-repeat', label: 'Can you say that again?', t: 'q', icon: 'what' },
    { id: 'o-slow', label: 'Please speak slowly', t: 'social', icon: 'chat' },
    { id: 'o-wait', label: 'Please wait, I’m typing', t: 'social', icon: 'hourglass' },
    { id: 'o-nonverbal', label: 'I use this app to talk', t: 'social', icon: 'tablet' },
    { id: 'o-understand', label: 'I don’t understand', t: 'neg', icon: 'help' },
    { id: 'o-howmuch', label: 'How much is it?', t: 'q', icon: 'buscard' },
    { id: 'o-card', label: 'Can I pay by card?', t: 'q', icon: 'buscard' },
    { id: 'o-toilet', label: 'Where is the toilet?', t: 'q', icon: 'toilet' },
    { id: 'o-lost', label: 'I am lost. Please help me.', t: 'misc', icon: 'pin' },
    { id: 'o-call', label: 'Please call my family', t: 'misc', icon: 'person' },
    { id: 'o-overwhelmed', label: 'I feel overwhelmed', t: 'misc', icon: 'heart' },
    { id: 'o-quiet', label: 'I need somewhere quiet', t: 'misc', icon: 'quiet' },
    { id: 'o-thanks', label: 'Thank you', t: 'social', icon: 'thumb' }
  ];

  // ---------------------------------------------------------------- tutorials for each age
  D.LEARN.forEach((t) => { if (t.id === 'pack') t.ages = ['primary', 'teen']; });
  D.LEARN.push(
    { id: 'toilet', name: 'Use the toilet', icon: 'toilet', tint: '#DCEEF7', ages: ['little'], steps: [
      { say: 'Lift the lid. Pull your pants down.', act: 'real', icon: 'toilet', anim: 'cheer' },
      { say: 'Sit on the toilet. Take your time.', act: 'real', icon: 'toilet', anim: 'cheer' },
      { say: 'Wipe with toilet paper.', act: 'pick', want: '🧻', pick: ['🧸', '🧻', '🍌'], anim: 'cheer' },
      { say: 'Pull your pants up and flush.', act: 'real', icon: 'toilet', anim: 'cheer' },
      { say: 'Wash your hands with soap. Rub, rub, rub!', act: 'rub', prop: 'hands', anim: 'rub' },
      { say: 'All done! Well done.', act: 'done', prop: 'smile', anim: 'smile' }
    ] },
    { id: 'canteen', name: 'Buy food at the canteen', icon: 'cutlery', tint: '#FDECC8', ages: ['primary'], steps: [
      { say: 'Join the queue and wait for your turn.', act: 'real', icon: 'person', anim: 'cheer' },
      { say: 'Choose what you want to eat.', act: 'pick', want: '🍜', pick: ['⚽', '🍜', '🧸'], anim: 'cheer' },
      { say: 'Pay with your card or coins.', act: 'pick', want: '🪙', pick: ['🪙', '🧦', '🎈'], anim: 'cheer' },
      { say: 'Wait for your change. Say thank you.', act: 'real', icon: 'thumb', anim: 'cheer', min: 2 },
      { say: 'Carry your bowl carefully and find a seat.', act: 'pick', want: '🪑', pick: ['🚗', '🌳', '🪑'], anim: 'cheer' },
      { say: 'Enjoy your lunch!', act: 'done', prop: 'smile', anim: 'smile' }
    ] },
    { id: 'laundry', name: 'Do the laundry', icon: 'shirt', tint: '#E6F0FB', ages: ['teen'], steps: [
      { say: 'Sort the clothes: light colours and dark colours.', act: 'real', icon: 'shirt', anim: 'cheer' },
      { say: 'Put one pile in the washing machine.', act: 'real', icon: 'shirt', anim: 'cheer' },
      { say: 'Add one cap of detergent.', act: 'pick', want: '🧴', pick: ['🥛', '🧴', '🧃'], anim: 'cheer' },
      { say: 'Choose the normal wash and press start.', act: 'real', icon: 'play', anim: 'cheer' },
      { say: 'When it beeps, hang the clothes to dry.', act: 'pick', want: '🧺', pick: ['🎒', '📦', '🧺'], anim: 'cheer' },
      { say: 'Laundry done. Nice work.', act: 'done', prop: 'smile', anim: 'smile' }
    ] },
    { id: 'sandwich', name: 'Make a sandwich', icon: 'snack', tint: '#FDECC8', ages: ['teen'], steps: [
      { say: 'Wash your hands first.', act: 'rub', prop: 'hands', anim: 'rub' },
      { say: 'Take two slices of bread.', act: 'pick', want: '🍞', pick: ['🍪', '🍞', '🥤'], anim: 'cheer' },
      { say: 'Add a filling, like egg or cheese.', act: 'pick', want: '🧀', pick: ['🧽', '🧦', '🧀'], anim: 'cheer' },
      { say: 'Put the bread together. Cut it in half carefully.', act: 'real', icon: 'cutlery', anim: 'cheer' },
      { say: 'Clean up: wipe the table and wash the knife.', act: 'real', icon: 'drop', anim: 'cheer' },
      { say: 'Your sandwich is ready. Enjoy!', act: 'done', prop: 'smile', anim: 'smile' }
    ] },
    { id: 'hawker', name: 'Order at the hawker centre', icon: 'bowl', tint: '#FDECC8', ages: ['teen'], story: 'hawkerstory', steps: [
      { say: 'Find a seat first. You can chope it with a tissue packet.', act: 'pick', want: 'tissuepack', pick: ['👟', 'tissuepack', '📚'], anim: 'cheer' },
      { say: 'Choose a stall and join the queue.', act: 'real', icon: 'person', anim: 'cheer' },
      { say: 'Order your food. You can point, or show your talk app.', act: 'real', icon: 'chat', anim: 'cheer' },
      { say: 'Pay by card or cash. Wait for your change.', act: 'pick', want: '💳', pick: ['🎟️', '🔑', '💳'], anim: 'cheer' },
      { say: 'Say thank you. Carry the tray carefully to your seat.', act: 'real', icon: 'thumb', anim: 'cheer' },
      { say: 'Enjoy your meal!', act: 'done', prop: 'smile', anim: 'smile' }
    ] }
  );

  // ---------------------------------------------------------------- stories for each age
  D.STORIES.forEach((s) => { if (s.id === 'teacher') s.ages = ['little', 'primary']; if (s.id === 'party') s.ages = ['little', 'primary']; });
  D.STORIES.push(
    { id: 'polyclinic', title: 'A visit to the polyclinic', e: '🩺', tint: '#E6F0F7', pages: [
      { scene: 'home', lumi: 'sad', props: ['🤧'], text: 'Lumi has a cough. Today Lumi and Mum will go to the polyclinic.' },
      { scene: 'clinic', lumi: 'calm', props: ['🎫'], text: 'First, Mum gets a queue number. Lumi’s number is 1024.', tap: { e: '🎫', label: 'Tap to get the number', say: 'Your number is one, zero, two, four.' } },
      { scene: 'clinic', lumi: 'worried', text: 'Lumi waits and watches the screen. There are lots of people. It can feel long.',
        ask: { q: 'What can Lumi do while waiting?', options: [
          { e: '🎧', label: 'Listen to music', reply: 'Music makes the wait feel shorter.' },
          { e: '📱', label: 'Play a quiet game', reply: 'A game helps the time go faster.' },
          { e: '🔢', label: 'Watch for my number', reply: 'Lumi watches the screen. Almost there!' }] } },
      { scene: 'clinic', lumi: 'excited', props: ['🔔'], text: 'Ding! 1024 is on the screen. It’s Lumi’s turn. Lumi walks to the room.' },
      { scene: 'dentist', lumi: 'calm', cast: ['🧑‍⚕️'], text: 'The doctor says hello. She listens to Lumi’s chest. It feels cold!', tap: { e: '🩺', label: 'Tap to listen', say: 'Thump, thump!' } },
      { scene: 'dentist', lumi: 'worried', cast: ['🧑‍⚕️'], text: 'The doctor looks in Lumi’s mouth with a little light. Say aaah!',
        ask: { q: 'Lumi feels nervous. What could help?', options: [
          { e: '✊', label: 'Squeeze Mum’s hand', reply: 'Squeeze, squeeze. Lumi feels braver.' },
          { e: '🌬️', label: 'Big breaths', reply: 'In… and out. Lumi feels calmer.' },
          { e: '✋', label: 'Say "Wait, please"', reply: 'The doctor waits. Lumi is ready now.' }] } },
      { scene: 'clinic', lumi: 'happy', props: ['💊'], text: 'Last, Lumi collects the medicine at the pharmacy counter.' },
      { scene: 'home', lumi: 'happy', props: ['🛏️'], text: 'At home, Lumi takes medicine with Mum and rests. Soon Lumi feels better.' }
    ] },
    { id: 'hawkerstory', title: 'Lunch at the hawker centre', e: '🍜', tint: '#FDECC8', pages: [
      { scene: 'hawker', lumi: 'happy', text: 'Today Lumi is having lunch at the hawker centre. There are so many stalls!' },
      { scene: 'hawker', lumi: 'worried', props: ['🔊'], text: 'It is busy and noisy. Plates clink and people talk loudly.',
        ask: { q: 'It is noisy. What could help Lumi?', options: [
          { e: '🎧', label: 'Wear headphones', reply: 'Headphones make it quieter.' },
          { e: '🪑', label: 'Find a quiet corner', reply: 'The corner table is calmer.' },
          { e: '🌬️', label: 'Slow breaths', reply: 'In… and out. Lumi feels okay.' }] } },
      { scene: 'hawker', lumi: 'calm', props: ['tissuepack'], text: 'First, find a seat. Lumi chopes a table with a tissue packet.', tap: { e: 'tissuepack', label: 'Put the tissue packet down', say: 'Chope! This seat is ours.' } },
      { scene: 'hawker', lumi: 'happy', props: ['🍜'], text: 'Lumi joins the queue at the noodle stall and waits for a turn.' },
      { scene: 'hawker', lumi: 'worried', props: ['🙅'], text: 'Oh no. The noodles are sold out today!',
        ask: { q: 'The noodles are sold out. What can Lumi do?', options: [
          { e: '🍚', label: 'Choose chicken rice', reply: 'Chicken rice is yummy too. Good choice!' },
          { e: '🔁', label: 'Try another stall', reply: 'There are lots of other stalls. Lumi finds one.' },
          { e: '🗣️', label: 'Ask what else they have', reply: 'The uncle says: "Fishball soup also can!"' }] } },
      { scene: 'hawker', lumi: 'happy', props: ['💳'], text: 'Lumi pays with a card and says thank you. Lumi carries the tray carefully.' },
      { scene: 'hawker', lumi: 'excited', props: ['♻️'], text: 'After eating, Lumi returns the tray to the tray return. Well done, Lumi!', tap: { e: '🍽️', label: 'Return the tray', say: 'All clean. Thank you!' } }
    ] },
    { id: 'firedrill', title: 'Fire drill at school', e: '🔔', tint: '#FBE3E8', ages: ['little', 'primary', 'teen'], pages: [
      { scene: 'classroom', lumi: 'happy', text: 'Lumi is in class. The teacher says: "Today we will have a fire drill. It is practice. Everyone is safe."' },
      { scene: 'classroom', lumi: 'scared', props: ['🔔', '🔊'], text: 'The alarm rings. It is very loud!',
        ask: { q: 'The alarm is loud. What can Lumi do?', options: [
          { e: '🙉', label: 'Cover my ears', reply: 'Covering ears is okay. Lumi still walks out.' },
          { e: '🎧', label: 'Put on headphones', reply: 'Headphones make the alarm quieter.' },
          { e: '🤝', label: 'Hold the teacher’s hand', reply: 'The teacher stays with Lumi.' }] } },
      { scene: 'classroom', lumi: 'calm', cast: ['🧑‍🏫'], text: 'Everyone stops what they are doing. Leave the bag. Line up at the door.' },
      { scene: 'field', lumi: 'calm', props: ['🚶'], text: 'Walk, do not run. Lumi follows the line down the stairs and out to the field.', tap: { e: '🚶', label: 'Walk with the class', say: 'Step, step, step.' } },
      { scene: 'field', lumi: 'happy', cast: ['🧑‍🏫'], text: 'At the field, the class sits in a line. The teacher counts everyone: one, two, three…' },
      { scene: 'field', lumi: 'excited', props: ['✅'], text: 'All clear! The drill is over. Lumi did it, even with the loud alarm.' },
      { scene: 'classroom', lumi: 'happy', text: 'Back in class, Lumi has a drink of water and a rest. Practising helps Lumi know what to do.' }
    ] },
    { id: 'mrt', title: 'Taking the MRT', e: '🚇', tint: '#DCEFED', ages: ['primary', 'teen'], pages: [
      { scene: 'home', lumi: 'happy', props: ['💳', '📱', '🎒'], text: 'Today Lumi is taking the MRT. Lumi checks: card, phone, bag.' },
      { scene: 'mrt', lumi: 'calm', text: 'At the station, Lumi taps the card at the gantry. The gate opens.', tap: { e: '💳', label: 'Tap the card', say: 'Beep!' } },
      { scene: 'mrt', lumi: 'worried', props: ['🔊'], text: 'The platform is busy and loud. Lumi waits behind the yellow line.',
        ask: { q: 'It is busy and loud. What could help?', options: [
          { e: '🎧', label: 'Wear headphones', reply: 'Headphones make it quieter.' },
          { e: '🌬️', label: 'Slow breaths', reply: 'In… and out. Lumi feels calmer.' },
          { e: '🧍', label: 'Stand near the wall', reply: 'There is more space here. Good idea.' }] } },
      { scene: 'mrt', lumi: 'happy', text: 'The train comes. Lumi lets people get off first, then gets on and holds the pole.' },
      { scene: 'mrt', lumi: 'worried', props: ['⏱️'], text: 'The train stops for a while. The driver says there is a short delay.',
        ask: { q: 'What can Lumi do?', options: [
          { e: '📱', label: 'Text my family', reply: '"My train is delayed. I am okay." Good thinking.' },
          { e: '🎵', label: 'Listen to music', reply: 'Music helps the wait feel shorter.' },
          { e: '👂', label: 'Listen for the announcement', reply: 'The driver says the train will move soon.' }] } },
      { scene: 'mrt', lumi: 'excited', text: 'The train moves again. Lumi gets off at the right station.' },
      { scene: 'classroom', lumi: 'excited', props: ['⭐'], text: 'Lumi made the trip! Every trip makes it a little easier.' }
    ] },
    { id: 'work', title: 'Asking for help at work', e: '🧑‍🍳', tint: '#FDECC8', ages: ['teen'], pages: [
      { scene: 'work', lumi: 'happy', text: 'Lumi is doing work training at a café. Today Lumi folds napkins and wipes tables.' },
      { scene: 'work', lumi: 'worried', cast: ['🧑‍🍳'], props: ['🫙'], text: 'The supervisor gives Lumi a new job: fill the sugar jars. Lumi is not sure how.',
        ask: { q: 'Lumi is not sure. What can Lumi do?', options: [
          { e: '🙋', label: 'Ask "Can you show me?"', reply: 'Asking is the smart thing to do.' },
          { e: '👀', label: 'Watch someone first', reply: 'Watching first is a good way to learn.' },
          { e: '📝', label: 'Look at my task card', reply: 'The task card shows each step.' }] } },
      { scene: 'work', lumi: 'calm', cast: ['🧑‍🍳'], text: 'The supervisor shows Lumi. Fill the jar, wipe it, close the lid.' },
      { scene: 'work', lumi: 'worried', cast: ['🧑'], text: 'A customer asks Lumi a question. Lumi does not understand.',
        ask: { q: 'What could Lumi do?', options: [
          { e: '🔁', label: '"Can you say it again?"', reply: 'The customer says it again, more slowly.' },
          { e: '🧑‍🍳', label: 'Get my supervisor', reply: 'The supervisor helps. That is part of the job.' },
          { e: '📱', label: 'Show my talk app', reply: 'Lumi taps "Please wait, I’m typing". The customer waits.' }] } },
      { scene: 'work', lumi: 'excited', cast: ['🧑‍🍳'], text: 'At the end, the supervisor says: "Great work today, Lumi!"', tap: { e: '👍', label: 'Thumbs up', say: 'Great work!' } },
      { scene: 'home', lumi: 'happy', text: 'Asking for help is not a problem. It is a skill, at work and everywhere.' }
    ] }
  );

  // ---------------------------------------------------------------- Teens: routine steps as task checklists
  D.TASKS = {
    wake: { list: ['Turn off the alarm', 'Sit up and stretch', 'Open the curtains', 'Drink some water'] },
    shower: { list: ['Water warm, not too hot', 'Shampoo, then rinse', 'Soap your body', 'Rinse and dry off', 'Put on deodorant'], timer: 600 },
    bath: { list: ['Water warm, not too hot', 'Wash your hair and body', 'Rinse and dry off', 'Put on pyjamas'], timer: 600 },
    dressed: { list: ['Clean underwear', 'Uniform or clothes for today', 'Socks', 'Check in the mirror'] },
    teeth: { list: ['Pea-sized toothpaste', 'Brush for 2 minutes', 'Spit and rinse', 'Put the brush away'], timer: 120 },
    breakfast: { list: ['Sit at the table', 'Eat slowly', 'Put the plate in the sink', 'Wipe your mouth'] },
    train: { list: ['Tap your card at the gantry', 'Check the train direction', 'Stand behind the yellow line', 'Let people off first', 'Find a seat or hold on'] },
    school: { list: ['Say hello to your teacher', 'Check today’s timetable', 'Put your bag away'] },
    work: { list: ['Arrive on time and sign in', 'Check my task card', 'Ask if I am not sure', 'Tidy up before I leave'] },
    lunch: { list: ['Wash your hands', 'Get your food', 'Eat and drink', 'Clear your tray'] },
    homework: { list: ['Clear the desk', 'Check what is due', 'Work for 20 minutes', 'Take a short break'], timer: 1200 },
    laundry: { list: ['Sort lights and darks', 'Clothes into the machine', 'Add detergent', 'Press start', 'Hang clothes to dry'] },
    chores: { list: ['Make the bed', 'Put clothes away', 'Throw out rubbish', 'Tidy the desk'] },
    cook: { list: ['Wash your hands', 'Get the ingredients', 'Follow the steps', 'Ask for help with hot things', 'Clean up'] },
    hawker: { list: ['Chope a seat with a tissue packet', 'Choose a stall', 'Queue and order', 'Pay by card or cash', 'Say thank you'] },
    dinner: { list: ['Help set the table', 'Eat together', 'Clear your plate'] },
    prepare: { list: ['Check tomorrow’s timetable', 'Pack your bag', 'Charge your phone', 'Lay out your clothes'] },
    screen: { list: ['Set a timer', 'Choose what to do', 'Stop when the timer rings'], timer: 1800 },
    play: { list: ['Choose an activity', 'Have fun', 'Put things away'] },
    park: { list: ['Water and sunscreen', 'Stay with your group', 'Head home on time'] },
    bedtime: { list: ['Phone on charge, away from the bed', 'Brush teeth', 'Lights off', 'Slow breaths'] }
  };

  // ---------------------------------------------------------------- how Lumi talks to each age
  D.TONE = {
    little: { praise: ['Yay! You did it!', 'Hooray! Well done!', 'Wow! Great job!'], hello: 'I’m Lumi. Tap Go!' },
    primary: { praise: ['Well done!', 'Great job!', 'You did it!'], hello: 'I’m Lumi. Tap Go to start.' },
    teen: { praise: ['Done. Nice work.', 'Good job.', 'That’s done. Well done.'], hello: 'Here’s your day. Tap Go when you’re ready.' }
  };

  // ---------------------------------------------------------------- the packs
  const SCHOOL_LITTLE = [
    { id: 'wake', time: '07:00' }, { id: 'potty', time: '07:10' }, { id: 'dressed', time: '07:20' }, { id: 'breakfast', time: '07:35' },
    { id: 'teeth', time: '07:55' }, { id: 'school', time: '08:30', label: 'Kindergarten', check: ['bag', 'bottle'] }, { id: 'lunch', time: '12:00' },
    { id: 'nap', time: '13:00' }, { id: 'play', time: '15:30' }, { id: 'bath', time: '18:00', check: ['towel', 'pyjamas'] },
    { id: 'dinner', time: '18:30' }, { id: 'reading', time: '19:15' }, { id: 'bedtime', time: '19:45' }
  ];
  const WEEKEND_LITTLE = [
    { id: 'wake', time: '07:30' }, { id: 'potty', time: '07:40' }, { id: 'breakfast', time: '08:00' }, { id: 'teeth', time: '08:30' },
    { id: 'park', time: '10:00', surprise: 'sometimes', changes: ['rain'], check: ['toilet', 'shoes', 'bottle', 'cap2'] }, { id: 'lunch', time: '12:00' },
    { id: 'nap', time: '13:00' }, { id: 'play', time: '15:30' }, { id: 'bath', time: '18:00' }, { id: 'dinner', time: '18:30' }, { id: 'bedtime', time: '19:45' }
  ];
  const SCHOOL_TEEN = [
    { id: 'wake', time: '06:30' }, { id: 'shower', time: '06:40' }, { id: 'dressed', time: '06:55' }, { id: 'breakfast', time: '07:05' },
    { id: 'teeth', time: '07:20' }, { id: 'train', time: '07:35', label: 'Travel to school', check: ['wallet', 'phone', 'keys', 'bag'] },
    { id: 'school', time: '08:00' }, { id: 'lunch', time: '12:30' }, { id: 'bus', time: '15:00', label: 'Bus home' },
    { id: 'laundry', time: '16:00' }, { id: 'homework', time: '16:45', label: 'Homework or free time' }, { id: 'dinner', time: '18:30' },
    { id: 'prepare', time: '20:30', check: ['folder', 'pencilcase', 'charger'] }, { id: 'bedtime', time: '22:00' }
  ];
  const WEEKEND_TEEN = [
    { id: 'wake', time: '08:30' }, { id: 'shower', time: '08:45' }, { id: 'breakfast', time: '09:15' }, { id: 'chores', time: '10:00' },
    { id: 'hawker', time: '12:00', label: 'Lunch at the hawker centre', check: ['wallet', 'phone', 'tissue'] }, { id: 'screen', time: '14:00', label: 'Free time' },
    { id: 'cook', time: '17:30' }, { id: 'dinner', time: '18:30' }, { id: 'bedtime', time: '22:00' }
  ];
  const tutsFor = (age) => {
    const o = {};
    D.LEARN.forEach((t) => { o[t.id] = !t.ages || t.ages.includes(age); });
    if (age === 'teen') { o.dress = false; o.pack = true; }
    return o;
  };
  D.AGE_PACKS = {
    little: {
      art: 'soft', theme: 'cream', level: 1, routineMode: 'play', voiceId: 'lumi', voiceRate: 0.8, guideDelay: 3, lumiSize: 360,
      week: SCHOOL_LITTLE, weekend: WEEKEND_LITTLE,
      show: { day: true, talk: true, calm: true, play: true, learn: true, stories: true, pet: true, me: true, room: true },
      games: { bubbles: true, match: true, jigsaw: true, sort: false, pattern: false },
      tutorials: () => tutsFor('little'),
      summary: ['Soft and round look, bigger buttons, Easy', 'Kindergarten day with toilet, nap and bath', 'Hands-on routine games with Lumi', 'Bubbles, matching and jigsaws', 'Toilet, teeth, hands and dressing tutorials', 'Stars, stickers and the pet']
    },
    primary: {
      art: 'soft', theme: 'meadow', level: 2, routineMode: 'play', voiceId: 'lumi', voiceRate: 0.85, guideDelay: 6, lumiSize: 350,
      week: D.SCHOOL_DAY, weekend: D.WEEKEND_DAY,
      show: { day: true, talk: true, calm: true, play: true, learn: true, stories: true, pet: true, me: true, room: true },
      games: { bubbles: true, match: true, jigsaw: true, sort: true, pattern: true },
      tutorials: () => tutsFor('primary'),
      summary: ['Fresh meadow colours, Medium', 'School day with the bus and a Before you go checklist', 'Hands-on routine games and live bus times', 'All five games', 'Canteen, bag packing, teeth, hands and dressing tutorials', 'Streaks, badges, pet and room']
    },
    teen: {
      art: 'soft', theme: 'stone', level: 3, routineMode: 'tasks', voiceId: 'grown', voiceRate: 0.95, guideDelay: 10, lumiSize: 240,
      week: SCHOOL_TEEN, weekend: WEEKEND_TEEN,
      show: { day: true, talk: true, calm: true, play: true, learn: true, stories: true, pet: false, me: false, room: false },
      games: { bubbles: true, match: true, jigsaw: true, sort: true, pattern: true },
      tutorials: () => tutsFor('teen'),
      summary: ['Calm, low-colour look, plain words, Challenge', 'Shower, MRT, laundry, homework, packing for tomorrow', 'Routine steps as task checklists with timers', 'Talk board with Out and about phrases and a keyboard', 'Laundry, sandwich, hawker centre and bag tutorials', 'Progress instead of cartoon rewards; pet and dress up hidden']
    }
  };
})();
