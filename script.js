// ==================== МОДУЛЬ: СОСТОЯНИЕ ПРИЛОЖЕНИЯ ====================
const App = {
    state: {
        userId: null,
        userCoins: parseInt(localStorage.getItem('userCoins')) || 0,
        theme: localStorage.getItem('theme') || 'light',
        isGameActive: false,
        game2048: null,
        dailyTasks: JSON.parse(localStorage.getItem('dailyTasks')) || [],
    },

    saveCoins() {
        localStorage.setItem('userCoins', this.state.userCoins);
        UIManager.updateProfileCoins();
    },
    saveTasks() {
        localStorage.setItem('dailyTasks', JSON.stringify(this.state.dailyTasks));
        UIManager.updateBadges();
    },
};

// ==================== МОДУЛЬ: СЕТЕВЫЕ ЗАПРОСЫ ====================
const NetworkService = {
    WORKER_URL: 'https://gamesverse-bot.scarneb.workers.dev',

    async fetchJSON(endpoint, options = {}) {
        try {
            const res = await fetch(this.WORKER_URL + endpoint, {
                headers: { 'Content-Type': 'application/json' },
                ...options,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.warn(`Network error on ${endpoint}:`, error);
            throw error;
        }
    },

    async submitScore(score, taskUpdates) {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user || !App.state.userId) return;
        return this.fetchJSON('/submit-score', {
            method: 'POST',
            body: JSON.stringify({
                userId: App.state.userId.toString(),
                firstName: user.first_name || 'Игрок',
                username: user.username || '',
                score,
                avatarUrl: user.photo_url || '',
                taskUpdates,
            }),
        });
    },

    async claimTask(taskId) {
        if (!App.state.userId) throw new Error('No user');
        return this.fetchJSON('/claim-task', {
            method: 'POST',
            body: JSON.stringify({ userId: App.state.userId.toString(), taskId }),
        });
    },

    async fetchLeaderboard() {
        return this.fetchJSON('/leaderboard');
    },

    async fetchUserStats(userId) {
        return this.fetchJSON(`/user-stats?userId=${userId}`);
    },

    async trackUser(user, ref) {
        return this.fetchJSON('/track', {
            method: 'POST',
            body: JSON.stringify({
                userId: user.id.toString(),
                firstName: user.first_name,
                username: user.username,
                ref,
            }),
        });
    },

    async sendInvite(newUserId, referrerId) {
        return this.fetchJSON('/invite', {
            method: 'POST',
            body: JSON.stringify({ newUserId, referrerId }),
        });
    },
};

// ==================== МОДУЛЬ: УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ ====================
const UIManager = {
    elements: {
        header: document.querySelector('.header'),
        mainContent: document.querySelector('.main-content'),
        bottomNav: document.querySelector('.bottom-nav'),
        notification: document.getElementById('notification'),
        sections: document.querySelectorAll('.content-section'),
        navItems: document.querySelectorAll('.nav-item'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        recordModal: document.getElementById('record-modal'),
        modalScoreText: document.getElementById('modal-score-text'),
        modalShareBtn: document.getElementById('modal-share-btn'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
    },

    showNotification(msg) {
        const el = this.elements.notification;
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 2000);
    },

    updateProfileCoins() {
        const el = document.getElementById('profile-coins-amount');
        if (el) el.textContent = App.state.userCoins;
    },

    updateBadges() {
        const badge = document.getElementById('games-badge');
        if (!badge) return;
        const active = App.state.dailyTasks.filter(t => t.progress >= t.target).length;
        if (active > 0) {
            badge.textContent = active;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },

    setLoading(element, isLoading) {
        if (!element) return;
        const originalText = element.getAttribute('data-original-text') || element.textContent;
        if (isLoading) {
            element.setAttribute('data-original-text', originalText);
            element.innerHTML = '<span class="loading-spinner"></span> Загрузка...';
            element.disabled = true;
        } else {
            element.textContent = originalText;
            element.disabled = false;
        }
    },

    generateStars(rating) { /* ... без изменений ... */
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        let stars = '';
        for (let i = 0; i < full; i++) stars += '<span class="star filled">★</span>';
        if (half) stars += '<span class="star half">★</span>';
        for (let i = 0; i < 5 - full - (half ? 1 : 0); i++) stars += '<span class="star">★</span>';
        return stars;
    },

    escapeHtml(text) { /* ... */
        return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    },

    setActiveSection(sectionId) { /* ... без изменений */
        this.elements.sections.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(sectionId);
        if (target) target.classList.add('active');

        this.elements.navItems.forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (activeNav) activeNav.classList.add('active');
    },

    toggleHeaderAndNav(show) {
        const { header, mainContent, bottomNav } = this.elements;
        if (header) header.style.display = show ? 'flex' : 'none'; // важно flex
        if (bottomNav) bottomNav.style.display = show ? '' : 'none';
        if (mainContent) mainContent.style.paddingTop = show ? '' : '8px';
    },

    renderCardList(containerId, items, options) { /* ... без изменений, с небольшим улучшением обработки ошибок изображений */
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = items.map(item => {
            const imgError = item.image ? `onerror="this.style.display='none'"` : '';
            const fallback = item.fallback || '';
            const imageHtml = item.image ? `<img src="${item.image}" alt="${item.name}" class="card__img" ${imgError}>` : '';
            const isExchange = options.type === 'exchange';
            const buttonClass = isExchange ? 'exchange-button' : 'play-button';
            const buttonText = isExchange ? 'Перейти' : (item.isInternal ? 'Играть' : 'Запустить');
            const badgeHtml = item.badge ? `<span class="card__badge">${item.badge}</span>` : '';

            return `
                <div class="card ${item.highlight ? 'highlight' : ''}" data-game-id="${item.id}">
                    <div class="card__image">
                        ${imageHtml}
                        <div class="card__fallback">${fallback}</div>
                    </div>
                    <div class="card__info">
                        <div class="card__title">${item.name} ${badgeHtml}</div>
                        <p class="card__description">${item.description}</p>
                        ${!isExchange ? `
                        <div class="card__stats">
                            <div class="rating">
                                <div class="stars">${this.generateStars(item.rating)}</div>
                                <span class="rating-value">${item.rating}</span>
                            </div>
                            <div class="players">
                                <span class="players-icon">👥</span>
                                <span class="players-count">${item.players}</span>
                            </div>
                        </div>` : ''}
                    </div>
                    <button class="${buttonClass}" data-link="${item.isInternal ? '' : item.url || ''}">${buttonText}</button>
                </div>`;
        }).join('');

        container.querySelectorAll(isExchange ? '.exchange-button' : '.play-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                vibrate();
                const card = btn.closest('.card');
                if (!card) return;
                if (isExchange) {
                    const url = btn.dataset.link;
                    if (url) {
                        if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url);
                        else window.open(url, '_blank');
                    }
                } else {
                    const gameId = card.dataset.gameId;
                    const game = GAMES_DATA.find(g => g.id.toString() === gameId);
                    if (game?.isInternal) {
                        GameManager.open();
                    } else {
                        const link = btn.dataset.link;
                        if (link) {
                            if (window.Telegram?.WebApp) {
                                if (link.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(link);
                                else window.Telegram.WebApp.openLink(link);
                            } else window.open(link, '_blank');
                        }
                    }
                }
            });
        });
    },

    // Модальное окно рекорда
    showRecordModal(score) {
        if (!this.elements.recordModal) return;
        this.elements.modalScoreText.textContent = score + ' очков';
        this.elements.recordModal.style.display = 'flex';

        // Обработчики кнопок (назначаются один раз)
        this.elements.modalShareBtn.onclick = () => {
            vibrate();
            const refCode = App.state.userId ? `ref_${App.state.userId}` : '';
            const url = `https://t.me/khadron_bot?start=${refCode}`;
            const text = `Я набрал ${score} очков в 2048 в Games Verse! Попробуй побить рекорд! 🎮`;
            if (window.Telegram?.WebApp) {
                const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                try { window.Telegram.WebApp.openTelegramLink(shareUrl); }
                catch { this.fallbackCopy(url); }
            } else if (navigator.share) {
                navigator.share({ title: 'Games Verse', text, url }).catch(() => this.fallbackCopy(url));
            } else {
                this.fallbackCopy(url);
            }
            this.closeRecordModal();
        };
        this.elements.modalCloseBtn.onclick = () => this.closeRecordModal();
    },

    closeRecordModal() {
        if (this.elements.recordModal) this.elements.recordModal.style.display = 'none';
    },

    fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        this.showNotification('Ссылка скопирована!');
    },

    // Быстрая смена темы
    setupThemeToggle() {
        const btn = this.elements.themeToggleBtn;
        if (!btn) return;
        // Синхронизируем иконку с текущей темой
        const updateIcon = () => {
            btn.textContent = App.state.theme === 'dark' ? '☀️' : '🌙';
        };
        updateIcon();
        btn.addEventListener('click', () => {
            vibrate();
            App.state.theme = App.state.theme === 'dark' ? 'light' : 'dark';
            document.body.classList.toggle('dark-theme', App.state.theme === 'dark');
            localStorage.setItem('theme', App.state.theme);
            updateIcon();
            // Синхронизировать переключатель в профиле
            const sw = document.getElementById('profile-theme-switcher');
            if (sw) {
                sw.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                const active = sw.querySelector(`[data-theme="${App.state.theme}"]`);
                if (active) active.classList.add('active');
            }
        });
    },
};

