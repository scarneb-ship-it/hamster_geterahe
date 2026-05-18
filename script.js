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

// ==================== ПЕРЕВОДЫ (только русский) ====================
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

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function vibrate() {
    if (navigator.vibrate) navigator.vibrate(50);
}

function initializeApp() {
    // Мгновенно скрываем splash screen
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
                if (tapGame) tapGame.syncState();
            }
        });
    });

    // Сразу подгружаем лидеров, если вкладка активна по умолчанию
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

// ==================== TAP GAME (вместо 2048) ====================
class TapGame {
    constructor() {
        this.state = this.loadState();
        this.lastUpdate = this.state.lastUpdate || Date.now();
        this.lastScoreSubmit = 0;
        this.syncState(); // применяем оффлайн-реген
        this.updateUI();
        this.startIntervals();
        this.bindEvents();
    }

    loadState() {
        const defaultState = {
            balance: 0,
            tapPower: 1,
            maxEnergy: 100,
            currentEnergy: 100,
            autoTapLevel: 0,
            autoTapIncome: 0,
            lastUpdate: Date.now(),
            lastClaimDate: null,
            lastSubmittedBalance: 0
        };
        try {
            const saved = JSON.parse(localStorage.getItem('tapGameState'));
            return { ...defaultState, ...saved };
        } catch(e) { return defaultState; }
    }

    saveState() {
        this.state.lastUpdate = Date.now();
        localStorage.setItem('tapGameState', JSON.stringify(this.state));
    }

    syncState() {
        const now = Date.now();
        const elapsed = Math.floor((now - this.lastUpdate) / 1000);
        if (elapsed <= 0) return;
        // Регенерация энергии
        const regenRate = 2; // энергии в секунду
        const energyRegen = Math.min(elapsed * regenRate, this.state.maxEnergy - this.state.currentEnergy);
        if (energyRegen > 0) this.state.currentEnergy += energyRegen;
        // Авто-тап доход
        const autoIncome = this.state.autoTapIncome * elapsed;
        if (autoIncome > 0) this.state.balance += autoIncome;
        this.lastUpdate = now;
        this.saveState();
        this.updateUI();
    }

    updateUI() {
        document.getElementById('tap-balance').textContent = this.state.balance;
        const energyPercent = (this.state.currentEnergy / this.state.maxEnergy) * 100;
        document.getElementById('tap-energy-fill').style.width = energyPercent + '%';
        document.getElementById('tap-energy-text').textContent = `${this.state.currentEnergy}/${this.state.maxEnergy}`;
        document.getElementById('tap-power-level').textContent = this.state.tapPower;
        document.getElementById('max-energy-level').textContent = Math.floor((this.state.maxEnergy - 100)/10) + 1;
        document.getElementById('auto-tap-level').textContent = this.state.autoTapLevel;
        document.getElementById('auto-tap-income').textContent = this.state.autoTapIncome;

        // Стоимость улучшений
        const tapPowerCost = 10 * (this.state.tapPower + 1);
        const maxEnergyCost = 20 * (Math.floor((this.state.maxEnergy - 100)/10) + 2);
        const autoTapCost = 50 * (this.state.autoTapLevel + 1);
        document.getElementById('tap-power-cost').textContent = tapPowerCost;
        document.getElementById('max-energy-cost').textContent = maxEnergyCost;
        document.getElementById('auto-tap-cost').textContent = autoTapCost;

        // Кнопки активны, если хватает баланса
        document.getElementById('upgrade-tap-power').disabled = this.state.balance < tapPowerCost;
        document.getElementById('upgrade-max-energy').disabled = this.state.balance < maxEnergyCost;
        document.getElementById('upgrade-auto-tap').disabled = this.state.balance < autoTapCost;

        // Ежедневная награда
        const today = new Date().toDateString();
        const rewardBtn = document.getElementById('daily-reward-button');
        if (rewardBtn) {
            rewardBtn.disabled = this.state.lastClaimDate === today;
            rewardBtn.textContent = this.state.lastClaimDate === today ? '🎁 Награда получена' : '🎁 Ежедневная награда';
        }
    }

