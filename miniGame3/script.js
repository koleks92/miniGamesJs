// const player = document.querySelector("#player");

// Constants
const GAME_WIDTH = 800;
const SCALE = 1;
const CRATE_SIZE = 80;
const playerX = 100; // fixed screen position, the world scrolls past
const playerW = 120;
const playerH = 100;

//Canvas/Images
const c = document.querySelector("#background");
const ctx = c.getContext("2d");

const bg1 = new Image();
const bg2 = new Image();
const crate = new Image();
const player = new Image();

// Kepp track of images loaded
let loaded = 0;
// Images x in the canvas ( moving )
let bgX = 0;
let speed = 3;
let jumping = false;
let y = 0; // 0 = on the ground, negative = in the air
const jumpHeight = 150;

// Helper functions
// wraps any number into the range -w to 0, in both directions
const wrap = (value, w) => (((value % w) + w) % w) - w;

// Moving functions
const moveLeft = () => {
  bgX += speed;
};
const moveRight = () => {
  bgX -= speed;
};

const jump = () => {
  if (jumping) return;
  jumping = true;

  function up() {
    const step = (jumpHeight - Math.abs(y)) * 0.1 + 1;
    y = Math.max(y - step, -jumpHeight); // clamp so it never overshoots the top

    if (y > -jumpHeight) {
      requestAnimationFrame(up);
    } else {
      requestAnimationFrame(down);
    }
  }

  function down() {
    const step = (jumpHeight - Math.abs(y)) * 0.1 + 1;
    y = Math.min(y + step, 0); // clamp so it never sinks below the ground

    if (y < 0) {
      requestAnimationFrame(down);
    } else {
      jumping = false; // landed
    }
  }

  requestAnimationFrame(up);
};

// Keyboard buttons
const buttons = {
  ArrowLeft: { pressed: false, func: () => moveLeft() },
  ArrowRight: { pressed: false, func: () => moveRight() },
  ArrowUp: { pressed: false, func: () => jump() },
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

// Obstacles
const obstacles = [
  { x: 400, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 400 + CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 400 + CRATE_SIZE, y: -(CRATE_SIZE * 2), w: CRATE_SIZE, h: CRATE_SIZE },
];

function onImageLoaded() {
  loaded++;
  if (loaded !== 4) return;

  // Images widths and heights
  const w1 = bg1.width * SCALE; // bottom image (slow layer)
  const h1 = bg1.height * SCALE;
  const w2 = bg2.width * SCALE; // top image (full speed)
  const h2 = bg2.height * SCALE;

  // Canvas / game width and height
  c.width = GAME_WIDTH;
  c.height = h1 + h2;

  // each call now gets its own offset
  function drawLayer(image, w, h, y, offset) {
    for (let x = offset; x < c.width; x += w) {
      ctx.drawImage(image, x, y, w, h);
    }
  }

  function gameLoop() {
    // Buttons control
    Object.values(buttons).forEach((button) => {
      if (button.pressed) button.func();
    });

    // Background speeds
    const offset2 = wrap(bgX, w2);
    const offset1 = wrap(bgX * 0.5, w1);

    // Clear the canvas
    ctx.clearRect(0, 0, c.width, c.height);

    // Draw top and bottom
    drawLayer(bg2, w2, h2, 0, offset1);
    drawLayer(bg1, w1, h1, h2, offset2);

    // Draw obstacles
    obstacles.forEach((o) => {
      const screenX = bgX + o.x;
      ctx.drawImage(crate, screenX, o.y + h2, o.w, o.h);
    });

    // Draw the player
    ctx.drawImage(player, playerX, h2 - playerH + y, playerW, playerH);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

// Load images
bg1.onload = onImageLoaded;
bg2.onload = onImageLoaded;
crate.onload = onImageLoaded;
player.onload = onImageLoaded;

bg1.src = "./images/mario_bg_bottom.jpg";
bg2.src = "./images/mario_bg_top.jpg";
crate.src = "./images/crate.png";
player.src = "./images/c_stand.png";


// TODO
// - Animations, jumpt, run etc.
// - Obstacle avoidance
// - Enemies
// - Princess
// - Points