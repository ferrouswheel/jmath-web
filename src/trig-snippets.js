import { PI, MAX_ANGLE, sine, cosine, tangent, arcsine, arccosine, arctangent } from './trig-math.js';
export const trigLanguages={js:'JavaScript',python:'Python',c:'C'};
const functions={sin:sine,cos:cosine,tan:tangent,arcsin:arcsine,arccos:arccosine,arctan:arctangent};
const dependencies={sin:[sine],cos:[cosine],tan:[sine,cosine,tangent],arcsin:[arctangent,arcsine],arccos:[arctangent,arccosine],arctan:[arctangent]};
const python={
 sine:`def sine(x):
    if not math.isfinite(x) or abs(x) > MAX_ANGLE:
        raise ValueError("Angle outside supported range")
    x = math.fmod(x, 2 * PI)
    if x > PI: x -= 2 * PI
    if x < -PI: x += 2 * PI
    if x > PI / 2: x = PI - x
    if x < -PI / 2: x = -PI - x
    term = total = x
    for k in range(1, 17):
        term *= -x * x / ((2 * k) * (2 * k + 1))
        total += term
    return total`,
 cosine:`def cosine(x):
    if not math.isfinite(x) or abs(x) > MAX_ANGLE:
        raise ValueError("Angle outside supported range")
    x = math.fmod(x, 2 * PI)
    if x > PI: x -= 2 * PI
    if x < -PI: x += 2 * PI
    sign = 1
    if x > PI / 2: x, sign = PI - x, -1
    if x < -PI / 2: x, sign = -PI - x, -1
    term = total = 1.0
    for k in range(1, 17):
        term *= -x * x / ((2 * k - 1) * (2 * k))
        total += term
    return sign * total`,
 tangent:`def tangent(x):
    c = cosine(x)
    if abs(c) < 1e-12:
        raise ValueError("At or numerically too close to a tangent pole")
    return sine(x) / c`,
 arctangent:`def arctangent(x):
    if not math.isfinite(x):
        raise ValueError("Input must be finite")
    sign = -1 if x < 0 else 1
    x = abs(x)
    reciprocal = x > 1
    if reciprocal: x = 1 / x
    for _ in range(2): x /= 1 + math.sqrt(1 + x * x)
    term = total = x
    for k in range(1, 25):
        term *= -x * x
        total += term / (2 * k + 1)
    angle = 4 * total
    return sign * (PI / 2 - angle if reciprocal else angle)`,
 arcsine:`def arcsine(x):
    if not math.isfinite(x) or abs(x) > 1:
        raise ValueError("Arcsine requires -1 <= x <= 1")
    if abs(x) == 1: return x * PI / 2
    return arctangent(x / math.sqrt((1 - x) * (1 + x)))`,
 arccosine:`def arccosine(x):
    if not math.isfinite(x) or abs(x) > 1:
        raise ValueError("Arccosine requires -1 <= x <= 1")
    if x == -1: return PI
    return 2 * arctangent(math.sqrt((1 - x) / (1 + x)))`,
};
const c={
 sine:`double sine(double x) {
    if (!isfinite(x) || fabs(x) > MAX_ANGLE) return NAN;
    x = fmod(x, 2 * PI);
    if (x > PI) x -= 2 * PI;
    if (x < -PI) x += 2 * PI;
    if (x > PI / 2) x = PI - x;
    if (x < -PI / 2) x = -PI - x;
    double term = x, sum = x;
    for (int k = 1; k <= 16; k++) {
        term *= -x * x / ((2 * k) * (2 * k + 1));
        sum += term;
    }
    return sum;
}`,
 cosine:`double cosine(double x) {
    if (!isfinite(x) || fabs(x) > MAX_ANGLE) return NAN;
    x = fmod(x, 2 * PI);
    if (x > PI) x -= 2 * PI;
    if (x < -PI) x += 2 * PI;
    double sign = 1;
    if (x > PI / 2) { x = PI - x; sign = -1; }
    if (x < -PI / 2) { x = -PI - x; sign = -1; }
    double term = 1, sum = 1;
    for (int k = 1; k <= 16; k++) {
        term *= -x * x / ((2 * k - 1) * (2 * k));
        sum += term;
    }
    return sign * sum;
}`,
 tangent:`double tangent(double x) {
    double value = cosine(x);
    if (!isfinite(value) || fabs(value) < 1e-12) return NAN;
    return sine(x) / value;
}`,
 arctangent:`double arctangent(double x) {
    if (!isfinite(x)) return NAN;
    double sign = x < 0 ? -1 : 1;
    x = fabs(x);
    int reciprocal = x > 1;
    if (reciprocal) x = 1 / x;
    for (int k = 0; k < 2; k++) x /= 1 + sqrt(1 + x * x);
    double term = x, sum = x;
    for (int k = 1; k <= 24; k++) { term *= -x * x; sum += term / (2 * k + 1); }
    double angle = 4 * sum;
    return sign * (reciprocal ? PI / 2 - angle : angle);
}`,
 arcsine:`double arcsine(double x) {
    if (!isfinite(x) || fabs(x) > 1) return NAN;
    if (fabs(x) == 1) return x * PI / 2;
    return arctangent(x / sqrt((1 - x) * (1 + x)));
}`,
 arccosine:`double arccosine(double x) {
    if (!isfinite(x) || fabs(x) > 1) return NAN;
    if (x == -1) return PI;
    return 2 * arctangent(sqrt((1 - x) / (1 + x)));
}`,
};
export function trigSnippet(item,language,input,{example=true}={}){
 if(!functions[item.id]||!trigLanguages[language]||!Number.isFinite(input))throw new RangeError('Invalid snippet request');
 const names=dependencies[item.id].map(f=>f.name),name=functions[item.id].name;
 const note='Educational approximation; radians in/out. Direct angles limited to |x| <= 10000.\n';
 if(language==='js')return '// '+note+`const PI = ${PI};\nconst MAX_ANGLE = ${MAX_ANGLE};\n\n`+dependencies[item.id].map(f=>f.toString()).join('\n\n')+(example?`\n\nconsole.log(${name}(${input}));\n`:'');
 if(language==='python')return '# '+note+`import math  # sqrt, fmod, isfinite only; no trigonometric calls\nPI = ${PI}\nMAX_ANGLE = ${MAX_ANGLE}\n\n`+names.map(n=>python[n]).join('\n\n')+(example?`\n\nprint(${name}(${input}))\n`:'');
 return '// '+note+'// Invalid input returns NAN. Compile: cc -std=c99 trig.c -lm -o trig\n#include <math.h>\n#include <stdio.h>\n'+`#define PI ${PI}\n#define MAX_ANGLE ${MAX_ANGLE}\n\n`+names.map(n=>c[n]).join('\n\n')+(example?`\n\nint main(void) {\n    double result = ${name}(${input});\n    if (!isfinite(result)) return 1;\n    printf("%.17g\\n", result);\n    return 0;\n}\n`:'');
}
