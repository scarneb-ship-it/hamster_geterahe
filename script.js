/* =========================================================
   ЖЕЛЕЗНЫЙ ПЛАН — данные тренировок и логика приложения
   ========================================================= */

/* ---------- 1. ДАННЫЕ ПРОГРАММЫ ---------- */

const WARMUP = {
  title: 'Разминка',
  subtitle: '5 минут перед каждым днём',
  totalSeconds: 5 * 60,
  items: [
    { num: '47', name: 'Круги руками', mode: 'time', duration: 30 },
    { num: '50', name: 'Вращение руками', mode: 'time', duration: 30 },
    { num: '85', name: 'Поза кошки-коровы', mode: 'reps', repsLabel: '10 повторов' },
    { num: '15', name: 'Приседания (без веса)', mode: 'reps', repsLabel: '10 повторов' },
    { num: '11', name: 'Отжимание от стены', mode: 'reps', repsLabel: '10 раз' }
  ]
};

const COOLDOWN = {
  title: 'Заминка',
  subtitle: '3 минуты после каждого дня',
  totalSeconds: 3 * 60,
  numbersText: '№116–122, 142–143, 169–171',
  note: 'Выберите любые растяжки из этого списка и удерживайте их всю заминку.'
};

const DAYS = {
  A: {
    title: 'День A · Силовая база',
    subtitle: 'Турник + гантели · развиваем силу спины, ног и плеч',
    exercises: [
      { num: '238', name: 'Подтягивания широким хватом', sets: 4, mode: 'reps', repsLabel: 'Максимум',
        rest: 135, restLabel: '120–150 сек',
        note: 'Не получается ни разу? Замените на №148 «Отжимания с коленей с задержкой внизу» — 3 подхода на максимум.' },
      { num: '15', name: 'Приседания (с гантелью у груди)', sets: 4, mode: 'reps', repsLabel: '8–10',
        rest: 120, restLabel: '120 сек' },
      { num: '178', name: 'Жим гантелей над головой (сидя)', sets: 4, mode: 'reps', repsLabel: '8–10',
        rest: 105, restLabel: '90–120 сек' },
      { num: '179', name: 'Гребля в наклоне (с гантелями)', sets: 3, mode: 'reps', repsLabel: '10–12',
        rest: 90, restLabel: '90 сек' },
      { num: '39', name: 'Ягодичный мостик (с гантелью на тазу)', sets: 3, mode: 'reps', repsLabel: '12–15',
        rest: 60, restLabel: '60 сек' },
      { num: '4', name: 'Планка', sets: 3, mode: 'time', duration: 55, durationLabel: '45–60 сек',
        rest: 45, restLabel: '45 сек' }
    ]
  },
  B: {
    title: 'День B · Мышечный рост',
    subtitle: 'Гипертрофия и изоляция · акцент на ноги и руки',
    exercises: [
      { num: '58 / 66', name: 'Болгарский сплит-присед (левая / правая)', sets: 3, mode: 'reps',
        repsLabel: '10 на каждую', sides: true, rest: 90, restLabel: '90 сек' },
      { num: '14', name: 'Отжимания от пола (классические)', sets: 3, mode: 'reps', repsLabel: '10–15',
        rest: 75, restLabel: '60–90 сек' },
      { num: '241', name: 'Подтягивания обратным хватом', sets: 3, mode: 'reps', repsLabel: 'Максимум',
        rest: 90, restLabel: '90 сек' },
      { num: '182', name: 'Подъём гантелей в стороны', sets: 3, mode: 'reps', repsLabel: '12–15',
        rest: 50, restLabel: '45–60 сек' },
      { num: '195 / 196', name: 'Подъём гантели сидя на бицепс (левая / правая)', sets: 3, mode: 'reps',
        repsLabel: '10–12 на каждую', sides: true, rest: 60, restLabel: '60 сек' },
      { num: '181', name: 'Подъём гантели на трицепс (стоя)', sets: 3, mode: 'reps', repsLabel: '10–12',
        rest: 60, restLabel: '60 сек' },
      { num: '5', name: 'Обратные скручивания', sets: 3, mode: 'reps', repsLabel: '15–20',
        rest: 30, restLabel: '30 сек' }
    ]
  },
  C: {
    title: 'День C · Жиросжигание и кор',
    subtitle: 'Круговая тренировка · 4 круга · отдых 90 сек между кругами',
    circuit: true,
    rounds: 4,
    restBetweenRounds: 90,
    exercises: [
      { num: '221', name: 'Медленный альпинист', mode: 'time', duration: 40,
        tech: 'Без прыжков. Плавно подтягиваем колено к локтю.' },
      { num: '75 / 74', name: 'Мостик на одной ноге (правая / левая)', mode: 'reps',
        repsLabel: '12 на каждую', sides: true,
        tech: 'В верхней точке — сильное сжатие ягодицы.' },
      { num: '95', name: 'Жук на спине', mode: 'reps', repsLabel: '10 раз',
        tech: 'Идеальное упражнение для глубоких мышц живота.' },
      { num: '12', name: 'Обратные отжимания от стула', mode: 'reps', repsLabel: '12–15 раз',
        tech: 'Ноги прямые, локти назад.' },
      { num: '101', name: 'Гиперэкстензии (лёжа на животе)', mode: 'reps', repsLabel: '15 раз',
        tech: 'Оторвать грудь и ноги от пола, задержаться 2 сек.' },
      { num: '23 / 29', name: 'Планка на правом / левом боку', mode: 'time', duration: 30, sides: true,
        tech: 'Без прогиба в пояснице.' }
    ]
  }
};

