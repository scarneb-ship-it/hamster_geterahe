// Игровое состояние
const game = {
    coins: 0,
    crystals: 5,
    energy: 100,
    maxEnergy: 100,
    level: 1,
    xp: 0,
    xpToLevel: 100,
    incomePerHour: 10,
    buildings: {
        mining: { level: 1, name: '⛏️ Майнинг-ферма' },
        data: { level: 0, name: '💾 Дата-центр' },
        ai: { level: 0, name: '🧠 AI-лаборатория' },
        trade: { level: 0, name: '📊 Торговая станция' },
        analytics: { level: 0, name: '📈 Аналит. центр' }
    },
    tasks: [],
    referrals: 0,
    lastLogin: null,
    streak: 0,
    boostEnergyActive: false,
    boostEnergyEnd: 0,
    boostIncomeActive: false,
    boostIncomeEnd: 0,
    caseResult: ''
};

// Загрузка из localStorage
function loadGame() {
    const saved = localStorage.getItem('hamsterAiSave');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(game, data);
        game.energy = Math.min(game.energy, game.maxEnergy);
    }
    if (!game.tasks.length) initTasks();
    checkDailyReset();
}

function saveGame() {
    localStorage.setItem('hamsterAiSave', JSON.stringify(game));
}

// Ежедневный сброс заданий и проверка streak
function checkDailyReset() {
    const today = new Date().toDateString();
    if (game.lastLogin !== today) {
        if (game.lastLogin) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            game.streak = (game.lastLogin === yesterday) ? game.streak + 1 : 1;
        } else {
            game.streak = 1;
        }
        game.lastLogin = today;
        // Сброс ежедневных заданий
        game.tasks = game.tasks.filter(t => t.period !== 'daily');
        initDailyTasks();
        saveGame();
    }
}

// Инициализация заданий
function initTasks() {
    game.tasks = [
        { id: 'daily_tap', desc: 'Сделать 50 тапов', period: 'daily', target: 50, progress: 0, reward: { coins: 100, xp: 20 }, claimed: false },
        { id: 'daily_collect', desc: 'Собрать доход 1 раз', period: 'daily', target: 1, progress: 0, reward: { coins: 80, xp: 15 }, claimed: false },
        { id: 'weekly_upgrade', desc: 'Улучшить 3 здания', period: 'weekly', target: 3, progress: 0, reward: { crystals: 2, xp: 100 }, claimed: false },
        { id: 'invite_friend', desc: 'Пригласить друга', period: 'once', target: 1, progress: 0, reward: { coins: 500, crystals: 1 }, claimed: false }
    ];
}

function initDailyTasks() {
    game.tasks.push(
        { id: 'daily_tap', desc: 'Сделать 50 тапов', period: 'daily', target: 50, progress: 0, reward: { coins: 100, xp: 20 }, claimed: false },
        { id: 'daily_collect', desc: 'Собрать доход 1 раз', period: 'daily', target: 1, progress: 0, reward: { coins: 80, xp: 15 }, claimed: false }
    );
}

// Увеличение опыта и уровня
function addXP(amount) {
    game.xp += amount;
    while (game.xp >= game.xpToLevel) {
        game.xp -= game.xpToLevel;
        game.level++;
        game.xpToLevel = Math.floor(game.xpToLevel * 1.5);
        game.maxEnergy = 100 + (game.level - 1) * 10;
        game.energy = game.maxEnergy;
        alert(`🎉 Уровень ${game.level}! Макс. энергия увеличена.`);
    }
    updateUI();
}

// Обработка тапа
document.getElementById('hamster-tap').addEventListener('click', (e) => {
    if (game.energy <= 0) {
        alert('Нет энергии! Подожди восстановления или используй буст.');
        return;
    }
    game.energy--;
    let coinsEarned = 1;
    if (game.boostIncomeActive) coinsEarned *= 2;
    game.coins += coinsEarned;
    addXP(1);
    
    // Анимация
    const effect = document.getElementById('tap-effect');
    effect.textContent = `+${coinsEarned}`;
    effect.classList.add('show');
    setTimeout(() => effect.classList.remove('show'), 200);
    
    // Обновление заданий
    game.tasks.forEach(task => {
        if (task.id === 'daily_tap' && !task.claimed) task.progress = Math.min(task.target, task.progress + 1);
    });
    updateUI();
    saveGame();
});

// Сбор дохода
document.getElementById('btn-collect').addEventListener('click', () => {
    let income = game.incomePerHour;
    if (game.boostIncomeActive) income *= 2;
    game.coins += income;
    game.tasks.forEach(task => {
        if (task.id === 'daily_collect' && !task.claimed) task.progress = 1;
    });
    updateUI();
    saveGame();
});

// Улучшение зданий
function upgradeBuilding(type) {
    const b = game.buildings[type];
    const cost = (b.level + 1) * 50;
    if (game.coins < cost) return alert('Недостаточно монет!');
    game.coins -= cost;
    b.level++;
    // Бонус к доходу
    game.incomePerHour += 10 * b.level;
    game.tasks.forEach(task => {
        if (task.id === 'weekly_upgrade' && !task.claimed) task.progress = Math.min(task.target, task.progress + 1);
    });
    addXP(20);
    updateUI();
    saveGame();
    renderBase();
}

