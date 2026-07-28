import time
from functools import wraps
from threading import Lock

_store: dict = {}
_lock = Lock()

def ttl_cache(ttl: int = 30):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # id(arg) distingue les connexions (donc les providers) entre elles :
            # deux appels avec le même provider partagent la même instance de conn
            key = (fn.__name__,) + tuple(id(a) for a in args) + tuple(sorted((k, id(v)) for k, v in kwargs.items()))
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


def invalidate(cached_fn):
    """Vide toutes les entrées en cache d'une fonction décorée par ttl_cache.
    À appeler après une action qui change les données qu'elle renvoie (ex:
    supprimer une VM doit invalider list_vms_service), sinon le résultat mis
    en cache continue d'être servi jusqu'à expiration du TTL."""
    prefix = cached_fn.__name__
    with _lock:
        for key in [k for k in _store if k[0] == prefix]:
            del _store[key]