// ==================== МОДУЛЬ: УПРАВЛЕНИЕ ИГРОЙ 2048 ====================
const GameManager = {
    open() {
        App.state.isGameActive = true;
        UIManager.setActiveSection('game-section');
        UIManager.toggleHeaderAndNav(false);
        if (!App.state.game2048) {
            this.initGame();
        } else {
            App.state.game2048.render();
            App.state.game2048.updateBestUI();
        }
    },

    close(showGamesSection = true) {
        if (App.state.game2048) {
            App.state.game2048.saveState();
        }
        App.state.isGameActive = false;
        if (showGamesSection) {
            UIManager.setActiveSection('games-section');
        }
        UIManager.toggleHeaderAndNav(true);
    },

    initGame() {
        const board = document.getElementById('game-board-2048');
        const scoreEl = document.getElementById('game-score');
        const bestEl = document.getElementById('best-score');
        const statusEl = document.getElementById('game-status');
        if (!board || !scoreEl || !bestEl || !statusEl) return;

        App.state.game2048 = new Game2048(board, scoreEl, bestEl, statusEl);
        document.getElementById('new-game-btn')?.addEventListener('click', () => {
            vibrate();
            QuestManager.updateProgress('play_', 1);
            App.state.game2048.init();
        });
        document.getElementById('back-from-game')?.addEventListener('click', () => {
            vibrate();
            GameManager.close();
        });
    },
};

