// script.js
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
    loadUserData();
    setupShareButton();
    initGame2048();
    setupGameTabs();
    setupLeaderboardRefresh();
    setupLeaderboardShare();
}

function initializeTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
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
            <button class="play-button" data-link="${game.fullLink || ''}">Играть</button>
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
            <button class="exchange-button" data-url="${exchange.url}">Перейти</button>
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
        if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
            ref = window.Telegram.WebApp.initDataUnsafe.start_param;
        }
    } catch(e){}
    try {
        await fetch(WORKER_URL + '/track', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ userId: user.id.toString(), firstName: user.first_name||'', username: user.username||'', ref: ref||null })
        });
    } catch(err){}
}

function updateProfileDisplay(user) {
    document.getElementById('user-name').textContent = (user.first_name||'') + (user.last_name ? ' '+user.last_name : '');
    document.getElementById('user-username').textContent = user.username ? '@'+user.username : 'Telegram User';
    updateUserAvatar(user);
}

function updateUserAvatar(user) {
    const img = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        img.src = user.photo_url;
        img.style.display = 'block';
        fallback.style.display = 'none';
    } else {
        img.style.display = 'none';
        fallback.textContent = (user.first_name||'T').charAt(0).toUpperCase();
        fallback.style.display = 'flex';
    }
}

function showFallbackProfile() {
    document.getElementById('user-name').textContent = 'Пользователь';
    document.getElementById('user-username').textContent = 'Открой в Telegram';
    document.getElementById('avatar-img').style.display = 'none';
    document.getElementById('avatar-fallback').textContent = 'T';
}

function toggleHeaderForSection(sectionId) {
    const header = document.querySelector('.header');
    if (!header) return;
    if (sectionId === 'profile-section' || sectionId === 'game-section') {
        header.style.display = 'none';
        document.querySelector('.main-content').style.paddingTop = '8px';
    } else {
        header.style.display = 'block';
        document.querySelector('.main-content').style.paddingTop = '';
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const target = this.getAttribute('data-section');
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            toggleHeaderForSection(target);
            if (target === 'game-section') {
                // Если перешли на 2048, показываем игру по умолчанию
                switchGameTab('game');
                fetchLeaderboard();
            }
        });
    });
    const active = document.querySelector('.content-section.active');
    if (active) toggleHeaderForSection(active.id);
}

function setupGameTabs() {
    document.querySelectorAll('.game-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            vibrate();
            const tabName = this.dataset.tab;
            switchGameTab(tabName);
            if (tabName === 'leaderboard') fetchLeaderboard();
        });
    });
}

function switchGameTab(tab) {
    document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.game-tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById('game-tab-game').style.display = tab === 'game' ? 'block' : 'none';
    document.getElementById('game-tab-leaderboard').style.display = tab === 'leaderboard' ? 'block' : 'none';
}

function setupGameButtons() {
    document.querySelectorAll('.play-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            vibrate();
            const link = this.dataset.link;
            if (link) {
                if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink(link);
                else window.open(link, '_blank');
            }
        });
    });
}

function setupExchangeButtons() {
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

function setupShareButton() {
    const shareBtn = document.getElementById('share-friends-button');
    if (!shareBtn) return;
    shareBtn.addEventListener('click', function() {
        vibrate();
        let botUrl = currentUserId ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}` : `https://t.me/${BOT_USERNAME}`;
        const text = 'Играй в лучшие мини-игры Telegram вместе с HADRON! 🎮';
        if (window.Telegram?.WebApp) {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else if (navigator.share) {
            navigator.share({ title: 'Games Verse', text: text, url: botUrl }).catch(() => fallbackCopy(botUrl));
        } else {
            fallbackCopy(botUrl);
        }
    });
}

function fallbackCopy(text) {
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showNotification();
    } catch(e) { showNotification('Не удалось скопировать ссылку'); }
}

function showNotification(msg) {
    const n = document.getElementById('notification');
    n.textContent = msg || 'Ссылка скопирована в буфер обмена!';
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2000);
}

