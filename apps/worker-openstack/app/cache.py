import time
from functools import wraps
from threading import Lock

_store: dict = {}
_lock = Lock()

def ttl_cache(ttl: int = 30):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = fn.__name__
            with _lock:
                entry = _store.get(key)
                if entry and time.time() - entry['ts'] < ttl:
                    return entry['value']
            result = fn(*args, **kwargs)
            with _lock:
                _store[key] = {'value': result, 'ts': time.time()}
            return result
        return wrapper
    return decorator
