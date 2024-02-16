from typing import Annotated, Literal

from pydantic import Field

from ..base import BaseSchema


class RollingWindow(BaseSchema):
    column: str
    timeframe: int


class GroundDistanceRule(BaseSchema):
    type: Literal["ground_distance"]
    resolution: int
    control_window: RollingWindow
    test_window: RollingWindow
    threshold: float


class TestRule(BaseSchema):
    type: Literal["test"]
    value: int


Rules = Annotated[GroundDistanceRule | TestRule, Field(discriminator="type")]
