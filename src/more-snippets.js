export const moreAlgorithms = {
  bernoulli:'Threshold a uniform draw at p to produce a zero or one.',
  geometric:'Invert the geometric CDF to count failures before the first success (starting at zero).',
  negative_binomial:'Sum r geometric failure counts to get the failures before r successes.',
  discrete_uniform:'Scale and floor a uniform draw to choose an integer between a and b, inclusive.',
  lognormal:'Exponentiate a normal value generated with the Box–Muller transform.',
  laplace:'Invert the two branches of the Laplace CDF using a uniform draw.',
  logistic:'Apply the logit transform log(U) − log(1 − U), then shift and scale.',
  cauchy:'Apply the tangent quantile transform. The population mean and variance are undefined.',
  weibull:'Inverse transform: scale a power of an exponential waiting time.',
  rayleigh:'Inverse transform: take the square root of a scaled exponential waiting time.',
  pareto:'Inverse transform: raise 1 − U to a negative power and multiply by the minimum.',
  triangular:'Invert the appropriate quadratic branch of the triangular CDF.',
};
export const moreBodies = {
  bernoulli: {
    js:['return x === 0 ? 1 - p : x === 1 ? p : 0;', 'return rng() < p ? 1 : 0;'],
    python:['return 1 - p if x == 0 else p if x == 1 else 0.0', 'return 1 if rng() < p else 0'],
    c:['return x == 0 ? 1 - p : x == 1 ? p : 0;', 'return rng() < p ? 1 : 0;'],
  },
  geometric: {
    js:['if (!Number.isInteger(x) || x < 0) return 0;\nif (p === 1) return x === 0 ? 1 : 0;\nreturn p * Math.exp(x * Math.log1p(-p));','if (p === 1) return 0;\nreturn Math.floor(Math.log1p(-rng()) / Math.log1p(-p));'],
    python:['if x < 0 or x != math.floor(x):\n    return 0.0\nif p == 1:\n    return 1.0 if x == 0 else 0.0\nreturn p * math.exp(x * math.log1p(-p))','if p == 1:\n    return 0\nreturn math.floor(math.log1p(-rng()) / math.log1p(-p))'],
    c:['if (x < 0 || x != floor(x)) return 0;\nif (p == 1) return x == 0 ? 1 : 0;\nreturn p * exp(x * log1p(-p));','if (p == 1) return 0;\nreturn floor(log1p(-rng()) / log1p(-p));'],
  },
  negative_binomial: {
    js:['if (!Number.isInteger(x) || x < 0) return 0;\nif (p === 1) return x === 0 ? 1 : 0;\nlet logChoose = 0;\nfor (let i = 1; i < r; i++) logChoose += Math.log((x + i) / i);\nreturn Math.exp(logChoose + r * Math.log(p) + x * Math.log1p(-p));','if (p === 1) return 0;\nlet failures = 0;\nfor (let i = 0; i < r; i++)\n  failures += Math.floor(Math.log1p(-rng()) / Math.log1p(-p));\nreturn failures;'],
    python:['if x < 0 or x != math.floor(x):\n    return 0.0\nif p == 1:\n    return 1.0 if x == 0 else 0.0\nlog_choose = 0.0\nfor i in range(1, r):\n    log_choose += math.log((x + i) / i)\nreturn math.exp(log_choose + r * math.log(p) + x * math.log1p(-p))','if p == 1:\n    return 0\nfailures = 0\nfor _ in range(r):\n    failures += math.floor(math.log1p(-rng()) / math.log1p(-p))\nreturn failures'],
    c:['if (x < 0 || x != floor(x)) return 0;\nif (p == 1) return x == 0 ? 1 : 0;\ndouble log_choose = 0;\nfor (int i = 1; i < r; i++) log_choose += log((x + i) / i);\nreturn exp(log_choose + r * log(p) + x * log1p(-p));','if (p == 1) return 0;\ndouble failures = 0;\nfor (int i = 0; i < r; i++)\n    failures += floor(log1p(-rng()) / log1p(-p));\nreturn failures;'],
  },
  discrete_uniform: {
    js:['return Number.isInteger(x) && x >= a && x <= b ? 1 / (b - a + 1) : 0;', 'return a + Math.floor((b - a + 1) * rng());'],
    python:['return 1 / (b - a + 1) if x == math.floor(x) and a <= x <= b else 0.0', 'return a + math.floor((b - a + 1) * rng())'],
    c:['return x == floor(x) && x >= a && x <= b ? 1.0 / (b - a + 1) : 0;', 'return a + floor((b - a + 1) * rng());'],
  },
  lognormal: {
    js:['if (x <= 0) return 0;\nconst z = (Math.log(x) - mu) / sigma;\nreturn Math.exp(-0.5 * z * z) / (x * sigma * Math.sqrt(2 * Math.PI));','const z = Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());\nreturn Math.exp(mu + sigma * z);'],
    python:['if x <= 0:\n    return 0.0\nz = (math.log(x) - mu) / sigma\nreturn math.exp(-0.5 * z * z) / (x * sigma * math.sqrt(2 * math.pi))','z = math.sqrt(-2 * math.log(1 - rng())) * math.cos(2 * math.pi * rng())\nreturn math.exp(mu + sigma * z)'],
    c:['if (x <= 0) return 0;\ndouble z = (log(x) - mu) / sigma;\nreturn exp(-0.5 * z * z) / (x * sigma * sqrt(2 * acos(-1.0)));','double u = 1 - rng(), v = rng();\ndouble z = sqrt(-2 * log(u)) * cos(2 * acos(-1.0) * v);\nreturn exp(mu + sigma * z);'],
  },
  laplace: {
    js:['return Math.exp(-Math.abs(x - mu) / scale) / (2 * scale);','let u;\ndo { u = rng(); } while (u === 0); // Keep log arguments positive.\nreturn u < 0.5 ? mu + scale * Math.log(2 * u) : mu - scale * Math.log(2 * (1 - u));'],
    python:['return math.exp(-abs(x - mu) / scale) / (2 * scale)','u = rng()\nwhile u == 0:  # Keep log arguments positive.\n    u = rng()\nreturn mu + scale * math.log(2 * u) if u < 0.5 else mu - scale * math.log(2 * (1 - u))'],
    c:['return exp(-fabs(x - mu) / scale) / (2 * scale);','double u;\ndo { u = rng(); } while (u == 0); /* Avoid log(0). */\nreturn u < 0.5 ? mu + scale * log(2 * u) : mu - scale * log(2 * (1 - u));'],
  },
  logistic: {
    js:['const t = Math.exp(-Math.abs((x - mu) / scale));\nreturn t / (scale * (1 + t) ** 2);','let u;\ndo { u = rng(); } while (u === 0);\nreturn mu + scale * (Math.log(u) - Math.log1p(-u));'],
    python:['t = math.exp(-abs((x - mu) / scale))\nreturn t / (scale * (1 + t) ** 2)','u = rng()\nwhile u == 0:\n    u = rng()\nreturn mu + scale * (math.log(u) - math.log1p(-u))'],
    c:['double t = exp(-fabs((x - mu) / scale));\nreturn t / (scale * (1 + t) * (1 + t));','double u;\ndo { u = rng(); } while (u == 0);\nreturn mu + scale * (log(u) - log1p(-u));'],
  },
  cauchy: {
    js:['const z = (x - center) / scale;\nreturn 1 / (Math.PI * scale * (1 + z * z));','let u;\ndo { u = rng(); } while (u === 0); // Quantile endpoints are infinite.\nreturn center + scale * Math.tan(Math.PI * (u - 0.5));'],
    python:['z = (x - center) / scale\nreturn 1 / (math.pi * scale * (1 + z * z))','u = rng()\nwhile u == 0:  # Quantile endpoints are infinite.\n    u = rng()\nreturn center + scale * math.tan(math.pi * (u - 0.5))'],
    c:['double z = (x - center) / scale;\nreturn 1 / (acos(-1.0) * scale * (1 + z * z));','double u;\ndo { u = rng(); } while (u == 0);\nreturn center + scale * tan(acos(-1.0) * (u - 0.5));'],
  },
  weibull: {
    js:['if (x < 0) return 0;\nif (x === 0) return shape < 1 ? Infinity : shape === 1 ? 1 / scale : 0;\nreturn (shape / scale) * (x / scale) ** (shape - 1) * Math.exp(-((x / scale) ** shape));','return scale * (-Math.log1p(-rng())) ** (1 / shape);'],
    python:['if x < 0:\n    return 0.0\nif x == 0:\n    return math.inf if shape < 1 else 1 / scale if shape == 1 else 0.0\nreturn (shape / scale) * (x / scale) ** (shape - 1) * math.exp(-(x / scale) ** shape)','return scale * (-math.log1p(-rng())) ** (1 / shape)'],
    c:['if (x < 0) return 0;\nif (x == 0) return shape < 1 ? INFINITY : shape == 1 ? 1 / scale : 0;\nreturn (shape / scale) * pow(x / scale, shape - 1) * exp(-pow(x / scale, shape));','return scale * pow(-log1p(-rng()), 1 / shape);'],
  },
  rayleigh: {
    js:['return x < 0 ? 0 : x / (sigma * sigma) * Math.exp(-x * x / (2 * sigma * sigma));','return sigma * Math.sqrt(-2 * Math.log1p(-rng()));'],
    python:['return 0.0 if x < 0 else x / (sigma * sigma) * math.exp(-x * x / (2 * sigma * sigma))','return sigma * math.sqrt(-2 * math.log1p(-rng()))'],
    c:['return x < 0 ? 0 : x / (sigma * sigma) * exp(-x * x / (2 * sigma * sigma));','return sigma * sqrt(-2 * log1p(-rng()));'],
  },
  pareto: {
    js:['return x < minimum ? 0 : alpha / minimum * (minimum / x) ** (alpha + 1);','return minimum / (1 - rng()) ** (1 / alpha);'],
    python:['return 0.0 if x < minimum else alpha / minimum * (minimum / x) ** (alpha + 1)','return minimum / (1 - rng()) ** (1 / alpha)'],
    c:['return x < minimum ? 0 : alpha / minimum * pow(minimum / x, alpha + 1);','return minimum / pow(1 - rng(), 1 / alpha);'],
  },
  triangular: {
    js:['if (x < a || x > b) return 0;\nreturn x <= c ? 2 * (x - a) / ((b - a) * (c - a)) : 2 * (b - x) / ((b - a) * (b - c));','const u = rng();\nreturn u < (c - a) / (b - a)\n  ? a + Math.sqrt(u * (b - a) * (c - a))\n  : b - Math.sqrt((1 - u) * (b - a) * (b - c));'],
    python:['if x < a or x > b:\n    return 0.0\nreturn 2 * (x - a) / ((b - a) * (c - a)) if x <= c else 2 * (b - x) / ((b - a) * (b - c))','u = rng()\nif u < (c - a) / (b - a):\n    return a + math.sqrt(u * (b - a) * (c - a))\nreturn b - math.sqrt((1 - u) * (b - a) * (b - c))'],
    c:['if (x < a || x > b) return 0;\nreturn x <= c ? 2 * (x - a) / ((b - a) * (c - a)) : 2 * (b - x) / ((b - a) * (b - c));','double u = rng();\nreturn u < (c - a) / (b - a)\n    ? a + sqrt(u * (b - a) * (c - a))\n    : b - sqrt((1 - u) * (b - a) * (b - c));'],
  },
};
