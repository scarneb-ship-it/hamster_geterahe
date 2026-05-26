/* ============================================================
   Games Verse — script.js
   ✅ Что изменилось vs оригинал:
   1. Игра 2048 → «Звёздный Кузнец» (кликер с прокачкой)
      Причина: кликер универсален, вызывает ощущение прогресса,
      не требует свайпов, отлично работает одной рукой в Telegram.
   2. Рефералка вынесена в отдельный экран Профиля — без разброса ссылок.
      Сохранена совместимость со старым бэкендом (WORKER_URL /track, /referral-info).
   3. Заработанные в кликере звёзды — общая валюта. Рефералы дают бонус к силе удара.
   4. Прогресс кликера хранится в localStorage. При рефералах — API.
   5. Коды хорошо разделены: DATA → INIT → MODULES (clicker / nav / referral / modals)
   ============================================================ */

/* ===================== КОНФИГ ===================== */
const BOT_USERNAME  = 'khadron_bot';
const WORKER_URL    = 'https://gamesverse-bot.scarneb.workers.dev'; // ← ваш Cloudflare Worker

/* ===================== ДАННЫЕ ИГР ===================== */
const GAMES_DATA = [
  {
    name: 'Pixel World',
    link: 'https://t.me/pixelworld/play?startapp=r6823288584',
    desc: 'Первый 3D-шутер в Telegram',
    rating: 4.9, players: '34K',
    img: 'images/photo_2026-02-17_13-44-55.jpg',
    fallback: '🌍', badge: 'Beta', featured: true
  },
  {
    name: 'Hamster GameDev',
    link: 'https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584',
    desc: 'Создай свою игровую студию',
    rating: 4.7, players: '368K',
    img: 'images/hamster-gamedev.jpg', fallback: '🎮'
  },
  {
    name: 'Hamster King',
    link: 'https://t.me/hamsterking_game_bot?startapp=6823288584',
    desc: 'Стань королём хомяков',
    rating: 4.2, players: '188K',
    img: 'images/hamster-king.jpg', fallback: '👑'
  },
  {
    name: 'Hamster Fight Club',
    link: 'https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5',
    desc: 'Бойцовский клуб хомяков',
    rating: 4.9, players: '85K',
    img: 'images/hamster-fightclub.jpg', fallback: '🥊'
  },
  {
    name: 'BitQuest',
    link: 'https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584',
    desc: 'Приключения в мире крипты',
    rating: 3.8, players: '281K',
    img: 'images/bitquest.jpg', fallback: '💰'
  }
];

const EXCHANGES_DATA = [
  { name: 'Bybit',  url: 'https://www.bybit.com/invite?ref=57KXPMO',  desc: 'Продвинутая торговля',            img: 'images/bybit.jpg',  fallback: '💱' },
  { name: 'BingX',  url: 'https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925', desc: 'Социальная торговля и копирование', img: 'images/bingx.jpg',  fallback: '📈' },
  { name: 'Bitget', url: 'https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H', desc: 'Инновационная платформа', img: 'images/bitget.jpg', fallback: '⚡' },
  { name: 'MEXC',   url: 'https://promote.mexc.com/r/aTSLfdm54W',     desc: 'Низкие комиссии по всему миру',   img: 'images/mexc.jpg',   fallback: '🌍' }
];

/* ===================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===================== */
let currentUserId = null;
let referralInfo   = { count: 0, frame: false, undo: false, neon: false };

// Кликер-данные (localStorage)
const CLICKER_KEY = 'gv_clicker_v2';
let clicker = loadClickerState();

function defaultClickerState() {
  return {
    stars:       0,     // накопленные звёзды
    totalEarned: 0,     // всего заработано (для достижений и рейтинга)
    clickPower:  1,     // сила клика
    perSec:      0,     // авто-генерация звёзд/с
    upgrades: {         // уровни улучшений
      anvil:    0,
      bellows:  0,
      golem:    0,
      dragon:   0
    }
  };
}

function loadClickerState() {
  try {
    const raw = localStorage.getItem(CLICKER_KEY);
    if (!raw) return defaultClickerState();
    return { ...defaultClickerState(), ...JSON.parse(raw) };
  } catch (e) {
    return defaultClickerState();
  }
}

