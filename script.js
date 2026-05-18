// ==================== КОНФИГУРАЦИЯ ====================
const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

// ==================== ДАННЫЕ ====================
const GAMES_DATA = [
    {
        id: 'internal_2048',
        name: "2048",
        fullLink: null,
        description: "Классическая головоломка прямо здесь",
        rating: 4.8,
        players: "∞",
        image: "",
        fallback: "🔢",
        badge: "Внутри",
        highlight: true,
        isInternal: true
    },
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
    { id: 1, name: "Bybit", url: "https://www.bybit.com/invite?ref=57KXPMO", description: "Продвинутая торговая платформа", image: "images/bybit.jpg", fallback: "💱" },
    { id: 2, name: "BingX", url: "https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description: "Социальная торговля и копирование", image: "images/bingx.jpg", fallback: "📈" },
    { id: 3, name: "Bitget", url: "https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H&from=%2Fru%2Fevents%2Freferral-all-program&source=events&utmSource=PremierInviter", description: "Инновационная торговая платформа", image: "images/bitget.jpg", fallback: "⚡" },
    { id: 4, name: "MEXC", url: "https://promote.mexc.com/r/aTSLfdm54W", description: "Глобальная биржа с низкими комиссиями", image: "images/mexc.jpg", fallback: "🌍" }
];

// ==================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ====================
let isGameActive = false;
let game2048 = null;
let userCoins = parseInt(localStorage.getItem('userCoins')) || 0;
let dailyTasks = JSON.parse(localStorage.getItem('dailyTasks')) || [];

const DEFAULT_TASKS = [
    { id: 'play_3', name: 'Сыграть 3 партии', icon: '🎮', target: 3, progress: 0, reward: 50 },
    { id: 'score_1000', name: 'Набрать 1000 очков', icon: '⭐', target: 1000, progress: 0, reward: 100 },
    { id: 'win_1', name: 'Достигнуть 2048', icon: '🏆', target: 1, progress: 0, reward: 200 },
    { id: 'invite_1', name: 'Пригласить друга', icon: '👥', target: 1, progress: 0, reward: 150 }
];

// ==================== УТИЛИТЫ ====================
function vibrate() { if (navigator.vibrate) navigator.vibrate(50); }
function saveCoins() { localStorage.setItem('userCoins', userCoins); }
function saveTasks() { localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks)); }
function resetDailyTasks() { dailyTasks = DEFAULT_TASKS.map(t => ({...t, progress: 0})); saveTasks(); }
function updateProfileCoins() {
    const el = document.getElementById('profile-coins-amount');
    if (el) el.textContent = userCoins;
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    document.body.style.opacity = '1';
    initializeApp();
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');
}

function initializeApp() {
    initializeTelegramWebApp();
    applySavedTheme();
    setupNavigation();
    initializeGames();
    setupShareButton();
    initGame2048();
    setupLeaderboardRefresh();
    setupProfileThemeSwitcher();

    // Задания
    const lastReset = localStorage.getItem('lastTaskReset');
    const today = new Date().toDateString();
    if (lastReset !== today) {
        resetDailyTasks();
        localStorage.setItem('lastTaskReset', today);
    }
    renderDailyQuests();
    updateProfileCoins();
}

function initializeTelegramWebApp() {
    if (!window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    const tp = tg.themeParams;
    if (tp) {
        if (tp.bg_color) document.documentElement.style.setProperty('--tg-theme-bg-color', tp.bg_color);
        if (tp.text_color) document.documentElement.style.setProperty('--tg-theme-text-color', tp.text_color);
    }
}

// ==================== НАВИГАЦИЯ ====================
const headerElement = document.querySelector('.header');
const mainContent = document.querySelector('.main-content');

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            if (isGameActive) closeInternalGame(false);
            const targetSection = this.getAttribute('data-section');
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            const target = document.getElementById(targetSection);
            if (target) target.classList.add('active');

            if (targetSection === 'leaderboard-section') fetchLeaderboard();
            if (targetSection === 'profile-section') {
                loadProfileStats();
                initializeExchanges();
                if (headerElement) headerElement.style.display = 'none';
                if (mainContent) mainContent.style.paddingTop = '8px';
            } else {
                if (headerElement) headerElement.style.display = 'block';
                if (mainContent) mainContent.style.paddingTop = '';
            }
        });
    });

    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        if (activeSection.id === 'leaderboard-section') fetchLeaderboard();
        if (activeSection.id === 'profile-section') {
            if (headerElement) headerElement.style.display = 'none';
        }
    }
}

