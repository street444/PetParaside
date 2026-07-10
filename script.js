/* ==========================================================================
   PET PARADISE — SCRIPT.JS
   Чистий JavaScript без фреймворків.
   Структура файлу:
     1. ДАНІ ГРИ (тварини, локації, покращення, досягнення, завдання, титули)
     2. СТАН ГРИ (state) + збереження/завантаження (LocalStorage)
     3. ЗВУК (Web Audio API — синтезовані звуки, без зовнішніх файлів)
     4. РЕНДЕР ІНТЕРФЕЙСУ (HUD, сцена, панелі)
     5. ІГРОВА ЛОГІКА (погладжування, рівні, магазин, автозаробіток)
     6. МОДАЛЬНІ ПАНЕЛІ (магазин, колекція, досягнення, завдання, колесо, щоденні)
     7. ЧАСТИНКИ ТА АНІМАЦІЇ
     8. ІНІЦІАЛІЗАЦІЯ ТА ОБРОБНИКИ ПОДІЙ
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. ДАНІ ГРИ
   Щоб додати нову тварину — просто додайте об'єкт у масив PETS.
   Щоб додати нову локацію — додайте об'єкт у масив LOCATIONS.
   Щоб додати нове покращення — додайте об'єкт у масив UPGRADES.
   ========================================================================== */

// Рівні рідкісності та їхні базові множники нагороди
const RARITY = {
  common:    { label: 'Звичайна',   mult: 1,    color: '#9BA6B5' },
  rare:      { label: 'Рідкісна',   mult: 2.2,  color: '#6FB8FF' },
  golden:    { label: 'Золота',     mult: 5,    color: '#FFC65C' },
  legendary: { label: 'Легендарна', mult: 12,   color: '#FF6FB8' },
  mythic:    { label: 'Міфічна',    mult: 30,   color: '#B06FFF' },
};

// Список усіх тварин у грі
const PETS = [
  // --- Собаки (звичайні) ---
  { id: 'dog_labrador',   name: 'Дружок',    emoji: '🐶', type: 'dog', rarity: 'common', unlockLevel: 1,  location: 'home', sound: 'bark' },
  { id: 'dog_shiba',      name: 'Тако',      emoji: '🐕', type: 'dog', rarity: 'common', unlockLevel: 2,  location: 'home', sound: 'bark' },
  { id: 'dog_poodle',     name: 'Кучерик',   emoji: '🐩', type: 'dog', rarity: 'common', unlockLevel: 7,  location: 'park', sound: 'bark' },
  { id: 'dog_guide',      name: 'Рекс',      emoji: '🦮', type: 'dog', rarity: 'common', unlockLevel: 6,  location: 'park', sound: 'bark' },
  { id: 'dog_service',    name: 'Дозор',     emoji: '🐕‍🦺', type: 'dog', rarity: 'rare', unlockLevel: 9,  location: 'park', sound: 'bark' },

  // --- Коти (звичайні) ---
  { id: 'cat_orange',     name: 'Рудько',    emoji: '🐱', type: 'cat', rarity: 'common', unlockLevel: 1,  location: 'home', sound: 'meow' },
  { id: 'cat_black',      name: 'Мурчик',    emoji: '🐈', type: 'cat', rarity: 'common', unlockLevel: 3,  location: 'home', sound: 'meow' },
  { id: 'cat_persian',    name: 'Пухнастик', emoji: '🐈‍⬛', type: 'cat', rarity: 'common', unlockLevel: 5,  location: 'home', sound: 'meow' },
  { id: 'cat_lion',       name: 'Симба',     emoji: '🦁', type: 'cat', rarity: 'rare', unlockLevel: 8,  location: 'park', sound: 'meow' },
  { id: 'cat_tiger',      name: 'Амур',      emoji: '🐯', type: 'cat', rarity: 'rare', unlockLevel: 14, location: 'forest', sound: 'meow' },

  // --- Пляж ---
  { id: 'pet_seal',       name: 'Флоппі',    emoji: '🦭', type: 'exotic', rarity: 'rare', unlockLevel: 12, location: 'beach', sound: 'squeak' },
  { id: 'pet_dolphin',    name: 'Спрінт',    emoji: '🐬', type: 'exotic', rarity: 'golden', unlockLevel: 14, location: 'beach', sound: 'squeak' },
  { id: 'pet_turtle',     name: 'Кроко',     emoji: '🐢', type: 'exotic', rarity: 'common', unlockLevel: 11, location: 'beach', sound: 'squeak' },

  // --- Ліс ---
  { id: 'pet_fox',        name: 'Лисенятко', emoji: '🦊', type: 'wild', rarity: 'rare', unlockLevel: 15, location: 'forest', sound: 'bark' },
  { id: 'pet_owl',        name: 'Мудрик',    emoji: '🦉', type: 'wild', rarity: 'golden', unlockLevel: 17, location: 'forest', sound: 'squeak' },
  { id: 'pet_deer',       name: 'Оленя',     emoji: '🦌', type: 'wild', rarity: 'common', unlockLevel: 13, location: 'forest', sound: 'squeak' },
  { id: 'pet_bear',       name: 'Ведмедик',  emoji: '🐻', type: 'wild', rarity: 'golden', unlockLevel: 18, location: 'forest', sound: 'bark' },

  // --- Снігова долина ---
  { id: 'pet_penguin',    name: 'Крижик',    emoji: '🐧', type: 'snow', rarity: 'rare', unlockLevel: 20, location: 'snow', sound: 'squeak' },
  { id: 'pet_polarbear',  name: 'Сніжок',    emoji: '🐻‍❄️', type: 'snow', rarity: 'golden', unlockLevel: 22, location: 'snow', sound: 'bark' },
  { id: 'pet_reindeer',   name: 'Зорепад',   emoji: '🦌', type: 'snow', rarity: 'legendary', unlockLevel: 25, location: 'snow', sound: 'squeak' },

  // --- Космос ---
  { id: 'pet_alienpup',   name: 'Зорько',    emoji: '👽', type: 'space', rarity: 'legendary', unlockLevel: 28, location: 'space', sound: 'squeak' },
  { id: 'pet_starcat',    name: 'Комета',    emoji: '🐈', type: 'space', rarity: 'legendary', unlockLevel: 30, location: 'space', sound: 'meow' },
  { id: 'pet_moonrabbit', name: 'Місяцик',   emoji: '🐰', type: 'space', rarity: 'golden', unlockLevel: 27, location: 'space', sound: 'squeak' },

  // --- Магічний світ (найрідкісніші) ---
  { id: 'pet_unicorn',    name: 'Веселка',   emoji: '🦄', type: 'magic', rarity: 'mythic', unlockLevel: 35, location: 'magic', sound: 'squeak' },
  { id: 'pet_dragon',     name: 'Іскра',     emoji: '🐉', type: 'magic', rarity: 'mythic', unlockLevel: 40, location: 'magic', sound: 'bark' },
  { id: 'pet_phoenix',    name: 'Жар-птах',  emoji: '🐦‍🔥', type: 'magic', rarity: 'mythic', unlockLevel: 45, location: 'magic', sound: 'squeak' },
];

