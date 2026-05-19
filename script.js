const BOT_USERNAME = 'khadron_bot'; // ← замените на username вашего бота
let currentUserId = null;

const WORKER_URL = ''; // API на том же домене

const GAMES_DATA = [
    {
        id: 0,
        name: "Pixel World",
        fullLink: "https://t.me/pixelworld/play?startapp=r6823288584",
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
        fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584",
        description: "Создай свою студию",
        rating: 4.7,
        players: "368K",
        image: "images/hamster-gamedev.jpg",
        fallback: "🎮"
    },
    {
        id: 2,
        name: "Hamster King",
        fullLink: "https://t.me/hamsterking_game_bot?startapp=6823288584",
        description: "Стань королем хомяков",
        rating: 4.2,
        players: "188K",
        image: "images/hamster-king.jpg",
        fallback: "👑"
    },
    {
        id: 3,
        name: "Hamster Fight Club",
        fullLink: "https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5",
        description: "Бойцовский клуб хомяков",
        rating: 4.9,
        players: "85K",
        image: "images/hamster-fightclub.jpg",
        fallback: "🥊"
    },
    {
        id: 4,
        name: "BitQuest",
        fullLink: "https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584",
        description: "Приключения в мире крипты",
        rating: 3.8,
        players: "281K",
        image: "images/bitquest.jpg",
        fallback: "💰"
    }
];

const EXCHANGES_DATA = [
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
        name: "BingX",
        url: "https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925",
        description: "Социальная торговля и копирование",
        image: "images/bingx.jpg",
        fallback: "📈"
    },
    {
        id: 3,
        name: "Bitget",
        url: "https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H&from=%2Fru%2Fevents%2Freferral-all-program&source=events&utmSource=PremierInviter",
        description: "Инновационная торговая платформа",
        image: "images/bitget.jpg",
        fallback: "⚡"
    },
    {
        id: 4,
        name: "MEXC",
        url: "https://promote.mexc.com/r/aTSLfdm54W",
        description: "Глобальная биржа с низкими комиссиями",
        image: "images/mexc.jpg",
        fallback: "🌍"
    }
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

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function vibrate() {
    if (navigator.vibrate) navigator.vibrate(50);
}

function initializeApp() {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    document.body.style.opacity = '1';

    initializeTelegramWebApp();
    setupNavigation();
    initializeGames();
    initializeExchanges();
    setupSettingsPanel();
    loadThemePreference();
    setLanguage();
    loadUserData();
    setupShareButton();
    initGame2048();
    setupLeaderboardRefresh();
    setupLeaderboardShare();
}

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
            <button class="exchange-button" data-url="${exchange.url}">
                Перейти
            </button>
        </div>
    `).join('');
    setupExchangeButtons();
}

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
        ref: ref || null,
        initData: window.Telegram?.WebApp?.initData || ''
    };

    try {
        await fetch(WORKER_URL + '/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('track err:', err);
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
    if (sectionId === 'profile-section' || sectionId === 'game-section') {
        headerElement.style.display = 'none';
        if (mainContent) mainContent.style.paddingTop = '8px';
    } else {
        headerElement.style.display = 'block';
        if (mainContent) mainContent.style.paddingTop = '';
    }
}

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
                fetchLeaderboard();
            }
        });
    });

    const activeSection = document.querySelector('.content-section.active');
    if (activeSection && activeSection.id === 'game-section') {
        fetchLeaderboard();
    }
    if (activeSection) toggleHeaderForSection(activeSection.id);
}

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

function setupExchangeButtons() {
    document.querySelectorAll('.exchange-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const exchangeUrl = this.getAttribute('data-url');
            if (exchangeUrl) {
                if (window.Telegram && window.Telegram.WebApp) window.Telegram.WebApp.openLink(exchangeUrl);
                else window.open(exchangeUrl, '_blank');
            }
        });
    });
}

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

function setLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) element.textContent = translations[key];
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
                        title: 'Games Verse',
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

/* 2048 Game */
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
            avatarUrl: user.photo_url || '',
            initData: window.Telegram?.WebApp?.initData || ''
        };
        fetch(WORKER_URL + '/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(() => {
            fetchLeaderboard();
        }).catch(err => console.error('submit score err:', err));
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

/* Leaderboard */
async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';

    try {
        const res = await fetch(WORKER_URL + '/api/leaderboard');
        const data = await res.json();
        renderLeaderboard(data.leaderboard || []);
    } catch (err) {
        console.error('leaderboard err:', err);
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
                <div class="leaderboard-avatar">
                    ${avatarContent}
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${escapeHtml(player.firstName)}</div>
                </div>
                <div class="leaderboard-score">
                    ${player.score} <span>очк.</span>
                    <button class="leaderboard-share-btn" aria-label="Поделиться результатом" data-share-name="${escapeHtml(player.firstName)}" data-share-score="${player.score}">
                        <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                    </button>
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

function setupLeaderboardShare() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    leaderboardList.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.leaderboard-share-btn');
        if (!shareBtn) return;
        e.stopPropagation();
        const name = shareBtn.dataset.shareName;
        const score = shareBtn.dataset.shareScore;
        if (name && score) shareLeaderboardScore(name, parseInt(score, 10));
    });
}

function shareLeaderboardScore(name, score) {
    const shareText = `🏆 ${name} набрал ${score} очков в 2048! Сможешь побить рекорд? Играй в Games Verse: https://t.me/${BOT_USERNAME}`;
    if (window.Telegram?.WebApp) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/' + BOT_USERNAME)}&text=${encodeURIComponent(shareText)}`;
        window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else if (navigator.share) {
        navigator.share({
            title: 'Games Verse',
            text: shareText,
            url: 'https://t.me/' + BOT_USERNAME
        }).catch(() => fallbackCopyToClipboard(shareText));
    } else {
        fallbackCopyToClipboard(shareText);
    }
}
