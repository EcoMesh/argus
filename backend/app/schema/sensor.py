from datetime import datetime
from typing import NamedTuple, Optional

from pydantic import BaseModel


class SensorCoordinates(BaseModel):
    lat: float
    lon: float


class SensorIn(BaseModel):
    node_id: str
    uplink: bool
    coordinates: Optional[SensorCoordinates]


class SensorOut(SensorIn):
    id: str
    ground_distance: Optional[float] = None


class Sensor(SensorIn):
    id: str
    ground_distance: Optional[float] = None


# remember to keep in sync with /backend/app/schema/sensor.py


class SensorReading(NamedTuple):
    node_id: str
    timestamp: datetime
    temperature: float
    humidity: float
    moisture: float
    ground_distance: float


class SensorTelemetry(NamedTuple):
    node_id: str
    timestamp: datetime
    battery_level: int
    voltage: float
