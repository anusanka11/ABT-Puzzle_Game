const GRID_COLS = 6;
const GRID_ROWS = 5;
const TOTAL_PIECES = GRID_COLS * GRID_ROWS;

const playerForm = document.getElementById('playerForm');
const detailsPanel = document.getElementById('detailsPanel');
const gamePanel = document.getElementById('gamePanel');
const resultPanel = document.getElementById('resultPanel');
const puzzleBoard = document.getElementById('puzzleBoard');
const timerEl = document.getElementById('timer');
const gameStatus = document.getElementById('gameStatus');

let player = { name: '', school: '', team: '' };
let pieces = [];
let selectedPiece = null;
let startTime = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let gameFinished = false;

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  const hours = Math.floor(totalSeconds / 3600);
  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${mins}:${secs}`
    : `${mins}:${secs}`;
}

function shufflePieces() {
  const arr = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
  // Fisher-Yates shuffle. Avoid an already solved board.
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.every((piece, i) => piece === i)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

function drawBoard() {
  puzzleBoard.innerHTML = '';
  pieces.forEach((correctIndex, boardIndex) => {
    const piece = document.createElement('button');
    piece.type = 'button';
    piece.className = 'puzzle-piece';
    piece.setAttribute('aria-label', `Puzzle piece ${boardIndex + 1}`);
    const correctRow = Math.floor(correctIndex / GRID_COLS);
    const correctCol = correctIndex % GRID_COLS;
    piece.style.backgroundPosition = `${(correctCol / (GRID_COLS - 1)) * 100}% ${(correctRow / (GRID_ROWS - 1)) * 100}%`;
    piece.dataset.boardIndex = boardIndex;
    if (selectedPiece === boardIndex) piece.classList.add('selected');
    piece.addEventListener('click', () => handlePieceClick(boardIndex));
    puzzleBoard.appendChild(piece);
  });
}

function handlePieceClick(index) {
  if (gameFinished) return;
  if (selectedPiece === null) {
    selectedPiece = index;
    gameStatus.textContent = 'Piece selected. Now choose the piece you want to swap with.';
    drawBoard();
    return;
  }
  if (selectedPiece === index) {
    selectedPiece = null;
    gameStatus.textContent = 'Selection cleared. Choose a piece.';
    drawBoard();
    return;
  }
  [pieces[selectedPiece], pieces[index]] = [pieces[index], pieces[selectedPiece]];
  selectedPiece = null;
  drawBoard();

  const placed = pieces.filter((piece, i) => piece === i).length;
  if (pieces.every((piece, i) => piece === i)) {
    finishGame();
  } else {
    gameStatus.textContent = `${placed} of ${TOTAL_PIECES} pieces are in the correct position. Keep going!`;
  }
}

function startTimer() {
  startTime = Date.now();
  elapsedSeconds = 0;
  timerEl.textContent = '00:00';
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(elapsedSeconds);
  }, 250);
}

function startGame() {
  selectedPiece = null;
  gameFinished = false;
  pieces = shufflePieces();
  detailsPanel.classList.add('hidden');
  resultPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  document.getElementById('playerSummary').textContent =
    `${player.name} • ${player.school} • Team ${player.team}`;
  gameStatus.textContent = 'Choose two pieces to swap them.';
  drawBoard();
  startTimer();
  gamePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function finishGame() {
  gameFinished = true;
  clearInterval(timerInterval);
  elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timerEl.textContent = formatTime(elapsedSeconds);
  gamePanel.classList.add('hidden');
  resultPanel.classList.remove('hidden');
  document.getElementById('finalTime').textContent = formatTime(elapsedSeconds);
  document.getElementById('resultDetails').innerHTML = `
    <div><span>Player name</span><strong></strong></div>
    <div><span>School</span><strong></strong></div>
    <div><span>Team number</span><strong></strong></div>`;
  const fields = document.querySelectorAll('#resultDetails strong');
  fields[0].textContent = player.name;
  fields[1].textContent = player.school;
  fields[2].textContent = player.team;
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

playerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!playerForm.reportValidity()) return;
  player = {
    name: document.getElementById('playerName').value.trim(),
    school: document.getElementById('schoolName').value.trim(),
    team: document.getElementById('teamNumber').value.trim()
  };
  if (!player.name || !player.school || !player.team) return;
  startGame();
});

document.getElementById('restartBtn').addEventListener('click', () => {
  if (confirm('Shuffle the puzzle again? Your current attempt and timer will restart.')) {
    startGame();
  }
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
  resultPanel.classList.add('hidden');
  detailsPanel.classList.remove('hidden');
  document.getElementById('playerName').value = player.name;
  document.getElementById('schoolName').value = player.school;
  document.getElementById('teamNumber').value = player.team;
  detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('whatsappBtn').addEventListener('click', () => {
  const message = `Adventure Based Training Center - Naula Puzzle Game result%0AName: ${encodeURIComponent(player.name)}%0ASchool: ${encodeURIComponent(player.school)}%0ATeam number: ${encodeURIComponent(player.team)}%0ATime: ${encodeURIComponent(formatTime(elapsedSeconds))}%0AI will send my completed-screen screenshot separately.`;
  // Opens a WhatsApp chat with a prefilled message; the player must attach the screenshot and send it.
  window.open(`https://wa.me/94717043887?text=${message}`, '_blank', 'noopener,noreferrer');
});
