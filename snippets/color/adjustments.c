// Standard C99; compile: cc color.c -lm -o color
#include <math.h>
#include <stdbool.h>
#include <stdio.h>

double decode(double c) {
    return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4);
}
double encode(double v) {
    return v <= 0.0031308 ? 12.92 * v : 1.055 * pow(v, 1.0 / 2.4) - 0.055;
}

typedef struct {
    double gain;
    double exposure;
    double contrast;
    double brightness;
    double gamma;
    bool linear_light;
} AdjustmentSettings;

// Apply independently to encoded RGB bytes; preserve alpha.
// settings must be non-null with finite values,
// gain/contrast >= 0 and gamma > 0.
int adjust_byte(unsigned char byte, const AdjustmentSettings *settings) {
    double pivot = settings->linear_light ? 0.18 : 0.5;
    double value = settings->linear_light ? decode(byte / 255.0) : byte / 255.0;
    double exposed = value * settings->gain * pow(2.0, settings->exposure);
    double contrasted = pivot + settings->contrast * (exposed - pivot);
    double shifted = contrasted + settings->brightness;
    double shaped = pow(fmax(0.0, fmin(1.0, shifted)), 1.0 / settings->gamma);
    double encoded = settings->linear_light ? encode(shaped) : shaped;
    return (int)floor(255 * encoded + 0.5);
}
