const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

const GAMES_DATA = [
    { id:0, name:"Pixel World", fullLink:"https://t.me/pixelworld/play?startapp=r6823288584", description:"Первый 3D-шутер в Telegram", image:"images/photo_2026-02-17_13-44-55.jpg", fallback:"🌍" },
    { id:1, name:"Hamster GameDev", fullLink:"https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584", description:"Создай свою студию", image:"images/hamster-gamedev.jpg", fallback:"🎮" },
    { id:2, name:"Hamster King", fullLink:"https://t.me/hamsterking_game_bot?startapp=6823288584", description:"Стань королем хомяков", image:"images/hamster-king.jpg", fallback:"👑" },
    { id:3, name:"Hamster Fight Club", fullLink:"https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5", description:"Бойцовский клуб", image:"images/hamster-fightclub.jpg", fallback:"🥊" },
    { id:4, name:"BitQuest", fullLink:"https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584", description:"Приключения в мире крипты", image:"images/bitquest.jpg", fallback:"💰" }
];
const EXCHANGES_DATA = [
    { id:1, name:"Bybit", url:"https://www.bybit.com/invite?ref=57KXPMO", description:"Продвинутая торговая платформа", image:"images/bybit.jpg", fallback:"💱" },
    { id:2, name:"BingX", url:"https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description:"Социальная торговля", image:"images/bingx.jpg", fallback:"📈" },
    { id:3, name:"Bitget", url:"https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H", description:"Инновационная платформа", image:"images/bitget.jpg", fallback:"⚡" },
    { id:4, name:"MEXC", url:"https://promote.mexc.com/r/aTSLfdm54W", description:"Глобальная биржа", image:"images/mexc.jpg", fallback:"🌍" }
];

// Замените массив SKINS в script.js на следующий, добавив элитный скин:
const SKINS = [
    { id: 'classic', name: 'Классический', price: 0, preview: '2' },
    { id: 'golden', name: 'Золотой', price: 0, preview: '🪙' },
    { id: 'neon', name: 'Неоновый', price: 0, preview: '💠' },
    { id: 'elite', name: 'Элитный', price: 0, preview: '👑' }  // новый премиальный стиль
];

function vibrate() { if (navigator.vibrate) navigator.vibrate(50); }

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('splash-screen').style.display = 'none';
    document.body.style.opacity = '1';
    initializeTelegramWebApp();
    setupNavigation();
    setupSettingsPanel();
    loadThemePreference();
    loadUserData();
    setupShareReferral();
    initGame2048();
    setupLeaderboardRefresh();
    setupGameTabs();
    setupTransferForm();
    setupShop();
    fetchLeaderboard();
    updateBalanceDisplay();
});

function initializeTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready(); tg.expand();
    }
}

// ==================== НАВИГАЦИЯ ====================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            vibrate();
            const target = this.dataset.section;
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            toggleHeader(target);

            if (target === 'game-section') { fetchLeaderboard(); updateBalanceDisplay(); }
            else if (target === 'tasks-section') renderTasks();
            else if (target === 'referrals-section') updateReferralInfo();
            else if (target === 'upgrades-section') { updateBalanceDisplay(); renderSkins(); }
        });
    });
    const active = document.querySelector('.content-section.active');
    if (active) {
        toggleHeader(active.id);
        if (active.id === 'game-section') { fetchLeaderboard(); updateBalanceDisplay(); }
        else if (active.id === 'tasks-section') renderTasks();
        else if (active.id === 'referrals-section') updateReferralInfo();
        else if (active.id === 'upgrades-section') { updateBalanceDisplay(); renderSkins(); }
    }
}

function toggleHeader(sectionId) {
    const header = document.querySelector('.header');
    const main = document.querySelector('.main-content');
    if (['game-section','upgrades-section','referrals-section','tasks-section'].includes(sectionId)) {
        header.style.display = 'none';
        main.style.paddingTop = '8px';
    } else {
        header.style.display = 'block';
        main.style.paddingTop = '';
    }
}

// ==================== ПОЛЬЗОВАТЕЛЬ И БАЛАНС ====================
function loadUserData() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (user) {
        currentUserId = user.id;
        updateReferralInfo();
        updateBalanceDisplay();
    } else {
        currentUserId = null;
    }
}

