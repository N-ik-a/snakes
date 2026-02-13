const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const startButton = document.getElementById('startButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const restartButton = document.getElementById('restartButton');

const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeModal = document.getElementById('closeModal');
const modalButton = document.getElementById('modalButton');

let gameWidth, gameHeight;
let BLOCK_SIZE;

function resizeGame() {
  // Получаем размеры окна с учетом отступов
  gameWidth = window.innerWidth * 0.5; // 50% ширины окна
  gameHeight = window.innerHeight * 0.5; // 50% высоты окна

  // Устанавливаем размеры канваса
  canvas.width = gameWidth;
  canvas.height = gameHeight;

  // Выбираем размер блока так, чтобы было целое число блоков по ширине и высоте
  const maxBlocksX = Math.floor(gameWidth / 20);
  const maxBlocksY = Math.floor(gameHeight / 20);
  BLOCK_SIZE = Math.min(
    Math.floor(gameWidth / maxBlocksX),
    Math.floor(gameHeight / maxBlocksY)
  );
}

// Вызовем при загрузке и при изменении размера окна
window.addEventListener('resize', resizeGame);
resizeGame();

// Объявляем переменные уровня и слов
let count = 0;
let snake = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  cells: [],
  maxCells: 4
};

const initialWords = ["Компьютер", "Программирование", "Робототехника", "Гаджет", "Интернет", "Сенсор", "Робот", "Технология"];
let words = [];
let currentWord = "";
let letters = [];
let currentLetter = "";
let letterX = 0;
let letterY = 0;

let level = 1;
let wordsPassed = 0;
let speed = 10;
let gameFinished = false;

let waitingForKey = true;
let currentLetterIndex = 0;
let collectedWord = "";

// Обновление статуса
function updateStatus() {
  document.getElementById('status').innerText = `Уровень: ${level} | Пройдено слов: ${wordsPassed}`;
}

// Модальное окно
function showModal(message, buttonText = null, callback = null) {
  modal.style.display = "flex";
  modalMessage.innerText = message;
  if (buttonText) {
    modalButton.innerText = buttonText;
    modalButton.style.display = "inline-block";
    modalButton.onclick = () => {
      modal.style.display = "none";
      if (callback) callback();
    };
  } else {
    modalButton.style.display = "none";
  }
}

closeModal.onclick = () => { modal.style.display = "none"; };
window.onclick = (event) => {
  if (event.target == modal) { modal.style.display = "none"; }
};

// Генерация нового слова
function newWord() {
  if (words.length === 0) {
    showModal("Поздравляем! Вы прошли все слова!", "Начать заново", () => {
      startGame();
    });
    return;
  }
  currentWord = words.splice(Math.floor(Math.random() * words.length), 1)[0];
  letters = [...currentWord];
  currentLetterIndex = 0;
  waitingForKey = true;
  generateLetter();
}

// Генерация буквы
function generateLetter() {
  if (currentLetterIndex >= letters.length) {
    // все буквы собраны
    showModal(`Вы собрали слово: ${currentWord}`, "Следующий уровень", () => {
      level++;
      if (speed < 30) speed += 2;
      updateStatus();
      newWord();
    });
  } else {
    currentLetter = letters[currentLetterIndex];
    letterX = Math.floor(Math.random() * (canvas.width / BLOCK_SIZE)) * BLOCK_SIZE;
    letterY = Math.floor(Math.random() * (canvas.height / BLOCK_SIZE)) * BLOCK_SIZE;
  }
}

// Обработка клавиш
document.addEventListener('keydown', function(e) {
  if (!gameFinished) {
    if (e.keyCode === 37 && snake.dx === 0) {
      snake.dx = -BLOCK_SIZE; snake.dy = 0;
    } else if (e.keyCode === 38 && snake.dy === 0) {
      snake.dy = -BLOCK_SIZE; snake.dx = 0;
    } else if (e.keyCode === 39 && snake.dx === 0) {
      snake.dx = BLOCK_SIZE; snake.dy = 0;
    } else if (e.keyCode === 40 && snake.dy === 0) {
      snake.dy = BLOCK_SIZE; snake.dx = 0;
    }
  }
  if (waitingForKey && e.key.length === 1) {
    if (e.key.toLowerCase() === currentLetter.toLowerCase()) {
      currentLetterIndex++;
      generateLetter();
    }
  }
});

