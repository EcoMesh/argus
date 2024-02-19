from datetime import datetime
from typing import Annotated, List, Literal, Optional

from pydantic import EmailStr, Field

from ..base import BaseSchema
from . import ast


class AlarmHistoryRecord(BaseSchema):
    node_id: str
    start: datetime
    end: Optional[datetime] = None


class AlarmHistory(BaseSchema):
    start: datetime
    end: Optional[datetime] = None
    records: List[AlarmHistoryRecord] = Field(default_factory=list)


class AlarmSubscriberEmail(BaseSchema):
    type: Literal["email"] = "email"
    value: EmailStr


class AlarmSubscriberWebhook(BaseSchema):
    type: Literal["webhook"] = "webhook"
    interaction_required: bool = False
    value: str


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
