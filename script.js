const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;

const WORKER_URL = 'https://games-verse.scarneb.workers.dev';

// Глобальная настройка вибрации
let vibrationEnabled = true;

const GAMES_DATA = [
    {
        id: 1,
        name: "Hamster GameDev",
        fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584",
        description: "Создай свою студию",
        rating: 4.8,
        players: "339K",
        image: "images/hamster-gamedev.jpg",
        fallback: "🎮"
    },
    {
        id: 2,
        name: "Hamster King",
        fullLink: "https://t.me/hamsterking_game_bot?startapp=6823288584",
        description: "Стань королём хомяков",
        rating: 4.6,
        players: "120K",
        image: "images/hamster-king.jpg",
        fallback: "👑"
    },
    {
        id: 3,
        name: "Hamster Fight Club",
        fullLink: "https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5",
        description: "Бойцовский клуб хомяков",
        rating: 4.8,
        players: "99K",
        image: "images/hamster-fightclub.jpg",
        fallback: "🥊"
    },
     {
        id: 4,
        name: "Pixel World",
        fullLink: "https://t.me/pixelworld/play?startapp=r6823288584",
        description: "Первый 3D-шутер в Telegram",
        rating: 4.9,
        players: "65K",
        image: "images/photo_2026-02-17_13-44-55.jpg",
        fallback: "🌍",
    },
    {
        id: 5,
        name: "Underpaws",
        fullLink: "https://t.me/underpaws_game_bot?startapp=6823288584",
        description: "Приключения в мире зверей",
        rating: 4.3,
        players: "3,2K",
        image: "images/underpaws.jpg",
        fallback: "🐾",
        badge: "Beta"
    }
];
const SERVICES_DATA = [
    {
        id: 1,
        name: "Bybit",
        url: "https://www.bybit.com/invite?ref=57KXPMO",
        description: "Продвинутая торговая платформа",
        image: "images/bybit.jpg",
        fallback: "💱"
    },
    {
        id: 2,
        name: "Portals",
        url: "https://t.me/portals/market?startapp=xr9tzm",
        description: "Маркет подарков Telegram",
        image: "images/portals.jpg",
        fallback: "🎁"
    },
    {
        id: 3,
        name: "StarsShip",
        url: "http://t.me/StarsShipBot?start=r6823288584",
        description: "Покупка Telegram Stars",
        image: "images/starship.jpg",
        fallback: "⭐"
    }
];

const translations = {
    appTitle: "Hadron Verse",
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

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function vibrate() {
    if (!vibrationEnabled) return;
    if (navigator.vibrate) navigator.vibrate(30);
}

function initializeApp() {
    // Splash screen — показываем 3.2с потом плавно скрываем
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('splash-fade-out');
            splash.addEventListener('transitionend', () => {
                splash.style.display = 'none';
            }, { once: true });
        }, 3200);
    }

    document.body.style.opacity = '1';

    initializeTelegramWebApp();
    setupNavigation();
    initializeGames();
    initializeServices();
    setupSettingsPanel();
    loadThemePreference();
    loadVibrationPreference();
    setLanguage();
    loadUserData();
    setupShareButton();
    initGame2048();
    setupLeaderboardRefresh();
    setupGameTabs();

    // Инициализация рекламного баннера
    initAdBanner();
}

// ===== Telegram WebApp =====
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