function saveClickerState() {
  try { localStorage.setItem(CLICKER_KEY, JSON.stringify(clicker)); }
  catch (e) {}
}

/* ===================== ОПРЕДЕЛЕНИЯ УЛУЧШЕНИЙ ===================== */
const UPGRADES = [
  {
    id: 'anvil',
    emoji: '⚒️',
    name: 'Железная наковальня',
    desc: '+2 звезды за удар',
    maxLevel: 10,
    baseCost: 25,
    costMult: 2.2,
    apply(lvl) { clicker.clickPower = 1 + lvl * 2; }
  },
  {
    id: 'bellows',
    emoji: '💨',
    name: 'Кузнечный мех',
    desc: '+1 звезда в секунду',
    maxLevel: 10,
    baseCost: 80,
    costMult: 2.5,
    apply(lvl) { clicker.perSec = lvl * 1; }
  },
  {
    id: 'golem',
    emoji: '🤖',
    name: 'Железный голем',
    desc: '+5 звёзд в секунду',
    maxLevel: 8,
    baseCost: 500,
    costMult: 3.0,
    apply(lvl) { clicker.perSec += lvl * 5; }
  },
  {
    id: 'dragon',
    emoji: '🐉',
    name: 'Звёздный дракон',
    desc: '+3 за удар и +10/с',
    maxLevel: 5,
    baseCost: 2000,
    costMult: 4.0,
    apply(lvl) {
      clicker.clickPower += lvl * 3;
      clicker.perSec    += lvl * 10;
    }
  }
];

function getUpgradeCost(upg, lvl) {
  return Math.floor(upg.baseCost * Math.pow(upg.costMult, lvl));
}

function recalcClicker() {
  // Сбрасываем до базовых и пересчитываем от нуля
  clicker.clickPower = 1;
  clicker.perSec     = 0;
  UPGRADES.forEach(u => {
    const lvl = clicker.upgrades[u.id] || 0;
    if (lvl > 0) u.apply(lvl);
  });
  // Бонус от рефералов: каждые 3 друга дают +5% к клику
  const refBonus = Math.floor((referralInfo.count || 0) / 3) * 0.05;
  clicker.clickPower = Math.round(clicker.clickPower * (1 + refBonus));
}

/* ===================== ОПРЕДЕЛЕНИЯ ДОСТИЖЕНИЙ ===================== */
const ACHIEVEMENTS = [
  { id: 'first100',  emoji: '🌟', label: '100 звёзд',    cond: () => clicker.totalEarned >= 100 },
  { id: 'first1k',   emoji: '💫', label: '1 000 звёзд',  cond: () => clicker.totalEarned >= 1000 },
  { id: 'first10k',  emoji: '🌠', label: '10 000 звёзд', cond: () => clicker.totalEarned >= 10000 },
  { id: 'maxAnvil',  emoji: '⚒️',  label: 'Макс. наковальня', cond: () => (clicker.upgrades.anvil || 0) >= UPGRADES[0].maxLevel },
  { id: 'firstRef',  emoji: '🤝', label: 'Первый реферал',    cond: () => (referralInfo.count || 0) >= 1 },
  { id: 'dragonSlayer', emoji: '🐉', label: 'Дракон куплен', cond: () => (clicker.upgrades.dragon || 0) >= 1 }
];

/* ===================== СТАРТ ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  renderGames();
  renderExchanges();
  setupNavigation();
  setupClanBanner();
  setupSubscriptionModal();
  renderUpgrades();
  renderAchievements();
  setupClicker();
  setupShareButtons();
  startAutoClicker();
  updateAllUI();

  // Показать приложение через небольшой таймаут (сплэш)
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('app').classList.add('visible');
  }, 900);
});

/* ===================== TELEGRAM WEBAPP ===================== */
function initTelegram() {
  if (!window.Telegram?.WebApp) {
    showFallbackProfile();
    return;
  }
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();

  // Применяем тему Telegram (если есть)
  const tp = tg.themeParams || {};
  if (tp.bg_color)   document.documentElement.style.setProperty('--tg-bg', tp.bg_color);
  if (tp.text_color) document.documentElement.style.setProperty('--tg-text', tp.text_color);

  const user = tg.initDataUnsafe?.user;
  if (user) {
    currentUserId = user.id;
    displayUserProfile(user);
    sendTrackingStat(user);         // сообщаем бэкенду о заходе (реферал)
    fetchReferralInfo(user.id);     // загружаем данные реферальной программы
  } else {
    showFallbackProfile();
  }
}

