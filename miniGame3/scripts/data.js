const CRATE_SIZE = 80;

// Objects
export const obstacles = [
  { x: 4 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 5 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 5 * CRATE_SIZE, y: -(CRATE_SIZE * 2), w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 8.5 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 8.5 * CRATE_SIZE, y: -(CRATE_SIZE * 2), w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 9.5 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 15 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 16 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 16 * CRATE_SIZE, y: -(CRATE_SIZE * 2), w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 17 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 17 * CRATE_SIZE, y: -(CRATE_SIZE * 2), w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 17 * CRATE_SIZE, y: -(CRATE_SIZE * 3), w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 23 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 24 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 24 * CRATE_SIZE, y: -(CRATE_SIZE * 2), w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 28 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 29 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 29 * CRATE_SIZE, y: -(CRATE_SIZE * 2), w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 40 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
];

// Spikes
export const spikes = [
  { x: 6.25 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 7.25 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 18 * CRATE_SIZE, y: -CRATE_SIZE, w: CRATE_SIZE, h: CRATE_SIZE },
];

// Chips
export let chips = [
  { x: 6.75 * CRATE_SIZE, y: -CRATE_SIZE * 4, w: CRATE_SIZE, h: CRATE_SIZE },
  { x: 19 * CRATE_SIZE, y: -CRATE_SIZE * 5, w: CRATE_SIZE, h: CRATE_SIZE },
];

// Sugar Cubes
export let cubes = [
  {
    x: 25 * CRATE_SIZE,
    y: -CRATE_SIZE,
    w: CRATE_SIZE,
    h: CRATE_SIZE,
    dir: 1,
  },
  {
    x: 30 * CRATE_SIZE,
    y: -CRATE_SIZE,
    w: CRATE_SIZE,
    h: CRATE_SIZE,
    dir: 1,
  },
];

// Jasiu Potter
export const potter = {
  x: 50 * CRATE_SIZE,
  y: -CRATE_SIZE * 1.5,
  w: CRATE_SIZE * 1.5,
  h: CRATE_SIZE * 1.5,
};

// Game Over Messages
export const gameOverMessages = [
  "Yay, I'm super hungry",
  "How many chips did you bring ?",
  "Thank you so much :)"
]