// ===== Рекламный баннер =====
function initAdBanner() {
    const banner = document.getElementById('ad-banner');
    const closeBtn = document.getElementById('ad-banner-close');
    const goBtn = document.getElementById('ad-banner-btn');

    if (!banner || !closeBtn || !goBtn) return;

    // Проверяем, скрыт ли баннер на 24 часа
    const hiddenUntil = localStorage.getItem('adBannerHiddenUntil');
    if (hiddenUntil && Date.now() < parseInt(hiddenUntil)) {
        banner.style.display = 'none';
        return;
    }

    // Показываем баннер
    banner.style.display = 'flex';

    // Обработчик закрытия
    closeBtn.addEventListener('click', () => {
        hideAdBannerFor24Hours();
    });

    // Обработчик клика по кнопке
    goBtn.addEventListener('click', () => {
        // Открываем ссылку
        const adUrl = 'https://one-vv5058.com/casino/list?open=register&p=wrih';
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.openLink(adUrl);
        } else {
            window.open(adUrl, '_blank');
        }
        // Скрываем баннер на 24 часа
        hideAdBannerFor24Hours();
    });
}

function hideAdBannerFor24Hours() {
    const banner = document.getElementById('ad-banner');
    if (banner) banner.style.display = 'none';
    // Сохраняем время, до которого баннер скрыт
    const hideUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 часа
    localStorage.setItem('adBannerHiddenUntil', hideUntil.toString());
}