// ==================== ИГРЫ (КАРТОЧКИ) ====================
function initializeGames() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;
    grid.innerHTML = GAMES_DATA.map(game => `
        <div class="card ${game.highlight ? 'highlight' : ''}" data-game-id="${game.id}">
            <div class="card__image">
                <img src="${game.image}" alt="${game.name}" class="card__img" onerror="this.style.display='none'">
                <div class="card__fallback">${game.fallback}</div>
            </div>
            <div class="card__info">
                <div class="card__title">
                    ${game.name}
                    ${game.badge ? `<span class="card__badge">${game.badge}</span>` : ''}
                </div>
                <p class="card__description">${game.description}</p>
                <div class="card__stats">
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
            <button class="play-button" data-link="${game.fullLink || ''}">${game.isInternal ? 'Играть' : 'Запустить'}</button>
        </div>
    `).join('');
    setupGameButtons();
}

function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '<span class="star filled">★</span>';
    if (half) stars += '<span class="star half">★</span>';
    for (let i = 0; i < 5 - full - (half ? 1 : 0); i++) stars += '<span class="star">★</span>';
    return stars;
}

function setupGameButtons() {
    document.querySelectorAll('.play-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const card = this.closest('.card');
            if (!card) return;
            const gameId = card.getAttribute('data-game-id');
            const game = GAMES_DATA.find(g => g.id.toString() === gameId);
            if (game && game.isInternal) {
                openInternalGame(game);
            } else {
                const link = this.getAttribute('data-link');
                if (link) {
                    if (window.Telegram?.WebApp) {
                        if (link.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(link);
                        else window.Telegram.WebApp.openLink(link);
                    } else window.open(link, '_blank');
                }
            }
        });
    });
}

// ==================== ВНУТРЕННЯЯ ИГРА ====================
function openInternalGame(gameData) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const gameSection = document.getElementById('game-section');
    if (gameSection) gameSection.classList.add('active');
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.display = 'none';
    if (headerElement) headerElement.style.display = 'none';
    if (!game2048) initGame2048();
    isGameActive = true;
}

function closeInternalGame(showGamesSection = true) {
    if (showGamesSection) {
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        const gamesSection = document.getElementById('games-section');
        if (gamesSection) gamesSection.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const gamesNav = document.querySelector('.nav-item[data-section="games-section"]');
        if (gamesNav) gamesNav.classList.add('active');
    }
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.display = '';
    if (headerElement) headerElement.style.display = '';
    isGameActive = false;
}

document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-from-game');
    if (backBtn) backBtn.addEventListener('click', () => { vibrate(); closeInternalGame(true); });
});