async function updateBalanceDisplay() {
    const balanceEl = document.getElementById('user-balance-display');
    const shopBalanceEl = document.getElementById('shop-balance-display');
    if (!currentUserId) {
        if (balanceEl) balanceEl.textContent = 'Ваш баланс: 0 коин.';
        if (shopBalanceEl) shopBalanceEl.textContent = 'Ваш баланс: 0 коин.';
        return;
    }
    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        const me = (data.leaderboard || []).find(p => p.userId.toString() === currentUserId.toString());
        const coins = me ? me.score : 0;
        if (balanceEl) balanceEl.textContent = `Ваш баланс: ${coins} коин.`;
        if (shopBalanceEl) shopBalanceEl.textContent = `Ваш баланс: ${coins} коин.`;
        return coins;
    } catch(e) {
        if (balanceEl) balanceEl.textContent = 'Ваш баланс: 0 коин.';
        if (shopBalanceEl) shopBalanceEl.textContent = 'Ваш баланс: 0 коин.';
        return 0;
    }
}

// ==================== РЕФЕРАЛЫ ====================
function updateReferralInfo() {
    const linkText = document.getElementById('referral-link-text');
    if (!linkText) return;
    const refLink = currentUserId ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}` : `https://t.me/${BOT_USERNAME}`;
    linkText.textContent = refLink;
    document.getElementById('referral-count').textContent = '0';
}
function setupShareReferral() {
    document.getElementById('share-referral-btn').addEventListener('click', () => {
        vibrate();
        const link = document.getElementById('referral-link-text').textContent;
        const text = 'Играй в лучшие мини-игры Telegram вместе с HADRON! 🎮';
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
        } else if (navigator.share) {
            navigator.share({ title:'Games Verse', text, url:link }).catch(() => copyToClipboard(link));
        } else copyToClipboard(link);
    });
    document.getElementById('copy-referral-link').addEventListener('click', () => {
        vibrate();
        copyToClipboard(document.getElementById('referral-link-text').textContent);
    });
}

