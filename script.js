const BOT_USERNAME = 'khadron_bot';
let currentUserId = null;
const WORKER_URL = 'https://gamesverse-bot.scarneb.workers.dev';

let userProfile = { coins: 0, level: 1, exp: 0, boosters: {}, isPro: false };
let currentTournament = null;
let achievementsData = [];
let isPro = false;
let game2048 = null;

const GAMES_DATA = [
  { id: 0, name: "Pixel World", fullLink: "https://t.me/pixelworld/play?startapp=r6823288584", description: "Первый 3D-шутер в Telegram", rating: 4.9, players: "34K", image: "images/photo_2026-02-17_13-44-55.jpg", fallback: "🌍", badge: "Beta", highlight: true },
  { id: 1, name: "Hamster GameDev", fullLink: "https://t.me/Hamster_GAme_Dev_bot/start?startapp=kentId6823288584", description: "Создай свою студию", rating: 4.7, players: "368K", image: "images/hamster-gamedev.jpg", fallback: "🎮" },
  { id: 2, name: "Hamster King", fullLink: "https://t.me/hamsterking_game_bot?startapp=6823288584", description: "Стань королем хомяков", rating: 4.2, players: "188K", image: "images/hamster-king.jpg", fallback: "👑" },
  { id: 3, name: "Hamster Fight Club", fullLink: "https://t.me/hamster_fightclub_bot?startapp=NWE1YjA2YWUtZTAyMS01ZjA1LTg4ZTYtMGZmZjUwNDQwNjU5", description: "Бойцовский клуб хомяков", rating: 4.9, players: "85K", image: "images/hamster-fightclub.jpg", fallback: "🥊" },
  { id: 4, name: "BitQuest", fullLink: "https://t.me/BitquestGameSBot/start?startapp=kentId_6823288584", description: "Приключения в мире крипты", rating: 3.8, players: "281K", image: "images/bitquest.jpg", fallback: "💰" }
];

const TASKS_DATA = [
  { id: 1, name: "Bybit", url: "https://www.bybit.com/invite?ref=57KXPMO", description: "Зарегистрируйся на Bybit", image: "images/bybit.jpg", fallback: "💱", reward: 20, dailyLimit: 1 },
  { id: 2, name: "BingX", url: "https://bingxdao.com/referral-program/V2TZVA?activityId=g_1529293499868241925", description: "Присоединись к BingX", image: "images/bingx.jpg", fallback: "📈", reward: 20, dailyLimit: 1 },
  { id: 3, name: "Bitget", url: "https://www.bitgetapps.com/ru/referral/register?clacCode=40FSP70H", description: "Создай аккаунт Bitget", image: "images/bitget.jpg", fallback: "⚡", reward: 20, dailyLimit: 1 },
  { id: 4, name: "MEXC", url: "https://promote.mexc.com/r/aTSLfdm54W", description: "Торгуй на MEXC", image: "images/mexc.jpg", fallback: "🌍", reward: 20, dailyLimit: 1 }
];

// Утилиты
function vibrate() { if (navigator.vibrate) navigator.vibrate(50); }
function showNotification(msg) {
  const n = document.getElementById('notification');
  n.textContent = msg || 'Ссылка скопирована!';
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 2000);
}
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('splash-screen').style.display = 'none';
  initializeApp();
});

function initializeApp() {
  initializeTelegramWebApp();
  setupNavigation();
  initializeGames();
  initializeTasks();
  setupSettingsPanel();
  loadThemePreference();
  setupShareButton();
  initGame2048();
  setupLeaderboardRefresh();
  setupLeaderboardShare();
  loadUserData();
  loadTournament();
}

function initializeTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
  }
}

// Навигация
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      vibrate();
      const target = this.getAttribute('data-section');
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(target)?.classList.add('active');
      if (target === 'game-section') fetchLeaderboard();
      if (target === 'tournaments-section') loadTournament();
      if (target === 'profile-section') loadProfileData(currentUserId);
    });
  });
}

