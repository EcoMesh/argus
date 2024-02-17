from typing import Annotated, Literal

from pydantic import Field

from ..base import BaseSchema


class RollingWindow(BaseSchema):
    column: str
    timeframe: int


class RollingDeviationRule(BaseSchema):
    type: Literal["rolling_deviation"]
    control_window: RollingWindow
    test_window: RollingWindow
    threshold: float


class TestRule(BaseSchema):
    type: Literal["test"]
    value: int


Rules = Annotated[RollingDeviationRule | TestRule, Field(discriminator="type")]
