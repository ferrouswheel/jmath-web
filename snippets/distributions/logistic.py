# Logistic: Apply the logit transform log(U) − log(1 − U), then shift and scale.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def logistic_pdf(x, mu, scale):
    if not (math.isfinite(mu) and mu >= -10 and mu <= 10 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    t = math.exp(-abs((x - mu) / scale))
    return t / (scale * (1 + t) ** 2)

def logistic_sample(mu, scale, rng=random.random):
    if not (math.isfinite(mu) and mu >= -10 and mu <= 10 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    u = rng()
    while u == 0:
        u = rng()
    return mu + scale * (math.log(u) - math.log1p(-u))
