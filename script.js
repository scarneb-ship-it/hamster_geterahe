// Telegram Mini App инициализация
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Хранилище
const STORAGE_KEY = 'last_vote_v2';
const PLAYER_POOL = ['Алекс', 'Морган', 'Кира', 'Джейд', 'Тейлор', 'Райли', 'Скай', 'Дрю', 'Ривен', 'Зара'];

// Игровые константы
const VOTE_TYPES = ['vote_kick', 'vote_boost']; // удаление / усиление
const CHAOS_EVENTS = [
    { icon: '🔥', text: 'Огненный день: все голоса удваиваются', effect: 'double_votes' },
    { icon: '🛡', text: 'День защиты: щиты не тратятся', effect: 'no_shield_loss' },
    { icon: '💎', text: 'Кристальный дождь: +15 бонусных очков', effect: 'bonus_points' },
    { icon: '🌪', text: 'Шторм: проигравший теряет 5 очков', effect: 'loser_penalty' },
    { icon: '🎯', text: 'Меткость: шанс атаки на вас повышен', effect: 'high_threat' },
];

// Загрузка данных
let game = JSON.parse(localStorage.getItem(STORAGE_KEY)) || createNewGame();

function createNewGame() {
    return {
        user: null,
        candidates: null,
        leaderboard: [],
        dailyEvent: null,
        voteType: 'vote_kick',  // сегодняшний тип
        lastEventDate: null,
        threatActive: false,     // атака дня
    };
}

function saveGame() { localStorage.setItem(STORAGE_KEY, JSON.stringify(game)); }

// Инициализация пользователя
function initUser() {
    if (game.user) return game.user;
    const webUser = tg.initDataUnsafe?.user || {};
    const id = webUser.id || 'local_' + Math.random().toString(36).substr(2, 9);
    const name = webUser.first_name || 'Игрок';
    const user = {
        id, username: webUser.username || '', firstName: name,
        avatarUrl: webUser.photo_url || '',
        points: 0, level: 1, xp: 0,
        streak: 0, lastVoteDate: null, lastLoginDate: null,
        shields: 0, alive: true,
        referrerId: null, referralCount: 0,
    };
    game.user = user;
    addToLeaderboard(user);
    handleReferral();
    saveGame();
    return user;
}

function addToLeaderboard(user) {
    if (!game.leaderboard.find(u => u.id === user.id)) {
        game.leaderboard.push({ id: user.id, name: user.firstName, points: user.points, avatar: user.avatarUrl });
    }
    // Сортировка всегда
    game.leaderboard.sort((a, b) => b.points - a.points);
}

// Рефералы
function handleReferral() {
    const startParam = tg.initDataUnsafe?.start_param;
    if (!startParam || !startParam.startsWith('ref_')) return;
    const refId = startParam.replace('ref_', '');
    if (refId === game.user.id) return;
    if (game.user.referrerId) return;
    game.user.referrerId = refId;
    game.user.points += 5;
    const refUser = game.leaderboard.find(u => u.id === refId);
    if (refUser) {
        refUser.points += 2;
        if (!refUser.referralCount) refUser.referralCount = 0;
        refUser.referralCount++;
        refUser.shields = (refUser.shields || 0) + 1;
    }
    game.user.shields = (game.user.shields || 0) + 1; // приглашённый тоже получает щит
    addToLeaderboard(game.user);
    saveGame();
}

// Ежедневная рутина
function getToday() { return new Date().toISOString().slice(0, 10); }

function dailyReset() {
    const today = getToday();
    if (game.lastEventDate !== today) {
        // Новый тип голосования и событие
        game.voteType = VOTE_TYPES[Math.floor(Math.random() * VOTE_TYPES.length)];
        const event = CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)];
        game.dailyEvent = event;
        game.lastEventDate = today;

        // Генерация кандидатов (3 случайных из пула, но можно добавить логику)
        const shuffled = [...PLAYER_POOL].sort(() => Math.random() - 0.5);
        game.candidates = {
            date: today,
            list: shuffled.slice(0, 3).map(name => ({ name, alive: true }))
        };

        // Сброс угрозы
        game.threatActive = Math.random() < 0.4; // 40% шанс, что вас атакуют
        saveGame();
    }
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

// Голосование
function canVoteToday() {
    if (!game.user || !game.user.alive) return false;
    return game.user.lastVoteDate !== getToday();
}