// Локації, у яких відбувається дія
const LOCATIONS = [
  { id: 'home',  name: 'Будинок',        emoji: '🏠', unlockLevel: 1,  bg: 'linear-gradient(180deg,#FFE3EF,#FFF7EF)' },
  { id: 'park',  name: 'Парк',           emoji: '🌳', unlockLevel: 6,  bg: 'linear-gradient(180deg,#DFF4D9,#FFF7EF)' },
  { id: 'beach', name: 'Пляж',           emoji: '🏖️', unlockLevel: 11, bg: 'linear-gradient(180deg,#CDEFF7,#FFF7EF)' },
  { id: 'forest',name: 'Ліс',            emoji: '🌲', unlockLevel: 13, bg: 'linear-gradient(180deg,#C9E8CE,#FFF7EF)' },
  { id: 'snow',  name: 'Снігова долина', emoji: '❄️', unlockLevel: 20, bg: 'linear-gradient(180deg,#E4F0FB,#FFF7EF)' },
  { id: 'space', name: 'Космос',         emoji: '🚀', unlockLevel: 27, bg: 'linear-gradient(180deg,#D6CBF2,#FFF7EF)' },
  { id: 'magic', name: 'Магічний світ',  emoji: '✨', unlockLevel: 35, bg: 'linear-gradient(180deg,#F5D4F0,#FFF7EF)' },
];

// Покращення в магазині. type визначає, який ефект вони дають.
const UPGRADES = [
  {
    id: 'coin_boost', category: 'boost', name: 'Щедра лапка',
    desc: 'Більше монет за кожне погладжування', icon: '🪙',
    baseCost: 25, costMult: 1.55, maxLevel: 40,
    effect: (lvl) => ({ coinsPerPat: 1 + lvl * 0.6 }),
  },
  {
    id: 'xp_boost', category: 'boost', name: 'Швидке навчання',
    desc: 'Більше досвіду за кожне погладжування', icon: '✨',
    baseCost: 20, costMult: 1.5, maxLevel: 40,
    effect: (lvl) => ({ xpPerPat: 1 + lvl * 0.5 }),
  },
  {
    id: 'pat_speed', category: 'boost', name: 'Швидкі пальчики',
    desc: 'Зменшує затримку між погладжуваннями', icon: '⚡',
    baseCost: 40, costMult: 1.7, maxLevel: 15,
    effect: (lvl) => ({ patCooldown: Math.max(60, 260 - lvl * 14) }),
  },
  {
    id: 'lucky_chance', category: 'boost', name: 'Щаслива підкова',
    desc: 'Більший шанс на випадковий бонус', icon: '🍀',
    baseCost: 60, costMult: 1.8, maxLevel: 20,
    effect: (lvl) => ({ bonusChance: 0.05 + lvl * 0.015 }),
  },
  {
    id: 'auto_pat', category: 'auto', name: 'Автоматичний погладжувач',
    desc: 'Тваринки гладяться самі — навіть без вас!', icon: '🤖',
    baseCost: 300, costMult: 2.1, maxLevel: 25,
    effect: (lvl) => ({ autoPatsPerSec: lvl * 0.5 }),
  },
  {
    id: 'gem_finder', category: 'boost', name: 'Шукач самоцвітів',
    desc: 'Шанс отримати рідкісні самоцвіти', icon: '💎',
    baseCost: 500, costMult: 1.9, maxLevel: 15,
    effect: (lvl) => ({ gemChance: lvl * 0.01 }),
  },
];

// Досягнення. condition отримує state і повертає поточний прогрес (число).
const ACHIEVEMENTS = [
  { id: 'ach_pat_10',    name: 'Перші кроки',      desc: 'Погладьте тварин 10 разів',           icon: '🐾', goal: 10,    stat: 'totalPats',    reward: { coins: 20 } },
  { id: 'ach_pat_100',   name: 'Друг тварин',      desc: 'Погладьте тварин 100 разів',          icon: '🐕', goal: 100,   stat: 'totalPats',    reward: { coins: 150 } },
  { id: 'ach_pat_1000',  name: 'Майстер погладжувань', desc: 'Погладьте тварин 1000 разів',     icon: '👑', goal: 1000,  stat: 'totalPats',    reward: { coins: 1000, gems: 5 } },
  { id: 'ach_pat_10000', name: 'Легенда Paradise', desc: 'Погладьте тварин 10 000 разів',       icon: '🏆', goal: 10000, stat: 'totalPats',    reward: { coins: 8000, gems: 25 } },
  { id: 'ach_coins_500', name: 'Перші заощадження', desc: 'Заробіть 500 монет за все життя',    icon: '🪙', goal: 500,   stat: 'totalCoinsEarned', reward: { coins: 100 } },
  { id: 'ach_coins_10000', name: 'Скарбничка',     desc: 'Заробіть 10 000 монет за все життя',  icon: '💰', goal: 10000, stat: 'totalCoinsEarned', reward: { coins: 500, gems: 10 } },
  { id: 'ach_level_5',   name: 'Впевнений старт',  desc: 'Досягніть 5 рівня',                    icon: '🌟', goal: 5,     stat: 'level',         reward: { coins: 150 } },
  { id: 'ach_level_15',  name: 'Досвідчений опікун', desc: 'Досягніть 15 рівня',                icon: '🌠', goal: 15,    stat: 'level',         reward: { coins: 600, gems: 5 } },
  { id: 'ach_level_30',  name: 'Майстер зоопарку', desc: 'Досягніть 30 рівня',                   icon: '💫', goal: 30,    stat: 'level',         reward: { coins: 2500, gems: 15 } },
  { id: 'ach_collect_10', name: 'Колекціонер',     desc: 'Відкрийте 10 тварин',                  icon: '📖', goal: 10,    stat: 'unlockedPetsCount', reward: { coins: 400 } },
  { id: 'ach_collect_all', name: 'Повна колекція', desc: `Відкрийте всіх ${PETS.length} тварин`, icon: '🎖️', goal: PETS.length, stat: 'unlockedPetsCount', reward: { coins: 5000, gems: 30 } },
  { id: 'ach_golden_1',  name: 'Блиск удачі',      desc: 'Відкрийте золоту тварину',             icon: '⭐', goal: 1,     stat: 'goldenUnlocked', reward: { coins: 300 } },
  { id: 'ach_mythic_1',  name: 'Дотик міфу',       desc: 'Відкрийте міфічну тварину',            icon: '🔮', goal: 1,     stat: 'mythicUnlocked', reward: { coins: 3000, gems: 20 } },
  { id: 'ach_wheel_5',   name: 'Гравець удачі',    desc: 'Прокрутіть колесо удачі 5 разів',      icon: '🎡', goal: 5,     stat: 'wheelSpins',    reward: { coins: 250 } },
  { id: 'ach_daily_7',   name: 'Тижнева звичка',   desc: 'Заберіть щоденну нагороду 7 днів поспіль', icon: '📅', goal: 7, stat: 'dailyStreak',   reward: { coins: 700, gems: 5 } },
];

// Титули за рівнем
const TITLES = [
  { level: 1,  title: 'Новачок' },
  { level: 3,  title: 'Друг тварин' },
  { level: 6,  title: 'Доглядач' },
  { level: 10, title: 'Улюбленець звірят' },
  { level: 15, title: 'Знавець порід' },
  { level: 20, title: 'Хранитель парку' },
  { level: 27, title: 'Мандрівник світів' },
  { level: 35, title: 'Чарівник Paradise' },
  { level: 45, title: 'Легенда Pet Paradise' },
];

// Щоденні нагороди (7-денний цикл, що повторюється)
const DAILY_REWARDS = [
  { day: 1, coins: 50,  gems: 0, emoji: '🪙' },
  { day: 2, coins: 80,  gems: 0, emoji: '🪙' },
  { day: 3, coins: 120, gems: 2, emoji: '💎' },
  { day: 4, coins: 160, gems: 0, emoji: '🪙' },
  { day: 5, coins: 220, gems: 3, emoji: '💎' },
  { day: 6, coins: 300, gems: 0, emoji: '🎁' },
  { day: 7, coins: 500, gems: 10, emoji: '👑' },
];

