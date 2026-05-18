// Telegram Mini App
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  document.body.style.backgroundColor = tg.backgroundColor;
  document.body.style.color = tg.textColor;
  tg.MainButton.setText('Поделиться результатом').show().onClick(() => {
    const score = scoreDisplay.textContent;
    tg.sendData(JSON.stringify({ game: 'Block Blast Color', score }));
  });
}

// Константы
const ROWS = 8;
const COLS = 8;
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let score = 0;
let selectedPiece = null;
let currentPieces = [];
let gameOver = false;
let isClearing = false;

// DOM-элементы
const boardEl = document.getElementById('board');
const piecesPanelEl = document.getElementById('piecesPanel');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverMsg = document.getElementById('gameOverMsg');
const restartBtn = document.getElementById('restartBtn');

// Ссылки на DOM-ячейки для быстрого обновления превью
let cellElements = Array(ROWS).fill().map(() => Array(COLS).fill(null));

// Цвета фигур
const PIECE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD166', '#A855F7', '#38BDF8',
  '#F472B6', '#10B981', '#FB923C', '#6366F1', '#FACC15', '#A3E635'
];

// Формы фигур
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

// Генерация случайного цвета
function randomColor() {
  return PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];
}

// Создание фигуры
function createPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape, color: randomColor() };
}

// Генерация трёх новых фигур
function generateThreePieces() {
  currentPieces = [createPiece(), createPiece(), createPiece()];
  selectedPiece = null;
  renderPieces();
  if (!anyPieceCanBePlaced()) endGame();
}

// Проверка возможности размещения
function canPlace(piece, row, col) {
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const nr = row + r, nc = col + c;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
        if (board[nr][nc] !== 0) return false;
      }
    }
  }
  return true;
}

// Размещение фигуры на доске
function placePiece(piece, row, col) {
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        board[row + r][col + c] = piece.color;
      }
    }
  }
  const index = currentPieces.indexOf(piece);
  if (index > -1) currentPieces.splice(index, 1);
  selectedPiece = null;
}

// Получить все заполненные линии и столбцы
function getFullLinesAndColumns() {
  const lines = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(cell => cell !== 0)) lines.push({ type: 'row', index: r });
  }
  for (let c = 0; c < COLS; c++) {
    let full = true;
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c] === 0) { full = false; break; }
    }
    if (full) lines.push({ type: 'col', index: c });
  }
  return lines;
}

// Очистка заполненных линий с анимацией
function clearFullLinesAndColumns() {
  const toClear = getFullLinesAndColumns();
  if (toClear.length === 0) return;

  isClearing = true;
  const cellsToClear = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isRow = toClear.some(item => item.type === 'row' && item.index === r);
      const isCol = toClear.some(item => item.type === 'col' && item.index === c);
      if (isRow || isCol) cellsToClear.push({ row: r, col: c });
    }
  }

  // Добавляем класс анимации
  cellsToClear.forEach(({ row, col }) => {
    const cell = cellElements[row][col];
    if (cell) cell.classList.add('clearing');
  });

  setTimeout(() => {
    // Физическая очистка
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const isRow = toClear.some(item => item.type === 'row' && item.index === r);
        const isCol = toClear.some(item => item.type === 'col' && item.index === c);
        if (isRow || isCol) board[r][c] = 0;
      }
    }
    score += toClear.length * 10;
    updateScore();
    isClearing = false;
    renderBoard(); // обновляем доску
    if (currentPieces.length === 0 && !gameOver) {
      generateThreePieces();
    } else if (currentPieces.length > 0 && !anyPieceCanBePlaced() && !gameOver) {
      endGame();
    }
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
  }, 350);
}

// Проверка, можно ли разместить хотя бы одну фигуру
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
  // Визуальный бамп
  scoreDisplay.classList.add('bump');
  setTimeout(() => scoreDisplay.classList.remove('bump'), 200);
}

// Обновление превью без перерисовки всей доски
function updatePreview(piece, startRow, startCol) {
  if (!piece || gameOver || isClearing) {
    // Убираем все превью-классы
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = cellElements[r][c];
        if (cell) {
          cell.classList.remove('preview', 'invalid-preview');
          if (!board[r][c]) cell.style.backgroundColor = '';
        }
      }
    }
    return;
  }

  const shape = piece.shape;
  const valid = canPlace(piece, startRow, startCol);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cellElements[r][c];
      if (!cell) continue;
      // Сбрасываем
      cell.classList.remove('preview', 'invalid-preview');
      if (!board[r][c]) cell.style.backgroundColor = '';

      const inShape = (
        r >= startRow && r < startRow + shape.length &&
        c >= startCol && c < startCol + shape[0].length &&
        shape[r - startRow][c - startCol] === 1
      );
      if (inShape && !board[r][c]) {
        if (valid) {
          cell.classList.add('preview');
          cell.style.backgroundColor = piece.color + '99'; // полупрозрачный
        } else {
          cell.classList.add('invalid-preview');
          cell.style.backgroundColor = 'rgba(255,80,80,0.3)';
        }
      }
    }
  }
}

// Полная перерисовка доски (после изменений)
function renderBoard() {
  boardEl.innerHTML = '';
  cellElements = Array(ROWS).fill().map(() => Array(COLS).fill(null));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (board[r][c] !== 0) {
        cell.classList.add('filled');
        cell.style.backgroundColor = board[r][c];
        cell.style.boxShadow = `0 0 12px ${board[r][c]}`;
      }

      // Обработчик клика
      cell.addEventListener('click', () => {
        if (gameOver || !selectedPiece || isClearing) return;
        if (canPlace(selectedPiece, r, c)) {
          placePiece(selectedPiece, r, c);
          renderBoard();
          clearFullLinesAndColumns();
          renderPieces();
        }
      });

      // Для мобильных: касание активирует клик
      cell.addEventListener('touchend', (e) => {
        e.preventDefault();
        cell.click();
      });

      // Превью при наведении
      cell.addEventListener('mouseenter', () => {
        if (gameOver || !selectedPiece || isClearing) return;
        updatePreview(selectedPiece, r, c);
      });
      cell.addEventListener('mouseleave', () => {
        updatePreview(null);
      });

      boardEl.appendChild(cell);
      cellElements[r][c] = cell;
    }
  }
}

function renderPieces() {
  piecesPanelEl.innerHTML = '';
  currentPieces.forEach((piece) => {
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
      updatePreview(null); // убрать превью со старой фигуры
    });

    piecesPanelEl.appendChild(pieceDiv);
  });
}

// Запуск
restartBtn.addEventListener('click', resetGame);
resetGame();
