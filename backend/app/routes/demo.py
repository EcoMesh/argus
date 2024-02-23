from datetime import datetime

from app.stubs import datetime as datetime_stub
from app.worker import (
    ALARM_IDENTIFICATION_CRONJOB_TASK_SCHEDULE,
    upsert_alarm_identification_cronjob_task,
)
from fastapi import APIRouter, Response, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/demo", tags=["demo"])


class SetTimePayload(BaseModel):
    epoch: datetime = Field(
        default_factory=lambda: datetime_stub.epoch or datetime.now(),
        title="The time to set the clock to. Defaults to the current (stubbed) time.",
    )
    speed: int = Field(1, title="A multiplier for the speed of time. Defaults to 1.")


@router.post("/set_time", status_code=status.HTTP_201_CREATED)
async def set_time(payload: SetTimePayload):
    """Set the time in the database"""
    upsert_alarm_identification_cronjob_task(
        payload.epoch,
        payload.speed,
        ALARM_IDENTIFICATION_CRONJOB_TASK_SCHEDULE / payload.speed,
    )
    datetime_stub.set_stubbed_time(payload.epoch, payload.speed)

    return Response(status_code=status.HTTP_201_CREATED)


@router.post("/webhook")
async def demo_webhook(payload: dict):
    print("webhook", payload)
    return {"success": True}