/* 2048 Game */
class Game2048 {
    constructor(boardEl, scoreEl, bestEl, statusEl) {
        this.boardEl = boardEl;
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
        this.updateScoreUI();
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
            const {x, y} = empty[Math.floor(Math.random() * empty.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(dir) {
        const old = JSON.parse(JSON.stringify(this.grid));
        let gained = 0;
        if (dir === 'left') {
            for (let i=0;i<4;i++) {
                let row = this.grid[i].filter(v=>v);
                for (let j=0;j<row.length-1;j++) {
                    if (row[j]===row[j+1]) {
                        row[j]*=2; gained+=row[j]; row.splice(j+1,1);
                    }
                }
                while(row.length<4) row.push(0);
                this.grid[i]=row;
            }
        } else if (dir === 'right') {
            for (let i=0;i<4;i++) {
                let row = this.grid[i].filter(v=>v).reverse();
                for (let j=0;j<row.length-1;j++) {
                    if (row[j]===row[j+1]) {
                        row[j]*=2; gained+=row[j]; row.splice(j+1,1);
                    }
                }
                while(row.length<4) row.push(0);
                this.grid[i]=row.reverse();
            }
        } else if (dir === 'up') {
            for (let j=0;j<4;j++) {
                let col = [];
                for (let i=0;i<4;i++) col.push(this.grid[i][j]);
                col = col.filter(v=>v);
                for (let i=0;i<col.length-1;i++) {
                    if (col[i]===col[i+1]) {
                        col[i]*=2; gained+=col[i]; col.splice(i+1,1);
                    }
                }
                while(col.length<4) col.push(0);
                for (let i=0;i<4;i++) this.grid[i][j]=col[i];
            }
        } else if (dir === 'down') {
            for (let j=0;j<4;j++) {
                let col = [];
                for (let i=0;i<4;i++) col.push(this.grid[i][j]);
                col = col.filter(v=>v).reverse();
                for (let i=0;i<col.length-1;i++) {
                    if (col[i]===col[i+1]) {
                        col[i]*=2; gained+=col[i]; col.splice(i+1,1);
                    }
                }
                while(col.length<4) col.push(0);
                col.reverse();
                for (let i=0;i<4;i++) this.grid[i][j]=col[i];
            }
        }
        if (gained>0) {
            this.score+=gained;
            this.updateScoreUI();
        }
        if (!this.gridsEqual(old, this.grid)) {
            this.addRandomTile();
            this.render();
            if (this.checkWin()) {
                this.statusEl.textContent = 'Вы победили! 🎉';
                this.submitScore();
            } else if (this.checkLose()) {
                this.statusEl.textContent = 'Игра окончена! 😔';
                this.submitScore();
            }
        }
    }

    gridsEqual(a,b) {
        for (let i=0;i<4;i++) for (let j=0;j<4;j++) if (a[i][j]!==b[i][j]) return false;
        return true;
    }

    render() {
        this.boardEl.innerHTML = '';
        for (let i=0;i<4;i++) {
            for (let j=0;j<4;j++) {
                const v = this.grid[i][j];
                const tile = document.createElement('div');
                tile.className = 'tile-cell';
                if (v) {
                    tile.classList.add(`tile-${v}` > 2048 ? 'tile-super' : `tile-${v}`);
                    tile.textContent = v;
                }
                this.boardEl.appendChild(tile);
            }
        }
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
        for (let i=0;i<4;i++) for (let j=0;j<4;j++) if (this.grid[i][j]===0) return false;
        for (let i=0;i<4;i++) for (let j=0;j<3;j++) if (this.grid[i][j]===this.grid[i][j+1]) return false;
        for (let j=0;j<4;j++) for (let i=0;i<3;i++) if (this.grid[i][j]===this.grid[i+1][j]) return false;
        return true;
    }

    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        fetch(WORKER_URL + '/submit-score', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                userId: currentUserId.toString(),
                firstName: user.first_name || 'Игрок',
                username: user.username || '',
                score: this.score,
                avatarUrl: user.photo_url || ''
            })
        }).then(() => fetchLeaderboard()).catch(()=>{});
    }

    bindEvents() {
        let startX, startY;
        this.boardEl.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            e.preventDefault();
        });
        this.boardEl.addEventListener('touchend', e => {
            if (!startX) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) this.move(dx > 0 ? 'right' : 'left');
            else this.move(dy > 0 ? 'down' : 'up');
            startX = null;
            vibrate();
        });
        window.addEventListener('keydown', e => {
            if (!document.querySelector('#game-section.active')) return;
            if (e.key === 'ArrowLeft') { this.move('left'); e.preventDefault(); vibrate(); }
            else if (e.key === 'ArrowRight') { this.move('right'); e.preventDefault(); vibrate(); }
            else if (e.key === 'ArrowUp') { this.move('up'); e.preventDefault(); vibrate(); }
            else if (e.key === 'ArrowDown') { this.move('down'); e.preventDefault(); vibrate(); }
        });
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
        document.getElementById('new-game-btn').addEventListener('click', () => {
            vibrate();
            game2048.init();
            game2048.render();
        });
    }
}

async function fetchLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        renderLeaderboard(data.leaderboard || []);
    } catch(e) {
        list.innerHTML = '<div class="leaderboard-loading">Ошибка загрузки</div>';
    }
}

function renderLeaderboard(players) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    if (!players.length) {
        list.innerHTML = '<div class="leaderboard-loading">Нет результатов</div>';
        return;
    }
    list.innerHTML = players.map((p, i) => {
        const isMe = currentUserId && p.userId.toString() === currentUserId.toString();
        const avatar = p.avatarUrl ? `<img src="${p.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : p.firstName.charAt(0).toUpperCase();
        return `<div class="leaderboard-item ${isMe?'current-user':''}">
            <span class="leaderboard-rank">#${i+1}</span>
            <div class="leaderboard-avatar">${avatar}</div>
            <span class="leaderboard-name">${escapeHtml(p.firstName)}</span>
            <span class="leaderboard-score">${p.score} очк.</span>
            <button class="leaderboard-share-btn" data-share-name="${escapeHtml(p.firstName)}" data-share-score="${p.score}">
                <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
            </button>
        </div>`;
    }).join('');
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
}

function setupLeaderboardRefresh() {
    document.getElementById('refresh-leaderboard')?.addEventListener('click', () => {
        vibrate();
        fetchLeaderboard();
    });
}

function setupLeaderboardShare() {
    document.getElementById('leaderboard-list')?.addEventListener('click', e => {
        const btn = e.target.closest('.leaderboard-share-btn');
        if (!btn) return;
        e.stopPropagation();
        const name = btn.dataset.shareName;
        const score = btn.dataset.shareScore;
        const text = `🏆 ${name} набрал ${score} очков в 2048! Сможешь побить рекорд? Играй в Games Verse: https://t.me/${BOT_USERNAME}`;
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/'+BOT_USERNAME)}&text=${encodeURIComponent(text)}`);
        } else if (navigator.share) {
            navigator.share({ title: 'Games Verse', text }).catch(()=>{});
        } else {
            fallbackCopy(text);
        }
    });
}
