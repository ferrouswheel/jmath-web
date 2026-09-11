# Discrete Uniform: Scale and floor a uniform draw to choose an integer between a and b, inclusive.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def discrete_uniform_pmf(x, a, b):
    if not (math.isfinite(a) and a >= -20 and a <= 19 and math.isfinite(b) and b >= -19 and b <= 20 and isinstance(a, int) and isinstance(b, int) and a <= b):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    return 1 / (b - a + 1) if x == math.floor(x) and a <= x <= b else 0.0

def discrete_uniform_sample(a, b, rng=random.random):
    if not (math.isfinite(a) and a >= -20 and a <= 19 and math.isfinite(b) and b >= -19 and b <= 20 and isinstance(a, int) and isinstance(b, int) and a <= b):
        raise ValueError("Parameters outside explorer limits")
    return a + math.floor((b - a + 1) * rng())
