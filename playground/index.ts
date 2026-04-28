const container = document.querySelector("#chart-container");
const canvas = document.createElement("canvas");
if (container) {
  container.appendChild(canvas);
}

const ctx = canvas.getContext("2d");

if (ctx) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 300, 300);
}
