# Laplace: Invert the two branches of the Laplace CDF using a uniform draw.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def laplace_pdf(x, mu, scale):
    if not (math.isfinite(mu) and mu >= -10 and mu <= 10 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    return math.exp(-abs(x - mu) / scale) / (2 * scale)

def laplace_sample(mu, scale, rng=random.random):
    if not (math.isfinite(mu) and mu >= -10 and mu <= 10 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    u = rng()
    while u == 0:  # Keep log arguments positive.
        u = rng()
    return mu + scale * math.log(2 * u) if u < 0.5 else mu - scale * math.log(2 * (1 - u))
