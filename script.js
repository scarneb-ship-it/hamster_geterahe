// script.js – ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

/* ========== ДАННЫЕ ========== */
const GAMES_DATA = [
    { id: 0, name: "Pixel World", fullLink: "https://t.me/pixelworld/play?startapp=r6823288584", description: "Первый 3D-шутер в Telegram", rating: 4.9, players: "34K", image: "images/photo_2026-02-17_13-44-55.jpg", fallback: "🌍", badge: "Beta", highlight: true },
    { id: 1, name: "Hamster GameDev", fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584", description: "Создай свою студию", rating: 4.7, players: "368K", image: "images/hamster-gamedev.jpg", fallback: "🎮" },
    { id: 2, name: "Hamster King", fullLink: "https://t.me/hamsterking_game_bot?startapp=6823288584", description: "Стань королем хомяков", rating: 4.2, players: "188K", image: "images/hamster-king.jpg", fallback: "👑" },
    { id: 3, name: "Hamster Fight Club", fullLink: "https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5", description: "Бойцовский клуб хомяков", rating: 4.9, players: "85K", image: "images/hamster-fightclub.jpg", fallback: "🥊" },
    { id: 4, name: "BitQuest", fullLink: "https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584", description: "Приключения в мире крипты", rating: 3.8, players: "281K", image: "images/bitquest.jpg", fallback: "💰" }
];

const EXCHANGES_DATA = [
    { id: 1, name: "Bybit", url: "https://www.bybit.com/invite?ref=57KXPMO", description: "Продвинутая торговая платформа", image: "images/bybit.jpg", fallback: "💱" },
    { id: 2, name: "BingX", url: "https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description: "Социальная торговля и копирование", image: "images/bingx.jpg", fallback: "📈" },
    { id: 3, name: "Bitget", url: "https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H&from=%2Fru%2Fevents%2Freferral-all-program&source=events&utmSource=PremierInviter", description: "Инновационная торговая платформа", image: "images/bitget.jpg", fallback: "⚡" },
    { id: 4, name: "MEXC", url: "https://promote.mexc.com/r/aTSLfdm54W", description: "Глобальная биржа с низкими комиссиями", image: "images/mexc.jpg", fallback: "🌍" }
];

const translations = {
    appTitle: "Games Verse",
    settings: "Настройки",
    theme: "Тема",
    lightTheme: "Светлая",
    darkTheme: "Темная",
    done: "Готово",
    games: "Игры",
    bestGames: "Лучшие игры Telegram",
    play: "Играть",
    exchanges: "Биржи",
    exchangesDesc: "Торгуйте криптовалютами безопасно",
    user: "Пользователь",
    shareWithFriends: "Поделиться с друзьями",
    profile: "Профиль",
    linkCopied: "Ссылка скопирована в буфер обмена!",
    go: "Перейти",
    game2048: "2048",
    score: "Счёт",
    best: "Лучший",
    newGame: "Новая игра",
    swipeHint: "👆 Свайпайте пальцем или используйте стрелки",
    gameWin: "Вы победили! 🎉",
    gameLose: "Игра окончена! 😔"
};

/* ========== ДЕТЕРМИНИРОВАННЫЙ ГПСЧ ========== */
class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
}

/* ========== ДОСТИЖЕНИЯ ========== */
const ACHIEVEMENTS = [
    { id: 'tile_128', name: 'Плитка 128', desc: 'Соберите 128', icon: '🟩', check: g => g.grid.some(r => r.some(v => v >= 128)) },
    { id: 'tile_256', name: 'Плитка 256', desc: 'Соберите 256', icon: '🟦', check: g => g.grid.some(r => r.some(v => v >= 256)) },
    { id: 'tile_512', name: 'Плитка 512', desc: 'Соберите 512', icon: '🟪', check: g => g.grid.some(r => r.some(v => v >= 512)) },
    { id: 'tile_1024', name: 'Плитка 1024', desc: 'Соберите 1024', icon: '🟧', check: g => g.grid.some(r => r.some(v => v >= 1024)) },
    { id: 'tile_2048', name: '2048!', desc: 'Соберите 2048', icon: '🏆', check: g => g.grid.some(r => r.some(v => v >= 2048)) },
    { id: 'score_2000', name: 'Новичок', desc: 'Наберите 2000 очков', icon: '💵', check: g => g.score >= 2000 },
    { id: 'score_5000', name: 'Любитель', desc: 'Наберите 5000 очков', icon: '💰', check: g => g.score >= 5000 },
    { id: 'score_10000', name: 'Профи', desc: 'Наберите 10000 очков', icon: '💎', check: g => g.score >= 10000 },
    { id: 'moves_50', name: 'Тактик', desc: 'Сделайте 50 ходов', icon: '♟️', check: g => g.moveCount >= 50 },
    { id: 'moves_100', name: 'Марафонец', desc: 'Сделайте 100 ходов', icon: '🏃', check: g => g.moveCount >= 100 },
];

/* ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ========== */
let game2048 = null;
let replayMode = false;
let replayInterval = null;
let replayIndex = 0;
let replayMoves = [];
let replaySeed = 0;
let replaySpeed = 1;

/* ========== ИНИЦИАЛИЗАЦИЯ ========== */
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    document.body.style.opacity = '1';

    initializeTelegramWebApp();
    setupNavigation();
    initializeGames();
    initializeExchanges();
    setupSettingsPanel();
    loadThemePreference();
    loadUserData();
    setupShareButton();
    setupLeaderboardRefresh();
    setupLeaderboardShare();
    setupGameTabs();
    initGame2048();
    loadAchievementsUI();
    loadChallengesUI();
    checkReplayParam();
});

