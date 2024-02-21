import pytz
from app.schema import SensorReading, SensorTelemetry
from app.settings import RETHINKDB_DB, RETHINKDB_HOST, RETHINKDB_PORT
from asyncache import cached
from cachetools import LRUCache, TTLCache

from rethinkdb import RethinkDB
from rethinkdb import query as r

rethinkdb = RethinkDB()
rethinkdb.set_loop_type("asyncio")

ONE_HOUR = 60 * 60
message_cache = TTLCache(maxsize=1024, ttl=ONE_HOUR)


async def get_database():
    return await rethinkdb.connect(RETHINKDB_HOST, RETHINKDB_PORT, RETHINKDB_DB)


@cached(LRUCache(maxsize=128), key=lambda conn, node_id: node_id)
async def get_sensor_timezone(conn, node_id: str):
    sensors = (
        await r.table("sensors").get_all(node_id, index="node_id").run(conn)
    )  # TODO: use id instead of node_id
    sensor = await sensors.next()
    region = await r.table("regions").get(sensor["region_id"]).run(conn)
    return pytz.timezone(region["timezone"])


async def save_reading(reading_id: int, reading: SensorReading):
    if reading_id in message_cache:
        return

    message_cache[reading_id] = (
        None  # band-aid until we determine message ids are always unique
    )

    async with await get_database() as conn:
        await r.table("sensor_readings").insert(
            {
                **reading._asdict(),
                "timestamp": reading.timestamp.astimezone(
                    await get_sensor_timezone(conn, reading.node_id)
                ),
            }
        ).run(conn)


async def save_telemetry(telemetry: SensorTelemetry):
    async with await get_database() as conn:
        await r.table("sensor_telemetry").insert(
            {
                **telemetry._asdict(),
                "timestamp": telemetry.timestamp.astimezone(
                    await get_sensor_timezone(conn, telemetry.node_id)
                ),
            }
        ).run(conn)
