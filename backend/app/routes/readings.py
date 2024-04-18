from datetime import datetime
from typing import Optional

import aiostream
import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.security import get_current_user
from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/readings",
    tags=["sensor readings"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=schema.sensor.SensorReadingsOut)
async def get_all_readings(
    since: Optional[str] = None,
    conn: Connection = Depends(get_database),
):
    if since:
        readings = await aiostream.stream.list(
            await r.table("sensor_readings")
            .order_by(index="timestamp")
            .filter(r.row["timestamp"] > datetime.fromisoformat(since))
            .run(conn)
        )
    else:
        readings = await aiostream.stream.list(
            await r.table("sensor_readings").order_by(index="timestamp").run(conn)
        )

    return schema.sensor.SensorReadingsOut(
        readings=readings,
        latest=readings[-1]["timestamp"] if readings else None,
    )
