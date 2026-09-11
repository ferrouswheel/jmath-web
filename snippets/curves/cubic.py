import math


def evaluate_cubic(x, a, b, c, d):
    """Return the polynomial value and its derivative at x."""
    if not all(math.isfinite(n) for n in [x, a, b, c, d]):
        raise ValueError("Use finite inputs.")
    value = ((a * x + b) * x + c) * x + d
    derivative = (3 * a * x + 2 * b) * x + c
    if not all(math.isfinite(n) for n in [value, derivative]):
        raise ValueError("Result overflow.")
    return {"value": value, "derivative": derivative}
