// Get elements
const player = document.querySelector("#player");
const barrel = document.querySelector("#barrel");
const enemy = document.querySelector("#enemy");
const gameBox = document.querySelector("#gameBox");
const bullet = document.querySelector("#bullet");

// CONSTANTS
// Player speed
const playerSpeed = 1;
// Barrel max angles
const maxUp = -90;
const maxDown = 0;
// Max shoot length
const maxLength = Math.hypot(gameBox.clientHeight, gameBox.clientWidth);

// HELP FUNCTIONS
// Keep a value between a minimum and a maximum
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Current angle
let currentAngle = 0;

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

// Shoot function
function shoot(angle, length) {
  // Get the shoot line
  // 1. Convert to radians
  const angleRadians = angle * (Math.PI / 180);

  const dx = length * Math.cos(angleRadians);
  const dy = length * Math.sin(angleRadians); 

  bullet.animate(
    [
      { transform: "translate(0px, 0px)" },
      { transform: `translate(${dx}px, ${dy}px)` },
    ],
    { duration: 500, easing: "linear", fill: "forwards" },
  );

  // Move along the shoot line
  //
}

// Main animation loop
function animate() {
  // Move the player
  Object.values(buttons).forEach((button) => {
    if (button.pressed) {
      button.func();
    }
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
