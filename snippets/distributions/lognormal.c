// Lognormal: Exponentiate a normal value generated with the Box–Muller transform.
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

double lognormal_pdf(double x, double mu, double sigma) {
    if (!(isfinite(mu) && mu >= -2 && mu <= 2 && isfinite(sigma) && sigma >= 0.1 && sigma <= 2)) return NAN;
    if (!isfinite(x)) return NAN;
    if (x <= 0) return 0;
    double z = (log(x) - mu) / sigma;
    return exp(-0.5 * z * z) / (x * sigma * sqrt(2 * acos(-1.0)));
}

double lognormal_sample(double mu, double sigma, double (*rng)(void)) {
    if (!(isfinite(mu) && mu >= -2 && mu <= 2 && isfinite(sigma) && sigma >= 0.1 && sigma <= 2)) return NAN;
    if (rng == NULL) return NAN;
    double u = 1 - rng(), v = rng();
    double z = sqrt(-2 * log(u)) * cos(2 * acos(-1.0) * v);
    return exp(mu + sigma * z);
}
