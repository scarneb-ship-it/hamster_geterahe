// ================= НАСТРОЙКИ =================
const TILE_SIZE = 32;
const MAP_COLS = 21;
const MAP_ROWS = 15;
const SPRITE_SIZE = 16;    // эталонный размер спрайта, будем увеличивать

// ================= Telegram Web App =================
const isTelegram = (typeof Telegram !== 'undefined' && Telegram.WebApp);
const tg = isTelegram ? Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
    tg.disableVerticalSwipes();
}

// ================= Хранилище =================
const storage = {
    async get(key) {
        if (tg?.CloudStorage) {
            try { return await new Promise((res, rej) => tg.CloudStorage.getItem(key, (err, val) => err ? rej(err) : res(val))); }
            catch (e) {}
        }
        return localStorage.getItem(key);
    },
    async set(key, value) {
        if (tg?.CloudStorage) {
            try { await new Promise((res, rej) => tg.CloudStorage.setItem(key, value, (err, val) => err ? rej(err) : res(val))); return; }
            catch (e) {}
        }
        localStorage.setItem(key, value);
    },
    async remove(key) {
        if (tg?.CloudStorage) {
            try { await new Promise((res, rej) => tg.CloudStorage.removeItem(key, (err, val) => err ? rej(err) : res(val))); return; }
            catch (e) {}
        }
        localStorage.removeItem(key);
    }
};

// ================= Звуки (Web Audio) =================
let audioCtx;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function playTone(freq, dur, type = 'square', vol = 0.08) {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
}
const SFX = {
    step: () => playTone(100, 0.06, 'triangle'),
    hit: () => { playTone(70, 0.12, 'sawtooth', 0.1); playTone(55, 0.1, 'square', 0.08); },
    pickup: () => { playTone(500, 0.08); playTone(700, 0.08); },
    levelup: () => { playTone(400, 0.1); playTone(600, 0.1); playTone(800, 0.15); },
    death: () => { playTone(50, 0.3, 'sawtooth', 0.15); }
};

// ================= ГРАФИКА (пиксельная, рисуется на canvas) =================
// Генерация текстур спрайтов (16x16) в оффскрин-канвасе

