#include <math.h>
#include <stdio.h>

typedef struct { double value, derivative; } CurveValue;

/* Return 1 on success; invalid input leaves out unchanged. */
int evaluate_quadratic(double x, double a, double b, double c, CurveValue *out) {
    if (!out || !isfinite(x) || !isfinite(a) || !isfinite(b) || !isfinite(c)) return 0;
    CurveValue result = { (a * x + b) * x + c, 2 * a * x + b };
    if (!isfinite(result.value) || !isfinite(result.derivative)) return 0;
    *out = result;
    return 1;
}
