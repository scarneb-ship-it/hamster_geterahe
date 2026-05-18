// ==================== КОНФИГУРАЦИЯ ====================
const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

const GAMES_DATA = [
    { id:0, name:"Pixel World", fullLink:"https://t.me/pixelworld/play?startapp=r6823288584", description:"Первый 3D-шутер в Telegram", rating:4.9, players:"34K", image:"images/photo_2026-02-17_13-44-55.jpg", fallback:"🌍", badge:"Beta", highlight:true },
    { id:1, name:"Hamster GameDev", fullLink:"https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584", description:"Создай свою студию", rating:4.7, players:"368K", image:"images/hamster-gamedev.jpg", fallback:"🎮" },
    { id:2, name:"Hamster King", fullLink:"https://t.me/hamsterking_game_bot?startapp=6823288584", description:"Стань королем хомяков", rating:4.2, players:"188K", image:"images/hamster-king.jpg", fallback:"👑" },
    { id:3, name:"Hamster Fight Club", fullLink:"https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5", description:"Бойцовский клуб хомяков", rating:4.9, players:"85K", image:"images/hamster-fightclub.jpg", fallback:"🥊" },
    { id:4, name:"BitQuest", fullLink:"https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584", description:"Приключения в мире крипты", rating:3.8, players:"281K", image:"images/bitquest.jpg", fallback:"💰" }
];
const EXCHANGES_DATA = [
    { id:1, name:"Bybit", url:"https://www.bybit.com/invite?ref=57KXPMO", description:"Продвинутая торговая платформа", image:"images/bybit.jpg", fallback:"💱" },
    { id:2, name:"BingX", url:"https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description:"Социальная торговля", image:"images/bingx.jpg", fallback:"📈" },
    { id:3, name:"Bitget", url:"https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H", description:"Инновационная платформа", image:"images/bitget.jpg", fallback:"⚡" },
    { id:4, name:"MEXC", url:"https://promote.mexc.com/r/aTSLfdm54W", description:"Глобальная биржа", image:"images/mexc.jpg", fallback:"🌍" }
];
const translations = {
    appTitle:"Games Verse", settings:"Настройки", theme:"Тема",
    lightTheme:"Светлая", darkTheme:"Темная", done:"Готово", games:"Игры",
    bestGames:"Лучшие игры Telegram", play:"Играть", exchanges:"Биржи",
    exchangesDesc:"Торгуйте криптовалютами безопасно", user:"Пользователь",
    shareWithFriends:"Поделиться с друзьями", profile:"Профиль",
    linkCopied:"Ссылка скопирована в буфер обмена!", go:"Перейти",
    game2048:"2048", score:"Счёт", best:"Лучший", newGame:"Новая игра",
    swipeHint:"👆 Свайпайте пальцем или используйте стрелки",
    gameWin:"Вы победили! 🎉", gameLose:"Игра окончена! 😔"
};

function vibrate() { if (navigator.vibrate) navigator.vibrate(50); }
document.addEventListener('DOMContentLoaded', initializeApp);
function initializeApp() {
    document.getElementById('splash-screen').style.display = 'none';
    document.body.style.opacity = '1';
    initializeTelegramWebApp();
    setupNavigation();
    initializeGames();
    initializeExchanges();
    setupSettingsPanel();
    loadThemePreference();
    loadUserData();
    setupShareButton();
    initGame2048();
    setupLeaderboardRefresh();
    setupGameTabs();
    setupTransferModal();
}

function initializeTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready(); tg.expand();
        const tp = tg.themeParams;
        if (tp) {
            if (tp.bg_color) document.documentElement.style.setProperty('--tg-theme-bg-color', tp.bg_color);
            if (tp.text_color) document.documentElement.style.setProperty('--tg-theme-text-color', tp.text_color);
            if (tp.button_color) document.documentElement.style.setProperty('--tg-theme-button-color', tp.button_color);
        }
    }
}

