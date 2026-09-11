// Standard C99 only. Exact within the guarded uint64_t range.
// Supported indices: 0 through 1000.
// Compile: cc -std=c99 sequence.c -o sequence
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <inttypes.h>

bool nth_cubes(unsigned n, uint64_t *out) {
    if (out == NULL || n > 1000) return false;
    uint64_t k = n;
    *out = k * k * k;
    return true;
}
