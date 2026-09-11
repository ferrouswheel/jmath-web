// Laplace: Invert the two branches of the Laplace CDF using a uniform draw.
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

double laplace_pdf(double x, double mu, double scale) {
    if (!(isfinite(mu) && mu >= -10 && mu <= 10 && isfinite(scale) && scale >= 0.1 && scale <= 5)) return NAN;
    if (!isfinite(x)) return NAN;
    return exp(-fabs(x - mu) / scale) / (2 * scale);
}

double laplace_sample(double mu, double scale, double (*rng)(void)) {
    if (!(isfinite(mu) && mu >= -10 && mu <= 10 && isfinite(scale) && scale >= 0.1 && scale <= 5)) return NAN;
    if (rng == NULL) return NAN;
    double u;
    do { u = rng(); } while (u == 0); /* Avoid log(0). */
    return u < 0.5 ? mu + scale * log(2 * u) : mu - scale * log(2 * (1 - u));
}
