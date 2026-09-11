// Triangular: Invert the appropriate quadratic branch of the triangular CDF.
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

double triangular_pdf(double x, double a, double c, double b) {
    if (!(isfinite(a) && a >= -10 && a <= 9 && isfinite(c) && c >= -9.9 && c <= 9.9 && isfinite(b) && b >= -9 && b <= 10 && a < c && c < b)) return NAN;
    if (!isfinite(x)) return NAN;
    if (x < a || x > b) return 0;
    return x <= c ? 2 * (x - a) / ((b - a) * (c - a)) : 2 * (b - x) / ((b - a) * (b - c));
}

double triangular_sample(double a, double c, double b, double (*rng)(void)) {
    if (!(isfinite(a) && a >= -10 && a <= 9 && isfinite(c) && c >= -9.9 && c <= 9.9 && isfinite(b) && b >= -9 && b <= 10 && a < c && c < b)) return NAN;
    if (rng == NULL) return NAN;
    double u = rng();
    return u < (c - a) / (b - a)
        ? a + sqrt(u * (b - a) * (c - a))
        : b - sqrt((1 - u) * (b - a) * (b - c));
}
