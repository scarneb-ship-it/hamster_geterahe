// Configuration
const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'gamesverse_theme',
        LANGUAGE: 'gamesverse_language',
        USER_DATA: 'gamesverse_user_data',
        FAVORITES: 'gamesverse_favorites',
        ACHIEVEMENTS: 'gamesverse_achievements',
        LAST_VISIT: 'gamesverse_last_visit',
        DAILY_STREAK: 'gamesverse_daily_streak'
    },
    XP_VALUES: {
        GAME_CLICK: 10,
        EXCHANGE_CLICK: 5,
        REFERRAL: 50,
        DAILY_LOGIN: 20,
        ACHIEVEMENT: 100
    },
    LEVELS: [
        { level: 1, xpRequired: 100 },
        { level: 2, xpRequired: 250 },
        { level: 3, xpRequired: 500 },
        { level: 4, xpRequired: 1000 },
        { level: 5, xpRequired: 2000 },
        { level: 6, xpRequired: 3500 },
        { level: 7, xpRequired: 5500 },
        { level: 8, xpRequired: 8000 },
        { level: 9, xpRequired: 11000 },
        { level: 10, xpRequired: 15000 }
    ]
};

// Translations
const translations = {
    ru: {
        appTitle: "Games Verse",
        settings: "Настройки",
        theme: "Тема",
        lightTheme: "Светлая",
        darkTheme: "Темная",
        language: "Язык",
        russian: "Русский",
        english: "English",
        done: "Готово",
        games: "Игры",
        bestGames: "Лучшие игры Telegram",
        exchanges: "Биржи",
        exchangesDesc: "Торгуйте криптовалютами безопасно",
        profile: "Профиль",
        user: "Пользователь",
        gamesClicked: "Кликов по играм",
        referrals: "Рефералов",
        inviteFriends: "Пригласи друзей",
        referralDesc: "Получай +50 XP за каждого друга",
        shareWithFriends: "Поделиться с друзьями",
        linkCopied: "Ссылка скопирована!",
        play: "Играть",
        go: "Перейти",
        dailyBonus: "Ежедневный бонус!",
        claim: "Забрать",
        // Game descriptions
        hamsterGameDevDesc: "Создай свою студию",
        hamsterKingDesc: "Стань королем хомяков",
        hamsterFightClubDesc: "Бойцовский клуб хомяков",
        bitquestDesc: "Приключения в мире крипты",
        notcoinDesc: "Кликай и зарабатывай",
        catizenDesc: "Мир милых котиков",
        pixeltapDesc: "Пиксельные приключения",
        yescoinDesc: "Свайпай и зарабатывай",
        // Exchange descriptions
        bybitDesc: "Продвинутая торговая платформа",
        bingxDesc: "Социальная торговля и копирование",
        bitgetDesc: "Инновационная торговая платформа",
        mexcDesc: "Глобальная биржа с низкими комиссиями",
        okxDesc: "Ведущая криптобиржа",
        gateDesc: "Безопасная торговля с 2013 года"
    },
    en: {
        appTitle: "Games Verse",
        settings: "Settings",
        theme: "Theme",
        lightTheme: "Light",
        darkTheme: "Dark",
        language: "Language",
        russian: "Russian",
        english: "English",
        done: "Done",
        games: "Games",
        bestGames: "Best Telegram Games",
        exchanges: "Exchanges",
        exchangesDesc: "Trade cryptocurrencies safely",
        profile: "Profile",
        user: "User",
        gamesClicked: "Game Clicks",
        referrals: "Referrals",
        inviteFriends: "Invite Friends",
        referralDesc: "Get +50 XP for each friend",
        shareWithFriends: "Share with friends",
        linkCopied: "Link copied!",
        play: "Play",
        go: "Go",
        dailyBonus: "Daily Bonus!",
        claim: "Claim",
        // Game descriptions
        hamsterGameDevDesc: "Create your own studio",
        hamsterKingDesc: "Become the hamster king",
        hamsterFightClubDesc: "Hamster fighting club",
        bitquestDesc: "Adventures in the crypto world",
        notcoinDesc: "Tap and earn",
        catizenDesc: "World of cute cats",
        pixeltapDesc: "Pixel adventures",
        yescoinDesc: "Swipe and earn",
        // Exchange descriptions
        bybitDesc: "Advanced trading platform",
        bingxDesc: "Social trading and copy trading",
        bitgetDesc: "Innovative trading platform",
        mexcDesc: "Global exchange with low fees",
        okxDesc: "Leading crypto exchange",
        gateDesc: "Safe trading since 2013"
    }
};

