// Quadratic (3 points) or cubic (4 points), with 0 <= t <= 1.
function evaluate_bezier(points, t) {
  if (!Array.isArray(points) || ![3, 4].includes(points.length) ||
      !Number.isFinite(t) || t < 0 || t > 1 ||
      points.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) {
    throw new RangeError("Use 3 or 4 finite 2D points and t in [0, 1].");
  }
  const degree = points.length - 1;
  let row = points.map(p => [...p]);
  while (row.length > 2) {
    row = row.slice(0, -1).map((p, i) => [
      (1 - t) * p[0] + t * row[i + 1][0],
      (1 - t) * p[1] + t * row[i + 1][1]
    ]);
  }
  const point = [(1 - t) * row[0][0] + t * row[1][0],
                 (1 - t) * row[0][1] + t * row[1][1]];
  const derivative = [degree * (row[1][0] - row[0][0]),
                      degree * (row[1][1] - row[0][1])];
  if (![...point, ...derivative].every(Number.isFinite)) throw new RangeError("Result overflow.");
  return { point, derivative };
}
