import logging
from typing import List

import aiohttp
import aiostream
import rethinkdb.query as r
from app import schema
from app.database import Connection, get_database
from app.security import get_current_user
from app.worker import delineate_watershed_task
from fastapi import APIRouter, Depends, HTTPException, Response

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/alarms", tags=["alarms"], dependencies=[Depends(get_current_user)]
)


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


@router.get("/notifications", response_model=List[schema.alarm.AlarmNotificationRecord])
async def get_all_notifications(conn: Connection = Depends(get_database)):
    return (
        await r.table("alarm_notification_history")
        .order_by(r.desc("timestamp"))
        .run(conn)
    )


@router.post(
    "/notifications/{notification_id}/send",
    response_model=schema.alarm.AlarmNotificationRecord,
)
async def send_notification(
    notification_id: str, conn: Connection = Depends(get_database)
):
    notification = (
        await r.table("alarm_notification_history").get(notification_id).run(conn)
    )

    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification["sent"]:
        raise HTTPException(status_code=400, detail="Notification already sent")

    if notification["type"] == "webhook":
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    notification["value"],
                    json=notification["payload"],
                )
        except Exception as e:
            logger.exception("Failed to send webhook notification")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Unsupported notification type")

    res = (
        await r.table("alarm_notification_history")
        .get(notification_id)
        .update({"sent": True, "awaiting_interaction": False})
        .run(conn, return_changes=True)
    )

    return res["changes"][0]["new_val"]


@router.post(
    "/notifications/{notification_id}/dismiss",
    response_model=schema.alarm.AlarmNotificationRecord,
)
async def dismiss_notification(
    notification_id: str, conn: Connection = Depends(get_database)
):
    notification = (
        await r.table("alarm_notification_history").get(notification_id).run(conn)
    )
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")

    res = (
        await r.table("alarm_notification_history")
        .get(notification_id)
        .update({"awaiting_interaction": False})
        .run(conn, return_changes=True)
    )

    return res["changes"][0]["new_val"]
