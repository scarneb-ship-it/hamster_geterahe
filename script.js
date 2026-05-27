/* ============================================================
   HADRON Mini App — script.js
   Экосистема: TON · GameFi · NFT · Нейросети
   Кликер: Hadron Collider
   Реферальная программа: /track + /referral-info
   Модалка подписки: кнопка «Позже» без проверки
   ============================================================ */

/* ================ КОНФИГ ================ */
const BOT_USERNAME = 'khadron_bot';            // ← ваш бот
const CHANNEL_URL  = 'https://t.me/+GNfQDYSAYc4wNDBi'; // ← ваш канал Hadron
const WORKER_URL   = 'https://gamesverse-bot.scarneb.workers.dev'; // ← ваш Worker

/* ================ ДАННЫЕ ИГР ================ */
const GAMES_DATA = [
  {
    name: 'Pixel World',
    link: 'https://t.me/pixelworld/play?startapp=r6823288584',
    desc: 'Первый 3D-шутер в Telegram',
    rating: 4.9, players: '34K',
    img: 'images/photo_2026-02-17_13-44-55.jpg',
    fallback: '🌍', badge: 'HOT', featured: true
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

/* ================ ДАННЫЕ БИРЖ ================ */
const EXCHANGES_DATA = [
  { name: 'Bybit',  url: 'https://www.bybit.com/invite?ref=57KXPMO',  desc: 'Продвинутая торговля · фьючерсы · споты', img: 'images/bybit.jpg',  fallback: '💱' },
  { name: 'BingX',  url: 'https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925', desc: 'Социальный трейдинг · копирование сделок', img: 'images/bingx.jpg', fallback: '📈' },
  { name: 'Bitget', url: 'https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H', desc: 'Инновационная платформа · GameFi токены', img: 'images/bitget.jpg', fallback: '⚡' },
  { name: 'MEXC',   url: 'https://promote.mexc.com/r/aTSLfdm54W',     desc: 'Низкие комиссии · листинги мемкоинов',  img: 'images/mexc.jpg',   fallback: '🌍' }
];

/* ================ СОСТОЯНИЕ ================ */
let currentUserId = null;
let referralInfo  = { count: 0, frame: false, undo: false, neon: false };
let subModalShown = false;

// Кристаллы (LocalStorage)
const SAVE_KEY = 'hadron_collider_v1';
let clicker = loadClickerState();

function defaultClickerState() {
  return {
    crystals:    0,
    totalEarned: 0,
    clickPower:  1,
    perSec:      0,
    upgrades: { magnet: 0, accelerator: 0, reactor: 0, singularity: 0 }
  };
}
function loadClickerState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultClickerState();
    return { ...defaultClickerState(), ...JSON.parse(raw) };
  } catch { return defaultClickerState(); }
}
function saveClickerState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(clicker)); } catch {}
}

/* ================ УЛУЧШЕНИЯ КОЛЛАЙДЕРА ================ */
const UPGRADES = [
  {
    id: 'magnet',
    emoji: '🧲',
    name: 'Магнитная ловушка',
    desc: '+2 кристалла за удар',
    maxLevel: 10, baseCost: 30, costMult: 2.2,
    apply(lvl) { clicker.clickPower = 1 + lvl * 2; }
  },
  {
    id: 'accelerator',
    emoji: '⚡',
    name: 'Ускоритель частиц',
    desc: '+2 кристалла в секунду',
    maxLevel: 10, baseCost: 100, costMult: 2.5,
    apply(lvl) { clicker.perSec += lvl * 2; }
  },
  {
    id: 'reactor',
    emoji: '☢️',
    name: 'Термоядерный реактор',
    desc: '+8 кристаллов в секунду',
    maxLevel: 8, baseCost: 600, costMult: 3.0,
    apply(lvl) { clicker.perSec += lvl * 8; }
  },
  {
    id: 'singularity',
    emoji: '🌀',
    name: 'Сингулярность',
    desc: '+5 за удар и +20/с',
    maxLevel: 5, baseCost: 3000, costMult: 4.5,
    apply(lvl) { clicker.clickPower += lvl * 5; clicker.perSec += lvl * 20; }
  }
];