function createSpriteSheet() {
    const sheet = document.createElement('canvas');
    sheet.width = SPRITE_SIZE * 6; // 6 кадров: игрок, слайм, скелет, зелье, меч, выход
    sheet.height = SPRITE_SIZE;
    const ctx = sheet.getContext('2d');

    function sprite(index, drawFunc) {
        ctx.save();
        ctx.translate(index * SPRITE_SIZE, 0);
        drawFunc(ctx);
        ctx.restore();
    }

    // 0 - Рыцарь (анимированный)
    sprite(0, ctx => {
        // Тело
        ctx.fillStyle = '#2b4f8c';
        ctx.fillRect(5, 5, 6, 8);            // туловище
        // Голова
        ctx.fillStyle = '#d4b98c';
        ctx.fillRect(6, 1, 4, 5);           // лицо
        ctx.fillStyle = '#2b4f8c';
        ctx.fillRect(5, 0, 6, 2);           // шлем верх
        // Глаза
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 3, 1, 1);
        ctx.fillRect(9, 3, 1, 1);
        // Меч
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(11, 4, 2, 8);
        ctx.fillRect(12, 12, 4, 1);
        // Ноги
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(5, 13, 2, 3);
        ctx.fillRect(9, 13, 2, 3);
        // Щит (левый бок)
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(2, 6, 3, 5);
    });

    // 1 - Слизень
    sprite(1, ctx => {
        ctx.fillStyle = '#a03030';
        ctx.fillRect(4, 7, 8, 6);         // тело
        ctx.fillRect(5, 5, 6, 2);         // верх
        ctx.fillStyle = '#ff8888';
        ctx.fillRect(7, 5, 2, 1);         // глаз
        ctx.fillStyle = '#700000';
        ctx.fillRect(6, 12, 4, 2);        // тень
    });

    // 2 - Скелет
    sprite(2, ctx => {
        ctx.fillStyle = '#d4d4c8';
        ctx.fillRect(6, 2, 4, 4);         // череп
        ctx.fillStyle = '#b0b0a0';
        ctx.fillRect(7, 3, 2, 1);         // глаза
        ctx.fillRect(5, 7, 6, 5);         // туловище
        ctx.fillStyle = '#d4d4c8';
        ctx.fillRect(5, 7, 1, 5);         // ребра
        ctx.fillRect(10, 7, 1, 5);
        // Руки
        ctx.fillStyle = '#b0b0a0';
        ctx.fillRect(3, 8, 2, 5);
        ctx.fillRect(11, 8, 2, 5);
        // Ноги
        ctx.fillStyle = '#b0b0a0';
        ctx.fillRect(5, 13, 2, 3);
        ctx.fillRect(9, 13, 2, 3);
    });

    // 3 - Зелье
    sprite(3, ctx => {
        ctx.fillStyle = '#ff3355';
        ctx.fillRect(7, 3, 2, 5);         // горлышко
        ctx.fillStyle = '#cc2233';
        ctx.fillRect(6, 8, 4, 6);         // колба
        ctx.fillStyle = '#ff8899';
        ctx.fillRect(7, 4, 1, 2);          // блик
        ctx.fillStyle = '#550000';
        ctx.fillRect(7, 12, 2, 2);        // пробка
    });

    // 4 - Меч (предмет)
    sprite(4, ctx => {
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(7, 1, 2, 11);        // лезвие
        ctx.fillStyle = '#777777';
        ctx.fillRect(8, 1, 1, 11);        // тень лезвия
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(5, 12, 6, 3);        // рукоять
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(6, 13, 4, 1);        // гарда
    });

    // 5 - Выход (портал)
    sprite(5, ctx => {
        ctx.fillStyle = '#22ff88';
        ctx.fillRect(6, 4, 4, 8);         // столб
        ctx.fillStyle = '#00cc66';
        ctx.fillRect(7, 5, 2, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 6, 1, 2);          // свечение
        ctx.fillStyle = '#004422';
        ctx.fillRect(6, 12, 4, 2);        // основание
    });

    return sheet;
}

// Генерация тайлов (пол и стена)
function createTileSheet() {
    const sheet = document.createElement('canvas');
    sheet.width = SPRITE_SIZE * 2; // 0 - пол, 1 - стена
    sheet.height = SPRITE_SIZE;
    const ctx = sheet.getContext('2d');

    // Пол
    ctx.save();
    ctx.fillStyle = '#3a3a2a';
    ctx.fillRect(0, 0, 16, 16);
    // трещинки/камни
    ctx.fillStyle = '#4a4a3a';
    ctx.fillRect(0, 0, 2, 2);
    ctx.fillRect(14, 14, 2, 2);
    ctx.fillRect(7, 2, 1, 3);
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(3, 11, 4, 1);
    ctx.fillRect(12, 5, 2, 1);
    ctx.restore();

    // Стена
    ctx.save();
    ctx.translate(16, 0);
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(0, 0, 16, 16);
    // кирпичи
    ctx.fillStyle = '#5a4530';
    ctx.fillRect(0, 0, 8, 7);
    ctx.fillRect(8, 0, 8, 7);
    ctx.fillRect(0, 8, 5, 8);
    ctx.fillRect(6, 8, 5, 8);
    ctx.fillRect(12, 8, 4, 8);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(0, 7, 16, 1);
    ctx.fillRect(0, 15, 16, 1);
    ctx.restore();

    return sheet;
}

const spriteSheet = createSpriteSheet();
const tileSheet = createTileSheet();

// ================= МОДЕЛЬ ДАННЫХ =================
class GameState {
    constructor() {
        this.floor = 1;
        this.player = { hp: 20, maxHp: 20, atk: 4, def: 1, items: [] };
        this.dungeon = null;
        this.gameOver = false;
    }
    toJSON() {
        return { floor: this.floor, player: this.player, dungeon: this.dungeon?.toJSON() };
    }
    static fromJSON(data) {
        const gs = new GameState();
        gs.floor = data.floor;
        gs.player = data.player;
        if (data.dungeon) gs.dungeon = Dungeon.fromJSON(data.dungeon);
        return gs;
    }
}