const PROGRESSION_RULE_TEXT =
  'Сделали максимум повторений во всех подходах на двух тренировках подряд — берите гантель тяжелее на 1–2 кг. Гантели неразборные? Увеличивайте отдых до верхней границы диапазона.';

/* ---------- 2. STORAGE ---------- */

const LOG_KEY = 'ironplan_log_v1';

function getLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
  catch (e) { return []; }
}
function saveLogEntry(dayKey, quality) {
  const log = getLog();
  log.unshift({ day: dayKey, date: new Date().toISOString(), quality: !!quality });
  localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 200)));
}
function checkProgression(dayKey) {
  const entries = getLog().filter(e => e.day === dayKey).slice(0, 2);
  if (entries.length === 2 && entries.every(e => e.quality)) {
    return `${entries.length}/2 последних тренировок «${dayLabel(dayKey)}» — максимум повторений. Пора добавить гантелям 1–2 кг.`;
  }
  return null;
}
function dayLabel(k) {
  if (k === 'A') return 'Силовая база';
  if (k === 'B') return 'Мышечный рост';
  if (k === 'C') return 'Жиросжигание';
  return k;
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
         d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/* ---------- 3. DOM REFS ---------- */

const $ = sel => document.querySelector(sel);
const dayTabs = $('#dayTabs');
const mainContent = $('#mainContent');
const progressionBanner = $('#progressionBanner');
const progressionText = $('#progressionText');

const player = $('#player');
const playerCrumbs = $('#playerCrumbs');
const playerNum = $('#playerNum');
const playerName = $('#playerName');
const playerMeta = $('#playerMeta');
const playerNote = $('#playerNote');
const ring = $('#ring');
const ringOuter = $('#ringOuter');
const ringTime = $('#ringTime');
const ringPhase = $('#ringPhase');
const mainActionBtn = $('#mainActionBtn');
const skipBtn = $('#skipBtn');

const qualityModal = $('#qualityModal');
const logDrawer = $('#logDrawer');
const logList = $('#logList');

/* ---------- 4. STATE ---------- */

let currentView = 'A';
const sessionDone = { A: new Set(), B: new Set(), C: new Set(), warmup: new Set(), cooldown: false };

let steps = [];
let stepIdx = 0;
let sessionType = null; // 'A' | 'B' | 'C' | 'warmup' | 'cooldown'
let timeLeft = 0;
let totalTime = 0;
let ticking = false;
let intervalId = null;

/* ---------- 5. AUDIO / HAPTICS ---------- */

let audioCtx = null;
function beep(freq = 880, dur = 0.12) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio unavailable */ }
}
function haptic(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* ---------- 6. STEP GENERATION ---------- */

function buildDaySteps(dayKey, fromExerciseIdx = 0) {
  const day = DAYS[dayKey];
  const list = [];
  day.exercises.forEach((ex, exIdx) => {
    if (exIdx < fromExerciseIdx) return;
    for (let s = 1; s <= ex.sets; s++) {
      if (ex.sides) {
        ['левая', 'правая'].forEach((side, i) => {
          list.push(makeWorkStep(ex, exIdx, day.exercises.length, s, ex.sets, side));
        });
      } else {
        list.push(makeWorkStep(ex, exIdx, day.exercises.length, s, ex.sets, null));
      }
      const isLastSetOfEx = s === ex.sets;
      const isLastEx = exIdx === day.exercises.length - 1;
      if (!isLastSetOfEx) {
        list.push(makeRestStep(ex, exIdx, day.exercises.length, `Подход ${s} из ${ex.sets}`, ex.rest, ex.restLabel));
      } else if (!isLastEx) {
        list.push(makeRestStep(ex, exIdx, day.exercises.length, `Перед следующим упражнением`, ex.rest, ex.restLabel));
      }
    }
  });
  return list;
}

function buildCircuitSteps(dayKey) {
  const day = DAYS[dayKey];
  const list = [];
  for (let r = 1; r <= day.rounds; r++) {
    day.exercises.forEach((ex, exIdx) => {
      if (ex.sides) {
        ['правая', 'левая'].forEach(side => {
          list.push(makeCircuitWorkStep(ex, exIdx, day.exercises.length, r, day.rounds, side));
        });
      } else {
        list.push(makeCircuitWorkStep(ex, exIdx, day.exercises.length, r, day.rounds, null));
      }
    });
    if (r < day.rounds) {
      list.push({
        kind: 'rest', exNum: '', exName: 'Отдых между кругами', exIdx: -1, totalEx: day.exercises.length,
        setLabel: `Круг ${r} из ${day.rounds}`, duration: day.restBetweenRounds, note: null
      });
    }
  }
  return list;
}

function makeWorkStep(ex, exIdx, totalEx, setNum, totalSets, side) {
  return {
    kind: 'work',
    exNum: ex.num, exName: ex.name, exIdx, totalEx,
    setLabel: `Подход ${setNum} из ${totalSets}` + (side ? ` · ${side}` : ''),
    duration: ex.mode === 'time' ? ex.duration : null,
    repsLabel: ex.mode === 'time' ? (ex.durationLabel || `${ex.duration} сек`) : ex.repsLabel,
    note: ex.note || null
  };
}
function makeRestStep(ex, exIdx, totalEx, label, duration, restLabel) {
  return {
    kind: 'rest',
    exNum: ex.num, exName: 'Отдых', exIdx, totalEx,
    setLabel: label, duration: duration, repsLabel: restLabel, note: null
  };
}
function makeCircuitWorkStep(ex, exIdx, totalEx, round, totalRounds, side) {
  return {
    kind: 'work',
    exNum: ex.num, exName: ex.name, exIdx, totalEx,
    setLabel: `Круг ${round} из ${totalRounds}` + (side ? ` · ${side}` : ''),
    duration: ex.mode === 'time' ? ex.duration : null,
    repsLabel: ex.mode === 'time' ? `${ex.duration} сек` : ex.repsLabel,
    note: ex.tech || null
  };
}
function buildFreeformSteps(kind) {
  if (kind === 'warmup') {
    return WARMUP.items.map(it => ({
      kind: 'work', exNum: it.num, exName: it.name, exIdx: 0, totalEx: WARMUP.items.length,
      setLabel: 'Разминка', duration: it.mode === 'time' ? it.duration : null,
      repsLabel: it.mode === 'time' ? `${it.duration} сек` : it.repsLabel, note: null
    }));
  }
  // cooldown — single freeform timer
  return [{
    kind: 'work', exNum: 'Z', exName: 'Заминка · растяжка', exIdx: 0, totalEx: 1,
    setLabel: 'Свободный выбор растяжек', duration: COOLDOWN.totalSeconds,
    repsLabel: `${COOLDOWN.totalSeconds / 60} мин`, note: `${COOLDOWN.numbersText}. ${COOLDOWN.note}`
  }];
}

/* ---------- 7. SESSION ENGINE ---------- */

function startSession(type, steplist, startIdx = 0) {
  sessionType = type;
  steps = steplist;
  stepIdx = startIdx;
  player.hidden = false;
  document.body.style.overflow = 'hidden';
  setupStep();
}

function setupStep() {
  clearInterval(intervalId);
  ticking = false;
  const step = steps[stepIdx];
  if (!step) { finishSession(); return; }

  ring.classList.remove('is-rest', 'is-go');
  ring.classList.add(step.kind === 'rest' ? 'is-rest' : 'is-go');

  playerCrumbs.textContent = `${sessionTitle()} · ${stepIdx + 1} / ${steps.length}`;
  playerNum.textContent = step.exNum || '—';
  playerName.textContent = step.exName;
  playerMeta.textContent = step.setLabel + (step.repsLabel ? ` · ${step.repsLabel}` : '');
  if (step.note) { playerNote.hidden = false; playerNote.textContent = step.note; }
  else { playerNote.hidden = true; }

  ringPhase.textContent = step.kind === 'rest' ? 'ОТДЫХ' : (step.duration ? 'РАБОТА' : 'ГОТОВНОСТЬ');

  if (step.duration) {
    totalTime = step.duration;
    timeLeft = step.duration;
    updateRing();
    mainActionBtn.textContent = 'Старт';
    skipBtn.hidden = false;
  } else {
    totalTime = 0; timeLeft = 0;
    ringTime.textContent = '✓';
    ringOuter.style.setProperty('--progress', '360deg');
    mainActionBtn.textContent = 'Готово';
    skipBtn.hidden = true;
  }
}

function sessionTitle() {
  if (sessionType === 'warmup') return 'Разминка';
  if (sessionType === 'cooldown') return 'Заминка';
  return DAYS[sessionType].circuit ? DAYS[sessionType].title : DAYS[sessionType].title;
}

function updateRing() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  ringTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 360 : 0;
  ringOuter.style.setProperty('--progress', `${progress}deg`);
}

