# Python integers are exact; no external libraries.
# Indexing: n starts at 0.
def nth_fibonacci(n):
    if not isinstance(n, int) or isinstance(n, bool) or not 0 <= n <= 1000:
        raise ValueError("n must be an integer from 0 to 1000")
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
