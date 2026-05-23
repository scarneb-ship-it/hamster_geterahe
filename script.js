const BOT_USERNAME = 'khadron_bot';
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

// Game and exchange data (links unchanged)
const GAMES = [
    { id:0, name:"Pixel World", link:"https://t.me/pixelworld/play?startapp=r6823288584", desc:"Первый 3D-шутер", image:"images/photo_2026-02-17_13-44-55.jpg", reward:80 },
    { id:1, name:"Hamster GameDev", link:"https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584", desc:"Создай студию", image:"images/hamster-gamedev.jpg", reward:100 },
    { id:2, name:"Hamster King", link:"https://t.me/hamsterking_game_bot?startapp=6823288584", desc:"Король хомяков", image:"images/hamster-king.jpg", reward:70 },
    { id:3, name:"Hamster Fight Club", link:"https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5", desc:"Бойцовский клуб", image:"images/hamster-fightclub.jpg", reward:90 },
    { id:4, name:"BitQuest", link:"https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584", desc:"Крипто-приключения", image:"images/bitquest.jpg", reward:60 }
];
const EXCHANGES = [
    { id:1, name:"Bybit", link:"https://www.bybit.com/invite?ref=57KXPMO", desc:"Торговая платформа", image:"images/bybit.jpg", reward:150 },
    { id:2, name:"BingX", link:"https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", desc:"Социальный трейдинг", image:"images/bingx.jpg", reward:120 },
    { id:3, name:"Bitget", link:"https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H&from=%2Fru%2Fevents%2Freferral-all-program&source=events&utmSource=PremierInviter", desc:"Инновационная биржа", image:"images/bitget.jpg", reward:130 },
    { id:4, name:"MEXC", link:"https://promote.mexc.com/r/aTSLfdm54W", desc:"Низкие комиссии", image:"images/mexc.jpg", reward:110 }
];

// State
let tgUser = null;
let currentUserId = null;
let gameInstance = null;

// Local storage keys
const STORAGE_COINS = 'hamster_hub_coins';
const STORAGE_COMPLETED = 'hamster_hub_completed_quests';
const STORAGE_DAILY = 'hamster_hub_daily';
const STORAGE_REFERRALS = 'hamster_hub_refs';
const STORAGE_BEST = 'bestScore2048';
const STORAGE_VIBRATION = 'vibration_enabled';
const STORAGE_SOUND = 'sound_enabled';

// Utility
function vibrate() { if (navigator.vibrate && getSetting(STORAGE_VIBRATION, true)) navigator.vibrate(30); }
function getCoins() { return parseInt(localStorage.getItem(STORAGE_COINS)) || 0; }
function setCoins(val) { localStorage.setItem(STORAGE_COINS, val); updateAllCoinDisplays(); }
function addCoins(amount, reason = '') {
    const newBalance = getCoins() + amount;
    setCoins(newBalance);
    if (amount > 0) showToast(`+${amount} 🪙 ${reason}`);
}
function updateAllCoinDisplays() {
    const bal = getCoins();
    document.querySelectorAll('#coin-balance, #profile-balance').forEach(el => el.textContent = bal);
}

function getCompletedQuests() { return JSON.parse(localStorage.getItem(STORAGE_COMPLETED)) || {}; }
function markQuestCompleted(id) {
    const completed = getCompletedQuests();
    completed[id] = Date.now();
    localStorage.setItem(STORAGE_COMPLETED, JSON.stringify(completed));
}

function getDaily() { return JSON.parse(localStorage.getItem(STORAGE_DAILY)) || { score:0, claimed: false, date: new Date().toDateString() }; }
function setDaily(data) { localStorage.setItem(STORAGE_DAILY, JSON.stringify(data)); }

function getReferrals() { return JSON.parse(localStorage.getItem(STORAGE_REFERRALS)) || { count: 0, earned: 0 }; }
function setReferrals(data) { localStorage.setItem(STORAGE_REFERRALS, JSON.stringify(data)); }