// ==================== 2048 GAME ====================
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
        this.updateBestUI();
        this.init();
        this.bindEvents();
    }
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.scoreEl.textContent = '0';
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
            return true;
        }
        return false;
    }
    move(dir) {
        const old = JSON.parse(JSON.stringify(this.grid));
        let gained = 0;
        const vectors = { left:{x:0,y:-1}, right:{x:0,y:1}, up:{x:-1,y:0}, down:{x:1,y:0} };
        const v = vectors[dir];
        const traversals = this.buildTraversals(v);
        const merged = Array(this.size).fill().map(() => Array(this.size).fill(false));

        traversals.x.forEach(i => {
            traversals.y.forEach(j => {
                if (this.grid[i][j] === 0) return;
                let curX = i, curY = j;
                while (true) {
                    const nextX = curX + v.x, nextY = curY + v.y;
                    if (nextX < 0 || nextX >= this.size || nextY < 0 || nextY >= this.size) break;
                    if (this.grid[nextX][nextY] === 0) {
                        this.grid[nextX][nextY] = this.grid[curX][curY];
                        this.grid[curX][curY] = 0;
                        curX = nextX; curY = nextY;
                    } else if (this.grid[nextX][nextY] === this.grid[curX][curY] && !merged[nextX][nextY]) {
                        this.grid[nextX][nextY] *= 2;
                        gained += this.grid[nextX][nextY];
                        this.grid[curX][curY] = 0;
                        merged[nextX][nextY] = true;
                        break;
                    } else break;
                }
            });
        });

        if (gained > 0) {
            this.score += gained;
            this.scoreEl.textContent = this.score;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore2048', this.bestScore);
                this.updateBestUI();
            }
        }
        if (!this.equals(old)) {
            this.addRandomTile();
            this.render();
            if (this.hasWon()) {
                this.statusEl.textContent = 'Вы победили! 🎉';
                updateTaskProgress('win_', 1);
                this.submitScore();
            } else if (this.isGameOver()) {
                this.statusEl.textContent = 'Игра окончена! 😔';
                this.submitScore();
            }
        }
    }
    buildTraversals(v) {
        const x = Array.from({length:this.size}, (_,i)=>i);
        const y = Array.from({length:this.size}, (_,i)=>i);
        if (v.x === 1) x.reverse();
        if (v.y === 1) y.reverse();
        return {x, y};
    }
    equals(old) {
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (this.grid[i][j] !== old[i][j]) return false;
        return true;
    }
    hasWon() { return this.grid.some(row => row.includes(2048)); }
    isGameOver() {
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (this.grid[i][j] === 0) return false;
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size-1;j++) if (this.grid[i][j] === this.grid[i][j+1]) return false;
        for (let j=0;j<this.size;j++) for (let i=0;i<this.size-1;i++) if (this.grid[i][j] === this.grid[i+1][j]) return false;
        return true;
    }
    render() {
        this.board.innerHTML = '';
        for (let i=0;i<this.size;i++) {
            for (let j=0;j<this.size;j++) {
                const val = this.grid[i][j];
                const tile = document.createElement('div');
                tile.className = 'tile-cell';
                if (val) {
                    let cls = `tile-${val}`;
                    if (val > 2048) cls = 'tile-super';
                    tile.classList.add(cls);
                    tile.textContent = val;
                }
                this.board.appendChild(tile);
            }
        }
    }
    updateBestUI() { this.bestEl.textContent = this.bestScore; }
    bindEvents() {
        let touchStartX=0,touchStartY=0;
        this.board.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });
        this.board.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) this.move(dx > 0 ? 'right' : 'left');
            else this.move(dy > 0 ? 'down' : 'up');
            vibrate();
        });
        window.addEventListener('keydown', e => {
            if (!document.querySelector('#game-section.active')) return;
            const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
            if (map[e.key]) { this.move(map[e.key]); e.preventDefault(); vibrate(); }
        });
    }
    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        const taskUpdates = {};
        dailyTasks.forEach(t => { if (t.progress > 0 && t.id !== 'invite_1') taskUpdates[t.id] = t.progress; });
        fetch(WORKER_URL + '/submit-score', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                userId: currentUserId.toString(),
                firstName: user.first_name || 'Игрок',
                username: user.username || '',
                score: this.score,
                avatarUrl: user.photo_url || '',
                taskUpdates
            })
        }).then(() => {
            fetchLeaderboard();
            dailyTasks.forEach(t => { if (t.id !== 'invite_1') t.progress = 0; });
            saveTasks();
        }).catch(() => {});
    }
}

function initGame2048() {
    const board = document.getElementById('game-board-2048');
    const scoreEl = document.getElementById('game-score');
    const bestEl = document.getElementById('best-score');
    const statusEl = document.getElementById('game-status');
    if (!board || !scoreEl || !bestEl || !statusEl) return;
    game2048 = new Game2048(board, scoreEl, bestEl, statusEl);
    const newBtn = document.getElementById('new-game-btn');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            vibrate();
            updateTaskProgress('play_', 1);
            game2048.init();
        });
    }
}

// ==================== ЗАДАНИЯ ====================
function renderDailyQuests() {
    const list = document.getElementById('quests-list');
    const coinsEl = document.getElementById('quests-coins');
    if (!list || !coinsEl) return;
    coinsEl.innerHTML = `🪙 ${userCoins}`;
    list.innerHTML = dailyTasks.map(task => {
        const pct = Math.min((task.progress / task.target)*100, 100);
        const done = task.progress >= task.target;
        return `<div class="quest-item">
            <div class="quest-icon">${task.icon}</div>
            <div class="quest-info">
                <div class="quest-name">${task.name}</div>
                <div class="quest-progress"><div class="quest-progress-fill" style="width:${pct}%"></div></div>
            </div>
            <div class="quest-reward">+${task.reward} 🪙</div>
            <button class="quest-claim" data-task-id="${task.id}" ${!done?'disabled':''}>
                ${done?'Забрать':`${task.progress}/${task.target}`}
            </button>
        </div>`;
    }).join('');
    document.querySelectorAll('.quest-claim').forEach(btn => {
        btn.addEventListener('click', () => claimTaskReward(btn.dataset.taskId));
    });
}

