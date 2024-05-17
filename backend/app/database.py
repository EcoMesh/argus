from datetime import timedelta
from typing import AsyncIterator

from app.settings import settings
from app.stubs import datetime as datetime_stub
from app.stubs.datetime import is_time_stubbed
from rethinkdb.asyncio_net.net_asyncio import Connection

from rethinkdb import RethinkDB
from rethinkdb import query as r

__all__ = ["get_database", "Connection", "_get_database_sync", "_get_database_async"]

rethinkdb = RethinkDB()
rethinkdb_async = RethinkDB()
rethinkdb_async.set_loop_type("asyncio")


def _get_database_sync():
    """Internal function to get a database session. Use get_database() instead."""
    return rethinkdb.connect(
        db=settings.rethinkdb_database,
        host=settings.rethinkdb_host,
        port=settings.rethinkdb_port,
    )


async def _get_database_async():
    """Internal function to get a database session. Use get_database() instead."""
    return await rethinkdb_async.connect(
        db=settings.rethinkdb_database,
        host=settings.rethinkdb_host,
        port=settings.rethinkdb_port,
    )

async def _get_db_connection_async():
    """Internal function to get RethinkDB connection. Use get_database() instead."""
    return await rethinkdb_async.connect(
        host=settings.rethinkdb_host,
        port=settings.rethinkdb_port,
    )


async def get_database() -> AsyncIterator[Connection]:
    """Get a database session to be used with FastAPI's Depends()"""
    async with await _get_database_async() as conn:
        yield conn


def r_now(sub: int = None):
    """
    Stubbed version of r.now() that uses the stubbed datetime if set.

    Args:
        sub (int, optional): The number of seconds to subtract from the current time. Defaults to None.
    """
    if is_time_stubbed():
        if sub:
            return datetime_stub.stubbed_datetime.now() - timedelta(seconds=sub)
        return datetime_stub.stubbed_datetime.now()

    if sub:
        return r.now().sub(sub)
    return r.now()
