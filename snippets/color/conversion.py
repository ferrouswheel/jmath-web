# Supported spaces: srgb, linear, hsl, hsv, xyz, lab, oklab.
# sRGB: 0..255; linear sRGB: 0..1; HSL/HSV: degrees, %, %.
# XYZ: D65 with Ywhite=1; Lab: D50; Oklab: D65.
# Input bounds match the calculator. Extended RGB outputs are not clipped.
# HSL/HSV output requires an in-gamut sRGB color (tolerance 2e-7).
# Matrices: W3C CSS Color 4; Oklab: Bjorn Ottosson. No external libraries.
import math
RGB_XYZ = [[0.4123907992659595,0.35758433938387796,0.1804807884018343],[0.21263900587151036,0.7151686787677559,0.07219231536073371],[0.01933081871559185,0.11919477979462599,0.9505321522496606]]
XYZ_RGB = [[3.2409699419045213,-1.5373831775700935,-0.4986107602930033],[-0.9692436362808798,1.8759675015077206,0.04155505740717561],[0.05563007969699361,-0.20397695888897657,1.0569715142428786]]
TO_D50 = [[1.0479297925449969,0.022946870601609652,-0.05019226628920524],[0.02962780877005599,0.9904344267538799,-0.017073799063418826],[-0.009243040646204504,0.015055191490298152,0.7518742814281371]]
TO_D65 = [[0.955473421488075,-0.02309845494876471,0.06325924320057072],[-0.0283697093338637,1.0099953980813041,0.021041441191917323],[0.012314014864481998,-0.020507649298898964,1.330365926242124]]
D50 = [0.9642956764295677,1,0.8251046025104602]
OK_LMS = [[0.4122214708,0.5363325363,0.0514459929],[0.2119034982,0.6806995451,0.1073969566],[0.0883024619,0.2817188376,0.6299787005]]
LMS_OK = [[0.2104542553,0.793617785,-0.0040720468],[1.9779984951,-2.428592205,0.4505937099],[0.0259040371,0.7827717662,-0.808675766]]
OK_TO_LMS = [[1,0.3963377774,0.2158037573],[1,-0.1055613458,-0.0638541728],[1,-0.0894841775,-1.291485548]]
LMS_TO_RGB = [[4.0767416621,-3.3077115913,0.2309699292],[-1.2684380046,2.6097574011,-0.3413193965],[-0.0041960863,-0.7034186147,1.707614701]]
BOUNDS = {
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
}

def multiply(matrix, vector):
    return [sum(a * b for a, b in zip(row, vector)) for row in matrix]

def decode(c):
    a = abs(c)
    return c / 12.92 if a <= 0.04045 else math.copysign(((a + 0.055) / 1.055) ** 2.4, c)

def encode(v):
    a = abs(v)
    return 12.92 * v if a <= 0.0031308 else math.copysign(1.055 * a ** (1 / 2.4) - 0.055, v)

def cylinder_to_rgb(values, hsv):
    h, s, t = values
    h, s, t = h % 360, s / 100, t / 100
    chroma = t * s if hsv else (1 - abs(2 * t - 1)) * s
    x = chroma * (1 - abs((h / 60) % 2 - 1))
    offset = t - chroma if hsv else t - chroma / 2
    sectors = [(chroma,x,0), (x,chroma,0), (0,chroma,x), (0,x,chroma), (x,0,chroma), (chroma,0,x)]
    return [v + offset for v in sectors[int(h / 60)]]

def rgb_to_cylinder(rgb, hsv):
    maximum, minimum = max(rgb), min(rgb)
    delta, lightness = maximum - minimum, (maximum + minimum) / 2
    hue = 0
    if delta > 1e-12:
        if maximum == rgb[0]: hue = ((rgb[1] - rgb[2]) / delta) % 6
        elif maximum == rgb[1]: hue = (rgb[2] - rgb[0]) / delta + 2
        else: hue = (rgb[0] - rgb[1]) / delta + 4
        hue = (hue * 60 + 360) % 360
    # Below the achromatic threshold, delta and its denominators shrink together;
    # their ratio is float noise, not a real saturation.
    if delta <= 1e-12: saturation = 0
    elif hsv: saturation = delta / maximum
    else: saturation = delta / (1 - abs(2 * lightness - 1))
    return [hue, saturation * 100, (maximum if hsv else lightness) * 100]

def cube_root(x):
    return math.copysign(abs(x) ** (1 / 3), x)

def xyz_to_lab(xyz):
    ratios = [v / w for v, w in zip(multiply(TO_D50, xyz), D50)]
    f = [cube_root(t) if t > 216 / 24389 else ((24389 / 27) * t + 16) / 116 for t in ratios]
    return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])]

def lab_to_xyz(values):
    l, a, b = values
    y = (l + 16) / 116
    f = [y + a / 500, y, y - b / 200]
    xyz = [w * (v ** 3 if v ** 3 > 216 / 24389 else (116 * v - 16) / (24389 / 27)) for v, w in zip(f, D50)]
    return multiply(TO_D65, xyz)

def to_linear(values, source):
    if source == 'srgb': return [decode(v / 255) for v in values]
    if source == 'linear': return list(values)
    if source in ('hsl', 'hsv'): return [decode(v) for v in cylinder_to_rgb(values, source == 'hsv')]
    if source == 'xyz': return multiply(XYZ_RGB, values)
    if source == 'lab': return multiply(XYZ_RGB, lab_to_xyz(values))
    if source == 'oklab': return multiply(LMS_TO_RGB, [v ** 3 for v in multiply(OK_TO_LMS, values)])

def from_linear(rgb, target):
    if target == 'srgb': return [255 * encode(v) for v in rgb]
    if target == 'linear': return list(rgb)
    if target in ('hsl', 'hsv'):
        if any(v < -2e-7 or v > 1 + 2e-7 for v in rgb): return None
        return rgb_to_cylinder([max(0, min(1, encode(v))) for v in rgb], target == 'hsv')
    if target == 'xyz': return multiply(RGB_XYZ, rgb)
    if target == 'lab': return xyz_to_lab(multiply(RGB_XYZ, rgb))
    if target == 'oklab': return multiply(LMS_OK, [cube_root(v) for v in multiply(OK_LMS, rgb)])

# None means the destination's bounded HSL/HSV model cannot represent the color.
# Invalid spaces or coordinates raise ValueError.
def convert_color(values, source, target):
    if source not in BOUNDS or target not in BOUNDS:
        raise ValueError('Unknown color space')
    if len(values) != 3 or any(not math.isfinite(v) or v < lo or v > hi for v, (lo, hi) in zip(values, BOUNDS[source])):
        raise ValueError('Input outside supported bounds')
    return from_linear(to_linear(values, source), target)
