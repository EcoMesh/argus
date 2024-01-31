from datetime import datetime
from typing import NamedTuple

# remember to keep in sync with /backend/app/schema/sensor.py


class SensorReading(NamedTuple):
    node_id: str
    timestamp: datetime
    temperature: float
    humidity: float
    moisture: float
    ground_distance: float

    @staticmethod
    def from_text_message(message: dict):
        return SensorReading(
            message["sender"],
            datetime.fromtimestamp(int(message["timestamp"])),
            *map(float, message["payload"]["text"].split("|"))
        )


class SensorTelemetry(NamedTuple):
    node_id: str
    timestamp: datetime
    battery_level: int
    voltage: float

    @staticmethod
    def from_telemetry_message(message: dict):
        return SensorTelemetry(
            message["sender"],
            datetime.fromtimestamp(int(message["timestamp"])),
            int(message["payload"]["battery_level"]),
            float(message["payload"]["voltage"]),
        )
