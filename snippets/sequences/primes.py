# Python integers are exact; no external libraries.
# Indexing: n starts at 1.
def nth_primes(n):
    if not isinstance(n, int) or isinstance(n, bool) or not 1 <= n <= 1000:
        raise ValueError("n must be an integer from 1 to 1000")
    found, candidate = 0, 2
    while True:
        prime, d = True, 2
        while d * d <= candidate:
            if candidate % d == 0:
                prime = False
                break
            d += 1
        if prime:
            found += 1
            if found == n:
                return candidate
        candidate += 1
