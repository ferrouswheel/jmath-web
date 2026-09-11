// Standard C99 only. Exact within the guarded uint64_t range.
// Supported indices: 0 through 93.
// Compile: cc -std=c99 sequence.c -o sequence
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <inttypes.h>

bool nth_fibonacci(unsigned n, uint64_t *out) {
    if (out == NULL || n > 93) return false;
    if (n == 0) { *out = 0; return true; }
    uint64_t a = 0, b = 1;
    for (unsigned i = 1; i < n; i++) {
        uint64_t next = a + b;
        a = b;
        b = next;
    }
    *out = b;
    return true;
}