// Achievements data
const ACHIEVEMENTS = [
    { id: 'first-click', name: 'Первый клик', desc: 'Запустите свою первую игру', icon: '🎮', reward: 50 },
    { id: 'explorer', name: 'Исследователь', desc: 'Посетите все разделы', icon: '🗺️', reward: 30 },
    { id: 'games-5', name: 'Игроман', desc: 'Запустите 5 разных игр', icon: '🎯', reward: 100 },
    { id: 'games-10', name: 'Коллекционер', desc: 'Запустите 10 разных игр', icon: '💎', reward: 200 },
    { id: 'trader', name: 'Трейдер', desc: 'Посетите биржу', icon: '📊', reward: 50 },
    { id: 'referrer', name: 'Друг друзей', desc: 'Пригласите первого друга', icon: '👥', reward: 100 },
    { id: 'referrer-5', name: 'Инфлюенсер', desc: 'Пригласите 5 друзей', icon: '🌟', reward: 300 },
    { id: 'level-5', name: 'Ветеран', desc: 'Достигните 5 уровня', icon: '⭐', reward: 250 },
    { id: 'level-10', name: 'Легенда', desc: 'Достигните 10 уровня', icon: '👑', reward: 500 },
    { id: 'streak-7', name: 'Постоянный', desc: '7 дней подряд', icon: '🔥', reward: 200 },
    { id: 'favorites-3', name: 'Гурман', desc: 'Добавьте 3 игры в избранное', icon: '❤️', reward: 75 }
];

// Global state
let userData = {
    xp: 0,
    level: 1,
    gamesClicked: 0,
    exchangesClicked: 0,
    referrals: 0,
    achievementsEarned: [],
    sectionsVisited: new Set(),
    gamesVisited: new Set(),
    lastVisit: null,
    dailyStreak: 0,
    lastBonusClaim: null
};

let favorites = [];
let currentLang = 'ru';

// Utility Functions
function vibrate(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

function showNotification(message, duration = 2000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    if (notification && notificationText) {
        notificationText.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
}

function setLanguage(lang) {
    currentLang = lang;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
}

function saveUserData() {
    const dataToSave = {
        ...userData,
        sectionsVisited: Array.from(userData.sectionsVisited),
        gamesVisited: Array.from(userData.gamesVisited)
    };
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(dataToSave));
}

function loadUserData() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    if (saved) {
        const parsed = JSON.parse(saved);
        userData = {
            ...parsed,
            sectionsVisited: new Set(parsed.sectionsVisited || []),
            gamesVisited: new Set(parsed.gamesVisited || [])
        };
    }
    updateUI();
}

function loadFavorites() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
    if (saved) {
        favorites = JSON.parse(saved);
        updateFavoritesUI();
    }
}

function saveFavorites() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

function updateUI() {
    // Update XP and Level
    const currentLevel = getCurrentLevel();
    document.getElementById('level-text').textContent = `Level ${userData.level}`;
    
    const nextLevel = CONFIG.LEVELS.find(l => l.level === userData.level + 1);
    if (nextLevel) {
        const currentLevelData = CONFIG.LEVELS.find(l => l.level === userData.level);
        const prevXP = currentLevelData ? currentLevelData.xpRequired : 0;
        const xpInLevel = userData.xp - prevXP;
        const xpNeeded = nextLevel.xpRequired - prevXP;
        const percentage = (xpInLevel / xpNeeded) * 100;
        
        document.getElementById('xp-bar').style.width = `${Math.min(percentage, 100)}%`;
        document.getElementById('xp-text').textContent = `${xpInLevel} / ${xpNeeded} XP`;
    } else {
        document.getElementById('xp-bar').style.width = '100%';
        document.getElementById('xp-text').textContent = 'MAX LEVEL';
    }
    
    // Update stats
    document.getElementById('games-clicked').textContent = userData.gamesClicked;
    document.getElementById('referrals-count').textContent = userData.referrals;
    document.getElementById('achievements-earned').textContent = userData.achievementsEarned.length;
}

function getCurrentLevel() {
    let level = 1;
    for (const levelData of CONFIG.LEVELS) {
        if (userData.xp >= levelData.xpRequired) {
            level = levelData.level;
        } else {
            break;
        }
    }
    return level;
}