// ==================== КЛАСС: 2048 (с вызовом модалки) ====================
class Game2048 {
    constructor(board, scoreEl, bestEl, statusEl) {
        this.board = board;
        this.scoreEl = scoreEl;
        this.bestEl = bestEl;
        this.statusEl = statusEl;
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;

        const saved = this.loadState();
        if (saved && !saved.gameOver) {
            this.grid = saved.grid;
            this.score = saved.score;
            this.statusEl.textContent = saved.statusMessage || '';
        } else {
            this.init();
        }
        this.updateBestUI();
        this.bindEvents();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.scoreEl.textContent = '0';
        this.statusEl.textContent = '';
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.saveState();
    }

    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] === 0) empty.push({ x: i, y: j });
        if (empty.length) {
            const { x, y } = empty[Math.floor(Math.random() * empty.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
            return true;
        }
        return false;
    }

    move(dir) {
        const old = JSON.parse(JSON.stringify(this.grid));
        let gained = 0;
        const vectors = { left: { x: 0, y: -1 }, right: { x: 0, y: 1 }, up: { x: -1, y: 0 }, down: { x: 1, y: 0 } };
        const v = vectors[dir];
        const traversals = this.buildTraversals(v);
        const merged = Array(this.size).fill().map(() => Array(this.size).fill(false));

        traversals.x.forEach(i => {
            traversals.y.forEach(j => {
                if (this.grid[i][j] === 0) return;
                let curX = i, curY = j;
                while (true) {
                    const nextX = curX + v.x, nextY = curY + v.y;
                    if (nextX < 0 || nextX >= this.size || nextY < 0 || nextY >= this.size) break;
                    if (this.grid[nextX][nextY] === 0) {
                        this.grid[nextX][nextY] = this.grid[curX][curY];
                        this.grid[curX][curY] = 0;
                        curX = nextX; curY = nextY;
                    } else if (this.grid[nextX][nextY] === this.grid[curX][curY] && !merged[nextX][nextY]) {
                        this.grid[nextX][nextY] *= 2;
                        gained += this.grid[nextX][nextY];
                        this.grid[curX][curY] = 0;
                        merged[nextX][nextY] = true;
                        break;
                    } else break;
                }
            });
        });

        if (gained > 0) {
            this.score += gained;
            this.scoreEl.textContent = this.score;
            QuestManager.updateProgress('score_', gained);

            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore2048', this.bestScore);
                this.updateBestUI();
            }
        }

        if (!this.equals(old)) {
            this.addRandomTile();
            this.render();
            if (this.hasWon()) {
                this.statusEl.textContent = 'Вы победили! 🎉';
                QuestManager.updateProgress('win_', 1);
                this.submitScore();
                this.saveState();
                // Модальное окно рекорда
                UIManager.showRecordModal(this.score);
            } else if (this.isGameOver()) {
                this.statusEl.textContent = 'Игра окончена! 😔';
                this.submitScore();
                this.saveState();
                // Показываем модалку только если набрали больше 0 очков
                if (this.score > 0) {
                    UIManager.showRecordModal(this.score);
                }
            } else {
                this.saveState();
            }
        }
    }

    // ... остальные методы без изменений (buildTraversals, equals, hasWon, isGameOver, render, updateBestUI, bindEvents, saveState, loadState, submitScore)
    buildTraversals(v) {
        const x = Array.from({ length: this.size }, (_, i) => i);
        const y = Array.from({ length: this.size }, (_, i) => i);
        if (v.x === 1) x.reverse();
        if (v.y === 1) y.reverse();
        return { x, y };
    }

    equals(old) {
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] !== old[i][j]) return false;
        return true;
    }

    hasWon() { return this.grid.some(row => row.includes(2048)); }

    isGameOver() {
        for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size; j++) if (this.grid[i][j] === 0) return false;
        for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size - 1; j++) if (this.grid[i][j] === this.grid[i][j + 1]) return false;
        for (let j = 0; j < this.size; j++) for (let i = 0; i < this.size - 1; i++) if (this.grid[i][j] === this.grid[i + 1][j]) return false;
        return true;
    }

    render() {
        this.board.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const val = this.grid[i][j];
                const tile = document.createElement('div');
                tile.className = 'tile-cell';
                if (val) {
                    tile.classList.add(val > 2048 ? 'tile-super' : `tile-${val}`);
                    tile.textContent = val;
                }
                this.board.appendChild(tile);
            }
        }
    }

    updateBestUI() { this.bestEl.textContent = this.bestScore; }

    bindEvents() {
        let touchStartX = 0, touchStartY = 0;
        this.board.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });
        this.board.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            this.move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
            vibrate();
        });
        window.addEventListener('keydown', e => {
            if (!document.getElementById('game-section')?.classList.contains('active')) return;
            const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
            if (map[e.key]) { this.move(map[e.key]); e.preventDefault(); vibrate(); }
        });
    }

    saveState() {
        localStorage.setItem('game2048state', JSON.stringify({
            grid: this.grid,
            score: this.score,
            statusMessage: this.statusEl.textContent,
            gameOver: this.isGameOver(),
            won: this.hasWon(),
        }));
    }

    loadState() {
        const raw = localStorage.getItem('game2048state');
        if (!raw) return null;
        try {
            const data = JSON.parse(raw);
            if (data?.grid?.length === this.size) return data;
        } catch { }
        return null;
    }

    async submitScore() {
        const { userId } = App.state;
        if (!userId) return;
        const taskUpdates = {};
        App.state.dailyTasks.forEach(t => {
            if (t.progress > 0 && t.id !== 'invite_1') taskUpdates[t.id] = t.progress;
        });
        try {
            await NetworkService.submitScore(this.score, taskUpdates);
            LeaderboardManager.fetch();
            App.state.dailyTasks.forEach(t => { if (t.id !== 'invite_1') t.progress = 0; });
            App.saveTasks();
            QuestManager.render();
        } catch { }
    }
}

