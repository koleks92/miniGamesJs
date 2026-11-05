const player = document.querySelector("#player");

// Constants
const GAME_WIDTH = 800;
const SCALE = 1;

//Canvas/Images
const c = document.querySelector("#background");
const ctx = c.getContext("2d");
const img = new Image();
const img2 = new Image();


// Kepp track of images loaded
let loaded = 0;
// Images x in the canvas ( moving )
let bgX = 0;
let speed = 3;
let jumping = false;

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

// Jump functions
const jump = () => {
  if (!jumping) {
    jumping = true;
    y = 0;
    jumpHeight = 150;

    // Up
    function up() {
      const step = (jumpHeight - Math.abs(y)) * 0.1 + 1;
      y -= step;
      player.style.transform = `translateY(${y}px)`;

      if (y > -jumpHeight) {
        requestAnimationFrame(up);
      } else {
        requestAnimationFrame(down);
      }
    }

    requestAnimationFrame(up);

    // Down
    function down() {
      const step = (jumpHeight - Math.abs(y)) * 0.1 + 1;
      y += step;
      player.style.transform = `translateY(${y}px)`;

      if (y <= 0) {
        requestAnimationFrame(down);
      } else {
        player.style.transform = `translateY(0px)`;
        jumping = false;
        return;
      }
    }
  }
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


function onImageLoaded() {
  loaded++;
  if (loaded !== 2) return;

  // Images widths and heights
  const w1 = img.width * SCALE; // bottom image (slow layer)
  const h1 = img.height * SCALE;
  const w2 = img2.width * SCALE; // top image (full speed)
  const h2 = img2.height * SCALE;

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
    drawLayer(img2, w2, h2, 0, offset1);
    drawLayer(img, w1, h1, h2, offset2);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

// Load images
img.onload = onImageLoaded;
img2.onload = onImageLoaded;

img.src = "./images/mario_bg_bottom.jpg";
img2.src = "./images/mario_bg_top.jpg";
