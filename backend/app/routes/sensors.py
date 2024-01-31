import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/sensors")


@router.get("/")
async def get(conn: Connection = Depends(get_database)):
    return {"sensors": (await r.table("sensors").run(conn)).items}


@router.post("/", response_model=schema.sensor.SensorOut)
async def post(
    sensor_in: schema.sensor.SensorIn, conn: Connection = Depends(get_database)
):
    sensor_in_dict = sensor_in.model_dump()
    res = await r.table("sensors").insert(sensor_in_dict).run(conn)
    sensor_out = schema.sensor.SensorOut(id=res["generated_keys"][0], **sensor_in_dict)

    return sensor_out
