// script.js
const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

const GAMES_DATA = [ /* ... без изменений ... */ ];
const EXCHANGES_DATA = [ /* ... без изменений ... */ ];
const translations = { /* ... без изменений ... */ };

// Глобальный объект игры
let tapGame = null;

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
    setupLeaderboardShare();
}

// ... все функции до initGame2048 остаются без изменений (initializeTelegramWebApp, initializeGames, initializeExchanges, loadUserData, updateProfileDisplay, setupNavigation, setupGameButtons, setupExchangeButtons, settings, share и т.д.) ...

/* ==================== TAP GAME ==================== */
class TapGame {
    constructor() {
        this.coins = 0;
        this.perClick = 1;
        this.autoClickLevel = 0;
        this.autoClickBaseCost = 15;
        this.multiplierLevel = 0;
        this.multiplierBaseCost = 50;
        this.boostActive = false;
        this.boostTimer = null;
        this.boostRemaining = 0;
        this.autoClickInterval = null;

        this.coinElement = document.getElementById('tap-coin-count');
        this.perClickElement = document.getElementById('tap-per-click');
        this.tapCoin = document.getElementById('tap-coin');
        this.tapArea = document.getElementById('tap-area');
        this.particlesContainer = document.getElementById('tap-particles');
        this.boostBar = document.getElementById('boost-bar');
        this.boostFill = document.getElementById('boost-fill');
        this.statusElement = document.getElementById('game-status');
        this.shopItemsContainer = document.getElementById('shop-items');

        this.load();
        this.renderAll();
        this.setupEventListeners();
        this.startAutoClick();
    }

    load() {
        try {
            const save = JSON.parse(localStorage.getItem('tapGameSave'));
            if (save) {
                this.coins = save.coins || 0;
                this.perClick = save.perClick || 1;
                this.autoClickLevel = save.autoClickLevel || 0;
                this.multiplierLevel = save.multiplierLevel || 0;
            }
        } catch(e) {}
    }

    save() {
        const data = {
            coins: this.coins,
            perClick: this.perClick,
            autoClickLevel: this.autoClickLevel,
            multiplierLevel: this.multiplierLevel
        };
        localStorage.setItem('tapGameSave', JSON.stringify(data));
    }

    tap(e) {
        let coinsEarned = this.perClick;
        if (this.boostActive) coinsEarned *= 10;

        this.coins += coinsEarned;
        this.updateCoinDisplay();
        this.save();
        this.renderAll();

        // Анимация частиц
        this.spawnParticle(e, `+${coinsEarned}`);

        // Отправка счёта в лидерборд (не слишком часто)
        if (this.coins % 10 < coinsEarned) {
            this.submitScore();
        }
    }

    spawnParticle(e, text) {
        const particle = document.createElement('div');
        particle.className = 'tap-particle';
        particle.textContent = text;
        const rect = this.tapArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        this.particlesContainer.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
    }

    buyAutoClick() {
        const cost = this.getAutoClickCost();
        if (this.coins >= cost) {
            this.coins -= cost;
            this.autoClickLevel++;
            this.updateCoinDisplay();
            this.save();
            this.renderAll();
            this.startAutoClick();
        }
    }

    getAutoClickCost() {
        return this.autoClickBaseCost + this.autoClickLevel * 5;
    }

    buyMultiplier() {
        const cost = this.getMultiplierCost();
        if (this.coins >= cost) {
            this.coins -= cost;
            this.multiplierLevel++;
            this.perClick = 1 + this.multiplierLevel;
            this.updateCoinDisplay();
            this.updatePerClickDisplay();
            this.save();
            this.renderAll();
        }
    }

    getMultiplierCost() {
        return this.multiplierBaseCost + this.multiplierLevel * 25;
    }

    activateBoost() {
        if (this.boostActive) return;
        const cost = 100;
        if (this.coins >= cost) {
            this.coins -= cost;
            this.boostActive = true;
            this.boostRemaining = 10; // секунд
            this.boostBar.style.display = 'block';
            this.updateBoostBar();
            this.updateCoinDisplay();
            this.save();
            this.renderAll();

            if (this.boostTimer) clearInterval(this.boostTimer);
            this.boostTimer = setInterval(() => {
                this.boostRemaining -= 0.1;
                if (this.boostRemaining <= 0) {
                    this.boostActive = false;
                    clearInterval(this.boostTimer);
                    this.boostTimer = null;
                    this.boostBar.style.display = 'none';
                }
                this.updateBoostBar();
            }, 100);
        }
    }

