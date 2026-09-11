// Standard C99 only. Exact within the guarded uint64_t range.
// Supported indices: 1 through 1000.
// Compile: cc -std=c99 sequence.c -o sequence
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <inttypes.h>

bool nth_primes(unsigned n, uint64_t *out) {
    if (out == NULL || n > 1000 || n < 1) return false;
    unsigned found = 0;
    for (uint64_t candidate = 2; ; candidate++) {
        bool prime = true;
        for (uint64_t d = 2; d <= candidate / d; d++) {
            if (candidate % d == 0) { prime = false; break; }
        }
        if (prime && ++found == n) { *out = candidate; break; }
    }
    return true;
}
