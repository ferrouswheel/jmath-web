// Weibull: Inverse transform: scale a power of an exponential waiting time.
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

double weibull_pdf(double x, double shape, double scale) {
    if (!(isfinite(shape) && shape >= 0.5 && shape <= 5 && isfinite(scale) && scale >= 0.1 && scale <= 5)) return NAN;
    if (!isfinite(x)) return NAN;
    if (x < 0) return 0;
    if (x == 0) return shape < 1 ? INFINITY : shape == 1 ? 1 / scale : 0;
    return (shape / scale) * pow(x / scale, shape - 1) * exp(-pow(x / scale, shape));
}

double weibull_sample(double shape, double scale, double (*rng)(void)) {
    if (!(isfinite(shape) && shape >= 0.5 && shape <= 5 && isfinite(scale) && scale >= 0.1 && scale <= 5)) return NAN;
    if (rng == NULL) return NAN;
    return scale * pow(-log1p(-rng()), 1 / shape);
}
