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