// Обработчики кнопок управления (для мобильных)
document.getElementById('upButton').addEventListener('click', () => {
  if (snake.dy === 0) { snake.dx = 0; snake.dy = -BLOCK_SIZE; }
});
document.getElementById('downButton').addEventListener('click', () => {
  if (snake.dy === 0) { snake.dx = 0; snake.dy = BLOCK_SIZE; }
});
document.getElementById('leftButton').addEventListener('click', () => {
  if (snake.dx === 0) { snake.dx = -BLOCK_SIZE; snake.dy = 0; }
});
document.getElementById('rightButton').addEventListener('click', () => {
  if (snake.dx === 0) { snake.dx = BLOCK_SIZE; snake.dy = 0; }
});

// Проверка столкновения змейки с буквой
function checkCollision() {
  if (snake.x === letterX && snake.y === letterY) {
    const index = letters.indexOf(currentLetter);
    if (index !== -1) {
      letters.splice(index, 1);
    }
    snake.maxCells++;
    if (letters.length === 0) {
      showModal(`Вы собрали слово: ${currentWord}`, "Следующий уровень", () => {
        level++;
        if (speed < 30) speed += 2;
        updateStatus();
        newWord();
      });
    } else {
      generateLetter();
    }
  }
}

// запуск игры
function startGame() {
  // сброс змейки
  snake.x = 0;
  snake.y = 0;
  snake.dx = BLOCK_SIZE;
  snake.dy = 0;
  snake.cells = [];
  snake.maxCells = 4;
  words = [...initialWords];
  level = 1;
  wordsPassed = 0;
  speed = 10;
  updateStatus();
  startButton.style.display = "none";
  nextLevelButton.style.display = "none";
  restartButton.style.display = "none";
  gameFinished = false;
  collectedWord = "";
  newWord();
  loop();
}

// Обработчики кнопок управления
startButton.onclick = () => { startGame(); };
nextLevelButton.onclick = () => {
  newWord();
  nextLevelButton.style.display = "none";
};
restartButton.onclick = () => { startGame(); };

// Основной цикл
function loop() {
  requestAnimationFrame(loop);
  if (++count < speed) return;
  count = 0;

  context.clearRect(0, 0, canvas.width, canvas.height);

  checkCollision();

  // Обновление позиции змейки
  snake.x += snake.dx;
  snake.y += snake.dy;

  // Обеспечиваем обертку
  if (snake.x < 0) snake.x = canvas.width - BLOCK_SIZE;
  if (snake.x >= canvas.width) snake.x = 0;
  if (snake.y < 0) snake.y = canvas.height - BLOCK_SIZE;
  if (snake.y >= canvas.height) snake.y = 0;

  // Запоминаем клетки змейки
  snake.cells.unshift({ x: snake.x, y: snake.y });
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // Проверка столкновения змейки сама с собой
  for (let i = 0; i < snake.cells.length; i++) {
    for (let j = i + 1; j < snake.cells.length; j++) {
      if (snake.cells[i].x === snake.cells[j].x && snake.cells[i].y === snake.cells[j].y) {
        // столкновение, сброс змейки
        snake.x = 0;
        snake.y = 0;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = BLOCK_SIZE;
        snake.dy = 0;
        generateLetter();
      }
    }
  }

  // Рисуем змейку
  context.fillStyle = 'green';
  snake.cells.forEach(cell => {
    context.fillRect(cell.x, cell.y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
  });

  // Рисуем текущую букву
  context.fillStyle = 'red';
  context.font = (BLOCK_SIZE - 2) + 'px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(currentLetter, letterX + BLOCK_SIZE / 2, letterY + BLOCK_SIZE / 2);
}

// Инициализация
startButton.style.display = "inline-block";
updateStatus();


