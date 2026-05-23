const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;

const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

// Исходные данные (твои)
const GAMES_DATA = [
    { id:0, name:"Pixel World", fullLink:"https://t.me/pixelworld/play?startapp=r6823288584", description:"Первый 3D-шутер", rating:4.9, players:"34K", image:"images/photo_2026-02-17_13-44-55.jpg", fallback:"🌍", badge:"Beta", highlight:true },
    { id:1, name:"Hamster GameDev", fullLink:"https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584", description:"Создай свою студию", rating:4.7, players:"368K", image:"images/hamster-gamedev.jpg", fallback:"🎮" },
    { id:2, name:"Hamster King", fullLink:"https://t.me/hamsterking_game_bot?startapp=6823288584", description:"Стань королем хомяков", rating:4.2, players:"188K", image:"images/hamster-king.jpg", fallback:"👑" },
    { id:3, name:"Hamster Fight Club", fullLink:"https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5", description:"Бойцовский клуб", rating:4.9, players:"85K", image:"images/hamster-fightclub.jpg", fallback:"🥊" },
    { id:4, name:"BitQuest", fullLink:"https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584", description:"Приключения в мире крипты", rating:3.8, players:"281K", image:"images/bitquest.jpg", fallback:"💰" }
];

const EXCHANGES_DATA = [
    { id:1, name:"Bybit", url:"https://www.bybit.com/invite?ref=57KXPMO", description:"Продвинутая торговая платформа", image:"images/bybit.jpg", fallback:"💱" },
    { id:2, name:"BingX", url:"https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description:"Социальная торговля", image:"images/bingx.jpg", fallback:"📈" },
    { id:3, name:"Bitget", url:"https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H&from=%2Fru%2Fevents%2Freferral-all-program&source=events&utmSource=PremierInviter", description:"Инновационная платформа", image:"images/bitget.jpg", fallback:"⚡" },
    { id:4, name:"MEXC", url:"https://promote.mexc.com/r/aTSLfdm54W", description:"Глобальная биржа", image:"images/mexc.jpg", fallback:"🌍" }
];

// Локальное хранилище
const STORAGE_COINS = 'gv_coins';
const STORAGE_COMPLETED = 'gv_completed';
const STORAGE_DAILY = 'gv_daily';
const STORAGE_REFERRALS = 'gv_refs';
const STORAGE_BEST = 'bestScore2048';
const STORAGE_VIBRATION = 'vibration_enabled';
const STORAGE_SOUND = 'sound_enabled';

function getCoins() { return parseInt(localStorage.getItem(STORAGE_COINS)) || 0; }
function setCoins(v) { localStorage.setItem(STORAGE_COINS, v); updateAllBalance(); }
function addCoins(amount) {
    const newBal = getCoins() + amount;
    setCoins(newBal);
}
function updateAllBalance() {
    const bal = getCoins();
    document.querySelectorAll('#coin-balance, #profile-balance').forEach(el => el.textContent = bal);
}

function getCompleted() { return JSON.parse(localStorage.getItem(STORAGE_COMPLETED)) || {}; }
function markCompleted(id) {
    const c = getCompleted();
    c[id] = Date.now();
    localStorage.setItem(STORAGE_COMPLETED, JSON.stringify(c));
}

function getDaily() { return JSON.parse(localStorage.getItem(STORAGE_DAILY)) || { score:0, claimed:false, date:new Date().toDateString() }; }
function setDaily(d) { localStorage.setItem(STORAGE_DAILY, JSON.stringify(d)); }

function getRefs() { return JSON.parse(localStorage.getItem(STORAGE_REFERRALS)) || { count:0, earned:0 }; }
function setRefs(r) { localStorage.setItem(STORAGE_REFERRALS, JSON.stringify(r)); }

function getSetting(key, def) { const v = localStorage.getItem(key); return v === null ? def : JSON.parse(v); }
function setSetting(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function vibrate() { if (navigator.vibrate && getSetting(STORAGE_VIBRATION, true)) navigator.vibrate(30); }

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('splash-screen').style.display = 'none';
    initTelegram();
    initNavigation();
    initGameTab();
    initQuestsTab();
    initReferralsTab();
    initProfileTab();
    updateAllBalance();
    loadSettings();
});

function initTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user) {
            currentUserId = user.id;
            updateProfileUI(user);
            sendTracking(user);
            const startParam = tg.initDataUnsafe?.start_param;
            if (startParam && startParam.startsWith('ref_')) handleReferral(startParam.slice(4));
        }
    } else {
        currentUserId = 'demo';
        updateProfileUI({ first_name:'Demo', username:'demo', photo_url:'' });
    }
}

