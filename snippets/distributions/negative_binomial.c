// Negative Binomial: Sum r geometric failure counts to get the failures before r successes.
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

double negative_binomial_pmf(double x, int r, double p) {
    if (!(r >= 1 && r <= 30 && isfinite(p) && p >= 0.1 && p <= 1)) return NAN;
    if (!isfinite(x)) return NAN;
    if (x < 0 || x != floor(x)) return 0;
    if (p == 1) return x == 0 ? 1 : 0;
    double log_choose = 0;
    for (int i = 1; i < r; i++) log_choose += log((x + i) / i);
    return exp(log_choose + r * log(p) + x * log1p(-p));
}

double negative_binomial_sample(int r, double p, double (*rng)(void)) {
    if (!(r >= 1 && r <= 30 && isfinite(p) && p >= 0.1 && p <= 1)) return NAN;
    if (rng == NULL) return NAN;
    if (p == 1) return 0;
    double failures = 0;
    for (int i = 0; i < r; i++)
        failures += floor(log1p(-rng()) / log1p(-p));
    return failures;
}
