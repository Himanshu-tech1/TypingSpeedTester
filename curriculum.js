// curriculum.js - Structured touch-typing lessons and finger mappings inspired by EdClub / TypingClub

const FINGER_MAP = {
  // Left Hand
  'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky', '1': 'left-pinky',
  'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring', '2': 'left-ring',
  'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle', '3': 'left-middle',
  'r': 'left-index', 'f': 'left-index', 'v': 'left-index', '4': 'left-index',
  't': 'left-index', 'g': 'left-index', 'b': 'left-index', '5': 'left-index',

  // Thumbs
  ' ': 'thumbs',

  // Right Hand
  'y': 'right-index', 'h': 'right-index', 'n': 'right-index', '6': 'right-index',
  'u': 'right-index', 'j': 'right-index', 'm': 'right-index', '7': 'right-index',
  'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle', '8': 'right-middle',
  'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring', '9': 'right-ring',
  'p': 'right-pinky', ';': 'right-pinky', '/': 'right-pinky', '0': 'right-pinky',
  '\'': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky'
};

const FINGER_NAMES = {
  'left-pinky': 'Left Pinky Finger',
  'left-ring': 'Left Ring Finger',
  'left-middle': 'Left Middle Finger',
  'left-index': 'Left Index Finger',
  'thumbs': 'Thumb (Space Bar)',
  'right-index': 'Right Index Finger',
  'right-middle': 'Right Middle Finger',
  'right-ring': 'Right Ring Finger',
  'right-pinky': 'Right Pinky Finger'
};

const LESSONS = [
  {
    id: 1,
    title: "Home Row: F & J",
    desc: "Learn your pointer finger anchor keys on the home row.",
    keys: ["f", "j"],
    targetWpm: 15,
    text: "fff jjj fff jjj fj fj jf jf ff jj fjf jfj fff jjj fjj jff"
  },
  {
    id: 2,
    title: "The Space Bar",
    desc: "Use your thumbs to comfortably press the space bar.",
    keys: ["f", "j", "space"],
    targetWpm: 18,
    text: "f j f j ff jj fj jf f f j j ff jj fj jf ff jj fj jf"
  },
  {
    id: 3,
    title: "Home Row: D & K",
    desc: "Add your middle fingers into the mix with D and K.",
    keys: ["d", "k"],
    targetWpm: 18,
    text: "ddd kkk ddd kkk dk kd dk kd dd kk dkd kdk ddd kkk dkk kdd"
  },
  {
    id: 4,
    title: "Review: D, F, J, K",
    desc: "Combine all four middle keys with space bar rhythm.",
    keys: ["d", "f", "j", "k"],
    targetWpm: 20,
    text: "df jk fd kj dff jkk fjd kdf dfjk jkdf dff jkk df jk fd kj"
  },
  {
    id: 5,
    title: "Home Row: S & L",
    desc: "Train your ring fingers on keys S and L.",
    keys: ["s", "l"],
    targetWpm: 20,
    text: "sss lll sss lll sl ls sl ls ss ll sls lsl sss lll sll lss"
  },
  {
    id: 6,
    title: "Home Row: A & Semicolon",
    desc: "Extend your pinky fingers to complete the entire home row!",
    keys: ["a", ";"],
    targetWpm: 20,
    text: "aaa ;;; aaa ;;; a; ;a a; ;a aa ;; a;a ;a; aaa ;;; a;; ;aa"
  },
  {
    id: 7,
    title: "Home Row: G & H",
    desc: "Reach sideways with your index fingers to strike G and H.",
    keys: ["g", "h"],
    targetWpm: 22,
    text: "g g g g h h h h gh hg gh hg gg hh ghh hgg ghg hgh"
  },
  {
    id: 8,
    title: "Full Home Row Mastery",
    desc: "Type real words formed exclusively on the home row.",
    keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    targetWpm: 24,
    text: "asdf gh jkl; all fall dad sad flash salad flask alas glad half flag"
  },
  {
    id: 9,
    title: "Top Row: E & I",
    desc: "Reach upward with your middle fingers to hit E and I.",
    keys: ["e", "i"],
    targetWpm: 24,
    text: "eee iii eee iii ei ie ei ie ee ii eie iei see die lie kid"
  },
  {
    id: 10,
    title: "Top Row: R & U",
    desc: "Reach upward with your index fingers to strike R and U.",
    keys: ["r", "u"],
    targetWpm: 25,
    text: "rrr uuu rrr uuu ru ur ru ur red run fur use dark user"
  },
  {
    id: 11,
    title: "Top Row Words Practice",
    desc: "Build speed combining home row and top row letters.",
    keys: ["e", "i", "r", "u", "home"],
    targetWpm: 26,
    text: "life fire sure rule ride idea deer real side rise file"
  },
  {
    id: 12,
    title: "Bottom Row: C & M",
    desc: "Reach down to C with left middle and M with right index.",
    keys: ["c", "m"],
    targetWpm: 25,
    text: "ccc mmm ccc mmm cm mc cm mc come music claim calm match"
  },
  {
    id: 13,
    title: "Bottom Row: V & N",
    desc: "Slide your index fingers down to strike V and N.",
    keys: ["v", "n"],
    targetWpm: 28,
    text: "vvv nnn vvv nnn vn nv vn nv view vine name fine nave vain"
  },
  {
    id: 14,
    title: "All Alphabet Speed Drill",
    desc: "Practice rhythm across all three letter rows.",
    keys: ["all-alpha"],
    targetWpm: 30,
    text: "quick brown fox jumps over the lazy dog swift rhythm flows"
  },
  {
    id: 15,
    title: "Punctuation & Numbers",
    desc: "Incorporate commas, periods, and common digits.",
    keys: [",", ".", "1", "2", "3"],
    targetWpm: 28,
    text: "one, two, three. 1, 2, 3. fast typing, high focus. ready, set, go."
  },
  {
    id: 16,
    title: "TypingSpeedTester Championship",
    desc: "Complete the ultimate typing test to earn your Master Badge!",
    keys: ["championship"],
    targetWpm: 35,
    text: "mastery comes from steady practice every single day without looking down at the keys."
  }
];

