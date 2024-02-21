from typing import List

import aiostream
import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/readings", tags=["sensor readings"])


@router.get("/", response_model=List[schema.sensor.SensorReadingOut])
async def get_all_readings(conn: Connection = Depends(get_database)):
    return await aiostream.stream.list(
        await r.table("sensor_readings").order_by(index="timestamp").run(conn)
    )