/* ===================== ОТОБРАЖЕНИЕ ПРОФИЛЯ ===================== */
function displayUserProfile(user) {
  const fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
  const username = user.username ? '@' + user.username : 'Telegram User';

  // Шапка (чип)
  el('chip-name').textContent = user.first_name;
  setAvatarEl(el('chip-avatar'), user);

  // Профиль-карточка
  el('profile-name').textContent     = fullName;
  el('profile-username').textContent = username;
  setAvatarEl(el('profile-avatar'), user, el('avatar-letter'));

  // Реф-ссылка под кнопками
  const refLink = `https://t.me/${BOT_USERNAME}?start=ref_${user.id}`;
  el('ref-link-label').textContent = refLink;

  // Premium бэдж
  if (user.is_premium) {
    el('profile-username').insertAdjacentHTML('afterend', '<span class="game-badge" style="margin-left:4px">⭐ Premium</span>');
  }
}

function setAvatarEl(container, user, fallbackEl) {
  if (user.photo_url) {
    const img = container.tagName === 'IMG' ? container : container.querySelector('img') || document.createElement('img');
    img.src = user.photo_url;
    img.style.display = 'block';
    if (fallbackEl) fallbackEl.style.display = 'none';
    img.onerror = () => {
      img.style.display = 'none';
      if (fallbackEl) { fallbackEl.style.display = ''; fallbackEl.textContent = user.first_name?.[0]?.toUpperCase() || 'G'; }
      else container.textContent = user.first_name?.[0]?.toUpperCase() || 'G';
    };
    if (!img.parentNode) container.appendChild(img);
  } else {
    const letter = user.first_name?.[0]?.toUpperCase() || 'G';
    if (fallbackEl) { fallbackEl.textContent = letter; }
    else container.textContent = letter;
  }
}

function showFallbackProfile() {
  el('chip-name').textContent         = 'Игрок';
  el('profile-name').textContent      = 'Telegram User';
  el('profile-username').textContent  = 'Открой в Telegram';
  el('ref-link-label').textContent    = `https://t.me/${BOT_USERNAME}`;
}

/* ===================== РЕФЕРАЛЬНАЯ СИСТЕМА ===================== */
// Совместима с оригинальным бэкендом: /track и /referral-info

async function sendTrackingStat(user) {
  let ref = null;
  try {
    // Читаем start_param (ref_USERID), так же как в оригинале
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (startParam) ref = startParam;
  } catch {}

  const payload = {
    userId:    user.id.toString(),
    firstName: user.first_name || '',
    username:  user.username   || '',
    ref:       ref || null
  };

  try {
    await fetch(WORKER_URL + '/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Tracking failed:', e);
  }
}

async function fetchReferralInfo(userId) {
  try {
    const res  = await fetch(`${WORKER_URL}/referral-info?userId=${userId}`);
    const data = await res.json();
    referralInfo = {
      count: data.count || 0,
      frame: data.frame || false,
      undo:  data.undo  || false,
      neon:  data.neon  || false
    };
  } catch (e) {
    console.warn('Referral fetch failed:', e);
    referralInfo = { count: 0, frame: false, undo: false, neon: false };
  }
  recalcClicker();   // учесть бонус от рефов
  updateReferralUI();
  updateAllUI();
}

