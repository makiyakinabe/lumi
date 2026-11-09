# Lumi: web prototype

A playable prototype of **Lumi**, a tablet game for non-speaking children and young people with special needs.
It focuses on routines, communication and emotional regulation, with three modes: **Solo**, **Together** and **Grown-ups**.

It is plain HTML, CSS and JavaScript. There is nothing to install and no build step.

## Home language (Chinese, Malay, Tamil)

Grown-ups › Sensory › **Home language**. Pick 华文, Bahasa Melayu or தமிழ் and:

- the talk board, feelings and My day show the home-language word under each English word
- Lumi speaks English, the home language, or both (English first, then the home language)
- **Change words** lets a family use its own words (for example 婆婆 instead of 奶奶 for Grandma); photo words in Activities get their own translation box
- the screen says whether this tablet has a voice for the language. Without one, the words still show and Lumi speaks English (add voices in the iPad's Settings › Accessibility › Spoken Content › Voices, or Android's Text-to-speech settings)

The talk board reads a message word by word, which suits Chinese and Malay well; Tamil word order differs, so the Phrases folder (whole sentences) sounds more natural. All translations (`js/lang.js`) should be checked by a native speaker before a real release, Tamil especially.

## Ready for the App Store and Google Play

- **Nothing loads from the internet.** The font is kept in the app (`css/fonts.css`; put `Nunito-Variable.ttf` in `fonts/`, see `fonts/README.txt`; without it Lumi uses the tablet's own rounded font).
- **Online features are off until a grown-up turns them on:** the microphone in Chat (behind a grown-ups-only check, `A.parentGate` in `js/store.js`) and live bus times (needs a relay link).
- **Privacy:** Grown-ups › Child › Privacy says what Lumi keeps (everything stays on the tablet). `privacy.html` is the privacy policy to host and link from the stores (fill in your email).
- **Tap instead of drag** and **High contrast** (Grown-ups › Sensory), for children who find dragging hard or need stronger outlines. In Learn, "Do it with me" helps with any step, including press-and-hold.
- **Reminders wait** until a story or lesson step is finished.
- **The native app** (iPad, iPhone, Android) is in `../app` (Capacitor). `js/native.js` adds the native voice on Android, timetable reminders as notifications when Lumi is closed (Grown-ups › Child › Reminders when Lumi is closed), the Android back button, and the splash screen; in a browser it does nothing. See `../app/STORE-GUIDE.md` and `../app/store/listing.md`; App Store screenshots are in `../app/store/screenshots/`.

## App icon

Grown-ups › Child › **App icon**: choose the picture for Lumi on the tablet's home screen from twelve designs (Lumi's face, Peekaboo, Little light, Hello wave, Wordmark, Talk and feel, Wonder, Cosy blanket, Sunny day, Glow on teal, Moon and spark, Corner peek) or the original. The choice belongs to the tablet, not to one child. It changes the browser tab icon, the iPad/iPhone home-screen icon and the install icons (including Android's round "maskable" icon). A home-screen icon is copied when Lumi is added, so if Lumi is already on the home screen, remove it and add it again. The pictures are `icons/app-<name>-180|192|512.png` and `app-<name>-mask-512.png` (`js/appicons.js`).

## Learn with Lumi (real-life lessons)

Fun › **Learn**. Every built-in lesson is now a real place the child acts out with Lumi, on the story engine (`js/learn-*.js`), instead of tapping a picture:

- **Brush teeth** (`learn-teeth.js`): pull the step stool to the sink, turn on the tap and wet the brush, press and hold for a pea of toothpaste, then the mirror view: brush the top teeth, the bottom teeth, the back teeth and the tongue (Lumi counts to ten), spit, rinse with the cup, put the brush back and turn off the tap, and smile in the mirror. The mouth is friendly: teeth inside the mouth, the tongue behind the bottom teeth.
- **Wash hands** and **Use the toilet** (`learn-bath.js`), **Get dressed** and **Pack my bag** (`learn-bedroom.js`), **Buy food at the canteen**, **Make a sandwich** and **Do the laundry** (`learn-life.js`). Teens' "Order at the hawker centre" opens the hawker story.

How every lesson helps a child who has never done the task and is scared to try:

- **Watch, then do.** Lumi shows each new step first with a see-through hand (after the words are read), then the child tries. Grown-ups › Sensory › "Lumi shows each step first" turns this off.
- **Show me** is always in the bar: tap it to see the step again. After that, **Do it with me** does the step together with Lumi, so nobody gets stuck.
- One small action per step, written in the bar as well as spoken, big things to drag, nothing timed and nothing marked wrong. Easy has fewer steps; Medium and Challenge add steps (like the back teeth and the tongue).
- The cards say how many small steps a lesson has.
- At the end: **Try it for real**. When the child really does it, they tap "I did it for real" for a star (logged for grown-ups, and it counts towards the skill badges).

Lessons a grown-up makes with photos (Grown-ups › Activities) still use the simple photo player.

## Gentler pace

- **My day** shows the one thing to do now in words in the bar ("Tap the curtains."), not only spoken.
- Little ones see just **Now** and **Next** at the top of My day, not a long list of jobs.
- Badges and streak celebrations wait until the child has finished the step (or the story or game), so they never pop up in the middle of a task.
- In stories and lessons, the hint hand waits longer, so it never rushes in on top of Lumi showing the step.

## Waiting game

Fun › Games › **Waiting game**. Gentle practice for waiting: the child picks the bus, food cooking or a queue. A timer ring empties while the bus drives closer, the pot steams or the queue gets shorter, and Lumi waits calmly with them, saying what helps. While waiting they can breathe, count, squeeze, or look around (find three things in the picture). "It's too hard" is always there: the first time Lumi helps wait just 5 more seconds, the second time the wait ends kindly. Waits start short (Easy 10 s, Medium 20 s, Challenge 30 s) and grow by 5 seconds each time the child waits all the way (`js/waitgame.js`).

## More than one child on a tablet

Grown-ups › Child › **Children on this tablet**: add a child (they go through setup), switch, or remove. Each child has their own Lumi, timetable, words, stories, stars and progress. When there is more than one, Lumi opens on **Who is playing?** and the menu shows a Switch chip. Voice recordings and uploaded music are shared. Backups save the child who is playing (`js/profiles.js`).

## Feelings and breaks over time

Grown-ups › **Progress** › Feelings and breaks: a week at a glance (feelings with the hard ones ringed, breaks, waiting practice, and what was different about each day: occasional timetable steps, Coming up events, plan changes, journal notes), with earlier weeks one tap away. Below it, Lumi points out patterns from the last four weeks in plain words, such as harder days with a certain step, school days compared with days off, plan changes, the time of day and activity most breaks happen in, harder weekdays, and what helps most while waiting. Every feeling, break and change is now kept with its time and place (`js/feelchart.js`).

## Story adventures (interactive real-life practice)

Fun › Stories. Each story is a set of scenes the child acts out with Lumi, with guidance at every step: Lumi says what is happening and what to do, the guide hand shows where, and wrong tries get a kind hint instead of a "no". Choices carry through the story.

- **Lunch at the hawker centre:** choose what helps with the noise (headphones really go on), chope a free table by dragging the tissue packet (busy and already-choped tables explain why not), pick a stall, wait in the queue and step forward when it moves, order from the menu (one dish is sold out), say the order with a talk card, pay by cash, card or phone, carry the tray to your table, eat, take the tissue back and return the tray.
- **Dentist, Haircut (with the mirror view), Polyclinic, Supermarket, MRT, Birthday party, New teacher, Fire drill, Asking for help at work:** the same kind of hands-on scenes for each place.
- Everyone in the stories is a full-body character (`js/people.js`): parents, grandparents, teachers, dentist, doctor, hairdresser, hawker uncle and aunty, cashier, MRT staff and more.
- Payments use one guided step for all stories (`SX.payStep`): cash (drag notes and coins until it adds up, then take the change), card (tap on the reader) or phone (scan the QR code).

Code: the engine is `js/stories.js` (the `A.SX` helpers are explained at the top); each story is its own file (`js/story-hawker.js`, `js/story-care.js`, `js/story-out.js`, `js/story-school.js`, `js/story-life.js`).

## No emoji: drawn pictures everywhere

Lumi shows no emoji. Every picture (talk board, stories, games, settings) is a drawing with soft shading (`js/pics.js` and `js/pics-food.js`, `js/pics-things.js`, `js/pics-symbols.js`). If an emoji is still written somewhere in the data, `js/pics.js` swaps it for its drawing the moment it appears on screen. To add a picture: `LP.add('<emoji or name>', { label: 'Apple', svg: '...48 x 48 drawing...' })`.

## Coming up stories (social stories)

Grown-ups › **Coming up** prepares a child for something new or different. Pick a ready-made story (dentist, doctor, haircut, new school, visitors, birthday party, a new place, change of plan, or your own), set the date and time, edit the sentences and add real photos.

- From a few days before (3 days, 1 week or 2 weeks), Lumi's home screen shows a countdown: "3 sleeps until Dentist", with a moon for each sleep. Tapping it opens the story.
- The story reader: a countdown cover, the grown-up's pages read aloud by Lumi, then "How do you feel about it?" (happy, worried, scared) and "I'm ready". The answer shows in Progress.
- On the day the event joins My day at its time, with the story ready to read before going (it can be turned off per story).

Code: `js/comingup.js`; the stories live in `state.comingUp`.

## Backup and use without internet

Grown-ups › Child › **Backup and offline**.

- **Save a backup** downloads one file (`lumi-backup-<name>-<date>.json`) with progress, timetable, words, stories, settings and photos. **Restore from a backup** loads it on this or another tablet (it asks first, because it replaces everything). Voice recordings and your own music are not included.
- **Use without internet:** when Lumi is opened from a web address (not by double-clicking the file), `sw.js` keeps every file on the tablet, so Lumi opens and works with no Wi-Fi. Add it to the home screen (iPad: Safari › Share › Add to Home Screen; Android: browser menu › Install app) and it opens full-screen with its own icon (`manifest.webmanifest`, `icons/`). A free way to host it is GitHub Pages: upload the `web` folder to a repository and turn on Pages.
- When you add or rename a file, add it to the list in `sw.js` and change `VERSION` there, so tablets pick up the new version (it shows the next time Lumi is opened).

## Lumi's rug and floors

Lumi never stands on a plain flat floor. Floors have soft floorboards, and wherever Lumi stands on a floor (menu, home, chat, room, games) a cute rug is laid under his feet, with his pets on it too. The wake-up game's "slide Lumi onto the rug" uses the same rug.

- `js/rugs.js` draws the rugs and places one under Lumi after every screen is drawn. Screens where Lumi is not on the floor (in bed, in the bath, at the table) get no rug.
- Rugs: Cloud (free), Bear, Flower, Stripy, Starry and Rainbow. The child buys and chooses them in **Lumi's room > Rugs** (`state.rug`, `state.rugs`).

## Move with Lumi (movement breaks)

The Break screen now has a **Move** button next to Music and Quiet. Breathing stays the default; Move swaps the middle of the screen for a short set of moves Lumi does with the child.

- **Pick:** Calm moves (slow stretches) or Energy moves (jumps and shakes). Grown-ups can lock it to one kind.
- **Go:** one move at a time, 3 for Little ones and 4 for everyone else, with a big picture, one short line, counting dots and Lumi doing the move.
- **Lumi shows how:** during a move Lumi gets arms and legs and acts it out in time with the count: arms swing up for jumping jacks, knees lift for marching, he tips side to side for a neck roll, presses on a wall for wall pushes, and sits on a chair for seated moves. Dotted arrows show which way to move. (The figure is drawn in `figureHtml` and moved frame by frame in `frame()`; each move's pose is in `POSES`.) Skip and Stop are always there. Nothing is timed against the child.
- **By age:** Little ones get animal moves (cat stretch, bear walk, bunny hops, starfish). Primary gets simple stretches and jumps. Secondary gets neck rolls, shoulder shrugs and jacks.
- **Seated:** every move has a chair version for children who use a wheelchair or need to stay seated.
- **Grown-ups > Break:** turn Move on or off, choose Calm, Energy or "Let the child choose", and switch on seated moves.

Code: `js/movebreak.js` (moves and steps), hooked into the Break screen in `js/kid.js`; styles are the `.mv-*` rules in `css/styles.css`.

## Chat with Lumi

A **Chat** button on Lumi's room at home opens a chat where the child talks to Lumi and Lumi talks back.
- **Picture chat** (everyone): picture buttons in groups (Feelings, I want, Ask Lumi, Fun). Little ones get one row of big pictures. Lumi asks questions too ("How are you today?") with picture answers.
- **Voice** (Primary and Teens by default; Grown-ups > Sensory can switch it on or off): a microphone button. Lumi understands simple words, and praises any sound it hears without words ("I heard you! Can you say it again?").
- **Keyboard** (Teens): type a message.
- Some replies lead somewhere: the calm corner, My day ("What's next?" shows the next step), games, stories, a break, or a big "I need help" card to show a grown-up.
- Everything Lumi says is written in `js/chat.js` (no AI, so grown-ups know exactly what Lumi can say). Voice uses the browser's speech service (Chrome or Safari) and needs the internet; picture chat works offline.

## Two-player games (with Lumi, or Together)

Each age group gets its own set of turn-taking games. The same game is played in two places:
**Fun > Games > With Lumi** (Lumi is the second player and takes its own turns) and **Together mode**
(the grown-up, sibling or friend is the second player on the same tablet). Grown-ups can switch each game
off in Grown-ups > Activities > Games. Easy, Medium and Challenge change the number of choices, rounds and hints.

| Age group | Games |
|---|---|
| Little ones | More, please! (ask for more on a tiny talk strip), Copy me, Peekaboo Lumi, Breathe together (both hold to grow the balloon), Feed the animals |
| Primary | Hawker uncle (order, serve, pay, say thank you), Find it, Music echo, Lumi says, Hide Lumi (yes/no questions), Build it together |
| Teens | Plan our outing, Would you rather?, Our silly story, Shop and pay, How would you feel?, Phone practice |

Code: `js/teamgames.js` (the shared frame and helpers), `js/tg-little.js`, `js/tg-primary.js`, `js/tg-teen.js`
(the games), with styles in `css/teamgames.css` and `css/tg-*.css`.

## How the age groups and difficulty levels differ

**Age group** (Grown-ups > Child) loads a whole pack and changes how Lumi looks and feels:

| | Little ones (3-6) | Primary (7-12) | Teens (13-18) |
|---|---|---|---|
| Look | Soft and round, big rounded buttons, Peach cream colours | Soft and round, Meadow colours | Soft and round, low-colour Stone colours, squarer buttons, no bouncing |
| Home | Extra-big pictures, time only (no date), stars but no streaks | Pictures and labels, stars and streaks | A few words under each button, "done today" instead of stars |
| Fun | Games, Stories, Learn, Pet, Dress up (no room shop) | Everything | Games, Stories, Learn |
| My day | 3 big step cards, no times or extra labels, picture-only Skip | 4 step cards with times | 5 smaller step cards, steps are task checklists with timers |
| Talk board | Starts on Easy (12 buttons) | Medium (24) | Challenge (35 + keyboard and an Out and about folder) |

**Difficulty** (Easy, Medium, Challenge) can be changed on its own, for any age:

| | Easy | Medium | Challenge |
|---|---|---|---|
| Talk board | 12 buttons | 24 buttons | 35 buttons and a keyboard |
| Feelings | 2 choices | 4 | 5 |
| Games | 3 pairs, 4-piece jigsaws, slower bubbles | 6 pairs, 6-piece jigsaws | 8 pairs, 9-piece jigsaws, no picture guide |
| Tutorials | Fewer steps, less rubbing | All main steps | Every step |
| My day games | Shorter: 2 foods at breakfast, 2 dishes at lunch and dinner, half the teeth already clean, 2 taps instead of 3, less rubbing and holding | The full game | The full game, more rubbing and holding, no glowing hints, and a teddy at meals that Lumi must not eat |

## Reading time and bath time in My day

- **Bath and shower** end with pyjamas: after drying off with the towel, the child slides the pyjamas onto Lumi. Bedtime starts with Lumi already in pyjamas (story, lights off, blanket).
- **Reading** lets the child pick *My own book* (Lumi reads on the beanbag, then the child reads a real book) or *Today's Lumi story* (a different story from the Stories shelf each day, or *Pick another story*). At "The end" the child taps *Back to My day* and the reading step is ticked off. Grown-ups set this in Settings > Play and breaks: *Child chooses*, *Their own book* or *A Lumi story*.

## One icon style

Every picture icon in the app (child screens, the talk board, the calm corner, games, rewards and the grown-up screens) is drawn the same way as the My day step icons: a soft dark outline, bright flat colours and a small white shine. Plain control marks (back, close, plus, minus, tick, arrows, pause) stay as simple rounded strokes so buttons stay calm.

## Run it

**Easiest:** double-click `web/index.html`. It opens in your browser and works straight away.

**In VS Code (recommended while you edit):**

1. In VS Code, choose **File › Open Folder** and open the `lumi\web` folder.
2. Open the Extensions panel (Ctrl+Shift+X), search for **Live Server** (by Ritwick Dey) and install it.
3. Click **Go Live** in the bottom-right status bar. The game opens in your browser and reloads every time you save a file.

**On a tablet:** with Live Server running, open `http://<your-laptop's-IP>:5500` in the tablet's browser while both are on the same Wi-Fi.
(Find your IP by typing `ipconfig` in a terminal and looking for "IPv4 Address".)

Use Chrome or Edge for Lumi's voice. Sound and voice only start after the first tap (browsers require that).

## How it is organised

| Area | What it does |
|---|---|
| First-run setup | A grown-up picks the age group (3–6, 7–12, 13–18), difficulty, the child's name and the colours. |
| Art style and colours | Lumi has one art style, **Soft and round**, everywhere. Grown-ups choose the colours (11 sets, including the calm "Soft (low colour)" and "Stone") at setup or any time in Grown-ups › Child. Each age group starts with its own colours. |
| Stars | Stars you earn and the stars you tap in the routine are glossy golden stars. |
| Main menu | **Play** (Solo), **Together** (with a grown-up, sibling or friend) and **Grown-ups** (press and hold). The menu is personal: the sky follows the real time of day (morning, afternoon, evening, a starry night with a sleepy Lumi), Lumi greets the child by name, the child's photo hangs on the wall, a speech bubble shows what is next today (tap to hear it), and tapping Lumi (here and on the Home screen) makes Lumi do a trick: a jump, a turn-around, a wiggle dance, a squishy bounce, a star jump with sparkles or a big hug with hearts, each with its own happy sound and line. The pet joins in, and at night Lumi does slower, sleepy tricks. The Play card shows little pictures of what is inside, and the Together card shows the child and their grown-up's photos. Photos are added in Grown-ups › Child. |
| Pause | The round **Pause** button (top right) is on every child screen. It opens **Keep going**, **Start again** and **Exit**, and lets the child pick Lumi's voice (Lumi, Girl, Boy, Grown-up, Robot). |
| Real time | Lumi reads the tablet's own clock, date and time zone. The time on screen updates by itself, the timetable follows it, and a new day starts at midnight. |
| Streaks | Do a few things with Lumi each day (the daily goal) to keep the flame going, like Duolingo. Lumi's shield saves the streak if a day is missed, and rest days never break it. Tap the flame to see the week and badges. |
| Badges | New skills earn a badge with a celebration: first checklist, first words, Teeth hero, Story explorer, 7 day streak and more. |
| Guide | The next button always glows. If the child waits, a tapping hand appears and Lumi says what to do. **Hint** shows it straight away. |
| Back | The arrow at the top-left goes back one screen. |
| Reminders | A small banner slides in: the next timetable step is soon, time for a break, drink some water. It never stops play. |

### Solo mode (home)

The home screen has only **Go** and four big tiles: **My day**, **Talk**, **Calm** and **Fun**. Fun holds Games, Stories, Learn, Pet, Dress up and Room.

| Tile | What to try |
|---|---|
| **Go** | Plays the part of today's real timetable that matches the clock. Before some steps there is a **Before you go** checklist (toilet, shoes, bag, water bottle, bus card…). Tick each one, then **Ready**. Steps can have surprise changes (bus late, rain), with **Help** to name the feeling, say it and calm down. Every step is played with Lumi, then **Your turn!** to do it for real (see below). There is no star tapping. |
| **Day** | What is happening now, what is next (and what to bring), and today's whole timetable. |
| **Talk** | An AAC-style board: a message bar, core words that never move, Fitzgerald Key colours, folders (Feelings, Phrases, Food, Play, Places, People, My words) and a keyboard on Challenge. 12, 24 or 35 buttons depending on difficulty. |
| **Calm** | Balloon breathing, squeeze, count, bells, plus calming music: Lullaby, Ocean waves, Soft rain, Floating, and **My music** (a song a grown-up uploaded). |
| **Play** | Bubbles (calm), Match (memory), Jigsaw, Sort it (everyday things) and What next? (patterns). No timers, no losing. |
| **Stories** | Story adventures with Lumi in places children really go: the dentist, a haircut, the supermarket, a birthday party, a new teacher, the polyclinic (queue number, doctor, pharmacy), lunch at the hawker centre (chope a seat, sold out, tray return), a fire drill at school, taking the MRT, taking the bus (check the number, wave it down, press the bell), the library (quiet voice, self-check machine), getting a vaccination (count 1-2-3, plaster, sticker), thunder (close the window, a cosy corner), a swimming lesson (free cubicle, shower, one step at a time) and what to do if you get lost (stay put, find someone who works there, show the card). Read aloud, with "What could Lumi do?" choices and things to tap. |
| **Learn** | Guided tutorials where Lumi does each step with the child: Brush teeth, Wash hands, Get dressed, Pack my bag, plus any the grown-ups made with their own photos. Tap, press and hold, rub with a finger, pick the right thing, or tap **I did it** after doing it for real. |
| **Room** | Buy things for Lumi's room with stars, then drag anything (and Lumi, with the rug and pet) to wherever the child likes. The last thing moved goes in front, Undo puts the last move back, and the room looks the same on the home screen. A soft music-box tune plays in the room and in Dress up (the music button turns it off; quiet mode and Sounds off keep it silent). |
| **Pet** | Unlocks after buying a pet in the Room. Feed, play, wash (rub) and put to sleep, like a Tamagotchi. It never gets sick; it just looks a bit sad until someone cares for it. The puppy and kitten also walk with Lumi on every child screen (home, the day's games, stories, calm corner), and wait outside during toilet and bath time. Grown-ups can turn this off in Settings › Play and breaks. |
| **Me / Room / Shop** | Dress up Lumi, draw a T-shirt, buy room items and clothes with stars. |

### Now & Next board (My day › Now & Next timer)

Two big pictures, **Now** and **Next** (for example "Now: teeth, Next: iPad"), and a timer the child can understand without numbers. Grown-ups choose the look: **Colour circle** (a pie of colour that slowly disappears), **Sand timer**, or **Lumi's walk** (Lumi walks along stepping stones to the Next picture). Lumi says "5 more minutes" and "1 more minute" with a soft chime, then "Time for iPad!". The timer keeps going if the child leaves the screen, and a gentle banner appears when time is up. It starts from today's timetable; grown-ups press and hold **Change** to pick anything for Now and Next (including fun things like iPad, playground, snack or a hug), the length and the timer look.

### Sensory quick-start

Five questions for grown-ups (sounds, movement, Lumi talking, processing time, busy colours) set the sound, animation, voice, pace and colours automatically, with a plain-English summary of what changed. Find it in Grown-ups › Sensory, or on the first setup screen.

### Familiar voice

Grown-ups › Sensory › **Your own voice for Lumi**: record key lines in your own voice (hello, well done, the timer lines, break, calm, and one line for every step in your timetable). When Lumi says one of those lines, your child hears you instead of the tablet voice. Recordings stay on the tablet (browser storage) and are never uploaded.

### Age packs

Choosing an age group (in setup, or Grown-ups › Child) loads a pack. Age sets the look, Lumi's words and the topics; difficulty stays a separate setting so it can match the child's ability (for example the Teens look on Easy). Grown-ups can still change anything afterwards.

| | Little ones (3–6) | Primary (7–12) | Teens (13–18) |
|---|---|---|---|
| Look | Soft and round, Peach cream colours, Easy, slow gentle voice, big Lumi | Meadow colours, Medium | Stone colours, Challenge, Calm grown-up voice, small Lumi |
| Example timetable | Kindergarten day: toilet, nap, bath, early bedtime | School day with the bus and checklists | Shower, MRT to school, laundry, homework, pack for tomorrow; weekends with chores, the hawker centre and cooking |
| Routine steps | Hands-on games with Lumi | Hands-on games with Lumi, live bus times | Task checklists with timers (bus step keeps live times) |
| Tutorials | Use the toilet, teeth, hands, get dressed | Canteen, pack my bag, teeth, hands, get dressed | Laundry, make a sandwich, order at the hawker centre, pack my bag, teeth, hands |
| Stories | Dentist, haircut, supermarket, party, new teacher, polyclinic, hawker centre, fire drill, bus, library, vaccination, thunder, swimming, getting lost | All of those plus Taking the MRT | Dentist, haircut, supermarket, polyclinic, hawker centre, fire drill, Taking the MRT, Asking for help at work, bus, library, vaccination, thunder, getting lost |
| Talk board | 12 buttons | 24 buttons | 35 buttons, keyboard and an **Out and about** folder ("Can you say that again?", "Please wait, I'm typing", "I use this app to talk", "How much is it?", "I am lost"…) |
| Rewards | Stars, stickers, pet, room | Streaks, badges, pet, room | "Done today" and streaks; pet, dress up and room hidden |
| Lumi says | "Yay! You did it!" | "Well done!" | "Done. Nice work." |

In Grown-ups › Child, changing the age loads the pack's look and activities straight away, then offers its example timetable separately (it replaces the current one, so it asks first). Grown-ups › Sensory has **How routine steps work**: Play with Lumi first, or Task checklist.

### Hands-on routine steps (play it with Lumi, then do it for real)

| Step | What the child does |
|---|---|
| Wake up | Tap the curtains to let the sun in, pull the blanket down, slide Lumi out of bed onto the rug. |
| Get dressed | Tap the wardrobe: the doors swing open and Lumi walks over. Tap Lumi to put the pyjamas in the laundry basket, then help Lumi choose a shirt, shorts and socks. Each one floats out of the wardrobe onto Lumi, and Lumi does a twirl at the end. |
| Teeth | Tap the toothpaste, brush the soft food bits off Lumi's big smile (foam appears as they brush), tap the cup to rinse. Then **Brush with Lumi**: a gentle 2-minute timer with music that says when to move to the bottom teeth, the insides and the tongue. |
| Breakfast | Slide toast, egg, banana and milk to Lumi's mouth until Lumi's tummy is full. |
| Bus | A bus stop with an arrival board. With live times on, it shows the real minutes for your bus (from LTA DataMall, the same data the MyTransport.SG app uses), plus the next bus, how full it is, single or double deck, and wheelchair access. The bus drives closer as the minutes go down. Lumi gives gentle reminders at the right moments: check your bag (10 min), time to walk to the stop (based on your walking time), stand behind the line (5 min), get your card ready (2 min). While waiting, the child picks a waiting game in the bottom bar: **Cars** (find the red car) or **Bubbles** (pop bubbles while Lumi counts). If the bus is late, Lumi says so calmly, offers an optional one-tap "How do you feel?" (Okay, Worried, Cross), then goes straight to **Play while we wait** with the new countdown, instead of a long feelings detour. When the bus arrives, they tap their card on the reader. Without live times it runs a short practice countdown. |

| Every other step | Toilet, nap, bedtime, bath, shower, school, lunch, dinner, homework, reading, play, park, tablet time, therapy, MRT, dentist, haircut, laundry, tidy my room, cooking, hawker centre, pack for tomorrow and work training each have their own scene of 2 to 4 actions with Lumi: tap (lamp, gate, swing), slide (food to Lumi's mouth, toys into the box, clothes into the machine), rub (scrub, wipe, stir, write) and press and hold (a slow breath, "open wide"). Grown-ups' own steps get a short "do it together" version with their photo. |

Every drag can also be done with a simple tap. A small **Skip** button goes straight to "Your turn". Grown-ups can switch these games off in Sensory.

### Break button

A **Break** button (an open hand) sits next to Pause on every child screen. It stops everything and opens a quiet break space: Lumi breathes slowly with the child ("Breathe in… breathe out"), with **Music**, **Quiet** (dims the screen and mutes all sound) and **Show a grown-up** (a big "I need a break" card with three soft notes). **I'm ready** goes back to exactly where they were. Each break is logged in Progress, never as a problem.

### Voices

Pick **who speaks** (Lumi, Girl, Boy, Grown-up woman, Grown-up man, Friendly robot) and **how it sounds** (Gentle, Calm and slow, Cheerful, Slow and clear, Quiet). Tapping one plays a short sample. The choices are in Grown-ups › Sensory, and in the child's Pause menu (if "Child can choose the voice" is on). Voice pace (Slow to Quick) still sets the overall speed. All voices are gentle and speak one sentence at a time; Lumi picks the best "natural" voice installed on the tablet and never uses the joke voices.

### Together mode

| Activity | What it does |
|---|---|
| Take turns | "Your turn to choose a card" → do the challenge → "Your turn, Mum!" invites the partner. Tick **We are using real cards** to play with a physical deck. |
| What could I say? | Everyday scenario cards (sharing a toy, a jar that won't open, food you don't like, a loud room…). Pick a picture response, see what happens, then try another way. |
| Feelings and help | The child shows how they feel and what would help (quiet time, help, move, hug, music, break…). The grown-up gets ideas, a jump counter and a break timer. Then: "How do you feel now?" |
| Team mission | Collect 3 stars together: ask for something, put a routine in order taking turns, and choose what helps Lumi calm down. Attempts count, not speed. |

### Grown-ups (press and hold the lock)

| Tab | What it does |
|---|---|
| Timetable | The weekly timetable. Steps have times, a name, what Lumi says, surprise changes, stars and a **Before this step** checklist (pick items or type your own). |
| Activities | Target skills (they get a star on the child's screens), which tiles, games and tutorials the child sees, **our own activities** (step-by-step tutorials with your photos) and talk-board words with photos. |
| Child | Name, age group, difficulty, usual Together partner, streak daily goal and rest days, **bus times** (live arrival times for the Bus step), **colours** (11 sets, including a low-colour "Soft" option), real-life goal. |
| Sensory | Hands-on routine games and the Break button (on or off), reduce animation, text size, sounds, Lumi's voice (and whether the child may change it), voice pace, music volume, upload the child's favourite song, guide hand, reminders. |
| Progress | How the child is doing: plain-English insights, right-first-try accuracy, how often the guide hand was needed (independence), minutes using Lumi, daily goals and streak, then this week's activity compared with last week, charts, skills, feelings shared and recent activity. |
| Journal | An observation journal: date and time, how the child was, tags (routine, meltdown, win…), notes, a photo and today's Lumi summary. Filter by tag, copy or download to share with teachers and therapists. |

Progress is saved in the browser on this device. Uploaded music is stored in the browser too (IndexedDB).

### Setting up live bus times

LTA DataMall's Bus Arrival API needs a free AccountKey, and it does not answer web pages on a tablet directly, so Lumi asks a tiny relay:

1. Get an AccountKey at https://datamall.lta.gov.sg (Request for API Access).
2. In Cloudflare (free): Workers & Pages › Create Worker, paste `tools/bus-relay-worker.js`, Deploy.
3. In the worker's Settings › Variables and secrets, add a secret `LTA_KEY` with your AccountKey.
4. In Lumi: Grown-ups › Child › Bus times. Turn on live times, enter the bus stop number (5 digits, printed on the bus stop sign) and bus number, paste the worker link, then tap **Check bus times now**.

## Files

```
web/
  index.html        the page
  css/styles.css    colours (brand tokens at the top) and every screen's layout
  js/icons.js       icons, including the colour pictures (teeth, breakfast, school, checklist things)
  js/lumi.js        draws Lumi, feeling faces and every item
  js/agepacks.js    age packs: Little ones, Primary, Teens (timetables, tutorials, stories, task lists, tone)
  js/data.js        all the content: steps, timetables, checklist things, talk words, games, tutorials, scenarios, missions, themes
  js/audio.js       calming music made live in the browser, and "My music"
  js/app.js         core: setup, menu, home, timetable game, checklist, feelings, calm, rewards, room, dress up, reminders
  js/kid.js         pause menu, Break button and break space, voices, the live clock, streaks, skill badges, "My stars" screen
  js/nownext.js     Now & Next board with kid-friendly timers
  js/familiar.js    record Lumi's lines in a grown-up's own voice
  js/quickstart.js  sensory quick-start questions
  js/daygames.js    the scene engine and a Lumi scene for every other part of the day
  js/routinegames.js hands-on routine steps: wake up, brush teeth, breakfast, bus (live LTA bus times)
  js/aac.js         the AAC talk board
  js/play.js        the Play area games
  js/learn.js       Learn with Lumi hub, and the simple photo player for grown-ups' own lessons
  js/learn-*.js     the real-life lessons: teeth, bath (hands, toilet), bedroom (dress, pack), life (canteen, sandwich, laundry)
  js/pet.js         the Pet corner, and the pets that walk with Lumi
  js/rugs.js        Lumi's rug under his feet on every floor, and the rugs in Lumi's room
  js/together.js    Together mode
  js/stories.js     story adventures
  js/caregiver.js   Grown-ups tabs (activities, child, sensory, progress, journal)
  js/pics.js        drawn pictures in place of emoji (shading toolkit + the emoji swapper)
  js/pics-*.js      the pictures: food and nature, things and places, symbols, faces and actions
  js/people.js      full-body people (parents, teachers, dentist, hawker uncle...)
  js/stories.js     the interactive story engine (A.SX)
  js/story-life.js  stories: taking the bus, the library, a vaccination, thunder, swimming lesson, if I get lost
  js/story-*.js     the stories: hawker centre, care (dentist, haircut, polyclinic), outings, school and work
  js/native.js      native app extras (Android voice, notifications, back button); nothing in a browser
  js/store.js       grown-ups-only check, privacy summary
  js/appicons.js    choose the app icon (Grown-ups › Child)
  js/profiles.js    more than one child on a tablet (Who is playing?)
  js/waitgame.js    the Waiting game
  js/feelchart.js   Progress: feelings and breaks over time, and patterns
  js/lang.js        home language: Chinese, Malay and Tamil words and voice
  js/comingup.js    Coming up stories (social stories) with a countdown, in My day on the day
  js/offline.js     backup and restore, and installing Lumi to work without internet
  js/main.js        starts the app
tools/
  bus-relay-worker.js  a tiny Cloudflare Worker that fetches LTA bus arrival times for Lumi
```

### Common changes

- **Add a routine step:** add it to `STEPS` in `js/data.js`.
- **Add a checklist thing:** add it to `CHECK_ITEMS` in `js/data.js` and draw its icon in `js/icons.js`.
- **Add a talk word:** add it to a folder in `WORDS` in `js/data.js` (`t` is its Fitzgerald colour type).
- **Add a tutorial:** add it to `LEARN` in `js/data.js` (`act` is tap, hold, rub, pick or done).
- **Add a scenario card or mission:** edit `SCENARIOS` or `MISSIONS` in `js/data.js`.
- **Add a story:** add it to `STORIES` in `js/data.js` (scenes: home, waiting, dentist, barber, shop, party, classroom).
- **Add a badge:** add it to `SKILL_BADGES` in `js/data.js`.
- **Change what the guide hand points at:** edit `GUIDE` in `js/app.js` (or `A.GUIDE.<screen>` in the feature files).
- **Change colours or themes:** edit the tokens at the top of `css/styles.css` and `THEMES` in `js/data.js`.

Some pictures (food, people, places, toys) use emoji as placeholders. For a real release, swap them for a proper symbol set such as ARASAAC or Mulberry Symbols (both free to use).

In the browser console, `LumiDebug.state` shows the saved progress and `LumiDebug.go('cgProgress')` jumps to a screen.

---
# Lumi: web prototype

A playable prototype of **Lumi**, a tablet game for non-speaking children and young people with special needs.
It focuses on routines, communication and emotional regulation, with three modes: **Solo**, **Together** and **Grown-ups**.

It is plain HTML, CSS and JavaScript. There is nothing to install and no build step.

## Fits any screen

Lumi fills the whole screen on any device held sideways: phones, iPads (any size), Android tablets, laptops and big monitors, with no black bars. It is designed on a 1194 × 834 landscape "stage"; `fit()` in `js/app.js` keeps that height (or width) and stretches the other side to match the screen's shape, so the flexible screens simply grow. The story and lesson pictures are scaled to use the space too (`fitScene()` in `js/stories.js`): on a wide screen such as a phone or a 16:9 laptop the picture fills the height and the words move into a column beside it. The notch and home bar are kept clear, and the strip around them takes the colour of the current screen. Held upright, a phone or tablet shows "Turn me sideways". A desktop browser window narrower than it is tall shows the app with thin edges.

## Home language (Chinese, Malay, Tamil)

Grown-ups › Sensory › **Home language**. Pick 华文, Bahasa Melayu or தமிழ் and:

- the talk board, feelings and My day show the home-language word under each English word
- Lumi speaks English, the home language, or both (English first, then the home language)
- **Change words** lets a family use its own words (for example 婆婆 instead of 奶奶 for Grandma); photo words in Activities get their own translation box
- the screen says whether this tablet has a voice for the language. Without one, the words still show and Lumi speaks English (add voices in the iPad's Settings › Accessibility › Spoken Content › Voices, or Android's Text-to-speech settings)

The talk board reads a message word by word, which suits Chinese and Malay well; Tamil word order differs, so the Phrases folder (whole sentences) sounds more natural. All translations (`js/lang.js`) should be checked by a native speaker before a real release, Tamil especially.

## Ready for the App Store and Google Play

- **Nothing loads from the internet.** The font is kept in the app (`css/fonts.css`; put `Nunito-Variable.ttf` in `fonts/`, see `fonts/README.txt`; without it Lumi uses the tablet's own rounded font).
- **Online features are off until a grown-up turns them on:** the microphone in Chat (behind a grown-ups-only check, `A.parentGate` in `js/store.js`) and live bus times (needs a relay link).
- **Privacy:** Grown-ups › Child › Privacy says what Lumi keeps (everything stays on the tablet). `privacy.html` is the privacy policy to host and link from the stores (fill in your email).
- **Tap instead of drag** and **High contrast** (Grown-ups › Sensory), for children who find dragging hard or need stronger outlines. In Learn, "Do it with me" helps with any step, including press-and-hold.
- **Reminders wait** until a story or lesson step is finished.
- **The native app** (iPad, iPhone, Android) is in `../app` (Capacitor). `js/native.js` adds the native voice on Android, timetable reminders as notifications when Lumi is closed (Grown-ups › Child › Reminders when Lumi is closed), the Android back button, and the splash screen; in a browser it does nothing. See `../app/STORE-GUIDE.md` and `../app/store/listing.md`; App Store screenshots are in `../app/store/screenshots/`.

## App icon

Grown-ups › Child › **App icon**: choose the picture for Lumi on the tablet's home screen from twelve designs (Lumi's face, Peekaboo, Little light, Hello wave, Wordmark, Talk and feel, Wonder, Cosy blanket, Sunny day, Glow on teal, Moon and spark, Corner peek) or the original. The choice belongs to the tablet, not to one child. It changes the browser tab icon, the iPad/iPhone home-screen icon and the install icons (including Android's round "maskable" icon). A home-screen icon is copied when Lumi is added, so if Lumi is already on the home screen, remove it and add it again. The pictures are `icons/app-<name>-180|192|512.png` and `app-<name>-mask-512.png` (`js/appicons.js`).

## Learn with Lumi (real-life lessons)

Fun › **Learn**. Every built-in lesson is now a real place the child acts out with Lumi, on the story engine (`js/learn-*.js`), instead of tapping a picture:

- **Brush teeth** (`learn-teeth.js`): pull the step stool to the sink, turn on the tap and wet the brush, press and hold for a pea of toothpaste, then the mirror view: brush the top teeth, the bottom teeth, the back teeth and the tongue (Lumi counts to ten), spit, rinse with the cup, put the brush back and turn off the tap, and smile in the mirror. The mouth is friendly: teeth inside the mouth, the tongue behind the bottom teeth.
- **Wash hands** and **Use the toilet** (`learn-bath.js`), **Get dressed** and **Pack my bag** (`learn-bedroom.js`), **Buy food at the canteen**, **Make a sandwich** and **Do the laundry** (`learn-life.js`). Teens' "Order at the hawker centre" opens the hawker story.

How every lesson helps a child who has never done the task and is scared to try:

- **Watch, then do.** Lumi shows each new step first with a see-through hand (after the words are read), then the child tries. Grown-ups › Sensory › "Lumi shows each step first" turns this off.
- **Show me** is always in the bar: tap it to see the step again. After that, **Do it with me** does the step together with Lumi, so nobody gets stuck.
- One small action per step, written in the bar as well as spoken, big things to drag, nothing timed and nothing marked wrong. Easy has fewer steps; Medium and Challenge add steps (like the back teeth and the tongue).
- The cards say how many small steps a lesson has.
- At the end: **Try it for real**. When the child really does it, they tap "I did it for real" for a star (logged for grown-ups, and it counts towards the skill badges).

Lessons a grown-up makes with photos (Grown-ups › Activities) still use the simple photo player.

## Gentler pace

- **My day** shows the one thing to do now in words in the bar ("Tap the curtains."), not only spoken.
- Little ones see just **Now** and **Next** at the top of My day, not a long list of jobs.
- Badges and streak celebrations wait until the child has finished the step (or the story or game), so they never pop up in the middle of a task.
- In stories and lessons, the hint hand waits longer, so it never rushes in on top of Lumi showing the step.

## Waiting game

Fun › Games › **Waiting game**. Gentle practice for waiting: the child picks the bus, food cooking or a queue. A timer ring empties while the bus drives closer, the pot steams or the queue gets shorter, and Lumi waits calmly with them, saying what helps. While waiting they can breathe, count, squeeze, or look around (find three things in the picture). "It's too hard" is always there: the first time Lumi helps wait just 5 more seconds, the second time the wait ends kindly. Waits start short (Easy 10 s, Medium 20 s, Challenge 30 s) and grow by 5 seconds each time the child waits all the way (`js/waitgame.js`).

## More than one child on a tablet

Grown-ups › Child › **Children on this tablet**: add a child (they go through setup), switch, or remove. Each child has their own Lumi, timetable, words, stories, stars and progress. When there is more than one, Lumi opens on **Who is playing?** and the menu shows a Switch chip. Voice recordings and uploaded music are shared. Backups save the child who is playing (`js/profiles.js`).

## Feelings and breaks over time

Grown-ups › **Progress** › Feelings and breaks: a week at a glance (feelings with the hard ones ringed, breaks, waiting practice, and what was different about each day: occasional timetable steps, Coming up events, plan changes, journal notes), with earlier weeks one tap away. Below it, Lumi points out patterns from the last four weeks in plain words, such as harder days with a certain step, school days compared with days off, plan changes, the time of day and activity most breaks happen in, harder weekdays, and what helps most while waiting. Every feeling, break and change is now kept with its time and place (`js/feelchart.js`).

## Story adventures (interactive real-life practice)

Fun › Stories. Each story is a set of scenes the child acts out with Lumi, with guidance at every step: Lumi says what is happening and what to do, the guide hand shows where, and wrong tries get a kind hint instead of a "no". Choices carry through the story.

- **Lunch at the hawker centre:** choose what helps with the noise (headphones really go on), chope a free table by dragging the tissue packet (busy and already-choped tables explain why not), pick a stall, wait in the queue and step forward when it moves, order from the menu (one dish is sold out), say the order with a talk card, pay by cash, card or phone, carry the tray to your table, eat, take the tissue back and return the tray.
- **Dentist, Haircut (with the mirror view), Polyclinic, Supermarket, MRT, Birthday party, New teacher, Fire drill, Asking for help at work:** the same kind of hands-on scenes for each place.
- Everyone in the stories is a full-body character (`js/people.js`): parents, grandparents, teachers, dentist, doctor, hairdresser, hawker uncle and aunty, cashier, MRT staff and more.
- Payments use one guided step for all stories (`SX.payStep`): cash (drag notes and coins until it adds up, then take the change), card (tap on the reader) or phone (scan the QR code).

Code: the engine is `js/stories.js` (the `A.SX` helpers are explained at the top); each story is its own file (`js/story-hawker.js`, `js/story-care.js`, `js/story-out.js`, `js/story-school.js`, `js/story-life.js`).

## No emoji: drawn pictures everywhere

Lumi shows no emoji. Every picture (talk board, stories, games, settings) is a drawing with soft shading (`js/pics.js` and `js/pics-food.js`, `js/pics-things.js`, `js/pics-symbols.js`). If an emoji is still written somewhere in the data, `js/pics.js` swaps it for its drawing the moment it appears on screen. To add a picture: `LP.add('<emoji or name>', { label: 'Apple', svg: '...48 x 48 drawing...' })`.

## Coming up stories (social stories)

Grown-ups › **Coming up** prepares a child for something new or different. Pick a ready-made story (dentist, doctor, haircut, new school, visitors, birthday party, a new place, change of plan, or your own), set the date and time, edit the sentences and add real photos.

- From a few days before (3 days, 1 week or 2 weeks), Lumi's home screen shows a countdown: "3 sleeps until Dentist", with a moon for each sleep. Tapping it opens the story.
- The story reader: a countdown cover, the grown-up's pages read aloud by Lumi, then "How do you feel about it?" (happy, worried, scared) and "I'm ready". The answer shows in Progress.
- On the day the event joins My day at its time, with the story ready to read before going (it can be turned off per story).

Code: `js/comingup.js`; the stories live in `state.comingUp`.

## Backup and use without internet

Grown-ups › Child › **Backup and offline**.

- **Save a backup** downloads one file (`lumi-backup-<name>-<date>.json`) with progress, timetable, words, stories, settings and photos. **Restore from a backup** loads it on this or another tablet (it asks first, because it replaces everything). Voice recordings and your own music are not included.
- **Use without internet:** when Lumi is opened from a web address (not by double-clicking the file), `sw.js` keeps every file on the tablet, so Lumi opens and works with no Wi-Fi. Add it to the home screen (iPad: Safari › Share › Add to Home Screen; Android: browser menu › Install app) and it opens full-screen with its own icon (`manifest.webmanifest`, `icons/`). A free way to host it is GitHub Pages: upload the `web` folder to a repository and turn on Pages.
- When you add or rename a file, add it to the list in `sw.js` and change `VERSION` there, so tablets pick up the new version (it shows the next time Lumi is opened).

## Lumi's rug and floors

Lumi never stands on a plain flat floor. Floors have soft floorboards, and wherever Lumi stands on a floor (menu, home, chat, room, games) a cute rug is laid under his feet, with his pets on it too. The wake-up game's "slide Lumi onto the rug" uses the same rug.

- `js/rugs.js` draws the rugs and places one under Lumi after every screen is drawn. Screens where Lumi is not on the floor (in bed, in the bath, at the table) get no rug.
- Rugs: Cloud (free), Bear, Flower, Stripy, Starry and Rainbow. The child buys and chooses them in **Lumi's room > Rugs** (`state.rug`, `state.rugs`).

## Move with Lumi (movement breaks)

The Break screen now has a **Move** button next to Music and Quiet. Breathing stays the default; Move swaps the middle of the screen for a short set of moves Lumi does with the child.

- **Pick:** Calm moves (slow stretches) or Energy moves (jumps and shakes). Grown-ups can lock it to one kind.
- **Go:** one move at a time, 3 for Little ones and 4 for everyone else, with a big picture, one short line, counting dots and Lumi doing the move.
- **Lumi shows how:** during a move Lumi gets arms and legs and acts it out in time with the count: arms swing up for jumping jacks, knees lift for marching, he tips side to side for a neck roll, presses on a wall for wall pushes, and sits on a chair for seated moves. Dotted arrows show which way to move. (The figure is drawn in `figureHtml` and moved frame by frame in `frame()`; each move's pose is in `POSES`.) Skip and Stop are always there. Nothing is timed against the child.
- **By age:** Little ones get animal moves (cat stretch, bear walk, bunny hops, starfish). Primary gets simple stretches and jumps. Secondary gets neck rolls, shoulder shrugs and jacks.
- **Seated:** every move has a chair version for children who use a wheelchair or need to stay seated.
- **Grown-ups > Break:** turn Move on or off, choose Calm, Energy or "Let the child choose", and switch on seated moves.

Code: `js/movebreak.js` (moves and steps), hooked into the Break screen in `js/kid.js`; styles are the `.mv-*` rules in `css/styles.css`.

## Chat with Lumi

A **Chat** button on Lumi's room at home opens a chat where the child talks to Lumi and Lumi talks back.
- **Picture chat** (everyone): picture buttons in groups (Feelings, I want, Ask Lumi, Fun). Little ones get one row of big pictures. Lumi asks questions too ("How are you today?") with picture answers.
- **Voice** (Primary and Teens by default; Grown-ups > Sensory can switch it on or off): a microphone button. Lumi understands simple words, and praises any sound it hears without words ("I heard you! Can you say it again?").
- **Keyboard** (Teens): type a message.
- Some replies lead somewhere: the calm corner, My day ("What's next?" shows the next step), games, stories, a break, or a big "I need help" card to show a grown-up.
- Everything Lumi says is written in `js/chat.js` (no AI, so grown-ups know exactly what Lumi can say). Voice uses the browser's speech service (Chrome or Safari) and needs the internet; picture chat works offline.

## Two-player games (with Lumi, or Together)

Each age group gets its own set of turn-taking games. The same game is played in two places:
**Fun > Games > With Lumi** (Lumi is the second player and takes its own turns) and **Together mode**
(the grown-up, sibling or friend is the second player on the same tablet). Grown-ups can switch each game
off in Grown-ups > Activities > Games. Easy, Medium and Challenge change the number of choices, rounds and hints.

| Age group | Games |
|---|---|
| Little ones | More, please! (ask for more on a tiny talk strip), Copy me, Peekaboo Lumi, Breathe together (both hold to grow the balloon), Feed the animals |
| Primary | Hawker uncle (order, serve, pay, say thank you), Find it, Music echo, Lumi says, Hide Lumi (yes/no questions), Build it together |
| Teens | Plan our outing, Would you rather?, Our silly story, Shop and pay, How would you feel?, Phone practice |

Code: `js/teamgames.js` (the shared frame and helpers), `js/tg-little.js`, `js/tg-primary.js`, `js/tg-teen.js`
(the games), with styles in `css/teamgames.css` and `css/tg-*.css`.

## How the age groups and difficulty levels differ

**Age group** (Grown-ups > Child) loads a whole pack and changes how Lumi looks and feels:

| | Little ones (3-6) | Primary (7-12) | Teens (13-18) |
|---|---|---|---|
| Look | Soft and round, big rounded buttons, Peach cream colours | Soft and round, Meadow colours | Soft and round, low-colour Stone colours, squarer buttons, no bouncing |
| Home | Extra-big pictures, time only (no date), stars but no streaks | Pictures and labels, stars and streaks | A few words under each button, "done today" instead of stars |
| Fun | Games, Stories, Learn, Pet, Dress up (no room shop) | Everything | Games, Stories, Learn |
| My day | 3 big step cards, no times or extra labels, picture-only Skip | 4 step cards with times | 5 smaller step cards, steps are task checklists with timers |
| Talk board | Starts on Easy (12 buttons) | Medium (24) | Challenge (35 + keyboard and an Out and about folder) |

**Difficulty** (Easy, Medium, Challenge) can be changed on its own, for any age:

| | Easy | Medium | Challenge |
|---|---|---|---|
| Talk board | 12 buttons | 24 buttons | 35 buttons and a keyboard |
| Feelings | 2 choices | 4 | 5 |
| Games | 3 pairs, 4-piece jigsaws, slower bubbles | 6 pairs, 6-piece jigsaws | 8 pairs, 9-piece jigsaws, no picture guide |
| Tutorials | Fewer steps, less rubbing | All main steps | Every step |
| My day games | Shorter: 2 foods at breakfast, 2 dishes at lunch and dinner, half the teeth already clean, 2 taps instead of 3, less rubbing and holding | The full game | The full game, more rubbing and holding, no glowing hints, and a teddy at meals that Lumi must not eat |

## Reading time and bath time in My day

- **Bath and shower** end with pyjamas: after drying off with the towel, the child slides the pyjamas onto Lumi. Bedtime starts with Lumi already in pyjamas (story, lights off, blanket).
- **Reading** lets the child pick *My own book* (Lumi reads on the beanbag, then the child reads a real book) or *Today's Lumi story* (a different story from the Stories shelf each day, or *Pick another story*). At "The end" the child taps *Back to My day* and the reading step is ticked off. Grown-ups set this in Settings > Play and breaks: *Child chooses*, *Their own book* or *A Lumi story*.

## One icon style

Every picture icon in the app (child screens, the talk board, the calm corner, games, rewards and the grown-up screens) is drawn the same way as the My day step icons: a soft dark outline, bright flat colours and a small white shine. Plain control marks (back, close, plus, minus, tick, arrows, pause) stay as simple rounded strokes so buttons stay calm.

## Run it

**Easiest:** double-click `web/index.html`. It opens in your browser and works straight away.

**In VS Code (recommended while you edit):**

1. In VS Code, choose **File › Open Folder** and open the `lumi\web` folder.
2. Open the Extensions panel (Ctrl+Shift+X), search for **Live Server** (by Ritwick Dey) and install it.
3. Click **Go Live** in the bottom-right status bar. The game opens in your browser and reloads every time you save a file.

**On a tablet:** with Live Server running, open `http://<your-laptop's-IP>:5500` in the tablet's browser while both are on the same Wi-Fi.
(Find your IP by typing `ipconfig` in a terminal and looking for "IPv4 Address".)

Use Chrome or Edge for Lumi's voice. Sound and voice only start after the first tap (browsers require that).

## How it is organised

| Area | What it does |
|---|---|
| First-run setup | A grown-up picks the age group (3–6, 7–12, 13–18), difficulty, the child's name and the colours. |
| Art style and colours | Lumi has one art style, **Soft and round**, everywhere. Grown-ups choose the colours (11 sets, including the calm "Soft (low colour)" and "Stone") at setup or any time in Grown-ups › Child. Each age group starts with its own colours. |
| Stars | Stars you earn and the stars you tap in the routine are glossy golden stars. |
| Main menu | **Play** (Solo), **Together** (with a grown-up, sibling or friend) and **Grown-ups** (press and hold). The menu is personal: the sky follows the real time of day (morning, afternoon, evening, a starry night with a sleepy Lumi), Lumi greets the child by name, the child's photo hangs on the wall, a speech bubble shows what is next today (tap to hear it), and tapping Lumi (here and on the Home screen) makes Lumi do a trick: a jump, a turn-around, a wiggle dance, a squishy bounce, a star jump with sparkles or a big hug with hearts, each with its own happy sound and line. The pet joins in, and at night Lumi does slower, sleepy tricks. The Play card shows little pictures of what is inside, and the Together card shows the child and their grown-up's photos. Photos are added in Grown-ups › Child. |
| Pause | The round **Pause** button (top right) is on every child screen. It opens **Keep going**, **Start again** and **Exit**, and lets the child pick Lumi's voice (Lumi, Girl, Boy, Grown-up, Robot). |
| Real time | Lumi reads the tablet's own clock, date and time zone. The time on screen updates by itself, the timetable follows it, and a new day starts at midnight. |
| Streaks | Do a few things with Lumi each day (the daily goal) to keep the flame going, like Duolingo. Lumi's shield saves the streak if a day is missed, and rest days never break it. Tap the flame to see the week and badges. |
| Badges | New skills earn a badge with a celebration: first checklist, first words, Teeth hero, Story explorer, 7 day streak and more. |
| Guide | The next button always glows. If the child waits, a tapping hand appears and Lumi says what to do. **Hint** shows it straight away. |
| Back | The arrow at the top-left goes back one screen. |
| Reminders | A small banner slides in: the next timetable step is soon, time for a break, drink some water. It never stops play. |

### Solo mode (home)

The home screen has only **Go** and four big tiles: **My day**, **Talk**, **Calm** and **Fun**. Fun holds Games, Stories, Learn, Pet, Dress up and Room.

| Tile | What to try |
|---|---|
| **Go** | Plays the part of today's real timetable that matches the clock. Before some steps there is a **Before you go** checklist (toilet, shoes, bag, water bottle, bus card…). Tick each one, then **Ready**. Steps can have surprise changes (bus late, rain), with **Help** to name the feeling, say it and calm down. Every step is played with Lumi, then **Your turn!** to do it for real (see below). There is no star tapping. |
| **Day** | What is happening now, what is next (and what to bring), and today's whole timetable. |
| **Talk** | An AAC-style board: a message bar, core words that never move, Fitzgerald Key colours, folders (Feelings, Phrases, Food, Play, Places, People, My words) and a keyboard on Challenge. 12, 24 or 35 buttons depending on difficulty. |
| **Calm** | Balloon breathing, squeeze, count, bells, plus calming music: Lullaby, Ocean waves, Soft rain, Floating, and **My music** (a song a grown-up uploaded). |
| **Play** | Bubbles (calm), Match (memory), Jigsaw, Sort it (everyday things) and What next? (patterns). No timers, no losing. |
| **Stories** | Story adventures with Lumi in places children really go: the dentist, a haircut, the supermarket, a birthday party, a new teacher, the polyclinic (queue number, doctor, pharmacy), lunch at the hawker centre (chope a seat, sold out, tray return), a fire drill at school, taking the MRT, taking the bus (check the number, wave it down, press the bell), the library (quiet voice, self-check machine), getting a vaccination (count 1-2-3, plaster, sticker), thunder (close the window, a cosy corner), a swimming lesson (free cubicle, shower, one step at a time) and what to do if you get lost (stay put, find someone who works there, show the card). Read aloud, with "What could Lumi do?" choices and things to tap. |
| **Learn** | Guided tutorials where Lumi does each step with the child: Brush teeth, Wash hands, Get dressed, Pack my bag, plus any the grown-ups made with their own photos. Tap, press and hold, rub with a finger, pick the right thing, or tap **I did it** after doing it for real. |
| **Room** | Buy things for Lumi's room with stars, then drag anything (and Lumi, with the rug and pet) to wherever the child likes. The last thing moved goes in front, Undo puts the last move back, and the room looks the same on the home screen. A soft music-box tune plays in the room and in Dress up (the music button turns it off; quiet mode and Sounds off keep it silent). |
| **Pet** | Unlocks after buying a pet in the Room. Care is hands-on, like a Tamagotchi. **Feed:** drag food into the bowl and the pet trots over to eat. **Play:** drag the toy and let go to throw it; the pet runs to fetch it, and tapping the pet tickles it. **Wash:** a bath, with soap to rub on (bubbles), the shower to rinse and a towel to dry, one tool at a time. **Sleep:** drag the pet onto its bed, drag the blanket over it, tap the lamp; the room goes dark and a lullaby plays while the sleep bar fills (tap the pet or Wake up). The fish has its own version: drop food in the tank, move a finger on the glass for it to follow, wipe the green off with a sponge, turn off the tank light. Tap instead of drag works for all of it. It never gets sick; it just looks a bit sad until someone cares for it. The puppy and kitten also walk with Lumi on every child screen (home, the day's games, stories, calm corner), and wait outside during toilet and bath time. Grown-ups can turn this off in Settings › Play and breaks. |
| **Me / Room / Shop** | Dress up Lumi, draw a T-shirt, buy room items and clothes with stars. |

### Now & Next board (My day › Now & Next timer)

Two big pictures, **Now** and **Next** (for example "Now: teeth, Next: iPad"), and a timer the child can understand without numbers. Grown-ups choose the look: **Colour circle** (a pie of colour that slowly disappears), **Sand timer**, or **Lumi's walk** (Lumi walks along stepping stones to the Next picture). Lumi says "5 more minutes" and "1 more minute" with a soft chime, then "Time for iPad!". The timer keeps going if the child leaves the screen, and a gentle banner appears when time is up. It starts from today's timetable; grown-ups press and hold **Change** to pick anything for Now and Next (including fun things like iPad, playground, snack or a hug), the length and the timer look.

### Sensory quick-start

Five questions for grown-ups (sounds, movement, Lumi talking, processing time, busy colours) set the sound, animation, voice, pace and colours automatically, with a plain-English summary of what changed. Find it in Grown-ups › Sensory, or on the first setup screen.

### Familiar voice

Grown-ups › Sensory › **Your own voice for Lumi**: record key lines in your own voice (hello, well done, the timer lines, break, calm, and one line for every step in your timetable). When Lumi says one of those lines, your child hears you instead of the tablet voice. Recordings stay on the tablet (browser storage) and are never uploaded.

### Age packs

Choosing an age group (in setup, or Grown-ups › Child) loads a pack. Age sets the look, Lumi's words and the topics; difficulty stays a separate setting so it can match the child's ability (for example the Teens look on Easy). Grown-ups can still change anything afterwards.

| | Little ones (3–6) | Primary (7–12) | Teens (13–18) |
|---|---|---|---|
| Look | Soft and round, Peach cream colours, Easy, slow gentle voice, big Lumi | Meadow colours, Medium | Stone colours, Challenge, Calm grown-up voice, small Lumi |
| Example timetable | Kindergarten day: toilet, nap, bath, early bedtime | School day with the bus and checklists | Shower, MRT to school, laundry, homework, pack for tomorrow; weekends with chores, the hawker centre and cooking |
| Routine steps | Hands-on games with Lumi | Hands-on games with Lumi, live bus times | Task checklists with timers (bus step keeps live times) |
| Tutorials | Use the toilet, teeth, hands, get dressed | Canteen, pack my bag, teeth, hands, get dressed | Laundry, make a sandwich, order at the hawker centre, pack my bag, teeth, hands |
| Stories | Dentist, haircut, supermarket, party, new teacher, polyclinic, hawker centre, fire drill, bus, library, vaccination, thunder, swimming, getting lost | All of those plus Taking the MRT | Dentist, haircut, supermarket, polyclinic, hawker centre, fire drill, Taking the MRT, Asking for help at work, bus, library, vaccination, thunder, getting lost |
| Talk board | 12 buttons | 24 buttons | 35 buttons, keyboard and an **Out and about** folder ("Can you say that again?", "Please wait, I'm typing", "I use this app to talk", "How much is it?", "I am lost"…) |
| Rewards | Stars, stickers, pet, room | Streaks, badges, pet, room | "Done today" and streaks; pet, dress up and room hidden |
| Lumi says | "Yay! You did it!" | "Well done!" | "Done. Nice work." |

In Grown-ups › Child, changing the age loads the pack's look and activities straight away, then offers its example timetable separately (it replaces the current one, so it asks first). Grown-ups › Sensory has **How routine steps work**: Play with Lumi first, or Task checklist.

### Hands-on routine steps (play it with Lumi, then do it for real)

| Step | What the child does |
|---|---|
| Wake up | Tap the curtains to let the sun in, pull the blanket down, slide Lumi out of bed onto the rug. |
| Get dressed | Tap the wardrobe: the doors swing open and Lumi walks over. Tap Lumi to put the pyjamas in the laundry basket, then help Lumi choose a shirt, shorts and socks. Each one floats out of the wardrobe onto Lumi, and Lumi does a twirl at the end. |
| Teeth | Tap the toothpaste, brush the soft food bits off Lumi's big smile (foam appears as they brush), tap the cup to rinse. Then **Brush with Lumi**: a gentle 2-minute timer with music that says when to move to the bottom teeth, the insides and the tongue. |
| Breakfast | Slide toast, egg, banana and milk to Lumi's mouth until Lumi's tummy is full. |
| Bus | A bus stop with an arrival board. With live times on, it shows the real minutes for your bus (from LTA DataMall, the same data the MyTransport.SG app uses), plus the next bus, how full it is, single or double deck, and wheelchair access. The bus drives closer as the minutes go down. Lumi gives gentle reminders at the right moments: check your bag (10 min), time to walk to the stop (based on your walking time), stand behind the line (5 min), get your card ready (2 min). While waiting, the child picks a waiting game in the bottom bar: **Cars** (find the red car) or **Bubbles** (pop bubbles while Lumi counts). If the bus is late, Lumi says so calmly, offers an optional one-tap "How do you feel?" (Okay, Worried, Cross), then goes straight to **Play while we wait** with the new countdown, instead of a long feelings detour. When the bus arrives, they tap their card on the reader. Without live times it runs a short practice countdown. |

| Every other step | Toilet, nap, bedtime, bath, shower, school, lunch, dinner, homework, reading, play, park, tablet time, therapy, MRT, dentist, haircut, laundry, tidy my room, cooking, hawker centre, pack for tomorrow and work training each have their own scene of 2 to 4 actions with Lumi: tap (lamp, gate, swing), slide (food to Lumi's mouth, toys into the box, clothes into the machine), rub (scrub, wipe, stir, write) and press and hold (a slow breath, "open wide"). Grown-ups' own steps get a short "do it together" version with their photo. |

Every drag can also be done with a simple tap. A small **Skip** button goes straight to "Your turn". Grown-ups can switch these games off in Sensory.

### Break button

A **Break** button (an open hand) sits next to Pause on every child screen. It stops everything and opens a quiet break space: Lumi breathes slowly with the child ("Breathe in… breathe out"), with **Music**, **Quiet** (dims the screen and mutes all sound) and **Show a grown-up** (a big "I need a break" card with three soft notes). **I'm ready** goes back to exactly where they were. Each break is logged in Progress, never as a problem.

### Voices

Pick **who speaks** (Lumi, Girl, Boy, Grown-up woman, Grown-up man, Friendly robot) and **how it sounds** (Gentle, Calm and slow, Cheerful, Slow and clear, Quiet). Tapping one plays a short sample. The choices are in Grown-ups › Sensory, and in the child's Pause menu (if "Child can choose the voice" is on). Voice pace (Slow to Quick) still sets the overall speed. All voices are gentle and speak one sentence at a time; Lumi picks the best "natural" voice installed on the tablet and never uses the joke voices.

### Together mode

| Activity | What it does |
|---|---|
| Take turns | "Your turn to choose a card" → do the challenge → "Your turn, Mum!" invites the partner. Tick **We are using real cards** to play with a physical deck. |
| What could I say? | Everyday scenario cards (sharing a toy, a jar that won't open, food you don't like, a loud room…). Pick a picture response, see what happens, then try another way. |
| Feelings and help | The child shows how they feel and what would help (quiet time, help, move, hug, music, break…). The grown-up gets ideas, a jump counter and a break timer. Then: "How do you feel now?" |
| Team mission | Collect 3 stars together: ask for something, put a routine in order taking turns, and choose what helps Lumi calm down. Attempts count, not speed. |

### Grown-ups (press and hold the lock)

| Tab | What it does |
|---|---|
| Timetable | The weekly timetable. Steps have times, a name, what Lumi says, surprise changes, stars and a **Before this step** checklist (pick items or type your own). |
| Activities | Target skills (they get a star on the child's screens), which tiles, games and tutorials the child sees, **our own activities** (step-by-step tutorials with your photos) and talk-board words with photos. |
| Child | Name, age group, difficulty, usual Together partner, streak daily goal and rest days, **bus times** (live arrival times for the Bus step), **colours** (11 sets, including a low-colour "Soft" option), real-life goal. |
| Sensory | Hands-on routine games and the Break button (on or off), reduce animation, text size, sounds, Lumi's voice (and whether the child may change it), voice pace, music volume, upload the child's favourite song, guide hand, reminders. |
| Progress | How the child is doing: plain-English insights, right-first-try accuracy, how often the guide hand was needed (independence), minutes using Lumi, daily goals and streak, then this week's activity compared with last week, charts, skills, feelings shared and recent activity. |
| Journal | An observation journal: date and time, how the child was, tags (routine, meltdown, win…), notes, a photo and today's Lumi summary. Filter by tag, copy or download to share with teachers and therapists. |

Progress is saved in the browser on this device. Uploaded music is stored in the browser too (IndexedDB).

### Setting up live bus times

LTA DataMall's Bus Arrival API needs a free AccountKey, and it does not answer web pages on a tablet directly, so Lumi asks a tiny relay:

1. Get an AccountKey at https://datamall.lta.gov.sg (Request for API Access).
2. In Cloudflare (free): Workers & Pages › Create Worker, paste `tools/bus-relay-worker.js`, Deploy.
3. In the worker's Settings › Variables and secrets, add a secret `LTA_KEY` with your AccountKey.
4. In Lumi: Grown-ups › Child › Bus times. Turn on live times, enter the bus stop number (5 digits, printed on the bus stop sign) and bus number, paste the worker link, then tap **Check bus times now**.

## Files

```
web/
  index.html        the page
  css/styles.css    colours (brand tokens at the top) and every screen's layout
  js/icons.js       icons, including the colour pictures (teeth, breakfast, school, checklist things)
  js/lumi.js        draws Lumi, feeling faces and every item
  js/agepacks.js    age packs: Little ones, Primary, Teens (timetables, tutorials, stories, task lists, tone)
  js/data.js        all the content: steps, timetables, checklist things, talk words, games, tutorials, scenarios, missions, themes
  js/audio.js       calming music made live in the browser, and "My music"
  js/app.js         core: setup, menu, home, timetable game, checklist, feelings, calm, rewards, room, dress up, reminders
  js/kid.js         pause menu, Break button and break space, voices, the live clock, streaks, skill badges, "My stars" screen
  js/nownext.js     Now & Next board with kid-friendly timers
  js/familiar.js    record Lumi's lines in a grown-up's own voice
  js/quickstart.js  sensory quick-start questions
  js/daygames.js    the scene engine and a Lumi scene for every other part of the day
  js/routinegames.js hands-on routine steps: wake up, brush teeth, breakfast, bus (live LTA bus times)
  js/aac.js         the AAC talk board
  js/play.js        the Play area games
  js/learn.js       Learn with Lumi hub, and the simple photo player for grown-ups' own lessons
  js/learn-*.js     the real-life lessons: teeth, bath (hands, toilet), bedroom (dress, pack), life (canteen, sandwich, laundry)
  js/pet.js         the Pet corner, and the pets that walk with Lumi
  js/rugs.js        Lumi's rug under his feet on every floor, and the rugs in Lumi's room
  js/together.js    Together mode
  js/stories.js     story adventures
  js/caregiver.js   Grown-ups tabs (activities, child, sensory, progress, journal)
  js/pics.js        drawn pictures in place of emoji (shading toolkit + the emoji swapper)
  js/pics-*.js      the pictures: food and nature, things and places, symbols, faces and actions
  js/people.js      full-body people (parents, teachers, dentist, hawker uncle...)
  js/stories.js     the interactive story engine (A.SX)
  js/story-life.js  stories: taking the bus, the library, a vaccination, thunder, swimming lesson, if I get lost
  js/story-*.js     the stories: hawker centre, care (dentist, haircut, polyclinic), outings, school and work
  js/native.js      native app extras (Android voice, notifications, back button); nothing in a browser
  js/store.js       grown-ups-only check, privacy summary
  js/appicons.js    choose the app icon (Grown-ups › Child)
  js/profiles.js    more than one child on a tablet (Who is playing?)
  js/waitgame.js    the Waiting game
  js/feelchart.js   Progress: feelings and breaks over time, and patterns
  js/lang.js        home language: Chinese, Malay and Tamil words and voice
  js/comingup.js    Coming up stories (social stories) with a countdown, in My day on the day
  js/offline.js     backup and restore, and installing Lumi to work without internet
  js/main.js        starts the app
tools/
  bus-relay-worker.js  a tiny Cloudflare Worker that fetches LTA bus arrival times for Lumi
```

### Common changes

- **Add a routine step:** add it to `STEPS` in `js/data.js`.
- **Add a checklist thing:** add it to `CHECK_ITEMS` in `js/data.js` and draw its icon in `js/icons.js`.
- **Add a talk word:** add it to a folder in `WORDS` in `js/data.js` (`t` is its Fitzgerald colour type).
- **Add a tutorial:** add it to `LEARN` in `js/data.js` (`act` is tap, hold, rub, pick or done).
- **Add a scenario card or mission:** edit `SCENARIOS` or `MISSIONS` in `js/data.js`.
- **Add a story:** add it to `STORIES` in `js/data.js` (scenes: home, waiting, dentist, barber, shop, party, classroom).
- **Add a badge:** add it to `SKILL_BADGES` in `js/data.js`.
- **Change what the guide hand points at:** edit `GUIDE` in `js/app.js` (or `A.GUIDE.<screen>` in the feature files).
- **Change colours or themes:** edit the tokens at the top of `css/styles.css` and `THEMES` in `js/data.js`.

Some pictures (food, people, places, toys) use emoji as placeholders. For a real release, swap them for a proper symbol set such as ARASAAC or Mulberry Symbols (both free to use).

In the browser console, `LumiDebug.state` shows the saved progress and `LumiDebug.go('cgProgress')` jumps to a screen.