function addXP(amount, sourceElement = null) {
    userData.xp += amount;
    const oldLevel = userData.level;
    const newLevel = getCurrentLevel();
    
    if (newLevel > oldLevel) {
        userData.level = newLevel;
        showLevelUpModal(newLevel);
        checkAchievements();
    }
    
    // Show XP gain animation
    if (sourceElement) {
        showXPGainAnimation(amount, sourceElement);
    }
    
    updateUI();
    saveUserData();
}

function showXPGainAnimation(amount, sourceElement) {
    const animation = document.getElementById('xp-gain-animation');
    const rect = sourceElement.getBoundingClientRect();
    
    animation.textContent = `+${amount} XP`;
    animation.style.left = rect.left + rect.width / 2 + 'px';
    animation.style.top = rect.top + 'px';
    animation.classList.add('show');
    
    setTimeout(() => {
        animation.classList.remove('show');
    }, 1500);
}

function showLevelUpModal(level) {
    vibrate(100);
    const modal = document.getElementById('level-up-modal');
    document.getElementById('level-up-number').textContent = `Level ${level}`;
    modal.classList.add('show');
}

function showAchievementModal(achievement) {
    vibrate(100);
    const modal = document.getElementById('achievement-modal');
    document.getElementById('achievement-icon').textContent = achievement.icon;
    document.getElementById('achievement-name').textContent = achievement.name;
    document.getElementById('achievement-desc').textContent = achievement.desc;
    document.getElementById('achievement-reward').textContent = `+${achievement.reward} XP`;
    modal.classList.add('show');
    
    // Add XP reward
    setTimeout(() => {
        addXP(achievement.reward);
    }, 500);
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (userData.achievementsEarned.includes(achievement.id)) return;
        
        let unlocked = false;
        
        switch(achievement.id) {
            case 'first-click':
                unlocked = userData.gamesClicked >= 1;
                break;
            case 'explorer':
                unlocked = userData.sectionsVisited.size >= 5;
                break;
            case 'games-5':
                unlocked = userData.gamesVisited.size >= 5;
                break;
            case 'games-10':
                unlocked = userData.gamesVisited.size >= 8;
                break;
            case 'trader':
                unlocked = userData.exchangesClicked >= 1;
                break;
            case 'referrer':
                unlocked = userData.referrals >= 1;
                break;
            case 'referrer-5':
                unlocked = userData.referrals >= 5;
                break;
            case 'level-5':
                unlocked = userData.level >= 5;
                break;
            case 'level-10':
                unlocked = userData.level >= 10;
                break;
            case 'streak-7':
                unlocked = userData.dailyStreak >= 7;
                break;
            case 'favorites-3':
                unlocked = favorites.length >= 3;
                break;
        }
        
        if (unlocked) {
            userData.achievementsEarned.push(achievement.id);
            showAchievementModal(achievement);
            saveUserData();
            renderAchievements();
        }
    });
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = ACHIEVEMENTS.map(achievement => {
        const earned = userData.achievementsEarned.includes(achievement.id);
        return `
            <div class="achievement-card ${earned ? 'earned' : 'locked'}">
                <div class="achievement-icon-big">${achievement.icon}</div>
                <h3>${achievement.name}</h3>
                <p>${achievement.desc}</p>
                <div class="achievement-reward-badge">
                    ${earned ? '✅ Получено' : `🎁 ${achievement.reward} XP`}
                </div>
            </div>
        `;
    }).join('');
}

function updateFavoritesUI() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const gameId = btn.getAttribute('data-game-id');
        if (favorites.includes(gameId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function checkDailyBonus() {
    const now = new Date();
    const today = now.toDateString();
    const lastVisit = userData.lastVisit ? new Date(userData.lastVisit).toDateString() : null;
    const lastBonus = userData.lastBonusClaim ? new Date(userData.lastBonusClaim).toDateString() : null;
    
    // Update streak
    if (lastVisit) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastVisit === yesterdayStr) {
            userData.dailyStreak += 1;
        } else if (lastVisit !== today) {
            userData.dailyStreak = 1;
        }
    } else {
        userData.dailyStreak = 1;
    }
    
    userData.lastVisit = now.toISOString();
    
    // Show bonus banner if not claimed today
    if (lastBonus !== today) {
        showDailyBonusBanner();
    }
    
    // Update streak display
    const streakText = currentLang === 'ru' ? `🔥 ${userData.dailyStreak} дней подряд` : `🔥 ${userData.dailyStreak} days streak`;
    document.getElementById('streak-text').textContent = streakText;
    
    saveUserData();
    checkAchievements();
}

