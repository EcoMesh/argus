from typing import List

import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.worker import delineate_watershed_task
from fastapi import APIRouter, Depends, HTTPException, Response

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
    res = await r.table("alarms").insert(alarm_dict).run(conn, return_changes=True)
    return res["changes"][0]["new_val"]


@router.delete("/{alarm_id}")
async def delete_alarm(alarm_id: str, conn: Connection = Depends(get_database)):
    res = await r.table("alarms").get(alarm_id).delete().run(conn)

    if res["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Alarm not found")

    alarm_events = (
        await r.table("alarms_events")
        .get_all(alarm_id, index="alarm_id")
        .delete()
        .run(conn, return_changes=True)
    )

    alarm_event_ids = [
        event["old_val"]["id"] for event in alarm_events.get("changes", [])
    ]

    if alarm_event_ids:
        await (
            r.table("alarms_event_records")
            .get_all(r.args(alarm_event_ids), index="alarm_event_id")
            .delete()
            .run(conn)
        )

    return Response(status_code=204)


@router.put("/{alarm_id}", response_model=schema.alarm.AlarmOut)
async def update_alarm(
    alarm_id: str, alarm: schema.alarm.AlarmIn, conn: Connection = Depends(get_database)
):
    res = await r.table("alarms").get(alarm_id).update(alarm.model_dump()).run(conn)
    if res["replaced"] == 0:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return await r.table("alarms").get(alarm_id).run(conn)