// ==================== МОДУЛЬ: ЗАДАНИЯ ====================
const QuestManager = {
    DEFAULT_TASKS: [
        { id: 'play_3', name: 'Сыграть 3 партии', icon: '🎮', target: 3, progress: 0, reward: 50 },
        { id: 'score_1000', name: 'Набрать 1000 очков', icon: '⭐', target: 1000, progress: 0, reward: 100 },
        { id: 'win_1', name: 'Достигнуть 2048', icon: '🏆', target: 1, progress: 0, reward: 200 },
        { id: 'invite_1', name: 'Пригласить друга', icon: '👥', target: 1, progress: 0, reward: 150 },
    ],

    init() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem('lastTaskReset');
        if (lastReset !== today) {
            App.state.dailyTasks = this.DEFAULT_TASKS.map(t => ({ ...t, progress: 0 }));
            App.saveTasks();
            localStorage.setItem('lastTaskReset', today);
        }
        this.render();
    },

    render() {
        const list = document.getElementById('quests-list');
        const coinsEl = document.getElementById('quests-coins');
        if (!list || !coinsEl) return;
        coinsEl.innerHTML = `🪙 ${App.state.userCoins}`;
        list.innerHTML = App.state.dailyTasks.map(task => {
            const pct = Math.min((task.progress / task.target) * 100, 100);
            const done = task.progress >= task.target;
            return `
                <div class="quest-item">
                    <div class="quest-icon">${task.icon}</div>
                    <div class="quest-info">
                        <div class="quest-name">${task.name}</div>
                        <div class="quest-progress"><div class="quest-progress-fill" style="width:${pct}%"></div></div>
                    </div>
                    <div class="quest-reward">+${task.reward} 🪙</div>
                    <button class="quest-claim" data-task-id="${task.id}" ${!done ? 'disabled' : ''}>
                        ${done ? 'Забрать' : `${task.progress}/${task.target}`}
                    </button>
                </div>`;
        }).join('');

        list.querySelectorAll('.quest-claim').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnEl = e.currentTarget;
                UIManager.setLoading(btnEl, true);
                await this.claimReward(btnEl.dataset.taskId);
                UIManager.setLoading(btnEl, false);
            });
        });
    },

    updateProgress(type, value) {
        let changed = false;
        App.state.dailyTasks.forEach(task => {
            if (task.progress >= task.target) return;
            if (task.id.startsWith(type)) {
                task.progress = Math.min(task.progress + value, task.target);
                changed = true;
            }
        });
        if (changed) {
            App.saveTasks();
            this.render();
        }
    },

    async claimReward(taskId) {
        if (!App.state.userId) return;
        const task = App.state.dailyTasks.find(t => t.id === taskId);
        if (!task || task.progress < task.target) return;
        try {
            const data = await NetworkService.claimTask(taskId);
            App.state.userCoins = data.coins;
            App.saveCoins();
            task.progress = 0;
            App.saveTasks();
            this.render();
            UIManager.showNotification(`Получено ${task.reward} монет!`);
        } catch {
            App.state.userCoins += task.reward;
            App.saveCoins();
            task.progress = 0;
            App.saveTasks();
            this.render();
            UIManager.showNotification(`Получено ${task.reward} монет!`);
        }
    },
};