function vote(candidateName) {
    if (!canVoteToday()) return false;
    const user = game.user;
    const today = getToday();
    user.lastVoteDate = today;

    // Базовые очки
    let pointsEarned = 10;
    if (game.voteType === 'vote_boost') pointsEarned += 5;
    if (game.dailyEvent?.effect === 'double_votes') pointsEarned *= 2;

    user.points += pointsEarned;
    user.streak += 1;
    addXP(user, pointsEarned);

    // Отметка кандидата
    const cand = game.candidates.list.find(c => c.name === candidateName);
    if (cand) cand.alive = false;

    // Обработка атаки на игрока
    if (game.threatActive) {
        if (user.shields > 0) {
            user.shields--;
            tg.showPopup({ title: '🛡 Щит спас!', message: 'Вас пытались удалить, но щит защитил.' });
        } else {
            user.alive = false;
            tg.showPopup({ title: '💀 Вы выбыли!', message: 'Ваш персонаж удалён голосованием. Воскресните в разделе Наград.' });
        }
        game.threatActive = false; // атака прошла
    }

    addToLeaderboard(user);
    saveGame();
    updateUI();
    return true;
}

function addXP(user, amount) {
    user.xp = (user.xp || 0) + amount;
    const needed = user.level * 50;
    if (user.xp >= needed) {
        user.xp -= needed;
        user.level++;
        tg.showPopup({ title: '⬆ Уровень повышен!', message: `Теперь вы ${user.level} уровня.` });
    }
}

// Ежедневная награда
function claimDailyReward() {
    const user = game.user;
    if (!user || !user.alive) return 0;
    const today = getToday();
    if (user.lastLoginDate === today) return 0;

    user.lastLoginDate = today;
    user.streak = (user.streak || 0) + 1;
    const bonus = 5 + user.streak * 3;
    user.points += bonus;
    addXP(user, bonus);
    addToLeaderboard(user);
    saveGame();
    return bonus;
}

// Воскрешение
function revive() {
    const user = game.user;
    if (!user || user.alive) return false;
    if (user.points < 100) {
        tg.showPopup({ title: 'Недостаточно очков', message: 'Нужно 100 очков для воскрешения.' });
        return false;
    }
    user.points -= 100;
    user.alive = true;
    user.shields = Math.max(0, user.shields); // щиты не восстанавливаются
    addToLeaderboard(user);
    saveGame();
    updateUI();
    return true;
}

// UI обновление
function updateUI() {
    const user = game.user;
    if (!user) return;

    // Главный экран
    document.getElementById('user-name').textContent = user.firstName;
    document.getElementById('user-avatar').src = user.avatarUrl || 'data:image/svg+xml,...';
    document.getElementById('user-level').textContent = user.level;
    document.getElementById('user-points').textContent = user.points;
    document.getElementById('shield-count').textContent = user.shields;
    const xpPercent = Math.min(100, (user.xp / (user.level * 50)) * 100);
    document.getElementById('xp-bar').style.width = xpPercent + '%';

    const timerMs = getTimeUntilMidnight();
    document.getElementById('vote-timer').textContent = formatTime(timerMs);
    // Круг прогресса таймера
    const totalSec = 86400;
    const remainingSec = Math.ceil(timerMs / 1000);
    const progress = (remainingSec / totalSec) * 282.74;
    document.getElementById('timer-circle').style.strokeDashoffset = 282.74 - progress;

    const voteBtn = document.getElementById('vote-btn');
    const canVote = canVoteToday();
    voteBtn.disabled = !canVote;
    document.getElementById('vote-btn-text').textContent = canVote ? 'ГОЛОСОВАТЬ' : 'УЖЕ ГОЛОСОВАЛИ';

    // Баннер события
    if (game.dailyEvent) {
        document.getElementById('event-icon').textContent = game.dailyEvent.icon;
        document.getElementById('event-text').textContent = game.dailyEvent.text;
    }

    // Экран голосования (заголовок)
    const voteTitle = game.voteType === 'vote_boost' ? 'Кого усилить?' : 'Кого удалить?';
    document.getElementById('vote-title').textContent = voteTitle;

    // Лидеры
    renderLeaderboard();

    // Награды
    document.getElementById('streak-days').textContent = user.streak || 1;
    const bonus = 5 + (user.streak || 1) * 3;
    document.getElementById('streak-bonus').textContent = '+' + bonus;
    document.getElementById('ref-count').textContent = user.referralCount || 0;
    document.getElementById('reward-status').textContent = (user.lastLoginDate === getToday()) ? 'Сегодня уже получено' : '';

    // Секция воскрешения
    const reviveSection = document.getElementById('revive-section');
    if (!user.alive) {
        reviveSection.style.display = 'block';
    } else {
        reviveSection.style.display = 'none';
    }

    // Профиль
    document.getElementById('profile-id').textContent = user.id;
    document.getElementById('profile-level').textContent = user.level;
    document.getElementById('profile-points').textContent = user.points;
    document.getElementById('profile-shields').textContent = user.shields;
    document.getElementById('profile-streak').textContent = user.streak || 1;
    document.getElementById('profile-status').textContent = user.alive ? '🟢 Жив' : '💀 Выбыл';
}