function initializeGames() {
  const grid = document.getElementById('games-grid');
  if (!grid) return;
  grid.innerHTML = GAMES_DATA.map(g => `
    <div class="game-card ${g.highlight ? 'highlight' : ''}">
      <div class="game-image"><img src="${g.image}" alt="${g.name}" onerror="this.style.display='none'"><span>${g.fallback}</span></div>
      <div class="game-info">
        <h3>${g.name}</h3><p class="game-description">${g.description}</p>
        <div class="game-stats"><span>⭐ ${g.rating}</span><span>👥 ${g.players}</span></div>
      </div>
      <button class="play-button" data-link="${g.fullLink}">Играть</button>
    </div>
  `).join('');
  document.querySelectorAll('.play-button').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      vibrate();
      const link = this.dataset.link;
      if (link) {
        if (window.Telegram?.WebApp) {
          if (link.startsWith('https://t.me/')) window.Telegram.WebApp.openTelegramLink(link);
          else window.Telegram.WebApp.openLink(link);
        } else window.open(link, '_blank');
      }
    });
  });
}

function initializeTasks() {
  const list = document.getElementById('tasks-list');
  if (!list) return;
  list.innerHTML = TASKS_DATA.map(t => `
    <div class="task-card">
      <div class="task-image"><img src="${t.image}" alt="${t.name}" onerror="this.style.display='none'"><span>${t.fallback}</span></div>
      <div class="task-info"><h3>${t.name}</h3><p>${t.description}</p></div>
      <div class="task-reward">+${t.reward} 🪙</div>
      <button class="task-btn" data-task-id="${t.id}" data-url="${t.url}">Перейти</button>
    </div>
  `).join('');
  document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      vibrate();
      if (!currentUserId) return showNotification('Откройте в Telegram');
      const taskId = parseInt(btn.dataset.taskId);
      const url = btn.dataset.url;
      if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url);
      else window.open(url, '_blank');
      try {
        const res = await fetch(`${WORKER_URL}/completeTask`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ userId: currentUserId.toString(), taskId })
        });
        const data = await res.json();
        if (res.ok) {
          userProfile.coins += data.reward;
          updateProfileUI();
          Telegram.WebApp.showPopup({ message: `✅ +${data.reward} монет за "${data.taskName}"` });
        } else {
          Telegram.WebApp.showPopup({ message: data.error || 'Лимит' });
        }
      } catch(e) {}
    });
  });
}

// Профиль
function loadUserData() {
  if (window.Telegram?.WebApp) {
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    if (user) {
      updateProfileDisplay(user);
      currentUserId = user.id;
      sendMiniAppStat(user);
      loadProfileData(user.id);
    }
  }
}
async function sendMiniAppStat(user) {
  let ref = null;
  try { ref = window.Telegram.WebApp.initDataUnsafe?.start_param; } catch(e){}
  await fetch(`${WORKER_URL}/track`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ userId: user.id.toString(), firstName: user.first_name, username: user.username, ref })
  });
}
function updateProfileDisplay(user) {
  document.getElementById('user-name').textContent = user.first_name + (user.last_name ? ' '+user.last_name : '');
  document.getElementById('user-username').textContent = user.username ? '@'+user.username : 'Telegram User';
  const img = document.getElementById('avatar-img');
  if (user.photo_url) {
    img.src = user.photo_url;
    img.style.display = 'block';
    document.getElementById('avatar-fallback').style.display = 'none';
  } else {
    img.style.display = 'none';
    document.getElementById('avatar-fallback').style.display = 'flex';
    document.getElementById('avatar-fallback').textContent = user.first_name.charAt(0).toUpperCase();
  }
}
async function loadProfileData(userId) {
  if (!userId) return;
  const [profileRes, subRes, achRes] = await Promise.all([
    fetch(`${WORKER_URL}/getProfile?userId=${userId}`),
    fetch(`${WORKER_URL}/checkSubscription?userId=${userId}`),
    fetch(`${WORKER_URL}/achievements?userId=${userId}`)
  ]);
  if (profileRes.ok) {
    userProfile = await profileRes.json();
    updateProfileUI();
    renderProfileStore();
  }
  if (subRes.ok) {
    const subData = await subRes.json();
    isPro = subData.isPro;
    updateProStatus(subData);
  }
  if (achRes.ok) {
    const achData = await achRes.json();
    achievementsData = achData.achievements;
    renderAchievements();
  }
}
function updateProfileUI() {
  document.getElementById('coins-amount').textContent = userProfile.coins;
  if (game2048) updateBoosterUI();
}
function updateBoosterUI() {
  ['undo','remove','extra_life'].forEach(type => {
    const btn = document.getElementById(`booster-${type === 'extra_life' ? 'life' : type}`);
    const countEl = btn?.querySelector('.booster-count');
    if (countEl) countEl.textContent = userProfile.boosters[type] || 0;
  });
}