// ==================== МОДУЛЬ: ЛИДЕРБОРД (с лоадером) ====================
const LeaderboardManager = {
    async fetch() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;
        list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';
        try {
            const data = await NetworkService.fetchLeaderboard();
            const lb = data.leaderboard || [];
            if (!lb.length) {
                list.innerHTML = '<div class="leaderboard-loading">Пока нет результатов</div>';
                return;
            }
            list.innerHTML = lb.map((p, i) => {
                const isMe = App.state.userId && p.userId.toString() === App.state.userId.toString();
                const avatar = p.avatarUrl
                    ? `<img src="${p.avatarUrl}" alt="${UIManager.escapeHtml(p.firstName)}">`
                    : p.firstName.charAt(0).toUpperCase();
                return `
                    <div class="leaderboard-item ${isMe ? 'current-user' : ''}">
                        <div class="leaderboard-rank">#${i + 1}</div>
                        <div class="leaderboard-avatar">${avatar}</div>
                        <div class="leaderboard-info"><div class="leaderboard-name">${UIManager.escapeHtml(p.firstName)}</div></div>
                        <div class="leaderboard-score">${p.score} <span>очк.</span></div>
                    </div>`;
            }).join('');
        } catch {
            list.innerHTML = '<div class="leaderboard-loading">Не удалось загрузить таблицу</div>';
        }
    },

    setupRefresh() {
        const btn = document.getElementById('refresh-leaderboard');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            vibrate();
            btn.style.transform = 'rotate(90deg)';
            await this.fetch();
            btn.style.transform = '';
        });
    },
};