function updateTaskProgress(type, value) {
    let changed = false;
    dailyTasks.forEach(task => {
        if (task.progress >= task.target) return;
        if (task.id.startsWith(type)) {
            task.progress = Math.min(task.progress + value, task.target);
            changed = true;
        }
    });
    if (changed) { saveTasks(); renderDailyQuests(); }
}

async function claimTaskReward(taskId) {
    if (!currentUserId) return;
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.progress < task.target) return;
    try {
        const res = await fetch(WORKER_URL + '/claim-task', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ userId: currentUserId.toString(), taskId })
        });
        if (res.ok) {
            const data = await res.json();
            userCoins = data.coins;
            saveCoins();
            task.progress = 0;
            saveTasks();
            renderDailyQuests();
            updateProfileCoins();
            showNotification(`Получено ${task.reward} монет!`);
        }
    } catch {
        // fallback
        userCoins += task.reward;
        saveCoins();
        task.progress = 0;
        saveTasks();
        renderDailyQuests();
        updateProfileCoins();
        showNotification(`Получено ${task.reward} монет!`);
    }
}

// ==================== ПРОФИЛЬ ====================
function loadUserData() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        updateProfileDisplay(user);
        currentUserId = user.id;
        sendMiniAppStat(user);
    } else {
        showFallbackProfile();
        currentUserId = null;
    }
}

async function loadProfileStats() {
    if (!currentUserId) {
        document.getElementById('stat-rank').textContent = '—';
        document.getElementById('stat-score').textContent = '—';
        document.getElementById('stat-invites').textContent = '—';
        return;
    }
    try {
        const res = await fetch(`${WORKER_URL}/user-stats?userId=${currentUserId}`);
        const data = await res.json();
        document.getElementById('stat-rank').textContent = data.rank || '—';
        document.getElementById('stat-score').textContent = data.bestScore || 0;
        document.getElementById('stat-invites').textContent = data.inviteCount || 0;
        userCoins = data.coins || 0;
        saveCoins();
        updateProfileCoins();
    } catch {
        const best = localStorage.getItem('bestScore2048') || '0';
        document.getElementById('stat-score').textContent = best;
        document.getElementById('stat-rank').textContent = '—';
        document.getElementById('stat-invites').textContent = localStorage.getItem('inviteCount') || '0';
    }
}

async function sendMiniAppStat(user) {
    if (!user?.id) return;
    let ref = null;
    try {
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        if (startParam) ref = startParam;
    } catch {}
    if (ref && ref.startsWith('ref_')) {
        const referrerId = ref.replace('ref_', '');
        if (referrerId !== user.id.toString() && !localStorage.getItem('invitedBy')) {
            localStorage.setItem('invitedBy', referrerId);
            try {
                await fetch(WORKER_URL + '/invite', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ newUserId: user.id.toString(), referrerId })
                });
            } catch {}
            if (currentUserId && currentUserId.toString() === referrerId) {
                let invites = parseInt(localStorage.getItem('inviteCount')) || 0;
                invites++;
                localStorage.setItem('inviteCount', invites);
                userCoins += 150;
                saveCoins();
                updateTaskProgress('invite_', 1);
                showNotification('🎉 Вы пригласили друга! +150 монет');
            }
        }
    }
    try {
        await fetch(WORKER_URL + '/track', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ userId: user.id.toString(), firstName: user.first_name, username: user.username, ref })
        });
    } catch {}
}

function updateProfileDisplay(user) {
    document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' '+user.last_name : '');
    document.getElementById('user-username').textContent = user.username ? '@'+user.username : 'Telegram User';
    const avatarImg = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
        avatarImg.style.display = 'block';
        fallback.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        fallback.textContent = user.first_name?.charAt(0).toUpperCase() || 'T';
        fallback.style.display = 'flex';
    }
    if (user.is_premium) {
        const info = document.querySelector('.profile-info');
        if (info && !document.querySelector('.premium-badge')) {
            const badge = document.createElement('div');
            badge.className = 'premium-badge';
            badge.innerHTML = '⭐ Premium';
            info.appendChild(badge);
        }
    }
}

