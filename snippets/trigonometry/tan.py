# Educational approximation; radians in/out. Direct angles limited to |x| <= 10000.
import math  # sqrt, fmod, isfinite only; no trigonometric calls
PI = 3.141592653589793
MAX_ANGLE = 10000

def sine(x):
    if not math.isfinite(x) or abs(x) > MAX_ANGLE:
        raise ValueError("Angle outside supported range")
    x = math.fmod(x, 2 * PI)
    if x > PI: x -= 2 * PI
    if x < -PI: x += 2 * PI
    if x > PI / 2: x = PI - x
    if x < -PI / 2: x = -PI - x
    term = total = x
    for k in range(1, 17):
        term *= -x * x / ((2 * k) * (2 * k + 1))
        total += term
    return total

def cosine(x):
    if not math.isfinite(x) or abs(x) > MAX_ANGLE:
        raise ValueError("Angle outside supported range")
    x = math.fmod(x, 2 * PI)
    if x > PI: x -= 2 * PI
    if x < -PI: x += 2 * PI
    sign = 1
    if x > PI / 2: x, sign = PI - x, -1
    if x < -PI / 2: x, sign = -PI - x, -1
    term = total = 1.0
    for k in range(1, 17):
        term *= -x * x / ((2 * k - 1) * (2 * k))
        total += term
    return sign * total

def tangent(x):
    c = cosine(x)
    if abs(c) < 1e-12:
        raise ValueError("At or numerically too close to a tangent pole")
    return sine(x) / c