// ==================== МОДУЛЬ: ПРОФИЛЬ И РЕФЕРАЛЫ ====================
const ProfileManager = {
    async init() {
        this.setupThemeSwitcher();
        this.setupShareButton();
    },

    async loadUser() {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) {
            this.showFallback();
            App.state.userId = null;
            return;
        }
        App.state.userId = user.id;
        this.updateDisplay(user);
        await this.handleReferral(user);
        await NetworkService.trackUser(user, this.getRefParam());
        await this.syncCoins();
    },

    async syncCoins() {
        try {
            const data = await NetworkService.fetchUserStats(App.state.userId);
            if (data.coins !== undefined) {
                App.state.userCoins = data.coins;
                App.saveCoins();
            }
        } catch { /* сохраняем локальное значение */ }
    },

    async loadStats() {
        if (!App.state.userId) {
            document.getElementById('stat-rank').textContent = '—';
            document.getElementById('stat-score').textContent = '—';
            document.getElementById('stat-invites').textContent = '—';
            return;
        }
        // Показать лоадер на карточках? Для простоты просто обновим
        try {
            const data = await NetworkService.fetchUserStats(App.state.userId);
            document.getElementById('stat-rank').textContent = data.rank || '—';
            document.getElementById('stat-score').textContent = data.bestScore || 0;
            document.getElementById('stat-invites').textContent = data.inviteCount || 0;
            App.state.userCoins = data.coins ?? App.state.userCoins;
            App.saveCoins();
        } catch {
            document.getElementById('stat-score').textContent = localStorage.getItem('bestScore2048') || '0';
            document.getElementById('stat-rank').textContent = '—';
            document.getElementById('stat-invites').textContent = localStorage.getItem('inviteCount') || '0';
        }
    },

    getRefParam() {
        try { return window.Telegram?.WebApp?.initDataUnsafe?.start_param || null; } catch { return null; }
    },

    async handleReferral(user) { /* без изменений */ },
    updateDisplay(user) { /* без изменений */ },
    showFallback() { /* без изменений */ },

    setupThemeSwitcher() {
        const sw = document.getElementById('profile-theme-switcher');
        if (!sw) return;
        const saved = App.state.theme;
        sw.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        sw.querySelector(`[data-theme="${saved}"]`)?.classList.add('active');
        if (saved === 'dark') document.body.classList.add('dark-theme');

        sw.addEventListener('click', e => {
            const btn = e.target.closest('.theme-option');
            if (!btn) return;
            vibrate();
            App.state.theme = btn.dataset.theme;
            sw.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            btn.classList.add('active');
            document.body.classList.toggle('dark-theme', App.state.theme === 'dark');
            localStorage.setItem('theme', App.state.theme);
            // Обновить кнопку в header
            const toggleBtn = document.getElementById('theme-toggle-btn');
            if (toggleBtn) toggleBtn.textContent = App.state.theme === 'dark' ? '☀️' : '🌙';
        });
    },

    setupShareButton() { /* без изменений, только убрали дублирование кода */ },
};

