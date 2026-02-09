const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const startButton = document.getElementById('startButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const restartButton = document.getElementById('restartButton');

const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeModal = document.getElementById('closeModal');
const modalButton = document.getElementById('modalButton');

const BLOCK_SIZE = 16;
canvas.width = 400;
canvas.height = 400;

let count = 0;

// Объект змейки
let snake = {
  x: 160,
  y: 160,
  dx: BLOCK_SIZE,
  dy: 0,
  cells: [], // массив клеток змейки
  maxCells: 4 // длина змейки
};

// Начальные слова
const initialWords = ["Компьютер", "Программирование", "Робототехника", "Гаджет", "Интернет", "Сенсор", "Робот", "Технология"];
let words = [];
let currentWord = "";
let letters = []; // массив букв текущего слова
let currentLetter = ""; // текущая буква для сбора
let letterX = 0; // позиция для буквы
let letterY = 0;

let level = 1;
let wordsPassed = 0;
let speed = 10; // скорость игры (чем больше, тем медленнее)
let gameFinished = false;

let waitingForKey = true; // ожидание нажатия клавиши для сбора буквы
let currentLetterIndex = 0; // индекс текущей буквы в слове
let collectedWord = ""; // для отображения последнего собранного слова

// Обновление статуса игры
function updateStatus() {
  document.getElementById('status').innerText = `Уровень: ${level} | Пройдено слов: ${wordsPassed}`;
}

// Открытие модального окна с сообщением
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

// Закрытие модального окна по клику на крестик
closeModal.onclick = () => {
  modal.style.display = "none";
};
// Закрытие по клику вне модального окна
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Генерация нового слова для игры
function newWord() {
  if (words.length === 0) {
    showModal("Поздравляем! Вы прошли все слова!", "Начать заново", () => {
      startGame();
    });
    return;
  }
  // Выбираем случайное слово
  currentWord = words[Math.floor(Math.random() * words.length)];
  // Удаляем его из массива, чтобы не повторялось
  words.splice(words.indexOf(currentWord), 1);
  // Создаем массив букв слова
  letters = [...currentWord];
  currentLetterIndex = 0;
  waitingForKey = true;
  generateLetter();
}

// Генерация текущей буквы
function generateLetter() {
  if (currentLetterIndex >= letters.length) {
    // Все буквы собраны
    collectedWord = currentWord; // сохраняем слово для отображения
    showModal(`Вы собрали слово: ${currentWord}`, "Следующий уровень", () => {
      level++;
      if (speed < 30) speed += 2; // увеличиваем скорость
      updateStatus();
      newWord();
    });
  } else {
    // Генерируем текущую букву и позицию
    currentLetter = letters[currentLetterIndex];
    letterX = Math.floor(Math.random() * (canvas.width / BLOCK_SIZE)) * BLOCK_SIZE;
    letterY = Math.floor(Math.random() * (canvas.height / BLOCK_SIZE)) * BLOCK_SIZE;
  }
}

// Обработка нажатий клавиш
document.addEventListener('keydown', function(e) {
  if (!gameFinished) {
    // Управление стрелками
    if (e.keyCode === 37 && snake.dx === 0) { // влево
      snake.dx = -BLOCK_SIZE;
      snake.dy = 0;
    } else if (e.keyCode === 38 && snake.dy === 0) { // вверх
      snake.dy = -BLOCK_SIZE;
      snake.dx = 0;
    } else if (e.keyCode === 39 && snake.dx === 0) { // вправо
      snake.dx = BLOCK_SIZE;
      snake.dy = 0;
    } else if (e.keyCode === 40 && snake.dy === 0) { // вниз
      snake.dy = BLOCK_SIZE;
      snake.dx = 0;
    }
  }

  // Обработка клавиш для сбора буквы
  if (waitingForKey && e.key.length === 1) {
    if (e.key.toLowerCase() === currentLetter.toLowerCase()) {
      currentLetterIndex++;
      generateLetter();
    }
  }
});

// Обработчики кнопок управления для мобильных устройств
document.getElementById('upButton').addEventListener('click', () => {
  if (snake.dy === 0) {
    snake.dx = 0;
    snake.dy = -BLOCK_SIZE;
  }
});
document.getElementById('downButton').addEventListener('click', () => {
  if (snake.dy === 0) {
    snake.dx = 0;
    snake.dy = BLOCK_SIZE;
  }
});
document.getElementById('leftButton').addEventListener('click', () => {
  if (snake.dx === 0) {
    snake.dx = -BLOCK_SIZE;
    snake.dy = 0;
  }
});
document.getElementById('rightButton').addEventListener('click', () => {
  if (snake.dx === 0) {
    snake.dx = BLOCK_SIZE;
    snake.dy = 0;
  }
});

// Проверка столкновения змейки с текущей буквой
function checkCollision() {
  if (snake.x === letterX && snake.y === letterY) {
    const index = letters.indexOf(currentLetter);
    if (index !== -1) {
      // Удаляем собранную букву из массива
      letters.splice(index, 1);
    }
    // Увеличиваем длину змейки
    snake.maxCells++;
    if (letters.length === 0) {
      // Все буквы собраны, показываем слово
      showModal(`Вы собрали слово: ${currentWord}`, "Следующий уровень", () => {
        level++;
        if (speed < 30) speed += 2;
        updateStatus();
        newWord();
      });
    } else {
      // Генерируем следующую букву
      generateLetter();
    }
  }
}

// Запуск новой игры
function startGame() {
  // Сброс настроек змейки
  snake.x = 160;
  snake.y = 160;
  snake.dx = BLOCK_SIZE;
  snake.dy = 0;
  snake.cells = [];
  snake.maxCells = 4;

  // Восстановление начальных слов
  words = [...initialWords];
  level = 1;
  wordsPassed = 0;
  speed = 10;
  updateStatus();

  // Скрываем кнопки старт/следующий уровень/повтор
  startButton.style.display = "none";
  nextLevelButton.style.display = "none";
  restartButton.style.display = "none";

  gameFinished = false;
  collectedWord = ""; // сбрасываем последнее слово
  newWord();
  loop();
}

// Обработчики для кнопок управления
startButton.onclick = () => {
  startGame();
};
nextLevelButton.onclick = () => {
  newWord();
  nextLevelButton.style.display = "none";
};
restartButton.onclick = () => {
  startGame();
};

// Основной цикл игры
function loop() {
  requestAnimationFrame(loop);
  if (++count < speed) return;
  count = 0;

  // Очистка канваса
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Проверка столкновений
  checkCollision();

  // Обновление позиции змейки
  snake.x += snake.dx;
  snake.y += snake.dy;

  // Обеспечиваем обертку по границам
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
        // Если столкнулись, сбрасываем змейку
        snake.x = 160;
        snake.y = 160;
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
startButton.style.display = "inline-block"; // показываем кнопку старт
updateStatus();