import json

from app.database import save_reading, save_telemetry
from app.schema import SensorReading, SensorTelemetry


async def handle_text_message(_topic: str, message: str):
    message = json.loads(message)

    if message["type"] == "text":
        reading = SensorReading.from_text_message(message)
        await save_reading(reading)

    if message["type"] == "telemetry":
        reading = SensorTelemetry.from_telemetry_message(message)
        await save_telemetry(reading)


async def handle_protobuf_message(_topic: str, message: bytes):
    raise NotImplementedError("Protobuf messages are not supported yet")
