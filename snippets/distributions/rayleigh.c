// Rayleigh: Inverse transform: take the square root of a scaled exponential waiting time.
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

double rayleigh_pdf(double x, double sigma) {
    if (!(isfinite(sigma) && sigma >= 0.1 && sigma <= 5)) return NAN;
    if (!isfinite(x)) return NAN;
    return x < 0 ? 0 : x / (sigma * sigma) * exp(-x * x / (2 * sigma * sigma));
}

double rayleigh_sample(double sigma, double (*rng)(void)) {
    if (!(isfinite(sigma) && sigma >= 0.1 && sigma <= 5)) return NAN;
    if (rng == NULL) return NAN;
    return sigma * sqrt(-2 * log1p(-rng()));
}
