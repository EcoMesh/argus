from typing import List
from uuid import uuid4

import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.security import get_current_user
from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/regions", tags=["regions"], dependencies=[Depends(get_current_user)]
)


@router.get("/", response_model=List[schema.region.RegionOut])
async def get_regions(
    conn: Connection = Depends(get_database),
):
    return (await r.table("regions").run(conn)).items


@router.post("/", response_model=schema.region.RegionOut)
async def create_region(
    region: schema.region.RegionIn,
    conn: Connection = Depends(get_database),
):
    res = (
        await r.table("regions")
        .insert(
            {
                "name": region.name,
                "channel_psk": str(uuid4()),
                "bottom_left": r.point(*region.bottom_left),
                "top_right": r.point(*region.top_right),
            }
        )
        .run(conn, return_changes=True)
    )

    return res["changes"][0]["new_val"]
