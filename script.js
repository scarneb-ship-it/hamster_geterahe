const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

// ---------- Данные игр и бирж (без изменений) ----------
const GAMES_DATA = [ ... ]; // точно как в исходном коде
const EXCHANGES_DATA = [ ... ]; // точно как в исходном коде

// ---------- Детерминированный ГПСЧ ----------
class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

// ---------- Система достижений ----------
const ACHIEVEMENTS = [
  { id: 'tile_128', name: 'Плитка 128', desc: 'Соберите 128', icon: '🟩', check: g => g.grid.some(r => r.some(v => v >= 128)) },
  { id: 'tile_256', name: 'Плитка 256', desc: 'Соберите 256', icon: '🟦', check: g => g.grid.some(r => r.some(v => v >= 256)) },
  { id: 'tile_512', name: 'Плитка 512', desc: 'Соберите 512', icon: '🟪', check: g => g.grid.some(r => r.some(v => v >= 512)) },
  { id: 'tile_1024', name: 'Плитка 1024', desc: 'Соберите 1024', icon: '🟧', check: g => g.grid.some(r => r.some(v => v >= 1024)) },
  { id: 'tile_2048', name: '2048!', desc: 'Соберите 2048', icon: '🏆', check: g => g.grid.some(r => r.some(v => v >= 2048)) },
  { id: 'score_2000', name: 'Новичок', desc: 'Наберите 2000 очков', icon: '💵', check: g => g.score >= 2000 },
  { id: 'score_5000', name: 'Любитель', desc: 'Наберите 5000 очков', icon: '💰', check: g => g.score >= 5000 },
  { id: 'score_10000', name: 'Профи', desc: 'Наберите 10000 очков', icon: '💎', check: g => g.score >= 10000 },
  { id: 'moves_50', name: 'Тактик', desc: 'Сделайте 50 ходов', icon: '♟️', check: g => g.moveCount >= 50 },
  { id: 'moves_100', name: 'Марафонец', desc: 'Сделайте 100 ходов', icon: '🏃', check: g => g.moveCount >= 100 },
];

// ---------- Ежедневные и еженедельные испытания ----------
const DAILY_TASKS = [
  { desc: 'Наберите 1500 очков', target: 1500, type: 'score' },
  { desc: 'Достигните плитки 128', target: 128, type: 'tile' },
  { desc: 'Сделайте 30 ходов', target: 30, type: 'moves' },
  { desc: 'Совершите 3 слияния за ход', target: 3, type: 'merge_combo' }, // будет проверяться отдельно
];
const WEEKLY_TASKS = [
  { desc: 'Наберите 8000 очков', target: 8000, type: 'score' },
  { desc: 'Достигните плитки 512', target: 512, type: 'tile' },
  { desc: 'Сделайте 150 ходов', target: 150, type: 'moves' },
  { desc: 'Совершите 10 слияний за игру', target: 10, type: 'total_merges' },
];

// ---------- Глобальные переменные ----------
let game2048 = null;
let replayMode = false;
let replayInterval = null;
let replayIndex = 0;
let replayMoves = [];
let replaySeed = 0;
let replaySpeed = 1;

// ---------- Инициализация после загрузки DOM ----------
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) splash.style.display = 'none';
  document.body.style.opacity = '1';

  initializeTelegramWebApp();
  setupNavigation();
  initializeGames();
  initializeExchanges();
  setupSettingsPanel();
  loadThemePreference();
  loadUserData();
  setupShareButton();
  setupLeaderboardRefresh();
  setupLeaderboardShare();
  setupGameTabs();
  initGame2048();
  loadAchievementsUI();
  loadChallengesUI();
  checkReplayParam();
});

// ... (функции Telegram, игры, биржи, профиль остаются без изменений, кроме тех, что затрагивают 2048 и новые фичи)

function initGame2048() {
  if (game2048) return;
  const board = document.getElementById('game-board-2048');
  const scoreEl = document.getElementById('game-score');
  const bestEl = document.getElementById('best-score');
  const statusEl = document.getElementById('game-status');
  const replayBtn = document.getElementById('replay-share-btn');
  if (board && scoreEl && bestEl && statusEl) {
    game2048 = new Game2048(board, scoreEl, bestEl, statusEl, replayBtn);
    document.getElementById('new-game-btn').addEventListener('click', () => {
      vibrate();
      game2048.resetGame();
    });
    // если replay параметр найден, Game2048 сам переключится в режим воспроизведения
    if (replayMode) {
      game2048.startReplay(replaySeed, replayMoves);
    }
  }
}

