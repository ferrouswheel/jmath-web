// Binomial: Bernoulli trials: make n independent draws and count those below p.
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

double binomial_pmf(double x, int n, double p) {
    if (!(n >= 1 && n <= 100 && isfinite(p) && p >= 0 && p <= 1)) return NAN;
    if (!isfinite(x)) return NAN;
    if (x < 0 || x > n || x != floor(x)) return 0;
    if (p == 0) return x == 0 ? 1 : 0;
    if (p == 1) return x == n ? 1 : 0;
    /* Compute log(C(n, x)) to avoid large factorials. */
    int k = (int)fmin(x, n - x);
    double log_choose = 0;
    for (int i = 1; i <= k; i++) log_choose += log((n - i + 1.0) / i);
    return exp(log_choose + x * log(p) + (n - x) * log1p(-p));
}

double binomial_sample(int n, double p, double (*rng)(void)) {
    if (!(n >= 1 && n <= 100 && isfinite(p) && p >= 0 && p <= 1)) return NAN;
    if (rng == NULL) return NAN;
    int successes = 0;
    for (int i = 0; i < n; i++) {
        if (rng() < p) successes++;
    }
    return successes;
}
