import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.worker import delineate_watershed_task
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("/")
async def get_regions(conn: Connection = Depends(get_database)):
    return {"regions": (await r.table("regions").run(conn)).items}


@router.post(
    "/",
    #  response_model=schema.region.RegionOut
)
async def create_region(
    region_in: schema.region.RegionIn, conn: Connection = Depends(get_database)
):
    res = (
        await r.table("regions")
        .insert(
            {
                "name": region_in.name,
                "bottom_left": r.point(*region_in.bottom_left),
                "top_right": r.point(*region_in.top_right),
            }
        )
        .run(conn, return_changes=True)
    )
    return schema.region.RegionOut(**res["changes"][0]["new_val"])

    # return region_out
