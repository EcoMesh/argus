import rethinkdb.query as r
import typer
from app.database import _get_database_async, _get_database_sync
from app.schema.user import UserSignupIn
from app.security import hash_password

from ..utils import coro

app = typer.Typer(name="db", help="A collation of commands to manage the database.")


@app.command()
@coro
async def drop_tables():
    """Drop all tables in the database"""
    conn = await _get_database_async()
    for table in await r.table_list().run(conn):
        await r.table_drop(table).run(conn)
        print(f"Dropped table {table}")
    await conn.close()


@app.command()
@coro
async def populate_tables():
    """Populate all tables in the database"""
    conn = await _get_database_async()
    alarms = [
        {
            "id": "c5b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d4d",
            "name": "Test",
            "condition": {
                "type": "and",
                "tests": [
                    {
                        "type": "rule",
                        "rule": {
                            "type": "rolling_deviation",
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
            "subscribers": [
                {"type": "email", "value": "noahcardoza@gmail.com"},
                {
                    "type": "webhook",
                    "interaction_required": True,
                    "value": "http://localhost:7000/alarms/triggered",
                },
            ],
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
    await r.table("regions").insert(
        {
            "id": "57b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d54",
            "name": "Courand Family Ranch",
            "bottom_left": r.point(
                -103.31498383879455,
                30.275977600526915,
            ),
            "top_right": r.point(-103.1300, 30.487701),
        }
    ).run(conn)
    await r.table("sensors").insert(
        {
            "id": "4df86a94-dac5-499e-95b1-9ee7b8f65963",
            "node_id": "!833c2233",
            "uplink": False,
            "region_id": "57b2b4c2-6d5a-4c4e-8d3b-5b4f4f4b4d54",
        }
    ).run(conn)
    await conn.close()


@app.command()
def drop_sensor_readings():
    with _get_database_sync() as conn:
        r.table("sensor_readings").delete().run(conn)


@app.command()
def create_user(name: str, email: str, password: str):
    with _get_database_sync() as conn:
        r.table("users").insert(
            UserSignupIn(
                name=name, email=email, password=hash_password(password)
            ).model_dump()
        ).run(conn)
    print(f'User "{name}" created')
