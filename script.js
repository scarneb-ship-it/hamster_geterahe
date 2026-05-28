const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;

// ⚠️ Замени на свой URL Cloudflare Worker
const WORKER_URL = 'https://hadron-hub.твой-воркер.workers.dev';

// ⚠️ Замени ТВОЙ_ID на свой числовой Telegram ID
const MY_REF_ID = 'ТВОЙ_ID';

const GAMES_DATA = [
    {
        id: 0,
        name: "Pixel World",
        fullLink: "https://t.me/pixelworld/play?startapp=r" + MY_REF_ID,
        description: "Первый 3D-шутер в Telegram",
        rating: 4.9,
        players: "34K",
        image: "images/photo_2026-02-17_13-44-55.jpg",
        fallback: "🌍",
        badge: "Beta",
        highlight: true
    },
    {
        id: 1,
        name: "Hamster GameDev",
        fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId" + MY_REF_ID,
        description: "Создай свою студию",
        rating: 4.7,
        players: "368K",
        image: "images/hamster-gamedev.jpg",
        fallback: "🎮"
    },
    // добавь другие игры...
];

const EXCHANGES_DATA = [
    {
        id: 1,
        name: "Bybit",
        url: "https://www.bybit.com/invite?ref=ТВОЙ_REF",
        description: "Продвинутая торговая платформа",
        image: "images/bybit.jpg",
        fallback: "💱"
    },
    {
        id: 2,
        name: "BingX",
        url: "https://bingxdao.com/referral-program/ТВОЙ_REF",
        description: "Социальная торговля",
        image: "images/bingx.jpg",
        fallback: "📈"
    },
    // добавь другие биржи...
];

const HUB_DATA = [
    { name: "Telegram Подарки", description: "Эксклюзивные подарки", icon: "🎁", link: "" },
    { name: "NFT Коллекция", description: "Уникальные цифровые предметы", icon: "🖼️", link: "" },
    { name: "Нейросети", description: "Генерация изображений и текста", icon: "🤖", link: "" }
];

const translations = {
    appTitle: "Hadron Hub",
    settings: "Настройки",
    theme: "Тема",
    lightTheme: "Светлая",
    darkTheme: "Темная",
    done: "Готово",
    play: "Играть",
    exchanges: "Биржи",
    shareWithFriends: "Поделиться с друзьями",
    profile: "Профиль",
    linkCopied: "Ссылка скопирована!",
    game2048: "2048",
    score: "Счёт",
    best: "Лучший",
    newGame: "Новая игра",
    gameWin: "Вы победили! 🎉",
    gameLose: "Игра окончена! 😔"
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    document.body.style.opacity = '1';

    initializeTelegramWebApp();
    setupNavigation();
    initializeGames();
    initializeExchanges();
    initializeHub();
    setupSettingsPanel();
    loadThemePreference();
    setLanguage();
    loadUserData();
    setupShareButton();
    initGame2048();
    setupLeaderboardRefresh();
    setupLeaderboardShare();
    setupGameTabs();
    initSubscriptionCheck();
});

function vibrate() {
    if (navigator.vibrate) navigator.vibrate(50);
}

// ==================== TELEGRAM ====================
function initializeTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
    }
}

// ==================== НАВИГАЦИЯ ====================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const header = document.querySelector('.header');
    const mainContent = document.querySelector('.main-content');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const targetId = this.getAttribute('data-section');
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === targetId) s.classList.add('active');
            });

            // Скрываем header на вкладке профиля
            if (header) {
                header.style.display = (targetId === 'profile-section') ? 'none' : 'block';
            }
            if (mainContent) {
                mainContent.style.paddingTop = (targetId === 'profile-section') ? '8px' : '';
            }

            if (targetId === 'game-section') {
                resetGameTabsToDefault();
                fetchLeaderboard();
            }
        });
    });

    // Начальное состояние
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        if (header) header.style.display = (activeSection.id === 'profile-section') ? 'none' : 'block';
        if (activeSection.id === 'game-section') {
            resetGameTabsToDefault();
            fetchLeaderboard();
        }
    }
}

