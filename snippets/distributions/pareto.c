// Pareto: Inverse transform: raise 1 − U to a negative power and multiply by the minimum.
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

double pareto_pdf(double x, double minimum, double alpha) {
    if (!(isfinite(minimum) && minimum >= 0.1 && minimum <= 5 && isfinite(alpha) && alpha >= 0.5 && alpha <= 10)) return NAN;
    if (!isfinite(x)) return NAN;
    return x < minimum ? 0 : alpha / minimum * pow(minimum / x, alpha + 1);
}

double pareto_sample(double minimum, double alpha, double (*rng)(void)) {
    if (!(isfinite(minimum) && minimum >= 0.1 && minimum <= 5 && isfinite(alpha) && alpha >= 0.5 && alpha <= 10)) return NAN;
    if (rng == NULL) return NAN;
    return minimum / pow(1 - rng(), 1 / alpha);
}