// ===== Инициализация игр =====
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
            <button class="play-button" data-link="${game.fullLink || ''}">
                Играть
            </button>
        </div>
    `).join('');
    setupGameButtons();
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

// ===== Инициализация сервисов =====
function initializeServices() {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    servicesList.innerHTML = SERVICES_DATA.map(service => `
        <div class="exchange-card" data-service-id="${service.id}">
            <div class="exchange-logo">
                <img src="${service.image}" alt="${service.name}" class="exchange-img" onerror="this.style.display='none'">
                <div class="image-fallback">${service.fallback}</div>
            </div>
            <div class="exchange-info">
                <h3>${service.name}</h3>
                <p>${service.description}</p>
            </div>
            <button class="exchange-button" data-url="${service.url}">
                Перейти
            </button>
        </div>
    `).join('');
    setupServiceButtons();
}

// ===== Данные пользователя =====
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

    const payload = {
        userId: user.id.toString(),
        firstName: user.first_name || '',
        username: user.username || '',
        ref: ref || null
    };

    try {
        await fetch(WORKER_URL + '/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Ошибка отправки статистики Mini App:', err);
    }
}

function updateProfileDisplay(user) {
    const userName = document.getElementById('user-name');
    if (userName) userName.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    const userUsername = document.getElementById('user-username');
    if (userUsername) userUsername.textContent = user.username ? '@' + user.username : 'Telegram User';
    updateUserAvatar(user);
    if (user.is_premium) showPremiumBadge();
}

function updateUserAvatar(user) {
    const avatarImg = document.getElementById('avatar-img');
    const avatarFallback = document.getElementById('avatar-fallback');
    if (!avatarImg) return;
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
        avatarImg.style.display = 'block';
        avatarImg.onerror = () => { avatarImg.style.display = 'none'; showAvatarFallback(user, avatarFallback); };
        avatarFallback.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        showAvatarFallback(user, avatarFallback);
    }
}

function showAvatarFallback(user, avatarFallback) {
    if (user.first_name) avatarFallback.textContent = user.first_name.charAt(0).toUpperCase();
    else avatarFallback.textContent = 'T';
    avatarFallback.style.display = 'flex';
}

function showPremiumBadge() {
    const profileInfo = document.querySelector('.profile-info');
    if (profileInfo && !document.querySelector('.premium-badge')) {
        const premiumBadge = document.createElement('div');
        premiumBadge.className = 'premium-badge';
        premiumBadge.innerHTML = '⭐ Premium';
        profileInfo.appendChild(premiumBadge);
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

const headerElement = document.querySelector('.header');
const mainContent = document.querySelector('.main-content');

function toggleHeaderForSection(sectionId) {
    if (!headerElement) return;
    if (sectionId === 'profile-section') {
        headerElement.style.display = 'none';
        if (mainContent) mainContent.style.paddingTop = '8px';
    } else {
        headerElement.style.display = 'block';
        if (mainContent) mainContent.style.paddingTop = '';
    }
}

// ===== Навигация =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const targetSection = this.getAttribute('data-section');
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) section.classList.add('active');
            });
            toggleHeaderForSection(targetSection);

            if (targetSection === 'game-section') {
                resetGameTabsToDefault();
                fetchLeaderboard();
            }
        });
    });

    const activeSection = document.querySelector('.content-section.active');
    if (activeSection && activeSection.id === 'game-section') {
        resetGameTabsToDefault();
        fetchLeaderboard();
    }
    if (activeSection) toggleHeaderForSection(activeSection.id);
}

// ===== Кнопки "Играть" =====
function setupGameButtons() {
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

function setupServiceButtons() {
    document.querySelectorAll('.exchange-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const url = this.getAttribute('data-url');
            if (url) {
                if (window.Telegram && window.Telegram.WebApp) {
                    if (url.startsWith('https://t.me/') || url.startsWith('http://t.me/')) {
                        window.Telegram.WebApp.openTelegramLink(url);
                    } else {
                        window.Telegram.WebApp.openLink(url);
                    }
                } else {
                    window.open(url, '_blank');
                }
            }
        });
    });
}

// ===== Настройки =====
function setupSettingsPanel() {
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    if (settingsButton) settingsButton.addEventListener('click', () => { vibrate(); settingsPanel.classList.add('active'); });
    if (closeSettings) closeSettings.addEventListener('click', () => { vibrate(); settingsPanel.classList.remove('active'); });
    if (settingsPanel) settingsPanel.addEventListener('click', (e) => { if (e.target === settingsPanel) settingsPanel.classList.remove('active'); });

    document.querySelectorAll('.theme-option[data-theme]').forEach(option => {
        option.addEventListener('click', function() {
            vibrate();
            const theme = this.getAttribute('data-theme');
            document.querySelectorAll('.theme-option[data-theme]').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            if (theme === 'dark') document.body.classList.add('dark-theme');
            else document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', theme);
        });
    });

    const vibrationOptions = document.querySelectorAll('.theme-option[data-vibration]');
    vibrationOptions.forEach(option => {
        option.addEventListener('click', function() {
            vibrate();
            const state = this.getAttribute('data-vibration');
            vibrationEnabled = (state === 'on');
            localStorage.setItem('vibration', state);
            updateVibrationSwitcherUI();
        });
    });

    updateVibrationSwitcherUI();
}

function updateVibrationSwitcherUI() {
    const vibrationOptions = document.querySelectorAll('.theme-option[data-vibration]');
    if (!vibrationOptions.length) return;
    vibrationOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-vibration') === (vibrationEnabled ? 'on' : 'off')) {
            opt.classList.add('active');
        }
    });
}

function loadVibrationPreference() {
    const saved = localStorage.getItem('vibration');
    if (saved === 'off') {
        vibrationEnabled = false;
    } else {
        vibrationEnabled = true;
    }
    updateVibrationSwitcherUI();
}

function setLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) element.textContent = translations[key];
    });
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');
    document.querySelectorAll('.theme-option[data-theme]').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-theme') === savedTheme) opt.classList.add('active');
    });
}

// ===== Поделиться =====
function setupShareButton() {
    const shareButton = document.getElementById('share-friends-button');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            vibrate();
            let botUrl;
            if (currentUserId) {
                botUrl = `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`;
            } else {
                botUrl = `https://t.me/${BOT_USERNAME}`;
            }
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
                    navigator.share({
                        title: 'Hadron Verse',
                        text: shareText,
                        url: botUrl,
                    }).catch(() => fallbackCopyToClipboard(botUrl));
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
    } catch (err) {
        showNotification('Не удалось скопировать ссылку');
    }
}

function showNotification(customMessage) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = customMessage || translations.linkCopied;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}