// Щоденні завдання (обираються випадково по 3 на день)
const QUEST_POOL = [
  { id: 'q_pat_30',   name: 'Погладьте тварин 30 разів',      icon: '🐾', goal: 30,  stat: 'sessionPats',  reward: { coins: 80 } },
  { id: 'q_pat_80',   name: 'Погладьте тварин 80 разів',      icon: '🐕', goal: 80,  stat: 'sessionPats',  reward: { coins: 180 } },
  { id: 'q_earn_200', name: 'Заробіть 200 монет',             icon: '🪙', goal: 200, stat: 'sessionCoins', reward: { coins: 100 } },
  { id: 'q_earn_500', name: 'Заробіть 500 монет',             icon: '💰', goal: 500, stat: 'sessionCoins', reward: { coins: 250, gems: 2 } },
  { id: 'q_visit_loc', name: 'Відвідайте 2 різні локації',    icon: '🗺️', goal: 2,   stat: 'sessionLocationsVisited', reward: { coins: 120 } },
  { id: 'q_buy_upgrade', name: 'Купіть 1 покращення',         icon: '🛒', goal: 1,   stat: 'sessionUpgradesBought', reward: { coins: 150 } },
  { id: 'q_spin_wheel', name: 'Прокрутіть колесо удачі',      icon: '🎡', goal: 1,   stat: 'sessionWheelSpins', reward: { coins: 100 } },
  { id: 'q_bonus_3',  name: 'Отримайте 3 випадкові бонуси',   icon: '🎉', goal: 3,   stat: 'sessionBonuses', reward: { coins: 140 } },
];

// Сектори колеса удачі
const WHEEL_SECTORS = [
  { label: '+50 монет',  type: 'coins', value: 50,  color: '#FFD9E8' },
  { label: '+10 XP',     type: 'xp',    value: 10,  color: '#C6B4F5' },
  { label: '+120 монет', type: 'coins', value: 120, color: '#A8E6C5' },
  { label: '+1 самоцвіт',type: 'gems',  value: 1,   color: '#FFC65C' },
  { label: '+25 монет',  type: 'coins', value: 25,  color: '#FFD9E8' },
  { label: '+300 монет', type: 'coins', value: 300, color: '#FF8C7A' },
  { label: '+30 XP',     type: 'xp',    value: 30,  color: '#C6B4F5' },
  { label: '+3 самоцвіти',type: 'gems', value: 3,   color: '#FFC65C' },
];

/* ==========================================================================
   2. СТАН ГРИ + LOCALSTORAGE
   ========================================================================== */

const SAVE_KEY = 'petParadiseSave_v1';

// Дефолтний стан нової гри
function createDefaultState() {
  return {
    coins: 0,
    gems: 0,
    love: 0,
    xp: 0,
    level: 1,
    totalPats: 0,
    totalCoinsEarned: 0,
    unlockedPetIds: ['dog_labrador', 'cat_orange'],
    currentPetId: 'dog_labrador',
    currentLocation: 'home',
    unlockedLocations: ['home'],
    upgrades: {},           // { upgradeId: level }
    achievementsClaimed: [],
    achievementsSeenDone: [],
    lastDailyClaim: null,   // дата у форматі YYYY-MM-DD
    dailyStreak: 0,
    wheelSpins: 0,
    lastWheelSpin: null,
    activeQuests: [],       // [{ id, progress }]
    questsGeneratedDate: null,
    settings: {
      sfx: true,
      music: true,
      particles: true,
      volume: 60,
    },
    session: {
      sessionPats: 0,
      sessionCoins: 0,
      sessionLocationsVisited: 1,
      sessionUpgradesBought: 0,
      sessionWheelSpins: 0,
      sessionBonuses: 0,
      visitedLocationsSet: ['home'],
    },
    goldenUnlocked: 0,
    legendaryUnlocked: 0,
    mythicUnlocked: 0,
    createdAt: Date.now(),
  };
}

let state = createDefaultState();

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Не вдалося зберегти гру:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const loaded = JSON.parse(raw);
    const fresh = createDefaultState();
    state = deepMerge(fresh, loaded);
    return true;
  } catch (e) {
    console.warn('Не вдалося завантажити збереження, починаємо нову гру:', e);
    return false;
  }
}

function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (typeof base === 'object' && base !== null) {
    const result = { ...base };
    for (const key in base) {
      if (override && Object.prototype.hasOwnProperty.call(override, key)) {
        result[key] = deepMerge(base[key], override[key]);
      }
    }
    return result;
  }
  return override !== undefined ? override : base;
}

let autosaveInterval = null;
function startAutosave() {
  if (autosaveInterval) clearInterval(autosaveInterval);
  autosaveInterval = setInterval(saveGame, 10000);
}

/* ==========================================================================
   3. ЗВУК (Web Audio API — синтезовані звуки, файли не потрібні)
   ========================================================================== */

let audioCtx = null;
let musicNodes = null;
let musicPlaying = false;

function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function volumeGain() {
  return (state.settings.volume / 100) * 0.5;
}

function playClickSound() {
  if (!state.settings.sfx) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(680, t);
  osc.frequency.exponentialRampToValueAtTime(340, t + 0.09);
  gain.gain.setValueAtTime(volumeGain() * 0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.11);
}

function playBarkSound() {
  if (!state.settings.sfx) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  [0, 0.12].forEach((delay) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t + delay);
    osc.frequency.exponentialRampToValueAtTime(110, t + delay + 0.1);
    gain.gain.setValueAtTime(volumeGain() * 0.35, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t + delay);
    osc.stop(t + delay + 0.16);
  });
}

function playMeowSound() {
  if (!state.settings.sfx) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, t);
  osc.frequency.linearRampToValueAtTime(760, t + 0.12);
  osc.frequency.linearRampToValueAtTime(420, t + 0.28);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volumeGain() * 0.3, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.31);
}

function playSqueakSound() {
  if (!state.settings.sfx) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.06);
  osc.frequency.exponentialRampToValueAtTime(700, t + 0.14);
  gain.gain.setValueAtTime(volumeGain() * 0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.17);
}

function playChimeSound(success = true) {
  if (!state.settings.sfx) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const freqs = success ? [523, 659, 784] : [330, 262];
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t + i * 0.07);
    gain.gain.setValueAtTime(volumeGain() * 0.3, t + i * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t + i * 0.07);
    osc.stop(t + i * 0.07 + 0.36);
  });
}

function playPetSound(soundType) {
  if (soundType === 'bark') playBarkSound();
  else if (soundType === 'meow') playMeowSound();
  else playSqueakSound();
}

function startMusic() {
  if (musicPlaying || !state.settings.music) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  musicPlaying = true;

  const notes = [392, 440, 523.25, 587.33, 523.25, 440];
  let step = 0;

  function scheduleNote() {
    if (!musicPlaying) return;
    const ctxNow = getAudioCtx();
    if (!ctxNow) return;
    const t = ctxNow.currentTime;
    const osc = ctxNow.createOscillator();
    const gain = ctxNow.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(notes[step % notes.length], t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volumeGain() * 0.1, t + 0.4);
    gain.gain.linearRampToValueAtTime(0.0001, t + 1.3);
    osc.connect(gain).connect(ctxNow.destination);
    osc.start(t);
    osc.stop(t + 1.35);
    step++;
    musicNodes = setTimeout(scheduleNote, 900);
  }
  scheduleNote();
}

function stopMusic() {
  musicPlaying = false;
  if (musicNodes) {
    clearTimeout(musicNodes);
    musicNodes = null;
  }
}

/* ==========================================================================
   4. ДОПОМІЖНІ РОЗРАХУНКИ (рівні, покращення, поточна тваринка/локація)
   ========================================================================== */

// Скільки XP потрібно для переходу з рівня N на N+1 (плавна крива зростання)
function xpNeededForLevel(level) {
  return Math.round(50 * Math.pow(level, 1.32));
}

function getTitleForLevel(level) {
  let current = TITLES[0].title;
  for (const t of TITLES) {
    if (level >= t.level) current = t.title;
    else break;
  }
  return current;
}

