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
    // Начальная загрузка лидеров
    fetchLeaderboard();
});

function initializeTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready(); tg.expand();
    }
}

// ==================== НАВИГАЦИЯ (основные вкладки) ====================
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

            if (target === 'game-section') {
                fetchLeaderboard();
                updateBalanceFromServer();
            } else if (target === 'tasks-section') renderTasks();
            else if (target === 'referrals-section') updateReferralInfo();
        });
    });
    const active = document.querySelector('.content-section.active');
    if (active) {
        toggleHeader(active.id);
        if (active.id === 'game-section') {
            fetchLeaderboard();
            updateBalanceFromServer();
        } else if (active.id === 'tasks-section') renderTasks();
        else if (active.id === 'referrals-section') updateReferralInfo();
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

// ==================== ПОЛЬЗОВАТЕЛЬ ====================
function loadUserData() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (user) {
        currentUserId = user.id;
        updateReferralInfo();
        updateBalanceFromServer();
    } else {
        currentUserId = null;
    }
}

async function updateBalanceFromServer() {
    if (!currentUserId) {
        document.getElementById('user-balance-display').textContent = 'Ваш баланс: 0 очк.';
        return;
    }
    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        const me = (data.leaderboard || []).find(p => p.userId.toString() === currentUserId.toString());
        document.getElementById('user-balance-display').textContent = me ? `Ваш баланс: ${me.score} очк.` : 'Ваш баланс: 0 очк.';
    } catch(e) {
        document.getElementById('user-balance-display').textContent = 'Ваш баланс: 0 очк.';
    }
}

// ==================== РЕФЕРАЛЫ ====================
function updateReferralInfo() {
    const linkText = document.getElementById('referral-link-text');
    if (!linkText) return;
    const refLink = currentUserId
        ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}`
        : `https://t.me/${BOT_USERNAME}`;
    linkText.textContent = refLink;
    document.getElementById('referral-count').textContent = '0'; // заглушка
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

function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).then(() => showNotification('Ссылка скопирована')).catch(() => {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        showNotification('Ссылка скопирована');
    });
}