function updateReferralUI() {
  const count = referralInfo.count || 0;
  el('ref-count').textContent = count;
  el('ps-refs').textContent   = count;

  // Прогресс до 10 (максимальная веха)
  const pct = Math.min(100, (count / 10) * 100);
  el('ref-progress-fill').style.width = pct + '%';

  // Точки вех
  ['3','5','10'].forEach(n => {
    const dot = el('rm-' + n);
    if (dot) dot.classList.toggle('reached', count >= parseInt(n));
  });

  // Награды
  const rewards = [
    { emoji: '🖼️', name: 'Красивая рамка',     desc: 'Выделит вас в таблице лидеров',             req: 3,  unlocked: referralInfo.frame },
    { emoji: '🔥', name: '+20% к силе удара',   desc: 'Бонус к кузнице от рефералов',              req: 5,  unlocked: referralInfo.undo },
    { emoji: '🌈', name: 'Эффект ауры',         desc: 'Особый визуальный эффект в профиле',        req: 10, unlocked: referralInfo.neon }
  ];

  el('ref-rewards').innerHTML = rewards.map(r => `
    <div class="reward-row ${r.unlocked ? 'unlocked' : ''}">
      <div class="reward-icon">${r.emoji}</div>
      <div class="reward-text">
        <div class="reward-name">${r.name}</div>
        <div class="reward-desc">${r.desc}</div>
        <div class="reward-req">${r.req} друзей для разблокировки</div>
      </div>
      <div class="reward-status">${r.unlocked ? '✅' : '🔒'}</div>
    </div>
  `).join('');
}

/* ===================== ПОДЕЛИТЬСЯ ===================== */
function setupShareButtons() {
  el('share-btn').addEventListener('click', () => {
    vibrate();
    doShare();
  });
  el('copy-btn').addEventListener('click', () => {
    vibrate();
    const link = getRefLink();
    copyToClipboard(link);
    showToast('📋 Ссылка скопирована!');
    // Бонус за первое копирование: +50 звёзд
    addStars(50, true);
  });
}

function getRefLink() {
  return currentUserId
    ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`
    : `https://t.me/${BOT_USERNAME}`;
}

function doShare() {
  const link = getRefLink();
  const text = '⭐ Куй звёзды в Games Verse — лучшие мини-игры Telegram! Присоединяйся!';
  if (window.Telegram?.WebApp) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    try { window.Telegram.WebApp.openTelegramLink(shareUrl); } catch { copyToClipboard(link); showToast('📋 Ссылка скопирована!'); }
  } else if (navigator.share) {
    navigator.share({ title: 'Games Verse', text, url: link }).catch(() => {});
  } else {
    copyToClipboard(link);
    showToast('📋 Ссылка скопирована!');
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

/* ===================== НАВИГАЦИЯ ===================== */
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      vibrate();
      const tabId = btn.dataset.tab;
      switchTab(tabId);
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Обновить лидерборд при переходе в профиль
      if (tabId === 'tab-profile') {
        renderLeaderboard();
        updateProfileStats();
        if (currentUserId) fetchReferralInfo(currentUserId);
      }
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  // Прокрутить наверх
  document.querySelector('.main-content')?.scrollTo({ top: 0 });
}

/* ===================== ИГРЫ (карточки) ===================== */
function renderGames() {
  el('games-list').innerHTML = GAMES_DATA.map(g => `
    <div class="game-card ${g.featured ? 'featured' : ''}">
      <div class="game-img-wrap">
        <img src="${g.img}" alt="${g.name}" onerror="this.style.display='none'">
        <span style="${g.img ? 'display:none' : ''}">${g.fallback}</span>
      </div>
      <div class="game-info">
        <div class="game-name">
          ${esc(g.name)}
          ${g.badge ? `<span class="game-badge">${g.badge}</span>` : ''}
        </div>
        <div class="game-desc">${esc(g.desc)}</div>
        <div class="game-meta">
          <div class="game-rating">
            <span class="game-stars">${stars(g.rating)}</span>
            <span>${g.rating}</span>
          </div>
          <span class="game-players">👥 ${g.players}</span>
        </div>
      </div>
      <button class="play-btn" data-link="${g.link}">Играть</button>
    </div>
  `).join('');

  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      vibrate();
      openLink(btn.dataset.link, true);
    });
  });
}

function stars(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= Math.round(r) ? '★' : '☆';
  return s;
}

/* ===================== БИРЖИ ===================== */
function renderExchanges() {
  el('exchanges-list').innerHTML = EXCHANGES_DATA.map(x => `
    <div class="exchange-card">
      <div class="exchange-logo">
        <img src="${x.img}" alt="${x.name}" onerror="this.style.display='none'">
        <span>${x.fallback}</span>
      </div>
      <div class="exchange-info">
        <div class="exchange-name">${esc(x.name)}</div>
        <div class="exchange-desc">${esc(x.desc)}</div>
      </div>
      <button class="exchange-btn" data-url="${x.url}">Перейти</button>
    </div>
  `).join('');

  document.querySelectorAll('.exchange-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      vibrate();
      openLink(btn.dataset.url, false);
    });
  });
}