// Рендер базы
function renderBase() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';
    for (let key in game.buildings) {
        const b = game.buildings[key];
        const cost = (b.level + 1) * 50;
        const div = document.createElement('div');
        div.className = 'building-card';
        div.innerHTML = `
            <div class="building-info"><strong>${b.name}</strong><br>Ур. ${b.level}</div>
            <div class="building-actions">
                <button class="btn small" onclick="upgradeBuilding('${key}')">Улучшить за ${cost}🪙</button>
            </div>`;
        container.appendChild(div);
    }
}

// Задания отрисовка
function renderTasks() {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';
    game.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-card';
        const progressText = task.target ? `${task.progress}/${task.target}` : '';
        div.innerHTML = `
            <span>${task.desc} ${progressText}</span>
            ${!task.claimed ? `<button onclick="claimTask('${task.id}')">Забрать</button>` : '<span>✅</span>'}`;
        container.appendChild(div);
    });
}

function claimTask(taskId) {
    const task = game.tasks.find(t => t.id === taskId);
    if (!task || task.claimed) return;
    if (task.target && task.progress < task.target) return alert('Не выполнено!');
    task.claimed = true;
    if (task.reward.coins) game.coins += task.reward.coins;
    if (task.reward.crystals) game.crystals += task.reward.crystals;
    if (task.reward.xp) addXP(task.reward.xp);
    updateUI();
    saveGame();
    renderTasks();
}

// AI чат (имитация)
document.getElementById('ai-send').addEventListener('click', sendAiMessage);
document.getElementById('ai-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAiMessage(); });

function sendAiMessage() {
    const input = document.getElementById('ai-input');
    const msg = input.value.trim();
    if (!msg) return;
    addChatMessage('user', msg);
    input.value = '';
    // Имитация ответа AI
    setTimeout(() => {
        const reply = getAiReply(msg);
        addChatMessage('ai', reply);
    }, 500);
}

function addChatMessage(role, text) {
    const window = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.textContent = text;
    window.appendChild(div);
    window.scrollTop = window.scrollHeight;
}

function getAiReply(question) {
    const q = question.toLowerCase();
    if (q.includes('биткоин') || q.includes('btc')) return 'Биткоин — первая криптовалюта. Сейчас его цена зависит от новостей и крупных инвесторов.';
    if (q.includes('блокчейн')) return 'Блокчейн — это цепочка блоков, где хранятся все транзакции. Его нельзя подделать!';
    if (q.includes('майнинг')) return 'Майнинг — процесс добычи криптовалют с помощью вычислений. В игре улучшай майнинг-ферму!';
    if (q.includes('как улучшить') || q.includes('что делать')) return 'Попробуй улучшить Дата-центр и AI-лабораторию, чтобы увеличить доход и получить больше опыта.';
    return 'Я пока учусь, но скоро смогу отвечать на сложные вопросы. Продолжай играть! 🐹';
}

// Ежедневные награды
document.getElementById('btn-daily-reward').addEventListener('click', () => {
    const modal = document.getElementById('modal-daily');
    const container = document.getElementById('daily-rewards');
    container.innerHTML = '';
    const rewards = [50, 100, 150, 200, 300, 500, 1000]; // награды за дни
    for (let i = 0; i < 7; i++) {
        const div = document.createElement('div');
        div.className = 'day-reward';
        div.innerHTML = `День ${i+1}<br>${rewards[i]}🪙`;
        if (i < game.streak) div.style.background = '#e94560';
        container.appendChild(div);
    }
    modal.style.display = 'flex';
    // Выдать награду за сегодня, если еще не получали
    if (!game.dailyClaimed) {
        game.coins += rewards[Math.min(game.streak-1, 6)];
        game.dailyClaimed = true;
        updateUI();
        saveGame();
        alert(`Получено ${rewards[Math.min(game.streak-1, 6)]} монет за ${game.streak}-й день!`);
    }
});

// Кейсы
document.getElementById('btn-cases').addEventListener('click', () => {
    document.getElementById('modal-cases').style.display = 'flex';
});

document.getElementById('open-common-case').addEventListener('click', () => openCase('common'));
document.getElementById('open-rare-case').addEventListener('click', () => {
    if (game.crystals < 5) return alert('Нужно 5 кристаллов');
    game.crystals -= 5;
    openCase('rare');
});

function openCase(type) {
    const commonLoot = [{coins: 200}, {coins: 500}, {crystals: 1}];
    const rareLoot = [{coins: 1000}, {crystals: 3}, {coins: 500, crystals: 2}];
    const loot = type === 'rare' ? rareLoot[Math.floor(Math.random()*rareLoot.length)] : commonLoot[Math.floor(Math.random()*commonLoot.length)];
    if (loot.coins) game.coins += loot.coins;
    if (loot.crystals) game.crystals += loot.crystals;
    document.getElementById('case-result').textContent = `Вы получили: ${loot.coins ? loot.coins+'🪙' : ''} ${loot.crystals ? loot.crystals+'💎' : ''}`;
    updateUI();
    saveGame();
}

// Закрытие модальных окон
document.querySelectorAll('.close').forEach(btn => btn.addEventListener('click', (e) => {
    e.target.closest('.modal').style.display = 'none';
}));
window.onclick = (e) => { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; };

// Рейтинг (симуляция)
function renderLeaders() {
    const list = document.getElementById('leaders-list');
    const fake = [
        { name: 'CryptoKing', score: 5400 },
        { name: 'HamsterGod', score: 3200 },
        { name: 'Miner42', score: 2100 },
        { name: 'Player1', score: 1800 },
    ];
    const me = { name: 'Вы', score: game.coins + game.incomePerHour * 10 };
    const all = [...fake, me].sort((a,b) => b.score - a.score);
    list.innerHTML = '';
    all.forEach((p, i) => {
        const li = document.createElement('li');
        li.textContent = `${i+1}. ${p.name} — ${p.score} очков`;
        if (p.name === 'Вы') li.style.color = '#f9c74f';
        list.appendChild(li);
    });
    document.getElementById('ref-count').textContent = game.referrals;
}

// Приглашение друга
document.getElementById('btn-invite').addEventListener('click', () => {
    const refLink = `${window.location.origin}${window.location.pathname}?ref=${Date.now()}`;
    navigator.clipboard.writeText(refLink).then(() => alert('Реферальная ссылка скопирована!'));
    // Симуляция: если перешли по ref, увеличиваем счетчик
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref') && !sessionStorage.getItem('refApplied')) {
        sessionStorage.setItem('refApplied', '1');
        game.referrals++;
        game.coins += 200; // бонус за приглашение
        game.tasks.forEach(t => { if (t.id === 'invite_friend') t.progress = 1; });
        updateUI();
        saveGame();
        document.getElementById('ref-bonus').textContent = '🎁 Получен бонус за переход по ссылке!';
    }
});

