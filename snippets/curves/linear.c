#include <math.h>
#include <stdio.h>

typedef struct { double value, derivative; } CurveValue;

/* Return 1 on success; invalid input leaves out unchanged. */
int evaluate_linear(double x, double a, double b, CurveValue *out) {
    if (!out || !isfinite(x) || !isfinite(a) || !isfinite(b)) return 0;
    CurveValue result = { a * x + b, a };
    if (!isfinite(result.value) || !isfinite(result.derivative)) return 0;
    *out = result;
    return 1;
}
