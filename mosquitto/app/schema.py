from typing import NamedTuple


class SensorReading(NamedTuple):
    node_id: str
    timestamp: int
    temperature: float
    humidity: float
    moisture: float
    water_level: float

    @staticmethod
    def from_text_message(message: dict):
        return SensorReading(
            message["sender"],
            message["timestamp"],
            *map(float, message["payload"]["text"].split("|"))
        )

class SensorTelemetry(NamedTuple):
    node_id: str
    timestamp: int
    battery_level: int
    voltage: float

    @staticmethod
    def from_telemetry_message(message: dict):
        return SensorTelemetry(
            message["sender"],
            message["timestamp"],
            message["payload"]["battery_level"],
            message["payload"]["voltage"]
        )