from typing import List, Optional

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


class Alarm(BaseSchema):
    id: str
    name: str
    condition: ast.Node
    interaction_required: bool = False  # to be used later when we have a UI
    subscribers: List[EmailStr] = Field(default_factory=list)


class AlarmOut(Alarm):
    history: List[AlarmHistory] = Field(default_factory=list)
