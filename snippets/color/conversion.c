// Supported spaces: srgb, linear, hsl, hsv, xyz, lab, oklab.
// sRGB: 0..255; linear sRGB: 0..1; HSL/HSV: degrees, %, %.
// XYZ: D65 with Ywhite=1; Lab: D50; Oklab: D65.
// Input bounds match the calculator. Extended RGB outputs are not clipped.
// HSL/HSV output requires an in-gamut sRGB color (tolerance 2e-7).
// Matrices: W3C CSS Color 4; Oklab: Bjorn Ottosson. No external libraries.
// Compile: cc -std=c99 color.c -lm -o color
#include <math.h>
#include <stdbool.h>
#include <stdio.h>
static const double RGB_XYZ[3][3] = {{0.4123907992659595, 0.35758433938387796, 0.1804807884018343}, {0.21263900587151036, 0.7151686787677559, 0.07219231536073371}, {0.01933081871559185, 0.11919477979462599, 0.9505321522496606}};
static const double XYZ_RGB[3][3] = {{3.2409699419045213, -1.5373831775700935, -0.4986107602930033}, {-0.9692436362808798, 1.8759675015077206, 0.04155505740717561}, {0.05563007969699361, -0.20397695888897657, 1.0569715142428786}};
static const double TO_D50[3][3] = {{1.0479297925449969, 0.022946870601609652, -0.05019226628920524}, {0.02962780877005599, 0.9904344267538799, -0.017073799063418826}, {-0.009243040646204504, 0.015055191490298152, 0.7518742814281371}};
static const double TO_D65[3][3] = {{0.955473421488075, -0.02309845494876471, 0.06325924320057072}, {-0.0283697093338637, 1.0099953980813041, 0.021041441191917323}, {0.012314014864481998, -0.020507649298898964, 1.330365926242124}};
static const double D50[3] = {0.9642956764295677, 1, 0.8251046025104602};
static const double OK_LMS[3][3] = {{0.4122214708, 0.5363325363, 0.0514459929}, {0.2119034982, 0.6806995451, 0.1073969566}, {0.0883024619, 0.2817188376, 0.6299787005}};
static const double LMS_OK[3][3] = {{0.2104542553, 0.793617785, -0.0040720468}, {1.9779984951, -2.428592205, 0.4505937099}, {0.0259040371, 0.7827717662, -0.808675766}};
static const double OK_TO_LMS[3][3] = {{1, 0.3963377774, 0.2158037573}, {1, -0.1055613458, -0.0638541728}, {1, -0.0894841775, -1.291485548}};
static const double LMS_TO_RGB[3][3] = {{4.0767416621, -3.3077115913, 0.2309699292}, {-1.2684380046, 2.6097574011, -0.3413193965}, {-0.0041960863, -0.7034186147, 1.707614701}};
static const double BOUNDS[7][3][2] = {{{0, 255}, {0, 255}, {0, 255}}, {{0, 1}, {0, 1}, {0, 1}}, {{0, 360}, {0, 100}, {0, 100}}, {{0, 360}, {0, 100}, {0, 100}}, {{0, 2}, {0, 2}, {0, 2}}, {{0, 100}, {-160, 160}, {-160, 160}}, {{0, 1}, {-0.5, 0.5}, {-0.5, 0.5}}};

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
    // Below the achromatic threshold, delta and its denominators shrink together;
    // their ratio is float noise, not a real saturation.
    if (delta <= 1e-12) saturation = 0;
    else if (hsv) saturation = delta / maximum;
    else saturation = delta / (1 - fabs(2 * lightness - 1));
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
