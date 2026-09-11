# Uniform: Affine transform: stretch a uniform draw to the interval [a, b).
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def uniform_pdf(x, a, b):
    if not (math.isfinite(a) and a >= -10 and a <= 9 and math.isfinite(b) and b >= -9 and b <= 10 and a < b):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    return 0.0 if x < a or x > b else 1 / (b - a)

def uniform_sample(a, b, rng=random.random):
    if not (math.isfinite(a) and a >= -10 and a <= 9 and math.isfinite(b) and b >= -9 and b <= 10 and a < b):
        raise ValueError("Parameters outside explorer limits")
    return a + (b - a) * rng()
