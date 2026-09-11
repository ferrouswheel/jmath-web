# Triangular: Invert the appropriate quadratic branch of the triangular CDF.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def triangular_pdf(x, a, c, b):
    if not (math.isfinite(a) and a >= -10 and a <= 9 and math.isfinite(c) and c >= -9.9 and c <= 9.9 and math.isfinite(b) and b >= -9 and b <= 10 and a < c and c < b):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    if x < a or x > b:
        return 0.0
    return 2 * (x - a) / ((b - a) * (c - a)) if x <= c else 2 * (b - x) / ((b - a) * (b - c))

def triangular_sample(a, c, b, rng=random.random):
    if not (math.isfinite(a) and a >= -10 and a <= 9 and math.isfinite(c) and c >= -9.9 and c <= 9.9 and math.isfinite(b) and b >= -9 and b <= 10 and a < c and c < b):
        raise ValueError("Parameters outside explorer limits")
    u = rng()
    if u < (c - a) / (b - a):
        return a + math.sqrt(u * (b - a) * (c - a))
    return b - math.sqrt((1 - u) * (b - a) * (b - c))