/**
 * Common specific key drill presets for targeted muscle memory training
 */
const SPECIFIC_KEY_PRESETS = [
  { id: 'gh', label: 'G & H (Reach)', keys: ['g', 'h'], fingerDesc: 'Left & Right Index Reach' },
  { id: 'fj', label: 'F & J (Anchor)', keys: ['f', 'j'], fingerDesc: 'Index Fingers (Home Anchor)' },
  { id: 'dk', label: 'D & K', keys: ['d', 'k'], fingerDesc: 'Middle Fingers' },
  { id: 'sl', label: 'S & L', keys: ['s', 'l'], fingerDesc: 'Ring Fingers' },
  { id: 'asemi', label: 'A & ;', keys: ['a', ';'], fingerDesc: 'Pinky Fingers' },
  { id: 'ei', label: 'E & I', keys: ['e', 'i'], fingerDesc: 'Top Row Middle' },
  { id: 'ru', label: 'R & U', keys: ['r', 'u'], fingerDesc: 'Top Row Index' },
  { id: 'ty', label: 'T & Y', keys: ['t', 'y'], fingerDesc: 'Top Row Inner Reach' },
  { id: 'vm', label: 'V & M', keys: ['v', 'm'], fingerDesc: 'Bottom Row Index' },
  { id: 'cn', label: 'C & N', keys: ['c', 'n'], fingerDesc: 'Bottom Row Fingers' },
  { id: 'qp', label: 'Q & P', keys: ['q', 'p'], fingerDesc: 'Top Row Pinky Reach' },
  { id: 'zx', label: 'Z & X', keys: ['z', 'x'], fingerDesc: 'Bottom Row Pinky & Ring' },
  { id: 'home', label: 'Home Row All', keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'], fingerDesc: 'Full Home Row' }
];

/**
 * Generate structured, progressive drills strictly using specified keys (NO RANDOM WORDS!)
 * Mirrors EdClub / TypingClub pattern drill pedagogy.
 */
function generateSpecificKeyDrill(keys, length = 40) {
  if (!keys || keys.length === 0) return 'f j f j';
  
  const cleanKeys = keys.map(k => k.toLowerCase());
  
  if (cleanKeys.length === 1) {
    const k = cleanKeys[0];
    const chunks = [];
    chunks.push(`${k} ${k} ${k} ${k}`);
    chunks.push(`${k}${k} ${k}${k} ${k}${k}`);
    chunks.push(`${k}${k}${k} ${k}${k}${k}`);
    chunks.push(`${k} ${k} ${k}${k} ${k}`);
    chunks.push(`${k}${k} ${k} ${k}${k} ${k}${k}${k}`);
    return chunks.join(' ');
  }

  if (cleanKeys.length === 2) {
    const [k1, k2] = cleanKeys;
    // Stage 1: Single repetitions (e.g. g g g g h h h h)
    // Stage 2: Alternating (gh hg gh hg)
    // Stage 3: Doubles (gg hh gg hh)
    // Stage 4: Triplets & mix (ggg hhh ghh hgg ghg hgh)
    const parts = [
      `${k1} ${k1} ${k1} ${k1} ${k2} ${k2} ${k2} ${k2}`,
      `${k1}${k2} ${k2}${k1} ${k1}${k2} ${k2}${k1}`,
      `${k1}${k1} ${k2}${k2} ${k1}${k1} ${k2}${k2}`,
      `${k1}${k1}${k1} ${k2}${k2}${k2} ${k1}${k2}${k2} ${k2}${k1}${k1}`,
      `${k1}${k2}${k1} ${k2}${k1}${k2} ${k1} ${k2} ${k1}${k1} ${k2}${k2}`
    ];
    return parts.join(' ');
  }

  // Multi-key structured patterns
  const patterns = [];
  // 1. Groups of singles
  for (let i = 0; i < cleanKeys.length; i++) {
    const k = cleanKeys[i];
    patterns.push(`${k} ${k} ${k}`);
  }
  // 2. Adjacent pairs
  for (let i = 0; i < cleanKeys.length - 1; i++) {
    patterns.push(`${cleanKeys[i]}${cleanKeys[i+1]} ${cleanKeys[i+1]}${cleanKeys[i]}`);
  }
  // 3. Permutations
  const sequence = [];
  let token = '';
  for (let i = 0; i < 28; i++) {
    const k = cleanKeys[i % cleanKeys.length];
    token += k;
    if (token.length >= 3 || (i % 2 === 1 && Math.random() > 0.4)) {
      sequence.push(token);
      token = '';
    }
  }
  if (token) sequence.push(token);

  return patterns.join(' ') + ' ' + sequence.join(' ');
}

/**
 * Calculate stars (1 to 5) earned based on accuracy and WPM
 */
function calculateStars(accuracy, wpm, targetWpm) {
  if (accuracy < 70) return 1;
  let stars = 1;

  if (accuracy >= 85) stars++;
  if (accuracy >= 92) stars++;
  if (accuracy >= 97) stars++;
  if (wpm >= targetWpm && accuracy >= 95) stars = 5;

  return Math.min(5, Math.max(1, stars));
}