    startIntervals() {
        this.energyInterval = setInterval(() => {
            if (document.querySelector('#game-section.active')) {
                if (this.state.currentEnergy < this.state.maxEnergy) {
                    this.state.currentEnergy = Math.min(this.state.maxEnergy, this.state.currentEnergy + 2);
                    this.saveState(); this.updateUI();
                }
            }
        }, 1000);
        this.autoTapInterval = setInterval(() => {
            if (document.querySelector('#game-section.active') && this.state.autoTapIncome > 0) {
                this.state.balance += this.state.autoTapIncome;
                this.saveState(); this.updateUI();
            }
        }, 1000);
    }

    bindEvents() {
        const tapBtn = document.getElementById('tap-main-button');
        const handleTap = (e) => {
            e.preventDefault();
            if (this.state.currentEnergy <= 0) return;
            vibrate();
            this.state.currentEnergy--;
            this.state.balance += this.state.tapPower;
            this.showFloatingText(`+${this.state.tapPower}`);
            this.spawnParticles(e);
            this.saveState();
            this.updateUI();
            this.trySubmitScore();
        };
        tapBtn.addEventListener('pointerdown', handleTap);

        document.getElementById('upgrade-tap-power').addEventListener('click', () => {
            const cost = 10 * (this.state.tapPower + 1);
            if (this.state.balance >= cost) {
                this.state.balance -= cost;
                this.state.tapPower++;
                this.saveState(); this.updateUI();
                this.submitScore();
            }
        });
        document.getElementById('upgrade-max-energy').addEventListener('click', () => {
            const cost = 20 * (Math.floor((this.state.maxEnergy - 100)/10) + 2);
            if (this.state.balance >= cost) {
                this.state.balance -= cost;
                this.state.maxEnergy += 10;
                this.saveState(); this.updateUI();
                this.submitScore();
            }
        });
        document.getElementById('upgrade-auto-tap').addEventListener('click', () => {
            const cost = 50 * (this.state.autoTapLevel + 1);
            if (this.state.balance >= cost) {
                this.state.balance -= cost;
                this.state.autoTapLevel++;
                this.state.autoTapIncome = this.state.autoTapLevel * 2;
                this.saveState(); this.updateUI();
                this.submitScore();
            }
        });

        document.getElementById('daily-reward-button').addEventListener('click', () => {
            const today = new Date().toDateString();
            if (this.state.lastClaimDate !== today) {
                this.state.lastClaimDate = today;
                const reward = 500 + (this.state.autoTapLevel * 100);
                this.state.balance += reward;
                this.saveState(); this.updateUI();
                this.submitScore();
                showNotification(`Получено ${reward} монет!`);
            }
        });

        // Сохранение при уходе
        window.addEventListener('beforeunload', () => this.saveState());
    }

    showFloatingText(text) {
        const area = document.getElementById('tap-floating-text');
        if (!area) return;
        const el = document.createElement('div');
        el.className = 'floating-plus';
        el.textContent = text;
        area.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    spawnParticles(e) {
        const btn = document.getElementById('tap-main-button');
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width/2;
        const centerY = rect.top + rect.height/2;
        const count = 5;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'tap-particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.setProperty('--tx', (Math.random() - 0.5) * 80 + 'px');
            particle.style.setProperty('--ty', (Math.random() - 0.5) * 80 - 40 + 'px');
            document.body.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove());
        }
    }

    trySubmitScore() {
        // Отправляем счёт не чаще раза в 10 секунд
        if (Date.now() - this.lastScoreSubmit < 10000) return;
        this.submitScore();
    }

    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        const payload = {
            userId: currentUserId.toString(),
            firstName: user.first_name || 'Игрок',
            username: user.username || '',
            score: this.state.balance,
            avatarUrl: user.photo_url || ''
        };
        fetch(WORKER_URL + '/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(() => {
            this.lastScoreSubmit = Date.now();
            this.state.lastSubmittedBalance = this.state.balance;
            fetchLeaderboard();
        }).catch(err => console.error('Ошибка отправки счёта:', err));
    }

    destroy() {
        clearInterval(this.energyInterval);
        clearInterval(this.autoTapInterval);
    }
}

let tapGame = null;
function initTapGame() {
    if (!tapGame) tapGame = new TapGame();
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
                    ${player.score} <span>монет</span>
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
            if (tapGame) tapGame.submitScore();
            else fetchLeaderboard();
        });
    }
}
