// ==================== КОНФИГУРАЦИЯ ====================
const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;

const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

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

// ==================== ПЕРЕВОДЫ ====================
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
    tapGame: "Таполка",
    coins: "Монеты",
    perClick: "За клик",
    swipeHint: "Тапай по монете!",
    autoTap: "Авто-клик",
    regen: "Восстановление",
};

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================
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
    initTapGame();
    setupLeaderboardRefresh();
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

// ==================== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ И ОТПРАВКА СТАТИСТИКИ ====================
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

// ==================== НАВИГАЦИЯ ====================
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

            // Загружаем лидеров при заходе во вкладку игры
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

// ==================== ШАРИНГ ====================
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

// ==================== TAP GAME ====================
class TapGame {
    constructor() {
        this.coins = 0;
        this.totalCoinsEarned = 0;
        this.perClick = 1;
        this.autoTapPerSec = 0;
        this.energy = 500;
        this.maxEnergy = 500;
        this.energyRegenPerSec = 1;
        
        // Уровни улучшений
        this.upgrades = {
            click: { level: 0, name: 'Усиление клика', baseCost: 10, costMultiplier: 1.5, effect: 1 },
            maxEnergy: { level: 0, name: 'Макс. энергия', baseCost: 20, costMultiplier: 1.6, effect: 100 },
            autoTap: { level: 0, name: 'Авто-тап', baseCost: 50, costMultiplier: 2.0, effect: 1 },
            regen: { level: 0, name: 'Восстановление', baseCost: 30, costMultiplier: 1.7, effect: 0.5 }
        };

        this.loadProgress();
        this.startIntervals();
        this.updateUI();
        this.renderUpgrades();
        this.setupCoinTap();
    }

    loadProgress() {
        const saved = JSON.parse(localStorage.getItem('tapGameProgress'));
        if (saved) {
            this.coins = saved.coins || 0;
            this.totalCoinsEarned = saved.totalCoinsEarned || 0;
            this.perClick = saved.perClick || 1;
            this.autoTapPerSec = saved.autoTapPerSec || 0;
            this.energy = saved.energy ?? 500;
            this.maxEnergy = saved.maxEnergy || 500;
            this.energyRegenPerSec = saved.energyRegenPerSec || 1;
            if (saved.upgrades) {
                for (const key in saved.upgrades) {
                    if (this.upgrades[key]) {
                        this.upgrades[key].level = saved.upgrades[key].level || 0;
                    }
                }
            }
        }
    }

    saveProgress() {
        const data = {
            coins: this.coins,
            totalCoinsEarned: this.totalCoinsEarned,
            perClick: this.perClick,
            autoTapPerSec: this.autoTapPerSec,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            energyRegenPerSec: this.energyRegenPerSec,
            upgrades: {}
        };
        for (const key in this.upgrades) {
            data.upgrades[key] = { level: this.upgrades[key].level };
        }
        localStorage.setItem('tapGameProgress', JSON.stringify(data));
    }

