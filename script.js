const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

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

const ACHIEVEMENTS = [
    { id: 'tile_128', name: 'Плитка 128', desc: 'Соберите 128', icon: '🟩', tile: 128, check: g => g.grid.some(r => r.some(v => v >= 128)) },
    { id: 'tile_256', name: 'Плитка 256', desc: 'Соберите 256', icon: '🟦', tile: 256, check: g => g.grid.some(r => r.some(v => v >= 256)) },
    { id: 'tile_512', name: 'Плитка 512', desc: 'Соберите 512', icon: '🟪', tile: 512, check: g => g.grid.some(r => r.some(v => v >= 512)) },
    { id: 'tile_1024', name: 'Плитка 1024', desc: 'Соберите 1024', icon: '🟧', tile: 1024, check: g => g.grid.some(r => r.some(v => v >= 1024)) },
    { id: 'tile_2048', name: '2048!', desc: 'Соберите 2048', icon: '🏆', tile: 2048, check: g => g.grid.some(r => r.some(v => v >= 2048)) },
    { id: 'score_2000', name: 'Новичок', desc: 'Наберите 2000 очков', icon: '💵', tile: 2000, check: g => g.score >= 2000 },
    { id: 'score_5000', name: 'Любитель', desc: 'Наберите 5000 очков', icon: '💰', tile: 5000, check: g => g.score >= 5000 },
    { id: 'score_10000', name: 'Профи', desc: 'Наберите 10000 очков', icon: '💎', tile: 10000, check: g => g.score >= 10000 },
    { id: 'moves_50', name: 'Тактик', desc: 'Сделайте 50 ходов', icon: '♟️', tile: 50, check: g => g.moveCount >= 50 },
    { id: 'moves_100', name: 'Марафонец', desc: 'Сделайте 100 ходов', icon: '🏃', tile: 100, check: g => g.moveCount >= 100 },
];

let game2048 = null;
let replayMode = false;
let replayInterval = null;
let replayIndex = 0;
let replayMoves = [];
let replaySeed = 0;
let replaySpeed = 1;

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
            if (header) {
                if (targetSection === 'profile-section' || targetSection === 'game-section' || targetSection === 'leaderboard-section') {
                    header.style.display = 'none';
                } else {
                    header.style.display = 'block';
                }
            }
            if (targetSection === 'leaderboard-section') fetchLeaderboard();
            if (targetSection === 'profile-section') updateProfileTiles();
        });
    });
    document.getElementById('main-header').style.display = 'none';
}

function initializeGames() {
    const gamesGrid = document.getElementById('games-grid');
    if (!gamesGrid) return;
    gamesGrid.innerHTML = GAMES_DATA.map(game => `
        <div class="game-card ${game.highlight ? 'highlight' : ''}">
            <div class="game-image"><img src="${game.image}" class="game-img" onerror="this.style.display='none'"><div class="image-fallback">${game.fallback}</div></div>
            <div class="game-info">
                <div class="game-header"><h3>${game.name}</h3>${game.badge ? `<span class="game-badge">${game.badge}</span>` : ''}</div>
                <p class="game-description">${game.description}</p>
                <div class="game-stats">
                    <div class="rating"><div class="stars">${generateStars(game.rating)}</div><span class="rating-value">${game.rating}</span></div>
                    <div class="players"><span class="players-icon">👥</span><span class="players-count">${game.players}</span></div>
                </div>
            </div>
            <button class="play-button" data-link="${game.fullLink}">Играть</button>
        </div>
    `).join('');
    document.querySelectorAll('.play-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const link = this.dataset.link;
            if (link) {
                if (window.Telegram?.WebApp) {
                    if (link.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(link);
                    else window.Telegram.WebApp.openLink(link);
                } else window.open(link, '_blank');
            }
        });
    });
}

function generateStars(r) {
    const full = Math.floor(r), half = r % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
    let s = '';
    for (let i=0;i<full;i++) s += '<span class="star filled">★</span>';
    if (half) s += '<span class="star half">★</span>';
    for (let i=0;i<empty;i++) s += '<span class="star">★</span>';
    return s;
}

