from typing import Annotated, Literal

from pydantic import BaseModel, Field


class RollingWindow(BaseModel):
    column: str
    timeframe: int


class GroundDistanceRule(BaseModel):
    type: Literal["ground_distance"]
    resolution: int
    control_window: RollingWindow
    test_window: RollingWindow
    threshold: float


class TestRule(BaseModel):
    type: Literal["test"]
    value: int


Rules = Annotated[GroundDistanceRule | TestRule, Field(discriminator="type")]
