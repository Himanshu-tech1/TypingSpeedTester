// words.js - Word dictionaries, quotes, and code snippets for Typing Speed Tester

const COMMON_WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", 
  "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "his", "from", 
  "they", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", 
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", 
  "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", 
  "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", 
  "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", 
  "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "system", "program", "code", "future", "speed", "focus", "flow", "light", "energy", "mind",
  "world", "create", "space", "power", "smart", "quick", "clean", "logic", "skill", "learn",
  "simple", "great", "change", "build", "craft", "design", "swift", "rhythm", "motion", "master",
  "dream", "vision", "solve", "pixel", "screen", "typing", "sound", "action", "pulse", "spark",
  "shine", "reach", "growth", "effort", "habit", "moment", "breath", "calm", "steady", "drive",
  "keyboard", "engine", "matrix", "vector", "signal", "binary", "stream", "orbit", "quantum", "neon",
  "cyber", "modern", "vibrant", "galaxy", "stellar", "horizon", "explore", "journey", "stride", "track",
  "record", "target", "score", "level", "sharp", "smooth", "rapid", "dynamic", "crystal", "fluid",
  "wonder", "balance", "inspire", "passion", "courage", "clarity", "advance", "triumph", "evolve", "thrive"
];

const PUNCTUATION_WORDS = [
  "hello,", "world!", "speed;", "test:", "\"focus\"", "typing?", "code...", "(quick)", 
  "100%", "#1", "$500", "key-board", "well-done!", "ready?", "3.14", "2026,", "ctrl+c", 
  "alt+tab", "1st,", "2nd!", "\"swift\"", "{clean}", "[build]", "rock & roll", "don't", 
  "it's", "can't", "you'll", "they're", "let's", "42,", "99.9%", "<stream>", "function()", 
  "return;", "true;", "false;", "result!", "high-speed", "accuracy:98%", "\"mastery\""
];

const QUOTES = [
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    length: "short"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    length: "short"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    length: "short"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    length: "medium"
  },
  {
    text: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.",
    author: "Mark Twain",
    length: "medium"
  },
  {
    text: "You can do anything you set your mind to, but it takes action, persistence, and the courage to face your fears.",
    author: "Gillian Anderson",
    length: "medium"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep pressing the keys until the song becomes your rhythm.",
    author: "Winston Churchill",
    length: "long"
  },
  {
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
    length: "long"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith.",
    author: "Franklin D. Roosevelt",
    length: "long"
  }
];

const CODE_SNIPPETS = [
  {
    name: "Array Filter & Map",
    text: "const activeUsers = users.filter(u => u.isActive).map(u => u.name);"
  },
  {
    name: "Async Fetch Function",
    text: "async function getData(url) { const res = await fetch(url); return await res.json(); }"
  },
  {
    name: "Event Listener",
    text: "window.addEventListener('keydown', (e) => { if (e.key === 'Enter') startTest(); });"
  },
  {
    name: "Python List Comprehension",
    text: "squares = [x ** 2 for x in range(10) if x % 2 == 0]"
  },
  {
    name: "Binary Search",
    text: "while (low <= high) { const mid = Math.floor((low + high) / 2); if (arr[mid] === target) return mid; }"
  }
];

/**
 * Generate randomized text based on current options
 * @param {Object} options - { mode: 'time'|'words'|'quote'|'code', count: number, punctuation: boolean, numbers: boolean, quoteLength: string }
 * @returns {Array<string>} Array of word strings
 */
function getRandomWords(options = {}) {
  const { mode = 'time', count = 30, punctuation = false, numbers = false, quoteLength = 'medium' } = options;

  if (mode === 'quote') {
    const pool = QUOTES.filter(q => !quoteLength || q.length === quoteLength);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || QUOTES[0];
    return chosen.text.split(' ');
  }

  if (mode === 'code') {
    const chosen = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    return chosen.text.split(' ');
  }

  // Words or Time mode
  const wordsToPick = count || 50;
  const result = [];
  const sourcePool = punctuation ? COMMON_WORDS.concat(PUNCTUATION_WORDS) : COMMON_WORDS;

  for (let i = 0; i < wordsToPick; i++) {
    let word = sourcePool[Math.floor(Math.random() * sourcePool.length)];
    
    // Randomly append numbers if requested
    if (numbers && Math.random() < 0.18) {
      word = Math.floor(Math.random() * 999).toString();
    }
    result.push(word);
  }

  return result;
}