function showDailyBonusBanner() {
    const banner = document.getElementById('daily-bonus-banner');
    banner.style.display = 'block';
    
    const bonusAmount = 20 + (userData.dailyStreak * 5);
    const message = currentLang === 'ru' 
        ? `Получи ${bonusAmount} XP за вход!` 
        : `Get ${bonusAmount} XP for logging in!`;
    document.getElementById('bonus-message').textContent = message;
}

function claimDailyBonus() {
    const bonusAmount = 20 + (userData.dailyStreak * 5);
    addXP(bonusAmount, document.getElementById('claim-bonus-btn'));
    
    userData.lastBonusClaim = new Date().toISOString();
    saveUserData();
    
    document.getElementById('daily-bonus-banner').style.display = 'none';
    
    const message = currentLang === 'ru' ? `Получено ${bonusAmount} XP!` : `Claimed ${bonusAmount} XP!`;
    showNotification(message, 2000);
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    
    // Mock leaderboard data (in real app, would fetch from server)
    const leaderboardData = [
        { rank: 1, name: 'CryptoKing', referrals: 127, level: 10 },
        { rank: 2, name: 'GameMaster', referrals: 98, level: 9 },
        { rank: 3, name: 'TapPro', referrals: 76, level: 8 },
        { rank: 4, name: 'Player1', referrals: 54, level: 7 },
        { rank: 5, name: 'GamerX', referrals: 43, level: 6 }
    ];
    
    container.innerHTML = `
        <div class="leaderboard-list">
            ${leaderboardData.map(user => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank rank-${user.rank}">${user.rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${user.name}</div>
                        <div class="leaderboard-stats">
                            <span>👥 ${user.referrals} рефералов</span>
                            <span>⭐ Level ${user.level}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="leaderboard-note">
            <p>💡 Приглашай друзей и поднимайся в топ!</p>
        </div>
    `;
}

// Setup Functions
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const targetSection = this.getAttribute('data-section');
            
            // Track section visit
            userData.sectionsVisited.add(targetSection);
            checkAchievements();
            saveUserData();
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

function setupGameButtons() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const playButton = card.querySelector('.play-button');
        const botUsername = card.getAttribute('data-bot');
        const gameId = card.getAttribute('data-game-id');
        
        if (playButton && botUsername) {
            playButton.addEventListener('click', function(e) {
                e.stopPropagation();
                vibrate();
                
                // Track game click
                userData.gamesClicked++;
                userData.gamesVisited.add(gameId);
                
                // Add XP
                addXP(CONFIG.XP_VALUES.GAME_CLICK, this);
                
                checkAchievements();
                saveUserData();
                
                const telegramUrl = `https://t.me/${botUsername}?start=app`;
                
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.openTelegramLink(telegramUrl);
                } else {
                    window.open(telegramUrl, '_blank');
                }
            });
        }
        
        // Setup favorite button
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                vibrate();
                
                const gameId = this.getAttribute('data-game-id');
                const index = favorites.indexOf(gameId);
                
                if (index > -1) {
                    favorites.splice(index, 1);
                    this.classList.remove('active');
                } else {
                    favorites.push(gameId);
                    this.classList.add('active');
                }
                
                saveFavorites();
                checkAchievements();
            });
        }
    });
}

function setupExchangeButtons() {
    const exchangeCards = document.querySelectorAll('.exchange-card');
    
    exchangeCards.forEach(card => {
        const exchangeButton = card.querySelector('.exchange-button');
        const exchangeUrl = card.getAttribute('data-url');
        
        if (exchangeButton && exchangeUrl) {
            exchangeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                vibrate();
                
                // Track exchange click
                userData.exchangesClicked++;
                
                // Add XP
                addXP(CONFIG.XP_VALUES.EXCHANGE_CLICK, this);
                
                checkAchievements();
                saveUserData();
                
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.openLink(exchangeUrl);
                } else {
                    window.open(exchangeUrl, '_blank');
                }
            });
        }
    });
}

