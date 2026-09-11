#include <math.h>
#include <stdio.h>

typedef struct { double x, y; } Point;
typedef struct { Point point, derivative; } BezierValue;

/* Return 1 on success; invalid input leaves out unchanged. */
int evaluate_bezier(const Point *points, int count, double t, BezierValue *out) {
    if (!points || !out || (count != 3 && count != 4) ||
        !isfinite(t) || t < 0 || t > 1) return 0;
    Point row[4];
    for (int i = 0; i < count; ++i) {
        if (!isfinite(points[i].x) || !isfinite(points[i].y)) return 0;
        row[i] = points[i];
    }
    for (int length = count; length > 2; --length) {
        for (int i = 0; i < length - 1; ++i) {
            row[i].x = (1 - t) * row[i].x + t * row[i + 1].x;
            row[i].y = (1 - t) * row[i].y + t * row[i + 1].y;
        }
    }
    BezierValue result = {
        { (1 - t) * row[0].x + t * row[1].x,
          (1 - t) * row[0].y + t * row[1].y },
        { (count - 1) * (row[1].x - row[0].x),
          (count - 1) * (row[1].y - row[0].y) }
    };
    if (!isfinite(result.point.x) || !isfinite(result.point.y) ||
        !isfinite(result.derivative.x) || !isfinite(result.derivative.y)) return 0;
    *out = result;
    return 1;
}
