from app.schema import SensorReading, SensorTelemetry
from app.settings import RETHINKDB_DB, RETHINKED_HOST, RETHINKED_PORT

from rethinkdb import RethinkDB
from rethinkdb import query as r

rethinkdb = RethinkDB()
rethinkdb.set_loop_type("asyncio")


async def get_database():
    return await rethinkdb.connect(RETHINKED_HOST, RETHINKED_PORT, RETHINKDB_DB)


async def save_reading(reading: SensorReading):
    async with await get_database() as conn:
        await r.table("sensor_readings").insert(reading._asdict()).run(conn)


async def save_telemetry(telemetry: SensorTelemetry):
    async with await get_database() as conn:
        await r.table("sensor_telemetry").insert(telemetry._asdict()).run(conn)