function toggleTimer() {
  const step = steps[stepIdx];
  if (!step.duration) { // manual step
    markExerciseProgress(step);
    beep(660, 0.08);
    nextStep();
    return;
  }
  if (ticking) {
    clearInterval(intervalId);
    ticking = false;
    mainActionBtn.textContent = 'Продолжить';
  } else {
    ticking = true;
    mainActionBtn.textContent = 'Пауза';
    intervalId = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 3 && timeLeft > 0) beep(440, 0.06);
      if (timeLeft <= 0) {
        clearInterval(intervalId);
        ticking = false;
        beep(880, 0.18);
        haptic([120, 60, 120]);
        markExerciseProgress(step);
        nextStep();
        return;
      }
      updateRing();
    }, 1000);
  }
}

function skipStep() {
  clearInterval(intervalId);
  ticking = false;
  nextStep();
}

function nextStep() {
  stepIdx++;
  if (stepIdx >= steps.length) { finishSession(); return; }
  setupStep();
}

function markExerciseProgress(step) {
  if (step.kind !== 'work') return;
  if (sessionType === 'A' || sessionType === 'B' || sessionType === 'C') {
    sessionDone[sessionType].add(step.exIdx);
  } else if (sessionType === 'warmup') {
    sessionDone.warmup.add(step.exIdx + '-' + step.exNum);
  }
}

