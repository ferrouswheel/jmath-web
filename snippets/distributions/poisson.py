# Poisson: Product method: multiply uniform draws until the product falls below exp(−λ).
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def poisson_pmf(x, rate):
    if not (math.isfinite(rate) and rate >= 0.1 and rate <= 50):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    if x < 0 or x != math.floor(x):
        return 0.0
    log_factorial = 0.0
    for i in range(2, int(x) + 1):
        log_factorial += math.log(i)
    return math.exp(x * math.log(rate) - rate - log_factorial)

def poisson_sample(rate, rng=random.random):
    if not (math.isfinite(rate) and rate >= 0.1 and rate <= 50):
        raise ValueError("Parameters outside explorer limits")
    limit = math.exp(-rate)
    product, k = 1.0, 0
    while True:
        k += 1
        product *= 1 - rng()
        if product <= limit:
            return k - 1
