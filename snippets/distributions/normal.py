# Normal: Box–Muller transform: turn two independent uniform draws into a normal sample.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def normal_pdf(x, mu, sigma):
    if not (math.isfinite(mu) and mu >= -10 and mu <= 10 and math.isfinite(sigma) and sigma >= 0.1 and sigma <= 5):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    z = (x - mu) / sigma
    return math.exp(-0.5 * z * z) / (sigma * math.sqrt(2 * math.pi))

def normal_sample(mu, sigma, rng=random.random):
    if not (math.isfinite(mu) and mu >= -10 and mu <= 10 and math.isfinite(sigma) and sigma >= 0.1 and sigma <= 5):
        raise ValueError("Parameters outside explorer limits")
    u = 1 - rng()  # (0, 1], so log never receives zero.
    v = rng()
    return mu + sigma * math.sqrt(-2 * math.log(u)) * math.cos(2 * math.pi * v)
