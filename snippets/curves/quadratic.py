import math


def evaluate_quadratic(x, a, b, c):
    """Return the polynomial value and its derivative at x."""
    if not all(math.isfinite(n) for n in [x, a, b, c]):
        raise ValueError("Use finite inputs.")
    value = (a * x + b) * x + c
    derivative = 2 * a * x + b
    if not all(math.isfinite(n) for n in [value, derivative]):
        raise ValueError("Result overflow.")
    return {"value": value, "derivative": derivative}
