import rethinkdb.query as r
from app.database import Connection, get_database
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/sensors")


@router.get("/")
async def get(conn: Connection = Depends(get_database)):
    return {"sensors": (await r.table("sensors").run(conn)).items}


@router.post("/")
async def post(sensor: dict, conn: Connection = Depends(get_database)):
    res = await r.table("sensors").insert(sensor).run(conn)

    return {
        "message": f"Sensor {sensor['name']} added with id {res['generated_keys'][0]}"
    }
