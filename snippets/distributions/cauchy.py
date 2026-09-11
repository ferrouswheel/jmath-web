# Cauchy: Apply the tangent quantile transform. The population mean and variance are undefined.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def cauchy_pdf(x, center, scale):
    if not (math.isfinite(center) and center >= -10 and center <= 10 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    z = (x - center) / scale
    return 1 / (math.pi * scale * (1 + z * z))

def cauchy_sample(center, scale, rng=random.random):
    if not (math.isfinite(center) and center >= -10 and center <= 10 and math.isfinite(scale) and scale >= 0.1 and scale <= 5):
        raise ValueError("Parameters outside explorer limits")
    u = rng()
    while u == 0:  # Quantile endpoints are infinite.
        u = rng()
    return center + scale * math.tan(math.pi * (u - 0.5))
