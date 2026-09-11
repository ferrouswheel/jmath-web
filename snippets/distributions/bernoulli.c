// Bernoulli: Threshold a uniform draw at p to produce a zero or one.
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

double bernoulli_pmf(double x, double p) {
    if (!(isfinite(p) && p >= 0 && p <= 1)) return NAN;
    if (!isfinite(x)) return NAN;
    return x == 0 ? 1 - p : x == 1 ? p : 0;
}

double bernoulli_sample(double p, double (*rng)(void)) {
    if (!(isfinite(p) && p >= 0 && p <= 1)) return NAN;
    if (rng == NULL) return NAN;
    return rng() < p ? 1 : 0;
}