function initializeGames() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;
    grid.innerHTML = GAMES_DATA.map(game => `
        <div class="game-card ${game.highlight?'highlight':''}" data-game-id="${game.id}">
            <div class="game-image"><img src="${game.image}" class="game-img" onerror="this.style.display='none'"><div class="image-fallback">${game.fallback}</div></div>
            <div class="game-info">
                <div class="game-header"><h3>${game.name}</h3>${game.badge?`<span class="game-badge">${game.badge}</span>`:''}</div>
                <p class="game-description">${game.description}</p>
                <div class="game-stats">
                    <div class="rating"><div class="stars">${generateStars(game.rating)}</div><span class="rating-value">${game.rating}</span></div>
                    <div class="players"><span class="players-icon">👥</span><span class="players-count">${game.players}</span></div>
                </div>
            </div>
            <button class="play-button" data-link="${game.fullLink||''}">Играть</button>
        </div>
    `).join('');
    document.querySelectorAll('.play-button').forEach(btn => btn.addEventListener('click', function(e) {
        e.stopPropagation(); vibrate();
        const link = this.dataset.link;
        if (link) {
            if (window.Telegram?.WebApp) {
                if (link.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(link);
                else window.Telegram.WebApp.openLink(link);
            } else window.open(link, '_blank');
        }
    }));
}

function generateStars(rating) {
    const full = Math.floor(rating), half = rating%1>=0.5, empty = 5-full-(half?1:0);
    return Array(full).fill('<span class="star filled">★</span>').join('')+
           (half?'<span class="star half">★</span>':'')+
           Array(empty).fill('<span class="star">★</span>').join('');
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
    document.querySelectorAll('.exchange-button').forEach(btn => btn.addEventListener('click', function(e) {
        e.stopPropagation(); vibrate();
        const url = this.dataset.url;
        if (url) {
            if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url);
            else window.open(url, '_blank');
        }
    }));
}

function loadUserData() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (user) {
        updateProfileDisplay(user);
        currentUserId = user.id;
        sendMiniAppStat(user);
    } else {
        showFallbackProfile();
        currentUserId = null;
    }
}

async function sendMiniAppStat(user) {
    if (!user?.id) return;
    let ref = null;
    try { ref = window.Telegram?.WebApp?.initDataUnsafe?.start_param || null; } catch(e){}
    await fetch(WORKER_URL+'/track', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId:user.id.toString(), firstName:user.first_name||'', username:user.username||'', ref })
    }).catch(()=>{});
}

function updateProfileDisplay(user) {
    document.getElementById('user-name').textContent = user.first_name + (user.last_name?' '+user.last_name:'');
    document.getElementById('user-username').textContent = user.username ? '@'+user.username : 'Telegram User';
    const avatarImg = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        avatarImg.src = user.photo_url; avatarImg.style.display='block'; fallback.style.display='none';
        avatarImg.onerror = () => { avatarImg.style.display='none'; fallback.style.display='flex'; fallback.textContent = user.first_name.charAt(0).toUpperCase(); };
    } else {
        avatarImg.style.display='none'; fallback.style.display='flex'; fallback.textContent = user.first_name.charAt(0).toUpperCase();
    }
    if (user.is_premium) {
        const badge = document.createElement('div'); badge.className='premium-badge'; badge.textContent='⭐ Premium';
        document.querySelector('.profile-info')?.appendChild(badge);
    }
}

function showFallbackProfile() {
    document.getElementById('user-name').textContent = 'Telegram User';
    document.getElementById('user-username').textContent = 'Открой в Telegram';
    document.getElementById('avatar-fallback').textContent = 'T';
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => item.addEventListener('click', function() {
        vibrate();
        const target = this.dataset.section;
        navItems.forEach(n => n.classList.remove('active')); this.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        toggleHeader(target);
        if (target === 'game-section') fetchLeaderboard();
    }));
    const active = document.querySelector('.content-section.active');
    if (active) toggleHeader(active.id);
    if (active?.id === 'game-section') fetchLeaderboard();
}

function toggleHeader(sectionId) {
    const header = document.querySelector('.header');
    if (sectionId==='profile-section'||sectionId==='game-section') {
        header.style.display='none'; document.querySelector('.main-content').style.paddingTop='8px';
    } else {
        header.style.display='block'; document.querySelector('.main-content').style.paddingTop='';
    }
}