function setupSettingsPanel() {
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    
    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            vibrate();
            settingsPanel.classList.add('active');
        });
    }
    
    if (closeSettings) {
        closeSettings.addEventListener('click', function() {
            vibrate();
            settingsPanel.classList.remove('active');
        });
    }
    
    if (settingsPanel) {
        settingsPanel.addEventListener('click', function(e) {
            if (e.target === settingsPanel) {
                settingsPanel.classList.remove('active');
            }
        });
    }
    
    // Theme switcher
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            vibrate();
            const theme = this.getAttribute('data-theme');
            
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
        });
    });
    
    // Language switcher
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            vibrate();
            const lang = this.getAttribute('data-lang');
            
            languageOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            setLanguage(lang);
        });
    });
}

function setupShareButton() {
    const shareButton = document.getElementById('share-friends-button');
    const copyButton = document.getElementById('copy-referral');
    
    // Get referral link
    const userId = 'user_' + Date.now(); // In real app, would use actual user ID
    const shareUrl = `https://t.me/your_bot_username?start=ref_${userId}`;
    const referralLink = document.getElementById('referral-link');
    if (referralLink) {
        referralLink.value = shareUrl;
    }
    
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            vibrate();
            const shareText = currentLang === 'ru' 
                ? 'Открой для себя лучшие игры Telegram в одном приложении!' 
                : 'Discover the best Telegram games in one app!';
            
            if (navigator.share) {
                navigator.share({
                    title: 'Games Verse',
                    text: shareText,
                    url: shareUrl,
                }).catch(() => {});
            } else {
                copyToClipboard(shareUrl);
            }
        });
    }
    
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            vibrate();
            copyToClipboard(shareUrl);
        });
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            const message = currentLang === 'ru' ? 'Ссылка скопирована!' : 'Link copied!';
            showNotification(message);
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
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
        const message = currentLang === 'ru' ? 'Ссылка скопирована!' : 'Link copied!';
        showNotification(message);
    } catch (err) {
        console.error('Copy failed:', err);
    }
}

function setupModals() {
    // Level up modal
    const levelUpClose = document.getElementById('level-up-close');
    if (levelUpClose) {
        levelUpClose.addEventListener('click', function() {
            vibrate();
            document.getElementById('level-up-modal').classList.remove('show');
        });
    }
    
    // Achievement modal
    const achievementClose = document.getElementById('achievement-close');
    if (achievementClose) {
        achievementClose.addEventListener('click', function() {
            vibrate();
            document.getElementById('achievement-modal').classList.remove('show');
        });
    }
    
    // Daily bonus
    const claimBonusBtn = document.getElementById('claim-bonus-btn');
    if (claimBonusBtn) {
        claimBonusBtn.addEventListener('click', function() {
            vibrate();
            claimDailyBonus();
        });
    }
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-theme') === savedTheme) {
            option.classList.add('active');
        }
    });
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE) || 'ru';
    setLanguage(savedLang);
    
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-lang') === savedLang) {
            option.classList.add('active');
        }
    });
}

function loadTelegramUserData() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        
        if (user) {
            const userName = document.getElementById('user-name');
            if (userName && user.first_name) {
                userName.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            }
            
            const userUsername = document.getElementById('user-username');
            if (userUsername && user.username) {
                userUsername.textContent = '@' + user.username;
            }
            
            const avatarImg = document.getElementById('avatar-img');
            const avatarFallback = document.getElementById('avatar-fallback');
            
            if (user.photo_url) {
                avatarImg.src = user.photo_url;
                avatarImg.style.display = 'block';
                avatarFallback.style.display = 'none';
            } else if (user.first_name) {
                avatarFallback.textContent = user.first_name.charAt(0).toUpperCase();
            }
        }
    }
}

// Initialization
function init() {
    loadThemePreference();
    loadLanguagePreference();
    loadUserData();
    loadFavorites();
    setupNavigation();
    setupGameButtons();
    setupExchangeButtons();
    setupSettingsPanel();
    setupShareButton();
    setupModals();
    loadTelegramUserData();
    renderAchievements();
    renderLeaderboard();
    checkDailyBonus();
    
    // Telegram Web App integration
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.ready();
    }
    
    // Check for referral
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && !localStorage.getItem('referrer_claimed')) {
        userData.referrals++;
        localStorage.setItem('referrer_claimed', 'true');
        addXP(CONFIG.XP_VALUES.REFERRAL);
        saveUserData();
    }
    
    // Fade in animation
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
