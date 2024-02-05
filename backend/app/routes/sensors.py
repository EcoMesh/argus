import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.worker import delineate_watershed_task
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("/")
async def get_sensor(conn: Connection = Depends(get_database)):
    return {"sensors": (await r.table("sensors").run(conn)).items}


@router.post("/", response_model=schema.sensor.SensorOut)
async def create_sensor(
    sensor_in: schema.sensor.SensorIn, conn: Connection = Depends(get_database)
):
    sensor_in_dict = sensor_in.model_dump()
    res = await r.table("sensors").insert(sensor_in_dict).run(conn)
    sensor_out = schema.sensor.SensorOut(id=res["generated_keys"][0], **sensor_in_dict)

    return sensor_out


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

    if sensor.get("coordinates") is not None:
        raise HTTPException(status_code=400, detail="Sensor already initialized")

    match await r_sensor.update(
        {"coordinates": r.point(coordinates.lon, coordinates.lat)},
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
