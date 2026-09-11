# Bernoulli: Threshold a uniform draw at p to produce a zero or one.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def bernoulli_pmf(x, p):
    if not (math.isfinite(p) and p >= 0 and p <= 1):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    return 1 - p if x == 0 else p if x == 1 else 0.0

def bernoulli_sample(p, rng=random.random):
    if not (math.isfinite(p) and p >= 0 and p <= 1):
        raise ValueError("Parameters outside explorer limits")
    return 1 if rng() < p else 0