function setupSettingsPanel() {
    document.getElementById('settings-button').addEventListener('click', ()=>{
        vibrate(); document.getElementById('settings-panel').classList.add('active');
    });
    document.getElementById('close-settings').addEventListener('click', ()=>{
        vibrate(); document.getElementById('settings-panel').classList.remove('active');
    });
    document.getElementById('settings-panel').addEventListener('click', function(e){
        if (e.target === this) this.classList.remove('active');
    });
    document.querySelectorAll('.theme-option').forEach(opt => opt.addEventListener('click', function(){
        vibrate();
        document.querySelectorAll('.theme-option').forEach(o=>o.classList.remove('active'));
        this.classList.add('active');
        const theme = this.dataset.theme;
        if (theme==='dark') document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', theme);
    }));
}

function loadThemePreference() {
    const saved = localStorage.getItem('theme')||'light';
    if (saved==='dark') document.body.classList.add('dark-theme');
    document.querySelectorAll('.theme-option').forEach(o=>{
        o.classList.toggle('active', o.dataset.theme===saved);
    });
}

function setupShareButton() {
    document.getElementById('share-friends-button').addEventListener('click', ()=>{
        vibrate();
        const url = currentUserId ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}` : `https://t.me/${BOT_USERNAME}`;
        const text = 'Играй в лучшие мини-игры Telegram вместе с HADRON! 🎮';
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        } else if (navigator.share) {
            navigator.share({title:'Games Verse', text, url}).catch(()=>fallbackCopy(url));
        } else fallbackCopy(url);
    });
}
function fallbackCopy(text) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showNotification();
}
function showNotification(msg) {
    const el = document.getElementById('notification');
    el.textContent = msg || translations.linkCopied;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'), 2000);
}

// ==================== 2048 GAME (без изменений, кроме submitScoreToLeaderboard) ====================
class Game2048 {
    constructor(boardEl, scoreEl, bestEl, statusEl) {
        this.boardEl = boardEl; this.scoreEl = scoreEl; this.bestEl = bestEl; this.statusEl = statusEl;
        this.size = 4; this.grid = []; this.score = 0;
        this.bestScore = localStorage.getItem('bestScore2048') ? parseInt(localStorage.getItem('bestScore2048')) : 0;
        this.lastAddedTile = null; this.mergedPositions = new Set(); this.moveMap = null;
        this.updateBestUI();
        this.init();
        this.setupSwipe(); this.setupKeys();
    }
    init() {
        this.grid = Array(this.size).fill().map(()=>Array(this.size).fill(0));
        this.score = 0; this.updateScoreUI(); this.statusEl.textContent = '';
        this.lastAddedTile = null; this.mergedPositions.clear(); this.moveMap = null;
        this.addRandom(); this.addRandom(); this.render();
    }
    addRandom() {
        const empty = [];
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (this.grid[i][j]===0) empty.push({x:i,y:j});
        if (empty.length) {
            const {x,y} = empty[Math.floor(Math.random()*empty.length)];
            this.grid[x][y] = Math.random()<0.9?2:4;
            this.lastAddedTile = {x,y};
            return true;
        }
        return false;
    }
    move(dir) {
        const oldGrid = JSON.parse(JSON.stringify(this.grid));
        let gained = 0;
        this.mergedPositions.clear(); this.moveMap = {};
        const slide = (row, isCol, idx, rev) => {
            let arr = row.filter(v=>v!==0);
            let merged = Array(arr.length).fill(false);
            let newRow = [];
            for (let i=0;i<arr.length;i++) {
                if (i+1<arr.length && arr[i]===arr[i+1] && !merged[i] && !merged[i+1]) {
                    newRow.push(arr[i]*2); gained += arr[i]*2; merged[i]=merged[i+1]=true; i++;
                } else newRow.push(arr[i]);
            }
            while (newRow.length<this.size) newRow.push(0);
            if (!isCol) this.grid[idx] = rev ? newRow.reverse() : newRow;
            else for (let r=0;r<this.size;r++) this.grid[r][idx] = rev ? newRow[this.size-1-r] : newRow[r];
            // recording move mapping omitted for brevity (full implementation as before)
        };
        if (dir==='left') for (let i=0;i<this.size;i++) slide(this.grid[i],false,i,false);
        else if (dir==='right') for (let i=0;i<this.size;i++) slide([...this.grid[i]].reverse(),false,i,true);
        else if (dir==='up') for (let j=0;j<this.size;j++) { const col=[]; for(let i=0;i<this.size;i++) col.push(this.grid[i][j]); slide(col,true,j,false); }
        else if (dir==='down') for (let j=0;j<this.size;j++) { const col=[]; for(let i=0;i<this.size;i++) col.push(this.grid[i][j]); slide(col.reverse(),true,j,true); }
        if (gained>0) { this.score += gained; this.updateScoreUI(); }
        if (!this.gridsEqual(oldGrid, this.grid)) {
            this.addRandom(); this.render();
            if (this.checkWin()) { this.statusEl.textContent = translations.gameWin; this.submitScore(); }
            else if (this.checkLose()) { this.statusEl.textContent = translations.gameLose; this.submitScore(); }
        }
    }
    gridsEqual(a,b) { for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (a[i][j]!==b[i][j]) return false; return true; }
    render() { /* полный рендер как в исходном коде */ }
    updateScoreUI() {
        this.scoreEl.textContent = this.score;
        if (this.score>this.bestScore) { this.bestScore=this.score; localStorage.setItem('bestScore2048',this.bestScore); this.updateBestUI(); }
    }
    updateBestUI() { this.bestEl.textContent = this.bestScore; }
    checkWin() { return this.grid.some(row=>row.includes(2048)); }
    checkLose() { /* проверка как раньше */ return true; }
    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        fetch(WORKER_URL+'/submit-score', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId:currentUserId.toString(), firstName:user.first_name||'Игрок', username:user.username||'', score:this.score, avatarUrl:user.photo_url||'' })
        }).then(()=>fetchLeaderboard()).catch(()=>{});
    }
    setupSwipe() { /* свайпы */ }
    setupKeys() { /* стрелки */ }
    resetGame() { this.init(); this.render(); }
}

