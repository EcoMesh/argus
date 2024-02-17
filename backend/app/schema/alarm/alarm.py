from typing import Annotated, List, Literal, Optional

from pydantic import EmailStr, Field

from ..base import BaseSchema
from . import ast


class SensorAlarmHistory(BaseSchema):
    node_id: str
    start: int
    end: Optional[int] = None


class AlarmHistory(BaseSchema):
    start: int
    end: Optional[int] = None
    sensors: List[SensorAlarmHistory] = Field(default_factory=list)


class AlarmSubscriberEmail(BaseSchema):
    client_id: str
    type: Literal["email"] = "email"
    value: EmailStr


class AlarmSubscriberWebhook(BaseSchema):
    client_id: str
    type: Literal["webhook"] = "webhook"
    interaction_required: bool = False
    value: str


AlarmSubscriber = Annotated[
    AlarmSubscriberEmail | AlarmSubscriberWebhook, Field(discriminator="type")
]


class AlarmIn(BaseSchema):
    name: str
    condition: ast.Node
    subscribers: List[AlarmSubscriber] = Field(default_factory=list)


class AlarmOut(AlarmIn):
    id: str
    history: List[AlarmHistory] = Field(default_factory=list)
