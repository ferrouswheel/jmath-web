# Negative Binomial: Sum r geometric failure counts to get the failures before r successes.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def negative_binomial_pmf(x, r, p):
    if not (math.isfinite(r) and r >= 1 and r <= 30 and math.isfinite(p) and p >= 0.1 and p <= 1 and isinstance(r, int)):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    if x < 0 or x != math.floor(x):
        return 0.0
    if p == 1:
        return 1.0 if x == 0 else 0.0
    log_choose = 0.0
    for i in range(1, r):
        log_choose += math.log((x + i) / i)
    return math.exp(log_choose + r * math.log(p) + x * math.log1p(-p))

def negative_binomial_sample(r, p, rng=random.random):
    if not (math.isfinite(r) and r >= 1 and r <= 30 and math.isfinite(p) and p >= 0.1 and p <= 1 and isinstance(r, int)):
        raise ValueError("Parameters outside explorer limits")
    if p == 1:
        return 0
    failures = 0
    for _ in range(r):
        failures += math.floor(math.log1p(-rng()) / math.log1p(-p))
    return failures
