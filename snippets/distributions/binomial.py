# Binomial: Bernoulli trials: make n independent draws and count those below p.
# Parameter limits match the explorer; finite x is required.
# The RNG must return independent uniform values in [0, 1).
# Standard-library math and uniform RNG only; no distribution libraries.

import math
import random

def binomial_pmf(x, n, p):
    if not (math.isfinite(n) and n >= 1 and n <= 100 and math.isfinite(p) and p >= 0 and p <= 1 and isinstance(n, int)):
        raise ValueError("Parameters outside explorer limits")
    if not math.isfinite(x):
        raise ValueError("x must be finite")
    if x < 0 or x > n or x != math.floor(x):
        return 0.0
    if p == 0:
        return 1.0 if x == 0 else 0.0
    if p == 1:
        return 1.0 if x == n else 0.0
    # Compute log(C(n, x)) to avoid large factorials.
    k = min(int(x), n - int(x))
    log_choose = 0.0
    for i in range(1, k + 1):
        log_choose += math.log((n - i + 1) / i)
    return math.exp(log_choose + x * math.log(p) + (n - x) * math.log1p(-p))

def binomial_sample(n, p, rng=random.random):
    if not (math.isfinite(n) and n >= 1 and n <= 100 and math.isfinite(p) and p >= 0 and p <= 1 and isinstance(n, int)):
        raise ValueError("Parameters outside explorer limits")
    successes = 0
    for _ in range(n):
        if rng() < p:
            successes += 1
    return successes
