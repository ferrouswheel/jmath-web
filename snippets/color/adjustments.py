# sRGB channels use 0..1. No external libraries.
def decode(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def encode(v):
    return 12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055

# Apply independently to encoded RGB bytes; preserve alpha.
# Use finite settings, gain/contrast >= 0 and gamma > 0.
# space must be "linear" or "srgb".
def adjust_byte(byte, *, gain, exposure, contrast, brightness, gamma, space):
    linear = space == "linear"
    pivot = 0.18 if linear else 0.5
    value = decode(byte / 255) if linear else byte / 255
    exposed = value * gain * 2 ** exposure
    contrasted = pivot + contrast * (exposed - pivot)
    shifted = contrasted + brightness
    shaped = max(0, min(1, shifted)) ** (1 / gamma)
    return int(255 * (encode(shaped) if linear else shaped) + 0.5)
