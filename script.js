// Инициализация Telegram Mini App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Установка цветов темы
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1a2e');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#eee');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#2c3e50');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#e94560');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#fff');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#16213e');

// ---------- Данные и константы ----------
const STORAGE_KEY = 'last_vote_data';
const FAKE_PLAYERS = ['Алекс', 'Морган', 'Кира', 'Джейд', 'Тейлор', 'Райли', 'Скай', 'Дрю'];

// Загрузка/инициализация данных
let game = loadGame();

function loadGame() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
        user: null,
        candidates: null,   // { date: 'YYYY-MM-DD', list: [{name, alive}] }
        leaderboard: []     // [{ id, name, points }]
    };
}

function saveGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

// Пользователь из Telegram
function initUser() {
    if (game.user) return game.user;
    const webUser = tg.initDataUnsafe?.user;
    const id = webUser?.id || ('local_' + Math.random().toString(36).substr(2, 9));
    const name = webUser?.first_name || 'Игрок';
    const newUser = {
        id,
        username: webUser?.username || '',
        firstName: name,
        avatarUrl: webUser?.photo_url || '',
        points: 0,
        streak: 0,
        lastVoteDate: null,
        lastLoginDate: null,
        referrerId: null,
        referralCount: 0,
        shieldActive: false
    };
    game.user = newUser;
    addToLeaderboard(newUser);
    handleReferral();   // проверка start_param
    saveGame();
    return newUser;
}

function addToLeaderboard(user) {
    if (!game.leaderboard.find(u => u.id === user.id)) {
        game.leaderboard.push({ id: user.id, name: user.firstName, points: user.points });
        game.leaderboard.sort((a,b) => b.points - a.points);
    }
}

// Обработка реферальной ссылки (параметр startapp в боте)
function handleReferral() {
    const startParam = tg.initDataUnsafe?.start_param;
    if (!startParam || !startParam.startsWith('ref_')) return;
    const refId = startParam.replace('ref_', '');
    if (refId === game.user.id) return; // самоприглашение
    if (game.user.referrerId) return;   // уже есть реферер
    game.user.referrerId = refId;
    game.user.points += 5;              // бонус приглашённому
    // Бонус пригласившему — найдём его в leaderboard (если есть локально)
    const referrer = game.leaderboard.find(u => u.id === refId);
    if (referrer) {
        referrer.points += 2;
        // Обновим referralCount у пригласившего (надо его объект в game.user, но он может быть не текущим)
        // Здесь упрощённо: ищем в leaderboard и увеличиваем кастомное поле
        if (!referrer.referralCount) referrer.referralCount = 0;
        referrer.referralCount = (referrer.referralCount || 0) + 1;
    }
    addToLeaderboard(game.user); // перезапишем свои очки
    saveGame();
}

// Генерация кандидатов на сегодня
function getTodayStr() {
    return new Date().toISOString().slice(0,10);
}

function generateCandidates() {
    const today = getTodayStr();
    if (game.candidates && game.candidates.date === today) return;
    // Перемешиваем имена и берём 3
    const shuffled = [...FAKE_PLAYERS].sort(() => Math.random() - 0.5);
    game.candidates = {
        date: today,
        list: shuffled.slice(0, 3).map(name => ({ name, alive: true }))
    };
    saveGame();
}

// Таймер до полуночи UTC
function getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return midnight - now;
}

