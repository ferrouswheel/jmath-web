// Supported spaces: srgb, linear, hsl, hsv, xyz, lab, oklab.
// sRGB: 0..255; linear sRGB: 0..1; HSL/HSV: degrees, %, %.
// XYZ: D65 with Ywhite=1; Lab: D50; Oklab: D65.
// Input bounds match the calculator. Extended RGB outputs are not clipped.
// HSL/HSV output requires an in-gamut sRGB color (tolerance 2e-7).
// Matrices: W3C CSS Color 4; Oklab: Bjorn Ottosson. No external libraries.
const RGB_XYZ = [
  [
    0.4123907992659595,
    0.35758433938387796,
    0.1804807884018343
  ],
  [
    0.21263900587151036,
    0.7151686787677559,
    0.07219231536073371
  ],
  [
    0.01933081871559185,
    0.11919477979462599,
    0.9505321522496606
  ]
];
const XYZ_RGB = [
  [
    3.2409699419045213,
    -1.5373831775700935,
    -0.4986107602930033
  ],
  [
    -0.9692436362808798,
    1.8759675015077206,
    0.04155505740717561
  ],
  [
    0.05563007969699361,
    -0.20397695888897657,
    1.0569715142428786
  ]
];
const TO_D50 = [
  [
    1.0479297925449969,
    0.022946870601609652,
    -0.05019226628920524
  ],
  [
    0.02962780877005599,
    0.9904344267538799,
    -0.017073799063418826
  ],
  [
    -0.009243040646204504,
    0.015055191490298152,
    0.7518742814281371
  ]
];
const TO_D65 = [
  [
    0.955473421488075,
    -0.02309845494876471,
    0.06325924320057072
  ],
  [
    -0.0283697093338637,
    1.0099953980813041,
    0.021041441191917323
  ],
  [
    0.012314014864481998,
    -0.020507649298898964,
    1.330365926242124
  ]
];
const D50 = [
  0.9642956764295677,
  1,
  0.8251046025104602
];
const OK_LMS = [
  [
    0.4122214708,
    0.5363325363,
    0.0514459929
  ],
  [
    0.2119034982,
    0.6806995451,
    0.1073969566
  ],
  [
    0.0883024619,
    0.2817188376,
    0.6299787005
  ]
];
const LMS_OK = [
  [
    0.2104542553,
    0.793617785,
    -0.0040720468
  ],
  [
    1.9779984951,
    -2.428592205,
    0.4505937099
  ],
  [
    0.0259040371,
    0.7827717662,
    -0.808675766
  ]
];
const OK_TO_LMS = [
  [
    1,
    0.3963377774,
    0.2158037573
  ],
  [
    1,
    -0.1055613458,
    -0.0638541728
  ],
  [
    1,
    -0.0894841775,
    -1.291485548
  ]
];
const LMS_TO_RGB = [
  [
    4.0767416621,
    -3.3077115913,
    0.2309699292
  ],
  [
    -1.2684380046,
    2.6097574011,
    -0.3413193965
  ],
  [
    -0.0041960863,
    -0.7034186147,
    1.707614701
  ]
];
const BOUNDS = {
  "srgb": [
    [
      0,
      255
    ],
    [
      0,
      255
    ],
    [
      0,
      255
    ]
  ],
  "linear": [
    [
      0,
      1
    ],
    [
      0,
      1
    ],
    [
      0,
      1
    ]
  ],
  "hsl": [
    [
      0,
      360
    ],
    [
      0,
      100
    ],
    [
      0,
      100
    ]
  ],
  "hsv": [
    [
      0,
      360
    ],
    [
      0,
      100
    ],
    [
      0,
      100
    ]
  ],
  "xyz": [
    [
      0,
      2
    ],
    [
      0,
      2
    ],
    [
      0,
      2
    ]
  ],
  "lab": [
    [
      0,
      100
    ],
    [
      -160,
      160
    ],
    [
      -160,
      160
    ]
  ],
  "oklab": [
    [
      0,
      1
    ],
    [
      -0.5,
      0.5
    ],
    [
      -0.5,
      0.5
    ]
  ]
};

