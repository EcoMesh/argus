import json
import logging

from app import exceptions
from app.database import save_reading, save_telemetry
from app.schema import SensorReading, SensorTelemetry

logger = logging.getLogger(__name__)


async def handle_text_message(_topic: str, message: str):
    message = json.loads(message)

    if message["type"] == "text":
        try:
            reading = SensorReading.from_text_message(message)
        except exceptions.InvalidMeshtasticPayload:
            logger.exception("Error parsing sensor reading.")
        else:
            await save_reading(message["id"], reading)

    elif message["type"] == "telemetry":
        try:
            reading = SensorTelemetry.from_telemetry_message(message)
        except exceptions.InvalidMeshtasticPayload:
            logger.exception("Error parsing telemetry message.")
        else:
            await save_telemetry(reading)
    else:  # pragma: no cover
        logger.warning("Unknown message type: %s", message["type"])


async def handle_protobuf_message(_topic: str, message: bytes):  # pragma: no cover
    raise NotImplementedError("Protobuf messages are not supported yet")
