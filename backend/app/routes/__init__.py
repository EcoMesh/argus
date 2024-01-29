import rethinkdb.query as r
from app.database import Connection, get_database
from fastapi import Depends
from fastapi.routing import APIRouter

from . import sensors, users

router = APIRouter()

router.include_router(users.router)
router.include_router(sensors.router)

# @router.get("/")
# async def get(conn: Connection = Depends(get_database)):
#     print(list((await r.table("marvel").run(conn)).items))
#     return {"characters": (await r.table("marvel").run(conn)).items}


# @router.post("/{name}")
# async def post(name: str, conn: Connection = Depends(get_database)):
#     await r.table("marvel").insert({"name": name}).run(conn)
#     return {"message": f"Hello {name}"}