// ==================== РЕНДЕР КАРТОЧЕК ====================
function initializeGames() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;
    grid.innerHTML = GAMES_DATA.map(game => `
        <div class="game-card ${game.highlight ? 'highlight' : ''}">
            <div class="game-image">
                <img src="${game.image}" class="game-img" onerror="this.style.display='none'">
                <div class="image-fallback">${game.fallback}</div>
            </div>
            <div class="game-info">
                <div class="game-header">
                    <h3>${game.name}</h3>
                    ${game.badge ? `<span class="game-badge">${game.badge}</span>` : ''}
                </div>
                <p class="game-description">${game.description}</p>
                <div class="game-stats">
                    <div class="rating">
                        <div class="stars">${generateStars(game.rating)}</div>
                        <span class="rating-value">${game.rating}</span>
                    </div>
                    <div class="players">
                        <span>👥 ${game.players}</span>
                    </div>
                </div>
            </div>
            <button class="play-button" data-link="${game.fullLink}">Играть</button>
        </div>
    `).join('');
    setupGameButtons();
}

function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '<span class="star half">★</span>' : '') + '★'.repeat(empty).replace(/★/g, '<span class="star">★</span>');
}

function initializeExchanges() {
    const list = document.getElementById('exchanges-list');
    if (!list) return;
    list.innerHTML = EXCHANGES_DATA.map(ex => `
        <div class="exchange-card">
            <div class="exchange-logo">
                <img src="${ex.image}" class="exchange-img" onerror="this.style.display='none'">
                <div class="image-fallback">${ex.fallback}</div>
            </div>
            <div class="exchange-info">
                <h3>${ex.name}</h3>
                <p>${ex.description}</p>
            </div>
            <button class="exchange-button" data-url="${ex.url}">Перейти</button>
        </div>
    `).join('');
    setupExchangeButtons();
}

function initializeHub() {
    const grid = document.getElementById('hub-grid');
    if (!grid) return;
    grid.innerHTML = HUB_DATA.map(item => `
        <div class="hub-card">
            <div class="hub-icon">${item.icon}</div>
            <div class="hub-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>
            ${item.link ? `<button class="play-button" data-link="${item.link}">Открыть</button>` : ''}
        </div>
    `).join('');
}

// ==================== ПРОВЕРКА ПОДПИСКИ ====================
let isSubscribed = false;

async function checkSubscription() {
    if (isSubscribed) return true;
    if (!currentUserId) return false;

    try {
        const res = await fetch(WORKER_URL + '/check-sub', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId.toString() })
        });
        const data = await res.json();
        if (data.subscribed) {
            isSubscribed = true;
            return true;
        } else {
            showSubscribeModal();
            return false;
        }
    } catch (e) {
        console.error('Ошибка проверки подписки:', e);
        return false;
    }
}

function showSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('subscribe-link-btn').onclick = () => {
        window.Telegram?.WebApp?.openTelegramLink('https://t.me/hadron_channel');
        modal.style.display = 'none';
    };
    document.getElementById('close-modal-btn').onclick = () => {
        modal.style.display = 'none';
    };
}

async function initSubscriptionCheck() {
    await checkSubscription();
}

function openWithSubscriptionCheck(link) {
    vibrate();
    checkSubscription().then(subscribed => {
        if (subscribed) {
            if (window.Telegram?.WebApp) {
                if (link.startsWith('https://t.me/')) {
                    window.Telegram.WebApp.openTelegramLink(link);
                } else {
                    window.Telegram.WebApp.openLink(link);
                }
            } else {
                window.open(link, '_blank');
            }
        }
    });
}

function setupGameButtons() {
    document.querySelectorAll('.play-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const link = this.dataset.link;
            if (link) openWithSubscriptionCheck(link);
        });
    });
}

function setupExchangeButtons() {
    document.querySelectorAll('.exchange-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const url = this.dataset.url;
            if (url) openWithSubscriptionCheck(url);
        });
    });
}

// ==================== ПРОФИЛЬ И РЕФЕРАЛЫ ====================
function loadUserData() {
    if (window.Telegram?.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateProfileDisplay(user);
            currentUserId = user.id;
            sendMiniAppStat(user);
            fetchRefCount();
        } else {
            showFallbackProfile();
            currentUserId = null;
        }
    } else {
        showFallbackProfile();
        currentUserId = null;
    }
}

