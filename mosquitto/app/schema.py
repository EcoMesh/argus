from datetime import datetime
from typing import NamedTuple

from app.exceptions import InvalidMeshtasticPayload

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
        if "text" not in message["payload"]:
            raise InvalidMeshtasticPayload("No text property in Meshtastic payload.")

        payload_parts = message["payload"]["text"].split("|")

        if len(payload_parts) != 4:
            raise InvalidMeshtasticPayload("Expected 4 parts in Meshtastic payload.")

        try:
            return SensorReading(
                "!" + hex(message["from"])[2:],
                datetime.fromtimestamp(int(message["timestamp"])),
                *map(float, payload_parts)
            )
        except ValueError as e:
            raise InvalidMeshtasticPayload(
                "Error parsing Meshtastic message. Message part was not float."
            ) from e


class SensorTelemetry(NamedTuple):
    node_id: str
    timestamp: datetime
    battery_level: int
    voltage: float

    @staticmethod
    def from_telemetry_message(message: dict):
        try:
            return SensorTelemetry(
                message["sender"],
                datetime.fromtimestamp(int(message["timestamp"])),
                int(message["payload"]["battery_level"]),
                float(message["payload"]["voltage"]),
            )
        except Exception as e:
            raise InvalidMeshtasticPayload(
                "Error parsing Meshtastic telemetry message."
            ) from e
