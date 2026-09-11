# Weibull: Inverse transform: scale a power of an exponential waiting time.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def weibull_pdf(x, shape, scale):
    if not (math.isfinite(shape) and shape >= 0.5 and shape <= 5 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    if x < 0:
        return 0.0
    if x == 0:
        return math.inf if shape < 1 else 1 / scale if shape == 1 else 0.0
    return (shape / scale) * (x / scale) ** (shape - 1) * math.exp(-(x / scale) ** shape)

def weibull_sample(shape, scale, rng=random.random):
    if not (math.isfinite(shape) and shape >= 0.5 and shape <= 5 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    return scale * (-math.log1p(-rng())) ** (1 / shape)
