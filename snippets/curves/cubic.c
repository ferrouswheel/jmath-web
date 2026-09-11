#include <math.h>
#include <stdio.h>

typedef struct { double value, derivative; } CurveValue;

/* Return 1 on success; invalid input leaves out unchanged. */
int evaluate_cubic(double x, double a, double b, double c, double d, CurveValue *out) {
    if (!out || !isfinite(x) || !isfinite(a) || !isfinite(b) || !isfinite(c) || !isfinite(d)) return 0;
    CurveValue result = { ((a * x + b) * x + c) * x + d, (3 * a * x + 2 * b) * x + c };
    if (!isfinite(result.value) || !isfinite(result.derivative)) return 0;
    *out = result;
    return 1;
}
