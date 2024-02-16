from datetime import datetime
from typing import NamedTuple, Optional

from pydantic import BaseModel

from .base import BaseSchema
from .geojson import GeoJsonPoint, GeoJsonPolygon


class SensorCoordinates(BaseModel):
    lat: float
    lon: float


class SensorIn(BaseSchema):
    node_id: str
    uplink: bool
    region_id: str
    coordinates: Optional[SensorCoordinates]


class SensorOut(BaseSchema):
    id: str
    node_id: str
    region_id: str
    uplink: bool
    location: Optional[GeoJsonPoint]
    watershed: Optional[GeoJsonPolygon]


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