function renderLeaderboard() {
    const container = document.getElementById('leaders-list');
    container.innerHTML = '';
    const top = game.leaderboard.slice(0, 10);
    top.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'leader-item';
        div.innerHTML = `
            <span class="leader-rank">${idx+1}</span>
            <img class="leader-avatar" src="${entry.avatar || 'data:image/svg+xml,...'}" alt="">
            <span class="leader-name">${entry.name}</span>
            <span class="leader-points">${entry.points} 🔹</span>
        `;
        if (entry.id === game.user.id) div.style.background = 'rgba(233,68,96,0.1)';
        container.appendChild(div);
    });
}

// Кандидаты на экране голосования
function renderVoteScreen() {
    const list = document.getElementById('candidates-list');
    list.innerHTML = '';
    game.candidates.list.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'candidate-btn';
        const action = game.voteType === 'vote_boost' ? '⚡' : '💀';
        btn.textContent = `${action} ${c.name}`;
        btn.disabled = !c.alive || !canVoteToday();
        btn.addEventListener('click', () => {
            vote(c.name);
            showScreen('main');
        });
        list.appendChild(btn);
    });
}

// Навигация
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    updateUI();
    if (screenId === 'vote-screen') renderVoteScreen();
}

// Конфетти (простая реализация)
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 2,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
        });
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.y += p.speedY;
            p.x += p.speedX;
        });
        if (particles.some(p => p.y < canvas.height)) requestAnimationFrame(draw);
        else canvas.style.display = 'none';
    }
    draw();
}

// Обработчики событий
document.getElementById('vote-btn').addEventListener('click', () => {
    showScreen('vote-screen');
});

document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.target.dataset.screen || 'main';
        showScreen(target);
    });
});
document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        showScreen(e.target.dataset.screen);
    });
});

document.getElementById('invite-btn').addEventListener('click', () => {
    const botUsername = 'your_bot_username'; // ← замени на своего бота
    const refCode = game.user.id;
    const url = `https://t.me/${botUsername}/app?startapp=ref_${refCode}`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=Присоединяйся к LAST VOTE — социальный эксперимент!`);
});

document.getElementById('claim-reward-btn').addEventListener('click', () => {
    const bonus = claimDailyReward();
    if (bonus) {
        launchConfetti();
        tg.showPopup({ title: '🎉 Награда!', message: `+${bonus} очков.` });
        updateUI();
    } else {
        tg.showPopup({ title: 'Уже получено', message: 'Заберите завтра.' });
    }
});

document.getElementById('revive-btn')?.addEventListener('click', () => {
    if (revive()) {
        tg.showPopup({ title: '🙌 Вы воскресли!', message: 'Добро пожаловать обратно.' });
        showScreen('main');
    }
});

// Таймер обновления интерфейса
setInterval(() => {
    const timerMs = getTimeUntilMidnight();
    document.getElementById('vote-timer').textContent = formatTime(timerMs);
    const totalSec = 86400;
    const remaining = Math.ceil(timerMs / 1000);
    const progress = (remaining / totalSec) * 282.74;
    document.getElementById('timer-circle').style.strokeDashoffset = 282.74 - progress;
    // Если день сменился – перезапуск логики (сработает при заходе на главный экран)
    if (getToday() !== game.lastEventDate) {
        dailyReset();
        updateUI();
    }
}, 1000);

// Старт
const user = initUser();
dailyReset();
if (user.lastLoginDate !== getToday()) claimDailyReward();
updateUI();
