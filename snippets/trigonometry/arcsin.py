# Educational approximation; radians in/out. Direct angles limited to |x| <= 10000.
import math  # sqrt, fmod, isfinite only; no trigonometric calls
PI = 3.141592653589793
MAX_ANGLE = 10000

def arctangent(x):
    if not math.isfinite(x):
        raise ValueError("Input must be finite")
    sign = -1 if x < 0 else 1
    x = abs(x)
    reciprocal = x > 1
    if reciprocal: x = 1 / x
    for _ in range(2): x /= 1 + math.sqrt(1 + x * x)
    term = total = x
    for k in range(1, 25):
        term *= -x * x
        total += term / (2 * k + 1)
    angle = 4 * total
    return sign * (PI / 2 - angle if reciprocal else angle)

def arcsine(x):
    if not math.isfinite(x) or abs(x) > 1:
        raise ValueError("Arcsine requires -1 <= x <= 1")
    if abs(x) == 1: return x * PI / 2
    return arctangent(x / math.sqrt((1 - x) * (1 + x)))