function getUpgradeCost(upg, lvl) {
  return Math.floor(upg.baseCost * Math.pow(upg.costMult, lvl));
}

function recalcClicker() {
  clicker.clickPower = 1;
  clicker.perSec     = 0;
  UPGRADES.forEach(u => {
    const lvl = clicker.upgrades[u.id] || 0;
    if (lvl > 0) u.apply(lvl);
  });
  // Бонус за рефералов: +5% к кристаллам за каждые 3 друга
  const refBonus = Math.floor((referralInfo.count || 0) / 3) * 0.05;
  clicker.clickPower = Math.round(clicker.clickPower * (1 + refBonus));
}

/* ================ ДОСТИЖЕНИЯ ================ */
const ACHIEVEMENTS = [
  { id: 'c100',     emoji: '💎', label: '100 кристаллов',    cond: () => clicker.totalEarned >= 100 },
  { id: 'c1k',      emoji: '🌟', label: '1 000 кристаллов',  cond: () => clicker.totalEarned >= 1000 },
  { id: 'c10k',     emoji: '✨', label: '10 000 кристаллов', cond: () => clicker.totalEarned >= 10000 },
  { id: 'magmax',   emoji: '🧲', label: 'Макс. магнит',      cond: () => (clicker.upgrades.magnet || 0) >= UPGRADES[0].maxLevel },
  { id: 'ref1',     emoji: '🤝', label: 'Первый реферал',    cond: () => (referralInfo.count || 0) >= 1 },
  { id: 'singular', emoji: '🌀', label: 'Сингулярность',     cond: () => (clicker.upgrades.singularity || 0) >= 1 }
];

/* ================ СТАРТ ================ */
document.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  renderGames();
  renderExchanges();
  setupNavigation();
  setupBannerClick();
  setupSubscriptionModal();
  renderUpgrades();
  renderAchievements();
  setupClicker();
  setupShareButtons();
  startAutoClicker();
  updateAllUI();

  setTimeout(() => {
    el('splash').classList.add('hidden');
    el('app').classList.add('visible');
    // Показываем модалку при первом входе (если не подписан)
    if (!localStorage.getItem('hadron_sub_shown')) {
      setTimeout(() => showSubModal(), 1200);
    }
  }, 1100);
});

/* ================ TELEGRAM ================ */
function initTelegram() {
  if (!window.Telegram?.WebApp) { showFallbackProfile(); return; }
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();

  const user = tg.initDataUnsafe?.user;
  if (user) {
    currentUserId = user.id;
    displayUserProfile(user);
    sendTrackingStat(user);
    fetchReferralInfo(user.id);
  } else {
    showFallbackProfile();
  }
}

/* ================ ПРОФИЛЬ ================ */
function displayUserProfile(user) {
  const fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
  const username = user.username ? '@' + user.username : 'Telegram User';

  el('chip-name').textContent = user.first_name;
  setAvatarChip(el('chip-avatar'), user);

  el('profile-name').textContent     = fullName;
  el('profile-username').textContent = username;
  setAvatarProfile(el('profile-avatar'), user, el('avatar-letter'));

  const refLink = `https://t.me/${BOT_USERNAME}?start=ref_${user.id}`;
  el('ref-link-label').textContent = refLink;

  if (user.is_premium) {
    el('profile-username').insertAdjacentHTML('afterend', '<span class="game-badge" style="margin-left:4px">⭐ Premium</span>');
  }
}

function setAvatarChip(container, user) {
  if (user.photo_url) {
    let img = container.querySelector('img');
    if (!img) { img = document.createElement('img'); container.appendChild(img); }
    img.src = user.photo_url;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
    img.onerror = () => { img.remove(); container.textContent = user.first_name?.[0]?.toUpperCase() || 'H'; };
  } else {
    container.textContent = user.first_name?.[0]?.toUpperCase() || 'H';
  }
}

