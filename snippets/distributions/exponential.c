// Exponential: Inverse transform: apply −log(1 − U) / λ to a uniform draw.
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

double exponential_pdf(double x, double rate) {
    if (!(isfinite(rate) && rate >= 0.1 && rate <= 10)) return NAN;
    if (!isfinite(x)) return NAN;
    return x < 0 ? 0 : rate * exp(-rate * x);
}

double exponential_sample(double rate, double (*rng)(void)) {
    if (!(isfinite(rate) && rate >= 0.1 && rate <= 10)) return NAN;
    if (rng == NULL) return NAN;
    return -log1p(-rng()) / rate;
}