// Заполним недостающие методы ProfileManager (ссылаемся на UIManager для шаринга)
ProfileManager.setupShareButton = function() {
    const btn = document.getElementById('share-friends-button');
    if (!btn) return;
    btn.addEventListener('click', () => {
        vibrate();
        const refCode = App.state.userId ? `ref_${App.state.userId}` : '';
        const url = `https://t.me/khadron_bot?start=${refCode}`;
        const text = 'Играй в лучшие мини-игры Telegram вместе с HADRON! 🎮';
        if (window.Telegram?.WebApp) {
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            try { window.Telegram.WebApp.openTelegramLink(shareUrl); } catch { UIManager.fallbackCopy(url); }
        } else if (navigator.share) {
            navigator.share({ title: 'Games Verse', text, url }).catch(() => UIManager.fallbackCopy(url));
        } else UIManager.fallbackCopy(url);
    });
};

ProfileManager.handleReferral = async function(user) {
    const ref = this.getRefParam();
    if (!ref || !ref.startsWith('ref_')) return;
    const referrerId = ref.replace('ref_', '');
    if (referrerId === user.id.toString() || localStorage.getItem('invitedBy')) return;

    localStorage.setItem('invitedBy', referrerId);
    try { await NetworkService.sendInvite(user.id.toString(), referrerId); } catch { }
    if (App.state.userId && App.state.userId.toString() === referrerId) {
        let invites = parseInt(localStorage.getItem('inviteCount')) || 0;
        invites++;
        localStorage.setItem('inviteCount', invites);
        App.state.userCoins += 150;
        App.saveCoins();
        QuestManager.updateProgress('invite_', 1);
        UIManager.showNotification('🎉 Вы пригласили друга! +150 монет');
    }
};

ProfileManager.updateDisplay = function(user) {
    document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    document.getElementById('user-username').textContent = user.username ? '@' + user.username : 'Telegram User';
    const avatarImg = document.getElementById('avatar-img');
    const fallback = document.getElementById('avatar-fallback');
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
        avatarImg.style.display = 'block';
        fallback.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        fallback.textContent = user.first_name?.charAt(0).toUpperCase() || 'T';
        fallback.style.display = 'flex';
    }
    if (user.is_premium && !document.querySelector('.premium-badge')) {
        const badge = document.createElement('div');
        badge.className = 'premium-badge';
        badge.innerHTML = '⭐ Premium';
        document.querySelector('.profile-info')?.appendChild(badge);
    }
};

ProfileManager.showFallback = function() {
    document.getElementById('user-name').textContent = 'Telegram User';
    document.getElementById('user-username').textContent = 'Открой в Telegram';
    const fb = document.getElementById('avatar-fallback');
    fb.textContent = 'T'; fb.style.display = 'flex';
};

// ==================== ДАННЫЕ ====================
const GAMES_DATA = [ /* ... без изменений ... */ ];
const EXCHANGES_DATA = [ /* ... без изменений ... */ ];

// ==================== УТИЛИТЫ ====================
function vibrate() { if (navigator.vibrate) navigator.vibrate(50); }

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function initializeApp() {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }

    await ProfileManager.init();
    await ProfileManager.loadUser();

    // Переключение темы в header
    UIManager.setupThemeToggle();

    QuestManager.init();

    UIManager.renderCardList('games-grid', GAMES_DATA, { type: 'game' });
    UIManager.renderCardList('exchanges-list', EXCHANGES_DATA, { type: 'exchange' });

    LeaderboardManager.setupRefresh();
    setupNavigation();

    UIManager.updateProfileCoins();
    UIManager.updateBadges();
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            vibrate();
            if (App.state.isGameActive) GameManager.close(false);
            const sectionId = item.dataset.section;
            UIManager.setActiveSection(sectionId);

            if (sectionId === 'leaderboard-section') LeaderboardManager.fetch();
            if (sectionId === 'profile-section') {
                ProfileManager.loadStats();
                UIManager.toggleHeaderAndNav(false);
            } else {
                UIManager.toggleHeaderAndNav(true);
            }
        });
    });

    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        if (sectionId === 'leaderboard-section') LeaderboardManager.fetch();
        if (sectionId === 'profile-section') {
            ProfileManager.loadStats();
            UIManager.toggleHeaderAndNav(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    document.body.style.opacity = '1';
    initializeApp();
});
