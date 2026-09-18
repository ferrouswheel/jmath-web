// Real spherical harmonics through band l = 3 in the y-up convention used on
// these pages. Direction inputs are unit vectors; the sixteen functions are
// orthonormal on the sphere. Compile: cc -std=c99 basis.c -o basis
#include <stdio.h>

void sh_basis(double x, double y, double z, double out[16]) {
    out[0]  = 0.282095;
    out[1]  = 0.488603 * y;     out[2]  = 0.488603 * z;
    out[3]  = 0.488603 * x;
    out[4]  = 1.092548 * x * y; out[5]  = 1.092548 * y * z;
    out[6]  = 0.315392 * (3 * z * z - 1);
    out[7]  = 1.092548 * x * z;
    out[8]  = 0.546274 * (x * x - y * y);
    out[9]  = 0.590044 * y * (3 * x * x - y * y);
    out[10] = 2.890611 * x * y * z;
    out[11] = 0.457046 * y * (5 * z * z - 1);
    out[12] = 0.373176 * z * (5 * z * z - 3);
    out[13] = 0.457046 * x * (5 * z * z - 1);
    out[14] = 1.445306 * z * (x * x - y * y);
    out[15] = 0.590044 * x * (x * x - 3 * y * y);
}

// Reconstruct an RGB signal at (x, y, z) from 16 x 3 coefficients, summing
// bands 0..l. Only clamp for display, never while accumulating.
void sh_signal(const double coefficients[16][3], double x, double y, double z,
               int l, double rgb[3]) {
    double b[16];
    sh_basis(x, y, z, b);
    for (int c = 0; c < 3; c++) rgb[c] = 0;
    for (int i = 0; i < (l + 1) * (l + 1); i++)
        for (int c = 0; c < 3; c++) rgb[c] += b[i] * coefficients[i][c];
}

int main(void) {
    static const double c[16][3] = {
        {0.9, 0.8, 0.75},
        {0, 0, 0}, {0, 0, 0.6}, {0, 0, 0},
    };
    double out[3];
    sh_signal(c, 0, 0, 1, 1, out);
    printf("[%.3f, %.3f, %.3f]\n", out[0], out[1], out[2]);
    sh_signal(c, 0, 0, -1, 1, out);
    printf("[%.3f, %.3f, %.3f]\n", out[0], out[1], out[2]);
    return 0;
}