class Dungeon {
    constructor(map, rooms, playerPos, exitPos, enemies, items) {
        this.map = map;
        this.rooms = rooms;
        this.playerPos = playerPos;
        this.exitPos = exitPos;
        this.enemies = enemies || [];
        this.items = items || [];
    }
    toJSON() {
        return {
            map: this.map, rooms: this.rooms, playerPos: this.playerPos,
            exitPos: this.exitPos, enemies: this.enemies, items: this.items
        };
    }
    static fromJSON(d) {
        return new Dungeon(d.map, d.rooms, d.playerPos, d.exitPos, d.enemies, d.items);
    }
}

// ================= ГЕНЕРАТОР ПОДЗЕМЕЛИЙ =================
function generateDungeon(floorNumber) {
    const width = MAP_COLS, height = MAP_ROWS;
    const map = Array(height).fill().map(() => Array(width).fill(0));
    const numRooms = 5 + Math.floor(floorNumber / 2);
    const minSize = 3, maxSize = 6;
    const enemyCount = 2 + Math.floor(floorNumber * 1.2);
    const itemCount = 2 + Math.floor(floorNumber / 2);
    const rooms = [];

    for (let i = 0; i < numRooms * 3; i++) {
        const w = randInt(minSize, maxSize);
        const h = randInt(minSize, maxSize);
        const x = randInt(1, width - w - 2);
        const y = randInt(1, height - h - 2);
        const newRoom = { x, y, w, h };
        if (!rooms.some(r => intersect(r, newRoom))) {
            rooms.push(newRoom);
            for (let row = y; row < y + h; row++) {
                for (let col = x; col < x + w; col++) {
                    map[row][col] = 1;
                }
            }
        }
        if (rooms.length >= numRooms) break;
    }

    for (let i = 1; i < rooms.length; i++) {
        const prev = rooms[i - 1], curr = rooms[i];
        const x1 = Math.floor(prev.x + prev.w / 2);
        const y1 = Math.floor(prev.y + prev.h / 2);
        const x2 = Math.floor(curr.x + curr.w / 2);
        const y2 = Math.floor(curr.y + curr.h / 2);
        if (Math.random() > 0.5) {
            createHTunnel(map, x1, x2, y1);
            createVTunnel(map, y1, y2, x2);
        } else {
            createVTunnel(map, y1, y2, x1);
            createHTunnel(map, x1, x2, y2);
        }
    }

    const startRoom = rooms[0];
    const playerPos = { x: Math.floor(startRoom.x + startRoom.w / 2), y: Math.floor(startRoom.y + startRoom.h / 2) };
    const lastRoom = rooms[rooms.length - 1];
    const exitPos = { x: Math.floor(lastRoom.x + lastRoom.w / 2), y: Math.floor(lastRoom.y + lastRoom.h / 2) };

    const enemies = [];
    const enemyTypes = ['slime', 'skeleton'];
    for (let i = 0; i < enemyCount; i++) {
        const type = enemyTypes[randInt(0, enemyTypes.length - 1)];
        let pos = null;
        for (let a = 0; a < 50; a++) {
            const r = rooms[randInt(0, rooms.length - 1)];
            const ex = randInt(r.x + 1, r.x + r.w - 2);
            const ey = randInt(r.y + 1, r.y + r.h - 2);
            if (map[ey][ex] === 1 &&
                !(ex === playerPos.x && ey === playerPos.y) &&
                !(ex === exitPos.x && ey === exitPos.y) &&
                !enemies.some(e => e.x === ex && e.y === ey)) {
                pos = { x: ex, y: ey };
                break;
            }
        }
        if (pos) {
            const stats = type === 'slime' ?
                { hp: 8, maxHp: 8, atk: 3, def: 0 } :
                { hp: 15, maxHp: 15, atk: 5, def: 1 };
            enemies.push({ ...pos, type, ...stats });
        }
    }

    const items = [];
    const itemTypes = ['potion', 'sword'];
    for (let i = 0; i < itemCount; i++) {
        let pos = null;
        for (let a = 0; a < 30; a++) {
            const r = rooms[randInt(0, rooms.length - 1)];
            const ix = randInt(r.x + 1, r.x + r.w - 2);
            const iy = randInt(r.y + 1, r.y + r.h - 2);
            if (map[iy][ix] === 1 &&
                !(ix === playerPos.x && iy === playerPos.y) &&
                !(ix === exitPos.x && iy === exitPos.y) &&
                !enemies.some(e => e.x === ix && e.y === iy) &&
                !items.some(it => it.x === ix && it.y === iy)) {
                pos = { x: ix, y: iy };
                break;
            }
        }
        if (pos) items.push({ ...pos, type: itemTypes[randInt(0, itemTypes.length - 1)] });
    }

    return new Dungeon(map, rooms, playerPos, exitPos, enemies, items);
}

