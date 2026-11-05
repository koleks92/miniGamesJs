// Get elements
const player = document.querySelector("#player");
const barrel = document.querySelector("#barrel");
const enemy = document.querySelector("#enemy");
const gameBox = document.querySelector("#gameBox");
const bullet = document.querySelector("#bullet");

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
highscore.textContent = localStorage.getItem("highscore_2");

// CONSTANTS
// Player speed
const playerSpeed = 2;
// Barrel max angles
const maxUp = -180;
const maxDown = 0;
// Max shoot length
const maxLength = Math.hypot(gameBox.clientHeight, gameBox.clientWidth);

// HELP FUNCTIONS
// Keep a value between a minimum and a maximum
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Variables 
let currentAngle = 0;  // Barrel angle
let enemyY = 0;       // Enemy position Y axis
let speedEnemy = 1;   // Enemy speed
let speedInterval;    // Enemy speed interval
let bulletAnim;      // Bullet animation 


// Read positions in one place
const getLeft = (item) => parseFloat(item.style.left) || 0;

// Furthest an item can go inside the gameBox
const maxLeft = (item) => gameBox.clientWidth - item.offsetWidth;

// Moving functions
const moveLeft = (item, step) => {
  item.style.left = clamp(getLeft(item) - step, 0, maxLeft(item)) + "px";
};
const moveRight = (item, step) => {
  item.style.left = clamp(getLeft(item) + step, 0, maxLeft(item)) + "px";
};

// Aim function
const aim = (item, step) => {
  const current = item.style.transform; // "rotate(45deg)"
  const angle = parseFloat(current.replace(/[^\d.-]/g, "")) || 0;

  currentAngle = angle + step;

  item.style.transform =
    "rotate(" + clamp(angle + step, maxUp, maxDown) + "deg)";
};

// Keyboard buttons
const buttons = {
  ArrowLeft: { pressed: false, func: () => moveLeft(player, playerSpeed) },
  ArrowRight: { pressed: false, func: () => moveRight(player, playerSpeed) },
  ArrowUp: { pressed: false, func: () => aim(barrel, -1) },
  ArrowDown: { pressed: false, func: () => aim(barrel, 1) },
};

// Event listeners for key pressed or not
document.addEventListener("keydown", (e) => {
  if (buttons[e.key]) {
    buttons[e.key].pressed = true;
  }

  if (e.key === " ") {
    shoot(currentAngle, maxLength);
  }
});

document.addEventListener("keyup", (e) => {
  if (buttons[e.key]) {
    buttons[e.key].pressed = false;
  }
});


function shoot(angle, length) {
  bulletAnim?.cancel(); // returns bullet to its start

  const box = gameBox.getBoundingClientRect();
  const b = bullet.getBoundingClientRect();

  // Start: bullet center, in screen coordinates
  const startX = b.left + b.width / 2;
  const startY = b.top + b.height / 2;

  const rad = angle * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  let dx = length * cos;
  let dy = length * sin;

  // scale = 1 means the full path fits; smaller means cut it down
  let scale = 1;

  const endX = startX + dx;
  const endY = startY + dy;

  if (endX > box.right) scale = Math.min(scale, (box.right - startX) / dx);
  if (endX < box.left) scale = Math.min(scale, (box.left - startX) / dx);
  if (endY > box.bottom) scale = Math.min(scale, (box.bottom - startY) / dy);
  if (endY < box.top) scale = Math.min(scale, (box.top - startY) / dy);

  // Shrink BOTH by the same amount, so the direction is preserved
  dx *= scale;
  dy *= scale;

  bulletAnim = bullet.animate(
    [
      { transform: "translate(0px, 0px)" },
      { transform: `translate(${dx}px, ${dy}px)` },
    ],
    { duration: 500, easing: "linear", fill: "forwards" },
  );

  bulletAnim.onfinish = () => {
    bulletAnim.cancel(); // removes the animation, bullet goes back to start
  };
}

// Colision check function
function collisionCheck() {
  const bulletRect = bullet.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();

  // Enemy bottom
  const enemyX = enemyRect.x;
  const enemyX2 = enemyRect.x + enemyRect.width;

  // Enemy sides
  const enemyY = enemyRect.y;
  const enemyY2 = enemyRect.y + enemyRect.height;

  if (
    bulletRect.x >= enemyX &&
    bulletRect.x <= enemyX2 &&
    bulletRect.y >= enemyY &&
    bulletRect.y <= enemyY2
  ) {
    return true;
  }
}



// Move enemy along y axis
function moveEnemy(speed) {
  enemyY += speed;
  enemy.style.top = enemyY + "px";

  if (enemyY >= gameBox.clientHeight - enemy.offsetHeight) {
    return false;
  } else {
    return true;
  }
}

// Respawn the enemy
function respawnEnemy() {
  // Reset enemyY
  enemyY = 0;

  // Min and max x for new enemy
  const min = 0;
  const max = gameBox.clientWidth - enemy.offsetWidth;

  // Generate random x
  const randomX = Math.floor(Math.random() * (max - min + 1)) + min;

  // Move enemy
  enemy.style.left = randomX + "px";
}

// Main animation loop
function animate() {
  // Move the player
  Object.values(buttons).forEach((button) => {
    if (button.pressed) {
      button.func();
    }
  });

  if (!moveEnemy(speedEnemy)) {
    if (points > localStorage.getItem("highscore_2")) {
      localStorage.setItem("highscore_2", parseInt(points));
      highscore.textContent = parseInt(points);
    }
    gameOverButton.style.display = "flex";
    clearInterval(speedInterval);
    console.log("Game Over!");
    return;
  }

  // Collision check
  if (collisionCheck()) {
    // Respawn enemy
    respawnEnemy();
    // Add points
    points++;
    pointsSpan.textContent = parseInt(points);
  }

  requestAnimationFrame(animate);
}

function gameStart() {
  // Spawn enemy
  respawnEnemy();

  // Reset points and speed
  points = 0;
  speedEnemy = 1;

  // Start speed interval
  speedInterval = setInterval(() => {
    speedEnemy += 0.5;
  }, 10000);

  // Start animation
  requestAnimationFrame(animate);
}
