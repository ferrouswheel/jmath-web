// Standard C99 only. Exact within the guarded uint64_t range.
// Supported indices: 0 through 63.
// Compile: cc -std=c99 sequence.c -o sequence
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <inttypes.h>

bool nth_powers_of_two(unsigned n, uint64_t *out) {
    if (out == NULL || n > 63) return false;
    *out = UINT64_C(1) << n;
    return true;
}