    updateBoostBar() {
        const percent = (this.boostRemaining / 10) * 100;
        this.boostFill.style.width = percent + '%';
    }

    startAutoClick() {
        if (this.autoClickInterval) clearInterval(this.autoClickInterval);
        if (this.autoClickLevel > 0) {
            this.autoClickInterval = setInterval(() => {
                this.coins += this.autoClickLevel;
                this.updateCoinDisplay();
                this.save();
                if (this.coins % 10 < this.autoClickLevel) this.submitScore();
            }, 1000);
        }
    }

    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        const payload = {
            userId: currentUserId.toString(),
            firstName: user.first_name || 'Игрок',
            username: user.username || '',
            score: this.coins,
            avatarUrl: user.photo_url || ''
        };
        fetch(WORKER_URL + '/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('Ошибка отправки счёта тапалки:', err));
    }

    updateCoinDisplay() {
        this.coinElement.textContent = this.coins;
    }

    updatePerClickDisplay() {
        this.perClickElement.textContent = this.perClick;
    }

    renderAll() {
        this.updateCoinDisplay();
        this.updatePerClickDisplay();
        this.renderShop();
    }

    renderShop() {
        const autoCost = this.getAutoClickCost();
        const multiCost = this.getMultiplierCost();
        this.shopItemsContainer.innerHTML = `
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">⏱️ Автокликер (ур. ${this.autoClickLevel})</div>
                    <div class="shop-item-desc">+${this.autoClickLevel} монет/сек</div>
                </div>
                <button class="shop-item-btn" id="buy-auto" ${this.coins < autoCost ? 'disabled' : ''}>${autoCost} 🪙</button>
            </div>
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">🔺 Множитель клика (ур. ${this.multiplierLevel})</div>
                    <div class="shop-item-desc">Каждый уровень +1 к клику</div>
                </div>
                <button class="shop-item-btn" id="buy-multiplier" ${this.coins < multiCost ? 'disabled' : ''}>${multiCost} 🪙</button>
            </div>
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">⚡ Бустер x10</div>
                    <div class="shop-item-desc">10 секунд ускорения</div>
                </div>
                <button class="shop-item-btn" id="buy-boost" ${this.boostActive || this.coins < 100 ? 'disabled' : ''}>100 🪙</button>
            </div>
        `;

        document.getElementById('buy-auto')?.addEventListener('click', () => this.buyAutoClick());
        document.getElementById('buy-multiplier')?.addEventListener('click', () => this.buyMultiplier());
        document.getElementById('buy-boost')?.addEventListener('click', () => this.activateBoost());
    }

    setupEventListeners() {
        this.tapArea.addEventListener('click', (e) => {
            e.preventDefault();
            this.tap(e);
            vibrate();
        });
        this.tapArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.tap(mouseEvent);
            vibrate();
        });
    }

    resetGame() {
        if (confirm('Точно сбросить весь прогресс тапалки?')) {
            this.coins = 0;
            this.perClick = 1;
            this.autoClickLevel = 0;
            this.multiplierLevel = 0;
            this.boostActive = false;
            if (this.boostTimer) clearInterval(this.boostTimer);
            this.boostTimer = null;
            this.boostBar.style.display = 'none';
            this.save();
            this.renderAll();
            this.startAutoClick();
            this.submitScore();
        }
    }
}

function initTapGame() {
    if (!tapGame) {
        tapGame = new TapGame();
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                vibrate();
                tapGame.resetGame();
            });
        }
    }
}

// Leaderboard fetch остается как был, но вызывается при открытии раздела
function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';

    fetch(WORKER_URL + '/leaderboard')
        .then(res => res.json())
        .then(data => {
            const leaderboard = data.leaderboard || [];
            renderLeaderboard(leaderboard);
        })
        .catch(err => {
            console.error('Ошибка загрузки лидеров:', err);
            list.innerHTML = '<div class="leaderboard-loading">Не удалось загрузить таблицу</div>';
        });
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
                    ${player.score} <span>монет</span>
                    <button class="leaderboard-share-btn" aria-label="Поделиться результатом" data-share-name="${escapeHtml(player.firstName)}" data-share-score="${player.score}">
                        <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Остальные функции без изменений (escapeHtml, setupLeaderboardRefresh, shareLeaderboardScore, fallbackCopyToClipboard, showNotification и т.д.)