// ==================== ЗАДАНИЯ ====================
function renderTasks() {
    const gamesGrid = document.getElementById('tasks-games-grid');
    const exchangesGrid = document.getElementById('tasks-exchanges-grid');
    if (!gamesGrid || !exchangesGrid) return;

    gamesGrid.innerHTML = GAMES_DATA.map(game => `
        <div class="task-card">
            <div class="task-image"><img src="${game.image}" alt="${game.name}" onerror="this.parentElement.innerHTML='<span style=font-size:20px>${game.fallback}</span>'"></div>
            <div class="task-info"><h4>${game.name}</h4><p>${game.description}</p></div>
            <button class="task-action-btn" data-link="${game.fullLink}">Играть</button>
        </div>
    `).join('');
    exchangesGrid.innerHTML = EXCHANGES_DATA.map(ex => `
        <div class="task-card">
            <div class="task-image"><img src="${ex.image}" alt="${ex.name}" onerror="this.parentElement.innerHTML='<span style=font-size:20px>${ex.fallback}</span>'"></div>
            <div class="task-info"><h4>${ex.name}</h4><p>${ex.description}</p></div>
            <button class="task-action-btn" data-link="${ex.url}">Перейти</button>
        </div>
    `).join('');
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
    // (полный код без изменений, как в предыдущем ответе)
    // ...
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

// ==================== ПОДВКЛАДКИ В ИГРЕ (Топ / Перевести / Ускорение) ====================
function setupGameTabs() {
    const tabs = document.querySelectorAll('.game-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.gameTab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.game-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`game-tab-${target}`).classList.add('active');
            if (target === 'leaderboard') fetchLeaderboard();
            else if (target === 'transfer') updateBalanceFromServer();
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
    if (!players.length) {
        list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>';
        return;
    }
    list.innerHTML = players.map((p, i) => {
        const isMe = currentUserId && p.userId.toString() === currentUserId.toString();
        const avatar = p.avatarUrl
            ? `<img src="${p.avatarUrl}" alt="${p.firstName}" onerror="this.parentElement.textContent='${p.firstName.charAt(0).toUpperCase()}';">`
            : p.firstName.charAt(0).toUpperCase();
        return `<div class="leaderboard-item ${isMe ? 'current-user' : ''}">
            <div class="leaderboard-rank">#${i + 1}</div>
            <div class="leaderboard-avatar">${avatar}</div>
            <div class="leaderboard-info"><div class="leaderboard-name">${escapeHtml(p.firstName)}</div></div>
            <div class="leaderboard-score">${p.score} <span>очк.</span></div>
        </div>`;
    }).join('');
}

function setupLeaderboardRefresh() {
    document.getElementById('refresh-leaderboard')?.addEventListener('click', () => { vibrate(); fetchLeaderboard(); });
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

    if (!username || !amount || amount <= 0) {
        resultDiv.textContent = 'Введите корректный никнейм и сумму';
        return;
    }
    const myBalance = getCurrentBalanceFromDisplay();
    if (amount > myBalance) {
        resultDiv.textContent = 'Недостаточно очков';
        return;
    }
    if (!currentUserId) {
        resultDiv.textContent = 'Авторизуйтесь в Telegram';
        return;
    }

    // Пытаемся найти пользователя по username через бэкенд
    try {
        const findRes = await fetch(`${WORKER_URL}/find-user?username=${encodeURIComponent(username)}`);
        if (!findRes.ok) throw new Error('not found');
        const findData = await findRes.json();
        if (!findData.userId) throw new Error('not found');

        // Пользователь найден, выполняем перевод
        const transferRes = await fetch(WORKER_URL + '/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromUserId: currentUserId.toString(),
                toUserId: findData.userId.toString(),
                amount: amount
            })
        });
        if (!transferRes.ok) throw new Error('transfer failed');
        const transferData = await transferRes.json();
        if (transferData.success) {
            resultDiv.textContent = `Переведено ${amount} очк. пользователю @${username}`;
            updateBalanceFromServer();
            fetchLeaderboard();
        } else {
            resultDiv.textContent = transferData.error || 'Ошибка перевода';
        }
    } catch (err) {
        // Пользователь не найден – показываем fallback с реферальной ссылкой
        document.getElementById('transfer-fallback').style.display = 'block';
        // Сохраняем сумму для ссылки
        window.pendingTransferAmount = amount;
        document.getElementById('btn-share-fallback').onclick = shareTransferLink;
    }
}

function shareTransferLink() {
    const amount = window.pendingTransferAmount || 0;
    if (!currentUserId || amount <= 0) return;
    const refLink = `https://t.me/${BOT_USERNAME}?start=transfer_${currentUserId}_${amount}`;
    const text = `Прими мой перевод ${amount} очков в Games Verse! Перейди по ссылке и получи их.`;
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

function escapeHtml(text) {
    const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== НАСТРОЙКИ ====================
function setupSettingsPanel() {
    document.getElementById('settings-button').addEventListener('click', () => {
        vibrate(); document.getElementById('settings-panel').classList.add('active');
    });
    document.getElementById('close-settings').addEventListener('click', () => {
        vibrate(); document.getElementById('settings-panel').classList.remove('active');
    });
    document.getElementById('settings-panel').addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });
    document.querySelectorAll('.theme-option').forEach(opt => opt.addEventListener('click', function() {
        vibrate();
        document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        if (this.dataset.theme === 'dark') document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', this.dataset.theme);
    }));
}

function loadThemePreference() {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.body.classList.add('dark-theme');
    document.querySelectorAll('.theme-option').forEach(o => o.classList.toggle('active', o.dataset.theme === saved));
}

function showNotification(msg) {
    const el = document.getElementById('notification');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
}

// ==================== ВСТАВЬТЕ ПОЛНЫЙ КЛАСС GAME2048 ИЗ ПРЕДЫДУЩЕГО ОТВЕТА ====================
// (Здесь должен быть полный код класса Game2048, как в предыдущем ответе, чтобы игра работала)