// ========== GAME 2048 ==========
class Game2048 {
    constructor(boardElement, scoreElement, bestScoreElement, statusElement) {
        this.boardElement = boardElement;
        this.scoreElement = scoreElement;
        this.bestScoreElement = bestScoreElement;
        this.statusElement = statusElement;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore2048') ? parseInt(localStorage.getItem('bestScore2048')) : 0;
        this.lastAddedTile = null;
        this.mergedPositions = new Set();
        this.moveMap = null;

        this.updateBestScoreUI();
        this.init();
        this.setupSwipeEvents();
        this.setupKeyboardEvents();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScoreUI();
        this.statusElement.textContent = '';
        this.lastAddedTile = null;
        this.mergedPositions.clear();
        this.moveMap = null;
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) emptyCells.push({x: i, y: j});
            }
        }
        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
            this.lastAddedTile = {x, y};
            return true;
        }
        return false;
    }

    move(direction) {
        const oldGrid = JSON.parse(JSON.stringify(this.grid));
        let totalScoreGain = 0;
        this.mergedPositions.clear();
        this.moveMap = {};

        const slideWithTracking = (row, isColumn, index, reverse) => {
            let arr = row.filter(v => v !== 0);
            let newRow = [];
            let scoreGain = 0;
            let merged = new Array(arr.length).fill(false);

            for (let i = 0; i < arr.length; i++) {
                if (i + 1 < arr.length && arr[i] === arr[i + 1] && !merged[i] && !merged[i+1]) {
                    let mergedVal = arr[i] * 2;
                    newRow.push(mergedVal);
                    scoreGain += mergedVal;
                    merged[i] = merged[i+1] = true;
                    i++;
                } else {
                    newRow.push(arr[i]);
                }
            }
            while (newRow.length < this.size) newRow.push(0);

            let oldVals = arr;
            let oldPtr = 0;
            for (let newPos = 0; newPos < this.size; newPos++) {
                if (newRow[newPos] === 0) continue;
                if (oldPtr < oldVals.length && oldVals[oldPtr] * 2 === newRow[newPos] &&
                    oldPtr + 1 < oldVals.length && oldVals[oldPtr] === oldVals[oldPtr + 1]) {
                    this.recordMove(oldPtr, oldVals, newPos, isColumn, index, reverse, true, false);
                    this.recordMove(oldPtr + 1, oldVals, newPos, isColumn, index, reverse, true, true);
                    oldPtr += 2;
                } else if (oldPtr < oldVals.length && oldVals[oldPtr] === newRow[newPos]) {
                    this.recordMove(oldPtr, oldVals, newPos, isColumn, index, reverse, false, false);
                    oldPtr++;
                }
            }
            return {newRow, scoreGain};
        };

        this.recordMove = (oldIdx, oldVals, newIdx, isColumn, lineIdx, reverse, merged, isSecond) => {
            const originalLine = [];
            if (!isColumn) {
                originalLine.push(...this.grid[lineIdx]);
            } else {
                for (let r = 0; r < this.size; r++) originalLine.push(this.grid[r][lineIdx]);
            }
            if (reverse) originalLine.reverse();

            let skip = 0;
            let sourceIdx = -1;
            for (let i = 0; i < originalLine.length; i++) {
                if (originalLine[i] !== 0) {
                    if (skip === oldIdx) { sourceIdx = i; break; }
                    skip++;
                }
            }
            if (sourceIdx === -1) return;

            if (reverse) sourceIdx = this.size - 1 - sourceIdx;

            let fromRow, fromCol;
            if (!isColumn) {
                fromRow = lineIdx;
                fromCol = sourceIdx;
            } else {
                fromRow = sourceIdx;
                fromCol = lineIdx;
            }

            let targetIdx = newIdx;
            if (reverse) targetIdx = this.size - 1 - targetIdx;

            let toRow, toCol;
            if (!isColumn) {
                toRow = lineIdx;
                toCol = targetIdx;
            } else {
                toRow = targetIdx;
                toCol = lineIdx;
            }

            const key = `${toRow},${toCol}`;
            if (!this.moveMap[key]) {
                this.moveMap[key] = { fromRow, fromCol, merged };
            }
            if (merged) this.mergedPositions.add(key);
        };

        if (direction === 'left') {
            for (let i = 0; i < this.size; i++) {
                const {newRow, scoreGain} = slideWithTracking(this.grid[i], false, i, false);
                this.grid[i] = newRow;
                totalScoreGain += scoreGain;
            }
        } else if (direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                const reversed = [...this.grid[i]].reverse();
                const {newRow, scoreGain} = slideWithTracking(reversed, false, i, true);
                totalScoreGain += scoreGain;
                this.grid[i] = newRow.reverse();
            }
        } else if (direction === 'up') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) column.push(this.grid[i][j]);
                const {newRow, scoreGain} = slideWithTracking(column, true, j, false);
                totalScoreGain += scoreGain;
                for (let i = 0; i < this.size; i++) this.grid[i][j] = newRow[i];
            }
        } else if (direction === 'down') {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) column.push(this.grid[i][j]);
                const reversed = column.reverse();
                const {newRow, scoreGain} = slideWithTracking(reversed, true, j, true);
                totalScoreGain += scoreGain;
                const finalArr = newRow.reverse();
                for (let i = 0; i < this.size; i++) this.grid[i][j] = finalArr[i];
            }
        }

        if (totalScoreGain > 0) {
            this.score += totalScoreGain;
            this.updateScoreUI();
        }

        const changed = !this.gridsAreEqual(oldGrid, this.grid);
        if (changed) {
            this.addRandomTile();
            this.render();
            if (this.checkWin()) {
                this.statusElement.textContent = translations.gameWin;
                this.submitScoreToLeaderboard();
            } else if (this.checkLose()) {
                this.statusElement.textContent = translations.gameLose;
                this.submitScoreToLeaderboard();
            }
        } else {
            this.moveMap = null;
        }
    }

    gridsAreEqual(a, b) {
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (a[i][j] !== b[i][j]) return false;
        return true;
    }

    render() {
        const board = this.boardElement;
        board.innerHTML = '';
        const tileSize = board.clientWidth / this.size;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
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

                    if (this.lastAddedTile && this.lastAddedTile.x === i && this.lastAddedTile.y === j) {
                        tile.classList.add('tile-new');
                        tile.addEventListener('animationend', () => tile.classList.remove('tile-new'), { once: true });
                    }
                } else {
                    tile.textContent = '';
                }
                board.appendChild(tile);
            }
        }
        this.lastAddedTile = null;
        this.moveMap = null;
    }

    updateScoreUI() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore2048', this.bestScore);
            this.updateBestScoreUI();
        }
    }

    updateBestScoreUI() {
        this.bestScoreElement.textContent = this.bestScore;
    }

    checkWin() {
        return this.grid.some(row => row.includes(2048));
    }

    checkLose() {
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] === 0) return false;
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++) {
                const val = this.grid[i][j];
                if (j < this.size-1 && val === this.grid[i][j+1]) return false;
                if (i < this.size-1 && val === this.grid[i+1][j]) return false;
            }
        return true;
    }

    submitScoreToLeaderboard() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        const payload = {
            userId: currentUserId.toString(),
            firstName: user.first_name || 'Игрок',
            username: user.username || '',
            score: this.score,
            avatarUrl: user.photo_url || ''
        };
        fetch(WORKER_URL + '/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(() => {
            fetchLeaderboard();
        }).catch(err => console.error('Ошибка отправки счёта:', err));
    }

    setupSwipeEvents() {
        let touchStartX = 0, touchStartY = 0;
        this.boardElement.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });
        this.boardElement.addEventListener('touchend', (e) => {
            if (touchStartX === 0 && touchStartY === 0) return;
            let deltaX = e.changedTouches[0].clientX - touchStartX;
            let deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) return;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) this.move('right');
                else this.move('left');
            } else {
                if (deltaY > 0) this.move('down');
                else this.move('up');
            }
            touchStartX = 0; touchStartY = 0;
            vibrate();
        });
    }

    setupKeyboardEvents() {
        window.addEventListener('keydown', (e) => {
            if (document.querySelector('#game-section.active')) {
                const key = e.key;
                if (key === 'ArrowLeft') { this.move('left'); e.preventDefault(); vibrate(); }
                else if (key === 'ArrowRight') { this.move('right'); e.preventDefault(); vibrate(); }
                else if (key === 'ArrowUp') { this.move('up'); e.preventDefault(); vibrate(); }
                else if (key === 'ArrowDown') { this.move('down'); e.preventDefault(); vibrate(); }
            }
        });
    }

    resetGame() {
        this.init();
        this.render();
    }
}

