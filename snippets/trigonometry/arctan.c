// Educational approximation; radians in/out. Direct angles limited to |x| <= 10000.
// Invalid input returns NAN. Compile: cc -std=c99 trig.c -lm -o trig
#include <math.h>
#include <stdio.h>
#define PI 3.141592653589793
#define MAX_ANGLE 10000

double arctangent(double x) {
    if (!isfinite(x)) return NAN;
    double sign = x < 0 ? -1 : 1;
    x = fabs(x);
    int reciprocal = x > 1;
    if (reciprocal) x = 1 / x;
    for (int k = 0; k < 2; k++) x /= 1 + sqrt(1 + x * x);
    double term = x, sum = x;
    for (int k = 1; k <= 24; k++) { term *= -x * x; sum += term / (2 * k + 1); }
    double angle = 4 * sum;
    return sign * (reciprocal ? PI / 2 - angle : angle);
}