// ==================== ЗАДАНИЯ ====================
function renderTasks() {
    const gamesGrid = document.getElementById('tasks-games-grid');
    const exchangesGrid = document.getElementById('tasks-exchanges-grid');
    if (!gamesGrid || !exchangesGrid) return;
    gamesGrid.innerHTML = GAMES_DATA.map(g => `
        <div class="task-card">
            <div class="task-image"><img src="${g.image}" alt="${g.name}" onerror="this.parentElement.innerHTML='<span style=font-size:20px>${g.fallback}</span>'"></div>
            <div class="task-info"><h4>${g.name}</h4><p>${g.description}</p></div>
            <button class="task-action-btn" data-link="${g.fullLink}">Играть</button>
        </div>`).join('');
    exchangesGrid.innerHTML = EXCHANGES_DATA.map(e => `
        <div class="task-card">
            <div class="task-image"><img src="${e.image}" alt="${e.name}" onerror="this.parentElement.innerHTML='<span style=font-size:20px>${e.fallback}</span>'"></div>
            <div class="task-info"><h4>${e.name}</h4><p>${e.description}</p></div>
            <button class="task-action-btn" data-link="${e.url}">Перейти</button>
        </div>`).join('');
    document.querySelectorAll('.task-action-btn').forEach(btn => btn.addEventListener('click', function(e) {
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

// ==================== ИГРА 2048 ====================
class Game2048 {
    constructor(boardEl, scoreEl, bestEl, statusEl) {
        this.boardEl = boardEl;
        this.scoreEl = scoreEl;
        this.bestEl = bestEl;
        this.statusEl = statusEl;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048') || '0');
        this.lastAddedTile = null;
        this.mergedPositions = new Set();
        this.moveMap = null;
        this.currentSkin = localStorage.getItem('selectedSkin') || 'classic';
        this.updateBestUI();
        this.init();
        this.setupSwipe();
        this.setupKeys();
    }
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScoreUI();
        this.statusEl.textContent = '';
        this.lastAddedTile = null;
        this.mergedPositions.clear();
        this.moveMap = null;
        this.addRandom();
        this.addRandom();
        this.render();
    }
    addRandom() {
        const empty = [];
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (this.grid[i][j]===0) empty.push({x:i,y:j});
        if (empty.length) {
            const {x,y} = empty[Math.floor(Math.random()*empty.length)];
            this.grid[x][y] = Math.random()<0.9 ? 2 : 4;
            this.lastAddedTile = {x,y};
            return true;
        }
        return false;
    }
    move(dir) {
        const oldGrid = JSON.parse(JSON.stringify(this.grid));
        let gained = 0;
        this.mergedPositions.clear(); this.moveMap = {};
        const slide = (line, isCol, idx, rev) => {
            let arr = line.filter(v=>v!==0);
            let merged = Array(arr.length).fill(false);
            let newRow = [];
            for (let i=0;i<arr.length;i++) {
                if (i+1<arr.length && arr[i]===arr[i+1] && !merged[i] && !merged[i+1]) {
                    newRow.push(arr[i]*2); gained += arr[i]*2; merged[i]=merged[i+1]=true; i++;
                } else newRow.push(arr[i]);
            }
            while (newRow.length<this.size) newRow.push(0);
            if (rev) newRow.reverse();
            if (!isCol) for (let c=0;c<this.size;c++) this.grid[idx][c] = newRow[c];
            else for (let r=0;r<this.size;r++) this.grid[r][idx] = newRow[r];
        };
        if (dir==='left') for (let i=0;i<this.size;i++) slide(this.grid[i],false,i,false);
        else if (dir==='right') for (let i=0;i<this.size;i++) slide([...this.grid[i]].reverse(),false,i,true);
        else if (dir==='up') for (let j=0;j<this.size;j++) { const col=[]; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); slide(col,true,j,false); }
        else if (dir==='down') for (let j=0;j<this.size;j++) { const col=[]; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); slide(col.reverse(),true,j,true); }
        if (gained>0) { this.score += gained; this.updateScoreUI(); }
        if (!this.gridsEqual(oldGrid, this.grid)) {
            this.addRandom(); this.render();
            if (this.checkWin()) { this.statusEl.textContent = 'Вы победили! 🎉'; this.submitScore(); }
            else if (this.checkLose()) { this.statusEl.textContent = 'Игра окончена! 😔'; this.submitScore(); }
        }
    }
    gridsEqual(a,b) { for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (a[i][j]!==b[i][j]) return false; return true; }
    render() {
        this.boardEl.innerHTML = '';
        this.boardEl.className = `game-board-2048 skin-${this.currentSkin}`;
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) {
            const value = this.grid[i][j];
            const tile = document.createElement('div');
            tile.className = 'tile-cell';
            if (value!==0) {
                tile.classList.add(`tile-${value<=2048 ? value : 'super'}`);
                tile.textContent = value;
                if (this.lastAddedTile && this.lastAddedTile.x===i && this.lastAddedTile.y===j) {
                    tile.classList.add('tile-new');
                    tile.addEventListener('animationend', ()=>tile.classList.remove('tile-new'), {once:true});
                }
            }
            this.boardEl.appendChild(tile);
        }
        this.lastAddedTile = null;
    }
    updateScoreUI() {
        this.scoreEl.textContent = this.score;
        if (this.score>this.bestScore) { this.bestScore=this.score; localStorage.setItem('bestScore2048', this.bestScore); this.updateBestUI(); }
    }
    updateBestUI() { this.bestEl.textContent = this.bestScore; }
    checkWin() { return this.grid.some(row=>row.includes(2048)); }
    checkLose() {
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) if (this.grid[i][j]===0) return false;
        for (let i=0;i<this.size;i++) for (let j=0;j<this.size;j++) {
            if (j<this.size-1 && this.grid[i][j]===this.grid[i][j+1]) return false;
            if (i<this.size-1 && this.grid[i][j]===this.grid[i+1][j]) return false;
        }
        return true;
    }
    submitScore() {
        if (!currentUserId) return;
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) return;
        fetch(WORKER_URL+'/submit-score', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId:currentUserId.toString(), firstName:user.first_name||'Игрок', username:user.username||'', score:this.score, avatarUrl:user.photo_url||'' })
        }).then(()=>{ fetchLeaderboard(); updateBalanceDisplay(); }).catch(()=>{});
    }
    setupSwipe() {
        let sx=0, sy=0;
        this.boardEl.addEventListener('touchstart', e => { sx=e.touches[0].clientX; sy=e.touches[0].clientY; e.preventDefault(); });
        this.boardEl.addEventListener('touchend', e => {
            if (!sx && !sy) return;
            const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx)<20 && Math.abs(dy)<20) return;
            if (Math.abs(dx)>Math.abs(dy)) this.move(dx>0?'right':'left');
            else this.move(dy>0?'down':'up');
            sx=sy=0; vibrate();
        });
    }
    setupKeys() {
        window.addEventListener('keydown', e => {
            if (!document.getElementById('game-section').classList.contains('active')) return;
            const k = e.key;
            if (k==='ArrowLeft') { this.move('left'); e.preventDefault(); vibrate(); }
            else if (k==='ArrowRight') { this.move('right'); e.preventDefault(); vibrate(); }
            else if (k==='ArrowUp') { this.move('up'); e.preventDefault(); vibrate(); }
            else if (k==='ArrowDown') { this.move('down'); e.preventDefault(); vibrate(); }
        });
    }
    applySkin(skinId) {
        this.currentSkin = skinId;
        localStorage.setItem('selectedSkin', skinId);
        this.render();
    }
    resetGame() { this.init(); }
}
let game2048;
function initGame2048() {
    const board = document.getElementById('game-board-2048');
    const scoreEl = document.getElementById('game-score');
    const bestEl = document.getElementById('best-score');
    const statusEl = document.getElementById('game-status');
    if (board && scoreEl && bestEl && statusEl && !game2048) {
        game2048 = new Game2048(board, scoreEl, bestEl, statusEl);
        document.getElementById('new-game-btn').addEventListener('click', () => { vibrate(); game2048.resetGame(); });
    }
}