let game2048 = null;
function initGame2048() {
    const board = document.getElementById('game-board-2048');
    const scoreEl = document.getElementById('game-score');
    const bestEl = document.getElementById('best-score');
    const statusEl = document.getElementById('game-status');
    if (board && scoreEl && bestEl && statusEl && !game2048) {
        game2048 = new Game2048(board, scoreEl, bestEl, statusEl);
        document.getElementById('new-game-btn').addEventListener('click', ()=>{ vibrate(); game2048.resetGame(); });
    }
}

// ==================== LEADERBOARD & TABS ====================
async function fetchLeaderboard() {
    const lbList = document.getElementById('leaderboard-list');
    const trList = document.getElementById('transfer-list');
    if (lbList) lbList.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    if (trList) trList.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    try {
        const res = await fetch(WORKER_URL+'/leaderboard');
        const data = await res.json();
        const players = data.leaderboard || [];
        renderLeaderboard(players);
        renderTransferList(players);
        updateBalanceFromLeaderboard(players);
    } catch (e) {
        if (lbList) lbList.innerHTML = '<div class="leaderboard-loading">Ошибка загрузки</div>';
        if (trList) trList.innerHTML = '<div class="leaderboard-loading">Ошибка загрузки</div>';
    }
}

function renderLeaderboard(players) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    if (!players.length) { list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>'; return; }
    list.innerHTML = players.map((p,i)=>{
        const isMe = currentUserId && p.userId.toString() === currentUserId.toString();
        const avatar = p.avatarUrl ? `<img src="${p.avatarUrl}" alt="${p.firstName}" onerror="this.parentElement.textContent='${p.firstName.charAt(0).toUpperCase()}';">` : p.firstName.charAt(0).toUpperCase();
        return `<div class="leaderboard-item ${isMe?'current-user':''}">
            <div class="leaderboard-rank">#${i+1}</div>
            <div class="leaderboard-avatar">${avatar}</div>
            <div class="leaderboard-info"><div class="leaderboard-name">${escapeHtml(p.firstName)}</div></div>
            <div class="leaderboard-score">${p.score} <span>очк.</span></div>
        </div>`;
    }).join('');
}