function getSetting(key, def) { const val = localStorage.getItem(key); return val === null ? def : JSON.parse(val); }
function setSetting(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// Toast
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Daily goal logic
function updateDailyGoal(score) {
    const daily = getDaily();
    const today = new Date().toDateString();
    if (daily.date !== today) {
        daily.score = 0;
        daily.claimed = false;
        daily.date = today;
    }
    if (score > daily.score) daily.score = score;
    setDaily(daily);
    const target = 5000;
    const progress = Math.min(daily.score, target);
    document.getElementById('daily-progress').textContent = `${progress} / ${target}`;
    const claimBtn = document.getElementById('claim-daily-btn');
    claimBtn.disabled = (daily.claimed || progress < target);
    if (!daily.claimed && progress >= target) {
        claimBtn.onclick = () => {
            addCoins(200, 'Ежедневная цель');
            daily.claimed = true;
            setDaily(daily);
            claimBtn.disabled = true;
        };
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initNavigation();
    initGameTab();
    initQuestsTab();
    initReferralsTab();
    initProfileTab();
    updateAllCoinDisplays();
    loadSettings();
});

function initTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        tgUser = tg.initDataUnsafe?.user;
        if (tgUser) {
            currentUserId = tgUser.id;
            updateProfileUI(tgUser);
            sendTracking(tgUser);
            // Check ref
            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam && startParam.startsWith('ref_')) handleReferral(startParam.slice(4));
        }
    } else {
        currentUserId = 'demo_user';
        tgUser = { first_name: 'Demo', username: 'demo', photo_url: '' };
        updateProfileUI(tgUser);
    }
}

function updateProfileUI(user) {
    document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' '+user.last_name : '');
    document.getElementById('user-username').textContent = user.username ? '@'+user.username : '';
    const avatarImg = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
        avatarImg.style.display = 'block';
        fallback.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        fallback.style.display = 'flex';
        fallback.textContent = user.first_name.charAt(0).toUpperCase();
    }
}