function multiply(matrix, vector) {
  return matrix.map(row => row.reduce((sum, coefficient, i) => sum + coefficient * vector[i], 0));
}
function decode(c) {
  const a = Math.abs(c);
  return a <= 0.04045 ? c / 12.92 : Math.sign(c) * ((a + 0.055) / 1.055) ** 2.4;
}
function encode(v) {
  const a = Math.abs(v);
  return a <= 0.0031308 ? 12.92 * v : Math.sign(v) * (1.055 * a ** (1 / 2.4) - 0.055);
}
function cylinderToRgb([h, s, t], hsv) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  t /= 100;
  const chroma = hsv ? t * s : (1 - Math.abs(2 * t - 1)) * s;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const offset = hsv ? t - chroma : t - chroma / 2;
  const sectors = [[chroma,x,0], [x,chroma,0], [0,chroma,x], [0,x,chroma], [x,0,chroma], [chroma,0,x]];
  return sectors[Math.floor(h / 60)].map(v => v + offset);
}
function rgbToCylinder(rgb, hsv) {
  const max = Math.max(...rgb), min = Math.min(...rgb);
  const delta = max - min, lightness = (max + min) / 2;
  let hue = 0;
  if (delta > 1e-12) {
    if (max === rgb[0]) hue = ((rgb[1] - rgb[2]) / delta) % 6;
    else if (max === rgb[1]) hue = (rgb[2] - rgb[0]) / delta + 2;
    else hue = (rgb[0] - rgb[1]) / delta + 4;
    hue = (hue * 60 + 360) % 360;
  }
  // Below the achromatic threshold, delta and its denominators shrink together;
  // their ratio is float noise, not a real saturation.
  const saturation = delta <= 1e-12 ? 0
    : hsv ? delta / max : delta / (1 - Math.abs(2 * lightness - 1));
  return [hue, saturation * 100, (hsv ? max : lightness) * 100];
}
function xyzToLab(xyz) {
  const f = multiply(TO_D50, xyz).map((v, i) => {
    const t = v / D50[i];
    return t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
  });
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}
function labToXyz([l, a, b]) {
  const y = (l + 16) / 116;
  const xyz = [y + a / 500, y, y - b / 200].map((f, i) =>
    D50[i] * (f ** 3 > 216 / 24389 ? f ** 3 : (116 * f - 16) / (24389 / 27)));
  return multiply(TO_D65, xyz);
}
function toLinear(values, source) {
  switch (source) {
    case 'srgb': return values.map(v => decode(v / 255));
    case 'linear': return values.slice();
    case 'hsl': case 'hsv': return cylinderToRgb(values, source === 'hsv').map(decode);
    case 'xyz': return multiply(XYZ_RGB, values);
    case 'lab': return multiply(XYZ_RGB, labToXyz(values));
    case 'oklab': return multiply(LMS_TO_RGB, multiply(OK_TO_LMS, values).map(v => v ** 3));
  }
}
function fromLinear(rgb, target) {
  switch (target) {
    case 'srgb': return rgb.map(v => 255 * encode(v));
    case 'linear': return rgb.slice();
    case 'hsl': case 'hsv':
      if (rgb.some(v => v < -2e-7 || v > 1 + 2e-7)) return null;
      return rgbToCylinder(rgb.map(v => Math.max(0, Math.min(1, encode(v)))), target === 'hsv');
    case 'xyz': return multiply(RGB_XYZ, rgb);
    case 'lab': return xyzToLab(multiply(RGB_XYZ, rgb));
    case 'oklab': return multiply(LMS_OK, multiply(OK_LMS, rgb).map(Math.cbrt));
  }
}
// Returns null when the destination's bounded HSL/HSV model cannot represent the color.
// Throws for an unknown space, nonfinite input, or input outside the listed bounds.
function convertColor(values, source, target) {
  if (!Object.hasOwn(BOUNDS, source) || !Object.hasOwn(BOUNDS, target))
    throw new RangeError('Unknown color space');
  if (!Array.isArray(values) || values.length !== 3 || values.some((v, i) =>
    !Number.isFinite(v) || v < BOUNDS[source][i][0] || v > BOUNDS[source][i][1]))
    throw new RangeError('Input outside supported bounds');
  return fromLinear(toLinear(values, source), target);
}
