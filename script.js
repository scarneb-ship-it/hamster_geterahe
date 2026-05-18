// ========== Telegram Mini App инициализация ==========
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  document.body.style.backgroundColor = tg.backgroundColor;
  document.body.style.color = tg.textColor;
  tg.MainButton.setText('Поделиться результатом').show().onClick(() => {
    const score = document.getElementById('scoreDisplay').textContent;
    tg.sendData(JSON.stringify({ game: 'Block Blast Color', score }));
  });
}

// ========== Игровые константы и состояние ==========
const ROWS = 8;
const COLS = 8;
// board теперь хранит цвет: 0 = пусто, 'цвет' = строка цвета фигуры
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let score = 0;
let selectedPiece = null;
let currentPieces = []; // массив объектов { shape, color }
let gameOver = false;
let isClearing = false; // флаг, чтобы блокировать действия во время анимации очистки

// Цветовая палитра фигур (яркие оттенки)
const PIECE_COLORS = [
  '#FF6B6B', // красный
  '#4ECDC4', // бирюзовый
  '#FFD166', // жёлтый
  '#A855F7', // фиолетовый
  '#38BDF8', // голубой
  '#F472B6', // розовый
  '#10B981', // зелёный
  '#FB923C', // оранжевый
  '#6366F1', // индиго
  '#FACC15', // лимон
  '#A3E635'  // лайм
];

// Доступные фигуры (матрицы)
const SHAPES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1], [0, 1]],
  [[1, 1], [1, 0]],
  [[1, 1, 1], [0, 1, 0]]
];

// DOM элементы
const boardEl = document.getElementById('board');
const piecesPanelEl = document.getElementById('piecesPanel');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverMsg = document.getElementById('gameOverMsg');
const restartBtn = document.getElementById('restartBtn');

// ========== Функции логики ==========
function randomColor() {
  return PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];
}

function createPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape, color: randomColor() };
}

function generateThreePieces() {
  currentPieces = [createPiece(), createPiece(), createPiece()];
  selectedPiece = null;
  renderPieces();
  if (!anyPieceCanBePlaced()) {
    endGame();
  }
}

function canPlace(piece, row, col) {
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const newRow = row + r;
        const newCol = col + c;
        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) return false;
        if (board[newRow][newCol] !== 0) return false;
      }
    }
  }
  return true;
}

function placePiece(piece, row, col) {
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        board[row + r][col + c] = piece.color;
      }
    }
  }
  // Удаляем использованную фигуру из списка
  const index = currentPieces.indexOf(piece);
  if (index > -1) currentPieces.splice(index, 1);
  selectedPiece = null;
}

function getFullLinesAndColumns() {
  const lines = [];
  // строки
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(cell => cell !== 0)) lines.push({ type: 'row', index: r });
  }
  // столбцы
  for (let c = 0; c < COLS; c++) {
    let full = true;
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c] === 0) { full = false; break; }
    }
    if (full) lines.push({ type: 'col', index: c });
  }
  return lines;
}

function clearFullLinesAndColumns() {
  const toClear = getFullLinesAndColumns();
  if (toClear.length === 0) return;

  isClearing = true;
  const cellsToAnimate = [];
  // собираем ячейки для анимации
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isRowClear = toClear.some(item => item.type === 'row' && item.index === r);
      const isColClear = toClear.some(item => item.type === 'col' && item.index === c);
      if (isRowClear || isColClear) {
        cellsToAnimate.push({ row: r, col: c });
      }
    }
  }

  // Запускаем анимацию: добавляем класс clearing
  cellsToAnimate.forEach(({ row, col }) => {
    const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    if (cell) cell.classList.add('clearing');
  });

  setTimeout(() => {
    // Реальная очистка поля
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const isRowClear = toClear.some(item => item.type === 'row' && item.index === r);
        const isColClear = toClear.some(item => item.type === 'col' && item.index === c);
        if (isRowClear || isColClear) {
          board[r][c] = 0;
        }
      }
    }
    score += toClear.length * 10;
    updateScore();
    isClearing = false;
    renderBoard();
    if (currentPieces.length === 0 && !gameOver) {
      generateThreePieces();
    } else if (currentPieces.length > 0 && !anyPieceCanBePlaced() && !gameOver) {
      endGame();
    }
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
  }, 400);
}