function sendTracking(user) {
    fetch(`${WORKER_URL}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, firstName: user.first_name, username: user.username })
    }).catch(() => {});
}

function handleReferral(refId) {
    if (refId === currentUserId?.toString()) return;
    const refs = getReferrals();
    // crude check to avoid duplicate counting
    if (!localStorage.getItem('ref_handled_' + refId)) {
        refs.count++;
        refs.earned += 50; // bonus for referred user
        setReferrals(refs);
        localStorage.setItem('ref_handled_' + refId, '1');
        addCoins(50, 'за друга');
        updateReferralUI();
    }
}

// Navigation
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabs = document.querySelectorAll('.tab-content');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            vibrate();
            const target = btn.dataset.tab;
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabs.forEach(t => t.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            if (target === 'referrals-tab') updateReferralUI();
            if (target === 'game-tab' && gameInstance) gameInstance.render();
        });
    });
}

// ==================== 2048 Game ====================
class Game2048 {
    constructor(boardEl, scoreEl, bestEl, msgEl) {
        this.boardEl = boardEl;
        this.scoreEl = scoreEl;
        this.bestEl = bestEl;
        this.msgEl = msgEl;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = parseInt(localStorage.getItem(STORAGE_BEST)) || 0;
        this.lastTile = null;
        this.merged = new Set();
        this.init();
        this.attachEvents();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.msgEl.textContent = '';
        this.lastTile = null;
        this.merged.clear();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.updateScore();
    }

    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] === 0) empty.push([i, j]);
        if (empty.length) {
            const [x, y] = empty[Math.floor(Math.random() * empty.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
            this.lastTile = [x, y];
        }
    }

    move(dir) {
        const before = JSON.stringify(this.grid);
        let gained = 0;
        this.merged.clear();
        const slide = (row, reverse) => {
            let arr = row.filter(v => v);
            if (reverse) arr.reverse();
            let merged = new Array(arr.length).fill(false);
            for (let i = 0; i < arr.length - 1; i++) {
                if (!merged[i] && arr[i] === arr[i+1]) {
                    arr[i] *= 2;
                    gained += arr[i];
                    arr.splice(i+1, 1);
                    merged.splice(i+1, 1);
                    this.merged.add(`${i}`); // will be mapped later
                }
            }
            while (arr.length < this.size) arr.push(0);
            if (reverse) arr.reverse();
            return arr;
        };

        if (dir === 'left') {
            for (let i = 0; i < this.size; i++) this.grid[i] = slide(this.grid[i], false);
        } else if (dir === 'right') {
            for (let i = 0; i < this.size; i++) this.grid[i] = slide([...this.grid[i]].reverse(), false).reverse();
        } else if (dir === 'up') {
            for (let j = 0; j < this.size; j++) {
                let col = [];
                for (let i = 0; i < this.size; i++) col.push(this.grid[i][j]);
                col = slide(col, false);
                for (let i = 0; i < this.size; i++) this.grid[i][j] = col[i];
            }
        } else if (dir === 'down') {
            for (let j = 0; j < this.size; j++) {
                let col = [];
                for (let i = 0; i < this.size; i++) col.push(this.grid[i][j]);
                col = slide(col.reverse(), false).reverse();
                for (let i = 0; i < this.size; i++) this.grid[i][j] = col[i];
            }
        }

        if (JSON.stringify(this.grid) !== before) {
            this.addRandomTile();
            this.render();
            this.score += gained;
            this.updateScore();
            if (this.checkWin()) {
                this.msgEl.textContent = 'Победа! 🎉';
                this.submitScore();
            } else if (this.checkLoss()) {
                this.msgEl.textContent = 'Игра окончена 😔';
                this.submitScore();
            }
        }
    }

    checkWin() { return this.grid.flat().includes(2048); }
    checkLoss() {
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return false;
                if (j < this.size-1 && this.grid[i][j] === this.grid[i][j+1]) return false;
                if (i < this.size-1 && this.grid[i][j] === this.grid[i+1][j]) return false;
            }
        return true;
    }

    updateScore() {
        this.scoreEl.textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem(STORAGE_BEST, this.best);
        }
        this.bestEl.textContent = this.best;
        updateDailyGoal(this.score);
        // Earn coins: 1 coin per 100 points
        const coinGain = Math.floor(this.score / 100) - Math.floor((this.score - (this.score > 0 ? 1 : 0)) / 100);
        if (coinGain > 0) addCoins(coinGain * 1, 'за очки');
    }

    render() {
        this.boardEl.innerHTML = '';
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++) {
                const val = this.grid[i][j];
                const cell = document.createElement('div');
                cell.className = 'tile-cell';
                if (val) {
                    cell.classList.add(`tile-${val > 2048 ? 'super' : val}`);
                    cell.textContent = val;
                    if (this.lastTile && this.lastTile[0] === i && this.lastTile[1] === j) cell.classList.add('tile-new');
                }
                this.boardEl.appendChild(cell);
            }
        this.lastTile = null;
    }

    submitScore() {
        if (!currentUserId || !tgUser) return;
        fetch(`${WORKER_URL}/submit-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, score: this.score, firstName: tgUser.first_name, username: tgUser.username, avatarUrl: tgUser.photo_url })
        }).catch(() => {});
    }

    // Boost: undo last move (we store history in future; currently simple: restart? We'll implement remove tile)
    boostRemoveTile() {
        if (getCoins() < 100) { showToast('Недостаточно монет'); return; }
        const nonZero = [];
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] > 2) nonZero.push([i, j]);
        if (nonZero.length === 0) return;
        const [x, y] = nonZero[Math.floor(Math.random() * nonZero.length)];
        this.grid[x][y] = 0;
        addCoins(-100, 'буст убрать');
        this.render();
    }

    attachEvents() {
        document.getElementById('new-game-btn').addEventListener('click', () => { vibrate(); this.init(); });
        document.getElementById('boost-undo')?.addEventListener('click', () => { vibrate(); showToast('Буст в разработке'); });
        document.getElementById('boost-remove')?.addEventListener('click', () => { vibrate(); this.boostRemoveTile(); });

        // touch / keyboard
        let touchStart = null;
        this.boardEl.addEventListener('touchstart', e => {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            e.preventDefault();
        });
        this.boardEl.addEventListener('touchend', e => {
            if (!touchStart) return;
            const dx = e.changedTouches[0].clientX - touchStart.x;
            const dy = e.changedTouches[0].clientY - touchStart.y;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) this.move(dx > 0 ? 'right' : 'left');
            else this.move(dy > 0 ? 'down' : 'up');
            touchStart = null;
            vibrate();
        });
        window.addEventListener('keydown', e => {
            if (!document.getElementById('game-tab').classList.contains('active')) return;
            const keyMap = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
            if (keyMap[e.key]) { e.preventDefault(); this.move(keyMap[e.key]); vibrate(); }
        });
    }
}

function initGameTab() {
    gameInstance = new Game2048(
        document.getElementById('game-board'),
        document.getElementById('score'),
        document.getElementById('best-score'),
        document.getElementById('game-message')
    );
    updateDailyGoal(0);
}

