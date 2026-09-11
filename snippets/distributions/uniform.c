// Uniform: Affine transform: stretch a uniform draw to the interval [a, b).
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.
// Invalid arguments return NAN. Compile: cc -std=c99 snippet.c -lm -o snippet

#include <math.h>
#include <stdlib.h>
#include <stdio.h>

// Basic uniform source. You may supply a different RNG to the sampler.
double uniform01(void) {
    return rand() / (RAND_MAX + 1.0);
}

double uniform_pdf(double x, double a, double b) {
    if (!(isfinite(a) && a >= -10 && a <= 9 && isfinite(b) && b >= -9 && b <= 10 && a < b)) return NAN;
    if (!isfinite(x)) return NAN;
    return x < a || x > b ? 0 : 1 / (b - a);
}

double uniform_sample(double a, double b, double (*rng)(void)) {
    if (!(isfinite(a) && a >= -10 && a <= 9 && isfinite(b) && b >= -9 && b <= 10 && a < b)) return NAN;
    if (rng == NULL) return NAN;
    return a + (b - a) * rng();
}