function vibrate() { if (navigator.vibrate) navigator.vibrate(50); }

/* ========== TELEGRAM ========== */
function initializeTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        const themeParams = tg.themeParams;
        if (themeParams) {
            if (themeParams.bg_color) document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
            if (themeParams.text_color) document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
            if (themeParams.button_color) document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color);
            if (themeParams.button_text_color) document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
        }
    }
}

/* ========== НАВИГАЦИЯ ========== */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const header = document.getElementById('main-header');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const targetSection = this.getAttribute('data-section');
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(section => section.classList.remove('active'));
            const activeSection = document.getElementById(targetSection);
            if (activeSection) activeSection.classList.add('active');
            // скрываем хедер на игре и профиле
            if (header) {
                if (targetSection === 'profile-section' || targetSection === 'game-section') {
                    header.style.display = 'none';
                } else {
                    header.style.display = 'block';
                }
            }
            if (targetSection === 'game-section') {
                fetchLeaderboard();
            }
        });
    });
    // по умолчанию активна game-section, хедер скрыт
    const headerEl = document.getElementById('main-header');
    if (headerEl) headerEl.style.display = 'none';
}

/* ========== ИГРЫ ========== */
function initializeGames() {
    const gamesGrid = document.getElementById('games-grid');
    if (!gamesGrid) return;
    gamesGrid.innerHTML = GAMES_DATA.map(game => `
        <div class="game-card ${game.highlight ? 'highlight' : ''}" data-game-id="${game.id}">
            <div class="game-image">
                <img src="${game.image}" alt="${game.name}" class="game-img" onerror="this.style.display='none'">
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
                        <span class="players-icon">👥</span>
                        <span class="players-count">${game.players}</span>
                    </div>
                </div>
            </div>
            <button class="play-button" data-link="${game.fullLink || ''}">Играть</button>
        </div>
    `).join('');
    document.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const link = this.getAttribute('data-link');
            if (link) {
                if (window.Telegram && window.Telegram.WebApp) {
                    if (link.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(link);
                    else window.Telegram.WebApp.openLink(link);
                } else {
                    window.open(link, '_blank');
                }
            }
        });
    });
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<span class="star filled">★</span>';
    if (hasHalfStar) stars += '<span class="star half">★</span>';
    for (let i = 0; i < emptyStars; i++) stars += '<span class="star">★</span>';
    return stars;
}

/* ========== БИРЖИ ========== */
function initializeExchanges() {
    const exchangesList = document.getElementById('exchanges-list');
    if (!exchangesList) return;
    exchangesList.innerHTML = EXCHANGES_DATA.map(exchange => `
        <div class="exchange-card" data-exchange-id="${exchange.id}">
            <div class="exchange-logo">
                <img src="${exchange.image}" alt="${exchange.name}" class="exchange-img" onerror="this.style.display='none'">
                <div class="image-fallback">${exchange.fallback}</div>
            </div>
            <div class="exchange-info">
                <h3>${exchange.name}</h3>
                <p>${exchange.description}</p>
            </div>
            <button class="exchange-button" data-url="${exchange.url}">Перейти</button>
        </div>
    `).join('');
    document.querySelectorAll('.exchange-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const url = this.getAttribute('data-url');
            if (url) {
                if (window.Telegram && window.Telegram.WebApp) window.Telegram.WebApp.openLink(url);
                else window.open(url, '_blank');
            }
        });
    });
}