// Ежедневный бонус
document.getElementById('daily-bonus-btn')?.addEventListener('click', async () => {
  if (!currentUserId) return;
  const res = await fetch(`${WORKER_URL}/claimDaily`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ userId: currentUserId.toString() })
  });
  const data = await res.json();
  if (res.ok) {
    userProfile.coins += data.bonus;
    updateProfileUI();
    Telegram.WebApp.showPopup({ message: `🎉 +${data.bonus} монет!` });
  } else {
    Telegram.WebApp.showPopup({ message: data.error || 'Уже получено' });
  }
});

// PRO подписка
function updateProStatus(subData) {
  const container = document.getElementById('pro-status');
  if (!container) return;
  if (subData.isPro) {
    container.innerHTML = `<span class="pro-badge">⭐ PRO</span> до ${new Date(subData.pro_until).toLocaleDateString()}`;
  } else {
    container.innerHTML = `<button id="subscribe-pro-btn" class="subscribe-btn">Стать PRO</button>`;
    document.getElementById('subscribe-pro-btn')?.addEventListener('click', subscribePro);
  }
}
async function subscribePro() {
  if (!currentUserId) return;
  vibrate();
  Telegram.WebApp.requestInvoice({
    title: 'PRO Подписка',
    description: 'Games Verse PRO на 30 дней',
    payload: 'pro_monthly',
    currency: 'XTR',
    prices: [{ label: 'PRO подписка', amount: 200 }]
  }, async (result) => {
    if (result.status === 'paid') {
      const res = await fetch(`${WORKER_URL}/subscribe`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ userId: currentUserId.toString(), invoicePayload: 'pro_monthly' })
      });
      const data = await res.json();
      isPro = true;
      updateProStatus({ isPro: true, pro_until: data.pro_until });
      Telegram.WebApp.showPopup({ message: '✅ Вы PRO!' });
    }
  });
}

// Магазин в профиле
function renderProfileStore() {
  const store = document.getElementById('profile-store');
  if (!store) return;
  store.innerHTML = `
    <div class="store-card"><div class="store-icon">↩️</div><h3>Отменить ход</h3><p>${isPro ? '40' : '50'} 🪙</p><button class="store-buy-btn" data-booster="undo">Купить</button></div>
    <div class="store-card"><div class="store-icon">💣</div><h3>Убрать плитку</h3><p>${isPro ? '80' : '100'} 🪙</p><button class="store-buy-btn" data-booster="remove">Купить</button></div>
    <div class="store-card"><div class="store-icon">❤️</div><h3>Доп. жизнь</h3><p>${isPro ? '160' : '200'} 🪙</p><button class="store-buy-btn" data-booster="extra_life">Купить</button></div>
    <div class="store-card"><div class="store-icon">▶️</div><h3>Реклама</h3><p>+${isPro ? '100' : '50'} 🪙</p><button id="watch-ad-btn">Смотреть</button></div>
  `;
  document.querySelectorAll('.store-buy-btn[data-booster]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!currentUserId) return;
      const boosterType = btn.dataset.booster;
      const res = await fetch(`${WORKER_URL}/buyBooster`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ userId: currentUserId.toString(), boosterType })
      });
      const data = await res.json();
      if (res.ok) {
        userProfile.coins = data.balance;
        userProfile.boosters[boosterType] = (userProfile.boosters[boosterType] || 0) + 1;
        updateProfileUI();
        Telegram.WebApp.showPopup({ message: '✅ Куплено!' });
      } else {
        Telegram.WebApp.showPopup({ message: data.error || 'Ошибка' });
      }
    });
  });
  document.getElementById('watch-ad-btn')?.addEventListener('click', () => {
    if (!currentUserId) return;
    if (window.Telegram?.WebApp?.showAd) {
      window.Telegram.WebApp.showAd((status) => {
        if (status === 'finished') {
          fetch(`${WORKER_URL}/adReward`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ userId: currentUserId.toString() })
          }).then(r => r.json()).then(d => {
            if (d.success) {
              userProfile.coins += d.reward;
              updateProfileUI();
              Telegram.WebApp.showPopup({ message: `🎬 +${d.reward} монет` });
            }
          });
        }
      });
    } else {
      Telegram.WebApp.showPopup({ message: 'Реклама недоступна' });
    }
  });
}

