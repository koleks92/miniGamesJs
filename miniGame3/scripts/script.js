import { obstacles, spikes, potter, chips } from "./data.js";
import { wrap } from "./helpers.js";

// Constants
const GAME_WIDTH = 800;
const SCALE = 1;
const playerX = 100; // fixed screen position, the world scrolls past
const playerW = 120;
const playerH = 100;

//Canvas/Images
const c = document.querySelector("#background");
const ctx = c.getContext("2d");

const imgSources = {
  bg1: "./images/mario_bg_bottom.jpg",
  bg2: "./images/mario_bg_top.jpg",
  crate: "./images/crate.png",
  player: "./images/c_stand.png",
  playerJumping: "./images/c_jump.png",
  playerRunning1: "./images/c_run1.png",
  playerRunning2: "./images/c_run2.png",
  spikes: "./images/spikes.png",
  potter: "./images/jasiu_potter.png",
  chip: "./images/chip.png",
};

// Images object
const images = {};
const totalImages = Object.keys(imgSources).length;

// Create images objects
Object.entries(imgSources).forEach(([name, path]) => {
  const img = new Image();

  img.onload = onImageLoaded; // handler first
  img.onerror = () => console.error(`Failed to load: ${path}`);

  img.src = path; // src last, this starts the load
  images[name] = img; // store it under its name
});

// Kepp track of images loaded
let loaded = 0;
// Images x in the canvas ( moving )
let bgX = 0;
let speed = 4;
let vy = 0;
let onGround = true;
const gravity = 0.6;
const jumpSpeed = 14;
let running = false;
let playerImageSrc;
let y = 0; // 0 = on the ground, negative = in the air
const jumpHeight = 150;
// Dead
let dead = false;

// Chips
let remainingChips = [...chips];
let collectedChips = 0;

// Moving functions
const moveLeft = () => {
  bgX += speed;
};
const moveRight = () => {
  bgX -= speed;
};

const jump = () => {
  if (!onGround) return;

  onGround = false;
  vy = -jumpSpeed;
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

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    running = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (buttons[e.key]) {
    buttons[e.key].pressed = false;
  }

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    running = false;
  }
});

// Check if a and b positions overlaps
function overlaps(a, b) {
  return (
    a.x + a.w > b.x && a.x < b.x + b.w && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function onImageLoaded() {
  // Count loaded images
  loaded++;
  if (loaded !== totalImages) return;

  // Images widths and heights
  const w1 = images.bg1.width * SCALE;
  const h1 = images.bg1.height * SCALE;
  const w2 = images.bg2.width * SCALE;
  const h2 = images.bg2.height * SCALE;

  // Check if player and objects collide
  function collides(objects) {
    const playerBox = {
      x: playerX,
      y: h2 - playerH + y,
      w: playerW,
      h: playerH,
    };

    return objects.find((o) => {
      const objectBox = { x: bgX + o.x, y: o.y + h2, w: o.w, h: o.h };
      return overlaps(playerBox, objectBox);
    });
  }

  // Canvas / game width and height
  c.width = GAME_WIDTH;
  c.height = h1 + h2;

  // each call now gets its own offset
  function drawLayer(image, w, h, y, offset) {
    for (let x = offset; x < c.width; x += w) {
      ctx.drawImage(image, x, y, w, h);
    }
  }

  // Running animation
  const runFrames = [images.playerRunning1, images.playerRunning2];
  let frameCount = 0;
  const frameDelay = 8;

  function gameLoop() {
    // Increase frame counter for running animation
    frameCount += 0.5;
    let runIndex = Math.floor(frameCount / frameDelay) % 2 ? 0 : 1;

    // Gravity runs in both states (alive and dead)
    const oldBgX = bgX;
    const oldY = y;

    if (!dead) {
      // X move
      Object.values(buttons).forEach((button) => {
        if (button.pressed) button.func();
      });

      if (collides(obstacles)) {
        bgX = oldBgX;
      }
    }

    // Y move
    vy += gravity;
    y += vy;

    if (!dead) {
      // Floor
      if (y >= 0) {
        y = 0;
        vy = 0;
        onGround = true;
      } else {
        onGround = false;
      }

      // Crates
      const hit = collides(obstacles);
      if (hit) {
        if (vy > 0) {
          y = hit.y;
          vy = 0;
          onGround = true;
        } else if (vy < 0) {
          y = oldY;
          vy = 0;
        }
      }

      // Spikes
      if (collides(spikes)) {
        dead = true;
        onGround = false; // shows the jumping sprite
        vy = -jumpSpeed / 2; // small hop, then gravity pulls it down
      }

      // Chips
      const chip = collides(remainingChips);
      if (chip) {
        remainingChips = remainingChips.filter((item) => item !== chip);
      }
    }

    // Restart once the player has fallen off the bottom of the canvas
    if (dead && y > h1 + playerH) {
      bgX = 0;
      y = 0;
      vy = 0;
      dead = false;
      onGround = true;
      remainingChips = [...chips];
    }

    // Background speeds
    const offset2 = wrap(bgX, w2);
    const offset1 = wrap(bgX * 0.5, w1);

    // Clear the canvas
    ctx.clearRect(0, 0, c.width, c.height);

    // Draw top and bottom
    drawLayer(images.bg2, w2, h2, 0, offset1);
    drawLayer(images.bg1, w1, h1, h2, offset2);

    // Red tint over the background only (before crates, spikes, player)
    if (dead) {
      ctx.fillStyle = "#ff000080";
      ctx.fillRect(0, 0, c.width, c.height);
    }

    // Draw obstacles
    obstacles.forEach((o) => {
      const screenX = bgX + o.x;
      ctx.drawImage(images.crate, screenX, o.y + h2, o.w, o.h);
    });

    // Draw spikes
    spikes.forEach((s) => {
      const screenX = bgX + s.x;
      ctx.drawImage(images.spikes, screenX, s.y + h2, s.w, s.h);
    });

    // Draw chips
    remainingChips.forEach((c) => {
      const screenX = bgX + c.x;
      ctx.drawImage(images.chip, screenX, c.y + h2, c.w, c.h);
    });

    // Player image based on movement
    if (!onGround) {
      playerImageSrc = images.playerJumping;
    } else if (running) {
      playerImageSrc = runFrames[runIndex];
    } else {
      playerImageSrc = images.player;
    }

    // Draw the player
    ctx.drawImage(playerImageSrc, playerX, h2 - playerH + y, playerW, playerH);

    // Draw the princess
    ctx.drawImage(
      images.potter,
      bgX + potter.x,
      potter.y + h2,
      potter.w,
      potter.h,
    );

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