function closePlayer() {
  clearInterval(intervalId);
  ticking = false;
  player.hidden = true;
  document.body.style.overflow = '';
}

function finishSession() {
  closePlayer();
  if (sessionType === 'A' || sessionType === 'B' || sessionType === 'C') {
    qualityModal.hidden = false;
    qualityModal.dataset.day = sessionType;
  } else if (sessionType === 'cooldown') {
    sessionDone.cooldown = true;
    renderView();
  } else {
    renderView();
  }
}

/* ---------- 8. RENDERING ---------- */

function renderTabs() {
  [...dayTabs.querySelectorAll('.tab')].forEach(tab => {
    tab.classList.toggle('is-active', tab.dataset.view === currentView);
  });
}

function renderBanner() {
  if (['A', 'B', 'C'].includes(currentView)) {
    const msg = checkProgression(currentView);
    if (msg) {
      progressionBanner.hidden = false;
      progressionText.textContent = msg;
      return;
    }
  }
  progressionBanner.hidden = true;
}

function exerciseCard(ex, exIdx, dayKey) {
  const done = sessionDone[dayKey].has(exIdx);
  const repsText = ex.mode === 'time' ? (ex.durationLabel || `${ex.duration} сек`) : ex.repsLabel;
  return `
    <div class="card ${done ? 'is-done' : ''}" data-day="${dayKey}" data-ex="${exIdx}">
      <div class="plate">${ex.num}</div>
      <div class="card__body">
        <p class="card__name">${ex.name}</p>
        <div class="card__stats">
          <span>🔁 <b>${ex.sets}</b> подхода</span>
          <span>🎯 <b>${repsText}</b></span>
          <span>⏱ <b>${ex.restLabel}</b> отдых</span>
        </div>
        ${ex.note ? `<span class="card__alt">⚠ есть замена без турника</span>` : ''}
      </div>
      <button class="card__go" aria-label="Начать упражнение">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
      </button>
    </div>`;
}

