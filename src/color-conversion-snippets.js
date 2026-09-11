import { colorSpaces, conversionConstants, validateColor } from './color-math.js';
const ids=colorSpaces.map(s=>s.id);
const bounds=colorSpaces.map(s=>s.bounds);
const conventions=`Supported spaces: srgb, linear, hsl, hsv, xyz, lab, oklab.
sRGB: 0..255; linear sRGB: 0..1; HSL/HSV: degrees, %, %.
XYZ: D65 with Ywhite=1; Lab: D50; Oklab: D65.
Input bounds match the calculator. Extended RGB outputs are not clipped.
HSL/HSV output requires an in-gamut sRGB color (tolerance 2e-7).
Matrices: W3C CSS Color 4; Oklab: Bjorn Ottosson. No external libraries.`;
const jsBody=`
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
  const saturation = hsv ? (max === 0 ? 0 : delta / max)
    : (delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1)));
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
`;
const pythonBody=`
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
    if hsv: saturation = 0 if maximum == 0 else delta / maximum
    else: saturation = 0 if delta == 0 else delta / (1 - abs(2 * lightness - 1))
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
`;
const cBody=`
typedef enum { SRGB, LINEAR, HSL, HSV, XYZ, LAB, OKLAB, SPACE_COUNT } ColorSpace;
typedef enum { COLOR_OK, COLOR_INVALID, COLOR_OUT_OF_GAMUT } ColorStatus;

void multiply(const double matrix[3][3], const double vector[3], double out[3]) {
    double result[3] = {0, 0, 0};
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++) result[i] += matrix[i][j] * vector[j];
    for (int i = 0; i < 3; i++) out[i] = result[i];
}
double decode(double c) {
    double a = fabs(c);
    return a <= 0.04045 ? c / 12.92 : copysign(pow((a + 0.055) / 1.055, 2.4), c);
}
double encode(double v) {
    double a = fabs(v);
    return a <= 0.0031308 ? 12.92 * v : copysign(1.055 * pow(a, 1.0 / 2.4) - 0.055, v);
}
void cylinder_to_rgb(const double values[3], bool hsv, double out[3]) {
    double h = fmod(fmod(values[0], 360) + 360, 360);
    double s = values[1] / 100, t = values[2] / 100;
    double chroma = hsv ? t * s : (1 - fabs(2 * t - 1)) * s;
    double x = chroma * (1 - fabs(fmod(h / 60, 2) - 1));
    double offset = hsv ? t - chroma : t - chroma / 2;
    double sectors[6][3] = {{chroma,x,0}, {x,chroma,0}, {0,chroma,x}, {0,x,chroma}, {x,0,chroma}, {chroma,0,x}};
    for (int i = 0; i < 3; i++) out[i] = sectors[(int)(h / 60)][i] + offset;
}
void rgb_to_cylinder(const double rgb[3], bool hsv, double out[3]) {
    double maximum = fmax(rgb[0], fmax(rgb[1], rgb[2]));
    double minimum = fmin(rgb[0], fmin(rgb[1], rgb[2]));
    double delta = maximum - minimum, lightness = (maximum + minimum) / 2;
    double hue = 0, saturation;
    if (delta > 1e-12) {
        if (maximum == rgb[0]) hue = fmod((rgb[1] - rgb[2]) / delta, 6);
        else if (maximum == rgb[1]) hue = (rgb[2] - rgb[0]) / delta + 2;
        else hue = (rgb[0] - rgb[1]) / delta + 4;
        hue = fmod(hue * 60 + 360, 360);
    }
    if (hsv) saturation = maximum == 0 ? 0 : delta / maximum;
    else saturation = delta == 0 ? 0 : delta / (1 - fabs(2 * lightness - 1));
    out[0] = hue;
    out[1] = saturation * 100;
    out[2] = (hsv ? maximum : lightness) * 100;
}
void xyz_to_lab(const double xyz[3], double out[3]) {
    double f[3];
    multiply(TO_D50, xyz, f);
    for (int i = 0; i < 3; i++) {
        double t = f[i] / D50[i];
        f[i] = t > 216.0 / 24389 ? cbrt(t) : ((24389.0 / 27) * t + 16) / 116;
    }
    out[0] = 116 * f[1] - 16;
    out[1] = 500 * (f[0] - f[1]);
    out[2] = 200 * (f[1] - f[2]);
}
void lab_to_xyz(const double values[3], double out[3]) {
    double y = (values[0] + 16) / 116;
    double f[3] = {y + values[1] / 500, y, y - values[2] / 200};
    for (int i = 0; i < 3; i++) {
        double cube = f[i] * f[i] * f[i];
        f[i] = D50[i] * (cube > 216.0 / 24389 ? cube : (116 * f[i] - 16) / (24389.0 / 27));
    }
    multiply(TO_D65, f, out);
}
void to_linear(const double values[3], ColorSpace source, double out[3]) {
    double temp[3];
    switch (source) {
        case SRGB:
            for (int i = 0; i < 3; i++) out[i] = decode(values[i] / 255);
            break;
        case LINEAR:
            for (int i = 0; i < 3; i++) out[i] = values[i];
            break;
        case HSL: case HSV:
            cylinder_to_rgb(values, source == HSV, temp);
            for (int i = 0; i < 3; i++) out[i] = decode(temp[i]);
            break;
        case XYZ: multiply(XYZ_RGB, values, out); break;
        case LAB:
            lab_to_xyz(values, temp);
            multiply(XYZ_RGB, temp, out);
            break;
        case OKLAB:
            multiply(OK_TO_LMS, values, temp);
            for (int i = 0; i < 3; i++) temp[i] = temp[i] * temp[i] * temp[i];
            multiply(LMS_TO_RGB, temp, out);
            break;
        default: break; // The public function validates the enum.
    }
}
ColorStatus from_linear(const double rgb[3], ColorSpace target, double out[3]) {
    double temp[3];
    switch (target) {
        case SRGB:
            for (int i = 0; i < 3; i++) out[i] = 255 * encode(rgb[i]);
            break;
        case LINEAR:
            for (int i = 0; i < 3; i++) out[i] = rgb[i];
            break;
        case HSL: case HSV:
            for (int i = 0; i < 3; i++) {
                if (rgb[i] < -2e-7 || rgb[i] > 1 + 2e-7) return COLOR_OUT_OF_GAMUT;
                temp[i] = fmax(0, fmin(1, encode(rgb[i])));
            }
            rgb_to_cylinder(temp, target == HSV, out);
            break;
        case XYZ: multiply(RGB_XYZ, rgb, out); break;
        case LAB:
            multiply(RGB_XYZ, rgb, temp);
            xyz_to_lab(temp, out);
            break;
        case OKLAB:
            multiply(OK_LMS, rgb, temp);
            for (int i = 0; i < 3; i++) temp[i] = cbrt(temp[i]);
            multiply(LMS_OK, temp, out);
            break;
        default: return COLOR_INVALID;
    }
    return COLOR_OK;
}
// out is written only on success. values and out may point to the same array.
ColorStatus convert_color(const double values[3], ColorSpace source, ColorSpace target, double out[3]) {
    if (!values || !out || (unsigned)source >= SPACE_COUNT || (unsigned)target >= SPACE_COUNT)
        return COLOR_INVALID;
    for (int i = 0; i < 3; i++)
        if (!isfinite(values[i]) || values[i] < BOUNDS[source][i][0] || values[i] > BOUNDS[source][i][1])
            return COLOR_INVALID;
    double linear[3], result[3];
    to_linear(values, source, linear);
    ColorStatus status = from_linear(linear, target, result);
    if (status == COLOR_OK) for (int i = 0; i < 3; i++) out[i] = result[i];
    return status;
}
`;
function constants(language){
 const items=Object.entries(conversionConstants);
 if(language==='js')return items.map(([name,v])=>`const ${name} = ${JSON.stringify(v,null,2)};`).join('\n')+`\nconst BOUNDS = ${JSON.stringify(Object.fromEntries(ids.map((id,i)=>[id,bounds[i]])),null,2)};\n`;
 if(language==='python')return items.map(([name,v])=>`${name} = ${JSON.stringify(v)}`).join('\n')+`\nBOUNDS = ${JSON.stringify(Object.fromEntries(ids.map((id,i)=>[id,bounds[i]])),null,2)}\n`;
 const init=v=>Array.isArray(v)?`{${v.map(init).join(', ')}}`:String(v);
 return items.map(([name,v])=>`static const double ${name}${Array.isArray(v[0])?'[3][3]':'[3]'} = ${init(v)};`).join('\n')+`\nstatic const double BOUNDS[7][3][2] = ${init(bounds)};\n`;
}
export function conversionAlgorithm(language){
 if(!['js','python','c'].includes(language))throw new RangeError('Unknown language.');
 const comment=conventions.split('\n').map(line=>(language==='python'?'# ':'// ')+line).join('\n')+'\n';
 return comment+(language==='python'?'import math\n':language==='c'?'// Compile: cc -std=c99 color.c -lm -o color\n#include <math.h>\n#include <stdbool.h>\n#include <stdio.h>\n':'')+constants(language)+({js:jsBody,python:pythonBody,c:cBody})[language];
}
export function conversionExample(language,{source,target,values}){
 validateColor(source,values);if(!ids.includes(target))throw new RangeError('Unknown target space.');
 if(language==='js')return `const values = [${values.join(', ')}];\nconst source = "${source}";\nconst target = "${target}";\nconst result = convertColor(values, source, target);\nconsole.log(result === null ? "Outside the bounded HSL/HSV model" : result);\n`;
 if(language==='python')return `values = [${values.join(', ')}]\nsource = "${source}"\ntarget = "${target}"\nresult = convert_color(values, source, target)\nprint("Outside the bounded HSL/HSV model" if result is None else result)\n`;
 if(language==='c')return `int main(void) {\n    const double values[3] = {${values.join(', ')}};\n    const ColorSpace source = ${source.toUpperCase()};\n    const ColorSpace target = ${target.toUpperCase()};\n    double result[3];\n    ColorStatus status = convert_color(values, source, target, result);\n    if (status != COLOR_OK) {\n        fprintf(stderr, "%s\\n", status == COLOR_OUT_OF_GAMUT\n            ? "Outside the bounded HSL/HSV model" : "Invalid input");\n        return 1;\n    }\n    printf("%.12g, %.12g, %.12g\\n", result[0], result[1], result[2]);\n    return 0;\n}\n`;
 throw new RangeError('Unknown language.');
}
