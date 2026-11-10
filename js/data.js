/*
  data.js
  Everything the game "knows": routine steps, plan changes, feelings, talk-board symbols,
  shop items, prizes and room items. Edit this file to add or change content.
*/
window.DATA = {
  // Steps a grown-up can put in the day. voice = what Lumi says out loud.
  STEPS: {
    wake: { label: 'Wake up', icon: 'sSun', voice: 'Good morning! Time to wake up.', tint: '#FFF1C2' },
    dressed: { label: 'Get dressed', icon: 'sShirt', voice: "Let's get dressed.", tint: '#DCEEF7' },
    teeth: { label: 'Teeth', icon: 'teeth', voice: 'Brush, brush, brush your teeth.', tint: '#DCEFED' },
    breakfast: { label: 'Breakfast', icon: 'cutlery', voice: 'Yummy. Breakfast time.', tint: '#FFF1C2' },
    bus: { label: 'Bus', icon: 'bus', voice: 'Time to take the bus.', tint: '#FDECC8' },
    school: { label: 'School', icon: 'school', voice: "Let's go to school.", tint: '#F6E7D3' },
    lunch: { label: 'Lunch', icon: 'sRice', voice: 'Lunch time.', tint: '#FDECC8' },
    homework: { label: 'Homework', icon: 'sPencil', voice: 'Homework time.', tint: '#DCEEF7' },
    therapy: { label: 'Therapy', icon: 'sTherapy', voice: 'Time to see my therapist.', tint: '#F1ECFB' },
    train: { label: 'Train', icon: 'sTrain', voice: 'We are taking the train.', tint: '#DCEFED' },
    park: { label: 'Park', icon: 'sTree', voice: "Let's go to the park.", tint: '#E7F3E1' },
    play: { label: 'Play', icon: 'sBall', voice: 'Play time!', tint: '#E7F3E1' },
    screen: { label: 'Tablet time', icon: 'sTablet', voice: 'Tablet time.', tint: '#E6F0FB' },
    dinner: { label: 'Dinner', icon: 'sDinner', voice: 'Dinner time.', tint: '#FDECC8' },
    reading: { label: 'Reading', icon: 'sBook', voice: 'Story time.', tint: '#F1ECFB' },
    bath: { label: 'Bath', icon: 'sBath', voice: 'Splash! Bath time.', tint: '#DCEEF7' },
    bedtime: { label: 'Bedtime', icon: 'sMoon', voice: 'Time for bed.', tint: '#F1ECFB' },
    dentist: { label: 'Dentist', icon: 'sDentist', voice: 'Today we visit the dentist.', tint: '#FFFFFF' },
    haircut: { label: 'Haircut', icon: 'sScissors', voice: 'Today we get a haircut.', tint: '#FFFFFF' }
  },

  // Icons and colours grown-ups can pick when they make their own step.
  CUSTOM_ICONS: ['star', 'heart', 'house', 'school', 'bus', 'train', 'ball', 'tree', 'book', 'pencil', 'bowl', 'bath', 'moon', 'music', 'tablet', 'shop', 'calendar', 'chat'],
  CUSTOM_TINTS: ['#FFF1C2', '#DCEFED', '#DCEEF7', '#F1ECFB', '#E7F3E1', '#FDECC8', '#FBE3E8', '#FFFFFF'],

  // Parts of the day. The game plays one part at a time so sessions stay short.
  PARTS: [
    { id: 'morning', name: 'Morning', from: '00:00', to: '11:59' },
    { id: 'afternoon', name: 'Afternoon', from: '12:00', to: '17:59' },
    { id: 'evening', name: 'Evening', from: '18:00', to: '23:59' }
  ],

  DAYS: [
    { id: 'mon', short: 'Mon', name: 'Monday' },
    { id: 'tue', short: 'Tue', name: 'Tuesday' },
    { id: 'wed', short: 'Wed', name: 'Wednesday' },
    { id: 'thu', short: 'Thu', name: 'Thursday' },
    { id: 'fri', short: 'Fri', name: 'Friday' },
    { id: 'sat', short: 'Sat', name: 'Saturday' },
    { id: 'sun', short: 'Sun', name: 'Sunday' }
  ],

  // Example week. Grown-ups replace this with the child's real timetable in the plan builder.
  SCHOOL_DAY: [
    { id: 'wake', time: '06:45' },
    { id: 'dressed', time: '07:00' },
    { id: 'teeth', time: '07:10' },
    { id: 'breakfast', time: '07:20' },
    { id: 'bus', time: '07:45', surprise: 'often', changes: ['late', 'rain'], check: ['toilet', 'shoes', 'bag', 'bottle', 'buscard'] },
    { id: 'school', time: '08:15', check: ['folder', 'pencilcase', 'lunchbox'] },
    { id: 'lunch', time: '12:30' },
    { id: 'bus', time: '15:30', label: 'Bus home' },
    { id: 'homework', time: '16:30' },
    { id: 'play', time: '17:00' },
    { id: 'dinner', time: '18:30' },
    { id: 'bath', time: '19:30', check: ['towel', 'pyjamas'] },
    { id: 'reading', time: '20:00' },
    { id: 'bedtime', time: '20:30' }
  ],
  WEEKEND_DAY: [
    { id: 'wake', time: '08:00' },
    { id: 'breakfast', time: '08:30' },
    { id: 'teeth', time: '09:00' },
    { id: 'park', time: '10:00', surprise: 'sometimes', changes: ['rain'], check: ['toilet', 'shoes', 'bottle', 'cap2'] },
    { id: 'lunch', time: '12:30' },
    { id: 'play', time: '14:00' },
    { id: 'screen', time: '16:00' },
    { id: 'dinner', time: '18:30' },
    { id: 'bath', time: '19:30' },
    { id: 'bedtime', time: '20:30' }
  ],

  // Surprise changes. feeling = how Lumi feels about it. reply = what a helper says back.
  CHANGES: {
    late: { label: 'Bus is late', icon: 'clock', voice: 'Oh no. The bus is late.', feeling: 'worried', reply: 'The bus is coming in five minutes.' },
    rain: { label: "It's raining", icon: 'rain', voice: "Oh no. It's raining.", feeling: 'sad', reply: "Let's put on a raincoat. Then we can go." },
    different: { label: 'Different bus', icon: 'busPurple', voice: 'A different bus is coming today.', feeling: 'scared', reply: 'This bus goes to school too. You are safe.' }
  },

  FEELINGS: {
    happy: { label: 'Happy', tint: '#FFF6D6', stroke: '#E0B83A' },
    sad: { label: 'Sad', tint: '#E6F0FB', stroke: '#5E8FC4' },
    angry: { label: 'Angry', tint: '#FCE6E2', stroke: '#D9644F' },
    worried: { label: 'Worried', tint: '#F1ECFB', stroke: '#7E64C8' },
    scared: { label: 'Scared', tint: '#E3F4F0', stroke: '#4E9E8E' }
  },

  // Talk-board categories always keep the same colours.
  CATS: {
    n: { name: 'Needs', tint: '#E3F2F0', stroke: '#2F7E79', ink: '#2F7E79' },
    f: { name: 'Feelings', tint: '#F1ECFB', stroke: '#7E64C8', ink: '#5B45A8' },
    q: { name: 'Questions', tint: '#FFF3D9', stroke: '#C98A1E', ink: '#9A6A10' },
    s: { name: 'Social', tint: '#E7F3E1', stroke: '#4F8A3F', ink: '#3C6E30' }
  },

  // Core words stay in the same place so children can build motor memory.
  SYMBOLS: [
    { id: 'help', label: 'Help', cat: 'n', icon: 'help' },
    { id: 'stop', label: 'Stop', cat: 'n', icon: 'stop' },
    { id: 'more', label: 'More', cat: 'n', icon: 'wMore' },
    { id: 'break', label: 'Break', cat: 'n', icon: 'kBreak' },
    { id: 'finished', label: 'Finished', cat: 'n', icon: 'wDone' },
    { id: 'wait', label: 'Wait', cat: 'n', icon: 'hourglass' },
    { id: 'ifeel', label: 'I feel', cat: 'f', icon: 'heart' },
    { id: 'happy', label: 'Happy', cat: 'f', face: 'happy' },
    { id: 'sad', label: 'Sad', cat: 'f', face: 'sad' },
    { id: 'angry', label: 'Angry', cat: 'f', face: 'angry' },
    { id: 'worried', label: 'Worried', cat: 'f', face: 'worried' },
    { id: 'scared', label: 'Scared', cat: 'f', face: 'scared' },
    { id: 'next', label: "What's next?", cat: 'q', icon: 'wNext' },
    { id: 'where', label: 'Where?', cat: 'q', icon: 'pin' },
    { id: 'when', label: 'When?', cat: 'q', icon: 'clock' },
    { id: 'yes', label: 'Yes', cat: 's', icon: 'yes' },
    { id: 'no', label: 'No', cat: 's', icon: 'no' },
    { id: 'thanks', label: 'Thank you', cat: 's', icon: 'smile' }
  ],

  // Free clothes everyone starts with, by slot.
  FREE: {
    head: ['none', 'cap', 'flowers', 'phones'],
    body: ['none', 'scarf', 'raincoat'],
    back: ['none', 'cape'],
    feet: ['none']
  },

  NAMES: {
    none: 'Nothing', cap: 'Cap', flowers: 'Flower crown', phones: 'Headphones', scarf: 'Scarf', raincoat: 'Raincoat',
    cape: 'Cape', shirt: 'My T-shirt', spots: 'Spots', stripes: 'Stripes',
    'spark-star': 'Star spark', 'spark-heart': 'Heart spark', 'spark-flower': 'Flower spark'
  },

  // Clothes in the shop. Cheap ones first, so a child can buy something on day one.
  WARDROBE: [
    { id: 'bow', slot: 'head', name: 'Bow', price: 3 },
    { id: 'partyhat', slot: 'head', name: 'Party hat', price: 4 },
    { id: 'boots', slot: 'feet', name: 'Rain boots', price: 4 },
    { id: 'buckethat', slot: 'head', name: 'Bucket hat', price: 5 },
    { id: 'backpack', slot: 'back', name: 'Backpack', price: 6 },
    { id: 'heartbag', slot: 'back', name: 'Heart bag', price: 7 },
    { id: 'wings', slot: 'back', name: 'Wings', price: 10 },
    { id: 'starcape', slot: 'back', name: 'Star cape', price: 18 },
    { id: 'starclips', slot: 'head', name: 'Star clips', price: 2 },
    { id: 'bowtie', slot: 'body', name: 'Bow tie', price: 3 },
    { id: 'slippers', slot: 'feet', name: 'Bunny slippers', price: 4 },
    { id: 'beads', slot: 'body', name: 'Bead necklace', price: 4 },
    { id: 'beanie', slot: 'head', name: 'Beanie', price: 5 },
    { id: 'sneakers', slot: 'feet', name: 'Sneakers', price: 5 },
    { id: 'balloon', slot: 'back', name: 'Balloon', price: 6 },
    { id: 'sunhat', slot: 'head', name: 'Sun hat', price: 6 },
    { id: 'bunnyears', slot: 'head', name: 'Bunny ears', price: 8 },
    { id: 'guitar', slot: 'back', name: 'Guitar', price: 12 },
    { id: 'crown', slot: 'head', name: 'Crown', price: 25 }
  ],

  // Prizes that can only be earned, never bought.
  BADGES: [
    { id: 'brave', name: 'Brave', icon: 'bus', stat: 'changesHandled', target: 5, color: '#E09A2E', reward: { id: 'bravescarf', slot: 'body', name: 'Brave scarf' } },
    { id: 'talker', name: 'Talker', icon: 'chat', stat: 'talkUses', target: 3, color: '#2F7E79', reward: { id: 'talkercap', slot: 'head', name: 'Talker cap' } },
    { id: 'calm', name: 'Calm', icon: 'cloud', stat: 'calmTried', target: 4, color: '#7E64C8', reward: { id: 'calmcrown', slot: 'head', name: 'Calm crown' } }
  ],

  // Room items. Positions are percentages of the room scene.
  ROOM: [
    { id: 'picture', tab: 'furniture', name: 'Picture', price: 2, pos: { left: 30, top: 8, w: 11 } },
    { id: 'lamp', tab: 'furniture', name: 'Lamp', price: 3, pos: { left: 72, top: 4, w: 10 } },
    { id: 'beanbag', tab: 'furniture', name: 'Beanbag', price: 4, pos: { left: 6, bottom: 3, w: 18 } },
    { id: 'bookshelf', tab: 'furniture', name: 'Bookshelf', price: 6, pos: { left: 85, top: 22, w: 13 } },
    { id: 'clock', tab: 'furniture', name: 'Clock', price: 2, pos: { left: 14, top: 6, w: 8 } },
    { id: 'teddy', tab: 'furniture', name: 'Teddy bear', price: 3, pos: { left: 56, bottom: 3, w: 9 } },
    { id: 'fairylights', tab: 'furniture', name: 'Fairy lights', price: 4, pos: { left: 2, top: 1, w: 26 } },
    { id: 'balloons', tab: 'furniture', name: 'Balloons', price: 4, pos: { left: 60, top: 18, w: 10 } },
    { id: 'toybox', tab: 'furniture', name: 'Toy box', price: 5, pos: { left: 44, bottom: 2, w: 12 } },
    { id: 'desk', tab: 'furniture', name: 'Desk', price: 7, pos: { left: 2, bottom: 30, w: 17 } },
    { id: 'bed', tab: 'furniture', name: 'Bed', price: 10, pos: { left: 72, bottom: 4, w: 24 } },
    { id: 'rainbow', tab: 'furniture', name: 'Rainbow light', price: 20, pos: { left: 46, top: 3, w: 18 } },
    { id: 'plant', tab: 'plants', name: 'Plant', price: 2, pos: { left: 86, bottom: 14, w: 11 } },
    { id: 'cactus', tab: 'plants', name: 'Cactus', price: 3, pos: { left: 24, bottom: 22, w: 7 } },
    { id: 'sunflower', tab: 'plants', name: 'Sunflower', price: 4, pos: { left: 2, bottom: 26, w: 9 } },
    { id: 'tulips', tab: 'plants', name: 'Tulips', price: 3, pos: { left: 36, bottom: 24, w: 8 } },
    { id: 'bonsai', tab: 'plants', name: 'Little tree', price: 5, pos: { left: 52, bottom: 24, w: 9 } },
    { id: 'tree', tab: 'plants', name: 'Big plant', price: 8, pos: { left: 90, bottom: 20, w: 10 } },
    { id: 'fishtank', tab: 'pets', name: 'Fish tank', price: 8, pos: { left: 68, bottom: 24, w: 13 } },
    { id: 'birdcage', tab: 'pets', name: 'Bird', price: 9, pos: { left: 40, top: 14, w: 10 } },
    { id: 'puppy', tab: 'pets', name: 'Puppy', price: 12, pos: { left: 66, bottom: 2, w: 11 } },
    { id: 'kitten', tab: 'pets', name: 'Kitten', price: 12, pos: { left: 25, bottom: 2, w: 9 } }
  ],

  CALM_NOTES: [392, 440, 523, 587, 659], // a gentle pentatonic scale for the music bells

  // ---------------------------------------------------------------- Before-you-go checklist things
  // kind: 'do' = something to do, 'bring' = something to take along.
  CHECK_ITEMS: {
    toilet: { label: 'Toilet', kind: 'do', icon: 'toilet', voice: 'Go to the toilet.' },
    washhands: { label: 'Wash hands', kind: 'do', icon: 'washhands', voice: 'Wash your hands.' },
    shoes: { label: 'Shoes', kind: 'do', icon: 'shoes', voice: 'Put on your shoes.' },
    jacket: { label: 'Jacket', kind: 'do', icon: 'jacket', voice: 'Put on your jacket.' },
    bag: { label: 'Bag', kind: 'bring', icon: 'bag', voice: 'Take your bag.' },
    bottle: { label: 'Water bottle', kind: 'bring', icon: 'bottle', voice: 'Take your water bottle.' },
    lunchbox: { label: 'Lunch box', kind: 'bring', icon: 'lunchbox', voice: 'Take your lunch box.' },
    buscard: { label: 'Bus card', kind: 'bring', icon: 'buscard', voice: 'Take your bus card.' },
    folder: { label: 'Homework', kind: 'bring', icon: 'folder', voice: 'Take your homework.' },
    pencilcase: { label: 'Pencil case', kind: 'bring', icon: 'pencilcase', voice: 'Take your pencil case.' },
    umbrella: { label: 'Umbrella', kind: 'bring', icon: 'umbrella', voice: 'Take an umbrella.' },
    cap2: { label: 'Hat', kind: 'bring', icon: 'cap2', voice: 'Take your hat.' },
    tissue: { label: 'Tissues', kind: 'bring', icon: 'tissue', voice: 'Take some tissues.' },
    towel: { label: 'Towel', kind: 'bring', icon: 'towel', voice: 'Get your towel.' },
    pyjamas: { label: 'Pyjamas', kind: 'bring', icon: 'pyjamas', voice: 'Get your pyjamas.' },
    medicine: { label: 'Medicine', kind: 'do', icon: 'medicine', voice: 'Take your medicine with a grown-up.' }
  },

  // ---------------------------------------------------------------- AAC talk board
  // Fitzgerald Key colours, the same as most AAC systems, so the board feels familiar.
  WORD_TYPES: {
    people: { name: 'People', tint: '#FFF4C7', stroke: '#E0B83A' },
    verb: { name: 'Actions', tint: '#E3F3DA', stroke: '#5E9E45' },
    desc: { name: 'Describing', tint: '#DDEBFA', stroke: '#5E8FC4' },
    noun: { name: 'Things', tint: '#FDE6CF', stroke: '#E0913E' },
    social: { name: 'Social', tint: '#FBE1EA', stroke: '#D9739A' },
    q: { name: 'Questions', tint: '#EEE6FA', stroke: '#8A6CCB' },
    neg: { name: 'No / Stop', tint: '#FBDDD8', stroke: '#D35A45' },
    feel: { name: 'Feelings', tint: '#F1ECFB', stroke: '#7E64C8' },
    misc: { name: 'Other', tint: '#FFFFFF', stroke: '#C9B8A4' }
  },
  WORD_FOLDERS: [
    { id: 'core', name: 'Core', icon: 'star' },
    { id: 'feel', name: 'Feelings', icon: 'heart' },
    { id: 'quick', name: 'Phrases', icon: 'chat' },
    { id: 'food', name: 'Food', icon: 'apple' },
    { id: 'play', name: 'Play', icon: 'ball' },
    { id: 'places', name: 'Places', icon: 'home' },
    { id: 'people', name: 'People', icon: 'together' },
    { id: 'my', name: 'My words', icon: 'camera' }
  ],
  // Core words never move, so children can build motor memory. The first 12 show on Easy, 24 on Medium, 35 on Challenge.
  WORDS: {
    core: [
      { id: 'i', label: 'I', t: 'people', icon: 'me' },
      { id: 'want', label: 'want', t: 'verb', icon: 'want' },
      { id: 'more', label: 'more', t: 'desc', icon: 'wMore' },
      { id: 'help', label: 'help', t: 'verb', icon: 'help' },
      { id: 'stop', label: 'stop', t: 'neg', icon: 'stop' },
      { id: 'finished', label: 'all done', t: 'desc', icon: 'wDone' },
      { id: 'yes', label: 'yes', t: 'social', icon: 'yes' },
      { id: 'no', label: 'no', t: 'neg', icon: 'no' },
      { id: 'go', label: 'go', t: 'verb', icon: 'go' },
      { id: 'eat', label: 'eat', t: 'verb', icon: 'eat' },
      { id: 'ifeel', label: 'I feel', t: 'feel', icon: 'heart' },
      { id: 'next', label: "What's next?", t: 'q', icon: 'wNext' },
      { id: 'you', label: 'you', t: 'people', icon: 'you' },
      { id: 'like', label: 'like', t: 'verb', icon: 'like' },
      { id: 'play', label: 'play', t: 'verb', icon: 'ball' },
      { id: 'drink', label: 'drink', t: 'verb', icon: 'drink' },
      { id: 'break', label: 'break', t: 'noun', icon: 'kBreak' },
      { id: 'wait', label: 'wait', t: 'verb', icon: 'hourglass' },
      { id: 'where', label: 'where?', t: 'q', icon: 'pin' },
      { id: 'when', label: 'when?', t: 'q', icon: 'clock' },
      { id: 'different', label: 'different', t: 'desc', icon: 'wDifferent' },
      { id: 'please', label: 'please', t: 'social', icon: 'please' },
      { id: 'thanks', label: 'thank you', t: 'social', icon: 'smile' },
      { id: 'dont', label: "don't", t: 'neg', icon: 'dont' },
      { id: 'look', label: 'look', t: 'verb', icon: 'eye' },
      { id: 'open', label: 'open', t: 'verb', icon: 'open' },
      { id: 'come', label: 'come', t: 'verb', icon: 'come' },
      { id: 'sleep', label: 'sleep', t: 'verb', icon: 'sleep' },
      { id: 'toilet', label: 'toilet', t: 'noun', icon: 'toilet' },
      { id: 'hurt', label: 'hurt', t: 'desc', icon: 'hurt' },
      { id: 'big', label: 'big', t: 'desc', icon: 'big' },
      { id: 'little', label: 'little', t: 'desc', icon: 'little' },
      { id: 'hot', label: 'hot', t: 'desc', icon: 'hot' },
      { id: 'cold', label: 'cold', t: 'desc', icon: 'cold' },
      { id: 'what', label: 'what?', t: 'q', icon: 'what' }
    ],
    feel: [
      { id: 'happy', label: 'happy', t: 'feel', face: 'happy' },
      { id: 'sad', label: 'sad', t: 'feel', face: 'sad' },
      { id: 'angry', label: 'angry', t: 'feel', face: 'angry' },
      { id: 'worried', label: 'worried', t: 'feel', face: 'worried' },
      { id: 'scared', label: 'scared', t: 'feel', face: 'scared' },
      { id: 'tired', label: 'tired', t: 'feel', emoji: '😴' },
      { id: 'excited', label: 'excited', t: 'feel', emoji: '🤩' },
      { id: 'calmw', label: 'calm', t: 'feel', emoji: '😌' },
      { id: 'sick', label: 'sick', t: 'feel', emoji: '🤒' },
      { id: 'bored', label: 'bored', t: 'feel', emoji: '😑' },
      { id: 'hurtf', label: 'hurt', t: 'feel', emoji: '🤕' },
      { id: 'loved', label: 'loved', t: 'feel', emoji: '🥰' }
    ],
    quick: [
      { id: 'q-help', label: 'I need help', t: 'misc', icon: 'help' },
      { id: 'q-break', label: 'I want a break', t: 'misc', icon: 'kBreak' },
      { id: 'q-dontlike', label: "I don't like that", t: 'neg', icon: 'dont' },
      { id: 'q-alldone', label: "I'm all done", t: 'misc', icon: 'wDone' },
      { id: 'q-turn', label: 'Can I have a turn?', t: 'social', icon: 'kTurns' },
      { id: 'q-stop', label: 'Please stop', t: 'neg', icon: 'stop' },
      { id: 'q-toilet', label: 'I need the toilet', t: 'misc', icon: 'toilet' },
      { id: 'q-loud', label: 'It is too loud', t: 'misc', icon: 'volume' },
      { id: 'q-hungry', label: "I'm hungry", t: 'misc', icon: 'eat' },
      { id: 'q-thirsty', label: "I'm thirsty", t: 'misc', icon: 'drink' },
      { id: 'q-hurt', label: 'Something hurts', t: 'misc', icon: 'hurt' },
      { id: 'q-hello', label: 'Hello!', t: 'social', emoji: '👋' }
    ],
    food: [
      { id: 'apple', label: 'apple', t: 'noun', emoji: '🍎' }, { id: 'banana', label: 'banana', t: 'noun', emoji: '🍌' },
      { id: 'bread', label: 'bread', t: 'noun', emoji: '🍞' }, { id: 'rice', label: 'rice', t: 'noun', emoji: '🍚' },
      { id: 'noodles', label: 'noodles', t: 'noun', emoji: '🍜' }, { id: 'chicken', label: 'chicken', t: 'noun', emoji: '🍗' },
      { id: 'egg', label: 'egg', t: 'noun', emoji: '🥚' }, { id: 'biscuit', label: 'biscuit', t: 'noun', emoji: '🍪' },
      { id: 'icecream', label: 'ice cream', t: 'noun', emoji: '🍦' }, { id: 'water', label: 'water', t: 'noun', emoji: '💧' },
      { id: 'milk', label: 'milk', t: 'noun', emoji: '🥛' }, { id: 'juice', label: 'juice', t: 'noun', emoji: '🧃' }
    ],
    play: [
      { id: 'ball', label: 'ball', t: 'noun', emoji: '⚽' }, { id: 'blocks', label: 'blocks', t: 'noun', emoji: '🧱' },
      { id: 'puzzle', label: 'puzzle', t: 'noun', emoji: '🧩' }, { id: 'tabletw', label: 'tablet', t: 'noun', emoji: '📱' },
      { id: 'musicw', label: 'music', t: 'noun', emoji: '🎵' }, { id: 'bookw', label: 'book', t: 'noun', emoji: '📚' },
      { id: 'drawing', label: 'drawing', t: 'noun', emoji: '🎨' }, { id: 'bubblesw', label: 'bubbles', t: 'noun', emoji: '🫧' },
      { id: 'teddy', label: 'teddy', t: 'noun', emoji: '🧸' }, { id: 'swing', label: 'swing', t: 'noun', emoji: '🛝' },
      { id: 'car', label: 'car', t: 'noun', emoji: '🚗' }, { id: 'tv', label: 'TV', t: 'noun', emoji: '📺' }
    ],
    places: [
      { id: 'homew', label: 'home', t: 'noun', emoji: '🏠' }, { id: 'schoolw', label: 'school', t: 'noun', emoji: '🏫' },
      { id: 'parkw', label: 'park', t: 'noun', emoji: '🌳' }, { id: 'toiletw', label: 'toilet', t: 'noun', emoji: '🚽' },
      { id: 'shop', label: 'shop', t: 'noun', emoji: '🛒' }, { id: 'beach', label: 'beach', t: 'noun', emoji: '🏖️' },
      { id: 'busw', label: 'bus', t: 'noun', emoji: '🚌' }, { id: 'carw', label: 'car', t: 'noun', emoji: '🚗' },
      { id: 'doctor', label: 'doctor', t: 'noun', emoji: '🏥' }, { id: 'pool', label: 'pool', t: 'noun', emoji: '🏊' },
      { id: 'bedroom', label: 'bedroom', t: 'noun', emoji: '🛏️' }, { id: 'outside', label: 'outside', t: 'noun', emoji: '🌤️' }
    ],
    people: [
      { id: 'me', label: 'me', t: 'people', emoji: '🙋' }, { id: 'mum', label: 'Mum', t: 'people', emoji: '👩' },
      { id: 'dad', label: 'Dad', t: 'people', emoji: '👨' }, { id: 'teacher', label: 'teacher', t: 'people', emoji: '🧑‍🏫' },
      { id: 'friend', label: 'friend', t: 'people', emoji: '🧒' }, { id: 'grandma', label: 'Grandma', t: 'people', emoji: '👵' },
      { id: 'grandpa', label: 'Grandpa', t: 'people', emoji: '👴' }, { id: 'brother', label: 'brother', t: 'people', emoji: '👦' },
      { id: 'sister', label: 'sister', t: 'people', emoji: '👧' }, { id: 'baby', label: 'baby', t: 'people', emoji: '👶' },
      { id: 'helper', label: 'helper', t: 'people', emoji: '🧑' }, { id: 'everyone', label: 'everyone', t: 'people', emoji: '👪' }
    ]
  },

  // ---------------------------------------------------------------- Play area
  GAMES: [
    { id: 'bubbles', name: 'Bubbles', icon: 'kBubbles', kind: 'Calm', tint: '#DCEEF7', ink: '#4A78A8', skill: 'emotions' },
    { id: 'match', name: 'Match', icon: 'kCards', kind: 'Memory', tint: '#F1ECFB', ink: '#7E64C8', skill: 'thinking' },
    { id: 'jigsaw', name: 'Jigsaw', icon: 'kPuzzle', kind: 'Thinking', tint: '#E7F3E1', ink: '#4F8A3F', skill: 'thinking' },
    { id: 'sort', name: 'Sort it', icon: 'kSort', kind: 'Everyday', tint: '#FDECC8', ink: '#C98A1E', skill: 'lifeskills' },
    { id: 'pattern', name: 'What next?', icon: 'kShapes', kind: 'Thinking', tint: '#FBE3E8', ink: '#C2577A', skill: 'thinking' }
  ],
  SORT_SETS: {
    1: { bins: [{ id: 'eat', label: 'Eat', icon: 'eat' }, { id: 'wear', label: 'Wear', icon: 'shirt' }],
      items: [['🍎', 'Apple', 'eat'], ['🍌', 'Banana', 'eat'], ['🍞', 'Bread', 'eat'], ['👕', 'T-shirt', 'wear'], ['🧦', 'Socks', 'wear'], ['👟', 'Shoes', 'wear']] },
    2: { bins: [{ id: 'eat', label: 'Eat', icon: 'eat' }, { id: 'wear', label: 'Wear', icon: 'shirt' }, { id: 'play', label: 'Play', icon: 'ball' }],
      items: [['🍎', 'Apple', 'eat'], ['🥕', 'Carrot', 'eat'], ['🍚', 'Rice', 'eat'], ['👖', 'Trousers', 'wear'], ['🧢', 'Cap', 'wear'], ['🧥', 'Coat', 'wear'], ['⚽', 'Ball', 'play'], ['🧸', 'Teddy', 'play'], ['🧩', 'Puzzle', 'play']] },
    3: { bins: [{ id: 'kitchen', label: 'Kitchen', emoji: '🍳' }, { id: 'bathroom', label: 'Bathroom', emoji: '🛁' }, { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' }],
      items: [['🥄', 'Spoon', 'kitchen'], ['🍽️', 'Plate', 'kitchen'], ['🫖', 'Teapot', 'kitchen'], ['🪥', 'Toothbrush', 'bathroom'], ['🧼', 'Soap', 'bathroom'], ['🧻', 'Toilet paper', 'bathroom'], ['🧸', 'Teddy', 'bedroom'], ['⏰', 'Alarm clock', 'bedroom'], ['🩳', 'Pyjama shorts', 'bedroom']] }
  },

  // ---------------------------------------------------------------- Learn with Lumi (guided everyday tutorials)
  // act: tap = tap the thing, hold = press and hold, rub = rub with a finger, pick = choose the right thing, done = finish.
  // min = only show this step from that level up (1 Easy, 2 Medium, 3 Challenge).
  LEARN: [
    { id: 'teeth', name: 'Brush teeth', icon: 'teeth', tint: '#DCEFED', steps: [
      { say: 'Wet your toothbrush.', act: 'tap', prop: 'tap', anim: 'wet' },
      { say: 'Squeeze a little toothpaste. Just a pea!', act: 'hold', prop: 'paste', anim: 'paste' },
      { say: 'Brush your top teeth. Brush, brush, brush!', act: 'rub', prop: 'teethTop', anim: 'brush' },
      { say: 'Now brush your bottom teeth.', act: 'rub', prop: 'teethBottom', anim: 'brush' },
      { say: 'Brush the back teeth too.', act: 'rub', prop: 'teethTop', anim: 'brush', min: 2 },
      { say: 'Gently brush your tongue.', act: 'rub', prop: 'tongue', anim: 'brush', min: 3 },
      { say: 'Spit into the sink.', act: 'tap', prop: 'sink', anim: 'spit' },
      { say: 'Rinse your mouth with water.', act: 'tap', prop: 'cup', anim: 'rinse', min: 2 },
      { say: 'All clean! Show me your big smile.', act: 'done', prop: 'smile', anim: 'smile' }
    ] },
    { id: 'hands', name: 'Wash hands', icon: 'washhands', tint: '#DCEEF7', steps: [
      { say: 'Turn on the water.', act: 'tap', prop: 'tap', anim: 'wet' },
      { say: 'Wet your hands.', act: 'rub', prop: 'hands', anim: 'rub', min: 2 },
      { say: 'Press the soap.', act: 'hold', prop: 'soap', anim: 'paste' },
      { say: 'Rub your hands. Make lots of bubbles!', act: 'rub', prop: 'hands', anim: 'rub' },
      { say: 'Rub between your fingers and the backs of your hands.', act: 'rub', prop: 'hands', anim: 'rub', min: 3 },
      { say: 'Rinse the bubbles away.', act: 'rub', prop: 'hands', anim: 'rub' },
      { say: 'Turn off the water.', act: 'tap', prop: 'tap', anim: 'wet', min: 2 },
      { say: 'Dry your hands with a towel.', act: 'rub', prop: 'towel', anim: 'rub' },
      { say: 'Clean hands! Well done.', act: 'done', prop: 'smile', anim: 'smile' }
    ] },
    { id: 'dress', name: 'Get dressed', icon: 'kDress', tint: '#FBE3E8', steps: [
      { say: 'Put on your underwear.', act: 'pick', want: '🩲', pick: ['🩲', '🧦', '🧢'], anim: 'dress', min: 2 },
      { say: 'Put on your T-shirt.', act: 'pick', want: '👕', pick: ['👕', '🧦', '👟'], anim: 'dress' },
      { say: 'Put on your trousers.', act: 'pick', want: '👖', pick: ['🧢', '👖', '🧤'], anim: 'dress' },
      { say: 'Put on your socks.', act: 'pick', want: '🧦', pick: ['👟', '🧦', '👕'], anim: 'dress' },
      { say: 'Socks first, then shoes!', act: 'pick', want: '👟', pick: ['🩴', '👟', '🧥'], anim: 'dress' },
      { say: 'You are dressed. Looking good!', act: 'done', prop: 'smile', anim: 'smile' }
    ] },
    { id: 'pack', name: 'Pack my bag', icon: 'bag', tint: '#FDECC8', steps: [
      { say: 'Put your books in the bag.', act: 'pick', want: '📚', pick: ['📚', '🧸', '🎮'], anim: 'pack' },
      { say: 'Put your pencil case in.', act: 'pick', want: '✏️', pick: ['🍦', '✏️', '🧸'], anim: 'pack' },
      { say: 'Put your water bottle in.', act: 'pick', want: '💧', pick: ['💧', '🎈', '🛼'], anim: 'pack' },
      { say: 'Put your lunch box in.', act: 'pick', want: '🍱', pick: ['🎮', '🪀', '🍱'], anim: 'pack', min: 2 },
      { say: 'Zip up the bag.', act: 'rub', prop: 'zip', anim: 'pack' },
      { say: 'Your bag is ready!', act: 'done', prop: 'smile', anim: 'smile' }
    ] }
  ],

  // ---------------------------------------------------------------- Pets (unlocked by buying one in the room)
  PETS: {
    puppy: { name: 'Puppy', names: ['Biscuit', 'Mochi', 'Buddy'], foods: [['🦴', 'Bone'], ['🥩', 'Dog food'], ['🥕', 'Carrot']], toy: '🎾' },
    kitten: { name: 'Kitten', names: ['Kopi', 'Snowy', 'Luna'], foods: [['🐟', 'Fish'], ['🥛', 'Milk'], ['🍗', 'Chicken']], toy: '🧶' },
    fishtank: { name: 'Fish', names: ['Bubbles', 'Nemo', 'Sunny'], foods: [['🟤', 'Fish flakes'], ['🦐', 'Shrimp'], ['🌿', 'Plants']], toy: '🫧' }
  },

  // ---------------------------------------------------------------- Together mode
  CHALLENGES: [
    { e: '😀', text: 'Make a happy face' }, { e: '👏', text: 'Clap 3 times' }, { e: '👃', text: 'Point to your nose' },
    { e: '🔵', text: 'Find something blue' }, { e: '👋', text: 'Wave hello' }, { e: '🦘', text: 'Jump 2 times' },
    { e: '🙆', text: 'Make a big shape with your arms' }, { e: '👍', text: 'Give a thumbs up' }, { e: '🐶', text: 'Move like a puppy' },
    { e: '✋', text: 'Give a high five' }, { e: '😮', text: 'Make a surprised face' }, { e: '🌀', text: 'Spin around slowly' },
    { e: '🤲', text: 'Show something you like' }, { e: '🥁', text: 'Tap a beat on the table' }, { e: '🧘', text: 'Take one big breath' }
  ],
  SCENARIOS: [
    { id: 'toy', e: '🧸', text: 'You want to play with a toy someone else is using.', tip: 'Ask: "What else could you say?" Try two answers.', options: [
      { e: '🙋', say: 'Can I have a turn?', kind: 'Ask', out: 'Your friend says: "Sure! After my turn."', ok: true },
      { e: '⏳', say: "I'll wait.", kind: 'Wait', out: 'You wait. Soon it is your turn.', ok: true },
      { e: '🤝', say: 'Can we play together?', kind: 'Share', out: 'You play together. That is fun!', ok: true },
      { e: '✊', say: 'Grab the toy', kind: 'Grab', out: 'Your friend feels upset. Asking works better.', ok: false }] },
    { id: 'jar', e: '🫙', text: "You can't open your snack.", tip: 'Wait a few seconds before helping, so the child can ask.', options: [
      { e: '🆘', say: 'Help, please.', kind: 'Ask for help', out: 'A grown-up helps you open it. Yum!', ok: true },
      { e: '🔁', say: "I'll try again.", kind: 'Try again', out: 'You try again. Twist, twist… it opens!', ok: true },
      { e: '🫴', say: 'Can you open it?', kind: 'Request', out: 'Your friend opens it for you.', ok: true },
      { e: '💥', say: 'Throw it', kind: 'Throw', out: 'Oops, it spills. Asking for help works better.', ok: false }] },
    { id: 'food', e: '🥦', text: "Someone gives you food you don't like.", tip: 'Saying no politely is a real skill. Praise it!', options: [
      { e: '🙅', say: 'No, thank you.', kind: 'Say no kindly', out: 'They say: "Okay! Maybe next time."', ok: true },
      { e: '🔄', say: 'Can I have something else?', kind: 'Ask', out: 'You get some rice instead.', ok: true },
      { e: '🤏', say: 'Just a little bit.', kind: 'Agree a little', out: 'You try one small bite. Brave!', ok: true },
      { e: '👋', say: 'Push it away', kind: 'Push', out: 'The plate falls. Saying "No thank you" works better.', ok: false }] },
    { id: 'loud', e: '🔊', text: 'The room is too loud.', tip: 'All of these are fine. Notice which one the child picks.', options: [
      { e: '⏸️', say: 'I need a break.', kind: 'Ask for a break', out: 'You go somewhere quiet for a while.', ok: true },
      { e: '🎧', say: 'Headphones, please.', kind: 'Ask', out: 'You wear headphones. Much better.', ok: true },
      { e: '🙉', say: 'Cover my ears', kind: 'Cover ears', out: 'Covering your ears helps. That is okay.', ok: true },
      { e: '📢', say: 'It is too loud.', kind: 'Tell', out: 'Someone turns the music down.', ok: true }] },
    { id: 'swing', e: '🛝', text: 'You want a turn on the swing.', tip: 'Practise counting to 10 together while waiting.', options: [
      { e: '🙋', say: 'Can I have a turn?', kind: 'Ask', out: 'They say: "Yes, after 10 swings."', ok: true },
      { e: '🔟', say: "Let's count to 10, then swap.", kind: 'Agree a plan', out: 'You count together, then swap. Fair!', ok: true },
      { e: '⏳', say: "I'll wait.", kind: 'Wait', out: 'You wait nearby. Then it is your turn.', ok: true },
      { e: '✋', say: 'Push them off', kind: 'Push', out: 'They could get hurt. Asking works better.', ok: false }] },
    { id: 'lost', e: '🛒', text: "You can't find your grown-up in the shop.", tip: 'Practise showing an "I am lost" card with your phone number.', options: [
      { e: '🧍', say: 'Stand still.', kind: 'Stay still', out: 'You stay still. Your grown-up finds you.', ok: true },
      { e: '🪪', say: 'Show my card.', kind: 'Show card', out: 'A shop helper calls your grown-up.', ok: true },
      { e: '🆘', say: 'Help, I am lost.', kind: 'Ask for help', out: 'A shop helper helps you.', ok: true },
      { e: '🏃', say: 'Run around', kind: 'Run', out: 'It is harder to find you. Stay still works better.', ok: false }] }
  ],
  SUPPORTS: [
    { id: 'quiet', label: 'Quiet time', icon: 'quiet', ideas: ['Dim the lights or lower your voice', 'Go to the calm corner together', 'Sit nearby without talking'], go: 'calm' },
    { id: 'help', label: 'Help', icon: 'help', ideas: ['Say: "Show me what is hard"', 'Do the first step together'] },
    { id: 'move', label: 'Move', icon: 'jump', ideas: ['Jump 10 times together', 'Walk around the room', 'Stretch up high, then flop down'], go: 'jump' },
    { id: 'play', label: 'Keep playing', icon: 'ball', ideas: ['Carry on, and check in again later'] },
    { id: 'hug', label: 'Hug', icon: 'hug', ideas: ['Offer a hug or a hand squeeze, and let the child choose'] },
    { id: 'music', label: 'Music', icon: 'music', ideas: ['Play calming music together'], go: 'calm' },
    { id: 'snack', label: 'Snack or drink', icon: 'snack', ideas: ['Offer a drink of water or a small snack'] },
    { id: 'break', label: 'Break', icon: 'kBreak', ideas: ['Take a 5 minute break', 'Use a timer so the break has a clear end'], go: 'timer' }
  ],
  CALM_CHOICES: [
    { id: 'breathe', label: 'Breathe', icon: 'balloon' }, { id: 'squeeze', label: 'Squeeze', icon: 'squeeze' },
    { id: 'ask', label: 'Ask for help', icon: 'help' }, { id: 'hug', label: 'Hug', icon: 'hug' },
    { id: 'break', label: 'Take a break', icon: 'kBreak' }, { id: 'music', label: 'Music', icon: 'music' }
  ],
  MISSIONS: [
    { id: 'morning', name: 'Morning mission', icon: 'sun', tint: '#FFF1C2', tasks: [
      { type: 'ask', text: 'Ask your partner for something you need in the morning.', choices: [['🥣', 'Cereal'], ['🥛', 'Milk'], ['🧦', 'Socks'], ['🎒', 'My bag']] },
      { type: 'order', text: 'Put the morning in order together. Take turns!', steps: ['wake', 'dressed', 'breakfast', 'bus'] },
      { type: 'calm', text: 'Lumi feels worried about the bus. What could help Lumi?', feeling: 'worried' }] },
    { id: 'park', name: 'Park mission', icon: 'tree', tint: '#E7F3E1', tasks: [
      { type: 'ask', text: 'Ask your partner for something to take to the park.', choices: [['⚽', 'Ball'], ['💧', 'Water'], ['🧢', 'Hat'], ['🍪', 'Snack']] },
      { type: 'order', text: 'Put the park trip in order together. Take turns!', steps: ['dressed', 'bus', 'park', 'lunch'] },
      { type: 'calm', text: 'It starts to rain and Lumi feels sad. What could help Lumi?', feeling: 'sad' }] },
    { id: 'bedtime', name: 'Bedtime mission', icon: 'moon', tint: '#F1ECFB', tasks: [
      { type: 'ask', text: 'Ask your partner for something at bedtime.', choices: [['📚', 'A story'], ['🧸', 'Teddy'], ['💧', 'Water'], ['💡', 'Night light']] },
      { type: 'order', text: 'Put bedtime in order together. Take turns!', steps: ['dinner', 'bath', 'teeth', 'bedtime'] },
      { type: 'calm', text: 'Lumi feels scared of the dark. What could help Lumi?', feeling: 'scared' }] }
  ],
  PARTNERS: [['Mum', '👩'], ['Dad', '👨'], ['Teacher', '🧑‍🏫'], ['Helper', '🧑'], ['Brother', '👦'], ['Sister', '👧'], ['Friend', '🧒']],

  // ---------------------------------------------------------------- Personalising (set by grown-ups)
  AGES: {
    little: { name: 'Little ones', range: '3 to 6', level: 1, note: 'Bigger buttons, fewer choices, more pictures.' },
    primary: { name: 'Primary', range: '7 to 12', level: 2, note: 'The standard Lumi look and choices.' },
    teen: { name: 'Teens', range: '13 to 18', level: 3, note: 'A calmer, grown-up look with more words and choices.' }
  },
  LEVELS: { 1: 'Easy', 2: 'Medium', 3: 'Challenge' },
  THEMES: {
    sand: { name: 'Sand', bg: '#E8D9C5', surface: '#F6E7D3', floor: '#E8CDB0', accent: '#2F7E79', accentDark: '#235F5B', accentSoft: '#DCEFED' },
    ocean: { name: 'Ocean', bg: '#D3E3EC', surface: '#E9F2F7', floor: '#C3D8E4', accent: '#2C6A93', accentDark: '#1F4F70', accentSoft: '#D9EAF5' },
    forest: { name: 'Forest', bg: '#D9E3CC', surface: '#EEF3E5', floor: '#CBD9B8', accent: '#4A7A36', accentDark: '#365C27', accentSoft: '#E1EFD6' },
    berry: { name: 'Berry', bg: '#EAD9E3', surface: '#F7EAF1', floor: '#E2C8D6', accent: '#9A4876', accentDark: '#76355A', accentSoft: '#F5DFEB' },
    space: { name: 'Space', bg: '#D7D9EC', surface: '#ECEDF8', floor: '#C8CBE3', accent: '#4B4F9C', accentDark: '#363A7A', accentSoft: '#E1E2F6' },
    soft: { name: 'Soft (low colour)', bg: '#E6E3DE', surface: '#F2F0EC', floor: '#DAD6CF', accent: '#5E7471', accentDark: '#46585A', accentSoft: '#E3E9E8' },
    cream: { name: 'Peach cream', bg: '#FFF1E2', surface: '#FFE6CF', floor: '#F9D3B0', accent: '#D96F4A', accentDark: '#B5543B', accentSoft: '#FFE1D3' },
    paper: { name: 'Craft paper', bg: '#F1E4CF', surface: '#FBF3E6', floor: '#E6D1B0', accent: '#CF6447', accentDark: '#A84B33', accentSoft: '#F7DCD2' },
    mist: { name: 'Misty blue', bg: '#ECF1F7', surface: '#F7F9FC', floor: '#DCE5EF', accent: '#6683BD', accentDark: '#4F6A9C', accentSoft: '#E1E9F6' },
    meadow: { name: 'Meadow', bg: '#E5EEDD', surface: '#F2F7EC', floor: '#D2BC97', accent: '#558F42', accentDark: '#3F6E31', accentSoft: '#DFEDD3' },
    stone: { name: 'Stone', bg: '#F3F3F1', surface: '#FFFFFF', floor: '#EBEBE7', accent: '#3E5463', accentDark: '#2C3D48', accentSoft: '#E5EBEE' },
    night: { name: 'Night arcade', bg: '#2B2F4A', surface: '#3A4066', floor: '#4A5280', accent: '#F27B00', accentDark: '#B85C00', accentSoft: '#FFEFD9' }
  },
  // Art styles grown-ups can choose for the child. Each one changes how Lumi is drawn, the colours and the feel of the screens.
  ART_STYLES: {
    soft: { name: 'Soft and round', who: 'Young children', theme: 'cream', dots: ['#FFB08A', '#A8D8EA', '#FFE08A', '#C5E8B7'], bg: '#FFF4E6' },
  },
  SKILLS: {
    communication: { name: 'Communication', icon: 'chat', color: '#2F7E79' },
    routines: { name: 'Routines', icon: 'calendar', color: '#4A78A8' },
    emotions: { name: 'Feelings and calm', icon: 'heart', color: '#7E64C8' },
    lifeskills: { name: 'Everyday skills', icon: 'learn', color: '#C98A1E' },
    social: { name: 'Social and turn-taking', icon: 'together', color: '#C2577A' },
    thinking: { name: 'Thinking and memory', icon: 'puzzle', color: '#4F8A3F' }
  },
  TRACKS: [
    { id: 'lullaby', name: 'Lullaby', icon: 'moon' },
    { id: 'waves', name: 'Ocean waves', icon: 'drop' },
    { id: 'rain', name: 'Soft rain', icon: 'rain' },
    { id: 'clouds', name: 'Floating', icon: 'cloud' },
    { id: 'mine', name: 'My music', icon: 'heart' }
  ],
  REMINDER_IDEAS: [['💧', 'Drink some water'], ['🚽', 'Toilet break'], ['🧘', 'Stretch with Lumi'], ['💊', 'Medicine with a grown-up'], ['🍎', 'Snack time']],

  // ---------------------------------------------------------------- Voices the child can choose (uses the voices installed on the tablet)
  VOICES: [
    // Who speaks. Every voice is gentle: a little slower than normal, soft pitch, never shouty.
    { id: 'lumi', name: 'Lumi', e: '✨', pitch: 1.12, rate: 0.95, volume: 0.9, prefer: 'female' },
    { id: 'girl', name: 'Girl', e: '👧', pitch: 1.22, rate: 0.95, volume: 0.9, prefer: 'female', person: 'girl' },
    { id: 'boy', name: 'Boy', e: '👦', pitch: 1.12, rate: 0.95, volume: 0.9, prefer: 'male', person: 'boy' },
    { id: 'grown', name: 'Grown-up woman', e: '🧑', pitch: 1, rate: 0.9, volume: 0.9, prefer: 'female', person: 'mum' },
    { id: 'man', name: 'Grown-up man', e: '🧔', pitch: 0.9, rate: 0.9, volume: 0.9, prefer: 'male', person: 'dad' },
    { id: 'robot', name: 'Friendly robot', e: '🤖', pitch: 0.75, rate: 0.92, volume: 0.85, prefer: null }
  ],
  // How the voice sounds (multiplies the voice above). Grown-ups or the child can pick one.
  VOICE_STYLES: [
    { id: 'gentle', name: 'Gentle', sub: 'Soft and warm', icon: 'kHeart', rate: 0.95, pitch: 1.04, volume: 0.8 },
    { id: 'calm', name: 'Calm and slow', sub: 'Slow and steady', icon: 'kCalm', rate: 0.82, pitch: 0.96, volume: 0.85 },
    { id: 'cheerful', name: 'Cheerful', sub: 'Bright and happy', icon: 'kFun', rate: 1.04, pitch: 1.12, volume: 0.95 },
    { id: 'clear', name: 'Slow and clear', sub: 'Every word clear', icon: 'kTalk', rate: 0.76, pitch: 1, volume: 1 },
    { id: 'quiet', name: 'Quiet', sub: 'Very soft', icon: 'quiet', rate: 0.88, pitch: 1, volume: 0.5 }
  ],

  // ---------------------------------------------------------------- Badges for new skills
  // test: stat = a number in stats, len = a list's length, tut = a tutorial finished, story = stories read, streak = days in a row
  SKILL_BADGES: [
    { id: 'ready', name: 'Ready to go', icon: 'bag', color: '#4F8A3F', how: 'Finish a "Before you go" checklist', test: { stat: 'checklists', n: 1 } },
    { id: 'ready10', name: 'Super ready', icon: 'wDone', color: '#4F8A3F', how: 'Get ready 10 times', test: { stat: 'checklists', n: 10 } },
    { id: 'brave', name: 'Brave helper', icon: 'busLine', color: '#E09A2E', how: 'Help Lumi when the plan changes', test: { stat: 'changesHandled', n: 1 } },
    { id: 'words', name: 'First words', icon: 'chat', color: '#2F7E79', how: 'Say a message on the talk board', test: { stat: 'talkUses', n: 1 } },
    { id: 'talker', name: 'Big talker', icon: 'chat', color: '#2F7E79', how: 'Say 10 messages', test: { stat: 'talkUses', n: 10 } },
    { id: 'feelings', name: 'Feelings finder', icon: 'heart', color: '#7E64C8', how: 'Name how Lumi feels 3 times', test: { stat: 'feelingsNamed', n: 3 } },
    { id: 'calm', name: 'Calm explorer', icon: 'cloud', color: '#7E64C8', how: 'Try 3 calm tools', test: { len: 'calmTried', n: 3 } },
    { id: 'teeth', name: 'Teeth hero', icon: 'teeth', color: '#2F7E79', how: 'Learn to brush teeth with Lumi', test: { tut: 'teeth' } },
    { id: 'hands', name: 'Clean hands', icon: 'washhands', color: '#4A78A8', how: 'Learn to wash hands', test: { tut: 'hands' } },
    { id: 'dress', name: 'Dressing star', icon: 'shirt', color: '#C2577A', how: 'Learn to get dressed', test: { tut: 'dress' } },
    { id: 'pack', name: 'Bag packer', icon: 'bag', color: '#C98A1E', how: 'Learn to pack your bag', test: { tut: 'pack' } },
    { id: 'story', name: 'Story explorer', icon: 'storybook', color: '#A8457A', how: 'Read a story with Lumi', test: { stat: 'stories', n: 1 } },
    { id: 'bookworm', name: 'Bookworm', icon: 'book', color: '#A8457A', how: 'Read every story', test: { story: 'all' } },
    { id: 'puzzle', name: 'Puzzle pro', icon: 'puzzle', color: '#4F8A3F', how: 'Finish 5 games', test: { stat: 'games', n: 5 } },
    { id: 'team', name: 'Team player', icon: 'together', color: '#C2577A', how: 'Play together with someone', test: { stat: 'together', n: 1 } },
    { id: 'mission', name: 'Mission star', icon: 'flag', color: '#B07A12', how: 'Finish a team mission', test: { stat: 'missions', n: 1 } },
    { id: 'petpal', name: 'Pet pal', icon: 'paw', color: '#C0674A', how: 'Look after your pet 5 times', test: { stat: 'petCare', n: 5 } },
    { id: 'streak3', name: '3 day streak', icon: 'flame', color: '#FF9600', how: 'Reach your daily goal 3 days in a row', test: { streak: 3 } },
    { id: 'streak7', name: '7 day streak', icon: 'flame', color: '#FF9600', how: 'A whole week in a row', test: { streak: 7 } },
    { id: 'streak14', name: '14 day streak', icon: 'flame', color: '#FF9600', how: 'Two weeks in a row', test: { streak: 14 } },
    { id: 'streak30', name: '30 day streak', icon: 'flame', color: '#FF9600', how: 'A whole month in a row', test: { streak: 30 } }
  ],

  // ---------------------------------------------------------------- Story adventures (social stories with Lumi)
  // scene = the background picture. lumi = Lumi's mood. cast = people (emoji). props = things in the picture.
  // ask = a choice for the child. tap = something to tap in the picture.
  STORIES: [
    { id: 'dentist', title: 'Lumi visits the dentist', e: '🦷', tint: '#DCEFED', pages: [
      { scene: 'home', lumi: 'happy', props: ['🦷'], text: 'Today Lumi is going to the dentist. The dentist helps keep teeth healthy.' },
      { scene: 'waiting', lumi: 'worried', props: ['📚', '🪴'], text: 'Lumi waits in the waiting room. It can feel a bit strange. That is okay.',
        ask: { q: 'What can Lumi do while waiting?', options: [
          { e: '📚', label: 'Read a book', reply: 'Good idea! Reading makes the time go faster.' },
          { e: '🎧', label: 'Listen to music', reply: 'Music helps Lumi feel calm.' },
          { e: '🌬️', label: 'Take big breaths', reply: 'In… and out. Lumi feels calmer.' }] } },
      { scene: 'dentist', lumi: 'calm', cast: ['🧑‍⚕️'], text: 'The dentist says hello. Lumi sits in the big chair. The chair goes back slowly.' },
      { scene: 'dentist', lumi: 'excited', cast: ['🧑‍⚕️'], text: 'The dentist asks Lumi to open wide. Lumi opens wide like a lion!', tap: { e: '🦁', label: 'Tap to open wide', say: 'Aaaah!' } },
      { scene: 'dentist', lumi: 'worried', cast: ['🧑‍⚕️'], props: ['🪥'], text: 'The dentist counts Lumi\'s teeth. It can tickle a little.',
        ask: { q: 'Lumi feels worried. What could help?', options: [
          { e: '🧸', label: 'Hold teddy', reply: 'Teddy helps Lumi feel safe.' },
          { e: '✊', label: 'Squeeze my hands', reply: 'Squeeze, squeeze. Lumi feels stronger.' },
          { e: '✋', label: 'Say "Stop, please"', reply: 'The dentist stops and waits. Lumi is safe.' }] } },
      { scene: 'dentist', lumi: 'excited', cast: ['🧑‍⚕️'], props: ['⭐'], text: 'All done! Lumi was brave. The dentist gives Lumi a sticker.' },
      { scene: 'home', lumi: 'happy', props: ['😁'], text: 'Lumi\'s teeth are clean and strong. Brushing every day keeps them healthy.' }
    ] },
    { id: 'haircut', title: 'Haircut day', e: '✂️', tint: '#FBE3E8', pages: [
      { scene: 'home', lumi: 'happy', props: ['🪞'], text: 'Lumi\'s fur is getting long. Today Lumi will get a haircut.' },
      { scene: 'barber', lumi: 'calm', cast: ['🧑‍🦱'], text: 'The hairdresser says hello. Lumi sits in a big chair in front of a mirror.' },
      { scene: 'barber', lumi: 'excited', cast: ['🧑‍🦱'], text: 'The hairdresser puts a cape on Lumi, like a superhero!', tap: { e: '🦸', label: 'Tap to put on the cape', say: 'Swoosh! Super Lumi!' } },
      { scene: 'barber', lumi: 'worried', cast: ['🧑‍🦱'], props: ['✂️', '🔊'], text: 'The scissors go snip, snip. The clippers go buzz. It can be loud.',
        ask: { q: 'The buzz is loud. What could help Lumi?', options: [
          { e: '🎧', label: 'Wear headphones', reply: 'Headphones make the buzz quieter.' },
          { e: '🙉', label: 'Cover my ears', reply: 'Covering ears is okay. Lumi feels better.' },
          { e: '⏸️', label: 'Ask for a break', reply: 'The hairdresser stops for a little break.' }] } },
      { scene: 'barber', lumi: 'calm', cast: ['🧑‍🦱'], text: 'Lumi keeps very still. The hairdresser is careful and gentle.' },
      { scene: 'barber', lumi: 'excited', props: ['🪞', '✨'], text: 'Look in the mirror. Lumi looks great!' },
      { scene: 'home', lumi: 'happy', text: 'Lumi says thank you. A haircut helps Lumi look neat and tidy.' }
    ] },
    { id: 'shop', title: 'At the supermarket', e: '🛒', tint: '#E7F3E1', pages: [
      { scene: 'home', lumi: 'happy', props: ['📝'], cast: ['👩'], text: 'Lumi and Mum are going to the supermarket. Lumi has a picture list.' },
      { scene: 'shop', lumi: 'calm', cast: ['👩'], props: ['🛒'], text: 'The supermarket is big and busy. Lumi helps push the trolley.' },
      { scene: 'shop', lumi: 'excited', props: ['🍎', '🍞', '🥛'], text: 'Lumi finds things on the list: apples, bread and milk!', tap: { e: '🍎', label: 'Tap the apples', say: 'Apples in the trolley!' } },
      { scene: 'shop', lumi: 'worried', props: ['🔊'], text: 'There are lots of people and noises. Lumi feels too full of noise.',
        ask: { q: 'What could Lumi do?', options: [
          { e: '⏸️', label: 'Show "I need a break"', reply: 'Mum sees the card. They find a quiet spot.' },
          { e: '🎧', label: 'Ask for headphones', reply: 'Headphones help. Much better.' },
          { e: '🏃', label: 'Run away', reply: 'Running away is not safe. Lumi can show the break card instead.', ok: false }] } },
      { scene: 'shop', lumi: 'calm', cast: ['👩'], text: 'Mum and Lumi stand in a quiet corner. Lumi takes three big breaths.' },
      { scene: 'shop', lumi: 'happy', props: ['💳'], text: 'Lumi waits in the line. Then it is Lumi\'s turn to pay.' },
      { scene: 'home', lumi: 'excited', props: ['🛍️'], text: 'They go home with the shopping. Lumi did it!' }
    ] },
    { id: 'party', title: 'A birthday party', e: '🎂', tint: '#FFF1C2', pages: [
      { scene: 'home', lumi: 'happy', props: ['💌'], text: 'Lumi is going to Pip\'s birthday party.' },
      { scene: 'party', lumi: 'happy', friend: true, text: 'Lumi knocks on the door. Pip says hello!',
        ask: { q: 'How can Lumi say hello?', options: [
          { e: '👋', label: 'Wave', reply: 'Pip waves back!' },
          { e: '🙂', label: 'Smile', reply: 'Pip smiles too.' },
          { e: '💬', label: 'Say "Hello!"', reply: '"Hello, Lumi!" says Pip.' }] } },
      { scene: 'party', lumi: 'excited', friend: true, props: ['🎁'], text: 'There are balloons and presents. Lumi gives Pip a present.' },
      { scene: 'party', lumi: 'worried', friend: true, props: ['🎶'], text: 'Everyone sings Happy Birthday. It is loud! Lumi can cover ears. That is okay.' },
      { scene: 'party', lumi: 'excited', friend: true, props: ['🎂'], text: 'Pip blows out the candles. Lumi can help!', tap: { e: '🕯️', label: 'Tap to blow out the candles', say: 'Whoooosh!' } },
      { scene: 'party', lumi: 'calm', friend: true, props: ['🎲'], text: 'Now there is a game. Everyone takes turns.',
        ask: { q: 'It is Pip\'s turn. What does Lumi do?', options: [
          { e: '⏳', label: 'Wait for my turn', reply: 'Lumi waits. Lumi\'s turn is next!' },
          { e: '👏', label: 'Cheer for Pip', reply: 'Pip loves the cheering!' },
          { e: '✊', label: 'Grab the dice', reply: 'Pip feels upset. Waiting works better.', ok: false }] } },
      { scene: 'home', lumi: 'happy', text: 'The party is over. Lumi says "Thank you, bye!" Lumi had fun.' }
    ] },
    { id: 'teacher', title: 'A new teacher', e: '🏫', tint: '#DCEEF7', pages: [
      { scene: 'classroom', lumi: 'happy', text: 'Lumi goes to school. Today, Lumi\'s teacher is away.' },
      { scene: 'classroom', lumi: 'worried', cast: ['🧑‍🏫'], text: 'A new teacher is here. Lumi feels worried. Changes can feel big.',
        ask: { q: 'What could Lumi do?', options: [
          { e: '➡️', label: 'Ask "What\'s next?"', reply: 'The teacher shows Lumi the plan.' },
          { e: '🌬️', label: 'Take big breaths', reply: 'In… and out. Lumi feels calmer.' },
          { e: '💜', label: 'Show my feelings card', reply: 'The teacher says: "Thank you for telling me."' }] } },
      { scene: 'classroom', lumi: 'calm', cast: ['🧑‍🏫'], text: 'The new teacher smiles. "Hello, Lumi. My name is Ms Tan."' },
      { scene: 'classroom', lumi: 'happy', cast: ['🧑‍🏫'], props: ['📅'], text: 'Ms Tan shows the plan for today. Lumi can see what is next.', tap: { e: '📅', label: 'Tap the plan', say: 'Art, lunch, then play!' } },
      { scene: 'classroom', lumi: 'excited', props: ['🎨'], text: 'The day is the same, with art, lunch and play.' },
      { scene: 'home', lumi: 'happy', text: 'Tomorrow Lumi\'s teacher will come back. Lumi was brave today!' }
    ] }
  ],

  // ---------------------------------------------------------------- Grown-ups' observation journal
  JOURNAL_MOODS: [['great', '😄', 'Great'], ['good', '🙂', 'Good'], ['okay', '😐', 'Okay'], ['hard', '😟', 'Hard'], ['vhard', '😢', 'Very hard']],
  JOURNAL_TAGS: ['Routine', 'Communication', 'Feelings', 'Calming down', 'Meltdown', 'Social', 'Sleep', 'Food', 'School', 'New skill', 'Trigger', 'Win']
};