function renderDay(dayKey) {
  const day = DAYS[dayKey];
  if (day.circuit) {
    const rows = day.exercises.map(ex => `
      <div class="circuit-item">
        <div class="plate">${ex.num}</div>
        <div class="card__body">
          <p class="card__name">${ex.name}</p>
          <div class="card__stats">
            <span>🎯 <b>${ex.mode === 'time' ? ex.duration + ' сек' : ex.repsLabel}</b></span>
          </div>
        </div>
      </div>`).join('');
    mainContent.innerHTML = `
      <div class="section-head">
        <div><h2>${day.title}</h2><p>${day.subtitle}</p></div>
      </div>
      <div class="circuit-block">
        <div class="circuit-block__head"><h3>Круг × ${day.rounds}, отдых ${day.restBetweenRounds} сек между кругами</h3><span>без пауз внутри круга</span></div>
        <div class="circuit-list">${rows}</div>
        <button class="start-circuit" id="startCircuitBtn">Начать круговую тренировку</button>
      </div>`;
    $('#startCircuitBtn').addEventListener('click', () => startSession('C', buildCircuitSteps('C')));
    return;
  }

  const cards = day.exercises.map((ex, i) => exerciseCard(ex, i, dayKey)).join('');
  mainContent.innerHTML = `
    <div class="section-head">
      <div><h2>${day.title}</h2><p>${day.subtitle}</p></div>
      <span class="section-meta">${day.exercises.length} упр.</span>
    </div>
    <button class="start-circuit" id="startDayBtn">Начать тренировку целиком</button>
    <div style="height:2px"></div>
    ${cards}`;
  $('#startDayBtn').addEventListener('click', () => startSession(dayKey, buildDaySteps(dayKey, 0)));
  mainContent.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card__go') || true) {
        const idx = Number(card.dataset.ex);
        startSession(dayKey, buildDaySteps(dayKey, idx));
      }
    });
  });
}

