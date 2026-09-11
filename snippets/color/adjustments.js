// sRGB channels use 0..1. No external libraries.
function decode(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function encode(v) {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
}

// Apply independently to encoded RGB bytes; preserve alpha.
// Use finite settings, gain/contrast >= 0 and gamma > 0.
// space must be "linear" or "srgb".
function adjustByte(byte, settings) {
  const { gain, exposure, contrast, brightness, gamma, space } = settings;
  const linear = space === "linear";
  const pivot = linear ? 0.18 : 0.5;
  const value = linear ? decode(byte / 255) : byte / 255;
  const exposed = value * gain * 2 ** exposure;
  const contrasted = pivot + contrast * (exposed - pivot);
  const shifted = contrasted + brightness;
  const shaped = Math.max(0, Math.min(1, shifted)) ** (1 / gamma);
  return Math.round(255 * (linear ? encode(shaped) : shaped));
}