// ==================== Quests ====================
function initQuestsTab() {
    const gameList = document.getElementById('game-quests-list');
    const exchangeList = document.getElementById('exchange-quests-list');
    const completed = getCompletedQuests();

    gameList.innerHTML = GAMES.map(g => {
        const done = !!completed[`game_${g.id}`];
        return `
        <div class="quest-card">
            <img src="${g.image}" alt="${g.name}" onerror="this.style.display='none'">
            <div class="quest-info">
                <h4>${g.name}</h4>
                <p>${g.desc}</p>
            </div>
            <div class="quest-action">
                <span class="quest-reward">+${g.reward} 🪙</span>
                <button class="quest-btn" data-link="${g.link}" data-id="game_${g.id}" data-reward="${g.reward}" ${done ? 'disabled' : ''}>
                    ${done ? '✅' : 'Играть'}
                </button>
            </div>
        </div>`;
    }).join('');

    exchangeList.innerHTML = EXCHANGES.map(e => {
        const done = !!completed[`exchange_${e.id}`];
        return `
        <div class="quest-card">
            <img src="${e.image}" alt="${e.name}" onerror="this.style.display='none'">
            <div class="quest-info">
                <h4>${e.name}</h4>
                <p>${e.desc}</p>
            </div>
            <div class="quest-action">
                <span class="quest-reward">+${e.reward} 🪙</span>
                <button class="quest-btn" data-link="${e.link}" data-id="exchange_${e.id}" data-reward="${e.reward}" ${done ? 'disabled' : ''}>
                    ${done ? '✅' : 'Перейти'}
                </button>
            </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.quest-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            vibrate();
            const link = this.dataset.link;
            const id = this.dataset.id;
            const reward = parseInt(this.dataset.reward);
            if (window.Telegram?.WebApp) {
                if (link.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(link);
                else window.Telegram.WebApp.openLink(link);
            } else window.open(link, '_blank');
            // Mark as completed and give coins
            if (!getCompletedQuests()[id]) {
                markQuestCompleted(id);
                addCoins(reward, 'задание');
                this.disabled = true;
                this.textContent = '✅';
            }
        });
    });
}

// ==================== Referrals ====================
function updateReferralUI() {
    const refs = getReferrals();
    document.getElementById('ref-count').textContent = refs.count;
    document.getElementById('ref-earned').textContent = refs.earned;
    const target = 5;
    const progress = Math.min(refs.count, target);
    document.getElementById('ref-progress-fill').style.width = `${(progress/target)*100}%`;
    document.getElementById('ref-progress-text').textContent = `${progress} / ${target} друзей`;
    // Load leaderboard (mock)
    document.getElementById('ref-leaderboard-list').innerHTML = '<div>Скоро</div>';
}

function initReferralsTab() {
    updateReferralUI();
    document.getElementById('share-ref-btn').addEventListener('click', () => {
        vibrate();
        const refLink = `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`;
        const text = 'Заходи в Hamster Hub, играй и зарабатывай монеты! 🐹';
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`);
        } else if (navigator.share) {
            navigator.share({ title: 'Hamster Hub', text, url: refLink }).catch(() => navigator.clipboard.writeText(refLink));
        } else navigator.clipboard.writeText(refLink);
    });
}

// ==================== Profile ====================
function initProfileTab() {
    document.getElementById('profile-balance').textContent = getCoins();
    loadAchievements();
    document.getElementById('vibration-toggle').addEventListener('change', e => {
        setSetting(STORAGE_VIBRATION, e.target.checked);
    });
    document.getElementById('sound-toggle').addEventListener('change', e => {
        setSetting(STORAGE_SOUND, e.target.checked);
    });
}

function loadAchievements() {
    const coins = getCoins();
    const completed = Object.keys(getCompletedQuests()).length;
    const list = document.getElementById('achievements-list');
    const achievements = [
        { name: 'Первый миллионер', desc: 'Накопи 1000 монет', earned: coins >= 1000 },
        { name: 'Квест-мастер', desc: 'Выполни 5 заданий', earned: completed >= 5 },
        { name: 'Социальный', desc: 'Пригласи друга', earned: getReferrals().count > 0 },
    ];
    list.innerHTML = achievements.map(a => `
        <div class="achievement ${a.earned ? 'earned' : ''}">${a.earned ? '✅' : '🔒'} ${a.name}</div>
    `).join('');
}

function loadSettings() {
    document.getElementById('vibration-toggle').checked = getSetting(STORAGE_VIBRATION, true);
    document.getElementById('sound-toggle').checked = getSetting(STORAGE_SOUND, false);
}
