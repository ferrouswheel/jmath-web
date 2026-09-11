# Rayleigh: Inverse transform: take the square root of a scaled exponential waiting time.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def rayleigh_pdf(x, sigma):
    if not (math.isfinite(sigma) and sigma >= 0.1 and sigma <= 5):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    return 0.0 if x < 0 else x / (sigma * sigma) * math.exp(-x * x / (2 * sigma * sigma))

def rayleigh_sample(sigma, rng=random.random):
    if not (math.isfinite(sigma) and sigma >= 0.1 and sigma <= 5):
        raise ValueError("Parameters outside explorer limits")
    return sigma * math.sqrt(-2 * math.log1p(-rng()))