function setAvatarProfile(container, user, fallbackEl) {
  if (user.photo_url) {
    const imgEl = el('avatar-img');
    imgEl.src = user.photo_url;
    imgEl.style.display = 'block';
    if (fallbackEl) fallbackEl.style.display = 'none';
    imgEl.onerror = () => {
      imgEl.style.display = 'none';
      if (fallbackEl) { fallbackEl.style.display = ''; fallbackEl.textContent = user.first_name?.[0]?.toUpperCase() || 'H'; }
    };
  } else {
    if (fallbackEl) fallbackEl.textContent = user.first_name?.[0]?.toUpperCase() || 'H';
  }
}

function showFallbackProfile() {
  el('chip-name').textContent         = 'Игрок';
  el('profile-name').textContent      = 'Telegram User';
  el('profile-username').textContent  = 'Открой в Telegram';
  el('ref-link-label').textContent    = `https://t.me/${BOT_USERNAME}`;
}

/* ================ РЕФЕРАЛЬНАЯ СИСТЕМА ================ */
async function sendTrackingStat(user) {
  let ref = null;
  try {
    const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (sp) ref = sp;
  } catch {}

  try {
    await fetch(WORKER_URL + '/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:    user.id.toString(),
        firstName: user.first_name || '',
        username:  user.username   || '',
        ref:       ref || null
      })
    });
  } catch (e) { console.warn('Track failed:', e); }
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
  recalcClicker();
  updateReferralUI();
  updateAllUI();
}

function updateReferralUI() {
  const count = referralInfo.count || 0;
  el('ref-count').textContent = count;
  el('ps-refs').textContent   = count;

  const pct = Math.min(100, (count / 10) * 100);
  el('ref-progress-fill').style.width = pct + '%';

  ['3','5','10'].forEach(n => {
    const dot = el('rm-' + n);
    if (dot) dot.classList.toggle('reached', count >= parseInt(n));
  });

  const rewards = [
    { emoji: '🖼️', name: 'Эффект ауры в профиле',  desc: 'Неоновое свечение вокруг аватара',    req: 3,  unlocked: referralInfo.frame },
    { emoji: '⚡', name: '+20% к силе удара',        desc: 'Бонус коллайдеру от рефералов',       req: 5,  unlocked: referralInfo.undo  },
    { emoji: '💠', name: 'Статус HADRON Elite',      desc: 'Особый бейдж и доступ к VIP-дропам',  req: 10, unlocked: referralInfo.neon  }
  ];

  el('ref-rewards').innerHTML = rewards.map(r => `
    <div class="reward-row ${r.unlocked ? 'unlocked' : ''}">
      <div class="reward-icon">${r.emoji}</div>
      <div class="reward-text">
        <div class="reward-name">${r.name}</div>
        <div class="reward-desc">${r.desc}</div>
        <div class="reward-req">${r.req} друга для разблокировки</div>
      </div>
      <div class="reward-status">${r.unlocked ? '✅' : '🔒'}</div>
    </div>
  `).join('');
}

/* ================ ШАРИНГ ================ */
function setupShareButtons() {
  el('share-btn').addEventListener('click', () => { vibrate(); doShare(); });
  el('copy-btn').addEventListener('click', () => {
    vibrate();
    copyToClipboard(getRefLink());
    showToast('📋 Ссылка скопирована!');
    addCrystals(50, true);
  });
}

function getRefLink() {
  return currentUserId
    ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`
    : `https://t.me/${BOT_USERNAME}`;
}

function doShare() {
  const link = getRefLink();
  const text = '⚛️ HADRON — TON, GameFi, NFT, нейросети. Присоединяйся!';
  if (window.Telegram?.WebApp) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    try { window.Telegram.WebApp.openTelegramLink(shareUrl); return; } catch {}
  }
  if (navigator.share) { navigator.share({ title: 'HADRON', text, url: link }).catch(() => {}); return; }
  copyToClipboard(link);
  showToast('📋 Ссылка скопирована!');
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text).catch(() => fallbackCopy(text)); }
  else fallbackCopy(text);
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

