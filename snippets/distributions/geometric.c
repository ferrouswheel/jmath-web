// Geometric: Invert the geometric CDF to count failures before the first success (starting at zero).
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

double geometric_pmf(double x, double p) {
    if (!(isfinite(p) && p >= 0.05 && p <= 1)) return NAN;
    if (!isfinite(x)) return NAN;
    if (x < 0 || x != floor(x)) return 0;
    if (p == 1) return x == 0 ? 1 : 0;
    return p * exp(x * log1p(-p));
}

double geometric_sample(double p, double (*rng)(void)) {
    if (!(isfinite(p) && p >= 0.05 && p <= 1)) return NAN;
    if (rng == NULL) return NAN;
    if (p == 1) return 0;
    return floor(log1p(-rng()) / log1p(-p));
}
