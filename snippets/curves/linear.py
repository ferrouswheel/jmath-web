import math


def evaluate_linear(x, a, b):
    """Return the polynomial value and its derivative at x."""
    if not all(math.isfinite(n) for n in [x, a, b]):
        raise ValueError("Use finite inputs.")
    value = a * x + b
    derivative = a
    if not all(math.isfinite(n) for n in [value, derivative]):
        raise ValueError("Result overflow.")
    return {"value": value, "derivative": derivative}