function anyPieceCanBePlaced() {
  for (let piece of currentPieces) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (canPlace(piece, r, c)) return true;
      }
    }
  }
  return false;
}

function endGame() {
  gameOver = true;
  gameOverMsg.style.display = 'block';
  if (tg) {
    tg.MainButton.setText('Игра окончена').show();
    tg.HapticFeedback?.notificationOccurred('error');
  }
}

function resetGame() {
  board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
  score = 0;
  gameOver = false;
  isClearing = false;
  gameOverMsg.style.display = 'none';
  updateScore();
  generateThreePieces();
  renderBoard();
  if (tg) tg.MainButton.hide();
}

function updateScore() {
  scoreDisplay.textContent = score;
}

// ========== Отрисовка ==========
function renderBoard(previewPiece = null, previewRow = -1, previewCol = -1) {
  boardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      
      // Цвет ячейки
      if (board[r][c] !== 0) {
        cell.classList.add('filled');
        cell.style.backgroundColor = board[r][c];
        cell.style.boxShadow = `0 0 12px ${board[r][c]}`;
      }
      
      // Превью фигуры
      if (previewPiece && !gameOver && !isClearing) {
        const shape = previewPiece.shape;
        const inShape = (r >= previewRow && r < previewRow + shape.length &&
                         c >= previewCol && c < previewCol + shape[0].length &&
                         shape[r - previewRow][c - previewCol] === 1);
        if (inShape) {
          if (canPlace(previewPiece, previewRow, previewCol)) {
            cell.classList.add('preview');
            cell.style.backgroundColor = previewPiece.color + '99'; // полупрозрачный
          } else {
            cell.classList.add('invalid-preview');
          }
        }
      }
      
      // Обработчики событий
      cell.addEventListener('click', () => {
        if (gameOver || !selectedPiece || isClearing) return;
        if (canPlace(selectedPiece, r, c)) {
          placePiece(selectedPiece, r, c);
          renderBoard();
          clearFullLinesAndColumns();
          renderPieces();
        }
      });
      cell.addEventListener('mouseenter', () => {
        if (gameOver || !selectedPiece || isClearing) return;
        renderBoard(selectedPiece, r, c);
      });
      cell.addEventListener('mouseleave', () => {
        if (gameOver || !selectedPiece || isClearing) return;
        renderBoard();
      });
      
      boardEl.appendChild(cell);
    }
  }
}

function renderPieces() {
  piecesPanelEl.innerHTML = '';
  currentPieces.forEach((piece, index) => {
    const pieceDiv = document.createElement('div');
    pieceDiv.className = 'piece';
    if (piece === selectedPiece) pieceDiv.classList.add('selected');
    pieceDiv.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 1fr)`;
    pieceDiv.style.gridTemplateRows = `repeat(${piece.shape.length}, 1fr)`;
    
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[0].length; c++) {
        const cell = document.createElement('div');
        cell.className = 'piece-cell';
        if (piece.shape[r][c]) {
          cell.classList.add('filled');
          cell.style.backgroundColor = piece.color;
          cell.style.boxShadow = `0 0 8px ${piece.color}`;
        }
        pieceDiv.appendChild(cell);
      }
    }
    pieceDiv.addEventListener('click', () => {
      if (gameOver || isClearing) return;
      selectedPiece = piece;
      renderPieces();
      renderBoard();
    });
    piecesPanelEl.appendChild(pieceDiv);
  });
}

// ========== Запуск ==========
restartBtn.addEventListener('click', resetGame);
resetGame();
