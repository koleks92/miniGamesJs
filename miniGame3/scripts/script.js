// ============================================================
// IMPORTS
// ============================================================
import {
  obstacles,
  spikes,
  potter,
  chips,
  cubes,
  gameOverMessages,
} from "./data.js";
import { drawInfoBox, drawText } from "./draw.js";
import { wrap } from "./helpers.js";
import { imgSources } from "./images.js";

// ============================================================
// CONSTANTS
// ============================================================
const GAME_WIDTH = 800;
const SCALE = 1;

// Player: fixed screen position, the world scrolls past him
const playerX = 100;
const playerW = 120;
const playerH = 100;

// Physics
const gravity = 0.5;
const jumpSpeed = 14;

// Typewriter pause
const pause = 50;

// ============================================================
// CANVAS
// ============================================================
const c = document.querySelector("#background");
const ctx = c.getContext("2d");

// Message box shown when the game is over
// (note: measured before the canvas is resized in onImageLoaded)
const box = {
  x: c.width / 4,
  y: c.height / 4,
  w: c.width / 2,
  h: c.height / 8,
};

// ============================================================
// GAME STATE
// ============================================================
// World scroll
let bgX = 0; // how far the world has scrolled (negative = moved right)
let speed = 4.5; // pixels per frame when walking

// Player vertical movement (y = 0 is the ground, negative = in the air)
let y = 0;
let vy = 0; // vertical velocity
let onGround = true;

// Player look and movement
let running = false;
let playerDir = 1; // 1 = facing right, -1 = facing left
let playerImageSrc; // the sprite chosen each frame

// Game status
let dead = false;
let gameOver = false;

// Chips
let remainingChips = [...chips];
let collectedChips = 0; // not used yet

// Typewriter text
let charIndex = 0;
let messageIndex = 0;

// ============================================================
// IMAGE LOADING
// ============================================================
const images = {};
const totalImages = Object.keys(imgSources).length;
let loaded = 0; // how many images have finished loading

// Create an Image for every entry in imgSources
Object.entries(imgSources).forEach(([name, path]) => {
  const img = new Image();

  img.onload = onImageLoaded; // handler first
  img.onerror = () => console.error(`Failed to load: ${path}`);

  img.src = path; // src last, this starts the load
  images[name] = img; // store it under its name
});

// ============================================================
// PLAYER ACTIONS
// ============================================================
const moveLeft = () => {
  bgX += speed;
  playerDir = -1;
};

const moveRight = () => {
  bgX -= speed;
  playerDir = 1;
};

const jump = () => {
  if (!onGround) return; // no double jump

  onGround = false;
  vy = -jumpSpeed;
};

// ============================================================
// KEYBOARD INPUT
// ============================================================
// Each key has a "pressed" flag, and a function the game loop runs while held
const buttons = {
  ArrowLeft: { pressed: false, func: () => moveLeft() },
  ArrowRight: { pressed: false, func: () => moveRight() },
  ArrowUp: { pressed: false, func: () => jump() },
};

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