// ==================== АККОРДЕОН КАРТОЧЕК ====================
function setupGameTabs() {
    const tabs = document.querySelectorAll('.game-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.gameTab;
            const isActive = tab.classList.contains('active');
            // Закрываем все
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.game-tab-content').forEach(c => c.classList.remove('active'));
            if (!isActive) {
                // Открываем выбранную
                tab.classList.add('active');
                const content = document.getElementById(`game-tab-${target}`);
                if (content) content.classList.add('active');
                if (target === 'leaderboard') fetchLeaderboard();
                else if (target === 'transfer') updateBalanceDisplay();
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
        const players = data.leaderboard || [];
        renderLeaderboard(players);
    } catch(e) {
        list.innerHTML = '<div class="leaderboard-loading">Ошибка загрузки</div>';
    }
}
function renderLeaderboard(players) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    if (!players.length) { list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>'; return; }
    list.innerHTML = players.map((p,i) => {
        const isMe = currentUserId && p.userId.toString() === currentUserId.toString();
        const avatar = p.avatarUrl ? `<img src="${p.avatarUrl}" alt="${p.firstName}" onerror="this.parentElement.textContent='${p.firstName.charAt(0).toUpperCase()}';">` : p.firstName.charAt(0).toUpperCase();
        return `<div class="leaderboard-item ${isMe?'current-user':''}">
            <div class="leaderboard-rank">#${i+1}</div>
            <div class="leaderboard-avatar">${avatar}</div>
            <div class="leaderboard-info"><div class="leaderboard-name">${escapeHtml(p.firstName)}</div></div>
            <div class="leaderboard-score">${p.score} <span>коин.</span></div>
        </div>`;
    }).join('');
}
function setupLeaderboardRefresh() {
    document.getElementById('refresh-leaderboard')?.addEventListener('click', ()=>{ vibrate(); fetchLeaderboard(); });
}

// ==================== ПЕРЕВОД ПО НИКНЕЙМУ ====================
function setupTransferForm() {
    document.getElementById('btn-transfer-submit').addEventListener('click', initiateTransferByUsername);
    document.getElementById('transfer-amount-input').addEventListener('input', function() {
        const max = getCurrentBalanceFromDisplay();
        if (parseInt(this.value) > max) this.value = max;
    });
}
async function initiateTransferByUsername() {
    const username = document.getElementById('transfer-username-input').value.trim().replace(/^@/, '');
    const amount = parseInt(document.getElementById('transfer-amount-input').value);
    const resultDiv = document.getElementById('transfer-result-message');
    resultDiv.textContent = '';
    if (!username || !amount || amount<=0) { resultDiv.textContent = 'Введите корректный никнейм и сумму'; return; }
    const myBalance = getCurrentBalanceFromDisplay();
    if (amount > myBalance) { resultDiv.textContent = 'Недостаточно коинов'; return; }
    if (!currentUserId) { resultDiv.textContent = 'Авторизуйтесь в Telegram'; return; }
    try {
        const findRes = await fetch(`${WORKER_URL}/find-user?username=${encodeURIComponent(username)}`);
        if (!findRes.ok) throw new Error('not found');
        const findData = await findRes.json();
        if (!findData.userId) throw new Error('not found');
        const transferRes = await fetch(WORKER_URL+'/transfer', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ fromUserId:currentUserId.toString(), toUserId:findData.userId.toString(), amount })
        });
        if (!transferRes.ok) throw new Error('transfer failed');
        const transferData = await transferRes.json();
        if (transferData.success) {
            resultDiv.textContent = `Переведено ${amount} коин. пользователю @${username}`;
            updateBalanceDisplay();
            fetchLeaderboard();
        } else {
            resultDiv.textContent = transferData.error || 'Ошибка перевода';
        }
    } catch(err) {
        document.getElementById('transfer-fallback').style.display = 'block';
        window.pendingTransferAmount = amount;
        document.getElementById('btn-share-fallback').onclick = shareTransferLink;
    }
}
function shareTransferLink() {
    const amount = window.pendingTransferAmount || 0;
    if (!currentUserId || amount<=0) return;
    const refLink = `https://t.me/${BOT_USERNAME}?start=transfer_${currentUserId}_${amount}`;
    const text = `Прими мой перевод ${amount} коинов в Games Verse! Перейди по ссылке и получи их.`;
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`);
    } else if (navigator.share) {
        navigator.share({ title:'Games Verse', text, url:refLink }).catch(() => copyToClipboard(refLink));
    } else copyToClipboard(refLink);
}
function getCurrentBalanceFromDisplay() {
    const text = document.getElementById('user-balance-display')?.textContent || '0';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

// ==================== МАГАЗИН СКИНОВ (БЕСПЛАТНЫЙ) ====================
function setupShop() {
    renderSkins();
}
function renderSkins() {
    const grid = document.getElementById('skins-grid');
    if (!grid) return;
    const currentSkin = localStorage.getItem('selectedSkin') || 'classic';
    // Все скины теперь доступны без покупки, поэтому список купленных игнорируем
    grid.innerHTML = SKINS.map(skin => {
        const isActive = currentSkin === skin.id;
        let btnHtml = '';
        if (isActive) {
            btnHtml = '<button class="active-skin" disabled>Выбрано</button>';
        } else {
            btnHtml = `<button class="apply-skin" data-skin="${skin.id}">Применить</button>`;
        }
        return `<div class="skin-card">
            <div class="skin-preview">${skin.preview}</div>
            <div class="skin-info"><div class="skin-name">${skin.name}</div><div class="skin-price">Бесплатно</div></div>
            <div class="skin-action">${btnHtml}</div>
        </div>`;
    }).join('');

    // Обработчики кнопок "Применить"
    document.querySelectorAll('.apply-skin').forEach(btn => {
        btn.addEventListener('click', function() {
            const skinId = this.dataset.skin;
            if (game2048) game2048.applySkin(skinId);
            showNotification('Скин применён');
            renderSkins(); // обновить список, чтобы показать "Выбрано"
        });
    });
}

// ==================== УТИЛИТЫ ====================
function escapeHtml(text) { const m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}; return text.replace(/[&<>"']/g,c=>m[c]); }
function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).then(()=>showNotification('Скопировано')).catch(()=>{
        const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        showNotification('Скопировано');
    });
}
function showNotification(msg) {
    const el = document.getElementById('notification'); el.textContent = msg;
    el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 2000);
}

// ==================== НАСТРОЙКИ ====================
function setupSettingsPanel() {
    document.getElementById('settings-button').addEventListener('click', ()=>{ vibrate(); document.getElementById('settings-panel').classList.add('active'); });
    document.getElementById('close-settings').addEventListener('click', ()=>{ vibrate(); document.getElementById('settings-panel').classList.remove('active'); });
    document.getElementById('settings-panel').addEventListener('click', function(e){ if(e.target===this) this.classList.remove('active'); });
    document.querySelectorAll('.theme-option').forEach(opt => opt.addEventListener('click', function(){
        vibrate();
        document.querySelectorAll('.theme-option').forEach(o=>o.classList.remove('active'));
        this.classList.add('active');
        if (this.dataset.theme==='dark') document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', this.dataset.theme);
    }));
}
function loadThemePreference() {
    const saved = localStorage.getItem('theme')||'light';
    if (saved==='dark') document.body.classList.add('dark-theme');
    document.querySelectorAll('.theme-option').forEach(o=>o.classList.toggle('active', o.dataset.theme===saved));
}