function formatTime(ms) {
    if (ms <= 0) return '00:00:00';
    const sec = Math.floor(ms / 1000) % 60;
    const min = Math.floor(ms / 60000) % 60;
    const hour = Math.floor(ms / 3600000);
    return `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// Проверка, можно ли голосовать сегодня
function canVoteToday() {
    if (!game.user) return false;
    return game.user.lastVoteDate !== getTodayStr();
}

// Голосование
function vote(candidateName) {
    if (!canVoteToday()) return false;
    game.user.lastVoteDate = getTodayStr();
    game.user.points += 10;           // базовые очки
    game.user.streak += 1;
    // Отмечаем кандидата неживым (для драмы)
    const cand = game.candidates.list.find(c => c.name === candidateName);
    if (cand) cand.alive = false;
    addToLeaderboard(game.user);
    saveGame();
    updateUI();
    return true;
}

// Ежедневная награда (за заход)
function claimDailyReward() {
    const today = getTodayStr();
    if (game.user.lastLoginDate === today) return false; // уже получена
    game.user.lastLoginDate = today;
    game.user.streak += 1;
    const bonus = 5 + game.user.streak * 2;
    game.user.points += bonus;
    addToLeaderboard(game.user);
    saveGame();
    return bonus;
}

// ---------- UI обновление ----------
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateUI() {
    const user = game.user;
    if (!user) return;
    // Главный экран
    document.getElementById('user-name').textContent = user.firstName;
    document.getElementById('user-avatar').src = user.avatarUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23555"/%3E%3C/svg%3E';
    const level = Math.floor(user.points / 50) + 1;
    document.getElementById('user-level').textContent = level;
    // Таймер
    const timerMs = getTimeUntilMidnight();
    document.getElementById('vote-timer').textContent = formatTime(timerMs);
    // Кнопка голосования
    const voteBtn = document.getElementById('vote-btn');
    voteBtn.disabled = !canVoteToday();
    voteBtn.textContent = canVoteToday() ? 'ГОЛОСОВАТЬ' : 'Уже голосовал сегодня';
    // Лидерборд
    renderLeaderboard();
    // Награды
    document.getElementById('streak-days').textContent = user.streak || 1;
    document.getElementById('streak-bonus').textContent = '+' + (5 + (user.streak || 1) * 2);
    document.getElementById('ref-count').textContent = user.referralCount || 0;
    document.getElementById('reward-status').textContent = user.lastLoginDate === getTodayStr() ? 'Награда уже получена сегодня' : '';
}

function renderLeaderboard() {
    const list = document.getElementById('leaders-list');
    list.innerHTML = '';
    const top10 = [...game.leaderboard].sort((a,b) => b.points - a.points).slice(0, 10);
    top10.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.textContent = `${idx+1}. ${entry.name} — ${entry.points} очк.`;
        if (entry.id === game.user.id) li.style.fontWeight = 'bold';
        list.appendChild(li);
    });
}

// Экран голосования: показать кандидатов
function renderVoteScreen() {
    const container = document.getElementById('candidates-list');
    container.innerHTML = '';
    if (!game.candidates) return;
    game.candidates.list.forEach(candidate => {
        const btn = document.createElement('button');
        btn.className = 'candidate-btn';
        btn.textContent = candidate.alive ? `🗳 ${candidate.name}` : `💀 ${candidate.name} (выбыл)`;
        btn.disabled = !candidate.alive || !canVoteToday();
        btn.addEventListener('click', () => {
            if (vote(candidate.name)) {
                tg.showPopup({ title: 'Голос принят!', message: `${candidate.name} удалён(а) из игры.`, buttons: [{type:'ok'}] });
                showScreen('main');
            }
        });
        container.appendChild(btn);
    });
}

// ---------- Обработчики событий ----------
document.getElementById('vote-btn').addEventListener('click', () => {
    generateCandidates();
    renderVoteScreen();
    showScreen('vote-screen');
});

document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.target.dataset.screen || 'main';
        showScreen(target);
        updateUI();
    });
});

document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const screen = e.target.dataset.screen;
        showScreen(screen);
        updateUI();
    });
});

document.getElementById('invite-btn').addEventListener('click', () => {
    const botUsername = 'your_bot_username'; // замените на имя вашего бота
    const refCode = game.user ? game.user.id : 'unknown';
    const url = `https://t.me/${botUsername}/app?startapp=ref_${refCode}`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=Присоединяйся к LAST VOTE!`);
});

document.getElementById('claim-reward-btn').addEventListener('click', () => {
    const bonus = claimDailyReward();
    if (bonus) {
        tg.showPopup({ title: 'Награда!', message: `Получено ${bonus} очков.`, buttons: [{type:'ok'}] });
        updateUI();
    } else {
        tg.showPopup({ title: 'Уже получено', message: 'Сегодняшняя награда уже забрана.' });
    }
});

// Таймер обновления
setInterval(() => {
    const ms = getTimeUntilMidnight();
    document.getElementById('vote-timer').textContent = formatTime(ms);
    // Сброс дня и обновление UI если надо
    const today = getTodayStr();
    if (game.user && game.user.lastVoteDate !== today && document.getElementById('vote-btn').disabled) {
        updateUI();
    }
}, 1000);

// Старт приложения
const user = initUser();
// Если сегодня ещё не заходил — сразу даём награду (автоматически или по кнопке)
if (user.lastLoginDate !== getTodayStr()) {
    claimDailyReward();
}
generateCandidates();
updateUI();