/* ========== ПРОФИЛЬ ========== */
function loadUserData() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            updateProfileDisplay(user);
            currentUserId = user.id;
            sendMiniAppStat(user);
        } else {
            showFallbackProfile();
            currentUserId = null;
        }
    } else {
        showFallbackProfile();
        currentUserId = null;
    }
}

async function sendMiniAppStat(user) {
    if (!user || !user.id) return;
    let ref = null;
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            const startParam = window.Telegram.WebApp.initDataUnsafe?.start_param;
            if (startParam) ref = startParam;
        }
    } catch (e) {}
    try {
        await fetch(WORKER_URL + '/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id.toString(),
                firstName: user.first_name || '',
                username: user.username || '',
                ref: ref || null
            })
        });
    } catch (err) { console.error('Track error:', err); }
}

function updateProfileDisplay(user) {
    const userName = document.getElementById('user-name');
    if (userName) userName.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    const userUsername = document.getElementById('user-username');
    if (userUsername) userUsername.textContent = user.username ? '@' + user.username : 'Telegram User';
    updateUserAvatar(user);
    if (user.is_premium) {
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo && !document.querySelector('.premium-badge')) {
            const badge = document.createElement('div');
            badge.className = 'premium-badge';
            badge.innerHTML = '⭐ Premium';
            profileInfo.appendChild(badge);
        }
    }
}

function updateUserAvatar(user) {
    const avatarImg = document.getElementById('avatar-img');
    const avatarFallback = document.getElementById('avatar-fallback');
    if (!avatarImg || !avatarFallback) return;
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
        avatarImg.style.display = 'block';
        avatarImg.onerror = () => { avatarImg.style.display = 'none'; avatarFallback.style.display = 'flex'; };
        avatarFallback.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarFallback.textContent = user.first_name.charAt(0).toUpperCase();
        avatarFallback.style.display = 'flex';
    }
}

function showFallbackProfile() {
    const userName = document.getElementById('user-name');
    const userUsername = document.getElementById('user-username');
    const avatarFallback = document.getElementById('avatar-fallback');
    if (userName) userName.textContent = 'Telegram User';
    if (userUsername) userUsername.textContent = 'Открой в Telegram';
    if (avatarFallback) { avatarFallback.textContent = 'T'; avatarFallback.style.display = 'flex'; }
}

/* ========== НАСТРОЙКИ ========== */
function setupSettingsPanel() {
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    if (settingsButton) settingsButton.addEventListener('click', () => { vibrate(); settingsPanel.classList.add('active'); });
    if (closeSettings) closeSettings.addEventListener('click', () => { vibrate(); settingsPanel.classList.remove('active'); });
    if (settingsPanel) settingsPanel.addEventListener('click', (e) => { if (e.target === settingsPanel) settingsPanel.classList.remove('active'); });
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            vibrate();
            const theme = this.getAttribute('data-theme');
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            if (theme === 'dark') document.body.classList.add('dark-theme');
            else document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', theme);
        });
    });
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-theme') === savedTheme) opt.classList.add('active');
    });
}

