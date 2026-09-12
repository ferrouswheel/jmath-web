import derivativeSource from './easing-derivatives.js?raw';
export const jsDerivatives = derivativeSource
  .replace(
    /\/\*\*[\s\S]*?\*\//,
    `// Derivatives with respect to normalized time t.
// null: undefined; Infinity: unbounded. Endpoints use inside limits.`,
  )
  .replace('export function', 'function');
export const pyDerivatives = `def ease_derivatives(family, direction, t):
    # Normalized-time derivatives. None: undefined; inf: unbounded.
    # Endpoint derivatives use limits from inside [0, 1].
    if not math.isfinite(t) or not 0 <= t <= 1:
        raise ValueError("t must be between 0 and 1")
    u = t if direction == 'in' else 1-t if direction == 'out' else 2*t if t < 0.5 else 2-2*t
    power = {'quadratic': 2, 'cubic': 3, 'quartic': 4, 'quintic': 5}.get(family)
    if power:
        v = power * u ** (power-1)
        a = power * (power-1) * u ** (power-2)
    elif family == 'linear':
        v, a = 1, 0
    elif family == 'sine':
        v = math.pi/2 * math.sin(math.pi*u/2)
        a = math.pi**2/4 * math.cos(math.pi*u/2)
    elif family == 'exponential':
        if u == 0:
            return None, None  # Endpoint jump.
        k = 10 * math.log(2)
        v = k * 2**(10*u-10)
        a = k * v
    elif family == 'circular':
        v = math.inf if u == 1 else u / math.sqrt(1-u*u)
        a = math.inf if u == 1 else (1-u*u)**-1.5
    elif family == 'back':
        v = 8.10474*u*u - 3.40316*u
        a = 16.20948*u - 3.40316
    elif family == 'elastic':
        if u == 0:
            return None, None  # Endpoint jump.
        k, w = 10*math.log(2), 20*math.pi/3
        phase = (10*u-10.75)*2*math.pi/3
        amplitude = 2**(10*u-10)
        v = -amplitude * (k*math.sin(phase) + w*math.cos(phase))
        a = -amplitude * ((k*k-w*w)*math.sin(phase) + 2*k*w*math.cos(phase))
    elif family == 'bounce':
        q, d = 1-u, 2.75
        if any(abs(q-b) < 1e-12 for b in [1/d, 2/d, 2.5/d]):
            return None, None  # Rebound corner.
        offset = 0 if q < 1/d else 1.5/d if q < 2/d else 2.25/d if q < 2.5/d else 2.625/d
        v, a = 15.125*(q-offset), -15.125
    else:
        raise ValueError("Unknown easing family")
    if direction == 'in-out' and t == 0.5:
        return v, 0 if abs(a) < 1e-12 else None
    factor = 1 if direction == 'in' else -1 if direction == 'out' else 2 if t < 0.5 else -2
    return v, factor*a
`;
