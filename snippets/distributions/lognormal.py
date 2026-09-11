# Lognormal: Exponentiate a normal value generated with the Box–Muller transform.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def lognormal_pdf(x, mu, sigma):
    if not (math.isfinite(mu) and mu >= -2 and mu <= 2 and math.isfinite(sigma) and sigma >= 0.1 and sigma <= 2):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    if x <= 0:
        return 0.0
    z = (math.log(x) - mu) / sigma
    return math.exp(-0.5 * z * z) / (x * sigma * math.sqrt(2 * math.pi))

def lognormal_sample(mu, sigma, rng=random.random):
    if not (math.isfinite(mu) and mu >= -2 and mu <= 2 and math.isfinite(sigma) and sigma >= 0.1 and sigma <= 2):
        raise ValueError("Parameters outside explorer limits")
    z = math.sqrt(-2 * math.log(1 - rng())) * math.cos(2 * math.pi * rng())
    return math.exp(mu + sigma * z)
