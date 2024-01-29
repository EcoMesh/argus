import asyncio
from functools import update_wrapper


def coro(f):
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))

    return update_wrapper(wrapper, f)
