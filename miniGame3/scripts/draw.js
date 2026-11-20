// Draw info box for the gameOver
export const drawInfoBox = (box, ctx) => {


  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 16); // last number = corner radius
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "black";
  ctx.stroke();
};

// Draw text
export const drawText = (box, text, ctx) => {
  ctx.fillStyle = "black"; // the box code left it white
  ctx.font = "20px monospace"; // size + font family (monospace is the fallback)
  ctx.textBaseline = "top"; // y = top of the text instead of the baseline
  ctx.fillText(text, box.x + 20, box.y + 20);
};
