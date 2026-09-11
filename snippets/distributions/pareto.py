# Pareto: Inverse transform: raise 1 − U to a negative power and multiply by the minimum.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def pareto_pdf(x, minimum, alpha):
    if not (math.isfinite(minimum) and minimum >= 0.1 and minimum <= 5 and math.isfinite(alpha) and alpha >= 0.5 and alpha <= 10):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    return 0.0 if x < minimum else alpha / minimum * (minimum / x) ** (alpha + 1)

def pareto_sample(minimum, alpha, rng=random.random):
    if not (math.isfinite(minimum) and minimum >= 0.1 and minimum <= 5 and math.isfinite(alpha) and alpha >= 0.5 and alpha <= 10):
        raise ValueError("Parameters outside explorer limits")
    return minimum / (1 - rng()) ** (1 / alpha)
