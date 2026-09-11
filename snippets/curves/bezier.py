import math


def evaluate_bezier(points, t):
    """Quadratic or cubic Bezier point and derivative; 0 <= t <= 1."""
    if (len(points) not in (3, 4) or not math.isfinite(t) or not 0 <= t <= 1
            or any(len(p) != 2 or not all(math.isfinite(n) for n in p) for p in points)):
        raise ValueError("Use 3 or 4 finite 2D points and t in [0, 1].")
    degree = len(points) - 1
    row = [list(p) for p in points]
    while len(row) > 2:
        row = [[(1 - t) * p[j] + t * row[i + 1][j] for j in range(2)]
               for i, p in enumerate(row[:-1])]
    point = [(1 - t) * row[0][j] + t * row[1][j] for j in range(2)]
    derivative = [degree * (row[1][j] - row[0][j]) for j in range(2)]
    if not all(math.isfinite(n) for n in point + derivative):
        raise ValueError("Result overflow.")
    return {"point": point, "derivative": derivative}