/* ================ НАВИГАЦИЯ ================ */
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      vibrate();
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const target = el(tabId);
      if (target) target.classList.add('active');
      btn.classList.add('active');
      document.querySelector('.main-content')?.scrollTo({ top: 0 });

      if (tabId === 'tab-profile') {
        renderLeaderboard();
        updateProfileStats();
        if (currentUserId) fetchReferralInfo(currentUserId);
      }
    });
  });
}

/* ================ ИГРЫ ================ */
function renderGames() {
  el('games-list').innerHTML = GAMES_DATA.map(g => `
    <div class="game-card ${g.featured ? 'featured' : ''}">
      <div class="game-img-wrap">
        <img src="${g.img}" alt="${esc(g.name)}" onerror="this.style.display='none'">
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
    btn.addEventListener('click', e => { e.stopPropagation(); vibrate(); openLink(btn.dataset.link, true); });
  });
}

function stars(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= Math.round(r) ? '★' : '☆';
  return s;
}

/* ================ БИРЖИ ================ */
function renderExchanges() {
  el('exchanges-list').innerHTML = EXCHANGES_DATA.map(x => `
    <div class="exchange-card">
      <div class="exchange-logo">
        <img src="${x.img}" alt="${esc(x.name)}" onerror="this.style.display='none'">
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
    btn.addEventListener('click', e => { e.stopPropagation(); vibrate(); openLink(btn.dataset.url, false); });
  });
}

/* ================ КЛИКЕР ================ */
let autoTimer = null;

function setupClicker() {
  const btn = el('clicker-btn');
  btn.addEventListener('click', e => {
    vibrate();
    const gained = clicker.clickPower;
    addCrystals(gained);
    spawnFloatText(e.clientX, e.clientY, `+${gained}💎`);
    el('clicker-orb').style.transform = 'scale(0.80)';
    setTimeout(() => el('clicker-orb').style.transform = '', 90);
    renderAchievements();
  });
}

function addCrystals(n, silent = false) {
  clicker.crystals    += n;
  clicker.totalEarned += n;
  saveClickerState();
  updateCoinsDisplay();
  if (!silent) updateProfileStats();
}

function startAutoClicker() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    if (clicker.perSec > 0) {
      addCrystals(clicker.perSec, true);
      el('coins-value').classList.add('pop');
      setTimeout(() => el('coins-value').classList.remove('pop'), 200);
    }
  }, 1000);
}

/* ================ УЛУЧШЕНИЯ ================ */
function renderUpgrades() {
  el('upgrades-list').innerHTML = UPGRADES.map(u => {
    const lvl    = clicker.upgrades[u.id] || 0;
    const maxed  = lvl >= u.maxLevel;
    const cost   = maxed ? 0 : getUpgradeCost(u, lvl);
    const canBuy = !maxed && clicker.crystals >= cost;
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
            : `<div class="upgrade-cost">💎 ${fmtNum(cost)}</div>`
          }
          <div class="upgrade-level">ур. ${lvl}/${u.maxLevel}</div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.upgrade-item:not(.maxed)').forEach(item => {
    item.addEventListener('click', () => {
      const id  = item.dataset.upg;
      const upg = UPGRADES.find(u => u.id === id);
      const lvl = clicker.upgrades[id] || 0;
      if (lvl >= upg.maxLevel) return;
      const cost = getUpgradeCost(upg, lvl);
      if (clicker.crystals < cost) { showToast('Недостаточно кристаллов 💎'); vibrate(); return; }
      vibrate();
      clicker.crystals -= cost;
      clicker.upgrades[id] = lvl + 1;
      recalcClicker();
      saveClickerState();
      renderUpgrades();
      updateAllUI();
      showToast(`${upg.emoji} ${upg.name} — ур.${lvl + 1}!`);
    });
  });
}

