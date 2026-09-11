# Exponential: Inverse transform: apply −log(1 − U) / λ to a uniform draw.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def exponential_pdf(x, rate):
    if not (math.isfinite(rate) and rate >= 0.1 and rate <= 10):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    return 0.0 if x < 0 else rate * math.exp(-rate * x)

def exponential_sample(rate, rng=random.random):
    if not (math.isfinite(rate) and rate >= 0.1 and rate <= 10):
        raise ValueError("Parameters outside explorer limits")
    return -math.log1p(-rng()) / rate
