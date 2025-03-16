// Получаем элементы DOM
const twoPlayerButton = document.getElementById('two-player-mode');
const aiButton = document.getElementById('ai-mode');
const gameContainer = document.getElementById('game-container');
const grid = document.getElementById('grid');
const targetSumDisplay = document.getElementById('target-sum');
const currentPlayerDisplay = document.getElementById('current-player');
const gameMessage = document.getElementById('game-message');
const backButton = document.getElementById('back-button');
const settingsIcon = document.getElementById('settings-icon');
const rulesDiv = document.getElementById('rules');
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.querySelector('.close');

// Игровые переменные
let numbers = [];
let board = Array(9).fill(null);
let playerTurn = 'X';
let targetSum = 0;
let gameActive = true;
let aiMode = false;
let selectedNumbers = { X: [], O: [] };

// Генерация случайных чисел для игрового поля
function generateNumbers() {
    numbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9) + 1);
    targetSum = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
    return targetSum;
}

// Создание игрового поля
function createGrid() {
    grid.innerHTML = '';
    board = Array(9).fill(null);
    selectedNumbers = { X: [], O: [] };
    gameActive = true;
    playerTurn = 'X';
    currentPlayerDisplay.textContent = 'X';
    targetSum = generateNumbers();
    targetSumDisplay.textContent = targetSum;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = numbers[i];
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        grid.appendChild(cell);
    }

    settingsIcon.style.display = 'block';
    rulesDiv.style.display = 'none';
}

// Обработка клика по ячейке
function handleCellClick(index) {
    if (!gameActive || board[index] !== null) return;
    const cell = document.querySelector(`[data-index="${index}"]`);
    board[index] = playerTurn;
    cell.classList.add(playerTurn === 'X' ? 'player-x' : 'player-o');
    cell.classList.add('selected');

    selectedNumbers[playerTurn].push(numbers[index]);
    if (selectedNumbers[playerTurn].reduce((a, b) => a + b, 0) === targetSum) {
        displayGameMessage(`Победил игрок ${playerTurn}!`);
        gameActive = false;
        setTimeout(resetGame, 2000);
    } else if (board.every(cell => cell !== null)) {
        displayGameMessage("Ничья!");
        gameActive = false;
        setTimeout(resetGame, 2000);
    } else {
        playerTurn = playerTurn === 'X' ? 'O' : 'X';
        currentPlayerDisplay.textContent = playerTurn;
        if (aiMode && playerTurn === 'O') setTimeout(aiMove, 500);
    }
}

// Ход ИИ (улучшенный)
function aiMove() {
    if (!gameActive) return;

    const availableMoves = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (availableMoves.length === 0) return;

    // Текущая сумма ИИ
    const aiSum = selectedNumbers['O'].reduce((a, b) => a + b, 0);

    // Попытка выиграть
    for (const move of availableMoves) {
        const newSum = aiSum + numbers[move];
        if (newSum === targetSum) {
            handleCellClick(move);
            return;
        }
    }

    // Попытка заблокировать игрока
    const playerSum = selectedNumbers['X'].reduce((a, b) => a + b, 0);
    for (const move of availableMoves) {
        const newPlayerSum = playerSum + numbers[move];
        if (newPlayerSum === targetSum) {
            handleCellClick(move);
            return;
        }
    }

    // Выбор числа, которое приближает ИИ к целевой сумме
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    for (const move of availableMoves) {
        const newSum = aiSum + numbers[move];
        if (newSum <= targetSum) {
            const score = newSum;
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    handleCellClick(bestMove);
}

// Сброс игры
function resetGame() {
    gameContainer.style.display = 'none';
    settingsIcon.style.display = 'none';
    rulesDiv.style.display = 'block';
    gameMessage.style.display = 'none';
    numbers = [];
    board = Array(9).fill(null);
    playerTurn = 'X';
    targetSum = 0;
    gameActive = false;
    aiMode = false;
}

// Отображение сообщения о результате игры
function displayGameMessage(message) {
    gameMessage.textContent = message;
    gameMessage.style.display = 'block';
}

// Обработчики событий
twoPlayerButton.addEventListener('click', () => {
    aiMode = false;
    gameContainer.style.display = 'block';
    createGrid();
});

aiButton.addEventListener('click', () => {
    aiMode = true;
    gameContainer.style.display = 'block';
    createGrid();
    if (playerTurn === 'O') setTimeout(aiMove, 500);
});

settingsIcon.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

backButton.addEventListener('click', () => window.history.back());