// Бусты
document.getElementById('boost-energy').addEventListener('click', () => {
    if (game.boostEnergyActive) return alert('Буст уже активен');
    game.boostEnergyActive = true;
    game.boostEnergyEnd = Date.now() + 30*60000;
    game.maxEnergy *= 2;
    game.energy = game.maxEnergy;
    alert('Энергия удвоена на 30 минут!');
    updateUI();
    saveGame();
});
document.getElementById('boost-income').addEventListener('click', () => {
    if (game.boostIncomeActive) return alert('Буст уже активен');
    game.boostIncomeActive = true;
    game.boostIncomeEnd = Date.now() + 60*60000;
    alert('Доход удвоен на 1 час!');
    updateUI();
    saveGame();
});

// Обновление UI
function updateUI() {
    document.getElementById('coins').textContent = game.coins;
    document.getElementById('crystals').textContent = game.crystals;
    document.getElementById('energy').textContent = `${game.energy}/${game.maxEnergy}`;
    document.getElementById('level').textContent = game.level;
    document.getElementById('income-hour').textContent = game.incomePerHour;
    document.getElementById('xp-progress').value = game.xp;
    document.getElementById('xp-progress').max = game.xpToLevel;
    document.getElementById('xp-text').textContent = `${game.xp}/${game.xpToLevel}`;
    // Бусты
    if (game.boostEnergyActive && Date.now() > game.boostEnergyEnd) {
        game.boostEnergyActive = false;
        game.maxEnergy = 100 + (game.level - 1) * 10;
        game.energy = Math.min(game.energy, game.maxEnergy);
    }
    if (game.boostIncomeActive && Date.now() > game.boostIncomeEnd) {
        game.boostIncomeActive = false;
    }
    saveGame();
}

// Навигация по экранам
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const screenId = `screen-${btn.dataset.screen}`;
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        if (btn.dataset.screen === 'base') renderBase();
        if (btn.dataset.screen === 'tasks') renderTasks();
        if (btn.dataset.screen === 'leader') renderLeaders();
    });
});

// Таймер восстановления энергии
setInterval(() => {
    if (game.energy < game.maxEnergy) {
        game.energy = Math.min(game.maxEnergy, game.energy + 0.2); // 1 энергия в 5 сек примерно
        updateUI();
    }
}, 1000);

// Инициализация
loadGame();
updateUI();
renderBase();
renderTasks();
renderLeaders();
// Проверка реферальной ссылки
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('ref') && !sessionStorage.getItem('refApplied')) {
    sessionStorage.setItem('refApplied', '1');
    game.referrals++;
    game.coins += 200;
    game.tasks.forEach(t => { if (t.id === 'invite_friend') t.progress = 1; });
    updateUI();
    saveGame();
    document.getElementById('ref-bonus').textContent = '🎁 Получен бонус за переход по ссылке друга!';
}
