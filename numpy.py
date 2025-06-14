import random as _stdlib_random
import math

class _Random:
    def normal(self, loc=0.0, scale=1.0):
        return _stdlib_random.gauss(loc, scale)
    def seed(self, seed=None):
        _stdlib_random.seed(seed)

random = _Random()

def array(data):
    return [list(row) for row in data]

def percentile(a, q, axis=None):
    if axis != 0:
        raise NotImplementedError("Only axis=0 supported")
    if not a:
        return []
    ncols = len(a[0])
    result = []
    for col in range(ncols):
        column = sorted(row[col] for row in a)
        k = (len(column) - 1) * q / 100.0
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            val = column[int(k)]
        else:
            val = column[int(f)] * (c - k) + column[int(c)] * (k - f)
        result.append(val)
    return result
