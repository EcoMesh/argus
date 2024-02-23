from datetime import datetime
from typing import Annotated, List, Literal, Optional

from pydantic import EmailStr, Field

from ..base import BaseSchema
from . import ast


class AlarmHistoryRecord(BaseSchema):
    id: str
    alarm_event_id: str
    node_id: str
    start: datetime
    end: Optional[datetime] = None


class AlarmHistory(BaseSchema):
    id: str
    alarm_id: str
    start: datetime
    end: Optional[datetime] = None
    records: List[AlarmHistoryRecord] = Field(default_factory=list)


class NotificationOptions(BaseSchema):
    event_start: bool = Field(
        ..., description="Send a notification when the alarm state begins"
    )
    event_end: bool = Field(
        ..., description="Send a notification when the alarm state ends"
    )
    sensor_state_change: bool = Field(
        ..., description="Send a notification when the state of a sensor changes"
    )


class AlarmSubscriberEmail(BaseSchema):
    type: Literal["email"] = "email"
    value: EmailStr = Field(
        ..., description="The email address to send notifications to"
    )
    notify_on: NotificationOptions


class AlarmSubscriberWebhook(BaseSchema):
    type: Literal["webhook"] = "webhook"
    interaction_required: bool = Field(
        False,
        description="Whether the webhook requires user interaction before being sent",
    )
    value: str = Field(
        ...,
        description="The URL to send a POST request to when an alarm event occurs",
    )
    notify_on: NotificationOptions


AlarmSubscriber = Annotated[
    AlarmSubscriberEmail | AlarmSubscriberWebhook, Field(discriminator="type")
]


class AlarmIn(BaseSchema):
    name: str
    region_id: str
    condition: ast.Node
    subscribers: List[AlarmSubscriber] = Field(default_factory=list)


class AlarmOut(AlarmIn):
    id: str
    history: List[AlarmHistory] = Field(default_factory=list)


class AlarmNotificationEmailRecord(BaseSchema):
    id: str
    type: Literal["email"] = "email"
    alarm_id: str
    reason: Literal["event_start", "event_end", "sensor_state_change"]
    value: EmailStr
    timestamp: datetime


class AlarmNotificationWebhookRecord(BaseSchema):
    id: str
    type: Literal["webhook"] = "webhook"
    alarm_id: str
    reason: Literal["event_start", "event_end", "sensor_state_change"]
    value: str
    timestamp: datetime
    sent: bool
    awaiting_interaction: bool
    payload: dict


AlarmNotificationRecord = Annotated[
    AlarmNotificationEmailRecord | AlarmNotificationWebhookRecord,
    Field(discriminator="type"),
]