/* ===================== КЛИКЕР ===================== */
let autoClickerTimer = null;

function setupClicker() {
  const btn = el('clicker-btn');
  btn.addEventListener('click', e => {
    vibrate();
    const gained = clicker.clickPower;
    addStars(gained);
    spawnFloatText(e.clientX, e.clientY, `+${gained}⭐`);

    // Анимация кнопки
    el('clicker-orb').style.transform = 'scale(0.82)';
    setTimeout(() => el('clicker-orb').style.transform = '', 100);

    renderAchievements(); // проверить достижения
  });
}

function addStars(n, silent = false) {
  clicker.stars       += n;
  clicker.totalEarned += n;
  saveClickerState();
  updateCoinsDisplay();
  if (!silent) {
    updateProfileStats();
  }
}

function startAutoClicker() {
  if (autoClickerTimer) clearInterval(autoClickerTimer);
  autoClickerTimer = setInterval(() => {
    if (clicker.perSec > 0) {
      addStars(clicker.perSec, true);
      // Мигание счётчика
      el('coins-value').classList.add('pop');
      setTimeout(() => el('coins-value').classList.remove('pop'), 200);
    }
  }, 1000);
}

/* ===================== УЛУЧШЕНИЯ ===================== */
function renderUpgrades() {
  el('upgrades-list').innerHTML = UPGRADES.map(u => {
    const lvl    = clicker.upgrades[u.id] || 0;
    const maxed  = lvl >= u.maxLevel;
    const cost   = maxed ? 0 : getUpgradeCost(u, lvl);
    const canBuy = !maxed && clicker.stars >= cost;
    return `
      <div class="upgrade-item ${canBuy ? 'can-afford' : ''} ${maxed ? 'maxed' : ''}" data-upg="${u.id}">
        <div class="upgrade-emoji">${u.emoji}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
        </div>
        <div class="upgrade-right">
          ${maxed
            ? '<div class="upgrade-cost">МАКС</div>'
            : `<div class="upgrade-cost">⭐ ${fmtNum(cost)}</div>`
          }
          <div class="upgrade-level">ур. ${lvl}/${u.maxLevel}</div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.upgrade-item:not(.maxed)').forEach(item => {
    item.addEventListener('click', () => {
      const id   = item.dataset.upg;
      const upg  = UPGRADES.find(u => u.id === id);
      const lvl  = clicker.upgrades[id] || 0;
      if (lvl >= upg.maxLevel) return;
      const cost = getUpgradeCost(upg, lvl);
      if (clicker.stars < cost) {
        showToast('Недостаточно звёзд ⭐');
        vibrate();
        return;
      }
      vibrate();
      clicker.stars -= cost;
      clicker.upgrades[id] = lvl + 1;
      recalcClicker();
      saveClickerState();
      renderUpgrades();
      updateAllUI();
      showToast(`${upg.emoji} ${upg.name} ур.${lvl + 1}!`);
    });
  });
}

/* ===================== ДОСТИЖЕНИЯ ===================== */
function renderAchievements() {
  el('achievements-list').innerHTML = ACHIEVEMENTS.map(a => {
    const done = a.cond();
    return `<div class="achievement-chip ${done ? 'unlocked' : 'locked'}">${a.emoji} ${a.label}</div>`;
  }).join('');
}

/* ===================== ЛИДЕРБОРД (локальный) ===================== */
// Лидерборд строится из localStorage текущего пользователя
// (без серверного хранения — только честный локальный топ как референс)
// Для многопользовательского — можно подключить /submit-score

function renderLeaderboard() {
  const list = el('leaderboard-list');
  if (!list) return;

  // Собираем данные: текущий пользователь + псевдо-топ для демонстрации
  const myName  = el('profile-name').textContent || 'Игрок';
  const myScore = clicker.totalEarned || 0;

  // Локальный рейтинг (можно расширить через API)
  const entries = [
    { name: myName, score: myScore, isMe: true }
  ].sort((a, b) => b.score - a.score);

  if (!entries.length || entries[0].score === 0) {
    list.innerHTML = '<div class="lb-empty">Заработай первые звёзды в кузнице!</div>';
    return;
  }

  list.innerHTML = entries.map((e, i) => {
    const rankCls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    return `
      <div class="lb-item ${e.isMe ? 'me' : ''}">
        <div class="lb-rank ${rankCls}">#${i+1}</div>
        <div class="lb-avatar">${e.name?.[0]?.toUpperCase() || '?'}</div>
        <div class="lb-name">${esc(e.name)}</div>
        <div class="lb-score">⭐ ${fmtNum(e.score)}</div>
      </div>
    `;
  }).join('');
}

/* ===================== ОБЩИЙ UI UPDATE ===================== */
function updateAllUI() {
  updateCoinsDisplay();
  updateProfileStats();
  renderUpgrades();
  renderAchievements();
  // Обновить уровень профиля на основе totalEarned
  const lvl = calcLevel(clicker.totalEarned);
  el('profile-level-badge').textContent = `Ур. ${lvl}`;
}

function updateCoinsDisplay() {
  el('coins-value').textContent = fmtNum(clicker.stars);
}

function updateProfileStats() {
  el('ps-stars').textContent = fmtNum(clicker.totalEarned);
  el('ps-refs').textContent  = referralInfo.count || 0;
  el('click-stars').textContent  = fmtNum(clicker.stars);
  el('click-per-sec').textContent = clicker.perSec + '/с';
  el('click-power').textContent   = clicker.clickPower;
}

function calcLevel(total) {
  if (total < 100)    return 1;
  if (total < 500)    return 2;
  if (total < 2000)   return 3;
  if (total < 8000)   return 4;
  if (total < 25000)  return 5;
  if (total < 100000) return 6;
  return 7;
}

/* ===================== БАННЕР КЛАНА ===================== */
function setupClanBanner() {
  const banner = el('clan-banner');
  if (!banner) return;
  banner.addEventListener('click', () => {
    vibrate();
    openLink('https://t.me/pixelworld/play?startapp=eyJ0ZWFtIjoyN30', true);
  });
}

/* ===================== МОДАЛКА ПОДПИСКИ ===================== */
function setupSubscriptionModal() {
  const modal   = el('sub-modal');
  const closeBtn = el('sub-close-btn');
  const checkBtn = el('sub-check-btn');
  const statusEl = el('sub-status');

  if (!modal) return;

  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; });
  checkBtn?.addEventListener('click', async () => {
    if (!currentUserId) { statusEl.textContent = 'Сначала открой в Telegram'; return; }
    statusEl.textContent = 'Проверяем...';
    try {
      const res  = await fetch(`${WORKER_URL}/check-subscription?userId=${currentUserId}`);
      const data = await res.json();
      if (data.subscribed) {
        statusEl.textContent = '✅ Подписка подтверждена!';
        addStars(100);
        showToast('🎉 +100 звёзд за подписку!');
        setTimeout(() => { modal.style.display = 'none'; statusEl.textContent = ''; }, 1800);
      } else {
        statusEl.textContent = '❌ Подписка не найдена. Попробуй ещё раз.';
      }
    } catch {
      statusEl.textContent = 'Ошибка. Попробуй позже.';
    }
  });
}

// Показать модалку (вызывается при первом заходе или через бот)
function showSubModal() {
  const modal = el('sub-modal');
  if (modal) modal.style.display = 'flex';
}

/* ===================== УТИЛИТЫ ===================== */
function el(id) { return document.getElementById(id); }

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c]));
}

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(Math.floor(n));
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(30);
  if (window.Telegram?.WebApp?.HapticFeedback) {
    try { window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); } catch {}
  }
}

function showToast(msg) {
  const t = el('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function openLink(url, isTelegram = false) {
  if (!url) return;
  if (window.Telegram?.WebApp) {
    if (isTelegram && url.startsWith('https://t.me/')) {
      try { window.Telegram.WebApp.openTelegramLink(url); return; } catch {}
    }
    try { window.Telegram.WebApp.openLink(url); return; } catch {}
  }
  window.open(url, '_blank');
}

function spawnFloatText(x, y, text) {
  const div = document.createElement('div');
  div.className = 'float-text';
  div.textContent = text;
  div.style.left = x + 'px';
  div.style.top  = y + 'px';
  document.body.appendChild(div);
  div.addEventListener('animationend', () => div.remove());
}
