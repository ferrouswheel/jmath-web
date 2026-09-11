// Discrete Uniform: Scale and floor a uniform draw to choose an integer between a and b, inclusive.
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

double discrete_uniform_pmf(double x, int a, int b) {
    if (!(a >= -20 && a <= 19 && b >= -19 && b <= 20 && a <= b)) return NAN;
    if (!isfinite(x)) return NAN;
    return x == floor(x) && x >= a && x <= b ? 1.0 / (b - a + 1) : 0;
}

double discrete_uniform_sample(int a, int b, double (*rng)(void)) {
    if (!(a >= -20 && a <= 19 && b >= -19 && b <= 20 && a <= b)) return NAN;
    if (rng == NULL) return NAN;
    return a + floor((b - a + 1) * rng());
}