// Достижения
function renderAchievements() {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;
  grid.innerHTML = achievementsData.map(a => `
    <div class="achievement-item ${a.unlocked ? 'unlocked' : ''}" ${a.unlocked ? '' : `onclick="claimAchievement(${a.id})"`}>
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-reward">+${a.reward_coins} 🪙</div>
    </div>
  `).join('');
}
async function claimAchievement(id) {
  if (!currentUserId) return;
  const res = await fetch(`${WORKER_URL}/claimAchievement`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ userId: currentUserId.toString(), achievementId: id })
  });
  const data = await res.json();
  if (res.ok) {
    userProfile.coins += data.reward;
    updateProfileUI();
    loadProfileData(currentUserId);
  } else {
    Telegram.WebApp.showPopup({ message: data.error || 'Не удалось' });
  }
}

// Турниры
async function loadTournament() {
  const container = document.getElementById('current-tournament');
  if (!container) return;
  const res = await fetch(`${WORKER_URL}/tournaments/current`);
  const data = await res.json();
  if (!data.active) { container.innerHTML = '<p>Нет активных турниров</p>'; return; }
  currentTournament = data.tournament;
  container.innerHTML = `
    <div class="tournament-banner">
      <h2>${currentTournament.name}</h2>
      <div class="tournament-timer" id="tournament-timer"></div>
      <div class="tournament-rewards"><span class="reward-item">🥇 5000 🪙</span><span class="reward-item">🥈 3000 🪙</span><span class="reward-item">🥉 1000 🪙</span></div>
    </div>
    <div class="tournament-leaderboard" id="tournament-leaderboard"></div>
  `;
  updateTimer();
  loadTournamentLeaderboard();
  setInterval(updateTimer, 1000);
}
function updateTimer() {
  if (!currentTournament) return;
  const now = new Date();
  const end = new Date(currentTournament.end_time);
  const diff = end - now;
  const timerEl = document.getElementById('tournament-timer');
  if (!timerEl) return;
  if (diff <= 0) { timerEl.textContent = 'Завершён'; return; }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  timerEl.textContent = `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
async function loadTournamentLeaderboard() {
  const res = await fetch(`${WORKER_URL}/tournaments/leaderboard?tournamentId=${currentTournament.id}`);
  const data = await res.json();
  const list = document.getElementById('tournament-leaderboard');
  list.innerHTML = data.leaderboard.map((p, i) => `
    <div class="leaderboard-item ${p.user_id == currentUserId ? 'current-user' : ''}">
      <div class="leaderboard-rank">#${i+1}</div>
      <div class="leaderboard-info">${escapeHtml(p.first_name)}</div>
      <div class="leaderboard-score">${p.score}</div>
    </div>
  `).join('');
}

// 2048 Game
class Game2048 {
  constructor(boardEl, scoreEl, bestEl, statusEl) {
    this.boardElement = boardEl;
    this.scoreElement = scoreEl;
    this.bestScoreElement = bestEl;
    this.statusElement = statusEl;
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
    this.updateBestScoreUI();
    this.init();
    this.setupSwipeEvents();
    this.setupKeyboardEvents();
  }
  init() {
    this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
    this.score = 0;
    this.updateScoreUI();
    this.statusElement.textContent = '';
    this.addRandomTile();
    this.addRandomTile();
    this.render();
  }
  addRandomTile() {
    const empty = [];
    for (let i=0;i<4;i++) for (let j=0;j<4;j++) if (this.grid[i][j]===0) empty.push({x:i,y:j});
    if (empty.length) {
      const {x,y}=empty[Math.floor(Math.random()*empty.length)];
      this.grid[x][y]=Math.random()<0.9?2:4;
      return true;
    }
    return false;
  }
  move(dir) {
    const old = JSON.stringify(this.grid);
    let gained=0;
    const slide = (arr, reverse)=>{
      let line = reverse?[...arr].reverse():[...arr];
      let filtered=line.filter(v=>v!==0);
      for (let i=0;i<filtered.length-1;i++) {
        if(filtered[i]===filtered[i+1]){filtered[i]*=2; gained+=filtered[i]; filtered.splice(i+1,1);}
      }
      while(filtered.length<4) filtered.push(0);
      return reverse?filtered.reverse():filtered;
    };
    if(dir==='left') for(let i=0;i<4;i++) this.grid[i]=slide(this.grid[i],false);
    else if(dir==='right') for(let i=0;i<4;i++) this.grid[i]=slide(this.grid[i],true);
    else if(dir==='up') for(let j=0;j<4;j++){let col=[];for(let i=0;i<4;i++) col.push(this.grid[i][j]); col=slide(col,false); for(let i=0;i<4;i++) this.grid[i][j]=col[i];}
    else if(dir==='down') for(let j=0;j<4;j++){let col=[];for(let i=0;i<4;i++) col.push(this.grid[i][j]); col=slide(col,true); for(let i=0;i<4;i++) this.grid[i][j]=col[i];}
    if(JSON.stringify(this.grid)!==old) {
      this.score+=gained;
      this.updateScoreUI();
      this.addRandomTile();
      this.render();
      if(this.checkWin()) { this.statusElement.textContent='Вы победили!'; this.submitScore(); }
      else if(this.checkLose()) { this.statusElement.textContent='Игра окончена'; this.submitScore(); }
    }
  }
  checkWin(){ return this.grid.some(row=>row.includes(2048)); }
  checkLose(){
    for(let i=0;i<4;i++) for(let j=0;j<4;j++) if(this.grid[i][j]===0) return false;
    for(let i=0;i<3;i++) for(let j=0;j<4;j++) if(this.grid[i][j]===this.grid[i+1][j]) return false;
    for(let i=0;i<4;i++) for(let j=0;j<3;j++) if(this.grid[i][j]===this.grid[i][j+1]) return false;
    return true;
  }
  render(){
    this.boardElement.innerHTML='';
    for(let i=0;i<4;i++) for(let j=0;j<4;j++){
      const tile=document.createElement('div'); tile.className='tile-cell';
      if(this.grid[i][j]){ tile.classList.add('tile-'+this.grid[i][j]); tile.textContent=this.grid[i][j]; }
      this.boardElement.appendChild(tile);
    }
  }
  updateScoreUI(){ this.scoreElement.textContent=this.score; if(this.score>this.bestScore){ this.bestScore=this.score; localStorage.setItem('bestScore2048',this.bestScore); this.updateBestScoreUI(); } }
  updateBestScoreUI(){ this.bestScoreElement.textContent=this.bestScore; }
  submitScore(){
    if(!currentUserId) return;
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if(!user) return;
    fetch(`${WORKER_URL}/submit-score`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({userId:currentUserId.toString(), firstName:user.first_name, username:user.username||'', score:this.score, avatarUrl:user.photo_url||''})
    });
    // Отправка в турнир
    if(currentTournament) {
      fetch(`${WORKER_URL}/tournaments/submit-score`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({userId:currentUserId.toString(), score:this.score})
      });
    }
  }
  setupSwipeEvents(){
    let sx=0,sy=0;
    this.boardElement.addEventListener('touchstart',e=>{sx=e.touches[0].clientX; sy=e.touches[0].clientY;});
    this.boardElement.addEventListener('touchend',e=>{
      if(!sx) return;
      let dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)<20&&Math.abs(dy)<20) return;
      if(Math.abs(dx)>Math.abs(dy)) dx>0?this.move('right'):this.move('left');
      else dy>0?this.move('down'):this.move('up');
      sx=0;sy=0; vibrate();
    });
  }
  setupKeyboardEvents(){
    window.addEventListener('keydown',e=>{
      if(document.querySelector('#game-section.active')){
        const k=e.key;
        if(k==='ArrowLeft'){this.move('left');e.preventDefault();vibrate();}
        else if(k==='ArrowRight'){this.move('right');e.preventDefault();vibrate();}
        else if(k==='ArrowUp'){this.move('up');e.preventDefault();vibrate();}
        else if(k==='ArrowDown'){this.move('down');e.preventDefault();vibrate();}
      }
    });
  }
  resetGame(){ this.init(); }
}

function initGame2048(){
  const board=document.getElementById('game-board-2048');
  if(board && !game2048){
    game2048=new Game2048(board, document.getElementById('game-score'), document.getElementById('best-score'), document.getElementById('game-status'));
    document.getElementById('new-game-btn').addEventListener('click',()=>{vibrate();game2048.resetGame();});
  }
}

// Бустеры в 2048
async function useBooster(type) {
  if(!currentUserId) return;
  if(!userProfile.boosters[type]||userProfile.boosters[type]<=0){
    Telegram.WebApp.showPopup({message:'Нет бустеров!'}); return;
  }
  const res = await fetch(`${WORKER_URL}/useBooster`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({userId:currentUserId.toString(), boosterType:type})
  });
  if(res.ok){
    userProfile.boosters[type]--;
    updateBoosterUI();
    if(type==='undo') game2048.undo();
    else if(type==='remove') game2048.removeRandomTile();
    else if(type==='extra_life') game2048.extraLife();
  }
}
document.getElementById('booster-undo')?.addEventListener('click',()=>useBooster('undo'));
document.getElementById('booster-remove')?.addEventListener('click',()=>useBooster('remove'));
document.getElementById('booster-life')?.addEventListener('click',()=>useBooster('extra_life'));

// Заглушки для бустеров в Game2048 (допишите реальную логику при желании)
Game2048.prototype.undo = function(){ alert('Отмена хода не реализована'); };
Game2048.prototype.removeRandomTile = function(){
  const tiles=[];
  for(let i=0;i<4;i++) for(let j=0;j<4;j++) if(this.grid[i][j]) tiles.push([i,j]);
  if(tiles.length) { const [x,y]=tiles[Math.floor(Math.random()*tiles.length)]; this.grid[x][y]=0; this.render(); }
};
Game2048.prototype.extraLife = function(){
  this.removeRandomTile(); this.removeRandomTile();
  this.statusElement.textContent='Продолжайте!';
};

// Лидерборд
async function fetchLeaderboard(){
  const res=await fetch(`${WORKER_URL}/leaderboard`);
  const data=await res.json();
  const list=document.getElementById('leaderboard-list');
  list.innerHTML = data.leaderboard.map((p,i)=>`
    <div class="leaderboard-item ${p.user_id==currentUserId?'current-user':''}">
      <div class="leaderboard-rank">#${i+1}</div>
      <div class="leaderboard-avatar">${p.first_name.charAt(0)}</div>
      <div class="leaderboard-info">${escapeHtml(p.first_name)}</div>
      <div class="leaderboard-score">${p.score}</div>
    </div>
  `).join('');
}
function setupLeaderboardRefresh(){ document.getElementById('refresh-leaderboard')?.addEventListener('click',()=>{vibrate();fetchLeaderboard();}); }
function setupLeaderboardShare(){
  document.getElementById('leaderboard-list')?.addEventListener('click',e=>{
    const btn=e.target.closest('.leaderboard-share-btn');
    if(btn){
      const name=btn.dataset.shareName, score=btn.dataset.shareScore;
      if(name&&score) shareText(`🏆 ${name} набрал ${score} очков в 2048! https://t.me/${BOT_USERNAME}`);
    }
  });
}

