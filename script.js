// ==================== КОНФИГУРАЦИЯ ====================
const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

// ... (GAMES_DATA, EXCHANGES_DATA, translations остаются без изменений)
const GAMES_DATA = [
    {
        id: 0, name: "Pixel World", fullLink: "https://t.me/pixelworld/play?startapp=r6823288584",
        description: "Первый 3D-шутер в Telegram", rating: 4.9, players: "34K",
        image: "images/photo_2026-02-17_13-44-55.jpg", fallback: "🌍", badge: "Beta", highlight: true
    },
    {
        id: 1, name: "Hamster GameDev", fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584",
        description: "Создай свою студию", rating: 4.7, players: "368K",
        image: "images/hamster-gamedev.jpg", fallback: "🎮"
    },
    {
        id: 2, name: "Hamster King", fullLink: "https://t.me/hamsterking_game_bot?startapp=6823288584",
        description: "Стань королем хомяков", rating: 4.2, players: "188K",
        image: "images/hamster-king.jpg", fallback: "👑"
    },
    {
        id: 3, name: "Hamster Fight Club", fullLink: "https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5",
        description: "Бойцовский клуб хомяков", rating: 4.9, players: "85K",
        image: "images/hamster-fightclub.jpg", fallback: "🥊"
    },
    {
        id: 4, name: "BitQuest", fullLink: "https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584",
        description: "Приключения в мире крипты", rating: 3.8, players: "281K",
        image: "images/bitquest.jpg", fallback: "💰"
    }
];
const EXCHANGES_DATA = [
    { id:1, name:"Bybit", url:"https://www.bybit.com/invite?ref=57KXPMO", description:"Продвинутая торговая платформа", image:"images/bybit.jpg", fallback:"💱" },
    { id:2, name:"BingX", url:"https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description:"Социальная торговля", image:"images/bingx.jpg", fallback:"📈" },
    { id:3, name:"Bitget", url:"https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H", description:"Инновационная платформа", image:"images/bitget.jpg", fallback:"⚡" },
    { id:4, name:"MEXC", url:"https://promote.mexc.com/r/aTSLfdm54W", description:"Глобальная биржа", image:"images/mexc.jpg", fallback:"🌍" }
];
const translations = {
    appTitle: "Games Verse", settings: "Настройки", theme: "Тема",
    lightTheme: "Светлая", darkTheme: "Темная", done: "Готово", games: "Игры",
    bestGames: "Лучшие игры Telegram", play: "Играть", exchanges: "Биржи",
    exchangesDesc: "Торгуйте криптовалютами безопасно", user: "Пользователь",
    shareWithFriends: "Поделиться с друзьями", profile: "Профиль",
    linkCopied: "Ссылка скопирована в буфер обмена!", go: "Перейти",
    game2048: "2048", score: "Счёт", best: "Лучший", newGame: "Новая игра",
    swipeHint: "👆 Свайпайте пальцем или используйте стрелки",
    gameWin: "Вы победили! 🎉", gameLose: "Игра окончена! 😔"
};

// ... (функции vibrate, initializeApp, initializeTelegramWebApp и т.д. остаются, кроме изменений ниже)
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
    setupGameTabs();           // новая функция переключения карточек
    setupTransferModal();      // модальное окно перевода
}

// ... (остальные функции до leaderboard остаются без изменений)

// ==================== LEADERBOARD (обновлено для работы с табами) ====================
async function fetchLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    const transferList = document.getElementById('transfer-list');
    if (leaderboardList) leaderboardList.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
    if (transferList) transferList.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';

    try {
        const res = await fetch(WORKER_URL + '/leaderboard');
        const data = await res.json();
        const players = data.leaderboard || [];
        renderLeaderboard(players);
        renderTransferList(players);
        updateCurrentBalanceFromLeaderboard(players);
    } catch (err) {
        console.error('Ошибка загрузки лидеров:', err);
        if (leaderboardList) leaderboardList.innerHTML = '<div class="leaderboard-loading">Не удалось загрузить таблицу</div>';
        if (transferList) transferList.innerHTML = '<div class="leaderboard-loading">Ошибка загрузки</div>';
    }
}