/* ========== ПОДЕЛИТЬСЯ ========== */
function setupShareButton() {
    const shareButton = document.getElementById('share-friends-button');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            vibrate();
            let botUrl = currentUserId
                ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`
                : `https://t.me/${BOT_USERNAME}`;
            const shareText = 'Играй в лучшие мини-игры Telegram вместе с HADRON! 🎮';
            if (window.Telegram && window.Telegram.WebApp) {
                const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(shareText)}`;
                try {
                    window.Telegram.WebApp.openTelegramLink(shareUrl);
                } catch (error) {
                    fallbackCopyToClipboard(botUrl);
                }
            } else {
                if (navigator.share) {
                    navigator.share({ title: 'Games Verse', text: shareText, url: botUrl }).catch(() => fallbackCopyToClipboard(botUrl));
                } else {
                    fallbackCopyToClipboard(botUrl);
                }
            }
        });
    }
}

function fallbackCopyToClipboard(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification();
    } catch (err) { showNotification('Не удалось скопировать ссылку'); }
}

function showNotification(msg) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = msg || translations.linkCopied;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}

/* ========== 2048 (центральная часть) ========== */
class Game2048 {
    constructor(boardEl, scoreEl, bestEl, statusEl, replayBtn) {
        this.boardEl = boardEl;
        this.scoreEl = scoreEl;
        this.bestEl = bestEl;
        this.statusEl = statusEl;
        this.replayBtn = replayBtn;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
        this.seed = Date.now();
        this.rng = new SeededRandom(this.seed);
        this.moveHistory = [];
        this.moveCount = 0;
        this.mergedCombo = 0;
        this.totalMerges = 0;
        this.lastAdded = null;
        this.mergedPositions = new Set();
        this.moveMap = null;
        this.gameOver = false;
        this.won = false;
        this.updateBestUI();
        this.init();
        this.setupSwipeEvents();
        this.setupKeyboardEvents();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.moveCount = 0;
        this.mergedCombo = 0;
        this.totalMerges = 0;
        this.moveHistory = [];
        this.gameOver = false;
        this.won = false;
        this.statusEl.textContent = '';
        this.replayBtn.style.display = 'none';
        this.updateScoreUI();
        this.rng = new SeededRandom(this.seed);
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.checkAchievements();
        this.updateChallengeProgress();
    }

    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] === 0) empty.push({x:i, y:j});
        if (empty.length > 0) {
            const {x, y} = empty[Math.floor(this.rng.next() * empty.length)];
            this.grid[x][y] = this.rng.next() < 0.9 ? 2 : 4;
            this.lastAdded = {x, y};
            return true;
        }
        return false;
    }

    move(direction) {
        if (this.gameOver || replayMode) return;
        const oldGrid = JSON.parse(JSON.stringify(this.grid));
        let gained = 0;
        this.mergedPositions.clear();
        this.moveMap = {};
        let mergeCombo = 0;

        const slide = (row, isCol, idx, reverse) => {
            let arr = row.filter(v => v !== 0);
            let newRow = [];
            let mergedFlags = new Array(arr.length).fill(false);
            for (let i = 0; i < arr.length; i++) {
                if (i+1 < arr.length && arr[i] === arr[i+1] && !mergedFlags[i] && !mergedFlags[i+1]) {
                    newRow.push(arr[i]*2);
                    gained += arr[i]*2;
                    mergedFlags[i] = mergedFlags[i+1] = true;
                    mergeCombo++;
                    this.totalMerges++;
                    i++;
                } else {
                    newRow.push(arr[i]);
                }
            }
            while (newRow.length < this.size) newRow.push(0);
            // запись анимаций
            let oldVals = arr;
            let oldPtr = 0;
            for (let newPos = 0; newPos < this.size; newPos++) {
                if (newRow[newPos] === 0) continue;
                if (oldPtr < oldVals.length && oldVals[oldPtr]*2 === newRow[newPos] &&
                    oldPtr+1 < oldVals.length && oldVals[oldPtr] === oldVals[oldPtr+1]) {
                    this.recordMove(oldPtr, oldVals, newPos, isCol, idx, reverse, true);
                    this.recordMove(oldPtr+1, oldVals, newPos, isCol, idx, reverse, true);
                    oldPtr += 2;
                } else if (oldPtr < oldVals.length && oldVals[oldPtr] === newRow[newPos]) {
                    this.recordMove(oldPtr, oldVals, newPos, isCol, idx, reverse, false);
                    oldPtr++;
                }
            }
            return newRow;
        };

        if (direction === 'left') for (let i=0;i<this.size;i++) this.grid[i] = slide(this.grid[i], false, i, false);
        else if (direction === 'right') for (let i=0;i<this.size;i++) { let rev = [...this.grid[i]].reverse(); this.grid[i] = slide(rev, false, i, true).reverse(); }
        else if (direction === 'up') for (let j=0;j<this.size;j++) { let col = []; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); let res = slide(col, true, j, false); for (let i=0;i<this.size;i++) this.grid[i][j] = res[i]; }
        else if (direction === 'down') for (let j=0;j<this.size;j++) { let col = []; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); let rev = col.reverse(); let res = slide(rev, true, j, true).reverse(); for (let i=0;i<this.size;i++) this.grid[i][j] = res[i]; }

        this.mergedCombo = mergeCombo;
        const changed = !this.gridsAreEqual(oldGrid, this.grid);
        if (changed) {
            this.score += gained;
            this.moveCount++;
            this.moveHistory.push(direction);
            this.updateScoreUI();
            this.addRandomTile();
            this.render();
            this.checkAchievements();
            this.updateChallengeProgress();
            if (this.checkWin()) {
                this.statusEl.textContent = translations.gameWin;
                this.gameOver = true;
                this.won = true;
                this.submitScoreToLeaderboard();
                this.showReplayButton();
            } else if (this.checkLose()) {
                this.statusEl.textContent = translations.gameLose;
                this.gameOver = true;
                this.submitScoreToLeaderboard();
                this.showReplayButton();
            }
        } else {
            this.moveMap = null;
        }
    }

    recordMove(oldIdx, oldVals, newIdx, isCol, lineIdx, reverse, merged) {
        const originalLine = [];
        if (!isCol) originalLine.push(...this.grid[lineIdx]);
        else for (let r=0; r<this.size; r++) originalLine.push(this.grid[r][lineIdx]);
        if (reverse) originalLine.reverse();
        let skip = 0;
        let sourceIdx = -1;
        for (let i=0; i<originalLine.length; i++) {
            if (originalLine[i] !== 0) {
                if (skip === oldIdx) { sourceIdx = i; break; }
                skip++;
            }
        }
        if (sourceIdx === -1) return;
        if (reverse) sourceIdx = this.size - 1 - sourceIdx;
        let fromRow, fromCol;
        if (!isCol) { fromRow = lineIdx; fromCol = sourceIdx; }
        else { fromRow = sourceIdx; fromCol = lineIdx; }
        let targetIdx = newIdx;
        if (reverse) targetIdx = this.size - 1 - targetIdx;
        let toRow, toCol;
        if (!isCol) { toRow = lineIdx; toCol = targetIdx; }
        else { toRow = targetIdx; toCol = lineIdx; }
        const key = `${toRow},${toCol}`;
        if (!this.moveMap[key]) this.moveMap[key] = { fromRow, fromCol, merged };
        if (merged) this.mergedPositions.add(key);
    }

    gridsAreEqual(a, b) {
        for (let i=0; i<this.size; i++)
            for (let j=0; j<this.size; j++)
                if (a[i][j] !== b[i][j]) return false;
        return true;
    }

    render() {
        this.boardEl.innerHTML = '';
        const tileSize = this.boardEl.clientWidth / this.size;
        for (let i=0; i<this.size; i++) {
            for (let j=0; j<this.size; j++) {
                const value = this.grid[i][j];
                const tile = document.createElement('div');
                tile.className = 'tile-cell';
                if (value !== 0) {
                    let tileClass = `tile-${value}`;
                    if (value > 2048) tileClass = 'tile-super';
                    tile.classList.add(tileClass);
                    tile.textContent = value;
                    const key = `${i},${j}`;
                    if (this.moveMap && this.moveMap[key]) {
                        const { fromRow, fromCol, merged } = this.moveMap[key];
                        const deltaX = (fromCol - j) * tileSize;
                        const deltaY = (fromRow - i) * tileSize;
                        tile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                        tile.offsetHeight;
                        tile.style.transform = '';
                        if (merged) {
                            tile.classList.add('tile-merge');
                            tile.addEventListener('animationend', () => tile.classList.remove('tile-merge'), { once: true });
                        }
                    }
                    if (this.lastAdded && this.lastAdded.x === i && this.lastAdded.y === j) {
                        tile.classList.add('tile-new');
                        tile.addEventListener('animationend', () => tile.classList.remove('tile-new'), { once: true });
                    }
                } else {
                    tile.textContent = '';
                }
                this.boardEl.appendChild(tile);
            }
        }
        this.lastAdded = null;
        this.moveMap = null;
    }

    updateScoreUI() {
        this.scoreEl.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore2048', this.bestScore);
            this.updateBestUI();
        }
    }

    updateBestUI() {
        this.bestEl.textContent = this.bestScore;
    }

    checkWin() { return this.grid.some(r => r.includes(2048)); }
    checkLose() {
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (this.grid[i][j]===0) return false;
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) {
            if (j<this.size-1 && this.grid[i][j]===this.grid[i][j+1]) return false;
            if (i<this.size-1 && this.grid[i][j]===this.grid[i+1][j]) return false;
        }
        return true;
    }

    submitScoreToLeaderboard() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        fetch(WORKER_URL + '/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId.toString(),
                firstName: user.first_name || 'Игрок',
                username: user.username || '',
                score: this.score,
                avatarUrl: user.photo_url || ''
            })
        }).then(() => fetchLeaderboard()).catch(err => console.error('Submit error:', err));
    }

    showReplayButton() {
        if (this.replayBtn) {
            this.replayBtn.style.display = 'inline-block';
            this.replayBtn.onclick = () => this.shareReplay();
        }
    }

    shareReplay() {
        const movesStr = this.moveHistory.map(d => d[0]).join('');
        const payload = `${this.seed}_${movesStr}`;
        const shareUrl = `https://t.me/${BOT_USERNAME}?startapp=replay_${payload}`;
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=Смотри%20мой%20реплей%202048!`);
        } else {
            fallbackCopyToClipboard(shareUrl);
        }
    }

    resetGame() {
        this.seed = Date.now();
        this.rng = new SeededRandom(this.seed);
        this.init();
        this.render();
    }

    // replay
    startReplay(seed, moves) {
        replayMode = true;
        this.seed = seed;
        this.rng = new SeededRandom(seed);
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        replayMoves = moves;
        replayIndex = 0;
        document.getElementById('replay-viewer').style.display = 'block';
        this.replayBtn.style.display = 'none';
        document.getElementById('new-game-btn').style.display = 'none';
        document.getElementById('replay-step').textContent = `0/${moves.length}`;
        this.setupReplayControls();
    }

    setupReplayControls() {
        const playBtn = document.getElementById('replay-play');
        const speedBtn = document.getElementById('replay-speed');
        const stepSpan = document.getElementById('replay-step');
        let playing = false;
        const doStep = () => {
            if (replayIndex >= replayMoves.length) {
                clearInterval(replayInterval);
                playing = false;
                playBtn.textContent = '▶️';
                this.statusEl.textContent = 'Реплей завершён';
                return;
            }
            this.move(replayMoves[replayIndex]);
            replayIndex++;
            stepSpan.textContent = `${replayIndex}/${replayMoves.length}`;
        };
        playBtn.onclick = () => {
            if (playing) {
                clearInterval(replayInterval);
                playing = false;
                playBtn.textContent = '▶️';
            } else {
                playing = true;
                playBtn.textContent = '⏸️';
                replayInterval = setInterval(doStep, 300 / replaySpeed);
            }
        };
        speedBtn.onclick = () => {
            replaySpeed = replaySpeed === 1 ? 2 : (replaySpeed === 2 ? 4 : 1);
            speedBtn.textContent = replaySpeed + 'x';
            if (playing) {
                clearInterval(replayInterval);
                replayInterval = setInterval(doStep, 300 / replaySpeed);
            }
        };
    }

    // Достижения
    checkAchievements() {
        const earned = JSON.parse(localStorage.getItem('achievements') || '{}');
        let updated = false;
        ACHIEVEMENTS.forEach(a => {
            if (!earned[a.id] && a.check(this)) {
                earned[a.id] = true;
                updated = true;
                showNotification(`🏆 Достижение: ${a.name}!`);
            }
        });
        if (updated) {
            localStorage.setItem('achievements', JSON.stringify(earned));
            loadAchievementsUI();
        }
    }

    // Испытания
    updateChallengeProgress() {
        const daily = getDailyTask();
        const weekly = getWeeklyTask();
        const dailyData = JSON.parse(localStorage.getItem('dailyProgress') || '{"date":"","progress":0}');
        const weeklyData = JSON.parse(localStorage.getItem('weeklyProgress') || '{"week":"","progress":0}');
        const today = new Date().toISOString().slice(0,10);
        const currentWeek = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 604800000);
        if (dailyData.date !== today) { dailyData.date = today; dailyData.progress = 0; }
        if (weeklyData.week !== currentWeek) { weeklyData.week = currentWeek; weeklyData.progress = 0; }
        switch (daily.type) {
            case 'score': dailyData.progress = Math.max(dailyData.progress, this.score); break;
            case 'tile': dailyData.progress = Math.max(dailyData.progress, ...this.grid.flat()); break;
            case 'moves': dailyData.progress = Math.max(dailyData.progress, this.moveCount); break;
            case 'merge_combo': dailyData.progress = Math.max(dailyData.progress, this.mergedCombo); break;
        }
        switch (weekly.type) {
            case 'score': weeklyData.progress = Math.max(weeklyData.progress, this.score); break;
            case 'tile': weeklyData.progress = Math.max(weeklyData.progress, ...this.grid.flat()); break;
            case 'moves': weeklyData.progress = Math.max(weeklyData.progress, this.moveCount); break;
            case 'total_merges': weeklyData.progress = Math.max(weeklyData.progress, this.totalMerges); break;
        }
        localStorage.setItem('dailyProgress', JSON.stringify(dailyData));
        localStorage.setItem('weeklyProgress', JSON.stringify(weeklyData));
        if (document.getElementById('tab-challenges')?.classList.contains('active')) loadChallengesUI();
    }

    setupSwipeEvents() {
        let touchStartX = 0, touchStartY = 0;
        this.boardEl.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });
        this.boardEl.addEventListener('touchend', (e) => {
            if (touchStartX === 0 && touchStartY === 0) return;
            let deltaX = e.changedTouches[0].clientX - touchStartX;
            let deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) return;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.move(deltaX > 0 ? 'right' : 'left');
            } else {
                this.move(deltaY > 0 ? 'down' : 'up');
            }
            touchStartX = 0; touchStartY = 0;
            vibrate();
        });
    }

    setupKeyboardEvents() {
        window.addEventListener('keydown', (e) => {
            if (document.querySelector('#game-section.active')) {
                switch (e.key) {
                    case 'ArrowLeft': this.move('left'); e.preventDefault(); vibrate(); break;
                    case 'ArrowRight': this.move('right'); e.preventDefault(); vibrate(); break;
                    case 'ArrowUp': this.move('up'); e.preventDefault(); vibrate(); break;
                    case 'ArrowDown': this.move('down'); e.preventDefault(); vibrate(); break;
                }
            }
        });
    }
}

function initGame2048() {
    const board = document.getElementById('game-board-2048');
    const scoreEl = document.getElementById('game-score');
    const bestEl = document.getElementById('best-score');
    const statusEl = document.getElementById('game-status');
    const replayBtn = document.getElementById('replay-share-btn');
    if (board && scoreEl && bestEl && statusEl && !game2048) {
        game2048 = new Game2048(board, scoreEl, bestEl, statusEl, replayBtn);
        document.getElementById('new-game-btn').addEventListener('click', () => {
            vibrate();
            game2048.resetGame();
            document.getElementById('replay-viewer').style.display = 'none';
            document.getElementById('new-game-btn').style.display = '';
        });
        if (replayMode) game2048.startReplay(replaySeed, replayMoves);
    }
}

/* ========== ВКЛАДКИ ИГРЫ ========== */
function setupGameTabs() {
    const tabs = document.querySelectorAll('.game-tab');
    const contents = document.querySelectorAll('.game-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
            if (target === 'achievements') loadAchievementsUI();
            if (target === 'challenges') loadChallengesUI();
        });
    });
}

/* ========== ДОСТИЖЕНИЯ UI ========== */
function loadAchievementsUI() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    const earned = JSON.parse(localStorage.getItem('achievements') || '{}');
    container.innerHTML = ACHIEVEMENTS.map(a => `
        <div class="achievement-item ${earned[a.id] ? 'earned' : ''}">
            <div class="achievement-icon">${a.icon}</div>
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}</div>
        </div>
    `).join('');
    updateProfileBadges(earned);
}

function updateProfileBadges(earned) {
    const badgesContainer = document.getElementById('profile-badges');
    if (!badgesContainer) return;
    const earnedList = ACHIEVEMENTS.filter(a => earned[a.id]);
    badgesContainer.innerHTML = earnedList.map(a => `<span class="badge" title="${a.name}">${a.icon}</span>`).join('');
}

/* ========== ИСПЫТАНИЯ ========== */
function getDailyTask() {
    const tasks = [
        { desc: 'Наберите 1500 очков', target: 1500, type: 'score' },
        { desc: 'Достигните плитки 128', target: 128, type: 'tile' },
        { desc: 'Сделайте 30 ходов', target: 30, type: 'moves' },
        { desc: 'Совершите 3 слияния за ход', target: 3, type: 'merge_combo' }
    ];
    const dayIndex = new Date().getDate() % tasks.length;
    return tasks[dayIndex];
}

function getWeeklyTask() {
    const tasks = [
        { desc: 'Наберите 8000 очков', target: 8000, type: 'score' },
        { desc: 'Достигните плитки 512', target: 512, type: 'tile' },
        { desc: 'Сделайте 150 ходов', target: 150, type: 'moves' },
        { desc: 'Совершите 10 слияний за игру', target: 10, type: 'total_merges' }
    ];
    const week = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 604800000) % tasks.length;
    return tasks[week];
}

function loadChallengesUI() {
    const daily = getDailyTask();
    const weekly = getWeeklyTask();
    document.getElementById('daily-desc').textContent = daily.desc;
    document.getElementById('weekly-desc').textContent = weekly.desc;

    const dailyData = JSON.parse(localStorage.getItem('dailyProgress') || '{"date":"","progress":0}');
    const weeklyData = JSON.parse(localStorage.getItem('weeklyProgress') || '{"week":"","progress":0}');
    const today = new Date().toISOString().slice(0,10);
    const currentWeek = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 604800000);

    if (dailyData.date !== today) { dailyData.date = today; dailyData.progress = 0; }
    if (weeklyData.week !== currentWeek) { weeklyData.week = currentWeek; weeklyData.progress = 0; }

    const dailyPct = Math.min(100, (dailyData.progress / daily.target) * 100);
    const weeklyPct = Math.min(100, (weeklyData.progress / weekly.target) * 100);
    document.getElementById('daily-progress').style.width = dailyPct + '%';
    document.getElementById('weekly-progress').style.width = weeklyPct + '%';
    document.getElementById('daily-status').textContent = dailyData.progress >= daily.target ? '✅ Выполнено' : `${dailyData.progress}/${daily.target}`;
    document.getElementById('weekly-status').textContent = weeklyData.progress >= weekly.target ? '✅ Выполнено' : `${weeklyData.progress}/${weekly.target}`;
}

/* ========== REPLAY PARAM CHECK ========== */
function checkReplayParam() {
    if (window.Telegram?.WebApp) {
        const param = window.Telegram.WebApp.initDataUnsafe?.start_param;
        if (param && param.startsWith('replay_')) {
            const data = param.replace('replay_', '');
            const [seedStr, movesStr] = data.split('_');
            if (seedStr && movesStr) {
                replaySeed = parseInt(seedStr);
                replayMoves = movesStr.split('').map(c => {
                    switch(c) {
                        case 'l': return 'left';
                        case 'r': return 'right';
                        case 'u': return 'up';
                        case 'd': return 'down';
                        default: return 'left';
                    }
                });
                replayMode = true;
                document.querySelector('.game-tab[data-tab="play"]')?.click();
            }
        }
    }
}

/* ========== ЛИДЕРБОРД ========== */
async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        renderLeaderboard(data.leaderboard || []);
    } catch (err) {
        list.innerHTML = '<div class="leaderboard-loading">Не удалось загрузить таблицу</div>';
    }
}

function renderLeaderboard(leaderboard) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    if (!leaderboard.length) {
        list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>';
        return;
    }
    list.innerHTML = leaderboard.map((player, index) => {
        const isCurrentUser = currentUserId && player.userId.toString() === currentUserId.toString();
        const rank = index + 1;
        const avatarContent = player.avatarUrl
            ? `<img src="${player.avatarUrl}" alt="${player.firstName}" onerror="this.style.display='none'; this.parentElement.textContent='${player.firstName.charAt(0).toUpperCase()}';" />`
            : player.firstName.charAt(0).toUpperCase();
        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                <div class="leaderboard-rank">#${rank}</div>
                <div class="leaderboard-avatar">${avatarContent}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${escapeHtml(player.firstName)}</div>
                </div>
                <div class="leaderboard-score">
                    ${player.score} <span>очк.</span>
                    <button class="leaderboard-share-btn" data-share-name="${escapeHtml(player.firstName)}" data-share-score="${player.score}">
                        <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function setupLeaderboardRefresh() {
    document.getElementById('refresh-leaderboard')?.addEventListener('click', () => {
        vibrate();
        fetchLeaderboard();
    });
}

function setupLeaderboardShare() {
    document.getElementById('leaderboard-list')?.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.leaderboard-share-btn');
        if (!shareBtn) return;
        e.stopPropagation();
        const name = shareBtn.dataset.shareName;
        const score = shareBtn.dataset.shareScore;
        if (name && score) {
            const shareText = `🏆 ${name} набрал ${score} очков в 2048! Сможешь побить рекорд? Играй в Games Verse: https://t.me/${BOT_USERNAME}`;
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/' + BOT_USERNAME)}&text=${encodeURIComponent(shareText)}`);
            } else if (navigator.share) {
                navigator.share({ title: 'Games Verse', text: shareText, url: 'https://t.me/' + BOT_USERNAME }).catch(() => fallbackCopyToClipboard(shareText));
            } else {
                fallbackCopyToClipboard(shareText);
            }
        }
    });
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}
