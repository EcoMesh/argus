from typing import AsyncIterator

from app.settings import settings
from rethinkdb import r
from rethinkdb.asyncio_net.net_asyncio import Connection

__all__ = ["get_database", "Connection"]

r.set_loop_type("asyncio")


async def _get_database():
    """Internal function to get a database session. Use get_database() instead."""
    return await r.connect(
        db=settings.rethinkdb_database,
        host=settings.rethinkdb_host,
        port=settings.rethinkdb_port,
    )


async def get_database() -> AsyncIterator[Connection]:
    """Get a database session to be used with FastAPI's Depends()"""
    async with await _get_database() as conn:
        yield conn
