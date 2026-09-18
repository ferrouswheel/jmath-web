# Real spherical harmonics through band l = 3 in the y-up convention used on
# these pages. Direction inputs are unit vectors; the sixteen functions are
# orthonormal on the sphere: integrating the product of any two of them gives
# 1 for the same function and 0 for different ones.

def basis(x, y, z):
    return [
        0.282095,
        0.488603 * y, 0.488603 * z, 0.488603 * x,
        1.092548 * x * y, 1.092548 * y * z,
        0.315392 * (3 * z * z - 1), 1.092548 * x * z,
        0.546274 * (x * x - y * y),
        0.590044 * y * (3 * x * x - y * y),
        2.890611 * x * y * z, 0.457046 * y * (5 * z * z - 1),
        0.373176 * z * (5 * z * z - 3), 0.457046 * x * (5 * z * z - 1),
        1.445306 * z * (x * x - y * y), 0.590044 * x * (x * x - 3 * y * y),
    ]


# Reconstruct an RGB signal at direction (x, y, z) from 16 x 3 coefficients.
# Bands 0..l are summed; each coefficient stores one RGB triple. Only clamp
# for display, never while accumulating.
def signal(coefficients, x, y, z, l=3):
    b = basis(x, y, z)
    rgb = [0.0, 0.0, 0.0]
    for i in range((l + 1) * (l + 1)):
        for c in range(3):
            rgb[c] += b[i] * coefficients[i][c]
    return rgb


# Hand-set coefficients: a warm average plus a blue +z lobe (SH0 + SH1).
c = [
    [0.9, 0.8, 0.75],                    # Y00: base colour
    [0, 0, 0], [0, 0, 0.6], [0, 0, 0],   # Y1-1 (y), Y10 (z), Y11 (x)
]
print(signal(c, 0, 0, 1, 1))   # [0.254, 0.226, 0.505] — brightest toward +z
print(signal(c, 0, 0, -1, 1))  # [0.254, 0.226, -0.082] — signed; clamps to black