function updateProfileDisplay(user) {
    document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    document.getElementById('user-username').textContent = user.username ? '@' + user.username : 'Telegram User';
    const avatarImg = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
        avatarImg.style.display = 'block';
        avatarImg.onerror = () => { avatarImg.style.display = 'none'; fallback.textContent = user.first_name.charAt(0).toUpperCase(); };
        fallback.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        fallback.textContent = user.first_name.charAt(0).toUpperCase();
        fallback.style.display = 'flex';
    }
    if (user.is_premium && !document.querySelector('.premium-badge')) {
        const badge = document.createElement('div');
        badge.className = 'premium-badge';
        badge.textContent = '⭐ Premium';
        document.querySelector('.profile-info').appendChild(badge);
    }
}

function showFallbackProfile() {
    document.getElementById('user-name').textContent = 'Telegram User';
    document.getElementById('user-username').textContent = 'Открой в Telegram';
    document.getElementById('avatar-fallback').textContent = 'T';
}

async function sendMiniAppStat(user) {
    let ref = null;
    try {
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        if (startParam) ref = startParam;
    } catch(e) {}

    try {
        await fetch(WORKER_URL + '/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id.toString(),
                firstName: user.first_name || '',
                username: user.username || '',
                ref: ref
            })
        });
    } catch(e) {}
}

async function fetchRefCount() {
    if (!currentUserId) return;
    try {
        const res = await fetch(WORKER_URL + '/ref-count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId.toString() })
        });
        const data = await res.json();
        const container = document.getElementById('ref-count');
        const num = document.getElementById('ref-number');
        if (container && num && data.count !== undefined) {
            container.style.display = 'flex';
            num.textContent = data.count;
        }
    } catch(e) {}
}

function setupShareButton() {
    const btn = document.getElementById('share-friends-button');
    if (!btn) return;
    btn.addEventListener('click', () => {
        vibrate();
        const botUrl = currentUserId
            ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`
            : `https://t.me/${BOT_USERNAME}`;
        const text = '🚀 Играй и зарабатывай в Hadron Hub!';
        if (window.Telegram?.WebApp) {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
            fallbackCopyToClipboard(botUrl);
        }
    });
}

function fallbackCopyToClipboard(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showNotification();
}

function showNotification(msg = translations.linkCopied) {
    const n = document.getElementById('notification');
    n.textContent = msg;
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2000);
}

// ==================== ТЕМА И НАСТРОЙКИ ====================
function setupSettingsPanel() {
    const settingsBtn = document.getElementById('settings-button');
    const panel = document.getElementById('settings-panel');
    const closeBtn = document.getElementById('close-settings');
    settingsBtn?.addEventListener('click', () => panel.classList.add('active'));
    closeBtn?.addEventListener('click', () => panel.classList.remove('active'));
    panel?.addEventListener('click', (e) => { if (e.target === panel) panel.classList.remove('active'); });

    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', function() {
            const theme = this.dataset.theme;
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            document.body.classList.toggle('dark-theme', theme === 'dark');
            localStorage.setItem('theme', theme);
        });
    });
}

function loadThemePreference() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', saved === 'dark');
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === saved);
    });
}

function setLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (translations[el.dataset.i18n]) el.textContent = translations[el.dataset.i18n];
    });
}

// ==================== ИГРА 2048 ====================
class Game2048 {
    constructor(board, scoreEl, bestEl, statusEl) {
        this.board = board;
        this.scoreEl = scoreEl;
        this.bestEl = bestEl;
        this.statusEl = statusEl;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
        this.lastAddedTile = null;
        this.mergedPositions = new Set();
        this.moveMap = null;
        this.updateBestUI();
        this.init();
        this.setupSwipe();
        this.setupKeyboard();
    }
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScoreUI();
        this.statusEl.textContent = '';
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] === 0) empty.push({x:i, y:j});
        if (empty.length) {
            const {x,y} = empty[Math.floor(Math.random() * empty.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
            this.lastAddedTile = {x,y};
            return true;
        }
        return false;
    }
    // Полная реализация move, render, checkWin/Lose и отправки счёта (такая же, как в исходном коде, но с вызовом submitScoreToLeaderboard)
    // Для экономии места опускаю детали, вставьте оригинальную логику из предыдущего полного script.js
    // ...
}
// Инициализация 2048 и таблицы лидеров должна быть полностью из исходного файла.
