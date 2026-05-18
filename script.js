// ==================== КОНФИГ ====================
const BOT_USERNAME = 'khadron_bot';
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';
let currentUserId = null;
let gameInterval = null;
let lastSentBalance = 0;
let throttleTimer = null;

// ДАННЫЕ ДЛЯ ЗАДАНИЙ (игры + биржи)
const GAMES_DATA = [
    { id: 0, name: "Pixel World", fullLink: "https://t.me/pixelworld/play?startapp=r6823288584", description: "3D-шутер в Telegram", rating: 4.9, players: "34K", image: "images/photo_2026-02-17_13-44-55.jpg", fallback: "🌍", badge: "Beta", highlight: true },
    { id: 1, name: "Hamster GameDev", fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584", description: "Создай свою студию", rating: 4.7, players: "368K", image: "images/hamster-gamedev.jpg", fallback: "🎮" },
    { id: 2, name: "Hamster King", fullLink: "https://t.me/hamsterking_game_bot?startapp=6823288584", description: "Стань королем хомяков", rating: 4.2, players: "188K", image: "images/hamster-king.jpg", fallback: "👑" },
    { id: 3, name: "Hamster Fight Club", fullLink: "https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5", description: "Бойцовский клуб хомяков", rating: 4.9, players: "85K", image: "images/hamster-fightclub.jpg", fallback: "🥊" },
    { id: 4, name: "BitQuest", fullLink: "https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584", description: "Приключения в мире крипты", rating: 3.8, players: "281K", image: "images/bitquest.jpg", fallback: "💰" }
];
const EXCHANGES_DATA = [
    { id: 1, name: "Bybit", url: "https://www.bybit.com/invite?ref=57KXPMO", description: "Продвинутая платформа", image: "images/bybit.jpg", fallback: "💱" },
    { id: 2, name: "BingX", url: "https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description: "Социальная торговля", image: "images/bingx.jpg", fallback: "📈" },
    { id: 3, name: "Bitget", url: "https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H", description: "Инновационная биржа", image: "images/bitget.jpg", fallback: "⚡" },
    { id: 4, name: "MEXC", url: "https://promote.mexc.com/r/aTSLfdm54W", description: "Низкие комиссии", image: "images/mexc.jpg", fallback: "🌍" }
];

// ==================== СОСТОЯНИЕ КЛИКЕРА ====================
let clickerState = {
    balance: 0,
    clickPower: 1.0,
    passiveIncome: 0.0,
    upgrades: {
        click: [false, false, false, false],   // 0.001, 0.003, 0.01, 0.03
        auto: [false, false, false, false]
    }
};
const UPGRADES_CLICK = [
    { name: "Ускорение +0.001", cost: 0.195, effect: 0.001, bought: false },
    { name: "Ускорение +0.003", cost: 0.286, effect: 0.003, bought: false },
    { name: "Ускорение +0.01", cost: 1.300, effect: 0.01, bought: false },
    { name: "Ускорение +0.03", cost: 50.000, effect: 0.03, bought: false }
];
const UPGRADES_AUTO = [
    { name: "Автокликер +0.001/сек", cost: 0.195, effect: 0.001, bought: false },
    { name: "Автокликер +0.003/сек", cost: 0.286, effect: 0.003, bought: false },
    { name: "Автокликер +0.01/сек", cost: 1.300, effect: 0.01, bought: false },
    { name: "Автокликер +0.03/сек", cost: 50.000, effect: 0.03, bought: false }
];

// Загрузка из localStorage
function loadClickerState() {
    const saved = localStorage.getItem('tapverse_state');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            clickerState.balance = data.balance || 0;
            clickerState.clickPower = data.clickPower || 1.0;
            clickerState.passiveIncome = data.passiveIncome || 0.0;
            if (data.upgrades) {
                clickerState.upgrades = data.upgrades;
            }
            // синхронизация массивов улучшений
            for (let i = 0; i < UPGRADES_CLICK.length; i++) {
                UPGRADES_CLICK[i].bought = clickerState.upgrades.click[i] || false;
            }
            for (let i = 0; i < UPGRADES_AUTO.length; i++) {
                UPGRADES_AUTO[i].bought = clickerState.upgrades.auto[i] || false;
            }
        } catch(e) {}
    }
    updateUIFromState();
}
function saveClickerState() {
    clickerState.upgrades.click = UPGRADES_CLICK.map(u => u.bought);
    clickerState.upgrades.auto = UPGRADES_AUTO.map(u => u.bought);
    localStorage.setItem('tapverse_state', JSON.stringify(clickerState));
}
function updateUIFromState() {
    document.getElementById('balance').innerText = clickerState.balance.toFixed(3);
    document.getElementById('click-power').innerText = clickerState.clickPower.toFixed(3);
    document.getElementById('passive-income').innerText = clickerState.passiveIncome.toFixed(3);
    renderUpgrades();
}
function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    let html = '<div style="margin-bottom:12px"><strong>⚡ Улучшения клика</strong></div>';
    UPGRADES_CLICK.forEach((up, idx) => {
        html += `
            <div class="upgrade-card">
                <div class="upgrade-info"><h4>${up.name}</h4><p>+${up.effect} к силе клика</p></div>
                <div class="upgrade-price">${up.cost.toFixed(3)} мон.</div>
                <button class="buy-upgrade" data-type="click" data-idx="${idx}" ${up.bought ? 'disabled style="opacity:0.5"' : ''}>${up.bought ? 'Куплено' : 'Купить'}</button>
            </div>
        `;
    });
    html += '<div style="margin:16px 0 12px"><strong>🤖 Автоматические улучшения (доход/сек)</strong></div>';
    UPGRADES_AUTO.forEach((up, idx) => {
        html += `
            <div class="upgrade-card">
                <div class="upgrade-info"><h4>${up.name}</h4><p>+${up.effect} монет/сек</p></div>
                <div class="upgrade-price">${up.cost.toFixed(3)} мон.</div>
                <button class="buy-upgrade" data-type="auto" data-idx="${idx}" ${up.bought ? 'disabled style="opacity:0.5"' : ''}>${up.bought ? 'Куплено' : 'Купить'}</button>
            </div>
        `;
    });
    container.innerHTML = html;
    // вешаем обработчики
    document.querySelectorAll('.buy-upgrade').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.type;
            const idx = parseInt(btn.dataset.idx);
            buyUpgrade(type, idx);
        });
    });
}
function buyUpgrade(type, idx) {
    let upgrade = type === 'click' ? UPGRADES_CLICK[idx] : UPGRADES_AUTO[idx];
    if (upgrade.bought) return;
    if (clickerState.balance >= upgrade.cost) {
        clickerState.balance -= upgrade.cost;
        upgrade.bought = true;
        if (type === 'click') {
            clickerState.clickPower += upgrade.effect;
            clickerState.upgrades.click[idx] = true;
        } else {
            clickerState.passiveIncome += upgrade.effect;
            clickerState.upgrades.auto[idx] = true;
        }
        saveClickerState();
        updateUIFromState();
        sendScoreToLeaderboard(true); // отправить обновление после покупки
        showNotification(`Куплено: ${upgrade.name}`);
    } else {
        showNotification("Не хватает монет!");
    }
}
function handleTap() {
    let gain = clickerState.clickPower;
    clickerState.balance += gain;
    saveClickerState();
    updateUIFromState();
    // анимация монеты
    const coinDiv = document.getElementById('coin-tap');
    coinDiv.style.transform = 'scale(0.9)';
    setTimeout(() => { coinDiv.style.transform = ''; }, 80);
    // отправка счёта с ограничением
    sendScoreToLeaderboard(false);
}
function startPassiveIncome() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        if (clickerState.passiveIncome > 0) {
            clickerState.balance += clickerState.passiveIncome;
            saveClickerState();
            updateUIFromState();
            sendScoreToLeaderboard(false);
        }
    }, 1000);
}
function sendScoreToLeaderboard(force = false) {
    if (!currentUserId) return;
    const now = Date.now();
    if (!force && throttleTimer && now - throttleTimer < 3000) return;
    throttleTimer = now;
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) return;
    fetch(WORKER_URL + '/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: currentUserId.toString(),
            firstName: user.first_name || 'Игрок',
            username: user.username || '',
            score: Math.floor(clickerState.balance),
            avatarUrl: user.photo_url || ''
        })
    }).catch(e => console.warn);
}
async function fetchTapLeaderboard() {
    const listDiv = document.getElementById('tap-leaderboard-list');
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        const leaderboard = data.leaderboard || [];
        if (!leaderboard.length) { listDiv.innerHTML = '<div>Нет результатов</div>'; return; }
        let html = '';
        leaderboard.slice(0, 20).forEach((player, idx) => {
            const isCurrent = currentUserId && player.userId.toString() === currentUserId.toString();
            html += `
                <div class="leaderboard-item ${isCurrent ? 'current-user' : ''}" style="${isCurrent ? 'background: var(--primary-gradient); color:white' : ''}">
                    <div class="leaderboard-rank">#${idx+1}</div>
                    <div class="leaderboard-avatar">${player.firstName?.charAt(0).toUpperCase() || '?'}</div>
                    <div class="leaderboard-info"><div class="leaderboard-name">${escapeHtml(player.firstName)}</div></div>
                    <div class="leaderboard-score">${Math.floor(player.score)}</div>
                </div>
            `;
        });
        listDiv.innerHTML = html;
    } catch(e) { listDiv.innerHTML = '<div>Ошибка загрузки</div>'; }
}
function escapeHtml(str) { return String(str).replace(/[&<>]/g, function(m){ if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }

// ==================== ЗАДАНИЯ (ИГРЫ И БИРЖИ) ====================
function renderTasks() {
    const gamesGrid = document.getElementById('games-grid');
    if(gamesGrid) {
        gamesGrid.innerHTML = GAMES_DATA.map(game => `
            <div class="game-card">
                <div class="game-image">${game.fallback}</div>
                <div class="game-info"><h3>${game.name}</h3><p class="game-description">${game.description}</p></div>
                <button class="play-button" data-link="${game.fullLink}">Играть</button>
            </div>
        `).join('');
        document.querySelectorAll('.play-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const link = btn.dataset.link;
                if(link) window.Telegram?.WebApp?.openTelegramLink(link) || window.open(link,'_blank');
            });
        });
    }
    const exchangesDiv = document.getElementById('exchanges-list');
    if(exchangesDiv) {
        exchangesDiv.innerHTML = EXCHANGES_DATA.map(ex => `
            <div class="exchange-card">
                <div class="exchange-logo">${ex.fallback}</div>
                <div class="exchange-info"><h3>${ex.name}</h3><p>${ex.description}</p></div>
                <button class="exchange-button" data-url="${ex.url}">Перейти</button>
            </div>
        `).join('');
        document.querySelectorAll('.exchange-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = btn.dataset.url;
                if(url) window.Telegram?.WebApp?.openLink(url) || window.open(url,'_blank');
            });
        });
    }
}