function intersect(a, b) { return !(b.x >= a.x + a.w || b.x + b.w <= a.x || b.y >= a.y + a.h || b.y + b.h <= a.y); }
function createHTunnel(m, x1, x2, y) { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) if (y >= 0 && y < m.length && x >= 0 && x < m[0].length) m[y][x] = 1; }
function createVTunnel(m, y1, y2, x) { for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) if (y >= 0 && y < m.length && x >= 0 && x < m[0].length) m[y][x] = 1; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ================= ОТРИСОВКА ИГРЫ =================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = MAP_COLS * TILE_SIZE;
canvas.height = MAP_ROWS * TILE_SIZE;

let animationFrame = 0; // для легкой анимации (покачивание, мерцание)

function resizeCanvas() {
    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - 220; // учёт места под UI и джойстик
    const scale = Math.min(maxWidth / (MAP_COLS * TILE_SIZE), maxHeight / (MAP_ROWS * TILE_SIZE));
    canvas.style.width = `${MAP_COLS * TILE_SIZE * scale}px`;
    canvas.style.height = `${MAP_ROWS * TILE_SIZE * scale}px`;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawMap() {
    const d = gameState.dungeon;
    if (!d) return;
    for (let row = 0; row < d.map.length; row++) {
        for (let col = 0; col < d.map[row].length; col++) {
            const x = col * TILE_SIZE, y = row * TILE_SIZE;
            const tileIndex = d.map[row][col] === 0 ? 1 : 0; // стена или пол
            ctx.drawImage(tileSheet, tileIndex * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
        }
    }
}

function drawSprite(index, tileX, tileY, scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0) {
    const srcX = index * SPRITE_SIZE;
    const srcY = 0;
    const w = SPRITE_SIZE * scaleX;
    const h = SPRITE_SIZE * scaleY;
    const destX = tileX * TILE_SIZE + offsetX;
    const destY = tileY * TILE_SIZE + offsetY;
    ctx.drawImage(spriteSheet, srcX, srcY, SPRITE_SIZE, SPRITE_SIZE, destX, destY, w, h);
}

function drawGame() {
    if (!gameState || !gameState.dungeon) return;
    animationFrame++;
    const d = gameState.dungeon;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();

    // Предметы
    for (const item of d.items) {
        const idx = item.type === 'potion' ? 3 : 4;
        drawSprite(idx, item.x, item.y);
    }

    // Выход с пульсацией
    const pulse = 1 + Math.sin(animationFrame * 0.1) * 0.1;
    drawSprite(5, d.exitPos.x, d.exitPos.y, pulse, pulse,
        (TILE_SIZE - TILE_SIZE * pulse) / 2, (TILE_SIZE - TILE_SIZE * pulse) / 2);

    // Враги
    for (const enemy of d.enemies) {
        const idx = enemy.type === 'slime' ? 1 : 2;
        drawSprite(idx, enemy.x, enemy.y);
        // HP-бар
        const hpRatio = enemy.hp / enemy.maxHp;
        if (hpRatio < 1) {
            ctx.fillStyle = '#300';
            ctx.fillRect(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE - 6, TILE_SIZE, 4);
            ctx.fillStyle = '#0a0';
            ctx.fillRect(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE - 6, TILE_SIZE * hpRatio, 4);
        }
    }

    // Игрок (с легким покачиванием)
    const playerBounce = Math.sin(animationFrame * 0.15) * 0.5;
    drawSprite(0, d.playerPos.x, d.playerPos.y, 1, 1,
        (TILE_SIZE - SPRITE_SIZE * 1.5) / 2, (TILE_SIZE - SPRITE_SIZE * 1.5) / 2 + playerBounce);
    // Щит игрока (свечение)
    ctx.shadowColor = '#aaccff';
    ctx.shadowBlur = 3;
    drawSprite(0, d.playerPos.x, d.playerPos.y, 1, 1,
        (TILE_SIZE - SPRITE_SIZE * 1.5) / 2, (TILE_SIZE - SPRITE_SIZE * 1.5) / 2 + playerBounce);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

// ================= ИГРОВАЯ ЛОГИКА =================
let gameState = null;
let turnInProgress = false;

function updateUI() {
    const p = gameState.player;
    document.getElementById('hp').textContent = p.hp;
    document.getElementById('maxhp').textContent = p.maxHp;
    document.getElementById('atk').textContent = p.atk;
    document.getElementById('def').textContent = p.def;
    document.getElementById('floor').textContent = gameState.floor;
    document.getElementById('inv-list').textContent = p.items.length ? p.items.join(', ') : 'пусто';
}

function showLog(text, dur = 2000) {
    const el = document.getElementById('log');
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.style.opacity = '0', dur);
}

function movePlayer(dx, dy) {
    if (!gameState || gameState.gameOver || turnInProgress) return;
    turnInProgress = true;
    initAudio();
    const d = gameState.dungeon;
    const nx = d.playerPos.x + dx, ny = d.playerPos.y + dy;
    if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS || d.map[ny][nx] === 0) {
        turnInProgress = false;
        return;
    }

    const enemyIdx = d.enemies.findIndex(e => e.x === nx && e.y === ny);
    if (enemyIdx !== -1) {
        attackEnemy(enemyIdx);
        endTurn();
        return;
    }

    d.playerPos.x = nx;
    d.playerPos.y = ny;
    SFX.step();

    const itemIdx = d.items.findIndex(it => it.x === nx && it.y === ny);
    if (itemIdx !== -1) {
        const item = d.items[itemIdx];
        if (item.type === 'potion') {
            gameState.player.hp = Math.min(gameState.player.hp + 10, gameState.player.maxHp);
            showLog('Выпил зелье +10 HP');
            SFX.pickup();
        } else if (item.type === 'sword') {
            gameState.player.atk += 2;
            gameState.player.items.push('меч');
            showLog('Поднят меч! АТК +2');
            SFX.pickup();
        }
        d.items.splice(itemIdx, 1);
    }

    if (nx === d.exitPos.x && ny === d.exitPos.y) {
        nextFloor();
        turnInProgress = false;
        return;
    }

    endTurn();
}

function attackEnemy(enemyIdx) {
    const enemy = gameState.dungeon.enemies[enemyIdx];
    const dmg = Math.max(1, gameState.player.atk - enemy.def);
    enemy.hp -= dmg;
    SFX.hit();
    showLog(`Атака! ${dmg} урона`);
    if (enemy.hp <= 0) {
        gameState.dungeon.enemies.splice(enemyIdx, 1);
        showLog('Враг повержен!');
        SFX.levelup();
    } else {
        const enemyDmg = Math.max(1, enemy.atk - gameState.player.def);
        gameState.player.hp -= enemyDmg;
        showLog(`Враг бьёт в ответ! -${enemyDmg} HP`);
        if (gameState.player.hp <= 0) {
            gameState.player.hp = 0;
            gameState.gameOver = true;
            showLog('Вы погибли...');
            SFX.death();
        }
    }
}

function moveEnemies() {
    if (!gameState || gameState.gameOver) return;
    const d = gameState.dungeon;
    for (const enemy of d.enemies) {
        const dx = d.playerPos.x - enemy.x;
        const dy = d.playerPos.y - enemy.y;
        if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5) {
            let mx = 0, my = 0;
            if (Math.abs(dx) > Math.abs(dy)) mx = dx > 0 ? 1 : -1;
            else my = dy > 0 ? 1 : -1;
            const nx = enemy.x + mx, ny = enemy.y + my;
            if (d.map[ny] && d.map[ny][nx] === 1 &&
                !(nx === d.playerPos.x && ny === d.playerPos.y) &&
                !d.enemies.some(e => e !== enemy && e.x === nx && e.y === ny)) {
                enemy.x = nx;
                enemy.y = ny;
            }
            // Если вплотную — атака
            if (enemy.x === d.playerPos.x && enemy.y === d.playerPos.y) {
                const dmg = Math.max(1, enemy.atk - gameState.player.def);
                gameState.player.hp -= dmg;
                showLog(`Враг атакует! -${dmg} HP`);
                if (gameState.player.hp <= 0) {
                    gameState.player.hp = 0;
                    gameState.gameOver = true;
                    showLog('Вы погибли...');
                    SFX.death();
                }
            }
        }
    }
}