function getUpgradeLevel(upgradeId) {
  return state.upgrades[upgradeId] || 0;
}

function getUpgradeCost(upgrade) {
  const lvl = getUpgradeLevel(upgrade.id);
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costMult, lvl));
}

// Обчислює сукупний ефект усіх куплених покращень
function computeEffects() {
  const effects = {
    coinsPerPat: 1,
    xpPerPat: 1,
    patCooldown: 260,
    bonusChance: 0.05,
    autoPatsPerSec: 0,
    gemChance: 0,
  };
  for (const upgrade of UPGRADES) {
    const lvl = getUpgradeLevel(upgrade.id);
    if (lvl <= 0) continue;
    const partial = upgrade.effect(lvl);
    Object.assign(effects, partial);
  }
  return effects;
}

function getCurrentPet() {
  return PETS.find((p) => p.id === state.currentPetId) || PETS[0];
}

function getCurrentLocationData() {
  return LOCATIONS.find((l) => l.id === state.currentLocation) || LOCATIONS[0];
}

function isPetUnlocked(pet) {
  return state.unlockedPetIds.includes(pet.id);
}

function isLocationUnlocked(loc) {
  return state.unlockedLocations.includes(loc.id) || state.level >= loc.unlockLevel;
}

// Тварини, доступні у поточній локації (незалежно від того, розблоковані вони чи ще ні — показуємо як "локед" картки)
function petsInLocation(locationId) {
  return PETS.filter((p) => p.location === locationId);
}

/* ==========================================================================
   5. ОСНОВНА МЕХАНІКА: ПОГЛАДЖУВАННЯ, XP, РІВНІ, РОЗБЛОКУВАННЯ
   ========================================================================== */

let lastPatTime = 0;
let sessionQuestCheckQueue = [];

// Головна функція — викликається при кожному погладжуванні (клік/дотик/автозаробіток)
function performPat(isAuto = false, clientX = null, clientY = null) {
  const now = performance.now();
  const effects = computeEffects();

  if (!isAuto) {
    if (now - lastPatTime < effects.patCooldown) return; // антиспам-кулдаун
    lastPatTime = now;
  }

  const pet = getCurrentPet();
  const rarityData = RARITY[pet.rarity];
  const coinsGained = Math.round(effects.coinsPerPat * rarityData.mult * (isAuto ? 0.6 : 1) * 10) / 10;
  const xpGained = Math.round(effects.xpPerPat * (1 + rarityData.mult * 0.15) * (isAuto ? 0.6 : 1) * 10) / 10;

  addCoins(coinsGained, false);
  addXp(xpGained);
  state.totalPats++;
  state.love += isAuto ? 0.3 : 1;
  state.session.sessionPats++;

  // Випадковий бонус
  let bonusTriggered = false;
  if (Math.random() < effects.bonusChance) {
    bonusTriggered = true;
    triggerRandomBonus(clientX, clientY);
  }

  // Випадковий самоцвіт (окремо від бонусу)
  if (effects.gemChance > 0 && Math.random() < effects.gemChance) {
    state.gems += 1;
    updateHudStat('gemValue', state.gems, true);
  }

  if (!isAuto) {
    // Візуальний фідбек лише для реального кліку користувача
    playPetSound(pet.sound);
    animatePetPat();
    spawnFloatText(`+${formatNumber(coinsGained)} 🪙`, clientX, clientY, 'coin');
    spawnFloatText(`+${formatNumber(xpGained)} ✨`, clientX, clientY, 'xp', 30);
    if (state.settings.particles) {
      spawnHeartParticles(clientX, clientY);
      if (bonusTriggered) spawnSparkleParticles(clientX, clientY);
    }
  }

  checkQuestProgress();
  checkAchievements();
  refreshHud();
}

function addCoins(amount, showPop = true) {
  state.coins += amount;
  state.totalCoinsEarned += amount;
  state.session.sessionCoins += amount;
  if (showPop) {
    updateHudStat('coinValue', state.coins, true);
  } else {
    document.getElementById('coinValue').textContent = formatNumber(Math.floor(state.coins));
  }
}

function addXp(amount) {
  state.xp += amount;
  let leveledUp = false;
  let needed = xpNeededForLevel(state.level);
  while (state.xp >= needed) {
    state.xp -= needed;
    state.level++;
    leveledUp = true;
    needed = xpNeededForLevel(state.level);
    onLevelUp(state.level);
  }
  if (leveledUp) {
    const badge = document.getElementById('levelBadge');
    badge.classList.remove('level-up-pop');
    void badge.offsetWidth; // форс-рефлоу для перезапуску анімації
    badge.classList.add('level-up-pop');
  }
}

// Викликається кожного разу при переході на новий рівень
function onLevelUp(newLevel) {
  // Розблоковуємо нових тварин
  const newPets = PETS.filter((p) => p.unlockLevel === newLevel && !state.unlockedPetIds.includes(p.id));
  newPets.forEach((p) => {
    state.unlockedPetIds.push(p.id);
    if (p.rarity === 'golden') state.goldenUnlocked = (state.goldenUnlocked || 0) + 1;
    if (p.rarity === 'legendary') state.legendaryUnlocked = (state.legendaryUnlocked || 0) + 1;
    if (p.rarity === 'mythic') state.mythicUnlocked = (state.mythicUnlocked || 0) + 1;
    showToast(`Нова тваринка: ${p.name}! ${p.emoji}`, '🎉');
  });

  // Розблоковуємо нові локації
  const newLocs = LOCATIONS.filter((l) => l.unlockLevel === newLevel && !state.unlockedLocations.includes(l.id));
  newLocs.forEach((l) => {
    state.unlockedLocations.push(l.id);
    showToast(`Нова локація: ${l.name}! ${l.emoji}`, '🗺️');
  });

  showToast(`Рівень ${newLevel}! ${getTitleForLevel(newLevel)}`, '⭐');
  playChimeSound(true);
  renderLocationBar();
}

// Випадкові бонуси при погладжуванні
function triggerRandomBonus(x, y) {
  state.session.sessionBonuses++;
  const roll = Math.random();
  let bonusText = '';
  if (roll < 0.5) {
    const bonusCoins = Math.round(15 + Math.random() * 40);
    addCoins(bonusCoins, false);
    bonusText = `Бонус! +${bonusCoins} 🪙`;
  } else if (roll < 0.85) {
    const bonusXp = Math.round(8 + Math.random() * 20);
    state.xp += bonusXp;
    addXp(0); // перевірка рівня без подвійного додавання
    bonusText = `Бонус! +${bonusXp} ✨`;
  } else {
    state.gems += 1;
    bonusText = `Рідкісний самоцвіт! +1 💎`;
  }
  spawnFloatText(bonusText, x, y, 'bonus', -20);
  playChimeSound(true);
}

/* ==========================================================================
   6. АВТОЗАРОБІТОК (ігровий цикл через requestAnimationFrame + інтервал)
   ========================================================================== */

let autoPatAccumulator = 0;
let lastAutoTick = performance.now();

function autoPatLoop(timestamp) {
  const effects = computeEffects();
  const dt = (timestamp - lastAutoTick) / 1000;
  lastAutoTick = timestamp;

  if (effects.autoPatsPerSec > 0) {
    autoPatAccumulator += effects.autoPatsPerSec * dt;
    while (autoPatAccumulator >= 1) {
      autoPatAccumulator -= 1;
      performPat(true);
    }
  }
  requestAnimationFrame(autoPatLoop);
}

/* ==========================================================================
   7. ЧАСТИНКИ ТА ПЛАВАЮЧІ ЕФЕКТИ
   ========================================================================== */

