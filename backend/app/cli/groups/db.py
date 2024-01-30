import rethinkdb.query as r
import typer
from app.database import _get_database
from rethinkdb.errors import ReqlOpFailedError

from ..utils import coro

app = typer.Typer(help="A collation of commands to manage the database.")
tables = [
    "users",
    "sensors",
    "sensor_readings",
    "sensor_telemetry",
]


@app.command()
@coro
async def create_tables():
    """Create all tables in the database"""

    conn = await _get_database()
    for table in tables:
        try:
            await r.table_create(table).run(conn)
            print(f"Created table {table}")
        except ReqlOpFailedError as e:
            if "already exists" not in e.message:
                raise e
            print(f"Table {table} already exists")
    await conn.close()


@app.command()
@coro
async def drop_tables():
    """Drop all tables in the database"""
    conn = await _get_database()
    for table in await r.table_list().run(conn):
        await r.table_drop(table).run(conn)
        print(f"Dropped table {table}")
    await conn.close()


@app.command()
@coro
async def populate_tables():
    """Populate all tables in the database"""
    conn = await _get_database()
    for table in await r.table_list().run(conn):
        await r.table(table).insert([{"name": "Batman"}, {"name": "Superman"}]).run(
            conn
        )
        print(f"Populated table {table}")
    await conn.close()
