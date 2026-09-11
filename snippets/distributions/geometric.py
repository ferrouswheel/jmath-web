# Geometric: Invert the geometric CDF to count failures before the first success (starting at zero).
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def geometric_pmf(x, p):
    if not (math.isfinite(p) and p >= 0.05 and p <= 1):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    if x < 0 or x != math.floor(x):
        return 0.0
    if p == 1:
        return 1.0 if x == 0 else 0.0
    return p * math.exp(x * math.log1p(-p))

def geometric_sample(p, rng=random.random):
    if not (math.isfinite(p) and p >= 0.05 and p <= 1):
        raise ValueError("Parameters outside explorer limits")
    if p == 1:
        return 0
    return math.floor(math.log1p(-rng()) / math.log1p(-p))
