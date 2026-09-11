// Cauchy: Apply the tangent quantile transform. The population mean and variance are undefined.
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

double cauchy_pdf(double x, double center, double scale) {
    if (!(isfinite(center) && center >= -10 && center <= 10 && isfinite(scale) && scale >= 0.1 && scale <= 5)) return NAN;
    if (!isfinite(x)) return NAN;
    double z = (x - center) / scale;
    return 1 / (acos(-1.0) * scale * (1 + z * z));
}

double cauchy_sample(double center, double scale, double (*rng)(void)) {
    if (!(isfinite(center) && center >= -10 && center <= 10 && isfinite(scale) && scale >= 0.1 && scale <= 5)) return NAN;
    if (rng == NULL) return NAN;
    double u;
    do { u = rng(); } while (u == 0);
    return center + scale * tan(acos(-1.0) * (u - 0.5));
}