function formatNumber(num) {
  const n = Math.floor(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

// Координати центру сцени (використовуються, якщо клік стався не мишкою, а автоматично)
function getStageCenter() {
  const stage = document.getElementById('petBtn');
  const rect = stage.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function spawnFloatText(text, x, y, kind = 'coin', offsetX = -10) {
  const layer = document.getElementById('floatLayer');
  const stageRect = document.getElementById('stage').getBoundingClientRect();
  let px = x, py = y;
  if (px === null || py === null) {
    const c = getStageCenter();
    px = c.x; py = c.y;
  }
  const localX = px - stageRect.left + offsetX + (Math.random() * 30 - 15);
  const localY = py - stageRect.top - 20;

  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left = localX + 'px';
  el.style.top = localY + 'px';
  el.style.color = kind === 'coin' ? '#D98B1F' : kind === 'xp' ? '#A88EE8' : '#FF6F5B';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}

const HEART_EMOJIS = ['❤️', '💕', '💖', '💗'];
const SPARKLE_EMOJIS = ['✨', '⭐', '🌟'];

function spawnHeartParticles(x, y, count = 6) {
  spawnEmojiParticles(x, y, HEART_EMOJIS, count, 'particle');
}

function spawnSparkleParticles(x, y, count = 10) {
  spawnEmojiParticles(x, y, SPARKLE_EMOJIS, count, 'particle sparkle-particle');
}

function spawnEmojiParticles(x, y, emojiSet, count, className) {
  if (!state.settings.particles) return;
  const layer = document.getElementById('particle-layer');
  let px = x, py = y;
  if (px === null || py === null) {
    const c = getStageCenter();
    px = c.x; py = c.y;
  }
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = emojiSet[Math.floor(Math.random() * emojiSet.length)];
    el.style.left = px + 'px';
    el.style.top = py + 'px';
    el.style.fontSize = (16 + Math.random() * 14) + 'px';
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40; // невеликий зсув вгору
    el.style.setProperty('--dx', dx + 'px');
    el.style.setProperty('--dy', dy + 'px');
    el.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
    el.style.animationDelay = (Math.random() * 0.12) + 's';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }
}

function animatePetPat() {
  const btn = document.getElementById('petBtn');
  btn.classList.remove('pet-pat');
  void btn.offsetWidth;
  btn.classList.add('pet-pat');
}

/* ==========================================================================
   8. TOAST-СПОВІЩЕННЯ
   ========================================================================== */

function showToast(message, icon = '🔔') {
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3700);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ==========================================================================
   9. РЕНДЕР ІНТЕРФЕЙСУ
   ========================================================================== */

function updateHudStat(elementId, value, animate) {
  const el = document.getElementById(elementId);
  el.textContent = formatNumber(Math.floor(value));
  if (animate) {
    const wrapId = elementId.replace('Value', 'Stat');
    const wrap = document.getElementById(wrapId);
    if (wrap) {
      wrap.classList.remove('pop');
      void wrap.offsetWidth;
      wrap.classList.add('pop');
    }
  }
}

function refreshHud() {
  document.getElementById('coinValue').textContent = formatNumber(state.coins);
  document.getElementById('gemValue').textContent = formatNumber(state.gems);
  document.getElementById('loveValue').textContent = formatNumber(state.love);
  document.getElementById('levelBadge').textContent = state.level;
  document.getElementById('titleLabel').textContent = getTitleForLevel(state.level);

  const needed = xpNeededForLevel(state.level);
  const pct = Math.min(100, (state.xp / needed) * 100);
  document.getElementById('xpFill').style.width = pct + '%';
  document.getElementById('xpText').textContent = `${formatNumber(state.xp)} / ${formatNumber(needed)} XP`;

  const effects = computeEffects();
  document.getElementById('quickCoinsPerPet').textContent = '+' + formatNumber(effects.coinsPerPat);
  document.getElementById('quickXpPerPet').textContent = '+' + formatNumber(effects.xpPerPat);
  document.getElementById('quickAutoRate').textContent = effects.autoPatsPerSec > 0
    ? `${effects.autoPatsPerSec.toFixed(1)}/сек`
    : 'Вимкнено';

  // Індикатори-крапки на кнопках бічної панелі
  const achReady = countClaimableAchievements();
  const achBadge = document.getElementById('achBadge');
  achBadge.hidden = achReady === 0;
  achBadge.textContent = achReady;

  const questReady = countClaimableQuests();
  const questBadge = document.getElementById('questBadge');
  questBadge.hidden = questReady === 0;
  questBadge.textContent = questReady;

  const dailyDot = document.getElementById('dailyDot');
  dailyDot.hidden = !isDailyRewardAvailable();
}

function renderLocationBar() {
  const bar = document.getElementById('locationBar');
  bar.innerHTML = '';
  LOCATIONS.forEach((loc) => {
    const unlocked = isLocationUnlocked(loc);
    const chip = document.createElement('button');
    chip.className = 'location-chip' + (loc.id === state.currentLocation ? ' active' : '') + (!unlocked ? ' locked' : '');
    chip.innerHTML = unlocked
      ? `<span>${loc.emoji}</span><span>${loc.name}</span>`
      : `<span class="lock-icon">🔒</span><span>${loc.name} (рів. ${loc.unlockLevel})</span>`;
    if (unlocked) {
      chip.addEventListener('click', () => switchLocation(loc.id));
    }
    bar.appendChild(chip);
  });
}

function switchLocation(locationId) {
  if (state.currentLocation === locationId) return;
  state.currentLocation = locationId;

  if (!state.session.visitedLocationsSet.includes(locationId)) {
    state.session.visitedLocationsSet.push(locationId);
    state.session.sessionLocationsVisited = state.session.visitedLocationsSet.length;
  }

  // Автоматично обираємо першу розблоковану тваринку в новій локації, якщо є
  const petsHere = petsInLocation(locationId).filter(isPetUnlocked);
  if (petsHere.length > 0) {
    state.currentPetId = petsHere[0].id;
  }

  renderLocationBar();
  renderStage();
  checkQuestProgress();
}

function renderStage() {
  const loc = getCurrentLocationData();
  document.getElementById('stageBg').style.background = loc.bg;

  const pet = getCurrentPet();
  document.getElementById('petEmoji').textContent = pet.emoji;
  document.getElementById('petNameTag').textContent = `${pet.name} · ${RARITY[pet.rarity].label}`;

  const ring = document.getElementById('petRarityRing');
  ring.className = 'pet-rarity-ring rarity-' + pet.rarity;
}

// Перемикання на наступну розблоковану тваринку в поточній локації (кнопка 🔀)
function switchToNextPet() {
  const petsHere = petsInLocation(state.currentLocation).filter(isPetUnlocked);
  if (petsHere.length <= 1) {
    showToast('У цій локації поки немає інших тварин', 'ℹ️');
    return;
  }
  const idx = petsHere.findIndex((p) => p.id === state.currentPetId);
  const next = petsHere[(idx + 1) % petsHere.length];
  state.currentPetId = next.id;
  renderStage();
  playClickSound();
}

/* ==========================================================================
   10. МОДАЛЬНІ ПАНЕЛІ
   ========================================================================== */

function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function openPanel(panelId) {
  playClickSound();
  switch (panelId) {
    case 'shop': renderShopModal(); break;
    case 'achievements': renderAchievementsModal(); break;
    case 'collection': renderCollectionModal(); break;
    case 'quests': renderQuestsModal(); break;
    case 'wheel': renderWheelModal(); break;
    case 'daily': renderDailyModal(); break;
    case 'stats': renderStatsModal(); break;
    case 'stage-focus': closeMobilePanels(); return; // мобільна кнопка "додому" — просто закриває панелі
    default: return;
  }
}

/* --- МАГАЗИН --- */

let currentShopTab = 'boost';

function renderShopModal() {
  const items = UPGRADES.filter((u) => u.category === currentShopTab);
  const itemsHtml = items.map((u) => {
    const lvl = getUpgradeLevel(u.id);
    const maxed = lvl >= u.maxLevel;
    const cost = getUpgradeCost(u);
    const canAfford = state.coins >= cost;
    return `
      <div class="shop-item">
        <div class="shop-item-icon">${u.icon}</div>
        <div class="shop-item-info">
          <div class="shop-item-name">${u.name}</div>
          <div class="shop-item-desc">${u.desc}</div>
          <div class="shop-item-level">Рівень ${lvl} / ${u.maxLevel}</div>
        </div>
        <button class="shop-buy-btn ${maxed ? 'maxed' : ''}" data-upgrade="${u.id}" ${(!canAfford && !maxed) ? 'disabled' : ''} ${maxed ? 'disabled' : ''}>
          ${maxed ? 'МАКС ✓' : `🪙 ${formatNumber(cost)}`}
        </button>
      </div>`;
  }).join('');

  const html = `
    <div class="modal-title">🛒 Магазин покращень</div>
    <div class="modal-subtitle">Покращуйте здібності, щоб гладити ефективніше</div>
    <div class="shop-tabs">
      <button class="shop-tab ${currentShopTab === 'boost' ? 'active' : ''}" data-tab="boost">⚡ Покращення</button>
      <button class="shop-tab ${currentShopTab === 'auto' ? 'active' : ''}" data-tab="auto">🤖 Автозаробіток</button>
    </div>
    <div class="shop-grid">${itemsHtml || '<p style="text-align:center;color:var(--ink-soft)">Немає предметів у цій категорії</p>'}</div>
  `;
  openModal(html);

  document.querySelectorAll('.shop-tab').forEach((btn) => {
    btn.addEventListener('click', () => { currentShopTab = btn.dataset.tab; renderShopModal(); });
  });
  document.querySelectorAll('.shop-buy-btn').forEach((btn) => {
    btn.addEventListener('click', () => buyUpgrade(btn.dataset.upgrade));
  });
}

function buyUpgrade(upgradeId) {
  const upgrade = UPGRADES.find((u) => u.id === upgradeId);
  if (!upgrade) return;
  const lvl = getUpgradeLevel(upgradeId);
  if (lvl >= upgrade.maxLevel) return;
  const cost = getUpgradeCost(upgrade);
  if (state.coins < cost) {
    playChimeSound(false);
    return;
  }
  state.coins -= cost;
  state.upgrades[upgradeId] = lvl + 1;
  state.session.sessionUpgradesBought++;
  playChimeSound(true);
  showToast(`${upgrade.name} покращено до рівня ${lvl + 1}!`, upgrade.icon);
  refreshHud();
  checkQuestProgress();
  renderShopModal();
}

/* --- КОЛЕКЦІЯ --- */

function renderCollectionModal() {
  const cardsHtml = PETS.map((p) => {
    const unlocked = isPetUnlocked(p);
    return `
      <div class="collection-card ${unlocked ? '' : 'locked'}">
        <span class="collection-rarity-tag tag-${p.rarity}">${RARITY[p.rarity].label[0]}</span>
        <span class="collection-emoji">${unlocked ? p.emoji : '❔'}</span>
        <span class="collection-name">${unlocked ? p.name : 'рів. ' + p.unlockLevel}</span>
      </div>`;
  }).join('');

  const unlockedCount = state.unlockedPetIds.length;
  const html = `
    <div class="modal-title">📖 Колекція тварин</div>
    <div class="modal-subtitle">Відкрито ${unlockedCount} з ${PETS.length}</div>
    <div class="collection-grid">${cardsHtml}</div>
  `;
  openModal(html);
}

/* --- ДОСЯГНЕННЯ --- */

function getStatValue(statKey) {
  if (statKey === 'unlockedPetsCount') return state.unlockedPetIds.length;
  if (statKey === 'goldenUnlocked') return state.goldenUnlocked || 0;
  if (statKey === 'mythicUnlocked') return state.mythicUnlocked || 0;
  return state[statKey] || 0;
}

function countClaimableAchievements() {
  return ACHIEVEMENTS.filter((a) => !state.achievementsClaimed.includes(a.id) && getStatValue(a.stat) >= a.goal).length;
}

function renderAchievementsModal() {
  const itemsHtml = ACHIEVEMENTS.map((a) => {
    const progress = Math.min(getStatValue(a.stat), a.goal);
    const claimed = state.achievementsClaimed.includes(a.id);
    const ready = !claimed && progress >= a.goal;
    const pct = Math.min(100, (progress / a.goal) * 100);
    const rewardText = Object.entries(a.reward).map(([k, v]) => `${v}${k === 'coins' ? '🪙' : '💎'}`).join(' ');
    return `
      <div class="ach-item ${claimed ? 'done' : ''}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-info">
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc} · Нагорода: ${rewardText}</div>
          <div class="ach-progress-track"><div class="ach-progress-fill" style="width:${pct}%"></div></div>
        </div>
        ${claimed
          ? '<div class="ach-check">✅</div>'
          : `<button class="shop-buy-btn" data-claim-ach="${a.id}" ${ready ? '' : 'disabled'}>${ready ? 'Забрати' : `${formatNumber(progress)}/${formatNumber(a.goal)}`}</button>`}
      </div>`;
  }).join('');

  const html = `
    <div class="modal-title">🏆 Досягнення</div>
    <div class="modal-subtitle">Виконуйте цілі, щоб отримати винагороди</div>
    <div class="ach-list">${itemsHtml}</div>
  `;
  openModal(html);

  document.querySelectorAll('[data-claim-ach]').forEach((btn) => {
    btn.addEventListener('click', () => claimAchievement(btn.dataset.claimAch));
  });
}

function claimAchievement(achId) {
  const a = ACHIEVEMENTS.find((x) => x.id === achId);
  if (!a || state.achievementsClaimed.includes(achId)) return;
  if (getStatValue(a.stat) < a.goal) return;
  state.achievementsClaimed.push(achId);
  if (a.reward.coins) addCoins(a.reward.coins, true);
  if (a.reward.gems) state.gems += a.reward.gems;
  playChimeSound(true);
  showToast(`Досягнення "${a.name}" виконано!`, a.icon);
  refreshHud();
  renderAchievementsModal();
}

// Автоматична перевірка (без модалки) — оновлює лічильник-бейдж
function checkAchievements() {
  // Логіка нарахування вже в getStatValue/claimAchievement; тут лише оновлюємо бейдж через refreshHud()
}

/* --- ЩОДЕННІ ЗАВДАННЯ --- */

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Генерує 3 випадкові завдання на день, якщо ще не згенеровано сьогодні
function ensureDailyQuests() {
  if (state.questsGeneratedDate === todayStr() && state.activeQuests.length > 0) return;
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  state.activeQuests = shuffled.slice(0, 3).map((q) => ({ id: q.id, progress: 0, claimed: false }));
  state.questsGeneratedDate = todayStr();
  // Скидаємо сесійну статистику для чесного відліку прогресу завдань
  state.session.sessionPats = 0;
  state.session.sessionCoins = 0;
  state.session.sessionUpgradesBought = 0;
  state.session.sessionWheelSpins = 0;
  state.session.sessionBonuses = 0;
}

function countClaimableQuests() {
  return state.activeQuests.filter((aq) => {
    const q = QUEST_POOL.find((x) => x.id === aq.id);
    return q && !aq.claimed && getStatValue(q.stat) >= q.goal;
  }).length;
}

function checkQuestProgress() {
  // Прогрес рахується напряму з session-статистики під час рендеру; тут лише оновлюємо HUD-бейдж
  refreshHudBadgesOnly();
}

function refreshHudBadgesOnly() {
  const questBadge = document.getElementById('questBadge');
  const questReady = countClaimableQuests();
  questBadge.hidden = questReady === 0;
  questBadge.textContent = questReady;

  const achBadge = document.getElementById('achBadge');
  const achReady = countClaimableAchievements();
  achBadge.hidden = achReady === 0;
  achBadge.textContent = achReady;
}

function renderQuestsModal() {
  ensureDailyQuests();
  const itemsHtml = state.activeQuests.map((aq) => {
    const q = QUEST_POOL.find((x) => x.id === aq.id);
    if (!q) return '';
    const progress = Math.min(getStatValue(q.stat), q.goal);
    const ready = !aq.claimed && progress >= q.goal;
    const rewardText = Object.entries(q.reward).map(([k, v]) => `${v}${k === 'coins' ? '🪙' : '💎'}`).join(' ');
    return `
      <div class="quest-item">
        <div class="ach-icon">${q.icon}</div>
        <div class="quest-info">
          <div class="quest-name">${q.name}</div>
          <div class="quest-reward">Прогрес: ${formatNumber(progress)}/${formatNumber(q.goal)} · ${rewardText}</div>
        </div>
        <button class="quest-claim-btn" data-claim-quest="${aq.id}" ${(ready && !aq.claimed) ? '' : 'disabled'}>
          ${aq.claimed ? 'Отримано' : 'Забрати'}
        </button>
      </div>`;
  }).join('');

  const html = `
    <div class="modal-title">📋 Щоденні завдання</div>
    <div class="modal-subtitle">Оновлюються щодня — встигніть виконати!</div>
    ${itemsHtml}
  `;
  openModal(html);

  document.querySelectorAll('[data-claim-quest]').forEach((btn) => {
    btn.addEventListener('click', () => claimQuest(btn.dataset.claimQuest));
  });
}

function claimQuest(questInstanceId) {
  const aq = state.activeQuests.find((x) => x.id === questInstanceId);
  const q = QUEST_POOL.find((x) => x.id === questInstanceId);
  if (!aq || !q || aq.claimed) return;
  if (getStatValue(q.stat) < q.goal) return;
  aq.claimed = true;
  if (q.reward.coins) addCoins(q.reward.coins, true);
  if (q.reward.gems) state.gems += q.reward.gems;
  playChimeSound(true);
  showToast(`Завдання виконано: ${q.name}`, '📋');
  refreshHud();
  renderQuestsModal();
}

/* --- КОЛЕСО УДАЧІ --- */

let wheelSpinning = false;

function renderWheelModal() {
  const n = WHEEL_SECTORS.length;
  const anglePer = 360 / n;
  const radius = 100;
  const cx = 110, cy = 110;

  let paths = '';
  WHEEL_SECTORS.forEach((sector, i) => {
    const startAngle = (i * anglePer - 90) * (Math.PI / 180);
    const endAngle = ((i + 1) * anglePer - 90) * (Math.PI / 180);
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const midAngle = (startAngle + endAngle) / 2;
    const textX = cx + (radius * 0.62) * Math.cos(midAngle);
    const textY = cy + (radius * 0.62) * Math.sin(midAngle);
    const textRotDeg = (midAngle * 180 / Math.PI) + 90;
    paths += `<path d="M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z" fill="${sector.color}" stroke="#fff" stroke-width="2"/>`;
    paths += `<text x="${textX}" y="${textY}" font-size="9" font-weight="800" fill="#4A3F55" text-anchor="middle" transform="rotate(${textRotDeg} ${textX} ${textY})">${sector.label}</text>`;
  });

  const canSpinFree = canSpinWheelFree();

  const html = `
    <div class="modal-title">🎡 Колесо удачі</div>
    <div class="modal-subtitle">${canSpinFree ? 'Безкоштовний спін доступний!' : 'Наступний безкоштовний спін — завтра. Або крутіть за 💎 20'}</div>
    <div class="wheel-wrap">
      <div class="wheel-outer">
        <div class="wheel-pointer">🔻</div>
        <svg id="wheelSvg" width="220" height="220" viewBox="0 0 220 220">${paths}</svg>
      </div>
      <button class="wheel-spin-btn" id="wheelSpinBtn">${canSpinFree ? 'Крутити безкоштовно' : 'Крутити за 💎 20'}</button>
    </div>
  `;
  openModal(html);

  document.getElementById('wheelSpinBtn').addEventListener('click', spinWheel);
}

function canSpinWheelFree() {
  return state.lastWheelSpin !== todayStr();
}

function spinWheel() {
  if (wheelSpinning) return;
  const free = canSpinWheelFree();
  if (!free) {
    if (state.gems < 20) { playChimeSound(false); showToast('Недостатньо самоцвітів', '💎'); return; }
    state.gems -= 20;
  }

  wheelSpinning = true;
  const btn = document.getElementById('wheelSpinBtn');
  btn.disabled = true;

  const sectorIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
  const anglePer = 360 / WHEEL_SECTORS.length;
  const targetRotation = 360 * 5 + (360 - sectorIndex * anglePer - anglePer / 2);

  const svg = document.getElementById('wheelSvg');
  svg.style.transform = `rotate(${targetRotation}deg)`;

  setTimeout(() => {
    const sector = WHEEL_SECTORS[sectorIndex];
    if (sector.type === 'coins') addCoins(sector.value, true);
    else if (sector.type === 'xp') addXp(sector.value);
    else if (sector.type === 'gems') state.gems += sector.value;

    state.wheelSpins++;
    state.session.sessionWheelSpins++;
    if (free) state.lastWheelSpin = todayStr();

    playChimeSound(true);
    showToast(`Колесо удачі: ${sector.label}!`, '🎡');
    refreshHud();
    checkQuestProgress();
    wheelSpinning = false;
    if (!document.getElementById('modalOverlay').classList.contains('hidden')) {
      renderWheelModal();
    }
  }, 4100);
}

/* --- ЩОДЕННІ НАГОРОДИ --- */

function isDailyRewardAvailable() {
  return state.lastDailyClaim !== todayStr();
}

function getDailyDayIndex() {
  // Повертає день циклу (1-7) з урахуванням streak
  return ((state.dailyStreak) % 7) + 1;
}

function renderDailyModal() {
  const available = isDailyRewardAvailable();
  const currentDay = getDailyDayIndex();

  const gridHtml = DAILY_REWARDS.map((r) => {
    let cls = 'future';
    if (r.day < currentDay) cls = 'claimed';
    else if (r.day === currentDay) cls = available ? 'today' : 'claimed';
    return `
      <div class="daily-day ${cls}">
        <span class="daily-day-emoji">${r.emoji}</span>
        День ${r.day}<br/>${r.coins}🪙${r.gems ? ' ' + r.gems + '💎' : ''}
      </div>`;
  }).join('');

  const html = `
    <div class="modal-title">🎁 Щоденна нагорода</div>
    <div class="modal-subtitle">Заходьте щодня, щоб не втратити серію! Поточна серія: ${state.dailyStreak} дн.</div>
    <div class="daily-grid">${gridHtml}</div>
    <div style="margin-top:18px; text-align:center;">
      <button class="wheel-spin-btn" id="dailyClaimBtn" ${available ? '' : 'disabled'}>
        ${available ? 'Забрати нагороду' : 'Вже забрано сьогодні'}
      </button>
    </div>
  `;
  openModal(html);

  if (available) {
    document.getElementById('dailyClaimBtn').addEventListener('click', claimDailyReward);
  }
}

function claimDailyReward() {
  if (!isDailyRewardAvailable()) return;
  const dayIndex = getDailyDayIndex();
  const reward = DAILY_REWARDS.find((r) => r.day === dayIndex) || DAILY_REWARDS[0];

  addCoins(reward.coins, true);
  if (reward.gems) state.gems += reward.gems;
  state.lastDailyClaim = todayStr();
  state.dailyStreak++;

  playChimeSound(true);
  showToast(`Щоденна нагорода: +${reward.coins}🪙${reward.gems ? ' +' + reward.gems + '💎' : ''}`, reward.emoji);
  refreshHud();
  checkQuestProgress();
  renderDailyModal();
}

/* --- СТАТИСТИКА --- */

function renderStatsModal() {
  const playDays = Math.max(1, Math.ceil((Date.now() - state.createdAt) / 86400000));
  const html = `
    <div class="modal-title">📊 Статистика</div>
    <div class="modal-subtitle">Ваш шлях у Pet Paradise</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-box-label">Погладжувань всього</div><div class="stat-box-value">${formatNumber(state.totalPats)}</div></div>
      <div class="stat-box"><div class="stat-box-label">Монет зароблено</div><div class="stat-box-value">${formatNumber(state.totalCoinsEarned)}</div></div>
      <div class="stat-box"><div class="stat-box-label">Поточний рівень</div><div class="stat-box-value">${state.level}</div></div>
      <div class="stat-box"><div class="stat-box-label">Тварин відкрито</div><div class="stat-box-value">${state.unlockedPetIds.length}/${PETS.length}</div></div>
      <div class="stat-box"><div class="stat-box-label">Любов тварин</div><div class="stat-box-value">${formatNumber(state.love)}</div></div>
      <div class="stat-box"><div class="stat-box-label">Спінів колеса</div><div class="stat-box-value">${state.wheelSpins}</div></div>
      <div class="stat-box"><div class="stat-box-label">Серія днів</div><div class="stat-box-value">${state.dailyStreak}</div></div>
      <div class="stat-box"><div class="stat-box-label">Днів у грі</div><div class="stat-box-value">${playDays}</div></div>
    </div>
  `;
  openModal(html);
}

/* ==========================================================================
   11. МОБІЛЬНІ ПАНЕЛІ (відкриття/закриття бічних меню на телефоні)
   ========================================================================== */

let sideScrimEl = null;

function ensureScrim() {
  if (sideScrimEl) return sideScrimEl;
  sideScrimEl = document.createElement('div');
  sideScrimEl.className = 'side-scrim';
  sideScrimEl.addEventListener('click', closeMobilePanels);
  document.body.appendChild(sideScrimEl);
  return sideScrimEl;
}

function openMobileLeft() {
  document.getElementById('sideLeft').classList.add('open');
  ensureScrim().classList.add('show');
}

function closeMobilePanels() {
  document.getElementById('sideLeft').classList.remove('open');
  document.getElementById('sideRight').classList.remove('open');
  if (sideScrimEl) sideScrimEl.classList.remove('show');
}

/* ==========================================================================
   12. СКИДАННЯ ПРОГРЕСУ
   ========================================================================== */

function resetProgress() {
  const confirmed = window.confirm('Ви впевнені, що хочете скинути весь прогрес? Цю дію неможливо скасувати.');
  if (!confirmed) return;
  const doubleCheck = window.confirm('Це остання перевірка: весь прогрес, тварини та покращення будуть втрачені назавжди. Продовжити?');
  if (!doubleCheck) return;

  localStorage.removeItem(SAVE_KEY);
  state = createDefaultState();
  closeModal();
  closeMobilePanels();
  renderLocationBar();
  renderStage();
  refreshHud();
  applySettingsToUi();
  showToast('Прогрес скинуто. Гарного нового старту!', '🔄');
}

/* ==========================================================================
   13. НАЛАШТУВАННЯ
   ========================================================================== */

function applySettingsToUi() {
  document.getElementById('toggleSfx').checked = state.settings.sfx;
  document.getElementById('toggleMusic').checked = state.settings.music;
  document.getElementById('toggleParticles').checked = state.settings.particles;
  document.getElementById('volumeSlider').value = state.settings.volume;
}

function bindSettingsHandlers() {
  document.getElementById('toggleSfx').addEventListener('change', (e) => {
    state.settings.sfx = e.target.checked;
    if (state.settings.sfx) playClickSound();
  });
  document.getElementById('toggleMusic').addEventListener('change', (e) => {
    state.settings.music = e.target.checked;
    if (state.settings.music) startMusic(); else stopMusic();
  });
  document.getElementById('toggleParticles').addEventListener('change', (e) => {
    state.settings.particles = e.target.checked;
  });
  document.getElementById('volumeSlider').addEventListener('input', (e) => {
    state.settings.volume = Number(e.target.value);
  });
}

/* ==========================================================================
   14. ІНІЦІАЛІЗАЦІЯ ТА ОБРОБНИКИ ПОДІЙ
   ========================================================================== */

function bindCoreHandlers() {
  // Клік/дотик по тваринці
  const petBtn = document.getElementById('petBtn');
  petBtn.addEventListener('click', (e) => {
    performPat(false, e.clientX, e.clientY);
  });

  // Проведення мишкою/пальцем також гладить (з урахуванням кулдауну)
  let isPointerDown = false;
  petBtn.addEventListener('pointerdown', () => { isPointerDown = true; });
  window.addEventListener('pointerup', () => { isPointerDown = false; });
  petBtn.addEventListener('pointermove', (e) => {
    if (isPointerDown) performPat(false, e.clientX, e.clientY);
  });

  document.getElementById('switchPetBtn').addEventListener('click', switchToNextPet);

  // Бічні панелі (десктоп + мобільні дублікати)
  document.querySelectorAll('.side-btn[data-panel]').forEach((btn) => {
    btn.addEventListener('click', () => openPanel(btn.dataset.panel));
  });
  document.querySelectorAll('.tab-btn[data-panel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      openPanel(btn.dataset.panel);
    });
  });

  // Модальне вікно
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeMobilePanels(); }
  });

  // Мобільне меню-гамбургер
  document.getElementById('btnMenuMobile').addEventListener('click', openMobileLeft);

  // Скидання прогресу
  document.getElementById('resetBtn').addEventListener('click', resetProgress);

  // Перший клік/дотик по документу — розблоковує AudioContext (вимога браузерів) і запускає музику
  const unlockAudio = () => {
    getAudioCtx();
    startMusic();
    document.removeEventListener('pointerdown', unlockAudio);
  };
  document.addEventListener('pointerdown', unlockAudio, { once: true });
}

