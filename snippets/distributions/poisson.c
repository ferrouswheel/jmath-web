// Poisson: Product method: multiply uniform draws until the product falls below exp(−λ).
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

double poisson_pmf(double x, double rate) {
    if (!(isfinite(rate) && rate >= 0.1 && rate <= 50)) return NAN;
    if (!isfinite(x)) return NAN;
    if (x < 0 || x != floor(x)) return 0;
    double log_factorial = 0;
    for (double i = 2; i <= x; i++) log_factorial += log(i);
    return exp(x * log(rate) - rate - log_factorial);
}

double poisson_sample(double rate, double (*rng)(void)) {
    if (!(isfinite(rate) && rate >= 0.1 && rate <= 50)) return NAN;
    if (rng == NULL) return NAN;
    double limit = exp(-rate), product = 1;
    int k = 0;
    do {
        k++;
        product *= 1 - rng();
    } while (product > limit);
    return k - 1;
}
