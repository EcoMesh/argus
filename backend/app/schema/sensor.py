from datetime import datetime
from typing import NamedTuple, Optional

from pydantic import BaseModel, Field

from .base import BaseSchema
from .geojson import GeoJsonPoint, GeoJsonPolygon


class SensorCoordinates(BaseModel):
    lat: float
    lon: float


class NewSensorIn(BaseSchema):
    node_id: str = Field(
        ..., description="The node id of the sensor", examples=["!833c2233"]
    )
    uplink: bool
    mac_address: Optional[str] = None  # TODO: make required
    region_id: str


class InitSensorIn(BaseSchema):
    id: str
    coordinates: SensorCoordinates


class SensorOut(NewSensorIn):
    id: str
    initialization_url: str
    location: Optional[GeoJsonPoint] = None
    watershed: Optional[GeoJsonPolygon] = None


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


class MqttConfig(BaseSchema):
    host: str
    username: str
    password: str
    use_tls: bool = False
    use_encryption: bool = False
