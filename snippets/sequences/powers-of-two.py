# Python integers are exact; no external libraries.
# Indexing: n starts at 0.
def nth_powers_of_two(n):
    if not isinstance(n, int) or isinstance(n, bool) or not 0 <= n <= 1000:
        raise ValueError("n must be an integer from 0 to 1000")
    return 2 ** n
