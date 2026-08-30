export function drawSmoothClosedCurve(ctx, points) {
  if (points.length < 3) return;
  ctx.beginPath();
  const len = points.length;
  const firstMidX = (points[0].x + points[1].x) / 2;
  const firstMidY = (points[0].y + points[1].y) / 2;
  ctx.moveTo(firstMidX, firstMidY);

  for (let i = 1; i < len; i++) {
    const nextIdx = (i + 1) % len;
    const midX = (points[i].x + points[nextIdx].x) / 2;
    const midY = (points[i].y + points[nextIdx].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  ctx.quadraticCurveTo(points[0].x, points[0].y, firstMidX, firstMidY);
  ctx.closePath();
}