    getUpgradeCost(type) {
        const u = this.upgrades[type];
        return Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.level));
    }

    buyUpgrade(type) {
        const u = this.upgrades[type];
        const cost = this.getUpgradeCost(type);
        if (this.coins < cost) return false;

        this.coins -= cost;
        u.level++;

        // Применяем эффект улучшения
        switch (type) {
            case 'click':
                this.perClick += u.effect;
                break;
            case 'maxEnergy':
                this.maxEnergy += u.effect;
                this.energy = Math.min(this.energy + u.effect, this.maxEnergy);
                break;
            case 'autoTap':
                this.autoTapPerSec += u.effect;
                break;
            case 'regen':
                this.energyRegenPerSec += u.effect;
                break;
        }

        this.saveProgress();
        this.updateUI();
        this.renderUpgrades();
        this.submitScoreDebounced();
        return true;
    }

    tap() {
        if (this.energy < 1) return;
        this.energy--;
        const earned = this.perClick;
        this.coins += earned;
        this.totalCoinsEarned += earned;

        this.showTapValue(earned);
        this.updateUI();
        this.saveProgress();
        this.submitScoreDebounced();
    }

    showTapValue(value) {
        const pop = document.getElementById('tap-pop');
        if (pop) {
            pop.textContent = '+' + value;
            pop.classList.remove('active');
            void pop.offsetWidth;
            pop.classList.add('active');
        }
        // Добавляем небольшой эффект на монете
        const coin = document.getElementById('main-coin');
        if (coin) {
            coin.style.transform = 'scale(0.95)';
            setTimeout(() => { coin.style.transform = ''; }, 100);
        }
    }

    startIntervals() {
        // Авто-тап каждые 0.5 секунды
        setInterval(() => {
            if (this.autoTapPerSec > 0) {
                this.coins += this.autoTapPerSec * 0.5;
                this.totalCoinsEarned += this.autoTapPerSec * 0.5;
                this.updateUI();
                this.saveProgress();
            }
        }, 500);

        // Регенерация энергии каждую секунду
        setInterval(() => {
            if (this.energy < this.maxEnergy) {
                this.energy = Math.min(this.energy + this.energyRegenPerSec, this.maxEnergy);
                this.updateUI();
                this.saveProgress();
            }
        }, 1000);

        // Периодическая отправка счёта на сервер (раз в 10 секунд)
        setInterval(() => {
            this.submitScore();
        }, 10000);
    }

    updateUI() {
        document.getElementById('tap-coins').textContent = Math.floor(this.coins);
        document.getElementById('tap-per-click').textContent = this.perClick;
        document.getElementById('energy-text').textContent = `${Math.floor(this.energy)}/${this.maxEnergy}`;

        const energyPercent = (this.energy / this.maxEnergy) * 100;
        document.getElementById('energy-fill').style.width = energyPercent + '%';

        document.getElementById('auto-tap-info').textContent = this.autoTapPerSec + '/сек';
        document.getElementById('regen-info').textContent = this.energyRegenPerSec + '/сек';
    }

    renderUpgrades() {
        const container = document.getElementById('upgrades-list');
        if (!container) return;
        
        let html = '';
        for (const type in this.upgrades) {
            const u = this.upgrades[type];
            const cost = this.getUpgradeCost(type);
            const canBuy = this.coins >= cost;
            html += `
                <div class="upgrade-item">
                    <div class="upgrade-info">
                        <span class="upgrade-name">${u.name} (ур. ${u.level})</span>
                        <span class="upgrade-description">Стоимость: ${cost} 🪙</span>
                    </div>
                    <button class="upgrade-buy" data-type="${type}" ${canBuy ? '' : 'disabled'}>Купить</button>
                </div>
            `;
        }
        container.innerHTML = html;

        // Привязываем обработчики
        container.querySelectorAll('.upgrade-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                vibrate();
                const type = btn.getAttribute('data-type');
                if (this.buyUpgrade(type)) {
                    // успешно
                } else {
                    showNotification('Недостаточно монет');
                }
            });
        });
    }

    setupCoinTap() {
        const coin = document.getElementById('main-coin');
        if (coin) {
            coin.addEventListener('click', () => {
                vibrate();
                this.tap();
            });
        }
    }

    // Отправка счёта с дебаунсом
    submitScoreDebounced() {
        if (this._submitTimeout) clearTimeout(this._submitTimeout);
        this._submitTimeout = setTimeout(() => {
            this.submitScore();
        }, 2000);
    }

    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        const payload = {
            userId: currentUserId.toString(),
            firstName: user.first_name || 'Игрок',
            username: user.username || '',
            score: Math.floor(this.totalCoinsEarned),
            avatarUrl: user.photo_url || ''
        };
        fetch(WORKER_URL + '/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(() => {
            // после отправки можно обновить таблицу лидеров если она активна
            if (document.querySelector('#game-section.active')) {
                fetchLeaderboard();
            }
        }).catch(err => console.error('Ошибка отправки счёта:', err));
    }
}

let tapGame = null;
function initTapGame() {
    if (!tapGame) {
        tapGame = new TapGame();
    }
}

// ==================== LEADERBOARD ====================
async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';

    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
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