function showFallbackProfile() {
    document.getElementById('user-name').textContent = 'Telegram User';
    document.getElementById('user-username').textContent = 'Открой в Telegram';
    const fb = document.getElementById('avatar-fallback');
    fb.textContent = 'T'; fb.style.display = 'flex';
}

function setupProfileThemeSwitcher() {
    const sw = document.getElementById('profile-theme-switcher');
    if (!sw) return;
    const saved = localStorage.getItem('theme') || 'light';
    sw.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
    const activeBtn = sw.querySelector(`[data-theme="${saved}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    sw.addEventListener('click', e => {
        const btn = e.target.closest('.theme-option');
        if (!btn) return;
        vibrate();
        const theme = btn.dataset.theme;
        sw.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        btn.classList.add('active');
        document.body.classList.toggle('dark-theme', theme === 'dark');
        localStorage.setItem('theme', theme);
    });
}

// ==================== ОБМЕННИКИ (партнёры) ====================
function initializeExchanges() {
    const list = document.getElementById('exchanges-list');
    if (!list) return;
    list.innerHTML = EXCHANGES_DATA.map(ex => `
        <div class="card">
            <div class="card__image">
                <img src="${ex.image}" alt="${ex.name}" class="card__img" onerror="this.style.display='none'">
                <div class="card__fallback">${ex.fallback}</div>
            </div>
            <div class="card__info">
                <h3 class="card__title">${ex.name}</h3>
                <p class="card__description">${ex.description}</p>
            </div>
            <button class="exchange-button" data-url="${ex.url}">Перейти</button>
        </div>
    `).join('');
    document.querySelectorAll('.exchange-button').forEach(btn => {
        btn.addEventListener('click', e => {
            vibrate();
            const url = btn.dataset.url;
            if (url) {
                if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url);
                else window.open(url, '_blank');
            }
        });
    });
}

// ==================== ЛИДЕРБОРД ====================
async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        const lb = data.leaderboard || [];
        if (!lb.length) {
            list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>';
            return;
        }
        list.innerHTML = lb.map((p,i) => {
            const isMe = currentUserId && p.userId.toString() === currentUserId.toString();
            const avatar = p.avatarUrl
                ? `<img src="${p.avatarUrl}" alt="${p.firstName}">`
                : p.firstName.charAt(0).toUpperCase();
            return `<div class="leaderboard-item ${isMe?'current-user':''}">
                <div class="leaderboard-rank">#${i+1}</div>
                <div class="leaderboard-avatar">${avatar}</div>
                <div class="leaderboard-info"><div class="leaderboard-name">${escapeHtml(p.firstName)}</div></div>
                <div class="leaderboard-score">${p.score} <span>очк.</span></div>
            </div>`;
        }).join('');
    } catch {
        list.innerHTML = '<div class="leaderboard-loading">Не удалось загрузить таблицу</div>';
    }
}
function escapeHtml(text) { return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function setupLeaderboardRefresh() {
    const btn = document.getElementById('refresh-leaderboard');
    if (btn) btn.addEventListener('click', () => { vibrate(); fetchLeaderboard(); });
}

// ==================== ШАРИНГ ====================
function setupShareButton() {
    const btn = document.getElementById('share-friends-button');
    if (!btn) return;
    btn.addEventListener('click', () => {
        vibrate();
        const refCode = currentUserId ? `ref_${currentUserId}` : '';
        const url = `https://t.me/${BOT_USERNAME}?start=${refCode}`;
        const text = 'Играй в лучшие мини-игры Telegram вместе с HADRON! 🎮';
        if (window.Telegram?.WebApp) {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            try { window.Telegram.WebApp.openTelegramLink(shareUrl); }
            catch { fallbackCopy(url); }
        } else {
            if (navigator.share) navigator.share({title:'Games Verse',text,url}).catch(()=>fallbackCopy(url));
            else fallbackCopy(url);
        }
    });
}
function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showNotification('Ссылка скопирована!');
}
function showNotification(msg = 'Ссылка скопирована в буфер обмена!') {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = msg; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
}

// Инициализация данных пользователя при старте
window.addEventListener('load', () => {
    loadUserData();
});
