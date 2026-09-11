import type { AdjustmentKey, AdjustmentSettings } from './types.ts';
// sRGB/XYZ/Bradford constants follow W3C CSS Color 4; Oklab matrices
// follow Björn Ottosson's published definition. No external dependencies.
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export function decodeSRGB(x: number) {
  const a = Math.abs(x);
  return a <= 0.04045 ? x / 12.92 : Math.sign(x) * ((a + 0.055) / 1.055) ** 2.4;
}
export function encodeSRGB(x: number) {
  const a = Math.abs(x);
  return a <= 0.0031308
    ? 12.92 * x
    : Math.sign(x) * (1.055 * a ** (1 / 2.4) - 0.055);
}
const mul = (m: number[][], v: number[]) =>
  m.map((row) => row.reduce((s, a, i: number) => s + a * v[i], 0));
const RGB_XYZ = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
];
const XYZ_RGB = [
  [12831 / 3959, -329 / 214, -1974 / 3959],
  [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
  [705 / 12673, -2585 / 12673, 705 / 667],
];
const TO_D50 = [
  [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
  [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
  [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
];
const TO_D65 = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];
const D50 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
const LAB_E = 216 / 24389,
  LAB_K = 24389 / 27;
function xyzToLab(xyz: number[]) {
  const f = mul(TO_D50, xyz).map((v: number, i: number) => {
    const t = v / D50[i];
    return t > LAB_E ? Math.cbrt(t) : (LAB_K * t + 16) / 116;
  });
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}
function labToXyz([l, a, b]: number[]) {
  const y = (l + 16) / 116;
  return mul(
    TO_D65,
    [y + a / 500, y, y - b / 200].map(
      (f, i) => D50[i] * (f ** 3 > LAB_E ? f ** 3 : (116 * f - 16) / LAB_K),
    ),
  );
}
const OK_LMS = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];
const LMS_OK = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];
function linearToOklab(rgb: number[]) {
  return mul(LMS_OK, mul(OK_LMS, rgb).map(Math.cbrt));
}
function oklabToLinear([l, a, b]: number[]) {
  const v = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((x) => x ** 3);
  return mul(
    [
      [4.0767416621, -3.3077115913, 0.2309699292],
      [-1.2684380046, 2.6097574011, -0.3413193965],
      [-0.0041960863, -0.7034186147, 1.707614701],
    ],
    v,
  );
}
function rgbToCylinder(rgb: number[], hsv: boolean) {
  const max = Math.max(...rgb),
    min = Math.min(...rgb),
    d = max - min,
    l = (max + min) / 2;
  let h = 0;
  if (d > 1e-12) {
    const i = rgb.indexOf(max);
    h =
      60 *
      (i === 0
        ? ((rgb[1] - rgb[2]) / d) % 6
        : i === 1
          ? (rgb[2] - rgb[0]) / d + 2
          : (rgb[0] - rgb[1]) / d + 4);
    h = (h + 360) % 360;
  }
  return [
    h,
    100 *
      (hsv
        ? max === 0
          ? 0
          : d / max
        : d === 0
          ? 0
          : d / (1 - Math.abs(2 * l - 1))),
    100 * (hsv ? max : l),
  ];
}
function cylinderToRgb([h, s, t]: number[], hsv: boolean) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  t /= 100;
  const c = hsv ? t * s : (1 - Math.abs(2 * t - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = hsv ? t - c : t - c / 2;
  const v =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return v.map((a) => a + m);
}
export const colorSpaces = [
  {
    id: 'srgb',
    name: 'sRGB',
    channels: ['R (0–255)', 'G (0–255)', 'B (0–255)'],
    bounds: [
      [0, 255],
      [0, 255],
      [0, 255],
    ],
    description:
      'Encoded red, green and blue channels for web images. Values here use the 0–255 scale; fractional values are accepted.',
    formula:
      'Clinear = C/12.92 for C ≤ 0.04045; otherwise ((C + 0.055)/1.055)^2.4, with C on 0–1.',
  },
  {
    id: 'linear',
    name: 'Linear sRGB',
    channels: ['R (0–1)', 'G (0–1)', 'B (0–1)'],
    bounds: [
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    description:
      'The same primaries as sRGB, with channels proportional to light. Use this space for exposure and physical light mixing.',
    formula:
      'Decode sRGB before multiplying light values; encode the result for display.',
  },
  {
    id: 'hsl',
    name: 'HSL',
    channels: ['Hue (degrees)', 'Saturation (%)', 'Lightness (%)'],
    bounds: [
      [0, 360],
      [0, 100],
      [0, 100],
    ],
    description:
      'Hue, saturation and lightness derived from encoded sRGB. This lightness is not physical luminance or CIE lightness.',
    formula:
      'L = (max(R,G,B) + min(R,G,B))/2. Hue is set to 0 for neutral colors.',
  },
  {
    id: 'hsv',
    name: 'HSV',
    channels: ['Hue (degrees)', 'Saturation (%)', 'Value (%)'],
    bounds: [
      [0, 360],
      [0, 100],
      [0, 100],
    ],
    description:
      'Hue, saturation and value derived from encoded sRGB. Also called HSB. Value is the largest encoded channel.',
    formula:
      'V = max(R,G,B); S = (max − min)/max when max > 0. Neutral hue is reported as 0.',
  },
  {
    id: 'xyz',
    name: 'CIE XYZ · D65',
    channels: ['X (Ywhite = 1)', 'Y (Ywhite = 1)', 'Z (Ywhite = 1)'],
    bounds: [
      [0, 2],
      [0, 2],
      [0, 2],
    ],
    description:
      'Tristimulus coordinates with the D65 reference white and relative Y = 1 for white. Y is relative luminance.',
    formula:
      '[X,Y,Z]ᵀ = M [Rlinear,Glinear,Blinear]ᵀ. The numerical inputs allow 0–2 per channel.',
  },
  {
    id: 'lab',
    name: 'CIELAB · D50',
    channels: ['L* (0–100)', 'a* (green–red)', 'b* (blue–yellow)'],
    bounds: [
      [0, 100],
      [-160, 160],
      [-160, 160],
    ],
    description:
      'Lightness and opponent-color axes relative to D50. Conversion from sRGB includes Bradford adaptation from D65 to D50.',
    formula:
      'L* = 116f(Y/Yn) − 16; a* = 500[f(X/Xn) − f(Y/Yn)]; b* = 200[f(Y/Yn) − f(Z/Zn)].',
  },
  {
    id: 'oklab',
    name: 'Oklab',
    channels: ['L (0–1)', 'a (green–red)', 'b (blue–yellow)'],
    bounds: [
      [0, 1],
      [-0.5, 0.5],
      [-0.5, 0.5],
    ],
    description:
      'A perceptual space using D65, with lightness and two opponent-color axes. Useful for color interpolation and editing.',
    formula:
      'Linear sRGB → LMS matrix → component-wise cube roots → Oklab matrix.',
  },
];
export function validateColor(space: string, values: number[]) {
  const s = colorSpaces.find((s) => s.id === space);
  if (!s) throw new RangeError('Unknown color space.');
  if (
    values.length !== 3 ||
    values.some(
      (v: number, i: number) =>
        !Number.isFinite(v) || v < s.bounds[i][0] || v > s.bounds[i][1],
    )
  )
    throw new RangeError(
      'Enter three finite values within the displayed input ranges.',
    );
}
export function toLinear(space: string, values: number[]) {
  validateColor(space, values);
  switch (space) {
    case 'srgb':
      return values.map((v: number) => decodeSRGB(v / 255));
    case 'linear':
      return [...values];
    case 'hsl':
    case 'hsv':
      return cylinderToRgb(values, space === 'hsv').map(decodeSRGB);
    case 'xyz':
      return mul(XYZ_RGB, values);
    case 'lab':
      return mul(XYZ_RGB, labToXyz(values));
    case 'oklab':
      return oklabToLinear(values);
    default:
      throw new RangeError('Unknown color space.');
  }
}
export function fromLinear(space: string, rgb: number[]) {
  switch (space) {
    case 'srgb':
      return rgb.map((v: number) => 255 * encodeSRGB(v));
    case 'linear':
      return [...rgb];
    case 'hsl':
    case 'hsv': {
      if (!inGamut(rgb)) return null;
      return rgbToCylinder(
        rgb.map((v: number) => clamp01(encodeSRGB(v))),
        space === 'hsv',
      );
    }
    case 'xyz':
      return mul(RGB_XYZ, rgb);
    case 'lab':
      return xyzToLab(mul(RGB_XYZ, rgb));
    case 'oklab':
      return linearToOklab(rgb);
    default:
      throw new RangeError('Unknown color space.');
  }
}
export const inGamut = (rgb: number[]) =>
  rgb.every((v: number) => v >= -2e-7 && v <= 1 + 2e-7);
export function colorHex(rgb: number[]) {
  return (
    '#' +
    rgb
      .map((v: number) =>
        Math.round(clamp01(encodeSRGB(v)) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export function parseHex(text: string) {
  if (!/^#?[\da-f]{6}$/i.test(text))
    throw new RangeError('Use six hexadecimal digits, for example #3b82f6.');
  return text
    .replace('#', '')
    .match(/../g)!
    .map((v: string) => parseInt(v, 16));
}
export const adjustmentDefaults: AdjustmentSettings = {
  gain: 1,
  exposure: 0,
  contrast: 1,
  brightness: 0,
  gamma: 1,
  space: 'linear',
};
export const adjustmentControls: {
  id: AdjustmentKey;
  name: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { id: 'gain', name: 'Gain', min: 0, max: 4, step: 0.01 },
  { id: 'exposure', name: 'Exposure (stops)', min: -4, max: 4, step: 0.05 },
  { id: 'contrast', name: 'Contrast', min: 0, max: 3, step: 0.01 },
  {
    id: 'brightness',
    name: 'Brightness offset',
    min: -0.5,
    max: 0.5,
    step: 0.01,
  },
  { id: 'gamma', name: 'Power-curve gamma', min: 0.2, max: 3, step: 0.01 },
];
export function validateAdjustments(s: AdjustmentSettings) {
  if (!['linear', 'srgb'].includes(s.space))
    throw new RangeError('Unknown working space.');
  for (const p of adjustmentControls)
    if (!Number.isFinite(s[p.id]) || s[p.id] < p.min || s[p.id] > p.max)
      throw new RangeError(`${p.name} must be from ${p.min} to ${p.max}.`);
}
export function adjustmentLut(s: AdjustmentSettings) {
  validateAdjustments(s);
  const pivot = s.space === 'linear' ? 0.18 : 0.5,
    values = new Uint8ClampedArray(256),
    clipping = new Int8Array(256);
  for (let i = 0; i < 256; i++) {
    const v = s.space === 'linear' ? decodeSRGB(i / 255) : i / 255;
    const raw =
      pivot +
      s.contrast * (v * s.gain * 2 ** s.exposure - pivot) +
      s.brightness;
    clipping[i] = raw < 0 ? -1 : raw > 1 ? 1 : 0;
    const shaped = clamp01(raw) ** (1 / s.gamma);
    values[i] = Math.round(
      255 * clamp01(s.space === 'linear' ? encodeSRGB(shaped) : shaped),
    );
  }
  return { values, clipping };
}
const linearBytes = Array.from({ length: 256 }, (_, i) => decodeSRGB(i / 255));
export function adjustPixels(
  source: Uint8ClampedArray,
  settings: AdjustmentSettings,
) {
  if (source.length % 4 !== 0) throw new RangeError('Expected RGBA pixels.');
  const { values, clipping } = adjustmentLut(settings),
    data = new Uint8ClampedArray(source.length),
    histogram = new Uint32Array(64);
  let low = 0,
    high = 0,
    visible = 0;
  for (let i = 0; i < source.length; i += 4) {
    for (let c = 0; c < 3; c++) data[i + c] = values[source[i + c]];
    data[i + 3] = source[i + 3];
    if (!source[i + 3]) continue;
    visible++;
    if (
      clipping[source[i]] < 0 ||
      clipping[source[i + 1]] < 0 ||
      clipping[source[i + 2]] < 0
    )
      low++;
    if (
      clipping[source[i]] > 0 ||
      clipping[source[i + 1]] > 0 ||
      clipping[source[i + 2]] > 0
    )
      high++;
    const y =
      0.2126 * linearBytes[data[i]] +
      0.7152 * linearBytes[data[i + 1]] +
      0.0722 * linearBytes[data[i + 2]];
    histogram[Math.min(63, Math.floor(y * 64))]++;
  }
  return { data, histogram, low, high, visible };
}
export function colorAtPath(pathname: string) {
  const path = pathname.replace(/\/$/, '');
  return path === '/color-math'
    ? { page: 'hub' }
    : path === '/color-math/converter'
      ? { page: 'converter' }
      : path === '/color-math/image'
        ? { page: 'image' }
        : null;
}
// Shared numerical constants for the standalone conversion examples.
export const conversionConstants = {
  RGB_XYZ,
  XYZ_RGB,
  TO_D50,
  TO_D65,
  D50,
  OK_LMS,
  LMS_OK,
  OK_TO_LMS: [
    [1, 0.3963377774, 0.2158037573],
    [1, -0.1055613458, -0.0638541728],
    [1, -0.0894841775, -1.291485548],
  ],
  LMS_TO_RGB: [
    [4.0767416621, -3.3077115913, 0.2309699292],
    [-1.2684380046, 2.6097574011, -0.3413193965],
    [-0.0041960863, -0.7034186147, 1.707614701],
  ],
};