function renderFreeform(kind) {
  const meta = kind === 'warmup' ? WARMUP : COOLDOWN;
  let list = '';
  if (kind === 'warmup') {
    list = WARMUP.items.map((it, i) => {
      const done = sessionDone.warmup.has(i + '-' + it.num);
      const label = it.mode === 'time' ? `${it.duration} сек` : it.repsLabel;
      return `<div class="free-item ${done ? 'is-done' : ''}">
        <div class="plate">${it.num}</div>
        <span class="free-item__name">${it.name}</span>
        <span class="free-item__time">${label}</span>
      </div>`;
    }).join('');
  } else {
    list = `<div class="free-item"><div class="plate">Z</div>
      <span class="free-item__name">Растяжки на выбор: ${COOLDOWN.numbersText}</span>
      <span class="free-item__time">${COOLDOWN.totalSeconds / 60} мин</span></div>`;
  }
  mainContent.innerHTML = `
    <div class="section-head">
      <div><h2>${meta.title}</h2><p>${meta.subtitle}</p></div>
    </div>
    <div class="free-list" style="display:flex;flex-direction:column;gap:8px;">${list}</div>
    <div class="timer-box">
      <p>${kind === 'warmup' ? 'Пройдите все упражнения подряд с таймером — точные секунды из плана.' : COOLDOWN.note}</p>
      <button class="btn btn--primary" id="startFreeBtn">Начать таймер · ${meta.totalSeconds / 60} мин</button>
    </div>`;
  $('#startFreeBtn').addEventListener('click', () => startSession(kind, buildFreeformSteps(kind)));
}

function renderView() {
  renderTabs();
  renderBanner();
  if (currentView === 'warmup') renderFreeform('warmup');
  else if (currentView === 'cooldown') renderFreeform('cooldown');
  else renderDay(currentView);
}

/* ---------- 9. LOG DRAWER ---------- */

function renderLog() {
  const log = getLog();
  if (!log.length) {
    logList.innerHTML = `<p class="log-empty">Пока пусто. Заверши первую тренировку — запись появится здесь.</p>`;
    return;
  }
  logList.innerHTML = log.map(e => `
    <div class="log-item">
      <span><b>${e.day}</b> · ${dayLabel(e.day)}</span>
      <span>${fmtDate(e.date)}</span>
      <span>${e.quality ? '💪 макс.' : '· норм'}</span>
    </div>`).join('');
}

/* ---------- 10. EVENTS ---------- */

dayTabs.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  currentView = tab.dataset.view;
  renderView();
});

$('#playerClose').addEventListener('click', () => {
  clearInterval(intervalId);
  ticking = false;
  closePlayer();
  renderView();
});
mainActionBtn.addEventListener('click', toggleTimer);
skipBtn.addEventListener('click', skipStep);

$('#qualityYes').addEventListener('click', () => {
  saveLogEntry(qualityModal.dataset.day, true);
  qualityModal.hidden = true;
  renderView();
});
$('#qualityNo').addEventListener('click', () => {
  saveLogEntry(qualityModal.dataset.day, false);
  qualityModal.hidden = true;
  renderView();
});

$('#rulesToggle').addEventListener('click', () => {
  $('#rulesCard').classList.toggle('is-open');
});

$('#openLogBtn').addEventListener('click', () => { renderLog(); logDrawer.hidden = false; });
$('#closeLogBtn').addEventListener('click', () => { logDrawer.hidden = true; });
logDrawer.addEventListener('click', (e) => { if (e.target === logDrawer) logDrawer.hidden = true; });

$('#dismissBanner').addEventListener('click', () => { progressionBanner.hidden = true; });

/* ---------- 11. INIT ---------- */

renderView();