// Шеринг
function setupShareButton(){
  document.getElementById('share-friends-button')?.addEventListener('click',()=>{
    vibrate();
    const link = currentUserId ? `https://t.me/${BOT_USERNAME}?start=ref_${currentUserId}` : `https://t.me/${BOT_USERNAME}`;
    const text = 'Играй в лучшие мини-игры Telegram вместе со мной! 🎮';
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
    } else if (navigator.share) {
      navigator.share({ title:'Games Verse', text, url:link }).catch(()=>copyToClipboard(link));
    } else copyToClipboard(link);
  });
}
function copyToClipboard(text){
  const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showNotification();
}

function loadThemePreference(){
  const saved=localStorage.getItem('theme')||'light';
  if(saved==='dark') document.body.classList.add('dark-theme');
}
function setupSettingsPanel(){
  document.getElementById('settings-button')?.addEventListener('click',()=>document.getElementById('settings-panel').classList.add('active'));
  document.getElementById('close-settings')?.addEventListener('click',()=>document.getElementById('settings-panel').classList.remove('active'));
  document.querySelectorAll('.theme-option').forEach(opt=>{
    opt.addEventListener('click',function(){
      const theme=this.dataset.theme;
      document.querySelectorAll('.theme-option').forEach(o=>o.classList.remove('active'));
      this.classList.add('active');
      document.body.classList.toggle('dark-theme', theme==='dark');
      localStorage.setItem('theme', theme);
    });
  });
}