let game2048 = null;
function initGame2048() {
    const board = document.getElementById('game-board-2048');
    const scoreEl = document.getElementById('game-score');
    const bestEl = document.getElementById('best-score');
    const statusEl = document.getElementById('game-status');
    if (board && scoreEl && bestEl && statusEl && !game2048) {
        game2048 = new Game2048(board, scoreEl, bestEl, statusEl);
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                vibrate();
                game2048.resetGame();
            });
        }
    }
}

// ========== Вкладки "Игра" / "Топы" ==========
function setupGameTabs() {
    const tabs = document.querySelectorAll('.game-tab');
    const gameContainer = document.querySelector('.game-2048-container');
    const leaderboardContainer = document.querySelector('.leaderboard-container');

    if (!tabs.length || !gameContainer || !leaderboardContainer) return;

    gameContainer.style.display = 'block';
    leaderboardContainer.style.display = 'none';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            vibrate();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.dataset.tab;
            if (tabName === 'game') {
                gameContainer.style.display = 'block';
                leaderboardContainer.style.display = 'none';
            } else if (tabName === 'leaderboard') {
                gameContainer.style.display = 'none';
                leaderboardContainer.style.display = 'block';
                fetchLeaderboard();
            }
        });
    });
}

function resetGameTabsToDefault() {
    const gameContainer = document.querySelector('.game-2048-container');
    const leaderboardContainer = document.querySelector('.leaderboard-container');
    const tabs = document.querySelectorAll('.game-tab');
    if (gameContainer && leaderboardContainer && tabs.length) {
        gameContainer.style.display = 'block';
        leaderboardContainer.style.display = 'none';
        tabs.forEach(t => t.classList.remove('active'));
        const gameTab = document.querySelector('.game-tab[data-tab="game"]');
        if (gameTab) gameTab.classList.add('active');
    }
}

// ========== LEADERBOARD ==========
async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';

    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderLeaderboard(data.leaderboard || []);
    } catch (err) {
        console.error('Ошибка загрузки лидеров:', err);
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
        const userId = player.user_id;
        const firstName = player.first_name || 'Игрок';
        const avatarUrl = player.avatar_url;
        const score = player.score || 0;
        const isCurrentUser = currentUserId && userId && userId.toString() === currentUserId.toString();
        const rank = index + 1;

        const avatarContent = avatarUrl
            ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(firstName)}" onerror="this.style.display='none'; this.parentElement.textContent='${escapeHtml(firstName.charAt(0).toUpperCase())}';" />`
            : firstName.charAt(0).toUpperCase();

        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                <div class="leaderboard-rank">#${rank}</div>
                <div class="leaderboard-avatar">${avatarContent}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${escapeHtml(firstName)}</div>
                </div>
                <div class="leaderboard-score">
                    ${score} <span>очк.</span>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function setupLeaderboardRefresh() {
    const refreshBtn = document.getElementById('refresh-leaderboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            vibrate();
            fetchLeaderboard();
        });
    }
}