// ---------- Класс игры 2048 с поддержкой replay и достижений ----------
class Game2048 {
  constructor(boardEl, scoreEl, bestEl, statusEl, replayBtn) {
    this.boardEl = boardEl;
    this.scoreEl = scoreEl;
    this.bestEl = bestEl;
    this.statusEl = statusEl;
    this.replayBtn = replayBtn;
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
    this.rng = null;
    this.seed = Date.now();
    this.moveHistory = [];
    this.moveCount = 0;
    this.mergedCombo = 0; // для ежедневного задания
    this.totalMerges = 0;
    this.lastAdded = null;
    this.mergedPositions = new Set();
    this.moveMap = null;
    this.gameOver = false;
    this.won = false;
    this.updateBestUI();
    this.init();
  }

  init() {
    this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
    this.score = 0;
    this.moveCount = 0;
    this.mergedCombo = 0;
    this.totalMerges = 0;
    this.moveHistory = [];
    this.gameOver = false;
    this.won = false;
    this.updateScoreUI();
    this.statusEl.textContent = '';
    this.replayBtn.style.display = 'none';
    if (!this.rng) this.rng = new SeededRandom(this.seed);
    this.addRandomTile();
    this.addRandomTile();
    this.render();
    this.checkAchievements();
    this.updateChallengeProgress();
  }

  addRandomTile() {
    const empty = [];
    for (let i = 0; i < this.size; i++)
      for (let j = 0; j < this.size; j++)
        if (this.grid[i][j] === 0) empty.push({x:i, y:j});
    if (empty.length > 0) {
      const {x, y} = empty[Math.floor(this.rng.next() * empty.length)];
      this.grid[x][y] = this.rng.next() < 0.9 ? 2 : 4;
      this.lastAdded = {x, y};
      return true;
    }
    return false;
  }

  move(direction) {
    if (this.gameOver || replayMode) return;
    const oldGrid = JSON.parse(JSON.stringify(this.grid));
    let gained = 0;
    this.mergedPositions.clear();
    this.moveMap = {};
    let mergeComboCount = 0;

    const slide = (row, isCol, idx, reverse) => {
      let arr = row.filter(v => v !== 0);
      let newRow = [];
      let mergedFlags = new Array(arr.length).fill(false);
      for (let i = 0; i < arr.length; i++) {
        if (i+1 < arr.length && arr[i] === arr[i+1] && !mergedFlags[i] && !mergedFlags[i+1]) {
          newRow.push(arr[i]*2);
          gained += arr[i]*2;
          mergedFlags[i] = mergedFlags[i+1] = true;
          mergeComboCount++;
          this.totalMerges++;
          i++;
        } else {
          newRow.push(arr[i]);
        }
      }
      while (newRow.length < this.size) newRow.push(0);
      // запись перемещений для анимации
      let oldVals = arr;
      let oldPtr = 0;
      for (let newPos = 0; newPos < this.size; newPos++) {
        if (newRow[newPos] === 0) continue;
        if (oldPtr < oldVals.length && oldVals[oldPtr]*2 === newRow[newPos] &&
            oldPtr+1 < oldVals.length && oldVals[oldPtr] === oldVals[oldPtr+1]) {
          this.recordMove(oldPtr, oldVals, newPos, isCol, idx, reverse, true, false);
          this.recordMove(oldPtr+1, oldVals, newPos, isCol, idx, reverse, true, true);
          oldPtr += 2;
        } else if (oldPtr < oldVals.length && oldVals[oldPtr] === newRow[newPos]) {
          this.recordMove(oldPtr, oldVals, newPos, isCol, idx, reverse, false, false);
          oldPtr++;
        }
      }
      return newRow;
    };

    if (direction === 'left') for (let i=0;i<this.size;i++) this.grid[i] = slide(this.grid[i], false, i, false);
    else if (direction === 'right') for (let i=0;i<this.size;i++) { let rev = [...this.grid[i]].reverse(); this.grid[i] = slide(rev, false, i, true).reverse(); }
    else if (direction === 'up') for (let j=0;j<this.size;j++) { let col = []; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); let res = slide(col, true, j, false); for (let i=0;i<this.size;i++) this.grid[i][j] = res[i]; }
    else if (direction === 'down') for (let j=0;j<this.size;j++) { let col = []; for (let i=0;i<this.size;i++) col.push(this.grid[i][j]); let rev = col.reverse(); let res = slide(rev, true, j, true).reverse(); for (let i=0;i<this.size;i++) this.grid[i][j] = res[i]; }

