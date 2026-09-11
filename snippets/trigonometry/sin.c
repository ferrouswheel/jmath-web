// Educational approximation; radians in/out. Direct angles limited to |x| <= 10000.
// Invalid input returns NAN. Compile: cc -std=c99 trig.c -lm -o trig
#include <math.h>
#include <stdio.h>
#define PI 3.141592653589793
#define MAX_ANGLE 10000

double sine(double x) {
    if (!isfinite(x) || fabs(x) > MAX_ANGLE) return NAN;
    x = fmod(x, 2 * PI);
    if (x > PI) x -= 2 * PI;
    if (x < -PI) x += 2 * PI;
    if (x > PI / 2) x = PI - x;
    if (x < -PI / 2) x = -PI - x;
    double term = x, sum = x;
    for (int k = 1; k <= 16; k++) {
        term *= -x * x / ((2 * k) * (2 * k + 1));
        sum += term;
    }
    return sum;
}
