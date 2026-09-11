import { validateAdjustments } from './color-math.js';
export const colorLanguages={js:'JavaScript',python:'Python',c:'C'};
const transfer={
 js:`// sRGB channels use 0..1. No external libraries.
function decode(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function encode(v) {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
}
`,
 python:`# sRGB channels use 0..1. No external libraries.
def decode(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def encode(v):
    return 12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055
`,
 c:`// Standard C99; compile: cc color.c -lm -o color
#include <math.h>
#include <stdbool.h>
#include <stdio.h>

double decode(double c) {
    return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4);
}
double encode(double v) {
    return v <= 0.0031308 ? 12.92 * v : 1.055 * pow(v, 1.0 / 2.4) - 0.055;
}
`,
};
const adjustment={
 js:`
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
`,
 python:`
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
`,
 c:`
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
`,
};
export function colorAlgorithm(language,image=false){
 if(!colorLanguages[language])throw new RangeError('Unknown language.');
 return transfer[language]+(image?adjustment[language]:'');
}
export function colorExample(language,settings=null){
 if(!colorLanguages[language])throw new RangeError('Unknown language.');
 if(!settings){
  if(language==='js')return 'console.log(decode(0.5)); // About 0.214041\nconsole.log(encode(decode(0.5))); // 0.5\n';
  if(language==='python')return 'print(decode(0.5))  # About 0.214041\nprint(encode(decode(0.5)))  # 0.5\n';
  return 'int main(void) {\n    printf("%.12f\\n", decode(0.5));\n    printf("%.12f\\n", encode(decode(0.5)));\n    return 0;\n}\n';
 }
 validateAdjustments(settings);
 const {gain,exposure,contrast,brightness,gamma,space}=settings;
 if(language==='js')return `const settings = {
  gain: ${gain},
  exposure: ${exposure},
  contrast: ${contrast},
  brightness: ${brightness},
  gamma: ${gamma},
  space: "${space}",
};
console.log(adjustByte(128, settings));
`;
 if(language==='python')return `settings = {
    "gain": ${gain},
    "exposure": ${exposure},
    "contrast": ${contrast},
    "brightness": ${brightness},
    "gamma": ${gamma},
    "space": "${space}",
}
print(adjust_byte(128, **settings))
`;
 return `int main(void) {
    const AdjustmentSettings settings = {
        .gain = ${gain},
        .exposure = ${exposure},
        .contrast = ${contrast},
        .brightness = ${brightness},
        .gamma = ${gamma},
        .linear_light = ${space==='linear'?'true':'false'},
    };
    printf("%d\\n", adjust_byte(128, &settings));
    return 0;
}
`;
}
export function colorSnippet(language,settings=null){return colorAlgorithm(language,settings!==null)+'\n'+colorExample(language,settings);}