function renderLeaderboard(players) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    if (!players.length) {
        list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>';
        return;
    }
    list.innerHTML = players.map((player, index) => {
        const isCurrentUser = currentUserId && player.userId.toString() === currentUserId.toString();
        const rank = index + 1;
        const avatarContent = player.avatarUrl
            ? `<img src="${player.avatarUrl}" alt="${player.firstName}" onerror="this.parentElement.textContent='${player.firstName.charAt(0).toUpperCase()}';" />`
            : player.firstName.charAt(0).toUpperCase();
        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                <div class="leaderboard-rank">#${rank}</div>
                <div class="leaderboard-avatar">${avatarContent}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${escapeHtml(player.firstName)}</div>
                </div>
                <div class="leaderboard-score">${player.score} <span>очк.</span></div>
            </div>
        `;
    }).join('');
}

function renderTransferList(players) {
    const list = document.getElementById('transfer-list');
    if (!list) return;
    if (!players.length) {
        list.innerHTML = '<div class="leaderboard-loading">Список пуст</div>';
        return;
    }
    // Не показываем самого себя в списке для перевода
    const others = players.filter(p => p.userId.toString() !== currentUserId?.toString());
    if (others.length === 0) {
        list.innerHTML = '<div class="leaderboard-loading">Нет других игроков</div>';
        return;
    }
    list.innerHTML = others.map(player => {
        const avatarContent = player.avatarUrl
            ? `<img src="${player.avatarUrl}" alt="${player.firstName}" onerror="this.parentElement.textContent='${player.firstName.charAt(0).toUpperCase()}';" />`
            : player.firstName.charAt(0).toUpperCase();
        return `
            <div class="transfer-item">
                <div class="transfer-avatar">${avatarContent}</div>
                <div class="transfer-info">
                    <div class="transfer-name">${escapeHtml(player.firstName)}</div>
                    <div class="transfer-score">${player.score} очк.</div>
                </div>
                <div class="transfer-action">
                    <button class="btn-transfer" data-userid="${player.userId}" data-username="${escapeHtml(player.firstName)}">Перевести</button>
                </div>
            </div>
        `;
    }).join('');

    // Вешаем обработчики на кнопки "Перевести"
    document.querySelectorAll('.btn-transfer').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userid;
            const userName = this.dataset.username;
            openTransferModal(userId, userName);
        });
    });
}

function updateCurrentBalanceFromLeaderboard(players) {
    if (!currentUserId) return;
    const me = players.find(p => p.userId.toString() === currentUserId.toString());
    const balanceEl = document.getElementById('user-balance-display');
    if (balanceEl) {
        balanceEl.textContent = me ? `Ваш баланс: ${me.score} очк.` : 'Ваш баланс: 0 очк.';
    }
}

// ==================== ПЕРЕВОД ОЧКОВ ====================
let transferTargetUserId = null;
let transferTargetUserName = '';

function setupTransferModal() {
    const modal = document.getElementById('transfer-modal');
    const cancelBtn = document.getElementById('transfer-cancel');
    const confirmBtn = document.getElementById('transfer-confirm');
    const amountInput = document.getElementById('transfer-amount-input');

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        transferTargetUserId = null;
    });
    confirmBtn.addEventListener('click', executeTransfer);
    // Закрытие по клику на фон
    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('active');
        transferTargetUserId = null;
    });
    // Ограничение ввода
    amountInput.addEventListener('input', () => {
        const max = getCurrentBalance();
        if (parseInt(amountInput.value) > max) amountInput.value = max;
    });
}

function openTransferModal(userId, userName) {
    if (!currentUserId) {
        showNotification('Авторизуйтесь в Telegram');
        return;
    }
    transferTargetUserId = userId;
    transferTargetUserName = userName;
    const modal = document.getElementById('transfer-modal');
    document.getElementById('transfer-target-name').textContent = `Получатель: ${userName}`;
    const amountInput = document.getElementById('transfer-amount-input');
    amountInput.value = '';
    const max = getCurrentBalance();
    document.getElementById('transfer-max-hint').textContent = `Максимум: ${max} очк.`;
    modal.classList.add('active');
}

function getCurrentBalance() {
    const balanceText = document.getElementById('user-balance-display')?.textContent || '0';
    const match = balanceText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

async function executeTransfer() {
    const amount = parseInt(document.getElementById('transfer-amount-input').value);
    if (!amount || amount <= 0) {
        showNotification('Введите положительное число');
        return;
    }
    const myBalance = getCurrentBalance();
    if (amount > myBalance) {
        showNotification('Недостаточно очков');
        return;
    }
    if (!transferTargetUserId) return;

    const payload = {
        fromUserId: currentUserId.toString(),
        toUserId: transferTargetUserId.toString(),
        amount: amount
    };

    try {
        const res = await fetch(WORKER_URL + '/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Ошибка сервера');
        const result = await res.json();
        if (result.success) {
            showNotification(`Переведено ${amount} очк. пользователю ${transferTargetUserName}`);
            document.getElementById('transfer-modal').classList.remove('active');
            transferTargetUserId = null;
            fetchLeaderboard(); // обновляем таблицы
        } else {
            showNotification(result.error || 'Ошибка перевода');
        }
    } catch (err) {
        showNotification('Ошибка сети');
        console.error(err);
    }
}

// ==================== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (КАРТОЧЕК) ====================
function setupGameTabs() {
    const tabs = document.querySelectorAll('.game-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            // Активируем кнопку
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Показываем контент
            document.querySelectorAll('.game-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(`tab-${target}`);
            if (targetContent) targetContent.classList.add('active');

            // При открытии вкладки "Лидеры" или "Перевести" обновляем данные
            if (target === 'leaderboard' || target === 'transfer') {
                fetchLeaderboard();
            }
        });
    });
}

// Модифицируем setupLeaderboardRefresh (кнопка обновления в лидерах)
function setupLeaderboardRefresh() {
    const refreshBtn = document.getElementById('refresh-leaderboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            vibrate();
            fetchLeaderboard();
        });
    }
}

// Обновляем submitScoreToLeaderboard в Game2048 (вызывается при окончании игры)
// Вставляем в существующий класс Game2048 (без изменений, он уже есть, просто убедимся что там есть вызов fetchLeaderboard)
// Но так как код длинный, я приведу итоговый класс с одним дополнением: после отправки счёта вызываем fetchLeaderboard.
// Остальной код Game2048 полностью идентичен предыдущему, за исключением того, что метод submitScoreToLeaderboard уже есть.
// В предоставленном выше скрипте я опустил полный код Game2048 ради краткости, но он должен быть включён.
// Ниже даю полный script.js с игрой 2048.