function init() {
  const hasExistingSave = loadGame();

  // Перевіряємо зміну доби відносно останнього візиту — скидаємо частину сесійної статистики для завдань
  ensureDailyQuests();

  renderLocationBar();
  renderStage();
  refreshHud();
  applySettingsToUi();
  bindSettingsHandlers();
  bindCoreHandlers();
  startAutosave();
  requestAnimationFrame(autoPatLoop);

  window.addEventListener('beforeunload', saveGame);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveGame();
  });

  if (hasExistingSave) {
    showToast('З поверненням у Pet Paradise!', '🐾');
  }
}

// Симуляція завантажувального екрану з приємними підказками, потім старт гри
const LOADING_HINTS = [
  'Готуємо мискy з водою…',
  'Розкладаємо іграшки для котів…',
  'Чистимо доріжки в парку…',
  'Будимо сплячих цуценят…',
  'Насипаємо корм у мисочки…',
];

function runLoadingScreen() {
  const fill = document.getElementById('loadingFill');
  const hint = document.getElementById('loadingHint');
  let progress = 0;
  let hintIndex = 0;

  const interval = setInterval(() => {
    progress += 8 + Math.random() * 12;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('game-root').classList.remove('hidden');
        init();
      }, 250);
    }
    fill.style.width = progress + '%';
    if (Math.random() < 0.4) {
      hintIndex = (hintIndex + 1) % LOADING_HINTS.length;
      hint.textContent = LOADING_HINTS[hintIndex];
    }
  }, 180);
}

document.addEventListener('DOMContentLoaded', runLoadingScreen);