function updateProfileUI(user) {
    document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' '+user.last_name : '');
    document.getElementById('user-username').textContent = user.username ? '@'+user.username : 'Telegram User';
    const img = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        img.src = user.photo_url;
        img.style.display = 'block';
        fallback.style.display = 'none';
    } else {
        img.style.display = 'none';
        fallback.textContent = user.first_name.charAt(0).toUpperCase();
        fallback.style.display = 'flex';
    }
}

function sendTracking(user) {
    fetch(WORKER_URL + '/track', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId:user.id, firstName:user.first_name, username:user.username })
    }).catch(()=>{});
}

function handleReferral(refId) {
    if (refId === currentUserId?.toString()) return;
    if (localStorage.getItem('ref_handled_'+refId)) return;
    const refs = getRefs();
    refs.count++;
    refs.earned += 50;
    setRefs(refs);
    localStorage.setItem('ref_handled_'+refId, '1');
    addCoins(50);
    updateReferralUI();
}

// Навигация
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            vibrate();
            const target = item.dataset.section;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            if (target === 'game-section') {
                document.getElementById('game-2048-container').style.display = 'block';
                document.getElementById('leaderboard-container').style.display = 'none';
                document.getElementById('tab-game-btn').classList.add('active');
                document.getElementById('tab-leaderboard-btn').classList.remove('active');
            }
            if (target === 'referrals-section') updateReferralUI();
        });
    });
    updateReferralUI();
}

// ========== 2048 (твоя реализация, с бустом и ежедневной целью) ==========
class Game2048 {
    constructor(boardEl, scoreEl, bestEl, statusEl) {
        this.boardEl = boardEl;
        this.scoreEl = scoreEl;
        this.bestEl = bestEl;
        this.statusEl = statusEl;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = parseInt(localStorage.getItem(STORAGE_BEST)) || 0;
        this.lastTile = null;
        this.init();
        this.attachEvents();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.statusEl.textContent = '';
        this.lastTile = null;
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

    move(direction) {
        const before = JSON.stringify(this.grid);
        let gained = 0;
        const slide = (arr, rev) => {
            let row = arr.filter(v => v);
            if (rev) row.reverse();
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i+1]) {
                    row[i] *= 2;
                    gained += row[i];
                    row.splice(i+1, 1);
                }
            }
            while (row.length < this.size) row.push(0);
            if (rev) row.reverse();
            return row;
        };
        if (direction === 'left') for (let i=0; i<this.size; i++) this.grid[i] = slide(this.grid[i], false);
        else if (direction === 'right') for (let i=0; i<this.size; i++) this.grid[i] = slide([...this.grid[i]].reverse(), false).reverse();
        else if (direction === 'up') {
            for (let j=0; j<this.size; j++) {
                let col = [];
                for (let i=0; i<this.size; i++) col.push(this.grid[i][j]);
                col = slide(col, false);
                for (let i=0; i<this.size; i++) this.grid[i][j] = col[i];
            }
        } else if (direction === 'down') {
            for (let j=0; j<this.size; j++) {
                let col = [];
                for (let i=0; i<this.size; i++) col.push(this.grid[i][j]);
                col = slide(col.reverse(), false).reverse();
                for (let i=0; i<this.size; i++) this.grid[i][j] = col[i];
            }
        }
        if (JSON.stringify(this.grid) !== before) {
            this.addRandomTile();
            this.render();
            this.score += gained;
            this.updateScore();
            if (this.checkWin()) {
                this.statusEl.textContent = 'Победа! 🎉';
                this.submitScore();
            } else if (this.checkLoss()) {
                this.statusEl.textContent = 'Игра окончена 😔';
                this.submitScore();
            }
        }
    }

    checkWin() { return this.grid.flat().includes(2048); }
    checkLoss() {
        for (let i=0; i<this.size; i++)
            for (let j=0; j<this.size; j++) {
                if (this.grid[i][j] === 0) return false;
                if (j<this.size-1 && this.grid[i][j] === this.grid[i][j+1]) return false;
                if (i<this.size-1 && this.grid[i][j] === this.grid[i+1][j]) return false;
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
        // Монеты за очки
        const newCoins = Math.floor(this.score / 100) - Math.floor((this.score - 1) / 100);
        if (newCoins > 0) addCoins(newCoins);
        // Ежедневная цель
        updateDailyGoal(this.score);
    }

    render() {
        this.boardEl.innerHTML = '';
        for (let i=0; i<this.size; i++)
            for (let j=0; j<this.size; j++) {
                const val = this.grid[i][j];
                const cell = document.createElement('div');
                cell.className = 'tile-cell';
                if (val) {
                    cell.classList.add(`tile-${val > 2048 ? 'super' : val}`);
                    cell.textContent = val;
                    if (this.lastTile && this.lastTile[0]===i && this.lastTile[1]===j) cell.classList.add('tile-new');
                }
                this.boardEl.appendChild(cell);
            }
        this.lastTile = null;
    }

    boostRemoveTile() {
        if (getCoins() < 100) return alert('Недостаточно монет');
        const nonZero = [];
        for (let i=0; i<this.size; i++)
            for (let j=0; j<this.size; j++)
                if (this.grid[i][j] > 2) nonZero.push([i,j]);
        if (nonZero.length === 0) return;
        const [x,y] = nonZero[Math.floor(Math.random() * nonZero.length)];
        this.grid[x][y] = 0;
        addCoins(-100);
        this.render();
    }

    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        fetch(WORKER_URL + '/submit-score', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId:currentUserId, score:this.score, firstName:user.first_name, username:user.username, avatarUrl:user.photo_url })
        }).catch(()=>{});
    }

    attachEvents() {
        document.getElementById('new-game-btn').addEventListener('click', () => { vibrate(); this.init(); });
        document.getElementById('boost-remove').addEventListener('click', () => { vibrate(); this.boostRemoveTile(); });
        // Тач и клавиатура (как было)
        let touchStart = null;
        this.boardEl.addEventListener('touchstart', e => {
            touchStart = { x:e.touches[0].clientX, y:e.touches[0].clientY };
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
            if (!document.getElementById('game-section').classList.contains('active')) return;
            const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
            if (map[e.key]) { e.preventDefault(); this.move(map[e.key]); vibrate(); }
        });
    }
}