/* ================ ДОСТИЖЕНИЯ ================ */
function renderAchievements() {
  el('achievements-list').innerHTML = ACHIEVEMENTS.map(a => {
    const done = a.cond();
    return `<div class="achievement-chip ${done ? 'unlocked' : 'locked'}">${a.emoji} ${a.label}</div>`;
  }).join('');
}

/* ================ ЛИДЕРБОРД ================ */
function renderLeaderboard() {
  const list = el('leaderboard-list');
  if (!list) return;
  const myName  = el('profile-name').textContent || 'Игрок';
  const myScore = clicker.totalEarned || 0;

  if (myScore === 0) {
    list.innerHTML = '<div class="lb-empty">Заработай первые кристаллы в коллайдере!</div>';
    return;
  }

  const entries = [{ name: myName, score: myScore, isMe: true }];
  list.innerHTML = entries.map((e, i) => {
    const rankCls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    return `
      <div class="lb-item ${e.isMe ? 'me' : ''}">
        <div class="lb-rank ${rankCls}">#${i+1}</div>
        <div class="lb-avatar">${e.name?.[0]?.toUpperCase() || '?'}</div>
        <div class="lb-name">${esc(e.name)}</div>
        <div class="lb-score">💎 ${fmtNum(e.score)}</div>
      </div>
    `;
  }).join('');
}

/* ================ UI UPDATE ================ */
function updateAllUI() {
  updateCoinsDisplay();
  updateProfileStats();
  renderUpgrades();
  renderAchievements();
  el('profile-level-badge').textContent = `Ур. ${calcLevel(clicker.totalEarned)}`;
}

function updateCoinsDisplay() {
  el('coins-value').textContent = fmtNum(clicker.crystals);
}

function updateProfileStats() {
  el('ps-stars').textContent     = fmtNum(clicker.totalEarned);
  el('ps-refs').textContent      = referralInfo.count || 0;
  el('click-stars').textContent  = fmtNum(clicker.crystals);
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

/* ================ БАННЕР ================ */
function setupBannerClick() {
  const banner = el('clan-banner');
  if (!banner) return;
  banner.addEventListener('click', () => {
    vibrate();
    openLink(CHANNEL_URL, true);
  });
}

/* ================ МОДАЛКА ПОДПИСКИ ================ */
function setupSubscriptionModal() {
  const modal    = el('sub-modal');
  const closeBtn = el('sub-close-btn');
  const checkBtn = el('sub-check-btn');
  const statusEl = el('sub-status');

  if (!modal) return;

  // Закрыть по клику на фон
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Кнопка «Позже» — просто закрывает без проверки
  closeBtn?.addEventListener('click', () => {
    vibrate();
    closeModal();
    // Помечаем что показали, но не запрещаем показать снова потом
    // (можно убрать эту строку чтобы каждый раз показывал)
    localStorage.setItem('hadron_sub_shown', '1');
  });

  // Кнопка «Я уже подписан» — проверяет через API
  checkBtn?.addEventListener('click', async () => {
    if (!currentUserId) {
      statusEl.textContent = 'Открой бот в Telegram';
      return;
    }
    statusEl.textContent = '⏳ Проверяем подписку...';
    try {
      const res  = await fetch(`${WORKER_URL}/check-subscription?userId=${currentUserId}`);
      const data = await res.json();
      if (data.subscribed) {
        statusEl.textContent = '✅ Подписка подтверждена!';
        addCrystals(100);
        showToast('🎉 +100 💎 за подписку на HADRON!');
        localStorage.setItem('hadron_sub_shown', '1');
        setTimeout(() => { closeModal(); statusEl.textContent = ''; }, 1800);
      } else {
        statusEl.textContent = '❌ Подписка не найдена. Подпишись и попробуй снова.';
      }
    } catch {
      statusEl.textContent = '⚠️ Ошибка соединения. Попробуй позже.';
    }
  });
}

function showSubModal() {
  const modal = el('sub-modal');
  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = el('sub-modal');
  if (modal) modal.style.display = 'none';
}

/* ================ УТИЛИТЫ ================ */
function el(id) { return document.getElementById(id); }

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(Math.floor(n));
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(25);
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
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
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