// ============================================================
// HELPERS
// ============================================================
// True if rectangles a and b share any area
function overlaps(a, b) {
  return (
    a.x + a.w > b.x && a.x < b.x + b.w && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// ============================================================
// GAME SETUP (runs once, when the last image has loaded)
// ============================================================
function onImageLoaded() {
  loaded++;
  if (loaded !== totalImages) return; // wait for the rest

  // ----- Sizes -----
  // Background layers: 1 = ground (bottom), 2 = sky (top)
  const w1 = images.bg1.width * SCALE;
  const h1 = images.bg1.height * SCALE;
  const w2 = images.bg2.width * SCALE;
  const h2 = images.bg2.height * SCALE;

  // Canvas size: fixed width, height = both background layers stacked
  c.width = GAME_WIDTH;
  c.height = h1 + h2;

  // ----- Helpers that need the sizes above -----
  // Returns the first object in the list that overlaps the player (or undefined)
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

  // Draws a background image repeatedly across the canvas, starting at offset
  function drawLayer(image, w, h, y, offset) {
    for (let x = offset; x < c.width; x += w) {
      ctx.drawImage(image, x, y, w, h);
    }
  }

  // ----- Animation data -----
  let frameCount = 0;
  const frameDelay = 8; // bigger = slower running animation

  const rightPlayerRun = [images.player_run_right_1, images.player_run_right_2];
  const leftPlayerRun = [images.player_run_left_1, images.player_run_left_2];

  const leftCubeRun = [images.cube_left_1, images.cube_left_2];
  const rightCubeRun = [images.cube_right_1, images.cube_right_2];

  // ==========================================================
  // GAME LOOP (runs every frame)
  // ==========================================================
  function gameLoop() {
    // ----- 1. Animation frame -----
    frameCount += 0.5;
    let runIndex = Math.floor(frameCount / frameDelay) % 2 ? 0 : 1;

    // Remember positions so a move can be undone
    const oldBgX = bgX;
    const oldY = y;

    // ----- 2. Horizontal movement (only while playing) -----
    if (!dead && !gameOver) {
      Object.values(buttons).forEach((button) => {
        if (button.pressed) button.func();
      });

      // Walked into a crate: undo the move
      if (collides(obstacles)) {
        bgX = oldBgX;
      }
    }

    // ----- 3. Gravity (runs while alive or dead, but not after game over) -----
    if (!gameOver) {
      vy += gravity;
      y += vy;
    }

    // ----- 4. Collisions (only while playing) -----
    if (!dead && !gameOver) {
      // Floor
      if (y >= 0) {
        y = 0;
        vy = 0;
        onGround = true;
      } else {
        onGround = false;
      }

      // Crates: land on top when falling, bump head when rising
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

      // Spikes: die
      if (collides(spikes)) {
        dead = true;
        onGround = false; // shows the jumping sprite
        vy = -jumpSpeed / 2; // small hop, then gravity pulls it down
      }

      // Chips: collect
      const chip = collides(remainingChips);
      if (chip) {
        remainingChips = remainingChips.filter((item) => item !== chip);
      }

      // Cubes (enemies): die
      if (collides(cubes)) {
        dead = true;
        onGround = false;
        vy = -jumpSpeed / 2; // small hop, then gravity pulls it down
      }
    }

    // ----- 5. Restart once the player has fallen off the bottom -----
    if (dead && y > h1 + playerH) {
      bgX = 0;
      y = 0;
      vy = 0;
      dead = false;
      onGround = true;
      remainingChips = [...chips];
    }

    // ----- 6. Background offsets (layer 2 moves at half speed) -----
    const offset2 = wrap(bgX, w2);
    const offset1 = wrap(bgX * 0.5, w1);

    // ----- 7. Clear the canvas -----
    ctx.clearRect(0, 0, c.width, c.height);

    // ----- 8. Move cubes, bounce off crates -----
    cubes.forEach((cube) => {
      const oldX = cube.x;
      cube.x += cube.dir * 1;

      if (obstacles.some((o) => overlaps(cube, o))) {
        cube.x = oldX; // undo the move so it isn't stuck inside the crate
        cube.dir *= -1; // flip direction
      }
    });

    // ----- 9. Drawing (back to front) -----
    // Background layers
    drawLayer(images.bg2, w2, h2, 0, offset1);
    drawLayer(images.bg1, w1, h1, h2, offset2);

    // Red tint over the background only (before crates, spikes, player)
    if (dead) {
      ctx.fillStyle = "#ff000080";
      ctx.fillRect(0, 0, c.width, c.height);
    }

    // Crates
    obstacles.forEach((o) => {
      const screenX = bgX + o.x;
      ctx.drawImage(images.crate, screenX, o.y + h2, o.w, o.h);
    });

    // Spikes
    spikes.forEach((s) => {
      const screenX = bgX + s.x;
      ctx.drawImage(images.spikes, screenX, s.y + h2, s.w, s.h);
    });

    // Chips
    remainingChips.forEach((c) => {
      const screenX = bgX + c.x;
      ctx.drawImage(images.chip, screenX, c.y + h2, c.w, c.h);
    });

    // Cubes
    cubes.forEach((cube) => {
      if (cube.dir === 1) {
        ctx.drawImage(
          rightCubeRun[runIndex],
          bgX + cube.x,
          cube.y + h2,
          cube.w,
          cube.h,
        );
      } else {
        ctx.drawImage(
          leftCubeRun[runIndex],
          bgX + cube.x,
          cube.y + h2,
          cube.w,
          cube.h,
        );
      }
    });

    // ----- 10. Choose the player sprite -----
    if (!onGround && playerDir === 1) {
      playerImageSrc = images.player_jump_right;
    } else if (!onGround && playerDir === -1) {
      playerImageSrc = images.player_jump_left;
    } else if (running && playerDir === 1) {
      playerImageSrc = rightPlayerRun[runIndex];
    } else if (running && playerDir === -1) {
      playerImageSrc = leftPlayerRun[runIndex];
    } else {
      playerImageSrc = images.player;
    }

    // ----- 11. Game over: freeze the player and show the message -----
    if (gameOver) {
      // Stop the player animation
      playerImageSrc = images.player;
      y = 0;
      vy = 0;
      onGround = true;

      // Draw the messages
      drawInfoBox(box, ctx);
      charIndex = Math.min(
        charIndex + 0.3,
        gameOverMessages[messageIndex].length + pause,
      );
      const sliced = gameOverMessages[messageIndex].slice(
        0,
        Math.floor(charIndex),
      );
      drawText(box, sliced, ctx);

      if (charIndex === gameOverMessages[messageIndex].length + pause) {
        if (messageIndex !== gameOverMessages.length - 1) {
          charIndex = 0;
          messageIndex++;
        }
      }
    }

    // ----- 12. Player and princess -----
    ctx.drawImage(playerImageSrc, playerX, h2 - playerH + y, playerW, playerH);

    ctx.drawImage(
      images.potter,
      bgX + potter.x,
      potter.y + h2,
      potter.w,
      potter.h,
    );

    // ----- 13. Check if the player reached the end -----
    if (playerX + bgX <= -3300) {
      gameOver = true;
    }

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