function endTurn() {
    if (!gameState || gameState.gameOver) { turnInProgress = false; return; }
    moveEnemies();
    updateUI();
    drawGame();
    saveGame();
    turnInProgress = false;
}

function nextFloor() {
    gameState.floor++;
    gameState.dungeon = generateDungeon(gameState.floor);
    updateUI();
    drawGame();
    saveGame();
    showLog(`Спуск на этаж ${gameState.floor}!`);
    SFX.levelup();
}

// ================= СОХРАНЕНИЯ =================
const SAVE_KEY = 'dark_pixel_dungeon_save';
async function saveGame() {
    if (!gameState || gameState.gameOver) await storage.remove(SAVE_KEY);
    else await storage.set(SAVE_KEY, JSON.stringify(gameState.toJSON()));
}
async function loadGame() {
    const data = await storage.get(SAVE_KEY);
    if (data) {
        try { gameState = GameState.fromJSON(JSON.parse(data)); return true; }
        catch (e) {}
    }
    return false;
}
async function startNewGame() {
    gameState = new GameState();
    gameState.dungeon = generateDungeon(1);
    gameState.gameOver = false;
    updateUI();
    drawGame();
    await saveGame();
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
}

// ================= УПРАВЛЕНИЕ (клавиатура + мобильный джойстик) =================
function setupControls() {
    // Клавиатура
    window.addEventListener('keydown', e => {
        if (gameState?.gameOver) return;
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': e.preventDefault(); movePlayer(0, -1); break;
            case 'ArrowDown': case 's': case 'S': e.preventDefault(); movePlayer(0, 1); break;
            case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); movePlayer(-1, 0); break;
            case 'ArrowRight': case 'd': case 'D': e.preventDefault(); movePlayer(1, 0); break;
        }
    });

    // Виртуальный джойстик
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    let joystickActive = false;
    let joystickId = null;

    function handleJoystickStart(e) {
        e.preventDefault();
        joystickActive = true;
        joystickId = e.touches ? e.touches[0].identifier : null;
    }

    function handleJoystickMove(e) {
        if (!joystickActive) return;
        e.preventDefault();
        const touch = e.touches ? (joystickId !== null ? [...e.touches].find(t => t.identifier === joystickId) : e.touches[0]) : null;
        if (!touch) return;
        const rect = joystickBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const maxDist = rect.width / 2 - 24;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            dx = dx / dist * maxDist;
            dy = dy / dist * maxDist;
        }
        joystickThumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        // Определяем направление
        const threshold = 10;
        if (dist > threshold) {
            const angle = Math.atan2(dy, dx);
            let moveX = 0, moveY = 0;
            if (angle >= -Math.PI * 3 / 4 && angle < -Math.PI / 4) moveY = -1;          // вверх
            else if (angle >= -Math.PI / 4 && angle < Math.PI / 4) moveX = 1;             // вправо
            else if (angle >= Math.PI / 4 && angle < Math.PI * 3 / 4) moveY = 1;          // вниз
            else if (angle >= Math.PI * 3 / 4 || angle < -Math.PI * 3 / 4) moveX = -1;    // влево

            if ((moveX !== 0 || moveY !== 0) && !turnInProgress) {
                movePlayer(moveX, moveY);
            }
        }
    }

    function handleJoystickEnd(e) {
        joystickActive = false;
        joystickId = null;
        joystickThumb.style.transform = 'translate(-50%, -50%)';
    }

    joystickBase.addEventListener('touchstart', handleJoystickStart);
    joystickBase.addEventListener('touchmove', handleJoystickMove);
    joystickBase.addEventListener('touchend', handleJoystickEnd);
    joystickBase.addEventListener('touchcancel', handleJoystickEnd);

    // Кнопка действия (атака / подобрать)
    document.getElementById('action-btn').addEventListener('click', () => {
        // Можно реализовать проверку: если перед игроком враг — атака, иначе подобрать предмет под ногами
        if (!gameState || gameState.gameOver || turnInProgress) return;
        const p = gameState.dungeon.playerPos;
        // Проверим клетку перед игроком (направление последнего движения неизвестно, упростим: интеракция с клеткой игрока)
        const item = gameState.dungeon.items.find(it => it.x === p.x && it.y === p.y);
        if (item) {
            // имитируем шаг на месте, чтобы подобрать
            movePlayer(0, 0); // не сработает, т.к. логика завязана на перемещение
            // лучше явно: перепишем обработку предмета в отдельную функцию
            pickupItem();
        }
        // Можно также атаковать соседнего врага, если есть
        else {
            const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            for (const dir of dirs) {
                const enemy = gameState.dungeon.enemies.find(e => e.x === p.x + dir.x && e.y === p.y + dir.y);
                if (enemy) {
                    movePlayer(dir.x, dir.y);
                    return;
                }
            }
        }
    });
}

