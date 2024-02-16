from typing import List

import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.worker import delineate_watershed_task
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("/", response_model=List[schema.region.RegionOut])
async def get_regions(conn: Connection = Depends(get_database)):
    return (await r.table("regions").run(conn)).items


@router.post("/", response_model=schema.region.RegionOut)
async def create_region(
    region: schema.region.RegionIn, conn: Connection = Depends(get_database)
):
    res = (
        await r.table("regions")
        .insert(
            {
                "name": region.name,
                "bottom_left": r.point(*region.bottom_left),
                "top_right": r.point(*region.top_right),
            }
        )
        .run(conn, return_changes=True)
    )

    return res["changes"][0]["new_val"]