// ==================== ПРОФИЛЬ, ТЕМА, НАВИГАЦИЯ ====================
function initTelegramUser() {
    if(window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        currentUserId = user.id;
        document.getElementById('user-name').innerText = user.first_name + (user.last_name ? ' '+user.last_name : '');
        document.getElementById('user-username').innerText = user.username ? '@'+user.username : 'Telegram User';
        const avatarSpan = document.getElementById('avatar-fallback');
        if(avatarSpan) avatarSpan.innerText = user.first_name?.charAt(0).toUpperCase() || 'T';
        if(user.is_premium) document.querySelector('.profile-info')?.insertAdjacentHTML('beforeend','<div class="premium-badge">⭐ Premium</div>');
        // отправка статистики
        fetch(WORKER_URL + '/track', {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId: user.id.toString(), firstName: user.first_name, username: user.username, ref: null })
        }).catch(e=>console.warn);
    } else {
        document.getElementById('user-name').innerText = 'Гость';
        document.getElementById('user-username').innerText = 'Открой в Telegram';
    }
}
function setupNav() {
    const navs = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    navs.forEach(nav => {
        nav.addEventListener('click', () => {
            const target = nav.dataset.section;
            navs.forEach(n=>n.classList.remove('active'));
            nav.classList.add('active');
            sections.forEach(sec=>sec.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            if(target === 'tap-section') fetchTapLeaderboard();
            const header = document.querySelector('.header');
            if(target === 'tap-section' || target === 'profile-section') header.style.display = 'block';
            else header.style.display = 'block';
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('splash-screen')?.remove();
    initTelegramUser();
    loadClickerState();
    renderTasks();
    setupNav();
    // кликер
    document.getElementById('coin-tap')?.addEventListener('click', handleTap);
    document.getElementById('force-save-btn')?.addEventListener('click', () => { sendScoreToLeaderboard(true); showNotification('Прогресс сохранён!'); });
    document.getElementById('refresh-leaderboard-tap')?.addEventListener('click', fetchTapLeaderboard);
    startPassiveIncome();
    fetchTapLeaderboard();
    // тема
    const savedTheme = localStorage.getItem('theme') || 'light';
    if(savedTheme === 'dark') document.body.classList.add('dark-theme');
    document.querySelectorAll('.theme-option').forEach(opt => {
        if(opt.dataset.theme === savedTheme) opt.classList.add('active');
        opt.addEventListener('click', () => {
            const theme = opt.dataset.theme;
            document.body.classList.toggle('dark-theme', theme === 'dark');
            localStorage.setItem('theme', theme);
            document.querySelectorAll('.theme-option').forEach(o=>o.classList.remove('active'));
            opt.classList.add('active');
        });
    });
    document.getElementById('settings-button')?.addEventListener('click',()=>document.getElementById('settings-panel').classList.add('active'));
    document.getElementById('close-settings')?.addEventListener('click',()=>document.getElementById('settings-panel').classList.remove('active'));
    document.getElementById('share-friends-button')?.addEventListener('click',()=>{
        const link = `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId || ''}`;
        window.Telegram?.WebApp?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Зарабатывай монеты в TapVerse!`);
    });
    window.addEventListener('beforeunload', () => sendScoreToLeaderboard(true));
});
function showNotification(msg) {
    const notif = document.getElementById('notification');
    notif.innerText = msg;
    notif.classList.add('show');
    setTimeout(()=>notif.classList.remove('show'), 2000);
}