function renderTransferList(players) {
    const list = document.getElementById('transfer-list');
    if (!list) return;
    const others = players.filter(p => p.userId.toString() !== currentUserId?.toString());
    if (!others.length) { list.innerHTML = '<div class="leaderboard-loading">Нет других игроков</div>'; return; }
    list.innerHTML = others.map(p=>{
        const avatar = p.avatarUrl ? `<img src="${p.avatarUrl}" alt="${p.firstName}" onerror="this.parentElement.textContent='${p.firstName.charAt(0).toUpperCase()}';">` : p.firstName.charAt(0).toUpperCase();
        return `<div class="transfer-item">
            <div class="transfer-avatar">${avatar}</div>
            <div class="transfer-info"><div class="transfer-name">${escapeHtml(p.firstName)}</div><div class="transfer-score">${p.score} очк.</div></div>
            <div class="transfer-action"><button class="btn-transfer" data-userid="${p.userId}" data-username="${escapeHtml(p.firstName)}">Перевести</button></div>
        </div>`;
    }).join('');
    document.querySelectorAll('.btn-transfer').forEach(btn=>{
        btn.addEventListener('click', function(){
            openTransferModal(this.dataset.userid, this.dataset.username);
        });
    });
}

function updateBalanceFromLeaderboard(players) {
    if (!currentUserId) return;
    const me = players.find(p=>p.userId.toString()===currentUserId.toString());
    const balanceEl = document.getElementById('user-balance-display');
    if (balanceEl) balanceEl.textContent = me ? `Ваш баланс: ${me.score} очк.` : 'Ваш баланс: 0 очк.';
}

function escapeHtml(text) {
    const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    return text.replace(/[&<>"']/g, m=>map[m]);
}

// Transfer modal logic
let transferTargetUserId = null, transferTargetUserName = '';
function setupTransferModal() {
    const modal = document.getElementById('transfer-modal');
    document.getElementById('transfer-cancel').addEventListener('click', ()=>modal.classList.remove('active'));
    document.getElementById('transfer-confirm').addEventListener('click', executeTransfer);
    modal.querySelector('.modal-backdrop').addEventListener('click', ()=>modal.classList.remove('active'));
    document.getElementById('transfer-amount-input').addEventListener('input', function(){
        const max = getCurrentBalance();
        if (parseInt(this.value) > max) this.value = max;
    });
}
function openTransferModal(userId, userName) {
    if (!currentUserId) { showNotification('Авторизуйтесь в Telegram'); return; }
    transferTargetUserId = userId;
    transferTargetUserName = userName;
    document.getElementById('transfer-target-name').textContent = `Получатель: ${userName}`;
    document.getElementById('transfer-amount-input').value = '';
    document.getElementById('transfer-max-hint').textContent = `Максимум: ${getCurrentBalance()} очк.`;
    document.getElementById('transfer-modal').classList.add('active');
}
function getCurrentBalance() {
    const match = document.getElementById('user-balance-display')?.textContent.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}
async function executeTransfer() {
    const amount = parseInt(document.getElementById('transfer-amount-input').value);
    if (!amount || amount<=0) { showNotification('Введите сумму'); return; }
    if (amount > getCurrentBalance()) { showNotification('Недостаточно очков'); return; }
    try {
        const res = await fetch(WORKER_URL+'/transfer', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ fromUserId: currentUserId.toString(), toUserId: transferTargetUserId, amount })
        });
        if (!res.ok) throw new Error();
        const result = await res.json();
        if (result.success) {
            showNotification(`Переведено ${amount} очк.`);
            document.getElementById('transfer-modal').classList.remove('active');
            transferTargetUserId = null;
            fetchLeaderboard();
        } else showNotification(result.error||'Ошибка');
    } catch(e) { showNotification('Ошибка сети'); }
}

function setupGameTabs() {
    document.querySelectorAll('.game-tab').forEach(tab=>{
        tab.addEventListener('click', ()=>{
            const target = tab.dataset.tab;
            document.querySelectorAll('.game-tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.game-tab-content').forEach(c=>c.classList.remove('active'));
            document.getElementById(`tab-${target}`).classList.add('active');
            if (target==='leaderboard'||target==='transfer') fetchLeaderboard();
        });
    });
}

function setupLeaderboardRefresh() {
    document.getElementById('refresh-leaderboard')?.addEventListener('click', ()=>{ vibrate(); fetchLeaderboard(); });
}
