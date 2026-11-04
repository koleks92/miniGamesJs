// Get elements
const player = document.querySelector("#box");
const enemy = document.querySelector("#enemy");
const gameBox = document.querySelector("#gameBox");
const pointsSpan = document.querySelector("#pointsSpan");
const highscore = document.querySelector("#highscoreSpan");
const startButton = document.querySelector("#start");
const gameOverButton = document.querySelector("#gameOver");

// Start/GameOver
startButton.addEventListener("click", () => {
  gameStart();
  startButton.style.display = "none";
});

gameOverButton.addEventListener("click", () => {
  gameStart();
  gameOverButton.style.display = "none";
});

// Points
let points = 0;
highscore.textContent = localStorage.getItem("highscore");

// Speeds (pixels per frame)
const playerSpeed = 3;
let enemySpeed;

// Enemy direction: 1 = right/down, -1 = left/up
let enemyDirX = Math.random() < 0.5 ? 1 : -1;
let enemyDirY = Math.random() < 0.5 ? 1 : -1;

// Read positions in one place
const getLeft = (item) => parseFloat(item.style.left) || 0;
const getTop = (item) => parseFloat(item.style.top) || 0;

// Furthest an item can go inside the gameBox
const maxLeft = (item) => gameBox.clientWidth - item.offsetWidth;
const maxTop = (item) => gameBox.clientHeight - item.offsetHeight;

// Keep a value between a minimum and a maximum
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Moving functions
const moveLeft = (item, step) => {
  item.style.left = clamp(getLeft(item) - step, 0, maxLeft(item)) + "px";
};
const moveRight = (item, step) => {
  item.style.left = clamp(getLeft(item) + step, 0, maxLeft(item)) + "px";
};
const moveUp = (item, step) => {
  item.style.top = clamp(getTop(item) - step, 0, maxTop(item)) + "px";
};
const moveDown = (item, step) => {
  item.style.top = clamp(getTop(item) + step, 0, maxTop(item)) + "px";
};

// Keyboard buttons
const buttons = {
  ArrowLeft: { pressed: false, func: () => moveLeft(player, playerSpeed) },
  ArrowUp: { pressed: false, func: () => moveUp(player, playerSpeed) },
  ArrowRight: { pressed: false, func: () => moveRight(player, playerSpeed) },
  ArrowDown: { pressed: false, func: () => moveDown(player, playerSpeed) },
};

// Event listeners for key pressed or not
document.addEventListener("keydown", (e) => {
  if (buttons[e.key]) {
    buttons[e.key].pressed = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (buttons[e.key]) {
    buttons[e.key].pressed = false;
  }
});

// Collision check (rectangles overlap on both axes)
function collisionCheck(a, b) {
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  return (
    ra.right >= rb.left &&
    ra.left < rb.right &&
    ra.bottom >= rb.top &&
    ra.top < rb.bottom
  );
}

// Bounce: flip direction when the enemy reaches an edge (or goes past it)
function touchingBoundaries(item) {
  const x = getLeft(item);
  const y = getTop(item);

  if (x <= 0) enemyDirX = 1;
  if (y <= 0) enemyDirY = 1;
  if (x >= maxLeft(item)) enemyDirX = -1;
  if (y >= maxTop(item)) enemyDirY = -1;
}

// Move the enemy
function moveEnemy(item) {
  if (enemyDirX === 1) moveRight(item, enemySpeed);
  else moveLeft(item, enemySpeed);

  if (enemyDirY === 1) moveDown(item, enemySpeed);
  else moveUp(item, enemySpeed);
}

let speedTimer;
let pointsTimer;

// Main animation loop
function animate() {
  // Move the player
  Object.values(buttons).forEach((button) => {
    if (button.pressed) {
      button.func();
    }
  });

  points += enemySpeed * 0.01;
  pointsSpan.textContent = parseInt(points);

  // Bounce and move the enemy
  touchingBoundaries(enemy);
  moveEnemy(enemy);

  // Finish the game if collision
  if (collisionCheck(player, enemy)) {
    clearInterval(speedTimer);
    clearInterval(pointsTimer);
    if (points > localStorage.getItem("highscore")) {
      localStorage.setItem("highscore", parseInt(points));
      highscore.textContent = parseInt(points);
    }
    gameOverButton.style.display = "flex";
    return;
  }

  requestAnimationFrame(animate);
}

function gameStart() {
  player.style.left = "0px";
  player.style.top = "0px";
  enemy.style.left = "200px";
  enemy.style.top = "150px";

  // Reset points
  points = 0;

  // Enemy speed
  enemySpeed = 1;

  // Enemy gets faster every 10 seconds
  speedTimer = setInterval(() => {
    enemySpeed += 1;
  }, 10000);

  requestAnimationFrame(animate);
}