let gameInstance;
function initGameTab() {
    gameInstance = new Game2048(
        document.getElementById('game-board-2048'),
        document.getElementById('game-score'),
        document.getElementById('best-score'),
        document.getElementById('game-status')
    );
    updateDailyGoal(0);
    // Переключение Игра/Топы
    document.getElementById('tab-game-btn').addEventListener('click', () => {
        document.getElementById('game-2048-container').style.display = 'block';
        document.getElementById('leaderboard-container').style.display = 'none';
        document.getElementById('tab-game-btn').classList.add('active');
        document.getElementById('tab-leaderboard-btn').classList.remove('active');
    });
    document.getElementById('tab-leaderboard-btn').addEventListener('click', () => {
        document.getElementById('game-2048-container').style.display = 'none';
        document.getElementById('leaderboard-container').style.display = 'block';
        document.getElementById('tab-leaderboard-btn').classList.add('active');
        document.getElementById('tab-game-btn').classList.remove('active');
        fetchLeaderboard();
    });
    document.getElementById('refresh-leaderboard').addEventListener('click', fetchLeaderboard);
}

function updateDailyGoal(score) {
    const daily = getDaily();
    const today = new Date().toDateString();
    if (daily.date !== today) { daily.score = 0; daily.claimed = false; daily.date = today; }
    if (score > daily.score) daily.score = score;
    setDaily(daily);
    const target = 5000;
    const progress = Math.min(daily.score, target);
    document.getElementById('daily-progress').textContent = `${progress} / ${target}`;
    const btn = document.getElementById('claim-daily-btn');
    btn.disabled = (daily.claimed || progress < target);
    btn.onclick = () => {
        if (!daily.claimed && progress >= target) {
            addCoins(200);
            daily.claimed = true;
            setDaily(daily);
            btn.disabled = true;
        }
    };
}