function pickupItem() {
    if (!gameState || gameState.gameOver) return;
    const p = gameState.dungeon.playerPos;
    const itemIdx = gameState.dungeon.items.findIndex(it => it.x === p.x && it.y === p.y);
    if (itemIdx !== -1) {
        const item = gameState.dungeon.items[itemIdx];
        if (item.type === 'potion') {
            gameState.player.hp = Math.min(gameState.player.hp + 10, gameState.player.maxHp);
            showLog('Выпил зелье +10 HP');
            SFX.pickup();
        } else if (item.type === 'sword') {
            gameState.player.atk += 2;
            gameState.player.items.push('меч');
            showLog('Поднят меч! АТК +2');
            SFX.pickup();
        }
        gameState.dungeon.items.splice(itemIdx, 1);
        updateUI();
        drawGame();
        saveGame();
    }
}

// ================= ЗАПУСК ПРИЛОЖЕНИЯ =================
async function initApp() {
    setupControls();
    const loaded = await loadGame();
    const menuDiv = document.getElementById('menu-screen');
    const menuBtns = document.getElementById('menu-buttons');

    if (loaded && !gameState.gameOver) {
        menuBtns.innerHTML = `
            <button id="continueBtn">Продолжить (этаж ${gameState.floor})</button>
            <button id="newGameBtn">Новая игра</button>
        `;
        document.getElementById('continueBtn').addEventListener('click', () => {
            updateUI();
            drawGame();
            menuDiv.style.display = 'none';
            document.getElementById('game-screen').style.display = 'flex';
            resizeCanvas();
        });
    } else {
        menuBtns.innerHTML = '<button id="newGameBtn">Новая игра</button>';
    }
    document.getElementById('newGameBtn').addEventListener('click', startNewGame);
}

initApp();

// Анимация (requestAnimationFrame для постоянной перерисовки, если нужна плавность)
function gameLoop() {
    if (gameState && !gameState.gameOver && document.getElementById('game-screen').style.display !== 'none') {
        drawGame();
    }
    requestAnimationFrame(gameLoop);
}
gameLoop();
