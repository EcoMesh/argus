from typing import List

import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.worker import delineate_watershed_task
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/alarms", tags=["alarms"])


@router.get("/", response_model=List[schema.alarm.AlarmOut])
async def get_all_alarms(conn: Connection = Depends(get_database)):
    return (
        await r.table("alarms")
        .merge(
            lambda alarm: {
                "history": r.table("alarms_events")
                .get_all(alarm["id"], index="alarm_id")
                .merge(
                    lambda event: {
                        "records": r.table("alarms_event_records")
                        .get_all(event["id"], index="alarm_event_id")
                        .coerce_to("array")
                    }
                )
                .coerce_to("array")
            }
        )
        .run(conn)
    ).items


@router.post("/", response_model=schema.alarm.AlarmOut)
async def create_alarm(
    alarm: schema.alarm.AlarmIn, conn: Connection = Depends(get_database)
):
    alarm_dict = alarm.model_dump()
    print(alarm_dict)
    res = await r.table("alarms").insert(alarm_dict).run(conn, return_changes=True)

    return res["changes"][0]["new_val"]


@router.post("/{sensor_id}/init")
async def init_sensor(
    sensor_id: str,
    coordinates: schema.sensor.SensorCoordinates,
    conn: Connection = Depends(get_database),
):
    r_sensor = r.table("sensors").get(sensor_id)
    sensor = await r_sensor.run(conn)

    if sensor is None:
        raise HTTPException(status_code=404, detail="Sensor not found")

    if sensor.get("location") is not None:
        raise HTTPException(status_code=400, detail="Sensor already initialized")

    match await r_sensor.update(
        {"location": r.point(coordinates.lon, coordinates.lat)},
        return_changes=True,
    ).run(conn):
        case {"changes": [{"new_val": sensor}]}:
            pass
        case _:
            raise HTTPException(
                status_code=500, detail="Failed to update sensor coordinates"
            )

    region = await r.table("regions").get(sensor["region_id"]).run(conn)
    region["sensors"] = [sensor]

    delineate_watershed_task.delay([region])

    return {"status": "success"}