    this.mergedCombo = mergeComboCount;
    const changed = !this.gridsAreEqual(oldGrid, this.grid);
    if (changed) {
      this.score += gained;
      this.moveCount++;
      this.moveHistory.push(direction);
      this.updateScoreUI();
      this.addRandomTile();
      this.render();
      this.checkAchievements();
      this.updateChallengeProgress();
      if (this.checkWin()) {
        this.statusEl.textContent = 'Вы победили! 🎉';
        this.gameOver = true;
        this.won = true;
        this.submitScoreToLeaderboard();
        this.showReplayButton();
      } else if (this.checkLose()) {
        this.statusEl.textContent = 'Игра окончена 😔';
        this.gameOver = true;
        this.submitScoreToLeaderboard();
        this.showReplayButton();
      }
    } else {
      this.moveMap = null;
    }
  }

  // ... (остальные методы: recordMove, render, проверки и т.д., аналогично исходному коду, но с заменой Math.random на this.rng.next())

  resetGame() {
    this.seed = Date.now();
    this.rng = new SeededRandom(this.seed);
    this.init();
    this.render();
  }

  showReplayButton() {
    if (this.replayBtn) {
      this.replayBtn.style.display = 'inline-block';
      this.replayBtn.onclick = () => this.shareReplay();
    }
  }

  shareReplay() {
    // Кодируем seed и ходы в строку
    const movesStr = this.moveHistory.map(d => d[0]).join(''); // 'l','r','u','d'
    const payload = `${this.seed}_${movesStr}`;
    const shareUrl = `https://t.me/${BOT_USERNAME}?startapp=replay_${payload}`;
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=Смотри%20мой%20реплей%202048!`);
    } else {
      fallbackCopyToClipboard(shareUrl);
    }
  }

  // Метод для replay: запуск симуляции
  startReplay(seed, moves) {
    replayMode = true;
    this.seed = seed;
    this.rng = new SeededRandom(seed);
    this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
    this.addRandomTile();
    this.addRandomTile();
    this.render();
    replayMoves = moves;
    replayIndex = 0;
    document.getElementById('replay-viewer').style.display = 'block';
    this.replayBtn.style.display = 'none';
    document.getElementById('new-game-btn').style.display = 'none';
    this.setupReplayControls();
  }

  setupReplayControls() {
    const playBtn = document.getElementById('replay-play');
    const speedBtn = document.getElementById('replay-speed');
    const stepSpan = document.getElementById('replay-step');
    let playing = false;

    const doStep = () => {
      if (replayIndex >= replayMoves.length) {
        clearInterval(replayInterval);
        playing = false;
        playBtn.textContent = '▶️';
        this.statusEl.textContent = 'Реплей завершён';
        return;
      }
      this.move(replayMoves[replayIndex]);
      replayIndex++;
      stepSpan.textContent = `${replayIndex}/${replayMoves.length}`;
    };

    playBtn.onclick = () => {
      if (playing) {
        clearInterval(replayInterval);
        playing = false;
        playBtn.textContent = '▶️';
      } else {
        playing = true;
        playBtn.textContent = '⏸️';
        replayInterval = setInterval(doStep, 300 / replaySpeed);
      }
    };

    speedBtn.onclick = () => {
      replaySpeed = replaySpeed === 1 ? 2 : (replaySpeed === 2 ? 4 : 1);
      speedBtn.textContent = replaySpeed + 'x';
      if (playing) {
        clearInterval(replayInterval);
        replayInterval = setInterval(doStep, 300 / replaySpeed);
      }
    };
  }

  // Достижения и испытания
  checkAchievements() {
    const earned = JSON.parse(localStorage.getItem('achievements') || '{}');
    let updated = false;
    ACHIEVEMENTS.forEach(a => {
      if (!earned[a.id] && a.check(this)) {
        earned[a.id] = true;
        updated = true;
        showNotification(`🏆 Достижение: ${a.name}!`);
      }
    });
    if (updated) {
      localStorage.setItem('achievements', JSON.stringify(earned));
      loadAchievementsUI();
      updateProfileBadges(earned);
    }
  }

  updateChallengeProgress() {
    this.updateDailyProgress();
    this.updateWeeklyProgress();
  }
  // ... (методы для дейли/викли задач с использованием localStorage)
}

// ---------- Вспомогательные функции для испытаний ----------
function loadChallengesUI() {
  const today = new Date().toISOString().slice(0,10);
  const dailyData = JSON.parse(localStorage.getItem('dailyChallenge') || '{}');
  // выбор задания на основе хеша даты
  // ... реализация
  document.getElementById('daily-desc').textContent = currentDaily.desc;
  // прогресс и статус
}

// ... остальные функции инициализации, replay param check и т.д.

function checkReplayParam() {
  if (window.Telegram?.WebApp) {
    const param = window.Telegram.WebApp.initDataUnsafe?.start_param;
    if (param && param.startsWith('replay_')) {
      const data = param.replace('replay_', '');
      const [seedStr, movesStr] = data.split('_');
      if (seedStr && movesStr) {
        replaySeed = parseInt(seedStr);
        replayMoves = movesStr.split('').map(c => {
          switch(c) {
            case 'l': return 'left';
            case 'r': return 'right';
            case 'u': return 'up';
            case 'd': return 'down';
            default: return 'left';
          }
        });
        replayMode = true;
        document.querySelector('.game-tabs .game-tab[data-tab="play"]').click();
      }
    }
  }
}

// ... остальной код (лидерборд, кнопки, профиль) адаптирован под новые элементы.