function initializeExchanges() {
    const list = document.getElementById('exchanges-list');
    if (!list) return;
    list.innerHTML = EXCHANGES_DATA.map(ex => `
        <div class="exchange-card">
            <div class="exchange-logo"><img src="${ex.image}" class="exchange-img" onerror="this.style.display='none'"><div class="image-fallback">${ex.fallback}</div></div>
            <div class="exchange-info"><h3>${ex.name}</h3><p>${ex.description}</p></div>
            <button class="exchange-button" data-url="${ex.url}">Перейти</button>
        </div>
    `).join('');
    document.querySelectorAll('.exchange-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const url = this.dataset.url;
            if (url) {
                if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url);
                else window.open(url, '_blank');
            }
        });
    });
}

function loadUserData() {
    if (window.Telegram?.WebApp) {
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
    updateProfileTiles();
}

async function sendMiniAppStat(user) {
    if (!user?.id) return;
    let ref = null;
    try { ref = window.Telegram?.WebApp?.initDataUnsafe?.start_param; } catch(e){}
    try {
        await fetch(WORKER_URL + '/track', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({userId:user.id.toString(), firstName:user.first_name||'', username:user.username||'', ref})
        });
    } catch(e){}
}

function updateProfileDisplay(user) {
    document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' '+user.last_name : '');
    document.getElementById('user-username').textContent = user.username ? '@'+user.username : 'Telegram User';
    const img = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        img.src = user.photo_url;
        img.style.display = 'block';
        img.onerror = () => { img.style.display = 'none'; fallback.style.display = 'flex'; };
        fallback.style.display = 'none';
    } else {
        img.style.display = 'none';
        fallback.textContent = user.first_name.charAt(0).toUpperCase();
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
    document.getElementById('avatar-fallback').textContent = 'T';
    document.getElementById('avatar-fallback').style.display = 'flex';
}

function setupSettingsPanel() {
    document.getElementById('settings-button').addEventListener('click', () => { vibrate(); document.getElementById('settings-panel').classList.add('active'); });
    document.getElementById('close-settings').addEventListener('click', () => { vibrate(); document.getElementById('settings-panel').classList.remove('active'); });
    document.getElementById('settings-panel').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); });
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', function() {
            vibrate();
            const theme = this.dataset.theme;
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            document.body.classList.toggle('dark-theme', theme === 'dark');
            localStorage.setItem('theme', theme);
        });
    });
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.querySelectorAll('.theme-option').forEach(o => {
        o.classList.toggle('active', o.dataset.theme === theme);
    });
}

