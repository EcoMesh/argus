from typing import List

import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.settings import settings
from app.utils.security import decode_jwt
from app.worker import delineate_watershed_task
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("/", response_model=List[schema.sensor.SensorOut])
async def get_all_sensors(conn: Connection = Depends(get_database)):
    return (await r.table("sensors").run(conn)).items


@router.post("/", response_model=schema.sensor.SensorOut)
async def create_sensor(
    sensor: schema.sensor.NewSensorIn, conn: Connection = Depends(get_database)
):
    res = (
        await r.table("sensors")
        .insert(sensor.model_dump())
        .run(conn, return_changes=True)
    )

    return res["changes"][0]["new_val"]


@router.post("/{jwt_sensor_identifier}/init", response_model=schema.sensor.SensorOut)
async def init_sensor(
    jwt_sensor_identifier: str,
    coordinates: schema.sensor.SensorCoordinates,
    conn: Connection = Depends(get_database),
):
    sensor_id = decode_jwt(jwt_sensor_identifier)["id"]
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

    return sensor


@router.delete("/{sensor_id}")
async def delete_sensor(sensor_id: str, conn: Connection = Depends(get_database)):
    res = await r.table("sensors").get(sensor_id).delete().run(conn)
    if res["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return {"status": "success"}


@router.get("/config/mqtt", response_model=schema.sensor.MqttConfig)
async def get_mqtt_config():
    return schema.sensor.MqttConfig(
        host=settings.mqtt_host,
        username=settings.mqtt_user,
        password=settings.mqtt_pass,
        use_tls=False,
        use_encryption=False,
    )
