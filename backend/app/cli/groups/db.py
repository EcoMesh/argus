import rethinkdb.query as r
import typer
from app.database import _get_database
from rethinkdb.errors import ReqlOpFailedError

from ..utils import coro

app = typer.Typer(name="db", help="A collation of commands to manage the database.")
tables = [
    "users",
    "sensors",
    "alarms",
    "alarms_events",
    "alarms_event_records",
    "sensor_readings",
    "sensor_telemetry",
]


@app.command()
@coro
async def create_tables():
    """Create all tables in the database"""

    conn = await _get_database()
    conn.repl()
    for table in tables:
        try:
            await r.table_create(table).run(conn)
            print(f"Created table {table}")
        except ReqlOpFailedError as e:
            if "already exists" not in e.message:
                raise e
            print(f"Table {table} already exists")

    r.table("sensor_readings").index_create("node_id").run()
    r.table("sensor_telemetry").index_create("node_id").run()
    r.table("alarms_events").index_create("alarm_id").run()
    r.table("alarms_event_records").index_create("alarm_event_id").run()
    r.table("alarms_event_records").index_create("node_id").run()

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
    alarms = [
        {
            "id": "c5b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d4d",
            "name": "Test",
            "interaction_required": False,
            "condition": {
                "type": "and",
                "tests": [
                    {
                        "type": "rule",
                        "rule": {
                            "type": "ground_distance",
                            "resolution": 300,
                            "control_window": {
                                "column": "ground_distance",
                                "timeframe": 86400,
                            },
                            "test_window": {
                                "column": "ground_distance",
                                "timeframe": 3600,
                            },
                            "threshold": 0.09,
                        },
                    }
                ],
            },
            "subscribers": ["noahcardoza@gmail.com"],
        }
    ]
    alarm_events = [
        {
            "id": "c5b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d23",
            "alarm_id": "c5b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d4d",
            "start": 1614556800,
            "end": 1614643200,
        }
    ]
    alarm_event_records = [
        {
            "id": "c5b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d54",
            "alarm_event_id": "c5b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d23",
            "node_id": "test",
            "start": 1614556800,
            "end": 1614643200,
        }
    ]
    await r.table("alarms").insert(alarms).run(conn)
    await r.table("alarms_events").insert(alarm_events).run(conn)
    await r.table("alarms_event_records").insert(alarm_event_records).run(conn)
    await conn.close()