function setupShareButton() {
    const btn = document.getElementById('share-friends-button');
    if (!btn) return;
    btn.addEventListener('click', () => {
        vibrate();
        let url = currentUserId ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}` : `https://t.me/${BOT_USERNAME}`;
        const text = 'Играй в лучшие мини-игры Telegram вместе с HADRON! 🎮';
        if (window.Telegram?.WebApp) {
            try { window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`); }
            catch { fallbackCopyToClipboard(url); }
        } else {
            if (navigator.share) navigator.share({title:'Games Verse', text, url}).catch(() => fallbackCopyToClipboard(url));
            else fallbackCopyToClipboard(url);
        }
    });
}

function fallbackCopyToClipboard(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showNotification();
}

function showNotification(msg) {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = msg || 'Ссылка скопирована!';
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
}

/* ========== 2048 ========== */
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
        this.score = 0; this.moveCount = 0; this.mergedCombo = 0; this.totalMerges = 0;
        this.moveHistory = []; this.gameOver = false; this.won = false;
        this.statusEl.textContent = '';
        this.replayBtn.style.display = 'none';
        this.updateScoreUI();
        this.rng = new SeededRandom(this.seed);
        this.addRandomTile(); this.addRandomTile();
        this.render();
        this.checkAchievements();
        this.updateChallengeProgress();
    }

    addRandomTile() {
        const empty = [];
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (this.grid[i][j]===0) empty.push({x:i,y:j});
        if (empty.length) {
            const {x,y} = empty[Math.floor(this.rng.next()*empty.length)];
            this.grid[x][y] = this.rng.next() < 0.9 ? 2 : 4;
            this.lastAdded = {x,y};
            return true;
        }
        return false;
    }

    move(direction) {
        if (this.gameOver || replayMode) return;
        const old = JSON.parse(JSON.stringify(this.grid));
        let gained = 0;
        this.mergedPositions.clear();
        this.moveMap = {};
        let mergeCombo = 0;

        const slide = (row, isCol, idx, reverse) => {
            let arr = row.filter(v=>v!==0);
            let newRow = [], mergedFlags = Array(arr.length).fill(false);
            for (let i=0;i<arr.length;i++) {
                if (i+1<arr.length && arr[i]===arr[i+1] && !mergedFlags[i] && !mergedFlags[i+1]) {
                    newRow.push(arr[i]*2);
                    gained += arr[i]*2;
                    mergedFlags[i]=mergedFlags[i+1]=true;
                    mergeCombo++;
                    this.totalMerges++;
                    i++;
                } else newRow.push(arr[i]);
            }
            while (newRow.length<this.size) newRow.push(0);
            let oldVals = arr, oldPtr = 0;
            for (let newPos=0;newPos<this.size;newPos++) {
                if (newRow[newPos]===0) continue;
                if (oldPtr<oldVals.length && oldVals[oldPtr]*2===newRow[newPos] && oldPtr+1<oldVals.length && oldVals[oldPtr]===oldVals[oldPtr+1]) {
                    this.recordMove(oldPtr,oldVals,newPos,isCol,idx,reverse,true);
                    this.recordMove(oldPtr+1,oldVals,newPos,isCol,idx,reverse,true);
                    oldPtr+=2;
                } else if (oldPtr<oldVals.length && oldVals[oldPtr]===newRow[newPos]) {
                    this.recordMove(oldPtr,oldVals,newPos,isCol,idx,reverse,false);
                    oldPtr++;
                }
            }
            return newRow;
        };

        if (direction==='left') for (let i=0;i<this.size;i++) this.grid[i] = slide(this.grid[i],false,i,false);
        else if (direction==='right') for (let i=0;i<this.size;i++) { let rev=[...this.grid[i]].reverse(); this.grid[i]=slide(rev,false,i,true).reverse(); }
        else if (direction==='up') for (let j=0;j<this.size;j++) { let col=[]; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); let res=slide(col,true,j,false); for (let i=0;i<this.size;i++) this.grid[i][j]=res[i]; }
        else if (direction==='down') for (let j=0;j<this.size;j++) { let col=[]; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); let rev=col.reverse(); let res=slide(rev,true,j,true).reverse(); for (let i=0;i<this.size;i++) this.grid[i][j]=res[i]; }

        this.mergedCombo = mergeCombo;
        if (!this.gridsAreEqual(old, this.grid)) {
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
                this.gameOver = true; this.won = true;
                this.submitScoreToLeaderboard();
                this.showReplayButton();
            } else if (this.checkLose()) {
                this.statusEl.textContent = translations.gameLose;
                this.gameOver = true;
                this.submitScoreToLeaderboard();
                this.showReplayButton();
            }
        } else this.moveMap = null;
    }

    recordMove(oldIdx, oldVals, newIdx, isCol, lineIdx, reverse, merged) {
        const originalLine = [];
        if (!isCol) originalLine.push(...this.grid[lineIdx]);
        else for (let r=0;r<this.size;r++) originalLine.push(this.grid[r][lineIdx]);
        if (reverse) originalLine.reverse();
        let skip=0, sourceIdx=-1;
        for (let i=0;i<originalLine.length;i++) {
            if (originalLine[i]!==0) { if (skip===oldIdx) { sourceIdx=i; break; } skip++; }
        }
        if (sourceIdx===-1) return;
        if (reverse) sourceIdx = this.size-1-sourceIdx;
        let fromRow, fromCol;
        if (!isCol) { fromRow=lineIdx; fromCol=sourceIdx; }
        else { fromRow=sourceIdx; fromCol=lineIdx; }
        let targetIdx = reverse ? this.size-1-newIdx : newIdx;
        let toRow, toCol;
        if (!isCol) { toRow=lineIdx; toCol=targetIdx; }
        else { toRow=targetIdx; toCol=lineIdx; }
        const key = `${toRow},${toCol}`;
        if (!this.moveMap[key]) this.moveMap[key] = {fromRow, fromCol, merged};
        if (merged) this.mergedPositions.add(key);
    }

    gridsAreEqual(a,b) {
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (a[i][j]!==b[i][j]) return false;
        return true;
    }

    render() {
        this.boardEl.innerHTML = '';
        const ts = this.boardEl.clientWidth / this.size;
        for (let i=0;i<this.size;i++) {
            for (let j=0;j<this.size;j++) {
                const val = this.grid[i][j];
                const tile = document.createElement('div');
                tile.className = 'tile-cell';
                if (val) {
                    tile.classList.add(val<=2048 ? `tile-${val}` : 'tile-super');
                    tile.textContent = val;
                    const key = `${i},${j}`;
                    if (this.moveMap?.[key]) {
                        const {fromRow, fromCol, merged} = this.moveMap[key];
                        tile.style.transform = `translate(${(fromCol-j)*ts}px, ${(fromRow-i)*ts}px)`;
                        tile.offsetHeight;
                        tile.style.transform = '';
                        if (merged) {
                            tile.classList.add('tile-merge');
                            tile.addEventListener('animationend', ()=>tile.classList.remove('tile-merge'), {once:true});
                        }
                    }
                    if (this.lastAdded?.x===i && this.lastAdded?.y===j) {
                        tile.classList.add('tile-new');
                        tile.addEventListener('animationend', ()=>tile.classList.remove('tile-new'), {once:true});
                    }
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

    updateBestUI() { this.bestEl.textContent = this.bestScore; }
    checkWin() { return this.grid.some(r => r.includes(2048)); }
    checkLose() {
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (!this.grid[i][j]) return false;
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
        fetch(WORKER_URL+'/submit-score', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({userId:currentUserId.toString(), firstName:user.first_name||'Игрок', username:user.username||'', score:this.score, avatarUrl:user.photo_url||''})
        }).then(() => fetchLeaderboard()).catch(e=>console.error(e));
    }

    showReplayButton() {
        this.replayBtn.style.display = 'inline-block';
        this.replayBtn.onclick = () => this.shareReplay();
    }

    shareReplay() {
        const movesStr = this.moveHistory.map(d=>d[0]).join('');
        const url = `https://t.me/${BOT_USERNAME}?startapp=replay_${this.seed}_${movesStr}`;
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=Смотри%20мой%20реплей%202048!`);
        } else fallbackCopyToClipboard(url);
    }

    resetGame() {
        this.seed = Date.now();
        this.init();
        this.render();
        document.getElementById('replay-viewer').style.display = 'none';
        document.getElementById('new-game-btn').style.display = '';
    }

    startReplay(seed, moves) {
        replayMode = true;
        this.seed = seed;
        this.rng = new SeededRandom(seed);
        this.grid = Array(this.size).fill().map(()=>Array(this.size).fill(0));
        this.addRandomTile(); this.addRandomTile();
        this.render();
        replayMoves = moves; replayIndex = 0;
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
            this.move(replayMoves[replayIndex++]);
            stepSpan.textContent = `${replayIndex}/${replayMoves.length}`;
        };
        playBtn.onclick = () => {
            if (playing) { clearInterval(replayInterval); playing = false; playBtn.textContent = '▶️'; }
            else { playing = true; playBtn.textContent = '⏸️'; replayInterval = setInterval(doStep, 300/replaySpeed); }
        };
        speedBtn.onclick = () => {
            replaySpeed = replaySpeed===1?2:(replaySpeed===2?4:1);
            speedBtn.textContent = replaySpeed+'x';
            if (playing) { clearInterval(replayInterval); replayInterval = setInterval(doStep, 300/replaySpeed); }
        };
    }

    checkAchievements() {
        const earned = JSON.parse(localStorage.getItem('achievements')||'{}');
        const collected = JSON.parse(localStorage.getItem('collectedTiles')||'[]');
        let updated = false;
        ACHIEVEMENTS.forEach(a => {
            if (!earned[a.id] && a.check(this)) {
                earned[a.id] = true;
                if (!collected.includes(a.tile)) collected.push(a.tile);
                updated = true;
                showNotification(`🏆 ${a.name}! + плитка ${a.tile}`);
            }
        });
        if (updated) {
            localStorage.setItem('achievements', JSON.stringify(earned));
            localStorage.setItem('collectedTiles', JSON.stringify(collected));
            loadAchievementsUI();
            updateProfileTiles();
        }
    }

    updateChallengeProgress() {
        const daily = getDailyTask();
        const weekly = getWeeklyTask();
        const dailyData = JSON.parse(localStorage.getItem('dailyProgress')||'{"date":"","progress":0}');
        const weeklyData = JSON.parse(localStorage.getItem('weeklyProgress')||'{"week":"","progress":0}');
        const today = new Date().toISOString().slice(0,10);
        const week = Math.floor((Date.now()-new Date('2024-01-01'))/604800000);
        if (dailyData.date!==today) { dailyData.date=today; dailyData.progress=0; }
        if (weeklyData.week!==week) { weeklyData.week=week; weeklyData.progress=0; }
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
        let startX=0, startY=0;
        this.boardEl.addEventListener('touchstart', e => { startX=e.touches[0].clientX; startY=e.touches[0].clientY; e.preventDefault(); });
        this.boardEl.addEventListener('touchend', e => {
            if (!startX && !startY) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dx)<20 && Math.abs(dy)<20) return;
            if (Math.abs(dx) > Math.abs(dy)) this.move(dx>0?'right':'left');
            else this.move(dy>0?'down':'up');
            startX=startY=0;
            vibrate();
        });
    }

    setupKeyboardEvents() {
        window.addEventListener('keydown', e => {
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
    if (!board || game2048) return;
    game2048 = new Game2048(
        board,
        document.getElementById('game-score'),
        document.getElementById('best-score'),
        document.getElementById('game-status'),
        document.getElementById('replay-share-btn')
    );
    document.getElementById('new-game-btn').addEventListener('click', () => { vibrate(); game2048.resetGame(); });
    document.getElementById('goto-leaderboard-btn').addEventListener('click', () => {
        document.querySelector('.nav-item[data-section="leaderboard-section"]').click();
    });
    if (replayMode) game2048.startReplay(replaySeed, replayMoves);
}

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

function loadAchievementsUI() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    const earned = JSON.parse(localStorage.getItem('achievements')||'{}');
    container.innerHTML = ACHIEVEMENTS.map(a => `
        <div class="achievement-item ${earned[a.id]?'earned':''}">
            <div class="achievement-icon">${a.icon}</div>
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}</div>
        </div>
    `).join('');
    updateProfileBadges(earned);
}

function updateProfileBadges(earned) {
    const cont = document.getElementById('profile-badges');
    if (!cont) return;
    cont.innerHTML = ACHIEVEMENTS.filter(a=>earned[a.id]).map(a=>`<span class="badge" title="${a.name}">${a.icon}</span>`).join('');
}

function updateProfileTiles() {
    const cont = document.getElementById('profile-tiles-grid');
    if (!cont) return;
    const tiles = JSON.parse(localStorage.getItem('collectedTiles')||'[]');
    if (!tiles.length) {
        cont.innerHTML = '<p style="font-size:13px;color:var(--text-secondary-light)">Пока нет плиток. Выполняйте достижения!</p>';
        return;
    }
    tiles.sort((a,b)=>a-b);
    cont.innerHTML = tiles.map(v => {
        let cls = `tile-${v}`;
        if (v>2048) cls = 'tile-super';
        if ([50,2000,5000,10000].includes(v)) cls = `tile-${v}`;
        return `<div class="profile-tile ${cls}">${v}</div>`;
    }).join('');
}

function getDailyTask() {
    const tasks = [
        { desc:'Наберите 1500 очков', target:1500, type:'score' },
        { desc:'Достигните плитки 128', target:128, type:'tile' },
        { desc:'Сделайте 30 ходов', target:30, type:'moves' },
        { desc:'Совершите 3 слияния за ход', target:3, type:'merge_combo' }
    ];
    return tasks[new Date().getDate() % tasks.length];
}

function getWeeklyTask() {
    const tasks = [
        { desc:'Наберите 8000 очков', target:8000, type:'score' },
        { desc:'Достигните плитки 512', target:512, type:'tile' },
        { desc:'Сделайте 150 ходов', target:150, type:'moves' },
        { desc:'Совершите 10 слияний за игру', target:10, type:'total_merges' }
    ];
    return tasks[Math.floor((Date.now()-new Date('2024-01-01'))/604800000) % tasks.length];
}

function loadChallengesUI() {
    const daily = getDailyTask();
    const weekly = getWeeklyTask();
    document.getElementById('daily-desc').textContent = daily.desc;
    document.getElementById('weekly-desc').textContent = weekly.desc;
    const dailyData = JSON.parse(localStorage.getItem('dailyProgress')||'{"date":"","progress":0}');
    const weeklyData = JSON.parse(localStorage.getItem('weeklyProgress')||'{"week":"","progress":0}');
    const today = new Date().toISOString().slice(0,10);
    const week = Math.floor((Date.now()-new Date('2024-01-01'))/604800000);
    if (dailyData.date!==today) { dailyData.date=today; dailyData.progress=0; }
    if (weeklyData.week!==week) { weeklyData.week=week; weeklyData.progress=0; }
    const dp = Math.min(100, (dailyData.progress/daily.target)*100);
    const wp = Math.min(100, (weeklyData.progress/weekly.target)*100);
    document.getElementById('daily-progress').style.width = dp+'%';
    document.getElementById('weekly-progress').style.width = wp+'%';
    document.getElementById('daily-status').textContent = dailyData.progress>=daily.target ? '✅ Выполнено' : `${dailyData.progress}/${daily.target}`;
    document.getElementById('weekly-status').textContent = weeklyData.progress>=weekly.target ? '✅ Выполнено' : `${weeklyData.progress}/${weekly.target}`;
}

function checkReplayParam() {
    if (window.Telegram?.WebApp) {
        const param = window.Telegram.WebApp.initDataUnsafe?.start_param;
        if (param?.startsWith('replay_')) {
            const [seedStr, movesStr] = param.replace('replay_','').split('_');
            if (seedStr && movesStr) {
                replaySeed = parseInt(seedStr);
                replayMoves = movesStr.split('').map(c => ({
                    'l':'left','r':'right','u':'up','d':'down'
                }[c] || 'left'));
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
        const res = await fetch(WORKER_URL+'/leaderboard');
        const data = await res.json();
        renderLeaderboard(data.leaderboard||[]);
    } catch { list.innerHTML = '<div class="leaderboard-loading">Ошибка загрузки</div>'; }
}

function renderLeaderboard(players) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    if (!players.length) { list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>'; return; }
    list.innerHTML = players.map((p,i) => {
        const isMe = currentUserId && p.userId.toString() === currentUserId.toString();
        const avatar = p.avatarUrl ? `<img src="${p.avatarUrl}" onerror="this.style.display='none';this.parentElement.textContent='${escapeHtml(p.firstName).charAt(0)}'">` : escapeHtml(p.firstName).charAt(0);
        return `<div class="leaderboard-item ${isMe?'current-user':''}">
            <div class="leaderboard-rank">#${i+1}</div>
            <div class="leaderboard-avatar">${avatar}</div>
            <div class="leaderboard-info"><div class="leaderboard-name">${escapeHtml(p.firstName)}</div></div>
            <div class="leaderboard-score">${p.score} <span>очк.</span>
                <button class="leaderboard-share-btn" data-share-name="${escapeHtml(p.firstName)}" data-share-score="${p.score}">
                    <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                </button>
            </div>
        </div>`;
    }).join('');
}

function setupLeaderboardRefresh() {
    document.getElementById('refresh-leaderboard')?.addEventListener('click', () => { vibrate(); fetchLeaderboard(); });
}

function setupLeaderboardShare() {
    document.getElementById('leaderboard-list')?.addEventListener('click', e => {
        const btn = e.target.closest('.leaderboard-share-btn');
        if (!btn) return;
        const name = btn.dataset.shareName, score = btn.dataset.shareScore;
        const text = `🏆 ${name} набрал ${score} очков в 2048! Сможешь побить рекорд? https://t.me/${BOT_USERNAME}`;
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/'+BOT_USERNAME)}&text=${encodeURIComponent(text)}`);
        } else if (navigator.share) {
            navigator.share({title:'2048 Verse', text, url:'https://t.me/'+BOT_USERNAME}).catch(()=>fallbackCopyToClipboard(text));
        } else fallbackCopyToClipboard(text);
    });
}

function escapeHtml(t) {
    return t.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