async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        list.innerHTML = (data.leaderboard || []).map((p,i) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">#${i+1}</div>
                <div class="leaderboard-avatar">${p.firstName.charAt(0)}</div>
                <div class="leaderboard-info"><div class="leaderboard-name">${p.firstName}</div></div>
                <div class="leaderboard-score">${p.score} очк.</div>
            </div>`).join('');
    } catch { list.innerHTML = '<div class="leaderboard-loading">Ошибка загрузки</div>'; }
}

// ========== Задания ==========
function initQuestsTab() {
    const gameList = document.getElementById('game-quests-list');
    const exchangeList = document.getElementById('exchange-quests-list');
    const completed = getCompleted();

    gameList.innerHTML = GAMES_DATA.map(g => {
        const done = !!completed[`game_${g.id}`];
        return `
        <div class="game-card ${g.highlight ? 'highlight' : ''}">
            <div class="game-image"><img src="${g.image}" alt="${g.name}" class="game-img" onerror="this.style.display='none'"><div class="image-fallback">${g.fallback}</div></div>
            <div class="game-info">
                <div class="game-header"><h3>${g.name}</h3>${g.badge ? `<span class="game-badge">${g.badge}</span>` : ''}</div>
                <p class="game-description">${g.description}</p>
            </div>
            <div class="quest-reward">+${g.id===0 ? 80 : (g.id===1 ? 100 : 70)} 🪙</div>
            <button class="play-button quest-btn" data-link="${g.fullLink}" data-id="game_${g.id}" data-reward="${g.id===0 ? 80 : (g.id===1 ? 100 : 70)}" ${done ? 'disabled' : ''}>
                ${done ? '✅' : 'Играть'}
            </button>
        </div>`;
    }).join('');

    exchangeList.innerHTML = EXCHANGES_DATA.map(e => {
        const done = !!completed[`exchange_${e.id}`];
        return `
        <div class="exchange-card">
            <div class="exchange-logo"><img src="${e.image}" alt="${e.name}" class="exchange-img" onerror="this.style.display='none'"><div class="image-fallback">${e.fallback}</div></div>
            <div class="exchange-info"><h3>${e.name}</h3><p>${e.description}</p></div>
            <div class="quest-reward">+150 🪙</div>
            <button class="exchange-button quest-btn" data-link="${e.url}" data-id="exchange_${e.id}" data-reward="150" ${done ? 'disabled' : ''}>
                ${done ? '✅' : 'Перейти'}
            </button>
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
            if (!getCompleted()[id]) {
                markCompleted(id);
                addCoins(reward);
                this.disabled = true;
                this.textContent = '✅';
            }
        });
    });
}

// ========== Рефералы ==========
function updateReferralUI() {
    const refs = getRefs();
    document.getElementById('ref-count').textContent = refs.count;
    document.getElementById('ref-earned').textContent = refs.earned;
    const target = 5;
    const progress = Math.min(refs.count, target);
    document.getElementById('ref-progress-fill').style.width = `${(progress/target)*100}%`;
    document.getElementById('ref-progress-text').textContent = `${progress} / ${target} друзей`;
}
function initReferralsTab() {
    updateReferralUI();
    document.getElementById('share-ref-btn').addEventListener('click', () => {
        vibrate();
        const refLink = `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`;
        const text = 'Играй в лучшие мини-игры Telegram и зарабатывай монеты! 🎮';
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`);
        } else if (navigator.share) {
            navigator.share({ title:'Games Verse', text, url:refLink }).catch(() => fallbackCopy(refLink));
        } else fallbackCopy(refLink);
    });
}
function fallbackCopy(text) {
    navigator.clipboard?.writeText(text).then(() => showNotification());
}

// ========== Профиль ==========
function initProfileTab() {
    document.getElementById('profile-balance').textContent = getCoins();
    loadAchievements();
    document.getElementById('vibration-toggle').addEventListener('change', e => setSetting(STORAGE_VIBRATION, e.target.checked));
    document.getElementById('sound-toggle').addEventListener('change', e => setSetting(STORAGE_SOUND, e.target.checked));
}
function loadAchievements() {
    const coins = getCoins();
    const completed = Object.keys(getCompleted()).length;
    const refs = getRefs().count;
    const list = document.getElementById('achievements-list');
    const achievements = [
        { name:'Накопитель', desc:'1000 монет', earned: coins >= 1000 },
        { name:'Квест-мастер', desc:'5 заданий', earned: completed >= 5 },
        { name:'Друг', desc:'Первый реферал', earned: refs > 0 }
    ];
    list.innerHTML = achievements.map(a => `<div class="achievement ${a.earned ? 'earned' : ''}">${a.earned ? '✅' : '🔒'} ${a.name}</div>`).join('');
}
function loadSettings() {
    document.getElementById('vibration-toggle').checked = getSetting(STORAGE_VIBRATION, true);
    document.getElementById('sound-toggle').checked = getSetting(STORAGE_SOUND, false);
}

// Общая функция уведомлений (из твоего кода)
function showNotification(msg) {
    const notif = document.getElementById('notification');
    notif.textContent = msg || 'Ссылка скопирована!';
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 2000);
}
